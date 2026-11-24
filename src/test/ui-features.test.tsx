import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { PreferencesProvider } from "@/lib/preferences";
import { ThemeProvider, useTheme } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/common/ToastProvider";
import { GrowthMap } from "@/components/growth/GrowthMap";
import { PomodoroTimerWidget } from "@/components/dashboard/PomodoroTimerWidget";
import { DailyJournal } from "@/components/journal/DailyJournal";
import { InteractiveCalendar } from "@/components/productivity/InteractiveCalendar";
import { AuthContext, ProtectedRoute, type AuthContextValue } from "@/lib/auth";
import type { User } from "firebase/auth";

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

const mockLogFocusSession = vi.fn(async () => ({
  id: "focus_1",
  user_id: "u1",
  title: "Physics Drill",
  area: "academic" as const,
  subject: "Physics",
  duration_minutes: 25,
  completed: true,
  created_at: new Date().toISOString(),
}));

const mockAddJournalEntry = vi.fn(async () => ({
  id: "journal_new",
  user_id: "u1",
  entry_date: new Date().toISOString().slice(0, 10),
  title: "New Reflection",
  reflection: "Practiced limits and continuity",
  key_win: null,
  next_step: null,
  subject: "Calculus",
  area: "academic" as const,
  mood: "focused" as const,
  study_minutes: 40,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));
const mockUpdateJournalEntry = vi.fn(async () => undefined);
const mockDeleteJournalEntry = vi.fn(async () => undefined);

const mockAddTask = vi.fn(async () => undefined);
const mockCompleteTask = vi.fn(async () => undefined);
const mockUpdateTask = vi.fn(async () => undefined);
const mockAddStudyItem = vi.fn(async () => undefined);

vi.mock("@/hooks/use-nexora", async () => {
  const actual = await vi.importActual<typeof import("@/hooks/use-nexora")>("@/hooks/use-nexora");
  const todayIso = new Date().toISOString().slice(0, 10);
  return {
    ...actual,
    useTasks: () => ({
      data: [
        {
          id: "cal_task_1",
          user_id: "u1",
          title: "Biology Diagram Review",
          details: null,
          priority: "high",
          status: "todo",
          area: "academic",
          subject: "Biology",
          due_at: `${todayIso}T12:00:00Z`,
          goal_id: null,
          completed_at: null,
          created_at: `${todayIso}T08:00:00Z`,
        },
      ],
    }),
    useTaskActions: () => ({
      addTask: mockAddTask,
      completeTask: mockCompleteTask,
      updateTask: mockUpdateTask,
      clearCompletedTasks: vi.fn(async () => undefined),
      updateSubtasks: vi.fn(),
      deleteTask: vi.fn(),
    }),
    useGoals: () => ({
      data: [
        {
          id: "cal_goal_1",
          user_id: "u1",
          title: "Complete Chapter 4",
          area: "academic",
          status: "active",
          target_date: todayIso,
          completed_at: null,
          created_at: `${todayIso}T08:00:00Z`,
        },
      ],
    }),
  };
});

vi.mock("@/hooks/use-modules", () => {
  const todayIso = new Date().toISOString().slice(0, 10);
  return {
    useFocusSessions: () => ({
      data: [
        {
          id: "f_today",
          user_id: "u1",
          title: "Morning Algebra",
          area: "academic",
          subject: "Mathematics",
          duration_minutes: 25,
          completed: true,
          created_at: `${todayIso}T10:00:00Z`,
        },
      ],
    }),
    useFocusActions: () => ({
      logFocusSession: mockLogFocusSession,
    }),
    useQuizAttempts: () => ({
      data: [
        {
          id: "q_today",
          user_id: "u1",
          subject: "Chemistry",
          total_questions: 10,
          correct_count: 9,
          score_pct: 90,
          wrong_item_ids: [],
          created_at: `${todayIso}T11:00:00Z`,
        },
      ],
    }),
    useStudyItems: () => ({
      data: [
        {
          id: "card_due_1",
          user_id: "u1",
          kind: "flashcard",
          subject: "Biology",
          deck: "Cell",
          title: "ATP role",
          content: "ATP role",
          answer: "Energy carrier",
          difficulty: "medium",
          mistake_reason: null,
          mistake_status: "open",
          review_count: 0,
          next_review_at: `${todayIso}T08:00:00Z`,
          created_at: `${todayIso}T08:00:00Z`,
          updated_at: `${todayIso}T08:00:00Z`,
        },
      ],
    }),
    useStudyActions: () => ({
      addStudyItem: mockAddStudyItem,
      reviewFlashcard: vi.fn(async () => undefined),
      updateStudyItem: vi.fn(async () => undefined),
      updateMistakeStatus: vi.fn(async () => undefined),
      deleteStudyItem: vi.fn(async () => undefined),
      recordQuizAttempt: vi.fn(async () => undefined),
    }),
    useJournalEntries: () => ({
      isLoading: false,
      data: [
        {
          id: "jn_1",
          user_id: "u1",
          entry_date: todayIso,
          title: "Solved Physics Kinematics",
          reflection: "Cleared projectile motion doubts cleanly.",
          key_win: "Zero calculation mistakes",
          next_step: "Review circular motion",
          subject: "Physics",
          area: "academic",
          mood: "confident",
          study_minutes: 45,
          tags: ["physics"],
          created_at: `${todayIso}T15:00:00Z`,
          updated_at: `${todayIso}T15:00:00Z`,
        },
      ],
    }),
    useJournalActions: () => ({
      addJournalEntry: mockAddJournalEntry,
      updateJournalEntry: mockUpdateJournalEntry,
      deleteJournalEntry: mockDeleteJournalEntry,
    }),
  };
});

function ThemeHarness() {
  const { uiTheme, bgStyle, shadowLevel, setUiTheme, setBgStyle, setShadowLevel } = useTheme();
  return (
    <div>
      <span data-testid="theme-state">
        {uiTheme}|{bgStyle}|{shadowLevel}
      </span>
      <button type="button" onClick={() => setUiTheme("creative")}>
        Set Creative
      </button>
      <button type="button" onClick={() => setBgStyle("grid")}>
        Set Grid
      </button>
      <button type="button" onClick={() => setShadowLevel("rich")}>
        Set Rich
      </button>
    </div>
  );
}

describe("ThemeProvider DOM attributes and state sync", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("manages data-ui-theme, data-bg-style, and data-shadow-level with PreferencesProvider sync", () => {
    render(
      <PreferencesProvider>
        <ThemeProvider>
          <ThemeHarness />
        </ThemeProvider>
      </PreferencesProvider>,
    );

    expect(document.documentElement.getAttribute("data-ui-theme")).toBe("classic");
    expect(document.documentElement.getAttribute("data-bg-style")).toBe("ambient");
    expect(document.documentElement.getAttribute("data-shadow-level")).toBe("soft");

    fireEvent.click(screen.getByText("Set Creative"));
    fireEvent.click(screen.getByText("Set Grid"));
    fireEvent.click(screen.getByText("Set Rich"));

    expect(document.documentElement.getAttribute("data-ui-theme")).toBe("creative");
    expect(document.documentElement.getAttribute("data-bg-style")).toBe("grid");
    expect(document.documentElement.getAttribute("data-shadow-level")).toBe("rich");
    expect(localStorage.getItem("nexora-ui-theme")).toBe("creative");
    expect(localStorage.getItem("nexora-bg-style")).toBe("grid");
    expect(localStorage.getItem("nexora-shadow-level")).toBe("rich");
    expect(screen.getByTestId("theme-state")).toHaveTextContent("creative|grid|rich");
  });
});

