import type { TaskRow } from "@/lib/firestore-data";

export interface PlannerSubjectInput {
  id: string;
  subject: string;
  examDateIso: string; // YYYY-MM-DD or ""
  difficulty: "foundation" | "medium" | "challenging";
  priorityTopic: string;
}

export interface SmartPlannerConfig {
  subjects: PlannerSubjectInput[];
  dailyMinutes: number;
  preferredTime: "morning" | "afternoon" | "evening";
  commitmentsNote: string; // e.g. "Friday family lunch, Tuesday football"
  blockedWeekdays: number[]; // 0=Sun..6=Sat
}

export interface SmartStudyBlock {
  id: string;
  dayIso: string;
  dayLabel: string;
  timeWindow: string;
  subject: string;
  topic: string;
  durationMin: number;
  priority: "high" | "medium" | "low";
  rationale: string;
  status: "planned" | "completed" | "missed";
}

const TIME_WINDOW_LABELS: Record<SmartPlannerConfig["preferredTime"], string> = {
  morning: "07:30 – 09:00 AM",
  afternoon: "04:00 – 06:00 PM",
  evening: "07:30 – 09:30 PM",
};

const DIFFICULTY_WEIGHT: Record<PlannerSubjectInput["difficulty"], number> = {
  foundation: 1,
  medium: 1.4,
  challenging: 1.9,
};

export function defaultSmartPlannerConfig(now = new Date()): SmartPlannerConfig {
  const in5Days = new Date(now.getTime() + 5 * 86_400_000).toISOString().slice(0, 10);
  const in9Days = new Date(now.getTime() + 9 * 86_400_000).toISOString().slice(0, 10);
  return {
    subjects: [
      {
        id: "sub_en",
        subject: "English",
        examDateIso: in5Days,
        difficulty: "medium",
        priorityTopic: "Unit 3 Vocabulary & Cohesion",
      },
      {
        id: "sub_math",
        subject: "Mathematics",
        examDateIso: in9Days,
        difficulty: "challenging",
        priorityTopic: "Ratios & Linear Equations",
      },
    ],
    dailyMinutes: 60,
    preferredTime: "afternoon",
    commitmentsNote: "Friday family rest block",
    blockedWeekdays: [5], // Friday lighter/rest by default, student-editable
  };
}

