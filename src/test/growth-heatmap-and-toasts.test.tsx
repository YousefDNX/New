import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FeatureGuideProvider } from "@/components/common/FeatureGuideModal";
import { ToastProvider, useToast } from "@/components/common/ToastProvider";
import { GrowthHeatmap } from "@/components/growth/GrowthHeatmap";
import { GrowthHistory } from "@/components/growth/GrowthHistory";
import { MilestoneCelebrationWatcher } from "@/components/growth/MilestoneCelebrationWatcher";
import { Toaster } from "@/components/ui/sonner";
import { compute7DayXpVelocity, computeWeeklyProductivityHeatmap } from "@/lib/growth";
import { PreferencesProvider, usePrefs } from "@/lib/preferences";

interface MockStats {
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
}

interface MockTask {
  id: string;
  status: string;
  area: string;
  completed_at: string | null;
  created_at: string;
}

interface MockFocus {
  id: string;
  duration_minutes: number;
  created_at: string;
}

interface MockEvent {
  id: string;
  user_id: string;
  event_type: string;
  area: "academic" | "productivity" | "growth" | "wellbeing" | "career" | "community";
  xp: number;
  created_at: string;
}

const mockDataState: {
  uid: string | null;
  statsLoading: boolean;
  stats: MockStats;
  tasks: MockTask[];
  focusSessions: MockFocus[];
  studyItems: Array<{ id: string; kind: string; mistake_status?: string; created_at: string }>;
  journalEntries: Array<{ id: string; entry_date: string; created_at: string }>;
  events: MockEvent[];
} = {
  uid: "u_heatmap_test",
  statsLoading: false,
  stats: { xp: 100, level: 2, current_streak: 2, longest_streak: 4 },
  tasks: [],
  focusSessions: [],
  studyItems: [],
  journalEntries: [],
  events: [],
};

vi.mock("@/hooks/use-nexora", async () => {
  const actual = await vi.importActual<typeof import("@/hooks/use-nexora")>("@/hooks/use-nexora");
  return {
    ...actual,
    useUser: () => ({ data: mockDataState.uid ? { uid: mockDataState.uid } : null }),
    useStats: () => ({ data: mockDataState.stats, isLoading: mockDataState.statsLoading }),
    useTasks: () => ({ data: mockDataState.tasks, isLoading: false }),
    useGoals: () => ({ data: [], isLoading: false }),
    useActivityEvents: () => ({ data: mockDataState.events, isLoading: false }),
  };
});

vi.mock("@/hooks/use-modules", async () => {
  const actual = await vi.importActual<typeof import("@/hooks/use-modules")>("@/hooks/use-modules");
  return {
    ...actual,
    useFocusSessions: () => ({ data: mockDataState.focusSessions, isLoading: false }),
    useStudyItems: () => ({ data: mockDataState.studyItems, isLoading: false }),
    useFuturePlans: () => ({ data: [], isLoading: false }),
    useCircles: () => ({ data: [], isLoading: false }),
    useCareEntries: () => ({ data: [], isLoading: false }),
    useJournalEntries: () => ({ data: mockDataState.journalEntries, isLoading: false }),
    useQuizAttempts: () => ({ data: [], isLoading: false }),
  };
});

function ToastTriggerHarness() {
  const toast = useToast();
  const { setLang, setA11y } = usePrefs();
  return (
    <div>
      <button
        type="button"
        onClick={() => toast.milestoneAchieved("Focus Momentum", 100, "5 tasks mastered")}
      >
        Fire Congrats
      </button>
      <button type="button" onClick={() => setLang("ar")}>
        Switch to Arabic
      </button>
      <button type="button" onClick={() => toast.milestoneAchieved("طالب مثابر", 150)}>
        Fire Arabic Congrats
      </button>
      <button type="button" onClick={() => setA11y({ reduceMotion: true })}>
        Enable Reduce Motion
      </button>
    </div>
  );
}