describe("Visual GrowthMap component", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("renders all 6 domains, calculates balance index, and updates inspector on node click", () => {
    render(
      <PreferencesProvider>
        <GrowthMap
          level={5}
          xp={950}
          scores={{
            academic: 80,
            productivity: 60,
            growth: 50,
            wellbeing: 40,
            career: 70,
            community: 30,
          }}
          completedTasksByArea={{ academic: 3, career: 2 }}
          goals={[
            { area: "academic", status: "completed" },
            { area: "career", status: "active" },
          ]}
          events={[{ area: "career", xp: 40 }]}
        />
      </PreferencesProvider>,
    );

    expect(screen.getByTestId("growth-map-visual")).toBeInTheDocument();
    // Mean of (80+60+50+40+70+30)/6 = 55%
    expect(screen.getByTestId("growth-map-visual")).toHaveTextContent("55%");

    fireEvent.click(screen.getByTestId("growth-node-career"));
    expect(screen.getByTestId("growth-map-inspector")).toHaveTextContent("70%");
    expect(screen.getByTestId("growth-map-inspector")).toHaveTextContent("+40 XP");
  });
});

describe("PomodoroTimerWidget", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    mockLogFocusSession.mockClear();
  });

  it("supports presets, phase switching, start/pause, and saving a focus session", async () => {
    render(
      <PreferencesProvider>
        <ToastProvider>
          <PomodoroTimerWidget />
        </ToastProvider>
      </PreferencesProvider>,
    );

    expect(screen.getByTestId("pomo-clock-display")).toHaveTextContent("25:00");
    expect(screen.getByTestId("pomodoro-timer-widget")).toHaveTextContent("1 sessions");

    fireEvent.click(screen.getByTestId("pomo-preset-sprint"));
    expect(screen.getByTestId("pomo-clock-display")).toHaveTextContent("15:00");

    fireEvent.click(screen.getByTestId("pomo-phase-shortBreak"));
    expect(screen.getByTestId("pomo-clock-display")).toHaveTextContent("03:00");

    fireEvent.click(screen.getByTestId("pomo-phase-focus"));
    expect(screen.getByTestId("pomo-clock-display")).toHaveTextContent("15:00");

    fireEvent.click(screen.getByTestId("pomo-toggle-btn"));
    expect(screen.getByTestId("pomo-toggle-btn")).toHaveTextContent("Pause");

    fireEvent.click(screen.getByTestId("pomo-complete-btn"));
    await waitFor(() => {
      expect(mockLogFocusSession).toHaveBeenCalledTimes(1);
    });
  });

  it("preserves remaining countdown when paused after applying a preset", async () => {
    vi.useFakeTimers();
    render(
      <PreferencesProvider>
        <ToastProvider>
          <PomodoroTimerWidget />
        </ToastProvider>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByTestId("pomo-preset-sprint"));
    expect(screen.getByTestId("pomo-clock-display")).toHaveTextContent("15:00");

    fireEvent.click(screen.getByTestId("pomo-toggle-btn"));
    await vi.advanceTimersByTimeAsync(2000);
    expect(screen.getByTestId("pomo-clock-display")).toHaveTextContent("14:58");

    fireEvent.click(screen.getByTestId("pomo-toggle-btn"));
    expect(screen.getByTestId("pomo-clock-display")).toHaveTextContent("14:58");
    expect(screen.getByTestId("pomo-toggle-btn")).toHaveTextContent("Resume");

    fireEvent.click(screen.getByTestId("pomo-reset-btn"));
    expect(screen.getByTestId("pomo-clock-display")).toHaveTextContent("15:00");
    vi.useRealTimers();
  });
});

