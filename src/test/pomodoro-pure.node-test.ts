import test from "node:test";
import assert from "node:assert/strict";
import {
  POMODORO_PRESETS,
  calculateElapsedMinutes,
  calculateFocusXp,
  calculateSessionProgress,
  clampTimerMinutes,
  formatTimerClock,
  nextPomodoroPhase,
  summarizeTodayFocus,
} from "../lib/pomodoro.ts";

test("formats timer clock cleanly across edge cases", () => {
  assert.equal(formatTimerClock(1500), "25:00");
  assert.equal(formatTimerClock(65), "01:05");
  assert.equal(formatTimerClock(0), "00:00");
  assert.equal(formatTimerClock(-12), "00:00");
  assert.equal(formatTimerClock(Number.NaN), "00:00");
});

test("clamps timer minutes and calculates session progress & elapsed minutes", () => {
  assert.equal(clampTimerMinutes(0, 5, 180, 25), 5);
  assert.equal(clampTimerMinutes(300, 5, 180, 25), 180);
  assert.equal(clampTimerMinutes(Number.NaN, 5, 180, 25), 25);

  assert.equal(calculateSessionProgress(1500, 1500), 0);
  assert.equal(calculateSessionProgress(750, 1500), 50);
  assert.equal(calculateSessionProgress(0, 1500), 100);

  assert.equal(calculateElapsedMinutes(1500, 1500), 1);
  assert.equal(calculateElapsedMinutes(900, 1500), 10);
  assert.equal(calculateElapsedMinutes(0, 1500), 25);
});

test("calculates focus XP and advances Pomodoro phases with 4-cycle long break", () => {
  assert.equal(calculateFocusXp(25), 30);
  assert.equal(calculateFocusXp(50), 30);
  assert.equal(calculateFocusXp(10), 12);

  assert.deepEqual(nextPomodoroPhase("focus", 0), {
    nextPhase: "shortBreak",
    nextCompletedCount: 1,
  });
  assert.deepEqual(nextPomodoroPhase("shortBreak", 1), {
    nextPhase: "focus",
    nextCompletedCount: 1,
  });
  assert.deepEqual(nextPomodoroPhase("focus", 3), {
    nextPhase: "longBreak",
    nextCompletedCount: 4,
  });
  assert.deepEqual(nextPomodoroPhase("longBreak", 4), {
    nextPhase: "focus",
    nextCompletedCount: 4,
  });

  assert.equal(POMODORO_PRESETS.length, 3);
});

test("summarizes today completed focus sessions accurately", () => {
  const summary = summarizeTodayFocus(
    [
      { duration_minutes: 25, created_at: "2026-11-14T08:00:00.000Z", completed: true },
      { duration_minutes: 50, created_at: "2026-11-14T11:30:00.000Z", completed: true },
      { duration_minutes: 15, created_at: "2026-11-14T12:00:00.000Z", completed: false },
      { duration_minutes: 30, created_at: "2026-11-13T18:00:00.000Z", completed: true },
    ],
    "2026-11-14",
  );
  assert.deepEqual(summary, { totalMinutes: 75, sessionCount: 2 });
});
