import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import {
  ALL_NAV_ITEMS,
  NAV_ADMIN,
  NAV_LAYOUT,
  getNavItemById,
  type NavItem,
} from "@/config/navigation";
import { usePrefs } from "@/lib/preferences";
import { useRbac } from "@/hooks/use-rbac";

function Tab({ item }: { item: NavItem }) {
  const { lang, t } = usePrefs();
  if (!item || !item.id || !item.to || !item.icon) return null;
  const Icon = item.icon;
  const label = lang === "ar" ? (item.labelAr ?? t(item.label)) : (item.labelEn ?? t(item.label));

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
      <span className="max-w-full truncate px-0.5">{label}</span>
    </Link>
  );
}

export function MobileNav() {
  const { t, lang } = usePrefs();
  const rbac = useRbac();
  const [moreOpen, setMoreOpen] = useState(false);

  const tabs = (NAV_LAYOUT.mobile.tabs || [])
    .map(getNavItemById)
    .filter((item): item is NavItem => Boolean(item && item.id && item.to));

  const drawerItems = ALL_NAV_ITEMS.filter(
    (item) => (!item.staffOnly || rbac.isStaff) && item.id !== NAV_ADMIN.id,
  );

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="max-h-[75dvh] overflow-y-auto rounded-t-2xl border-t border-border bg-surface p-4 pb-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between border-b border-border/70 pb-2.5">
              <span className="font-display text-sm font-bold text-foreground">
                {lang === "ar" ? "جميع الأقسام" : "All Modules"}
              </span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label={t("common.cancel")}
                className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {drawerItems.map((item) => {
                const Icon = item.icon;
                const label = lang === "ar" ? item.labelAr : item.labelEn;
                return (
                  <Link
                    key={item.id}
                    to={item.to}
                    activeOptions={{ exact: item.exact ?? false }}
                    onClick={() => setMoreOpen(false)}
                    className="flex min-h-[44px] items-center gap-2.5 rounded-xl border border-border/70 bg-surface-2/60 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 data-[status=active]:border-primary data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
                  >
                    <Icon className="size-4 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1 break-words leading-snug">{label}</span>
                  </Link>
                );
              })}
              {rbac.isStaff && (
                <Link
                  to={NAV_ADMIN.to}
                  onClick={() => setMoreOpen(false)}
                  className="flex min-h-[44px] items-center gap-2.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"
                >
                  <NAV_ADMIN.icon className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1 break-words leading-snug">
                    {lang === "ar" ? NAV_ADMIN.labelAr : NAV_ADMIN.labelEn}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <nav
        className="glass fixed inset-x-0 bottom-0 z-40 flex items-center border-t border-border bg-surface/95 px-1 md:hidden"
        style={{ height: "var(--nav-mobile-height)", paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label={t("nav.home")}
      >
        {tabs.map((item) => (
          <Tab key={item.id} item={item} />
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-label={lang === "ar" ? "المزيد" : "More"}
          className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-[0.65rem] font-semibold text-nav-foreground hover:text-foreground"
        >
          <span className="flex h-7 w-11 items-center justify-center rounded-full">
            <Menu
              style={{
                width: "var(--nav-mobile-icon-size)",
                height: "var(--nav-mobile-icon-size)",
              }}
              strokeWidth={1.9}
            />
          </span>
          <span className="max-w-full truncate px-0.5">{lang === "ar" ? "المزيد" : "More"}</span>
        </button>
      </nav>
    </>
  );
}
