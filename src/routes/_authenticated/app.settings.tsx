import { createFileRoute } from "@tanstack/react-router";
import {
  Accessibility,
  Bell,
  BookOpen,
  Bot,
  Check,
  Globe,
  Info,
  Palette,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Type,
  User,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/Page";
import { UpgradeAccountDialog } from "@/components/auth/UpgradeAccountDialog";
import { PWAInstallButton } from "@/components/pwa/PWAInstallButton";
import { AccessibilitySection } from "@/components/settings/AccessibilitySection";
import { AccountProfileSection } from "@/components/settings/AccountProfileSection";
import { AiPreferencesSection } from "@/components/settings/AiPreferencesSection";
import { AppearanceSection } from "@/components/settings/AppearanceSection";
import { LanguageRegionSection } from "@/components/settings/LanguageRegionSection";
import { NotificationsSection } from "@/components/settings/NotificationsSection";
import { PrivacySecuritySection } from "@/components/settings/PrivacySecuritySection";
import {
  SETTINGS_SEARCH_INDEX,
  SettingsSectionCard,
  type SettingsCategoryId,
} from "@/components/settings/SettingsPrimitives";
import { StudyPreferencesSection } from "@/components/settings/StudyPreferencesSection";
import { TypographySection } from "@/components/settings/TypographySection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfile, useUser } from "@/hooks/use-nexora";
import {
  CloudSettingsFallbackError,
  OfflineSettingsError,
  useSaveProfile,
  useSaveSettings,
} from "@/hooks/use-settings";
import { trackHubEvent } from "@/lib/analytics";
import { defaultSettingsDoc, type UserSettingsRow } from "@/lib/firestore-data";
import type { DictKey, Lang } from "@/lib/i18n-dict";
import { usePrefs } from "@/lib/preferences";
import { usePWA } from "@/lib/pwa";
import { normalizeRegion } from "@/lib/settings";
import { LAYOUT_MODES } from "@/lib/theme-catalog";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/settings")({
  head: () => ({
    meta: [
      { title: `Settings & Personalization — ${BRAND.name}` },
      {
        name: "description",
        content: `Customize themes, layouts, typography, WCAG accessibility, language, study preferences, ${BRAND.shortName} AI, notifications, and privacy.`,
      },
      { property: "og:title", content: `Settings & Personalization — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Customize themes, layouts, typography, WCAG accessibility, language, study preferences, ${BRAND.shortName} AI, notifications, and privacy.`,
      },
    ],
  }),
  component: SettingsPage,
});

type FilterTab = "all" | SettingsCategoryId;

const CATEGORIES: {
  id: SettingsCategoryId;
  labelKey: DictKey;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "appearance", labelKey: "set.cat.appearance", Icon: Palette },
  { id: "typography", labelKey: "set.cat.typography", Icon: Type },
  { id: "accessibility", labelKey: "set.cat.accessibility", Icon: Accessibility },
  { id: "language_region", labelKey: "set.cat.language_region", Icon: Globe },
  { id: "study", labelKey: "set.cat.study", Icon: BookOpen },
  { id: "ai", labelKey: "set.cat.ai", Icon: Bot },
  { id: "notifications", labelKey: "set.cat.notifications", Icon: Bell },
  { id: "privacy_security", labelKey: "set.cat.privacy_security", Icon: ShieldCheck },
  { id: "account", labelKey: "set.cat.account", Icon: User },
];

type SettingsPatch = Partial<Omit<UserSettingsRow, "user_id" | "theme">> & { theme?: string };

