import { describe, expect, it } from "vitest";
import {
  computeAcidBasePh,
  computeKinematicsPoint,
  computeOhmsCircuit,
  computePendulumPeriod,
  computePhotosynthesisRate,
  computeSolubilityGrams,
} from "@/data/science-world";
import {
  computeFunctionSummary,
  computeGeometryMetrics,
  computeLeverAdvantage,
  computeStatistics,
  evaluateFunctionY,
  evaluateTrussBridge,
} from "@/data/math-engineering";
import {
  evaluatePasswordStrength,
  runRobotCommands,
  runSafeEducationalCode,
} from "@/data/coding-curriculum";
import {
  computeAchievementEvidence,
  createInitialStudentEcosystemState,
} from "@/lib/student-ecosystem";
import { getThemePresetById, THEME_CATALOG } from "@/lib/theme-catalog";
import { computeSuggestedNoteLinks } from "@/components/study/KnowledgeToolsPanel";
import { searchStudentLibrary } from "@/lib/growth";
import type { StudyItemRow } from "@/lib/firestore-data";

describe("Prompt 2: Theme Catalog & Persistence Presets", () => {
  it("contains both approved presets including BTC Classic Studio and Nordic Frost", () => {
    expect(THEME_CATALOG).toHaveLength(2);
    const classic = getThemePresetById("btc_classic");
    expect(classic).toBeDefined();
    expect(classic?.nameEn).toBe("BTC Classic Studio");

    const nordic = getThemePresetById("nordic_frost");
    expect(nordic).toBeDefined();
    expect(nordic?.nameEn).toBe("Nordic Frost");
  });
});

describe("Prompt 2: Science Discovery Studio Calculations (#1-6)", () => {
  it("computes acid-base titration pH curve correctly", () => {
    const start = computeAcidBasePh(0);
    expect(start.stage).toBe("acidic");
    expect(start.ph).toBeLessThan(7);

    const equiv = computeAcidBasePh(25);
    expect(equiv.stage).toBe("equivalence");
    expect(equiv.ph).toBe(7.0);

    const basic = computeAcidBasePh(35);
    expect(basic.stage).toBe("basic");
    expect(basic.ph).toBeGreaterThan(7);
  });

  it("calculates photosynthesis bubble rate and solubility", () => {
    const rateClose = computePhotosynthesisRate(20, 0.12);
    const rateFar = computePhotosynthesisRate(80, 0.12);
    expect(rateClose).toBeGreaterThan(rateFar);

    const kno3Cold = computeSolubilityGrams("KNO3", 20);
    const kno3Hot = computeSolubilityGrams("KNO3", 80);
    expect(kno3Hot).toBeGreaterThan(kno3Cold);
  });

  it("calculates physics kinematics, pendulum period, and circuit laws", () => {
    const kin = computeKinematicsPoint(10, 2, 3);
    // v = 10 + 2*3 = 16, s = 10*3 + 0.5*2*9 = 39
    expect(kin.velocity).toBe(16);
    expect(kin.displacement).toBe(39);

    const T = computePendulumPeriod(1.0, 9.81);
    expect(T).toBeCloseTo(2.0, 1);

    const series = computeOhmsCircuit({ voltage: 12, r1: 4, r2: 8, mode: "series" });
    expect(series.equivalentR).toBe(12);
    expect(series.currentAmps).toBe(1);

    const parallel = computeOhmsCircuit({ voltage: 12, r1: 6, r2: 6, mode: "parallel" });
    expect(parallel.equivalentR).toBe(3);
    expect(parallel.currentAmps).toBe(4);
  });
});

describe("Prompt 2: Mathematics & Engineering Calculations (#7-12)", () => {
  it("evaluates functions and computes roots/vertices", () => {
    const yLin = evaluateFunctionY("linear", 4, 2, 3, 0);
    expect(yLin).toBe(11);

    const sumQuad = computeFunctionSummary("quadratic", 1, 0, -4);
    expect(sumQuad).toContain("Vertex (0.00, -4.00)");
    expect(sumQuad).toContain("roots");
  });

  it("calculates geometric dimensions", () => {
    const tri = computeGeometryMetrics("triangle", 3, 4);
    expect(tri.areaLabel).toBe("6.0 cm²");
    expect(tri.perimeterOrVolumeLabel).toContain("12.0 cm");
  });

  it("calculates statistical datasets", () => {
    const res = computeStatistics([10, 20, 20, 30, 40]);
    expect(res.mean).toBe(24);
    expect(res.median).toBe(20);
    expect(res.modes).toEqual([20]);
    expect(res.range).toBe(30);
  });

  it("evaluates truss bridge load and lever mechanical advantage", () => {
    const truss = evaluateTrussBridge({
      spanMeters: 10,
      trianglesCount: 6,
      material: "steel",
      appliedLoadKg: 200,
      budgetLimit: 1200,
    });
    expect(truss.passed).toBe(true);
    expect(truss.materialCost).toBeLessThanOrEqual(1200);

    const lever = computeLeverAdvantage(60, 20, 60);
    expect(lever.mechanicalAdvantage).toBe(3);
    expect(lever.requiredEffortKg).toBe(20);
  });
});

