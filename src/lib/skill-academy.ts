import {
  ADAPTIVE_LEARNING_PATHS,
  PLACEMENT_ASSESSMENT_QUESTIONS,
  PLACEMENT_DIMENSION_META,
  type AdaptiveLearningPath,
  type CefrBand,
  type PlacementDimensionId,
} from "@/data/skill-academy";

export interface PlacementDimensionScore {
  dimension: PlacementDimensionId;
  label: string;
  labelAr: string;
  correct: number;
  total: number;
  scorePct: number;
  cefr: CefrBand;
  rationale: string;
}

export interface SkillPlacementResult {
  completedAt: string;
  dimensions: PlacementDimensionScore[];
  strongestDimension: PlacementDimensionId;
  priorityDimension: PlacementDimensionId;
  recommendedPathId: string;
  overallNote: string;
}

export function scoreToCefrBand(scorePct: number): CefrBand {
  if (scorePct >= 90) return "C1";
  if (scorePct >= 75) return "B2";
  if (scorePct >= 55) return "B1";
  if (scorePct >= 35) return "A2";
  return "A1";
}

export function evaluateSkillPlacement(
  answers: Record<string, number>,
  nowIso = new Date().toISOString(),
): SkillPlacementResult {
  const dimensionOrder: PlacementDimensionId[] = [
    "reading",
    "listening",
    "grammar_vocab",
    "writing",
    "communication",
  ];

  const dimensions: PlacementDimensionScore[] = dimensionOrder.map((dim) => {
    const qs = PLACEMENT_ASSESSMENT_QUESTIONS.filter((q) => q.dimension === dim);
    const total = qs.length;
    const correct = qs.reduce((acc, q) => (answers[q.id] === q.correctIndex ? acc + 1 : acc), 0);
    const scorePct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const cefr = scoreToCefrBand(scorePct);
    const meta = PLACEMENT_DIMENSION_META[dim];

    const rationale =
      scorePct >= 75
        ? `Strong independent accuracy (${correct}/${total}). Ready for advanced synthesis in ${meta.linkedAreas.join(" & ")}.`
        : scorePct >= 50
          ? `Solid developing foundation (${correct}/${total}). Target weekly drills in ${meta.linkedAreas.join(" & ")}.`
          : `Priority growth area (${correct}/${total}). Start with guided foundation lessons in ${meta.linkedAreas.join(" & ")}.`;

    return {
      dimension: dim,
      label: meta.label,
      labelAr: meta.labelAr,
      correct,
      total,
      scorePct,
      cefr,
      rationale,
    };
  });

  const sortedHigh = [...dimensions].sort((a, b) => b.scorePct - a.scorePct);
  const sortedLow = [...dimensions].sort((a, b) => a.scorePct - b.scorePct);

  const strongest = sortedHigh[0]?.dimension ?? "reading";
  const priority = sortedLow[0]?.dimension ?? "grammar_vocab";

  const recommendedPathId =
    (sortedLow[0]?.scorePct ?? 100) < 75 ? "path_g9_english" : "path_stem_research";

  return {
    completedAt: nowIso,
    dimensions,
    strongestDimension: strongest,
    priorityDimension: priority,
    recommendedPathId,
    overallNote: `Evaluated ${dimensions.length} independent skill dimensions without collapsing your abilities into one single score.`,
  };
}

export type PathStepStatus = "locked" | "available" | "viewed" | "mastered";

export interface EvaluatedPathStep {
  step: AdaptiveLearningPath["steps"][number];
  status: PathStepStatus;
  bestScore: number | null;
  unmetPrerequisiteTitles: string[];
  whyRecommended: string;
}

export function computeLearningPathState(input: {
  pathId: string;
  masteredSteps: string[];
  viewedSteps: string[];
  stepScores: Record<string, number>;
  placement?: SkillPlacementResult | null;
}): {
  path: AdaptiveLearningPath;
  evaluatedSteps: EvaluatedPathStep[];
  masteredCount: number;
  completionPct: number;
  nextRecommendedStepId: string | null;
} {
  const path =
    ADAPTIVE_LEARNING_PATHS.find((p) => p.id === input.pathId) ?? ADAPTIVE_LEARNING_PATHS[0]!;

  const masteredSet = new Set(input.masteredSteps);
  const viewedSet = new Set(input.viewedSteps);
  const stepById = new Map(path.steps.map((s) => [s.id, s]));

  let nextRecommendedStepId: string | null = null;

  const evaluatedSteps: EvaluatedPathStep[] = path.steps.map((step) => {
    const unmetPrerequisiteTitles = step.prerequisiteIds
      .filter((preId) => !masteredSet.has(preId))
      .map((preId) => stepById.get(preId)?.title ?? preId);

    const bestScore =
      typeof input.stepScores[step.id] === "number" ? (input.stepScores[step.id] ?? null) : null;

    let status: PathStepStatus;
    if (masteredSet.has(step.id)) {
      status = "mastered";
    } else if (unmetPrerequisiteTitles.length > 0) {
      status = "locked";
    } else if (viewedSet.has(step.id)) {
      status = "viewed";
    } else {
      status = "available";
    }

    if (nextRecommendedStepId === null && (status === "available" || status === "viewed")) {
      nextRecommendedStepId = step.id;
    }

    let whyRecommended = step.summary;
    if (status === "mastered") {
      whyRecommended = `Mastered (${bestScore ?? step.minMasteryScore}% >= ${step.minMasteryScore}% benchmark).`;
    } else if (status === "locked") {
      whyRecommended = `Locked until prerequisite mastered: ${unmetPrerequisiteTitles.join(", ")}.`;
    } else if (step.linkedSkillArea && input.placement) {
      const priorityMeta = PLACEMENT_DIMENSION_META[input.placement.priorityDimension];
      if (priorityMeta.linkedAreas.includes(step.linkedSkillArea)) {
        whyRecommended = `Prioritized from your Placement Assessment in ${priorityMeta.label}. Pass the ${step.minMasteryScore}% check to master.`;
      } else {
        whyRecommended = `Prerequisites satisfied. Score ${step.minMasteryScore}%+ on the mastery check to unlock the next stage.`;
      }
    } else {
      whyRecommended = `Ready now. Pass the ${step.minMasteryScore}% mastery check (not just viewing) to mark mastered.`;
    }

    return {
      step,
      status,
      bestScore,
      unmetPrerequisiteTitles,
      whyRecommended,
    };
  });

  const masteredCount = evaluatedSteps.filter((e) => e.status === "mastered").length;
  const completionPct =
    evaluatedSteps.length > 0 ? Math.round((masteredCount / evaluatedSteps.length) * 100) : 0;

  return {
    path,
    evaluatedSteps,
    masteredCount,
    completionPct,
    nextRecommendedStepId,
  };
}
