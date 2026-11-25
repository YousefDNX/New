import { useSyncExternalStore } from "react";
import { createInitialAdventureState, type AdventureWorldState } from "@/lib/adventure-engine";
import type { SkillPlacementResult } from "@/lib/skill-academy";
import {
  createInitialEnglishWorldState,
  normalizeEnglishWorldState,
  type EnglishWorldState,
} from "@/lib/english-world";
import {
  defaultSmartPlannerConfig,
  type SmartPlannerConfig,
  type SmartStudyBlock,
} from "@/lib/study-planner";
import type {
  ContentErrorReport,
  ResourceStatusOverride,
  VolunteerContributionRecord,
} from "@/lib/legacy-knowledge";
import {
  INITIAL_ARCHIVE_PRESERVATION_RECORDS,
  INITIAL_COMMUNITY_LIBRARY_RESOURCES,
  INITIAL_KNOWLEDGE_LEGACY_CONTRIBUTIONS,
  INITIAL_REAL_WORLD_GOOD_PROJECTS,
  INITIAL_TEACHING_GUIDES,
  type ArchivePreservationRecord,
  type CommunityLibraryResource,
  type KnowledgeLegacyContribution,
  type RealWorldProjectRecord,
  type TeachingGuideRecord,
} from "@/data/open-learning-library";
import {
  INITIAL_FAMILY_KNOWLEDGE_RECORDS,
  INITIAL_TRUTH_DEFENDER_CLAIMS,
  INITIAL_UNIVERSAL_BENEFIT_REGISTRY,
  type EarthCareProjectRecord,
  type FamilyKnowledgeRecord,
  type TruthEvaluationItem,
  type UniversalBenefitResource,
} from "@/data/humanity-first";

export interface TypingSessionLog {
  id: string;
  drillId: string;
  title: string;
  wpm: number;
  accuracyPct: number;
  deviceMode?: "desktop" | "mobile";
  date: string;
}

export interface KnowledgeLibraryEntry {
  id: string;
  title: string;
  subject: string;
  sourceType: "summary" | "transformed" | "offline_pack" | "tutor_note" | "feynman";
  content: string;
  tags: string[];
  pinnedOffline: boolean;
  createdAt: string;
}

export interface StudentPortfolioProject {
  id: string;
  title: string;
  category: string;
  summary: string;
  stepsCompleted: number;
  totalSteps: number;
  showcaseOptIn: boolean;
  createdAt: string;
}

export interface ExamSimulatorAttempt {
  id: string;
  subject: string;
  correct: number;
  total: number;
  scorePct: number;
  weakTopics: string[];
  date: string;
}

export interface CreativeProjectRecord {
  id: string;
  kind: "infographic" | "story" | "animation" | "music";
  title: string;
  summary: string;
  updatedAt: string;
}

export interface NoteRevisionRecord {
  id: string;
  title: string;
  content: string;
  savedAt: string;
}

export interface NoteLinkRecord {
  sourceId: string;
  targetId: string;
  reason: string;
  approved: boolean;
}

export interface CustomTimelineEvent {
  id: string;
  title: string;
  yearLabel: string;
  category: string;
  description: string;
}

export interface GlossaryTermRecord {
  id: string;
  term: string;
  subject: string;
  definition: string;
  example: string;
  mastered: boolean;
}

export interface MunDraftRecord {
  id: string;
  country: string;
  committee: string;
  topic: string;
  positionPaper: string;
  clauses: string[];
  updatedAt: string;
}

export interface CommunityProjectRecord {
  id: string;
  title: string;
  need: string;
  intendedBeneficiaries?: string;
  measuredOutcome?: string;
  supervisorName: string;
  adultSupervised: boolean;
  milestones: Array<{ title: string; done: boolean }>;
  impactReflection: string;
  createdAt: string;
}

export interface ScienceFairProjectRecord {
  id: string;
  title: string;
  question: string;
  hypothesis: string;
  safeMaterials: string;
  safeProcedure: string;
  observations: string;
  conclusion: string;
  createdAt: string;
}

export interface DebateEthicsLogRecord {
  id: string;
  kind: "debate" | "ethics" | "argument" | "decision" | "media_audit" | "logic";
  topic: string;
  stance: string;
  summary: string;
  createdAt: string;
}

export interface CodingSnippetRecord {
  id: string;
  title: string;
  code: string;
  output: string;
  updatedAt: string;
}

export interface EducatorTemplateRecord {
  id: string;
  title: string;
  subject: string;
  objectives: string;
  assignmentPrompt: string;
  updatedAt: string;
}

export type BookReadingStatus = "want_to_read" | "reading" | "finished";

export type SourceReliabilityTier = "peer_reviewed" | "primary" | "secondary" | "unverified";

export interface ResearchEvidenceEntry {
  id: string;
  claim: string;
  sourceTitle: string;
  yearOrUrl: string;
  reliability: SourceReliabilityTier;
  stance: "supporting" | "contradicting" | "neutral";
}

export interface ResearchProjectRecord {
  id: string;
  title: string;
  researchQuestion: string;
  hypothesis: string;
  scope: string;
  evidenceItems: ResearchEvidenceEntry[];
  checklistDone: string[];
  createdAt: string;
}

