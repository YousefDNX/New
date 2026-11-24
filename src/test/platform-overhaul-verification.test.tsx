import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GrowthMapExperience } from "@/components/growth/GrowthMapExperience";
import { QuranMushafReader } from "@/components/islamic/QuranMushafReader";
import { DigitalQuranReader } from "@/components/islamic/DigitalQuranReader";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PreferencesProvider } from "@/lib/preferences";
import { fetchMushafPageVerses, MushafPageUnavailableError } from "@/lib/quran-mushaf";
import { clearQuranMemoryCaches, clearSessionQuranPrefs } from "@/lib/quran";
import { THEME_CATALOG } from "@/lib/theme-catalog";

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
    }) => (select ? select({ location: { pathname: "/app/level-up" } }) : "/app/level-up"),
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
  useUser: () => ({ data: { uid: "test-overhaul-user" }, isLoading: false }),
  useProfile: () => ({
    data: {
      id: "test-overhaul-user",
      display_name: "Verification Student",
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
      user_id: "test-overhaul-user",
      xp: 480,
      level: 4,
      current_streak: 5,
      longest_streak: 9,
      last_active_date: "2026-11-19",
      updated_at: "2026-11-19T00:00:00.000Z",
    },
  }),
  useTasks: () => ({ data: [] }),
  useGoals: () => ({ data: [] }),
  useGoalActions: () => ({ addGoal: vi.fn(), updateGoal: vi.fn(), toggleGoal: vi.fn() }),
  useTaskActions: () => ({ completeTask: vi.fn() }),
  useActivityEvents: () => ({ data: [] }),
}));

