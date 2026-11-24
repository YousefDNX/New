/**
 * Private Local Storage Service for Islamic Learning Dashboard
 *
 * Sincerity & Privacy Rules:
 * - Stored locally per browser profile only; zero competitive worship leaderboards.
 * - Tracks study lessons completed, quiz mastery, personal reflections, and private daily worship check-ins.
 * - Never assigns religious merit points or estimates divine reward.
 */

export interface IslamicStudyDashboardState {
  completedTajweedLessonIds: string[];
  completedPathStepIds: string[];
  quizScores: Record<string, { score: number; total: number; completedAt: string }>;
  ramadanPrivateChecklistIds: string[];
  personalReflectionNotes: Array<{
    id: string;
    topicTitle: string;
    note: string;
    createdAt: string;
  }>;
  bookmarkedItemIds: string[];
}

const LEARNING_STORAGE_KEY = "btc_islamic_center_learning_v1";

const DEFAULT_LEARNING_STATE: IslamicStudyDashboardState = {
  completedTajweedLessonIds: [],
  completedPathStepIds: [],
  quizScores: {},
  ramadanPrivateChecklistIds: [],
  personalReflectionNotes: [],
  bookmarkedItemIds: [],
};

export function loadIslamicLearningState(): IslamicStudyDashboardState {
  if (typeof window === "undefined") {
    return { ...DEFAULT_LEARNING_STATE };
  }
  try {
    const raw = window.localStorage.getItem(LEARNING_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_LEARNING_STATE };
    const parsed = JSON.parse(raw) as Partial<IslamicStudyDashboardState>;
    return {
      completedTajweedLessonIds: Array.isArray(parsed.completedTajweedLessonIds)
        ? parsed.completedTajweedLessonIds
        : [],
      completedPathStepIds: Array.isArray(parsed.completedPathStepIds)
        ? parsed.completedPathStepIds
        : [],
      quizScores:
        parsed.quizScores && typeof parsed.quizScores === "object" ? parsed.quizScores : {},
      ramadanPrivateChecklistIds: Array.isArray(parsed.ramadanPrivateChecklistIds)
        ? parsed.ramadanPrivateChecklistIds
        : [],
      personalReflectionNotes: Array.isArray(parsed.personalReflectionNotes)
        ? parsed.personalReflectionNotes.slice(0, 40)
        : [],
      bookmarkedItemIds: Array.isArray(parsed.bookmarkedItemIds) ? parsed.bookmarkedItemIds : [],
    };
  } catch {
    return { ...DEFAULT_LEARNING_STATE };
  }
}

export function saveIslamicLearningState(state: IslamicStudyDashboardState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Non-fatal quota failure
  }
}

export function toggleStringInList(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}
