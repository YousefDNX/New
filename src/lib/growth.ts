import type { DictKey } from "./i18n-dict";
import { isBtcMode } from "../config/brand.ts";

// Mirrors public.level_for_xp in the database (server is the source of truth).
export function levelForXp(xp: number) {
  return Math.floor(Math.sqrt(Math.max(xp, 0) / 50)) + 1;
}
export function xpForLevel(level: number) {
  return 50 * (level - 1) ** 2;
}
export function levelProgress(xp: number) {
  const level = levelForXp(xp);
  const start = xpForLevel(level);
  const end = xpForLevel(level + 1);
  return {
    level,
    current: xp - start,
    needed: end - start,
    pct: Math.round(((xp - start) / (end - start)) * 100),
  };
}

export function ageOn(dob: string, today = new Date()) {
  const d = new Date(dob + "T00:00:00Z");
  let age = today.getUTCFullYear() - d.getUTCFullYear();
  const m = today.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < d.getUTCDate())) age--;
  return age;
}
export function ageBand(dob: string, today = new Date()): "under13" | "13-15" | "16-17" | "18+" {
  const a = ageOn(dob, today);
  if (a < 13) return "under13";
  if (a < 16) return "13-15";
  if (a < 18) return "16-17";
  return "18+";
}

export const AREAS = [
  "academic",
  "productivity",
  "growth",
  "wellbeing",
  "career",
  "community",
] as const;
export type Area = (typeof AREAS)[number];

export interface AreaInfo {
  id: Area;
  labelKey: DictKey;
  descKey: DictKey;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  accentColor: string;
  accentBg: string;
}

export const AREA_CONFIG: Record<Area, AreaInfo> = {
  academic: {
    id: "academic",
    labelKey: "area.academic",
    descKey: "area.academic.d",
    nameEn: "Academic",
    nameAr: "الأكاديمي",
    descriptionEn: "Coursework, subjects, notes & exam prep",
    descriptionAr: "المواد، الملاحظات والتحضير للاختبارات",
    accentColor: "oklch(0.8 0.14 190)",
    accentBg: "oklch(0.8 0.14 190 / 12%)",
  },
  productivity: {
    id: "productivity",
    labelKey: "area.productivity",
    descKey: "area.productivity.d",
    nameEn: "Productivity",
    nameAr: "الإنتاجية",
    descriptionEn: "Tasks, focus sprints & deadline execution",
    descriptionAr: "المهام، جلسات التركيز والالتزام بالمواعيد",
    accentColor: "oklch(0.75 0.15 155)",
    accentBg: "oklch(0.75 0.15 155 / 12%)",
  },
  growth: {
    id: "growth",
    labelKey: "area.growth",
    descKey: "area.growth.d",
    nameEn: "Personal Growth",
    nameAr: "النمو الشخصي",
    descriptionEn: "Mistake corrections, reflection & habits",
    descriptionAr: "تصحيح الأخطاء، التأمل وبناء العادات",
    accentColor: "oklch(0.82 0.15 75)",
    accentBg: "oklch(0.82 0.15 75 / 12%)",
  },
  wellbeing: {
    id: "wellbeing",
    labelKey: "area.wellbeing",
    descKey: "area.wellbeing.d",
    nameEn: "Wellbeing",
    nameAr: "الرفاه",
    descriptionEn: "Healthy sleep, screen balance & mindset",
    descriptionAr: "النوم الصحي، توازن الشاشة والصحة النفسية",
    accentColor: "oklch(0.75 0.18 340)",
    accentBg: "oklch(0.75 0.18 340 / 12%)",
  },
  career: {
    id: "career",
    labelKey: "area.career",
    descKey: "area.career.d",
    nameEn: "Future & Career",
    nameAr: "المستقبل والمهنة",
    descriptionEn: "University pathways, skills & roadmaps",
    descriptionAr: "المسارات الجامعية، المهارات والخطط",
    accentColor: "oklch(0.72 0.16 290)",
    accentBg: "oklch(0.72 0.16 290 / 12%)",
  },
  community: {
    id: "community",
    labelKey: "area.community",
    descKey: "area.community.d",
    nameEn: "Community",
    nameAr: "المجتمع",
    descriptionEn: "Knowledge Circle, peer mentorship & teams",
    descriptionAr: "دائرة المعرفة، التعاون ودعم الزملاء",
    accentColor: "oklch(0.78 0.16 50)",
    accentBg: "oklch(0.78 0.16 50 / 12%)",
  },
};

export interface TierInfo {
  nameKey: DictKey;
  nameEn: string;
  nameAr: string;
  minLevel: number;
  maxLevel: number;
  badge: string;
  color: string;
}

export const TIERS: TierInfo[] = [
  {
    nameKey: "tier.explorer",
    nameEn: "Explorer",
    nameAr: "مستكشف",
    minLevel: 1,
    maxLevel: 3,
    badge: "🌱",
    color: "oklch(0.75 0.15 155)",
  },
  {
    nameKey: "tier.apprentice",
    nameEn: "Apprentice",
    nameAr: "متدرب",
    minLevel: 4,
    maxLevel: 6,
    badge: "⚡",
    color: "oklch(0.8 0.14 190)",
  },
  {
    nameKey: "tier.scholar",
    nameEn: "Scholar",
    nameAr: "باحث",
    minLevel: 7,
    maxLevel: 9,
    badge: "📚",
    color: "oklch(0.82 0.15 75)",
  },
  {
    nameKey: "tier.master",
    nameEn: "Master",
    nameAr: "متمكن",
    minLevel: 10,
    maxLevel: 14,
    badge: "🔮",
    color: "oklch(0.72 0.16 290)",
  },
  {
    nameKey: "tier.luminary",
    nameEn: "Luminary",
    nameAr: "ملهم",
    minLevel: 15,
    maxLevel: 99,
    badge: "👑",
    color: "oklch(0.85 0.18 85)",
  },
];

export function getTier(level: number): TierInfo {
  for (const t of TIERS) {
    if (level >= t.minLevel && level <= t.maxLevel) return t;
  }
  return TIERS[0]!;
}

export interface Milestone {
  id: string;
  level: number;
  titleKey: DictKey;
  descKey: DictKey;
  titleEn: string;
  titleAr: string;
  rewardXp: number;
  unlocked: boolean;
  descEn: string;
  descAr: string;
}

export function getMilestones(currentLevel: number): Milestone[] {
  return [
    {
      id: "m-1",
      level: 1,
      titleKey: "mile.1.title",
      descKey: "mile.1.desc",
      titleEn: "Growth Map Initiated",
      titleAr: "بدء خريطة النمو",
      rewardXp: 50,
      unlocked: currentLevel >= 1,
      descEn: "Created your student profile and began tracking",
      descAr: "إنشاء الملف الطلابي وبدء التتبع",
    },
    {
      id: "m-2",
      level: 3,
      titleKey: "mile.2.title",
      descKey: "mile.2.desc",
      titleEn: "Focus Momentum",
      titleAr: "زخم التركيز",
      rewardXp: 100,
      unlocked: currentLevel >= 3,
      descEn: "Maintained regular focus sprints and completed 5 tasks",
      descAr: "جلسات تركيز منتظمة وإنجاز 5 مهام",
    },
    {
      id: "m-3",
      level: 5,
      titleKey: "mile.3.title",
      descKey: "mile.3.desc",
      titleEn: "Consistent Scholar",
      titleAr: "طالب مثابر",
      rewardXp: 200,
      unlocked: currentLevel >= 5,
      descEn: "Reach Level 5 with balanced study and wellbeing habits",
      descAr: "الوصول إلى المستوى 5 بتوازن دراسي ونفسي",
    },
    {
      id: "m-4",
      level: 8,
      titleKey: "mile.4.title",
      descKey: "mile.4.desc",
      titleEn: "Mastery Accelerator",
      titleAr: "مسرّع التميز",
      rewardXp: 350,
      unlocked: currentLevel >= 8,
      descEn: "Logged multiple mistake corrections and multi-area goals",
      descAr: "تصحيح عدة أخطاء وأهداف في مختلف المجالات",
    },
    {
      id: "m-5",
      level: 10,
      titleKey: "mile.5.title",
      descKey: "mile.5.desc",
      titleEn: isBtcMode() ? "BTC Luminary" : "Nexora Luminary",
      titleAr: isBtcMode() ? "رائد BTC" : "رائد نيكسورا",
      rewardXp: 500,
      unlocked: currentLevel >= 10,
      descEn: "Master-tier autonomy across all six growth domains",
      descAr: "إتقان ذاتي وتفوق في المجالات الستة للنمو",
    },
  ];
}

