import { LANG_META, SUPPORTED_LANGS, type Lang } from "@/lib/i18n-dict";
import { formatDateTime, formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import { REGIONS, TIMEZONE_OPTIONS, type LocalePrefs } from "@/lib/settings";
import type { UserSettingsRow } from "@/lib/firestore-data";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { ModernSelect } from "@/components/ui/modern-select";
import { SegmentedChoice, SettingsRow, SettingsSectionCard } from "./SettingsPrimitives";

type SettingsPatch = Partial<Omit<UserSettingsRow, "user_id" | "theme">> & { theme?: string };

export function LanguageRegionSection({
  region,
  onRegionChange,
  onLangChange,
  runSave,
}: {
  region: string;
  onRegionChange: (region: string) => void;
  onLangChange: (lang: Lang) => void;
  runSave: (apply: () => void, undo: () => void, patch: SettingsPatch) => void;
}) {
  const { t, lang, locale, setLocale } = usePrefs();

  function updateLocale(patch: Partial<LocalePrefs>, dbPatch: SettingsPatch) {
    const prev = locale;
    runSave(
      () => setLocale(patch),
      () => setLocale(prev),
      dbPatch,
    );
  }

  const livePreview = formatDateTime(new Date(), {
    lang,
    timezone: locale.timezone,
    dateFormat: locale.dateFormat,
    timeFormat: locale.timeFormat,
    calendar: locale.calendar,
  });

  return (
    <SettingsSectionCard
      id="cat-language-region"
      title={t("set.langregion")}
      desc={t("set.langregion.d")}
      badge={<FeatureGuideTrigger featureId="settings-notifications" />}
    >
      <div className="py-3.5">
        <p className="mb-2.5 text-sm font-medium">{t("set.lang")}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {SUPPORTED_LANGS.map((code) => {
            const meta = LANG_META[code];
            const active = lang === code;
            return (
              <button
                key={code}
                type="button"
                aria-pressed={active}
                onClick={() => onLangChange(code)}
                className={`flex flex-col items-start rounded-xl border p-2.5 text-start transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-surface-2/40 text-muted-foreground hover:border-border/80 hover:text-foreground"
                }`}
              >
                <span className="text-sm font-semibold text-foreground">{meta.nativeName}</span>
                <span className="mt-0.5 text-[11px] text-muted-foreground">
                  {meta.englishName} · {meta.dir.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <SettingsRow label={t("set.region")}>
        <SegmentedChoice
          label={t("set.region")}
          value={region}
          onChange={onRegionChange}
          options={REGIONS.map((r) => ({ v: r, l: t(`region.${r}`) }))}
        />
      </SettingsRow>

      <SettingsRow id="loc-tz" label={t("set.timezone")}>
        <div className="w-full sm:w-64">
          <ModernSelect
            id="loc-tz"
            ariaLabel={t("set.timezone")}
            value={locale.timezone}
            onValueChange={(value) => updateLocale({ timezone: value }, { timezone: value })}
            searchable
            options={TIMEZONE_OPTIONS.map((tz) => ({
              value: tz.value,
              label: tz.value === "auto" ? t("set.timezone.auto") : tz.label,
            }))}
          />
        </div>
      </SettingsRow>

      <SettingsRow label={t("set.datefmt")}>
        <SegmentedChoice
          label={t("set.datefmt")}
          value={locale.dateFormat}
          onChange={(v) => updateLocale({ dateFormat: v }, { date_format: v })}
          options={[
            { v: "auto", l: t("set.datefmt.auto") },
            { v: "dmy", l: "DD/MM/YYYY" },
            { v: "mdy", l: "MM/DD/YYYY" },
            { v: "ymd", l: "YYYY-MM-DD" },
          ]}
        />
      </SettingsRow>

      <SettingsRow label={t("set.timefmt")}>
        <SegmentedChoice
          label={t("set.timefmt")}
          value={locale.timeFormat}
          onChange={(v) => updateLocale({ timeFormat: v }, { time_format: v })}
          options={[
            { v: "12h", l: t("set.timefmt.12h") },
            { v: "24h", l: t("set.timefmt.24h") },
          ]}
        />
      </SettingsRow>

      <SettingsRow label={t("set.firstday")}>
        <SegmentedChoice
          label={t("set.firstday")}
          value={locale.firstDayOfWeek}
          onChange={(v) => updateLocale({ firstDayOfWeek: v }, { first_day_of_week: v })}
          options={[
            { v: "sunday", l: t("set.day.sunday") },
            { v: "monday", l: t("set.day.monday") },
            { v: "saturday", l: t("set.day.saturday") },
          ]}
        />
      </SettingsRow>

      <SettingsRow label={t("set.calendar")}>
        <SegmentedChoice
          label={t("set.calendar")}
          value={locale.calendar}
          onChange={(v) => updateLocale({ calendar: v }, { calendar_type: v })}
          options={[
            { v: "gregorian", l: t("set.calendar.gregorian") },
            { v: "hijri", l: t("set.calendar.hijri") },
          ]}
        />
      </SettingsRow>

      <SettingsRow label={t("set.units")}>
        <SegmentedChoice
          label={t("set.units")}
          value={locale.units}
          onChange={(v) => updateLocale({ units: v }, { measurement_units: v })}
          options={[
            { v: "metric", l: t("set.units.metric") },
            { v: "imperial", l: t("set.units.imperial") },
          ]}
        />
      </SettingsRow>

      <SettingsRow label={t("set.oppscope")}>
        <SegmentedChoice
          label={t("set.oppscope")}
          value={locale.opportunityScope}
          onChange={(v) => updateLocale({ opportunityScope: v }, { opportunity_scope: v })}
          options={[
            { v: "local", l: t("set.oppscope.local") },
            { v: "gcc", l: t("set.oppscope.gcc") },
            { v: "global", l: t("set.oppscope.global") },
          ]}
        />
      </SettingsRow>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-3.5 text-xs text-muted-foreground">
        <span>{t("set.localePreview")}</span>
        <span className="font-mono font-medium text-foreground tabular-nums">
          {livePreview} · {formatNumber(12450, lang)} {t("common.xp")}
        </span>
      </div>
    </SettingsSectionCard>
  );
}
