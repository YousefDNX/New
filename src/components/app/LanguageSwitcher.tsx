import { Globe } from "lucide-react";
import { LANG_META, SUPPORTED_LANGS, type Lang } from "@/lib/i18n-dict";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem, type StudentEcosystemState } from "@/lib/student-ecosystem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  function handleChange(next: string) {
    const nextLang = next as Lang;
    setLang(nextLang);
    onSelect?.(nextLang);
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <Select value={lang} onValueChange={handleChange}>
        <SelectTrigger
          aria-label={t("lang.switch")}
          className={`h-8 gap-1 border-emerald-500/25 bg-surface-2/80 text-xs font-medium text-foreground transition-colors hover:border-emerald-500/45 hover:bg-surface-2 focus:ring-1 focus:ring-emerald-500 ${
            compact
              ? "min-w-0 px-1.5 md:max-w-[9rem] md:gap-1.5 md:px-2.5"
              : "min-w-[7.5rem] max-w-[10.5rem] gap-1.5 px-2.5"
          }`}
        >
          <Globe className="size-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
          <SelectValue>
            {compact ? (
              <>
                <span className="font-mono text-[10px] uppercase md:hidden">{lang}</span>
                <span className="hidden md:inline">{LANG_META[lang]?.nativeName ?? lang}</span>
              </>
            ) : (
              (LANG_META[lang]?.nativeName ?? lang)
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          align="end"
          className="min-w-[14rem] border-emerald-500/25 bg-surface/95 text-popover-foreground shadow-[0_12px_36px_-12px_rgba(16,185,129,0.28)] backdrop-blur-xl p-1"
        >
          <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground border-b border-border/50 mb-1">
            {lang === "ar" ? "اللغات ومستوى التقدم" : "Languages & Mastery Progress"}
          </div>
          {SUPPORTED_LANGS.map((code) => {
            const pct = getLanguageCompletionPercent(code, ecosystemState);
            return (
              <SelectItem
                key={code}
                value={code}
                className="cursor-pointer text-xs font-medium py-1.5"
              >
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-1.5">
                    <span>{LANG_META[code].nativeName}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">
                      {code}
                    </span>
                  </div>

                  {/* Visual Progress Indicator */}
                  <div
                    className="flex items-center gap-1.5 shrink-0"
                    title={`${LANG_META[code].nativeName}: ${pct}% completed`}
                  >
                    <div className="h-1.5 w-12 rounded-full bg-surface-2 overflow-hidden border border-border/40">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground min-w-[24px] text-end">
                      {pct}%
                    </span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