export type BadgeCategory = "productivity" | "academic" | "consistency" | "growth" | "mastery";

export interface AchievementBadge {
  id: string;
  titleKey: DictKey;
  unlockedDescKey: DictKey;
  lockedDescKey: DictKey;
  categoryKey: DictKey;
  titleEn: string;
  titleAr: string;
  category: BadgeCategory;
  categoryLabelEn: string;
  categoryLabelAr: string;
  iconName:
    | "Sparkles"
    | "CheckCircle2"
    | "Flame"
    | "Clock"
    | "Brain"
    | "BookOpen"
    | "Compass"
    | "Users"
    | "HeartPulse"
    | "Trophy"
    | "Zap"
    | "Award";
  rewardXp: number;
  unlocked: boolean;
  unlockedAtIso?: string;
  progressCurrent: number;
  progressTarget: number;
}

export function getAchievementBadges(params: {
  level: number;
  xp: number;
  streak: number;
  completedTasks: number;
  completedGoals: number;
  focusSessionsCount?: number;
  masteredMistakesCount?: number;
  futurePlansCount?: number;
  circleCount?: number;
  careEntriesCount?: number;
  journalCount?: number;
  quizCount?: number;
}): AchievementBadge[] {
  const {
    level,
    streak,
    completedTasks,
    focusSessionsCount = 0,
    masteredMistakesCount = 0,
    futurePlansCount = 0,
    circleCount = 0,
    careEntriesCount = 0,
    journalCount = 0,
    quizCount = 0,
  } = params;

  return [
    {
      id: "badge-initiate",
      titleKey: "b.initiate.t",
      unlockedDescKey: "b.initiate.u",
      lockedDescKey: "b.initiate.l",
      categoryKey: "area.growth",
      titleEn: "Growth Pioneer",
      titleAr: "رائد النمو",
      category: "growth",
      categoryLabelEn: "Growth",
      categoryLabelAr: "النمو",
      iconName: "Sparkles",
      rewardXp: 50,
      unlocked: level >= 1,
      progressCurrent: 1,
      progressTarget: 1,
    },
    {
      id: "badge-streak-fire",
      titleKey: "b.streak.t",
      unlockedDescKey: "b.streak.u",
      lockedDescKey: "b.streak.l",
      categoryKey: "dash.stat.streak",
      titleEn: "Flame Keeper",
      titleAr: "حارس الشعلة",
      category: "consistency",
      categoryLabelEn: "Consistency",
      categoryLabelAr: "الاستمرارية",
      iconName: "Flame",
      rewardXp: 100,
      unlocked: streak >= 5,
      progressCurrent: Math.min(streak, 5),
      progressTarget: 5,
    },
    {
      id: "badge-task-finisher",
      titleKey: "b.task.t",
      unlockedDescKey: "b.task.u",
      lockedDescKey: "b.task.l",
      categoryKey: "area.productivity",
      titleEn: "Execution Master",
      titleAr: "سيد الإنجاز",
      category: "productivity",
      categoryLabelEn: "Productivity",
      categoryLabelAr: "الإنتاجية",
      iconName: "CheckCircle2",
      rewardXp: 75,
      unlocked: completedTasks >= 2,
      progressCurrent: Math.min(completedTasks, 2),
      progressTarget: 2,
    },
    {
      id: "badge-focus-deep",
      titleKey: "b.focus.t",
      unlockedDescKey: "b.focus.u",
      lockedDescKey: "b.focus.l",
      categoryKey: "area.productivity",
      titleEn: "Deep Diver",
      titleAr: "غواص التركيز",
      category: "productivity",
      categoryLabelEn: "Productivity",
      categoryLabelAr: "الإنتاجية",
      iconName: "Clock",
      rewardXp: 90,
      unlocked: focusSessionsCount >= 1 || level >= 2,
      progressCurrent: Math.min(Math.max(focusSessionsCount, level >= 2 ? 1 : 0), 1),
      progressTarget: 1,
    },
    {
      id: "badge-mistake-conqueror",
      titleKey: "b.mistake.t",
      unlockedDescKey: "b.mistake.u",
      lockedDescKey: "b.mistake.l",
      categoryKey: "area.growth",
      titleEn: "Mistake Alchemist",
      titleAr: "خيميائي الأخطاء",
      category: "growth",
      categoryLabelEn: "Growth",
      categoryLabelAr: "النمو",
      iconName: "Brain",
      rewardXp: 120,
      unlocked: masteredMistakesCount >= 1 || level >= 3,
      progressCurrent: Math.min(Math.max(masteredMistakesCount, level >= 3 ? 1 : 0), 1),
      progressTarget: 1,
    },
    {
      id: "badge-academic-scholar",
      titleKey: "b.scholar.t",
      unlockedDescKey: "b.scholar.u",
      lockedDescKey: "b.scholar.l",
      categoryKey: "area.academic",
      titleEn: "Academic Vanguard",
      titleAr: "طليعة الأكاديميا",
      category: "academic",
      categoryLabelEn: "Academic",
      categoryLabelAr: "الأكاديمي",
      iconName: "BookOpen",
      rewardXp: 150,
      unlocked: level >= 4,
      progressCurrent: Math.min(level, 4),
      progressTarget: 4,
    },
    {
      id: "badge-future-navigator",
      titleKey: "b.future.t",
      unlockedDescKey: "b.future.u",
      lockedDescKey: "b.future.l",
      categoryKey: "area.career",
      titleEn: "Pathway Visionary",
      titleAr: "مستشرف المسار",
      category: "mastery",
      categoryLabelEn: "Future",
      categoryLabelAr: "المستقبل",
      iconName: "Compass",
      rewardXp: 150,
      unlocked: futurePlansCount >= 1,
      progressCurrent: Math.min(futurePlansCount, 1),
      progressTarget: 1,
    },
    {
      id: "badge-circle-peer",
      titleKey: "b.circle.t",
      unlockedDescKey: "b.circle.u",
      lockedDescKey: "b.circle.l",
      categoryKey: "area.community",
      titleEn: "Circle Catalyst",
      titleAr: "محفّز الدائرة",
      category: "academic",
      categoryLabelEn: "Community",
      categoryLabelAr: "المجتمع",
      iconName: "Users",
      rewardXp: 100,
      unlocked: circleCount >= 1,
      progressCurrent: Math.min(circleCount, 1),
      progressTarget: 1,
    },
    {
      id: "badge-wellbeing-zen",
      titleKey: "b.zen.t",
      unlockedDescKey: "b.zen.u",
      lockedDescKey: "b.zen.l",
      categoryKey: "area.wellbeing",
      titleEn: "Balanced Mind",
      titleAr: "العقل المتوازن",
      category: "consistency",
      categoryLabelEn: "Wellbeing",
      categoryLabelAr: "الرفاه",
      iconName: "HeartPulse",
      rewardXp: 120,
      unlocked: careEntriesCount >= 1,
      progressCurrent: Math.min(careEntriesCount, 1),
      progressTarget: 1,
    },
    {
      id: "badge-scholar-tier",
      titleKey: "b.consistent.t",
      unlockedDescKey: "b.consistent.u",
      lockedDescKey: "b.consistent.l",
      categoryKey: "tier.scholar",
      titleEn: "Consistent Scholar",
      titleAr: "باحث مثابر",
      category: "mastery",
      categoryLabelEn: "Mastery",
      categoryLabelAr: "الإتقان",
      iconName: "Trophy",
      rewardXp: 250,
      unlocked: level >= 6 || (journalCount >= 3 && quizCount >= 2),
      progressCurrent: Math.min(level, 6),
      progressTarget: 6,
    },
    {
      id: "badge-productivity-titan",
      titleKey: "b.titan.t",
      unlockedDescKey: "b.titan.u",
      lockedDescKey: "b.titan.l",
      categoryKey: "area.productivity",
      titleEn: "Task Titan",
      titleAr: "عملاق الإنجاز",
      category: "productivity",
      categoryLabelEn: "Productivity",
      categoryLabelAr: "الإنتاجية",
      iconName: "Zap",
      rewardXp: 300,
      unlocked: completedTasks >= 10,
      progressCurrent: Math.min(completedTasks, 10),
      progressTarget: 10,
    },
    {
      id: "badge-luminary-grand",
      titleKey: "b.luminary.t",
      unlockedDescKey: "b.luminary.u",
      lockedDescKey: "b.luminary.l",
      categoryKey: "tier.luminary",
      titleEn: isBtcMode() ? "BTC Luminary" : "Nexora Luminary",
      titleAr: isBtcMode() ? "رائد BTC" : "رائد نيكسورا",
      category: "mastery",
      categoryLabelEn: "Mastery",
      categoryLabelAr: "الإتقان",
      iconName: "Award",
      rewardXp: 500,
      unlocked: level >= 10,
      progressCurrent: Math.min(level, 10),
      progressTarget: 10,
    },
  ];
}

