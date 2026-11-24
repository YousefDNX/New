import { useCallback, useEffect, useState } from "react";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, isFirebaseConfigured, OperationType } from "@/lib/firebase";
import { isUserEligibleForApp, waitForAuthReady } from "@/lib/firebase-auth";
import type {
  QuranBookmarkRow,
  QuranPreferencesRow,
  QuranReadingHistoryRow,
} from "@/lib/firestore-data";
import {
  clearSessionQuranPrefs,
  DEFAULT_QURAN_PREFERENCES,
  normalizeQuranPreferences,
  readSessionQuranPrefs,
  writeSessionQuranPrefs,
  type QuranBookmark,
  type QuranPreferencesState,
  type QuranReadingHistoryEntry,
} from "@/lib/quran";

export type QuranCloudStatus = "session" | "saving" | "saved" | "unavailable";

function toBookmarkRow(item: QuranBookmark): QuranBookmarkRow {
  return {
    id: item.id,
    surah_id: item.surahId,
    ayah_number: item.ayahNumber,
    verse_key: item.verseKey,
    surah_name_ar: item.surahNameAr,
    surah_name_en: item.surahNameEn,
    excerpt: item.excerpt,
    label: item.label,
    category: item.category,
    created_at: item.createdAt,
  };
}

function fromBookmarkRow(row: QuranBookmarkRow): QuranBookmark {
  return {
    id: row.id,
    surahId: row.surah_id,
    ayahNumber: row.ayah_number,
    verseKey: row.verse_key,
    surahNameAr: row.surah_name_ar,
    surahNameEn: row.surah_name_en,
    excerpt: row.excerpt,
    label: row.label,
    category: row.category,
    createdAt: row.created_at,
  };
}

function toHistoryRow(item: QuranReadingHistoryEntry): QuranReadingHistoryRow {
  return {
    surah_id: item.surahId,
    ayah_number: item.ayahNumber,
    surah_name_ar: item.surahNameAr,
    surah_name_en: item.surahNameEn,
    opened_at: item.openedAt,
  };
}

function fromHistoryRow(row: QuranReadingHistoryRow): QuranReadingHistoryEntry {
  return {
    surahId: row.surah_id,
    ayahNumber: row.ayah_number,
    surahNameAr: row.surah_name_ar,
    surahNameEn: row.surah_name_en,
    openedAt: row.opened_at,
  };
}

export function toQuranFirestoreRow(
  uid: string,
  prefs: QuranPreferencesState,
): QuranPreferencesRow {
  const clean = normalizeQuranPreferences(prefs);
  return {
    user_id: uid,
    save_enabled: clean.saveToCloud,
    last_surah: clean.lastSurah,
    last_ayah: clean.lastAyah,
    last_position_seconds: clean.lastPositionSeconds,
    preferred_reciter_id: clean.reciterId,
    playback_rate: clean.playbackRate,
    volume: clean.volume,
    muted: clean.muted,
    repeat_mode: clean.repeatMode,
    font_size_step: clean.fontSizeStep,
    reading_theme: clean.readingTheme,
    line_spacing: clean.lineSpacing,
    reading_width: clean.readingWidth,
    show_verse_markers: clean.showVerseMarkers,
    show_translation: clean.showTranslation,
    translation_id: clean.translationId,
    bookmarks: clean.bookmarks.map(toBookmarkRow),
    reading_history: clean.readingHistory.map(toHistoryRow),
    updated_at: new Date().toISOString(),
  };
}

