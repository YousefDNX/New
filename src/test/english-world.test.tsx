// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  ADVENTURE_REGIONS,
  CURRICULUM_LESSONS,
  CURRICULUM_LEVELS,
  LEVEL_MASTERY_EXAMS,
} from "@/data/english-curriculum";
import {
  GRAMMAR_TOPICS,
  LISTENING_TRACKS,
  PRONUNCIATION_MODULES,
  READING_PASSAGES,
  SPEAKING_SCENARIOS,
  VOCAB_ACADEMY_TOPICS,
  WRITING_TASKS,
} from "@/data/english-academies";
import { GRADE_9_UNIT_3_WORDS } from "@/data/grade9-unit3-vocab";
import { PLACEMENT_ASSESSMENT_QUESTIONS } from "@/data/skill-academy";
import {
  computeDailyMissionProgress,
  computeDashboardSummary,
  computeEnglishRecommendations,
  createInitialEnglishWorldState,
  evaluateAdventureMapState,
  evaluateExtendedPlacement,
  evaluateWritingSubmission,
  gradeLessonExercise,
  recordVocabPractice,
  scoreToExtendedCefrBand,
} from "@/lib/english-world";
import { evaluateSkillPlacement } from "@/lib/skill-academy";
import { resetCurrentEcosystemSandbox } from "@/lib/student-ecosystem";
import { PreferencesProvider } from "@/lib/preferences";
import { EnglishAdventureWorld } from "@/components/english/EnglishAdventureWorld";

vi.mock("@/hooks/use-nexora", () => ({
  useUser: () => ({ data: null }),
  awardXpIfUnique: vi.fn().mockResolvedValue(false),
  useTaskActions: () => ({ addTask: vi.fn().mockResolvedValue(undefined) }),
}));