function SettingsPage() {
  const {
    t,
    lang,
    setLang,
    theme,
    setTheme,
    appearance,
    setAppearance,
    typography,
    setTypography,
    layout,
    setLayout,
    themePresetId,
    setThemePresetId,
    layoutMode,
    setLayoutMode,
    uiExperience,
    setUiExperience,
    effectiveBtcVisualTheme,
    effectiveBtcNavLayout,
    resetAllPreferences,
    announce,
    isPreviewing,
    commitPreview,
    cancelPreview,
  } = usePrefs();
  const isAltTheme = effectiveBtcVisualTheme === "btc_alternative";
  const { data: user } = useUser();
  const { data: profile } = useProfile();
  const saveSettings = useSaveSettings();
  const saveProfile = useSaveProfile();

  const { isOnline, installed, swSupported } = usePWA();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [region, setRegion] = useState("global");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);
  const saveSeqRef = useRef(0);

  useEffect(() => {
    if (profile) {
      setRegion(normalizeRegion(profile.region));
    }
  }, [profile]);

  useEffect(() => {
    return () => {
      cancelPreview();
    };
  }, [cancelPreview]);

  useEffect(() => {
    if (!highlightedRowId) return;
    const timer = setTimeout(() => {
      const targetEl = document.getElementById(highlightedRowId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 60);
    const clearTimer = setTimeout(() => setHighlightedRowId(null), 1900);
    return () => {
      clearTimeout(timer);
      clearTimeout(clearTimer);
    };
  }, [highlightedRowId, activeTab]);

  function runSave(apply: () => void, undo: () => void, patch: SettingsPatch) {
    const seq = ++saveSeqRef.current;
    apply();
    if (patch.ui_theme) {
      void trackHubEvent("ui_theme_changed", { ui_theme: patch.ui_theme, source: "settings" });
    }
    if (patch.density) {
      void trackHubEvent("ui_density_changed", { density: patch.density, source: "settings" });
    }
    void saveSettings(patch)
      .then(() => {
        toast.success(t("set.saved"), { id: "set-saved", duration: 1200 });
        announce(t("set.saved"));
      })
      .catch((err) => {
        if (err instanceof OfflineSettingsError || err instanceof CloudSettingsFallbackError) {
          toast.info(t("set.savedLocalFallback"), { id: "set-saved", duration: 1800 });
          return;
        }
        if (saveSeqRef.current === seq) {
          undo();
        }
        toast.error(t("set.error"));
      });
  }

  function handleCommitPreview() {
    const prevSnapshot = {
      theme,
      appearance,
      typography,
      layout,
      themePresetId,
      layoutMode,
      uiExperience,
    };
    const committed = commitPreview();
    if (!committed) return;
    const patch: SettingsPatch = {};
    if (committed.theme) patch.theme = committed.theme;
    if (committed.appearance) {
      if (committed.appearance.uiTheme !== undefined) patch.ui_theme = committed.appearance.uiTheme;
      if (committed.appearance.accent !== undefined) {
        patch.accent_color = committed.appearance.accent;
      }
      if (committed.appearance.customAccentHex !== undefined) {
        patch.custom_accent_hex = committed.appearance.customAccentHex;
      }
      if (committed.appearance.density !== undefined) {
        patch.density = committed.appearance.density;
      }
      if (committed.appearance.cornerStyle !== undefined) {
        patch.corner_style = committed.appearance.cornerStyle;
      }
      if (committed.appearance.cardStyle !== undefined) {
        patch.card_style = committed.appearance.cardStyle;
      }
      if (committed.appearance.borderStyle !== undefined) {
        patch.border_style = committed.appearance.borderStyle;
      }
      if (committed.appearance.shadowLevel !== undefined) {
        patch.shadow_level = committed.appearance.shadowLevel;
      }
      if (committed.appearance.animationLevel !== undefined) {
        patch.animation_level = committed.appearance.animationLevel;
      }
      if (committed.appearance.bgStyle !== undefined) patch.bg_style = committed.appearance.bgStyle;
      if (committed.appearance.fontFamily !== undefined) {
        patch.font_family = committed.appearance.fontFamily;
      }
      if (committed.appearance.reduceVisualEffects !== undefined) {
        patch.reduce_visual_effects = committed.appearance.reduceVisualEffects;
      }
      if (committed.appearance.readingLayout !== undefined) {
        patch.reading_layout = committed.appearance.readingLayout;
      }
      if (committed.appearance.defaultHomeTab !== undefined) {
        patch.default_home_tab = committed.appearance.defaultHomeTab;
      }
      if (committed.appearance.hiddenWidgets !== undefined) {
        patch.dashboard_hidden_widgets = committed.appearance.hiddenWidgets;
      }
      if (committed.appearance.widgetOrder !== undefined) {
        patch.dashboard_widget_order = committed.appearance.widgetOrder;
      }
    }
    if (committed.typography) {
      if (committed.typography.readabilityPreset !== undefined) {
        patch.readability_preset = committed.typography.readabilityPreset;
      }
      if (committed.typography.fontFamily !== undefined) {
        patch.font_family = committed.typography.fontFamily;
      }
      if (committed.typography.fontScale !== undefined) {
        patch.font_scale = committed.typography.fontScale;
      }
      if (committed.typography.headingScale !== undefined) {
        patch.heading_scale = committed.typography.headingScale;
      }
      if (committed.typography.lineHeight !== undefined) {
        patch.line_height = committed.typography.lineHeight;
      }
      if (committed.typography.letterSpacing !== undefined) {
        patch.letter_spacing = committed.typography.letterSpacing;
      }
      if (committed.typography.fontWeight !== undefined) {
        patch.font_weight = committed.typography.fontWeight;
      }
    }
    if (committed.layout) {
      if (committed.layout.workspace !== undefined) {
        patch.layout_workspace = committed.layout.workspace;
      }
      if (committed.layout.sidebarMode !== undefined) {
        patch.sidebar_mode = committed.layout.sidebarMode;
      }
      if (committed.layout.showQuickActions !== undefined) {
        patch.show_quick_actions = committed.layout.showQuickActions;
      }
    }
    if (committed.layoutMode) {
      patch.layout_mode = committed.layoutMode;
      if (patch.sidebar_mode === undefined) {
        const modeSpec = LAYOUT_MODES.find((m) => m.id === committed.layoutMode);
        if (modeSpec) patch.sidebar_mode = modeSpec.sidebarMode;
      }
    }

    if (Object.keys(patch).length > 0) {
      void saveSettings(patch)
        .then(() => {
          toast.success(t("set.saved"), { id: "set-saved", duration: 1200 });
          announce(t("set.saved"));
        })
        .catch((err) => {
          if (err instanceof OfflineSettingsError || err instanceof CloudSettingsFallbackError) {
            toast.info(t("set.savedLocalFallback"), { id: "set-saved", duration: 1800 });
            return;
          }
          setTheme(prevSnapshot.theme);
          setAppearance(prevSnapshot.appearance);
          setTypography(prevSnapshot.typography);
          setLayout(prevSnapshot.layout);
          setThemePresetId(prevSnapshot.themePresetId);
          setLayoutMode(prevSnapshot.layoutMode);
          setUiExperience(prevSnapshot.uiExperience);
          toast.error(t("set.error"));
        });
    } else {
      toast.success(t("set.saved"), { id: "set-saved", duration: 1200 });
    }
  }

  function handleLangChange(nextLang: Lang) {
    const prev = lang;
    setLang(nextLang);
    void saveProfile({ language: nextLang })
      .then(() => toast.success(t("set.saved"), { id: "set-saved", duration: 1200 }))
      .catch(() => {
        setLang(prev);
        toast.error(t("set.error"));
      });
  }

  function handleRegionChange(nextRegion: string) {
    const prev = region;
    setRegion(nextRegion);
    void saveProfile({ region: nextRegion })
      .then(() => toast.success(t("set.saved"), { id: "set-saved", duration: 1200 }))
      .catch(() => {
        setRegion(prev);
        toast.error(t("set.error"));
      });
  }

  async function handleResetDefaults() {
    resetAllPreferences();
    if (user?.uid) {
      try {
        const defaults = defaultSettingsDoc(user.uid);
        const { user_id: _uid, ...rest } = defaults;
        await saveSettings(rest);
      } catch (err) {
        if (err instanceof OfflineSettingsError || err instanceof CloudSettingsFallbackError) {
          toast.info(t("set.savedLocalFallback"), { id: "set-saved", duration: 1800 });
          return;
        }
        toast.error(t("set.resetFailed"));
        return;
      }
    }
    toast.success(t("set.resetAll.done"));
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchMatches = useMemo(() => {
    if (!normalizedQuery) return [];
    return SETTINGS_SEARCH_INDEX.filter((item) => {
      const translatedLabel = t(item.labelKey).toLowerCase();
      return (
        translatedLabel.includes(normalizedQuery) ||
        item.keywords.includes(normalizedQuery) ||
        item.category.includes(normalizedQuery)
      );
    });
  }, [normalizedQuery, t]);

  const matchedCategories = useMemo(
    () => new Set(searchMatches.map((m) => m.category)),
    [searchMatches],
  );

  function shouldShowSection(cat: SettingsCategoryId): boolean {
    if (normalizedQuery) return matchedCategories.has(cat);
    return activeTab === "all" || activeTab === cat;
  }

  return (
    <div
      data-testid={isAltTheme ? "btc-alternative-settings" : undefined}
      className="mx-auto max-w-7xl space-y-6"
    >
      {isAltTheme ? (
        <header className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="font-semibold text-primary">
                  {lang === "ar" ? "استوديو تخصيص النظام" : "Atelier Indigo System Studio"}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {effectiveBtcNavLayout === "modern"
                    ? lang === "ar"
                      ? "التنقل العصري"
                      : "Modern Navigation"
                    : lang === "ar"
                      ? "التنقل الكلاسيكي"
                      : "Classic Navigation"}
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {t("set.title")}
              </h1>
              <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {t("set.sub")}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleResetDefaults}
              className="gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              <span>{t("set.resetAll")}</span>
            </Button>
          </div>
        </header>
      ) : (
        <PageHeader
          title={t("set.title")}
          subtitle={t("set.sub")}
          actions={
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleResetDefaults}
              className="gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              <span>{t("set.resetAll")}</span>
            </Button>
          }
        />
      )}

      {/* Sticky Live Preview Confirmation Bar */}
      {isPreviewing && (
        <div
          role="status"
          data-testid="live-preview-bar"
          className="sticky top-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/50 bg-surface/95 px-4 py-3 shadow-glow backdrop-blur-md"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="size-4 text-xp" />
            <span>{t("set.preview.banner")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              data-testid="preview-cancel-btn"
              onClick={cancelPreview}
            >
              {t("set.preview.cancel")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="glow"
              data-testid="preview-apply-btn"
              onClick={handleCommitPreview}
              className="gap-1.5"
            >
              <Check className="size-3.5" />
              <span>{t("set.preview.apply")}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label={t("set.search.placeholder")}
          placeholder={t("set.search.placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 ps-10 pe-9"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            aria-label={t("common.cancel")}
            className="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Live Search Jump Pills */}
      {normalizedQuery && (
        <div className="surface-card p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("set.search.results")} ({searchMatches.length})
          </p>
          {searchMatches.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("set.search.empty")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {searchMatches.map((m) => (
                <button
                  key={`${m.category}-${m.labelKey}-${m.rowId}`}
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab(m.category);
                    setHighlightedRowId(m.rowId);
                  }}
                  className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary"
                >
                  {t(m.labelKey)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Split Layout: Category Rail + Settings Sections */}
      <div className="grid gap-6 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:items-start">
        {/* Category Navigation */}
        <nav
          aria-label={t("set.title")}
          className="flex gap-1.5 overflow-x-auto pb-1 lg:sticky lg:top-20 lg:flex-col lg:overflow-visible lg:pb-0"
        >
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`min-h-[44px] shrink-0 whitespace-nowrap lg:whitespace-normal leading-snug rounded-xl px-3.5 py-2.5 text-start text-sm font-medium transition-colors ${
              activeTab === "all" && !normalizedQuery
                ? "bg-primary/15 text-foreground"
                : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
            }`}
          >
            {t("set.cat.all")}
          </button>
          {CATEGORIES.map(({ id, labelKey, Icon }) => {
            const active = activeTab === id && !normalizedQuery;
            return (
              <button
                key={id}
                type="button"
                data-testid={`settings-cat-${id}`}
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab(id);
                }}
                className={`flex min-h-[44px] shrink-0 items-center gap-2.5 whitespace-nowrap lg:whitespace-normal leading-snug rounded-xl px-3.5 py-2.5 text-start text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                <Icon className={`size-4 shrink-0 ${active ? "text-primary" : ""}`} />
                <span>{t(labelKey)}</span>
              </button>
            );
          })}
        </nav>

        {/* Active Sections */}
        <div className="min-w-0 space-y-5">
          {shouldShowSection("appearance") && (
            <AppearanceSection runSave={runSave} highlightedRowId={highlightedRowId} />
          )}
          {shouldShowSection("typography") && (
            <TypographySection runSave={runSave} highlightedRowId={highlightedRowId} />
          )}
          {shouldShowSection("accessibility") && <AccessibilitySection runSave={runSave} />}
          {shouldShowSection("language_region") && (
            <LanguageRegionSection
              region={region}
              onRegionChange={handleRegionChange}
              onLangChange={handleLangChange}
              runSave={runSave}
            />
          )}
          {shouldShowSection("study") && <StudyPreferencesSection runSave={runSave} />}
          {shouldShowSection("ai") && <AiPreferencesSection runSave={runSave} />}
          {shouldShowSection("notifications") && <NotificationsSection runSave={runSave} />}
          {shouldShowSection("privacy_security") && (
            <PrivacySecuritySection
              user={user}
              profile={profile}
              onOpenUpgrade={() => setUpgradeOpen(true)}
              runSave={runSave}
            />
          )}
          {shouldShowSection("account") && <AccountProfileSection profile={profile} />}

          {/* About BTC & PWA Runtime Card */}
          <SettingsSectionCard
            id="cat-about-platform"
            title={t("set.about.title")}
            desc={t("set.about.subtitle")}
          >
            <div data-testid="settings-about-btc" className="space-y-4 pt-3">
              <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-surface-2/60 p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Info className="size-4 text-primary" />
                    <span>
                      {BRAND.name} — {BRAND.fullName}
                    </span>
                  </div>
                  <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
                    {lang === "ar" ? BRAND.missionAr : BRAND.mission}
                  </p>
                </div>
                <span className="rounded-lg border border-border bg-card px-2.5 py-1 font-mono text-xs text-muted-foreground">
                  v3.0
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                    {isOnline ? (
                      <Wifi className="size-3.5 text-success" />
                    ) : (
                      <WifiOff className="size-3.5 text-xp" />
                    )}
                    <span>{isOnline ? t("set.about.online") : t("set.about.offline")}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {swSupported
                      ? installed
                        ? t("set.about.pwaStandalone")
                        : t("set.about.pwaInstallable")
                      : t("set.about.pwaStandard")}
                  </span>
                </div>

                <PWAInstallButton />
              </div>
            </div>
          </SettingsSectionCard>
        </div>
      </div>

      <UpgradeAccountDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
