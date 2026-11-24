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
    return all
      .filter((v) => v.lang.toLowerCase().startsWith("en"))
      .slice(0, 12)
      .map((v) => ({
        voiceURI: v.voiceURI,
        name: v.name,
        lang: v.lang,
      }));
  } catch {
    return [];
  }
}

export function speakEnglishText(
  text: string,
  options?: { rate?: number; voiceURI?: string; lang?: string; onEnd?: () => void },
): boolean {
  return speakEnhancedText(text, {
    forcedLang: "en",
    preferredLocale: options?.lang ?? "en-GB",
    voiceURI: options?.voiceURI,
    rate: options?.rate,
    onEnd: options?.onEnd,
    onError: options?.onEnd ? () => options.onEnd?.() : undefined,
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
