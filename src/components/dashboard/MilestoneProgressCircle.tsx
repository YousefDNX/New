import { useId, useMemo, useState } from "react";
import { Sparkles, Trophy, Info, ChevronUp, ChevronDown } from "lucide-react";
import { useStats, useTasks, useGoals } from "@/hooks/use-nexora";
import { useFocusSessions, useStudyItems } from "@/hooks/use-modules";
import { usePrefs } from "@/lib/preferences";
import {
  computeMilestoneProgress,
  getMilestoneTier,
  type MilestoneProgressStats,
} from "@/lib/milestone-progress";
import { formatNumber } from "@/lib/locale-format";
import { cn } from "@/lib/utils";

export interface MilestoneProgressCircleProps {
  /** Size variant of the progress circle gauge */
  size?: "sm" | "md" | "lg" | "xl";
  /** Optional stroke width override in pixels */
  strokeWidth?: number;
  /** Whether to render the milestone tier badge */
  showTierBadge?: boolean;
  /** Whether to enable the interactive popover / tooltip on hover or tap */
  showTooltip?: boolean;
  /** Optional custom title or label below percentage */
  label?: string;
  /** Explicit percentage override (0-100) for preview or controlled usage */
  overridePercentage?: number;
  /** Explicit precomputed stats override */
  overrideStats?: MilestoneProgressStats;
  /** Additional container classes */
  className?: string;
  /** Whether to render in minimal inline mode without card enclosure */
  variant?: "card" | "inline" | "hero";
  /** Accessibility role override */
  role?: "progressbar" | "img" | "group" | "region";
}

const SIZE_CONFIGS = {
  sm: {
    dim: 72,
    stroke: 6,
    textClass: "text-xs font-bold",
    subClass: "text-[9px]",
    badgeClass: "text-[10px] px-1.5 py-0.5",
  },
  md: {
    dim: 104,
    stroke: 8,
    textClass: "text-lg font-extrabold",
    subClass: "text-[10px]",
    badgeClass: "text-xs px-2 py-0.5",
  },
  lg: {
    dim: 140,
    stroke: 10,
    textClass: "text-2xl font-extrabold",
    subClass: "text-xs",
    badgeClass: "text-xs px-2.5 py-1",
  },
  xl: {
    dim: 180,
    stroke: 12,
    textClass: "text-3xl font-extrabold",
    subClass: "text-xs",
    badgeClass: "text-sm px-3 py-1",
  },
} as const;

