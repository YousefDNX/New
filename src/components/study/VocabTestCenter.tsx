import React, { useState, useMemo } from "react";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Volume2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  BookOpen,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COMPREHENSIVE_VOCAB_TEST_SUITES,
  type VocabTestSuite,
  type ExpandedQuizQuestion,
} from "@/data/grade9-expanded-vocab";
import { speakEnglishText } from "@/lib/english-speech";
import { usePrefs } from "@/lib/preferences";

export interface VocabTestCenterProps {
  onBackToStudy?: () => void;
  initialSuiteId?: string;
}

export function VocabTestCenter({ onBackToStudy, initialSuiteId }: VocabTestCenterProps) {
  const { lang } = usePrefs();
  const isAr = lang === "ar";

  const [activeSuiteId, setActiveSuiteId] = useState<string>(
    initialSuiteId ?? COMPREHENSIVE_VOCAB_TEST_SUITES[0]?.id ?? "suite-quick-10",
  );
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [onlyMissedMode, setOnlyMissedMode] = useState(false);
  const [missedQuestions, setMissedQuestions] = useState<ExpandedQuizQuestion[]>([]);

  const activeSuite: VocabTestSuite = useMemo(() => {
    return (
      COMPREHENSIVE_VOCAB_TEST_SUITES.find((s) => s.id === activeSuiteId) ??
      COMPREHENSIVE_VOCAB_TEST_SUITES[0]!
    );
  }, [activeSuiteId]);

  const activeQuestions: ExpandedQuizQuestion[] = useMemo(() => {
    if (onlyMissedMode && missedQuestions.length > 0) {
      return missedQuestions;
    }
    return activeSuite.questions;
  }, [onlyMissedMode, missedQuestions, activeSuite]);

  const currentQ: ExpandedQuizQuestion | undefined = activeQuestions[currentQIndex];
  const chosenIndex = currentQ ? selectedAnswers[currentQ.id] : undefined;
  const isAnswered = chosenIndex !== undefined;

  const handleSelectSuite = (suiteId: string) => {
    setActiveSuiteId(suiteId);
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setIsCompleted(false);
    setOnlyMissedMode(false);
    setMissedQuestions([]);
  };

  const handleChooseOption = (optIndex: number) => {
    if (!currentQ || isAnswered) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optIndex,
    }));
  };

  const handleNext = () => {
    if (currentQIndex < activeQuestions.length - 1) {
      setCurrentQIndex((i) => i + 1);
    } else {
      // Calculate missed questions
      const missed = activeQuestions.filter((q) => selectedAnswers[q.id] !== q.correctIndex);
      setMissedQuestions(missed);
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setIsCompleted(false);
    setOnlyMissedMode(false);
    setMissedQuestions([]);
  };

  const handlePracticeMissed = () => {
    if (missedQuestions.length === 0) return;
    setOnlyMissedMode(true);
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setIsCompleted(false);
  };

  const handlePronounce = (word: string, accent?: "en-US" | "en-GB") => {
    speakEnglishText(word, { rate: 0.88, accent, lang: accent });
  };

  // Score statistics
  const correctCount = activeQuestions.filter(
    (q) => selectedAnswers[q.id] === q.correctIndex,
  ).length;
  const percentage = Math.round((correctCount / Math.max(1, activeQuestions.length)) * 100);

  return (
    <div className="mx-auto max-w-4xl space-y-6" data-testid="vocab-test-center">
      {/* Test Center Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-3">
          {onBackToStudy && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBackToStudy}
              className="gap-2 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="size-4 rtl-flip" />
              <span>{isAr ? "العودة للدراسة" : "Back to Study Hub"}</span>
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 p-1 text-primary">
                <Trophy className="size-4" />
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                {isAr ? "بنك الاختبارات التفاعلية للمفردات" : "Interactive Vocabulary Test Center"}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAr
                ? "اختبارات مصممة لمساعدة الطلاب على الاستعداد والتحصيل بأسئلة فورية وشروح مفصلة."
                : "Comprehensive practice suites designed to help students master vocabulary with immediate feedback."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
            {isAr
              ? `${COMPREHENSIVE_VOCAB_TEST_SUITES.length} باقات اختبار`
              : `${COMPREHENSIVE_VOCAB_TEST_SUITES.length} Test Suites`}
          </span>
        </div>
      </div>

      {/* Test Suite Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {COMPREHENSIVE_VOCAB_TEST_SUITES.map((suite) => {
          const isActive = suite.id === activeSuiteId && !onlyMissedMode;
          return (
            <button
              key={suite.id}
              type="button"
              onClick={() => handleSelectSuite(suite.id)}
              className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                isActive
                  ? "bg-primary/10 border-primary ring-1 ring-primary shadow-xs"
                  : "bg-surface-card border-border/70 hover:border-primary/40 hover:bg-surface-2/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${suite.badgeColor}`}
                >
                  {suite.badge}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {suite.questionCount} {isAr ? "أسئلة" : "Questions"}
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">
                  {isAr ? suite.titleAr : suite.titleEn}
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  {isAr ? suite.descriptionAr : suite.descriptionEn}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Quiz Area or Results Screen */}
      {!isCompleted && currentQ && (
        <div className="surface-card rounded-2xl border border-border/80 p-5 sm:p-7 space-y-6 shadow-sm">
          {/* Progress Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary font-mono">
                {onlyMissedMode
                  ? isAr
                    ? `مراجعة الأسئلة غير المحلولة (${currentQIndex + 1}/${activeQuestions.length})`
                    : `Reviewing Mistakes (${currentQIndex + 1}/${activeQuestions.length})`
                  : `${isAr ? "سؤال" : "Question"} ${currentQIndex + 1} / ${activeQuestions.length}`}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs font-medium text-muted-foreground capitalize">
                {currentQ.category}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handlePronounce(currentQ.targetWord)}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer bg-primary/10 px-2.5 py-1 rounded-lg"
              >
                <Volume2 className="size-3.5" />
                <span>{currentQ.targetWord}</span>
              </button>
              <span className="text-xs font-mono font-bold text-foreground">
                {isAr ? `النتيجة: ${correctCount}` : `Score: ${correctCount}`}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-surface-2 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{
                width: `${((currentQIndex + (isAnswered ? 1 : 0)) / activeQuestions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Text */}
          <div className="space-y-1.5">
            <h3 className="font-display text-lg sm:text-xl font-bold text-foreground leading-snug">
              {currentQ.promptEn}
            </h3>
            {currentQ.promptAr && (
              <p className="font-arabic text-sm text-muted-foreground" dir="rtl">
                {currentQ.promptAr}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="grid gap-3" role="radiogroup">
            {currentQ.options.map((option, idx) => {
              const isSelected = chosenIndex === idx;
              const isCorrectOption = idx === currentQ.correctIndex;

              let style = "border-border/80 bg-surface-2/30 hover:bg-surface-2/70 text-foreground";
              if (isAnswered) {
                if (isCorrectOption) {
                  style =
                    "border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-bold ring-1 ring-emerald-500";
                } else if (isSelected) {
                  style = "border-destructive bg-destructive/15 text-destructive font-medium";
                } else {
                  style = "opacity-60 border-border/40 text-muted-foreground";
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleChooseOption(idx)}
                  className={`min-h-[48px] w-full p-4 rounded-xl border text-start text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-mono font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug">{option}</span>
                  </div>
                  {isAnswered && isCorrectOption && (
                    <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrectOption && (
                    <XCircle className="size-5 text-destructive shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Immediate Feedback Box */}
          {isAnswered && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2.5 transition-all ${
                chosenIndex === currentQ.correctIndex
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100"
              }`}
              data-testid="vocab-test-feedback"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  {chosenIndex === currentQ.correctIndex ? (
                    <>
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      <span>{isAr ? "إجابة ممتازة وصحيحة!" : "Correct! Excellent job!"}</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="size-4 text-amber-600" />
                      <span>
                        {isAr ? "إجابة غير دقيقة — راجع الشرح:" : "Not quite. Here is why:"}
                      </span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handlePronounce(currentQ.targetWord)}
                  className="inline-flex items-center gap-1 font-semibold hover:underline"
                >
                  <Volume2 className="size-3.5" />
                  <span>{isAr ? "استمع للكلمة" : "Listen"}</span>
                </button>
              </div>

              <div className="space-y-1 text-xs leading-relaxed">
                <p className="font-medium">{currentQ.explanationEn}</p>
                {currentQ.explanationAr && (
                  <p className="font-arabic opacity-90" dir="rtl">
                    {currentQ.explanationAr}
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="glow"
                  onClick={handleNext}
                  className="gap-2 font-bold cursor-pointer"
                >
                  <span>
                    {currentQIndex < activeQuestions.length - 1
                      ? isAr
                        ? "السؤال التالي"
                        : "Next Question"
                      : isAr
                        ? "إنهاء ورؤية النتيجة"
                        : "Finish & See Results"}
                  </span>
                  <ArrowRight className="size-4 rtl-flip" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Screen */}
      {isCompleted && (
        <div
          className="surface-card rounded-2xl border border-border/80 p-6 sm:p-8 text-center space-y-6 shadow-sm"
          data-testid="vocab-test-summary"
        >
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto ring-8 ring-primary/5">
            <Trophy className="size-8" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-2xl font-bold text-foreground">
              {percentage >= 80
                ? isAr
                  ? "أداء متميز وتفوّق باهر!"
                  : "Outstanding Performance!"
                : percentage >= 50
                  ? isAr
                    ? "عمل جيد! يمكنك الوصول للدرجة الكاملة"
                    : "Good Effort! Keep practicing for 100%"
                  : isAr
                    ? "استمر في المحاولة وراجع الكلمات"
                    : "Review the words and try again"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isAr
                ? `أجبت على ${correctCount} من إجمالي ${activeQuestions.length} سؤالاً بشكل صحيح (${percentage}%).`
                : `You scored ${correctCount} out of ${activeQuestions.length} questions correctly (${percentage}%).`}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto pt-2">
            <div className="p-3 rounded-xl bg-surface-2 border border-border/60">
              <div className="text-xl font-bold text-foreground">{correctCount}</div>
              <div className="text-[11px] text-emerald-600 font-semibold">
                {isAr ? "إجابات صحيحة" : "Correct"}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-2 border border-border/60">
              <div className="text-xl font-bold text-foreground">
                {activeQuestions.length - correctCount}
              </div>
              <div className="text-[11px] text-destructive font-semibold">
                {isAr ? "بحاجة لمراجعة" : "Missed"}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-2 border border-border/60 col-span-2 sm:col-span-1">
              <div className="text-xl font-bold text-primary">{percentage}%</div>
              <div className="text-[11px] text-muted-foreground">
                {isAr ? "النسبة المئوية" : "Accuracy"}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {missedQuestions.length > 0 && !onlyMissedMode && (
              <Button
                type="button"
                variant="glow"
                size="default"
                onClick={handlePracticeMissed}
                className="gap-2 font-bold cursor-pointer"
              >
                <Zap className="size-4" />
                <span>
                  {isAr
                    ? `تدرّب على الأخطاء فقط (${missedQuestions.length} أسئلة)`
                    : `Practice Missed Only (${missedQuestions.length})`}
                </span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={handleRestart}
              className="gap-2 font-semibold cursor-pointer"
            >
              <RotateCcw className="size-4" />
              <span>{isAr ? "إعادة الاختبار بالكامل" : "Retake Entire Quiz"}</span>
            </Button>

            {onBackToStudy && (
              <Button
                type="button"
                variant="ghost"
                size="default"
                onClick={onBackToStudy}
                className="gap-2 cursor-pointer"
              >
                <BookOpen className="size-4" />
                <span>{isAr ? "العودة للبطاقات" : "Browse Flashcards"}</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
