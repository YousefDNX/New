import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type {
  FocusSessionRow,
  GoalRow,
  GrowthArea,
  JournalEntryRow,
  QuizAttemptRow,
  StudyItemRow,
  TaskRow,
} from "./firestore-data";
import { BRAND } from "../config/brand.ts";

export type CalendarEventFilter = "all" | "deadlines" | "study";
export type CalendarViewMode = "month" | "week" | "day" | "agenda";
export type FirstDayOfWeekPref = "sunday" | "monday" | "saturday";

export interface CalendarDeadlineItem {
  id: string;
  kind: "task" | "goal";
  title: string;
  dateIso: string;
  status: "open" | "done";
  priority?: "low" | "medium" | "high" | undefined;
  area?: GrowthArea | undefined;
  subject?: string | null | undefined;
  overdue: boolean;
  sourceTask?: TaskRow | undefined;
  sourceGoal?: GoalRow | undefined;
}

export interface CalendarStudySessionItem {
  id: string;
  kind: "focus" | "quiz";
  title: string;
  dateIso: string;
  subject: string | null;
  durationMinutes: number;
  scorePct?: number | undefined;
  createdAt: string;
}

export interface CalendarDayCell {
  iso: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  deadlines: CalendarDeadlineItem[];
  openDeadlinesCount: number;
  overdueDeadlinesCount: number;
  studySessions: CalendarStudySessionItem[];
  studyMinutesTotal: number;
  journalEntriesCount: number;
  dueFlashcardsCount: number;
  heatLevel: 0 | 1 | 2 | 3 | 4;
}

export interface CalendarMonthOverview {
  totalFocusMinutes: number;
  studySessionCount: number;
  upcomingDeadlinesCount: number;
  overdueDeadlinesCount: number;
  journalDaysCount: number;
}

function weekStartsOnIndex(firstDay: FirstDayOfWeekPref): 0 | 1 | 6 {
  if (firstDay === "monday") return 1;
  if (firstDay === "saturday") return 6;
  return 0;
}

/**
 * Returns 7 short localized weekday labels starting from the user's configured `firstDayOfWeek`.
 */
export function getOrderedWeekdayLabels(
  firstDayOfWeek: FirstDayOfWeekPref,
  localeTag = "en",
): string[] {
  // 2026-11-01 is a known Sunday in UTC
  const baseSunday = new Date(Date.UTC(2026, 10, 1, 12, 0, 0));
  const offset = weekStartsOnIndex(firstDayOfWeek);
  const fmt = new Intl.DateTimeFormat(localeTag, { weekday: "short", timeZone: "UTC" });
  const labels: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dayIdx = (offset + i) % 7;
    const d = new Date(baseSunday.getTime() + dayIdx * 86400_000);
    labels.push(fmt.format(d));
  }
  return labels;
}

function extractDateIso(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const candidate = raw.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(candidate) ? candidate : null;
}

