/**
 * Quran Memorization Tracker & Spaced Repetition Review Engine
 *
 * Tracks user memorization progress across all 114 Surahs (6,236 verses),
 * schedules timely reviews using spaced intervals, and links to authentic audio reciters.
 */

import { SURAHS_INDEX } from "./quran-mushaf";

export type MemorizationStatus = "not_started" | "memorizing" | "memorized" | "mastered";

export interface SurahMemorizationEntry {
  surahId: number;
  status: MemorizationStatus;
  memorizedVersesCount: number;
  totalVersesCount: number;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  reviewIntervalDays: number; // 1, 3, 7, 14, 30
  consecutivePasses: number;
  notes: string;
}

export interface MemorizationOverview {
  totalSurahsMemorized: number;
  totalSurahsInProgress: number;
  totalVersesMemorized: number;
  totalQuranVerses: number; // 6,236
  overallPercentage: number;
  dueReviewsCount: number;
}

const STORAGE_KEY = "btc_quran_memorization_v1";
export const TOTAL_QURAN_VERSES = 6236;

/**
 * Loads all memorization records from local storage.
 * Defaults all 114 surahs to 'not_started' if uninitialized.
 */
export function loadMemorizationState(): Record<number, SurahMemorizationEntry> {
  const defaults: Record<number, SurahMemorizationEntry> = {};
  for (const s of SURAHS_INDEX) {
    defaults[s.id] = {
      surahId: s.id,
      status: "not_started",
      memorizedVersesCount: 0,
      totalVersesCount: s.versesCount,
      lastReviewedAt: null,
      nextReviewAt: null,
      reviewIntervalDays: 1,
      consecutivePasses: 0,
      notes: "",
    };
  }

  if (typeof window === "undefined") return defaults;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaults;

    for (const [idStr, entry] of Object.entries(parsed)) {
      const sId = Number(idStr);
      if (defaults[sId] && entry && typeof entry === "object") {
        defaults[sId] = {
          ...defaults[sId]!,
          ...(entry as Partial<SurahMemorizationEntry>),
          surahId: sId,
          totalVersesCount: defaults[sId]!.totalVersesCount,
        };
      }
    }
  } catch {
    /* fallback to defaults */
  }

  return defaults;
}

/**
 * Saves all memorization records to local storage.
 */
export function saveMemorizationState(state: Record<number, SurahMemorizationEntry>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore storage errors */
  }
}

/**
 * Updates a single Surah's memorization status and calculates next review dates.
 */
export function updateSurahProgress(
  currentState: Record<number, SurahMemorizationEntry>,
  surahId: number,
  updates: {
    status?: MemorizationStatus;
    memorizedVersesCount?: number;
    notes?: string;
    markReviewed?: boolean;
    reviewPassed?: boolean;
  },
): Record<number, SurahMemorizationEntry> {
  const existing = currentState[surahId];
  if (!existing) return currentState;

  const now = new Date();
  let status = updates.status ?? existing.status;
  let memorizedCount = updates.memorizedVersesCount ?? existing.memorizedVersesCount;
  memorizedCount = Math.min(existing.totalVersesCount, Math.max(0, memorizedCount));

  if (memorizedCount === existing.totalVersesCount && status === "not_started") {
    status = "memorized";
  } else if (memorizedCount > 0 && memorizedCount < existing.totalVersesCount) {
    status = "memorizing";
  }

  let reviewInterval = existing.reviewIntervalDays;
  let consecutive = existing.consecutivePasses;
  let lastReviewed = existing.lastReviewedAt;
  let nextReview = existing.nextReviewAt;

  if (updates.markReviewed) {
    lastReviewed = now.toISOString();
    if (updates.reviewPassed) {
      consecutive++;
      // Spaced repetition interval jumps: 1 -> 3 -> 7 -> 14 -> 30
      if (reviewInterval < 3) reviewInterval = 3;
      else if (reviewInterval < 7) reviewInterval = 7;
      else if (reviewInterval < 14) reviewInterval = 14;
      else reviewInterval = 30;

      if (consecutive >= 4 && status === "memorized") {
        status = "mastered";
      }
    } else {
      consecutive = 0;
      reviewInterval = 1; // Reset back to daily review on difficulty
    }

    const nextDate = new Date(now.getTime() + reviewInterval * 24 * 60 * 60 * 1000);
    nextReview = nextDate.toISOString();
  }

  const updatedEntry: SurahMemorizationEntry = {
    ...existing,
    status,
    memorizedVersesCount: memorizedCount,
    notes: updates.notes !== undefined ? updates.notes : existing.notes,
    lastReviewedAt: lastReviewed,
    nextReviewAt: nextReview,
    reviewIntervalDays: reviewInterval,
    consecutivePasses: consecutive,
  };

  const newState = {
    ...currentState,
    [surahId]: updatedEntry,
  };

  saveMemorizationState(newState);
  return newState;
}

/**
 * Calculates global statistics and completion percentage.
 */
export function getMemorizationOverview(
  state: Record<number, SurahMemorizationEntry>,
): MemorizationOverview {
  let memorizedSurahs = 0;
  let inProgressSurahs = 0;
  let totalVerses = 0;
  let dueReviews = 0;
  const now = new Date();

  for (const entry of Object.values(state)) {
    if (entry.status === "memorized" || entry.status === "mastered") {
      memorizedSurahs++;
    } else if (entry.status === "memorizing") {
      inProgressSurahs++;
    }
    totalVerses += entry.memorizedVersesCount;

    if (entry.nextReviewAt) {
      const reviewDate = new Date(entry.nextReviewAt);
      if (reviewDate <= now) {
        dueReviews++;
      }
    }
  }

  const percentage = Math.min(100, Math.round((totalVerses / TOTAL_QURAN_VERSES) * 1000) / 10);

  return {
    totalSurahsMemorized: memorizedSurahs,
    totalSurahsInProgress: inProgressSurahs,
    totalVersesMemorized: totalVerses,
    totalQuranVerses: TOTAL_QURAN_VERSES,
    overallPercentage: percentage,
    dueReviewsCount: dueReviews,
  };
}