vi.mock("@/hooks/use-modules", () => ({
  useFocusSessions: () => ({ data: [] }),
  useQuizAttempts: () => ({ data: [] }),
  useStudyItems: () => ({ data: [] }),
  useJournalEntries: () => ({ data: [] }),
  useCareEntries: () => ({ data: [] }),
  useFuturePlans: () => ({ data: [] }),
  useCircles: () => ({ data: [] }),
  useCircleDetails: () => ({ members: [] }),
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <PreferencesProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  );
}

describe("Platform Overhaul Verification: Design Systems, Growth Map, Navigation & Mushaf", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    clearQuranMemoryCaches();
    clearSessionQuranPrefs();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("wires all 10 THEME_CATALOG preset IDs in styles.css, bans Inter/Space Grotesk/Roboto stacks, and keeps theme switchers inside Settings", () => {
    const cssText = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf-8");
    expect(THEME_CATALOG).toHaveLength(2);
    for (const preset of THEME_CATALOG) {
      expect(cssText).toContain(`[data-theme-preset="${preset.id}"]`);
    }
    expect(cssText).toContain("[data-theme-preset] input");
    expect(cssText).toContain('[data-theme-preset] [role="dialog"]');
    expect(cssText).toContain('[data-theme-preset] aside[data-app-sidebar="true"]');

    const appRouteSource = readFileSync(
      resolve(process.cwd(), "src/routes/_authenticated/app.tsx"),
      "utf-8",
    );
    const dashboardSource = readFileSync(
      resolve(process.cwd(), "src/routes/_authenticated/app.index.tsx"),
      "utf-8",
    );
    expect(appRouteSource).not.toContain("HeaderThemeSelector");
    expect(appRouteSource).not.toContain("GlobalThemeController");
    expect(dashboardSource).not.toContain("DashboardThemeSwitcher");

    const prefsSource = readFileSync(resolve(process.cwd(), "src/lib/preferences.tsx"), "utf-8");
    const fontBlock = prefsSource.slice(
      prefsSource.indexOf("FONT_STACK_BY_KEY"),
      prefsSource.indexOf("CORNER_RADIUS_BY_KEY"),
    );
    expect(fontBlock).not.toMatch(/\bInter\b/i);
    expect(fontBlock).not.toMatch(/Space Grotesk/i);
    expect(fontBlock).not.toMatch(/\bRoboto\b/i);
  });

  it("includes consolidated Sidebar, MobileNav, utilities, and moderator routes inside app layout", () => {
    const appRouteSource = readFileSync(
      resolve(process.cwd(), "src/routes/_authenticated/app.tsx"),
      "utf-8",
    );
    const sidebarSource = readFileSync(
      resolve(process.cwd(), "src/components/nav/Sidebar.tsx"),
      "utf-8",
    );
    const navConfigSource = readFileSync(
      resolve(process.cwd(), "src/config/navigation.ts"),
      "utf-8",
    );
    expect(appRouteSource).toContain("<Sidebar />");
    expect(appRouteSource).toContain("<MobileNav />");
    expect(sidebarSource).toContain("NAV_UTILITIES");
    expect(sidebarSource).toContain("NAV_ADMIN");
    expect(navConfigSource).toContain('"/app/help"');
    expect(navConfigSource).toContain('"/app/support"');
    expect(navConfigSource).toContain('"/app/admin"');
  });

  it("renders GrowthMapExperience with Recommended Next Step and zero duplicated timeline blocks", () => {
    render(
      <TestWrapper>
        <GrowthMapExperience />
      </TestWrapper>,
    );

    expect(screen.getByTestId("growth-next-step-card")).toBeInTheDocument();
    expect(screen.getByTestId("growth-section-panel-overview")).toBeInTheDocument();
    // Timeline is cleanly placed inside Goals & Milestones rather than duplicated on Overview
    expect(screen.queryByTestId("growth-milestone-roadmap")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("growth-section-tab-goals_milestones"));
    expect(screen.getByTestId("growth-section-panel-goals_milestones")).toBeInTheDocument();
    expect(screen.getAllByTestId("growth-milestone-roadmap")).toHaveLength(1);
  });

  it("throws MushafPageUnavailableError offline without inventing dummy verses and surfaces honest retry UI", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Offline network failure")));

    await expect(fetchMushafPageVerses(3)).rejects.toBeInstanceOf(MushafPageUnavailableError);

    render(<QuranMushafReader initialPage={3} lang="en" />);
    const errorBox = await screen.findByTestId("mushaf-page-error");
    expect(errorBox).toHaveTextContent(/Mushaf Page Unavailable/i);
    expect(screen.getByRole("button", { name: /Retry/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open Mushaf Index/i })).toBeInTheDocument();
  });

  it("renders interactive QuranMushafReader with clickable ayah actions and 2-page facing spread", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/verses/by_page/50")) {
          return new Response(
            JSON.stringify({
              verses: [
                {
                  id: 300,
                  verse_key: "3:1",
                  verse_number: 1,
                  text_uthmani: "الٓمٓ",
                  page_number: 50,
                  juz_number: 3,
                },
                {
                  id: 301,
                  verse_key: "3:2",
                  verse_number: 2,
                  text_uthmani: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ",
                  page_number: 50,
                  juz_number: 3,
                },
              ],
            }),
            { status: 200 },
          );
        }
        if (url.includes("/verses/by_page/51")) {
          return new Response(
            JSON.stringify({
              verses: [
                {
                  id: 310,
                  verse_key: "3:10",
                  verse_number: 10,
                  text_uthmani: "إِنَّ ٱلَّذِينَ كَفَرُوا۟",
                  page_number: 51,
                  juz_number: 3,
                },
              ],
            }),
            { status: 200 },
          );
        }
        return new Response(JSON.stringify({}), { status: 404 });
      }),
    );

    render(<QuranMushafReader initialPage={50} lang="en" />);

    const sheet50 = await screen.findByTestId("mushaf-sheet-50");
    expect(sheet50).toHaveTextContent(/ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ/);

    const ayahButton = sheet50.querySelector('[data-mushaf-verse="3:2"] button');
    expect(ayahButton).not.toBeNull();
    fireEvent.click(ayahButton as HTMLElement);
    expect(screen.getByTestId("mushaf-ayah-toolbar")).toHaveTextContent("3:2");

    const spreadToggle = screen.getByTestId("mushaf-spread-toggle");
    fireEvent.click(spreadToggle);

    await waitFor(() => {
      expect(screen.getByTestId("mushaf-sheet-51")).toHaveTextContent(/إِنَّ ٱلَّذِينَ كَفَرُوا۟/);
    });
  });

  it("renders DigitalQuranReader using framed continuous RTL Mushaf pages instead of stacked verse cards", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/chapters")) {
          return new Response(
            JSON.stringify({
              chapters: [
                {
                  id: 1,
                  revelation_place: "makkah",
                  name_simple: "Al-Fatihah",
                  name_arabic: "الفاتحة",
                  verses_count: 7,
                  translated_name: { name: "The Opener" },
                },
              ],
            }),
            { status: 200 },
          );
        }
        if (url.includes("/verses/by_chapter/1")) {
          return new Response(
            JSON.stringify({
              verses: [
                {
                  id: 1,
                  verse_key: "1:1",
                  verse_number: 1,
                  text_uthmani: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
                  page_number: 1,
                  juz_number: 1,
                },
                {
                  id: 2,
                  verse_key: "1:2",
                  verse_number: 2,
                  text_uthmani: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
                  page_number: 1,
                  juz_number: 1,
                },
              ],
            }),
            { status: 200 },
          );
        }
        return new Response(JSON.stringify({}), { status: 404 });
      }),
    );

    render(
      <PreferencesProvider>
        <DigitalQuranReader />
      </PreferencesProvider>,
    );

    const pages = await screen.findAllByTestId("digital-mushaf-page");
    expect(pages.length).toBeGreaterThanOrEqual(1);
    expect(pages[0]).toHaveTextContent(/ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ/);
    expect(pages[0]).toHaveTextContent(/— ١ —/);
    expect(pages[0]!.querySelectorAll("article")).toHaveLength(0);
  });
});