export function normalizeCalendarItems(params: {
  tasks: TaskRow[];
  goals: GoalRow[];
  focusSessions: FocusSessionRow[];
  quizAttempts: QuizAttemptRow[];
  todayIso?: string;
}): {
  deadlines: CalendarDeadlineItem[];
  studySessions: CalendarStudySessionItem[];
} {
  const todayIso = params.todayIso ?? new Date().toISOString().slice(0, 10);
  const deadlines: CalendarDeadlineItem[] = [];

  for (const t of params.tasks) {
    const dateIso = extractDateIso(t.due_at);
    if (!dateIso) continue;
    const done = t.status === "done" || t.status === "cancelled";
    deadlines.push({
      id: `task_${t.id}`,
      kind: "task",
      title: t.title,
      dateIso,
      status: done ? "done" : "open",
      priority: t.priority,
      area: t.area,
      subject: t.subject,
      overdue: !done && dateIso < todayIso,
      sourceTask: t,
    });
  }

  for (const g of params.goals) {
    const dateIso = extractDateIso(g.target_date);
    if (!dateIso) continue;
    const done = g.status === "completed";
    deadlines.push({
      id: `goal_${g.id}`,
      kind: "goal",
      title: g.title,
      dateIso,
      status: done ? "done" : "open",
      area: g.area,
      overdue: !done && dateIso < todayIso,
      sourceGoal: g,
    });
  }

  deadlines.sort((a, b) => {
    const dateCmp = a.dateIso.localeCompare(b.dateIso);
    if (dateCmp !== 0) return dateCmp;
    if (a.status !== b.status) return a.status === "open" ? -1 : 1;
    return a.title.localeCompare(b.title);
  });

  const studySessions: CalendarStudySessionItem[] = [];

  for (const fs of params.focusSessions) {
    const dateIso = extractDateIso(fs.created_at);
    if (!dateIso) continue;
    studySessions.push({
      id: `focus_${fs.id}`,
      kind: "focus",
      title: fs.title,
      dateIso,
      subject: fs.subject,
      durationMinutes: Number(fs.duration_minutes) || 0,
      createdAt: fs.created_at,
    });
  }

  for (const qa of params.quizAttempts) {
    const dateIso = extractDateIso(qa.created_at);
    if (!dateIso) continue;
    studySessions.push({
      id: `quiz_${qa.id}`,
      kind: "quiz",
      title: qa.subject,
      dateIso,
      subject: qa.subject,
      durationMinutes: Math.max(5, Math.round((Number(qa.total_questions) || 1) * 1.5)),
      scorePct: qa.score_pct,
      createdAt: qa.created_at,
    });
  }

  studySessions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return { deadlines, studySessions };
}

function populateCalendarCells(params: {
  gridStart: Date;
  gridEnd: Date;
  referenceMonthDate: Date;
  tasks: TaskRow[];
  goals: GoalRow[];
  focusSessions: FocusSessionRow[];
  quizAttempts: QuizAttemptRow[];
  journalEntries?: Pick<JournalEntryRow, "entry_date">[];
  studyItems?: Pick<StudyItemRow, "kind" | "next_review_at">[];
  todayIso: string;
}): CalendarDayCell[] {
  const monthStart = startOfMonth(params.referenceMonthDate);
  const { deadlines, studySessions } = normalizeCalendarItems({
    tasks: params.tasks,
    goals: params.goals,
    focusSessions: params.focusSessions,
    quizAttempts: params.quizAttempts,
    todayIso: params.todayIso,
  });

  const deadlinesByDay = new Map<string, CalendarDeadlineItem[]>();
  for (const item of deadlines) {
    const arr = deadlinesByDay.get(item.dateIso) ?? [];
    arr.push(item);
    deadlinesByDay.set(item.dateIso, arr);
  }

  const sessionsByDay = new Map<string, CalendarStudySessionItem[]>();
  for (const s of studySessions) {
    const arr = sessionsByDay.get(s.dateIso) ?? [];
    arr.push(s);
    sessionsByDay.set(s.dateIso, arr);
  }

  const journalByDay = new Map<string, number>();
  for (const j of params.journalEntries ?? []) {
    const iso = extractDateIso(j.entry_date);
    if (iso) journalByDay.set(iso, (journalByDay.get(iso) ?? 0) + 1);
  }

  const dueCardsByDay = new Map<string, number>();
  for (const s of params.studyItems ?? []) {
    if (s.kind !== "flashcard") continue;
    const dueIso = extractDateIso(s.next_review_at);
    if (dueIso) {
      dueCardsByDay.set(dueIso, (dueCardsByDay.get(dueIso) ?? 0) + 1);
    }
  }

  const cells: CalendarDayCell[] = [];
  let cursor = params.gridStart;
  while (cursor <= params.gridEnd) {
    const iso = format(cursor, "yyyy-MM-dd");
    const dayDeadlines = deadlinesByDay.get(iso) ?? [];
    const daySessions = sessionsByDay.get(iso) ?? [];
    const studyMinutesTotal = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const journalEntriesCount = journalByDay.get(iso) ?? 0;
    const dueFlashcardsCount = dueCardsByDay.get(iso) ?? 0;

    const heatScore = studyMinutesTotal + journalEntriesCount * 20;
    const heatLevel: 0 | 1 | 2 | 3 | 4 =
      heatScore <= 0 ? 0 : heatScore >= 120 ? 4 : heatScore >= 60 ? 3 : heatScore >= 25 ? 2 : 1;

    cells.push({
      iso,
      dayNumber: cursor.getDate(),
      inCurrentMonth: isSameMonth(cursor, monthStart),
      isToday: iso === params.todayIso,
      deadlines: dayDeadlines,
      openDeadlinesCount: dayDeadlines.filter((d) => d.status === "open").length,
      overdueDeadlinesCount: dayDeadlines.filter((d) => d.overdue).length,
      studySessions: daySessions,
      studyMinutesTotal,
      journalEntriesCount,
      dueFlashcardsCount,
      heatLevel,
    });

    cursor = addDays(cursor, 1);
  }

  return cells;
}

