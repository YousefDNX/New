import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, Send, Volume2, Waves } from "lucide-react";
import { SpeakingConfidenceGauge } from "@/components/ai/SpeakingConfidenceGauge";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePrefs } from "@/lib/preferences";
import {
  createSpeakingConfidenceTracker,
  type SpeakingConfidenceSnapshot,
} from "@/lib/speaking-confidence";

interface VoiceTurnEntry {
  id: string;
  role: "user" | "assistant";
  text: string;
}

function downsampleTo16kInt16(input: Float32Array, inputSampleRate: number): Int16Array {
  // Peak detection for gentle auto-gain normalization
  let peak = 0;
  for (let i = 0; i < input.length; i++) {
    const abs = Math.abs(input[i] ?? 0);
    if (abs > peak) peak = abs;
  }
  // Soft gain multiplier: if quiet (<0.6), gently boost up to 1.8x without clipping (target peak ~0.85)
  const normFactor = peak > 0.05 && peak < 0.6 ? Math.min(1.8, 0.85 / peak) : 1.0;

  if (inputSampleRate === 16000) {
    const out = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, (input[i] ?? 0) * normFactor));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
  }
  const ratio = inputSampleRate / 16000;
  const outputLength = Math.max(1, Math.floor(input.length / ratio));
  const out = new Int16Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    const srcIdx = Math.min(input.length - 1, Math.floor(i * ratio));
    const s = Math.max(-1, Math.min(1, (input[srcIdx] ?? 0) * normFactor));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function int16ToBase64(pcm: Int16Array): string {
  const bytes = new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64PcmToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const view = new DataView(bytes.buffer);
  const sampleCount = Math.floor(bytes.length / 2);
  const float32 = new Float32Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    float32[i] = view.getInt16(i * 2, true) / 32768;
  }
  return float32;
}