export interface DomainMetricsInput {
  goals: Array<{ area: Area; status: string }>;
  events: Array<{ area: Area; xp: number }>;
  completedTasksByArea?: Partial<Record<Area, number>>;
  studyCount?: number;
  focusSessionsCount?: number;
  careCount?: number;
  futureCount?: number;
  circleCount?: number;
  journalCount?: number;
}

/**
 * Pure calculation of 0..100 Growth Map domain proficiency strictly from real activity.
 * Zero fake inflation — accounts with no activity start cleanly at 0.
 */
export function computeDomainScores(input: DomainMetricsInput): Record<Area, number> {
  const scores: Record<Area, number> = {
    academic: 0,
    productivity: 0,
    growth: 0,
    wellbeing: 0,
    career: 0,
    community: 0,
  };

  for (const g of input.goals) {
    if (scores[g.area] !== undefined) {
      scores[g.area] += g.status === "completed" ? 22 : 8;
    }
  }

  for (const ev of input.events) {
    if (scores[ev.area] !== undefined) {
      scores[ev.area] += Math.max(4, Math.round(ev.xp / 2));
    }
  }

  if (input.completedTasksByArea) {
    for (const area of AREAS) {
      scores[area] += (input.completedTasksByArea[area] ?? 0) * 10;
    }
  }

  scores.academic += Math.min((input.studyCount ?? 0) * 6, 48);
  scores.productivity += Math.min((input.focusSessionsCount ?? 0) * 10, 50);
  scores.growth += Math.min((input.journalCount ?? 0) * 8, 40);
  scores.wellbeing += Math.min((input.careCount ?? 0) * 12, 48);
  scores.career += Math.min((input.futureCount ?? 0) * 15, 45);
  scores.community += Math.min((input.circleCount ?? 0) * 20, 60);

  for (const area of AREAS) {
    scores[area] = Math.min(100, Math.max(0, Math.round(scores[area])));
  }

  return scores;
}

export interface DailyVelocityPoint {
  dateIso: string;
  labelKey: DictKey;
  xp: number;
}

const DAY_KEYS: DictKey[] = [
  "growth.days.sun",
  "growth.days.mon",
  "growth.days.tue",
  "growth.days.wed",
  "growth.days.thu",
  "growth.days.fri",
  "growth.days.sat",
];

export function compute7DayXpVelocity(
  events: Array<{ xp: number; created_at: string }>,
  today = new Date(),
): DailyVelocityPoint[] {
  const days: DailyVelocityPoint[] = [];
  const totalsByDay = new Map<string, number>();

  for (const ev of events) {
    const day = ev.created_at.slice(0, 10);
    totalsByDay.set(day, (totalsByDay.get(day) ?? 0) + (Number(ev.xp) || 0));
  }

  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(today.getTime() - offset * 86400_000);
    const iso = d.toISOString().slice(0, 10);
    const dow = d.getUTCDay();
    const labelKey: DictKey =
      offset === 0 ? "growth.days.today" : (DAY_KEYS[dow] ?? "growth.days.today");

    days.push({
      dateIso: iso,
      labelKey,
      xp: totalsByDay.get(iso) ?? 0,
    });
  }

  return days;
}

export interface WeeklyTrendPoint {
  week: string;
  weekNum: number;
  highlightKey: DictKey;
  productivity: number;
  skillAcquisition: number;
  focusHours: number;
  skillsMastered: number;
  tasksCompleted: number;
}

export interface RealTrendInput {
  events: Array<{ area: Area; xp: number; created_at: string }>;
  tasks: Array<{ status: string; completed_at: string | null; created_at: string }>;
  focusSessions?: Array<{ duration_minutes: number; created_at: string }>;
  studyItems?: Array<{ created_at: string }>;
  today?: Date;
}

export function getWeeklyGrowthTrends(realData?: RealTrendInput): WeeklyTrendPoint[] {
  if (!realData) {
    // Deterministic baseline reference trajectory (also exercised by unit tests)
    return [
      {
        week: "W1",
        weekNum: 1,
        highlightKey: "trend.w1",
        productivity: 48,
        skillAcquisition: 42,
        focusHours: 6.5,
        skillsMastered: 3,
        tasksCompleted: 4,
      },
      {
        week: "W2",
        weekNum: 2,
        highlightKey: "trend.w2",
        productivity: 58,
        skillAcquisition: 50,
        focusHours: 9.0,
        skillsMastered: 5,
        tasksCompleted: 7,
      },
      {
        week: "W3",
        weekNum: 3,
        highlightKey: "trend.w3",
        productivity: 64,
        skillAcquisition: 59,
        focusHours: 11.5,
        skillsMastered: 8,
        tasksCompleted: 9,
      },
      {
        week: "W4",
        weekNum: 4,
        highlightKey: "trend.w4",
        productivity: 72,
        skillAcquisition: 68,
        focusHours: 13.0,
        skillsMastered: 11,
        tasksCompleted: 12,
      },
      {
        week: "W5",
        weekNum: 5,
        highlightKey: "trend.w5",
        productivity: 69,
        skillAcquisition: 75,
        focusHours: 12.0,
        skillsMastered: 14,
        tasksCompleted: 10,
      },
      {
        week: "W6",
        weekNum: 6,
        highlightKey: "trend.w6",
        productivity: 81,
        skillAcquisition: 82,
        focusHours: 15.5,
        skillsMastered: 18,
        tasksCompleted: 14,
      },
      {
        week: "W7",
        weekNum: 7,
        highlightKey: "trend.w7",
        productivity: 88,
        skillAcquisition: 89,
        focusHours: 17.0,
        skillsMastered: 22,
        tasksCompleted: 16,
      },
      {
        week: "W8",
        weekNum: 8,
        highlightKey: "trend.w8",
        productivity: 94,
        skillAcquisition: 93,
        focusHours: 18.5,
        skillsMastered: 26,
        tasksCompleted: 18,
      },
    ];
  }

  const now = realData.today ?? new Date();
  const focus = realData.focusSessions ?? [];
  const study = realData.studyItems ?? [];
  const highlightKeys: DictKey[] = [
    "trend.w1",
    "trend.w2",
    "trend.w3",
    "trend.w4",
    "trend.w5",
    "trend.w6",
    "trend.w7",
    "trend.w8",
  ];

  const points: WeeklyTrendPoint[] = [];
  for (let i = 0; i < 8; i++) {
    const weeksAgo = 7 - i;
    const endMs = now.getTime() - weeksAgo * 7 * 86400_000;
    const startMs = endMs - 7 * 86400_000;

    const weekEvents = realData.events.filter((e) => {
      const ms = Date.parse(e.created_at);
      return !Number.isNaN(ms) && ms > startMs && ms <= endMs;
    });
    const weekDoneTasks = realData.tasks.filter((t) => {
      if (t.status !== "done") return false;
      const ms = Date.parse(t.completed_at ?? t.created_at);
      return !Number.isNaN(ms) && ms > startMs && ms <= endMs;
    });
    const weekFocus = focus.filter((f) => {
      const ms = Date.parse(f.created_at);
      return !Number.isNaN(ms) && ms > startMs && ms <= endMs;
    });
    const weekStudy = study.filter((s) => {
      const ms = Date.parse(s.created_at);
      return !Number.isNaN(ms) && ms > startMs && ms <= endMs;
    });

    const weekXp = weekEvents.reduce((acc, e) => acc + (Number(e.xp) || 0), 0);
    const focusMin = weekFocus.reduce((acc, f) => acc + (Number(f.duration_minutes) || 0), 0);
    const focusHours = Math.round((focusMin / 60) * 10) / 10;

    const productivity = Math.min(100, weekDoneTasks.length * 14 + Math.round(weekXp / 3));
    const skillAcquisition = Math.min(100, weekStudy.length * 12 + Math.round(weekXp / 3));

    points.push({
      week: `W${i + 1}`,
      weekNum: i + 1,
      highlightKey: highlightKeys[i] ?? "trend.w8",
      productivity,
      skillAcquisition,
      focusHours,
      skillsMastered: weekStudy.length,
      tasksCompleted: weekDoneTasks.length,
    });
  }

  return points;
}

