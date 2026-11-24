import type { StudyItemRow, TaskRow } from "./firestore-data";

export type RecoveryPace = "gentle" | "steady" | "focused";

export interface RecoveryPlanStep {
  taskId: string;
  title: string;
  priority: "low" | "medium" | "high";
  originalDueAt: string | null;
  newDueAt: string;
  dayOffset: number;
  dayLabel: string;
}

export interface RecoveryAssessment {
  overdueTasks: TaskRow[];
  dueFlashcardsCount: number;
  openMistakesCount: number;
  needsRecovery: boolean;
  headline: string;
  reassurance: string;
}

const PACE_CAPACITY: Record<RecoveryPace, { maxTasksPerDay: number; minutesLabel: string }> = {
  gentle: { maxTasksPerDay: 1, minutesLabel: "15 min/day" },
  steady: { maxTasksPerDay: 2, minutesLabel: "30 min/day" },
  focused: { maxTasksPerDay: 3, minutesLabel: "45 min/day" },
};

export function assessLearningBacklog(params: {
  tasks: TaskRow[];
  studyItems: StudyItemRow[];
  currentStreak?: number;
  now?: Date;
}): RecoveryAssessment {
  const now = params.now ?? new Date();
  const todayIso = now.toISOString().slice(0, 10);

  const overdueTasks = params.tasks
    .filter((t) => t.status !== "done" && t.due_at && t.due_at.slice(0, 10) < todayIso)
    .sort((a, b) => {
      const pScore = (p: string) => (p === "high" ? 3 : p === "medium" ? 2 : 1);
      return pScore(b.priority) - pScore(a.priority);
    });

  const dueFlashcardsCount = params.studyItems.filter(
    (s) =>
      s.kind === "flashcard" && (!s.next_review_at || s.next_review_at.slice(0, 10) <= todayIso),
  ).length;

  const openMistakesCount = params.studyItems.filter(
    (s) => s.kind === "mistake" && s.mistake_status !== "mastered",
  ).length;

  const needsRecovery =
    overdueTasks.length >= 2 ||
    dueFlashcardsCount >= 8 ||
    (overdueTasks.length >= 1 && (params.currentStreak ?? 0) === 0);

  return {
    overdueTasks,
    dueFlashcardsCount,
    openMistakesCount,
    needsRecovery,
    headline:
      overdueTasks.length > 0
        ? `Ready for a calm restart? You have ${overdueTasks.length} overdue task${overdueTasks.length === 1 ? "" : "s"} waiting.`
        : "Build a steady, low-pressure study rhythm.",
    reassurance:
      "Missing a few days happens to every student. Instead of cramming everything tonight, let's spread tasks gently across the next few days and pick one small win for today.",
  };
}

export function buildRecoverySchedule(params: {
  overdueTasks: TaskRow[];
  pace: RecoveryPace;
  now?: Date;
}): {
  steps: RecoveryPlanStep[];
  paceSummary: string;
  firstTinyWin: RecoveryPlanStep | null;
} {
  const now = params.now ?? new Date();
  const capacity = PACE_CAPACITY[params.pace];
  const steps: RecoveryPlanStep[] = [];

  params.overdueTasks.forEach((task, idx) => {
    const dayOffset = Math.floor(idx / capacity.maxTasksPerDay);
    const targetDate = new Date(now.getTime() + dayOffset * 86400_000);
    const isoDate = targetDate.toISOString().slice(0, 10);
    const dayLabel =
      dayOffset === 0
        ? "Today (Small Win)"
        : dayOffset === 1
          ? "Tomorrow"
          : `In ${dayOffset} days (${isoDate})`;

    steps.push({
      taskId: task.id,
      title: task.title,
      priority: task.priority,
      originalDueAt: task.due_at,
      newDueAt: `${isoDate}T18:00:00.000Z`,
      dayOffset,
      dayLabel,
    });
  });

  return {
    steps,
    paceSummary: `${capacity.minutesLabel} (${capacity.maxTasksPerDay} task${capacity.maxTasksPerDay === 1 ? "" : "s"}/day)`,
    firstTinyWin: steps[0] ?? null,
  };
}
