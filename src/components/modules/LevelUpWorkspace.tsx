import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Compass,
  Flame,
  HelpCircle,
  Sparkles,
  Trophy,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { AdventureWorldGame } from "@/components/adventure/AdventureWorldGame";
import { PageHeader } from "@/components/app/Page";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import type { FeatureGuideId } from "@/lib/feature-guides";
import { GrowthHistory } from "@/components/growth/GrowthHistory";
import { MilestonesGrid } from "@/components/growth/MilestonesGrid";
import { StudentPortfolioPanel } from "@/components/portfolio/StudentPortfolioPanel";
import { ThinkingAnalysisStudio } from "@/components/thinking/ThinkingAnalysisStudio";
import { CodingTechStudio } from "@/components/coding/CodingTechStudio";
import { Button } from "@/components/ui/button";
import {
  useCareEntries,
  useCircles,
  useFocusSessions,
  useFuturePlans,
  useJournalEntries,
  useQuizAttempts,
  useStudyItems,
} from "@/hooks/use-modules";
import { useActivityEvents, useGoals, useStats, useTasks } from "@/hooks/use-nexora";
import {
  AREA_CONFIG,
  computeXpAreaBreakdown,
  getAchievementBadges,
  getTier,
  levelProgress,
} from "@/lib/growth";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentWeeklyChallenge } from "@/lib/empowerment-engines";
import { KNOWLEDGE_CHALLENGES, getQuestionOfTheDay } from "@/lib/learning-intelligence";
import { formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import { computeAchievementEvidence, useStudentEcosystem } from "@/lib/student-ecosystem";

type LevelUpTab = "overview" | "adventure" | "qotd" | "portfolio" | "thinking" | "coding";

export function LevelUpWorkspace() {
  const { t, lang } = usePrefs();
  const { state: ecoState, update: updateEco } = useStudentEcosystem();
  const [subTab, setSubTab] = useState<LevelUpTab>("overview");
  const [qotdChoice, setQotdChoice] = useState<number | null>(null);
  const [challengeAnswers, setChallengeAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qTab = params.get("tab") as LevelUpTab | null;
    const valid: LevelUpTab[] = [
      "overview",
      "adventure",
      "qotd",
      "portfolio",
      "thinking",
      "coding",
    ];
    if (qTab && valid.includes(qTab)) {
      setSubTab(qTab);
    }
  }, []);

  const todayKey = new Date().toISOString().slice(0, 10);
  const qotd = useMemo(() => getQuestionOfTheDay(todayKey), [todayKey]);
  const weeklyChallenge = useMemo(() => getCurrentWeeklyChallenge(todayKey), [todayKey]);
  const [weeklyChoice, setWeeklyChoice] = useState<number | null>(null);
  const [weeklyReflection, setWeeklyReflection] = useState("");

  const { data: stats } = useStats();
  const { data: events = [] } = useActivityEvents(100);
  const { data: focusSessions = [] } = useFocusSessions();
  const { data: studyItems = [] } = useStudyItems();
  const { data: goals = [] } = useGoals();
  const { data: tasks = [] } = useTasks();
  const { data: journalEntries = [] } = useJournalEntries();
  const { data: quizAttempts = [] } = useQuizAttempts();
  const { data: futurePlans = [] } = useFuturePlans();
  const { data: circles = [] } = useCircles();
  const { data: careEntries = [] } = useCareEntries();

  const xp = stats?.xp ?? 0;
  const level = stats?.level ?? 1;
  const currentStreak = stats?.current_streak ?? 0;
  const longestStreak = stats?.longest_streak ?? 0;
  const tier = getTier(level);
  const progress = levelProgress(xp);

  const completedTasks = useMemo(() => tasks.filter((tk) => tk.status === "done").length, [tasks]);
  const completedGoals = useMemo(
    () => goals.filter((g) => g.status === "completed").length,
    [goals],
  );
  const masteredMistakes = useMemo(
    () => studyItems.filter((s) => s.kind === "mistake" && s.mistake_status === "mastered").length,
    [studyItems],
  );

  const badges = useMemo(
    () =>
      getAchievementBadges({
        level,
        xp,
        streak: currentStreak,
        completedTasks,
        completedGoals,
        focusSessionsCount: focusSessions.length,
        masteredMistakesCount: masteredMistakes,
        futurePlansCount: futurePlans.length,
        circleCount: circles.length,
        careEntriesCount: careEntries.length,
        journalCount: journalEntries.length,
        quizCount: quizAttempts.length,
      }),
    [
      level,
      xp,
      currentStreak,
      completedTasks,
      completedGoals,
      focusSessions.length,
      masteredMistakes,
      futurePlans.length,
      circles.length,
      careEntries.length,
      journalEntries.length,
      quizAttempts.length,
    ],
  );

  const unlockedCount = useMemo(() => badges.filter((b) => b.unlocked).length, [badges]);
  const areaBreakdown = useMemo(() => computeXpAreaBreakdown(events), [events]);

  const challenges = [
    {
      title: t("lvl.ch1.t"),
      desc: t("lvl.ch1.d"),
      done: focusSessions.length > 0,
      to: "/app/tasks" as const,
      xp: 30,
    },
    {
      title: t("lvl.ch2.t"),
      desc: t("lvl.ch2.d"),
      done: masteredMistakes > 0,
      to: "/app/study" as const,
      xp: 20,
    },
    {
      title: t("lvl.ch3.t"),
      desc: t("lvl.ch3.d"),
      done: completedGoals > 0,
      to: "/app" as const,
      xp: 40,
    },
    {
      title: t("lvl.ch4.t"),
      desc: t("lvl.ch4.d"),
      done: journalEntries.length >= 3,
      to: "/app" as const,
      xp: 35,
    },
    {
      title: t("lvl.ch5.t"),
      desc: t("lvl.ch5.d"),
      done: quizAttempts.length >= 2,
      to: "/app/study" as const,
      xp: 45,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title={t("lvl.title")} subtitle={t("lvl.sub")} />
        <div className="flex flex-wrap items-center gap-1.5">
          <FeatureGuideTrigger
            featureId={
              (
                {
                  overview: "growth-map",
                  adventure: "adventure-world",
                  qotd: "levelup-qotd",
                  portfolio: "student-portfolio",
                  thinking: "thinking-studio",
                  coding: "coding-studio",
                } satisfies Record<LevelUpTab, FeatureGuideId>
              )[subTab]
            }
          />
          {(
            [
              { id: "overview", label: "Overview & Badges", icon: Trophy },
              { id: "thinking", label: "Thinking & Debate (#19–24)", icon: Award },
              { id: "coding", label: "Coding & Robotics (#25–29)", icon: Sparkles },
              { id: "adventure", label: "BTC Adventure World", icon: Compass },
              { id: "qotd", label: "QOTD & Challenges", icon: HelpCircle },
              { id: "portfolio", label: "Student Portfolio", icon: UserCheck },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                type="button"
                size="sm"
                variant={subTab === item.id ? "glow" : "outline"}
                onClick={() => setSubTab(item.id)}
                className="h-8 text-xs"
              >
                <Icon className="size-3.5" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {subTab === "adventure" && <AdventureWorldGame />}

      {subTab === "portfolio" && <StudentPortfolioPanel />}

      {subTab === "thinking" && <ThinkingAnalysisStudio />}

      {subTab === "coding" && <CodingTechStudio />}

      {subTab === "qotd" && (
        <div className="grid gap-5 lg:grid-cols-2 text-xs">
          {/* #16 Question of the Day */}
          <div className="surface-card space-y-3 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Sparkles className="size-4" />
                <span>Question of the Day · {todayKey}</span>
              </div>
              <span className="font-mono text-muted-foreground">{qotd.domain}</span>
            </div>
            <h2 className="font-display text-base font-bold text-foreground">{qotd.question}</h2>
            <div className="space-y-2">
              {qotd.options.map((opt, idx) => {
                const answered =
                  qotdChoice !== null || ecoState.qotdAnsweredDates.includes(todayKey);
                const picked = qotdChoice === idx;
                const correct = idx === qotd.correctIndex;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setQotdChoice(idx);
                      updateEco((prev) => ({
                        ...prev,
                        qotdAnsweredDates: prev.qotdAnsweredDates.includes(todayKey)
                          ? prev.qotdAnsweredDates
                          : [...prev.qotdAnsweredDates, todayKey],
                        qotdCorrectDates:
                          idx === qotd.correctIndex && !prev.qotdCorrectDates.includes(todayKey)
                            ? [...prev.qotdCorrectDates, todayKey]
                            : prev.qotdCorrectDates,
                      }));
                      if (idx === qotd.correctIndex) toast.success("Daily brain-check nailed!");
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-start ${
                      answered
                        ? correct
                          ? "border-success bg-success/15 font-semibold"
                          : picked
                            ? "border-destructive bg-destructive/15"
                            : "border-border bg-surface-2 opacity-75"
                        : "border-border bg-surface-2 hover:border-primary/40"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {(qotdChoice !== null || ecoState.qotdAnsweredDates.includes(todayKey)) && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-foreground">
                {qotd.explanation}
              </div>
            )}
          </div>

          {/* #17 Structured Knowledge Challenges */}
          <div className="surface-card space-y-4 p-5">
            <h2 className="font-display text-base font-bold text-foreground">
              Interdisciplinary Knowledge Challenges
            </h2>
            {KNOWLEDGE_CHALLENGES.map((kc) => {
              const done = ecoState.completedKnowledgeChallenges.includes(kc.id);
              const chosen = challengeAnswers[kc.id];
              return (
                <div
                  key={kc.id}
                  className="space-y-2 rounded-xl border border-border bg-surface-2 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">{kc.category}</span>
                    <span className="font-mono text-xp">
                      {done ? "Completed" : `+${kc.rewardXp} Challenge Recognition`}
                    </span>
                  </div>
                  <div className="font-display text-sm font-bold text-foreground">{kc.title}</div>
                  <ul className="list-disc ps-4 text-muted-foreground space-y-0.5">
                    {kc.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <div className="font-semibold text-foreground pt-1">{kc.quizPrompt}</div>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {kc.options.map((opt, idx) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setChallengeAnswers((prev) => ({ ...prev, [kc.id]: idx }));
                          if (idx === kc.correctIndex) {
                            updateEco((prev) => ({
                              ...prev,
                              completedKnowledgeChallenges:
                                prev.completedKnowledgeChallenges.includes(kc.id)
                                  ? prev.completedKnowledgeChallenges
                                  : [...prev.completedKnowledgeChallenges, kc.id],
                            }));
                            toast.success(`Challenge mastered: ${kc.title}!`);
                          }
                        }}
                        className={`rounded-md border px-2.5 py-1.5 text-start ${
                          typeof chosen === "number"
                            ? idx === kc.correctIndex
                              ? "border-success bg-success/15 font-semibold"
                              : chosen === idx
                                ? "border-destructive bg-destructive/15"
                                : "border-border bg-surface opacity-75"
                            : "border-border bg-surface hover:border-primary/40"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* #43 Challenge of the Week */}
          <div
            className="surface-card space-y-3 p-5 lg:col-span-2"
            data-testid="challenge-of-the-week"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-bold uppercase text-primary">
                  43. Challenge of the Week · {weeklyChallenge.weekKey} · {weeklyChallenge.theme}
                </div>
                <h2 className="font-display text-base font-bold text-foreground">
                  {weeklyChallenge.title}
                </h2>
              </div>
              {ecoState.weeklyChallengeLogs[weeklyChallenge.weekKey] && (
                <span className="rounded bg-success/15 px-2.5 py-1 font-mono text-[11px] font-bold text-success">
                  Submitted for {weeklyChallenge.weekKey}
                </span>
              )}
            </div>
            <p className="text-foreground/90 leading-relaxed">{weeklyChallenge.prompt}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {weeklyChallenge.options.map((opt, idx) => {
                const picked =
                  weeklyChoice ??
                  ecoState.weeklyChallengeLogs[weeklyChallenge.weekKey]?.answerIndex ??
                  null;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setWeeklyChoice(idx)}
                    className={`rounded-lg border px-3 py-2 text-start ${
                      picked === idx
                        ? "border-primary bg-primary/15 font-semibold text-foreground"
                        : "border-border bg-surface-2 hover:border-primary/40"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <Textarea
              rows={2}
              value={weeklyReflection}
              onChange={(e) => setWeeklyReflection(e.target.value)}
              placeholder={weeklyChallenge.reflectionPrompt}
              className="text-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="glow"
              onClick={() => {
                const choice =
                  weeklyChoice ??
                  ecoState.weeklyChallengeLogs[weeklyChallenge.weekKey]?.answerIndex;
                if (typeof choice !== "number") {
                  toast.error("Select an answer option first.");
                  return;
                }
                const correct = choice === weeklyChallenge.correctIndex;
                updateEco((prev) => ({
                  ...prev,
                  weeklyChallengeLogs: {
                    ...prev.weeklyChallengeLogs,
                    [weeklyChallenge.weekKey]: {
                      weekKey: weeklyChallenge.weekKey,
                      answerIndex: choice,
                      correct,
                      reflection: weeklyReflection.trim(),
                      submittedAt: new Date().toISOString(),
                    },
                  },
                }));
                toast.success(
                  correct
                    ? "Challenge of the Week verified accurate!"
                    : "Weekly attempt saved—review the quantitative steps and retry anytime.",
                );
              }}
            >
              Submit Weekly Challenge
            </Button>
          </div>
        </div>
      )}

      {subTab === "overview" && (
        <>
          {/* Level & Streak Hero */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="surface-card space-y-3 p-5 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="size-5 text-primary" />
                  <span className="font-display text-lg font-bold text-foreground">
                    {tier.badge} {t(tier.nameKey)} · {t("common.level")} {formatNumber(level, lang)}
                  </span>
                </div>
                <span className="font-display text-sm font-bold tabular-nums text-xp">
                  {formatNumber(xp, lang)} {t("common.xp")}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-sm bg-muted">
                <div
                  className="h-full bg-gradient-primary transition-all duration-500"
                  style={{ width: `${Math.min(progress.pct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs tabular-nums text-muted-foreground">
                <span>{formatNumber(progress.pct, lang)}%</span>
                <span>
                  {formatNumber(progress.needed - progress.current, lang)} {t("common.xp")}{" "}
                  {t("dash.welcome.toNext")} {formatNumber(level + 1, lang)}
                </span>
              </div>
            </div>

            <div className="surface-card flex items-center justify-between p-5">
              <div className="space-y-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("dash.stat.streak")}
                </div>
                <div className="font-display text-2xl font-extrabold tabular-nums text-foreground">
                  {formatNumber(currentStreak, lang)} {t("common.days")}
                </div>
                <div className="text-xs tabular-nums text-muted-foreground">
                  Best: {formatNumber(longestStreak, lang)} {t("common.days")}
                </div>
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-xp/15 text-xp">
                <Flame className="size-6" />
              </div>
            </div>
          </div>

          {/* #44 Verified Achievement Evidence Dashboard */}
          {(() => {
            const ev = computeAchievementEvidence(ecoState);
            return (
              <div className="surface-card space-y-3 p-5" data-testid="achievement-evidence-panel">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Award className="size-5 text-primary" />
                    <div>
                      <h2 className="font-display text-base font-bold text-foreground">
                        44. Verified Achievement Evidence & Milestones
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Concrete proof of student mastery across science simulations, coding
                        challenges, creative projects, and civic debates.
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-primary">
                    {ev.totalVerifiedArtifacts} Verified Artifacts
                  </span>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {ev.milestones.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-xl border p-3 space-y-1.5 text-xs transition-colors ${
                        m.unlocked
                          ? "border-emerald-500/40 bg-emerald-500/10 text-foreground"
                          : "border-border bg-surface-2 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{m.title}</span>
                        {m.unlocked ? (
                          <CheckCircle2 className="size-4 text-emerald-400" />
                        ) : (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {m.current}/{m.target}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] leading-tight text-muted-foreground">
                        {m.evidenceLabel}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Domain XP Allocation Breakdown */}
          <div className="surface-card space-y-3 p-5">
            <h2 className="font-display text-base font-bold text-foreground">
              {t("lvl.domainXpTitle")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {areaBreakdown.map((item) => {
                const cfg = AREA_CONFIG[item.area];
                return (
                  <div
                    key={item.area}
                    className="space-y-1.5 rounded-lg border border-border bg-surface-2 p-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold" style={{ color: cfg.accentColor }}>
                        {t(cfg.labelKey)}
                      </span>
                      <span className="font-mono tabular-nums text-foreground">
                        {formatNumber(item.xp, lang)} {t("common.xp")} (
                        {formatNumber(item.pct, lang)}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-sm bg-background">
                      <div
                        className="h-full transition-all"
                        style={{ width: `${item.pct}%`, backgroundColor: cfg.accentColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actionable Growth Challenges */}
          <div className="surface-card space-y-4 p-5">
            <h2 className="font-display text-base font-bold text-foreground">
              {t("lvl.challenges")}
            </h2>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
              {challenges.map((ch) => (
                <div
                  key={ch.title}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-surface-2 p-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tabular-nums text-xp">
                        +{ch.xp} {t("common.xp")}
                      </span>
                      {ch.done && <CheckCircle2 className="size-4 text-success" />}
                    </div>
                    <h3 className="font-display text-sm font-bold text-foreground">{ch.title}</h3>
                    <p className="text-xs text-muted-foreground">{ch.desc}</p>
                  </div>
                  <Link
                    to={ch.to}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>{t("lvl.toModule")}</span>
                    <ArrowRight className="size-3.5 rtl-flip" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* 12 Achievement Badges Showcase */}
          <div className="surface-card space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="size-4.5 text-primary" />
                <h2 className="font-display text-base font-bold text-foreground">
                  {t("lvl.badgesTitle")}
                </h2>
              </div>
              <span className="text-xs font-semibold tabular-nums text-primary">
                {formatNumber(unlockedCount, lang)} / {formatNumber(badges.length, lang)}{" "}
                {t("lvl.badgesCount")}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {badges.map((b) => {
                const pct = Math.min(100, Math.round((b.progressCurrent / b.progressTarget) * 100));
                return (
                  <div
                    key={b.id}
                    className={`space-y-2 rounded-xl border p-3.5 text-xs ${
                      b.unlocked
                        ? "border-primary/40 bg-primary/5 text-foreground"
                        : "border-border bg-surface-2 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-bold text-foreground">
                        {t(b.titleKey)}
                      </span>
                      {b.unlocked && <CheckCircle2 className="size-4 shrink-0 text-success" />}
                    </div>
                    <p className="text-[0.7rem] leading-relaxed">
                      {t(b.unlocked ? b.unlockedDescKey : b.lockedDescKey)}
                    </p>
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[0.65rem] tabular-nums">
                        <span>{t(b.categoryKey)}</span>
                        <span>
                          {formatNumber(b.progressCurrent, lang)}/
                          {formatNumber(b.progressTarget, lang)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-sm bg-background">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <MilestonesGrid />

          {/* Verified XP Growth History Timeline with Filters */}
          <GrowthHistory />
        </>
      )}
    </div>
  );
}
