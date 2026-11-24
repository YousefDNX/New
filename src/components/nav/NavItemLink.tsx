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

/** One reusable nav row. Styling comes from --nav-* tokens. */
export function NavItemLink({ item, collapsed, onNavigate, className }: Props) {
  const { t } = usePrefs();
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      activeOptions={{ exact: item.exact ?? false }}
      onClick={onNavigate}
      title={collapsed ? t(item.label) : undefined}
      className={cn(
        "group relative flex items-center gap-3 px-3 text-[0.84rem] font-medium text-nav-foreground transition-colors",
        "hover:bg-surface-2/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "data-[status=active]:bg-primary/10 data-[status=active]:font-semibold data-[status=active]:text-primary",
        collapsed && "justify-center px-0",
        className,
      )}
      style={{ height: "var(--nav-item-height)", borderRadius: "var(--nav-item-radius)" }}
    >
      <span className="absolute inset-y-2 start-0 w-[2.5px] rounded-full bg-primary opacity-0 transition-opacity group-data-[status=active]:opacity-100" />
      <Icon
        style={{ width: "var(--nav-icon-size)", height: "var(--nav-icon-size)" }}
        className="shrink-0"
        strokeWidth={1.9}
      />
      {!collapsed && <span className="truncate">{t(item.label)}</span>}
    </Link>
  );
}