export interface ResearchCitationRecord {
  id: string;
  author: string;
  year: string;
  title: string;
  container: string;
  url: string;
  reliability: SourceReliabilityTier;
  style: "APA" | "MLA" | "Chicago";
  formatted: string;
  createdAt: string;
}

export interface EngineeringPrototypeSpec {
  id: string;
  title: string;
  problemStatement: string;
  constraints: string;
  targetMetric: string;
  materialsSafeNote: string;
  testProtocol: string;
  savedToPortfolio: boolean;
  createdAt: string;
}

export interface StudyCoachingReflection {
  id: string;
  subject: string;
  goal: string;
  obstacle: string;
  realisticAdjustment: string;
  reflection: string;
  createdAt: string;
}

export interface PrivateWorshipChecklistState {
  dateIso: string;
  completedKeys: string[];
  note: string;
}

export interface MartialArtsDojoState {
  codeAcknowledged: boolean;
  codeAcknowledgedAt: string | null;
  completedPaths: string[];
  completedTopics: string[];
  completedScenarios: string[];
  quizAttempts: Array<{
    id: string;
    quizId: string;
    scorePct: number;
    correctCount: number;
    totalCount: number;
    createdAt: string;
  }>;
  humanityChallengesDone: string[];
  savedDisciplineIds: string[];
  personalGoal: string;
  preferredRoleModels: string[];
  characterPillars: Record<string, number>;
}

