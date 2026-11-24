import { motion } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";
import { getTier, levelProgress } from "@/lib/growth";
import { formatNumber } from "@/lib/locale-format";
import { useOptionalPrefs } from "@/lib/preferences";
import { cn } from "@/lib/utils";

export interface XpProgressProps {
  xp: number;
  level?: number;
  compact?: boolean;
  showTierBadge?: boolean;
  className?: string;
}

export function getXpStatusTone(
  level: number,
  pct: number,
): {
  barClass: string;
  accentTextClass: string;
  labelEn: string;
  labelAr: string;
} {
  if (level >= 15) {
    return {
      barClass: "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400",
      accentTextClass: "text-violet-400",
      labelEn: "Mastery",
      labelAr: "تمكّن",
    };
  }
  if (pct >= 80) {
    return {
      barClass: "bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400",
      accentTextClass: "text-xp",
      labelEn: "Close to level up",
      labelAr: "قريب من الترقية",
    };
  }
  if (level >= 4) {
    return {
      barClass: "bg-gradient-primary",
      accentTextClass: "text-primary",
      labelEn: "Rising momentum",
      labelAr: "تقدّم متصاعد",
    };
  }
  return {
    barClass: "bg-gradient-to-r from-emerald-500 to-teal-400",
    accentTextClass: "text-success",
    labelEn: "Starter stride",
    labelAr: "انطلاقة نشطة",
  };
}

export function XpProgress({
  xp,
  level: levelOverride,
  compact = false,
  showTierBadge = true,
  className,
}: XpProgressProps) {
  const prefs = useOptionalPrefs();
  const lang = prefs?.lang ?? "en";
  const isAr = lang === "ar";
  const reduceMotion = Boolean(prefs?.a11y?.reduceMotion);

  const progress = levelProgress(xp);
  const effectiveLevel = levelOverride ?? progress.level;
  const tier = getTier(effectiveLevel);
  const pct = Math.min(100, Math.max(0, progress.pct));
  const remaining = Math.max(0, progress.needed - progress.current);
  const tone = getXpStatusTone(effectiveLevel, pct);

  return (
    <div
      data-testid="xp-progress-component"
      data-level={effectiveLevel}
      data-pct={pct}
      className={cn(
        compact
          ? "transition-colors"
          : "rounded-xl border border-border/80 bg-surface-2/70 p-3.5 transition-colors",
        className,
      )}
    >
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <TrendingUp className="size-3.5" />
            </span>
            <span className="font-display text-xs font-bold text-foreground tabular-nums">
              {isAr
                ? `المستوى ${formatNumber(effectiveLevel, lang)}`
                : `Level ${formatNumber(effectiveLevel, lang)}`}
            </span>
            {showTierBadge && (
              <span className="truncate text-[11px] font-medium text-muted-foreground">
                · {tier.badge} {isAr ? tier.nameAr : tier.nameEn}
              </span>
            )}
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1 text-[11px] font-semibold",
              tone.accentTextClass,
            )}
          >
            <Sparkles className="size-3" />
            <span>{isAr ? tone.labelAr : tone.labelEn}</span>
          </span>
        </div>
      )}

      <div
        className={cn(
          "flex items-baseline justify-between gap-2 text-xs tabular-nums",
          !compact && "mt-2.5",
        )}
      >
        <span className={cn("font-mono font-semibold text-foreground", compact && "text-xs")}>
          {formatNumber(progress.current, lang)} / {formatNumber(progress.needed, lang)}{" "}
          <span className="text-[11px] font-normal text-muted-foreground">XP</span>
        </span>
        <span className={cn("font-display text-xs font-bold", tone.accentTextClass)}>
          {formatNumber(pct, lang)}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={isAr ? "تقدم نقاط الخبرة نحو المستوى التالي" : "XP progress toward next level"}
        className={cn(
          "w-full overflow-hidden rounded-full bg-muted",
          compact ? "mt-1.5 h-1.5" : "mt-2 h-2.5",
        )}
      >
        <motion.div
          className={cn("h-full rounded-full", tone.barClass)}
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 120, damping: 20, mass: 0.8 }
          }
        />
      </div>

      {!compact && (
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
          <span>
            {isAr
              ? `الإجمالي: ${formatNumber(xp, lang)} XP`
              : `Total: ${formatNumber(xp, lang)} XP`}
          </span>
          <span>
            {isAr
              ? `متبقٍ ${formatNumber(remaining, lang)} XP للترقية`
              : `${formatNumber(remaining, lang)} XP to Level ${formatNumber(effectiveLevel + 1, lang)}`}
          </span>
        </div>
      )}
    </div>
  );
}
