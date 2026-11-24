import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NAV_ADMIN, NAV_GROUPS, NAV_FOOTER, NAV_LAYOUT, NAV_UTILITIES } from "@/config/navigation";
import { NavItemLink } from "./NavItemLink";
import { ProgressCard } from "@/components/app/ProgressCard";
import { Logo } from "@/components/app/Logo";
import { NotificationCenter } from "./NotificationCenter";
import { UserMenu } from "./UserMenu";
import { usePrefs } from "@/lib/preferences";
import { useRbac } from "@/hooks/use-rbac";
import { getLayoutModeById } from "@/lib/theme-catalog";
import { cn } from "@/lib/utils";

const CORE_IDS = new Set(["home", "ai", "study", "tasks"]);
const HIDE_SIDEBAR_NAV_POSITIONS = new Set(["top", "bottom", "none"]);

export function Sidebar() {
  const { t, effectiveLayout, effectiveLayoutMode, effectiveUiExperience, effectiveBtcNavLayout } =
    usePrefs();
  const rbac = useRbac();
  const [collapsed, setCollapsed] = useState(() => effectiveLayout.sidebarMode === "compact");
  const [showAllInSimplified, setShowAllInSimplified] = useState(false);

  useEffect(() => {
    setCollapsed(effectiveLayout.sidebarMode === "compact");
    if (effectiveLayout.sidebarMode !== "simplified") {
      setShowAllInSimplified(false);
    }
  }, [effectiveLayout.sidebarMode]);

  if (effectiveBtcNavLayout === "modern" || effectiveUiExperience !== "classic") {
    return null;
  }

  const layoutSpec = getLayoutModeById(effectiveLayoutMode);
  if (HIDE_SIDEBAR_NAV_POSITIONS.has(layoutSpec.navPosition)) {
    return null;
  }

  const isRightRail = layoutSpec.navPosition === "right";
  const cfg = NAV_LAYOUT.sidebar;
  const simplifiedMode = effectiveLayout.sidebarMode === "simplified";

  return (
    <aside
      data-app-sidebar="true"
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-border/80 bg-surface/95 backdrop-blur-md transition-[width] duration-200 md:flex",
        isRightRail ? "order-last border-s" : "border-e",
      )}
      style={{ width: collapsed ? "var(--nav-sidebar-collapsed)" : "var(--nav-sidebar-width)" }}
    >
      <div
        className={cn(
          "flex h-14 items-center px-4",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <Logo compact={collapsed} />
        {cfg.collapsible && !collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            aria-label={t("common.collapse")}
          >
            <PanelLeftClose className="size-4 rtl-flip" />
          </button>
        )}
      </div>
      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="mx-auto mb-2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          aria-label={t("common.expand")}
        >
          <PanelLeftOpen className="size-4 rtl-flip" />
        </button>
      )}
      <nav
        aria-label={t("nav.home")}
        className="flex-1 overflow-y-auto px-2.5 pb-3 pt-1"
        style={{ display: "flex", flexDirection: "column", gap: "var(--nav-group-gap)" }}
      >
        {NAV_GROUPS.map((g) => {
          if (!g || !Array.isArray(g.items)) return null;
          const validItems = g.items.filter((item) =>
            Boolean(item && item.id && item.to && item.icon),
          );
          const items =
            simplifiedMode && !showAllInSimplified
              ? validItems.filter((item) => CORE_IDS.has(item.id))
              : validItems;
          if (items.length === 0) return null;
          return (
            <div key={g.id} className="flex flex-col" style={{ gap: "var(--nav-item-gap)" }}>
              {cfg.showGroupLabels &&
                !collapsed &&
                cfg.variant === "grouped" &&
                !simplifiedMode && (
                  <div className="px-3 pb-1 text-[11px] font-semibold text-muted-foreground/75">
                    {t(g.label)}
                  </div>
                )}
              {items.map((i) => (
                <NavItemLink key={i.id} item={i} collapsed={collapsed} />
              ))}
            </div>
          );
        })}

        {simplifiedMode && !collapsed && (
          <button
            type="button"
            onClick={() => setShowAllInSimplified((v) => !v)}
            className="flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          >
            <span>{showAllInSimplified ? t("nav.less") : t("nav.more")}</span>
            <ChevronDown
              className={`size-3.5 transition-transform ${showAllInSimplified ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </nav>
      <div className="space-y-2 border-t border-border/80 p-2.5">
        {cfg.showProgressCard && !simplifiedMode && <ProgressCard compact={collapsed} />}
        <div
          className={cn("flex items-center", collapsed ? "justify-center" : "justify-between px-1")}
        >
          <NotificationCenter compact={collapsed} />
        </div>
        {NAV_FOOTER.filter((i) => Boolean(i && i.id && i.to && i.icon)).map((i) => (
          <NavItemLink key={i.id} item={i} collapsed={collapsed} />
        ))}
        <div className="flex flex-col gap-1 border-t border-border/60 pt-1.5">
          {NAV_UTILITIES.filter((item) => Boolean(item && item.id && item.to && item.icon)).map(
            (item) => (
              <NavItemLink key={item.id} item={item} collapsed={collapsed} />
            ),
          )}
          {rbac.isStaff && (
            <Link
              to={NAV_ADMIN.to}
              title={collapsed ? t(NAV_ADMIN.label) : undefined}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-1.5 text-[0.84rem] font-semibold leading-snug text-primary transition-colors",
                "hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "data-[status=active]:bg-primary/15",
                collapsed && "justify-center px-0",
              )}
              style={{
                minHeight: "var(--nav-item-height)",
                borderRadius: "var(--nav-item-radius)",
              }}
            >
              <NAV_ADMIN.icon
                style={{ width: "var(--nav-icon-size)", height: "var(--nav-icon-size)" }}
                className="shrink-0 text-primary"
                strokeWidth={1.9}
              />
              {!collapsed && (
                <span className="min-w-0 flex-1 break-words">{t(NAV_ADMIN.label)}</span>
              )}
            </Link>
          )}
        </div>
        <UserMenu compact={collapsed} />
      </div>
    </aside>
  );
}