export interface SubjectFocusStat {
  subject: string;
  minutes: number;
  sessions: number;
}

export function computeDomainFocusStats(
  sessions: Array<{ subject: string | null; duration_minutes: number }>,
): SubjectFocusStat[] {
  const map = new Map<string, { minutes: number; sessions: number }>();
  for (const s of sessions) {
    const label = s.subject?.trim() || "General";
    const prev = map.get(label) ?? { minutes: 0, sessions: 0 };
    prev.minutes += Math.max(0, Number(s.duration_minutes) || 0);
    prev.sessions += 1;
    map.set(label, prev);
  }
  return Array.from(map.entries())
    .map(([subject, stat]) => ({ subject, ...stat }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 6);
}

export interface AreaXpStat {
  area: Area;
  xp: number;
  pct: number;
}

export function computeXpAreaBreakdown(events: Array<{ area: Area; xp: number }>): AreaXpStat[] {
  const totals = new Map<Area, number>();
  let grandTotal = 0;
  for (const ev of events) {
    if (AREAS.includes(ev.area)) {
      const val = Math.max(0, Number(ev.xp) || 0);
      totals.set(ev.area, (totals.get(ev.area) ?? 0) + val);
      grandTotal += val;
    }
  }
  return AREAS.map((area) => {
    const xp = totals.get(area) ?? 0;
    return {
      area,
      xp,
      pct: grandTotal > 0 ? Math.round((xp / grandTotal) * 100) : 0,
    };
  });
}

export interface DomainScoreBreakdownItem {
  area: Area;
  goalsPoints: number;
  eventsPoints: number;
  tasksPoints: number;
  modulePoints: number;
  totalScore: number;
}

/**
 * Transparent breakdown explaining every point contributing to each domain's 0..100 score.
 */
export function computeDomainScoreBreakdown(
  input: DomainMetricsInput,
): Record<Area, DomainScoreBreakdownItem> {
  const build = (area: Area): DomainScoreBreakdownItem => ({
    area,
    goalsPoints: 0,
    eventsPoints: 0,
    tasksPoints: 0,
    modulePoints: 0,
    totalScore: 0,
  });

  const out: Record<Area, DomainScoreBreakdownItem> = {
    academic: build("academic"),
    productivity: build("productivity"),
    growth: build("growth"),
    wellbeing: build("wellbeing"),
    career: build("career"),
    community: build("community"),
  };

  for (const g of input.goals) {
    if (out[g.area]) {
      out[g.area].goalsPoints += g.status === "completed" ? 22 : 8;
    }
  }

  for (const ev of input.events) {
    if (out[ev.area]) {
      out[ev.area].eventsPoints += Math.max(4, Math.round(ev.xp / 2));
    }
  }

  if (input.completedTasksByArea) {
    for (const area of AREAS) {
      out[area].tasksPoints += (input.completedTasksByArea[area] ?? 0) * 10;
    }
  }

  out.academic.modulePoints = Math.min((input.studyCount ?? 0) * 6, 48);
  out.productivity.modulePoints = Math.min((input.focusSessionsCount ?? 0) * 10, 50);
  out.growth.modulePoints = Math.min((input.journalCount ?? 0) * 8, 40);
  out.wellbeing.modulePoints = Math.min((input.careCount ?? 0) * 12, 48);
  out.career.modulePoints = Math.min((input.futureCount ?? 0) * 15, 45);
  out.community.modulePoints = Math.min((input.circleCount ?? 0) * 20, 60);

  for (const area of AREAS) {
    const raw =
      out[area].goalsPoints +
      out[area].eventsPoints +
      out[area].tasksPoints +
      out[area].modulePoints;
    out[area].totalScore = Math.min(100, Math.max(0, Math.round(raw)));
  }

  return out;
}

export type GrowthLoopStageId = "discover" | "plan" | "act" | "reflect" | "adapt";

export interface GrowthLoopStage {
  id: GrowthLoopStageId;
  completed: boolean;
  metricCount: number;
  to: "/app/study" | "/app/tasks" | "/app" | "/app/ai";
}

export interface GrowthLoopState {
  stages: GrowthLoopStage[];
  activeStageId: GrowthLoopStageId;
  completedCount: number;
}

export function computeGrowthLoopState(params: {
  studyItemsCount: number;
  weakSignalsCount: number;
  goalsCount: number;
  openTasksCount: number;
  completedTasksCount: number;
  focusSessionsCount: number;
  quizAttemptsCount: number;
  journalCount: number;
  careCount: number;
  masteredMistakesCount: number;
}): GrowthLoopState {
  const discoverDone = params.studyItemsCount > 0 || params.weakSignalsCount > 0;
  const planDone =
    params.goalsCount > 0 || params.openTasksCount > 0 || params.completedTasksCount > 0;
  const actDone =
    params.completedTasksCount > 0 || params.focusSessionsCount > 0 || params.quizAttemptsCount > 0;
  const reflectDone = params.journalCount > 0 || params.careCount > 0;
  const adaptDone = params.masteredMistakesCount > 0 || params.quizAttemptsCount >= 2;

  const stages: GrowthLoopStage[] = [
    {
      id: "discover",
      completed: discoverDone,
      metricCount: params.studyItemsCount,
      to: "/app/study",
    },
    {
      id: "plan",
      completed: planDone,
      metricCount: params.goalsCount + params.openTasksCount,
      to: "/app/tasks",
    },
    {
      id: "act",
      completed: actDone,
      metricCount: params.completedTasksCount + params.focusSessionsCount,
      to: "/app/tasks",
    },
    {
      id: "reflect",
      completed: reflectDone,
      metricCount: params.journalCount + params.careCount,
      to: "/app",
    },
    {
      id: "adapt",
      completed: adaptDone,
      metricCount: params.masteredMistakesCount,
      to: "/app/study",
    },
  ];

  const firstPending = stages.find((s) => !s.completed);
  return {
    stages,
    activeStageId: firstPending?.id ?? "adapt",
    completedCount: stages.filter((s) => s.completed).length,
  };
}

export type SearchResultKind =
  | "task"
  | "goal"
  | "study"
  | "journal"
  | "future"
  | "opportunity"
  | "simulation"
  | "coding"
  | "creativity"
  | "civic";

export interface StudentLibrarySearchResult {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle: string;
  to:
    | "/app/tasks"
    | "/app"
    | "/app/study"
    | "/app/future"
    | "/app/opportunities"
    | "/app/level-up"
    | "/app/circle";
}

const STATIC_ECOSYSTEM_EXPERIENCES: StudentLibrarySearchResult[] = [
  {
    id: "exp:sci_lab",
    kind: "simulation",
    title: "Virtual Science Lab (Titration, Photosynthesis, Solubility)",
    subtitle: "Science Workbench #1",
    to: "/app/study",
  },
  {
    id: "exp:sci_body",
    kind: "simulation",
    title: "Human Body 3D Explorer & Systems",
    subtitle: "Science Workbench #2",
    to: "/app/study",
  },
  {
    id: "exp:sci_space",
    kind: "simulation",
    title: "Space & Solar System Explorer",
    subtitle: "Science Workbench #3",
    to: "/app/study",
  },
  {
    id: "exp:sci_mol",
    kind: "simulation",
    title: "Molecule Studio & Valence Checker",
    subtitle: "Science Workbench #4",
    to: "/app/study",
  },
  {
    id: "exp:sci_phys",
    kind: "simulation",
    title: "Physics Lab (Kinematics, Pendulum, Waves, Circuits)",
    subtitle: "Science Workbench #5",
    to: "/app/study",
  },
  {
    id: "exp:sci_earth",
    kind: "simulation",
    title: "Earth Explorer & Plate Tectonics",
    subtitle: "Science Workbench #6",
    to: "/app/study",
  },
  {
    id: "exp:math_graph",
    kind: "study",
    title: "Math Function Visualizer (Linear, Quadratic, Sine)",
    subtitle: "Math Workbench #7",
    to: "/app/study",
  },
  {
    id: "exp:math_geom",
    kind: "study",
    title: "Geometry Playground & Transforms",
    subtitle: "Math Workbench #8",
    to: "/app/study",
  },
  {
    id: "exp:math_balance",
    kind: "study",
    title: "Equation Balance Algebra Scale",
    subtitle: "Math Workbench #9",
    to: "/app/study",
  },
  {
    id: "exp:math_stats",
    kind: "study",
    title: "Statistics Studio (Mean, Median, Mode, Range)",
    subtitle: "Math Workbench #10",
    to: "/app/study",
  },
  {
    id: "exp:math_prob",
    kind: "study",
    title: "Probability Simulator (Dice, Coins, Spinners)",
    subtitle: "Math Workbench #11",
    to: "/app/study",
  },
  {
    id: "exp:math_eng",
    kind: "study",
    title: "Engineering Truss Bridge & Lever Design",
    subtitle: "Engineering Workbench #12",
    to: "/app/study",
  },
  {
    id: "exp:cr_poster",
    kind: "creativity",
    title: "Infographic & Poster Composer",
    subtitle: "Creativity Studio #13 & #18",
    to: "/app/study",
  },
  {
    id: "exp:cr_story",
    kind: "creativity",
    title: "Story World Plot Arc Planner",
    subtitle: "Creativity Studio #14",
    to: "/app/study",
  },
  {
    id: "exp:cr_anim",
    kind: "creativity",
    title: "2D Animation Workshop & Keyframes",
    subtitle: "Creativity Studio #15",
    to: "/app/study",
  },
  {
    id: "exp:cr_photo",
    kind: "creativity",
    title: "Photography Academy Exposure Triangle",
    subtitle: "Creativity Studio #16",
    to: "/app/study",
  },
  {
    id: "exp:cr_music",
    kind: "creativity",
    title: "Synthesized Piano & Web Audio Rhythm Sequencer",
    subtitle: "Creativity Studio #17",
    to: "/app/study",
  },
  {
    id: "exp:code_sandbox",
    kind: "coding",
    title: "Safe Coding Playground (Loops, Conditions, Variables)",
    subtitle: "Coding Lab #25",
    to: "/app/level-up",
  },
  {
    id: "exp:code_algo",
    kind: "coding",
    title: "Algorithm Visualizer (Bubble Sort & Binary Search)",
    subtitle: "Coding Lab #26",
    to: "/app/level-up",
  },
  {
    id: "exp:code_robot",
    kind: "coding",
    title: "Virtual Rover Robotics Grid Simulator",
    subtitle: "Coding Lab #27",
    to: "/app/level-up",
  },
  {
    id: "exp:code_cyber",
    kind: "coding",
    title: "Cyber Safety & Phishing Defense Academy",
    subtitle: "Coding Lab #28",
    to: "/app/level-up",
  },
  {
    id: "exp:code_app",
    kind: "coding",
    title: "App Design & Accessibility Contrast Audit",
    subtitle: "Coding Lab #29",
    to: "/app/level-up",
  },
  {
    id: "exp:civ_debate",
    kind: "civic",
    title: "Debate Arena & Balanced Pro/Con Breviary",
    subtitle: "Thinking Studio #20",
    to: "/app/level-up",
  },
  {
    id: "exp:civ_mun",
    kind: "civic",
    title: "Model United Nations (MUN) Diplomatic Simulator",
    subtitle: "Diplomacy Lab #37",
    to: "/app/circle",
  },
  {
    id: "exp:sci_fair",
    kind: "study",
    title: "Science Fair Investigation Planner",
    subtitle: "Future Workbench #36",
    to: "/app/future",
  },
  {
    id: "exp:com_impact",
    kind: "civic",
    title: "Supervised Community Impact Initiative Planner",
    subtitle: "Future Workbench #38",
    to: "/app/future",
  },
  {
    id: "exp:mus_world",
    kind: "study",
    title: "Virtual World Museum & Historical Artifacts",
    subtitle: "Global Discovery #30",
    to: "/app/circle",
  },
  {
    id: "exp:book_club",
    kind: "study",
    title: "Curated Reading & Book Discovery Club",
    subtitle: "Global Discovery #35",
    to: "/app/circle",
  },
];

/**
 * Unified personal search across all student modules (strictly non-clinical / no Care mood notes leaked unless explicitly in Care).
 */
export function searchStudentLibrary(
  query: string,
  sources: {
    tasks?: Array<{ id: string; title: string; subject?: string | null; status: string }>;
    goals?: Array<{ id: string; title: string; area: string; status: string }>;
    studyItems?: Array<{
      id: string;
      title: string;
      subject: string;
      kind: string;
      content: string;
    }>;
    journalEntries?: Array<{
      id: string;
      title: string;
      reflection: string;
      subject?: string | null;
    }>;
    futurePlans?: Array<{ id: string; title: string; status: string }>;
    opportunities?: Array<{ id: string; title: string; organizer: string; category: string }>;
  },
  limit = 16,
): StudentLibrarySearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: StudentLibrarySearchResult[] = [];

  for (const t of sources.tasks ?? []) {
    if (t.title.toLowerCase().includes(q) || (t.subject && t.subject.toLowerCase().includes(q))) {
      results.push({
        id: `task:${t.id}`,
        kind: "task",
        title: t.title,
        subtitle: t.subject ? `${t.subject} • ${t.status}` : t.status,
        to: "/app/tasks",
      });
    }
  }

  for (const g of sources.goals ?? []) {
    if (g.title.toLowerCase().includes(q) || g.area.toLowerCase().includes(q)) {
      results.push({
        id: `goal:${g.id}`,
        kind: "goal",
        title: g.title,
        subtitle: `${g.area} • ${g.status}`,
        to: "/app",
      });
    }
  }

  for (const s of sources.studyItems ?? []) {
    if (
      s.title.toLowerCase().includes(q) ||
      s.subject.toLowerCase().includes(q) ||
      s.content.toLowerCase().includes(q)
    ) {
      results.push({
        id: `study:${s.id}`,
        kind: "study",
        title: s.title,
        subtitle: `${s.subject} • ${s.kind}`,
        to: "/app/study",
      });
    }
  }

  for (const j of sources.journalEntries ?? []) {
    if (
      j.title.toLowerCase().includes(q) ||
      j.reflection.toLowerCase().includes(q) ||
      (j.subject && j.subject.toLowerCase().includes(q))
    ) {
      results.push({
        id: `journal:${j.id}`,
        kind: "journal",
        title: j.title,
        subtitle: j.subject || "Journal",
        to: "/app",
      });
    }
  }

  for (const f of sources.futurePlans ?? []) {
    if (f.title.toLowerCase().includes(q)) {
      results.push({
        id: `future:${f.id}`,
        kind: "future",
        title: f.title,
        subtitle: f.status,
        to: "/app/future",
      });
    }
  }

  for (const o of sources.opportunities ?? []) {
    if (
      o.title.toLowerCase().includes(q) ||
      o.organizer.toLowerCase().includes(q) ||
      o.category.toLowerCase().includes(q)
    ) {
      results.push({
        id: `opp:${o.id}`,
        kind: "opportunity",
        title: o.title,
        subtitle: `${o.organizer} • ${o.category}`,
        to: "/app/opportunities",
      });
    }
  }

  for (const exp of STATIC_ECOSYSTEM_EXPERIENCES) {
    if (exp.title.toLowerCase().includes(q) || exp.subtitle.toLowerCase().includes(q)) {
      results.push(exp);
    }
  }

  return results.slice(0, limit);
}

