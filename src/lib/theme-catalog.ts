import type {
  BgStylePref,
  BorderStylePref,
  CardStylePref,
  CornerPref,
  FontFamilyPref,
  InterfaceTheme,
  ShadowLevelPref,
} from "./settings";

export type UiMode = "simplified" | "advanced";

export type LayoutMode =
  | "classic"
  | "compact"
  | "floating"
  | "top_nav"
  | "double_header"
  | "zen_focus"
  | "split_study"
  | "bento"
  | "executive_kpi"
  | "bottom_dock";

export type LayoutCategory = "sidebar" | "topbar" | "focus" | "grid" | "mobile";

export type ThemeCategory = "minimal" | "futuristic" | "professional" | "colorful" | "nature";

export interface ThemeCatalogPreset {
  id: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  designIdentityEn: string;
  designIdentityAr: string;
  category: ThemeCategory;
  baseUiTheme: InterfaceTheme;
  layoutMode: LayoutMode;
  englishFont: string;
  arabicFont: string;
  recommendedMode: "dark" | "light";
  accentHex: string;
  glowHex: string;
  previewBgDark: string;
  previewSurfaceDark: string;
  previewBgLight: string;
  previewSurfaceLight: string;
  cardStyle: CardStylePref;
  borderStyle: BorderStylePref;
  shadowLevel: ShadowLevelPref;
  cornerStyle: CornerPref;
  bgStyle: BgStylePref;
  fontFamily: FontFamilyPref;
}

export interface LayoutModeSpec {
  id: LayoutMode;
  category: LayoutCategory;
  navPosition: "left" | "right" | "top" | "bottom" | "none" | "dual";
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  sidebarMode: "expanded" | "compact" | "simplified";
  recommendedDensity?: "compact" | "comfortable" | "spacious";
}

export const LAYOUT_CATEGORY_LABELS: Record<
  LayoutCategory | "all",
  { labelEn: string; labelAr: string }
> = {
  all: { labelEn: "All 10 Layouts", labelAr: "كل التخطيطات (10)" },
  sidebar: { labelEn: "Sidebar Rails", labelAr: "الأشرطة الجانبية" },
  topbar: { labelEn: "Top Navigation", labelAr: "القوائم العلوية" },
  focus: { labelEn: "Deep Focus", labelAr: "التركيز والدراسة" },
  grid: { labelEn: "Modular Grids", labelAr: "الشبكات المعيارية" },
  mobile: { labelEn: "Dock & Mobile", labelAr: "الشريط السفلي واللمس" },
};

