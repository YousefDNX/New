import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NAV_ADMIN, NAV_FOOTER, NAV_PRIMARY_ITEMS, NAV_UTILITIES } from "@/config/navigation";
import { NavItemLink } from "./NavItemLink";
import { Logo } from "@/components/app/Logo";
import { UserMenu } from "./UserMenu";
import { usePrefs } from "@/lib/preferences";
import { useRbac } from "@/hooks/use-rbac";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { t, lang, effectiveLayout, effectiveMenuStyle } = usePrefs();
  const rbac = useRbac();
  const [collapsed, setCollapsed] = useState(() => effectiveLayout.sidebarMode === "compact");

  useEffect(() => {
    setCollapsed(effectiveLayout.sidebarMode === "compact");
  }, [effectiveLayout.sidebarMode]);

  return (
    <aside
      data-app-sidebar="true"
      data-menu-style={effectiveMenuStyle}
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-e border-border/80 bg-surface/95 backdrop-blur-md transition-[width] duration-200 md:flex",
        effectiveMenuStyle === "floating_cards" && "bg-surface/90",
      )}
      style={{ width: collapsed ? "var(--nav-sidebar-collapsed)" : "var(--nav-sidebar-width)" }}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b border-border/60 px-4",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <Logo compact={collapsed} />
        {!collapsed && (
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
          className="mx-auto my-2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          aria-label={t("common.expand")}
        >
          <PanelLeftOpen className="size-4 rtl-flip" />
        </button>
      )}

      <nav
        aria-label={t("nav.home")}
        className={cn(
          "flex flex-1 flex-col overflow-y-auto px-2.5 pb-3 pt-2.5",
          effectiveMenuStyle === "floating_cards" ? "gap-1.5" : "gap-1",
        )}
      >
        {NAV_PRIMARY_ITEMS.map((item) => (
          <NavItemLink key={item.id} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="space-y-1 border-t border-border/80 p-2.5">
        {[...NAV_UTILITIES, ...NAV_FOOTER].map((item) => (
          <NavItemLink key={item.id} item={item} collapsed={collapsed} />
        ))}
        {rbac.isStaff && (
          <Link
            to={NAV_ADMIN.to}
            title={collapsed ? (lang === "ar" ? NAV_ADMIN.labelAr : NAV_ADMIN.labelEn) : undefined}
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
              <span className="min-w-0 flex-1 break-words leading-snug">
                {lang === "ar" ? NAV_ADMIN.labelAr : NAV_ADMIN.labelEn}
              </span>
            )}
          </Link>
        )}
        <div className="pt-1">
          <UserMenu compact={collapsed} />
        </div>
      </div>
    </aside>
  );
}