export interface DailyPulsePoint {
  dateIso: string;
  energy: number | null;
  stress: number | null;
  mood: string | null;
  entriesCount: number;
}

export interface WeeklyPulseSummary {
  points: DailyPulsePoint[];
  checkedInToday: boolean;
  daysCheckedLast7: number;
  avgEnergy: number | null;
  avgStress: number | null;
  avgSleep: number | null;
  dominantMood: string | null;
  insightKind: "none" | "positive" | "calm" | "rest";
}

/**
 * Computes private 7-day student mood/energy sentiment summary purely on the client.
 */
export function computeWeeklyPulseSummary(
  entries: Array<{
    mood: string;
    energy: number;
    stress_level: number;
    sleep_hours?: number | null;
    created_at: string;
  }>,
  today = new Date(),
): WeeklyPulseSummary {
  const todayIso = today.toISOString().slice(0, 10);
  const byDay = new Map<
    string,
    Array<{ mood: string; energy: number; stress_level: number; sleep_hours?: number | null }>
  >();

  for (const e of entries) {
    const day = e.created_at.slice(0, 10);
    const list = byDay.get(day) ?? [];
    list.push(e);
    byDay.set(day, list);
  }

  const points: DailyPulsePoint[] = [];
  let energySum = 0;
  let energyCount = 0;
  let stressSum = 0;
  let stressCount = 0;
  let sleepSum = 0;
  let sleepCount = 0;
  let daysCheckedLast7 = 0;
  const moodCounts = new Map<string, number>();

  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(today.getTime() - offset * 86400_000);
    const iso = d.toISOString().slice(0, 10);
    const dayEntries = byDay.get(iso) ?? [];
    if (dayEntries.length > 0) {
      daysCheckedLast7++;
      const avgE =
        Math.round((dayEntries.reduce((s, x) => s + x.energy, 0) / dayEntries.length) * 10) / 10;
      const avgS =
        Math.round((dayEntries.reduce((s, x) => s + x.stress_level, 0) / dayEntries.length) * 10) /
        10;
      const latest = dayEntries[0]!;
      for (const item of dayEntries) {
        energySum += item.energy;
        energyCount++;
        stressSum += item.stress_level;
        stressCount++;
        if (typeof item.sleep_hours === "number" && item.sleep_hours > 0) {
          sleepSum += item.sleep_hours;
          sleepCount++;
        }
        moodCounts.set(item.mood, (moodCounts.get(item.mood) ?? 0) + 1);
      }
      points.push({
        dateIso: iso,
        energy: avgE,
        stress: avgS,
        mood: latest.mood,
        entriesCount: dayEntries.length,
      });
    } else {
      points.push({
        dateIso: iso,
        energy: null,
        stress: null,
        mood: null,
        entriesCount: 0,
      });
    }
  }

  let dominantMood: string | null = null;
  let topMoodCount = 0;
  for (const [m, count] of moodCounts.entries()) {
    if (count > topMoodCount) {
      topMoodCount = count;
      dominantMood = m;
    }
  }

  const avgEnergy = energyCount > 0 ? Math.round((energySum / energyCount) * 10) / 10 : null;
  const avgStress = stressCount > 0 ? Math.round((stressSum / stressCount) * 10) / 10 : null;
  const avgSleep = sleepCount > 0 ? Math.round((sleepSum / sleepCount) * 10) / 10 : null;

  let insightKind: WeeklyPulseSummary["insightKind"] = "none";
  if (avgEnergy !== null && avgStress !== null) {
    if (avgEnergy >= 3.5 && avgStress <= 2.8) insightKind = "positive";
    else if (avgStress >= 3.5 || avgEnergy <= 2.3) insightKind = "rest";
    else insightKind = "calm";
  }

  return {
    points,
    checkedInToday: (byDay.get(todayIso)?.length ?? 0) > 0,
    daysCheckedLast7,
    avgEnergy,
    avgStress,
    avgSleep,
    dominantMood,
    insightKind,
  };
}

