export type QuranRepeatMode = "off" | "ayah" | "surah";
export type QuranReadingTheme = "system" | "light" | "dark";
export type QuranLineSpacing = "compact" | "comfortable" | "spacious";
export type QuranReadingWidth = "focused" | "wide";
export type QuranBookmarkCategory = "continue" | "review" | "favorite" | "custom";

export interface QuranSurah {
  id: number;
  nameArabic: string;
  nameSimple: string;
  translatedName: string;
  versesCount: number;
  revelationPlace: "makkah" | "madinah";
  pages?: [number, number];
}

export interface QuranJuz {
  juzNumber: number;
  versesCount: number;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

export interface QuranVerse {
  id: number;
  verseKey: string;
  verseNumber: number;
  textUthmani: string;
  pageNumber?: number;
  juzNumber?: number;
  translationText?: string;
}

export interface QuranTranslationSource {
  id: number;
  name: string;
  authorName: string;
  languageCode: string;
  languageLabel: string;
}

export interface QuranTimestamp {
  verseKey: string;
  verseNumber: number;
  timestampFromMs: number;
  timestampToMs: number;
  durationMs: number;
}

export interface QuranReciter {
  id: number;
  nameEn: string;
  nameAr: string;
  style: "Murattal" | "Mujawwad" | "Muallim";
  expectedPathHints: string[];
}

export interface QuranAudioResult {
  surahId: number;
  reciterId: number;
  audioUrl: string;
  format: string;
  fileSizeBytes: number | null;
  timestamps: QuranTimestamp[];
  sourceLabel: string;
  sourceUrl: string;
}

export interface QuranBookmark {
  id: string;
  surahId: number;
  ayahNumber: number;
  verseKey: string;
  surahNameAr: string;
  surahNameEn: string;
  excerpt: string;
  label: string;
  category: QuranBookmarkCategory;
  createdAt: string;
}

export interface QuranReadingHistoryEntry {
  surahId: number;
  ayahNumber: number;
  surahNameAr: string;
  surahNameEn: string;
  openedAt: string;
}

export interface QuranPreferencesState {
  saveToCloud: boolean;
  lastSurah: number;
  lastAyah: number;
  lastPositionSeconds: number;
  reciterId: number;
  playbackRate: number;
  volume: number;
  muted: boolean;
  repeatMode: QuranRepeatMode;
  fontSizeStep: number;
  readingTheme: QuranReadingTheme;
  lineSpacing: QuranLineSpacing;
  readingWidth: QuranReadingWidth;
  showVerseMarkers: boolean;
  showTranslation: boolean;
  translationId: number;
  bookmarks: QuranBookmark[];
  readingHistory: QuranReadingHistoryEntry[];
  updatedAt: string;
}

export class QuranAudioUnavailableError extends Error {
  constructor(message = "Recitation audio is unavailable for this selection.") {
    super(message);
    this.name = "QuranAudioUnavailableError";
  }
}

export class QuranNetworkError extends Error {
  constructor(message = "Network error while loading Quran data.") {
    super(message);
    this.name = "QuranNetworkError";
  }
}

export const QURAN_TEXT_ATTRIBUTION = {
  provider: "Quran.com API v4 (King Fahd Complex Uthmani Script)",
  url: "https://api.quran.com/api/v4",
  audioProvider: "QuranicAudio.com via Quran.com API v4",
  audioUrl: "https://quranicaudio.com",
} as const;

export const ALLOWED_PLAYBACK_RATES = [0.75, 1, 1.25, 1.5] as const;

export const BISMILLAH_UTHMANI = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";

export const MAX_QURAN_BOOKMARKS = 50;
export const MAX_QURAN_HISTORY = 20;

export const VERIFIED_QURAN_TRANSLATIONS: readonly QuranTranslationSource[] = [
  {
    id: 20,
    name: "Saheeh International",
    authorName: "Saheeh International",
    languageCode: "en",
    languageLabel: "English",
  },
  {
    id: 85,
    name: "M.A.S. Abdel Haleem",
    authorName: "Prof. Abdel Haleem",
    languageCode: "en",
    languageLabel: "English",
  },
  {
    id: 136,
    name: "Montada Islamic Foundation",
    authorName: "Montada Islamic Foundation",
    languageCode: "fr",
    languageLabel: "Français",
  },
  {
    id: 27,
    name: "Bubenheim & Nadeem",
    authorName: "Frank Bubenheim & Nadeem Elyas",
    languageCode: "de",
    languageLabel: "Deutsch",
  },
  {
    id: 35,
    name: "Japanese Translation",
    authorName: "Ryoichi Mita",
    languageCode: "ja",
    languageLabel: "日本語",
  },
  {
    id: 56,
    name: "Chinese Translation",
    authorName: "Ma Jian",
    languageCode: "zh-CN",
    languageLabel: "中文",
  },
  {
    id: 36,
    name: "Korean Translation",
    authorName: "Korean Islamic Society",
    languageCode: "ko",
    languageLabel: "한국어",
  },
] as const;

export const VERIFIED_JUZ_INDEX: readonly QuranJuz[] = [
  { juzNumber: 1, versesCount: 148, startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 },
  { juzNumber: 2, versesCount: 111, startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252 },
  { juzNumber: 3, versesCount: 126, startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92 },
  { juzNumber: 4, versesCount: 131, startSurah: 3, startAyah: 93, endSurah: 4, endAyah: 23 },
  { juzNumber: 5, versesCount: 124, startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147 },
  { juzNumber: 6, versesCount: 110, startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 81 },
  { juzNumber: 7, versesCount: 149, startSurah: 5, startAyah: 82, endSurah: 6, endAyah: 110 },
  { juzNumber: 8, versesCount: 142, startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87 },
  { juzNumber: 9, versesCount: 159, startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40 },
  { juzNumber: 10, versesCount: 127, startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92 },
  { juzNumber: 11, versesCount: 151, startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5 },
  { juzNumber: 12, versesCount: 170, startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52 },
  { juzNumber: 13, versesCount: 154, startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52 },
  { juzNumber: 14, versesCount: 227, startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128 },
  { juzNumber: 15, versesCount: 185, startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74 },
  { juzNumber: 16, versesCount: 269, startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135 },
  { juzNumber: 17, versesCount: 190, startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78 },
  { juzNumber: 18, versesCount: 202, startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20 },
  { juzNumber: 19, versesCount: 339, startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55 },
  { juzNumber: 20, versesCount: 171, startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45 },
  { juzNumber: 21, versesCount: 178, startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30 },
  { juzNumber: 22, versesCount: 169, startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27 },
  { juzNumber: 23, versesCount: 357, startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31 },
  { juzNumber: 24, versesCount: 175, startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46 },
  { juzNumber: 25, versesCount: 246, startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37 },
  { juzNumber: 26, versesCount: 195, startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30 },
  { juzNumber: 27, versesCount: 399, startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29 },
  { juzNumber: 28, versesCount: 137, startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12 },
  { juzNumber: 29, versesCount: 431, startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50 },
  { juzNumber: 30, versesCount: 564, startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6 },
] as const;

/**
 * Verified authentic human reciters from Quran.com v4 / QuranicAudio.
 * Reciter ID 11 is intentionally omitted due to an upstream API path mismatch
 * so every listed reciter matches their authentic audio stream 1:1.
 */
export const VERIFIED_QURAN_RECITERS: readonly QuranReciter[] = [
  {
    id: 7,
    nameEn: "Mishari Rashid al-`Afasy",
    nameAr: "مشاري راشد العفاسي",
    style: "Murattal",
    expectedPathHints: ["mishari_al_afasy", "alafasy"],
  },
  {
    id: 2,
    nameEn: "AbdulBaset AbdulSamad",
    nameAr: "عبد الباسط عبد الصمد",
    style: "Murattal",
    expectedPathHints: ["abdul_baset/murattal"],
  },
  {
    id: 1,
    nameEn: "AbdulBaset AbdulSamad",
    nameAr: "عبد الباسط عبد الصمد",
    style: "Mujawwad",
    expectedPathHints: ["abdul_baset/mujawwad"],
  },
  {
    id: 9,
    nameEn: "Mohamed Siddiq al-Minshawi",
    nameAr: "محمد صديق المنشاوي",
    style: "Murattal",
    expectedPathHints: ["siddiq_minshawi/murattal", "minshawi"],
  },
  {
    id: 8,
    nameEn: "Mohamed Siddiq al-Minshawi",
    nameAr: "محمد صديق المنشاوي",
    style: "Mujawwad",
    expectedPathHints: ["siddiq_al-minshawi/mujawwad", "minshawi"],
  },
  {
    id: 6,
    nameEn: "Mahmoud Khalil Al-Husary",
    nameAr: "محمود خليل الحصري",
    style: "Murattal",
    expectedPathHints: ["khalil_al_husary/murattal", "husary"],
  },
  {
    id: 12,
    nameEn: "Mahmoud Khalil Al-Husary",
    nameAr: "محمود خليل الحصري",
    style: "Muallim",
    expectedPathHints: ["khalil_al_husary/muallim", "husary"],
  },
  {
    id: 3,
    nameEn: "Abdur-Rahman as-Sudais",
    nameAr: "عبد الرحمن السديس",
    style: "Murattal",
    expectedPathHints: ["abdurrahmaan_as_sudais", "sudais"],
  },
  {
    id: 10,
    nameEn: "Sa`ud ash-Shuraym",
    nameAr: "سعود الشريم",
    style: "Murattal",
    expectedPathHints: ["saud_ash-shuraym", "shuraym"],
  },
  {
    id: 4,
    nameEn: "Abu Bakr al-Shatri",
    nameAr: "أبو بكر الشاطري",
    style: "Murattal",
    expectedPathHints: ["abu_bakr_shatri", "shatri"],
  },
  {
    id: 5,
    nameEn: "Hani ar-Rifai",
    nameAr: "هاني الرفاعي",
    style: "Murattal",
    expectedPathHints: ["hani_ar_rifai", "rifai"],
  },
] as const;

export const DEFAULT_QURAN_PREFERENCES: QuranPreferencesState = {
  saveToCloud: false,
  lastSurah: 1,
  lastAyah: 1,
  lastPositionSeconds: 0,
  reciterId: 7,
  playbackRate: 1,
  volume: 0.9,
  muted: false,
  repeatMode: "off",
  fontSizeStep: 3,
  readingTheme: "system",
  lineSpacing: "comfortable",
  readingWidth: "focused",
  showVerseMarkers: true,
  showTranslation: false,
  translationId: 20,
  bookmarks: [],
  readingHistory: [],
  updatedAt: new Date(0).toISOString(),
};

const SESSION_PREFS_KEY = "nexora_quran_session_prefs_v1";

const surahsCache = new Map<string, QuranSurah[]>();
const versesCache = new Map<string, QuranVerse[]>();
let juzsCache: QuranJuz[] | null = null;

export function clearQuranMemoryCaches(): void {
  surahsCache.clear();
  versesCache.clear();
  juzsCache = null;
}

export function clampSurahNumber(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(114, Math.max(1, Math.round(value)));
}

export function clampAyahNumber(value: number, maxAyahs = 286): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(1, maxAyahs), Math.max(1, Math.round(value)));
}

