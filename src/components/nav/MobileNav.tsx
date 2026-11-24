import React from "react";
import { Link } from "@tanstack/react-router";
import { ALL_NAV_ITEMS, NAV_LAYOUT, getNavItemById, type NavItem } from "@/config/navigation";
import { usePrefs } from "@/lib/preferences";
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

  if (effectiveBtcNavLayout === "modern") {
    return null;
  }

  const cfg = NAV_LAYOUT.mobile;
  const tabs = (cfg.tabs || [])
    .map(getNavItemById)
    .filter((item): item is NavItem => Boolean(item && item.id && item.to));
  const isModernNav = effectiveLayoutMode === "top_nav";
  const rawCenter =
    effectiveUiExperience === "editorial_atelier"
      ? null
      : cfg.centerAction
        ? (getNavItemById(cfg.centerAction) ?? null)
        : null;
  const center = rawCenter && rawCenter.id && rawCenter.to ? rawCenter : null;
  const half = Math.ceil(tabs.length / 2);
  const floating =
    isModernNav ||
    (effectiveUiExperience === "classic"
      ? cfg.style === "floating"
      : effectiveUiExperience === "command_os" || effectiveUiExperience === "focus_deck");
  const CenterIcon = center?.icon;

  return (
    <nav
      className={cn(
        "glass fixed z-40 flex items-center border border-border shadow-[var(--shadow-card)] md:hidden transition-all duration-200",
        floating
          ? "inset-x-3 sm:inset-x-6 border-primary/30 backdrop-blur-xl shadow-2xl"
          : "inset-x-0 border-x-0 border-b-0",
        effectiveUiExperience === "editorial_atelier" && "bg-background/95 border-t border-border",
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
    </nav>
  );
}
