import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  parseISO,
  startOfMonth,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  AlertCircle,
  BookOpen,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Layers,
  NotebookPen,
  Plus,
  Target,
} from "lucide-react";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModernSelect } from "@/components/ui/modern-select";
import { useToast } from "@/components/common/ToastProvider";
import { downloadTextFile } from "@/lib/safe-file";
import {
  useFocusSessions,
  useJournalActions,
  useJournalEntries,
  useQuizAttempts,
  useStudyItems,
} from "@/hooks/use-modules";
import { useGoals, useTaskActions, useTasks } from "@/hooks/use-nexora";
import {
  buildCalendarMonthGrid,
  buildCalendarWeekGrid,
  computeWeeklyStudyProgress,
  formatDeadlinesIcsExport,
  getOrderedWeekdayLabels,
  getUpcomingDeadlines,
  normalizeCalendarItems,
  summarizeCalendarMonth,
  type CalendarEventFilter,
  type CalendarViewMode,
} from "@/lib/calendar";
import { formatDate, formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import { BRAND } from "@/config/brand";

export function InteractiveCalendar() {
  const { t, lang, locale } = usePrefs();
  const toast = useToast();
  const { data: tasks = [] } = useTasks();
  const { completeTask, addTask, updateTask } = useTaskActions();
  const { data: goals = [] } = useGoals();
  const { data: focusSessions = [] } = useFocusSessions();
  const { data: quizAttempts = [] } = useQuizAttempts();
  const { data: journalEntries = [] } = useJournalEntries();
  const { addJournalEntry } = useJournalActions();
  const { data: studyItems = [] } = useStudyItems();

  const todayIso = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()));
  const [selectedDayIso, setSelectedDayIso] = useState(todayIso);
  const [filter, setFilter] = useState<CalendarEventFilter>("all");
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [weeklyTargetMinutes, setWeeklyTargetMinutes] = useState(180);

  // Inline quick-add deadline form
  const [quickTitle, setQuickTitle] = useState("");
  const [quickPriority, setQuickPriority] = useState<"low" | "medium" | "high">("medium");
  const [addingDeadline, setAddingDeadline] = useState(false);

  // Quick journal log inside day inspector
  const [showQuickJournal, setShowQuickJournal] = useState(false);
  const [quickJournalTitle, setQuickJournalTitle] = useState("");
  const [quickJournalBody, setQuickJournalBody] = useState("");
  const [savingJournal, setSavingJournal] = useState(false);

  const localeTag =
    lang === "ar"
      ? "ar-KW"
      : lang === "ja"
        ? "ja-JP"
        : lang === "fr"
          ? "fr-FR"
          : lang === "de"
            ? "de-DE"
            : lang === "zh-CN"
              ? "zh-CN"
              : lang === "ko"
                ? "ko-KR"
                : "en-US";

  const weekdayLabels = useMemo(
    () => getOrderedWeekdayLabels(locale.firstDayOfWeek, localeTag),
    [locale.firstDayOfWeek, localeTag],
  );

  const monthCells = useMemo(
    () =>
      buildCalendarMonthGrid({
        monthDate,
        firstDayOfWeek: locale.firstDayOfWeek,
        tasks,
        goals,
        focusSessions,
        quizAttempts,
        journalEntries,
        studyItems,
        todayIso,
      }),
    [
      monthDate,
      locale.firstDayOfWeek,
      tasks,
      goals,
      focusSessions,
      quizAttempts,
      journalEntries,
      studyItems,
      todayIso,
    ],
  );

  const weekCells = useMemo(
    () =>
      buildCalendarWeekGrid({
        focusDate: parseISO(selectedDayIso),
        firstDayOfWeek: locale.firstDayOfWeek,
        tasks,
        goals,
        focusSessions,
        quizAttempts,
        journalEntries,
        studyItems,
        todayIso,
      }),
    [
      selectedDayIso,
      locale.firstDayOfWeek,
      tasks,
      goals,
      focusSessions,
      quizAttempts,
      journalEntries,
      studyItems,
      todayIso,
    ],
  );

  const visibleCells = viewMode === "week" ? weekCells : monthCells;
  const overview = useMemo(() => summarizeCalendarMonth(monthCells), [monthCells]);
  const weeklyProgress = useMemo(
    () =>
      computeWeeklyStudyProgress({
        focusSessions,
        quizAttempts,
        firstDayOfWeek: locale.firstDayOfWeek,
        weeklyTargetMinutes,
      }),
    [focusSessions, quizAttempts, locale.firstDayOfWeek, weeklyTargetMinutes],
  );

  const upcomingDeadlines = useMemo(
    () =>
      getUpcomingDeadlines({
        tasks,
        goals,
        todayIso,
        horizonDays: 30,
      }),
    [tasks, goals, todayIso],
  );

  const allDeadlinesForIcs = useMemo(
    () =>
      normalizeCalendarItems({
        tasks,
        goals,
        focusSessions: [],
        quizAttempts: [],
        todayIso,
      }).deadlines,
    [tasks, goals, todayIso],
  );

  const selectedCell = useMemo(
    () =>
      visibleCells.find((c) => c.iso === selectedDayIso) ??
      monthCells.find((c) => c.iso === selectedDayIso) ??
      weekCells.find((c) => c.iso === selectedDayIso) ??
      null,
    [visibleCells, monthCells, weekCells, selectedDayIso],
  );

  const selectedDayJournals = useMemo(
    () => journalEntries.filter((j) => j.entry_date.slice(0, 10) === selectedDayIso),
    [journalEntries, selectedDayIso],
  );

  const monthHeading = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(localeTag, {
        month: "long",
        year: "numeric",
      }).format(monthDate);
    } catch {
      return format(monthDate, "MMMM yyyy");
    }
  }, [localeTag, monthDate]);

  const handleJumpToday = () => {
    const now = new Date();
    setMonthDate(startOfMonth(now));
    setSelectedDayIso(format(now, "yyyy-MM-dd"));
  };

  const handlePrevPeriod = () => {
    if (viewMode === "week") {
      const next = subWeeks(parseISO(selectedDayIso), 1);
      setSelectedDayIso(format(next, "yyyy-MM-dd"));
      setMonthDate(startOfMonth(next));
    } else {
      setMonthDate((d) => subMonths(d, 1));
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === "week") {
      const next = addWeeks(parseISO(selectedDayIso), 1);
      setSelectedDayIso(format(next, "yyyy-MM-dd"));
      setMonthDate(startOfMonth(next));
    } else {
      setMonthDate((d) => addMonths(d, 1));
    }
  };

  const handleSelectDay = (iso: string, inCurrentMonth: boolean) => {
    setSelectedDayIso(iso);
    if (!inCurrentMonth) {
      const [y, m] = iso.split("-").map(Number);
      if (y && m) {
        setMonthDate(new Date(y, m - 1, 1));
      }
    }
  };

  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = format(subDays(parseISO(selectedDayIso), 1), "yyyy-MM-dd");
      handleSelectDay(prev, prev.slice(0, 7) === format(monthDate, "yyyy-MM"));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = format(addDays(parseISO(selectedDayIso), 1), "yyyy-MM-dd");
      handleSelectDay(next, next.slice(0, 7) === format(monthDate, "yyyy-MM"));
    }
  };

  const handleQuickAddDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    setAddingDeadline(true);
    try {
      await addTask({
        title: quickTitle.trim(),
        priority: quickPriority,
        area: "academic",
        due_at: new Date(`${selectedDayIso}T12:00:00Z`).toISOString(),
      });
      setQuickTitle("");
      toast.success(t("dash.tasks.toastAdd"));
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    } finally {
      setAddingDeadline(false);
    }
  };

  const handleQuickLogJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickJournalTitle.trim() || !quickJournalBody.trim()) return;
    setSavingJournal(true);
    try {
      await addJournalEntry({
        entryDate: selectedDayIso,
        title: quickJournalTitle.trim(),
        reflection: quickJournalBody.trim(),
        area: "growth",
        mood: "reflective",
      });
      setQuickJournalTitle("");
      setQuickJournalBody("");
      setShowQuickJournal(false);
      toast.success(t("journal.toastSaved"));
    } catch {
      toast.error(t("journal.toastErr"));
    } finally {
      setSavingJournal(false);
    }
  };

  const handleExportIcs = () => {
    if (allDeadlinesForIcs.length === 0) return;
    const ics = formatDeadlinesIcsExport(allDeadlinesForIcs);
    downloadTextFile(
      ics,
      `${BRAND.shortName.toLowerCase()}-deadlines-${todayIso}.ics`,
      "text/calendar;charset=utf-8",
    );
  };

  const filterOptions: Array<{ id: CalendarEventFilter; label: string }> = [
    { id: "all", label: t("cal.filter.all") },
    { id: "deadlines", label: t("cal.filter.deadlines") },
    { id: "study", label: t("cal.filter.study") },
  ];

  const showDeadlines = filter === "all" || filter === "deadlines";
  const showStudy = filter === "all" || filter === "study";

  return (
    <div data-testid="interactive-calendar" className="space-y-6">
      {/* Header + Filter & View Controls + Monthly Summary */}
      <div className="surface-card space-y-4 p-5">
        <div className="flex flex-col justify-between gap-4 border-b border-border/80 pb-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-4.5 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground">{t("cal.title")}</h2>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("cal.sub")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FeatureGuideTrigger featureId="productivity-calendar" />
            {/* Month / Week / Agenda Switcher */}
            <div className="flex gap-1 rounded-lg border border-border bg-surface-2 p-1">
              {(["month", "week", "agenda"] as const).map((vm) => (
                <button
                  key={vm}
                  type="button"
                  onClick={() => setViewMode(vm)}
                  data-testid={`cal-view-${vm}`}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                    viewMode === vm
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(`cal.view.${vm}`)}
                </button>
              ))}
            </div>

            {/* Event Type Filter */}
            <div
              className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface-2 p-1"
              role="tablist"
            >
              {filterOptions.map((opt) => {
                const active = filter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(opt.id)}
                    data-testid={`cal-filter-${opt.id}`}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleExportIcs}
              disabled={allDeadlinesForIcs.length === 0}
              data-testid="cal-export-ics-btn"
            >
              <Download className="size-3.5" />
              <span>{t("cal.exportIcs")}</span>
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="text-[0.7rem] font-medium text-muted-foreground">
              {t("cal.stat.focusMin")}
            </div>
            <div className="mt-0.5 font-display text-xl font-bold tabular-nums text-primary">
              {formatNumber(overview.totalFocusMinutes, lang)} {t("pomo.minutesUnit")}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="text-[0.7rem] font-medium text-muted-foreground">
              {t("cal.stat.sessions")}
            </div>
            <div className="mt-0.5 font-display text-xl font-bold tabular-nums text-foreground">
              {formatNumber(overview.studySessionCount, lang)}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="text-[0.7rem] font-medium text-muted-foreground">
              {t("cal.stat.upcoming")}
            </div>
            <div className="mt-0.5 font-display text-xl font-bold tabular-nums text-foreground">
              {formatNumber(overview.upcomingDeadlinesCount, lang)}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
            <div className="text-[0.7rem] font-medium text-muted-foreground">
              {t("cal.stat.overdue")}
            </div>
            <div
              className={`mt-0.5 font-display text-xl font-bold tabular-nums ${
                overview.overdueDeadlinesCount > 0 ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {formatNumber(overview.overdueDeadlinesCount, lang)}
            </div>
          </div>
        </div>

        {/* Weekly Study Target Bar */}
        <div className="space-y-1.5 border-t border-border/70 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-foreground">{t("cal.weeklyGoal")}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono tabular-nums text-primary">
                {formatNumber(weeklyProgress.minutesCompleted, lang)} /{" "}
                {formatNumber(weeklyProgress.targetMinutes, lang)} {t("pomo.minutesUnit")} (
                {formatNumber(weeklyProgress.pct, lang)}%)
              </span>
              <ModernSelect
                size="sm"
                ariaLabel={t("cal.weeklyGoal")}
                value={String(weeklyTargetMinutes)}
                onValueChange={(v) => setWeeklyTargetMinutes(Number(v))}
                className="w-auto min-w-[100px]"
                options={[
                  { value: "120", label: `120 ${t("pomo.minutesUnit")}` },
                  { value: "180", label: `180 ${t("pomo.minutesUnit")}` },
                  { value: "300", label: `300 ${t("pomo.minutesUnit")}` },
                ]}
              />
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-sm bg-surface-2">
            <div
              className="h-full bg-gradient-primary transition-all duration-300"
              style={{ width: `${weeklyProgress.pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Calendar Grid + Selected Day Inspector */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div
          className="surface-card space-y-4 p-5 lg:col-span-8"
          tabIndex={0}
          onKeyDown={handleGridKeyDown}
        >
          <div className="flex items-center justify-between gap-3">
            <h3
              data-testid="cal-month-heading"
              className="font-display text-base font-bold text-foreground sm:text-lg"
            >
              {monthHeading}
            </h3>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handlePrevPeriod}
                aria-label={t("cal.prevMonth")}
                data-testid="cal-prev-btn"
              >
                <ChevronLeft className="size-4 rtl-flip" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleJumpToday}
                data-testid="cal-today-btn"
              >
                {t("prod.cal.today")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleNextPeriod}
                aria-label={t("cal.nextMonth")}
                data-testid="cal-next-btn"
              >
                <ChevronRight className="size-4 rtl-flip" />
              </Button>
            </div>
          </div>

          {viewMode === "agenda" ? (
            <div className="space-y-2.5" data-testid="cal-agenda-list">
              {upcomingDeadlines.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  {t("cal.upcomingEmpty")}
                </p>
              ) : (
                upcomingDeadlines.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectDay(item.dateIso, false)}
                      className="min-w-0 flex-1 text-start"
                    >
                      <div className="font-semibold text-foreground">{item.title}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-[0.68rem] text-muted-foreground">
                        <span className={item.overdue ? "font-semibold text-destructive" : ""}>
                          {formatDate(
                            `${item.dateIso}T12:00:00Z`,
                            { lang, calendar: locale.calendar },
                            "medium",
                          )}
                        </span>
                        {item.subject && <span>· {item.subject}</span>}
                        {item.priority && (
                          <span>· {t(`dash.tasks.priority.${item.priority}`)}</span>
                        )}
                      </div>
                    </button>
                    {item.kind === "task" && item.sourceTask && item.status === "open" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2.5 text-[0.7rem]"
                        onClick={() => completeTask(item.sourceTask!, 25)}
                      >
                        <CheckCircle2 className="size-3 text-success" />
                        <span>{t("tasks.done")}</span>
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {/* Weekday Headers */}
              <div
                className="grid grid-cols-7 gap-1.5 text-center"
                data-testid="cal-weekday-headers"
              >
                {weekdayLabels.map((label, idx) => (
                  <div
                    key={`${label}-${idx}`}
                    className="py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Day Cells (Month or 7-day Week) */}
              <div className="grid grid-cols-7 gap-1.5" data-testid="cal-grid">
                {visibleCells.map((cell) => {
                  const isSelected = cell.iso === selectedDayIso;
                  const hasDeadlines = showDeadlines && cell.deadlines.length > 0;
                  const hasStudy = showStudy && cell.studySessions.length > 0;
                  const heatTint =
                    cell.heatLevel >= 3
                      ? "bg-primary/15"
                      : cell.heatLevel >= 1
                        ? "bg-primary/5"
                        : "bg-surface-2";

                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      onClick={() => handleSelectDay(cell.iso, cell.inCurrentMonth)}
                      data-testid={`cal-day-${cell.iso}`}
                      aria-pressed={isSelected}
                      className={`flex ${viewMode === "week" ? "min-h-32" : "min-h-18 sm:min-h-20"} flex-col justify-between rounded-lg border p-1.5 text-start text-xs transition-colors sm:p-2 ${
                        isSelected
                          ? "border-primary bg-primary/15 text-foreground"
                          : cell.isToday
                            ? `border-primary/50 ${heatTint} text-foreground`
                            : cell.inCurrentMonth || viewMode === "week"
                              ? `border-border ${heatTint} text-foreground hover:border-primary/40`
                              : "border-border/40 bg-surface-2/40 text-muted-foreground/60 hover:border-border"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-1">
                        <span
                          className={`font-semibold tabular-nums ${cell.isToday ? "text-primary" : ""}`}
                        >
                          {formatNumber(cell.dayNumber, lang)}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {cell.journalEntriesCount > 0 && (
                            <NotebookPen
                              className="size-3 text-xp"
                              aria-label={t("cal.journalBadge")}
                            />
                          )}
                          {cell.dueFlashcardsCount > 0 && (
                            <Layers
                              className="size-3 text-primary"
                              aria-label={t("cal.dueCards")}
                            />
                          )}
                          {cell.overdueDeadlinesCount > 0 && showDeadlines && (
                            <AlertCircle className="size-3 text-destructive" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-0.5 text-[0.65rem] tabular-nums">
                        {hasDeadlines && (
                          <div
                            className={`truncate font-semibold ${
                              cell.overdueDeadlinesCount > 0
                                ? "text-destructive"
                                : cell.openDeadlinesCount > 0
                                  ? "text-xp"
                                  : "text-success"
                            }`}
                          >
                            {formatNumber(cell.deadlines.length, lang)}{" "}
                            {t("cal.filter.deadlines").toLowerCase()}
                          </div>
                        )}
                        {hasStudy && (
                          <div className="truncate font-medium text-primary">
                            {formatNumber(cell.studyMinutesTotal, lang)}
                            {t("pomo.minutesUnit")}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Selected Day Inspector + Quick-Add + Quick Journal + Upcoming Agenda */}
        <div className="space-y-4 lg:col-span-4">
          <div className="surface-card space-y-4 p-5" data-testid="cal-day-inspector">
            <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-2.5">
              <h3 className="font-display text-sm font-bold text-foreground">
                {formatDate(
                  `${selectedDayIso}T12:00:00Z`,
                  { lang, calendar: locale.calendar },
                  "long",
                )}
              </h3>
              {selectedCell && selectedCell.dueFlashcardsCount > 0 && (
                <span className="text-[0.68rem] font-semibold tabular-nums text-primary">
                  {formatNumber(selectedCell.dueFlashcardsCount, lang)} {t("cal.dueCards")}
                </span>
              )}
            </div>

            {/* Deadlines on selected day */}
            {showDeadlines && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-foreground">
                  {t("cal.deadlinesSection")}
                </div>
                {!selectedCell || selectedCell.deadlines.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t("cal.noDeadlines")}</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCell.deadlines.map((item) => (
                      <div
                        key={item.id}
                        className="space-y-2 rounded-lg border border-border bg-surface-2 p-2.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div
                              className={`font-semibold ${
                                item.status === "done"
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {item.title}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 text-[0.68rem] text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                {item.kind === "goal" ? (
                                  <Target className="size-3 text-primary" />
                                ) : (
                                  <CheckCircle2 className="size-3 text-xp" />
                                )}
                                {item.kind === "goal" ? t("cal.kind.goal") : t("cal.kind.task")}
                              </span>
                              {item.subject && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>{item.subject}</span>
                                </>
                              )}
                              {item.overdue && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-semibold text-destructive">
                                    {t("cal.overdueBadge")}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {item.kind === "task" && item.sourceTask && item.status === "open" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 shrink-0 px-2 text-[0.68rem]"
                              onClick={() => completeTask(item.sourceTask!, 25)}
                            >
                              <CheckCircle2 className="size-3 text-success" />
                              <span>{t("tasks.done")}</span>
                            </Button>
                          )}
                        </div>

                        {/* Inline reschedule date for open tasks */}
                        {item.kind === "task" && item.sourceTask && item.status === "open" && (
                          <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-1.5 text-[0.68rem]">
                            <label htmlFor={`resched-${item.id}`} className="text-muted-foreground">
                              {t("cal.reschedule")}
                            </label>
                            <input
                              id={`resched-${item.id}`}
                              type="date"
                              value={item.dateIso}
                              onChange={async (e) => {
                                const nextIso = e.target.value;
                                if (!nextIso || !item.sourceTask) return;
                                await updateTask(item.sourceTask, {
                                  due_at: new Date(`${nextIso}T12:00:00Z`).toISOString(),
                                });
                                toast.success(t("cal.rescheduled"));
                              }}
                              className="h-6 rounded border border-input bg-surface px-1.5 text-[0.68rem] text-foreground"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Study sessions on selected day */}
            {showStudy && (
              <div className="space-y-2 border-t border-border/70 pt-3">
                <div className="text-xs font-semibold text-foreground">{t("cal.studySection")}</div>
                {!selectedCell || selectedCell.studySessions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t("cal.noStudy")}</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCell.studySessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-foreground">
                            {session.title}
                          </div>
                          <div className="flex items-center gap-1.5 text-[0.68rem] text-muted-foreground">
                            {session.kind === "quiz" ? (
                              <BookOpen className="size-3 text-primary" />
                            ) : (
                              <Clock className="size-3 text-primary" />
                            )}
                            <span>
                              {session.kind === "quiz" ? t("cal.kind.quiz") : t("cal.kind.focus")}
                            </span>
                            {session.subject && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{session.subject}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <span className="shrink-0 font-bold tabular-nums text-primary">
                          {session.kind === "quiz" && typeof session.scorePct === "number"
                            ? `${formatNumber(session.scorePct, lang)}%`
                            : `${formatNumber(session.durationMinutes, lang)} ${t("pomo.minutesUnit")}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Journal reflections on selected day + quick log toggle */}
            <div className="space-y-2 border-t border-border/70 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  {t("cal.journalBadge")} ({formatNumber(selectedDayJournals.length, lang)})
                </span>
                <button
                  type="button"
                  onClick={() => setShowQuickJournal((s) => !s)}
                  className="text-[0.7rem] font-semibold text-primary hover:underline"
                >
                  {t("cal.logJournal")}
                </button>
              </div>
              {selectedDayJournals.map((j) => (
                <div
                  key={j.id}
                  className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs"
                >
                  <div className="font-semibold text-foreground">{j.title}</div>
                  <p className="mt-0.5 line-clamp-2 text-[0.7rem] text-muted-foreground">
                    {j.reflection}
                  </p>
                </div>
              ))}
              {showQuickJournal && (
                <form onSubmit={handleQuickLogJournal} className="space-y-2 pt-1">
                  <Input
                    value={quickJournalTitle}
                    onChange={(e) => setQuickJournalTitle(e.target.value)}
                    placeholder={t("journal.field.titlePh")}
                    className="h-8 text-xs"
                    required
                  />
                  <textarea
                    rows={2}
                    value={quickJournalBody}
                    onChange={(e) => setQuickJournalBody(e.target.value)}
                    placeholder={t("journal.field.reflectionPh")}
                    required
                    className="w-full rounded-md border border-input bg-surface-2 px-2.5 py-1.5 text-xs text-foreground"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    disabled={savingJournal}
                    className="h-7 w-full text-xs"
                  >
                    {t("journal.save")}
                  </Button>
                </form>
              )}
            </div>

            {/* Quick-add deadline for selected date */}
            <form
              onSubmit={handleQuickAddDeadline}
              className="space-y-2 border-t border-border/70 pt-3"
            >
              <div className="text-xs font-semibold text-foreground">{t("cal.quickAddTitle")}</div>
              <div className="flex gap-1.5">
                <Input
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder={t("cal.quickAddPh")}
                  aria-label={t("cal.quickAddTitle")}
                  className="h-8 text-xs"
                />
                <ModernSelect
                  size="sm"
                  ariaLabel={t("cal.priority")}
                  value={quickPriority}
                  onValueChange={(v) => setQuickPriority(v as "low" | "medium" | "high")}
                  className="w-auto min-w-[96px]"
                  options={[
                    { value: "high", label: t("dash.tasks.priority.high") },
                    { value: "medium", label: t("dash.tasks.priority.medium") },
                    { value: "low", label: t("dash.tasks.priority.low") },
                  ]}
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  disabled={addingDeadline || !quickTitle.trim()}
                  className="h-8 shrink-0 text-xs"
                >
                  <Plus className="size-3.5" />
                  <span>{t("common.add")}</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Upcoming 14-day agenda */}
          <div className="surface-card space-y-2.5 p-4" data-testid="cal-upcoming-agenda">
            <div className="text-xs font-bold text-foreground">{t("cal.upcomingAgenda")}</div>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t("cal.upcomingEmpty")}</p>
            ) : (
              <div className="space-y-1.5">
                {upcomingDeadlines.slice(0, 6).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectDay(item.dateIso, false)}
                    className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-surface-2 px-2.5 py-2 text-start text-xs transition-colors hover:border-primary/40"
                  >
                    <span className="truncate font-medium text-foreground">{item.title}</span>
                    <span
                      className={`shrink-0 font-semibold tabular-nums ${
                        item.overdue ? "text-destructive" : "text-primary"
                      }`}
                    >
                      {formatDate(
                        `${item.dateIso}T12:00:00Z`,
                        { lang, calendar: locale.calendar },
                        "short",
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
