import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Atom,
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  FileAudio,
  Focus,
  GraduationCap,
  ImageIcon,
  Keyboard,
  Layers,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Timer,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AudioTranscriptionWidget } from "@/components/ai/AudioTranscriptionWidget";
import { VisualAidStudio } from "@/components/ai/VisualAidStudio";
import { PageHeader } from "@/components/app/Page";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { downloadTextFile } from "@/lib/safe-file";
import type { FeatureGuideId } from "@/lib/feature-guides";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FocusReadingButton, FocusReadingOverlay } from "@/components/common/FocusReadingOverlay";
import { ExamRevisionScheduler } from "@/components/study/ExamRevisionScheduler";
import { StudyPlannerSuite } from "@/components/study/StudyPlannerSuite";
import { LearningIntelligenceWorkspace } from "@/components/study/LearningIntelligenceWorkspace";
import { PracticalSkillsWorkspace } from "@/components/study/PracticalSkillsWorkspace";
import { SkillAcademyWorkspace } from "@/components/study/SkillAcademyWorkspace";
import { AccessibilityAssistantDialog } from "@/components/settings/AccessibilityAssistantDialog";
import { Unit3VocabWorkspace } from "@/components/study/Unit3VocabWorkspace";
import { ReadyToUseLibraryView } from "@/components/common/ReadyToUseLibraryModal";
const LazyScienceDiscoveryStudio = lazy(() =>
  import("@/components/science/ScienceDiscoveryStudio").then((m) => ({
    default: m.ScienceDiscoveryStudio,
  })),
);
const LazyMathEngineeringStudio = lazy(() =>
  import("@/components/math/MathEngineeringStudio").then((m) => ({
    default: m.MathEngineeringStudio,
  })),
);
const LazyCreativityStudio = lazy(() =>
  import("@/components/creativity/CreativityStudio").then((m) => ({
    default: m.CreativityStudio,
  })),
);
const LazyKnowledgeToolsPanel = lazy(() =>
  import("@/components/study/KnowledgeToolsPanel").then((m) => ({
    default: m.KnowledgeToolsPanel,
  })),
);
const LazyResearchDiscoveryLab = lazy(() =>
  import("@/components/study/ResearchDiscoveryLab").then((m) => ({
    default: m.ResearchDiscoveryLab,
  })),
);
import {
  useFocusActions,
  useQuizAttempts,
  useStudyActions,
  useStudyItems,
} from "@/hooks/use-modules";
import { useTaskActions } from "@/hooks/use-nexora";
import type { StudyItemRow } from "@/lib/firestore-data";
import { formatDate, formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import { analyzeWeakSubjects, type Sm2Rating } from "@/lib/recommendations";
import { SUBJECT_OPTIONS } from "@/lib/settings";
import {
  detectTextLanguage,
  extractArabicText,
  hasArabicText,
  speakArabicText,
  speakEnhancedText,
} from "@/lib/speech-service";
import {
  buildQuizOptions,
  formatStudyDeckMarkdown,
  parseBulkFlashcards,
  type QuizChoiceOption,
} from "@/lib/study-utils";

import { getBrand } from "@/config/brand";

const LazyStudy3DScene = lazy(() =>
  import("@/components/study/Study3DScene").then((m) => ({ default: m.Study3DScene })),
);

function playStudyChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.51);
  } catch {
    // Audio fallback
  }
}

type StudyTab =
  | "planner"
  | "notes"
  | "flashcards"
  | "quiz"
  | "mistakes"
  | "analysis"
  | "revision"
  | "study3d"
  | "unit3_vocab"
  | "ready_library"
  | "skill_academy"
  | "practical_skills"
  | "learning_lab"
  | "science"
  | "math"
  | "creativity"
  | "tools"
  | "research";

