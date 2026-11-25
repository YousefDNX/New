import {
  ADVENTURE_REGIONS,
  CURRICULUM_LESSONS,
  DAILY_ENGLISH_MISSIONS,
  LEVEL_MASTERY_EXAMS,
  type AcademyWorkspaceId,
  type AdventureRegion,
  type AdventureRegionId,
  type CurriculumLevelId,
  type LessonExercise,
} from "@/data/english-curriculum";
import { GRAMMAR_TOPICS, WRITING_TASKS, type CefrExtendedBand } from "@/data/english-academies";
import { PLACEMENT_ASSESSMENT_QUESTIONS, type PlacementDimensionId } from "@/data/skill-academy";
import type { SkillPlacementResult } from "@/lib/skill-academy";
import { BRAND } from "@/config/brand";

export type VocabMasteryStatus = "new" | "practicing" | "needs_revision" | "mastered";

export interface VocabWordProgress {
  wordId: string;
  word: string;
  status: VocabMasteryStatus;
  correctCount: number;
  attemptCount: number;
  distinctModes: string[];
  lastPracticedAt: string;
  nextReviewAt: string;
}

export interface PersonalVocabEntry {
  id: string;
  word: string;
  meaningAr: string;
  definition: string;
  example: string;
  sourceLabel: string;
  createdAt: string;
}

export interface WritingImprovementItem {
  category: string;
  issue: string;
  whyItMatters: string;
  howToImprove: string;
}

export interface WritingEvaluationResult {
  scorePct: number;
  readinessBand: CefrExtendedBand;
  wordCount: number;
  sentenceCount: number;
  strengths: string[];
  improvements: WritingImprovementItem[];
  objectiveErrors: WritingImprovementItem[];
  stylisticSuggestions: WritingImprovementItem[];
  connectorsFound: string[];
}

export interface WritingSubmissionRecord {
  id: string;
  taskId: string;
  taskTitle: string;
  initialDraft: string;
  revisedDraft: string;
  initialScorePct: number;
  latestScorePct: number;
  evaluation: WritingEvaluationResult;
  revisionCount: number;
  updatedAt: string;
}

export interface EnglishPlacementSnapshot {
  id: string;
  completedAt: string;
  overallBand: CefrExtendedBand;
  overallScorePct: number;
  writingPromptScorePct: number | null;
  dimensionScores: Array<{
    dimension: PlacementDimensionId;
    label: string;
    scorePct: number;
    band: CefrExtendedBand;
  }>;
  strengths: string[];
  growthAreas: string[];
  startingLevelId: CurriculumLevelId;
  summaryNote: string;
}

export interface EnglishMistakeRecord {
  id: string;
  skill: AcademyWorkspaceId;
  itemTitle: string;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  recordedAt: string;
  reviewed: boolean;
}

export interface EarnedEnglishCertificate {
  id: string;
  examId: string;
  title: string;
  levelId: CurriculumLevelId;
  scorePct: number;
  earnedAt: string;
  disclaimer: string;
}

export interface DailyActivityCounters {
  dateKey: string;
  lessonsDone: number;
  vocabPracticed: number;
  listeningDone: number;
  writingDone: number;
}

export interface EnglishWorldState {
  placementSkipped: boolean;
  placementHistory: EnglishPlacementSnapshot[];
  lessonScores: Record<string, number>;
  completedLessons: string[];
  listeningScores: Record<string, number>;
  readingScores: Record<string, number>;
  grammarScores: Record<string, number>;
  speakingPracticed: string[];
  pronunciationPracticed: string[];
  vocabProgress: Record<string, VocabWordProgress>;
  personalNotebook: PersonalVocabEntry[];
  writingSubmissions: Record<string, WritingSubmissionRecord>;
  examScores: Record<string, number>;
  certificates: EarnedEnglishCertificate[];
  mistakes: EnglishMistakeRecord[];
  englishXp: number;
  lastActiveDate: string | null;
  streakDays: number;
  dailyCounters: DailyActivityCounters;
  claimedMissionDates: string[];
}

export function todayIsoDateKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function createInitialEnglishWorldState(now = new Date()): EnglishWorldState {
  return {
    placementSkipped: false,
    placementHistory: [],
    lessonScores: {},
    completedLessons: [],
    listeningScores: {},
    readingScores: {},
    grammarScores: {},
    speakingPracticed: [],
    pronunciationPracticed: [],
    vocabProgress: {},
    personalNotebook: [],
    writingSubmissions: {},
    examScores: {},
    certificates: [],
    mistakes: [],
    englishXp: 0,
    lastActiveDate: null,
    streakDays: 0,
    dailyCounters: {
      dateKey: todayIsoDateKey(now),
      lessonsDone: 0,
      vocabPracticed: 0,
      listeningDone: 0,
      writingDone: 0,
    },
    claimedMissionDates: [],
  };
}