describe("Weekly Growth Heatmap engine & Friday velocity label", () => {
  it("maps Friday to growth.days.fri instead of duplicating Thursday", () => {
    // 2026-11-11 is Wednesday -> 2026-11-06 is Friday (offset 5)
    const refToday = new Date("2026-11-11T12:00:00Z");
    const velocity = compute7DayXpVelocity([], refToday);
    const fridayPoint = velocity.find((pt) => pt.dateIso === "2026-11-06");
    expect(fridayPoint?.labelKey).toBe("growth.days.fri");
  });

  it("computes empty and populated calendar grids with intensity levels 0..4", () => {
    const refToday = new Date("2026-11-11T12:00:00Z");
    const empty = computeWeeklyProductivityHeatmap({ weeks: 8, today: refToday });
    expect(empty.cells).toHaveLength(56);
    expect(empty.hasAnyActivity).toBe(false);
    expect(empty.activeDays).toBe(0);
    expect(empty.peakDateIso).toBeNull();

    const active = computeWeeklyProductivityHeatmap({
      weeks: 8,
      today: refToday,
      tasks: [
        {
          status: "done",
          completed_at: "2026-11-10T10:00:00Z",
          created_at: "2026-11-10T08:00:00Z",
        },
        {
          status: "done",
          completed_at: "2026-11-10T14:00:00Z",
          created_at: "2026-11-10T09:00:00Z",
        },
        {
          status: "done",
          completed_at: "2026-11-03T11:00:00Z",
          created_at: "2026-11-03T09:00:00Z",
        },
        { status: "todo", completed_at: null, created_at: "2026-11-11T09:00:00Z" },
      ],
      focusSessions: [
        { duration_minutes: 50, created_at: "2026-11-10T16:00:00Z" },
        { duration_minutes: 25, created_at: "2026-11-01T16:00:00Z" },
      ],
      studyItems: [{ created_at: "2026-11-10T17:00:00Z" }],
      journalEntries: [{ entry_date: "2026-11-10", created_at: "2026-11-10T19:00:00Z" }],
      events: [{ xp: 100, created_at: "2026-11-10T19:00:00Z" }],
    });

    expect(active.hasAnyActivity).toBe(true);
    expect(active.activeDays).toBe(3);
    expect(active.totalTasks).toBe(3);
    expect(active.totalFocusMinutes).toBe(75);
    expect(active.peakDateIso).toBe("2026-11-10");

    const peakCell = active.cells.find((c) => c.dateIso === "2026-11-10");
    expect(peakCell?.intensity).toBe(4);
    expect(peakCell?.tasksCompleted).toBe(2);

    const lightCell = active.cells.find((c) => c.dateIso === "2026-11-01");
    expect(lightCell?.intensity).toBe(1);

    const futureCell = active.cells.find((c) => c.dateIso === "2026-11-13");
    expect(futureCell?.isFuture).toBe(true);
    expect(futureCell?.intensity).toBe(0);
  });
});

describe("GrowthHeatmap Recharts component", () => {
  beforeEach(() => {
    localStorage.clear();
    mockDataState.tasks = [];
    mockDataState.focusSessions = [];
    mockDataState.studyItems = [];
    mockDataState.journalEntries = [];
    mockDataState.events = [];
  });

  afterEach(() => {
    cleanup();
  });

  it("renders honest empty guidance, intensity legend, and timeframe toggles", () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <PreferencesProvider>
          <FeatureGuideProvider>
            <GrowthHeatmap />
          </FeatureGuideProvider>
        </PreferencesProvider>
      </QueryClientProvider>,
    );

    const heatmap = screen.getByTestId("growth-heatmap");
    expect(heatmap).toHaveTextContent("Growth Heatmap");
    expect(screen.getByTestId("growth-heatmap-empty")).toBeInTheDocument();
    expect(heatmap).toHaveTextContent("0 / 84");
    expect(heatmap).toHaveTextContent("Less");
    expect(heatmap).toHaveTextContent("More");

    fireEvent.click(screen.getByTestId("heatmap-window-4w"));
    expect(heatmap).toHaveTextContent("0 / 28");

    fireEvent.click(screen.getByTestId("heatmap-window-8w"));
    expect(heatmap).toHaveTextContent("0 / 56");
  });

  it("aggregates populated productivity metrics into KPIs cleanly", () => {
    const todayIso = new Date().toISOString().slice(0, 10);
    mockDataState.tasks = [
      {
        id: "t1",
        status: "done",
        area: "academic",
        completed_at: `${todayIso}T10:00:00Z`,
        created_at: `${todayIso}T08:00:00Z`,
      },
      {
        id: "t2",
        status: "done",
        area: "productivity",
        completed_at: `${todayIso}T12:00:00Z`,
        created_at: `${todayIso}T09:00:00Z`,
      },
    ];
    mockDataState.focusSessions = [
      { id: "fs1", duration_minutes: 45, created_at: `${todayIso}T11:00:00Z` },
    ];
    mockDataState.events = [
      {
        id: "ev1",
        user_id: "u_heatmap_test",
        event_type: "TASK_COMPLETED",
        area: "academic",
        xp: 60,
        created_at: `${todayIso}T12:00:00Z`,
      },
    ];

    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <PreferencesProvider>
          <FeatureGuideProvider>
            <GrowthHeatmap />
          </FeatureGuideProvider>
        </PreferencesProvider>
      </QueryClientProvider>,
    );

    const heatmap = screen.getByTestId("growth-heatmap");
    expect(screen.queryByTestId("growth-heatmap-empty")).not.toBeInTheDocument();
    expect(heatmap).toHaveTextContent("1 / 84");
    expect(heatmap).toHaveTextContent("45 min");
    expect(heatmap).toHaveTextContent("+60 XP");
  });
});