export function clampPlaybackRate(rate: number): number {
  if (!Number.isFinite(rate)) return 1;
  let closest: number = ALLOWED_PLAYBACK_RATES[1];
  let bestDist = Infinity;
  for (const candidate of ALLOWED_PLAYBACK_RATES) {
    const dist = Math.abs(candidate - rate);
    if (dist < bestDist) {
      bestDist = dist;
      closest = candidate;
    }
  }
  return closest;
}

export function clampVolume(volume: number): number {
  if (!Number.isFinite(volume)) return 0.9;
  return Math.min(1, Math.max(0, Math.round(volume * 100) / 100));
}

export function clampFontSizeStep(step: number): number {
  if (!Number.isFinite(step)) return 3;
  return Math.min(5, Math.max(1, Math.round(step)));
}

export function isVerifiedReciterId(reciterId: number): boolean {
  return VERIFIED_QURAN_RECITERS.some((r) => r.id === reciterId);
}

export function getVerifiedReciter(reciterId: number): QuranReciter {
  return VERIFIED_QURAN_RECITERS.find((r) => r.id === reciterId) ?? VERIFIED_QURAN_RECITERS[0]!;
}

export function isVerifiedTranslationId(translationId: number): boolean {
  return VERIFIED_QURAN_TRANSLATIONS.some((t) => t.id === translationId);
}