describe("Prompt 2: Safe Coding Sandbox Interpreter (#25-29)", () => {
  it("executes arithmetic, assignments, repeat loops, and conditions safely without eval", () => {
    const code = `
      let x = 5
      let sum = 0
      repeat 3 {
        let sum = sum + x
      }
      if (sum == 15) {
        print("Pass")
      }
    `;
    const res = runSafeEducationalCode(code);
    expect(res.error).toBeNull();
    expect(res.variables["sum"]).toBe(15);
    expect(res.outputs).toEqual(["Pass"]);
  });

  it("blocks dangerous browser identifiers and enforces loop guards", () => {
    const badCode = `let x = window.location`;
    const badRes = runSafeEducationalCode(badCode);
    expect(badRes.error).toContain("sandbox blocked");

    const infiniteLoop = `
      repeat 100 {
        repeat 100 {
          let a = 1
        }
      }
    `;
    const infRes = runSafeEducationalCode(infiniteLoop);
    expect(infRes.error).toContain("loop guard");
  });

  it("runs robot commands and detects proximity bounds", () => {
    const robot = runRobotCommands(["FWD", "FWD", "RIGHT", "FWD"]);
    expect(robot.path.length).toBeGreaterThan(1);
    expect(robot.hitWall).toBe(false);
  });

  it("evaluates password strength defensively", () => {
    const weak = evaluatePasswordStrength("abc");
    expect(weak.score).toBeLessThanOrEqual(1);

    const strong = evaluatePasswordStrength("Solar*Shield*2026!");
    expect(strong.score).toBeGreaterThanOrEqual(3);
  });
});

describe("Prompt 2: Knowledge Tools, Evidence, and Search (#41, #44)", () => {
  it("identifies suggested cross-links between notes sharing keywords", () => {
    const mockNotes: StudyItemRow[] = [
      {
        id: "n1",
        user_id: "u1",
        kind: "note",
        subject: "Biology",
        title: "Photosynthesis Mechanisms",
        content: "Explains chlorophyll light reactions and chloroplast structure.",
        deck: null,
        answer: null,
        mistake_reason: null,
        mistake_status: "open",
        review_count: 0,
        next_review_at: null,
        difficulty: "medium",
        created_at: "2026-11-16T12:00:00Z",
        updated_at: "2026-11-16T12:00:00Z",
      },
      {
        id: "n2",
        user_id: "u1",
        kind: "note",
        subject: "Biology",
        title: "Cellular Energy Production",
        content: "Compares mitochondrial respiration with chloroplast synthesis.",
        deck: null,
        answer: null,
        mistake_reason: null,
        mistake_status: "open",
        review_count: 0,
        next_review_at: null,
        difficulty: "medium",
        created_at: "2026-11-16T12:00:00Z",
        updated_at: "2026-11-16T12:00:00Z",
      },
    ];
    const links = computeSuggestedNoteLinks(mockNotes, []);
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]?.reason).toBeDefined();
  });

  it("computes achievement evidence milestones from ecosystem state", () => {
    const eco = createInitialStudentEcosystemState();
    eco.completedSimulations = ["sci_lab", "sci_body", "math_graph"];
    eco.codingExercisesSolved = ["code_1", "code_2"];
    eco.creativeProjects = [
      {
        id: "cr1",
        kind: "story",
        title: "Island of Trade",
        summary: "Historical fiction",
        updatedAt: "2026-11-16",
      },
    ];

    const ev = computeAchievementEvidence(eco);
    expect(ev.simulationsCompleted).toBe(3);
    expect(ev.codingSolved).toBe(2);
    expect(ev.creativeWorks).toBe(1);

    const labMilestone = ev.milestones.find((m) => m.id === "ev_lab_explorer");
    expect(labMilestone?.unlocked).toBe(true);

    const codeMilestone = ev.milestones.find((m) => m.id === "ev_code_builder");
    expect(codeMilestone?.unlocked).toBe(true);
  });

  it("indexes static STEM and prompt 2 modules in universal search", () => {
    const hits = searchStudentLibrary("titration", {});
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.title).toContain("Virtual Science Lab");
    expect(hits[0]?.to).toBe("/app/study");

    const codingHits = searchStudentLibrary("robotics", {});
    expect(codingHits.length).toBeGreaterThan(0);
    expect(codingHits[0]?.to).toBe("/app/level-up");
  });
});