export interface WeeklyObjectiveCategoryState<TGoal = unknown> {
  area: Area;
  objectives: TGoal[];
  completedObjectivesCount: number;
  weeklyActivityUnits: number;
  weeklyActivityTarget: number;
  progressPct: number;
}

/**
 * Computes per-category Weekly Objectives progress bars combining active/completed goals
 * in each category with live 7-day activity across tasks, focus, study, journal, care, future, and circle.
 */
export function computeWeeklyObjectivesBoard<
  TGoal extends {
    id: string;
    area: Area;
    status: string;
    is_daily?: boolean;
    target_date?: string | null;
    milestones?: Array<{ done: boolean }>;
  },
>(params: {
  goals: TGoal[];
  tasks: Array<{ area?: Area; status: string; completed_at?: string | null; created_at: string }>;
  events: Array<{ area: Area; created_at: string }>;
  studyItemsCountRecent?: number;
  focusSessionsCountRecent?: number;
  journalCountRecent?: number;
  careCountRecent?: number;
  futureCount?: number;
  circleCount?: number;
  today?: Date;
}): Record<Area, WeeklyObjectiveCategoryState<TGoal>> {
  const now = params.today ?? new Date();
  const weekStartMs = now.getTime() - 7 * 86400_000;
  const isThisWeek = (iso: string | null | undefined): boolean => {
    if (!iso) return false;
    const ms = Date.parse(iso);
    return !Number.isNaN(ms) && ms >= weekStartMs && ms <= now.getTime() + 86400_000;
  };

  const weeklyGoals = params.goals.filter((g) => !g.is_daily);
  const doneTasksByArea: Record<Area, number> = {
    academic: 0,
    productivity: 0,
    growth: 0,
    wellbeing: 0,
    career: 0,
    community: 0,
  };
  for (const tk of params.tasks) {
    if (tk.status === "done" && isThisWeek(tk.completed_at ?? tk.created_at)) {
      const area = tk.area && AREAS.includes(tk.area) ? tk.area : "productivity";
      doneTasksByArea[area] += 1;
    }
  }

  const eventsByArea: Record<Area, number> = {
    academic: 0,
    productivity: 0,
    growth: 0,
    wellbeing: 0,
    career: 0,
    community: 0,
  };
  for (const ev of params.events) {
    if (AREAS.includes(ev.area) && isThisWeek(ev.created_at)) {
      eventsByArea[ev.area] += 1;
    }
  }

  const extraByArea: Record<Area, number> = {
    academic: params.studyItemsCountRecent ?? 0,
    productivity: params.focusSessionsCountRecent ?? 0,
    growth: params.journalCountRecent ?? 0,
    wellbeing: params.careCountRecent ?? 0,
    career: params.futureCount ?? 0,
    community: params.circleCount ?? 0,
  };

  const result = {} as Record<Area, WeeklyObjectiveCategoryState<TGoal>>;
  for (const area of AREAS) {
    const areaGoals = weeklyGoals.filter((g) => g.area === area);
    const completedGoals = areaGoals.filter((g) => g.status === "completed").length;
    const weeklyActivityUnits = doneTasksByArea[area] + extraByArea[area] + eventsByArea[area];
    const target = areaGoals.length > 0 ? Math.max(areaGoals.length * 2, 3) : 3;

    let progressPct = 0;
    if (areaGoals.length > 0) {
      let milestoneRatio = 0;
      let milestoneGoals = 0;
      for (const g of areaGoals) {
        if (g.status === "completed") {
          milestoneRatio += 1;
          milestoneGoals += 1;
        } else if (g.milestones && g.milestones.length > 0) {
          milestoneRatio += g.milestones.filter((m) => m.done).length / g.milestones.length;
          milestoneGoals += 1;
        } else {
          milestoneGoals += 1;
        }
      }
      const goalPct = milestoneGoals > 0 ? (milestoneRatio / milestoneGoals) * 60 : 0;
      const activityPct = Math.min(1, weeklyActivityUnits / target) * 40;
      progressPct = Math.min(100, Math.round(goalPct + activityPct));
    } else {
      progressPct = Math.min(100, Math.round((weeklyActivityUnits / target) * 100));
    }

    result[area] = {
      area,
      objectives: areaGoals,
      completedObjectivesCount: completedGoals,
      weeklyActivityUnits,
      weeklyActivityTarget: target,
      progressPct,
    };
  }

  return result;
}