export function getVerifiedTranslation(translationId: number): QuranTranslationSource {
  return (
    VERIFIED_QURAN_TRANSLATIONS.find((t) => t.id === translationId) ??
    VERIFIED_QURAN_TRANSLATIONS[0]!
  );
}

export function getDefaultTranslationIdForLanguage(lang: string): number {
  const normalized = lang.toLowerCase();
  const match = VERIFIED_QURAN_TRANSLATIONS.find(
    (t) => t.languageCode.toLowerCase() === normalized,
  );
  return match?.id ?? 20;
}

export function shouldShowBismillahHeader(surahId: number): boolean {
  return surahId !== 1 && surahId !== 9;
}

export function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function toArabicIndicDigits(value: number): string {
  const digits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(Math.max(0, Math.floor(value)))
    .split("")
    .map((ch) => digits[Number(ch)] ?? ch)
    .join("");
}

export function stripTranslationMarkup(raw: string): string {
  return raw
    .replace(/<sup\b[^>]*>.*?<\/sup>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function findActiveAyahAtTime(
  timestamps: readonly QuranTimestamp[],
  currentTimeSec: number,
): number | null {
  if (!timestamps.length || !Number.isFinite(currentTimeSec) || currentTimeSec < 0) {
    return null;
  }
  const ms = currentTimeSec * 1000;
  for (const item of timestamps) {
    if (ms >= item.timestampFromMs && ms < item.timestampToMs) {
      return item.verseNumber;
    }
  }
  const last = timestamps[timestamps.length - 1];
  if (last && ms >= last.timestampFromMs && ms <= last.timestampToMs + 400) {
    return last.verseNumber;
  }
  return null;
}

export function normalizeBookmarks(raw: unknown): QuranBookmark[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: QuranBookmark[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Partial<QuranBookmark>;
    const surahId = clampSurahNumber(Number(obj.surahId));
    const ayahNumber = clampAyahNumber(Number(obj.ayahNumber));
    const verseKey = `${surahId}:${ayahNumber}`;
    if (seen.has(verseKey)) continue;
    seen.add(verseKey);
    const category: QuranBookmarkCategory =
      obj.category === "continue" ||
      obj.category === "review" ||
      obj.category === "favorite" ||
      obj.category === "custom"
        ? obj.category
        : "favorite";
    out.push({
      id:
        typeof obj.id === "string" && obj.id.trim()
          ? obj.id.slice(0, 48)
          : `bm_${surahId}_${ayahNumber}`,
      surahId,
      ayahNumber,
      verseKey,
      surahNameAr: typeof obj.surahNameAr === "string" ? obj.surahNameAr.slice(0, 60) : "",
      surahNameEn: typeof obj.surahNameEn === "string" ? obj.surahNameEn.slice(0, 60) : "",
      excerpt: typeof obj.excerpt === "string" ? obj.excerpt.slice(0, 140) : "",
      label: typeof obj.label === "string" ? obj.label.trim().slice(0, 60) : "",
      category,
      createdAt:
        typeof obj.createdAt === "string" && obj.createdAt.trim()
          ? obj.createdAt.slice(0, 40)
          : new Date().toISOString(),
    });
    if (out.length >= MAX_QURAN_BOOKMARKS) break;
  }
  return out;
}

export function normalizeReadingHistory(raw: unknown): QuranReadingHistoryEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: QuranReadingHistoryEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Partial<QuranReadingHistoryEntry>;
    const surahId = clampSurahNumber(Number(obj.surahId));
    const ayahNumber = clampAyahNumber(Number(obj.ayahNumber));
    const prev = out[out.length - 1];
    if (prev && prev.surahId === surahId && prev.ayahNumber === ayahNumber) continue;
    out.push({
      surahId,
      ayahNumber,
      surahNameAr: typeof obj.surahNameAr === "string" ? obj.surahNameAr.slice(0, 60) : "",
      surahNameEn: typeof obj.surahNameEn === "string" ? obj.surahNameEn.slice(0, 60) : "",
      openedAt:
        typeof obj.openedAt === "string" && obj.openedAt.trim()
          ? obj.openedAt.slice(0, 40)
          : new Date().toISOString(),
    });
    if (out.length >= MAX_QURAN_HISTORY) break;
  }
  return out;
}

