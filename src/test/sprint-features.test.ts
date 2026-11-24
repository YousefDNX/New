import { describe, expect, it, vi } from "vitest";
import {
  isWithinQuietHours,
  getCurrentTimeStr,
  checkAndTriggerDailyGoalReminder,
} from "@/lib/daily-goal-reminder";
import { GLOBAL_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";
import type { GoalRow } from "@/lib/firestore-data";
import type { NotificationPrefs } from "@/lib/settings";
import { defaultNotificationPrefs } from "@/lib/settings";

describe("Daily Goal Reminder & Quiet Hours", () => {
  it("correctly identifies quiet hours spanning midnight (e.g. 22:00 to 07:00)", () => {
    // 23:30 is quiet
    expect(isWithinQuietHours("23:30", "22:00", "07:00")).toBe(true);
    // 02:15 is quiet
    expect(isWithinQuietHours("02:15", "22:00", "07:00")).toBe(true);
    // 06:59 is quiet
    expect(isWithinQuietHours("06:59", "22:00", "07:00")).toBe(true);
    // 07:00 is not quiet (end boundary is exclusive)
    expect(isWithinQuietHours("07:00", "22:00", "07:00")).toBe(false);
    // 12:00 is not quiet
    expect(isWithinQuietHours("12:00", "22:00", "07:00")).toBe(false);
    // 21:59 is not quiet
    expect(isWithinQuietHours("21:59", "22:00", "07:00")).toBe(false);
    // 22:00 is quiet (start boundary is inclusive)
    expect(isWithinQuietHours("22:00", "22:00", "07:00")).toBe(true);
  });

  it("correctly identifies daytime quiet windows (e.g. 13:00 to 15:00)", () => {
    expect(isWithinQuietHours("12:59", "13:00", "15:00")).toBe(false);
    expect(isWithinQuietHours("13:00", "13:00", "15:00")).toBe(true);
    expect(isWithinQuietHours("14:30", "13:00", "15:00")).toBe(true);
    expect(isWithinQuietHours("15:00", "13:00", "15:00")).toBe(false);
  });

  it("returns current local time in HH:mm format", () => {
    const time = getCurrentTimeStr();
    expect(time).toMatch(/^\d{2}:\d{2}$/);
  });

  it("delivers daily goal reminders when active daily goals exist and outside quiet hours", async () => {
    const mockGoals: GoalRow[] = [
      {
        id: "goal_1",
        user_id: "user_test",
        title: "Solve 5 Math Problems",
        area: "academic",
        status: "active",
        is_daily: true,
        last_reset_date: null,
        target_date: null,
        completed_at: null,
        created_at: new Date().toISOString(),
      },
    ];

    const notifPrefs: NotificationPrefs = {
      ...defaultNotificationPrefs,
      reminders: true,
      quietHoursEnabled: false,
    };

    let toastTriggered = false;
    let toastTitle = "";
    let toastBody = "";

    // Clear any previous mock storage
    localStorage.removeItem("nexora_last_goal_reminder_date");

    const delivered = await checkAndTriggerDailyGoalReminder({
      goals: mockGoals,
      notifications: notifPrefs,
      lang: "en",
      onToastFallback: (t, b) => {
        toastTriggered = true;
        toastTitle = t;
        toastBody = b;
      },
    });

    expect(delivered).toBe(true);
    expect(toastTriggered).toBe(true);
    expect(toastTitle).toContain("Daily Goal Reminder");
    expect(toastBody).toContain("Solve 5 Math Problems");
  });

  it("does not deliver reminders if user has reminders disabled in settings", async () => {
    const mockGoals: GoalRow[] = [
      {
        id: "goal_2",
        user_id: "user_test",
        title: "Study Chemistry",
        area: "academic",
        status: "active",
        is_daily: true,
        last_reset_date: null,
        target_date: null,
        completed_at: null,
        created_at: new Date().toISOString(),
      },
    ];

    const notifPrefs: NotificationPrefs = {
      ...defaultNotificationPrefs,
      reminders: false, // disabled
    };

    const delivered = await checkAndTriggerDailyGoalReminder({
      goals: mockGoals,
      notifications: notifPrefs,
      lang: "en",
    });

    expect(delivered).toBe(false);
  });
});

describe("Global Keyboard Shortcuts Registry", () => {
  it("defines standard navigation shortcuts for Ctrl+1 through Ctrl+4 and Command Palette", () => {
    const keys = GLOBAL_SHORTCUTS.map((s) => s.keyLabel);
    expect(keys).toContain("Ctrl + 1");
    expect(keys).toContain("Ctrl + 2");
    expect(keys).toContain("Ctrl + 3");
    expect(keys).toContain("Ctrl + 4");
    expect(keys).toContain("Ctrl + K");
    expect(keys).toContain("Ctrl + /");

    const growth = GLOBAL_SHORTCUTS.find((s) => s.id === "nav-growth");
    expect(growth?.modulePath).toBe("/app");

    const study = GLOBAL_SHORTCUTS.find((s) => s.id === "nav-study");
    expect(study?.modulePath).toBe("/app/study");

    const tasks = GLOBAL_SHORTCUTS.find((s) => s.id === "nav-productivity");
    expect(tasks?.modulePath).toBe("/app/tasks");

    const ai = GLOBAL_SHORTCUTS.find((s) => s.id === "nav-ai");
    expect(ai?.modulePath).toBe("/app/ai");
  });
});
