import React, { useMemo, useState } from "react";
import { TrendingUp, Activity, CheckCircle2, Clock, Zap } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { useActivityEvents, useTasks } from "@/hooks/use-nexora";
import { useFocusSessions, useStudyItems } from "@/hooks/use-modules";
import { getWeeklyGrowthTrends, type WeeklyTrendPoint } from "@/lib/growth";
import { formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";

interface LocalizedTrendPoint extends WeeklyTrendPoint {
  weekLabel: string;
  highlight: string;
}

function GrowthTrendsChartBase() {
  const { lang, dir, t } = usePrefs();
  const { data: events = [] } = useActivityEvents(100);
  const { data: tasks = [] } = useTasks();
  const { data: focusSessions = [] } = useFocusSessions();
  const { data: studyItems = [] } = useStudyItems();
  const [metricView, setMetricView] = useState<"combined" | "productivity" | "skills">("combined");
  const [timeframe, setTimeframe] = useState<"8weeks" | "4weeks">("8weeks");

  const hasRealActivity =
    events.length > 0 ||
    tasks.some((tk) => tk.status === "done") ||
    focusSessions.length > 0 ||
    studyItems.length > 0;

  const fullData: LocalizedTrendPoint[] = useMemo(
    () =>
      getWeeklyGrowthTrends({ events, tasks, focusSessions, studyItems }).map((pt) => ({
        ...pt,
        weekLabel: `${t("trend.week")} ${formatNumber(pt.weekNum, lang)}`,
        highlight: t(hasRealActivity ? pt.highlightKey : "growth.trends.emptyNote"),
      })),
    [events, tasks, focusSessions, studyItems, hasRealActivity, t, lang],
  );

  const chartData = timeframe === "4weeks" ? fullData.slice(4) : fullData;

  const latestPoint = fullData[fullData.length - 1] ?? fullData[0]!;
  const baselinePoint = fullData[0]!;
  const productivityDelta = latestPoint.productivity - baselinePoint.productivity;
  const skillsDelta = latestPoint.skillAcquisition - baselinePoint.skillAcquisition;

  return (
    <div className="surface-card p-5 md:p-6">
      <div className="flex flex-col gap-4 border-b border-border/80 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">
              {t("dash.growth.trends")}
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {hasRealActivity ? t("growth.trends.realNote") : t("growth.trends.emptyNote")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border bg-surface-2 p-1 text-xs">
            <button
              type="button"
              onClick={() => setMetricView("combined")}
              className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                metricView === "combined"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("dash.growth.trendsCombined")}
            </button>
            <button
              type="button"
              onClick={() => setMetricView("productivity")}
              className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                metricView === "productivity"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("area.productivity")}
            </button>
            <button
              type="button"
              onClick={() => setMetricView("skills")}
              className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                metricView === "skills"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("dash.growth.trendsSkills")}
            </button>
          </div>

          <div className="flex rounded-lg border border-border bg-surface-2 p-1 text-xs">
            <button
              type="button"
              onClick={() => setTimeframe("4weeks")}
              className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                timeframe === "4weeks"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("dash.growth.trends4w")}
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("8weeks")}
              className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                timeframe === "8weeks"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("dash.growth.trends8w")}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[0.68rem] font-semibold uppercase tracking-wider">
              {t("dash.growth.kpiProd")}
            </span>
            <Activity className="size-3.5 text-success" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2 tabular-nums">
            <span className="font-display text-xl font-extrabold text-foreground">
              {formatNumber(latestPoint.productivity, lang)}%
            </span>
            <span className="text-[0.68rem] font-bold text-success">
              {productivityDelta >= 0 ? "+" : ""}
              {formatNumber(productivityDelta, lang)}%
            </span>
          </div>
          <p className="mt-1 text-[0.65rem] text-muted-foreground">{t("dash.growth.kpiProdSub")}</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[0.68rem] font-semibold uppercase tracking-wider">
              {t("dash.growth.kpiSkill")}
            </span>
            <Zap className="size-3.5 text-primary" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2 tabular-nums">
            <span className="font-display text-xl font-extrabold text-foreground">
              {formatNumber(latestPoint.skillAcquisition, lang)}%
            </span>
            <span className="text-[0.68rem] font-bold text-primary">
              {skillsDelta >= 0 ? "+" : ""}
              {formatNumber(skillsDelta, lang)}%
            </span>
          </div>
          <p className="mt-1 text-[0.65rem] text-muted-foreground">
            {t("dash.growth.kpiSkillSub")}
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[0.68rem] font-semibold uppercase tracking-wider">
              {t("dash.growth.kpiFocus")}
            </span>
            <Clock className="size-3.5 text-xp" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5 tabular-nums">
            <span className="font-display text-xl font-extrabold text-foreground">
              {formatNumber(latestPoint.focusHours, lang)}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {t("dash.growth.hrs")}
            </span>
          </div>
          <p className="mt-1 text-[0.65rem] text-muted-foreground">
            {t("dash.growth.kpiFocusSub")}
          </p>
        </div>

        <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[0.68rem] font-semibold uppercase tracking-wider">
              {t("dash.growth.kpiMastered")}
            </span>
            <CheckCircle2 className="size-3.5 text-primary" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5 tabular-nums">
            <span className="font-display text-xl font-extrabold text-foreground">
              {formatNumber(latestPoint.skillsMastered, lang)}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {t("dash.growth.concepts")}
            </span>
          </div>
          <p className="mt-1 text-[0.65rem] text-muted-foreground">
            {t("dash.growth.kpiMasteredSub")}
          </p>
        </div>
      </div>

      <div className="mt-6 h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%" minWidth={180} minHeight={220}>
          <ComposedChart
            data={chartData}
            margin={
              dir === "rtl"
                ? { top: 20, right: -15, left: 20, bottom: 0 }
                : { top: 20, right: 20, left: -15, bottom: 0 }
            }
          >
            <defs>
              <linearGradient id="productivityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--success)" stopOpacity={0.38} />
                <stop offset="95%" stopColor="var(--success)" stopOpacity={0.0} />
              </linearGradient>

              <linearGradient id="skillsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.38} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />

            <XAxis
              dataKey="weekLabel"
              stroke="var(--chart-axis)"
              fontSize={11}
              tickLine={false}
              dy={5}
            />

            <YAxis
              domain={[0, 100]}
              stroke="var(--chart-axis)"
              fontSize={11}
              tickLine={false}
              unit="%"
            />

            <Tooltip
              content={
                <CustomTrendTooltip
                  prodLabel={t("trend.tooltip.prod")}
                  skillLabel={t("trend.tooltip.skill")}
                  focusLabel={t("trend.tooltip.focus")}
                  tasksLabel={t("trend.tooltip.tasks")}
                  hrsUnit={t("dash.growth.hrs")}
                />
              }
            />

            <Legend
              verticalAlign="top"
              align={dir === "rtl" ? "left" : "right"}
              iconType="circle"
              wrapperStyle={{ paddingBottom: "12px", fontSize: "12px" }}
            />

            {(metricView === "combined" || metricView === "productivity") && (
              <Area
                type="monotone"
                name={t("growth.chart.prod")}
                dataKey="productivity"
                stroke="var(--success)"
                strokeWidth={2.5}
                fill="url(#productivityGrad)"
              />
            )}

            {(metricView === "combined" || metricView === "skills") && (
              <Area
                type="monotone"
                name={t("growth.chart.skill")}
                dataKey="skillAcquisition"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fill="url(#skillsGrad)"
              />
            )}

            {metricView === "productivity" && (
              <Bar
                name={t("growth.chart.focus")}
                dataKey="productivity"
                barSize={12}
                fill="color-mix(in oklch, var(--success) 28%, transparent)"
                radius={[4, 4, 0, 0]}
              />
            )}

            {metricView === "skills" && (
              <Line
                type="monotone"
                name={t("growth.chart.accel")}
                dataKey="skillAcquisition"
                stroke="var(--xp)"
                strokeWidth={2}
                dot={{ r: 4, fill: "var(--xp)" }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface-2/60 p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-success" />
          <span>{t("growth.chart.velocityNote")}</span>
        </div>
        <span className="font-semibold text-primary">{latestPoint.highlight}</span>
      </div>
    </div>
  );
}

export const GrowthTrendsChart = React.memo(GrowthTrendsChartBase);

function CustomTrendTooltip({
  active,
  payload,
  prodLabel,
  skillLabel,
  focusLabel,
  tasksLabel,
  hrsUnit,
}: {
  active?: boolean;
  payload?: Array<{ payload?: LocalizedTrendPoint }>;
  prodLabel: string;
  skillLabel: string;
  focusLabel: string;
  tasksLabel: string;
  hrsUnit: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="surface-card z-50 min-w-56 rounded-xl border border-border p-3 text-start shadow-card">
      <div className="border-b border-border/80 pb-2">
        <div className="font-display text-sm font-bold text-foreground">{data.weekLabel}</div>
        <div className="mt-0.5 text-[0.68rem] font-medium text-primary">{data.highlight}</div>
      </div>

      <div className="mt-2.5 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full bg-success" />
            {prodLabel}
          </span>
          <span className="font-bold text-foreground">{data.productivity}%</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full bg-primary" />
            {skillLabel}
          </span>
          <span className="font-bold text-foreground">{data.skillAcquisition}%</span>
        </div>

        <div className="mt-1.5 flex items-center justify-between border-t border-border/60 pt-1.5 text-[0.68rem] text-muted-foreground">
          <span>{focusLabel}</span>
          <span className="font-semibold text-xp">
            {data.focusHours} {hrsUnit}
          </span>
        </div>

        <div className="flex items-center justify-between text-[0.68rem] text-muted-foreground">
          <span>{tasksLabel}</span>
          <span className="font-semibold text-foreground">{data.tasksCompleted}</span>
        </div>
      </div>
    </div>
  );
}
