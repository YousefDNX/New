import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AiKnowledgeCoachDrawer } from "@/components/ai/AiKnowledgeCoachDrawer";
import { EcosystemOverviewWidget } from "@/components/dashboard/EcosystemOverviewWidget";
import { GoodDeedsPanel } from "@/components/islamic/GoodDeedsPanel";
import { IslamicCenterWorkspace } from "@/components/islamic/IslamicCenterWorkspace";
import { MathEngineeringStudio } from "@/components/math/MathEngineeringStudio";
import { ScienceDiscoveryStudio } from "@/components/science/ScienceDiscoveryStudio";
import {
  ResearchDiscoveryLab,
  formatAcademicCitation,
} from "@/components/study/ResearchDiscoveryLab";
import { ThinkingAnalysisStudio } from "@/components/thinking/ThinkingAnalysisStudio";
import { MODULES_CATALOG } from "@/config/modules-catalog";
import { PreferencesProvider } from "@/lib/preferences";
import {
  getStudentEcosystemSnapshot,
  resetCurrentEcosystemSandbox,
  restoreStudentEcosystemState,
  setEcosystemActiveUid,
  storageKeyForEcosystem,
  updateStudentEcosystem,
} from "@/lib/student-ecosystem";

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
      search,
      ...rest
    }: {
      children: React.ReactNode;
      to?: string;
      search?: Record<string, string>;
      [key: string]: unknown;
    }) => {
      const qs = search ? `?${new URLSearchParams(search).toString()}` : "";
      const href = typeof to === "string" ? `${to}${qs}` : "#";
      return (
        <a href={href} {...rest}>
          {children}
        </a>
      );
    },
  };
});

vi.mock("@/hooks/use-nexora", () => ({
  useUser: () => ({ data: { uid: "test-eco-user" }, isLoading: false }),
  useProfile: () => ({
    data: {
      id: "test-eco-user",
      display_name: "Layla Scholar",
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
      user_id: "test-eco-user",
      xp: 320,
      level: 3,
      current_streak: 4,
      longest_streak: 7,
      last_active_date: "2026-11-18",
      updated_at: "2026-11-18T00:00:00.000Z",
    },
  }),
  useGoals: () => ({
    data: [
      {
        id: "goal-eco-1",
        user_id: "test-eco-user",
        title: "Publish Clean Energy Summary",
        area: "academic",
        status: "active",
        created_at: "2026-11-15T00:00:00.000Z",
      },
    ],
  }),
}));

vi.mock("@/hooks/use-modules", () => ({
  useStudyItems: () => ({
    data: [
      {
        id: "note-1",
        user_id: "test-eco-user",
        kind: "note",
        title: "Thermodynamics First Law",
        subject: "Physics",
        content: "Energy is conserved.",
        created_at: "2026-11-18T00:00:00.000Z",
      },
    ],
  }),
  useOpportunities: () => ({
    data: [
      {
        id: "opp-1",
        title: "Youth Sustainability Fair",
        category: "Competition",
      },
    ],
  }),
}));

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <PreferencesProvider>{ui}</PreferencesProvider>
    </QueryClientProvider>,
  );
}