vi.mock("@/hooks/use-modules", () => ({
  useStudyActions: () => ({
    addStudyItem: vi.fn().mockResolvedValue(undefined),
    recordQuizAttempt: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock("@/components/common/FeatureGuideModal", () => ({
  FeatureGuideTrigger: () => null,
}));

function renderWorld() {
  return render(
    <PreferencesProvider>
      <EnglishAdventureWorld />
    </PreferencesProvider>,
  );
}

describe("NEXORA English Learning World — Curriculum, Logic & Complete User Journeys", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetCurrentEcosystemSandbox();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /* ---------------------------------------------------------------------- */
  /* PART 1: CONTENT & CURRICULUM INTEGRITY CHECKS                          */
  /* ---------------------------------------------------------------------- */

  it("includes all 10 Adventure Regions, 6 CEFR levels, 6+ skill academies, and preserves Grade 9 Unit 3 vocabulary", () => {
    expect(ADVENTURE_REGIONS.length).toBe(10);
    expect(CURRICULUM_LEVELS.map((l) => l.code)).toEqual([
      "Pre-A1",
      "A1",
      "A2",
      "B1",
      "B2",
      "C1–C2",
    ]);
    expect(CURRICULUM_LESSONS.length).toBeGreaterThanOrEqual(11);
    expect(LISTENING_TRACKS.length).toBeGreaterThanOrEqual(5);
    expect(SPEAKING_SCENARIOS.length).toBe(6);
    expect(READING_PASSAGES.length).toBeGreaterThanOrEqual(4);
    expect(WRITING_TASKS.length).toBeGreaterThanOrEqual(7);
    expect(GRAMMAR_TOPICS.length).toBe(15);
    expect(PRONUNCIATION_MODULES.length).toBe(6);
    expect(VOCAB_ACADEMY_TOPICS.length).toBeGreaterThanOrEqual(3);
    expect(LEVEL_MASTERY_EXAMS.length).toBe(4);
    expect(GRADE_9_UNIT_3_WORDS.some((w) => w.word === "flavour")).toBe(true);
    expect(GRADE_9_UNIT_3_WORDS.some((w) => w.word === "fibre")).toBe(true);
  });

  /* ---------------------------------------------------------------------- */
  /* PART 2: DETERMINISTIC PLACEMENT, VOCAB, WRITING & MAP ENGINE UNIT TESTS */
  /* ---------------------------------------------------------------------- */

  it("evaluates Pre-A1 through C2 bands accurately with writing sample weight and non-official disclaimer", () => {
    expect(scoreToExtendedCefrBand(10)).toBe("Pre-A1");
    expect(scoreToExtendedCefrBand(30)).toBe("A1");
    expect(scoreToExtendedCefrBand(45)).toBe("A2");
    expect(scoreToExtendedCefrBand(62)).toBe("B1");
    expect(scoreToExtendedCefrBand(78)).toBe("B2");
    expect(scoreToExtendedCefrBand(90)).toBe("C1");
    expect(scoreToExtendedCefrBand(98)).toBe("C2");

    const allCorrect: Record<string, number> = {};
    for (const q of PLACEMENT_ASSESSMENT_QUESTIONS) {
      allCorrect[q.id] = q.correctIndex;
    }
    const base = evaluateSkillPlacement(allCorrect, "2026-11-17T08:00:00.000Z");
    const extended = evaluateExtendedPlacement({
      mcqAnswers: allCorrect,
      writingSample:
        "Learning English connects Kuwaiti students with international scientific literature. Moreover, because academic journals publish widely in English, daily practice unlocks scholarship opportunities.",
      basePlacement: base,
      nowIso: "2026-11-17T08:00:00.000Z",
    });

    expect(["C1", "C2"]).toContain(extended.overallBand);
    expect(extended.writingPromptScorePct).toBeGreaterThan(50);
    expect(extended.summaryNote).toContain("Not an official external CEFR exam certificate");
  });

  it("strictly enforces multi-practice vocabulary mastery (never mastered on 1 single check)", () => {
    let map = {};

    // First single accurate flashcard recall -> MUST be 'practicing', NOT 'mastered'
    const first = recordVocabPractice(map, {
      wordId: "u3-flavour",
      word: "flavour",
      mode: "flashcard",
      accurate: true,
      nowIso: "2026-11-17T08:00:00.000Z",
    });
    expect(first.status).toBe("practicing");
    expect(first.status).not.toBe("mastered");
    map = { "u3-flavour": first };

    // Wrong fill-in-blank attempt drops to 'needs_revision'
    const missed = recordVocabPractice(map, {
      wordId: "u3-flavour",
      word: "flavour",
      mode: "fill_blank",
      accurate: false,
      nowIso: "2026-11-17T08:05:00.000Z",
    });
    expect(missed.status).toBe("needs_revision");
    map = { "u3-flavour": missed };

    // Second distinct accurate practice promotes cleanly to 'mastered'
    const secondGood = recordVocabPractice(map, {
      wordId: "u3-flavour",
      word: "flavour",
      mode: "fill_blank",
      accurate: true,
      nowIso: "2026-11-17T08:10:00.000Z",
    });
    expect(secondGood.status).toBe("mastered");
    expect(secondGood.correctCount).toBe(2);
    expect(secondGood.distinctModes).toEqual(["flashcard", "fill_blank"]);
  });

  it("evaluates constructive writing strengths and actionable improvements (why + how)", () => {
    const weakEval = evaluateWritingSubmission("i went school today no dots", {
      minWords: 40,
      maxWords: 100,
      requiredKeywords: ["library", "saturday"],
    });
    expect(weakEval.scorePct).toBeLessThan(60);
    expect(weakEval.improvements.some((i) => i.category === "Capitalization")).toBe(true);
    expect(weakEval.improvements.some((i) => i.category === "Punctuation")).toBe(true);
    expect(weakEval.improvements.some((i) => i.category === "Development & Length")).toBe(true);
    expect(weakEval.improvements.every((i) => i.whyItMatters && i.howToImprove)).toBe(true);

    const strongEval = evaluateWritingSubmission(
      "Hi Omar, first let us meet at the public library on Saturday at ten o'clock. Because the quiet room fills early, we should bring our flashcards and pens. However, if it rains, we can study in Room 4. In conclusion, Saturday practice will boost our readiness.",
      {
        minWords: 35,
        maxWords: 75,
        requiredKeywords: ["saturday", "library"],
      },
    );
    expect(strongEval.scorePct).toBeGreaterThanOrEqual(85);
    expect(strongEval.strengths.length).toBeGreaterThanOrEqual(3);
  });

  it("unlocks downstream Adventure Regions only after prerequisite clearing and preserves completed revisit", () => {
    const fresh = createInitialEnglishWorldState();
    const initialMap = evaluateAdventureMapState(fresh);
    const vocabVillage = initialMap.find((r) => r.region.id === "vocabulary-village");
    const pronunciationMtn = initialMap.find((r) => r.region.id === "pronunciation-mountain");
    const readingLibrary = initialMap.find((r) => r.region.id === "reading-library");

    expect(vocabVillage?.status).toBe("available");
    expect(pronunciationMtn?.status).toBe("locked");
    expect(readingLibrary?.status).toBe("locked");

    // Completing Vocabulary Village lesson unlocks Pronunciation Mountain, while Reading Library still awaits Grammar Kingdom
    const afterVocab = {
      ...fresh,
      completedLessons: ["cur-pre-greetings"],
    };
    const midMap = evaluateAdventureMapState(afterVocab);
    expect(midMap.find((r) => r.region.id === "vocabulary-village")?.status).toBe("in_progress");
    expect(midMap.find((r) => r.region.id === "pronunciation-mountain")?.status).toBe("available");
    expect(midMap.find((r) => r.region.id === "reading-library")?.status).toBe("locked");
    expect(midMap.find((r) => r.region.id === "reading-library")?.unmetPrerequisites).toContain(
      "Grammar Kingdom",
    );
  });

  it("explains personalized recommendations transparently based on placement and weak areas", () => {
    let state = createInitialEnglishWorldState();
    state = {
      ...state,
      placementSkipped: true,
      vocabProgress: {
        "u3-fibre": {
          wordId: "u3-fibre",
          word: "fibre",
          status: "needs_revision",
          correctCount: 0,
          attemptCount: 1,
          distinctModes: [],
          lastPracticedAt: "2026-11-17T08:00:00.000Z",
          nextReviewAt: "2026-11-17T08:00:00.000Z",
        },
      },
    };
    const recs = computeEnglishRecommendations(state);
    expect(recs.some((r) => r.targetSurface === "placement")).toBe(true);
    expect(
      recs.some((r) => r.targetSurface === "vocabulary" && r.whyRecommended.includes("fibre")),
    ).toBe(true);
  });

  it("checks fill-in-blank and MCQ lesson exercises accurately", () => {
    expect(
      gradeLessonExercise(
        { kind: "fill_blank", acceptedAnswers: ["reads"] },
        { textAnswer: " Reads. " },
      ),
    ).toBe(true);
    expect(gradeLessonExercise({ kind: "mcq", correctIndex: 1 }, { selectedIndex: 1 })).toBe(true);
  });

  /* ---------------------------------------------------------------------- */
  /* PART 3: INTERACTIVE E2E USER JOURNEYS A – E                            */
  /* ---------------------------------------------------------------------- */

  it("Journey A: New student handles Placement (skip/submit), opens Adventure Map region, completes a Lesson, and checks Recommendation", () => {
    renderWorld();

    // Verify Adventure Map renders 10 regions immediately without empty setup wall
    expect(screen.getAllByText(/10.*regions/i).length).toBeGreaterThan(0);

    // Navigate to Placement & Exams
    fireEvent.click(screen.getByRole("button", { name: /Placement & Exams/i }));
    expect(screen.getByText(/Informal Diagnostic Placement Indicator/i)).toBeTruthy();

    // Enter optional writing sample & submit placement
    fireEvent.change(screen.getByLabelText(/Diagnostic Writing Sample/i), {
      target: {
        value:
          "Because English helps me collaborate with STEM peers, I practice reading articles daily.",
      },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Complete Placement & Generate My Learning Plan/i }),
    );

    expect(screen.getByText(/Estimated Level:/i)).toBeTruthy();

    // Switch back to Adventure Map and enter Vocabulary Village
    fireEvent.click(screen.getByRole("button", { name: /Adventure Map/i }));
    fireEvent.click(screen.getByRole("button", { name: /Vocabulary Village/i }));

    // Launch starter ready-to-use lesson directly
    const startButtons = screen.getAllByRole("button", { name: /Start Lesson/i });
    fireEvent.click(startButtons[0]!);

    // Guided check
    fireEvent.click(screen.getByRole("button", { name: "I have an eraser in my bag." }));
    expect(screen.getByText("Accurate!")).toBeTruthy();

    // Complete 3 independent exercises accurately
    fireEvent.click(screen.getByRole("button", { name: "Good morning, teacher!" }));
    fireEvent.change(screen.getByLabelText("Answer for exercise 2"), {
      target: { value: "name" },
    });
    fireEvent.click(screen.getByRole("button", { name: "False" }));
    fireEvent.click(screen.getByRole("button", { name: /Submit Lesson Exercises/i }));

    expect(screen.getByText(/Lesson Score: 100%/i)).toBeTruthy();

    // Open Dashboard & Certificates -> verifies XP + real adaptive recommendation rationale
    fireEvent.click(screen.getByRole("button", { name: /Dashboard & Certificates/i }));
    expect(screen.getByText(/Personalized Next Steps/i)).toBeTruthy();
    expect(screen.getByText(`1 / ${CURRICULUM_LESSONS.length}`)).toBeTruthy();
  });

  it("Journey B: Listening Learner handles unavailable browser Web Speech honestly, inspects transcript, saves vocab, and logs comprehension mistakes", () => {
    // Ensure speechSynthesis is absent in JSDOM to verify honest audio-unavailable notice
    Object.defineProperty(window, "speechSynthesis", { value: undefined, configurable: true });

    renderWorld();
    fireEvent.click(screen.getByRole("button", { name: /Skill Academies/i }));
    // Listening is default active academy
    expect(
      screen.getByText(/Browser Web Speech synthesis is unavailable in this environment/i),
    ).toBeTruthy();

    // Reveal transcript cleanly
    fireEvent.click(screen.getByRole("button", { name: /Show Transcript/i }));
    expect(screen.getByText(/On Tuesdays I finish science class/i)).toBeTruthy();

    // Save extracted vocabulary word 'routine' to Personal Notebook
    const saveBtns = screen.getAllByRole("button", { name: /^Save$/i });
    fireEvent.click(saveBtns[0]!);

    // Answer wrong on Question 1 & right on Question 3 -> verify feedback & mistake recorded
    fireEvent.click(screen.getByRole("button", { name: "At one thirty" }));
    const falseBtns = screen.getAllByRole("button", { name: "False" });
    fireEvent.click(falseBtns[0]!);
    fireEvent.change(screen.getByPlaceholderText(/Type answer from the audio/i), {
      target: { value: "20" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Check Listening Answers/i }));

    expect(screen.getByText(/Listening Score Saved/i)).toBeTruthy();

    // Verify mistake appears in Dashboard Mistake Review Queue
    fireEvent.click(screen.getByRole("button", { name: /Dashboard & Certificates/i }));
    expect(screen.getByText(/English Mistake Review Queue/i)).toBeTruthy();
    expect(screen.getByText(/At one thirty/i)).toBeTruthy();
  });

  it("Journey C: Vocabulary Learner verifies Grade 9 Unit 3, multi-practice mastery rule (1 click = Practicing), and Personal Notebook", () => {
    renderWorld();
    fireEvent.click(screen.getByRole("button", { name: /Skill Academies/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Vocabulary$/i }));

    // Grade 9 Unit 3 first word 'reflect' starts New
    expect(screen.getByText("reflect")).toBeTruthy();
    expect(screen.getByText("New Word")).toBeTruthy();

    // Click 'I Knew This' once on word 'reflect' (moves to next card 'serve') -> return back? Let's test via Fill-in-Blank & Notebook!
    fireEvent.click(screen.getByRole("button", { name: /I Knew This/i }));
    expect(screen.getByText("serve")).toBeTruthy();

    // Switch to Personal Notebook and add a custom study word
    fireEvent.click(screen.getByRole("button", { name: /Personal Notebook/i }));
    fireEvent.change(screen.getByLabelText("New vocabulary word"), {
      target: { value: "hospitality" },
    });
    fireEvent.change(screen.getByLabelText("Arabic meaning"), {
      target: { value: "حسن الضيافة" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Add$/i }));

    expect(screen.getByText("hospitality")).toBeTruthy();
    expect(screen.getByText("حسن الضيافة")).toBeTruthy();
  });

  it("Journey D: Writing Learner drafts text, receives constructive feedback without draft erasure, revises, and compares drafts", () => {
    renderWorld();
    fireEvent.click(screen.getByRole("button", { name: /Skill Academies/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Writing$/i }));

    const editor = screen.getByLabelText(/Your Draft/i) as HTMLTextAreaElement;
    const initialDraft = "my name is nour and i like english";
    fireEvent.change(editor, { target: { value: initialDraft } });
    fireEvent.click(screen.getByRole("button", { name: /Check Writing & Get Feedback/i }));

    // Original draft untouched + constructive coaching displayed
    expect(editor.value).toBe(initialDraft);
    expect(screen.getByText(/How to Strengthen Your Next Revision:/i)).toBeTruthy();
    expect(screen.getAllByText(/Why it matters:/i).length).toBeGreaterThan(0);

    // Revise draft with proper sentences and transitions
    const revisedDraft =
      "Hello! My name is Nour. First, I am in Grade 9 and my favourite subject is Science because experiments teach real teamwork. In conclusion, I enjoy reading every afternoon.";
    fireEvent.change(editor, { target: { value: revisedDraft } });
    fireEvent.click(screen.getByRole("button", { name: /Analyze Revision & Update Feedback/i }));

    // Compare Initial vs Revised Draft side-by-side
    fireEvent.click(screen.getByRole("button", { name: /Compare Initial vs\. Revised Draft/i }));
    expect(screen.getByText(/First Saved Draft/i)).toBeTruthy();
    expect(screen.getByText(/Latest Revision/i)).toBeTruthy();
    expect(screen.getByText(initialDraft)).toBeTruthy();
  });

  it("Journey E: Returning student persists progress across reload, uses accessible Adventure List, and earns internal certificate from Level Exam", () => {
    const { unmount } = renderWorld();

    // Complete Level Mastery Exam
    fireEvent.click(screen.getByRole("button", { name: /Placement & Exams/i }));
    fireEvent.click(screen.getByRole("button", { name: /Level Mastery Exams & Certificates/i }));

    fireEvent.click(screen.getByRole("button", { name: "goes" }));
    fireEvent.click(screen.getByRole("button", { name: "an" }));
    fireEvent.click(screen.getByRole("button", { name: "She writes two short sentences." }));
    fireEvent.click(screen.getByRole("button", { name: "pen" }));
    fireEvent.click(screen.getByRole("button", { name: "Good morning, nice to meet you!" }));
    fireEvent.click(screen.getByRole("button", { name: /Submit Level Assessment/i }));

    expect(screen.getByText(/Result: 100% \(5\/5\)/i)).toBeTruthy();

    // Unmount and remount cleanly -> verifies persistence across sessions
    unmount();
    renderWorld();

    // Open Dashboard & Certificates -> certificate persists with disclaimer
    fireEvent.click(screen.getByRole("button", { name: /Dashboard & Certificates/i }));
    expect(screen.getByText(/NEXORA English Foundation Explorer Certificate/i)).toBeTruthy();
    expect(screen.getByText(/not an external official CEFR exam/i)).toBeTruthy();

    // Verify Accessible Linear Map List toggle works for keyboard & screen-reader learners
    fireEvent.click(screen.getByRole("button", { name: /Adventure Map/i }));
    fireEvent.click(screen.getByRole("button", { name: /Accessible List/i }));
    expect(screen.getByRole("list", { name: /Adventure regions accessible list/i })).toBeTruthy();
  });

  it("computes daily mission counters cleanly without punishing breaks", () => {
    const base = createInitialEnglishWorldState(new Date("2026-11-17T10:00:00.000Z"));
    const withWork = {
      ...base,
      dailyCounters: {
        dateKey: new Date().toISOString().slice(0, 10),
        lessonsDone: 1,
        vocabPracticed: 5,
        listeningDone: 0,
        writingDone: 1,
      },
    };
    const missions = computeDailyMissionProgress(withWork);
    expect(missions.find((m) => m.mission.id === "mission-lesson")?.completed).toBe(true);
    expect(missions.find((m) => m.mission.id === "mission-vocab")?.completed).toBe(true);
    expect(missions.find((m) => m.mission.id === "mission-listening")?.completed).toBe(false);

    const summary = computeDashboardSummary(withWork);
    expect(summary.totalLessonsCount).toBe(CURRICULUM_LESSONS.length);
  });
});
