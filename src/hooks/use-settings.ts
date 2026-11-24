import { useContext } from "react";
import { QueryClientContext, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { reportAppError } from "@/lib/error-handler";
import { auth, db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { isUserEligibleForApp, waitForAuthReady } from "@/lib/firebase-auth";
import {
  clampString,
  defaultSettingsDoc,
  extractCoreUserSettingsDoc,
  USER_SETTINGS_CORE_KEYS,
  type ProfileRow,
  type UserSettingsRow,
} from "@/lib/firestore-data";
import { isSupportedLang } from "@/lib/i18n-dict";
import { BRAND } from "@/config/brand";
import {
  getLayoutModeById,
  normalizeLayoutMode,
  normalizeThemePresetId,
} from "@/lib/theme-catalog";
import {
  clampFontScale,
  clampHeadingScale,
  clampLetterSpacing,
  clampLineHeight,
  clampMinutes,
  clampSpeechRate,
  normalizeFontFamily,
  normalizeHiddenWidgets,
  normalizeLayoutWorkspace,
  normalizeOneOf,
  normalizeReadabilityPreset,
  normalizeRegion,
  normalizeThemeMode,
  normalizeUiTheme,
  normalizeWidgetOrder,
} from "@/lib/settings";

/** Exact whitelist matching firestore.rules `isValidUserSettings(data, userId)` `hasOnly([...])`. */
export const USER_SETTINGS_ALLOWED_KEYS = new Set<string>([
  "user_id",
  "theme",
  "font_scale",
  "dyslexia_font",
  "high_contrast",
  "reduced_motion",
  "focus_ring",
  "simplified_ui",
  "clear_language",
  "read_aloud",
  "read_aloud_rate",
  "voice_input",
  "captions_preferred",
  "accent_color",
  "custom_accent_hex",
  "density",
  "corner_style",
  "font_family",
  "reduce_visual_effects",
  "reading_layout",
  "default_home_tab",
  "dashboard_hidden_widgets",
  "dashboard_widget_order",
  "ui_theme",
  "card_style",
  "border_style",
  "shadow_level",
  "animation_level",
  "bg_style",
  "heading_scale",
  "line_height",
  "letter_spacing",
  "font_weight",
  "readability_preset",
  "layout_workspace",
  "sidebar_mode",
  "show_quick_actions",
  "timezone",
  "date_format",
  "time_format",
  "first_day_of_week",
  "calendar_type",
  "measurement_units",
  "opportunity_scope",
  "study_explanation_lang",
  "study_complexity",
  "study_detail_level",
  "study_step_by_step",
  "study_examples_first",
  "study_visual_aids",
  "study_practice_questions",
  "study_flashcard_style",
  "study_quiz_difficulty",
  "study_session_minutes",
  "study_break_minutes",
  "study_revision_reminders",
  "ai_response_lang",
  "ai_response_length",
  "ai_tone",
  "ai_clarifying_questions",
  "ai_share_profile",
  "ai_share_tasks",
  "ai_share_growth",
  "ai_remember_preferences",
  "ai_save_history",
  "ai_proactive_suggestions",
  "ai_notifications",
  "notify_reminders",
  "notify_tasks",
  "notify_calendar",
  "notify_streak",
  "notify_opportunities",
  "notify_community",
  "notify_teams",
  "notify_email_enabled",
  "notify_push_enabled",
  "notify_frequency",
  "quiet_hours_enabled",
  "quiet_hours_start",
  "quiet_hours_end",
  "keep_signed_in",
  "profile_visibility",
  "show_in_circle",
  "ui_mode",
  "theme_preset_id",
  "layout_mode",
  "updated_at",
]);

export class OfflineSettingsError extends Error {
  constructor() {
    super("Offline: settings saved locally and will sync when back online.");
    this.name = "OfflineSettingsError";
  }
}

export class CloudSettingsFallbackError extends Error {
  constructor(message = "Saved on this device; remote settings rules declined extended sync.") {
    super(message);
    this.name = "CloudSettingsFallbackError";
  }
}

const CORE_KEY_SET = new Set<string>(USER_SETTINGS_CORE_KEYS);

const writeQueueByUid = new Map<string, Promise<void>>();
const lastSavedDocByUid = new Map<string, Record<string, unknown>>();
const deferredRemoteSettingsInitUids = new Set<string>();

export function isRemoteSettingsInitDeferred(uid: string): boolean {
  return deferredRemoteSettingsInitUids.has(uid);
}

export function markRemoteSettingsInitDeferred(uid: string): void {
  deferredRemoteSettingsInitUids.add(uid);
}

export function clearSettingsMemoryCache(uid?: string) {
  if (uid) {
    lastSavedDocByUid.delete(uid);
    deferredRemoteSettingsInitUids.delete(uid);
  } else {
    lastSavedDocByUid.clear();
    deferredRemoteSettingsInitUids.clear();
  }
}

export function sanitizeUserSettingsDoc(
  raw: Record<string, unknown>,
  uid: string,
): Record<string, unknown> {
  const defaults = defaultSettingsDoc(uid);
  const merged: Record<string, unknown> = { ...defaults, ...raw, user_id: uid };
  const cleanDoc: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(merged)) {
    if (USER_SETTINGS_ALLOWED_KEYS.has(key) && val !== undefined) {
      cleanDoc[key] = val;
    }
  }

  // Strictly enforce schema enums & bounds so legacy/corrupt fields never cause PERMISSION_DENIED
  cleanDoc["user_id"] = uid;
  cleanDoc["theme"] = normalizeThemeMode(cleanDoc["theme"]);
  const normalizedUiTheme = normalizeUiTheme(cleanDoc["ui_theme"]);
  cleanDoc["ui_theme"] = normalizedUiTheme === "btc_alternative" ? "classic" : normalizedUiTheme;
  cleanDoc["font_family"] = normalizeFontFamily(cleanDoc["font_family"]);
  cleanDoc["readability_preset"] = normalizeReadabilityPreset(cleanDoc["readability_preset"]);
  cleanDoc["layout_workspace"] = normalizeLayoutWorkspace(cleanDoc["layout_workspace"]);
  cleanDoc["font_scale"] = clampFontScale(Number(cleanDoc["font_scale"] ?? 1));
  if (cleanDoc["heading_scale"] !== undefined) {
    cleanDoc["heading_scale"] = clampHeadingScale(Number(cleanDoc["heading_scale"]));
  }
  if (cleanDoc["line_height"] !== undefined) {
    cleanDoc["line_height"] = clampLineHeight(Number(cleanDoc["line_height"]));
  }
  if (cleanDoc["letter_spacing"] !== undefined) {
    cleanDoc["letter_spacing"] = clampLetterSpacing(Number(cleanDoc["letter_spacing"]));
  }
  if (cleanDoc["read_aloud_rate"] !== undefined) {
    cleanDoc["read_aloud_rate"] = clampSpeechRate(Number(cleanDoc["read_aloud_rate"]));
  }
  if (cleanDoc["study_session_minutes"] !== undefined) {
    cleanDoc["study_session_minutes"] = clampMinutes(
      Number(cleanDoc["study_session_minutes"]),
      5,
      180,
      25,
    );
  }
  if (cleanDoc["study_break_minutes"] !== undefined) {
    cleanDoc["study_break_minutes"] = clampMinutes(
      Number(cleanDoc["study_break_minutes"]),
      1,
      60,
      5,
    );
  }
  cleanDoc["accent_color"] = normalizeOneOf(
    cleanDoc["accent_color"],
    ["teal", "indigo", "emerald", "amber", "rose", "custom"] as const,
    "teal",
  );
  cleanDoc["density"] = normalizeOneOf(
    cleanDoc["density"],
    ["compact", "comfortable", "spacious"] as const,
    "comfortable",
  );
  cleanDoc["corner_style"] = normalizeOneOf(
    cleanDoc["corner_style"],
    ["sharp", "rounded", "soft"] as const,
    "rounded",
  );
  cleanDoc["card_style"] = normalizeOneOf(
    cleanDoc["card_style"],
    ["elevated", "flat", "glass"] as const,
    "elevated",
  );
  cleanDoc["border_style"] = normalizeOneOf(
    cleanDoc["border_style"],
    ["subtle", "crisp", "minimal"] as const,
    "subtle",
  );
  cleanDoc["shadow_level"] = normalizeOneOf(
    cleanDoc["shadow_level"],
    ["none", "soft", "rich"] as const,
    "soft",
  );
  cleanDoc["animation_level"] = normalizeOneOf(
    cleanDoc["animation_level"],
    ["full", "subtle", "none"] as const,
    "full",
  );
  cleanDoc["bg_style"] = normalizeOneOf(
    cleanDoc["bg_style"],
    ["ambient", "solid", "grid"] as const,
    "ambient",
  );
  cleanDoc["reading_layout"] = normalizeOneOf(
    cleanDoc["reading_layout"],
    ["standard", "focused"] as const,
    "standard",
  );
  cleanDoc["default_home_tab"] = normalizeOneOf(
    cleanDoc["default_home_tab"],
    ["dashboard", "growthmap", "history", "journal", "overview"] as const,
    "overview",
  );
  cleanDoc["sidebar_mode"] = normalizeOneOf(
    cleanDoc["sidebar_mode"],
    ["expanded", "compact", "simplified"] as const,
    "expanded",
  );
  cleanDoc["ui_mode"] = normalizeOneOf(
    cleanDoc["ui_mode"],
    ["simplified", "advanced"] as const,
    "simplified",
  );
  cleanDoc["font_weight"] = normalizeOneOf(
    cleanDoc["font_weight"],
    ["regular", "medium"] as const,
    "regular",
  );
  cleanDoc["layout_mode"] = normalizeLayoutMode(cleanDoc["layout_mode"]);
  cleanDoc["dashboard_hidden_widgets"] = normalizeHiddenWidgets(
    cleanDoc["dashboard_hidden_widgets"],
  );
  cleanDoc["dashboard_widget_order"] = normalizeWidgetOrder(cleanDoc["dashboard_widget_order"]);
  if (cleanDoc["custom_accent_hex"] != null) {
    cleanDoc["custom_accent_hex"] =
      clampString(String(cleanDoc["custom_accent_hex"]), 16) ?? "#14b8a6";
  }
  if (cleanDoc["theme_preset_id"] !== undefined) {
    cleanDoc["theme_preset_id"] =
      cleanDoc["theme_preset_id"] === null
        ? null
        : normalizeThemePresetId(clampString(String(cleanDoc["theme_preset_id"]), 64));
  }
  cleanDoc["updated_at"] = new Date().toISOString();
  return cleanDoc;
}

async function requireUid(): Promise<string | null> {
  const current = auth.currentUser;
  if (current && isUserEligibleForApp(current)) {
    return current.uid;
  }
  const user = await waitForAuthReady();
  if (!user || !isUserEligibleForApp(user)) return null;
  return user.uid;
}

export function useAccountSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<UserSettingsRow | null> => {
      const id = await requireUid();
      if (!id) return null;
      const ref = doc(db, "user_settings", id);
      let snap;
      try {
        snap = await getDoc(ref);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `user_settings/${id}`);
      }
      if (snap.exists()) {
        const data = snap.data() as UserSettingsRow;
        lastSavedDocByUid.set(id, data as unknown as Record<string, unknown>);
        deferredRemoteSettingsInitUids.delete(id);
        return data;
      }
      if (isRemoteSettingsInitDeferred(id)) {
        return null;
      }
      const created = defaultSettingsDoc(id);
      try {
        await setDoc(ref, created);
        lastSavedDocByUid.set(id, created as unknown as Record<string, unknown>);
        return created;
      } catch (writeErr) {
        try {
          const coreDoc = extractCoreUserSettingsDoc(
            created as unknown as Record<string, unknown>,
            id,
          );
          await setDoc(ref, coreDoc);
          lastSavedDocByUid.set(id, coreDoc);
          return coreDoc as unknown as UserSettingsRow;
        } catch {
          const alreadyDeferred = isRemoteSettingsInitDeferred(id);
          markRemoteSettingsInitDeferred(id);
          if (!alreadyDeferred) {
            console.info(
              "[BTC:useAccountSettings:init] Using local settings defaults; cloud settings sync deferred.",
            );
          }
          void writeErr;
          return null;
        }
      }
    },
  });
}

