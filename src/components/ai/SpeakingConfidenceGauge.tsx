import { CheckCircle2, Mic, MicOff, TrendingUp, Volume2 } from "lucide-react";
import { useOptionalPrefs } from "@/lib/preferences";
import type { SpeakingConfidenceBand, SpeakingConfidenceSnapshot } from "@/lib/speaking-confidence";
import { cn } from "@/lib/utils";

interface SpeakingConfidenceGaugeProps {
  snapshot: SpeakingConfidenceSnapshot;
  isActive: boolean;
  size?: "sm" | "md";
  showDetails?: boolean;
  className?: string;
}

function getBandMeta(band: SpeakingConfidenceBand, isAr: boolean) {
  switch (band) {
    case "strong":
      return {
        label: isAr ? "ثقة عالية" : "Strong",
        strokeClass: "text-emerald-500",
        textClass: "text-emerald-600 dark:text-emerald-400",
        icon: CheckCircle2,
      };
    case "clear":
      return {
        label: isAr ? "نطق واضح" : "Clear",
        strokeClass: "text-primary",
        textClass: "text-primary",
        icon: Volume2,
      };
    case "steady":
      return {
        label: isAr ? "ثابت" : "Steady",
        strokeClass: "text-sky-500",
        textClass: "text-sky-600 dark:text-sky-400",
        icon: TrendingUp,
      };
    case "quiet":
      return {
        label: isAr ? "صوت منخفض" : "Soft",
        strokeClass: "text-amber-500",
        textClass: "text-amber-600 dark:text-amber-400",
        icon: Mic,
      };
    case "idle":
    default:
      return {
        label: isAr ? "جاهز" : "Ready",
        strokeClass: "text-muted-foreground/45",
        textClass: "text-muted-foreground",
        icon: MicOff,
      };
  }
}

export function SpeakingConfidenceGauge({
  snapshot,
  isActive,
  size = "sm",
  showDetails = true,
  className,
}: SpeakingConfidenceGaugeProps) {
  const prefs = useOptionalPrefs();
  const isAr = prefs?.lang === "ar";
  const bandMeta = getBandMeta(snapshot.band, isAr);
  const BandIcon = bandMeta.icon;

  const svgSize = size === "sm" ? 56 : 68;
  const strokeWidth = size === "sm" ? 5 : 6;
  const radius = (svgSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const displayScore = snapshot.score;
  const dashOffset =
    circumference - (Math.max(0, Math.min(100, displayScore)) / 100) * circumference;

  const improvementDelta = snapshot.sampleCount > 2 ? snapshot.score - snapshot.averageScore : 0;

  return (
    <div
      data-testid="speaking-confidence-gauge"
      aria-label={isAr ? "مقياس الثقة في التحدث" : "Speaking Confidence meter"}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border/80 bg-surface-2/75 px-3 py-2",
        isActive && snapshot.isSpeaking && "border-primary/45 bg-primary/5",
        className,
      )}
    >
      {/* Compact Circular SVG Gauge */}
      <div
        className="relative flex shrink-0 items-center justify-center"
        style={{ width: svgSize, height: svgSize }}
      >
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="-rotate-90"
          role="progressbar"
          aria-valuenow={displayScore}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={
            isAr ? `الثقة في التحدث ${displayScore}%` : `Speaking confidence ${displayScore}%`
          }
        >
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-border/70"
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={cn(
              "transition-[stroke-dashoffset] duration-200 ease-out",
              bandMeta.strokeClass,
            )}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span
            data-testid="speaking-confidence-value"
            className={cn(
              "font-mono font-bold tabular-nums text-foreground",
              size === "sm" ? "text-xs" : "text-sm",
            )}
          >
            {displayScore}%
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground">
              {isAr ? "الثقة في التحدث" : "Speaking Confidence"}
            </span>
            <span className="text-muted-foreground" aria-hidden="true">
              ·
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold",
                bandMeta.textClass,
              )}
            >
              <BandIcon className="size-3.5 shrink-0" aria-hidden="true" />
              <span>{bandMeta.label}</span>
            </span>
          </div>

          <p className="text-[11px] leading-snug text-muted-foreground">
            {isAr ? snapshot.clarityHintAr : snapshot.clarityHintEn}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 pt-0.5 text-[11px] font-mono text-muted-foreground tabular-nums">
            <span>
              {isAr ? "المتوسط:" : "Avg:"} {snapshot.averageScore}%
            </span>
            <span>
              {isAr ? "الأعلى:" : "Peak:"} {snapshot.peakScore}%
            </span>
            {snapshot.sampleCount > 2 && improvementDelta !== 0 ? (
              <span
                className={
                  improvementDelta > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                }
              >
                {improvementDelta > 0 ? `+${improvementDelta}%` : `${improvementDelta}%`}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
