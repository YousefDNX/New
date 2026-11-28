import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { usePrefs } from "@/lib/preferences";
import type { NavItem } from "@/config/navigation";

interface Props {
  item: NavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
}

export function NavItemLink({ item, collapsed, onNavigate, className }: Props) {
  const { t, lang, effectiveMenuStyle } = usePrefs();
  if (!item || !item.id || !item.to || !item.icon) {
    return null;
  }
  const Icon = item.icon;
  const label = lang === "ar" ? (item.labelAr ?? t(item.label)) : (item.labelEn ?? t(item.label));

  const styleClasses =
    effectiveMenuStyle === "glass_pills"
      ? "rounded-full hover:bg-primary/10 data-[status=active]:bg-primary/18 data-[status=active]:backdrop-blur-md data-[status=active]:ring-1 data-[status=active]:ring-primary/35"
      : effectiveMenuStyle === "minimal_underline"
        ? "rounded-none border-b border-transparent hover:border-border/80 hover:bg-transparent data-[status=active]:border-primary data-[status=active]:bg-transparent"
        : effectiveMenuStyle === "editorial_tab"
          ? "rounded-lg border border-transparent hover:border-border data-[status=active]:border-primary/45 data-[status=active]:bg-primary/8"
          : effectiveMenuStyle === "floating_cards"
            ? "rounded-xl border border-border/50 bg-surface-2/40 shadow-xs hover:border-primary/35 hover:bg-surface-2 data-[status=active]:border-primary/50 data-[status=active]:bg-primary/12 data-[status=active]:shadow-sm"
            : "hover:bg-surface-2/80 data-[status=active]:bg-primary/10";

  return (
    <Link
      to={item.to}
      activeOptions={{ exact: item.exact ?? false }}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-1.5 text-[0.84rem] font-medium leading-snug text-nav-foreground transition-all",
        "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "data-[status=active]:font-semibold data-[status=active]:text-primary",
        styleClasses,
        collapsed && "justify-center px-0",
        className,
      )}
      style={{
        minHeight: "var(--nav-item-height)",
        ...(effectiveMenuStyle === "classic_rail"
          ? { borderRadius: "var(--nav-item-radius)" }
          : {}),
      }}
    >
      <Icon
        style={{ width: "var(--nav-icon-size)", height: "var(--nav-icon-size)" }}
        className="shrink-0 transition-transform duration-150 group-hover:scale-105"
        strokeWidth={1.9}
      />
      {!collapsed && <span className="min-w-0 flex-1 break-words leading-snug">{label}</span>}
    </Link>
  );
}
