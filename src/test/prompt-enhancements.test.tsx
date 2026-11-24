import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PreferencesProvider } from "@/lib/preferences";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { DensityControlPanel } from "@/components/theme/DensityControlPanel";
import { FocusReadingOverlay } from "@/components/common/FocusReadingOverlay";
import { evaluateStudentAchievements, ACHIEVEMENT_DEFINITIONS } from "@/lib/achievement-service";
import { firestoreConfig } from "@/lib/firestore-service";
import { GLOBAL_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";
import { INTERFACE_THEMES } from "@/lib/settings";
import firebaseAppletConfig from "../../firebase-applet-config.json";

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

function createWrapper(children: React.ReactNode) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={qc}>
      <PreferencesProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  );
}

describe("Enhancements: Achievements, Firestore Layer, Themes, Density & Focus Reading", () => {
  afterEach(() => {
    cleanup();
    document.documentElement.removeAttribute("data-ui-theme");
    document.documentElement.removeAttribute("data-density");
  });

  it("initializes Firestore service config with firebase-applet-config.json details", () => {
    expect(firestoreConfig.projectId).toBe(firebaseAppletConfig.projectId);
    expect(firestoreConfig.firestoreDatabaseId).toBe(
      firebaseAppletConfig.firestoreDatabaseId || "(default)",
    );
    expect(firestoreConfig.appId).toBeTruthy();
  });

  it("evaluates achievement progress accurately and tracks claimed state", () => {
    const claimed = new Set(["ach_pioneer"]);
    const results = evaluateStudentAchievements(
      {
        level: 3,
        streak: 7,
        completedTasksCount: 5,
        focusSessionsCount: 4,
        masteredMistakesCount: 1,
        journalsCount: 2,
        careEntriesCount: 3,
        quizzesCount: 2,
        futurePlansCount: 1,
        circleCount: 1,
      },
      claimed,
    );

    expect(results.length).toBe(ACHIEVEMENT_DEFINITIONS.length);
    const pioneer = results.find((a) => a.id === "ach_pioneer");
    expect(pioneer?.unlocked).toBe(true);
    expect(pioneer?.claimed).toBe(true);

    const firstTask = results.find((a) => a.id === "ach_first_task");
    expect(firstTask?.unlocked).toBe(true);
    expect(firstTask?.claimed).toBe(false);
    expect(firstTask?.progressPct).toBe(100);
  });

  it("defines 12 interface themes including nordic_frost, sepia_study, cyber_matrix, midnight_purple", () => {
    expect(INTERFACE_THEMES).toContain("minimal");
    expect(INTERFACE_THEMES).toContain("focus");
    expect(INTERFACE_THEMES).toContain("creative");
    expect(INTERFACE_THEMES).toContain("aurora");
    expect(INTERFACE_THEMES).toContain("aurora_glass");
    expect(INTERFACE_THEMES).toContain("nordic_frost");
    expect(INTERFACE_THEMES).toContain("sepia_study");
    expect(INTERFACE_THEMES).toContain("cyber_matrix");
    expect(INTERFACE_THEMES).toContain("midnight_purple");
  });

  it("ThemeSwitcher switches data-ui-theme globally on root element", () => {
    render(createWrapper(<ThemeSwitcher variant="full" persistToAccount={false} />));

    fireEvent.click(screen.getByRole("button", { name: /Base Themes/i }));
    fireEvent.click(screen.getByTestId("ui-theme-opt-aurora_glass"));
    expect(document.documentElement.getAttribute("data-ui-theme")).toBe("aurora_glass");

    fireEvent.click(screen.getByTestId("ui-theme-opt-nordic_frost"));
    expect(document.documentElement.getAttribute("data-ui-theme")).toBe("nordic_frost");
  });

  it("DensityControlPanel updates data-density on root element", () => {
    render(createWrapper(<DensityControlPanel />));

    const trigger = screen.getByTestId("density-control-trigger");
    fireEvent.click(trigger);

    const compactBtn = screen.getByText("Compact");
    fireEvent.click(compactBtn);
    expect(document.documentElement.getAttribute("data-density")).toBe("compact");

    fireEvent.click(screen.getByTestId("density-control-trigger"));
    const spaciousBtn = screen.getByText("Spacious");
    fireEvent.click(spaciousBtn);
    expect(document.documentElement.getAttribute("data-density")).toBe("spacious");
  });

  it("FocusReadingOverlay renders darkened canvas with adjustable line spacing and closes on button", () => {
    const onClose = vi.fn();
    render(
      createWrapper(
        <FocusReadingOverlay
          isOpen={true}
          onClose={onClose}
          title="Thermodynamics"
          subtitle="Physics"
        >
          <p>First law of thermodynamics conserves energy across isolated systems.</p>
        </FocusReadingOverlay>,
      ),
    );

    expect(screen.getByText("Thermodynamics")).toBeInTheDocument();
    expect(
      screen.getByText("First law of thermodynamics conserves energy across isolated systems."),
    ).toBeInTheDocument();

    const spacingBtn = screen.getByTitle("Line Spacing (Standard / Spacious / Deep)");
    fireEvent.click(spacingBtn);
    expect(document.getElementById("focus-reading-content-body")?.className).toContain(
      "leading-[2.7]",
    );

    const closeBtn = screen.getByText("Close");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("registers global keyboard shortcuts including Cmd+K and G for Growth Map", () => {
    const palette = GLOBAL_SHORTCUTS.find((s) => s.id === "palette");
    const growthMap = GLOBAL_SHORTCUTS.find((s) => s.id === "nav-growth-map");
    expect(palette).toBeDefined();
    expect(growthMap?.keys).toEqual(["G"]);
    expect(growthMap?.modulePath).toBe("/app?tab=growthmap");
  });
});
