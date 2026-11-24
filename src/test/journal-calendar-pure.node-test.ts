import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildJournalActivityHeatmap,
  computeJournalLongestStreak,
  computeJournalMoodBreakdown,
  computeJournalStreak,
  countWordsAndReadingMinutes,
  extractHashtags,
  filterJournalEntries,
  formatJournalJsonExport,
  formatJournalMarkdownExport,
  groupJournalEntriesByDate,
  summarizeJournalInsights,
} from "../lib/journal.ts";
import {
  buildCalendarMonthGrid,
  buildCalendarWeekGrid,
  computeWeeklyStudyProgress,
  formatDeadlinesIcsExport,
  getOrderedWeekdayLabels,
  getUpcomingDeadlines,
  normalizeCalendarItems,
  summarizeCalendarMonth,
} from "../lib/calendar.ts";
import {
  buildQuizOptions,
  formatStudyDeckMarkdown,
  parseBulkFlashcards,
} from "../lib/study-utils.ts";
import { buildStudentAlerts, computeSm2RatedReviewIso } from "../lib/recommendations.ts";
import { computeDomainFocusStats, computeXpAreaBreakdown } from "../lib/growth.ts";
import type {
  FocusSessionRow,
  GoalRow,
  JournalEntryRow,
  QuizAttemptRow,
  StudyItemRow,
  TaskRow,
} from "../lib/firestore-data.ts";
import { BRAND } from "../config/brand.ts";

const sampleEntries: JournalEntryRow[] = [
  {
    id: "j3",
    user_id: "u1",
    entry_date: "2026-11-11",
    title: "Mastered derivatives chain rule",
    reflection: "Worked through 12 calculus exercises and noticed fewer sign slips.",
    key_win: "Finished all timed drills cleanly",
    next_step: "Practice implicit differentiation tomorrow",
    subject: "Calculus",
    area: "academic",
    mood: "confident",
    study_minutes: 45,
    created_at: "2026-11-11T16:00:00Z",
    updated_at: "2026-11-11T16:00:00Z",
  },
  {
    id: "j2",
    user_id: "u1",
    entry_date: "2026-11-10",
    title: "Physics lab velocity analysis",
    reflection: "Plotted acceleration graphs and checked error bars.",
    key_win: "Verified slope calculation",
    next_step: null,
    subject: "Physics",
    area: "productivity",
    mood: "focused",
    study_minutes: 30,
    created_at: "2026-11-10T18:00:00Z",
    updated_at: "2026-11-10T18:00:00Z",
  },
  {
    id: "j1",
    user_id: "u1",
    entry_date: "2026-11-08",
    title: "Weekly reset",
    reflection: "Reorganized study notes before mock week.",
    key_win: null,
    next_step: "Set three daily priorities",
    subject: null,
    area: "growth",
    mood: "reflective",
    study_minutes: 20,
    created_at: "2026-11-08T19:00:00Z",
    updated_at: "2026-11-08T19:00:00Z",
  },
];

