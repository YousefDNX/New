export type SadaqahCategoryId =
  "knowledge" | "charity" | "family" | "community" | "quran_dhikr" | "water_food";

export type ConsistencyCadence = "daily" | "weekly" | "monthly";

export interface SadaqahDeedLogEntry {
  id: string;
  category: SadaqahCategoryId;
  title: string;
  dedicatedTo: string;
  createdAt: string;
  dateKey: string;
}

export interface SadaqahTrackerState {
  totalDeeds: number;
  categoryCounts: Record<SadaqahCategoryId, number>;
  dailyCounts: Record<string, number>;
  goalCadence: ConsistencyCadence;
  goalTarget: number;
  goalIntention: string;
  recentDeeds: SadaqahDeedLogEntry[];
}

export const SADAQAH_TRACKER_STORAGE_KEY = "btc_sadaqah_jariyah_tracker_v1";
export const SADAQAH_FAMILY_STORAGE_KEY = "btc_sadaqah_family_names_v1";
export const SADAQAH_FAMILY_EVENT = "btc:sadaqah-family-updated";

export interface SadaqahCategoryMeta {
  id: SadaqahCategoryId;
  labelAr: string;
  labelEn: string;
  hintAr: string;
  hintEn: string;
  defaultDeedAr: string;
  defaultDeedEn: string;
}

export interface SadaqahQuickPreset {
  id: string;
  category: SadaqahCategoryId;
  titleAr: string;
  titleEn: string;
}

export const SADAQAH_CATEGORIES: readonly SadaqahCategoryMeta[] = [
  {
    id: "knowledge",
    labelAr: "نشر علم نافع",
    labelEn: "Beneficial Knowledge",
    hintAr: "شرح درس أو مشاركة ملخص مجاني",
    hintEn: "Teach a concept or share free study notes",
    defaultDeedAr: "مشاركة علم نافع أو مساعدة زميل في الفهم",
    defaultDeedEn: "Shared beneficial knowledge or helped a peer learn",
  },
  {
    id: "charity",
    labelAr: "صدقة وعطاء خفي",
    labelEn: "Charitable Giving",
    hintAr: "صدقة أو كفالة أو تفريج كربة محتاج",
    hintEn: "Silent charity, relief, or aiding someone",
    defaultDeedAr: "صدقة أو عون محتاج في الخفاء لوجه الله",
    defaultDeedEn: "Quiet charity or support offered sincerely",
  },
  {
    id: "family",
    labelAr: "بر الوالدين والأهل",
    labelEn: "Parents & Family Care",
    hintAr: "بر الوالدين أو صلة الرحم أو الدعاء للأهل",
    hintEn: "Honor parents, reach relatives, or pray for family",
    defaultDeedAr: "بر الوالدين وصلة الرحم والدعاء للأهل",
    defaultDeedEn: "Kindness to parents, family outreach & duaa",
  },
  {
    id: "community",
    labelAr: "نفع عام وإحسان",
    labelEn: "Community Impact",
    hintAr: "إماطة أذى أو تطوع أو إصلاح وغرس نافع",
    hintEn: "Volunteering, planting, or community service",
    defaultDeedAr: "عمل تطوعي أو نفع عام لخدمة الناس",
    defaultDeedEn: "Community service or positive environmental action",
  },
  {
    id: "water_food",
    labelAr: "سقيا الماء وإطعام الطعام",
    labelEn: "Water Relief & Feeding",
    hintAr: "أفضل الصدقات جارية النفع وأعظمها ثواباً",
    hintEn: "Providing clean water or food for humans & animals",
    defaultDeedAr: "سقيا ماء أو إطعام طعام لوجه الله",
    defaultDeedEn: "Provided water relief or food sincerely for Allah",
  },
  {
    id: "quran_dhikr",
    labelAr: "وقف قرآني وذكر واستغفار",
    labelEn: "Quran & Remembrance",
    hintAr: "ورد تلاوة أو تسبيح واستغفار بنية الأهل",
    hintEn: "Quran recitation, Istighfar, and praise dedicated to family",
    defaultDeedAr: "ورد تلاوة واستغفار وتسبيح بنية الأهل والأحباب",
    defaultDeedEn: "Quran recitation, Dhikr & Istighfar for family",
  },
] as const;

