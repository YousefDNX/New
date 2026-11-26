import { BookOpen, Headphones, Layers, Mic, PenTool, Shapes, Volume2 } from "lucide-react";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import { Button } from "@/components/ui/button";
import { ModernSelect, type ModernSelectOption } from "@/components/ui/modern-select";
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
  desc: string;
  icon: typeof Headphones;
}> = [
  {
    id: "listening",
    label: "Listening",
    desc: "Audio tracks & comprehension checks",
    icon: Headphones,
  },
  { id: "speaking", label: "Speaking", desc: "Conversations & confidence gauge", icon: Mic },
  { id: "reading", label: "Reading", desc: "Passages & main-idea analysis", icon: BookOpen },
  { id: "writing", label: "Writing", desc: "Guided prompts & live checker", icon: PenTool },
  { id: "vocabulary", label: "Vocabulary", desc: "Grade 9 Units 1–4 & flashcards", icon: Layers },
  { id: "grammar", label: "Grammar", desc: "14 systematic CEFR grammar topics", icon: Shapes },
  {
    id: "pronunciation",
    label: "Pronunciation",
    desc: "Contrast pairs & shadowing drills",
    icon: Volume2,
  },
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
  const academySelectOptions: ModernSelectOption[] = ACADEMY_TABS.map((item) => {
    const Icon = item.icon;
    return {
      value: item.id,
      label: item.label,
      description: item.desc,
      icon: <Icon className="size-4" />,
      keywords: `${item.label} ${item.desc} ${item.id}`,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="w-full lg:w-80 shrink-0">
          <ModernSelect
            label="Skill Academy"
            value={activeAcademy}
            onValueChange={(v) => onSelectAcademy(v as AcademyWorkspaceId)}
            options={academySelectOptions}
            searchable
            searchPlaceholder="Jump to an English skill..."
            data-testid="english-skill-academy-select"
          />
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-2 rounded-xl border border-border bg-surface-2/60 p-2">
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
                className="min-h-[44px] gap-2 px-3.5 whitespace-nowrap shrink-0 text-xs"
              >
                <Icon className="size-3.5" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>
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
