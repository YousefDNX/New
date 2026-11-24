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
  useUser: () => ({ data: { uid: "legacy_student_1", displayName: "Amina Legacy" } }),
  useProfile: () => ({
    data: {
      id: "legacy_student_1",
      display_name: "Amina Legacy",
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
      user_id: "legacy_student_1",
      xp: 410,
      level: 4,
      current_streak: 5,
      longest_streak: 8,
      last_active_date: "2026-11-17",
      focus_minutes_total: 150,
      tasks_completed_total: 6,
      updated_at: "2026-11-17T00:00:00Z",
    },
  }),
  useTasks: () => ({
    data: [
      { id: "t1", status: "done" },
      { id: "t2", status: "todo" },
    ],
  }),
  useTaskActions: () => ({ addTask: vi.fn(async () => "task_mock") }),
}));

vi.mock("@/hooks/use-modules", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/use-modules")>();
  return {
    ...actual,
    useStudyItems: () => ({ data: [] }),
    useQuizAttempts: () => ({ data: [{ id: "q1" }] }),
    useFocusSessions: () => ({ data: [{ id: "f1" }, { id: "f2" }] }),
    useStudyActions: () => ({
      addStudyItem: vi.fn(async () => "si_mock"),
      updateStudyItem: vi.fn(async () => {}),
      recordQuizAttempt: vi.fn(async () => {}),
    }),
    useCareEntries: () => ({ data: [] }),
    useCareActions: () => ({
      addCareEntry: vi.fn(async () => {}),
      deleteCareEntry: vi.fn(async () => {}),
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

import {
  FOUNDATIONAL_LEARNING_TRACKS,
  HEALTH_LITERACY_GUIDES,
  ISLAMIC_FOUNDATIONS_INDEX,
  OPEN_LEARNING_LIBRARY,
} from "@/data/open-learning-library";
import {
  canDownloadResource,
  computePrivacySafeImpactMetrics,
  createVersionedEcosystemBackup,
  filterOpenLibrary,
  formatAttributionExportMarkdown,
  isResourceDueForReview,
  validateErrorReportInput,
  validateVolunteerContribution,
  verifyAndRestoreBackup,
} from "@/lib/legacy-knowledge";
import {
  createInitialStudentEcosystemState,
  getStudentEcosystemSnapshot,
  resetCurrentEcosystemSandbox,
  updateStudentEcosystem,
} from "@/lib/student-ecosystem";
import { PreferencesProvider } from "@/lib/preferences";
import { FeatureGuideProvider } from "@/components/common/FeatureGuideModal";
import { KnowledgeToolsPanel } from "@/components/study/KnowledgeToolsPanel";
import { SkillAcademyWorkspace } from "@/components/study/SkillAcademyWorkspace";
import { CareWorkspace } from "@/components/modules/CareWorkspace";
import { NexoraLegacyHub } from "@/components/legacy/NexoraLegacyHub";

function renderWithProviders(ui: ReactNode) {
  return render(
    <PreferencesProvider>
      <FeatureGuideProvider>{ui}</FeatureGuideProvider>
    </PreferencesProvider>,
  );
}

describe("NEXORA Legacy of Knowledge & Continuity Systems", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetCurrentEcosystemSandbox();
  });

  afterEach(() => {
    cleanup();
  });

  it("enforces structured metadata, download licenses, and status-gated download locks", () => {
    expect(OPEN_LEARNING_LIBRARY.length).toBeGreaterThanOrEqual(6);
    for (const item of OPEN_LEARNING_LIBRARY) {
      expect(item.authorOwner.trim().length).toBeGreaterThan(0);
      expect(item.sourceReferences.length).toBeGreaterThan(0);
      expect(item.warningsLimitations.length).toBeGreaterThan(0);
    }

    const healthRef = OPEN_LEARNING_LIBRARY.find(
      (r) => r.id === "oer_health_first_aid_reference_gated",
    )!;
    expect(canDownloadResource(healthRef).allowed).toBe(false);

    const mathOpen = OPEN_LEARNING_LIBRARY.find((r) => r.id === "oer_math_fractions_ratios")!;
    expect(canDownloadResource(mathOpen).allowed).toBe(true);

    // Flagging an approved resource into needs_correction locks offline download
    const locked = canDownloadResource(mathOpen, {
      [mathOpen.id]: {
        reviewStatus: "needs_correction",
        lastReviewedDate: "2026-11-17",
        correctionHistory: [],
      },
    });
    expect(locked.allowed).toBe(false);

    const md = formatAttributionExportMarkdown(mathOpen);
    expect(md).toContain(mathOpen.license);
    expect(md).toContain(mathOpen.authorOwner);
  });

  it("supports multi-axis Open Library filtering and detects review cadence expiration", () => {
    const arItems = filterOpenLibrary(OPEN_LEARNING_LIBRARY, { language: "ar" });
    expect(arItems.length).toBeGreaterThanOrEqual(1);
    expect(arItems.every((i) => i.language === "ar")).toBe(true);

    const downloadableOnly = filterOpenLibrary(OPEN_LEARNING_LIBRARY, { downloadableOnly: true });
    expect(downloadableOnly.some((i) => i.id === "oer_health_first_aid_reference_gated")).toBe(
      false,
    );

    const healthRef = OPEN_LEARNING_LIBRARY.find(
      (r) => r.id === "oer_health_first_aid_reference_gated",
    )!;
    const freshness = isResourceDueForReview(healthRef, "2026-11-17T00:00:00Z");
    expect(freshness.due).toBe(true);
    expect(freshness.daysSinceReview).toBeGreaterThanOrEqual(90);
  });

  it("blocks PII in error reports & volunteer contributions and enforces supervision", () => {
    expect(
      validateErrorReportInput({
        resourceId: "oer_math_fractions_ratios",
        details: "Contact me at student@example.com for details",
      }).ok,
    ).toBe(false);

    expect(
      validateErrorReportInput({
        resourceId: "oer_math_fractions_ratios",
        details: "Step 2 example divides denominator twice without explanation.",
      }).ok,
    ).toBe(true);

    expect(
      validateVolunteerContribution({
        targetResourceId: "oer_reading_active_comprehension",
        summary: "Added clearer Arabic translation and alt-text note for diagram.",
        supervisorApproved: false,
      }).ok,
    ).toBe(false);

    expect(
      validateVolunteerContribution({
        targetResourceId: "oer_reading_active_comprehension",
        summary: "Added clearer Arabic translation and alt-text note for diagram.",
        supervisorApproved: true,
      }).ok,
    ).toBe(true);
  });

  it("covers all 10 required Foundational Learning Center tracks cleanly", () => {
    const ids = FOUNDATIONAL_LEARNING_TRACKS.map((t) => t.id);
    expect(ids).toEqual([
      "reading",
      "writing",
      "mathematics",
      "basic_science",
      "english",
      "arabic",
      "digital_literacy",
      "study_skills",
      "research_skills",
      "critical_thinking",
    ]);
    for (const track of FOUNDATIONAL_LEARNING_TRACKS) {
      expect(track.steps.length).toBeGreaterThanOrEqual(1);
      expect(track.encouragementNote.length).toBeGreaterThan(10);
    }
  });

  it("creates checksum-verified backups and rejects tampered JSON payloads on restore", () => {
    updateStudentEcosystem((prev) => ({
      ...prev,
      resolvedGapIds: ["gap_ratio_1"],
      foundationalPathProgress: { reading: ["fnd_read_1"] },
    }));
    const backup = createVersionedEcosystemBackup(getStudentEcosystemSnapshot(), "uid_99");
    const validRaw = JSON.stringify(backup);

    const okRes = verifyAndRestoreBackup(validRaw);
    expect(okRes.ok).toBe(true);

    // Tamper payload without updating checksum
    const tampered = {
      ...backup,
      payload: { ...backup.payload, resolvedGapIds: ["tampered_gap"] },
    };
    const badRes = verifyAndRestoreBackup(JSON.stringify(tampered));
    expect(badRes.ok).toBe(false);
  });

  it("computes privacy-preserving non-inflated impact metrics with transparent formulas", () => {
    const state = createInitialStudentEcosystemState();
    state.foundationalPathProgress = { reading: ["fnd_read_1", "fnd_read_2"] };
    state.resolvedGapIds = ["g1"];
    state.masteredPathSteps = ["s1"];
    state.communityProjects = [
      {
        id: "ci1",
        title: "Peer Math Support",
        need: "Fractions",
        supervisorName: "Ms. Salma",
        adultSupervised: true,
        milestones: [],
        impactReflection: "",
        createdAt: "2026-11-17T00:00:00Z",
      },
    ];

    const snapshot = computePrivacySafeImpactMetrics({
      state,
      completedTasksCount: 3,
      quizAttemptsCount: 2,
      focusSessionsCount: 4,
      supportedLanguagesCount: 2,
    });

    const foundationMetric = snapshot.metrics.find((m) => m.id === "foundational_mastery");
    const practiceMetric = snapshot.metrics.find((m) => m.id === "disciplined_practice");
    const impactMetric = snapshot.metrics.find((m) => m.id === "community_impact_verified");

    expect(foundationMetric?.value).toBe(2);
    expect(practiceMetric?.value).toBe(9);
    expect(impactMetric?.value).toBe(1);
    expect(snapshot.antiInflationNote).toContain("never counts raw page views");
  });

  it("includes clinical review & authentic Islamic boundary metadata", () => {
    expect(HEALTH_LITERACY_GUIDES.every((h) => h.requiresQualifiedReview)).toBe(true);
    expect(ISLAMIC_FOUNDATIONS_INDEX.authenticQuranRoots.length).toBeGreaterThanOrEqual(3);
    expect(ISLAMIC_FOUNDATIONS_INDEX.hadithGradingStandards.length).toBeGreaterThanOrEqual(3);
  });

  it("allows submitting an Error Report inside KnowledgeToolsPanel and moves resource to needs_correction", () => {
    renderWithProviders(<KnowledgeToolsPanel />);
    expect(screen.getByTestId("open-learning-library")).toBeInTheDocument();

    const reportBtns = screen.getAllByRole("button", { name: /Report an Error/i });
    fireEvent.click(reportBtns[0]!);

    const textarea = screen.getByPlaceholderText(/Explain what needs correction/i);
    fireEvent.change(textarea, {
      target: { value: "Source reference line needs updated chapter year." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Submit Correction Report/i }));

    const eco = getStudentEcosystemSnapshot();
    expect(eco.contentErrorReports.length).toBe(1);
    expect(eco.contentErrorReports[0]?.status).toBe("open");
    expect(Object.values(eco.resourceStatusOverrides)[0]?.reviewStatus).toBe("needs_correction");
  });

  it("renders Foundational 10-Track Center, Health Literacy Disclaimer, and Legacy Hub restore validation", () => {
    renderWithProviders(<SkillAcademyWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: /Foundational Center/i }));
    expect(screen.getByTestId("foundational-10-tracks")).toBeInTheDocument();

    cleanup();
    renderWithProviders(<CareWorkspace />);
    expect(screen.getByTestId("health-literacy-awareness")).toBeInTheDocument();
    expect(screen.getAllByText(/Requires Qualified Clinical Review/i).length).toBeGreaterThan(0);

    cleanup();
    renderWithProviders(<NexoraLegacyHub />);
    expect(screen.getByTestId("nexora-legacy-hub")).toBeInTheDocument();

    const restoreBox = screen.getByPlaceholderText(/Or paste checksum-verified backup JSON/i);
    fireEvent.change(restoreBox, { target: { value: '{"invalid":true}' } });
    fireEvent.click(screen.getByRole("button", { name: /Verify Checksum & Restore/i }));
    expect(screen.getByText(/Unsupported backup schemaVersion/i)).toBeInTheDocument();
  });
});
