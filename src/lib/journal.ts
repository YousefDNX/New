import type { GrowthArea, JournalEntryRow, JournalMood } from "./firestore-data";
import { BRAND } from "../config/brand.ts";

export interface JournalMoodMeta {
  id: JournalMood;
  labelKey:
    | "journal.mood.focused"
    | "journal.mood.curious"
    | "journal.mood.confident"
    | "journal.mood.challenged"
    | "journal.mood.reflective"
    | "journal.mood.energized";
  accentColor: string;
}

export const JOURNAL_MOODS: JournalMoodMeta[] = [
  { id: "focused", labelKey: "journal.mood.focused", accentColor: "oklch(0.8 0.14 190)" },
  { id: "curious", labelKey: "journal.mood.curious", accentColor: "oklch(0.76 0.14 235)" },
  { id: "confident", labelKey: "journal.mood.confident", accentColor: "oklch(0.75 0.15 155)" },
  { id: "challenged", labelKey: "journal.mood.challenged", accentColor: "oklch(0.78 0.16 50)" },
  { id: "reflective", labelKey: "journal.mood.reflective", accentColor: "oklch(0.72 0.16 290)" },
  { id: "energized", labelKey: "journal.mood.energized", accentColor: "oklch(0.82 0.15 75)" },
];

export interface JournalPromptTemplate {
  id: string;
  area: GrowthArea;
  promptKey:
    | "journal.prompt.1"
    | "journal.prompt.2"
    | "journal.prompt.3"
    | "journal.prompt.4"
    | "journal.prompt.5";
  defaultTitleEn: string;
  defaultTitleAr: string;
}

export const DAILY_JOURNAL_PROMPTS: JournalPromptTemplate[] = [
  {
    id: "concept-clicked",
    area: "academic",
    promptKey: "journal.prompt.1",
    defaultTitleEn: "Concept Breakthrough",
    defaultTitleAr: "مفهوم اتّضح اليوم",
  },
  {
    id: "mistake-lesson",
    area: "growth",
    promptKey: "journal.prompt.2",
    defaultTitleEn: "Lesson from a Mistake",
    defaultTitleAr: "درس من خطأ دراسي",
  },
  {
    id: "focus-review",
    area: "productivity",
    promptKey: "journal.prompt.3",
    defaultTitleEn: "Focus & Execution Check",
    defaultTitleAr: "مراجعة التركيز والإنجاز",
  },
  {
    id: "future-skill",
    area: "career",
    promptKey: "journal.prompt.4",
    defaultTitleEn: "Skill & Future Step",
    defaultTitleAr: "مهارة وخطوة مستقبلية",
  },
  {
    id: "balance-gratitude",
    area: "wellbeing",
    promptKey: "journal.prompt.5",
    defaultTitleEn: "Energy & Balance Reflection",
    defaultTitleAr: "تأمل الطاقة والتوازن",
  },
];

function prevUtcDay(isoDate: string): string {
  const parsed = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  parsed.setUTCDate(parsed.getUTCDate() - 1);
  return parsed.toISOString().slice(0, 10);
}

/**
 * Computes consecutive journaling days ending at `referenceDate` (today or yesterday if today not yet logged).
 */
export function computeJournalStreak(
  entries: Pick<JournalEntryRow, "entry_date">[],
  referenceDate = new Date().toISOString().slice(0, 10),
): number {
  if (entries.length === 0) return 0;
  const uniqueDates = new Set(
    entries.map((e) => e.entry_date.slice(0, 10)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)),
  );
  if (uniqueDates.size === 0) return 0;

  let cursor = referenceDate.slice(0, 10);
  if (!uniqueDates.has(cursor)) {
    const yesterday = prevUtcDay(cursor);
    if (!uniqueDates.has(yesterday)) {
      return 0;
    }
    cursor = yesterday;
  }

  let streak = 0;
  while (uniqueDates.has(cursor)) {
    streak += 1;
    cursor = prevUtcDay(cursor);
  }
  return streak;
}

export interface JournalFilters {
  search?: string;
  area?: GrowthArea | "all";
  mood?: JournalMood | "all";
}

