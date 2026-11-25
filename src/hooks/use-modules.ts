import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import {
  clampString,
  generateInviteCode,
  generateSafeDocId,
  sanitizeHttpUrl,
  resolveCommunityGroup,
  type AiChatMessage,
  type AiConversationRow,
  type CareEntryRow,
  type CareMood,
  type CircleInviteRow,
  type CircleMemberRow,
  type CirclePostRow,
  type CircleTeamRow,
  type CommunityCommentRow,
  type CommunityGroup,
  type CommunityPostCategory,
  type CommunityPostRow,
  type CommunityReactionRow,
  type CommunityReactionType,
  type FocusSessionRow,
  type FutureMilestoneItem,
  type FuturePlanRow,
  type GrowthArea,
  type JournalEntryRow,
  type JournalMood,
  type MistakeStatus,
  type ModerationReportRow,
  type OpportunityCategory,
  type OpportunityRow,
  type ProfileRow,
  type QuizAttemptRow,
  type SavedPostRow,
  type StudyItemRow,
  type StudyTopicStatus,
  type TimeBlockRow,
} from "@/lib/firestore-data";
import {
  computeNextReviewIso,
  computeSm2RatedReviewIso,
  isMistakeMastered,
  type Sm2Rating,
} from "@/lib/recommendations";
import { XP_RULES, buildEventDocId, computeQuizXp } from "@/lib/xp-rules";
import { awardXpIfUnique, requireEligibleUid } from "./use-nexora";

/* ─────────────────────────── STUDY & QUIZZES ─────────────────────────── */

export function useStudyItems() {
  return useQuery({
    queryKey: ["study_items"],
    queryFn: async (): Promise<StudyItemRow[]> => {
      const userId = await requireEligibleUid();
      if (!userId) return [];
      try {
        const snap = await getDocs(
          query(collection(db, "study_items"), where("user_id", "==", userId)),
        );
        return snap.docs
          .map((d) => d.data() as StudyItemRow)
          .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "study_items");
      }
    },
  });
}

export function useQuizAttempts() {
  return useQuery({
    queryKey: ["quiz_attempts"],
    queryFn: async (): Promise<QuizAttemptRow[]> => {
      const userId = await requireEligibleUid();
      if (!userId) return [];
      try {
        const snap = await getDocs(
          query(collection(db, "quiz_attempts"), where("user_id", "==", userId)),
        );
        return snap.docs
          .map((d) => d.data() as QuizAttemptRow)
          .sort((a, b) => b.created_at.localeCompare(a.created_at));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "quiz_attempts");
      }
    },
  });
}