export function generateSmartStudyPlan(
  config: SmartPlannerConfig,
  pendingTasks: TaskRow[] = [],
  now = new Date(),
  daysAhead = 7,
): {
  blocks: SmartStudyBlock[];
  dailyCapUsedMin: number;
  reassuranceNote: string;
} {
  const safeDailyMin = Math.max(20, Math.min(240, Math.round(config.dailyMinutes || 60)));
  const blockedSet = new Set(config.blockedWeekdays);
  const activeSubjects =
    config.subjects.length > 0
      ? config.subjects
      : [
          {
            id: "sub_general",
            subject: "General Review",
            examDateIso: "",
            difficulty: "medium" as const,
            priorityTopic: "Core Active Recall",
          },
        ];

  const todayMs = Date.parse(now.toISOString().slice(0, 10));

  // Score subjects by exam proximity + difficulty + matching open tasks
  const scoredSubjects = activeSubjects.map((sub) => {
    const examMs = sub.examDateIso ? Date.parse(sub.examDateIso) : Number.NaN;
    const daysToExam = Number.isNaN(examMs)
      ? 21
      : Math.max(1, Math.ceil((examMs - todayMs) / 86_400_000));
    const urgencyScore = Math.max(1, 24 - Math.min(22, daysToExam));
    const taskBoost = pendingTasks.filter(
      (t) => t.status !== "done" && t.title.toLowerCase().includes(sub.subject.toLowerCase()),
    ).length;

    const totalWeight = urgencyScore * DIFFICULTY_WEIGHT[sub.difficulty] + taskBoost * 3;

    const rationale = !Number.isNaN(examMs)
      ? `Exam in ${daysToExam}d · ${sub.difficulty} difficulty weighting`
      : `${sub.difficulty[0]!.toUpperCase() + sub.difficulty.slice(1)} priority focus`;

    return { sub, daysToExam, totalWeight, rationale };
  });

  scoredSubjects.sort((a, b) => b.totalWeight - a.totalWeight);

  const blocks: SmartStudyBlock[] = [];
  const slotsPerDay = safeDailyMin >= 90 ? 2 : 1;
  const blockMinutes = Math.max(20, Math.min(45, Math.round(safeDailyMin / slotsPerDay)));

  let rotationCursor = 0;

  for (let d = 0; d < daysAhead; d++) {
    const dayDate = new Date(todayMs + d * 86_400_000);
    const weekday = dayDate.getUTCDay();
    if (blockedSet.has(weekday)) continue;

    const dayIso = dayDate.toISOString().slice(0, 10);
    const dayLabel =
      d === 0
        ? "Today"
        : d === 1
          ? "Tomorrow"
          : dayDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            });

    for (let slot = 0; slot < slotsPerDay; slot++) {
      // Favor highest urgency first, rotating through subjects smoothly
      const pick = scoredSubjects[(rotationCursor + slot) % scoredSubjects.length]!;
      const isUrgent = pick.daysToExam <= 5 || pick.sub.difficulty === "challenging";

      blocks.push({
        id: `blk_${dayIso}_${slot}_${pick.sub.id}`,
        dayIso,
        dayLabel,
        timeWindow: TIME_WINDOW_LABELS[config.preferredTime],
        subject: pick.sub.subject,
        topic: pick.sub.priorityTopic || `${pick.sub.subject} Active Retrieval`,
        durationMin: blockMinutes,
        priority: isUrgent ? "high" : "medium",
        rationale: `${pick.rationale}${slot === 0 ? " · Balanced within daily limit" : " · Second spaced focus block"}`,
        status: "planned",
      });
    }
    rotationCursor += 1;
  }

  return {
    blocks,
    dailyCapUsedMin: slotsPerDay * blockMinutes,
    reassuranceNote:
      "Schedule caps daily study comfortably within your available time and leaves committed rest days untouched. Missing any block triggers a calm rebalance—never guilt.",
  };
}

export function rebalanceMissedSessions(
  currentBlocks: SmartStudyBlock[],
  dailyCapMin = 60,
  now = new Date(),
): {
  updatedBlocks: SmartStudyBlock[];
  movedCount: number;
  message: string;
} {
  const missed = currentBlocks.filter((b) => b.status === "missed");
  if (missed.length === 0) {
    return {
      updatedBlocks: currentBlocks,
      movedCount: 0,
      message: "No missed sessions found—your study rhythm is completely up to date.",
    };
  }

  const todayIso = now.toISOString().slice(0, 10);
  const kept = currentBlocks.filter((b) => b.status !== "missed");
  const maxPerDay = Math.max(1, Math.floor(Math.max(30, dailyCapMin) / 30));

  const dayLoads = new Map<string, number>();
  for (const b of kept) {
    dayLoads.set(b.dayIso, (dayLoads.get(b.dayIso) ?? 0) + 1);
  }

  const rescheduled: SmartStudyBlock[] = [];
  let searchOffset = 1; // Start tomorrow to avoid cramming tonight

  for (const item of missed) {
    while (searchOffset < 21) {
      const targetDate = new Date(Date.parse(todayIso) + searchOffset * 86_400_000);
      const iso = targetDate.toISOString().slice(0, 10);
      const curLoad = dayLoads.get(iso) ?? 0;
      if (curLoad < maxPerDay) {
        dayLoads.set(iso, curLoad + 1);
        rescheduled.push({
          ...item,
          id: `${item.id}_reb_${iso}`,
          dayIso: iso,
          dayLabel:
            searchOffset === 1
              ? "Tomorrow (Rebalanced)"
              : `${targetDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                })} (Rebalanced)`,
          status: "planned",
          rationale: `Smoothly shifted forward from ${item.dayLabel} without overloading any single day`,
        });
        break;
      }
      searchOffset += 1;
    }
  }

  const updatedBlocks = [...kept, ...rescheduled].sort((a, b) => a.dayIso.localeCompare(b.dayIso));

  return {
    updatedBlocks,
    movedCount: rescheduled.length,
    message: `Calmly redistributed ${rescheduled.length} missed session${rescheduled.length === 1 ? "" : "s"} across upcoming open days so nothing piles up tonight.`,
  };
}

