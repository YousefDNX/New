import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PreferencesProvider } from "@/lib/preferences";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import {
  MilestoneProgressBar,
  computeMilestoneProgress,
} from "@/components/dashboard/MilestoneProgressBar";
import { ThisWeekGoalsCard, getIsoWeekKey } from "@/components/dashboard/ThisWeekGoalsCard";
import { ThemePreviewOverlay } from "@/components/theme/ThemePreviewOverlay";
import { Badges, BadgesWidget } from "@/components/dashboard/BadgesWidget";
import { THEME_CATALOG } from "@/lib/theme-catalog";

const mockAddGoal = vi.fn().mockResolvedValue({});
const mockUpdateGoal = vi.fn().mockResolvedValue({});
const mockToggleGoal = vi.fn().mockResolvedValue(undefined);
const mockFetchClaimed = vi.fn().mockResolvedValue(new Set<string>(["ach_pioneer"]));
const mockClaimAchievement = vi
  .fn()
  .mockResolvedValue({ success: true, xpAwarded: 50, achievement: null });

let mockGoalsData: Array<{
  id: string;
  user_id: string;
  title: string;
  area: "academic" | "productivity" | "wellbeing";
  status: "active" | "completed";
  is_daily: boolean;
  target_date: string | null;
  created_at: string;
  completed_at: string | null;
  last_reset_date: string | null;
}> = [];

vi.mock("@/hooks/use-nexora", () => ({
  useUser: () => ({ data: { uid: "test-user-1" }, isLoading: false }),
  useStats: () => ({
    data: {
      user_id: "test-user-1",
      xp: 350,
      level: 3,
      current_streak: 4,
      longest_streak: 4,
      last_active_date: "2026-11-18",
      updated_at: "2026-11-18T00:00:00Z",
    },
  }),
  useTasks: () => ({
    data: [
      { id: "t1", user_id: "test-user-1", status: "done", title: "Task 1" },
      { id: "t2", user_id: "test-user-1", status: "done", title: "Task 2" },
    ],
  }),
  useGoals: () => ({
    data: mockGoalsData,
    isLoading: false,
  }),
  useGoalActions: () => ({
    addGoal: mockAddGoal,
    updateGoal: mockUpdateGoal,
    toggleGoal: mockToggleGoal,
    deleteGoal: vi.fn(),
    resetAllDailyGoals: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-modules", () => ({
  useFocusSessions: () => ({ data: [{ id: "f1" }] }),
  useStudyItems: () => ({
    data: [
      { id: "s1", kind: "note" },
      { id: "s2", kind: "flashcard" },
      { id: "s3", kind: "mistake", mistake_status: "mastered" },
    ],
  }),
  useCareEntries: () => ({ data: [] }),
  useJournalEntries: () => ({ data: [] }),
  useQuizAttempts: () => ({ data: [] }),
  useFuturePlans: () => ({ data: [] }),
  useCircles: () => ({ data: [] }),
}));

vi.mock("@/lib/achievement-service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/achievement-service")>();
  return {
    ...actual,
    fetchUserClaimedAchievements: (
      ...args: Parameters<typeof actual.fetchUserClaimedAchievements>
    ) => mockFetchClaimed(...args),
    claimAchievementInFirestore: (...args: Parameters<typeof actual.claimAchievementInFirestore>) =>
      mockClaimAchievement(...args),
  };
});

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <PreferencesProvider>
        <ThemeProvider>{ui}</ThemeProvider>
      </PreferencesProvider>
    </QueryClientProvider>,
  );
}

