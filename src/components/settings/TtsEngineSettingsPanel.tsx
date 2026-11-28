import { AudioLines, Play, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ModernSelect, type ModernSelectOption } from "@/components/ui/modern-select";
import { Slider } from "@/components/ui/slider";
import { usePrefs } from "@/lib/preferences";
import {
  TTS_ENGINE_MODES,
  TTS_SPEED_MAX,
  TTS_SPEED_MIN,
  TTS_VOICE_CATALOG,
  clampSpeechRate,
  clampTtsSpeed,
  type TtsEngineMode,
  type TtsVoicePresetId,
} from "@/lib/settings";
import { speakEnhancedText, stopEnhancedSpeech } from "@/lib/speech-service";

const SPEED_PRESETS = [0.75, 0.9, 1.0, 1.15, 1.3] as const;

export function TtsEngineSettingsPanel({
  onSpeedCommit,
}: {
  onSpeedCommit?: (rate: number) => void;
}) {
  const { lang, ecosystem, setEcosystem, setA11y, speechSupported } = usePrefs();
  const isAr = lang === "ar";

  const activeSpeed = clampTtsSpeed(ecosystem.ttsSpeed || 1);

  const engineOptions: ModernSelectOption[] = TTS_ENGINE_MODES.map((m) => ({
    value: m.id,
    label: isAr ? m.labelAr : m.labelEn,
    description: isAr ? m.descAr : m.descEn,
    keywords: `${m.id} ${m.labelEn} ${m.labelAr}`,
  }));

  const voiceOptions: ModernSelectOption[] = TTS_VOICE_CATALOG.map((v) => ({
    value: v.id,
    label: isAr ? v.labelAr : v.labelEn,
    description: isAr ? v.descAr : v.descEn,
    badge:
      v.id === "Ahmed" || v.id === "Zephyr" || v.id === "Classic"
        ? isAr
          ? "موصى به"
          : "Featured"
        : "Neural",
    group:
      v.group === "featured"
        ? isAr
          ? "الأصوات التعليمية المختارة"
          : "Featured Learning Voices"
        : isAr
          ? "أصوات الاستوديو العصبية"
          : "Neural Studio Voices",
    keywords: `${v.id} ${v.labelEn} ${v.labelAr} ${v.geminiVoice}`,
  }));

  const handleSpeedChange = (rawVal: number, commit = false) => {
    const nextRate = clampTtsSpeed(rawVal);
    setEcosystem({ ttsSpeed: nextRate, voiceSpeed: nextRate });
    setA11y({ readAloudRate: clampSpeechRate(nextRate) });
    if (commit) {
      onSpeedCommit?.(nextRate);
    }
  };

  const handlePlaySample = (sampleLang: "en" | "ar") => {
    const text =
      sampleLang === "ar"
        ? "مرحباً! معك المساعد الصوتي لتعلم اللغات بسرعة ونطق واضح."
        : "Hello! Clear pronunciation and balanced pacing help you master new vocabulary.";
    const ok = speakEnhancedText(text, {
      forcedLang: sampleLang,
      preferredLocale: sampleLang === "ar" ? "ar-SA" : (ecosystem.englishAccent ?? "en-US"),
      engine: ecosystem.ttsEngine,
      voicePreset: ecosystem.ttsVoice,
      rate: activeSpeed,
    });
    if (!ok) {
      toast.info(
        isAr
          ? "تشغيل الصوت غير مدعوم في هذا المتصفح."
          : "Speech playback is unavailable in this browser.",
      );
    }
  };

  return (
    <div
      data-testid="tts-engine-settings-panel"
      className="space-y-4 rounded-xl border border-border/85 bg-surface-2/45 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <AudioLines className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {isAr
                ? "إعدادات محرك النطق الصوتي (TTS) وسرعة التعلّم"
                : "Text-to-Speech (TTS) Engine & Voice Studio"}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isAr
                ? "اختر محرك النطق، الصوت المفضّل (مثل أحمد أو Zephyr أو Classic)، وسرعة التشغيل لدروس اللغات."
                : "Choose your TTS engine, voice profile (e.g., Ahmed, Zephyr, Classic), and playback speed for language learning audio."}
            </p>
          </div>
        </div>

        <span className="font-mono text-xs font-semibold text-primary tabular-nums">
          {ecosystem.ttsVoice} · {activeSpeed.toFixed(2)}×
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ModernSelect
          id="tts-engine-select"
          data-testid="tts-engine-select"
          label={isAr ? "محرك تحويل النص إلى كلام" : "TTS Synthesis Engine"}
          ariaLabel={isAr ? "محرك تحويل النص إلى كلام" : "TTS Synthesis Engine"}
          value={ecosystem.ttsEngine}
          onValueChange={(val) => {
            setEcosystem({ ttsEngine: val as TtsEngineMode });
            toast.success(isAr ? "تم تحديث محرك النطق" : "TTS engine updated", {
              id: "tts-saved",
              duration: 1200,
            });
          }}
          options={engineOptions}
          searchable
          searchPlaceholder={isAr ? "ابحث عن المحرك..." : "Search TTS engine..."}
          leadingIcon={<AudioLines className="size-4" />}
          helperText={
            isAr
              ? "يُطبَّق على المفردات والاستماع والذكاء الاصطناعي."
              : "Applied across vocabulary, listening, reading & AI tutor."
          }
        />

        <ModernSelect
          id="tts-voice-select"
          data-testid="tts-voice-select"
          label={isAr ? "الصوت المختار" : "Voice Profile"}
          ariaLabel={isAr ? "الصوت المختار" : "Voice Profile"}
          value={ecosystem.ttsVoice}
          onValueChange={(val) => {
            setEcosystem({ ttsVoice: val as TtsVoicePresetId });
            toast.success(isAr ? `تم اختيار صوت ${val}` : `Voice set to ${val}`, {
              id: "tts-voice-saved",
              duration: 1200,
            });
          }}
          options={voiceOptions}
          searchable
          searchPlaceholder={
            isAr
              ? "ابحث باسم الصوت (مثل Ahmed, Zephyr)..."
              : "Search voice (Ahmed, Zephyr, Classic)..."
          }
          leadingIcon={<Volume2 className="size-4" />}
          helperText={
            isAr
              ? "أصوات مصممة لوضوح المخارج في العربية والإنجليزية."
              : "Calibrated for clear English and Arabic articulation."
          }
        />
      </div>

      {/* Playback Speed Control */}
      <div className="space-y-2.5 rounded-xl border border-border/70 bg-surface/70 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="tts-playback-speed" className="text-xs font-semibold text-foreground">
            {isAr ? "سرعة تشغيل صوت تعلّم اللغات" : "Language Learning Playback Speed"}
          </label>
          <span
            data-testid="tts-speed-readout"
            className="font-mono text-xs font-bold text-primary tabular-nums"
          >
            {activeSpeed.toFixed(2)}×
          </span>
        </div>

        <Slider
          id="tts-playback-speed"
          data-testid="tts-speed-slider"
          aria-label={isAr ? "سرعة تشغيل الصوت" : "TTS playback speed"}
          min={TTS_SPEED_MIN}
          max={TTS_SPEED_MAX}
          step={0.05}
          value={[activeSpeed]}
          onValueChange={([v]) => {
            if (v !== undefined) handleSpeedChange(v, false);
          }}
          onValueCommit={([v]) => {
            if (v !== undefined) handleSpeedChange(v, true);
          }}
        />

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {SPEED_PRESETS.map((preset) => {
            const active = Math.abs(activeSpeed - preset) < 0.025;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => handleSpeedChange(preset, true)}
                className={`min-h-[36px] rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold tabular-nums transition-colors cursor-pointer ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface-2 text-muted-foreground hover:border-primary/45 hover:text-foreground"
                }`}
              >
                {preset.toFixed(2)}×
              </button>
            );
          })}
        </div>
      </div>

      {/* Sample Audio Preview */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handlePlaySample("en")}
            data-testid="tts-test-en"
            className="min-h-[42px] gap-1.5 text-xs font-semibold"
          >
            <Play className="size-3.5 text-primary" />
            <span>{isAr ? "معاينة بالإنجليزية" : "Preview English Voice"}</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handlePlaySample("ar")}
            data-testid="tts-test-ar"
            className="min-h-[42px] gap-1.5 text-xs font-semibold"
          >
            <Volume2 className="size-3.5 text-primary" />
            <span>{isAr ? "معاينة بالعربية" : "Preview Arabic Voice"}</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => stopEnhancedSpeech()}
            className="min-h-[42px] gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Square className="size-3.5" />
            <span>{isAr ? "إيقاف" : "Stop"}</span>
          </Button>
        </div>

        {!speechSupported && ecosystem.ttsEngine === "browser" ? (
          <span className="text-xs text-muted-foreground">
            {isAr
              ? "واجهة صوت المتصفح غير متاحة؛ يُنصح بمحرك الهجين."
              : "Browser Web Speech unavailable here; Smart Hybrid is recommended."}
          </span>
        ) : null}
      </div>
    </div>
  );
}
