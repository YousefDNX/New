import type { AccentPreset, AppearancePrefs, ThemeMode } from "./settings";
import type { LayoutMode } from "./theme-catalog";

export type UiExperienceId = "classic" | "editorial_atelier" | "command_os" | "focus_deck";

export type ExperienceParadigm = "editorial" | "command" | "spatial";

export interface UiExperienceSpec {
  id: UiExperienceId;
  paradigm: ExperienceParadigm;
  paradigmCode: "Mode A" | "Mode B" | "Mode C";
  isNew: boolean;
  nameEn: string;
  nameAr: string;
  taglineEn: string;
  taglineAr: string;
  descEn: string;
  descAr: string;
  navModelEn: string;
  navModelAr: string;
  dashboardModelEn: string;
  dashboardModelAr: string;
  dataViewEn: string;
  dataViewAr: string;
  formViewEn: string;
  formViewAr: string;
  surfaceModelEn: string;
  surfaceModelAr: string;
  displayFont: string;
  arabicFont: string;
  pairedLayoutMode: LayoutMode;
  previewBgLight: string;
  previewBgDark: string;
  previewSurfaceLight: string;
  previewSurfaceDark: string;
  previewAccentHex: string;
}

export interface ThemeUxPreset {
  id: string;
  experienceId: UiExperienceId;
  paradigmCode: "Mode A" | "Mode B" | "Mode C";
  nameEn: string;
  nameAr: string;
  subtitleEn: string;
  subtitleAr: string;
  colorMode: ThemeMode;
  accent: AccentPreset;
  customAccentHex?: string;
  themePresetId: string;
  appearancePatch: Partial<AppearancePrefs>;
  swatchBg: string;
  swatchSurface: string;
  swatchAccent: string;
}

