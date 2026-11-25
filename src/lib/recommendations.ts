import type { DictKey } from "./i18n-dict";
import type {
  GoalRow,
  MistakeStatus,
  OpportunityCategory,
  StudyItemRow,
  TaskRow,
} from "./firestore-data";

export function isTaskClosed(status: string): boolean {
  return status === "done" || status === "cancelled";
}

export function isTaskOpen(status: string): boolean {
  return !isTaskClosed(status);
}

export const MISTAKE_STAGES = [
  "recorded",
  "understanding_needed",
  "explanation_viewed",
  "practice_pending",
  "review_scheduled",
  "mastered",
] as const;

export type MistakeStage = (typeof MISTAKE_STAGES)[number];

export function isMistakeMastered(status: string | null | undefined): boolean {
  return status === "mastered" || status === "comfortable";
}

export function normalizeMistakeStage(raw: string | null | undefined): MistakeStage {
  if (!raw || raw === "open") return "recorded";
  if (raw === "reviewed") return "explanation_viewed";
  if (raw === "comfortable") return "mastered";
  if ((MISTAKE_STAGES as readonly string[]).includes(raw)) {
    return raw as MistakeStage;
  }
  return "recorded";
}

export function nextMistakeStage(current: MistakeStatus | string): MistakeStage {
  const normalized = normalizeMistakeStage(current);
  const idx = MISTAKE_STAGES.indexOf(normalized);
  if (idx < 0 || idx >= MISTAKE_STAGES.length - 1) return "mastered";
  return MISTAKE_STAGES[idx + 1]!;
}

export function isOpportunityStale(
  lastVerifiedAt: string | null | undefined,
  now = new Date(),
  maxAgeDays = 60,
): boolean {
  if (!lastVerifiedAt) return true;
  const parsedMs = Date.parse(
    lastVerifiedAt.length === 10 ? `${lastVerifiedAt}T00:00:00Z` : lastVerifiedAt,
  );
  if (Number.isNaN(parsedMs)) return true;
  const ageDays = (now.getTime() - parsedMs) / 86400_000;
  return ageDays > maxAgeDays;
}

export interface SmartRecommendation {
  id: string;
  kind: "overdue" | "due_soon" | "mistake" | "flashcard" | "goal" | "focus";
  title: string;
  reasonKey: DictKey;
  to: "/app/tasks" | "/app/study" | "/app";
  ctaKey: DictKey;
  priorityScore: number;
}

export function buildSmartRecommendations(params: {
  tasks: Pick<TaskRow, "id" | "title" | "status" | "due_at" | "priority">[];
  goals: Pick<GoalRow, "id" | "title" | "status" | "is_daily">[];
  studyItems: Pick<
    StudyItemRow,
    "id" | "kind" | "subject" | "title" | "mistake_status" | "next_review_at"
  >[];
  sessionMinutes?: number;
  now?: Date;
}): SmartRecommendation[] {
  const now = params.now ?? new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const in48hMs = now.getTime() + 48 * 3600_000;
  const recs: SmartRecommendation[] = [];

  const openTasks = params.tasks.filter((t) => isTaskOpen(t.status));
  const overdue = openTasks.filter((t) => t.due_at && t.due_at.slice(0, 10) < todayIso);
  if (overdue[0]) {
    recs.push({
      id: `rec-overdue-${overdue[0].id}`,
      kind: "overdue",
      title: overdue[0].title,
      reasonKey: "dash.rec.overdue",
      to: "/app/tasks",
      ctaKey: "dash.rec.ctaTasks",
      priorityScore: 100,
    });
  }

  const dueSoon = openTasks.find((t) => {
    if (!t.due_at) return false;
    const d = t.due_at.slice(0, 10);
    if (d < todayIso) return false;
    const ms = Date.parse(d + "T23:59:59Z");
    return !Number.isNaN(ms) && ms <= in48hMs;
  });
  if (dueSoon) {
    recs.push({
      id: `rec-soon-${dueSoon.id}`,
      kind: "due_soon",
      title: dueSoon.title,
      reasonKey: "dash.rec.dueSoon",
      to: "/app/tasks",
      ctaKey: "dash.rec.ctaTasks",
      priorityScore: 90,
    });
  }

  const openMistakes = params.studyItems.filter(
    (s) => s.kind === "mistake" && !isMistakeMastered(s.mistake_status),
  );
  if (openMistakes[0]) {
    recs.push({
      id: `rec-mistake-${openMistakes[0].id}`,
      kind: "mistake",
      title: `${openMistakes[0].subject}: ${openMistakes[0].title}`,
      reasonKey: "dash.rec.mistakes",
      to: "/app/study",
      ctaKey: "dash.rec.ctaStudy",
      priorityScore: 85,
    });
  }

  const dueCards = params.studyItems.filter(
    (s) =>
      s.kind === "flashcard" && (!s.next_review_at || s.next_review_at.slice(0, 10) <= todayIso),
  );
  if (dueCards.length > 0) {
    recs.push({
      id: `rec-cards-${dueCards.length}`,
      kind: "flashcard",
      title: `${dueCards[0]!.subject} (${dueCards.length})`,
      reasonKey: "dash.rec.flashcards",
      to: "/app/study",
      ctaKey: "dash.rec.ctaStudy",
      priorityScore: 75,
    });
  }

  const activeGoal = params.goals.find((g) => g.status !== "completed");
  if (activeGoal) {
    recs.push({
      id: `rec-goal-${activeGoal.id}`,
      kind: "goal",
      title: activeGoal.title,
      reasonKey: "dash.rec.goals",
      to: "/app",
      ctaKey: "dash.rec.ctaFocus",
      priorityScore: 65,
    });
  }

  if (recs.length === 0) {
    const mins = params.sessionMinutes ?? 25;
    recs.push({
      id: "rec-focus-default",
      kind: "focus",
      title: `${mins} min`,
      reasonKey: "dash.rec.focus",
      to: "/app/tasks",
      ctaKey: "dash.rec.ctaFocus",
      priorityScore: 50,
    });
  }

  return recs.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 4);
}

