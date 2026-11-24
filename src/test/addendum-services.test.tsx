import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

const mockFirestoreDocs = new Map<string, Record<string, unknown>>();
const mockCollectionQueries: Array<{ path: string }> = [];
const mockAwardXpIfUnique = vi.fn(async (..._args: unknown[]) => true);

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

vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("firebase/firestore")>();
  return {
    ...actual,
    collection: (_db: unknown, path: string) => ({ path }),
    doc: (_db: unknown, col: string, id: string) => ({ col, id, path: `${col}/${id}` }),
    where: (field: string, op: string, value: unknown) => ({ kind: "where", field, op, value }),
    limit: (n: number) => ({ kind: "limit", n }),
    query: (
      colRef: { path: string },
      ...constraints: Array<{ kind?: string; field?: string; value?: unknown }>
    ) => ({
      colRef,
      constraints,
    }),
    getDocs: vi.fn(
      async (q: {
        colRef?: { path: string };
        constraints?: Array<{ kind?: string; field?: string; value?: unknown }>;
      }) => {
        const colPath = q.colRef?.path ?? "";
        mockCollectionQueries.push({ path: colPath });
        const wheres = (q.constraints ?? []).filter((c) => c.kind === "where");
        const matched: Array<{ id: string; data: () => Record<string, unknown> }> = [];
        for (const [key, val] of mockFirestoreDocs.entries()) {
          if (!key.startsWith(`${colPath}/`)) continue;
          const ok = wheres.every((w) => val[w.field ?? ""] === w.value);
          if (ok) {
            matched.push({ id: key.split("/").slice(1).join("/"), data: () => val });
          }
        }
        return { empty: matched.length === 0, docs: matched };
      },
    ),
    getDoc: vi.fn(async (ref: { path: string }) => {
      const val = mockFirestoreDocs.get(ref.path);
      return {
        exists: () => Boolean(val),
        data: () => val,
      };
    }),
    setDoc: vi.fn(async (ref: { path: string }, data: Record<string, unknown>) => {
      mockFirestoreDocs.set(ref.path, data);
    }),
    updateDoc: vi.fn(async (ref: { path: string }, data: Record<string, unknown>) => {
      const existing = mockFirestoreDocs.get(ref.path) ?? {};
      mockFirestoreDocs.set(ref.path, { ...existing, ...data });
    }),
  };
});

vi.mock("@/hooks/use-nexora", () => ({
  useUser: () => ({ data: { uid: "student_addendum_1", displayName: "Zaid Learner" } }),
  awardXpIfUnique: (...args: unknown[]) => mockAwardXpIfUnique(...args),
  useProfile: () => ({
    data: {
      id: "student_addendum_1",
      display_name: "Zaid Learner",
      language: "en",
      region: "kuwait",
    },
  }),
  useStats: () => ({
    data: { user_id: "student_addendum_1", xp: 200, level: 2, current_streak: 4 },
  }),
  useTasks: () => ({
    data: [{ id: "t1", status: "todo", title: "Fractions Worksheet", subject: "Mathematics" }],
  }),
  useTaskActions: () => ({
    addTask: vi.fn(async () => "t_new"),
    updateTask: vi.fn(async () => {}),
  }),
}));

import { analysisService } from "@/lib/analysis-service";
import {
  queryExamQuestionsFromFirestore,
  recordExamSimulationCompletion,
} from "@/lib/exam-center-service";
import { resolveOfflineQueueConflicts, syncOfflineQueueToFirestore } from "@/lib/offline-storage";
import {
  computeSmartStudyPlanInBackground,
  defaultSmartPlannerConfig,
  loadSmartStudyPlanFromFirestore,
  saveSmartStudyPlanToFirestore,
} from "@/lib/study-planner";
import {
  getStudentEcosystemSnapshot,
  resetCurrentEcosystemSandbox,
  updateStudentEcosystem,
} from "@/lib/student-ecosystem";
import { PreferencesProvider } from "@/lib/preferences";
import { FeatureGuideProvider } from "@/components/common/FeatureGuideModal";
import { CommunityLibrariesPanel } from "@/components/legacy/CommunityLibrariesPanel";
import { KnowledgeArchivePanel } from "@/components/legacy/KnowledgeArchivePanel";
import { KnowledgeLegacyPanel } from "@/components/legacy/KnowledgeLegacyPanel";
import { OfflineEducationPanel } from "@/components/legacy/OfflineEducationPanel";
import { RealWorldGoodPanel } from "@/components/legacy/RealWorldGoodPanel";
import { TeachingForAllPanel } from "@/components/legacy/TeachingForAllPanel";

function renderWithProviders(ui: ReactNode) {
  return render(
    <PreferencesProvider>
      <FeatureGuideProvider>{ui}</FeatureGuideProvider>
    </PreferencesProvider>,
  );
}