export function normalizeQuranPreferences(
  raw: Partial<QuranPreferencesState> | null | undefined,
): QuranPreferencesState {
  const reciterCandidate = Number(raw?.reciterId ?? DEFAULT_QURAN_PREFERENCES.reciterId);
  const translationCandidate = Number(
    raw?.translationId ?? DEFAULT_QURAN_PREFERENCES.translationId,
  );
  const repeatCandidate = raw?.repeatMode;
  const themeCandidate = raw?.readingTheme;
  const spacingCandidate = raw?.lineSpacing;
  const widthCandidate = raw?.readingWidth;

  return {
    saveToCloud: Boolean(raw?.saveToCloud),
    lastSurah: clampSurahNumber(Number(raw?.lastSurah ?? DEFAULT_QURAN_PREFERENCES.lastSurah)),
    lastAyah: clampAyahNumber(Number(raw?.lastAyah ?? DEFAULT_QURAN_PREFERENCES.lastAyah)),
    lastPositionSeconds:
      typeof raw?.lastPositionSeconds === "number" &&
      Number.isFinite(raw.lastPositionSeconds) &&
      raw.lastPositionSeconds >= 0 &&
      raw.lastPositionSeconds <= 25000
        ? Math.round(raw.lastPositionSeconds * 10) / 10
        : 0,
    reciterId: isVerifiedReciterId(reciterCandidate)
      ? reciterCandidate
      : DEFAULT_QURAN_PREFERENCES.reciterId,
    playbackRate: clampPlaybackRate(
      Number(raw?.playbackRate ?? DEFAULT_QURAN_PREFERENCES.playbackRate),
    ),
    volume: clampVolume(Number(raw?.volume ?? DEFAULT_QURAN_PREFERENCES.volume)),
    muted: Boolean(raw?.muted),
    repeatMode:
      repeatCandidate === "ayah" || repeatCandidate === "surah" || repeatCandidate === "off"
        ? repeatCandidate
        : "off",
    fontSizeStep: clampFontSizeStep(
      Number(raw?.fontSizeStep ?? DEFAULT_QURAN_PREFERENCES.fontSizeStep),
    ),
    readingTheme:
      themeCandidate === "light" || themeCandidate === "dark" || themeCandidate === "system"
        ? themeCandidate
        : "system",
    lineSpacing:
      spacingCandidate === "compact" ||
      spacingCandidate === "comfortable" ||
      spacingCandidate === "spacious"
        ? spacingCandidate
        : "comfortable",
    readingWidth:
      widthCandidate === "focused" || widthCandidate === "wide" ? widthCandidate : "focused",
    showVerseMarkers:
      typeof raw?.showVerseMarkers === "boolean"
        ? raw.showVerseMarkers
        : DEFAULT_QURAN_PREFERENCES.showVerseMarkers,
    showTranslation:
      typeof raw?.showTranslation === "boolean"
        ? raw.showTranslation
        : DEFAULT_QURAN_PREFERENCES.showTranslation,
    translationId: isVerifiedTranslationId(translationCandidate)
      ? translationCandidate
      : DEFAULT_QURAN_PREFERENCES.translationId,
    bookmarks: normalizeBookmarks(raw?.bookmarks),
    readingHistory: normalizeReadingHistory(raw?.readingHistory),
    updatedAt:
      typeof raw?.updatedAt === "string" && raw.updatedAt.trim()
        ? raw.updatedAt.slice(0, 40)
        : new Date().toISOString(),
  };
}

