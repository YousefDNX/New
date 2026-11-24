import { useEffect, useRef, useState } from "react";
import { Check, Mic, MicOff, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LANG_META } from "@/lib/i18n/types";
import { usePrefs } from "@/lib/preferences";

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface VoiceDictationButtonProps {
  onInsert: (text: string) => void;
  size?: "sm" | "icon";
  className?: string;
}

export function VoiceDictationButton({
  onInsert,
  size = "sm",
  className = "",
}: VoiceDictationButtonProps) {
  const { t, lang, voiceInputSupported, a11y } = usePrefs();
  const [listening, setListening] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    return () => {
      try {
        recRef.current?.stop();
      } catch {
        // Ignore cleanup stop errors
      }
    };
  }, []);

  if (!voiceInputSupported && !a11y.voiceInput) {
    return null;
  }

  const toggleListening = () => {
    if (typeof window === "undefined") return;
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!Ctor) {
      toast.info(t("voice.unsupported"));
      return;
    }

    try {
      const rec = new Ctor();
      rec.lang = LANG_META[lang]?.bcp47 ?? "en-US";
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (ev) => {
        const parts: string[] = [];
        for (let i = 0; i < ev.results.length; i++) {
          const item = ev.results[i];
          if (item?.[0]?.transcript) {
            parts.push(item[0].transcript);
          }
        }
        setDraft(parts.join(" ").trim());
      };
      rec.onerror = (ev) => {
        setListening(false);
        if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
          toast.error(t("voice.denied"));
        }
      };
      rec.onend = () => {
        setListening(false);
      };
      recRef.current = rec;
      setDraft("");
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
      toast.info(t("voice.unsupported"));
    }
  };

  const confirmInsert = () => {
    const clean = (draft ?? "").trim();
    recRef.current?.stop();
    setListening(false);
    setDraft(null);
    if (clean) {
      onInsert(clean);
    }
  };

  const discardDraft = () => {
    recRef.current?.stop();
    setListening(false);
    setDraft(null);
  };

  return (
    <div className={`inline-flex flex-col gap-1.5 ${className}`}>
      <Button
        type="button"
        variant={listening ? "destructive" : "outline"}
        size={size === "icon" ? "icon" : "sm"}
        onClick={toggleListening}
        title={listening ? t("voice.stop") : t("voice.mic")}
        aria-label={listening ? t("voice.stop") : t("voice.mic")}
        className="gap-1.5 h-8 text-xs shrink-0"
      >
        {listening ? <MicOff className="size-3.5 animate-pulse" /> : <Mic className="size-3.5" />}
        {size === "sm" && <span>{listening ? t("voice.listening") : t("voice.mic")}</span>}
      </Button>

      {draft !== null && (
        <div className="p-2.5 rounded-xl bg-surface-2 border border-primary/40 space-y-2 min-w-[220px] max-w-sm">
          <div className="text-[11px] font-semibold text-muted-foreground">
            {t("voice.draftLabel")}
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            className="w-full rounded-lg bg-surface border border-border px-2.5 py-1.5 text-xs text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex items-center justify-end gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={discardDraft}
              className="h-7 px-2 text-xs gap-1"
            >
              <X className="size-3" />
              {t("voice.discard")}
            </Button>
            <Button
              type="button"
              variant="glow"
              size="sm"
              onClick={confirmInsert}
              disabled={!draft.trim()}
              className="h-7 px-2.5 text-xs gap-1"
            >
              <Check className="size-3" />
              {t("voice.insert")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
