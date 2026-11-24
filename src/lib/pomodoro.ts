export type PomodoroPhase = "focus" | "shortBreak" | "longBreak";

export interface PomodoroPreset {
  id: "sprint" | "classic" | "deep";
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}

export const POMODORO_PRESETS: readonly PomodoroPreset[] = [
  { id: "sprint", focusMinutes: 15, shortBreakMinutes: 3, longBreakMinutes: 10 },
  { id: "classic", focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 },
  { id: "deep", focusMinutes: 50, shortBreakMinutes: 10, longBreakMinutes: 20 },
] as const;

export function clampTimerMinutes(minutes: number, min = 1, max = 180, fallback = 25): number {
  if (!Number.isFinite(minutes)) return fallback;
  return Math.round(Math.min(max, Math.max(min, minutes)));
}

export function formatTimerClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(Number.isFinite(totalSeconds) ? totalSeconds : 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function calculateSessionProgress(remainingSeconds: number, totalSeconds: number): number {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return 0;
  const elapsed = Math.max(0, totalSeconds - Math.max(0, remainingSeconds));
  return Math.min(100, Math.max(0, Math.round((elapsed / totalSeconds) * 100)));
}

export function calculateElapsedMinutes(remainingSeconds: number, totalSeconds: number): number {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return 1;
  const elapsedSec = Math.max(0, totalSeconds - Math.max(0, remainingSeconds));
  return clampTimerMinutes(Math.max(1, Math.round(elapsedSec / 60)), 1, 180, 1);
}

export function calculateFocusXp(durationMinutes: number): number {
  const safe = clampTimerMinutes(durationMinutes, 1, 180, 25);
  if (safe >= 25) return 30;
  return Math.min(30, Math.max(10, Math.round(safe * 1.2)));
}

export function nextPomodoroPhase(
  currentPhase: PomodoroPhase,
  completedFocusCount: number,
  cyclesBeforeLongBreak = 4,
): { nextPhase: PomodoroPhase; nextCompletedCount: number } {
  const cycleSize = Math.max(2, Math.floor(cyclesBeforeLongBreak));
  if (currentPhase === "focus") {
    const nextCompletedCount = Math.max(0, completedFocusCount) + 1;
    const nextPhase: PomodoroPhase =
      nextCompletedCount % cycleSize === 0 ? "longBreak" : "shortBreak";
    return { nextPhase, nextCompletedCount };
  }
  return {
    nextPhase: "focus",
    nextCompletedCount: Math.max(0, completedFocusCount),
  };
}

export function summarizeTodayFocus(
  sessions: Array<{ duration_minutes: number; created_at: string; completed?: boolean }>,
  todayIso = new Date().toISOString().slice(0, 10),
): { totalMinutes: number; sessionCount: number } {
  let totalMinutes = 0;
  let sessionCount = 0;
  for (const s of sessions) {
    if (s.completed === false) continue;
    if (typeof s.created_at === "string" && s.created_at.slice(0, 10) === todayIso) {
      totalMinutes += Math.max(0, Number(s.duration_minutes) || 0);
      sessionCount += 1;
    }
  }
  return { totalMinutes, sessionCount };
}