describe("BTC Next-Generation Global Learning Ecosystem", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetCurrentEcosystemSandbox();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("hydrates legacy student ecosystem snapshots safely without breaking when new expansion arrays are missing", () => {
    const legacyKey = storageKeyForEcosystem("legacy_uid");
    window.localStorage.setItem(
      legacyKey,
      JSON.stringify({
        activeLearningPathId: "path_stem",
        completedSimulations: ["sci_titration"],
      }),
    );

    setEcosystemActiveUid("legacy_uid");
    const hydrated = getStudentEcosystemSnapshot();
    expect(hydrated.activeLearningPathId).toBe("path_stem");
    expect(hydrated.completedSimulations).toEqual(["sci_titration"]);
    expect(hydrated.researchProjects).toEqual([]);
    expect(hydrated.researchCitations).toEqual([]);
    expect(hydrated.engineeringSpecs).toEqual([]);
    expect(hydrated.coachingReflections).toEqual([]);
    expect(hydrated.privateWorshipChecklist.completedKeys).toEqual([]);

    restoreStudentEcosystemState({ completedSkillLessons: ["sk-1"] });
    const snap = getStudentEcosystemSnapshot();
    expect(snap.researchProjects).toEqual([]);
    expect(snap.privateWorshipChecklist.completedKeys).toEqual([]);
    setEcosystemActiveUid(null);
  });

  it("formats academic citations cleanly across APA, MLA, and Chicago styles", () => {
    const sample = {
      author: "Al-Mutairi, N.",
      year: "2025",
      title: "Passive Solar Cooling in Arid Schools",
      container: "Journal of Sustainable Education",
      url: "https://example.org/paper",
    };

    expect(formatAcademicCitation({ ...sample, style: "APA" })).toBe(
      "Al-Mutairi, N. (2025). Passive Solar Cooling in Arid Schools. Journal of Sustainable Education. https://example.org/paper",
    );
    expect(formatAcademicCitation({ ...sample, style: "MLA" })).toBe(
      'Al-Mutairi, N.. "Passive Solar Cooling in Arid Schools." Journal of Sustainable Education, 2025. https://example.org/paper.',
    );
    expect(formatAcademicCitation({ ...sample, style: "Chicago" })).toBe(
      'Al-Mutairi, N.. "Passive Solar Cooling in Arid Schools." Journal of Sustainable Education (2025). https://example.org/paper.',
    );
  });

  it("supports creating research investigations, saving evidence comparison entries, and storing verified citations in Research & Discovery Lab", () => {
    const researchModule = MODULES_CATALOG.find((m) => m.number === "19");
    expect(researchModule?.to).toBe("/app/study?tab=research");

    renderWithProviders(<ResearchDiscoveryLab />);
    expect(screen.getByTestId("research-discovery-lab")).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText(/Investigation title/i), {
      target: { value: "Courtyard Canopy Thermal Study" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Specific, testable research question/i), {
      target: { value: "Does neem canopy lower midday courtyard temperature by 3C?" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Start Research Investigation/i }));

    expect(getStudentEcosystemSnapshot().researchProjects).toHaveLength(1);
    expect(screen.getAllByText("Courtyard Canopy Thermal Study").length).toBeGreaterThan(0);

    fireEvent.change(screen.getByPlaceholderText(/Author \(e\.g\., Al-Mutairi, N\.\)/i), {
      target: { value: "Al-Sabah, R." },
    });
    fireEvent.change(screen.getByPlaceholderText(/Article or Book Title/i), {
      target: { value: "Urban Microclimate Field Readings" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Journal \/ Publisher/i), {
      target: { value: "Gulf Science Review" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save Verified Reference/i }));

    const savedCit = getStudentEcosystemSnapshot().researchCitations;
    expect(savedCit).toHaveLength(1);
    expect(savedCit[0]?.author).toBe("Al-Sabah, R.");
  });

  it("renders ScienceDiscoveryStudio simplified model limitations notice and MathEngineeringStudio prototyping spec builder saving to portfolio", () => {
    renderWithProviders(<ScienceDiscoveryStudio />);
    expect(screen.getByTestId("science-model-limitations")).toBeTruthy();
    expect(screen.getByText(/Model Limitations Notice/i)).toBeTruthy();

    cleanup();

    renderWithProviders(<MathEngineeringStudio />);
    fireEvent.click(screen.getByRole("button", { name: /12\. Engineering Lab/i }));
    expect(screen.getByTestId("engineering-prototyping-studio")).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText(/Prototype title/i), {
      target: { value: "Passive Solar Louver" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Problem statement & user need/i), {
      target: { value: "Reduce afternoon classroom glare without electricity." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Save Prototype Spec & Add to Portfolio/i }),
    );

    const snap = getStudentEcosystemSnapshot();
    expect(snap.engineeringSpecs).toHaveLength(1);
    expect(snap.engineeringSpecs[0]?.title).toBe("Passive Solar Louver");
    expect(snap.portfolio.projects.some((p) => p.title === "Passive Solar Louver")).toBe(true);
  });

  it("includes Fallacy Spotter logic drills and Digital Citizenship safeguards in ThinkingAnalysisStudio", () => {
    renderWithProviders(<ThinkingAnalysisStudio />);
    fireEvent.click(screen.getByRole("button", { name: /22\. Media Literacy/i }));
    expect(
      screen.getByText(/Digital Citizenship, Privacy & AI Verification Checklist/i),
    ).toBeTruthy();
    expect(screen.getByText(/Unverified AI-Generated Reference/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /24\. Logic Lab/i }));
    expect(screen.getByText(/Fallacy Spotter:/i)).toBeTruthy();
  });

  it("supports AI Document Companion offline summary fallback & Study Coach reflections in AiKnowledgeCoachDrawer", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const onAttachContext = vi.fn();
    const onSendPromptWithContext = vi.fn();

    renderWithProviders(
      <AiKnowledgeCoachDrawer
        subject="Biology"
        attachedContext={null}
        onAttachContext={onAttachContext}
        onClearContext={vi.fn()}
        onSendPromptWithContext={onSendPromptWithContext}
        savedAiTasksCount={2}
        savedAiCardsCount={4}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/Document or lesson title/i), {
      target: { value: "Chloroplast Light Reactions" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Paste study notes/i), {
      target: {
        value:
          "Chlorophyll absorbs red and blue wavelengths inside thylakoid membranes. ATP synthase uses a proton gradient to generate ATP cleanly.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Summarize$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Offline Extractive Fallback/i)).toBeTruthy();
    });
    expect(onAttachContext).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Save to Knowledge Workspace/i }));
    expect(getStudentEcosystemSnapshot().knowledgeLibrary).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: /AI Study Coach/i }));
    fireEvent.change(screen.getByPlaceholderText(/1\. Current study target/i), {
      target: { value: "Finish chapter 4 biology review" },
    });
    fireEvent.change(screen.getByPlaceholderText(/3\. Realistic adjustment/i), {
      target: { value: "Two 20-minute focus sprints after rest" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save Coaching Plan/i }));

    const reflections = getStudentEcosystemSnapshot().coachingReflections;
    expect(reflections).toHaveLength(1);
    expect(reflections[0]?.goal).toBe("Finish chapter 4 biology review");
  });

  it("renders IslamicCenterWorkspace dynamically in LTR English and RTL Arabic with non-scoring sincerity safeguard", () => {
    const { rerender } = renderWithProviders(<IslamicCenterWorkspace lang="en" />);
    const rootEn = screen.getByTestId("islamic-center-workspace");
    expect(rootEn.getAttribute("dir")).toBe("ltr");
    expect(screen.getByTestId("islamic-sincerity-notice").textContent).toContain(
      "BTC never calculates divine reward or scores worship",
    );

    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <PreferencesProvider>
          <IslamicCenterWorkspace lang="ar" />
        </PreferencesProvider>
      </QueryClientProvider>,
    );
    const rootAr = screen.getByTestId("islamic-center-workspace");
    expect(rootAr.getAttribute("dir")).toBe("rtl");
    expect(screen.getByTestId("islamic-sincerity-notice").textContent).toContain(
      "لا تقيس المنصة الأجر الإلهي",
    );
  });

  it("persists GoodDeedsPanel private worship check-ins locally with zero points and renders sustainable project handover kit", () => {
    renderWithProviders(<GoodDeedsPanel lang="en" />);
    expect(screen.getByTestId("private-worship-tracker")).toBeTruthy();
    expect(screen.getByTestId("sustainable-handover-checklist")).toBeTruthy();

    fireEvent.click(screen.getByText(/Completed obligatory prayers mindfully/i));
    expect(getStudentEcosystemSnapshot().privateWorshipChecklist.completedKeys).toContain(
      "prayers_focus",
    );

    fireEvent.click(screen.getByText(/Clear step-by-step documentation for others to reuse/i));
    expect(screen.getByText("1/4")).toBeTruthy();
  });

  it("displays connected ecosystem counts & direct links on the Dashboard EcosystemOverviewWidget", () => {
    updateStudentEcosystem((prev) => ({
      ...prev,
      researchCitations: [
        {
          id: "c1",
          author: "Tester, A.",
          year: "2025",
          title: "Solar Microgrids",
          container: "Science Notes",
          url: "",
          reliability: "primary",
          style: "APA",
          formatted: "Tester, A. (2025). Solar Microgrids. Science Notes.",
          createdAt: "2026-11-18T00:00:00.000Z",
        },
      ],
    }));

    renderWithProviders(<EcosystemOverviewWidget />);
    const widget = screen.getByTestId("ecosystem-overview-widget");
    expect(widget).toBeTruthy();
    expect(screen.getByText("Publish Clean Energy Summary")).toBeTruthy();
    expect(screen.getByText(/1 verified citations/i)).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /^Skills & Collaboration$/i }).getAttribute("href"),
    ).toBe("/app/skills");
  });
});
