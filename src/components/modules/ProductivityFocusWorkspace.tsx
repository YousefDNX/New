import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock,
  ListTodo,
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
import {
  useFocusActions,
  useFocusSessions,
  useTimeBlockActions,
  useTimeBlocks,
} from "@/hooks/use-modules";
import { useGoalActions, useGoals, useTaskActions, useTasks, useUser } from "@/hooks/use-nexora";
import { recordLastVisitedModule } from "@/lib/continue-tracker";
import { usePrefs } from "@/lib/preferences";

type TabId = "tasks" | "goals" | "timer" | "schedule";

export function ProductivityFocusWorkspace() {
  const { lang } = usePrefs();
  const { data: user } = useUser();
  const isAr = lang === "ar";

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

  // Focus timer state
  const [presetMinutes, setPresetMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [focusTitle, setFocusTitle] = useState("");
  const [savingFocus, setSavingFocus] = useState(false);

  // Time organizer state
  const [blockTitle, setBlockTitle] = useState("");
  const [blockDay, setBlockDay] = useState("Today");
  const [blockStart, setBlockStart] = useState("16:00");
  const [blockEnd, setBlockEnd] = useState("16:45");
  const [blockBusy, setBlockBusy] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

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

  const handleLogFocus = async () => {
    setSavingFocus(true);
    try {
      const elapsedMin = Math.max(
        1,
        Math.round((presetMinutes * 60 - secondsLeft) / 60) || presetMinutes,
      );
      await logFocusSession({
        title: focusTitle.trim() || (isAr ? "جلسة تركيز" : "Focus session"),
        durationMinutes: elapsedMin,
        area: "productivity",
      });
      setRunning(false);
      setSecondsLeft(presetMinutes * 60);
      setFocusTitle("");
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

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

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
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface/60 p-1.5">
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
              className="gap-1.5 text-xs"
            >
              <Icon className="size-3.5" />
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
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-3">
                <Label htmlFor="new-task-priority" className="text-xs">
                  {isAr ? "الأولوية" : "Priority"}
                </Label>
                <select
                  id="new-task-priority"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as "low" | "medium" | "high")}
                  className="mt-1 flex h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-foreground"
                >
                  <option value="low">{isAr ? "منخفضة" : "Low"}</option>
                  <option value="medium">{isAr ? "متوسطة" : "Medium"}</option>
                  <option value="high">{isAr ? "عالية" : "High"}</option>
                </select>
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
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={taskBusy || !taskTitle.trim()}
                size="sm"
                variant="glow"
                className="gap-1.5"
              >
                <Plus className="size-3.5" />
                <span>{isAr ? "إضافة مهمة" : "Add Task"}</span>
              </Button>
            </div>
          </form>

          <div className="surface-card space-y-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1.5">
                {(["all", "open", "done"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setTaskFilter(f)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer ${
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
                    className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    {isAr ? "مسح المكتملة" : "Clear completed"}
                  </button>
                )}
              </div>
              <div className="relative w-full sm:w-56">
                <Search className="pointer-events-none absolute start-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  placeholder={isAr ? "بحث..." : "Search tasks..."}
                  className="h-8 ps-8 text-xs"
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
                        className="flex flex-1 items-center gap-3 text-start cursor-pointer"
                      >
                        {done ? (
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="size-4 shrink-0 text-muted-foreground" />
                        )}
                        <div className="min-w-0">
                          <div
                            className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}
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
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
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
                  className="mt-1"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-foreground pb-2 cursor-pointer">
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
                className="gap-1.5"
              >
                <Plus className="size-3.5" />
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
                      className="flex flex-1 items-center gap-3 text-start cursor-pointer"
                    >
                      {done ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <div>
                        <div
                          className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}
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
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* FOCUS TIMER TAB */}
      {tab === "timer" && (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="surface-card space-y-5 p-6 text-center lg:col-span-7">
            <div className="flex flex-wrap justify-center gap-2">
              {[15, 25, 45].map((m) => (
                <Button
                  key={m}
                  type="button"
                  size="sm"
                  variant={presetMinutes === m ? "glow" : "outline"}
                  onClick={() => {
                    setRunning(false);
                    setPresetMinutes(m);
                    setSecondsLeft(m * 60);
                  }}
                >
                  {m} {isAr ? "دقيقة" : "min"}
                </Button>
              ))}
            </div>

            <div className="font-mono text-5xl font-bold tracking-tight text-foreground tabular-nums">
              {mins}:{secs}
            </div>

            <Input
              value={focusTitle}
              onChange={(e) => setFocusTitle(e.target.value)}
              placeholder={
                isAr ? "ماذا تركز عليه الآن؟ (اختياري)" : "What are you focusing on? (optional)"
              }
              className="mx-auto max-w-sm text-center text-sm"
            />

            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="glow"
                onClick={() => setRunning((r) => !r)}
                className="gap-2"
              >
                {running ? <Pause className="size-4" /> : <Play className="size-4" />}
                <span>
                  {running
                    ? isAr
                      ? "إيقاف مؤقت"
                      : "Pause"
                    : isAr
                      ? "ابدأ التركيز"
                      : "Start Focus"}
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRunning(false);
                  setSecondsLeft(presetMinutes * 60);
                }}
                className="gap-2"
              >
                <RotateCcw className="size-4" />
                <span>{isAr ? "إعادة ضبط" : "Reset"}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={savingFocus}
                onClick={() => void handleLogFocus()}
                className="gap-2"
              >
                <CheckCircle2 className="size-4 text-primary" />
                <span>{isAr ? "حفظ الجلسة" : "Save Session"}</span>
              </Button>
            </div>
          </div>

          <div className="surface-card space-y-3 p-5 lg:col-span-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-foreground">
                {isAr ? "جلسات التركيز المحفوظة" : "Saved Focus Sessions"}
              </h3>
              <span className="text-xs text-muted-foreground">
                {totalFocusMinutes} {isAr ? "دقيقة" : "min total"}
              </span>
            </div>
            {focusSessions.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                {isAr ? "لا توجد جلسات محفوظة بعد." : "No logged sessions yet."}
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {focusSessions.slice(0, 12).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-surface-2/40 px-3 py-2 text-xs"
                  >
                    <span className="font-medium text-foreground truncate">{s.title}</span>
                    <span className="shrink-0 font-mono text-muted-foreground">
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
                  className="mt-1"
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
                  className="mt-1"
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
                  className="mt-1"
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
                  className="mt-1"
                />
              </div>
              <div className="flex items-end sm:col-span-1">
                <Button
                  type="submit"
                  disabled={blockBusy || !blockTitle.trim()}
                  size="sm"
                  variant="glow"
                  className="w-full h-10"
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
                    className="flex flex-1 items-center gap-3 text-start cursor-pointer"
                  >
                    {block.completed ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <div>
                      <div
                        className={`text-sm font-medium ${block.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
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
                    className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
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