export const SADAQAH_QUICK_PRESETS: readonly SadaqahQuickPreset[] = [
  {
    id: "water",
    category: "water_food",
    titleAr: "سقيا ماء خالصاً لوجه الله",
    titleEn: "Water charity sincerely for Allah",
  },
  {
    id: "parents",
    category: "family",
    titleAr: "بر الوالدين ودعاء مستمر لهما",
    titleEn: "Honoring parents & praying for them",
  },
  {
    id: "notes",
    category: "knowledge",
    titleAr: "شرح درس أو ملخص مجاني لزميل",
    titleEn: "Free lesson explanation or study notes",
  },
  {
    id: "feeding",
    category: "water_food",
    titleAr: "إطعام طعام أو سقي طائر وحيوان",
    titleEn: "Feeding someone or watering animals",
  },
  {
    id: "planting",
    category: "community",
    titleAr: "غرس شجرة أو بذرة أو إماطة أذى",
    titleEn: "Planting a seed or removing road harm",
  },
  {
    id: "ward",
    category: "quran_dhikr",
    titleAr: "ورد تلاوة واستغفار وتسبيح بنية الأهل",
    titleEn: "Quran reading & Istighfar for family",
  },
  {
    id: "relief",
    category: "charity",
    titleAr: "صدقة خفية وتفريج كربة مسلم",
    titleEn: "Hidden charity & relieving hardship",
  },
] as const;

export function getLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function createInitialSadaqahState(): SadaqahTrackerState {
  return {
    totalDeeds: 0,
    categoryCounts: {
      knowledge: 0,
      charity: 0,
      family: 0,
      community: 0,
      water_food: 0,
      quran_dhikr: 0,
    },
    dailyCounts: {},
    goalCadence: "weekly",
    goalTarget: 7,
    goalIntention: "",
    recentDeeds: [],
  };
}

export function clampGoalTarget(value: number): number {
  if (!Number.isFinite(value)) return 7;
  return Math.max(1, Math.min(365, Math.round(value)));
}

export function normalizeSadaqahState(raw: unknown): SadaqahTrackerState {
  const base = createInitialSadaqahState();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;

  const rawCadence = obj["goalCadence"];
  const cadence =
    rawCadence === "daily" || rawCadence === "weekly" || rawCadence === "monthly"
      ? rawCadence
      : base.goalCadence;

  const rawCountsObj = obj["categoryCounts"];
  const rawCounts =
    rawCountsObj && typeof rawCountsObj === "object"
      ? (rawCountsObj as Record<string, unknown>)
      : {};

  const safeNum = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;

  const categoryCounts: Record<SadaqahCategoryId, number> = {
    knowledge: safeNum(rawCounts["knowledge"]),
    charity: safeNum(rawCounts["charity"]),
    family: safeNum(rawCounts["family"]),
    community: safeNum(rawCounts["community"]),
    water_food: safeNum(rawCounts["water_food"]),
    quran_dhikr: safeNum(rawCounts["quran_dhikr"]),
  };

  const dailyCounts: Record<string, number> = {};
  const rawDailyObj = obj["dailyCounts"];
  if (rawDailyObj && typeof rawDailyObj === "object") {
    const entries = Object.entries(rawDailyObj as Record<string, unknown>)
      .filter(([k, v]) => /^\d{4}-\d{2}-\d{2}$/.test(k) && safeNum(v) > 0)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 400);
    for (const [k, v] of entries) {
      dailyCounts[k] = safeNum(v);
    }
  }

  const rawRecent = obj["recentDeeds"];
  const recentDeeds: SadaqahDeedLogEntry[] = Array.isArray(rawRecent)
    ? rawRecent
        .filter((entry): entry is SadaqahDeedLogEntry => {
          if (!entry || typeof entry !== "object") return false;
          const e = entry as Record<string, unknown>;
          const cat = e["category"];
          return (
            typeof e["id"] === "string" &&
            typeof e["title"] === "string" &&
            (cat === "knowledge" ||
              cat === "charity" ||
              cat === "family" ||
              cat === "community" ||
              cat === "water_food" ||
              cat === "quran_dhikr") &&
            typeof e["dateKey"] === "string" &&
            typeof e["createdAt"] === "string"
          );
        })
        .slice(0, 25)
    : [];

  const sumCategories =
    categoryCounts.knowledge +
    categoryCounts.charity +
    categoryCounts.family +
    categoryCounts.community +
    categoryCounts.water_food +
    categoryCounts.quran_dhikr;

  const rawIntention = obj["goalIntention"];

  return {
    totalDeeds: Math.max(safeNum(obj["totalDeeds"]), sumCategories),
    categoryCounts,
    dailyCounts,
    goalCadence: cadence,
    goalTarget: clampGoalTarget(Number(obj["goalTarget"] ?? base.goalTarget)),
    goalIntention: typeof rawIntention === "string" ? rawIntention.slice(0, 140) : "",
    recentDeeds,
  };
}

export function loadSadaqahState(): SadaqahTrackerState {
  if (typeof window === "undefined") return createInitialSadaqahState();
  try {
    const saved = window.localStorage.getItem(SADAQAH_TRACKER_STORAGE_KEY);
    if (!saved) return createInitialSadaqahState();
    return normalizeSadaqahState(JSON.parse(saved));
  } catch {
    return createInitialSadaqahState();
  }
}