export const LAYOUT_MODES: LayoutModeSpec[] = [
  // 1. SIDEBAR RAILS (3)
  {
    id: "classic",
    category: "sidebar",
    navPosition: "left",
    nameEn: "Classic Sidebar",
    nameAr: "الشريط الجانبي الكلاسيكي",
    descEn: "Balanced left navigation rail with generous reading canvas",
    descAr: "قائمة جانبية متوازنة مع مساحة قراءة واضحة",
    sidebarMode: "expanded",
  },
  {
    id: "compact",
    category: "sidebar",
    navPosition: "left",
    nameEn: "Compact Rail",
    nameAr: "شريط مضغوط",
    descEn: "Slim icon-focused sidebar maximizing horizontal workspace",
    descAr: "شريط جانبي نحيف لتوسيع مساحة الدراسة والعمل",
    sidebarMode: "compact",
  },
  {
    id: "floating",
    category: "sidebar",
    navPosition: "left",
    nameEn: "Floating Glass Shell",
    nameAr: "واجهة زجاجية عائمة",
    descEn: "Detached rounded shell panels with elevated depth and breathing room",
    descAr: "ألواح عائمة دائرية بعمق بصري ومسافات مريحة",
    sidebarMode: "expanded",
  },

  // 2. TOP NAVIGATION (2)
  {
    id: "top_nav",
    category: "topbar",
    navPosition: "top",
    nameEn: "Top Bar Focus",
    nameAr: "شريط علوي أفقي",
    descEn: "Horizontal top navigation bar with distraction-free full-width stage",
    descAr: "تنقل أفقي علوي يمنح عرض الصفحة الكامل للتركيز",
    sidebarMode: "compact",
  },
  {
    id: "double_header",
    category: "topbar",
    navPosition: "top",
    nameEn: "Dual Academic Header",
    nameAr: "رأس أكاديمي مزدوج",
    descEn: "Full top utility header paired with a dedicated horizontal module strip",
    descAr: "شريط أدوات علوي متكامل مع شريط وحدات أفقي مخصص",
    sidebarMode: "compact",
  },

  // 3. FOCUS & STUDY (2)
  {
    id: "zen_focus",
    category: "focus",
    navPosition: "none",
    nameEn: "Zen Study Reader",
    nameAr: "قارئ التركيز الهادئ",
    descEn: "Distraction-free narrow reading column with subdued chrome",
    descAr: "عمود قراءة مركزي هادئ خالٍ من المشتتات الجانبية",
    sidebarMode: "simplified",
    recommendedDensity: "spacious",
  },
  {
    id: "split_study",
    category: "focus",
    navPosition: "left",
    nameEn: "Split Workbench",
    nameAr: "طاولة عمل مقسمة",
    descEn: "Balanced two-column studio proportions for notes alongside tasks",
    descAr: "توزيع ثنائي الأعمدة للمذاكرة مع المهام والأهداف معاً",
    sidebarMode: "compact",
  },

  // 4. MODULAR GRIDS (2)
  {
    id: "bento",
    category: "grid",
    navPosition: "left",
    nameEn: "Bento Studio Grid",
    nameAr: "شبكة البينتو المنظمة",
    descEn: "Structured modular card proportions tuned for multi-panel workflows",
    descAr: "توزيع شبكي متناغم للبطاقات ولوحات التحكم المتعددة",
    sidebarMode: "expanded",
  },
  {
    id: "executive_kpi",
    category: "grid",
    navPosition: "left",
    nameEn: "Executive KPI Deck",
    nameAr: "لوحة مؤشرات الأداء",
    descEn: "Structured metric-first header proportions with tight visual hierarchy",
    descAr: "هيكل يعطي الأولوية للمؤشرات والإحصائيات بدقة عالية",
    sidebarMode: "expanded",
    recommendedDensity: "compact",
  },

  // 5. DOCK & MOBILE (1)
  {
    id: "bottom_dock",
    category: "mobile",
    navPosition: "bottom",
    nameEn: "Floating Bottom Dock",
    nameAr: "شريط سفلي عائم",
    descEn: "Desktop & tablet bottom navigation dock keeping top viewport pure",
    descAr: "شريط تنقل سفلي عائم يبقي الجزء العلوي من الشاشة صافياً",
    sidebarMode: "compact",
  },
];

const LAYOUT_MODE_SET = new Set<string>(LAYOUT_MODES.map((m) => m.id));

export const LEGACY_LAYOUT_ALIASES: Record<string, LayoutMode> = {
  prime_academy: "executive_kpi",
  command_dock: "top_nav",
  breadcrumb_bar: "classic",
  kanban_columns: "bento",
  flashcard_stage: "zen_focus",
  masonry_flow: "bento",
  exam_proctor: "zen_focus",
  compact_dense: "compact",
  scholar_codex: "split_study",
  mini_drawer: "compact",
  dual_rail: "split_study",
  cinema_wide: "top_nav",
  right_rail: "classic",
  thumb_zone: "bottom_dock",
};

export function isValidLayoutMode(value: unknown): value is LayoutMode {
  return typeof value === "string" && LAYOUT_MODE_SET.has(value);
}

export function normalizeLayoutMode(value: unknown): LayoutMode {
  if (isValidLayoutMode(value)) return value;
  if (typeof value === "string" && value in LEGACY_LAYOUT_ALIASES) {
    return LEGACY_LAYOUT_ALIASES[value]!;
  }
  return "classic";
}

export function getLayoutModeById(id: string | null | undefined): LayoutModeSpec {
  const normalized = normalizeLayoutMode(id);
  const found = LAYOUT_MODES.find((m) => m.id === normalized);
  return found ?? LAYOUT_MODES[0]!;
}

export const THEME_CATEGORY_LABELS: Record<
  ThemeCategory | "all",
  { labelEn: string; labelAr: string }
> = {
  all: { labelEn: "All 10 Presets", labelAr: "كل التصاميم (10)" },
  minimal: { labelEn: "Minimal", labelAr: "تبسيطي" },
  futuristic: { labelEn: "Futuristic & Tech", labelAr: "مستقبلي وتقني" },
  professional: { labelEn: "Professional & Elegant", labelAr: "احترافي وأنيق" },
  colorful: { labelEn: "Colorful & Creative", labelAr: "ملون وإبداعي" },
  nature: { labelEn: "Nature & Atmosphere", labelAr: "طبيعي وهادئ" },
};