export function normalizeEnglishWorldState(
  raw: Partial<EnglishWorldState> | undefined | null,
): EnglishWorldState {
  const base = createInitialEnglishWorldState();
  if (!raw || typeof raw !== "object") return base;
  return {
    ...base,
    ...raw,
    placementSkipped: Boolean(raw.placementSkipped),
    placementHistory: Array.isArray(raw.placementHistory) ? raw.placementHistory : [],
    lessonScores: raw.lessonScores && typeof raw.lessonScores === "object" ? raw.lessonScores : {},
    completedLessons: Array.isArray(raw.completedLessons) ? raw.completedLessons : [],
    listeningScores:
      raw.listeningScores && typeof raw.listeningScores === "object" ? raw.listeningScores : {},
    readingScores:
      raw.readingScores && typeof raw.readingScores === "object" ? raw.readingScores : {},
    grammarScores:
      raw.grammarScores && typeof raw.grammarScores === "object" ? raw.grammarScores : {},
    speakingPracticed: Array.isArray(raw.speakingPracticed) ? raw.speakingPracticed : [],
    pronunciationPracticed: Array.isArray(raw.pronunciationPracticed)
      ? raw.pronunciationPracticed
      : [],
    vocabProgress:
      raw.vocabProgress && typeof raw.vocabProgress === "object" ? raw.vocabProgress : {},
    personalNotebook: Array.isArray(raw.personalNotebook) ? raw.personalNotebook : [],
    writingSubmissions:
      raw.writingSubmissions && typeof raw.writingSubmissions === "object"
        ? raw.writingSubmissions
        : {},
    examScores: raw.examScores && typeof raw.examScores === "object" ? raw.examScores : {},
    certificates: Array.isArray(raw.certificates) ? raw.certificates : [],
    mistakes: Array.isArray(raw.mistakes) ? raw.mistakes : [],
    englishXp: typeof raw.englishXp === "number" ? Math.max(0, raw.englishXp) : 0,
    lastActiveDate: typeof raw.lastActiveDate === "string" ? raw.lastActiveDate : null,
    streakDays: typeof raw.streakDays === "number" ? Math.max(0, raw.streakDays) : 0,
    dailyCounters:
      raw.dailyCounters && typeof raw.dailyCounters === "object"
        ? {
            dateKey:
              typeof raw.dailyCounters.dateKey === "string"
                ? raw.dailyCounters.dateKey
                : base.dailyCounters.dateKey,
            lessonsDone: Number(raw.dailyCounters.lessonsDone ?? 0) || 0,
            vocabPracticed: Number(raw.dailyCounters.vocabPracticed ?? 0) || 0,
            listeningDone: Number(raw.dailyCounters.listeningDone ?? 0) || 0,
            writingDone: Number(raw.dailyCounters.writingDone ?? 0) || 0,
          }
        : base.dailyCounters,
    claimedMissionDates: Array.isArray(raw.claimedMissionDates) ? raw.claimedMissionDates : [],
  };
}

export function scoreToExtendedCefrBand(scorePct: number): CefrExtendedBand {
  if (scorePct >= 95) return "C2";
  if (scorePct >= 85) return "C1";
  if (scorePct >= 72) return "B2";
  if (scorePct >= 56) return "B1";
  if (scorePct >= 40) return "A2";
  if (scorePct >= 22) return "A1";
  return "Pre-A1";
}

export function cefrBandToCurriculumLevel(band: CefrExtendedBand): CurriculumLevelId {
  if (band === "Pre-A1") return "foundation";
  if (band === "C1" || band === "C2") return "C1_C2";
  return band;
}

