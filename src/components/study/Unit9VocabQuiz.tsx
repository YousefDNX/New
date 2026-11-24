import { useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Flame,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  GRADE_9_UNIT_9_WORDS,
  UNIT_9_INTERACTIVE_QUIZ_QUESTIONS,
  type Unit9QuizQuestionItem,
} from "@/data/grade9-unit9-vocab";
import { awardXpIfUnique, useUser } from "@/hooks/use-nexora";
import { speakEnglishText } from "@/lib/english-speech";
import { usePrefs } from "@/lib/preferences";
import { buildEventDocId } from "@/lib/xp-rules";

type QuizFilterMode = "all" | "quick" | "context" | "meaning";

export function Unit9VocabQuiz({ onBackToFlashcards }: { onBackToFlashcards?: () => void }) {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { data: user } = useUser();

  const [filterMode, setFilterMode] = useState<QuizFilterMode>("all");
  const [customRetryIds, setCustomRetryIds] = useState<string[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const questions: Unit9QuizQuestionItem[] = useMemo(() => {
    if (customRetryIds && customRetryIds.length > 0) {
      const retrySet = new Set(customRetryIds);
      return UNIT_9_INTERACTIVE_QUIZ_QUESTIONS.filter((q) => retrySet.has(q.id));
    }
    if (filterMode === "quick") {
      return UNIT_9_INTERACTIVE_QUIZ_QUESTIONS.slice(0, 8);
    }
    if (filterMode === "context") {
      return UNIT_9_INTERACTIVE_QUIZ_QUESTIONS.filter((q) => q.category === "context");
    }
    if (filterMode === "meaning") {
      return UNIT_9_INTERACTIVE_QUIZ_QUESTIONS.filter(
        (q) => q.category === "meaning" || q.category === "arabic" || q.category === "synonym",
      );
    }
    return UNIT_9_INTERACTIVE_QUIZ_QUESTIONS;
  }, [filterMode, customRetryIds]);

  const currentQuestion = questions[currentIndex];
  const currentVocabWord = currentQuestion
    ? GRADE_9_UNIT_9_WORDS.find((w) => w.word.toLowerCase() === currentQuestion.word.toLowerCase())
    : undefined;

  const chosenIndex = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;
  const hasAnsweredCurrent = chosenIndex !== undefined;
  const isCurrentCorrect =
    hasAnsweredCurrent && currentQuestion ? chosenIndex === currentQuestion.correctIndex : false;

  const correctCount = useMemo(() => {
    return questions.reduce((acc, q) => {
      return selectedAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
    }, 0);
  }, [questions, selectedAnswers]);

  const answeredCount = useMemo(() => {
    return questions.filter((q) => selectedAnswers[q.id] !== undefined).length;
  }, [questions, selectedAnswers]);

  const resetQuiz = (nextMode?: QuizFilterMode, retryIds: string[] | null = null) => {
    if (nextMode) setFilterMode(nextMode);
    setCustomRetryIds(retryIds);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setStreak(0);
    setBestStreak(0);
    setIsCompleted(false);
  };

  const handleSelectOption = (optionIdx: number) => {
    if (!currentQuestion || hasAnsweredCurrent) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIdx,
    }));

    const isRight = optionIdx === currentQuestion.correctIndex;
    if (isRight) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);
    } else {
      setStreak(0);
    }
  };

  const handleNextOrFinish = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    setIsCompleted(true);
    const total = questions.length;
    const scorePct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    if (user?.uid && scorePct >= 70) {
      try {
        await awardXpIfUnique({
          userId: user.uid,
          eventDocId: buildEventDocId(
            user.uid,
            "QUIZ_COMPLETED",
            `unit9-interactive-${filterMode}`,
            new Date().toISOString().slice(0, 10),
          ),
          eventType: "QUIZ_COMPLETED",
          area: "academic",
          xpReward: total >= 12 ? 100 : 60,
          refId: `unit9-interactive-${filterMode}`,
          nowIso: new Date().toISOString(),
        });
        toast.success(
          isAr
            ? `أحسنت! تمت إضافة نقاط الخبرة الأكاديمية.`
            : `Great score (${scorePct}%)! Academic XP awarded.`,
        );
      } catch {
        // Non-blocking XP sync
      }
    }
  };

  const handlePronounceWord = (word: string) => {
    const ok = speakEnglishText(word, { rate: 0.9, lang: "en-GB" });
    if (!ok) {
      toast.info(`Pronunciation: ${word}`);
    }
  };

  const missedQuestionIds = useMemo(() => {
    return questions.filter((q) => selectedAnswers[q.id] !== q.correctIndex).map((q) => q.id);
  }, [questions, selectedAnswers]);

  const categoryLabel = (cat: Unit9QuizQuestionItem["category"]) => {
    if (cat === "arabic") return isAr ? "المعنى بالعربية" : "Arabic Meaning";
    if (cat === "context") return isAr ? "سياق الجملة" : "Sentence Context";
    if (cat === "synonym") return isAr ? "المرادفات" : "Synonym Match";
    return isAr ? "تعريف الكلمة" : "Word Definition";
  };

  return (
    <section data-testid="unit9-interactive-quiz" className="mx-auto max-w-3xl space-y-5">
      {/* Quiz Header & Mode Switcher */}
      <div className="surface-card rounded-2xl border border-primary/25 p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
              <Sparkles className="size-3.5" />
              <span>
                {isAr ? "اختبار الوحدة التاسعة التفاعلي" : "Unit 9 Interactive Vocabulary Quiz"}
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
              {isAr
                ? "العلوم والتكنولوجيا وابتكارات المستقبل"
                : "Science, Technology & Future Innovations"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "اختر الإجابة الصحيحة للحصول على تصحيح فوري وشرح مبسّط لكل سؤال."
                : "Select an answer to receive immediate feedback, Arabic translation, and explanation."}
            </p>
          </div>

          {onBackToFlashcards && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBackToFlashcards}
              className="text-xs font-semibold cursor-pointer"
            >
              {isAr ? "عرض بطاقات الوحدة ٩" : "View Unit 9 Flashcards"}
            </Button>
          )}
        </div>

        {/* Mode Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {(
            [
              { id: "all", labelEn: "Full Quiz (16)", labelAr: "الاختبار الكامل (١٦)" },
              { id: "quick", labelEn: "Quick Sprint (8)", labelAr: "اختبار سريع (٨)" },
              { id: "context", labelEn: "Sentence Context", labelAr: "إكمال الجمل" },
              { id: "meaning", labelEn: "Meanings & Arabic", labelAr: "المعاني والترجمة" },
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => resetQuiz(mode.id, null)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                !customRetryIds && filterMode === mode.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface-2 text-muted-foreground hover:text-foreground"
              }`}
            >
              {isAr ? mode.labelAr : mode.labelEn}
            </button>
          ))}
        </div>

        {/* Live Stats Strip */}
        <div className="grid grid-cols-3 gap-2.5 border-t border-border/60 pt-3">
          <div className="rounded-xl bg-surface-2/70 px-3 py-2 text-center">
            <div className="text-[11px] text-muted-foreground">{isAr ? "التقدم" : "Progress"}</div>
            <div className="font-mono text-sm font-bold text-foreground">
              {Math.min(currentIndex + 1, questions.length)} / {questions.length}
            </div>
          </div>

          <div className="rounded-xl bg-surface-2/70 px-3 py-2 text-center">
            <div className="text-[11px] text-muted-foreground">
              {isAr ? "النتيجة الحالية" : "Score"}
            </div>
            <div className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {correctCount} / {answeredCount}
            </div>
          </div>

          <div className="rounded-xl bg-surface-2/70 px-3 py-2 text-center">
            <div className="text-[11px] text-muted-foreground">
              {isAr ? "سلسلة الإجابات" : "Streak"}
            </div>
            <div className="inline-flex items-center justify-center gap-1 font-mono text-sm font-bold text-amber-500">
              <Flame className="size-3.5" />
              <span>{streak}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Quiz Body or Completion Summary */}
      {!isCompleted && currentQuestion ? (
        <div className="surface-card rounded-2xl border border-border/80 p-5 sm:p-7 space-y-5 shadow-md">
          {/* Progress Bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Metadata & Audio */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                {categoryLabel(currentQuestion.category)}
              </span>
              <span className="font-mono text-xs text-muted-foreground">#{currentIndex + 1}</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePronounceWord(currentQuestion.word)}
              className="h-8 gap-1.5 rounded-full text-xs font-semibold cursor-pointer"
            >
              <Volume2 className="size-3.5 text-primary" />
              <span>
                {isAr ? `نطق: ${currentQuestion.word}` : `Listen: "${currentQuestion.word}"`}
              </span>
            </Button>
          </div>

          {/* Question Prompt */}
          <div className="space-y-2">
            <h3 className="font-display text-lg sm:text-xl font-bold text-foreground leading-snug">
              {currentQuestion.question}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-arabic" dir="rtl">
              {currentQuestion.questionAr}
            </p>
          </div>

          {/* 4 Multiple-Choice Options */}
          <div className="grid gap-2.5" role="radiogroup" aria-label={currentQuestion.question}>
            {currentQuestion.options.map((option, idx) => {
              const isSelected = chosenIndex === idx;
              const isCorrectOption = idx === currentQuestion.correctIndex;

              let styleClass =
                "border-border/80 bg-surface-2/40 hover:bg-surface-2 hover:border-primary/40 text-foreground";
              if (hasAnsweredCurrent) {
                if (isCorrectOption) {
                  styleClass =
                    "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold";
                } else if (isSelected) {
                  styleClass =
                    "border-destructive bg-destructive/15 text-destructive font-semibold";
                } else {
                  styleClass = "border-border/50 bg-surface-2/20 text-muted-foreground opacity-70";
                }
              }

              return (
                <button
                  key={`${currentQuestion.id}-opt-${idx}`}
                  type="button"
                  disabled={hasAnsweredCurrent}
                  onClick={() => handleSelectOption(idx)}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 text-start text-sm transition-all ${
                    hasAnsweredCurrent ? "cursor-default" : "cursor-pointer"
                  } ${styleClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-current/25 font-mono text-xs font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug">{option}</span>
                  </div>

                  {hasAnsweredCurrent && isCorrectOption && (
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {hasAnsweredCurrent && isSelected && !isCorrectOption && (
                    <XCircle className="size-5 shrink-0 text-destructive" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Immediate Feedback Card */}
          {hasAnsweredCurrent && (
            <div
              role="status"
              data-testid="unit9-immediate-feedback"
              className={`rounded-xl border p-4 space-y-2.5 animate-in fade-in-50 duration-200 ${
                isCurrentCorrect
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-amber-500/40 bg-amber-500/10"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {isCurrentCorrect ? (
                    <>
                      <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-300">
                        {isAr ? "إجابة صحيحة! أحسنت" : "Correct! Great job"}
                      </span>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="size-4.5 text-amber-600 dark:text-amber-400" />
                      <span className="text-amber-700 dark:text-amber-300">
                        {isAr
                          ? "ليست الإجابة الصحيحة — تعلّم القاعدة الآن"
                          : "Not quite — review the explanation"}
                      </span>
                    </>
                  )}
                </div>

                {currentVocabWord && (
                  <span className="rounded-md bg-background/70 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                    {currentVocabWord.word} ({currentVocabWord.phonetic}) —{" "}
                    <span className="font-arabic text-primary">{currentVocabWord.meaningAr}</span>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                {currentQuestion.explanation}
              </p>
              <p className="text-xs text-muted-foreground font-arabic" dir="rtl">
                {currentQuestion.explanationAr}
              </p>

              <div className="pt-1">
                <Button
                  type="button"
                  variant="glow"
                  size="sm"
                  onClick={() => void handleNextOrFinish()}
                  className="w-full sm:w-auto gap-1.5 font-bold cursor-pointer"
                >
                  <span>
                    {currentIndex < questions.length - 1
                      ? isAr
                        ? "السؤال التالي"
                        : "Next Question"
                      : isAr
                        ? "عرض النتيجة النهائية"
                        : "Finish & See Results"}
                  </span>
                  <ArrowRight className="size-4 rtl-flip" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Completion Summary Card */
        <div
          data-testid="unit9-quiz-summary"
          className="surface-card rounded-2xl border border-primary/30 p-6 sm:p-8 space-y-6 text-center"
        >
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Trophy className="size-8" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-2xl font-extrabold text-foreground">
              {isAr ? "اكتمل اختبار الوحدة التاسعة!" : "Unit 9 Quiz Complete!"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isAr
                ? `أجبت بشكل صحيح على ${correctCount} من أصل ${questions.length} سؤالاً.`
                : `You answered ${correctCount} out of ${questions.length} questions correctly.`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="rounded-xl border border-border bg-surface-2/60 p-3">
              <div className="text-[11px] text-muted-foreground">
                {isAr ? "النسبة" : "Accuracy"}
              </div>
              <div className="font-display text-xl font-black text-primary">
                {questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0}%
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface-2/60 p-3">
              <div className="text-[11px] text-muted-foreground">
                {isAr ? "أطول سلسلة" : "Best Streak"}
              </div>
              <div className="font-display text-xl font-black text-amber-500">{bestStreak}</div>
            </div>
            <div className="rounded-xl border border-border bg-surface-2/60 p-3">
              <div className="text-[11px] text-muted-foreground">
                {isAr ? "للمراجعة" : "To Review"}
              </div>
              <div className="font-display text-xl font-black text-foreground">
                {missedQuestionIds.length}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {missedQuestionIds.length > 0 && (
              <Button
                type="button"
                variant="glow"
                onClick={() => resetQuiz(undefined, missedQuestionIds)}
                className="gap-2 font-bold cursor-pointer"
              >
                <Award className="size-4" />
                <span>
                  {isAr
                    ? `أعد التدرب على الأسئلة الفائتة (${missedQuestionIds.length})`
                    : `Practice Missed Questions (${missedQuestionIds.length})`}
                </span>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => resetQuiz(filterMode, null)}
              className="gap-2 font-semibold cursor-pointer"
            >
              <RotateCcw className="size-4" />
              <span>{isAr ? "إعادة الاختبار كاملاً" : "Retake Full Quiz"}</span>
            </Button>
          </div>

          {/* Review List */}
          <div className="space-y-2 pt-4 border-t border-border/70 text-start">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {isAr ? "ملخص الإجابات والشرح:" : "Question-by-Question Review:"}
            </div>
            <div className="grid gap-2 max-h-72 overflow-y-auto pr-1">
              {questions.map((q, i) => {
                const picked = selectedAnswers[q.id];
                const right = picked === q.correctIndex;
                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border p-3 text-xs space-y-1 ${
                      right
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-destructive/30 bg-destructive/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-semibold">
                      <span>
                        {i + 1}. {q.word} — {q.question}
                      </span>
                      {right ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                      ) : (
                        <XCircle className="size-4 shrink-0 text-destructive" />
                      )}
                    </div>
                    <div className="text-muted-foreground">
                      {isAr ? "الإجابة الصحيحة: " : "Correct answer: "}
                      <span className="font-semibold text-foreground">
                        {q.options[q.correctIndex]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
