import { Globe } from "lucide-react";
import { LANG_META, SUPPORTED_LANGS, type Lang } from "@/lib/i18n-dict";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem, type StudentEcosystemState } from "@/lib/student-ecosystem";
import { ModernSelect, type ModernSelectOption } from "@/components/ui/modern-select";

export function getLanguageCompletionPercent(
  lang: Lang,
  state?: StudentEcosystemState | null,
): number {
  if (!state) return 0;

  if (lang === "en") {
    const completedLessons = state.englishWorld?.completedLessons?.length ?? 0;
    const vocabCount = Object.keys(state.englishWorld?.vocabProgress ?? {}).length;
    const grammarCount = Object.keys(state.englishWorld?.grammarScores ?? {}).length;
    const totalScore = completedLessons * 5 + vocabCount * 2 + grammarCount * 3;
    return Math.min(100, Math.round((totalScore / 100) * 100));
  }

  if (lang === "ar") {
    const literacy = state.literacyTrackProgress?.completedModuleIds?.length ?? 0;
    const arabicFoundational = state.foundationalPathProgress?.["ar"]?.length ?? 0;
    const arabicZth = state.zeroToHeroProgress?.["ar"]?.length ?? 0;
    const total = literacy * 12 + arabicFoundational * 15 + arabicZth * 8;
    return Math.min(100, Math.round((total / 80) * 100));
  }

  const found = state.foundationalPathProgress?.[lang]?.length ?? 0;
  const zth = state.zeroToHeroProgress?.[lang]?.length ?? 0;
  let custom = 0;
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(`btc.lang_progress.${lang}`);
      if (stored) custom = parseInt(stored, 10) || 0;
    } catch {
      /* ignore */
    }
  }
  const computed = found * 20 + zth * 15 + custom;
  return Math.min(100, computed);
}

export function LanguageSwitcher({
  onSelect,
  className = "",
  compact = false,
}: {
  onSelect?: ((lang: Lang) => void) | undefined;
  className?: string;
  compact?: boolean;
}) {
  const { lang, setLang, t } = usePrefs();
  const { state: ecosystemState } = useStudentEcosystem();
  const isAr = lang === "ar";

  function handleChange(next: string) {
    const nextLang = next as Lang;
    setLang(nextLang);
    onSelect?.(nextLang);
  }

  const options: ModernSelectOption[] = SUPPORTED_LANGS.map((code) => {
    const meta = LANG_META[code];
    const pct = getLanguageCompletionPercent(code, ecosystemState);
    return {
      value: code,
      label: meta.nativeName,
      description: `${meta.englishName} · ${meta.dir.toUpperCase()}`,
      badge: code.toUpperCase(),
      progressPct: pct,
      keywords: `${code} ${meta.nativeName} ${meta.englishName} ${meta.dir}`,
      group:
        meta.dir === "rtl"
          ? isAr
            ? "من اليمين إلى اليسار (RTL)"
            : "Right-to-Left Languages"
          : isAr
            ? "من اليسار إلى اليمين (LTR)"
            : "Left-to-Right Languages",
    };
  });

  return (
    <div className={`inline-flex items-center ${className}`}>
      <ModernSelect
        value={lang}
        onValueChange={handleChange}
        options={options}
        size="sm"
        align="end"
        searchable
        ariaLabel={t("lang.switch")}
        searchPlaceholder={isAr ? "ابحث عن اللغة..." : "Search language..."}
        leadingIcon={<Globe className="size-3.5 text-primary" aria-hidden="true" />}
        triggerClassName={
          compact
            ? "min-h-[38px] min-w-0 px-2.5 md:min-w-[8.5rem] md:max-w-[11rem]"
            : "min-h-[40px] min-w-[9rem] max-w-[12.5rem]"
        }
        contentClassName="min-w-[17rem]"
        renderTriggerValue={(selected) =>
          compact ? (
            <span className="truncate font-medium text-foreground">
              <span className="font-mono text-[11px] uppercase md:hidden">{lang}</span>
              <span className="hidden md:inline">{selected?.label ?? lang}</span>
            </span>
          ) : (
            <span className="truncate font-medium text-foreground">{selected?.label ?? lang}</span>
          )
        }
      />
    </div>
  );
}
