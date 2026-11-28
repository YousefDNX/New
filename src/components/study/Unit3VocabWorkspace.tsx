import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Shuffle,
  Flame,
  Award,
  Check,
  HelpCircle,
  Layers,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GRADE_9_UNIT_3_WORDS,
  UNIT_3_QUIZZES,
  type Unit3QuizTier,
  type Unit3VocabItem,
} from "@/data/grade9-unit3-vocab";
import { GRADE_9_UNIT_9_WORDS, UNIT_9_QUIZZES } from "@/data/grade9-unit9-vocab";
import { useUser, awardXpIfUnique } from "@/hooks/use-nexora";
import { speakEnglishText } from "@/lib/english-speech";
import { speakArabicText } from "@/lib/speech-service";
import { buildEventDocId } from "@/lib/xp-rules";

type PracticeMode =
  | "flashcards"
  | "en_to_ar"
  | "ar_to_en"
  | "mcq"
  | "match"
  | "fill_blank"
  | "complete_sentence"
  | "context_choice"
  | "spelling"
  | "recognition"
  | "mixed"
  | "quiz";

const PRACTICE_MODES_LIST = [
  {
    id: "flashcards",
    labelEn: "Flashcard Deck",
    labelAr: "البطاقات التعليمية",
    icon: Layers,
    desc: "24 British vocabulary cards with audio & definitions",
  },
  {
    id: "en_to_ar",
    labelEn: "English → Arabic",
    labelAr: "إنجليزي إلى عربي",
    icon: BookOpen,
    desc: "See English word, pick correct Arabic meaning",
  },
  {
    id: "ar_to_en",
    labelEn: "Arabic → English",
    labelAr: "عربي إلى إنجليزي",
    icon: BookOpen,
    desc: "See Arabic meaning, select English term",
  },
  {
    id: "mcq",
    labelEn: "MCQ Definitions",
    labelAr: "اختيار من متعدد",
    icon: CheckCircle2,
    desc: "Match Grade 9 definitions to correct word",
  },
  {
    id: "match",
    labelEn: "Match Pairs",
    labelAr: "مطابقة الأزواج",
    icon: Shuffle,
    desc: "Interactive grid pairing English words with Arabic meanings",
  },
  {
    id: "fill_blank",
    labelEn: "Fill in the Blank",
    labelAr: "أكمل الفراغ",
    icon: HelpCircle,
    desc: "Sentence context with missing vocabulary term",
  },
  {
    id: "complete_sentence",
    labelEn: "Complete Sentence",
    labelAr: "إكمال الجملة",
    icon: ArrowRight,
    desc: "Contextual sentence completion with grammatical check",
  },
  {
    id: "context_choice",
    labelEn: "Context Scenario",
    labelAr: "موقف وسياق واقعي",
    icon: Sparkles,
    desc: "Real-world health and food scenarios",
  },
  {
    id: "spelling",
    labelEn: "British Spelling",
    labelAr: "تحدي الهجاء البريطاني",
    icon: Award,
    desc: "Type exact British spelling (flavour, fibre, etc.)",
  },
  {
    id: "recognition",
    labelEn: "Rapid Recognition",
    labelAr: "التعرّف السريع",
    icon: Flame,
    desc: "Fast-paced memory check testing immediate recall",
  },
  {
    id: "mixed",
    labelEn: "Mixed Revision",
    labelAr: "المراجعة المختلطة",
    icon: RotateCcw,
    desc: "Adaptive shuffle combining all practice styles",
  },
  {
    id: "quiz",
    labelEn: "Ready-Made Quizzes",
    labelAr: "الاختبارات الجاهزة (5)",
    icon: Trophy,
    desc: "5 graded quizzes from Beginner to Final Mastery Exam",
  },
] as const;

const UNIT_3_SCENARIOS: Record<string, string> = {
  "u3-reflect":
    "A museum exhibition of heritage cooking utensils makes visitors pause and think deeply about how family traditions shape community identity. Which verb best fits?",
  "u3-serve":
    "When guests arrive at a Kuwaiti home during Eid, the hosts warmly pour Arabic coffee and hand out warm dates on a brass tray. Which verb describes presenting food or drink to guests?",
  "u3-symbol":
    "A green olive branch appears on international peace posters because people everywhere recognize it as a sign standing for harmony. Which noun describes this?",
  "u3-occasion":
    "Families gather in formal attire for graduation ceremonies and national day banquets because these are memorable celebrations. Which noun refers to such an event?",
  "u3-aromatic":
    "As soon as the chef grinds fresh cardamom pods and cinnamon bark in the kitchen, a warm, sweet, spicy scent fills the entire house. Which adjective describes this scent?",
  "u3-ingredient":
    "To bake traditional flatbread you need flour, water, yeast, and a pinch of salt. Which noun refers to a single food item needed to prepare a dish?",
  "u3-distinctive":
    "Among dozens of desserts on the table, the saffron-infused pudding stands out immediately with its bright golden hue and unforgettable taste. Which adjective describes that unique quality?",
  "u3-recipe":
    "A student wants to cook her grandmother's lentil soup, so she opens a notebook containing the exact measurements and step-by-step cooking directions. What is she reading?",
  "u3-commonly":
    "In coastal cities, grilled fish and spiced rice appear on family lunch tables almost every week across the region. Which adverb means 'often' or 'by most people'?",
  "u3-flavour":
    "Adding roasted cumin and fresh lemon juice transforms a plain broth into a dish with a rich, memorable taste. Which British-spelled noun names that taste?",
  "u3-embrace":
    "After a nutrition workshop at school, students enthusiastically adopt whole-grain breakfasts and regular cycling into their daily routine. Which verb means to accept a new habit willingly?",
  "u3-variety":
    "Instead of eating the same snack every afternoon, a teenager chooses berries, almonds, yoghurt, and sliced carrots throughout the week. Which noun describes this healthy range?",
  "u3-raw":
    "For a crisp garden salad, cucumbers and baby spinach are washed and served completely uncooked so delicate vitamins stay intact. Which adjective describes uncooked food?",
  "u3-energetic":
    "After eight hours of restful sleep and a balanced oatmeal breakfast, the athlete feels lively, alert, and ready for a full afternoon match. Which adjective describes this vitality?",
  "u3-source":
    "Nutritionists recommend chickpeas, lentils, and almonds because they provide a dependable origin of plant-based protein. Which noun names the place something comes from?",
  "u3-fibre":
    "Whole-grain oats and leafy greens contain an indigestible plant substance that keeps the digestive system running smoothly. Which British-spelled noun names this nutrient?",
  "u3-considerably":
    "Once the school cafeteria replaced sugary sodas with water and fresh fruit, afternoon fatigue among students dropped to a very noticeable extent. Which adverb means 'significantly'?",
  "u3-homemade":
    "Rather than buying canned tomato soup full of preservatives, the family simmers fresh tomatoes and basil in their own kitchen. Which adjective describes food prepared at home?",
  "u3-produce":
    "Every Saturday morning, local farmers unload crates of freshly picked tomatoes, crisp lettuce, and ripe figs at the market stalls. Which noun refers to fresh farm crops?",
  "u3-organic":
    "A student visits a supermarket looking for fresh vegetables that were grown without any artificial pesticides or chemical sprays. What word describes this agricultural harvest?",
  "u3-harmful":
    "Health regulators warn against excess artificial dyes and trans fats because they can damage heart health over time. Which adjective means causing injury or disadvantage?",
  "u3-label":
    "Before placing a boxed cereal in the trolley, a careful shopper reads the printed panel on the side to check sugar grams per serving. What is that printed tag called?",
  "u3-obviously":
    "Seeing dark storm clouds gather and rain splashing against the window, it is clear without any explanation that outdoor practice will be moved inside. Which adverb fits?",
  "u3-maintain":
    "To keep a healthy weight and strong stamina throughout exam season, a student sticks to balanced meals and daily brisk walks. Which verb means to keep something in good condition?",
};

