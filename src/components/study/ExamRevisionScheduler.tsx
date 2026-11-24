import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  HeartHandshake,
  ListPlus,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { StudyPlannerSuite } from "@/components/study/StudyPlannerSuite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModernSelect } from "@/components/ui/modern-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuizAttempts, useStudyItems } from "@/hooks/use-modules";
import { useStats, useTaskActions, useTasks, useUser } from "@/hooks/use-nexora";
import {
  assessLearningBacklog,
  buildRecoverySchedule,
  type RecoveryPace,
} from "@/lib/learning-recovery";
import { buildExamRevisionSchedule } from "@/lib/revision-scheduler";
import { SUBJECT_OPTIONS } from "@/lib/settings";
import { useStudentEcosystem } from "@/lib/student-ecosystem";
import {
  computeSmartStudyPlanInBackground,
  generateSmartStudyPlan,
  loadSmartStudyPlanFromFirestore,
  rebalanceMissedSessionsInBackground,
  saveSmartStudyPlanToFirestore,
  type PlannerSubjectInput,
  type SmartStudyBlock,
} from "@/lib/study-planner";

const WEEKDAYS = [
  { id: 0, short: "Sun" },
  { id: 1, short: "Mon" },
  { id: 2, short: "Tue" },
  { id: 3, short: "Wed" },
  { id: 4, short: "Thu" },
  { id: 5, short: "Fri" },
  { id: 6, short: "Sat" },
];

