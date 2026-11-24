import { useContext, useEffect, useRef, useState } from "react";
import { QueryClientContext } from "@tanstack/react-query";
import {
  BookOpen,
  ClipboardCheck,
  Compass,
  Flame,
  GraduationCap,
  Layers,
  Map as MapIcon,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import {
  CURRICULUM_LESSONS,
  type AcademyWorkspaceId,
  type EnglishLesson,
  type LevelMasteryExam,
} from "@/data/english-curriculum";
import { awardXpIfUnique, useTaskActions, useUser } from "@/hooks/use-nexora";
import { useStudyActions } from "@/hooks/use-modules";
import {
  evaluateExtendedPlacement,
  recordVocabPractice,
  syncDailyCountersForDate,
  todayIsoDateKey,
  touchEnglishStreak,
  type EarnedEnglishCertificate,
  type EnglishRecommendation,
  type EnglishWorldState,
  type WritingSubmissionRecord,
} from "@/lib/english-world";
import { evaluateSkillPlacement } from "@/lib/skill-academy";
import { useStudentEcosystem } from "@/lib/student-ecosystem";
import { buildEventDocId } from "@/lib/xp-rules";
import { BRAND } from "@/config/brand";
import { AdventureMapView } from "./AdventureMapView";
import { CurriculumLessonPlayer } from "./CurriculumLessonPlayer";
import { EnglishDashboardView } from "./EnglishDashboardView";
import { PlacementAndAssessmentsView } from "./PlacementAndAssessmentsView";
import { SkillAcademiesPanel } from "./SkillAcademiesPanel";

type WorldTab = "map" | "curriculum" | "academies" | "placement" | "dashboard";

interface BridgeActions {
  pushFlashcard: (word: string, back: string) => void;
  pushTask: (title: string, details: string) => void;
  logQuiz: (subject: string, totalQuestions: number, correctCount: number) => void;
}

function FirestoreEnglishBridge({ onReady }: { onReady: (actions: BridgeActions) => void }) {
  const { addStudyItem, recordQuizAttempt } = useStudyActions();
  const { addTask } = useTaskActions();
  const actionsRef = useRef({ addStudyItem, recordQuizAttempt, addTask });
  actionsRef.current = { addStudyItem, recordQuizAttempt, addTask };
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    onReadyRef.current({
      pushFlashcard: (word, back) => {
        void Promise.resolve(
          actionsRef.current.addStudyItem({
            kind: "flashcard",
            subject: "English",
            deck: "English Adventure World",
            title: word,
            content: `Define and use '${word}' naturally.`,
            answer: back,
          }),
        ).catch(() => {
          /* guest or offline fallback */
        });
      },
      pushTask: (title, details) => {
        void Promise.resolve(
          actionsRef.current.addTask({
            title,
            details,
            area: "academic",
            subject: "English",
            priority: "medium",
          }),
        ).catch(() => {
          /* guest or offline fallback */
        });
      },
      logQuiz: (subject, totalQuestions, correctCount) => {
        void Promise.resolve(
          actionsRef.current.recordQuizAttempt({
            subject,
            totalQuestions,
            correctCount,
            wrongItemIds: [],
          }),
        ).catch(() => {
          /* guest or offline fallback */
        });
      },
    });
  }, []);

  return null;
}