export function filterJournalEntries(
  entries: JournalEntryRow[],
  filters: JournalFilters,
): JournalEntryRow[] {
  const q = (filters.search ?? "").trim().toLowerCase();
  const area = filters.area ?? "all";
  const mood = filters.mood ?? "all";

  return entries
    .filter((entry) => {
      if (area !== "all" && entry.area !== area) return false;
      if (mood !== "all" && entry.mood !== mood) return false;
      if (!q) return true;
      const haystack = [
        entry.title,
        entry.reflection,
        entry.key_win ?? "",
        entry.next_step ?? "",
        entry.subject ?? "",
        entry.entry_date,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    })
    .sort((a, b) => {
      const dateCmp = b.entry_date.localeCompare(a.entry_date);
      if (dateCmp !== 0) return dateCmp;
      return b.updated_at.localeCompare(a.updated_at);
    });
}

export interface JournalInsightsSummary {
  totalEntries: number;
  streakDays: number;
  totalWords: number;
  totalStudyMinutes: number;
  topArea: GrowthArea | null;
}

export function summarizeJournalInsights(
  entries: JournalEntryRow[],
  referenceDate = new Date().toISOString().slice(0, 10),
): JournalInsightsSummary {
  const totalEntries = entries.length;
  const streakDays = computeJournalStreak(entries, referenceDate);

  let totalWords = 0;
  let totalStudyMinutes = 0;
  const areaCounts = new Map<GrowthArea, number>();

  for (const e of entries) {
    const text = [e.title, e.reflection, e.key_win ?? "", e.next_step ?? ""].join(" ").trim();
    if (text) {
      totalWords += text.split(/\s+/).filter(Boolean).length;
    }
    if (typeof e.study_minutes === "number" && e.study_minutes > 0) {
      totalStudyMinutes += e.study_minutes;
    }
    areaCounts.set(e.area, (areaCounts.get(e.area) ?? 0) + 1);
  }

  let topArea: GrowthArea | null = null;
  let maxCount = 0;
  for (const [area, count] of areaCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      topArea = area;
    }
  }

  return {
    totalEntries,
    streakDays,
    totalWords,
    totalStudyMinutes,
    topArea,
  };
}