export function useStudyActions() {
  const qc = useQueryClient();

  const addStudyItem = async (payload: {
    kind: "note" | "flashcard" | "mistake";
    subject: string;
    topic?: string | null;
    deck?: string | null;
    title: string;
    content: string;
    simplified_content?: string | null;
    answer?: string | null;
    difficulty?: "easy" | "medium" | "hard";
    study_status?: StudyTopicStatus;
    mistake_reason?: string | null;
    mistake_status?: MistakeStatus;
  }) => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("Sign in required.");
    const subject = clampString(payload.subject, 60) ?? "General";
    const title = clampString(payload.title, 160);
    if (!title) throw new Error("Title is required.");

    const now = new Date().toISOString();
    const id = generateSafeDocId("study");
    const row: StudyItemRow = {
      id,
      user_id: userId,
      kind: payload.kind,
      subject,
      ...(payload.topic ? { topic: clampString(payload.topic, 80) } : {}),
      deck: clampString(payload.deck, 60),
      title,
      content: clampString(payload.content, 4000) ?? "",
      ...(payload.simplified_content
        ? { simplified_content: clampString(payload.simplified_content, 4000) }
        : {}),
      answer: clampString(payload.answer, 2000),
      difficulty: payload.difficulty ?? "medium",
      ...(payload.study_status ? { study_status: payload.study_status } : {}),
      mistake_reason: clampString(payload.mistake_reason, 500),
      mistake_status: payload.mistake_status ?? (payload.kind === "mistake" ? "recorded" : "open"),
      review_count: 0,
      next_review_at: payload.kind === "flashcard" ? now : null,
      created_at: now,
      updated_at: now,
    };

    try {
      await setDoc(doc(db, "study_items", id), row);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `study_items/${id}`);
    }

    if (payload.kind === "note") {
      await awardXpIfUnique({
        userId,
        eventDocId: buildEventDocId(userId, "NOTE_CREATED", id),
        eventType: "NOTE_CREATED",
        area: "academic",
        xpReward: XP_RULES.NOTE_CREATED,
        refId: id,
        nowIso: now,
      });
    }

    await Promise.all([
      qc.invalidateQueries({ queryKey: ["study_items"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
      qc.invalidateQueries({ queryKey: ["activity_events"] }),
    ]);
    return row;
  };

  const reviewFlashcard = async (
    item: StudyItemRow,
    knewIt: boolean,
    style: "recall" | "spaced" | "cloze",
    rating?: Sm2Rating,
  ) => {
    const userId = await requireEligibleUid();
    if (!userId || userId !== item.user_id) return;
    const now = new Date().toISOString();
    const todayIso = now.slice(0, 10);
    const effectiveKnew = rating ? rating !== "again" : knewIt;
    const nextCount = effectiveKnew ? (item.review_count || 0) + 1 : 0;
    const nextReview = rating
      ? computeSm2RatedReviewIso({
          reviewCount: item.review_count || 0,
          rating,
          style,
        })
      : computeNextReviewIso({ reviewCount: nextCount, knewIt: effectiveKnew, style });

    try {
      await updateDoc(doc(db, "study_items", item.id), {
        review_count: nextCount,
        next_review_at: nextReview,
        updated_at: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `study_items/${item.id}`);
    }

    if (effectiveKnew) {
      await awardXpIfUnique({
        userId,
        eventDocId: buildEventDocId(userId, "FLASHCARD_REVIEWED", item.id, todayIso),
        eventType: "FLASHCARD_REVIEWED",
        area: "academic",
        xpReward: XP_RULES.FLASHCARD_REVIEWED,
        refId: item.id,
        nowIso: now,
      });
    }

    await Promise.all([
      qc.invalidateQueries({ queryKey: ["study_items"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
      qc.invalidateQueries({ queryKey: ["activity_events"] }),
    ]);
  };

  const updateStudyItem = async (
    item: StudyItemRow,
    patch: {
      subject?: string;
      topic?: string | null;
      deck?: string | null;
      title?: string;
      content?: string;
      simplified_content?: string | null;
      answer?: string | null;
      difficulty?: "easy" | "medium" | "hard";
      study_status?: StudyTopicStatus;
    },
  ) => {
    const userId = await requireEligibleUid();
    if (!userId || userId !== item.user_id) return;
    const nextTitle = clampString(patch.title ?? item.title, 160);
    if (!nextTitle) throw new Error("Title is required.");
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {
      subject: clampString(patch.subject ?? item.subject, 60) ?? "General",
      deck: patch.deck !== undefined ? clampString(patch.deck, 60) : item.deck,
      title: nextTitle,
      content: clampString(patch.content ?? item.content, 4000) ?? "",
      answer: patch.answer !== undefined ? clampString(patch.answer, 2000) : item.answer,
      difficulty: patch.difficulty ?? item.difficulty,
      updated_at: now,
    };
    if (patch.topic !== undefined) updates["topic"] = clampString(patch.topic, 80);
    if (patch.simplified_content !== undefined) {
      updates["simplified_content"] = clampString(patch.simplified_content, 4000);
    }
    if (patch.study_status !== undefined) updates["study_status"] = patch.study_status;

    try {
      await updateDoc(doc(db, "study_items", item.id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `study_items/${item.id}`);
    }

    if (
      patch.study_status &&
      (patch.study_status === "comfortable" || patch.study_status === "completed") &&
      item.study_status !== "comfortable" &&
      item.study_status !== "completed"
    ) {
      await awardXpIfUnique({
        userId,
        eventDocId: buildEventDocId(userId, "TOPIC_MASTERED", item.id),
        eventType: "TOPIC_MASTERED",
        area: "academic",
        xpReward: XP_RULES.TOPIC_MASTERED,
        refId: item.id,
        nowIso: now,
      });
    }

    await Promise.all([
      qc.invalidateQueries({ queryKey: ["study_items"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
      qc.invalidateQueries({ queryKey: ["activity_events"] }),
    ]);
  };

  const updateMistakeStatus = async (item: StudyItemRow, nextStatus: MistakeStatus) => {
    const userId = await requireEligibleUid();
    if (!userId || userId !== item.user_id) return;
    const now = new Date().toISOString();

    try {
      await updateDoc(doc(db, "study_items", item.id), {
        mistake_status: nextStatus,
        review_count: (item.review_count || 0) + 1,
        updated_at: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `study_items/${item.id}`);
    }

    if (isMistakeMastered(nextStatus)) {
      await awardXpIfUnique({
        userId,
        eventDocId: buildEventDocId(userId, "MISTAKE_REVIEWED", item.id),
        eventType: "MISTAKE_REVIEWED",
        area: "growth",
        xpReward: XP_RULES.MISTAKE_REVIEWED,
        refId: item.id,
        nowIso: now,
      });
    }

    await Promise.all([
      qc.invalidateQueries({ queryKey: ["study_items"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
      qc.invalidateQueries({ queryKey: ["activity_events"] }),
    ]);
  };

  const deleteStudyItem = async (id: string) => {
    const userId = await requireEligibleUid();
    if (!userId) return;
    try {
      await deleteDoc(doc(db, "study_items", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `study_items/${id}`);
    }
    await qc.invalidateQueries({ queryKey: ["study_items"] });
  };

  const recordQuizAttempt = async (payload: {
    subject: string;
    totalQuestions: number;
    correctCount: number;
    wrongItemIds: string[];
  }) => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("Sign in required.");
    const now = new Date().toISOString();
    const id = generateSafeDocId("quiz");
    const scorePct = Math.round((payload.correctCount / Math.max(payload.totalQuestions, 1)) * 100);

    const row: QuizAttemptRow = {
      id,
      user_id: userId,
      subject: clampString(payload.subject, 60) ?? "General",
      total_questions: Math.min(Math.max(payload.totalQuestions, 1), 100),
      correct_count: Math.min(Math.max(payload.correctCount, 0), 100),
      score_pct: Math.min(Math.max(scorePct, 0), 100),
      wrong_item_ids: payload.wrongItemIds.slice(0, 50),
      created_at: now,
    };

    try {
      await setDoc(doc(db, "quiz_attempts", id), row);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `quiz_attempts/${id}`);
    }

    await awardXpIfUnique({
      userId,
      eventDocId: buildEventDocId(userId, "QUIZ_COMPLETED", id),
      eventType: "QUIZ_COMPLETED",
      area: "academic",
      xpReward: computeQuizXp(scorePct),
      refId: id,
      nowIso: now,
    });

    await Promise.all([
      qc.invalidateQueries({ queryKey: ["quiz_attempts"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
      qc.invalidateQueries({ queryKey: ["activity_events"] }),
    ]);
    return row;
  };

  return {
    addStudyItem,
    updateStudyItem,
    reviewFlashcard,
    updateMistakeStatus,
    deleteStudyItem,
    recordQuizAttempt,
  };
}

/* ─────────────────────────── FOCUS SESSIONS ─────────────────────────── */

export function useFocusSessions() {
  return useQuery({
    queryKey: ["focus_sessions"],
    queryFn: async (): Promise<FocusSessionRow[]> => {
      const userId = await requireEligibleUid();
      if (!userId) return [];
      try {
        const snap = await getDocs(
          query(collection(db, "focus_sessions"), where("user_id", "==", userId)),
        );
        return snap.docs
          .map((d) => d.data() as FocusSessionRow)
          .sort((a, b) => b.created_at.localeCompare(a.created_at));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "focus_sessions");
      }
    },
  });
}

export function useFocusActions() {
  const qc = useQueryClient();

  const logFocusSession = async (payload: {
    title: string;
    area?: GrowthArea;
    subject?: string | null;
    durationMinutes: number;
    createdAtIso?: string;
  }) => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("Sign in required.");
    const now = new Date().toISOString();
    let createdAtIso = now;
    if (payload.createdAtIso) {
      const parsedMs = Date.parse(payload.createdAtIso);
      if (!Number.isNaN(parsedMs)) {
        createdAtIso = new Date(parsedMs).toISOString().slice(0, 40);
      }
    }
    const id = generateSafeDocId("focus");
    const duration = Math.min(Math.max(Math.round(payload.durationMinutes), 1), 1440);

    const row: FocusSessionRow = {
      id,
      user_id: userId,
      title: clampString(payload.title, 160) ?? "Focus sprint",
      area: payload.area ?? "productivity",
      subject: clampString(payload.subject, 60),
      duration_minutes: duration,
      completed: true,
      created_at: createdAtIso,
    };

    try {
      await setDoc(doc(db, "focus_sessions", id), row);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `focus_sessions/${id}`);
    }

    await awardXpIfUnique({
      userId,
      eventDocId: buildEventDocId(userId, "STUDY_SESSION_COMPLETED", id),
      eventType: "STUDY_SESSION_COMPLETED",
      area: row.area,
      xpReward: XP_RULES.STUDY_SESSION_COMPLETED,
      refId: id,
      nowIso: now,
    });

    await Promise.all([
      qc.invalidateQueries({ queryKey: ["focus_sessions"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
      qc.invalidateQueries({ queryKey: ["activity_events"] }),
    ]);
    return row;
  };

  return { logFocusSession };
}

/* ─────────────────────────── CARE (PRIVATE WELLBEING) ─────────────────────────── */

export function useCareEntries() {
  return useQuery({
    queryKey: ["care_entries"],
    queryFn: async (): Promise<CareEntryRow[]> => {
      const userId = await requireEligibleUid();
      if (!userId) return [];
      try {
        const snap = await getDocs(
          query(collection(db, "care_entries"), where("user_id", "==", userId)),
        );
        return snap.docs
          .map((d) => d.data() as CareEntryRow)
          .sort((a, b) => b.created_at.localeCompare(a.created_at));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "care_entries");
      }
    },
  });
}

export function useCareActions() {
  const qc = useQueryClient();

  const addCareEntry = async (payload: {
    mood: CareMood;
    energy: number;
    stressLevel: number;
    sleepHours?: number | null;
    prompt?: string | null;
    note?: string | null;
  }) => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("Sign in required.");
    const now = new Date().toISOString();
    const todayIso = now.slice(0, 10);
    const id = generateSafeDocId("care");

    const row: CareEntryRow = {
      id,
      user_id: userId,
      mood: payload.mood,
      energy: Math.min(Math.max(Math.round(payload.energy), 1), 5),
      stress_level: Math.min(Math.max(Math.round(payload.stressLevel), 1), 5),
      sleep_hours:
        typeof payload.sleepHours === "number" && !Number.isNaN(payload.sleepHours)
          ? Math.min(Math.max(payload.sleepHours, 0), 24)
          : null,
      prompt: clampString(payload.prompt, 200),
      note: clampString(payload.note, 2000),
      created_at: now,
    };

    try {
      await setDoc(doc(db, "care_entries", id), row);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `care_entries/${id}`);
    }

    // Gentle max-1-per-day wellbeing activity marker (no streak pressure)
    await awardXpIfUnique({
      userId,
      eventDocId: buildEventDocId(userId, "streak_maintained", todayIso),
      eventType: "streak_maintained",
      area: "wellbeing",
      xpReward: 15,
      refId: id,
      nowIso: now,
    });

    await Promise.all([
      qc.invalidateQueries({ queryKey: ["care_entries"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
      qc.invalidateQueries({ queryKey: ["activity_events"] }),
    ]);
    return row;
  };

  const deleteCareEntry = async (id: string) => {
    const userId = await requireEligibleUid();
    if (!userId) return;
    try {
      await deleteDoc(doc(db, "care_entries", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `care_entries/${id}`);
    }
    await qc.invalidateQueries({ queryKey: ["care_entries"] });
  };

  return { addCareEntry, deleteCareEntry };
}

/* ─────────────────────────── FUTURE PLANS ─────────────────────────── */

export function useFuturePlans() {
  return useQuery({
    queryKey: ["future_plans"],
    queryFn: async (): Promise<FuturePlanRow[]> => {
      const userId = await requireEligibleUid();
      if (!userId) return [];
      try {
        const snap = await getDocs(
          query(collection(db, "future_plans"), where("user_id", "==", userId)),
        );
        return snap.docs
          .map((d) => d.data() as FuturePlanRow)
          .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "future_plans");
      }
    },
  });
}

export function useFutureActions() {
  const qc = useQueryClient();

  const saveFuturePlan = async (payload: {
    pathway_id: string;
    title: string;
    interests: string[];
    strengths: string[];
    milestones: FutureMilestoneItem[];
    notes?: string | null;
  }) => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("Sign in required.");
    const now = new Date().toISOString();
    const id = generateSafeDocId("plan");
    const row: FuturePlanRow = {
      id,
      user_id: userId,
      pathway_id: payload.pathway_id.slice(0, 80),
      title: clampString(payload.title, 160) ?? "Pathway Plan",
      interests: payload.interests.slice(0, 10).map((s) => s.slice(0, 48)),
      strengths: payload.strengths.slice(0, 10).map((s) => s.slice(0, 48)),
      milestones: payload.milestones.slice(0, 12),
      notes: clampString(payload.notes, 2000),
      status: "exploring",
      created_at: now,
      updated_at: now,
    };

    try {
      await setDoc(doc(db, "future_plans", id), row);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `future_plans/${id}`);
    }

    await awardXpIfUnique({
      userId,
      eventDocId: buildEventDocId(userId, "CAREER_PATHWAY_EXPLORED", payload.pathway_id),
      eventType: "CAREER_PATHWAY_EXPLORED",
      area: "career",
      xpReward: XP_RULES.CAREER_PATHWAY_EXPLORED,
      refId: id,
      nowIso: now,
    });

    await Promise.all([
      qc.invalidateQueries({ queryKey: ["future_plans"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
      qc.invalidateQueries({ queryKey: ["activity_events"] }),
    ]);
    return row;
  };

  const updateFuturePlan = async (
    plan: FuturePlanRow,
    patch: Partial<Pick<FuturePlanRow, "status" | "milestones" | "notes">>,
  ) => {
    const userId = await requireEligibleUid();
    if (!userId || userId !== plan.user_id) return;
    const now = new Date().toISOString();
    const prevDoneIds = new Set(plan.milestones.filter((m) => m.done).map((m) => m.id));
    try {
      await updateDoc(doc(db, "future_plans", plan.id), {
        ...patch,
        updated_at: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `future_plans/${plan.id}`);
    }
    const newlyDone = patch.milestones?.find((m) => m.done && !prevDoneIds.has(m.id));
    if (newlyDone) {
      await awardXpIfUnique({
        userId,
        eventDocId: buildEventDocId(userId, "MILESTONE_COMPLETED", `${plan.id}_${newlyDone.id}`),
        eventType: "MILESTONE_COMPLETED",
        area: "career",
        xpReward: XP_RULES.MILESTONE_COMPLETED,
        refId: plan.id,
        nowIso: now,
      });
    }
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["future_plans"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
      qc.invalidateQueries({ queryKey: ["activity_events"] }),
    ]);
  };

  const deleteFuturePlan = async (id: string) => {
    const userId = await requireEligibleUid();
    if (!userId) return;
    try {
      await deleteDoc(doc(db, "future_plans", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `future_plans/${id}`);
    }
    await qc.invalidateQueries({ queryKey: ["future_plans"] });
  };

  return { saveFuturePlan, updateFuturePlan, deleteFuturePlan };
}

/* ─────────────────────────── OPPORTUNITIES ─────────────────────────── */

export function useOpportunities() {
  return useQuery({
    queryKey: ["opportunities"],
    queryFn: async (): Promise<OpportunityRow[]> => {
      const userId = await requireEligibleUid();
      if (!userId) return [];
      try {
        const snap = await getDocs(
          query(collection(db, "opportunities"), where("user_id", "==", userId)),
        );
        return snap.docs
          .map((d) => d.data() as OpportunityRow)
          .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "opportunities");
      }
    },
  });
}

export function useOpportunityActions() {
  const qc = useQueryClient();

  const saveOpportunity = async (payload: {
    title: string;
    organizer: string;
    category: OpportunityCategory;
    region_scope: "kuwait" | "gcc" | "global";
    eligibility?: string | null;
    deadline?: string | null;
    cost?: string | null;
    url?: string | null;
    source?: string | null;
    source_kind: "manual" | "reference_catalog";
    last_verified_at?: string | null;
    linked_plan_id?: string | null;
  }) => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("Sign in required.");
    const now = new Date().toISOString();
    const id = generateSafeDocId("opp");

    const row: OpportunityRow = {
      id,
      user_id: userId,
      title: clampString(payload.title, 200) ?? "Opportunity",
      organizer: clampString(payload.organizer, 120) ?? "Organizer",
      category: payload.category,
      region_scope: payload.region_scope,
      eligibility: clampString(payload.eligibility, 300),
      deadline: clampString(payload.deadline, 40),
      cost: clampString(payload.cost, 120),
      url: sanitizeHttpUrl(payload.url, 512),
      source: clampString(payload.source, 200),
      source_kind: payload.source_kind,
      last_verified_at: clampString(payload.last_verified_at, 40),
      status: "saved",
      notes: null,
      ...(payload.linked_plan_id
        ? { linked_plan_id: clampString(payload.linked_plan_id, 128) }
        : {}),
      created_at: now,
      updated_at: now,
    };

    try {
      await setDoc(doc(db, "opportunities", id), row);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `opportunities/${id}`);
    }

    await awardXpIfUnique({
      userId,
      eventDocId: buildEventDocId(userId, "CAREER_PATHWAY_EXPLORED", id),
      eventType: "CAREER_PATHWAY_EXPLORED",
      area: "career",
      xpReward: XP_RULES.CAREER_PATHWAY_EXPLORED,
      refId: id,
      nowIso: now,
    });

    await Promise.all([
      qc.invalidateQueries({ queryKey: ["opportunities"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
      qc.invalidateQueries({ queryKey: ["activity_events"] }),
    ]);
    return row;
  };

  const updateOpportunityStatus = async (
    opp: OpportunityRow,
    status: "saved" | "applied" | "archived",
  ) => {
    const userId = await requireEligibleUid();
    if (!userId || userId !== opp.user_id) return;
    try {
      await updateDoc(doc(db, "opportunities", opp.id), {
        status,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `opportunities/${opp.id}`);
    }
    await qc.invalidateQueries({ queryKey: ["opportunities"] });
  };

  const updateOpportunityNotes = async (opp: OpportunityRow, notes: string | null) => {
    const userId = await requireEligibleUid();
    if (!userId || userId !== opp.user_id) return;
    try {
      await updateDoc(doc(db, "opportunities", opp.id), {
        notes: clampString(notes, 1000),
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `opportunities/${opp.id}`);
    }
    await qc.invalidateQueries({ queryKey: ["opportunities"] });
  };

  const linkOpportunityToPlan = async (opp: OpportunityRow, planId: string | null) => {
    const userId = await requireEligibleUid();
    if (!userId || userId !== opp.user_id) return;
    try {
      await updateDoc(doc(db, "opportunities", opp.id), {
        linked_plan_id: clampString(planId, 128),
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `opportunities/${opp.id}`);
    }
    await qc.invalidateQueries({ queryKey: ["opportunities"] });
  };

  const deleteOpportunity = async (id: string) => {
    const userId = await requireEligibleUid();
    if (!userId) return;
    try {
      await deleteDoc(doc(db, "opportunities", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `opportunities/${id}`);
    }
    await qc.invalidateQueries({ queryKey: ["opportunities"] });
  };

  return {
    saveOpportunity,
    updateOpportunityStatus,
    updateOpportunityNotes,
    linkOpportunityToPlan,
    deleteOpportunity,
  };
}

/* ─────────────────────────── AI CONVERSATIONS ─────────────────────────── */

export function useAiConversations() {
  return useQuery({
    queryKey: ["ai_conversations"],
    queryFn: async (): Promise<AiConversationRow[]> => {
      const userId = await requireEligibleUid();
      if (!userId) return [];
      try {
        const snap = await getDocs(
          query(collection(db, "ai_conversations"), where("user_id", "==", userId)),
        );
        return snap.docs
          .map((d) => d.data() as AiConversationRow)
          .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "ai_conversations");
      }
    },
  });
}

export function useAiConversationActions() {
  const qc = useQueryClient();

  const saveConversation = async (conv: {
    id?: string;
    title: string;
    subject?: string | null;
    messages: AiChatMessage[];
  }): Promise<AiConversationRow> => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("Sign in required.");
    const now = new Date().toISOString();
    const id = conv.id ?? generateSafeDocId("ai");
    const messages = conv.messages.slice(-60).map((m) => ({
      id: m.id.slice(0, 64),
      role: m.role,
      content: m.content.slice(0, 6000),
      created_at: m.created_at.slice(0, 40),
    }));

    let existingSnap = null;
    if (conv.id) {
      try {
        existingSnap = await getDoc(doc(db, "ai_conversations", conv.id));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `ai_conversations/${conv.id}`);
      }
    }
    if (existingSnap?.exists()) {
      try {
        await updateDoc(doc(db, "ai_conversations", id), {
          title: clampString(conv.title, 160) ?? "Study Session",
          subject: clampString(conv.subject, 60),
          messages,
          updated_at: now,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `ai_conversations/${id}`);
      }
      await qc.invalidateQueries({ queryKey: ["ai_conversations"] });
      return {
        ...(existingSnap.data() as AiConversationRow),
        title: clampString(conv.title, 160) ?? "Study Session",
        subject: clampString(conv.subject, 60),
        messages,
        updated_at: now,
      };
    }

    const row: AiConversationRow = {
      id,
      user_id: userId,
      title: clampString(conv.title, 160) ?? "Study Session",
      subject: clampString(conv.subject, 60),
      messages,
      created_at: now,
      updated_at: now,
    };
    try {
      await setDoc(doc(db, "ai_conversations", id), row);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `ai_conversations/${id}`);
    }
    await qc.invalidateQueries({ queryKey: ["ai_conversations"] });
    return row;
  };

  const renameConversation = async (id: string, title: string) => {
    const userId = await requireEligibleUid();
    if (!userId) return;
    const clean = clampString(title, 160);
    if (!clean) return;
    try {
      await updateDoc(doc(db, "ai_conversations", id), {
        title: clean,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `ai_conversations/${id}`);
    }
    await qc.invalidateQueries({ queryKey: ["ai_conversations"] });
  };

  const deleteConversation = async (id: string) => {
    const userId = await requireEligibleUid();
    if (!userId) return;
    try {
      await deleteDoc(doc(db, "ai_conversations", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `ai_conversations/${id}`);
    }
    await qc.invalidateQueries({ queryKey: ["ai_conversations"] });
  };

  return { saveConversation, renameConversation, deleteConversation };
}

/* ─────────────────────────── KNOWLEDGE CIRCLE & MODERATION ─────────────────────────── */

export async function resolveUserCommunityGroupFromProfile(
  userId: string,
): Promise<CommunityGroup | null> {
  try {
    const snap = await getDoc(doc(db, "profiles", userId));
    if (snap.exists()) {
      const prof = snap.data() as ProfileRow;
      const resolved = resolveCommunityGroup(prof.gender, prof.community_group);
      if (resolved) return resolved;
    }
  } catch {
    /* fallback to guest settings below */
  }
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("btc_guest_community_group");
    if (stored === "boys" || stored === "girls") return stored;
  }
  return "boys";
}

export function useCircles() {
  return useQuery({
    queryKey: ["circles"],
    queryFn: async (): Promise<CircleTeamRow[]> => {
      const localCircles: CircleTeamRow[] = [];
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem("btc_local_circles_v1");
          if (raw) localCircles.push(...JSON.parse(raw));
        } catch {
          /* ignore */
        }
      }
      const userId = await requireEligibleUid();
      if (!userId) return localCircles;
      try {
        const [snap, userGroup] = await Promise.all([
          getDocs(query(collection(db, "circles"), where("member_uids", "array-contains", userId))),
          resolveUserCommunityGroupFromProfile(userId),
        ]);
        const remote = snap.docs
          .map((d) => d.data() as CircleTeamRow)
          .filter((c) => !userGroup || !c.community_group || c.community_group === userGroup);
        const combined = [...localCircles, ...remote];
        const seen = new Set<string>();
        return combined
          .filter((c) => {
            if (seen.has(c.id)) return false;
            seen.add(c.id);
            return true;
          })
          .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
      } catch (err) {
        if (localCircles.length > 0) return localCircles;
        handleFirestoreError(err, OperationType.LIST, "circles");
      }
    },
  });
}

export function useCircleDetails(circleId: string | null) {
  return useQuery({
    queryKey: ["circle_details", circleId],
    enabled: Boolean(circleId),
    queryFn: async (): Promise<{
      members: CircleMemberRow[];
      posts: CirclePostRow[];
    }> => {
      const userId = await requireEligibleUid();
      if (!userId || !circleId) return { members: [], posts: [] };
      try {
        const [membersSnap, postsSnap] = await Promise.all([
          getDocs(collection(db, "circles", circleId, "members")),
          getDocs(collection(db, "circles", circleId, "posts")),
        ]);
        return {
          members: membersSnap.docs.map((d) => d.data() as CircleMemberRow),
          posts: postsSnap.docs
            .map((d) => d.data() as CirclePostRow)
            .sort((a, b) => b.created_at.localeCompare(a.created_at)),
        };
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, `circles/${circleId}`);
      }
    },
  });
}

export function useCircleActions() {
  const qc = useQueryClient();

  const createCircle = async (payload: {
    name: string;
    subject?: string | null;
    description?: string | null;
    sharedGoal?: string | null;
    memberDisplayName: string;
    showProgress: boolean;
    xpSnapshot: number;
    levelSnapshot: number;
  }) => {
    const userId = (await requireEligibleUid()) || "guest_user";
    const userGroup = (await resolveUserCommunityGroupFromProfile(userId)) || "boys";
    const now = new Date().toISOString();
    const circleId = generateSafeDocId("circle");
    const inviteCode = generateInviteCode(8);
    const name = clampString(payload.name, 80);
    if (!name) throw new Error("Team name is required.");

    const teamDoc: CircleTeamRow = {
      id: circleId,
      name,
      description: clampString(payload.description, 400),
      subject: clampString(payload.subject, 60),
      invite_code: inviteCode,
      owner_id: userId,
      shared_goal: clampString(payload.sharedGoal, 200),
      member_uids: [userId],
      community_group: userGroup,
      created_at: now,
      updated_at: now,
    };

    const inviteDoc: CircleInviteRow = {
      id: inviteCode,
      circle_id: circleId,
      circle_name: name,
      subject: teamDoc.subject,
      owner_id: userId,
      community_group: userGroup,
      created_at: now,
    };

    const memberDoc: CircleMemberRow = {
      uid: userId,
      circle_id: circleId,
      display_name: clampString(payload.memberDisplayName, 60) ?? "Student",
      role: "owner",
      show_progress: payload.showProgress,
      xp_snapshot: payload.showProgress ? payload.xpSnapshot : null,
      level_snapshot: payload.showProgress ? payload.levelSnapshot : null,
      joined_at: now,
    };

    try {
      await setDoc(doc(db, "circles", circleId), teamDoc);
      await setDoc(doc(db, "circle_invites", inviteCode), inviteDoc);
      await setDoc(doc(db, "circles", circleId, "members", userId), memberDoc);
    } catch (err) {
      console.warn("Firestore write failed for circle, persisting locally:", err);
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem("btc_local_circles_v1");
          const list: CircleTeamRow[] = raw ? JSON.parse(raw) : [];
          list.unshift(teamDoc);
          window.localStorage.setItem("btc_local_circles_v1", JSON.stringify(list));
        } catch (e) {
          console.warn("Could not write circle to local storage:", e);
        }
      }
    }

    await awardXpIfUnique({
      userId,
      eventDocId: buildEventDocId(userId, "KNOWLEDGE_CIRCLE_JOINED", circleId),
      eventType: "KNOWLEDGE_CIRCLE_JOINED",
      area: "community",
      xpReward: XP_RULES.KNOWLEDGE_CIRCLE_JOINED,
      refId: circleId,
      nowIso: now,
    });

    await Promise.all([
      qc.invalidateQueries({ queryKey: ["circles"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
      qc.invalidateQueries({ queryKey: ["activity_events"] }),
    ]);
    return teamDoc;
  };

  const joinByInviteCode = async (payload: {
    inviteCode: string;
    memberDisplayName: string;
    showProgress: boolean;
    xpSnapshot: number;
    levelSnapshot: number;
  }): Promise<{
    joined: boolean;
    circleId?: string;
    reason?: "invalid_code" | "missing_community" | "community_mismatch";
  }> => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("Sign in required.");
    const userGroup = await resolveUserCommunityGroupFromProfile(userId);
    if (!userGroup) {
      return { joined: false, reason: "missing_community" };
    }
    const cleanCode = payload.inviteCode
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    if (cleanCode.length < 6) return { joined: false, reason: "invalid_code" };

    let inviteSnap;
    try {
      inviteSnap = await getDoc(doc(db, "circle_invites", cleanCode));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `circle_invites/${cleanCode}`);
    }
    if (!inviteSnap.exists()) return { joined: false, reason: "invalid_code" };
    const invite = inviteSnap.data() as CircleInviteRow;

    let targetGroup: CommunityGroup | null = invite.community_group ?? null;
    if (!targetGroup) {
      try {
        const circleSnap = await getDoc(doc(db, "circles", invite.circle_id));
        if (circleSnap.exists()) {
          targetGroup = (circleSnap.data() as CircleTeamRow).community_group ?? null;
        }
      } catch {
        targetGroup = null;
      }
    }
    if (targetGroup && targetGroup !== userGroup) {
      return { joined: false, reason: "community_mismatch" };
    }

    const now = new Date().toISOString();
    const memberDoc: CircleMemberRow = {
      uid: userId,
      circle_id: invite.circle_id,
      display_name: clampString(payload.memberDisplayName, 60) ?? "Student",
      role: "member",
      show_progress: payload.showProgress,
      xp_snapshot: payload.showProgress ? payload.xpSnapshot : null,
      level_snapshot: payload.showProgress ? payload.levelSnapshot : null,
      joined_at: now,
    };

    try {
      await updateDoc(doc(db, "circles", invite.circle_id), {
        member_uids: arrayUnion(userId),
        updated_at: now,
      });
      await setDoc(doc(db, "circles", invite.circle_id, "members", userId), memberDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `circles/${invite.circle_id}`);
    }

    await awardXpIfUnique({
      userId,
      eventDocId: buildEventDocId(userId, "KNOWLEDGE_CIRCLE_JOINED", invite.circle_id),
      eventType: "KNOWLEDGE_CIRCLE_JOINED",
      area: "community",
      xpReward: XP_RULES.KNOWLEDGE_CIRCLE_JOINED,
      refId: invite.circle_id,
      nowIso: now,
    });

    await Promise.all([
      qc.invalidateQueries({ queryKey: ["circles"] }),
      qc.invalidateQueries({ queryKey: ["circle_details", invite.circle_id] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
      qc.invalidateQueries({ queryKey: ["activity_events"] }),
    ]);

    return { joined: true, circleId: invite.circle_id };
  };

  const createCirclePost = async (payload: {
    circle: CircleTeamRow;
    authorName: string;
    kind: "discussion" | "resource" | "task";
    title: string;
    body?: string | null;
    resourceUrl?: string | null;
    assigneeName?: string | null;
  }) => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("Sign in required.");
    const userGroup = await resolveUserCommunityGroupFromProfile(userId);
    if (
      userGroup &&
      payload.circle.community_group &&
      payload.circle.community_group !== userGroup
    ) {
      throw new Error("Cross-community posting is not permitted.");
    }
    const title = clampString(payload.title, 160);
    if (!title) throw new Error("Post title is required.");

    const now = new Date().toISOString();
    const id = generateSafeDocId("post");
    const scopedGroup = payload.circle.community_group ?? userGroup ?? undefined;
    const post: CirclePostRow = {
      id,
      circle_id: payload.circle.id,
      author_id: userId,
      author_name: clampString(payload.authorName, 60) ?? "Student",
      kind: payload.kind,
      title,
      body: clampString(payload.body, 2000),
      resource_url: sanitizeHttpUrl(payload.resourceUrl, 512),
      assignee_name: clampString(payload.assigneeName, 60),
      status: "open",
      member_uids: payload.circle.member_uids.slice(0, 25),
      helpful_uids: [],
      ...(scopedGroup ? { community_group: scopedGroup } : {}),
      created_at: now,
    };

    try {
      await setDoc(doc(db, "circles", payload.circle.id, "posts", id), post);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `circles/${payload.circle.id}/posts/${id}`);
    }

    await qc.invalidateQueries({ queryKey: ["circle_details", payload.circle.id] });
    return post;
  };

  const togglePostStatus = async (post: CirclePostRow) => {
    const userId = await requireEligibleUid();
    if (!userId) return;
    const nextStatus = post.status === "done" ? "open" : "done";
    try {
      await updateDoc(doc(db, "circles", post.circle_id, "posts", post.id), {
        status: nextStatus,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `circles/${post.circle_id}/posts/${post.id}`);
    }
    await qc.invalidateQueries({ queryKey: ["circle_details", post.circle_id] });
  };

  const toggleHelpful = async (post: CirclePostRow) => {
    const userId = await requireEligibleUid();
    if (!userId) return;
    const already = post.helpful_uids.includes(userId);
    try {
      await updateDoc(doc(db, "circles", post.circle_id, "posts", post.id), {
        helpful_uids: already ? arrayRemove(userId) : arrayUnion(userId),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `circles/${post.circle_id}/posts/${post.id}`);
    }
    await qc.invalidateQueries({ queryKey: ["circle_details", post.circle_id] });
  };

  const leaveCircle = async (circle: CircleTeamRow) => {
    const userId = await requireEligibleUid();
    if (!userId || circle.owner_id === userId) return;
    try {
      await updateDoc(doc(db, "circles", circle.id), {
        member_uids: arrayRemove(userId),
        updated_at: new Date().toISOString(),
      });
      await deleteDoc(doc(db, "circles", circle.id, "members", userId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `circles/${circle.id}/members/${userId}`);
    }
    await qc.invalidateQueries({ queryKey: ["circles"] });
  };

  const submitModerationReport = async (payload: {
    circleId?: string | null;
    targetType: ModerationReportRow["target_type"];
    targetId: string;
    reason: ModerationReportRow["reason"];
    details?: string | null;
  }) => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("Sign in required.");
    const userGroup = await resolveUserCommunityGroupFromProfile(userId);
    const id = generateSafeDocId("rep");
    const report: ModerationReportRow = {
      id,
      reporter_id: userId,
      circle_id: clampString(payload.circleId, 128),
      target_type: payload.targetType,
      target_id: payload.targetId.slice(0, 128),
      reason: payload.reason,
      details: clampString(payload.details, 1000),
      status: "submitted",
      ...(userGroup ? { community_group: userGroup } : {}),
      created_at: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, "moderation_reports", id), report);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `moderation_reports/${id}`);
    }
    return report;
  };

  const updateCircleGoal = async (circle: CircleTeamRow, sharedGoal: string | null) => {
    const userId = await requireEligibleUid();
    if (!userId || circle.owner_id !== userId) return;
    try {
      await updateDoc(doc(db, "circles", circle.id), {
        shared_goal: clampString(sharedGoal, 200),
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `circles/${circle.id}`);
    }
    await qc.invalidateQueries({ queryKey: ["circles"] });
  };

  const updateCirclePost = async (
    post: CirclePostRow,
    patch: {
      title?: string;
      body?: string | null;
      resourceUrl?: string | null;
      assigneeName?: string | null;
    },
  ) => {
    const userId = await requireEligibleUid();
    if (!userId || userId !== post.author_id) {
      throw new Error("Only the post author can edit this post.");
    }
    const nextTitle = clampString(patch.title ?? post.title, 160);
    if (!nextTitle) throw new Error("Post title is required.");
    try {
      await updateDoc(doc(db, "circles", post.circle_id, "posts", post.id), {
        title: nextTitle,
        body: patch.body !== undefined ? clampString(patch.body, 2000) : post.body,
        resource_url:
          patch.resourceUrl !== undefined
            ? sanitizeHttpUrl(patch.resourceUrl, 512)
            : post.resource_url,
        assignee_name:
          patch.assigneeName !== undefined
            ? clampString(patch.assigneeName, 60)
            : post.assignee_name,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `circles/${post.circle_id}/posts/${post.id}`);
    }
    await qc.invalidateQueries({ queryKey: ["circle_details", post.circle_id] });
  };

  const deleteCirclePost = async (post: CirclePostRow) => {
    const userId = await requireEligibleUid();
    if (!userId) return;
    try {
      await deleteDoc(doc(db, "circles", post.circle_id, "posts", post.id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `circles/${post.circle_id}/posts/${post.id}`);
    }
    await qc.invalidateQueries({ queryKey: ["circle_details", post.circle_id] });
  };

  return {
    createCircle,
    joinByInviteCode,
    createCirclePost,
    updateCirclePost,
    deleteCirclePost,
    togglePostStatus,
    toggleHelpful,
    updateCircleGoal,
    leaveCircle,
    submitModerationReport,
  };
}

/* ─────────────────────────── DAILY GROWTH JOURNAL ─────────────────────────── */

export function useJournalEntries() {
  return useQuery({
    queryKey: ["journals"],
    queryFn: async (): Promise<JournalEntryRow[]> => {
      const userId = await requireEligibleUid();
      if (!userId) return [];
      try {
        const [primarySnap, legacySnap] = await Promise.all([
          getDocs(query(collection(db, "journals"), where("user_id", "==", userId))),
          getDocs(query(collection(db, "journal_entries"), where("user_id", "==", userId))).catch(
            () => null,
          ),
        ]);
        const byId = new Map<string, JournalEntryRow>();
        if (legacySnap) {
          for (const d of legacySnap.docs) {
            const row = d.data() as JournalEntryRow;
            byId.set(row.id, row);
          }
        }
        for (const d of primarySnap.docs) {
          const row = d.data() as JournalEntryRow;
          byId.set(row.id, row);
        }
        return Array.from(byId.values()).sort((a, b) => {
          const dateCmp = b.entry_date.localeCompare(a.entry_date);
          if (dateCmp !== 0) return dateCmp;
          return b.updated_at.localeCompare(a.updated_at);
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "journals");
      }
    },
  });
}

export function useJournalActions() {
  const qc = useQueryClient();

  const invalidateJournals = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["journals"] }),
      qc.invalidateQueries({ queryKey: ["journal_entries"] }),
    ]);
  };

  const addJournalEntry = async (payload: {
    entryDate: string;
    title: string;
    reflection: string;
    keyWin?: string | null;
    nextStep?: string | null;
    subject?: string | null;
    area: GrowthArea;
    mood: JournalMood;
    studyMinutes?: number | null;
    tags?: string[];
    blocker?: string | null;
    gratitude?: string | null;
  }): Promise<JournalEntryRow> => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("Sign in required.");
    const title = clampString(payload.title, 160);
    const reflection = clampString(payload.reflection, 4000);
    if (!title || !reflection) {
      throw new Error("Title and reflection are required.");
    }

    const now = new Date().toISOString();
    const safeDate = clampString(payload.entryDate, 20)?.slice(0, 10) || now.slice(0, 10);
    const entryDate = /^\d{4}-\d{2}-\d{2}$/.test(safeDate) ? safeDate : now.slice(0, 10);
    const id = generateSafeDocId("journal");
    const cleanTags = (payload.tags ?? [])
      .map((tag) => tag.trim().replace(/^#/, "").slice(0, 32))
      .filter(Boolean)
      .slice(0, 8);

    const row: JournalEntryRow = {
      id,
      user_id: userId,
      entry_date: entryDate,
      title,
      reflection,
      key_win: clampString(payload.keyWin, 300),
      next_step: clampString(payload.nextStep, 300),
      subject: clampString(payload.subject, 60),
      area: payload.area,
      mood: payload.mood,
      study_minutes:
        typeof payload.studyMinutes === "number" && !Number.isNaN(payload.studyMinutes)
          ? Math.min(Math.max(Math.round(payload.studyMinutes), 0), 720)
          : null,
      ...(cleanTags.length > 0 ? { tags: cleanTags } : {}),
      ...(payload.blocker !== undefined ? { blocker: clampString(payload.blocker, 300) } : {}),
      ...(payload.gratitude !== undefined
        ? { gratitude: clampString(payload.gratitude, 300) }
        : {}),
      created_at: now,
      updated_at: now,
    };

    try {
      await setDoc(doc(db, "journals", id), row);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `journals/${id}`);
    }

    await awardXpIfUnique({
      userId,
      eventDocId: buildEventDocId(userId, "LEARNING_REFLECTION_CREATED", entryDate),
      eventType: "LEARNING_REFLECTION_CREATED",
      area: row.area,
      xpReward: XP_RULES.LEARNING_REFLECTION_CREATED,
      refId: id,
      nowIso: now,
    });

    await Promise.all([
      invalidateJournals(),
      qc.invalidateQueries({ queryKey: ["stats"] }),
      qc.invalidateQueries({ queryKey: ["activity_events"] }),
    ]);
    return row;
  };

  const updateJournalEntry = async (
    entry: JournalEntryRow,
    patch: {
      entryDate?: string;
      title?: string;
      reflection?: string;
      keyWin?: string | null;
      nextStep?: string | null;
      subject?: string | null;
      area?: GrowthArea;
      mood?: JournalMood;
      studyMinutes?: number | null;
      tags?: string[];
      blocker?: string | null;
      gratitude?: string | null;
    },
  ) => {
    const userId = await requireEligibleUid();
    if (!userId || userId !== entry.user_id) return;
    const now = new Date().toISOString();
    const nextTitle = clampString(patch.title ?? entry.title, 160);
    const nextReflection = clampString(patch.reflection ?? entry.reflection, 4000);
    if (!nextTitle || !nextReflection) {
      throw new Error("Title and reflection are required.");
    }
    const candidateDate = patch.entryDate ? clampString(patch.entryDate, 20)?.slice(0, 10) : null;
    const nextDate =
      candidateDate && /^\d{4}-\d{2}-\d{2}$/.test(candidateDate) ? candidateDate : entry.entry_date;

    const cleanTags =
      patch.tags !== undefined
        ? patch.tags
            .map((tag) => tag.trim().replace(/^#/, "").slice(0, 32))
            .filter(Boolean)
            .slice(0, 8)
        : (entry.tags ?? []);

    const updates = {
      entry_date: nextDate,
      title: nextTitle,
      reflection: nextReflection,
      key_win: patch.keyWin !== undefined ? clampString(patch.keyWin, 300) : entry.key_win,
      next_step: patch.nextStep !== undefined ? clampString(patch.nextStep, 300) : entry.next_step,
      subject: patch.subject !== undefined ? clampString(patch.subject, 60) : entry.subject,
      area: patch.area ?? entry.area,
      mood: patch.mood ?? entry.mood,
      study_minutes:
        patch.studyMinutes !== undefined
          ? typeof patch.studyMinutes === "number" && !Number.isNaN(patch.studyMinutes)
            ? Math.min(Math.max(Math.round(patch.studyMinutes), 0), 720)
            : null
          : entry.study_minutes,
      tags: cleanTags,
      blocker:
        patch.blocker !== undefined ? clampString(patch.blocker, 300) : (entry.blocker ?? null),
      gratitude:
        patch.gratitude !== undefined
          ? clampString(patch.gratitude, 300)
          : (entry.gratitude ?? null),
      updated_at: now,
    };

    try {
      const primaryRef = doc(db, "journals", entry.id);
      const snap = await getDoc(primaryRef);
      if (snap.exists()) {
        await updateDoc(primaryRef, updates);
      } else {
        const cleanDoc: JournalEntryRow = {
          id: entry.id,
          user_id: userId,
          entry_date: updates.entry_date,
          title: updates.title,
          reflection: updates.reflection,
          key_win: updates.key_win,
          next_step: updates.next_step,
          subject: updates.subject,
          area: updates.area,
          mood: updates.mood,
          study_minutes: updates.study_minutes,
          tags: updates.tags,
          blocker: updates.blocker,
          gratitude: updates.gratitude,
          created_at: entry.created_at || now,
          updated_at: updates.updated_at,
        };
        await setDoc(primaryRef, cleanDoc);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `journals/${entry.id}`);
    }

    await invalidateJournals();
  };

  const deleteJournalEntry = async (id: string) => {
    const userId = await requireEligibleUid();
    if (!userId) return;
    try {
      await Promise.all([
        deleteDoc(doc(db, "journals", id)),
        deleteDoc(doc(db, "journal_entries", id)).catch(() => undefined),
      ]);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `journals/${id}`);
    }
    await invalidateJournals();
  };

  return { addJournalEntry, updateJournalEntry, deleteJournalEntry };
}

/* ─────────────────────────── TIME ORGANIZER BLOCKS ─────────────────────────── */

export function useTimeBlocks() {
  return useQuery({
    queryKey: ["time_blocks"],
    queryFn: async (): Promise<TimeBlockRow[]> => {
      const userId = await requireEligibleUid();
      if (!userId) return [];
      try {
        const snap = await getDocs(
          query(collection(db, "time_blocks"), where("user_id", "==", userId)),
        );
        return snap.docs
          .map((d) => d.data() as TimeBlockRow)
          .sort((a, b) => {
            const dayCmp = a.day_label.localeCompare(b.day_label);
            if (dayCmp !== 0) return dayCmp;
            return a.start_time.localeCompare(b.start_time);
          });
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "time_blocks");
      }
    },
  });
}

export function useTimeBlockActions() {
  const qc = useQueryClient();

  const addTimeBlock = async (payload: {
    title: string;
    dayLabel: string;
    startTime: string;
    endTime: string;
    notes?: string | null;
  }): Promise<TimeBlockRow> => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("Sign in required.");
    const title = clampString(payload.title, 160);
    const dayLabel = clampString(payload.dayLabel, 60);
    const startTime = clampString(payload.startTime, 10);
    const endTime = clampString(payload.endTime, 10);
    if (!title || !dayLabel || !startTime || !endTime) {
      throw new Error("Title, day, start time, and end time are required.");
    }
    const now = new Date().toISOString();
    const id = generateSafeDocId("tb");
    const row: TimeBlockRow = {
      id,
      user_id: userId,
      title,
      day_label: dayLabel,
      start_time: startTime,
      end_time: endTime,
      notes: clampString(payload.notes, 500),
      completed: false,
      created_at: now,
      updated_at: now,
    };
    try {
      await setDoc(doc(db, "time_blocks", id), row);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `time_blocks/${id}`);
    }
    await qc.invalidateQueries({ queryKey: ["time_blocks"] });
    return row;
  };

  const toggleTimeBlock = async (block: TimeBlockRow) => {
    const userId = await requireEligibleUid();
    if (!userId || userId !== block.user_id) return;
    try {
      await updateDoc(doc(db, "time_blocks", block.id), {
        completed: !block.completed,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `time_blocks/${block.id}`);
    }
    await qc.invalidateQueries({ queryKey: ["time_blocks"] });
  };

  const deleteTimeBlock = async (id: string) => {
    const userId = await requireEligibleUid();
    if (!userId) return;
    try {
      await deleteDoc(doc(db, "time_blocks", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `time_blocks/${id}`);
    }
    await qc.invalidateQueries({ queryKey: ["time_blocks"] });
  };

  return { addTimeBlock, toggleTimeBlock, deleteTimeBlock };
}

/* ─────────────────────────── SHARED KNOWLEDGE CIRCLE ─────────────────────────── */

export function useCommunityPosts() {
  const qc = useQueryClient();

  useEffect(() => {
    let active = true;
    let unsub: (() => void) | undefined;
    void requireEligibleUid().then((userId) => {
      if (!active || !userId) return;
      unsub = onSnapshot(
        collection(db, "community_posts"),
        (snap) => {
          const rows = snap.docs
            .map((d) => d.data() as CommunityPostRow)
            .sort((a, b) => b.created_at.localeCompare(a.created_at));
          qc.setQueryData(["community_posts"], rows);
        },
        (err) => {
          console.warn("Realtime community_posts listener error:", err);
        },
      );
    });
    return () => {
      active = false;
      unsub?.();
    };
  }, [qc]);

  return useQuery({
    queryKey: ["community_posts"],
    queryFn: async (): Promise<CommunityPostRow[]> => {
      const userId = await requireEligibleUid();
      if (!userId) return [];
      try {
        const snap = await getDocs(collection(db, "community_posts"));
        return snap.docs
          .map((d) => d.data() as CommunityPostRow)
          .sort((a, b) => b.created_at.localeCompare(a.created_at));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "community_posts");
      }
    },
  });
}

export function useCommunityComments(postId: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!postId) return;
    let active = true;
    let unsub: (() => void) | undefined;
    void requireEligibleUid().then((userId) => {
      if (!active || !userId) return;
      unsub = onSnapshot(
        collection(db, "community_posts", postId, "comments"),
        (snap) => {
          const rows = snap.docs
            .map((d) => d.data() as CommunityCommentRow)
            .sort((a, b) => a.created_at.localeCompare(b.created_at));
          qc.setQueryData(["community_comments", postId], rows);
        },
        (err) => {
          console.warn(`Realtime comments listener error for ${postId}:`, err);
        },
      );
    });
    return () => {
      active = false;
      unsub?.();
    };
  }, [postId, qc]);

  return useQuery({
    queryKey: ["community_comments", postId],
    enabled: Boolean(postId),
    queryFn: async (): Promise<CommunityCommentRow[]> => {
      if (!postId) return [];
      const userId = await requireEligibleUid();
      if (!userId) return [];
      try {
        const snap = await getDocs(collection(db, "community_posts", postId, "comments"));
        return snap.docs
          .map((d) => d.data() as CommunityCommentRow)
          .sort((a, b) => a.created_at.localeCompare(b.created_at));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, `community_posts/${postId}/comments`);
      }
    },
  });
}

export function useCommunityReactions(postId: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!postId) return;
    let active = true;
    let unsub: (() => void) | undefined;
    void requireEligibleUid().then((userId) => {
      if (!active || !userId) return;
      unsub = onSnapshot(
        collection(db, "community_posts", postId, "reactions"),
        (snap) => {
          const rows = snap.docs.map((d) => d.data() as CommunityReactionRow);
          qc.setQueryData(["community_reactions", postId], rows);
        },
        (err) => {
          console.warn(`Realtime reactions listener error for ${postId}:`, err);
        },
      );
    });
    return () => {
      active = false;
      unsub?.();
    };
  }, [postId, qc]);

  return useQuery({
    queryKey: ["community_reactions", postId],
    enabled: Boolean(postId),
    queryFn: async (): Promise<CommunityReactionRow[]> => {
      if (!postId) return [];
      const userId = await requireEligibleUid();
      if (!userId) return [];
      try {
        const snap = await getDocs(collection(db, "community_posts", postId, "reactions"));
        return snap.docs.map((d) => d.data() as CommunityReactionRow);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, `community_posts/${postId}/reactions`);
      }
    },
  });
}

export function useSavedPosts() {
  const qc = useQueryClient();

  useEffect(() => {
    let active = true;
    let unsub: (() => void) | undefined;
    void requireEligibleUid().then((userId) => {
      if (!active || !userId) return;
      unsub = onSnapshot(
        collection(db, "users", userId, "saved_posts"),
        (snap) => {
          const rows = snap.docs
            .map((d) => d.data() as SavedPostRow)
            .sort((a, b) => b.saved_at.localeCompare(a.saved_at));
          qc.setQueryData(["saved_posts"], rows);
        },
        (err) => {
          console.warn("Realtime saved_posts listener error:", err);
        },
      );
    });
    return () => {
      active = false;
      unsub?.();
    };
  }, [qc]);

  return useQuery({
    queryKey: ["saved_posts"],
    queryFn: async (): Promise<SavedPostRow[]> => {
      const userId = await requireEligibleUid();
      if (!userId) return [];
      try {
        const snap = await getDocs(collection(db, "users", userId, "saved_posts"));
        return snap.docs
          .map((d) => d.data() as SavedPostRow)
          .sort((a, b) => b.saved_at.localeCompare(a.saved_at));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, `users/${userId}/saved_posts`);
      }
    },
  });
}

export function useCommunityActions() {
  const qc = useQueryClient();

  const createPost = async (payload: {
    authorName: string;
    category: CommunityPostCategory;
    tag?: string | null;
    body: string;
    mediaUrl?: string | null;
  }): Promise<CommunityPostRow> => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("Sign in required.");
    const body = clampString(payload.body, 3000);
    if (!body) throw new Error("Post message is required.");
    const tag = clampString(payload.tag, 40);
    const mediaUrl = sanitizeHttpUrl(payload.mediaUrl, 1024);
    const now = new Date().toISOString();
    const id = generateSafeDocId("cpost");
    const row: CommunityPostRow = {
      id,
      author_id: userId,
      author_name: clampString(payload.authorName, 60) ?? "Student",
      category: payload.category,
      ...(tag ? { tag } : {}),
      body,
      ...(mediaUrl ? { media_url: mediaUrl, media_kind: "link" as const } : {}),
      edited: false,
      created_at: now,
      updated_at: now,
    };
    try {
      await setDoc(doc(db, "community_posts", id), row);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `community_posts/${id}`);
    }
    await qc.invalidateQueries({ queryKey: ["community_posts"] });
    return row;
  };

  const updatePost = async (payload: {
    postId: string;
    category?: CommunityPostCategory;
    tag?: string | null;
    body: string;
    mediaUrl?: string | null;
  }) => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("Sign in required.");
    const body = clampString(payload.body, 3000);
    if (!body) throw new Error("Post message is required.");
    const tag = payload.tag !== undefined ? clampString(payload.tag, 40) : undefined;
    const mediaUrl =
      payload.mediaUrl !== undefined ? sanitizeHttpUrl(payload.mediaUrl, 1024) : undefined;
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, "community_posts", payload.postId), {
        ...(payload.category ? { category: payload.category } : {}),
        ...(tag !== undefined ? { tag } : {}),
        body,
        ...(mediaUrl !== undefined
          ? { media_url: mediaUrl, media_kind: mediaUrl ? ("link" as const) : null }
          : {}),
        edited: true,
        updated_at: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `community_posts/${payload.postId}`);
    }
    await qc.invalidateQueries({ queryKey: ["community_posts"] });
  };

  const deletePost = async (postId: string) => {
    const userId = await requireEligibleUid();
    if (!userId) return;
    try {
      await deleteDoc(doc(db, "community_posts", postId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `community_posts/${postId}`);
    }
    await qc.invalidateQueries({ queryKey: ["community_posts"] });
  };

  const addComment = async (payload: {
    postId: string;
    parentCommentId?: string | null;
    authorName: string;
    body: string;
  }): Promise<CommunityCommentRow> => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("Sign in required.");
    const body = clampString(payload.body, 2000);
    if (!body) throw new Error("Comment is required.");
    const parentCommentId = clampString(payload.parentCommentId, 128);
    const now = new Date().toISOString();
    const id = generateSafeDocId("ccmt");
    const row: CommunityCommentRow = {
      id,
      post_id: payload.postId,
      ...(parentCommentId ? { parent_comment_id: parentCommentId } : {}),
      author_id: userId,
      author_name: clampString(payload.authorName, 60) ?? "Student",
      body,
      edited: false,
      created_at: now,
      updated_at: now,
    };
    try {
      await setDoc(doc(db, "community_posts", payload.postId, "comments", id), row);
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.CREATE,
        `community_posts/${payload.postId}/comments/${id}`,
      );
    }
    await qc.invalidateQueries({ queryKey: ["community_comments", payload.postId] });
    return row;
  };

  const updateComment = async (payload: { postId: string; commentId: string; body: string }) => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("Sign in required.");
    const body = clampString(payload.body, 2000);
    if (!body) throw new Error("Comment is required.");
    try {
      await updateDoc(doc(db, "community_posts", payload.postId, "comments", payload.commentId), {
        body,
        edited: true,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.UPDATE,
        `community_posts/${payload.postId}/comments/${payload.commentId}`,
      );
    }
    await qc.invalidateQueries({ queryKey: ["community_comments", payload.postId] });
  };

  const deleteComment = async (postId: string, commentId: string) => {
    const userId = await requireEligibleUid();
    if (!userId) return;
    try {
      await deleteDoc(doc(db, "community_posts", postId, "comments", commentId));
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.DELETE,
        `community_posts/${postId}/comments/${commentId}`,
      );
    }
    await qc.invalidateQueries({ queryKey: ["community_comments", postId] });
  };

  const toggleReaction = async (
    postId: string,
    type: CommunityReactionType,
    existingReaction: CommunityReactionRow | undefined,
  ) => {
    const userId = await requireEligibleUid();
    if (!userId) return;
    const ref = doc(db, "community_posts", postId, "reactions", userId);
    const now = new Date().toISOString();
    try {
      if (existingReaction && existingReaction.type === type) {
        await deleteDoc(ref);
      } else if (existingReaction) {
        await updateDoc(ref, { type, updated_at: now });
      } else {
        const row: CommunityReactionRow = {
          user_id: userId,
          post_id: postId,
          type,
          created_at: now,
          updated_at: now,
        };
        await setDoc(ref, row);
      }
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.WRITE,
        `community_posts/${postId}/reactions/${userId}`,
      );
    }
    await qc.invalidateQueries({ queryKey: ["community_reactions", postId] });
  };

  const toggleSavePost = async (postId: string, isCurrentlySaved: boolean) => {
    const userId = await requireEligibleUid();
    if (!userId) return;
    const ref = doc(db, "users", userId, "saved_posts", postId);
    try {
      if (isCurrentlySaved) {
        await deleteDoc(ref);
      } else {
        const row: SavedPostRow = {
          post_id: postId,
          user_id: userId,
          saved_at: new Date().toISOString(),
        };
        await setDoc(ref, row);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${userId}/saved_posts/${postId}`);
    }
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["saved_posts"] }),
      qc.invalidateQueries({ queryKey: ["home_saved_posts_count"] }),
    ]);
  };

  const reportCommunityContent = async (payload: {
    targetType: "community_post" | "community_comment";
    targetId: string;
    reason: ModerationReportRow["reason"];
    details?: string | null;
  }) => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("Sign in required.");
    const id = generateSafeDocId("rep");
    const report: ModerationReportRow = {
      id,
      reporter_id: userId,
      circle_id: null,
      target_type: payload.targetType,
      target_id: payload.targetId.slice(0, 128),
      reason: payload.reason,
      details: clampString(payload.details, 1000),
      status: "submitted",
      created_at: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, "moderation_reports", id), report);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `moderation_reports/${id}`);
    }
    return report;
  };

  return {
    createPost,
    updatePost,
    deletePost,
    addComment,
    updateComment,
    deleteComment,
    toggleReaction,
    toggleSavePost,
    reportCommunityContent,
  };
}