export function useSaveSettings() {
  const qc = useContext(QueryClientContext);
  return async (
    patch: Partial<Omit<UserSettingsRow, "user_id" | "theme">> & { theme?: string },
  ) => {
    const id = await requireUid();
    if (!id) return;

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new OfflineSettingsError();
    }

    const { theme: rawTheme, ...rest } = patch;
    const sanitizedRest: Partial<UserSettingsRow> = { ...rest };

    if (sanitizedRest.font_scale !== undefined) {
      sanitizedRest.font_scale = clampFontScale(sanitizedRest.font_scale);
    }
    if (sanitizedRest.heading_scale !== undefined) {
      sanitizedRest.heading_scale = clampHeadingScale(sanitizedRest.heading_scale);
    }
    if (sanitizedRest.line_height !== undefined) {
      sanitizedRest.line_height = clampLineHeight(sanitizedRest.line_height);
    }
    if (sanitizedRest.letter_spacing !== undefined) {
      sanitizedRest.letter_spacing = clampLetterSpacing(sanitizedRest.letter_spacing);
    }
    if (sanitizedRest.font_family !== undefined) {
      sanitizedRest.font_family = normalizeFontFamily(sanitizedRest.font_family);
    }
    if (sanitizedRest.ui_theme !== undefined) {
      sanitizedRest.ui_theme = normalizeUiTheme(sanitizedRest.ui_theme);
    }
    if (sanitizedRest.readability_preset !== undefined) {
      sanitizedRest.readability_preset = normalizeReadabilityPreset(
        sanitizedRest.readability_preset,
      );
    }
    if (sanitizedRest.layout_workspace !== undefined) {
      sanitizedRest.layout_workspace = normalizeLayoutWorkspace(sanitizedRest.layout_workspace);
    }
    if (sanitizedRest.read_aloud_rate !== undefined) {
      sanitizedRest.read_aloud_rate = clampSpeechRate(sanitizedRest.read_aloud_rate);
    }
    if (sanitizedRest.study_session_minutes !== undefined) {
      sanitizedRest.study_session_minutes = clampMinutes(
        sanitizedRest.study_session_minutes,
        5,
        180,
        25,
      );
    }
    if (sanitizedRest.study_break_minutes !== undefined) {
      sanitizedRest.study_break_minutes = clampMinutes(sanitizedRest.study_break_minutes, 1, 60, 5);
    }
    if (sanitizedRest.dashboard_widget_order !== undefined) {
      sanitizedRest.dashboard_widget_order = normalizeWidgetOrder(
        sanitizedRest.dashboard_widget_order,
      );
    }
    if (sanitizedRest.dashboard_hidden_widgets !== undefined) {
      sanitizedRest.dashboard_hidden_widgets = normalizeHiddenWidgets(
        sanitizedRest.dashboard_hidden_widgets,
      );
    }
    if (sanitizedRest.custom_accent_hex !== undefined) {
      sanitizedRest.custom_accent_hex =
        clampString(sanitizedRest.custom_accent_hex, 16) ?? "#14b8a6";
    }
    if (sanitizedRest.theme_preset_id !== undefined) {
      sanitizedRest.theme_preset_id =
        sanitizedRest.theme_preset_id === null
          ? null
          : normalizeThemePresetId(clampString(sanitizedRest.theme_preset_id, 64));
    }

    if (sanitizedRest.layout_mode !== undefined) {
      sanitizedRest.layout_mode = getLayoutModeById(sanitizedRest.layout_mode).id;
    }

    const nextPatch: Partial<UserSettingsRow> = {
      ...sanitizedRest,
      ...(rawTheme !== undefined ? { theme: normalizeThemeMode(rawTheme) } : {}),
      updated_at: new Date().toISOString(),
    };

    const previousQueued = writeQueueByUid.get(id) ?? Promise.resolve();
    let coreOnlyFallbackSucceeded = false;

    const nextOperation = previousQueued
      .catch(() => undefined)
      .then(async () => {
        const ref = doc(db, "user_settings", id);
        let baseData = lastSavedDocByUid.get(id);
        if (!baseData) {
          try {
            const existing = await getDoc(ref);
            baseData = existing.exists() ? (existing.data() as Record<string, unknown>) : {};
          } catch {
            baseData = {};
          }
        }
        const cleanDoc = sanitizeUserSettingsDoc({ ...baseData, ...nextPatch }, id);
        if (isRemoteSettingsInitDeferred(id)) {
          throw new CloudSettingsFallbackError();
        }
        try {
          await setDoc(ref, cleanDoc);
          lastSavedDocByUid.set(id, cleanDoc);
        } catch (writeErr) {
          const isPermissionDenied =
            typeof writeErr === "object" &&
            writeErr !== null &&
            "code" in writeErr &&
            (writeErr as { code?: unknown }).code === "permission-denied";
          if (isPermissionDenied) {
            markRemoteSettingsInitDeferred(id);
            const coreDoc = extractCoreUserSettingsDoc(cleanDoc, id);
            try {
              await setDoc(ref, coreDoc);
              lastSavedDocByUid.set(id, coreDoc);
              coreOnlyFallbackSucceeded = true;
              const patchHasExtendedKeys = Object.keys(patch).some((k) => !CORE_KEY_SET.has(k));
              if (patchHasExtendedKeys) {
                throw new CloudSettingsFallbackError();
              }
              return;
            } catch (coreErr) {
              if (coreErr instanceof CloudSettingsFallbackError) {
                throw coreErr;
              }
              throw new CloudSettingsFallbackError();
            }
          }
          const normalized = reportAppError(
            writeErr,
            "useSaveSettings:write",
            "Saved on this device; remote settings schema declined extended keys.",
          );
          if (normalized.category === "permission") {
            markRemoteSettingsInitDeferred(id);
            throw new CloudSettingsFallbackError();
          }
          throw writeErr;
        }
      });

    writeQueueByUid.set(id, nextOperation);

    try {
      await nextOperation;
    } catch (err) {
      if (err instanceof CloudSettingsFallbackError) {
        qc?.setQueryData<UserSettingsRow | null>(["settings"], (old) =>
          old ? ({ ...old, ...nextPatch } as UserSettingsRow) : old,
        );
        throw err;
      }
      if (!coreOnlyFallbackSucceeded) {
        lastSavedDocByUid.delete(id);
      }
      handleFirestoreError(err, OperationType.UPDATE, `user_settings/${id}`);
    }

    qc?.setQueryData<UserSettingsRow | null>(["settings"], (old) =>
      old ? ({ ...old, ...nextPatch } as UserSettingsRow) : old,
    );
  };
}

