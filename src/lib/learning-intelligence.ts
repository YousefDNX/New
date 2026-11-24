import { GRADE_9_UNIT_3_WORDS } from "@/data/grade9-unit3-vocab";
import type { FocusSessionRow, QuizAttemptRow, StudyItemRow } from "@/lib/firestore-data";
import type { SkillPlacementResult } from "@/lib/skill-academy";

// ===== #1 LEARNING DNA PROFILE =====
export interface LearningDnaProfile {
  dominantStrength: string;
  growthFrontier: string;
  recommendedSessionMin: number;
  retentionStyle: "Consistent Spaced Learner" | "Sprint Learner" | "Getting Started";
  confidenceGapNote: string;
  signals: Array<{ label: string; value: string }>;
}

export function computeLearningDnaProfile(input: {
  studyItems: StudyItemRow[];
  quizAttempts: QuizAttemptRow[];
  focusSessions: FocusSessionRow[];
  placement: SkillPlacementResult | null;
  bestWpm: number;
}): LearningDnaProfile {
  const flashcards = input.studyItems.filter((s) => s.kind === "flashcard");
  const openMistakes = input.studyItems.filter(
    (s) => s.kind === "mistake" && s.mistake_status !== "mastered",
  );
  const avgQuizPct =
    input.quizAttempts.length > 0
      ? Math.round(
          input.quizAttempts.reduce(
            (acc, q) =>
              acc +
              (typeof q.score_pct === "number"
                ? q.score_pct
                : q.total_questions > 0
                  ? (q.correct_count / q.total_questions) * 100
                  : 0),
            0,
          ) / input.quizAttempts.length,
        )
      : null;

  const avgFocus =
    input.focusSessions.length > 0
      ? Math.round(
          input.focusSessions.reduce((acc, s) => acc + (s.duration_minutes || 25), 0) /
            input.focusSessions.length,
        )
      : 25;

  const recommendedSessionMin = avgFocus >= 40 ? 40 : avgFocus >= 20 ? 25 : 20;

  let retentionStyle: LearningDnaProfile["retentionStyle"] = "Getting Started";
  if (flashcards.length >= 6 && input.focusSessions.length >= 2) {
    retentionStyle = "Consistent Spaced Learner";
  } else if (input.focusSessions.length >= 1 || input.quizAttempts.length >= 1) {
    retentionStyle = "Sprint Learner";
  }

  const dominantStrength = input.placement
    ? `${input.placement.strongestDimension.replace("_", " & ")} (CEFR ${
        input.placement.dimensions.find((d) => d.dimension === input.placement?.strongestDimension)
          ?.cefr ?? "B1"
      })`
    : flashcards.length >= 5
      ? "Active Flashcard Encoding"
      : "Building Study Momentum";

  const growthFrontier = input.placement
    ? `${input.placement.priorityDimension.replace("_", " & ")} Accuracy`
    : openMistakes.length > 0
      ? `Resolving ${openMistakes.length} Open Mistake(s)`
      : "Initial Per-Skill Placement Check";

  const confidenceGapNote =
    openMistakes.length >= 3
      ? `You have ${openMistakes.length} active error patterns—resolving misconceptions directly raises accuracy faster than rereading notes.`
      : avgQuizPct !== null && avgQuizPct >= 80
        ? "Quiz recall accuracy is high (80%+). Ready to stretch into Explain It Back & timed synthesis."
        : "Pair short 25-minute focus blocks with 5-question retrieval checks to lock in concepts.";

  return {
    dominantStrength,
    growthFrontier,
    recommendedSessionMin,
    retentionStyle,
    confidenceGapNote,
    signals: [
      { label: "Study Cards", value: `${flashcards.length}` },
      { label: "Quiz Average", value: avgQuizPct !== null ? `${avgQuizPct}%` : "No quizzes yet" },
      { label: "Avg Focus Block", value: `${recommendedSessionMin}m` },
      {
        label: "Best Typing Speed",
        value: input.bestWpm > 0 ? `${input.bestWpm} WPM` : "Unmeasured",
      },
    ],
  };
}

// ===== #2 MISCONCEPTION & 8-PATTERN MISTAKE ANALYZER =====
export type MisconceptionCategory =
  | "concept_confusion"
  | "missing_prerequisite"
  | "incorrect_application"
  | "calculation_error"
  | "misreading_question"
  | "incomplete_answer"
  | "british_spelling"
  | "part_of_speech"
  | "recall_decay"
  | "reasoning_gap";

export type EightMistakePatternId =
  | "conceptual_misunderstanding"
  | "missing_prerequisite"
  | "incorrect_rule_application"
  | "calculation_error"
  | "misreading_question"
  | "incomplete_answer"
  | "vocabulary_misunderstanding"
  | "multi_step_difficulty";

export interface DetectedMisconception {
  category: MisconceptionCategory;
  pattern8?: EightMistakePatternId;
  title: string;
  count: number;
  examples: string[];
  evidenceNote: string;
  rootCause: string;
  correctiveDrill: string;
}