describe("Daily Journal pure logic", () => {
  it("computes consecutive streaks with yesterday grace and resets on gap", () => {
    assert.equal(computeJournalStreak([], "2026-11-11"), 0);
    // 2026-11-11 + 2026-11-10 = 2 days (2026-11-09 is missing)
    assert.equal(computeJournalStreak(sampleEntries, "2026-11-11"), 2);
    // Checking on 2026-11-12 before today's entry still retains 2-day active streak from yesterday
    assert.equal(computeJournalStreak(sampleEntries, "2026-11-12"), 2);
    // Gap of 2+ days resets streak to 0
    assert.equal(computeJournalStreak(sampleEntries, "2026-11-13"), 0);
  });

  it("filters entries by search, area, and mood and summarizes insights", () => {
    const calcOnly = filterJournalEntries(sampleEntries, { search: "calculus" });
    assert.equal(calcOnly.length, 1);
    assert.equal(calcOnly[0]?.id, "j3");

    const moodFiltered = filterJournalEntries(sampleEntries, { mood: "focused" });
    assert.equal(moodFiltered.length, 1);
    assert.equal(moodFiltered[0]?.id, "j2");

    const summary = summarizeJournalInsights(sampleEntries, "2026-11-11");
    assert.equal(summary.totalEntries, 3);
    assert.equal(summary.streakDays, 2);
    assert.equal(summary.totalStudyMinutes, 95);
    assert.ok(summary.totalWords > 20);
  });

  it("formats markdown and JSON exports cleanly", () => {
    const md = formatJournalMarkdownExport(sampleEntries);
    assert.ok(md.includes(`# ${BRAND.shortName} Daily Growth Journal`));
    assert.ok(md.includes("## 2026-11-11 — Mastered derivatives chain rule"));
    assert.ok(md.includes("**Key Win:** Finished all timed drills cleanly"));

    const json = JSON.parse(formatJournalJsonExport(sampleEntries)) as {
      source: string;
      count: number;
      entries: JournalEntryRow[];
    };
    assert.equal(json.source, "nexora.journals");
    assert.equal(json.count, 3);
    assert.equal(json.entries[0]?.id, "j3");
  });

  it("groups entries by date with relative labels, computes heatmap, mood mix, longest streak, tags & word counts", () => {
    const groups = groupJournalEntriesByDate(sampleEntries, "2026-11-11");
    assert.equal(groups.length, 3);
    assert.equal(groups[0]?.relativeKind, "today");
    assert.equal(groups[0]?.totalStudyMinutes, 45);
    assert.equal(groups[1]?.relativeKind, "yesterday");
    assert.equal(groups[2]?.relativeKind, "date");

    const heatmap = buildJournalActivityHeatmap(sampleEntries, "2026-11-11", 14);
    assert.equal(heatmap.length, 14);
    const nov11Cell = heatmap.find((c) => c.dateIso === "2026-11-11");
    assert.equal(nov11Cell?.count, 1);
    assert.equal(nov11Cell?.level, 3); // 1 * 25 + 45 = 70 >= 55 -> level 3

    const moodMix = computeJournalMoodBreakdown(sampleEntries);
    assert.equal(moodMix.length, 3);
    assert.equal(
      moodMix.reduce((acc, m) => acc + m.count, 0),
      3,
    );

    assert.equal(computeJournalLongestStreak(sampleEntries), 2);
    assert.deepEqual(extractHashtags("Focused on #Calculus #exams #calculus #physics_lab"), [
      "calculus",
      "exams",
      "physics_lab",
    ]);
    assert.deepEqual(countWordsAndReadingMinutes("One two three four"), {
      words: 4,
      readingMinutes: 1,
    });
    assert.deepEqual(countWordsAndReadingMinutes("   "), { words: 0, readingMinutes: 0 });
  });
});

