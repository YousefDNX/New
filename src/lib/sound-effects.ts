const SOUND_STORAGE_KEY = "btc-sound-enabled";
const SOUND_VOLUME_KEY = "btc-sound-volume";
const SOUND_PRESET_KEY = "btc-sound-preset";

export type SoundPresetId = "chime" | "crystal" | "gentle" | "crisp";

let cachedAudioContext: AudioContext | null = null;
let lastClickPlayedAt = 0;

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

export function getSoundVolume(): number {
  if (typeof window === "undefined") return 0.8;
  try {
    const raw = window.localStorage.getItem(SOUND_VOLUME_KEY);
    const parsed = Number(raw);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
    return 0.8;
  } catch {
    return 0.8;
  }
}

export function setSoundVolume(volume: number): void {
  if (typeof window === "undefined") return;
  try {
    const clamped = Math.max(0, Math.min(1, volume));
    window.localStorage.setItem(SOUND_VOLUME_KEY, String(clamped));
  } catch {
    // Ignore storage quota errors
  }
}

export function getSoundPreset(): SoundPresetId {
  if (typeof window === "undefined") return "chime";
  try {
    const raw = window.localStorage.getItem(SOUND_PRESET_KEY);
    if (raw === "chime" || raw === "crystal" || raw === "gentle" || raw === "crisp") {
      return raw;
    }
    return "chime";
  } catch {
    return "chime";
  }
}

export function setSoundPreset(preset: SoundPresetId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SOUND_PRESET_KEY, preset);
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
    const vol = getSoundVolume();
    if (vol <= 0) return;

    const now = ctx.currentTime + startOffsetSec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, gainPeak * vol), now + 0.015);
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
  const now = Date.now();
  // Deduplicate simultaneous calls when a <Button> triggers alongside global listener
  if (now - lastClickPlayedAt < 35) return;
  lastClickPlayedAt = now;

  const preset = getSoundPreset();
  if (preset === "crystal") {
    playTone(880, 0, 0.045, 0.035, "sine");
  } else if (preset === "gentle") {
    playTone(392, 0, 0.06, 0.03, "sine");
  } else if (preset === "crisp") {
    playTone(680, 0, 0.04, 0.045, "triangle");
  } else {
    playTone(540, 0, 0.055, 0.04, "sine");
  }
}

export function playCorrectSound(): void {
  if (!isSoundEffectsEnabled()) return;
  const preset = getSoundPreset();
  if (preset === "crystal") {
    playTone(659.25, 0, 0.11, 0.075, "sine");
    playTone(880, 0.08, 0.18, 0.085, "sine");
  } else if (preset === "gentle") {
    playTone(440, 0, 0.13, 0.065, "sine");
    playTone(554.37, 0.09, 0.17, 0.075, "sine");
  } else {
    playTone(523.25, 0, 0.12, 0.075, "triangle");
    playTone(659.25, 0.08, 0.16, 0.085, "triangle");
  }
}

export function playIncorrectSound(): void {
  if (!isSoundEffectsEnabled()) return;
  const preset = getSoundPreset();
  if (preset === "crystal") {
    playTone(349.23, 0, 0.13, 0.055, "sine");
    playTone(293.66, 0.09, 0.17, 0.05, "sine");
  } else {
    playTone(311.13, 0, 0.14, 0.055, "sine");
    playTone(261.63, 0.1, 0.18, 0.05, "sine");
  }
}

export function playCompleteSound(): void {
  if (!isSoundEffectsEnabled()) return;
  const preset = getSoundPreset();
  if (preset === "crystal") {
    playTone(587.33, 0, 0.11, 0.075, "sine");
    playTone(739.99, 0.09, 0.11, 0.08, "sine");
    playTone(880, 0.18, 0.22, 0.09, "sine");
  } else {
    playTone(523.25, 0, 0.11, 0.075, "triangle");
    playTone(659.25, 0.09, 0.11, 0.08, "triangle");
    playTone(783.99, 0.18, 0.22, 0.09, "triangle");
  }
}

/**
 * Installs a lightweight global click sound listener on interactive elements
 * (buttons, links, switches, checkboxes, tabs) so every tap feels responsive.
 */
export function installGlobalClickSound(): () => void {
  if (typeof document === "undefined") return () => {};

  const handlePointerClick = (event: MouseEvent) => {
    if (!isSoundEffectsEnabled()) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const interactive = target.closest(
      'button, a, [role="button"], [role="tab"], [role="switch"], [role="option"], input[type="checkbox"], input[type="radio"], summary',
    ) as HTMLElement | null;
    if (!interactive) return;
    if (
      (interactive as HTMLButtonElement).disabled ||
      interactive.getAttribute("aria-disabled") === "true"
    ) {
      return;
    }
    playClickSound();
  };

  document.addEventListener("click", handlePointerClick, { capture: true, passive: true });
  return () => {
    document.removeEventListener("click", handlePointerClick, { capture: true });
  };
}
