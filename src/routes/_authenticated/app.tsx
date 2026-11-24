import {
  createFileRoute,
  isRedirect,
  Link,
  Outlet,
  redirect,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { doc, getDoc } from "firebase/firestore";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUp,
  ChevronRight,
  Home,
  Keyboard,
  LayoutGrid,
  Pause,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  Square,
  UserCheck,
  Volume2,
} from "lucide-react";
import { Suspense, lazy, useEffect, useState } from "react";
import { UpgradeAccountDialog } from "@/components/auth/UpgradeAccountDialog";
import { AccountPrefsSync } from "@/components/app/AccountPrefsSync";
import { MilestoneCelebrationWatcher } from "@/components/growth/MilestoneCelebrationWatcher";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { Logo } from "@/components/app/Logo";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import { MobileNav } from "@/components/nav/MobileNav";
import {
  ModernFloatingDock,
  ModernMobileNav,
  ModernNavHeader,
} from "@/components/nav/ModernNavigation";
import { NotificationCenter } from "@/components/nav/NotificationCenter";
import { Sidebar } from "@/components/nav/Sidebar";
import { UserMenu } from "@/components/nav/UserMenu";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { KeyboardShortcutManagerDialog } from "@/components/common/KeyboardShortcutManagerDialog";
import { useProfile, useUser } from "@/hooks/use-nexora";
import { useRbac } from "@/hooks/use-rbac";
import { ensureFirebaseUserBootstrap, getCachedBootstrappedProfile } from "@/lib/auth-bootstrap";
import { db } from "@/lib/firebase";
import { isUserEligibleForApp } from "@/lib/firebase-auth";
import type { ProfileRow } from "@/lib/firestore-data";
import { usePrefs } from "@/lib/preferences";
import { AppFooter } from "@/components/app/AppFooter";
import {
  ALL_NAV_ITEMS,
  EXTENDED_NAV_GROUPS,
  NAV_ADMIN,
  NAV_FOOTER,
  NAV_GROUPS,
  NAV_UTILITIES,
  PRIMARY_TOP_NAV_IDS,
  resolveRouteMeta,
} from "@/config/navigation";
import { NavItemLink } from "@/components/nav/NavItemLink";
import {
  CommandOsSidebar,
  CommandOsTopBar,
  EditorialMasthead,
  FocusDeckCornerRail,
  FocusDeckTopRibbon,
  SpatialFloatingDock,
} from "@/components/nav/UxShellChrome";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { PWAInstallButton } from "@/components/pwa/PWAInstallButton";
import { QuranMiniPlayer } from "@/components/islamic/QuranMiniPlayer";
import { QuranAudioProvider } from "@/contexts/QuranAudioContext";
import { usePWA } from "@/lib/pwa";
import { getLayoutModeById } from "@/lib/theme-catalog";
import { extractReadablePageText } from "@/lib/speech-service";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    if (
      context.needsVerification ||
      !isUserEligibleForApp(context.user, context.signInProvider) ||
      context.user?.isAnonymous
    ) {
      return { bootstrapError: false };
    }
    try {
      const cached = getCachedBootstrappedProfile(context.user.uid);
      if (cached) {
        if (!cached.onboarded) {
          throw redirect({ to: "/onboarding" });
        }
        return { bootstrapError: false };
      }

      const profileRef = doc(db, "profiles", context.user.uid);
      let snap = await getDoc(profileRef);
      if (!snap.exists()) {
        const bootstrapped = await ensureFirebaseUserBootstrap(context.user);
        if (bootstrapped) {
          if (!bootstrapped.onboarded) {
            throw redirect({ to: "/onboarding" });
          }
          return { bootstrapError: false };
        }
        snap = await getDoc(profileRef);
      }
      const data = snap.exists() ? (snap.data() as ProfileRow) : null;
      if (!data?.onboarded) {
        throw redirect({ to: "/onboarding" });
      }
      return { bootstrapError: false };
    } catch (err) {
      if (
        isRedirect(err) ||
        err instanceof Response ||
        (err && typeof err === "object" && "to" in err)
      ) {
        throw err;
      }
      console.warn("[AppRoute] Deferred profile check after Firestore read failure:", err);
      // Do not block authenticated session with a persistent red banner on transient reads
      return { bootstrapError: false };
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <QuranAudioProvider>
      <AppLayoutInner />
    </QuranAudioProvider>
  );
}

