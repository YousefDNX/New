import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  BookOpenCheck,
  CheckSquare,
  Compass,
  HeartHandshake,
  Home,
  Keyboard,
  LayoutGrid,
  Search,
  Sparkles,
  Users,
  Volume2,
  X,
} from "lucide-react";
import { Logo } from "@/components/app/Logo";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { NotificationCenter } from "@/components/nav/NotificationCenter";
import { UserMenu } from "@/components/nav/UserMenu";
import { ProgressCard } from "@/components/app/ProgressCard";
import { PWAInstallButton } from "@/components/pwa/PWAInstallButton";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  EXTENDED_NAV_GROUPS,
  NAV_ADMIN,
  NAV_FOOTER,
  NAV_GROUPS,
  NAV_UTILITIES,
  getNavItemById,
  type NavItem,
} from "@/config/navigation";
import { useRbac } from "@/hooks/use-rbac";
import { usePrefs } from "@/lib/preferences";
import { cn } from "@/lib/utils";

const MODERN_PRIMARY_IDS = ["home", "study", "circle", "tasks", "quran", "ai"] as const;

export function ModernNavHeader({
  onReadAloud,
  showReadAloud,
  speechActive,
  onOpenShortcuts,
}: {
  onReadAloud?: () => void;
  showReadAloud?: boolean;
  speechActive?: boolean;
  onOpenShortcuts?: () => void;
}) {
  const { t, lang } = usePrefs();
  const rbac = useRbac();
  const [megaOpen, setMegaOpen] = useState(false);

  const primaryItems = MODERN_PRIMARY_IDS.map(getNavItemById).filter((item): item is NavItem =>
    Boolean(item && item.id && item.to),
  );

  return (
    <header
      data-testid="modern-nav-header"
      className="sticky top-0 z-30 hidden w-full px-4 pt-3 md:block"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 rounded-2xl border border-border/85 bg-surface/90 px-4 shadow-[var(--shadow-card)] backdrop-blur-xl">
        {/* Zone 1: Brand wordmark */}
        <div className="flex shrink-0 items-center">
          <Logo size="sm" showSubtitle={false} />
        </div>

        {/* Zone 2: Horizontal segmented navigation links + Explore Spaces Mega-Menu */}
        <nav
          aria-label={t("nav.home")}
          className="flex min-w-0 items-center gap-1 overflow-x-auto no-scrollbar"
        >
          {primaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.to}
                activeOptions={{ exact: item.exact ?? false }}
                className={cn(
                  "group relative flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-muted-foreground transition-colors whitespace-nowrap",
                  "hover:bg-surface-2/80 hover:text-foreground",
                  "data-[status=active]:bg-nav-active data-[status=active]:text-nav-active-foreground",
                )}
              >
                <Icon className="size-3.5 shrink-0 transition-transform group-hover:scale-105" />
                <span>{t(item.label)}</span>
                <span className="pointer-events-none absolute inset-x-3 -bottom-px h-0.5 scale-x-0 rounded-full bg-primary transition-transform group-data-[status=active]:scale-x-100" />
              </Link>
            );
          })}

          <Popover open={megaOpen} onOpenChange={setMegaOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                data-testid="modern-all-spaces-btn"
                aria-expanded={megaOpen}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-border/80 bg-surface-2/70 px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary whitespace-nowrap cursor-pointer"
              >
                <LayoutGrid className="size-3.5 text-primary" />
                <span>{lang === "ar" ? "كل المساحات" : "Spaces"}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="center"
              className="w-[min(94vw,42rem)] rounded-2xl border-border bg-popover/95 p-5 shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-3 flex items-center justify-between border-b border-border/70 pb-2.5">
                <div>
                  <p className="font-display text-sm font-bold text-foreground">
                    {lang === "ar" ? "خريطة مساحات منصة BTC" : "BTC Workspace Directory"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {lang === "ar"
                      ? "انتقل مباشرة إلى أي أداة تعليمية أو دائرة معرفة"
                      : "Jump directly to any study module, sanctuary, or collaborative space"}
                  </p>
                </div>
                <Link
                  to="/app/circle"
                  search={{ section: "girls_space" } as never}
                  onClick={() => setMegaOpen(false)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-500/35 bg-rose-500/10 px-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 whitespace-nowrap"
                >
                  <HeartHandshake className="size-3.5" />
                  <span>{lang === "ar" ? "مساحة الفتيات" : "Girls' Space"}</span>
                </Link>
              </div>

              <div className="grid max-h-[60dvh] gap-4 overflow-y-auto sm:grid-cols-2 md:grid-cols-3">
                {[...NAV_GROUPS, ...EXTENDED_NAV_GROUPS].map((group) => (
                  <div key={group.id} className="space-y-1.5">
                    <p className="px-2 text-[11px] font-semibold text-muted-foreground">
                      {t(group.label)}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={`modern-mega-${item.id}`}
                            to={item.to}
                            activeOptions={{ exact: item.exact ?? false }}
                            onClick={() => setMegaOpen(false)}
                            className="flex min-h-[36px] items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-2 hover:text-primary data-[status=active]:bg-nav-active data-[status=active]:text-nav-active-foreground"
                          >
                            <Icon className="size-3.5 shrink-0 text-primary" />
                            <span className="truncate">{t(item.label)}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[...NAV_FOOTER, ...NAV_UTILITIES].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={`modern-util-${item.id}`}
                        to={item.to}
                        onClick={() => setMegaOpen(false)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 text-xs font-medium text-foreground hover:border-primary/40 hover:text-primary whitespace-nowrap"
                      >
                        <Icon className="size-3.5 text-primary" />
                        <span>{t(item.label)}</span>
                      </Link>
                    );
                  })}
                  {rbac.isStaff && (
                    <Link
                      to={NAV_ADMIN.to}
                      onClick={() => setMegaOpen(false)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-2.5 text-xs font-semibold text-primary hover:bg-primary/20 whitespace-nowrap"
                    >
                      <NAV_ADMIN.icon className="size-3.5" />
                      <span>{t(NAV_ADMIN.label)}</span>
                    </Link>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </nav>

        {/* Zone 3: Compact utility & identity action cluster */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("nexora:open-command-palette"))}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-border/80 bg-surface-2/70 px-2.5 text-xs text-muted-foreground transition-colors hover:border-primary/45 hover:text-foreground cursor-pointer whitespace-nowrap"
            title={t("dash.search.placeholder")}
            aria-label={t("dash.search.placeholder")}
          >
            <Search className="size-3.5 text-primary" />
            <kbd className="font-mono text-[10px] rounded border border-border bg-surface px-1">
              ⌘K
            </kbd>
          </button>

          {showReadAloud && onReadAloud && (
            <Button
              type="button"
              variant={speechActive ? "secondary" : "ghost"}
              size="icon"
              onClick={onReadAloud}
              className="size-8"
              title={t("a11y.readAloud.page")}
              aria-label={t("a11y.readAloud.page")}
            >
              <Volume2 className="size-3.5 text-primary" />
            </Button>
          )}

          {onOpenShortcuts && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onOpenShortcuts}
              className="size-8 text-muted-foreground hover:text-foreground"
              title="Keyboard Shortcuts (?)"
              aria-label="Keyboard Shortcuts"
            >
              <Keyboard className="size-3.5" />
            </Button>
          )}

          <LanguageSwitcher compact />
          <PWAInstallButton showStatusWhenUnavailable={false} size="sm" />
          <NotificationCenter compact />
          <UserMenu compact />
        </div>
      </div>
    </header>
  );
}

export function ModernFloatingDock() {
  const { lang } = usePrefs();

  const dockLinks = [
    {
      to: "/app" as const,
      exact: true,
      icon: Home,
      label: lang === "ar" ? "الرئيسية" : "Home",
    },
    {
      to: "/app/study" as const,
      icon: BookOpen,
      label: lang === "ar" ? "الدراسة" : "Study",
    },
    {
      to: "/app/ai" as const,
      icon: Sparkles,
      label: "BTC AI",
    },
    {
      to: "/app/circle" as const,
      icon: Users,
      label: lang === "ar" ? "حلقة المعرفة" : "Circle",
    },
    {
      to: "/app/tasks" as const,
      icon: CheckSquare,
      label: lang === "ar" ? "المهام" : "Tasks",
    },
    {
      to: "/app/quran" as const,
      icon: BookOpenCheck,
      label: lang === "ar" ? "القرآن" : "Quran",
    },
  ];

  return (
    <nav
      aria-label={lang === "ar" ? "شريط الوصول السريع" : "Modern floating quick dock"}
      data-testid="modern-floating-dock"
      className="fixed bottom-4 left-1/2 z-30 hidden -translate-x-1/2 items-center gap-1 rounded-2xl border border-border/90 bg-popover/90 px-2.5 py-1.5 shadow-2xl backdrop-blur-xl md:flex"
    >
      {dockLinks.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.exact ?? false }}
            className={cn(
              "group flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-muted-foreground transition-all whitespace-nowrap",
              "hover:bg-surface-2 hover:text-foreground",
              "data-[status=active]:bg-primary data-[status=active]:text-primary-foreground data-[status=active]:shadow-sm",
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function ModernMobileNav() {
  const { t, lang } = usePrefs();
  const rbac = useRbac();
  const [open, setOpen] = useState(false);

  const mobileDockItems = [
    {
      to: "/app" as const,
      exact: true,
      icon: Home,
      label: t("nav.home"),
    },
    {
      to: "/app/study" as const,
      icon: BookOpen,
      label: t("nav.study"),
    },
    {
      to: "/app/ai" as const,
      icon: Sparkles,
      label: "BTC AI",
    },
    {
      to: "/app/circle" as const,
      icon: Users,
      label: lang === "ar" ? "المعرفة" : "Circle",
    },
  ];

  return (
    <>
      <nav
        aria-label={t("nav.home")}
        data-testid="modern-mobile-nav"
        className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.5rem)] z-40 flex h-14 items-center justify-between gap-1 rounded-2xl border border-primary/30 bg-popover/95 px-2 shadow-2xl backdrop-blur-xl md:hidden"
      >
        {mobileDockItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact ?? false }}
              className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-semibold text-muted-foreground transition-colors data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate text-[11px]">{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("nav.more")}
          className="flex min-h-[44px] items-center justify-center gap-1 rounded-xl border border-border bg-surface-2 px-3 text-[11px] font-semibold text-foreground"
        >
          <Compass className="size-4 text-primary" />
          <span>{lang === "ar" ? "المزيد" : "Menu"}</span>
        </button>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] overflow-y-auto rounded-t-3xl border-border bg-popover pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
        >
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle className="font-display">
              {lang === "ar" ? "كل مساحات BTC" : "All BTC Workspaces"}
            </SheetTitle>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground"
              aria-label={t("common.close")}
            >
              <X className="size-4" />
            </button>
          </SheetHeader>

          <div className="space-y-4 px-4 pt-2">
            <ProgressCard />

            <Link
              to="/app/circle"
              search={{ section: "girls_space" } as never}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-400"
            >
              <span className="flex items-center gap-2">
                <HeartHandshake className="size-4" />
                <span>
                  {lang === "ar"
                    ? "مساحة الفتيات (القيادة والعلوم)"
                    : "Girls' Space — Protected Leadership & STEM"}
                </span>
              </span>
              <span className="font-mono text-[11px]">→</span>
            </Link>

            {[...NAV_GROUPS, ...EXTENDED_NAV_GROUPS].map((group) => (
              <div key={group.id} className="space-y-2">
                <p className="px-1 text-[11px] font-semibold text-muted-foreground">
                  {t(group.label)}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={`mm-${item.id}`}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="flex min-h-[44px] items-center gap-2.5 rounded-xl border border-border bg-surface-2/80 px-3 py-2 text-xs font-medium text-foreground data-[status=active]:border-primary data-[status=active]:bg-nav-active data-[status=active]:text-nav-active-foreground"
                      >
                        <Icon className="size-4 shrink-0 text-primary" />
                        <span className="truncate">{t(item.label)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-2 border-t border-border/70 pt-3">
              {[...NAV_FOOTER, ...NAV_UTILITIES].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={`mm-util-${item.id}`}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] items-center gap-2.5 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-medium text-foreground"
                  >
                    <Icon className="size-4 shrink-0 text-primary" />
                    <span className="truncate">{t(item.label)}</span>
                  </Link>
                );
              })}
              {rbac.isStaff && (
                <Link
                  to={NAV_ADMIN.to}
                  onClick={() => setOpen(false)}
                  className="col-span-2 flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"
                >
                  <NAV_ADMIN.icon className="size-4" />
                  <span>{t(NAV_ADMIN.label)}</span>
                </Link>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
