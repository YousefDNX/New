import { useEffect, useState } from "react";
import { BookOpen, Headphones, Layers, Mic, PenTool, Shapes } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/Page";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
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
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-nexora";
import { recordLastVisitedModule } from "@/lib/continue-tracker";
import { recordVocabPractice, type WritingSubmissionRecord } from "@/lib/english-world";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

type EnglishTab = "vocabulary" | "listening" | "reading" | "grammar" | "speaking" | "writing";

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

  const [tab, setTab] = useState<EnglishTab>("vocabulary");
  const englishState = state.englishWorld;

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

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={isAr ? "عالم اللغة الإنجليزية" : "English World"}
        subtitle={
          isAr
            ? "تدرّب على المفردات والاستماع والقراءة والقواعد والتحدث والكتابة بحرية ووضوح."
            : "Open practice for Vocabulary, Listening, Reading, Grammar, Speaking, and Writing."
        }
      />

      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface/60 p-1.5">
        {(
          [
            { id: "vocabulary", en: "Vocabulary", ar: "المفردات", icon: Layers },
            { id: "listening", en: "Listening", ar: "الاستماع", icon: Headphones },
            { id: "reading", en: "Reading", ar: "القراءة", icon: BookOpen },
            { id: "grammar", en: "Grammar", ar: "القواعد", icon: Shapes },
            { id: "speaking", en: "Speaking", ar: "التحدث", icon: Mic },
            { id: "writing", en: "Writing", ar: "الكتابة", icon: PenTool },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={tab === item.id ? "glow" : "ghost"}
              onClick={() => setTab(item.id)}
              className="gap-1.5 text-xs"
            >
              <Icon className="size-3.5" />
              <span>{isAr ? item.ar : item.en}</span>
            </Button>
          );
        })}
      </div>

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
  );
}
