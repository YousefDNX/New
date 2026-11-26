import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  GraduationCap,
  HelpCircle,
  Layers,
  Search,
  Sparkles,
  Trophy,
  Volume2,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Unit9VocabQuiz } from "@/components/study/Unit9VocabQuiz";
import { VocabTestCenter } from "@/components/study/VocabTestCenter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ALL_STUDY_VOCAB_UNITS,
  type Grade9VocabQuizQuestion,
  type Grade9VocabUnitMeta,
  type Grade9VocabWord,
} from "@/data/grade9-vocab-units";
import { ACADEMIC_STUDENT_VOCABULARY, CONFUSING_WORDS_DECKS } from "@/data/grade9-expanded-vocab";
import { speakEnglishText } from "@/lib/english-speech";
import { useOptionalAuth } from "@/lib/auth";
import { usePrefs } from "@/lib/preferences";
import { QUIZ_COLOR_PALETTES, getQuizButtonRadiusClass } from "@/lib/settings";
import { playCorrectSound, playIncorrectSound } from "@/lib/sound-effects";
import { speakArabicText } from "@/lib/speech-service";

type StudyTopView = "units" | "unit9_quiz" | "vocabulary_cards" | "test_center" | "summaries";
type UnitViewMode = "flashcards" | "quiz";

export interface UnitSummaryGuide {
  unit: number;
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  keyTakeawaysEn: string[];
  keyTakeawaysAr: string[];
}

export const UNIT_SUMMARY_GUIDES: UnitSummaryGuide[] = [
  {
    unit: 1,
    titleEn: "Unit 1 — Explorers, Grit & Mindset",
    titleAr: "الوحدة الأولى — الاستكشاف والعزيمة والعقلية الإيجابية",
    summaryEn:
      "Focuses on personal determination, overcoming difficult challenges ('tough', 'survive', 'will'), and building a steady mindset ('consistently', 'efficiently', 'trust').",
    summaryAr:
      "تركز الوحدة على قوة الإرادة وتجاوز الصعاب وبناء عقلية إيجابية منظمة تساعد الطالب على الاستمرار دون استسلام.",
    keyTakeawaysEn: [
      "Adverbs ending in -ly (proudly, merely, consistently, efficiently, equally) describe how an action is done.",
      "Phrasal verb 'give up' means to stop trying; contrast it with 'will' and 'survive'.",
      "Use 'highlight' and 'represent' when summarizing main ideas in reading passages.",
    ],
    keyTakeawaysAr: [
      "الأحوال المنتهية بـ -ly تصف طريقة أداء الفعل مثل proudly وconsistently وefficiently.",
      "الفعل المركب give up يعني الاستسلام، ويقابله الثبات والعزيمة (will / survive).",
      "تُستخدم highlight وrepresent عند تلخيص الأفكار الرئيسية في نصوص القراءة.",
    ],
  },
  {
    unit: 2,
    titleEn: "Unit 2 — Digital Safety, AI & Critical Judgement",
    titleAr: "الوحدة الثانية — الأمان الرقمي والتقييم النقدي للمعلومات",
    summaryEn:
      "Teaches students how to evaluate claims online ('fake', 'phishing', 'scam'), protect digital access ('update', 'install', 'software'), and apply careful judgement before trusting sources.",
    summaryAr:
      "تعلم الطلاب كيفية التحقق من الأخبار والروابط المشبوهة، وحماية الحسابات والبرامج، واستخدام التفكير النقدي قبل تصديق أي ادعاء.",
    keyTakeawaysEn: [
      "Always verify 'claim' and 'fake' news with 'accurate' evidence before sharing.",
      "Security verbs: 'access', 'update', 'install', 'evaluate', 'implement'.",
      "Notice British spelling: 'judgement' (with the 'e').",
    ],
    keyTakeawaysAr: [
      "تحقق دائماً من صحة أي ادعاء (claim) وتأكد من دقة المعلومة (accurate) قبل مشاركتها.",
      "أفعال تقنية أساسية: access وupdate وinstall وevaluate وimplement.",
      "انتبه للإملاء البريطاني المعتمد في كلمة judgement.",
    ],
  },
  {
    unit: 3,
    titleEn: "Unit 3 — Food, Health & Balanced Living",
    titleAr: "الوحدة الثالثة — الغذاء والصحة وأسلوب الحياة المتوازن",
    summaryEn:
      "Covers nutrition, balanced meals, British vocabulary spellings ('flavour', 'fibre'), and everyday health habits.",
    summaryAr:
      "تتناول التغذية الصحية، وتوازن الوجبات، والمفردات البريطانية الأساسية مثل flavour وfibre وعادات العناية بالصحة.",
    keyTakeawaysEn: [
      "Preserve British spellings: 'flavour' and 'fibre'.",
      "Practice pairing food adjectives with healthy meal descriptions.",
      "Review all 24 Unit 3 flashcards alongside audio pronunciation.",
    ],
    keyTakeawaysAr: [
      "حافظ على الإملاء البريطاني في flavour وfibre.",
      "تدرّب على ربط صفات الطعام بوصف الوجبات الصحية المتوازنة.",
      "راجع البطاقات الـ ٢٤ كاملة مع الاستماع للنطق الصحيح.",
    ],
  },
  {
    unit: 4,
    titleEn: "Unit 4 — Mindful Living & Conservation",
    titleAr: "الوحدة الرابعة — الاستهلاك الواعي والحفاظ على الموارد",
    summaryEn:
      "Explores reducing waste ('discard', 'disposable', 'wasteful', 'minimise'), protecting resources ('conserve', 'preserve'), and making thoughtful daily choices ('mindful', 'donate', 'balanced').",
    summaryAr:
      "تتناول ترشيد الاستهلاك وتقليل الهدر والحفاظ على البيئة والموارد من خلال قرارات يومية واعية ومستدامة.",
    keyTakeawaysEn: [
      "Contrast wasteful habits ('discard', 'disposable') with sustainable choices ('conserve', 'preserve', 'donate').",
      "British spelling check: 'minimise' (-ise ending).",
      "Connectors for essays: 'instead', 'frankly', 'necessarily'.",
    ],
    keyTakeawaysAr: [
      "قارن بين كلمات الهدر (discard / disposable) وكلمات الحفظ (conserve / preserve / donate).",
      "انتبه للإملاء البريطاني في كلمة minimise.",
      "استخدم روابط التعبير مثل instead وfrankly وnecessarily في الكتابة.",
    ],
  },
];