export interface BackgroundPlanResult {
  blocks: SmartStudyBlock[];
  dailyCapUsedMin: number;
  reassuranceNote: string;
  engine: "web_worker" | "async_background";
}

export async function computeSmartStudyPlanInBackground(
  config: SmartPlannerConfig,
  pendingTasks: TaskRow[] = [],
): Promise<BackgroundPlanResult> {
  if (typeof window !== "undefined" && typeof Worker !== "undefined") {
    try {
      return await new Promise<BackgroundPlanResult>((resolve, reject) => {
        const requestId = `plan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const worker = new Worker(new URL("../workers/study-planner.worker.ts", import.meta.url), {
          type: "module",
        });
        const timer = window.setTimeout(() => {
          worker.terminate();
          reject(new Error("worker_timeout"));
        }, 2500);

        worker.onmessage = (
          e: MessageEvent<{ requestId: string; result: Omit<BackgroundPlanResult, "engine"> }>,
        ) => {
          if (e.data?.requestId !== requestId) return;
          window.clearTimeout(timer);
          worker.terminate();
          resolve({ ...e.data.result, engine: "web_worker" });
        };

        worker.onerror = () => {
          window.clearTimeout(timer);
          worker.terminate();
          reject(new Error("worker_error"));
        };

        worker.postMessage({ requestId, type: "generate", config, pendingTasks });
      });
    } catch {
      /* fallback cleanly to async microtask/timer background execution */
    }
  }

  return await new Promise<BackgroundPlanResult>((resolve) => {
    setTimeout(() => {
      const res = generateSmartStudyPlan(config, pendingTasks);
      resolve({ ...res, engine: "async_background" });
    }, 0);
  });
}

export async function rebalanceMissedSessionsInBackground(
  currentBlocks: SmartStudyBlock[],
  dailyCapMin = 60,
): Promise<{
  updatedBlocks: SmartStudyBlock[];
  movedCount: number;
  message: string;
  engine: "web_worker" | "async_background";
}> {
  if (typeof window !== "undefined" && typeof Worker !== "undefined") {
    try {
      return await new Promise((resolve, reject) => {
        const requestId = `reb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const worker = new Worker(new URL("../workers/study-planner.worker.ts", import.meta.url), {
          type: "module",
        });
        const timer = window.setTimeout(() => {
          worker.terminate();
          reject(new Error("worker_timeout"));
        }, 2500);

        worker.onmessage = (
          e: MessageEvent<{
            requestId: string;
            result: ReturnType<typeof rebalanceMissedSessions>;
          }>,
        ) => {
          if (e.data?.requestId !== requestId) return;
          window.clearTimeout(timer);
          worker.terminate();
          resolve({ ...e.data.result, engine: "web_worker" });
        };

        worker.onerror = () => {
          window.clearTimeout(timer);
          worker.terminate();
          reject(new Error("worker_error"));
        };

        worker.postMessage({ requestId, type: "rebalance", currentBlocks, dailyCapMin });
      });
    } catch {
      /* fallback cleanly */
    }
  }

  return await new Promise((resolve) => {
    setTimeout(() => {
      const res = rebalanceMissedSessions(currentBlocks, dailyCapMin);
      resolve({ ...res, engine: "async_background" });
    }, 0);
  });
}

