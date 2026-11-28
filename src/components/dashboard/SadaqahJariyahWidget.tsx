import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  Check,
  Droplets,
  HandHeart,
  Heart,
  PencilLine,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  TreePine,
  Users,
} from "lucide-react";
import { SadaqahJariyahAndDuaaModal } from "@/components/islamic/SadaqahJariyahAndDuaaModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LANG_META, type Lang } from "@/lib/i18n-dict";
import { formatNumber } from "@/lib/locale-format";
import {
  SADAQAH_CATEGORIES,
  SADAQAH_FAMILY_EVENT,
  SADAQAH_FAMILY_STORAGE_KEY,
  SADAQAH_QUICK_PRESETS,
  clampGoalTarget,
  computeConsistencyMetrics,
  createInitialSadaqahState,
  loadSadaqahState,
  logSadaqahDeed,
  removeSadaqahDeed,
  saveSadaqahState,
  type ConsistencyCadence,
  type SadaqahCategoryId,
  type SadaqahQuickPreset,
  type SadaqahTrackerState,
} from "@/lib/sadaqah-jariyah";

interface SadaqahJariyahWidgetProps {
  lang?: string;
  className?: string;
}

const CATEGORY_ICONS: Record<SadaqahCategoryId, React.ComponentType<{ className?: string }>> = {
  knowledge: BookOpen,
  charity: HandHeart,
  family: Heart,
  community: TreePine,
  water_food: Droplets,
  quran_dhikr: BookOpenCheck,
};

const PRESET_TARGETS: Record<ConsistencyCadence, readonly number[]> = {
  daily: [1, 2, 3, 5],
  weekly: [3, 7, 14, 21],
  monthly: [15, 30, 60, 100],
};

