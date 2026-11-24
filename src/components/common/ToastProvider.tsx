import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { toast as sonnerToast } from "sonner";
import { Check, CheckCircle2, Flame, Sparkles, Trophy } from "lucide-react";
import { LANG_META, normalizeLang, type Lang } from "@/lib/i18n/types";
import { useOptionalPrefs } from "@/lib/preferences";

export interface CustomToastApi {
  goalCompleted: (title: string, xp?: number) => void;
  milestoneAchieved: (title: string, xp?: number, subtitle?: string) => void;
  taskSaved: (title: string) => void;
  settingsUpdated: (sectionName?: string) => void;
  streakExtended: (days: number) => void;
  achievementUnlocked: (name: string, xp?: number) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
}

const TOAST_STRINGS: Record<
  Lang,
  {
    goalCompleted: string;
    congratsHeading: string;
    milestoneSub: string;
    taskSaved: string;
    settingsUpdated: string;
    streakActive: string;
    streakDays: (days: number) => string;
    achievementUnlocked: string;
  }
> = {
  en: {
    goalCompleted: "Goal Completed!",
    congratsHeading: "Congratulations!",
    milestoneSub: "New Growth Map milestone unlocked",
    taskSaved: "Task Saved",
    settingsUpdated: "Settings Updated",
    streakActive: "Streak Active!",
    streakDays: (d) => `${d} Day Daily Streak`,
    achievementUnlocked: "Achievement Unlocked!",
  },
  ar: {
    goalCompleted: "هدف مكتمل!",
    congratsHeading: "تهانينا!",
    milestoneSub: "تم فتح معلم جديد في خريطة النمو",
    taskSaved: "تم حفظ المهمة",
    settingsUpdated: "تم تحديث الإعدادات",
    streakActive: "حماسة مستمرة!",
    streakDays: (d) => `${d} أيام متتالية`,
    achievementUnlocked: "إنجاز جديد!",
  },
  ja: {
    goalCompleted: "目標達成！",
    congratsHeading: "おめでとうございます！",
    milestoneSub: "成長マップの新しいマイルストーンを達成しました",
    taskSaved: "タスクを保存しました",
    settingsUpdated: "設定を更新しました",
    streakActive: "連続記録達成！",
    streakDays: (d) => `${d}日連続`,
    achievementUnlocked: "実績解除！",
  },
  fr: {
    goalCompleted: "Objectif atteint !",
    congratsHeading: "Félicitations !",
    milestoneSub: "Nouveau jalon débloqué sur votre Carte de croissance",
    taskSaved: "Tâche enregistrée",
    settingsUpdated: "Paramètres mis à jour",
    streakActive: "Série active !",
    streakDays: (d) => `Série de ${d} jours`,
    achievementUnlocked: "Succès débloqué !",
  },
  de: {
    goalCompleted: "Ziel erreicht!",
    congratsHeading: "Herzlichen Glückwunsch!",
    milestoneSub: "Neuer Meilenstein auf deiner Wachstumskarte erreicht",
    taskSaved: "Aufgabe gespeichert",
    settingsUpdated: "Einstellungen aktualisiert",
    streakActive: "Serie aktiv!",
    streakDays: (d) => `${d}-Tage-Serie`,
    achievementUnlocked: "Erfolg freigeschaltet!",
  },
  "zh-CN": {
    goalCompleted: "目标完成！",
    congratsHeading: "恭喜你！",
    milestoneSub: "成长地图解锁全新里程碑",
    taskSaved: "任务已保存",
    settingsUpdated: "设置已更新",
    streakActive: "连续记录保持中！",
    streakDays: (d) => `连续学习 ${d} 天`,
    achievementUnlocked: "解锁新成就！",
  },
  ko: {
    goalCompleted: "목표 달성!",
    congratsHeading: "축하합니다!",
    milestoneSub: "성장 맵의 새 마일스톤을 달성했습니다",
    taskSaved: "작업 저장됨",
    settingsUpdated: "설정 업데이트됨",
    streakActive: "연속 기록 달성!",
    streakDays: (d) => `${d}일 연속 기록`,
    achievementUnlocked: "업적 달성!",
  },
};