/**
 * Computes next spaced-repetition review ISO timestamp based on review count and recall outcome.
 */
export function computeNextReviewIso(params: {
  reviewCount: number;
  knewIt: boolean;
  style?: "recall" | "spaced" | "cloze";
  now?: Date;
}): string {
  const now = params.now ?? new Date();
  if (!params.knewIt) {
    // Re-queue soon (same day / 4 hours later)
    return new Date(now.getTime() + 4 * 3600_000).toISOString();
  }
  const intervalsDays = params.style === "spaced" ? [1, 3, 7, 14, 30] : [1, 2, 5, 10, 21];
  const days = intervalsDays[Math.min(params.reviewCount, intervalsDays.length - 1)] ?? 1;
  return new Date(now.getTime() + days * 86400_000).toISOString();
}

export type Sm2Rating = "again" | "hard" | "good" | "easy";

export function computeSm2RatedReviewIso(params: {
  reviewCount: number;
  rating: Sm2Rating;
  style?: "recall" | "spaced" | "cloze";
  now?: Date;
}): string {
  const now = params.now ?? new Date();
  if (params.rating === "again") {
    return new Date(now.getTime() + 4 * 3600_000).toISOString();
  }
  const baseIntervals = params.style === "spaced" ? [1, 3, 7, 14, 30] : [1, 2, 5, 10, 21];
  const baseDays = baseIntervals[Math.min(params.reviewCount, baseIntervals.length - 1)] ?? 1;
  const multiplier = params.rating === "hard" ? 0.6 : params.rating === "easy" ? 1.8 : 1;
  const days = Math.max(1, Math.round(baseDays * multiplier));
  return new Date(now.getTime() + days * 86400_000).toISOString();
}

export interface SubjectWeakSpot {
  subject: string;
  openMistakes: number;
  hardCards: number;
  avgQuizPct: number | null;
  score: number;
}

