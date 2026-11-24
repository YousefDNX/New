import { getMilestones, type Milestone } from "@/lib/growth";

export interface MilestoneProgressStats {
  academicCount: number;
  academicTotal: number;
  personalCount: number;
  personalTotal: number;
  overallCount: number;
  overallTotal: number;
  overallPercentage: number;
  nextMilestone: Milestone | null;
}

export type MilestoneTierName = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface MilestoneTierInfo {
  tier: MilestoneTierName;
  nameEn: string;
  nameAr: string;
  badge: string;
  minPct: number;
  colorClass: string;
  strokeClass: string;
}

export const MILESTONE_TIERS: readonly MilestoneTierInfo[] = [
  {
    tier: "bronze",
    nameEn: "Bronze Scholar",
    nameAr: "باحث برونزي",
    badge: "🥉",
    minPct: 0,
    colorClass: "text-amber-700 dark:text-amber-500",
    strokeClass: "stroke-amber-700/80 dark:stroke-amber-500/80",
  },
  {
    tier: "silver",
    nameEn: "Silver Pioneer",
    nameAr: "رائد فضي",
    badge: "🥈",
    minPct: 25,
    colorClass: "text-slate-400 dark:text-slate-300",
    strokeClass: "stroke-slate-400 dark:stroke-slate-300",
  },
  {
    tier: "gold",
    nameEn: "Gold Achiever",
    nameAr: "منجز ذهبي",
    badge: "🥇",
    minPct: 50,
    colorClass: "text-yellow-500 dark:text-yellow-400",
    strokeClass: "stroke-yellow-500 dark:stroke-yellow-400",
  },
  {
    tier: "platinum",
    nameEn: "Platinum Luminary",
    nameAr: "متميز بلاتيني",
    badge: "💠",
    minPct: 75,
    colorClass: "text-cyan-500 dark:text-cyan-400",
    strokeClass: "stroke-cyan-500 dark:stroke-cyan-400",
  },
  {
    tier: "diamond",
    nameEn: "Master Luminary",
    nameAr: "خبير ماسي",
    badge: "👑",
    minPct: 100,
    colorClass: "text-primary",
    strokeClass: "stroke-primary",
  },
];

export function getMilestoneTier(percentage: number): MilestoneTierInfo {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  if (clamped >= 100) return MILESTONE_TIERS[4]!;
  if (clamped >= 75) return MILESTONE_TIERS[3]!;
  if (clamped >= 50) return MILESTONE_TIERS[2]!;
  if (clamped >= 25) return MILESTONE_TIERS[1]!;
  return MILESTONE_TIERS[0]!;
}

export function computeMilestoneProgress(params: {
  level: number;
  completedTasks: number;
  completedGoals: number;
  studyItemsCount: number;
  focusSessionsCount: number;
}): MilestoneProgressStats {
  const { level, completedTasks, completedGoals, studyItemsCount, focusSessionsCount } = params;

  // Level milestones (6 progressive milestones from getMilestones)
  const levelMilestones = getMilestones(level);
  const unlockedLevelCount = levelMilestones.filter((m) => m.unlocked).length;
  const nextMilestone = levelMilestones.find((m) => !m.unlocked) ?? null;

  // Academic criteria milestones:
  // 1. First Task Done
  // 2. 5 Tasks Done
  // 3. 15 Tasks Done
  // 4. Study items created (>= 3)
  // 5. Level 3 reached
  // 6. Level 5 reached
  const academicChecks = [
    completedTasks >= 1,
    completedTasks >= 5,
    completedTasks >= 15,
    studyItemsCount >= 3,
    level >= 3,
    level >= 5,
  ];
  const academicCount = academicChecks.filter(Boolean).length;
  const academicTotal = academicChecks.length;

  // Personal growth & wellbeing criteria milestones:
  // 1. First Goal Done
  // 2. 3 Goals Done
  // 3. 5 Goals Done
  // 4. Focus session logged (>= 1)
  // 5. 3 Focus sessions logged
  // 6. Level milestone 1+
  const personalChecks = [
    completedGoals >= 1,
    completedGoals >= 3,
    completedGoals >= 5,
    focusSessionsCount >= 1,
    focusSessionsCount >= 3,
    unlockedLevelCount >= 2,
  ];
  const personalCount = personalChecks.filter(Boolean).length;
  const personalTotal = personalChecks.length;

  const overallCount = academicCount + personalCount;
  const overallTotal = academicTotal + personalTotal;
  const overallPercentage = overallTotal > 0 ? Math.round((overallCount / overallTotal) * 100) : 0;

  return {
    academicCount,
    academicTotal,
    personalCount,
    personalTotal,
    overallCount,
    overallTotal,
    overallPercentage,
    nextMilestone,
  };
}
