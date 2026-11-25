/**
 * Real-Time Speaking Confidence & Acoustic Clarity Analyzer
 *
 * Evaluates live microphone PCM frames (or Web Audio AnalyserNode frequency/time-domain
 * telemetry) to produce an honest, responsive Speaking Confidence score (0-100):
 * - Measures signal energy vs ambient noise floor (audible, confident projection)
 * - Evaluates speech-band concentration (300Hz-3400Hz formants vs rumble/hiss)
 * - Tracks envelope stability and zero-crossing steadiness (clear articulation)
 * - Detects clipping so shouting/distortion is gently flagged instead of rewarded
 */

export type SpeakingConfidenceBand = "idle" | "quiet" | "steady" | "clear" | "strong";

export interface SpeakingConfidenceSnapshot {
  score: number;
  peakScore: number;
  averageScore: number;
  sampleCount: number;
  activeSeconds: number;
  band: SpeakingConfidenceBand;
  isSpeaking: boolean;
  clipping: boolean;
  rmsDb: number;
  clarityHintEn: string;
  clarityHintAr: string;
}

export interface SpeakingFrameAnalysis {
  rms: number;
  peak: number;
  rmsDb: number;
  isSpeaking: boolean;
  clipping: boolean;
  speechBandRatio: number;
  zeroCrossingScore: number;
  frameConfidence: number;
}

export function clampConfidenceScore(val: number): number {
  if (!Number.isFinite(val)) return 0;
  return Math.round(Math.max(0, Math.min(100, val)));
}

export function getSpeakingConfidenceBand(
  score: number,
  isListening: boolean,
  isSpeaking: boolean,
): SpeakingConfidenceBand {
  if (!isListening && score <= 0) return "idle";
  if (!isSpeaking && score < 30) return isListening ? "quiet" : "idle";
  if (score >= 80) return "strong";
  if (score >= 60) return "clear";
  if (score >= 38) return "steady";
  return "quiet";
}

/**
 * Computes acoustic clarity metrics from a single time-domain PCM audio buffer.
 */
export function analyzePcmFrame(
  samples: Float32Array,
  sampleRate = 16000,
  noiseFloorRms = 0.006,
): SpeakingFrameAnalysis {
  if (!samples || samples.length === 0) {
    return {
      rms: 0,
      peak: 0,
      rmsDb: -96,
      isSpeaking: false,
      clipping: false,
      speechBandRatio: 0,
      zeroCrossingScore: 0,
      frameConfidence: 0,
    };
  }

  let sumSq = 0;
  let peak = 0;
  let zeroCrossings = 0;
  let diffSumSq = 0;
  let prev = samples[0] ?? 0;

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i] ?? 0;
    sumSq += s * s;
    const abs = Math.abs(s);
    if (abs > peak) peak = abs;
    if (i > 0) {
      if ((prev >= 0 && s < 0) || (prev < 0 && s >= 0)) {
        zeroCrossings++;
      }
      const d = s - prev;
      diffSumSq += d * d;
    }
    prev = s;
  }

  const rms = Math.sqrt(sumSq / samples.length);
  const rmsDb = rms > 1e-6 ? Math.max(-96, 20 * Math.log10(rms)) : -96;
  const clipping = peak >= 0.96;

  // Threshold slightly above adaptive ambient noise floor
  const speechThreshold = Math.max(0.012, noiseFloorRms * 2.1);
  const isSpeaking = rms >= speechThreshold;

  if (!isSpeaking) {
    return {
      rms,
      peak,
      rmsDb,
      isSpeaking: false,
      clipping,
      speechBandRatio: 0,
      zeroCrossingScore: 0,
      frameConfidence: 0,
    };
  }

  // Optimal conversational speech RMS sits around 0.03 - 0.25 after mic normalization
  const snr = Math.min(24, Math.max(1, rms / Math.max(0.004, noiseFloorRms)));
  const energyScore = Math.min(1, (Math.log2(snr) / Math.log2(16)) * 0.95);

  // Zero-crossing rate normalized to seconds: typical voiced/unvoiced speech ~400-3200 ZCR/s
  const durationSec = samples.length / Math.max(8000, sampleRate);
  const zcrPerSec = zeroCrossings / Math.max(0.01, durationSec);
  const zeroCrossingScore =
    zcrPerSec >= 350 && zcrPerSec <= 3800
      ? 1.0
      : zcrPerSec < 350
        ? Math.max(0.35, zcrPerSec / 350)
        : Math.max(0.3, 1 - (zcrPerSec - 3800) / 5000);

  // Spectral proxy: high-frequency hiss yields huge first-difference energy relative to RMS
  const rmsDiff = Math.sqrt(diffSumSq / Math.max(1, samples.length - 1));
  const hfRatio = rms > 1e-5 ? rmsDiff / rms : 0;
  // Clean voiced speech typically exhibits hfRatio between 0.12 and 1.15
  const speechBandRatio =
    hfRatio >= 0.1 && hfRatio <= 1.2
      ? 1.0
      : hfRatio < 0.1
        ? Math.max(0.45, hfRatio / 0.1)
        : Math.max(0.35, 1 - (hfRatio - 1.2) / 1.5);

  const clipPenalty = clipping ? 14 : 0;
  const rawScore = energyScore * 46 + speechBandRatio * 30 + zeroCrossingScore * 24 - clipPenalty;

  return {
    rms,
    peak,
    rmsDb,
    isSpeaking: true,
    clipping,
    speechBandRatio,
    zeroCrossingScore,
    frameConfidence: clampConfidenceScore(rawScore),
  };
}

