import type { Lang } from "./i18n-dict";
import { normalizeLang as normalizeSupportedLang } from "./i18n/types.ts";
import type { CalendarPref, DateFormatPref, TimeFormatPref } from "./locale-format";
import { BRAND } from "../config/brand.ts";

export const REGIONS = ["kuwait", "gcc", "global"] as const;
export type Region = (typeof REGIONS)[number];
export const FONT_MIN = 0.9;
export const FONT_MAX = 1.5;

export const HEADING_SCALE_MIN = 0.85;
export const HEADING_SCALE_MAX = 1.35;
export const LINE_HEIGHT_MIN = 1.25;
export const LINE_HEIGHT_MAX = 2.1;
export const LETTER_SPACING_MIN = -0.03;
export const LETTER_SPACING_MAX = 0.08;

export type Theme = "dark" | "light";
export type ThemeMode = "dark" | "light" | "system";

export type BtcVisualTheme = "btc_original" | "btc_alternative";
export type BtcNavLayout = "classic" | "modern";

export type InterfaceTheme =
  | "classic"
  | "btc_alternative"
  | "aurora_glass"
  | "aurora"
  | "minimal"
  | "soft_modern"
  | "creative_neon"
  | "focus"
  | "creative"
  | "nordic_frost"
  | "sepia_study"
  | "cyber_matrix"
  | "midnight_purple";
export type CardStylePref = "elevated" | "flat" | "glass";
export type BorderStylePref = "subtle" | "crisp" | "minimal";
export type ShadowLevelPref = "none" | "soft" | "rich";
export type AnimationLevelPref = "full" | "subtle" | "none";
export type BgStylePref = "ambient" | "solid" | "grid";
export type AccentPreset = "teal" | "indigo" | "emerald" | "amber" | "rose" | "custom";
export type DensityPref = "compact" | "comfortable" | "spacious";
export type CornerPref = "sharp" | "rounded" | "soft";
export type FontFamilyPref =
  "nexora" | "humanist" | "compact" | "serif" | "arabic" | "cjk" | "accessible";
export type FontWeightPref = "regular" | "medium";
export type ReadabilityPresetId =
  "standard" | "comfortable" | "large" | "compact" | "accessibility" | "custom";
export type LayoutWorkspaceId = "balanced" | "study" | "productivity" | "minimal";
export type SidebarModePref = "expanded" | "compact" | "simplified";
export type ReadingLayoutPref = "standard" | "focused";
export type DashboardTabPref = "dashboard" | "growthmap" | "history" | "journal" | "overview";

export const INTERFACE_THEMES: readonly InterfaceTheme[] = [
  "classic",
  "btc_alternative",
  "aurora_glass",
  "aurora",
  "minimal",
  "soft_modern",
  "creative_neon",
  "focus",
  "creative",
  "nordic_frost",
  "sepia_study",
  "cyber_matrix",
  "midnight_purple",
] as const;

export const FONT_FAMILIES: readonly FontFamilyPref[] = [
  "nexora",
  "humanist",
  "compact",
  "serif",
  "arabic",
  "cjk",
  "accessible",
] as const;

export const READABILITY_PRESETS: readonly ReadabilityPresetId[] = [
  "standard",
  "comfortable",
  "large",
  "compact",
  "accessibility",
  "custom",
] as const;

export const LAYOUT_WORKSPACES: readonly LayoutWorkspaceId[] = [
  "balanced",
  "study",
  "productivity",
  "minimal",
] as const;

export const DASHBOARD_WIDGET_IDS = [
  "welcome",
  "stats",
  "pomodoro",
  "areas",
  "tasks",
  "goals",
  "activity",
  "hub",
] as const;
export type DashboardWidgetId = (typeof DASHBOARD_WIDGET_IDS)[number];

export interface A11y {
  fontScale: number;
  dyslexia: boolean;
  contrast: boolean;
  reduceMotion: boolean;
  focusRing?: boolean | undefined;
  simplified?: boolean | undefined;
  clearLanguage?: boolean | undefined;
  readAloud?: boolean | undefined;
  readAloudRate?: number | undefined;
  voiceInput?: boolean | undefined;
  captions?: boolean | undefined;
}

