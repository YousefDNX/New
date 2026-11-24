import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCareEntries,
  useCircles,
  useFocusSessions,
  useFuturePlans,
  useJournalEntries,
  useStudyItems,
} from "@/hooks/use-modules";
import { useActivityEvents, useGoalActions, useGoals, useTasks } from "@/hooks/use-nexora";
import { AREA_CONFIG, AREAS, computeWeeklyObjectivesBoard, type Area } from "@/lib/growth";
import { formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";

function endOfCurrentWeekIso(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const daysUntilSunday = (7 - day) % 7;
  return new Date(now.getTime() + daysUntilSunday * 86400_000).toISOString().slice(0, 10);
}

export function WeeklyObjectivesBoard() {
  const { t, lang } = usePrefs();
  const { data: goals = [] } = useGoals();
  const { data: tasks = [] } = useTasks();
  const { data: events = [] } = useActivityEvents(120);
  const { data: studyItems = [] } = useStudyItems();
  const { data: focusSessions = [] } = useFocusSessions();
  const { data: journalEntries = [] } = useJournalEntries();
  const { data: careEntries = [] } = useCareEntries();
  const { data: futurePlans = [] } = useFuturePlans();
  const { data: circles = [] } = useCircles();
  const { addGoal, toggleGoal, deleteGoal } = useGoalActions();

  const [selectedArea, setSelectedArea] = useState<Area>("academic");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  const board = useMemo(() => {
    const cutoffMs = Date.now() - 7 * 86400_000;
    const recentCount = (rows: Array<{ created_at: string }>) =>
      rows.filter((r) => Date.parse(r.created_at) >= cutoffMs).length;

    return computeWeeklyObjectivesBoard({
      goals,
      tasks,
      events,
      studyItemsCountRecent: recentCount(studyItems),
      focusSessionsCountRecent: recentCount(focusSessions),
      journalCountRecent: recentCount(journalEntries),
      careCountRecent: recentCount(careEntries),
      futureCount: futurePlans.length,
      circleCount: circles.length,
    });
  }, [
    goals,
    tasks,
    events,
    studyItems,
    focusSessions,
    journalEntries,
    careEntries,
    futurePlans.length,
    circles.length,
  ]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = title.trim();
    if (!clean) return;
    setBusy(true);
    try {
      await addGoal({
        title: clean,
        area: selectedArea,
        is_daily: false,
        target_date: endOfCurrentWeekIso(),
      });
      setTitle("");
      toast.success(t("weekly.toastAdded"));
    } catch {
      toast.error(t("dash.goals.errAdd"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="surface-card space-y-5 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="size-4.5 text-primary" />
            <h2 className="font-display text-base font-bold text-foreground">
              {t("weekly.title")}
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t("weekly.sub")}</p>
        </div>

        <form onSubmit={handleAdd} className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <select
            aria-label={t("weekly.category")}
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value as Area)}
            className="h-9 rounded-md border border-input bg-surface-2 px-2.5 text-xs text-foreground"
          >
            {AREAS.map((areaKey) => (
              <option key={areaKey} value={areaKey}>
                {t(AREA_CONFIG[areaKey].labelKey)}
              </option>
            ))}
          </select>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("weekly.addPlaceholder")}
            maxLength={180}
            className="h-9 min-w-52 flex-1 text-xs sm:w-64"
          />
          <Button
            type="submit"
            variant="glow"
            size="sm"
            disabled={busy || !title.trim()}
            className="h-9 whitespace-nowrap shrink-0"
          >
            <Plus className="size-3.5" />
            <span>{t("weekly.add")}</span>
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {AREAS.map((areaKey) => {
          const cfg = AREA_CONFIG[areaKey];
          const cell = board[areaKey];
          return (
            <div
              key={areaKey}
              className="flex flex-col justify-between rounded-xl border border-border bg-surface-2/60 p-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="font-display text-sm font-bold"
                    style={{ color: cfg.accentColor }}
                  >
                    {t(cfg.labelKey)}
                  </span>
                  <span className="font-mono text-xs font-bold tabular-nums text-foreground">
                    {formatNumber(cell.progressPct, lang)}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cell.progressPct}%`,
                        backgroundColor: cfg.accentColor,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground tabular-nums">
                    <span>{t("weekly.targetLabel")}</span>
                    <span>
                      {formatNumber(cell.weeklyActivityUnits, lang)} /{" "}
                      {formatNumber(cell.weeklyActivityTarget, lang)}
                    </span>
                  </div>
                </div>

                {cell.objectives.length === 0 ? (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {t("weekly.emptyCat")}
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {cell.objectives.slice(0, 4).map((obj) => {
                      const done = obj.status === "completed";
                      return (
                        <div
                          key={obj.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-surface px-2.5 py-2 text-xs"
                        >
                          <button
                            type="button"
                            onClick={async () => {
                              await toggleGoal(obj);
                              toast.success(
                                done
                                  ? t("dash.goals.toastUndo")
                                  : `${t("dash.goals.toastDone")} (+40 XP)`,
                              );
                            }}
                            className="flex min-w-0 flex-1 items-center gap-2 text-start"
                          >
                            {done ? (
                              <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                            ) : (
                              <Circle className="size-3.5 shrink-0 text-muted-foreground" />
                            )}
                            <span
                              className={`truncate ${
                                done
                                  ? "line-through text-muted-foreground"
                                  : "font-medium text-foreground"
                              }`}
                            >
                              {obj.title}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteGoal(obj.id)}
                            aria-label={`${t("goals.delete")}: ${obj.title}`}
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