export function analyzeMisconceptions(input: {
  studyItems: StudyItemRow[];
  quizAttempts: QuizAttemptRow[];
  examWeakTopics?: string[];
}): DetectedMisconception[] {
  const mistakes = input.studyItems.filter((i) => i.kind === "mistake");
  const buckets = new Map<MisconceptionCategory, { examples: string[]; count: number }>();

  const pushBucket = (cat: MisconceptionCategory, label: string) => {
    const cur = buckets.get(cat) ?? { examples: [], count: 0 };
    cur.count += 1;
    if (cur.examples.length < 3 && !cur.examples.includes(label)) {
      cur.examples.push(label);
    }
    buckets.set(cat, cur);
  };

  for (const m of mistakes) {
    if (m.mistake_status === "mastered") continue;
    const text = `${m.title} ${m.mistake_reason ?? ""} ${m.content}`.toLowerCase();
    if (/prereq|foundation|earlier|negative|basics|skipped step/.test(text)) {
      pushBucket("missing_prerequisite", m.title);
    } else if (/sign|arithmetic|multiply|divide|decimal|calculat|minus|plus/.test(text)) {
      pushBucket("calculation_error", m.title);
    } else if (/misread|except|not|unit|opposite|didn't read|question asked/.test(text)) {
      pushBucket("misreading_question", m.title);
    } else if (/incomplete|half|missing reason|short|too brief|partial/.test(text)) {
      pushBucket("incomplete_answer", m.title);
    } else if (/apply|rule|formula|wrong equation|wrong tense/.test(text)) {
      pushBucket("incorrect_application", m.title);
    } else if (/flavour|fibre|colour|spelling|british|uk|vocab|meaning|definition/.test(text)) {
      pushBucket("british_spelling", m.title);
    } else if (/noun|verb|adjective|adverb|tense|grammar|agreement/.test(text)) {
      pushBucket("part_of_speech", m.title);
    } else if (/quiz|forgot|recall|blank/.test(text)) {
      pushBucket("recall_decay", m.title);
    } else if (/formula|logic|assumption|why|cause|concept/.test(text)) {
      pushBucket("concept_confusion", m.title);
    } else {
      pushBucket("reasoning_gap", m.title);
    }
  }

  for (const qa of input.quizAttempts) {
    if (qa.total_questions > 0 && qa.correct_count / qa.total_questions < 0.7) {
      pushBucket("recall_decay", `${qa.subject}: ${qa.correct_count}/${qa.total_questions}`);
    }
  }

  for (const topic of input.examWeakTopics ?? []) {
    const low = topic.toLowerCase();
    if (/math|linear|negative|ratio|calc/.test(low)) {
      pushBucket("calculation_error", `Exam review · ${topic}`);
    } else if (/vocab|spell|english/.test(low)) {
      pushBucket("british_spelling", `Exam review · ${topic}`);
    } else {
      pushBucket("reasoning_gap", `Exam review · ${topic}`);
    }
  }

  const meta: Record<
    MisconceptionCategory,
    {
      pattern8: EightMistakePatternId;
      title: string;
      evidenceNote: string;
      rootCause: string;
      correctiveDrill: string;
    }
  > = {
    concept_confusion: {
      pattern8: "conceptual_misunderstanding",
      title: "1. Conceptual Misunderstanding",
      evidenceNote: "Observed from logged concept mistakes.",
      rootCause:
        "Surface terms were memorized without testing the underlying cause-and-effect model.",
      correctiveDrill:
        "Use Explain It Back (Feynman) or Teach Me Differently -> Story/Visual mode.",
    },
    missing_prerequisite: {
      pattern8: "missing_prerequisite",
      title: "2. Missing Prerequisite Knowledge",
      evidenceNote: "Detected references to earlier foundational steps.",
      rootCause: "Moving into multi-step topics before locking down an earlier building block.",
      correctiveDrill:
        "Open Learning Gap Detector or Knowledge Connection Map to repair the parent node.",
    },
    incorrect_application: {
      pattern8: "incorrect_rule_application",
      title: "3. Incorrect Rule or Formula Application",
      evidenceNote: "Matched logs mentioning wrong rule/formula choice.",
      rootCause: "Knowing a rule exists, yet applying it outside its matching boundary conditions.",
      correctiveDrill: "Run Teach Me Differently -> '7. Common Mistakes & Traps' on this topic.",
    },
    calculation_error: {
      pattern8: "calculation_error",
      title: "4. Calculation or Sign Error",
      evidenceNote: "Triggered by arithmetic, negative-sign, or unit mismatches.",
      rootCause: "Mental shortcuts skipped negative signs, decimals, or unit conversions.",
      correctiveDrill: "Write intermediate lines explicitly and verify answer magnitude cleanly.",
    },
    misreading_question: {
      pattern8: "misreading_question",
      title: "5. Misreading Question Constraints",
      evidenceNote: "Linked to missed 'NOT', 'EXCEPT', or unit requirements.",
      rootCause: "Skimming fast past qualifiers under timed pressure.",
      correctiveDrill:
        "Circle or highlight constraint words ('except', 'not', target units) before answering.",
    },
    incomplete_answer: {
      pattern8: "incomplete_answer",
      title: "6. Incomplete Multi-Part Answer",
      evidenceNote: "Detected brief or partial explanation entries.",
      rootCause:
        "Answering only the first half of a prompt without adding evidence or final units.",
      correctiveDrill: "Use a 2-part check: Claim/Result + Supporting Why/Unit.",
    },
    british_spelling: {
      pattern8: "vocabulary_misunderstanding",
      title: "7. Vocabulary & Spelling Precision Gap",
      evidenceNote: "Matched Grade 9 British forms ('flavour', 'fibre') or word meaning slips.",
      rootCause: "Mixing US/UK conventions or confusing look-alike vocabulary words in context.",
      correctiveDrill: "Practice 6 target words across Flashcard + Sentence Fill modes.",
    },
    part_of_speech: {
      pattern8: "incorrect_rule_application",
      title: "Grammar Role & Part-of-Speech Mismatch",
      evidenceNote: "Matched verb tense, noun/adjective, or agreement slips.",
      rootCause: "Picking an adjective form where a noun/adverb or plural agreement is required.",
      correctiveDrill:
        "Practice transforming 5 root words across noun, verb, and adjective frames.",
    },
    recall_decay: {
      pattern8: "missing_prerequisite",
      title: "Forgetting Curve / Delayed Retrieval",
      evidenceNote: "Derived from quiz scores below 70% or overdue flashcards.",
      rootCause: "Allowing >4 days between initial study and your first active self-test.",
      correctiveDrill: "Clear due cards in the Smart Revision Engine (Forgetting Curve).",
    },
    reasoning_gap: {
      pattern8: "multi_step_difficulty",
      title: "8. Multi-Step Reasoning Difficulty",
      evidenceNote: "Inferred from multi-stage comprehension or cross-step errors.",
      rootCause:
        "Holding >2 logical transformations in working memory at once without checkpoint notes.",
      correctiveDrill:
        "Break problems into Step A -> Check -> Step B rather than jumping straight to final.",
    },
  };

  return Array.from(buckets.entries())
    .map(([category, data]) => ({
      category,
      count: data.count,
      examples: data.examples,
      ...meta[category],
    }))
    .sort((a, b) => b.count - a.count);
}

// ===== #3 SMART MATERIAL TRANSFORMER (UPGRADED) =====
export interface TransformedMaterialPack {
  title: string;
  summaryBullets: string[];
  simpleExplanation: string;
  outlineSteps: string[];
  keyDefinitions: Array<{ term: string; definition: string }>;
  vocabularyList: Array<{ word: string; contextLine: string }>;
  conceptLinks: string[];
  revisionSheet: string;
  uncertainNotes: string[];
  flashcards: Array<{ front: string; back: string }>;
  practiceQuestions: Array<{ question: string; answerHint: string }>;
}