describe("NEXORA Addendum Services & 6 Legacy Initiatives", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetCurrentEcosystemSandbox();
    mockFirestoreDocs.clear();
    mockCollectionQueries.length = 0;
    mockAwardXpIfUnique.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("AnalysisService queries Firestore quiz_attempts & study_items, maps prerequisites, and returns JSON report", async () => {
    mockFirestoreDocs.set("quiz_attempts/qa_1", {
      id: "qa_1",
      user_id: "student_addendum_1",
      subject: "Mathematics",
      total_questions: 10,
      correct_count: 5,
      score_pct: 50,
      wrong_item_ids: ["m1", "m2"],
      created_at: "2026-11-16T10:00:00Z",
    });
    mockFirestoreDocs.set("study_items/si_1", {
      id: "si_1",
      user_id: "student_addendum_1",
      kind: "mistake",
      subject: "Mathematics",
      deck: "Linear Equations",
      title: "Lost negative sign when dividing both sides by -2",
      content: "Missed negative sign inversion step",
      mistake_status: "needs_review",
      created_at: "2026-11-16T10:05:00Z",
    });

    const report = await analysisService.analyzeLearningGaps({
      userId: "student_addendum_1",
      masteredNodeIds: [],
    });

    expect(report.sourceMode).toBe("firestore_live");
    expect(report.stats.quizAttemptsAnalyzed).toBe(1);
    expect(report.stats.studyItemsAnalyzed).toBe(1);
    expect(report.weakTopics[0]?.subject).toBe("Mathematics");
    expect(report.detectedGaps.length).toBeGreaterThan(0);
    expect(report.recommendedLessons.length).toBeGreaterThan(0);
    expect(() => JSON.stringify(report)).not.toThrow();
  });

  it("Smart Study Planner computes in background and persists/loads from Firestore smart_study_plans", async () => {
    const cfg = defaultSmartPlannerConfig();
    const res = await computeSmartStudyPlanInBackground(cfg, []);
    expect(res.blocks.length).toBeGreaterThan(0);
    expect(["web_worker", "async_background"]).toContain(res.engine);

    const saved = await saveSmartStudyPlanToFirestore({
      userId: "student_addendum_1",
      config: cfg,
      blocks: res.blocks,
      engine: res.engine,
    });
    expect(saved).toBe(true);

    const loaded = await loadSmartStudyPlanFromFirestore("student_addendum_1");
    expect(loaded).not.toBeNull();
    expect(loaded?.blocks.length).toBe(res.blocks.length);
  });

  it("Exam Simulation Center queries Firestore exam_questions by topic/difficulty and writes Activity Log", async () => {
    const res = await queryExamQuestionsFromFirestore({
      userId: "student_addendum_1",
      config: {
        curriculum: "Kuwait / GCC Secondary",
        subject: "Mathematics",
        topic: "Linear Slope",
        difficulty: "foundation",
        questionCount: 5,
        durationMinutes: 10,
      },
    });
    expect(res.sourceMode).toBe("firestore_query");
    expect(res.questions.length).toBe(5);
    expect(mockCollectionQueries.some((q) => q.path === "exam_questions")).toBe(true);

    const recMock = vi.fn(async () => {});
    const outcome = await recordExamSimulationCompletion({
      userId: "student_addendum_1",
      config: {
        curriculum: "Kuwait / GCC Secondary",
        subject: "Mathematics",
        topic: "Linear Slope",
        difficulty: "foundation",
        questionCount: 5,
        durationMinutes: 10,
      },
      correctCount: 4,
      total: 5,
      scorePct: 80,
      wrongItemIds: ["q_wrong"],
      recordQuizAttempt: recMock,
    });
    expect(recMock).toHaveBeenCalledTimes(1);
    expect(mockAwardXpIfUnique).toHaveBeenCalledTimes(1);
    expect(outcome.loggedToFirestore).toBe(true);
  });

  it("Offline Education deduplicates duplicate offline queue targets by timestamp", async () => {
    const { deduped, resolvedConflicts } = resolveOfflineQueueConflicts([
      {
        id: "1",
        kind: "offline_lesson_complete",
        label: "Lesson A",
        payload: { packId: "pack_1", lessonId: "les_1", refId: "pack_1_les_1" },
        queuedAt: "2026-11-17T08:00:00Z",
      },
      {
        id: "2",
        kind: "offline_lesson_complete",
        label: "Lesson A",
        payload: { packId: "pack_1", lessonId: "les_1", refId: "pack_1_les_1" },
        queuedAt: "2026-11-17T08:05:00Z",
      },
    ]);
    expect(deduped.length).toBe(1);
    expect(deduped[0]?.id).toBe("2");
    expect(resolvedConflicts).toBe(1);

    const syncRes = await syncOfflineQueueToFirestore(deduped, "student_addendum_1");
    expect(syncRes.syncedCount).toBe(1);
    expect(syncRes.syncedToCloud).toBe(true);
  });

  it("Community Libraries supports pending_review submission & Educator Review Queue approval", async () => {
    renderWithProviders(<CommunityLibrariesPanel />);
    fireEvent.click(screen.getByRole("button", { name: /Submit Resource/i }));
    fireEvent.change(screen.getByLabelText(/Title \(English\)/i), {
      target: { value: "Beginner Algebraic Balances Worksheet" },
    });
    fireEvent.change(screen.getByLabelText(/Brief Learning Objective Summary/i), {
      target: { value: "Solve 1-step linear balance equations cleanly." },
    });
    fireEvent.change(screen.getByLabelText(/Lesson Content \/ Body/i), {
      target: { value: "Step 1: Add the additive inverse cleanly on both sides." },
    });
    fireEvent.change(screen.getByLabelText(/Author \/ Maintainer Name/i), {
      target: { value: "Ms. Salma Noor" },
    });
    fireEvent.change(screen.getByLabelText(/Source Reference \/ Citation/i), {
      target: { value: "NEXORA Open Math Commons CC-BY-4.0" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Submit for Review/i }));
    const eco = getStudentEcosystemSnapshot();
    const added = eco.communityResources.find((r) =>
      r.title.includes("Beginner Algebraic Balances"),
    );
    expect(added?.reviewStatus).toBe("pending_review");

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /^Approve$/i }).length).toBeGreaterThan(0);
    });
    fireEvent.click(screen.getAllByRole("button", { name: /^Approve$/i })[0]!);
    const afterApprove = getStudentEcosystemSnapshot().communityResources.find(
      (r) => r.id === added?.id,
    );
    expect(afterApprove?.reviewStatus).toBe("approved");
  });

  it("Teaching for All opens in-app Printable Worksheet dialog & persists ratings", () => {
    renderWithProviders(<TeachingForAllPanel />);
    const printButtons = screen.getAllByRole("button", { name: /Print Worksheet/i });
    fireEvent.click(printButtons[0]!);
    expect(screen.getByText(/Printable Classroom Worksheet/i)).toBeInTheDocument();

    const closeButtons = screen.getAllByRole("button", { name: /Close/i });
    fireEvent.click(closeButtons[0]!);

    fireEvent.click(screen.getByRole("button", { name: /Save Rating/i }));
    const eco = getStudentEcosystemSnapshot();
    expect(eco.teachingGuides[0]?.ratingCount).toBeGreaterThanOrEqual(2);
  });

  it("Knowledge Legacy uses Deprecate Dialog (no window.prompt) and non-destructive Archive toggle", () => {
    renderWithProviders(<KnowledgeLegacyPanel />);
    const depButtons = screen.getAllByRole("button", { name: /^Deprecate$/i });
    fireEvent.click(depButtons[0]!);
    expect(screen.getByText(/Deprecate Contribution With Public Notice/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Mark Deprecated/i }));

    const eco = getStudentEcosystemSnapshot();
    expect(eco.legacyContributions.some((c) => c.status === "deprecated_outdated")).toBe(true);
  });

  it("Real World Good supports draft lifecycle & Knowledge Archive detects checksum tampering", async () => {
    updateStudentEcosystem((prev) => ({
      ...prev,
      archivedPreservationRecords: prev.archivedPreservationRecords.map((r, i) =>
        i === 0 ? { ...r, checksum: "fnv1a_corrupted_0000" } : r,
      ),
    }));

    renderWithProviders(<KnowledgeArchivePanel />);
    fireEvent.click(screen.getByRole("button", { name: /Run Integrity Audit/i }));
    await waitFor(() => {
      expect(screen.getByText(/Mismatch detected in:/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /Restore Canonical/i }));
    expect(screen.getAllByText(/Verification: PASS/i).length).toBeGreaterThan(0);

    cleanup();
    renderWithProviders(<RealWorldGoodPanel />);
    expect(screen.getByTestId("real-world-good-panel")).toBeInTheDocument();
    const reportBtns = screen.getAllByRole("button", { name: /Impact Report/i });
    fireEvent.click(reportBtns[0]!);
    expect(screen.getByText(/Verified Impact Report/i)).toBeInTheDocument();
  });

  it("OfflineEducationPanel caches pack and opens Pack Reader dialog", async () => {
    renderWithProviders(<OfflineEducationPanel />);
    const initialReaders = screen.queryAllByRole("button", { name: /Open Pack Reader/i }).length;
    const dlBtns = screen.getAllByRole("button", { name: /Download Pack/i });
    fireEvent.click(dlBtns[0]!);
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /Open Pack Reader/i }).length).toBeGreaterThan(
        initialReaders,
      );
    });
    const readers = screen.getAllByRole("button", { name: /Open Pack Reader/i });
    fireEvent.click(readers[0]!);
    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: /Complete Offline Lesson \(Queue Sync\)/i }).length,
      ).toBeGreaterThan(0);
    });
  });
});
