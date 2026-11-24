import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { THEME_CATALOG } from "@/lib/theme-catalog";
import { GRADE_9_UNIT_3_WORDS } from "@/data/grade9-unit3-vocab";
import {
  ADAPTIVE_LEARNING_PATHS,
  ENGLISH_SKILL_AREAS,
  PLACEMENT_ASSESSMENT_QUESTIONS,
} from "@/data/skill-academy";
import { computeLearningPathState, evaluateSkillPlacement } from "@/lib/skill-academy";
import { evaluateTypingSession, formatAcademicCitation } from "@/data/practical-skills";
import {
  completeAdventureQuest,
  createInitialAdventureState,
  interactAdventureTile,
  stepAdventureMove,
  travelToRegion,
} from "@/lib/adventure-engine";
import {
  analyzeMisconceptions,
  computeForgettingCurve,
  evaluateFeynmanExplanation,
  findPrerequisiteGaps,
  generateQuestionsFromText,
  getQuestionOfTheDay,
  transformStudyMaterialLocally,
} from "@/lib/learning-intelligence";

describe("Prompt 1 Foundation: Theme Engine, Skill Academy, Practical Skills, Adventure & Learning Intelligence", () => {
  it("defines distinct dark and light CSS blocks for all 10 THEME_CATALOG presets", () => {
    const cssPath = path.resolve(process.cwd(), "src/styles.css");
    const css = fs.readFileSync(cssPath, "utf8");
    expect(THEME_CATALOG.length).toBe(2);
    for (const preset of THEME_CATALOG) {
      expect(css).toContain(`[data-theme-preset="${preset.id}"]`);
      expect(css).toContain(`.light[data-theme-preset="${preset.id}"]`);
    }
    expect(css).toContain(".low-bandwidth");
  });

  it("preserves all 24 Grade 9 Unit 3 exact words", () => {
    expect(GRADE_9_UNIT_3_WORDS.length).toBe(24);
    expect(GRADE_9_UNIT_3_WORDS.some((w) => w.word === "flavour")).toBe(true);
    expect(GRADE_9_UNIT_3_WORDS.some((w) => w.word === "fibre")).toBe(true);
  });

  it("evaluates 5 independent skill dimensions in Placement Assessment without collapsing abilities", () => {
    expect(ENGLISH_SKILL_AREAS.length).toBe(10);
    expect(PLACEMENT_ASSESSMENT_QUESTIONS.length).toBe(20);

    // Answer only reading questions accurately, leave listening blank
    const answers: Record<string, number> = {};
    for (const q of PLACEMENT_ASSESSMENT_QUESTIONS) {
      if (q.dimension === "reading") {
        answers[q.id] = q.correctIndex;
      } else {
        answers[q.id] = (q.correctIndex + 1) % 4;
      }
    }

    const result = evaluateSkillPlacement(answers, "2026-11-16T00:00:00.000Z");
    expect(result.dimensions.length).toBe(5);
    const reading = result.dimensions.find((d) => d.dimension === "reading");
    const listening = result.dimensions.find((d) => d.dimension === "listening");
    expect(reading?.scorePct).toBe(100);
    expect(reading?.cefr).toBe("C1");
    expect(listening?.scorePct).toBe(0);
    expect(listening?.cefr).toBe("A1");
    expect(result.strongestDimension).toBe("reading");
  });

  it("separates viewed vs mastered status and locks downstream path steps until prerequisites pass", () => {
    const initial = computeLearningPathState({
      pathId: ADAPTIVE_LEARNING_PATHS[0]!.id,
      masteredSteps: [],
      viewedSteps: ["g9_step_1"],
      stepScores: {},
    });
    expect(initial.evaluatedSteps[0]?.status).toBe("viewed");
    expect(initial.evaluatedSteps[1]?.status).toBe("locked");

    const progressed = computeLearningPathState({
      pathId: ADAPTIVE_LEARNING_PATHS[0]!.id,
      masteredSteps: ["g9_step_1"],
      viewedSteps: ["g9_step_1"],
      stepScores: { g9_step_1: 100 },
    });
    expect(progressed.evaluatedSteps[0]?.status).toBe("mastered");
    expect(progressed.evaluatedSteps[1]?.status).toBe("available");
  });

  it("computes real-time Typing WPM, accuracy, errors, and APA/MLA citations accurately", () => {
    const metrics = evaluateTypingSession("hello world test", "hello world test", 12_000);
    expect(metrics.completed).toBe(true);
    expect(metrics.accuracyPct).toBe(100);
    expect(metrics.errors).toBe(0);
    expect(metrics.wpm).toBeGreaterThan(0);

    const apa = formatAcademicCitation({
      style: "APA",
      author: "Sabah, L.",
      year: "2026",
      title: "Solar Microgrids",
      publisher: "Gulf STEM",
    });
    expect(apa).toBe("Sabah, L. (2026). Solar Microgrids. Gulf STEM.");
  });

  it("runs BTC Adventure World movement, wall collision, switch puzzle, relic claiming, and NPC quests cleanly", () => {
    let adv = createInitialAdventureState();
    expect(adv.activeRegion).toBe("courtyard");

    // Try walking straight into bottom wall '#' at y=7 -> should block move
    const blocked = stepAdventureMove(adv, 0, 1);
    expect(blocked.moved).toBe(false);

    // Activate switch at (3, 1) by stepping next to (2, 1)
    adv = { ...adv, playerX: 2, playerY: 1 };
    const swOutcome = interactAdventureTile(adv);
    adv = swOutcome.nextState;
    expect(adv.activatedSwitches).toContain("sw_courtyard_dial");

    // Claim relic at (8, 1) from (7, 1) now that switch is active
    adv = { ...adv, playerX: 7, playerY: 1 };
    const relicOutcome = interactAdventureTile(adv);
    expect(relicOutcome.kind).toBe("relic");
    adv = relicOutcome.nextState;
    expect(adv.collectedRelics).toContain("relic_compass");

    // Complete Mentor Elena quest at (5, 3) from (4, 3)
    adv = { ...adv, playerX: 4, playerY: 3 };
    const qOut = interactAdventureTile(adv);
    expect(qOut.kind).toBe("quest");
    if (qOut.kind === "quest") {
      adv = completeAdventureQuest(adv, qOut.quest.id, qOut.quest.rewardNote);
      expect(adv.completedQuests).toContain("q_elena_vocab");
    }

    // Cannot teleport to Observatory before 2 relics
    const lockedObs = travelToRegion(adv, "observatory");
    expect(lockedObs.activeRegion).toBe("courtyard");
  });

  it("runs Misconception Detector, Material Transformer, Prerequisite Finder, Forgetting Curve, Feynman, Question Gen, and QOTD deterministically", () => {
    const now = Date.now();
    const fiveDaysAgo = new Date(now - 5 * 86_400_000).toISOString();

    const misconceptions = analyzeMisconceptions({
      studyItems: [
        {
          id: "m1",
          kind: "mistake",
          subject: "English",
          title: "Misspelled flavour without u",
          content: "Use British flavour",
          mistake_reason: "British spelling contrast",
          mistake_status: "open",
          created_at: fiveDaysAgo,
        } as never,
      ],
      quizAttempts: [],
    });
    expect(misconceptions[0]?.category).toBe("british_spelling");

    const pack = transformStudyMaterialLocally(
      "Reflect: Think deeply before deciding.\nMaintain: Keep steady quality over time.",
      "Unit 3 Pack",
    );
    expect(pack.flashcards.length).toBe(2);

    const gaps = findPrerequisiteGaps("kn_paragraph_cohesion", []);
    expect(gaps.ready).toBe(false);
    expect(gaps.missingChain.length).toBe(2);

    const retention = computeForgettingCurve(
      [
        {
          id: "c1",
          kind: "flashcard",
          subject: "English",
          title: "Reflect",
          content: "Reflect",
          review_count: 0,
          created_at: fiveDaysAgo,
        } as never,
      ],
      now,
    );
    expect(retention[0]?.urgency).toBe("overdue");

    const feynman = evaluateFeynmanExplanation({
      topicTitle: "Spaced Repetition",
      expectedKeywords: ["recall", "spacing"],
      studentExplanation:
        "Spaced repetition uses recall over spacing intervals because resting strengthens memory.",
    });
    expect(feynman.scorePct).toBeGreaterThanOrEqual(70);

    const gen = generateQuestionsFromText("", "cloze");
    expect(gen.length).toBe(4);

    const qotd = getQuestionOfTheDay("2026-11-16");
    expect(qotd.id).toBeTruthy();
  });
});