export function transformStudyMaterialLocally(
  rawText: string,
  titleInput = "Transformed Study Pack",
): TransformedMaterialPack {
  const clean = rawText.trim();
  const sentences = clean
    .split(/(?<=[.!?؟])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12);

  const uncertainNotes: string[] = [];
  if (clean.length === 0) {
    uncertainNotes.push(
      "No source text provided yet—paste notes or upload a .txt / .md study file.",
    );
  } else if (clean.length < 60) {
    uncertainNotes.push(
      "Source text is very short (<60 chars). Flashcards and summaries reflect only those exact lines without inventing outside textbook claims.",
    );
  }
  const weirdChars = (clean.match(/[\uFFFD]/g) ?? []).length;
  if (weirdChars > 0) {
    uncertainNotes.push(
      `Detected ${weirdChars} unreadable replacement character(s). Please double-check scanned/copied characters before memorizing.`,
    );
  }

  const summaryBullets = sentences.slice(0, 5);
  const simpleExplanation =
    sentences.slice(0, 2).join(" ") ||
    "Paste key sentences from your permitted notes to simplify and extract flashcards.";

  const outlineSteps =
    sentences.length > 0
      ? sentences.slice(0, 5).map((s, i) => `Stage ${i + 1}: ${s.slice(0, 120)}`)
      : [
          "Stage 1: Identify main topic",
          "Stage 2: Extract key definitions",
          "Stage 3: Test recall",
        ];

  const keyDefinitions: Array<{ term: string; definition: string }> = [];
  const flashcards: Array<{ front: string; back: string }> = [];
  for (const line of clean.split("\n")) {
    const colonMatch = line.match(/^([^:–-]{3,60})\s*[:–-]\s*(.{8,240})$/);
    if (colonMatch?.[1] && colonMatch?.[2]) {
      const term = colonMatch[1].trim();
      const definition = colonMatch[2].trim();
      keyDefinitions.push({ term, definition });
      flashcards.push({ front: term, back: definition });
    }
  }
  if (flashcards.length === 0) {
    sentences.slice(0, 5).forEach((s, idx) => {
      const words = s.split(/\s+/);
      const anchor = words.slice(0, Math.min(4, words.length)).join(" ");
      flashcards.push({
        front: `Key Concept #${idx + 1}: Explain "${anchor}..."`,
        back: s,
      });
    });
  }

  // Vocabulary extraction: pick longer content words appearing meaningfully
  const vocabularyList: Array<{ word: string; contextLine: string }> = [];
  const seenVocab = new Set<string>();
  for (const s of sentences) {
    const tokens = s.split(/\s+/);
    for (const rawTok of tokens) {
      const word = rawTok.replace(/[^a-zA-Z-]/g, "");
      const lower = word.toLowerCase();
      if (word.length >= 7 && !seenVocab.has(lower) && vocabularyList.length < 6) {
        seenVocab.add(lower);
        vocabularyList.push({ word, contextLine: s.slice(0, 110) });
      }
    }
  }

  // Concept links matched against NEXORA Knowledge Graph
  const lowerAll = clean.toLowerCase();
  const conceptLinks: string[] = [];
  for (const node of KNOWLEDGE_GRAPH_NODES) {
    const words = node.title
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length >= 5);
    if (words.some((w) => lowerAll.includes(w))) {
      conceptLinks.push(`${node.subject}: ${node.title}`);
    }
  }
  if (conceptLinks.length === 0 && clean.length > 0) {
    conceptLinks.push("Link this pack to an existing Knowledge Map node during review.");
  }

  const practiceQuestions = sentences.slice(0, 4).map((s, idx) => ({
    question: `Q${idx + 1}: In your own words, why is this true — "${s.slice(0, 90)}${s.length > 90 ? "..." : ""}"?`,
    answerHint: s,
  }));

  const safeTitle = titleInput.trim() || "Transformed Study Pack";
  const revisionSheet = [
    `# Quick Revision Sheet — ${safeTitle}`,
    "",
    "## Core Points",
    ...(summaryBullets.length > 0 ? summaryBullets : [simpleExplanation]).map((b) => `- ${b}`),
    "",
    "## Key Definitions",
    ...(keyDefinitions.length > 0
      ? keyDefinitions.map((d) => `- **${d.term}**: ${d.definition}`)
      : ["- Add 'Term: Definition' lines to extract glossary cards automatically."]),
  ].join("\n");

  return {
    title: safeTitle,
    summaryBullets: summaryBullets.length > 0 ? summaryBullets : [simpleExplanation],
    simpleExplanation,
    outlineSteps,
    keyDefinitions,
    vocabularyList,
    conceptLinks: conceptLinks.slice(0, 5),
    revisionSheet,
    uncertainNotes,
    flashcards,
    practiceQuestions,
  };
}

// ===== #6 & #12 KNOWLEDGE CONNECTION MAP (14 NODES + VISUAL SVG COORDS) =====
export interface KnowledgeNode {
  id: string;
  subject: string;
  title: string;
  level: "foundation" | "intermediate" | "advanced";
  prerequisites: string[];
  studyTip: string;
  whyConnected?: string;
  xPct: number;
  yPct: number;
}

export const KNOWLEDGE_GRAPH_NODES: KnowledgeNode[] = [
  {
    id: "kn_vocab_context",
    subject: "English",
    title: "Unit Vocabulary & Context Clues",
    level: "foundation",
    prerequisites: [],
    studyTip: "Practice matching British word forms ('flavour', 'fibre') to sentence context.",
    whyConnected: "Precision in word meaning unlocks accurate grammar & reading comprehension.",
    xPct: 15,
    yPct: 18,
  },
  {
    id: "kn_sentence_grammar",
    subject: "English",
    title: "Tenses & Subject-Verb Agreement",
    level: "foundation",
    prerequisites: ["kn_vocab_context"],
    studyTip: "Check whether the head noun is singular or plural before picking the verb.",
    whyConnected: "Sentence mechanics turn loose vocabulary words into clear grammatical claims.",
    xPct: 38,
    yPct: 16,
  },
  {
    id: "kn_paragraph_cohesion",
    subject: "English",
    title: "Cohesive Academic Paragraphs",
    level: "intermediate",
    prerequisites: ["kn_vocab_context", "kn_sentence_grammar"],
    studyTip: "Open with a clear topic sentence and bridge sentences with formal transitions.",
    whyConnected: "Connects multiple accurate sentences into structured persuasive paragraphs.",
    xPct: 62,
    yPct: 18,
  },
  {
    id: "kn_academic_argument",
    subject: "English",
    title: "Persuasive Essay & Critical Analysis",
    level: "advanced",
    prerequisites: ["kn_paragraph_cohesion", "kn_logic_foundations"],
    studyTip: "Support each claim with verifiable evidence and address counterarguments fairly.",
    whyConnected: "Combines paragraph cohesion with logical evidence verification.",
    xPct: 86,
    yPct: 22,
  },
  {
    id: "kn_negatives_ops",
    subject: "Mathematics",
    title: "Signed Numbers & Order of Operations",
    level: "foundation",
    prerequisites: [],
    studyTip: "Track negative signs carefully inside parentheses before multiplying terms.",
    whyConnected: "Sign accuracy prevents cascading mistakes in equations, ratios, and code.",
    xPct: 14,
    yPct: 48,
  },
  {
    id: "kn_ratios_percent",
    subject: "Mathematics",
    title: "Ratios, Fractions & Percentages",
    level: "foundation",
    prerequisites: ["kn_negatives_ops"],
    studyTip: "Translate percent changes cleanly into decimal multipliers (e.g. 15% = 0.15).",
    whyConnected: "Quantifies change for linear slope, lab rates, and real-world water audits.",
    xPct: 38,
    yPct: 46,
  },
  {
    id: "kn_linear_equations",
    subject: "Mathematics",
    title: "Linear Equations & Slope",
    level: "intermediate",
    prerequisites: ["kn_negatives_ops", "kn_ratios_percent"],
    studyTip: "Visualize rate of change (rise/run) before manipulating algebraic terms.",
    whyConnected: "Turns proportional rates into predictive equations across physics and finance.",
    xPct: 64,
    yPct: 48,
  },
  {
    id: "kn_scientific_method",
    subject: "Science",
    title: "Variables & Experimental Design",
    level: "foundation",
    prerequisites: [],
    studyTip: "Separate what you manipulate (independent) from what you measure (dependent).",
    whyConnected:
      "Establishes clean cause-and-effect testing before interpreting numerical charts.",
    xPct: 15,
    yPct: 76,
  },
  {
    id: "kn_data_inference",
    subject: "Science",
    title: "Statistical Reasoning & Causation",
    level: "advanced",
    prerequisites: ["kn_scientific_method", "kn_ratios_percent", "kn_linear_equations"],
    studyTip: "Look for confounding factors before claiming correlation proves causation.",
    whyConnected:
      "Unites scientific variables with math ratios and slopes to interpret data safely.",
    xPct: 68,
    yPct: 76,
  },
  {
    id: "kn_logic_foundations",
    subject: "Coding & AI",
    title: "Boolean Logic & Fact Verification",
    level: "foundation",
    prerequisites: [],
    studyTip: "Test whether claims hold across edge cases instead of relying on intuition alone.",
    whyConnected: "Power both programming conditionals and AI hallucination / claim audits.",
    xPct: 42,
    yPct: 82,
  },
  {
    id: "kn_code_control_flow",
    subject: "Coding & AI",
    title: "Control Flow, Loops & Debugging",
    level: "intermediate",
    prerequisites: ["kn_logic_foundations", "kn_negatives_ops"],
    studyTip: "Trace iteration variables by hand on 3 boundary values (0, 1, max-1).",
    whyConnected: "Turns logical truth tables into executable multi-step software behavior.",
    xPct: 86,
    yPct: 70,
  },
];

