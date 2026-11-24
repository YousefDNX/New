import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useOptionalAuth } from "@/lib/auth.tsx";
import {
  auth,
  db,
  handleFirestoreError,
  isFirebaseConfigured,
  OperationType,
} from "@/lib/firebase";
import {
  isUserEligibleForApp,
  resolveUserSignInProvider,
  waitForAuthReady,
} from "@/lib/firebase-auth";
import {
  clampString,
  defaultStatsDoc,
  generateSafeDocId,
  type ActivityEventRow,
  type AppRole,
  type FutureMilestoneItem,
  type GoalRow,
  type GoalStatus,
  type GrowthArea,
  type ProfileRow,
  type SubtaskItem,
  type TaskRow,
  type TaskStatus,
  type UserStatsRow,
} from "@/lib/firestore-data";
import { AREAS, levelForXp } from "@/lib/growth";
import { XP_RULES, buildEventDocId } from "@/lib/xp-rules";

export type { ActivityEventRow, GoalRow, ProfileRow, TaskRow, UserStatsRow };

export async function requireEligibleUid(): Promise<string | null> {
  const user = await waitForAuthReady();
  if (!user) return null;
  const signInProvider = await resolveUserSignInProvider(user);
  if (!isUserEligibleForApp(user, signInProvider)) return null;
  return user.uid;
}

const _inFlightXpEvents = new Set<string>();

export async function awardXpIfUnique(params: {
  userId: string;
  eventDocId: string;
  eventType: string;
  area: GrowthArea;
  xpReward: number;
  refId: string;
  nowIso: string;
}): Promise<boolean> {
  const safeEventId = params.eventDocId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128);
  if (_inFlightXpEvents.has(safeEventId)) return false;
  _inFlightXpEvents.add(safeEventId);

  try {
    const eventRef = doc(db, "activity_events", safeEventId);
    let eventSnap;
    try {
      eventSnap = await getDoc(eventRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `activity_events/${safeEventId}`);
    }
    if (eventSnap.exists()) return false;

    const statsRef = doc(db, "user_stats", params.userId);
    let existingStats: UserStatsRow = defaultStatsDoc(params.userId, params.nowIso);
    let statsExists = false;
    try {
      const snap = await getDoc(statsRef);
      if (snap.exists()) {
        existingStats = snap.data() as UserStatsRow;
        statsExists = true;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `user_stats/${params.userId}`);
    }

    const today = params.nowIso.split("T")[0] ?? params.nowIso.slice(0, 10);
    const cappedXp = Math.min(Math.max(params.xpReward, 0), 100);
    const newXp = (existingStats.xp || 0) + cappedXp;
    const newLevel = levelForXp(newXp);
    const nextStreak =
      existingStats.last_active_date === today
        ? Math.max(existingStats.current_streak || 1, 1)
        : (existingStats.current_streak || 0) + 1;

    const statsPayload: UserStatsRow = {
      user_id: params.userId,
      xp: newXp,
      level: newLevel,
      current_streak: nextStreak,
      longest_streak: Math.max(existingStats.longest_streak || 0, nextStreak),
      last_active_date: today,
      updated_at: params.nowIso,
    };

    try {
      if (statsExists) {
        await updateDoc(statsRef, {
          xp: statsPayload.xp,
          level: statsPayload.level,
          current_streak: statsPayload.current_streak,
          longest_streak: statsPayload.longest_streak,
          last_active_date: statsPayload.last_active_date,
          updated_at: statsPayload.updated_at,
        });
      } else {
        await setDoc(statsRef, statsPayload);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `user_stats/${params.userId}`);
    }

    const eventPayload: ActivityEventRow = {
      id: safeEventId,
      user_id: params.userId,
      event_type: params.eventType.slice(0, 64),
      area: params.area,
      xp: cappedXp,
      ref_id: params.refId.slice(0, 128),
      created_at: params.nowIso,
    };

    try {
      await setDoc(eventRef, eventPayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `activity_events/${safeEventId}`);
    }

    return true;
  } finally {
    _inFlightXpEvents.delete(safeEventId);
  }
}

