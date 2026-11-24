export type TimerPhase = "focus" | "break";
export type TimerRunStatus = "idle" | "running" | "paused";

export interface PersistedTimerState {
  phase: TimerPhase;
  status: TimerRunStatus;
  focusMinutes: number;
  breakMinutes: number;
  targetEndMs: number | null;
  pausedRemainingSec: number;
  sessionTitle: string;
  subject: string;
  area: "academic" | "productivity" | "growth" | "wellbeing" | "career" | "community";
  linkedTaskId: string;
}

const STORAGE_PREFIX = "nexora.focus.timer.v1.";

export function getTimerStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId || "guest"}`;
}

export function computeRemainingSeconds(
  state: Pick<PersistedTimerState, "status" | "targetEndMs" | "pausedRemainingSec">,
  nowMs = Date.now(),
): number {
  if (state.status === "running" && typeof state.targetEndMs === "number") {
    return Math.max(0, Math.ceil((state.targetEndMs - nowMs) / 1000));
  }
  return Math.max(0, Math.round(state.pausedRemainingSec));
}

export function loadPersistedTimer(
  userId: string,
  defaultFocusMinutes: number,
  defaultBreakMinutes: number,
): PersistedTimerState {
  const fallback: PersistedTimerState = {
    phase: "focus",
    status: "idle",
    focusMinutes: defaultFocusMinutes,
    breakMinutes: defaultBreakMinutes,
    targetEndMs: null,
    pausedRemainingSec: defaultFocusMinutes * 60,
    sessionTitle: "",
    subject: "",
    area: "productivity",
    linkedTaskId: "",
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(getTimerStorageKey(userId));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedTimerState>;
    const phase: TimerPhase = parsed.phase === "break" ? "break" : "focus";
    const status: TimerRunStatus =
      parsed.status === "running" || parsed.status === "paused" ? parsed.status : "idle";
    const focusMinutes =
      typeof parsed.focusMinutes === "number" && parsed.focusMinutes > 0
        ? parsed.focusMinutes
        : defaultFocusMinutes;
    const breakMinutes =
      typeof parsed.breakMinutes === "number" && parsed.breakMinutes > 0
        ? parsed.breakMinutes
        : defaultBreakMinutes;
    return {
      phase,
      status,
      focusMinutes,
      breakMinutes,
      targetEndMs: typeof parsed.targetEndMs === "number" ? parsed.targetEndMs : null,
      pausedRemainingSec:
        typeof parsed.pausedRemainingSec === "number" && parsed.pausedRemainingSec >= 0
          ? parsed.pausedRemainingSec
          : (phase === "focus" ? focusMinutes : breakMinutes) * 60,
      sessionTitle: typeof parsed.sessionTitle === "string" ? parsed.sessionTitle : "",
      subject: typeof parsed.subject === "string" ? parsed.subject : "",
      area: parsed.area ?? "productivity",
      linkedTaskId: typeof parsed.linkedTaskId === "string" ? parsed.linkedTaskId : "",
    };
  } catch {
    return fallback;
  }
}

export function savePersistedTimer(userId: string, state: PersistedTimerState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getTimerStorageKey(userId), JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}
