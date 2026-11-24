import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Compass,
  HeartPulse,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AREA_CONFIG, AREAS, TIERS, getTier, type Area as GrowthArea } from "@/lib/growth";
import { formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import { cn } from "@/lib/utils";
import { GrowthTimelinePath } from "./GrowthTimelinePath";

export interface GrowthMapProps {
  level: number;
  xp: number;
  scores: Record<GrowthArea, number>;
  completedTasksByArea?: Partial<Record<GrowthArea, number>>;
  goals?: Array<{ area: string; status: string }>;
  events?: Array<{ area: string; xp: number }>;
  initialSelectedArea?: GrowthArea;
  showTimeline?: boolean;
  className?: string;
}

const DOMAIN_META: Record<
  GrowthArea,
  {
    icon: typeof BookOpen;
    route: "/app/study" | "/app/tasks" | "/app/level-up" | "/app/quran" | "/app/circle";
    strokeClass: string;
    ringHex: string;
  }
> = {
  academic: {
    icon: BookOpen,
    route: "/app/study",
    strokeClass: "text-primary",
    ringHex: "#14b8a6",
  },
  productivity: {
    icon: Timer,
    route: "/app/tasks",
    strokeClass: "text-success",
    ringHex: "#22c55e",
  },
  growth: {
    icon: Sparkles,
    route: "/app/level-up",
    strokeClass: "text-xp",
    ringHex: "#f59e0b",
  },
  wellbeing: {
    icon: HeartPulse,
    route: "/app/quran",
    strokeClass: "text-rose-400",
    ringHex: "#fb7185",
  },
  career: {
    icon: Briefcase,
    route: "/app/level-up",
    strokeClass: "text-indigo-400",
    ringHex: "#818cf8",
  },
  community: {
    icon: Users,
    route: "/app/circle",
    strokeClass: "text-amber-400",
    ringHex: "#fbbf24",
  },
};

const NODE_COORDS: Record<GrowthArea, { x: number; y: number }> = {
  academic: { x: 160, y: 42 },
  productivity: { x: 266, y: 102 },
  growth: { x: 266, y: 218 },
  wellbeing: { x: 160, y: 278 },
  career: { x: 54, y: 218 },
  community: { x: 54, y: 102 },
};

export function GrowthMap({
  level,
  xp,
  scores,
  completedTasksByArea = {},
  goals = [],
  events = [],
  initialSelectedArea = "academic",
  showTimeline = true,
  className,
}: GrowthMapProps) {
  const { t, lang } = usePrefs();
  const [selectedArea, setSelectedArea] = useState<GrowthArea>(initialSelectedArea);

  const tier = getTier(level);

  const balanceIndex = useMemo(() => {
    const sum = AREAS.reduce((acc, area) => acc + (scores[area] ?? 0), 0);
    return Math.round(sum / AREAS.length);
  }, [scores]);

  const activeDomainCount = useMemo(
    () => AREAS.filter((area) => (scores[area] ?? 0) > 0).length,
    [scores],
  );

  const selectedMeta = DOMAIN_META[selectedArea];
  const SelectedIcon = selectedMeta.icon;
  const selectedScore = scores[selectedArea] ?? 0;
  const selectedInfo = AREA_CONFIG[selectedArea];

  const selectedStats = useMemo(() => {
    const areaGoals = goals.filter((g) => g.area === selectedArea);
    const completedGoals = areaGoals.filter((g) => g.status === "completed").length;
    const areaEvents = events.filter((e) => e.area === selectedArea);
    const areaXp = areaEvents.reduce((acc, ev) => acc + (Number(ev.xp) || 0), 0);
    const tasksDone = completedTasksByArea[selectedArea] ?? 0;
    return {
      totalGoals: areaGoals.length,
      completedGoals,
      eventsCount: areaEvents.length,
      areaXp,
      tasksDone,
    };
  }, [goals, events, completedTasksByArea, selectedArea]);

  const polygonPoints = useMemo(() => {
    const cx = 160;
    const cy = 160;
    return AREAS.map((area) => {
      const target = NODE_COORDS[area];
      const factor = 0.22 + (Math.min(100, Math.max(0, scores[area] ?? 0)) / 100) * 0.78;
      const px = cx + (target.x - cx) * factor;
      const py = cy + (target.y - cy) * factor;
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    }).join(" ");
  }, [scores]);

  const rechartsDomainData = useMemo(
    () =>
      AREAS.map((area) => {
        const areaGoals = goals.filter((g) => g.area === area);
        const completedGoals = areaGoals.filter((g) => g.status === "completed").length;
        return {
          areaKey: area,
          name: t(AREA_CONFIG[area].labelKey),
          score: Math.min(100, Math.max(0, Math.round(scores[area] ?? 0))),
          milestonesDone: completedGoals + (completedTasksByArea[area] ?? 0),
          color: DOMAIN_META[area].ringHex,
        };
      }),
    [scores, goals, completedTasksByArea, t],
  );

  return (
    <section
      data-testid="growth-map-visual"
      className={cn("surface-card p-5 md:p-6", className)}
      aria-label={t("dash.tab.growthmap")}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Compass className="size-4 text-primary" />
            <span>{t("dash.tab.growthmap")}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {formatNumber(activeDomainCount, lang)}/{formatNumber(AREAS.length, lang)}{" "}
              {t("gmap.activeDomains")}
            </span>
          </div>
          <h2 className="mt-1 font-display text-lg font-bold text-foreground">
            {t("gmap.selectNode")}
          </h2>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-surface-2 px-4 py-2.5">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">
              {t("gmap.balanceIndex")}
            </p>
            <p className="font-display text-xl font-bold tabular-nums text-foreground">
              {formatNumber(balanceIndex, lang)}%
            </p>
          </div>
          <div className="h-8 w-px bg-border" aria-hidden="true" />
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">{t("common.xp")}</p>
            <p className="font-display text-xl font-bold tabular-nums text-primary">
              {formatNumber(xp, lang)}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Constellation + Domain Grid + Inspector */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Interactive Spatial Node Constellation SVG */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-2/60 p-4 lg:col-span-5">
          <svg
            viewBox="0 0 320 320"
            className="h-64 w-full max-w-[290px] select-none"
            role="img"
            aria-label={t("dash.tab.growthmap")}
          >
            {/* Outer & inner rings */}
            <circle
              cx={160}
              cy={160}
              r={118}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeDasharray="4 4"
            />
            <circle
              cx={160}
              cy={160}
              r={72}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.08}
            />

            {/* Connecting spokes */}
            {AREAS.map((area) => {
              const coord = NODE_COORDS[area];
              const isSelected = selectedArea === area;
              return (
                <line
                  key={`spoke-${area}`}
                  x1={160}
                  y1={160}
                  x2={coord.x}
                  y2={coord.y}
                  stroke={isSelected ? DOMAIN_META[area].ringHex : "currentColor"}
                  strokeOpacity={isSelected ? 0.65 : 0.16}
                  strokeWidth={isSelected ? 2 : 1}
                />
              );
            })}

            {/* Live domain coverage polygon */}
            <polygon
              points={polygonPoints}
              fill="var(--primary)"
              fillOpacity={0.14}
              stroke="var(--primary)"
              strokeOpacity={0.6}
              strokeWidth={1.5}
            />

            {/* Central Core Node */}
            <g>
              <circle
                cx={160}
                cy={160}
                r={30}
                fill="var(--surface)"
                stroke="var(--primary)"
                strokeWidth={2}
              />
              <text
                x={160}
                y={156}
                textAnchor="middle"
                className="fill-foreground text-[13px] font-bold"
              >
                L{level}
              </text>
              <text
                x={160}
                y={172}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px] font-medium"
              >
                {balanceIndex}%
              </text>
            </g>

            {/* 6 Interactive Domain Nodes */}
            {AREAS.map((area) => {
              const coord = NODE_COORDS[area];
              const score = scores[area] ?? 0;
              const isSelected = selectedArea === area;
              const radius = 21;
              const circ = 2 * Math.PI * radius;
              const dashOffset = circ - (circ * Math.min(100, Math.max(0, score))) / 100;
              const ringColor = DOMAIN_META[area].ringHex;

              return (
                <g
                  key={area}
                  role="button"
                  tabIndex={0}
                  aria-label={`${t(AREA_CONFIG[area].labelKey)}: ${score}%`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedArea(area)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedArea(area);
                    }
                  }}
                  className="cursor-pointer outline-none"
                >
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r={radius + 4}
                    fill={isSelected ? ringColor : "transparent"}
                    fillOpacity={isSelected ? 0.14 : 0}
                  />
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r={radius}
                    fill="var(--card)"
                    stroke="currentColor"
                    strokeOpacity={0.14}
                    strokeWidth={3}
                  />
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r={radius}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={dashOffset}
                    transform={`rotate(-90 ${coord.x} ${coord.y})`}
                  />
                  <text
                    x={coord.x}
                    y={coord.y + 4}
                    textAnchor="middle"
                    className="fill-foreground text-[11px] font-bold"
                  >
                    {score}%
                  </text>
                </g>
              );
            })}
          </svg>

          <p className="mt-1 text-center text-xs text-muted-foreground">
            {tier.badge} {t(tier.nameKey)} · {t("common.level")} {formatNumber(level, lang)}
          </p>
        </div>

        {/* Domain Selector Cards + Selected Inspector */}
        <div className="flex flex-col justify-between gap-4 lg:col-span-7">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {AREAS.map((area) => {
              const info = AREA_CONFIG[area];
              const meta = DOMAIN_META[area];
              const Icon = meta.icon;
              const score = scores[area] ?? 0;
              const isSelected = selectedArea === area;

              return (
                <button
                  key={area}
                  type="button"
                  data-testid={`growth-node-${area}`}
                  onClick={() => setSelectedArea(area)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex flex-col gap-2 rounded-xl border p-3 text-start transition-colors",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface-2/60 hover:border-primary/40 hover:bg-surface-2",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg bg-surface",
                        meta.strokeClass,
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <span className="font-mono text-xs font-bold tabular-nums text-foreground">
                      {formatNumber(score, lang)}%
                    </span>
                  </div>
                  <p className="truncate text-xs font-semibold text-foreground">
                    {t(info.labelKey)}
                  </p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(score, 0))}%`,
                        backgroundColor: meta.ringHex,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Domain Detail Card */}
          <div
            data-testid="growth-map-inspector"
            className="rounded-xl border border-border bg-surface-2 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface",
                    selectedMeta.strokeClass,
                  )}
                >
                  <SelectedIcon className="size-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("gmap.selectedDomain")}
                  </p>
                  <h3 className="font-display text-base font-bold text-foreground">
                    {t(selectedInfo.labelKey)} ·{" "}
                    <span className="tabular-nums text-primary">
                      {formatNumber(selectedScore, lang)}%
                    </span>
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t(selectedInfo.descKey)}</p>
                </div>
              </div>

              <Link
                to={selectedMeta.route}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <span>{t("gmap.openModule")}</span>
                <ArrowRight className="size-3.5 rtl-flip" />
              </Link>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/80 pt-3 text-xs text-muted-foreground tabular-nums">
              <span>
                {t("gmap.goalsStat")}:{" "}
                <strong className="text-foreground">
                  {formatNumber(selectedStats.completedGoals, lang)}/
                  {formatNumber(selectedStats.totalGoals, lang)}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {t("gmap.tasksStat")}:{" "}
                <strong className="text-foreground">
                  {formatNumber(selectedStats.tasksDone, lang)}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {t("gmap.eventsStat")}:{" "}
                <strong className="text-foreground">
                  {formatNumber(selectedStats.eventsCount, lang)}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-xp">
                +{formatNumber(selectedStats.areaXp, lang)} {t("common.xp")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts 6-Domain Milestone & Progress Chart */}
      <div
        data-testid="growth-map-recharts"
        className="mt-6 rounded-xl border border-border bg-surface-2/50 p-4"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("dash.growth.dimensions")}
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === "ar"
                ? "مقارنة تقدمك وإنجازاتك عبر مجالات النمو الستة"
                : "Progress and completed milestones across all six core development areas"}
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-primary tabular-nums">
            {formatNumber(balanceIndex, lang)}%
          </span>
        </div>
        <div className="h-48 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={180} minHeight={160}>
            <BarChart
              data={rechartsDomainData}
              margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="var(--chart-axis)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke="var(--chart-axis)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                unit="%"
              />
              <Tooltip
                cursor={{ fill: "var(--chart-grid)" }}
                contentStyle={{
                  backgroundColor: "var(--chart-tooltip-bg)",
                  borderColor: "var(--chart-tooltip-border)",
                  color: "var(--chart-tooltip-fg)",
                  borderRadius: "0.625rem",
                  fontSize: "0.75rem",
                }}
                formatter={(value: unknown) => [`${value}%`, t("growth.chart.proficiency")]}
              />
              <Bar
                dataKey="score"
                radius={[6, 6, 0, 0]}
                maxBarSize={42}
                onClick={(entry) => {
                  const areaKey = (entry as { areaKey?: GrowthArea })?.areaKey;
                  if (areaKey) setSelectedArea(areaKey);
                }}
                className="cursor-pointer"
              >
                {rechartsDomainData.map((entry) => (
                  <Cell
                    key={entry.areaKey}
                    fill={entry.color}
                    fillOpacity={selectedArea === entry.areaKey ? 1 : 0.72}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Horizontal 5-Tier Progression Stepper */}
      <div className="mt-6 border-t border-border/80 pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("gmap.tierTrack")}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {TIERS.map((item) => {
            const reached = level >= item.minLevel;
            const current = level >= item.minLevel && level <= item.maxLevel;
            return (
              <div
                key={item.nameKey}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3 py-2.5",
                  current
                    ? "border-primary bg-primary/10"
                    : reached
                      ? "border-border bg-surface-2"
                      : "border-border/50 bg-surface-2/40 opacity-65",
                )}
              >
                <span className="text-base" aria-hidden="true">
                  {item.badge}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {t(item.nameKey)}
                    </p>
                    {reached && <CheckCircle2 className="size-3 shrink-0 text-primary" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground tabular-nums">
                    L{formatNumber(item.minLevel, lang)}
                    {item.maxLevel < 99 ? `–${formatNumber(item.maxLevel, lang)}` : "+"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showTimeline && (
        <div className="mt-6">
          <GrowthTimelinePath level={level} xp={xp} />
        </div>
      )}
    </section>
  );
}
