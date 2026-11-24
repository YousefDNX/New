import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFocusActions, useFocusSessions } from "@/hooks/use-modules";
import { useUser } from "@/hooks/use-nexora";
import { SUBJECT_OPTIONS } from "@/lib/settings";
import { useStudentEcosystem } from "@/lib/student-ecosystem";
import {
  createManualStudyBlock,
  saveSmartStudyPlanToFirestore,
  summarizeDailyStudyProgress,
  summarizePlannedVsCompletedByMonth,
  type SmartStudyBlock,
} from "@/lib/study-planner";

function formatHoursAndMinutes(totalMinutes: number): string {
  const safe = Math.max(0, Math.round(totalMinutes));
  const hrs = Math.floor(safe / 60);
  const mins = safe % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface StudyPlannerSuiteProps {
  compactQuickLogOnly?: boolean;
  onDailyTargetChange?: (minutes: number) => void;
}

export function StudyPlannerSuite({
  compactQuickLogOnly = false,
  onDailyTargetChange,
}: StudyPlannerSuiteProps) {
  const { data: user } = useUser();
  const { data: focusSessions = [] } = useFocusSessions();
  const { logFocusSession } = useFocusActions();
  const { state: eco, update: updateEco } = useStudentEcosystem();

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const targetMinutes = eco.smartPlannerConfig.dailyMinutes || 60;
  const blocks = eco.smartPlannerBlocks;

  // Quick Log state
  const [quickTitle, setQuickTitle] = useState("");
  const [quickSubject, setQuickSubject] = useState<string>(SUBJECT_OPTIONS[0]);
  const [quickDuration, setQuickDuration] = useState<number>(30);
  const [quickDate, setQuickDate] = useState<string>(todayIso);
  const [loggingBusy, setLoggingBusy] = useState(false);

  // Manual Planned Session state
  const [planSubject, setPlanSubject] = useState<string>(SUBJECT_OPTIONS[0]);
  const [planTopic, setPlanTopic] = useState("");
  const [planDate, setPlanDate] = useState(todayIso);
  const [planTimeWindow, setPlanTimeWindow] = useState("04:30 – 05:15 PM");
  const [planDuration, setPlanDuration] = useState<number>(45);
  const [planPriority, setPlanPriority] = useState<SmartStudyBlock["priority"]>("medium");

  // Calendar view state
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  });
  const [selectedDayIso, setSelectedDayIso] = useState<string>(todayIso);

  const allFocusSessions = useMemo(() => {
    const localLogs = eco.smartPlannerFocusLogs ?? [];
    const seen = new Set(focusSessions.map((f) => f.id));
    return [...focusSessions, ...localLogs.filter((l) => !seen.has(l.id))];
  }, [focusSessions, eco.smartPlannerFocusLogs]);

  const dailySummary = useMemo(
    () =>
      summarizeDailyStudyProgress({
        blocks,
        focusSessions: allFocusSessions,
        targetMinutes,
        targetDayIso: todayIso,
      }),
    [blocks, allFocusSessions, targetMinutes, todayIso],
  );

  const monthCells = useMemo(
    () =>
      summarizePlannedVsCompletedByMonth({
        monthDate: calendarMonth,
        blocks,
        focusSessions: allFocusSessions,
      }),
    [calendarMonth, blocks, allFocusSessions],
  );

  const selectedDayCell = useMemo(
    () => monthCells.find((c) => c.dayIso === selectedDayIso) ?? null,
    [monthCells, selectedDayIso],
  );

  const monthLabel = useMemo(
    () =>
      calendarMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
    [calendarMonth],
  );

  const handleQuickLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = Math.round(Number(quickDuration));
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 180) {
      toast.error("Please enter a study duration between 1 and 180 minutes.");
      return;
    }
    const title = quickTitle.trim() || `${quickSubject} Study Session`;
    const targetIso = /^\d{4}-\d{2}-\d{2}$/.test(quickDate)
      ? `${quickDate}T12:00:00.000Z`
      : new Date().toISOString();
    setLoggingBusy(true);
    try {
      await logFocusSession({
        title,
        subject: quickSubject,
        area: "academic",
        durationMinutes: minutes,
        createdAtIso: targetIso,
      });
      toast.success(`Logged ${minutes}m of ${quickSubject} (+${minutes >= 1 ? 30 : 0} XP)`);
      setQuickTitle("");
    } catch {
      const localEntry = {
        id: `qlog_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        title,
        subject: quickSubject,
        duration_minutes: minutes,
        completed: true,
        created_at: targetIso,
      };
      updateEco((prev) => ({
        ...prev,
        smartPlannerFocusLogs: [localEntry, ...(prev.smartPlannerFocusLogs ?? [])],
      }));
      toast.success(`Logged ${minutes}m of ${quickSubject} to your Study Planner`);
      setQuickTitle("");
    } finally {
      setLoggingBusy(false);
    }
  };

  const persistBlocks = (nextBlocks: SmartStudyBlock[], nextTargetMin = targetMinutes) => {
    const nextCfg = { ...eco.smartPlannerConfig, dailyMinutes: nextTargetMin };
    updateEco((prev) => ({
      ...prev,
      smartPlannerConfig: nextCfg,
      smartPlannerBlocks: nextBlocks,
    }));
    if (user?.uid) {
      void saveSmartStudyPlanToFirestore({
        userId: user.uid,
        config: nextCfg,
        blocks: nextBlocks,
        engine: "manual_planner",
      });
    }
  };

  const handleCreatePlannedSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTopic.trim()) {
      toast.error("Enter a study topic or focus goal for this session.");
      return;
    }
    const block = createManualStudyBlock({
      dayIso: planDate,
      timeWindow: planTimeWindow,
      subject: planSubject,
      topic: planTopic,
      durationMin: planDuration,
      priority: planPriority,
    });
    const nextBlocks = [block, ...blocks].sort((a, b) => a.dayIso.localeCompare(b.dayIso));
    persistBlocks(nextBlocks);
    setSelectedDayIso(block.dayIso);
    setPlanTopic("");
    toast.success(`Scheduled ${block.durationMin}m ${block.subject} session for ${block.dayLabel}`);
  };

  const handleToggleBlockStatus = (blockId: string, nextStatus: SmartStudyBlock["status"]) => {
    const nextBlocks = blocks.map((b) => (b.id === blockId ? { ...b, status: nextStatus } : b));
    persistBlocks(nextBlocks);
  };

  const handleDeleteBlock = (blockId: string) => {
    const nextBlocks = blocks.filter((b) => b.id !== blockId);
    persistBlocks(nextBlocks);
  };

  const handleTargetChange = (minutes: number) => {
    const safeMin = Math.max(15, Math.min(360, minutes));
    persistBlocks(blocks, safeMin);
    onDailyTargetChange?.(safeMin);
  };

  return (
    <div className="space-y-5" data-testid="study-planner-suite">
      {/* 1. Daily Study Progress Bar */}
      <div className="surface-card space-y-3 p-5" data-testid="daily-study-progress-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Target className="size-4 text-primary" />
              <h3 className="font-display text-base font-bold text-foreground">
                Today&apos;s Study Goal Progress
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Combines logged focus sessions, Quick Logs, and completed planner blocks for today (
              {todayIso}).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="daily-target-select" className="text-xs text-muted-foreground">
              Daily Target
            </Label>
            <select
              id="daily-target-select"
              data-testid="daily-target-select"
              value={String(targetMinutes)}
              onChange={(e) => handleTargetChange(Number(e.target.value))}
              className="h-8 rounded-md border border-input bg-surface-2 px-2 text-xs font-semibold text-foreground"
            >
              <option value="30">30m (0.5h)</option>
              <option value="60">60m (1h)</option>
              <option value="90">90m (1.5h)</option>
              <option value="120">120m (2h)</option>
              <option value="180">180m (3h)</option>
              <option value="240">240m (4h)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
            <span
              className="font-semibold text-foreground tabular-nums"
              data-testid="daily-progress-summary"
            >
              {formatHoursAndMinutes(dailySummary.completedMinutes)} completed of{" "}
              {formatHoursAndMinutes(dailySummary.targetMinutes)} target (
              {dailySummary.completedMinutes} / {dailySummary.targetMinutes} min)
            </span>
            <span className="font-bold text-primary tabular-nums" data-testid="daily-progress-pct">
              {dailySummary.pct}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Daily study goal progress"
            aria-valuenow={dailySummary.pct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-3 w-full overflow-hidden rounded-full bg-surface-2"
          >
            <div
              className="h-full rounded-full bg-gradient-primary transition-all duration-300"
              style={{ width: `${dailySummary.pct}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span>
              Planned today:{" "}
              <strong className="text-foreground">{dailySummary.plannedMinutes}m</strong> ·{" "}
              Completed sessions:{" "}
              <strong className="text-foreground">
                {dailySummary.focusSessionsCount + dailySummary.completedBlocksCount}
              </strong>
            </span>
            <span>
              {dailySummary.remainingMinutes === 0
                ? "Daily study target reached!"
                : `${dailySummary.remainingMinutes} min remaining to hit today's target`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Quick Log Untracked Study Session */}
      <form
        onSubmit={handleQuickLogSubmit}
        className="surface-card space-y-3 p-5"
        data-testid="quick-log-form"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2.5">
          <div>
            <h3 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
              <Clock className="size-4 text-primary" />
              Quick Log Study Session
            </h3>
            <p className="text-xs text-muted-foreground">
              Studied offline or forgot to start the live timer? Manually log duration (1–180 min).
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            {[15, 25, 45, 60, 90].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setQuickDuration(preset)}
                className={`min-h-[32px] rounded-md border px-2 text-xs font-semibold tabular-nums transition-colors ${
                  quickDuration === preset
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                {preset}m
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1 lg:col-span-2">
            <Label htmlFor="ql-title" className="text-xs">
              What did you study?
            </Label>
            <Input
              id="ql-title"
              data-testid="quick-log-title"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="e.g. Algebra practice problems"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="ql-subject" className="text-xs">
              Subject
            </Label>
            <select
              id="ql-subject"
              data-testid="quick-log-subject"
              value={quickSubject}
              onChange={(e) => setQuickSubject(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
            >
              {SUBJECT_OPTIONS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="ql-duration" className="text-xs">
              Duration (min)
            </Label>
            <Input
              id="ql-duration"
              data-testid="quick-log-duration"
              type="number"
              min={1}
              max={180}
              value={quickDuration}
              onChange={(e) => setQuickDuration(Number(e.target.value))}
              className="h-9 text-xs tabular-nums"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="ql-date" className="text-xs">
              Date
            </Label>
            <Input
              id="ql-date"
              data-testid="quick-log-date"
              type="date"
              value={quickDate}
              onChange={(e) => setQuickDate(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            variant="glow"
            disabled={loggingBusy}
            data-testid="quick-log-submit"
            className="min-h-[40px]"
          >
            <Plus className="size-3.5" />
            <span>{loggingBusy ? "Logging..." : "Log Study Session"}</span>
          </Button>
        </div>
      </form>

      {!compactQuickLogOnly && (
        <>
          {/* 3. Create & Manage Daily Study Sessions */}
          <form
            onSubmit={handleCreatePlannedSession}
            className="surface-card space-y-3 p-5"
            data-testid="create-study-session-form"
          >
            <div className="border-b border-border/70 pb-2.5">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
                <Sparkles className="size-4 text-primary" />
                Schedule a Daily Study Session
              </h3>
              <p className="text-xs text-muted-foreground">
                Plan specific upcoming study sessions so your calendar tracks planned vs. completed
                time clearly.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <div className="space-y-1">
                <Label htmlFor="ps-subject" className="text-xs">
                  Subject
                </Label>
                <select
                  id="ps-subject"
                  data-testid="plan-session-subject"
                  value={planSubject}
                  onChange={(e) => setPlanSubject(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
                >
                  {SUBJECT_OPTIONS.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 lg:col-span-2">
                <Label htmlFor="ps-topic" className="text-xs">
                  Topic / Focus Goal
                </Label>
                <Input
                  id="ps-topic"
                  data-testid="plan-session-topic"
                  value={planTopic}
                  onChange={(e) => setPlanTopic(e.target.value)}
                  placeholder="e.g. Chapter 4 Key Vocabulary"
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="ps-date" className="text-xs">
                  Planned Date
                </Label>
                <Input
                  id="ps-date"
                  data-testid="plan-session-date"
                  type="date"
                  value={planDate}
                  onChange={(e) => setPlanDate(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="ps-duration" className="text-xs">
                  Duration (min)
                </Label>
                <Input
                  id="ps-duration"
                  data-testid="plan-session-duration"
                  type="number"
                  min={10}
                  max={180}
                  value={planDuration}
                  onChange={(e) => setPlanDuration(Number(e.target.value))}
                  className="h-9 text-xs tabular-nums"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="ps-priority" className="text-xs">
                  Priority
                </Label>
                <select
                  id="ps-priority"
                  value={planPriority}
                  onChange={(e) => setPlanPriority(e.target.value as SmartStudyBlock["priority"])}
                  className="h-9 w-full rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="ps-window" className="text-xs text-muted-foreground">
                  Time Slot
                </Label>
                <Input
                  id="ps-window"
                  value={planTimeWindow}
                  onChange={(e) => setPlanTimeWindow(e.target.value)}
                  className="h-8 w-44 text-xs"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                data-testid="plan-session-submit"
                className="min-h-[40px]"
              >
                <Plus className="size-3.5" />
                <span>Add Planned Session</span>
              </Button>
            </div>
          </form>

          {/* 4. Planned vs. Completed Calendar View */}
          <div className="grid gap-5 lg:grid-cols-12" data-testid="planned-vs-completed-calendar">
            <div className="surface-card space-y-4 p-5 lg:col-span-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
                    <CalendarDays className="size-4 text-primary" />
                    Planned vs. Completed Study Calendar
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Select any day to inspect scheduled sessions, mark them done, or log focus time.
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    aria-label="Previous month"
                    onClick={() =>
                      setCalendarMonth(
                        (m) => new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() - 1, 1)),
                      )
                    }
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="min-w-28 text-center text-xs font-bold text-foreground">
                    {monthLabel}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    aria-label="Next month"
                    onClick={() =>
                      setCalendarMonth(
                        (m) => new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1)),
                      )
                    }
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {WEEKDAY_HEADERS.map((wd) => (
                  <div key={wd} className="py-1">
                    {wd}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5" data-testid="planner-calendar-grid">
                {monthCells.map((cell) => {
                  const selected = cell.dayIso === selectedDayIso;
                  const isToday = cell.dayIso === todayIso;
                  const goalMet =
                    cell.plannedMinutes > 0 && cell.completedMinutes >= cell.plannedMinutes;

                  return (
                    <button
                      key={cell.dayIso}
                      type="button"
                      onClick={() => setSelectedDayIso(cell.dayIso)}
                      data-testid={`planner-cal-day-${cell.dayIso}`}
                      aria-pressed={selected}
                      className={`flex min-h-18 flex-col justify-between rounded-lg border p-1.5 text-start text-xs transition-colors ${
                        selected
                          ? "border-primary bg-primary/15 text-foreground"
                          : isToday
                            ? "border-primary/50 bg-primary/5 text-foreground"
                            : cell.inCurrentMonth
                              ? "border-border bg-surface-2 text-foreground hover:border-primary/40"
                              : "border-border/40 bg-surface-2/40 text-muted-foreground/60"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span
                          className={`font-semibold tabular-nums ${isToday ? "text-primary" : ""}`}
                        >
                          {cell.dayNumber}
                        </span>
                        {goalMet && <CheckCircle2 className="size-3 text-emerald-500" />}
                      </div>

                      <div className="space-y-0.5 text-[10px] leading-tight tabular-nums">
                        {cell.plannedMinutes > 0 && (
                          <div className="truncate font-medium text-amber-600 dark:text-amber-400">
                            Plan {cell.plannedMinutes}m
                          </div>
                        )}
                        {cell.completedMinutes > 0 && (
                          <div className="truncate font-semibold text-emerald-600 dark:text-emerald-400">
                            Done {cell.completedMinutes}m
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Inspector */}
            <div
              className="surface-card space-y-4 p-5 lg:col-span-4"
              data-testid="planner-day-inspector"
            >
              <div className="border-b border-border/70 pb-2.5">
                <h4 className="font-display text-sm font-bold text-foreground">
                  {selectedDayIso === todayIso ? `Today (${selectedDayIso})` : selectedDayIso}
                </h4>
                <div className="mt-1 flex items-center gap-3 text-xs tabular-nums">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    Planned: {selectedDayCell?.plannedMinutes ?? 0}m
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Completed: {selectedDayCell?.completedMinutes ?? 0}m
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="text-xs font-semibold text-foreground">Planned Sessions</div>
                {!selectedDayCell || selectedDayCell.blocks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No planned blocks for this day yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayCell.blocks.map((b) => (
                      <div
                        key={b.id}
                        className={`rounded-lg border p-2.5 text-xs space-y-2 ${
                          b.status === "completed"
                            ? "border-emerald-500/40 bg-emerald-500/10"
                            : b.status === "missed"
                              ? "border-amber-500/40 bg-amber-500/10"
                              : "border-border bg-surface-2"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-bold text-foreground">
                              {b.subject}: {b.topic}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {b.durationMin}m · {b.timeWindow}
                            </div>
                          </div>
                          <button
                            type="button"
                            aria-label={`Delete ${b.topic}`}
                            onClick={() => handleDeleteBlock(b.id)}
                            className="text-muted-foreground hover:text-destructive p-1"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant={b.status === "completed" ? "glow" : "outline"}
                            className="h-7 text-[11px]"
                            onClick={() =>
                              handleToggleBlockStatus(
                                b.id,
                                b.status === "completed" ? "planned" : "completed",
                              )
                            }
                          >
                            {b.status === "completed" ? "Completed" : "Mark Completed"}
                          </Button>
                          {b.status !== "missed" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px]"
                              onClick={() => handleToggleBlockStatus(b.id, "missed")}
                            >
                              Mark Missed
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t border-border/70 pt-3">
                <div className="text-xs font-semibold text-foreground">Logged Focus Sessions</div>
                {!selectedDayCell || selectedDayCell.focusSessions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No focus or quick-logged sessions on this date.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedDayCell.focusSessions.map((fs) => (
                      <div
                        key={fs.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-foreground">{fs.title}</div>
                          {fs.subject && (
                            <div className="text-[11px] text-muted-foreground">{fs.subject}</div>
                          )}
                        </div>
                        <span className="shrink-0 font-bold tabular-nums text-primary">
                          {fs.duration_minutes}m
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
