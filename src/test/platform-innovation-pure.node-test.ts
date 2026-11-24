import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assessLearningBacklog, buildRecoverySchedule } from "../lib/learning-recovery.ts";
import { buildExamRevisionSchedule } from "../lib/revision-scheduler.ts";
import { buildAccessibilityRecommendation } from "../lib/accessibility-assistant.ts";
import { filterHelpArticles, type HelpArticleItem } from "../lib/help-indexing.ts";
import { computeWeeklyObjectivesBoard, computeWeeklyPulseSummary } from "../lib/growth.ts";
import type { QuizAttemptRow, StudyItemRow, TaskRow } from "../lib/firestore-data.ts";

const NOW = new Date("2026-11-15T12:00:00.000Z");

function makeTask(overrides: Partial<TaskRow>): TaskRow {
  return {
    id: overrides.id ?? "task_1",
    user_id: "user_1",
    title: overrides.title ?? "Sample Task",
    details: null,
    priority: overrides.priority ?? "medium",
    status: overrides.status ?? "todo",
    area: overrides.area ?? "academic",
    subject: null,
    recurrence: "none",
    subtasks: [],
    due_at: overrides.due_at ?? "2026-11-10T18:00:00.000Z",
    goal_id: null,
    completed_at: overrides.completed_at ?? null,
    created_at: overrides.created_at ?? "2026-11-01T10:00:00.000Z",
  };
}

function makeStudyItem(overrides: Partial<StudyItemRow>): StudyItemRow {
  return {
    id: overrides.id ?? "si_1",
    user_id: "user_1",
    kind: overrides.kind ?? "flashcard",
    subject: overrides.subject ?? "Physics",
    deck: null,
    title: overrides.title ?? "Kinematics",
    content: "v = u + at",
    answer: null,
    difficulty: overrides.difficulty ?? "medium",
    mistake_reason: null,
    mistake_status: overrides.mistake_status ?? "open",
    review_count: 1,
    next_review_at: overrides.next_review_at ?? "2026-11-14T00:00:00.000Z",
    created_at: "2026-11-01T10:00:00.000Z",
    updated_at: "2026-11-01T10:00:00.000Z",
  };
}

describe("Compassionate Learning Recovery Planner", () => {
  it("flags overdue backlog sorted by priority without false positives for done tasks", () => {
    const tasks: TaskRow[] = [
      makeTask({
        id: "t1",
        title: "Low overdue",
        priority: "low",
        due_at: "2026-11-12T18:00:00.000Z",
      }),
      makeTask({
        id: "t2",
        title: "High overdue",
        priority: "high",
        due_at: "2026-11-11T18:00:00.000Z",
      }),
      makeTask({
        id: "t3",
        title: "Done overdue",
        priority: "high",
        status: "done",
        due_at: "2026-11-10T18:00:00.000Z",
      }),
      makeTask({
        id: "t4",
        title: "Future task",
        priority: "high",
        due_at: "2026-11-20T18:00:00.000Z",
      }),
    ];
    const studyItems: StudyItemRow[] = [
      makeStudyItem({ id: "fc1", kind: "flashcard" }),
      makeStudyItem({ id: "mk1", kind: "mistake", mistake_status: "practice_pending" }),
    ];

    const assessment = assessLearningBacklog({
      tasks,
      studyItems,
      currentStreak: 0,
      now: NOW,
    });

    assert.equal(assessment.overdueTasks.length, 2);
    assert.equal(assessment.overdueTasks[0]?.id, "t2");
    assert.equal(assessment.overdueTasks[1]?.id, "t1");
    assert.equal(assessment.dueFlashcardsCount, 1);
    assert.equal(assessment.openMistakesCount, 1);
    assert.equal(assessment.needsRecovery, true);
  });

  it("distributes overdue tasks calmly across days matching gentle/steady/focused pace caps", () => {
    const overdueTasks = [
      makeTask({ id: "a", title: "A" }),
      makeTask({ id: "b", title: "B" }),
      makeTask({ id: "c", title: "C" }),
    ];

    const gentle = buildRecoverySchedule({ overdueTasks, pace: "gentle", now: NOW });
    assert.equal(gentle.steps.length, 3);
    assert.deepEqual(
      gentle.steps.map((s) => s.dayOffset),
      [0, 1, 2],
    );
    assert.equal(gentle.firstTinyWin?.dayLabel, "Today (Small Win)");

    const steady = buildRecoverySchedule({ overdueTasks, pace: "steady", now: NOW });
    assert.deepEqual(
      steady.steps.map((s) => s.dayOffset),
      [0, 0, 1],
    );
  });
});