describe("Animated Congratulations Milestone Toast & Watcher", () => {
  beforeEach(() => {
    localStorage.clear();
    mockDataState.uid = "u_milestone_test";
    mockDataState.statsLoading = false;
    mockDataState.stats = { xp: 100, level: 2, current_streak: 1, longest_streak: 1 };
    mockDataState.tasks = [];
    mockDataState.focusSessions = [];
    mockDataState.studyItems = [];
    mockDataState.journalEntries = [];
    mockDataState.events = [];
  });

  afterEach(() => {
    cleanup();
  });

  it("displays localized animated Congratulations toast and respects reduce-motion preference", async () => {
    render(
      <PreferencesProvider>
        <ToastProvider>
          <ToastTriggerHarness />
          <Toaster position="top-center" />
        </ToastProvider>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByText("Fire Congrats"));
    const toastCard = await screen.findByTestId("milestone-congrats-toast");
    expect(toastCard).toHaveTextContent("Congratulations!");
    expect(toastCard).toHaveTextContent("Focus Momentum");
    expect(toastCard).toHaveTextContent("+100 XP");
    expect(toastCard.className).toContain("toast-congrats-card");

    fireEvent.click(screen.getByText("Enable Reduce Motion"));
    fireEvent.click(screen.getByText("Switch to Arabic"));
    await waitFor(() => {
      expect(document.documentElement.dir).toBe("rtl");
    });
    fireEvent.click(screen.getByText("Fire Arabic Congrats"));
    await waitFor(() => {
      const toasts = screen.getAllByTestId("milestone-congrats-toast");
      const arToast = toasts.find((el) => el.getAttribute("dir") === "rtl");
      expect(arToast).toBeDefined();
      expect(arToast).toHaveTextContent("تهانينا!");
      expect(arToast?.getAttribute("data-reduced-motion")).toBe("true");
      expect(arToast?.className).not.toContain("toast-congrats-card");
    });
  });

  it("stays silent during initial hydration and fires Congratulations toast only on new milestone unlock", async () => {
    const qc = new QueryClient();
    const { rerender } = render(
      <QueryClientProvider client={qc}>
        <PreferencesProvider>
          <ToastProvider>
            <MilestoneCelebrationWatcher />
            <Toaster position="top-center" />
          </ToastProvider>
        </PreferencesProvider>
      </QueryClientProvider>,
    );

    // Initial hydration with level 2 unlocked should NOT fire a celebration toast
    expect(screen.queryByTestId("milestone-congrats-toast")).not.toBeInTheDocument();

    // Advance user stats to level 3 -> unlocks Focus Momentum (level 3 milestone)
    act(() => {
      mockDataState.stats = { xp: 240, level: 3, current_streak: 2, longest_streak: 2 };
    });

    rerender(
      <QueryClientProvider client={qc}>
        <PreferencesProvider>
          <ToastProvider>
            <MilestoneCelebrationWatcher />
            <Toaster position="top-center" />
          </ToastProvider>
        </PreferencesProvider>
      </QueryClientProvider>,
    );

    const toastEl = await screen.findByTestId("milestone-congrats-toast");
    expect(toastEl).toHaveTextContent("Congratulations!");
    expect(toastEl).toHaveTextContent("Focus Momentum");
  });
});

describe("GrowthHistory canonical XP event normalization", () => {
  beforeEach(() => {
    localStorage.clear();
    const todayIso = new Date().toISOString().slice(0, 10);
    mockDataState.events = [
      {
        id: "e1",
        user_id: "u_hist",
        event_type: "TASK_COMPLETED",
        area: "academic",
        xp: 20,
        created_at: `${todayIso}T10:00:00Z`,
      },
      {
        id: "e2",
        user_id: "u_hist",
        event_type: "MILESTONE_COMPLETED",
        area: "growth",
        xp: 100,
        created_at: `${todayIso}T11:00:00Z`,
      },
      {
        id: "e3",
        user_id: "u_hist",
        event_type: "QUIZ_COMPLETED",
        area: "academic",
        xp: 35,
        created_at: `${todayIso}T12:00:00Z`,
      },
    ];
  });

  afterEach(() => {
    cleanup();
  });

  it("renders readable canonical titles and filters Milestones and Study tabs accurately", () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <PreferencesProvider>
          <FeatureGuideProvider>
            <GrowthHistory />
          </FeatureGuideProvider>
        </PreferencesProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByText("Completed Task")).toBeInTheDocument();
    expect(screen.getByText("Growth Milestone Achieved")).toBeInTheDocument();
    expect(screen.getByText("Practice Quiz Completed")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Milestones" }));
    expect(screen.getByText("Growth Milestone Achieved")).toBeInTheDocument();
    expect(screen.queryByText("Completed Task")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Study" }));
    expect(screen.getByText("Practice Quiz Completed")).toBeInTheDocument();
    expect(screen.queryByText("Growth Milestone Achieved")).not.toBeInTheDocument();
  });
});
