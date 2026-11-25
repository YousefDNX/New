import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { PreferencesProvider } from "@/lib/preferences";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/common/ToastProvider";
import { StudyWorkspace } from "@/components/modules/StudyWorkspace";
import { SimpleSkillsWorkspace } from "@/components/modules/SimpleSkillsWorkspace";
import { ProductivityFocusWorkspace } from "@/components/modules/ProductivityFocusWorkspace";
import { WellbeingWorkspace } from "@/components/modules/WellbeingWorkspace";
import { SimpleFutureWorkspace } from "@/components/modules/SimpleFutureWorkspace";
import { SimpleOpportunitiesWorkspace } from "@/components/modules/SimpleOpportunitiesWorkspace";
import { SimpleCircleWorkspace } from "@/components/modules/SimpleCircleWorkspace";
import { SimpleEnglishWorkspace } from "@/components/modules/SimpleEnglishWorkspace";
import { getLastVisitedModule } from "@/lib/continue-tracker";

const mockAddTask = vi.fn(async () => ({ id: "t-new" }));
const mockAddGoal = vi.fn(async () => undefined);
const mockLogFocusSession = vi.fn(async () => ({ id: "fs-1" }));
const mockAddTimeBlock = vi.fn(async () => ({ id: "tb-1" }));
const mockAddCareEntry = vi.fn(async () => ({ id: "care-1" }));
const mockAddJournalEntry = vi.fn(async () => ({ id: "j-1" }));
const mockSaveFuturePlan = vi.fn(async () => ({ id: "fp-1" }));
const mockSaveOpportunity = vi.fn(async () => ({ id: "opp-1" }));
const mockCreatePost = vi.fn(async () => ({ id: "post-1" }));

vi.mock("@/lib/auth", () => ({
  useOptionalAuth: () => ({ user: { uid: "student-guest-1", displayName: "Student Guest" } }),
}));

vi.mock("@/hooks/use-nexora", () => ({
  useUser: () => ({ data: { uid: "student-guest-1", displayName: "Student Guest" } }),
  useProfile: () => ({
    data: { id: "student-guest-1", display_name: "Sara", language: "en" },
  }),
  useTasks: () => ({ data: [] }),
  useTaskActions: () => ({
    addTask: mockAddTask,
    completeTask: vi.fn(async () => undefined),
    deleteTask: vi.fn(async () => undefined),
    clearCompletedTasks: vi.fn(async () => undefined),
  }),
  useGoals: () => ({ data: [] }),
  useGoalActions: () => ({
    addGoal: mockAddGoal,
    toggleGoal: vi.fn(async () => undefined),
    deleteGoal: vi.fn(async () => undefined),
  }),
}));

vi.mock("@/hooks/use-modules", () => ({
  useFocusSessions: () => ({ data: [] }),
  useFocusActions: () => ({ logFocusSession: mockLogFocusSession }),
  useTimeBlocks: () => ({ data: [] }),
  useTimeBlockActions: () => ({
    addTimeBlock: mockAddTimeBlock,
    toggleTimeBlock: vi.fn(async () => undefined),
    deleteTimeBlock: vi.fn(async () => undefined),
  }),
  useCareEntries: () => ({ data: [] }),
  useCareActions: () => ({
    addCareEntry: mockAddCareEntry,
    deleteCareEntry: vi.fn(async () => undefined),
  }),
  useJournalEntries: () => ({ data: [] }),
  useJournalActions: () => ({
    addJournalEntry: mockAddJournalEntry,
    deleteJournalEntry: vi.fn(async () => undefined),
  }),
  useFuturePlans: () => ({ data: [] }),
  useFutureActions: () => ({
    saveFuturePlan: mockSaveFuturePlan,
    updateFuturePlan: vi.fn(async () => undefined),
    deleteFuturePlan: vi.fn(async () => undefined),
  }),
  useOpportunities: () => ({ data: [] }),
  useOpportunityActions: () => ({
    saveOpportunity: mockSaveOpportunity,
    updateOpportunityStatus: vi.fn(async () => undefined),
    updateOpportunityNotes: vi.fn(async () => undefined),
    deleteOpportunity: vi.fn(async () => undefined),
  }),
  useCommunityPosts: () => ({ data: [] }),
  useCommunityComments: () => ({ data: [] }),
  useCommunityReactions: () => ({ data: [] }),
  useSavedPosts: () => ({ data: [] }),
  useCommunityActions: () => ({
    createPost: mockCreatePost,
    deletePost: vi.fn(async () => undefined),
    addComment: vi.fn(async () => undefined),
    deleteComment: vi.fn(async () => undefined),
    toggleReaction: vi.fn(async () => undefined),
    toggleSavePost: vi.fn(async () => undefined),
  }),
}));

function renderModule(ui: ReactNode) {
  return render(
    <ThemeProvider>
      <PreferencesProvider>
        <ToastProvider>{ui}</ToastProvider>
      </PreferencesProvider>
    </ThemeProvider>,
  );
}