describe("Smart Exam Revision Scheduler", () => {
  it("prioritizes open mistakes first and preserves a light pre-exam rest block", () => {
    const studyItems: StudyItemRow[] = [
      makeStudyItem({
        id: "m1",
        kind: "mistake",
        subject: "Physics",
        mistake_status: "practice_pending",
        title: "Sign error in momentum",
      }),
      makeStudyItem({ id: "f1", kind: "flashcard", subject: "Physics", title: "Impulse formula" }),
      makeStudyItem({ id: "n1", kind: "note", subject: "Physics", title: "Newton Laws Summary" }),
    ];
    const quizAttempts: QuizAttemptRow[] = [
      {
        id: "qa1",
        user_id: "user_1",
        subject: "Physics",
        total_questions: 5,
        correct_count: 3,
        score_pct: 60,
        wrong_item_ids: ["m1"],
        created_at: "2026-11-14T10:00:00.000Z",
      },
    ];

    const plan = buildExamRevisionSchedule({
      examName: "Physics Midterm",
      subject: "Physics",
      examDateIso: "2026-11-19",
      dailyMinutes: 40,
      studyItems,
      quizAttempts,
      now: NOW,
    });

    assert.equal(plan.daysAvailable, 4);
    assert.equal(plan.weaknessDetected, true);
    assert.equal(plan.sessions.length, 4);
    assert.equal(plan.sessions[0]?.focusArea, "mistakes");
    assert.equal(plan.sessions[plan.sessions.length - 1]?.focusArea, "light_review");
    assert.ok((plan.sessions[plan.sessions.length - 1]?.durationMinutes ?? 99) <= 20);
  });
});

describe("Study Accessibility Assistant", () => {
  it("maps student comfort barriers cleanly to readability & focus settings", () => {
    const empty = buildAccessibilityRecommendation([]);
    assert.equal(empty.appliedLabels.length, 0);

    const rec = buildAccessibilityRecommendation(["reading_density", "focus_distraction"]);
    assert.equal(rec.changes.dyslexia, true);
    assert.equal(rec.changes.fontScale, 1.15);
    assert.equal(rec.changes.reduceMotion, true);
    assert.equal(rec.changes.simplified, true);
    assert.equal(rec.changes.readingLayout, "focused");
    assert.ok(rec.appliedLabels.length >= 4);
  });
});

describe("Help Center Search Indexing", () => {
  const articles: HelpArticleItem[] = [
    {
      id: "1",
      slug: "pomodoro-focus",
      title: "Study Sprints & Pomodoro Timer",
      category: "study",
      excerpt: "Stay focused using 25 minute blocks.",
      content: "Combine flashcards and focus sessions cleanly.",
      tags: ["pomodoro", "focus"],
      related_article_ids: [],
      published: true,
      last_updated_at: "2026-11-15T00:00:00Z",
      created_at: "2026-11-01T00:00:00Z",
    },
    {
      id: "2",
      slug: "draft-guide",
      title: "Draft Guide Hidden From Students",
      category: "study",
      excerpt: "Unpublished pomodoro notes.",
      content: "Not live yet.",
      tags: ["pomodoro"],
      related_article_ids: [],
      published: false,
      last_updated_at: "2026-11-15T00:00:00Z",
      created_at: "2026-11-01T00:00:00Z",
    },
    {
      id: "3",
      slug: "themes",
      title: "Customizing Aurora Glass & Creative Neon",
      category: "settings",
      excerpt: "Personalize themes and dyslexia fonts.",
      content: "Enable high contrast or readable typography.",
      tags: ["aurora glass", "creative neon", "dyslexia"],
      related_article_ids: [],
      published: true,
      last_updated_at: "2026-11-15T00:00:00Z",
      created_at: "2026-11-01T00:00:00Z",
    },
  ];

  it("hides unpublished drafts for students and matches multi-token tag & title searches", () => {
    const publicSearch = filterHelpArticles(articles, "all", "pomodoro", false);
    assert.equal(publicSearch.length, 1);
    assert.equal(publicSearch[0]?.id, "1");

    const adminSearch = filterHelpArticles(articles, "all", "pomodoro", true);
    assert.equal(adminSearch.length, 2);

    const tagSearch = filterHelpArticles(articles, "settings", "creative neon", false);
    assert.equal(tagSearch.length, 1);
    assert.equal(tagSearch[0]?.id, "3");
  });
});

