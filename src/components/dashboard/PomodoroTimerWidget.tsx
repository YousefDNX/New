import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BellOff,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Timer,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModernSelect } from "@/components/ui/modern-select";
import { useToast } from "@/components/common/ToastProvider";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { useFocusActions, useFocusSessions } from "@/hooks/use-modules";
import { useTasks } from "@/hooks/use-nexora";
import { isWithinQuietHours } from "@/lib/daily-goal-reminder";
import type { GrowthArea } from "@/lib/firestore-data";
import { AREA_CONFIG, AREAS } from "@/lib/growth";
import { formatNumber } from "@/lib/locale-format";
import {
  POMODORO_PRESETS,
  calculateElapsedMinutes,
  calculateFocusXp,
  calculateSessionProgress,
  clampTimerMinutes,
  formatTimerClock,
  nextPomodoroPhase,
  summarizeTodayFocus,
  type PomodoroPhase,
} from "@/lib/pomodoro";
import { usePrefs } from "@/lib/preferences";
import { SUBJECT_OPTIONS } from "@/lib/settings";
import { cn } from "@/lib/utils";

function playCompletionChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.46);
  } catch (err) {
    void err;
  }
}

export function PomodoroTimerWidget({ className }: { className?: string }) {
  const { t, lang, study, notifications } = usePrefs();
  const toast = useToast();
  const { data: focusSessions = [] } = useFocusSessions();
  const { logFocusSession } = useFocusActions();
  const { data: tasks = [] } = useTasks();

  const [phase, setPhase] = useState<PomodoroPhase>("focus");
  const [focusMins, setFocusMins] = useState(() =>
    clampTimerMinutes(study.sessionMinutes, 5, 180, 25),
  );
  const [shortBreakMins, setShortBreakMins] = useState(() =>
    clampTimerMinutes(study.breakMinutes, 1, 60, 5),
  );
  const [longBreakMins, setLongBreakMins] = useState(() =>
    clampTimerMinutes(study.breakMinutes * 3, 5, 60, 15),
  );

  const [secondsLeft, setSecondsLeft] = useState(() => focusMins * 60);
  const [running, setRunning] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [sessionTitle, setSessionTitle] = useState("");
  const [linkedTaskId, setLinkedTaskId] = useState("");
  const [area, setArea] = useState<GrowthArea>("academic");
  const [subject, setSubject] = useState("");
  const [muted, setMuted] = useState(false);
  const [saving, setSaving] = useState(false);

  const openTasks = useMemo(() => tasks.filter((tk) => tk.status !== "done"), [tasks]);

  const phaseDurationSeconds = useMemo(() => {
    if (phase === "focus") return focusMins * 60;
    if (phase === "shortBreak") return shortBreakMins * 60;
    return longBreakMins * 60;
  }, [phase, focusMins, shortBreakMins, longBreakMins]);

  const getDurationSeconds = useCallback(
    (
      targetPhase: PomodoroPhase,
      fMins = focusMins,
      sbMins = shortBreakMins,
      lbMins = longBreakMins,
    ) => {
      if (targetPhase === "focus") return fMins * 60;
      if (targetPhase === "shortBreak") return sbMins * 60;
      return lbMins * 60;
    },
    [focusMins, shortBreakMins, longBreakMins],
  );

  const prevStudyRef = useRef({
    session: study.sessionMinutes,
    brk: study.breakMinutes,
  });

  // Sync user's default Study Settings only when those settings actually change while paused/idle
  useEffect(() => {
    const prev = prevStudyRef.current;
    if (prev.session === study.sessionMinutes && prev.brk === study.breakMinutes) {
      return;
    }
    prevStudyRef.current = {
      session: study.sessionMinutes,
      brk: study.breakMinutes,
    };
    if (running) return;
    const nextFocus = clampTimerMinutes(study.sessionMinutes, 5, 180, 25);
    const nextBreak = clampTimerMinutes(study.breakMinutes, 1, 60, 5);
    const nextLong = clampTimerMinutes(nextBreak * 3, 5, 60, 15);
    setFocusMins(nextFocus);
    setShortBreakMins(nextBreak);
    setLongBreakMins(nextLong);
    setSecondsLeft(getDurationSeconds(phase, nextFocus, nextBreak, nextLong));
  }, [study.sessionMinutes, study.breakMinutes, running, phase, getDurationSeconds]);

  const quietActive = useMemo(() => {
    if (!notifications.quietHoursEnabled) return false;
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    return isWithinQuietHours(hhmm, notifications.quietStart, notifications.quietEnd);
  }, [notifications.quietHoursEnabled, notifications.quietStart, notifications.quietEnd]);

  const todaySummary = useMemo(() => summarizeTodayFocus(focusSessions), [focusSessions]);
  const progressPct = calculateSessionProgress(secondsLeft, phaseDurationSeconds);
  const elapsedMinutes = calculateElapsedMinutes(secondsLeft, phaseDurationSeconds);

  const finishHandledRef = useRef(false);

  const handleCompleteAndSave = useCallback(
    async (autoCompleted = false) => {
      if (saving) return;
      if (phase !== "focus") {
        const next = nextPomodoroPhase(phase, completedCycles);
        setPhase(next.nextPhase);
        setCompletedCycles(next.nextCompletedCount);
        setSecondsLeft(getDurationSeconds(next.nextPhase));
        setRunning(false);
        return;
      }

      setSaving(true);
      const linked = openTasks.find((tk) => tk.id === linkedTaskId) ?? null;
      try {
        const minutesToLog = autoCompleted ? focusMins : elapsedMinutes;
        await logFocusSession({
          title: sessionTitle.trim() || linked?.title || t("prod.timer.work"),
          area: linked?.area ?? area,
          subject: subject || linked?.subject || null,
          durationMinutes: minutesToLog,
        });
        const earnedXp = calculateFocusXp(minutesToLog);
        if (!muted && !quietActive) {
          playCompletionChime();
        }
        toast.success(t("pomo.title"), t("pomo.toastDone").replace("{xp}", String(earnedXp)));
        const next = nextPomodoroPhase("focus", completedCycles);
        setCompletedCycles(next.nextCompletedCount);
        setPhase(next.nextPhase);
        setSecondsLeft(getDurationSeconds(next.nextPhase));
        setRunning(false);
        setSessionTitle("");
        setLinkedTaskId("");
      } catch (err) {
        void err;
        toast.error(t("pomo.title"), t("pomo.toastSaveErr"));
      } finally {
        setSaving(false);
      }
    },
    [
      saving,
      phase,
      completedCycles,
      focusMins,
      elapsedMinutes,
      logFocusSession,
      sessionTitle,
      linkedTaskId,
      openTasks,
      t,
      area,
      subject,
      muted,
      quietActive,
      toast,
      getDurationSeconds,
    ],
  );

  // Countdown tick
  useEffect(() => {
    if (!running) {
      finishHandledRef.current = false;
      return undefined;
    }
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // Auto-save when timer naturally reaches 00:00
  useEffect(() => {
    if (secondsLeft === 0 && !running && !finishHandledRef.current) {
      finishHandledRef.current = true;
      void handleCompleteAndSave(true);
    }
  }, [secondsLeft, running, handleCompleteAndSave]);

  const applyPreset = (preset: (typeof POMODORO_PRESETS)[number]) => {
    setRunning(false);
    setFocusMins(preset.focusMinutes);
    setShortBreakMins(preset.shortBreakMinutes);
    setLongBreakMins(preset.longBreakMinutes);
    setPhase("focus");
    setSecondsLeft(preset.focusMinutes * 60);
  };

  const switchPhase = (nextPhase: PomodoroPhase) => {
    setRunning(false);
    setPhase(nextPhase);
    setSecondsLeft(getDurationSeconds(nextPhase));
  };

  const handleReset = () => {
    setRunning(false);
    setSecondsLeft(phaseDurationSeconds);
  };

  const handleSkipPhase = () => {
    setRunning(false);
    const next = nextPomodoroPhase(phase, completedCycles);
    setCompletedCycles(next.nextCompletedCount);
    setPhase(next.nextPhase);
    setSecondsLeft(getDurationSeconds(next.nextPhase));
  };

  const ringRadius = 54;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashOffset = ringCircumference - (ringCircumference * progressPct) / 100;

  return (
    <section
      id="dashboard-pomodoro"
      data-testid="pomodoro-timer-widget"
      aria-label={t("pomo.title")}
      className={cn("surface-card p-5 md:p-6", className)}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Timer className="size-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                {t("pomo.title")}
              </h2>
              <p className="text-xs text-muted-foreground">{t("pomo.sub")}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="tabular-nums">
            {t("pomo.todaySummary")}:{" "}
            <strong className="text-foreground">
              {formatNumber(todaySummary.sessionCount, lang)} {t("pomo.sessionsUnit")}
            </strong>{" "}
            ·{" "}
            <strong className="text-primary">
              {formatNumber(todaySummary.totalMinutes, lang)} {t("pomo.minutesUnit")}
            </strong>
          </span>

          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? t("pomo.soundOff") : t("pomo.soundOn")}
            title={muted ? t("pomo.soundOff") : t("pomo.soundOn")}
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {muted || quietActive ? (
              <VolumeX className="size-3.5" />
            ) : (
              <Volume2 className="size-3.5" />
            )}
          </button>
          <FeatureGuideTrigger featureId="study-pomodoro" iconOnly />
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
        {/* Left: Circular Clock & Controls */}
        <div className="flex flex-col items-center gap-4 lg:col-span-5">
          {/* Phase Switcher */}
          <div
            className="flex w-full max-w-xs rounded-xl border border-border bg-surface-2 p-1"
            role="tablist"
            aria-label={t("pomo.title")}
          >
            {(["focus", "shortBreak", "longBreak"] as const).map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={phase === p}
                data-testid={`pomo-phase-${p}`}
                onClick={() => switchPhase(p)}
                className={cn(
                  "flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors",
                  phase === p
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`pomo.phase.${p}`)}
              </button>
            ))}
          </div>

          {/* Ring Clock */}
          <div className="relative flex size-36 items-center justify-center">
            <svg viewBox="0 0 128 128" className="size-full -rotate-90" aria-hidden="true">
              <circle
                cx={64}
                cy={64}
                r={ringRadius}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.12}
                strokeWidth={7}
              />
              <circle
                cx={64}
                cy={64}
                r={ringRadius}
                fill="none"
                stroke={phase === "focus" ? "var(--primary)" : "var(--success)"}
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringDashOffset}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                data-testid="pomo-clock-display"
                className="font-mono text-3xl font-bold tracking-tight tabular-nums text-foreground"
              >
                {formatTimerClock(secondsLeft)}
              </span>
              <span className="mt-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
                {t(`pomo.phase.${phase}`)} · {formatNumber(progressPct, lang)}%
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={running ? "secondary" : "default"}
              data-testid="pomo-toggle-btn"
              onClick={() => setRunning((r) => !r)}
              className="gap-1.5 px-4"
            >
              {running ? (
                <>
                  <Pause className="size-3.5" />
                  <span>{t("pomo.pause")}</span>
                </>
              ) : (
                <>
                  <Play className="size-3.5" />
                  <span>
                    {secondsLeft < phaseDurationSeconds ? t("pomo.resume") : t("pomo.start")}
                  </span>
                </>
              )}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              data-testid="pomo-reset-btn"
              onClick={handleReset}
              aria-label={t("pomo.reset")}
              title={t("pomo.reset")}
            >
              <RotateCcw className="size-3.5" />
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              data-testid="pomo-skip-btn"
              onClick={handleSkipPhase}
              aria-label={t("pomo.skip")}
              title={t("pomo.skip")}
            >
              <SkipForward className="size-3.5" />
            </Button>

            {phase === "focus" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={saving}
                data-testid="pomo-complete-btn"
                onClick={() => void handleCompleteAndSave(false)}
                className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
              >
                <CheckCircle2 className="size-3.5" />
                <span>{t("pomo.complete")}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Right: Session Configuration, Presets, Cycle & Summary */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          {quietActive && (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-muted-foreground">
              <BellOff className="size-3.5 shrink-0 text-xp" />
              <span>{t("prod.timer.quietNote")}</span>
            </div>
          )}

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-2">
            {POMODORO_PRESETS.map((preset) => {
              const active = focusMins === preset.focusMinutes;
              return (
                <button
                  key={preset.id}
                  type="button"
                  data-testid={`pomo-preset-${preset.id}`}
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary/12 text-primary"
                      : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(`pomo.preset.${preset.id}`)}
                </button>
              );
            })}
          </div>

          {/* Session Tagging + Link Open Task */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder={t("pomo.taskPh")}
                maxLength={160}
                aria-label={t("pomo.taskPh")}
              />
            </div>

            {openTasks.length > 0 && (
              <div className="sm:col-span-2">
                <label htmlFor="pomo-linked-task" className="sr-only">
                  {t("prod.linkTask")}
                </label>
                <ModernSelect
                  id="pomo-linked-task"
                  ariaLabel={t("prod.linkTask")}
                  size="sm"
                  value={linkedTaskId}
                  onValueChange={(id) => {
                    setLinkedTaskId(id);
                    const found = openTasks.find((tk) => tk.id === id);
                    if (found) {
                      if (!sessionTitle) setSessionTitle(found.title);
                      if (found.area) setArea(found.area);
                      if (found.subject) setSubject(found.subject);
                    }
                  }}
                  options={[
                    { value: "", label: t("prod.linkTaskNone") },
                    ...openTasks.map((tk) => ({ value: tk.id, label: tk.title })),
                  ]}
                />
              </div>
            )}

            <div>
              <label htmlFor="pomo-area-select" className="sr-only">
                {t("prod.area")}
              </label>
              <ModernSelect
                id="pomo-area-select"
                ariaLabel={t("prod.area")}
                size="sm"
                value={area}
                onValueChange={(val) => setArea(val as GrowthArea)}
                options={AREAS.map((a) => ({
                  value: a,
                  label: t(AREA_CONFIG[a].labelKey),
                }))}
              />
            </div>

            <div>
              <label htmlFor="pomo-subject-select" className="sr-only">
                {t("pomo.subjectLabel")}
              </label>
              <ModernSelect
                id="pomo-subject-select"
                ariaLabel={t("pomo.subjectLabel")}
                size="sm"
                value={subject}
                onValueChange={setSubject}
                options={[
                  { value: "", label: t("pomo.subjectNone") },
                  ...SUBJECT_OPTIONS.map((subj) => ({ value: subj, label: subj })),
                ]}
              />
            </div>
          </div>

          {/* Cycle Tracker & Link to Full Productivity Timer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{t("pomo.cycleProgress")}:</span>
              <div className="flex items-center gap-1.5" aria-label={`${completedCycles % 4}/4`}>
                {[0, 1, 2, 3].map((dot) => {
                  const filled = dot < completedCycles % 4;
                  return (
                    <span
                      key={dot}
                      className={cn(
                        "size-2.5 rounded-full transition-colors",
                        filled ? "bg-primary" : "bg-muted",
                      )}
                    />
                  );
                })}
              </div>
              <span className="font-mono text-[11px] tabular-nums text-foreground">
                {formatNumber(completedCycles, lang)}
              </span>
            </div>

            <Link
              to="/app/tasks"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <span>{t("pomo.historyLink")}</span>
              <ArrowRight className="size-3.5 rtl-flip" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