export function readSessionQuranPrefs(): QuranPreferencesState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      window.sessionStorage.getItem(SESSION_PREFS_KEY) ??
      window.localStorage.getItem(SESSION_PREFS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<QuranPreferencesState>;
    return normalizeQuranPreferences(parsed);
  } catch {
    return null;
  }
}

export function writeSessionQuranPrefs(prefs: QuranPreferencesState): void {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(normalizeQuranPreferences(prefs));
  try {
    window.sessionStorage.setItem(SESSION_PREFS_KEY, serialized);
  } catch {
    /* ignore sessionStorage quota errors */
  }
  try {
    window.localStorage.setItem(SESSION_PREFS_KEY, serialized);
  } catch {
    /* ignore localStorage quota errors */
  }
}

export function clearSessionQuranPrefs(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SESSION_PREFS_KEY);
    window.localStorage.removeItem(SESSION_PREFS_KEY);
  } catch {
    /* ignore storage removal errors */
  }
}

export function isTrustedQuranAudioUrl(
  rawUrl: string | undefined | null,
  reciterId?: number,
): boolean {
  if (!rawUrl || typeof rawUrl !== "string") return false;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return false;
    const isMp3Quran =
      parsed.hostname === "mp3quran.net" || parsed.hostname.endsWith(".mp3quran.net");
    const allowedHosts = new Set([
      "download.quranicaudio.com",
      "verses.quran.com",
      "cdn.islamic.network",
    ]);
    if (!allowedHosts.has(parsed.hostname) && !isMp3Quran) return false;
    if (reciterId !== undefined) {
      const reciter = VERIFIED_QURAN_RECITERS.find((r) => r.id === reciterId);
      if (reciter && reciter.expectedPathHints.length > 0) {
        const lowerPath = parsed.pathname.toLowerCase();
        return reciter.expectedPathHints.some((hint) => lowerPath.includes(hint.toLowerCase()));
      }
    }
    return true;
  } catch {
    return false;
  }
}

interface QuranComChaptersResponse {
  chapters?: Array<{
    id: number;
    revelation_place?: string;
    name_simple?: string;
    name_arabic?: string;
    verses_count?: number;
    pages?: [number, number];
    translated_name?: { name?: string };
  }>;
}

interface AlQuranSurahListResponse {
  data?: Array<{
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
  }>;
}

interface QuranComJuzsResponse {
  juzs?: Array<{
    juz_number?: number;
    verses_count?: number;
    verse_mapping?: Record<string, string>;
  }>;
}

