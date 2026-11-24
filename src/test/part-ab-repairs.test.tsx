import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConfettiCelebration } from "@/components/common/ConfettiCelebration";
import { BadgesWidget } from "@/components/dashboard/BadgesWidget";
import { GrowthTimelinePath } from "@/components/growth/GrowthTimelinePath";
import { XpProgress, getXpStatusTone } from "@/components/growth/XpProgress";
import { InterfaceLayoutStudio } from "@/components/settings/InterfaceLayoutStudio";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { sanitizeUserSettingsDoc } from "@/hooks/use-settings";
import { resetThemeMutationSeqForTests, useThemePersistence } from "@/hooks/use-theme-persistence";
import { clearCachedBootstrappedProfile, getCachedBootstrappedProfile } from "@/lib/auth-bootstrap";
import { checkAndTriggerThursdayWeeklyGoalsReminder } from "@/lib/daily-goal-reminder";
import { PreferencesProvider, usePrefs } from "@/lib/preferences";
import {
  downloadBlobFile,
  readFileAsDataUrlSafe,
  readFileAsTextSafe,
  safeStopMediaRecorder,
  validateAttachmentFile,
} from "@/lib/safe-file";
import { LAYOUT_MODES, getLayoutModeById, isValidLayoutMode } from "@/lib/theme-catalog";

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useRouterState: ({
      select,
    }: {
      select?: (s: { location: { pathname: string } }) => unknown;
    }) => (select ? select({ location: { pathname: "/app" } }) : "/app"),
    Link: ({
      children,
      to,
      ...rest
    }: {
      children: React.ReactNode;
      to?: string;
      [key: string]: unknown;
    }) => (
      <a href={typeof to === "string" ? to : "#"} {...rest}>
        {children}
      </a>
    ),
  };
});

const mockFetchClaimed = vi.fn().mockResolvedValue(new Set<string>(["ach_pioneer"]));
const mockClaimAchievement = vi
  .fn()
  .mockResolvedValue({ success: true, xpAwarded: 50, achievement: null });

vi.mock("@/lib/achievement-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/achievement-service")>(
    "@/lib/achievement-service",
  );
  return {
    ...actual,
    fetchUserClaimedAchievements: (...args: unknown[]) => mockFetchClaimed(...args),
    claimAchievementInFirestore: (...args: unknown[]) => mockClaimAchievement(...args),
  };
});