export interface A11yFull {
  fontScale: number;
  dyslexia: boolean;
  contrast: boolean;
  reduceMotion: boolean;
  focusRing: boolean;
  simplified: boolean;
  clearLanguage: boolean;
  readAloud: boolean;
  readAloudRate: number;
  voiceInput: boolean;
  captions: boolean;
}

export interface AppearancePrefs {
  uiTheme: InterfaceTheme;
  accent: AccentPreset;
  customAccentHex: string;
  density: DensityPref;
  cornerStyle: CornerPref;
  cardStyle: CardStylePref;
  borderStyle: BorderStylePref;
  shadowLevel: ShadowLevelPref;
  animationLevel: AnimationLevelPref;
  bgStyle: BgStylePref;
  fontFamily: FontFamilyPref;
  reduceVisualEffects: boolean;
  readingLayout: ReadingLayoutPref;
  defaultHomeTab: DashboardTabPref;
  hiddenWidgets: DashboardWidgetId[];
  widgetOrder: DashboardWidgetId[];
}

export interface TypographyPrefs {
  fontFamily: FontFamilyPref;
  fontScale: number;
  headingScale: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight: FontWeightPref;
  readabilityPreset: ReadabilityPresetId;
}

export interface LayoutPrefs {
  workspace: LayoutWorkspaceId;
  sidebarMode: SidebarModePref;
  showQuickActions: boolean;
}

export interface LocalePrefs {
  timezone: string;
  dateFormat: DateFormatPref;
  timeFormat: TimeFormatPref;
  firstDayOfWeek: "sunday" | "monday" | "saturday";
  calendar: CalendarPref;
  units: "metric" | "imperial";
  opportunityScope: "local" | "gcc" | "global";
}

export interface StudyPrefs {
  explanationLanguage: "ui" | Lang;
  complexity: "simple" | "balanced" | "advanced";
  detailLevel: "concise" | "standard" | "detailed";
  stepByStep: boolean;
  examplesFirst: boolean;
  visualAids: boolean;
  practiceQuestions: boolean;
  flashcardStyle: "recall" | "spaced" | "cloze";
  quizDifficulty: "adaptive" | "foundation" | "challenge";
  sessionMinutes: number;
  breakMinutes: number;
  revisionReminders: boolean;
}

export interface AiPrefs {
  responseLanguage: "ui" | Lang;
  responseLength: "concise" | "standard" | "detailed";
  tone: "coach" | "calm" | "academic";
  clarifyingQuestions: boolean;
  shareProfile: boolean;
  shareTasks: boolean;
  shareGrowth: boolean;
  rememberPreferences: boolean;
  saveHistory: boolean;
  proactiveSuggestions: boolean;
  notifications: boolean;
}

export interface NotificationPrefs {
  reminders: boolean;
  tasks: boolean;
  calendar: boolean;
  streak: boolean;
  opportunities: boolean;
  community: boolean;
  teams: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  frequency: "instant" | "daily" | "weekly";
  quietHoursEnabled: boolean;
  quietStart: string;
  quietEnd: string;
}

export interface PrivacyPrefs {
  keepSignedIn: boolean;
  profileVisibility: "private" | "team";
  showInCircle: boolean;
}

export type EcosystemModelTier = "balanced" | "fast" | "stem" | "deep" | "deep_research";

export interface EcosystemPrefs {
  aiModelTier: EcosystemModelTier;
  searchGroundingDefault: boolean;
  voiceSpeed: number;
  mapsLocationConsent: boolean;
  scene3dReducedMotion: boolean;
  lowBandwidth: boolean;
  distractionFree: boolean;
}

export const ACCENT_PRESETS: Record<
  Exclude<AccentPreset, "custom">,
  { hex: string; glowHex: string; label: string }
