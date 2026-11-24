import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BookMarked,
  CheckCircle2,
  Clock,
  Compass,
  Dna,
  Download,
  FileText,
  HelpCircle,
  Layers,
  MessageSquareCheck,
  Network,
  Pin,
  PinOff,
  RotateCcw,
  Sparkles,
  Upload,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { CurriculumAndOfflinePanel } from "@/components/study/CurriculumAndOfflinePanel";
import { VisualConceptExplorer } from "@/components/study/VisualConceptExplorer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TEACH_ME_STYLES } from "@/data/curriculum-and-challenges";
import {
  useFocusSessions,
  useQuizAttempts,
  useStudyActions,
  useStudyItems,
} from "@/hooks/use-modules";
import { useUser } from "@/hooks/use-nexora";
import { BRAND } from "@/config/brand";
import { analysisService, type LearningGapAnalysisReport } from "@/lib/analysis-service";
import {
  queryExamQuestionsFromFirestore,
  recordExamSimulationCompletion,
} from "@/lib/exam-center-service";
import {
  analyzeMisconceptions,
  analyzeStudyHabits,
  computeForgettingCurve,
  computeLearningDnaProfile,
  detectLearningGaps,
  evaluateFeynmanExplanation,
  EXAM_QUESTION_BANK,
  generateQuestionsFromText,
  gradeExamSimulation,
  transformStudyMaterialLocally,
  type ExamSimulationConfig,
  type ExamSimulationQuestion,
} from "@/lib/learning-intelligence";
import { downloadTextFile, readFileAsTextSafe } from "@/lib/safe-file";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

type LabTab =
  | "dna"
  | "transformer"
  | "exam"
  | "graph"
  | "curriculum"
  | "forgetting"
  | "questions"
  | "feynman"
  | "library";

