import { Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { usePrefs, type A11y } from "@/lib/preferences";
import { FONT_MAX, FONT_MIN, clampFontScale, clampSpeechRate } from "@/lib/settings";
import type { UserSettingsRow } from "@/lib/firestore-data";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { SettingsRow, SettingsSectionCard } from "./SettingsPrimitives";
import { AccessibilityAssistantDialog } from "./AccessibilityAssistantDialog";

type SettingsPatch = Partial<Omit<UserSettingsRow, "user_id" | "theme">> & { theme?: string };

export function AccessibilitySection({
  runSave,
}: {
  runSave: (apply: () => void, undo: () => void, patch: SettingsPatch) => void;
}) {
  const {
    t,
    uiMode,
    setUiMode,
    a11y,
    setA11y,
    ecosystem,
    setEcosystem,
    speakText,
    stopSpeaking,
    speechSupported,
    voiceInputSupported,
    announce,
  } = usePrefs();

  function changeA11y(patch: Partial<A11y>, dbPatch: SettingsPatch) {
    const prev = a11y;
    runSave(
      () => setA11y(patch),
      () => setA11y(prev),
      dbPatch,
    );
  }

  return (
    <SettingsSectionCard
      id="cat-accessibility"
      title={t("set.display")}
      desc={t("set.display.d")}
      badge={<FeatureGuideTrigger featureId="settings-accessibility" />}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3.5">
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-foreground">{t("set.a11y.assistantTitle")}</div>
          <p className="text-[11px] text-muted-foreground">{t("set.a11y.assistantDesc")}</p>
        </div>
        <AccessibilityAssistantDialog />
      </div>

      <SettingsRow id="ui-mode-exp" label={t("set.a11y.modeTitle")} desc={t("set.a11y.modeDesc")}>
        <div className="inline-flex rounded-lg border border-border bg-surface-2 p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              const prev = uiMode;
              runSave(
                () => setUiMode("simplified"),
                () => setUiMode(prev),
                { ui_mode: "simplified" },
              );
            }}
            className={`rounded-md px-3 py-1 font-semibold transition-colors ${
              uiMode === "simplified"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("ui.mode.simplified")}
          </button>
          <button
            type="button"
            onClick={() => {
              const prev = uiMode;
              runSave(
                () => setUiMode("advanced"),
                () => setUiMode(prev),
                { ui_mode: "advanced" },
              );
            }}
            className={`rounded-md px-3 py-1 font-semibold transition-colors ${
              uiMode === "advanced"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("ui.mode.advanced")}
          </button>
        </div>
      </SettingsRow>

      <div className="py-3.5">
        <div className="mb-3 flex items-center justify-between">
          <Label htmlFor="a11y-fs">{t("set.textsize")}</Label>
          <span className="text-sm font-medium tabular-nums text-muted-foreground">
            {Math.round(a11y.fontScale * 100)}%
          </span>
        </div>
        <Slider
          id="a11y-fs"
          aria-label={t("set.textsize")}
          min={FONT_MIN}
          max={FONT_MAX}
          step={0.05}
          value={[a11y.fontScale]}
          onValueChange={([v]) => {
            if (v !== undefined) setA11y({ fontScale: clampFontScale(v) });
          }}
          onValueCommit={([v]) => {
            if (v !== undefined) {
              const clamped = clampFontScale(v);
              changeA11y({ fontScale: clamped }, { font_scale: clamped });
            }
          }}
        />
      </div>

      <SettingsRow id="a11y-dys" label={t("set.dyslexia")} desc={t("set.dyslexia.d")}>
        <Switch
          id="a11y-dys"
          checked={a11y.dyslexia}
          onCheckedChange={(v) => changeA11y({ dyslexia: v }, { dyslexia_font: v })}
        />
      </SettingsRow>

      <SettingsRow id="a11y-hc" label={t("set.contrast")} desc={t("set.contrast.d")}>
        <Switch
          id="a11y-hc"
          checked={a11y.contrast}
          onCheckedChange={(v) => changeA11y({ contrast: v }, { high_contrast: v })}
        />
      </SettingsRow>

      <SettingsRow id="a11y-rm" label={t("set.motion")} desc={t("set.motion.d")}>
        <Switch
          id="a11y-rm"
          checked={a11y.reduceMotion}
          onCheckedChange={(v) => changeA11y({ reduceMotion: v }, { reduced_motion: v })}
        />
      </SettingsRow>

      <SettingsRow id="a11y-focus" label={t("set.focusRing")} desc={t("set.focusRing.d")}>
        <Switch
          id="a11y-focus"
          checked={a11y.focusRing}
          onCheckedChange={(v) => changeA11y({ focusRing: v }, { focus_ring: v })}
        />
      </SettingsRow>

      <SettingsRow id="a11y-simp" label={t("set.simplified")} desc={t("set.simplified.d")}>
        <Switch
          id="a11y-simp"
          checked={a11y.simplified}
          onCheckedChange={(v) => changeA11y({ simplified: v }, { simplified_ui: v })}
        />
      </SettingsRow>

      <SettingsRow id="a11y-clear" label={t("set.clearLang")} desc={t("set.clearLang.d")}>
        <Switch
          id="a11y-clear"
          checked={a11y.clearLanguage}
          onCheckedChange={(v) => changeA11y({ clearLanguage: v }, { clear_language: v })}
        />
      </SettingsRow>

      <div className="space-y-3 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="a11y-tts" className="text-sm font-medium">
              {t("set.readAloud")}
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("set.readAloud.d")}</p>
          </div>
          <Switch
            id="a11y-tts"
            checked={a11y.readAloud}
            onCheckedChange={(v) => {
              if (!v) stopSpeaking();
              changeA11y({ readAloud: v }, { read_aloud: v });
            }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-surface-2/40 p-3">
          <div className="min-w-[12rem] flex-1">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span>{t("set.readAloud.rate")}</span>
              <span className="font-mono tabular-nums">{a11y.readAloudRate.toFixed(2)}x</span>
            </div>
            <Slider
              aria-label={t("set.readAloud.rate")}
              min={0.75}
              max={1.5}
              step={0.05}
              value={[a11y.readAloudRate]}
              onValueChange={([v]) => {
                if (v !== undefined) setA11y({ readAloudRate: clampSpeechRate(v) });
              }}
              onValueCommit={([v]) => {
                if (v !== undefined) {
                  const clamped = clampSpeechRate(v);
                  changeA11y({ readAloudRate: clamped }, { read_aloud_rate: clamped });
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!speechSupported}
              onClick={() => {
                const ok = speakText(t("set.readAloud.sample"));
                announce(t("set.readAloud.sample"));
                if (!ok) toast.error(t("set.readAloud.unsupported"));
              }}
              className="gap-1.5"
            >
              <Volume2 className="size-3.5" />
              <span>{t("set.readAloud.test")}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={!speechSupported}
              onClick={stopSpeaking}
              aria-label={t("common.cancel")}
            >
              <VolumeX className="size-3.5" />
            </Button>
          </div>
        </div>
        {!speechSupported && (
          <p className="text-xs text-muted-foreground">{t("set.readAloud.unsupported")}</p>
        )}
      </div>

      <SettingsRow
        id="a11y-voice"
        label={t("set.voiceInput")}
        desc={`${t("set.voiceInput.d")} (${
          voiceInputSupported ? t("set.voiceInput.supported") : t("set.voiceInput.unsupported")
        })`}
      >
        <Switch
          id="a11y-voice"
          checked={a11y.voiceInput}
          disabled={!voiceInputSupported}
          onCheckedChange={(v) => changeA11y({ voiceInput: v }, { voice_input: v })}
        />
      </SettingsRow>

      <SettingsRow id="a11y-captions" label={t("set.captions")} desc={t("set.captions.d")}>
        <Switch
          id="a11y-captions"
          checked={a11y.captions}
          onCheckedChange={(v) => changeA11y({ captions: v }, { captions_preferred: v })}
        />
      </SettingsRow>

      <SettingsRow
        id="eco-low-bandwidth"
        label="Low-Bandwidth Mode"
        desc="Reduce motion, blur effects, heavy gradients, and auto-loading 3D scenes for slower connections."
      >
        <Switch
          id="eco-low-bandwidth"
          checked={ecosystem.lowBandwidth}
          onCheckedChange={(v) => setEcosystem({ lowBandwidth: v })}
        />
      </SettingsRow>

      <SettingsRow
        id="eco-distraction-free"
        label="Distraction-Free Study Mode"
        desc="Hide navigation rails, footers, and secondary chrome to keep only active learning tools in focus."
      >
        <Switch
          id="eco-distraction-free"
          checked={ecosystem.distractionFree}
          onCheckedChange={(v) => setEcosystem({ distractionFree: v })}
        />
      </SettingsRow>
    </SettingsSectionCard>
  );
}