> = {
  teal: { hex: "#14b8a6", glowHex: "#06b6d4", label: `${BRAND.shortName} Teal` },
  indigo: { hex: "#6366f1", glowHex: "#3b82f6", label: "Indigo Focus" },
  emerald: { hex: "#10b981", glowHex: "#14b8a6", label: "Emerald Growth" },
  amber: { hex: "#f59e0b", glowHex: "#f97316", label: "Warm Amber" },
  rose: { hex: "#f43f5e", glowHex: "#ec4899", label: "Coral Rose" },
};

export type QuizButtonStyle = "rounded" | "pill" | "soft_square";
export type QuizColorPalette = "default" | "ocean" | "emerald" | "royal" | "amber";
export type QuizFeedbackStyle = "celebration" | "balanced" | "minimal";
export type InteractionStylePref = "sound" | "silent";

export interface SoundAndQuizPrefs {
  soundEffectsEnabled: boolean;
  interactionStyle: InteractionStylePref;
  quizButtonStyle: QuizButtonStyle;
  quizColorPalette: QuizColorPalette;
  quizFeedbackStyle: QuizFeedbackStyle;
}

export const defaultSoundAndQuizPrefs: SoundAndQuizPrefs = {
  soundEffectsEnabled: true,
  interactionStyle: "sound",
  quizButtonStyle: "rounded",
  quizColorPalette: "default",
  quizFeedbackStyle: "celebration",
};

export function normalizeInteractionStyle(val: unknown): InteractionStylePref {
  return val === "silent" ? "silent" : "sound";
}

export const QUIZ_COLOR_PALETTES: Record<
  QuizColorPalette,
  { hex: string; activeBgClass: string; activeBorderClass: string }
> = {
  default: {
    hex: "#14b8a6",
    activeBgClass: "bg-primary/15",
    activeBorderClass: "border-primary text-primary",
  },
  ocean: {
    hex: "#0284c7",
    activeBgClass: "bg-sky-500/15",
    activeBorderClass: "border-sky-500 text-sky-600 dark:text-sky-400",
  },
  emerald: {
    hex: "#059669",
    activeBgClass: "bg-emerald-500/15",
    activeBorderClass: "border-emerald-500 text-emerald-700 dark:text-emerald-400",
  },
  royal: {
    hex: "#6366f1",
    activeBgClass: "bg-indigo-500/15",
    activeBorderClass: "border-indigo-500 text-indigo-700 dark:text-indigo-400",
  },
  amber: {
    hex: "#d97706",
    activeBgClass: "bg-amber-500/15",
    activeBorderClass: "border-amber-500 text-amber-700 dark:text-amber-400",
  },
};

export function normalizeQuizButtonStyle(value: unknown): QuizButtonStyle {
  if (value === "rounded" || value === "pill" || value === "soft_square") return value;
  return "rounded";
}

export function normalizeQuizColorPalette(value: unknown): QuizColorPalette {
  if (
    value === "default" ||
    value === "ocean" ||
    value === "emerald" ||
    value === "royal" ||
    value === "amber"
  ) {
    return value;
  }
  return "default";
}

export function normalizeQuizFeedbackStyle(value: unknown): QuizFeedbackStyle {
  if (value === "celebration" || value === "balanced" || value === "minimal") return value;
  return "celebration";
}

export function getQuizButtonRadiusClass(style: QuizButtonStyle): string {
  switch (style) {
    case "pill":
      return "rounded-full";
    case "soft_square":
      return "rounded-md";
    case "rounded":
    default:
      return "rounded-xl";
  }
}

export interface InterfaceThemePresetSpec {
  id: InterfaceTheme;
  accent: AccentPreset;
  cornerStyle: CornerPref;
  cardStyle: CardStylePref;
  borderStyle: BorderStylePref;
  shadowLevel: ShadowLevelPref;
  animationLevel: AnimationLevelPref;
  bgStyle: BgStylePref;
  readingLayout: ReadingLayoutPref;
  previewBgDark: string;
  previewSurfaceDark: string;
  previewBgLight: string;
  previewSurfaceLight: string;
}

