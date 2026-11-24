import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { OPEN_LEARNING_LIBRARY } from "@/data/open-learning-library";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import type { QuizAttemptRow, StudyItemRow } from "@/lib/firestore-data";
import {
  analyzeMisconceptions,
  detectLearningGaps,
  type DetectedMisconception,
  type LearningGapFinding,
} from "@/lib/learning-intelligence";

export interface PrerequisiteLessonRecommendation {
  nodeId: string;
  subject: string;
  topic: string;
  prerequisiteTitle: string;
  studyTip: string;
  whyConnected: string;
  matchedLibraryId: string | null;
  matchedLibraryTitle: string | null;
}

export interface LearningGapAnalysisReport {
  analyzedAt: string;
  sourceMode: "firestore_live" | "local_fallback";
  userId: string | null;
  stats: {
    quizAttemptsAnalyzed: number;
    studyItemsAnalyzed: number;
    openMistakesCount: number;
    overallQuizAccuracyPct: number | null;
  };
  weakTopics: Array<{
    subject: string;
    attempts: number;
    avgScorePct: number;
    reason: string;
  }>;
  mistakePatterns: DetectedMisconception[];
  detectedGaps: LearningGapFinding[];
  recommendedLessons: PrerequisiteLessonRecommendation[];
}

export class AnalysisService {
  /**
   * Queries user quiz_attempts and study_items directly from Firestore when authenticated,
   * detects knowledge gaps and mistake patterns, maps them to prerequisite lessons,
   * and returns a structured JSON report.
   */
  async analyzeLearningGaps(params: {
    userId?: string | null;
    masteredNodeIds: string[];
    resolvedGapIds?: string[];
    englishWeakSkill?: string | null;
    fallbackStudyItems?: StudyItemRow[];
    fallbackQuizAttempts?: QuizAttemptRow[];
  }): Promise<LearningGapAnalysisReport> {
    let studyItems: StudyItemRow[] = params.fallbackStudyItems ?? [];
    let quizAttempts: QuizAttemptRow[] = params.fallbackQuizAttempts ?? [];
    let sourceMode: "firestore_live" | "local_fallback" = "local_fallback";

    if (params.userId && db) {
      try {
        const [quizSnap, studySnap] = await Promise.all([
          getDocs(
            query(
              collection(db, "quiz_attempts"),
              where("user_id", "==", params.userId),
              limit(60),
            ),
          ),
          getDocs(
            query(collection(db, "study_items"), where("user_id", "==", params.userId), limit(120)),
          ),
        ]);

        quizAttempts = quizSnap.docs.map((d) => d.data() as QuizAttemptRow);
        studyItems = studySnap.docs.map((d) => d.data() as StudyItemRow);
        sourceMode = "firestore_live";
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.LIST, "quiz_attempts");
        } catch {
          /* preserve fallback state if offline or permission issue */
        }
      }
    }

    // Aggregate quiz accuracy by subject
    const subjectBuckets = new Map<string, { scores: number[]; wrongCount: number }>();
    for (const qa of quizAttempts) {
      const pct =
        typeof qa.score_pct === "number"
          ? qa.score_pct
          : qa.total_questions > 0
            ? Math.round((qa.correct_count / qa.total_questions) * 100)
            : 0;
      const cur = subjectBuckets.get(qa.subject) ?? { scores: [], wrongCount: 0 };
      cur.scores.push(pct);
      cur.wrongCount += (qa.wrong_item_ids ?? []).length;
      subjectBuckets.set(qa.subject, cur);
    }

    const weakTopics = Array.from(subjectBuckets.entries())
      .map(([subject, data]) => {
        const avgScorePct = Math.round(
          data.scores.reduce((s, v) => s + v, 0) / Math.max(1, data.scores.length),
        );
        return {
          subject,
          attempts: data.scores.length,
          avgScorePct,
          reason:
            avgScorePct < 75
              ? `Average ${avgScorePct}% across ${data.scores.length} attempt(s); ${data.wrongCount} missed item(s).`
              : `Consistent ${avgScorePct}% baseline; check fine-grained mistakes.`,
        };
      })
      .filter((t) => t.avgScorePct < 80);

    const examWeakTopics = weakTopics.map((w) => w.subject);

    const mistakePatterns = analyzeMisconceptions({
      studyItems,
      quizAttempts,
      examWeakTopics,
    });

    const gapResult = detectLearningGaps({
      studyItems,
      quizAttempts,
      masteredNodeIds: params.masteredNodeIds,
      ...(params.resolvedGapIds ? { resolvedGapIds: params.resolvedGapIds } : {}),
      ...(params.englishWeakSkill !== undefined
        ? { englishWeakSkill: params.englishWeakSkill }
        : {}),
    });

    const recommendedLessons: PrerequisiteLessonRecommendation[] = [];
    for (const gap of gapResult.gaps) {
      for (const prereq of gap.missingPrerequisites) {
        const libMatch = OPEN_LEARNING_LIBRARY.find(
          (res) =>
            res.subject.toLowerCase().includes(prereq.subject.toLowerCase()) ||
            res.topic.toLowerCase().includes(prereq.title.toLowerCase().split(" ")[0] ?? ""),
        );
        recommendedLessons.push({
          nodeId: prereq.id,
          subject: prereq.subject,
          topic: gap.targetTopic,
          prerequisiteTitle: prereq.title,
          studyTip: prereq.studyTip,
          whyConnected: prereq.whyConnected ?? "",
          matchedLibraryId: libMatch?.id ?? null,
          matchedLibraryTitle: libMatch?.title ?? null,
        });
      }
    }

    const overallQuizAccuracyPct =
      quizAttempts.length > 0
        ? Math.round(
            quizAttempts.reduce(
              (acc, q) =>
                acc +
                (typeof q.score_pct === "number"
                  ? q.score_pct
                  : q.total_questions > 0
                    ? (q.correct_count / q.total_questions) * 100
                    : 0),
              0,
            ) / quizAttempts.length,
          )
        : null;

    const openMistakesCount = studyItems.filter(
      (s) => s.kind === "mistake" && s.mistake_status !== "mastered",
    ).length;

    return {
      analyzedAt: new Date().toISOString(),
      sourceMode,
      userId: params.userId ?? null,
      stats: {
        quizAttemptsAnalyzed: quizAttempts.length,
        studyItemsAnalyzed: studyItems.length,
        openMistakesCount,
        overallQuizAccuracyPct,
      },
      weakTopics,
      mistakePatterns,
      detectedGaps: gapResult.gaps,
      recommendedLessons,
    };
  }
}

export const analysisService = new AnalysisService();