export async function fetchQuranSurahs(lang: string): Promise<QuranSurah[]> {
  const apiLang = lang === "ar" ? "ar" : "en";
  const cached = surahsCache.get(apiLang);
  if (cached) return cached;

  try {
    const res = await fetch(`https://api.quran.com/api/v4/chapters?language=${apiLang}`);
    if (res.ok) {
      const json = (await res.json()) as QuranComChaptersResponse;
      if (Array.isArray(json.chapters) && json.chapters.length === 114) {
        const mapped: QuranSurah[] = json.chapters.map((ch) => ({
          id: ch.id,
          nameArabic: ch.name_arabic ?? "",
          nameSimple: ch.name_simple ?? `Surah ${ch.id}`,
          translatedName: ch.translated_name?.name ?? ch.name_simple ?? `Surah ${ch.id}`,
          versesCount: Number(ch.verses_count ?? 0),
          revelationPlace: ch.revelation_place === "madinah" ? "madinah" : "makkah",
          ...(Array.isArray(ch.pages) && ch.pages.length === 2
            ? { pages: [Number(ch.pages[0]), Number(ch.pages[1])] as [number, number] }
            : {}),
        }));
        surahsCache.set(apiLang, mapped);
        return mapped;
      }
    }
  } catch {
    /* fallback below */
  }

  try {
    const res = await fetch("https://api.alquran.cloud/v1/surah");
    if (!res.ok) {
      throw new QuranNetworkError(`Failed to load surah catalog (${res.status}).`);
    }
    const json = (await res.json()) as AlQuranSurahListResponse;
    if (!Array.isArray(json.data) || json.data.length === 0) {
      throw new QuranNetworkError("Quran surah catalog response was empty.");
    }
    const mapped: QuranSurah[] = json.data.map((ch) => ({
      id: ch.number,
      nameArabic: ch.name,
      nameSimple: ch.englishName,
      translatedName: apiLang === "ar" ? ch.name : ch.englishNameTranslation,
      versesCount: ch.numberOfAyahs,
      revelationPlace: ch.revelationType.toLowerCase() === "medinan" ? "madinah" : "makkah",
    }));
    surahsCache.set(apiLang, mapped);
    return mapped;
  } catch (err) {
    if (err instanceof QuranNetworkError) throw err;
    throw new QuranNetworkError("Unable to reach Quran catalog service. Check your connection.");
  }
}

export async function fetchQuranJuzs(): Promise<QuranJuz[]> {
  if (juzsCache) return juzsCache;
  try {
    const res = await fetch("https://api.quran.com/api/v4/juzs");
    if (res.ok) {
      const json = (await res.json()) as QuranComJuzsResponse;
      if (Array.isArray(json.juzs) && json.juzs.length >= 30) {
        const uniq = new Map<number, QuranJuz>();
        for (const item of json.juzs) {
          const num = Number(item.juz_number);
          if (!Number.isFinite(num) || num < 1 || num > 30 || uniq.has(num)) continue;
          const entries = Object.entries(item.verse_mapping ?? {})
            .map(([surahKey, range]) => {
              const parts = String(range).split("-").map(Number);
              return {
                surahId: Number(surahKey),
                startAyah: Number(parts[0] ?? 1),
                endAyah: Number(parts[1] ?? parts[0] ?? 1),
              };
            })
            .filter((e) => Number.isFinite(e.surahId))
            .sort((a, b) => a.surahId - b.surahId);
          const first = entries[0];
          const last = entries[entries.length - 1];
          if (first && last) {
            uniq.set(num, {
              juzNumber: num,
              versesCount: Number(item.verses_count ?? 0),
              startSurah: first.surahId,
              startAyah: first.startAyah,
              endSurah: last.surahId,
              endAyah: last.endAyah,
            });
          }
        }
        if (uniq.size === 30) {
          const ordered = [...uniq.values()].sort((a, b) => a.juzNumber - b.juzNumber);
          juzsCache = ordered;
          return ordered;
        }
      }
    }
  } catch {
    /* fall back to verified built-in 30 Juz index */
  }
  return [...VERIFIED_JUZ_INDEX];
}

interface QuranComByChapterResponse {
  verses?: Array<{
    id: number;
    verse_number?: number;
    verse_key: string;
    text_uthmani: string;
    page_number?: number;
    juz_number?: number;
    translations?: Array<{
      id?: number;
      resource_id?: number;
      text?: string;
    }>;
  }>;
  pagination?: {
    next_page?: number | null;
    total_pages?: number;
  };
}

interface QuranComUthmaniResponse {
  verses?: Array<{
    id: number;
    verse_key: string;
    text_uthmani: string;
  }>;
}

interface AlQuranUthmaniResponse {
  data?: {
    ayahs?: Array<{
      number: number;
      numberInSurah: number;
      text: string;
      page?: number;
      juz?: number;
    }>;
  };
}

