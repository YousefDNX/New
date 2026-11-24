import { Sparkles, Flame, Trophy, UserCheck, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UpgradeAccountDialog } from "@/components/auth/UpgradeAccountDialog";
import { useGoals, useProfile, useStats, useUser } from "@/hooks/use-nexora";
import { formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import { getTier, levelProgress } from "@/lib/growth";

export function WelcomeBanner() {
  const { data: user } = useUser();
  const { data: profile } = useProfile();
  const { data: stats } = useStats();
  const { data: goals = [] } = useGoals();
  const { t, lang, study, a11y, effectiveUiExperience } = usePrefs();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const prevGoalDoneCount = useRef<number | null>(null);
  const prevStreak = useRef<number | null>(null);

  const xp = stats?.xp ?? 0;
  const currentLevel = stats?.level ?? 1;
  const currentStreak = stats?.current_streak ?? 0;
  const tier = getTier(currentLevel);
  const progress = levelProgress(xp);

  const dailyGoals = goals.filter((g) => g.is_daily !== false);
  const completedDailyCount = dailyGoals.filter((g) => g.status === "completed").length;
  const allDailyMet = dailyGoals.length > 0 && completedDailyCount === dailyGoals.length;

  useEffect(() => {
    const prevDone = prevGoalDoneCount.current;
    const prevStrk = prevStreak.current;
    prevGoalDoneCount.current = completedDailyCount;
    prevStreak.current = currentStreak;

    const gainedGoal = prevDone !== null && completedDailyCount > prevDone;
    const gainedStreak = prevStrk !== null && currentStreak > prevStrk;

    if (gainedGoal || gainedStreak) {
      setCelebrating(true);
      const timer = window.setTimeout(() => setCelebrating(false), 3800);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [completedDailyCount, currentStreak]);

  const showStreakPulse = celebrating || (allDailyMet && currentStreak > 0);
  const animateIcon = showStreakPulse && !a11y.reduceMotion;

  const [hour, setHour] = useState(12);
  useEffect(() => {
    setHour(new Date().getHours());
  }, []);
  const timeGreeting =
    hour < 12
      ? t("dash.greeting.morning")
      : hour < 18
        ? t("dash.greeting.afternoon")
        : t("dash.greeting.evening");

  const displayName =
    profile?.display_name ||
    user?.displayName ||
    (user?.isAnonymous ? t("dash.guestName") : t("dash.studentName"));

  const bannerShellClass =
    effectiveUiExperience === "editorial_atelier"
      ? "relative overflow-hidden bg-transparent p-0"
      : effectiveUiExperience === "command_os"
        ? "surface-card relative overflow-hidden p-5"
        : effectiveUiExperience === "focus_deck"
          ? "surface-card relative overflow-hidden p-6 md:p-7"
          : "surface-card relative overflow-hidden p-6 md:p-7";

  return (
    <>
      <div className={bannerShellClass}>
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="min-w-0 space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-primary tabular-nums">
              <Sparkles className="size-3.5 shrink-0" />
              <span>
                {tier.badge} {t(tier.nameKey)} · {t("common.level")}{" "}
                {formatNumber(currentLevel, lang)}
              </span>
            </div>

            <h1 className="text-balance font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {timeGreeting}, <span className="text-primary">{displayName}</span>
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              {t("dash.welcome.sub")}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-0.5">
              <div
                data-simplified-hide="true"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums"
              >
                <Clock className="size-3.5 text-primary" />
                <span>
                  {t("dash.focus.pref")}: {formatNumber(study.sessionMinutes, lang)}{" "}
                  {t("set.study.minutes")}
                </span>
              </div>

              {user?.isAnonymous && (
                <button
                  type="button"
                  onClick={() => setUpgradeOpen(true)}
                  className="inline-flex min-h-[32px] items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
                >
                  <UserCheck className="size-3.5" />
                  <span>{t("auth.guest.upgrade")}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:gap-6 lg:border-s lg:border-t-0 lg:ps-6 lg:pt-0">
            <div aria-live="polite" className="flex items-center gap-3">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                  showStreakPulse ? "bg-xp/15 text-xp" : "bg-surface-2 text-xp"
                }`}
              >
                <Flame className="size-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  {t("dash.stat.streak")}
                </div>
                <div className="font-display text-xl font-bold tabular-nums text-foreground">
                  {formatNumber(currentStreak, lang)} {t("common.days")}
                </div>
                {showStreakPulse && (
                  <div className="text-[11px] font-semibold text-xp">
                    {t("dash.streak.celebrate")}
                  </div>
                )}
              </div>
            </div>

            <div className="hidden h-10 w-px bg-border/70 sm:block" aria-hidden="true" />

            <div className="flex min-w-48 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Trophy className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground tabular-nums">
                  <span>
                    {formatNumber(xp, lang)} {t("common.xp")}
                  </span>
                  <span className="font-semibold text-primary">
                    {formatNumber(progress.pct, lang)}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-primary transition-all duration-500"
                    style={{ width: `${Math.min(progress.pct, 100)}%` }}
                  />
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                  {formatNumber(progress.needed - progress.current, lang)} {t("common.xp")}{" "}
                  {t("dash.welcome.toNext")} {formatNumber(currentLevel + 1, lang)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UpgradeAccountDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
