import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Headphones,
  Layers,
  LayoutDashboard,
  Mic,
  PenTool,
  Shapes,
  Sparkles,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/Page";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import { Grade9StudyCenter } from "@/components/english/Grade9StudyCenter";
import { ImportantAndEssentialVocabHub } from "@/components/english/ImportantAndEssentialVocabHub";
import { ModernSelect, type ModernSelectOption } from "@/components/ui/modern-select";
import { getActiveTtsAccent, setActiveTtsConfig } from "@/lib/speech-service";
import type { EnglishAccent } from "@/lib/settings";
import { speakEnglishText } from "@/lib/english-speech";
import {
  ListeningAcademyPanel,
  ReadingAcademyPanel,
} from "@/components/english/academies/ListeningAndReadingAcademies";
import { SpeakingAcademyPanel } from "@/components/english/academies/SpeakingAndPronunciationAcademies";
import {
  GrammarAcademyPanel,
  VocabularyAcademyPanel,
  WritingAcademyPanel,
} from "@/components/english/academies/WritingVocabGrammarAcademies";
import { useUser } from "@/hooks/use-nexora";
import { recordLastVisitedModule } from "@/lib/continue-tracker";
import { recordVocabPractice, type WritingSubmissionRecord } from "@/lib/english-world";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

type EnglishTab =
  | "dashboard"
  | "grade9"
  | "important_vocab"
  | "vocabulary"
  | "listening"
  | "reading"
  | "grammar"
  | "speaking"
  | "writing";

const VALID_TABS = new Set<EnglishTab>([
  "dashboard",
  "grade9",
  "important_vocab",
  "vocabulary",
  "listening",
  "reading",
  "grammar",
  "speaking",
  "writing",
]);

function readInitialEnglishTab(): EnglishTab {
  if (typeof window === "undefined") return "vocabulary";
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("tab");
  if (raw && VALID_TABS.has(raw as EnglishTab)) {
    return raw as EnglishTab;
  }
  return "vocabulary";
}

function readInitialUnit(): number | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const unitParam = params.get("unit");
  if (!unitParam) return null;
  const n = parseInt(unitParam, 10);
  return Number.isFinite(n) ? n : null;
}

