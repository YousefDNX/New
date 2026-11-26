import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Info,
  RotateCcw,
  Volume2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LEVEL_MASTERY_EXAMS, type LevelMasteryExam } from "@/data/english-curriculum";
import { PLACEMENT_ASSESSMENT_QUESTIONS } from "@/data/skill-academy";
import { computeEnglishRecommendations, type EnglishWorldState } from "@/lib/english-world";
import { isSpeechSynthesisAvailable, speakEnglishText } from "@/lib/english-speech";
import { playCorrectSound, playIncorrectSound } from "@/lib/sound-effects";
import { BRAND } from "@/config/brand";

export function PlacementAndAssessmentsView({
  englishState,
  onSubmitPlacement,
  onSkipPlacement,
  onSubmitLevelExam,
}: {
  englishState: EnglishWorldState;
  onSubmitPlacement: (input: { answers: Record<string, number>; writingSample: string }) => void;
  onSkipPlacement: () => void;
  onSubmitLevelExam: (exam: LevelMasteryExam, scorePct: number, passed: boolean) => void;
}) {
  const [subMode, setSubMode] = useState<"placement" | "exams">("placement");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [writingSample, setWritingSample] = useState("");
  const [revealedTranscripts, setRevealedTranscripts] = useState<Record<string, boolean>>({});
  const [showPlacementForm, setShowPlacementForm] = useState(
    englishState.placementHistory.length === 0,
  );

  // Level Mastery Exams state
  const [selectedExamId, setSelectedExamId] = useState(LEVEL_MASTERY_EXAMS[0]!.id);
  const [examChoices, setExamChoices] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);

  const answeredCount = useMemo(
    () => PLACEMENT_ASSESSMENT_QUESTIONS.filter((q) => typeof answers[q.id] === "number").length,
    [answers],
  );

  const latestPlacement =
    englishState.placementHistory.length > 0
      ? englishState.placementHistory[englishState.placementHistory.length - 1]
      : null;

  const previousPlacement =
    englishState.placementHistory.length > 1
      ? englishState.placementHistory[englishState.placementHistory.length - 2]
      : null;

  const activeExam =
    LEVEL_MASTERY_EXAMS.find((e) => e.id === selectedExamId) ?? LEVEL_MASTERY_EXAMS[0]!;

  const examCorrectCount = activeExam.questions.reduce(
    (acc, q) => (examChoices[q.id] === q.correctIndex ? acc + 1 : acc),
    0,
  );
  const examScorePct = Math.round((examCorrectCount / activeExam.questions.length) * 100);
  const examPassed = examScorePct >= activeExam.passingPct;

  return (
    <div className="space-y-5">
      {/* Sub-mode Toggle */}
      <div className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={subMode === "placement" ? "glow" : "outline"}
            onClick={() => setSubMode("placement")}
            className="min-h-[44px] gap-1.5 text-xs"
          >
            <ClipboardCheck className="size-3.5" />
            <span>Initial & Retake Placement Diagnostic</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={subMode === "exams" ? "glow" : "outline"}
            onClick={() => setSubMode("exams")}
            className="min-h-[44px] gap-1.5 text-xs"
          >
            <Award className="size-3.5" />
            <span>Level Mastery Exams & Certificates ({LEVEL_MASTERY_EXAMS.length})</span>
          </Button>
        </div>

        <span className="text-xs text-muted-foreground">
          {englishState.placementHistory.length} placement attempt
          {englishState.placementHistory.length === 1 ? "" : "s"} saved
        </span>
      </div>

      {/* SECTION A: PLACEMENT DIAGNOSTIC */}
      {subMode === "placement" && (
        <div className="space-y-5">
          {/* Disclaimer Banner */}
          <div className="flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-xs text-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <strong>Informal Diagnostic Placement Indicator (Pre-A1 to C2):</strong> Evaluates
              Vocabulary, Grammar, Reading, Listening, Writing construction, and
              Speaking/Communication independently to guide your personal study plan. It is an
              internal educational benchmark—not an official external CEFR certification.
            </div>
          </div>

          {englishState.placementSkipped && !latestPlacement && (
            <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface-2 p-3.5 text-xs text-foreground">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <strong>Placement Currently Postponed:</strong> You are free to browse all
                Foundation and unlocked Adventure Map lessons immediately. Keep in mind that
                adaptive recommendations remain broader until you complete the diagnostic.
              </div>
            </div>
          )}

          {/* Latest Placement Summary + Retake History Comparison */}
          {latestPlacement && (
            <div className="surface-card space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Latest Placement Snapshot ·{" "}
                    {new Date(latestPlacement.completedAt).toLocaleDateString()}
                  </div>
                  <h4 className="mt-1 font-display text-lg font-bold text-foreground">
                    Estimated Level: {latestPlacement.overallBand} (
                    {latestPlacement.overallScorePct}%)
                    {previousPlacement && (
                      <span className="ml-2 text-xs font-medium text-muted-foreground">
                        (vs previous attempt: {previousPlacement.overallBand} ·{" "}
                        {previousPlacement.overallScorePct}%)
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground">{latestPlacement.summaryNote}</p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant={showPlacementForm ? "outline" : "glow"}
                  onClick={() => setShowPlacementForm((v) => !v)}
                  className="min-h-[40px] gap-1.5 text-xs"
                >
                  <RotateCcw className="size-3.5" />
                  <span>
                    {showPlacementForm ? "Hide Diagnostic Questions" : "Retake & Compare"}
                  </span>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {latestPlacement.dimensionScores.map((dim) => {
                  const prevDim = previousPlacement?.dimensionScores.find(
                    (p) => p.dimension === dim.dimension,
                  );
                  const delta = prevDim ? dim.scorePct - prevDim.scorePct : null;
                  return (
                    <div
                      key={dim.dimension}
                      className="rounded-lg border border-border bg-surface-2 p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                        <span>{dim.label}</span>
                        <span className="text-primary">
                          {dim.band} · {dim.scorePct}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${dim.scorePct}%` }}
                        />
                      </div>
                      {delta !== null && (
                        <div className="text-[11px] text-muted-foreground">
                          Change since previous attempt:{" "}
                          <strong className={delta >= 0 ? "text-success" : "text-destructive"}>
                            {delta >= 0 ? `+${delta}%` : `${delta}%`}
                          </strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {latestPlacement.writingPromptScorePct !== null && (
                <p className="text-xs text-muted-foreground">
                  Diagnostic Writing Sample Score:{" "}
                  <strong>{latestPlacement.writingPromptScorePct}%</strong>
                </p>
              )}

              {/* Initial Personalized Learning Path Generated From Placement */}
              <div className="rounded-xl border border-primary/25 bg-primary/5 p-3.5 space-y-2">
                <div className="text-xs font-bold text-primary">
                  Your Initial Personalized {BRAND.shortName} Learning Path (Starting Tier:{" "}
                  {latestPlacement.startingLevelId})
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {computeEnglishRecommendations(englishState)
                    .slice(0, 4)
                    .map((rec, idx) => (
                      <div
                        key={rec.id}
                        className="rounded-lg border border-border bg-surface p-2.5 text-xs"
                      >
                        <div className="font-semibold text-foreground">
                          {idx + 1}. {rec.title}
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {rec.whyRecommended}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Full Placement Test Form */}
          {showPlacementForm && (
            <div className="surface-card space-y-5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <h4 className="font-display text-base font-bold text-foreground">
                    Progressive Placement Check ({PLACEMENT_ASSESSMENT_QUESTIONS.length} Items +
                    Writing Sample)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Answered: {answeredCount}/{PLACEMENT_ASSESSMENT_QUESTIONS.length} objective
                    items
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onSkipPlacement();
                    setShowPlacementForm(false);
                  }}
                  className="min-h-[40px] text-xs"
                >
                  Skip / Take Later
                </Button>
              </div>

              <div className="space-y-4">
                {PLACEMENT_ASSESSMENT_QUESTIONS.map((q, idx) => (
                  <div
                    key={q.id}
                    className="rounded-lg border border-border bg-surface-2 p-3.5 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium text-muted-foreground">
                      <span>
                        Item {idx + 1} (
                        {idx % 4 === 0
                          ? "A1–A2"
                          : idx % 4 === 1
                            ? "B1"
                            : idx % 4 === 2
                              ? "B2"
                              : "C1"}
                        ) · {q.skillLabel}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {q.audioScript && isSpeechSynthesisAvailable() && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => speakEnglishText(q.audioScript ?? "")}
                            className="min-h-[38px] gap-1 text-[11px]"
                          >
                            <Volume2 className="size-3" />
                            <span>Play Audio</span>
                          </Button>
                        )}
                        {q.audioScript && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setRevealedTranscripts((prev) => ({
                                ...prev,
                                [q.id]: !prev[q.id],
                              }))
                            }
                            className="min-h-[38px] text-[11px]"
                          >
                            {revealedTranscripts[q.id]
                              ? "Hide Transcript"
                              : "Show Transcript Fallback"}
                          </Button>
                        )}
                      </div>
                    </div>
                    {q.passage && (
                      <blockquote className="rounded border border-border bg-surface p-2.5 text-xs text-foreground">
                        {q.passage}
                      </blockquote>
                    )}
                    {q.audioScript && revealedTranscripts[q.id] && (
                      <p className="rounded border border-border bg-surface p-2 text-[11px] text-muted-foreground">
                        Audio transcript fallback: &ldquo;{q.audioScript}&rdquo;
                      </p>
                    )}
                    <p className="text-sm font-medium text-foreground">{q.prompt}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: oIdx }))}
                          className={`min-h-[44px] rounded-lg border px-3 py-2 text-start text-xs font-medium transition-colors ${
                            answers[q.id] === oIdx
                              ? "border-primary bg-primary/15 text-primary font-semibold"
                              : "border-border bg-surface text-foreground hover:border-primary/40"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Integrated Writing Construction Prompt */}
              <div className="rounded-xl border border-border bg-surface-2 p-4 space-y-2">
                <label htmlFor="pl-writing" className="block text-sm font-bold text-foreground">
                  Diagnostic Writing Sample (Optional but increases accuracy)
                </label>
                <p className="text-xs text-muted-foreground">
                  Write 2–4 connected sentences explaining why learning English matters for your
                  school goals or future career.
                </p>
                <Textarea
                  id="pl-writing"
                  value={writingSample}
                  onChange={(e) => setWritingSample(e.target.value)}
                  rows={4}
                  placeholder="Write 2–4 sentences here..."
                  className="text-sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="glow"
                  onClick={() => {
                    onSubmitPlacement({ answers, writingSample });
                    setShowPlacementForm(false);
                  }}
                  className="min-h-[44px]"
                >
                  Complete Placement & Generate My Learning Plan
                </Button>
                <span className="text-xs text-muted-foreground">
                  You can skip or retake anytime to compare growth across months.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION B: LEVEL MASTERY EXAMS & INTERNAL CERTIFICATES */}
      {subMode === "exams" && (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="surface-card space-y-2 p-4 lg:col-span-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Unit & Level Mastery Exams
            </div>
            {LEVEL_MASTERY_EXAMS.map((exam) => {
              const active = exam.id === activeExam.id;
              const best = englishState.examScores[exam.id];
              const passedBefore = typeof best === "number" && best >= exam.passingPct;
              return (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => {
                    setSelectedExamId(exam.id);
                    setExamChoices({});
                    setExamSubmitted(false);
                  }}
                  className={`flex min-h-[44px] w-full flex-col rounded-lg border px-3 py-2.5 text-start transition-colors ${
                    active
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface-2 hover:border-primary/40"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2 text-xs font-semibold text-foreground">
                    <span>{exam.title}</span>
                    {passedBefore && <CheckCircle2 className="size-4 shrink-0 text-success" />}
                  </div>
                  <span className="mt-0.5 text-[11px] text-muted-foreground">
                    Pass mark: {exam.passingPct}%
                    {typeof best === "number" ? ` · Best: ${best}%` : ""}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="surface-card space-y-4 p-5 lg:col-span-8">
            <div className="border-b border-border pb-3">
              <div className="text-xs font-medium text-primary">
                Pass at {activeExam.passingPct}%+ to earn: {activeExam.certificateTitle}
              </div>
              <h4 className="mt-1 font-display text-lg font-bold text-foreground">
                {activeExam.title}
              </h4>
              <p className="text-xs text-muted-foreground">{activeExam.description}</p>
            </div>

            {activeExam.questions.map((q, idx) => {
              const chosen = examChoices[q.id];
              const ok = examSubmitted && chosen === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className="rounded-lg border border-border bg-surface-2 p-3.5 space-y-2"
                >
                  <div className="text-[11px] font-medium text-muted-foreground">
                    Question {idx + 1} · {q.skill}
                  </div>
                  {q.passage && (
                    <blockquote className="rounded border border-border bg-surface p-2.5 text-xs text-foreground">
                      {q.passage}
                    </blockquote>
                  )}
                  <p className="text-sm font-medium text-foreground">{q.prompt}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        type="button"
                        disabled={examSubmitted}
                        onClick={() => setExamChoices((prev) => ({ ...prev, [q.id]: oIdx }))}
                        className={`min-h-[44px] rounded-lg border px-3 py-2 text-start text-xs font-medium transition-colors ${
                          chosen === oIdx
                            ? "border-primary bg-primary/15 text-primary font-semibold"
                            : "border-border bg-surface text-foreground hover:border-primary/40"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {examSubmitted && (
                    <div
                      className={`rounded-lg border p-2.5 text-xs ${
                        ok
                          ? "border-success/40 bg-success/10"
                          : "border-destructive/40 bg-destructive/10"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        {ok ? (
                          <>
                            <CheckCircle2 className="size-3.5 text-success" />
                            <span>Accurate!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="size-3.5 text-destructive" />
                            <span>Correct answer: {q.options[q.correctIndex]}</span>
                          </>
                        )}
                      </div>
                      <p className="mt-1 text-muted-foreground">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {!examSubmitted ? (
              <Button
                type="button"
                variant="glow"
                onClick={() => {
                  setExamSubmitted(true);
                  if (examPassed) playCorrectSound();
                  else playIncorrectSound();
                  onSubmitLevelExam(activeExam, examScorePct, examPassed);
                }}
                className="min-h-[44px]"
              >
                Submit Level Assessment
              </Button>
            ) : (
              <div
                className={`rounded-xl border p-4 space-y-2 ${
                  examPassed ? "border-success/40 bg-success/10" : "border-primary/40 bg-primary/10"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-foreground">
                    Result: {examScorePct}% ({examCorrectCount}/{activeExam.questions.length})
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setExamChoices({});
                      setExamSubmitted(false);
                    }}
                    className="min-h-[40px] text-xs"
                  >
                    Retake Exam
                  </Button>
                </div>
                <p className="text-xs text-foreground">
                  {examPassed
                    ? `Congratulations! Earned internal completion certificate: ${activeExam.certificateTitle}. View it inside Dashboard & Certificates.`
                    : `Scored below ${activeExam.passingPct}% pass threshold. Review explanations above and practice the linked academies before retrying.`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
