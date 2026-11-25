import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ensureFontsForSelection, ensurePresetFonts } from "./font-loader";
import { dict, LANG_META, normalizeLang, type DictKey, type Lang } from "./i18n-dict";
import {
  clearPersistedTtsConfig,
  loadPersistedTtsConfig,
  pauseEnhancedSpeech,
  resumeEnhancedSpeech,
  savePersistedTtsConfig,
  setActiveTtsConfig,
  speakEnhancedText,
  stopEnhancedSpeech,
} from "./speech-service";
import { setSoundEffectsEnabled } from "./sound-effects";
import { BRAND, isBtcMode } from "@/config/brand";
import {
  ACCENT_PRESETS,
  INTERFACE_THEME_SPECS,
  clampFontScale,
  clampHeadingScale,
  clampLetterSpacing,
  clampLineHeight,
  clampSpeechRate,
  clampTtsSpeed,
  clampVoiceSpeed,
  defaultA11yFull,
  defaultAiPrefs,
  defaultAppearancePrefs,
  defaultEcosystemPrefs,
  defaultLayoutPrefs,
  defaultLocalePrefs,
  defaultNotificationPrefs,
  defaultPrivacyPrefs,
  defaultSoundAndQuizPrefs,
  defaultStudyPrefs,
  defaultTypographyPrefs,
  getContrastForeground,
  isValidHexColor,
  normalizeFontFamily,
  normalizeHiddenWidgets,
  normalizeInteractionStyle,
  normalizeLayoutWorkspace,
  normalizeQuizButtonStyle,
  normalizeQuizColorPalette,
  normalizeQuizFeedbackStyle,
  normalizeReadabilityPreset,
  normalizeTtsEngine,
  normalizeTtsVoice,
  normalizeUiTheme,
  normalizeWidgetOrder,
  type A11y,
  type A11yFull,
  type AiPrefs,
  type AppearancePrefs,
  type EcosystemPrefs,
  type BtcNavLayout,
  type BtcVisualTheme,
  type FontFamilyPref,
  type LayoutPrefs,
  type LocalePrefs,
  type NotificationPrefs,
  type PrivacyPrefs,
  type SoundAndQuizPrefs,
  type StudyPrefs,
  type Theme,
  type ThemeMode,
  type TypographyPrefs,
} from "./settings";
import {
  getLayoutModeById,
  getThemePresetById,
  normalizeLayoutMode,
  normalizeThemePresetId,
  type LayoutMode,
  type ThemeCatalogPreset,
  type UiMode,
} from "./theme-catalog";
import { getUiExperienceById, normalizeUiExperience, type UiExperienceId } from "./ui-experiences";

export type {
  A11y,
  BtcNavLayout,
  BtcVisualTheme,
  LayoutMode,
  Theme,
  ThemeCatalogPreset,
  ThemeMode,
  UiExperienceId,
  UiMode,
};

export interface PreferencePreviewDraft {
  theme?: ThemeMode;
  btcVisualTheme?: BtcVisualTheme;
  btcNavLayout?: BtcNavLayout;
  appearance?: Partial<AppearancePrefs>;
  typography?: Partial<TypographyPrefs>;
  layout?: Partial<LayoutPrefs>;
  themePresetId?: string | null;
  layoutMode?: LayoutMode;
  uiExperience?: UiExperienceId;
}

interface Prefs {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: ThemeMode;
  resolvedTheme: Theme;
  setTheme: (t: ThemeMode) => void;
  a11y: A11yFull;
  setA11y: (a: Partial<A11y>) => void;
  appearance: AppearancePrefs;
  setAppearance: (a: Partial<AppearancePrefs>) => void;
  typography: TypographyPrefs;
  setTypography: (t: Partial<TypographyPrefs>) => void;
  layout: LayoutPrefs;
  setLayout: (l: Partial<LayoutPrefs>) => void;
  locale: LocalePrefs;
  setLocale: (l: Partial<LocalePrefs>) => void;
  study: StudyPrefs;
  setStudy: (s: Partial<StudyPrefs>) => void;
  ai: AiPrefs;
  setAi: (a: Partial<AiPrefs>) => void;
  notifications: NotificationPrefs;
  setNotifications: (n: Partial<NotificationPrefs>) => void;
  privacy: PrivacyPrefs;
  setPrivacy: (p: Partial<PrivacyPrefs>) => void;
  ecosystem: EcosystemPrefs;
  setEcosystem: (e: Partial<EcosystemPrefs>) => void;
  soundAndQuiz: SoundAndQuizPrefs;
  setSoundAndQuiz: (s: Partial<SoundAndQuizPrefs>) => void;
  uiMode: UiMode;
  setUiMode: (m: UiMode) => void;
  themePresetId: string | null;
  setThemePresetId: (id: string | null) => void;
  applyThemePreset: (preset: ThemeCatalogPreset, modeOverride?: ThemeMode) => void;
  layoutMode: LayoutMode;
  setLayoutMode: (m: LayoutMode) => void;
  uiExperience: UiExperienceId;
  setUiExperience: (id: UiExperienceId) => void;
  btcVisualTheme: BtcVisualTheme;
  setBtcVisualTheme: (theme: BtcVisualTheme) => void;
  btcNavLayout: BtcNavLayout;
  setBtcNavLayout: (layout: BtcNavLayout) => void;
  effectiveBtcVisualTheme: BtcVisualTheme;
  effectiveBtcNavLayout: BtcNavLayout;
  previewDraft: PreferencePreviewDraft | null;
  isPreviewing: boolean;
  startPreview: (draft: PreferencePreviewDraft) => void;
  cancelPreview: () => void;
  commitPreview: () => PreferencePreviewDraft | null;
  effectiveTheme: ThemeMode;
  effectiveResolvedTheme: Theme;
  effectiveAppearance: AppearancePrefs;
  effectiveTypography: TypographyPrefs;
  effectiveLayout: LayoutPrefs;
  effectiveThemePresetId: string | null;
  effectiveLayoutMode: LayoutMode;
  effectiveUiExperience: UiExperienceId;
  resetAllPreferences: () => void;
  activeUid: string | null;
  syncPrefsForUser: (uid: string | null) => void;
  speakText: (text: string) => boolean;
  stopSpeaking: () => void;
  pauseSpeaking: () => void;
  resumeSpeaking: () => void;
  speechState: "idle" | "playing" | "paused";
  speechSupported: boolean;
  voiceInputSupported: boolean;
  announce: (message: string) => void;
  buildAiContextSummary: () => string;
  t: (k: DictKey) => string;
  dir: "ltr" | "rtl";
}

const Ctx = createContext<Prefs | null>(null);
const PREFS_STORAGE_KEY = "nexora.prefs";

export function getPrefsStorageKey(uid: string | null): string {
  return uid ? `${PREFS_STORAGE_KEY}.${uid}` : PREFS_STORAGE_KEY;
}

export function translate(lang: Lang, k: DictKey): string {
  const raw = dict[lang]?.[k] ?? dict.en[k] ?? k;
  if (!isBtcMode()) return raw;
  return raw.replace(/\bNEXORA\b/gi, BRAND.shortName).replace(/نيكسورا/g, BRAND.shortName);
}

