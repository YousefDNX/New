import { Flame, CheckCircle2, Target, ArrowUpRight } from "lucide-react";
import { useStats, useTasks, useGoals } from "@/hooks/use-nexora";
import { formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import { getTier } from "@/lib/growth";
import { XpProgress } from "@/components/growth/XpProgress";

export function StatsOverview({
  onTabChange,
}: {
  onTabChange?: (tab: "overview" | "growthmap") => void;
}) {
  const { data: stats } = useStats();
  const { data: tasks = [] } = useTasks();
  const { data: goals = [] } = useGoals();
  const { t, lang } = usePrefs();

  const xp = stats?.xp ?? 0;
  const level = stats?.level ?? 1;
  const streak = stats?.current_streak ?? 0;
  const longestStreak = stats?.longest_streak ?? streak;
  const tier = getTier(level);

  const completedTasks = tasks.filter((tk) => tk.status === "done").length;
  const pendingTasks = tasks.filter((tk) => tk.status !== "done").length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const completedGoals = goals.filter((g) => g.status === "completed").length;
  const activeGoals = goals.filter((g) => g.status !== "completed").length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="surface-card relative overflow-hidden p-5 transition-colors hover:border-primary/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{t("dash.stat.level")}</span>
          <button
            type="button"
            onClick={() => onTabChange?.("growthmap")}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            title={t("dash.tab.growthmap")}
          >
            <span>{t("dash.tab.growthmap")}</span>
            <ArrowUpRight className="size-3 rtl-flip" />
          </button>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-foreground tabular-nums">
            {t("common.level")} {formatNumber(level, lang)}
          </span>
          <span className="text-xs font-medium text-primary">
            {tier.badge} {t(tier.nameKey)}
          </span>
        </div>

        <div className="mt-3">
          <XpProgress xp={xp} level={level} compact showTierBadge={false} />
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2.5 text-xs text-muted-foreground">
          <span>{t("dash.stat.totalxp")}</span>
          <span className="font-semibold text-foreground tabular-nums">
            {formatNumber(xp, lang)} {t("common.xp")}
          </span>
        </div>
      </div>

      <div className="surface-card relative overflow-hidden p-5 transition-colors hover:border-xp/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{t("dash.stat.streak")}</span>
          <div className="flex size-7 items-center justify-center rounded-md bg-xp/10 text-xp">
            <Flame className="size-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-xp tabular-nums">
            {formatNumber(streak, lang)}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {t("dash.stat.consecutiveDays")}
          </span>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>{t("dash.stat.longestStreak")}</span>
            <span className="font-semibold text-foreground">
              {formatNumber(longestStreak, lang)} {t("common.days")}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-xp transition-all duration-500"
              style={{
                width: `${Math.min(longestStreak > 0 ? (streak / longestStreak) * 100 : 50, 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2.5 text-xs text-muted-foreground">
          <span>{t("dash.stat.momentum")}</span>
          <span className="font-semibold text-xp">
            {streak >= 5 ? t("dash.stat.onFire") : t("dash.stat.active")}
          </span>
        </div>
      </div>

      <div className="surface-card relative overflow-hidden p-5 transition-colors hover:border-success/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {t("dash.stat.taskExec")}
          </span>
          <div className="flex size-7 items-center justify-center rounded-md bg-success/10 text-success">
            <CheckCircle2 className="size-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-foreground tabular-nums">
            {formatNumber(completedTasks, lang)}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            / {formatNumber(totalTasks, lang)} {t("dash.stat.completed")}
          </span>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>{t("dash.stat.completion")}</span>
            <span className="font-semibold text-success">
              {formatNumber(taskCompletionRate, lang)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${taskCompletionRate}%` }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2.5 text-xs text-muted-foreground">
          <span>{t("dash.stat.pending")}</span>
          <span className="font-semibold text-foreground tabular-nums">
            {formatNumber(pendingTasks, lang)} {t("common.tasks")}
          </span>
        </div>
      </div>

      <div className="surface-card relative overflow-hidden p-5 transition-colors hover:border-primary/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{t("dash.goals.title")}</span>
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Target className="size-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-foreground tabular-nums">
            {formatNumber(activeGoals, lang)}
          </span>
          <span className="text-xs text-muted-foreground">{t("dash.stat.activeGoalsLabel")}</span>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>{t("dash.stat.achieved")}</span>
            <span className="font-semibold text-primary">{formatNumber(completedGoals, lang)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-primary transition-all duration-500"
              style={{ width: `${goals.length > 0 ? (completedGoals / goals.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2.5 text-xs text-muted-foreground">
          <span>{t("dash.stat.xpPerGoal")}</span>
          <span className="font-semibold text-primary tabular-nums">+50 {t("common.xp")}</span>
        </div>
      </div>
    </div>
  );
}
