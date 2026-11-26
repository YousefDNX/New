import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({
      children,
      to,
      ...rest
    }: {
      children: ReactNode;
      to: string;
      [k: string]: unknown;
    }) => (
      <a href={to} {...rest}>
        {children}
      </a>
    ),
  };
});

vi.mock("@/hooks/use-nexora", () => ({
  useUser: () => ({ data: { uid: "test_student_1", displayName: "Nour Test" } }),
  useProfile: () => ({
    data: {
      id: "test_student_1",
      display_name: "Nour Test",
      avatar_url: null,
      language: "en",
      region: "kuwait",
      date_of_birth: null,
      age_band: "13_15",
      parental_consent: true,
      onboarded: true,
      is_anonymous: false,
      auth_provider: "password",
      email_verified: true,
      phone_number: null,
      created_at: "2026-09-01T00:00:00Z",
      updated_at: "2026-09-01T00:00:00Z",
    },
  }),
  useStats: () => ({
    data: {
      user_id: "test_student_1",
      xp: 320,
      level: 3,
      current_streak: 4,
      longest_streak: 6,
      last_active_date: "2026-11-16",
      focus_minutes_total: 120,
      tasks_completed_total: 5,
      updated_at: "2026-11-16T00:00:00Z",
    },
  }),
  useTaskActions: () => ({
    addTask: vi.fn(async () => "task_mock_1"),
  }),
}));

vi.mock("@/hooks/use-modules", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/use-modules")>();
  return {
    ...actual,
    useStudyActions: () => ({
      addStudyItem: vi.fn(async () => "si_mock_1"),
      recordQuizAttempt: vi.fn(async () => {}),
    }),
    useCircles: () => ({ data: [] }),
    useCircleDetails: () => ({ data: { members: [], posts: [] } }),
    useCircleActions: () => ({
      createCircle: vi.fn(async () => {}),
      joinByInviteCode: vi.fn(async () => {}),
      createCirclePost: vi.fn(async () => {}),
      updateCirclePost: vi.fn(async () => {}),
      deleteCirclePost: vi.fn(async () => {}),
      togglePostStatus: vi.fn(async () => {}),
      toggleHelpful: vi.fn(async () => {}),
      updateCircleGoal: vi.fn(async () => {}),
      leaveCircle: vi.fn(async () => {}),
      removeMember: vi.fn(async () => {}),
      submitModerationReport: vi.fn(async () => {}),
    }),
  };
});

import { PreferencesProvider } from "@/lib/preferences";
import {
  LITERACY_ACCESS_LESSONS,
  PROBLEM_SOLVING_CHALLENGES,
  SAFE_STUDY_COHORTS,
  SEEDED_SMART_CLASSROOMS,
  SEVEN_PROBLEM_STEPS,
  buildAcademicProgressReport,
  buildPersonalAchievementTimeline,
  computeBudgetHealth,
  computeClassKnowledgeAnalytics,
  computeCompoundSavings,
  evaluateExperimentDesign,
  evaluateOpportunityEligibility,
  formatAcademicReportMarkdown,
  generateTeacherDraftLocally,
  getCurrentWeeklyChallenge,
  matchSafeStudyCohorts,
  simplifyScientificPaperLocally,
  validateSafeCommunityContribution,
} from "@/lib/empowerment-engines";
import { REFERENCE_OPPORTUNITIES } from "@/lib/recommendations";
import {
  createInitialStudentEcosystemState,
  getStudentEcosystemSnapshot,
  resetCurrentEcosystemSandbox,
  setEcosystemActiveUid,
  storageKeyForEcosystem,
  updateStudentEcosystem,
} from "@/lib/student-ecosystem";
import { SkillAcademyWorkspace } from "@/components/study/SkillAcademyWorkspace";
import { PracticalSkillsWorkspace } from "@/components/study/PracticalSkillsWorkspace";

