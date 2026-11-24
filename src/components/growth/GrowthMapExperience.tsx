import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Trophy,
  Flame,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  Compass,
  BookOpen,
  HeartPulse,
  ChevronDown,
  Download,
  FileText,
  History,
  Info,
  ShieldCheck,
  Target,
  Brain,
  CalendarCheck,
  Award,
  LayoutDashboard,
} from "lucide-react";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { downloadTextFile as downloadSafeTextFile } from "@/lib/safe-file";
import { Button } from "@/components/ui/button";
import { ModernSelect } from "@/components/ui/modern-select";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  useProfile,
  useStats,
  useTasks,
  useGoals,
  useGoalActions,
  useActivityEvents,
} from "@/hooks/use-nexora";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  useCareEntries,
  useCircles,
  useFocusSessions,
  useFuturePlans,
  useJournalEntries,
  useQuizAttempts,
  useStudyItems,
} from "@/hooks/use-modules";
import { formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import {
  AREAS,
  AREA_CONFIG,
  compute7DayXpVelocity,
  computeBtcSkillProgression,
  computeDomainScoreBreakdown,
  computeDomainScores,
  computeGrowthLoopState,
  getTier,
  levelProgress,
  getMilestones,
  type Area as GrowthArea,
} from "@/lib/growth";
import { BRAND } from "@/config/brand";
import {
  buildAcademicProgressReport,
  buildPersonalAchievementTimeline,
  formatAcademicReportMarkdown,
} from "@/lib/empowerment-engines";
import { isMistakeMastered, isTaskOpen } from "@/lib/recommendations";
import { computeLearningPathState } from "@/lib/skill-academy";
import { useStudentEcosystem } from "@/lib/student-ecosystem";
import { GrowthMap } from "./GrowthMap";
import { GrowthHeatmap } from "./GrowthHeatmap";
import { GrowthTimelinePath } from "./GrowthTimelinePath";
import { MilestonesGrid } from "./MilestonesGrid";
import { GrowthTrendsChart } from "./GrowthTrendsChart";
import { DailyPulseWidget } from "./DailyPulseWidget";
import { WeeklyObjectivesBoard } from "./WeeklyObjectivesBoard";
import { XpProgress } from "./XpProgress";
import { DailyJournal } from "@/components/journal/DailyJournal";

type GrowthSectionId =
  | "overview"
  | "goals_milestones"
  | "skills_learning"
  | "habits_consistency"
  | "achievements_reflection";

export function GrowthMapExperience() {
  const { data: profile } = useProfile();
  const { data: stats } = useStats();
  const { data: tasks = [] } = useTasks();
  const { data: goals = [] } = useGoals();
  const { addGoal, updateGoal } = useGoalActions();
  const { data: events = [] } = useActivityEvents(100);
  const { data: studyItems = [] } = useStudyItems();
  const { data: focusSessions = [] } = useFocusSessions();
  const { data: careEntries = [] } = useCareEntries();
  const { data: futurePlans = [] } = useFuturePlans();
  const { data: circles = [] } = useCircles();
  const { data: journalEntries = [] } = useJournalEntries();
  const { data: quizAttempts = [] } = useQuizAttempts();
  const { t, lang } = usePrefs();
  const { state: ecoState, update: updateEco } = useStudentEcosystem();
  const [activeSection, setActiveSection] = useState<GrowthSectionId>("overview");
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showGrowthCycle, setShowGrowthCycle] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalArea, setNewGoalArea] = useState<GrowthArea>("academic");
  const [newGoalMilestonesRaw, setNewGoalMilestonesRaw] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);

  const pathStatus = useMemo(
    () =>
      computeLearningPathState({
        pathId: ecoState.activeLearningPathId,
        masteredSteps: ecoState.masteredPathSteps,
        viewedSteps: ecoState.viewedPathSteps,
        stepScores: ecoState.pathStepScores,
        placement: ecoState.placement,
      }),
    [
      ecoState.activeLearningPathId,
      ecoState.masteredPathSteps,
      ecoState.viewedPathSteps,
      ecoState.pathStepScores,
      ecoState.placement,
    ],
  );
  const bestWpm = ecoState.typingHistory.reduce((mx, r) => Math.max(mx, r.wpm), 0);
  const skillProgression = useMemo(
    () =>
      computeBtcSkillProgression({
        listeningScores: ecoState.englishWorld.listeningScores,
        readingScores: ecoState.englishWorld.readingScores,
        grammarScores: ecoState.englishWorld.grammarScores,
        writingRevisions: Object.values(ecoState.englishWorld.writingSubmissions),
        speakingCount: ecoState.englishWorld.speakingPracticed.length,
        vocabProgressList: Object.values(ecoState.englishWorld.vocabProgress),
        typingSessions: ecoState.typingHistory,
        masteredPathStepsCount: ecoState.masteredPathSteps.length,
      }),
    [ecoState.englishWorld, ecoState.typingHistory, ecoState.masteredPathSteps.length],
  );

  const xp = stats?.xp ?? 0;
  const level = stats?.level ?? 1;
  const streak = stats?.current_streak ?? 0;
  const tier = getTier(level);
  const progress = levelProgress(xp);
  const milestones = getMilestones(level);

  const completedTasksByArea = useMemo(() => {
    const map: Partial<Record<GrowthArea, number>> = {};
    for (const tk of tasks) {
      if (tk.status === "done") {
        const a = (tk.area as GrowthArea) || "productivity";
        map[a] = (map[a] ?? 0) + 1;
      }
    }
    return map;
  }, [tasks]);

  const metricsInput = useMemo(
    () => ({
      goals,
      events,
      completedTasksByArea,
      studyCount: studyItems.length,
      focusSessionsCount: focusSessions.length,
      careCount: careEntries.length,
      futureCount: futurePlans.length,
      circleCount: circles.length,
      journalCount: journalEntries.length,
    }),
    [
      goals,
      events,
      completedTasksByArea,
      studyItems.length,
      focusSessions.length,
      careEntries.length,
      futurePlans.length,
      circles.length,
      journalEntries.length,
    ],
  );

  const domainScores = useMemo(() => computeDomainScores(metricsInput), [metricsInput]);
  const domainBreakdown = useMemo(() => computeDomainScoreBreakdown(metricsInput), [metricsInput]);

  const growthLoop = useMemo(() => {
    const openTasksCount = tasks.filter((tk) => isTaskOpen(tk.status)).length;
    const completedTasksCount = tasks.filter((tk) => tk.status === "done").length;
    const masteredMistakesCount = studyItems.filter(
      (s) => s.kind === "mistake" && isMistakeMastered(s.mistake_status),
    ).length;
    const weakSignalsCount = studyItems.filter(
      (s) => s.kind === "mistake" && !isMistakeMastered(s.mistake_status),
    ).length;

    return computeGrowthLoopState({
      studyItemsCount: studyItems.length,
      weakSignalsCount,
      goalsCount: goals.length,
      openTasksCount,
      completedTasksCount,
      focusSessionsCount: focusSessions.length,
      quizAttemptsCount: quizAttempts.length,
      journalCount: journalEntries.length,
      careCount: careEntries.length,
      masteredMistakesCount,
    });
  }, [
    tasks,
    studyItems,
    goals.length,
    focusSessions.length,
    quizAttempts.length,
    journalEntries.length,
    careEntries.length,
  ]);

  const radarData = useMemo(() => {
    return AREAS.map((key) => ({
      area: t(AREA_CONFIG[key].labelKey),
      score: domainScores[key],
      fullMark: 100,
    }));
  }, [domainScores, t]);

  const velocityData = useMemo(() => {
    return compute7DayXpVelocity(events).map((pt) => ({
      name: t(pt.labelKey),
      xp: pt.xp,
    }));
  }, [t, events]);

  const hasVelocityXp = velocityData.some((d) => d.xp > 0);
  const maxVelocityXp = Math.max(50, ...velocityData.map((d) => d.xp));

  const strengthsAndImprovements = useMemo(() => {
    const sorted = [...radarData].sort((a, b) => b.score - a.score);
    const topStrength = sorted[0];
    const topImprovement = sorted[sorted.length - 1];

    return {
      strength: {
        title: topStrength?.area || t("area.productivity"),
        score: topStrength?.score ?? 0,
        desc: t("dash.growth.strengthDesc"),
      },
      improvement: {
        title: topImprovement?.area || t("area.wellbeing"),
        score: topImprovement?.score ?? 0,
        desc: t("dash.growth.improvementDesc"),
      },
    };
  }, [radarData, t]);

  const isAr = lang === "ar";
  const avgDomainScore = useMemo(() => {
    const vals = Object.values(domainScores);
    if (vals.length === 0) return 0;
    return Math.round(vals.reduce((sum, v) => sum + v, 0) / vals.length);
  }, [domainScores]);

  const completedGoalsCount = useMemo(
    () => goals.filter((g) => g.status === "completed").length,
    [goals],
  );
  const total7DayXp = useMemo(() => velocityData.reduce((sum, d) => sum + d.xp, 0), [velocityData]);
  const timeline = useMemo(() => buildPersonalAchievementTimeline(ecoState), [ecoState]);
  const academicReport = useMemo(
    () =>
      buildAcademicProgressReport({
        state: ecoState,
        profile,
        stats,
        studyItems,
        quizAttempts,
        focusSessions,
        tasks,
        goals,
      }),
    [ecoState, profile, stats, studyItems, quizAttempts, focusSessions, tasks, goals],
  );

  const sections: Array<{
    id: GrowthSectionId;
    labelEn: string;
    labelAr: string;
    descEn: string;
    descAr: string;
    metric: string;
    Icon: typeof LayoutDashboard;
  }> = [
    {
      id: "overview",
      labelEn: "Overview",
      labelAr: "نظرة عامة",
      descEn: "Progress snapshot & interactive growth map",
      descAr: "ملخص التقدم وخريطة النمو التفاعلية",
      metric: `Lv.${formatNumber(level, lang)}`,
      Icon: LayoutDashboard,
    },
    {
      id: "goals_milestones",
      labelEn: "Goals & Milestones",
      labelAr: "الأهداف والمعالم",
      descEn: "Personal goals, weekly objectives & level roadmap",
      descAr: "بناء الأهداف الشخصية والأهداف الأسبوعية والمعالم",
      metric: `${formatNumber(goals.length, lang)} ${isAr ? "هدف" : "goals"}`,
      Icon: Target,
    },
    {
      id: "skills_learning",
      labelEn: "Skills & Learning",
      labelAr: "المهارات والتعلّم",
      descEn: "4-stage skill mastery, domain radar & study links",
      descAr: "مصفوفة إتقان المهارات ومؤشرات المجالات الدراسية",
      metric: `${skillProgression.stageCounts.skill_mastered}/${skillProgression.items.length}`,
      Icon: Brain,
    },
    {
      id: "habits_consistency",
      labelEn: "Habits & Consistency",
      labelAr: "العادات والاستمرارية",
      descEn: "Daily pulse, weekly heatmap & 7-day XP velocity",
      descAr: "النبض اليومي وخريطة الالتزام الأسبوعي وسرعة التقدم",
      metric: `${formatNumber(streak, lang)}d ${isAr ? "سلسلة" : "streak"}`,
      Icon: CalendarCheck,
    },
    {
      id: "achievements_reflection",
      labelEn: "Achievements & Reflection",
      labelAr: "الإنجازات والتأمل",
      descEn: "Academic progress report, timeline & daily journal",
      descAr: "تقرير التقدم الموثق والسجل الزمني واليوميات",
      metric: `${formatNumber(timeline.length, lang)} ${isAr ? "سجل" : "logs"}`,
      Icon: Award,
    },
  ];

  const renderBackToOverview = () => (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        data-testid="growth-back-overview-btn"
        onClick={() => setActiveSection("overview")}
        className="min-h-[44px] gap-1.5 text-xs"
      >
        <ArrowLeft className="size-3.5 rtl-flip" />
        <span>{isAr ? "العودة إلى النظرة العامة" : "Return to Overview"}</span>
      </Button>
      <span className="text-xs font-medium text-muted-foreground">
        {sections.find((s) => s.id === activeSection)?.[isAr ? "labelAr" : "labelEn"]}
      </span>
    </div>
  );

  return (
    <div className="space-y-6" data-testid="growth-map-experience">
      {/* 1. Hero Progression Banner */}
      <div className="surface-card p-6 md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                <Trophy className="size-3.5" />
                <span>
                  {tier.badge} {t(tier.nameKey)} · {t("common.level")} {formatNumber(level, lang)}
                </span>
              </div>
              <FeatureGuideTrigger featureId="growth-map" />
            </div>

            <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
              {t("dash.growth.title")}
            </h1>

            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {t("dash.growth.sub")}
            </p>
          </div>

          <div className="min-w-0 sm:min-w-64">
            <XpProgress xp={xp} level={level} />
          </div>
        </div>
      </div>

      {/* 5-Section Structured Navigation Bar */}
      <nav
        role="tablist"
        data-testid="growth-section-tabs"
        aria-label={isAr ? "أقسام خريطة النمو" : "Growth Map Sections"}
        className="flex gap-1.5 overflow-x-auto rounded-2xl border border-border bg-surface-2/60 p-1.5 no-scrollbar"
      >
        {sections.map(({ id, labelEn, labelAr, Icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-testid={`growth-section-tab-${id}`}
              onClick={() => setActiveSection(id)}
              className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              <span>{isAr ? labelAr : labelEn}</span>
            </button>
          );
        })}
      </nav>

      {/* SECTION A: OVERVIEW */}
      {activeSection === "overview" && (
        <div className="space-y-6" data-testid="growth-section-panel-overview">
          {/* Clear Next Recommended Step Card */}
          {(() => {
            const nextStage =
              growthLoop.stages.find((s) => s.id === growthLoop.activeStageId && !s.completed) ??
              growthLoop.stages.find((s) => !s.completed) ??
              growthLoop.stages[0];
            if (!nextStage) return null;
            return (
              <div
                data-testid="growth-next-step-card"
                className="surface-card flex flex-wrap items-center justify-between gap-4 border-primary/35 bg-primary/5 p-4 md:p-5"
              >
                <div className="min-w-0 space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                    <Compass className="size-3.5" />
                    <span>{isAr ? "الخطوة التالية المقترحة" : "Recommended Next Step"}</span>
                  </div>
                  <h2 className="font-display text-base font-bold text-foreground">
                    {t(`growth.loop.${nextStage.id}`)} ·{" "}
                    <span className="text-primary">
                      {isAr
                        ? `أولوية التطوير: ${strengthsAndImprovements.improvement.title}`
                        : `Focus area: ${strengthsAndImprovements.improvement.title}`}
                    </span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t(`growth.loop.${nextStage.id}.d`)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Link
                    to={nextStage.to}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 whitespace-nowrap"
                  >
                    <span>{isAr ? "ابدأ الخطوة الآن" : "Start Next Step"}</span>
                    <ArrowRight className="size-3.5 rtl-flip" />
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveSection("goals_milestones")}
                    className="min-h-[44px] px-3 text-xs whitespace-nowrap"
                  >
                    {isAr ? "إدارة الأهداف" : "Manage Goals"}
                  </Button>
                </div>
              </div>
            );
          })()}

          {/* KPI Summary Strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="surface-card p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {isAr ? "المستوى والرتبة" : "Growth Stage"}
              </p>
              <p className="mt-1 font-display text-lg font-bold text-foreground tabular-nums">
                {tier.badge} Lv.{formatNumber(level, lang)}
              </p>
              <p className="text-[11px] text-primary">
                {Math.round(progress.pct)}% {isAr ? "للمستوى التالي" : "to next level"}
              </p>
            </div>
            <div className="surface-card p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {isAr ? "مؤشر التوازن العام" : "Domain Balance"}
              </p>
              <p className="mt-1 font-display text-lg font-bold text-foreground tabular-nums">
                {formatNumber(avgDomainScore, lang)}%
              </p>
              <p className="text-[11px] text-muted-foreground">
                {formatNumber(AREAS.length, lang)} {isAr ? "مجالات حياة" : "life areas"}
              </p>
            </div>
            <div className="surface-card p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {isAr ? "الأهداف والمعالم" : "Goals Progress"}
              </p>
              <p className="mt-1 font-display text-lg font-bold text-foreground tabular-nums">
                {formatNumber(completedGoalsCount, lang)} / {formatNumber(goals.length, lang)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {milestones.filter((m) => m.unlocked).length}/{milestones.length}{" "}
                {isAr ? "معالم مفتوحة" : "milestones"}
              </p>
            </div>
            <div className="surface-card p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {isAr ? "سلسلة الالتزام" : "Active Streak"}
              </p>
              <p className="mt-1 flex items-center gap-1.5 font-display text-lg font-bold text-xp tabular-nums">
                <Flame className="size-4" />
                <span>
                  {formatNumber(streak, lang)} {isAr ? "يوم" : "days"}
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground tabular-nums">
                +{formatNumber(total7DayXp, lang)} XP (7d)
              </p>
            </div>
          </div>

          {/* 4 Interactive Sub-Section Jump Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sections
              .filter((s) => s.id !== "overview")
              .map(({ id, labelEn, labelAr, descEn, descAr, metric, Icon }) => (
                <button
                  key={id}
                  type="button"
                  data-testid={`growth-overview-card-${id}`}
                  onClick={() => setActiveSection(id)}
                  className="surface-card group flex min-h-[44px] flex-col justify-between p-4 text-start transition-all hover:border-primary/50"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-4.5" />
                      </span>
                      <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-bold text-primary tabular-nums">
                        {metric}
                      </span>
                    </div>
                    <h2 className="mt-3 font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {isAr ? labelAr : labelEn}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {isAr ? descAr : descEn}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-primary">
                    <span>{isAr ? "فتح القسم" : "Open Section"}</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl-flip" />
                  </div>
                </button>
              ))}
          </div>

          {/* Compact Visual Growth Map (timeline moved cleanly to Goals & Milestones) */}
          <GrowthMap
            level={level}
            xp={xp}
            scores={domainScores}
            completedTasksByArea={completedTasksByArea}
            goals={goals}
            events={events}
            showTimeline={false}
          />

          {/* Connected 5-Stage Growth Loop (Expandable to keep Overview clean) */}
          <div className="surface-card overflow-hidden">
            <button
              type="button"
              data-testid="growth-cycle-toggle"
              aria-expanded={showGrowthCycle}
              onClick={() => setShowGrowthCycle((v) => !v)}
              className="flex min-h-[52px] w-full items-center justify-between gap-3 px-5 py-3.5 text-start transition-colors hover:bg-surface-2/60"
            >
              <div>
                <h2 className="font-display text-sm font-bold text-foreground">
                  {t("growth.loop.title")}
                </h2>
                <p className="text-xs text-muted-foreground">{t("growth.loop.sub")}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground">
                <span>
                  {showGrowthCycle
                    ? isAr
                      ? "إخفاء المراحل"
                      : "Hide Cycle"
                    : isAr
                      ? "عرض دورة النمو (٥ مراحل)"
                      : "View 5-Stage Cycle"}
                </span>
                <ChevronDown
                  className={`size-3.5 transition-transform ${showGrowthCycle ? "rotate-180" : ""}`}
                />
              </span>
            </button>

            {showGrowthCycle && (
              <div className="border-t border-border/80 p-5 pt-4">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
                  {growthLoop.stages.map((stage, idx) => {
                    const isNext = growthLoop.activeStageId === stage.id && !stage.completed;
                    return (
                      <Link
                        key={stage.id}
                        to={stage.to}
                        className={`group flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                          stage.completed
                            ? "border-success/35 bg-success/10 hover:border-success/60"
                            : isNext
                              ? "border-primary bg-primary/10 hover:border-primary"
                              : "border-border bg-surface-2 hover:border-primary/40"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 text-[0.68rem] font-bold uppercase tracking-wider">
                            <span className={stage.completed ? "text-success" : "text-primary"}>
                              0{idx + 1} · {t(`growth.loop.${stage.id}`)}
                            </span>
                            <span className="tabular-nums text-muted-foreground">
                              {stage.completed
                                ? t("growth.loop.done")
                                : isNext
                                  ? t("growth.loop.next")
                                  : formatNumber(stage.metricCount, lang)}
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                            {t(`growth.loop.${stage.id}.d`)}
                          </p>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[0.7rem] font-semibold text-foreground">
                          <span className="tabular-nums">
                            {formatNumber(stage.metricCount, lang)}
                          </span>
                          <ArrowRight className="size-3 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary rtl-flip" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION B: GOALS & MILESTONES */}
      {activeSection === "goals_milestones" && (
        <div className="space-y-6" data-testid="growth-section-panel-goals_milestones">
          {renderBackToOverview()}

          {/* Personal Goal & Milestone Builder */}
          <div className="surface-card space-y-4 p-5 md:p-6" data-testid="growth-map-goal-builder">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/80 pb-3">
              <div>
                <h2 className="font-display text-base font-bold text-foreground">
                  {isAr
                    ? "خريطة النمو 2.0 — بناء الأهداف والمعالم الشخصية"
                    : "Growth Map 2.0 — Personal Goals & Milestones Builder"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isAr
                    ? "تقيس خريطة النمو أنشطتك وأهدافك التي تحددها بنفسك فقط — ولا تقيس أبداً قيمة الإنسان أو كفاءته الشخصية."
                    : "Tracks real study actions, habits, projects, and self-defined milestones — never a judgment of personal worth."}
                </p>
              </div>
              <span className="text-xs font-semibold tabular-nums text-primary">
                {formatNumber(goals.length, lang)} {isAr ? "أهداف" : "goals"} ·{" "}
                {formatNumber(ecoState.portfolio.projects.length, lang)}{" "}
                {isAr ? "أعمال" : "portfolio"} ·{" "}
                {formatNumber(ecoState.researchProjects.length, lang)} {isAr ? "أبحاث" : "research"}
              </span>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newGoalTitle.trim() || savingGoal) return;
                setSavingGoal(true);
                try {
                  const goalMilestones = newGoalMilestonesRaw
                    .split(",")
                    .map((m) => m.trim())
                    .filter(Boolean)
                    .slice(0, 8)
                    .map((title, idx) => ({
                      id: `gm_${Date.now().toString(36)}_${idx}`,
                      title,
                      done: false,
                    }));
                  await addGoal({
                    title: newGoalTitle.trim(),
                    area: newGoalArea,
                    ...(goalMilestones.length > 0 ? { milestones: goalMilestones } : {}),
                  });
                  toast.success(
                    isAr
                      ? "تم إضافة الهدف والمعالم إلى خريطة نموك!"
                      : "Added personal goal & milestones to your Growth Map!",
                  );
                  setNewGoalTitle("");
                  setNewGoalMilestonesRaw("");
                } catch {
                  toast.error("Sign in or reconnect to save new personal goals.");
                } finally {
                  setSavingGoal(false);
                }
              }}
              className="grid gap-2.5 sm:grid-cols-12"
            >
              <Input
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder={
                  isAr
                    ? "أضف هدفاً جديداً (مثال: إتمام مشروع العلوم التطبيقي)..."
                    : "New personal growth goal (e.g., Complete Biology Research Portfolio)..."
                }
                className="min-h-[44px] sm:col-span-5 text-xs"
              />
              <ModernSelect
                ariaLabel="Growth area"
                value={newGoalArea}
                onValueChange={(val) => setNewGoalArea(val as GrowthArea)}
                className="sm:col-span-2"
                options={AREAS.map((a) => ({
                  value: a,
                  label: t(AREA_CONFIG[a].labelKey),
                }))}
              />
              <Input
                value={newGoalMilestonesRaw}
                onChange={(e) => setNewGoalMilestonesRaw(e.target.value)}
                placeholder={
                  isAr
                    ? "معالم مفصولة بفاصلة (اختياري)"
                    : "Milestones separated by commas (optional)..."
                }
                className="min-h-[44px] sm:col-span-3 text-xs"
              />
              <Button
                type="submit"
                size="sm"
                variant="glow"
                disabled={savingGoal || !newGoalTitle.trim()}
                className="min-h-[44px] sm:col-span-2 text-xs"
              >
                {savingGoal ? "..." : isAr ? "إضافة هدف" : "Add Goal"}
              </Button>
            </form>

            {goals.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2">
                {goals.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-xl border border-border bg-surface-2/70 p-3 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-foreground">{g.title}</span>
                      <span className="text-[11px] font-semibold uppercase text-primary">
                        {t(AREA_CONFIG[g.area]?.labelKey ?? "area.growth")}
                      </span>
                    </div>
                    {g.milestones && g.milestones.length > 0 && (
                      <div className="space-y-1">
                        {g.milestones.map((ms) => (
                          <button
                            key={ms.id}
                            type="button"
                            onClick={() => {
                              const updated = (g.milestones ?? []).map((item) =>
                                item.id === ms.id ? { ...item, done: !item.done } : item,
                              );
                              void updateGoal(g, { milestones: updated });
                            }}
                            className={`flex min-h-[38px] w-full items-center justify-between rounded-md border px-2 py-1 text-start text-[11px] ${
                              ms.done
                                ? "border-emerald-500/40 bg-emerald-500/10 text-foreground line-through"
                                : "border-border bg-surface text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span>{ms.title}</span>
                            <CheckCircle2
                              className={`size-3 shrink-0 ${ms.done ? "text-emerald-400" : "opacity-30"}`}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <WeeklyObjectivesBoard />

          {/* Interactive SVG Level Milestone Roadmap */}
          <div className="surface-card space-y-4 p-5 md:p-6" data-testid="growth-milestone-roadmap">
            <div className="border-b border-border/80 pb-3">
              <h2 className="font-display text-base font-bold text-foreground">
                {t("dash.growth.milestones")}
              </h2>
              <p className="text-xs text-muted-foreground">{t("dash.growth.milestonesSub")}</p>
            </div>
            <GrowthTimelinePath level={level} xp={xp} />
          </div>
        </div>
      )}

      {/* SECTION C: SKILLS & LEARNING */}
      {activeSection === "skills_learning" && (
        <div className="space-y-6" data-testid="growth-section-panel-skills_learning">
          {renderBackToOverview()}

          {/* BTC Student Intelligence & 4-Stage Skill Mastery */}
          <div className="surface-card space-y-4 p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-foreground">
                  {isAr
                    ? "مؤشرات المهارات ومسارات التعلّم"
                    : "BTC Student Intelligence & Skill Mastery"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isAr
                    ? "ربط مباشر بمستويات التعلّم دون تكرار أدوات الدراسة."
                    : "Connected directly to Study, English, Coding, and Future Labs without duplicating tools."}
                </p>
              </div>
              <Link
                to="/app/study"
                className="inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <span>{isAr ? "فتح أكاديمية الدراسة" : "Open Study Academy"}</span>
                <ArrowRight className="size-3.5 rtl-flip" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              <Link
                to="/app/english"
                className="rounded-xl border border-border bg-surface-2 p-3.5 hover:border-primary/50"
              >
                <div className="text-[0.68rem] uppercase text-muted-foreground">
                  {isAr ? "ملف المهارات اللغوية" : "Language Profile"}
                </div>
                <div className="mt-1 font-display text-sm font-bold text-foreground">
                  {ecoState.placement
                    ? `${ecoState.placement.dimensions
                        .slice(0, 2)
                        .map((d) => `${d.cefr}`)
                        .join(" · ")} (${ecoState.placement.strongestDimension.replace("_", " ")})`
                    : isAr
                      ? "تحديد المستوى اللغوي"
                      : "Take 5-Dimension Check"}
                </div>
              </Link>

              <Link
                to="/app/study"
                className="rounded-xl border border-border bg-surface-2 p-3.5 hover:border-primary/50"
              >
                <div className="text-[0.68rem] uppercase text-muted-foreground">
                  {isAr ? "المسار التكيفي النشط" : "Active Adaptive Path"}
                </div>
                <div className="mt-1 font-display text-sm font-bold text-primary">
                  {pathStatus.path.title.split(" ").slice(0, 3).join(" ")} ·{" "}
                  {pathStatus.completionPct}%
                </div>
              </Link>

              <Link
                to="/app/study"
                className="rounded-xl border border-border bg-surface-2 p-3.5 hover:border-primary/50"
              >
                <div className="text-[0.68rem] uppercase text-muted-foreground">
                  {isAr ? "سرعة الطباعة والتطبيق" : "Practical & Typing PB"}
                </div>
                <div className="mt-1 font-display text-sm font-bold text-foreground">
                  {bestWpm > 0
                    ? `${bestWpm} WPM`
                    : isAr
                      ? "التدرّب في معمل الطباعة"
                      : "Practice in Typing Lab"}
                </div>
              </Link>

              <Link
                to="/app/level-up"
                className="rounded-xl border border-border bg-surface-2 p-3.5 hover:border-primary/50"
              >
                <div className="text-[0.68rem] uppercase text-muted-foreground">
                  {isAr ? "الإنجازات والمستويات" : "Achievements & Portfolio"}
                </div>
                <div className="mt-1 font-display text-sm font-bold text-xp">
                  {ecoState.adventure.collectedRelics.length}/4 Relics ·{" "}
                  {ecoState.portfolio.projects.length} Projects
                </div>
              </Link>
            </div>

            <div
              className="space-y-2.5 rounded-xl border border-border/80 bg-surface-2/60 p-4 text-xs"
              data-testid="growth-4stage-mastery"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold text-foreground">
                  {isAr
                    ? "تقدّم إتقان المهارات (4 مراحل موثّقة)"
                    : "4-Stage Skill Mastery Progress (Multi-Attempt Verified)"}
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground tabular-nums">
                  <span>
                    {isAr ? "مكتمل:" : "Completed:"}{" "}
                    {formatNumber(skillProgression.stageCounts.activity_completed, lang)}
                  </span>
                  <span>
                    · {isAr ? "تم إثباته:" : "Demonstrated:"}{" "}
                    {formatNumber(skillProgression.stageCounts.knowledge_demonstrated, lang)}
                  </span>
                  <span>
                    · {isAr ? "قيد التحسن:" : "Improving:"}{" "}
                    {formatNumber(skillProgression.stageCounts.skill_improving, lang)}
                  </span>
                  <span className="font-semibold text-success">
                    · {isAr ? "متقن:" : "Mastered:"}{" "}
                    {formatNumber(skillProgression.stageCounts.skill_mastered, lang)}/
                    {formatNumber(skillProgression.items.length, lang)}
                  </span>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {skillProgression.items.map((sk) => (
                  <div
                    key={sk.id}
                    className={`rounded-lg border p-2.5 ${
                      sk.stage === "skill_mastered"
                        ? "border-success/40 bg-success/10"
                        : sk.stage === "skill_improving"
                          ? "border-primary/40 bg-primary/10"
                          : sk.stage === "knowledge_demonstrated" ||
                              sk.stage === "activity_completed"
                            ? "border-border bg-surface"
                            : "border-border/50 bg-surface/50 opacity-75"
                    }`}
                  >
                    <div className="font-semibold text-foreground">{sk.label}</div>
                    <div className="mt-0.5 text-[11px] font-medium text-primary">
                      {sk.stageLabel}
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{sk.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Domain Radar + Transparent Score Breakdown */}
          <div className="surface-card flex flex-col p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3">
              <div>
                <h2 className="font-display text-base font-bold text-foreground">
                  {t("dash.growth.radar")} ({t("dash.growth.dimensions")})
                </h2>
                <p className="text-xs text-muted-foreground">{t("dash.growth.radarSub")}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowBreakdown((v) => !v)}
                aria-expanded={showBreakdown}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Info className="size-3.5 text-primary" />
                <span>{t("growth.breakdown.btn")}</span>
                <ChevronDown
                  className={`size-3.5 transition-transform ${showBreakdown ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={180} minHeight={200}>
                <RadarChart data={radarData} margin={{ top: 10, right: 25, bottom: 10, left: 25 }}>
                  <PolarGrid stroke="var(--chart-grid)" />
                  <PolarAngleAxis
                    dataKey="area"
                    tick={{ fill: "var(--chart-axis)", fontSize: 11, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: "var(--chart-axis)", fontSize: 9 }}
                  />
                  <Radar
                    name={t("growth.chart.proficiency")}
                    dataKey="score"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.35}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--chart-tooltip-bg)",
                      borderColor: "var(--chart-tooltip-border)",
                      borderRadius: "0.5rem",
                      color: "var(--chart-tooltip-fg)",
                      fontSize: "0.75rem",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {showBreakdown && (
              <div className="mt-4 space-y-3 rounded-xl border border-border bg-surface-2/80 p-4">
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    {t("growth.breakdown.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground">{t("growth.breakdown.desc")}</p>
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {AREAS.map((areaKey) => {
                    const b = domainBreakdown[areaKey];
                    const cfg = AREA_CONFIG[areaKey];
                    return (
                      <div
                        key={areaKey}
                        className="rounded-lg border border-border/80 bg-surface p-3 text-xs"
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span style={{ color: cfg.accentColor }}>{t(cfg.labelKey)}</span>
                          <span className="tabular-nums text-foreground">
                            {formatNumber(b.totalScore, lang)}/100
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-1.5 text-[0.7rem] text-muted-foreground tabular-nums">
                          <span>
                            {t("growth.breakdown.goals")}: +{formatNumber(b.goalsPoints, lang)}
                          </span>
                          <span>
                            {t("growth.breakdown.events")}: +{formatNumber(b.eventsPoints, lang)}
                          </span>
                          <span>
                            {t("growth.breakdown.tasks")}: +{formatNumber(b.tasksPoints, lang)}
                          </span>
                          <span>
                            {t("growth.breakdown.module")}: +{formatNumber(b.modulePoints, lang)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Strengths & Focus Opportunities + Actionable Module Links */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="surface-card flex items-start gap-4 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold uppercase tracking-wider text-success">
                    {t("dash.growth.strengths")}
                  </span>
                  <span aria-hidden="true" className="text-muted-foreground">
                    ·
                  </span>
                  <span className="font-bold tabular-nums text-success">
                    {formatNumber(strengthsAndImprovements.strength.score, lang)}%
                  </span>
                </div>
                <h3 className="mt-1 font-display text-base font-bold text-foreground">
                  {strengthsAndImprovements.strength.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {strengthsAndImprovements.strength.desc}
                </p>
              </div>
            </div>

            <div className="surface-card flex items-start gap-4 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-xp/15 text-xp">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold uppercase tracking-wider text-xp">
                    {t("dash.growth.improvements")}
                  </span>
                  <span aria-hidden="true" className="text-muted-foreground">
                    ·
                  </span>
                  <span className="font-bold tabular-nums text-xp">
                    {formatNumber(strengthsAndImprovements.improvement.score, lang)}%
                  </span>
                </div>
                <h3 className="mt-1 font-display text-base font-bold text-foreground">
                  {strengthsAndImprovements.improvement.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {strengthsAndImprovements.improvement.desc}
                </p>
              </div>
            </div>
          </div>

          <div className="surface-card p-5 md:p-6">
            <div className="border-b border-border/80 pb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="size-4.5 text-primary" />
                <h2 className="font-display text-base font-bold text-foreground">
                  {t("dash.growth.recommendations")}
                </h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("dash.growth.recommendationsSub")}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/app/study"
                className="group flex flex-col justify-between rounded-xl border border-border bg-surface-2 p-4 transition-all hover:border-primary/50 hover:bg-surface-2/90"
              >
                <div>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <BookOpen className="size-4" />
                  </div>
                  <h4 className="mt-3 font-display text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                    {t("dash.growth.rec1.title")}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">{t("dash.growth.rec1.desc")}</p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-medium text-primary">
                  <span>{t("dash.growth.rec1.cta")}</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 rtl-flip" />
                </div>
              </Link>

              <Link
                to="/app/quran"
                className="group flex flex-col justify-between rounded-xl border border-border bg-surface-2 p-4 transition-all hover:border-primary/50 hover:bg-surface-2/90"
              >
                <div>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-xp/15 text-xp">
                    <HeartPulse className="size-4" />
                  </div>
                  <h4 className="mt-3 font-display text-sm font-semibold text-foreground transition-colors group-hover:text-xp">
                    {isAr ? "القرآن الكريم والسكينة" : "Quran & Islamic Center"}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isAr
                      ? "اقرأ وردك اليومي واستمع لتلاوات هادئة تعزز التركيز."
                      : "Read daily verses and reflect in the Islamic Learning Center."}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-medium text-xp">
                  <span>{isAr ? "افتح القرآن الكريم" : "Open Quran Center"}</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 rtl-flip" />
                </div>
              </Link>

              <Link
                to="/app/circle"
                className="group flex flex-col justify-between rounded-xl border border-border bg-surface-2 p-4 transition-all hover:border-primary/50 hover:bg-surface-2/90"
              >
                <div>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Compass className="size-4" />
                  </div>
                  <h4 className="mt-3 font-display text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                    {isAr ? "حلقة المعرفة" : "Knowledge Circle"}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isAr
                      ? "تعاون مع زملائك في المذاكرة وتبادل الملخصات والأسئلة."
                      : "Collaborate in your peer study circle, notes, and Q&A rooms."}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-medium text-primary">
                  <span>{isAr ? "ادخل حلقة المعرفة" : "Open Knowledge Circle"}</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 rtl-flip" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SECTION D: HABITS & CONSISTENCY */}
      {activeSection === "habits_consistency" && (
        <div className="space-y-6" data-testid="growth-section-panel-habits_consistency">
          {renderBackToOverview()}

          <DailyPulseWidget />
          <GrowthHeatmap />

          <div className="surface-card flex flex-col p-5 md:p-6">
            <div className="border-b border-border/80 pb-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-base font-bold text-foreground">
                  {t("dash.growth.velocity")}
                </h2>
                <span className="flex items-center gap-1 text-xs font-semibold text-xp tabular-nums">
                  <Flame className="size-3.5" />
                  {formatNumber(streak, lang)} {t("common.streak")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {hasVelocityXp ? t("growth.vel.live") : t("growth.vel.noData")}
              </p>
            </div>

            <div className="mt-4 h-64 w-full sm:h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={180} minHeight={200}>
                <AreaChart
                  data={velocityData}
                  margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="growthVelocity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--xp)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--xp)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--chart-axis)" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="var(--chart-axis)"
                    fontSize={11}
                    tickLine={false}
                    domain={[0, maxVelocityXp + 20]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--chart-tooltip-bg)",
                      borderColor: "var(--chart-tooltip-border)",
                      borderRadius: "0.5rem",
                      color: "var(--chart-tooltip-fg)",
                      fontSize: "0.75rem",
                    }}
                    formatter={(value: unknown) => [
                      `${value} ${t("common.xp")}`,
                      t("growth.chart.gained"),
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="xp"
                    stroke="var(--xp)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#growthVelocity)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <GrowthTrendsChart />
        </div>
      )}

      {/* SECTION E: ACHIEVEMENTS & REFLECTION */}
      {activeSection === "achievements_reflection" && (
        <div className="space-y-6" data-testid="growth-section-panel-achievements_reflection">
          {renderBackToOverview()}

          <MilestonesGrid />

          <div className="grid gap-5 lg:grid-cols-2 text-xs">
            <div className="surface-card space-y-3 p-5" data-testid="academic-progress-report">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  <h2 className="font-display text-base font-bold text-foreground">
                    {isAr
                      ? "تقرير التقدم الأكاديمي وخصوصية المشاركة"
                      : "Academic Progress Report & Share Privacy"}
                  </h2>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="min-h-[40px] text-[11px]"
                    onClick={() =>
                      downloadSafeTextFile(
                        formatAcademicReportMarkdown(academicReport),
                        `${BRAND.shortName.toLowerCase()}-academic-progress-report.md`,
                        "text/markdown;charset=utf-8",
                      )
                    }
                  >
                    <Download className="size-3" />
                    <span>Markdown</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="glow"
                    className="min-h-[40px] text-[11px]"
                    onClick={() =>
                      downloadSafeTextFile(
                        JSON.stringify(academicReport, null, 2),
                        `${BRAND.shortName.toLowerCase()}-academic-progress-report.json`,
                        "application/json;charset=utf-8",
                      )
                    }
                  >
                    <Download className="size-3" />
                    <span>JSON</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-[11px] text-foreground">
                <ShieldCheck className="size-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{academicReport.careExclusionGuarantee}</span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    {
                      key: "shareMasteryBreakdown",
                      labelEn: "Include Subject Mastery & Exams",
                      labelAr: "تضمين إتقان المواد والاختبارات",
                    },
                    {
                      key: "shareGapSummary",
                      labelEn: "Include Learning Gaps & Prerequisites",
                      labelAr: "تضمين فجوات التعلّم والمتطلبات",
                    },
                    {
                      key: "sharePortfolioArtifacts",
                      labelEn: "Include Portfolio Artifacts",
                      labelAr: "تضمين أعمال ومشاريع الملف الشخصي",
                    },
                    {
                      key: "shareMilestones",
                      labelEn: "Include Verified Milestones",
                      labelAr: "تضمين المعالم الموثّقة",
                    },
                  ] as const
                ).map((item) => (
                  <label
                    key={item.key}
                    className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={ecoState.reportPrivacy[item.key]}
                      onChange={(e) =>
                        updateEco((prev) => ({
                          ...prev,
                          reportPrivacy: {
                            ...prev.reportPrivacy,
                            [item.key]: e.target.checked,
                          },
                        }))
                      }
                      className="accent-primary"
                    />
                    <span className="text-foreground">{isAr ? item.labelAr : item.labelEn}</span>
                  </label>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-surface-2 p-3 space-y-1 text-[11px]">
                <div className="font-semibold text-foreground">
                  {isAr ? "معاينة التقرير" : "Report Preview"} · {academicReport.gradeAndTrack}
                </div>
                <p className="text-muted-foreground tabular-nums">
                  {isAr ? "التركيز:" : "Focus:"}{" "}
                  {formatNumber(academicReport.overview.focusMinutes, lang)}m ·{" "}
                  {isAr ? "المهام المنجزة:" : "Tasks Done:"}{" "}
                  {formatNumber(academicReport.overview.completedTasks, lang)} ·{" "}
                  {isAr ? "متوسط الاختبارات:" : "Avg Quiz:"}{" "}
                  {academicReport.overview.averageQuizPct !== null
                    ? `${formatNumber(academicReport.overview.averageQuizPct, lang)}%`
                    : isAr
                      ? "لا يوجد"
                      : "N/A"}
                </p>
                {academicReport.masterySection.included && (
                  <p className="text-muted-foreground">
                    {isAr ? "الإتقان:" : "Mastery:"} CEFR{" "}
                    {academicReport.masterySection.cefrEstimate} ·{" "}
                    {formatNumber(academicReport.masterySection.skillLessonsCompleted, lang)}{" "}
                    {isAr ? "دروس مهارات" : "skill lessons"}
                  </p>
                )}
                {academicReport.gapSection.included && (
                  <p className="text-muted-foreground tabular-nums">
                    {isAr ? "الفجوات:" : "Gaps:"}{" "}
                    {formatNumber(academicReport.gapSection.activeGaps.length, lang)}{" "}
                    {isAr ? "نشطة" : "active"} ·{" "}
                    {formatNumber(academicReport.gapSection.resolvedGapCount, lang)}{" "}
                    {isAr ? "تم حلها" : "resolved"}
                  </p>
                )}
              </div>
            </div>

            <div className="surface-card space-y-3 p-5" data-testid="personal-achievement-timeline">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <History className="size-4 text-primary" />
                  <h2 className="font-display text-base font-bold text-foreground">
                    {isAr ? "السجل الزمني للإنجازات الشخصية" : "Personal Achievement Timeline"}
                  </h2>
                </div>
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  {formatNumber(timeline.length, lang)} {isAr ? "سجلات" : "entries"}
                </span>
              </div>
              {timeline.length === 0 ? (
                <p className="py-6 text-center text-muted-foreground">
                  {isAr
                    ? "أكمل محاكاة اختبار أو تصميماً بحثياً أو مشروعاً أو تحدي الأسبوع لإضافة أول إنجاز موثّق هنا."
                    : "Complete an Exam Sim, Experiment Design, Problem Arena log, Portfolio project, or Challenge of the Week to populate your verified timeline."}
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pe-1">
                  {timeline.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-border bg-surface-2 p-3 space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold uppercase text-primary">{item.category}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {item.dateIso.slice(0, 10)}
                        </span>
                      </div>
                      <div className="font-semibold text-foreground">{item.title}</div>
                      <div className="text-muted-foreground">{item.detail}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DailyJournal />
        </div>
      )}
    </div>
  );
}