export function formatJournalMarkdownExport(entries: JournalEntryRow[]): string {
  const sorted = filterJournalEntries(entries, {});
  const lines: string[] = [
    `# ${BRAND.shortName} Daily Growth Journal`,
    "",
    `Exported: ${new Date().toISOString().slice(0, 10)} (${sorted.length} entries)`,
    "",
  ];

  for (const entry of sorted) {
    lines.push(`## ${entry.entry_date} — ${entry.title}`);
    const meta: string[] = [`Area: ${entry.area}`, `Mood: ${entry.mood}`];
    if (entry.subject) meta.push(`Subject: ${entry.subject}`);
    if (typeof entry.study_minutes === "number" && entry.study_minutes > 0) {
      meta.push(`Study time: ${entry.study_minutes} min`);
    }
    if (entry.tags && entry.tags.length > 0) {
      meta.push(`Tags: ${entry.tags.map((t) => `#${t}`).join(" ")}`);
    }
    lines.push(`_${meta.join(" | ")}_`);
    lines.push("");
    lines.push(entry.reflection);
    if (entry.key_win) {
      lines.push("");
      lines.push(`- **Key Win:** ${entry.key_win}`);
    }
    if (entry.blocker) {
      lines.push(`- **Challenge / Blocker:** ${entry.blocker}`);
    }
    if (entry.gratitude) {
      lines.push(`- **Gratitude:** ${entry.gratitude}`);
    }
    if (entry.next_step) {
      lines.push(`- **Next Step:** ${entry.next_step}`);
    }
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

export interface JournalDateGroup {
  dateIso: string;
  relativeKind: "today" | "yesterday" | "date";
  totalStudyMinutes: number;
  entries: JournalEntryRow[];
}

export function groupJournalEntriesByDate(
  entries: JournalEntryRow[],
  todayIso = new Date().toISOString().slice(0, 10),
): JournalDateGroup[] {
  const safeToday = todayIso.slice(0, 10);
  const yesterday = prevUtcDay(safeToday);
  const sorted = filterJournalEntries(entries, {});
  const groups = new Map<string, JournalEntryRow[]>();

  for (const entry of sorted) {
    const day = entry.entry_date.slice(0, 10);
    const list = groups.get(day) ?? [];
    list.push(entry);
    groups.set(day, list);
  }

  return Array.from(groups.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dateIso, dayEntries]) => ({
      dateIso,
      relativeKind: dateIso === safeToday ? "today" : dateIso === yesterday ? "yesterday" : "date",
      totalStudyMinutes: dayEntries.reduce(
        (acc, e) => acc + (typeof e.study_minutes === "number" ? Math.max(0, e.study_minutes) : 0),
        0,
      ),
      entries: dayEntries,
    }));
}

export interface JournalHeatmapCell {
  dateIso: string;
  count: number;
  minutes: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export function buildJournalActivityHeatmap(
  entries: Pick<JournalEntryRow, "entry_date" | "study_minutes">[],
  todayIso = new Date().toISOString().slice(0, 10),
  days = 14,
): JournalHeatmapCell[] {
  const safeDays = Math.max(1, Math.min(days, 60));
  const counts = new Map<string, { count: number; minutes: number }>();
  for (const e of entries) {
    const iso = e.entry_date.slice(0, 10);
    const prev = counts.get(iso) ?? { count: 0, minutes: 0 };
    prev.count += 1;
    prev.minutes += typeof e.study_minutes === "number" ? Math.max(0, e.study_minutes) : 0;
    counts.set(iso, prev);
  }

  const endParsed = new Date(`${todayIso.slice(0, 10)}T00:00:00Z`);
  const validEnd = Number.isNaN(endParsed.getTime()) ? new Date() : endParsed;
  const out: JournalHeatmapCell[] = [];

  for (let offset = safeDays - 1; offset >= 0; offset--) {
    const d = new Date(validEnd.getTime() - offset * 86400_000);
    const iso = d.toISOString().slice(0, 10);
    const info = counts.get(iso) ?? { count: 0, minutes: 0 };
    const score = info.count * 25 + info.minutes;
    const level: 0 | 1 | 2 | 3 | 4 =
      info.count === 0 ? 0 : score >= 90 ? 4 : score >= 55 ? 3 : score >= 30 ? 2 : 1;
    out.push({
      dateIso: iso,
      count: info.count,
      minutes: info.minutes,
      level,
    });
  }
  return out;
}

export interface JournalMoodStat {
  mood: JournalMood;
  count: number;
  pct: number;
}

export function computeJournalMoodBreakdown(
  entries: Pick<JournalEntryRow, "mood">[],
): JournalMoodStat[] {
  const counts = new Map<JournalMood, number>();
  for (const e of entries) {
    counts.set(e.mood, (counts.get(e.mood) ?? 0) + 1);
  }
  const total = Math.max(entries.length, 1);
  return JOURNAL_MOODS.map((m) => {
    const count = counts.get(m.id) ?? 0;
    return {
      mood: m.id,
      count,
      pct: entries.length === 0 ? 0 : Math.round((count / total) * 100),
    };
  }).filter((item) => item.count > 0);
}

export function computeJournalLongestStreak(
  entries: Pick<JournalEntryRow, "entry_date">[],
): number {
  const uniqueDates = Array.from(
    new Set(
      entries.map((e) => e.entry_date.slice(0, 10)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)),
    ),
  ).sort();
  if (uniqueDates.length === 0) return 0;

  let longest = 1;
  let current = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevMs = Date.parse(`${uniqueDates[i - 1]}T00:00:00Z`);
    const currMs = Date.parse(`${uniqueDates[i]}T00:00:00Z`);
    if (currMs - prevMs === 86400_000) {
      current += 1;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}

export function extractHashtags(text: string): string[] {
  const matches = text.match(/#([a-zA-Z0-9_\u0600-\u06FF-]{2,28})/g);
  if (!matches) return [];
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const raw of matches) {
    const tag = raw.slice(1).toLowerCase();
    if (!seen.has(tag)) {
      seen.add(tag);
      unique.push(tag);
      if (unique.length >= 8) break;
    }
  }
  return unique;
}

export function countWordsAndReadingMinutes(text: string): {
  words: number;
  readingMinutes: number;
} {
  const cleaned = text.trim();
  if (!cleaned) return { words: 0, readingMinutes: 0 };
  const words = cleaned.split(/\s+/).filter(Boolean).length;
  return {
    words,
    readingMinutes: Math.max(1, Math.ceil(words / 180)),
  };
}

export function formatJournalJsonExport(entries: JournalEntryRow[]): string {
  const sorted = filterJournalEntries(entries, {});
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      source: "nexora.journals",
      count: sorted.length,
      entries: sorted,
    },
    null,
    2,
  );
}
