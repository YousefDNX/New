import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Repeat,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { VoiceDictationButton } from "@/components/common/VoiceDictationButton";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { useGoals, useTasks, useTaskActions, type TaskRow } from "@/hooks/use-nexora";
import type { GrowthArea, TaskStatus } from "@/lib/firestore-data";
import { AREA_CONFIG, AREAS, type Area } from "@/lib/growth";
import { formatDate } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import { isTaskClosed, isTaskOpen } from "@/lib/recommendations";
import { useExperienceMode } from "@/lib/experience-mode";
import { AdaptiveDataView, type AdaptiveDataItem } from "@/components/adaptive/AdaptiveDataView";
import { AdaptiveFormView, type AdaptiveFormStep } from "@/components/adaptive/AdaptiveFormView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function TasksWidget({
  filterArea,
  onClearArea,
}: {
  filterArea?: string | null;
  onClearArea?: () => void;
}) {
  const { data: tasks = [] } = useTasks();
  const { data: goals = [] } = useGoals();
  const { completeTask, setTaskStatus, addTask, deleteTask } = useTaskActions();
  const { t, lang, locale } = usePrefs();
  const { mode } = useExperienceMode();
  const isAr = lang === "ar";

  const [filter, setFilter] = useState<"pending" | "done" | "all">("pending");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newArea, setNewArea] = useState<GrowthArea>("productivity");
  const [newRecurrence, setNewRecurrence] = useState<"none" | "daily" | "weekly">("none");
  const [newDueDate, setNewDueDate] = useState("");
  const [newGoalId, setNewGoalId] = useState("");
  const [busy, setBusy] = useState(false);

  const goalTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of goals) map.set(g.id, g.title);
    return map;
  }, [goals]);

  const activeAreaConfig =
    filterArea && AREAS.includes(filterArea as Area) ? AREA_CONFIG[filterArea as Area] : null;

  const displayedTasks = tasks
    .filter((task) => {
      if (filterArea && (task.area ?? "productivity") !== filterArea) return false;
      if (filter === "pending") return isTaskOpen(task.status);
      if (filter === "done") return isTaskClosed(task.status);
      return true;
    })
    .sort((a, b) => {
      const aClosed = isTaskClosed(a.status);
      const bClosed = isTaskClosed(b.status);
      if (aClosed && !bClosed) return 1;
      if (!aClosed && bClosed) return -1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleToggle = async (task: TaskRow) => {
    try {
      const willBeDone = task.status !== "done";
      await completeTask(task, 25);
      if (willBeDone) {
        toast.success(t("dash.tasks.toastDone"), { icon: "⚡" });
      } else {
        toast.info(t("dash.tasks.toastUndo"));
      }
    } catch {
      toast.error(t("dash.tasks.errUpdate"));
    }
  };

  const handleCycleInProgress = async (task: TaskRow) => {
    try {
      const next: TaskStatus = task.status === "in_progress" ? "todo" : "in_progress";
      await setTaskStatus(task, next);
      toast.info(t(`tasks.status.${next}`));
    } catch {
      toast.error(t("dash.tasks.errUpdate"));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setBusy(true);
    try {
      await addTask({
        title: newTitle.trim(),
        priority: newPriority,
        area: activeAreaConfig ? (activeAreaConfig.id as GrowthArea) : newArea,
        recurrence: newRecurrence,
        due_at: newDueDate ? new Date(newDueDate).toISOString() : null,
        goal_id: newGoalId || null,
      });
      toast.success(t("dash.tasks.toastAdd"));
      setNewTitle("");
      setNewDueDate("");
      setNewPriority("medium");
      setNewRecurrence("none");
      setNewGoalId("");
      setIsAddOpen(false);
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      toast.info(t("dash.tasks.toastDel"));
    } catch {
      toast.error(t("dash.tasks.errDel"));
    }
  };

  const formatDue = (dateStr: string | null) => {
    if (!dateStr) return null;
    return formatDate(
      dateStr,
      {
        lang,
        timezone: locale.timezone,
        dateFormat: locale.dateFormat,
        calendar: locale.calendar,
      },
      "medium",
    );
  };

  const getPriorityBadge = (p: string) => {
    if (p === "high") {
      return (
        <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[0.65rem] font-semibold text-destructive">
          {t("dash.tasks.priority.high")}
        </span>
      );
    }
    if (p === "low") {
      return (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
          {t("dash.tasks.priority.low")}
        </span>
      );
    }
    return (
      <span className="rounded-full bg-xp/15 px-2 py-0.5 text-[0.65rem] font-medium text-xp">
        {t("dash.tasks.priority.medium")}
      </span>
    );
  };

  return (
    <div className="surface-card flex h-full flex-col p-5">
      <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-4">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">
            {t("dash.tasks.upcoming")}
          </h2>
          <p className="text-xs text-muted-foreground">{t("dash.tasks.sub")}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <FeatureGuideTrigger featureId="tasks-widget" iconOnly />
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="glow" className="h-8 gap-1.5 text-xs">
                <Plus className="size-3.5" />
                <span>{t("dash.tasks.quickAdd")}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="surface-card sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">{t("dash.tasks.addTitle")}</DialogTitle>
              </DialogHeader>
              <AdaptiveFormView
                onSubmit={handleCreate}
                onCancel={() => setIsAddOpen(false)}
                submitLabel={`${t("common.add")} (+25 ${t("common.xp")})`}
                cancelLabel={t("common.cancel")}
                nextLabel={isAr ? "التالي" : "Next"}
                backLabel={isAr ? "السابق" : "Back"}
                stepPrefix={isAr ? "الخطوة" : "Step"}
                busy={busy}
                submitDisabled={!newTitle.trim()}
                steps={
                  [
                    {
                      id: "basics",
                      title: isAr ? "١ · تفاصيل المهمة" : "1 · Task Basics",
                      description: isAr
                        ? "حدد عنوان المهمة والأولوية والموعد"
                        : "Enter task title, priority, and due date",
                      canProceed: Boolean(newTitle.trim()),
                      content: (
                        <>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <Label htmlFor="t-title">{t("dash.tasks.fieldTitle")}</Label>
                              <VoiceDictationButton
                                size="icon"
                                onInsert={(text) =>
                                  setNewTitle((prev) => (prev ? `${prev} ${text}` : text))
                                }
                              />
                            </div>
                            <Input
                              id="t-title"
                              placeholder={t("dash.tasks.fieldTitlePh")}
                              required
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="t-priority">{t("dash.tasks.priority")}</Label>
                              <select
                                id="t-priority"
                                value={newPriority}
                                onChange={(e) =>
                                  setNewPriority(e.target.value as "low" | "medium" | "high")
                                }
                                className="h-9 w-full rounded-md border border-input bg-surface-2 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="high">{t("dash.tasks.priority.high")}</option>
                                <option value="medium">{t("dash.tasks.priority.medium")}</option>
                                <option value="low">{t("dash.tasks.priority.low")}</option>
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="t-due">{t("dash.tasks.dueDate")}</Label>
                              <Input
                                id="t-due"
                                type="date"
                                value={newDueDate}
                                onChange={(e) => setNewDueDate(e.target.value)}
                              />
                            </div>
                          </div>
                        </>
                      ),
                    },
                    {
                      id: "schedule",
                      title: isAr ? "٢ · التصنيف والهدف" : "2 · Area & Goal Link",
                      description: isAr
                        ? "اربط المهمة بمجال النمو والتكرار"
                        : "Connect growth domain, recurrence, and optional goal",
                      content: (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="t-area">{t("prod.area")}</Label>
                              <select
                                id="t-area"
                                value={activeAreaConfig ? activeAreaConfig.id : newArea}
                                onChange={(e) => setNewArea(e.target.value as GrowthArea)}
                                className="h-9 w-full rounded-md border border-input bg-surface-2 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                {AREAS.map((areaKey) => (
                                  <option key={areaKey} value={areaKey}>
                                    {t(AREA_CONFIG[areaKey].labelKey)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="t-rec">{t("prod.recurrence")}</Label>
                              <select
                                id="t-rec"
                                value={newRecurrence}
                                onChange={(e) =>
                                  setNewRecurrence(e.target.value as "none" | "daily" | "weekly")
                                }
                                className="h-9 w-full rounded-md border border-input bg-surface-2 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="none">{t("prod.rec.none")}</option>
                                <option value="daily">{t("prod.rec.daily")}</option>
                                <option value="weekly">{t("prod.rec.weekly")}</option>
                              </select>
                            </div>
                          </div>

                          {goals.length > 0 && (
                            <div className="space-y-1.5">
                              <Label htmlFor="t-goal">{t("tasks.goalLink")}</Label>
                              <select
                                id="t-goal"
                                value={newGoalId}
                                onChange={(e) => setNewGoalId(e.target.value)}
                                className="h-9 w-full rounded-md border border-input bg-surface-2 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="">{t("tasks.noGoal")}</option>
                                {goals.map((g) => (
                                  <option key={g.id} value={g.id}>
                                    {g.title}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </>
                      ),
                    },
                  ] satisfies AdaptiveFormStep[]
                }
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {activeAreaConfig && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs">
          <span className="font-medium text-foreground">
            {t("dash.tasks.areaFilter")}:{" "}
            <strong className="text-primary">{t(activeAreaConfig.labelKey)}</strong>
          </span>
          {onClearArea && (
            <button
              type="button"
              onClick={onClearArea}
              className="font-semibold text-primary hover:underline"
            >
              {t("dash.tasks.clearArea")}
            </button>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-1 rounded-lg bg-surface-2 p-1 text-xs">
        <button
          type="button"
          onClick={() => setFilter("pending")}
          className={`flex-1 rounded-md py-1 font-medium transition-colors ${
            filter === "pending"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("tasks.todo")}
        </button>
        <button
          type="button"
          onClick={() => setFilter("done")}
          className={`flex-1 rounded-md py-1 font-medium transition-colors ${
            filter === "done"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("tasks.done")}
        </button>
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`flex-1 rounded-md py-1 font-medium transition-colors ${
            filter === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("common.all")}
        </button>
      </div>

      {mode !== "classic" ? (
        <div className="mt-3 flex-1">
          <AdaptiveDataView
            items={displayedTasks.map((task): AdaptiveDataItem => {
              const taskArea =
                AREA_CONFIG[(task.area as Area) || "productivity"] ?? AREA_CONFIG.productivity;
              return {
                id: task.id,
                title: task.title,
                details: task.details,
                status: task.status,
                priorityLabel: t(`dash.tasks.priority.${task.priority}` as Parameters<typeof t>[0]),
                priorityTone: task.priority,
                categoryLabel: t(taskArea.labelKey),
                dueLabel: formatDue(task.due_at),
                goalTitle: task.goal_id ? (goalTitleMap.get(task.goal_id) ?? null) : null,
                xpLabel: `+25 ${t("common.xp")}`,
              };
            })}
            onToggleDone={(item) => {
              const found = displayedTasks.find((tRow) => tRow.id === item.id);
              if (found) void handleToggle(found);
            }}
            onToggleInProgress={(item) => {
              const found = displayedTasks.find((tRow) => tRow.id === item.id);
              if (found) void handleCycleInProgress(found);
            }}
            onDelete={(id) => void handleDelete(id)}
            emptyState={
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="mb-2 size-8 text-muted-foreground/40" />
                <p className="text-sm font-medium text-foreground">{t("dash.tasks.empty")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("dash.tasks.emptyHint")}</p>
              </div>
            }
            labels={{
              colItem: isAr ? "المهمة" : "Task",
              colCategory: t("prod.area"),
              colPriority: t("dash.tasks.priority"),
              colStatus: isAr ? "الحالة" : "Status",
              colActions: isAr ? "إجراءات" : "Actions",
              todo: t("tasks.todo"),
              inProgress: t("tasks.status.in_progress"),
              done: t("tasks.done"),
              markDone: isAr ? "إتمام" : "Complete",
              markTodo: isAr ? "إعادة" : "Reopen",
              inspectDrawer: isAr ? "معاينة بالدرج" : "Open Drawer",
              deleteLabel: t("common.delete"),
              selectHint: t("dash.tasks.sub"),
            }}
          />
        </div>
      ) : (
        <div className="mt-3 max-h-80 flex-1 space-y-2 overflow-y-auto pe-1">
          {displayedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="mb-2 size-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">{t("dash.tasks.empty")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("dash.tasks.emptyHint")}</p>
            </div>
          ) : (
            displayedTasks.map((task) => {
              const isClosed = isTaskClosed(task.status);
              const isDone = task.status === "done";
              const dueFormatted = formatDue(task.due_at);
              const taskArea =
                AREA_CONFIG[(task.area as Area) || "productivity"] ?? AREA_CONFIG.productivity;
              const subtaskCount = task.subtasks?.length ?? 0;
              const subtaskDone = task.subtasks?.filter((s) => s.done).length ?? 0;
              const linkedGoalTitle = task.goal_id ? goalTitleMap.get(task.goal_id) : null;

              return (
                <div
                  key={task.id}
                  className={`group flex items-start justify-between gap-3 rounded-lg border p-3 transition-all ${
                    isClosed
                      ? "border-border/40 bg-surface-2/40 opacity-75"
                      : "border-border bg-surface-2 hover:border-primary/50 hover:bg-surface-2/90"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggle(task)}
                    aria-pressed={isDone}
                    className="flex min-w-0 flex-1 items-start gap-2.5 text-start"
                  >
                    <span className="mt-0.5 text-muted-foreground transition-colors group-hover:text-primary">
                      {isDone ? (
                        <CheckCircle2 className="size-4.5 fill-success/20 text-success" />
                      ) : task.status === "in_progress" ? (
                        <Clock className="size-4.5 text-primary" />
                      ) : (
                        <Circle className="size-4.5" />
                      )}
                    </span>

                    <div className="min-w-0">
                      <p
                        className={`truncate text-sm font-medium leading-snug ${
                          isClosed ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </p>

                      {task.details && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {task.details}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground">
                        {getPriorityBadge(task.priority)}

                        {task.status === "in_progress" && (
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
                            {t("tasks.status.in_progress")}
                          </span>
                        )}
                        {task.status === "cancelled" && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] text-muted-foreground">
                            {t("tasks.status.cancelled")}
                          </span>
                        )}

                        <span
                          className="rounded-full px-2 py-0.5 text-[0.65rem] font-medium"
                          style={{
                            backgroundColor: taskArea.accentBg,
                            color: taskArea.accentColor,
                          }}
                        >
                          {t(taskArea.labelKey)}
                        </span>

                        {linkedGoalTitle && (
                          <span className="inline-flex max-w-36 items-center gap-1 truncate rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[0.65rem] text-primary">
                            <Target className="size-2.5 shrink-0" />
                            <span className="truncate">{linkedGoalTitle}</span>
                          </span>
                        )}

                        {task.recurrence && task.recurrence !== "none" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-[0.65rem]">
                            <Repeat className="size-2.5" />
                            <span>
                              {task.recurrence === "daily"
                                ? t("prod.rec.daily")
                                : t("prod.rec.weekly")}
                            </span>
                          </span>
                        )}

                        {subtaskCount > 0 && (
                          <span className="tabular-nums text-[0.65rem]">
                            {subtaskDone}/{subtaskCount} {t("prod.subtasks")}
                          </span>
                        )}

                        {dueFormatted && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            <span>{dueFormatted}</span>
                          </span>
                        )}

                        <span className="font-semibold text-primary">+25 {t("common.xp")}</span>
                      </div>
                    </div>
                  </button>

                  <div className="flex shrink-0 items-center gap-0.5">
                    {!isClosed && (
                      <button
                        type="button"
                        onClick={() => handleCycleInProgress(task)}
                        className={`p-1 transition-colors ${
                          task.status === "in_progress"
                            ? "text-primary"
                            : "text-muted-foreground opacity-70 hover:text-primary group-hover:opacity-100"
                        }`}
                        title={t("tasks.status.in_progress")}
                        aria-label={`${t("tasks.status.in_progress")}: ${task.title}`}
                      >
                        <Clock className="size-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      className="p-1 text-muted-foreground opacity-70 transition-opacity hover:text-destructive group-hover:opacity-100"
                      title={t("common.delete")}
                      aria-label={`${t("common.delete")}: ${task.title}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