export interface StudentEcosystemState {
  placement: SkillPlacementResult | null;
  completedSkillLessons: string[];
  skillMasteryScores: Record<string, number>;
  activeLearningPathId: string;
  viewedPathSteps: string[];
  masteredPathSteps: string[];
  pathStepScores: Record<string, number>;
  typingHistory: TypingSessionLog[];
  completedPracticalExercises: string[];
  adventure: AdventureWorldState;
  masteredKnowledgeNodes: string[];
  knowledgeLibrary: KnowledgeLibraryEntry[];
  qotdAnsweredDates: string[];
  qotdCorrectDates: string[];
  completedKnowledgeChallenges: string[];
  examHistory: ExamSimulatorAttempt[];
  portfolio: {
    headline: string;
    bio: string;
    projects: StudentPortfolioProject[];
  };
  universityPrep: {
    targetMajor: string;
    targetRegion: string;
    checklistDone: string[];
    essayHook: string;
    essayImpact: string;
  };
  // Prompt 2 Advanced Experiences State
  completedSimulations: string[];
  codingExercisesSolved: string[];
  savedCodeSnippets: CodingSnippetRecord[];
  creativeProjects: CreativeProjectRecord[];
  noteRevisions: Record<string, NoteRevisionRecord[]>;
  noteLinks: NoteLinkRecord[];
  customTimelines: CustomTimelineEvent[];
  glossaryTerms: GlossaryTermRecord[];
  munDrafts: MunDraftRecord[];
  communityProjects: CommunityProjectRecord[];
  scienceFairProjects: ScienceFairProjectRecord[];
  bookReadingList: Record<string, BookReadingStatus>;
  bookNotes: Record<string, string>;
  debateAndEthicsLogs: DebateEthicsLogRecord[];
  teacherDrafts: EducatorTemplateRecord[];
  englishWorld: EnglishWorldState;
  // Ultimate Student Empowerment Expansion Slices
  resolvedGapIds: string[];
  smartPlannerConfig: SmartPlannerConfig;
  smartPlannerBlocks: SmartStudyBlock[];
  smartPlannerFocusLogs: Array<{
    id: string;
    title: string;
    subject: string | null;
    duration_minutes: number;
    completed: boolean;
    created_at: string;
  }>;
  curriculumSelection: {
    country: string;
    grade: string;
    subject: string;
  };
  dnaPreferences: {
    preferredSessionMin: number;
    preferredExplanationStyle: string;
    learningPace: "gentle" | "balanced" | "intensive";
    allowAdaptiveInsights: boolean;
  };
  completedRealChallenges: Record<
    string,
    {
      reflection: string;
      evidenceSummary: string;
      completedAt: string;
    }
  >;
  completedLiteracyModules: string[];
  offlinePacksDownloaded: string[];
  offlineSyncQueue: Array<{
    id: string;
    kind:
      | "task_done"
      | "flashcard_review"
      | "gap_resolved"
      | "challenge_log"
      | "offline_lesson_complete";
    label: string;
    payload: Record<string, unknown>;
    queuedAt: string;
  }>;
  reportPrivacy: {
    shareMasteryBreakdown: boolean;
    shareGapSummary: boolean;
    sharePortfolioArtifacts: boolean;
    shareMilestones: boolean;
  };
  // NEXORA Global Empowerment Master Expansion Slices
  zeroToHeroProgress: Record<string, number[]>;
  literacyTrackProgress: {
    completedModuleIds: string[];
    readAloudCount: number;
  };
  financialLab: {
    completedScenarios: string[];
    monthlyAllowance: number;
    savingsGoalAmount: number;
    monthlySavings: number;
    expenses: Array<{
      id: string;
      label: string;
      amount: number;
      category: "needs" | "wants" | "savings";
    }>;
  };
  problemSolvingLogs: Array<{
    id: string;
    challengeId: string;
    title: string;
    stepsDone: number;
    hypothesis: string;
    verificationNote: string;
    reflection: string;
    createdAt: string;
  }>;
  experimentDesigns: Array<{
    id: string;
    title: string;
    iv: string;
    dv: string;
    controls: string[];
    materials: string;
    trials: Array<{ label: string; value: number }>;
    hazardChecked: boolean;
    conclusion: string;
    createdAt: string;
  }>;
  simplifiedPapers: Array<{
    id: string;
    title: string;
    question: string;
    method: string;
    findings: string;
    limitations: string;
    createdAt: string;
  }>;
  studyMatcher: {
    subjects: string[];
    gradeBand: string;
    preferredPace: "gentle" | "balanced" | "intensive";
    language: string;
    goalNote: string;
    joinedCohortIds: string[];
    blockedCohortIds: string[];
    reportedCohortIds: string[];
  };
  weeklyChallengeLogs: Record<
    string,
    {
      weekKey: string;
      answerIndex: number;
      correct: boolean;
      reflection: string;
      submittedAt: string;
    }
  >;
  communityKnowledgeEntries: Array<{
    id: string;
    title: string;
    subject: string;
    grade: string;
    summary: string;
    steps: string[];
    authorAlias: string;
    status: "pending_review" | "approved" | "flagged";
    votes: number;
    createdAt: string;
  }>;
  smartClassrooms: {
    joinedCodes: string[];
    completedAssignmentIds: string[];
    createdClassrooms: Array<{
      id: string;
      code: string;
      title: string;
      subject: string;
      grade: string;
      teacherAlias: string;
      announcement: string;
      assignments: Array<{
        id: string;
        title: string;
        dueLabel: string;
        kind: "quiz" | "reading" | "project";
        targetRoute: string;
      }>;
    }>;
  };
  // NEXORA Legacy of Knowledge & Continuity Slices
  foundationalPathProgress: Record<string, string[]>;
  contentErrorReports: ContentErrorReport[];
  resourceStatusOverrides: Record<string, ResourceStatusOverride>;
  volunteerContributions: VolunteerContributionRecord[];
  legacyBackupMeta: {
    lastExportedAt: string | null;
    lastChecksum: string | null;
  };
  // Six Legacy Initiatives Platform-Wide Slices
  communityResources: CommunityLibraryResource[];
  teachingGuides: TeachingGuideRecord[];
  downloadedOfflinePackIds: string[];
  lowDataModeActive: boolean;
  legacyContributions: KnowledgeLegacyContribution[];
  realWorldGoodProjects: RealWorldProjectRecord[];
  archivedPreservationRecords: ArchivePreservationRecord[];
  // Global Learning Ecosystem Phase 2 Slices
  researchProjects: ResearchProjectRecord[];
  researchCitations: ResearchCitationRecord[];
  engineeringSpecs: EngineeringPrototypeSpec[];
  coachingReflections: StudyCoachingReflection[];
  privateWorshipChecklist: PrivateWorshipChecklistState;
  // Humanity First & Universal Benefit Continuity Slices
  universalBenefitResources: UniversalBenefitResource[];
  earthCareProjects: EarthCareProjectRecord[];
  digitalProtectionChecklistChecked: string[];
  familyKnowledgeRecords: FamilyKnowledgeRecord[];
  truthEvaluations: TruthEvaluationItem[];
  goodCharacterReflections: Record<
    string,
    { lastReflectedDate: string; reflectionNote: string; voluntaryGoalCommitted: boolean }
  >;
  martialArtsDojo: MartialArtsDojoState;
}