export function fromQuranFirestoreRow(row: QuranPreferencesRow): QuranPreferencesState {
  return normalizeQuranPreferences({
    saveToCloud: row.save_enabled,
    lastSurah: row.last_surah,
    lastAyah: row.last_ayah,
    lastPositionSeconds: row.last_position_seconds,
    reciterId: row.preferred_reciter_id,
    playbackRate: row.playback_rate,
    volume: row.volume,
    muted: row.muted,
    repeatMode: row.repeat_mode,
    fontSizeStep: row.font_size_step ?? 3,
    readingTheme: row.reading_theme ?? "system",
    lineSpacing: row.line_spacing ?? "comfortable",
    readingWidth: row.reading_width ?? "focused",
    showVerseMarkers: row.show_verse_markers ?? true,
    showTranslation: row.show_translation ?? false,
    translationId: row.translation_id ?? 20,
    bookmarks: Array.isArray(row.bookmarks) ? row.bookmarks.map(fromBookmarkRow) : [],
    readingHistory: Array.isArray(row.reading_history)
      ? row.reading_history.map(fromHistoryRow)
      : [],
    updatedAt: row.updated_at,
  });
}

async function getEligibleUserId(): Promise<string | null> {
  if (!isFirebaseConfigured) return null;
  const user = await waitForAuthReady();
  if (!user || !isUserEligibleForApp(user)) return null;
  return user.uid;
}

export function useQuranPreferences() {
  const [prefs, setPrefs] = useState<QuranPreferencesState>(() => {
    return readSessionQuranPrefs() ?? DEFAULT_QURAN_PREFERENCES;
  });
  const [cloudStatus, setCloudStatus] = useState<QuranCloudStatus>("session");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      const uid = await getEligibleUserId();
      if (!active) return;

      if (!uid) {
        setCloudStatus("session");
        setHydrated(true);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "quran_preferences", uid));
        if (!active) return;
        if (snap.exists()) {
          const cloudPrefs = fromQuranFirestoreRow(snap.data() as QuranPreferencesRow);
          setPrefs(cloudPrefs);
          writeSessionQuranPrefs(cloudPrefs);
          setCloudStatus(cloudPrefs.saveToCloud ? "saved" : "session");
        } else {
          setCloudStatus("session");
        }
      } catch (err) {
        if (!active) return;
        try {
          handleFirestoreError(err, OperationType.GET, `quran_preferences/${uid}`);
        } catch {
          // Non-fatal: fall back transparently to session-based playback without claiming cloud save.
        }
        setCloudStatus("unavailable");
      } finally {
        if (active) setHydrated(true);
      }
    }

    void hydrate();
    return () => {
      active = false;
    };
  }, []);

  const persistPreferences = useCallback(
    async (next: QuranPreferencesState, options?: { syncToCloud?: boolean }) => {
      const normalized = normalizeQuranPreferences(next);
      setPrefs(normalized);
      writeSessionQuranPrefs(normalized);

      const shouldSyncCloud = options?.syncToCloud ?? normalized.saveToCloud;
      if (!shouldSyncCloud) {
        setCloudStatus("session");
        return false;
      }

      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        setCloudStatus("unavailable");
        return false;
      }

      const uid = await getEligibleUserId();
      if (!uid) {
        setCloudStatus("unavailable");
        return false;
      }

      setCloudStatus("saving");
      try {
        const row = toQuranFirestoreRow(uid, normalized);
        await setDoc(doc(db, "quran_preferences", uid), row);
        setCloudStatus("saved");
        return true;
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.WRITE, `quran_preferences/${uid}`);
        } catch {
          // Degrade honestly: keep session state and report cloud unavailable.
        }
        setCloudStatus("unavailable");
        return false;
      }
    },
    [],
  );

  const clearSavedPreferences = useCallback(async () => {
    clearSessionQuranPrefs();
    const resetState: QuranPreferencesState = {
      ...DEFAULT_QURAN_PREFERENCES,
      updatedAt: new Date().toISOString(),
    };
    setPrefs(resetState);

    const uid = await getEligibleUserId();
    if (!uid) {
      setCloudStatus("session");
      return;
    }

    try {
      await deleteDoc(doc(db, "quran_preferences", uid));
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `quran_preferences/${uid}`);
      } catch {
        // Ignore if doc did not exist or rules forbid delete
      }
    }
    setCloudStatus("session");
  }, []);

  return {
    prefs,
    hydrated,
    cloudStatus,
    persistPreferences,
    clearSavedPreferences,
  };
}