export const SadaqahJariyahWidget: React.FC<SadaqahJariyahWidgetProps> = ({
  lang = "ar",
  className = "",
}) => {
  const isAr = lang === "ar";
  const localeLang: Lang = lang in LANG_META ? (lang as Lang) : "en";
  const [tracker, setTracker] = useState<SadaqahTrackerState>(() => createInitialSadaqahState());
  const [familyNames, setFamilyNames] = useState<string>("");
  const isMountedRef = React.useRef(false);

  const [editingFamily, setEditingFamily] = useState(false);
  const [familyDraft, setFamilyDraft] = useState("");
  const [showGoalEditor, setShowGoalEditor] = useState(false);

  const [draftCadence, setDraftCadence] = useState<ConsistencyCadence>(tracker.goalCadence);
  const [draftTarget, setDraftTarget] = useState<string>(String(tracker.goalTarget));
  const [draftIntention, setDraftIntention] = useState<string>(tracker.goalIntention);

  const [customTitle, setCustomTitle] = useState("");
  const [customCategory, setCustomCategory] = useState<SadaqahCategoryId>("charity");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    setTracker(loadSadaqahState());
    try {
      const saved = window.localStorage.getItem(SADAQAH_FAMILY_STORAGE_KEY) ?? "";
      setFamilyNames(saved);
      setFamilyDraft(saved);
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    saveSadaqahState(tracker);
  }, [tracker]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncFamily = () => {
      try {
        const latest = window.localStorage.getItem(SADAQAH_FAMILY_STORAGE_KEY) ?? "";
        setFamilyNames(latest);
        setFamilyDraft(latest);
      } catch {
        // Ignore storage errors
      }
    };
    window.addEventListener(SADAQAH_FAMILY_EVENT, syncFamily);
    window.addEventListener("storage", syncFamily);
    return () => {
      window.removeEventListener(SADAQAH_FAMILY_EVENT, syncFamily);
      window.removeEventListener("storage", syncFamily);
    };
  }, []);

  const metrics = useMemo(() => computeConsistencyMetrics(tracker), [tracker]);

  const showTransientNotice = (msg: string) => {
    setFeedbackMessage(msg);
    window.setTimeout(() => {
      setFeedbackMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const handleSaveFamily = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = familyDraft.trim().slice(0, 120);
    setFamilyNames(cleaned);
    setEditingFamily(false);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(SADAQAH_FAMILY_STORAGE_KEY, cleaned);
        window.dispatchEvent(new CustomEvent(SADAQAH_FAMILY_EVENT));
      } catch {
        // Ignore
      }
    }
    showTransientNotice(
      isAr ? "تم تحديث نية الإهداء للعائلة بنجاح" : "Family dedication saved locally",
    );
  };

  const handleQuickLog = (category: SadaqahCategoryId) => {
    const meta = SADAQAH_CATEGORIES.find((c) => c.id === category) ?? SADAQAH_CATEGORIES[0]!;
    const deedTitle = isAr ? meta.defaultDeedAr : meta.defaultDeedEn;
    setTracker((prev) =>
      logSadaqahDeed(prev, {
        category,
        title: deedTitle,
        dedicatedTo: familyNames,
      }),
    );
    showTransientNotice(
      isAr ? `تقبّل الله: ${meta.labelAr} لك ولأهلك` : `Logged sincerely: ${meta.labelEn}`,
    );
  };

  const handlePresetLog = (preset: SadaqahQuickPreset) => {
    const title = isAr ? preset.titleAr : preset.titleEn;
    setTracker((prev) =>
      logSadaqahDeed(prev, {
        category: preset.category,
        title,
        dedicatedTo: familyNames,
      }),
    );
    showTransientNotice(
      isAr ? `تقبّل الله نيتك الصالحة: ${title} عنك وعن أهلك` : `Logged: ${title} for family`,
    );
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customTitle.trim();
    if (!cleaned) return;
    setTracker((prev) =>
      logSadaqahDeed(prev, {
        category: customCategory,
        title: cleaned,
        dedicatedTo: familyNames,
      }),
    );
    setCustomTitle("");
    showTransientNotice(
      isAr ? "تم تسجيل الأثر الصالح في ميزان الصدقة الجارية" : "Charitable deed logged",
    );
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = clampGoalTarget(Number(draftTarget));
    const cleanedIntention = draftIntention.trim().slice(0, 140);
    setTracker((prev) => ({
      ...prev,
      goalCadence: draftCadence,
      goalTarget: parsedTarget,
      goalIntention: cleanedIntention,
    }));
    setDraftTarget(String(parsedTarget));
    setShowGoalEditor(false);
    showTransientNotice(isAr ? "تم حفظ هدف الاستمرارية طويل المدى" : "Consistency goal updated");
  };

  const handleRemoveEntry = (entryId: string) => {
    setTracker((prev) => removeSadaqahDeed(prev, entryId));
  };

  const cadenceLabel =
    tracker.goalCadence === "daily"
      ? isAr
        ? "يومي"
        : "Daily"
      : tracker.goalCadence === "monthly"
        ? isAr
          ? "شهري"
          : "Monthly"
        : isAr
          ? "أسبوعي"
          : "Weekly";

  const activeDedicationDisplay =
    familyNames.trim() ||
    (isAr
      ? "عني وعن والديّ وأهلي وعن يوسف وائل وأهله"
      : "For myself, my parents & family, and Yousef Wael's family");

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      data-testid="sadaqah-jariyah-widget"
      aria-label={isAr ? "عداد الصدقة الجارية والاستمرارية" : "Sadaqah Jariyah Impact Counter"}
      className={`surface-card flex flex-col justify-between space-y-5 border border-emerald-500/25 p-5 sm:p-6 ${className}`}
    >
      {/* Header Row */}
      <div className="space-y-3 border-b border-border/70 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-700 dark:text-emerald-400">
              <HandHeart className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                <span>{isAr ? "صدقة جارية للعائلة" : "Family Sadaqah Jariyah"}</span>
                <span aria-hidden="true">·</span>
                <span>{isAr ? "خالص لله (0 نقاط)" : "Pure Intention · 0 XP"}</span>
              </div>
              <h3 className="mt-0.5 font-display text-base font-bold text-foreground sm:text-lg">
                {isAr ? "عداد الأثر الصالح والاستمرارية" : "Ongoing Charity & Impact Tracker"}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              type="button"
              variant={showGoalEditor ? "secondary" : "outline"}
              size="sm"
              data-testid="sadaqah-goal-toggle-btn"
              aria-expanded={showGoalEditor}
              onClick={() => {
                setDraftCadence(tracker.goalCadence);
                setDraftTarget(String(tracker.goalTarget));
                setDraftIntention(tracker.goalIntention);
                setShowGoalEditor((v) => !v);
              }}
              className="min-h-[40px] gap-1.5 px-3 text-xs font-semibold whitespace-nowrap shrink-0"
            >
              <Target className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isAr ? "هدف الاستمرارية" : "Set Goal"}</span>
            </Button>

            <SadaqahJariyahAndDuaaModal
              lang={lang}
              trigger={
                <button
                  type="button"
                  data-testid="sadaqah-widget-duaa-btn"
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-colors hover:bg-emerald-500/20 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Heart className="size-3.5" />
                  <span>{isAr ? "دعاء للأهل" : "Family Duaa"}</span>
                </button>
              }
            />
          </div>
        </div>

        {/* Dedicated Family Line + Quick Inline Edit */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 min-w-0">
            <Users className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="truncate">
              <strong className="font-semibold text-foreground">
                {isAr ? "بنية الصدقة الجارية:" : "Dedicated to:"}
              </strong>{" "}
              {activeDedicationDisplay}
            </span>
          </div>
          <button
            type="button"
            data-testid="sadaqah-edit-family-btn"
            onClick={() => {
              setFamilyDraft(familyNames);
              setEditingFamily((v) => !v);
            }}
            className="inline-flex min-h-[32px] items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PencilLine className="size-3.5" />
            <span>{isAr ? "تخصيص الأسماء" : "Edit family"}</span>
          </button>
        </div>

        {editingFamily && (
          <form onSubmit={handleSaveFamily} className="flex flex-col gap-2 pt-1 sm:flex-row">
            <Input
              type="text"
              data-testid="sadaqah-family-input"
              aria-label={isAr ? "أسماء الأهل المشمولين بالصدقة" : "Family dedication names"}
              value={familyDraft}
              onChange={(e) => setFamilyDraft(e.target.value)}
              maxLength={120}
              placeholder={
                isAr
                  ? "مثال: عن والديّ وإخوتي وأجدادي وأهلي جميعاً"
                  : "e.g. For my parents, grandparents & whole family"
              }
              className="min-h-[40px] flex-1 text-xs"
            />
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="submit"
                size="sm"
                data-testid="sadaqah-save-family-btn"
                className="min-h-[40px] bg-emerald-700 px-4 text-xs font-semibold text-white hover:bg-emerald-600"
              >
                {isAr ? "حفظ الإهداء" : "Save"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingFamily(false)}
                className="min-h-[40px] px-3 text-xs"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Long-Term Consistency Goal Editor */}
      {showGoalEditor && (
        <form
          onSubmit={handleSaveGoal}
          data-testid="sadaqah-goal-panel"
          className="space-y-3 border-b border-border/70 pb-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-foreground">
              {isAr ? "إعداد هدف الاستمرارية طويل المدى" : "Long-Term Consistency Goal Settings"}
            </span>
            <div
              role="group"
              aria-label={isAr ? "فترة الهدف" : "Goal cadence"}
              className="inline-flex items-center gap-1 rounded-lg bg-surface-2 p-1"
            >
              {(["daily", "weekly", "monthly"] as const).map((cadence) => (
                <button
                  key={cadence}
                  type="button"
                  data-testid={`sadaqah-cadence-${cadence}`}
                  onClick={() => {
                    setDraftCadence(cadence);
                    const suggested = cadence === "daily" ? 1 : cadence === "monthly" ? 30 : 7;
                    setDraftTarget(String(suggested));
                  }}
                  className={`min-h-[34px] rounded-md px-3 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    draftCadence === cadence
                      ? "bg-surface text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cadence === "daily"
                    ? isAr
                      ? "يومي"
                      : "Daily"
                    : cadence === "weekly"
                      ? isAr
                        ? "أسبوعي"
                        : "Weekly"
                      : isAr
                        ? "شهري"
                        : "Monthly"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
            <div className="space-y-1.5 sm:col-span-5">
              <label
                htmlFor="sadaqah-goal-target"
                className="block text-xs font-medium text-muted-foreground"
              >
                {isAr ? "الهدف العددي للأعمال" : "Target Deeds"}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="sadaqah-goal-target"
                  data-testid="sadaqah-goal-target-input"
                  type="number"
                  min={1}
                  max={365}
                  value={draftTarget}
                  onChange={(e) => setDraftTarget(e.target.value)}
                  className="min-h-[40px] w-24 font-mono tabular-nums text-xs"
                />
                <div className="flex flex-wrap gap-1">
                  {PRESET_TARGETS[draftCadence].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDraftTarget(String(preset))}
                      className="min-h-[36px] rounded-md border border-border px-2.5 text-xs font-mono tabular-nums text-muted-foreground hover:border-emerald-500/50 hover:text-foreground cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-7">
              <label
                htmlFor="sadaqah-goal-intention"
                className="block text-xs font-medium text-muted-foreground"
              >
                {isAr ? "النية الدائمة طويلة الأمد (اختياري)" : "Long-Term Aim (Optional)"}
              </label>
              <Input
                id="sadaqah-goal-intention"
                data-testid="sadaqah-goal-intention-input"
                type="text"
                maxLength={140}
                value={draftIntention}
                onChange={(e) => setDraftIntention(e.target.value)}
                placeholder={
                  isAr
                    ? "مثال: أثر يومي لا ينقطع عن والديّ وأهلي"
                    : "e.g. Never skip a day of benefit for my family"
                }
                className="min-h-[40px] text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowGoalEditor(false)}
              className="min-h-[40px] px-4 text-xs"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              size="sm"
              data-testid="sadaqah-save-goal-btn"
              className="min-h-[40px] bg-emerald-700 px-4 text-xs font-semibold text-white hover:bg-emerald-600"
            >
              {isAr ? "حفظ هدف الاستمرارية" : "Save Consistency Goal"}
            </Button>
          </div>
        </form>
      )}

      {/* Unboxed 3-Metric Counter & Goal Consistency Strip */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 divide-x divide-border/70 rtl:divide-x-reverse">
          <div className="pe-3">
            <div className="text-[11px] font-medium text-muted-foreground">
              {isAr ? "إجمالي الأثر" : "Total Impact"}
            </div>
            <div
              data-testid="sadaqah-total-count"
              className="mt-1 font-display text-2xl font-bold text-foreground tabular-nums"
            >
              {formatNumber(tracker.totalDeeds, localeLang)}
            </div>
          </div>

          <div className="px-3">
            <div className="text-[11px] font-medium text-muted-foreground">
              {isAr ? `الهدف (${cadenceLabel})` : `${cadenceLabel} Goal`}
            </div>
            <div
              data-testid="sadaqah-period-progress-text"
              className="mt-1 font-display text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums"
            >
              {formatNumber(metrics.periodCount, localeLang)} /{" "}
              {formatNumber(tracker.goalTarget, localeLang)}
            </div>
          </div>

          <div className="ps-3">
            <div className="text-[11px] font-medium text-muted-foreground">
              {isAr ? "أيام الاستمرارية" : "Consistency"}
            </div>
            <div
              data-testid="sadaqah-consistency-days"
              className="mt-1 flex items-baseline gap-1 font-display text-xl sm:text-2xl font-bold text-foreground tabular-nums"
            >
              <span>{formatNumber(metrics.consecutiveDays, localeLang)}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {isAr ? "يوم" : "days"}
              </span>
            </div>
          </div>
        </div>

        {/* Long-term Goal Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 truncate">
              <CalendarCheck className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="truncate">
                {tracker.goalIntention
                  ? tracker.goalIntention
                  : isAr
                    ? `أحب الأعمال إلى الله أدومها وإن قلّ · ${metrics.activeDaysTotal} أيام نشطة`
                    : `Most beloved deeds are consistent ones · ${metrics.activeDaysTotal} active days`}
              </span>
            </span>
            <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums shrink-0">
              {formatNumber(metrics.periodProgressPct, localeLang)}%
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={tracker.goalTarget}
            aria-valuenow={metrics.periodCount}
            aria-label={isAr ? "تقدم هدف الصدقة الجارية" : "Sadaqah Jariyah goal progress"}
            className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
          >
            <div
              className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
              style={{ width: `${metrics.periodProgressPct}%` }}
            />
          </div>

          {metrics.goalReached && (
            <div
              role="status"
              data-testid="sadaqah-goal-reached-banner"
              className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 pt-0.5"
            >
              <Check className="size-3.5 shrink-0" />
              <span>
                {isAr
                  ? "تقبّل الله منك ومن أهلك — حققت هدفك لهذه الفترة وبقي أثره جارياً."
                  : "Goal achieved for this period — may Allah accept and keep its reward ongoing for you and your family."}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4-Category Quick Log Buttons */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold text-muted-foreground">
            {isAr
              ? "سجّل عملاً صالحاً من أبواب البر الستة (+1):"
              : "Log Positive Impact by Category (+1):"}
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            {isAr ? "أثر دائم جارٍ بإذن الله" : "Ongoing impact & blessings"}
          </span>
        </div>

        {/* 6 Categories Grid */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {SADAQAH_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id];
            const catCount = tracker.categoryCounts[cat.id] ?? 0;
            return (
              <button
                key={cat.id}
                type="button"
                data-testid={`sadaqah-log-${cat.id}`}
                onClick={() => handleQuickLog(cat.id)}
                className="group flex min-h-[52px] items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-surface-2/50 px-3.5 py-2.5 text-start transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/8 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/12 text-emerald-700 dark:text-emerald-400">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-foreground">
                      {isAr ? cat.labelAr : cat.labelEn}
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {isAr ? cat.hintAr : cat.hintEn}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  <span>{formatNumber(catCount, localeLang)}</span>
                  <Plus className="size-3.5 transition-transform group-hover:scale-110" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick High-Impact Presets Bar */}
        <div className="pt-1 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              {isAr ? "مضاعفات سريعة للصدقة الجارية بنقرة واحدة (+1):" : "Quick Multipliers (+1):"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SADAQAH_QUICK_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                data-testid={`sadaqah-preset-${preset.id}`}
                onClick={() => handlePresetLog(preset)}
                className="min-h-[32px] px-2.5 py-1 rounded-lg border border-border/70 bg-surface-2/60 text-xs text-foreground font-medium hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span className="text-[10px] text-emerald-600 font-bold">+1</span>
                <span>{isAr ? preset.titleAr : preset.titleEn}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Positive Impact Form */}
      <form
        onSubmit={handleCustomSubmit}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <Input
          type="text"
          data-testid="sadaqah-custom-input"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          maxLength={140}
          placeholder={
            isAr
              ? "أضف عملاً خاصاً (مثال: سقيا ماء، شرح درس لزميل، صدقة خفية)..."
              : "Log a custom good deed (e.g. water charity, shared summary)..."
          }
          className="min-h-[42px] flex-1 text-xs"
        />

        <div className="flex items-center gap-2 shrink-0">
          <select
            aria-label={isAr ? "تصنيف العمل" : "Deed category"}
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value as SadaqahCategoryId)}
            className="min-h-[42px] rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-medium text-foreground focus:border-emerald-500 focus:outline-none"
          >
            {SADAQAH_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {isAr ? c.labelAr : c.labelEn}
              </option>
            ))}
          </select>

          <Button
            type="submit"
            disabled={!customTitle.trim()}
            data-testid="sadaqah-custom-submit-btn"
            className="min-h-[42px] bg-emerald-700 px-4 text-xs font-semibold text-white hover:bg-emerald-600 whitespace-nowrap shrink-0"
          >
            {isAr ? "تسجيل" : "Log Deed"}
          </Button>
        </div>
      </form>

      {feedbackMessage && (
        <div role="status" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          {feedbackMessage}
        </div>
      )}

      {/* Recent Deeds Log / Empty Guidance */}
      <div className="border-t border-border/70 pt-3">
        {tracker.recentDeeds.length === 0 ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {isAr
              ? "لم تسجل أي عمل بعد اليوم — اضغط على أحد الأبواب أعلاه أو أضف عملاً صالحاً بنية الصدقة الجارية عنك وعن أهلك."
              : "No deeds logged yet — tap a quick category above or enter a custom act of kindness for yourself and your family."}
          </p>
        ) : (
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-muted-foreground">
              {isAr ? "أحدث الآثار المسجلة" : "Recent Logged Deeds"}
            </div>
            <ul className="divide-y divide-border/50">
              {tracker.recentDeeds.slice(0, 3).map((entry) => {
                const cat = SADAQAH_CATEGORIES.find((c) => c.id === entry.category);
                return (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-2 py-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{entry.title}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        <span>{isAr ? cat?.labelAr : cat?.labelEn}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono tabular-nums">{entry.dateKey}</span>
                        {entry.dedicatedTo && (
                          <>
                            <span aria-hidden="true"> · </span>
                            <span>{entry.dedicatedTo}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEntry(entry.id)}
                      aria-label={isAr ? `تراجع عن ${entry.title}` : `Undo ${entry.title}`}
                      title={isAr ? "تراجع" : "Undo entry"}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-destructive cursor-pointer"
                    >
                      <RotateCcw className="size-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};
