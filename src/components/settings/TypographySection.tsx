import { Check, Info, RotateCcw, Sparkles, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { UserSettingsRow } from "@/lib/firestore-data";
import { usePrefs } from "@/lib/preferences";
import {
  buildReadabilityPreset,
  clampFontScale,
  clampHeadingScale,
  clampLetterSpacing,
  clampLineHeight,
  defaultTypographyPrefs,
  FONT_FAMILIES,
  FONT_MAX,
  FONT_MIN,
  HEADING_SCALE_MAX,
  HEADING_SCALE_MIN,
  LETTER_SPACING_MAX,
  LETTER_SPACING_MIN,
  LINE_HEIGHT_MAX,
  LINE_HEIGHT_MIN,
  type FontFamilyPref,
  type ReadabilityPresetId,
  type TypographyPrefs,
} from "@/lib/settings";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import {
  AdvancedDisclosure,
  SegmentedChoice,
  SettingsRow,
  SettingsSectionCard,
} from "./SettingsPrimitives";

type SettingsPatch = Partial<Omit<UserSettingsRow, "user_id" | "theme">> & { theme?: string };

const PRESET_IDS: Exclude<ReadabilityPresetId, "custom">[] = [
  "standard",
  "comfortable",
  "large",
  "compact",
  "accessibility",
];

const FONT_SAMPLE_META: Record<FontFamilyPref, { sample: string; tag: string }> = {
  nexora: { sample: "Aa Bb · 123", tag: "Sora + Manrope" },
  humanist: { sample: "Aa Bb · 123", tag: "Plus Jakarta Sans" },
  compact: { sample: "Aa Bb · 123", tag: "Space Grotesk + Inter" },
  serif: { sample: "Aa Bb · 123", tag: "Source Serif 4" },
  arabic: { sample: "أبجد هوز · ١٢٣", tag: "IBM Plex Sans Arabic" },
  cjk: { sample: "あ漢字 · 한자 · 123", tag: "Noto Sans JP/SC/KR" },
  accessible: { sample: "Aa Il 0O · 123", tag: "Atkinson Hyperlegible" },
};

export function TypographySection({
  runSave,
  highlightedRowId,
}: {
  runSave: (apply: () => void, undo: () => void, patch: SettingsPatch) => void;
  highlightedRowId?: string | null;
}) {
  const {
    t,
    lang,
    dir,
    typography,
    setTypography,
    effectiveTypography,
    startPreview,
    cancelPreview,
    isPreviewing,
  } = usePrefs();

  function saveTypography(nextPatch: Partial<TypographyPrefs>, dbPatch: SettingsPatch) {
    const prev = typography;
    runSave(
      () => {
        cancelPreview();
        setTypography(nextPatch);
      },
      () => setTypography(prev),
      dbPatch,
    );
  }

  function applyPreset(presetId: Exclude<ReadabilityPresetId, "custom">) {
    const built = buildReadabilityPreset(presetId, lang);
    saveTypography(built, {
      readability_preset: built.readabilityPreset,
      font_family: built.fontFamily,
      font_scale: built.fontScale,
      heading_scale: built.headingScale,
      line_height: built.lineHeight,
      letter_spacing: built.letterSpacing,
      font_weight: built.fontWeight,
    });
  }

  function handleResetTypography() {
    saveTypography(defaultTypographyPrefs, {
      readability_preset: defaultTypographyPrefs.readabilityPreset,
      font_family: defaultTypographyPrefs.fontFamily,
      font_scale: defaultTypographyPrefs.fontScale,
      heading_scale: defaultTypographyPrefs.headingScale,
      line_height: defaultTypographyPrefs.lineHeight,
      letter_spacing: defaultTypographyPrefs.letterSpacing,
      font_weight: defaultTypographyPrefs.fontWeight,
    });
  }

  const effectiveSpacing = dir === "rtl" ? 0 : effectiveTypography.letterSpacing;

  return (
    <SettingsSectionCard
      id="cat-typography"
      title={t("set.typo.title")}
      desc={t("set.typo.desc")}
      badge={
        <div className="flex items-center gap-2">
          <FeatureGuideTrigger featureId="settings-appearance" />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleResetTypography}
            className="gap-1.5 text-xs"
          >
            <RotateCcw className="size-3.5" />
            <span>{t("set.typo.reset")}</span>
          </Button>
        </div>
      }
    >
      {/* Live Typography Specimen Preview Card */}
      <div className="py-4">
        <div
          data-testid="typography-preview-card"
          className="rounded-xl border border-border bg-surface-2/65 p-4 sm:p-5"
          style={{
            lineHeight: effectiveTypography.lineHeight,
            letterSpacing: dir === "rtl" ? "0em" : `${effectiveSpacing}em`,
            fontWeight: effectiveTypography.fontWeight === "medium" ? 500 : 400,
          }}
        >
          <div className="mb-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
              <Type className="size-3.5" />
              {t("set.typo.previewLabel")}
            </span>
            <span className="font-mono tabular-nums">
              {Math.round(effectiveTypography.fontScale * 100)}% ·{" "}
              {effectiveTypography.lineHeight.toFixed(2)}
            </span>
          </div>
          <h3
            className="font-display font-bold text-foreground"
            style={{
              fontSize: `calc(1.25rem * ${effectiveTypography.headingScale})`,
            }}
          >
            {t("set.typo.previewHeading")}
          </h3>
          <p className="mt-1.5 text-sm text-foreground/90">{t("set.typo.previewBody")}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-muted-foreground tabular-nums">
            <span>1,250 XP</span>
            <span>·</span>
            <span>94%</span>
            <span>·</span>
            <span>25:00</span>
          </div>
        </div>
      </div>

      {/* Readability Presets */}
      <div
        id="row-readability-preset"
        className={`scroll-mt-24 py-4 ${
          highlightedRowId === "row-readability-preset"
            ? "settings-search-hit bg-primary/8 px-2"
            : ""
        }`}
      >
        <div className="mb-3">
          <p className="text-sm font-semibold">{t("set.typo.preset")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("set.typo.preset.desc")}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {PRESET_IDS.map((presetId) => {
            const active = effectiveTypography.readabilityPreset === presetId;
            return (
              <div
                key={presetId}
                className={`flex flex-col justify-between rounded-xl border p-3 transition-colors ${
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface-2/40 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold">
                    {t(`set.typo.preset.${presetId}` as Parameters<typeof t>[0])}
                  </span>
                  {active && <Check className="size-3.5 text-primary" />}
                </div>
                <div className="mt-2.5 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      startPreview({ typography: buildReadabilityPreset(presetId, lang) })
                    }
                    className="flex-1 rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    {t("set.preview.btn")}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(presetId)}
                    className="flex-1 rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground"
                  >
                    {t("set.apply.btn")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Curated Font Family Picker */}
      <div
        id="row-font-family"
        className={`scroll-mt-24 py-4 ${
          highlightedRowId === "row-font-family" ? "settings-search-hit bg-primary/8 px-2" : ""
        }`}
      >
        <div className="mb-3">
          <p className="text-sm font-semibold">{t("set.font")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("set.font.desc")}</p>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {FONT_FAMILIES.map((ff) => {
            const active = effectiveTypography.fontFamily === ff;
            const meta = FONT_SAMPLE_META[ff];
            return (
              <button
                key={ff}
                type="button"
                data-testid={`font-card-${ff}`}
                onClick={() =>
                  saveTypography(
                    { fontFamily: ff, readabilityPreset: "custom" },
                    { font_family: ff, readability_preset: "custom" },
                  )
                }
                className={`flex flex-col items-start rounded-xl border p-3 text-start transition-all ${
                  active
                    ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                    : "border-border bg-surface-2/40 hover:border-primary/40"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {t(`set.font.${ff}` as Parameters<typeof t>[0])}
                  </span>
                  {active && <Check className="size-4 text-primary" />}
                </div>
                <span className="mt-1 text-base font-medium text-primary">{meta.sample}</span>
                <span className="mt-0.5 text-[11px] text-muted-foreground">{meta.tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Text Scale Slider */}
      <div
        id="row-typo-scale"
        className={`scroll-mt-24 py-4 ${
          highlightedRowId === "row-typo-scale" ? "settings-search-hit bg-primary/8 px-2" : ""
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <Label htmlFor="typo-fs">{t("set.textsize")}</Label>
          <span className="text-sm font-medium tabular-nums text-muted-foreground">
            {Math.round(effectiveTypography.fontScale * 100)}%
          </span>
        </div>
        <Slider
          id="typo-fs"
          aria-label={t("set.textsize")}
          min={FONT_MIN}
          max={FONT_MAX}
          step={0.05}
          value={[effectiveTypography.fontScale]}
          onValueChange={([v]) => {
            if (v !== undefined) {
              const clamped = clampFontScale(v);
              if (isPreviewing) {
                startPreview({ typography: { fontScale: clamped, readabilityPreset: "custom" } });
              } else {
                setTypography({ fontScale: clamped, readabilityPreset: "custom" });
              }
            }
          }}
          onValueCommit={([v]) => {
            if (v !== undefined) {
              const clamped = clampFontScale(v);
              saveTypography(
                { fontScale: clamped, readabilityPreset: "custom" },
                { font_scale: clamped, readability_preset: "custom" },
              );
            }
          }}
        />
      </div>

      {/* Advanced Typography Fine-Tuning */}
      <AdvancedDisclosure label={t("set.advanced.typography")}>
        <div
          id="row-heading-scale"
          className={`scroll-mt-24 py-3.5 ${
            highlightedRowId === "row-heading-scale" ? "settings-search-hit bg-primary/8 px-2" : ""
          }`}
        >
          <div className="mb-2.5 flex items-center justify-between">
            <Label htmlFor="typo-hs">{t("set.typo.headingScale")}</Label>
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {effectiveTypography.headingScale.toFixed(2)}x
            </span>
          </div>
          <Slider
            id="typo-hs"
            aria-label={t("set.typo.headingScale")}
            min={HEADING_SCALE_MIN}
            max={HEADING_SCALE_MAX}
            step={0.05}
            value={[effectiveTypography.headingScale]}
            onValueChange={([v]) => {
              if (v !== undefined) {
                setTypography({ headingScale: clampHeadingScale(v), readabilityPreset: "custom" });
              }
            }}
            onValueCommit={([v]) => {
              if (v !== undefined) {
                const clamped = clampHeadingScale(v);
                saveTypography(
                  { headingScale: clamped, readabilityPreset: "custom" },
                  { heading_scale: clamped, readability_preset: "custom" },
                );
              }
            }}
          />
        </div>

        <div
          id="row-line-height"
          className={`scroll-mt-24 py-3.5 ${
            highlightedRowId === "row-line-height" ? "settings-search-hit bg-primary/8 px-2" : ""
          }`}
        >
          <div className="mb-2.5 flex items-center justify-between">
            <Label htmlFor="typo-lh">{t("set.typo.lineHeight")}</Label>
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {effectiveTypography.lineHeight.toFixed(2)}
            </span>
          </div>
          <Slider
            id="typo-lh"
            aria-label={t("set.typo.lineHeight")}
            min={LINE_HEIGHT_MIN}
            max={LINE_HEIGHT_MAX}
            step={0.05}
            value={[effectiveTypography.lineHeight]}
            onValueChange={([v]) => {
              if (v !== undefined) {
                setTypography({ lineHeight: clampLineHeight(v), readabilityPreset: "custom" });
              }
            }}
            onValueCommit={([v]) => {
              if (v !== undefined) {
                const clamped = clampLineHeight(v);
                saveTypography(
                  { lineHeight: clamped, readabilityPreset: "custom" },
                  { line_height: clamped, readability_preset: "custom" },
                );
              }
            }}
          />
        </div>

        <div
          id="row-letter-spacing"
          className={`scroll-mt-24 py-3.5 ${
            highlightedRowId === "row-letter-spacing" ? "settings-search-hit bg-primary/8 px-2" : ""
          }`}
        >
          <div className="mb-2.5 flex items-center justify-between">
            <Label htmlFor="typo-ls">{t("set.typo.letterSpacing")}</Label>
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {dir === "rtl" ? "0em (RTL)" : `${effectiveTypography.letterSpacing.toFixed(3)}em`}
            </span>
          </div>
          <Slider
            id="typo-ls"
            aria-label={t("set.typo.letterSpacing")}
            min={LETTER_SPACING_MIN}
            max={LETTER_SPACING_MAX}
            step={0.005}
            disabled={dir === "rtl"}
            value={[dir === "rtl" ? 0 : effectiveTypography.letterSpacing]}
            onValueChange={([v]) => {
              if (v !== undefined && dir !== "rtl") {
                setTypography({
                  letterSpacing: clampLetterSpacing(v),
                  readabilityPreset: "custom",
                });
              }
            }}
            onValueCommit={([v]) => {
              if (v !== undefined && dir !== "rtl") {
                const clamped = clampLetterSpacing(v);
                saveTypography(
                  { letterSpacing: clamped, readabilityPreset: "custom" },
                  { letter_spacing: clamped, readability_preset: "custom" },
                );
              }
            }}
          />
          {dir === "rtl" && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="size-3.5 shrink-0 text-primary" />
              <span>{t("set.typo.arabicNote")}</span>
            </p>
          )}
        </div>

        <SettingsRow
          rowId="row-font-weight"
          highlighted={highlightedRowId === "row-font-weight"}
          label={t("set.typo.fontWeight")}
        >
          <SegmentedChoice<TypographyPrefs["fontWeight"]>
            label={t("set.typo.fontWeight")}
            value={typography.fontWeight}
            onChange={(v) =>
              saveTypography(
                { fontWeight: v, readabilityPreset: "custom" },
                { font_weight: v, readability_preset: "custom" },
              )
            }
            options={[
              { v: "regular", l: t("set.typo.fontWeight.regular") },
              { v: "medium", l: t("set.typo.fontWeight.medium") },
            ]}
          />
        </SettingsRow>
      </AdvancedDisclosure>

      {isPreviewing && (
        <div className="pt-3 text-xs text-muted-foreground">
          <Sparkles className="me-1 inline size-3.5 text-xp" />
          {t("set.preview.banner")}
        </div>
      )}
    </SettingsSectionCard>
  );
}