export function EnglishAdventureWorld({
  onNavigateStudyTab,
}: {
  onNavigateStudyTab?: ((tab: "flashcards" | "unit3_vocab" | "quiz") => void) | undefined;
}) {
  const qc = useContext(QueryClientContext);
  const { data: user } = useUser();
  const { state, update } = useStudentEcosystem();

  const [tab, setTab] = useState<WorldTab>("map");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    CURRICULUM_LESSONS[0]?.id ?? null,
  );
  const [activeAcademy, setActiveAcademy] = useState<AcademyWorkspaceId>("listening");
  const [selectedWritingTaskId, setSelectedWritingTaskId] = useState<string | null>(null);
  const [bridgeActions, setBridgeActions] = useState<BridgeActions | null>(null);

  const englishState = state.englishWorld;
  const latestPlacement =
    englishState.placementHistory.length > 0
      ? englishState.placementHistory[englishState.placementHistory.length - 1]
      : null;

  const grantFirestoreXp = (eventType: string, refId: string, xpReward: number) => {
    const uid = user?.uid;
    if (!uid) return;
    const nowIso = new Date().toISOString();
    void awardXpIfUnique({
      userId: uid,
      eventDocId: buildEventDocId(uid, eventType, refId),
      eventType,
      area: "academic",
      xpReward,
      refId,
      nowIso,
    }).catch(() => {
      /* offline or guest mode */
    });
  };

  const mutateEnglish = (updater: (prev: EnglishWorldState) => EnglishWorldState) => {
    update((prev) => ({
      ...prev,
      englishWorld: updater(touchEnglishStreak(syncDailyCountersForDate(prev.englishWorld))),
    }));
  };

  const handleCompleteLesson = (input: {
    lesson: EnglishLesson;
    scorePct: number;
    passed: boolean;
  }) => {
    const alreadyDone = englishState.completedLessons.includes(input.lesson.id);
    mutateEnglish((ew) => {
      const prevScore = ew.lessonScores[input.lesson.id] ?? 0;
      const nextLessons =
        input.passed && !ew.completedLessons.includes(input.lesson.id)
          ? [...ew.completedLessons, input.lesson.id]
          : ew.completedLessons;
      const xpEarned = input.passed && !alreadyDone ? input.lesson.xpReward : 5;
      return {
        ...ew,
        lessonScores: {
          ...ew.lessonScores,
          [input.lesson.id]: Math.max(prevScore, input.scorePct),
        },
        completedLessons: nextLessons,
        englishXp: ew.englishXp + xpEarned,
        dailyCounters: {
          ...ew.dailyCounters,
          lessonsDone: ew.dailyCounters.lessonsDone + (input.passed ? 1 : 0),
        },
      };
    });
    if (input.passed) {
      grantFirestoreXp("ENGLISH_LESSON_COMPLETED", input.lesson.id, input.lesson.xpReward);
      toast.success(`Lesson mastered (${input.scorePct}%)! +${input.lesson.xpReward} XP`);
    } else {
      toast.info(
        `Saved attempt (${input.scorePct}%). Review explanations to hit ${input.lesson.minPassPct}%+.`,
      );
    }
  };

  const handleRecordMistake = (input: {
    skill: AcademyWorkspaceId;
    itemTitle: string;
    prompt: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
  }) => {
    mutateEnglish((ew) => {
      const exists = ew.mistakes.some((m) => m.prompt === input.prompt && !m.reviewed);
      if (exists) return ew;
      const nextMistake = {
        id: `em-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        skill: input.skill,
        itemTitle: input.itemTitle,
        prompt: input.prompt,
        userAnswer: input.userAnswer,
        correctAnswer: input.correctAnswer,
        explanation: input.explanation,
        recordedAt: new Date().toISOString(),
        reviewed: false,
      };
      return {
        ...ew,
        mistakes: [nextMistake, ...ew.mistakes].slice(0, 60),
      };
    });
  };

  const handleSaveNotebookWord = (entry: {
    word: string;
    meaningAr: string;
    definition: string;
    example: string;
    sourceLabel: string;
  }) => {
    const duplicate = englishState.personalNotebook.some(
      (w) => w.word.toLowerCase() === entry.word.toLowerCase(),
    );
    if (duplicate) {
      toast.info(`'${entry.word}' is already inside your Vocabulary Notebook.`);
      return;
    }
    mutateEnglish((ew) => ({
      ...ew,
      personalNotebook: [
        {
          id: `nb-${Date.now()}`,
          ...entry,
          createdAt: new Date().toISOString(),
        },
        ...ew.personalNotebook,
      ],
    }));
    toast.success(`Saved '${entry.word}' to your Vocabulary Notebook.`);
  };

  const handlePushFlashcardToStudy = (entry: { word: string; back: string }) => {
    if (bridgeActions) {
      bridgeActions.pushFlashcard(entry.word, entry.back);
      toast.success(`Synced '${entry.word}' to ${BRAND.shortName} SM-2 Flashcards.`);
    } else {
      handleSaveNotebookWord({
        word: entry.word,
        meaningAr: entry.back.split("—")[0]?.trim() ?? "",
        definition: entry.back,
        example: "",
        sourceLabel: "Vocabulary Flashcard",
      });
    }
  };

  const handlePracticeVocabWord = (input: {
    wordId: string;
    word: string;
    mode: string;
    accurate: boolean;
  }) => {
    mutateEnglish((ew) => {
      const updated = recordVocabPractice(ew.vocabProgress, input);
      return {
        ...ew,
        vocabProgress: {
          ...ew.vocabProgress,
          [input.wordId]: updated,
        },
        englishXp: ew.englishXp + (input.accurate ? 4 : 1),
        dailyCounters: {
          ...ew.dailyCounters,
          vocabPracticed: ew.dailyCounters.vocabPracticed + 1,
        },
      };
    });
  };

  const handleSubmitListeningScore = (trackId: string, trackTitle: string, scorePct: number) => {
    const firstPass = typeof englishState.listeningScores[trackId] !== "number";
    mutateEnglish((ew) => ({
      ...ew,
      listeningScores: {
        ...ew.listeningScores,
        [trackId]: Math.max(ew.listeningScores[trackId] ?? 0, scorePct),
      },
      englishXp: ew.englishXp + (firstPass ? 20 : 5),
      dailyCounters: {
        ...ew.dailyCounters,
        listeningDone: ew.dailyCounters.listeningDone + 1,
      },
    }));
    if (firstPass) grantFirestoreXp("ENGLISH_LISTENING_DONE", trackId, 20);
    toast.success(`Listening '${trackTitle}' saved (${scorePct}%).`);
  };

  const handleSubmitReadingScore = (passageId: string, passageTitle: string, scorePct: number) => {
    const firstPass = typeof englishState.readingScores[passageId] !== "number";
    mutateEnglish((ew) => ({
      ...ew,
      readingScores: {
        ...ew.readingScores,
        [passageId]: Math.max(ew.readingScores[passageId] ?? 0, scorePct),
      },
      englishXp: ew.englishXp + (firstPass ? 20 : 5),
    }));
    if (firstPass) grantFirestoreXp("ENGLISH_READING_DONE", passageId, 20);
    toast.success(`Reading '${passageTitle}' saved (${scorePct}%).`);
  };

  const handleSubmitGrammarScore = (topicId: string, topicTitle: string, scorePct: number) => {
    const firstPass = typeof englishState.grammarScores[topicId] !== "number";
    mutateEnglish((ew) => ({
      ...ew,
      grammarScores: {
        ...ew.grammarScores,
        [topicId]: Math.max(ew.grammarScores[topicId] ?? 0, scorePct),
      },
      englishXp: ew.englishXp + (firstPass ? 15 : 5),
    }));
    if (firstPass) grantFirestoreXp("ENGLISH_GRAMMAR_DONE", topicId, 15);
    toast.success(`Grammar check for '${topicTitle}' saved (${scorePct}%).`);
  };

  const handleCompleteSpeakingScenario = (scenarioId: string, title: string) => {
    const firstTime = !englishState.speakingPracticed.includes(scenarioId);
    mutateEnglish((ew) => ({
      ...ew,
      speakingPracticed: ew.speakingPracticed.includes(scenarioId)
        ? ew.speakingPracticed
        : [...ew.speakingPracticed, scenarioId],
      englishXp: ew.englishXp + (firstTime ? 20 : 5),
    }));
    if (firstTime) grantFirestoreXp("ENGLISH_SPEAKING_DONE", scenarioId, 20);
    toast.success(`Speaking response recorded for '${title}'.`);
  };

  const handleCompletePronunciationModule = (moduleId: string, title: string) => {
    const firstTime = !englishState.pronunciationPracticed.includes(moduleId);
    mutateEnglish((ew) => ({
      ...ew,
      pronunciationPracticed: ew.pronunciationPracticed.includes(moduleId)
        ? ew.pronunciationPracticed
        : [...ew.pronunciationPracticed, moduleId],
      englishXp: ew.englishXp + (firstTime ? 15 : 5),
    }));
    if (firstTime) grantFirestoreXp("ENGLISH_PRONUNCIATION_DONE", moduleId, 15);
    toast.success(`Pronunciation check saved for '${title}'.`);
  };

  const handleSaveWritingSubmission = (record: WritingSubmissionRecord) => {
    const isNew = !englishState.writingSubmissions[record.taskId];
    mutateEnglish((ew) => ({
      ...ew,
      writingSubmissions: {
        ...ew.writingSubmissions,
        [record.taskId]: record,
      },
      englishXp: ew.englishXp + (isNew ? 25 : 10),
      dailyCounters: {
        ...ew.dailyCounters,
        writingDone: ew.dailyCounters.writingDone + 1,
      },
    }));
    grantFirestoreXp(
      "ENGLISH_WRITING_SAVED",
      `${record.taskId}_${record.revisionCount}`,
      isNew ? 25 : 10,
    );
    toast.success(`Writing saved (${record.latestScorePct}%). Feedback & revision tips updated.`);
  };

  const handleSubmitPlacement = (input: {
    answers: Record<string, number>;
    writingSample: string;
  }) => {
    const basePlacement = evaluateSkillPlacement(input.answers);
    const extendedSnapshot = evaluateExtendedPlacement({
      mcqAnswers: input.answers,
      writingSample: input.writingSample,
      basePlacement,
    });
    update((prev) => ({
      ...prev,
      placement: basePlacement,
      activeLearningPathId: basePlacement.recommendedPathId,
      englishWorld: {
        ...touchEnglishStreak(syncDailyCountersForDate(prev.englishWorld)),
        placementSkipped: false,
        placementHistory: [...prev.englishWorld.placementHistory, extendedSnapshot],
        englishXp: prev.englishWorld.englishXp + 30,
      },
    }));
    grantFirestoreXp("ENGLISH_PLACEMENT_COMPLETED", extendedSnapshot.id, 30);
    toast.success(`Placement evaluated: Estimated level ${extendedSnapshot.overallBand}.`);
  };

  const handleSkipPlacement = () => {
    mutateEnglish((ew) => ({
      ...ew,
      placementSkipped: true,
    }));
    toast.info("Placement skipped for now—start any Foundation lesson immediately.");
  };

  const handleSubmitLevelExam = (exam: LevelMasteryExam, scorePct: number, passed: boolean) => {
    mutateEnglish((ew) => {
      const prevBest = ew.examScores[exam.id] ?? 0;
      const alreadyHasCert = ew.certificates.some((c) => c.id === exam.certificateId);
      const nextCerts: EarnedEnglishCertificate[] =
        passed && !alreadyHasCert
          ? [
              ...ew.certificates,
              {
                id: exam.certificateId,
                examId: exam.id,
                title: exam.certificateTitle,
                levelId: exam.levelId,
                scorePct,
                earnedAt: new Date().toISOString(),
                disclaimer: `${BRAND.shortName} Internal Completion Certificate — verifies assessment completion inside this platform; not an external official CEFR exam.`,
              },
            ]
          : ew.certificates;
      return {
        ...ew,
        examScores: { ...ew.examScores, [exam.id]: Math.max(prevBest, scorePct) },
        certificates: nextCerts,
        englishXp: ew.englishXp + (passed ? 40 : 10),
      };
    });
    if (bridgeActions) {
      const correct = Math.round((scorePct / 100) * exam.questions.length);
      bridgeActions.logQuiz(`English ${exam.title}`, exam.questions.length, correct);
    }
    if (passed) {
      grantFirestoreXp("ENGLISH_EXAM_PASSED", exam.id, 40);
      toast.success(`Passed ${exam.title} (${scorePct}%)! Certificate unlocked.`);
    } else {
      toast.info(`Scored ${scorePct}% (${exam.passingPct}% needed to unlock certificate).`);
    }
  };

  const handleNavigateRecommendation = (rec: EnglishRecommendation) => {
    if (rec.targetSurface === "placement") {
      setTab("placement");
    } else if (rec.targetSurface === "lesson") {
      if (rec.targetItemId) setSelectedLessonId(rec.targetItemId);
      setTab("curriculum");
    } else {
      setActiveAcademy(rec.targetSurface);
      if (rec.targetSurface === "writing" && rec.targetItemId) {
        setSelectedWritingTaskId(rec.targetItemId);
      }
      setTab("academies");
    }
  };

  const handleAddRecommendationToTasks = (rec: EnglishRecommendation) => {
    if (!bridgeActions) {
      toast.info("Open from inside your signed-in workspace to save tasks to your planner.");
      return;
    }
    bridgeActions.pushTask(`English: ${rec.title}`, rec.whyRecommended);
    toast.success("Added recommended English mission to Productivity Tasks.");
  };

  const handleClaimDailyMission = (claimKey: string, title: string, xpBonus: number) => {
    if (englishState.claimedMissionDates.includes(claimKey)) return;
    mutateEnglish((ew) => ({
      ...ew,
      claimedMissionDates: [...ew.claimedMissionDates, claimKey],
      englishXp: ew.englishXp + xpBonus,
    }));
    grantFirestoreXp("ENGLISH_MISSION_CLAIMED", claimKey, xpBonus);
    toast.success(`Daily Mission claimed (${title})! +${xpBonus} XP`);
  };

  const handleMarkMistakeReviewed = (mistakeId: string) => {
    mutateEnglish((ew) => ({
      ...ew,
      mistakes: ew.mistakes.map((m) => (m.id === mistakeId ? { ...m, reviewed: true } : m)),
      englishXp: ew.englishXp + 5,
    }));
    toast.success("Mistake marked as reviewed! +5 XP");
  };

  return (
    <div className="space-y-5">
      {qc !== null && <FirestoreEnglishBridge onReady={setBridgeActions} />}

      {/* World Command Header + Live Proficiency Summary Strip */}
      <div className="surface-card space-y-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
              <GraduationCap className="size-4" />
              <span>{BRAND.shortName} English World</span>
            </div>
            <h2 className="mt-1 font-display text-xl font-bold text-foreground">
              Interactive English Curriculum, 10 Regions &amp; 7 Skill Academies
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Pre-A1 to C1–C2 structured lessons, guided listening, writing coaching, vocabulary
              practice, and adaptive level diagnostics.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <FeatureGuideTrigger featureId="skill-academy" />
          </div>
        </div>

        {/* Clean 4-metric KPI summary bar */}
        <div className="grid grid-cols-2 gap-2.5 border-t border-border pt-3 text-xs text-foreground sm:flex sm:flex-wrap sm:items-center sm:gap-x-6">
          <span>
            Level Indicator:{" "}
            <strong className="text-primary">
              {latestPlacement?.overallBand ?? "Foundation Open"}
            </strong>
          </span>
          <span>
            Lessons:{" "}
            <strong className="tabular-nums">
              {englishState.completedLessons.length}/{CURRICULUM_LESSONS.length}
            </strong>
          </span>
          <span>
            XP: <strong className="text-primary tabular-nums">{englishState.englishXp}</strong>
          </span>
          <span className="inline-flex items-center gap-1">
            <Flame className="size-3.5 text-primary" />
            Streak: <strong className="tabular-nums">{englishState.streakDays}d</strong>
          </span>
        </div>

        {/* Primary World Workspace Tabs */}
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-surface-2/60 p-1.5">
          {(
            [
              { id: "map", label: "Adventure Map (10 Regions)", icon: MapIcon },
              { id: "curriculum", label: "Curriculum & Lessons", icon: BookOpen },
              { id: "academies", label: "Skill Academies (7)", icon: Layers },
              { id: "placement", label: "Placement & Exams", icon: ClipboardCheck },
              { id: "dashboard", label: "Dashboard & Certificates", icon: Trophy },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <Button
                key={item.id}
                type="button"
                size="sm"
                variant={active ? "glow" : "ghost"}
                onClick={() => setTab(item.id)}
                className="min-h-[44px] gap-1.5 whitespace-nowrap shrink-0 text-xs"
              >
                <Icon className="size-3.5" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Active Sub-Workspace */}
      {tab === "map" && (
        <AdventureMapView
          englishState={englishState}
          onLaunchLesson={(lessonId) => {
            setSelectedLessonId(lessonId);
            setTab("curriculum");
          }}
          onOpenAcademy={(academy) => {
            setActiveAcademy(academy);
            setTab("academies");
          }}
        />
      )}

      {tab === "curriculum" && (
        <CurriculumLessonPlayer
          englishState={englishState}
          initialLessonId={selectedLessonId}
          onCompleteLesson={handleCompleteLesson}
          onRecordMistake={handleRecordMistake}
          onOpenAcademy={(academy) => {
            setActiveAcademy(academy);
            setTab("academies");
          }}
        />
      )}

      {tab === "academies" && (
        <SkillAcademiesPanel
          activeAcademy={activeAcademy}
          onSelectAcademy={setActiveAcademy}
          englishState={englishState}
          initialWritingTaskId={selectedWritingTaskId}
          onSaveNotebookWord={handleSaveNotebookWord}
          onPushFlashcardToStudy={handlePushFlashcardToStudy}
          onSubmitListeningScore={handleSubmitListeningScore}
          onSubmitReadingScore={handleSubmitReadingScore}
          onSubmitGrammarScore={handleSubmitGrammarScore}
          onCompleteSpeakingScenario={handleCompleteSpeakingScenario}
          onCompletePronunciationModule={handleCompletePronunciationModule}
          onPracticeVocabWord={handlePracticeVocabWord}
          onSaveWritingSubmission={handleSaveWritingSubmission}
          onRecordMistake={handleRecordMistake}
          {...(onNavigateStudyTab
            ? { onOpenUnit3FullArena: () => onNavigateStudyTab("unit3_vocab") }
            : {})}
        />
      )}

      {tab === "placement" && (
        <PlacementAndAssessmentsView
          englishState={englishState}
          onSubmitPlacement={handleSubmitPlacement}
          onSkipPlacement={handleSkipPlacement}
          onSubmitLevelExam={handleSubmitLevelExam}
        />
      )}

      {tab === "dashboard" && (
        <EnglishDashboardView
          englishState={englishState}
          onNavigateRecommendation={handleNavigateRecommendation}
          onAddRecommendationToTasks={handleAddRecommendationToTasks}
          onClaimDailyMission={handleClaimDailyMission}
          onMarkMistakeReviewed={handleMarkMistakeReviewed}
          onOpenExams={() => setTab("placement")}
        />
      )}
    </div>
  );
}