export function createInitialStudentEcosystemState(): StudentEcosystemState {
  return {
    placement: null,
    completedSkillLessons: [],
    skillMasteryScores: {},
    activeLearningPathId: "path_g9_english",
    viewedPathSteps: [],
    masteredPathSteps: [],
    pathStepScores: {},
    typingHistory: [],
    completedPracticalExercises: [],
    adventure: createInitialAdventureState(),
    masteredKnowledgeNodes: ["kn_vocab_context"],
    knowledgeLibrary: [],
    qotdAnsweredDates: [],
    qotdCorrectDates: [],
    completedKnowledgeChallenges: [],
    examHistory: [],
    portfolio: {
      headline: "Student Builder & Independent Learner",
      bio: "Documenting verified projects, practical skills, and academic growth.",
      projects: [],
    },
    universityPrep: {
      targetMajor: "Computer Science & Engineering",
      targetRegion: "Kuwait & International Universities",
      checklistDone: [],
      essayHook: "",
      essayImpact: "",
    },
    completedSimulations: [],
    codingExercisesSolved: [],
    savedCodeSnippets: [],
    creativeProjects: [],
    noteRevisions: {},
    noteLinks: [],
    customTimelines: [],
    glossaryTerms: [],
    munDrafts: [],
    communityProjects: [],
    scienceFairProjects: [],
    bookReadingList: {},
    bookNotes: {},
    debateAndEthicsLogs: [],
    teacherDrafts: [],
    englishWorld: createInitialEnglishWorldState(),
    resolvedGapIds: [],
    smartPlannerConfig: defaultSmartPlannerConfig(),
    smartPlannerBlocks: [],
    smartPlannerFocusLogs: [],
    curriculumSelection: {
      country: "Kuwait / GCC",
      grade: "Grade 9",
      subject: "English",
    },
    dnaPreferences: {
      preferredSessionMin: 25,
      preferredExplanationStyle: "visual_step",
      learningPace: "balanced",
      allowAdaptiveInsights: true,
    },
    completedRealChallenges: {},
    completedLiteracyModules: [],
    offlinePacksDownloaded: ["pack_g9_unit3_vocab", "pack_foundation_math"],
    offlineSyncQueue: [],
    reportPrivacy: {
      shareMasteryBreakdown: true,
      shareGapSummary: true,
      sharePortfolioArtifacts: true,
      shareMilestones: true,
    },
    zeroToHeroProgress: {},
    literacyTrackProgress: {
      completedModuleIds: [],
      readAloudCount: 0,
    },
    financialLab: {
      completedScenarios: [],
      monthlyAllowance: 60,
      savingsGoalAmount: 180,
      monthlySavings: 15,
      expenses: [
        { id: "exp_books", label: "Notebooks & Study Supplies", amount: 18, category: "needs" },
        { id: "exp_transport", label: "School Commute & Lunch", amount: 22, category: "needs" },
        { id: "exp_leisure", label: "Snacks & Games", amount: 10, category: "wants" },
      ],
    },
    problemSolvingLogs: [],
    experimentDesigns: [],
    simplifiedPapers: [],
    studyMatcher: {
      subjects: ["English", "Science", "Mathematics"],
      gradeBand: "Grades 8–10",
      preferredPace: "balanced",
      language: "en",
      goalNote: "Build steady exam readiness with weekly peer check-ins.",
      joinedCohortIds: [],
      blockedCohortIds: [],
      reportedCohortIds: [],
    },
    weeklyChallengeLogs: {},
    communityKnowledgeEntries: [],
    smartClassrooms: {
      joinedCodes: ["BTC-STEM9"],
      completedAssignmentIds: [],
      createdClassrooms: [],
    },
    foundationalPathProgress: {},
    contentErrorReports: [],
    resourceStatusOverrides: {},
    volunteerContributions: [],
    legacyBackupMeta: {
      lastExportedAt: null,
      lastChecksum: null,
    },
    communityResources: INITIAL_COMMUNITY_LIBRARY_RESOURCES,
    teachingGuides: INITIAL_TEACHING_GUIDES,
    downloadedOfflinePackIds: ["pack_foundational_math", "pack_reading_literacy"],
    lowDataModeActive: false,
    legacyContributions: INITIAL_KNOWLEDGE_LEGACY_CONTRIBUTIONS,
    realWorldGoodProjects: INITIAL_REAL_WORLD_GOOD_PROJECTS,
    archivedPreservationRecords: INITIAL_ARCHIVE_PRESERVATION_RECORDS,
    researchProjects: [],
    researchCitations: [],
    engineeringSpecs: [],
    coachingReflections: [],
    privateWorshipChecklist: {
      dateIso: new Date().toISOString().slice(0, 10),
      completedKeys: [],
      note: "",
    },
    universalBenefitResources: INITIAL_UNIVERSAL_BENEFIT_REGISTRY,
    earthCareProjects: [],
    digitalProtectionChecklistChecked: ["chk_unique_pw", "chk_no_code_sharing"],
    familyKnowledgeRecords: INITIAL_FAMILY_KNOWLEDGE_RECORDS,
    truthEvaluations: INITIAL_TRUTH_DEFENDER_CLAIMS,
    goodCharacterReflections: {},
    martialArtsDojo: {
      codeAcknowledged: false,
      codeAcknowledgedAt: null,
      completedPaths: [],
      completedTopics: [],
      completedScenarios: [],
      quizAttempts: [],
      humanityChallengesDone: [],
      savedDisciplineIds: [],
      personalGoal: "",
      preferredRoleModels: [],
      characterPillars: {},
    },
  };
}

const STORAGE_PREFIX = "btc.student_ecosystem.v1";

const INITIAL_ECOSYSTEM_SNAPSHOT: StudentEcosystemState = createInitialStudentEcosystemState();
let currentUid: string | null = null;
let cachedState: StudentEcosystemState = INITIAL_ECOSYSTEM_SNAPSHOT;
const listeners = new Set<() => void>();

export function storageKeyForEcosystem(uid: string | null): string {
  return uid ? `${STORAGE_PREFIX}.${uid}` : `${STORAGE_PREFIX}.guest`;
}

