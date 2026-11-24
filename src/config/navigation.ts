/**
 * NAVIGATION CONFIG — single source of truth for every nav surface.
 * Reorder, regroup, rename (via i18n keys), swap icons, or choose which items
 * appear in the mobile bar here. Visual sizes/colors live in --nav-* tokens in styles.css.
 */
import {
  Sparkles,
  Map,
  BookOpen,
  BookOpenCheck,
  CheckSquare,
  Trophy,
  Languages,
  Users,
  Settings,
  HelpCircle,
  MessageSquare,
  Shield,
  type LucideIcon,
} from "lucide-react";
import type { DictKey } from "@/lib/i18n-dict";

export type NavTo =
  | "/app"
  | "/app/ai"
  | "/app/study"
  | "/app/english"
  | "/app/tasks"
  | "/app/level-up"
  | "/app/quran"
  | "/app/circle"
  | "/app/settings"
  | "/app/help"
  | "/app/support"
  | "/app/admin";

export interface NavItem {
  id: string;
  to: NavTo;
  label: DictKey;
  icon: LucideIcon;
  exact?: boolean;
  staffOnly?: boolean;
}

export interface NavGroup {
  id: string;
  label: DictKey;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "core",
    label: "nav.group.core",
    items: [
      { id: "home", to: "/app", label: "nav.home", icon: Map, exact: true },
      { id: "ai", to: "/app/ai", label: "nav.ai", icon: Sparkles },
    ],
  },
  {
    id: "learn",
    label: "nav.group.learn",
    items: [{ id: "study", to: "/app/study", label: "nav.study", icon: BookOpen }],
  },
  {
    id: "do",
    label: "nav.group.do",
    items: [
      { id: "tasks", to: "/app/tasks", label: "nav.tasks", icon: CheckSquare },
      { id: "circle", to: "/app/circle", label: "nav.circle", icon: Users },
    ],
  },
  {
    id: "self",
    label: "nav.group.self",
    items: [{ id: "quran", to: "/app/quran", label: "nav.quran", icon: BookOpenCheck }],
  },
];

export const EXTENDED_NAV_GROUPS: NavGroup[] = [];

export const NAV_FOOTER: NavItem[] = [
  { id: "settings", to: "/app/settings", label: "nav.settings", icon: Settings },
];

export const NAV_UTILITIES: NavItem[] = [
  { id: "help", to: "/app/help", label: "nav.helpCenter", icon: HelpCircle },
  { id: "support", to: "/app/support", label: "nav.support", icon: MessageSquare },
];

export const NAV_ADMIN: NavItem = {
  id: "admin",
  to: "/app/admin",
  label: "nav.adminCenter",
  icon: Shield,
  staffOnly: true,
};

export const PRIMARY_TOP_NAV_IDS = ["home", "ai", "study", "tasks", "circle", "quran"] as const;

export const ALL_NAV_ITEMS: NavItem[] = [
  ...NAV_GROUPS.flatMap((g) => g.items),
  ...EXTENDED_NAV_GROUPS.flatMap((g) => g.items),
  ...NAV_FOOTER,
  ...NAV_UTILITIES,
  NAV_ADMIN,
].filter(
  (item, idx, arr): item is NavItem =>
    Boolean(item && typeof item.id === "string" && typeof item.to === "string") &&
    arr.findIndex((other) => other.id === item.id) === idx,
);

export function getNavItemById(id: string): NavItem | undefined {
  if (!id) return undefined;
  return ALL_NAV_ITEMS.find((i) => i.id === id);
}

export interface RouteMetaEntry {
  labelKey?: DictKey;
  labelEn: string;
  labelAr: string;
  groupLabelKey?: DictKey;
}

export const ROUTE_META: Record<string, RouteMetaEntry> = {
  "/app": { labelKey: "nav.home", labelEn: "Home", labelAr: "الرئيسية" },
  "/app/ai": {
    labelKey: "nav.ai",
    labelEn: "BTC AI",
    labelAr: "BTC الذكي",
    groupLabelKey: "nav.group.core",
  },
  "/app/study": {
    labelKey: "nav.study",
    labelEn: "Study",
    labelAr: "الدراسة",
    groupLabelKey: "nav.group.learn",
  },
  "/app/tasks": {
    labelKey: "nav.tasks",
    labelEn: "My Tasks",
    labelAr: "مهامي",
    groupLabelKey: "nav.group.do",
  },
  "/app/circle": {
    labelKey: "nav.circle",
    labelEn: "Knowledge Circle",
    labelAr: "حلقة المعرفة",
    groupLabelKey: "nav.group.do",
  },
  "/app/quran": {
    labelKey: "nav.quran",
    labelEn: "Quran & Islamic",
    labelAr: "القرآن الكريم",
    groupLabelKey: "nav.group.self",
  },
  "/app/settings": { labelKey: "nav.settings", labelEn: "Settings", labelAr: "الإعدادات" },
  "/app/help": { labelKey: "nav.helpCenter", labelEn: "Help Center", labelAr: "مركز المساعدة" },
  "/app/support": { labelKey: "nav.support", labelEn: "Support", labelAr: "الدعم الفني" },
  "/app/admin": {
    labelKey: "nav.adminCenter",
    labelEn: "Admin Center",
    labelAr: "لوحة الإدارة",
  },
};

export function resolveRouteMeta(pathname: string): RouteMetaEntry | null {
  const clean = pathname.replace(/\/+$/, "") || "/app";
  if (ROUTE_META[clean]) return ROUTE_META[clean];
  const segments = clean.split("/");
  if (segments.length >= 3) {
    const base = `/${segments[1]}/${segments[2]}`;
    if (ROUTE_META[base]) return ROUTE_META[base];
  }
  return null;
}

/** Layout options — change to restyle without touching components. */
export const NAV_LAYOUT = {
  sidebar: {
    variant: "grouped" as "grouped" | "flat",
    collapsible: true,
    showGroupLabels: true,
    showProgressCard: true,
  },
  mobile: {
    style: "floating" as "floating" | "docked",
    /** item ids shown in the bar; others go into the "More" sheet */
    tabs: ["home", "study", "tasks", "circle", "quran"],
    /** item id for the raised center button (null to disable) */
    centerAction: "ai" as string | null,
    moreColumns: 3,
  },
};