export async function fetchSurahUthmaniVerses(
  surahId: number,
  options?: { translationId?: number | null },
): Promise<QuranVerse[]> {
  const safeId = clampSurahNumber(surahId);
  const validTranslationId =
    options?.translationId && isVerifiedTranslationId(options.translationId)
      ? options.translationId
      : null;
  const cacheKey = `${safeId}:${validTranslationId ?? "none"}`;
  const cached = versesCache.get(cacheKey);
  if (cached) return cached;

  // 1. Primary: Quran.com v4 /verses/by_chapter (returns exact text_uthmani, page_number, juz_number, & optional verified translation)
  try {
    const collected: QuranVerse[] = [];
    let page = 1;
    let hasMore = true;
    while (hasMore && page <= 5) {
      const params = new URLSearchParams({
        words: "false",
        fields: "text_uthmani,page_number,juz_number",
        per_page: "300",
        page: String(page),
      });
      if (validTranslationId) {
        params.set("translations", String(validTranslationId));
      }
      const res = await fetch(
        `https://api.quran.com/api/v4/verses/by_chapter/${safeId}?${params.toString()}`,
      );
      if (!res.ok) {
        break;
      }
      const json = (await res.json()) as QuranComByChapterResponse;
      if (!Array.isArray(json.verses) || json.verses.length === 0) {
        break;
      }
      for (let idx = 0; idx < json.verses.length; idx++) {
        const v = json.verses[idx]!;
        const parsedVerseNum = Number(v.verse_number ?? v.verse_key.split(":")[1] ?? idx + 1);
        const rawTranslation = v.translations?.[0]?.text;
        collected.push({
          id: v.id,
          verseKey: v.verse_key,
          verseNumber: Number.isFinite(parsedVerseNum) ? parsedVerseNum : idx + 1,
          // Preserve exact original Arabic Uthmani Quranic text without modification.
          textUthmani: v.text_uthmani.trim(),
          ...(typeof v.page_number === "number" ? { pageNumber: v.page_number } : {}),
          ...(typeof v.juz_number === "number" ? { juzNumber: v.juz_number } : {}),
          ...(typeof rawTranslation === "string"
            ? { translationText: stripTranslationMarkup(rawTranslation) }
            : {}),
        });
      }
      const nextPage = json.pagination?.next_page;
      if (typeof nextPage === "number" && nextPage > page) {
        page = nextPage;
      } else {
        hasMore = false;
      }
    }
    if (collected.length > 0) {
      versesCache.set(cacheKey, collected);
      return collected;
    }
  } catch {
    /* fallback below */
  }

  // 2. Secondary: Quran.com v4 /quran/verses/uthmani
  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${safeId}`,
    );
    if (res.ok) {
      const json = (await res.json()) as QuranComUthmaniResponse;
      if (Array.isArray(json.verses) && json.verses.length > 0) {
        const mapped: QuranVerse[] = json.verses.map((v, idx) => {
          const parsedVerseNum = Number(v.verse_key.split(":")[1] ?? idx + 1);
          return {
            id: v.id,
            verseKey: v.verse_key,
            verseNumber: Number.isFinite(parsedVerseNum) ? parsedVerseNum : idx + 1,
            textUthmani: v.text_uthmani,
          };
        });
        versesCache.set(cacheKey, mapped);
        return mapped;
      }
    }
  } catch {
    /* fallback below */
  }

  // 3. Tertiary verbatim fallback: AlQuran Cloud Uthmani script
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${safeId}/quran-uthmani`);
    if (!res.ok) {
      throw new QuranNetworkError(`Failed to load Surah ${safeId} verses (${res.status}).`);
    }
    const json = (await res.json()) as AlQuranUthmaniResponse;
    const ayahs = json.data?.ayahs;
    if (!Array.isArray(ayahs) || ayahs.length === 0) {
      throw new QuranNetworkError(`Surah ${safeId} verse text was empty.`);
    }
    const mapped: QuranVerse[] = ayahs.map((a) => ({
      id: a.number,
      verseKey: `${safeId}:${a.numberInSurah}`,
      verseNumber: a.numberInSurah,
      textUthmani: a.text,
      ...(typeof a.page === "number" ? { pageNumber: a.page } : {}),
      ...(typeof a.juz === "number" ? { juzNumber: a.juz } : {}),
    }));
    versesCache.set(cacheKey, mapped);
    return mapped;
  } catch (err) {
    if (err instanceof QuranNetworkError) throw err;
    throw new QuranNetworkError("Unable to load authentic Quran text. Please retry.");
  }
}

interface QuranComChapterAudioResponse {
  audio_file?: {
    chapter_id?: number;
    file_size?: number;
    format?: string;
    audio_url?: string;
    timestamps?: Array<{
      verse_key?: string;
      timestamp_from?: number;
      timestamp_to?: number;
      duration?: number;
    }>;
  };
}