describe("ProtectedRoute session restoration guard", () => {
  afterEach(() => {
    cleanup();
  });

  function makeAuthValue(overrides: Partial<AuthContextValue>): AuthContextValue {
    return {
      user: null,
      status: {
        configured: true,
        authenticated: false,
        eligible: false,
        requiresVerification: false,
        isAnonymous: false,
        channel: "email",
        target: "",
        providers: [],
        activeSignInProvider: null,
        accountState: "NOT_AUTHENTICATED",
        user: null,
      },
      accountState: "NOT_AUTHENTICATED",
      loading: false,
      isInitialized: true,
      isAuthenticated: false,
      isAnonymous: false,
      requiresVerification: false,
      error: null,
      clearError: vi.fn(),
      signInWithEmail: vi.fn(),
      signUpWithEmail: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInAsGuest: vi.fn(),
      signOut: vi.fn(),
      sendPasswordReset: vi.fn(),
      refreshUser: vi.fn(),
      setRememberMe: vi.fn(),
      ...overrides,
    };
  }

  it("renders loading gate without content flash while AuthProvider is initializing", () => {
    render(
      <AuthContext.Provider value={makeAuthValue({ loading: true, isInitialized: false })}>
        <ProtectedRoute>
          <div data-testid="secret-app">Protected Content</div>
        </ProtectedRoute>
      </AuthContext.Provider>,
    );

    expect(screen.queryByTestId("secret-app")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Restoring session")).toBeInTheDocument();
  });

  it("renders protected children once authenticated", () => {
    render(
      <AuthContext.Provider
        value={makeAuthValue({
          loading: false,
          isInitialized: true,
          isAuthenticated: true,
          user: { uid: "student-1", isAnonymous: false } as User,
        })}
      >
        <ProtectedRoute>
          <div data-testid="secret-app">Protected Content</div>
        </ProtectedRoute>
      </AuthContext.Provider>,
    );

    expect(screen.getByTestId("secret-app")).toBeInTheDocument();
  });
});

describe("DailyJournal component", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    mockAddJournalEntry.mockClear();
    mockUpdateJournalEntry.mockClear();
    mockDeleteJournalEntry.mockClear();
    mockAddTask.mockClear();
    mockAddStudyItem.mockClear();
  });

  it("renders date-grouped entries, word count, guided prompts, 1-click task/note conversion, and saves entries", async () => {
    const todayIso = new Date().toISOString().slice(0, 10);
    render(
      <PreferencesProvider>
        <ToastProvider>
          <DailyJournal />
        </ToastProvider>
      </PreferencesProvider>,
    );

    expect(screen.getByTestId("daily-journal-section")).toBeInTheDocument();
    expect(screen.getByTestId(`journal-date-group-${todayIso}`)).toBeInTheDocument();
    expect(screen.getByText("Solved Physics Kinematics")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Turn into Task"));
    await waitFor(() => {
      expect(mockAddTask).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByText("Save as Note"));
    await waitFor(() => {
      expect(mockAddStudyItem).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByText("Concept Breakthrough"));
    const titleInput = screen.getByLabelText("Headline") as HTMLInputElement;
    expect(titleInput.value).toBe("Concept Breakthrough");

    fireEvent.change(screen.getByLabelText("Daily Reflection"), {
      target: { value: "Understood chain rule intuition today." },
    });
    expect(screen.getByTestId("daily-journal-section")).toHaveTextContent("5 words");
    fireEvent.click(screen.getByTestId("journal-submit-btn"));

    await waitFor(() => {
      expect(mockAddJournalEntry).toHaveBeenCalledTimes(1);
    });

    fireEvent.change(screen.getByPlaceholderText("Search reflections, subjects, or wins…"), {
      target: { value: "NonexistentQuery" },
    });
    expect(screen.getByTestId("journal-empty-state")).toBeInTheDocument();
  });
});

describe("InteractiveCalendar component", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    mockAddTask.mockClear();
    mockCompleteTask.mockClear();
    mockUpdateTask.mockClear();
  });

  it("renders deadlines & study history on today's grid, switches Month/Week/Agenda views, and quick-schedules deadlines", async () => {
    render(
      <PreferencesProvider>
        <ToastProvider>
          <InteractiveCalendar />
        </ToastProvider>
      </PreferencesProvider>,
    );

    expect(screen.getByTestId("interactive-calendar")).toBeInTheDocument();
    expect(screen.getByTestId("cal-weekday-headers").children.length).toBe(7);

    const inspector = screen.getByTestId("cal-day-inspector");
    expect(inspector).toHaveTextContent("Biology Diagram Review");
    expect(inspector).toHaveTextContent("Complete Chapter 4");
    expect(inspector).toHaveTextContent("Morning Algebra");
    expect(inspector).toHaveTextContent("90%");

    fireEvent.click(screen.getByTestId("cal-view-week"));
    expect(screen.getByTestId("cal-weekday-headers").children.length).toBe(7);

    fireEvent.click(screen.getByTestId("cal-view-agenda"));
    expect(screen.getByTestId("interactive-calendar")).toHaveTextContent("Biology Diagram Review");

    fireEvent.click(screen.getByTestId("cal-view-month"));

    fireEvent.click(screen.getByTestId("cal-filter-deadlines"));
    expect(inspector).toHaveTextContent("Biology Diagram Review");
    expect(inspector).not.toHaveTextContent("Morning Algebra");

    fireEvent.click(screen.getByTestId("cal-filter-study"));
    expect(inspector).toHaveTextContent("Morning Algebra");
    expect(inspector).not.toHaveTextContent("Biology Diagram Review");

    fireEvent.change(screen.getByLabelText("Schedule deadline for this day"), {
      target: { value: "Math Quiz Prep" },
    });
    fireEvent.click(screen.getByText("Add"));

    await waitFor(() => {
      expect(mockAddTask).toHaveBeenCalledTimes(1);
    });
  });
});
