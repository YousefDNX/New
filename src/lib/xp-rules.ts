import type { GrowthArea } from "./firestore-data";

export const XP_RULES = {
  TASK_COMPLETED: 25,
  GOAL_UPDATED: 40,
  STUDY_SESSION_COMPLETED: 30,
  QUIZ_COMPLETED: 25,
  FLASHCARD_REVIEWED: 10,
  TOPIC_MASTERED: 25,
  MISTAKE_REVIEWED: 20,
  SKILL_PRACTICED: 15,
  MILESTONE_COMPLETED: 25,
  LEARNING_REFLECTION_CREATED: 20,
  CAREER_PATHWAY_EXPLORED: 20,
  KNOWLEDGE_CIRCLE_JOINED: 25,
  NOTE_CREATED: 15,
} as const;

export type CanonicalXpEventType = keyof typeof XP_RULES;

export type LegacyXpEventType =
  | "task_completed"
  | "goal_completed"
  | "goal_updated"
  | "focus_session_completed"
  | "study_session_completed"
  | "quiz_completed"
  | "flashcard_reviewed"
  | "topic_mastered"
  | "mistake_reviewed"
  | "mistake_mastered"
  | "skill_practiced"
  | "milestone_completed"
  | "journal_entry_logged"
  | "learning_reflection_created"
  | "career_pathway_explored"
  | "future_plan_created"
  | "knowledge_circle_joined"
  | "circle_joined"
  | "note_created"
  | "study_item_created"
  | "streak_maintained";

const LEGACY_TO_CANONICAL: Record<string, CanonicalXpEventType> = {
  task_completed: "TASK_COMPLETED",
  TASK_COMPLETED: "TASK_COMPLETED",
  goal_completed: "GOAL_UPDATED",
  goal_updated: "GOAL_UPDATED",
  GOAL_UPDATED: "GOAL_UPDATED",
  focus_session_completed: "STUDY_SESSION_COMPLETED",
  study_session_completed: "STUDY_SESSION_COMPLETED",
  STUDY_SESSION_COMPLETED: "STUDY_SESSION_COMPLETED",
  quiz_completed: "QUIZ_COMPLETED",
  QUIZ_COMPLETED: "QUIZ_COMPLETED",
  flashcard_reviewed: "FLASHCARD_REVIEWED",
  FLASHCARD_REVIEWED: "FLASHCARD_REVIEWED",
  topic_mastered: "TOPIC_MASTERED",
  TOPIC_MASTERED: "TOPIC_MASTERED",
  mistake_reviewed: "MISTAKE_REVIEWED",
  mistake_mastered: "MISTAKE_REVIEWED",
  MISTAKE_REVIEWED: "MISTAKE_REVIEWED",
  skill_practiced: "SKILL_PRACTICED",
  SKILL_PRACTICED: "SKILL_PRACTICED",
  milestone_completed: "MILESTONE_COMPLETED",
  MILESTONE_COMPLETED: "MILESTONE_COMPLETED",
  journal_entry_logged: "LEARNING_REFLECTION_CREATED",
  learning_reflection_created: "LEARNING_REFLECTION_CREATED",
  LEARNING_REFLECTION_CREATED: "LEARNING_REFLECTION_CREATED",
  career_pathway_explored: "CAREER_PATHWAY_EXPLORED",
  future_plan_created: "CAREER_PATHWAY_EXPLORED",
  CAREER_PATHWAY_EXPLORED: "CAREER_PATHWAY_EXPLORED",
  knowledge_circle_joined: "KNOWLEDGE_CIRCLE_JOINED",
  circle_joined: "KNOWLEDGE_CIRCLE_JOINED",
  KNOWLEDGE_CIRCLE_JOINED: "KNOWLEDGE_CIRCLE_JOINED",
  note_created: "NOTE_CREATED",
  study_item_created: "NOTE_CREATED",
  NOTE_CREATED: "NOTE_CREATED",
};

export function normalizeEventType(raw: string): CanonicalXpEventType | string {
  return LEGACY_TO_CANONICAL[raw] ?? raw;
}

/**
 * Computes bounded quiz XP from score percentage (min 15 for honest attempt, up to 25).
 */
export function computeQuizXp(scorePct: number): number {
  const clamped = Math.max(0, Math.min(100, Math.round(scorePct)));
  return Math.max(15, Math.min(25, Math.round(15 + (clamped / 100) * 10)));
}

/**
 * Generates deterministic, rule-compliant idempotency document IDs (`^[a-zA-Z0-9_\-]+$`, <= 128 chars).
 */
export function buildEventDocId(
  userId: string,
  eventType: CanonicalXpEventType | string,
  refId: string,
  dayIso?: string,
): string {
  const cleanUser = userId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24) || "user";
  const cleanType = eventType.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32) || "ev";
  const cleanRef = refId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48) || "ref";
  const suffix = dayIso ? `_${dayIso.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 12)}` : "";
  return `xp_${cleanUser}_${cleanType}_${cleanRef}${suffix}`.slice(0, 128);
}

export interface XpRuleDescriptor {
  eventType: CanonicalXpEventType;
  xp: number;
  xpLabel: string;
  area: GrowthArea;
  idempotency: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
}

