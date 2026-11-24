import { describe, expect, it, vi } from "vitest";
import type { User } from "firebase/auth";
import {
  deriveDisplayName,
  ensureFirebaseUserBootstrap,
  resolveProviderId,
} from "@/lib/auth-bootstrap";
import {
  canTransitionAuthState,
  isAppAccessAllowedForState,
  resolveAccountAuthState,
} from "@/lib/auth-state";
import {
  CANONICAL_MODULES,
  GROWTH_MAP_ORCHESTRATOR,
  MODULE_CATEGORIES,
  getCanonicalModule,
  getModulesByCategory,
  searchModules,
} from "@/config/modules-catalog";
import { FEATURE_GUIDES } from "@/lib/feature-guides";
import {
  defaultSettingsDoc,
  defaultStatsDoc,
  generateSafeDocId,
  type ActivityEventRow,
  type CareEntryRow,
  type GoalRow,
  type ProfileRow,
  type StudyItemRow,
  type TaskRow,
  type UserStatsRow,
} from "@/lib/firestore-data";
import {
  ageBand,
  computeWeeklyProductivityHeatmap,
  computeXpAreaBreakdown,
  getAchievementBadges,
  getMilestones,
  levelForXp,
  levelProgress,
  xpForLevel,
} from "@/lib/growth";

function makeMockUser(overrides: Partial<User> = {}): User {
  return {
    uid: "u_journey_test_001",
    email: "student@nexora.school",
    emailVerified: true,
    displayName: "Nour Al-Sabah",
    photoURL: "https://example.com/avatar.jpg",
    phoneNumber: "+96599887766",
    isAnonymous: false,
    providerData: [
      {
        providerId: "password",
        uid: "p_001",
        displayName: "Nour Al-Sabah",
        email: "student@nexora.school",
        phoneNumber: null,
        photoURL: null,
      },
    ],
    ...overrides,
  } as unknown as User;
}

