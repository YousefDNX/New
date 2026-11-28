import { useState } from "react";
import { Gauge, Globe, Play, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePrefs } from "@/lib/preferences";
import {
  TTS_SPEED_MAX,
  TTS_SPEED_MIN,
  TTS_VOICE_CATALOG,
  clampSpeechRate,
  clampTtsSpeed,
  type EnglishAccent,
  type TtsVoicePresetId,
} from "@/lib/settings";
import { speakEnhancedText, stopEnhancedSpeech } from "@/lib/speech-service";

const AI_VOICE_SPEED_PRESETS = [0.75, 0.9, 1.0, 1.15, 1.3] as const;

export function VoiceConversationSettingsPanel({
  compact = false,
  onClose,
}: {
  compact?: boolean;
  onClose?: () => void;
}) {
  const { lang, ecosystem, setEcosystem, setA11y } = usePrefs();
  const isAr = lang === "ar";
  const [testingPreview, setTestingPreview] = useState(false);

  const activeAccent: EnglishAccent = ecosystem.englishAccent ?? "en-US";
  const activeSpeed = clampTtsSpeed(ecosystem.ttsSpeed || ecosystem.voiceSpeed || 1);
  const activeVoice = ecosystem.ttsVoice || "Zephyr";

  const speedClarifier =
    activeSpeed <= 0.8
      ? isAr
        ? "بطيء جداً للوضوح"
        : "Extra Slow & Clear"
      : activeSpeed < 0.95
        ? isAr
          ? "هادئ وواضح"
          : "Steady & Clear"
        : activeSpeed <= 1.08
          ? isAr
            ? "سرعة طبيعية"
            : "Natural Pace"
          : isAr
            ? "سريع وطليق"
            : "Brisk & Fluent";

  const handleAccentSelect = (accent: EnglishAccent) => {
    setEcosystem({ englishAccent: accent });
    toast.success(
      isAr
        ? accent === "en-GB"
          ? "تم اختيار اللكنة البريطانية (UK)"
          : "تم اختيار اللكنة الأمريكية (US)"
        : accent === "en-GB"
          ? "AI English accent set to UK English (en-GB)"
          : "AI English accent set to US English (en-US)",
      { id: "voice-accent-toast", duration: 1400 },
    );
  };

  const handleSpeedUpdate = (rawRate: number) => {
    const clamped = clampTtsSpeed(rawRate);
    setEcosystem({ ttsSpeed: clamped, voiceSpeed: clamped });
    setA11y({ readAloudRate: clampSpeechRate(clamped) });
  };

  const handleTestVoice = () => {
    if (testingPreview) {
      stopEnhancedSpeech();
      setTestingPreview(false);
      return;
    }
    const sampleText =
      activeAccent === "en-GB"
        ? "Hello! I am speaking in British English at your chosen pace for clear learning."
        : "Hi there! I am speaking in American English at your chosen pace for clear learning.";
    setTestingPreview(true);
    const ok = speakEnhancedText(sampleText, {
      forcedLang: "en",
      preferredLocale: activeAccent,
      rate: activeSpeed,
      voicePreset: activeVoice,
      engine: ecosystem.ttsEngine,
      onStart: () => setTestingPreview(true),
      onEnd: () => setTestingPreview(false),
      onError: () => setTestingPreview(false),
    });
    if (!ok) {
      setTestingPreview(false);
      toast.info(
        isAr
          ? "معاينة الصوت غير متاحة في هذا المتصفح."
          : "Audio preview is unavailable in this browser.",
      );
    }
  };

  return (
    <section
      data-testid="voice-conversation-settings-panel"
      aria-label={isAr ? "إعدادات المحادثة الصوتية" : "AI Conversation Voice Settings"}
      className={`rounded-xl border border-border/80 bg-surface ${
        compact ? "p-3 space-y-3" : "p-3.5 space-y-3.5"
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Volume2 className="size-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-foreground truncate">
              {isAr ? "إعدادات صوت المحادثة واللكنة" : "Voice Accent & Speed"}
            </h4>
            <p className="text-[11px] text-muted-foreground truncate">
              {isAr
                ? "اضبط اللكنة الأمريكية أو البريطانية وسرعة التحدث"
                : "Toggle US / UK English & adjust speaking pace"}
            </p>
          </div>
        </div>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
          >
            {isAr ? "تم" : "Done"}
          </Button>
        )}
      </div>

      {/* US vs UK English Accent Segmented Control */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Globe className="size-3.5 text-primary" />
            <span>{isAr ? "لكنة اللغة الإنجليزية" : "English Accent"}</span>
          </span>
          <span className="font-mono text-[11px] font-semibold text-primary">{activeAccent}</span>
        </div>

        <div
          role="radiogroup"
          aria-label={isAr ? "لكنة اللغة الإنجليزية" : "English Accent"}
          className="grid grid-cols-2 gap-2"
        >
          <button
            type="button"
            role="radio"
            aria-checked={activeAccent === "en-US"}
            data-testid="voice-accent-us"
            onClick={() => handleAccentSelect("en-US")}
            className={`flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-start transition-colors cursor-pointer ${
              activeAccent === "en-US"
                ? "border-primary bg-primary/12 text-foreground"
                : "border-border bg-surface-2/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <span className="text-xs font-bold whitespace-nowrap">
              {isAr ? "أمريكي (US)" : "US English"}
            </span>
            <span className="text-[10px] opacity-80">General American · en-US</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={activeAccent === "en-GB"}
            data-testid="voice-accent-gb"
            onClick={() => handleAccentSelect("en-GB")}
            className={`flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-start transition-colors cursor-pointer ${
              activeAccent === "en-GB"
                ? "border-primary bg-primary/12 text-foreground"
                : "border-border bg-surface-2/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <span className="text-xs font-bold whitespace-nowrap">
              {isAr ? "بريطاني (UK)" : "UK English"}
            </span>
            <span className="text-[10px] opacity-80">British RP · en-GB</span>
          </button>
        </div>
      </div>

      {/* AI Speaking Speed Slider & Accessible Presets */}
      <div className="space-y-2 rounded-lg border border-border/70 bg-surface-2/45 p-2.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="voice-conversation-speed-slider"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground"
          >
            <Gauge className="size-3.5 text-primary" />
            <span>{isAr ? "سرعة تحدث المساعد" : "AI Speaking Speed"}</span>
          </label>
          <span
            data-testid="voice-speed-readout"
            className="font-mono text-xs font-bold text-primary tabular-nums"
          >
            {activeSpeed.toFixed(2)}× · {speedClarifier}
          </span>
        </div>

        <Slider
          id="voice-conversation-speed-slider"
          data-testid="voice-speed-slider"
          aria-label={isAr ? "سرعة تحدث المساعد الصوتي" : "AI speaking speed"}
          min={TTS_SPEED_MIN}
          max={TTS_SPEED_MAX}
          step={0.05}
          value={[activeSpeed]}
          onValueChange={([val]) => {
            if (val !== undefined) handleSpeedUpdate(val);
          }}
        />

        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {AI_VOICE_SPEED_PRESETS.map((preset) => {
            const selected = Math.abs(activeSpeed - preset) < 0.025;
            return (
              <button
                key={preset}
                type="button"
                data-testid={`voice-speed-preset-${preset.toFixed(2)}`}
                onClick={() => handleSpeedUpdate(preset)}
                className={`min-h-[30px] flex-1 rounded-md border px-2 py-1 font-mono text-[11px] font-semibold tabular-nums transition-colors cursor-pointer ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-muted-foreground hover:border-primary/45 hover:text-foreground"
                }`}
              >
                {preset.toFixed(2)}×
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Character + Instant Accent/Speed Preview */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <label
            htmlFor="voice-conversation-profile"
            className="text-[11px] font-semibold text-muted-foreground shrink-0"
          >
            {isAr ? "نبرة الصوت:" : "Voice:"}
          </label>
          <select
            id="voice-conversation-profile"
            data-testid="voice-profile-select"
            aria-label={isAr ? "نبرة الصوت" : "Voice Profile"}
            value={activeVoice}
            onChange={(e) => setEcosystem({ ttsVoice: e.target.value as TtsVoicePresetId })}
            className="h-8 min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
          >
            {TTS_VOICE_CATALOG.map((v) => (
              <option key={v.id} value={v.id}>
                {isAr ? v.labelAr : v.labelEn}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="button"
          size="sm"
          variant={testingPreview ? "secondary" : "outline"}
          data-testid="voice-test-preview-btn"
          onClick={handleTestVoice}
          className="h-8 gap-1.5 px-2.5 text-xs whitespace-nowrap shrink-0 cursor-pointer"
        >
          {testingPreview ? (
            <>
              <Square className="size-3 text-destructive fill-current" />
              <span>{isAr ? "إيقاف" : "Stop"}</span>
            </>
          ) : (
            <>
              <Play className="size-3 text-primary" />
              <span>{isAr ? "معاينة اللكنة" : "Test Accent"}</span>
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
