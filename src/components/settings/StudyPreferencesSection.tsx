import { LANG_META, SUPPORTED_LANGS, type Lang } from "@/lib/i18n-dict";
import { usePrefs } from "@/lib/preferences";
import { clampMinutes, type StudyPrefs } from "@/lib/settings";
import type { UserSettingsRow } from "@/lib/firestore-data";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SegmentedChoice, SettingsRow, SettingsSectionCard } from "./SettingsPrimitives";

type SettingsPatch = Partial<Omit<UserSettingsRow, "user_id" | "theme">> & { theme?: string };

export function StudyPreferencesSection({
  runSave,
}: {
  runSave: (apply: () => void, undo: () => void, patch: SettingsPatch) => void;
}) {
  const { t, study, setStudy, ecosystem, setEcosystem } = usePrefs();

  function updateStudy(patch: Partial<StudyPrefs>, dbPatch: SettingsPatch) {
    const prev = study;
    runSave(
      () => setStudy(patch),
      () => setStudy(prev),
      dbPatch,
    );
  }

  return (
    <SettingsSectionCard
      id="cat-study"
      title={t("set.study.title")}
      desc={t("set.study.d")}
      badge={<FeatureGuideTrigger featureId="settings-notifications" />}
    >
      <SettingsRow id="study-expl-lang" label={t("set.study.explLang")}>
        <Select
          value={study.explanationLanguage}
          onValueChange={(value) => {
            const v = value as "ui" | Lang;
            updateStudy({ explanationLanguage: v }, { study_explanation_lang: v });
          }}
        >
          <SelectTrigger
            id="study-expl-lang"
            aria-label={t("set.study.explLang")}
            className="h-9 min-w-[13rem]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ui">{t("set.study.followUi")}</SelectItem>
            {SUPPORTED_LANGS.map((code) => (
              <SelectItem key={code} value={code}>
                {LANG_META[code].nativeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsRow>

      <SettingsRow label={t("set.study.complexity")}>
        <SegmentedChoice
          label={t("set.study.complexity")}
          value={study.complexity}
          onChange={(v) => updateStudy({ complexity: v }, { study_complexity: v })}
          options={[
            { v: "simple", l: t("set.study.simple") },
            { v: "balanced", l: t("set.study.balanced") },
            { v: "advanced", l: t("set.study.advanced") },
          ]}
        />
      </SettingsRow>

      <SettingsRow label={t("set.study.detail")}>
        <SegmentedChoice
          label={t("set.study.detail")}
          value={study.detailLevel}
          onChange={(v) => updateStudy({ detailLevel: v }, { study_detail_level: v })}
          options={[
            { v: "concise", l: t("set.study.concise") },
            { v: "standard", l: t("set.study.standard") },
            { v: "detailed", l: t("set.study.detailed") },
          ]}
        />
      </SettingsRow>

      <SettingsRow
        id="study-step"
        label={t("set.study.stepByStep")}
        desc={t("set.study.stepByStep.d")}
      >
        <Switch
          id="study-step"
          checked={study.stepByStep}
          onCheckedChange={(v) => updateStudy({ stepByStep: v }, { study_step_by_step: v })}
        />
      </SettingsRow>

      <SettingsRow
        id="study-ex"
        label={t("set.study.examplesFirst")}
        desc={t("set.study.examplesFirst.d")}
      >
        <Switch
          id="study-ex"
          checked={study.examplesFirst}
          onCheckedChange={(v) => updateStudy({ examplesFirst: v }, { study_examples_first: v })}
        />
      </SettingsRow>

      <SettingsRow
        id="study-vis"
        label={t("set.study.visualAids")}
        desc={t("set.study.visualAids.d")}
      >
        <Switch
          id="study-vis"
          checked={study.visualAids}
          onCheckedChange={(v) => updateStudy({ visualAids: v }, { study_visual_aids: v })}
        />
      </SettingsRow>

      <SettingsRow id="study-pq" label={t("set.study.practiceQ")} desc={t("set.study.practiceQ.d")}>
        <Switch
          id="study-pq"
          checked={study.practiceQuestions}
          onCheckedChange={(v) =>
            updateStudy({ practiceQuestions: v }, { study_practice_questions: v })
          }
        />
      </SettingsRow>

      <SettingsRow label={t("set.study.flashcard")}>
        <SegmentedChoice
          label={t("set.study.flashcard")}
          value={study.flashcardStyle}
          onChange={(v) => updateStudy({ flashcardStyle: v }, { study_flashcard_style: v })}
          options={[
            { v: "recall", l: t("set.study.fc.recall") },
            { v: "spaced", l: t("set.study.fc.spaced") },
            { v: "cloze", l: t("set.study.fc.cloze") },
          ]}
        />
      </SettingsRow>

      <SettingsRow label={t("set.study.quizDiff")}>
        <SegmentedChoice
          label={t("set.study.quizDiff")}
          value={study.quizDifficulty}
          onChange={(v) => updateStudy({ quizDifficulty: v }, { study_quiz_difficulty: v })}
          options={[
            { v: "adaptive", l: t("set.study.qd.adaptive") },
            { v: "foundation", l: t("set.study.qd.foundation") },
            { v: "challenge", l: t("set.study.qd.challenge") },
          ]}
        />
      </SettingsRow>

      <div className="grid gap-4 py-3.5 sm:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <Label htmlFor="study-sess-min">{t("set.study.sessionMin")}</Label>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {study.sessionMinutes} {t("set.study.minutes")}
            </span>
          </div>
          <Slider
            id="study-sess-min"
            aria-label={t("set.study.sessionMin")}
            min={15}
            max={90}
            step={5}
            value={[study.sessionMinutes]}
            onValueChange={([v]) => {
              if (v !== undefined) setStudy({ sessionMinutes: clampMinutes(v, 5, 180, 25) });
            }}
            onValueCommit={([v]) => {
              if (v !== undefined) {
                const m = clampMinutes(v, 5, 180, 25);
                updateStudy({ sessionMinutes: m }, { study_session_minutes: m });
              }
            }}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <Label htmlFor="study-brk-min">{t("set.study.breakMin")}</Label>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {study.breakMinutes} {t("set.study.minutes")}
            </span>
          </div>
          <Slider
            id="study-brk-min"
            aria-label={t("set.study.breakMin")}
            min={3}
            max={30}
            step={1}
            value={[study.breakMinutes]}
            onValueChange={([v]) => {
              if (v !== undefined) setStudy({ breakMinutes: clampMinutes(v, 1, 60, 5) });
            }}
            onValueCommit={([v]) => {
              if (v !== undefined) {
                const m = clampMinutes(v, 1, 60, 5);
                updateStudy({ breakMinutes: m }, { study_break_minutes: m });
              }
            }}
          />
        </div>
      </div>

      <SettingsRow
        id="study-rev-rem"
        label={t("set.study.revReminders")}
        desc={t("set.study.revReminders.d")}
      >
        <Switch
          id="study-rev-rem"
          checked={study.revisionReminders}
          onCheckedChange={(v) =>
            updateStudy({ revisionReminders: v }, { study_revision_reminders: v })
          }
        />
      </SettingsRow>

      <SettingsRow
        id="study-3d-motion"
        label={t("p5.set.scene3dMotion")}
        desc={t("p5.set.scene3dMotion.d")}
      >
        <Switch
          id="study-3d-motion"
          checked={ecosystem.scene3dReducedMotion}
          onCheckedChange={(v) => setEcosystem({ scene3dReducedMotion: v })}
        />
      </SettingsRow>
    </SettingsSectionCard>
  );
}
