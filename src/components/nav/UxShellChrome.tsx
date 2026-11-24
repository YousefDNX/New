import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  Compass,
  Keyboard,
  LayoutGrid,
  Orbit,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Volume2,
  X,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { Logo } from "@/components/app/Logo";
import { PWAInstallButton } from "@/components/pwa/PWAInstallButton";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ALL_NAV_ITEMS,
  NAV_ADMIN,
  NAV_FOOTER,
  NAV_GROUPS,
  NAV_UTILITIES,
} from "@/config/navigation";
import { useRbac } from "@/hooks/use-rbac";
import { useExperienceMode } from "@/lib/experience-mode";
import { usePrefs } from "@/lib/preferences";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "./NotificationCenter";
import { UserMenu } from "./UserMenu";

function openPalette() {
  window.dispatchEvent(new CustomEvent("nexora:open-command-palette"));
}

/* ============================================================================
 * 1. EDITORIAL ATELIER — Top Magazine Masthead with Chapter Dropdown Menus
 * ============================================================================ */
export function EditorialMasthead({
  allModulesTrigger,
  routeLabel,
  onReadAloud,
  showReadAloud,
  speechActive,
  onOpenShortcuts,
}: {
  allModulesTrigger: ReactNode;
  routeLabel: string | null;
  onReadAloud: () => void;
  showReadAloud: boolean;
  speechActive: boolean;
  onOpenShortcuts: () => void;
}) {
  const { t, lang } = usePrefs();
  const rbac = useRbac();
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const isAr = lang === "ar";

  return (
    <header
      data-testid="editorial-masthead"
      className="sticky top-0 z-30 hidden border-b border-border bg-background/95 backdrop-blur-sm md:block"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-8 py-3">
        <div className="flex items-center gap-5 min-w-0">
          <Logo />
          <div className="hidden h-5 w-px bg-border lg:block" aria-hidden="true" />
          <nav
            aria-label={t("nav.home")}
            className="flex items-center gap-1 overflow-x-auto no-scrollbar"
          >
            <Link
              to="/app"
              activeOptions={{ exact: true }}
              className="inline-flex min-h-[40px] items-center border-b-2 border-transparent px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground data-[status=active]:border-primary data-[status=active]:text-foreground whitespace-nowrap"
            >
              {t("nav.home")}
            </Link>

            {NAV_GROUPS.map((group) => (
              <Popover
                key={group.id}
                open={openGroupId === group.id}
                onOpenChange={(v) => setOpenGroupId(v ? group.id : null)}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex min-h-[40px] items-center gap-1 border-b-2 border-transparent px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
                  >
                    <span>{t(group.label)}</span>
                    <ChevronDown className="size-3 opacity-60" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-60 p-2">
                  <div className="mb-1 border-b border-border/70 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t(group.label)}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.id}
                          to={item.to}
                          onClick={() => setOpenGroupId(null)}
                          className="flex min-h-[38px] items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-2 hover:text-primary data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
                        >
                          <Icon className="size-3.5 shrink-0 text-primary" />
                          <span className="truncate">{t(item.label)}</span>
                        </Link>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            ))}

            {NAV_FOOTER.map((item) => (
              <Link
                key={item.id}
                to={item.to}
                className="inline-flex min-h-[40px] items-center border-b-2 border-transparent px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground data-[status=active]:border-primary data-[status=active]:text-foreground whitespace-nowrap"
              >
                {t(item.label)}
              </Link>
            ))}

            {rbac.isStaff && (
              <Link
                to={NAV_ADMIN.to}
                className="inline-flex min-h-[40px] items-center border-b-2 border-transparent px-2.5 text-xs font-semibold text-primary transition-colors hover:underline data-[status=active]:border-primary whitespace-nowrap"
              >
                {t(NAV_ADMIN.label)}
              </Link>
            )}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {allModulesTrigger}
          <button
            type="button"
            onClick={openPalette}
            aria-label={t("dash.search.placeholder")}
            className="inline-flex min-h-[38px] items-center gap-1.5 border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            <Search className="size-3.5 text-primary" />
            <span className="hidden xl:inline">{isAr ? "بحث" : "Search"}</span>
          </button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenShortcuts}
            className="h-9 px-2 text-xs text-muted-foreground"
            title="Keyboard Shortcuts (?)"
            aria-label="Keyboard Shortcuts"
          >
            <Keyboard className="size-3.5" />
          </Button>
          {showReadAloud && (
            <Button
              type="button"
              variant={speechActive ? "secondary" : "ghost"}
              size="sm"
              onClick={onReadAloud}
              className="h-9 gap-1.5 px-2.5 text-xs"
              aria-label={t("a11y.readAloud.page")}
            >
              <Volume2 className="size-3.5 text-primary" />
              <span className="hidden xl:inline">{t("a11y.readAloud.page")}</span>
            </Button>
          )}
          <LanguageSwitcher compact />
          <NotificationCenter compact />
          <UserMenu compact />
        </div>
      </div>

      {/* Subtle Editorial Sub-Strip */}
      <div className="border-t border-border/60 bg-surface-2/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-1.5 text-[11px] text-muted-foreground">
          <span>
            {isAr ? "طبعة الدراسة والتحرير" : "Editorial Study Edition"}
            {routeLabel ? ` · ${routeLabel}` : ""}
          </span>
          <div className="flex items-center gap-4">
            {NAV_UTILITIES.map((u) => (
              <Link key={u.id} to={u.to} className="hover:text-foreground transition-colors">
                {t(u.label)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

/* ============================================================================
 * 2. MODE B: COMMAND CENTER / WORKSPACE — Collapsible Left Rail + Breadcrumb Topbar + ⌘K
 * ============================================================================ */
export function CommandOsSidebar({ allModulesTrigger }: { allModulesTrigger?: ReactNode }) {
  const { t, lang } = usePrefs();
  const { sidebarCollapsed, toggleSidebar } = useExperienceMode();
  const rbac = useRbac();
  const isAr = lang === "ar";

  return (
    <aside
      data-testid="command-os-sidebar"
      data-collapsed={sidebarCollapsed ? "true" : "false"}
      className={cn(
        "hidden shrink-0 flex-col border-e border-border/80 bg-surface/95 backdrop-blur-md transition-[width] duration-200 md:flex md:h-dvh",
        sidebarCollapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex h-12 items-center justify-between border-b border-border/70 px-3">
        {!sidebarCollapsed ? (
          <Logo size="sm" showSubtitle={false} />
        ) : (
          <span className="mx-auto font-display text-xs font-extrabold tracking-tight text-primary">
            BTC
          </span>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          data-testid="command-os-sidebar-toggle"
          aria-label={sidebarCollapsed ? "Expand workspace sidebar" : "Collapse workspace sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="size-4 rtl-flip" />
          ) : (
            <PanelLeftClose className="size-4 rtl-flip" />
          )}
        </button>
      </div>

      {/* Cmd+K Spotlight Quick Trigger inside Sidebar */}
      <div className="border-b border-border/60 p-2.5">
        <button
          type="button"
          onClick={openPalette}
          className={cn(
            "flex min-h-[36px] w-full items-center rounded-lg border border-border bg-surface-2/80 text-xs text-muted-foreground transition-colors hover:border-primary/45 hover:text-foreground",
            sidebarCollapsed ? "justify-center px-0" : "justify-between px-2.5",
          )}
          title={isAr ? "لوحة الأوامر (⌘K)" : "Command Palette (⌘K)"}
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="size-3.5 shrink-0 text-primary" />
            {!sidebarCollapsed && (
              <span className="truncate">{isAr ? "بحث سريع..." : "Quick Jump..."}</span>
            )}
          </span>
          {!sidebarCollapsed && (
            <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          )}
        </button>
      </div>

      {/* Internal Scrollable Nav Tree */}
      <nav aria-label={t("nav.home")} className="flex-1 space-y-4 overflow-y-auto px-2.5 py-3">
        <Link
          to="/app"
          activeOptions={{ exact: true }}
          title={t("nav.home")}
          className={cn(
            "flex min-h-[38px] items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-nav-foreground transition-colors hover:bg-surface-2 hover:text-foreground data-[status=active]:bg-primary/15 data-[status=active]:text-primary",
            sidebarCollapsed && "justify-center px-0",
          )}
        >
          <LayoutGrid className="size-4 shrink-0" />
          {!sidebarCollapsed && <span className="truncate">{t("nav.home")}</span>}
        </Link>

        {NAV_GROUPS.map((group) => (
          <div key={group.id} className="space-y-1">
            {!sidebarCollapsed && (
              <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t(group.label)}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  title={t(item.label)}
                  aria-label={t(item.label)}
                  className={cn(
                    "flex min-h-[36px] items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-nav-foreground transition-colors hover:bg-surface-2 hover:text-foreground data-[status=active]:bg-primary/15 data-[status=active]:text-primary",
                    sidebarCollapsed && "justify-center px-0",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{t(item.label)}</span>}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="space-y-1 border-t border-border/60 pt-2">
          {[...NAV_FOOTER, ...NAV_UTILITIES].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.to}
                title={t(item.label)}
                aria-label={t(item.label)}
                className={cn(
                  "flex min-h-[36px] items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-nav-foreground transition-colors hover:bg-surface-2 hover:text-foreground data-[status=active]:bg-primary/15 data-[status=active]:text-primary",
                  sidebarCollapsed && "justify-center px-0",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{t(item.label)}</span>}
              </Link>
            );
          })}
          {rbac.isStaff && (
            <Link
              to={NAV_ADMIN.to}
              title={t(NAV_ADMIN.label)}
              className={cn(
                "flex min-h-[36px] items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 data-[status=active]:bg-primary/15",
                sidebarCollapsed && "justify-center px-0",
              )}
            >
              <NAV_ADMIN.icon className="size-4 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{t(NAV_ADMIN.label)}</span>}
            </Link>
          )}
        </div>
      </nav>

      {!sidebarCollapsed && allModulesTrigger && (
        <div className="border-t border-border/60 p-2.5 flex justify-center">
          {allModulesTrigger}
        </div>
      )}
    </aside>
  );
}

export function CommandOsTopBar({
  routeLabel,
  routeGroupLabel,
  onReadAloud,
  showReadAloud,
  speechActive,
  onOpenShortcuts,
}: {
  routeLabel: string | null;
  routeGroupLabel?: string | null;
  onReadAloud: () => void;
  showReadAloud: boolean;
  speechActive: boolean;
  onOpenShortcuts: () => void;
}) {
  const { t, lang } = usePrefs();
  const { sidebarCollapsed, toggleSidebar } = useExperienceMode();
  const isAr = lang === "ar";

  return (
    <header
      data-testid="command-os-topbar"
      className="glass sticky top-0 z-30 hidden h-12 shrink-0 items-center justify-between gap-4 border-b border-border/80 px-5 md:flex"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={toggleSidebar}
          data-testid="command-os-topbar-toggle"
          aria-label={sidebarCollapsed ? "Expand workspace sidebar" : "Collapse workspace sidebar"}
          className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/80 bg-surface-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="size-3.5 rtl-flip" />
          ) : (
            <PanelLeftClose className="size-3.5 rtl-flip" />
          )}
        </button>
        <div className="flex items-center gap-1.5 text-xs min-w-0">
          <Link to="/app" className="font-semibold text-muted-foreground hover:text-foreground">
            {t("nav.home")}
          </Link>
          {routeGroupLabel && (
            <>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60 rtl-flip" />
              <span className="truncate text-muted-foreground">{routeGroupLabel}</span>
            </>
          )}
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60 rtl-flip" />
          <span className="truncate font-display font-semibold text-foreground">
            {routeLabel ?? (isAr ? "مركز القيادة" : "Command Center")}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={openPalette}
        data-testid="command-os-spotlight-btn"
        className="flex min-h-[34px] w-full max-w-sm items-center justify-between gap-3 rounded-lg border border-border/80 bg-surface-2/80 px-3 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        aria-label={t("dash.search.placeholder")}
      >
        <span className="flex items-center gap-2 truncate">
          <Search className="size-3.5 shrink-0 text-primary" />
          <span className="truncate">
            {isAr ? "لوحة الأوامر · افتح أي وحدة فوراً..." : "Command Palette · jump anywhere..."}
          </span>
        </span>
        <kbd className="font-mono text-[10px] rounded border border-border bg-surface px-1.5 py-0.5">
          ⌘K
        </kbd>
      </button>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onOpenShortcuts}
          className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
          title="Keyboard Shortcuts (?)"
          aria-label="Keyboard Shortcuts"
        >
          <Keyboard className="size-3.5 text-primary" />
        </Button>
        {showReadAloud && (
          <Button
            type="button"
            variant={speechActive ? "secondary" : "ghost"}
            size="sm"
            onClick={onReadAloud}
            className="h-8 gap-1 px-2 text-xs"
            aria-label={t("a11y.readAloud.page")}
          >
            <Volume2 className="size-3.5 text-primary" />
          </Button>
        )}
        <LanguageSwitcher compact />
        <PWAInstallButton showStatusWhenUnavailable={false} size="sm" />
        <NotificationCenter compact />
        <UserMenu compact />
      </div>
    </header>
  );
}

const OS_DOCK_IDS = ["home", "ai", "study", "english", "tasks", "levelup", "quran", "settings"];

export function CommandOsDock({ allModulesTrigger }: { allModulesTrigger: ReactNode }) {
  const { t } = usePrefs();
  const rbac = useRbac();
  const dockItems = OS_DOCK_IDS.map((id) => ALL_NAV_ITEMS.find((i) => i.id === id)).filter(
    (x): x is NonNullable<typeof x> => Boolean(x),
  );

  return (
    <nav
      aria-label={t("nav.home")}
      data-testid="command-os-dock"
      className="glass fixed bottom-3 left-1/2 z-40 hidden max-w-[96vw] -translate-x-1/2 items-center gap-1 rounded-2xl border border-border px-2.5 py-1.5 shadow-card md:flex"
    >
      {dockItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            to={item.to}
            activeOptions={{ exact: item.exact ?? false }}
            title={t(item.label)}
            aria-label={t(item.label)}
            className="group relative flex min-h-[40px] items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-nav-foreground transition-all hover:-translate-y-0.5 hover:bg-surface-2 hover:text-foreground data-[status=active]:bg-primary/15 data-[status=active]:text-primary"
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.9} />
            <span className="hidden xl:inline whitespace-nowrap">{t(item.label)}</span>
          </Link>
        );
      })}
      {rbac.isStaff && (
        <Link
          to={NAV_ADMIN.to}
          title={t(NAV_ADMIN.label)}
          aria-label={t(NAV_ADMIN.label)}
          className="flex min-h-[40px] items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-primary transition-all hover:-translate-y-0.5 hover:bg-primary/10 data-[status=active]:bg-primary/15"
        >
          <NAV_ADMIN.icon className="size-4 shrink-0" />
        </Link>
      )}
      <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
      {allModulesTrigger}
    </nav>
  );
}

/* ============================================================================
 * 3. MODE C: SPATIAL / INTERACTIVE — Top Compass + Corner Rail + Floating Glass Dock + Radial Quick Menu
 * ============================================================================ */
export function FocusDeckTopRibbon({
  allModulesTrigger,
  routeLabel,
  onReadAloud,
  showReadAloud,
  speechActive,
}: {
  allModulesTrigger: ReactNode;
  routeLabel: string | null;
  onReadAloud: () => void;
  showReadAloud: boolean;
  speechActive: boolean;
}) {
  const { t, lang } = usePrefs();
  const isAr = lang === "ar";

  return (
    <header
      data-testid="focus-deck-header"
      className="sticky top-0 z-30 hidden border-b border-border/70 bg-background/90 backdrop-blur-md md:block"
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Logo size="sm" showSubtitle={false} />
          <span className="text-border" aria-hidden="true">
            ·
          </span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <Compass className="size-3.5 shrink-0 text-primary" />
            <span className="truncate font-semibold text-foreground">
              {routeLabel ?? (isAr ? "المسار المكاني التفاعلي" : "Spatial Focus Flow")}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {allModulesTrigger}
          <button
            type="button"
            onClick={openPalette}
            aria-label={t("dash.search.placeholder")}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-border bg-surface-2/70 px-3 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Search className="size-3.5 text-primary" />
            <span>{isAr ? "انتقال سريع" : "Quick Jump"}</span>
          </button>
          {showReadAloud && (
            <Button
              type="button"
              variant={speechActive ? "secondary" : "ghost"}
              size="sm"
              onClick={onReadAloud}
              className="h-9 gap-1.5 px-2.5 text-xs"
              aria-label={t("a11y.readAloud.page")}
            >
              <Volume2 className="size-3.5 text-primary" />
              <span className="hidden lg:inline">{t("a11y.readAloud.page")}</span>
            </Button>
          )}
          <LanguageSwitcher compact />
          <NotificationCenter compact />
          <UserMenu compact />
        </div>
      </div>
    </header>
  );
}

const COMPASS_RAIL_IDS = ["home", "ai", "study", "tasks", "quran", "settings"];

export function FocusDeckCornerRail() {
  const { t } = usePrefs();
  const railItems = COMPASS_RAIL_IDS.map((id) => ALL_NAV_ITEMS.find((i) => i.id === id)).filter(
    (x): x is NonNullable<typeof x> => Boolean(x),
  );

  return (
    <aside
      aria-label={t("nav.home")}
      data-testid="focus-deck-rail"
      className="fixed start-4 top-24 z-30 hidden flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface/95 p-1.5 shadow-card backdrop-blur-md xl:flex"
    >
      {railItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            to={item.to}
            activeOptions={{ exact: item.exact ?? false }}
            title={t(item.label)}
            aria-label={t(item.label)}
            className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
          >
            <Icon className="size-4" strokeWidth={1.9} />
          </Link>
        );
      })}
      <button
        type="button"
        onClick={openPalette}
        title={t("dash.search.placeholder")}
        aria-label={t("dash.search.placeholder")}
        className={cn(
          "flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-surface-2 hover:text-primary",
        )}
      >
        <LayoutGrid className="size-4" />
      </button>
    </aside>
  );
}