describe("BTC Restored & Simplified Educational Modules", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("StudyWorkspace includes Unit 1-4 summaries & revision tracking and updates Continue tracker", () => {
    renderModule(<StudyWorkspace />);
    expect(getLastVisitedModule("student-guest-1")?.path).toBe("/app/study");

    fireEvent.click(screen.getByRole("button", { name: /Lesson Summaries & Revision/i }));
    expect(screen.getByText(/Unit 1 — Explorers, Grit & Mindset/i)).toBeInTheDocument();
    expect(screen.getByText(/Unit 4 — Mindful Living & Conservation/i)).toBeInTheDocument();

    const markButtons = screen.getAllByRole("button", { name: /Mark Revised/i });
    expect(markButtons.length).toBe(4);
    fireEvent.click(markButtons[0]!);
    expect(screen.getByRole("button", { name: /^Revised$/i })).toBeInTheDocument();
  });

  it("SimpleSkillsWorkspace exposes 8 core skills with micro-lessons and persisted practice steps", () => {
    renderModule(<SimpleSkillsWorkspace />);
    expect(getLastVisitedModule("student-guest-1")?.path).toBe("/app/skills");

    expect(screen.getAllByText("Clear Communication").length).toBeGreaterThan(0);
    expect(screen.getByText("Digital Literacy & Online Safety")).toBeInTheDocument();

    const stepBtn = screen.getByRole("button", {
      name: /Summarize a classmate's point in one sentence/i,
    });
    fireEvent.click(stepBtn);
    expect(screen.getByText(/1 of 24 practice steps completed/i)).toBeInTheDocument();
  });

  it("ProductivityFocusWorkspace provides Tasks, Goals, Focus Timer, and Time Organizer tabs", () => {
    renderModule(<ProductivityFocusWorkspace />);
    expect(getLastVisitedModule("student-guest-1")?.path).toBe("/app/tasks");

    expect(screen.getByRole("button", { name: /^Tasks \(0\)$/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Goals \(0\)$/i }));
    expect(screen.getByRole("button", { name: /Add Goal/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Focus Timer/i }));
    expect(screen.getByText("25:00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Time Organizer/i }));
    expect(screen.getByPlaceholderText(/e\.g\. Grammar review/i)).toBeInTheDocument();
  });

  it("WellbeingWorkspace exposes Emotional Check-In, Journal, Healthy Habits, and Calm Routines without XP clutter", () => {
    renderModule(<WellbeingWorkspace />);
    expect(getLastVisitedModule("student-guest-1")?.path).toBe("/app/care");

    expect(screen.queryByText(/\bXP\b/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Healthy Habits/i }));
    expect(screen.getByText(/Drink enough water today/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Calm Routines/i }));
    expect(screen.getByText(/Calm Box Breathing/i)).toBeInTheDocument();
    expect(screen.getByText(/5-4-3-2-1 Grounding/i)).toBeInTheDocument();
  });

  it("SimpleFutureWorkspace renders Professions, Specializations, Educational Pathways, and My Career Plans", () => {
    renderModule(<SimpleFutureWorkspace />);
    expect(getLastVisitedModule("student-guest-1")?.path).toBe("/app/future");

    expect(screen.getByText("Software & AI Engineer")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Specializations/i }));
    expect(screen.getByText("Computer Science & Artificial Intelligence")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /My Career Plans \(0\)/i }));
    expect(screen.getByPlaceholderText(/e\.g\. Computer Engineering/i)).toBeInTheDocument();
  });

  it("SimpleOpportunitiesWorkspace supports browsing curated catalog and switching to My Saved Tracker", () => {
    renderModule(<SimpleOpportunitiesWorkspace />);
    expect(getLastVisitedModule("student-guest-1")?.path).toBe("/app/opportunities");

    expect(screen.getByPlaceholderText(/Search programs or organizers/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /My Saved Tracker \(0\)/i }));
    expect(screen.getByPlaceholderText("https://...")).toBeInTheDocument();
  });

  it("SimpleCircleWorkspace renders shared unified Knowledge Circle without gender separation and enforces PII guardrails", () => {
    renderModule(<SimpleCircleWorkspace />);
    expect(getLastVisitedModule("student-guest-1")?.path).toBe("/app/circle");

    expect(screen.getByText(/A shared student space/i)).toBeInTheDocument();
    expect(screen.queryByText(/Invite Code/i)).toBeNull();

    const bodyInput = screen.getByPlaceholderText(/Ask a clear study question/i);
    fireEvent.change(bodyInput, { target: { value: "Email me at test@student.edu" } });
    fireEvent.click(screen.getByRole("button", { name: /Publish Post/i }));
    expect(mockCreatePost).not.toHaveBeenCalled();
  });

  it("SimpleEnglishWorkspace exposes all 6 English skills cleanly unlocked", () => {
    renderModule(<SimpleEnglishWorkspace />);
    expect(getLastVisitedModule("student-guest-1")?.path).toBe("/app/english");

    for (const label of ["Vocabulary", "Listening", "Reading", "Grammar", "Speaking", "Writing"]) {
      expect(
        screen.getByRole("button", { name: new RegExp(`^${label}$`, "i") }),
      ).toBeInTheDocument();
    }
  });
});
