import type { GoalRow } from "./firestore-data";
import type { NotificationPrefs } from "./settings";
import type { Lang } from "./i18n-dict";
import { BRAND } from "../config/brand";

export interface GoalReminderParams {
  goals: GoalRow[];
  notifications: NotificationPrefs;
  lang?: Lang;
  onToastFallback?: (title: string, message: string) => void;
}

const LAST_REMINDER_DATE_KEY = "nexora_last_goal_reminder_date";
const LAST_THURSDAY_WEEKLY_REMINDER_KEY = "nexora_last_thursday_weekly_goal_reminder_week";

export function getIsoWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export interface ThursdayWeeklyReminderParams extends GoalReminderParams {
  nowOverride?: Date;
}

/**
 * Validates if the current local time falls within user-configured quiet hours.
 * Handles quiet periods spanning midnight (e.g. 22:00 to 07:00).
 */
export function isWithinQuietHours(
  currentHoursMinutes: string,
  start: string,
  end: string,
): boolean {
  if (!start || !end) return false;

  const toMinutes = (timeStr: string): number => {
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0] ?? "0", 10);
    const minutes = parseInt(parts[1] ?? "0", 10);
    return hours * 60 + minutes;
  };

  const current = toMinutes(currentHoursMinutes);
  const startMin = toMinutes(start);
  const endMin = toMinutes(end);

  if (startMin <= endMin) {
    // Normal window: e.g. 13:00 to 15:00
    return current >= startMin && current < endMin;
  }
  // Window crosses midnight: e.g. 22:00 to 07:00
  return current >= startMin || current < endMin;
}

/**
 * Returns formatted HH:mm in local time.
 */
export function getCurrentTimeStr(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Requests Notification API permission safely.
 */
export async function requestNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  try {
    return await Notification.requestPermission();
  } catch (err) {
    console.warn("Failed to request notification permission:", err);
    return "denied";
  }
}

/**
 * Inspects user goals and triggers a reminder if:
 * 1. User has reminders enabled in settings
 * 2. Current time is outside quiet hours
 * 3. User has active uncompleted daily goals
 * 4. User has not already received a daily reminder today
 */
export async function checkAndTriggerDailyGoalReminder({
  goals,
  notifications,
  lang = "en",
  onToastFallback,
}: GoalReminderParams): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!notifications.reminders) return false;

  const todayStr = new Date().toISOString().slice(0, 10);

  // Check if reminder was already delivered today
  try {
    const lastDelivered = localStorage.getItem(LAST_REMINDER_DATE_KEY);
    if (lastDelivered === todayStr) {
      return false;
    }
  } catch (err) {
    void err;
  }

  // Check Quiet Hours
  if (notifications.quietHoursEnabled) {
    const nowTime = getCurrentTimeStr();
    if (
      isWithinQuietHours(
        nowTime,
        notifications.quietStart || "22:00",
        notifications.quietEnd || "07:00",
      )
    ) {
      return false;
    }
  }

  // Count active incomplete daily goals
  const pendingGoals = goals.filter((g) => g.is_daily && g.status === "active");
  if (pendingGoals.length === 0) {
    return false;
  }

  const isArabic = lang === "ar";
  const title = isArabic
    ? `تذكير الأهداف اليومية — ${BRAND.shortName}`
    : `${BRAND.shortName} Daily Goal Reminder`;
  const goalNames = pendingGoals
    .map((g) => g.title)
    .slice(0, 2)
    .join(", ");
  const remainingCount = pendingGoals.length;

  const body = isArabic
    ? `لديك ${remainingCount} أهداف بانتظارك اليوم: ${goalNames}`
    : `You have ${remainingCount} daily goal(s) waiting for you: ${goalNames}`;

  let delivered = false;

  // Try Native Notification API
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "nexora-daily-goal",
      });
      delivered = true;
    } catch (err) {
      void err;
    }
  }

  // If not delivered natively, invoke in-app toast fallback
  if (!delivered && onToastFallback) {
    onToastFallback(title, body);
    delivered = true;
  }

  if (delivered) {
    try {
      localStorage.setItem(LAST_REMINDER_DATE_KEY, todayStr);
    } catch (err) {
      void err;
    }
  }

  return delivered;
}

/**
 * Checks on Thursdays (day === 4) whether the student has completed any 'This Week' goals.
 * Sends a local browser Notification (or toast fallback) once per ISO week when none are complete.
 */
export async function checkAndTriggerThursdayWeeklyGoalsReminder({
  goals,
  notifications,
  lang = "en",
  nowOverride,
  onToastFallback,
}: ThursdayWeeklyReminderParams): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!notifications.reminders) return false;

  const now = nowOverride ?? new Date();
  if (now.getDay() !== 4) {
    return false;
  }

  const weekKey = getIsoWeekKey(now);
  try {
    const lastWeek = localStorage.getItem(LAST_THURSDAY_WEEKLY_REMINDER_KEY);
    if (lastWeek === weekKey) {
      return false;
    }
  } catch (err) {
    void err;
  }

  if (notifications.quietHoursEnabled) {
    const nowTime = getCurrentTimeStr(now);
    if (
      isWithinQuietHours(
        nowTime,
        notifications.quietStart || "22:00",
        notifications.quietEnd || "07:00",
      )
    ) {
      return false;
    }
  }

  const thisWeekGoals = goals.filter(
    (g) => !g.is_daily && Boolean(g.target_date && g.target_date.startsWith(weekKey)),
  );
  const completedCount = thisWeekGoals.filter((g) => g.status === "completed").length;
  if (completedCount > 0) {
    return false;
  }

  const isArabic = lang === "ar";
  const title = isArabic
    ? `تذكير أهداف هذا الأسبوع — ${BRAND.shortName}`
    : `${BRAND.shortName} · Check Your 'This Week' Goals`;
  const body = isArabic
    ? thisWeekGoals.length > 0
      ? `اليوم الخميس ولم تكتمل أي من أهداف هذا الأسبوع (${thisWeekGoals.length}) بعد. راجع تقدمك الآن.`
      : "اليوم الخميس — تحقق من أهداف 'هذا الأسبوع' وأضف أو أنجز هدفاً واحداً على الأقل."
    : thisWeekGoals.length > 0
      ? `It is Thursday and none of your ${thisWeekGoals.length} 'This Week' goals are marked complete yet.`
      : "It is Thursday — check your 'This Week' goals and mark at least one milestone complete.";

  let delivered = false;
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: `nexora-thursday-weekly-${weekKey}`,
      });
      delivered = true;
    } catch (err) {
      void err;
    }
  }

  if (!delivered && onToastFallback) {
    onToastFallback(title, body);
    delivered = true;
  }

  if (delivered) {
    try {
      localStorage.setItem(LAST_THURSDAY_WEEKLY_REMINDER_KEY, weekKey);
    } catch (err) {
      void err;
    }
  }

  return delivered;
}
