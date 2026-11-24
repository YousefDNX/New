import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdaptiveDataView, type AdaptiveDataItem } from "@/components/adaptive/AdaptiveDataView";
import { AdaptiveFormView } from "@/components/adaptive/AdaptiveFormView";
import { PageHeader } from "@/components/app/Page";
import { DashboardUxView } from "@/components/dashboard/DashboardUxViews";
import { Sidebar } from "@/components/nav/Sidebar";
import {
  CommandOsDock,
  CommandOsSidebar,
  CommandOsTopBar,
  EditorialMasthead,
  FocusDeckCornerRail,
  FocusDeckTopRibbon,
  SpatialFloatingDock,
} from "@/components/nav/UxShellChrome";
import { ThemesLayoutsSection } from "@/components/settings/ThemesLayoutsSection";
import { ExperienceModeProvider, useExperienceMode } from "@/lib/experience-mode";
import { PreferencesProvider, usePrefs } from "@/lib/preferences";
import { THEME_UX_PRESETS, UI_EXPERIENCES } from "@/lib/ui-experiences";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
    className,
    activeOptions: _activeOptions,
    onClick,
    ...rest
  }: {
    to?: string;
    children: React.ReactNode;
    className?: string;
    activeOptions?: unknown;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <a href={to ?? "#"} className={className} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
  useRouterState: ({ select }: { select?: (s: { location: { pathname: string } }) => unknown }) =>
    select ? select({ location: { pathname: "/app" } }) : "/app",
}));

vi.mock("@/hooks/use-rbac", () => ({
  useRbac: () => ({ isStaff: false, role: "student" }),
}));

vi.mock("@/hooks/use-nexora", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useUser: () => ({ data: { uid: "test-user", isAnonymous: false, displayName: "Yousef" } }),
    useProfile: () => ({ data: { display_name: "Yousef" } }),
    useStats: () => ({ data: { level: 3, xp: 450, current_streak: 4 } }),
    useGoals: () => ({ data: [] }),
    useTasks: () => ({ data: [] }),
    useActivityEvents: () => ({ data: [] }),
    useNotifications: () => ({ data: [] }),
    useMarkNotificationRead: () => ({ mutateAsync: vi.fn() }),
  };
});

vi.mock("@/hooks/use-modules", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useFocusSessions: () => ({ data: [] }),
    useAddFocusSession: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useStudyItems: () => ({ data: [] }),
    useCareEntries: () => ({ data: [] }),
    useFuturePlans: () => ({ data: [] }),
    useCircles: () => ({ data: [] }),
    useJournalEntries: () => ({ data: [] }),
    useOpportunities: () => ({ data: [] }),
  };
});

function PreviewBarHarness() {
  const { isPreviewing, commitPreview, cancelPreview, t } = usePrefs();
  if (!isPreviewing) return null;
  return (
    <div data-testid="ux-preview-bar">
      <button type="button" onClick={cancelPreview}>
        {t("set.preview.cancel")}
      </button>
      <button type="button" onClick={() => commitPreview()}>
        {t("set.preview.apply")}
      </button>
    </div>
  );
}