export function Unit3VocabWorkspace() {
  const { data: user } = useUser();
  const [selectedUnit, setSelectedUnit] = useState<3 | 9>(3);
  const activeWords = selectedUnit === 9 ? GRADE_9_UNIT_9_WORDS : GRADE_9_UNIT_3_WORDS;
  const activeQuizzes = selectedUnit === 9 ? UNIT_9_QUIZZES : UNIT_3_QUIZZES;

  const [activeMode, setActiveMode] = useState<PracticeMode>("flashcards");
  const [selectedWordIndex, setSelectedWordIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("btc_u3_known");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [mistakes, setMistakes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("btc_u3_mistakes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active quiz state
  const [activeQuizTier, setActiveQuizTier] = useState<Unit3QuizTier | null>(null);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Practice state
  const [practiceQuestionIndex, setPracticeQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [spellingInput, setSpellingInput] = useState("");
  const [showSpellingHint, setShowSpellingHint] = useState(false);

  // Matching game state
  const [matchSetIndex, setMatchSetIndex] = useState(0);
  const [matchSelected, setMatchSelected] = useState<{ id: string; side: "en" | "ar" } | null>(
    null,
  );
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());

  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem("btc_u3_known", JSON.stringify(Array.from(knownWords)));
    } catch {
      // ignore storage error
    }
  }, [knownWords]);

  useEffect(() => {
    try {
      localStorage.setItem("btc_u3_mistakes", JSON.stringify(mistakes));
    } catch {
      // ignore
    }
  }, [mistakes]);

  const currentWord = activeWords[selectedWordIndex % activeWords.length];

  // Audio pronunciation via unified bilingual speech service (dynamic accent, or explicit en-US / en-GB)
  const speakWord = (text: string, accent?: "en-US" | "en-GB") => {
    const ok = speakEnglishText(text, { rate: 0.9, accent, lang: accent });
    if (!ok) {
      toast.info(`Pronunciation: ${text}`);
    }
  };

  const speakArabicMeaning = (arabicText: string) => {
    const ok = speakArabicText(arabicText, { rate: 0.92, preferredLocale: "ar-SA" });
    if (!ok) {
      toast.info(`النطق بالعربية: ${arabicText}`);
    }
  };

  const toggleWordKnown = (wordId: string) => {
    setKnownWords((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
        // remove from mistakes if mastered
        setMistakes((m) => m.filter((w) => w !== wordId));
      }
      return next;
    });
  };

  const logMistake = (wordId: string) => {
    setMistakes((prev) => (prev.includes(wordId) ? prev : [...prev, wordId]));
  };

  // Generate 4 multiple-choice options for current practice question
  const currentPracticeWord = activeWords[practiceQuestionIndex % activeWords.length];

  const practiceOptions = useMemo<Unit3VocabItem[]>(() => {
    const correct = currentPracticeWord;
    if (!correct) return [];
    const others = activeWords
      .filter((w) => w.id !== correct.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    return [correct, ...others].sort(() => 0.5 - Math.random());
  }, [currentPracticeWord, activeWords]);

  const handleNextPracticeQuestion = () => {
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setSpellingInput("");
    setShowSpellingHint(false);
    setPracticeQuestionIndex((i) => (i + 1) % activeWords.length);
  };

  // Match grid pairs
  const matchWords = useMemo(() => {
    const pageSize = Math.min(8, activeWords.length);
    const setsCount = Math.max(1, Math.floor(activeWords.length / pageSize));
    const start = (matchSetIndex % setsCount) * pageSize;
    return activeWords.slice(start, start + pageSize);
  }, [matchSetIndex, activeWords]);

  const shuffledEnglish = useMemo(() => {
    return [...matchWords].sort(() => 0.5 - Math.random());
  }, [matchWords]);

  const shuffledArabic = useMemo(() => {
    return [...matchWords].sort(() => 0.5 - Math.random());
  }, [matchWords]);

  const handleMatchClick = (id: string, side: "en" | "ar") => {
    if (matchedPairs.has(id)) return;

    if (!matchSelected) {
      setMatchSelected({ id, side });
      return;
    }
    if (matchSelected.side === side) {
      setMatchSelected(matchSelected.id === id ? null : { id, side });
      return;
    }
    if (matchSelected.id === id) {
      setMatchedPairs((prev) => new Set([...prev, id]));
      setMatchSelected(null);
      toast.success("Match found!");
    } else {
      toast.error("Not a match, try again");
      setMatchSelected(null);
    }
  };

  // Start a Quiz
  const startQuiz = (tier: Unit3QuizTier) => {
    setActiveQuizTier(tier);
    setQuizQuestionIndex(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setActiveMode("quiz");
  };

  const handleQuizSubmit = async () => {
    if (!activeQuizTier) return;
    setQuizSubmitted(true);
    let correctCount = 0;
    activeQuizTier.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correctCount++;
      } else {
        logMistake(q.word);
      }
    });

    const percentage = Math.round((correctCount / activeQuizTier.questions.length) * 100);
    toast.success(
      `Quiz Completed! Score: ${correctCount}/${activeQuizTier.questions.length} (${percentage}%)`,
    );

    if (user?.uid && percentage >= 70) {
      await awardXpIfUnique({
        userId: user.uid,
        eventDocId: buildEventDocId(
          user.uid,
          "QUIZ_COMPLETED",
          activeQuizTier.id,
          new Date().toISOString().slice(0, 10),
        ),
        eventType: "QUIZ_COMPLETED",
        area: "academic",
        xpReward: activeQuizTier.xpReward,
        refId: activeQuizTier.id,
        nowIso: new Date().toISOString(),
      });
      toast.success(`+${activeQuizTier.xpReward} Academic XP Awarded!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mastery Stats */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-surface via-surface-2 to-surface p-5 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-md bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
              <GraduationCap className="size-4" />
              <span>
                {selectedUnit === 9
                  ? "GRADE 9 — IMPORTANT VOCABULARY & SCIENCE LIBRARY"
                  : "GRADE 9 — UNIT 3 VOCABULARY LIBRARY"}
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-foreground">
              {selectedUnit === 9
                ? "Science, Technology & Future Innovations"
                : "Food, Culture & Healthy Living"}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {selectedUnit === 9
                ? "Master important scientific terms, algorithms, sustainable systems, and innovation vocabulary with interactive quizzes and practice tests."
                : "Master all 24 official British vocabulary words with accurate Arabic definitions, audio pronunciation, practice modes, and quizzes."}
            </p>

            {/* Topic Switcher */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-semibold text-muted-foreground">Select Deck:</span>
              <Button
                type="button"
                size="sm"
                variant={selectedUnit === 3 ? "glow" : "outline"}
                onClick={() => {
                  setSelectedUnit(3);
                  setSelectedWordIndex(0);
                  setPracticeQuestionIndex(0);
                  setActiveQuizTier(UNIT_3_QUIZZES[0] ?? null);
                }}
                className="h-7 text-xs font-bold cursor-pointer"
              >
                Unit 3 (24 Words)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={selectedUnit === 9 ? "glow" : "outline"}
                onClick={() => {
                  setSelectedUnit(9);
                  setSelectedWordIndex(0);
                  setPracticeQuestionIndex(0);
                  setActiveQuizTier(UNIT_9_QUIZZES[0] ?? null);
                }}
                className="h-7 text-xs font-bold cursor-pointer"
              >
                Important Vocabulary — Science &amp; Tech (24 Words &amp; Tests)
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <FeatureGuideTrigger featureId="unit3-vocab" />
            <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-2.5 text-center">
              <div className="text-2xl font-black font-display text-primary">
                {knownWords.size}
                <span className="text-sm font-normal text-muted-foreground">
                  /{activeWords.length}
                </span>
              </div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Words Mastered
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-2.5 text-center">
              <div className="text-2xl font-black font-display text-amber-500">
                {mistakes.length}
              </div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Needs Review
              </div>
            </div>
          </div>
        </div>

        {/* Practice Mode Selector Tabs */}
        <div className="mt-5 flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 no-scrollbar">
          {PRACTICE_MODES_LIST.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  setActiveMode(mode.id as PracticeMode);
                  setSelectedOption(null);
                  setIsAnswerChecked(false);
                  setSpellingInput("");
                  setShowSpellingHint(false);
                  if (mode.id === "quiz" && !activeQuizTier) {
                    setActiveQuizTier(activeQuizzes[0] ?? null);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface-2/60 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{mode.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODE 1: FLASHCARDS DECK */}
      {activeMode === "flashcards" && currentWord && (
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              Card {selectedWordIndex + 1} of {GRADE_9_UNIT_3_WORDS.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary">
                {currentWord.partOfSpeech.toUpperCase()}
              </span>
              <span>·</span>
              <span className="font-mono">{currentWord.phonetic}</span>
            </div>
          </div>

          {/* Flip Card Container */}
          <div
            onClick={() => setFlipped(!flipped)}
            className="group relative h-80 w-full cursor-pointer select-none rounded-2xl border border-border/80 bg-surface p-8 shadow-card transition-all hover:border-primary/40 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                <Sparkles className="size-3.5" />
                <span>British Curriculum Form</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(currentWord.word);
                }}
                className="size-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
                title="Listen to pronunciation"
                aria-label="Listen to pronunciation"
              >
                <Volume2 className="size-4.5" />
              </button>
            </div>

            {!flipped ? (
              <div className="text-center my-auto space-y-3">
                <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                  {currentWord.word}
                </h2>
                <div className="text-sm font-mono text-muted-foreground">
                  {currentWord.phonetic}
                </div>
                <div className="text-xs text-primary/80 font-medium">
                  (Click card to reveal Arabic meaning & definition)
                </div>
              </div>
            ) : (
              <div className="text-center my-auto space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-2 text-lg md:text-2xl font-bold">
                  <span className="font-display text-foreground">{currentWord.word}</span>
                  <span className="text-muted-foreground">—</span>
                  <span className="font-arabic text-primary" dir="rtl">
                    {currentWord.meaningAr}
                  </span>
                </div>
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakArabicMeaning(currentWord.meaningAr);
                    }}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Volume2 className="size-3.5 text-primary" />
                    <span className="font-arabic">استمع بالعربية</span>
                  </Button>
                </div>
                <p className="text-sm text-foreground/90 max-w-md mx-auto leading-relaxed">
                  {currentWord.definitionEn}
                </p>
                <div className="p-3 rounded-xl bg-surface-2/60 text-xs text-muted-foreground text-start border border-border/60">
                  <div className="font-semibold text-foreground">Example:</div>
                  <div className="italic mt-0.5">"{currentWord.exampleEn}"</div>
                  <div className="mt-1 text-primary/80 font-arabic text-start text-[11px]">
                    {currentWord.exampleAr}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWordKnown(currentWord.id);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                  knownWords.has(currentWord.id)
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Check className="size-3.5" />
                <span>{knownWords.has(currentWord.id) ? "Mastered" : "Mark as Mastered"}</span>
              </button>

              <span className="text-[11px] text-muted-foreground">
                {flipped ? "Click to flip front" : "Click to flip back"}
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFlipped(false);
                setSelectedWordIndex(
                  (i) => (i - 1 + GRADE_9_UNIT_3_WORDS.length) % GRADE_9_UNIT_3_WORDS.length,
                );
              }}
              disabled={selectedWordIndex === 0}
            >
              <ArrowLeft className="size-4 mr-1 rtl-flip" />
              Previous
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                speakWord(currentWord.word);
              }}
            >
              <Volume2 className="size-4 mr-1 text-primary" />
              Listen (en-GB)
            </Button>

            <Button
              type="button"
              variant="glow"
              size="sm"
              onClick={() => {
                setFlipped(false);
                setSelectedWordIndex((i) => (i + 1) % GRADE_9_UNIT_3_WORDS.length);
              }}
            >
              Next
              <ArrowRight className="size-4 ml-1 rtl-flip" />
            </Button>
          </div>
        </div>
      )}

      {/* MODE 2: ENGLISH TO ARABIC */}
      {activeMode === "en_to_ar" && currentPracticeWord && (
        <div className="surface-card max-w-xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Question {practiceQuestionIndex + 1} of 24</span>
            <span className="text-primary font-semibold">Mode: English → Arabic</span>
          </div>

          <div className="text-center space-y-2 py-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Select the correct Arabic meaning for:
            </div>
            <div className="text-3xl font-extrabold font-display text-foreground">
              {currentPracticeWord.word}
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              {currentPracticeWord.phonetic}
            </div>
            <div className="text-xs italic text-muted-foreground pt-1">
              "{currentPracticeWord.exampleEn}"
            </div>
          </div>

          <div className="grid gap-2.5">
            {practiceOptions.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = opt.id === currentPracticeWord.id;
              let btnClass =
                "border border-border/80 bg-surface-2/40 hover:bg-surface-2 text-foreground";
              if (isAnswerChecked) {
                if (isCorrect)
                  btnClass =
                    "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold";
                else if (isSelected)
                  btnClass = "border-destructive bg-destructive/15 text-destructive";
              } else if (isSelected) {
                btnClass = "border-primary bg-primary/10 text-primary";
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isAnswerChecked}
                  onClick={() => setSelectedOption(idx)}
                  className={`flex items-center justify-between p-3.5 rounded-xl text-start transition-all ${btnClass}`}
                >
                  <span className="font-arabic text-base font-semibold">{opt.meaningAr}</span>
                  {isAnswerChecked && isCorrect && (
                    <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {isAnswerChecked && isSelected && !isCorrect && (
                    <XCircle className="size-4.5 text-destructive" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            {!isAnswerChecked ? (
              <Button
                type="button"
                variant="glow"
                className="w-full"
                disabled={selectedOption === null}
                onClick={() => {
                  if (selectedOption === null) return;
                  setIsAnswerChecked(true);
                  const isCorrect = practiceOptions[selectedOption]?.id === currentPracticeWord.id;
                  if (isCorrect) {
                    toast.success("Correct! Excellent job.");
                  } else {
                    toast.error("Incorrect. Added to mistakes to review.");
                    logMistake(currentPracticeWord.id);
                  }
                }}
              >
                Check Answer
              </Button>
            ) : (
              <Button
                type="button"
                variant="glow"
                className="w-full"
                onClick={handleNextPracticeQuestion}
              >
                Next Word <ArrowRight className="size-4 ml-1.5 rtl-flip" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* MODE 3: ARABIC TO ENGLISH */}
      {activeMode === "ar_to_en" && currentPracticeWord && (
        <div className="surface-card max-w-xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Question {practiceQuestionIndex + 1} of 24</span>
            <span className="text-primary font-semibold">Mode: Arabic → English</span>
          </div>

          <div className="text-center space-y-2 py-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Select the English word matching:
            </div>
            <div className="text-3xl font-extrabold font-arabic text-primary">
              {currentPracticeWord.meaningAr}
            </div>
            <div className="text-xs text-muted-foreground">
              Part of speech:{" "}
              <span className="font-semibold text-foreground">
                {currentPracticeWord.partOfSpeech}
              </span>
            </div>
          </div>

          <div className="grid gap-2.5">
            {practiceOptions.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = opt.id === currentPracticeWord.id;
              let btnClass =
                "border border-border/80 bg-surface-2/40 hover:bg-surface-2 text-foreground";
              if (isAnswerChecked) {
                if (isCorrect)
                  btnClass =
                    "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold";
                else if (isSelected)
                  btnClass = "border-destructive bg-destructive/15 text-destructive";
              } else if (isSelected) {
                btnClass = "border-primary bg-primary/10 text-primary";
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isAnswerChecked}
                  onClick={() => setSelectedOption(idx)}
                  className={`flex items-center justify-between p-3.5 rounded-xl text-start transition-all ${btnClass}`}
                >
                  <span className="font-display text-base font-bold">{opt.word}</span>
                  <span className="text-xs font-mono text-muted-foreground">{opt.phonetic}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            {!isAnswerChecked ? (
              <Button
                type="button"
                variant="glow"
                className="w-full"
                disabled={selectedOption === null}
                onClick={() => {
                  if (selectedOption === null) return;
                  setIsAnswerChecked(true);
                  const isCorrect = practiceOptions[selectedOption]?.id === currentPracticeWord.id;
                  if (isCorrect) {
                    toast.success("Correct! Well done.");
                  } else {
                    toast.error("Incorrect. Added to mistakes to review.");
                    logMistake(currentPracticeWord.id);
                  }
                }}
              >
                Check Answer
              </Button>
            ) : (
              <Button
                type="button"
                variant="glow"
                className="w-full"
                onClick={handleNextPracticeQuestion}
              >
                Next Word <ArrowRight className="size-4 ml-1.5 rtl-flip" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* MODE 4: MCQ DEFINITIONS */}
      {activeMode === "mcq" && currentPracticeWord && (
        <div className="surface-card max-w-xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Question {practiceQuestionIndex + 1} of 24</span>
            <span className="text-primary font-semibold">Mode: Definition Match</span>
          </div>

          <div className="space-y-2 py-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Which word matches this definition?
            </div>
            <div className="text-base font-medium text-foreground bg-surface-2/60 p-4 rounded-xl border border-border/70 leading-relaxed">
              "{currentPracticeWord.definitionEn}"
            </div>
          </div>

          <div className="grid gap-2.5">
            {practiceOptions.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = opt.id === currentPracticeWord.id;
              let btnClass =
                "border border-border/80 bg-surface-2/40 hover:bg-surface-2 text-foreground";
              if (isAnswerChecked) {
                if (isCorrect)
                  btnClass =
                    "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold";
                else if (isSelected)
                  btnClass = "border-destructive bg-destructive/15 text-destructive";
              } else if (isSelected) {
                btnClass = "border-primary bg-primary/10 text-primary";
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isAnswerChecked}
                  onClick={() => setSelectedOption(idx)}
                  className={`flex items-center justify-between p-3.5 rounded-xl text-start transition-all ${btnClass}`}
                >
                  <span className="font-display font-bold text-base">{opt.word}</span>
                  <span className="font-arabic text-xs text-muted-foreground">{opt.meaningAr}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            {!isAnswerChecked ? (
              <Button
                type="button"
                variant="glow"
                className="w-full"
                disabled={selectedOption === null}
                onClick={() => {
                  if (selectedOption === null) return;
                  setIsAnswerChecked(true);
                  const isCorrect = practiceOptions[selectedOption]?.id === currentPracticeWord.id;
                  if (isCorrect) {
                    toast.success("Correct definition!");
                  } else {
                    toast.error("Incorrect. Added to mistakes to review.");
                    logMistake(currentPracticeWord.id);
                  }
                }}
              >
                Check Answer
              </Button>
            ) : (
              <Button
                type="button"
                variant="glow"
                className="w-full"
                onClick={handleNextPracticeQuestion}
              >
                Next Question <ArrowRight className="size-4 ml-1.5 rtl-flip" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* MODE 5: MATCH PAIRS */}
      {activeMode === "match" && (
        <div className="surface-card max-w-2xl mx-auto p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Set {(matchSetIndex % 3) + 1} of 3 · Pairs Matched: {matchedPairs.size} /{" "}
              {matchWords.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setMatchSetIndex((i) => (i + 1) % 3);
                  setMatchedPairs(new Set());
                  setMatchSelected(null);
                }}
              >
                <Shuffle className="size-3 mr-1" /> Switch Set ({((matchSetIndex + 1) % 3) + 1}/3)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setMatchedPairs(new Set());
                  setMatchSelected(null);
                }}
              >
                <RotateCcw className="size-3 mr-1" /> Reset Grid
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* English column */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-foreground uppercase tracking-wider text-center">
                English Vocabulary
              </div>
              {shuffledEnglish.map((item) => {
                const isMatched = matchedPairs.has(item.id);
                const isSelected = matchSelected?.id === item.id && matchSelected?.side === "en";
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isMatched}
                    onClick={() => handleMatchClick(item.id, "en")}
                    className={`w-full p-3 rounded-xl text-center font-display font-bold text-sm transition-all ${
                      isMatched
                        ? "opacity-40 bg-surface-2 line-through text-muted-foreground border border-transparent"
                        : isSelected
                          ? "bg-primary text-primary-foreground shadow-glow border border-primary scale-[1.02]"
                          : "bg-surface-2/60 hover:bg-surface-2 text-foreground border border-border/70"
                    }`}
                  >
                    {item.word}
                  </button>
                );
              })}
            </div>

            {/* Arabic column */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-foreground uppercase tracking-wider text-center">
                Arabic Meaning
              </div>
              {shuffledArabic.map((item) => {
                const isMatched = matchedPairs.has(item.id);
                const isSelected = matchSelected?.id === item.id && matchSelected?.side === "ar";
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isMatched}
                    onClick={() => handleMatchClick(item.id, "ar")}
                    className={`w-full p-3 rounded-xl text-center font-arabic font-semibold text-sm transition-all ${
                      isMatched
                        ? "opacity-40 bg-surface-2 line-through text-muted-foreground border border-transparent"
                        : isSelected
                          ? "bg-primary text-primary-foreground shadow-glow border border-primary scale-[1.02]"
                          : "bg-surface-2/60 hover:bg-surface-2 text-foreground border border-border/70"
                    }`}
                  >
                    {item.meaningAr}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 6: FILL IN THE BLANK */}
      {activeMode === "fill_blank" && currentPracticeWord && (
        <div className="surface-card max-w-xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Fill-in-the-Blank {practiceQuestionIndex + 1} of 24</span>
            <span className="text-primary font-semibold">Mode: Sentence Completion</span>
          </div>

          <div className="space-y-3 py-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Fill the blank with the correct word:
            </div>
            <div className="text-base font-medium text-foreground bg-surface-2/60 p-4 rounded-xl border border-border/70 leading-relaxed">
              "
              {currentPracticeWord.exampleEn.replace(
                new RegExp(`\\b${currentPracticeWord.word}\\b`, "i"),
                "_______",
              )}
              "
            </div>
            <div className="text-xs text-muted-foreground text-start font-arabic">
              الترجمة: {currentPracticeWord.exampleAr}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {practiceOptions.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = opt.id === currentPracticeWord.id;
              let btnClass =
                "border border-border/80 bg-surface-2/40 hover:bg-surface-2 text-foreground";
              if (isAnswerChecked) {
                if (isCorrect)
                  btnClass =
                    "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold";
                else if (isSelected)
                  btnClass = "border-destructive bg-destructive/15 text-destructive";
              } else if (isSelected) {
                btnClass = "border-primary bg-primary/10 text-primary";
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isAnswerChecked}
                  onClick={() => setSelectedOption(idx)}
                  className={`p-3 rounded-xl text-center font-display font-bold text-sm transition-all ${btnClass}`}
                >
                  {opt.word}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            {!isAnswerChecked ? (
              <Button
                type="button"
                variant="glow"
                className="w-full"
                disabled={selectedOption === null}
                onClick={() => {
                  if (selectedOption === null) return;
                  setIsAnswerChecked(true);
                  const isCorrect = practiceOptions[selectedOption]?.id === currentPracticeWord.id;
                  if (isCorrect) {
                    toast.success("Perfect fill-in!");
                  } else {
                    toast.error("Incorrect. Added to mistakes to review.");
                    logMistake(currentPracticeWord.id);
                  }
                }}
              >
                Check Answer
              </Button>
            ) : (
              <Button
                type="button"
                variant="glow"
                className="w-full"
                onClick={handleNextPracticeQuestion}
              >
                Next Sentence <ArrowRight className="size-4 ml-1.5 rtl-flip" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* MODE 7: COMPLETE SENTENCE */}
      {activeMode === "complete_sentence" && currentPracticeWord && (
        <div className="surface-card max-w-xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Context Practice {practiceQuestionIndex + 1} of 24</span>
            <span className="text-primary font-semibold">Mode: Grammatical Fit</span>
          </div>

          <div className="space-y-3 py-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Select the term that grammatically completes this context:
            </div>
            <div className="text-sm font-medium text-foreground bg-surface-2/60 p-4 rounded-xl border border-border/70 leading-relaxed">
              Target grammatical category:{" "}
              <strong className="text-primary">
                {currentPracticeWord.partOfSpeech.toUpperCase()}
              </strong>
              .
              <br />
              Contextual definition: {currentPracticeWord.definitionEn}
            </div>
          </div>

          <div className="grid gap-2.5">
            {practiceOptions.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = opt.id === currentPracticeWord.id;
              let btnClass =
                "border border-border/80 bg-surface-2/40 hover:bg-surface-2 text-foreground";
              if (isAnswerChecked) {
                if (isCorrect)
                  btnClass =
                    "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold";
                else if (isSelected)
                  btnClass = "border-destructive bg-destructive/15 text-destructive";
              } else if (isSelected) {
                btnClass = "border-primary bg-primary/10 text-primary";
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isAnswerChecked}
                  onClick={() => setSelectedOption(idx)}
                  className={`flex items-center justify-between p-3.5 rounded-xl text-start transition-all ${btnClass}`}
                >
                  <span className="font-display text-base font-bold">{opt.word}</span>
                  <span className="text-xs text-muted-foreground font-arabic">{opt.meaningAr}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            {!isAnswerChecked ? (
              <Button
                type="button"
                variant="glow"
                className="w-full"
                disabled={selectedOption === null}
                onClick={() => {
                  if (selectedOption === null) return;
                  setIsAnswerChecked(true);
                  const isCorrect = practiceOptions[selectedOption]?.id === currentPracticeWord.id;
                  if (isCorrect) {
                    toast.success("Correct fit!");
                  } else {
                    toast.error("Incorrect. Added to mistakes to review.");
                    logMistake(currentPracticeWord.id);
                  }
                }}
              >
                Verify Completion
              </Button>
            ) : (
              <Button
                type="button"
                variant="glow"
                className="w-full"
                onClick={handleNextPracticeQuestion}
              >
                Next Word <ArrowRight className="size-4 ml-1.5 rtl-flip" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* MODE 8: CONTEXT SCENARIO */}
      {activeMode === "context_choice" && currentPracticeWord && (
        <div className="surface-card max-w-xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Scenario {practiceQuestionIndex + 1} of 24</span>
            <span className="text-primary font-semibold">Mode: Real-World Scenario</span>
          </div>

          <div className="space-y-3 py-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Read the scenario and choose the appropriate Unit 3 term:
            </div>
            <div
              data-testid="context-scenario-prompt"
              className="text-sm font-medium text-foreground bg-surface-2/60 p-4 rounded-xl border border-border/70 leading-relaxed"
            >
              "{UNIT_3_SCENARIOS[currentPracticeWord.id] ?? currentPracticeWord.definitionEn}"
            </div>
          </div>

          <div className="grid gap-2.5">
            {practiceOptions.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = opt.id === currentPracticeWord.id;
              let btnClass =
                "border border-border/80 bg-surface-2/40 hover:bg-surface-2 text-foreground";
              if (isAnswerChecked) {
                if (isCorrect)
                  btnClass =
                    "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold";
                else if (isSelected)
                  btnClass = "border-destructive bg-destructive/15 text-destructive";
              } else if (isSelected) {
                btnClass = "border-primary bg-primary/10 text-primary";
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isAnswerChecked}
                  onClick={() => setSelectedOption(idx)}
                  className={`p-3.5 rounded-xl font-display font-bold text-sm text-start transition-all ${btnClass}`}
                >
                  {opt.word}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            {!isAnswerChecked ? (
              <Button
                type="button"
                variant="glow"
                className="w-full"
                disabled={selectedOption === null}
                onClick={() => {
                  if (selectedOption === null) return;
                  setIsAnswerChecked(true);
                  const isCorrect = practiceOptions[selectedOption]?.id === currentPracticeWord.id;
                  if (isCorrect) {
                    toast.success("Correct scenario match!");
                  } else {
                    toast.error("Incorrect scenario match. Added to mistakes to review.");
                    logMistake(currentPracticeWord.id);
                  }
                }}
              >
                Submit Scenario
              </Button>
            ) : (
              <Button
                type="button"
                variant="glow"
                className="w-full"
                onClick={handleNextPracticeQuestion}
              >
                Next Scenario <ArrowRight className="size-4 ml-1.5 rtl-flip" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* MODE 9: BRITISH SPELLING CHALLENGE */}
      {activeMode === "spelling" && currentPracticeWord && (
        <div className="surface-card max-w-xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Spelling Word {practiceQuestionIndex + 1} of 24</span>
            <span className="text-primary font-semibold">Mode: British Spelling</span>
          </div>

          <div className="text-center space-y-3 py-4">
            <button
              type="button"
              onClick={() => speakWord(currentPracticeWord.word)}
              className="mx-auto size-14 rounded-full bg-primary/15 text-primary hover:bg-primary/25 flex items-center justify-center transition-all shadow-glow"
              aria-label="Click to hear pronunciation"
            >
              <Volume2 className="size-7" />
            </button>
            <div className="text-xs text-muted-foreground">Click audio icon to listen (en-GB)</div>
            <div className="font-arabic text-xl font-bold text-primary">
              المعنى: {currentPracticeWord.meaningAr}
            </div>
            <div className="text-xs text-muted-foreground">{currentPracticeWord.definitionEn}</div>
          </div>

          <div className="space-y-2">
            <Input
              type="text"
              value={spellingInput}
              onChange={(e) => setSpellingInput(e.target.value)}
              placeholder="Type exact British spelling..."
              className="text-center font-display font-bold text-lg tracking-wider"
              autoComplete="off"
              spellCheck="false"
              disabled={isAnswerChecked}
            />

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowSpellingHint(!showSpellingHint)}
                className="text-primary hover:underline text-[11px]"
              >
                {showSpellingHint ? "Hide Hint" : "Show Letter Hint"}
              </button>
              {showSpellingHint && (
                <span className="font-mono text-muted-foreground">
                  Starts with: <strong>{currentPracticeWord.word.slice(0, 2)}...</strong> (
                  {currentPracticeWord.word.length} letters)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {!isAnswerChecked ? (
              <Button
                type="button"
                variant="glow"
                className="w-full"
                disabled={!spellingInput.trim()}
                onClick={() => {
                  setIsAnswerChecked(true);
                  const isCorrect =
                    spellingInput.trim().toLowerCase() === currentPracticeWord.word.toLowerCase();
                  if (isCorrect) {
                    toast.success(`Correct spelling! "${currentPracticeWord.word}"`);
                  } else {
                    toast.error(
                      `Incorrect. Correct British spelling: "${currentPracticeWord.word}"`,
                    );
                    logMistake(currentPracticeWord.id);
                  }
                }}
              >
                Check British Spelling
              </Button>
            ) : (
              <Button
                type="button"
                variant="glow"
                className="w-full"
                onClick={handleNextPracticeQuestion}
              >
                Next Word <ArrowRight className="size-4 ml-1.5 rtl-flip" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* MODE 10: RAPID RECOGNITION */}
      {activeMode === "recognition" && currentPracticeWord && (
        <div className="surface-card max-w-xl mx-auto p-6 space-y-6 text-center">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Card {practiceQuestionIndex + 1} of 24</span>
            <span className="text-primary font-semibold">Mode: Rapid Recognition</span>
          </div>

          <div className="py-8 space-y-4">
            <div className="text-4xl md:text-5xl font-black font-display text-foreground">
              {currentPracticeWord.word}
            </div>
            <div className="text-sm font-mono text-muted-foreground">
              {currentPracticeWord.phonetic}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="border-destructive/40 hover:bg-destructive/10 text-destructive"
              onClick={() => {
                logMistake(currentPracticeWord.id);
                toast.info(`Review later: ${currentPracticeWord.meaningAr}`);
                handleNextPracticeQuestion();
              }}
            >
              <XCircle className="size-4 mr-2" />
              Need to Review
            </Button>

            <Button
              type="button"
              variant="glow"
              size="lg"
              onClick={() => {
                toggleWordKnown(currentPracticeWord.id);
                toast.success("Recognized!");
                handleNextPracticeQuestion();
              }}
            >
              <CheckCircle2 className="size-4 mr-2" />I Know This Word
            </Button>
          </div>
        </div>
      )}

      {/* MODE 11: MIXED REVISION */}
      {activeMode === "mixed" && currentPracticeWord && (
        <div className="surface-card max-w-xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Mixed Revision Question {practiceQuestionIndex + 1}</span>
            <span className="text-primary font-semibold">Adaptive Mix</span>
          </div>

          <div className="space-y-3 py-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Complete the vocabulary pairing:
            </div>
            <div className="text-2xl font-bold font-display text-foreground text-center py-2">
              {currentPracticeWord.word}
            </div>
            <div className="text-xs text-center text-muted-foreground italic">
              Example context: "{currentPracticeWord.exampleEn}"
            </div>
          </div>

          <div className="grid gap-2.5">
            {practiceOptions.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = opt.id === currentPracticeWord.id;
              let btnClass =
                "border border-border/80 bg-surface-2/40 hover:bg-surface-2 text-foreground";
              if (isAnswerChecked) {
                if (isCorrect)
                  btnClass =
                    "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold";
                else if (isSelected)
                  btnClass = "border-destructive bg-destructive/15 text-destructive";
              } else if (isSelected) {
                btnClass = "border-primary bg-primary/10 text-primary";
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isAnswerChecked}
                  onClick={() => setSelectedOption(idx)}
                  className={`flex items-center justify-between p-3.5 rounded-xl text-start transition-all ${btnClass}`}
                >
                  <span className="font-arabic text-base font-semibold">{opt.meaningAr}</span>
                  <span className="text-xs text-muted-foreground">
                    {opt.definitionEn.slice(0, 35)}...
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            {!isAnswerChecked ? (
              <Button
                type="button"
                variant="glow"
                className="w-full"
                disabled={selectedOption === null}
                onClick={() => {
                  if (selectedOption === null) return;
                  setIsAnswerChecked(true);
                  const isCorrect = practiceOptions[selectedOption]?.id === currentPracticeWord.id;
                  if (isCorrect) {
                    toast.success("Correct!");
                  } else {
                    toast.error("Incorrect. Added to review.");
                    logMistake(currentPracticeWord.id);
                  }
                }}
              >
                Verify Answer
              </Button>
            ) : (
              <Button
                type="button"
                variant="glow"
                className="w-full"
                onClick={handleNextPracticeQuestion}
              >
                Next Question <ArrowRight className="size-4 ml-1.5 rtl-flip" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* MODE 12: 5 READY-MADE QUIZZES */}
      {activeMode === "quiz" && (
        <div className="space-y-6">
          {/* Quiz Tier Picker */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {UNIT_3_QUIZZES.map((quiz) => {
              const isSelected = activeQuizTier?.id === quiz.id;
              return (
                <button
                  key={quiz.id}
                  type="button"
                  onClick={() => startQuiz(quiz)}
                  className={`surface-card p-4 text-start transition-all ${
                    isSelected
                      ? "border-primary shadow-glow bg-primary/10"
                      : "hover:border-primary/40 hover:bg-surface-2"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      +{quiz.xpReward} XP
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {quiz.questions.length} Qs
                    </span>
                  </div>
                  <div className="mt-2 font-display text-sm font-bold text-foreground">
                    {quiz.titleEn.split(":")[0]}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                    {quiz.descriptionEn}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Quiz Card */}
          {activeQuizTier && (
            <div className="surface-card max-w-2xl mx-auto p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/70 pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {activeQuizTier.titleEn}
                  </h3>
                  <div className="font-arabic text-xs text-primary">{activeQuizTier.titleAr}</div>
                </div>
                <div className="text-end">
                  <div className="text-xs font-semibold text-muted-foreground">
                    Question {quizQuestionIndex + 1} of {activeQuizTier.questions.length}
                  </div>
                  <div className="text-[10px] text-primary font-bold">
                    Reward: +{activeQuizTier.xpReward} XP
                  </div>
                </div>
              </div>

              {!quizSubmitted ? (
                // Active Question View
                (() => {
                  const q = activeQuizTier.questions[quizQuestionIndex];
                  if (!q) return null;
                  const chosen = quizAnswers[quizQuestionIndex];
                  return (
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <div className="text-base font-semibold text-foreground leading-relaxed">
                          {q.questionEn}
                        </div>
                        {q.questionAr && (
                          <div className="font-arabic text-xs text-muted-foreground">
                            {q.questionAr}
                          </div>
                        )}
                      </div>

                      <div className="grid gap-2.5">
                        {q.options.map((opt, optIdx) => {
                          const isOptSelected = chosen === optIdx;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setQuizAnswers((prev) => ({
                                  ...prev,
                                  [quizQuestionIndex]: optIdx,
                                }));
                              }}
                              className={`flex items-center justify-between p-3.5 rounded-xl text-start font-medium transition-all ${
                                isOptSelected
                                  ? "border border-primary bg-primary/10 text-primary font-bold shadow-sm"
                                  : "border border-border/80 bg-surface-2/40 hover:bg-surface-2 text-foreground"
                              }`}
                            >
                              <span>{opt}</span>
                              <span className="size-4 rounded-full border border-border flex items-center justify-center text-[10px]">
                                {isOptSelected ? "●" : ""}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/70">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={quizQuestionIndex === 0}
                          onClick={() => setQuizQuestionIndex((i) => i - 1)}
                        >
                          <ArrowLeft className="size-3.5 mr-1 rtl-flip" /> Previous
                        </Button>

                        {quizQuestionIndex < activeQuizTier.questions.length - 1 ? (
                          <Button
                            type="button"
                            variant="glow"
                            size="sm"
                            disabled={chosen === undefined}
                            onClick={() => setQuizQuestionIndex((i) => i + 1)}
                          >
                            Next <ArrowRight className="size-3.5 ml-1 rtl-flip" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="glow"
                            size="sm"
                            disabled={
                              Object.keys(quizAnswers).length < activeQuizTier.questions.length
                            }
                            onClick={handleQuizSubmit}
                          >
                            Submit Examination
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                // Results & Review View
                <div className="space-y-6">
                  <div className="text-center py-4 space-y-2">
                    <Trophy className="size-12 mx-auto text-primary" />
                    <h4 className="font-display text-2xl font-black text-foreground">
                      Quiz Results
                    </h4>
                    <div className="text-3xl font-extrabold text-primary font-display">
                      {
                        activeQuizTier.questions.filter(
                          (q, idx) => quizAnswers[idx] === q.correctIndex,
                        ).length
                      }{" "}
                      / {activeQuizTier.questions.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Any missed words have been automatically saved to your "Needs Review" bucket.
                    </div>
                  </div>

                  {/* Question-by-Question Review */}
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {activeQuizTier.questions.map((q, idx) => {
                      const userChoice = quizAnswers[idx];
                      const isCorrect = userChoice === q.correctIndex;
                      return (
                        <div
                          key={q.id}
                          className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                            isCorrect
                              ? "border-emerald-500/30 bg-emerald-500/10"
                              : "border-destructive/30 bg-destructive/10"
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span>
                              Q{idx + 1}: {q.questionEn}
                            </span>
                            <span>{isCorrect ? "✓ Correct" : "✗ Incorrect"}</span>
                          </div>
                          <div>
                            Your Answer: <strong>{q.options[userChoice ?? 0]}</strong>
                          </div>
                          {!isCorrect && (
                            <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                              Correct: {q.options[q.correctIndex]}
                            </div>
                          )}
                          <div className="text-[11px] text-muted-foreground pt-1 italic">
                            Explanation: {q.explanationEn}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => startQuiz(activeQuizTier)}
                    >
                      <RotateCcw className="size-3.5 mr-1.5" /> Retake Quiz
                    </Button>

                    <Button
                      type="button"
                      variant="glow"
                      size="sm"
                      onClick={() => setActiveMode("flashcards")}
                    >
                      Back to Flashcards
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Review Bucket (Mistakes to Master) */}
      {mistakes.length > 0 && (
        <div className="surface-card p-5 space-y-3 border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-amber-500" />
              <h3 className="font-display text-sm font-bold text-foreground">
                Words Needing Review ({mistakes.length})
              </h3>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => {
                setMistakes([]);
                toast.success("Mistakes bucket cleared!");
              }}
            >
              Clear Review List
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {mistakes.map((wordId) => {
              const item = GRADE_9_UNIT_3_WORDS.find((w) => w.id === wordId);
              if (!item) return null;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs"
                >
                  <span className="font-bold text-foreground">{item.word}</span>
                  <span className="text-muted-foreground font-arabic">{item.meaningAr}</span>
                  <button
                    type="button"
                    onClick={() => toggleWordKnown(item.id)}
                    className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400"
                    title="Mark mastered"
                    aria-label="Mark mastered"
                  >
                    ✓
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