export const UI_EXPERIENCES: UiExperienceSpec[] = [
  {
    id: "classic",
    paradigm: "editorial",
    paradigmCode: "Mode A",
    isNew: false,
    nameEn: "Classic BTC Studio",
    nameAr: "استوديو BTC الكلاسيكي",
    taglineEn: "Structured vertical scrolling, persistent rail & balanced student hub",
    taglineAr: "تصفح رأسي متوازن وشريط جانبي ثابت ولوحة وحدات قياسية",
    descEn:
      "The original BTC experience with a persistent left navigation rail, vertical document scroll, structured lists, and standard forms.",
    descAr: "تجربة BTC الأصلية مع شريط تنقل جانبي ثابت وتمرير رأسي تقليدي وقوائم ونماذج قياسية.",
    navModelEn: "Left Sidebar + Top Bar",
    navModelAr: "شريط جانبي + شريط علوي",
    dashboardModelEn: "Modular Vertical Grid",
    dashboardModelAr: "شبكة وحدات رأسية",
    dataViewEn: "Structured List",
    dataViewAr: "قائمة منظمة",
    formViewEn: "Vertical Form",
    formViewAr: "نموذج رأسي",
    surfaceModelEn: "Balanced Slate Cards",
    surfaceModelAr: "بطاقات متوازنة ناعمة",
    displayFont: "Sora",
    arabicFont: "IBM Plex Sans Arabic",
    pairedLayoutMode: "classic",
    previewBgLight: "#f6f8fc",
    previewBgDark: "#111827",
    previewSurfaceLight: "#ffffff",
    previewSurfaceDark: "#1b2538",
    previewAccentHex: "#14b8a6",
  },
  {
    id: "editorial_atelier",
    paradigm: "editorial",
    paradigmCode: "Mode A",
    isNew: true,
    nameEn: "Editorial Study Journal",
    nameAr: "المجلة الدراسية التحريرية",
    taglineEn: "Top masthead nav, scrolling briefing, semantic tables & vertical forms",
    taglineAr: "ترويسة علوية، إحاطة تحريرية، جداول بيانات منظمة، ونماذج رأسية",
    descEn:
      "Mode A (Classic / Editorial): Top chapter masthead replaces the sidebar, vertical scrolling briefing, semantic data tables, and structured editorial forms.",
    descAr:
      "النمط أ (تحريري): شريط فصول علوي بدل الجانبي، إحاطة بعمودين، جداول بيانات واضحة، ونماذج رأسية مرتبة.",
    navModelEn: "Top Chapter Masthead",
    navModelAr: "ترويسة فصول علوية",
    dashboardModelEn: "2-Column Study Briefing",
    dashboardModelAr: "إحاطة ومفكرة بعمودين",
    dataViewEn: "Semantic Table",
    dataViewAr: "جدول بيانات منظم",
    formViewEn: "Vertical Section Form",
    formViewAr: "نموذج مقسّم رأسياً",
    surfaceModelEn: "Hairline Paper & Serif",
    surfaceModelAr: "ورق تحريري بخطوط دقيقة",
    displayFont: "Fraunces",
    arabicFont: "Amiri",
    pairedLayoutMode: "top_nav",
    previewBgLight: "#faf7f2",
    previewBgDark: "#161412",
    previewSurfaceLight: "#fffefb",
    previewSurfaceDark: "#211e1a",
    previewAccentHex: "#b45309",
  },
  {
    id: "command_os",
    paradigm: "command",
    paradigmCode: "Mode B",
    isNew: true,
    nameEn: "Command Center / Workspace",
    nameAr: "مركز القيادة ومساحة العمل",
    taglineEn: "100vh locked shell, collapsible rail, breadcrumbs, Cmd+K, Bento & Kanban",
    taglineAr: "ارتفاع شاشة كامل، شريط قابل للطي، بحث Cmd+K، شبكة Bento ولوحة Kanban",
    descEn:
      "Mode B (Command Center): Fixed 100vh SaaS viewport with internal scrollable Bento panels, collapsible left sidebar, top breadcrumb/Cmd+K bar, and Kanban boards.",
    descAr:
      "النمط ب (مركز القيادة): شاشة تطبيق بارتفاع كامل ولوحات قابلة للتمرير، شريط جانبي قابل للطي، وبحث Cmd+K، ولوحة Kanban.",
    navModelEn: "Collapsible Rail + Breadcrumb + ⌘K",
    navModelAr: "شريط قابل للطي + مسار + ⌘K",
    dashboardModelEn: "100vh Bento Grid Panels",
    dashboardModelAr: "شبكة Bento داخل الشاشة",
    dataViewEn: "Kanban Action Board",
    dataViewAr: "لوحة كانبان بإجراءات سريعة",
    formViewEn: "2-Col Workspace Form",
    formViewAr: "نموذج عمل ثنائي الأعمدة",
    surfaceModelEn: "Frosted OS Windows + Grid",
    surfaceModelAr: "نوافذ زجاجية وخلفية شبكية",
    displayFont: "Outfit",
    arabicFont: "Cairo",
    pairedLayoutMode: "bottom_dock",
    previewBgLight: "#eff3f9",
    previewBgDark: "#090e1a",
    previewSurfaceLight: "#ffffff",
    previewSurfaceDark: "#121b2f",
    previewAccentHex: "#0284c7",
  },
  {
    id: "focus_deck",
    paradigm: "spatial",
    paradigmCode: "Mode C",
    isNew: true,
    nameEn: "Spatial / Interactive Studio",
    nameAr: "الاستوديو التفاعلي المكاني",
    taglineEn: "Floating dock + radial launcher, swipe carousels, master-detail & wizard",
    taglineAr: "رصيف عائم وقائمة شعاعية، شرائح تمرير، عرض رئيسي-تفصيلي، ومعالج خطوات",
    descEn:
      "Mode C (Spatial / Interactive): Floating bottom dock with radial quick-menu, horizontal swipeable carousels, master-detail split view, slide-over drawers, and step-by-step form wizards.",
    descAr:
      "النمط ج (التفاعلي المكاني): شريط سفلي عائم وقائمة شعاعية، عرض أفقي للشرائح، تقسيم قائمة ومعاينة، درج جانبي، ومعالج خطوات.",
    navModelEn: "Floating Dock + Radial Menu",
    navModelAr: "رصيف عائم + قائمة شعاعية",
    dashboardModelEn: "Swipe Carousel + 1-2-3 Stage",
    dashboardModelAr: "تمرير أفقي + تدفق تفاعلي",
    dataViewEn: "Master-Detail Split View",
    dataViewAr: "عرض منقسم قائمة ومعاينة",
    formViewEn: "Multi-Step Wizard",
    formViewAr: "معالج خطوات تفاعلي",
    surfaceModelEn: "Calm Tactile Paper + Drawer",
    surfaceModelAr: "بطاقات هادئة ودرج منزلق",
    displayFont: "Plus Jakarta Sans",
    arabicFont: "IBM Plex Sans Arabic",
    pairedLayoutMode: "zen_focus",
    previewBgLight: "#f4f7f4",
    previewBgDark: "#101715",
    previewSurfaceLight: "#ffffff",
    previewSurfaceDark: "#18221f",
    previewAccentHex: "#059669",
  },
];