describe("Daily Pulse 7-day Sentiment Summary", () => {
  it("computes empty baseline cleanly and aggregates recent check-ins accurately", () => {
    const empty = computeWeeklyPulseSummary([], NOW);
    assert.equal(empty.checkedInToday, false);
    assert.equal(empty.daysCheckedLast7, 0);
    assert.equal(empty.avgEnergy, null);
    assert.equal(empty.insightKind, "none");
    assert.equal(empty.points.length, 7);

    const summary = computeWeeklyPulseSummary(
      [
        {
          mood: "focused",
          energy: 5,
          stress_level: 2,
          sleep_hours: 8,
          created_at: "2026-11-15T09:00:00.000Z",
        },
        {
          mood: "focused",
          energy: 4,
          stress_level: 2,
          sleep_hours: 7,
          created_at: "2026-11-14T09:00:00.000Z",
        },
        {
          mood: "calm",
          energy: 4,
          stress_level: 2,
          sleep_hours: null,
          created_at: "2026-11-01T09:00:00.000Z",
        },
      ],
      NOW,
    );

    assert.equal(summary.checkedInToday, true);
    assert.equal(summary.daysCheckedLast7, 2);
    assert.equal(summary.avgEnergy, 4.5);
    assert.equal(summary.avgStress, 2);
    assert.equal(summary.avgSleep, 7.5);
    assert.equal(summary.dominantMood, "focused");
    assert.equal(summary.insightKind, "positive");
  });
});

describe("Weekly Objectives Board Analytics", () => {
  it("combines non-daily category objectives with 7-day activity across areas", () => {
    const board = computeWeeklyObjectivesBoard({
      goals: [
        {
          id: "g1",
          area: "academic",
          status: "completed",
          is_daily: false,
          target_date: "2026-11-20",
        },
        {
          id: "g-daily-ignored",
          area: "academic",
          status: "active",
          is_daily: true,
          target_date: null,
        },
        {
          id: "g2",
          area: "wellbeing",
          status: "active",
          is_daily: false,
          milestones: [{ done: true }, { done: false }],
        },
      ],
      tasks: [
        makeTask({
          id: "t1",
          area: "academic",
          status: "done",
          created_at: "2026-11-13T10:00:00.000Z",
        }),
      ],
      events: [{ area: "academic", created_at: "2026-11-14T10:00:00.000Z" }],
      studyItemsCountRecent: 2,
      careCountRecent: 2,
      today: NOW,
    });

    assert.equal(board.academic.objectives.length, 1);
    assert.equal(board.academic.completedObjectivesCount, 1);
    assert.equal(board.academic.weeklyActivityUnits, 4);
    assert.equal(board.academic.progressPct, 100);

    assert.equal(board.wellbeing.objectives.length, 1);
    assert.equal(board.wellbeing.completedObjectivesCount, 0);
    assert.equal(board.wellbeing.weeklyActivityUnits, 2);
    assert.ok(board.wellbeing.progressPct >= 50 && board.wellbeing.progressPct < 100);
  });
});
