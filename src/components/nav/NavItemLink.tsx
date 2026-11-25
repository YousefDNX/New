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
  const { t, lang } = usePrefs();
  if (!item || !item.id || !item.to || !item.icon) {
    return null;
  }
  const Icon = item.icon;
  const label = lang === "ar" ? (item.labelAr ?? t(item.label)) : (item.labelEn ?? t(item.label));

  return (
    <Link
      to={item.to}
      activeOptions={{ exact: item.exact ?? false }}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-1.5 text-[0.84rem] font-medium leading-snug text-nav-foreground transition-colors",
        "hover:bg-surface-2/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "data-[status=active]:bg-primary/10 data-[status=active]:font-semibold data-[status=active]:text-primary",
        collapsed && "justify-center px-0",
        className,
      )}
      style={{ minHeight: "var(--nav-item-height)", borderRadius: "var(--nav-item-radius)" }}
    >
      <span className="absolute inset-y-2 start-0 w-[2.5px] rounded-full bg-primary opacity-0 transition-opacity group-data-[status=active]:opacity-100" />
      <Icon
        style={{ width: "var(--nav-icon-size)", height: "var(--nav-icon-size)" }}
        className="shrink-0"
        strokeWidth={1.9}
      />
      {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
    </Link>
  );
}