export const XP_RULE_REFERENCE: XpRuleDescriptor[] = [
  {
    eventType: "TASK_COMPLETED",
    xp: XP_RULES.TASK_COMPLETED,
    xpLabel: "+25 XP",
    area: "productivity",
    idempotency: "Once per task ID",
    titleEn: "Complete a task",
    titleAr: "إنجاز مهمة",
    descEn: "Finish an open task once (reverting and re-checking will not double-award).",
    descAr: "إتمام مهمة مفتوحة مرة واحدة (إلغاء الإتمام وإعادته لا يضاعف النقاط).",
  },
  {
    eventType: "GOAL_UPDATED",
    xp: XP_RULES.GOAL_UPDATED,
    xpLabel: "+40 XP",
    area: "growth",
    idempotency: "Once per goal / daily reset date",
    titleEn: "Complete a goal",
    titleAr: "تحقيق هدف",
    descEn: "Reach completion on an active personal or daily growth goal.",
    descAr: "إكمال هدف نشط أو هدف يومي في خريطة النمو.",
  },
  {
    eventType: "STUDY_SESSION_COMPLETED",
    xp: XP_RULES.STUDY_SESSION_COMPLETED,
    xpLabel: "+30 XP",
    area: "productivity",
    idempotency: "Once per focus session ID",
    titleEn: "Complete focus session",
    titleAr: "إنهاء جلسة تركيز",
    descEn: "Log a real Pomodoro or deep focus study sprint.",
    descAr: "تسجيل جلسة بومودورو أو دراسة مركزة مكتملة.",
  },
  {
    eventType: "QUIZ_COMPLETED",
    xp: XP_RULES.QUIZ_COMPLETED,
    xpLabel: "+15 to +25 XP",
    area: "academic",
    idempotency: "Once per quiz attempt ID",
    titleEn: "Complete practice quiz",
    titleAr: "إكمال اختبار تدريبي",
    descEn: "15 base XP plus up to 10 XP scaled by quiz accuracy.",
    descAr: "15 نقطة أساسية بالإضافة إلى ما يصل إلى 10 نقاط حسب الدقة.",
  },
  {
    eventType: "FLASHCARD_REVIEWED",
    xp: XP_RULES.FLASHCARD_REVIEWED,
    xpLabel: "+10 XP",
    area: "academic",
    idempotency: "Once per card per day",
    titleEn: "Review flashcard",
    titleAr: "مراجعة بطاقة استذكار",
    descEn: "Awarded once per card per calendar day to support spaced repetition.",
    descAr: "تُمنح مرة واحدة لكل بطاقة في اليوم لدعم التكرار المتباعد.",
  },
  {
    eventType: "MISTAKE_REVIEWED",
    xp: XP_RULES.MISTAKE_REVIEWED,
    xpLabel: "+20 XP",
    area: "growth",
    idempotency: "Once per mistake resolution",
    titleEn: "Resolve or master mistake",
    titleAr: "مراجعة خطأ وإتقانه",
    descEn: "Work a logged mistake through explanation/practice to mastery.",
    descAr: "معالجة الخطأ بالشرح والتدريب حتى الإتقان.",
  },
  {
    eventType: "TOPIC_MASTERED",
    xp: XP_RULES.TOPIC_MASTERED,
    xpLabel: "+25 XP",
    area: "academic",
    idempotency: "Once per study item mastery",
    titleEn: "Master study topic",
    titleAr: "إتقان موضوع دراسي",
    descEn: "Mark a study note or topic as comfortable or completed.",
    descAr: "تحديد موضوع دراسي كمفهوم بالكامل أو مكتمل.",
  },
  {
    eventType: "LEARNING_REFLECTION_CREATED",
    xp: XP_RULES.LEARNING_REFLECTION_CREATED,
    xpLabel: "+20 XP",
    area: "growth",
    idempotency: "Once per daily journal entry",
    titleEn: "Log learning reflection",
    titleAr: "تدوين تأمل تعلم يومي",
    descEn: "Capture what clicked, key wins, and next study step in your journal.",
    descAr: "توثيق ما تعلمته وأبرز إنجازاتك وخطوتك القادمة.",
  },
  {
    eventType: "CAREER_PATHWAY_EXPLORED",
    xp: XP_RULES.CAREER_PATHWAY_EXPLORED,
    xpLabel: "+20 XP",
    area: "career",
    idempotency: "Once per pathway ID",
    titleEn: "Explore career pathway",
    titleAr: "استكشاف مسار مهني",
    descEn: "Create a structured Future plan aligned with your strengths.",
    descAr: "إنشاء خطة مستقبلية مرتبطة بنقاط قوتك وميولك.",
  },
  {
    eventType: "MILESTONE_COMPLETED",
    xp: XP_RULES.MILESTONE_COMPLETED,
    xpLabel: "+25 XP",
    area: "career",
    idempotency: "Once per milestone ID",
    titleEn: "Complete pathway milestone",
    titleAr: "إنجاز محطة في المسار",
    descEn: "Check off a goal milestone or Future pathway step.",
    descAr: "إكمال خطوة رئيسية ضمن هدف أو خطة مستقبلية.",
  },
  {
    eventType: "KNOWLEDGE_CIRCLE_JOINED",
    xp: XP_RULES.KNOWLEDGE_CIRCLE_JOINED,
    xpLabel: "+25 XP",
    area: "community",
    idempotency: "Once per circle membership",
    titleEn: "Join or start Knowledge Circle",
    titleAr: "الانضمام لدائرة معرفة",
    descEn: "Collaborate constructively with peers in a study team.",
    descAr: "التعاون الإيجابي مع الزملاء داخل فريق دراسي.",
  },
  {
    eventType: "NOTE_CREATED",
    xp: XP_RULES.NOTE_CREATED,
    xpLabel: "+15 XP",
    area: "academic",
    idempotency: "Once per study note ID",
    titleEn: "Save study note or concept",
    titleAr: "حفظ ملاحظة دراسية",
    descEn: "Capture structured notes or AI-saved study summaries.",
    descAr: "حفظ ملاحظة دراسية أو ملخص مفيد من المساعد.",
  },
];
