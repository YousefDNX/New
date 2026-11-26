import { createFileRoute } from "@tanstack/react-router";
import {
  Accessibility,
  Check,
  CheckCircle2,
  Globe,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Sparkles,
  Sun,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/Page";
import { AccountProfileSection } from "@/components/settings/AccountProfileSection";
import {
  SegmentedChoice,
  SettingsRow,
  SettingsSectionCard,
} from "@/components/settings/SettingsPrimitives";
import { TtsEngineSettingsPanel } from "@/components/settings/TtsEngineSettingsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModernSelect } from "@/components/ui/modern-select";
import { Switch } from "@/components/ui/switch";
import { BRAND } from "@/config/brand";
import { useProfile, useUser } from "@/hooks/use-nexora";
import {
  CloudSettingsFallbackError,
  OfflineSettingsError,
  useSaveProfile,
  useSaveSettings,
} from "@/hooks/use-settings";
import { useThemePersistence } from "@/hooks/use-theme-persistence";
import { defaultSettingsDoc, type UserSettingsRow } from "@/lib/firestore-data";
import { LANG_META, SUPPORTED_LANGS, type Lang } from "@/lib/i18n-dict";
import { usePrefs } from "@/lib/preferences";
import {
  ACCENT_PRESETS,
  QUIZ_COLOR_PALETTES,
  clampFontScale,
  clampSpeechRate,
  getContrastForeground,
  getContrastRatio,
  getQuizButtonRadiusClass,
  isValidHexColor,
  type AccentPreset,
  type InteractionStylePref,
  type QuizButtonStyle,
  type QuizColorPalette,
  type QuizFeedbackStyle,
} from "@/lib/settings";
import {
  getSoundPreset,
  getSoundVolume,
  playClickSound,
  playCompleteSound,
  playCorrectSound,
  setSoundPreset,
  setSoundVolume,
  type SoundPresetId,
} from "@/lib/sound-effects";

export const Route = createFileRoute("/_authenticated/app/settings")({
  head: () => ({
    meta: [
      { title: `Settings — ${BRAND.name}` },
      {
        name: "description",
        content: `Language, theme, accent color, sound effects, quiz customization, accessibility preferences, and guest session settings for ${BRAND.name}.`,
      },
    ],
  }),
  component: SettingsPage,
});

type SettingsPatch = Partial<Omit<UserSettingsRow, "user_id" | "theme">> & { theme?: string };

function SettingsPage() {
  const {
    t,
    lang,
    setLang,
    theme,
    setTheme,
    resolvedTheme,
    effectiveResolvedTheme,
    appearance,
    setAppearance,
    soundAndQuiz,
    setSoundAndQuiz,
    a11y,
    setA11y,
    resetAllPreferences,
  } = usePrefs();
  const isAr = lang === "ar";
  const { data: user } = useUser();
  const { data: profile } = useProfile();
  const saveSettings = useSaveSettings();
  const saveProfile = useSaveProfile();
  const { applyColorMode } = useThemePersistence();

  const [stagedAccent, setStagedAccent] = useState<AccentPreset>(appearance.accent);
  const [customHexDraft, setCustomHexDraft] = useState(appearance.customAccentHex);
  const [sampleQuizPicked, setSampleQuizPicked] = useState(false);
  const [soundVol, setSoundVol] = useState<number>(() => getSoundVolume());
  const [soundPreset, setSoundPresetState] = useState<SoundPresetId>(() => getSoundPreset());

  const previewHex =
    stagedAccent === "custom"
      ? isValidHexColor(customHexDraft)
        ? customHexDraft
        : ACCENT_PRESETS.teal.hex
      : ACCENT_PRESETS[stagedAccent].hex;
  const previewFg = getContrastForeground(previewHex);
  const surfaceBgHex = effectiveResolvedTheme === "light" ? "#ffffff" : "#131924";
  const surfaceContrast = getContrastRatio(previewHex, surfaceBgHex);
  const textOnAccentContrast = getContrastRatio(previewHex, previewFg);
  const accentDirty =
    stagedAccent !== appearance.accent ||
    (stagedAccent === "custom" &&
      isValidHexColor(customHexDraft) &&
      customHexDraft.toLowerCase() !== appearance.customAccentHex.toLowerCase());

  function saveA11y(patch: Parameters<typeof setA11y>[0], dbPatch: SettingsPatch) {
    const prev = a11y;
    setA11y(patch);
    void saveSettings(dbPatch)
      .then(() => toast.success(t("set.saved"), { id: "set-saved", duration: 1200 }))
      .catch((err) => {
        if (err instanceof OfflineSettingsError || err instanceof CloudSettingsFallbackError) {
          toast.info(t("set.savedLocalFallback"), { id: "set-saved", duration: 1500 });
          return;
        }
        setA11y(prev);
        toast.error(t("set.error"));
      });
  }

  function handleLangChange(nextLang: Lang) {
    const prev = lang;
    setLang(nextLang);
    void saveProfile({ language: nextLang })
      .then(() => toast.success(t("set.saved"), { id: "set-saved", duration: 1200 }))
      .catch(() => {
        // Keep local language switch intact even if offline; only revert on explicit rejection if needed
        toast.info(t("set.savedLocalFallback"), { id: "set-saved", duration: 1500 });
        if (prev === nextLang) return;
      });
  }

  function applyAccentSelection(nextAccent: AccentPreset, nextCustomHex = customHexDraft) {
    const prevAccent = appearance.accent;
    const prevHex = appearance.customAccentHex;
    const safeCustomHex = isValidHexColor(nextCustomHex) ? nextCustomHex : prevHex;
    setStagedAccent(nextAccent);
    setAppearance({
      accent: nextAccent,
      ...(nextAccent === "custom" ? { customAccentHex: safeCustomHex } : {}),
    });
    void saveSettings({
      accent_color: nextAccent,
      ...(nextAccent === "custom" ? { custom_accent_hex: safeCustomHex } : {}),
    })
      .then(() => toast.success(t("set.saved"), { id: "set-saved", duration: 1200 }))
      .catch((err) => {
        if (err instanceof OfflineSettingsError || err instanceof CloudSettingsFallbackError) {
          toast.info(t("set.savedLocalFallback"), { id: "set-saved", duration: 1500 });
          return;
        }
        setAppearance({ accent: prevAccent, customAccentHex: prevHex });
        setStagedAccent(prevAccent);
        toast.error(t("set.error"));
      });
  }

  async function handleResetPrefs() {
    resetAllPreferences();
    setStagedAccent("teal");
    setCustomHexDraft("#14b8a6");
    if (user?.uid) {
      try {
        const defaults = defaultSettingsDoc(user.uid);
        const { user_id: _uid, ...rest } = defaults;
        await saveSettings(rest);
      } catch {
        // Keep local reset
      }
    }
    toast.success(t("set.resetAll.done"));
  }

  const activePalette = QUIZ_COLOR_PALETTES[soundAndQuiz.quizColorPalette];
  const quizRadiusClass = getQuizButtonRadiusClass(soundAndQuiz.quizButtonStyle);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <PageHeader
        title={t("set.title")}
        subtitle={
          isAr
            ? "اللغة، المظهر، اللون الأساسي، المؤثرات الصوتية، أزرار الاختبارات، وإمكانية الوصول."
            : "Language, theme, primary accent color, sound effects, quiz button styling, and accessibility."
        }
        actions={
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleResetPrefs}
            className="min-h-[44px] gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            <span>{t("set.resetAll")}</span>
          </Button>
        }
      />

      {/* 1. Language (All 8 Languages) */}
      <SettingsSectionCard
        id="cat-language"
        title={t("set.lang")}
        desc={t("set.langregion.d")}
        badge={<Globe className="size-4 text-primary" />}
      >
        <div className="mb-3">
          <ModernSelect
            id="settings-language-select"
            data-testid="settings-language-select"
            label={isAr ? "اختر لغة الواجهة (قابلة للبحث)" : "Interface Language (Searchable)"}
            value={lang}
            onValueChange={(next) => handleLangChange(next as Lang)}
            searchable
            searchPlaceholder={
              isAr ? "ابحث بالاسم أو الرمز..." : "Search language by name or code..."
            }
            leadingIcon={<Globe className="size-4" />}
            options={SUPPORTED_LANGS.map((code) => {
              const meta = LANG_META[code];
              return {
                value: code,
                label: meta.nativeName,
                description: `${meta.englishName} · ${meta.dir.toUpperCase()}`,
                badge: code.toUpperCase(),
                keywords: `${code} ${meta.nativeName} ${meta.englishName}`,
                group:
                  meta.dir === "rtl"
                    ? isAr
                      ? "لغات من اليمين إلى اليسار"
                      : "Right-to-Left (RTL)"
                    : isAr
                      ? "لغات من اليسار إلى اليمين"
                      : "Left-to-Right (LTR)",
              };
            })}
          />
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {SUPPORTED_LANGS.map((code) => {
            const meta = LANG_META[code];
            const active = lang === code;
            return (
              <button
                key={code}
                type="button"
                data-testid={`settings-lang-${code}`}
                aria-pressed={active}
                onClick={() => handleLangChange(code)}
                className={`flex min-h-[52px] items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active
                    ? "border-primary bg-primary/12 text-foreground"
                    : "border-border bg-surface-2/50 text-foreground hover:border-primary/40 hover:bg-surface-2"
                }`}
              >
                <div className="min-w-0">
                  <div className="break-words text-sm font-semibold leading-snug">
                    {meta.nativeName}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {meta.englishName} · {meta.dir.toUpperCase()}
                  </div>
                </div>
                {active && <Check className="size-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      </SettingsSectionCard>

      {/* 2. Theme Mode & Curated Accent Color */}
      <SettingsSectionCard
        id="cat-theme"
        title={isAr ? "المظهر واللون الأساسي" : "Theme & Accent Color"}
        desc={
          isAr
            ? "اختر الوضع الفاتح أو الداكن ولون التمييز المعتمد في الأزرار والقوائم مع معاينة التباين."
            : "Choose Light/Dark mode and a curated primary accent color applied consistently across all modules."
        }
        badge={<Palette className="size-4 text-primary" />}
      >
        <SettingsRow label={t("set.theme")}>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={
                theme === "light" || (resolvedTheme === "light" && theme !== "system")
                  ? "default"
                  : "outline"
              }
              onClick={() => void applyColorMode("light")}
              className="min-h-[44px] gap-1.5"
            >
              <Sun className="size-3.5" />
              <span>{t("theme.light")}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant={
                theme === "dark" || (resolvedTheme === "dark" && theme !== "system")
                  ? "default"
                  : "outline"
              }
              onClick={() => void applyColorMode("dark")}
              className="min-h-[44px] gap-1.5"
            >
              <Moon className="size-3.5" />
              <span>{t("theme.dark")}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant={theme === "system" ? "default" : "outline"}
              onClick={() => {
                setTheme("system");
                void saveSettings({ theme: "system" }).catch(() => {});
              }}
              className="min-h-[44px] gap-1.5"
            >
              <Monitor className="size-3.5" />
              <span>{t("theme.system")}</span>
            </Button>
          </div>
        </SettingsRow>

        <div className="space-y-4 rounded-xl border border-border/80 bg-surface-2/40 p-4">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">{t("set.accent")}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {isAr ? "نسبة التباين:" : "Surface contrast:"} {surfaceContrast}:1 ·{" "}
                {isAr ? "نص الزر:" : "Button text:"} {textOnAccentContrast}:1
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{t("set.accent.d")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {(Object.keys(ACCENT_PRESETS) as Exclude<AccentPreset, "custom">[]).map((presetKey) => {
              const info = ACCENT_PRESETS[presetKey];
              const isStaged = stagedAccent === presetKey;
              const isApplied = appearance.accent === presetKey;
              const checkColor = getContrastForeground(info.hex);
              return (
                <button
                  key={presetKey}
                  type="button"
                  data-testid={`accent-swatch-${presetKey}`}
                  aria-label={info.label}
                  aria-pressed={isStaged}
                  onClick={() => {
                    setStagedAccent(presetKey);
                    applyAccentSelection(presetKey);
                  }}
                  className={`flex min-h-[44px] items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isStaged
                      ? "border-foreground bg-surface text-foreground shadow-sm"
                      : "border-border bg-surface/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  <span
                    className="flex size-5 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: info.hex }}
                  >
                    {(isStaged || isApplied) && (
                      <Check className="size-3.5" style={{ color: checkColor }} />
                    )}
                  </span>
                  <span>{info.label}</span>
                </button>
              );
            })}
          </div>

          {/* Custom hex option */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <label htmlFor="settings-custom-accent" className="text-xs text-muted-foreground">
              {t("set.accent.custom")}
            </label>
            <Input
              id="settings-custom-accent"
              value={customHexDraft}
              onChange={(e) => {
                const val = e.target.value;
                setCustomHexDraft(val);
                if (isValidHexColor(val)) {
                  setStagedAccent("custom");
                }
              }}
              placeholder="#14b8a6"
              maxLength={7}
              dir="ltr"
              className="h-10 w-28 font-mono text-xs"
            />
            {stagedAccent === "custom" && isValidHexColor(customHexDraft) && accentDirty && (
              <Button
                type="button"
                size="sm"
                onClick={() => applyAccentSelection("custom", customHexDraft)}
                className="min-h-[40px]"
              >
                {t("set.apply.btn")}
              </Button>
            )}
          </div>

          {/* Live Accessible Accent Preview */}
          <div
            data-testid="accent-live-preview"
            className="rounded-xl border border-border bg-surface p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {isAr ? "معاينة التباين والعناصر التفاعلية" : "Live Accent & Contrast Preview"}
              </span>
              <span className="text-xs font-medium" style={{ color: previewHex }}>
                {surfaceContrast >= 3
                  ? isAr
                    ? "تباين مريح للقراءة"
                    : "Accessible contrast preserved"
                  : isAr
                    ? "تباين منخفض على الخلفية — النص التفاعلي مضبوط تلقائياً"
                    : "Low surface contrast — button text auto-adjusted"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex min-h-[40px] items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{
                  backgroundColor: `color-mix(in srgb, ${previewHex} 14%, transparent)`,
                  color: previewHex,
                }}
              >
                <span className="h-4 w-1 rounded-full" style={{ backgroundColor: previewHex }} />
                <span>{isAr ? "عنصر قائمة نشط" : "Active Navigation Item"}</span>
              </div>

              <button
                type="button"
                onClick={() => applyAccentSelection(stagedAccent, customHexDraft)}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 text-xs font-semibold transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  backgroundColor: previewHex,
                  color: previewFg,
                  outlineColor: previewHex,
                }}
              >
                {isAr ? "زر أساسي بالتباين التلقائي" : "Primary Action Button"}
              </button>

              <span
                className="rounded-lg border px-2.5 py-1 text-xs font-medium"
                style={{ borderColor: previewHex, color: previewHex }}
              >
                {isAr ? "إطار التركيز والإشارة" : "Focus & Highlight"}
              </span>
            </div>
          </div>
        </div>
      </SettingsSectionCard>

      {/* 3. Sound Effects & Interaction Style */}
      <SettingsSectionCard
        id="cat-sound-quiz"
        title={isAr ? "الصوت ونمط التفاعل" : "Sound & Interaction Style"}
        desc={
          isAr
            ? "تحكم مستقل في المؤثرات الصوتية، نمط التفاعل (صوتي مقابل صامت)، ونقاء نطق الذكاء الاصطناعي."
            : "Independently toggle audio sound effects and customize interaction style (sound vs. silent) for quiz results and interface feedback."
        }
        badge={
          soundAndQuiz.soundEffectsEnabled ? (
            <Volume2 className="size-4 text-primary" />
          ) : (
            <VolumeX className="size-4 text-muted-foreground" />
          )
        }
      >
        <SettingsRow
          id="sound-effects-toggle"
          label={
            isAr ? "تشغيل المؤثرات الصوتية عند الإجابات والانتهاء" : "Interactive Sound Effects"
          }
          desc={
            isAr
              ? "أصوات قصيرة ولطيفة للإجابة الصحيحة والخاطئة وانتهاء المؤقت (بدون موسيقى، وبدون تشغيل تلقائي)."
              : "Short chimes on correct/incorrect answers and timer completion (no background music, no autoplay)."
          }
        >
          <div className="flex flex-wrap items-center gap-3">
            <Switch
              id="sound-effects-toggle"
              data-testid="settings-sound-toggle"
              checked={soundAndQuiz.soundEffectsEnabled}
              onCheckedChange={(checked) => {
                setSoundAndQuiz({
                  soundEffectsEnabled: checked,
                  interactionStyle: checked ? "sound" : "silent",
                });
                toast.success(t("set.saved"), { id: "set-saved", duration: 1200 });
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!soundAndQuiz.soundEffectsEnabled}
              onClick={() => playCompleteSound()}
              className="min-h-[44px] gap-1.5"
            >
              <Volume2 className="size-3.5" />
              <span>{isAr ? "تجربة الصوت" : "Test Sound"}</span>
            </Button>
          </div>
        </SettingsRow>

        <SettingsRow
          label={isAr ? "مستوى صوت المؤثرات" : "Sound Effects Volume"}
          desc={
            isAr
              ? "التحكم في شدة صوت النغمات والمؤثرات التفاعلية."
              : "Adjust chime and interaction sound volume."
          }
        >
          <div className="flex items-center gap-3 w-full max-w-xs">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVol}
              disabled={!soundAndQuiz.soundEffectsEnabled}
              aria-label={isAr ? "مستوى صوت المؤثرات" : "Sound Effects Volume"}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                setSoundVol(vol);
                setSoundVolume(vol);
                playClickSound();
              }}
              className="w-full accent-primary cursor-pointer"
            />
            <span className="font-mono text-xs text-muted-foreground w-10 text-end">
              {Math.round(soundVol * 100)}%
            </span>
          </div>
        </SettingsRow>

        <SettingsRow
          label={isAr ? "طابع المؤثر الصوتي" : "Sound Effect Preset"}
          desc={
            isAr
              ? "اختر نغمة المؤثرات التي تفضلها للضغطات والإجابات الصحيحة والخاطئة."
              : "Choose your preferred chime tone for taps and quiz feedback."
          }
        >
          <SegmentedChoice<SoundPresetId>
            label={isAr ? "طابع المؤثر الصوتي" : "Sound Effect Preset"}
            value={soundPreset}
            onChange={(val) => {
              setSoundPresetState(val);
              setSoundPreset(val);
              if (soundAndQuiz.soundEffectsEnabled) {
                playCorrectSound();
              }
              toast.success(t("set.saved"), { id: "set-saved", duration: 1200 });
            }}
            options={[
              { v: "chime", l: isAr ? "رنين كلاسيكي" : "Classic Chime" },
              { v: "crystal", l: isAr ? "كريستالي ناعم" : "Crystal" },
              { v: "gentle", l: isAr ? "هادئ ومريح" : "Gentle" },
              { v: "crisp", l: isAr ? "نقرة واضحة" : "Crisp Tap" },
            ]}
          />
        </SettingsRow>

        <SettingsRow
          label={isAr ? "نمط التفاعل والنتائج (صوتي مقابل صامت)" : "Interaction & Feedback Style"}
          desc={
            isAr
              ? "اختر بين النمط الصوتي التفاعلي مع نغمات قصيرة أو النمط الصامت بالكامل بدون أي أصوات."
              : "Choose between audible chime feedback or fully silent visual-only responses (ideal for focus/libraries)."
          }
        >
          <SegmentedChoice<InteractionStylePref>
            label={isAr ? "نمط التفاعل" : "Interaction Style"}
            value={
              soundAndQuiz.interactionStyle ??
              (soundAndQuiz.soundEffectsEnabled ? "sound" : "silent")
            }
            onChange={(val) => {
              setSoundAndQuiz({
                interactionStyle: val,
                soundEffectsEnabled: val === "sound",
              });
              toast.success(t("set.saved"), { id: "set-saved", duration: 1200 });
            }}
            options={[
              { v: "sound", l: isAr ? "صوتي وتفاعلي" : "Sound & Chimes" },
              { v: "silent", l: isAr ? "صامت (مرئي فقط)" : "Silent (Visual Only)" },
            ]}
          />
        </SettingsRow>

        <SettingsRow label={isAr ? "شكل أزرار الاختبارات" : "Quiz Button Shape"}>
          <SegmentedChoice<QuizButtonStyle>
            label={isAr ? "شكل أزرار الاختبارات" : "Quiz Button Shape"}
            value={soundAndQuiz.quizButtonStyle}
            onChange={(val) => {
              setSoundAndQuiz({ quizButtonStyle: val });
              toast.success(t("set.saved"), { id: "set-saved", duration: 1200 });
            }}
            options={[
              { v: "rounded", l: isAr ? "دائري ناعم" : "Rounded" },
              { v: "pill", l: isAr ? "بيضاوي" : "Pill" },
              { v: "soft_square", l: isAr ? "مربع بحواف لطيفة" : "Soft Square" },
            ]}
          />
        </SettingsRow>

        <SettingsRow label={isAr ? "لوحة ألوان أزرار الاختبارات" : "Quiz Button Color Palette"}>
          <SegmentedChoice<QuizColorPalette>
            label={isAr ? "لوحة ألوان أزرار الاختبارات" : "Quiz Button Color Palette"}
            value={soundAndQuiz.quizColorPalette}
            onChange={(val) => {
              setSoundAndQuiz({ quizColorPalette: val });
              toast.success(t("set.saved"), { id: "set-saved", duration: 1200 });
            }}
            options={[
              { v: "default", l: isAr ? "افتراضي" : "Theme Default" },
              { v: "ocean", l: isAr ? "محيطي" : "Ocean" },
              { v: "emerald", l: isAr ? "زمردي" : "Emerald" },
              { v: "royal", l: isAr ? "نيلي" : "Royal" },
              { v: "amber", l: isAr ? "كهرماني" : "Amber" },
            ]}
          />
        </SettingsRow>

        <SettingsRow label={isAr ? "شدة تفاعل التغذية الراجعة" : "Quiz Feedback Intensity"}>
          <SegmentedChoice<QuizFeedbackStyle>
            label={isAr ? "شدة تفاعل التغذية الراجعة" : "Quiz Feedback Intensity"}
            value={soundAndQuiz.quizFeedbackStyle}
            onChange={(val) => {
              setSoundAndQuiz({ quizFeedbackStyle: val });
              toast.success(t("set.saved"), { id: "set-saved", duration: 1200 });
            }}
            options={[
              { v: "celebration", l: isAr ? "تشجيعي احتفالي" : "Celebration" },
              { v: "balanced", l: isAr ? "متوازن" : "Balanced" },
              { v: "minimal", l: isAr ? "بسيط وهادئ" : "Minimal" },
            ]}
          />
        </SettingsRow>

        {/* Text-to-Speech (TTS) Engine, Voice & Language-Learning Playback Speed */}
        <TtsEngineSettingsPanel
          onSpeedCommit={(rate) => {
            void saveSettings({ read_aloud_rate: clampSpeechRate(rate) }).catch(() => undefined);
          }}
        />

        {/* Interactive Sample Quiz Button Preview */}
        <div className="rounded-xl border border-border/80 bg-surface-2/40 p-4 space-y-2.5">
          <div className="text-xs font-semibold text-muted-foreground">
            {isAr ? "معاينة حيّة لأزرار الاختبارات التفاعلية" : "Live Quiz Button Preview"}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setSampleQuizPicked(true);
                if (soundAndQuiz.soundEffectsEnabled) {
                  playCorrectSound();
                }
              }}
              className={`min-h-[44px] flex-1 border px-4 py-2.5 text-start text-sm font-medium transition-colors ${quizRadiusClass} ${
                sampleQuizPicked
                  ? `${activePalette.activeBgClass} ${activePalette.activeBorderClass}`
                  : "border-border bg-surface text-foreground hover:border-primary/50"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span>
                  {isAr
                    ? "Both Sara and Layla enjoy reading."
                    : "Both Sara and Layla enjoy reading."}
                </span>
                {sampleQuizPicked && <CheckCircle2 className="size-4 shrink-0" />}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSampleQuizPicked(false)}
              className={`min-h-[44px] border border-border bg-surface px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground ${quizRadiusClass}`}
            >
              {isAr ? "إعادة ضبط المعاينة" : "Reset Preview"}
            </button>
          </div>
          {sampleQuizPicked && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Sparkles className="size-3.5" />
              <span>
                {soundAndQuiz.quizFeedbackStyle === "minimal"
                  ? isAr
                    ? "إجابة صحيحة"
                    : "Correct answer"
                  : isAr
                    ? "إجابة صحيحة! أحسنت، استمر!"
                    : "Correct answer! Well done, keep going!"}
              </span>
            </div>
          )}
        </div>
      </SettingsSectionCard>

      {/* 4. Accessibility */}
      <SettingsSectionCard
        id="cat-accessibility"
        title={t("set.display")}
        desc={t("set.display.d")}
        badge={<Accessibility className="size-4 text-primary" />}
      >
        <SettingsRow label={t("set.textsize")} desc={`${a11y.fontScale.toFixed(2)}x`}>
          <input
            type="range"
            min={0.9}
            max={1.5}
            step={0.05}
            value={a11y.fontScale}
            aria-label={t("set.textsize")}
            onChange={(e) => {
              const val = clampFontScale(Number(e.target.value));
              saveA11y({ fontScale: val }, { font_scale: val });
            }}
            className="w-44 accent-primary"
          />
        </SettingsRow>

        <SettingsRow id="a11y-dyslexia" label={t("set.dyslexia")} desc={t("set.dyslexia.d")}>
          <Switch
            id="a11y-dyslexia"
            checked={a11y.dyslexia}
            onCheckedChange={(v) => saveA11y({ dyslexia: v }, { dyslexia_font: v })}
          />
        </SettingsRow>

        <SettingsRow id="a11y-contrast" label={t("set.contrast")} desc={t("set.contrast.d")}>
          <Switch
            id="a11y-contrast"
            checked={a11y.contrast}
            onCheckedChange={(v) => saveA11y({ contrast: v }, { high_contrast: v })}
          />
        </SettingsRow>

        <SettingsRow id="a11y-motion" label={t("set.motion")} desc={t("set.motion.d")}>
          <Switch
            id="a11y-motion"
            checked={a11y.reduceMotion}
            onCheckedChange={(v) => saveA11y({ reduceMotion: v }, { reduced_motion: v })}
          />
        </SettingsRow>

        <SettingsRow id="a11y-focus" label={t("set.focusRing")} desc={t("set.focusRing.d")}>
          <Switch
            id="a11y-focus"
            checked={a11y.focusRing}
            onCheckedChange={(v) => saveA11y({ focusRing: v }, { focus_ring: v })}
          />
        </SettingsRow>

        <SettingsRow id="a11y-readaloud" label={t("set.readAloud")} desc={t("set.readAloud.d")}>
          <div className="flex flex-wrap items-center gap-3">
            <Switch
              id="a11y-readaloud"
              checked={a11y.readAloud}
              onCheckedChange={(v) => saveA11y({ readAloud: v }, { read_aloud: v })}
            />
            {a11y.readAloud && (
              <input
                type="range"
                min={0.75}
                max={1.4}
                step={0.05}
                value={a11y.readAloudRate}
                aria-label={t("set.readAloud.rate")}
                onChange={(e) => {
                  const rate = clampSpeechRate(Number(e.target.value));
                  saveA11y({ readAloudRate: rate }, { read_aloud_rate: rate });
                }}
                className="w-28 accent-primary"
              />
            )}
          </div>
        </SettingsRow>
      </SettingsSectionCard>

      {/* 5. Guest Session & Data */}
      <AccountProfileSection profile={profile} />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <User className="size-3.5 text-primary" />
        <span>
          {BRAND.name} — {BRAND.fullName}
        </span>
      </div>
    </div>
  );
}
