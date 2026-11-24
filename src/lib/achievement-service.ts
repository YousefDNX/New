import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { levelForXp } from "./growth";
import type { GrowthArea, UserStatsRow } from "./firestore-data";
import { buildEventDocId } from "./xp-rules";

export type AchievementCriteriaType =
  | "level"
  | "streak"
  | "tasks_done"
  | "focus_sessions"
  | "mistakes_mastered"
  | "journals_logged"
  | "care_entries"
  | "quizzes_passed"
  | "future_plans"
  | "circle_joined";

export interface AchievementDefinition {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  area: GrowthArea;
  rewardXp: number;
  iconName:
    | "Sparkles"
    | "CheckCircle2"
    | "Flame"
    | "Clock"
    | "Brain"
    | "BookOpen"
    | "Compass"
    | "Users"
    | "HeartPulse"
    | "Trophy"
    | "Zap"
    | "Award";
  criteriaType: AchievementCriteriaType;
  targetCount: number;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
}

export const ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] = [
  {
    id: "ach_pioneer",
    titleEn: "Growth Pioneer",
    titleAr: "رائد النمو",
    descriptionEn: "Created your student profile and began tracking academic growth",
    descriptionAr: "إنشاء الملف الطلابي وبدء رحلة التتبع والنمو الأكاديمي",
    area: "growth",
    rewardXp: 50,
    iconName: "Sparkles",
    criteriaType: "level",
    targetCount: 1,
    tier: "bronze",
  },
  {
    id: "ach_first_task",
    titleEn: "Task Initiator",
    titleAr: "مبادر الإنجاز",
    descriptionEn: "Complete your first task in the study planner",
    descriptionAr: "أنجز مهمتك الدراسية الأولى في المخطط الأسبوعي",
    area: "productivity",
    rewardXp: 50,
    iconName: "CheckCircle2",
    criteriaType: "tasks_done",
    targetCount: 1,
    tier: "bronze",
  },
  {
    id: "ach_streak_3",
    titleEn: "Flame Ignited",
    titleAr: "شعلة الاستمرار",
    descriptionEn: "Maintain a 3-day active study and reflection streak",
    descriptionAr: "حافظ على وتيرة 3 أيام متتالية من الدراسة والتأمل",
    area: "growth",
    rewardXp: 75,
    iconName: "Flame",
    criteriaType: "streak",
    targetCount: 3,
    tier: "bronze",
  },
  {
    id: "ach_focus_first",
    titleEn: "Deep Diver",
    titleAr: "غواص التركيز",
    descriptionEn: "Complete a distraction-free Pomodoro focus study session",
    descriptionAr: "إكمال أول جلسة تركيز بومودورو نقية بدون تشتت",
    area: "productivity",
    rewardXp: 60,
    iconName: "Clock",
    criteriaType: "focus_sessions",
    targetCount: 1,
    tier: "bronze",
  },
  {
    id: "ach_mistake_master",
    titleEn: "Mistake Alchemist",
    titleAr: "خيميائي الأخطاء",
    descriptionEn: "Log and master a study mistake with reasoned conceptual correction",
    descriptionAr: "تدوين وتصحيح أول خطأ دراسي مع الشرح المفاهيمي",
    area: "academic",
    rewardXp: 80,
    iconName: "Brain",
    criteriaType: "mistakes_mastered",
    targetCount: 1,
    tier: "silver",
  },
  {
    id: "ach_tasks_5",
    titleEn: "Execution Sprint",
    titleAr: "انطلاقة التنفيذ",
    descriptionEn: "Complete 5 academic and personal tasks",
    descriptionAr: "إنجاز 5 مهام دراسية وشخصية بنجاح",
    area: "productivity",
    rewardXp: 100,
    iconName: "CheckCircle2",
    criteriaType: "tasks_done",
    targetCount: 5,
    tier: "silver",
  },
  {
    id: "ach_journal_3",
    titleEn: "Reflective Mind",
    titleAr: "العقل المتأمل",
    descriptionEn: "Record 3 daily growth reflections in your study journal",
    descriptionAr: "تدوين 3 يوميات نمو وتأمل دراسي في السجل",
    area: "growth",
    rewardXp: 80,
    iconName: "BookOpen",
    criteriaType: "journals_logged",
    targetCount: 3,
    tier: "silver",
  },
  {
    id: "ach_streak_7",
    titleEn: "Flame Keeper",
    titleAr: "حارس الشعلة",
    descriptionEn: "Reach a continuous 7-day study consistency streak",
    descriptionAr: "الوصول إلى شعلة متواصلة لمدة 7 أيام متتالية",
    area: "growth",
    rewardXp: 100,
    iconName: "Flame",
    criteriaType: "streak",
    targetCount: 7,
    tier: "gold",
  },
  {
    id: "ach_future_pathway",
    titleEn: "Pathway Visionary",
    titleAr: "مستشرف المسار",
    descriptionEn: "Formulate a forward-looking university and career roadmap",
    descriptionAr: "بناء خطة مسار مستقبلي جامعي ومهني بأهداف واضحة",
    area: "career",
    rewardXp: 90,
    iconName: "Compass",
    criteriaType: "future_plans",
    targetCount: 1,
    tier: "silver",
  },
  {
    id: "ach_care_checkin",
    titleEn: "Mindful Balance",
    titleAr: "التوازن واليقظة",
    descriptionEn: "Log 3 private wellbeing sentiment and energy check-ins",
    descriptionAr: "تسجيل 3 وقفات رفاه نفسي وتوازن طاقة بخصوصية تامة",
    area: "wellbeing",
    rewardXp: 75,
    iconName: "HeartPulse",
    criteriaType: "care_entries",
    targetCount: 3,
    tier: "silver",
  },
  {
    id: "ach_circle_member",
    titleEn: "Knowledge Catalyst",
    titleAr: "محفّز المعرفة",
    descriptionEn: "Collaborate in a Knowledge Circle study group or team",
    descriptionAr: "المشاركة في دائرة معرفة دراسية أو فريق طلابي",
    area: "community",
    rewardXp: 85,
    iconName: "Users",
    criteriaType: "circle_joined",
    targetCount: 1,
    tier: "silver",
  },
  {
    id: "ach_level_5",
    titleEn: "Consistent Scholar",
    titleAr: "باحث مثابر",
    descriptionEn: "Reach Level 5 through holistic learning and productivity",
    descriptionAr: "الارتقاء إلى المستوى 5 عبر توازن الأداء والإنجاز",
    area: "academic",
    rewardXp: 100,
    iconName: "Trophy",
    criteriaType: "level",
    targetCount: 5,
    tier: "gold",
  },
  {
    id: "ach_tasks_15",
    titleEn: "Task Titan",
    titleAr: "عملاق الإنجاز",
    descriptionEn: "Conquer 15 structured study checklist tasks",
    descriptionAr: "إنجاز 15 مهمة دراسية ومشاريع في المخطط الأكاديمي",
    area: "productivity",
    rewardXp: 100,
    iconName: "Zap",
    criteriaType: "tasks_done",
    targetCount: 15,
    tier: "gold",
  },
  {
    id: "ach_focus_5",
    titleEn: "Deep Sprint Master",
    titleAr: "أستاذ التركيز العميق",
    descriptionEn: "Execute 5 focused study sprints without interruption",
    descriptionAr: "تنفيذ 5 جلسات تركيز عميقة دون انقطاع",
    area: "productivity",
    rewardXp: 100,
    iconName: "Clock",
    criteriaType: "focus_sessions",
    targetCount: 5,
    tier: "platinum",
  },
  {
    id: "ach_level_10",
    titleEn: "Nexora Luminary",
    titleAr: "رائد نيكسورا المتميز",
    descriptionEn: "Reach Level 10 across academic, wellbeing, and future domains",
    descriptionAr: "بلوغ المستوى 10 بالتميز في جميع مجالات النمو الأكاديمي",
    area: "growth",
    rewardXp: 100,
    iconName: "Award",
    criteriaType: "level",
    targetCount: 10,
    tier: "diamond",
  },
];

