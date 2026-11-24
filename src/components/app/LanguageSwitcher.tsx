import { Globe } from "lucide-react";
import { LANG_META, SUPPORTED_LANGS, type Lang } from "@/lib/i18n-dict";
import { usePrefs } from "@/lib/preferences";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
          className="min-w-[10rem] border-emerald-500/25 bg-surface/95 text-popover-foreground shadow-[0_12px_36px_-12px_rgba(16,185,129,0.28)] backdrop-blur-xl"
        >
          {SUPPORTED_LANGS.map((code) => (
            <SelectItem key={code} value={code} className="cursor-pointer text-xs font-medium">
              <span className="flex items-center justify-between gap-3 w-full">
                <span>{LANG_META[code].nativeName}</span>
                {!compact && (
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                    {code}
                  </span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
