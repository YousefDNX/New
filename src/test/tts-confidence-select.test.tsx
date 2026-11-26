// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { PreferencesProvider } from "@/lib/preferences";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/common/ToastProvider";
import {
  TTS_ENGINE_MODES,
  TTS_SPEED_MAX,
  TTS_SPEED_MIN,
  TTS_VOICE_CATALOG,
  clampTtsSpeed,
  normalizeTtsEngine,
  normalizeTtsVoice,
  resolveGeminiVoiceName,
} from "@/lib/settings";
import { TtsEngineSettingsPanel } from "@/components/settings/TtsEngineSettingsPanel";
import {
  analyzePcmFrame,
  createSpeakingConfidenceTracker,
  type SpeakingConfidenceSnapshot,
} from "@/lib/speaking-confidence";
import { SpeakingConfidenceGauge } from "@/components/ai/SpeakingConfidenceGauge";
import { ModernSelect } from "@/components/ui/modern-select";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import {
  GrammarAcademyPanel,
  VocabularyAcademyPanel,
  WritingAcademyPanel,
} from "@/components/english/academies/WritingVocabGrammarAcademies";
import { createInitialEnglishWorldState } from "@/lib/english-world";
import { getStudentEcosystemServerSnapshot, useStudentEcosystem } from "@/lib/student-ecosystem";
import { useLocalAiConversations, useLocalAiLibrary } from "@/lib/ai-workspace-store";
import {
  TTS_PREFS_STORAGE_KEY,
  clearPersistedTtsConfig,
  getActiveTtsConfig,
  loadPersistedTtsConfig,
} from "@/lib/speech-service";

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ThemeProvider>
      <PreferencesProvider>
        <ToastProvider>{ui}</ToastProvider>
      </PreferencesProvider>
    </ThemeProvider>,
  );
}

function makeSinePcm(
  freqHz: number,
  amplitude: number,
  sampleRate = 16000,
  length = 1600,
): Float32Array {
  const buf = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    buf[i] = amplitude * Math.sin((2 * Math.PI * freqHz * i) / sampleRate);
  }
  return buf;
}

