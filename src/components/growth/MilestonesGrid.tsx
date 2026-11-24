import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  CheckCircle2,
  Flame,
  Clock,
  Brain,
  BookOpen,
  Compass,
  Users,
  HeartPulse,
  Trophy,
  Zap,
  Award,
  Lock,
  Gift,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAchievementBadges,
  computeWeeklyPulseSummary,
  type AchievementBadge,
  type BadgeCategory,
} from "@/lib/growth";
import {
  evaluateStudentAchievements,
  fetchUserClaimedAchievements,
  claimAchievementInFirestore,
  type EvaluatedAchievement,
} from "@/lib/achievement-service";
import type { DictKey } from "@/lib/i18n-dict";
import { formatDate, formatNumber } from "@/lib/locale-format";
import { useStats, useTasks, useGoals, useUser } from "@/hooks/use-nexora";
import {
  useCareEntries,
  useCircles,
  useFocusSessions,
  useFuturePlans,
  useJournalEntries,
  useQuizAttempts,
  useStudyItems,
} from "@/hooks/use-modules";
import { usePrefs } from "@/lib/preferences";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const BADGE_ICONS: Record<AchievementBadge["iconName"], LucideIcon> = {
  Sparkles,
  CheckCircle2,
  Flame,
  Clock,
  Brain,
  BookOpen,
  Compass,
  Users,
  HeartPulse,
  Trophy,
  Zap,
  Award,
};