export const THEME_CATALOG: ThemeCatalogPreset[] = [
  {
    id: "btc_classic",
    nameEn: "BTC Classic Studio",
    nameAr: "استوديو BTC الكلاسيكي",
    descEn: "Flagship teal clarity, balanced slate surfaces, and classic sidebar geometry",
    descAr: "هوية BTC المميزة بألوان فيروزية متوازنة وشريط جانبي كلاسيكي",
    designIdentityEn: "Flagship Teal Studio · Classic Sidebar · Sora & IBM Plex Arabic",
    designIdentityAr: "استوديو فيروزي قياسي · شريط كلاسيكي · خطوط Sora و IBM Plex",
    category: "minimal",
    baseUiTheme: "classic",
    layoutMode: "classic",
    englishFont: "Sora",
    arabicFont: "IBM Plex Sans Arabic",
    recommendedMode: "dark",
    accentHex: "#14b8a6",
    glowHex: "#06b6d4",
    previewBgDark: "#111827",
    previewSurfaceDark: "#1b2538",
    previewBgLight: "#f6f8fc",
    previewSurfaceLight: "#ffffff",
    cardStyle: "elevated",
    borderStyle: "subtle",
    shadowLevel: "soft",
    cornerStyle: "rounded",
    bgStyle: "ambient",
    fontFamily: "nexora",
  },
  {
    id: "nordic_frost",
    nameEn: "Nordic Frost",
    nameAr: "صقيع الشمال",
    descEn: "Airy arctic surfaces, floating detached navigation shell, and crisp cobalt focus",
    descAr: "أسطح ثلجية ناعمة مع ألواح عائمة وإضاءة كوبالت هادئة",
    designIdentityEn: "Arctic Floating Shell · Plus Jakarta Sans & Tajawal",
    designIdentityAr: "واجهة ثلجية عائمة · خطوط Plus Jakarta Sans و Tajawal",
    category: "minimal",
    baseUiTheme: "nordic_frost",
    layoutMode: "floating",
    englishFont: "Plus Jakarta Sans",
    arabicFont: "Tajawal",
    recommendedMode: "light",
    accentHex: "#0284c7",
    glowHex: "#38bdf8",
    previewBgDark: "#131c24",
    previewSurfaceDark: "#1b2732",
    previewBgLight: "#f1f6fa",
    previewSurfaceLight: "#ffffff",
    cardStyle: "elevated",
    borderStyle: "subtle",
    shadowLevel: "soft",
    cornerStyle: "rounded",
    bgStyle: "ambient",
    fontFamily: "humanist",
  },
];

export const LEGACY_PRESET_ALIASES: Record<string, string> = {
  monolith_slate: "pure_obsidian",
  deep_orbit: "aurora_glass",
  quantum_teal: "neon_cyber",
  solar_grid: "neon_cyber",
  hologram_pulse: "aurora_glass",
  royal_graphite: "oxford_navy",
  executive_emerald: "oxford_navy",
  violet_dream: "sunset_coral",
  berry_pop: "sunset_coral",
  citrus_spark: "champagne_gold",
  pastel_canvas: "nordic_frost",
  ocean_deep: "sage_focus",
  forest_moss: "sage_focus",
  desert_sand: "champagne_gold",
};

const ACTIVE_PRESET_ID_SET = new Set(THEME_CATALOG.map((p) => p.id));

export function normalizeThemePresetId(id: string | null | undefined): string | null {
  if (!id) return null;
  if (ACTIVE_PRESET_ID_SET.has(id)) return id;
  if (id in LEGACY_PRESET_ALIASES) {
    return LEGACY_PRESET_ALIASES[id]!;
  }
  return null;
}

export function getThemePresetById(id: string | null | undefined): ThemeCatalogPreset | undefined {
  const normalized = normalizeThemePresetId(id);
  if (!normalized) return undefined;
  return THEME_CATALOG.find((t) => t.id === normalized);
}

export function findMatchingThemePreset(input: {
  ui_theme?: InterfaceTheme | undefined;
  accent_color?: string | undefined;
  custom_accent_hex?: string | undefined;
  bg_style?: BgStylePref | undefined;
  corner_style?: CornerPref | undefined;
}): ThemeCatalogPreset | undefined {
  if (input.accent_color !== "custom" || !input.custom_accent_hex || !input.ui_theme) {
    return undefined;
  }
  const hex = input.custom_accent_hex.toLowerCase();
  return THEME_CATALOG.find(
    (preset) =>
      preset.baseUiTheme === input.ui_theme &&
      preset.accentHex.toLowerCase() === hex &&
      (!input.bg_style || preset.bgStyle === input.bg_style) &&
      (!input.corner_style || preset.cornerStyle === input.corner_style),
  );
}
