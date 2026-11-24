import { Check, Layers, Monitor, Moon, Palette, Sparkles, Sun, Wand2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useOptionalPrefs } from "@/lib/preferences";
import { BRAND, isBtcMode } from "@/config/brand";
import { useThemePersistence } from "@/hooks/use-theme-persistence";
import { useTheme } from "./ThemeContext";
import { ThemePreviewOverlay } from "./ThemePreviewOverlay";
import {
  THEME_CATALOG,
  THEME_CATEGORY_LABELS,
  type ThemeCatalogPreset,
  type ThemeCategory,
} from "@/lib/theme-catalog";
import type { BgStylePref, InterfaceTheme, ShadowLevelPref, ThemeMode } from "@/lib/settings";
import type { DictKey } from "@/lib/i18n-dict";

const FALLBACK_T = (k: string) => k;

export interface ThemeSwitcherProps {
  variant?: "full" | "compact" | "segmented" | "sidebar" | "presets";
  collapsed?: boolean;
  persistToAccount?: boolean;
  className?: string;
  onThemeChange?: (theme: InterfaceTheme) => void;
  onBgStyleChange?: (bgStyle: BgStylePref) => void;
  onShadowLevelChange?: (shadowLevel: ShadowLevelPref) => void;
  onPresetChange?: (presetId: string) => void;
}

export const UI_THEMES: {
  id: InterfaceTheme;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  accentColor: string;
  swatchHex: string;
  bgPreview: string;
}[] = [
  {
    id: "classic",
    labelEn: isBtcMode() ? `${BRAND.shortName} Classic` : "Classic NEXORA",
    labelAr: isBtcMode() ? `${BRAND.shortName} الكلاسيكي` : "نيكسورا الكلاسيكي",
    descEn: "Balanced contrast with refined student surfaces",
    descAr: "تباين متوازن مع أسطح دراسية متقنة",
    accentColor: "bg-teal-500",
    swatchHex: "#14b8a6",
    bgPreview: "bg-card border-border",
  },
  {
    id: "aurora_glass",
    labelEn: "Aurora Glass",
    labelAr: "زجاج الشفق",
    descEn: "Frosted glass surfaces with luminous cyan/emerald glow",
    descAr: "أسطح زجاجية بلورية مع توهج زمردي وساياني مشع",
    accentColor: "bg-cyan-400",
    swatchHex: "#22d3ee",
    bgPreview: "bg-card/70 backdrop-blur-md border-cyan-400/30",
  },
  {
    id: "aurora",
    labelEn: "Aurora Gradient",
    labelAr: "تدرج الشفق",
    descEn: "Vivid multi-color aurora sweeps and violet transitions",
    descAr: "تدرجات الشفق القطبي الملونة مع إضاءة بنفسجية",
    accentColor: "bg-indigo-500",
    swatchHex: "#6366f1",
    bgPreview: "bg-card border-indigo-400/30",
  },
  {
    id: "minimal",
    labelEn: "Premium Minimal",
    labelAr: "بسيط وفاخر",
    descEn: "Clean lines, flat surfaces, zero distractions",
    descAr: "خطوط نقية وأسطح مسطحة بدون تشتيت",
    accentColor: "bg-zinc-400",
    swatchHex: "#a1a1aa",
    bgPreview: "bg-background border-border/60",
  },
  {
    id: "soft_modern",
    labelEn: "Soft Modern",
    labelAr: "عصري هادئ",
    descEn: "Warm amber & cream surfaces with gentle ambient shadows",
    descAr: "أسطح دافئة وبطاقات ناعمة مريحة للعين",
    accentColor: "bg-amber-400",
    swatchHex: "#fbbf24",
    bgPreview: "bg-card border-amber-500/20",
  },
  {
    id: "creative_neon",
    labelEn: "Creative Neon",
    labelAr: "نيون إبداعي",
    descEn: "Dark obsidian canvas with electric cyan & vivid lime accents",
    descAr: "خلفية سبجية داكنة مع إضاءات نيون مشعة",
    accentColor: "bg-emerald-400",
    swatchHex: "#34d399",
    bgPreview: "bg-card border-emerald-400/40",
  },
  {
    id: "focus",
    labelEn: "Deep Focus",
    labelAr: "تركيز عميق",
    descEn: "Calm sage-tinted study atmosphere for long sprints",
    descAr: "أجواء دراسة هادئة لجلسات التركيز الطويلة",
    accentColor: "bg-emerald-600",
    swatchHex: "#059669",
    bgPreview: "bg-surface-2 border-border",
  },
  {
    id: "creative",
    labelEn: "Creative Studio",
    labelAr: "أستوديو إبداعي",
    descEn: "Lively tints and elevated expressive cards",
    descAr: "ألوان حيوية وبطاقات زجاجية عصرية",
    accentColor: "bg-rose-500",
    swatchHex: "#f43f5e",
    bgPreview: "bg-card border-rose-500/25",
  },
  {
    id: "nordic_frost",
    labelEn: "Nordic Frost",
    labelAr: "صقيع شمالي",
    descEn: "Arctic cyan & deep navy with high-clarity crisp contrast",
    descAr: "تباين جليدي أركتيك مع كحلي عميق ووضوح فائق",
    accentColor: "bg-sky-400",
    swatchHex: "#38bdf8",
    bgPreview: "bg-card border-sky-400/30",
  },
  {
    id: "sepia_study",
    labelEn: "Sepia Academic",
    labelAr: "سيبيا الأكاديمية",
    descEn: "Warm parchment paper & dark walnut for eye comfort",
    descAr: "ورق دافئ ومريح للعين مثالي لجلسات المذاكرة الليلية",
    accentColor: "bg-amber-600",
    swatchHex: "#d97706",
    bgPreview: "bg-card border-amber-600/30",
  },
  {
    id: "cyber_matrix",
    labelEn: "Cyber Matrix",
    labelAr: "ماتريكس سيبراني",
    descEn: "Terminal obsidian with electric green matrix glow",
    descAr: "أسود فحمي مع توهج رقمي زمردي فائق التركيز",
    accentColor: "bg-green-400",
    swatchHex: "#4ade80",
    bgPreview: "bg-card border-green-400/40",
  },
  {
    id: "midnight_purple",
    labelEn: "Midnight Cosmos",
    labelAr: "كون منتصف الليل",
    descEn: "Deep velvet purple with radiant cosmic lavender accents",
    descAr: "بنفسجي كوني عميق مع لمسات لافندر فضائية ساحرة",
    accentColor: "bg-purple-500",
    swatchHex: "#a855f7",
    bgPreview: "bg-card border-purple-500/30",
  },
];

