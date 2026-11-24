import React, { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock, Flame, Sparkles, Trophy } from "lucide-react";
import {
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { useActivityEvents, useTasks } from "@/hooks/use-nexora";
import { useFocusSessions, useJournalEntries, useStudyItems } from "@/hooks/use-modules";
import {
  computeWeeklyProductivityHeatmap,
  type GrowthHeatmapCell,
  type HeatmapIntensity,
} from "@/lib/growth";
import type { Lang } from "@/lib/i18n/types";
import { formatDate, formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import type { LocalePrefs } from "@/lib/settings";

type HeatmapWindow = 4 | 8 | 12;

interface HeatmapCopy {
  title: string;
  subtitle: string;
  emptyNote: string;
  activeDays: string;
  tasksDone: string;
  focusTime: string;
  peakDay: string;
  noneYet: string;
  less: string;
  more: string;
  weekPrefix: string;
  minutesUnit: string;
  xpEarned: string;
  studyActions: string;
  journalLogs: string;
  scoreLabel: string;
  todayBadge: string;
  upcomingBadge: string;
  levels: [string, string, string, string, string];
  chartAriaLabel: string;
}

const HEATMAP_COPY: Record<Lang, HeatmapCopy> = {
  en: {
    title: "Growth Heatmap",
    subtitle:
      "Weekly productivity calendar grid across tasks, focus sprints, study, and reflections",
    emptyNote:
      "Complete a task, focus sprint, study note, or reflection to light up your calendar grid.",
    activeDays: "Active Days",
    tasksDone: "Tasks Completed",
    focusTime: "Focus Time",
    peakDay: "Peak Day",
    noneYet: "No peak yet",
    less: "Less",
    more: "More",
    weekPrefix: "W",
    minutesUnit: "min",
    xpEarned: "XP Earned",
    studyActions: "Study Actions",
    journalLogs: "Reflections",
    scoreLabel: "Activity Score",
    todayBadge: "Today",
    upcomingBadge: "Upcoming",
    levels: ["Rest (0)", "Light (1)", "Steady (2)", "Strong (3)", "Peak (4)"],
    chartAriaLabel: "Growth Heatmap weekly productivity calendar grid",
  },
  ar: {
    title: "خريطة النمو الحرارية",
    subtitle: "شبكة التقويم الأسبوعية للإنتاجية عبر المهام وجلسات التركيز والدراسة والتأملات",
    emptyNote: "أكمل مهمة أو جلسة تركيز أو ملخصاً دراسياً لتبدأ بإضاءة شبكة التقويم الخاصة بك.",
    activeDays: "الأيام النشطة",
    tasksDone: "المهام المكتملة",
    focusTime: "وقت التركيز",
    peakDay: "يوم الذروة",
    noneYet: "لا توجد ذروة بعد",
    less: "أقل",
    more: "أكثر",
    weekPrefix: "أ",
    minutesUnit: "د",
    xpEarned: "نقاط الخبرة",
    studyActions: "أنشطة الدراسة",
    journalLogs: "التأملات",
    scoreLabel: "مؤشر النشاط",
    todayBadge: "اليوم",
    upcomingBadge: "قادم",
    levels: ["راحة (0)", "خفيف (1)", "منتظم (2)", "قوي (3)", "ذروة (4)"],
    chartAriaLabel: "شبكة تقويم خريطة النمو الحرارية للإنتاجية الأسبوعية",
  },
  ja: {
    title: "成長ヒートマップ",
    subtitle: "課題・集中スプリント・学習・振り返りをまとめた週間生産性カレンダー",
    emptyNote: "課題や集中セッション、学習ノートを完了するとカレンダーが色づきます。",
    activeDays: "活動日数",
    tasksDone: "完了タスク",
    focusTime: "集中時間",
    peakDay: "最高記録日",
    noneYet: "記録なし",
    less: "少",
    more: "多",
    weekPrefix: "W",
    minutesUnit: "分",
    xpEarned: "獲得XP",
    studyActions: "学習アクション",
    journalLogs: "振り返り",
    scoreLabel: "活動スコア",
    todayBadge: "今日",
    upcomingBadge: "予定",
    levels: ["休息 (0)", "軽め (1)", "安定 (2)", "充実 (3)", "最高 (4)"],
    chartAriaLabel: "週間生産性成長ヒートマップカレンダー",
  },
  fr: {
    title: "Carte thermique de croissance",
    subtitle: "Grille hebdomadaire de productivité : tâches, focus, étude et journal",
    emptyNote: "Terminez une tâche, session de focus ou note d'étude pour allumer votre grille.",
    activeDays: "Jours actifs",
    tasksDone: "Tâches terminées",
    focusTime: "Temps de focus",
    peakDay: "Jour record",
    noneYet: "Aucun pic",
    less: "Moins",
    more: "Plus",
    weekPrefix: "S",
    minutesUnit: "min",
    xpEarned: "XP gagnés",
    studyActions: "Actions d'étude",
    journalLogs: "Réflexions",
    scoreLabel: "Score d'activité",
    todayBadge: "Aujourd'hui",
    upcomingBadge: "À venir",
    levels: ["Repos (0)", "Léger (1)", "Régulier (2)", "Fort (3)", "Sommet (4)"],
    chartAriaLabel: "Grille calendaire hebdomadaire de la carte thermique de croissance",
  },
  de: {
    title: "Wachstums-Heatmap",
    subtitle:
      "Wöchentliches Produktivitäts-Kalenderraster über Aufgaben, Fokus, Lernen & Reflexion",
    emptyNote: "Schließe eine Aufgabe, Fokus-Session oder Lernnotiz ab, um dein Raster zu füllen.",
    activeDays: "Aktive Tage",
    tasksDone: "Erledigte Aufgaben",
    focusTime: "Fokuszeit",
    peakDay: "Spitzentag",
    noneYet: "Noch kein Peak",
    less: "Weniger",
    more: "Mehr",
    weekPrefix: "W",
    minutesUnit: "Min",
    xpEarned: "XP erhalten",
    studyActions: "Lernaktionen",
    journalLogs: "Reflexionen",
    scoreLabel: "Aktivitätswert",
    todayBadge: "Heute",
    upcomingBadge: "Kommend",
    levels: ["Ruhe (0)", "Leicht (1)", "Stabil (2)", "Stark (3)", "Spitze (4)"],
    chartAriaLabel: "Wöchentliches Produktivitäts-Kalenderraster der Wachstums-Heatmap",
  },
  "zh-CN": {
    title: "成长热力图",
    subtitle: "汇总任务、专注冲刺、学习记录与每日反思的每周效率日历网格",
    emptyNote: "完成一项任务、专注计时、学习笔记或每日反思即可点亮日历网格。",
    activeDays: "活跃天数",
    tasksDone: "已完成任务",
    focusTime: "专注时长",
    peakDay: "最高活跃日",
    noneYet: "暂无峰值",
    less: "少",
    more: "多",
    weekPrefix: "第",
    minutesUnit: "分钟",
    xpEarned: "获得 XP",
    studyActions: "学习记录",
    journalLogs: "反思日志",
    scoreLabel: "活跃指数",
    todayBadge: "今天",
    upcomingBadge: "未到",
    levels: ["休息 (0)", "轻度 (1)", "稳定 (2)", "高效 (3)", "巅峰 (4)"],
    chartAriaLabel: "每周学习效率成长热力图日历网格",
  },
  ko: {
    title: "성장 히트맵",
    subtitle: "과제, 집중 스프린트, 학습 기록 및 회고를 담은 주간 생산성 캘린더 그리드",
    emptyNote: "작업, 집중 세션, 학습 노트 또는 회고를 완료하면 캘린더가 채워집니다.",
    activeDays: "활동일",
    tasksDone: "완료한 작업",
    focusTime: "집중 시간",
    peakDay: "최고 기록일",
    noneYet: "기록 없음",
    less: "적음",
    more: "많음",
    weekPrefix: "주",
    minutesUnit: "분",
    xpEarned: "획득 XP",
    studyActions: "학습 활동",
    journalLogs: "성찰 기록",
    scoreLabel: "활동 점수",
    todayBadge: "오늘",
    upcomingBadge: "예정",
    levels: ["휴식 (0)", "가벼움 (1)", "꾸준함 (2)", "집중 (3)", "최고 (4)"],
    chartAriaLabel: "주간 생산성 성장 히트맵 캘린더 그리드",
  },
};

function getIntensityFill(intensity: HeatmapIntensity, isFuture: boolean): string {
  if (isFuture) return "color-mix(in oklch, var(--surface-2) 45%, transparent)";
  switch (intensity) {
    case 0:
      return "color-mix(in oklch, var(--surface-2) 86%, var(--border))";
    case 1:
      return "color-mix(in oklch, var(--primary) 26%, var(--surface-2))";
    case 2:
      return "color-mix(in oklch, var(--primary) 50%, var(--surface-2))";
    case 3:
      return "color-mix(in oklch, var(--primary) 76%, var(--surface-2))";
    case 4:
      return "var(--primary)";
  }
}

interface HeatmapShapeProps {
  cx?: number | undefined;
  cy?: number | undefined;
  payload?: GrowthHeatmapCell | undefined;
  weeksCount: number;
}

function HeatmapCellShape({ cx, cy, payload, weeksCount }: HeatmapShapeProps) {
  if (typeof cx !== "number" || typeof cy !== "number" || !payload) return null;
  const size = weeksCount >= 12 ? 18 : weeksCount >= 8 ? 22 : 24;
  const half = size / 2;
  const fill = getIntensityFill(payload.intensity, payload.isFuture);
  const stroke = payload.isToday
    ? "var(--xp)"
    : payload.isFuture
      ? "color-mix(in oklch, var(--border) 40%, transparent)"
      : payload.intensity > 0
        ? "color-mix(in oklch, var(--primary) 55%, var(--border))"
        : "color-mix(in oklch, var(--border) 75%, transparent)";

  return (
    <g>
      <rect
        x={cx - half}
        y={cy - half}
        width={size}
        height={size}
        rx={4}
        ry={4}
        fill={fill}
        stroke={stroke}
        strokeWidth={payload.isToday ? 2 : 1}
        strokeDasharray={payload.isFuture ? "2 2" : undefined}
        className="transition-opacity duration-150 hover:opacity-85"
      >
        <title>
          {`${payload.dateIso}: ${payload.activityScore} pts (${payload.tasksCompleted} tasks, ${payload.focusMinutes}m focus)`}
        </title>
      </rect>
    </g>
  );
}

function GrowthHeatmapBase() {
  const { lang, dir, locale, t } = usePrefs();
  const { data: events = [] } = useActivityEvents(200);
  const { data: tasks = [] } = useTasks();
  const { data: focusSessions = [] } = useFocusSessions();
  const { data: studyItems = [] } = useStudyItems();
  const { data: journalEntries = [] } = useJournalEntries();
  const [weeks, setWeeks] = useState<HeatmapWindow>(12);

  const copy = HEATMAP_COPY[lang] ?? HEATMAP_COPY.en;

  const summary = useMemo(
    () =>
      computeWeeklyProductivityHeatmap({
        events,
        tasks,
        focusSessions,
        studyItems,
        journalEntries,
        weeks,
      }),
    [events, tasks, focusSessions, studyItems, journalEntries, weeks],
  );

  const chartPoints = useMemo(
    () =>
      summary.cells.map((cell) => ({
        ...cell,
        x: cell.weekIndex,
        y: cell.dayOfWeek,
        z: Math.max(10, cell.activityScore),
        dayLabel: t(cell.dayKey),
      })),
    [summary.cells, t],
  );

  const weekTicks = useMemo(() => Array.from({ length: weeks }, (_, idx) => idx), [weeks]);
  const dayTicks = [0, 1, 2, 3, 4, 5, 6];

  const formattedPeakDate = summary.peakDateIso
    ? formatDate(
        `${summary.peakDateIso}T12:00:00Z`,
        {
          lang,
          timezone: locale.timezone,
          dateFormat: locale.dateFormat,
          calendar: locale.calendar,
        },
        "short",
      )
    : copy.noneYet;

  return (
    <section
      data-testid="growth-heatmap"
      aria-label={copy.chartAriaLabel}
      className="surface-card p-5 md:p-6"
    >
      <div className="flex flex-col gap-4 border-b border-border/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">{copy.title}</h2>
            <FeatureGuideTrigger featureId="growth-heatmap" iconOnly />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{copy.subtitle}</p>
        </div>

        <div
          role="group"
          aria-label={copy.title}
          className="flex self-start rounded-lg border border-border bg-surface-2 p-1 text-xs sm:self-auto"
        >
          {([4, 8, 12] as const).map((w) => (
            <button
              key={w}
              type="button"
              data-testid={`heatmap-window-${w}w`}
              aria-pressed={weeks === w}
              onClick={() => setWeeks(w)}
              className={`rounded-md px-2.5 py-1 font-semibold tabular-nums transition-all ${
                weeks === w
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {formatNumber(w, lang)}W
            </button>
          ))}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[0.68rem] font-semibold uppercase tracking-wider">
              {copy.activeDays}
            </span>
            <Flame className="size-3.5 text-xp" />
          </div>
          <div className="mt-1 font-display text-xl font-extrabold tabular-nums text-foreground">
            {formatNumber(summary.activeDays, lang)}{" "}
            <span className="text-xs font-medium text-muted-foreground">
              / {formatNumber(weeks * 7, lang)}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[0.68rem] font-semibold uppercase tracking-wider">
              {copy.tasksDone}
            </span>
            <CheckCircle2 className="size-3.5 text-success" />
          </div>
          <div className="mt-1 font-display text-xl font-extrabold tabular-nums text-foreground">
            {formatNumber(summary.totalTasks, lang)}
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[0.68rem] font-semibold uppercase tracking-wider">
              {copy.focusTime}
            </span>
            <Clock className="size-3.5 text-primary" />
          </div>
          <div className="mt-1 font-display text-xl font-extrabold tabular-nums text-foreground">
            {formatNumber(summary.totalFocusMinutes, lang)}{" "}
            <span className="text-xs font-medium text-muted-foreground">{copy.minutesUnit}</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[0.68rem] font-semibold uppercase tracking-wider">
              {copy.peakDay}
            </span>
            <Trophy className="size-3.5 text-amber-500" />
          </div>
          <div className="mt-1 truncate font-display text-sm font-bold tabular-nums text-foreground">
            {formattedPeakDate}
          </div>
        </div>
      </div>

      {!summary.hasAnyActivity && (
        <div
          data-testid="growth-heatmap-empty"
          className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-border/80 bg-surface-2/40 px-3.5 py-2.5 text-xs text-muted-foreground"
        >
          <Sparkles className="size-4 shrink-0 text-primary" />
          <span>{copy.emptyNote}</span>
        </div>
      )}

      {/* Recharts Weekly Calendar Heatmap Grid */}
      <div className="mt-4 h-60 w-full sm:h-64">
        <ResponsiveContainer width="100%" height="100%" minWidth={220} minHeight={210}>
          <ScatterChart
            margin={
              dir === "rtl"
                ? { top: 12, right: 8, bottom: 8, left: 16 }
                : { top: 12, right: 16, bottom: 8, left: 4 }
            }
          >
            <XAxis
              type="number"
              dataKey="x"
              domain={[-0.6, weeks - 0.4]}
              ticks={weekTicks}
              reversed={dir === "rtl"}
              interval={0}
              axisLine={false}
              tickLine={false}
              stroke="var(--chart-axis)"
              fontSize={11}
              tickFormatter={(val: number) => `${copy.weekPrefix}${formatNumber(val + 1, lang)}`}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[-0.6, 6.6]}
              ticks={dayTicks}
              reversed
              interval={0}
              width={44}
              axisLine={false}
              tickLine={false}
              stroke="var(--chart-axis)"
              fontSize={11}
              tickFormatter={(val: number) => {
                const cell = summary.cells.find((c) => c.dayOfWeek === val);
                return cell ? t(cell.dayKey) : "";
              }}
            />
            <ZAxis type="number" dataKey="z" range={[120, 120]} />
            <Tooltip
              cursor={false}
              content={
                <HeatmapTooltipContent
                  lang={lang}
                  locale={locale}
                  copy={copy}
                  dayTranslator={(k) => t(k)}
                />
              }
            />
            <Scatter
              name={copy.title}
              data={chartPoints}
              isAnimationActive={false}
              shape={(props: unknown) => {
                const p = props as { cx?: number; cy?: number; payload?: GrowthHeatmapCell };
                return (
                  <HeatmapCellShape cx={p.cx} cy={p.cy} payload={p.payload} weeksCount={weeks} />
                );
              }}
            >
              {chartPoints.map((entry) => (
                <Cell
                  key={entry.dateIso}
                  fill={getIntensityFill(entry.intensity, entry.isFuture)}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Explicit Labeled Intensity Scale Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <span>{copy.less}</span>
          {([0, 1, 2, 3, 4] as const).map((lvl) => (
            <span key={lvl} className="inline-flex items-center gap-1">
              <span
                aria-hidden="true"
                className="inline-block size-3.5 rounded-[3px] border border-border/70"
                style={{ backgroundColor: getIntensityFill(lvl, false) }}
              />
              <span className="text-[0.68rem]">{copy.levels[lvl]}</span>
            </span>
          ))}
          <span>{copy.more}</span>
        </div>

        <span className="font-mono text-[0.7rem] tabular-nums text-foreground">
          +{formatNumber(summary.totalXp, lang)} {t("common.xp")}
        </span>
      </div>
    </section>
  );
}

export const GrowthHeatmap = React.memo(GrowthHeatmapBase);

function HeatmapTooltipContent({
  active,
  payload,
  lang,
  locale,
  copy,
  dayTranslator,
}: {
  active?: boolean;
  payload?: Array<{ payload?: GrowthHeatmapCell & { dayLabel?: string } }>;
  lang: Lang;
  locale: LocalePrefs;
  copy: HeatmapCopy;
  dayTranslator: (k: GrowthHeatmapCell["dayKey"]) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const cell = payload[0]?.payload;
  if (!cell) return null;

  const formattedDate = formatDate(
    `${cell.dateIso}T12:00:00Z`,
    {
      lang,
      timezone: locale.timezone,
      dateFormat: locale.dateFormat,
      calendar: locale.calendar,
    },
    "medium",
  );

  return (
    <div className="surface-card z-50 min-w-52 rounded-xl border border-border p-3 text-start shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-2">
        <div>
          <div className="font-display text-xs font-bold text-foreground">
            {dayTranslator(cell.dayKey)} · {formattedDate}
          </div>
          <div className="text-[0.68rem] font-medium text-primary">
            {cell.isFuture
              ? copy.upcomingBadge
              : `${copy.levels[cell.intensity]}${cell.isToday ? ` · ${copy.todayBadge}` : ""}`}
          </div>
        </div>
        <span className="rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-[0.68rem] font-bold tabular-nums text-primary">
          {formatNumber(cell.activityScore, lang)}
        </span>
      </div>

      <div className="mt-2 space-y-1 text-xs tabular-nums">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{copy.tasksDone}</span>
          <span className="font-semibold text-foreground">
            {formatNumber(cell.tasksCompleted, lang)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{copy.focusTime}</span>
          <span className="font-semibold text-foreground">
            {formatNumber(cell.focusMinutes, lang)} {copy.minutesUnit}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{copy.studyActions}</span>
          <span className="font-semibold text-foreground">
            {formatNumber(cell.studyActions, lang)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{copy.journalLogs}</span>
          <span className="font-semibold text-foreground">
            {formatNumber(cell.journalCount, lang)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-border/60 pt-1">
          <span className="text-muted-foreground">{copy.xpEarned}</span>
          <span className="font-bold text-xp">+{formatNumber(cell.xpEarned, lang)} XP</span>
        </div>
      </div>
    </div>
  );
}