export interface AchievementEvaluationInput {
  level: number;
  streak: number;
  completedTasksCount: number;
  focusSessionsCount: number;
  masteredMistakesCount: number;
  journalsCount: number;
  careEntriesCount: number;
  quizzesCount: number;
  futurePlansCount: number;
  circleCount: number;
}

export interface EvaluatedAchievement extends AchievementDefinition {
  currentCount: number;
  progressPct: number;
  unlocked: boolean;
  claimed: boolean;
  claimedAt?: string | null;
}

/**
 * Pure evaluation of student achievement progress against definitions.
 */
export function evaluateStudentAchievements(
  input: AchievementEvaluationInput,
  claimedAchievementIds: Set<string> = new Set(),
): EvaluatedAchievement[] {
  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    let current = 0;
    switch (def.criteriaType) {
      case "level":
        current = input.level;
        break;
      case "streak":
        current = input.streak;
        break;
      case "tasks_done":
        current = input.completedTasksCount;
        break;
      case "focus_sessions":
        current = input.focusSessionsCount;
        break;
      case "mistakes_mastered":
        current = input.masteredMistakesCount;
        break;
      case "journals_logged":
        current = input.journalsCount;
        break;
      case "care_entries":
        current = input.careEntriesCount;
        break;
      case "quizzes_passed":
        current = input.quizzesCount;
        break;
      case "future_plans":
        current = input.futurePlansCount;
        break;
      case "circle_joined":
        current = input.circleCount;
        break;
    }

    const currentCount = Math.max(0, current);
    const progressPct = Math.min(100, Math.round((currentCount / def.targetCount) * 100));
    const unlocked = currentCount >= def.targetCount;
    const claimed = claimedAchievementIds.has(def.id);

    return {
      ...def,
      currentCount,
      progressPct,
      unlocked,
      claimed,
    };
  });
}

