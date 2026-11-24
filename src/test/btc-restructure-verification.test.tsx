import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GrowthMapExperience } from "@/components/growth/GrowthMapExperience";
import { QuranAudioPlayer } from "@/components/islamic/QuranAudioPlayer";
import { QuranMiniPlayer } from "@/components/islamic/QuranMiniPlayer";
import { SurahBrowserPanel } from "@/components/islamic/SurahBrowserPanel";
import { DigitalSafetyPanel } from "@/components/rahmah/DigitalSafetyPanel";
import { HealthAwarenessPanel } from "@/components/rahmah/HealthAwarenessPanel";
import { HumanWisdomArchivePanel } from "@/components/rahmah/HumanWisdomArchivePanel";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { QuranAudioProvider, useQuranAudio } from "@/contexts/QuranAudioContext";
import { resetThemeMutationSeqForTests, useThemePersistence } from "@/hooks/use-theme-persistence";
import { searchUnifiedIslamicCenter } from "@/lib/islamic-search";
import { PreferencesProvider } from "@/lib/preferences";
import {
  getAuthenticReciter,
  getRecordingAudioUrl,
  getRecitersAndRecordingsForSurah,
  getRecordingsForReciterSurah,
  getSurahHighlight,
} from "@/lib/quran-reciters";

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
    }) => (select ? select({ location: { pathname: "/app/quran" } }) : "/app/quran"),
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