export function useAuthSession() {
  const authCtx = useOptionalAuth();
  const skipAsyncFallback =
    !isFirebaseConfigured ||
    (typeof import.meta !== "undefined" && Boolean(import.meta.env?.["VITEST"]));
  const [fallbackUser, setFallbackUser] = useState<User | null>(() => auth.currentUser);
  const [fallbackReady, setFallbackReady] = useState<boolean>(() => skipAsyncFallback);

  useEffect(() => {
    if (authCtx || skipAsyncFallback) return undefined;
    let mounted = true;
    void waitForAuthReady().then((u) => {
      if (mounted) {
        setFallbackUser(u);
        setFallbackReady(true);
      }
    });
    const unsub = auth.onIdTokenChanged((nextUser) => {
      if (mounted) {
        setFallbackUser(nextUser);
        setFallbackReady(true);
      }
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, [authCtx, skipAsyncFallback]);

  if (authCtx) {
    return {
      user: authCtx.user,
      ready: authCtx.isInitialized,
    };
  }

  return { user: fallbackUser, ready: fallbackReady };
}

export function useUser() {
  const { user, ready } = useAuthSession();
  return {
    data: ready ? user : auth.currentUser,
    isLoading: !ready,
  };
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<ProfileRow | null> => {
      const userId = await requireEligibleUid();
      if (!userId) return null;
      const path = `profiles/${userId}`;
      try {
        const snap = await getDoc(doc(db, "profiles", userId));
        return snap.exists() ? (snap.data() as ProfileRow) : null;
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, path);
      }
    },
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async (): Promise<UserStatsRow> => {
      const userId = await requireEligibleUid();
      if (!userId) return defaultStatsDoc("");
      const path = `user_stats/${userId}`;
      try {
        const snap = await getDoc(doc(db, "user_stats", userId));
        return snap.exists() ? (snap.data() as UserStatsRow) : defaultStatsDoc(userId);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, path);
      }
    },
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async (): Promise<AppRole[]> => {
      const userId = await requireEligibleUid();
      if (!userId) return [];
      return ["user"];
    },
  });
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async (): Promise<TaskRow[]> => {
      const userId = await requireEligibleUid();
      if (!userId) return [];
      try {
        const q = query(collection(db, "tasks"), where("user_id", "==", userId));
        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => d.data() as TaskRow);
        return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "tasks");
      }
    },
  });
}

export async function resetDailyGoalsIfNeeded(
  goals: GoalRow[],
  todayIso: string,
): Promise<GoalRow[]> {
  const needsReset = goals.filter(
    (g) => g.is_daily === true && g.status === "completed" && g.last_reset_date !== todayIso,
  );
  if (needsReset.length === 0) return goals;

  await Promise.all(
    needsReset.map((g) =>
      updateDoc(doc(db, "goals", g.id), {
        status: "active",
        completed_at: null,
        last_reset_date: todayIso,
      }).catch(() => undefined),
    ),
  );

  const resetIds = new Set(needsReset.map((g) => g.id));
  return goals.map((g) =>
    resetIds.has(g.id)
      ? { ...g, status: "active", completed_at: null, last_reset_date: todayIso }
      : g,
  );
}

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: async (): Promise<GoalRow[]> => {
      const userId = await requireEligibleUid();
      if (!userId) return [];
      try {
        const q = query(collection(db, "goals"), where("user_id", "==", userId));
        const snap = await getDocs(q);
        const rows = snap.docs
          .map((d) => d.data() as GoalRow)
          .sort((a, b) => b.created_at.localeCompare(a.created_at));
        const todayIso = new Date().toISOString().slice(0, 10);
        return await resetDailyGoalsIfNeeded(rows, todayIso);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "goals");
      }
    },
  });
}

export function useActivityEvents(maxItems = 50) {
  return useQuery({
    queryKey: ["activity_events", maxItems],
    queryFn: async (): Promise<ActivityEventRow[]> => {
      const userId = await requireEligibleUid();
      if (!userId) return [];
      try {
        const q = query(collection(db, "activity_events"), where("user_id", "==", userId));
        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => d.data() as ActivityEventRow);
        return rows.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, maxItems);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "activity_events");
      }
    },
  });
}

function normalizeArea(raw: string | undefined): GrowthArea {
  return AREAS.includes(raw as GrowthArea) ? (raw as GrowthArea) : "productivity";
}

function nextDueDateIso(
  currentDue: string | null | undefined,
  recurrence: "daily" | "weekly",
): string {
  const base = currentDue ? new Date(currentDue.slice(0, 10) + "T00:00:00Z") : new Date();
  const validBase = Number.isNaN(base.getTime()) ? new Date() : base;
  const days = recurrence === "weekly" ? 7 : 1;
  return new Date(validBase.getTime() + days * 86400_000).toISOString().slice(0, 10);
}

