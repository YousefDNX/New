import React, { useMemo, useState } from "react";
import {
  ISLAMIC_KNOWLEDGE_QUIZZES,
  TAJWEED_LESSONS,
  type TajweedLevel,
} from "@/data/islamic-knowledge-catalog";
import {
  loadIslamicLearningState,
  saveIslamicLearningState,
  toggleStringInList,
  type IslamicStudyDashboardState,
} from "@/lib/islamic-learning-store";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Circle,
  Headphones,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

interface TajweedAcademyPanelProps {
  lang?: string;
  onOpenAudioReciter?: (reciterId: string, surahId: number) => void;
}

export const TajweedAcademyPanel: React.FC<TajweedAcademyPanelProps> = ({
  lang = "ar",
  onOpenAudioReciter,
}) => {
  const isAr = lang === "ar";
  const [levelFilter, setLevelFilter] = useState<"all" | TajweedLevel>("all");
  const [learningState, setLearningState] = useState<IslamicStudyDashboardState>(() =>
    loadIslamicLearningState(),
  );
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  const lessons = useMemo(
    () =>
      levelFilter === "all"
        ? TAJWEED_LESSONS
        : TAJWEED_LESSONS.filter((l) => l.level === levelFilter),
    [levelFilter],
  );

  const tajweedQuizQuestions = useMemo(
    () => ISLAMIC_KNOWLEDGE_QUIZZES.filter((q) => q.domain === "tajweed"),
    [],
  );

  const toggleLessonComplete = (lessonId: string) => {
    setLearningState((prev) => {
      const next: IslamicStudyDashboardState = {
        ...prev,
        completedTajweedLessonIds: toggleStringInList(prev.completedTajweedLessonIds, lessonId),
      };
      saveIslamicLearningState(next);
      return next;
    });
  };

  return (
    <div className="space-y-5" dir={isAr ? "rtl" : "ltr"} data-testid="tajweed-academy-panel">
      {/* Talaqqi / Human Oral Correction Disclaimer */}
      <div
        data-testid="tajweed-talaqqi-disclaimer"
        className="rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4 flex items-start gap-3 text-xs text-stone-800 dark:text-stone-100"
      >
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold">
            {isAr
              ? "تنبيه التلقي والمشافهة: التجويد يُؤخذ بالسماع والمشافهة"
              : "Oral Transmission Notice (Talaqqi): Self-Study Supplement Only"}
          </div>
          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
            {isAr
              ? "تُعينك هذه الدروس على فهم القواعد النظرية من متني تحفة الأطفال والجزرية مع سماع كبار القراء، ولكن إتقان المخارج والغنة لا يُستغنى فيه عن القراءة على معلم أو شيخ مجاز."
              : "These structured lessons teach theory from Tuhfat al-Atfal & Al-Jazariyyah alongside verified reciter audio, and do not replace live oral feedback from a qualified Quran teacher."}
          </p>
        </div>
      </div>

      {/* Header + Level Filters */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span>{isAr ? "أكاديمية التجويد التفاعلية" : "Interactive Tajweed Academy"}</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {isAr
                ? `تم إتمام ${learningState.completedTajweedLessonIds.length} من ${TAJWEED_LESSONS.length} دروس على جهازك الخاص.`
                : `${learningState.completedTajweedLessonIds.length} of ${TAJWEED_LESSONS.length} lessons marked complete privately on your device.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "all", labelAr: "كل المستويات", labelEn: "All Levels" },
                { id: "beginner", labelAr: "مبتدئ", labelEn: "Beginner" },
                { id: "intermediate", labelAr: "متوسط", labelEn: "Intermediate" },
                { id: "advanced", labelAr: "متقدم", labelEn: "Advanced" },
              ] as const
            ).map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setLevelFilter(lvl.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  levelFilter === lvl.id
                    ? "bg-emerald-700 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                }`}
              >
                {isAr ? lvl.labelAr : lvl.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Lesson Cards */}
        <div className="space-y-4">
          {lessons.map((lesson) => {
            const done = learningState.completedTajweedLessonIds.includes(lesson.id);
            const levelLabel =
              lesson.level === "beginner"
                ? isAr
                  ? "المستوى المبتدئ"
                  : "Beginner"
                : lesson.level === "intermediate"
                  ? isAr
                    ? "المستوى المتوسط"
                    : "Intermediate"
                  : isAr
                    ? "المستوى المتقدم"
                    : "Advanced";

            return (
              <article
                key={lesson.id}
                data-testid={`tajweed-lesson-${lesson.id}`}
                className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/60 p-4 sm:p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      {levelLabel}
                    </div>
                    <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
                      {isAr ? lesson.titleAr : lesson.titleEn}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {isAr ? lesson.summaryAr : lesson.summaryEn}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {onOpenAudioReciter && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenAudioReciter(lesson.practiceReciterId, lesson.practiceSurahId)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold whitespace-nowrap"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        <span>{isAr ? "تطبيق صوتي موثق" : "Listen Example"}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleLessonComplete(lesson.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-colors ${
                        done
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300"
                          : "border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Circle className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {done
                          ? isAr
                            ? "تمت الدراسة"
                            : "Completed"
                          : isAr
                            ? "إتمام الدرس"
                            : "Mark Complete"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Rule Steps */}
                <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300 ps-4 list-disc">
                  {(isAr ? lesson.ruleStepsAr : lesson.ruleStepsEn).map((step, i) => (
                    <li key={i} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ul>

                {/* Quranic Examples */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {lesson.quranicExamples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          dir="rtl"
                          className="font-serif text-lg font-bold text-emerald-900 dark:text-emerald-300"
                        >
                          {ex.arabicPhrase}
                        </span>
                        <span className="font-mono text-[10px] text-stone-500">{ex.verseRef}</span>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400">
                        {isAr ? ex.highlightNoteAr : ex.highlightNoteEn}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Common Mistake & Classical Citation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-stone-200 dark:border-stone-800 text-[11px]">
                  <span className="text-amber-800 dark:text-amber-300">
                    <strong>{isAr ? "خطأ شائع يُجتنب: " : "Common Mistake: "}</strong>
                    {isAr ? lesson.commonMistakeAr : lesson.commonMistakeEn}
                  </span>
                  <span className="inline-flex items-center gap-1 text-stone-500 font-mono shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {isAr ? lesson.citation.sourceBookAr : lesson.citation.sourceBookEn}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Interactive Tajweed Quiz Check */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-4">
        <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>{isAr ? "اختبار التثبيت السريع لأحكام التجويد" : "Tajweed Knowledge Check"}</span>
        </h4>

        <div className="space-y-4">
          {tajweedQuizQuestions.map((q) => {
            const chosen = selectedAnswers[q.id];
            const answered = chosen !== undefined;
            const opts = isAr ? q.optionsAr : q.optionsEn;
            return (
              <div
                key={q.id}
                className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 p-4 space-y-2.5 text-xs"
              >
                <div className="font-bold text-stone-900 dark:text-stone-100">
                  {isAr ? q.questionAr : q.questionEn}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {opts.map((opt, idx) => {
                    const isCorrect = idx === q.correctIndex;
                    const isPicked = chosen === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setSelectedAnswers((prev) => ({
                            ...prev,
                            [q.id]: idx,
                          }))
                        }
                        className={`p-2.5 rounded-lg border text-start transition-colors ${
                          !answered
                            ? "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-emerald-500"
                            : isCorrect
                              ? "border-emerald-500 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 font-bold"
                              : isPicked
                                ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300"
                                : "border-stone-200 dark:border-stone-800 opacity-60"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 pt-1">
                    <strong>{isAr ? "التوضيح الموثق: " : "Explanation: "}</strong>
                    {isAr ? q.explanationAr : q.explanationEn} ({q.sourceRef})
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