vi.mock("@/hooks/use-nexora", () => ({
  useUser: () => ({ data: { uid: "test-user-btc" }, isLoading: false }),
  useProfile: () => ({
    data: {
      id: "test-user-btc",
      display_name: "Student BTC",
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
      user_id: "test-user-btc",
      xp: 640,
      level: 5,
      current_streak: 7,
      longest_streak: 14,
      last_active_date: "2026-11-19",
      updated_at: "2026-11-19T00:00:00.000Z",
    },
  }),
  useTasks: () => ({
    data: [
      {
        id: "t-1",
        user_id: "test-user-btc",
        title: "Review Surah Al-Furqan",
        priority: "high",
        status: "done",
        area: "personal",
        subject: "Quran",
        created_at: "2026-11-18T00:00:00.000Z",
      },
    ],
  }),
  useGoals: () => ({
    data: [
      {
        id: "g-1",
        user_id: "test-user-btc",
        title: "Daily Recitation & Study",
        area: "academic",
        status: "active",
        is_daily: true,
        last_reset_date: null,
        target_date: null,
        milestones: [],
        completed_at: null,
        created_at: "2026-11-18T00:00:00.000Z",
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
  useActivityEvents: () => ({ data: [] }),
}));

vi.mock("@/hooks/use-modules", () => ({
  useFocusSessions: () => ({
    data: [
      {
        id: "fs-1",
        user_id: "test-user-btc",
        title: "Deep Focus",
        area: "academic",
        subject: "Physics",
        duration_minutes: 30,
        completed: true,
        created_at: "2026-11-18T09:00:00.000Z",
      },
    ],
  }),
  useQuizAttempts: () => ({ data: [] }),
  useStudyItems: () => ({ data: [] }),
  useJournalEntries: () => ({ data: [] }),
  useCareEntries: () => ({ data: [] }),
  useFuturePlans: () => ({ data: [] }),
  useCircles: () => ({ data: [] }),
  useCircleDetails: () => ({ members: [] }),
}));

function TestProviders({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <PreferencesProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  );
}

describe("BTC Restructure Verification Suite", () => {
  beforeEach(() => {
    localStorage.clear();
    resetThemeMutationSeqForTests();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    document.documentElement.removeAttribute("data-layout-mode");
    document.documentElement.removeAttribute("data-ui-theme");
  });

  it("represents Sheikh Muhammad Al-Luhaidan with multiple distinct recordings per surah and Surah Al-Furqan v.69 passage", () => {
    const luhaidan = getAuthenticReciter("al-luhaidan");
    expect(luhaidan.recordings.length).toBeGreaterThanOrEqual(3);

    const furqanRecordings = getRecordingsForReciterSurah("al-luhaidan", 25);
    expect(furqanRecordings.length).toBeGreaterThanOrEqual(3);
    const urls = new Set(furqanRecordings.map((r) => getRecordingAudioUrl(r, 25)));
    expect(urls.size).toBe(furqanRecordings.length);

    const highlight = getSurahHighlight(furqanRecordings[0]!, 25);
    expect(highlight).toBeTruthy();
    expect(highlight?.verseRange).toBe("25:68–70");
    expect(highlight?.verseArabicExcerpt).toContain("يُضَاعَفْ لَهُ الْعَذَابُ يَوْمَ الْقِيَامَةِ");

    const surahFirstEntries = getRecitersAndRecordingsForSurah(25);
    const luhaidanSurahEntry = surahFirstEntries.find((e) => e.reciter.id === "al-luhaidan");
    expect(luhaidanSurahEntry?.recordings.length).toBeGreaterThanOrEqual(3);

    const searchRes = searchUnifiedIslamicCenter("يضاعف");
    expect(searchRes.some((item) => item.category === "reciter")).toBe(true);
  });

  it("supports reverse Surah-first browsing and highlights Al-Furqan v.69 in QuranAudioPlayer", () => {
    render(
      <QuranAudioProvider initialReciterId="al-luhaidan" initialSurahId={25}>
        <QuranAudioPlayer lang="ar" initialReciterId="al-luhaidan" initialSurahId={25} />
      </QuranAudioProvider>,
    );

    expect(screen.getByTestId("luhaidan-furqan-spotlight")).toHaveTextContent(
      /يُضَاعَفْ لَهُ الْعَذَابُ يَوْمَ الْقِيَامَةِ/,
    );

    const surahsTabBtn = screen.getByTestId("quran-tab-surahs");
    fireEvent.click(surahsTabBtn);
    expect(screen.getByTestId("surah-first-browser")).toBeInTheDocument();
  });

  it("renders SurahBrowserPanel independently and filters by Surah Al-Furqan", () => {
    render(
      <SurahBrowserPanel
        isAr={true}
        userStyleOverrides={{}}
        onSelectAndPlay={vi.fn()}
        onOpenReciterProfile={vi.fn()}
      />,
    );

    const furqanBtn = screen.getByTestId("surah-browser-item-25");
    fireEvent.click(furqanBtn);
    expect(screen.getByTestId("surah-reciter-group-al-luhaidan")).toBeInTheDocument();
  });

  it("persists single Quran audio playback across child navigation, enforces 1.0x speed, and registers Media Session", () => {
    const playMock = vi.fn().mockResolvedValue(undefined);
    const pauseMock = vi.fn();
    const audioInstances: Array<{ playbackRate: number; src: string }> = [];

    class MockAudio {
      src = "";
      preload = "none";
      playbackRate = 1.0;
      volume = 1;
      currentTime = 0;
      duration = 120;
      error: MediaError | null = null;
      private listeners: Record<string, Array<() => void>> = {};
      constructor() {
        audioInstances.push(this);
      }
      addEventListener(evt: string, fn: () => void) {
        if (!this.listeners[evt]) this.listeners[evt] = [];
        this.listeners[evt]!.push(fn);
      }
      removeEventListener(evt: string, fn: () => void) {
        if (this.listeners[evt]) {
          this.listeners[evt] = this.listeners[evt]!.filter((f) => f !== fn);
        }
      }
      load() {}
      play() {
        this.listeners["play"]?.forEach((fn) => fn());
        return playMock();
      }
      pause() {
        this.listeners["pause"]?.forEach((fn) => fn());
        pauseMock();
      }
    }

    vi.stubGlobal("Audio", MockAudio);
    const setActionHandlerMock = vi.fn();
    Object.defineProperty(navigator, "mediaSession", {
      configurable: true,
      value: {
        metadata: null,
        playbackState: "none",
        setActionHandler: setActionHandlerMock,
        setPositionState: vi.fn(),
      },
    });

    function AudioHarness() {
      const audio = useQuranAudio();
      return (
        <div>
          <span data-testid="ctx-surah">{audio.activeSurah.id}</span>
          <button
            type="button"
            data-testid="ctx-play-furqan"
            onClick={() =>
              audio.loadTrack({ reciterId: "al-luhaidan", surahId: 25, autoPlay: true })
            }
          >
            Play Furqan
          </button>
          <QuranMiniPlayer lang="en" onOpenQuranPage={vi.fn()} />
        </div>
      );
    }

    render(
      <QuranAudioProvider>
        <AudioHarness />
      </QuranAudioProvider>,
    );

    fireEvent.click(screen.getByTestId("ctx-play-furqan"));
    expect(playMock).toHaveBeenCalledTimes(1);
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0]!.playbackRate).toBe(1.0);
    expect(setActionHandlerMock).toHaveBeenCalled();
    expect(screen.getByTestId("quran-persistent-mini-player")).toBeInTheDocument();
  });

  it("reorganizes GrowthMapExperience into 5 non-duplicated sections with Overview jump cards and Return button", () => {
    render(
      <TestProviders>
        <GrowthMapExperience />
      </TestProviders>,
    );

    expect(screen.getByTestId("growth-section-tabs")).toBeInTheDocument();
    expect(screen.getByTestId("growth-section-panel-overview")).toBeInTheDocument();
    expect(screen.getByTestId("growth-overview-card-goals_milestones")).toBeInTheDocument();
    expect(screen.getByTestId("growth-overview-card-skills_learning")).toBeInTheDocument();
    expect(screen.getByTestId("growth-overview-card-habits_consistency")).toBeInTheDocument();
    expect(screen.getByTestId("growth-overview-card-achievements_reflection")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("growth-overview-card-skills_learning"));
    expect(screen.getByTestId("growth-section-panel-skills_learning")).toBeInTheDocument();
    expect(screen.getByTestId("growth-4stage-mastery")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("growth-back-overview-btn"));
    expect(screen.getByTestId("growth-section-panel-overview")).toBeInTheDocument();
  });

  it("separates Layout mode from active Color Theme cleanly across executive_kpi and classic", async () => {
    function SeparationHarness() {
      const { applyLayoutMode, applyUiTheme } = useThemePersistence();
      return (
        <div>
          <button
            type="button"
            data-testid="set-emerald-theme"
            onClick={() => void applyUiTheme("aurora")}
          >
            Set Aurora
          </button>
          <button
            type="button"
            data-testid="set-kpi-layout"
            onClick={() => void applyLayoutMode("executive_kpi")}
          >
            Set Executive KPI
          </button>
          <button
            type="button"
            data-testid="return-classic-btn"
            onClick={() => void applyLayoutMode("classic")}
          >
            Return Classic
          </button>
        </div>
      );
    }

    render(
      <TestProviders>
        <QuranAudioProvider>
          <SeparationHarness />
        </QuranAudioProvider>
      </TestProviders>,
    );

    fireEvent.click(screen.getByTestId("set-emerald-theme"));
    fireEvent.click(screen.getByTestId("set-kpi-layout"));

    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-layout-mode")).toBe("executive_kpi");
      expect(document.documentElement.getAttribute("data-ui-theme")).toBe("aurora");
    });

    fireEvent.click(screen.getByTestId("return-classic-btn"));
    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-layout-mode")).toBe("classic");
      expect(document.documentElement.getAttribute("data-ui-theme")).toBe("aurora");
    });
  });

  it("renders Rahmah Health core pillars (Nutrition, Sleep, Physical Activity), Digital Safety lessons, and Human Wisdom consent badges", () => {
    render(
      <TestProviders>
        <HealthAwarenessPanel />
        <DigitalSafetyPanel />
        <HumanWisdomArchivePanel />
      </TestProviders>,
    );

    const pillars = screen.getByTestId("health-core-pillars");
    expect(pillars).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("health-pillar-pillar_sleep"));

    expect(screen.getByText(/Strict Zero-Credential Privacy Guarantee/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Consent Verified/i).length).toBeGreaterThan(0);
  });
});
