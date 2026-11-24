import { useEffect, useMemo, useRef, useState } from "react";
import {
  BellOff,
  BookOpen,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  LayoutGrid,
  List,
  ListTodo,
  Pause,
  Pencil,
  Play,
  Plus,
  Repeat,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/Page";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import type { FeatureGuideId } from "@/lib/feature-guides";
import { ReadyToUseLibraryView } from "@/components/common/ReadyToUseLibraryModal";
import { InteractiveCalendar } from "@/components/productivity/InteractiveCalendar";
import { StudyPlannerSuite } from "@/components/study/StudyPlannerSuite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFocusActions, useFocusSessions } from "@/hooks/use-modules";
import { useTaskActions, useTasks, type TaskRow } from "@/hooks/use-nexora";
import type { GrowthArea } from "@/lib/firestore-data";
import { AREA_CONFIG, AREAS, computeDomainFocusStats, type Area } from "@/lib/growth";
import { formatDate, formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import { BRAND } from "@/config/brand";

export type ProdTab = "tasks" | "timer" | "calendar" | "deadlines";

function isWithinQuietHours(start: string, end: string, now = new Date()): boolean {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if (Number.isNaN(sh) || Number.isNaN(eh)) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  const s = (sh ?? 22) * 60 + (sm ?? 0);
  const e = (eh ?? 7) * 60 + (em ?? 0);
  if (s <= e) return cur >= s && cur <= e;
  return cur >= s || cur <= e;
}

export function ProductivityWorkspace({ initialTab = "tasks" }: { initialTab?: ProdTab } = {}) {
  const { t, lang, locale, study, notifications, uiMode, setUiMode } = usePrefs();
  const { data: tasks = [] } = useTasks();
  const { completeTask, addTask, updateTask, updateSubtasks, clearCompletedTasks, deleteTask } =
    useTaskActions();
  const { data: focusSessions = [] } = useFocusSessions();
  const { logFocusSession } = useFocusActions();

  const [tab, setTab] = useState<ProdTab>(initialTab);
  const [showStarterLibrary, setShowStarterLibrary] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab]);

  // Task form & filters
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [area, setArea] = useState<GrowthArea>("productivity");
  const [subject, setSubject] = useState("");
  const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly">("none");
  const [dueDate, setDueDate] = useState("");
  const [subtaskDrafts, setSubtaskDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const [taskSearch, setTaskSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "done">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [taskView, setTaskView] = useState<"list" | "matrix">("list");

  // Inline Task Editor
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState<"low" | "medium" | "high">("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [editSubject, setEditSubject] = useState("");

  // Focus timer
  const [phase, setPhase] = useState<"work" | "break">("work");
  const [secondsLeft, setSecondsLeft] = useState(study.sessionMinutes * 60);
  const [running, setRunning] = useState(false);
  const [focusLabel, setFocusLabel] = useState("");
  const [linkedTaskId, setLinkedTaskId] = useState("");
  const prevDurationsRef = useRef({ work: study.sessionMinutes, brk: study.breakMinutes });

  useEffect(() => {
    const prev = prevDurationsRef.current;
    const durationChanged = prev.work !== study.sessionMinutes || prev.brk !== study.breakMinutes;
    if (!durationChanged) return;
    prevDurationsRef.current = { work: study.sessionMinutes, brk: study.breakMinutes };
    if (!running) {
      setSecondsLeft((phase === "work" ? study.sessionMinutes : study.breakMinutes) * 60);
    }
  }, [study.sessionMinutes, study.breakMinutes, phase, running]);

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

  const quietActive =
    notifications.quietHoursEnabled &&
    isWithinQuietHours(notifications.quietStart, notifications.quietEnd);

  const openTasks = useMemo(() => tasks.filter((tk) => tk.status !== "done"), [tasks]);
  const doneTasks = useMemo(() => tasks.filter((tk) => tk.status === "done"), [tasks]);

  const filteredTasks = useMemo(() => {
    const q = taskSearch.trim().toLowerCase();
    return tasks.filter((tk) => {
      if (statusFilter === "open" && tk.status === "done") return false;
      if (statusFilter === "done" && tk.status !== "done") return false;
      if (priorityFilter !== "all" && tk.priority !== priorityFilter) return false;
      if (!q) return true;
      return (
        tk.title.toLowerCase().includes(q) ||
        (tk.subject ?? "").toLowerCase().includes(q) ||
        (tk.details ?? "").toLowerCase().includes(q)
      );
    });
  }, [tasks, taskSearch, statusFilter, priorityFilter]);

  const focusSubjectStats = useMemo(() => computeDomainFocusStats(focusSessions), [focusSessions]);

  const handleSaveFocusSession = async () => {
    const linked = openTasks.find((tk) => tk.id === linkedTaskId) ?? null;
    try {
      await logFocusSession({
        title: focusLabel.trim() || linked?.title || t("prod.timer.work"),
        durationMinutes: study.sessionMinutes,
        area: linked?.area ?? "productivity",
        subject: linked?.subject ?? null,
      });
      toast.success(`${t("prod.timer.work")} (+30 XP)`);
      setRunning(false);
      setPhase("break");
      setSecondsLeft(study.breakMinutes * 60);
      setFocusLabel("");
      setLinkedTaskId("");
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await addTask({
        title: title.trim(),
        details: details.trim() || null,
        priority,
        area,
        subject: subject.trim() || null,
        recurrence,
        due_at: dueDate ? new Date(`${dueDate}T12:00:00Z`).toISOString() : null,
      });
      toast.success(t("dash.tasks.toastAdd"));
      setTitle("");
      setDetails("");
      setSubject("");
      setDueDate("");
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    } finally {
      setBusy(false);
    }
  };

  const startEditTask = (task: TaskRow) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditDueDate(task.due_at ? task.due_at.slice(0, 10) : "");
    setEditSubject(task.subject ?? "");
  };

  const handleSaveTaskEdit = async (task: TaskRow) => {
    if (!editTitle.trim()) return;
    try {
      await updateTask(task, {
        title: editTitle.trim(),
        priority: editPriority,
        subject: editSubject.trim() || null,
        due_at: editDueDate ? new Date(`${editDueDate}T12:00:00Z`).toISOString() : null,
      });
      setEditingTaskId(null);
      toast.success(t("common.save"));
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    }
  };

  const handleClearCompleted = async () => {
    if (doneTasks.length === 0) return;
    try {
      const removed = await clearCompletedTasks(doneTasks);
      if (removed > 0) toast.info(`${removed} ${t("prod.clearDone")}`);
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    }
  };

  const handleAddSubtask = async (task: TaskRow) => {
    const text = (subtaskDrafts[task.id] ?? "").trim();
    if (!text) return;
    const next = [
      ...(task.subtasks ?? []),
      { id: `sub_${Date.now().toString(36)}`, title: text, done: false },
    ];
    await updateSubtasks(task, next);
    setSubtaskDrafts((p) => ({ ...p, [task.id]: "" }));
  };

  const handleToggleSubtask = async (task: TaskRow, subId: string) => {
    const next = (task.subtasks ?? []).map((s) => (s.id === subId ? { ...s, done: !s.done } : s));
    await updateSubtasks(task, next);
  };

  const deadlineTasks = useMemo(
    () =>
      tasks
        .filter((tk) => tk.due_at && tk.status !== "done")
        .sort((a, b) => (a.due_at ?? "").localeCompare(b.due_at ?? "")),
    [tasks],
  );

  const minsStr = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secsStr = String(secondsLeft % 60).padStart(2, "0");

  const tabs: Array<{ id: ProdTab; label: string; icon: typeof ListTodo }> = [
    { id: "tasks", label: t("prod.tab.tasks"), icon: ListTodo },
    { id: "timer", label: t("prod.tab.timer"), icon: Clock },
    { id: "calendar", label: t("prod.tab.calendar"), icon: CalendarIcon },
    { id: "deadlines", label: t("prod.tab.deadlines"), icon: Repeat },
  ];

  const renderTaskCard = (task: TaskRow) => {
    const isDone = task.status === "done";
    const isEditing = editingTaskId === task.id;
    const areaCfg = AREA_CONFIG[(task.area as Area) || "productivity"] ?? AREA_CONFIG.productivity;

    return (
      <div key={task.id} className="surface-card space-y-2.5 p-4">
        {isEditing ? (
          <div className="space-y-2.5">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              aria-label={t("dash.tasks.fieldTitle")}
              className="h-8 text-xs"
            />
            <div className="grid grid-cols-3 gap-2">
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as "low" | "medium" | "high")}
                aria-label={t("dash.tasks.priority")}
                className="h-8 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
              >
                <option value="high">{t("dash.tasks.priority.high")}</option>
                <option value="medium">{t("dash.tasks.priority.medium")}</option>
                <option value="low">{t("dash.tasks.priority.low")}</option>
              </select>
              <Input
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                placeholder={t("prod.subject")}
                className="h-8 text-xs"
              />
              <Input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex justify-end gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setEditingTaskId(null)}
              >
                <X className="size-3.5" />
                <span>{t("common.cancel")}</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="glow"
                onClick={() => handleSaveTaskEdit(task)}
              >
                <span>{t("common.save")}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={() => completeTask(task, 25)}
              className="flex flex-1 items-start gap-2.5 text-start"
            >
              {isDone ? (
                <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-success" />
              ) : (
                <Circle className="mt-0.5 size-4.5 shrink-0 text-muted-foreground" />
              )}
              <div>
                <p
                  className={`text-sm font-semibold ${
                    isDone ? "line-through text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {task.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground">
                  <span className="font-semibold" style={{ color: areaCfg.accentColor }}>
                    {t(areaCfg.labelKey)}
                  </span>
                  <span>· {t(`dash.tasks.priority.${task.priority}`)}</span>
                  {task.subject && <span>· {task.subject}</span>}
                  {task.due_at && (
                    <span>
                      · {formatDate(task.due_at, { lang, calendar: locale.calendar }, "medium")}
                    </span>
                  )}
                </div>
              </div>
            </button>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => startEditTask(task)}
                aria-label={t("prod.editTask")}
              >
                <Pencil className="size-3.5 text-muted-foreground" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => deleteTask(task.id)}
                aria-label={t("common.delete")}
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          </div>
        )}

        {/* Subtasks */}
        <div className="space-y-1.5 border-t border-border/60 pt-2">
          {(task.subtasks ?? []).map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => handleToggleSubtask(task, sub.id)}
              className="flex w-full items-center gap-2 text-start text-xs text-muted-foreground hover:text-foreground"
            >
              {sub.done ? (
                <CheckCircle2 className="size-3.5 text-primary" />
              ) : (
                <Circle className="size-3.5" />
              )}
              <span className={sub.done ? "line-through" : ""}>{sub.title}</span>
            </button>
          ))}
          <div className="flex gap-1.5 pt-1">
            <Input
              value={subtaskDrafts[task.id] ?? ""}
              onChange={(e) => setSubtaskDrafts((p) => ({ ...p, [task.id]: e.target.value }))}
              placeholder={t("prod.addSubtask")}
              className="h-7 text-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => handleAddSubtask(task)}
            >
              <Plus className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title={t("mod.tasks.name")}
          subtitle={`${t("study.timer.configured")}: ${formatNumber(study.sessionMinutes, lang)} / ${formatNumber(study.breakMinutes, lang)} ${t("set.study.minutes")}`}
        />
        <div className="flex flex-wrap items-center gap-2">
          <FeatureGuideTrigger
            featureId={
              (
                {
                  tasks: "tasks-planner",
                  timer: "study-pomodoro",
                  calendar: "productivity-calendar",
                  deadlines: "productivity-deadlines",
                } satisfies Record<ProdTab, FeatureGuideId>
              )[tab]
            }
          />
          <Button
            type="button"
            size="sm"
            variant={showStarterLibrary ? "glow" : "outline"}
            onClick={() => setShowStarterLibrary((s) => !s)}
            className="h-8 gap-1.5 text-xs"
          >
            <BookOpen className="size-3.5" />
            <span>{lang === "ar" ? "خطط جاهزة للمهام" : "Ready-to-Use Task Plans"}</span>
          </Button>
        </div>
      </div>

      {showStarterLibrary && (
        <div className="surface-card space-y-4 border-primary/30 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                Ready-to-Use Task & Project Blueprints
              </h2>
              <p className="text-xs text-muted-foreground">
                Import structured exam prep sprints or robotics/coding competition roadmaps directly
                into your task board.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowStarterLibrary(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
          <ReadyToUseLibraryView
            defaultCategory="tasks"
            onItemImported={() => {
              setShowStarterLibrary(false);
              setTab("tasks");
            }}
          />
        </div>
      )}

      <div
        className="surface-card flex flex-wrap items-center justify-between gap-2 p-3"
        role="tablist"
      >
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        {uiMode === "simplified" && (
          <button
            type="button"
            onClick={() => setUiMode("advanced")}
            className="text-xs font-medium text-primary hover:underline px-2"
          >
            {lang === "ar" ? "إظهار مصفوفة المهام والخيارات المتقدمة" : "Switch to Advanced Matrix"}
          </button>
        )}
      </div>

      {/* TAB 1: TASKS & SUBTASKS */}
      {tab === "tasks" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <form onSubmit={handleAddTask} className="surface-card space-y-3 p-5 lg:col-span-1">
            <h2 className="font-display text-base font-bold text-foreground">
              {t("dash.tasks.addTitle")}
            </h2>
            <div className="space-y-1">
              <Label htmlFor="pr-title" className="text-xs">
                {t("dash.tasks.fieldTitle")}
              </Label>
              <Input
                id="pr-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("dash.tasks.fieldTitlePh")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pr-details" className="text-xs">
                {t("study.noteBody")}
              </Label>
              <Input id="pr-details" value={details} onChange={(e) => setDetails(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label htmlFor="pr-area" className="text-xs">
                  {t("prod.area")}
                </Label>
                <select
                  id="pr-area"
                  value={area}
                  onChange={(e) => setArea(e.target.value as GrowthArea)}
                  className="h-9 w-full rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
                >
                  {AREAS.map((a) => (
                    <option key={a} value={a}>
                      {t(AREA_CONFIG[a].labelKey)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="pr-prio" className="text-xs">
                  {t("dash.tasks.priority")}
                </Label>
                <select
                  id="pr-prio"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                  className="h-9 w-full rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
                >
                  <option value="high">{t("dash.tasks.priority.high")}</option>
                  <option value="medium">{t("dash.tasks.priority.medium")}</option>
                  <option value="low">{t("dash.tasks.priority.low")}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label htmlFor="pr-due" className="text-xs">
                  {t("dash.tasks.dueDate")}
                </Label>
                <Input
                  id="pr-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pr-rec" className="text-xs">
                  {t("prod.recurrence")}
                </Label>
                <select
                  id="pr-rec"
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as "none" | "daily" | "weekly")}
                  className="h-9 w-full rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
                >
                  <option value="none">{t("prod.rec.none")}</option>
                  <option value="daily">{t("prod.rec.daily")}</option>
                  <option value="weekly">{t("prod.rec.weekly")}</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="pr-subj" className="text-xs">
                {t("prod.subject")}
              </Label>
              <Input
                id="pr-subj"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("study.subjectPh")}
              />
            </div>
            <Button type="submit" variant="glow" className="w-full" disabled={busy}>
              <Plus className="size-4" />
              <span>{t("common.add")} (+25 XP)</span>
            </Button>
          </form>

          <div className="space-y-4 lg:col-span-2">
            {/* Search, Filter, Bulk Clear & List/Matrix View Bar */}
            <div className="surface-card flex flex-col gap-2.5 p-3.5 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative min-w-44 flex-1">
                <Search className="pointer-events-none absolute start-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  placeholder={t("prod.searchPh")}
                  aria-label={t("prod.searchPh")}
                  className="h-8 ps-8 text-xs"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                aria-label={t("prod.filter.all")}
                className="h-8 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
              >
                <option value="all">{t("prod.filter.all")}</option>
                <option value="open">{t("prod.filter.open")}</option>
                <option value="done">{t("prod.filter.done")}</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
                aria-label={t("dash.tasks.priority")}
                className="h-8 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
              >
                <option value="all">{t("common.all")}</option>
                <option value="high">{t("dash.tasks.priority.high")}</option>
                <option value="medium">{t("dash.tasks.priority.medium")}</option>
                <option value="low">{t("dash.tasks.priority.low")}</option>
              </select>

              {uiMode === "advanced" && (
                <div className="flex items-center gap-1 rounded-md border border-border bg-surface-2 p-0.5">
                  <button
                    type="button"
                    onClick={() => setTaskView("list")}
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                      taskView === "list"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <List className="size-3.5" />
                    <span>{t("prod.view.list")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskView("matrix")}
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                      taskView === "matrix"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <LayoutGrid className="size-3.5" />
                    <span>{t("prod.view.matrix")}</span>
                  </button>
                </div>
              )}

              {doneTasks.length > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleClearCompleted}
                  className="h-8 text-xs"
                >
                  {t("prod.clearDone")} ({doneTasks.length})
                </Button>
              )}
            </div>

            {taskView === "matrix" ? (
              <div className="grid gap-4 md:grid-cols-3">
                {(["high", "medium", "low"] as const).map((prio) => {
                  const colTasks = filteredTasks.filter((tk) => tk.priority === prio);
                  return (
                    <div key={prio} className="space-y-2.5">
                      <h3 className="border-b border-border/80 pb-1.5 text-xs font-bold text-foreground">
                        {t(`prod.matrix.${prio}`)} ({formatNumber(colTasks.length, lang)})
                      </h3>
                      <div className="space-y-2.5">
                        {colTasks.length === 0 ? (
                          <p className="text-xs text-muted-foreground">—</p>
                        ) : (
                          colTasks.map(renderTaskCard)
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">{filteredTasks.map(renderTaskCard)}</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FOCUS TIMER */}
      {tab === "timer" && (
        <div className="space-y-6">
          <StudyPlannerSuite compactQuickLogOnly />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="surface-card flex flex-col items-center space-y-5 p-6 text-center">
              <div className="flex gap-2 rounded-lg bg-surface-2 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setRunning(false);
                    setPhase("work");
                    setSecondsLeft(study.sessionMinutes * 60);
                  }}
                  className={`rounded-md px-3 py-1 font-semibold ${
                    phase === "work"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {t("prod.timer.work")} ({study.sessionMinutes}m)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRunning(false);
                    setPhase("break");
                    setSecondsLeft(study.breakMinutes * 60);
                  }}
                  className={`rounded-md px-3 py-1 font-semibold ${
                    phase === "break"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {t("prod.timer.break")} ({study.breakMinutes}m)
                </button>
              </div>

              {quietActive && (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground">
                  <BellOff className="size-3.5 text-primary" />
                  <span>{t("prod.timer.quietNote")}</span>
                </div>
              )}

              <div className="font-display text-5xl font-extrabold tabular-nums tracking-tight text-foreground sm:text-6xl">
                {minsStr}:{secsStr}
              </div>

              <div className="flex w-full max-w-xs flex-col gap-2">
                <Input
                  value={focusLabel}
                  onChange={(e) => setFocusLabel(e.target.value)}
                  placeholder={t("dash.tasks.fieldTitlePh")}
                  className="text-center text-xs"
                />
                {openTasks.length > 0 && (
                  <select
                    aria-label={t("prod.linkTask")}
                    value={linkedTaskId}
                    onChange={(e) => setLinkedTaskId(e.target.value)}
                    className="h-8 w-full rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
                  >
                    <option value="">{t("prod.linkTaskNone")}</option>
                    {openTasks.map((tk) => (
                      <option key={tk.id} value={tk.id}>
                        {tk.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <Button type="button" variant="glow" onClick={() => setRunning((r) => !r)}>
                  {running ? <Pause className="size-4" /> : <Play className="size-4" />}
                  <span>{running ? t("pomo.pause") : t("pomo.start")}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setRunning(false);
                    setSecondsLeft(
                      (phase === "work" ? study.sessionMinutes : study.breakMinutes) * 60,
                    );
                  }}
                >
                  <RotateCcw className="size-4" />
                </Button>
                <Button type="button" variant="outline" onClick={handleSaveFocusSession}>
                  <CheckCircle2 className="size-4 text-success" />
                  <span>{t("prod.timer.complete")}</span>
                </Button>
              </div>
            </div>

            <div className="surface-card space-y-3 p-5">
              <h2 className="font-display text-base font-bold text-foreground">
                {t("prod.timer.history")}
              </h2>
              {focusSessions.length === 0 ? (
                <p className="text-xs text-muted-foreground">—</p>
              ) : (
                <div className="space-y-2">
                  {focusSessions.slice(0, 10).map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-foreground">{f.title}</div>
                        <div className="text-[0.68rem] text-muted-foreground">
                          {formatDate(f.created_at, { lang, calendar: locale.calendar }, "medium")}
                          {f.subject ? ` · ${f.subject}` : ""}
                        </div>
                      </div>
                      <span className="font-bold tabular-nums text-primary">
                        {f.duration_minutes} {t("set.study.minutes")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {focusSubjectStats.length > 0 && (
            <div className="surface-card space-y-3 p-5">
              <h3 className="font-display text-sm font-bold text-foreground">
                {t("prod.focusBySubject")}
              </h3>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={focusSubjectStats}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="minutes" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INTERACTIVE CALENDAR */}
      {tab === "calendar" && <InteractiveCalendar />}

      {/* TAB 4: DEADLINES */}
      {tab === "deadlines" && (
        <div className="surface-card space-y-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold text-foreground">
              {t("prod.tab.deadlines")}
            </h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={async () => {
                if (quietActive) {
                  toast.info(t("prod.timer.quietNote"));
                  return;
                }
                if (typeof window === "undefined" || !("Notification" in window)) {
                  toast.info("Browser notifications are unavailable here—using in-app reminders.");
                  return;
                }
                const perm =
                  Notification.permission === "default"
                    ? await Notification.requestPermission()
                    : Notification.permission;
                if (perm === "granted") {
                  const nextTask = deadlineTasks[0];
                  new Notification(`${BRAND.shortName} Study Reminder`, {
                    body: nextTask
                      ? `Upcoming deadline: ${nextTask.title}`
                      : "All study deadlines are up to date!",
                  });
                  toast.success("Study deadline reminder triggered!");
                } else {
                  toast.info(
                    "Notifications blocked by browser—check Settings or browser permissions.",
                  );
                }
              }}
            >
              Trigger Deadline Check
            </Button>
          </div>
          {deadlineTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t("prod.cal.noEvents")}</p>
          ) : (
            <div className="space-y-2">
              {deadlineTasks.map((tk) => {
                const isOverdue =
                  (tk.due_at ?? "").slice(0, 10) < new Date().toISOString().slice(0, 10);
                return (
                  <div
                    key={tk.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 p-3"
                  >
                    <div>
                      <div className="text-sm font-semibold text-foreground">{tk.title}</div>
                      <div
                        className={`text-xs ${
                          isOverdue ? "font-semibold text-destructive" : "text-muted-foreground"
                        }`}
                      >
                        {formatDate(tk.due_at!, { lang, calendar: locale.calendar }, "medium")}
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => completeTask(tk, 25)}
                    >
                      <CheckCircle2 className="size-3.5 text-success" />
                      <span>{t("tasks.done")}</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
