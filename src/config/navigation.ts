/**
 * NAVIGATION CONFIG — Flat, simple single-level source of truth for BTC.
 */
import {
  BookOpen,
  BookOpenCheck,
  Briefcase,
  CheckSquare,
  Compass,
  Globe,
  Heart,
  HelpCircle,
  Home,
  Languages,
  Settings,
  Shield,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { DictKey } from "@/lib/i18n-dict";

export type NavTo =
  | "/app"
  | "/app/study"
  | "/app/skills"
  | "/app/tasks"
  | "/app/care"
  | "/app/future"
  | "/app/circle"
  | "/app/opportunities"
  | "/app/english"
  | "/app/quran"
  | "/app/ai"
  | "/app/help"
  | "/app/settings"
  | "/app/admin";

export interface NavItem {
  id: string;
  to: NavTo;
  label: DictKey;
  labelEn: string;
  labelAr: string;
  icon: LucideIcon;
  exact?: boolean;
  staffOnly?: boolean;
}

export interface NavGroup {
  id: string;
  label: DictKey;
  items: NavItem[];
}

export const NAV_PRIMARY_ITEMS: NavItem[] = [
  {
    id: "home",
    to: "/app",
    label: "nav.home",
    labelEn: "Home",
    labelAr: "الرئيسية",
    icon: Home,
    exact: true,
  },
  {
    id: "study",
    to: "/app/study",
    label: "nav.study",
    labelEn: "Study & Academics",
    labelAr: "الدراسة والأكاديميات",
    icon: BookOpen,
  },
  {
    id: "skills",
    to: "/app/skills",
    label: "nav.study",
    labelEn: "Skills Academy",
    labelAr: "أكاديمية المهارات",
    icon: Compass,
  },
  {
    id: "tasks",
    to: "/app/tasks",
    label: "nav.tasks",
    labelEn: "Productivity & Focus",
    labelAr: "الإنتاجية والتركيز",
    icon: CheckSquare,
  },
  {
    id: "care",
    to: "/app/care",
    label: "nav.care",
    labelEn: "Personal Growth",
    labelAr: "النمو الشخصي",
    icon: Heart,
  },
  {
    id: "future",
    to: "/app/future",
    label: "nav.future",
    labelEn: "Future & Careers",
    labelAr: "المستقبل والمهن",
    icon: Briefcase,
  },
  {
    id: "circle",
    to: "/app/circle",
    label: "nav.circle",
    labelEn: "Knowledge Circle",
    labelAr: "حلقة المعرفة",
    icon: Users,
  },
  {
    id: "opportunities",
    to: "/app/opportunities",
    label: "nav.radar",
    labelEn: "Opportunity Radar",
    labelAr: "رادار الفرص",
    icon: Globe,
  },
  {
    id: "english",
    to: "/app/english",
    label: "nav.english",
    labelEn: "English World",
    labelAr: "عالم الإنجليزية",
    icon: Languages,
  },
  {
    id: "quran",
    to: "/app/quran",
    label: "nav.quran",
    labelEn: "Quran & Islamic Center",
    labelAr: "القرآن والمركز الإسلامي",
    icon: BookOpenCheck,
  },
];

export const NAV_SECONDARY_ITEMS: NavItem[] = [
  {
    id: "ai",
    to: "/app/ai",
    label: "nav.ai",
    labelEn: "BTC AI",
    labelAr: "BTC الذكي",
    icon: Sparkles,
  },
  {
    id: "help",
    to: "/app/help",
    label: "nav.helpCenter",
    labelEn: "Help Center",
    labelAr: "مركز المساعدة",
    icon: HelpCircle,
  },
  {
    id: "settings",
    to: "/app/settings",
    label: "nav.settings",
    labelEn: "Settings",
    labelAr: "الإعدادات",
    icon: Settings,
  },
];

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "all",
    label: "nav.group.core",
    items: NAV_PRIMARY_ITEMS,
  },
];

export const EXTENDED_NAV_GROUPS: NavGroup[] = [];

export const NAV_FOOTER: NavItem[] = [NAV_SECONDARY_ITEMS[2]!];

export const NAV_UTILITIES: NavItem[] = [NAV_SECONDARY_ITEMS[0]!, NAV_SECONDARY_ITEMS[1]!];

export const NAV_ADMIN: NavItem = {
  id: "admin",
  to: "/app/admin",
  label: "nav.adminCenter",
  labelEn: "Moderation & Admin",
  labelAr: "الإشراف والإدارة",
  icon: Shield,
  staffOnly: true,
};

export const PRIMARY_TOP_NAV_IDS = ["home", "study", "skills", "tasks", "circle", "quran"] as const;

export const ALL_NAV_ITEMS: NavItem[] = [...NAV_PRIMARY_ITEMS, ...NAV_SECONDARY_ITEMS, NAV_ADMIN];

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
  "/app": { labelEn: "Home", labelAr: "الرئيسية" },
  "/app/study": { labelEn: "Study & Academics", labelAr: "الدراسة والأكاديميات" },
  "/app/skills": { labelEn: "Skills Academy", labelAr: "أكاديمية المهارات" },
  "/app/tasks": { labelEn: "Productivity & Focus", labelAr: "الإنتاجية والتركيز" },
  "/app/care": { labelEn: "Personal Growth", labelAr: "النمو الشخصي" },
  "/app/future": { labelEn: "Future & Careers", labelAr: "المستقبل والمهن" },
  "/app/circle": { labelEn: "Knowledge Circle", labelAr: "حلقة المعرفة" },
  "/app/opportunities": { labelEn: "Opportunity Radar", labelAr: "رادار الفرص" },
  "/app/english": { labelEn: "English World", labelAr: "عالم الإنجليزية" },
  "/app/quran": { labelEn: "Quran & Islamic Center", labelAr: "القرآن والمركز الإسلامي" },
  "/app/ai": { labelEn: "BTC AI", labelAr: "BTC الذكي" },
  "/app/help": { labelEn: "Help Center", labelAr: "مركز المساعدة" },
  "/app/support": { labelEn: "Help & Support", labelAr: "المساعدة والدعم" },
  "/app/settings": { labelEn: "Settings", labelAr: "الإعدادات" },
  "/app/admin": { labelEn: "Moderation & Admin", labelAr: "الإشراف والإدارة" },
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

export const NAV_LAYOUT = {
  sidebar: {
    variant: "flat" as "grouped" | "flat",
    collapsible: true,
    showGroupLabels: false,
    showProgressCard: false,
  },
  mobile: {
    style: "docked" as "floating" | "docked",
    tabs: ["home", "study", "tasks", "circle"],
    centerAction: null as string | null,
    moreColumns: 2,
  },
};
