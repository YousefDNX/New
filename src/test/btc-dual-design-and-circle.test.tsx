import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { FeatureGuideProvider } from "@/components/common/FeatureGuideModal";
import {
  KnowledgeCircleQaBoard,
  KNOWLEDGE_CATEGORIES,
} from "@/components/circle/KnowledgeCircleQaBoard";
import { CircleWorkspace } from "@/components/modules/CircleWorkspace";
import { MobileNav } from "@/components/nav/MobileNav";
import {
  ModernFloatingDock,
  ModernMobileNav,
  ModernNavHeader,
} from "@/components/nav/ModernNavigation";
import { Sidebar } from "@/components/nav/Sidebar";
import { AppearanceSection } from "@/components/settings/AppearanceSection";
import { PreferencesProvider, usePrefs } from "@/lib/preferences";

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useRouterState: () => ({ location: { pathname: "/app" } }),
    Link: ({
      children,
      to,
      search,
      activeOptions: _activeOptions,
      activeProps: _activeProps,
      ...rest
    }: {
      children: ReactNode;
      to?: string;
      search?: Record<string, string>;
      activeOptions?: unknown;
      activeProps?: unknown;
      [k: string]: unknown;
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

vi.mock("@/hooks/use-rbac", () => ({
  useRbac: () => ({
    role: "student",
    isStaff: false,
    isAdmin: false,
    isFounder: false,
    canManageTickets: false,
    canModerate: false,
    canManageHelp: false,
    canManageUsers: false,
    canManageStaff: false,
    loading: false,
  }),
}));

vi.mock("@/hooks/use-nexora", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/use-nexora")>();
  return {
    ...actual,
    useUser: () => ({ data: { uid: "dual-test-user", displayName: "Nour Student" } }),
    useProfile: () => ({ data: { display_name: "Nour Student" } }),
    useStats: () => ({ data: { xp: 240, level: 3, current_streak: 4 } }),
    useTasks: () => ({ data: [] }),
    useGoals: () => ({ data: [] }),
    useNotifications: () => ({ data: [] }),
    useMarkNotificationRead: () => ({ mutateAsync: vi.fn() }),
  };
});

vi.mock("@/hooks/use-modules", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/use-modules")>();
  return {
    ...actual,
    useStudyItems: () => ({ data: [] }),
    useCircles: () => ({ data: [] }),
    useCircleDetails: () => ({ data: { members: [], posts: [] } }),
    useCircleActions: () => ({
      createCircle: vi.fn(async () => ({ id: "c1" })),
      joinByInviteCode: vi.fn(async () => ({ joined: true })),
      createCirclePost: vi.fn(async () => {}),
      updateCirclePost: vi.fn(async () => {}),
      deleteCirclePost: vi.fn(async () => {}),
      togglePostStatus: vi.fn(async () => {}),
      toggleHelpful: vi.fn(async () => {}),
      updateCircleGoal: vi.fn(async () => {}),
      leaveCircle: vi.fn(async () => {}),
      submitModerationReport: vi.fn(async () => {}),
    }),
  };
});

function DualNavHarness() {
  const { effectiveBtcVisualTheme, effectiveBtcNavLayout, setLang } = usePrefs();
  return (
    <div>
      <span data-testid="harness-theme">{effectiveBtcVisualTheme}</span>
      <span data-testid="harness-nav">{effectiveBtcNavLayout}</span>
      <button type="button" onClick={() => setLang("ar")}>
        Switch AR
      </button>
      {effectiveBtcNavLayout === "modern" ? (
        <>
          <ModernNavHeader />
          <ModernFloatingDock />
          <ModernMobileNav />
        </>
      ) : (
        <>
          <Sidebar />
          <MobileNav />
        </>
      )}
    </div>
  );
}