export function findPrerequisiteGaps(
  targetNodeId: string,
  masteredNodeIds: string[],
): { target: KnowledgeNode; missingChain: KnowledgeNode[]; ready: boolean } {
  const byId = new Map(KNOWLEDGE_GRAPH_NODES.map((n) => [n.id, n]));
  const mastered = new Set(masteredNodeIds);
  const target = byId.get(targetNodeId) ?? KNOWLEDGE_GRAPH_NODES[0]!;
  const visited = new Set<string>();
  const missingChain: KnowledgeNode[] = [];

  const visit = (nodeId: string) => {
    const node = byId.get(nodeId);
    if (!node) return;
    for (const preId of node.prerequisites) {
      if (!visited.has(preId)) {
        visited.add(preId);
        visit(preId);
        const preNode = byId.get(preId);
        if (preNode && !mastered.has(preId)) {
          missingChain.push(preNode);
        }
      }
    }
  };

  visit(target.id);
  return {
    target,
    missingChain,
    ready: missingChain.length === 0,
  };
}

// ===== #1 LEARNING GAP DETECTOR (EVIDENCE VS HYPOTHESES + RECOVERY) =====
export interface LearningGapFinding {
  id: string;
  subject: string;
  targetTopic: string;
  targetNodeId: string;
  missingPrerequisites: KnowledgeNode[];
  evidenceFacts: string[];
  hypothesizedCauses: string[];
  recoverySteps: string[];
  reassessQuestion: {
    prompt: string;
    options: [string, string, string, string];
    correctIndex: 0 | 1 | 2 | 3;
    explanation: string;
  };
  severity: "high" | "moderate";
}

export function detectLearningGaps(input: {
  studyItems: StudyItemRow[];
  quizAttempts: QuizAttemptRow[];
  masteredNodeIds: string[];
  resolvedGapIds?: string[];
  englishWeakSkill?: string | null;
}): {
  gaps: LearningGapFinding[];
  resolvedCount: number;
  summaryNote: string;
} {
  const resolved = new Set(input.resolvedGapIds ?? []);
  const findings: LearningGapFinding[] = [];

  // 1. Trace any unmastered intermediate/advanced nodes whose prerequisites are incomplete
  const linearGap = findPrerequisiteGaps("kn_linear_equations", input.masteredNodeIds);
  const mathMistakes = input.studyItems.filter(
    (s) =>
      s.kind === "mistake" &&
      s.mistake_status !== "mastered" &&
      /math|linear|ratio|neg|fraction|algebra|slope/i.test(
        `${s.subject} ${s.title} ${s.content} ${s.mistake_reason ?? ""}`,
      ),
  );
  const lowMathQuiz = input.quizAttempts.filter(
    (q) =>
      /math/i.test(q.subject) &&
      q.total_questions > 0 &&
      q.correct_count / q.total_questions < 0.75,
  );

  if (mathMistakes.length > 0 || lowMathQuiz.length > 0 || !linearGap.ready) {
    const evidence: string[] = [];
    if (mathMistakes.length > 0) {
      evidence.push(`${mathMistakes.length} open math mistake card(s) in Study.`);
    }
    if (lowMathQuiz.length > 0) {
      const q = lowMathQuiz[0]!;
      evidence.push(
        `Recent ${q.subject} quiz scored ${q.correct_count}/${q.total_questions} (<75%).`,
      );
    }
    if (evidence.length === 0) {
      evidence.push(
        "Prerequisite nodes for Linear Equations are not yet verified mastered on your map.",
      );
    }

    findings.push({
      id: "gap_math_linear_prereqs",
      subject: "Mathematics",
      targetTopic: "Linear Equations & Slope",
      targetNodeId: "kn_linear_equations",
      missingPrerequisites: linearGap.missingChain,
      evidenceFacts: evidence,
      hypothesizedCauses: [
        "Hypothesis: Sign slips on negative integers or fractional slopes may happen before algebraic rearrangement starts.",
      ],
      recoverySteps: [
        "Complete a 5-question Signed Numbers & Order of Operations warm-up first.",
        "Convert percentage/fraction changes into decimal multipliers cleanly.",
        "Pass the reassessment check below to mark this gap resolved.",
      ],
      reassessQuestion: {
        prompt: "What is the slope (rate of change) between points (2, 5) and (4, 11)?",
        options: ["2", "3", "6", "-3"],
        correctIndex: 1,
        explanation: "Slope = (11 - 5) / (4 - 2) = 6 / 2 = 3.",
      },
      severity: mathMistakes.length > 0 || lowMathQuiz.length > 0 ? "high" : "moderate",
    });
  }

  // 2. English cohesion / grammar prerequisite check
  const argGap = findPrerequisiteGaps("kn_academic_argument", input.masteredNodeIds);
  const enMistakes = input.studyItems.filter(
    (s) =>
      s.kind === "mistake" &&
      s.mistake_status !== "mastered" &&
      /english|grammar|flavour|fibre|vocab|writing|tense/i.test(
        `${s.subject} ${s.title} ${s.content} ${s.mistake_reason ?? ""}`,
      ),
  );
  if (enMistakes.length > 0 || input.englishWeakSkill || !argGap.ready) {
    const evidence: string[] = [];
    if (enMistakes.length > 0) {
      evidence.push(`${enMistakes.length} unreviewed English/Unit 3 mistake item(s) recorded.`);
    }
    if (input.englishWeakSkill) {
      evidence.push(`English placement highlighted ${input.englishWeakSkill} as a priority area.`);
    }
    if (evidence.length === 0) {
      evidence.push(
        "Upper-level English essay nodes depend on unverified sentence grammar prerequisites.",
      );
    }

    findings.push({
      id: "gap_english_cohesion",
      subject: "English",
      targetTopic: "Academic Cohesion & Accurate Transitions",
      targetNodeId: "kn_paragraph_cohesion",
      missingPrerequisites: argGap.missingChain.filter((n) => n.subject === "English"),
      evidenceFacts: evidence,
      hypothesizedCauses: [
        "Hypothesis: Subject-verb agreement or contrast connector choice ('however' vs 'consequently') can break paragraph flow.",
      ],
      recoverySteps: [
        "Review British curriculum vocabulary forms ('flavour', 'fibre') in sentence frames.",
        "Pair one topic sentence with one contrast or cause connector.",
        "Pass the 1-question cohesion check below to log progress.",
      ],
      reassessQuestion: {
        prompt: "Which sentence correctly matches plural/singular agreement and contrast?",
        options: [
          "The list of new words were clear; consequently, students disagreed.",
          "The list of new words was clear; however, two students requested extra examples.",
          "The list of new words are clear; therefore, nobody practiced.",
          "Each word have two meanings; although it fits.",
        ],
        correctIndex: 1,
        explanation: "'The list' takes singular 'was', and 'however' cleanly signals contrast.",
      },
      severity: enMistakes.length >= 2 ? "high" : "moderate",
    });
  }

  // 3. Science / Data Inference gap
  const sciGap = findPrerequisiteGaps("kn_data_inference", input.masteredNodeIds);
  if (!sciGap.ready) {
    findings.push({
      id: "gap_science_inference",
      subject: "Science",
      targetTopic: "Experimental Variables & Causation",
      targetNodeId: "kn_data_inference",
      missingPrerequisites: sciGap.missingChain,
      evidenceFacts: [
        "Data Inference depends on both Scientific Method and Math Ratios, which are marked unmastered.",
      ],
      hypothesizedCauses: [
        "Hypothesis: Mixing independent vs. dependent variables makes lab conclusion questions harder.",
      ],
      recoverySteps: [
        "Label what you change (Independent) vs. what changes in response (Dependent) first.",
        "Check for confounding third variables before concluding causation.",
        "Complete the Science verification question below.",
      ],
      reassessQuestion: {
        prompt:
          "A study finds rooms with bright lamps have higher exam scores. What should be checked BEFORE saying lamps boost IQ?",
        options: [
          "Confounding factors like quiet study desk time and study hours",
          "The color of the lamp box",
          "Whether the lightbulb likes math",
          "Ignoring sample sizes completely",
        ],
        correctIndex: 0,
        explanation: "Confounding habits (like total quiet study time) can drive both variables.",
      },
      severity: "moderate",
    });
  }

  const activeGaps = findings.filter((g) => !resolved.has(g.id));
  return {
    gaps: activeGaps,
    resolvedCount: findings.length - activeGaps.length,
    summaryNote:
      activeGaps.length === 0
        ? "All tracked foundation prerequisites currently appear solid—keep testing recall periodically."
        : `Identified ${activeGaps.length} priority prerequisite chain${activeGaps.length === 1 ? "" : "s"} strictly separating observed evidence from diagnostic hypotheses.`,
  };
}