export function useTaskActions() {
  const qc = useQueryClient();

  const setTaskStatus = async (
    task: TaskRow,
    nextStatus: TaskStatus,
    xpReward = XP_RULES.TASK_COMPLETED,
  ) => {
    const userId = await requireEligibleUid();
    if (!userId || userId !== task.user_id) {
      throw new Error("You must be signed in as the task owner.");
    }
    const isNowDone = nextStatus === "done";
    const now = new Date().toISOString();

    try {
      await updateDoc(doc(db, "tasks", task.id), {
        status: nextStatus,
        completed_at: isNowDone ? now : null,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${task.id}`);
    }

    if (isNowDone && task.status !== "done") {
      const awarded = await awardXpIfUnique({
        userId: task.user_id,
        eventDocId: buildEventDocId(task.user_id, "TASK_COMPLETED", task.id),
        eventType: "TASK_COMPLETED",
        area: normalizeArea(task.area),
        xpReward,
        refId: task.id,
        nowIso: now,
      });

      if (awarded && (task.recurrence === "daily" || task.recurrence === "weekly")) {
        const nextId = generateSafeDocId("task");
        const nextDoc: TaskRow = {
          id: nextId,
          user_id: userId,
          title: task.title,
          details: task.details,
          priority: task.priority,
          status: "todo",
          area: normalizeArea(task.area),
          subject: task.subject ?? null,
          recurrence: task.recurrence,
          subtasks: (task.subtasks ?? []).map((s) => ({ ...s, done: false })),
          due_at: nextDueDateIso(task.due_at, task.recurrence),
          goal_id: task.goal_id ?? null,
          completed_at: null,
          created_at: now,
        };
        await setDoc(doc(db, "tasks", nextId), nextDoc).catch(() => undefined);
      }
    }

    await Promise.all([
      qc.invalidateQueries({ queryKey: ["tasks"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
      qc.invalidateQueries({ queryKey: ["activity_events"] }),
    ]);
  };

  const completeTask = async (task: TaskRow, xpReward = XP_RULES.TASK_COMPLETED) => {
    await setTaskStatus(task, task.status === "done" ? "todo" : "done", xpReward);
  };

  const addTask = async (payload: {
    title: string;
    details?: string | null;
    priority?: "low" | "medium" | "high";
    status?: TaskStatus;
    area?: GrowthArea;
    subject?: string | null;
    recurrence?: "none" | "daily" | "weekly";
    subtasks?: SubtaskItem[];
    due_at?: string | null;
    goal_id?: string | null;
  }) => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("You must be signed in to create tasks.");

    const title = clampString(payload.title, 200);
    if (!title) throw new Error("Task title is required.");

    const initialStatus: TaskStatus = payload.status ?? "todo";
    const now = new Date().toISOString();
    const id = generateSafeDocId("task");
    const taskDoc: TaskRow = {
      id,
      user_id: userId,
      title,
      details: clampString(payload.details, 2000),
      priority: payload.priority ?? "medium",
      status: initialStatus,
      area: normalizeArea(payload.area),
      subject: clampString(payload.subject, 60),
      recurrence: payload.recurrence ?? "none",
      subtasks: (payload.subtasks ?? []).slice(0, 15).map((s) => ({
        id: s.id.slice(0, 40),
        title: s.title.slice(0, 120),
        done: Boolean(s.done),
      })),
      due_at: clampString(payload.due_at, 40),
      goal_id: clampString(payload.goal_id, 128),
      completed_at: initialStatus === "done" ? now : null,
      created_at: now,
    };

    try {
      await setDoc(doc(db, "tasks", id), taskDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `tasks/${id}`);
    }

    await qc.invalidateQueries({ queryKey: ["tasks"] });
    return taskDoc;
  };

  const updateSubtasks = async (task: TaskRow, subtasks: SubtaskItem[]) => {
    const userId = await requireEligibleUid();
    if (!userId || userId !== task.user_id) return;
    const clean = subtasks.slice(0, 15).map((s) => ({
      id: s.id.slice(0, 40),
      title: s.title.slice(0, 120),
      done: Boolean(s.done),
    }));
    try {
      await updateDoc(doc(db, "tasks", task.id), { subtasks: clean });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${task.id}`);
    }
    await qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  const updateTask = async (
    task: TaskRow,
    patch: {
      title?: string;
      details?: string | null;
      priority?: "low" | "medium" | "high";
      status?: TaskStatus;
      area?: GrowthArea;
      subject?: string | null;
      due_at?: string | null;
      goal_id?: string | null;
      recurrence?: "none" | "daily" | "weekly";
    },
  ) => {
    const userId = await requireEligibleUid();
    if (!userId || userId !== task.user_id) {
      throw new Error("You must be signed in as the task owner.");
    }
    const nextTitle = clampString(patch.title ?? task.title, 200);
    if (!nextTitle) throw new Error("Task title is required.");

    const nextStatus = patch.status ?? task.status;
    const now = new Date().toISOString();
    const updates = {
      title: nextTitle,
      details: patch.details !== undefined ? clampString(patch.details, 2000) : task.details,
      priority: patch.priority ?? task.priority,
      status: nextStatus,
      area: patch.area ? normalizeArea(patch.area) : normalizeArea(task.area),
      subject:
        patch.subject !== undefined ? clampString(patch.subject, 60) : (task.subject ?? null),
      due_at: patch.due_at !== undefined ? clampString(patch.due_at, 40) : task.due_at,
      goal_id:
        patch.goal_id !== undefined ? clampString(patch.goal_id, 128) : (task.goal_id ?? null),
      recurrence: patch.recurrence ?? task.recurrence ?? "none",
      completed_at:
        nextStatus === "done"
          ? (task.completed_at ?? now)
          : nextStatus === task.status
            ? task.completed_at
            : null,
    };

    try {
      await updateDoc(doc(db, "tasks", task.id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${task.id}`);
    }
    if (nextStatus === "done" && task.status !== "done") {
      await awardXpIfUnique({
        userId: task.user_id,
        eventDocId: buildEventDocId(task.user_id, "TASK_COMPLETED", task.id),
        eventType: "TASK_COMPLETED",
        area: updates.area,
        xpReward: XP_RULES.TASK_COMPLETED,
        refId: task.id,
        nowIso: now,
      });
    }
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["tasks"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
      qc.invalidateQueries({ queryKey: ["activity_events"] }),
    ]);
  };

  const clearCompletedTasks = async (doneTasks: TaskRow[]) => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("You must be signed in to delete tasks.");
    const ownedDone = doneTasks.filter(
      (t) => t.user_id === userId && (t.status === "done" || t.status === "cancelled"),
    );
    if (ownedDone.length === 0) return 0;
    try {
      await Promise.all(ownedDone.map((t) => deleteDoc(doc(db, "tasks", t.id))));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, "tasks/bulk_completed");
    }
    await qc.invalidateQueries({ queryKey: ["tasks"] });
    return ownedDone.length;
  };

  const deleteTask = async (taskId: string) => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("You must be signed in to delete tasks.");
    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tasks/${taskId}`);
    }
    await qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  return {
    completeTask,
    setTaskStatus,
    addTask,
    updateTask,
    updateSubtasks,
    clearCompletedTasks,
    deleteTask,
  };
}

export function useGoalActions() {
  const qc = useQueryClient();

  const toggleGoal = async (goal: GoalRow) => {
    const userId = await requireEligibleUid();
    if (!userId || userId !== goal.user_id) {
      throw new Error("You must be signed in as the goal owner.");
    }
    const isNowDone = goal.status !== "completed";
    const now = new Date().toISOString();
    const todayIso = now.slice(0, 10);

    try {
      await updateDoc(doc(db, "goals", goal.id), {
        status: isNowDone ? "completed" : "active",
        completed_at: isNowDone ? now : null,
        last_reset_date: todayIso,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `goals/${goal.id}`);
    }

    if (isNowDone) {
      const eventDocId = buildEventDocId(
        goal.user_id,
        "GOAL_UPDATED",
        goal.id,
        goal.is_daily ? todayIso : undefined,
      );
      await awardXpIfUnique({
        userId: goal.user_id,
        eventDocId,
        eventType: "GOAL_UPDATED",
        area: goal.area || "growth",
        xpReward: XP_RULES.GOAL_UPDATED,
        refId: goal.id,
        nowIso: now,
      });
    }

    await Promise.all([
      qc.invalidateQueries({ queryKey: ["goals"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
      qc.invalidateQueries({ queryKey: ["activity_events"] }),
    ]);
  };

  const addGoal = async (payload: {
    title: string;
    area: GrowthArea | string;
    is_daily?: boolean;
    target_date?: string | null;
    milestones?: FutureMilestoneItem[];
  }) => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("You must be signed in to create goals.");

    const title = clampString(payload.title, 200);
    if (!title) throw new Error("Goal title is required.");

    const area: GrowthArea = AREAS.includes(payload.area as GrowthArea)
      ? (payload.area as GrowthArea)
      : "growth";

    const todayIso = new Date().toISOString().slice(0, 10);
    const id = generateSafeDocId("goal");
    const cleanMilestones = (payload.milestones ?? []).slice(0, 12).map((m) => ({
      id: m.id.slice(0, 40),
      title: m.title.slice(0, 120),
      done: Boolean(m.done),
    }));
    const goalDoc: GoalRow = {
      id,
      user_id: userId,
      title,
      area,
      status: "active",
      is_daily: Boolean(payload.is_daily),
      last_reset_date: payload.is_daily ? todayIso : null,
      target_date: clampString(payload.target_date, 40),
      ...(cleanMilestones.length > 0 ? { milestones: cleanMilestones } : {}),
      completed_at: null,
      created_at: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "goals", id), goalDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `goals/${id}`);
    }

    await qc.invalidateQueries({ queryKey: ["goals"] });
    return goalDoc;
  };

  const updateGoal = async (
    goal: GoalRow,
    patch: {
      title?: string;
      area?: GrowthArea;
      status?: GoalStatus;
      is_daily?: boolean;
      target_date?: string | null;
      milestones?: FutureMilestoneItem[];
    },
  ) => {
    const userId = await requireEligibleUid();
    if (!userId || userId !== goal.user_id) {
      throw new Error("You must be signed in as the goal owner.");
    }
    const nextTitle = clampString(patch.title ?? goal.title, 200);
    if (!nextTitle) throw new Error("Goal title is required.");

    const nextStatus = patch.status ?? goal.status;
    const now = new Date().toISOString();
    const todayIso = now.slice(0, 10);
    const prevDoneIds = new Set((goal.milestones ?? []).filter((m) => m.done).map((m) => m.id));
    const cleanMilestones =
      patch.milestones !== undefined
        ? patch.milestones.slice(0, 12).map((m) => ({
            id: m.id.slice(0, 40),
            title: m.title.slice(0, 120),
            done: Boolean(m.done),
          }))
        : goal.milestones;

    const updates: Record<string, unknown> = {
      title: nextTitle,
      area: patch.area ? normalizeArea(patch.area) : goal.area,
      status: nextStatus,
      is_daily: patch.is_daily !== undefined ? Boolean(patch.is_daily) : Boolean(goal.is_daily),
      target_date:
        patch.target_date !== undefined ? clampString(patch.target_date, 40) : goal.target_date,
      completed_at:
        nextStatus === "completed"
          ? (goal.completed_at ?? now)
          : nextStatus === goal.status
            ? goal.completed_at
            : null,
    };
    if (cleanMilestones !== undefined) {
      updates["milestones"] = cleanMilestones;
    }

    try {
      await updateDoc(doc(db, "goals", goal.id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `goals/${goal.id}`);
    }

    if (nextStatus === "completed" && goal.status !== "completed") {
      await awardXpIfUnique({
        userId: goal.user_id,
        eventDocId: buildEventDocId(
          goal.user_id,
          "GOAL_UPDATED",
          goal.id,
          goal.is_daily ? todayIso : undefined,
        ),
        eventType: "GOAL_UPDATED",
        area: (updates["area"] as GrowthArea) || "growth",
        xpReward: XP_RULES.GOAL_UPDATED,
        refId: goal.id,
        nowIso: now,
      });
    } else if (cleanMilestones) {
      const newlyDone = cleanMilestones.find((m) => m.done && !prevDoneIds.has(m.id));
      if (newlyDone) {
        await awardXpIfUnique({
          userId: goal.user_id,
          eventDocId: buildEventDocId(
            goal.user_id,
            "MILESTONE_COMPLETED",
            `${goal.id}_${newlyDone.id}`,
          ),
          eventType: "MILESTONE_COMPLETED",
          area: (updates["area"] as GrowthArea) || "growth",
          xpReward: XP_RULES.MILESTONE_COMPLETED,
          refId: goal.id,
          nowIso: now,
        });
      }
    }

    await Promise.all([
      qc.invalidateQueries({ queryKey: ["goals"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
      qc.invalidateQueries({ queryKey: ["activity_events"] }),
    ]);
  };

  const deleteGoal = async (goalId: string) => {
    const userId = await requireEligibleUid();
    if (!userId) throw new Error("You must be signed in to delete goals.");
    try {
      await deleteDoc(doc(db, "goals", goalId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `goals/${goalId}`);
    }
    await qc.invalidateQueries({ queryKey: ["goals"] });
  };

  const resetAllDailyGoals = async (goals: GoalRow[]) => {
    const todayIso = new Date().toISOString().slice(0, 10);
    await resetDailyGoalsIfNeeded(
      goals.map((g) => (g.is_daily ? { ...g, last_reset_date: "1970-01-01" } : g)),
      todayIso,
    );
    await qc.invalidateQueries({ queryKey: ["goals"] });
  };

  return { toggleGoal, addGoal, updateGoal, deleteGoal, resetAllDailyGoals };
}