export function LearningIntelligenceWorkspace({
  onOpenFlashcards,
}: {
  onOpenFlashcards?: () => void;
}) {
  const { data: user } = useUser();
  const { state, update, exportJson } = useStudentEcosystem();
  const { data: studyItems = [] } = useStudyItems();
  const { data: quizAttempts = [] } = useQuizAttempts();
  const { data: focusSessions = [] } = useFocusSessions();
  const { addStudyItem, recordQuizAttempt } = useStudyActions();

  const [tab, setTab] = useState<LabTab>("dna");

  const bestWpm = useMemo(
    () => state.typingHistory.reduce((mx, r) => Math.max(mx, r.wpm), 0),
    [state.typingHistory],
  );

  // Recent weak exam topics to connect Exam Analytics -> 8-Pattern Mistake Analyzer
  const recentExamWeakTopics = useMemo(
    () => state.examHistory.slice(0, 3).flatMap((e) => e.weakTopics),
    [state.examHistory],
  );

  const dnaProfile = useMemo(
    () =>
      computeLearningDnaProfile({
        studyItems,
        quizAttempts,
        focusSessions,
        placement: state.placement,
        bestWpm,
      }),
    [studyItems, quizAttempts, focusSessions, state.placement, bestWpm],
  );

  const habitReport = useMemo(() => analyzeStudyHabits(focusSessions), [focusSessions]);
  const misconceptions = useMemo(
    () =>
      analyzeMisconceptions({
        studyItems,
        quizAttempts,
        examWeakTopics: recentExamWeakTopics,
      }),
    [studyItems, quizAttempts, recentExamWeakTopics],
  );

  // #1 LEARNING GAP DETECTOR
  const englishWeakSkill = useMemo(() => {
    const latest =
      state.englishWorld.placementHistory[state.englishWorld.placementHistory.length - 1];
    if (!latest) return null;
    const weakest = [...latest.dimensionScores].sort((a, b) => a.scorePct - b.scorePct)[0];
    return weakest && weakest.scorePct < 75 ? weakest.label : null;
  }, [state.englishWorld.placementHistory]);

  const gapDetection = useMemo(
    () =>
      detectLearningGaps({
        studyItems,
        quizAttempts,
        masteredNodeIds: state.masteredKnowledgeNodes,
        resolvedGapIds: state.resolvedGapIds,
        englishWeakSkill,
      }),
    [
      studyItems,
      quizAttempts,
      state.masteredKnowledgeNodes,
      state.resolvedGapIds,
      englishWeakSkill,
    ],
  );

  const [reassessChoices, setReassessChoices] = useState<Record<string, number>>({});
  const [reassessFeedback, setReassessFeedback] = useState<Record<string, boolean>>({});
  const [gapReport, setGapReport] = useState<LearningGapAnalysisReport | null>(null);
  const [analyzingGaps, setAnalyzingGaps] = useState(false);
  const [showGapJson, setShowGapJson] = useState(false);

  const handleRunAnalysisService = async () => {
    setAnalyzingGaps(true);
    try {
      const report = await analysisService.analyzeLearningGaps({
        userId: user?.uid ?? null,
        masteredNodeIds: state.masteredKnowledgeNodes,
        resolvedGapIds: state.resolvedGapIds,
        englishWeakSkill,
        fallbackStudyItems: studyItems,
        fallbackQuizAttempts: quizAttempts,
      });
      setGapReport(report);
      toast.success(
        `AnalysisService scanned ${report.stats.quizAttemptsAnalyzed} attempt(s) & ${report.stats.studyItemsAnalyzed} item(s) (${report.sourceMode}).`,
      );
    } finally {
      setAnalyzingGaps(false);
    }
  };

  // #4 SMART MATERIAL TRANSFORMER (UPLOAD + EDITABLE CARDS)
  const [rawMaterialTitle, setRawMaterialTitle] = useState("Unit 3 & Coastal Sustainability Notes");
  const [rawMaterialText, setRawMaterialText] = useState(
    "Reflect: To think deeply or consider carefully before acting.\nMaintain: To keep something in good condition or balance over time.\nCoastal mangroves absorb four times more carbon per hectare than many inland forests.\nSpaced repetition strengthens long-term memory recall far better than single-night cramming.",
  );
  const transformedPack = useMemo(
    () => transformStudyMaterialLocally(rawMaterialText, rawMaterialTitle),
    [rawMaterialText, rawMaterialTitle],
  );
  const [cardEdits, setCardEdits] = useState<Record<number, { front: string; back: string }>>({});
  const [aiCardsOverride, setAiCardsOverride] = useState<Array<{
    front: string;
    back: string;
  }> | null>(null);
  const [aiTransformLoading, setAiTransformLoading] = useState(false);
  const [savingCards, setSavingCards] = useState(false);

  const editableCards = useMemo(() => {
    const baseCards = aiCardsOverride ?? transformedPack.flashcards;
    return baseCards.map((fc, idx) => ({
      front: cardEdits[idx]?.front ?? fc.front,
      back: cardEdits[idx]?.back ?? fc.back,
    }));
  }, [aiCardsOverride, transformedPack.flashcards, cardEdits]);

  const handleAiTransformNotes = async () => {
    if (!rawMaterialText.trim()) return;
    setAiTransformLoading(true);
    try {
      const res = await fetch("/api/ai/structured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "flashcards",
          subject: rawMaterialTitle || "General Study",
          prompt: "Extract concise, accurate study flashcards strictly from these notes.",
          sourceText: rawMaterialText,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        data?: { mode?: string; flashcards?: Array<{ front: string; back: string }> };
        message?: string;
      };
      if (!res.ok || !json.ok || !json.data?.flashcards?.length) {
        toast.info(
          json.message
            ? `AI unavailable (${json.message}) — kept local deterministic cards.`
            : "Using local deterministic extractor.",
        );
        return;
      }
      setAiCardsOverride(json.data.flashcards.map((c) => ({ front: c.front, back: c.back })));
      setCardEdits({});
      toast.success(`Generated ${json.data.flashcards.length} AI-refined flashcards!`);
    } catch {
      toast.info("Offline or server unreachable — using local deterministic extractor.");
    } finally {
      setAiTransformLoading(false);
    }
  };

  const handleDownloadTransformerPack = () => {
    const payload = {
      title: transformedPack.title,
      generatedAt: new Date().toISOString(),
      summaryBullets: transformedPack.summaryBullets,
      flashcards: editableCards,
      revisionSheet: transformedPack.revisionSheet,
    };
    const filename = `${(transformedPack.title || "study-pack").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    downloadTextFile(JSON.stringify(payload, null, 2), filename, "application/json;charset=utf-8");
  };

  const handleMaterialFileUpload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const content = await readFileAsTextSafe(file, {
        allowedExtensions: [".txt", ".md", ".csv", ".json"],
        allowedMimePrefixes: ["text/", "application/json"],
      });
      if (!content.trim()) {
        toast.error(
          "Could not extract readable text from that file. Please paste or upload a .txt / .md study file.",
        );
        return;
      }
      setRawMaterialTitle(file.name.replace(/\.[^.]+$/, ""));
      setRawMaterialText(content.slice(0, 8000));
      setCardEdits({});
      toast.success(`Loaded "${file.name}" into Material Transformer!`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "File read failed. Try copying the text directly.",
      );
    }
  };

  const handleSaveTransformedCards = async () => {
    if (editableCards.length === 0) return;
    setSavingCards(true);
    try {
      for (const fc of editableCards) {
        await addStudyItem({
          kind: "flashcard",
          subject: "English",
          deck: transformedPack.title,
          title: fc.front,
          content: fc.front,
          answer: fc.back,
          difficulty: "medium",
        });
      }
      toast.success(`Saved ${editableCards.length} flashcard(s) to Study Flashcards!`);
    } catch {
      toast.error("Sign in to sync flashcards to Firestore (cards stay locally accessible).");
    } finally {
      setSavingCards(false);
    }
  };

  const handleSavePackToLibrary = (sourceType: "transformed" | "offline_pack") => {
    update((prev) => ({
      ...prev,
      knowledgeLibrary: [
        {
          id: `lib_${Date.now().toString(36)}`,
          title: transformedPack.title,
          subject: "Study Pack",
          sourceType,
          content: transformedPack.revisionSheet,
          tags: ["notes", "transformed", sourceType],
          pinnedOffline: sourceType === "offline_pack",
          createdAt: new Date().toISOString(),
        },
        ...prev.knowledgeLibrary,
      ],
    }));
    toast.success("Saved study pack & quick revision sheet into your Library!");
  };

  const availableExamTopics = useMemo(
    () => ["All Topics", ...Array.from(new Set(EXAM_QUESTION_BANK.map((q) => q.topic)))],
    [],
  );

  // #3 UPGRADED EXAM SIMULATION CENTER
  const [examConfig, setExamConfig] = useState<ExamSimulationConfig>({
    curriculum: "Kuwait / GCC Secondary",
    subject: "Mixed STEM & English",
    topic: "All Topics",
    difficulty: "standard",
    questionCount: 5,
    durationMinutes: 10,
  });
  const [examQuestions, setExamQuestions] = useState<ExamSimulationQuestion[]>([]);
  const [examMcqAnswers, setExamMcqAnswers] = useState<Record<string, number>>({});
  const [examTextAnswers, setExamTextAnswers] = useState<Record<string, string>>({});
  const [examSecondsLeft, setExamSecondsLeft] = useState(0);
  const [examRunning, setExamRunning] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [loadingExamQuestions, setLoadingExamQuestions] = useState(false);
  const [examSourceMode, setExamSourceMode] = useState<"firestore_query" | "local_fallback" | null>(
    null,
  );
  const [lastActivityLogEvent, setLastActivityLogEvent] = useState<{
    activityLogEventId: string;
    loggedToFirestore: boolean;
    xpEarned: number;
  } | null>(null);

  const gradedExam = useMemo(
    () =>
      examFinished && examQuestions.length > 0
        ? gradeExamSimulation(examQuestions, examMcqAnswers, examTextAnswers)
        : null,
    [examFinished, examQuestions, examMcqAnswers, examTextAnswers],
  );

  useEffect(() => {
    if (!examRunning) return;
    const id = window.setInterval(() => {
      setExamSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          setExamRunning(false);
          setExamFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [examRunning]);

  const handleStartExam = async () => {
    setLoadingExamQuestions(true);
    try {
      const { questions, sourceMode } = await queryExamQuestionsFromFirestore({
        userId: user?.uid ?? null,
        config: examConfig,
      });
      setExamQuestions(questions);
      setExamSourceMode(sourceMode);
      setExamMcqAnswers({});
      setExamTextAnswers({});
      setExamSecondsLeft(examConfig.durationMinutes * 60);
      setExamFinished(false);
      setLastActivityLogEvent(null);
      setExamRunning(true);
    } finally {
      setLoadingExamQuestions(false);
    }
  };

  const handleFinishExam = async () => {
    setExamRunning(false);
    setExamFinished(true);
    const graded = gradeExamSimulation(examQuestions, examMcqAnswers, examTextAnswers);
    const wrongIds = graded.results.filter((r) => !r.correct).map((r) => r.questionId);

    update((prev) => ({
      ...prev,
      examHistory: [
        {
          id: `exam_${Date.now().toString(36)}`,
          subject: `${examConfig.subject} · ${examConfig.topic} (${examConfig.difficulty})`,
          correct: graded.correctCount,
          total: graded.total,
          scorePct: graded.scorePct,
          weakTopics: graded.weakTopics,
          date: new Date().toISOString(),
        },
        ...prev.examHistory,
      ].slice(0, 20),
    }));

    const logOutcome = await recordExamSimulationCompletion({
      userId: user?.uid ?? null,
      config: examConfig,
      correctCount: graded.correctCount,
      total: graded.total,
      scorePct: graded.scorePct,
      wrongItemIds: wrongIds,
      recordQuizAttempt,
    });
    setLastActivityLogEvent(logOutcome);
    toast.success(
      `Exam Submitted: ${graded.correctCount}/${graded.total} (${graded.scorePct}%)${
        logOutcome.loggedToFirestore ? " · Logged to Activity Log" : ""
      }`,
    );
  };

  // #5 FORGETTING CURVE
  const retentionList = useMemo(() => computeForgettingCurve(studyItems), [studyItems]);

  // #9 QUESTION GENERATOR
  const [qGenFormat, setQGenFormat] = useState<"cloze" | "mcq" | "short">("cloze");
  const [qGenSource, setQGenSource] = useState(
    "Reflect means thinking carefully before acting. Maintain means keeping equipment balanced and reliable.",
  );
  const generatedQuestions = useMemo(
    () => generateQuestionsFromText(qGenSource, qGenFormat),
    [qGenSource, qGenFormat],
  );
  const [revealedGenIds, setRevealedGenIds] = useState<string[]>([]);

  // #10 EXPLAIN IT BACK / FEYNMAN
  const [feynmanTopic, setFeynmanTopic] = useState("Why Spaced Repetition Beats Cramming");
  const [feynmanKeywords, setFeynmanKeywords] = useState("recall, spacing, interval, sleep");
  const [feynmanText, setFeynmanText] = useState("");
  const feynmanEval = useMemo(() => {
    if (!feynmanText.trim()) return null;
    return evaluateFeynmanExplanation({
      topicTitle: feynmanTopic,
      expectedKeywords: feynmanKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      studentExplanation: feynmanText,
    });
  }, [feynmanTopic, feynmanKeywords, feynmanText]);

  // #30 LIBRARY SEARCH
  const [libSearch, setLibSearch] = useState("");
  const [offlineOnly, setOfflineOnly] = useState(false);
  const filteredLibrary = useMemo(() => {
    const q = libSearch.trim().toLowerCase();
    return state.knowledgeLibrary.filter((entry) => {
      if (offlineOnly && !entry.pinnedOffline) return false;
      if (!q) return true;
      return (
        entry.title.toLowerCase().includes(q) ||
        entry.content.toLowerCase().includes(q) ||
        entry.subject.toLowerCase().includes(q)
      );
    });
  }, [state.knowledgeLibrary, libSearch, offlineOnly]);

  const handleExportLibraryJson = () => {
    downloadTextFile(
      exportJson(),
      "nexora-student-ecosystem-export.json",
      "application/json;charset=utf-8",
    );
  };

  return (
    <div className="space-y-5">
      <div className="surface-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="size-4" />
            <span>{BRAND.shortName} Learning Intelligence Studio</span>
          </div>
          <h2 className="mt-1 font-display text-lg font-bold text-foreground">
            Learning Gaps, DNA, 8-Pattern Mistake Analyzer, Exam Center, Knowledge Map &amp; Offline
            Packs
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <FeatureGuideTrigger featureId="learning-intelligence" />
          {(
            [
              { id: "dna", label: "Gaps, DNA & Mistakes", icon: Dna },
              { id: "transformer", label: "Material Studio", icon: FileText },
              { id: "exam", label: "Exam Center", icon: Clock },
              { id: "graph", label: "Visual Map & Concepts", icon: Network },
              { id: "curriculum", label: "Curriculum & Offline", icon: Compass },
              { id: "forgetting", label: "Smart Revision", icon: Activity },
              { id: "questions", label: "Q-Generator", icon: HelpCircle },
              { id: "feynman", label: "Explain Back", icon: MessageSquareCheck },
              { id: "library", label: "Library", icon: BookMarked },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                type="button"
                size="sm"
                variant={tab === item.id ? "glow" : "outline"}
                onClick={() => setTab(item.id)}
                className="h-8 whitespace-nowrap shrink-0 text-xs"
              >
                <Icon className="size-3.5" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: LEARNING GAP DETECTOR + EDITABLE LEARNING DNA + 8-PATTERN MISTAKE ANALYZER */}
      {tab === "dna" && (
        <div className="space-y-5 text-xs">
          {/* #1 LEARNING GAP DETECTOR */}
          <div className="surface-card space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Learning Gap Detector (Prerequisites Before Targets)
                </h3>
                <p className="text-muted-foreground">{gapDetection.summaryNote}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="glow"
                  disabled={analyzingGaps}
                  onClick={() => void handleRunAnalysisService()}
                  className="h-7 text-[11px]"
                >
                  <Sparkles className="size-3 me-1" />
                  {analyzingGaps ? "Querying Firestore..." : "Run AnalysisService Audit"}
                </Button>
                <span className="font-mono font-semibold text-success tabular-nums">
                  Resolved: {gapDetection.resolvedCount}
                </span>
                {state.resolvedGapIds.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => update((prev) => ({ ...prev, resolvedGapIds: [] }))}
                    className="h-7 text-[11px]"
                  >
                    <RotateCcw className="size-3" />
                    <span>Re-scan All</span>
                  </Button>
                )}
              </div>
            </div>

            {gapReport && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-foreground tabular-nums">
                    AnalysisService Report · Mode:{" "}
                    <span className="font-mono text-primary">{gapReport.sourceMode}</span> ·{" "}
                    {gapReport.stats.quizAttemptsAnalyzed} quiz attempt(s) &amp;{" "}
                    {gapReport.stats.studyItemsAnalyzed} study item(s)
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowGapJson((v) => !v)}
                    className="h-6 text-[10px]"
                  >
                    {showGapJson ? "Hide Structured JSON" : "View Structured JSON"}
                  </Button>
                </div>

                {gapReport.recommendedLessons.length > 0 && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {gapReport.recommendedLessons.map((rec) => (
                      <div
                        key={`${rec.nodeId}_${rec.topic}`}
                        className="rounded-lg border border-border bg-surface p-2.5 space-y-1"
                      >
                        <div className="text-[10px] font-bold uppercase text-primary">
                          {rec.subject} · Prerequisite Lesson
                        </div>
                        <div className="font-semibold text-foreground">{rec.prerequisiteTitle}</div>
                        <p className="text-[11px] text-muted-foreground">{rec.studyTip}</p>
                        {rec.matchedLibraryTitle && (
                          <button
                            type="button"
                            onClick={() => setTab("library")}
                            className="text-[11px] font-semibold text-primary hover:underline"
                          >
                            Matched OER Guide: {rec.matchedLibraryTitle}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {showGapJson && (
                  <pre className="max-h-56 overflow-auto rounded-lg border border-border bg-surface p-2.5 font-mono text-[10px] text-foreground">
                    {JSON.stringify(gapReport, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {gapDetection.gaps.length === 0 ? (
              <div className="rounded-xl border border-success/40 bg-success/10 p-4 text-foreground font-medium">
                No active foundation gaps detected right now! Keep reviewing flashcards and running
                Exam Center checks to stay sharp.
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {gapDetection.gaps.map((gap) => {
                  const chosen = reassessChoices[gap.id];
                  const submitted = reassessFeedback[gap.id];
                  const passedCheck = submitted && chosen === gap.reassessQuestion.correctIndex;
                  return (
                    <div
                      key={gap.id}
                      className="rounded-xl border border-border bg-surface-2 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase text-primary">
                            {gap.subject} · Target: {gap.targetTopic}
                          </span>
                          <h4 className="font-display text-sm font-bold text-foreground mt-0.5">
                            {gap.missingPrerequisites.length > 0
                              ? `Repair First: ${gap.missingPrerequisites.map((p) => p.title).join(" -> ")}`
                              : `Strengthen ${gap.targetTopic}`}
                          </h4>
                        </div>
                        <span
                          className={`font-semibold uppercase text-[10px] ${
                            gap.severity === "high" ? "text-xp" : "text-muted-foreground"
                          }`}
                        >
                          {gap.severity} priority
                        </span>
                      </div>

                      <div className="space-y-1 rounded-lg border border-border bg-surface p-2.5">
                        <div className="font-semibold text-foreground">
                          Observed Evidence (Verified from your activity):
                        </div>
                        {gap.evidenceFacts.map((ef) => (
                          <p key={ef} className="text-muted-foreground">
                            • {ef}
                          </p>
                        ))}
                        <div className="font-semibold text-xp pt-1">Diagnostic Hypothesis:</div>
                        {gap.hypothesizedCauses.map((hc) => (
                          <p key={hc} className="text-muted-foreground">
                            • {hc}
                          </p>
                        ))}
                      </div>

                      <div>
                        <div className="font-semibold text-foreground mb-1">
                          Targeted Recovery Plan:
                        </div>
                        <ol className="list-decimal ps-4 space-y-0.5 text-muted-foreground">
                          {gap.recoverySteps.map((st) => (
                            <li key={st}>{st}</li>
                          ))}
                        </ol>
                      </div>

                      {/* Quick Reassessment to Verify Improvement */}
                      <div className="rounded-lg border border-primary/25 bg-surface p-3 space-y-2">
                        <div className="font-semibold text-foreground">
                          Verify Recovery Check: {gap.reassessQuestion.prompt}
                        </div>
                        <div className="grid gap-1.5 sm:grid-cols-2">
                          {gap.reassessQuestion.options.map((opt, idx) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() =>
                                setReassessChoices((prev) => ({ ...prev, [gap.id]: idx }))
                              }
                              className={`rounded border px-2.5 py-1.5 text-start text-[11px] ${
                                chosen === idx
                                  ? "border-primary bg-primary/15 text-primary font-semibold"
                                  : "border-border bg-surface-2 text-foreground"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="glow"
                          disabled={typeof chosen !== "number"}
                          onClick={() => {
                            setReassessFeedback((prev) => ({ ...prev, [gap.id]: true }));
                            if (chosen === gap.reassessQuestion.correctIndex) {
                              update((prev) => ({
                                ...prev,
                                resolvedGapIds: prev.resolvedGapIds.includes(gap.id)
                                  ? prev.resolvedGapIds
                                  : [...prev.resolvedGapIds, gap.id],
                                masteredKnowledgeNodes: prev.masteredKnowledgeNodes.includes(
                                  gap.targetNodeId,
                                )
                                  ? prev.masteredKnowledgeNodes
                                  : [...prev.masteredKnowledgeNodes, gap.targetNodeId],
                              }));
                              toast.success(`Gap resolved & verified: ${gap.targetTopic}!`);
                            }
                          }}
                          className="h-8 text-xs"
                        >
                          Verify Gap Closure
                        </Button>
                        {submitted && (
                          <p
                            className={`text-[11px] font-medium ${
                              passedCheck ? "text-success" : "text-xp"
                            }`}
                          >
                            {passedCheck ? "Verified! " : "Try again after reviewing steps: "}
                            {gap.reassessQuestion.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {/* #21 EDITABLE LEARNING DNA PROFILE */}
            <div className="surface-card space-y-4 p-5 lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Your {BRAND.shortName} Learning DNA Profile
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Educational study-pattern model — not a medical or psychological diagnosis. You
                    control all preferences below.
                  </p>
                </div>
                <span className="rounded border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
                  {dnaProfile.retentionStyle}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-surface-2 p-3.5">
                  <div className="text-[0.68rem] uppercase text-muted-foreground">
                    Verified Evidence Strength
                  </div>
                  <div className="mt-1 font-display text-sm font-bold text-foreground">
                    {dnaProfile.dominantStrength}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-surface-2 p-3.5">
                  <div className="text-[0.68rem] uppercase text-muted-foreground">
                    Priority Growth Frontier
                  </div>
                  <div className="mt-1 font-display text-sm font-bold text-xp">
                    {dnaProfile.growthFrontier}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {dnaProfile.signals.map((sig) => (
                  <div
                    key={sig.label}
                    className="rounded-lg border border-border bg-surface-2 p-2.5"
                  >
                    <div className="text-[0.65rem] text-muted-foreground">{sig.label}</div>
                    <div className="font-display text-sm font-bold text-foreground">
                      {sig.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Editable DNA Controls & Privacy */}
              <div className="rounded-xl border border-border bg-surface-2 p-4 space-y-3">
                <div className="font-semibold text-foreground">
                  Edit Your Learning DNA &amp; Privacy Controls
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="space-y-1">
                    <span className="text-[11px] text-muted-foreground">Focus Block Length</span>
                    <select
                      value={state.dnaPreferences.preferredSessionMin}
                      onChange={(e) =>
                        update((prev) => ({
                          ...prev,
                          dnaPreferences: {
                            ...prev.dnaPreferences,
                            preferredSessionMin: Number(e.target.value),
                          },
                        }))
                      }
                      className="h-8 w-full rounded-md border border-input bg-surface px-2 text-xs text-foreground"
                    >
                      <option value={15}>15 min (Short sprints)</option>
                      <option value={25}>25 min (Classic)</option>
                      <option value={40}>40 min (Deep focus)</option>
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="text-[11px] text-muted-foreground">
                      Default Teaching Style
                    </span>
                    <select
                      value={state.dnaPreferences.preferredExplanationStyle}
                      onChange={(e) =>
                        update((prev) => ({
                          ...prev,
                          dnaPreferences: {
                            ...prev.dnaPreferences,
                            preferredExplanationStyle: e.target.value,
                          },
                        }))
                      }
                      className="h-8 w-full rounded-md border border-input bg-surface px-2 text-xs text-foreground"
                    >
                      {TEACH_ME_STYLES.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="text-[11px] text-muted-foreground">Study Rhythm</span>
                    <select
                      value={state.dnaPreferences.learningPace}
                      onChange={(e) =>
                        update((prev) => ({
                          ...prev,
                          dnaPreferences: {
                            ...prev.dnaPreferences,
                            learningPace: e.target.value as "gentle" | "balanced" | "intensive",
                          },
                        }))
                      }
                      className="h-8 w-full rounded-md border border-input bg-surface px-2 text-xs text-foreground"
                    >
                      <option value="gentle">Gentle Recovery</option>
                      <option value="balanced">Balanced Daily</option>
                      <option value="intensive">Exam Intensive</option>
                    </select>
                  </label>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.dnaPreferences.allowAdaptiveInsights}
                    onChange={(e) =>
                      update((prev) => ({
                        ...prev,
                        dnaPreferences: {
                          ...prev.dnaPreferences,
                          allowAdaptiveInsights: e.target.checked,
                        },
                      }))
                    }
                    className="accent-primary"
                  />
                  <span className="text-[11px] text-foreground">
                    Allow {BRAND.shortName} to personalize study path suggestions using my activity
                    history (never shared publicly)
                  </span>
                </label>
              </div>

              {/* #10 8-PATTERN MISTAKE ANALYZER */}
              <div className="space-y-2 pt-1">
                <h4 className="font-display text-sm font-bold text-foreground">
                  Mistake Pattern Analyzer ({misconceptions.length} Pattern
                  {misconceptions.length === 1 ? "" : "s"} Detected · Supportive &amp; Non-Shaming)
                </h4>
                {misconceptions.length === 0 ? (
                  <p className="text-muted-foreground">
                    No recurring mistake clusters found yet. Log mistakes in Study or run an Exam
                    simulation to uncover root patterns.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {misconceptions.map((m) => (
                      <div
                        key={m.category}
                        className="rounded-xl border border-xp/35 bg-surface-2 p-3.5 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground flex items-center gap-1.5">
                            <AlertTriangle className="size-3.5 text-xp" />
                            {m.title}
                          </span>
                          <span className="font-mono text-xp">{m.count} signal(s)</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{m.evidenceNote}</p>
                        <p className="text-muted-foreground">Why it happens: {m.rootCause}</p>
                        <p className="text-primary font-medium">Next drill: {m.correctiveDrill}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Study Habit Summary */}
            <div className="surface-card space-y-3 p-5">
              <h3 className="font-display text-sm font-bold text-foreground">
                Study Session Habit Analyzer
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between rounded-lg border border-border bg-surface-2 px-3 py-2">
                  <span className="text-muted-foreground">Sessions Logged</span>
                  <span className="font-bold text-foreground">{habitReport.sessionCount}</span>
                </div>
                <div className="flex justify-between rounded-lg border border-border bg-surface-2 px-3 py-2">
                  <span className="text-muted-foreground">Total Focus Minutes</span>
                  <span className="font-bold text-foreground">
                    {habitReport.totalFocusMinutes}m
                  </span>
                </div>
                <div className="flex justify-between rounded-lg border border-border bg-surface-2 px-3 py-2">
                  <span className="text-muted-foreground">Average Block</span>
                  <span className="font-bold text-foreground">
                    {habitReport.avgSessionMinutes}m
                  </span>
                </div>
                <div className="flex justify-between rounded-lg border border-border bg-surface-2 px-3 py-2">
                  <span className="text-muted-foreground">Consistency</span>
                  <span className="font-bold text-primary">{habitReport.consistencyRating}</span>
                </div>
              </div>
              <p className="rounded-lg border border-border bg-surface-2 p-3 text-muted-foreground leading-relaxed">
                {habitReport.actionableTip}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SMART MATERIAL TRANSFORMER */}
      {tab === "transformer" && (
        <div className="grid gap-5 lg:grid-cols-2 text-xs">
          <div className="surface-card space-y-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-base font-bold text-foreground">
                Smart Study Material Transformer
              </h3>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:border-primary/40">
                <Upload className="size-3.5 text-primary" />
                <span>Upload .txt / .md</span>
                <input
                  type="file"
                  accept=".txt,.md,.csv,.json"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    void handleMaterialFileUpload(file);
                  }}
                />
              </label>
            </div>
            <p className="text-muted-foreground">
              Paste your own class notes or upload a text study file to extract structured
              summaries, key definitions, vocabulary, concept links, editable flashcards, and a
              Quick Revision Sheet—preserving original meaning strictly.
            </p>
            <Input
              value={rawMaterialTitle}
              onChange={(e) => setRawMaterialTitle(e.target.value)}
              placeholder="Pack title..."
              className="text-xs"
            />
            <Textarea
              rows={8}
              value={rawMaterialText}
              onChange={(e) => {
                setRawMaterialText(e.target.value);
                setCardEdits({});
              }}
              placeholder="Paste Term: Definition lines or study sentences..."
              className="text-xs"
            />
            {transformedPack.uncertainNotes.length > 0 && (
              <div className="rounded-lg border border-xp/40 bg-xp/10 p-2.5 text-[11px] text-foreground">
                {transformedPack.uncertainNotes.map((un) => (
                  <p key={un}>• {un}</p>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={aiTransformLoading || !rawMaterialText.trim()}
                onClick={handleAiTransformNotes}
              >
                <Sparkles className="size-3.5 text-primary" />
                <span>
                  {aiTransformLoading ? "Refining with AI..." : `Refine with ${BRAND.shortName} AI`}
                </span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="glow"
                disabled={savingCards}
                onClick={handleSaveTransformedCards}
              >
                <Layers className="size-3.5" />
                <span>Save {editableCards.length} Edited Cards</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleSavePackToLibrary("transformed")}
              >
                <BookMarked className="size-3.5" />
                <span>Save Revision Sheet</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleSavePackToLibrary("offline_pack")}
              >
                <WifiOff className="size-3.5" />
                <span>Pin Offline Pack</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleDownloadTransformerPack}
              >
                <Download className="size-3.5" />
                <span>Download Pack (.json)</span>
              </Button>
            </div>
          </div>

          <div className="surface-card space-y-4 p-5">
            <h3 className="font-display text-sm font-bold text-foreground">
              Editable Generated Pack: {transformedPack.title}
            </h3>
            <div className="space-y-1.5">
              <div className="font-semibold text-primary">Summary Key Points</div>
              <ul className="list-disc ps-4 space-y-1 text-foreground/90">
                {transformedPack.summaryBullets.map((b, i) => (
                  <li key={`sum_${i}`}>{b}</li>
                ))}
              </ul>
            </div>

            {transformedPack.conceptLinks.length > 0 && (
              <div className="space-y-1">
                <div className="font-semibold text-primary">Related Concept Map Links</div>
                <p className="text-muted-foreground">{transformedPack.conceptLinks.join(" · ")}</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="font-semibold text-primary">
                Editable Flashcards (Customize before saving)
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pe-1">
                {editableCards.map((fc, i) => (
                  <div
                    key={`tfc_${i}`}
                    className="rounded-lg border border-border bg-surface-2 p-2.5 space-y-1.5"
                  >
                    <Input
                      value={fc.front}
                      onChange={(e) =>
                        setCardEdits((prev) => ({
                          ...prev,
                          [i]: { front: e.target.value, back: fc.back },
                        }))
                      }
                      aria-label={`Card ${i + 1} front`}
                      className="h-7 text-xs font-semibold"
                    />
                    <Input
                      value={fc.back}
                      onChange={(e) =>
                        setCardEdits((prev) => ({
                          ...prev,
                          [i]: { front: fc.front, back: e.target.value },
                        }))
                      }
                      aria-label={`Card ${i + 1} back`}
                      className="h-7 text-xs text-muted-foreground"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UPGRADED EXAM SIMULATION CENTER */}
      {tab === "exam" && (
        <div className="surface-card space-y-4 p-5 text-xs">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/80 pb-3">
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Exam Simulation Center (Configurable · Mixed Formats)
              </h3>
              <p className="text-muted-foreground">
                Practice exam simulator supporting MCQ, True/False, Short Answer, and Written
                Response with weak-topic analytics. Practice benchmark only—not an official ministry
                exam.
              </p>
            </div>
            {examRunning && (
              <span className="font-mono text-sm font-bold text-xp tabular-nums">
                Time Left: {Math.floor(examSecondsLeft / 60)}:
                {String(examSecondsLeft % 60).padStart(2, "0")}
              </span>
            )}
          </div>

          {!examRunning && (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6 rounded-xl border border-border bg-surface-2 p-3.5">
              <label className="space-y-1">
                <span className="text-[11px] font-semibold text-foreground">Subject</span>
                <select
                  value={examConfig.subject}
                  onChange={(e) =>
                    setExamConfig((c) => ({
                      ...c,
                      subject: e.target.value as ExamSimulationConfig["subject"],
                    }))
                  }
                  className="h-8 w-full rounded-md border border-input bg-surface px-2 text-xs text-foreground"
                >
                  <option value="Mixed STEM & English">Mixed STEM &amp; English</option>
                  <option value="English">English</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-[11px] font-semibold text-foreground">Topic</span>
                <select
                  value={examConfig.topic}
                  onChange={(e) =>
                    setExamConfig((c) => ({
                      ...c,
                      topic: e.target.value,
                    }))
                  }
                  className="h-8 w-full rounded-md border border-input bg-surface px-2 text-xs text-foreground"
                >
                  {availableExamTopics.map((tp) => (
                    <option key={tp} value={tp}>
                      {tp}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-[11px] font-semibold text-foreground">Difficulty</span>
                <select
                  value={examConfig.difficulty}
                  onChange={(e) =>
                    setExamConfig((c) => ({
                      ...c,
                      difficulty: e.target.value as ExamSimulationConfig["difficulty"],
                    }))
                  }
                  className="h-8 w-full rounded-md border border-input bg-surface px-2 text-xs text-foreground"
                >
                  <option value="foundation">Foundation</option>
                  <option value="standard">Standard</option>
                  <option value="challenge">Challenge</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-[11px] font-semibold text-foreground">Length</span>
                <select
                  value={examConfig.questionCount}
                  onChange={(e) =>
                    setExamConfig((c) => ({
                      ...c,
                      questionCount: Number(e.target.value) as 5 | 8 | 10,
                    }))
                  }
                  className="h-8 w-full rounded-md border border-input bg-surface px-2 text-xs text-foreground"
                >
                  <option value={5}>5 Questions</option>
                  <option value={8}>8 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-[11px] font-semibold text-foreground">Duration</span>
                <select
                  value={examConfig.durationMinutes}
                  onChange={(e) =>
                    setExamConfig((c) => ({
                      ...c,
                      durationMinutes: Number(e.target.value) as 10 | 15 | 25,
                    }))
                  }
                  className="h-8 w-full rounded-md border border-input bg-surface px-2 text-xs text-foreground"
                >
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes</option>
                  <option value={25}>25 Minutes</option>
                </select>
              </label>

              <div className="flex items-end">
                <Button
                  type="button"
                  size="sm"
                  variant="glow"
                  disabled={loadingExamQuestions}
                  onClick={() => void handleStartExam()}
                  className="w-full h-8"
                >
                  {loadingExamQuestions ? "Loading Bank..." : "Start Simulation"}
                </Button>
              </div>
            </div>
          )}

          {examSourceMode && (
            <div className="text-[11px] font-mono text-muted-foreground">
              Question Bank Source:{" "}
              <strong className="text-foreground">
                {examSourceMode === "firestore_query"
                  ? "Firestore Categorized Query (exam_questions)"
                  : "Local Categorized Fallback"}
              </strong>
            </div>
          )}

          {examQuestions.length > 0 && (
            <div className="space-y-3">
              {examQuestions.map((q, idx) => {
                const chosen = examMcqAnswers[q.id];
                const gradedItem = gradedExam?.results.find((r) => r.questionId === q.id);
                return (
                  <div
                    key={q.id}
                    className="space-y-2 rounded-xl border border-border bg-surface-2 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[0.68rem] font-bold uppercase text-primary">
                      <span>
                        Q{idx + 1} · {q.subject} · {q.topic} ({q.format.replace("_", " ")})
                      </span>
                      {gradedItem && (
                        <span className={gradedItem.correct ? "text-success" : "text-destructive"}>
                          {gradedItem.correct ? "Correct" : "Needs Review"}
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-foreground">{q.prompt}</div>

                    {(q.format === "mcq" || q.format === "true_false") && q.options ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {q.options.map((opt, oIdx) => (
                          <button
                            key={opt}
                            type="button"
                            disabled={examFinished}
                            onClick={() => setExamMcqAnswers((prev) => ({ ...prev, [q.id]: oIdx }))}
                            className={`rounded-lg border px-3 py-2 text-start ${
                              examFinished
                                ? oIdx === q.correctIndex
                                  ? "border-success bg-success/15 font-semibold"
                                  : chosen === oIdx
                                    ? "border-destructive bg-destructive/15"
                                    : "border-border bg-surface opacity-70"
                                : chosen === oIdx
                                  ? "border-primary bg-primary/15 text-primary font-semibold"
                                  : "border-border bg-surface"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <Textarea
                        rows={q.format === "written_response" ? 3 : 1}
                        disabled={examFinished}
                        value={examTextAnswers[q.id] ?? ""}
                        onChange={(e) =>
                          setExamTextAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        placeholder={
                          q.format === "short_answer"
                            ? "Type your short exact answer..."
                            : "Write 1–2 clear sentences..."
                        }
                        className="text-xs"
                      />
                    )}

                    {gradedItem && (
                      <div className="rounded-lg border border-border bg-surface p-2.5 text-[11px] space-y-1">
                        <div>
                          <strong>Expected Key Answer:</strong> {gradedItem.expectedAnswer}
                        </div>
                        <div className="text-muted-foreground">{gradedItem.explanation}</div>
                      </div>
                    )}
                  </div>
                );
              })}

              {examRunning && (
                <Button type="button" variant="glow" onClick={handleFinishExam}>
                  Submit Exam &amp; Analyze Weak Topics
                </Button>
              )}

              {gradedExam && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-display text-sm font-bold text-foreground tabular-nums">
                      Simulation Score: {gradedExam.scorePct}% ({gradedExam.correctCount}/
                      {gradedExam.total})
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {gradedExam.results.some((r) => !r.correct) && (
                        <Button
                          type="button"
                          size="sm"
                          variant="glow"
                          onClick={async () => {
                            const missed = gradedExam.results.filter((r) => !r.correct);
                            try {
                              for (const item of missed) {
                                const q = examQuestions.find((ex) => ex.id === item.questionId);
                                if (!q) continue;
                                await addStudyItem({
                                  kind: "flashcard",
                                  subject: q.subject || examConfig.subject,
                                  deck: `Exam Repair · ${q.topic}`,
                                  title: q.prompt.slice(0, 120),
                                  content: q.prompt,
                                  answer: `${item.expectedAnswer}\n\n${item.explanation}`,
                                  difficulty: "hard",
                                });
                              }
                              toast.success(
                                `Added ${missed.length} missed question(s) to Flashcards for repair!`,
                              );
                              onOpenFlashcards?.();
                            } catch {
                              toast.error("Sign in to save flashcards to Firestore.");
                            }
                          }}
                          className="h-7 text-xs"
                        >
                          <Layers className="size-3.5" />
                          <span>
                            Repair {gradedExam.results.filter((r) => !r.correct).length} Mistake(s)
                            as Flashcards
                          </span>
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void handleStartExam()}
                        className="h-7 text-xs"
                      >
                        New Simulation
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    {gradedExam.weakTopics.length > 0
                      ? `Weak topics detected & sent to Mistake Analyzer: ${gradedExam.weakTopics.join(", ")}.`
                      : "All tested topics answered accurately!"}
                  </p>
                  {lastActivityLogEvent && (
                    <p className="text-[11px] font-mono text-emerald-500">
                      Activity Log Event ({lastActivityLogEvent.activityLogEventId}): +
                      {lastActivityLogEvent.xpEarned} XP ·{" "}
                      {lastActivityLogEvent.loggedToFirestore
                        ? "Saved to Firestore Activity Log & Quiz Attempts"
                        : "Saved locally (sign in for Firestore Activity Log)"}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {state.examHistory.length > 0 && (
            <div className="space-y-2 border-t border-border/80 pt-3">
              <div className="font-display text-sm font-bold text-foreground">
                Recent Attempt Comparison History
              </div>
              {state.examHistory.slice(0, 5).map((ex, idx) => {
                const prevAttempt = state.examHistory[idx + 1];
                const delta = prevAttempt ? ex.scorePct - prevAttempt.scorePct : null;
                return (
                  <div
                    key={ex.id}
                    className="flex flex-wrap items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2"
                  >
                    <div>
                      <div className="font-semibold text-foreground">
                        {ex.subject} — {ex.correct}/{ex.total} ({ex.scorePct}%)
                        {delta !== null && (
                          <span className={`ms-2 ${delta >= 0 ? "text-success" : "text-xp"}`}>
                            {delta >= 0 ? `+${delta}%` : `${delta}%`} vs prior
                          </span>
                        )}
                      </div>
                      {ex.weakTopics.length > 0 && (
                        <div className="text-[0.68rem] text-xp">
                          Review focus: {ex.weakTopics.join(", ")}
                        </div>
                      )}
                    </div>
                    <span className="text-[0.68rem] text-muted-foreground">
                      {ex.date.slice(0, 10)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: VISUAL KNOWLEDGE CONNECTION MAP & EXPLAIN IT VISUALLY */}
      {tab === "graph" && (
        <VisualConceptExplorer
          masteredNodeIds={state.masteredKnowledgeNodes}
          onToggleMasteredNode={(nodeId) =>
            update((prev) => ({
              ...prev,
              masteredKnowledgeNodes: prev.masteredKnowledgeNodes.includes(nodeId)
                ? prev.masteredKnowledgeNodes.filter((id) => id !== nodeId)
                : [...prev.masteredKnowledgeNodes, nodeId],
            }))
          }
        />
      )}

      {/* TAB 5: CURRICULUM NAVIGATOR & LEARNING WITHOUT INTERNET */}
      {tab === "curriculum" && <CurriculumAndOfflinePanel />}

      {/* TAB 6: FORGETTING CURVE / SMART REVISION ENGINE */}
      {tab === "forgetting" && (
        <div className="surface-card space-y-4 p-5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Smart Revision Engine &amp; Ebbinghaus Forgetting Curve
              </h3>
              <p className="text-muted-foreground">
                Tracks recall stability (R = e^(-t/S)). A concept is never considered permanently
                mastered from one isolated single check.
              </p>
            </div>
            {onOpenFlashcards && (
              <Button type="button" size="sm" variant="glow" onClick={onOpenFlashcards}>
                Review Due Flashcards Now
              </Button>
            )}
          </div>

          {retentionList.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              Add or save flashcards first to monitor real-time Ebbinghaus retention decay.
            </p>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {retentionList.slice(0, 12).map((item) => (
                <div
                  key={item.id}
                  className="space-y-1.5 rounded-xl border border-border bg-surface-2 p-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">{item.subject}</span>
                    <span
                      className={`font-mono font-bold ${
                        item.urgency === "overdue"
                          ? "text-destructive"
                          : item.urgency === "fading"
                            ? "text-xp"
                            : "text-success"
                      }`}
                    >
                      {item.predictedRetentionPct}% recall
                    </span>
                  </div>
                  <div className="font-display text-sm font-bold text-foreground line-clamp-1">
                    {item.title}
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                    <div
                      className={`h-full ${
                        item.urgency === "overdue"
                          ? "bg-destructive"
                          : item.urgency === "fading"
                            ? "bg-xp"
                            : "bg-success"
                      }`}
                      style={{ width: `${item.predictedRetentionPct}%` }}
                    />
                  </div>
                  <div className="text-[0.68rem] text-muted-foreground">
                    Age: {item.daysElapsed}d · Stability S = {item.stabilityDays}d · {item.urgency}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: QUESTION GENERATOR STUDIO */}
      {tab === "questions" && (
        <div className="surface-card space-y-4 p-5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-base font-bold text-foreground">
              Question Generator Studio
            </h3>
            <div className="flex gap-1.5">
              {(["cloze", "mcq", "short"] as const).map((fmt) => (
                <Button
                  key={fmt}
                  type="button"
                  size="sm"
                  variant={qGenFormat === fmt ? "glow" : "outline"}
                  onClick={() => setQGenFormat(fmt)}
                  className="h-7 text-xs uppercase"
                >
                  {fmt}
                </Button>
              ))}
            </div>
          </div>
          <Textarea
            rows={3}
            value={qGenSource}
            onChange={(e) => setQGenSource(e.target.value)}
            placeholder="Paste study sentences to generate Cloze, MCQ, or Short Recall checks..."
            className="text-xs"
          />
          <div className="space-y-2.5">
            {generatedQuestions.map((gq) => {
              const revealed = revealedGenIds.includes(gq.id);
              return (
                <div
                  key={gq.id}
                  className="space-y-1.5 rounded-xl border border-border bg-surface-2 p-3.5"
                >
                  <div className="font-semibold text-foreground">{gq.prompt}</div>
                  {gq.options && (
                    <div className="flex flex-wrap gap-1.5 text-[0.7rem] text-muted-foreground">
                      {gq.options.map((o) => (
                        <span
                          key={o}
                          className="rounded border border-border bg-surface px-2 py-0.5"
                        >
                          {o}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[0.68rem] text-muted-foreground">{gq.hint}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-6 text-[0.68rem]"
                      onClick={() =>
                        setRevealedGenIds((prev) =>
                          prev.includes(gq.id) ? prev : [...prev, gq.id],
                        )
                      }
                    >
                      {revealed ? gq.correctAnswer : "Reveal Answer"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 8: FEYNMAN / EXPLAIN IT BACK */}
      {tab === "feynman" && (
        <div className="surface-card space-y-4 p-5 text-xs">
          <h3 className="font-display text-base font-bold text-foreground">
            Explain It Back (Feynman Concept Verifier)
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              value={feynmanTopic}
              onChange={(e) => setFeynmanTopic(e.target.value)}
              placeholder="Concept Title"
              className="text-xs"
            />
            <Input
              value={feynmanKeywords}
              onChange={(e) => setFeynmanKeywords(e.target.value)}
              placeholder="Comma-separated core concepts (e.g. recall, spacing, sleep)"
              className="text-xs"
            />
          </div>
          <Textarea
            rows={4}
            value={feynmanText}
            onChange={(e) => setFeynmanText(e.target.value)}
            placeholder="Explain this concept as simply as possible in your own words, including 'because' or an example..."
            className="text-xs"
          />
          {feynmanEval && (
            <div className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-foreground">
                  Clarity &amp; Concept Coverage Score
                </span>
                <span className="font-mono text-base font-bold text-primary">
                  {feynmanEval.scorePct}%
                </span>
              </div>
              <p className="text-foreground">{feynmanEval.clarityFeedback}</p>
              {feynmanEval.missingKeywords.length > 0 && (
                <p className="text-xp">
                  Missing ideas to weave in: {feynmanEval.missingKeywords.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 9: PERSONAL KNOWLEDGE LIBRARY */}
      {tab === "library" && (
        <div className="surface-card space-y-4 p-5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Personal Knowledge Library &amp; Offline Packs
              </h3>
              <p className="text-muted-foreground">
                Search saved summaries, AI notes, and pinned offline study packs (
                {state.knowledgeLibrary.length} items).
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={offlineOnly ? "glow" : "outline"}
                onClick={() => setOfflineOnly((o) => !o)}
                className="h-8 text-xs"
              >
                <WifiOff className="size-3.5" />
                <span>Offline Pinned Only</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleExportLibraryJson}
                className="h-8 text-xs"
              >
                <Download className="size-3.5" />
                <span>Export Ecosystem JSON</span>
              </Button>
            </div>
          </div>

          <Input
            value={libSearch}
            onChange={(e) => setLibSearch(e.target.value)}
            placeholder="Search library titles, tags, or notes..."
            className="text-xs"
          />

          {filteredLibrary.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              Save transformed notes or AI Tutor insights here for instant offline search.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredLibrary.map((entry) => (
                <div
                  key={entry.id}
                  className="space-y-2 rounded-xl border border-border bg-surface-2 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[0.65rem] font-bold uppercase text-primary">
                        {entry.sourceType.replace("_", " ")} · {entry.subject}
                      </span>
                      <h4 className="font-display text-sm font-bold text-foreground">
                        {entry.title}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        update((prev) => ({
                          ...prev,
                          knowledgeLibrary: prev.knowledgeLibrary.map((x) =>
                            x.id === entry.id ? { ...x, pinnedOffline: !x.pinnedOffline } : x,
                          ),
                        }))
                      }
                      className="text-primary hover:underline"
                      title="Toggle offline pin"
                    >
                      {entry.pinnedOffline ? (
                        <Pin className="size-3.5" />
                      ) : (
                        <PinOff className="size-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap text-muted-foreground line-clamp-4">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