describe("Dashboard & Theme New Features", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGoalsData = [];
    localStorage.clear();
  });

  it("computes overall milestone progress and renders MilestoneProgressBar", () => {
    const progress = computeMilestoneProgress({
      level: 3,
      completedTasks: 5,
      completedGoals: 3,
      studyItemsCount: 3,
      focusSessionsCount: 1,
    });
    expect(progress.academicCount).toBe(4);
    expect(progress.personalCount).toBe(4);
    expect(progress.overallPercentage).toBe(Math.round((8 / 12) * 100));

    renderWithProviders(<MilestoneProgressBar />);
    expect(screen.getByTestId("milestone-progress-bar")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders ThisWeekGoalsCard form for 3 weekly goals and saves via addGoal", async () => {
    renderWithProviders(<ThisWeekGoalsCard />);
    expect(screen.getByTestId("this-week-goals-card")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("weekly-goal-input-1"), {
      target: { value: "Master Chemistry Ch 4" },
    });
    fireEvent.change(screen.getByTestId("weekly-goal-input-2"), {
      target: { value: "Complete 4 Pomodoro sprints" },
    });
    fireEvent.change(screen.getByTestId("weekly-goal-input-3"), {
      target: { value: "Sleep 8 hours nightly" },
    });

    fireEvent.click(screen.getByTestId("save-weekly-goals-btn"));

    await waitFor(() => {
      expect(mockAddGoal).toHaveBeenCalledTimes(3);
    });
    expect(mockAddGoal).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Master Chemistry Ch 4",
        is_daily: false,
        target_date: getIsoWeekKey(),
      }),
    );
  });

  it("updates existing weekly goals in place without duplicating when editing", async () => {
    const week = getIsoWeekKey();
    mockGoalsData = [
      {
        id: "g1",
        user_id: "test-user-1",
        title: "Goal A",
        area: "academic",
        status: "active",
        is_daily: false,
        target_date: week,
        created_at: "2026-11-18T00:00:00Z",
        completed_at: null,
        last_reset_date: null,
      },
      {
        id: "g2",
        user_id: "test-user-1",
        title: "Goal B",
        area: "productivity",
        status: "completed",
        is_daily: false,
        target_date: week,
        created_at: "2026-11-18T00:01:00Z",
        completed_at: "2026-11-18T01:00:00Z",
        last_reset_date: null,
      },
      {
        id: "g3",
        user_id: "test-user-1",
        title: "Goal C",
        area: "wellbeing",
        status: "active",
        is_daily: false,
        target_date: week,
        created_at: "2026-11-18T00:02:00Z",
        completed_at: null,
        last_reset_date: null,
      },
    ];

    renderWithProviders(<ThisWeekGoalsCard />);
    expect(screen.getByTestId("weekly-goal-item-0")).toHaveTextContent("Goal A");
    fireEvent.click(screen.getByTestId("edit-weekly-goals-btn"));

    fireEvent.change(screen.getByTestId("weekly-goal-input-1"), {
      target: { value: "Goal A Updated" },
    });
    fireEvent.click(screen.getByTestId("save-weekly-goals-btn"));

    await waitFor(() => {
      expect(mockUpdateGoal).toHaveBeenCalledTimes(3);
    });
    expect(mockAddGoal).not.toHaveBeenCalled();
  });

  it("previews all 10 presets in ThemePreviewOverlay without applying until confirmed", async () => {
    renderWithProviders(<ThemePreviewOverlay />);
    fireEvent.click(screen.getByTestId("open-theme-preview-overlay-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("theme-preview-overlay")).toBeInTheDocument();
    });

    for (const preset of THEME_CATALOG) {
      expect(screen.getByTestId(`preview-preset-card-${preset.id}`)).toBeInTheDocument();
    }

    const targetPreset = THEME_CATALOG[1]!;

    // Selecting a theme updates preview only — does not mutate document themePreset yet
    const initialPreset = document.documentElement.dataset["themePreset"];
    fireEvent.click(screen.getByTestId(`preview-preset-card-${targetPreset.id}`));
    expect(document.documentElement.dataset["themePreset"]).toBe(initialPreset);

    // Clicking Apply persists and applies the previewed theme
    fireEvent.click(screen.getByTestId("apply-previewed-theme-btn"));
    await waitFor(() => {
      expect(localStorage.getItem("themePreset")).toBe(targetPreset.id);
      expect(document.documentElement.dataset["themePreset"]).toBe(targetPreset.id);
    });
  });

  it("renders Badges dashboard widget synced with Firestore achievements", async () => {
    expect(Badges).toBe(BadgesWidget);
    renderWithProviders(<Badges />);

    await waitFor(() => {
      expect(mockFetchClaimed).toHaveBeenCalledWith("test-user-1");
    });

    expect(screen.getByTestId("dashboard-badges")).toBeInTheDocument();
    expect(screen.getByTestId("badge-card-ach_pioneer")).toHaveAttribute("data-claimed", "true");
    expect(screen.getByTestId("badge-card-ach_first_task")).toHaveAttribute(
      "data-unlocked",
      "true",
    );
  });
});