function hydrateEcosystemFromStorage(uid: string | null): StudentEcosystemState {
  const base = createInitialStudentEcosystemState();
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(storageKeyForEcosystem(uid));
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<StudentEcosystemState>;
    return {
      ...base,
      ...parsed,
      adventure: {
        ...base.adventure,
        ...(parsed.adventure ?? {}),
      },
      portfolio: {
        ...base.portfolio,
        ...(parsed.portfolio ?? {}),
        projects: Array.isArray(parsed.portfolio?.projects) ? parsed.portfolio.projects : [],
      },
      universityPrep: {
        ...base.universityPrep,
        ...(parsed.universityPrep ?? {}),
        checklistDone: Array.isArray(parsed.universityPrep?.checklistDone)
          ? parsed.universityPrep.checklistDone
          : [],
      },
      knowledgeLibrary: Array.isArray(parsed.knowledgeLibrary) ? parsed.knowledgeLibrary : [],
      typingHistory: Array.isArray(parsed.typingHistory) ? parsed.typingHistory : [],
      examHistory: Array.isArray(parsed.examHistory) ? parsed.examHistory : [],
      completedSimulations: Array.isArray(parsed.completedSimulations)
        ? parsed.completedSimulations
        : [],
      codingExercisesSolved: Array.isArray(parsed.codingExercisesSolved)
        ? parsed.codingExercisesSolved
        : [],
      savedCodeSnippets: Array.isArray(parsed.savedCodeSnippets) ? parsed.savedCodeSnippets : [],
      creativeProjects: Array.isArray(parsed.creativeProjects) ? parsed.creativeProjects : [],
      noteRevisions:
        parsed.noteRevisions && typeof parsed.noteRevisions === "object"
          ? parsed.noteRevisions
          : {},
      noteLinks: Array.isArray(parsed.noteLinks) ? parsed.noteLinks : [],
      customTimelines: Array.isArray(parsed.customTimelines) ? parsed.customTimelines : [],
      glossaryTerms: Array.isArray(parsed.glossaryTerms) ? parsed.glossaryTerms : [],
      munDrafts: Array.isArray(parsed.munDrafts) ? parsed.munDrafts : [],
      communityProjects: Array.isArray(parsed.communityProjects) ? parsed.communityProjects : [],
      scienceFairProjects: Array.isArray(parsed.scienceFairProjects)
        ? parsed.scienceFairProjects
        : [],
      bookReadingList:
        parsed.bookReadingList && typeof parsed.bookReadingList === "object"
          ? parsed.bookReadingList
          : {},
      bookNotes: parsed.bookNotes && typeof parsed.bookNotes === "object" ? parsed.bookNotes : {},
      debateAndEthicsLogs: Array.isArray(parsed.debateAndEthicsLogs)
        ? parsed.debateAndEthicsLogs
        : [],
      teacherDrafts: Array.isArray(parsed.teacherDrafts) ? parsed.teacherDrafts : [],
      englishWorld: normalizeEnglishWorldState(parsed.englishWorld),
      resolvedGapIds: Array.isArray(parsed.resolvedGapIds) ? parsed.resolvedGapIds : [],
      smartPlannerConfig:
        parsed.smartPlannerConfig && typeof parsed.smartPlannerConfig === "object"
          ? {
              ...base.smartPlannerConfig,
              ...parsed.smartPlannerConfig,
              subjects: Array.isArray(parsed.smartPlannerConfig.subjects)
                ? parsed.smartPlannerConfig.subjects
                : base.smartPlannerConfig.subjects,
              blockedWeekdays: Array.isArray(parsed.smartPlannerConfig.blockedWeekdays)
                ? parsed.smartPlannerConfig.blockedWeekdays
                : base.smartPlannerConfig.blockedWeekdays,
            }
          : base.smartPlannerConfig,
      smartPlannerBlocks: Array.isArray(parsed.smartPlannerBlocks) ? parsed.smartPlannerBlocks : [],
      smartPlannerFocusLogs: Array.isArray(parsed.smartPlannerFocusLogs)
        ? parsed.smartPlannerFocusLogs
        : [],
      curriculumSelection:
        parsed.curriculumSelection && typeof parsed.curriculumSelection === "object"
          ? { ...base.curriculumSelection, ...parsed.curriculumSelection }
          : base.curriculumSelection,
      dnaPreferences:
        parsed.dnaPreferences && typeof parsed.dnaPreferences === "object"
          ? { ...base.dnaPreferences, ...parsed.dnaPreferences }
          : base.dnaPreferences,
      completedRealChallenges:
        parsed.completedRealChallenges && typeof parsed.completedRealChallenges === "object"
          ? parsed.completedRealChallenges
          : {},
      completedLiteracyModules: Array.isArray(parsed.completedLiteracyModules)
        ? parsed.completedLiteracyModules
        : [],
      offlinePacksDownloaded: Array.isArray(parsed.offlinePacksDownloaded)
        ? parsed.offlinePacksDownloaded
        : base.offlinePacksDownloaded,
      offlineSyncQueue: Array.isArray(parsed.offlineSyncQueue) ? parsed.offlineSyncQueue : [],
      reportPrivacy:
        parsed.reportPrivacy && typeof parsed.reportPrivacy === "object"
          ? { ...base.reportPrivacy, ...parsed.reportPrivacy }
          : base.reportPrivacy,
      zeroToHeroProgress:
        parsed.zeroToHeroProgress && typeof parsed.zeroToHeroProgress === "object"
          ? parsed.zeroToHeroProgress
          : base.zeroToHeroProgress,
      literacyTrackProgress:
        parsed.literacyTrackProgress && typeof parsed.literacyTrackProgress === "object"
          ? {
              ...base.literacyTrackProgress,
              ...parsed.literacyTrackProgress,
              completedModuleIds: Array.isArray(parsed.literacyTrackProgress.completedModuleIds)
                ? parsed.literacyTrackProgress.completedModuleIds
                : [],
            }
          : base.literacyTrackProgress,
      financialLab:
        parsed.financialLab && typeof parsed.financialLab === "object"
          ? {
              ...base.financialLab,
              ...parsed.financialLab,
              completedScenarios: Array.isArray(parsed.financialLab.completedScenarios)
                ? parsed.financialLab.completedScenarios
                : [],
              expenses: Array.isArray(parsed.financialLab.expenses)
                ? parsed.financialLab.expenses
                : base.financialLab.expenses,
            }
          : base.financialLab,
      problemSolvingLogs: Array.isArray(parsed.problemSolvingLogs) ? parsed.problemSolvingLogs : [],
      experimentDesigns: Array.isArray(parsed.experimentDesigns) ? parsed.experimentDesigns : [],
      simplifiedPapers: Array.isArray(parsed.simplifiedPapers) ? parsed.simplifiedPapers : [],
      studyMatcher:
        parsed.studyMatcher && typeof parsed.studyMatcher === "object"
          ? {
              ...base.studyMatcher,
              ...parsed.studyMatcher,
              subjects: Array.isArray(parsed.studyMatcher.subjects)
                ? parsed.studyMatcher.subjects
                : base.studyMatcher.subjects,
              joinedCohortIds: Array.isArray(parsed.studyMatcher.joinedCohortIds)
                ? parsed.studyMatcher.joinedCohortIds
                : [],
              blockedCohortIds: Array.isArray(parsed.studyMatcher.blockedCohortIds)
                ? parsed.studyMatcher.blockedCohortIds
                : [],
              reportedCohortIds: Array.isArray(parsed.studyMatcher.reportedCohortIds)
                ? parsed.studyMatcher.reportedCohortIds
                : [],
            }
          : base.studyMatcher,
      weeklyChallengeLogs:
        parsed.weeklyChallengeLogs && typeof parsed.weeklyChallengeLogs === "object"
          ? parsed.weeklyChallengeLogs
          : {},
      communityKnowledgeEntries: Array.isArray(parsed.communityKnowledgeEntries)
        ? parsed.communityKnowledgeEntries
        : [],
      smartClassrooms:
        parsed.smartClassrooms && typeof parsed.smartClassrooms === "object"
          ? {
              ...base.smartClassrooms,
              ...parsed.smartClassrooms,
              joinedCodes: Array.isArray(parsed.smartClassrooms.joinedCodes)
                ? parsed.smartClassrooms.joinedCodes
                : base.smartClassrooms.joinedCodes,
              completedAssignmentIds: Array.isArray(parsed.smartClassrooms.completedAssignmentIds)
                ? parsed.smartClassrooms.completedAssignmentIds
                : [],
              createdClassrooms: Array.isArray(parsed.smartClassrooms.createdClassrooms)
                ? parsed.smartClassrooms.createdClassrooms
                : [],
            }
          : base.smartClassrooms,
      foundationalPathProgress:
        parsed.foundationalPathProgress && typeof parsed.foundationalPathProgress === "object"
          ? parsed.foundationalPathProgress
          : {},
      contentErrorReports: Array.isArray(parsed.contentErrorReports)
        ? parsed.contentErrorReports
        : [],
      resourceStatusOverrides:
        parsed.resourceStatusOverrides && typeof parsed.resourceStatusOverrides === "object"
          ? parsed.resourceStatusOverrides
          : {},
      volunteerContributions: Array.isArray(parsed.volunteerContributions)
        ? parsed.volunteerContributions
        : [],
      legacyBackupMeta:
        parsed.legacyBackupMeta && typeof parsed.legacyBackupMeta === "object"
          ? {
              lastExportedAt: parsed.legacyBackupMeta.lastExportedAt ?? null,
              lastChecksum: parsed.legacyBackupMeta.lastChecksum ?? null,
            }
          : base.legacyBackupMeta,
      communityResources: Array.isArray(parsed.communityResources)
        ? parsed.communityResources
        : base.communityResources,
      teachingGuides: Array.isArray(parsed.teachingGuides)
        ? parsed.teachingGuides
        : base.teachingGuides,
      downloadedOfflinePackIds: Array.isArray(parsed.downloadedOfflinePackIds)
        ? parsed.downloadedOfflinePackIds
        : base.downloadedOfflinePackIds,
      lowDataModeActive:
        typeof parsed.lowDataModeActive === "boolean"
          ? parsed.lowDataModeActive
          : base.lowDataModeActive,
      legacyContributions: Array.isArray(parsed.legacyContributions)
        ? parsed.legacyContributions
        : base.legacyContributions,
      realWorldGoodProjects: Array.isArray(parsed.realWorldGoodProjects)
        ? parsed.realWorldGoodProjects
        : base.realWorldGoodProjects,
      archivedPreservationRecords: Array.isArray(parsed.archivedPreservationRecords)
        ? parsed.archivedPreservationRecords
        : base.archivedPreservationRecords,
      researchProjects: Array.isArray(parsed.researchProjects) ? parsed.researchProjects : [],
      researchCitations: Array.isArray(parsed.researchCitations) ? parsed.researchCitations : [],
      engineeringSpecs: Array.isArray(parsed.engineeringSpecs) ? parsed.engineeringSpecs : [],
      coachingReflections: Array.isArray(parsed.coachingReflections)
        ? parsed.coachingReflections
        : [],
      privateWorshipChecklist:
        parsed.privateWorshipChecklist && typeof parsed.privateWorshipChecklist === "object"
          ? {
              dateIso:
                typeof parsed.privateWorshipChecklist.dateIso === "string"
                  ? parsed.privateWorshipChecklist.dateIso
                  : base.privateWorshipChecklist.dateIso,
              completedKeys: Array.isArray(parsed.privateWorshipChecklist.completedKeys)
                ? parsed.privateWorshipChecklist.completedKeys
                : [],
              note:
                typeof parsed.privateWorshipChecklist.note === "string"
                  ? parsed.privateWorshipChecklist.note
                  : "",
            }
          : base.privateWorshipChecklist,
      universalBenefitResources: Array.isArray(parsed.universalBenefitResources)
        ? parsed.universalBenefitResources
        : base.universalBenefitResources,
      earthCareProjects: Array.isArray(parsed.earthCareProjects) ? parsed.earthCareProjects : [],
      digitalProtectionChecklistChecked: Array.isArray(parsed.digitalProtectionChecklistChecked)
        ? parsed.digitalProtectionChecklistChecked
        : base.digitalProtectionChecklistChecked,
      familyKnowledgeRecords: Array.isArray(parsed.familyKnowledgeRecords)
        ? parsed.familyKnowledgeRecords
        : base.familyKnowledgeRecords,
      truthEvaluations: Array.isArray(parsed.truthEvaluations)
        ? parsed.truthEvaluations
        : base.truthEvaluations,
      goodCharacterReflections:
        parsed.goodCharacterReflections && typeof parsed.goodCharacterReflections === "object"
          ? parsed.goodCharacterReflections
          : {},
      martialArtsDojo:
        parsed.martialArtsDojo && typeof parsed.martialArtsDojo === "object"
          ? {
              ...base.martialArtsDojo,
              ...parsed.martialArtsDojo,
              completedPaths: Array.isArray(parsed.martialArtsDojo.completedPaths)
                ? parsed.martialArtsDojo.completedPaths
                : [],
              completedTopics: Array.isArray(parsed.martialArtsDojo.completedTopics)
                ? parsed.martialArtsDojo.completedTopics
                : [],
              completedScenarios: Array.isArray(parsed.martialArtsDojo.completedScenarios)
                ? parsed.martialArtsDojo.completedScenarios
                : [],
              quizAttempts: Array.isArray(parsed.martialArtsDojo.quizAttempts)
                ? parsed.martialArtsDojo.quizAttempts
                : [],
              humanityChallengesDone: Array.isArray(parsed.martialArtsDojo.humanityChallengesDone)
                ? parsed.martialArtsDojo.humanityChallengesDone
                : [],
              savedDisciplineIds: Array.isArray(parsed.martialArtsDojo.savedDisciplineIds)
                ? parsed.martialArtsDojo.savedDisciplineIds
                : [],
              preferredRoleModels: Array.isArray(parsed.martialArtsDojo.preferredRoleModels)
                ? parsed.martialArtsDojo.preferredRoleModels
                : [],
              characterPillars:
                parsed.martialArtsDojo.characterPillars &&
                typeof parsed.martialArtsDojo.characterPillars === "object"
                  ? parsed.martialArtsDojo.characterPillars
                  : {},
            }
          : base.martialArtsDojo,
    };
  } catch {
    return base;
  }
}

