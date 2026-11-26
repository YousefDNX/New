import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Lightbulb,
  RotateCcw,
  Volume2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CURRICULUM_LEVELS,
  CURRICULUM_LESSONS,
  type AcademyWorkspaceId,
  type CurriculumLevelId,
  type EnglishLesson,
} from "@/data/english-curriculum";
import { AskYourLessonPanel } from "@/components/common/AskYourLessonPanel";
import { gradeLessonExercise, type EnglishWorldState } from "@/lib/english-world";
import { isSpeechSynthesisAvailable, speakEnglishText } from "@/lib/english-speech";
import { playCorrectSound, playIncorrectSound } from "@/lib/sound-effects";

export function CurriculumLessonPlayer({
  englishState,
  initialLessonId,
  onCompleteLesson,
  onRecordMistake,
  onOpenAcademy,
}: {
  englishState: EnglishWorldState;
  initialLessonId?: string | null;
  onCompleteLesson: (input: { lesson: EnglishLesson; scorePct: number; passed: boolean }) => void;
  onRecordMistake: (input: {
    skill: AcademyWorkspaceId;
    itemTitle: string;
    prompt: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
  }) => void;
  onOpenAcademy: (academy: AcademyWorkspaceId) => void;
}) {
  const defaultLesson =
    CURRICULUM_LESSONS.find((l) => l.id === initialLessonId) ?? CURRICULUM_LESSONS[0]!;

  const [selectedLevel, setSelectedLevel] = useState<CurriculumLevelId>(defaultLesson.levelId);
  const [activeLessonId, setActiveLessonId] = useState<string>(defaultLesson.id);

  // Interactive player state per lesson
  const [guidedIndex, setGuidedIndex] = useState<number | null>(null);
  const [guidedText, setGuidedText] = useState("");
  const [guidedChecked, setGuidedChecked] = useState(false);

  const [exerciseChoiceMap, setExerciseChoiceMap] = useState<Record<string, number>>({});
  const [exerciseTextMap, setExerciseTextMap] = useState<Record<string, string>>({});
  const [exercisesSubmitted, setExercisesSubmitted] = useState(false);

  const levelLessons = useMemo(
    () => CURRICULUM_LESSONS.filter((l) => l.levelId === selectedLevel),
    [selectedLevel],
  );

  const lesson =
    CURRICULUM_LESSONS.find((l) => l.id === activeLessonId) ??
    levelLessons[0] ??
    CURRICULUM_LESSONS[0]!;

  const selectLesson = (target: EnglishLesson) => {
    setSelectedLevel(target.levelId);
    setActiveLessonId(target.id);
    setGuidedIndex(null);
    setGuidedText("");
    setGuidedChecked(false);
    setExerciseChoiceMap({});
    setExerciseTextMap({});
    setExercisesSubmitted(false);
  };

  const guidedCorrect = guidedChecked
    ? gradeLessonExercise(lesson.guidedPractice, {
        selectedIndex: guidedIndex,
        textAnswer: guidedText,
      })
    : false;

  const exerciseResults = lesson.exercises.map((ex) => {
    const isCorrect = gradeLessonExercise(ex, {
      selectedIndex: exerciseChoiceMap[ex.id] ?? null,
      textAnswer: exerciseTextMap[ex.id] ?? "",
    });
    return { ex, isCorrect };
  });

  const correctCount = exerciseResults.filter((r) => r.isCorrect).length;
  const scorePct =
    lesson.exercises.length > 0 ? Math.round((correctCount / lesson.exercises.length) * 100) : 100;
  const passedLesson = scorePct >= lesson.minPassPct;

  const handleSubmitExercises = () => {
    setExercisesSubmitted(true);
    if (passedLesson) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
    for (const r of exerciseResults) {
      if (!r.isCorrect) {
        const expected =
          r.ex.options && typeof r.ex.correctIndex === "number"
            ? (r.ex.options[r.ex.correctIndex] ?? "")
            : (r.ex.acceptedAnswers?.[0] ?? "");
        const given =
          r.ex.options && typeof exerciseChoiceMap[r.ex.id] === "number"
            ? (r.ex.options[exerciseChoiceMap[r.ex.id]!] ?? "")
            : (exerciseTextMap[r.ex.id] ?? "(blank)");
        onRecordMistake({
          skill: lesson.skillFocus,
          itemTitle: lesson.title,
          prompt: r.ex.prompt,
          userAnswer: given,
          correctAnswer: expected,
          explanation: r.ex.explanation,
        });
      }
    }
    onCompleteLesson({ lesson, scorePct, passed: passedLesson });
  };

  const handleRetryExercises = () => {
    setExerciseChoiceMap({});
    setExerciseTextMap({});
    setExercisesSubmitted(false);
  };

  const isCompletedBefore = englishState.completedLessons.includes(lesson.id);
  const bestStoredScore = englishState.lessonScores[lesson.id];

  return (
    <div className="space-y-5">
      {/* Level Selector Strip */}
      <div className="surface-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold text-foreground">
              Structured English Curriculum (Pre-A1 Foundation → C1–C2 Mastery)
            </h3>
            <p className="text-xs text-muted-foreground">
              Every lesson is ready to start immediately—explanation, examples, guided practice,
              exercises & instant feedback included.
            </p>
          </div>
          <span className="text-xs font-semibold text-primary">
            Completed: {englishState.completedLessons.length}/{CURRICULUM_LESSONS.length} lessons
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {CURRICULUM_LEVELS.map((lvl) => {
            const active = selectedLevel === lvl.id;
            const totalInLvl = CURRICULUM_LESSONS.filter((l) => l.levelId === lvl.id).length;
            const doneInLvl = CURRICULUM_LESSONS.filter(
              (l) => l.levelId === lvl.id && englishState.completedLessons.includes(l.id),
            ).length;
            return (
              <Button
                key={lvl.id}
                type="button"
                size="sm"
                variant={active ? "glow" : "outline"}
                onClick={() => {
                  setSelectedLevel(lvl.id);
                  const first = CURRICULUM_LESSONS.find((l) => l.levelId === lvl.id);
                  if (first) selectLesson(first);
                }}
                className="min-h-[44px] whitespace-nowrap shrink-0 px-3 text-xs"
              >
                <span>
                  {lvl.code} · {lvl.title.split(" ")[0]} ({doneInLvl}/{totalInLvl})
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Lesson Workspace */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Unit & Lesson Sidebar */}
        <div className="surface-card space-y-3 p-4 lg:col-span-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {CURRICULUM_LEVELS.find((c) => c.id === selectedLevel)?.title} Units
          </div>
          <div className="space-y-2">
            {levelLessons.map((item) => {
              const active = item.id === lesson.id;
              const done = englishState.completedLessons.includes(item.id);
              const best = englishState.lessonScores[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectLesson(item)}
                  className={`flex min-h-[44px] w-full items-start justify-between gap-2 rounded-lg border px-3 py-2.5 text-start transition-colors ${
                    active
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface-2 hover:border-primary/40"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-muted-foreground">
                      {item.unitTitle}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-foreground">{item.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {item.cefrLabel} · {item.estimatedMinutes} min
                      {typeof best === "number" ? ` · Best: ${best}%` : ""}
                    </div>
                  </div>
                  {done ? (
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-success" />
                  ) : (
                    <BookOpen className="mt-1 size-4 shrink-0 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Lesson Player */}
        <div className="surface-card space-y-5 p-5 lg:col-span-8">
          {/* Header */}
          <div className="border-b border-border pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {lesson.cefrLabel} · {lesson.unitTitle} · <Clock className="mr-1 inline size-3.5" />
                {lesson.estimatedMinutes} min · +{lesson.xpReward} XP
              </span>
              {isCompletedBefore && (
                <span className="inline-flex items-center gap-1 font-semibold text-success">
                  <CheckCircle2 className="size-3.5" />
                  Completed ({bestStoredScore ?? 100}%)
                </span>
              )}
            </div>
            <h4 className="mt-1.5 font-display text-lg font-bold text-foreground">
              {lesson.title}
            </h4>
            <p className="text-xs text-muted-foreground">{lesson.titleAr}</p>
            <div className="mt-3 rounded-lg border border-border bg-surface-2 p-3 text-xs text-foreground">
              <strong>Learning Objective:</strong> {lesson.objective}
            </div>
          </div>

          {/* 1. Introduction & Explanation */}
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-foreground">{lesson.intro}</p>
            <ul className="space-y-2 text-sm text-foreground">
              {lesson.explanation.map((pt, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 leading-relaxed"
                >
                  {pt}
                </li>
              ))}
            </ul>
            <div
              className="rounded-lg border border-primary/25 bg-primary/5 p-3 text-xs text-foreground"
              dir="rtl"
            >
              <strong>جسر الفهم بالعربية:</strong> {lesson.arabicBridge}
            </div>
          </div>

          {/* 2. Authentic Annotated Examples */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Annotated Examples
            </div>
            {lesson.examples.map((ex, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-surface-2 p-3.5 space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{ex.en}</p>
                  {isSpeechSynthesisAvailable() && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => speakEnglishText(ex.en)}
                      className="min-h-[40px] gap-1.5 text-xs"
                    >
                      <Volume2 className="size-3.5" />
                      <span>Listen</span>
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground" dir="rtl">
                  {ex.ar}
                </p>
                <p className="text-xs text-primary">
                  Key pattern: {ex.highlight} — {ex.note}
                </p>
              </div>
            ))}
          </div>

          {/* 3. Guided Practice Warm-Up */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
              <Lightbulb className="size-4" />
              <span>Guided Warm-Up Check</span>
            </div>
            <p className="text-sm font-medium text-foreground">{lesson.guidedPractice.prompt}</p>
            {lesson.guidedPractice.options ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {lesson.guidedPractice.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setGuidedIndex(idx);
                      setGuidedChecked(true);
                      const ok = gradeLessonExercise(lesson.guidedPractice, {
                        selectedIndex: idx,
                        textAnswer: guidedText,
                      });
                      if (ok) playCorrectSound();
                      else playIncorrectSound();
                    }}
                    className={`min-h-[44px] rounded-lg border px-3 py-2 text-start text-xs font-medium transition-colors ${
                      guidedIndex === idx
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-surface text-foreground hover:border-primary/50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={guidedText}
                  onChange={(e) => setGuidedText(e.target.value)}
                  placeholder="Type your warm-up answer..."
                  className="text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setGuidedChecked(true);
                    const ok = gradeLessonExercise(lesson.guidedPractice, {
                      selectedIndex: guidedIndex,
                      textAnswer: guidedText,
                    });
                    if (ok) playCorrectSound();
                    else playIncorrectSound();
                  }}
                >
                  Check
                </Button>
              </div>
            )}

            {guidedChecked && (
              <div
                className={`rounded-lg border p-3 text-xs ${
                  guidedCorrect
                    ? "border-success/40 bg-success/10 text-foreground"
                    : "border-destructive/40 bg-destructive/10 text-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  {guidedCorrect ? (
                    <>
                      <CheckCircle2 className="size-4 text-success" />
                      <span>Accurate!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-4 text-destructive" />
                      <span>Hint: {lesson.guidedPractice.hint}</span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-muted-foreground">{lesson.guidedPractice.explanation}</p>
              </div>
            )}
          </div>

          {/* 4. Independent Graded Exercises */}
          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h5 className="text-sm font-bold text-foreground">
                  Independent Practice Check ({lesson.exercises.length} Items)
                </h5>
                <p className="text-xs text-muted-foreground">{lesson.completionCriteria}</p>
              </div>
              {exercisesSubmitted && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleRetryExercises}
                  className="min-h-[40px] gap-1.5 text-xs"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Retry Check</span>
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {lesson.exercises.map((ex, qIdx) => {
                const isCorrect = exercisesSubmitted
                  ? gradeLessonExercise(ex, {
                      selectedIndex: exerciseChoiceMap[ex.id] ?? null,
                      textAnswer: exerciseTextMap[ex.id] ?? "",
                    })
                  : null;
                return (
                  <div
                    key={ex.id}
                    className="rounded-lg border border-border bg-surface-2 p-3.5 space-y-2.5"
                  >
                    <div className="text-xs font-semibold text-muted-foreground">
                      Exercise {qIdx + 1} · {ex.kind.replace("_", " ")}
                    </div>
                    <p className="text-sm font-medium text-foreground">{ex.prompt}</p>

                    {ex.options ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {ex.options.map((opt, optIdx) => {
                          const chosen = exerciseChoiceMap[ex.id] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={exercisesSubmitted}
                              onClick={() =>
                                setExerciseChoiceMap((prev) => ({ ...prev, [ex.id]: optIdx }))
                              }
                              className={`min-h-[44px] rounded-lg border px-3 py-2 text-start text-xs font-medium transition-colors ${
                                chosen
                                  ? "border-primary bg-primary/15 text-primary font-semibold"
                                  : "border-border bg-surface text-foreground hover:border-primary/40"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <Input
                        value={exerciseTextMap[ex.id] ?? ""}
                        disabled={exercisesSubmitted}
                        onChange={(e) =>
                          setExerciseTextMap((prev) => ({ ...prev, [ex.id]: e.target.value }))
                        }
                        placeholder="Type your exact answer here..."
                        aria-label={`Answer for exercise ${qIdx + 1}`}
                        className="text-sm"
                      />
                    )}

                    {exercisesSubmitted && (
                      <div
                        className={`rounded-lg border p-2.5 text-xs ${
                          isCorrect
                            ? "border-success/40 bg-success/10 text-foreground"
                            : "border-destructive/40 bg-destructive/10 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-semibold">
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="size-3.5 text-success" />
                              <span>Correct!</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="size-3.5 text-destructive" />
                              <span>
                                Needs Review — Accepted:{" "}
                                {ex.options && typeof ex.correctIndex === "number"
                                  ? ex.options[ex.correctIndex]
                                  : ex.acceptedAnswers?.join(" / ")}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="mt-1 text-muted-foreground">{ex.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!exercisesSubmitted ? (
              <Button
                type="button"
                variant="glow"
                onClick={handleSubmitExercises}
                className="min-h-[44px] w-full sm:w-auto"
              >
                <span>Submit Lesson Exercises</span>
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <div
                className={`rounded-xl border p-4 space-y-2 ${
                  passedLesson
                    ? "border-success/40 bg-success/10"
                    : "border-primary/40 bg-primary/10"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-bold text-foreground">
                    Lesson Score: {scorePct}% ({correctCount}/{lesson.exercises.length})
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenAcademy(lesson.skillFocus)}
                    className="min-h-[40px] text-xs"
                  >
                    <span>Practice More in {lesson.skillFocus} Academy</span>
                  </Button>
                </div>
                <p className="text-xs text-foreground">
                  {passedLesson
                    ? `Lesson completed! ${lesson.revisionSummary}`
                    : `Scored below ${lesson.minPassPct}% completion threshold. Review the explanations above and retry when ready.`}
                </p>
              </div>
            )}

            <AskYourLessonPanel
              lessonTitle={lesson.title}
              subject="English"
              lessonText={[
                lesson.objective,
                lesson.intro,
                ...lesson.explanation,
                lesson.arabicBridge,
                lesson.revisionSummary,
              ].join("\n")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