export async function loadSmartStudyPlanFromFirestore(userId: string): Promise<{
  config: SmartPlannerConfig;
  blocks: SmartStudyBlock[];
  engine?: string;
  updatedAt?: string;
} | null> {
  if (!userId) return null;
  const { doc: fsDoc, getDoc } = await import("firebase/firestore");
  const { db, handleFirestoreError, OperationType } = await import("@/lib/firebase");
  if (!db) return null;

  const path = `smart_study_plans/${userId}`;
  try {
    const snap = await getDoc(fsDoc(db, "smart_study_plans", userId));
    if (!snap.exists()) return null;
    const data = snap.data() as {
      daily_minutes?: number;
      preferred_time?: SmartPlannerConfig["preferredTime"];
      commitments_note?: string;
      blocked_weekdays?: number[];
      subjects?: PlannerSubjectInput[];
      blocks?: SmartStudyBlock[];
      engine?: string;
      updated_at?: string;
    };
    return {
      config: {
        dailyMinutes: Number(data.daily_minutes ?? 60),
        preferredTime: data.preferred_time ?? "afternoon",
        commitmentsNote: String(data.commitments_note ?? ""),
        blockedWeekdays: Array.isArray(data.blocked_weekdays) ? data.blocked_weekdays : [5],
        subjects: Array.isArray(data.subjects)
          ? data.subjects
          : defaultSmartPlannerConfig().subjects,
      },
      blocks: Array.isArray(data.blocks) ? data.blocks : [],
      ...(data.engine ? { engine: data.engine } : {}),
      ...(data.updated_at ? { updatedAt: data.updated_at } : {}),
    };
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.GET, path);
    } catch {
      return null;
    }
  }
  return null;
}

export async function saveSmartStudyPlanToFirestore(params: {
  userId: string;
  config: SmartPlannerConfig;
  blocks: SmartStudyBlock[];
  engine?: string;
}): Promise<boolean> {
  if (!params.userId) return false;
  const { doc: fsDoc, setDoc } = await import("firebase/firestore");
  const { db, handleFirestoreError, OperationType } = await import("@/lib/firebase");
  if (!db) return false;

  const path = `smart_study_plans/${params.userId}`;
  try {
    await setDoc(fsDoc(db, "smart_study_plans", params.userId), {
      user_id: params.userId,
      daily_minutes: Math.max(15, Math.min(360, Math.round(params.config.dailyMinutes))),
      preferred_time: params.config.preferredTime,
      commitments_note: (params.config.commitmentsNote || "").slice(0, 300),
      blocked_weekdays: params.config.blockedWeekdays.slice(0, 7),
      subjects: params.config.subjects.slice(0, 16),
      blocks: params.blocks.slice(0, 40),
      engine: (params.engine || "async_background").slice(0, 40),
      updated_at: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, path);
    } catch {
      return false;
    }
  }
  return false;
}

export interface DailyStudyProgressSummary {
  targetDayIso: string;
  targetMinutes: number;
  plannedMinutes: number;
  completedFocusMinutes: number;
  completedBlockMinutes: number;
  completedMinutes: number;
  remainingMinutes: number;
  pct: number;
  focusSessionsCount: number;
  completedBlocksCount: number;
  plannedBlocksCount: number;
}

export function summarizeDailyStudyProgress(params: {
  blocks: SmartStudyBlock[];
  focusSessions: Array<{ duration_minutes: number; completed?: boolean; created_at: string }>;
  targetMinutes: number;
  targetDayIso?: string;
}): DailyStudyProgressSummary {
  const targetDayIso = params.targetDayIso || new Date().toISOString().slice(0, 10);
  const safeTargetMin = Math.max(15, Math.min(480, Math.round(params.targetMinutes || 60)));

  const dayBlocks = params.blocks.filter((b) => b.dayIso === targetDayIso);
  const plannedMinutes = dayBlocks.reduce((acc, b) => acc + Math.max(0, b.durationMin || 0), 0);
  const completedBlocks = dayBlocks.filter((b) => b.status === "completed");
  const completedBlockMinutes = completedBlocks.reduce(
    (acc, b) => acc + Math.max(0, b.durationMin || 0),
    0,
  );

  const dayFocus = params.focusSessions.filter(
    (s) => s.completed !== false && s.created_at.slice(0, 10) === targetDayIso,
  );
  const completedFocusMinutes = dayFocus.reduce(
    (acc, s) => acc + Math.max(0, s.duration_minutes || 0),
    0,
  );

  const completedMinutes = completedFocusMinutes + completedBlockMinutes;
  const remainingMinutes = Math.max(0, safeTargetMin - completedMinutes);
  const pct = Math.min(100, Math.round((completedMinutes / safeTargetMin) * 100));

  return {
    targetDayIso,
    targetMinutes: safeTargetMin,
    plannedMinutes,
    completedFocusMinutes,
    completedBlockMinutes,
    completedMinutes,
    remainingMinutes,
    pct,
    focusSessionsCount: dayFocus.length,
    completedBlocksCount: completedBlocks.length,
    plannedBlocksCount: dayBlocks.filter((b) => b.status === "planned").length,
  };
}

