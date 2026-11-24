import { collection, doc, getDocs, limit, query, setDoc, where } from "firebase/firestore";
import { awardXpIfUnique } from "@/hooks/use-nexora";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { generateSafeDocId, type ExamQuestionRow } from "@/lib/firestore-data";
import {
  buildExamSimulation,
  EXAM_QUESTION_BANK,
  type ExamSimulationConfig,
  type ExamSimulationQuestion,
} from "@/lib/learning-intelligence";
import { buildEventDocId, computeQuizXp } from "@/lib/xp-rules";

function rowToSimulationQuestion(row: ExamQuestionRow): ExamSimulationQuestion {
  return {
    id: row.id,
    subject: row.subject,
    topic: row.topic,
    difficulty: row.difficulty,
    format: row.format,
    prompt: row.prompt,
    ...(row.options ? { options: row.options } : {}),
    ...(typeof row.correct_index === "number" ? { correctIndex: row.correct_index } : {}),
    ...(row.accepted_keywords ? { acceptedKeywords: row.accepted_keywords } : {}),
    modelAnswer: row.model_answer,
    explanation: row.explanation,
  };
}

function simulationQuestionToRow(q: ExamSimulationQuestion): ExamQuestionRow {
  return {
    id: q.id,
    subject: q.subject,
    topic: q.topic,
    difficulty: q.difficulty,
    format: q.format,
    prompt: q.prompt,
    ...(q.options ? { options: q.options } : {}),
    ...(typeof q.correctIndex === "number" ? { correct_index: q.correctIndex } : {}),
    ...(q.acceptedKeywords ? { accepted_keywords: q.acceptedKeywords } : {}),
    model_answer: q.modelAnswer,
    explanation: q.explanation,
    created_at: new Date().toISOString(),
  };
}

export async function ensureExamQuestionsSeededInFirestore(userId?: string | null): Promise<void> {
  if (!db || !userId) return;
  try {
    const existing = await getDocs(query(collection(db, "exam_questions"), limit(1)));
    if (!existing.empty) return;
    for (const q of EXAM_QUESTION_BANK) {
      const safeId = q.id.replace(/[^a-zA-Z0-9_-]/g, "_");
      await setDoc(
        doc(db, "exam_questions", safeId),
        simulationQuestionToRow({ ...q, id: safeId }),
      );
    }
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, "exam_questions");
    } catch {
      /* fallback cleanly if offline */
    }
  }
}

export async function queryExamQuestionsFromFirestore(params: {
  userId?: string | null;
  config: ExamSimulationConfig;
}): Promise<{
  questions: ExamSimulationQuestion[];
  sourceMode: "firestore_query" | "local_fallback";
}> {
  const { userId, config } = params;

  if (db && userId) {
    try {
      await ensureExamQuestionsSeededInFirestore(userId);

      // Query by single equality field to avoid requiring composite Firestore indexes
      const constraints =
        config.topic.trim() && config.topic.trim().toLowerCase() !== "all topics"
          ? [where("topic", "==", config.topic.trim()), limit(30)]
          : [where("difficulty", "==", config.difficulty), limit(30)];

      const snap = await getDocs(query(collection(db, "exam_questions"), ...constraints));
      const queried = snap.docs.map((d) => rowToSimulationQuestion(d.data() as ExamQuestionRow));

      const filtered = queried.filter((q) => {
        const subjMatch = config.subject === "Mixed STEM & English" || q.subject === config.subject;
        const topicMatch =
          !config.topic.trim() ||
          config.topic.trim().toLowerCase() === "all topics" ||
          q.topic.toLowerCase().includes(config.topic.trim().toLowerCase());
        const diffMatch = q.difficulty === config.difficulty || queried.length < 3;
        return subjMatch && topicMatch && diffMatch;
      });

      const pool = filtered.length >= 2 ? filtered : queried;
      if (pool.length > 0) {
        const selected: ExamSimulationQuestion[] = [];
        for (let i = 0; i < config.questionCount; i++) {
          const src = pool[i % pool.length]!;
          selected.push({
            ...src,
            id: `${src.id}_inst_${i}`,
          });
        }
        return { questions: selected, sourceMode: "firestore_query" };
      }
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.LIST, "exam_questions");
      } catch {
        /* fallback cleanly to local bank */
      }
    }
  }

  return {
    questions: buildExamSimulation(config),
    sourceMode: "local_fallback",
  };
}

export async function recordExamSimulationCompletion(params: {
  userId?: string | null;
  config: ExamSimulationConfig;
  correctCount: number;
  total: number;
  scorePct: number;
  wrongItemIds: string[];
  recordQuizAttempt: (input: {
    subject: string;
    totalQuestions: number;
    correctCount: number;
    wrongItemIds: string[];
  }) => Promise<unknown>;
}): Promise<{
  activityLogEventId: string;
  loggedToFirestore: boolean;
  xpEarned: number;
}> {
  const xpEarned = computeQuizXp(params.scorePct);
  const simRefId = generateSafeDocId("exam_sim");

  if (!params.userId) {
    return {
      activityLogEventId: simRefId,
      loggedToFirestore: false,
      xpEarned,
    };
  }

  let loggedToFirestore = false;
  try {
    await params.recordQuizAttempt({
      subject: `Exam Sim: ${params.config.subject}`,
      totalQuestions: params.total,
      correctCount: params.correctCount,
      wrongItemIds: params.wrongItemIds,
    });

    const nowIso = new Date().toISOString();
    await awardXpIfUnique({
      userId: params.userId,
      eventDocId: buildEventDocId(params.userId, "EXAM_SIMULATION_COMPLETED", simRefId),
      eventType: "EXAM_SIMULATION_COMPLETED",
      area: "academic",
      refId: simRefId,
      xpReward: xpEarned,
      nowIso,
    });
    loggedToFirestore = true;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, "activity_events");
    } catch {
      /* handled cleanly */
    }
  }

  return {
    activityLogEventId: simRefId,
    loggedToFirestore,
    xpEarned,
  };
}
