import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { FeatureGuideProvider, FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Sidebar } from "@/components/nav/Sidebar";
import { AppearanceSection } from "@/components/settings/AppearanceSection";
import {
  FEATURE_GUIDES,
  FEATURE_GUIDE_IDS,
  FEATURE_GUIDE_UI_STRINGS,
  getFeatureGuide,
} from "@/lib/feature-guides";
import { SUPPORTED_LANGS } from "@/lib/i18n/types";
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
      activeOptions: _activeOptions,
      activeProps: _activeProps,
      ...rest
    }: {
      children: ReactNode;
      to: string;
      activeOptions?: unknown;
      activeProps?: unknown;
      [k: string]: unknown;
    }) => (
      <a href={to} {...rest}>
        {children}
      </a>
    ),
  };
});

vi.mock("@/hooks/use-rbac", () => ({
  useRbac: () => ({
    role: "student",
    isStaff: false,
    isSuperAdmin: false,
    canAccessAdmin: false,
    loading: false,
  }),
}));

vi.mock("@/hooks/use-nexora", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/use-nexora")>();
  return {
    ...actual,
    useUser: () => ({ data: { uid: "test-user", email: "student@example.com" } }),
    useProfile: () => ({ data: { display_name: "Test Student" } }),
    useStats: () => ({ data: { xp: 120, level: 2, streak: 3 } }),
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
  };
});

function ArabicGuideHarness() {
  const { setLang } = usePrefs();
  return (
    <div>
      <button type="button" onClick={() => setLang("ar")}>
        Switch to Arabic
      </button>
      <FeatureGuideTrigger featureId="study-pomodoro" />
    </div>
  );
}

describe("NEXORA Feature Guides & Settings/Navigation Cleanup", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    document.body.style.overflow = "";
    document.documentElement.dir = "ltr";
  });

  it("provides complete localized guide entries across all 7 languages for every registered feature", () => {
    expect(FEATURE_GUIDE_IDS.length).toBeGreaterThanOrEqual(61);

    for (const lang of SUPPORTED_LANGS) {
      const ui = FEATURE_GUIDE_UI_STRINGS[lang];
      expect(ui).toBeDefined();
      expect(ui.triggerLabel.trim().length).toBeGreaterThan(0);
      expect(ui.closeAria.trim().length).toBeGreaterThan(0);
      expect(ui.confirmCta.trim().length).toBeGreaterThan(0);

      for (const id of FEATURE_GUIDE_IDS) {
        expect(FEATURE_GUIDES[id]).toBeDefined();
        const guide = getFeatureGuide(id, lang);
        expect(guide.title.trim().length, `${id}:${lang} title`).toBeGreaterThan(0);
        expect(guide.category.trim().length, `${id}:${lang} category`).toBeGreaterThan(0);
        expect(guide.whatItDoes.trim().length, `${id}:${lang} whatItDoes`).toBeGreaterThan(0);
        expect(guide.whyAndProblem.trim().length, `${id}:${lang} whyAndProblem`).toBeGreaterThan(0);
        expect(guide.whoBenefits.trim().length, `${id}:${lang} whoBenefits`).toBeGreaterThan(0);
        expect(guide.steps.length, `${id}:${lang} steps`).toBeGreaterThanOrEqual(1);
        expect(guide.options.length, `${id}:${lang} options`).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("opens centered guide without activating parent action, closes on X and Escape", () => {
    const onParentClick = vi.fn();

    render(
      <PreferencesProvider>
        <FeatureGuideProvider>
          <div onClick={onParentClick} role="presentation">
            <FeatureGuideTrigger featureId="study-flashcards" />
          </div>
        </FeatureGuideProvider>
      </PreferencesProvider>,
    );

    const trigger = screen.getByTestId("feature-guide-trigger-study-flashcards");
    fireEvent.click(trigger);

    expect(onParentClick).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("feature-guide-modal-study-flashcards")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByTestId("feature-guide-close-x"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");

    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders guide in RTL Arabic when website language is set to Arabic", () => {
    render(
      <PreferencesProvider>
        <FeatureGuideProvider>
          <ArabicGuideHarness />
        </FeatureGuideProvider>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Switch to Arabic" }));
    fireEvent.click(screen.getByTestId("feature-guide-trigger-study-pomodoro"));

    const modalOverlay = screen.getByTestId("feature-guide-modal-study-pomodoro");
    const modalCard = modalOverlay.firstElementChild as HTMLElement;
    expect(modalCard.getAttribute("dir")).toBe("rtl");
    expect(screen.getByText(FEATURE_GUIDE_UI_STRINGS.ar.confirmCta)).toBeInTheDocument();
    expect(screen.getByText(getFeatureGuide("study-pomodoro", "ar").title)).toBeInTheDocument();
  });

  it("removes BTC CLASSIC theme switcher from Sidebar navigation and removes duplicate theme cards from AppearanceSection", () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <PreferencesProvider>
          <FeatureGuideProvider>
            <Sidebar />
            <AppearanceSection runSave={vi.fn()} />
          </FeatureGuideProvider>
        </PreferencesProvider>
      </QueryClientProvider>,
    );

    expect(screen.queryByTestId("sidebar-theme-switcher")).not.toBeInTheDocument();
    expect(screen.queryByText(/BTC CLASSIC/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("theme-card-classic")).not.toBeInTheDocument();
    expect(screen.queryByTestId("theme-card-creative")).not.toBeInTheDocument();
    expect(screen.getByTestId("feature-guide-trigger-settings-appearance")).toBeInTheDocument();
  });
});
