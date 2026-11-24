import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PreferencesProvider } from "@/lib/preferences";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { MilestoneProgressCircle } from "@/components/dashboard/MilestoneProgressCircle";
import {
  computeMilestoneProgress,
  getMilestoneTier,
  MILESTONE_TIERS,
} from "@/lib/milestone-progress";

vi.mock("@/hooks/use-nexora", () => ({
  useUser: () => ({ data: { uid: "test-user-1" }, isLoading: false }),
  useStats: () => ({
    data: {
      user_id: "test-user-1",
      xp: 450,
      level: 4,
      current_streak: 5,
      longest_streak: 5,
    },
  }),
  useTasks: () => ({
    data: [
      { id: "t1", status: "done" },
      { id: "t2", status: "done" },
      { id: "t3", status: "done" },
      { id: "t4", status: "done" },
      { id: "t5", status: "done" },
    ],
  }),
  useGoals: () => ({
    data: [
      { id: "g1", status: "completed" },
      { id: "g2", status: "completed" },
      { id: "g3", status: "completed" },
    ],
  }),
}));

vi.mock("@/hooks/use-modules", () => ({
  useFocusSessions: () => ({ data: [{ id: "f1" }, { id: "f2" }] }),
  useStudyItems: () => ({
    data: [{ id: "s1" }, { id: "s2" }, { id: "s3" }],
  }),
}));

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <PreferencesProvider>
        <ThemeProvider>{ui}</ThemeProvider>
      </PreferencesProvider>
    </QueryClientProvider>,
  );
}

describe("MilestoneProgressCircle & Milestone Tier Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates correct tier thresholds across progression levels", () => {
    expect(getMilestoneTier(0).tier).toBe("bronze");
    expect(getMilestoneTier(20).tier).toBe("bronze");
    expect(getMilestoneTier(25).tier).toBe("silver");
    expect(getMilestoneTier(49).tier).toBe("silver");
    expect(getMilestoneTier(50).tier).toBe("gold");
    expect(getMilestoneTier(74).tier).toBe("gold");
    expect(getMilestoneTier(75).tier).toBe("platinum");
    expect(getMilestoneTier(99).tier).toBe("platinum");
    expect(getMilestoneTier(100).tier).toBe("diamond");
  });

  it("renders SVG circular gauge with correct progressbar role and aria attributes", () => {
    renderWithProviders(<MilestoneProgressCircle overridePercentage={65} />);

    const gauge = screen.getByRole("progressbar");
    expect(gauge).toBeInTheDocument();
    expect(gauge).toHaveAttribute("aria-valuenow", "65");
    expect(gauge).toHaveAttribute("aria-valuemin", "0");
    expect(gauge).toHaveAttribute("aria-valuemax", "100");

    const pctText = screen.getByTestId("milestone-circle-percentage");
    expect(pctText).toHaveTextContent("65%");
  });

  it("renders SVG elements with proper circle geometry and strokeDasharray", () => {
    const { container } = renderWithProviders(
      <MilestoneProgressCircle size="md" overridePercentage={50} />,
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 104 104");

    const arc = screen.getByTestId("milestone-circle-arc");
    expect(arc).toBeInTheDocument();

    // Size 'md': dim 104, stroke 8 => radius (104 - 8) / 2 = 48
    // Circumference = 2 * PI * 48 ≈ 301.59
    const radiusAttr = Number(arc.getAttribute("r"));
    expect(radiusAttr).toBe(48);

    const rawArray =
      arc.getAttribute("stroke-dasharray") ?? arc.getAttribute("strokeDasharray") ?? "";
    const strokeDasharray = parseFloat(rawArray);
    const expectedCircumference = 2 * Math.PI * 48;
    expect(Math.abs(strokeDasharray - expectedCircumference)).toBeLessThan(0.01);

    // At 50%, strokeDashoffset should be half the circumference
    const rawOffset =
      arc.getAttribute("stroke-dashoffset") ?? arc.getAttribute("strokeDashoffset") ?? "";
    const strokeDashoffset = parseFloat(rawOffset);
    expect(Math.abs(strokeDashoffset - expectedCircumference / 2)).toBeLessThan(0.01);
  });

  it("renders at 0% and 100% boundary conditions cleanly", () => {
    const { rerender } = renderWithProviders(
      <MilestoneProgressCircle size="lg" overridePercentage={0} />,
    );
    expect(screen.getByTestId("milestone-circle-percentage")).toHaveTextContent("0%");
    let arc = screen.getByTestId("milestone-circle-arc");
    // At 0%, offset equals circumference
    const rawC0 = arc.getAttribute("stroke-dasharray") ?? arc.getAttribute("strokeDasharray") ?? "";
    const c0 = parseFloat(rawC0);
    const rawOff0 =
      arc.getAttribute("stroke-dashoffset") ?? arc.getAttribute("strokeDashoffset") ?? "";
    expect(parseFloat(rawOff0)).toBeCloseTo(c0, 1);

    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <PreferencesProvider>
          <ThemeProvider>
            <MilestoneProgressCircle size="lg" overridePercentage={100} />
          </ThemeProvider>
        </PreferencesProvider>
      </QueryClientProvider>,
    );
    expect(screen.getByTestId("milestone-circle-percentage")).toHaveTextContent("100%");
    arc = screen.getByTestId("milestone-circle-arc");
    // At 100%, offset should be 0
    const rawOff100 =
      arc.getAttribute("stroke-dashoffset") ?? arc.getAttribute("strokeDashoffset") ?? "";
    expect(parseFloat(rawOff100)).toBeCloseTo(0, 1);
  });

  it("renders the active tier badge with dual-coded icon and name", () => {
    renderWithProviders(<MilestoneProgressCircle overridePercentage={85} showTierBadge={true} />);

    const badge = screen.getByTestId("milestone-circle-tier-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("Platinum Luminary");
    expect(badge).toHaveTextContent("💠");
  });

  it("toggles the interactive milestone details tooltip on click and keyboard enter", () => {
    renderWithProviders(
      <MilestoneProgressCircle overridePercentage={70} showTooltip={true} showTierBadge={true} />,
    );

    // Tooltip should not be open initially
    expect(screen.queryByTestId("milestone-circle-tooltip")).not.toBeInTheDocument();

    // Click on gauge to open
    const gauge = screen.getByTestId("milestone-progress-circle-gauge");
    fireEvent.click(gauge);
    expect(screen.getByTestId("milestone-circle-tooltip")).toBeInTheDocument();
    expect(screen.getByText(/Milestone Mastery/i)).toBeInTheDocument();

    // Click again to close
    fireEvent.click(gauge);
    expect(screen.queryByTestId("milestone-circle-tooltip")).not.toBeInTheDocument();

    // Press Enter to open
    fireEvent.keyDown(gauge, { key: "Enter" });
    expect(screen.getByTestId("milestone-circle-tooltip")).toBeInTheDocument();
  });

  it("honors custom role prop when embedded inline in other containers", () => {
    renderWithProviders(
      <MilestoneProgressCircle overridePercentage={40} role="img" variant="inline" />,
    );

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});