export interface SpeakingConfidenceTracker {
  pushPcmFrame: (samples: Float32Array, sampleRate?: number) => SpeakingConfidenceSnapshot;
  pushAnalyser: (
    analyser: AnalyserNode,
    timeBuffer: Float32Array,
    sampleRate: number,
  ) => SpeakingConfidenceSnapshot;
  noteTranscriptWords: (wordCount: number) => SpeakingConfidenceSnapshot;
  getSnapshot: (isListening?: boolean) => SpeakingConfidenceSnapshot;
  reset: () => void;
}

export function createSpeakingConfidenceTracker(): SpeakingConfidenceTracker {
  let noiseFloorRms = 0.006;
  let emaScore = 0;
  let peakScore = 0;
  let sumActiveScores = 0;
  let activeFrames = 0;
  let activeSeconds = 0;
  let lastSpeaking = false;
  let lastClipping = false;
  let lastRmsDb = -96;
  let transcriptBoost = 0;

  const buildHint = (band: SpeakingConfidenceBand, clipping: boolean) => {
    if (clipping) {
      return {
        en: "Mic input is peaking — speak slightly further from the microphone.",
        ar: "الصوت مرتفع جداً — ابتعد قليلاً عن الميكروفون لوضوح أفضل.",
      };
    }
    switch (band) {
      case "strong":
        return {
          en: "Clear, well-projected articulation and steady vocal pacing.",
          ar: "نطق واضح وثابت مع إيقاع صوتي متوازن وواثق.",
        };
      case "clear":
        return {
          en: "Good vocal clarity — keep complete sentences flowing naturally.",
          ar: "وضوح صوتي جيد — استمر في التحدث بجمل متصلة.",
        };
      case "steady":
        return {
          en: "Steady speech detected — project slightly more on key syllables.",
          ar: "صوت مستقر — حاول إبراز مخارج الحروف بوضوح أكبر.",
        };
      case "quiet":
        return {
          en: "Voice signal is soft — speak closer or raise your speaking volume.",
          ar: "مستوى الصوت منخفض — اقترب قليلاً وتحدث بصوت أوضح.",
        };
      case "idle":
      default:
        return {
          en: "Start speaking to measure real-time pronunciation clarity.",
          ar: "ابدأ التحدث لقياس وضوح النطق والثقة الصوتية مباشرة.",
        };
    }
  };

  const getSnapshot = (isListening = true): SpeakingConfidenceSnapshot => {
    const score = clampConfidenceScore(emaScore + transcriptBoost);
    const band = getSpeakingConfidenceBand(score, isListening, lastSpeaking);
    const averageScore =
      activeFrames > 0 ? clampConfidenceScore(sumActiveScores / activeFrames) : 0;
    const hint = buildHint(band, lastClipping);

    return {
      score,
      peakScore: clampConfidenceScore(peakScore),
      averageScore,
      sampleCount: activeFrames,
      activeSeconds: Math.round(activeSeconds * 10) / 10,
      band,
      isSpeaking: lastSpeaking,
      clipping: lastClipping,
      rmsDb: Math.round(lastRmsDb),
      clarityHintEn: hint.en,
      clarityHintAr: hint.ar,
    };
  };

  const pushPcmFrame = (samples: Float32Array, sampleRate = 16000): SpeakingConfidenceSnapshot => {
    const analysis = analyzePcmFrame(samples, sampleRate, noiseFloorRms);
    lastRmsDb = analysis.rmsDb;
    lastClipping = analysis.clipping;
    lastSpeaking = analysis.isSpeaking;

    const frameDur = samples.length / Math.max(8000, sampleRate);

    if (!analysis.isSpeaking) {
      // Gently adapt ambient noise floor when silent, slowly decay EMA & transcript bonus
      noiseFloorRms = noiseFloorRms * 0.92 + Math.min(0.025, analysis.rms) * 0.08;
      emaScore = emaScore * 0.94;
      transcriptBoost = Math.max(0, transcriptBoost - 0.5);
    } else {
      activeSeconds += frameDur;
      emaScore =
        emaScore <= 1
          ? analysis.frameConfidence
          : emaScore * 0.65 + analysis.frameConfidence * 0.35;
      const combined = clampConfidenceScore(emaScore + transcriptBoost);
      if (combined > peakScore) peakScore = combined;
      sumActiveScores += combined;
      activeFrames++;
    }

    return getSnapshot(true);
  };

  const pushAnalyser = (
    analyser: AnalyserNode,
    timeBuffer: Float32Array<ArrayBuffer>,
    sampleRate: number,
  ): SpeakingConfidenceSnapshot => {
    analyser.getFloatTimeDomainData(timeBuffer);
    return pushPcmFrame(timeBuffer, sampleRate);
  };

  const noteTranscriptWords = (wordCount: number): SpeakingConfidenceSnapshot => {
    if (wordCount > 0) {
      transcriptBoost = Math.min(10, transcriptBoost + Math.min(6, wordCount * 1.5));
      if (emaScore < 45) {
        emaScore = Math.max(emaScore, 52);
      }
      const combined = clampConfidenceScore(emaScore + transcriptBoost);
      if (combined > peakScore) peakScore = combined;
      sumActiveScores += combined;
      activeFrames++;
    }
    return getSnapshot(true);
  };

  const reset = () => {
    noiseFloorRms = 0.006;
    emaScore = 0;
    peakScore = 0;
    sumActiveScores = 0;
    activeFrames = 0;
    activeSeconds = 0;
    lastSpeaking = false;
    lastClipping = false;
    lastRmsDb = -96;
    transcriptBoost = 0;
  };

  return {
    pushPcmFrame,
    pushAnalyser,
    noteTranscriptWords,
    getSnapshot,
    reset,
  };
}