export async function fetchSurahAudio(
  reciterId: number,
  surahId: number,
): Promise<QuranAudioResult> {
  if (!isVerifiedReciterId(reciterId)) {
    throw new QuranAudioUnavailableError(
      "Selected reciter is not in the verified reciter catalog.",
    );
  }
  const safeSurah = clampSurahNumber(surahId);

  let res: Response;
  try {
    res = await fetch(
      `https://api.quran.com/api/v4/chapter_recitations/${reciterId}/${safeSurah}?segments=true`,
    );
  } catch {
    throw new QuranNetworkError("Network error while reaching recitation audio service.");
  }

  if (res.status === 404) {
    throw new QuranAudioUnavailableError(
      "This recitation recording is not available for the selected surah.",
    );
  }
  if (!res.ok) {
    throw new QuranNetworkError(`Recitation audio metadata returned status ${res.status}.`);
  }

  const json = (await res.json()) as QuranComChapterAudioResponse;
  const audioFile = json.audio_file;
  const audioUrl = audioFile?.audio_url;

  if (!audioUrl || !isTrustedQuranAudioUrl(audioUrl, reciterId)) {
    throw new QuranAudioUnavailableError(
      "Authentic audio stream could not be verified for this reciter and surah.",
    );
  }

  const timestamps: QuranTimestamp[] = Array.isArray(audioFile.timestamps)
    ? audioFile.timestamps
        .map((ts, idx) => {
          const key = typeof ts.verse_key === "string" ? ts.verse_key : `${safeSurah}:${idx + 1}`;
          const verseNum = Number(key.split(":")[1] ?? idx + 1);
          const from = Number(ts.timestamp_from ?? 0);
          const to = Number(ts.timestamp_to ?? from);
          return {
            verseKey: key,
            verseNumber: Number.isFinite(verseNum) ? verseNum : idx + 1,
            timestampFromMs: Number.isFinite(from) ? from : 0,
            timestampToMs: Number.isFinite(to) ? to : from,
            durationMs: Number(ts.duration ?? Math.max(0, to - from)),
          };
        })
        .sort((a, b) => a.verseNumber - b.verseNumber)
    : [];

  return {
    surahId: safeSurah,
    reciterId,
    audioUrl,
    format: audioFile.format ?? "mp3",
    fileSizeBytes: typeof audioFile.file_size === "number" ? audioFile.file_size : null,
    timestamps,
    sourceLabel: QURAN_TEXT_ATTRIBUTION.audioProvider,
    sourceUrl: QURAN_TEXT_ATTRIBUTION.audioUrl,
  };
}

export const FAMOUS_AYAH_SURAH_MAP: Record<string, number[]> = {
  "ويسألونك عن الجبال": [20], // Taha 20:105
  الجبال: [20, 56, 78, 79, 81],
  "وكان الله غفورا رحيما": [4, 25, 33, 48],
  "غفور رحيم": [4, 25, 33],
  "وجاءت سكرة الموت بالحق": [50], // Qaf 50:19
  "سكرة الموت": [50],
  "الحمد لله": [1, 6, 18, 34, 35],
  "الرحمن الرحيم": [1],
  "مالك يوم الدين": [1],
  "اية الكرسي": [2],
  "الله لا إله إلا هو": [2],
  "قل هو الله أحد": [112],
  "قل أعوذ برب الفلق": [113],
  "قل أعوذ برب الناس": [114],
  "تبارك الذي بيده الملك": [67],
  الملك: [67],
  يس: [36],
  "والقرآن الحكيم": [36],
  "فبأي آلاء ربكما تكذبان": [55],
  الرحمن: [55],
  "إنا فتحنا لك فتحا مبينا": [48],
  الفتح: [48],
  "الشمس وضحاها": [91],
  والضحى: [93],
  "ألم نشرح لك": [94],
  "إنا أنزلناه في ليلة القدر": [97],
  القدر: [97],
  البقرة: [2],
  الكهف: [18],
  الواقعة: [56],
};

export function matchesSurahOrAyah(
  surahId: number,
  surahNameAr: string,
  surahNameEn: string,
  rawQuery: string,
): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  if (String(surahId) === q) return true;
  if (surahNameEn.toLowerCase().includes(q)) return true;
  if (surahNameAr.includes(rawQuery.trim())) return true;

  for (const [excerpt, surahIds] of Object.entries(FAMOUS_AYAH_SURAH_MAP)) {
    if (excerpt.toLowerCase().includes(q) || q.includes(excerpt.toLowerCase())) {
      if (surahIds.includes(surahId)) {
        return true;
      }
    }
  }
  return false;
}