/**
 * Service to fetch claimed achievement events from Firestore.
 */
export async function fetchUserClaimedAchievements(userId: string): Promise<Set<string>> {
  if (!userId) return new Set();
  const path = "activity_events";
  try {
    const q = query(collection(db, path), where("user_id", "==", userId));
    const snap = await getDocs(q);
    const claimed = new Set<string>();
    for (const docSnap of snap.docs) {
      const data = docSnap.data() as { event_type?: string; ref_id?: string | null };
      if (data.event_type === "achievement_unlocked" && data.ref_id) {
        claimed.add(data.ref_id);
      }
    }
    return claimed;
  } catch (err) {
    console.warn("[AchievementService] Failed to fetch claimed achievements:", err);
    return new Set();
  }
}

/**
 * Claims an unlocked achievement:
 * 1. Verifies if already claimed in Firestore via deterministic event ID.
 * 2. Writes an activity_event doc with XP points.
 * 3. Updates user_stats in Firestore with new XP and calculated level.
 * 4. Dispatches global celebration event.
 */
export async function claimAchievementInFirestore(
  userId: string,
  achievementId: string,
): Promise<{ success: boolean; xpAwarded: number; achievement: AchievementDefinition | null }> {
  if (!userId || !achievementId) {
    return { success: false, xpAwarded: 0, achievement: null };
  }

  const def = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === achievementId);
  if (!def) {
    return { success: false, xpAwarded: 0, achievement: null };
  }

  const eventId = buildEventDocId(userId, "achievement_unlocked", achievementId);
  const eventPath = `activity_events/${eventId}`;

  // 1. Check if already claimed
  try {
    const existingSnap = await getDoc(doc(db, "activity_events", eventId));
    if (existingSnap.exists()) {
      return { success: false, xpAwarded: 0, achievement: def };
    }
  } catch {
    // continue to attempt claim
  }

  const nowIso = new Date().toISOString();

  // 2. Write activity event
  const cappedXp = Math.min(100, def.rewardXp); // ensure compliant with rule bound (<= 100)
  try {
    await setDoc(doc(db, "activity_events", eventId), {
      id: eventId,
      user_id: userId,
      event_type: "achievement_unlocked",
      area: def.area,
      xp: cappedXp,
      ref_id: achievementId,
      created_at: nowIso,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, eventPath);
  }

  // 3. Update user_stats in Firestore
  const statsPath = `user_stats/${userId}`;
  try {
    const statsRef = doc(db, "user_stats", userId);
    const statsSnap = await getDoc(statsRef);
    if (statsSnap.exists()) {
      const currentStats = statsSnap.data() as UserStatsRow;
      const newXp = (currentStats.xp || 0) + cappedXp;
      const newLevel = Math.max(currentStats.level || 1, levelForXp(newXp));
      await updateDoc(statsRef, {
        xp: newXp,
        level: newLevel,
        updated_at: nowIso,
      });
    } else {
      await setDoc(statsRef, {
        user_id: userId,
        xp: cappedXp,
        level: levelForXp(cappedXp),
        current_streak: 1,
        longest_streak: 1,
        last_active_date: nowIso.slice(0, 10),
        updated_at: nowIso,
      });
    }
  } catch (err) {
    console.warn("[AchievementService] Failed to update stats doc after achievement unlock:", err);
  }

  // 4. Dispatch in-browser milestone celebration event
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent("nexora:achievement-unlocked", {
          detail: {
            achievementId: def.id,
            titleEn: def.titleEn,
            titleAr: def.titleAr,
            rewardXp: cappedXp,
            area: def.area,
            iconName: def.iconName,
          },
        }),
      );
    } catch {
      // ignore event dispatch errors
    }
  }

  return { success: true, xpAwarded: cappedXp, achievement: def };
}