export function ExamRevisionScheduler() {
  const { data: user } = useUser();
  const { data: studyItems = [] } = useStudyItems();
  const { data: quizAttempts = [] } = useQuizAttempts();
  const { data: tasks = [] } = useTasks();
  const { data: stats } = useStats();
  const { addTask, updateTask } = useTaskActions();
  const { state: eco, update: updateEco } = useStudentEcosystem();

  const [mode, setMode] = useState<"planner" | "recovery" | "quick_exam">("planner");

  /* -------------------- MULTI-SUBJECT SMART STUDY PLANNER ------------------- */
  const plannerConfig = eco.smartPlannerConfig;
  const [newSubName, setNewSubName] = useState("Physics");
  const [newSubDate, setNewSubDate] = useState("");
  const [newSubDiff, setNewSubDiff] = useState<PlannerSubjectInput["difficulty"]>("medium");
  const [newSubTopic, setNewSubTopic] = useState("");
  const [rebalanceBanner, setRebalanceBanner] = useState<string | null>(null);
  const [syncingBlocks, setSyncingBlocks] = useState(false);
  const [isComputingPlan, setIsComputingPlan] = useState(false);
  const [plannerEngine, setPlannerEngine] = useState<string>("async_background");
  const [cloudPlanStatus, setCloudPlanStatus] = useState<"idle" | "loaded" | "saved">("idle");

  useEffect(() => {
    let active = true;
    if (!user?.uid) return;
    void loadSmartStudyPlanFromFirestore(user.uid).then((saved) => {
      if (!active || !saved) return;
      updateEco((prev) => ({
        ...prev,
        smartPlannerConfig: saved.config,
        smartPlannerBlocks: saved.blocks,
      }));
      if (saved.engine) setPlannerEngine(saved.engine);
      setCloudPlanStatus("loaded");
    });
    return () => {
      active = false;
    };
  }, [user?.uid, updateEco]);

  const generatedPreview = useMemo(
    () => generateSmartStudyPlan(plannerConfig, tasks),
    [plannerConfig, tasks],
  );

  const activeBlocks: SmartStudyBlock[] =
    eco.smartPlannerBlocks.length > 0 ? eco.smartPlannerBlocks : generatedPreview.blocks;

  const missedCount = activeBlocks.filter((b) => b.status === "missed").length;

  const persistPlanToCloud = async (
    nextCfg: typeof plannerConfig,
    nextBlocks: SmartStudyBlock[],
    engine: string,
  ) => {
    if (!user?.uid) return;
    const ok = await saveSmartStudyPlanToFirestore({
      userId: user.uid,
      config: nextCfg,
      blocks: nextBlocks,
      engine,
    });
    if (ok) setCloudPlanStatus("saved");
  };

  const updatePlannerConfig = async (patch: Partial<typeof plannerConfig>) => {
    const nextCfg = { ...plannerConfig, ...patch };
    updateEco((prev) => ({
      ...prev,
      smartPlannerConfig: nextCfg,
    }));
    setRebalanceBanner(null);
    setIsComputingPlan(true);
    try {
      const fresh = await computeSmartStudyPlanInBackground(nextCfg, tasks);
      setPlannerEngine(fresh.engine);
      updateEco((prev) => ({
        ...prev,
        smartPlannerConfig: nextCfg,
        smartPlannerBlocks: fresh.blocks,
      }));
      await persistPlanToCloud(nextCfg, fresh.blocks, fresh.engine);
    } finally {
      setIsComputingPlan(false);
    }
  };

  const handleAddPlannerSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    const added: PlannerSubjectInput = {
      id: `sub_${Date.now().toString(36)}`,
      subject: newSubName.trim(),
      examDateIso: newSubDate,
      difficulty: newSubDiff,
      priorityTopic: newSubTopic.trim() || `${newSubName.trim()} Core Review`,
    };
    void updatePlannerConfig({ subjects: [...plannerConfig.subjects, added] });
    setNewSubTopic("");
    toast.success(`Added ${added.subject} to Smart Study Planner`);
  };

  const handleRemovePlannerSubject = (id: string) => {
    if (plannerConfig.subjects.length <= 1) {
      toast.info("Keep at least one active subject in your planner.");
      return;
    }
    void updatePlannerConfig({
      subjects: plannerConfig.subjects.filter((s) => s.id !== id),
    });
  };

  const handleToggleWeekday = (dayId: number) => {
    const exists = plannerConfig.blockedWeekdays.includes(dayId);
    const next = exists
      ? plannerConfig.blockedWeekdays.filter((d) => d !== dayId)
      : [...plannerConfig.blockedWeekdays, dayId];
    void updatePlannerConfig({ blockedWeekdays: next });
  };

  const handleRegeneratePlan = async () => {
    setIsComputingPlan(true);
    try {
      const fresh = await computeSmartStudyPlanInBackground(plannerConfig, tasks);
      setPlannerEngine(fresh.engine);
      updateEco((prev) => ({
        ...prev,
        smartPlannerBlocks: fresh.blocks,
      }));
      await persistPlanToCloud(plannerConfig, fresh.blocks, fresh.engine);
      setRebalanceBanner(null);
      toast.success(`Generated balanced 7-day schedule (${fresh.engine})`);
    } finally {
      setIsComputingPlan(false);
    }
  };

  const handleSetBlockStatus = (blockId: string, status: SmartStudyBlock["status"]) => {
    const base =
      eco.smartPlannerBlocks.length > 0 ? eco.smartPlannerBlocks : generatedPreview.blocks;
    const nextBlocks = base.map((b) => (b.id === blockId ? { ...b, status } : b));
    updateEco((prev) => ({
      ...prev,
      smartPlannerBlocks: nextBlocks,
    }));
    void persistPlanToCloud(plannerConfig, nextBlocks, plannerEngine);
  };

  const handleRebalanceMissed = async () => {
    setIsComputingPlan(true);
    try {
      const res = await rebalanceMissedSessionsInBackground(
        activeBlocks,
        plannerConfig.dailyMinutes,
      );
      setPlannerEngine(res.engine);
      updateEco((prev) => ({
        ...prev,
        smartPlannerBlocks: res.updatedBlocks,
      }));
      await persistPlanToCloud(plannerConfig, res.updatedBlocks, res.engine);
      setRebalanceBanner(res.message);
      if (res.movedCount > 0) {
        toast.success(res.message);
      } else {
        toast.info(res.message);
      }
    } finally {
      setIsComputingPlan(false);
    }
  };

  const handleSyncPlannerToTasks = async () => {
    const planned = activeBlocks.filter((b) => b.status === "planned").slice(0, 6);
    if (planned.length === 0) {
      toast.info("No planned sessions left to sync.");
      return;
    }
    setSyncingBlocks(true);
    try {
      for (const b of planned) {
        await addTask({
          title: `${b.subject}: ${b.topic}`,
          details: `${b.rationale} (${b.durationMin}m · ${b.timeWindow})`,
          area: "academic",
          subject: b.subject,
          priority: b.priority,
          due_at: `${b.dayIso}T17:00:00.000Z`,
        });
      }
      toast.success(`Synced ${planned.length} Smart Planner blocks into Tasks & Calendar!`);
    } catch {
      toast.error("Sign in to save study blocks to your Tasks list.");
    } finally {
      setSyncingBlocks(false);
    }
  };

  /* -------------------- NEVER LOST AGAIN (BACKLOG TRIAGE) ------------------- */
  const [recoveryPace, setRecoveryPace] = useState<RecoveryPace>("steady");
  const [applyingRecovery, setApplyingRecovery] = useState(false);

  const backlogAssessment = useMemo(
    () =>
      assessLearningBacklog({
        tasks,
        studyItems,
        currentStreak: stats?.current_streak ?? 0,
      }),
    [tasks, studyItems, stats?.current_streak],
  );

  const recoverySchedule = useMemo(
    () =>
      buildRecoverySchedule({
        overdueTasks: backlogAssessment.overdueTasks,
        pace: recoveryPace,
      }),
    [backlogAssessment.overdueTasks, recoveryPace],
  );

  const handleApplyRecoverySchedule = async () => {
    if (recoverySchedule.steps.length === 0) {
      toast.info("No overdue tasks need rescheduling right now.");
      return;
    }
    setApplyingRecovery(true);
    try {
      for (const step of recoverySchedule.steps) {
        const match = tasks.find((tk) => tk.id === step.taskId);
        if (match) {
          await updateTask(match, { due_at: step.newDueAt });
        }
      }
      toast.success(
        `Gently spread ${recoverySchedule.steps.length} overdue tasks without any overload!`,
      );
    } catch {
      toast.error("Unable to reschedule tasks right now.");
    } finally {
      setApplyingRecovery(false);
    }
  };

  /* ---------------------- LEGACY QUICK SINGLE-EXAM PLAN --------------------- */
  const defaultExamDate = useMemo(() => {
    const d = new Date(Date.now() + 7 * 86400_000);
    return d.toISOString().slice(0, 10);
  }, []);

  const allSubjects = useMemo(() => {
    const set = new Set<string>(SUBJECT_OPTIONS);
    for (const item of studyItems) {
      if (item.subject.trim()) set.add(item.subject.trim());
    }
    return Array.from(set);
  }, [studyItems]);

  const [examName, setExamName] = useState("Midterm Exam");
  const [subject, setSubject] = useState<string>(SUBJECT_OPTIONS[0]);
  const [examDate, setExamDate] = useState(defaultExamDate);
  const [dailyMinutes, setDailyMinutes] = useState<number>(30);
  const [savingPlan, setSavingPlan] = useState(false);
  const [savedFlag, setSavedFlag] = useState(false);

  const plan = useMemo(
    () =>
      buildExamRevisionSchedule({
        examName: examName.trim() || "Exam",
        subject,
        examDateIso: examDate || defaultExamDate,
        dailyMinutes,
        studyItems,
        quizAttempts,
      }),
    [examName, subject, examDate, defaultExamDate, dailyMinutes, studyItems, quizAttempts],
  );

  const handleSaveToTasks = async () => {
    if (!examName.trim()) {
      toast.error("Please enter an exam or assessment name.");
      return;
    }
    setSavingPlan(true);
    try {
      for (const s of plan.sessions) {
        await addTask({
          title: s.title,
          details: `${s.rationale} (${s.durationMinutes} min suggested)`,
          area: "academic",
          subject: plan.subject,
          priority:
            s.focusArea === "mistakes" || s.focusArea === "practice_quiz" ? "high" : "medium",
          due_at: `${s.dateIso}T17:00:00.000Z`,
        });
      }
      setSavedFlag(true);
      toast.success(
        `Added ${plan.sessions.length} spaced revision sessions to your Tasks & Calendar!`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save revision schedule.");
    } finally {
      setSavingPlan(false);
    }
  };

  return (
    <div className="space-y-5" data-testid="exam-revision-scheduler">
      {/* Sub-mode switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "planner", label: "Smart Study Planner", icon: Compass },
            { id: "recovery", label: "Never Lost Again (Backlog Recovery)", icon: HeartHandshake },
            { id: "quick_exam", label: "Single-Exam Spaced Roadmap", icon: CalendarDays },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id as typeof mode)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                  mode === m.id
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
        <FeatureGuideTrigger featureId="exam-revision" />
      </div>

      {/* MODE 1: MULTI-SUBJECT SMART STUDY PLANNER */}
      {mode === "planner" && (
        <div className="space-y-5 text-xs">
          <StudyPlannerSuite />
          <div className="surface-card p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/80 pb-3">
              <div>
                <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <Compass className="size-4 text-primary" />
                  Adaptive Multi-Subject Study Planner
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Balances exams, deadlines, difficulty, daily caps &amp; rest commitments in a
                  background Web Worker—persisting to Firestore{" "}
                  <code className="font-mono">smart_study_plans</code>.
                </p>
                <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                  Compute Engine: <strong className="text-primary">{plannerEngine}</strong> · Cloud
                  Sync:{" "}
                  <strong className="text-foreground">
                    {cloudPlanStatus === "saved"
                      ? "Saved to Firestore"
                      : cloudPlanStatus === "loaded"
                        ? "Loaded from Firestore"
                        : user?.uid
                          ? "Ready"
                          : "Local Guest Mode"}
                  </strong>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isComputingPlan}
                  onClick={() => void handleRegeneratePlan()}
                  className="h-8 text-xs"
                >
                  <RefreshCw className={`size-3.5 me-1 ${isComputingPlan ? "animate-spin" : ""}`} />
                  {isComputingPlan ? "Computing..." : "Rebuild Plan"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="glow"
                  onClick={handleSyncPlannerToTasks}
                  disabled={syncingBlocks}
                  className="h-8 text-xs"
                >
                  <ListPlus className="size-3.5 me-1" />
                  {syncingBlocks ? "Syncing..." : "Sync Planned Blocks to Tasks"}
                </Button>
              </div>
            </div>

            {/* Planner settings */}
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Daily Study Cap (minutes)</Label>
                <Select
                  value={String(plannerConfig.dailyMinutes)}
                  onValueChange={(v) => updatePlannerConfig({ dailyMinutes: Number(v) })}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 min/day (Gentle Cap)</SelectItem>
                    <SelectItem value="60">60 min/day (Balanced Cap)</SelectItem>
                    <SelectItem value="90">90 min/day (Two Focused Blocks)</SelectItem>
                    <SelectItem value="120">120 min/day (Exam Sprint Cap)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Preferred Time Window</Label>
                <Select
                  value={plannerConfig.preferredTime}
                  onValueChange={(v) =>
                    updatePlannerConfig({
                      preferredTime: v as typeof plannerConfig.preferredTime,
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (07:30 – 09:00 AM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (04:00 – 06:00 PM)</SelectItem>
                    <SelectItem value="evening">Evening (07:30 – 09:30 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Personal Commitments / Rest Days</Label>
                <div className="flex flex-wrap gap-1 pt-1">
                  {WEEKDAYS.map((wd) => {
                    const blocked = plannerConfig.blockedWeekdays.includes(wd.id);
                    return (
                      <button
                        key={wd.id}
                        type="button"
                        onClick={() => handleToggleWeekday(wd.id)}
                        className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${
                          blocked
                            ? "border-amber-500/40 bg-amber-500/15 text-foreground"
                            : "border-border bg-surface-2 text-muted-foreground"
                        }`}
                        title={blocked ? "Marked as protected rest/commitment day" : "Study day"}
                      >
                        {wd.short}
                        {blocked ? " (Rest)" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Active subjects & add subject form */}
            <div className="space-y-2">
              <div className="font-semibold text-foreground">
                Active Subjects & Exam Priorities ({plannerConfig.subjects.length})
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {plannerConfig.subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="rounded-xl border border-border bg-surface-2/70 p-3 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-foreground">{sub.subject}</div>
                      <div className="text-[11px] text-primary">{sub.priorityTopic}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Difficulty: <span className="capitalize">{sub.difficulty}</span>
                        {sub.examDateIso ? ` · Exam: ${sub.examDateIso}` : ""}
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 px-1.5 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemovePlannerSubject(sub.id)}
                      aria-label={`Remove ${sub.subject}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleAddPlannerSubject}
                className="grid gap-2 sm:grid-cols-5 rounded-xl border border-border bg-surface-2/40 p-3"
              >
                <Input
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="Subject (e.g. Chemistry)"
                  className="h-8 text-xs"
                />
                <Input
                  value={newSubTopic}
                  onChange={(e) => setNewSubTopic(e.target.value)}
                  placeholder="Priority topic (e.g. Moles)"
                  className="h-8 text-xs"
                />
                <Input
                  type="date"
                  value={newSubDate}
                  onChange={(e) => setNewSubDate(e.target.value)}
                  className="h-8 text-xs"
                />
                <ModernSelect
                  value={newSubDiff}
                  onValueChange={(v) => setNewSubDiff(v as typeof newSubDiff)}
                  ariaLabel="Subject difficulty"
                  size="sm"
                  options={[
                    { value: "foundation", label: "Foundation" },
                    { value: "medium", label: "Medium" },
                    { value: "challenging", label: "Challenging" },
                  ]}
                />
                <Button type="submit" size="sm" className="h-8 text-xs">
                  <Plus className="size-3.5 me-1" />
                  Add Subject
                </Button>
              </form>
            </div>
          </div>

          {/* Schedule blocks + Zero-shame rebalance */}
          <div className="surface-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Generated 7-Day Balanced Study Blocks ({activeBlocks.length})
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {generatedPreview.reassuranceNote}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant={missedCount > 0 ? "glow" : "outline"}
                disabled={isComputingPlan}
                onClick={() => void handleRebalanceMissed()}
                className="h-8 text-xs"
              >
                <RefreshCw className={`size-3.5 me-1 ${isComputingPlan ? "animate-spin" : ""}`} />
                Rebalance Missed Sessions ({missedCount})
              </Button>
            </div>

            {rebalanceBanner && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-foreground">
                <CheckCircle2 className="inline size-4 text-emerald-500 me-1.5" />
                {rebalanceBanner}
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {activeBlocks.map((block) => (
                <div
                  key={block.id}
                  className={`rounded-xl border p-3.5 space-y-2 flex flex-col justify-between ${
                    block.status === "completed"
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : block.status === "missed"
                        ? "border-amber-500/40 bg-amber-500/10"
                        : "border-border bg-surface-2"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-mono font-bold text-primary">
                        {block.dayLabel} · {block.durationMin}m
                      </span>
                      <span className="text-muted-foreground">{block.timeWindow}</span>
                    </div>
                    <div className="font-bold text-foreground">
                      {block.subject}: {block.topic}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{block.rationale}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={block.status === "completed" ? "glow" : "outline"}
                      className="h-6 px-2 text-[11px]"
                      onClick={() =>
                        handleSetBlockStatus(
                          block.id,
                          block.status === "completed" ? "planned" : "completed",
                        )
                      }
                    >
                      {block.status === "completed" ? "Completed" : "Mark Done"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={block.status === "missed" ? "destructive" : "ghost"}
                      className="h-6 px-2 text-[11px]"
                      onClick={() =>
                        handleSetBlockStatus(
                          block.id,
                          block.status === "missed" ? "planned" : "missed",
                        )
                      }
                    >
                      {block.status === "missed" ? "Missed (Needs Rebalance)" : "Mark Missed"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: NEVER LOST AGAIN (BACKLOG TRIAGE) */}
      {mode === "recovery" && (
        <div className="surface-card p-5 space-y-4 text-xs">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/80 pb-3">
            <div>
              <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <HeartHandshake className="size-4 text-primary" />
                Never Lost Again · Zero-Shame Backlog Recovery
              </h2>
              <p className="text-muted-foreground mt-0.5">{backlogAssessment.reassurance}</p>
            </div>
            <div className="flex gap-1.5">
              {(["gentle", "steady", "focused"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setRecoveryPace(p)}
                  className={`rounded-lg border px-2.5 py-1 capitalize font-semibold ${
                    recoveryPace === p
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface-2 p-3">
              <div className="text-[11px] text-muted-foreground">Overdue Tasks</div>
              <div className="text-lg font-bold text-foreground">
                {backlogAssessment.overdueTasks.length}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-3">
              <div className="text-[11px] text-muted-foreground">Flashcards Ready</div>
              <div className="text-lg font-bold text-foreground">
                {backlogAssessment.dueFlashcardsCount}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-3">
              <div className="text-[11px] text-muted-foreground">Selected Recovery Pace</div>
              <div className="text-sm font-bold text-primary mt-1">
                {recoverySchedule.paceSummary}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
            <div className="font-bold text-foreground">{backlogAssessment.headline}</div>
            {recoverySchedule.firstTinyWin ? (
              <div className="text-muted-foreground">
                <strong className="text-primary">First Tiny Win for Today:</strong>{" "}
                {recoverySchedule.firstTinyWin.title} (Priority:{" "}
                {recoverySchedule.firstTinyWin.priority})
              </div>
            ) : (
              <div className="text-muted-foreground">
                You have zero overdue tasks right now! Keep using gentle daily 20-minute review
                blocks inside Smart Study Planner.
              </div>
            )}
          </div>

          {recoverySchedule.steps.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-foreground">
                  Proposed Calm Redistribution ({recoverySchedule.steps.length} items)
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="glow"
                  onClick={handleApplyRecoverySchedule}
                  disabled={applyingRecovery}
                  className="h-8 text-xs"
                >
                  {applyingRecovery ? "Applying Dates..." : "Apply Calm Reschedule to My Tasks"}
                </Button>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {recoverySchedule.steps.map((step) => (
                  <div
                    key={step.taskId}
                    className="rounded-lg border border-border bg-surface-2/70 p-3 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-foreground">{step.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Suggested Window: <strong className="text-primary">{step.dayLabel}</strong>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono text-muted-foreground">
                      {step.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: LEGACY QUICK SINGLE-EXAM ROADMAP */}
      {mode === "quick_exam" && (
        <div className="space-y-5">
          <div className="surface-card p-5 space-y-4">
            <div className="border-b border-border/80 pb-3">
              <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" />
                Single-Exam Spaced Revision Roadmap
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Turn one upcoming exam date into a balanced, spaced repetition plan prioritizing
                your weak areas—with zero last-night cramming.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rev-exam-name" className="text-xs font-semibold">
                  Exam / Milestone Name
                </Label>
                <Input
                  id="rev-exam-name"
                  value={examName}
                  onChange={(e) => {
                    setExamName(e.target.value);
                    setSavedFlag(false);
                  }}
                  placeholder="e.g. Physics Midterm"
                  maxLength={80}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rev-subject" className="text-xs font-semibold">
                  Subject
                </Label>
                <Select
                  value={subject}
                  onValueChange={(v) => {
                    setSubject(v);
                    setSavedFlag(false);
                  }}
                >
                  <SelectTrigger id="rev-subject" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allSubjects.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rev-date" className="text-xs font-semibold">
                  Exam Date
                </Label>
                <Input
                  id="rev-date"
                  type="date"
                  value={examDate}
                  onChange={(e) => {
                    setExamDate(e.target.value);
                    setSavedFlag(false);
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rev-mins" className="text-xs font-semibold">
                  Daily Budget (minutes)
                </Label>
                <Select
                  value={String(dailyMinutes)}
                  onValueChange={(v) => {
                    setDailyMinutes(Number(v));
                    setSavedFlag(false);
                  }}
                >
                  <SelectTrigger id="rev-mins" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20 min/day (Light)</SelectItem>
                    <SelectItem value="30">30 min/day (Balanced)</SelectItem>
                    <SelectItem value="45">45 min/day (Thorough)</SelectItem>
                    <SelectItem value="60">60 min/day (Intensive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                plan.weaknessDetected
                  ? "bg-amber-500/10 border-amber-500/30 text-foreground"
                  : "bg-surface-2 border-border text-muted-foreground"
              }`}
            >
              {plan.weaknessDetected ? (
                <AlertTriangle className="size-4 text-amber-500 shrink-0" />
              ) : (
                <Sparkles className="size-4 text-primary shrink-0" />
              )}
              <span>{plan.weaknessSummary}</span>
            </div>
          </div>

          <div className="surface-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {plan.daysAvailable}-Day Spaced Revision Roadmap
                </h3>
                <p className="text-xs text-muted-foreground">
                  Includes active recall, mistake repair, practice quizzes, and a calm rest buffer
                  before exam day.
                </p>
              </div>

              {savedFlag ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  <span>Added to Tasks & Calendar</span>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="glow"
                  size="sm"
                  onClick={handleSaveToTasks}
                  disabled={savingPlan}
                  className="gap-1.5 text-xs"
                >
                  <ListPlus className="size-4" />
                  <span>{savingPlan ? "Saving..." : "Save Plan to Tasks & Calendar"}</span>
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {plan.sessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-xl border border-border bg-surface-2 p-3.5 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-primary">
                        Day {session.dayIndex} · {session.dateIso}
                      </span>
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Clock className="size-3" />
                        {session.durationMinutes}m
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-foreground leading-snug">
                      {session.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {session.rationale}
                    </p>
                  </div>
                  <div className="pt-1 flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    <CalendarCheck className="size-3 text-primary" />
                    <span>{session.focusArea.replace("_", " ")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