export function VoiceConversationDrawer({ contextSummary }: { contextSummary?: string }) {
  const { t, lang, ecosystem } = usePrefs();
  const [status, setStatus] = useState<
    "idle" | "connecting" | "listening" | "processing" | "speaking"
  >("idle");
  const [transport, setTransport] = useState<"ws" | "http">("ws");
  const [textInput, setTextInput] = useState("");
  const [turns, setTurns] = useState<VoiceTurnEntry[]>([]);
  const [liveOutputDraft, setLiveOutputDraft] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const confidenceTrackerRef = useRef(createSpeakingConfidenceTracker());
  const lastMeterUpdateRef = useRef<number>(0);
  const [confidenceSnapshot, setConfidenceSnapshot] = useState<SpeakingConfidenceSnapshot>(() =>
    confidenceTrackerRef.current.getSnapshot(false),
  );

  const wsRef = useRef<WebSocket | null>(null);
  const captureCtxRef = useRef<AudioContext | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const liveOutputAccRef = useRef<string>("");

  const activePlaybackSpeed = ecosystem.ttsSpeed || ecosystem.voiceSpeed || 1;
  const activeVoicePreset = ecosystem.ttsVoice || "Zephyr";

  const stopAudioPlayback = useCallback(() => {
    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
      } catch {
        /* ignore already stopped */
      }
    }
    activeSourcesRef.current.clear();
    if (playbackCtxRef.current) {
      nextStartTimeRef.current = playbackCtxRef.current.currentTime;
    } else {
      nextStartTimeRef.current = 0;
    }
  }, []);

  const play24kPcmChunk = useCallback(
    (base64Pcm: string) => {
      if (!base64Pcm || typeof window === "undefined") return;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!playbackCtxRef.current || playbackCtxRef.current.state === "closed") {
        playbackCtxRef.current = new AudioCtx({ sampleRate: 24000 });
        nextStartTimeRef.current = playbackCtxRef.current.currentTime;
      }
      const ctx = playbackCtxRef.current;
      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      const float32 = base64PcmToFloat32(base64Pcm);
      if (float32.length === 0) return;

      const buffer = ctx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.playbackRate.value = activePlaybackSpeed;
      src.connect(ctx.destination);

      const startAt = Math.max(ctx.currentTime + 0.01, nextStartTimeRef.current);
      src.start(startAt);
      nextStartTimeRef.current = startAt + buffer.duration / activePlaybackSpeed;

      activeSourcesRef.current.add(src);
      setStatus("speaking");
      src.onended = () => {
        activeSourcesRef.current.delete(src);
        if (activeSourcesRef.current.size === 0) {
          setStatus((prev) => (prev === "speaking" ? "listening" : prev));
        }
      };
    },
    [activePlaybackSpeed],
  );

  const stopMicCapture = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
    if (captureCtxRef.current && captureCtxRef.current.state !== "closed") {
      void captureCtxRef.current.close();
      captureCtxRef.current = null;
    }
  }, []);

  const endVoiceSession = useCallback(() => {
    stopMicCapture();
    stopAudioPlayback();
    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "close" }));
        }
        wsRef.current.close();
      } catch {
        /* ignore ws close errors */
      }
      wsRef.current = null;
    }
    if (playbackCtxRef.current && playbackCtxRef.current.state !== "closed") {
      void playbackCtxRef.current.close();
      playbackCtxRef.current = null;
    }
    liveOutputAccRef.current = "";
    setLiveOutputDraft("");
    setConfidenceSnapshot(confidenceTrackerRef.current.getSnapshot(false));
    setStatus("idle");
  }, [stopAudioPlayback, stopMicCapture]);

  useEffect(() => {
    return () => {
      endVoiceSession();
    };
  }, [endVoiceSession]);

  const startLiveMicSession = async () => {
    setErrorMsg(null);
    confidenceTrackerRef.current.reset();
    lastMeterUpdateRef.current = 0;
    setConfidenceSnapshot(confidenceTrackerRef.current.getSnapshot(true));
    setStatus("connecting");

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setErrorMsg("Microphone access unavailable in this browser. Use the text turn input below.");
      setTransport("http");
      setConfidenceSnapshot(confidenceTrackerRef.current.getSnapshot(false));
      setStatus("idle");
      return;
    }

    let micStream: MediaStream;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = micStream;
    } catch {
      setErrorMsg("Microphone permission was denied. Allow mic access or type below to talk.");
      setTransport("http");
      setConfidenceSnapshot(confidenceTrackerRef.current.getSnapshot(false));
      setStatus("idle");
      return;
    }

    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${proto}//${window.location.host}/api/ai/live-ws?lang=${encodeURIComponent(
      lang,
    )}&voice=${encodeURIComponent(activeVoicePreset)}&context=${encodeURIComponent(contextSummary ?? "")}`;

    let wsOpened = false;
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const openTimeout = window.setTimeout(() => {
        if (!wsOpened) {
          try {
            ws.close();
          } catch {
            /* ignore */
          }
          setTransport("http");
          setErrorMsg(
            "Real-time WebSocket stream unavailable on this host. Type below to use HTTP Voice Turn mode.",
          );
          stopMicCapture();
          setConfidenceSnapshot(confidenceTrackerRef.current.getSnapshot(false));
          setStatus("idle");
        }
      }, 4500);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(String(event.data)) as {
            type?: string;
            data?: string;
            text?: string;
            message?: string;
          };
          if (msg.type === "ready") {
            wsOpened = true;
            window.clearTimeout(openTimeout);
            setTransport("ws");
            setStatus("listening");
            beginAudioPcmPump(micStream, ws);
          } else if (msg.type === "audio" && msg.data) {
            play24kPcmChunk(msg.data);
          } else if (msg.type === "interrupted") {
            stopAudioPlayback();
            setStatus("listening");
          } else if (msg.type === "input_transcript" && msg.text) {
            const cleaned = msg.text.trim();
            if (cleaned) {
              const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
              const updatedSnap = confidenceTrackerRef.current.noteTranscriptWords(wordCount);
              setConfidenceSnapshot(updatedSnap);
              setTurns((prev) => [
                ...prev.slice(-14),
                { id: `vu_${Date.now().toString(36)}`, role: "user", text: cleaned },
              ]);
            }
          } else if (msg.type === "output_transcript" && msg.text) {
            liveOutputAccRef.current += msg.text;
            setLiveOutputDraft(liveOutputAccRef.current);
          } else if (msg.type === "turn_complete") {
            const finalized = liveOutputAccRef.current.trim();
            if (finalized) {
              setTurns((prev) => [
                ...prev.slice(-14),
                { id: `va_${Date.now().toString(36)}`, role: "assistant", text: finalized },
              ]);
            }
            liveOutputAccRef.current = "";
            setLiveOutputDraft("");
            if (activeSourcesRef.current.size === 0) {
              setStatus("listening");
            }
          } else if (msg.type === "error") {
            setErrorMsg(msg.message ?? "Live Voice stream reported an error.");
            endVoiceSession();
          }
        } catch {
          /* ignore malformed message */
        }
      };

      ws.onerror = () => {
        if (!wsOpened) {
          window.clearTimeout(openTimeout);
          setTransport("http");
          setErrorMsg("Live voice WebSocket unavailable; switched to HTTP text-to-voice fallback.");
          stopMicCapture();
          setConfidenceSnapshot(confidenceTrackerRef.current.getSnapshot(false));
          setStatus("idle");
        }
      };

      ws.onclose = () => {
        window.clearTimeout(openTimeout);
        if (wsOpened) {
          endVoiceSession();
        }
      };
    } catch {
      setTransport("http");
      stopMicCapture();
      setConfidenceSnapshot(confidenceTrackerRef.current.getSnapshot(false));
      setStatus("idle");
    }
  };

  const beginAudioPcmPump = (stream: MediaStream, ws: WebSocket) => {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    captureCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);

    // 1. High-Pass Filter (Cuts sub-85Hz rumble, plosives, and table vibration)
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(85, ctx.currentTime);
    highpass.Q.setValueAtTime(0.707, ctx.currentTime);

    // 2. Low-Pass Filter (Anti-aliasing noise-reduction: cuts high-frequency hiss >7.5kHz before 16kHz resampling)
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(7500, ctx.currentTime);
    lowpass.Q.setValueAtTime(0.707, ctx.currentTime);

    // 3. Dynamics Compressor (Normalizes microphone input dynamics cleanly for clear pronunciation recognition)
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, ctx.currentTime);
    compressor.knee.setValueAtTime(12, ctx.currentTime);
    compressor.ratio.setValueAtTime(4, ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    compressor.release.setValueAtTime(0.25, ctx.currentTime);

    // 4. PCM capture script processor
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    // 5. Muted gain node to connect to destination without local loopback feedback
    const mutedGain = ctx.createGain();
    mutedGain.gain.setValueAtTime(0, ctx.currentTime);

    processor.onaudioprocess = (ev) => {
      const input = ev.inputBuffer.getChannelData(0);
      const snap = confidenceTrackerRef.current.pushPcmFrame(input, ctx.sampleRate);
      const now = Date.now();
      if (now - lastMeterUpdateRef.current >= 120) {
        lastMeterUpdateRef.current = now;
        setConfidenceSnapshot(snap);
      }

      if (ws.readyState !== WebSocket.OPEN) return;
      const pcm16 = downsampleTo16kInt16(input, ctx.sampleRate);
      const base64 = int16ToBase64(pcm16);
      ws.send(JSON.stringify({ type: "audio", data: base64 }));
    };

    // Chain: source -> highpass -> lowpass -> compressor -> processor -> mutedGain -> destination
    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(compressor);
    compressor.connect(processor);
    processor.connect(mutedGain);
    mutedGain.connect(ctx.destination);
  };

  const handleInterrupt = () => {
    stopAudioPlayback();
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "audio_end" }));
    }
    setStatus(wsRef.current?.readyState === WebSocket.OPEN ? "listening" : "idle");
  };

  const handleSendTextTurn = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = textInput.trim();
    if (!clean) return;
    setErrorMsg(null);
    setTextInput("");
    setTurns((prev) => [
      ...prev.slice(-14),
      { id: `vu_${Date.now().toString(36)}`, role: "user", text: clean },
    ]);

    if (wsRef.current?.readyState === WebSocket.OPEN && transport === "ws") {
      setStatus("processing");
      wsRef.current.send(JSON.stringify({ type: "text", text: clean }));
      return;
    }

    setStatus("processing");
    try {
      const res = await fetch("/api/ai/live-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textPrompt: clean,
          language: lang,
          voiceName: activeVoicePreset,
          contextSummary,
        }),
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        audioBase64?: string;
        outputTranscript?: string;
        message?: string;
      };
      if (!res.ok || !payload.ok) {
        setErrorMsg(payload.message ?? "Live voice turn failed.");
        setStatus("idle");
        return;
      }
      if (payload.outputTranscript) {
        setTurns((prev) => [
          ...prev.slice(-14),
          {
            id: `va_${Date.now().toString(36)}`,
            role: "assistant",
            text: payload.outputTranscript as string,
          },
        ]);
      }
      if (payload.audioBase64) {
        play24kPcmChunk(payload.audioBase64);
      } else {
        setStatus("idle");
      }
    } catch {
      setErrorMsg("Network error reaching Live Voice endpoint.");
      setStatus("idle");
    }
  };

  const statusText =
    status === "listening"
      ? t("p5.voice.listening")
      : status === "processing"
        ? t("p5.voice.processing")
        : status === "speaking"
          ? t("p5.voice.speaking")
          : status === "connecting"
            ? "Connecting Live Voice Tutor..."
            : t("p5.voice.ready");

  return (
    <div className="surface-card space-y-3 border-primary/25 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Waves className="size-4 text-primary" />
          <div>
            <h3 className="font-display text-sm font-bold text-foreground">
              {t("p5.voice.title")}
            </h3>
            <p className="text-[0.68rem] text-muted-foreground tabular-nums">
              {statusText} · {activeVoicePreset} · {activePlaybackSpeed.toFixed(2)}×
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FeatureGuideTrigger featureId="ai-voice-drawer" iconOnly />
          {status === "idle" ? (
            <Button
              type="button"
              size="sm"
              variant="glow"
              onClick={startLiveMicSession}
              className="min-h-[40px] text-xs"
            >
              <Mic className="size-3.5" />
              <span>{t("p5.voice.start")}</span>
            </Button>
          ) : (
            <>
              {status === "speaking" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleInterrupt}
                  className="min-h-[40px] text-xs"
                >
                  <Volume2 className="size-3.5" />
                  <span>{t("p5.voice.interrupt")}</span>
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={endVoiceSession}
                className="min-h-[40px] text-xs"
              >
                <PhoneOff className="size-3.5" />
                <span>{t("p5.voice.stop")}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Real-time Speaking Confidence Gauge alongside current conversation */}
      <SpeakingConfidenceGauge
        snapshot={confidenceSnapshot}
        isActive={status === "listening" || status === "speaking"}
        size="sm"
      />

      {errorMsg && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-xp/40 bg-xp/10 px-3 py-2 text-xs text-foreground"
        >
          <MicOff className="size-3.5 shrink-0 text-xp" />
          <span>{errorMsg}</span>
        </div>
      )}

      {(turns.length > 0 || liveOutputDraft) && (
        <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border bg-surface-2 p-3 text-xs">
          {turns.map((item) => (
            <div
              key={item.id}
              className={
                item.role === "user"
                  ? "text-foreground"
                  : "border-s-2 border-primary ps-2.5 text-muted-foreground"
              }
            >
              <span className="font-semibold text-primary">
                {item.role === "user" ? "You: " : "Voice Tutor: "}
              </span>
              <span>{item.text}</span>
            </div>
          ))}
          {liveOutputDraft && (
            <div className="border-s-2 border-primary ps-2.5 text-muted-foreground">
              <span className="font-semibold text-primary">Voice Tutor: </span>
              <span>{liveOutputDraft}</span>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSendTextTurn} className="flex gap-2">
        <Input
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={t("p5.voice.fallbackPh")}
          className="h-8 text-xs"
        />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={!textInput.trim() || status === "processing"}
          className="h-8 text-xs"
        >
          <Send className="size-3.5" />
          <span>Send</span>
        </Button>
      </form>
    </div>
  );
}