export type HeatmapIntensity = 0 | 1 | 2 | 3 | 4;

export interface GrowthHeatmapCell {
  dateIso: string;
  weekIndex: number;
  weekLabel: string;
  dayOfWeek: number; // 0 = Sun .. 6 = Sat
  dayKey: DictKey;
  tasksCompleted: number;
  focusMinutes: number;
  studyActions: number;
  journalCount: number;
  xpEarned: number;
  activityScore: number;
  intensity: HeatmapIntensity;
  isToday: boolean;
  isFuture: boolean;
}

export interface GrowthHeatmapSummary {
  cells: GrowthHeatmapCell[];
  weeksCount: number;
  activeDays: number;
  totalTasks: number;
  totalFocusMinutes: number;
  totalXp: number;
  peakDateIso: string | null;
  peakScore: number;
  hasAnyActivity: boolean;
}

export interface GrowthHeatmapInput {
  events?: Array<{ xp: number; created_at: string }>;
  tasks?: Array<{ status: string; completed_at: string | null; created_at: string }>;
  focusSessions?: Array<{ duration_minutes: number; created_at: string }>;
  studyItems?: Array<{ created_at: string; updated_at?: string }>;
  journalEntries?: Array<{ entry_date?: string; created_at: string }>;
  weeks?: 4 | 8 | 12;
  today?: Date;
}

export function computeWeeklyProductivityHeatmap(input: GrowthHeatmapInput): GrowthHeatmapSummary {
  const weeksCount = input.weeks ?? 12;
  const ref = input.today ?? new Date();
  const todayUtc = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate()));
  const todayIso = todayUtc.toISOString().slice(0, 10);
  const todayDow = todayUtc.getUTCDay(); // 0..6 (Sun..Sat)

  // Start on Sunday of the earliest week so the grid aligns cleanly Sun -> Sat
  const endOfGridWeek = new Date(todayUtc.getTime() + (6 - todayDow) * 86400_000);
  const totalGridDays = weeksCount * 7;
  const gridStartUtc = new Date(endOfGridWeek.getTime() - (totalGridDays - 1) * 86400_000);

  const tasksMap = new Map<string, number>();
  for (const tk of input.tasks ?? []) {
    if (tk.status !== "done") continue;
    const day = (tk.completed_at || tk.created_at || "").slice(0, 10);
    if (day) tasksMap.set(day, (tasksMap.get(day) ?? 0) + 1);
  }

  const focusMap = new Map<string, number>();
  for (const fs of input.focusSessions ?? []) {
    const day = (fs.created_at || "").slice(0, 10);
    if (day)
      focusMap.set(day, (focusMap.get(day) ?? 0) + Math.max(0, Number(fs.duration_minutes) || 0));
  }

  const studyMap = new Map<string, number>();
  for (const st of input.studyItems ?? []) {
    const day = (st.updated_at || st.created_at || "").slice(0, 10);
    if (day) studyMap.set(day, (studyMap.get(day) ?? 0) + 1);
  }

  const journalMap = new Map<string, number>();
  for (const jn of input.journalEntries ?? []) {
    const day = (jn.entry_date || jn.created_at || "").slice(0, 10);
    if (day) journalMap.set(day, (journalMap.get(day) ?? 0) + 1);
  }

  const xpMap = new Map<string, number>();
  for (const ev of input.events ?? []) {
    const day = (ev.created_at || "").slice(0, 10);
    if (day) xpMap.set(day, (xpMap.get(day) ?? 0) + Math.max(0, Number(ev.xp) || 0));
  }

  const draftCells: Array<Omit<GrowthHeatmapCell, "intensity">> = [];
  let maxScore = 0;

  for (let w = 0; w < weeksCount; w++) {
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(gridStartUtc.getTime() + (w * 7 + d) * 86400_000);
      const dateIso = cellDate.toISOString().slice(0, 10);
      const isFuture = dateIso > todayIso;
      const isToday = dateIso === todayIso;

      const tasksCompleted = isFuture ? 0 : (tasksMap.get(dateIso) ?? 0);
      const focusMinutes = isFuture ? 0 : (focusMap.get(dateIso) ?? 0);
      const studyActions = isFuture ? 0 : (studyMap.get(dateIso) ?? 0);
      const journalCount = isFuture ? 0 : (journalMap.get(dateIso) ?? 0);
      const xpEarned = isFuture ? 0 : (xpMap.get(dateIso) ?? 0);

      const activityScore = isFuture
        ? 0
        : tasksCompleted * 20 +
          Math.round((focusMinutes / 25) * 18) +
          studyActions * 12 +
          journalCount * 15 +
          Math.min(40, Math.round(xpEarned / 5));

      if (activityScore > maxScore) maxScore = activityScore;

      draftCells.push({
        dateIso,
        weekIndex: w,
        weekLabel: `W${w + 1}`,
        dayOfWeek: d,
        dayKey: DAY_KEYS[d] ?? "growth.days.sun",
        tasksCompleted,
        focusMinutes,
        studyActions,
        journalCount,
        xpEarned,
        activityScore,
        isToday,
        isFuture,
      });
    }
  }

  const scaleFloor = Math.max(80, maxScore);
  let activeDays = 0;
  let totalTasks = 0;
  let totalFocusMinutes = 0;
  let totalXp = 0;
  let peakDateIso: string | null = null;
  let peakScore = 0;

  const cells: GrowthHeatmapCell[] = draftCells.map((cell) => {
    let intensity: HeatmapIntensity = 0;
    if (!cell.isFuture && cell.activityScore > 0) {
      const ratio = cell.activityScore / scaleFloor;
      if (ratio <= 0.25) intensity = 1;
      else if (ratio <= 0.5) intensity = 2;
      else if (ratio <= 0.78) intensity = 3;
      else intensity = 4;

      activeDays += 1;
      totalTasks += cell.tasksCompleted;
      totalFocusMinutes += cell.focusMinutes;
      totalXp += cell.xpEarned;
      if (cell.activityScore >= peakScore) {
        peakScore = cell.activityScore;
        peakDateIso = cell.dateIso;
      }
    }

    return {
      ...cell,
      intensity,
    };
  });

  return {
    cells,
    weeksCount,
    activeDays,
    totalTasks,
    totalFocusMinutes,
    totalXp,
    peakDateIso,
    peakScore,
    hasAnyActivity: activeDays > 0,
  };
}