const ToastContext = createContext<CustomToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const prefs = useOptionalPrefs();
  const lang = normalizeLang(prefs?.lang ?? "en");
  const dir = LANG_META[lang]?.dir ?? "ltr";
  const copy = TOAST_STRINGS[lang] ?? TOAST_STRINGS.en;
  const reduceMotion =
    Boolean(prefs?.a11y.reduceMotion) ||
    prefs?.effectiveAppearance.animationLevel === "none" ||
    Boolean(prefs?.ecosystem.lowBandwidth);

  const goalCompleted = useCallback(
    (title: string, xp = 50) => {
      sonnerToast.custom(
        () => (
          <div
            dir={dir}
            className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-emerald-500/35 bg-surface/95 p-3.5 text-foreground shadow-[0_12px_36px_-12px_rgba(16,185,129,0.3)] backdrop-blur-xl"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/35 bg-amber-500/15 text-amber-500">
              <Trophy className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                {copy.goalCompleted}
              </p>
              <p className="mt-0.5 truncate text-sm font-medium text-foreground">{title}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-bold tabular-nums text-emerald-500">
              <Sparkles className="size-3" />
              <span>+{xp} XP</span>
            </div>
          </div>
        ),
        { id: `goal-${title}`, duration: 3200 },
      );
    },
    [dir, copy.goalCompleted],
  );

  const milestoneAchieved = useCallback(
    (title: string, xp = 100, subtitle?: string) => {
      sonnerToast.custom(
        () => (
          <div
            dir={dir}
            role="status"
            aria-live="polite"
            data-testid="milestone-congrats-toast"
            data-reduced-motion={reduceMotion ? "true" : "false"}
            className={`${reduceMotion ? "" : "toast-congrats-card "}flex w-full max-w-sm items-center gap-3 rounded-xl border border-emerald-400/50 bg-surface/95 p-3.5 text-foreground shadow-[0_14px_40px_-10px_rgba(16,185,129,0.4)] backdrop-blur-xl`}
          >
            <div
              className={`${reduceMotion ? "" : "toast-congrats-sparkle "}flex size-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/45 bg-gradient-to-br from-emerald-500/25 via-primary/20 to-amber-500/25 text-amber-400 shadow-inner`}
            >
              <Trophy className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-500">
                <Sparkles className="size-3.5 shrink-0 text-amber-400" />
                <span>{copy.congratsHeading}</span>
              </div>
              <p className="mt-0.5 truncate text-sm font-bold text-foreground">{title}</p>
              <p className="truncate text-[0.7rem] text-muted-foreground">
                {subtitle || copy.milestoneSub}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-md border border-emerald-500/35 bg-emerald-500/15 px-2.5 py-1 text-xs font-bold tabular-nums text-emerald-500">
              <span>+{xp} XP</span>
            </div>
          </div>
        ),
        { id: `milestone-congrats-${title}`, duration: 4800 },
      );
    },
    [dir, copy.congratsHeading, copy.milestoneSub, reduceMotion],
  );

  const taskSaved = useCallback(
    (title: string) => {
      sonnerToast.custom(
        () => (
          <div
            dir={dir}
            className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-emerald-500/35 bg-surface/95 p-3.5 text-foreground shadow-[0_12px_36px_-12px_rgba(16,185,129,0.3)] backdrop-blur-xl"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-emerald-500">{copy.taskSaved}</p>
              <p className="truncate text-sm text-foreground">{title}</p>
            </div>
          </div>
        ),
        { id: `task-${title}`, duration: 3200 },
      );
    },
    [dir, copy.taskSaved],
  );

  const settingsUpdated = useCallback(
    (sectionName?: string) => {
      sonnerToast.custom(
        () => (
          <div
            dir={dir}
            className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-emerald-500/30 bg-surface/95 p-3.5 text-foreground shadow-[0_12px_36px_-12px_rgba(16,185,129,0.28)] backdrop-blur-xl"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-500">
              <Check className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{copy.settingsUpdated}</p>
              {sectionName && (
                <p className="truncate text-xs text-muted-foreground">{sectionName}</p>
              )}
            </div>
          </div>
        ),
        { id: "settings-updated", duration: 3200 },
      );
    },
    [dir, copy.settingsUpdated],
  );

  const streakExtended = useCallback(
    (days: number) => {
      sonnerToast.custom(
        () => (
          <div
            dir={dir}
            className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-orange-500/35 bg-surface/95 p-3.5 text-foreground shadow-[0_12px_36px_-12px_rgba(249,115,22,0.25)] backdrop-blur-xl"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/15 text-orange-500">
              <Flame className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
                {copy.streakActive}
              </p>
              <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                {copy.streakDays(days)}
              </p>
            </div>
          </div>
        ),
        { id: `streak-${days}`, duration: 3200 },
      );
    },
    [dir, copy],
  );

  const achievementUnlocked = useCallback(
    (name: string, xp = 100) => {
      sonnerToast.custom(
        () => (
          <div
            dir={dir}
            className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-emerald-500/35 bg-surface/95 p-3.5 text-foreground shadow-[0_12px_36px_-12px_rgba(16,185,129,0.3)] backdrop-blur-xl"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-500/35 bg-emerald-500/15 text-emerald-500">
              <Sparkles className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                {copy.achievementUnlocked}
              </p>
              <p className="mt-0.5 truncate text-sm font-medium text-foreground">{name}</p>
            </div>
            <div className="shrink-0 rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-500">
              +{xp} XP
            </div>
          </div>
        ),
        { id: `achievement-${name}`, duration: 3200 },
      );
    },
    [dir, copy.achievementUnlocked],
  );

  const success = useCallback((message: string, description?: string) => {
    sonnerToast.success(message, { description, duration: 3200 });
  }, []);

  const error = useCallback((message: string, description?: string) => {
    sonnerToast.error(message, { description, duration: 3800 });
  }, []);

  const info = useCallback((message: string, description?: string) => {
    sonnerToast.info(message, { description, duration: 3200 });
  }, []);

  const warning = useCallback((message: string, description?: string) => {
    sonnerToast.warning(message, { description, duration: 3500 });
  }, []);

  const value = useMemo<CustomToastApi>(
    () => ({
      goalCompleted,
      milestoneAchieved,
      taskSaved,
      settingsUpdated,
      streakExtended,
      achievementUnlocked,
      success,
      error,
      info,
      warning,
    }),
    [
      goalCompleted,
      milestoneAchieved,
      taskSaved,
      settingsUpdated,
      streakExtended,
      achievementUnlocked,
      success,
      error,
      info,
      warning,
    ],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): CustomToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      goalCompleted: (title, xp = 50) =>
        sonnerToast.success(`Goal Completed! ${title} (+${xp} XP)`, {
          id: `goal-${title}`,
          duration: 3200,
        }),
      milestoneAchieved: (title, xp = 100, subtitle) =>
        sonnerToast.success(`Congratulations! ${title} (+${xp} XP)`, {
          id: `milestone-congrats-${title}`,
          description: subtitle,
          duration: 4800,
        }),
      taskSaved: (title) =>
        sonnerToast.success(`Task Saved: ${title}`, { id: `task-${title}`, duration: 3200 }),
      settingsUpdated: (section) =>
        sonnerToast.success(`Settings Saved ${section ? `(${section})` : ""}`, {
          id: "settings-updated",
          duration: 3200,
        }),
      streakExtended: (days) =>
        sonnerToast.info(`Daily streak maintained: ${days} days!`, {
          id: `streak-${days}`,
          duration: 3200,
        }),
      achievementUnlocked: (name, xp = 100) =>
        sonnerToast.success(`Achievement Unlocked: ${name} (+${xp} XP)`, {
          id: `achievement-${name}`,
          duration: 3200,
        }),
      success: (msg, desc) => sonnerToast.success(msg, { description: desc, duration: 3200 }),
      error: (msg, desc) => sonnerToast.error(msg, { description: desc, duration: 3800 }),
      info: (msg, desc) => sonnerToast.info(msg, { description: desc, duration: 3200 }),
      warning: (msg, desc) => sonnerToast.warning(msg, { description: desc, duration: 3500 }),
    };
  }
  return ctx;
}
