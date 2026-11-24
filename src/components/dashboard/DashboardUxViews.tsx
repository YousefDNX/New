import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BookOpen,
  CheckSquare,
  Compass,
  Layers,
  Sparkles,
  Timer,
} from "lucide-react";
import { WelcomeBanner } from "./WelcomeBanner";
import { StatsOverview } from "./StatsOverview";
import { PomodoroTimerWidget } from "./PomodoroTimerWidget";
import { InteractiveLifeAreas } from "./InteractiveLifeAreas";
import { TasksWidget } from "./TasksWidget";
import { DailyGoalsWidget } from "./DailyGoalsWidget";
import { ThisWeekGoalsCard } from "./ThisWeekGoalsCard";
import { RecentActivityWidget } from "./RecentActivityWidget";
import { ModuleHub } from "./ModuleHub";
import { UnifiedSearchPanel } from "./UnifiedSearchPanel";
import { DashboardCustomizerBar } from "./DashboardCustomizerBar";
import { useExperienceMode } from "@/lib/experience-mode";
import { usePrefs } from "@/lib/preferences";
import type { Area } from "@/lib/growth";
import type { DashboardWidgetId } from "@/lib/settings";
import type { UiExperienceId } from "@/lib/ui-experiences";

export type DashboardOverviewTab =
  "overview" | "growthmap" | "history" | "journal" | "legacy" | "rahmah";

interface DashboardUxViewProps {
  experience: Exclude<UiExperienceId, "classic">;
  selectedArea: Area | null;
  onSelectArea: (area: Area | null) => void;
  onTabChange: (tab: DashboardOverviewTab) => void;
  hiddenWidgets: Set<DashboardWidgetId>;
  simplified: boolean;
}