export function StudyWorkspace() {
  const {
    t,
    lang,
    locale,
    study,
    uiMode,
    setUiMode,
    ecosystem,
    setEcosystem,
    speakText,
    speechSupported,
  } = usePrefs();
  const brand = getBrand();
  const { data: items = [] } = useStudyItems();
  const { data: quizzes = [] } = useQuizAttempts();
  const {
    addStudyItem,
    updateStudyItem,
    reviewFlashcard,
    updateMistakeStatus,
    deleteStudyItem,
    recordQuizAttempt,
  } = useStudyActions();
  const { addTask } = useTaskActions();

  const [tab, setTab] = useState<StudyTab>("notes");
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [focusReadingItem, setFocusReadingItem] = useState<{
    title: string;
    content: string;
    subject?: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qTab = params.get("tab") as StudyTab | null;
    const valid: StudyTab[] = [
      "planner",
      "notes",
      "flashcards",
      "quiz",
      "mistakes",
      "analysis",
      "revision",
      "study3d",
      "unit3_vocab",
      "ready_library",
      "skill_academy",
      "practical_skills",
      "learning_lab",
      "science",
      "math",
      "creativity",
      "tools",
      "research",
    ];
    if (qTab && valid.includes(qTab)) {
      setTab(qTab);
    }
  }, []);

  // Quick Study Sprint focus timer state
  const { logFocusSession } = useFocusActions();
  const [sprintOpen, setSprintOpen] = useState(false);
  const [sprintDuration, setSprintDuration] = useState<number>(25 * 60);
  const [sprintRemaining, setSprintRemaining] = useState<number>(25 * 60);
  const [sprintRunning, setSprintRunning] = useState(false);

  const sprintMins = Math.floor(sprintRemaining / 60);
  const sprintSecs = sprintRemaining % 60;
  const sprintFormatted = `${String(sprintMins).padStart(2, "0")}:${String(sprintSecs).padStart(2, "0")}`;

  // Creation state
  const [subject, setSubject] = useState<string>(SUBJECT_OPTIONS[0]);
  const [deck, setDeck] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [answer, setAnswer] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [mistakeReason, setMistakeReason] = useState("");

  useEffect(() => {
    if (!sprintRunning) return;
    const interval = setInterval(() => {
      setSprintRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setSprintRunning(false);
          playStudyChime();
          toast.success("Focus Sprint complete! (+15 XP)");
          void logFocusSession({
            title: `Focus Sprint: ${subjectFilter !== "all" ? subjectFilter : subject}`,
            area: "academic",
            subject: subjectFilter !== "all" ? subjectFilter : subject,
            durationMinutes: Math.max(1, Math.round(sprintDuration / 60)),
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sprintRunning, sprintDuration, subjectFilter, subject, logFocusSession]);
  const [noteToolDrawer, setNoteToolDrawer] = useState<"none" | "transcribe" | "visual">("none");
  const [busy, setBusy] = useState(false);

  // Inline editing state (notes & flashcards)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  // Bulk flashcard import
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkRaw, setBulkRaw] = useState("");

  // Flashcard revision session state
  const [reviewQueueIds, setReviewQueueIds] = useState<string[] | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Practice Quiz state
  const [quizLength, setQuizLength] = useState<3 | 5 | 8>(5);
  const [quizMode, setQuizMode] = useState<"mcq" | "recall">("mcq");
  const [quizActive, setQuizActive] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizCards, setQuizCards] = useState<StudyItemRow[]>([]);
  const [quizWrongIds, setQuizWrongIds] = useState<string[]>([]);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizReveal, setQuizReveal] = useState(false);
  const [lastQuizSummary, setLastQuizSummary] = useState<{
    subject: string;
    total: number;
    correct: number;
    wrongIds: string[];
  } | null>(null);

  const subjectsInUse = useMemo(() => {
    const s = new Set<string>(items.map((i) => i.subject));
    return Array.from(s).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (subjectFilter !== "all" && i.subject !== subjectFilter) return false;
      if (!q) return true;
      return (
        i.title.toLowerCase().includes(q) ||
        i.subject.toLowerCase().includes(q) ||
        i.content.toLowerCase().includes(q) ||
        (i.deck ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, search, subjectFilter]);

  const notes = useMemo(() => filtered.filter((i) => i.kind === "note"), [filtered]);
  const flashcards = useMemo(() => filtered.filter((i) => i.kind === "flashcard"), [filtered]);
  const mistakes = useMemo(() => filtered.filter((i) => i.kind === "mistake"), [filtered]);

  const todayIso = new Date().toISOString();
  const dueFlashcards = useMemo(
    () => flashcards.filter((c) => !c.next_review_at || c.next_review_at <= todayIso),
    [flashcards, todayIso],
  );

  const weakSpots = useMemo(
    () => analyzeWeakSubjects({ studyItems: items, quizAttempts: quizzes }),
    [items, quizzes],
  );

  const resetForm = () => {
    setTitle("");
    setContent("");
    setAnswer("");
    setMistakeReason("");
    setDeck("");
  };

  const handleCreate = async (kind: "note" | "flashcard" | "mistake", e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await addStudyItem({
        kind,
        subject,
        deck: deck.trim() || null,
        title: title.trim(),
        content: content.trim() || title.trim(),
        answer: kind === "flashcard" ? answer.trim() || content.trim() : null,
        difficulty,
        mistake_reason: kind === "mistake" ? mistakeReason.trim() || null : null,
      });
      toast.success(kind === "note" ? `${t("study.saveNote")} (+15 XP)` : t("common.save"));
      resetForm();
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    } finally {
      setBusy(false);
    }
  };

  const handleBulkImport = async () => {
    const drafts = parseBulkFlashcards(bulkRaw, subject);
    if (drafts.length === 0) return;
    setBusy(true);
    try {
      for (const d of drafts) {
        await addStudyItem({
          kind: "flashcard",
          subject: d.subject,
          title: d.title,
          content: d.title,
          answer: d.answer,
          difficulty,
        });
      }
      toast.success(`${drafts.length} ${t("study.tab.flashcards")}`);
      setBulkRaw("");
      setShowBulkImport(false);
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    } finally {
      setBusy(false);
    }
  };

  const handleExportStudySheet = () => {
    if (filtered.length === 0) return;
    const md = formatStudyDeckMarkdown(filtered, subjectFilter);
    downloadTextFile(
      md,
      `${brand.shortName.toLowerCase()}-study-sheet-${todayIso.slice(0, 10)}.md`,
      "text/markdown;charset=utf-8",
    );
  };

  const handleSaveEdit = async (item: StudyItemRow) => {
    if (!editTitle.trim()) return;
    try {
      await updateStudyItem(item, {
        title: editTitle.trim(),
        ...(item.kind === "flashcard"
          ? { content: editTitle.trim(), answer: editBody.trim() }
          : { content: editBody.trim() }),
      });
      setEditingId(null);
      toast.success(t("common.save"));
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    }
  };

  const handleNoteToTask = async (note: StudyItemRow) => {
    try {
      await addTask({
        title: `${note.subject}: ${note.title}`,
        details: note.content.slice(0, 300),
        area: "academic",
        subject: note.subject,
        priority: "medium",
      });
      toast.success(t("dash.tasks.toastAdd"));
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    }
  };

  const handleNoteToCard = async (note: StudyItemRow) => {
    try {
      await addStudyItem({
        kind: "flashcard",
        subject: note.subject,
        deck: note.deck,
        title: note.title,
        content: note.title,
        answer: note.content,
        difficulty: "medium",
      });
      toast.success(t("study.toCard"));
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    }
  };

  const startRevisionSession = () => {
    const queue = (dueFlashcards.length > 0 ? dueFlashcards : flashcards).map((c) => c.id);
    if (queue.length === 0) return;
    setReviewQueueIds(queue);
    setRevealed(false);
  };

  const currentReviewCard = reviewQueueIds?.length
    ? (flashcards.find((c) => c.id === reviewQueueIds[0]) ?? null)
    : null;

  const handleFlashcardRate = async (rating: Sm2Rating) => {
    if (!currentReviewCard) return;
    await reviewFlashcard(currentReviewCard, rating !== "again", study.flashcardStyle, rating);
    if (rating !== "again") toast.success("+10 XP");
    setRevealed(false);
    setReviewQueueIds((prev) => (prev ? prev.slice(1) : null));
  };

  const startQuiz = () => {
    const pool = flashcards.length >= 2 ? flashcards : items.filter((i) => i.kind === "flashcard");
    if (pool.length < 2) return;
    setQuizCards(pool.slice(0, quizLength));
    setQuizIndex(0);
    setQuizWrongIds([]);
    setQuizCorrect(0);
    setQuizReveal(false);
    setLastQuizSummary(null);
    setQuizActive(true);
  };

  const submitQuizStep = async (knewIt: boolean) => {
    const card = quizCards[quizIndex];
    if (!card) return;
    const nextCorrect = quizCorrect + (knewIt ? 1 : 0);
    const nextWrong = knewIt ? quizWrongIds : [...quizWrongIds, card.id];

    if (quizIndex + 1 < quizCards.length) {
      setQuizCorrect(nextCorrect);
      setQuizWrongIds(nextWrong);
      setQuizIndex((i) => i + 1);
      setQuizReveal(false);
      return;
    }

    const subj = subjectFilter !== "all" ? subjectFilter : card.subject;
    await recordQuizAttempt({
      subject: subj,
      totalQuestions: quizCards.length,
      correctCount: nextCorrect,
      wrongItemIds: nextWrong,
    });
    setLastQuizSummary({
      subject: subj,
      total: quizCards.length,
      correct: nextCorrect,
      wrongIds: nextWrong,
    });
    setQuizActive(false);
    toast.success(`${t("study.quiz.score")}: ${nextCorrect}/${quizCards.length}`);
  };

  const retakeMissedQuiz = () => {
    if (!lastQuizSummary || lastQuizSummary.wrongIds.length === 0) return;
    const missed = items.filter((i) => lastQuizSummary.wrongIds.includes(i.id));
    if (missed.length === 0) return;
    setQuizCards(missed);
    setQuizIndex(0);
    setQuizWrongIds([]);
    setQuizCorrect(0);
    setQuizReveal(false);
    setLastQuizSummary(null);
    setQuizActive(true);
  };

  const createFlashcardsFromMissed = async () => {
    if (!lastQuizSummary) return;
    const missed = items.filter((i) => lastQuizSummary.wrongIds.includes(i.id));
    let count = 0;
    for (const c of missed) {
      await addStudyItem({
        kind: "flashcard",
        subject: c.subject,
        deck: "Quiz Remediation",
        title: c.title,
        content: c.title,
        answer: c.answer || c.content,
        difficulty: "hard",
      });
      count++;
    }
    toast.success(
      count > 0
        ? `Created ${count} remediation flashcard${count > 1 ? "s" : ""}!`
        : "Missed questions added.",
    );
  };

  const handleMistakeToFlashcard = async (m: StudyItemRow) => {
    try {
      await addStudyItem({
        kind: "flashcard",
        subject: m.subject,
        deck: "Mistake Mastery",
        title: m.title,
        content: m.title,
        answer:
          (m.content || m.title) + (m.mistake_reason ? `\n\nKey Lesson: ${m.mistake_reason}` : ""),
        difficulty: "hard",
      });
      await updateMistakeStatus(m, "mastered");
      toast.success("Converted to flashcard & marked mastered! (+20 XP)");
    } catch {
      toast.error("Failed to convert mistake to flashcard");
    }
  };

  const handleLoadStarterDeck = async () => {
    setBusy(true);
    try {
      const sampleCards = [
        {
          subject: "Science",
          deck: "Essential Biology",
          title: "What is the function of Mitochondria?",
          answer: "The powerhouse of the cell; produces ATP through cellular respiration.",
        },
        {
          subject: "Science",
          deck: "Essential Chemistry",
          title: "What is Avogadro's Number?",
          answer: "6.022 × 10²³, the number of atoms or molecules in one mole.",
        },
        {
          subject: "Math",
          deck: "Calculus Foundations",
          title: "What is the derivative of sin(x)?",
          answer: "cos(x)",
        },
        {
          subject: "English",
          deck: "Academic Vocabulary",
          title: "Define 'Ephemeral'",
          answer: "Lasting for a very short period of time; transitory; fleeting.",
        },
        {
          subject: "History",
          deck: "World History",
          title: "What initiated the Industrial Revolution?",
          answer:
            "The commercial adoption of the steam engine and mechanization of textile manufacturing in Britain.",
        },
      ];
      for (const card of sampleCards) {
        await addStudyItem({
          kind: "flashcard",
          subject: card.subject,
          deck: card.deck,
          title: card.title,
          content: card.title,
          answer: card.answer,
          difficulty: "medium",
        });
      }
      toast.success(
        "Loaded 5 essential flashcards! You can now start practice quizzes or reviews.",
      );
    } catch {
      toast.error("Could not load starter deck.");
    } finally {
      setBusy(false);
    }
  };

  const currentQuizCard = quizActive ? (quizCards[quizIndex] ?? null) : null;
  const currentMcqOptions: QuizChoiceOption[] = useMemo(() => {
    if (!currentQuizCard || quizMode !== "mcq") return [];
    const pool = items.filter((i) => i.kind === "flashcard");
    return buildQuizOptions(currentQuizCard, pool);
  }, [currentQuizCard, quizMode, items]);

  const flashcardRateRef = useRef(handleFlashcardRate);
  flashcardRateRef.current = handleFlashcardRate;
  const submitQuizStepRef = useRef(submitQuizStep);
  submitQuizStepRef.current = submitQuizStep;

  // Spacebar / 1-4 shortcuts during flashcard revision AND quiz
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (target?.isContentEditable) return;

      // Flashcards review keyboard navigation
      if (tab === "flashcards" && currentReviewCard) {
        if (e.code === "Space" && !revealed) {
          e.preventDefault();
          setRevealed(true);
        } else if (revealed) {
          if (e.key === "1") void flashcardRateRef.current("again");
          else if (e.key === "2") void flashcardRateRef.current("hard");
          else if (e.key === "3") void flashcardRateRef.current("good");
          else if (e.key === "4") void flashcardRateRef.current("easy");
        }
      }

      // Quiz mode keyboard navigation
      if (tab === "quiz" && quizActive && currentQuizCard) {
        if (quizMode === "mcq" && currentMcqOptions.length === 4) {
          const opt0 = currentMcqOptions[0];
          const opt1 = currentMcqOptions[1];
          const opt2 = currentMcqOptions[2];
          const opt3 = currentMcqOptions[3];
          if ((e.key === "1" || e.key.toLowerCase() === "a") && opt0) {
            e.preventDefault();
            void submitQuizStepRef.current(opt0.isCorrect);
          } else if ((e.key === "2" || e.key.toLowerCase() === "b") && opt1) {
            e.preventDefault();
            void submitQuizStepRef.current(opt1.isCorrect);
          } else if ((e.key === "3" || e.key.toLowerCase() === "c") && opt2) {
            e.preventDefault();
            void submitQuizStepRef.current(opt2.isCorrect);
          } else if ((e.key === "4" || e.key.toLowerCase() === "d") && opt3) {
            e.preventDefault();
            void submitQuizStepRef.current(opt3.isCorrect);
          }
        } else if (quizMode === "recall") {
          if (e.code === "Space" && !quizReveal) {
            e.preventDefault();
            setQuizReveal(true);
          } else if (quizReveal) {
            if (e.key === "1") {
              e.preventDefault();
              void submitQuizStepRef.current(false);
            } else if (e.key === "2") {
              e.preventDefault();
              void submitQuizStepRef.current(true);
            }
          }
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    tab,
    currentReviewCard,
    revealed,
    quizActive,
    currentQuizCard,
    quizMode,
    currentMcqOptions,
    quizReveal,
  ]);

  const logMissedToMistakes = async () => {
    if (!lastQuizSummary) return;
    const missedCards = items.filter((i) => lastQuizSummary.wrongIds.includes(i.id));
    for (const c of missedCards) {
      await addStudyItem({
        kind: "mistake",
        subject: c.subject,
        title: c.title,
        content: c.answer || c.content,
        mistake_reason: "Missed during Practice Quiz",
        difficulty: "hard",
      });
    }
    toast.success(t("study.quiz.addMistakes"));
    setLastQuizSummary(null);
    setTab("mistakes");
  };

  const cycleMistakeStatus = async (m: StudyItemRow) => {
    const nextStatus: "open" | "reviewed" | "mastered" =
      m.mistake_status === "open"
        ? "reviewed"
        : m.mistake_status === "reviewed"
          ? "mastered"
          : "open";
    await updateMistakeStatus(m, nextStatus);
    toast.success(t(`study.status.${nextStatus}`));
  };

  const tabs: Array<{ id: StudyTab; label: string; icon: typeof BookOpen }> = [
    {
      id: "planner",
      label: lang === "ar" ? "مخطط الدراسة اليومي" : "Study Planner & Daily Goal",
      icon: CalendarDays,
    },
    { id: "science", label: "Science Labs (#1–6)", icon: Atom },
    { id: "math", label: "Math & Eng (#7–12)", icon: BarChart3 },
    { id: "creativity", label: "Creative Studio (#13–18)", icon: Sparkles },
    { id: "tools", label: "Knowledge Tools (#41–48)", icon: ClipboardList },
    { id: "research", label: lang === "ar" ? "مختبر البحث" : "Research Lab", icon: Search },
    { id: "unit3_vocab", label: "Grade 9 Unit 3 (English)", icon: Sparkles },
    { id: "skill_academy", label: "English World & Skill Academy", icon: GraduationCap },
    { id: "practical_skills", label: "Practical Skills", icon: Keyboard },
    { id: "learning_lab", label: "AI Learning Lab", icon: Brain },
    { id: "ready_library", label: "Ready-to-Use Library", icon: BookOpen },
    { id: "notes", label: t("study.tab.notes"), icon: BookOpen },
    { id: "flashcards", label: t("study.tab.flashcards"), icon: Layers },
    { id: "quiz", label: t("study.tab.quiz"), icon: ClipboardList },
    { id: "mistakes", label: t("study.tab.mistakes"), icon: AlertTriangle },
    { id: "analysis", label: t("study.tab.analysis"), icon: BarChart3 },
    { id: "revision", label: "Exam Revision Planner", icon: CalendarDays },
    { id: "study3d", label: t("p5.study3d.tab"), icon: Atom },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title={t("mod.study.name")}
          subtitle={`${t("dash.focus.pref")}: ${formatNumber(study.sessionMinutes, lang)} ${t("set.study.minutes")} · ${study.flashcardStyle} · ${study.quizDifficulty}`}
        />
        <div className="flex flex-wrap items-center gap-2">
          <FeatureGuideTrigger
            featureId={
              (
                {
                  planner: "exam-revision",
                  notes: "study-notes",
                  flashcards: "study-flashcards",
                  quiz: "study-quiz",
                  mistakes: "study-mistakes",
                  analysis: "study-analysis",
                  revision: "exam-revision",
                  study3d: "study-3d-lab",
                  unit3_vocab: "unit3-vocab",
                  ready_library: "ready-library",
                  skill_academy: "skill-academy",
                  practical_skills: "practical-skills",
                  learning_lab: "learning-intelligence",
                  science: "science-studio",
                  math: "math-studio",
                  creativity: "creativity-studio",
                  tools: "knowledge-tools",
                  research: "knowledge-tools",
                } satisfies Record<StudyTab, FeatureGuideId>
              )[tab]
            }
          />
          <Button
            type="button"
            size="sm"
            variant={ecosystem.distractionFree ? "glow" : "outline"}
            onClick={() => setEcosystem({ distractionFree: !ecosystem.distractionFree })}
            className="h-8 gap-1.5 text-xs"
            title="Toggle distraction-free chrome-less study mode"
          >
            <Focus className="size-3.5" />
            <span>{ecosystem.distractionFree ? "Exit Focus Mode" : "Distraction-Free"}</span>
          </Button>
          <AccessibilityAssistantDialog />
        </div>
      </div>

      {uiMode === "simplified" && (
        <div className="surface-card flex flex-col gap-3 border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-primary">
              {lang === "ar" ? "الوضع المبسط — ابدأ فوراً" : "Simplified Quick Start"}
            </div>
            <p className="text-xs text-muted-foreground">
              {lang === "ar"
                ? "ابدأ بمفردات الصف التاسع (الوحدة 3) أو اختبار تحديد المستوى أو مختبر المهارات."
                : "Jump straight into Grade 9 Unit 3 vocabulary, Skill Academy placement, or Typing Mastery."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              variant="glow"
              onClick={() => setTab("unit3_vocab")}
              className="h-8 text-xs"
            >
              Grade 9 Unit 3 (24 Words)
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setTab("skill_academy")}
              className="h-8 text-xs"
            >
              Skill Academy
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setTab("practical_skills")}
              className="h-8 text-xs"
            >
              Typing & Practical
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setTab("ready_library")}
              className="h-8 text-xs"
            >
              Ready-to-Use Library
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setUiMode("advanced")}
              className="h-8 text-xs"
            >
              {lang === "ar" ? "تفعيل الوضع المتقدم" : "Advanced Tools"}
            </Button>
          </div>
        </div>
      )}

      {/* Tabs + Filters + Export */}
      <div className="surface-card flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5" role="tablist">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-44 flex-1 sm:w-52">
            <Search className="pointer-events-none absolute start-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("study.searchPh")}
              className="h-8 ps-8 text-xs"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            aria-label={t("study.subject")}
            className="h-8 rounded-md border border-input bg-surface-2 px-2.5 text-xs text-foreground"
          >
            <option value="all">{t("common.all")}</option>
            {subjectsInUse.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleExportStudySheet}
            disabled={filtered.length === 0}
            className="h-8 text-xs"
          >
            <Download className="size-3.5" />
            <span>{t("study.exportSheet")}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant={sprintRunning ? "glow" : "outline"}
            onClick={() => setSprintOpen((v) => !v)}
            className="h-8 gap-1.5 text-xs font-semibold"
            title="Focus Sprint Pomodoro"
          >
            <Timer className="size-3.5" />
            <span>{sprintRunning ? sprintFormatted : "Study Sprint"}</span>
          </Button>
        </div>
      </div>

      {/* Quick Study Sprint Focus Bar */}
      {(sprintOpen || sprintRunning) && (
        <div className="surface-card flex flex-wrap items-center justify-between gap-3 border-primary/40 bg-primary/5 p-3.5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Timer className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold tabular-nums text-foreground">
                  {sprintFormatted}
                </span>
                <span className="text-xs text-muted-foreground">
                  · {subjectFilter !== "all" ? subjectFilter : subject} Sprint
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Stay immersed in your notes and cards. Focus without distractions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 rounded-md border border-border bg-surface-2 p-0.5">
              {[
                { label: "15m", sec: 15 * 60 },
                { label: "25m", sec: 25 * 60 },
                { label: "50m", sec: 50 * 60 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  disabled={sprintRunning}
                  onClick={() => {
                    setSprintDuration(preset.sec);
                    setSprintRemaining(preset.sec);
                  }}
                  className={`rounded px-2 py-0.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                    sprintDuration === preset.sec
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <Button
              type="button"
              size="sm"
              variant={sprintRunning ? "outline" : "glow"}
              className="h-8 text-xs font-semibold gap-1.5"
              onClick={() => setSprintRunning((r) => !r)}
            >
              {sprintRunning ? (
                <>
                  <Pause className="size-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="size-3.5" />
                  <span>Start Focus</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 text-xs"
              onClick={() => {
                setSprintRunning(false);
                setSprintRemaining(sprintDuration);
              }}
              title="Reset Timer"
            >
              <RotateCcw className="size-3.5" />
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-muted-foreground"
              onClick={() => setSprintOpen(false)}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* TAB 1: NOTES */}
      {tab === "notes" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <form
            onSubmit={(e) => handleCreate("note", e)}
            className="surface-card space-y-3 p-5 lg:col-span-1"
          >
            <h2 className="font-display text-base font-bold text-foreground">
              {t("study.saveNote")}
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label htmlFor="st-subj" className="text-xs">
                  {t("study.subject")}
                </Label>
                <select
                  id="st-subj"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-surface-2 px-2.5 text-xs text-foreground"
                >
                  {SUBJECT_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="st-deck" className="text-xs">
                  {t("study.deck")}
                </Label>
                <Input
                  id="st-deck"
                  value={deck}
                  onChange={(e) => setDeck(e.target.value)}
                  placeholder={t("study.deckPh")}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="st-title" className="text-xs">
                {t("study.noteTitle")}
              </Label>
              <Input
                id="st-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("study.subjectPh")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="st-body" className="text-xs">
                {t("study.noteBody")}
              </Label>
              <Textarea
                id="st-body"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <Button type="submit" variant="glow" className="w-full" disabled={busy}>
              <Plus className="size-4" />
              <span>{t("study.saveNote")} (+15 XP)</span>
            </Button>

            <div className="flex flex-wrap gap-1.5 border-t border-border/60 pt-2.5">
              <Button
                type="button"
                size="sm"
                variant={noteToolDrawer === "transcribe" ? "glow" : "outline"}
                onClick={() =>
                  setNoteToolDrawer((d) => (d === "transcribe" ? "none" : "transcribe"))
                }
                className="h-7 flex-1 text-[0.7rem]"
              >
                <FileAudio className="size-3" />
                <span>{t("p5.transcribe.title")}</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant={noteToolDrawer === "visual" ? "glow" : "outline"}
                onClick={() => setNoteToolDrawer((d) => (d === "visual" ? "none" : "visual"))}
                className="h-7 flex-1 text-[0.7rem]"
              >
                <ImageIcon className="size-3" />
                <span>{t("p5.image.title")}</span>
              </Button>
            </div>
          </form>

          <div className="space-y-3 lg:col-span-2">
            {noteToolDrawer === "transcribe" && (
              <AppErrorBoundary
                fallbackTitle="Audio transcription encountered a problem"
                fallbackDesc="Microphone or audio file decoding failed safely. Your notes remain intact."
              >
                <AudioTranscriptionWidget
                  subject={subject}
                  onSaveNote={async (note) => {
                    await addStudyItem({ kind: "note", ...note });
                  }}
                  onInsertTranscript={(text) => {
                    setContent((prev) => (prev ? `${prev}\n${text}` : text));
                    if (!title.trim()) setTitle(`${subject} Audio Note`);
                    toast.success("Transcript inserted into note editor.");
                  }}
                />
              </AppErrorBoundary>
            )}
            {noteToolDrawer === "visual" && (
              <AppErrorBoundary
                fallbackTitle="Visual Aid Studio encountered a problem"
                fallbackDesc="Image upload or generation reset safely. Your notes remain intact."
              >
                <VisualAidStudio
                  defaultPrompt={title.trim() ? `${subject}: ${title}` : `${subject} study diagram`}
                  onAttachCaption={(cap) =>
                    setContent((prev) => (prev ? `${prev}\n\n${cap}` : cap))
                  }
                />
              </AppErrorBoundary>
            )}
            {notes.length === 0 ? (
              <div className="surface-card flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="mb-2 size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{t("study.tab.notes")}</p>
              </div>
            ) : (
              notes.map((n) => {
                const isEditing = editingId === n.id;
                return (
                  <article key={n.id} className="surface-card space-y-2.5 p-4">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Textarea
                          rows={3}
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          className="text-xs"
                        />
                        <div className="flex justify-end gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="size-3.5" />
                            <span>{t("common.cancel")}</span>
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="glow"
                            onClick={() => handleSaveEdit(n)}
                          >
                            <span>{t("common.save")}</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground">
                              <span className="border-s-2 border-primary ps-2 font-semibold text-primary">
                                {n.subject}
                              </span>
                              {n.deck && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{n.deck}</span>
                                </>
                              )}
                            </div>
                            <h3 className="mt-1 font-display text-sm font-bold text-foreground">
                              {n.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-1">
                            <FocusReadingButton
                              onClick={() =>
                                setFocusReadingItem({
                                  title: n.title,
                                  content: n.content,
                                  subject: n.subject,
                                })
                              }
                              className="h-7 px-2 text-[11px]"
                            />
                            {speechSupported && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => speakText(`${n.title}. ${n.content}`)}
                                title={t("study.readAloud")}
                                aria-label={t("study.readAloud")}
                              >
                                <Volume2 className="size-3.5" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(n.id);
                                setEditTitle(n.title);
                                setEditBody(n.content);
                              }}
                              aria-label={t("study.editItem")}
                            >
                              <Pencil className="size-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteStudyItem(n.id)}
                              aria-label={t("common.delete")}
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                          {n.content}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => handleNoteToTask(n)}
                          >
                            {t("study.toTask")}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => handleNoteToCard(n)}
                          >
                            {t("study.toCard")}
                          </Button>
                        </div>
                      </>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FLASHCARDS */}
      {tab === "flashcards" && (
        <div className="space-y-6">
          {currentReviewCard ? (
            <div className="surface-card mx-auto max-w-xl space-y-4 border-primary/40 p-6 text-center">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-primary">{currentReviewCard.subject}</span>
                <span className="tabular-nums">
                  {reviewQueueIds?.length} left · {study.flashcardStyle}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                {currentReviewCard.title}
              </h3>
              <div className="flex justify-center">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    speakEnhancedText(currentReviewCard.title, {
                      forcedLang: detectTextLanguage(currentReviewCard.title),
                    })
                  }
                  className="h-8 gap-1.5 text-xs"
                >
                  <Volume2 className="size-3.5 text-primary" />
                  <span>Pronounce</span>
                </Button>
              </div>
              {revealed ? (
                <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
                  <div className="whitespace-pre-line">
                    {currentReviewCard.answer || currentReviewCard.content}
                  </div>
                  {hasArabicText(currentReviewCard.answer || currentReviewCard.content) && (
                    <div className="flex justify-center pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const rawBack = currentReviewCard.answer || currentReviewCard.content;
                          const arabicTranslation = extractArabicText(rawBack) || rawBack;
                          speakArabicText(arabicTranslation);
                        }}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Volume2 className="size-3.5 text-primary" />
                        <span className="font-arabic">استمع بالعربية</span>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Button type="button" variant="outline" onClick={() => setRevealed(true)}>
                  {t("study.flip")} (Space)
                </Button>
              )}
              {revealed && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleFlashcardRate("again")}
                  >
                    1 · {t("study.rate.again")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleFlashcardRate("hard")}
                  >
                    2 · {t("study.rate.hard")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="glow"
                    onClick={() => handleFlashcardRate("good")}
                  >
                    3 · {t("study.rate.good")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="glow"
                    onClick={() => handleFlashcardRate("easy")}
                  >
                    4 · {t("study.rate.easy")}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="text-sm">
                <span className="font-semibold text-foreground">
                  {formatNumber(dueFlashcards.length, lang)}
                </span>{" "}
                <span className="text-muted-foreground">{t("study.dueForReview")}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {uiMode === "advanced" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowBulkImport((s) => !s)}
                  >
                    <Plus className="size-3.5" />
                    <span>{t("study.bulkImport")}</span>
                  </Button>
                )}
                <Button
                  type="button"
                  variant="glow"
                  disabled={flashcards.length === 0}
                  onClick={startRevisionSession}
                >
                  <Sparkles className="size-4" />
                  <span>{t("study.reviewMode")}</span>
                </Button>
              </div>
            </div>
          )}

          {showBulkImport && (
            <div className="surface-card space-y-3 border-primary/30 p-5">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-foreground">
                  {t("study.bulkImport")} ({subject})
                </span>
                <button
                  type="button"
                  onClick={() => setShowBulkImport(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
              <Textarea
                rows={4}
                value={bulkRaw}
                onChange={(e) => setBulkRaw(e.target.value)}
                placeholder={t("study.bulkPlaceholder")}
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="glow"
                size="sm"
                disabled={busy || !bulkRaw.trim()}
                onClick={handleBulkImport}
              >
                {t("study.bulkAddBtn")}
              </Button>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <form
              onSubmit={(e) => handleCreate("flashcard", e)}
              className="surface-card space-y-3 p-5 lg:col-span-1"
            >
              <h2 className="font-display text-base font-bold text-foreground">
                {t("study.tab.flashcards")}
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="fc-subj" className="text-xs">
                    {t("study.subject")}
                  </Label>
                  <select
                    id="fc-subj"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-surface-2 px-2.5 text-xs text-foreground"
                  >
                    {SUBJECT_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fc-diff" className="text-xs">
                    {t("study.difficulty")}
                  </Label>
                  <select
                    id="fc-diff"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
                    className="h-9 w-full rounded-md border border-input bg-surface-2 px-2.5 text-xs text-foreground"
                  >
                    <option value="easy">{t("study.diff.easy")}</option>
                    <option value="medium">{t("study.diff.medium")}</option>
                    <option value="hard">{t("study.diff.hard")}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="fc-front" className="text-xs">
                  {t("study.cardFront")}
                </Label>
                <Input
                  id="fc-front"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fc-back" className="text-xs">
                  {t("study.cardBack")}
                </Label>
                <Textarea
                  id="fc-back"
                  required
                  rows={3}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
              </div>
              <Button type="submit" variant="glow" className="w-full" disabled={busy}>
                <Plus className="size-4" />
                <span>{t("common.add")}</span>
              </Button>
            </form>

            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
              {flashcards.length === 0 ? (
                <div className="surface-card flex flex-col items-center justify-center py-12 text-center sm:col-span-2">
                  <Layers className="mb-2 size-8 text-muted-foreground/40" />
                  <h4 className="font-display text-sm font-semibold text-foreground">
                    No flashcards created yet
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                    Build cards using the form on the left, or load our starter STEM and vocabulary
                    deck to start reviewing with active recall.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="glow"
                      onClick={handleLoadStarterDeck}
                      disabled={busy}
                    >
                      <Sparkles className="size-3.5 me-1" />
                      <span>Load Starter Deck</span>
                    </Button>
                  </div>
                </div>
              ) : (
                flashcards.map((c) => {
                  const isDue = !c.next_review_at || c.next_review_at <= todayIso;
                  const isEditing = editingId === c.id;
                  return (
                    <div key={c.id} className="surface-card flex flex-col justify-between p-4">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="h-8 text-xs"
                          />
                          <Textarea
                            rows={2}
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            className="text-xs"
                          />
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                            >
                              {t("common.cancel")}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="glow"
                              onClick={() => handleSaveEdit(c)}
                            >
                              {t("common.save")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[0.7rem]">
                              <span className="font-semibold text-primary">{c.subject}</span>
                              <span
                                className={
                                  isDue ? "font-semibold text-xp" : "text-muted-foreground"
                                }
                              >
                                {c.difficulty} · ×{formatNumber(c.review_count, lang)}
                              </span>
                            </div>
                            <h3 className="font-display text-sm font-bold text-foreground">
                              {c.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">{c.answer || c.content}</p>
                          </div>
                          <div className="mt-3 flex justify-end gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(c.id);
                                setEditTitle(c.title);
                                setEditBody(c.answer || c.content);
                              }}
                              aria-label={t("study.editItem")}
                            >
                              <Pencil className="size-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteStudyItem(c.id)}
                              aria-label={t("common.delete")}
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRACTICE QUIZ */}
      {tab === "quiz" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="surface-card space-y-4 p-5 lg:col-span-2">
            {currentQuizCard ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{currentQuizCard.subject}</span>
                  <span className="tabular-nums">
                    {quizIndex + 1} / {quizCards.length}
                  </span>
                </div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  {currentQuizCard.title}
                </h2>
                {quizMode === "mcq" && currentMcqOptions.length === 4 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {currentMcqOptions.map((opt, idx) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => submitQuizStep(opt.isCorrect)}
                        className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-2 p-3 text-start text-xs font-medium text-foreground transition-colors hover:border-primary/60 hover:bg-primary/10"
                      >
                        <span className="flex size-5 shrink-0 items-center justify-center rounded bg-primary/15 font-mono text-[11px] font-bold text-primary">
                          {idx + 1}
                        </span>
                        <span className="pt-0.5 leading-relaxed">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                ) : quizReveal ? (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
                      {currentQuizCard.answer || currentQuizCard.content}
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => submitQuizStep(false)}>
                        1 · {t("study.reviewAgain")}
                      </Button>
                      <Button type="button" variant="glow" onClick={() => submitQuizStep(true)}>
                        2 · {t("study.knewIt")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button type="button" variant="outline" onClick={() => setQuizReveal(true)}>
                    {t("study.flip")} (Space)
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="font-display text-base font-bold text-foreground">
                  {t("study.tab.quiz")}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 text-muted-foreground">
                    <span>{t("study.quiz.length")}:</span>
                    <select
                      value={quizLength}
                      onChange={(e) => setQuizLength(Number(e.target.value) as 3 | 5 | 8)}
                      className="h-8 rounded border border-input bg-surface-2 px-2 text-xs text-foreground"
                    >
                      <option value={3}>3</option>
                      <option value={5}>5</option>
                      <option value={8}>8</option>
                    </select>
                  </label>
                  <div className="flex gap-1 rounded-md border border-border bg-surface-2 p-0.5">
                    <button
                      type="button"
                      onClick={() => setQuizMode("mcq")}
                      className={`rounded px-2.5 py-1 text-xs font-medium ${
                        quizMode === "mcq"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {t("study.quiz.modeMcq")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuizMode("recall")}
                      className={`rounded px-2.5 py-1 text-xs font-medium ${
                        quizMode === "recall"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {t("study.quiz.modeRecall")}
                    </button>
                  </div>
                </div>

                {flashcards.length < 2 ? (
                  <div className="space-y-3 rounded-lg border border-border bg-surface-2/60 p-4">
                    <p className="text-sm text-muted-foreground">{t("study.quiz.needCards")}</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="glow"
                      onClick={handleLoadStarterDeck}
                      disabled={busy}
                    >
                      <Sparkles className="size-3.5 me-1" />
                      <span>Load Starter Deck & Practice</span>
                    </Button>
                  </div>
                ) : (
                  <Button type="button" variant="glow" onClick={startQuiz}>
                    <Sparkles className="size-4" />
                    <span>{t("study.quiz.start")}</span>
                  </Button>
                )}

                {lastQuizSummary && (
                  <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">
                        {t("study.quiz.score")}: {lastQuizSummary.correct}/{lastQuizSummary.total} (
                        {Math.round((lastQuizSummary.correct / lastQuizSummary.total) * 100)}%)
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {lastQuizSummary.correct === lastQuizSummary.total
                          ? "🎉 Perfect score!"
                          : `${lastQuizSummary.wrongIds.length} missed`}
                      </span>
                    </div>

                    {lastQuizSummary.wrongIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button type="button" size="sm" variant="glow" onClick={retakeMissedQuiz}>
                          <RotateCcw className="size-3.5 me-1" />
                          <span>Retake Missed Only ({lastQuizSummary.wrongIds.length})</span>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={createFlashcardsFromMissed}
                        >
                          <Plus className="size-3.5 me-1" />
                          <span>Create Remediation Cards</span>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={logMissedToMistakes}
                        >
                          {t("study.quiz.addMistakes")}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="surface-card space-y-3 p-5">
            <h3 className="font-display text-sm font-bold text-foreground">
              {t("study.quiz.history")}
            </h3>
            {quizzes.length === 0 ? (
              <p className="text-xs text-muted-foreground">—</p>
            ) : (
              <div className="space-y-2">
                {quizzes.slice(0, 8).map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-foreground">{q.subject}</div>
                      <div className="text-[0.68rem] text-muted-foreground">
                        {formatDate(q.created_at, { lang, calendar: locale.calendar }, "short")}
                      </div>
                    </div>
                    <span className="font-bold tabular-nums text-primary">{q.score_pct}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MISTAKE LOG */}
      {tab === "mistakes" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <form
            onSubmit={(e) => handleCreate("mistake", e)}
            className="surface-card space-y-3 p-5 lg:col-span-1"
          >
            <h2 className="font-display text-base font-bold text-foreground">
              {t("study.tab.mistakes")}
            </h2>
            <div className="space-y-1">
              <Label htmlFor="ms-subj" className="text-xs">
                {t("study.subject")}
              </Label>
              <select
                id="ms-subj"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-surface-2 px-2.5 text-xs text-foreground"
              >
                {SUBJECT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ms-title" className="text-xs">
                {t("study.noteTitle")}
              </Label>
              <Input
                id="ms-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ms-reason" className="text-xs">
                {t("study.mistakeReason")}
              </Label>
              <Input
                id="ms-reason"
                value={mistakeReason}
                onChange={(e) => setMistakeReason(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ms-fix" className="text-xs">
                {t("study.noteBody")}
              </Label>
              <Textarea
                id="ms-fix"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <Button type="submit" variant="glow" className="w-full" disabled={busy}>
              <Plus className="size-4" />
              <span>{t("common.add")}</span>
            </Button>
          </form>

          <div className="space-y-3 lg:col-span-2">
            {mistakes.length === 0 ? (
              <div className="surface-card flex flex-col items-center justify-center py-12 text-center lg:col-span-2">
                <CheckCircle2 className="mb-2 size-8 text-success/50" />
                <h4 className="font-display text-sm font-semibold text-foreground">
                  Mistake log is clear
                </h4>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                  Log challenging questions from mock exams or convert missed quiz items here to
                  turn weaknesses into strengths.
                </p>
              </div>
            ) : (
              mistakes.map((m) => (
                <div key={m.id} className="surface-card space-y-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground">
                      <span className="border-s-2 border-primary ps-2 font-semibold text-primary">
                        {m.subject}
                      </span>
                      <span aria-hidden="true">·</span>
                      <button
                        type="button"
                        onClick={() => cycleMistakeStatus(m)}
                        title={t("study.cycleStatus")}
                        className="font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {m.mistake_status === "mastered"
                          ? t("study.status.mastered")
                          : m.mistake_status === "reviewed"
                            ? t("study.status.reviewed")
                            : t("study.status.open")}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => handleMistakeToFlashcard(m)}
                        title="Convert mistake into a reviewable flashcard"
                      >
                        <Layers className="size-3.5 me-1 text-primary" />
                        <span>To Card</span>
                      </Button>
                      {m.mistake_status !== "mastered" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={async () => {
                            await updateMistakeStatus(m, "mastered");
                            toast.success(`${t("study.status.mastered")} (+20 XP)`);
                          }}
                        >
                          <CheckCircle2 className="size-3.5 text-success" />
                          <span>{t("study.markMastered")} (+20 XP)</span>
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteStudyItem(m.id)}
                        aria-label={t("common.delete")}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-display text-sm font-bold text-foreground">{m.title}</h3>
                  {m.mistake_reason && <p className="text-xs text-xp">{m.mistake_reason}</p>}
                  <p className="text-xs text-muted-foreground">{m.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: WEAK SPOTS */}
      {tab === "analysis" && (
        <div className="surface-card space-y-4 p-5">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">
              {t("study.tab.analysis")}
            </h2>
            <p className="text-xs text-muted-foreground">{t("study.weakSpots.desc")}</p>
          </div>
          {weakSpots.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">{t("dash.rec.empty")}</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {weakSpots.map((w) => (
                <div
                  key={w.subject}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface-2 p-4"
                >
                  <div className="space-y-1">
                    <h3 className="font-display text-sm font-bold text-foreground">{w.subject}</h3>
                    <p className="text-xs tabular-nums text-muted-foreground">
                      {w.openMistakes} {t("study.tab.mistakes")} · {w.hardCards}{" "}
                      {t("study.diff.hard")}
                      {w.avgQuizPct !== null ? ` · ${w.avgQuizPct}% quiz avg` : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSubjectFilter(w.subject);
                      setTab("flashcards");
                    }}
                  >
                    {t("study.tab.flashcards")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: STUDY PLANNER & DAILY PROGRESS */}
      {tab === "planner" && (
        <div className="space-y-4" data-testid="study-workspace-planner">
          <StudyPlannerSuite />
        </div>
      )}

      {/* TAB 6: SMART EXAM REVISION PLANNER */}
      {tab === "revision" && <ExamRevisionScheduler />}

      {/* TAB 7: GRADE 9 UNIT 3 VOCABULARY LIBRARY */}
      {tab === "unit3_vocab" && <Unit3VocabWorkspace />}

      {/* TAB 8: READY-TO-USE LEARNING LIBRARY */}
      {tab === "ready_library" && (
        <div className="surface-card p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                Ready-to-Use Learning & Study Materials
              </h2>
              <p className="text-xs text-muted-foreground">
                Preview and import curated study decks, project blueprints, career roadmaps, and
                wellbeing protocols into your workspace.
              </p>
            </div>
          </div>
          <ReadyToUseLibraryView
            defaultCategory="study"
            onItemImported={() => setTab("flashcards")}
          />
        </div>
      )}
      {/* TAB 9: 3D STEM CONCEPT LAB (LAZY-LOADED) */}
      {tab === "study3d" && (
        <Suspense
          fallback={
            <div className="surface-card p-8 text-center text-xs text-muted-foreground">
              Loading 3D STEM Concept Lab...
            </div>
          }
        >
          <LazyStudy3DScene />
        </Suspense>
      )}

      {/* TAB 10: SKILL ACADEMY */}
      {tab === "skill_academy" && (
        <SkillAcademyWorkspace onNavigateStudyTab={(nextTab) => setTab(nextTab)} />
      )}

      {/* TAB 11: PRACTICAL SKILLS ACADEMY */}
      {tab === "practical_skills" && <PracticalSkillsWorkspace />}

      {/* TAB 12: AI LEARNING INTELLIGENCE LAB */}
      {tab === "learning_lab" && (
        <LearningIntelligenceWorkspace onOpenFlashcards={() => setTab("flashcards")} />
      )}

      {/* TAB 13: WORLD OF SCIENCE (#1-6) */}
      {tab === "science" && (
        <Suspense
          fallback={
            <div className="surface-card flex items-center justify-center p-12 text-xs text-muted-foreground">
              Loading Science Discovery Studio...
            </div>
          }
        >
          <LazyScienceDiscoveryStudio />
        </Suspense>
      )}

      {/* TAB 14: MATHEMATICS & ENGINEERING (#7-12) */}
      {tab === "math" && (
        <Suspense
          fallback={
            <div className="surface-card flex items-center justify-center p-12 text-xs text-muted-foreground">
              Loading Mathematics &amp; Engineering Studio...
            </div>
          }
        >
          <LazyMathEngineeringStudio />
        </Suspense>
      )}

      {/* TAB 15: CREATIVITY STUDIO (#13-18) */}
      {tab === "creativity" && (
        <Suspense
          fallback={
            <div className="surface-card flex items-center justify-center p-12 text-xs text-muted-foreground">
              Loading Creativity Studio...
            </div>
          }
        >
          <LazyCreativityStudio />
        </Suspense>
      )}

      {/* TAB 16: KNOWLEDGE TOOLS & VERSIONING (#41-48) */}
      {tab === "tools" && (
        <Suspense
          fallback={
            <div className="surface-card flex items-center justify-center p-12 text-xs text-muted-foreground">
              Loading Knowledge Tools &amp; Versioning...
            </div>
          }
        >
          <LazyKnowledgeToolsPanel />
        </Suspense>
      )}

      {/* TAB 17: RESEARCH & DISCOVERY LAB */}
      {tab === "research" && (
        <Suspense
          fallback={
            <div className="surface-card flex items-center justify-center p-12 text-xs text-muted-foreground">
              Loading Research &amp; Discovery Lab...
            </div>
          }
        >
          <LazyResearchDiscoveryLab />
        </Suspense>
      )}

      <FocusReadingOverlay
        isOpen={Boolean(focusReadingItem)}
        onClose={() => setFocusReadingItem(null)}
        title={focusReadingItem?.title}
        subtitle={focusReadingItem?.subject}
      >
        <div className="space-y-4">
          <p className="whitespace-pre-wrap leading-relaxed">{focusReadingItem?.content}</p>
        </div>
      </FocusReadingOverlay>
    </div>
  );
}