export function analyzeWeakSubjects(params: {
  studyItems: Pick<StudyItemRow, "kind" | "subject" | "difficulty" | "mistake_status">[];
  quizAttempts: { subject: string; score_pct: number }[];
}): SubjectWeakSpot[] {
  const bySubj = new Map<
    string,
    { openMistakes: number; hardCards: number; quizSum: number; quizCount: number }
  >();

  for (const item of params.studyItems) {
    const subj = item.subject.trim() || "General";
    const entry = bySubj.get(subj) ?? { openMistakes: 0, hardCards: 0, quizSum: 0, quizCount: 0 };
    if (item.kind === "mistake" && !isMistakeMastered(item.mistake_status)) {
      entry.openMistakes += 1;
    }
    if (item.kind === "flashcard" && item.difficulty === "hard") {
      entry.hardCards += 1;
    }
    bySubj.set(subj, entry);
  }

  for (const q of params.quizAttempts) {
    const subj = q.subject.trim() || "General";
    const entry = bySubj.get(subj) ?? { openMistakes: 0, hardCards: 0, quizSum: 0, quizCount: 0 };
    entry.quizSum += q.score_pct;
    entry.quizCount += 1;
    bySubj.set(subj, entry);
  }

  return Array.from(bySubj.entries())
    .map(([subject, e]) => {
      const avgQuizPct = e.quizCount > 0 ? Math.round(e.quizSum / e.quizCount) : null;
      const quizPenalty = avgQuizPct !== null ? Math.max(0, 100 - avgQuizPct) : 0;
      const score = e.openMistakes * 30 + e.hardCards * 15 + quizPenalty;
      return {
        subject,
        openMistakes: e.openMistakes,
        hardCards: e.hardCards,
        avgQuizPct,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export interface PathwayTemplate {
  id: string;
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  interests: string[];
  interestsAr: string[];
  strengths: string[];
  strengthsAr: string[];
  subjects: string[];
  subjectsAr: string[];
  milestones: string[];
  milestonesAr: string[];
}

export const FUTURE_PATHWAYS: PathwayTemplate[] = [
  {
    id: "ai-software-engineering",
    title: "Software Engineering & Applied AI",
    titleAr: "هندسة البرمجيات والذكاء الاصطناعي التطبيقي",
    summary: "Design reliable software tools, algorithms, and human-centered computing systems.",
    summaryAr: "تصميم أدوات برمجية موثوقة وخوارزميات وأنظمة حوسبة تخدم المستخدمين.",
    interests: ["Technology", "Problem Solving", "Math"],
    interestsAr: ["التقنية", "حل المشكلات", "الرياضيات"],
    strengths: ["Analytical Thinking", "Persistence"],
    strengthsAr: ["التفكير التحليلي", "المثابرة"],
    subjects: ["Mathematics", "Computer Science", "Physics"],
    subjectsAr: ["الرياضيات", "علوم الحاسب", "الفيزياء"],
    milestones: [
      "Build 2 small coding projects with clean tests",
      "Strengthen algebra, functions, and discrete logic",
      "Explore regional university CS admissions requirements",
    ],
    milestonesAr: [
      "بناء مشروعين برمجيين صغيرين مع اختبارات واضحة",
      "تقوية مهارات الجبر والدوال والمنطق الرياضي",
      "مراجعة متطلبات القبول في كليات علوم الحاسب",
    ],
  },
  {
    id: "biomed-health-sciences",
    title: "Medicine, Biotech & Health Sciences",
    titleAr: "الطب والتقنية الحيوية والعلوم الصحية",
    summary:
      "Apply biology, chemistry, and research discipline to clinical care or medical research.",
    summaryAr: "توظيف الأحياء والكيمياء ومنهج البحث العلمي في الرعاية الصحية والأبحاث الطبية.",
    interests: ["Science", "Helping People", "Research"],
    interestsAr: ["العلوم", "مساعدة الآخرين", "البحث العلمي"],
    strengths: ["Empathy", "Attention to Detail"],
    strengthsAr: ["التعاطف", "الدقة والانتباه للتفاصيل"],
    subjects: ["Biology", "Chemistry", "English"],
    subjectsAr: ["الأحياء", "الكيمياء", "اللغة الإنجليزية"],
    milestones: [
      "Master cellular biology & organic foundations",
      "Volunteer or shadow a local health initiative",
      "Compare pre-med / health science degree tracks",
    ],
    milestonesAr: [
      "إتقان أساسيات بيولوجيا الخلية والكيمياء العضوية",
      "المشاركة التطوعية في مبادرة توعوية أو صحية محلية",
      "مقارنة مسارات الطب والعلوم الصحية في الجامعات",
    ],
  },
  {
    id: "clean-energy-engineering",
    title: "Sustainable & Mechanical Engineering",
    titleAr: "الهندسة الميكانيكية والطاقة المستدامة",
    summary:
      "Solve energy, infrastructure, and climate challenges through physics and applied design.",
    summaryAr: "ابتكار حلول للطاقة والبنية التحتية والبيئة عبر الفيزياء والتصميم الهندسي.",
    interests: ["Sustainability", "Design", "Math"],
    interestsAr: ["الاستدامة", "التصميم", "الرياضيات"],
    strengths: ["Systems Thinking", "Collaboration"],
    strengthsAr: ["التفكير المنظومي", "العمل الجماعي"],
    subjects: ["Physics", "Calculus", "Chemistry"],
    subjectsAr: ["الفيزياء", "التفاضل والتكامل", "الكيمياء"],
    milestones: [
      "Complete calculus derivatives & mechanics problem sets",
      "Document a renewable-energy or design mini-study",
      "Review scholarship criteria for engineering faculties",
    ],
    milestonesAr: [
      "حل تمارين متدرجة في الميكانيكا والتفاضل",
      "توثيق دراسة مصغرة حول الطاقة المتجددة أو التصميم",
      "الاطلاع على معايير المنح الدراسية لكليات الهندسة",
    ],
  },
  {
    id: "economics-policy-entrepreneurship",
    title: "Economics, Public Policy & Leadership",
    titleAr: "الاقتصاد والسياسات العامة والقيادة",
    summary:
      "Combine data literacy, writing, and strategic thinking to lead organizations or initiatives.",
    summaryAr: "الجمع بين تحليل البيانات والكتابة والتفكير الاستراتيجي لقيادة المبادرات والمؤسسات.",
    interests: ["Leadership", "Writing", "Global Affairs"],
    interestsAr: ["القيادة", "الكتابة", "الشؤون العالمية"],
    strengths: ["Communication", "Strategic Planning"],
    strengthsAr: ["التواصل", "التخطيط الاستراتيجي"],
    subjects: ["Economics", "Mathematics", "History"],
    subjectsAr: ["الاقتصاد", "الرياضيات", "التاريخ"],
    milestones: [
      "Write a structured essay on a local economic challenge",
      "Lead a student club or Knowledge Circle project",
      "Research Model UN / debate & policy fellowships",
    ],
    milestonesAr: [
      "كتابة مقال تحليلي منظم حول موضوع اقتصادي أو مجتمعي",
      "قيادة مبادرة طلابية أو مشروع تعلّم في حلقة المعرفة",
      "استكشاف برامج المناظرات ونموذج الأمم المتحدة",
    ],
  },
  {
    id: "digital-media-architecture",
    title: "Architecture & Interactive Design",
    titleAr: "العمارة والتصميم التفاعلي",
    summary:
      "Blend visual craft, spatial reasoning, and human ergonomics to shape physical and digital spaces.",
    summaryAr: "دمج المهارة البصرية والتفكير المكاني لتصميم المساحات المعمارية والرقمية المريحة.",
    interests: ["Design", "Visual Arts", "Technology"],
    interestsAr: ["التصميم", "الفنون البصرية", "التقنية"],
    strengths: ["Creativity", "Visual Spatial"],
    strengthsAr: ["الإبداع", "الإدراك المكاني"],
    subjects: ["Art & Design", "Mathematics", "Physics"],
    subjectsAr: ["الفنون والتصميم", "الرياضيات", "الفيزياء"],
    milestones: [
      "Curate a 5-piece portfolio of sketches or models",
      "Study proportions, geometry, and material properties",
      "Review portfolio admissions timelines",
    ],
    milestonesAr: [
      "إعداد ملف أعمال من 5 رسومات أو نماذج أولية",
      "دراسة النسب الهندسية وخصائص المواد",
      "مراجعة مواعيد تقديم ملفات الأعمال في الكليات",
    ],
  },
];

export interface ReferenceOpportunityItem {
  id: string;
  title: string;
  titleAr: string;
  organizer: string;
  organizerAr: string;
  category: OpportunityCategory;
  region_scope: "kuwait" | "gcc" | "global";
  eligibility: string;
  eligibilityAr: string;
  deadline: string;
  deadlineAr: string;
  cost: string;
  costAr: string;
  url: string;
  source: string;
  sourceAr: string;
  verificationKind: "official_portal";
  last_verified_at: string;
}

export const REFERENCE_OPPORTUNITIES: ReferenceOpportunityItem[] = [
  {
    id: "ref-kfas-stem",
    title: "KFAS Youth STEM & Innovation Initiatives",
    titleAr: "مبادرات مؤسسة الكويت للتقدم العلمي للشباب والابتكار",
    organizer: "Kuwait Foundation for the Advancement of Sciences",
    organizerAr: "مؤسسة الكويت للتقدم العلمي (KFAS)",
    category: "program",
    region_scope: "kuwait",
    eligibility: "High school & university students residing in Kuwait",
    eligibilityAr: "طلاب المرحلة الثانوية والجامعية المقيمون في الكويت",
    deadline: "Rolling seasonal cycles — check official portal",
    deadlineAr: "دورات موسمية متجددة — راجع البوابة الرسمية",
    cost: "Funded / Free",
    costAr: "مموّل / مجاني",
    url: "https://www.kfas.org/",
    source: "KFAS Official Portal",
    sourceAr: "الموقع الرسمي لمؤسسة الكويت للتقدم العلمي",
    verificationKind: "official_portal",
    last_verified_at: "2026-01-15",
  },
  {
    id: "ref-mohe-kuwait-scholarships",
    title: "Kuwait MOHE Merit & External Scholarships",
    titleAr: "بعثات التميز والابتعاث الخارجي — وزارة التعليم العالي (الكويت)",
    organizer: "Ministry of Higher Education (Kuwait)",
    organizerAr: "وزارة التعليم العالي — دولة الكويت",
    category: "scholarship",
    region_scope: "kuwait",
    eligibility: "Kuwaiti high school graduates meeting GPA & major criteria",
    eligibilityAr: "خريجو الثانوية في الكويت وفق شروط المعدل والتخصص الرسمية",
    deadline: "Annual Summer Window — confirm on MOHE",
    deadlineAr: "فترة التقديم الصيفية السنوية — تأكد من البوابة الرسمية",
    cost: "Full Tuition & Stipend",
    costAr: "رسوم دراسية ومخصصات وفق اللوائح",
    url: "https://www.mohe.edu.kw/",
    source: "Kuwait MOHE Official Portal",
    sourceAr: "بوابة وزارة التعليم العالي الكويتية",
    verificationKind: "official_portal",
    last_verified_at: "2026-01-15",
  },
  {
    id: "ref-misk-youth",
    title: "Misk Youth & Leadership Fellowship Track",
    titleAr: "مسار زمالة مسك للشباب والقيادة",
    organizer: "Misk Foundation",
    organizerAr: "مؤسسة محمد بن سلمان (مسك)",
    category: "initiative",
    region_scope: "gcc",
    eligibility: "Ambitious youth and university students across the region",
    eligibilityAr: "الشباب وطلاب الجامعات الطموحون في المنطقة",
    deadline: "Cohort-based — check official announcements",
    deadlineAr: "حسب الدفعات المعلنة — راجع الموقع الرسمي",
    cost: "Free / Sponsored",
    costAr: "مجاني / برعاية المؤسسة",
    url: "https://misk.org.sa/en/",
    source: "Misk Foundation Official Site",
    sourceAr: "الموقع الرسمي لمؤسسة مسك",
    verificationKind: "official_portal",
    last_verified_at: "2026-01-15",
  },
  {
    id: "ref-nyuad-summer",
    title: "NYU Abu Dhabi Summer Academy Program",
    titleAr: "البرنامج الصيفي لجامعة نيويورك أبوظبي",
    organizer: "New York University Abu Dhabi",
    organizerAr: "جامعة نيويورك أبوظبي (NYUAD)",
    category: "program",
    region_scope: "gcc",
    eligibility: "High-achieving high school students in the UAE & GCC",
    eligibilityAr: "طلاب المرحلة الثانوية المتفوقون في الإمارات والخليج",
    deadline: "Annual Spring Application — verify dates",
    deadlineAr: "تقديم سنوي في الربيع — تحقق من المواعيد الرسمية",
    cost: "Full Scholarship Available",
    costAr: "تتوفر منح تغطي التكاليف",
    url: "https://nyuad.nyu.edu/",
    source: "NYUAD Admissions",
    sourceAr: "بوابة القبول — جامعة نيويورك أبوظبي",
    verificationKind: "official_portal",
    last_verified_at: "2026-01-15",
  },
  {
    id: "ref-khan-mit-ocw",
    title: "MIT OpenCourseWare & Open Self-Paced STEM",
    titleAr: "مساقات MIT المفتوحة والموارد العلمية المجانية",
    organizer: "MIT OpenCourseWare",
    organizerAr: "معهد ماساتشوستس للتقنية (MIT OCW)",
    category: "course",
    region_scope: "global",
    eligibility: "Open to students worldwide (self-paced)",
    eligibilityAr: "متاح مجاناً لجميع الطلاب حول العالم للتعلم الذاتي",
    deadline: "Open enrollment year-round",
    deadlineAr: "متاح طوال العام بدون موعد إغلاق",
    cost: "Free",
    costAr: "مجاني",
    url: "https://ocw.mit.edu/",
    source: "MIT OpenCourseWare",
    sourceAr: "منصة MIT OpenCourseWare الرسمية",
    verificationKind: "official_portal",
    last_verified_at: "2026-01-15",
  },
  {
    id: "ref-imo-iseff",
    title: "Regeneron ISEF Regional Science Fair Qualifiers",
    titleAr: "تصفيات المعرض العلمي الدولي للعلوم والهندسة (ISEF)",
    organizer: "Society for Science",
    organizerAr: "جمعية العلوم (Society for Science)",
    category: "competition",
    region_scope: "global",
    eligibility: "Grades 9–12 students competing via national science fair",
    eligibilityAr: "طلاب الصفوف 9–12 المشاركون عبر التصفيات الوطنية المعتمدة",
    deadline: "Depends on national fair calendar",
    deadlineAr: "بحسب تقويم المعارض الوطنية في كل بلد",
    cost: "Free / Sponsored Travel for Finalists",
    costAr: "مشاركة مجانية عبر التصفيات الوطنية",
    url: "https://www.societyforscience.org/isef/",
    source: "Society for Science",
    sourceAr: "الموقع الرسمي لمؤسسة Society for Science",
    verificationKind: "official_portal",
    last_verified_at: "2026-01-15",
  },
];
export interface StudentAlert {
  id: string;
  kind: "overdue_task" | "due_soon_task" | "due_flashcards" | "daily_goal";
  title: string;
  count: number;
  to: "/app/tasks" | "/app/study" | "/app";
  severity: "high" | "medium" | "info";
}

export function buildStudentAlerts(params: {
  tasks: Pick<TaskRow, "id" | "title" | "status" | "due_at">[];
  goals: Pick<GoalRow, "id" | "title" | "status" | "is_daily">[];
  studyItems: Pick<StudyItemRow, "id" | "kind" | "next_review_at">[];
  now?: Date;
}): StudentAlert[] {
  const now = params.now ?? new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const in48hMs = now.getTime() + 48 * 3600_000;
  const alerts: StudentAlert[] = [];

  const openTasks = params.tasks.filter((t) => isTaskOpen(t.status));
  const overdueTasks = openTasks.filter((t) => t.due_at && t.due_at.slice(0, 10) < todayIso);
  if (overdueTasks.length > 0) {
    alerts.push({
      id: "alert-overdue",
      kind: "overdue_task",
      title: overdueTasks[0]!.title,
      count: overdueTasks.length,
      to: "/app/tasks",
      severity: "high",
    });
  }

  const dueSoonTasks = openTasks.filter((t) => {
    if (!t.due_at) return false;
    const d = t.due_at.slice(0, 10);
    if (d < todayIso) return false;
    const ms = Date.parse(`${d}T23:59:59Z`);
    return !Number.isNaN(ms) && ms <= in48hMs;
  });
  if (dueSoonTasks.length > 0) {
    alerts.push({
      id: "alert-due-soon",
      kind: "due_soon_task",
      title: dueSoonTasks[0]!.title,
      count: dueSoonTasks.length,
      to: "/app/tasks",
      severity: "medium",
    });
  }

  const dueCards = params.studyItems.filter(
    (s) =>
      s.kind === "flashcard" && (!s.next_review_at || s.next_review_at.slice(0, 10) <= todayIso),
  );
  if (dueCards.length > 0) {
    alerts.push({
      id: "alert-flashcards",
      kind: "due_flashcards",
      title: `${dueCards.length}`,
      count: dueCards.length,
      to: "/app/study",
      severity: "medium",
    });
  }

  const openDailyGoals = params.goals.filter((g) => g.is_daily && g.status !== "completed");
  if (openDailyGoals.length > 0) {
    alerts.push({
      id: "alert-daily-goals",
      kind: "daily_goal",
      title: openDailyGoals[0]!.title,
      count: openDailyGoals.length,
      to: "/app",
      severity: "info",
    });
  }

  return alerts;
}