function persistAndNotify(next: StudentEcosystemState) {
  cachedState = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(storageKeyForEcosystem(currentUid), JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  }
  listeners.forEach((l) => l());
}

export function setEcosystemActiveUid(uid: string | null) {
  if (currentUid === uid && typeof window !== "undefined") return;
  currentUid = uid;
  cachedState = hydrateEcosystemFromStorage(uid);
  listeners.forEach((l) => l());
}

export function resetCurrentEcosystemSandbox() {
  persistAndNotify(createInitialStudentEcosystemState());
}

export function restoreStudentEcosystemState(partialState: Partial<StudentEcosystemState>) {
  const base = createInitialStudentEcosystemState();
  persistAndNotify({
    ...base,
    ...partialState,
    adventure: { ...base.adventure, ...(partialState.adventure ?? {}) },
    portfolio: { ...base.portfolio, ...(partialState.portfolio ?? {}) },
    universityPrep: { ...base.universityPrep, ...(partialState.universityPrep ?? {}) },
    legacyBackupMeta: {
      ...base.legacyBackupMeta,
      ...(partialState.legacyBackupMeta ?? {}),
    },
  });
}

if (typeof window !== "undefined") {
  cachedState = hydrateEcosystemFromStorage(null);
}

export function updateStudentEcosystem(
  updater: (prev: StudentEcosystemState) => StudentEcosystemState,
) {
  const next = updater(cachedState);
  persistAndNotify(next);
}

