import { useEffect, useRef } from "react";
import { clearSettingsMemoryCache, useAccountSettings } from "@/hooks/use-settings";
import { useProfile, useUser } from "@/hooks/use-nexora";
import { applyAuthPersistence, auth, setSessionRememberPreference } from "@/lib/firebase";
import { getPrefsStorageKey, usePrefs } from "@/lib/preferences";
import { setEcosystemActiveUid } from "@/lib/student-ecosystem";
import {
  findMatchingThemePreset,
  normalizeLayoutMode,
  normalizeThemePresetId,
} from "@/lib/theme-catalog";
import {
  clampFontScale,
  clampHeadingScale,
  clampLetterSpacing,
  clampLineHeight,
  clampSpeechRate,
  defaultA11yFull,
  defaultAiPrefs,
  defaultAppearancePrefs,
  defaultLayoutPrefs,
  defaultLocalePrefs,
  defaultNotificationPrefs,
  defaultPrivacyPrefs,
  defaultStudyPrefs,
  defaultTypographyPrefs,
  normalizeFontFamily,
  normalizeHiddenWidgets,
  normalizeLang,
  normalizeReadabilityPreset,
  normalizeWidgetOrder,
} from "@/lib/settings";

/** Applies the signed-in student's saved settings and profile language once per user session. */
export function AccountPrefsSync() {
  const { data: user } = useUser();
  const { data: settings } = useAccountSettings();
  const { data: profile } = useProfile();
  const {
    setTheme,
    setA11y,
    setAppearance,
    setTypography,
    setLayout,
    setLocale,
    setStudy,
    setAi,
    setNotifications,
    setPrivacy,
    setLang,
    setUiMode,
    setLayoutMode,
    setThemePresetId,
    syncPrefsForUser,
  } = usePrefs();

  const syncedSettingsUid = useRef<string | null>(null);
  const syncedProfileUid = useRef<string | null>(null);
  const lastScopedUid = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const uid = user?.uid ?? null;
    const prevUid = lastScopedUid.current;
    if (prevUid === uid) return;
    lastScopedUid.current = uid;
    syncedSettingsUid.current = null;
    syncedProfileUid.current = null;
    if (uid) {
      syncPrefsForUser(uid);
      setEcosystemActiveUid(uid);
    } else if (typeof prevUid === "string") {
      clearSettingsMemoryCache();
      syncPrefsForUser(null);
      setEcosystemActiveUid(null);
    }
  }, [user?.uid, syncPrefsForUser]);

  useEffect(() => {
    if (!settings) {
      syncedSettingsUid.current = null;
      return;
    }
    if (syncedSettingsUid.current === settings.user_id) return;
    syncedSettingsUid.current = settings.user_id;

    const keepSignedIn = settings.keep_signed_in ?? defaultPrivacyPrefs.keepSignedIn;
    setSessionRememberPreference(keepSignedIn);
    if (auth.currentUser && !auth.currentUser.isAnonymous) {
      void applyAuthPersistence(keepSignedIn).catch(() => undefined);
    }

    let hasNewerLocalPrefs = false;
    if (typeof window !== "undefined") {
      try {
        const rawLocal = localStorage.getItem(getPrefsStorageKey(settings.user_id));
        if (rawLocal) {
          const parsedLocal = JSON.parse(rawLocal) as { updatedAt?: string };
          if (
            parsedLocal.updatedAt &&
            settings.updated_at &&
            Date.parse(parsedLocal.updatedAt) > Date.parse(settings.updated_at)
          ) {
            hasNewerLocalPrefs = true;
          }
        }
      } catch {
        // Ignore storage read errors
      }
    }

    if (!hasNewerLocalPrefs) {
      setTheme(settings.theme === "light" || settings.theme === "system" ? settings.theme : "dark");

      setA11y({
        fontScale: clampFontScale(Number(settings.font_scale ?? 1)),
        dyslexia: Boolean(settings.dyslexia_font),
        contrast: Boolean(settings.high_contrast),
        reduceMotion: Boolean(settings.reduced_motion),
        ...(settings.focus_ring !== undefined ? { focusRing: settings.focus_ring } : {}),
        ...(settings.simplified_ui !== undefined ? { simplified: settings.simplified_ui } : {}),
        ...(settings.clear_language !== undefined
          ? { clearLanguage: settings.clear_language }
          : {}),
        ...(settings.read_aloud !== undefined ? { readAloud: settings.read_aloud } : {}),
        ...(settings.read_aloud_rate !== undefined
          ? { readAloudRate: clampSpeechRate(Number(settings.read_aloud_rate)) }
          : {}),
        ...(settings.voice_input !== undefined ? { voiceInput: settings.voice_input } : {}),
        ...(settings.captions_preferred !== undefined
          ? { captions: settings.captions_preferred }
          : {}),
      });

      const appPatch: Parameters<typeof setAppearance>[0] = {};
      if (settings.ui_theme !== undefined) appPatch.uiTheme = settings.ui_theme;
      if (settings.accent_color !== undefined) appPatch.accent = settings.accent_color;
      if (settings.custom_accent_hex !== undefined) {
        appPatch.customAccentHex = settings.custom_accent_hex;
      }
      if (settings.density !== undefined) appPatch.density = settings.density;
      if (settings.corner_style !== undefined) appPatch.cornerStyle = settings.corner_style;
      if (settings.card_style !== undefined) appPatch.cardStyle = settings.card_style;
      if (settings.border_style !== undefined) appPatch.borderStyle = settings.border_style;
      if (settings.shadow_level !== undefined) appPatch.shadowLevel = settings.shadow_level;
      if (settings.animation_level !== undefined) {
        appPatch.animationLevel = settings.animation_level;
      }
      if (settings.bg_style !== undefined) appPatch.bgStyle = settings.bg_style;
      if (settings.font_family !== undefined) {
        appPatch.fontFamily = normalizeFontFamily(settings.font_family);
      }
      if (settings.reduce_visual_effects !== undefined) {
        appPatch.reduceVisualEffects = settings.reduce_visual_effects;
      }
      if (settings.reading_layout !== undefined) appPatch.readingLayout = settings.reading_layout;
      if (settings.default_home_tab !== undefined) {
        appPatch.defaultHomeTab = settings.default_home_tab;
      }
      if (settings.dashboard_hidden_widgets !== undefined) {
        appPatch.hiddenWidgets = normalizeHiddenWidgets(settings.dashboard_hidden_widgets);
      }
      if (settings.dashboard_widget_order !== undefined) {
        appPatch.widgetOrder = normalizeWidgetOrder(settings.dashboard_widget_order);
      }
      if (Object.keys(appPatch).length > 0) {
        setAppearance(appPatch);
      }

      const typoPatch: Parameters<typeof setTypography>[0] = {
        fontScale: clampFontScale(Number(settings.font_scale ?? 1)),
      };
      if (settings.font_family !== undefined) {
        typoPatch.fontFamily = normalizeFontFamily(settings.font_family);
      }
      if (settings.heading_scale !== undefined) {
        typoPatch.headingScale = clampHeadingScale(Number(settings.heading_scale));
      }
      if (settings.line_height !== undefined) {
        typoPatch.lineHeight = clampLineHeight(Number(settings.line_height));
      }
      if (settings.letter_spacing !== undefined) {
        typoPatch.letterSpacing = clampLetterSpacing(Number(settings.letter_spacing));
      }
      if (settings.font_weight !== undefined) typoPatch.fontWeight = settings.font_weight;
      if (settings.readability_preset !== undefined) {
        typoPatch.readabilityPreset = normalizeReadabilityPreset(settings.readability_preset);
      }
      setTypography(typoPatch);

      const layoutPatch: Parameters<typeof setLayout>[0] = {};
      if (settings.layout_workspace !== undefined) {
        layoutPatch.workspace = settings.layout_workspace;
      }
      if (settings.sidebar_mode !== undefined) layoutPatch.sidebarMode = settings.sidebar_mode;
      if (settings.show_quick_actions !== undefined) {
        layoutPatch.showQuickActions = settings.show_quick_actions;
      }
      if (Object.keys(layoutPatch).length > 0) {
        setLayout(layoutPatch);
      }
    }

    setLocale({
      timezone: settings.timezone ?? defaultLocalePrefs.timezone,
      dateFormat: settings.date_format ?? defaultLocalePrefs.dateFormat,
      timeFormat: settings.time_format ?? defaultLocalePrefs.timeFormat,
      firstDayOfWeek: settings.first_day_of_week ?? defaultLocalePrefs.firstDayOfWeek,
      calendar: settings.calendar_type ?? defaultLocalePrefs.calendar,
      units: settings.measurement_units ?? defaultLocalePrefs.units,
      opportunityScope: settings.opportunity_scope ?? defaultLocalePrefs.opportunityScope,
    });

    setStudy({
      explanationLanguage: settings.study_explanation_lang ?? defaultStudyPrefs.explanationLanguage,
      complexity: settings.study_complexity ?? defaultStudyPrefs.complexity,
      detailLevel: settings.study_detail_level ?? defaultStudyPrefs.detailLevel,
      stepByStep: settings.study_step_by_step ?? defaultStudyPrefs.stepByStep,
      examplesFirst: settings.study_examples_first ?? defaultStudyPrefs.examplesFirst,
      visualAids: settings.study_visual_aids ?? defaultStudyPrefs.visualAids,
      practiceQuestions: settings.study_practice_questions ?? defaultStudyPrefs.practiceQuestions,
      flashcardStyle: settings.study_flashcard_style ?? defaultStudyPrefs.flashcardStyle,
      quizDifficulty: settings.study_quiz_difficulty ?? defaultStudyPrefs.quizDifficulty,
      sessionMinutes: settings.study_session_minutes ?? defaultStudyPrefs.sessionMinutes,
      breakMinutes: settings.study_break_minutes ?? defaultStudyPrefs.breakMinutes,
      revisionReminders: settings.study_revision_reminders ?? defaultStudyPrefs.revisionReminders,
    });

    setAi({
      responseLanguage: settings.ai_response_lang ?? defaultAiPrefs.responseLanguage,
      responseLength: settings.ai_response_length ?? defaultAiPrefs.responseLength,
      tone: settings.ai_tone ?? defaultAiPrefs.tone,
      clarifyingQuestions: settings.ai_clarifying_questions ?? defaultAiPrefs.clarifyingQuestions,
      shareProfile: settings.ai_share_profile ?? defaultAiPrefs.shareProfile,
      shareTasks: settings.ai_share_tasks ?? defaultAiPrefs.shareTasks,
      shareGrowth: settings.ai_share_growth ?? defaultAiPrefs.shareGrowth,
      rememberPreferences: settings.ai_remember_preferences ?? defaultAiPrefs.rememberPreferences,
      saveHistory: settings.ai_save_history ?? defaultAiPrefs.saveHistory,
      proactiveSuggestions:
        settings.ai_proactive_suggestions ?? defaultAiPrefs.proactiveSuggestions,
      notifications: settings.ai_notifications ?? defaultAiPrefs.notifications,
    });

    setNotifications({
      reminders: settings.notify_reminders ?? defaultNotificationPrefs.reminders,
      tasks: settings.notify_tasks ?? defaultNotificationPrefs.tasks,
      calendar: settings.notify_calendar ?? defaultNotificationPrefs.calendar,
      streak: settings.notify_streak ?? defaultNotificationPrefs.streak,
      opportunities: settings.notify_opportunities ?? defaultNotificationPrefs.opportunities,
      community: settings.notify_community ?? defaultNotificationPrefs.community,
      teams: settings.notify_teams ?? defaultNotificationPrefs.teams,
      emailEnabled: settings.notify_email_enabled ?? defaultNotificationPrefs.emailEnabled,
      pushEnabled: settings.notify_push_enabled ?? defaultNotificationPrefs.pushEnabled,
      frequency: settings.notify_frequency ?? defaultNotificationPrefs.frequency,
      quietHoursEnabled: settings.quiet_hours_enabled ?? defaultNotificationPrefs.quietHoursEnabled,
      quietStart: settings.quiet_hours_start ?? defaultNotificationPrefs.quietStart,
      quietEnd: settings.quiet_hours_end ?? defaultNotificationPrefs.quietEnd,
    });

    setPrivacy({
      keepSignedIn,
      profileVisibility: settings.profile_visibility ?? defaultPrivacyPrefs.profileVisibility,
      showInCircle: settings.show_in_circle ?? defaultPrivacyPrefs.showInCircle,
    });

    if (!hasNewerLocalPrefs) {
      if (settings.ui_mode === "simplified" || settings.ui_mode === "advanced") {
        setUiMode(settings.ui_mode);
      }
      if (settings.layout_mode !== undefined) {
        setLayoutMode(normalizeLayoutMode(settings.layout_mode));
      }

      if (settings.theme_preset_id !== undefined) {
        setThemePresetId(normalizeThemePresetId(settings.theme_preset_id));
      } else if (settings.ui_theme !== undefined) {
        const matchedPreset = findMatchingThemePreset(settings);
        if (matchedPreset) {
          setThemePresetId(matchedPreset.id);
        } else if (settings.accent_color && settings.accent_color !== "custom") {
          setThemePresetId(null);
        }
      }
    }
  }, [
    settings,
    setTheme,
    setA11y,
    setAppearance,
    setTypography,
    setLayout,
    setLocale,
    setStudy,
    setAi,
    setNotifications,
    setPrivacy,
    setUiMode,
    setLayoutMode,
    setThemePresetId,
  ]);

  useEffect(() => {
    if (!profile) {
      syncedProfileUid.current = null;
      return;
    }
    if (syncedProfileUid.current === profile.id) return;
    syncedProfileUid.current = profile.id;
    setLang(normalizeLang(profile.language));
  }, [profile, setLang]);

  return null;
}