export function gradeLessonExercise(
  exercise: Pick<LessonExercise, "kind" | "correctIndex" | "acceptedAnswers">,
  response: { selectedIndex?: number | null; textAnswer?: string },
): boolean {
  if (exercise.kind === "mcq" || exercise.kind === "true_false") {
    return (
      typeof response.selectedIndex === "number" && response.selectedIndex === exercise.correctIndex
    );
  }
  const normalized = (response.textAnswer ?? "")
    .trim()
    .toLowerCase()
    .replace(/[.!?,;:'"]+/g, "")
    .replace(/\s+/g, " ");
  if (!normalized) return false;
  return (exercise.acceptedAnswers ?? []).some(
    (ans) =>
      ans
        .trim()
        .toLowerCase()
        .replace(/[.!?,;:'"]+/g, "") === normalized,
  );
}

/* -------------------------------------------------------------------------- */
/* CONSTRUCTIVE WRITING ANALYZER                                              */
/* -------------------------------------------------------------------------- */

const DISCOURSE_CONNECTORS = [
  "first",
  "second",
  "finally",
  "because",
  "since",
  "however",
  "although",
  "while",
  "whereas",
  "therefore",
  "consequently",
  "for example",
  "for instance",
  "in addition",
  "furthermore",
  "moreover",
  "in conclusion",
  "in summary",
  "admittedly",
  "nevertheless",
];

export function evaluateWritingSubmission(
  text: string,
  options: {
    minWords: number;
    maxWords: number;
    requiredKeywords?: string[];
    level?: CefrExtendedBand;
  },
): WritingEvaluationResult {
  const cleaned = text.trim();
  const words = cleaned ? cleaned.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  const sentences = cleaned
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const sentenceCount = sentences.length;

  const lower = cleaned.toLowerCase();
  const connectorsFound = DISCOURSE_CONNECTORS.filter((c) => {
    const escaped = c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(lower);
  });

  const requiredKeywords = options.requiredKeywords ?? [];
  const matchedKeywords = requiredKeywords.filter((kw) => lower.includes(kw.toLowerCase()));

  const startsCapitalCount = sentences.filter((s) => /^[A-Z]/.test(s)).length;
  const endsWithPunctuation = /[.!?]$/.test(cleaned);
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : wordCount;

  // Detect over-repeated content words (length >= 4)
  const wordFreq = new Map<string, number>();
  for (const rawWord of words) {
    const w = rawWord.toLowerCase().replace(/[^a-z']/g, "");
    if (w.length >= 4) {
      wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1);
    }
  }
  const overusedWords = Array.from(wordFreq.entries())
    .filter(([, count]) => count >= 4 && wordCount < 100)
    .map(([w]) => w);

  let score = 0;
  // Length score (30 pts)
  if (wordCount >= options.minWords && wordCount <= options.maxWords + 25) {
    score += 30;
  } else if (wordCount >= Math.floor(options.minWords * 0.65)) {
    score += 20;
  } else if (wordCount >= 10) {
    score += 10;
  }

  // Sentence structure & punctuation mechanics (30 pts)
  if (sentenceCount >= 2 && startsCapitalCount === sentenceCount) score += 15;
  else if (startsCapitalCount > 0) score += 8;

  if (endsWithPunctuation) score += 10;
  if (avgWordsPerSentence >= 5 && avgWordsPerSentence <= 28) score += 5;

  // Cohesion & connectors (20 pts)
  if (connectorsFound.length >= 2) score += 20;
  else if (connectorsFound.length === 1) score += 12;

  // Prompt coverage / keywords (20 pts)
  if (requiredKeywords.length === 0) {
    score += wordCount >= options.minWords ? 20 : 10;
  } else {
    score += Math.round((matchedKeywords.length / requiredKeywords.length) * 20);
  }

  score = Math.min(100, Math.max(0, score));

  const strengths: string[] = [];
  const improvements: WritingImprovementItem[] = [];

  if (wordCount >= options.minWords) {
    strengths.push(
      `Target length reached (${wordCount} words — sufficient detail to develop your points).`,
    );
  } else {
    improvements.push({
      category: "Development & Length",
      issue: `Your draft currently has ${wordCount} words (recommended target: ${options.minWords}–${options.maxWords} words).`,
      whyItMatters:
        "Short drafts leave your main point without enough supporting reasons or examples.",
      howToImprove:
        "Add 1–2 concrete examples using 'For example,' or explain 'why' using 'because'.",
    });
  }

  if (sentenceCount >= 2 && startsCapitalCount === sentenceCount && endsWithPunctuation) {
    strengths.push(`Clean sentence mechanics (${sentenceCount} well-punctuated sentences).`);
  } else {
    if (startsCapitalCount < sentenceCount) {
      improvements.push({
        category: "Capitalization",
        issue: "One or more sentences do not begin with a capital letter.",
        whyItMatters: "Capital letters signal exact sentence boundaries clearly to readers.",
        howToImprove:
          "Check the first letter right after every period, question mark, or start of line.",
      });
    }
    if (!endsWithPunctuation && wordCount > 0) {
      improvements.push({
        category: "Punctuation",
        issue: "Your final sentence is missing ending punctuation (. ! ?).",
        whyItMatters: "A closing period marks completion and keeps formal writing polished.",
        howToImprove: "Add a period (.) cleanly at the end of your last sentence.",
      });
    }
    if (sentenceCount <= 1 && wordCount > 28) {
      improvements.push({
        category: "Run-On Prevention",
        issue: "All ideas appear inside one very long sentence.",
        whyItMatters: "Breaking long thoughts into focused sentences boosts clarity and tone.",
        howToImprove: "Split clauses into separate sentences separated by periods and connectors.",
      });
    }
  }

  if (connectorsFound.length >= 2) {
    strengths.push(
      `Strong cohesive flow using connectors (${connectorsFound.slice(0, 4).join(", ")}).`,
    );
  } else {
    improvements.push({
      category: "Cohesion & Transitions",
      issue:
        connectorsFound.length === 0
          ? "No explicit transition connectors detected yet."
          : `Only one transition connector found (${connectorsFound[0]}).`,
      whyItMatters: "Signposts help readers follow cause, contrast, and sequence smoothly.",
      howToImprove:
        "Link your points with 'First,', 'Because', 'For example,', 'However,', or 'In conclusion,'.",
    });
  }

  if (requiredKeywords.length > 0) {
    const missingKeywords = requiredKeywords.filter((k) => !matchedKeywords.includes(k));
    if (missingKeywords.length === 0) {
      strengths.push("Addressed all core prompt elements cleanly.");
    } else {
      improvements.push({
        category: "Prompt Alignment",
        issue: `Consider explicitly addressing: ${missingKeywords.join(", ")}.`,
        whyItMatters: "Connecting directly to key terms shows complete task fulfillment.",
        howToImprove: `Weave natural sentences involving ${missingKeywords.join(" and ")} into your body text.`,
      });
    }
  }

  if (overusedWords.length > 0) {
    improvements.push({
      category: "Vocabulary Variety",
      issue: `Repeated '${overusedWords[0]}' frequently in a short passage.`,
      whyItMatters: "Replacing repeated terms with synonyms elevates precision and style.",
      howToImprove: `Try substituting a synonym or pronoun for '${overusedWords[0]}' in one or two sentences.`,
    });
  }

  // Active Spelling & Typo Correction Detector (detects intentional or unintentional spelling errors)
  const COMMON_MISSPELLINGS: Record<string, string> = {
    yestarday: "yesterday",
    techer: "teacher",
    recieve: "receive",
    beautifull: "beautiful",
    frind: "friend",
    becuz: "because",
    tomororw: "tomorrow",
    definatly: "definitely",
    skool: "school",
    cheep: "cheap",
    writng: "writing",
    studyd: "studied",
    enviroment: "environment",
    governmet: "government",
    neccessary: "necessary",
  };
  const wordsLower = cleaned.toLowerCase().split(/\s+/);
  const detectedTypos: string[] = [];
  for (const [typo, correct] of Object.entries(COMMON_MISSPELLINGS)) {
    if (wordsLower.includes(typo)) {
      detectedTypos.push(`'${typo}' -> '${correct}'`);
    }
  }

  if (detectedTypos.length > 0) {
    score = Math.max(0, score - detectedTypos.length * 10);
    improvements.push({
      category: "Spelling & Vocabulary Correction",
      issue: `Spelling error(s) detected: ${detectedTypos.join(", ")}.`,
      whyItMatters: "Correct spelling and word form ensure professional, clear communication.",
      howToImprove:
        "Review the flagged words above and replace them with standard correct spellings.",
    });
  }

  if (strengths.length === 0 && wordCount > 0) {
    strengths.push(
      "Good initial effort putting ideas into English text—ready for structured revision.",
    );
  }

  const objectiveCategories = new Set([
    "Capitalization",
    "Punctuation",
    "Run-On Prevention",
    "Spelling & Vocabulary Correction",
  ]);
  const objectiveErrors = improvements.filter((item) => objectiveCategories.has(item.category));
  const stylisticSuggestions = improvements.filter(
    (item) => !objectiveCategories.has(item.category),
  );

  return {
    scorePct: score,
    readinessBand: scoreToExtendedCefrBand(score),
    wordCount,
    sentenceCount,
    strengths,
    improvements,
    objectiveErrors,
    stylisticSuggestions,
    connectorsFound,
  };
}

/* -------------------------------------------------------------------------- */
/* MULTI-PRACTICE VOCABULARY MASTERY ENGINE                                   */
/* -------------------------------------------------------------------------- */

export function recordVocabPractice(
  currentMap: Record<string, VocabWordProgress>,
  input: {
    wordId: string;
    word: string;
    mode: string;
    accurate: boolean;
    nowIso?: string;
  },
): VocabWordProgress {
  const nowIso = input.nowIso ?? new Date().toISOString();
  const prev = currentMap[input.wordId];
  const prevModes = prev?.distinctModes ?? [];
  const nextModes =
    input.accurate && !prevModes.includes(input.mode) ? [...prevModes, input.mode] : prevModes;

  const attemptCount = (prev?.attemptCount ?? 0) + 1;
  const correctCount = (prev?.correctCount ?? 0) + (input.accurate ? 1 : 0);

  let status: VocabMasteryStatus;
  let reviewOffsetDays = 1;

  if (!input.accurate) {
    status = "needs_revision";
    reviewOffsetDays = 0;
  } else if (correctCount >= 2 && (nextModes.length >= 2 || correctCount >= 3)) {
    // STRICT: Never mastered from one isolated single practice!
    status = "mastered";
    reviewOffsetDays = 7;
  } else {
    status = "practicing";
    reviewOffsetDays = 2;
  }

  const nextReview = new Date(Date.parse(nowIso) + reviewOffsetDays * 86_400_000).toISOString();

  return {
    wordId: input.wordId,
    word: input.word,
    status,
    correctCount,
    attemptCount,
    distinctModes: nextModes,
    lastPracticedAt: nowIso,
    nextReviewAt: nextReview,
  };
}

/* -------------------------------------------------------------------------- */
/* PLACEMENT DIAGNOSTIC WITH PRE-A1..C2 & WRITING INTEGRATION                 */
/* -------------------------------------------------------------------------- */

export function evaluateExtendedPlacement(input: {
  mcqAnswers: Record<string, number>;
  writingSample?: string;
  basePlacement: SkillPlacementResult;
  nowIso?: string;
}): EnglishPlacementSnapshot {
  const nowIso = input.nowIso ?? new Date().toISOString();
  const totalQuestions = PLACEMENT_ASSESSMENT_QUESTIONS.length;
  const totalCorrect = PLACEMENT_ASSESSMENT_QUESTIONS.reduce(
    (acc, q) => (input.mcqAnswers[q.id] === q.correctIndex ? acc + 1 : acc),
    0,
  );
  const mcqPct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  let writingPromptScorePct: number | null = null;
  if (input.writingSample && input.writingSample.trim().length > 0) {
    const evalRes = evaluateWritingSubmission(input.writingSample, {
      minWords: 20,
      maxWords: 90,
      requiredKeywords: [],
    });
    writingPromptScorePct = evalRes.scorePct;
  }

  const blendedOverallPct =
    writingPromptScorePct !== null
      ? Math.round(mcqPct * 0.8 + writingPromptScorePct * 0.2)
      : mcqPct;

  const overallBand = scoreToExtendedCefrBand(blendedOverallPct);
  const startingLevelId = cefrBandToCurriculumLevel(overallBand);

  const dimensionScores = input.basePlacement.dimensions.map((d) => ({
    dimension: d.dimension,
    label: d.label,
    scorePct: d.scorePct,
    band: scoreToExtendedCefrBand(d.scorePct),
  }));

  const strengths = dimensionScores
    .filter((d) => d.scorePct >= 65)
    .map((d) => `${d.label} (${d.scorePct}% · ${d.band})`);
  const growthAreas = dimensionScores
    .filter((d) => d.scorePct < 65)
    .map((d) => `${d.label} (${d.scorePct}% · ${d.band})`);

  return {
    id: `pl-${nowIso}`,
    completedAt: nowIso,
    overallBand,
    overallScorePct: blendedOverallPct,
    writingPromptScorePct,
    dimensionScores,
    strengths: strengths.length > 0 ? strengths : ["Ready to build balanced foundation strengths"],
    growthAreas: growthAreas.length > 0 ? growthAreas : ["Advance toward C1–C2 academic nuance"],
    startingLevelId,
    summaryNote: `Informal ${BRAND.shortName} Placement Estimate: ${overallBand} (${blendedOverallPct}%). Recommended starting tier: ${startingLevelId}. Not an official external CEFR exam certificate.`,
  };
}

/* -------------------------------------------------------------------------- */
/* ADVENTURE MAP REGION PROGRESSION & UNLOCKS                                 */
/* -------------------------------------------------------------------------- */

export type RegionStatus = "locked" | "available" | "in_progress" | "completed";

export interface EvaluatedAdventureRegion {
  region: AdventureRegion;
  status: RegionStatus;
  completedLessonsCount: number;
  totalLessonsCount: number;
  progressPct: number;
  unmetPrerequisites: string[];
  reason: string;
}

export function isRegionConsideredCleared(
  region: AdventureRegion,
  state: EnglishWorldState,
): boolean {
  const hasCompletedLinkedLesson = region.lessonIds.some((id) =>
    state.completedLessons.includes(id),
  );
  if (hasCompletedLinkedLesson) return true;

  // Or demonstrated >=70% activity inside that academy directly!
  if (region.academyId === "listening") {
    return Object.values(state.listeningScores).some((s) => s >= 70);
  }
  if (region.academyId === "reading") {
    return Object.values(state.readingScores).some((s) => s >= 70);
  }
  if (region.academyId === "grammar") {
    return Object.values(state.grammarScores).some((s) => s >= 70);
  }
  if (region.academyId === "writing") {
    return Object.values(state.writingSubmissions).some((sub) => sub.latestScorePct >= 70);
  }
  if (region.academyId === "vocabulary") {
    const practicedCount = Object.values(state.vocabProgress).filter(
      (v) => v.correctCount >= 1,
    ).length;
    return practicedCount >= 3;
  }
  if (region.academyId === "speaking") {
    return state.speakingPracticed.length >= 1;
  }
  if (region.academyId === "pronunciation") {
    return state.pronunciationPracticed.length >= 1;
  }
  return false;
}

export function evaluateAdventureMapState(state: EnglishWorldState): EvaluatedAdventureRegion[] {
  const clearedById = new Map<AdventureRegionId, boolean>();
  for (const r of ADVENTURE_REGIONS) {
    clearedById.set(r.id, isRegionConsideredCleared(r, state));
  }

  return ADVENTURE_REGIONS.map((region) => {
    const completedLessonsCount = region.lessonIds.filter((id) =>
      state.completedLessons.includes(id),
    ).length;
    const totalLessonsCount = region.lessonIds.length;
    const regionCleared = clearedById.get(region.id) ?? false;

    const unmetPrereqRegions = region.prerequisiteRegionIds.filter(
      (preId) => !clearedById.get(preId),
    );
    const unmetPrerequisites = unmetPrereqRegions.map(
      (id) => ADVENTURE_REGIONS.find((r) => r.id === id)?.name ?? id,
    );

    let status: RegionStatus;
    if (unmetPrerequisites.length > 0) {
      status = "locked";
    } else if (
      (totalLessonsCount > 0 && completedLessonsCount === totalLessonsCount) ||
      (totalLessonsCount === 0 && regionCleared)
    ) {
      status = "completed";
    } else if (completedLessonsCount > 0 || regionCleared) {
      status = "in_progress";
    } else {
      status = "available";
    }

    const progressPct =
      totalLessonsCount > 0
        ? Math.min(
            100,
            Math.round(
              ((completedLessonsCount + (regionCleared && completedLessonsCount === 0 ? 0.5 : 0)) /
                totalLessonsCount) *
                100,
            ),
          )
        : regionCleared
          ? 100
          : 0;

    const reason =
      status === "locked"
        ? `Locked — ${region.unlockHint}`
        : status === "completed"
          ? "Completed! Open anytime to revise or practice deeper drills."
          : status === "in_progress"
            ? "In progress — finish remaining region lessons to master fully."
            : "Ready to explore — enter this region to begin!";

    return {
      region,
      status,
      completedLessonsCount,
      totalLessonsCount,
      progressPct,
      unmetPrerequisites,
      reason,
    };
  });
}

/* -------------------------------------------------------------------------- */
/* PERSONALIZED RECOMMENDATION ENGINE                                         */
/* -------------------------------------------------------------------------- */

export interface EnglishRecommendation {
  id: string;
  title: string;
  targetSurface: "placement" | "lesson" | AcademyWorkspaceId;
  targetItemId?: string;
  priority: "high" | "medium";
  whyRecommended: string;
  actionLabel: string;
  xpReward: number;
}

export function computeEnglishRecommendations(state: EnglishWorldState): EnglishRecommendation[] {
  const recs: EnglishRecommendation[] = [];
  const latestPlacement =
    state.placementHistory.length > 0
      ? state.placementHistory[state.placementHistory.length - 1]
      : null;

  // 1. If placement hasn't been taken yet (even if skipped gently recommend taking it)
  if (!latestPlacement) {
    recs.push({
      id: "rec-placement",
      title: state.placementSkipped
        ? "Complete Your Diagnostic Placement When Ready"
        : "Discover Your Starting Level (Pre-A1 to C2)",
      targetSurface: "placement",
      priority: "high",
      whyRecommended: state.placementSkipped
        ? "You postponed placement earlier—taking the 5-dimension diagnostic unlocks sharper tailored lessons across Vocabulary, Reading, Listening, Writing, and Speaking."
        : "Helps calibrate which Curriculum Unit and Adventure Region match your current strengths and growth areas.",
      actionLabel: "Start Placement",
      xpReward: 30,
    });
  }

  // 2. Weakest dimension from placement -> prioritize direct skill academy
  if (latestPlacement) {
    const sortedDims = [...latestPlacement.dimensionScores].sort((a, b) => a.scorePct - b.scorePct);
    const weakest = sortedDims[0];
    if (weakest && weakest.scorePct < 75) {
      const targetAcademy: AcademyWorkspaceId =
        weakest.dimension === "listening"
          ? "listening"
          : weakest.dimension === "reading"
            ? "reading"
            : weakest.dimension === "writing"
              ? "writing"
              : weakest.dimension === "communication"
                ? "speaking"
                : "grammar";
      recs.push({
        id: `rec-dim-${weakest.dimension}`,
        title: `Strengthen ${weakest.label}`,
        targetSurface: targetAcademy,
        priority: "high",
        whyRecommended: `Recommended because your ${weakest.label} score on the placement diagnostic was ${weakest.scorePct}% (${weakest.band}).`,
        actionLabel: `Open ${targetAcademy[0]!.toUpperCase() + targetAcademy.slice(1)} Academy`,
        xpReward: 25,
      });
    }
  }

  // 3. Vocabulary words marked as "needs_revision"
  const revisionWords = Object.values(state.vocabProgress).filter(
    (v) => v.status === "needs_revision",
  );
  if (revisionWords.length > 0) {
    recs.push({
      id: "rec-vocab-revision",
      title: `Revise ${revisionWords.length} Challenging Vocabulary Word${revisionWords.length > 1 ? "s" : ""}`,
      targetSurface: "vocabulary",
      priority: "high",
      whyRecommended: `You recently missed '${revisionWords
        .slice(0, 3)
        .map((w) => w.word)
        .join("', '")}'. Short spaced revision converts hesitation into long-term recall.`,
      actionLabel: "Revise Words",
      xpReward: 20,
    });
  }

  // 4. Open unreviewed mistakes
  const unreviewedMistakes = state.mistakes.filter((m) => !m.reviewed);
  if (unreviewedMistakes.length > 0) {
    const firstMistake = unreviewedMistakes[0]!;
    recs.push({
      id: "rec-mistakes",
      title: `Review ${unreviewedMistakes.length} Recorded Skill Mistake${unreviewedMistakes.length > 1 ? "s" : ""}`,
      targetSurface: firstMistake.skill,
      priority: "medium",
      whyRecommended: `Recent mistake in '${firstMistake.itemTitle}' highlights a fixable rule—revisiting mistakes prevents repeating them in exams.`,
      actionLabel: "Practice Skill",
      xpReward: 15,
    });
  }

  // 5. Next uncompleted lesson in recommended level (or sequential path)
  const targetLevel: CurriculumLevelId = latestPlacement?.startingLevelId ?? "foundation";
  const nextInLevel =
    CURRICULUM_LESSONS.find(
      (l) => l.levelId === targetLevel && !state.completedLessons.includes(l.id),
    ) ?? CURRICULUM_LESSONS.find((l) => !state.completedLessons.includes(l.id));

  if (nextInLevel) {
    recs.push({
      id: `rec-lesson-${nextInLevel.id}`,
      title: `Lesson: ${nextInLevel.title}`,
      targetSurface: "lesson",
      targetItemId: nextInLevel.id,
      priority: "medium",
      whyRecommended: latestPlacement
        ? `Matches your ${nextInLevel.cefrLabel} learning plan inside ${nextInLevel.unitTitle}.`
        : `Ready-to-use guided ${nextInLevel.cefrLabel} lesson with examples, checks, and instant explanations.`,
      actionLabel: "Start Lesson",
      xpReward: nextInLevel.xpReward,
    });
  }

  // 6. If writing submissions exist with low score or none started yet -> suggest Writing Academy
  const writingList = Object.values(state.writingSubmissions);
  const weakWriting = writingList.find((w) => w.latestScorePct < 75);
  if (weakWriting) {
    recs.push({
      id: `rec-wrt-${weakWriting.taskId}`,
      title: `Revise Draft: ${weakWriting.taskTitle}`,
      targetSurface: "writing",
      targetItemId: weakWriting.taskId,
      priority: "medium",
      whyRecommended: `Your current draft scored ${weakWriting.latestScorePct}%. Applying the feedback hints can lift your cohesion and mechanics.`,
      actionLabel: "Revise Draft",
      xpReward: 20,
    });
  } else if (writingList.length === 0) {
    const starterTask = WRITING_TASKS[0]!;
    recs.push({
      id: "rec-wrt-start",
      title: `Try Guided Writing: ${starterTask.title}`,
      targetSurface: "writing",
      targetItemId: starterTask.id,
      priority: "medium",
      whyRecommended:
        "You haven't completed a Writing Academy feedback & revision cycle yet—active writing accelerates grammar mastery.",
      actionLabel: "Open Writing",
      xpReward: 25,
    });
  }

  return recs.slice(0, 4);
}

/* -------------------------------------------------------------------------- */
/* DAILY MISSIONS & STREAK HELPERS                                            */
/* -------------------------------------------------------------------------- */

export function syncDailyCountersForDate(
  state: EnglishWorldState,
  now = new Date(),
): EnglishWorldState {
  const key = todayIsoDateKey(now);
  if (state.dailyCounters.dateKey === key) return state;
  return {
    ...state,
    dailyCounters: {
      dateKey: key,
      lessonsDone: 0,
      vocabPracticed: 0,
      listeningDone: 0,
      writingDone: 0,
    },
  };
}

export function touchEnglishStreak(state: EnglishWorldState, now = new Date()): EnglishWorldState {
  const today = todayIsoDateKey(now);
  if (state.lastActiveDate === today) return state;
  const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
  const nextStreak = state.lastActiveDate === yesterday ? state.streakDays + 1 : 1;
  return {
    ...state,
    lastActiveDate: today,
    streakDays: nextStreak,
  };
}

export function computeDailyMissionProgress(state: EnglishWorldState) {
  const key = todayIsoDateKey();
  const counters =
    state.dailyCounters.dateKey === key
      ? state.dailyCounters
      : { dateKey: key, lessonsDone: 0, vocabPracticed: 0, listeningDone: 0, writingDone: 0 };

  return DAILY_ENGLISH_MISSIONS.map((m) => {
    const current =
      m.targetType === "lesson"
        ? counters.lessonsDone
        : m.targetType === "vocab"
          ? counters.vocabPracticed
          : m.targetType === "listening"
            ? counters.listeningDone
            : counters.writingDone;
    const completed = current >= m.targetCount;
    const claimKey = `${key}:${m.id}`;
    const claimed = state.claimedMissionDates.includes(claimKey);
    return {
      mission: m,
      current: Math.min(current, m.targetCount),
      completed,
      claimed,
      claimKey,
    };
  });
}

export function computeDashboardSummary(state: EnglishWorldState) {
  const vocabList = Object.values(state.vocabProgress);
  const masteredWordsCount = vocabList.filter((v) => v.status === "mastered").length;
  const practicingWordsCount = vocabList.filter((v) => v.status === "practicing").length;
  const revisionWordsCount = vocabList.filter((v) => v.status === "needs_revision").length;

  const latestPlacement =
    state.placementHistory.length > 0
      ? state.placementHistory[state.placementHistory.length - 1]
      : null;

  const avg = (nums: number[]) =>
    nums.length > 0 ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;

  const skillBreakdown: Array<{ skill: AcademyWorkspaceId; label: string; scorePct: number }> = [
    { skill: "listening", label: "Listening", scorePct: avg(Object.values(state.listeningScores)) },
    { skill: "reading", label: "Reading", scorePct: avg(Object.values(state.readingScores)) },
    {
      skill: "writing",
      label: "Writing",
      scorePct: avg(Object.values(state.writingSubmissions).map((w) => w.latestScorePct)),
    },
    {
      skill: "grammar",
      label: "Grammar",
      scorePct: Math.round(
        (Object.keys(state.grammarScores).length / Math.max(1, GRAMMAR_TOPICS.length)) *
          Math.max(avg(Object.values(state.grammarScores)), 70),
      ),
    },
    {
      skill: "vocabulary",
      label: "Vocabulary",
      scorePct: Math.min(100, masteredWordsCount * 10 + practicingWordsCount * 4),
    },
    {
      skill: "speaking",
      label: "Speaking",
      scorePct: Math.min(100, state.speakingPracticed.length * 20),
    },
    {
      skill: "pronunciation",
      label: "Pronunciation",
      scorePct: Math.min(100, state.pronunciationPracticed.length * 20),
    },
  ];

  const unlockedExamsCount = LEVEL_MASTERY_EXAMS.filter(
    (e) => (state.examScores[e.id] ?? 0) >= e.passingPct,
  ).length;

  return {
    latestPlacement,
    currentCefrBand: latestPlacement?.overallBand ?? "Not assessed yet",
    completedLessonsCount: state.completedLessons.length,
    totalLessonsCount: CURRICULUM_LESSONS.length,
    masteredWordsCount,
    practicingWordsCount,
    revisionWordsCount,
    personalNotebookCount: state.personalNotebook.length,
    certificatesCount: state.certificates.length,
    unlockedExamsCount,
    skillBreakdown,
    openMistakesCount: state.mistakes.filter((m) => !m.reviewed).length,
  };
}