export function MilestonesGrid() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const { data: stats } = useStats();
  const { data: tasks = [] } = useTasks();
  const { data: goals = [] } = useGoals();
  const { data: focusSessions = [] } = useFocusSessions();
  const { data: studyItems = [] } = useStudyItems();
  const { data: futurePlans = [] } = useFuturePlans();
  const { data: circles = [] } = useCircles();
  const { data: careEntries = [] } = useCareEntries();
  const { data: journalEntries = [] } = useJournalEntries();
  const { data: quizAttempts = [] } = useQuizAttempts();
  const { lang, locale, t } = usePrefs();

  const [activeCategory, setActiveCategory] = useState<"all" | BadgeCategory>("all");
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimingAll, setClaimingAll] = useState(false);

  const isAr = lang === "ar";
  const level = stats?.level ?? 1;
  const xp = stats?.xp ?? 0;
  const pulseSummary = computeWeeklyPulseSummary(careEntries);
  const streak = Math.max(stats?.current_streak ?? 0, pulseSummary.daysCheckedLast7);
  const completedTasks = tasks.filter((tk) => tk.status === "done").length;
  const completedGoals = goals.filter((g) => g.status === "completed").length;
  const masteredMistakesCount = studyItems.filter(
    (s) => s.kind === "mistake" && s.mistake_status === "mastered",
  ).length;

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    void fetchUserClaimedAchievements(user.uid).then((set) => {
      if (!cancelled) setClaimedIds(set);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const evaluatedAchievements = evaluateStudentAchievements(
    {
      level,
      streak,
      completedTasksCount: completedTasks,
      focusSessionsCount: focusSessions.length,
      masteredMistakesCount,
      journalsCount: journalEntries.length,
      careEntriesCount: careEntries.length,
      quizzesCount: quizAttempts.length,
      futurePlansCount: futurePlans.length,
      circleCount: circles.length,
    },
    claimedIds,
  );

  const claimableAchievements = evaluatedAchievements.filter((a) => a.unlocked && !a.claimed);

  const handleClaimAchievement = useCallback(
    async (ach: EvaluatedAchievement) => {
      if (!user?.uid || claimingId || claimingAll) return;
      setClaimingId(ach.id);
      try {
        const res = await claimAchievementInFirestore(user.uid, ach.id);
        if (res.success) {
          setClaimedIds((prev) => new Set([...prev, ach.id]));
          await queryClient.invalidateQueries();
          toast.success(
            isAr
              ? `تم تحصيل إنجاز «${ach.titleAr}» (+${res.xpAwarded} نقطة خبرة)`
              : `Unlocked "${ach.titleEn}" (+${res.xpAwarded} XP)`,
          );
        } else {
          setClaimedIds((prev) => new Set([...prev, ach.id]));
        }
      } catch (err) {
        console.warn("[MilestonesGrid] Failed to claim achievement:", err);
        toast.error(
          isAr ? "تعذر حفظ مكافأة الإنجاز في Firestore" : "Failed to save achievement reward",
        );
      } finally {
        setClaimingId(null);
      }
    },
    [user?.uid, claimingId, claimingAll, queryClient, isAr],
  );

  const handleClaimAll = async () => {
    if (!user?.uid || claimableAchievements.length === 0 || claimingAll) return;
    setClaimingAll(true);
    let totalXpAwarded = 0;
    let claimedCount = 0;
    try {
      for (const ach of claimableAchievements) {
        const res = await claimAchievementInFirestore(user.uid, ach.id);
        if (res.success) {
          totalXpAwarded += res.xpAwarded;
          claimedCount++;
          setClaimedIds((prev) => new Set([...prev, ach.id]));
        }
      }
      if (claimedCount > 0) {
        await queryClient.invalidateQueries();
        toast.success(
          isAr
            ? `تم تحصيل ${claimedCount} إنجازات (+${totalXpAwarded} نقطة خبرة)!`
            : `Claimed ${claimedCount} achievements (+${totalXpAwarded} XP)!`,
        );
      }
    } finally {
      setClaimingAll(false);
    }
  };

  const badges = getAchievementBadges({
    level,
    xp,
    streak,
    completedTasks,
    completedGoals,
    focusSessionsCount: focusSessions.length,
    masteredMistakesCount,
    futurePlansCount: futurePlans.length,
    circleCount: circles.length,
    careEntriesCount: careEntries.length,
    journalCount: journalEntries.length,
    quizCount: quizAttempts.length,
  });

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalCount = badges.length;
  const unlockedXp = badges.filter((b) => b.unlocked).reduce((sum, b) => sum + b.rewardXp, 0);

  const filteredBadges = badges.filter((b) => {
    if (activeCategory === "all") return true;
    return b.category === activeCategory;
  });

  const categories: Array<{ id: "all" | BadgeCategory; labelKey: DictKey }> = [
    { id: "all", labelKey: "dash.growth.badgesAll" },
    { id: "productivity", labelKey: "area.productivity" },
    { id: "academic", labelKey: "area.academic" },
    { id: "consistency", labelKey: "dash.stat.streak" },
    { id: "growth", labelKey: "area.growth" },
    { id: "mastery", labelKey: "dash.growth.trendsSkills" },
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <div className="surface-card space-y-6 p-5 md:p-6">
        {/* Firestore Claimable Achievement Milestones */}
        <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-surface-2/70 to-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <Gift className="size-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-foreground">
                  {isAr
                    ? "مكافآت إنجازات التقدم (متزامنة مع Firestore)"
                    : "Milestone XP Rewards (Synced with Firestore)"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isAr
                    ? `${claimedIds.size} من ${evaluatedAchievements.length} إنجازاً تم استلامه`
                    : `${claimedIds.size} of ${evaluatedAchievements.length} milestone rewards claimed`}
                </p>
              </div>
            </div>

            {claimableAchievements.length > 0 && (
              <Button
                type="button"
                size="sm"
                variant="glow"
                disabled={claimingAll || Boolean(claimingId)}
                onClick={handleClaimAll}
                className="h-8 gap-1.5 px-3 text-xs"
              >
                {claimingAll ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                <span>
                  {isAr
                    ? `استلام الكل (+${claimableAchievements.reduce((s, a) => s + a.rewardXp, 0)} XP)`
                    : `Claim All (+${claimableAchievements.reduce((s, a) => s + a.rewardXp, 0)} XP)`}
                </span>
              </Button>
            )}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {evaluatedAchievements.slice(0, 6).map((ach) => {
              const Icon = BADGE_ICONS[ach.iconName] || Award;
              return (
                <div
                  key={ach.id}
                  className={`flex items-center justify-between gap-2.5 rounded-lg border p-2.5 text-xs transition-all ${
                    ach.claimed
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : ach.unlocked
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/70 bg-surface-2/50 opacity-80"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                        ach.claimed
                          ? "bg-emerald-500/20 text-emerald-400"
                          : ach.unlocked
                            ? "bg-primary/20 text-primary"
                            : "bg-surface text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-foreground">
                        {isAr ? ach.titleAr : ach.titleEn}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {ach.currentCount}/{ach.targetCount} ·{" "}
                        <span className="font-bold text-xp">+{ach.rewardXp} XP</span>
                      </div>
                    </div>
                  </div>

                  {ach.claimed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 shrink-0">
                      <CheckCircle2 className="size-3" />
                      {isAr ? "تم" : "Claimed"}
                    </span>
                  ) : ach.unlocked ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={claimingId === ach.id || claimingAll}
                      onClick={() => handleClaimAchievement(ach)}
                      className="h-6 border-primary/40 bg-primary/10 px-2 text-[10px] font-bold text-primary hover:bg-primary hover:text-primary-foreground shrink-0"
                    >
                      {claimingId === ach.id ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : isAr ? (
                        `استلام +${ach.rewardXp}`
                      ) : (
                        `Claim +${ach.rewardXp}`
                      )}
                    </Button>
                  ) : (
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      {ach.progressPct}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-b border-border/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-xp" />
              <h2 className="font-display text-lg font-bold text-foreground">
                {t("dash.growth.badgesTitle")}
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t("dash.growth.badgesSub")}</p>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-2 px-3.5 py-2">
            <div>
              <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("dash.growth.badgesUnlocked")}
              </div>
              <div className="font-display text-sm font-bold text-foreground">
                <span className="text-primary">{formatNumber(unlockedCount, lang)}</span> /{" "}
                {formatNumber(totalCount, lang)}
              </div>
            </div>
            <div className="h-6 w-px bg-border" />
            <div>
              <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("dash.growth.badgesXp")}
              </div>
              <div className="font-display text-sm font-bold text-xp">
                +{formatNumber(unlockedXp, lang)} {t("common.xp")}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface-2 text-muted-foreground hover:bg-surface hover:text-foreground"
              }`}
            >
              {t(cat.labelKey)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filteredBadges.map((badge) => {
            const Icon = BADGE_ICONS[badge.iconName] || Trophy;
            const isUnlocked = badge.unlocked;
            const formattedUnlock = badge.unlockedAtIso
              ? formatDate(
                  badge.unlockedAtIso,
                  {
                    lang,
                    timezone: locale.timezone,
                    dateFormat: locale.dateFormat,
                    calendar: locale.calendar,
                  },
                  "medium",
                )
              : null;

            return (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <div
                    tabIndex={0}
                    className={`group relative flex cursor-pointer flex-col items-center justify-between rounded-xl border p-3.5 text-center transition-all duration-300 ${
                      isUnlocked
                        ? "border-primary/40 bg-gradient-to-b from-surface to-surface-2 hover:-translate-y-1 hover:border-primary hover:shadow-glow/30"
                        : "border-border/60 bg-surface-2/40 opacity-70 hover:-translate-y-0.5 hover:border-border hover:opacity-90"
                    }`}
                  >
                    <div className="absolute end-2 top-2">
                      {isUnlocked ? (
                        <div className="flex size-4 items-center justify-center rounded-full bg-primary/20 text-primary">
                          <CheckCircle2 className="size-3" />
                        </div>
                      ) : (
                        <div className="flex size-4 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <Lock className="size-2.5" />
                        </div>
                      )}
                    </div>

                    <div
                      className={`relative mt-2 flex size-12 items-center justify-center rounded-2xl transition-all duration-300 ${
                        isUnlocked
                          ? "bg-gradient-primary text-primary-foreground shadow-sm group-hover:scale-110 group-hover:shadow-glow"
                          : "border border-border/80 bg-surface text-muted-foreground/50 group-hover:text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-6" />
                      {isUnlocked && (
                        <span className="bg-xp absolute -bottom-1 -end-1 flex size-3 rounded-full" />
                      )}
                    </div>

                    <div className="mt-3 w-full">
                      <h4
                        className={`truncate font-display text-xs font-bold leading-tight ${
                          isUnlocked
                            ? "text-foreground group-hover:text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {t(badge.titleKey)}
                      </h4>
                      <p className="mt-0.5 truncate text-[0.65rem] text-muted-foreground">
                        {t(badge.categoryKey)}
                      </p>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[0.65rem] font-bold">
                      <span className={isUnlocked ? "text-xp" : "text-muted-foreground"}>
                        +{formatNumber(badge.rewardXp, lang)} {t("common.xp")}
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>

                <TooltipContent
                  side="top"
                  className="surface-card z-50 max-w-xs border border-border p-3.5 shadow-card"
                >
                  <div className="space-y-2 text-start">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display text-sm font-bold text-foreground">
                        {t(badge.titleKey)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
                          isUnlocked
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isUnlocked ? t("badge.status.unlocked") : t("badge.status.locked")}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {isUnlocked ? t(badge.unlockedDescKey) : t(badge.lockedDescKey)}
                    </p>

                    <div className="flex items-center justify-between border-t border-border/80 pt-2 text-[0.7rem]">
                      <span className="text-muted-foreground">
                        {isUnlocked
                          ? formattedUnlock
                            ? `${t("badge.unlockedOn")}: ${formattedUnlock}`
                            : t("badge.completed")
                          : `${t("badge.progressLabel")}: ${formatNumber(badge.progressCurrent, lang)}/${formatNumber(badge.progressTarget, lang)}`}
                      </span>
                      <span className="font-bold text-xp">
                        +{formatNumber(badge.rewardXp, lang)} {t("common.xp")}
                      </span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
