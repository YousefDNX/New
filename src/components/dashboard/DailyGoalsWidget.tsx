import { useMemo, useState } from "react";
import {
  Target,
  CheckCircle2,
  Circle,
  Plus,
  Award,
  RefreshCw,
  Sparkles,
  Pencil,
  Trash2,
  PauseCircle,
  PlayCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useGoals, useGoalActions, useTasks, type GoalRow } from "@/hooks/use-nexora";
import type { FutureMilestoneItem, GoalStatus } from "@/lib/firestore-data";
import { formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import { AREA_CONFIG, AREAS, type Area } from "@/lib/growth";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { useToast } from "@/components/common/ToastProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModernSelect } from "@/components/ui/modern-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DailyGoalsWidget() {
  const { data: goals = [] } = useGoals();
  const { data: tasks = [] } = useTasks();
  const { toggleGoal, addGoal, updateGoal, deleteGoal, resetAllDailyGoals } = useGoalActions();
  const { t, lang, a11y } = usePrefs();
  const appToast = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newArea, setNewArea] = useState<Area>("academic");
  const [newTargetDate, setNewTargetDate] = useState("");
  const [newIsDaily, setNewIsDaily] = useState(true);
  const [busy, setBusy] = useState(false);

  // Edit Goal Dialog state
  const [editingGoal, setEditingGoal] = useState<GoalRow | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArea, setEditArea] = useState<Area>("academic");
  const [editTargetDate, setEditTargetDate] = useState("");
  const [editIsDaily, setEditIsDaily] = useState(false);
  const [editStatus, setEditStatus] = useState<GoalStatus>("active");
  const [editMilestones, setEditMilestones] = useState<FutureMilestoneItem[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");

  const linkedTaskCounts = useMemo(() => {
    const counts = new Map<string, { total: number; done: number }>();
    for (const tk of tasks) {
      if (!tk.goal_id) continue;
      const cur = counts.get(tk.goal_id) ?? { total: 0, done: 0 };
      cur.total += 1;
      if (tk.status === "done") cur.done += 1;
      counts.set(tk.goal_id, cur);
    }
    return counts;
  }, [tasks]);

  const completedCount = goals.filter((g) => g.status === "completed").length;
  const progressPct = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;
  const allMet = goals.length > 0 && completedCount === goals.length;
  const hasCompletedDaily = goals.some((g) => g.is_daily && g.status === "completed");

  const openEdit = (goal: GoalRow) => {
    setEditingGoal(goal);
    setEditTitle(goal.title);
    setEditArea((goal.area as Area) || "academic");
    setEditTargetDate(goal.target_date ?? "");
    setEditIsDaily(Boolean(goal.is_daily));
    setEditStatus(goal.status);
    setEditMilestones(goal.milestones ?? []);
    setNewMilestoneTitle("");
  };

  const handleToggle = async (goal: GoalRow) => {
    try {
      const willBeDone = goal.status !== "completed";
      await toggleGoal(goal);
      if (willBeDone) {
        const nextDone = completedCount + 1;
        if (goals.length > 0 && nextDone >= goals.length) {
          appToast.milestoneAchieved(t("dash.goals.allMet"), 40, goal.title);
        } else {
          appToast.goalCompleted(goal.title, 40);
        }
      } else {
        toast.info(t("dash.goals.toastUndo"));
      }
    } catch {
      toast.error(t("dash.goals.errUpdate"));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setBusy(true);
    try {
      await addGoal({
        title: newTitle.trim(),
        area: newArea,
        is_daily: newIsDaily,
        target_date: newTargetDate || null,
      });
      toast.success(t("dash.goals.toastAdd"));
      setNewTitle("");
      setNewTargetDate("");
      setNewIsDaily(true);
      setIsAddOpen(false);
    } catch {
      toast.error(t("dash.goals.errAdd"));
    } finally {
      setBusy(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !editTitle.trim()) return;
    setBusy(true);
    try {
      await updateGoal(editingGoal, {
        title: editTitle.trim(),
        area: editArea,
        target_date: editTargetDate || null,
        is_daily: editIsDaily,
        status: editStatus,
        milestones: editMilestones,
      });
      toast.success(t("common.save"));
      setEditingGoal(null);
    } catch {
      toast.error(t("dash.goals.errUpdate"));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      if (editingGoal?.id === goalId) setEditingGoal(null);
      toast.info(t("common.delete"));
    } catch {
      toast.error(t("dash.goals.errUpdate"));
    }
  };

  const handleTogglePause = async (goal: GoalRow) => {
    try {
      const nextStatus: GoalStatus = goal.status === "paused" ? "active" : "paused";
      await updateGoal(goal, { status: nextStatus });
      toast.info(nextStatus === "paused" ? t("goals.paused") : t("goals.resume"));
    } catch {
      toast.error(t("dash.goals.errUpdate"));
    }
  };

  const addEditMilestone = () => {
    const clean = newMilestoneTitle.trim();
    if (!clean || editMilestones.length >= 12) return;
    setEditMilestones((prev) => [
      ...prev,
      { id: `gm_${Date.now().toString(36)}`, title: clean.slice(0, 120), done: false },
    ]);
    setNewMilestoneTitle("");
  };

  const handleManualReset = async () => {
    try {
      await resetAllDailyGoals(goals);
      toast.info(t("dash.goals.toastUndo"));
    } catch {
      toast.error(t("dash.goals.errUpdate"));
    }
  };

  return (
    <div className="surface-card flex h-full flex-col p-5">
      <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-4">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">
            {t("dash.goals.title")}
          </h2>
          <p className="text-xs text-muted-foreground">{t("dash.goals.sub")}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <FeatureGuideTrigger featureId="daily-goals" iconOnly />
          {hasCompletedDaily && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleManualReset}
              className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
              title={t("dash.goals.dailyBadge")}
            >
              <RefreshCw className="size-3.5" />
            </Button>
          )}

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
                <Plus className="size-3.5" />
                <span>{t("dash.goals.add")}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="surface-card sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">{t("dash.goals.addTitle")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="g-title">{t("dash.goals.fieldDesc")}</Label>
                  <Input
                    id="g-title"
                    placeholder={t("dash.goals.fieldDescPh")}
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="g-area">{t("dash.areas")}</Label>
                    <ModernSelect
                      id="g-area"
                      size="sm"
                      value={newArea}
                      onValueChange={(val) => setNewArea(val as Area)}
                      options={AREAS.map((areaKey) => ({
                        value: areaKey,
                        label: t(AREA_CONFIG[areaKey].labelKey),
                      }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="g-due">{t("dash.goals.targetDate")}</Label>
                    <Input
                      id="g-due"
                      type="date"
                      value={newTargetDate}
                      onChange={(e) => setNewTargetDate(e.target.value)}
                    />
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-foreground">
                  <input
                    type="checkbox"
                    checked={newIsDaily}
                    onChange={(e) => setNewIsDaily(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                  <span>{t("dash.goals.dailyToggle")}</span>
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddOpen(false)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    variant="glow"
                    size="sm"
                    disabled={busy || !newTitle.trim()}
                  >
                    {t("common.add")} (+40 {t("common.xp")})
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Daily Progress Bar */}
      {goals.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs tabular-nums">
            <span className="font-medium text-muted-foreground">{t("dash.goals.progress")}</span>
            <span className="font-bold text-primary">
              {formatNumber(completedCount, lang)} / {formatNumber(goals.length, lang)} (
              {formatNumber(progressPct, lang)}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {allMet && (
            <div
              aria-live="polite"
              className={`flex items-center gap-2 rounded-lg border border-xp/40 bg-xp/10 px-3 py-1.5 text-xs font-semibold text-xp ${
                a11y.reduceMotion ? "" : "animate-pulse"
              }`}
            >
              <Sparkles className="size-3.5 shrink-0" />
              <span>{t("dash.goals.allMet")}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 max-h-80 flex-1 space-y-2 overflow-y-auto pe-1">
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Target className="mb-2 size-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">{t("dash.goals.empty")}</p>
          </div>
        ) : (
          goals.map((goal) => {
            const isDone = goal.status === "completed";
            const isPaused = goal.status === "paused";
            const areaConfig = AREA_CONFIG[goal.area as Area] || AREA_CONFIG.academic;
            const linked = linkedTaskCounts.get(goal.id);
            const milestoneTotal = goal.milestones?.length ?? 0;
            const milestoneDone = goal.milestones?.filter((m) => m.done).length ?? 0;

            return (
              <div
                key={goal.id}
                className={`group flex w-full items-start justify-between gap-2 rounded-lg border p-3 text-start transition-all ${
                  isDone
                    ? "border-border/40 bg-surface-2/40 opacity-75"
                    : isPaused
                      ? "border-border/60 bg-surface-2/60 opacity-85"
                      : "border-border bg-surface-2 hover:border-primary/50 hover:bg-surface-2/90"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(goal)}
                  aria-pressed={isDone}
                  className="flex min-w-0 flex-1 items-start gap-2.5 text-start"
                >
                  <span className="mt-0.5 text-muted-foreground transition-colors group-hover:text-primary">
                    {isDone ? (
                      <CheckCircle2 className="size-4.5 fill-primary/20 text-primary" />
                    ) : (
                      <Circle className="size-4.5" />
                    )}
                  </span>

                  <div className="min-w-0">
                    <p
                      className={`truncate text-sm font-medium leading-snug ${
                        isDone ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {goal.title}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.7rem]">
                      <span
                        className="rounded-full px-2 py-0.5 font-medium"
                        style={{
                          backgroundColor: areaConfig.accentBg,
                          color: areaConfig.accentColor,
                        }}
                      >
                        {t(areaConfig.labelKey)}
                      </span>

                      {goal.is_daily && (
                        <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[0.65rem] text-muted-foreground">
                          {t("dash.goals.dailyBadge")}
                        </span>
                      )}

                      {isPaused && (
                        <span className="rounded-full border border-xp/40 bg-xp/10 px-2 py-0.5 text-[0.65rem] font-semibold text-xp">
                          {t("goals.paused")}
                        </span>
                      )}

                      {linked && linked.total > 0 && (
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[0.65rem] text-primary tabular-nums">
                          {formatNumber(linked.done, lang)}/{formatNumber(linked.total, lang)}{" "}
                          {t("goals.linkedTasks")}
                        </span>
                      )}

                      {milestoneTotal > 0 && (
                        <span className="text-[0.65rem] text-muted-foreground tabular-nums">
                          {formatNumber(milestoneDone, lang)}/{formatNumber(milestoneTotal, lang)}{" "}
                          {t("goals.milestones")}
                        </span>
                      )}

                      <span className="flex items-center gap-1 font-semibold text-xp">
                        <Award className="size-3" />
                        +40 {t("common.xp")}
                      </span>
                    </div>
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleTogglePause(goal)}
                    aria-label={
                      isPaused
                        ? `${t("goals.resume")}: ${goal.title}`
                        : `${t("goals.pause")}: ${goal.title}`
                    }
                    title={isPaused ? t("goals.resume") : t("goals.pause")}
                    className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {isPaused ? (
                      <PlayCircle className="size-3.5 text-primary" />
                    ) : (
                      <PauseCircle className="size-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(goal)}
                    aria-label={`${t("goals.edit")}: ${goal.title}`}
                    title={t("goals.edit")}
                    className="p-1 text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(goal.id)}
                    aria-label={`${t("goals.delete")}: ${goal.title}`}
                    title={t("goals.delete")}
                    className="p-1 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Goal & Milestones Dialog */}
      <Dialog open={editingGoal !== null} onOpenChange={(o) => !o && setEditingGoal(null)}>
        <DialogContent className="surface-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{t("goals.edit")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="eg-title">{t("dash.goals.fieldDesc")}</Label>
              <Input
                id="eg-title"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="eg-area">{t("dash.areas")}</Label>
                <ModernSelect
                  id="eg-area"
                  size="sm"
                  value={editArea}
                  onValueChange={(val) => setEditArea(val as Area)}
                  options={AREAS.map((areaKey) => ({
                    value: areaKey,
                    label: t(AREA_CONFIG[areaKey].labelKey),
                  }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="eg-due">{t("dash.goals.targetDate")}</Label>
                <Input
                  id="eg-due"
                  type="date"
                  value={editTargetDate}
                  onChange={(e) => setEditTargetDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={editIsDaily}
                  onChange={(e) => setEditIsDaily(e.target.checked)}
                  className="size-4 accent-primary"
                />
                <span>{t("dash.goals.dailyToggle")}</span>
              </label>

              <ModernSelect
                ariaLabel={t("goals.edit")}
                size="sm"
                value={editStatus}
                onValueChange={(val) => setEditStatus(val as GoalStatus)}
                options={[
                  { value: "active", label: t("goals.resume") },
                  { value: "paused", label: t("goals.paused") },
                  { value: "completed", label: t("tasks.status.done") },
                ]}
              />
            </div>

            {/* Goal Milestones */}
            <div className="space-y-2 rounded-xl border border-border bg-surface-2/60 p-3">
              <div className="text-xs font-semibold text-foreground">{t("goals.milestones")}</div>
              <div className="flex gap-1.5">
                <Input
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder={t("goals.addMilestone")}
                  className="h-8 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEditMilestone();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={addEditMilestone}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
              {editMilestones.length > 0 && (
                <div className="max-h-36 space-y-1.5 overflow-y-auto pt-1">
                  {editMilestones.map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-2 text-xs">
                      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={m.done}
                          onChange={() => {
                            const willComplete = !m.done;
                            setEditMilestones((prev) =>
                              prev.map((x) => (x.id === m.id ? { ...x, done: !x.done } : x)),
                            );
                            if (willComplete) {
                              appToast.milestoneAchieved(m.title, 25, editTitle);
                            }
                          }}
                          className="size-3.5 accent-primary"
                        />
                        <span
                          className={`truncate ${m.done ? "line-through text-muted-foreground" : "text-foreground"}`}
                        >
                          {m.title}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setEditMilestones((prev) => prev.filter((x) => x.id !== m.id))
                        }
                        className="p-0.5 text-muted-foreground hover:text-destructive"
                        aria-label={`${t("common.delete")}: ${m.title}`}
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingGoal(null)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" variant="glow" size="sm" disabled={busy || !editTitle.trim()}>
                {t("common.save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
