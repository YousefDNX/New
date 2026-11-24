import { Check, Compass, Sidebar } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { UserSettingsRow } from "@/lib/firestore-data";
import { usePrefs, type ThemeMode } from "@/lib/preferences";
import {
  ACCENT_PRESETS,
  getContrastForeground,
  getContrastRatio,
  isValidHexColor,
  type AccentPreset,
  type AppearancePrefs,
} from "@/lib/settings";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { SegmentedChoice, SettingsRow, SettingsSectionCard } from "./SettingsPrimitives";

type SettingsPatch = Partial<Omit<UserSettingsRow, "user_id" | "theme">> & { theme?: string };

export function AppearanceSection({
  runSave,
  highlightedRowId,
}: {
  runSave: (apply: () => void, undo: () => void, patch: SettingsPatch) => void;
  highlightedRowId?: string | null;
}) {
  const {
    t,
    lang,
    theme,
    setTheme,
    appearance,
    setAppearance,
    themePresetId,
    setThemePresetId,
    layoutMode,
    setLayoutMode,
    layout,
    setLayout,
    btcVisualTheme,
    setBtcVisualTheme,
    btcNavLayout,
    setBtcNavLayout,
    effectiveBtcVisualTheme,
    effectiveBtcNavLayout,
    effectiveResolvedTheme,
  } = usePrefs();
  const [hexDraft, setHexDraft] = useState(appearance.customAccentHex);

  useEffect(() => {
    setHexDraft(appearance.customAccentHex);
  }, [appearance.customAccentHex]);

  function changeTheme(next: ThemeMode) {
    const prev = theme;
    runSave(
      () => setTheme(next),
      () => setTheme(prev),
      { theme: next },
    );
  }

  function selectVisualTheme(nextTheme: "btc_original" | "btc_alternative") {
    const prevBtcTheme = btcVisualTheme;
    const prevPresetId = themePresetId;
    const prevApp = appearance;

    const targetPresetId = nextTheme === "btc_original" ? "btc_classic" : null;
    const targetAccent = nextTheme === "btc_original" ? "teal" : "indigo";
    const targetHex = nextTheme === "btc_original" ? "#14b8a6" : "#6366f1";
    const targetFont = nextTheme === "btc_original" ? "sora" : "plus_jakarta";

    runSave(
      () => {
        setBtcVisualTheme(nextTheme);
        setThemePresetId(targetPresetId);
        setAppearance({
          uiTheme: nextTheme === "btc_alternative" ? "btc_alternative" : "classic",
          accent: targetAccent,
          customAccentHex: targetHex,
          fontFamily: targetFont,
        });
      },
      () => {
        setBtcVisualTheme(prevBtcTheme);
        setThemePresetId(prevPresetId);
        setAppearance(prevApp);
      },
      {
        theme_preset_id: targetPresetId,
        ui_theme: "classic",
        accent_color: targetAccent,
        custom_accent_hex: targetHex,
        font_family: targetFont,
      },
    );
  }

  function selectNavLayout(mode: "classic" | "modern") {
    const prevNavLayout = btcNavLayout;
    const prevMode = layoutMode;
    const prevLayout = layout;
    const nextLayoutMode = mode === "classic" ? "sidebar" : "top_nav";
    const nextSidebarMode = mode === "classic" ? "expanded" : "compact";
    runSave(
      () => {
        setBtcNavLayout(mode);
        setLayoutMode(nextLayoutMode);
        setLayout({ sidebarMode: nextSidebarMode });
      },
      () => {
        setBtcNavLayout(prevNavLayout);
        setLayoutMode(prevMode);
        setLayout(prevLayout);
      },
      {
        layout_mode: nextLayoutMode,
        sidebar_mode: nextSidebarMode,
      },
    );
  }

  function updateAppearance(patch: Partial<AppearancePrefs>, dbPatch: SettingsPatch) {
    const prev = appearance;
    const prevPresetId = themePresetId;
    runSave(
      () => {
        if (patch.uiTheme !== undefined || patch.accent !== undefined) {
          setThemePresetId(null);
        }
        setAppearance(patch);
      },
      () => {
        setThemePresetId(prevPresetId);
        setAppearance(prev);
      },
      dbPatch,
    );
  }

  const activeHex =
    appearance.accent === "custom"
      ? isValidHexColor(appearance.customAccentHex)
        ? appearance.customAccentHex
        : "#14b8a6"
      : ACCENT_PRESETS[appearance.accent].hex;
  const surfaceRefHex = effectiveResolvedTheme === "light" ? "#ffffff" : "#172030";
  const accentContrast = getContrastRatio(activeHex, surfaceRefHex);

  const activeVisualTheme = effectiveBtcVisualTheme;
  const activeNavLayout = effectiveBtcNavLayout;

  return (
    <div className="space-y-6">
      {/* Dedicated Visual Theme & Navigation Layout Section */}
      <SettingsSectionCard
        id="cat-visual-experience"
        title={lang === "ar" ? "الهوية البصرية وهيكل التنقل" : "Visual Theme & Navigation Layout"}
        desc={
          lang === "ar"
            ? "بدّل بشكل مستقل وفوري بين تصميمي BTC وهيكلَي التنقل في أي وقت دون التأثير على بياناتك."
            : "Switch live and independently between the two complete BTC visual themes and the two navigation architectures."
        }
        badge={
          <span className="rounded-md bg-primary/12 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            {lang === "ar" ? "نظام التصميم الثنائي" : "Dual Design System"}
          </span>
        }
      >
        {/* 1. Visual Theme Selection (Exactly 2 Options) */}
        <SettingsRow
          rowId="row-visual-themes"
          label={lang === "ar" ? "الهوية البصرية للمنصة" : "Visual Theme"}
          desc={
            lang === "ar"
              ? "تصميم BTC الأصلي المعتمد أو التصميم البديل الكامل (Atelier Indigo)."
              : "BTC Original approved flagship design or the complete BTC Alternative (Atelier Indigo) redesign."
          }
        >
          <div className="grid w-full gap-3 sm:grid-cols-2">
            {/* Theme 1: BTC Original */}
            <button
              type="button"
              data-testid="theme-preset-btc_original"
              aria-pressed={activeVisualTheme === "btc_original"}
              onClick={() => selectVisualTheme("btc_original")}
              className={`group relative flex flex-col rounded-xl border p-3.5 text-start transition-all cursor-pointer ${
                activeVisualTheme === "btc_original"
                  ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-sm"
                  : "border-border bg-surface-2/60 hover:border-primary/40 hover:bg-surface-2"
              }`}
            >
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="size-3.5 shrink-0 rounded-full ring-2 ring-teal-400/30"
                    style={{ backgroundColor: "#14b8a6" }}
                  />
                  <span className="text-xs font-bold text-foreground">
                    {lang === "ar" ? "BTC الأصلي" : "BTC Original"}
                  </span>
                </div>
                {activeVisualTheme === "btc_original" && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    <Check className="size-3" />
                    <span>{lang === "ar" ? "مفعل" : "Active"}</span>
                  </span>
                )}
              </div>
              <div
                aria-hidden="true"
                className="mb-2.5 flex h-12 items-center gap-1.5 rounded-lg border border-white/10 p-1.5"
                style={{ backgroundColor: "#0c1017" }}
              >
                <div className="h-full w-6 rounded bg-[#131924] p-1">
                  <div className="h-1.5 w-full rounded-sm bg-[#2dd4bf]" />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="h-2.5 w-2/3 rounded bg-[#1a2230]" />
                  <div className="h-4 w-full rounded bg-[#131924]" />
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {lang === "ar"
                  ? "الهوية الكلاسيكية المعتمدة بألوان الفيروزي والرمادي الداكن وخطوط Sora و IBM Plex."
                  : "Approved flagship teal & slate experience, classic Bento cards, Sora & IBM Plex typography."}
              </p>
            </button>

            {/* Theme 2: BTC Alternative: Complete Redesign */}
            <button
              type="button"
              data-testid="theme-preset-btc_alternative"
              aria-pressed={activeVisualTheme === "btc_alternative"}
              onClick={() => selectVisualTheme("btc_alternative")}
              className={`group relative flex flex-col rounded-xl border p-3.5 text-start transition-all cursor-pointer ${
                activeVisualTheme === "btc_alternative"
                  ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-sm"
                  : "border-border bg-surface-2/60 hover:border-primary/40 hover:bg-surface-2"
              }`}
            >
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="size-3.5 shrink-0 rounded-full ring-2 ring-indigo-400/35"
                    style={{ backgroundColor: "#6366f1" }}
                  />
                  <span className="text-xs font-bold text-foreground">
                    {lang === "ar"
                      ? "BTC البديل (إعادة تصميم كاملة)"
                      : "BTC Alternative (Redesign)"}
                  </span>
                </div>
                {activeVisualTheme === "btc_alternative" && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    <Check className="size-3" />
                    <span>{lang === "ar" ? "مفعل" : "Active"}</span>
                  </span>
                )}
              </div>
              <div
                aria-hidden="true"
                className="mb-2.5 flex h-12 items-center gap-1.5 rounded-lg border border-indigo-500/30 p-1.5"
                style={{ backgroundColor: "#080c14" }}
              >
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="h-2 w-1/2 rounded bg-[#6366f1]" />
                    <div className="h-2 w-4 rounded bg-[#f59e0b]" />
                  </div>
                  <div className="h-5 w-full rounded border border-indigo-400/20 bg-[#0e1424]" />
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {lang === "ar"
                  ? "تجربة Atelier Indigo التحريرية الجديدة كلياً بتركيب صفحة مستقل وخطوط Outfit و Plus Jakarta."
                  : "Editorial Atelier Indigo system with redesigned page architecture, Outfit typography & gold accents."}
              </p>
            </button>
          </div>
        </SettingsRow>

        {/* 2. Navigation Layout Selection (Exactly 2 Options) */}
        <SettingsRow
          rowId="row-nav-layouts"
          label={lang === "ar" ? "هيكل وتوزيع التنقل" : "Navigation Layout"}
          desc={
            lang === "ar"
              ? "اختر بين الشريط الجانبي الكلاسيكي أو شريط الأوامر العلوي مع منصة الوصول السريع."
              : "Choose between Classic left sidebar navigation or Modern floating command bar & quick dock."
          }
        >
          <div className="grid w-full gap-3 sm:grid-cols-2">
            {/* Layout A: Classic Navigation */}
            <button
              type="button"
              data-testid="layout-nav-classic"
              aria-pressed={activeNavLayout === "classic"}
              onClick={() => selectNavLayout("classic")}
              className={`group relative flex flex-col rounded-xl border p-3.5 text-start transition-all cursor-pointer ${
                activeNavLayout === "classic"
                  ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-sm"
                  : "border-border bg-surface-2/60 hover:border-primary/40 hover:bg-surface-2"
              }`}
            >
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sidebar className="size-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    {lang === "ar" ? "التنقل الكلاسيكي" : "Classic Navigation"}
                  </span>
                </div>
                {activeNavLayout === "classic" && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    <Check className="size-3" />
                    <span>{lang === "ar" ? "مفعل" : "Active"}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {lang === "ar"
                  ? "شريط جانبي منظم للمكتب مع تصنيفات واضحة وقابلية للطي، وشريط سفلي للهواتف."
                  : "Structured collapsible desktop sidebar with grouped navigation rails and classic mobile bottom tab bar."}
              </p>
            </button>

            {/* Layout B: Modern Navigation */}
            <button
              type="button"
              data-testid="layout-nav-modern"
              aria-pressed={activeNavLayout === "modern"}
              onClick={() => selectNavLayout("modern")}
              className={`group relative flex flex-col rounded-xl border p-3.5 text-start transition-all cursor-pointer ${
                activeNavLayout === "modern"
                  ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-sm"
                  : "border-border bg-surface-2/60 hover:border-primary/40 hover:bg-surface-2"
              }`}
            >
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Compass className="size-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    {lang === "ar" ? "التنقل العصري" : "Modern Navigation"}
                  </span>
                </div>
                {activeNavLayout === "modern" && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    <Check className="size-3" />
                    <span>{lang === "ar" ? "مفعل" : "Active"}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {lang === "ar"
                  ? "شريط علوي عائم من 3 مناطق، قائمة مساحات شاملة، ومنصة وصول سريع سفلية مع قوائم هاتفية مخصصة."
                  : "3-zone floating command bar, Spaces mega-directory, desktop quick dock, and capsule mobile island."}
              </p>
            </button>
          </div>
        </SettingsRow>
      </SettingsSectionCard>

      {/* Detail Controls (Mode, Density, Effects) */}
      <SettingsSectionCard
        id="cat-appearance"
        title={t("set.app.title")}
        desc={t("set.app.desc")}
        badge={<FeatureGuideTrigger featureId="settings-appearance" />}
      >
        <SettingsRow
          rowId="row-theme-mode"
          highlighted={highlightedRowId === "row-theme-mode"}
          label={t("set.theme")}
        >
          <SegmentedChoice<ThemeMode>
            label={t("set.theme")}
            value={theme}
            onChange={changeTheme}
            options={[
              { v: "dark", l: t("theme.dark") },
              { v: "light", l: t("theme.light") },
              { v: "system", l: t("theme.system") },
            ]}
          />
        </SettingsRow>

        <SettingsRow
          rowId="row-accent"
          highlighted={highlightedRowId === "row-accent"}
          label={t("set.accent")}
          desc={t("set.accent.d")}
        >
          <div className="flex flex-col items-start gap-2.5 sm:items-end">
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(ACCENT_PRESETS) as Exclude<AccentPreset, "custom">[]).map((preset) => {
                const info = ACCENT_PRESETS[preset];
                const active = appearance.accent === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    title={info.label}
                    aria-label={info.label}
                    aria-pressed={active}
                    onClick={() => updateAppearance({ accent: preset }, { accent_color: preset })}
                    className={`flex size-8 items-center justify-center rounded-full border-2 transition-transform ${
                      active ? "scale-110 border-foreground" : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: info.hex }}
                  >
                    {active && (
                      <Check
                        className="size-4"
                        style={{ color: getContrastForeground(info.hex) }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="custom-accent-hex" className="text-xs text-muted-foreground">
                {t("set.accent.custom")}
              </label>
              <Input
                id="custom-accent-hex"
                value={hexDraft}
                onChange={(e) => {
                  const v = e.target.value;
                  setHexDraft(v);
                  if (isValidHexColor(v)) {
                    updateAppearance(
                      { accent: "custom", customAccentHex: v },
                      { accent_color: "custom", custom_accent_hex: v },
                    );
                  }
                }}
                placeholder="#14b8a6"
                maxLength={7}
                dir="ltr"
                className="h-8 w-28 font-mono text-xs"
              />
              <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted-foreground tabular-nums">
                {accentContrast}:1
              </span>
            </div>
          </div>
        </SettingsRow>

        <SettingsRow
          rowId="row-density"
          highlighted={highlightedRowId === "row-density"}
          label={t("set.density")}
        >
          <SegmentedChoice
            label={t("set.density")}
            value={appearance.density}
            onChange={(v) => updateAppearance({ density: v }, { density: v })}
            options={[
              { v: "compact", l: t("set.density.compact") },
              { v: "comfortable", l: t("set.density.comfortable") },
              { v: "spacious", l: t("set.density.spacious") },
            ]}
          />
        </SettingsRow>

        <SettingsRow
          rowId="row-corner"
          highlighted={highlightedRowId === "row-corner"}
          label={t("set.corner")}
        >
          <SegmentedChoice
            label={t("set.corner")}
            value={appearance.cornerStyle}
            onChange={(v) => updateAppearance({ cornerStyle: v }, { corner_style: v })}
            options={[
              { v: "sharp", l: t("set.corner.sharp") },
              { v: "rounded", l: t("set.corner.rounded") },
              { v: "soft", l: t("set.corner.soft") },
            ]}
          />
        </SettingsRow>

        <SettingsRow
          id="app-effects"
          rowId="row-effects"
          highlighted={highlightedRowId === "row-effects"}
          label={t("set.effects")}
          desc={t("set.effects.d")}
        >
          <Switch
            id="app-effects"
            checked={appearance.reduceVisualEffects}
            onCheckedChange={(v) =>
              updateAppearance({ reduceVisualEffects: v }, { reduce_visual_effects: v })
            }
          />
        </SettingsRow>

        <SettingsRow
          rowId="row-reading-layout"
          highlighted={highlightedRowId === "row-reading-layout"}
          label={t("set.readingLayout")}
        >
          <SegmentedChoice
            label={t("set.readingLayout")}
            value={appearance.readingLayout}
            onChange={(v) => updateAppearance({ readingLayout: v }, { reading_layout: v })}
            options={[
              { v: "standard", l: t("set.readingLayout.standard") },
              { v: "focused", l: t("set.readingLayout.focused") },
            ]}
          />
        </SettingsRow>
      </SettingsSectionCard>
    </div>
  );
}
