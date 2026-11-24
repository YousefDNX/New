import { BookOpen, Headphones, Layers, Mic, PenTool, Shapes, Volume2 } from "lucide-react";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import { Button } from "@/components/ui/button";
import type { AcademyWorkspaceId } from "@/data/english-curriculum";
import type { EnglishWorldState, WritingSubmissionRecord } from "@/lib/english-world";
import {
  ListeningAcademyPanel,
  ReadingAcademyPanel,
} from "./academies/ListeningAndReadingAcademies";
import {
  PronunciationAcademyPanel,
  SpeakingAcademyPanel,
} from "./academies/SpeakingAndPronunciationAcademies";
import {
  GrammarAcademyPanel,
  VocabularyAcademyPanel,
  WritingAcademyPanel,
} from "./academies/WritingVocabGrammarAcademies";

const ACADEMY_TABS: Array<{
  id: AcademyWorkspaceId;
  label: string;
  icon: typeof Headphones;
}> = [
  { id: "listening", label: "Listening", icon: Headphones },
  { id: "speaking", label: "Speaking", icon: Mic },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "writing", label: "Writing", icon: PenTool },
  { id: "vocabulary", label: "Vocabulary", icon: Layers },
  { id: "grammar", label: "Grammar", icon: Shapes },
  { id: "pronunciation", label: "Pronunciation", icon: Volume2 },
];

export function SkillAcademiesPanel({
  activeAcademy,
  onSelectAcademy,
  englishState,
  initialWritingTaskId,
  onSaveNotebookWord,
  onPushFlashcardToStudy,
  onSubmitListeningScore,
  onSubmitReadingScore,
  onSubmitGrammarScore,
  onCompleteSpeakingScenario,
  onCompletePronunciationModule,
  onPracticeVocabWord,
  onSaveWritingSubmission,
  onRecordMistake,
  onOpenUnit3FullArena,
}: {
  activeAcademy: AcademyWorkspaceId;
  onSelectAcademy: (academy: AcademyWorkspaceId) => void;
  englishState: EnglishWorldState;
  initialWritingTaskId?: string | null | undefined;
  onSaveNotebookWord: (entry: {
    word: string;
    meaningAr: string;
    definition: string;
    example: string;
    sourceLabel: string;
  }) => void;
  onPushFlashcardToStudy: (entry: { word: string; back: string }) => void;
  onSubmitListeningScore: (trackId: string, trackTitle: string, scorePct: number) => void;
  onSubmitReadingScore: (passageId: string, passageTitle: string, scorePct: number) => void;
  onSubmitGrammarScore: (topicId: string, topicTitle: string, scorePct: number) => void;
  onCompleteSpeakingScenario: (scenarioId: string, title: string) => void;
  onCompletePronunciationModule: (moduleId: string, title: string) => void;
  onPracticeVocabWord: (input: {
    wordId: string;
    word: string;
    mode: string;
    accurate: boolean;
  }) => void;
  onSaveWritingSubmission: (record: WritingSubmissionRecord) => void;
  onRecordMistake: (input: {
    skill: AcademyWorkspaceId;
    itemTitle: string;
    prompt: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
  }) => void;
  onOpenUnit3FullArena?: (() => void) | undefined;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-surface-2/60 p-1.5">
        {ACADEMY_TABS.map((item) => {
          const Icon = item.icon;
          const active = activeAcademy === item.id;
          return (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={active ? "glow" : "ghost"}
              onClick={() => onSelectAcademy(item.id)}
              className="min-h-[44px] gap-1.5 whitespace-nowrap shrink-0 text-xs"
            >
              <Icon className="size-3.5" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </div>

      {activeAcademy === "listening" && (
        <ListeningAcademyPanel
          englishState={englishState}
          onSaveNotebookWord={onSaveNotebookWord}
          onSubmitListeningScore={onSubmitListeningScore}
          onRecordMistake={onRecordMistake}
        />
      )}

      {activeAcademy === "speaking" && (
        <AppErrorBoundary
          fallbackTitle="Speaking Academy audio reset safely"
          fallbackDesc="Microphone recording or playback hit a browser limitation. Your English progress is safe."
        >
          <SpeakingAcademyPanel
            englishState={englishState}
            onCompleteSpeakingScenario={onCompleteSpeakingScenario}
          />
        </AppErrorBoundary>
      )}

      {activeAcademy === "reading" && (
        <ReadingAcademyPanel
          englishState={englishState}
          onSaveNotebookWord={onSaveNotebookWord}
          onSubmitReadingScore={onSubmitReadingScore}
          onRecordMistake={onRecordMistake}
        />
      )}

      {activeAcademy === "writing" && (
        <WritingAcademyPanel
          englishState={englishState}
          {...(initialWritingTaskId !== undefined ? { initialTaskId: initialWritingTaskId } : {})}
          onSaveWritingSubmission={onSaveWritingSubmission}
        />
      )}

      {activeAcademy === "vocabulary" && (
        <VocabularyAcademyPanel
          englishState={englishState}
          onPracticeWord={onPracticeVocabWord}
          onAddNotebookWord={onSaveNotebookWord}
          onPushFlashcardToStudy={onPushFlashcardToStudy}
          {...(onOpenUnit3FullArena ? { onOpenUnit3FullArena } : {})}
        />
      )}

      {activeAcademy === "grammar" && (
        <GrammarAcademyPanel
          englishState={englishState}
          onSubmitGrammarScore={onSubmitGrammarScore}
          onRecordMistake={onRecordMistake}
        />
      )}

      {activeAcademy === "pronunciation" && (
        <PronunciationAcademyPanel
          englishState={englishState}
          onCompletePronunciationModule={onCompletePronunciationModule}
        />
      )}
    </div>
  );
}
