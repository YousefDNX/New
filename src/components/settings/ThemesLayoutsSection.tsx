import { ArrowDown, ArrowUp, Check, Eye, EyeOff, LayoutGrid, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { UserSettingsRow } from "@/lib/firestore-data";
import { usePrefs } from "@/lib/preferences";
import {
  ACCENT_PRESETS,
  buildInterfaceThemePatch,
  buildLayoutWorkspacePatch,
  INTERFACE_THEME_SPECS,
  INTERFACE_THEMES,
  LAYOUT_WORKSPACES,
  normalizeWidgetOrder,
  type AppearancePrefs,
  type DashboardWidgetId,
  type InterfaceTheme,
  type LayoutPrefs,
  type LayoutWorkspaceId,
} from "@/lib/settings";
import {
  AdvancedDisclosure,
  SegmentedChoice,
  SettingsRow,
  SettingsSectionCard,
} from "./SettingsPrimitives";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { InterfaceLayoutStudio } from "./InterfaceLayoutStudio";
import { ThemeStudioDialog } from "./ThemeStudioDialog";
import { UiExperienceSwitcher } from "./UiExperienceSwitcher";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { useExperienceMode } from "@/lib/experience-mode";
import { getLayoutModeById, getThemePresetById, THEME_CATALOG } from "@/lib/theme-catalog";
import { getUiExperienceById, type ThemeUxPreset, type UiExperienceId } from "@/lib/ui-experiences";

type SettingsPatch = Partial<Omit<UserSettingsRow, "user_id" | "theme">> & { theme?: string };

const WIDGET_LABEL_KEY: Record<DashboardWidgetId, Parameters<ReturnType<typeof usePrefs>["t"]>[0]> =
  {
    welcome: "set.widget.welcome",
    stats: "set.widget.stats",
    pomodoro: "set.widget.pomodoro",
    areas: "set.widget.areas",
    tasks: "set.widget.tasks",
    goals: "set.widget.goals",
    activity: "set.widget.activity",
    hub: "set.widget.hub",
  };

export function ThemesLayoutsSection({
  runSave,
  highlightedRowId,
}: {
  runSave: (apply: () => void, undo: () => void, patch: SettingsPatch) => void;
  highlightedRowId?: string | null;
}) {
  const {
    t,
    lang,
    appearance,
    setAppearance,
    layout,
    setLayout,
    layoutMode,
    setLayoutMode,
    uiExperience,
    setUiExperience,
    theme,
    setTheme,
    themePresetId,
    setThemePresetId,
    effectiveAppearance,
    effectiveLayout,
    effectiveUiExperience,
    effectiveResolvedTheme,
    btcVisualTheme,
    setBtcVisualTheme,
    btcNavLayout,
    setBtcNavLayout,
    effectiveBtcVisualTheme,
    effectiveBtcNavLayout,
    isPreviewing,
    previewDraft,
    startPreview,
    cancelPreview,
  } = usePrefs();
  const { applyThemeUxPreset } = useExperienceMode();

  function applyUiExperience(nextId: UiExperienceId) {
    const prevExp = uiExperience;
    const prevLayout = layoutMode;
    const spec = getUiExperienceById(nextId);
    runSave(
      () => {
        cancelPreview();
        setUiExperience(nextId);
      },
      () => {
        setUiExperience(prevExp);
        setLayoutMode(prevLayout);
      },
      { layout_mode: spec.pairedLayoutMode },
    );
  }

  function applyUxPreset(preset: ThemeUxPreset) {
    const prevExp = uiExperience;
    const prevLayout = layoutMode;
    const prevTheme = theme;
    const prevPresetId = themePresetId;
    const prevApp = appearance;
    const expSpec = getUiExperienceById(preset.experienceId);
    runSave(
      () => applyThemeUxPreset(preset),
      () => {
        setUiExperience(prevExp);
        setLayoutMode(prevLayout);
        setTheme(prevTheme);
        setThemePresetId(prevPresetId);
        setAppearance(prevApp);
      },
      {
        layout_mode: expSpec.pairedLayoutMode,
        theme: preset.colorMode,
        theme_preset_id: preset.themePresetId,
        ui_theme: preset.appearancePatch.uiTheme ?? appearance.uiTheme,
        accent_color: preset.accent,
        density: preset.appearancePatch.density ?? appearance.density,
        corner_style: preset.appearancePatch.cornerStyle ?? appearance.cornerStyle,
        card_style: preset.appearancePatch.cardStyle ?? appearance.cardStyle,
        border_style: preset.appearancePatch.borderStyle ?? appearance.borderStyle,
        shadow_level: preset.appearancePatch.shadowLevel ?? appearance.shadowLevel,
        bg_style: preset.appearancePatch.bgStyle ?? appearance.bgStyle,
      },
    );
  }

  function updateAppearance(patch: Partial<AppearancePrefs>, dbPatch: SettingsPatch) {
    const prev = appearance;
    runSave(
      () => setAppearance(patch),
      () => setAppearance(prev),
      dbPatch,
    );
  }

  function applyInterfaceTheme(themeId: InterfaceTheme) {
    const patch = buildInterfaceThemePatch(themeId);
    const prev = appearance;
    const prevPresetId = themePresetId;
    const prevBtcTheme = btcVisualTheme;
    runSave(
      () => {
        cancelPreview();
        setThemePresetId(null);
        setBtcVisualTheme(themeId === "btc_alternative" ? "btc_alternative" : "btc_original");
        setAppearance(patch);
      },
      () => {
        setBtcVisualTheme(prevBtcTheme);
        setThemePresetId(prevPresetId);
        setAppearance(prev);
      },
      {
        ui_theme: patch.uiTheme,
        accent_color: patch.accent,
        corner_style: patch.cornerStyle,
        card_style: patch.cardStyle,
        border_style: patch.borderStyle,
        shadow_level: patch.shadowLevel,
        animation_level: patch.animationLevel,
        bg_style: patch.bgStyle,
        reading_layout: patch.readingLayout,
        theme_preset_id: null,
      },
    );
  }

  function applyWorkspacePreset(ws: LayoutWorkspaceId) {
    const { layout: nextLayout, appearance: appPatch } = buildLayoutWorkspacePatch(ws);
    const prevLayout = layout;
    const prevApp = appearance;
    runSave(
      () => {
        cancelPreview();
        setLayout(nextLayout);
        setAppearance(appPatch);
      },
      () => {
        setLayout(prevLayout);
        setAppearance(prevApp);
      },
      {
        layout_workspace: nextLayout.workspace,
        sidebar_mode: nextLayout.sidebarMode,
        show_quick_actions: nextLayout.showQuickActions,
        density: appPatch.density,
        reading_layout: appPatch.readingLayout,
        dashboard_hidden_widgets: appPatch.hiddenWidgets,
        ...(appPatch.widgetOrder ? { dashboard_widget_order: appPatch.widgetOrder } : {}),
      },
    );
  }

  function toggleWidget(id: DashboardWidgetId) {
    const hidden = effectiveAppearance.hiddenWidgets.includes(id)
      ? effectiveAppearance.hiddenWidgets.filter((w) => w !== id)
      : [...effectiveAppearance.hiddenWidgets, id];
    updateAppearance({ hiddenWidgets: hidden }, { dashboard_hidden_widgets: hidden });
  }

  function moveWidget(id: DashboardWidgetId, direction: -1 | 1) {
    const order = normalizeWidgetOrder(effectiveAppearance.widgetOrder);
    const idx = order.indexOf(id);
    const target = idx + direction;
    if (idx < 0 || target < 0 || target >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(idx, 1);
    if (!moved) return;
    next.splice(target, 0, moved);
    updateAppearance({ widgetOrder: next }, { dashboard_widget_order: next });
  }

  const orderedWidgets = normalizeWidgetOrder(effectiveAppearance.widgetOrder);

  const activePresetMeta = getThemePresetById(themePresetId);
  const activeLayoutMeta = getLayoutModeById(layoutMode);
  const activeExperienceMeta = getUiExperienceById(effectiveUiExperience);

  return (
    <SettingsSectionCard
      id="cat-themes_layouts"
      title={t("set.themes.title")}
      desc={t("set.themes.desc")}
      badge={<FeatureGuideTrigger featureId="settings-themes" />}
    >
      {/* Active Design System & Architecture Summary */}
      <div
        data-testid="active-design-system-banner"
        className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3.5 py-2.5 text-xs"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-primary">
            {lang === "ar" ? "الهوية النشطة:" : "Active BTC System:"}
          </span>
          <span className="font-semibold text-foreground" data-testid="active-btc-visual-theme">
            {effectiveBtcVisualTheme === "btc_alternative"
              ? lang === "ar"
                ? "BTC البديل (Atelier Indigo)"
                : "BTC Alternative (Atelier Indigo)"
              : lang === "ar"
                ? "BTC الأصلي"
                : "BTC Original"}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {lang === "ar" ? "التنقل:" : "Nav:"}{" "}
            <strong className="text-foreground" data-testid="active-btc-nav-layout">
              {effectiveBtcNavLayout === "modern"
                ? lang === "ar"
                  ? "العصري (شريط علوي ومنصة)"
                  : "Modern Bar & Dock"
                : lang === "ar"
                  ? "الكلاسيكي (شريط جانبي)"
                  : "Classic Sidebar"}
            </strong>
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {lang === "ar" ? "الوضع:" : "Mode:"}{" "}
            <strong className="text-foreground" data-testid="active-ux-name">
              {lang === "ar" ? activeExperienceMeta.nameAr : activeExperienceMeta.nameEn}
            </strong>
          </span>
          {activePresetMeta && (
            <>
              <span className="text-muted-foreground hidden sm:inline">·</span>
              <span className="text-muted-foreground hidden sm:inline">
                {lang === "ar" ? activePresetMeta.nameAr : activePresetMeta.nameEn}
              </span>
            </>
          )}
          <span className="text-muted-foreground hidden sm:inline">·</span>
          <span className="text-muted-foreground hidden sm:inline">
            {lang === "ar" ? activeLayoutMeta.nameAr : activeLayoutMeta.nameEn}
          </span>
        </div>
        <span className="text-[11px] font-medium text-muted-foreground">
          {effectiveResolvedTheme === "dark" ? t("theme.dark") : t("theme.light")}
        </span>
      </div>

      {/* Independent Dual Switchers for BTC Theme & Nav Layout */}
      <div className="mb-4 grid gap-3 rounded-xl border border-border bg-surface-2/40 p-3.5 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">
            {lang === "ar" ? "١. الهوية البصرية الكاملة" : "1. Visual Theme System"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="sm"
              data-testid="theme-preset-btc_original"
              variant={effectiveBtcVisualTheme === "btc_original" ? "default" : "outline"}
              onClick={() => {
                const prev = btcVisualTheme;
                runSave(
                  () => setBtcVisualTheme("btc_original"),
                  () => setBtcVisualTheme(prev),
                  { ui_theme: "classic" },
                );
              }}
              className="h-9 text-xs"
            >
              {lang === "ar" ? "BTC الأصلي" : "BTC Original"}
            </Button>
            <Button
              type="button"
              size="sm"
              data-testid="theme-preset-btc_alternative"
              variant={effectiveBtcVisualTheme === "btc_alternative" ? "default" : "outline"}
              onClick={() => {
                const prev = btcVisualTheme;
                runSave(
                  () => setBtcVisualTheme("btc_alternative"),
                  () => setBtcVisualTheme(prev),
                  { ui_theme: "classic" },
                );
              }}
              className="h-9 text-xs"
            >
              {lang === "ar" ? "BTC البديل" : "BTC Alternative"}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">
            {lang === "ar" ? "٢. هيكل التنقل المستقل" : "2. Navigation Architecture"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="sm"
              data-testid="layout-nav-classic"
              variant={effectiveBtcNavLayout === "classic" ? "default" : "outline"}
              onClick={() => {
                const prev = btcNavLayout;
                runSave(
                  () => {
                    setBtcNavLayout("classic");
                    setLayoutMode("classic");
                  },
                  () => setBtcNavLayout(prev),
                  { layout_mode: "classic", sidebar_mode: "expanded" },
                );
              }}
              className="h-9 text-xs"
            >
              {lang === "ar" ? "الكلاسيكي" : "Classic Nav"}
            </Button>
            <Button
              type="button"
              size="sm"
              data-testid="layout-nav-modern"
              variant={effectiveBtcNavLayout === "modern" ? "default" : "outline"}
              onClick={() => {
                const prev = btcNavLayout;
                runSave(
                  () => {
                    setBtcNavLayout("modern");
                    setLayoutMode("top_nav");
                  },
                  () => setBtcNavLayout(prev),
                  { layout_mode: "top_nav", sidebar_mode: "compact" },
                );
              }}
              className="h-9 text-xs"
            >
              {lang === "ar" ? "العصري" : "Modern Nav"}
            </Button>
          </div>
        </div>
      </div>

      {/* Step 0: Whole-Website UI & UX Experiences (Classic + 3 New Full-Site Experiences) */}
      <UiExperienceSwitcher onSelectExperience={applyUiExperience} onApplyPreset={applyUxPreset} />

      {/* Step 1: 10 Global Design Presets (Whole-Website Visual Systems) */}
      <div
        id="row-ui-theme"
        className={`scroll-mt-24 py-4 ${
          highlightedRowId === "row-ui-theme" ? "settings-search-hit bg-primary/8 px-2" : ""
        }`}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">
              {lang === "ar"
                ? `التصاميم العالمية (${THEME_CATALOG.length})`
                : `Global Design Presets (${THEME_CATALOG.length})`}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {lang === "ar"
                ? "تصميم واحد يغيّر الألوان والخطوط والبطاقات والتخطيط عبر المنصة بالكامل"
                : "One click transforms colors, typography, cards, navigation, and spacing across the entire platform"}
            </p>
          </div>
          <ThemeStudioDialog />
        </div>

        <ThemeSwitcher variant="presets" className="mb-6" />

        <div className="mb-3 border-t border-border/60 pt-4">
          <p className="text-sm font-semibold">{t("set.uiTheme.title")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("set.uiTheme.desc")}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {INTERFACE_THEMES.map((id) => {
            const spec = INTERFACE_THEME_SPECS[id];
            const accentHex =
              spec.accent === "custom"
                ? effectiveAppearance.customAccentHex
                : ACCENT_PRESETS[spec.accent].hex;
            const bg =
              effectiveResolvedTheme === "light" ? spec.previewBgLight : spec.previewBgDark;
            const surface =
              effectiveResolvedTheme === "light"
                ? spec.previewSurfaceLight
                : spec.previewSurfaceDark;
            const isApplied = appearance.uiTheme === id && !isPreviewing;
            const isPreviewed = isPreviewing && previewDraft?.appearance?.uiTheme === id;
            const isCurrent = effectiveAppearance.uiTheme === id;

            return (
              <div
                key={id}
                data-testid={`theme-card-${id}`}
                className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                  isCurrent
                    ? "border-primary bg-primary/6 ring-1 ring-primary/35"
                    : "border-border bg-surface-2/40 hover:border-border/90"
                }`}
              >
                <div>
                  {/* Mini UI visual preview canvas */}
                  <div
                    className="mb-3 flex h-20 overflow-hidden rounded-lg border border-white/10 p-2"
                    style={{ backgroundColor: bg }}
                    aria-hidden="true"
                  >
                    <div
                      className="me-2 flex w-10 flex-col gap-1.5 rounded-md p-1.5"
                      style={{ backgroundColor: surface }}
                    >
                      <span
                        className="h-2 w-full rounded-sm"
                        style={{ backgroundColor: accentHex }}
                      />
                      <span className="h-1.5 w-3/4 rounded-sm bg-current opacity-20" />
                      <span className="h-1.5 w-2/3 rounded-sm bg-current opacity-15" />
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <div
                        className="flex items-center justify-between rounded-md px-2 py-1"
                        style={{ backgroundColor: surface }}
                      >
                        <span className="h-1.5 w-12 rounded-full bg-current opacity-30" />
                        <span
                          className="h-2 w-5 rounded-full"
                          style={{ backgroundColor: accentHex }}
                        />
                      </div>
                      <div className="grid flex-1 grid-cols-2 gap-1.5">
                        <div className="rounded-md" style={{ backgroundColor: surface }} />
                        <div className="rounded-md" style={{ backgroundColor: surface }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-sm font-semibold">
                      {(() => {
                        const key = `set.uiTheme.${id}.name` as Parameters<typeof t>[0];
                        const translated = t(key);
                        if (translated !== key) return translated;
                        const fallbacks: Record<string, string> = {
                          nordic_frost: lang === "ar" ? "الصقيع الاسكندنافي" : "Nordic Frost",
                          sepia_study: lang === "ar" ? "دراسة دافئة (سيبيا)" : "Sepia Academic",
                          cyber_matrix: lang === "ar" ? "المصفوفة الرقمية" : "Cyber Matrix",
                          midnight_purple: lang === "ar" ? "بنفسج منتصف الليل" : "Midnight Cosmos",
                        };
                        return fallbacks[id] ?? id;
                      })()}
                    </p>
                    {isApplied && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
                        <Check className="size-3" />
                        {t("set.theme.applied")}
                      </span>
                    )}
                    {isPreviewed && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-xp/20 px-2 py-0.5 text-[11px] font-medium text-xp">
                        <Sparkles className="size-3" />
                        {t("set.preview.badge")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {(() => {
                      const key = `set.uiTheme.${id}.desc` as Parameters<typeof t>[0];
                      const translated = t(key);
                      if (translated !== key) return translated;
                      const fallbacks: Record<string, string> = {
                        nordic_frost:
                          lang === "ar"
                            ? "تباين جليدي أركتيك مع كحلي عميق ووضوح فائق."
                            : "Arctic cyan & deep navy with high-clarity crisp contrast.",
                        sepia_study:
                          lang === "ar"
                            ? "ورق دافئ ومريح للعين مثالي لجلسات المذاكرة الليلية."
                            : "Warm parchment paper & dark walnut for eye comfort.",
                        cyber_matrix:
                          lang === "ar"
                            ? "أسود فحمي مع توهج رقمي زمردي فائق التركيز."
                            : "Terminal obsidian with electric green matrix glow.",
                        midnight_purple:
                          lang === "ar"
                            ? "بنفسجي كوني عميق مع لمسات لافندر فضائية."
                            : "Deep velvet purple with radiant cosmic lavender accents.",
                      };
                      return fallbacks[id] ?? "";
                    })()}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    data-testid={`preview-theme-${id}`}
                    onClick={() =>
                      startPreview({
                        themePresetId: null,
                        appearance: buildInterfaceThemePatch(id),
                      })
                    }
                    className="flex-1 text-xs"
                  >
                    {t("set.preview.btn")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={isApplied ? "secondary" : "default"}
                    data-testid={`apply-theme-${id}`}
                    onClick={() => applyInterfaceTheme(id)}
                    className="flex-1 text-xs"
                  >
                    {isApplied ? t("set.theme.applied") : t("set.apply.btn")}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workspace Layout Presets */}
      <div
        id="row-workspace"
        className={`scroll-mt-24 py-4 ${
          highlightedRowId === "row-workspace" ? "settings-search-hit bg-primary/8 px-2" : ""
        }`}
      >
        <div className="mb-3">
          <p className="text-sm font-semibold">{t("set.workspace.title")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("set.workspace.desc")}</p>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {LAYOUT_WORKSPACES.map((ws) => {
            const active = effectiveLayout.workspace === ws;
            return (
              <button
                key={ws}
                type="button"
                onClick={() => applyWorkspacePreset(ws)}
                className={`flex items-start gap-3 rounded-xl border p-3 text-start transition-colors ${
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface-2/40 hover:border-primary/40"
                }`}
              >
                <div
                  className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                    active ? "bg-primary text-primary-foreground" : "bg-surface text-primary"
                  }`}
                >
                  <LayoutGrid className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {t(`set.workspace.${ws}.name` as Parameters<typeof t>[0])}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {t(`set.workspace.${ws}.desc` as Parameters<typeof t>[0])}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 border-t border-border/50 pt-4">
          <InterfaceLayoutStudio
            onSelectLayout={(m) => {
              const prevMode = layoutMode;
              const prevSidebar = layout.sidebarMode;
              runSave(
                () => {
                  setLayoutMode(m.id);
                  setLayout({ sidebarMode: m.sidebarMode });
                },
                () => {
                  setLayoutMode(prevMode);
                  setLayout({ sidebarMode: prevSidebar });
                },
                { sidebar_mode: m.sidebarMode, layout_mode: m.id },
              );
            }}
          />
        </div>
      </div>

      {/* Primary Layout Controls */}
      <SettingsRow
        rowId="row-sidebar-mode"
        highlighted={highlightedRowId === "row-sidebar-mode"}
        label={t("set.sidebarMode")}
        desc={t("set.sidebarMode.desc")}
      >
        <SegmentedChoice<LayoutPrefs["sidebarMode"]>
          label={t("set.sidebarMode")}
          value={effectiveLayout.sidebarMode}
          onChange={(v) => {
            const prev = layout;
            runSave(
              () => setLayout({ sidebarMode: v }),
              () => setLayout(prev),
              { sidebar_mode: v },
            );
          }}
          options={[
            { v: "expanded", l: t("set.sidebarMode.expanded") },
            { v: "compact", l: t("set.sidebarMode.compact") },
            { v: "simplified", l: t("set.sidebarMode.simplified") },
          ]}
        />
      </SettingsRow>

      <SettingsRow
        id="layout-quick-actions"
        rowId="row-quick-actions"
        highlighted={highlightedRowId === "row-quick-actions"}
        label={t("set.quickActions")}
        desc={t("set.quickActions.desc")}
      >
        <Switch
          id="layout-quick-actions"
          checked={effectiveLayout.showQuickActions}
          onCheckedChange={(v) => {
            const prev = layout;
            runSave(
              () => setLayout({ showQuickActions: v }),
              () => setLayout(prev),
              { show_quick_actions: v },
            );
          }}
        />
      </SettingsRow>

      <SettingsRow
        rowId="row-home-tab"
        highlighted={highlightedRowId === "row-home-tab"}
        label={t("set.homeTab")}
      >
        <SegmentedChoice
          label={t("set.homeTab")}
          value={effectiveAppearance.defaultHomeTab}
          onChange={(v) => updateAppearance({ defaultHomeTab: v }, { default_home_tab: v })}
          options={[
            { v: "dashboard", l: t("dash.tab.dashboard") },
            { v: "growthmap", l: t("dash.tab.growthmap") },
          ]}
        />
      </SettingsRow>

      {/* Progressive Disclosure for Fine Surface & Widget Controls */}
      <AdvancedDisclosure label={t("set.advanced.surfaces")}>
        <SettingsRow
          rowId="row-card-style"
          highlighted={highlightedRowId === "row-card-style"}
          label={t("set.cardStyle")}
        >
          <SegmentedChoice<AppearancePrefs["cardStyle"]>
            label={t("set.cardStyle")}
            value={effectiveAppearance.cardStyle}
            onChange={(v) => updateAppearance({ cardStyle: v }, { card_style: v })}
            options={[
              { v: "elevated", l: t("set.cardStyle.elevated") },
              { v: "flat", l: t("set.cardStyle.flat") },
              { v: "glass", l: t("set.cardStyle.glass") },
            ]}
          />
        </SettingsRow>

        <SettingsRow label={t("set.borderStyle")}>
          <SegmentedChoice<AppearancePrefs["borderStyle"]>
            label={t("set.borderStyle")}
            value={effectiveAppearance.borderStyle}
            onChange={(v) => updateAppearance({ borderStyle: v }, { border_style: v })}
            options={[
              { v: "subtle", l: t("set.borderStyle.subtle") },
              { v: "crisp", l: t("set.borderStyle.crisp") },
              { v: "minimal", l: t("set.borderStyle.minimal") },
            ]}
          />
        </SettingsRow>

        <SettingsRow label={t("set.shadowLevel")}>
          <SegmentedChoice<AppearancePrefs["shadowLevel"]>
            label={t("set.shadowLevel")}
            value={effectiveAppearance.shadowLevel}
            onChange={(v) => updateAppearance({ shadowLevel: v }, { shadow_level: v })}
            options={[
              { v: "none", l: t("set.shadowLevel.none") },
              { v: "soft", l: t("set.shadowLevel.soft") },
              { v: "rich", l: t("set.shadowLevel.rich") },
            ]}
          />
        </SettingsRow>

        <SettingsRow label={t("set.animationLevel")}>
          <SegmentedChoice<AppearancePrefs["animationLevel"]>
            label={t("set.animationLevel")}
            value={effectiveAppearance.animationLevel}
            onChange={(v) => updateAppearance({ animationLevel: v }, { animation_level: v })}
            options={[
              { v: "full", l: t("set.animationLevel.full") },
              { v: "subtle", l: t("set.animationLevel.subtle") },
              { v: "none", l: t("set.animationLevel.none") },
            ]}
          />
        </SettingsRow>

        <SettingsRow
          rowId="row-bg-style"
          highlighted={highlightedRowId === "row-bg-style"}
          label={t("set.bgStyle")}
        >
          <SegmentedChoice<AppearancePrefs["bgStyle"]>
            label={t("set.bgStyle")}
            value={effectiveAppearance.bgStyle}
            onChange={(v) => updateAppearance({ bgStyle: v }, { bg_style: v })}
            options={[
              { v: "ambient", l: t("set.bgStyle.ambient") },
              { v: "solid", l: t("set.bgStyle.solid") },
              { v: "grid", l: t("set.bgStyle.grid") },
            ]}
          />
        </SettingsRow>

        <div
          id="row-widgets"
          className={`scroll-mt-24 py-3.5 ${
            highlightedRowId === "row-widgets" ? "settings-search-hit bg-primary/8 px-2" : ""
          }`}
        >
          <div className="mb-3">
            <p className="text-sm font-medium">{t("set.widgets")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("set.widgets.d")}</p>
          </div>
          <div className="grid gap-2">
            {orderedWidgets.map((id, idx) => {
              const visible = !effectiveAppearance.hiddenWidgets.includes(id);
              return (
                <div
                  key={id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-surface-2/50 px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() => toggleWidget(id)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-start"
                  >
                    {visible ? (
                      <Eye className="size-4 shrink-0 text-primary" />
                    ) : (
                      <EyeOff className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span
                      className={`truncate text-sm ${
                        visible
                          ? "font-medium text-foreground"
                          : "text-muted-foreground line-through"
                      }`}
                    >
                      {t(WIDGET_LABEL_KEY[id])}
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveWidget(id, -1)}
                      aria-label={t("set.widget.up")}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === orderedWidgets.length - 1}
                      onClick={() => moveWidget(id, 1)}
                      aria-label={t("set.widget.down")}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AdvancedDisclosure>
    </SettingsSectionCard>
  );
}