export function saveSadaqahState(state: SadaqahTrackerState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SADAQAH_TRACKER_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export function countDeedsForPeriod(
  dailyCounts: Record<string, number>,
  cadence: ConsistencyCadence,
  now: Date = new Date(),
): number {
  const todayKey = getLocalDateKey(now);
  if (cadence === "daily") {
    return dailyCounts[todayKey] ?? 0;
  }
  if (cadence === "monthly") {
    const monthPrefix = todayKey.slice(0, 7);
    return Object.entries(dailyCounts).reduce(
      (sum, [dateKey, count]) => (dateKey.startsWith(monthPrefix) ? sum + count : sum),
      0,
    );
  }

  // Weekly window: current Sunday-through-Saturday calendar week
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const weekKeys = new Set<string>();
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate() + i,
    );
    weekKeys.add(getLocalDateKey(day));
  }
  return Array.from(weekKeys).reduce((sum, key) => sum + (dailyCounts[key] ?? 0), 0);
}

export function computeConsistencyMetrics(
  state: SadaqahTrackerState,
  now: Date = new Date(),
): {
  todayCount: number;
  periodCount: number;
  periodProgressPct: number;
  goalReached: boolean;
  consecutiveDays: number;
  activeDaysTotal: number;
} {
  const todayKey = getLocalDateKey(now);
  const todayCount = state.dailyCounts[todayKey] ?? 0;
  const periodCount = countDeedsForPeriod(state.dailyCounts, state.goalCadence, now);
  const target = clampGoalTarget(state.goalTarget);
  const periodProgressPct = Math.min(100, Math.round((periodCount / target) * 100));
  const goalReached = periodCount >= target;
  const activeDaysTotal = Object.values(state.dailyCounts).filter((c) => c > 0).length;

  let consecutiveDays = 0;
  const startOffset = todayCount > 0 ? 0 : 1;
  for (let offset = startOffset; offset < 400; offset += 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const key = getLocalDateKey(d);
    if ((state.dailyCounts[key] ?? 0) > 0) {
      consecutiveDays += 1;
    } else {
      break;
    }
  }

  return {
    todayCount,
    periodCount,
    periodProgressPct,
    goalReached,
    consecutiveDays,
    activeDaysTotal,
  };
}

export function logSadaqahDeed(
  prev: SadaqahTrackerState,
  input: {
    category: SadaqahCategoryId;
    title: string;
    dedicatedTo?: string;
    now?: Date;
  },
): SadaqahTrackerState {
  const now = input.now ?? new Date();
  const dateKey = getLocalDateKey(now);
  const entry: SadaqahDeedLogEntry = {
    id: `sj_${now.getTime().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    category: input.category,
    title: input.title.trim().slice(0, 140),
    dedicatedTo: (input.dedicatedTo ?? "").trim().slice(0, 120),
    createdAt: now.toISOString(),
    dateKey,
  };

  const nextDaily = {
    ...prev.dailyCounts,
    [dateKey]: (prev.dailyCounts[dateKey] ?? 0) + 1,
  };

  // Keep daily map bounded cleanly
  const trimmedDaily: Record<string, number> = {};
  for (const [k, v] of Object.entries(nextDaily)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 400)) {
    if (v > 0) trimmedDaily[k] = v;
  }

  return {
    ...prev,
    totalDeeds: prev.totalDeeds + 1,
    categoryCounts: {
      ...prev.categoryCounts,
      [input.category]: (prev.categoryCounts[input.category] ?? 0) + 1,
    },
    dailyCounts: trimmedDaily,
    recentDeeds: [entry, ...prev.recentDeeds].slice(0, 25),
  };
}

export function removeSadaqahDeed(prev: SadaqahTrackerState, entryId: string): SadaqahTrackerState {
  const target = prev.recentDeeds.find((e) => e.id === entryId);
  if (!target) return prev;

  const nextDayVal = Math.max(0, (prev.dailyCounts[target.dateKey] ?? 0) - 1);
  const nextDaily = { ...prev.dailyCounts };
  if (nextDayVal === 0) {
    delete nextDaily[target.dateKey];
  } else {
    nextDaily[target.dateKey] = nextDayVal;
  }

  return {
    ...prev,
    totalDeeds: Math.max(0, prev.totalDeeds - 1),
    categoryCounts: {
      ...prev.categoryCounts,
      [target.category]: Math.max(0, (prev.categoryCounts[target.category] ?? 0) - 1),
    },
    dailyCounts: nextDaily,
    recentDeeds: prev.recentDeeds.filter((e) => e.id !== entryId),
  };
}