export const THEME_UX_PRESETS: ThemeUxPreset[] = [
  {
    id: "editorial_daylight",
    experienceId: "editorial_atelier",
    paradigmCode: "Mode A",
    nameEn: "Editorial Daylight Paper",
    nameAr: "الصحيفة النهارية الدافئة",
    subtitleEn: "Mode A · Warm Ivory + Serif + Table View",
    subtitleAr: "النمط أ · ورق عاجي + خطوط كلاسيكية + جداول",
    colorMode: "light",
    accent: "amber",
    themePresetId: "paper_ink",
    appearancePatch: {
      uiTheme: "sepia_study",
      density: "comfortable",
      cornerStyle: "sharp",
      cardStyle: "flat",
      borderStyle: "crisp",
      shadowLevel: "none",
      bgStyle: "solid",
    },
    swatchBg: "#faf7f2",
    swatchSurface: "#fffefb",
    swatchAccent: "#b45309",
  },
  {
    id: "editorial_midnight",
    experienceId: "editorial_atelier",
    paradigmCode: "Mode A",
    nameEn: "Editorial Ink Nocturne",
    nameAr: "المجلة الليلية الفاخرة",
    subtitleEn: "Mode A · Espresso Dark + Amber + Vertical Study",
    subtitleAr: "النمط أ · داكن دافئ + كهرماني + دراسة رأسية",
    colorMode: "dark",
    accent: "amber",
    themePresetId: "btc_classic",
    appearancePatch: {
      uiTheme: "classic",
      density: "comfortable",
      cornerStyle: "sharp",
      cardStyle: "flat",
      borderStyle: "subtle",
      shadowLevel: "none",
      bgStyle: "solid",
    },
    swatchBg: "#161412",
    swatchSurface: "#211e1a",
    swatchAccent: "#f59e0b",
  },
  {
    id: "command_obsidian",
    experienceId: "command_os",
    paradigmCode: "Mode B",
    nameEn: "Command Center Obsidian",
    nameAr: "مركز القيادة المظلم",
    subtitleEn: "Mode B · 100vh Bento + Collapsible Rail + Kanban",
    subtitleAr: "النمط ب · شاشة 100vh + قائمة قابلة للطي + كانبان",
    colorMode: "dark",
    accent: "indigo",
    themePresetId: "aurora_glass",
    appearancePatch: {
      uiTheme: "aurora_glass",
      density: "compact",
      cornerStyle: "rounded",
      cardStyle: "glass",
      borderStyle: "crisp",
      shadowLevel: "soft",
      bgStyle: "grid",
    },
    swatchBg: "#090e1a",
    swatchSurface: "#121b2f",
    swatchAccent: "#38bdf8",
  },
  {
    id: "command_cobalt",
    experienceId: "command_os",
    paradigmCode: "Mode B",
    nameEn: "Command Center Daylight",
    nameAr: "مركز القيادة الفاتح",
    subtitleEn: "Mode B · Light Workspace + Blueprint Grid + Cmd+K",
    subtitleAr: "النمط ب · مساحة فاتحة + شبكة هندسية + Cmd+K",
    colorMode: "light",
    accent: "indigo",
    themePresetId: "nordic_frost",
    appearancePatch: {
      uiTheme: "nordic_frost",
      density: "compact",
      cornerStyle: "rounded",
      cardStyle: "glass",
      borderStyle: "crisp",
      shadowLevel: "soft",
      bgStyle: "grid",
    },
    swatchBg: "#eef2f8",
    swatchSurface: "#ffffff",
    swatchAccent: "#0284c7",
  },
  {
    id: "spatial_oasis",
    experienceId: "focus_deck",
    paradigmCode: "Mode C",
    nameEn: "Spatial Oasis Calm",
    nameAr: "الواحة المكانية الهادئة",
    subtitleEn: "Mode C · Floating Dock + Master-Detail + Step Wizard",
    subtitleAr: "النمط ج · رصيف عائم + معاينة منقسمة + معالج خطوات",
    colorMode: "light",
    accent: "emerald",
    themePresetId: "sage_focus",
    appearancePatch: {
      uiTheme: "focus",
      density: "spacious",
      cornerStyle: "soft",
      cardStyle: "elevated",
      borderStyle: "subtle",
      shadowLevel: "soft",
      bgStyle: "ambient",
    },
    swatchBg: "#f4f7f4",
    swatchSurface: "#ffffff",
    swatchAccent: "#059669",
  },
  {
    id: "spatial_aurora",
    experienceId: "focus_deck",
    paradigmCode: "Mode C",
    nameEn: "Spatial Nocturnal Flow",
    nameAr: "التدفق المكاني الليلي",
    subtitleEn: "Mode C · Radial Quick Ring + Swipe Carousel + Drawer",
    subtitleAr: "النمط ج · قائمة شعاعية + شرائح أفقية + درج منزلق",
    colorMode: "dark",
    accent: "teal",
    themePresetId: "btc_classic",
    appearancePatch: {
      uiTheme: "focus",
      density: "spacious",
      cornerStyle: "soft",
      cardStyle: "elevated",
      borderStyle: "subtle",
      shadowLevel: "soft",
      bgStyle: "ambient",
    },
    swatchBg: "#101715",
    swatchSurface: "#17211e",
    swatchAccent: "#34d399",
  },
];

const UI_EXPERIENCE_SET = new Set<string>(UI_EXPERIENCES.map((e) => e.id));

export function isValidUiExperience(value: unknown): value is UiExperienceId {
  return typeof value === "string" && UI_EXPERIENCE_SET.has(value);
}

export function normalizeUiExperience(value: unknown): UiExperienceId {
  return isValidUiExperience(value) ? value : "classic";
}

export function getUiExperienceById(id: unknown): UiExperienceSpec {
  const normalized = normalizeUiExperience(id);
  return UI_EXPERIENCES.find((e) => e.id === normalized) ?? UI_EXPERIENCES[0]!;
}

export function getParadigmForExperience(id: unknown): ExperienceParadigm {
  return getUiExperienceById(id).paradigm;
}

export function getThemeUxPresetById(id: string): ThemeUxPreset | undefined {
  return THEME_UX_PRESETS.find((p) => p.id === id);
}