export const INTERFACE_THEME_SPECS: Record<InterfaceTheme, InterfaceThemePresetSpec> = {
  classic: {
    id: "classic",
    accent: "teal",
    cornerStyle: "rounded",
    cardStyle: "elevated",
    borderStyle: "subtle",
    shadowLevel: "soft",
    animationLevel: "full",
    bgStyle: "ambient",
    readingLayout: "standard",
    previewBgDark: "#141c2b",
    previewSurfaceDark: "#1b2538",
    previewBgLight: "#f6f8fc",
    previewSurfaceLight: "#ffffff",
  },
  btc_alternative: {
    id: "btc_alternative",
    accent: "indigo",
    cornerStyle: "rounded",
    cardStyle: "elevated",
    borderStyle: "crisp",
    shadowLevel: "rich",
    animationLevel: "full",
    bgStyle: "ambient",
    readingLayout: "standard",
    previewBgDark: "#080c14",
    previewSurfaceDark: "#0e1424",
    previewBgLight: "#f8fafc",
    previewSurfaceLight: "#ffffff",
  },
  aurora_glass: {
    id: "aurora_glass",
    accent: "teal",
    cornerStyle: "soft",
    cardStyle: "glass",
    borderStyle: "subtle",
    shadowLevel: "rich",
    animationLevel: "full",
    bgStyle: "ambient",
    readingLayout: "standard",
    previewBgDark: "#0b1226",
    previewSurfaceDark: "#121d3b",
    previewBgLight: "#f0fdf9",
    previewSurfaceLight: "#ffffff",
  },
  aurora: {
    id: "aurora",
    accent: "indigo",
    cornerStyle: "rounded",
    cardStyle: "elevated",
    borderStyle: "crisp",
    shadowLevel: "rich",
    animationLevel: "full",
    bgStyle: "ambient",
    readingLayout: "standard",
    previewBgDark: "#0f1128",
    previewSurfaceDark: "#1a1e42",
    previewBgLight: "#f5f3ff",
    previewSurfaceLight: "#ffffff",
  },
  minimal: {
    id: "minimal",
    accent: "indigo",
    cornerStyle: "sharp",
    cardStyle: "flat",
    borderStyle: "crisp",
    shadowLevel: "none",
    animationLevel: "subtle",
    bgStyle: "solid",
    readingLayout: "standard",
    previewBgDark: "#121316",
    previewSurfaceDark: "#191b1f",
    previewBgLight: "#fafafa",
    previewSurfaceLight: "#ffffff",
  },
  soft_modern: {
    id: "soft_modern",
    accent: "amber",
    cornerStyle: "soft",
    cardStyle: "elevated",
    borderStyle: "subtle",
    shadowLevel: "soft",
    animationLevel: "subtle",
    bgStyle: "ambient",
    readingLayout: "standard",
    previewBgDark: "#181a20",
    previewSurfaceDark: "#23262f",
    previewBgLight: "#faf8f5",
    previewSurfaceLight: "#ffffff",
  },
  creative_neon: {
    id: "creative_neon",
    accent: "emerald",
    cornerStyle: "sharp",
    cardStyle: "glass",
    borderStyle: "crisp",
    shadowLevel: "rich",
    animationLevel: "full",
    bgStyle: "grid",
    readingLayout: "standard",
    previewBgDark: "#090a10",
    previewSurfaceDark: "#131622",
    previewBgLight: "#f4f7f6",
    previewSurfaceLight: "#ffffff",
  },
  focus: {
    id: "focus",
    accent: "emerald",
    cornerStyle: "rounded",
    cardStyle: "flat",
    borderStyle: "minimal",
    shadowLevel: "none",
    animationLevel: "none",
    bgStyle: "solid",
    readingLayout: "focused",
    previewBgDark: "#151a19",
    previewSurfaceDark: "#1c2321",
    previewBgLight: "#f4f6f3",
    previewSurfaceLight: "#fcfdfb",
  },
  creative: {
    id: "creative",
    accent: "rose",
    cornerStyle: "soft",
    cardStyle: "glass",
    borderStyle: "crisp",
    shadowLevel: "rich",
    animationLevel: "full",
    bgStyle: "grid",
    readingLayout: "standard",
    previewBgDark: "#191429",
    previewSurfaceDark: "#241d3a",
    previewBgLight: "#faf6ff",
    previewSurfaceLight: "#ffffff",
  },
  nordic_frost: {
    id: "nordic_frost",
    accent: "teal",
    cornerStyle: "rounded",
    cardStyle: "glass",
    borderStyle: "crisp",
    shadowLevel: "soft",
    animationLevel: "subtle",
    bgStyle: "ambient",
    readingLayout: "standard",
    previewBgDark: "#0b1523",
    previewSurfaceDark: "#132238",
    previewBgLight: "#f0f9ff",
    previewSurfaceLight: "#ffffff",
  },
  sepia_study: {
    id: "sepia_study",
    accent: "amber",
    cornerStyle: "rounded",
    cardStyle: "elevated",
    borderStyle: "subtle",
    shadowLevel: "soft",
    animationLevel: "subtle",
    bgStyle: "solid",
    readingLayout: "focused",
    previewBgDark: "#1c1611",
    previewSurfaceDark: "#281f17",
    previewBgLight: "#f7f1e3",
    previewSurfaceLight: "#fdf9f0",
  },
  cyber_matrix: {
    id: "cyber_matrix",
    accent: "emerald",
    cornerStyle: "sharp",
    cardStyle: "flat",
    borderStyle: "crisp",
    shadowLevel: "rich",
    animationLevel: "full",
    bgStyle: "grid",
    readingLayout: "standard",
    previewBgDark: "#050d08",
    previewSurfaceDark: "#0b1a11",
    previewBgLight: "#ecfdf5",
    previewSurfaceLight: "#ffffff",
  },
  midnight_purple: {
    id: "midnight_purple",
    accent: "indigo",
    cornerStyle: "soft",
    cardStyle: "glass",
    borderStyle: "subtle",
    shadowLevel: "rich",
    animationLevel: "full",
    bgStyle: "ambient",
    readingLayout: "standard",
    previewBgDark: "#130b24",
    previewSurfaceDark: "#1f133b",
    previewBgLight: "#faf5ff",
    previewSurfaceLight: "#ffffff",
  },
};

