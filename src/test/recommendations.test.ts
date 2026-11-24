import { describe, expect, it } from "vitest";
import {
  analyzeWeakSubjects,
  buildSmartRecommendations,
  computeNextReviewIso,
} from "@/lib/recommendations";

describe("Smart Recommendations Engine", () => {
  const now = new Date("2026-11-11T10:00:00Z");

  it("prioritizes overdue > due_soon > mistake > flashcard and caps results at 4", () => {
    const recs = buildSmartRecommendations({
      now,
      tasks: [
        {
          id: "t-soon",
          title: "Submit Physics Lab",
          status: "todo",
          due_at: "2026-11-12T18:00:00Z",
          priority: "high",
        },
        {
          id: "t-overdue",
          title: "Algebra Worksheet",
          status: "todo",
          due_at: "2026-11-09T12:00:00Z",
          priority: "high",
        },
      ],
      goals: [{ id: "g-1", title: "Finish 25m sprint", status: "active", is_daily: true }],
      studyItems: [
        {
          id: "s-mistake",
          kind: "mistake",
          subject: "Chemistry",
          title: "Stoichiometry balancing",
          mistake_status: "open",
          next_review_at: null,
        },
        {
          id: "s-card",
          kind: "flashcard",
          subject: "Biology",
          title: "Mitosis stages",
          mistake_status: "open",
          next_review_at: "2026-11-10T00:00:00Z",
        },
      ],
    });

    expect(recs).toHaveLength(4);
    expect(recs.map((r) => r.kind)).toEqual(["overdue", "due_soon", "mistake", "flashcard"]);
    expect(recs[0]?.title).toBe("Algebra Worksheet");
  });

  it("falls back to focus recommendation when no pending items exist", () => {
    const recs = buildSmartRecommendations({
      now,
      sessionMinutes: 30,
      tasks: [{ id: "t1", title: "Done", status: "done", due_at: "2026-11-01", priority: "low" }],
      goals: [{ id: "g1", title: "Done goal", status: "completed", is_daily: true }],
      studyItems: [],
    });

    expect(recs).toHaveLength(1);
    expect(recs[0]?.kind).toBe("focus");
    expect(recs[0]?.title).toBe("30 min");
  });
});

describe("Spaced Repetition Scheduling", () => {
  const now = new Date("2026-11-11T10:00:00Z");

  it("re-queues missed cards after 4 hours", () => {
    expect(computeNextReviewIso({ reviewCount: 3, knewIt: false, style: "spaced", now })).toBe(
      "2026-11-11T14:00:00.000Z",
    );
  });

  it("expands intervals for recalled cards according to study style and caps at max step", () => {
    expect(computeNextReviewIso({ reviewCount: 0, knewIt: true, style: "spaced", now })).toBe(
      "2026-11-12T10:00:00.000Z",
    );
    expect(computeNextReviewIso({ reviewCount: 2, knewIt: true, style: "spaced", now })).toBe(
      "2026-11-18T10:00:00.000Z",
    );
    expect(computeNextReviewIso({ reviewCount: 10, knewIt: true, style: "spaced", now })).toBe(
      "2026-12-11T10:00:00.000Z",
    );
    expect(computeNextReviewIso({ reviewCount: 2, knewIt: true, style: "recall", now })).toBe(
      "2026-11-16T10:00:00.000Z",
    );
  });
});

describe("Weak Subject Analyzer", () => {
  it("scores subjects by open mistakes, hard flashcards, and quiz misses", () => {
    const spots = analyzeWeakSubjects({
      studyItems: [
        { kind: "mistake", subject: "Physics", difficulty: "hard", mistake_status: "open" },
        { kind: "mistake", subject: "Physics", difficulty: "medium", mistake_status: "mastered" },
        { kind: "flashcard", subject: "Physics", difficulty: "hard", mistake_status: "open" },
        { kind: "flashcard", subject: "History", difficulty: "easy", mistake_status: "open" },
      ],
      quizAttempts: [
        { subject: "Physics", score_pct: 60 },
        { subject: "Physics", score_pct: 80 },
        { subject: "History", score_pct: 95 },
      ],
    });

    expect(spots[0]).toEqual({
      subject: "Physics",
      openMistakes: 1,
      hardCards: 1,
      avgQuizPct: 70,
      score: 75, // 1*30 + 1*15 + (100 - 70)
    });
    expect(spots[1]).toEqual({
      subject: "History",
      openMistakes: 0,
      hardCards: 0,
      avgQuizPct: 95,
      score: 5,
    });
  });
});
