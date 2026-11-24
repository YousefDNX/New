import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  GraduationCap,
  HeartHandshake,
  HelpCircle,
  MessageSquare,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/Page";
import { DojoCodeGate } from "@/components/martial-arts/DojoCodeGate";
import { DojoMentorChat } from "@/components/martial-arts/DojoMentorChat";
import { MartialArtsExplorer } from "@/components/martial-arts/MartialArtsExplorer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ANTI_BULLYING_LESSONS,
  BULLYING_SCENARIOS,
  CHARACTER_DOJO_PILLARS,
  DOJO_KNOWLEDGE_QUIZ,
  DOJO_LEARNING_PATHS,
  DOJO_MOTTOS,
  HUMANITY_CHALLENGES,
  SAFE_TRAINING_TOPICS,
  SAFEGUARDING_INSTRUCTOR_CHECKLIST,
} from "@/data/martial-arts";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

export type DojoTab =
  | "code"
  | "explorer"
  | "academy"
  | "character"
  | "bullying"
  | "safety"
  | "quiz"
  | "mentor"
  | "humanity";

export function MartialArtsDojoWorkspace() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: eco, update: updateEco } = useStudentEcosystem();
  const dojo = eco.martialArtsDojo;

  const [activeTab, setActiveTab] = useState<DojoTab>("code");
  const [selectedPathId, setSelectedPathId] = useState<string>("path_a");
  const charChoices = dojo.characterPillars ?? {};
  const [recentlyProgressedId, setRecentlyProgressedId] = useState<string | null>(null);
  const [scenarioChoices, setScenarioChoices] = useState<Record<string, string>>({});

  // Knowledge Center quiz state
  const [quizLevelFilter, setQuizLevelFilter] = useState<
    "all" | "foundation" | "intermediate" | "applied"
  >("all");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const [goalDraft, setGoalDraft] = useState(dojo.personalGoal);

  const handleAcknowledgeCode = () => {
    const now = new Date().toISOString();
    updateEco((prev) => ({
      ...prev,
      martialArtsDojo: {
        ...prev.martialArtsDojo,
        codeAcknowledged: true,
        codeAcknowledgedAt: prev.martialArtsDojo.codeAcknowledgedAt ?? now,
      },
    }));
    toast.success(
      isAr
        ? "تم حفظ إقرارك بميثاق فنان القتال الخلوق."
        : "Good Martial Artist Code acknowledgment saved.",
    );
  };

  const toggleTopicCompleted = (pathId: string, topicId: string, totalTopicsInPath: number) => {
    updateEco((prev) => {
      const existing = prev.martialArtsDojo.completedTopics;
      const nextTopics = existing.includes(topicId)
        ? existing.filter((id) => id !== topicId)
        : [...existing, topicId];

      const pathObj = DOJO_LEARNING_PATHS.find((p) => p.id === pathId);
      const pathTopicIds = pathObj?.topics.map((tp) => tp.id) ?? [];
      const allPathDone =
        totalTopicsInPath > 0 && pathTopicIds.every((id) => nextTopics.includes(id));

      const nextPaths = allPathDone
        ? Array.from(new Set([...prev.martialArtsDojo.completedPaths, pathId]))
        : prev.martialArtsDojo.completedPaths.filter((id) => id !== pathId);

      return {
        ...prev,
        martialArtsDojo: {
          ...prev.martialArtsDojo,
          completedTopics: nextTopics,
          completedPaths: nextPaths,
        },
      };
    });
  };

  const toggleSaveDiscipline = (disciplineId: string) => {
    updateEco((prev) => {
      const cur = prev.martialArtsDojo.savedDisciplineIds;
      const next = cur.includes(disciplineId)
        ? cur.filter((id) => id !== disciplineId)
        : [...cur, disciplineId];
      return {
        ...prev,
        martialArtsDojo: { ...prev.martialArtsDojo, savedDisciplineIds: next },
      };
    });
  };

  const handleChooseBullyingOption = (
    scenarioId: string,
    optionId: string,
    isSafeWise: boolean,
  ) => {
    setScenarioChoices((prev) => ({ ...prev, [scenarioId]: optionId }));
    if (isSafeWise) {
      updateEco((prev) => ({
        ...prev,
        martialArtsDojo: {
          ...prev.martialArtsDojo,
          completedScenarios: Array.from(
            new Set([...prev.martialArtsDojo.completedScenarios, scenarioId]),
          ),
        },
      }));
    }
  };

  const toggleHumanityChallenge = (challengeId: string) => {
    updateEco((prev) => {
      const cur = prev.martialArtsDojo.humanityChallengesDone;
      const next = cur.includes(challengeId)
        ? cur.filter((id) => id !== challengeId)
        : [...cur, challengeId];
      return {
        ...prev,
        martialArtsDojo: { ...prev.martialArtsDojo, humanityChallengesDone: next },
      };
    });
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    updateEco((prev) => ({
      ...prev,
      martialArtsDojo: { ...prev.martialArtsDojo, personalGoal: goalDraft.trim().slice(0, 200) },
    }));
    toast.success(
      isAr ? "تم حفظ هدفك الشخصي في الدوجو." : "Saved your personal Dojo learning goal.",
    );
  };

  const filteredQuizQuestions = useMemo(
    () =>
      DOJO_KNOWLEDGE_QUIZ.filter((q) => quizLevelFilter === "all" || q.level === quizLevelFilter),
    [quizLevelFilter],
  );

  const quizScore = useMemo(() => {
    const total = filteredQuizQuestions.length;
    const correct = filteredQuizQuestions.filter(
      (q) => quizAnswers[q.id] === q.correctIndex,
    ).length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, pct };
  }, [filteredQuizQuestions, quizAnswers]);

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    updateEco((prev) => ({
      ...prev,
      martialArtsDojo: {
        ...prev.martialArtsDojo,
        quizAttempts: [
          {
            id: `dqa_${Date.now()}`,
            quizId: `dojo_${quizLevelFilter}`,
            scorePct: quizScore.pct,
            correctCount: quizScore.correct,
            totalCount: quizScore.total,
            createdAt: new Date().toISOString(),
          },
          ...prev.martialArtsDojo.quizAttempts.slice(0, 19),
        ],
      },
    }));
  };

  const activePath =
    DOJO_LEARNING_PATHS.find((p) => p.id === selectedPathId) ?? DOJO_LEARNING_PATHS[0]!;

  const tabs: Array<{ id: DojoTab; en: string; ar: string; Icon: typeof ShieldCheck }> = [
    { id: "code", en: "Good Artist Code", ar: "ميثاق الأخلاق", Icon: ShieldCheck },
    { id: "explorer", en: "14+ Arts Explorer", ar: "مستكشف الفنون", Icon: Compass },
    { id: "academy", en: "Academy Paths (A–E)", ar: "الأكاديمية (أ–هـ)", Icon: GraduationCap },
    { id: "character", en: "Character Dojo", ar: "دوجو الأخلاق", Icon: UserCheck },
    { id: "bullying", en: "Anti-Bullying", ar: "مناهضة التنمر", Icon: ShieldAlert },
    { id: "safety", en: "Safe Training (13)", ar: "السلامة (١٣)", Icon: AlertTriangle },
    { id: "quiz", en: "Knowledge Center", ar: "مركز الاختبارات", Icon: HelpCircle },
    { id: "mentor", en: "Dojo Mentor AI", ar: "موجّه الدوجو", Icon: MessageSquare },
    { id: "humanity", en: "For Humanity & Parents", ar: "للإنسانية والأهل", Icon: HeartHandshake },
  ];

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"} data-testid="martial-arts-dojo-workspace">
      <PageHeader
        title={isAr ? "NEXORA — فنون القتال للخير" : "NEXORA — Martial Arts for Good"}
        subtitle={isAr ? DOJO_MOTTOS.short.ar : DOJO_MOTTOS.short.en}
        actions={
          <span
            data-testid="dojo-status-pill"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground"
          >
            <BookOpen className="size-3.5 text-primary" />
            {isAr
              ? `${dojo.completedTopics.length} درس مكتمل`
              : `${dojo.completedTopics.length} topics completed`}
          </span>
        }
      />

      {/* Core Ethical Motto Banner */}
      <div
        className="surface-card border-primary/30 bg-primary/5 p-5"
        data-testid="dojo-motto-banner"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="space-y-1">
            <p className="font-display text-sm font-bold text-foreground sm:text-base">
              {isAr ? DOJO_MOTTOS.primary.ar : DOJO_MOTTOS.primary.en}
            </p>
            <p className="text-xs text-muted-foreground">
              {isAr ? DOJO_MOTTOS.banner.ar : DOJO_MOTTOS.banner.en}
            </p>
          </div>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <nav
        aria-label={isAr ? "أقسام فنون القتال للخير" : "Martial Arts Dojo Sections"}
        className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-surface p-1.5"
      >
        {tabs.map(({ id, en, ar, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              data-testid={`dojo-tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                active
                  ? "bg-primary/15 text-primary ring-1 ring-primary/40"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5 shrink-0" />
              <span>{isAr ? ar : en}</span>
            </button>
          );
        })}
      </nav>

      {/* 1. The Good Martial Artist Code */}
      {activeTab === "code" && (
        <DojoCodeGate
          isAr={isAr}
          acknowledged={dojo.codeAcknowledged}
          acknowledgedAt={dojo.codeAcknowledgedAt}
          onAcknowledge={handleAcknowledgeCode}
        />
      )}

      {/* 2. Martial Arts Explorer + Non-Aggressive Comparison */}
      {activeTab === "explorer" && (
        <MartialArtsExplorer
          isAr={isAr}
          savedDisciplineIds={dojo.savedDisciplineIds}
          onToggleSaveDiscipline={toggleSaveDiscipline}
        />
      )}

      {/* 3. Learning Academy (Paths A–E) */}
      {activeTab === "academy" && (
        <section className="space-y-5" data-testid="dojo-academy-section">
          <div className="flex flex-wrap gap-2">
            {DOJO_LEARNING_PATHS.map((path) => {
              const active = path.id === activePath.id;
              const doneCount = path.topics.filter((tp) =>
                dojo.completedTopics.includes(tp.id),
              ).length;
              return (
                <button
                  key={path.id}
                  type="button"
                  data-testid={`dojo-path-btn-${path.id}`}
                  onClick={() => setSelectedPathId(path.id)}
                  className={`min-h-[44px] rounded-xl border px-3.5 py-2 text-start text-xs transition-colors ${
                    active
                      ? "border-primary bg-primary/15 text-primary font-bold"
                      : "border-border bg-card text-foreground hover:border-primary/40"
                  }`}
                >
                  <div>{isAr ? path.title.ar : path.title.en}</div>
                  <div className="text-[11px] text-muted-foreground tabular-nums">
                    {doneCount} / {path.topics.length}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="surface-card space-y-4 p-5">
            <div className="border-b border-border/70 pb-3">
              <h2 className="font-display text-lg font-bold text-foreground">
                {isAr ? activePath.title.ar : activePath.title.en}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {isAr ? activePath.subtitle.ar : activePath.subtitle.en}
              </p>
              {activePath.safetyNotice && (
                <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-amber-500/35 bg-amber-500/10 p-3 text-xs text-foreground">
                  <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  <span>{isAr ? activePath.safetyNotice.ar : activePath.safetyNotice.en}</span>
                </div>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {activePath.topics.map((topic) => {
                const done = dojo.completedTopics.includes(topic.id);
                return (
                  <div
                    key={topic.id}
                    className={`flex flex-col justify-between rounded-xl border p-4 space-y-2.5 ${
                      done
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-border bg-surface-2/60"
                    }`}
                  >
                    <div className="space-y-1">
                      <h3 className="font-display text-sm font-bold text-foreground">
                        {isAr ? topic.title.ar : topic.title.en}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {isAr ? topic.summary.ar : topic.summary.en}
                      </p>
                      <p className="text-[11px] font-medium text-primary">
                        {isAr ? "الخلاصة:" : "Takeaway:"}{" "}
                        {isAr ? topic.keyTakeaway.ar : topic.keyTakeaway.en}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={done ? "glow" : "outline"}
                      onClick={() =>
                        toggleTopicCompleted(activePath.id, topic.id, activePath.topics.length)
                      }
                      className="min-h-[38px] w-fit text-xs"
                    >
                      <CheckCircle2 className="size-3.5 me-1" />
                      {done
                        ? isAr
                          ? "تم الإكمال"
                          : "Completed"
                        : isAr
                          ? "تحديد كمكتمل"
                          : "Mark Completed"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. The Character Dojo */}
      {activeTab === "character" &&
        (() => {
          const totalCharPillars = CHARACTER_DOJO_PILLARS.length;
          const answeredWiseCount = CHARACTER_DOJO_PILLARS.filter((p) => {
            const idx = charChoices[p.id];
            return typeof idx === "number" && p.options[idx]?.isWise;
          }).length;
          const charProgressPct = Math.round((answeredWiseCount / totalCharPillars) * 100);

          return (
            <section className="space-y-4" data-testid="dojo-character-section">
              <div className="surface-card p-4 text-xs text-muted-foreground">
                {isAr
                  ? "ملاحظة: يركّز دوجو الأخلاق على التأمل التربوي والتطبيق اليومي في Respect و Humility و Self-Control و Responsibility و Compassion دون منح شهادات أخلاقية."
                  : "Character Dojo supports personal reflection on Respect, Humility, Self-Control, Responsibility, and Compassion—study progress here does not represent a moral certification."}
              </div>

              {/* Overall Character Growth Animated Progress Bar */}
              <div
                className="surface-card p-5 space-y-3 border-emerald-500/30 bg-gradient-to-br from-surface to-emerald-500/[0.04]"
                data-testid="dojo-character-overall-progress"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-emerald-500 shrink-0" />
                    <h3 className="font-display text-sm font-bold text-foreground">
                      {isAr
                        ? "مسار نمو الشخصية والتأمل العملي"
                        : "Character Growth & Moral Wisdom Progress"}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold tabular-nums">
                    <span className="text-muted-foreground">
                      {isAr
                        ? `${answeredWiseCount} من ${totalCharPillars} ركائز مكتملة`
                        : `${answeredWiseCount} of ${totalCharPillars} Pillars Reflected`}
                    </span>
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                      {charProgressPct}%
                    </span>
                  </div>
                </div>

                <div
                  role="progressbar"
                  aria-label="Character growth progress"
                  aria-valuenow={charProgressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2 border border-border/60"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-700 ease-out shadow-xs"
                    style={{ width: `${charProgressPct}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span>
                    {charProgressPct === 100
                      ? isAr
                        ? "✦ اكتمل إتقان ركائز الشخصية الخمس بنجاح!"
                        : "✦ Outstanding! All 5 Character Pillars Reflected with Wisdom."
                      : isAr
                        ? "تأمل في كل موقف واختر التصرف الحكيم لتحقيق النمو الشخصي."
                        : "Reflect on each scenario and apply wise action to cultivate real character."}
                  </span>
                  <span className="font-medium text-primary">
                    +{answeredWiseCount * 20} {isAr ? "نقطة حكمة" : "Wisdom XP"}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {CHARACTER_DOJO_PILLARS.map((pillar) => {
                  const chosenIdx = charChoices[pillar.id];
                  const chosenOpt =
                    typeof chosenIdx === "number" ? pillar.options[chosenIdx] : undefined;
                  const isWise = chosenOpt?.isWise ?? false;
                  const isChosen = typeof chosenIdx === "number";
                  const cardPct = isWise ? 100 : isChosen ? 50 : 0;

                  return (
                    <div
                      key={pillar.id}
                      data-testid={`character-card-${pillar.id}`}
                      className={`surface-card space-y-3 p-5 transition-all duration-500 ${
                        recentlyProgressedId === pillar.id
                          ? "ring-2 ring-emerald-500/60 shadow-md scale-[1.01]"
                          : ""
                      } ${
                        isWise
                          ? "border-emerald-500/60 bg-emerald-500/[0.04] ring-1 ring-emerald-500/20 shadow-xs"
                          : isChosen
                            ? "border-amber-500/50 bg-amber-500/[0.03]"
                            : "border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-display text-base font-bold text-foreground">
                            {isAr ? pillar.title.ar : pillar.title.en}
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {isAr ? pillar.definition.ar : pillar.definition.en}
                          </p>
                        </div>

                        {/* Animated Progress Badge & Visual Feedback */}
                        <div className="shrink-0 text-end" data-testid="character-growth-progress">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-all duration-500 ${
                              recentlyProgressedId === pillar.id ? "animate-bounce" : ""
                            } ${
                              isWise
                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/40"
                                : isChosen
                                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                  : "bg-surface-2 text-muted-foreground"
                            }`}
                          >
                            {isWise ? (
                              <>
                                <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                                <span>{isAr ? "مُتقن · ١٠٠٪" : "Mastered · 100%"}</span>
                              </>
                            ) : isChosen ? (
                              <>
                                <Clock className="size-3 text-amber-500 shrink-0" />
                                <span>{isAr ? "قيد التأمل · ٥٠٪" : "In Progress · 50%"}</span>
                              </>
                            ) : (
                              <span>{isAr ? "في الانتظار · ٠٪" : "Pending · 0%"}</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Animated Progress Indicator on Card */}
                      <div className="space-y-1">
                        <div
                          role="progressbar"
                          aria-label={isAr ? pillar.title.ar : pillar.title.en}
                          aria-valuenow={cardPct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          className="h-2 w-full overflow-hidden rounded-full bg-surface-2 border border-border/50"
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                              recentlyProgressedId === pillar.id ? "animate-pulse" : ""
                            } ${
                              isWise
                                ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-xs"
                                : isChosen
                                  ? "bg-amber-500"
                                  : "bg-transparent"
                            }`}
                            style={{ width: `${cardPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="rounded-lg border border-border bg-surface-2 p-3 text-xs">
                        <strong className="text-foreground">
                          {isAr ? "تأمل شخصي:" : "Reflection Prompt:"}
                        </strong>{" "}
                        <span className="text-muted-foreground">
                          {isAr ? pillar.reflectionPrompt.ar : pillar.reflectionPrompt.en}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="font-semibold text-foreground">
                          {isAr ? pillar.scenarioQuestion.ar : pillar.scenarioQuestion.en}
                        </div>
                        {pillar.options.map((opt, idx) => (
                          <button
                            key={opt.en}
                            type="button"
                            onClick={() => {
                              updateEco((prev) => ({
                                ...prev,
                                martialArtsDojo: {
                                  ...prev.martialArtsDojo,
                                  characterPillars: {
                                    ...(prev.martialArtsDojo.characterPillars ?? {}),
                                    [pillar.id]: idx,
                                  },
                                },
                              }));
                              setRecentlyProgressedId(pillar.id);
                              window.setTimeout(() => {
                                setRecentlyProgressedId((cur) => (cur === pillar.id ? null : cur));
                              }, 900);
                              if (opt.isWise) {
                                toast.success(
                                  isAr
                                    ? `✦ تم تطبيق حكمة ${pillar.title.ar} بنجاح (+٢٠ نقطة)!`
                                    : `✦ ${pillar.title.en} wisdom applied (+20 XP)!`,
                                );
                              }
                            }}
                            className={`min-h-[44px] w-full rounded-lg border px-3 py-2 text-start transition-all duration-200 ${
                              chosenIdx === idx
                                ? opt.isWise
                                  ? "border-emerald-500 bg-emerald-500/15 font-semibold text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500/30"
                                  : "border-amber-500 bg-amber-500/10 font-semibold text-amber-950 dark:text-amber-100"
                                : "border-border bg-surface-2 hover:border-primary/40 text-foreground"
                            }`}
                          >
                            {isAr ? opt.ar : opt.en}
                          </button>
                        ))}
                        {chosenOpt && (
                          <div
                            className={`rounded-lg border p-2.5 text-[11px] font-medium transition-all duration-300 ${
                              chosenOpt.isWise
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                            }`}
                          >
                            {isAr ? chosenOpt.feedbackAr : chosenOpt.feedbackEn}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })()}

      {/* 5. Stand Against Bullying (10 Lessons + 6 Realistic Scenarios) */}
      {activeTab === "bullying" && (
        <section className="space-y-6" data-testid="dojo-bullying-section">
          <div className="surface-card space-y-3 p-5">
            <h2 className="font-display text-lg font-bold text-foreground">
              {isAr ? "مناهضة التنمر — ١٠ دروس أساسية" : "Stand Against Bullying — 10 Core Lessons"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {ANTI_BULLYING_LESSONS.map((lesson) => (
                <div
                  key={lesson.id}
                  className="rounded-xl border border-border bg-surface-2 p-3.5 text-xs"
                >
                  <div className="font-bold text-foreground">
                    {isAr ? lesson.title.ar : lesson.title.en}
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {isAr ? lesson.point.ar : lesson.point.en}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-base font-bold text-foreground">
              {isAr
                ? "٦ مواقف واقعية تفاعلية (دون عنف)"
                : "6 Realistic Interactive Anti-Bullying Scenarios"}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {BULLYING_SCENARIOS.map((sc) => {
                const pickedId = scenarioChoices[sc.id];
                const pickedOpt = sc.options.find((o) => o.id === pickedId);
                return (
                  <div
                    key={sc.id}
                    data-testid={`bullying-scenario-${sc.id}`}
                    className="surface-card space-y-3 p-5 text-xs"
                  >
                    <h4 className="font-display text-sm font-bold text-foreground">
                      {isAr ? sc.title.ar : sc.title.en}
                    </h4>
                    <p className="text-muted-foreground">
                      {isAr ? sc.situation.ar : sc.situation.en}
                    </p>
                    <div className="space-y-2">
                      {sc.options.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleChooseBullyingOption(sc.id, opt.id, opt.isSafeWise)}
                          className={`min-h-[44px] w-full rounded-lg border px-3 py-2 text-start transition-colors ${
                            pickedId === opt.id
                              ? opt.isSafeWise
                                ? "border-emerald-500 bg-emerald-500/15 font-semibold"
                                : "border-amber-500 bg-amber-500/10"
                              : "border-border bg-surface-2 hover:border-primary/40"
                          }`}
                        >
                          {isAr ? opt.label.ar : opt.label.en}
                        </button>
                      ))}
                    </div>
                    {pickedOpt && (
                      <div className="rounded-lg border border-border bg-surface-2 p-2.5 text-[11px] font-medium text-primary">
                        {isAr ? pickedOpt.explanation.ar : pickedOpt.explanation.en}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 6. Safe Training Education Center (13 Topics) */}
      {activeTab === "safety" && (
        <section className="space-y-4" data-testid="dojo-safety-section">
          <div className="surface-card space-y-2 p-5">
            <h2 className="font-display text-lg font-bold text-foreground">
              {isAr
                ? "مركز التثقيف للتدريب الآمن (١٣ محوراً)"
                : "Safe Training Education Center (13 Topics)"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "توجيهات وقائية عامة تحفظ المفاصل والرأس والصحة النفسية — لأي ألم أو إصابة راجع الطبيب فوراً."
                : "General safety principles protecting joints, head health, nutrition, and respectful dojo culture—always consult licensed clinicians for any injury."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SAFE_TRAINING_TOPICS.map((topic) => (
              <div key={topic.id} className="surface-card space-y-1.5 p-4 text-xs">
                <h3 className="font-display text-sm font-bold text-foreground">
                  {isAr ? topic.title.ar : topic.title.en}
                </h3>
                <p className="text-muted-foreground">
                  {isAr ? topic.guidance.ar : topic.guidance.en}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Interactive Knowledge Center */}
      {activeTab === "quiz" && (
        <section className="surface-card space-y-5 p-5" data-testid="dojo-quiz-section">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                {isAr ? "مركز المعرفة والاختبارات" : "Interactive Knowledge Center"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "اختبارات متعددة المستويات في التاريخ والأخلاق والوقاية والسلامة."
                  : "Multi-level quizzes (MC, True/False, Scenarios) with verified explanations."}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["all", "foundation", "intermediate", "applied"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setQuizLevelFilter(lvl);
                    setQuizSubmitted(false);
                  }}
                  className={`min-h-[36px] rounded-lg border px-3 text-xs font-semibold capitalize ${
                    quizLevelFilter === lvl
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuizQuestions.map((q, qIdx) => {
              const picked = quizAnswers[q.id];
              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2.5 text-xs"
                >
                  <div className="font-bold text-foreground">
                    {qIdx + 1}. {isAr ? q.prompt.ar : q.prompt.en}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {q.options.map((opt, idx) => {
                      const selected = picked === idx;
                      const showResult = quizSubmitted;
                      const isRight = idx === q.correctIndex;
                      return (
                        <button
                          key={opt.en}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                          className={`min-h-[44px] rounded-lg border px-3 py-2 text-start transition-colors ${
                            showResult && isRight
                              ? "border-emerald-500 bg-emerald-500/15 font-semibold"
                              : showResult && selected && !isRight
                                ? "border-destructive bg-destructive/10"
                                : selected
                                  ? "border-primary bg-primary/15 font-semibold"
                                  : "border-border bg-card hover:border-primary/40"
                          }`}
                        >
                          {isAr ? opt.ar : opt.en}
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted && (
                    <p className="text-[11px] font-medium text-primary">
                      {isAr ? q.explanation.ar : q.explanation.en}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
            {quizSubmitted ? (
              <div className="flex flex-wrap items-center gap-3 text-xs tabular-nums">
                <span className="font-bold text-foreground" data-testid="dojo-quiz-score">
                  {isAr ? "النتيجة:" : "Score:"} {quizScore.correct} / {quizScore.total} (
                  {quizScore.pct}%)
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizAnswers({});
                  }}
                >
                  <RotateCcw className="size-3.5 me-1" />
                  {isAr ? "إعادة المحاولة" : "Retry Quiz"}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="glow"
                onClick={handleSubmitQuiz}
                data-testid="dojo-quiz-submit"
                className="min-h-[44px]"
              >
                <CheckCircle2 className="size-4 me-1.5" />
                {isAr ? "تحقق من الإجابات" : "Submit & Review Explanations"}
              </Button>
            )}
          </div>
        </section>
      )}

      {/* 8. Dojo Mentor AI */}
      {activeTab === "mentor" && <DojoMentorChat isAr={isAr} lang={lang} />}

      {/* 9. Martial Arts for Humanity + Privacy-Safe Profile + Parent/Student Club Verification Guide */}
      {activeTab === "humanity" && (
        <section className="space-y-6" data-testid="dojo-humanity-section">
          <div className="surface-card space-y-4 p-5">
            <h2 className="font-display text-lg font-bold text-foreground">
              {isAr
                ? "فنون القتال لخدمة الإنسانية (٥ تحديات إيجابية)"
                : "Martial Arts for Humanity (5 Kindness & Consistency Challenges)"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {HUMANITY_CHALLENGES.map((hc) => {
                const done = dojo.humanityChallengesDone.includes(hc.id);
                return (
                  <div
                    key={hc.id}
                    className={`flex flex-col justify-between rounded-xl border p-4 space-y-2.5 text-xs ${
                      done
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-border bg-surface-2/60"
                    }`}
                  >
                    <div>
                      <h3 className="font-display text-sm font-bold text-foreground">
                        {isAr ? hc.title.ar : hc.title.en}
                      </h3>
                      <p className="mt-1 text-muted-foreground">
                        {isAr ? hc.description.ar : hc.description.en}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={done ? "glow" : "outline"}
                      onClick={() => toggleHumanityChallenge(hc.id)}
                      className="min-h-[38px] w-fit text-xs"
                    >
                      <CheckCircle2 className="size-3.5 me-1" />
                      {done
                        ? isAr
                          ? "تم الإنجاز"
                          : "Completed"
                        : isAr
                          ? "تحدّيت نفسي اليوم"
                          : "Mark Practiced"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Privacy-Safe Local Learning Profile */}
          <form onSubmit={handleSaveGoal} className="surface-card space-y-3 p-5 text-xs">
            <h3 className="font-display text-base font-bold text-foreground">
              {isAr ? "ملف التعلّم الشخصي (خاص ومحلي)" : "Personal Dojo Learning Profile (Private)"}
            </h3>
            <p className="text-muted-foreground">
              {isAr
                ? "يُحفظ هدفك واهتماماتك محلياً فقط داخل حسابك دون أي مشاركة عامة أو نشر مواقع أو صور."
                : "Saved strictly privately inside your account—no public profiles, location tracking, photo uploads, or moral rankings."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Input
                value={goalDraft}
                onChange={(e) => setGoalDraft(e.target.value)}
                placeholder={
                  isAr
                    ? "مثال: تطوير هدوئي والانضباط في الدراسة هذا الفصل"
                    : "e.g. Build calm study discipline and posture awareness"
                }
                className="min-h-[44px] flex-1 text-xs"
              />
              <Button type="submit" className="min-h-[44px]">
                {isAr ? "حفظ الهدف" : "Save Goal"}
              </Button>
            </div>
          </form>

          {/* Informational Safeguarding Checklist for Parents & Students Evaluating Local Clubs */}
          <div className="surface-card space-y-3 p-5" data-testid="dojo-safeguarding-guide">
            <h3 className="font-display text-base font-bold text-foreground">
              {isAr
                ? "دليل أولياء الأمور والطلاب لتقييم الأندية والمدربين الحقيقيين"
                : "Safeguarding Guide: Evaluating Real-World Instructors & Dojos"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "دليل إرشادي فقط؛ لا تعرض NEXORA قائمة مدربين خارجيين ولا تمنح اعتماداً مزيفاً لأي نادٍ."
                : "Informational checklist only—NEXORA does not endorse external local clubs or display unverified instructor ratings."}
            </p>
            <div className="grid gap-3 md:grid-cols-2 text-xs">
              {SAFEGUARDING_INSTRUCTOR_CHECKLIST.map((sg) => (
                <div
                  key={sg.id}
                  className="rounded-xl border border-border bg-surface-2 p-3.5 space-y-1"
                >
                  <div className="font-bold text-foreground">
                    {isAr ? sg.question.ar : sg.question.en}
                  </div>
                  <p className="text-muted-foreground">
                    {isAr ? sg.whyItMatters.ar : sg.whyItMatters.en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