describe("Interactive Calendar pure logic (date-fns)", () => {
  const tasks: TaskRow[] = [
    {
      id: "t1",
      user_id: "u1",
      title: "Chemistry Lab Report",
      details: null,
      priority: "high",
      status: "todo",
      area: "academic",
      subject: "Chemistry",
      due_at: "2026-11-15T12:00:00Z",
      goal_id: null,
      completed_at: null,
      created_at: "2026-11-01T10:00:00Z",
    },
    {
      id: "t2",
      user_id: "u1",
      title: "Overdue Essay Outline",
      details: null,
      priority: "medium",
      status: "todo",
      area: "academic",
      subject: "English",
      due_at: "2026-11-09T12:00:00Z",
      goal_id: null,
      completed_at: null,
      created_at: "2026-11-01T10:00:00Z",
    },
    {
      id: "t3",
      user_id: "u1",
      title: "Completed Drill",
      details: null,
      priority: "low",
      status: "done",
      area: "productivity",
      subject: "Math",
      due_at: "2026-11-15T12:00:00Z",
      goal_id: null,
      completed_at: "2026-11-10T10:00:00Z",
      created_at: "2026-11-01T10:00:00Z",
    },
  ];

  const goals: GoalRow[] = [
    {
      id: "g1",
      user_id: "u1",
      title: "Finish Physics Unit 3",
      area: "academic",
      status: "active",
      target_date: "2026-11-20",
      completed_at: null,
      created_at: "2026-11-01T08:00:00Z",
    },
  ];

  const focusSessions: FocusSessionRow[] = [
    {
      id: "f1",
      user_id: "u1",
      title: "Calculus Pomodoro",
      area: "academic",
      subject: "Calculus",
      duration_minutes: 50,
      completed: true,
      created_at: "2026-11-11T14:00:00Z",
    },
  ];

  const quizAttempts: QuizAttemptRow[] = [
    {
      id: "q1",
      user_id: "u1",
      subject: "Biology",
      total_questions: 10,
      correct_count: 9,
      score_pct: 90,
      wrong_item_ids: [],
      created_at: "2026-11-11T17:00:00Z",
    },
  ];

  const studyItems: StudyItemRow[] = [
    {
      id: "s1",
      user_id: "u1",
      kind: "flashcard",
      subject: "Biology",
      deck: "Cell",
      title: "Mitochondria role?",
      content: "Mitochondria role?",
      answer: "ATP synthesis",
      difficulty: "medium",
      mistake_reason: null,
      mistake_status: "open",
      review_count: 1,
      next_review_at: "2026-11-11T08:00:00Z",
      created_at: "2026-11-01T08:00:00Z",
      updated_at: "2026-11-01T08:00:00Z",
    },
  ];

  it("orders weekday labels according to firstDayOfWeek setting", () => {
    const sunFirst = getOrderedWeekdayLabels("sunday", "en-US");
    const monFirst = getOrderedWeekdayLabels("monday", "en-US");
    const satFirst = getOrderedWeekdayLabels("saturday", "en-US");

    assert.equal(sunFirst.length, 7);
    assert.equal(sunFirst[0], "Sun");
    assert.equal(monFirst[0], "Mon");
    assert.equal(satFirst[0], "Sat");
  });

  it("builds complete calendar grid with deadlines, overdue flags, journals, due cards, and study sessions", () => {
    const cells = buildCalendarMonthGrid({
      monthDate: new Date(2026, 10, 1), // November 2026
      firstDayOfWeek: "monday",
      tasks,
      goals,
      focusSessions,
      quizAttempts,
      journalEntries: sampleEntries,
      studyItems,
      todayIso: "2026-11-11",
    });

    assert.equal(cells.length % 7, 0);
    const nov11 = cells.find((c) => c.iso === "2026-11-11");
    assert.ok(nov11);
    assert.equal(nov11.isToday, true);
    assert.equal(nov11.studySessions.length, 2);
    assert.equal(nov11.studyMinutesTotal, 65); // 50 + round(10 * 1.5)
    assert.equal(nov11.journalEntriesCount, 1);
    assert.equal(nov11.dueFlashcardsCount, 1);
    assert.ok(nov11.heatLevel >= 3);

    const nov9 = cells.find((c) => c.iso === "2026-11-09");
    assert.ok(nov9);
    assert.equal(nov9.overdueDeadlinesCount, 1);

    const overview = summarizeCalendarMonth(cells);
    assert.equal(overview.totalFocusMinutes, 65);
    assert.equal(overview.studySessionCount, 2);
    assert.equal(overview.upcomingDeadlinesCount, 3); // 2 open tasks + 1 open goal
    assert.equal(overview.overdueDeadlinesCount, 1);
    assert.equal(overview.journalDaysCount, 3);
  });

  it("builds 7-day week grid, computes weekly study progress, and exports valid .ics calendar", () => {
    const week = buildCalendarWeekGrid({
      focusDate: new Date(2026, 10, 11),
      firstDayOfWeek: "monday",
      tasks,
      goals,
      focusSessions,
      quizAttempts,
      journalEntries: sampleEntries,
      studyItems,
      todayIso: "2026-11-11",
    });
    assert.equal(week.length, 7);
    assert.equal(week[0]?.iso, "2026-11-09");

    const progress = computeWeeklyStudyProgress({
      focusSessions,
      quizAttempts,
      firstDayOfWeek: "monday",
      referenceDate: new Date(2026, 10, 11),
      weeklyTargetMinutes: 130,
    });
    assert.equal(progress.minutesCompleted, 65);
    assert.equal(progress.pct, 50);
    assert.equal(progress.sessionsCount, 2);

    const { deadlines } = normalizeCalendarItems({
      tasks,
      goals,
      focusSessions,
      quizAttempts,
      todayIso: "2026-11-11",
    });
    const ics = formatDeadlinesIcsExport(deadlines);
    assert.ok(ics.includes("BEGIN:VCALENDAR"));
    assert.ok(ics.includes("SUMMARY:Chemistry Lab Report"));
    assert.ok(ics.includes("END:VCALENDAR"));
  });

  it("filters upcoming 14-day deadlines including overdue open items", () => {
    const upcoming = getUpcomingDeadlines({
      tasks,
      goals,
      todayIso: "2026-11-11",
      horizonDays: 14,
    });
    assert.deepEqual(
      upcoming.map((u) => u.title),
      ["Overdue Essay Outline", "Chemistry Lab Report", "Finish Physics Unit 3"],
    );
  });
});