function AllModulesMenu({ side = "bottom" }: { side?: "top" | "bottom" }) {
  const { t, lang } = usePrefs();
  const rbac = useRbac();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid="all-modules-menu-btn"
          aria-expanded={open}
          className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary whitespace-nowrap"
        >
          <LayoutGrid className="size-3.5 text-primary" />
          <span>{lang === "ar" ? "كل الوحدات" : "All Modules"}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align="end"
        data-testid="all-modules-popover"
        className="w-[min(92vw,34rem)] p-4"
      >
        <div className="mb-3 flex items-center justify-between border-b border-border/70 pb-2">
          <p className="text-xs font-bold text-foreground">
            {lang === "ar" ? "جميع وحدات المنصة والأدوات" : "All Platform Modules & Utilities"}
          </p>
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
            {ALL_NAV_ITEMS.length} {lang === "ar" ? "وحدة" : "modules"}
          </span>
        </div>
        <div className="grid max-h-[65dvh] gap-3 overflow-y-auto sm:grid-cols-2">
          {[...NAV_GROUPS, ...EXTENDED_NAV_GROUPS].map((group) => {
            if (!group || !Array.isArray(group.items)) return null;
            const items = group.items.filter((item) =>
              Boolean(item && item.id && item.to && item.icon),
            );
            if (items.length === 0) return null;
            return (
              <div key={group.id} className="space-y-1">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t(group.label)}
                </p>
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={`menu-${item.id}`}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="flex min-h-[38px] items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium leading-snug text-foreground transition-colors hover:bg-surface-2 hover:text-primary data-[status=active]:bg-primary/15 data-[status=active]:text-primary"
                    >
                      <Icon className="size-3.5 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 break-words">{t(item.label)}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/70 pt-3">
          {[...NAV_FOOTER, ...NAV_UTILITIES]
            .filter((item) => Boolean(item && item.id && item.to && item.icon))
            .map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={`menu-util-${item.id}`}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="size-3.5 text-primary" />
                  <span>{t(item.label)}</span>
                </Link>
              );
            })}
          {rbac.isStaff && (
            <Link
              to={NAV_ADMIN.to}
              onClick={() => setOpen(false)}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
            >
              <NAV_ADMIN.icon className="size-3.5" />
              <span>{t(NAV_ADMIN.label)}</span>
            </Link>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AppLayoutInner() {
  const { bootstrapError } = Route.useRouteContext();
  const router = useRouter();
  const { data: user } = useUser();
  const { data: profile } = useProfile();
  const {
    t,
    lang,
    effectiveAppearance,
    effectiveLayout,
    effectiveLayoutMode,
    effectiveUiExperience,
    effectiveBtcNavLayout,
    effectiveBtcVisualTheme,
    a11y,
    ecosystem,
    setEcosystem,
    speakText,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    speechState,
    speechSupported,
  } = usePrefs();
  const isDistractionFree = Boolean(ecosystem.distractionFree);
  const isModernNav = effectiveBtcNavLayout === "modern";
  const isAltTheme = effectiveBtcVisualTheme === "btc_alternative";
  const isClassicUx = !isModernNav && effectiveUiExperience === "classic";
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [retryingBootstrap, setRetryingBootstrap] = useState(false);
  const [dismissedBootstrapError, setDismissedBootstrapError] = useState(false);
  const { isOnline } = usePWA();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (profile) {
      setDismissedBootstrapError(true);
    }
  }, [profile]);

  useEffect(() => {
    stopSpeaking();
  }, [pathname, stopSpeaking]);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 360);

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const readCurrentPage = () => {
    if (speechState === "playing") {
      pauseSpeaking();
      return;
    }
    if (speechState === "paused") {
      resumeSpeaking();
      return;
    }
    const main = document.getElementById("main-content");
    const text = extractReadablePageText(main);
    if (text) {
      speakText(text);
    }
  };

  const layoutSpec = getLayoutModeById(effectiveLayoutMode);
  const isTopNavShell = layoutSpec.navPosition === "top";
  const isBottomDockShell = layoutSpec.navPosition === "bottom";
  const primaryNavItems = ALL_NAV_ITEMS.filter(
    (i) => i && i.id && (PRIMARY_TOP_NAV_IDS as readonly string[]).includes(i.id),
  );
  const secondaryNavItems = ALL_NAV_ITEMS.filter(
    (i) =>
      i &&
      i.id &&
      !(PRIMARY_TOP_NAV_IDS as readonly string[]).includes(i.id) &&
      i.id !== "settings",
  );
  const isNestedRoute = pathname !== "/app" && pathname !== "/app/";
  const resolvedMeta = isNestedRoute ? resolveRouteMeta(pathname) : null;
  const routeSegmentLabel = resolvedMeta
    ? resolvedMeta.labelKey
      ? t(resolvedMeta.labelKey)
      : lang === "ar"
        ? resolvedMeta.labelAr
        : resolvedMeta.labelEn
    : isNestedRoute
      ? pathname
          .replace(/^\/app\/?/, "")
          .split("/")[0]
          ?.replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : null;
  const routeGroupLabel =
    resolvedMeta?.groupLabelKey !== undefined ? t(resolvedMeta.groupLabelKey) : null;

  const containerWidthClass =
    effectiveUiExperience === "focus_deck"
      ? "max-w-4xl"
      : effectiveUiExperience === "command_os"
        ? "max-w-7xl"
        : effectiveLayoutMode === "zen_focus" ||
            effectiveAppearance.readingLayout === "focused" ||
            effectiveLayout.workspace === "minimal"
          ? "max-w-3xl"
          : effectiveLayout.workspace === "study"
            ? "max-w-4xl"
            : effectiveLayout.workspace === "productivity" || effectiveLayoutMode === "bento"
              ? "max-w-7xl"
              : "max-w-6xl";

  const isCommandShell =
    !isDistractionFree && !isModernNav && effectiveUiExperience === "command_os";

  return (
    <div
      data-command-locked-viewport={isCommandShell ? "true" : undefined}
      data-btc-shell={isAltTheme ? "atelier" : "original"}
      data-btc-nav-shell={isModernNav ? "modern" : "classic"}
      className={cn(
        "flex w-full max-w-full overflow-x-hidden bg-background bg-hero",
        isCommandShell ? "min-h-dvh md:h-dvh md:overflow-hidden" : "min-h-dvh",
      )}
    >
      <a href="#main-content" className="skip-to-content">
        {t("skip.content")}
      </a>
      <AccountPrefsSync />
      <MilestoneCelebrationWatcher />
      {!isDistractionFree && !isModernNav && <Sidebar />}
      {isCommandShell && <CommandOsSidebar allModulesTrigger={<AllModulesMenu side="top" />} />}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          isCommandShell && "md:h-dvh md:overflow-hidden",
        )}
      >
        {isDistractionFree && (
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-primary/25 bg-surface px-4 py-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Sparkles className="size-3.5 text-primary" />
              <span>Distraction-Free Study Mode</span>
              {ecosystem.lowBandwidth && (
                <span className="border-s border-border ps-2 text-muted-foreground">
                  Low-Bandwidth
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {a11y.readAloud && speechSupported && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={readCurrentPage}
                >
                  <Volume2 className="size-3.5" />
                  <span>{t("a11y.readAloud.page")}</span>
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => setEcosystem({ distractionFree: false })}
              >
                Exit Focus Mode
              </Button>
            </div>
          </div>
        )}
        {!isDistractionFree && isModernNav && (
          <ModernNavHeader
            onReadAloud={readCurrentPage}
            showReadAloud={Boolean(a11y.readAloud && speechSupported)}
            speechActive={speechState !== "idle"}
            onOpenShortcuts={() => setShortcutsOpen(true)}
          />
        )}

        {!isDistractionFree && !isModernNav && effectiveUiExperience === "editorial_atelier" && (
          <EditorialMasthead
            allModulesTrigger={<AllModulesMenu side="bottom" />}
            routeLabel={routeSegmentLabel ?? null}
            onReadAloud={readCurrentPage}
            showReadAloud={Boolean(a11y.readAloud && speechSupported)}
            speechActive={speechState !== "idle"}
            onOpenShortcuts={() => setShortcutsOpen(true)}
          />
        )}

        {!isDistractionFree && !isModernNav && effectiveUiExperience === "command_os" && (
          <CommandOsTopBar
            routeLabel={routeSegmentLabel ?? null}
            routeGroupLabel={routeGroupLabel ?? null}
            onReadAloud={readCurrentPage}
            showReadAloud={Boolean(a11y.readAloud && speechSupported)}
            speechActive={speechState !== "idle"}
            onOpenShortcuts={() => setShortcutsOpen(true)}
          />
        )}

        {!isDistractionFree && !isModernNav && effectiveUiExperience === "focus_deck" && (
          <FocusDeckTopRibbon
            allModulesTrigger={<AllModulesMenu side="bottom" />}
            routeLabel={routeSegmentLabel ?? null}
            onReadAloud={readCurrentPage}
            showReadAloud={Boolean(a11y.readAloud && speechSupported)}
            speechActive={speechState !== "idle"}
          />
        )}

        {!isDistractionFree && isClassicUx && isTopNavShell && (
          <header className="sticky top-0 z-30 hidden h-14 items-center justify-between gap-4 border-b border-border/80 bg-surface/90 px-6 backdrop-blur-md md:flex">
            <div className="flex min-w-0 items-center gap-4">
              <Logo />
              <nav
                aria-label={t("nav.home")}
                className="flex items-center gap-1 overflow-x-auto no-scrollbar"
              >
                {primaryNavItems.map((item) => (
                  <NavItemLink
                    key={item.id}
                    item={item}
                    className="whitespace-nowrap px-2.5 text-xs"
                  />
                ))}
              </nav>
              <AllModulesMenu side="bottom" />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("nexora:open-command-palette"))}
                className="flex h-8 items-center gap-2 rounded-lg border border-border/80 bg-surface-2/70 px-2.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                title="Search & Quick Navigation (Cmd+K)"
                aria-label={t("dash.search.placeholder")}
              >
                <Search className="size-3.5 text-primary" />
                <kbd className="font-mono text-[10px] rounded border border-border bg-surface px-1">
                  ⌘K
                </kbd>
              </button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShortcutsOpen(true)}
                className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                title="Keyboard Shortcuts (?)"
              >
                <Keyboard className="size-3.5 text-primary" />
                <kbd className="font-mono text-[10px] rounded border border-border bg-surface px-1">
                  ?
                </kbd>
              </Button>
              <LanguageSwitcher compact />
              <PWAInstallButton showStatusWhenUnavailable={false} size="sm" />
              <NotificationCenter compact />
              <UserMenu compact />
            </div>
          </header>
        )}

        {!isDistractionFree && isClassicUx && effectiveLayoutMode === "double_header" && (
          <div className="hidden border-b border-border/70 bg-surface/85 px-6 py-1.5 md:flex items-center justify-between gap-2">
            <nav
              aria-label={t("nav.more")}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar"
            >
              {secondaryNavItems.map((item) => (
                <NavItemLink
                  key={item.id}
                  item={item}
                  className="whitespace-nowrap px-2.5 text-xs"
                />
              ))}
            </nav>
            <Link
              to="/app/settings"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
            >
              <span>{t("nav.settings")}</span>
            </Link>
          </div>
        )}

        {!isDistractionFree && isClassicUx && !isTopNavShell && (
          <header className="sticky top-0 z-30 hidden h-14 items-center justify-between gap-4 border-b border-border/80 bg-surface/90 px-6 backdrop-blur-md md:flex">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("nexora:open-command-palette"))}
                className="flex h-8.5 items-center gap-2 rounded-lg border border-border/80 bg-surface-2/70 px-3 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                title="Search & Quick Navigation (Cmd+K)"
              >
                <Search className="size-3.5 text-primary" />
                <span className="hidden lg:inline">{t("dash.search.placeholder")}</span>
                <kbd className="hidden font-mono text-[10px] rounded border border-border bg-surface px-1.5 py-0.5 sm:inline">
                  ⌘K
                </kbd>
              </button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShortcutsOpen(true)}
                className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                title="Keyboard Shortcuts (?)"
              >
                <Keyboard className="size-3.5 text-primary" />
                <span className="hidden xl:inline">
                  {lang === "ar" ? "الاختصارات" : "Shortcuts"}
                </span>
                <kbd className="hidden font-mono text-[10px] rounded border border-border bg-surface px-1 sm:inline">
                  ?
                </kbd>
              </Button>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {a11y.readAloud && speechSupported && (
                <Button
                  type="button"
                  variant={speechState !== "idle" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={readCurrentPage}
                  className="h-8 gap-1.5 px-2.5 text-xs"
                  aria-label={t("a11y.readAloud.page")}
                  title={t("a11y.readAloud.page")}
                >
                  <Volume2 className="size-3.5 text-primary" />
                  <span className="hidden lg:inline">{t("a11y.readAloud.page")}</span>
                </Button>
              )}
              <LanguageSwitcher compact />
              <PWAInstallButton showStatusWhenUnavailable={false} size="sm" />
              <NotificationCenter compact />
              <UserMenu compact />
            </div>
          </header>
        )}

        {!isDistractionFree && (
          <header className="sticky top-0 z-30 flex h-14 w-full max-w-full items-center justify-between gap-2 border-b border-border/80 bg-surface/95 px-3 backdrop-blur-md md:hidden">
            <Logo size="sm" showSubtitle={false} />
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("nexora:open-command-palette"))}
                aria-label={t("dash.search.placeholder")}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                <Search className="size-4 text-primary" />
              </button>
              {a11y.readAloud && speechSupported && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="min-h-[44px] min-w-[44px] shrink-0"
                  onClick={readCurrentPage}
                  onDoubleClick={stopSpeaking}
                  aria-label={t("a11y.readAloud.page")}
                  title={t("a11y.readAloud.page")}
                >
                  <Volume2 className="size-4" />
                </Button>
              )}
              <NotificationCenter compact />
              <LanguageSwitcher compact />
              <div className="shrink-0">
                <UserMenu compact />
              </div>
            </div>
          </header>
        )}

        <OfflineIndicator />

        {bootstrapError && !dismissedBootstrapError && !profile && isOnline && (
          <div
            role="status"
            data-testid="profile-sync-retry-banner"
            className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-foreground md:px-8"
          >
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-3.5 shrink-0 text-destructive" />
                <span>{t("common.error.desc")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 px-2.5 text-xs"
                  disabled={retryingBootstrap}
                  onClick={() => {
                    setRetryingBootstrap(true);
                    void router.invalidate().finally(() => setRetryingBootstrap(false));
                  }}
                >
                  <RefreshCw className={`size-3 ${retryingBootstrap ? "animate-spin" : ""}`} />
                  <span>{t("common.error.retry")}</span>
                </Button>
                <button
                  type="button"
                  onClick={() => setDismissedBootstrapError(true)}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center p-1 text-muted-foreground hover:text-foreground text-xs"
                  aria-label={t("common.dismiss")}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {user?.isAnonymous && (
          <div className="border-b border-border/80 bg-surface-2/75 px-4 py-2 md:px-8">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserCheck className="size-4 shrink-0 text-primary" />
                <span>{t("auth.guest.banner")}</span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setUpgradeOpen(true)}
                className="h-7 gap-1.5 px-3 text-xs font-semibold text-primary border-primary/35 hover:bg-primary/10"
              >
                <Sparkles className="size-3" />
                <span>{t("auth.guest.upgrade")}</span>
              </Button>
            </div>
          </div>
        )}

        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            "mx-auto w-full flex-1 px-4 pb-32 pt-6 focus:outline-none md:px-8 md:pt-8",
            isCommandShell
              ? "md:flex-1 md:overflow-y-auto md:pb-24"
              : isModernNav || effectiveUiExperience === "focus_deck"
                ? "md:pb-24"
                : "md:pb-10",
            containerWidthClass,
          )}
        >
          {isNestedRoute && routeSegmentLabel && (
            <nav
              aria-label="Breadcrumb"
              data-testid="route-breadcrumbs"
              className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 text-xs text-muted-foreground"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <Link
                  to="/app"
                  className="inline-flex min-h-[32px] items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Home className="size-3.5 text-primary" />
                  <span>{t("nav.home")}</span>
                </Link>
                {routeGroupLabel && (
                  <>
                    <ChevronRight className="size-3.5 rtl-flip opacity-50" />
                    <span className="text-muted-foreground/80">{routeGroupLabel}</span>
                  </>
                )}
                <ChevronRight className="size-3.5 rtl-flip opacity-60" />
                <span className="font-semibold text-foreground">{routeSegmentLabel}</span>
              </div>
              <Link
                to="/app"
                className="inline-flex min-h-[32px] items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="size-3 rtl-flip" />
                <span>{lang === "ar" ? "العودة للرئيسية" : "Back to Dashboard"}</span>
              </Link>
            </nav>
          )}
          <AppErrorBoundary
            fallbackTitle={t("common.error.title")}
            fallbackDesc={t("common.error.desc")}
            retryLabel={t("common.error.retry")}
            homeLabel={t("common.notfound.home")}
          >
            <Outlet />
          </AppErrorBoundary>
          {!isDistractionFree && isCommandShell && <AppFooter />}
        </main>
        {!isDistractionFree && !isCommandShell && <AppFooter />}
      </div>
      <QuranMiniPlayer
        lang={lang}
        onOpenQuranPage={() => void router.navigate({ to: "/app/quran" })}
      />
      {!isDistractionFree && !isModernNav && <MobileNav />}
      {!isDistractionFree && isModernNav && (
        <>
          <ModernFloatingDock />
          <ModernMobileNav />
        </>
      )}
      {!isDistractionFree && !isModernNav && effectiveUiExperience === "focus_deck" && (
        <>
          <FocusDeckCornerRail />
          <SpatialFloatingDock allModulesTrigger={<AllModulesMenu side="top" />} />
        </>
      )}
      {!isDistractionFree && isClassicUx && isBottomDockShell && (
        <nav
          aria-label="Desktop bottom dock"
          data-testid="desktop-bottom-dock"
          className="glass fixed bottom-3 left-1/2 z-40 hidden max-w-[95vw] -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-border px-3 py-1.5 shadow-card md:flex"
        >
          {primaryNavItems.map((item) => (
            <NavItemLink key={item.id} item={item} className="whitespace-nowrap px-2.5 text-xs" />
          ))}
          <AllModulesMenu side="top" />
        </nav>
      )}
      {showBackToTop && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          data-testid="back-to-top-btn"
          aria-label={t("nav.backTop")}
          title={t("nav.backTop")}
          onClick={() =>
            window.scrollTo({ top: 0, behavior: a11y.reduceMotion ? "auto" : "smooth" })
          }
          className="fixed bottom-20 end-4 z-30 size-11 rounded-lg border-border bg-surface/95 shadow-md md:bottom-6 md:end-6 md:size-9"
        >
          <ArrowUp className="size-4" />
        </Button>
      )}
      {speechState !== "idle" && (
        <div
          role="region"
          aria-label={t("a11y.readAloud.page")}
          data-testid="read-aloud-controller"
          className="fixed bottom-24 start-4 z-40 flex items-center gap-2 rounded-xl border border-primary/35 bg-surface/95 px-3 py-2 text-xs shadow-lg backdrop-blur-md md:bottom-6 md:start-6"
        >
          <Volume2 className="size-4 shrink-0 text-primary" />
          <span className="font-semibold text-foreground">
            {speechState === "playing"
              ? lang === "ar"
                ? "قراءة الصفحة جارية"
                : "Reading aloud"
              : lang === "ar"
                ? "القراءة متوقفة مؤقتاً"
                : "Paused"}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="min-h-[36px] gap-1 px-2.5 text-xs"
            onClick={speechState === "playing" ? pauseSpeaking : resumeSpeaking}
            aria-label={speechState === "playing" ? t("pomo.pause") : t("pomo.resume")}
          >
            {speechState === "playing" ? (
              <>
                <Pause className="size-3.5" />
                <span>{t("pomo.pause")}</span>
              </>
            ) : (
              <>
                <Play className="size-3.5" />
                <span>{t("pomo.resume")}</span>
              </>
            )}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="min-h-[36px] gap-1 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={stopSpeaking}
            aria-label={t("common.close")}
          >
            <Square className="size-3.5" />
            <span>{lang === "ar" ? "إيقاف" : "Stop"}</span>
          </Button>
        </div>
      )}
      <UpgradeAccountDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
      <KeyboardShortcutManagerDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  );
}