describe("NEXORA Master Empowerment Expansion: Pure Engines, Privacy & UI Workspaces", () => {
  beforeEach(() => {
    localStorage.clear();
    setEcosystemActiveUid(null);
    resetCurrentEcosystemSandbox();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("hydrates legacy localStorage payloads safely without losing new empowerment slices", () => {
    const uid = "legacy_user_99";
    localStorage.setItem(
      storageKeyForEcosystem(uid),
      JSON.stringify({
        activeLearningPathId: "path_g9_english",
        completedSkillLessons: ["l_1"],
        // Omit zeroToHeroProgress, financialLab, smartClassrooms, etc.
      }),
    );

    setEcosystemActiveUid(uid);
    const hydrated = getStudentEcosystemSnapshot();
    expect(hydrated.completedSkillLessons).toEqual(["l_1"]);
    expect(hydrated.zeroToHeroProgress).toEqual({});
    expect(hydrated.financialLab.monthlyAllowance).toBe(60);
    expect(hydrated.smartClassrooms.joinedCodes).toContain("BTC-STEM9");
    expect(hydrated.literacyTrackProgress.completedModuleIds).toEqual([]);
  });

  it("builds Academic Progress Report (#14) honoring privacy toggles and permanently excluding Care journals", () => {
    const state = createInitialStudentEcosystemState();
    state.examHistory = [
      {
        id: "ex_1",
        subject: "Mathematics",
        correct: 8,
        total: 10,
        scorePct: 80,
        weakTopics: ["Negative integers"],
        date: "2026-11-12T10:00:00Z",
      },
    ];
    state.portfolio.projects = [
      {
        id: "proj_1",
        title: "Solar Desalination Model",
        category: "Science",
        summary: "Built with school-safe foil & clean water trays.",
        stepsCompleted: 4,
        totalSteps: 4,
        showcaseOptIn: true,
        createdAt: "2026-11-10T10:00:00Z",
      },
    ];
    state.reportPrivacy = {
      shareMasteryBreakdown: false,
      shareGapSummary: true,
      sharePortfolioArtifacts: false,
      shareMilestones: true,
    };

    const report = buildAcademicProgressReport({
      state,
      profile: {
        id: "u1",
        display_name: "Nour",
        avatar_url: null,
        language: "en",
        region: "kuwait",
        date_of_birth: null,
        age_band: "13_15",
        parental_consent: true,
        onboarded: true,
        is_anonymous: false,
        auth_provider: "password",
        email_verified: true,
        phone_number: null,
        created_at: "2026-09-01T00:00:00Z",
        updated_at: "2026-09-01T00:00:00Z",
      },
      stats: null,
      studyItems: [],
      quizAttempts: [],
      focusSessions: [],
      tasks: [],
      goals: [],
    });

    expect(report.masterySection.included).toBe(false);
    expect(report.portfolioSection.included).toBe(false);
    expect(report.gapSection.included).toBe(true);
    expect(report.milestoneSection.included).toBe(true);
    expect(report.careExclusionGuarantee).toContain("permanently excluded");

    const md = formatAcademicReportMarkdown(report);
    expect(md).not.toContain("Solar Desalination Model");
    expect(md).not.toContain("Academic Mastery");
    expect(md).toContain("Private Wellbeing / Care journals");
  });

  it("evaluates Opportunity Eligibility (#41) and aggregates Personal Achievement Timeline (#42)", () => {
    const state = createInitialStudentEcosystemState();
    state.curriculumSelection.grade = "Grade 9";
    state.portfolio.projects.push({
      id: "p_stem",
      title: "Rainwater Sensor",
      category: "STEM",
      summary: "Low-cost moisture monitor.",
      stepsCompleted: 3,
      totalSteps: 3,
      showcaseOptIn: true,
      createdAt: "2026-11-14T12:00:00Z",
    });
    state.experimentDesigns.push({
      id: "exp_1",
      title: "Evaporation vs Shade",
      iv: "Shade cover",
      dv: "Water loss (mL)",
      controls: ["Initial water volume"],
      materials: "Plastic cups, water, cardboard",
      trials: [
        { label: "T1", value: 12 },
        { label: "T2", value: 14 },
      ],
      hazardChecked: true,
      conclusion: "Shade cut evaporation.",
      createdAt: "2026-11-15T09:00:00Z",
    });

    const isef = REFERENCE_OPPORTUNITIES.find((o) => o.id === "ref-imo-iseff")!;
    const eligibility = evaluateOpportunityEligibility({
      opportunity: isef,
      profile: null,
      state,
      currentStreak: 5,
    });
    expect(eligibility.fitScore).toBeGreaterThanOrEqual(78);
    expect(eligibility.status).toBe("strong_match");
    expect(eligibility.matchedCriteria.length).toBeGreaterThanOrEqual(3);

    const timeline = buildPersonalAchievementTimeline(state);
    expect(timeline.length).toBe(2);
    expect(timeline[0]!.id).toBe("tl_exp_exp_1");
    expect(timeline[1]!.id).toBe("tl_port_p_stem");
  });

  it("filters blocked cohorts and ranks matching cohorts first in Safe Study Matcher (#12 & #40)", () => {
    const matches = matchSafeStudyCohorts({
      subjects: ["Science"],
      gradeBand: "Grades 8–10",
      preferredPace: "balanced",
      language: "en",
      blockedCohortIds: ["coh_kw_eng9"],
    });

    expect(matches.some((m) => m.cohort.id === "coh_kw_eng9")).toBe(false);
    expect(matches[0]!.cohort.id).toBe("coh_stem_bio");
    expect(matches[0]!.compatibilityScore).toBeGreaterThan(80);
    expect(SAFE_STUDY_COHORTS.every((c) => c.moderatorVerified)).toBe(true);
  });

  it("calculates Financial Literacy (#27) budget status and compound savings accurately", () => {
    const balanced = computeBudgetHealth({
      monthlyAllowance: 100,
      monthlySavings: 20,
      expenses: [
        { amount: 45, category: "needs" },
        { amount: 25, category: "wants" },
      ],
    });
    expect(balanced.status).toBe("balanced");
    expect(balanced.remainingBalance).toBe(10);

    const deficit = computeBudgetHealth({
      monthlyAllowance: 50,
      monthlySavings: 10,
      expenses: [
        { amount: 30, category: "needs" },
        { amount: 25, category: "wants" },
      ],
    });
    expect(deficit.status).toBe("deficit");
    expect(deficit.remainingBalance).toBe(-15);

    const compound = computeCompoundSavings({
      initialPrincipal: 100,
      monthlyContribution: 20,
      annualRatePct: 12,
      months: 12,
    });
    expect(compound.totalContributed).toBe(340);
    expect(compound.finalBalance).toBeGreaterThan(340);
    expect(compound.growthEarned).toBeGreaterThan(0);
  });

  it("simplifies scientific abstracts (#31) and enforces Experiment Safety Gate (#32)", () => {
    const simplified = simplifyScientificPaperLocally(
      "This study investigates whether mulch reduces daytime soil temperature. We measured 20 potted plants across 14 days with a control group. Results showed treated pots stayed 4C cooler.",
      "Mulch Soil Cooling Study",
    );
    expect(simplified.question).toContain("investigates");
    expect(simplified.method).toContain("measured 20 potted plants");
    expect(simplified.findings).toContain("showed");
    expect(simplified.limitations.length).toBeGreaterThan(0);

    const blockedExp = evaluateExperimentDesign({
      title: "Unsafe Reaction",
      iv: "Acid concentration",
      dv: "Gas bubbles",
      controls: ["Volume"],
      materials: "Household bleach and vinegar over an open flame",
      trials: [10, 12],
      hazardChecked: true,
    });
    expect(blockedExp.safetyBlocked).toBe(true);
    expect(blockedExp.valid).toBe(false);

    const safeExp = evaluateExperimentDesign({
      title: "Ice Melting vs Salt",
      iv: "Salt mass (g)",
      dv: "Time to melt (s)",
      controls: ["Cup size", "Room temperature"],
      materials: "Ice cubes, table salt, plastic cup, timer",
      trials: [100, 120, 110],
      hazardChecked: true,
    });
    expect(safeExp.safetyBlocked).toBe(false);
    expect(safeExp.valid).toBe(true);
    expect(safeExp.mean).toBe(110);
    expect(safeExp.range).toBe(20);
  });

  it("validates Teacher Copilot review gate (#33-#35), Weekly Challenge (#43), and PII filtering (#48/#50)", () => {
    expect(SEVEN_PROBLEM_STEPS).toHaveLength(7);
    expect(PROBLEM_SOLVING_CHALLENGES.length).toBeGreaterThanOrEqual(2);
    expect(SEEDED_SMART_CLASSROOMS.map((c) => c.code)).toEqual(["BTC-STEM9", "BTC-ENG9"]);
    expect(LITERACY_ACCESS_LESSONS).toHaveLength(3);

    const draft = generateTeacherDraftLocally({
      subject: "Science",
      grade: "Grade 9",
      topic: "Photosynthesis",
    });
    expect(draft.requiresEducatorReview).toBe(true);
    expect(draft.objectives).toHaveLength(3);

    const state = createInitialStudentEcosystemState();
    state.examHistory.push({
      id: "ex_class_1",
      subject: "Algebra",
      correct: 6,
      total: 10,
      scorePct: 60,
      weakTopics: ["Sign flip errors"],
      date: "2026-11-16T09:00:00Z",
    });
    const analytics = computeClassKnowledgeAnalytics({
      state,
      studyItems: [],
      quizAttempts: [],
    });
    expect(analytics.averageExamPct).toBe(60);
    expect(analytics.sampleSizeNotice).toContain("strictly excluded");

    const weekly = getCurrentWeeklyChallenge("2026-11-16");
    expect(weekly.weekKey).toContain("2026-W");
    expect(weekly.options.length).toBe(3);

    const emailBlocked = validateSafeCommunityContribution({
      title: "Study Group Notes",
      summary: "Email me at student123@example.com for answers.",
      stepsText: "Step 1",
    });
    expect(emailBlocked.ok).toBe(false);
    expect(emailBlocked.reason).toContain("Minor Safety Block");

    const phoneBlocked = validateSafeCommunityContribution({
      title: "Physics Cheat Sheet",
      summary: "Call me on +965 99112233 before the test.",
      stepsText: "Step 1",
    });
    expect(phoneBlocked.ok).toBe(false);

    const safeGuide = validateSafeCommunityContribution({
      title: "Balancing Simple Equations",
      summary: "Perform the same inverse operation on both sides of the equals sign.",
      stepsText: "Identify variable term\nUndo addition or subtraction first",
    });
    expect(safeGuide.ok).toBe(true);
  });

  it("renders From Zero to Hero (#22) & Literacy Access (#51) in SkillAcademyWorkspace", () => {
    render(
      <PreferencesProvider>
        <SkillAcademyWorkspace />
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /From Zero to Hero Journeys/i }));
    expect(screen.getByTestId("zero-to-hero-panel")).toBeInTheDocument();

    const completeButtons = screen.getAllByRole("button", { name: "Complete Stage" });
    expect(completeButtons.length).toBeGreaterThan(0);
    fireEvent.click(completeButtons[0]!);
    expect(screen.getAllByRole("button", { name: "Verified" }).length).toBeGreaterThanOrEqual(1);

    fireEvent.click(screen.getByRole("button", { name: /Literacy & Learning Access/i }));
    expect(screen.getByTestId("literacy-access-panel")).toBeInTheDocument();
    expect(screen.getByText(/Everyday Signs, Forms & Health Labels/i)).toBeInTheDocument();
  });

  it("renders Financial Literacy Academy (#27) in PracticalSkillsWorkspace and adds custom expenses", () => {
    render(
      <PreferencesProvider>
        <PracticalSkillsWorkspace />
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Financial Literacy/i }));
    expect(screen.getByText(/Student Monthly Budget Allocator/i)).toBeInTheDocument();

    const expenseInput = screen.getByPlaceholderText("Expense item...");
    fireEvent.change(expenseInput, { target: { value: "Science Lab Notebook" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByText(/Science Lab Notebook/)).toBeInTheDocument();
    expect(updateStudentEcosystem).toBeTypeOf("function");
  });
});
