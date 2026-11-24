import { useEffect, useRef } from "react";
import { useToast } from "@/components/common/ToastProvider";
import {
  useCareEntries,
  useCircles,
  useFocusSessions,
  useFuturePlans,
  useJournalEntries,
  useQuizAttempts,
  useStudyItems,
} from "@/hooks/use-modules";
import { useGoals, useStats, useTasks, useUser } from "@/hooks/use-nexora";
import { computeWeeklyPulseSummary, getAchievementBadges, getMilestones } from "@/lib/growth";
import { usePrefs } from "@/lib/preferences";
import { triggerConfettiBurst } from "@/components/common/ConfettiCelebration";

export function MilestoneCelebrationWatcher() {
  const { data: user } = useUser();
  const statsQuery = useStats();
  const tasksQuery = useTasks();
  const goalsQuery = useGoals();
  const focusQuery = useFocusSessions();
  const studyQuery = useStudyItems();
  const futureQuery = useFuturePlans();
  const circlesQuery = useCircles();
  const careQuery = useCareEntries();
  const journalQuery = useJournalEntries();
  const quizQuery = useQuizAttempts();
  const toast = useToast();
  const { t } = usePrefs();

  const seenUnlockedRef = useRef<Set<string>>(new Set());
  const hydratedUidRef = useRef<string | null>(null);

  const uid = user?.uid ?? null;
  const allReady =
    Boolean(uid) &&
    !statsQuery.isLoading &&
    !tasksQuery.isLoading &&
    !goalsQuery.isLoading &&
    !focusQuery.isLoading &&
    !studyQuery.isLoading &&
    !futureQuery.isLoading &&
    !circlesQuery.isLoading &&
    !careQuery.isLoading &&
    !journalQuery.isLoading &&
    !quizQuery.isLoading;

  useEffect(() => {
    if (!uid) {
      hydratedUidRef.current = null;
      seenUnlockedRef.current = new Set();
      return;
    }
    if (!allReady) return;

    const stats = statsQuery.data;
    const tasks = tasksQuery.data ?? [];
    const goals = goalsQuery.data ?? [];
    const focusSessions = focusQuery.data ?? [];
    const studyItems = studyQuery.data ?? [];
    const futurePlans = futureQuery.data ?? [];
    const circles = circlesQuery.data ?? [];
    const careEntries = careQuery.data ?? [];
    const journalEntries = journalQuery.data ?? [];
    const quizAttempts = quizQuery.data ?? [];

    const level = stats?.level ?? 1;
    const xp = stats?.xp ?? 0;
    const pulseSummary = computeWeeklyPulseSummary(careEntries);
    const streak = Math.max(stats?.current_streak ?? 0, pulseSummary.daysCheckedLast7);
    const completedTasks = tasks.filter((tk) => tk.status === "done").length;
    const completedGoals = goals.filter((g) => g.status === "completed").length;
    const masteredMistakesCount = studyItems.filter(
      (s) => s.kind === "mistake" && s.mistake_status === "mastered",
    ).length;

    const levelMilestones = getMilestones(level).filter((m) => m.unlocked);
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
    }).filter((b) => b.unlocked);

    const unlockedItems = [
      ...levelMilestones.map((m) => ({
        key: `level:${m.id}`,
        title: t(m.titleKey),
        subtitle: t(m.descKey),
        xp: m.rewardXp,
      })),
      ...badges.map((b) => ({
        key: `badge:${b.id}`,
        title: t(b.titleKey),
        subtitle: t(b.unlockedDescKey),
        xp: b.rewardXp,
      })),
    ];

    // First ready pass for this UID establishes the baseline silently without toasting.
    if (hydratedUidRef.current !== uid) {
      hydratedUidRef.current = uid;
      seenUnlockedRef.current = new Set(unlockedItems.map((item) => item.key));
      return;
    }

    const newlyUnlocked = unlockedItems.filter((item) => !seenUnlockedRef.current.has(item.key));
    if (newlyUnlocked.length === 0) return;

    for (const item of newlyUnlocked) {
      seenUnlockedRef.current.add(item.key);
    }

    // Show celebratory toast & canvas confetti for genuine state transitions (cap burst to 2 at once).
    triggerConfettiBurst({ particleCount: 72, originY: 0.34 });
    for (const item of newlyUnlocked.slice(0, 2)) {
      toast.milestoneAchieved(item.title, item.xp, item.subtitle);
    }
  }, [
    uid,
    allReady,
    statsQuery.data,
    tasksQuery.data,
    goalsQuery.data,
    focusQuery.data,
    studyQuery.data,
    futureQuery.data,
    circlesQuery.data,
    careQuery.data,
    journalQuery.data,
    quizQuery.data,
    t,
    toast,
  ]);

  return null;
}
