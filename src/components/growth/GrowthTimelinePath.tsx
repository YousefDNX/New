import { useMemo, useState } from "react";
import { CheckCircle2, Flag, Lock, Sparkles } from "lucide-react";
import { getMilestones } from "@/lib/growth";
import { formatNumber } from "@/lib/locale-format";
import { useOptionalPrefs } from "@/lib/preferences";
import { cn } from "@/lib/utils";

export interface GrowthTimelinePathProps {
  level: number;
  xp: number;
  className?: string;
}

const VIEW_W = 720;
const VIEW_H = 172;
const START_X = 64;
const END_X = 656;

export function GrowthTimelinePath({ level, xp, className }: GrowthTimelinePathProps) {
  const prefs = useOptionalPrefs();
  const lang = prefs?.lang ?? "en";
  const isAr = lang === "ar";
  const milestones = useMemo(() => getMilestones(level), [level]);
  const [selectedStage, setSelectedStage] = useState<number>(() => {
    const firstActive = milestones.findIndex((m) => !m.unlocked);
    return firstActive >= 0 ? firstActive : Math.max(0, milestones.length - 1);
  });

  const nodes = useMemo(() => {
    const count = Math.max(1, milestones.length);
    return milestones.map((m, idx) => {
      const ratio = count === 1 ? 0.5 : idx / (count - 1);
      const x = START_X + (END_X - START_X) * ratio;
      const y = idx % 2 === 0 ? 58 : 112;
      return { ...m, idx, x, y };
    });
  }, [milestones]);

  const pathData = useMemo(() => {
    if (nodes.length === 0) return "";
    let d = `M ${nodes[0]!.x} ${nodes[0]!.y}`;
    for (let i = 1; i < nodes.length; i += 1) {
      const prev = nodes[i - 1]!;
      const curr = nodes[i]!;
      const midX = (prev.x + curr.x) / 2;
      d += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [nodes]);

  const unlockedCount = milestones.filter((m) => m.unlocked).length;
  const activeNode = nodes[selectedStage] ?? nodes[0];
  const unlockedRatio =
    milestones.length > 1
      ? Math.max(0, Math.min(1, (unlockedCount - 1) / (milestones.length - 1)))
      : unlockedCount > 0
        ? 1
        : 0;

  return (
    <div
      data-testid="growth-timeline-path"
      className={cn("rounded-xl border border-border/80 bg-surface-2/50 p-4", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {isAr ? "مسار المراحل الأكاديمية" : "Academic Milestone Pathway"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "انقر على أي محطة في المسار لعرض تفاصيل التقدم والمتطلبات."
              : "Select any stage along the SVG pathway to inspect milestone criteria."}
          </p>
        </div>
        <span className="font-mono text-xs font-semibold text-primary tabular-nums">
          {formatNumber(unlockedCount, lang)}/{formatNumber(milestones.length, lang)}{" "}
          {isAr ? "مراحل مكتملة" : "stages unlocked"}
        </span>
      </div>

      <div className="overflow-x-auto pb-1">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-44 w-full min-w-[560px] select-none"
          role="img"
          aria-label={isAr ? "مسار النمو الأكاديمي" : "Academic growth milestone timeline path"}
        >
          {/* Base connecting curve */}
          <path
            d={pathData}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.16}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray="6 6"
          />

          {/* Progress highlight curve */}
          {unlockedCount > 0 && (
            <path
              d={pathData}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={4}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${Math.round(unlockedRatio * 100)} 100`}
            />
          )}

          {nodes.map((node) => {
            const isSelected = selectedStage === node.idx;
            const isNext = !node.unlocked && (node.idx === 0 || nodes[node.idx - 1]?.unlocked);
            return (
              <g
                key={node.level}
                role="button"
                tabIndex={0}
                data-testid={`timeline-node-${node.level}`}
                aria-label={`${isAr ? node.titleAr : node.titleEn} (L${node.level})`}
                aria-pressed={isSelected}
                onClick={() => setSelectedStage(node.idx)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedStage(node.idx);
                  }
                }}
                className="cursor-pointer outline-none"
              >
                {isSelected && (
                  <circle cx={node.x} cy={node.y} r={24} fill="var(--primary)" fillOpacity={0.15} />
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={18}
                  fill={node.unlocked ? "var(--primary)" : "var(--card)"}
                  stroke={node.unlocked ? "var(--primary)" : isNext ? "var(--xp)" : "currentColor"}
                  strokeOpacity={node.unlocked || isNext ? 1 : 0.25}
                  strokeWidth={isSelected ? 3 : 2}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  className={cn(
                    "text-[11px] font-bold",
                    node.unlocked ? "fill-primary-foreground" : "fill-foreground",
                  )}
                >
                  L{node.level}
                </text>
                <text
                  x={node.x}
                  y={node.y % 2 === 0 ? node.y - 26 : node.y + 34}
                  textAnchor="middle"
                  className={cn(
                    "text-[11px] font-semibold",
                    isSelected ? "fill-primary" : "fill-muted-foreground",
                  )}
                >
                  {(isAr ? node.titleAr : node.titleEn).slice(0, 18)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {activeNode && (
        <div
          data-testid="growth-timeline-detail"
          className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/80 px-3.5 py-2.5 text-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {activeNode.unlocked ? (
              <CheckCircle2 className="size-4 shrink-0 text-success" />
            ) : (
              <Lock className="size-4 shrink-0 text-muted-foreground" />
            )}
            <div className="min-w-0">
              <p className="font-display font-bold text-foreground">
                {isAr ? activeNode.titleAr : activeNode.titleEn} ·{" "}
                <span className="text-primary">
                  {isAr
                    ? `المستوى ${formatNumber(activeNode.level, lang)}`
                    : `Level ${formatNumber(activeNode.level, lang)}`}
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isAr ? activeNode.descAr : activeNode.descEn}
              </p>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1 font-mono text-[11px] font-semibold tabular-nums",
              activeNode.unlocked ? "text-success" : "text-muted-foreground",
            )}
          >
            {activeNode.unlocked ? (
              <Sparkles className="size-3.5" />
            ) : (
              <Flag className="size-3.5" />
            )}
            {activeNode.unlocked
              ? isAr
                ? `مكتمل (${formatNumber(xp, lang)} XP)`
                : `Unlocked (${formatNumber(xp, lang)} XP)`
              : isAr
                ? `يتطلب ${formatNumber(Math.max(0, 50 * (activeNode.level - 1) ** 2 - xp), lang)} XP إضافية`
                : `Requires ${formatNumber(Math.max(0, 50 * (activeNode.level - 1) ** 2 - xp), lang)} more XP`}
          </span>
        </div>
      )}
    </div>
  );
}
