import { describe, it, expect } from "vitest";
import { ageBand, levelForXp } from "@/lib/growth";
const today = new Date("2026-11-11T00:00:00Z");
describe("age rules", () => {
  it("rejects under 13", () => expect(ageBand("2014-01-01", today)).toBe("under13"));
  it("13 exactly is allowed", () => expect(ageBand("2013-11-11", today)).toBe("13-15"));
  it("18+ band", () => expect(ageBand("2000-01-01", today)).toBe("18+"));
});
describe("levels", () => {
  it("0 xp is level 1", () => expect(levelForXp(0)).toBe(1));
  it("50 xp is level 2", () => expect(levelForXp(50)).toBe(2));
});
import {
  compute7DayXpVelocity,
  computeDomainScores,
  getAchievementBadges,
  getMilestones,
  getTier,
  getWeeklyGrowthTrends,
} from "@/lib/growth";

describe("tiers and milestones", () => {
  it("level 1 is Explorer tier", () => expect(getTier(1).nameEn).toBe("Explorer"));
  it("level 4 is Apprentice tier", () => expect(getTier(4).nameEn).toBe("Apprentice"));
  it("milestones calculate unlock states accurately", () => {
    const ms = getMilestones(4);
    expect(ms[0]?.unlocked).toBe(true);
    expect(ms[1]?.unlocked).toBe(true);
    expect(ms[2]?.unlocked).toBe(false);
  });
  it("evaluates achievement badges with unlocked, locked, and gated domain states", () => {
    const badges = getAchievementBadges({
      level: 4,
      xp: 620,
      streak: 5,
      completedTasks: 2,
      completedGoals: 1,
      futurePlansCount: 1,
      circleCount: 0,
      careEntriesCount: 2,
    });
    expect(badges.length).toBeGreaterThanOrEqual(10);
    expect(badges.find((b) => b.id === "badge-initiate")?.unlocked).toBe(true);
    expect(badges.find((b) => b.id === "badge-streak-fire")?.unlocked).toBe(true);
    expect(badges.find((b) => b.id === "badge-future-navigator")?.unlocked).toBe(true);
    expect(badges.find((b) => b.id === "badge-circle-peer")?.unlocked).toBe(false);
    expect(badges.find((b) => b.id === "badge-wellbeing-zen")?.unlocked).toBe(true);
    expect(badges.find((b) => b.id === "badge-luminary-grand")?.unlocked).toBe(false);
  });
  it("generates 8 weeks of weekly growth trends with productivity and skill points", () => {
    const trends = getWeeklyGrowthTrends();
    expect(trends.length).toBe(8);
    expect(trends[0]?.productivity).toBeDefined();
    expect(trends[0]?.skillAcquisition).toBeDefined();
    expect(trends[7]?.productivity).toBeGreaterThan(trends[0]?.productivity ?? 0);
  });
});

describe("real-data Growth Map domain and velocity engines", () => {
  it("starts honestly at zero for empty activity and caps additive scores at 100", () => {
    expect(computeDomainScores({ goals: [], events: [] })).toEqual({
      academic: 0,
      productivity: 0,
      growth: 0,
      wellbeing: 0,
      career: 0,
      community: 0,
    });

    const active = computeDomainScores({
      goals: [
        { area: "academic", status: "completed" },
        { area: "career", status: "active" },
      ],
      events: [
        { area: "academic", xp: 40 },
        { area: "growth", xp: 30 },
      ],
      completedTasksByArea: { productivity: 3 },
      studyCount: 4,
      focusSessionsCount: 2,
      careCount: 2,
      futureCount: 10, // capped at 45
      circleCount: 10, // capped at 60
    });

    expect(active.academic).toBe(22 + 20 + 24);
    expect(active.productivity).toBe(30 + 20);
    expect(active.growth).toBe(15);
    expect(active.wellbeing).toBe(24);
    expect(active.career).toBe(8 + 45);
    expect(active.community).toBe(60);

    const overflow = computeDomainScores({
      goals: Array.from({ length: 10 }, () => ({ area: "academic" as const, status: "completed" })),
      events: [{ area: "academic", xp: 500 }],
      studyCount: 50,
    });
    expect(overflow.academic).toBe(100);
  });

  it("aggregates XP across 7 UTC days ending on today", () => {
    const refToday = new Date("2026-11-11T15:00:00Z");
    const velocity = compute7DayXpVelocity(
      [
        { xp: 30, created_at: "2026-11-11T08:00:00Z" },
        { xp: 20, created_at: "2026-11-11T14:00:00Z" },
        { xp: 45, created_at: "2026-11-09T10:00:00Z" },
        { xp: 100, created_at: "2026-10-01T10:00:00Z" }, // outside 7d window
      ],
      refToday,
    );
    expect(velocity).toHaveLength(7);
    expect(velocity[0]?.dateIso).toBe("2026-11-05");
    expect(velocity[4]?.dateIso).toBe("2026-11-09");
    expect(velocity[4]?.xp).toBe(45);
    expect(velocity[6]?.dateIso).toBe("2026-11-11");
    expect(velocity[6]?.labelKey).toBe("growth.days.today");
    expect(velocity[6]?.xp).toBe(50);
  });

  it("computes real 8-week growth trends from events, tasks, focus sessions, and study items", () => {
    const refToday = new Date("2026-11-11T12:00:00Z");
    const realTrends = getWeeklyGrowthTrends({
      today: refToday,
      events: [{ area: "academic", xp: 60, created_at: "2026-11-10T10:00:00Z" }],
      tasks: [
        {
          status: "done",
          completed_at: "2026-11-10T12:00:00Z",
          created_at: "2026-11-09T12:00:00Z",
        },
        {
          status: "open",
          completed_at: null,
          created_at: "2026-11-10T12:00:00Z",
        },
      ],
      focusSessions: [{ duration_minutes: 90, created_at: "2026-11-10T15:00:00Z" }],
      studyItems: [{ created_at: "2026-11-10T16:00:00Z" }],
    });
    expect(realTrends).toHaveLength(8);
    expect(realTrends[0]?.productivity).toBe(0);
    expect(realTrends[7]).toMatchObject({
      week: "W8",
      tasksCompleted: 1,
      focusHours: 1.5,
      skillsMastered: 1,
      productivity: 34,
      skillAcquisition: 32,
    });
  });
});