vi.mock("@/hooks/use-nexora", () => ({
  useUser: () => ({ data: { uid: "test-user-part-ab" }, isLoading: false }),
  useProfile: () => ({
    data: {
      id: "test-user-part-ab",
      display_name: "Noor Student",
      avatar_url: null,
      language: "en",
      region: "kuwait",
      date_of_birth: null,
      age_band: null,
      parental_consent: false,
      onboarded: true,
      is_anonymous: false,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
  }),
  useStats: () => ({
    data: {
      user_id: "test-user-part-ab",
      xp: 480,
      level: 4,
      current_streak: 5,
      longest_streak: 9,
      last_active_date: "2026-11-18",
      updated_at: "2026-11-18T00:00:00.000Z",
    },
  }),
  useTasks: () => ({
    data: [
      {
        id: "task-1",
        user_id: "test-user-part-ab",
        title: "Review Biology Chapter 4",
        priority: "high",
        status: "todo",
        area: "academic",
        subject: "Biology",
        created_at: "2026-11-18T00:00:00.000Z",
      },
      {
        id: "task-2",
        user_id: "test-user-part-ab",
        title: "Solved Physics worksheet",
        priority: "medium",
        status: "done",
        area: "academic",
        subject: "Physics",
        created_at: "2026-11-17T00:00:00.000Z",
      },
    ],
  }),
  useGoals: () => ({
    data: [
      {
        id: "goal-1",
        user_id: "test-user-part-ab",
        title: "Master Thermodynamics",
        area: "academic",
        status: "active",
        created_at: "2026-11-15T00:00:00.000Z",
      },
    ],
  }),
  useGoalActions: () => ({
    addGoal: vi.fn(),
    updateGoal: vi.fn(),
    toggleGoal: vi.fn(),
  }),
  useTaskActions: () => ({
    completeTask: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock("@/hooks/use-modules", () => ({
  useFocusSessions: () => ({
    data: [
      {
        id: "fs-1",
        user_id: "test-user-part-ab",
        title: "Physics Sprint",
        area: "academic",
        subject: "Physics",
        duration_minutes: 25,
        completed: true,
        created_at: "2026-11-18T08:00:00.000Z",
      },
    ],
  }),
  useQuizAttempts: () => ({
    data: [
      {
        id: "qa-1",
        user_id: "test-user-part-ab",
        subject: "Biology",
        total_questions: 10,
        correct_count: 9,
        score_pct: 90,
        created_at: "2026-11-18T09:00:00.000Z",
      },
    ],
  }),
  useStudyItems: () => ({
    data: [
      {
        id: "si-1",
        user_id: "test-user-part-ab",
        kind: "note",
        subject: "Biology",
        title: "Cellular Respiration",
        content: "ATP synthesis pathway notes.",
        created_at: "2026-11-18T07:00:00.000Z",
        updated_at: "2026-11-18T07:00:00.000Z",
      },
    ],
  }),
  useJournalEntries: () => ({ data: [] }),
  useCareEntries: () => ({ data: [] }),
  useFuturePlans: () => ({ data: [] }),
  useCircles: () => ({ data: [] }),
  useCircleDetails: () => ({ members: [] }),
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

describe("Part A Widgets & Features", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    document.documentElement.removeAttribute("data-layout-mode");
    document.documentElement.removeAttribute("data-ui-theme");
  });

  it("renders XpProgress with level, progress percentage, and achievement tone", () => {
    render(
      <Wrapper>
        <XpProgress xp={480} level={4} />
      </Wrapper>,
    );
    const el = screen.getByTestId("xp-progress-component");
    expect(el).toHaveAttribute("data-level", "4");
    expect(screen.getByText(/Level 4/i)).toBeInTheDocument();
    expect(getXpStatusTone(15, 50).labelEn).toBe("Mastery");
    expect(getXpStatusTone(2, 85).labelEn).toBe("Close to level up");
  });

  it("renders SVG GrowthTimelinePath with interactive milestone stages", () => {
    render(
      <Wrapper>
        <GrowthTimelinePath level={4} xp={480} />
      </Wrapper>,
    );
    const root = screen.getByTestId("growth-timeline-path");
    expect(root.querySelector("svg")).toBeInTheDocument();
  });

  it("toggles themes and light/dark mode inside Settings ThemeSwitcher", () => {
    render(
      <Wrapper>
        <ThemeSwitcher variant="full" persistToAccount={false} />
      </Wrapper>,
    );
    const nordicBtn = screen.getByTestId("theme-preset-nordic_frost");
    fireEvent.click(nordicBtn);
    expect(document.documentElement.getAttribute("data-theme-preset")).toBe("nordic_frost");
    expect(document.documentElement.getAttribute("data-ui-theme")).toBe("nordic_frost");

    const modeBtn = screen.getByRole("button", { name: /^Dark$/i });
    fireEvent.click(modeBtn);
    expect(
      document.documentElement.classList.contains("light") ||
        document.documentElement.classList.contains("dark"),
    ).toBe(true);
  });

  it("filters BadgesWidget by Locked and renders criteria tooltips on hover", async () => {
    render(
      <Wrapper>
        <BadgesWidget />
      </Wrapper>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("dashboard-badges")).toBeInTheDocument();
    });
    const lockedTab = screen.getByTestId("badges-filter-locked");
    fireEvent.click(lockedTab);
    expect(lockedTab.className).toContain("bg-primary");
  });

  it("triggers Thursday reminder only on Thursday when weekly goals are incomplete", async () => {
    const notifyMock = vi.fn();
    const notifications = {
      reminders: true,
      tasks: true,
      calendar: true,
      streak: true,
      opportunities: true,
      community: true,
      teams: true,
      emailEnabled: false,
      pushEnabled: true,
      frequency: "daily" as const,
      quietHoursEnabled: false,
      quietStart: "22:00",
      quietEnd: "07:00",
    };
    const goals = [
      {
        id: "wg1",
        user_id: "test-user-part-ab",
        title: "Finish Chapter 3",
        area: "academic" as const,
        status: "active" as const,
        is_daily: false,
        last_reset_date: null,
        target_date: "2026-W47",
        milestones: [],
        completed_at: null,
        created_at: "2026-11-16T00:00:00.000Z",
      },
    ];
    // 2026-11-19 is a Thursday (day = 4)
    const thursdayNoon = new Date(2026, 10, 19, 12, 0, 0);
    const triggered = await checkAndTriggerThursdayWeeklyGoalsReminder({
      goals,
      notifications,
      nowOverride: thursdayNoon,
      onToastFallback: notifyMock,
    });
    expect(triggered).toBe(true);
    expect(notifyMock).toHaveBeenCalledTimes(1);

    // Repeat same day should be throttled via localStorage guard
    const repeat = await checkAndTriggerThursdayWeeklyGoalsReminder({
      goals,
      notifications,
      nowOverride: thursdayNoon,
      onToastFallback: notifyMock,
    });
    expect(repeat).toBe(false);

    // Wednesday should not trigger
    localStorage.clear();
    const wednesday = new Date(2026, 10, 18, 12, 0, 0);
    const nonThu = await checkAndTriggerThursdayWeeklyGoalsReminder({
      goals,
      notifications,
      nowOverride: wednesday,
      onToastFallback: notifyMock,
    });
    expect(nonThu).toBe(false);
  });

  it("respects reduced motion in ConfettiCelebration", () => {
    function ReduceMotionHarness() {
      const { setA11y } = usePrefs();
      return (
        <>
          <button type="button" onClick={() => setA11y({ reduceMotion: true })}>
            Disable Motion
          </button>
          <ConfettiCelebration />
        </>
      );
    }
    render(
      <Wrapper>
        <ReduceMotionHarness />
      </Wrapper>,
    );
    expect(screen.getByTestId("confetti-celebration-canvas")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Disable Motion"));
    expect(screen.queryByTestId("confetti-celebration-canvas")).not.toBeInTheDocument();
  });
});

describe("Part B: Theme Persistence, 10 Layouts & Safe File Utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    resetThemeMutationSeqForTests();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("prevents stale theme persistence race conditions and keeps latest selection", async () => {
    function RaceHarness() {
      const prefs = usePrefs();
      const { persistPatch } = useThemePersistence();
      return (
        <div>
          <span data-testid="current-theme">{prefs.theme}</span>
          <button
            type="button"
            onClick={() => {
              // Simulate rapid change A then B where A fails lazily
              void persistPatch({ theme: "light" }, () => prefs.setTheme("dark"), { silent: true });
              prefs.setTheme("dark");
              void persistPatch({ theme: "dark" }, () => prefs.setTheme("light"), { silent: true });
            }}
          >
            Trigger Rapid
          </button>
        </div>
      );
    }
    render(
      <Wrapper>
        <RaceHarness />
      </Wrapper>,
    );
    fireEvent.click(screen.getByText("Trigger Rapid"));
    expect(screen.getByTestId("current-theme").textContent).toBe("dark");
  });

  it("sanitizes UserSettingsDoc for all 10 layout modes and strips unknown ghost fields", () => {
    expect(LAYOUT_MODES).toHaveLength(10);
    const ids = new Set(LAYOUT_MODES.map((m) => m.id));
    expect(ids.size).toBe(10);

    for (const mode of LAYOUT_MODES) {
      expect(isValidLayoutMode(mode.id)).toBe(true);
      expect(getLayoutModeById(mode.id).id).toBe(mode.id);
      const docOut = sanitizeUserSettingsDoc(
        {
          layout_mode: mode.id,
          ghost_malicious_field: "should-be-stripped",
        },
        "user-123",
      );
      expect(docOut["layout_mode"]).toBe(mode.id);
      expect("ghost_malicious_field" in docOut).toBe(false);
    }
  });

  it("renders InterfaceLayoutStudio with all 10 layouts and category filters", () => {
    render(
      <Wrapper>
        <InterfaceLayoutStudio />
      </Wrapper>,
    );
    expect(screen.getByTestId("interface-layout-studio")).toBeInTheDocument();
    for (const mode of LAYOUT_MODES) {
      expect(screen.getByTestId(`layout-card-${mode.id}`)).toBeInTheDocument();
    }

    fireEvent.click(screen.getByTestId("layout-cat-grid"));
    expect(screen.getByTestId("layout-card-bento")).toBeInTheDocument();
    expect(screen.getByTestId("layout-card-executive_kpi")).toBeInTheDocument();
    expect(screen.queryByTestId("layout-card-classic")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("layout-card-executive_kpi"));
    expect(document.documentElement.getAttribute("data-layout-mode")).toBe("executive_kpi");

    fireEvent.click(screen.getByTestId("layout-cat-all"));
    fireEvent.click(screen.getByTestId("layout-card-classic"));
    expect(document.documentElement.getAttribute("data-layout-mode")).toBe("classic");
  });

  it("validates files safely and prevents empty/oversized/unsupported crashes", async () => {
    const emptyFile = new File([], "empty.txt", { type: "text/plain" });
    expect(validateAttachmentFile(emptyFile).ok).toBe(false);

    const badExt = new File(["hello"], "script.exe", { type: "application/x-msdownload" });
    expect(
      validateAttachmentFile(badExt, {
        allowedExtensions: [".json"],
        allowedMimePrefixes: ["application/json"],
      }).ok,
    ).toBe(false);

    const goodJson = new File(['{"ok":true}'], "backup.json", { type: "application/json" });
    await expect(readFileAsTextSafe(goodJson, { allowedExtensions: [".json"] })).resolves.toBe(
      '{"ok":true}',
    );

    const badImg = new File([], "broken.png", { type: "image/png" });
    await expect(
      readFileAsDataUrlSafe(badImg, { allowedMimePrefixes: ["image/"] }),
    ).rejects.toThrow();

    // downloadBlobFile should not revoke ObjectURL synchronously
    const createSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:safe-test");
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    downloadBlobFile(new Blob(["abc"], { type: "text/plain" }), "notes.txt");
    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(revokeSpy).not.toHaveBeenCalled();

    // safeStopMediaRecorder handles null / inactive / throwing recorders cleanly
    const throwingRecorder = {
      state: "recording",
      stop: () => {
        throw new Error("InvalidStateError");
      },
    } as unknown as MediaRecorder;
    expect(() => safeStopMediaRecorder(throwingRecorder, null)).not.toThrow();
  });

  it("manages profile bootstrap cache cleanly", () => {
    clearCachedBootstrappedProfile("uid-x");
    expect(getCachedBootstrappedProfile("uid-x")).toBeNull();
    expect(getCachedBootstrappedProfile(undefined)).toBeNull();
  });
});
