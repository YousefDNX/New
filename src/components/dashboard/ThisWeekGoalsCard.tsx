import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Edit3,
  Loader2,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { useGoalActions, useGoals, type GoalRow } from "@/hooks/use-nexora";
import { AREA_CONFIG, type Area } from "@/lib/growth";
import { formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { playMilestoneSound, playTaskCompleteSound } from "@/lib/sound-effects";

export function getIsoWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function ThisWeekGoalsCard() {
  const { data: allGoals = [] } = useGoals();
  const { addGoal, updateGoal, toggleGoal } = useGoalActions();
  const { lang } = usePrefs();

  const isAr = lang === "ar";
  const currentWeek = useMemo(() => getIsoWeekKey(), []);

  // Filter 3 weekly goals tagged for current week
  const weeklyGoals = useMemo(() => {
    return allGoals
      .filter((g) => {
        if (g.is_daily) return false;
        if (g.target_date === currentWeek) return true;
        if (g.target_date && g.target_date.startsWith(currentWeek)) return true;
        return false;
      })
      .slice(0, 3);
  }, [allGoals, currentWeek]);

  const [isEditing, setIsEditing] = useState(false);
  const [goal1, setGoal1] = useState("");
  const [goal2, setGoal2] = useState("");
  const [goal3, setGoal3] = useState("");
  const [area1, setArea1] = useState<Area>("academic");
  const [area2, setArea2] = useState<Area>("productivity");
  const [area3, setArea3] = useState<Area>("wellbeing");
  const [submitting, setSubmitting] = useState(false);

  // Initialize editing inputs when entering edit mode
  const startEditing = () => {
    setGoal1(weeklyGoals[0]?.title ?? "");
    setGoal2(weeklyGoals[1]?.title ?? "");
    setGoal3(weeklyGoals[2]?.title ?? "");
    setArea1(weeklyGoals[0]?.area ?? "academic");
    setArea2(weeklyGoals[1]?.area ?? "productivity");
    setArea3(weeklyGoals[2]?.area ?? "wellbeing");
    setIsEditing(true);
  };

  const completedCount = weeklyGoals.filter((g) => g.status === "completed").length;
  const progressPct =
    weeklyGoals.length > 0 ? Math.round((completedCount / weeklyGoals.length) * 100) : 0;

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    const g1 = goal1.trim();
    const g2 = goal2.trim();
    const g3 = goal3.trim();

    if (!g1 || !g2 || !g3) {
      toast.error(
        isAr ? "يرجى كتابة أهداف الأسبوع الثلاثة كاملة" : "Please define all 3 weekly goals",
      );
      return;
    }

    const entries: Array<{ title: string; area: Area }> = [
      { title: g1, area: area1 },
      { title: g2, area: area2 },
      { title: g3, area: area3 },
    ];

    setSubmitting(true);
    try {
      await Promise.all(
        entries.map((entry, idx) => {
          const existing = weeklyGoals[idx];
          if (existing) {
            return updateGoal(existing, {
              title: entry.title,
              area: entry.area,
              is_daily: false,
              target_date: currentWeek,
            });
          }
          return addGoal({
            title: entry.title,
            area: entry.area,
            is_daily: false,
            target_date: currentWeek,
          });
        }),
      );

      setIsEditing(false);
      toast.success(
        isAr
          ? "تم حفظ أهداف الأسبوع الثلاثة في السحابة بنجاح! 🎯"
          : "Saved your 3 weekly goals to Firestore! 🎯",
      );
    } catch (err) {
      console.error("[ThisWeekGoalsCard] Error saving goals:", err);
      toast.error(isAr ? "تعذر حفظ أهداف الأسبوع" : "Could not save weekly goals");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (goal: GoalRow) => {
    try {
      const willBeDone = goal.status !== "completed";
      await toggleGoal(goal);
      if (willBeDone) {
        const nextDone = completedCount + 1;
        if (weeklyGoals.length > 0 && nextDone >= weeklyGoals.length) {
          playMilestoneSound();
        } else {
          playTaskCompleteSound();
        }
        toast.success(
          isAr
            ? `أحسنت! أنجزت: ${goal.title} (+20 XP)`
            : `Great job! Completed: ${goal.title} (+20 XP)`,
        );
      }
    } catch (err) {
      console.error("[ThisWeekGoalsCard] Toggle error:", err);
      toast.error(isAr ? "فشل تحديث الهدف" : "Failed to toggle goal");
    }
  };

  return (
    <div
      data-testid="this-week-goals-card"
      className="surface-card relative overflow-hidden rounded-2xl border border-border/80 bg-surface/90 p-5 shadow-card transition-all hover:border-primary/40 md:p-6"
    >
      {/* Header with week badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Target className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-foreground">
                {isAr ? "أهداف هذا الأسبوع" : "This Week"}
              </h3>
              <span className="flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                <CalendarDays className="size-3 text-primary" />
                <span>{currentWeek}</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "3 أهداف ذكية محددة لأسبوعك الأكاديمي والشخصي"
                : "3 defined weekly targets stored securely in Firestore"}
            </p>
          </div>
        </div>

        {weeklyGoals.length > 0 && !isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="edit-weekly-goals-btn"
            onClick={startEditing}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <Edit3 className="size-3.5" />
            <span>{isAr ? "تعديل الأهداف" : "Edit Goals"}</span>
          </Button>
        )}
      </div>

      {/* Main Content: Form or List */}
      <div className="mt-4">
        {weeklyGoals.length === 0 || isEditing ? (
          /* Form for defining 3 weekly goals */
          <form onSubmit={handleSaveGoals} className="space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <Sparkles className="size-3.5" />
                <span>
                  {isAr ? "حدد أهدافك الثلاثة لهذا الأسبوع" : "Define your 3 weekly objectives"}
                </span>
              </div>
              <p className="mt-1 text-muted-foreground">
                {isAr
                  ? "تساعدك هذه الأهداف الثلاثة على التركيز وتحقيق تقدم ملحوظ في دراستك وتطويرك الذاتي."
                  : "These 3 goals keep your focus sharp and directly advance your weekly milestone momentum."}
              </p>
            </div>

            <div className="space-y-3">
              {/* Goal 1: Academic */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="goal-1" className="font-semibold text-foreground">
                    {isAr ? "الهدف 1 (أكاديمي/دراسي)" : "Goal 1 (Academic)"}
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    {isAr ? AREA_CONFIG[area1].nameAr : AREA_CONFIG[area1].nameEn}
                  </span>
                </div>
                <Input
                  id="goal-1"
                  data-testid="weekly-goal-input-1"
                  placeholder={
                    isAr
                      ? "مثال: مراجعة الوحدة الثالثة وإنجاز بطاقات الاستذكار"
                      : "e.g., Complete Unit 3 revision & practice flashcards"
                  }
                  value={goal1}
                  onChange={(e) => setGoal1(e.target.value)}
                  maxLength={160}
                  required
                  className="bg-surface-2 text-xs"
                />
              </div>

              {/* Goal 2: Productivity / Focus */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="goal-2" className="font-semibold text-foreground">
                    {isAr ? "الهدف 2 (إنتاجية/تركيز)" : "Goal 2 (Productivity / Focus)"}
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    {isAr ? AREA_CONFIG[area2].nameAr : AREA_CONFIG[area2].nameEn}
                  </span>
                </div>
                <Input
                  id="goal-2"
                  data-testid="weekly-goal-input-2"
                  placeholder={
                    isAr
                      ? "مثال: إتمام 4 جلسات تركيز بومودورو دون مقاطعة"
                      : "e.g., Complete 4 deep focus Pomodoro sprints"
                  }
                  value={goal2}
                  onChange={(e) => setGoal2(e.target.value)}
                  maxLength={160}
                  required
                  className="bg-surface-2 text-xs"
                />
              </div>

              {/* Goal 3: Wellbeing / Habits */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="goal-3" className="font-semibold text-foreground">
                    {isAr ? "الهدف 3 (النمو الشخصي والعادات)" : "Goal 3 (Personal Growth & Habits)"}
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    {isAr ? AREA_CONFIG[area3].nameAr : AREA_CONFIG[area3].nameEn}
                  </span>
                </div>
                <Input
                  id="goal-3"
                  data-testid="weekly-goal-input-3"
                  placeholder={
                    isAr
                      ? "مثال: كتابة يوميات التعلم ومراجعة الأخطاء يومياً"
                      : "e.g., Log daily learning reflection & mistakes journal"
                  }
                  value={goal3}
                  onChange={(e) => setGoal3(e.target.value)}
                  maxLength={160}
                  required
                  className="bg-surface-2 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              {weeklyGoals.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={submitting}
                  className="h-8 text-xs"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                data-testid="save-weekly-goals-btn"
                disabled={submitting}
                className="h-8 gap-1.5 bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {submitting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                <span>{isAr ? "حفظ أهداف الأسبوع في السحابة" : "Save 3 Weekly Goals"}</span>
              </Button>
            </div>
          </form>
        ) : (
          /* Display 3 Goals List */
          <div className="space-y-4">
            {/* Progress summary bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  {isAr ? "نسبة إنجاز الأسبوع" : "Weekly Goal Completion"}
                </span>
                <span className="font-display font-bold text-primary">
                  {formatNumber(completedCount, lang)}/{formatNumber(weeklyGoals.length, lang)} (
                  {formatNumber(progressPct, lang)}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* 3 Goal Items */}
            <div className="space-y-2">
              {weeklyGoals.map((goal, idx) => {
                const isDone = goal.status === "completed";
                const areaInfo = AREA_CONFIG[goal.area] ?? AREA_CONFIG.academic;
                return (
                  <div
                    key={goal.id}
                    data-testid={`weekly-goal-item-${idx}`}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl border p-3 transition-all",
                      isDone
                        ? "border-success/30 bg-success/5"
                        : "border-border/70 bg-surface-2/60 hover:border-primary/40",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        data-testid={`weekly-goal-toggle-${idx}`}
                        onClick={() => handleToggle(goal)}
                        className="shrink-0 transition-transform hover:scale-110"
                        title={
                          isDone
                            ? isAr
                              ? "إلغاء الإنجاز"
                              : "Mark incomplete"
                            : isAr
                              ? "إنجاز الهدف"
                              : "Mark complete"
                        }
                        aria-label={`${goal.title} - ${isDone ? "completed" : "incomplete"}`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="size-5 text-success" />
                        ) : (
                          <Circle className="size-5 text-muted-foreground hover:text-primary" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "truncate text-xs font-semibold md:text-sm",
                            isDone ? "text-muted-foreground line-through" : "text-foreground",
                          )}
                        >
                          {goal.title}
                        </p>
                        <span className="text-[11px] text-muted-foreground">
                          {isAr ? areaInfo.nameAr : areaInfo.nameEn}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isDone ? (
                        <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                          <CheckCircle2 className="size-3" />
                          <span>{isAr ? "مكتمل" : "Done"}</span>
                        </span>
                      ) : (
                        <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {isAr ? "قيد التقدم" : "In Progress"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {completedCount === weeklyGoals.length && (
              <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-3 text-xs font-semibold text-success">
                <Trophy className="size-4 shrink-0" />
                <span>
                  {isAr
                    ? "تهانينا! لقد حققت جميع أهداف هذا الأسبوع بنسبة 100%! 🎉"
                    : "Outstanding! You completed all 3 goals for this week! 🎉"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