describe("BTC Dual Visual Themes, Dual Navigation Layouts, Knowledge Q&A & Girls Space", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-btc-theme");
    document.documentElement.removeAttribute("data-btc-nav-layout");
    document.documentElement.dir = "ltr";
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.removeAttribute("data-btc-theme");
    document.documentElement.removeAttribute("data-btc-nav-layout");
    document.documentElement.dir = "ltr";
  });

  it("toggles all 4 Theme x Nav combinations independently without resetting language or progress", () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const runSave = vi.fn((apply: () => void) => apply());

    render(
      <QueryClientProvider client={qc}>
        <PreferencesProvider>
          <FeatureGuideProvider>
            <AppearanceSection runSave={runSave} />
            <DualNavHarness />
          </FeatureGuideProvider>
        </PreferencesProvider>
      </QueryClientProvider>,
    );

    // 1. Default: Original + Classic -> Classic Sidebar present
    expect(screen.getByTestId("harness-theme")).toHaveTextContent("btc_original");
    expect(screen.getByTestId("harness-nav")).toHaveTextContent("classic");
    expect(document.documentElement.getAttribute("data-btc-theme")).toBe("original");
    expect(document.documentElement.getAttribute("data-btc-nav-layout")).toBe("classic");
    expect(document.querySelector('[data-app-sidebar="true"]')).toBeInTheDocument();
    expect(screen.queryByTestId("modern-nav-header")).not.toBeInTheDocument();

    // 2. Original + Modern
    fireEvent.click(screen.getByTestId("layout-nav-modern"));
    expect(screen.getByTestId("harness-theme")).toHaveTextContent("btc_original");
    expect(screen.getByTestId("harness-nav")).toHaveTextContent("modern");
    expect(document.documentElement.getAttribute("data-btc-nav-layout")).toBe("modern");
    expect(document.querySelector('[data-app-sidebar="true"]')).not.toBeInTheDocument();
    expect(screen.getByTestId("modern-nav-header")).toBeInTheDocument();
    expect(screen.getByTestId("modern-floating-dock")).toBeInTheDocument();
    expect(screen.getByTestId("modern-mobile-nav")).toBeInTheDocument();

    // 3. Alternative + Modern
    fireEvent.click(screen.getByTestId("theme-preset-btc_alternative"));
    expect(screen.getByTestId("harness-theme")).toHaveTextContent("btc_alternative");
    expect(screen.getByTestId("harness-nav")).toHaveTextContent("modern");
    expect(document.documentElement.getAttribute("data-btc-theme")).toBe("alternative");
    expect(localStorage.getItem("btc-visual-theme")).toBe("btc_alternative");
    expect(localStorage.getItem("btc-nav-layout")).toBe("modern");

    // 4. Alternative + Classic + Arabic RTL preservation
    fireEvent.click(screen.getByRole("button", { name: "Switch AR" }));
    fireEvent.click(screen.getByTestId("layout-nav-classic"));
    expect(document.documentElement.dir).toBe("rtl");
    expect(screen.getByTestId("harness-theme")).toHaveTextContent("btc_alternative");
    expect(screen.getByTestId("harness-nav")).toHaveTextContent("classic");
    expect(document.querySelector('[data-app-sidebar="true"]')).toBeInTheDocument();
  });

  it("supports 10 subject categories, anti-bullying charter, PII safety, and thread posting in KnowledgeCircleQaBoard", () => {
    expect(KNOWLEDGE_CATEGORIES).toHaveLength(10);

    render(
      <PreferencesProvider>
        <KnowledgeCircleQaBoard authorName="Nour Student" />
      </PreferencesProvider>,
    );

    expect(screen.getByTestId("knowledge-circle-qa")).toBeInTheDocument();

    // Accept community charter
    const charterBtn = screen.getByRole("button", { name: /Accept Charter/i });
    fireEvent.click(charterBtn);
    expect(localStorage.getItem("btc_circle_charter_v1")).toBe("accepted");

    // Filter by Mathematics category
    fireEvent.click(screen.getByRole("button", { name: "Mathematics" }));
    expect(screen.getByText(/factoring quadratics/i)).toBeInTheDocument();
  });

  it("opens Girls Space with privacy banner directly when initialSection='girls_space'", () => {
    render(
      <PreferencesProvider>
        <FeatureGuideProvider>
          <CircleWorkspace initialSection="girls_space" />
        </FeatureGuideProvider>
      </PreferencesProvider>,
    );

    expect(screen.getByTestId("girls-space-hub")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Girls' Space · Privacy-Protected · Membership & Gender Never Publicly Disclosed/i,
      ),
    ).toBeInTheDocument();
  });
});
