import { useMemo, useState } from "react";
import {
  Trophy,
  Sparkles,
  GraduationCap,
  HeartPulse,
  ChevronRight,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { useStats, useTasks, useGoals } from "@/hooks/use-nexora";
import { useFocusSessions, useStudyItems } from "@/hooks/use-modules";
import { usePrefs } from "@/lib/preferences";
import { formatNumber } from "@/lib/locale-format";
import { cn } from "@/lib/utils";
import { computeMilestoneProgress, type MilestoneProgressStats } from "@/lib/milestone-progress";
import { MilestoneProgressCircle } from "./MilestoneProgressCircle";

export { computeMilestoneProgress, type MilestoneProgressStats };

export function MilestoneProgressBar() {
  const { data: stats } = useStats();
  const { data: tasks = [] } = useTasks();
  const { data: goals = [] } = useGoals();
  const { data: studyItems = [] } = useStudyItems();
  const { data: focusSessions = [] } = useFocusSessions();
  const { lang } = usePrefs();

  const [expanded, setExpanded] = useState(false);
  const isAr = lang === "ar";

  const level = stats?.level ?? 1;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const completedGoals = goals.filter((g) => g.status === "completed").length;

  const progress = useMemo(
    () =>
      computeMilestoneProgress({
        level,
        completedTasks,
        completedGoals,
        studyItemsCount: studyItems.length,
        focusSessionsCount: focusSessions.length,
      }),
    [level, completedTasks, completedGoals, studyItems.length, focusSessions.length],
  );

  const academicPct = Math.round((progress.academicCount / progress.academicTotal) * 100);
  const personalPct = Math.round((progress.personalCount / progress.personalTotal) * 100);

  return (
    <div
      data-testid="milestone-progress-bar"
      className="surface-card relative overflow-hidden rounded-2xl border border-border/80 bg-surface/90 p-5 shadow-card transition-all hover:border-primary/40 md:p-6"
    >
      {/* Decorative ambient glow */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 size-40 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-4">
        {/* Header row */}
        {/* Header row with SVG Progress Circle Gauge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <MilestoneProgressCircle
                size="sm"
                overrideStats={progress}
                variant="inline"
                role="img"
                showTierBadge={false}
                showTooltip={true}
                className="scale-95 sm:scale-100"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold text-foreground md:text-base">
                  {isAr
                    ? "نسبة إنجاز المعالم الأكاديمية والشخصية"
                    : "Academic & Personal Milestone Progress"}
                </h3>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {formatNumber(progress.overallPercentage, lang)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? `أنجزت ${formatNumber(progress.overallCount, lang)} من أصل ${formatNumber(progress.overallTotal, lang)} معلماً عبر المجالات الأساسية`
                  : `Completed ${formatNumber(progress.overallCount, lang)} of ${formatNumber(progress.overallTotal, lang)} milestones across core development areas`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            aria-expanded={expanded}
          >
            <span>
              {expanded ? (isAr ? "إخفاء التفاصيل" : "Less") : isAr ? "التفاصيل" : "Details"}
            </span>
            <ChevronRight
              className={cn("size-3.5 transition-transform", expanded && "rotate-90")}
            />
          </button>
        </div>

        {/* Master Visual Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">
              {isAr ? "معدل الإنجاز العام" : "Overall Milestone Mastery"}
            </span>
            <span
              data-testid="milestone-progress-percentage"
              className="font-display font-bold text-primary"
            >
              {formatNumber(progress.overallPercentage, lang)}%
            </span>
          </div>

          <div
            className="h-3.5 w-full overflow-hidden rounded-full bg-surface-2 ring-1 ring-border"
            role="progressbar"
            aria-valuenow={progress.overallPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={
              isAr ? "شريط التقدم العام للمعالم" : "Overall milestone completion percentage"
            }
          >
            <div
              data-testid="milestone-progress-fill"
              className="h-full rounded-full bg-gradient-to-r from-primary via-primary-glow to-xp transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress.overallPercentage))}%` }}
            />
          </div>
        </div>

        {/* Category breakdown pills */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {/* Academic milestone sub-progress */}
          <div className="rounded-xl border border-border/70 bg-surface-2/60 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <GraduationCap className="size-3.5 text-primary" />
                <span>{isAr ? "المعالم الأكاديمية" : "Academic Milestones"}</span>
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {formatNumber(progress.academicCount, lang)}/
                {formatNumber(progress.academicTotal, lang)} ({formatNumber(academicPct, lang)}%)
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${academicPct}%` }}
              />
            </div>
          </div>

          {/* Personal growth sub-progress */}
          <div className="rounded-xl border border-border/70 bg-surface-2/60 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <HeartPulse className="size-3.5 text-xp" />
                <span>{isAr ? "النمو الشخصي والرفاه" : "Personal & Wellbeing"}</span>
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {formatNumber(progress.personalCount, lang)}/
                {formatNumber(progress.personalTotal, lang)} ({formatNumber(personalPct, lang)}%)
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-xp transition-all duration-500"
                style={{ width: `${personalPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Expanded Details & Next Milestone Target */}
        {expanded && (
          <div className="space-y-3 border-t border-border/80 pt-3 text-xs">
            {progress.nextMilestone && (
              <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground">
                    {isAr ? "الهدف التالي:" : "Next Milestone Target:"}{" "}
                    {isAr ? progress.nextMilestone.titleAr : progress.nextMilestone.titleEn}
                  </div>
                  <p className="text-muted-foreground">
                    {isAr ? progress.nextMilestone.descAr : progress.nextMilestone.descEn}
                  </p>
                  <div className="pt-1 text-[11px] font-semibold text-primary">
                    +{formatNumber(progress.nextMilestone.rewardXp, lang)} XP{" "}
                    {isAr ? "عند الإنجاز" : "reward on unlock"}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground sm:grid-cols-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-success" />
                <span>
                  {formatNumber(completedTasks, lang)} {isAr ? "مهام منجزة" : "Tasks done"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-success" />
                <span>
                  {formatNumber(completedGoals, lang)} {isAr ? "أهداف محققة" : "Goals met"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="size-3.5 text-xp" />
                <span>
                  {formatNumber(stats?.current_streak ?? 0, lang)}{" "}
                  {isAr ? "أيام متتالية" : "Day streak"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="size-3.5 text-primary" />
                <span>
                  {isAr ? "المستوى" : "Level"} {formatNumber(level, lang)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