/**
 * Builds a complete localized month calendar matrix (always full weeks aligned to `firstDayOfWeek`)
 * powered by `date-fns` and pre-populated with deadlines, study session history, journals, and due cards.
 */
export function buildCalendarMonthGrid(params: {
  monthDate: Date;
  firstDayOfWeek: FirstDayOfWeekPref;
  tasks: TaskRow[];
  goals: GoalRow[];
  focusSessions: FocusSessionRow[];
  quizAttempts: QuizAttemptRow[];
  journalEntries?: Pick<JournalEntryRow, "entry_date">[];
  studyItems?: Pick<StudyItemRow, "kind" | "next_review_at">[];
  todayIso?: string;
}): CalendarDayCell[] {
  const todayIso = params.todayIso ?? format(new Date(), "yyyy-MM-dd");
  const weekStartsOn = weekStartsOnIndex(params.firstDayOfWeek);

  const monthStart = startOfMonth(params.monthDate);
  const monthEnd = endOfMonth(params.monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn });

  return populateCalendarCells({
    gridStart,
    gridEnd,
    referenceMonthDate: params.monthDate,
    tasks: params.tasks,
    goals: params.goals,
    focusSessions: params.focusSessions,
    quizAttempts: params.quizAttempts,
    ...(params.journalEntries ? { journalEntries: params.journalEntries } : {}),
    ...(params.studyItems ? { studyItems: params.studyItems } : {}),
    todayIso,
  });
}

/**
 * Builds a 7-day week view centered around `focusDate` aligned to `firstDayOfWeek`.
 */
export function buildCalendarWeekGrid(params: {
  focusDate: Date;
  firstDayOfWeek: FirstDayOfWeekPref;
  tasks: TaskRow[];
  goals: GoalRow[];
  focusSessions: FocusSessionRow[];
  quizAttempts: QuizAttemptRow[];
  journalEntries?: Pick<JournalEntryRow, "entry_date">[];
  studyItems?: Pick<StudyItemRow, "kind" | "next_review_at">[];
  todayIso?: string;
}): CalendarDayCell[] {
  const todayIso = params.todayIso ?? format(new Date(), "yyyy-MM-dd");
  const weekStartsOn = weekStartsOnIndex(params.firstDayOfWeek);
  const gridStart = startOfWeek(params.focusDate, { weekStartsOn });
  const gridEnd = addDays(gridStart, 6);

  return populateCalendarCells({
    gridStart,
    gridEnd,
    referenceMonthDate: params.focusDate,
    tasks: params.tasks,
    goals: params.goals,
    focusSessions: params.focusSessions,
    quizAttempts: params.quizAttempts,
    ...(params.journalEntries ? { journalEntries: params.journalEntries } : {}),
    ...(params.studyItems ? { studyItems: params.studyItems } : {}),
    todayIso,
  });
}

export function getUpcomingDeadlines(params: {
  tasks: TaskRow[];
  goals: GoalRow[];
  todayIso?: string;
  horizonDays?: number;
}): CalendarDeadlineItem[] {
  const todayIso = params.todayIso ?? format(new Date(), "yyyy-MM-dd");
  const horizonDays = params.horizonDays ?? 14;
  const cutoffIso = format(addDays(parseISO(todayIso), horizonDays), "yyyy-MM-dd");

  const { deadlines } = normalizeCalendarItems({
    tasks: params.tasks,
    goals: params.goals,
    focusSessions: [],
    quizAttempts: [],
    todayIso,
  });

  return deadlines.filter(
    (d) => d.status === "open" && (d.overdue || (d.dateIso >= todayIso && d.dateIso <= cutoffIso)),
  );
}