describe("TTS Configuration, Speaking Confidence Meter & Unified ModernSelect", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("normalizes and resolves TTS voices (Ahmed, Zephyr, Classic) and clamps playback speed", () => {
    expect(TTS_VOICE_CATALOG.map((v) => v.id)).toEqual(
      expect.arrayContaining(["Ahmed", "Zephyr", "Classic", "Kore", "Puck", "Charon", "Fenrir"]),
    );
    expect(TTS_ENGINE_MODES.map((m) => m.id)).toEqual(["auto", "gemini", "browser"]);

    expect(normalizeTtsVoice("ahmed")).toBe("Ahmed");
    expect(normalizeTtsVoice("CLASSIC")).toBe("Classic");
    expect(normalizeTtsVoice("unknown-voice")).toBe("Zephyr");

    expect(resolveGeminiVoiceName("Ahmed")).toBe("Charon");
    expect(resolveGeminiVoiceName("Classic")).toBe("Kore");
    expect(resolveGeminiVoiceName("Zephyr")).toBe("Zephyr");

    expect(normalizeTtsEngine("gemini")).toBe("gemini");
    expect(normalizeTtsEngine("invalid")).toBe("auto");

    expect(clampTtsSpeed(0.2)).toBe(TTS_SPEED_MIN);
    expect(clampTtsSpeed(2.4)).toBe(TTS_SPEED_MAX);
    expect(clampTtsSpeed(1.15)).toBe(1.15);
  });

  it("renders TtsEngineSettingsPanel and updates voice profile, engine, and speed presets", () => {
    const onSpeedCommit = vi.fn();
    renderWithProviders(<TtsEngineSettingsPanel onSpeedCommit={onSpeedCommit} />);

    expect(screen.getByTestId("tts-engine-settings-panel")).toBeInTheDocument();

    // Switch voice to Ahmed via ModernSelect
    fireEvent.click(screen.getByTestId("tts-voice-select"));
    const searchInput = screen.getByPlaceholderText(/Search voice/i);
    fireEvent.change(searchInput, { target: { value: "Ahmed" } });
    fireEvent.click(screen.getByRole("option", { name: /Ahmed/i }));
    expect(screen.getByTestId("tts-voice-select")).toHaveTextContent(/Ahmed/i);

    // Switch engine to Neural Studio Engine
    fireEvent.click(screen.getByTestId("tts-engine-select"));
    fireEvent.click(screen.getByRole("option", { name: /Neural Studio Engine/i }));
    expect(screen.getByTestId("tts-engine-select")).toHaveTextContent(/Neural Studio Engine/i);

    // Select 1.15x speed preset button
    fireEvent.click(screen.getByRole("button", { name: "1.15×" }));
    expect(screen.getByTestId("tts-speed-readout")).toHaveTextContent("1.15×");
    expect(onSpeedCommit).toHaveBeenCalledWith(1.15);

    // Verify localStorage persistence immediately & across fresh PreferencesProvider remount (page reload)
    const persisted = loadPersistedTtsConfig();
    expect(persisted).toMatchObject({
      engine: "gemini",
      voicePreset: "Ahmed",
      rate: 1.15,
    });
    expect(window.localStorage.getItem(TTS_PREFS_STORAGE_KEY)).toContain("Ahmed");
    expect(getActiveTtsConfig()).toEqual({
      engine: "gemini",
      voicePreset: "Ahmed",
      rate: 1.15,
    });

    cleanup();

    // Simulate reload where nexora.prefs might be absent or stale while dedicated TTS storage remains
    window.localStorage.removeItem("nexora.prefs");
    renderWithProviders(<TtsEngineSettingsPanel />);
    expect(screen.getByTestId("tts-voice-select")).toHaveTextContent(/Ahmed/i);
    expect(screen.getByTestId("tts-engine-select")).toHaveTextContent(/Neural Studio Engine/i);
    expect(screen.getByTestId("tts-speed-readout")).toHaveTextContent("1.15×");

    clearPersistedTtsConfig();
  });

  it("evaluates real-time speech frames accurately and avoids rewarding clipping or silence", () => {
    const silent = new Float32Array(1600);
    const silentAnalysis = analyzePcmFrame(silent, 16000);
    expect(silentAnalysis.isSpeaking).toBe(false);
    expect(silentAnalysis.frameConfidence).toBe(0);

    // Clear mid-band voiced signal (~480 Hz at healthy 0.18 amplitude)
    const clearSpeech = makeSinePcm(480, 0.18, 16000, 1600);
    const clearAnalysis = analyzePcmFrame(clearSpeech, 16000);
    expect(clearAnalysis.isSpeaking).toBe(true);
    expect(clearAnalysis.clipping).toBe(false);
    expect(clearAnalysis.frameConfidence).toBeGreaterThanOrEqual(70);

    // Clipped signal (>= 0.96 peak) gets penalized vs clean speech
    const clippedSpeech = makeSinePcm(480, 0.99, 16000, 1600);
    const clippedAnalysis = analyzePcmFrame(clippedSpeech, 16000);
    expect(clippedAnalysis.clipping).toBe(true);
    expect(clippedAnalysis.frameConfidence).toBeLessThan(95);

    const tracker = createSpeakingConfidenceTracker();
    const initial = tracker.getSnapshot(false);
    expect(initial.score).toBe(0);
    expect(initial.band).toBe("idle");

    tracker.pushPcmFrame(clearSpeech, 16000);
    const active = tracker.pushPcmFrame(clearSpeech, 16000);
    expect(active.score).toBeGreaterThanOrEqual(65);
    expect(active.sampleCount).toBe(2);
    expect(active.peakScore).toBeGreaterThanOrEqual(active.score);

    const boosted = tracker.noteTranscriptWords(5);
    expect(boosted.score).toBeGreaterThanOrEqual(active.score);
  });

  it("renders SpeakingConfidenceGauge with circular progressbar and clarity telemetry", () => {
    const snapshot: SpeakingConfidenceSnapshot = {
      score: 84,
      peakScore: 91,
      averageScore: 78,
      sampleCount: 10,
      activeSeconds: 4.5,
      band: "strong",
      isSpeaking: true,
      clipping: false,
      rmsDb: -16,
      clarityHintEn: "Clear, well-projected articulation and steady vocal pacing.",
      clarityHintAr: "نطق واضح وثابت مع إيقاع صوتي متوازن وواثق.",
    };

    renderWithProviders(<SpeakingConfidenceGauge snapshot={snapshot} isActive size="md" />);

    expect(screen.getByTestId("speaking-confidence-gauge")).toBeInTheDocument();
    expect(screen.getByTestId("speaking-confidence-value")).toHaveTextContent("84%");
    const progress = screen.getByRole("progressbar", { name: /Speaking confidence 84%/i });
    expect(progress).toHaveAttribute("aria-valuenow", "84");
    expect(screen.getByText("Strong")).toBeInTheDocument();
    expect(screen.getByText(/Avg: 78%/)).toBeInTheDocument();
    expect(screen.getByText(/Peak: 91%/)).toBeInTheDocument();
  });

  it("supports spacious hit targets, search filtering, and keyboard selection in ModernSelect", () => {
    const handleChange = vi.fn();
    renderWithProviders(
      <ModernSelect
        label="Study Model"
        value="balanced"
        onValueChange={handleChange}
        data-testid="unit-modern-select"
        options={[
          { value: "fast", label: "Fast Flash", description: "Quick definitions" },
          { value: "balanced", label: "Balanced Tutor", description: "Everyday study helper" },
          { value: "complex", label: "STEM & Logic", description: "Step-by-step reasoning" },
          { value: "deep", label: "Deep Research", description: "Long-form synthesis" },
        ]}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: /Study Model/i });
    expect(trigger.className).toContain("min-h-[44px]");

    // Keyboard open & select with ArrowDown + Enter
    fireEvent.keyDown(trigger, { key: "Enter" });
    const filterInput = screen.getByPlaceholderText("Search options...");
    fireEvent.change(filterInput, { target: { value: "Deep" } });

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Deep Research");

    fireEvent.keyDown(filterInput, { key: "Enter" });
    expect(handleChange).toHaveBeenCalledWith("deep");
  });

  it("organizes Writing, Vocabulary, Grammar, and Language selection menus cleanly", () => {
    const baseState = createInitialEnglishWorldState();

    // 1. Writing Academy: Level filter & Searchable prompt selector
    renderWithProviders(
      <WritingAcademyPanel englishState={baseState} onSaveWritingSubmission={vi.fn()} />,
    );
    expect(screen.getByTestId("writing-level-select")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("writing-prompt-select"));
    expect(screen.getByPlaceholderText(/Search prompts/i)).toBeInTheDocument();
    cleanup();

    // 2. Vocabulary Academy: Searchable deck & mode selectors
    renderWithProviders(
      <VocabularyAcademyPanel
        englishState={baseState}
        onPracticeWord={vi.fn()}
        onAddNotebookWord={vi.fn()}
        onPushFlashcardToStudy={vi.fn()}
      />,
    );
    expect(screen.getByTestId("vocab-deck-select")).toBeInTheDocument();
    expect(screen.getByTestId("vocab-mode-select")).toBeInTheDocument();
    cleanup();

    // 3. Grammar Academy: Searchable topic selector
    renderWithProviders(
      <GrammarAcademyPanel
        englishState={baseState}
        onSubmitGrammarScore={vi.fn()}
        onRecordMistake={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId("grammar-topic-select"));
    expect(screen.getByPlaceholderText(/Search grammar rules/i)).toBeInTheDocument();
    cleanup();

    // 4. LanguageSwitcher: Searchable grouped RTL/LTR switcher
    renderWithProviders(<LanguageSwitcher />);
    const langTrigger = screen.getByRole("combobox");
    fireEvent.click(langTrigger);
    expect(screen.getByPlaceholderText(/Search language/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("option", { name: /العربية/i }));
    expect(document.documentElement.dir).toBe("rtl");
  });

  it("caches getServerSnapshot references across useStudentEcosystem and AI stores during SSR", () => {
    expect(getStudentEcosystemServerSnapshot()).toBe(getStudentEcosystemServerSnapshot());

    function SsrStoreProbe() {
      const { state } = useStudentEcosystem();
      const { conversations } = useLocalAiConversations();
      const { notes } = useLocalAiLibrary();
      return (
        <div data-testid="ssr-probe">
          {state.curriculumSelection.subject}:{conversations.length}:{notes.length}
        </div>
      );
    }

    const html = renderToString(<SsrStoreProbe />);
    expect(html).toContain('data-testid="ssr-probe"');
  });
});
