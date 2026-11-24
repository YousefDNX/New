import { Flame } from "lucide-react";
import { useStats } from "@/hooks/use-nexora";
import { levelProgress } from "@/lib/growth";
import { formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";

export function ProgressCard({ compact }: { compact?: boolean }) {
  const { data } = useStats();
  const { t, lang } = usePrefs();
  const xp = data?.xp ?? 0;
  const p = levelProgress(xp);
  if (compact) {
    return (
      <div
        className="mx-auto flex size-10 items-center justify-center rounded-xl bg-gradient-xp font-display text-sm font-bold text-xp-foreground"
        title={`${t("common.level")} ${formatNumber(p.level, lang)}`}
      >
        {formatNumber(p.level, lang)}
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-border/80 bg-surface-2/65 p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-display font-semibold tabular-nums">
          {t("common.level")} {formatNumber(p.level, lang)}
        </span>
        <span className="flex items-center gap-1 font-medium text-xp tabular-nums">
          <Flame className="size-3.5" />
          {formatNumber(data?.current_streak ?? 0, lang)}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-xp transition-all"
          style={{ width: `${p.pct}%` }}
        />
      </div>
      <div className="mt-1.5 text-[0.7rem] text-muted-foreground tabular-nums">
        {formatNumber(p.current, lang)} / {formatNumber(p.needed, lang)} {t("common.xp")}
      </div>
    </div>
  );
}