// ===== #3 UPGRADED EXAM SIMULATION CENTER =====
export interface ExamSimulationQuestion {
  id: string;
  subject: string;
  topic: string;
  difficulty: "foundation" | "standard" | "challenge";
  format: "mcq" | "true_false" | "short_answer" | "written_response";
  prompt: string;
  options?: string[];
  correctIndex?: number;
  acceptedKeywords?: string[];
  modelAnswer: string;
  explanation: string;
}

export interface ExamSimulationConfig {
  curriculum: string;
  subject: "English" | "Mathematics" | "Science" | "Mixed STEM & English";
  topic: string;
  difficulty: "foundation" | "standard" | "challenge";
  questionCount: 5 | 8 | 10;
  durationMinutes: 10 | 15 | 25;
}

export const EXAM_QUESTION_BANK: ExamSimulationQuestion[] = [
  {
    id: "ex_en_1",
    subject: "English",
    topic: "Unit 3 Vocabulary & Spelling",
    difficulty: "foundation",
    format: "mcq",
    prompt:
      "Choose the sentence that uses standard British spelling consistent with Grade 9 Unit 3:",
    options: [
      "Oats offer soluble fibre while cardamom gives rich flavour.",
      "Oats offer soluble fiber while cardamom gives rich flavor.",
      "Oats offer soluble fibre while cardamom gives rich flavor.",
      "Oats offer soluble fybre while cardamom gives rich flavour.",
    ],
    correctIndex: 0,
    modelAnswer: "Oats offer soluble fibre while cardamom gives rich flavour.",
    explanation: "Standard UK curriculum spelling uses '-re' ('fibre') and '-our' ('flavour').",
  },
  {
    id: "ex_en_2",
    subject: "English",
    topic: "Subject-Verb Agreement",
    difficulty: "standard",
    format: "mcq",
    prompt: "Complete: 'Neither the coach nor the debate captains ___ aware of the room change.'",
    options: ["was", "were", "is", "has"],
    correctIndex: 1,
    modelAnswer: "were",
    explanation:
      "With 'neither...nor', the verb agrees with the closer noun ('captains' -> plural 'were').",
  },
  {
    id: "ex_en_3",
    subject: "English",
    topic: "Academic Hedging",
    difficulty: "challenge",
    format: "true_false",
    prompt:
      "True or False: 'The survey indicates a link' is more accurate academic phrasing than 'This 5-student poll proves 100%.'",
    options: ["True", "False"],
    correctIndex: 0,
    modelAnswer: "True",
    explanation:
      "Academic register avoids sweeping absolutes when evidence comes from small samples.",
  },
  {
    id: "ex_en_4",
    subject: "English",
    topic: "Active Cohesion",
    difficulty: "standard",
    format: "short_answer",
    prompt:
      "Type one formal contrast transition word (e.g., contrasting two opposite ideas cleanly):",
    acceptedKeywords: ["however", "although", "whereas", "nevertheless", "in contrast", "yet"],
    modelAnswer: "however (or 'in contrast', 'nevertheless')",
    explanation: "'However' and 'nevertheless' formally connect contrasting clauses.",
  },
  {
    id: "ex_en_5",
    subject: "English",
    topic: "Structured Explanation",
    difficulty: "challenge",
    format: "written_response",
    prompt:
      "Write 1–2 sentences explaining why reviewing mistakes after a quiz helps long-term memory better than rereading notes.",
    acceptedKeywords: [
      "active",
      "recall",
      "mistake",
      "because",
      "understand",
      "fix",
      "memory",
      "practice",
    ],
    modelAnswer:
      "Reviewing mistakes exposes exact knowledge gaps so you fix misconceptions directly instead of passively skimming familiar highlights.",
    explanation:
      "Effective written responses connect a mechanism ('because', 'recall', 'gap') to why rereading fails.",
  },
  {
    id: "ex_math_1",
    subject: "Mathematics",
    topic: "Signed Arithmetic",
    difficulty: "foundation",
    format: "mcq",
    prompt: "Evaluate carefully: (-4) * 3 + 10",
    options: ["-22", "-2", "2", "22"],
    correctIndex: 1,
    modelAnswer: "-2",
    explanation: "Multiply first: -4 * 3 = -12. Then -12 + 10 = -2.",
  },
  {
    id: "ex_math_2",
    subject: "Mathematics",
    topic: "Percentages & Multipliers",
    difficulty: "standard",
    format: "short_answer",
    prompt:
      "A study guide costs 20 KD and drops by 25%. What is the final price in KD? (number only)",
    acceptedKeywords: ["15", "15.0", "15 kd"],
    modelAnswer: "15",
    explanation: "25% of 20 is 5. 20 - 5 = 15 KD.",
  },
  {
    id: "ex_math_3",
    subject: "Mathematics",
    topic: "Linear Slope",
    difficulty: "standard",
    format: "mcq",
    prompt: "A line passes through (0, 4) and (3, 13). What is its equation?",
    options: ["y = 3x + 4", "y = 4x + 3", "y = 9x + 4", "y = 3x - 4"],
    correctIndex: 0,
    modelAnswer: "y = 3x + 4",
    explanation: "Slope m = (13 - 4) / (3 - 0) = 3, and y-intercept at x=0 is 4 -> y = 3x + 4.",
  },
  {
    id: "ex_math_4",
    subject: "Mathematics",
    topic: "Ratio Reasoning",
    difficulty: "challenge",
    format: "true_false",
    prompt:
      "True or False: Increasing a number by 20% and then decreasing the new value by 20% returns you to the original number.",
    options: ["True", "False"],
    correctIndex: 1,
    modelAnswer: "False",
    explanation: "100 -> 120 (+20%), then 20% off 120 is 24 -> 96 (4% lower than 100).",
  },
  {
    id: "ex_sci_1",
    subject: "Science",
    topic: "Experimental Variables",
    difficulty: "foundation",
    format: "mcq",
    prompt:
      "When testing how temperature affects sugar dissolving speed, what is the dependent variable?",
    options: [
      "Water temperature",
      "Time taken for sugar to dissolve completely",
      "Spoon color",
      "Room wall paint",
    ],
    correctIndex: 1,
    modelAnswer: "Time taken for sugar to dissolve completely",
    explanation: "Dissolving time is measured as the outcome resulting from temperature changes.",
  },
  {
    id: "ex_sci_2",
    subject: "Science",
    topic: "Causation vs Correlation",
    difficulty: "challenge",
    format: "written_response",
    prompt:
      "Explain in 1–2 sentences why two variables increasing together on a graph does NOT automatically prove one caused the other.",
    acceptedKeywords: [
      "third",
      "factor",
      "variable",
      "confound",
      "correlation",
      "cause",
      "coincidence",
    ],
    modelAnswer:
      "Two trends can rise together due to a hidden third confounding factor rather than one directly causing the other.",
    explanation:
      "Strong answers mention confounding variables or coincidence vs direct causal mechanisms.",
  },
  {
    id: "ex_sci_3",
    subject: "Science",
    topic: "Coastal Ecology & Water",
    difficulty: "standard",
    format: "mcq",
    prompt: "Reverse osmosis membranes purify seawater by:",
    options: [
      "Boiling salt until it turns into carbon",
      "Using pressure to push water molecules through a semi-permeable membrane blocking dissolved salts",
      "Adding sugar crystals",
      "Freezing sand into stone",
    ],
    correctIndex: 1,
    modelAnswer:
      "Using pressure to push water molecules through a semi-permeable membrane blocking dissolved salts",
    explanation: "High pressure forces pure water across membranes while salt ions remain behind.",
  },
];

