import { getCachedSpeechVoices, speakEnhancedText, stopEnhancedSpeech } from "./speech-service";

export interface EnglishVoiceOption {
  voiceURI: string;
  name: string;
  lang: string;
}

export function isSpeechSynthesisAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.speechSynthesis !== "undefined" &&
    typeof SpeechSynthesisUtterance !== "undefined"
  );
}

export function getAvailableEnglishVoices(): EnglishVoiceOption[] {
  if (!isSpeechSynthesisAvailable()) return [];
  try {
    const all = getCachedSpeechVoices();
    const seen = new Set<string>();
    const deduped: EnglishVoiceOption[] = [];
    for (const v of all) {
      const langNorm = (v.lang || "").toLowerCase();
      if (!langNorm.startsWith("en")) continue;
      // Normalize so duplicate OS entries with identical name+region don't repeat
      const region =
        langNorm.includes("gb") || langNorm.includes("uk")
          ? "en-GB"
          : langNorm.includes("us")
            ? "en-US"
            : v.lang;
      const dedupeKey = `${v.name.trim().toLowerCase()}|${region}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      deduped.push({
        voiceURI: v.voiceURI,
        name: v.name,
        lang: region,
      });
    }
    return deduped
      .filter((v) => v.lang === "en-US" || v.lang === "en-GB")
      .concat(deduped.filter((v) => v.lang !== "en-US" && v.lang !== "en-GB"))
      .slice(0, 12);
  } catch {
    return [];
  }
}

export function speakEnglishText(
  text: string,
  options?: {
    rate?: number;
    voiceURI?: string;
    lang?: string;
    preferNativeOnly?: boolean;
    onEnd?: () => void;
    onError?: (error: Error) => void;
  },
): boolean {
  return speakEnhancedText(text, {
    forcedLang: "en",
    preferredLocale: options?.lang ?? "en-GB",
    voiceURI: options?.voiceURI,
    rate: options?.rate,
    preferNativeOnly: options?.preferNativeOnly,
    onEnd: options?.onEnd,
    onError: (err) => {
      options?.onError?.(err);
      options?.onEnd?.();
    },
  });
}

export function stopEnglishSpeech(): void {
  stopEnhancedSpeech();
}

export function isSpeechRecognitionAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
}

export function isMediaRecorderAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined"
  );
}
