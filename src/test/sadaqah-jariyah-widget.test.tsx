import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SadaqahJariyahWidget } from "@/components/dashboard/SadaqahJariyahWidget";
import { formatNumber } from "@/lib/locale-format";
import {
  SADAQAH_FAMILY_STORAGE_KEY,
  SADAQAH_TRACKER_STORAGE_KEY,
  clampGoalTarget,
  computeConsistencyMetrics,
  countDeedsForPeriod,
  createInitialSadaqahState,
  getLocalDateKey,
  logSadaqahDeed,
  normalizeSadaqahState,
  removeSadaqahDeed,
} from "@/lib/sadaqah-jariyah";

describe("Sadaqah Jariyah tracker library & dashboard widget", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("logs and undoes deeds, calculates daily/weekly/monthly progress, and tracks streaks accurately", () => {
    const wednesday = new Date(2026, 10, 18, 12, 0, 0); // Wed Nov 18, 2026
    const tuesday = new Date(2026, 10, 17, 12, 0, 0);
    const prevMonth = new Date(2026, 9, 25, 12, 0, 0);

    let state = createInitialSadaqahState();
    state = logSadaqahDeed(state, {
      category: "knowledge",
      title: "Shared math notes",
      now: prevMonth,
    });
    state = logSadaqahDeed(state, {
      category: "charity",
      title: "Water bottle charity",
      now: tuesday,
    });
    state = logSadaqahDeed(state, {
      category: "family",
      title: "Helped parents",
      now: wednesday,
    });

    expect(state.totalDeeds).toBe(3);
    expect(state.categoryCounts.knowledge).toBe(1);
    expect(state.categoryCounts.charity).toBe(1);
    expect(state.categoryCounts.family).toBe(1);
    expect(countDeedsForPeriod(state.dailyCounts, "daily", wednesday)).toBe(1);
    expect(countDeedsForPeriod(state.dailyCounts, "weekly", wednesday)).toBe(2);
    expect(countDeedsForPeriod(state.dailyCounts, "monthly", wednesday)).toBe(2);

    const metrics = computeConsistencyMetrics(state, wednesday);
    expect(metrics.todayCount).toBe(1);
    expect(metrics.periodCount).toBe(2);
    expect(metrics.consecutiveDays).toBe(2);
    expect(metrics.activeDaysTotal).toBe(3);

    const latestId = state.recentDeeds[0]!.id;
    const afterUndo = removeSadaqahDeed(state, latestId);
    expect(afterUndo.totalDeeds).toBe(2);
    expect(afterUndo.dailyCounts[getLocalDateKey(wednesday)]).toBeUndefined();
    expect(clampGoalTarget(999)).toBe(365);
    expect(clampGoalTarget(0)).toBe(1);

    const normalized = normalizeSadaqahState({
      goalCadence: "monthly",
      goalTarget: 15,
      categoryCounts: { charity: 4 },
    });
    expect(normalized.goalCadence).toBe("monthly");
    expect(normalized.goalTarget).toBe(15);
    expect(normalized.totalDeeds).toBe(4);
  });

  it("quick-logs deeds, adds and undoes custom deeds, configures long-term consistency goals, and avoids gamification XP", () => {
    render(<SadaqahJariyahWidget lang="ar" />);

    const widget = screen.getByTestId("sadaqah-jariyah-widget");
    expect(widget).toBeInTheDocument();
    expect(screen.getByTestId("sadaqah-total-count")).toHaveTextContent(formatNumber(0, "ar"));
    // Sincerity check: no XP reward claims
    expect(widget).toHaveTextContent(/0 نقاط/);

    // Configure monthly goal with target = 2 & intention text
    fireEvent.click(screen.getByTestId("sadaqah-goal-toggle-btn"));
    expect(screen.getByTestId("sadaqah-goal-panel")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("sadaqah-cadence-monthly"));
    fireEvent.change(screen.getByTestId("sadaqah-goal-target-input"), { target: { value: "2" } });
    fireEvent.change(screen.getByTestId("sadaqah-goal-intention-input"), {
      target: { value: "صدقة جارية لا تنقطع عن أهلي" },
    });
    fireEvent.click(screen.getByTestId("sadaqah-save-goal-btn"));

    expect(screen.queryByTestId("sadaqah-goal-panel")).not.toBeInTheDocument();
    expect(widget).toHaveTextContent("صدقة جارية لا تنقطع عن أهلي");

    // Quick-log first deed (knowledge)
    fireEvent.click(screen.getByTestId("sadaqah-log-knowledge"));
    expect(screen.getByTestId("sadaqah-total-count")).toHaveTextContent(formatNumber(1, "ar"));
    expect(screen.queryByTestId("sadaqah-goal-reached-banner")).not.toBeInTheDocument();

    // Add custom deed -> reaches goal of 2 and shows completion banner
    fireEvent.change(screen.getByTestId("sadaqah-custom-input"), {
      target: { value: "سقيا ماء خالص لوجه الله" },
    });
    fireEvent.click(screen.getByTestId("sadaqah-custom-submit-btn"));

    expect(screen.getByTestId("sadaqah-total-count")).toHaveTextContent(formatNumber(2, "ar"));
    expect(screen.getByTestId("sadaqah-goal-reached-banner")).toBeInTheDocument();
    expect(widget).toHaveTextContent("سقيا ماء خالص لوجه الله");

    // Verify localStorage persistence
    const rawSaved = localStorage.getItem(SADAQAH_TRACKER_STORAGE_KEY);
    expect(rawSaved).toBeTruthy();
    const parsed = JSON.parse(rawSaved!);
    expect(parsed.totalDeeds).toBe(2);
    expect(parsed.goalCadence).toBe("monthly");
    expect(parsed.goalTarget).toBe(2);

    // Undo the custom deed
    const undoBtn = screen.getByRole("button", { name: /تراجع عن سقيا ماء خالص لوجه الله/i });
    fireEvent.click(undoBtn);
    expect(screen.getByTestId("sadaqah-total-count")).toHaveTextContent(formatNumber(1, "ar"));
    expect(screen.queryByTestId("sadaqah-goal-reached-banner")).not.toBeInTheDocument();
  });

  it("edits and persists family dedication names and syncs them to SadaqahJariyahAndDuaaModal", () => {
    render(<SadaqahJariyahWidget lang="en" />);

    fireEvent.click(screen.getByTestId("sadaqah-edit-family-btn"));
    fireEvent.change(screen.getByTestId("sadaqah-family-input"), {
      target: { value: "Parents & Siblings" },
    });
    fireEvent.click(screen.getByTestId("sadaqah-save-family-btn"));

    expect(localStorage.getItem(SADAQAH_FAMILY_STORAGE_KEY)).toBe("Parents & Siblings");
    expect(screen.getByTestId("sadaqah-jariyah-widget")).toHaveTextContent("Parents & Siblings");

    // Open modal directly from the widget and verify synced dedication
    fireEvent.click(screen.getByTestId("sadaqah-widget-duaa-btn"));
    const modal = screen.getByTestId("sadaqah-duaa-modal");
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveTextContent("Parents & Siblings");
  });
});
