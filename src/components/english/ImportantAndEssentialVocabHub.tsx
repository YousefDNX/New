import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  HelpCircle,
  Layers,
  Search,
  Sparkles,
  Trophy,
  Volume2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Unit9VocabQuiz } from "@/components/study/Unit9VocabQuiz";
import { VocabTestCenter } from "@/components/study/VocabTestCenter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ALL_STUDY_VOCAB_UNITS,
  type Grade9VocabUnitMeta,
  type Grade9VocabWord,
} from "@/data/grade9-vocab-units";
import { ACADEMIC_STUDENT_VOCABULARY, CONFUSING_WORDS_DECKS } from "@/data/grade9-expanded-vocab";
import { speakEnglishText } from "@/lib/english-speech";
import { usePrefs } from "@/lib/preferences";
import { speakArabicText } from "@/lib/speech-service";

type HubView = "overview" | "unit9_quiz" | "vocabulary_cards" | "test_center" | "deck_flashcards";

export function ImportantAndEssentialVocabHub() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";

  const importantUnit: Grade9VocabUnitMeta | undefined = ALL_STUDY_VOCAB_UNITS.find(
    (u) => u.unit === 9,
  );
  const essentialUnit: Grade9VocabUnitMeta | undefined = ALL_STUDY_VOCAB_UNITS.find(
    (u) => u.unit === 10,
  );

  const [view, setView] = useState<HubView>("overview");
  const [activeDeckUnitNum, setActiveDeckUnitNum] = useState<9 | 10>(9);
  const [cardIndex, setCardIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [deckFilter, setDeckFilter] = useState<
    "all" | "unit9" | "essential" | "academic" | "confusing"
  >("all");

  const activeDeck = activeDeckUnitNum === 9 ? importantUnit : essentialUnit;
  const deckWords = activeDeck?.words ?? [];
  const currentWord = deckWords[cardIndex];

  const openFlashcards = (unitNum: 9 | 10) => {
    setActiveDeckUnitNum(unitNum);
    setCardIndex(0);
    setRevealed(false);
    setView("deck_flashcards");
  };

  const handlePronounce = (wordText: string, specificAccent?: "en-US" | "en-GB") => {
    setIsSpeaking(true);
    const ok = speakEnglishText(wordText, {
      rate: 0.9,
      accent: specificAccent,
      lang: specificAccent,
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
    const unit9 = importantUnit?.words ?? [];
    const essential = essentialUnit?.words ?? [];

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

    const allStandaloneWords = [...unit9, ...essential, ...academicWords, ...confusingWords];

    const pool =
      deckFilter === "unit9"
        ? unit9
        : deckFilter === "essential"
          ? essential
          : deckFilter === "academic"
            ? academicWords
            : deckFilter === "confusing"
              ? confusingWords
              : allStandaloneWords;

    const q = searchQuery.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.definitionEn.toLowerCase().includes(q) ||
        w.meaningAr.includes(q),
    );
  }, [importantUnit, essentialUnit, deckFilter, searchQuery]);

  if (view === "test_center") {
    return (
      <div className="space-y-6">
        <VocabTestCenter onBackToStudy={() => setView("overview")} />
      </div>
    );
  }

  if (view === "unit9_quiz") {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setView("overview")}
            className="min-h-[44px] gap-2 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="size-4 rtl-flip" />
            <span>
              {isAr ? "العودة للمفردات المهمة والأساسية" : "Back to Important & Essential"}
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openFlashcards(9)}
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

        <Unit9VocabQuiz onBackToFlashcards={() => openFlashcards(9)} />
      </div>
    );
  }

  if (view === "vocabulary_cards") {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setView("overview")}
              className="min-h-[44px] gap-2 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="size-4 rtl-flip" />
              <span>{isAr ? "العودة" : "Back"}</span>
            </Button>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                {isAr
                  ? "موسوعة المفردات المهمة والأساسية"
                  : "Expanded Important & Essential Vocabulary Cards"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "استعرض كلمات التفوّق والمفردات المهمة للعلوم والتكنولوجيا والألفاظ الأكاديمية."
                  : "Explore Important Vocabulary, Essential Mastery words, Academic terms, and Confusing word traps."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="glow"
              size="sm"
              onClick={() => setView("test_center")}
              className="min-h-[40px] gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Zap className="size-3.5" />
              <span>{isAr ? "بنك الاختبارات الشامل" : "Test Center"}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setView("unit9_quiz")}
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
                { id: "all", labelEn: "All Standalone Packs (69)", labelAr: "جميع القوائم (٦٩)" },
                {
                  id: "unit9",
                  labelEn: "Important Vocabulary (24)",
                  labelAr: "المفردات المهمة (٢٤)",
                },
                {
                  id: "essential",
                  labelEn: "Essential Vocabulary (24)",
                  labelAr: "المفردات الأساسية (٢٤)",
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
                onClick={() => setDeckFilter(f.id)}
                className={`min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  deckFilter === f.id
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                      ? "ESSENTIAL VOCAB"
                      : w.unit === 9
                        ? "IMPORTANT VOCAB"
                        : w.unit === 11
                          ? "ACADEMIC"
                          : "CONFUSING PAIRS"}{" "}
                    · {w.partOfSpeech}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handlePronounce(w.word, "en-US")}
                      className="flex h-7 items-center gap-1 rounded-md bg-surface-2 px-2 text-[10px] font-semibold text-foreground hover:bg-primary/15 hover:text-primary cursor-pointer transition-colors"
                      aria-label={`Listen to ${w.word} in US accent`}
                      title="US Accent 🇺🇸"
                    >
                      <span>🇺🇸</span>
                      <span>US</span>
                      <Volume2 className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePronounce(w.word, "en-GB")}
                      className="flex h-7 items-center gap-1 rounded-md bg-surface-2 px-2 text-[10px] font-semibold text-foreground hover:bg-primary/15 hover:text-primary cursor-pointer transition-colors"
                      aria-label={`Listen to ${w.word} in UK accent`}
                      title="UK Accent 🇬🇧"
                    >
                      <span>🇬🇧</span>
                      <span>UK</span>
                      <Volume2 className="size-3" />
                    </button>
                  </div>
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

  if (view === "deck_flashcards" && activeDeck) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setView("overview")}
            className="min-h-[44px] gap-2 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="size-4 rtl-flip" />
            <span>{isAr ? "العودة" : "Back"}</span>
          </Button>

          <div className="min-w-0 flex-1 text-center">
            <div className="text-xs font-bold text-primary font-mono tracking-wider">
              {activeDeckUnitNum === 9
                ? isAr
                  ? "المفردات المهمة"
                  : "IMPORTANT VOCABULARY"
                : isAr
                  ? "المفردات الأساسية"
                  : "ESSENTIAL VOCABULARY"}
            </div>
            <div className="text-xs text-muted-foreground leading-snug">
              {isAr ? activeDeck.themeAr : activeDeck.themeEn}
            </div>
          </div>

          {activeDeckUnitNum === 9 && (
            <Button
              type="button"
              variant="glow"
              size="sm"
              onClick={() => setView("unit9_quiz")}
              className="min-h-[40px] gap-1.5 text-xs font-bold cursor-pointer"
            >
              <HelpCircle className="size-3.5" />
              <span>{isAr ? "ابدأ الاختبار" : "Start Quiz"}</span>
            </Button>
          )}
        </div>

        <div className="mx-auto max-w-2xl space-y-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {isAr
                ? `بطاقة ${cardIndex + 1} من ${deckWords.length}`
                : `Card ${cardIndex + 1} of ${deckWords.length}`}
            </span>
            <div className="font-mono font-bold text-foreground bg-surface-2 px-3 py-1 rounded-lg border border-border">
              {cardIndex + 1} / {deckWords.length}
            </div>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((cardIndex + 1) / Math.max(1, deckWords.length)) * 100}%` }}
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

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePronounce(currentWord.word, "en-US")}
                    disabled={isSpeaking}
                    className="min-h-[40px] gap-1.5 rounded-full px-4 text-xs font-semibold cursor-pointer border-primary/40 hover:bg-primary/10"
                  >
                    <span>🇺🇸</span>
                    <Volume2 className="size-4 text-primary" />
                    <span>{isAr ? "نطق أمريكي (US)" : "American (US)"}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePronounce(currentWord.word, "en-GB")}
                    disabled={isSpeaking}
                    className="min-h-[40px] gap-1.5 rounded-full px-4 text-xs font-semibold cursor-pointer border-primary/40 hover:bg-primary/10"
                  >
                    <span>🇬🇧</span>
                    <Volume2 className="size-4 text-primary" />
                    <span>{isAr ? "نطق بريطاني (UK)" : "British (UK)"}</span>
                  </Button>
                </div>

                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground max-w-lg mx-auto">
                  {currentWord.definitionEn}
                </p>

                <div className="pt-2">
                  {!revealed ? (
                    <Button
                      type="button"
                      variant="glow"
                      size="lg"
                      onClick={() => setRevealed(true)}
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
                            onClick={() => setRevealed(false)}
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
              onClick={() => {
                setCardIndex((i) => Math.max(0, i - 1));
                setRevealed(false);
              }}
              disabled={cardIndex === 0}
              className="min-h-[44px] flex-1 gap-2 font-semibold cursor-pointer"
            >
              <ChevronLeft className="size-4 rtl-flip" />
              <span>{isAr ? "السابق" : "Previous"}</span>
            </Button>

            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={() => {
                setCardIndex((i) => Math.min(deckWords.length - 1, i + 1));
                setRevealed(false);
              }}
              disabled={cardIndex >= deckWords.length - 1}
              className="min-h-[44px] flex-1 gap-2 font-semibold cursor-pointer"
            >
              <span>{isAr ? "التالي" : "Next"}</span>
              <ChevronRight className="size-4 rtl-flip" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7" data-testid="important-essential-vocab-hub">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="size-4 shrink-0" />
          <span>
            {isAr
              ? "قسم مستقل — المفردات المهمة والمفردات الأساسية"
              : "Dedicated Section — Important & Essential Vocabulary"}
          </span>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {isAr
            ? "المفردات المهمة والأساسية (قسم مستقل عن الصف التاسع)"
            : "Important & Essential Vocabulary Hub"}
        </h2>

        <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
          {isAr
            ? "مجموعات مفردات مستقلة تماماً عن منهج الصف التاسع: أهم مفردات العلوم والتكنولوجيا وابتكارات المستقبل مع الكلمات الأساسية والأكاديمية والاختبارات التفاعلية."
            : "Curated standalone vocabulary packs separated from Grade 9: Important Science & Tech Vocabulary (24 words), Essential Mastery Words (24 words), Academic Super-Words, and interactive quizzes."}
        </p>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <Button
            type="button"
            variant="glow"
            size="sm"
            onClick={() => setView("unit9_quiz")}
            className="min-h-[44px] gap-2 font-bold cursor-pointer"
          >
            <Trophy className="size-4" />
            <span>
              {isAr ? "اختبار المفردات المهمة التفاعلي" : "Important Vocabulary Interactive Quiz"}
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setView("vocabulary_cards")}
            className="min-h-[44px] gap-2 font-semibold cursor-pointer"
          >
            <BookOpen className="size-4 text-primary" />
            <span>
              {isAr
                ? "استعراض جميع بطاقات المفردات المهمة والأساسية"
                : "Browse Important & Essential Cards (69)"}
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setView("test_center")}
            className="min-h-[44px] gap-2 font-semibold cursor-pointer"
          >
            <Zap className="size-4 text-primary" />
            <span>{isAr ? "بنك الاختبارات الشامل" : "Vocabulary Test Center"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {importantUnit && (
          <div className="surface-card group flex flex-col justify-between rounded-2xl border border-primary/40 p-5 sm:p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-3 py-1 font-mono text-xs font-bold text-primary tracking-wider">
                  {isAr ? "المفردات المهمة" : "IMPORTANT VOCAB"}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {isAr
                    ? `${importantUnit.words.length} كلمة`
                    : `${importantUnit.words.length} words`}
                </span>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
                {isAr ? importantUnit.themeAr : importantUnit.themeEn}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {isAr ? importantUnit.themeEn : importantUnit.themeAr}
              </p>
            </div>
            <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => openFlashcards(9)}
                className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <Layers className="size-3.5" />
                <span>{isAr ? "البطاقات التعليمية" : "Start Flashcards"}</span>
              </button>
              <Button
                type="button"
                size="sm"
                variant="glow"
                onClick={() => setView("unit9_quiz")}
                className="min-h-[40px] gap-1.5 text-xs font-bold cursor-pointer"
              >
                <HelpCircle className="size-3.5" />
                <span>{isAr ? "اختبار المفردات المهمة" : "Important Vocab Quiz"}</span>
              </Button>
            </div>
          </div>
        )}

        {essentialUnit && (
          <div className="surface-card group flex flex-col justify-between rounded-2xl border border-primary/40 p-5 sm:p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-3 py-1 font-mono text-xs font-bold text-primary tracking-wider">
                  {isAr ? "المفردات الأساسية" : "ESSENTIAL VOCAB"}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {isAr
                    ? `${essentialUnit.words.length} كلمة`
                    : `${essentialUnit.words.length} words`}
                </span>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
                {isAr ? essentialUnit.themeAr : essentialUnit.themeEn}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {isAr ? essentialUnit.themeEn : essentialUnit.themeAr}
              </p>
            </div>
            <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => openFlashcards(10)}
                className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <Layers className="size-3.5" />
                <span>{isAr ? "البطاقات التعليمية" : "Start Flashcards"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeckFilter("essential");
                  setView("vocabulary_cards");
                }}
                className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                aria-label="Open Essential Vocabulary"
              >
                <ArrowRight className="size-4 rtl-flip" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
