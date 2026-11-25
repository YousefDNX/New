import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ModernSelect } from "@/components/ui/modern-select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { LANG_META, SUPPORTED_LANGS, type Lang } from "@/lib/i18n-dict";
import { usePrefs } from "@/lib/preferences";
import type { AiPrefs } from "@/lib/settings";
import type { UserSettingsRow } from "@/lib/firestore-data";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { SegmentedChoice, SettingsRow, SettingsSectionCard } from "./SettingsPrimitives";

type SettingsPatch = Partial<Omit<UserSettingsRow, "user_id" | "theme">> & { theme?: string };

export function AiPreferencesSection({
  runSave,
}: {
  runSave: (apply: () => void, undo: () => void, patch: SettingsPatch) => void;
}) {
  const { t, ai, setAi, ecosystem, setEcosystem, buildAiContextSummary } = usePrefs();

  function updateAi(patch: Partial<AiPrefs>, dbPatch: SettingsPatch) {
    const prev = ai;
    runSave(
      () => setAi(patch),
      () => setAi(prev),
      dbPatch,
    );
  }

  function handleClearLocalAiContext() {
    if (typeof window !== "undefined") {
      try {
        for (const k of Object.keys(localStorage)) {
          if (k.startsWith("nexora.ai.")) localStorage.removeItem(k);
        }
      } catch {
        // ignore storage errors
      }
    }
    toast.success(t("set.ai.clear.done"));
  }

  return (
    <SettingsSectionCard
      id="cat-ai"
      title={t("set.ai")}
      desc={t("set.ai.d")}
      badge={<FeatureGuideTrigger featureId="ai-transparency" />}
    >
      <SettingsRow id="ai-lang" label={t("set.ai.lang")}>
        <div className="w-full sm:w-64">
          <ModernSelect
            id="ai-lang"
            ariaLabel={t("set.ai.lang")}
            value={ai.responseLanguage}
            onValueChange={(value) => {
              const v = value as "ui" | Lang;
              updateAi({ responseLanguage: v }, { ai_response_lang: v });
            }}
            searchable
            options={[
              {
                value: "ui",
                label: t("set.study.followUi"),
                description: "Match active interface language",
              },
              ...SUPPORTED_LANGS.map((code) => ({
                value: code,
                label: LANG_META[code].nativeName,
                description: LANG_META[code].englishName,
                badge: code.toUpperCase(),
                keywords: `${code} ${LANG_META[code].nativeName} ${LANG_META[code].englishName}`,
              })),
            ]}
          />
        </div>
      </SettingsRow>

      <SettingsRow label={t("set.ai.length")}>
        <SegmentedChoice
          label={t("set.ai.length")}
          value={ai.responseLength}
          onChange={(v) => updateAi({ responseLength: v }, { ai_response_length: v })}
          options={[
            { v: "concise", l: t("set.study.concise") },
            { v: "standard", l: t("set.study.standard") },
            { v: "detailed", l: t("set.study.detailed") },
          ]}
        />
      </SettingsRow>

      <SettingsRow label={t("set.ai.tone")}>
        <SegmentedChoice
          label={t("set.ai.tone")}
          value={ai.tone}
          onChange={(v) => updateAi({ tone: v }, { ai_tone: v })}
          options={[
            { v: "coach", l: t("set.ai.tone.coach") },
            { v: "calm", l: t("set.ai.tone.calm") },
            { v: "academic", l: t("set.ai.tone.academic") },
          ]}
        />
      </SettingsRow>

      <SettingsRow id="ai-clarify" label={t("set.ai.clarify")} desc={t("set.ai.clarify.d")}>
        <Switch
          id="ai-clarify"
          checked={ai.clarifyingQuestions}
          onCheckedChange={(v) =>
            updateAi({ clarifyingQuestions: v }, { ai_clarifying_questions: v })
          }
        />
      </SettingsRow>

      <SettingsRow id="ai_share_profile" label={t("set.ai.profile")}>
        <Switch
          id="ai_share_profile"
          checked={ai.shareProfile}
          onCheckedChange={(v) => updateAi({ shareProfile: v }, { ai_share_profile: v })}
        />
      </SettingsRow>

      <SettingsRow id="ai_share_tasks" label={t("set.ai.tasks")}>
        <Switch
          id="ai_share_tasks"
          checked={ai.shareTasks}
          onCheckedChange={(v) => updateAi({ shareTasks: v }, { ai_share_tasks: v })}
        />
      </SettingsRow>

      <SettingsRow id="ai_share_growth" label={t("set.ai.growth")}>
        <Switch
          id="ai_share_growth"
          checked={ai.shareGrowth}
          onCheckedChange={(v) => updateAi({ shareGrowth: v }, { ai_share_growth: v })}
        />
      </SettingsRow>

      <SettingsRow id="ai-mem" label={t("set.ai.memory")} desc={t("set.ai.memory.d")}>
        <Switch
          id="ai-mem"
          checked={ai.rememberPreferences}
          onCheckedChange={(v) =>
            updateAi({ rememberPreferences: v }, { ai_remember_preferences: v })
          }
        />
      </SettingsRow>

      <SettingsRow id="ai-hist" label={t("set.ai.history")} desc={t("set.ai.history.d")}>
        <Switch
          id="ai-hist"
          checked={ai.saveHistory}
          onCheckedChange={(v) => updateAi({ saveHistory: v }, { ai_save_history: v })}
        />
      </SettingsRow>

      <SettingsRow id="ai-sugg" label={t("set.ai.suggestions")} desc={t("set.ai.suggestions.d")}>
        <Switch
          id="ai-sugg"
          checked={ai.proactiveSuggestions}
          onCheckedChange={(v) =>
            updateAi({ proactiveSuggestions: v }, { ai_proactive_suggestions: v })
          }
        />
      </SettingsRow>

      <SettingsRow id="ai-notif" label={t("set.ai.notify")}>
        <Switch
          id="ai-notif"
          checked={ai.notifications}
          onCheckedChange={(v) => updateAi({ notifications: v }, { ai_notifications: v })}
        />
      </SettingsRow>

      <SettingsRow
        id="ai-search-default"
        label={t("p5.set.searchDefault")}
        desc={t("p5.set.searchDefault.d")}
      >
        <Switch
          id="ai-search-default"
          checked={ecosystem.searchGroundingDefault}
          onCheckedChange={(v) => {
            setEcosystem({ searchGroundingDefault: v });
            toast.success(t("common.save"));
          }}
        />
      </SettingsRow>

      <SettingsRow id="ai-voice-speed" label={t("p5.set.voiceSpeed")}>
        <div className="flex w-44 items-center gap-3">
          <Slider
            id="ai-voice-speed"
            aria-label={t("p5.set.voiceSpeed")}
            min={0.85}
            max={1.25}
            step={0.05}
            value={[ecosystem.voiceSpeed]}
            onValueChange={([v]) => {
              if (v !== undefined) setEcosystem({ voiceSpeed: v });
            }}
          />
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {ecosystem.voiceSpeed.toFixed(2)}×
          </span>
        </div>
      </SettingsRow>

      <div className="space-y-3 pt-4">
        <div className="rounded-lg border border-border/80 bg-surface-2/50 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("set.ai.promptPreview")}
          </p>
          <p className="mt-1 font-mono text-xs text-foreground">{buildAiContextSummary()}</p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleClearLocalAiContext}
          className="gap-1.5"
        >
          <Trash2 className="size-3.5" />
          <span>{t("set.ai.clear")}</span>
        </Button>
      </div>
    </SettingsSectionCard>
  );
}
