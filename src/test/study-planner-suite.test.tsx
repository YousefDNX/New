import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudyPlannerSuite } from "@/components/study/StudyPlannerSuite";
import {
  createManualStudyBlock,
  summarizeDailyStudyProgress,
  summarizePlannedVsCompletedByMonth,
} from "@/lib/study-planner";
import { PreferencesProvider } from "@/lib/preferences";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { resetCurrentEcosystemSandbox } from "@/lib/student-ecosystem";

const mockLogFocusSession = vi.fn().mockResolvedValue({
  id: "focus-1",
  user_id: "u-planner",
  title: "Manual Algebra",
  area: "academic",
  subject: "Mathematics",
  duration_minutes: 45,
  completed: true,
  created_at: new Date().toISOString(),
});

const todayIso = new Date().toISOString().slice(0, 10);

vi.mock("@/hooks/use-nexora", () => ({
  useUser: () => ({ data: { uid: "u-planner" }, isLoading: false }),
}));

vi.mock("@/hooks/use-modules", () => ({
  useFocusSessions: () => ({
    data: [
      {
        id: "fs-today-1",
        user_id: "u-planner",
        title: "Morning Biology Review",
        area: "academic",
        subject: "Biology",
        duration_minutes: 30,
        completed: true,
        created_at: `${todayIso}T09:00:00.000Z`,
      },
    ],
  }),
  useFocusActions: () => ({
    logFocusSession: mockLogFocusSession,
  }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <PreferencesProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  );
}

describe("Study Planner Enhancements (Progress Bar, Quick Log, Planned vs Completed Calendar)", () => {
  beforeEach(() => {
    localStorage.clear();
    resetCurrentEcosystemSandbox();
    mockLogFocusSession.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("summarizes daily progress accurately without double counting", () => {
    const blocks = [
      createManualStudyBlock({
        dayIso: todayIso,
        subject: "Physics",
        topic: "Waves",
        durationMin: 30,
      }),
      {
        ...createManualStudyBlock({
          dayIso: todayIso,
          subject: "English",
          topic: "Essay",
          durationMin: 15,
        }),
        status: "completed" as const,
      },
    ];
    const focusSessions = [
      { duration_minutes: 30, completed: true, created_at: `${todayIso}T08:00:00.000Z` },
    ];
    const summary = summarizeDailyStudyProgress({
      blocks,
      focusSessions,
      targetMinutes: 90,
      targetDayIso: todayIso,
    });
    expect(summary.completedFocusMinutes).toBe(30);
    expect(summary.completedBlockMinutes).toBe(15);
    expect(summary.completedMinutes).toBe(45);
    expect(summary.plannedMinutes).toBe(45);
    expect(summary.pct).toBe(50);
    expect(summary.remainingMinutes).toBe(45);
  });

  it("computes planned vs completed calendar month cells cleanly", () => {
    const monthDate = new Date(Date.UTC(2026, 10, 1));
    const blocks = [
      createManualStudyBlock({
        dayIso: "2026-11-12",
        subject: "Math",
        topic: "Equations",
        durationMin: 40,
      }),
    ];
    const focusSessions = [
      {
        id: "f1",
        title: "Drill",
        subject: "Math",
        duration_minutes: 25,
        completed: true,
        created_at: "2026-11-12T16:00:00.000Z",
      },
    ];
    const cells = summarizePlannedVsCompletedByMonth({
      monthDate,
      blocks,
      focusSessions,
    });
    expect(cells).toHaveLength(42);
    const nov12 = cells.find((c) => c.dayIso === "2026-11-12");
    expect(nov12?.plannedMinutes).toBe(40);
    expect(nov12?.completedMinutes).toBe(25);
  });

  it("renders daily progress bar, Quick Log submission, and session creation + completion toggle", async () => {
    render(
      <Wrapper>
        <StudyPlannerSuite />
      </Wrapper>,
    );

    // 30m logged / 60m default target => 50%
    expect(screen.getByTestId("daily-progress-pct").textContent).toBe("50%");

    // Quick Log submit
    fireEvent.change(screen.getByTestId("quick-log-title"), {
      target: { value: "Missed Calculus Sheet" },
    });
    fireEvent.change(screen.getByTestId("quick-log-duration"), {
      target: { value: "45" },
    });
    fireEvent.click(screen.getByTestId("quick-log-submit"));

    await waitFor(() => {
      expect(mockLogFocusSession).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Missed Calculus Sheet",
          durationMinutes: 45,
        }),
      );
    });

    // Create a planned study session for today
    fireEvent.change(screen.getByTestId("plan-session-topic"), {
      target: { value: "Organic Chemistry Flashcards" },
    });
    fireEvent.change(screen.getByTestId("plan-session-duration"), {
      target: { value: "30" },
    });
    fireEvent.click(screen.getByTestId("plan-session-submit"));

    expect(await screen.findByText(/Organic Chemistry Flashcards/i)).toBeTruthy();

    // Mark planned session as completed and verify daily progress rises to 100% (30m focus + 30m block = 60/60)
    fireEvent.click(screen.getByRole("button", { name: /^Mark Completed$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("daily-progress-pct").textContent).toBe("100%");
    });
  });
});
