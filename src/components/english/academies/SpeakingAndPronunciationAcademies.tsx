import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Info, Mic, MicOff, Play, Square, Volume2, XCircle } from "lucide-react";
import { SpeakingConfidenceGauge } from "@/components/ai/SpeakingConfidenceGauge";
import { Button } from "@/components/ui/button";
import { ModernSelect, type ModernSelectOption } from "@/components/ui/modern-select";
import { Textarea } from "@/components/ui/textarea";
import { PRONUNCIATION_MODULES, SPEAKING_SCENARIOS } from "@/data/english-academies";
import type { EnglishWorldState } from "@/lib/english-world";
import {
  isMediaRecorderAvailable,
  isSpeechRecognitionAvailable,
  isSpeechSynthesisAvailable,
  speakEnglishText,
} from "@/lib/english-speech";
import { getSupportedAudioMimeType, safeStopMediaRecorder } from "@/lib/safe-file";
import {
  createSpeakingConfidenceTracker,
  type SpeakingConfidenceSnapshot,
} from "@/lib/speaking-confidence";

interface SpeechRecLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
}

export function SpeakingAcademyPanel({
  englishState,
  onCompleteSpeakingScenario,
}: {
  englishState: EnglishWorldState;
  onCompleteSpeakingScenario: (scenarioId: string, title: string) => void;
}) {
  const [selectedId, setSelectedId] = useState(SPEAKING_SCENARIOS[0]!.id);
  const [responseText, setResponseText] = useState("");
  const [showModel, setShowModel] = useState(false);
  const [checkedCriteria, setCheckedCriteria] = useState<Record<number, boolean>>({});

  // Honest SpeechRecognition & MediaRecorder states
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [feedbackShown, setFeedbackShown] = useState(false);

  const confidenceTrackerRef = useRef(createSpeakingConfidenceTracker());
  const [confidenceSnapshot, setConfidenceSnapshot] = useState<SpeakingConfidenceSnapshot>(() =>
    confidenceTrackerRef.current.getSnapshot(false),
  );
  const meterCtxRef = useRef<AudioContext | null>(null);
  const meterTimerRef = useRef<number | null>(null);

  const recRef = useRef<SpeechRecLike | null>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const srSupported = isSpeechRecognitionAvailable();
  const mrSupported = isMediaRecorderAvailable();

  const stopConfidenceMeter = useCallback(() => {
    if (meterTimerRef.current !== null) {
      window.clearInterval(meterTimerRef.current);
      meterTimerRef.current = null;
    }
    if (meterCtxRef.current && meterCtxRef.current.state !== "closed") {
      void meterCtxRef.current.close();
      meterCtxRef.current = null;
    }
    setConfidenceSnapshot(confidenceTrackerRef.current.getSnapshot(false));
  }, []);

  const startConfidenceMeter = useCallback(
    (stream: MediaStream) => {
      stopConfidenceMeter();
      confidenceTrackerRef.current.reset();
      setConfidenceSnapshot(confidenceTrackerRef.current.getSnapshot(true));

      if (typeof window === "undefined") return;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      try {
        const ctx = new AudioCtx();
        meterCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        const timeBuf = new Float32Array(analyser.fftSize);

        meterTimerRef.current = window.setInterval(() => {
          const snap = confidenceTrackerRef.current.pushAnalyser(
            analyser,
            timeBuf,
            ctx.sampleRate || 44100,
          );
          setConfidenceSnapshot(snap);
        }, 120);
      } catch {
        /* ignore WebAudio analyser restrictions */
      }
    },
    [stopConfidenceMeter],
  );

  useEffect(() => {
    audioUrlRef.current = recordedAudioUrl;
  }, [recordedAudioUrl]);

  useEffect(() => {
    return () => {
      try {
        recRef.current?.stop();
      } catch {
        /* ignore */
      }
      stopConfidenceMeter();
      safeStopMediaRecorder(mediaRecRef.current, mediaStreamRef.current);
      if (audioUrlRef.current) {
        try {
          URL.revokeObjectURL(audioUrlRef.current);
        } catch {
          /* ignore */
        }
      }
    };
  }, [stopConfidenceMeter]);

  const scenario = useMemo(
    () => SPEAKING_SCENARIOS.find((s) => s.id === selectedId) ?? SPEAKING_SCENARIOS[0]!,
    [selectedId],
  );

  const scenarioSelectOptions: ModernSelectOption[] = useMemo(
    () =>
      SPEAKING_SCENARIOS.map((sc) => {
        const practiced = englishState.speakingPracticed.includes(sc.id);
        return {
          value: sc.id,
          label: sc.title,
          description: `${sc.modeLabel} · ${practiced ? "Practiced" : "Not yet completed"}`,
          badge: sc.level,
          group: `Level ${sc.level}`,
          keywords: `${sc.title} ${sc.level} ${sc.modeLabel} ${sc.prompt}`,
        };
      }),
    [englishState.speakingPracticed],
  );

  const selectScenario = (id: string) => {
    setSelectedId(id);
    setResponseText("");
    setShowModel(false);
    setCheckedCriteria({});
    setFeedbackShown(false);
    setSpeechError(null);
  };

  const handleToggleSpeechRecognition = () => {
    if (!srSupported) return;
    if (isListeningMic) {
      recRef.current?.stop();
      setIsListeningMic(false);
      return;
    }
    setSpeechError(null);
    const Ctor =
      (
        window as unknown as {
          SpeechRecognition?: new () => SpeechRecLike;
          webkitSpeechRecognition?: new () => SpeechRecLike;
        }
      ).SpeechRecognition ??
      (
        window as unknown as {
          webkitSpeechRecognition?: new () => SpeechRecLike;
        }
      ).webkitSpeechRecognition;
    if (!Ctor) return;
    try {
      const rec = new Ctor();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (ev) => {
        const transcript = ev.results?.[0]?.[0]?.transcript ?? "";
        if (transcript) {
          const words = transcript.trim().split(/\s+/).filter(Boolean).length;
          setConfidenceSnapshot(confidenceTrackerRef.current.noteTranscriptWords(words));
          setResponseText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      rec.onerror = (ev) => {
        setSpeechError(
          `Speech recognition unavailable (${ev.error ?? "permission/hardware"}). Type your response below anytime.`,
        );
        setIsListeningMic(false);
      };
      rec.onend = () => setIsListeningMic(false);
      recRef.current = rec;
      rec.start();
      setIsListeningMic(true);
    } catch {
      setSpeechError("Unable to start browser speech recognition. Use text practice below.");
      setIsListeningMic(false);
    }
  };

  const handleToggleAudioRecording = async () => {
    if (!mrSupported) return;
    if (isRecordingAudio && mediaRecRef.current) {
      stopConfidenceMeter();
      safeStopMediaRecorder(mediaRecRef.current, mediaStreamRef.current);
      setIsRecordingAudio(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      startConfidenceMeter(stream);
      const chunks: BlobPart[] = [];
      const mimeType = getSupportedAudioMimeType();
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      mr.onstop = () => {
        stopConfidenceMeter();
        safeStopMediaRecorder(null, stream);
        mediaStreamRef.current = null;
        setIsRecordingAudio(false);
        const blob = new Blob(chunks, { type: mr.mimeType || mimeType || "audio/webm" });
        if (blob.size <= 0) return;
        setRecordedAudioUrl((prev) => {
          if (prev) {
            try {
              URL.revokeObjectURL(prev);
            } catch {
              /* ignore */
            }
          }
          return URL.createObjectURL(blob);
        });
      };
      mediaRecRef.current = mr;
      mr.start();
      setIsRecordingAudio(true);
    } catch {
      stopConfidenceMeter();
      safeStopMediaRecorder(mediaRecRef.current, mediaStreamRef.current);
      mediaStreamRef.current = null;
      setIsRecordingAudio(false);
      setSpeechError(
        "Microphone permission was declined or unavailable. Text practice and audio model remain available.",
      );
    }
  };

  const matchedKeywords = scenario.targetKeywords.filter((kw) =>
    responseText.toLowerCase().includes(kw.toLowerCase()),
  );
  const wordCount = responseText.trim() ? responseText.trim().split(/\s+/).length : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      {/* Scenario Menu */}
      <div className="surface-card space-y-3 p-4 lg:col-span-4">
        <ModernSelect
          label={`Speaking Scenario (${SPEAKING_SCENARIOS.length})`}
          value={scenario.id}
          onValueChange={selectScenario}
          options={scenarioSelectOptions}
          searchable
          searchPlaceholder="Search speaking scenarios..."
          leadingIcon={<Mic className="size-4" />}
          data-testid="speaking-scenario-select"
        />

        <div className="space-y-1.5 pt-1">
          {SPEAKING_SCENARIOS.map((sc) => {
            const active = sc.id === scenario.id;
            const practiced = englishState.speakingPracticed.includes(sc.id);
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => selectScenario(sc.id)}
                className={`flex min-h-[44px] w-full items-start justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-start transition-colors cursor-pointer ${
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface-2 hover:border-primary/40"
                }`}
              >
                <div>
                  <div className="text-[11px] font-medium text-muted-foreground">
                    {sc.level} · {sc.modeLabel}
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-foreground">{sc.title}</div>
                </div>
                {practiced && <CheckCircle2 className="mt-1 size-4 shrink-0 text-success" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Speaking Console */}
      <div className="surface-card space-y-4 p-5 lg:col-span-8">
        <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-primary">
              {scenario.level} · {scenario.modeLabel}
            </div>
            <h4 className="mt-1 font-display text-lg font-bold text-foreground">
              {scenario.title}
            </h4>
            <p className="mt-1 text-sm text-foreground">{scenario.prompt}</p>
          </div>

          <SpeakingConfidenceGauge
            snapshot={confidenceSnapshot}
            isActive={isRecordingAudio || isListeningMic}
            size="sm"
            className="sm:w-64 shrink-0"
          />
        </div>

        {/* Partner Cue */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-primary">
              Conversation Partner Cue
            </span>
            {isSpeechSynthesisAvailable() && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => speakEnglishText(scenario.partnerCue)}
                className="h-8 gap-1 text-xs"
              >
                <Volume2 className="size-3.5" />
                <span>Hear Cue</span>
              </Button>
            )}
          </div>
          <p className="text-sm font-medium text-foreground">"{scenario.partnerCue}"</p>
        </div>

        {/* Useful Phrases */}
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-muted-foreground">
            Starter Phrases to Structure Your Reply:
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {scenario.usefulPhrases.map((p, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-foreground"
              >
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Browser Capability Notice + Capture Controls */}
        <div className="rounded-xl border border-border bg-surface-2 p-3.5 space-y-3">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              Honest audio note: Browser Speech-to-Text{" "}
              {srSupported ? "is available" : "is not supported in this browser"}, and local mic
              playback {mrSupported ? "is available" : "is unavailable"}. Spoken transcript & rubric
              check evaluate wording & task structure without pretending acoustic grading.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={isListeningMic ? "destructive" : "outline"}
              disabled={!srSupported}
              onClick={handleToggleSpeechRecognition}
              className="h-9 gap-1.5 text-xs"
            >
              {isListeningMic ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
              <span>
                {isListeningMic
                  ? "Stop Speech-to-Text"
                  : srSupported
                    ? "Speak to Transcribe"
                    : "Speech Recognition Unavailable"}
              </span>
            </Button>

            <Button
              type="button"
              size="sm"
              variant={isRecordingAudio ? "destructive" : "outline"}
              disabled={!mrSupported}
              onClick={() => void handleToggleAudioRecording()}
              className="h-9 gap-1.5 text-xs"
            >
              {isRecordingAudio ? <Square className="size-3.5" /> : <Mic className="size-3.5" />}
              <span>
                {isRecordingAudio
                  ? "Stop Self-Recording"
                  : mrSupported
                    ? "Record & Replay Voice"
                    : "Audio Recorder Unavailable"}
              </span>
            </Button>
          </div>

          {speechError && <p className="text-xs text-destructive">{speechError}</p>}

          {recordedAudioUrl && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-medium text-foreground">Your recorded audio:</span>
              <audio controls src={recordedAudioUrl} className="h-8 max-w-full" />
            </div>
          )}

          <Textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            rows={4}
            placeholder="Speak using microphone transcription OR practice typing your full spoken reply here..."
            aria-label="Speaking response text"
            className="text-sm"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Words drafted: {wordCount}</span>
            <span>
              Helpful discourse words used: {matchedKeywords.length}/
              {scenario.targetKeywords.length}
            </span>
          </div>
        </div>

        {/* Self-Check Rubric & Save */}
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-muted-foreground">
            Self-Check Speaking Rubric:
          </div>
          {scenario.selfCheckCriteria.map((c, idx) => (
            <label
              key={idx}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-foreground"
            >
              <input
                type="checkbox"
                checked={Boolean(checkedCriteria[idx])}
                onChange={(e) =>
                  setCheckedCriteria((prev) => ({ ...prev, [idx]: e.target.checked }))
                }
                className="size-4 accent-primary"
              />
              <span>{c}</span>
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="glow"
            onClick={() => {
              setFeedbackShown(true);
              onCompleteSpeakingScenario(scenario.id, scenario.title);
            }}
            disabled={wordCount < 6 && !recordedAudioUrl}
            className="min-h-[44px]"
          >
            <span>Evaluate Response & Complete Practice</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowModel((prev) => !prev)}
            className="min-h-[44px]"
          >
            {showModel ? "Hide Sample Answer" : "Compare With Model Answer"}
          </Button>
        </div>

        {feedbackShown && (
          <div className="rounded-lg border border-success/40 bg-success/10 p-3.5 text-xs space-y-1">
            <div className="font-semibold text-foreground">
              Speaking Practice Recorded ({wordCount} words · Keywords matched:{" "}
              {matchedKeywords.join(", ") || "add 'because' / 'for example' next time"})
            </div>
            <p className="text-muted-foreground">
              {wordCount >= 18
                ? "Good conversational expansion—your response goes beyond a yes/no reply with clear supporting ideas."
                : "Try expanding with one extra reason ('because...') or example ('for instance...') for higher fluency."}
            </p>
          </div>
        )}

        {showModel && (
          <div className="rounded-lg border border-border bg-surface-2 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <strong className="text-foreground">Model Natural Response:</strong>
              {isSpeechSynthesisAvailable() && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => speakEnglishText(scenario.modelResponse)}
                  className="h-7 gap-1 text-[11px]"
                >
                  <Play className="size-3" />
                  <span>Listen Model</span>
                </Button>
              )}
            </div>
            <p className="text-sm text-foreground">{scenario.modelResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PRONUNCIATION ACADEMY                                                      */
/* -------------------------------------------------------------------------- */

export function PronunciationAcademyPanel({
  englishState,
  onCompletePronunciationModule,
}: {
  englishState: EnglishWorldState;
  onCompletePronunciationModule: (moduleId: string, title: string) => void;
}) {
  const [selectedId, setSelectedId] = useState(PRONUNCIATION_MODULES[0]!.id);
  const [discChoice, setDiscChoice] = useState<string | null>(null);
  const [recognizedPhrase, setRecognizedPhrase] = useState<string | null>(null);
  const [micActive, setMicActive] = useState(false);

  const speechReady = isSpeechSynthesisAvailable();
  const srSupported = isSpeechRecognitionAvailable();

  const mod = useMemo(
    () => PRONUNCIATION_MODULES.find((m) => m.id === selectedId) ?? PRONUNCIATION_MODULES[0]!,
    [selectedId],
  );

  const drillSelectOptions: ModernSelectOption[] = useMemo(
    () =>
      PRONUNCIATION_MODULES.map((m) => {
        const done = englishState.pronunciationPracticed.includes(m.id);
        return {
          value: m.id,
          label: m.title,
          description: `${m.focusArea.replace("_", " ")} · ${done ? "Practiced" : "New drill"}`,
          badge: m.cefr,
          group: `Level ${m.cefr}`,
          keywords: `${m.title} ${m.cefr} ${m.focusArea} ${m.explanation}`,
        };
      }),
    [englishState.pronunciationPracticed],
  );

  const selectMod = (id: string) => {
    setSelectedId(id);
    setDiscChoice(null);
    setRecognizedPhrase(null);
  };

  const handleRepeatTranscriptTest = () => {
    if (!srSupported) return;
    const Ctor =
      (
        window as unknown as {
          SpeechRecognition?: new () => SpeechRecLike;
          webkitSpeechRecognition?: new () => SpeechRecLike;
        }
      ).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecLike })
        .webkitSpeechRecognition;
    if (!Ctor) return;
    try {
      const rec = new Ctor();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (ev) => {
        setRecognizedPhrase(ev.results?.[0]?.[0]?.transcript ?? "");
      };
      rec.onend = () => setMicActive(false);
      rec.onerror = () => setMicActive(false);
      rec.start();
      setMicActive(true);
    } catch {
      setMicActive(false);
    }
  };

  const isDiscCorrect = discChoice === mod.listeningDiscrimination.targetWord;

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <div className="surface-card space-y-3 p-4 lg:col-span-4">
        <ModernSelect
          label={`Pronunciation Drill (${PRONUNCIATION_MODULES.length})`}
          value={mod.id}
          onValueChange={selectMod}
          options={drillSelectOptions}
          searchable
          searchPlaceholder="Search pronunciation drills..."
          leadingIcon={<Volume2 className="size-4" />}
          data-testid="pronunciation-drill-select"
        />
        <div className="space-y-1.5 pt-1">
          {PRONUNCIATION_MODULES.map((m) => {
            const active = m.id === mod.id;
            const done = englishState.pronunciationPracticed.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => selectMod(m.id)}
                className={`flex min-h-[44px] w-full items-start justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-start transition-colors cursor-pointer ${
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface-2 hover:border-primary/40"
                }`}
              >
                <div>
                  <div className="text-[11px] font-medium text-muted-foreground">
                    {m.cefr} · {m.focusArea.replace("_", " ")}
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-foreground">{m.title}</div>
                </div>
                {done && <CheckCircle2 className="mt-1 size-4 shrink-0 text-success" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="surface-card space-y-5 p-5 lg:col-span-8">
        <div className="border-b border-border pb-3">
          <div className="text-xs font-medium text-primary">
            {mod.cefr} · {mod.focusArea.replace("_", " ")}
          </div>
          <h4 className="mt-1 font-display text-lg font-bold text-foreground">{mod.title}</h4>
          <p className="mt-1 text-sm text-foreground">{mod.explanation}</p>
          <p
            className="mt-2 rounded-lg border border-primary/25 bg-primary/5 p-2.5 text-xs text-foreground"
            dir="rtl"
          >
            <strong>ملاحظة نطقية:</strong> {mod.arabicCoaching}
          </p>
        </div>

        {/* Contrast Pairs */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Listen & Contrast Pairs (Web Speech Model)
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {mod.pairs.map((p, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-surface-2 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={!speechReady}
                    onClick={() =>
                      speakEnglishText(p.aWord.replace(/\(.*?\)/g, ""), { rate: 0.85 })
                    }
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-foreground hover:border-primary disabled:opacity-60"
                  >
                    <Volume2 className="size-3.5 text-primary" />
                    <span>{p.aWord}</span>
                    <span className="text-[11px] font-normal text-muted-foreground">{p.aIpa}</span>
                  </button>
                  <button
                    type="button"
                    disabled={!speechReady}
                    onClick={() =>
                      speakEnglishText(p.bWord.replace(/\(.*?\)/g, ""), { rate: 0.85 })
                    }
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-foreground hover:border-primary disabled:opacity-60"
                  >
                    <Volume2 className="size-3.5 text-primary" />
                    <span>{p.bWord}</span>
                    <span className="text-[11px] font-normal text-muted-foreground">{p.bIpa}</span>
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">{p.contrastNote}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Listen & Repeat Drill */}
        <div className="rounded-xl border border-border bg-surface-2 p-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Listen & Repeat Shadowing Phrase
          </div>
          <p className="text-sm font-semibold text-foreground">"{mod.repeatPhrase}"</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!speechReady}
              onClick={() => speakEnglishText(mod.repeatPhrase, { rate: 0.85 })}
              className="h-9 gap-1.5 text-xs"
            >
              <Volume2 className="size-3.5" />
              <span>{speechReady ? "Listen Model (0.85x)" : "Audio Synthesis Unavailable"}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant={micActive ? "destructive" : "outline"}
              disabled={!srSupported}
              onClick={handleRepeatTranscriptTest}
              className="h-9 gap-1.5 text-xs"
            >
              <Mic className="size-3.5" />
              <span>
                {micActive
                  ? "Listening..."
                  : srSupported
                    ? "Speech-to-Text Check"
                    : "Speech Recognition Unavailable"}
              </span>
            </Button>
          </div>
          {recognizedPhrase !== null && (
            <p className="text-xs text-foreground">
              Speech-to-Text heard: <strong>"{recognizedPhrase}"</strong> (Transcript check
              only—listen to the model and self-assess sound clarity.)
            </p>
          )}
        </div>

        {/* Minimal Pair Context Discrimination */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h5 className="text-sm font-bold text-foreground">
              Context Sound Discrimination Check
            </h5>
            {speechReady && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => speakEnglishText(mod.listeningDiscrimination.contextSentence)}
                className="h-8 gap-1 text-xs"
              >
                <Volume2 className="size-3.5" />
                <span>Hear Context Sentence</span>
              </Button>
            )}
          </div>
          <p className="text-sm text-foreground">{mod.listeningDiscrimination.prompt}</p>
          <div className="flex flex-wrap gap-2">
            {[
              mod.listeningDiscrimination.targetWord,
              mod.listeningDiscrimination.distractorWord,
            ].map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => {
                  setDiscChoice(choice);
                  if (choice === mod.listeningDiscrimination.targetWord) {
                    onCompletePronunciationModule(mod.id, mod.title);
                  }
                }}
                className={`min-h-[44px] min-w-[120px] rounded-lg border px-4 py-2 text-xs font-semibold transition-colors ${
                  discChoice === choice
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface-2 text-foreground hover:border-primary/40"
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
          {discChoice && (
            <div
              className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs ${
                isDiscCorrect
                  ? "border-success/40 bg-success/10 text-foreground"
                  : "border-destructive/40 bg-destructive/10 text-foreground"
              }`}
            >
              {isDiscCorrect ? (
                <>
                  <CheckCircle2 className="size-4 text-success" />
                  <span>
                    Accurate! Complete sentence: "{mod.listeningDiscrimination.contextSentence}"
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="size-4 text-destructive" />
                  <span>
                    Compare the two meanings closely and listen again—the context sentence needs '
                    {mod.listeningDiscrimination.targetWord}'.
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