export function buildExamSimulation(config: ExamSimulationConfig): ExamSimulationQuestion[] {
  const pool = EXAM_QUESTION_BANK.filter((q) => {
    const subjMatch = config.subject === "Mixed STEM & English" || q.subject === config.subject;
    const topicMatch =
      !config.topic.trim() ||
      config.topic.trim().toLowerCase() === "all topics" ||
      q.topic.toLowerCase().includes(config.topic.trim().toLowerCase());
    return subjMatch && topicMatch;
  });

  const base = pool.length >= 3 ? pool : EXAM_QUESTION_BANK;
  const preferredDiff = base.filter((q) => q.difficulty === config.difficulty);
  const restDiff = base.filter((q) => q.difficulty !== config.difficulty);
  const ordered = [...preferredDiff, ...restDiff];

  // Fill up to requested length by cycling cleanly with unique instance ids if bank is smaller
  const selected: ExamSimulationQuestion[] = [];
  for (let i = 0; i < config.questionCount; i++) {
    const src = ordered[i % ordered.length]!;
    selected.push({
      ...src,
      id: `${src.id}_inst_${i}`,
    });
  }
  return selected;
}

export interface GradedExamItemResult {
  questionId: string;
  topic: string;
  correct: boolean;
  studentResponse: string;
  expectedAnswer: string;
  explanation: string;
}

export function gradeExamSimulation(
  questions: ExamSimulationQuestion[],
  mcqChoices: Record<string, number>,
  textAnswers: Record<string, string>,
): {
  correctCount: number;
  total: number;
  scorePct: number;
  weakTopics: string[];
  results: GradedExamItemResult[];
} {
  const results: GradedExamItemResult[] = [];
  const weakSet = new Set<string>();
  let correctCount = 0;

  for (const q of questions) {
    let correct = false;
    let studentResponse = "";
    if (q.format === "mcq" || q.format === "true_false") {
      const chosen = mcqChoices[q.id];
      studentResponse =
        typeof chosen === "number" && q.options?.[chosen]
          ? q.options[chosen]!
          : "(No option selected)";
      correct = typeof chosen === "number" && chosen === q.correctIndex;
    } else {
      const raw = (textAnswers[q.id] ?? "").trim();
      studentResponse = raw || "(No written response)";
      const low = raw.toLowerCase();
      if (q.format === "short_answer") {
        correct = (q.acceptedKeywords ?? []).some((kw) => low.includes(kw.toLowerCase()));
      } else {
        // Written response requires at least 8 words and >=1 key concept term
        const wordCount = raw.split(/\s+/).filter(Boolean).length;
        const kwHits = (q.acceptedKeywords ?? []).filter((kw) =>
          low.includes(kw.toLowerCase()),
        ).length;
        correct = wordCount >= 7 && kwHits >= 2;
      }
    }

    if (correct) {
      correctCount += 1;
    } else {
      weakSet.add(q.topic);
    }

    results.push({
      questionId: q.id,
      topic: q.topic,
      correct,
      studentResponse,
      expectedAnswer: q.modelAnswer,
      explanation: q.explanation,
    });
  }

  const total = questions.length;
  return {
    correctCount,
    total,
    scorePct: total > 0 ? Math.round((correctCount / total) * 100) : 0,
    weakTopics: Array.from(weakSet),
    results,
  };
}