export function ThemeSwitcher({
  variant = "full",
  collapsed = false,
  persistToAccount = true,
  className,
  onThemeChange,
  onBgStyleChange,
  onShadowLevelChange,
  onPresetChange,
}: ThemeSwitcherProps) {
  const themeContext = useTheme();
  const prefs = useOptionalPrefs();
  const { applyPreset, applyUiTheme, applyColorMode, applyAppearancePatch } = useThemePersistence();

  const {
    uiTheme: currentUiTheme,
    bgStyle: currentBgStyle,
    shadowLevel: currentShadowLevel,
    mode: currentMode,
    resolvedMode,
    themePresetId,
    applyThemePreset,
    themePresets,
    setUiTheme,
    setBgStyle,
    setShadowLevel,
    setMode,
  } = themeContext;

  const lang = prefs?.lang ?? "en";
  const t = prefs?.t ?? FALLBACK_T;

  const [categoryFilter, setCategoryFilter] = useState<ThemeCategory | "all">("all");
  const [activeTab, setActiveTab] = useState<"presets" | "base">("presets");

  const getThemeLabel = (themeId: InterfaceTheme) => t(`theme.name.${themeId}` as DictKey);
  const getThemeDesc = (themeId: InterfaceTheme) => t(`set.uiTheme.${themeId}.desc` as DictKey);

  const handleSelectPreset = useCallback(
    (preset: ThemeCatalogPreset) => {
      try {
        localStorage.setItem("themePreset", preset.id);
        localStorage.setItem("theme-preset", preset.id);
        localStorage.setItem("nexora.theme_preset_id", preset.id);
      } catch {
        // ignore localStorage errors
      }

      if (onPresetChange) {
        applyThemePreset(preset);
        onPresetChange(preset.id);
        toast.success(
          lang === "ar"
            ? `تم تفعيل ثيم: ${preset.nameAr}`
            : `Applied theme preset: ${preset.nameEn}`,
        );
        return;
      }

      if (persistToAccount && prefs) {
        void applyPreset(preset);
      } else {
        applyThemePreset(preset);
        toast.success(
          lang === "ar"
            ? `تم تفعيل ثيم: ${preset.nameAr}`
            : `Applied theme preset: ${preset.nameEn}`,
        );
      }
    },
    [applyThemePreset, applyPreset, onPresetChange, persistToAccount, prefs, lang],
  );

  const handleSelectUiTheme = useCallback(
    (themeId: InterfaceTheme) => {
      try {
        localStorage.removeItem("themePreset");
        localStorage.removeItem("theme-preset");
        localStorage.removeItem("nexora.theme_preset_id");
      } catch {
        // ignore storage errors
      }
      if (onThemeChange) {
        prefs?.setThemePresetId(null);
        setUiTheme(themeId);
        onThemeChange(themeId);
      } else if (persistToAccount && prefs) {
        void applyUiTheme(themeId);
      } else {
        prefs?.setThemePresetId(null);
        setUiTheme(themeId);
      }
    },
    [prefs, setUiTheme, onThemeChange, persistToAccount, applyUiTheme],
  );

  const handleSelectBgStyle = useCallback(
    (nextBg: BgStylePref) => {
      if (onBgStyleChange) {
        setBgStyle(nextBg);
        onBgStyleChange(nextBg);
      } else if (persistToAccount && prefs) {
        void applyAppearancePatch({ bgStyle: nextBg }, { bg_style: nextBg });
      } else {
        setBgStyle(nextBg);
      }
    },
    [setBgStyle, onBgStyleChange, persistToAccount, prefs, applyAppearancePatch],
  );

  const handleSelectShadowLevel = useCallback(
    (nextShadow: ShadowLevelPref) => {
      if (onShadowLevelChange) {
        setShadowLevel(nextShadow);
        onShadowLevelChange(nextShadow);
      } else if (persistToAccount && prefs) {
        void applyAppearancePatch({ shadowLevel: nextShadow }, { shadow_level: nextShadow });
      } else {
        setShadowLevel(nextShadow);
      }
    },
    [setShadowLevel, onShadowLevelChange, persistToAccount, prefs, applyAppearancePatch],
  );

  const handleSelectMode = useCallback(
    (mode: ThemeMode) => {
      if (persistToAccount && prefs && !onThemeChange) {
        void applyColorMode(mode);
      } else {
        setMode(mode);
      }
    },
    [setMode, persistToAccount, prefs, onThemeChange, applyColorMode],
  );

  const filteredPresets =
    categoryFilter === "all"
      ? themePresets
      : themePresets.filter((p) => p.category === categoryFilter);

  // Variant: presets only
  if (variant === "presets") {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Category Segmented Tabs and Fullscreen Preview */}
        <div className="flex flex-wrap items-center justify-between gap-2" role="tablist">
          <div className="flex flex-wrap items-center gap-1.5">
            {(["all", "minimal", "futuristic", "professional", "colorful", "nature"] as const).map(
              (cat) => {
                const active = categoryFilter === cat;
                const meta = THEME_CATEGORY_LABELS[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      "min-h-[38px] rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-border/70 bg-surface-2/70 text-muted-foreground hover:border-border hover:bg-surface-2 hover:text-foreground",
                    )}
                    aria-pressed={active}
                  >
                    {lang === "ar" ? meta.labelAr : meta.labelEn}
                  </button>
                );
              },
            )}
          </div>
          <ThemePreviewOverlay />
        </div>

        {/* 10 Global Design Presets Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPresets.map((preset) => {
            const isActive = themePresetId === preset.id;
            const useDarkSwatch =
              resolvedMode === "dark" ||
              (resolvedMode !== "light" && preset.recommendedMode === "dark");
            const swatchBg = useDarkSwatch ? preset.previewBgDark : preset.previewBgLight;
            const swatchSurface = useDarkSwatch
              ? preset.previewSurfaceDark
              : preset.previewSurfaceLight;
            return (
              <button
                key={preset.id}
                type="button"
                data-testid={`theme-preset-${preset.id}`}
                onClick={() => handleSelectPreset(preset)}
                className={cn(
                  "group relative flex flex-col rounded-xl border p-3.5 text-start transition-all",
                  isActive
                    ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40"
                    : "border-border bg-card/70 hover:border-primary/40 hover:bg-card",
                )}
                aria-pressed={isActive}
              >
                {/* Miniature visual canvas swatch */}
                <div
                  className="mb-3 flex h-16 w-full overflow-hidden rounded-lg border border-border/50 p-1.5"
                  style={{ backgroundColor: swatchBg }}
                  aria-hidden="true"
                >
                  <div
                    className="me-1.5 flex w-7 flex-col gap-1 rounded p-1"
                    style={{ backgroundColor: swatchSurface }}
                  >
                    <span
                      className="h-1.5 w-full rounded-sm"
                      style={{ backgroundColor: preset.accentHex }}
                    />
                    <span className="h-1 w-3/4 rounded-sm bg-current opacity-20" />
                    <span className="h-1 w-2/3 rounded-sm bg-current opacity-15" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div
                      className="flex items-center justify-between rounded px-1.5 py-1"
                      style={{ backgroundColor: swatchSurface }}
                    >
                      <span className="h-1 w-10 rounded-sm bg-current opacity-25" />
                      <span
                        className="h-1.5 w-4 rounded-sm"
                        style={{ backgroundColor: preset.glowHex }}
                      />
                    </div>
                    <div className="grid flex-1 grid-cols-2 gap-1">
                      <div className="rounded" style={{ backgroundColor: swatchSurface }} />
                      <div className="rounded" style={{ backgroundColor: swatchSurface }} />
                    </div>
                  </div>
                </div>

                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="size-3 shrink-0 rounded-sm ring-1 ring-border"
                      style={{ backgroundColor: preset.accentHex }}
                    />
                    <span className="truncate text-sm font-bold text-foreground">
                      {lang === "ar" ? preset.nameAr : preset.nameEn}
                    </span>
                  </div>
                  {isActive && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
                      <Check className="size-3" />
                      <span>{t("studio.activeBtn")}</span>
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {lang === "ar" ? preset.descAr : preset.descEn}
                </p>

                <div className="mt-3 flex w-full items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
                  <span className="truncate">
                    {lang === "ar" ? preset.arabicFont : preset.englishFont} ·{" "}
                    {preset.recommendedMode === "dark" ? t("theme.dark") : t("theme.light")}
                  </span>
                  <span
                    className="size-2 shrink-0 rounded-sm"
                    style={{ backgroundColor: preset.glowHex }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Variant: sidebar
  if (variant === "sidebar") {
    const activePreset = themePresets.find((p) => p.id === themePresetId);
    const activeThemeMeta = UI_THEMES.find((item) => item.id === currentUiTheme) ?? UI_THEMES[0]!;

    const cycleNextPreset = () => {
      const currentIdx = themePresets.findIndex((p) => p.id === themePresetId);
      const nextPreset = themePresets[(currentIdx + 1) % themePresets.length]!;
      handleSelectPreset(nextPreset);
    };

    if (collapsed) {
      return (
        <div
          data-testid="sidebar-theme-switcher"
          className={cn("flex flex-col items-center gap-1", className)}
        >
          <button
            type="button"
            onClick={cycleNextPreset}
            data-testid="sidebar-theme-cycle"
            title={
              activePreset
                ? `Preset: ${activePreset.nameEn}`
                : `Theme: ${getThemeLabel(activeThemeMeta.id)}`
            }
            aria-label={t("nav.uiTheme")}
            className="mx-auto flex size-8 items-center justify-center rounded-lg border border-border bg-surface-2/80 text-foreground hover:border-primary/40 hover:bg-surface-2"
          >
            <span
              className="size-3 rounded-full ring-2 ring-background"
              style={{ backgroundColor: activePreset?.accentHex ?? activeThemeMeta.swatchHex }}
            />
          </button>
        </div>
      );
    }

    return (
      <div
        data-testid="sidebar-theme-switcher"
        className={cn("rounded-xl border border-border bg-surface-2/60 p-2", className)}
      >
        <div className="mb-1.5 flex items-center justify-between gap-1 px-0.5">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Palette className="size-3 text-primary" />
            <span className="truncate">
              {activePreset
                ? lang === "ar"
                  ? activePreset.nameAr
                  : activePreset.nameEn
                : getThemeLabel(activeThemeMeta.id)}
            </span>
          </span>
          <button
            type="button"
            onClick={() => handleSelectMode(resolvedMode === "dark" ? "light" : "dark")}
            data-testid="sidebar-color-mode-toggle"
            aria-label={resolvedMode === "dark" ? t("theme.light") : t("theme.dark")}
            title={resolvedMode === "dark" ? t("theme.light") : t("theme.dark")}
            className="flex size-6 items-center justify-center rounded-md border border-border/70 bg-surface text-muted-foreground transition-colors hover:text-foreground"
          >
            {resolvedMode === "dark" ? <Sun className="size-3" /> : <Moon className="size-3" />}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1" role="group" aria-label={t("nav.uiTheme")}>
          {UI_THEMES.slice(0, 8).map((theme) => {
            const isActive = !themePresetId && currentUiTheme === theme.id;
            const label = getThemeLabel(theme.id);
            return (
              <button
                key={theme.id}
                type="button"
                data-testid={`sidebar-theme-opt-${theme.id}`}
                onClick={() => handleSelectUiTheme(theme.id)}
                title={label}
                aria-label={label}
                aria-pressed={isActive}
                className={cn(
                  "flex h-6 items-center justify-center rounded-md border transition-all",
                  isActive
                    ? "border-primary bg-primary/15 ring-1 ring-primary/40"
                    : "border-transparent bg-surface/60 hover:border-border hover:bg-surface",
                )}
              >
                <span
                  className={cn("size-2.5 rounded-full", isActive && "scale-110")}
                  style={{ backgroundColor: theme.swatchHex }}
                />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Variant: compact
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card/60 p-1 backdrop-blur-xs",
          className,
        )}
      >
        {themePresets.map((preset) => {
          const isActive = themePresetId === preset.id;
          const label = lang === "ar" ? preset.nameAr : preset.nameEn;
          return (
            <button
              key={preset.id}
              type="button"
              data-testid={`compact-preset-opt-${preset.id}`}
              onClick={() => handleSelectPreset(preset)}
              className={cn(
                "relative flex size-7 items-center justify-center rounded-md text-xs font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              title={label}
              aria-label={label}
              aria-pressed={isActive}
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: preset.accentHex }}
              />
            </button>
          );
        })}
      </div>
    );
  }

  // Variant: segmented
  if (variant === "segmented") {
    return (
      <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-2", className)}>
        {themePresets.map((preset) => {
          const isActive = themePresetId === preset.id;
          const label = lang === "ar" ? preset.nameAr : preset.nameEn;
          return (
            <button
              key={preset.id}
              type="button"
              data-testid={`segmented-preset-opt-${preset.id}`}
              onClick={() => handleSelectPreset(preset)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-start text-xs font-medium transition-all",
                isActive
                  ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/40"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:border-border hover:bg-card hover:text-foreground",
              )}
              aria-pressed={isActive}
            >
              <span
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: preset.accentHex }}
              />
              <span className="truncate">{label}</span>
              {isActive && <Check className="ms-auto size-3.5 shrink-0 text-primary" />}
            </button>
          );
        })}
      </div>
    );
  }

  // Variant: full (default)
  return (
    <div className={cn("space-y-5", className)}>
      {/* Top Header & Color Mode Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-base font-bold text-foreground flex items-center gap-2">
            <Palette className="size-4.5 text-primary" />
            <span>
              {lang === "ar"
                ? "أستوديو الثيمات وتصميم الواجهة"
                : "Theme Studio & Layout Customizer"}
            </span>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {lang === "ar"
              ? "اختر من بين 10 تصاميم شاملة تغيّر هوية المنصة بالكامل"
              : "Toggle between 10 full-platform visual design presets with synchronized typography and depth"}
          </p>
        </div>

        {/* View Switcher: 10 Presets vs Custom Base Themes */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <div className="flex items-center rounded-lg border border-border bg-card/60 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                activeTab === "presets"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-1.5">
                <Wand2 className="size-3" />
                <span>{lang === "ar" ? "10 تصاميم شاملة" : "10 Presets"}</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("base")}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                activeTab === "base"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-1.5">
                <Palette className="size-3" />
                <span>{lang === "ar" ? "الأساسي (12)" : "Base Themes"}</span>
              </span>
            </button>
          </div>

          {/* Color Mode Switcher (Dark / Light / System) */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card/60 p-1">
            <button
              type="button"
              onClick={() => handleSelectMode("dark")}
              className={cn(
                "flex size-7 items-center justify-center rounded-md text-xs transition-colors",
                currentMode === "dark"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title={t("theme.dark")}
              aria-label={t("theme.dark")}
              aria-pressed={currentMode === "dark"}
            >
              <Moon className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleSelectMode("light")}
              className={cn(
                "flex size-7 items-center justify-center rounded-md text-xs transition-colors",
                currentMode === "light"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title={t("theme.light")}
              aria-label={t("theme.light")}
              aria-pressed={currentMode === "light"}
            >
              <Sun className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleSelectMode("system")}
              className={cn(
                "flex size-7 items-center justify-center rounded-md text-xs transition-colors",
                currentMode === "system"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title={t("theme.system")}
              aria-label={t("theme.system")}
              aria-pressed={currentMode === "system"}
            >
              <Monitor className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {activeTab === "presets" ? (
        <div className="space-y-4">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5" role="tablist">
            {(["all", "minimal", "futuristic", "professional", "colorful", "nature"] as const).map(
              (cat) => {
                const active = categoryFilter === cat;
                const meta = THEME_CATEGORY_LABELS[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      "min-h-[38px] rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-border/70 bg-surface-2/70 text-muted-foreground hover:border-border hover:bg-surface-2 hover:text-foreground",
                    )}
                    aria-pressed={active}
                  >
                    {lang === "ar" ? meta.labelAr : meta.labelEn}
                  </button>
                );
              },
            )}
          </div>

          {/* 10 Design Presets Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPresets.map((preset) => {
              const isActive = themePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  data-testid={`theme-preset-${preset.id}`}
                  onClick={() => handleSelectPreset(preset)}
                  className={cn(
                    "group relative flex flex-col rounded-xl border p-3.5 text-start transition-all",
                    isActive
                      ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40"
                      : "border-border bg-card/60 hover:border-primary/40 hover:bg-card",
                  )}
                  aria-pressed={isActive}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="size-3 shrink-0 rounded-sm ring-1 ring-border"
                        style={{ backgroundColor: preset.accentHex }}
                      />
                      <span className="truncate text-sm font-bold text-foreground">
                        {lang === "ar" ? preset.nameAr : preset.nameEn}
                      </span>
                    </div>
                    {isActive && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
                        <Check className="size-3" />
                        <span>{t("studio.activeBtn")}</span>
                      </span>
                    )}
                  </div>

                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {lang === "ar" ? preset.descAr : preset.descEn}
                  </p>

                  <div className="mt-3 flex w-full items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
                    <span className="truncate">
                      {lang === "ar" ? preset.arabicFont : preset.englishFont} ·{" "}
                      {preset.recommendedMode === "dark" ? t("theme.dark") : t("theme.light")}
                    </span>
                    <span
                      className="size-2 shrink-0 rounded-sm"
                      style={{ backgroundColor: preset.glowHex }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Base Themes Grid */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {UI_THEMES.map((theme) => {
              const isActive = currentUiTheme === theme.id && !themePresetId;
              return (
                <button
                  key={theme.id}
                  type="button"
                  data-testid={`ui-theme-opt-${theme.id}`}
                  onClick={() => handleSelectUiTheme(theme.id)}
                  className={cn(
                    "group relative flex flex-col items-start rounded-xl border p-3.5 text-start transition-all hover:scale-[1.01]",
                    theme.bgPreview,
                    isActive
                      ? "border-primary shadow-md ring-2 ring-primary/30"
                      : "border-border/70 hover:border-border hover:shadow-xs",
                  )}
                  aria-pressed={isActive}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-3 rounded-full ring-2 ring-background",
                          theme.accentColor,
                        )}
                      />
                      <span className="text-sm font-semibold text-foreground">
                        {getThemeLabel(theme.id)}
                      </span>
                    </div>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        <Check className="size-3" />
                        <span>{t("studio.activeBtn")}</span>
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {getThemeDesc(theme.id)}
                  </p>

                  <div className="mt-3 flex w-full items-center justify-between border-t border-border/40 pt-2 font-mono text-[11px] text-muted-foreground ltr-only">
                    <span>data-ui-theme=&quot;{theme.id}&quot;</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary text-[10px]">
                      {t("studio.applyBtn")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Background Style & Shadow Depth selectors */}
      <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-2/50 p-3">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-foreground">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              {t("set.bgStyle")}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">{currentBgStyle}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5" role="group" aria-label={t("set.bgStyle")}>
            {(["ambient", "solid", "grid"] as const).map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() => handleSelectBgStyle(bg)}
                aria-pressed={currentBgStyle === bg}
                className={cn(
                  "rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                  currentBgStyle === bg
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`set.bgStyle.${bg}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface-2/50 p-3">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-foreground">
            <span className="flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" />
              {t("set.shadowLevel")}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {currentShadowLevel}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5" role="group" aria-label={t("set.shadowLevel")}>
            {(["none", "soft", "rich"] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => handleSelectShadowLevel(lvl)}
                aria-pressed={currentShadowLevel === lvl}
                className={cn(
                  "rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                  currentShadowLevel === lvl
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`set.shadowLevel.${lvl}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