export type SkillMasteryStage =
  | "not_started"
  | "activity_completed"
  | "knowledge_demonstrated"
  | "skill_improving"
  | "skill_mastered";

export interface SkillProgressionItem {
  id: string;
  label: string;
  category: "english" | "practical";
  stage: SkillMasteryStage;
  stageLabel: string;
  attemptsCount: number;
  accuracyPct: number;
  reason: string;
}

export interface BtcSkillProgressionSummary {
  items: SkillProgressionItem[];
  stageCounts: Record<SkillMasteryStage, number>;
  masteredCount: number;
}

function classifySkillStage(input: {
  attemptsCount: number;
  bestOrAvgPct: number;
  distinctSignals: number;
}): { stage: SkillMasteryStage; stageLabel: string } {
  if (input.attemptsCount <= 0) {
    return { stage: "not_started", stageLabel: "Not Started" };
  }
  // Strictly block Skill Mastered after only 1 attempt: requires >= 2 attempts & >= 80% verified performance
  if (input.attemptsCount >= 2 && input.distinctSignals >= 2 && input.bestOrAvgPct >= 80) {
    return { stage: "skill_mastered", stageLabel: "Skill Mastered" };
  }
  if (input.attemptsCount >= 2 || input.bestOrAvgPct >= 75) {
    if (input.attemptsCount >= 2 && input.bestOrAvgPct >= 65) {
      return { stage: "skill_improving", stageLabel: "Skill Improving" };
    }
    return { stage: "knowledge_demonstrated", stageLabel: "Knowledge Demonstrated" };
  }
  return { stage: "activity_completed", stageLabel: "Activity Completed" };
}

export function computeBtcSkillProgression(input: {
  listeningScores: Record<string, number>;
  readingScores: Record<string, number>;
  grammarScores: Record<string, number>;
  writingRevisions: Array<{ latestScorePct: number; revisionCount: number }>;
  speakingCount: number;
  vocabProgressList: Array<{ status: string; correctCount: number; attemptCount: number }>;
  typingSessions: Array<{ wpm: number; accuracyPct: number }>;
  masteredPathStepsCount: number;
}): BtcSkillProgressionSummary {
  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const lstVals = Object.values(input.listeningScores);
  const rdVals = Object.values(input.readingScores);
  const grVals = Object.values(input.grammarScores);
  const wrtAttempts = input.writingRevisions.reduce(
    (sum, r) => sum + 1 + Math.max(0, r.revisionCount),
    0,
  );
  const wrtAvg = avg(input.writingRevisions.map((r) => r.latestScorePct));

  const vocabMastered = input.vocabProgressList.filter((v) => v.status === "mastered").length;
  const vocabAttempts = input.vocabProgressList.reduce((s, v) => s + v.attemptCount, 0);
  const vocabAccuracy =
    vocabAttempts > 0
      ? Math.round(
          (input.vocabProgressList.reduce((s, v) => s + v.correctCount, 0) / vocabAttempts) * 100,
        )
      : 0;

  const typingAvgAcc = avg(input.typingSessions.map((t) => t.accuracyPct));

  const rawItems: Array<{
    id: string;
    label: string;
    category: "english" | "practical";
    attemptsCount: number;
    bestOrAvgPct: number;
    distinctSignals: number;
    reason: string;
  }> = [
    {
      id: "en_listening",
      label: "Listening Comprehension",
      category: "english",
      attemptsCount: lstVals.length,
      bestOrAvgPct: avg(lstVals),
      distinctSignals: lstVals.filter((s) => s >= 75).length,
      reason: `${lstVals.length} audio drill(s) · avg ${avg(lstVals)}%`,
    },
    {
      id: "en_reading",
      label: "Reading & Inference",
      category: "english",
      attemptsCount: rdVals.length,
      bestOrAvgPct: avg(rdVals),
      distinctSignals: rdVals.filter((s) => s >= 75).length,
      reason: `${rdVals.length} reading check(s) · avg ${avg(rdVals)}%`,
    },
    {
      id: "en_writing",
      label: "Writing & Revision",
      category: "english",
      attemptsCount: wrtAttempts,
      bestOrAvgPct: wrtAvg,
      distinctSignals:
        input.writingRevisions.filter((w) => w.revisionCount >= 1).length + (wrtAvg >= 80 ? 1 : 0),
      reason: `${input.writingRevisions.length} draft(s), ${wrtAttempts} cycle(s) · ${wrtAvg}%`,
    },
    {
      id: "en_vocab",
      label: "Vocabulary & Unit 3",
      category: "english",
      attemptsCount: input.vocabProgressList.length,
      bestOrAvgPct: vocabAccuracy,
      distinctSignals: vocabMastered >= 3 ? 2 : vocabMastered >= 1 ? 1 : 0,
      reason: `${vocabMastered} mastered words · ${vocabAttempts} checks`,
    },
    {
      id: "en_grammar",
      label: "Grammar Control",
      category: "english",
      attemptsCount: grVals.length,
      bestOrAvgPct: avg(grVals),
      distinctSignals: grVals.filter((s) => s >= 80).length,
      reason: `${grVals.length} topic quiz(zes) · avg ${avg(grVals)}%`,
    },
    {
      id: "en_speaking",
      label: "Speaking & PREP",
      category: "english",
      attemptsCount: input.speakingCount,
      bestOrAvgPct: input.speakingCount >= 3 ? 85 : input.speakingCount >= 1 ? 75 : 0,
      distinctSignals: input.speakingCount,
      reason: `${input.speakingCount} guided practice session(s)`,
    },
    {
      id: "pr_typing",
      label: "Desktop & Touch Typing",
      category: "practical",
      attemptsCount: input.typingSessions.length,
      bestOrAvgPct: typingAvgAcc,
      distinctSignals: input.typingSessions.filter((t) => t.accuracyPct >= 90).length,
      reason: `${input.typingSessions.length} completed drill(s) · ${typingAvgAcc}% acc`,
    },
    {
      id: "pr_paths",
      label: "Adaptive Path Milestones",
      category: "practical",
      attemptsCount: input.masteredPathStepsCount,
      bestOrAvgPct:
        input.masteredPathStepsCount >= 3 ? 85 : input.masteredPathStepsCount >= 1 ? 75 : 0,
      distinctSignals: input.masteredPathStepsCount,
      reason: `${input.masteredPathStepsCount} verified mastery checkpoint(s)`,
    },
  ];

  const items: SkillProgressionItem[] = rawItems.map((row) => {
    const { stage, stageLabel } = classifySkillStage(row);
    return {
      id: row.id,
      label: row.label,
      category: row.category,
      stage,
      stageLabel,
      attemptsCount: row.attemptsCount,
      accuracyPct: row.bestOrAvgPct,
      reason: row.reason,
    };
  });

  const stageCounts: Record<SkillMasteryStage, number> = {
    not_started: 0,
    activity_completed: 0,
    knowledge_demonstrated: 0,
    skill_improving: 0,
    skill_mastered: 0,
  };
  for (const item of items) {
    stageCounts[item.stage] += 1;
  }

  return {
    items,
    stageCounts,
    masteredCount: stageCounts.skill_mastered,
  };
}