function ShellHarness() {
  const { effectiveUiExperience } = usePrefs();
  return (
    <div data-testid="shell-harness">
      {effectiveUiExperience === "classic" && <Sidebar />}
      {effectiveUiExperience === "editorial_atelier" && (
        <EditorialMasthead
          allModulesTrigger={<span data-testid="all-modules-trigger" />}
          routeLabel="Study Hub"
          onReadAloud={() => {}}
          showReadAloud={false}
          speechActive={false}
          onOpenShortcuts={() => {}}
        />
      )}
      {effectiveUiExperience === "command_os" && (
        <>
          <CommandOsSidebar allModulesTrigger={<span data-testid="all-modules-trigger" />} />
          <CommandOsTopBar
            routeLabel="Study Hub"
            routeGroupLabel="Learning"
            onReadAloud={() => {}}
            showReadAloud={false}
            speechActive={false}
            onOpenShortcuts={() => {}}
          />
          <CommandOsDock allModulesTrigger={<span data-testid="all-modules-trigger" />} />
        </>
      )}
      {effectiveUiExperience === "focus_deck" && (
        <>
          <FocusDeckTopRibbon
            allModulesTrigger={<span data-testid="all-modules-trigger" />}
            routeLabel="Study Hub"
            onReadAloud={() => {}}
            showReadAloud={false}
            speechActive={false}
          />
          <FocusDeckCornerRail />
          <SpatialFloatingDock allModulesTrigger={<span data-testid="all-modules-trigger" />} />
        </>
      )}
      <PageHeader title="Study Hub" subtitle="Workspace" />
      {effectiveUiExperience !== "classic" && (
        <DashboardUxView
          experience={effectiveUiExperience}
          selectedArea={null}
          onSelectArea={() => {}}
          onTabChange={() => {}}
          hiddenWidgets={new Set()}
          simplified={false}
        />
      )}
    </div>
  );
}