export function useSaveProfile() {
  const qc = useQueryClient();
  return async (patch: {
    language?: string;
    region?: string;
    display_name?: string;
    avatar_url?: string | null;
    grade_level?: string | null;
    school_name?: string | null;
    preferred_subjects?: string[];
    learning_goals?: string | null;
    phone_number?: string | null;
  }) => {
    const id = await requireUid();
    if (!id) return;
    const cleanPatch: Partial<ProfileRow> = {
      updated_at: new Date().toISOString(),
    };
    if (patch.language && isSupportedLang(patch.language)) {
      cleanPatch.language = patch.language;
    }
    if (patch.region !== undefined) {
      cleanPatch.region = normalizeRegion(patch.region);
    }
    if (patch.display_name !== undefined) {
      const cleanedName = clampString(patch.display_name, 60);
      if (cleanedName) cleanPatch.display_name = cleanedName;
    }
    if (patch.avatar_url !== undefined) {
      cleanPatch.avatar_url = clampString(patch.avatar_url, 512);
    }
    if (patch.grade_level !== undefined) {
      cleanPatch.grade_level = clampString(patch.grade_level, 60);
    }
    if (patch.school_name !== undefined) {
      cleanPatch.school_name = clampString(patch.school_name, 120);
    }
    if (patch.preferred_subjects !== undefined) {
      cleanPatch.preferred_subjects = patch.preferred_subjects
        .map((s) => s.trim().slice(0, 60))
        .filter(Boolean)
        .slice(0, 12);
    }
    if (patch.learning_goals !== undefined) {
      cleanPatch.learning_goals = clampString(patch.learning_goals, 300);
    }
    if (patch.phone_number !== undefined) {
      cleanPatch.phone_number = clampString(patch.phone_number, 32);
    }

    try {
      await updateDoc(doc(db, "profiles", id), cleanPatch);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `profiles/${id}`);
    }
    await qc.invalidateQueries({ queryKey: ["profile"] });
  };
}