const FONT_STACK_BY_KEY: Record<FontFamilyPref, string> = {
  nexora:
    '"Plus Jakarta Sans", "Sora", "Manrope", "IBM Plex Sans Arabic", "Noto Sans JP", "Noto Sans SC", "Noto Sans KR", ui-sans-serif, system-ui, sans-serif',
  humanist:
    '"Plus Jakarta Sans", "Manrope", "IBM Plex Sans Arabic", "Noto Sans JP", "Noto Sans SC", "Noto Sans KR", ui-sans-serif, system-ui, sans-serif',
  compact:
    '"Plus Jakarta Sans", "Outfit", "Manrope", "IBM Plex Sans Arabic", "Noto Sans JP", "Noto Sans SC", "Noto Sans KR", ui-sans-serif, system-ui, sans-serif',
  serif:
    '"Source Serif 4", "IBM Plex Sans Arabic", "Noto Sans JP", "Noto Sans SC", "Noto Sans KR", ui-serif, Georgia, serif',
  arabic: '"IBM Plex Sans Arabic", "Manrope", "Sora", ui-sans-serif, system-ui, sans-serif',
  cjk: '"Noto Sans JP", "Noto Sans SC", "Noto Sans KR", "Manrope", ui-sans-serif, system-ui, sans-serif',
  accessible:
    '"Atkinson Hyperlegible", "IBM Plex Sans Arabic", "Noto Sans JP", "Noto Sans SC", "Noto Sans KR", ui-sans-serif, system-ui, sans-serif',
};

const DISPLAY_STACK_BY_KEY: Record<FontFamilyPref, string> = {
  nexora: FONT_STACK_BY_KEY.nexora,
  humanist: FONT_STACK_BY_KEY.humanist,
  compact:
    '"Outfit", "Plus Jakarta Sans", "Manrope", "IBM Plex Sans Arabic", "Noto Sans JP", "Noto Sans SC", "Noto Sans KR", ui-sans-serif, system-ui, sans-serif',
  serif: FONT_STACK_BY_KEY.serif,
  arabic: FONT_STACK_BY_KEY.arabic,
  cjk: FONT_STACK_BY_KEY.cjk,
  accessible: FONT_STACK_BY_KEY.accessible,
};

const CORNER_RADIUS_BY_KEY = {
  sharp: "0.375rem",
  rounded: "0.75rem",
  soft: "1.125rem",
} as const;

