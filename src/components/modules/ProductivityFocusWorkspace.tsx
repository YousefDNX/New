import { useEffect, useMemo, useRef, useState } from "react";
import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock,
  ListTodo,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Target,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/Page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModernSelect } from "@/components/ui/modern-select";
import {
  useFocusActions,
  useFocusSessions,
  useTimeBlockActions,
  useTimeBlocks,
} from "@/hooks/use-modules";
import { useGoalActions, useGoals, useTaskActions, useTasks, useUser } from "@/hooks/use-nexora";
import { recordLastVisitedModule } from "@/lib/continue-tracker";
import {
  FOCUS_PRESETS,
  calculateSessionMinutesToSave,
  clampHms,
  computeRemainingSeconds,
  formatHmsClock,
  getFocusTimerStorageKey,
  hmsToSeconds,
  loadFocusTimerState,
  saveFocusTimerState,
  type PersistedFocusTimerState,
} from "@/lib/focus-timer";
import { usePrefs } from "@/lib/preferences";
import { playCompleteSound } from "@/lib/sound-effects";

type TabId = "tasks" | "goals" | "timer" | "schedule";

export function ProductivityFocusWorkspace() {
  const { lang, soundAndQuiz } = usePrefs();
  const { data: user } = useUser();
  const isAr = lang === "ar";
  const soundEnabled = soundAndQuiz.soundEffectsEnabled;

  useEffect(() => {
    recordLastVisitedModule(user?.uid, {
      path: "/app/tasks",
      labelEn: "Productivity & Focus",
      labelAr: "الإنتاجية والتركيز",
    });
  }, [user?.uid]);

  const { data: tasks = [] } = useTasks();
  const { addTask, completeTask, deleteTask, clearCompletedTasks } = useTaskActions();
  const { data: goals = [] } = useGoals();
  const { addGoal, toggleGoal, deleteGoal } = useGoalActions();
  const { data: focusSessions = [] } = useFocusSessions();
  const { logFocusSession } = useFocusActions();
  const { data: timeBlocks = [] } = useTimeBlocks();
  const { addTimeBlock, toggleTimeBlock, deleteTimeBlock } = useTimeBlockActions();

  const [tab, setTab] = useState<TabId>("tasks");

  // Tasks state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [taskDue, setTaskDue] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [taskFilter, setTaskFilter] = useState<"all" | "open" | "done">("all");
  const [taskBusy, setTaskBusy] = useState(false);

  // Goals state
  const [goalTitle, setGoalTitle] = useState("");
  const [goalIsDaily, setGoalIsDaily] = useState(false);
  const [goalBusy, setGoalBusy] = useState(false);

  // Flexible H:M:S focus timer state (timestamp-based + localStorage persisted)
  const timerStorageKey = getFocusTimerStorageKey(user?.uid);
  const [timerState, setTimerState] = useState<PersistedFocusTimerState>(() =>
    loadFocusTimerState(timerStorageKey),
  );
  const [savingFocus, setSavingFocus] = useState(false);
  const [timerValidationError, setTimerValidationError] = useState<string | null>(null);
  const prevStatusRef = useRef(timerState.status);

  // Reload timer state if signed-in user changes
  useEffect(() => {
    setTimerState(loadFocusTimerState(timerStorageKey));
  }, [timerStorageKey]);

  // Persist timer changes
  useEffect(() => {
    saveFocusTimerState(timerStorageKey, timerState);
  }, [timerStorageKey, timerState]);

  // Sound / banner notification upon transition to completed
  useEffect(() => {
    if (prevStatusRef.current === "running" && timerState.status === "completed") {
      if (soundEnabled) {
        playCompleteSound();
      }
      toast.success(isAr ? "انتهت جلسة التركيز! أحسنت." : "Focus session completed! Great work.");
    }
    prevStatusRef.current = timerState.status;
  }, [timerState.status, soundEnabled, isAr]);

  // Accurate interval based on endAtMs timestamp (survives tab sleep / switching)
  useEffect(() => {
    if (timerState.status !== "running" || timerState.endAtMs == null) return;
    const syncTick = () => {
      setTimerState((prev) => {
        if (prev.status !== "running" || prev.endAtMs == null) return prev;
        const { remainingSeconds, completed } = computeRemainingSeconds(prev);
        if (completed) {
          return {
            ...prev,
            status: "completed",
            remainingSeconds: 0,
            endAtMs: null,
          };
        }
        if (remainingSeconds === prev.remainingSeconds) return prev;
        return {
          ...prev,
          remainingSeconds,
        };
      });
    };

    syncTick();
    const id = window.setInterval(syncTick, 250);
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        syncTick();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [timerState.status, timerState.endAtMs]);

  // Time organizer state
  const [blockTitle, setBlockTitle] = useState("");
  const [blockDay, setBlockDay] = useState("Today");
  const [blockStart, setBlockStart] = useState("16:00");
  const [blockEnd, setBlockEnd] = useState("16:45");
  const [blockBusy, setBlockBusy] = useState(false);

  const filteredTasks = useMemo(() => {
    const q = taskSearch.trim().toLowerCase();
    return tasks.filter((t) => {
      if (taskFilter === "open" && t.status === "done") return false;
      if (taskFilter === "done" && t.status !== "done") return false;
      if (!q) return true;
      return t.title.toLowerCase().includes(q);
    });
  }, [tasks, taskFilter, taskSearch]);

  const openTaskCount = useMemo(() => tasks.filter((t) => t.status !== "done").length, [tasks]);
  const doneTaskCount = useMemo(() => tasks.filter((t) => t.status === "done").length, [tasks]);
  const totalFocusMinutes = useMemo(
    () => focusSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0),
    [focusSessions],
  );

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    setTaskBusy(true);
    try {
      await addTask({
        title: taskTitle.trim(),
        priority: taskPriority,
        area: "productivity",
        due_at: taskDue ? new Date(`${taskDue}T12:00:00Z`).toISOString() : null,
      });
      setTaskTitle("");
      setTaskDue("");
      toast.success(isAr ? "تمت إضافة المهمة." : "Task added.");
    } catch {
      toast.error(isAr ? "تعذر حفظ المهمة." : "Could not save task.");
    } finally {
      setTaskBusy(false);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    setGoalBusy(true);
    try {
      await addGoal({
        title: goalTitle.trim(),
        area: "growth",
        is_daily: goalIsDaily,
      });
      setGoalTitle("");
      toast.success(isAr ? "تمت إضافة الهدف." : "Goal added.");
    } catch {
      toast.error(isAr ? "تعذر حفظ الهدف." : "Could not save goal.");
    } finally {
      setGoalBusy(false);
    }
  };

  const updateHmsField = (patch: Partial<{ hours: number; minutes: number; seconds: number }>) => {
    setTimerValidationError(null);
    setTimerState((prev) => {
      const nextHms = clampHms({
        hours: patch.hours ?? prev.hours,
        minutes: patch.minutes ?? prev.minutes,
        seconds: patch.seconds ?? prev.seconds,
      });
      const totalSeconds = hmsToSeconds(nextHms);
      return {
        ...prev,
        ...nextHms,
        status: "idle",
        totalSeconds,
        remainingSeconds: totalSeconds,
        endAtMs: null,
      };
    });
  };

  const applyFocusPreset = (hours: number, minutes: number, seconds: number) => {
    setTimerValidationError(null);
    const totalSeconds = hmsToSeconds({ hours, minutes, seconds });
    setTimerState((prev) => ({
      ...prev,
      status: "idle",
      hours,
      minutes,
      seconds,
      totalSeconds,
      remainingSeconds: totalSeconds,
      endAtMs: null,
    }));
  };

  const handleStartOrResume = () => {
    if (timerState.remainingSeconds <= 0) {
      if (timerState.totalSeconds <= 0) {
        setTimerValidationError(
          isAr
            ? "اختر مدة أكبر من 00:00:00 لبدء المؤقت."
            : "Please set a duration greater than 00:00:00 to start.",
        );
        return;
      }
      // Restart cleanly from configured total duration when previously completed
      const endAtMs = Date.now() + timerState.totalSeconds * 1000;
      setTimerValidationError(null);
      setTimerState((prev) => ({
        ...prev,
        status: "running",
        remainingSeconds: prev.totalSeconds,
        endAtMs,
      }));
      return;
    }

    const endAtMs = Date.now() + timerState.remainingSeconds * 1000;
    setTimerValidationError(null);
    setTimerState((prev) => ({
      ...prev,
      status: "running",
      endAtMs,
    }));
  };

  const handlePauseTimer = () => {
    setTimerState((prev) => {
      const { remainingSeconds } = computeRemainingSeconds(prev);
      return {
        ...prev,
        status: "paused",
        remainingSeconds,
        endAtMs: null,
      };
    });
  };

  const handleResetTimer = () => {
    setTimerValidationError(null);
    setTimerState((prev) => {
      const totalSeconds = hmsToSeconds({
        hours: prev.hours,
        minutes: prev.minutes,
        seconds: prev.seconds,
      });
      return {
        ...prev,
        status: "idle",
        totalSeconds,
        remainingSeconds: totalSeconds,
        endAtMs: null,
      };
    });
  };

  const handleLogFocus = async () => {
    if (timerState.totalSeconds <= 0) {
      setTimerValidationError(
        isAr ? "حدد مدة صالحة قبل حفظ الجلسة." : "Set a valid duration before saving.",
      );
      return;
    }
    setSavingFocus(true);
    try {
      const durationMinutes = calculateSessionMinutesToSave(timerState);
      await logFocusSession({
        title: timerState.focusTitle.trim() || (isAr ? "جلسة تركيز" : "Focus session"),
        durationMinutes,
        area: "productivity",
      });
      setTimerState((prev) => ({
        ...prev,
        status: "idle",
        remainingSeconds: prev.totalSeconds,
        endAtMs: null,
        focusTitle: "",
      }));
      toast.success(isAr ? "تم حفظ جلسة التركيز." : "Focus session saved.");
    } catch {
      toast.error(isAr ? "تعذر حفظ الجلسة." : "Could not save focus session.");
    } finally {
      setSavingFocus(false);
    }
  };

  const handleAddTimeBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockTitle.trim()) return;
    setBlockBusy(true);
    try {
      await addTimeBlock({
        title: blockTitle.trim(),
        dayLabel: blockDay.trim() || "Today",
        startTime: blockStart,
        endTime: blockEnd,
      });
      setBlockTitle("");
      toast.success(isAr ? "تمت إضافة فترة الوقت." : "Time block added.");
    } catch {
      toast.error(isAr ? "تعذر حفظ الفترة." : "Could not save time block.");
    } finally {
      setBlockBusy(false);
    }
  };

  const timerProgressPct =
    timerState.totalSeconds > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              ((timerState.totalSeconds - timerState.remainingSeconds) / timerState.totalSeconds) *
                100,
            ),
          ),
        )
      : 0;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={isAr ? "الإنتاجية والتركيز" : "Productivity & Focus"}
        subtitle={
          isAr
            ? "نظم مهامك وأهدافك وجلسات التركيز بهدوء ووضوح."
            : "Organize tasks, personal goals, focus sessions, and daily time blocks calmly."
        }
      />

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-surface/60 p-1.5 sm:flex sm:flex-wrap">
        {(
          [
            {
              id: "tasks",
              en: `Tasks (${openTaskCount})`,
              ar: `المهام (${openTaskCount})`,
              icon: ListTodo,
            },
            {
              id: "goals",
              en: `Goals (${goals.length})`,
              ar: `الأهداف (${goals.length})`,
              icon: Target,
            },
            { id: "timer", en: "Focus Timer", ar: "مؤقت التركيز", icon: Clock },
            { id: "schedule", en: "Time Organizer", ar: "منظم الوقت", icon: CalendarClock },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={active ? "glow" : "ghost"}
              onClick={() => setTab(item.id)}
              className="min-h-[44px] justify-center gap-1.5 text-xs sm:min-h-[38px]"
            >
              <Icon className="size-3.5 shrink-0" />
              <span>{isAr ? item.ar : item.en}</span>
            </Button>
          );
        })}
      </div>

      {/* TASKS TAB */}
      {tab === "tasks" && (
        <div className="space-y-4">
          <form onSubmit={handleAddTask} className="surface-card space-y-3 p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-12">
              <div className="sm:col-span-6">
                <Label htmlFor="new-task-title" className="text-xs">
                  {isAr ? "مهمة جديدة" : "New task"}
                </Label>
                <Input
                  id="new-task-title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder={
                    isAr ? "مثال: مراجعة كلمات الوحدة ٢" : "e.g. Review Unit 2 vocabulary"
                  }
                  className="mt-1 min-h-[44px]"
                />
              </div>
              <div className="sm:col-span-3">
                <ModernSelect
                  id="new-task-priority"
                  label={isAr ? "الأولوية" : "Priority"}
                  value={taskPriority}
                  onValueChange={(v) => setTaskPriority(v as "low" | "medium" | "high")}
                  searchable={false}
                  options={[
                    {
                      value: "low",
                      label: isAr ? "منخفضة" : "Low",
                      description: isAr ? "مرنة خلال الأسبوع" : "Flexible within the week",
                    },
                    {
                      value: "medium",
                      label: isAr ? "متوسطة" : "Medium",
                      description: isAr ? "ضمن خطة اليوم" : "Planned for today",
                    },
                    {
                      value: "high",
                      label: isAr ? "عالية" : "High",
                      description: isAr ? "أولوية قصوى" : "Top focus item",
                    },
                  ]}
                />
              </div>
              <div className="sm:col-span-3">
                <Label htmlFor="new-task-due" className="text-xs">
                  {isAr ? "تاريخ الاستحقاق" : "Due date"}
                </Label>
                <Input
                  id="new-task-due"
                  type="date"
                  value={taskDue}
                  onChange={(e) => setTaskDue(e.target.value)}
                  className="mt-1 min-h-[44px]"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={taskBusy || !taskTitle.trim()}
                size="sm"
                variant="glow"
                className="min-h-[44px] w-full gap-1.5 sm:w-auto"
              >
                <Plus className="size-4" />
                <span>{isAr ? "إضافة مهمة" : "Add Task"}</span>
              </Button>
            </div>
          </form>

          <div className="surface-card space-y-3 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {(["all", "open", "done"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setTaskFilter(f)}
                    className={`min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer ${
                      taskFilter === f
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-2 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f === "all"
                      ? isAr
                        ? "الكل"
                        : "All"
                      : f === "open"
                        ? isAr
                          ? "قيد التنفيذ"
                          : "Open"
                        : isAr
                          ? "مكتملة"
                          : "Done"}
                  </button>
                ))}
                {doneTaskCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void clearCompletedTasks(tasks)}
                    className="min-h-[40px] rounded-lg bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    {isAr ? "مسح المكتملة" : "Clear completed"}
                  </button>
                )}
              </div>
              <div className="relative w-full sm:w-56">
                <Search className="pointer-events-none absolute start-3 top-3 size-4 text-muted-foreground" />
                <Input
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  placeholder={isAr ? "بحث..." : "Search tasks..."}
                  className="min-h-[40px] ps-9 text-xs"
                />
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                {isAr ? "لا توجد مهام بعد. أضف أول مهمة بالأعلى." : "No tasks yet. Add one above."}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map((task) => {
                  const done = task.status === "done";
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-surface-2/40 px-3.5 py-2.5"
                    >
                      <button
                        type="button"
                        onClick={() => void completeTask(task)}
                        className="flex min-h-[44px] flex-1 items-center gap-3 text-start cursor-pointer"
                      >
                        {done ? (
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="size-4 shrink-0 text-muted-foreground" />
                        )}
                        <div className="min-w-0">
                          <div
                            className={`break-words text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}
                          >
                            {task.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {task.priority}
                            {task.due_at ? ` · ${task.due_at.slice(0, 10)}` : ""}
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteTask(task.id)}
                        aria-label={isAr ? "حذف المهمة" : "Delete task"}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GOALS TAB */}
      {tab === "goals" && (
        <div className="space-y-4">
          <form onSubmit={handleAddGoal} className="surface-card space-y-3 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label htmlFor="new-goal-title" className="text-xs">
                  {isAr ? "هدف شخصي أو دراسي" : "Personal or study goal"}
                </Label>
                <Input
                  id="new-goal-title"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder={
                    isAr
                      ? "مثال: إتمام مراجعة وحدات اللغة الإنجليزية"
                      : "e.g. Finish Grade 9 English revision"
                  }
                  className="mt-1 min-h-[44px]"
                />
              </div>
              <label className="flex min-h-[44px] items-center gap-2 text-xs text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={goalIsDaily}
                  onChange={(e) => setGoalIsDaily(e.target.checked)}
                />
                <span>{isAr ? "يتكرر يومياً" : "Daily habit goal"}</span>
              </label>
              <Button
                type="submit"
                disabled={goalBusy || !goalTitle.trim()}
                size="sm"
                variant="glow"
                className="min-h-[44px] w-full gap-1.5 sm:w-auto"
              >
                <Plus className="size-4" />
                <span>{isAr ? "إضافة هدف" : "Add Goal"}</span>
              </Button>
            </div>
          </form>

          <div className="surface-card space-y-2.5 p-4 sm:p-5">
            {goals.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                {isAr ? "لا توجد أهداف مضافة بعد." : "No goals yet."}
              </p>
            ) : (
              goals.map((goal) => {
                const done = goal.status === "completed";
                return (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-surface-2/40 px-3.5 py-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => void toggleGoal(goal)}
                      className="flex min-h-[44px] flex-1 items-center gap-3 text-start cursor-pointer"
                    >
                      {done ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <div>
                        <div
                          className={`break-words text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}
                        >
                          {goal.title}
                        </div>
                        {goal.is_daily && (
                          <div className="text-[11px] text-primary">
                            {isAr ? "هدف يومي" : "Daily"}
                          </div>
                        )}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteGoal(goal.id)}
                      aria-label={isAr ? "حذف الهدف" : "Delete goal"}
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* FLEXIBLE FOCUS TIMER TAB (Hours : Minutes : Seconds) */}
      {tab === "timer" && (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="surface-card space-y-5 p-5 text-center sm:p-6 lg:col-span-7">
            {/* Completion notification banner */}
            {timerState.status === "completed" && (
              <div
                role="status"
                aria-live="polite"
                className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/12 px-4 py-3 text-start sm:flex-row"
              >
                <div className="flex items-center gap-2.5">
                  <BellRing className="size-5 shrink-0 text-emerald-500" />
                  <div className="text-sm font-medium text-foreground">
                    {isAr
                      ? "انتهت مدة التركيز بنجاح! يمكنك حفظ الجلسة الآن."
                      : "Focus duration completed! Ready to save your session."}
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="glow"
                  disabled={savingFocus}
                  onClick={() => void handleLogFocus()}
                  className="min-h-[44px] w-full shrink-0 sm:min-h-[38px] sm:w-auto"
                >
                  {isAr ? "حفظ في السجل" : "Log Session"}
                </Button>
              </div>
            )}

            {/* Quick Presets including multi-hour presets */}
            <div>
              <div className="mb-2 text-xs font-semibold text-muted-foreground">
                {isAr ? "فترات سريعة" : "Quick Presets"}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {FOCUS_PRESETS.map((preset) => {
                  const presetSeconds = hmsToSeconds(preset);
                  const active = timerState.totalSeconds === presetSeconds;
                  return (
                    <Button
                      key={preset.id}
                      type="button"
                      size="sm"
                      variant={active ? "glow" : "outline"}
                      onClick={() => applyFocusPreset(preset.hours, preset.minutes, preset.seconds)}
                      className="min-h-[44px] px-3 sm:min-h-[38px]"
                    >
                      {isAr ? preset.labelAr : preset.labelEn}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Custom Hours / Minutes / Seconds Picker */}
            <div className="rounded-2xl border border-border/80 bg-surface-2/40 p-4">
              <div className="mb-3 text-xs font-semibold text-muted-foreground">
                {isAr
                  ? "مدة مخصصة (ساعات · دقائق · ثوانٍ)"
                  : "Custom Duration (Hours · Minutes · Seconds)"}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(
                  [
                    {
                      key: "hours" as const,
                      labelEn: "Hours",
                      labelAr: "الساعات",
                      max: 23,
                      value: timerState.hours,
                    },
                    {
                      key: "minutes" as const,
                      labelEn: "Minutes",
                      labelAr: "الدقائق",
                      max: 59,
                      value: timerState.minutes,
                    },
                    {
                      key: "seconds" as const,
                      labelEn: "Seconds",
                      labelAr: "الثواني",
                      max: 59,
                      value: timerState.seconds,
                    },
                  ] as const
                ).map((field) => (
                  <div
                    key={field.key}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-border/70 bg-surface p-2.5"
                  >
                    <Label htmlFor={`focus-${field.key}`} className="text-xs font-medium">
                      {isAr ? field.labelAr : field.labelEn}
                    </Label>
                    <div className="flex w-full items-center justify-center gap-1.5">
                      <button
                        type="button"
                        disabled={timerState.status === "running"}
                        onClick={() =>
                          updateHmsField({
                            [field.key]: field.value <= 0 ? field.max : field.value - 1,
                          })
                        }
                        aria-label={`${isAr ? "إنقاص" : "Decrease"} ${field.labelEn}`}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border bg-surface-2 text-foreground hover:bg-surface disabled:opacity-40 cursor-pointer"
                      >
                        <Minus className="size-4" />
                      </button>
                      <Input
                        id={`focus-${field.key}`}
                        type="number"
                        min={0}
                        max={field.max}
                        disabled={timerState.status === "running"}
                        value={field.value}
                        onChange={(e) => {
                          const parsed = Number.parseInt(e.target.value, 10);
                          updateHmsField({ [field.key]: Number.isNaN(parsed) ? 0 : parsed });
                        }}
                        className="min-h-[44px] w-16 text-center font-mono text-base font-bold tabular-nums"
                      />
                      <button
                        type="button"
                        disabled={timerState.status === "running"}
                        onClick={() =>
                          updateHmsField({
                            [field.key]: field.value >= field.max ? 0 : field.value + 1,
                          })
                        }
                        aria-label={`${isAr ? "زيادة" : "Increase"} ${field.labelEn}`}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border bg-surface-2 text-foreground hover:bg-surface disabled:opacity-40 cursor-pointer"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {timerValidationError && (
                <p className="mt-2.5 text-xs font-medium text-destructive">
                  {timerValidationError}
                </p>
              )}
            </div>

            {/* Live HH:MM:SS Readout + Progress */}
            <div className="space-y-2.5">
              <div
                data-testid="focus-timer-clock"
                className="font-mono text-4xl font-bold tracking-tight text-foreground tabular-nums sm:text-5xl"
              >
                {formatHmsClock(timerState.remainingSeconds)}
              </div>
              <div className="mx-auto h-2 w-full max-w-md overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${timerProgressPct}%` }}
                />
              </div>
            </div>

            <Input
              value={timerState.focusTitle}
              onChange={(e) =>
                setTimerState((prev) => ({
                  ...prev,
                  focusTitle: e.target.value.slice(0, 160),
                }))
              }
              placeholder={
                isAr ? "ماذا تركز عليه الآن؟ (اختياري)" : "What are you focusing on? (optional)"
              }
              className="mx-auto min-h-[44px] max-w-sm text-center text-sm"
            />

            {/* Primary Controls (Mobile-friendly wrapping & 44px hit targets) */}
            <div className="flex flex-col justify-center gap-2 sm:flex-row sm:flex-wrap">
              {timerState.status === "running" ? (
                <Button
                  type="button"
                  variant="glow"
                  onClick={handlePauseTimer}
                  className="min-h-[44px] gap-2"
                >
                  <Pause className="size-4" />
                  <span>{isAr ? "إيقاف مؤقت" : "Pause"}</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="glow"
                  disabled={timerState.totalSeconds <= 0}
                  onClick={handleStartOrResume}
                  className="min-h-[44px] gap-2"
                >
                  <Play className="size-4" />
                  <span>
                    {timerState.status === "paused"
                      ? isAr
                        ? "استئناف التركيز"
                        : "Resume Focus"
                      : isAr
                        ? "ابدأ التركيز"
                        : "Start Focus"}
                  </span>
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleResetTimer}
                className="min-h-[44px] gap-2"
              >
                <RotateCcw className="size-4" />
                <span>{isAr ? "إعادة ضبط" : "Reset"}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={savingFocus || timerState.totalSeconds <= 0}
                onClick={() => void handleLogFocus()}
                className="min-h-[44px] gap-2"
              >
                <CheckCircle2 className="size-4 text-primary" />
                <span>{isAr ? "حفظ الجلسة" : "Save Session"}</span>
              </Button>
            </div>
          </div>

          <div className="surface-card space-y-3 p-5 lg:col-span-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-sm font-bold text-foreground">
                {isAr ? "جلسات التركيز المحفوظة" : "Saved Focus Sessions"}
              </h3>
              <span className="text-xs text-muted-foreground tabular-nums">
                {totalFocusMinutes} {isAr ? "دقيقة" : "min total"}
              </span>
            </div>
            {focusSessions.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                {isAr ? "لا توجد جلسات محفوظة بعد." : "No logged sessions yet."}
              </p>
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {focusSessions.slice(0, 12).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-surface-2/40 px-3 py-2 text-xs"
                  >
                    <span className="break-words font-medium text-foreground">{s.title}</span>
                    <span className="shrink-0 font-mono text-muted-foreground tabular-nums">
                      {s.duration_minutes}m
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TIME ORGANIZER TAB */}
      {tab === "schedule" && (
        <div className="space-y-4">
          <form onSubmit={handleAddTimeBlock} className="surface-card space-y-3 p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-12">
              <div className="sm:col-span-4">
                <Label htmlFor="tb-title" className="text-xs">
                  {isAr ? "عنوان الفترة" : "Study or activity block"}
                </Label>
                <Input
                  id="tb-title"
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                  placeholder={isAr ? "مثال: مراجعة قواعد اللغة" : "e.g. Grammar review"}
                  className="mt-1 min-h-[44px]"
                />
              </div>
              <div className="sm:col-span-3">
                <Label htmlFor="tb-day" className="text-xs">
                  {isAr ? "اليوم" : "Day"}
                </Label>
                <Input
                  id="tb-day"
                  value={blockDay}
                  onChange={(e) => setBlockDay(e.target.value)}
                  placeholder="Today / Sunday"
                  className="mt-1 min-h-[44px]"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="tb-start" className="text-xs">
                  {isAr ? "من" : "Start"}
                </Label>
                <Input
                  id="tb-start"
                  type="time"
                  value={blockStart}
                  onChange={(e) => setBlockStart(e.target.value)}
                  className="mt-1 min-h-[44px]"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="tb-end" className="text-xs">
                  {isAr ? "إلى" : "End"}
                </Label>
                <Input
                  id="tb-end"
                  type="time"
                  value={blockEnd}
                  onChange={(e) => setBlockEnd(e.target.value)}
                  className="mt-1 min-h-[44px]"
                />
              </div>
              <div className="flex items-end sm:col-span-1">
                <Button
                  type="submit"
                  disabled={blockBusy || !blockTitle.trim()}
                  size="sm"
                  variant="glow"
                  className="min-h-[44px] w-full"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          </form>

          <div className="surface-card space-y-2.5 p-4 sm:p-5">
            {timeBlocks.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                {isAr ? "لا توجد فترات مجدولة بعد." : "No time blocks added yet."}
              </p>
            ) : (
              timeBlocks.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-surface-2/40 px-3.5 py-2.5"
                >
                  <button
                    type="button"
                    onClick={() => void toggleTimeBlock(block)}
                    className="flex min-h-[44px] flex-1 items-center gap-3 text-start cursor-pointer"
                  >
                    {block.completed ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <div>
                      <div
                        className={`break-words text-sm font-medium ${block.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                      >
                        {block.title}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground">
                        {block.day_label} · {block.start_time} – {block.end_time}
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteTimeBlock(block.id)}
                    aria-label={isAr ? "حذف الفترة" : "Delete time block"}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