describe("Study utilities, SM-2 ratings, alerts & domain analytics", () => {
  it("parses bulk flashcards, exports study sheet markdown, and builds MCQ options", () => {
    const parsed = parseBulkFlashcards(
      "What is F = ma? | Newton's second law\nSpeed of light :: 3e8 m/s\nBadLineWithoutDelimiter",
      "Physics",
    );
    assert.equal(parsed.length, 2);
    assert.equal(parsed[0]?.subject, "Physics");
    assert.equal(parsed[1]?.answer, "3e8 m/s");

    const sampleItems: StudyItemRow[] = [
      {
        id: "c1",
        user_id: "u1",
        kind: "flashcard",
        subject: "Physics",
        deck: null,
        title: "Q1",
        content: "Q1",
        answer: "A1",
        difficulty: "medium",
        mistake_reason: null,
        mistake_status: "open",
        review_count: 0,
        next_review_at: null,
        created_at: "2026-11-10T10:00:00Z",
        updated_at: "2026-11-10T10:00:00Z",
      },
      {
        id: "c2",
        user_id: "u1",
        kind: "flashcard",
        subject: "Physics",
        deck: null,
        title: "Q2",
        content: "Q2",
        answer: "A2",
        difficulty: "medium",
        mistake_reason: null,
        mistake_status: "open",
        review_count: 0,
        next_review_at: null,
        created_at: "2026-11-10T10:00:00Z",
        updated_at: "2026-11-10T10:00:00Z",
      },
      {
        id: "c3",
        user_id: "u1",
        kind: "flashcard",
        subject: "Physics",
        deck: null,
        title: "Q3",
        content: "Q3",
        answer: "A3",
        difficulty: "medium",
        mistake_reason: null,
        mistake_status: "open",
        review_count: 0,
        next_review_at: null,
        created_at: "2026-11-10T10:00:00Z",
        updated_at: "2026-11-10T10:00:00Z",
      },
      {
        id: "c4",
        user_id: "u1",
        kind: "flashcard",
        subject: "Physics",
        deck: null,
        title: "Q4",
        content: "Q4",
        answer: "A4",
        difficulty: "medium",
        mistake_reason: null,
        mistake_status: "open",
        review_count: 0,
        next_review_at: null,
        created_at: "2026-11-10T10:00:00Z",
        updated_at: "2026-11-10T10:00:00Z",
      },
    ];
    const sheet = formatStudyDeckMarkdown(sampleItems, "Physics");
    assert.ok(sheet.includes(`# ${BRAND.shortName} Study Sheet (Physics)`));

    const mcq = buildQuizOptions(sampleItems[0]!, sampleItems);
    assert.equal(mcq.length, 4);
    assert.equal(mcq.filter((o) => o.isCorrect).length, 1);
  });

  it("computes SM-2 intervals, builds student alerts, and aggregates domain focus & XP", () => {
    const base = new Date("2026-11-11T12:00:00Z");
    const againMs = Date.parse(
      computeSm2RatedReviewIso({ reviewCount: 2, rating: "again", style: "spaced", now: base }),
    );
    const easyMs = Date.parse(
      computeSm2RatedReviewIso({ reviewCount: 2, rating: "easy", style: "spaced", now: base }),
    );
    assert.equal(againMs - base.getTime(), 4 * 3600_000);
    assert.ok(easyMs > againMs);

    const alerts = buildStudentAlerts({
      tasks: [
        { id: "t1", title: "Late Homework", status: "todo", due_at: "2026-11-09T12:00:00Z" },
        { id: "t2", title: "Today Lab", status: "todo", due_at: "2026-11-11T12:00:00Z" },
      ],
      goals: [{ id: "g1", title: "Read 20 pages", status: "active", is_daily: true }],
      studyItems: [{ id: "c1", kind: "flashcard", next_review_at: "2026-11-11T08:00:00Z" }],
      now: base,
    });
    assert.equal(alerts.length, 4);
    assert.equal(alerts[0]?.kind, "overdue_task");

    const focusStats = computeDomainFocusStats([
      { subject: "Physics", duration_minutes: 50 },
      { subject: "Physics", duration_minutes: 25 },
      { subject: "Math", duration_minutes: 30 },
    ]);
    assert.equal(focusStats[0]?.subject, "Physics");
    assert.equal(focusStats[0]?.minutes, 75);

    const xpBreakdown = computeXpAreaBreakdown([
      { area: "academic", xp: 60 },
      { area: "productivity", xp: 40 },
    ]);
    assert.equal(xpBreakdown.find((x) => x.area === "academic")?.pct, 60);
    assert.equal(xpBreakdown.find((x) => x.area === "productivity")?.pct, 40);
  });
});