export function PreferencesProvider({
  children,
  initialLang,
}: {
  children: ReactNode;
  initialLang?: Lang;
}) {
  // SSR renders English/dark unless initialLang is explicitly provided; stored preferences apply cleanly after hydration.
  const [lang, setLangState] = useState<Lang>(() =>
    initialLang ? normalizeLang(initialLang) : "en",
  );
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [systemTheme, setSystemTheme] = useState<Theme>("dark");
  const [a11y, setA11yState] = useState<A11yFull>(defaultA11yFull);
  const [appearance, setAppearanceState] = useState<AppearancePrefs>(defaultAppearancePrefs);
  const [typography, setTypographyState] = useState<TypographyPrefs>(defaultTypographyPrefs);
  const [layout, setLayoutState] = useState<LayoutPrefs>(defaultLayoutPrefs);
  const [locale, setLocaleState] = useState<LocalePrefs>(defaultLocalePrefs);
  const [study, setStudyState] = useState<StudyPrefs>(defaultStudyPrefs);
  const [ai, setAiState] = useState<AiPrefs>(defaultAiPrefs);
  const [notifications, setNotificationsState] =
    useState<NotificationPrefs>(defaultNotificationPrefs);
  const [privacy, setPrivacyState] = useState<PrivacyPrefs>(defaultPrivacyPrefs);
  const [ecosystem, setEcosystemState] = useState<EcosystemPrefs>(defaultEcosystemPrefs);
  const [soundAndQuiz, setSoundAndQuizState] =
    useState<SoundAndQuizPrefs>(defaultSoundAndQuizPrefs);
  const [uiMode, setUiModeState] = useState<UiMode>("simplified");
  const [themePresetId, setThemePresetIdState] = useState<string | null>("btc_classic");
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>("classic");
  const [uiExperience, setUiExperienceState] = useState<UiExperienceId>("classic");
  const [btcVisualTheme, setBtcVisualThemeState] = useState<BtcVisualTheme>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("btc-visual-theme");
        if (stored === "btc_original" || stored === "btc_alternative") return stored;
      } catch {
        // Ignore storage read error
      }
    }
    return "btc_original";
  });
  const [btcNavLayout, setBtcNavLayoutState] = useState<BtcNavLayout>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("btc-nav-layout");
        if (stored === "classic" || stored === "modern") return stored;
      } catch {
        // Ignore storage read error
      }
    }
    return "classic";
  });
  const [previewDraft, setPreviewDraft] = useState<PreferencePreviewDraft | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const [activeUid, setActiveUid] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechState, setSpeechState] = useState<"idle" | "playing" | "paused">("idle");
  const [voiceInputSupported, setVoiceInputSupported] = useState(false);

  const hydrateFromStorageKey = useCallback((storageKey: string) => {
    try {
      const uid = storageKey.startsWith(`${PREFS_STORAGE_KEY}.`)
        ? storageKey.slice(PREFS_STORAGE_KEY.length + 1)
        : null;
      const persistedTts = loadPersistedTtsConfig(uid);
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        if (persistedTts) {
          setEcosystemState({
            ...defaultEcosystemPrefs,
            ttsEngine: persistedTts.engine,
            ttsVoice: persistedTts.voicePreset,
            ttsSpeed: persistedTts.rate,
            voiceSpeed: clampVoiceSpeed(persistedTts.rate),
          });
          setActiveTtsConfig(
            {
              engine: persistedTts.engine,
              voicePreset: persistedTts.voicePreset,
              rate: persistedTts.rate,
            },
            { persist: false },
          );
          return true;
        }
        return false;
      }
      const s = JSON.parse(raw);
      if (s.lang) setLangState(normalizeLang(s.lang));
      if (s.theme === "light" || s.theme === "dark" || s.theme === "system") {
        setThemeState(s.theme);
      }
      if (s.a11y) {
        setA11yState({
          ...defaultA11yFull,
          ...s.a11y,
          fontScale: clampFontScale(Number(s.a11y.fontScale ?? 1)),
          readAloudRate: clampSpeechRate(Number(s.a11y.readAloudRate ?? 1)),
        });
      }
      if (s.appearance) {
        setAppearanceState({
          ...defaultAppearancePrefs,
          ...s.appearance,
          uiTheme: normalizeUiTheme(s.appearance.uiTheme),
          fontFamily: normalizeFontFamily(s.appearance.fontFamily),
          widgetOrder: normalizeWidgetOrder(s.appearance.widgetOrder),
          hiddenWidgets: normalizeHiddenWidgets(s.appearance.hiddenWidgets),
        });
      }
      if (s.typography) {
        setTypographyState({
          ...defaultTypographyPrefs,
          ...s.typography,
          fontFamily: normalizeFontFamily(s.typography.fontFamily),
          fontScale: clampFontScale(Number(s.typography.fontScale ?? s.a11y?.fontScale ?? 1)),
          headingScale: clampHeadingScale(Number(s.typography.headingScale ?? 1)),
          lineHeight: clampLineHeight(Number(s.typography.lineHeight ?? 1.55)),
          letterSpacing: clampLetterSpacing(Number(s.typography.letterSpacing ?? 0)),
          readabilityPreset: normalizeReadabilityPreset(s.typography.readabilityPreset),
        });
      }
      if (s.layout) {
        setLayoutState({
          ...defaultLayoutPrefs,
          ...s.layout,
          workspace: normalizeLayoutWorkspace(s.layout.workspace),
        });
      }
      if (s.locale) setLocaleState({ ...defaultLocalePrefs, ...s.locale });
      if (s.study) setStudyState({ ...defaultStudyPrefs, ...s.study });
      if (s.ai) setAiState({ ...defaultAiPrefs, ...s.ai });
      if (s.notifications) {
        setNotificationsState({ ...defaultNotificationPrefs, ...s.notifications });
      }
      if (s.privacy) setPrivacyState({ ...defaultPrivacyPrefs, ...s.privacy });
      if (s.ecosystem || persistedTts) {
        const sEco = s.ecosystem ?? {};
        const hasTtsInPrefs =
          sEco.ttsEngine !== undefined ||
          sEco.ttsVoice !== undefined ||
          sEco.ttsSpeed !== undefined;
        const prefsUpdatedMs =
          typeof s.updatedAt === "string" ? Date.parse(s.updatedAt) : Number.NaN;
        const ttsUpdatedMs = persistedTts?.updatedAt
          ? Date.parse(persistedTts.updatedAt)
          : Number.NaN;
        const preferDedicatedTts =
          Boolean(persistedTts) &&
          (!hasTtsInPrefs ||
            (Number.isFinite(ttsUpdatedMs) &&
              (!Number.isFinite(prefsUpdatedMs) || ttsUpdatedMs >= prefsUpdatedMs)));

        const resolvedTtsEngine =
          preferDedicatedTts && persistedTts
            ? persistedTts.engine
            : normalizeTtsEngine(sEco.ttsEngine);
        const resolvedTtsVoice =
          preferDedicatedTts && persistedTts
            ? persistedTts.voicePreset
            : normalizeTtsVoice(sEco.ttsVoice);
        const resolvedTtsSpeed =
          preferDedicatedTts && persistedTts
            ? persistedTts.rate
            : clampTtsSpeed(Number(sEco.ttsSpeed ?? sEco.voiceSpeed ?? 1) || 1);

        setEcosystemState({
          ...defaultEcosystemPrefs,
          ...sEco,
          voiceSpeed: clampVoiceSpeed(Number(sEco.voiceSpeed ?? resolvedTtsSpeed) || 1),
          ttsEngine: resolvedTtsEngine,
          ttsVoice: resolvedTtsVoice,
          ttsSpeed: resolvedTtsSpeed,
          lowBandwidth: Boolean(sEco.lowBandwidth),
          distractionFree: Boolean(sEco.distractionFree),
        });
        setActiveTtsConfig(
          {
            engine: resolvedTtsEngine,
            voicePreset: resolvedTtsVoice,
            rate: resolvedTtsSpeed,
          },
          { persist: false },
        );
      }
      if (s.soundAndQuiz) {
        const nextSoundEnabled =
          s.soundAndQuiz.soundEffectsEnabled !== undefined
            ? Boolean(s.soundAndQuiz.soundEffectsEnabled)
            : true;
        const nextInteractionStyle =
          s.soundAndQuiz.interactionStyle !== undefined
            ? normalizeInteractionStyle(s.soundAndQuiz.interactionStyle)
            : nextSoundEnabled
              ? "sound"
              : "silent";
        setSoundAndQuizState({
          soundEffectsEnabled: nextSoundEnabled,
          interactionStyle: nextInteractionStyle,
          quizButtonStyle: normalizeQuizButtonStyle(s.soundAndQuiz.quizButtonStyle),
          quizColorPalette: normalizeQuizColorPalette(s.soundAndQuiz.quizColorPalette),
          quizFeedbackStyle: normalizeQuizFeedbackStyle(s.soundAndQuiz.quizFeedbackStyle),
        });
        setSoundEffectsEnabled(nextSoundEnabled);
      }
      if (s.uiMode === "simplified" || s.uiMode === "advanced") {
        setUiModeState(s.uiMode);
      }
      if (typeof s.themePresetId === "string") {
        const normalizedPresetId = normalizeThemePresetId(s.themePresetId);
        if (normalizedPresetId) {
          setThemePresetIdState(normalizedPresetId);
        }
      } else if (s.themePresetId === null) {
        setThemePresetIdState(null);
      }
      if (s.layoutMode !== undefined) {
        setLayoutModeState(normalizeLayoutMode(s.layoutMode));
      }
      if (s.uiExperience !== undefined) {
        setUiExperienceState(normalizeUiExperience(s.uiExperience));
      }
      if (s.btcVisualTheme === "btc_original" || s.btcVisualTheme === "btc_alternative") {
        setBtcVisualThemeState(s.btcVisualTheme);
      } else {
        try {
          const direct = localStorage.getItem("btc-visual-theme");
          if (direct === "btc_original" || direct === "btc_alternative") {
            setBtcVisualThemeState(direct);
          }
        } catch {
          // Ignore storage read error
        }
      }
      if (s.btcNavLayout === "classic" || s.btcNavLayout === "modern") {
        setBtcNavLayoutState(s.btcNavLayout);
      } else {
        try {
          const direct = localStorage.getItem("btc-nav-layout");
          if (direct === "classic" || direct === "modern") {
            setBtcNavLayoutState(direct);
          }
        } catch {
          // Ignore storage read error
        }
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSpeechSupported(typeof window.speechSynthesis !== "undefined");
    setVoiceInputSupported("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (mq) {
      setSystemTheme(mq.matches ? "dark" : "light");
      const onChange = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? "dark" : "light");
      mq.addEventListener?.("change", onChange);
      return () => mq.removeEventListener?.("change", onChange);
    }
    return undefined;
  }, []);

  useEffect(() => {
    hydrateFromStorageKey(PREFS_STORAGE_KEY);
    setHydrated(true);
  }, [hydrateFromStorageKey]);

  const resolvedTheme: Theme = theme === "system" ? systemTheme : theme;
  const effectiveTheme: ThemeMode = previewDraft?.theme ?? theme;
  const effectiveResolvedTheme: Theme = effectiveTheme === "system" ? systemTheme : effectiveTheme;

  const effectiveBtcVisualTheme: BtcVisualTheme = previewDraft?.btcVisualTheme ?? btcVisualTheme;
  const effectiveBtcNavLayout: BtcNavLayout = previewDraft?.btcNavLayout ?? btcNavLayout;

  const effectiveAppearance: AppearancePrefs = useMemo(
    () =>
      previewDraft?.appearance
        ? {
            ...appearance,
            ...previewDraft.appearance,
            widgetOrder: previewDraft.appearance.widgetOrder
              ? normalizeWidgetOrder(previewDraft.appearance.widgetOrder)
              : appearance.widgetOrder,
            hiddenWidgets: previewDraft.appearance.hiddenWidgets
              ? normalizeHiddenWidgets(previewDraft.appearance.hiddenWidgets)
              : appearance.hiddenWidgets,
          }
        : appearance,
    [appearance, previewDraft],
  );

  const effectiveTypography: TypographyPrefs = useMemo(
    () =>
      previewDraft?.typography
        ? {
            ...typography,
            ...previewDraft.typography,
          }
        : typography,
    [typography, previewDraft],
  );

  const effectiveLayout: LayoutPrefs = useMemo(
    () =>
      previewDraft?.layout
        ? {
            ...layout,
            ...previewDraft.layout,
          }
        : layout,
    [layout, previewDraft],
  );

  const effectiveThemePresetId: string | null =
    previewDraft?.themePresetId !== undefined ? previewDraft.themePresetId : themePresetId;
  const effectiveLayoutMode: LayoutMode =
    effectiveBtcNavLayout === "modern" ? "top_nav" : (previewDraft?.layoutMode ?? layoutMode);
  const effectiveUiExperience: UiExperienceId = previewDraft?.uiExperience ?? uiExperience;

  const dir: "ltr" | "rtl" = LANG_META[lang]?.dir ?? "ltr";

  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.documentElement;
    el.lang = LANG_META[lang]?.bcp47 ?? lang;
    el.dir = dir;
    el.classList.toggle("light", effectiveResolvedTheme === "light");
    el.classList.toggle("dark", effectiveResolvedTheme === "dark");
    el.classList.toggle("a11y-contrast", a11y.contrast);
    el.classList.toggle("a11y-dyslexia", a11y.dyslexia);
    el.classList.toggle("a11y-reduce-motion", a11y.reduceMotion);
    el.classList.toggle("a11y-focus-ring", a11y.focusRing);
    el.classList.toggle("a11y-simplified", a11y.simplified);
    el.classList.toggle("a11y-reduce-effects", effectiveAppearance.reduceVisualEffects);
    el.classList.toggle("low-bandwidth", Boolean(ecosystem.lowBandwidth));

    el.dataset["lowBandwidth"] = String(Boolean(ecosystem.lowBandwidth));
    el.dataset["distractionFree"] = String(Boolean(ecosystem.distractionFree));

    const isAltTheme = effectiveBtcVisualTheme === "btc_alternative";
    el.dataset["btcTheme"] = isAltTheme ? "alternative" : "original";
    el.setAttribute("data-btc-theme", isAltTheme ? "alternative" : "original");
    if (isAltTheme) {
      el.dataset["uiTheme"] = "btc_alternative";
      el.setAttribute("data-ui-theme", "btc_alternative");
    } else {
      el.dataset["uiTheme"] = effectiveAppearance.uiTheme;
      el.setAttribute("data-ui-theme", effectiveAppearance.uiTheme);
    }
    el.dataset["btcNavLayout"] = effectiveBtcNavLayout;
    el.setAttribute("data-btc-nav-layout", effectiveBtcNavLayout);
    if (effectiveThemePresetId) {
      el.dataset["themePreset"] = effectiveThemePresetId;
    } else {
      delete el.dataset["themePreset"];
    }
    el.dataset["uiMode"] = uiMode;
    el.dataset["layoutMode"] = effectiveLayoutMode;
    el.dataset["uxShell"] = effectiveUiExperience;
    el.setAttribute("data-ux-shell", effectiveUiExperience);
    el.dataset["cardStyle"] = effectiveAppearance.cardStyle;
    el.dataset["borderStyle"] = effectiveAppearance.borderStyle;
    el.dataset["shadowLevel"] = effectiveAppearance.shadowLevel;
    el.dataset["animationLevel"] =
      a11y.reduceMotion || ecosystem.lowBandwidth ? "none" : effectiveAppearance.animationLevel;
    el.dataset["bgStyle"] =
      effectiveAppearance.reduceVisualEffects || ecosystem.lowBandwidth
        ? "solid"
        : effectiveAppearance.bgStyle;
    el.dataset["density"] = effectiveAppearance.density;
    el.setAttribute("data-density", effectiveAppearance.density);
    el.dataset["readingLayout"] = effectiveAppearance.readingLayout;
    el.dataset["workspace"] = effectiveLayout.workspace;
    el.dataset["sidebarMode"] = effectiveLayout.sidebarMode;
    el.dataset["script"] = lang;

    const activeFontScale = clampFontScale(
      previewDraft?.typography?.fontScale ?? effectiveTypography.fontScale ?? a11y.fontScale,
    );
    const activeHeadingScale = clampHeadingScale(effectiveTypography.headingScale);
    const activeLineHeight = clampLineHeight(effectiveTypography.lineHeight);
    const activeLetterSpacing =
      dir === "rtl" ? 0 : clampLetterSpacing(effectiveTypography.letterSpacing);
    const activeFontFamily = a11y.dyslexia
      ? "accessible"
      : normalizeFontFamily(effectiveTypography.fontFamily ?? effectiveAppearance.fontFamily);

    el.dataset["font"] = activeFontFamily;
    el.setAttribute("data-font", activeFontFamily);

    ensureFontsForSelection(lang, activeFontFamily, a11y.dyslexia);

    el.style.setProperty("--font-scale", String(activeFontScale));
    el.style.setProperty("--heading-scale", String(activeHeadingScale));
    el.style.setProperty("--line-height", String(activeLineHeight));
    el.style.setProperty("--letter-spacing", `${activeLetterSpacing}em`);
    el.style.setProperty(
      "--font-weight-body",
      effectiveTypography.fontWeight === "medium" ? "500" : "400",
    );
    el.style.setProperty("--radius", CORNER_RADIUS_BY_KEY[effectiveAppearance.cornerStyle]);

    const activePreset = getThemePresetById(effectiveThemePresetId);
    const activeExperienceSpec = getUiExperienceById(effectiveUiExperience);

    if (effectiveUiExperience !== "classic" && !a11y.dyslexia) {
      ensurePresetFonts(activeExperienceSpec.displayFont, activeExperienceSpec.arabicFont);
    }

    if (isAltTheme && !a11y.dyslexia) {
      ensurePresetFonts("Outfit", "IBM Plex Sans Arabic");
      const altBody =
        '"Plus Jakarta Sans", "IBM Plex Sans Arabic", "Noto Sans JP", "Noto Sans SC", "Noto Sans KR", ui-sans-serif, system-ui, sans-serif';
      const altDisplay =
        '"Outfit", "IBM Plex Sans Arabic", "Noto Sans JP", "Noto Sans SC", "Noto Sans KR", ui-sans-serif, system-ui, sans-serif';
      el.style.setProperty("--font-sans", altBody);
      el.style.setProperty("--font-display", altDisplay);
    } else if (effectiveUiExperience === "editorial_atelier" && !a11y.dyslexia) {
      const editorialBody =
        '"Plus Jakarta Sans", "IBM Plex Sans Arabic", "Noto Sans JP", "Noto Sans SC", "Noto Sans KR", ui-sans-serif, system-ui, sans-serif';
      const editorialDisplay =
        '"Fraunces", "Source Serif 4", "Amiri", "IBM Plex Sans Arabic", Georgia, serif';
      el.style.setProperty("--font-sans", editorialBody);
      el.style.setProperty("--font-display", editorialDisplay);
    } else if (effectiveUiExperience === "command_os" && !a11y.dyslexia) {
      const osBody =
        '"Manrope", "Cairo", "IBM Plex Sans Arabic", "Noto Sans JP", "Noto Sans SC", "Noto Sans KR", ui-sans-serif, system-ui, sans-serif';
      const osDisplay =
        '"Outfit", "Cairo", "IBM Plex Sans Arabic", "Noto Sans JP", "Noto Sans SC", "Noto Sans KR", ui-sans-serif, system-ui, sans-serif';
      el.style.setProperty("--font-sans", osBody);
      el.style.setProperty("--font-display", osDisplay);
    } else if (effectiveUiExperience === "focus_deck" && !a11y.dyslexia) {
      const zenStack =
        '"Plus Jakarta Sans", "IBM Plex Sans Arabic", "Noto Sans JP", "Noto Sans SC", "Noto Sans KR", ui-sans-serif, system-ui, sans-serif';
      el.style.setProperty("--font-sans", zenStack);
      el.style.setProperty("--font-display", zenStack);
    } else if (activePreset && !a11y.dyslexia) {
      ensurePresetFonts(activePreset.englishFont, activePreset.arabicFont);
      const presetStack = `"${activePreset.englishFont}", "${activePreset.arabicFont}", "Noto Sans JP", "Noto Sans SC", "Noto Sans KR", ui-sans-serif, system-ui, sans-serif`;
      el.style.setProperty("--font-sans", presetStack);
      el.style.setProperty("--font-display", presetStack);
    } else {
      el.style.setProperty("--font-sans", FONT_STACK_BY_KEY[activeFontFamily]);
      el.style.setProperty("--font-display", DISPLAY_STACK_BY_KEY[activeFontFamily]);
    }

    if (isAltTheme || effectiveAppearance.accent === "teal") {
      el.style.removeProperty("--primary");
      el.style.removeProperty("--primary-glow");
      el.style.removeProperty("--primary-foreground");
      el.style.removeProperty("--ring");
      el.style.removeProperty("--nav-active-bg");
      el.style.removeProperty("--nav-active-fg");
    } else if (effectiveAppearance.accent === "custom") {
      const hex = isValidHexColor(effectiveAppearance.customAccentHex)
        ? effectiveAppearance.customAccentHex
        : ACCENT_PRESETS.indigo.hex;
      const glowHex =
        activePreset && activePreset.accentHex.toLowerCase() === hex.toLowerCase()
          ? activePreset.glowHex
          : hex;
      const fg = getContrastForeground(hex);
      el.style.setProperty("--primary", hex);
      el.style.setProperty("--primary-glow", glowHex);
      el.style.setProperty("--primary-foreground", fg);
      el.style.setProperty("--ring", hex);
      el.style.setProperty("--nav-active-bg", `color-mix(in oklch, ${hex} 16%, transparent)`);
      el.style.setProperty(
        "--nav-active-fg",
        effectiveResolvedTheme === "dark" ? `color-mix(in oklch, ${hex} 85%, white)` : hex,
      );
    } else {
      const preset = ACCENT_PRESETS[effectiveAppearance.accent];
      const fg = getContrastForeground(preset.hex);
      el.style.setProperty("--primary", preset.hex);
      el.style.setProperty("--primary-glow", preset.glowHex);
      el.style.setProperty("--primary-foreground", fg);
      el.style.setProperty("--ring", preset.hex);
      el.style.setProperty(
        "--nav-active-bg",
        `color-mix(in oklch, ${preset.hex} 16%, transparent)`,
      );
      el.style.setProperty(
        "--nav-active-fg",
        effectiveResolvedTheme === "dark"
          ? `color-mix(in oklch, ${preset.hex} 85%, white)`
          : preset.hex,
      );
    }

    const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeColorMeta) {
      const spec = isAltTheme
        ? INTERFACE_THEME_SPECS.btc_alternative
        : (INTERFACE_THEME_SPECS[effectiveAppearance.uiTheme] ?? INTERFACE_THEME_SPECS.classic);
      const metaColor =
        !isAltTheme && activePreset
          ? effectiveResolvedTheme === "dark"
            ? activePreset.previewBgDark
            : activePreset.previewBgLight
          : effectiveResolvedTheme === "dark"
            ? spec.previewBgDark
            : spec.previewBgLight;
      themeColorMeta.content = metaColor;
    }
  }, [
    lang,
    dir,
    effectiveResolvedTheme,
    a11y,
    effectiveAppearance,
    effectiveTypography,
    effectiveLayout,
    effectiveThemePresetId,
    effectiveLayoutMode,
    effectiveUiExperience,
    effectiveBtcVisualTheme,
    effectiveBtcNavLayout,
    uiMode,
    previewDraft,
    ecosystem.lowBandwidth,
    ecosystem.distractionFree,
  ]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const targetKey = getPrefsStorageKey(activeUid);
      localStorage.setItem(
        targetKey,
        JSON.stringify({
          lang,
          theme,
          a11y,
          appearance,
          typography,
          layout,
          locale,
          study,
          ai,
          notifications,
          privacy,
          ecosystem,
          soundAndQuiz,
          uiMode,
          themePresetId,
          layoutMode,
          uiExperience,
          btcVisualTheme,
          btcNavLayout,
          updatedAt: new Date().toISOString(),
        }),
      );
      localStorage.setItem("btc-visual-theme", btcVisualTheme);
      localStorage.setItem("btc-nav-layout", btcNavLayout);
      setSoundEffectsEnabled(soundAndQuiz.soundEffectsEnabled);
    } catch {
      /* ignore storage quota */
    }
  }, [
    hydrated,
    activeUid,
    lang,
    theme,
    a11y,
    appearance,
    typography,
    layout,
    locale,
    study,
    ai,
    notifications,
    privacy,
    ecosystem,
    soundAndQuiz,
    uiMode,
    themePresetId,
    layoutMode,
    uiExperience,
    btcVisualTheme,
    btcNavLayout,
  ]);

  const setLang = useCallback((l: Lang) => setLangState(normalizeLang(l)), []);
  const setTheme = useCallback((t: ThemeMode) => setThemeState(t), []);

  const setA11y = useCallback((a: Partial<A11y>) => {
    setA11yState((p) => ({
      fontScale: a.fontScale !== undefined ? clampFontScale(a.fontScale) : p.fontScale,
      dyslexia: a.dyslexia ?? p.dyslexia,
      contrast: a.contrast ?? p.contrast,
      reduceMotion: a.reduceMotion ?? p.reduceMotion,
      focusRing: a.focusRing ?? p.focusRing,
      simplified: a.simplified ?? p.simplified,
      clearLanguage: a.clearLanguage ?? p.clearLanguage,
      readAloud: a.readAloud ?? p.readAloud,
      readAloudRate:
        a.readAloudRate !== undefined ? clampSpeechRate(a.readAloudRate) : p.readAloudRate,
      voiceInput: a.voiceInput ?? p.voiceInput,
      captions: a.captions ?? p.captions,
    }));
    if (a.fontScale !== undefined) {
      const clamped = clampFontScale(a.fontScale);
      setTypographyState((prev) => ({
        ...prev,
        fontScale: clamped,
      }));
    }
  }, []);

  const setAppearance = useCallback((a: Partial<AppearancePrefs>) => {
    setAppearanceState((p) => ({
      ...p,
      ...a,
      uiTheme: a.uiTheme !== undefined ? normalizeUiTheme(a.uiTheme) : p.uiTheme,
      fontFamily: a.fontFamily !== undefined ? normalizeFontFamily(a.fontFamily) : p.fontFamily,
      widgetOrder: a.widgetOrder ? normalizeWidgetOrder(a.widgetOrder) : p.widgetOrder,
      hiddenWidgets: a.hiddenWidgets ? normalizeHiddenWidgets(a.hiddenWidgets) : p.hiddenWidgets,
    }));
    if (a.fontFamily !== undefined) {
      const nextFont = normalizeFontFamily(a.fontFamily);
      setTypographyState((prev) => ({ ...prev, fontFamily: nextFont }));
    }
  }, []);

  const setTypography = useCallback((next: Partial<TypographyPrefs>) => {
    setTypographyState((p) => {
      const updated: TypographyPrefs = {
        fontFamily:
          next.fontFamily !== undefined ? normalizeFontFamily(next.fontFamily) : p.fontFamily,
        fontScale: next.fontScale !== undefined ? clampFontScale(next.fontScale) : p.fontScale,
        headingScale:
          next.headingScale !== undefined ? clampHeadingScale(next.headingScale) : p.headingScale,
        lineHeight: next.lineHeight !== undefined ? clampLineHeight(next.lineHeight) : p.lineHeight,
        letterSpacing:
          next.letterSpacing !== undefined
            ? clampLetterSpacing(next.letterSpacing)
            : p.letterSpacing,
        fontWeight: next.fontWeight ?? p.fontWeight,
        readabilityPreset:
          next.readabilityPreset !== undefined
            ? normalizeReadabilityPreset(next.readabilityPreset)
            : p.readabilityPreset,
      };
      return updated;
    });
    if (next.fontFamily !== undefined) {
      const nextFont = normalizeFontFamily(next.fontFamily);
      setAppearanceState((prev) => ({ ...prev, fontFamily: nextFont }));
    }
    if (next.fontScale !== undefined) {
      const clamped = clampFontScale(next.fontScale);
      setA11yState((prev) => ({ ...prev, fontScale: clamped }));
    }
  }, []);

  const setLayout = useCallback((next: Partial<LayoutPrefs>) => {
    setLayoutState((p) => ({
      ...p,
      ...next,
      workspace:
        next.workspace !== undefined ? normalizeLayoutWorkspace(next.workspace) : p.workspace,
    }));
  }, []);

  const setLocale = useCallback((l: Partial<LocalePrefs>) => {
    setLocaleState((p) => ({ ...p, ...l }));
  }, []);
  const setStudy = useCallback((s: Partial<StudyPrefs>) => {
    setStudyState((p) => ({ ...p, ...s }));
  }, []);
  const setAi = useCallback((a: Partial<AiPrefs>) => {
    setAiState((p) => ({ ...p, ...a }));
  }, []);
  const setNotifications = useCallback((n: Partial<NotificationPrefs>) => {
    setNotificationsState((p) => ({ ...p, ...n }));
  }, []);
  const setPrivacy = useCallback((p: Partial<PrivacyPrefs>) => {
    setPrivacyState((prev) => ({ ...prev, ...p }));
  }, []);
  const setEcosystem = useCallback(
    (e: Partial<EcosystemPrefs>) => {
      setEcosystemState((prev) => {
        const nextVoiceSpeed =
          e.voiceSpeed !== undefined
            ? clampVoiceSpeed(Number(e.voiceSpeed) || 1)
            : e.ttsSpeed !== undefined
              ? clampVoiceSpeed(Number(e.ttsSpeed) || 1)
              : prev.voiceSpeed;
        const nextTtsSpeed =
          e.ttsSpeed !== undefined
            ? clampTtsSpeed(Number(e.ttsSpeed) || 1)
            : e.voiceSpeed !== undefined
              ? clampTtsSpeed(Number(e.voiceSpeed) || 1)
              : prev.ttsSpeed;
        const nextTtsEngine =
          e.ttsEngine !== undefined ? normalizeTtsEngine(e.ttsEngine) : prev.ttsEngine;
        const nextTtsVoice =
          e.ttsVoice !== undefined ? normalizeTtsVoice(e.ttsVoice) : prev.ttsVoice;
        const nextEcosystem = {
          ...prev,
          ...e,
          voiceSpeed: nextVoiceSpeed,
          ttsSpeed: nextTtsSpeed,
          ttsEngine: nextTtsEngine,
          ttsVoice: nextTtsVoice,
        };
        if (e.ttsEngine !== undefined || e.ttsVoice !== undefined || e.ttsSpeed !== undefined) {
          savePersistedTtsConfig(
            {
              engine: nextTtsEngine,
              voicePreset: nextTtsVoice,
              rate: nextTtsSpeed,
            },
            activeUid,
          );
        }
        return nextEcosystem;
      });
    },
    [activeUid],
  );
  const setSoundAndQuiz = useCallback((s: Partial<SoundAndQuizPrefs>) => {
    setSoundAndQuizState((prev) => {
      let nextSound =
        s.soundEffectsEnabled !== undefined
          ? Boolean(s.soundEffectsEnabled)
          : prev.soundEffectsEnabled;
      let nextStyle =
        s.interactionStyle !== undefined
          ? normalizeInteractionStyle(s.interactionStyle)
          : (prev.interactionStyle ?? (nextSound ? "sound" : "silent"));

      if (s.interactionStyle !== undefined) {
        nextSound = nextStyle === "sound";
      } else if (s.soundEffectsEnabled !== undefined) {
        nextStyle = nextSound ? "sound" : "silent";
      }

      const next: SoundAndQuizPrefs = {
        soundEffectsEnabled: nextSound,
        interactionStyle: nextStyle,
        quizButtonStyle:
          s.quizButtonStyle !== undefined
            ? normalizeQuizButtonStyle(s.quizButtonStyle)
            : prev.quizButtonStyle,
        quizColorPalette:
          s.quizColorPalette !== undefined
            ? normalizeQuizColorPalette(s.quizColorPalette)
            : prev.quizColorPalette,
        quizFeedbackStyle:
          s.quizFeedbackStyle !== undefined
            ? normalizeQuizFeedbackStyle(s.quizFeedbackStyle)
            : prev.quizFeedbackStyle,
      };
      setSoundEffectsEnabled(next.soundEffectsEnabled);
      return next;
    });
  }, []);
  const setUiMode = useCallback((m: UiMode) => {
    setUiModeState(m);
  }, []);
  const setThemePresetId = useCallback((id: string | null) => {
    setThemePresetIdState(id === null ? null : normalizeThemePresetId(id));
  }, []);
  const setLayoutMode = useCallback((m: LayoutMode) => {
    const safeMode = normalizeLayoutMode(m);
    setLayoutModeState(safeMode);
    if (safeMode === "compact") {
      setLayoutState((prev) => ({ ...prev, sidebarMode: "compact" }));
    } else if (safeMode === "classic" || safeMode === "floating" || safeMode === "bento") {
      setLayoutState((prev) => ({ ...prev, sidebarMode: "expanded" }));
    }
  }, []);

  const setUiExperience = useCallback((id: UiExperienceId) => {
    const safeId = normalizeUiExperience(id);
    setPreviewDraft(null);
    setUiExperienceState(safeId);
    const spec = getUiExperienceById(safeId);
    setLayoutModeState(spec.pairedLayoutMode);
  }, []);

  const applyThemePreset = useCallback(
    (preset: ThemeCatalogPreset, modeOverride?: ThemeMode) => {
      setPreviewDraft(null);
      setThemePresetIdState(preset.id);
      setThemeState(modeOverride ?? preset.recommendedMode);
      const layoutSpec = getLayoutModeById(preset.layoutMode);
      setLayoutModeState(layoutSpec.id);
      setLayoutState((prev) => ({ ...prev, sidebarMode: layoutSpec.sidebarMode }));
      setAppearance({
        uiTheme: preset.baseUiTheme,
        accent: "custom",
        customAccentHex: preset.accentHex,
        cardStyle: preset.cardStyle,
        borderStyle: preset.borderStyle,
        shadowLevel: preset.shadowLevel,
        cornerStyle: preset.cornerStyle,
        bgStyle: preset.bgStyle,
        fontFamily: preset.fontFamily,
      });
    },
    [setAppearance],
  );

  const setBtcVisualTheme = useCallback((theme: BtcVisualTheme) => {
    setBtcVisualThemeState(theme);
    try {
      localStorage.setItem("btc-visual-theme", theme);
    } catch {
      // Ignore storage write error
    }
  }, []);

  const setBtcNavLayout = useCallback((layout: BtcNavLayout) => {
    setBtcNavLayoutState(layout);
    try {
      localStorage.setItem("btc-nav-layout", layout);
    } catch {
      // Ignore storage write error
    }
  }, []);

  const startPreview = useCallback((draft: PreferencePreviewDraft) => {
    setPreviewDraft((prev) => {
      const nextTheme = draft.theme ?? prev?.theme;
      const nextLayoutMode = draft.layoutMode ?? prev?.layoutMode;
      const nextUiExperience = draft.uiExperience ?? prev?.uiExperience;
      const nextPresetId =
        draft.themePresetId !== undefined ? draft.themePresetId : prev?.themePresetId;
      const nextBtcTheme = draft.btcVisualTheme ?? prev?.btcVisualTheme;
      const nextBtcNav = draft.btcNavLayout ?? prev?.btcNavLayout;
      return {
        ...(nextTheme !== undefined ? { theme: nextTheme } : {}),
        ...(nextLayoutMode !== undefined ? { layoutMode: nextLayoutMode } : {}),
        ...(nextUiExperience !== undefined ? { uiExperience: nextUiExperience } : {}),
        ...(nextPresetId !== undefined ? { themePresetId: nextPresetId } : {}),
        ...(nextBtcTheme !== undefined ? { btcVisualTheme: nextBtcTheme } : {}),
        ...(nextBtcNav !== undefined ? { btcNavLayout: nextBtcNav } : {}),
        ...(prev?.appearance || draft.appearance
          ? { appearance: { ...(prev?.appearance ?? {}), ...(draft.appearance ?? {}) } }
          : {}),
        ...(prev?.typography || draft.typography
          ? { typography: { ...(prev?.typography ?? {}), ...(draft.typography ?? {}) } }
          : {}),
        ...(prev?.layout || draft.layout
          ? { layout: { ...(prev?.layout ?? {}), ...(draft.layout ?? {}) } }
          : {}),
      };
    });
  }, []);

  const cancelPreview = useCallback(() => {
    setPreviewDraft(null);
  }, []);

  const commitPreview = useCallback((): PreferencePreviewDraft | null => {
    const current = previewDraft;
    if (!current) return null;
    if (current.theme) setThemeState(current.theme);
    if (current.appearance) setAppearance(current.appearance);
    if (current.typography) setTypography(current.typography);
    if (current.layout) setLayout(current.layout);
    if (current.themePresetId !== undefined) setThemePresetIdState(current.themePresetId);
    if (current.layoutMode) setLayoutModeState(current.layoutMode);
    if (current.uiExperience) setUiExperienceState(normalizeUiExperience(current.uiExperience));
    if (current.btcVisualTheme) setBtcVisualTheme(current.btcVisualTheme);
    if (current.btcNavLayout) setBtcNavLayout(current.btcNavLayout);
    setPreviewDraft(null);
    return current;
  }, [previewDraft, setAppearance, setLayout, setTypography, setBtcVisualTheme, setBtcNavLayout]);

  const resetAllPreferences = useCallback(() => {
    setPreviewDraft(null);
    setLangState("en");
    setThemeState("dark");
    setUiModeState("simplified");
    setThemePresetIdState("btc_classic");
    setLayoutModeState("classic");
    setUiExperienceState("classic");
    setBtcVisualThemeState("btc_original");
    setBtcNavLayoutState("classic");
    try {
      localStorage.removeItem("btc-visual-theme");
      localStorage.removeItem("btc-nav-layout");
    } catch {
      // Ignore storage remove error
    }
    setA11yState(defaultA11yFull);
    setAppearanceState(defaultAppearancePrefs);
    setTypographyState(defaultTypographyPrefs);
    setLayoutState(defaultLayoutPrefs);
    setLocaleState(defaultLocalePrefs);
    setStudyState(defaultStudyPrefs);
    setAiState(defaultAiPrefs);
    setNotificationsState(defaultNotificationPrefs);
    setPrivacyState(defaultPrivacyPrefs);
    setEcosystemState(defaultEcosystemPrefs);
    clearPersistedTtsConfig(activeUid);
    setActiveTtsConfig(
      {
        engine: defaultEcosystemPrefs.ttsEngine,
        voicePreset: defaultEcosystemPrefs.ttsVoice,
        rate: defaultEcosystemPrefs.ttsSpeed,
      },
      { persist: false },
    );
    setSoundAndQuizState(defaultSoundAndQuizPrefs);
    setSoundEffectsEnabled(defaultSoundAndQuizPrefs.soundEffectsEnabled);
  }, [activeUid]);

  const syncPrefsForUser = useCallback(
    (uid: string | null) => {
      setActiveUid(uid);
      if (uid) {
        // Hydrate user's saved per-UID snapshot directly without flashing btc_classic defaults first
        const hydratedExisting = hydrateFromStorageKey(getPrefsStorageKey(uid));
        if (!hydratedExisting) {
          // Preserve current guest/device look until cloud settings finish syncing
          hydrateFromStorageKey(PREFS_STORAGE_KEY);
        }
      } else {
        resetAllPreferences();
        clearPersistedTtsConfig(null);
        try {
          localStorage.removeItem(PREFS_STORAGE_KEY);
          localStorage.removeItem("nexora-ui-theme");
          localStorage.removeItem("nexora-bg-style");
          localStorage.removeItem("nexora-shadow-level");
          localStorage.removeItem("nexora-theme-mode");
        } catch {
          /* ignore storage cleanup errors */
        }
      }
    },
    [hydrateFromStorageKey, resetAllPreferences],
  );

  const stopSpeaking = useCallback(() => {
    stopEnhancedSpeech();
    setSpeechState("idle");
  }, []);

  const pauseSpeaking = useCallback(() => {
    pauseEnhancedSpeech();
    setSpeechState("paused");
  }, []);

  const resumeSpeaking = useCallback(() => {
    resumeEnhancedSpeech();
    setSpeechState("playing");
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setActiveTtsConfig(
      {
        engine: ecosystem.ttsEngine,
        voicePreset: ecosystem.ttsVoice,
        rate: ecosystem.ttsSpeed || a11y.readAloudRate || 1,
      },
      { persist: true, uid: activeUid },
    );
  }, [
    hydrated,
    activeUid,
    ecosystem.ttsEngine,
    ecosystem.ttsVoice,
    ecosystem.ttsSpeed,
    a11y.readAloudRate,
  ]);

  const speakText = useCallback(
    (text: string): boolean => {
      const ok = speakEnhancedText(text, {
        rate: clampTtsSpeed(ecosystem.ttsSpeed || a11y.readAloudRate || 1),
        engine: ecosystem.ttsEngine,
        voicePreset: ecosystem.ttsVoice,
        onStart: () => setSpeechState("playing"),
        onEnd: () => setSpeechState("idle"),
        onError: () => setSpeechState("idle"),
      });
      if (ok) {
        setSpeechState("playing");
      } else {
        setSpeechState("idle");
      }
      return ok;
    },
    [a11y.readAloudRate, ecosystem.ttsEngine, ecosystem.ttsVoice, ecosystem.ttsSpeed],
  );

  const announce = useCallback((message: string) => {
    setLiveMessage("");
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => setLiveMessage(message));
    }
  }, []);

  const buildAiContextSummary = useCallback(() => {
    const targetAiLang = ai.responseLanguage === "ui" ? lang : ai.responseLanguage;
    const targetStudyLang = study.explanationLanguage === "ui" ? lang : study.explanationLanguage;
    const sharedScopes = [
      ai.shareProfile ? "profile" : null,
      ai.shareTasks ? "tasks" : null,
      ai.shareGrowth ? "growth-map" : null,
    ].filter(Boolean);
    return `Lang=${targetAiLang} (study=${targetStudyLang}) · Tone=${ai.tone} · Length=${ai.responseLength} · Level=${study.complexity} · Style=${study.stepByStep ? "step-by-step" : "direct"}${study.examplesFirst ? "+examples-first" : ""} · Shared=[${sharedScopes.join(", ") || "none"}] · CareJournal=STRICTLY_PRIVATE`;
  }, [ai, study, lang]);

  const t = useCallback((k: DictKey) => translate(lang, k), [lang]);

  const value = useMemo<Prefs>(
    () => ({
      lang,
      setLang,
      theme,
      resolvedTheme,
      setTheme,
      a11y,
      setA11y,
      appearance,
      setAppearance,
      typography,
      setTypography,
      layout,
      setLayout,
      locale,
      setLocale,
      study,
      setStudy,
      ai,
      setAi,
      notifications,
      setNotifications,
      privacy,
      setPrivacy,
      ecosystem,
      setEcosystem,
      soundAndQuiz,
      setSoundAndQuiz,
      uiMode,
      setUiMode,
      themePresetId,
      setThemePresetId,
      applyThemePreset,
      layoutMode,
      setLayoutMode,
      uiExperience,
      setUiExperience,
      btcVisualTheme,
      setBtcVisualTheme,
      btcNavLayout,
      setBtcNavLayout,
      effectiveBtcVisualTheme,
      effectiveBtcNavLayout,
      previewDraft,
      isPreviewing: previewDraft !== null,
      startPreview,
      cancelPreview,
      commitPreview,
      effectiveTheme,
      effectiveResolvedTheme,
      effectiveAppearance,
      effectiveTypography,
      effectiveLayout,
      effectiveThemePresetId,
      effectiveLayoutMode,
      effectiveUiExperience,
      resetAllPreferences,
      activeUid,
      syncPrefsForUser,
      speakText,
      stopSpeaking,
      pauseSpeaking,
      resumeSpeaking,
      speechState,
      speechSupported,
      voiceInputSupported,
      announce,
      buildAiContextSummary,
      t,
      dir,
    }),
    [
      lang,
      setLang,
      theme,
      resolvedTheme,
      setTheme,
      a11y,
      setA11y,
      appearance,
      setAppearance,
      typography,
      setTypography,
      layout,
      setLayout,
      locale,
      setLocale,
      study,
      setStudy,
      ai,
      setAi,
      notifications,
      setNotifications,
      privacy,
      setPrivacy,
      ecosystem,
      setEcosystem,
      soundAndQuiz,
      setSoundAndQuiz,
      uiMode,
      setUiMode,
      themePresetId,
      setThemePresetId,
      applyThemePreset,
      layoutMode,
      setLayoutMode,
      uiExperience,
      setUiExperience,
      btcVisualTheme,
      setBtcVisualTheme,
      btcNavLayout,
      setBtcNavLayout,
      effectiveBtcVisualTheme,
      effectiveBtcNavLayout,
      previewDraft,
      startPreview,
      cancelPreview,
      commitPreview,
      effectiveTheme,
      effectiveResolvedTheme,
      effectiveAppearance,
      effectiveTypography,
      effectiveLayout,
      effectiveThemePresetId,
      effectiveLayoutMode,
      effectiveUiExperience,
      resetAllPreferences,
      activeUid,
      syncPrefsForUser,
      speakText,
      stopSpeaking,
      pauseSpeaking,
      resumeSpeaking,
      speechState,
      speechSupported,
      voiceInputSupported,
      announce,
      buildAiContextSummary,
      t,
      dir,
    ],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>
    </Ctx.Provider>
  );
}

export function usePrefs() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePrefs must be inside PreferencesProvider");
  return c;
}

export function useOptionalPrefs(): Prefs | null {
  return useContext(Ctx);
}
