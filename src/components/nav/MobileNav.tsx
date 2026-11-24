import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";
import {
  ALL_NAV_ITEMS,
  EXTENDED_NAV_GROUPS,
  NAV_ADMIN,
  NAV_FOOTER,
  NAV_GROUPS,
  NAV_LAYOUT,
  NAV_UTILITIES,
  getNavItemById,
  type NavItem,
} from "@/config/navigation";
import { usePrefs } from "@/lib/preferences";
import { useRbac } from "@/hooks/use-rbac";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ProgressCard } from "@/components/app/ProgressCard";
import { cn } from "@/lib/utils";

function Tab({ item }: { item: NavItem }) {
  const { t } = usePrefs();
  if (!item || !item.id || !item.to || !item.icon) return null;
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      activeOptions={{ exact: item.exact ?? false }}
      className="group flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-[0.65rem] font-semibold text-nav-foreground data-[status=active]:text-nav-active-foreground"
    >
      <span className="flex h-7 w-11 items-center justify-center rounded-full transition-colors group-data-[status=active]:bg-nav-active">
        <Icon
          style={{ width: "var(--nav-mobile-icon-size)", height: "var(--nav-mobile-icon-size)" }}
          strokeWidth={1.9}
        />
      </span>
      <span className="max-w-full truncate px-0.5">{t(item.label)}</span>
    </Link>
  );
}

export function MobileNav() {
  const { t, effectiveUiExperience, effectiveLayoutMode, effectiveBtcNavLayout } = usePrefs();
  const rbac = useRbac();
  const [open, setOpen] = useState(false);

  if (effectiveBtcNavLayout === "modern") {
    return null;
  }

  const cfg = NAV_LAYOUT.mobile;
  const tabs = (cfg.tabs || [])
    .map(getNavItemById)
    .filter((item): item is NavItem => Boolean(item && item.id && item.to));
  const isModernNav = effectiveLayoutMode === "top_nav";
  const center =
    effectiveUiExperience === "editorial_atelier"
      ? null
      : cfg.centerAction
        ? (getNavItemById(cfg.centerAction) ?? null)
        : null;
  const shownInBarIds = new Set([...tabs.map((tab) => tab.id), ...(center?.id ? [center.id] : [])]);
  const half = Math.ceil(tabs.length / 2);
  const floating =
    isModernNav ||
    (effectiveUiExperience === "classic"
      ? cfg.style === "floating"
      : effectiveUiExperience === "command_os" || effectiveUiExperience === "focus_deck");
  const CenterIcon = center?.icon;

  return (
    <>
      <nav
        className={cn(
          "glass fixed z-40 flex items-center border border-border shadow-[var(--shadow-card)] md:hidden transition-all duration-200",
          floating
            ? "inset-x-3 sm:inset-x-6 border-primary/30 backdrop-blur-xl shadow-2xl"
            : "inset-x-0 border-x-0 border-b-0",
          effectiveUiExperience === "editorial_atelier" &&
            "bg-background/95 border-t border-border",
        )}
        style={{
          height: "var(--nav-mobile-height)",
          borderRadius:
            effectiveUiExperience === "editorial_atelier"
              ? 0
              : floating
                ? isModernNav
                  ? "1.25rem"
                  : "var(--nav-mobile-radius)"
                : 0,
          bottom: floating ? "calc(env(safe-area-inset-bottom) + 0.5rem)" : 0,
        }}
        aria-label={t("nav.home")}
      >
        {tabs.slice(0, half).map((i) => (
          <Tab key={i.id} item={i} />
        ))}
        {center && CenterIcon && (
          <Link
            to={center.to}
            aria-label={t(center.label)}
            className="-mt-7 flex shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow ring-4 ring-background"
            style={{ width: "var(--nav-fab-size)", height: "var(--nav-fab-size)" }}
          >
            <CenterIcon className="size-5.5" strokeWidth={2.2} />
          </Link>
        )}
        {tabs.slice(half).map((i) => (
          <Tab key={i.id} item={i} />
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("nav.more")}
          className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-[0.65rem] font-semibold text-nav-foreground"
        >
          <span className="flex h-7 w-11 items-center justify-center rounded-full">
            <LayoutGrid
              style={{
                width: "var(--nav-mobile-icon-size)",
                height: "var(--nav-mobile-icon-size)",
              }}
              strokeWidth={1.9}
            />
          </span>
          <span>{t("nav.more")}</span>
        </button>
      </nav>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[82dvh] overflow-y-auto rounded-t-3xl border-border bg-popover pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
        >
          <SheetHeader>
            <SheetTitle className="font-display">{t("nav.more")}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-4 pt-2">
            <ProgressCard />

            {/* Organized Domain Groups */}
            {[...NAV_GROUPS, ...EXTENDED_NAV_GROUPS].map((group) => {
              if (!group || !Array.isArray(group.items)) return null;
              const items = group.items.filter((i): i is NavItem =>
                Boolean(i && i.id && !shownInBarIds.has(i.id)),
              );
              if (items.length === 0) return null;
              return (
                <div key={group.id} className="space-y-2">
                  <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t(group.label)}
                  </p>
                  <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${cfg.moreColumns}, minmax(0, 1fr))` }}
                  >
                    {items.map((i) => {
                      if (!i || !i.id || !i.to || !i.icon) return null;
                      const Icon = i.icon;
                      return (
                        <Link
                          key={i.id}
                          to={i.to}
                          onClick={() => setOpen(false)}
                          className="group flex min-h-[44px] flex-col items-center gap-1.5 rounded-2xl p-2 text-center text-[0.7rem] font-medium text-muted-foreground data-[status=active]:text-nav-active-foreground"
                        >
                          <span className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface-2 group-data-[status=active]:bg-nav-active">
                            <Icon className="size-5" strokeWidth={1.9} />
                          </span>
                          <span className="leading-tight">{t(i.label)}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Settings, Help, Support & Staff Admin */}
            <div className="space-y-2 border-t border-border/70 pt-3">
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${cfg.moreColumns}, minmax(0, 1fr))` }}
              >
                {[...NAV_FOOTER, ...NAV_UTILITIES]
                  .filter((item): item is NavItem =>
                    Boolean(item && item.id && item.to && item.icon),
                  )
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="group flex min-h-[44px] flex-col items-center gap-1.5 rounded-2xl p-2 text-center text-[0.7rem] font-medium text-muted-foreground data-[status=active]:text-nav-active-foreground"
                      >
                        <span className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface-2 group-data-[status=active]:bg-nav-active">
                          <Icon className="size-5" strokeWidth={1.9} />
                        </span>
                        <span className="leading-tight">{t(item.label)}</span>
                      </Link>
                    );
                  })}
                {rbac.isStaff && (
                  <Link
                    to={NAV_ADMIN.to}
                    onClick={() => setOpen(false)}
                    className="group flex min-h-[44px] flex-col items-center gap-1.5 rounded-2xl p-2 text-center text-[0.7rem] font-semibold text-primary data-[status=active]:text-nav-active-foreground"
                  >
                    <span className="flex size-12 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 group-data-[status=active]:bg-nav-active">
                      <NAV_ADMIN.icon className="size-5 text-primary" strokeWidth={1.9} />
                    </span>
                    <span className="leading-tight">{t(NAV_ADMIN.label)}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
