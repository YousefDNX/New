import { useMemo, useState } from "react";
import { CalendarHeart, CheckCircle2, Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { useStats, useTaskActions, useTasks } from "@/hooks/use-nexora";
import { useStudyItems } from "@/hooks/use-modules";
import {
  assessLearningBacklog,
  buildRecoverySchedule,
  type RecoveryPace,
} from "@/lib/learning-recovery";

export function LearningRecoveryPlanner() {
  const { data: tasks = [] } = useTasks();
  const { data: studyItems = [] } = useStudyItems();
  const { data: stats } = useStats();
  const { updateTask } = useTaskActions();

  const [pace, setPace] = useState<RecoveryPace>("gentle");
  const [expanded, setExpanded] = useState(false);
  const [applying, setApplying] = useState(false);
  const [appliedCount, setAppliedCount] = useState<number | null>(null);

  const assessment = useMemo(
    () =>
      assessLearningBacklog({
        tasks,
        studyItems,
        currentStreak: stats?.current_streak ?? 0,
      }),
    [tasks, studyItems, stats?.current_streak],
  );

  const schedule = useMemo(
    () =>
      buildRecoverySchedule({
        overdueTasks: assessment.overdueTasks,
        pace,
      }),
    [assessment.overdueTasks, pace],
  );

  if (!assessment.needsRecovery && appliedCount === null) {
    return null;
  }

  const handleApplyRecoveryPlan = async () => {
    if (schedule.steps.length === 0) return;
    setApplying(true);
    try {
      let updated = 0;
      for (const step of schedule.steps) {
        const task = assessment.overdueTasks.find((t) => t.id === step.taskId);
        if (!task) continue;
        await updateTask(task, { due_at: step.newDueAt });
        updated++;
      }
      setAppliedCount(updated);
      setExpanded(false);
      toast.success(`Rescheduled ${updated} task(s) gently across upcoming days.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reschedule tasks.");
    } finally {
      setApplying(false);
    }
  };

  if (appliedCount !== null) {
    return (
      <section
        aria-label="Learning Recovery Complete"
        className="surface-card border-emerald-500/30 p-5 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-foreground">
              Gentle Recovery Plan Applied ({appliedCount} task{appliedCount === 1 ? "" : "s"}{" "}
              balanced)
            </h3>
            <p className="text-xs text-muted-foreground">
              Your overdue backlog has been distributed evenly. Focus on just one small win today.
            </p>
          </div>
        </div>
        <Button asChild size="sm" variant="outline" className="text-xs gap-1.5">
          <Link to="/app/tasks">
            <span>View Balanced Tasks</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </section>
    );
  }

  return (
    <section
      aria-label="Compassionate Learning Recovery Planner"
      className="surface-card border-primary/30 p-5 space-y-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <CalendarHeart className="size-5" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-base font-bold text-foreground">
              {assessment.headline}
            </h2>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              {assessment.reassurance}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <FeatureGuideTrigger featureId="learning-recovery" iconOnly />
          <Button
            type="button"
            variant={expanded ? "ghost" : "glow"}
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs shrink-0"
          >
            {expanded ? "Hide Planner" : "Build Gentle Restart Plan"}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="pt-3 border-t border-border/80 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-foreground">
                1. Choose your comfortable catch-up pace
              </div>
              <p className="text-[11px] text-muted-foreground">
                No guilt, no midnight cramming. Pick what actually fits your energy today.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "gentle", label: "Gentle (15m/day)" },
                  { id: "steady", label: "Steady (30m/day)" },
                  { id: "focused", label: "Catch-Up (45m/day)" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPace(opt.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    pace === opt.id
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {schedule.steps.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-foreground">
                2. Proposed Schedule ({schedule.paceSummary})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {schedule.steps.map((step) => (
                  <div
                    key={step.taskId}
                    className="rounded-xl border border-border bg-surface-2 p-3 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-foreground truncate">{step.title}</div>
                      <div className="text-[11px] text-primary font-medium">{step.dayLabel}</div>
                    </div>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-surface text-muted-foreground border border-border">
                      {step.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-surface-2 border border-border text-xs text-muted-foreground">
              You have {assessment.dueFlashcardsCount} flashcards due. Start with just 5 cards in
              the Study module to ease back in smoothly.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/80">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              Updates due dates safely in Firestore without removing any tasks.
            </span>

            {schedule.steps.length > 0 ? (
              <Button
                type="button"
                variant="glow"
                size="sm"
                onClick={handleApplyRecoveryPlan}
                disabled={applying}
                className="gap-1.5 text-xs"
              >
                {applying ? (
                  <RefreshCw className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                <span>{applying ? "Rebalancing..." : "Apply Gentle Schedule"}</span>
              </Button>
            ) : (
              <Button asChild size="sm" variant="glow" className="text-xs gap-1.5">
                <Link to="/app/study">
                  <span>Review 5 Flashcards</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
