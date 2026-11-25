export interface HmsDuration {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface FocusPreset {
  id: string;
  hours: number;
  minutes: number;
  seconds: number;
  labelEn: string;
  labelAr: string;
}

export type FocusTimerStatus = "idle" | "running" | "paused" | "completed";

export interface PersistedFocusTimerState {
  status: FocusTimerStatus;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  remainingSeconds: number;
  endAtMs: number | null;
  focusTitle: string;
}

export const FOCUS_PRESETS: FocusPreset[] = [
  { id: "10m", hours: 0, minutes: 10, seconds: 0, labelEn: "10 min", labelAr: "10 دقائق" },
  { id: "25m", hours: 0, minutes: 25, seconds: 0, labelEn: "25 min", labelAr: "25 دقيقة" },
  { id: "45m", hours: 0, minutes: 45, seconds: 0, labelEn: "45 min", labelAr: "45 دقيقة" },
  { id: "1h", hours: 1, minutes: 0, seconds: 0, labelEn: "1 hour", labelAr: "ساعة واحدة" },
  {
    id: "1h30m",
    hours: 1,
    minutes: 30,
    seconds: 0,
    labelEn: "1h 30m",
    labelAr: "ساعة و30 د",
  },
  {
    id: "2h15m",
    hours: 2,
    minutes: 15,
    seconds: 0,
    labelEn: "2h 15m",
    labelAr: "ساعتان و15 د",
  },
];

export function clampHms(input: Partial<HmsDuration>): HmsDuration {
  const rawHours = Number.isFinite(input.hours) ? Math.floor(Number(input.hours)) : 0;
  const rawMinutes = Number.isFinite(input.minutes) ? Math.floor(Number(input.minutes)) : 0;
  const rawSeconds = Number.isFinite(input.seconds) ? Math.floor(Number(input.seconds)) : 0;

  const hours = Math.min(Math.max(rawHours, 0), 23);
  const minutes = Math.min(Math.max(rawMinutes, 0), 59);
  const seconds = Math.min(Math.max(rawSeconds, 0), 59);
  return { hours, minutes, seconds };
}

export function hmsToSeconds(input: Partial<HmsDuration>): number {
  const { hours, minutes, seconds } = clampHms(input);
  return hours * 3600 + minutes * 60 + seconds;
}

export function secondsToHms(totalSeconds: number): HmsDuration {
  const safe = Math.min(
    Math.max(Math.floor(Number.isFinite(totalSeconds) ? totalSeconds : 0), 0),
    86399,
  );
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return { hours, minutes, seconds };
}

export function formatHmsClock(totalSeconds: number): string {
  const { hours, minutes, seconds } = secondsToHms(totalSeconds);
  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
}

export function getFocusTimerStorageKey(uid?: string | null): string {
  return `btc_focus_timer_state_${uid || "guest"}`;
}

export function createDefaultTimerState(): PersistedFocusTimerState {
  return {
    status: "idle",
    hours: 0,
    minutes: 25,
    seconds: 0,
    totalSeconds: 25 * 60,
    remainingSeconds: 25 * 60,
    endAtMs: null,
    focusTitle: "",
  };
}

export function computeRemainingSeconds(
  state: PersistedFocusTimerState,
  nowMs = Date.now(),
): { remainingSeconds: number; completed: boolean } {
  if (state.status !== "running" || state.endAtMs == null) {
    return {
      remainingSeconds: Math.max(0, state.remainingSeconds),
      completed: state.status === "completed" || state.remainingSeconds <= 0,
    };
  }
  const diffMs = state.endAtMs - nowMs;
  if (diffMs <= 0) {
    return { remainingSeconds: 0, completed: true };
  }
  return {
    remainingSeconds: Math.ceil(diffMs / 1000),
    completed: false,
  };
}

export function loadFocusTimerState(
  storageKey: string,
  nowMs = Date.now(),
): PersistedFocusTimerState {
  if (typeof window === "undefined") return createDefaultTimerState();
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return createDefaultTimerState();
    const parsed = JSON.parse(raw) as Partial<PersistedFocusTimerState>;
    const { hours, minutes, seconds } = clampHms({
      hours: parsed.hours ?? 0,
      minutes: parsed.minutes ?? 25,
      seconds: parsed.seconds ?? 0,
    });
    const totalSeconds =
      typeof parsed.totalSeconds === "number" && parsed.totalSeconds >= 0
        ? Math.min(86399, Math.floor(parsed.totalSeconds))
        : hmsToSeconds({ hours, minutes, seconds });

    const candidate: PersistedFocusTimerState = {
      status:
        parsed.status === "running" ||
        parsed.status === "paused" ||
        parsed.status === "completed" ||
        parsed.status === "idle"
          ? parsed.status
          : "idle",
      hours,
      minutes,
      seconds,
      totalSeconds,
      remainingSeconds:
        typeof parsed.remainingSeconds === "number"
          ? Math.max(0, Math.floor(parsed.remainingSeconds))
          : totalSeconds,
      endAtMs: typeof parsed.endAtMs === "number" ? parsed.endAtMs : null,
      focusTitle: typeof parsed.focusTitle === "string" ? parsed.focusTitle.slice(0, 160) : "",
    };

    if (candidate.status === "running" && candidate.endAtMs != null) {
      const { remainingSeconds, completed } = computeRemainingSeconds(candidate, nowMs);
      if (completed) {
        return {
          ...candidate,
          status: "completed",
          remainingSeconds: 0,
          endAtMs: null,
        };
      }
      return {
        ...candidate,
        remainingSeconds,
      };
    }

    return candidate;
  } catch {
    return createDefaultTimerState();
  }
}

export function saveFocusTimerState(storageKey: string, state: PersistedFocusTimerState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export function calculateSessionMinutesToSave(state: PersistedFocusTimerState): number {
  const elapsed = Math.max(0, state.totalSeconds - state.remainingSeconds);
  const secondsUsed = elapsed > 0 ? elapsed : state.totalSeconds;
  return Math.min(1440, Math.max(1, Math.round(secondsUsed / 60)));
}