export function summarizeCalendarMonth(cells: CalendarDayCell[]): CalendarMonthOverview {
  let totalFocusMinutes = 0;
  let studySessionCount = 0;
  let upcomingDeadlinesCount = 0;
  let overdueDeadlinesCount = 0;
  let journalDaysCount = 0;

  for (const cell of cells) {
    if (!cell.inCurrentMonth) continue;
    totalFocusMinutes += cell.studyMinutesTotal;
    studySessionCount += cell.studySessions.length;
    upcomingDeadlinesCount += cell.openDeadlinesCount;
    overdueDeadlinesCount += cell.overdueDeadlinesCount;
    if (cell.journalEntriesCount > 0) journalDaysCount += 1;
  }

  return {
    totalFocusMinutes,
    studySessionCount,
    upcomingDeadlinesCount,
    overdueDeadlinesCount,
    journalDaysCount,
  };
}

export interface WeeklyStudyProgress {
  weekStartIso: string;
  weekEndIso: string;
  minutesCompleted: number;
  targetMinutes: number;
  pct: number;
  sessionsCount: number;
}

export function computeWeeklyStudyProgress(params: {
  focusSessions: FocusSessionRow[];
  quizAttempts: QuizAttemptRow[];
  firstDayOfWeek: FirstDayOfWeekPref;
  referenceDate?: Date;
  weeklyTargetMinutes?: number;
}): WeeklyStudyProgress {
  const ref = params.referenceDate ?? new Date();
  const weekStartsOn = weekStartsOnIndex(params.firstDayOfWeek);
  const wStart = startOfWeek(ref, { weekStartsOn });
  const wEnd = endOfWeek(ref, { weekStartsOn });
  const weekStartIso = format(wStart, "yyyy-MM-dd");
  const weekEndIso = format(wEnd, "yyyy-MM-dd");

  let minutesCompleted = 0;
  let sessionsCount = 0;

  for (const f of params.focusSessions) {
    const day = extractDateIso(f.created_at);
    if (day && day >= weekStartIso && day <= weekEndIso) {
      minutesCompleted += Number(f.duration_minutes) || 0;
      sessionsCount += 1;
    }
  }
  for (const q of params.quizAttempts) {
    const day = extractDateIso(q.created_at);
    if (day && day >= weekStartIso && day <= weekEndIso) {
      minutesCompleted += Math.max(5, Math.round((Number(q.total_questions) || 1) * 1.5));
      sessionsCount += 1;
    }
  }

  const targetMinutes = Math.max(30, params.weeklyTargetMinutes ?? 180);
  const pct = Math.min(100, Math.round((minutesCompleted / targetMinutes) * 100));

  return {
    weekStartIso,
    weekEndIso,
    minutesCompleted,
    targetMinutes,
    pct,
    sessionsCount,
  };
}

function escapeIcsText(raw: string): string {
  return raw.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function formatDeadlinesIcsExport(deadlines: CalendarDeadlineItem[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${BRAND.shortName}//Student Planner Calendar//EN`,
    "CALSCALE:GREGORIAN",
  ];

  for (const item of deadlines) {
    const ymd = item.dateIso.replace(/-/g, "");
    const nextDayIso = format(addDays(parseISO(item.dateIso), 1), "yyyyMMdd");
    const uid = `${item.id}@${BRAND.shortName.toLowerCase()}.app`;
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTART;VALUE=DATE:${ymd}`);
    lines.push(`DTEND;VALUE=DATE:${nextDayIso}`);
    lines.push(`SUMMARY:${escapeIcsText(item.title)}`);
    lines.push(
      `DESCRIPTION:${escapeIcsText(`Type: ${item.kind}${item.subject ? ` | Subject: ${item.subject}` : ""}`)}`,
    );
    lines.push(`STATUS:${item.status === "done" ? "COMPLETED" : "CONFIRMED"}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