export function getStudentEcosystemSnapshot(): StudentEcosystemState {
  return cachedState;
}

export function getStudentEcosystemServerSnapshot(): StudentEcosystemState {
  return INITIAL_ECOSYSTEM_SNAPSHOT;
}

export function subscribeStudentEcosystem(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useStudentEcosystem(): {
  state: StudentEcosystemState;
  update: (updater: (prev: StudentEcosystemState) => StudentEcosystemState) => void;
  exportJson: () => string;
} {
  const state = useSyncExternalStore(
    subscribeStudentEcosystem,
    getStudentEcosystemSnapshot,
    getStudentEcosystemServerSnapshot,
  );
  return {
    state,
    update: updateStudentEcosystem,
    exportJson: () => JSON.stringify(state, null, 2),
  };
}

export interface AchievementEvidenceSummary {
  simulationsCompleted: number;
  codingSolved: number;
  creativeWorks: number;
  debateAndEthicsCount: number;
  munDraftsCount: number;
  scienceFairCount: number;
  communityProjectsCount: number;
  approvedNoteLinks: number;
  glossaryMastered: number;
  booksFinished: number;
  portfolioProjectsCount: number;
  totalVerifiedArtifacts: number;
  milestones: Array<{
    id: string;
    title: string;
    evidenceLabel: string;
    current: number;
    target: number;
    unlocked: boolean;
  }>;
}

export function computeAchievementEvidence(
  state: StudentEcosystemState,
): AchievementEvidenceSummary {
  const simulationsCompleted = state.completedSimulations.length;
  const codingSolved = state.codingExercisesSolved.length;
  const creativeWorks = state.creativeProjects.length;
  const debateAndEthicsCount = state.debateAndEthicsLogs.length;
  const munDraftsCount = state.munDrafts.length;
  const scienceFairCount = state.scienceFairProjects.length;
  const communityProjectsCount = state.communityProjects.length;
  const approvedNoteLinks = state.noteLinks.filter((l) => l.approved).length;
  const glossaryMastered = state.glossaryTerms.filter((g) => g.mastered).length;
  const booksFinished = Object.values(state.bookReadingList).filter((s) => s === "finished").length;
  const portfolioProjectsCount = state.portfolio.projects.length;

  const totalVerifiedArtifacts =
    simulationsCompleted +
    codingSolved +
    creativeWorks +
    debateAndEthicsCount +
    munDraftsCount +
    scienceFairCount +
    communityProjectsCount +
    approvedNoteLinks +
    glossaryMastered +
    booksFinished +
    portfolioProjectsCount;

  return {
    simulationsCompleted,
    codingSolved,
    creativeWorks,
    debateAndEthicsCount,
    munDraftsCount,
    scienceFairCount,
    communityProjectsCount,
    approvedNoteLinks,
    glossaryMastered,
    booksFinished,
    portfolioProjectsCount,
    totalVerifiedArtifacts,
    milestones: [
      {
        id: "ev_lab_explorer",
        title: "STEM Lab Explorer",
        evidenceLabel: `${simulationsCompleted}/3 simulations completed`,
        current: simulationsCompleted,
        target: 3,
        unlocked: simulationsCompleted >= 3,
      },
      {
        id: "ev_code_builder",
        title: "Algorithmic Builder",
        evidenceLabel: `${codingSolved}/2 coding challenges solved`,
        current: codingSolved,
        target: 2,
        unlocked: codingSolved >= 2,
      },
      {
        id: "ev_critical_thinker",
        title: "Civic & Critical Thinker",
        evidenceLabel: `${debateAndEthicsCount + munDraftsCount}/2 argument or MUN drafts`,
        current: debateAndEthicsCount + munDraftsCount,
        target: 2,
        unlocked: debateAndEthicsCount + munDraftsCount >= 2,
      },
      {
        id: "ev_creative_maker",
        title: "Creative Studio Maker",
        evidenceLabel: `${creativeWorks}/1 original creative studio project`,
        current: creativeWorks,
        target: 1,
        unlocked: creativeWorks >= 1,
      },
      {
        id: "ev_knowledge_weaver",
        title: "Knowledge Weaver",
        evidenceLabel: `${approvedNoteLinks + glossaryMastered}/3 approved note links or glossary terms`,
        current: approvedNoteLinks + glossaryMastered,
        target: 3,
        unlocked: approvedNoteLinks + glossaryMastered >= 3,
      },
      {
        id: "ev_changemaker",
        title: "Changemaker Project Lead",
        evidenceLabel: `${scienceFairCount + communityProjectsCount}/1 Science Fair or Community plan`,
        current: scienceFairCount + communityProjectsCount,
        target: 1,
        unlocked: scienceFairCount + communityProjectsCount >= 1,
      },
    ],
  };
}
