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
  Pause,
  Play,
  RefreshCw,
  Search,
  Square,
  Volume2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AccountPrefsSync } from "@/components/app/AccountPrefsSync";
import { AppFooter } from "@/components/app/AppFooter";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { Logo } from "@/components/app/Logo";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import { QuranMiniPlayer } from "@/components/islamic/QuranMiniPlayer";
import { MobileNav } from "@/components/nav/MobileNav";
import { Sidebar } from "@/components/nav/Sidebar";
import { UserMenu } from "@/components/nav/UserMenu";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { Button } from "@/components/ui/button";
import { resolveRouteMeta } from "@/config/navigation";
import { QuranAudioProvider } from "@/contexts/QuranAudioContext";
import { useProfile } from "@/hooks/use-nexora";
import { ensureFirebaseUserBootstrap, getCachedBootstrappedProfile } from "@/lib/auth-bootstrap";
import { db } from "@/lib/firebase";
import { isUserEligibleForApp } from "@/lib/firebase-auth";
import type { ProfileRow } from "@/lib/firestore-data";
import { usePrefs } from "@/lib/preferences";
import { usePWA } from "@/lib/pwa";
import { extractReadablePageText } from "@/lib/speech-service";

export const Route = createFileRoute("/_authenticated/app")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    if (!isUserEligibleForApp(context.user, context.signInProvider)) {
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

function AppLayoutInner() {
  const { bootstrapError } = Route.useRouteContext();
  const router = useRouter();
  const { data: profile } = useProfile();
  const {
    t,
    lang,
    a11y,
    speakText,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    speechState,
    speechSupported,
  } = usePrefs();
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

  const isNestedRoute = pathname !== "/app" && pathname !== "/app/";
  const resolvedMeta = isNestedRoute ? resolveRouteMeta(pathname) : null;
  const routeSegmentLabel = resolvedMeta
    ? lang === "ar"
      ? resolvedMeta.labelAr
      : resolvedMeta.labelEn
    : isNestedRoute
      ? pathname
          .replace(/^\/app\/?/, "")
          .split("/")[0]
          ?.replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : null;

  return (
    <div className="flex min-h-dvh w-full max-w-full overflow-x-hidden bg-background bg-hero">
      <a href="#main-content" className="skip-to-content">
        {t("skip.content")}
      </a>
      <AccountPrefsSync />
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Desktop Header */}
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
              <kbd className="hidden rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] sm:inline">
                ⌘K
              </kbd>
            </button>
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
            <UserMenu compact />
          </div>
        </header>

        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-14 w-full max-w-full items-center justify-between gap-2 border-b border-border/80 bg-surface/95 px-3 backdrop-blur-md md:hidden">
          <Logo size="sm" showSubtitle={false} />
          <div className="flex shrink-0 items-center gap-1">
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
            <LanguageSwitcher compact />
            <UserMenu compact />
          </div>
        </header>

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
                  className="flex min-h-[36px] min-w-[36px] items-center justify-center p-1 text-xs text-muted-foreground hover:text-foreground"
                  aria-label={t("common.dismiss")}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 focus:outline-none md:px-8 md:pb-10 md:pt-8"
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
                  className="inline-flex min-h-[32px] items-center gap-1 transition-colors hover:text-foreground"
                >
                  <Home className="size-3.5 text-primary" />
                  <span>{lang === "ar" ? "الرئيسية" : "Home"}</span>
                </Link>
                <ChevronRight className="size-3.5 opacity-60 rtl-flip" />
                <span className="font-semibold text-foreground">{routeSegmentLabel}</span>
              </div>
              <Link
                to="/app"
                className="inline-flex min-h-[32px] items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <ArrowLeft className="size-3 rtl-flip" />
                <span>{lang === "ar" ? "العودة للرئيسية" : "Back to Home"}</span>
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
        </main>

        <AppFooter />
      </div>

      <QuranMiniPlayer
        lang={lang}
        onOpenQuranPage={() => void router.navigate({ to: "/app/quran" })}
      />
      <MobileNav />

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
    </div>
  );
}