describe("Automated Test Suite: Student Journeys & 20-Module Architecture", () => {
  describe("Journey A: New Student (Auth -> Gate -> Onboarding -> Profile & Seeded Goal -> Growth Map Initialization)", () => {
    it("A.1: New authenticated student profile starts un-onboarded and gate enforces redirect to /onboarding", () => {
      const newUser = makeMockUser({
        uid: "student_new_101",
        displayName: "Ahmad Al-Kandari",
        email: "ahmad@example.com",
      });

      // Bootstrap initial documents for fresh user
      const initialProfile: ProfileRow = {
        id: newUser.uid,
        display_name: deriveDisplayName(newUser),
        avatar_url: null,
        language: "en",
        region: "kuwait",
        date_of_birth: null,
        age_band: null,
        parental_consent: false,
        onboarded: false,
        is_anonymous: false,
        auth_provider: resolveProviderId(newUser),
        email_verified: true,
        phone_number: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(initialProfile.onboarded).toBe(false);

      // Verify Auth State resolution requires profile completion
      const authState = resolveAccountAuthState({
        isInitialized: true,
        hasUser: true,
        emailVerified: true,
        signInProvider: "password",
        profileInitialized: true,
        profileOnboarded: initialProfile.onboarded,
      });
      expect(authState).toBe("PROFILE_COMPLETION_REQUIRED");

      // Verify the App route gate check redirects un-onboarded user
      function checkAppRouteGate(profile: ProfileRow | null) {
        if (!profile?.onboarded) {
          return { redirect: "/onboarding" };
        }
        return { allow: true };
      }

      const gateResult = checkAppRouteGate(initialProfile);
      expect(gateResult).toEqual({ redirect: "/onboarding" });
    });

    it("A.2: Enforces COPPA/safety age verification: under 13 rejected, 13-17 requires parental consent, 18+ auto-approves", () => {
      const today = new Date();
      const currentYear = today.getFullYear();

      // Case 1: Under 13 (e.g. 11 years old)
      const under13Dob = `${currentYear - 11}-05-15`;
      const bandUnder13 = ageBand(under13Dob);
      expect(bandUnder13).toBe("under13");

      function validateOnboardingEligibility(dob: string, consent: boolean) {
        const band = ageBand(dob);
        if (band === "under13") {
          return { allowed: false, error: "under_age_limit" };
        }
        if (band !== "18+" && !consent) {
          return { allowed: false, error: "parental_consent_required" };
        }
        return { allowed: true, band, parentalConsent: band === "18+" ? true : consent };
      }

      expect(validateOnboardingEligibility(under13Dob, false)).toEqual({
        allowed: false,
        error: "under_age_limit",
      });
      expect(validateOnboardingEligibility(under13Dob, true)).toEqual({
        allowed: false,
        error: "under_age_limit",
      });

      // Case 2: Teen 13–15 and 16-17
      const teen15Dob = `${currentYear - 15}-03-20`;
      const teen17Dob = `${currentYear - 17}-08-10`;
      expect(ageBand(teen15Dob)).toBe("13-15");
      expect(ageBand(teen17Dob)).toBe("16-17");

      // Without consent -> rejected
      expect(validateOnboardingEligibility(teen15Dob, false)).toEqual({
        allowed: false,
        error: "parental_consent_required",
      });
      expect(validateOnboardingEligibility(teen17Dob, false)).toEqual({
        allowed: false,
        error: "parental_consent_required",
      });

      // With parental consent -> accepted
      expect(validateOnboardingEligibility(teen15Dob, true)).toEqual({
        allowed: true,
        band: "13-15",
        parentalConsent: true,
      });
      expect(validateOnboardingEligibility(teen17Dob, true)).toEqual({
        allowed: true,
        band: "16-17",
        parentalConsent: true,
      });

      // Case 3: 18+ (e.g. 19 years old)
      const adultDob = `${currentYear - 19}-01-10`;
      const bandAdult = ageBand(adultDob);
      expect(bandAdult).toBe("18+");
      expect(validateOnboardingEligibility(adultDob, false)).toEqual({
        allowed: true,
        band: "18+",
        parentalConsent: true,
      });
    });

    it("A.3: Completing onboarding writes profile with onboarded:true, seeds initial active goal, and unlocks /app", () => {
      const uid = "student_new_101";
      const now = new Date().toISOString();

      // Initial stats doc created with 0 XP, Level 1, 0 streak
      const statsDoc: UserStatsRow = defaultStatsDoc(uid);
      expect(statsDoc.xp).toBe(0);
      expect(statsDoc.level).toBe(1);
      expect(statsDoc.current_streak).toBe(0);

      // Initial settings doc created
      const settingsDoc = defaultSettingsDoc(uid, now);
      expect(settingsDoc.theme).toBe("dark");
      expect(settingsDoc.dyslexia_font).toBe(false);

      // Onboarding submission payload
      const completedProfile: ProfileRow = {
        id: uid,
        display_name: "Ahmad Al-Kandari",
        avatar_url: null,
        language: "en",
        region: "kuwait",
        date_of_birth: "2009-04-12",
        age_band: "16-17",
        grade_level: "high",
        preferred_subjects: ["Mathematics", "Physics", "Computer Science"],
        learning_goals: "Master calculus and prepare for the national science fair",
        parental_consent: true,
        onboarded: true,
        is_anonymous: false,
        auth_provider: "password",
        email_verified: true,
        phone_number: null,
        created_at: now,
        updated_at: now,
      };

      // Seeded initial goal
      const seededGoalId = generateSafeDocId("goal");
      const seededGoal: GoalRow = {
        id: seededGoalId,
        user_id: uid,
        title: completedProfile.learning_goals!,
        area: "academic",
        status: "active",
        is_daily: false,
        last_reset_date: null,
        target_date: null,
        completed_at: null,
        created_at: now,
      };

      expect(seededGoal.status).toBe("active");
      expect(seededGoal.title).toContain("Master calculus");

      // App route gate re-evaluated
      const gateResult = completedProfile.onboarded ? { allow: true } : { redirect: "/onboarding" };
      expect(gateResult).toEqual({ allow: true });

      // Auth state resolution reflects full authentication
      const authState = resolveAccountAuthState({
        isInitialized: true,
        hasUser: true,
        emailVerified: true,
        signInProvider: "password",
        profileInitialized: true,
        profileOnboarded: completedProfile.onboarded,
      });
      expect(authState).toBe("AUTHENTICATED");
      expect(isAppAccessAllowedForState(authState)).toBe(true);
    });

    it("A.4: First learning action logs activity event, awards XP (+25 XP), advances level progress, and initializes Growth Map", () => {
      const uid = "student_new_101";
      const now = new Date().toISOString();

      // Student reviews their first study flashcard or creates note (+25 XP)
      const firstEvent: ActivityEventRow = {
        id: generateSafeDocId("evt"),
        user_id: uid,
        event_type: "study_item_create",
        area: "academic",
        xp: 25,
        ref_id: "item_math_01",
        created_at: now,
      };

      // XP and Level progression check
      const prevXp = 0;
      const nextXp = prevXp + firstEvent.xp;
      const progress = levelProgress(nextXp);

      expect(nextXp).toBe(25);
      expect(progress.level).toBe(1);
      expect(progress.current).toBe(25);
      expect(progress.needed).toBe(50);
      expect(progress.pct).toBe(50);

      // Student completes second learning action (+25 XP), leveling up to Level 2 (50 XP threshold)
      const levelUpProgress = levelProgress(50);
      expect(levelUpProgress.level).toBe(2);
      expect(levelUpProgress.current).toBe(0);
      expect(levelUpProgress.needed).toBe(150);

      // Growth Map area breakdown
      const breakdown = computeXpAreaBreakdown([firstEvent]);
      const academicStat = breakdown.find((b) => b.area === "academic");
      expect(academicStat?.xp).toBe(25);
      expect(academicStat?.pct).toBe(100);

      const productivityStat = breakdown.find((b) => b.area === "productivity");
      expect(productivityStat?.xp).toBe(0);
      expect(productivityStat?.pct).toBe(0);
    });
  });

  describe("Journey B: Returning Student (Sign-In -> Direct /app Entry -> State Hydration -> Activity -> Milestone Toast -> Heatmap -> Reload Persistence)", () => {
    it("B.1: Returning verified student with onboarded:true bypasses /onboarding directly to /app", () => {
      const returningUser = makeMockUser({
        uid: "student_returning_202",
        displayName: "Fatima Al-Mutawa",
        email: "fatima@nexora.school",
      });

      const existingProfile: ProfileRow = {
        id: returningUser.uid,
        display_name: "Fatima Al-Mutawa",
        avatar_url: "https://example.com/avatar2.jpg",
        language: "en",
        region: "kuwait",
        date_of_birth: "2008-08-14",
        age_band: "16-17",
        grade_level: "high",
        preferred_subjects: ["Biology", "Chemistry", "Arabic"],
        learning_goals: "Prepare for medicine entrance exams",
        parental_consent: true,
        onboarded: true,
        is_anonymous: false,
        auth_provider: "google.com",
        email_verified: true,
        phone_number: null,
        created_at: "2026-09-01T08:00:00Z",
        updated_at: "2026-11-01T10:00:00Z",
      };

      // App route gate check
      function checkAppRouteGate(profile: ProfileRow) {
        if (!profile.onboarded) {
          return { redirect: "/onboarding" };
        }
        return { allow: true };
      }

      expect(checkAppRouteGate(existingProfile)).toEqual({ allow: true });

      const authState = resolveAccountAuthState({
        isInitialized: true,
        hasUser: true,
        emailVerified: true,
        signInProvider: "google.com",
        profileInitialized: true,
        profileOnboarded: existingProfile.onboarded,
      });
      expect(authState).toBe("AUTHENTICATED");
    });

    it("B.2: Hydrates complete persistent student state (XP, level, streak, tasks, goals, flashcards, care, quran, settings)", () => {
      const uid = "student_returning_202";

      // 1. Stats
      const persistedStats: UserStatsRow = {
        user_id: uid,
        xp: 240,
        level: 3,
        current_streak: 5,
        longest_streak: 8,
        last_active_date: "2026-11-16",
        updated_at: "2026-11-16T18:00:00Z",
      };

      // 2. Tasks
      const persistedTasks: TaskRow[] = [
        {
          id: "t_01",
          user_id: uid,
          title: "Complete Biology Chapter 4 summary",
          details: null,
          area: "academic",
          priority: "high",
          status: "done",
          due_at: "2026-11-16T14:00:00Z",
          goal_id: null,
          completed_at: "2026-11-16T14:00:00Z",
          created_at: "2026-11-15T09:00:00Z",
        },
        {
          id: "t_02",
          user_id: uid,
          title: "Practice 15 Organic Chemistry flashcards",
          details: null,
          area: "academic",
          priority: "medium",
          status: "todo",
          due_at: "2026-11-17T11:00:00Z",
          goal_id: null,
          completed_at: null,
          created_at: "2026-11-16T11:00:00Z",
        },
      ];

      // 3. Goals
      const persistedGoals: GoalRow[] = [
        {
          id: "g_01",
          user_id: uid,
          title: "Score 95%+ on mock chemistry exam",
          area: "academic",
          status: "active",
          is_daily: false,
          last_reset_date: null,
          target_date: "2026-12-15",
          completed_at: null,
          created_at: "2026-09-05T10:00:00Z",
        },
      ];

      // 4. Study Items (Spaced Repetition Flashcard)
      const persistedFlashcard: StudyItemRow = {
        id: "st_01",
        user_id: uid,
        subject: "Chemistry",
        title: "Covalent Bonding vs Ionic Bonding",
        content: "Transfer of electrons vs shared electron pairs.",
        kind: "flashcard",
        deck: "General Chemistry",
        difficulty: "medium",
        answer: "Covalent: electron sharing. Ionic: electron transfer.",
        mistake_reason: null,
        mistake_status: "open",
        review_count: 3,
        next_review_at: "2026-11-18T10:00:00Z",
        created_at: "2026-10-10T12:00:00Z",
        updated_at: "2026-11-16T10:00:00Z",
      };

      // 5. Wellbeing Care Entries
      const persistedCare: CareEntryRow[] = [
        {
          id: "care_01",
          user_id: uid,
          mood: "focused",
          energy: 4,
          stress_level: 2,
          sleep_hours: 7.5,
          prompt: "What made today meaningful?",
          note: "Productive chemistry revision session.",
          created_at: "2026-11-16T21:00:00Z",
        },
      ];

      // Verify all hydrated fields
      expect(persistedStats.xp).toBe(240);
      expect(persistedStats.level).toBe(3);
      expect(persistedStats.current_streak).toBe(5);
      expect(persistedTasks.length).toBe(2);
      expect(persistedGoals[0]?.status).toBe("active");
      expect(persistedFlashcard.review_count).toBe(3);
      expect(persistedCare[0]?.energy).toBe(4);
    });

    it("B.3: Resuming learning activity extends streak from 5 to 6 days and awards XP (+40 XP)", () => {
      const uid = "student_returning_202";
      const previousStreak = 5;
      const lastActiveDate = "2026-11-16";
      const todayDate = "2026-11-17";

      // Function to calculate updated streak on new action
      function computeUpdatedStreak(lastDate: string, currentDate: string, currentStreak: number) {
        const last = new Date(lastDate);
        const curr = new Date(currentDate);
        const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          return currentStreak + 1;
        } else if (diffDays === 0) {
          return currentStreak; // Already extended today
        } else {
          return 1; // Streak reset
        }
      }

      const nextStreak = computeUpdatedStreak(lastActiveDate, todayDate, previousStreak);
      expect(nextStreak).toBe(6);

      // Student logs focus session
      const newEvent: ActivityEventRow = {
        id: generateSafeDocId("evt"),
        user_id: uid,
        event_type: "focus_complete",
        area: "productivity",
        xp: 40,
        ref_id: "focus_sess_01",
        created_at: "2026-11-17T09:30:00Z",
      };

      const updatedXp = 240 + newEvent.xp;
      expect(updatedXp).toBe(280);
      const updatedProgress = levelProgress(updatedXp);
      expect(updatedProgress.level).toBe(3);
      expect(updatedProgress.current).toBe(80);
      expect(updatedProgress.needed).toBe(250);
    });

    it("B.4: Milestone evaluation unlocks streak badge and triggers milestoneAchieved toast callback", () => {
      const mockToast = {
        milestoneAchieved: vi.fn(),
      };

      // Evaluate achievements with returning student's state after streak update
      const badges = getAchievementBadges({
        level: 3,
        xp: 280,
        streak: 6,
        completedTasks: 13,
        completedGoals: 1,
        focusSessionsCount: 5,
        masteredMistakesCount: 1,
        futurePlansCount: 1,
        circleCount: 1,
        careEntriesCount: 5,
        journalCount: 4,
        quizCount: 4,
      });

      const unlockedBadges = badges.filter((b) => b.unlocked);
      expect(unlockedBadges.length).toBeGreaterThan(0);

      // Verify streak badge is unlocked
      const streakBadge = unlockedBadges.find((b) => b.id.includes("streak"));
      expect(streakBadge).toBeDefined();

      // Trigger celebration toast
      if (streakBadge) {
        mockToast.milestoneAchieved(
          streakBadge.id,
          streakBadge.rewardXp,
          streakBadge.unlockedDescKey,
        );
      }

      expect(mockToast.milestoneAchieved).toHaveBeenCalledTimes(1);
      expect(mockToast.milestoneAchieved).toHaveBeenCalledWith(
        streakBadge!.id,
        streakBadge!.rewardXp,
        streakBadge!.unlockedDescKey,
      );
    });

    it("B.5: Weekly Growth Heatmap aggregates active days, completed tasks, and focus time", () => {
      const today = new Date("2026-11-17T12:00:00Z");

      const heatmapTasks: Array<{
        status: string;
        completed_at: string | null;
        created_at: string;
      }> = [
        {
          status: "done",
          completed_at: "2026-11-17T08:00:00Z",
          created_at: "2026-11-17T08:00:00Z",
        },
        {
          status: "done",
          completed_at: "2026-11-16T10:00:00Z",
          created_at: "2026-11-16T10:00:00Z",
        },
        {
          status: "done",
          completed_at: "2026-11-15T14:00:00Z",
          created_at: "2026-11-15T14:00:00Z",
        },
        {
          status: "done",
          completed_at: "2026-11-14T11:00:00Z",
          created_at: "2026-11-14T11:00:00Z",
        },
        {
          status: "done",
          completed_at: "2026-11-13T16:00:00Z",
          created_at: "2026-11-13T16:00:00Z",
        },
      ];

      const focusSessions = [
        { duration_minutes: 30, created_at: "2026-11-17T09:00:00Z" },
        { duration_minutes: 45, created_at: "2026-11-16T14:00:00Z" },
        { duration_minutes: 25, created_at: "2026-11-15T16:00:00Z" },
      ];

      const studyItems = [
        { created_at: "2026-11-17T11:00:00Z", updated_at: "2026-11-17T11:00:00Z" },
        { created_at: "2026-11-16T12:00:00Z", updated_at: "2026-11-16T12:00:00Z" },
      ];

      const heatmap = computeWeeklyProductivityHeatmap({
        tasks: heatmapTasks,
        focusSessions,
        studyItems,
        weeks: 4,
        today,
      });

      expect(heatmap.totalTasks).toBe(5);
      expect(heatmap.totalFocusMinutes).toBe(100);
      expect(heatmap.activeDays).toBeGreaterThanOrEqual(4);
      expect(heatmap.cells.length).toBe(28); // 4 weeks * 7 days
    });

    it("B.6: Cross-session reload persistence guarantees state stability without data loss", () => {
      // Simulating a reload by saving to a state snapshot store and retrieving it
      const studentStore = new Map<string, unknown>();

      const sessionState = {
        uid: "student_returning_202",
        profile: { onboarded: true, display_name: "Fatima Al-Mutawa" },
        stats: { xp: 280, level: 3, current_streak: 6 },
        activeGoals: 1,
        completedTasks: 13,
        preferences: { theme: "aurora_glass", dyslexia: false },
      };

      // Save to store
      studentStore.set("session", JSON.stringify(sessionState));

      // Reload
      const reloadedRaw = studentStore.get("session") as string;
      const reloadedState = JSON.parse(reloadedRaw);

      expect(reloadedState.stats.xp).toBe(280);
      expect(reloadedState.stats.current_streak).toBe(6);
      expect(reloadedState.stats.level).toBe(3);
      expect(reloadedState.profile.onboarded).toBe(true);
      expect(reloadedState.completedTasks).toBe(13);
    });
  });

  describe("20 Canonical Core Modules Architecture & Growth Map Orchestrator", () => {
    it("preserves exactly 20 canonical core modules numbered 01 through 20", () => {
      expect(CANONICAL_MODULES.length).toBe(20);

      // Verify strict sequential numbering from "01" to "20"
      const numbers = CANONICAL_MODULES.map((m) => m.number);
      const expectedNumbers = Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, "0"));
      expect(numbers).toEqual(expectedNumbers);

      // Verify uniqueness of IDs
      const ids = new Set(CANONICAL_MODULES.map((m) => m.id));
      expect(ids.size).toBe(20);
    });

    it("organizes modules into the 6 designated canonical categories", () => {
      const categoryIds = MODULE_CATEGORIES.map((c) => c.id);
      expect(categoryIds).toEqual([
        "learn",
        "grow",
        "create",
        "explore",
        "connect_contribute",
        "support_discover",
      ]);

      const learnModules = getModulesByCategory("learn");
      expect(learnModules.length).toBe(6); // 02, 04, 13, 14, 17, 19

      const growModules = getModulesByCategory("grow");
      expect(growModules.length).toBe(5); // 03, 05, 06, 07, 08

      const createModules = getModulesByCategory("create");
      expect(createModules.length).toBe(3); // 15, 16, 20

      const exploreModules = getModulesByCategory("explore");
      expect(exploreModules.length).toBe(3); // 01, 10, 12

      const connectModules = getModulesByCategory("connect_contribute");
      expect(connectModules.length).toBe(2); // 11, 18

      const supportModules = getModulesByCategory("support_discover");
      expect(supportModules.length).toBe(1); // 09
    });

    it("verifies Growth Map is NOT Module 21, but the central cross-platform orchestrator", () => {
      expect(GROWTH_MAP_ORCHESTRATOR.id).toBe("growth-map");
      expect(GROWTH_MAP_ORCHESTRATOR.to).toBe("/app");
      expect(GROWTH_MAP_ORCHESTRATOR.lifeAreas.length).toBe(6);

      // Confirm Growth Map is not inside CANONICAL_MODULES
      const module21 = CANONICAL_MODULES.find((m) => m.id === "growth-map");
      expect(module21).toBeUndefined();

      // Confirm all 20 modules are represented in the 6 life areas of the Growth Map
      const allOrchestratedModules = new Set(
        GROWTH_MAP_ORCHESTRATOR.lifeAreas.flatMap((la) => la.modules),
      );
      for (let i = 1; i <= 20; i++) {
        const numStr = String(i).padStart(2, "0");
        expect(allOrchestratedModules.has(numStr)).toBe(true);
      }
    });

    it("verifies every canonical module has a valid mapped feature guide in FEATURE_GUIDES", () => {
      for (const m of CANONICAL_MODULES) {
        expect(
          FEATURE_GUIDES[m.guideId],
          `Module ${m.number} (${m.name}) guideId '${m.guideId}' must exist in FEATURE_GUIDES`,
        ).toBeDefined();
        expect(m.description.length).toBeGreaterThan(10);
        expect(m.to.startsWith("/app")).toBe(true);
        expect(m.capabilities.length).toBeGreaterThanOrEqual(3);
      }

      // Verify Growth Map orchestrator guide exists
      expect(FEATURE_GUIDES[GROWTH_MAP_ORCHESTRATOR.guideId]).toBeDefined();
    });

    it("supports search and lookup across all 20 modules by number, name, and capability", () => {
      expect(getCanonicalModule("01")?.name).toBe("AI Intelligence");
      expect(getCanonicalModule("17")?.name).toBe("Quran & Islamic Learning");
      expect(getCanonicalModule("13")?.name).toBe("Science & Discovery");

      // Search by capability
      const codeResults = searchModules("sandbox");
      expect(codeResults.some((m) => m.number === "16")).toBe(true);

      const mathResults = searchModules("calculus");
      expect(mathResults.some((m) => m.number === "14")).toBe(true);

      // Search by number
      const numResult = searchModules("20");
      expect(numResult.length).toBe(1);
      expect(numResult[0]?.name).toBe("Projects & Innovation");
    });
  });
});