// ===== #7 & #9 LOCAL FALLBACKS FOR TEACH ME DIFFERENTLY & ASK YOUR LESSON =====
export function buildStyledExplanationLocally(input: {
  topic: string;
  styleId: string;
  sourceExcerpt?: string;
}): { explanation: string; quickCheckQuestion: string; expectedHint: string } {
  const topic = input.topic.trim() || "this concept";
  const excerptLine = input.sourceExcerpt?.trim()
    ? ` Grounded excerpt: "${input.sourceExcerpt.trim().slice(0, 140)}..."`
    : "";

  const templates: Record<string, string> = {
    simple_everyday: `Plain meaning of ${topic}: Think of it as a clear step-by-step tool you use to avoid guessing. Start with the main idea, test it on one tiny everyday example, and notice what changes.${excerptLine}`,
    story_analogy: `Analogy for ${topic}: Imagine packing a travel backpack. If you toss items randomly without checking weight or categories, everything tangles; ${topic} gives each piece a clear place so you can pull out what you need fast.${excerptLine}`,
    visual_step: `Visual Flow for ${topic}:\n[1. Spot Goal / Input] --> [2. Check Core Rule or Condition] --> [3. Apply Step-by-Step] --> [4. Verify Result & Units].${excerptLine}`,
    real_life_example: `Real-Life Student Scenario (${topic}): Suppose you compare two study weeks or measure water drops from two kitchen taps. Watching concrete numbers move makes ${topic} click faster than abstract definitions.${excerptLine}`,
    deep_academic: `Formal Academic Frame (${topic}): Identify explicit boundary conditions, distinguish independent drivers from observed outcomes, and verify every claim against primary definitions or empirical evidence.${excerptLine}`,
    practice_first: `Practice-First Try (${topic}): Pause before memorizing the rule—write down what you predict happens in one test case first, then check why the rule agrees or differs.${excerptLine}`,
    common_mistakes: `Common Exam Traps in ${topic}:\n- Trap 1: Rushing past keywords like 'not' or negative signs.\n- Trap 2: Confusing surface terminology with the actual cause.\nFix: Check step boundaries once before locking your answer.${excerptLine}`,
    quick_summary: `4-Bullet Rapid Sheet — ${topic}:\n• Core Goal: Explain & verify accurately.\n• Watch For: Prerequisites & edge constraints.\n• Common Slip: Skimming past key qualifiers.\n• Next Action: Solve 1 active recall check without looking.${excerptLine}`,
  };

  return {
    explanation: templates[input.styleId] ?? templates["simple_everyday"]!,
    quickCheckQuestion: `Quick 15-second check: In one plain sentence of your own, what is the main job or rule of "${topic}"?`,
    expectedHint: `Mention what problem ${topic} solves or one boundary condition to check.`,
  };
}