export async function exportStudentDataJson(): Promise<Record<string, unknown>> {
  const uid = await requireUid();
  if (!uid) throw new Error("You must be signed in to export data.");

  const safeGetDoc = async (path: string) => {
    try {
      return await getDoc(doc(db, path, uid));
    } catch {
      return null;
    }
  };
  const safeGetCol = async (colName: string) => {
    try {
      return await getDocs(query(collection(db, colName), where("user_id", "==", uid)));
    } catch {
      return null;
    }
  };

  const [
    profileSnap,
    settingsSnap,
    statsSnap,
    tasksSnap,
    goalsSnap,
    activitySnap,
    studySnap,
    quizSnap,
    focusSnap,
    careSnap,
    journalsSnap,
    legacyJournalsSnap,
    futureSnap,
    oppSnap,
    aiSnap,
    quranSnap,
  ] = await Promise.all([
    safeGetDoc("profiles"),
    safeGetDoc("user_settings"),
    safeGetDoc("user_stats"),
    safeGetCol("tasks"),
    safeGetCol("goals"),
    safeGetCol("activity_events"),
    safeGetCol("study_items"),
    safeGetCol("quiz_attempts"),
    safeGetCol("focus_sessions"),
    safeGetCol("care_entries"),
    safeGetCol("journals"),
    safeGetCol("journal_entries"),
    safeGetCol("future_plans"),
    safeGetCol("opportunities"),
    safeGetCol("ai_conversations"),
    safeGetDoc("quran_preferences"),
  ]);

  const journals = [
    ...(journalsSnap ? journalsSnap.docs.map((d) => d.data()) : []),
    ...(legacyJournalsSnap ? legacyJournalsSnap.docs.map((d) => d.data()) : []),
  ];

  return {
    exported_at: new Date().toISOString(),
    app: BRAND.name,
    uid,
    profile: profileSnap && profileSnap.exists() ? profileSnap.data() : null,
    settings: settingsSnap && settingsSnap.exists() ? settingsSnap.data() : null,
    stats: statsSnap && statsSnap.exists() ? statsSnap.data() : null,
    tasks: tasksSnap ? tasksSnap.docs.map((d) => d.data()) : [],
    goals: goalsSnap ? goalsSnap.docs.map((d) => d.data()) : [],
    activity_events: activitySnap ? activitySnap.docs.map((d) => d.data()) : [],
    study_items: studySnap ? studySnap.docs.map((d) => d.data()) : [],
    quiz_attempts: quizSnap ? quizSnap.docs.map((d) => d.data()) : [],
    focus_sessions: focusSnap ? focusSnap.docs.map((d) => d.data()) : [],
    care_entries: careSnap ? careSnap.docs.map((d) => d.data()) : [],
    journals,
    future_plans: futureSnap ? futureSnap.docs.map((d) => d.data()) : [],
    opportunities: oppSnap ? oppSnap.docs.map((d) => d.data()) : [],
    ai_conversations: aiSnap ? aiSnap.docs.map((d) => d.data()) : [],
    quran_preferences: quranSnap && quranSnap.exists() ? quranSnap.data() : null,
  };
}