export function DashboardUxView({
  experience,
  selectedArea,
  onSelectArea,
  onTabChange,
  hiddenWidgets,
  simplified,
}: DashboardUxViewProps) {
  const { lang, t } = usePrefs();
  const { openSpatialDrawer } = useExperienceMode();
  const isAr = lang === "ar";
  const show = (id: DashboardWidgetId) => !hiddenWidgets.has(id);

  const todayFormatted = new Intl.DateTimeFormat(isAr ? "ar-EG" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  /* ==========================================================================
   * 1. EDITORIAL STUDY JOURNAL — Publication masthead + 2-column briefing
   * ========================================================================== */
  if (experience === "editorial_atelier") {
    return (
      <div data-testid="dashboard-ux-editorial_atelier" className="space-y-8">
        {/* Publication Masthead Strip */}
        <div className="border-b border-border pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
            <span>{isAr ? "العدد اليومي للدراسة والتقدم" : "Daily Study Briefing"}</span>
            <span>{todayFormatted}</span>
          </div>
          <div className="mt-4">{show("welcome") && <WelcomeBanner />}</div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <UnifiedSearchPanel />
            </div>
            {!simplified && (
              <div className="shrink-0">
                <DashboardCustomizerBar />
              </div>
            )}
          </div>
        </div>

        {show("stats") && (
          <section aria-label={t("dash.tab.dashboard")} className="space-y-2.5">
            <div className="text-xs font-semibold text-muted-foreground">
              {isAr ? "01 · مؤشرات التقدم" : "01 · Progress Index"}
            </div>
            <StatsOverview onTabChange={onTabChange} />
          </section>
        )}

        {/* Two-Column Study Briefing */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <div className="border-b border-border pb-2 text-xs font-semibold text-muted-foreground">
              {isAr ? "02 · أولويات اليوم والأهداف" : "02 · Today's Tasks & Goals"}
            </div>
            {show("tasks") && (
              <TasksWidget filterArea={selectedArea} onClearArea={() => onSelectArea(null)} />
            )}
            {show("goals") && (
              <div className="space-y-6">
                <DailyGoalsWidget />
                <ThisWeekGoalsCard />
              </div>
            )}
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="border-b border-border pb-2 text-xs font-semibold text-muted-foreground">
              {isAr ? "03 · جلسة التركيز والمجالات" : "03 · Focus Session & Domains"}
            </div>
            {show("pomodoro") && <PomodoroTimerWidget />}
            {show("areas") && (
              <InteractiveLifeAreas selectedArea={selectedArea} onSelectArea={onSelectArea} />
            )}
            {show("activity") && <RecentActivityWidget />}
          </div>
        </div>

        {show("hub") && (
          <section className="space-y-4 border-t border-border pt-6">
            <div className="text-xs font-semibold text-muted-foreground">
              {isAr ? "04 · دليل الاستوديوهات الكامل" : "04 · Full Studio Directory"}
            </div>
            <ModuleHub />
          </section>
        )}
      </div>
    );
  }

  /* ==========================================================================
   * 2. MODE B: COMMAND CENTER / WORKSPACE — Bento-Box Dashboard Grid + Internal Scroll Panes
   * ========================================================================== */
  if (experience === "command_os") {
    return (
      <div data-testid="dashboard-ux-command_os" className="space-y-4">
        {/* OS Command Action Bar */}
        <div className="surface-card flex flex-col gap-3 p-3.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <UnifiedSearchPanel />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("nexora:open-command-palette"))}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <span>{isAr ? "لوحة الأوامر" : "Command Palette"}</span>
              <kbd className="rounded border border-primary/30 bg-surface px-1 font-mono text-[10px]">
                ⌘K
              </kbd>
            </button>
            <Link
              to="/app/ai"
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <Sparkles className="size-3.5 text-primary" />
              <span>{t("dash.qa.ai")}</span>
            </Link>
            <Link
              to="/app/study"
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <BookOpen className="size-3.5 text-primary" />
              <span>{t("dash.qa.study")}</span>
            </Link>
            {!simplified && <DashboardCustomizerBar />}
          </div>
        </div>

        {/* True Bento-Box Workspace Grid */}
        <div
          data-testid="command-bento-grid"
          className="grid grid-cols-1 gap-4 md:grid-cols-12 auto-rows-min"
        >
          {show("welcome") && (
            <div className="md:col-span-7">
              <WelcomeBanner />
            </div>
          )}
          {show("pomodoro") && (
            <div className="md:col-span-5">
              <PomodoroTimerWidget />
            </div>
          )}

          {show("stats") && (
            <div className="md:col-span-12">
              <StatsOverview onTabChange={onTabChange} />
            </div>
          )}

          {/* Kanban Tasks Bento Panel (wide) */}
          {show("tasks") && (
            <div className="md:col-span-8 md:max-h-[460px] md:overflow-y-auto">
              <TasksWidget filterArea={selectedArea} onClearArea={() => onSelectArea(null)} />
            </div>
          )}

          {/* Goals & Weekly Velocity Bento Column */}
          <div className="space-y-4 md:col-span-4 md:max-h-[460px] md:overflow-y-auto">
            {show("goals") && <DailyGoalsWidget />}
            {show("goals") && <ThisWeekGoalsCard />}
          </div>

          {show("areas") && (
            <div className="md:col-span-6 md:max-h-[420px] md:overflow-y-auto">
              <InteractiveLifeAreas selectedArea={selectedArea} onSelectArea={onSelectArea} />
            </div>
          )}

          {show("activity") && (
            <div className="md:col-span-6 md:max-h-[420px] md:overflow-y-auto">
              <RecentActivityWidget />
            </div>
          )}
        </div>

        {show("hub") && (
          <section className="space-y-3 pt-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Layers className="size-3.5 text-primary" />
              <span>{isAr ? "تطبيقات المنصة المثبتة" : "Installed Workspace Apps"}</span>
            </div>
            <ModuleHub />
          </section>
        )}
      </div>
    );
  }

  /* ==========================================================================
   * 3. MODE C: SPATIAL / INTERACTIVE — Swipe Carousels + Master-Detail + Drawer + 1-2-3 Stage
   * ========================================================================== */
  return (
    <div data-testid="dashboard-ux-focus_deck" className="space-y-7">
      {/* Horizontal Swipeable Focus Stage Strip */}
      <div
        data-testid="spatial-focus-carousel"
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2"
      >
        <a
          href="#focus-step-1"
          className="surface-card flex min-w-[210px] shrink-0 snap-start items-center gap-2.5 p-3.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <Compass className="size-4 shrink-0 text-primary" />
          <span>{isAr ? "١ · التركيز والبدء" : "1 · Check-In & Focus"}</span>
        </a>
        <a
          href="#focus-step-2"
          className="surface-card flex min-w-[210px] shrink-0 snap-start items-center gap-2.5 p-3.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <CheckSquare className="size-4 shrink-0 text-primary" />
          <span>{isAr ? "٢ · القائمة التفصيلية" : "2 · Master-Detail Priorities"}</span>
        </a>
        <a
          href="#focus-step-3"
          className="surface-card flex min-w-[210px] shrink-0 snap-start items-center gap-2.5 p-3.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <ArrowUpRight className="size-4 shrink-0 text-primary" />
          <span>{isAr ? "٣ · الاستوديوهات الأفقية" : "3 · Swipeable Studios"}</span>
        </a>
        <button
          type="button"
          onClick={() =>
            openSpatialDrawer({
              title: isAr ? "موجز الجلسة المكانية" : "Spatial Workspace Briefing",
              meta: "Mode C · Spatial / Interactive",
              subtitle: todayFormatted,
              body: (
                <div className="space-y-4">
                  <StatsOverview onTabChange={onTabChange} />
                  <InteractiveLifeAreas selectedArea={selectedArea} onSelectArea={onSelectArea} />
                </div>
              ),
            })
          }
          className="surface-card flex min-w-[210px] shrink-0 snap-start items-center gap-2.5 border-primary/35 bg-primary/8 p-3.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
        >
          <Sparkles className="size-4 shrink-0" />
          <span>{isAr ? "فتح الدرج التفصيلي" : "Open Live Drawer"}</span>
        </button>
        {!simplified && (
          <div className="shrink-0 snap-start flex items-center">
            <DashboardCustomizerBar />
          </div>
        )}
      </div>

      <UnifiedSearchPanel />

      {/* Step 1: Check-In & Focus */}
      <section id="focus-step-1" className="scroll-mt-20 space-y-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Timer className="size-4" />
          <span>{isAr ? "الخطوة ١ — التوازن وجلسة التركيز" : "Step 1 — Orientation & Focus"}</span>
        </div>
        {show("welcome") && <WelcomeBanner />}
        {show("stats") && <StatsOverview onTabChange={onTabChange} />}
        {show("pomodoro") && <PomodoroTimerWidget />}
      </section>

      {/* Step 2: Master-Detail Tasks & Daily Balance */}
      <section id="focus-step-2" className="scroll-mt-20 space-y-5 border-t border-border/70 pt-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <CheckSquare className="size-4" />
          <span>
            {isAr ? "الخطوة ٢ — الأولويات بالعرض المنقسم" : "Step 2 — Master-Detail Priorities"}
          </span>
        </div>
        <div className="space-y-5">
          {show("tasks") && (
            <TasksWidget filterArea={selectedArea} onClearArea={() => onSelectArea(null)} />
          )}
          {show("goals") && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <DailyGoalsWidget />
              <ThisWeekGoalsCard />
            </div>
          )}
        </div>
        {show("areas") && (
          <InteractiveLifeAreas selectedArea={selectedArea} onSelectArea={onSelectArea} />
        )}
      </section>

      {/* Step 3: Swipeable Horizontal Studio Carousel */}
      <section id="focus-step-3" className="scroll-mt-20 space-y-5 border-t border-border/70 pt-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Sparkles className="size-4" />
          <span>
            {isAr ? "الخطوة ٣ — تصفح الاستوديوهات أفقياً" : "Step 3 — Swipeable Learning Studios"}
          </span>
        </div>
        {show("hub") && <ModuleHub />}
        {show("activity") && <RecentActivityWidget />}
      </section>
    </div>
  );
}