function AdaptiveComponentsHarness() {
  const { setMode, mode, paradigm } = useExperienceMode();
  const [title, setTitle] = useState("Draft Strategy");

  const sampleItems: AdaptiveDataItem[] = [
    {
      id: "task-1",
      title: "Revise Physics Optics",
      details: "Complete chapters 4 and 5 notes",
      status: "todo",
      priorityLabel: "High",
      priorityTone: "high",
      categoryLabel: "Study",
      dueLabel: "Today",
      xpLabel: "+25 XP",
    },
    {
      id: "task-2",
      title: "Practice Arabic Rhetoric",
      status: "in_progress",
      priorityLabel: "Medium",
      priorityTone: "medium",
      categoryLabel: "Arabic",
      xpLabel: "+25 XP",
    },
  ];

  return (
    <div>
      <div data-testid="active-paradigm">
        {mode}:{paradigm}
      </div>
      <button type="button" onClick={() => setMode("editorial_atelier")}>
        Switch A
      </button>
      <button type="button" onClick={() => setMode("command_os")}>
        Switch B
      </button>
      <button type="button" onClick={() => setMode("focus_deck")}>
        Switch C
      </button>

      <AdaptiveDataView
        items={sampleItems}
        onToggleDone={() => {}}
        emptyState={<div>Empty</div>}
        labels={{
          colItem: "Task",
          colCategory: "Area",
          colPriority: "Priority",
          colStatus: "Status",
          colActions: "Actions",
          todo: "To Do",
          inProgress: "In Progress",
          done: "Done",
          markDone: "Complete",
          markTodo: "Reopen",
          inspectDrawer: "Open Drawer",
          deleteLabel: "Delete",
          selectHint: "Select an item",
        }}
      />

      <AdaptiveFormView
        onSubmit={(e) => e.preventDefault()}
        submitLabel="Save Task"
        steps={[
          {
            id: "step-1",
            title: "Task Basics",
            content: (
              <input
                aria-label="Draft Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            ),
          },
          {
            id: "step-2",
            title: "Schedule",
            content: <div data-testid="wizard-step-2-body">Schedule Options</div>,
          },
        ]}
      />
    </div>
  );
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

describe("Whole-Website UI & UX Experiences", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    delete document.documentElement.dataset["uxShell"];
    delete document.documentElement.dataset["uxParadigm"];
    document.documentElement.dir = "ltr";
  });

  it("exposes Classic plus 3 brand-new full-website UI & UX experiences and 6 Theme+UX presets", () => {
    expect(UI_EXPERIENCES).toHaveLength(4);
    expect(UI_EXPERIENCES.map((e) => e.id)).toEqual([
      "classic",
      "editorial_atelier",
      "command_os",
      "focus_deck",
    ]);
    expect(UI_EXPERIENCES.filter((e) => e.isNew)).toHaveLength(3);
    expect(THEME_UX_PRESETS).toHaveLength(6);
  });

  it("renders all 4 UI & UX cards and Theme+UX presets in Settings, previews with Cancel rollback, and persists choices", () => {
    const qc = makeQueryClient();
    const runSave = vi.fn((apply: () => void) => apply());

    render(
      <QueryClientProvider client={qc}>
        <PreferencesProvider>
          <ExperienceModeProvider>
            <PreviewBarHarness />
            <ThemesLayoutsSection runSave={runSave} />
          </ExperienceModeProvider>
        </PreferencesProvider>
      </QueryClientProvider>,
    );

    for (const exp of UI_EXPERIENCES) {
      expect(screen.getByTestId(`ux-experience-card-${exp.id}`)).toBeInTheDocument();
    }
    expect(screen.getByTestId("theme-ux-presets")).toBeInTheDocument();
    expect(screen.getByTestId("open-architecture-spec")).toBeInTheDocument();

    // Preview Editorial Atelier -> sets data-ux-shell transiently
    fireEvent.click(screen.getByTestId("preview-ux-editorial_atelier"));
    expect(screen.getByTestId("ux-preview-bar")).toBeInTheDocument();
    expect(document.documentElement.dataset["uxShell"]).toBe("editorial_atelier");

    // Cancel -> reverts back to classic
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByTestId("ux-preview-bar")).not.toBeInTheDocument();
    expect(document.documentElement.dataset["uxShell"]).toBe("classic");

    // Apply Command OS -> saves via runSave + persists in localStorage
    fireEvent.click(screen.getByTestId("apply-ux-command_os"));
    expect(runSave).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), {
      layout_mode: "bottom_dock",
    });
    expect(document.documentElement.dataset["uxShell"]).toBe("command_os");
    expect(document.documentElement.dataset["uxParadigm"]).toBe("command");
    expect(screen.getByTestId("active-ux-name")).toHaveTextContent("Command Center / Workspace");
    const saved = JSON.parse(localStorage.getItem("nexora.prefs") || "{}");
    expect(saved.uiExperience).toBe("command_os");

    // Apply curated Theme+UX preset -> switches mode + theme preset cleanly
    fireEvent.click(screen.getByTestId("theme-ux-preset-spatial_oasis"));
    expect(document.documentElement.dataset["uxShell"]).toBe("focus_deck");
    expect(localStorage.getItem("nexora.uxPreset")).toBe("spatial_oasis");
  });

  it("switches entire navigation shell, collapsible sidebar, spatial radial dock, PageHeader, and dashboard workflow (including Arabic RTL)", () => {
    const qc = makeQueryClient();
    const runSave = vi.fn((apply: () => void) => apply());

    render(
      <QueryClientProvider client={qc}>
        <PreferencesProvider>
          <ExperienceModeProvider>
            <ThemesLayoutsSection runSave={runSave} />
            <ShellHarness />
          </ExperienceModeProvider>
        </PreferencesProvider>
      </QueryClientProvider>,
    );

    // Classic baseline: Sidebar exists, custom shells absent
    expect(document.querySelector("[data-app-sidebar='true']")).toBeInTheDocument();
    expect(screen.queryByTestId("editorial-masthead")).not.toBeInTheDocument();

    // 1) Switch to Editorial Study Journal (Mode A)
    fireEvent.click(screen.getByTestId("apply-ux-editorial_atelier"));
    expect(document.querySelector("[data-app-sidebar='true']")).not.toBeInTheDocument();
    expect(screen.getByTestId("editorial-masthead")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-ux-editorial_atelier")).toBeInTheDocument();
    expect(document.querySelector("[data-ux-page-header='editorial_atelier']")).toBeInTheDocument();

    // 2) Switch to Command OS (Mode B): Collapsible sidebar + Bento grid + Topbar
    fireEvent.click(screen.getByTestId("apply-ux-command_os"));
    expect(screen.getByTestId("command-os-sidebar")).toHaveAttribute("data-collapsed", "false");
    fireEvent.click(screen.getByTestId("command-os-sidebar-toggle"));
    expect(screen.getByTestId("command-os-sidebar")).toHaveAttribute("data-collapsed", "true");
    expect(localStorage.getItem("nexora.cmdSidebarCollapsed")).toBe("1");
    expect(screen.getByTestId("command-os-topbar")).toBeInTheDocument();
    expect(screen.getByTestId("command-bento-grid")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-ux-command_os")).toBeInTheDocument();
    expect(document.querySelector("[data-ux-page-header='command_os']")).toBeInTheDocument();

    // 3) Switch to Spatial / Interactive Studio (Mode C): Floating Dock + Radial Menu + Carousel
    fireEvent.click(screen.getByTestId("apply-ux-focus_deck"));
    expect(screen.getByTestId("focus-deck-header")).toBeInTheDocument();
    expect(screen.getByTestId("focus-deck-rail")).toBeInTheDocument();
    expect(screen.getByTestId("spatial-floating-dock")).toBeInTheDocument();
    expect(screen.getByTestId("spatial-focus-carousel")).toBeInTheDocument();
    expect(screen.getByTestId("spatial-modules-carousel")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("spatial-radial-trigger"));
    expect(screen.getByTestId("spatial-radial-menu")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-ux-focus_deck")).toBeInTheDocument();
    expect(document.querySelector("[data-ux-page-header='focus_deck']")).toBeInTheDocument();

    // Arabic RTL compatibility check
    localStorage.setItem(
      "nexora.prefs",
      JSON.stringify({ lang: "ar", uiExperience: "focus_deck" }),
    );
    cleanup();
    render(
      <QueryClientProvider client={qc}>
        <PreferencesProvider>
          <ExperienceModeProvider>
            <ShellHarness />
          </ExperienceModeProvider>
        </PreferencesProvider>
      </QueryClientProvider>,
    );
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.dataset["uxShell"]).toBe("focus_deck");
    expect(screen.getByTestId("dashboard-ux-focus_deck")).toBeInTheDocument();
  });

  it("structurally transforms AdaptiveDataView & AdaptiveFormView across Mode A, B, and C while preserving form input state", () => {
    const qc = makeQueryClient();
    render(
      <QueryClientProvider client={qc}>
        <PreferencesProvider>
          <ExperienceModeProvider>
            <AdaptiveComponentsHarness />
          </ExperienceModeProvider>
        </PreferencesProvider>
      </QueryClientProvider>,
    );

    // Mode A -> Semantic <table> + Vertical Form
    fireEvent.click(screen.getByRole("button", { name: "Switch A" }));
    expect(screen.getByTestId("adaptive-view-table").querySelector("table")).toBeInTheDocument();
    expect(screen.getByTestId("adaptive-form-vertical")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Draft Title"), {
      target: { value: "Preserved Across Modes" },
    });

    // Mode B -> Kanban Columns + 2-Col Split Form (input state preserved!)
    fireEvent.click(screen.getByRole("button", { name: "Switch B" }));
    expect(screen.getByTestId("adaptive-view-kanban")).toBeInTheDocument();
    expect(screen.getByTestId("adaptive-form-split")).toBeInTheDocument();
    expect((screen.getByLabelText("Draft Title") as HTMLInputElement).value).toBe(
      "Preserved Across Modes",
    );

    // Mode C -> Master-Detail Split View + Slide-Over Drawer + Multi-Step Wizard
    fireEvent.click(screen.getByRole("button", { name: "Switch C" }));
    expect(screen.getByTestId("adaptive-view-master-detail")).toBeInTheDocument();
    expect(screen.getByTestId("adaptive-form-wizard")).toBeInTheDocument();
    expect((screen.getByLabelText("Draft Title") as HTMLInputElement).value).toBe(
      "Preserved Across Modes",
    );

    // Open Slide-Over Drawer from Master-Detail inspector
    fireEvent.click(screen.getByRole("button", { name: "Open Drawer" }));
    expect(screen.getByTestId("spatial-slide-over-drawer")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-spatial-drawer"));
    expect(screen.queryByTestId("spatial-slide-over-drawer")).not.toBeInTheDocument();

    // Advance Multi-Step Form Wizard -> Step 2
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByTestId("wizard-step-2-body")).toBeInTheDocument();
  });
});