const SPATIAL_DOCK_IDS = ["home", "ai", "study", "english", "tasks", "quran", "settings"];
const RADIAL_QUICK_IDS = ["ai", "study", "tasks", "levelup", "quran", "coding"];

export function SpatialFloatingDock({ allModulesTrigger }: { allModulesTrigger?: ReactNode }) {
  const { t, lang } = usePrefs();
  const { radialMenuOpen, toggleRadialMenu, setRadialMenuOpen } = useExperienceMode();
  const isAr = lang === "ar";

  const dockItems = SPATIAL_DOCK_IDS.map((id) => ALL_NAV_ITEMS.find((i) => i.id === id)).filter(
    (x): x is NonNullable<typeof x> => Boolean(x),
  );
  const radialItems = RADIAL_QUICK_IDS.map((id) => ALL_NAV_ITEMS.find((i) => i.id === id)).filter(
    (x): x is NonNullable<typeof x> => Boolean(x),
  );

  return (
    <div className="fixed bottom-3 left-1/2 z-40 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
      {/* Radial Arc Quick Launcher */}
      {radialMenuOpen && (
        <div
          role="menu"
          aria-label={isAr ? "القائمة الشعاعية السريعة" : "Radial Quick Launcher"}
          data-testid="spatial-radial-menu"
          className="relative flex flex-wrap items-center justify-center gap-2 rounded-3xl border border-primary/35 bg-surface/95 px-4 py-3 shadow-2xl backdrop-blur-lg"
        >
          {radialItems.map((item, idx) => {
            const Icon = item.icon;
            // Subtle radial arc vertical offset
            const lift =
              idx === 2 || idx === 3
                ? "-translate-y-2"
                : idx === 1 || idx === 4
                  ? "-translate-y-1"
                  : "";
            return (
              <Link
                key={`radial-${item.id}`}
                to={item.to}
                onClick={() => setRadialMenuOpen(false)}
                className={cn(
                  "flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-2xl border border-border/80 bg-surface-2 px-3 py-2 text-[11px] font-semibold text-foreground transition-all hover:scale-105 hover:border-primary hover:text-primary",
                  lift,
                )}
              >
                <Icon className="size-4 text-primary" />
                <span className="whitespace-nowrap">{t(item.label)}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Floating Glass Dock */}
      <nav
        aria-label={isAr ? "الرصيف التفاعلي العائم" : "Spatial Floating Dock"}
        data-testid="spatial-floating-dock"
        className="glass flex items-center gap-1.5 rounded-2xl border border-border/90 px-3 py-2 shadow-2xl"
      >
        <button
          type="button"
          onClick={toggleRadialMenu}
          data-testid="spatial-radial-trigger"
          aria-expanded={radialMenuOpen}
          aria-label={isAr ? "فتح القائمة الشعاعية" : "Toggle Radial Menu"}
          className={cn(
            "flex size-10 items-center justify-center rounded-xl border transition-all hover:scale-110",
            radialMenuOpen
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-surface-2 text-primary hover:border-primary/50",
          )}
        >
          {radialMenuOpen ? <X className="size-4" /> : <Orbit className="size-4" />}
        </button>

        <div className="mx-0.5 h-6 w-px bg-border/80" aria-hidden="true" />

        {dockItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={`spatial-${item.id}`}
              to={item.to}
              activeOptions={{ exact: item.exact ?? false }}
              title={t(item.label)}
              aria-label={t(item.label)}
              className="group flex min-h-[40px] items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-nav-foreground transition-all hover:-translate-y-1 hover:scale-105 hover:bg-surface-2 hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.9} />
              <span className="hidden lg:inline whitespace-nowrap">{t(item.label)}</span>
            </Link>
          );
        })}

        {allModulesTrigger && (
          <>
            <div className="mx-0.5 h-6 w-px bg-border/80" aria-hidden="true" />
            {allModulesTrigger}
          </>
        )}
      </nav>
    </div>
  );
}