export const TIMEZONE_OPTIONS = [
  { value: "auto", label: "Auto (Device time zone)" },
  { value: "Asia/Kuwait", label: "Asia/Kuwait (UTC+3)" },
  { value: "Asia/Riyadh", label: "Asia/Riyadh (UTC+3)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (UTC+4)" },
  { value: "Europe/London", label: "Europe/London (UTC+0/+1)" },
  { value: "Europe/Paris", label: "Europe/Paris (UTC+1/+2)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (UTC+1/+2)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (UTC+9)" },
  { value: "Asia/Seoul", label: "Asia/Seoul (UTC+9)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (UTC+8)" },
  { value: "America/New_York", label: "America/New_York (UTC-5/-4)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (UTC-8/-7)" },
] as const;

export const SUBJECT_OPTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "Arabic",
  "History",
  "Economics",
  "Languages",
] as const;

export const AVATAR_PRESETS = [
  "/avatars/compass.svg",
  "/avatars/aurora.svg",
  "/avatars/spark.svg",
  "/avatars/orbit.svg",
] as const;

export const defaultA11yFull: A11yFull = {
  fontScale: 1,
  dyslexia: false,
  contrast: false,
  reduceMotion: false,
  focusRing: false,
  simplified: false,
  clearLanguage: false,
  readAloud: false,
  readAloudRate: 1,
  voiceInput: false,
  captions: false,
};

export const defaultAppearancePrefs: AppearancePrefs = {
  uiTheme: "classic",
  accent: "teal",
  customAccentHex: "#14b8a6",
  density: "comfortable",
  cornerStyle: "rounded",
  cardStyle: "elevated",
  borderStyle: "subtle",
  shadowLevel: "soft",
  animationLevel: "full",
  bgStyle: "ambient",
  fontFamily: "nexora",
  reduceVisualEffects: false,
  readingLayout: "standard",
  defaultHomeTab: "dashboard",
  hiddenWidgets: [],
  widgetOrder: [...DASHBOARD_WIDGET_IDS],
};