const PRAISE_AR = ["ممتاز!", "أحسنت!", "رائع!", "استمر، أنت تتقدم!"];
const PRAISE_EN = ["Excellent!", "Well done!", "Great work!", "Keep it up!"];

function GenericUnitImmediateQuiz({
  unitMeta,
  isAr,
  onBackToFlashcards,
}: {
  unitMeta: Grade9VocabUnitMeta;
  isAr: boolean;
  onBackToFlashcards: () => void;
}) {
  const { soundAndQuiz } = usePrefs();
  const radiusClass = getQuizButtonRadiusClass(soundAndQuiz.quizButtonStyle);
  const paletteSpec = QUIZ_COLOR_PALETTES[soundAndQuiz.quizColorPalette];

  const generatedQuestions: Grade9VocabQuizQuestion[] = useMemo(() => {
    if (unitMeta.quizzes.length >= 6) return unitMeta.quizzes;
    const derived: Grade9VocabQuizQuestion[] = unitMeta.words.slice(0, 8).map((w, idx) => {
      const distractors = unitMeta.words
        .filter((other) => other.id !== w.id)
        .slice(
          idx % Math.max(1, unitMeta.words.length - 3),
          (idx % Math.max(1, unitMeta.words.length - 3)) + 3,
        );
      const paddedDistractors =
        distractors.length === 3
          ? distractors
          : unitMeta.words.filter((other) => other.id !== w.id).slice(0, 3);
      const rawOptions = [w.meaningAr, ...paddedDistractors.map((d) => d.meaningAr)];
      const correctPos = idx % rawOptions.length;
      const rotated = [...rawOptions];
      if (correctPos !== 0) {
        const temp = rotated[0]!;
        rotated[0] = rotated[correctPos]!;
        rotated[correctPos] = temp;
      }
      return {
        id: `auto-${unitMeta.unit}-${w.id}`,
        unit: unitMeta.unit,
        promptEn: `What is the Arabic meaning of "${w.word}" (${w.partOfSpeech})?`,
        promptAr: `ما المعنى العربي الصحيح لكلمة "${w.word}"؟`,
        options: rotated,
        correctIndex: correctPos,
        explanationEn: `${w.word} (${w.phonetic}): ${w.definitionEn}`,
        explanationAr: `${w.word}: ${w.meaningAr} — مثال: ${w.exampleAr}`,
      };
    });
    return [...unitMeta.quizzes, ...derived].slice(0, 10);
  }, [unitMeta]);

  const [qIndex, setQIndex] = useState(0);
  const [selectedMap, setSelectedMap] = useState<Record<string, number>>({});

  const currentQ = generatedQuestions[qIndex];
  const chosen = currentQ ? selectedMap[currentQ.id] : undefined;
  const answered = chosen !== undefined;
  const correctTotal = generatedQuestions.filter(
    (q) => selectedMap[q.id] === q.correctIndex,
  ).length;

  if (!currentQ) return null;

  const praiseWord = isAr
    ? PRAISE_AR[qIndex % PRAISE_AR.length]
    : PRAISE_EN[qIndex % PRAISE_EN.length];

  const handleSelectOption = (idx: number) => {
    if (answered) return;
    setSelectedMap((prev) => ({ ...prev, [currentQ.id]: idx }));
    if (soundAndQuiz.soundEffectsEnabled) {
      if (idx === currentQ.correctIndex) playCorrectSound();
      else playIncorrectSound();
    }
  };

  return (
    <div className="surface-card rounded-2xl border border-border/80 p-5 sm:p-7 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold text-foreground leading-snug">
            {isAr
              ? `اختبار تفاعلي — ${unitMeta.themeAr}`
              : `Interactive Quiz — ${unitMeta.themeEn}`}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? `سؤال ${qIndex + 1} من ${generatedQuestions.length} · النتيجة: ${correctTotal}`
              : `Question ${qIndex + 1} of ${generatedQuestions.length} · Score: ${correctTotal}`}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onBackToFlashcards}>
          {isAr ? "العودة للبطاقات" : "Back to Flashcards"}
        </Button>
      </div>

      <div className="space-y-1.5">
        <div className="text-base sm:text-lg font-bold text-foreground">{currentQ.promptEn}</div>
        <div className="text-xs text-muted-foreground font-arabic" dir="rtl">
          {currentQ.promptAr}
        </div>
      </div>

      <div className="grid gap-2.5">
        {currentQ.options.map((opt, idx) => {
          const isPicked = chosen === idx;
          const isRight = idx === currentQ.correctIndex;
          let cls = `border-border/80 bg-surface-2/40 hover:${paletteSpec.activeBorderClass} text-foreground`;
          if (answered) {
            if (isRight) {
              cls =
                "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold";
            } else if (isPicked) {
              cls = "border-destructive bg-destructive/15 text-destructive";
            }
          }
          return (
            <button
              key={idx}
              type="button"
              disabled={answered}
              onClick={() => handleSelectOption(idx)}
              className={`min-h-[44px] flex items-center justify-between border p-3.5 text-start text-sm transition-all ${radiusClass} ${cls}`}
            >
              <span>{opt}</span>
              {answered && isRight && <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />}
              {answered && isPicked && !isRight && (
                <XCircle className="size-4 text-destructive shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          role="status"
          className={`rounded-xl border p-3.5 text-xs space-y-2 ${
            chosen === currentQ.correctIndex
              ? "border-emerald-500/40 bg-emerald-500/10"
              : "border-destructive/40 bg-destructive/10"
          }`}
        >
          <div className="font-bold">
            {chosen === currentQ.correctIndex
              ? isAr
                ? soundAndQuiz.quizFeedbackStyle === "minimal"
                  ? "إجابة صحيحة!"
                  : `إجابة صحيحة! ${praiseWord}`
                : soundAndQuiz.quizFeedbackStyle === "minimal"
                  ? "Correct!"
                  : `Correct! ${praiseWord}`
              : isAr
                ? `إجابة غير صحيحة — الإجابة الصحيحة: ${currentQ.options[currentQ.correctIndex]}`
                : `Incorrect — Correct answer: ${currentQ.options[currentQ.correctIndex]}`}
          </div>
          {soundAndQuiz.quizFeedbackStyle !== "minimal" && (
            <>
              <p>{currentQ.explanationEn}</p>
              {currentQ.explanationAr && (
                <p className="font-arabic text-muted-foreground" dir="rtl">
                  {currentQ.explanationAr}
                </p>
              )}
            </>
          )}
          <div className="flex gap-2 pt-1">
            {qIndex < generatedQuestions.length - 1 ? (
              <Button
                type="button"
                size="sm"
                variant="glow"
                onClick={() => setQIndex((i) => i + 1)}
              >
                {isAr ? "السؤال التالي" : "Next Question"}
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="glow"
                onClick={() => {
                  setQIndex(0);
                  setSelectedMap({});
                }}
              >
                {isAr ? "إعادة الاختبار" : "Restart Quiz"}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function Grade9StudyCenter({ initialUnit }: { initialUnit?: number | null }) {
  const { lang } = usePrefs();
  const auth = useOptionalAuth();
  const uid = auth?.user?.uid ?? null;
  const isAr = lang === "ar";

  const revisedStorageKey = `btc_study_revised_${uid || "guest"}`;
  const [revisedUnits, setRevisedUnits] = useState<Record<number, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(`btc_study_revised_${uid || "guest"}`);
      return raw ? (JSON.parse(raw) as Record<number, boolean>) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(revisedStorageKey);
      setRevisedUnits(raw ? (JSON.parse(raw) as Record<number, boolean>) : {});
    } catch {
      setRevisedUnits({});
    }
  }, [revisedStorageKey]);

  const toggleRevisedUnit = (unitNum: number) => {
    setRevisedUnits((prev) => {
      const next = { ...prev, [unitNum]: !prev[unitNum] };
      try {
        window.localStorage.setItem(revisedStorageKey, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const [topView, setTopView] = useState<StudyTopView>(() => {
    if (typeof window === "undefined") return "units";
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("subtab");
    if (tabParam === "unit9_quiz") return "unit9_quiz";
    if (tabParam === "test_center" || tabParam === "tests" || tabParam === "quiz")
      return "test_center";
    if (tabParam === "vocabulary" || tabParam === "essential") return "vocabulary_cards";
    if (tabParam === "summaries") return "summaries";
    return "units";
  });

  const [selectedUnitNumber, setSelectedUnitNumber] = useState<number | null>(() => {
    if (initialUnit && ALL_STUDY_VOCAB_UNITS.some((u) => u.unit === initialUnit)) {
      return initialUnit;
    }
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const unitParam = params.get("unit");
    if (unitParam) {
      const parsed = parseInt(unitParam, 10);
      if (ALL_STUDY_VOCAB_UNITS.some((u) => u.unit === parsed)) return parsed;
    }
    return null;
  });

  const [unitViewMode, setUnitViewMode] = useState<UnitViewMode>("flashcards");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isMeaningRevealed, setIsMeaningRevealed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [vocabSearch, setVocabSearch] = useState("");
  const [vocabDeckFilter, setVocabDeckFilter] = useState<
    "all" | "unit9" | "essential" | "academic" | "confusing"
  >("all");

  const selectedUnit: Grade9VocabUnitMeta | undefined = ALL_STUDY_VOCAB_UNITS.find(
    (u) => u.unit === selectedUnitNumber,
  );

  const words: Grade9VocabWord[] = selectedUnit?.words ?? [];
  const currentWord: Grade9VocabWord | undefined = words[currentWordIndex];

  const handleSelectUnit = (unitNum: number, mode: UnitViewMode = "flashcards") => {
    setSelectedUnitNumber(unitNum);
    setUnitViewMode(mode);
    setTopView("units");
    setCurrentWordIndex(0);
    setIsMeaningRevealed(false);
  };

  const handleBackToUnits = () => {
    setSelectedUnitNumber(null);
    setUnitViewMode("flashcards");
    setCurrentWordIndex(0);
    setIsMeaningRevealed(false);
  };

  const handleNextWord = useCallback(() => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((i) => i + 1);
      setIsMeaningRevealed(false);
    }
  }, [currentWordIndex, words.length]);

  const handlePrevWord = useCallback(() => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex((i) => i - 1);
      setIsMeaningRevealed(false);
    }
  }, [currentWordIndex]);

  useEffect(() => {
    if (!selectedUnitNumber || unitViewMode !== "flashcards") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") {
        if (isAr) handlePrevWord();
        else handleNextWord();
      } else if (e.key === "ArrowLeft") {
        if (isAr) handleNextWord();
        else handlePrevWord();
      } else if (e.key === " " || e.key === "Enter") {
        setIsMeaningRevealed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedUnitNumber, unitViewMode, isAr, handleNextWord, handlePrevWord]);

  const handlePronounce = (wordText: string) => {
    setIsSpeaking(true);
    const ok = speakEnglishText(wordText, {
      rate: 0.9,
      lang: "en-GB",
      onEnd: () => setIsSpeaking(false),
    });
    setTimeout(() => setIsSpeaking(false), 1200);
    if (!ok) {
      toast.info(
        isAr ? `النطق غير متاح على هذا المتصفح: ${wordText}` : `Audio unavailable: ${wordText}`,
      );
    }
  };

  const handlePronounceArabic = (arabicText: string) => {
    const ok = speakArabicText(arabicText, { rate: 0.92, preferredLocale: "ar-SA" });
    if (!ok) {
      toast.info(`النطق بالعربية: ${arabicText}`);
    }
  };

  const explorerWords = useMemo(() => {
    const unit9 = ALL_STUDY_VOCAB_UNITS.find((u) => u.unit === 9)?.words ?? [];
    const essential = ALL_STUDY_VOCAB_UNITS.find((u) => u.unit === 10)?.words ?? [];
    const allUnitsWords = ALL_STUDY_VOCAB_UNITS.flatMap((u) => u.words);

    const academicWords: Grade9VocabWord[] = ACADEMIC_STUDENT_VOCABULARY.map((item) => ({
      id: item.id,
      word: item.word,
      partOfSpeech: item.partOfSpeech,
      phonetic: item.phonetic,
      definitionEn: item.definitionEn,
      meaningAr: item.meaningAr,
      exampleEn: item.exampleEn,
      exampleAr: item.exampleAr,
      collocations: item.collocations ?? [],
      synonyms: item.synonyms ?? [],
      unit: 11,
      grade: 9,
    }));

    const confusingWords: Grade9VocabWord[] = CONFUSING_WORDS_DECKS.map((item) => ({
      id: item.id,
      word: item.word,
      partOfSpeech: item.partOfSpeech,
      phonetic: item.phonetic,
      definitionEn: item.definitionEn,
      meaningAr: item.meaningAr,
      exampleEn: item.exampleEn,
      exampleAr: item.exampleAr,
      collocations: [],
      synonyms: [],
      unit: 12,
      grade: 9,
    }));

    const pool =
      vocabDeckFilter === "unit9"
        ? unit9
        : vocabDeckFilter === "essential"
          ? essential
          : vocabDeckFilter === "academic"
            ? academicWords
            : vocabDeckFilter === "confusing"
              ? confusingWords
              : allUnitsWords;

    const q = vocabSearch.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.definitionEn.toLowerCase().includes(q) ||
        w.meaningAr.includes(q),
    );
  }, [vocabDeckFilter, vocabSearch]);

  if (topView === "test_center" && !selectedUnitNumber) {
    return (
      <div className="space-y-6">
        <VocabTestCenter onBackToStudy={() => setTopView("units")} />
      </div>
    );
  }

  if (topView === "summaries" && !selectedUnitNumber) {
    const revisedCount = UNIT_SUMMARY_GUIDES.filter((g) => revisedUnits[g.unit]).length;
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTopView("units")}
              className="min-h-[44px] gap-2 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="size-4 rtl-flip" />
              <span>{isAr ? "العودة للوحدات" : "Back to Units"}</span>
            </Button>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                {isAr ? "ملخصات الدروس وخطة المراجعة" : "Lesson Summaries & Revision"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? `تمت مراجعة ${revisedCount} من ${UNIT_SUMMARY_GUIDES.length} وحدات`
                  : `${revisedCount} of ${UNIT_SUMMARY_GUIDES.length} units revised`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {UNIT_SUMMARY_GUIDES.map((guide) => {
            const done = Boolean(revisedUnits[guide.unit]);
            return (
              <div
                key={guide.unit}
                className="surface-card flex flex-col justify-between rounded-2xl border border-border/80 p-5 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-md bg-primary/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-primary">
                      UNIT {guide.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleRevisedUnit(guide.unit)}
                      className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        done
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-surface-2 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>
                        {done
                          ? isAr
                            ? "تمت المراجعة"
                            : "Revised"
                          : isAr
                            ? "تحديد كمُراجع"
                            : "Mark Revised"}
                      </span>
                    </button>
                  </div>

                  <h3 className="font-display text-base font-bold text-foreground">
                    {isAr ? guide.titleAr : guide.titleEn}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isAr ? guide.summaryAr : guide.summaryEn}
                  </p>

                  <ul className="space-y-1.5 rounded-xl bg-surface-2/60 p-3 text-xs text-foreground">
                    {(isAr ? guide.keyTakeawaysAr : guide.keyTakeawaysEn).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelectUnit(guide.unit, "flashcards")}
                    className="min-h-[40px] text-xs cursor-pointer"
                  >
                    {isAr ? "افتح البطاقات" : "Open Flashcards"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="glow"
                    onClick={() => handleSelectUnit(guide.unit, "quiz")}
                    className="min-h-[40px] text-xs cursor-pointer"
                  >
                    {isAr ? "اختبار سريع" : "Quick Quiz"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (topView === "unit9_quiz" && !selectedUnitNumber) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTopView("units")}
            className="min-h-[44px] gap-2 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="size-4 rtl-flip" />
            <span>{isAr ? "العودة لجميع الوحدات" : "Back to Study Units"}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSelectUnit(9, "flashcards")}
            className="min-h-[44px] gap-2 text-xs font-semibold cursor-pointer"
          >
            <Layers className="size-4 text-primary" />
            <span>
              {isAr
                ? "بطاقات المفردات المهمة (٢٤ كلمة)"
                : "Important Vocabulary Flashcards (24 Words)"}
            </span>
          </Button>
        </div>

        <Unit9VocabQuiz onBackToFlashcards={() => handleSelectUnit(9, "flashcards")} />
      </div>
    );
  }

  if (topView === "vocabulary_cards" && !selectedUnitNumber) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTopView("units")}
              className="min-h-[44px] gap-2 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="size-4 rtl-flip" />
              <span>{isAr ? "العودة للوحدات" : "Back to Units"}</span>
            </Button>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                {isAr
                  ? "موسوعة المفردات الأساسية والطالب المتفوّق"
                  : "Expanded Student Vocabulary Cards"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "تعلّم أهم الكلمات الأكاديمية والمفردات المهمة للعلوم والتكنولوجيا مع النطق والأمثلة."
                  : "Learn essential academic words and important science vocabulary with audio and examples."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="glow"
              size="sm"
              onClick={() => setTopView("test_center")}
              className="min-h-[40px] gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Zap className="size-3.5" />
              <span>{isAr ? "بنك الاختبارات الشامل" : "Test Center"}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTopView("unit9_quiz")}
              className="min-h-[40px] gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Trophy className="size-3.5" />
              <span>{isAr ? "اختبار المفردات المهمة" : "Important Vocabulary Quiz"}</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: "all", labelEn: "All Words (141)", labelAr: "جميع الكلمات (١٤١)" },
                {
                  id: "essential",
                  labelEn: "Essential Mastery (24)",
                  labelAr: "كلمات التفوق الأساسية (٢٤)",
                },
                {
                  id: "unit9",
                  labelEn: "Important Vocabulary (24)",
                  labelAr: "المفردات المهمة (٢٤)",
                },
                {
                  id: "academic",
                  labelEn: "Academic Super-Words (16)",
                  labelAr: "مفردات أكاديمية متقدمة (١٦)",
                },
                {
                  id: "confusing",
                  labelEn: "Confusing Words & Traps (5)",
                  labelAr: "كلمات متشابهة وفروق دقيقة (٥)",
                },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setVocabDeckFilter(f.id)}
                className={`min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  vocabDeckFilter === f.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                {isAr ? f.labelAr : f.labelEn}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80 lg:w-96">
            <Search className="pointer-events-none absolute start-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={vocabSearch}
              onChange={(e) => setVocabSearch(e.target.value)}
              placeholder={isAr ? "ابحث عن كلمة أو معنى..." : "Search word or meaning..."}
              className="h-9 ps-8 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {explorerWords.map((w) => (
            <div
              key={w.id}
              className="surface-card flex flex-col justify-between rounded-2xl border border-border/80 p-4 space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                    {w.unit === 10
                      ? "ESSENTIAL"
                      : w.unit === 9
                        ? "IMPORTANT"
                        : w.unit === 11
                          ? "ACADEMIC"
                          : w.unit === 12
                            ? "CONFUSING PAIRS"
                            : `UNIT ${w.unit}`}{" "}
                    · {w.partOfSpeech}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePronounce(w.word)}
                    className="flex size-9 items-center justify-center rounded-full bg-surface-2 text-primary hover:bg-primary/15 cursor-pointer"
                    aria-label={`Listen to ${w.word}`}
                  >
                    <Volume2 className="size-4" />
                  </button>
                </div>

                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{w.word}</h3>
                  <div className="font-mono text-[11px] text-muted-foreground">{w.phonetic}</div>
                </div>

                <div className="font-arabic text-sm font-bold text-primary" dir="rtl">
                  {w.meaningAr}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{w.definitionEn}</p>
              </div>

              <div className="rounded-xl bg-surface-2/60 p-2.5 text-[11px] space-y-1 border border-border/50">
                <p className="italic text-foreground">&ldquo;{w.exampleEn}&rdquo;</p>
                <p className="font-arabic text-muted-foreground" dir="rtl">
                  {w.exampleAr}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedUnitNumber || !selectedUnit) {
    return (
      <div className="space-y-7">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <GraduationCap className="size-4 shrink-0" />
            <span>
              {isAr
                ? "الصف التاسع — المفردات والاختبارات والملخصات"
                : "Grade 9 — Vocabulary, Quizzes & Summaries"}
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {isAr ? "مفردات الصف التاسع ومركز الاختبارات" : "Grade 9 Study & Vocabulary"}
          </h2>

          <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
            {isAr
              ? "ادرس وحدات الصف التاسع (١–٤ والوحدة ٩ والكلمات الأساسية)، استمع للنطق البريطاني الصحيح، واختبر مستواك بتصحيح فوري."
              : "Master Grade 9 vocabulary units (1–4, Unit 9 & Essential Pack), listen to verified British English pronunciation, and test yourself with immediate feedback."}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <Button
              type="button"
              variant="glow"
              size="sm"
              onClick={() => setTopView("test_center")}
              className="min-h-[44px] gap-2 font-bold cursor-pointer"
            >
              <Zap className="size-4" />
              <span>
                {isAr
                  ? "بنك الاختبارات الشامل (نماذج متعددة وتصحيح فوري)"
                  : "All Vocabulary Tests (Sprint, Mock & Mastery)"}
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTopView("unit9_quiz")}
              className="min-h-[44px] gap-2 font-bold cursor-pointer"
            >
              <Trophy className="size-4 text-primary" />
              <span>
                {isAr
                  ? "اختبار المفردات المهمة التفاعلي (تصحيح فوري)"
                  : "Important Vocabulary Interactive Quiz"}
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTopView("vocabulary_cards")}
              className="min-h-[44px] gap-2 font-semibold cursor-pointer"
            >
              <BookOpen className="size-4 text-primary" />
              <span>
                {isAr
                  ? "بطاقات المفردات الأساسية والموسّعة (١٤١ كلمة)"
                  : "Browse All Study Cards & Essential Words (141)"}
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTopView("summaries")}
              className="min-h-[44px] gap-2 font-semibold cursor-pointer"
            >
              <Layers className="size-4 text-primary" />
              <span>{isAr ? "ملخصات الدروس والمراجعة" : "Lesson Summaries & Revision"}</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {ALL_STUDY_VOCAB_UNITS.map((unitMeta) => {
            const wordCount = unitMeta.words.length;
            const isUnit9 = unitMeta.unit === 9;
            const isEssential = unitMeta.unit === 10;

            return (
              <div
                key={unitMeta.unit}
                className={`surface-card group flex flex-col justify-between rounded-2xl border p-5 sm:p-6 transition-all hover:border-primary/50 ${
                  isUnit9 || isEssential ? "border-primary/40" : "border-border/80"
                }`}
              >
                <div
                  className="space-y-3 cursor-pointer"
                  onClick={() => handleSelectUnit(unitMeta.unit, "flashcards")}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-3 py-1 font-mono text-xs font-bold text-primary tracking-wider">
                      {isEssential
                        ? isAr
                          ? "كلمات التفوّق"
                          : "ESSENTIAL PACK"
                        : isUnit9
                          ? isAr
                            ? "المفردات المهمة"
                            : "IMPORTANT VOCAB"
                          : `UNIT ${unitMeta.unit}`}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {isAr ? `${wordCount} كلمة` : `${wordCount} words`}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {isAr ? unitMeta.themeAr : unitMeta.themeEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {isAr ? unitMeta.themeEn : unitMeta.themeAr}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectUnit(unitMeta.unit, "flashcards")}
                    className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <Layers className="size-3.5" />
                    <span>{isAr ? "البطاقات التعليمية" : "Start Flashcards"}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {isUnit9 ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="glow"
                        onClick={() => handleSelectUnit(9, "quiz")}
                        className="min-h-[40px] gap-1.5 text-xs font-bold cursor-pointer"
                      >
                        <HelpCircle className="size-3.5" />
                        <span>{isAr ? "اختبار المفردات المهمة" : "Important Vocab Quiz"}</span>
                      </Button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectUnit(unitMeta.unit, "quiz")}
                        className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40 cursor-pointer"
                      >
                        <Sparkles className="size-3 text-primary" />
                        <span>{isAr ? "اختبار سريع" : "Quick Quiz"}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSelectUnit(unitMeta.unit, "flashcards")}
                      className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors cursor-pointer"
                      aria-label={`Open ${unitMeta.themeEn}`}
                    >
                      <ArrowRight className="size-4 rtl-flip" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleBackToUnits}
          className="min-h-[44px] gap-2 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="size-4 rtl-flip" />
          <span>{isAr ? "العودة لاختيار الوحدات" : "Back to Units"}</span>
        </Button>

        <div className="min-w-0 flex-1 text-center">
          <div className="text-xs font-bold text-primary font-mono tracking-wider">
            {selectedUnit.unit === 10
              ? isAr
                ? "كلمات التفوّق الأساسية"
                : "ESSENTIAL VOCABULARY"
              : selectedUnit.unit === 9
                ? isAr
                  ? "المفردات المهمة — العلوم والتكنولوجيا"
                  : "IMPORTANT VOCABULARY"
                : `UNIT ${selectedUnit.unit}`}
          </div>
          <div className="text-xs text-muted-foreground leading-snug">
            {isAr ? selectedUnit.themeAr : selectedUnit.themeEn}
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl bg-surface-2 p-1 border border-border/70">
          <button
            type="button"
            onClick={() => setUnitViewMode("flashcards")}
            className={`min-h-[38px] rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
              unitViewMode === "flashcards"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isAr ? "البطاقات" : "Flashcards"}
          </button>
          <button
            type="button"
            onClick={() => setUnitViewMode("quiz")}
            className={`min-h-[38px] rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
              unitViewMode === "quiz"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isAr ? "اختبار تفاعلي" : "Interactive Quiz"}
          </button>
        </div>
      </div>

      {unitViewMode === "quiz" ? (
        selectedUnit.unit === 9 ? (
          <Unit9VocabQuiz onBackToFlashcards={() => setUnitViewMode("flashcards")} />
        ) : (
          <GenericUnitImmediateQuiz
            unitMeta={selectedUnit}
            isAr={isAr}
            onBackToFlashcards={() => setUnitViewMode("flashcards")}
          />
        )
      ) : (
        <div className="mx-auto max-w-2xl space-y-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {isAr
                ? `بطاقة ${currentWordIndex + 1} من ${words.length}`
                : `Card ${currentWordIndex + 1} of ${words.length}`}
            </span>
            <div className="font-mono font-bold text-foreground bg-surface-2 px-3 py-1 rounded-lg border border-border">
              {currentWordIndex + 1} / {words.length}
            </div>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentWordIndex + 1) / Math.max(1, words.length)) * 100}%` }}
            />
          </div>

          {currentWord && (
            <div className="surface-card relative rounded-2xl border-2 border-border/90 p-6 sm:p-9 shadow-md">
              <div className="space-y-6 text-center">
                <div className="space-y-2">
                  <div className="inline-flex flex-wrap items-center justify-center gap-2">
                    <span className="rounded-md bg-surface-2 px-2.5 py-0.5 font-mono text-xs font-medium text-muted-foreground">
                      {currentWord.partOfSpeech}
                    </span>
                    {currentWord.phonetic && (
                      <span className="font-mono text-xs text-primary/90">
                        {currentWord.phonetic}
                      </span>
                    )}
                  </div>

                  <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground select-all">
                    {currentWord.word}
                  </h2>
                </div>

                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePronounce(currentWord.word)}
                    disabled={isSpeaking}
                    className="min-h-[42px] gap-2 rounded-full px-4 text-xs font-semibold cursor-pointer border-primary/40 hover:bg-primary/10"
                  >
                    <Volume2 className="size-4 text-primary" />
                    <span>{isAr ? "استمع للنطق (British)" : "Listen (British English)"}</span>
                  </Button>
                </div>

                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground max-w-lg mx-auto">
                  {currentWord.definitionEn}
                </p>

                <div className="pt-2">
                  {!isMeaningRevealed ? (
                    <Button
                      type="button"
                      variant="glow"
                      size="lg"
                      onClick={() => setIsMeaningRevealed(true)}
                      className="min-h-[44px] w-full sm:w-auto gap-2 px-8 font-bold cursor-pointer"
                    >
                      <Eye className="size-4" />
                      <span>{isAr ? "إظهار المعنى بالعربية" : "Reveal Arabic Meaning"}</span>
                    </Button>
                  ) : (
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-start space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/20 pb-2">
                        <span className="text-xs font-bold text-primary">
                          {isAr ? "المعنى بالعربية" : "Arabic Meaning"}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handlePronounceArabic(currentWord.meaningAr)}
                            className="min-h-[36px] text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Volume2 className="size-3.5" />
                            <span className="font-arabic">استمع بالعربية</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsMeaningRevealed(false)}
                            className="min-h-[36px] text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                          >
                            <EyeOff className="size-3.5" />
                            <span>{isAr ? "إخفاء" : "Hide"}</span>
                          </button>
                        </div>
                      </div>

                      <div className="font-display text-2xl font-bold text-foreground text-center py-1 font-arabic">
                        {currentWord.meaningAr}
                      </div>

                      {currentWord.exampleEn && (
                        <div className="text-xs space-y-1 pt-2 border-t border-border/40">
                          <div className="text-muted-foreground font-medium">Example:</div>
                          <p className="text-foreground italic">{currentWord.exampleEn}</p>
                          {currentWord.exampleAr && (
                            <p className="text-muted-foreground font-arabic" dir="rtl">
                              {currentWord.exampleAr}
                            </p>
                          )}
                        </div>
                      )}

                      {currentWord.collocations && currentWord.collocations.length > 0 && (
                        <div className="text-xs pt-1 flex flex-wrap gap-1.5 items-center">
                          <span className="text-muted-foreground font-medium">Collocations:</span>
                          {currentWord.collocations.map((c, i) => (
                            <span
                              key={i}
                              className="rounded-md bg-surface-2 px-2 py-0.5 text-foreground font-mono text-[11px]"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handlePrevWord}
              disabled={currentWordIndex === 0}
              className="min-h-[44px] flex-1 gap-2 font-semibold cursor-pointer"
            >
              <ChevronLeft className="size-4 rtl-flip" />
              <span>{isAr ? "السابق" : "Previous"}</span>
            </Button>

            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={handleNextWord}
              disabled={currentWordIndex === words.length - 1}
              className="min-h-[44px] flex-1 gap-2 font-semibold cursor-pointer"
            >
              <span>{isAr ? "التالي" : "Next"}</span>
              <ChevronRight className="size-4 rtl-flip" />
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {isAr
              ? "يمكنك استخدام مفاتيح الأسهم (← و →) ومفتاح المسافة للتنقل السريع."
              : "Tip: Use arrow keys (← and →) and Spacebar for rapid flashcard navigation."}
          </p>
        </div>
      )}
    </div>
  );
}
