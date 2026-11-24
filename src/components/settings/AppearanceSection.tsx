import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { UserSettingsRow } from "@/lib/firestore-data";
import { usePrefs, type ThemeMode } from "@/lib/preferences";
import {
  ACCENT_PRESETS,
  getContrastForeground,
  getContrastRatio,
  isValidHexColor,
  type AccentPreset,
  type AppearancePrefs,
} from "@/lib/settings";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { SegmentedChoice, SettingsRow, SettingsSectionCard } from "./SettingsPrimitives";

type SettingsPatch = Partial<Omit<UserSettingsRow, "user_id" | "theme">> & { theme?: string };

export function AppearanceSection({
  runSave,
  highlightedRowId,
}: {
  runSave: (apply: () => void, undo: () => void, patch: SettingsPatch) => void;
  highlightedRowId?: string | null;
}) {
  const {
    t,
    theme,
    setTheme,
    appearance,
    setAppearance,
    themePresetId,
    setThemePresetId,
    effectiveResolvedTheme,
  } = usePrefs();
  const [hexDraft, setHexDraft] = useState(appearance.customAccentHex);

  useEffect(() => {
    setHexDraft(appearance.customAccentHex);
  }, [appearance.customAccentHex]);

  function changeTheme(next: ThemeMode) {
    const prev = theme;
    runSave(
      () => setTheme(next),
      () => setTheme(prev),
      { theme: next },
    );
  }

  function updateAppearance(patch: Partial<AppearancePrefs>, dbPatch: SettingsPatch) {
    const prev = appearance;
    const prevPresetId = themePresetId;
    runSave(
      () => {
        if (patch.uiTheme !== undefined || patch.accent !== undefined) {
          setThemePresetId(null);
        }
        setAppearance(patch);
      },
      () => {
        setThemePresetId(prevPresetId);
        setAppearance(prev);
      },
      dbPatch,
    );
  }

  const activeHex =
    appearance.accent === "custom"
      ? isValidHexColor(appearance.customAccentHex)
        ? appearance.customAccentHex
        : "#14b8a6"
      : ACCENT_PRESETS[appearance.accent].hex;
  const surfaceRefHex = effectiveResolvedTheme === "light" ? "#ffffff" : "#172030";
  const accentContrast = getContrastRatio(activeHex, surfaceRefHex);

  return (
    <div className="space-y-6">
      {/* Detail Controls (Mode, Density, Effects) */}
      <SettingsSectionCard
        id="cat-appearance"
        title={t("set.app.title")}
        desc={t("set.app.desc")}
        badge={<FeatureGuideTrigger featureId="settings-appearance" />}
      >
        <SettingsRow
          rowId="row-theme-mode"
          highlighted={highlightedRowId === "row-theme-mode"}
          label={t("set.theme")}
        >
          <SegmentedChoice<ThemeMode>
            label={t("set.theme")}
            value={theme}
            onChange={changeTheme}
            options={[
              { v: "dark", l: t("theme.dark") },
              { v: "light", l: t("theme.light") },
              { v: "system", l: t("theme.system") },
            ]}
          />
        </SettingsRow>

        <SettingsRow
          rowId="row-accent"
          highlighted={highlightedRowId === "row-accent"}
          label={t("set.accent")}
          desc={t("set.accent.d")}
        >
          <div className="flex flex-col items-start gap-2.5 sm:items-end">
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(ACCENT_PRESETS) as Exclude<AccentPreset, "custom">[]).map((preset) => {
                const info = ACCENT_PRESETS[preset];
                const active = appearance.accent === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    title={info.label}
                    aria-label={info.label}
                    aria-pressed={active}
                    onClick={() => updateAppearance({ accent: preset }, { accent_color: preset })}
                    className={`flex size-8 items-center justify-center rounded-full border-2 transition-transform ${
                      active ? "scale-110 border-foreground" : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: info.hex }}
                  >
                    {active && (
                      <Check
                        className="size-4"
                        style={{ color: getContrastForeground(info.hex) }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="custom-accent-hex" className="text-xs text-muted-foreground">
                {t("set.accent.custom")}
              </label>
              <Input
                id="custom-accent-hex"
                value={hexDraft}
                onChange={(e) => {
                  const v = e.target.value;
                  setHexDraft(v);
                  if (isValidHexColor(v)) {
                    updateAppearance(
                      { accent: "custom", customAccentHex: v },
                      { accent_color: "custom", custom_accent_hex: v },
                    );
                  }
                }}
                placeholder="#14b8a6"
                maxLength={7}
                dir="ltr"
                className="h-8 w-28 font-mono text-xs"
              />
              <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted-foreground tabular-nums">
                {accentContrast}:1
              </span>
            </div>
          </div>
        </SettingsRow>

        <SettingsRow
          rowId="row-density"
          highlighted={highlightedRowId === "row-density"}
          label={t("set.density")}
        >
          <SegmentedChoice
            label={t("set.density")}
            value={appearance.density}
            onChange={(v) => updateAppearance({ density: v }, { density: v })}
            options={[
              { v: "compact", l: t("set.density.compact") },
              { v: "comfortable", l: t("set.density.comfortable") },
              { v: "spacious", l: t("set.density.spacious") },
            ]}
          />
        </SettingsRow>

        <SettingsRow
          rowId="row-corner"
          highlighted={highlightedRowId === "row-corner"}
          label={t("set.corner")}
        >
          <SegmentedChoice
            label={t("set.corner")}
            value={appearance.cornerStyle}
            onChange={(v) => updateAppearance({ cornerStyle: v }, { corner_style: v })}
            options={[
              { v: "sharp", l: t("set.corner.sharp") },
              { v: "rounded", l: t("set.corner.rounded") },
              { v: "soft", l: t("set.corner.soft") },
            ]}
          />
        </SettingsRow>

        <SettingsRow
          id="app-effects"
          rowId="row-effects"
          highlighted={highlightedRowId === "row-effects"}
          label={t("set.effects")}
          desc={t("set.effects.d")}
        >
          <Switch
            id="app-effects"
            checked={appearance.reduceVisualEffects}
            onCheckedChange={(v) =>
              updateAppearance({ reduceVisualEffects: v }, { reduce_visual_effects: v })
            }
          />
        </SettingsRow>

        <SettingsRow
          rowId="row-reading-layout"
          highlighted={highlightedRowId === "row-reading-layout"}
          label={t("set.readingLayout")}
        >
          <SegmentedChoice
            label={t("set.readingLayout")}
            value={appearance.readingLayout}
            onChange={(v) => updateAppearance({ readingLayout: v }, { reading_layout: v })}
            options={[
              { v: "standard", l: t("set.readingLayout.standard") },
              { v: "focused", l: t("set.readingLayout.focused") },
            ]}
          />
        </SettingsRow>
      </SettingsSectionCard>
    </div>
  );
}