export const defaultTypographyPrefs: TypographyPrefs = {
  fontFamily: "nexora",
  fontScale: 1,
  headingScale: 1,
  lineHeight: 1.55,
  letterSpacing: 0,
  fontWeight: "regular",
  readabilityPreset: "standard",
};

export const defaultLayoutPrefs: LayoutPrefs = {
  workspace: "balanced",
  sidebarMode: "expanded",
  showQuickActions: true,
};

export const defaultLocalePrefs: LocalePrefs = {
  timezone: "auto",
  dateFormat: "auto",
  timeFormat: "12h",
  firstDayOfWeek: "sunday",
  calendar: "gregorian",
  units: "metric",
  opportunityScope: "local",
};

export const defaultStudyPrefs: StudyPrefs = {
  explanationLanguage: "ui",
  complexity: "balanced",
  detailLevel: "standard",
  stepByStep: true,
  examplesFirst: true,
  visualAids: true,
  practiceQuestions: true,
  flashcardStyle: "spaced",
  quizDifficulty: "adaptive",
  sessionMinutes: 25,
  breakMinutes: 5,
  revisionReminders: true,
};

export const defaultAiPrefs: AiPrefs = {
  responseLanguage: "ui",
  responseLength: "standard",
  tone: "coach",
  clarifyingQuestions: true,
  shareProfile: true,
  shareTasks: true,
  shareGrowth: true,
  rememberPreferences: true,
  saveHistory: true,
  proactiveSuggestions: true,
  notifications: true,
};

export const defaultNotificationPrefs: NotificationPrefs = {
  reminders: true,
  tasks: true,
  calendar: true,
  streak: true,
  opportunities: true,
  community: false,
  teams: true,
  emailEnabled: false,
  pushEnabled: true,
  frequency: "instant",
  quietHoursEnabled: true,
  quietStart: "22:00",
  quietEnd: "07:00",
};

export const defaultPrivacyPrefs: PrivacyPrefs = {
  keepSignedIn: true,
  profileVisibility: "private",
  showInCircle: true,
};

export const defaultEcosystemPrefs: EcosystemPrefs = {
  aiModelTier: "balanced",
  searchGroundingDefault: false,
  voiceSpeed: 1,
  mapsLocationConsent: false,
  scene3dReducedMotion: false,
  lowBandwidth: false,
  distractionFree: false,
};

export function clampFontScale(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.round(Math.min(FONT_MAX, Math.max(FONT_MIN, n)) * 100) / 100;
}

export function clampHeadingScale(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.round(Math.min(HEADING_SCALE_MAX, Math.max(HEADING_SCALE_MIN, n)) * 100) / 100;
}

export function clampLineHeight(n: number): number {
  if (!Number.isFinite(n)) return 1.55;
  return Math.round(Math.min(LINE_HEIGHT_MAX, Math.max(LINE_HEIGHT_MIN, n)) * 100) / 100;
}

export function clampLetterSpacing(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(Math.min(LETTER_SPACING_MAX, Math.max(LETTER_SPACING_MIN, n)) * 1000) / 1000;
}

export function clampSpeechRate(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.round(Math.min(1.5, Math.max(0.75, n)) * 100) / 100;
}

export function clampMinutes(n: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(max, Math.max(min, n)));
}

export function normalizeRegion(r: unknown): Region {
  return (REGIONS as readonly string[]).includes(r as string) ? (r as Region) : "global";
}

export function normalizeLang(l: unknown): Lang {
  return normalizeSupportedLang(l);
}

export function normalizeUiTheme(value: unknown): InterfaceTheme {
  return (INTERFACE_THEMES as readonly string[]).includes(value as string)
    ? (value as InterfaceTheme)
    : "classic";
}

