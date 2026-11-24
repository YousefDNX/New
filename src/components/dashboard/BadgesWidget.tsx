import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  Gift,
  HeartPulse,
  Loader2,
  Lock,
  Sparkles,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  claimAchievementInFirestore,
  evaluateStudentAchievements,
  fetchUserClaimedAchievements,
  type AchievementDefinition,
  type EvaluatedAchievement,
} from "@/lib/achievement-service";
import { computeWeeklyPulseSummary } from "@/lib/growth";
import { formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import { useGoals, useStats, useTasks, useUser } from "@/hooks/use-nexora";
import {
  useCareEntries,
  useCircles,
  useFocusSessions,
  useFuturePlans,
  useJournalEntries,
  useQuizAttempts,
  useStudyItems,
} from "@/hooks/use-modules";
import { triggerConfettiBurst } from "@/components/common/ConfettiCelebration";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const BADGE_ICONS: Record<AchievementDefinition["iconName"], LucideIcon> = {
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

const TIER_STYLES: Record<
  AchievementDefinition["tier"],
  { ring: string; badgeBg: string; labelEn: string; labelAr: string }
> = {
  bronze: {
    ring: "border-amber-700/40 bg-amber-700/10 text-amber-500",
    badgeBg: "bg-amber-700/15 text-amber-500",
    labelEn: "Bronze",
    labelAr: "برونزي",
  },
  silver: {
    ring: "border-slate-400/40 bg-slate-400/10 text-slate-300",
    badgeBg: "bg-slate-400/15 text-slate-300",
    labelEn: "Silver",
    labelAr: "فضي",
  },
  gold: {
    ring: "border-amber-400/50 bg-amber-400/15 text-amber-400",
    badgeBg: "bg-amber-400/20 text-amber-400",
    labelEn: "Gold",
    labelAr: "ذهبي",
  },
  platinum: {
    ring: "border-cyan-400/50 bg-cyan-400/15 text-cyan-400",
    badgeBg: "bg-cyan-400/20 text-cyan-400",
    labelEn: "Platinum",
    labelAr: "بلاتيني",
  },
  diamond: {
    ring: "border-violet-400/50 bg-violet-400/15 text-violet-400",
    badgeBg: "bg-violet-400/20 text-violet-400",
    labelEn: "Diamond",
    labelAr: "ماسي",
  },
};

type BadgeFilter = "all" | "unlocked" | "locked";

export function BadgesWidget() {
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
  const { lang, a11y } = usePrefs();
  const reduceMotion = a11y.reduceMotion;

  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimingAll, setClaimingAll] = useState(false);
  const [filter, setFilter] = useState<BadgeFilter>("all");

  const isAr = lang === "ar";
  const level = stats?.level ?? 1;
  const pulseSummary = computeWeeklyPulseSummary(careEntries);
  const streak = Math.max(stats?.current_streak ?? 0, pulseSummary.daysCheckedLast7);
  const completedTasks = tasks.filter((tk) => tk.status === "done").length;
  const completedGoals = goals.filter((g) => g.status === "completed").length;
  const masteredMistakesCount = studyItems.filter(
    (s) => s.kind === "mistake" && s.mistake_status === "mastered",
  ).length;

  useEffect(() => {
    if (!user?.uid) {
      setClaimedIds(new Set());
      return;
    }
    let cancelled = false;
    setLoadingClaims(true);
    void fetchUserClaimedAchievements(user.uid)
      .then((set) => {
        if (!cancelled) setClaimedIds(set);
      })
      .finally(() => {
        if (!cancelled) setLoadingClaims(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const evaluated = useMemo(
    () =>
      evaluateStudentAchievements(
        {
          level,
          streak,
          completedTasksCount: completedTasks + Math.min(completedGoals, 1),
          focusSessionsCount: focusSessions.length,
          masteredMistakesCount,
          journalsCount: journalEntries.length,
          careEntriesCount: careEntries.length,
          quizzesCount: quizAttempts.length,
          futurePlansCount: futurePlans.length,
          circleCount: circles.length,
        },
        claimedIds,
      ),
    [
      level,
      streak,
      completedTasks,
      completedGoals,
      focusSessions.length,
      masteredMistakesCount,
      journalEntries.length,
      careEntries.length,
      quizAttempts.length,
      futurePlans.length,
      circles.length,
      claimedIds,
    ],
  );

  const unlockedCount = evaluated.filter((a) => a.unlocked).length;
  const claimable = evaluated.filter((a) => a.unlocked && !a.claimed);
  const totalEarnedXp = evaluated
    .filter((a) => a.claimed || a.unlocked)
    .reduce((sum, a) => sum + a.rewardXp, 0);

  const visibleBadges = useMemo(() => {
    const sorted = [...evaluated].sort((a, b) => {
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      if (a.claimed !== b.claimed) return a.claimed ? 1 : -1;
      return b.progressPct - a.progressPct;
    });
    if (filter === "unlocked") return sorted.filter((a) => a.unlocked);
    if (filter === "locked") return sorted.filter((a) => !a.unlocked);
    return sorted;
  }, [evaluated, filter]);

  const handleClaim = useCallback(
    async (ach: EvaluatedAchievement) => {
      if (!user?.uid || claimingId || claimingAll) return;
      setClaimingId(ach.id);
      try {
        const res = await claimAchievementInFirestore(user.uid, ach.id);
        setClaimedIds((prev) => new Set([...prev, ach.id]));
        if (res.success) {
          triggerConfettiBurst({ particleCount: 56, originY: 0.36 });
          await queryClient.invalidateQueries();
          toast.success(
            isAr
              ? `تم تحصيل وسام «${ach.titleAr}» (+${res.xpAwarded} XP)`
              : `Badge claimed: "${ach.titleEn}" (+${res.xpAwarded} XP)`,
          );
        }
      } catch (err) {
        console.warn("[BadgesWidget] Failed to claim badge:", err);
        toast.error(isAr ? "تعذر حفظ الوسام في Firestore" : "Failed to save badge in Firestore");
      } finally {
        setClaimingId(null);
      }
    },
    [user?.uid, claimingId, claimingAll, queryClient, isAr],
  );

  const handleClaimAll = async () => {
    if (!user?.uid || claimable.length === 0 || claimingAll) return;
    setClaimingAll(true);
    let totalXp = 0;
    let count = 0;
    try {
      for (const ach of claimable) {
        const res = await claimAchievementInFirestore(user.uid, ach.id);
        setClaimedIds((prev) => new Set([...prev, ach.id]));
        if (res.success) {
          totalXp += res.xpAwarded;
          count++;
        }
      }
      if (count > 0) {
        triggerConfettiBurst({ particleCount: 80, originY: 0.34 });
        await queryClient.invalidateQueries();
        toast.success(
          isAr
            ? `تم تحصيل ${count} أوسمة (+${totalXp} XP)!`
            : `Claimed ${count} badges (+${totalXp} XP)!`,
        );
      }
    } catch (err) {
      console.warn("[BadgesWidget] Failed to claim badges:", err);
      toast.error(isAr ? "تعذر حفظ الأوسمة في Firestore" : "Failed to save badges in Firestore");
    } finally {
      setClaimingAll(false);
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <section
        data-testid="dashboard-badges"
        aria-labelledby="dashboard-badges-heading"
        className="surface-card relative overflow-hidden rounded-2xl border border-border/80 bg-surface/90 p-5 shadow-card transition-all hover:border-primary/40 md:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-xp/15 text-xp ring-1 ring-xp/30">
              <Award className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="dashboard-badges-heading"
                  className="font-display text-base font-bold text-foreground"
                >
                  {isAr ? "الأوسمة والإنجازات" : "Badges & Achievements"}
                </h3>
                <span
                  data-testid="badges-unlocked-count"
                  className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary"
                >
                  {formatNumber(unlockedCount, lang)}/{formatNumber(evaluated.length, lang)}
                </span>
                {loadingClaims && (
                  <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? `رصيد أوسمتك من Firestore · +${formatNumber(totalEarnedXp, lang)} نقطة خبرة مكتسبة`
                  : `Milestone badges synced with Firestore · +${formatNumber(totalEarnedXp, lang)} XP earned`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {claimable.length > 0 && (
              <Button
                type="button"
                size="sm"
                variant="glow"
                data-testid="claim-all-badges-btn"
                disabled={claimingAll || Boolean(claimingId)}
                onClick={handleClaimAll}
                className="h-8 gap-1.5 text-xs"
              >
                {claimingAll ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Gift className="size-3.5" />
                )}
                <span>
                  {isAr
                    ? `تحصيل (${formatNumber(claimable.length, lang)})`
                    : `Claim ${claimable.length}`}
                </span>
              </Button>
            )}

            <div className="flex rounded-lg border border-border bg-surface-2 p-0.5 text-[11px]">
              {(
                [
                  { id: "all", en: "All", ar: "الكل" },
                  { id: "unlocked", en: "Unlocked", ar: "المفتوحة" },
                  { id: "locked", en: "Locked", ar: "مقفلة" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  data-testid={`badges-filter-${tab.id}`}
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-semibold transition-colors",
                    filter === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {isAr ? tab.ar : tab.en}
                </button>
              ))}
            </div>
          </div>
        </div>

        {visibleBadges.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            {isAr
              ? "لا توجد أوسمة في هذا التصنيف حالياً. واصل إنجاز المهام وجلسات التركيز!"
              : "No badges in this filter yet. Keep completing tasks and study sprints!"}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false}>
              {visibleBadges.map((ach, idx) => {
                const Icon = BADGE_ICONS[ach.iconName] || Award;
                const tierStyle = TIER_STYLES[ach.tier];
                return (
                  <Tooltip key={ach.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        data-testid={`badge-card-${ach.id}`}
                        data-unlocked={String(ach.unlocked)}
                        data-claimed={String(ach.claimed)}
                        initial={
                          reduceMotion
                            ? false
                            : ach.unlocked
                              ? { opacity: 0, scale: 0.94, y: 10 }
                              : { opacity: 0, y: 6 }
                        }
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        {...(reduceMotion ? {} : { exit: { opacity: 0, scale: 0.95 } })}
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { duration: 0.28, delay: Math.min(idx * 0.03, 0.24) }
                        }
                        className={cn(
                          "flex flex-col justify-between gap-3 rounded-xl border p-3.5 transition-all",
                          ach.claimed
                            ? "border-success/35 bg-success/5"
                            : ach.unlocked
                              ? "border-primary/45 bg-primary/5 shadow-sm"
                              : "border-border/70 bg-surface-2/50 opacity-85",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div
                              className={cn(
                                "flex size-10 shrink-0 items-center justify-center rounded-xl border",
                                ach.unlocked
                                  ? tierStyle.ring
                                  : "border-border bg-surface text-muted-foreground",
                              )}
                            >
                              {ach.unlocked ? (
                                <Icon className="size-5" />
                              ) : (
                                <Lock className="size-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <h4 className="truncate font-display text-xs font-bold text-foreground sm:text-sm">
                                  {isAr ? ach.titleAr : ach.titleEn}
                                </h4>
                                <span
                                  className={cn(
                                    "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                                    ach.unlocked
                                      ? tierStyle.badgeBg
                                      : "bg-surface text-muted-foreground",
                                  )}
                                >
                                  {isAr ? tierStyle.labelAr : tierStyle.labelEn}
                                </span>
                              </div>
                              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                                {isAr ? ach.descriptionAr : ach.descriptionEn}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-muted-foreground">
                              {formatNumber(Math.min(ach.currentCount, ach.targetCount), lang)}/
                              {formatNumber(ach.targetCount, lang)} (
                              {formatNumber(ach.progressPct, lang)}%)
                            </span>
                            <span className="font-bold text-xp">
                              +{formatNumber(ach.rewardXp, lang)} XP
                            </span>
                          </div>

                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                ach.claimed
                                  ? "bg-success"
                                  : ach.unlocked
                                    ? "bg-primary"
                                    : "bg-muted-foreground/40",
                              )}
                              style={{ width: `${ach.progressPct}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            {ach.claimed ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                                <CheckCircle2 className="size-3.5" />
                                <span>{isAr ? "تم الاستلام" : "Unlocked & Claimed"}</span>
                              </span>
                            ) : ach.unlocked ? (
                              <>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                                  <Sparkles className="size-3.5" />
                                  <span>{isAr ? "مفتوح الآن" : "Milestone Reached"}</span>
                                </span>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  data-testid={`claim-badge-btn-${ach.id}`}
                                  disabled={claimingId === ach.id || claimingAll}
                                  onClick={() => handleClaim(ach)}
                                  className="h-6 border-primary/40 bg-primary/10 px-2 text-[10px] font-bold text-primary hover:bg-primary hover:text-primary-foreground"
                                >
                                  {claimingId === ach.id ? (
                                    <Loader2 className="size-3 animate-spin" />
                                  ) : isAr ? (
                                    `استلام +${ach.rewardXp} XP`
                                  ) : (
                                    `Claim +${ach.rewardXp} XP`
                                  )}
                                </Button>
                              </>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">
                                {isAr ? "قيد الإنجاز" : "In progress"}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-xs border border-border bg-popover p-2.5 text-xs text-popover-foreground shadow-lg"
                    >
                      <div className="space-y-1">
                        <p className="font-display font-bold text-foreground">
                          {isAr ? ach.titleAr : ach.titleEn} ·{" "}
                          <span className="text-primary">
                            {isAr ? tierStyle.labelAr : tierStyle.labelEn}
                          </span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {isAr ? ach.descriptionAr : ach.descriptionEn}
                        </p>
                        <p className="font-mono text-[11px] font-semibold text-foreground tabular-nums">
                          {isAr ? "المعيار:" : "Criteria:"}{" "}
                          {formatNumber(Math.min(ach.currentCount, ach.targetCount), lang)}/
                          {formatNumber(ach.targetCount, lang)} · +
                          {formatNumber(ach.rewardXp, lang)} XP
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>
    </TooltipProvider>
  );
}

export const Badges = BadgesWidget;
