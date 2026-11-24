import { useEffect, useRef, useState } from "react";
import { Check, Copy, FileAudio, Mic, NotebookPen, Square, Upload } from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveLocalAiNote } from "@/lib/ai-workspace-store";
import { usePrefs } from "@/lib/preferences";
import { SUBJECT_OPTIONS } from "@/lib/settings";
import {
  getSupportedAudioMimeType,
  readFileAsDataUrlSafe,
  safeStopMediaRecorder,
  validateAttachmentFile,
} from "@/lib/safe-file";

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

async function blobToBase64(blob: Blob): Promise<string> {
  if (blob instanceof File) {
    const dataUrl = await readFileAsDataUrlSafe(blob, {
      maxBytes: MAX_AUDIO_BYTES,
      allowedMimePrefixes: ["audio/", "video/webm", "video/mp4"],
      allowedExtensions: [".mp3", ".wav", ".m4a", ".webm", ".ogg", ".aac", ".flac"],
    });
    const comma = dataUrl.indexOf(",");
    return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Unable to read audio data."));
    reader.onabort = () => reject(new Error("Audio reading was cancelled."));
    try {
      reader.readAsDataURL(blob);
    } catch {
      reject(new Error("Unable to start reading audio data."));
    }
  });
}

export function AudioTranscriptionWidget({
  subject = SUBJECT_OPTIONS[0],
  onInsertTranscript,
  onSaveNote,
}: {
  subject?: string;
  onInsertTranscript?: (text: string) => void;
  onSaveNote?: (note: { subject: string; title: string; content: string }) => Promise<void> | void;
}) {
  const { t, lang } = usePrefs();

  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      safeStopMediaRecorder(recorderRef.current, streamRef.current);
    };
  }, []);

  const sendAudioForTranscription = async (blob: Blob, mimeType: string) => {
    if (blob.size <= 0) {
      setErrorMsg("Recorded or uploaded audio is empty (0 bytes).");
      return;
    }
    if (blob.size > MAX_AUDIO_BYTES) {
      setErrorMsg("Audio exceeds the 8MB limit. Record a shorter clip or upload a smaller file.");
      return;
    }
    setTranscribing(true);
    setErrorMsg(null);
    try {
      const base64 = await blobToBase64(blob);
      const res = await fetch("/api/ai/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64: base64,
          mimeType,
          languageHint: lang,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        transcript?: string;
        disclaimer?: string;
        message?: string;
      };
      if (!res.ok || !data.ok || !data.transcript) {
        setErrorMsg(data.message ?? "Audio transcription failed.");
        return;
      }
      setTranscript(data.transcript);
      setDisclaimer(
        data.disclaimer ??
          "AI transcription may contain minor errors in technical terms. Review before saving.",
      );
      toast.success("Audio transcribed cleanly.");
    } catch {
      setErrorMsg("Network error while transcribing audio.");
    } finally {
      setTranscribing(false);
    }
  };

  const startRecording = async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setErrorMsg(
        "Microphone capture is unavailable in this browser. Upload an audio file instead.",
      );
      return;
    }
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = getSupportedAudioMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      const effectiveMime = recorder.mimeType || mimeType || "audio/webm";
      chunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        safeStopMediaRecorder(null, stream);
        streamRef.current = null;
        setRecording(false);
        const combined = new Blob(chunksRef.current, { type: effectiveMime });
        if (combined.size > 0) {
          void sendAudioForTranscription(combined, effectiveMime);
        }
      };

      recorderRef.current = recorder;
      setRecordingSeconds(0);
      setRecording(true);
      recorder.start();
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      safeStopMediaRecorder(recorderRef.current, streamRef.current);
      streamRef.current = null;
      setRecording(false);
      setErrorMsg(
        "Microphone permission was denied or unavailable. Grant mic access or upload an audio file.",
      );
    }
  };

  const stopRecording = () => {
    safeStopMediaRecorder(recorderRef.current, streamRef.current);
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const validation = validateAttachmentFile(file, {
      maxBytes: MAX_AUDIO_BYTES,
      allowedMimePrefixes: ["audio/"],
      allowedExtensions: [".mp3", ".wav", ".m4a", ".webm", ".ogg", ".aac", ".flac"],
    });
    if (!validation.ok) {
      setErrorMsg(validation.errorEn || "Invalid audio file.");
      toast.error(validation.errorEn || "Invalid audio file.");
      return;
    }
    await sendAudioForTranscription(file, file.type || "audio/mpeg");
  };

  const handleCopy = async () => {
    if (!transcript.trim()) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Copy unavailable");
    }
  };

  const handleSaveStudyNote = async () => {
    if (!transcript.trim()) return;
    setSavingNote(true);
    try {
      const notePayload = {
        subject,
        title: `Audio Note (${new Date().toISOString().slice(0, 10)})`,
        content: transcript.trim(),
      };
      if (onSaveNote) {
        await onSaveNote(notePayload);
        toast.success(`${t("study.saveNote")} (+15 XP)`);
      } else {
        saveLocalAiNote(notePayload);
        toast.success(t("study.saveNote"));
      }
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="surface-card space-y-3 border-primary/25 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileAudio className="size-4 text-primary" />
          <h3 className="font-display text-sm font-bold text-foreground">
            {t("p5.transcribe.title")}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FeatureGuideTrigger featureId="ai-audio-transcribe" iconOnly />
          {!recording ? (
            <Button
              type="button"
              size="sm"
              variant="glow"
              disabled={transcribing}
              onClick={startRecording}
              className="h-8 text-xs"
            >
              <Mic className="size-3.5" />
              <span>{t("p5.transcribe.record")}</span>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={stopRecording}
              className="h-8 text-xs"
            >
              <Square className="size-3" />
              <span>
                {t("p5.transcribe.stopRecord")} ({recordingSeconds}s)
              </span>
            </Button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileSelected}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={recording || transcribing}
            onClick={() => fileInputRef.current?.click()}
            className="h-8 text-xs"
          >
            <Upload className="size-3.5" />
            <span>{t("p5.transcribe.upload")}</span>
          </Button>
        </div>
      </div>

      {transcribing && <p className="text-xs font-medium text-primary">Transcribing audio...</p>}

      {errorMsg && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {errorMsg}
        </div>
      )}

      {transcript && (
        <div className="space-y-2.5">
          <Textarea
            rows={4}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="text-xs"
          />
          {disclaimer && <p className="text-[0.68rem] text-muted-foreground">{disclaimer}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="h-8 text-xs"
            >
              {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </Button>
            {onInsertTranscript && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onInsertTranscript(transcript)}
                className="h-8 text-xs"
              >
                <NotebookPen className="size-3.5" />
                <span>{t("p5.transcribe.insert")}</span>
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="glow"
              disabled={savingNote}
              onClick={handleSaveStudyNote}
              className="h-8 text-xs"
            >
              <NotebookPen className="size-3.5" />
              <span>{t("p5.transcribe.saveNote")}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