export function normalizeFontFamily(value: unknown): FontFamilyPref {
  return (FONT_FAMILIES as readonly string[]).includes(value as string)
    ? (value as FontFamilyPref)
    : "nexora";
}

export function normalizeReadabilityPreset(value: unknown): ReadabilityPresetId {
  return (READABILITY_PRESETS as readonly string[]).includes(value as string)
    ? (value as ReadabilityPresetId)
    : "standard";
}

export function normalizeLayoutWorkspace(value: unknown): LayoutWorkspaceId {
  return (LAYOUT_WORKSPACES as readonly string[]).includes(value as string)
    ? (value as LayoutWorkspaceId)
    : "balanced";
}

export function normalizeThemeMode(value: unknown): ThemeMode {
  if (value === "light" || value === "system" || value === "dark") return value;
  return "dark";
}

export function normalizeOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function isValidHexColor(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex.trim());
}

function relativeLuminance(hex: string): number {
  const clean = isValidHexColor(hex) ? hex.trim().slice(1) : "14b8a6";
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const toLin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

export function getContrastRatio(hexA: string, hexB: string): number {
  const l1 = relativeLuminance(hexA);
  const l2 = relativeLuminance(hexB);
  const bright = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return Math.round(((bright + 0.05) / (dark + 0.05)) * 100) / 100;
}

export function getContrastForeground(hex: string): string {
  return relativeLuminance(hex) > 0.36 ? "#09111b" : "#f8fafc";
}

export function buildInterfaceThemePatch(
  uiTheme: InterfaceTheme,
): Pick<
  AppearancePrefs,
  | "uiTheme"
  | "accent"
  | "cornerStyle"
  | "cardStyle"
  | "borderStyle"
  | "shadowLevel"
  | "animationLevel"
  | "bgStyle"
  | "readingLayout"
> {
  const spec = INTERFACE_THEME_SPECS[uiTheme];
  return {
    uiTheme: spec.id,
    accent: spec.accent,
    cornerStyle: spec.cornerStyle,
    cardStyle: spec.cardStyle,
    borderStyle: spec.borderStyle,
    shadowLevel: spec.shadowLevel,
    animationLevel: spec.animationLevel,
    bgStyle: spec.bgStyle,
    readingLayout: spec.readingLayout,
  };
}

export function buildReadabilityPreset(
  preset: Exclude<ReadabilityPresetId, "custom">,
  lang: Lang,
): TypographyPrefs {
  const isArabic = lang === "ar";
  const isCjk = lang === "ja" || lang === "zh-CN" || lang === "ko";
  const scriptDefaultFont: FontFamilyPref = isArabic ? "arabic" : isCjk ? "cjk" : "nexora";

  switch (preset) {
    case "comfortable":
      return {
        readabilityPreset: "comfortable",
        fontFamily: isArabic ? "arabic" : isCjk ? "cjk" : "humanist",
        fontScale: 1.06,
        headingScale: 1.05,
        lineHeight: 1.72,
        letterSpacing: isArabic ? 0 : 0.01,
        fontWeight: "regular",
      };
    case "large":
      return {
        readabilityPreset: "large",
        fontFamily: scriptDefaultFont,
        fontScale: 1.18,
        headingScale: 1.12,
        lineHeight: 1.7,
        letterSpacing: isArabic ? 0 : 0.01,
        fontWeight: "medium",
      };
    case "compact":
      return {
        readabilityPreset: "compact",
        fontFamily: isArabic ? "arabic" : isCjk ? "cjk" : "compact",
        fontScale: 0.94,
        headingScale: 0.95,
        lineHeight: 1.42,
        letterSpacing: 0,
        fontWeight: "regular",
      };
    case "accessibility":
      return {
        readabilityPreset: "accessibility",
        fontFamily: isArabic ? "arabic" : isCjk ? "cjk" : "accessible",
        fontScale: 1.16,
        headingScale: 1.1,
        lineHeight: 1.85,
        // Never add positive letter-spacing to cursive Arabic glyphs
        letterSpacing: isArabic ? 0 : 0.035,
        fontWeight: "medium",
      };
    case "standard":
    default:
      return {
        readabilityPreset: "standard",
        fontFamily: scriptDefaultFont,
        fontScale: 1,
        headingScale: 1,
        lineHeight: isArabic ? 1.7 : isCjk ? 1.65 : 1.55,
        letterSpacing: 0,
        fontWeight: "regular",
      };
  }
}

export function buildLayoutWorkspacePatch(workspace: LayoutWorkspaceId): {
  layout: LayoutPrefs;
  appearance: Pick<AppearancePrefs, "density" | "readingLayout" | "hiddenWidgets"> & {
    widgetOrder?: DashboardWidgetId[];
  };
} {
  switch (workspace) {
    case "study":
      return {
        layout: {
          workspace: "study",
          sidebarMode: "compact",
          showQuickActions: true,
        },
        appearance: {
          density: "comfortable",
          readingLayout: "focused",
          hiddenWidgets: ["activity"],
        },
      };
    case "productivity":
      return {
        layout: {
          workspace: "productivity",
          sidebarMode: "expanded",
          showQuickActions: true,
        },
        appearance: {
          density: "compact",
          readingLayout: "standard",
          hiddenWidgets: [],
          widgetOrder: [
            "stats",
            "pomodoro",
            "tasks",
            "goals",
            "areas",
            "activity",
            "welcome",
            "hub",
          ],
        },
      };
    case "minimal":
      return {
        layout: {
          workspace: "minimal",
          sidebarMode: "simplified",
          showQuickActions: false,
        },
        appearance: {
          density: "spacious",
          readingLayout: "focused",
          hiddenWidgets: ["activity", "hub"],
        },
      };
    case "balanced":
    default:
      return {
        layout: {
          workspace: "balanced",
          sidebarMode: "expanded",
          showQuickActions: true,
        },
        appearance: {
          density: "comfortable",
          readingLayout: "standard",
          hiddenWidgets: [],
          widgetOrder: [...DASHBOARD_WIDGET_IDS],
        },
      };
  }
}

export function normalizeWidgetOrder(input: unknown): DashboardWidgetId[] {
  if (!Array.isArray(input)) return [...DASHBOARD_WIDGET_IDS];
  const seen = new Set<DashboardWidgetId>();
  const out: DashboardWidgetId[] = [];
  for (const item of input) {
    if (
      typeof item === "string" &&
      (DASHBOARD_WIDGET_IDS as readonly string[]).includes(item) &&
      !seen.has(item as DashboardWidgetId)
    ) {
      seen.add(item as DashboardWidgetId);
      out.push(item as DashboardWidgetId);
    }
  }
  for (const fallback of DASHBOARD_WIDGET_IDS) {
    if (!seen.has(fallback)) out.push(fallback);
  }
  return out;
}

export function normalizeHiddenWidgets(input: unknown): DashboardWidgetId[] {
  if (!Array.isArray(input)) return [];
  return Array.from(
    new Set(
      input.filter(
        (item): item is DashboardWidgetId =>
          typeof item === "string" && (DASHBOARD_WIDGET_IDS as readonly string[]).includes(item),
      ),
    ),
  );
}

export interface SettingsRow {
  theme: string;
  font_scale: number;
  dyslexia_font: boolean;
  high_contrast: boolean;
  reduced_motion: boolean;
}

export function rowToPrefs(row: SettingsRow): { theme: Theme; a11y: A11y } {
  return {
    theme: row.theme === "light" ? "light" : "dark",
    a11y: {
      fontScale: clampFontScale(Number(row.font_scale)),
      dyslexia: !!row.dyslexia_font,
      contrast: !!row.high_contrast,
      reduceMotion: !!row.reduced_motion,
    },
  };
}

export function prefsToRow(theme: Theme, a: A11y): SettingsRow {
  return {
    theme,
    font_scale: clampFontScale(a.fontScale),
    dyslexia_font: a.dyslexia,
    high_contrast: a.contrast,
    reduced_motion: a.reduceMotion,
  };
}