export function createManualStudyBlock(params: {
  dayIso: string;
  timeWindow?: string;
  subject: string;
  topic: string;
  durationMin: number;
  priority?: SmartStudyBlock["priority"];
}): SmartStudyBlock {
  const cleanDay = /^\d{4}-\d{2}-\d{2}$/.test(params.dayIso)
    ? params.dayIso
    : new Date().toISOString().slice(0, 10);
  const parsed = new Date(`${cleanDay}T12:00:00Z`);
  const todayIso = new Date().toISOString().slice(0, 10);
  const tomorrowIso = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  const dayLabel =
    cleanDay === todayIso
      ? "Today"
      : cleanDay === tomorrowIso
        ? "Tomorrow"
        : Number.isNaN(parsed.getTime())
          ? cleanDay
          : parsed.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            });

  const durationMin = Math.max(10, Math.min(180, Math.round(params.durationMin || 30)));
  return {
    id: `blk_manual_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    dayIso: cleanDay,
    dayLabel,
    timeWindow: (params.timeWindow || "05:00 – 05:45 PM").slice(0, 40),
    subject: params.subject.trim().slice(0, 60) || "General Study",
    topic: params.topic.trim().slice(0, 120) || "Focused Session",
    durationMin,
    priority: params.priority ?? "medium",
    rationale: "Custom planned study session",
    status: "planned",
  };
}

export interface PlannedVsCompletedDayCell {
  dayIso: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  plannedMinutes: number;
  completedMinutes: number;
  blocks: SmartStudyBlock[];
  focusSessions: Array<{
    id: string;
    title: string;
    subject: string | null;
    duration_minutes: number;
  }>;
}

export function summarizePlannedVsCompletedByMonth(params: {
  monthDate: Date;
  blocks: SmartStudyBlock[];
  focusSessions: Array<{
    id: string;
    title: string;
    subject: string | null;
    duration_minutes: number;
    completed?: boolean;
    created_at: string;
  }>;
}): PlannedVsCompletedDayCell[] {
  const year = params.monthDate.getFullYear();
  const month = params.monthDate.getMonth();
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const startDow = firstOfMonth.getUTCDay(); // 0=Sun..6=Sat
  const gridStart = new Date(firstOfMonth.getTime() - startDow * 86_400_000);

  const cells: PlannedVsCompletedDayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart.getTime() + i * 86_400_000);
    const dayIso = d.toISOString().slice(0, 10);
    const inCurrentMonth = d.getUTCMonth() === month;
    const dayBlocks = params.blocks.filter((b) => b.dayIso === dayIso);
    const dayFocus = params.focusSessions.filter(
      (s) => s.completed !== false && s.created_at.slice(0, 10) === dayIso,
    );
    const plannedMinutes = dayBlocks.reduce((acc, b) => acc + Math.max(0, b.durationMin || 0), 0);
    const completedBlockMin = dayBlocks
      .filter((b) => b.status === "completed")
      .reduce((acc, b) => acc + Math.max(0, b.durationMin || 0), 0);
    const completedFocusMin = dayFocus.reduce(
      (acc, s) => acc + Math.max(0, s.duration_minutes || 0),
      0,
    );
    cells.push({
      dayIso,
      dayNumber: d.getUTCDate(),
      inCurrentMonth,
      plannedMinutes,
      completedMinutes: completedBlockMin + completedFocusMin,
      blocks: dayBlocks,
      focusSessions: dayFocus.map((s) => ({
        id: s.id,
        title: s.title,
        subject: s.subject,
        duration_minutes: s.duration_minutes,
      })),
    });
  }
  return cells;
}
