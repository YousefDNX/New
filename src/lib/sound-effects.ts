const SOUND_STORAGE_KEY = "btc-sound-enabled";

let cachedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    if (!cachedAudioContext || cachedAudioContext.state === "closed") {
      cachedAudioContext = new Ctor();
    }
    if (cachedAudioContext.state === "suspended") {
      void cachedAudioContext.resume().catch(() => {});
    }
    return cachedAudioContext;
  } catch {
    return null;
  }
}

export function isSoundEffectsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(SOUND_STORAGE_KEY);
    if (raw === "false" || raw === "0") return false;
    return true;
  } catch {
    return true;
  }
}

export function setSoundEffectsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore storage quota errors
  }
}

function playTone(
  frequency: number,
  startOffsetSec: number,
  durationSec: number,
  gainPeak: number,
  type: OscillatorType = "sine",
): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime + startOffsetSec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, gainPeak), now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  } catch {
    // Graceful no-op when audio playback is restricted
  }
}

export function playClickSound(): void {
  if (!isSoundEffectsEnabled()) return;
  playTone(540, 0, 0.055, 0.04, "sine");
}

export function playCorrectSound(): void {
  if (!isSoundEffectsEnabled()) return;
  playTone(523.25, 0, 0.12, 0.075, "triangle");
  playTone(659.25, 0.08, 0.16, 0.085, "triangle");
}

export function playIncorrectSound(): void {
  if (!isSoundEffectsEnabled()) return;
  playTone(311.13, 0, 0.14, 0.055, "sine");
  playTone(261.63, 0.1, 0.18, 0.05, "sine");
}

export function playCompleteSound(): void {
  if (!isSoundEffectsEnabled()) return;
  playTone(523.25, 0, 0.11, 0.075, "triangle");
  playTone(659.25, 0.09, 0.11, 0.08, "triangle");
  playTone(783.99, 0.18, 0.22, 0.09, "triangle");
}