export function SimpleEnglishWorkspace() {
  const { lang } = usePrefs();
  const { data: user } = useUser();
  const { state, update } = useStudentEcosystem();
  const isAr = lang === "ar";

  useEffect(() => {
    recordLastVisitedModule(user?.uid, {
      path: "/app/english",
      labelEn: "English World",
      labelAr: "عالم اللغة الإنجليزية",
    });
  }, [user?.uid]);

  const [tab, setTab] = useState<EnglishTab>(readInitialEnglishTab);
  const [accent, setAccent] = useState<EnglishAccent>(() => getActiveTtsAccent());
  const initialUnit = readInitialUnit();
  const englishState = state.englishWorld;

  const handleAccentChange = (nextAccent: EnglishAccent) => {
    setAccent(nextAccent);
    setActiveTtsConfig({ accent: nextAccent });
    update((prev) => ({
      ...prev,
      englishAccent: nextAccent,
    }));
    toast.success(
      isAr
        ? `تم تفعيل لكنة النطق: ${nextAccent === "en-US" ? "الإنجليزية الأمريكية 🇺🇸" : "الإنجليزية البريطانية 🇬🇧"}`
        : `Accent set to ${nextAccent === "en-US" ? "American English (US) 🇺🇸" : "British English (UK) 🇬🇧"}`,
    );
  };

  const handleTestAccent = (targetAccent: EnglishAccent) => {
    speakEnglishText(
      targetAccent === "en-US"
        ? "This is American English pronunciation. Clear and natural."
        : "This is British English pronunciation. Clear and natural.",
      { accent: targetAccent },
    );
  };

  const handleSaveNotebookWord = (entry: {
    word: string;
    meaningAr: string;
    definition: string;
    example: string;
    sourceLabel: string;
  }) => {
    if (
      englishState.personalNotebook.some((w) => w.word.toLowerCase() === entry.word.toLowerCase())
    ) {
      toast.info(isAr ? "الكلمة محفوظة مسبقاً." : `'${entry.word}' is already in your notebook.`);
      return;
    }
    update((prev) => ({
      ...prev,
      englishWorld: {
        ...prev.englishWorld,
        personalNotebook: [
          { id: `nb-${Date.now()}`, ...entry, createdAt: new Date().toISOString() },
          ...prev.englishWorld.personalNotebook,
        ],
      },
    }));
    toast.success(isAr ? "تم الحفظ في دفتر المفردات." : `Saved '${entry.word}' to notebook.`);
  };

  const handlePracticeVocab = (input: {
    wordId: string;
    word: string;
    mode: string;
    accurate: boolean;
  }) => {
    update((prev) => ({
      ...prev,
      englishWorld: {
        ...prev.englishWorld,
        vocabProgress: {
          ...prev.englishWorld.vocabProgress,
          [input.wordId]: recordVocabPractice(prev.englishWorld.vocabProgress, input),
        },
      },
    }));
  };

  const handleListeningScore = (trackId: string, trackTitle: string, scorePct: number) => {
    update((prev) => ({
      ...prev,
      englishWorld: {
        ...prev.englishWorld,
        listeningScores: {
          ...prev.englishWorld.listeningScores,
          [trackId]: Math.max(prev.englishWorld.listeningScores[trackId] ?? 0, scorePct),
        },
      },
    }));
    toast.success(`${trackTitle}: ${scorePct}%`);
  };

  const handleReadingScore = (passageId: string, passageTitle: string, scorePct: number) => {
    update((prev) => ({
      ...prev,
      englishWorld: {
        ...prev.englishWorld,
        readingScores: {
          ...prev.englishWorld.readingScores,
          [passageId]: Math.max(prev.englishWorld.readingScores[passageId] ?? 0, scorePct),
        },
      },
    }));
    toast.success(`${passageTitle}: ${scorePct}%`);
  };

  const handleGrammarScore = (topicId: string, topicTitle: string, scorePct: number) => {
    update((prev) => ({
      ...prev,
      englishWorld: {
        ...prev.englishWorld,
        grammarScores: {
          ...prev.englishWorld.grammarScores,
          [topicId]: Math.max(prev.englishWorld.grammarScores[topicId] ?? 0, scorePct),
        },
      },
    }));
    toast.success(`${topicTitle}: ${scorePct}%`);
  };

  const handleCompleteSpeaking = (scenarioId: string, title: string) => {
    update((prev) => ({
      ...prev,
      englishWorld: {
        ...prev.englishWorld,
        speakingPracticed: prev.englishWorld.speakingPracticed.includes(scenarioId)
          ? prev.englishWorld.speakingPracticed
          : [...prev.englishWorld.speakingPracticed, scenarioId],
      },
    }));
    toast.success(isAr ? `تم حفظ تدريب التحدث: ${title}` : `Saved speaking practice: ${title}`);
  };

  const handleSaveWriting = (record: WritingSubmissionRecord) => {
    update((prev) => ({
      ...prev,
      englishWorld: {
        ...prev.englishWorld,
        writingSubmissions: {
          ...prev.englishWorld.writingSubmissions,
          [record.taskId]: record,
        },
      },
    }));
    toast.success(
      isAr
        ? `تم حفظ الكتابة (${record.latestScorePct}%)`
        : `Writing saved (${record.latestScorePct}%).`,
    );
  };

  const noop = () => undefined;

  const navItems: ReadonlyArray<{
    id: EnglishTab;
    en: string;
    ar: string;
    icon: typeof Layers;
  }> = [
    { id: "dashboard", en: "Learning Dashboard", ar: "لوحة التعلم", icon: LayoutDashboard },
    {
      id: "grade9",
      en: "Grade 9 — Units 1–4",
      ar: "الصف التاسع — الوحدات ١–٤",
      icon: GraduationCap,
    },
    {
      id: "important_vocab",
      en: "Important & Essential Vocab",
      ar: "المفردات المهمة والأساسية",
      icon: Sparkles,
    },
    { id: "vocabulary", en: "Vocabulary", ar: "المفردات", icon: Layers },
    { id: "listening", en: "Listening", ar: "الاستماع", icon: Headphones },
    { id: "reading", en: "Reading", ar: "القراءة", icon: BookOpen },
    { id: "grammar", en: "Grammar", ar: "القواعد", icon: Shapes },
    { id: "speaking", en: "Speaking", ar: "التحدث", icon: Mic },
    { id: "writing", en: "Writing", ar: "الكتابة", icon: PenTool },
  ];

  const navOptions: ModernSelectOption[] = navItems.map((item) => {
    const Icon = item.icon;
    return {
      value: item.id,
      label: isAr ? item.ar : item.en,
      icon: <Icon className="size-4" />,
      keywords: `${item.en} ${item.ar} ${item.id}`,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={isAr ? "عالم اللغة الإنجليزية" : "English World"}
        subtitle={
          isAr
            ? "تدرّب على مفردات الصف التاسع والاستماع والقراءة والقواعد والتحدث والكتابة بوضوح."
            : "Practice Grade 9 Vocabulary, Listening, Reading, Grammar, Speaking, and Writing in a clear vertical workspace."
        }
      />

      <div className="space-y-6">
        {/* Spacious Full-Width Searchable Section Bar */}
        <nav
          aria-label={isAr ? "أقسام عالم الإنجليزية" : "English World sections"}
          className="surface-card flex flex-col gap-3.5 rounded-2xl border border-border p-4 sm:p-5"
        >
          <div className="w-full sm:max-w-sm">
            <ModernSelect
              label={isAr ? "القسم الدراسي" : "English Section"}
              value={tab}
              onValueChange={(v) => setTab(v as EnglishTab)}
              options={navOptions}
              searchable
              searchPlaceholder={
                isAr ? "ابحث في أقسام الإنجليزية..." : "Search English sections..."
              }
              data-testid="english-world-section-select"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`flex min-h-[44px] items-center gap-2.5 rounded-xl px-4 py-2.5 text-start text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                      : "border border-border/70 bg-surface-2/60 text-foreground hover:border-primary/40 hover:bg-surface-2"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="leading-snug whitespace-nowrap">{isAr ? item.ar : item.en}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Accent Preference Toolbar */}
        <div className="surface-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-3.5 sm:px-5">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Volume2 className="size-4" />
            </div>
            <div>
              <span className="font-bold text-foreground">
                {isAr ? "لكنة النطق في عالم الإنجليزية:" : "Active English Accent:"}
              </span>
              <span className="ms-1.5 text-muted-foreground hidden sm:inline">
                {isAr
                  ? "اختر اللكنة المفضلة لنطق الكلمات وفقرات القراءة والاستماع"
                  : "Choose your preferred accent for vocabulary pronunciation and reading passages"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAccentChange("en-US")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                accent === "en-US"
                  ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30"
                  : "border border-border bg-surface-2 text-muted-foreground hover:text-foreground"
              }`}
              title="Switch to American English"
            >
              <span>🇺🇸</span>
              <span>{isAr ? "أمريكي (US)" : "American (US)"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleAccentChange("en-GB")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                accent === "en-GB"
                  ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30"
                  : "border border-border bg-surface-2 text-muted-foreground hover:text-foreground"
              }`}
              title="Switch to British English"
            >
              <span>🇬🇧</span>
              <span>{isAr ? "بريطاني (UK)" : "British (UK)"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleTestAccent(accent)}
              className="flex items-center gap-1 rounded-xl border border-border/80 bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-primary/10 cursor-pointer"
              title="Test current accent"
            >
              <Volume2 className="size-3.5" />
              <span>{isAr ? "تجربة الصوت" : "Test Voice"}</span>
            </button>
          </div>
        </div>

        {/* Main Content Panel — Full Width */}
        <div className="min-w-0 w-full">
          {tab === "dashboard" && (
            <div className="space-y-4">
              <div className="surface-card space-y-3 rounded-2xl p-6">
                <h2 className="font-display text-xl font-bold text-foreground">
                  {isAr ? "مرحباً بك في عالم الإنجليزية" : "Welcome to English World"}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isAr
                    ? "اختر القسم المناسب من القائمة الجانبية: وحدات الصف التاسع، الاستماع، القراءة، القواعد التفاعلية (بما فيها Both...and و Neither...nor)، التحدث، والكتابة."
                    : "Pick any skill from the menu: Grade 9 Vocabulary & Quizzes, Listening, Reading, Interactive Grammar (including Both ... and / Neither ... nor), Speaking, and Writing."}
                </p>
                <div className="grid gap-3 pt-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setTab("grade9")}
                    className="flex min-h-[56px] items-center justify-between rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-start transition-colors hover:bg-primary/15"
                  >
                    <div>
                      <div className="text-sm font-bold text-primary">
                        {isAr ? "الصف التاسع — الوحدات ١–٤" : "Grade 9 — Units 1–4"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {isAr ? "مفردات الوحدات ١–٤ واختباراتها" : "Units 1–4 words & tests"}
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-primary rtl-flip shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab("important_vocab")}
                    className="flex min-h-[56px] items-center justify-between rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-start transition-colors hover:bg-emerald-500/15"
                  >
                    <div>
                      <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                        {isAr ? "المفردات المهمة والأساسية" : "Important & Essential Vocab"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {isAr ? "قسم مستقل + اختبارات فورية" : "Standalone pack & quiz"}
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-emerald-600 rtl-flip shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab("grammar")}
                    className="flex min-h-[56px] items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-start transition-colors hover:border-primary/40"
                  >
                    <div>
                      <div className="text-sm font-bold text-foreground">
                        {isAr ? "القواعد والاختبارات التفاعلية" : "Interactive Grammar"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {isAr
                          ? `دفترك الشخصي: ${englishState.personalNotebook.length} كلمة`
                          : `Notebook saved: ${englishState.personalNotebook.length} words`}
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-primary rtl-flip shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === "grade9" && <Grade9StudyCenter initialUnit={initialUnit} />}

          {tab === "important_vocab" && <ImportantAndEssentialVocabHub />}

          {tab === "vocabulary" && (
            <VocabularyAcademyPanel
              englishState={englishState}
              onPracticeWord={handlePracticeVocab}
              onAddNotebookWord={handleSaveNotebookWord}
              onPushFlashcardToStudy={(entry) =>
                handleSaveNotebookWord({
                  word: entry.word,
                  meaningAr: entry.back,
                  definition: entry.back,
                  example: "",
                  sourceLabel: "Vocabulary",
                })
              }
            />
          )}

          {tab === "listening" && (
            <ListeningAcademyPanel
              englishState={englishState}
              onSaveNotebookWord={handleSaveNotebookWord}
              onSubmitListeningScore={handleListeningScore}
              onRecordMistake={noop}
            />
          )}

          {tab === "reading" && (
            <ReadingAcademyPanel
              englishState={englishState}
              onSaveNotebookWord={handleSaveNotebookWord}
              onSubmitReadingScore={handleReadingScore}
              onRecordMistake={noop}
            />
          )}

          {tab === "grammar" && (
            <GrammarAcademyPanel
              englishState={englishState}
              onSubmitGrammarScore={handleGrammarScore}
              onRecordMistake={noop}
            />
          )}

          {tab === "speaking" && (
            <AppErrorBoundary
              fallbackTitle={isAr ? "تعذر الوصول للميكروفون" : "Speaking playback reset safely"}
              fallbackDesc={
                isAr
                  ? "يمكنك كتابة إجابتك وتجربة النماذج الصوتية دون مشكلة."
                  : "You can type responses and use guided audio safely."
              }
            >
              <SpeakingAcademyPanel
                englishState={englishState}
                onCompleteSpeakingScenario={handleCompleteSpeaking}
              />
            </AppErrorBoundary>
          )}

          {tab === "writing" && (
            <WritingAcademyPanel
              englishState={englishState}
              onSaveWritingSubmission={handleSaveWriting}
            />
          )}
        </div>
      </div>
    </div>
  );
}