export function MilestoneProgressCircle({
  size = "md",
  strokeWidth,
  showTierBadge = true,
  showTooltip = true,
  label,
  overridePercentage,
  overrideStats,
  className,
  variant = "card",
  role = "progressbar",
}: MilestoneProgressCircleProps) {
  const gradientId = useId();
  const { lang } = usePrefs();
  const isAr = lang === "ar";

  const { data: stats } = useStats();
  const { data: tasks = [] } = useTasks();
  const { data: goals = [] } = useGoals();
  const { data: studyItems = [] } = useStudyItems();
  const { data: focusSessions = [] } = useFocusSessions();

  const [tooltipOpen, setTooltipOpen] = useState(false);

  // Compute or consume stats
  const computedStats = useMemo(() => {
    if (overrideStats) return overrideStats;
    const level = stats?.level ?? 1;
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const completedGoals = goals.filter((g) => g.status === "completed").length;

    return computeMilestoneProgress({
      level,
      completedTasks,
      completedGoals,
      studyItemsCount: studyItems.length,
      focusSessionsCount: focusSessions.length,
    });
  }, [overrideStats, stats?.level, tasks, goals, studyItems.length, focusSessions.length]);

  const percentage =
    typeof overridePercentage === "number"
      ? Math.max(0, Math.min(100, Math.round(overridePercentage)))
      : computedStats.overallPercentage;

  const tier = useMemo(() => getMilestoneTier(percentage), [percentage]);

  const cfg = SIZE_CONFIGS[size];
  const actualStroke = strokeWidth ?? cfg.stroke;
  const radius = (cfg.dim - actualStroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const academicPct =
    computedStats.academicTotal > 0
      ? Math.round((computedStats.academicCount / computedStats.academicTotal) * 100)
      : 0;
  const personalPct =
    computedStats.personalTotal > 0
      ? Math.round((computedStats.personalCount / computedStats.personalTotal) * 100)
      : 0;

  const centerLabel = label ?? (isAr ? "إنجاز المعالم" : "Milestones");

  const progressLabel = isAr
    ? `نسبة إنجاز المعالم: ${formatNumber(percentage, lang)}%`
    : `Milestone completion rate: ${formatNumber(percentage, lang)}%`;

  return (
    <div
      data-testid="milestone-progress-circle-root"
      className={cn(
        "relative flex flex-col items-center",
        variant === "card" &&
          "surface-card rounded-2xl border border-border/80 bg-surface/90 p-4 transition-all hover:border-primary/40 md:p-5",
        variant === "hero" && "p-1",
        className,
      )}
    >
      {/* Interactive Tooltip Popover Layer */}
      {showTooltip && tooltipOpen && (
        <div
          role="tooltip"
          data-testid="milestone-circle-tooltip"
          className="absolute -top-2 left-1/2 z-40 w-64 -translate-x-1/2 -translate-y-full rounded-xl border border-primary/25 bg-surface-2 p-3 text-xs shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <span className="font-semibold text-foreground">
              {isAr ? "تفاصيل إنجاز المعالم" : "Milestone Mastery"}
            </span>
            <span className="font-bold text-primary">{formatNumber(percentage, lang)}%</span>
          </div>

          <div className="mt-2 space-y-1.5 text-[11px] text-muted-foreground">
            <div className="flex justify-between">
              <span>{isAr ? "المعالم الأكاديمية" : "Academic"}:</span>
              <span className="font-medium text-foreground">
                {formatNumber(computedStats.academicCount, lang)}/
                {formatNumber(computedStats.academicTotal, lang)} ({formatNumber(academicPct, lang)}
                %)
              </span>
            </div>

            <div className="flex justify-between">
              <span>{isAr ? "النمو الشخصي والرفاه" : "Personal & Care"}:</span>
              <span className="font-medium text-foreground">
                {formatNumber(computedStats.personalCount, lang)}/
                {formatNumber(computedStats.personalTotal, lang)} ({formatNumber(personalPct, lang)}
                %)
              </span>
            </div>

            {computedStats.nextMilestone && (
              <div className="mt-2 border-t border-border/60 pt-1.5 text-[10px]">
                <span className="font-semibold text-primary">
                  {isAr ? "المعلم القادم:" : "Next target:"}{" "}
                </span>
                <span className="text-foreground">
                  {isAr ? computedStats.nextMilestone.titleAr : computedStats.nextMilestone.titleEn}
                </span>
              </div>
            )}
          </div>

          {/* Little arrow */}
          <div className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-b border-e border-primary/25 bg-surface-2" />
        </div>
      )}

      {/* SVG Circle Gauge */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: cfg.dim, height: cfg.dim }}
        onMouseEnter={() => showTooltip && setTooltipOpen(true)}
        onMouseLeave={() => showTooltip && setTooltipOpen(false)}
        onClick={() => showTooltip && setTooltipOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (showTooltip && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setTooltipOpen((prev) => !prev);
          }
        }}
        tabIndex={showTooltip ? 0 : undefined}
        role={role}
        aria-valuenow={role === "progressbar" ? percentage : undefined}
        aria-valuemin={role === "progressbar" ? 0 : undefined}
        aria-valuemax={role === "progressbar" ? 100 : undefined}
        aria-label={progressLabel}
        data-testid="milestone-progress-circle-gauge"
      >
        <svg
          width={cfg.dim}
          height={cfg.dim}
          viewBox={`0 0 ${cfg.dim} ${cfg.dim}`}
          className="size-full -rotate-90 transform"
          aria-hidden="true"
        >
          <defs>
            {/* Theme Primary Gradient using theme variables */}
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary-glow, var(--primary)))" />
            </linearGradient>
          </defs>

          {/* Background Structural Circle Track */}
          <circle
            cx={cfg.dim / 2}
            cy={cfg.dim / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={actualStroke}
            className="text-surface-2 opacity-80 dark:text-muted/40"
          />

          {/* Animated Primary Progress Arc */}
          <circle
            data-testid="milestone-circle-arc"
            cx={cfg.dim / 2}
            cy={cfg.dim / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={actualStroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>

        {/* Center Percentage & Info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            data-testid="milestone-circle-percentage"
            className={cn(
              "font-display font-bold tabular-nums text-foreground leading-none",
              cfg.textClass,
            )}
          >
            {formatNumber(percentage, lang)}%
          </span>
          {size !== "sm" && (
            <span
              className={cn(
                "mt-0.5 font-medium text-muted-foreground uppercase tracking-wider",
                cfg.subClass,
              )}
            >
              {centerLabel}
            </span>
          )}
        </div>
      </div>

      {/* Tier Badge & Information Footer */}
      {showTierBadge && (
        <div className="mt-2.5 flex items-center gap-1.5 text-center">
          <span
            data-testid="milestone-circle-tier-badge"
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 font-semibold transition-colors",
              cfg.badgeClass,
              tier.colorClass,
            )}
          >
            <span aria-hidden="true">{tier.badge}</span>
            <span>{isAr ? tier.nameAr : tier.nameEn}</span>
          </span>

          {showTooltip && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setTooltipOpen((prev) => !prev);
              }}
              aria-label={isAr ? "عرض تفاصيل المعالم" : "Toggle milestone details"}
              className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded p-0.5"
            >
              {tooltipOpen ? <ChevronUp className="size-3" /> : <Info className="size-3" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