export function answerLessonQuestionLocally(input: {
  lessonTitle: string;
  lessonText: string;
  question: string;
}): {
  answer: string;
  quotedPassages: string[];
  coveredInLesson: boolean;
} {
  const cleanText = input.lessonText.trim();
  const sentences = cleanText
    .split(/(?<=[.!?؟])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 10);

  const qWords = input.question
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length >= 4);

  const scored = sentences
    .map((s) => {
      const low = s.toLowerCase();
      const score = qWords.reduce((acc, w) => (low.includes(w) ? acc + 1 : acc), 0);
      return { sentence: s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  if (scored.length === 0) {
    return {
      answer: `I checked the loaded text for "${input.lessonTitle}", and your exact question wording did not appear directly in these lesson passages. Here are the opening lesson sentences for context—or connect AI Tutor online to explore beyond this lesson text without guessing textbook claims.`,
      quotedPassages: sentences.slice(0, 2),
      coveredInLesson: false,
    };
  }

  return {
    answer: `Based directly on "${input.lessonTitle}": ${scored.map((s) => s.sentence).join(" ")}`,
    quotedPassages: scored.map((s) => s.sentence),
    coveredInLesson: true,
  };
}

// ===== #8 FORGETTING CURVE TRACKER =====
export interface RetentionCurveItem {
  id: string;
  title: string;
  subject: string;
  daysElapsed: number;
  stabilityDays: number;
  predictedRetentionPct: number;
  urgency: "overdue" | "fading" | "strong";
}

export function computeForgettingCurve(
  flashcards: StudyItemRow[],
  nowMs = Date.now(),
): RetentionCurveItem[] {
  return flashcards
    .filter((c) => c.kind === "flashcard")
    .map((card) => {
      const refIso = card.created_at;
      const refMs = Date.parse(refIso);
      const daysElapsed = Number.isNaN(refMs) ? 0 : Math.max(0, (nowMs - refMs) / 86_400_000);
      const reviews = Math.max(0, card.review_count ?? 0);
      const stabilityDays = Math.round(2 * Math.pow(1.85, Math.min(reviews, 6)) * 10) / 10;
      const predictedRetentionPct = Math.max(
        5,
        Math.min(100, Math.round(Math.exp(-daysElapsed / stabilityDays) * 100)),
      );
      const urgency: RetentionCurveItem["urgency"] =
        predictedRetentionPct < 55 ||
        Boolean(card.next_review_at && Date.parse(card.next_review_at) <= nowMs)
          ? "overdue"
          : predictedRetentionPct < 78
            ? "fading"
            : "strong";

      return {
        id: card.id,
        title: card.title,
        subject: card.subject,
        daysElapsed: Math.round(daysElapsed * 10) / 10,
        stabilityDays,
        predictedRetentionPct,
        urgency,
      };
    })
    .sort((a, b) => a.predictedRetentionPct - b.predictedRetentionPct);
}

// ===== #9 QUESTION GENERATOR STUDIO =====
export interface GeneratedQuestionItem {
  id: string;
  format: "mcq" | "cloze" | "short";
  prompt: string;
  options?: [string, string, string, string];
  correctAnswer: string;
  hint: string;
}

export function generateQuestionsFromText(
  sourceText: string,
  format: "mcq" | "cloze" | "short" = "cloze",
): GeneratedQuestionItem[] {
  const sentences = sourceText
    .split(/(?<=[.!?؟])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 18)
    .slice(0, 6);

  if (sentences.length === 0) {
    return GRADE_9_UNIT_3_WORDS.slice(0, 4).map((w, idx) => ({
      id: `gen_u3_${idx}`,
      format,
      prompt:
        format === "cloze"
          ? w.exampleEn.replace(new RegExp(w.word, "i"), "_____")
          : `Define or use "${w.word}" (${w.partOfSpeech}) in context.`,
      correctAnswer: format === "cloze" ? w.word : `${w.definitionEn} (${w.meaningAr})`,
      hint: `Starts with "${w.word.slice(0, 2)}..." · ${w.meaningAr}`,
    }));
  }

  return sentences.map((sentence, idx) => {
    const words = sentence.split(/\s+/);
    const candidateWord =
      words.find((w) => w.replace(/[^a-zA-Z]/g, "").length >= 6) ?? words[0] ?? "concept";
    const cleanWord = candidateWord.replace(/[^a-zA-Z0-9-]/g, "");

    if (format === "cloze" && cleanWord) {
      return {
        id: `gen_${idx}`,
        format: "cloze",
        prompt: sentence.replace(cleanWord, "_______"),
        correctAnswer: cleanWord,
        hint: `Keyword begins with "${cleanWord.slice(0, 2)}" (${cleanWord.length} letters).`,
      };
    }

    if (format === "mcq" && cleanWord) {
      const distractors = ["contrast", "hypothesis", "equilibrium", "parameter"].filter(
        (d) => d.toLowerCase() !== cleanWord.toLowerCase(),
      );
      const opts: [string, string, string, string] = [
        cleanWord,
        distractors[0] ?? "evidence",
        distractors[1] ?? "structure",
        distractors[2] ?? "summary",
      ];
      return {
        id: `gen_${idx}`,
        format: "mcq",
        prompt: `Complete the exact key concept: "${sentence.replace(cleanWord, "_____")}"`,
        options: opts,
        correctAnswer: cleanWord,
        hint: `Check logical meaning in the sentence.`,
      };
    }

    return {
      id: `gen_${idx}`,
      format: "short",
      prompt: `Summarize the core cause/fact behind: "${sentence}"`,
      correctAnswer: sentence,
      hint: `Mention key terms around "${cleanWord}".`,
    };
  });
}

// ===== #10 EXPLAIN IT BACK / FEYNMAN EVALUATOR =====
export interface FeynmanEvaluation {
  scorePct: number;
  coveredKeywords: string[];
  missingKeywords: string[];
  clarityFeedback: string;
  wordCount: number;
}

export function evaluateFeynmanExplanation(input: {
  topicTitle: string;
  expectedKeywords: string[];
  studentExplanation: string;
}): FeynmanEvaluation {
  const normalized = input.studentExplanation.toLowerCase();
  const words = input.studentExplanation.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const coveredKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of input.expectedKeywords) {
    const token = kw.trim().toLowerCase();
    if (!token) continue;
    if (normalized.includes(token)) {
      coveredKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const coverageRatio =
    input.expectedKeywords.length > 0 ? coveredKeywords.length / input.expectedKeywords.length : 1;
  const lengthBonus = wordCount >= 20 ? 20 : wordCount >= 10 ? 12 : wordCount > 0 ? 5 : 0;
  const hasAnalogy = /like|because|example|means|for instance|imagine/i.test(normalized) ? 10 : 0;
  const scorePct = Math.min(100, Math.round(coverageRatio * 70 + lengthBonus + hasAnalogy));

  let clarityFeedback =
    scorePct >= 80
      ? "Clear explanation! You connected core ideas in plain reasoning."
      : scorePct >= 50
        ? "Good start—tighten the link to the missing terms below and include a 'because' or concrete example."
        : "Too brief or missing essential mechanisms. Imagine teaching a 12-year-old what happens step by step.";

  if (wordCount < 10) {
    clarityFeedback =
      "Write at least 2 complete sentences in your own words before checking mastery.";
  }

  return {
    scorePct,
    coveredKeywords,
    missingKeywords,
    clarityFeedback,
    wordCount,
  };
}

// ===== #11 STUDY SESSION ANALYZER =====
export interface StudyHabitReport {
  totalFocusMinutes: number;
  sessionCount: number;
  avgSessionMinutes: number;
  topSubject: string;
  consistencyRating: "Strong" | "Developing" | "Initial";
  actionableTip: string;
}

export function analyzeStudyHabits(focusSessions: FocusSessionRow[]): StudyHabitReport {
  const sessionCount = focusSessions.length;
  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  const avgSessionMinutes = sessionCount > 0 ? Math.round(totalFocusMinutes / sessionCount) : 0;

  const subjectCounts = new Map<string, number>();
  for (const s of focusSessions) {
    const subj = (s.subject || s.area || "General").trim();
    subjectCounts.set(subj, (subjectCounts.get(subj) ?? 0) + (s.duration_minutes || 1));
  }
  const topSubject =
    Array.from(subjectCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Academic Focus";

  const consistencyRating: StudyHabitReport["consistencyRating"] =
    sessionCount >= 5 ? "Strong" : sessionCount >= 2 ? "Developing" : "Initial";

  const actionableTip =
    sessionCount === 0
      ? "Log your first 25-minute Study Sprint or Focus Timer block to unlock personalized pacing analysis."
      : avgSessionMinutes > 45
        ? "Your average blocks run >45m—pair them with 5-minute hydration/stretch breaks to prevent fatigue."
        : "Your 20–40m sprint rhythm is well-paced. Alternate between recall flashcards and problem solving.";

  return {
    totalFocusMinutes,
    sessionCount,
    avgSessionMinutes,
    topSubject,
    consistencyRating,
    actionableTip,
  };
}

// ===== #16 QUESTION OF THE DAY & #17 KNOWLEDGE CHALLENGES =====
export interface DailyChallengeQuestion {
  id: string;
  domain: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export const DAILY_QUESTION_POOL: DailyChallengeQuestion[] = [
  {
    id: "qotd_1",
    domain: "English · Unit 3",
    question: "Which word describes giving careful thought before speaking or acting?",
    options: ["reflect", "abandon", "collapse", "scatter"],
    correctIndex: 0,
    explanation: "'Reflect' means to think deeply or carefully about something.",
  },
  {
    id: "qotd_2",
    domain: "Science · Ecology",
    question: "Why do coastal wetlands help protect nearby cities during heavy storms?",
    options: [
      "They absorb surge water and slow wave energy naturally",
      "They raise ocean salinity above boiling",
      "They block all sunlight permanently",
      "They freeze wind currents",
    ],
    correctIndex: 0,
    explanation: "Wetlands act as natural sponges and wave buffers against storm surges.",
  },
  {
    id: "qotd_3",
    domain: "Critical Thinking",
    question:
      "If a headline cites a survey of only 8 volunteers as 'universal proof', what is the flaw?",
    options: [
      "Sample size is far too small to generalize broadly",
      "Using percentages",
      "Publishing in blue font",
      "Including a date",
    ],
    correctIndex: 0,
    explanation: "Tiny non-representative samples cannot justify universal generalizations.",
  },
  {
    id: "qotd_4",
    domain: "Productivity · Study Science",
    question:
      "Why does spacing revision across 3 days outperform cramming the same hours in one night?",
    options: [
      "Memory consolidation happens during rest and repeated retrieval cues",
      "One-night study erases keyboards",
      "Spacing shortens daylight",
      "Reading backwards saves ink",
    ],
    correctIndex: 0,
    explanation: "Rest/sleep between retrieval sessions strengthens synaptic consolidation.",
  },
  {
    id: "qotd_5",
    domain: "Mathematics · Rates",
    question:
      "A student improves quiz accuracy from 60% to 75%. How many percentage points did they gain?",
    options: ["10 points", "15 points", "25 points", "40 points"],
    correctIndex: 1,
    explanation: "75% - 60% = 15 percentage points.",
  },
];

export function getQuestionOfTheDay(dateKey: string): DailyChallengeQuestion {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return DAILY_QUESTION_POOL[hash % DAILY_QUESTION_POOL.length]!;
}

export interface KnowledgeChallengeTrack {
  id: string;
  title: string;
  category: string;
  steps: string[];
  quizPrompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  rewardXp: number;
}

export const KNOWLEDGE_CHALLENGES: KnowledgeChallengeTrack[] = [
  {
    id: "kc_climate_water",
    title: "Desalination & Freshwater Engineering",
    category: "Applied STEM",
    steps: [
      "Compare reverse osmosis vs. thermal desalination energy footprints.",
      "Examine how solar microgrids reduce grid dependency in desert coastal cities.",
    ],
    quizPrompt:
      "Why are renewable-powered reverse osmosis plants prioritized in sunny coastal regions?",
    options: [
      "They pair abundant solar input with lower thermal fuel emissions",
      "They convert sand directly into clouds",
      "They require zero membrane filters",
      "They freeze seawater permanently",
    ],
    correctIndex: 0,
    rewardXp: 35,
  },
  {
    id: "kc_bilingual_precision",
    title: "Bilingual Science Translation Precision",
    category: "Academic Communication",
    steps: [
      "Identify 3 Arabic scientific terms and map their exact English conceptual nouns.",
      "Verify British vs. US spelling consistency across an academic abstract.",
    ],
    quizPrompt: "Which pair demonstrates consistent British academic spelling?",
    options: ["behaviour & flavour", "behavior & flavour", "colour & fiber", "centre & analyze"],
    correctIndex: 0,
    rewardXp: 30,
  },
];
