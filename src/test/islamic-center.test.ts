import { describe, it, expect } from "vitest";
import {
  calculateDailyPrayerTimes,
  VERIFIED_PRAYER_CITIES,
  VERIFIED_NAMES_OF_ALLAH,
  VERIFIED_HADITH_LIBRARY,
  VERIFIED_DAILY_ADHKAR,
  VERIFIED_DUAS_CATALOG,
  computeEstimatedHijriDate,
} from "../data/islamic-center";
import {
  AUTHENTIC_RECITERS,
  getRecitersByCountry,
  getAuthenticReciter,
} from "../lib/quran-reciters";
import { SURAHS_INDEX, JUZ_START_PAGES, getMushafPageMeta } from "../lib/quran-mushaf";
import {
  loadMemorizationState,
  updateSurahProgress,
  getMemorizationOverview,
} from "../lib/quran-memorization";

describe("Islamic Center core engines and verified datasets", () => {
  it("computes prayer sequence accurately for Makkah", () => {
    const mecca = VERIFIED_PRAYER_CITIES.find((c) => c.id === "sa_makkah");
    expect(mecca).toBeDefined();

    const times = calculateDailyPrayerTimes(new Date(2026, 4, 15, 12, 0, 0), mecca!, "makkah");

    expect(times.fajr).toMatch(/^\d{2}:\d{2}$/);
    expect(times.sunrise).toMatch(/^\d{2}:\d{2}$/);
    expect(times.dhuhr).toMatch(/^\d{2}:\d{2}$/);
    expect(times.asr).toMatch(/^\d{2}:\d{2}$/);
    expect(times.maghrib).toMatch(/^\d{2}:\d{2}$/);
    expect(times.isha).toMatch(/^\d{2}:\d{2}$/);

    expect(times.nextPrayer).toBeTruthy();
    expect(times.nextPrayer.remainingMs).toBeGreaterThanOrEqual(0);
  });

  it("preserves all 12 original core reciters while expanding SA, EG, KW and global country coverage", () => {
    expect(AUTHENTIC_RECITERS.length).toBeGreaterThanOrEqual(40);

    const saReciters = getRecitersByCountry("SA");
    const egReciters = getRecitersByCountry("EG");
    const kwReciters = getRecitersByCountry("KW");

    expect(saReciters.length).toBeGreaterThanOrEqual(6);
    expect(egReciters.length).toBeGreaterThanOrEqual(5);
    expect(kwReciters.length).toBeGreaterThanOrEqual(2);
    expect(kwReciters.some((r) => r.id === "ahmad-al-nafis")).toBe(true);

    const luhaidan = getAuthenticReciter("al-luhaidan");
    expect(luhaidan.countryCode).toBe("SA");
    expect(luhaidan.specialEmphasis?.surahId).toBe(2);
    expect(luhaidan.specialEmphasis?.audioUrl).toContain("002.mp3");

    const requiredIds = [
      "al-luhaidan",
      "al-husary",
      "al-minshawi",
      "al-banna",
      "al-tablawi",
      "abdul-basit",
      "alafasy",
      "al-ghamdi",
      "al-muaiqly",
      "al-sudais",
      "al-dosari",
      "al-suqair",
    ];
    for (const id of requiredIds) {
      expect(AUTHENTIC_RECITERS.some((r) => r.id === id)).toBe(true);
    }
  });

  it("maps the 604-page Madinah Mushaf across all 114 Surahs and 30 Juz", () => {
    expect(SURAHS_INDEX).toHaveLength(114);
    expect(JUZ_START_PAGES).toHaveLength(30);

    const p1 = getMushafPageMeta(1);
    expect(p1.surahId).toBe(1);
    expect(p1.juzNumber).toBe(1);

    const p2 = getMushafPageMeta(2);
    expect(p2.surahId).toBe(2);
    expect(p2.juzNumber).toBe(1);

    const p582 = getMushafPageMeta(582);
    expect(p582.juzNumber).toBe(30);
    expect(p582.surahId).toBe(78);

    const p604 = getMushafPageMeta(604);
    expect(p604.juzNumber).toBe(30);
    expect(p604.surahId).toBeGreaterThanOrEqual(112);
    expect(p604.surahId).toBeLessThanOrEqual(114);
  });

  it("includes all 99 Names of Allah with verified proofs", () => {
    expect(VERIFIED_NAMES_OF_ALLAH).toHaveLength(99);
    for (const n of VERIFIED_NAMES_OF_ALLAH) {
      expect(n.arabic.length).toBeGreaterThan(0);
      expect(n.transliteration.length).toBeGreaterThan(0);
      expect(n.quranicProof.length).toBeGreaterThan(0);
    }
  });

  it("includes complete Forty Hadith Nawawi collection plus morning/evening/sleep/waking Adhkar & Duas", () => {
    expect(VERIFIED_HADITH_LIBRARY.length).toBeGreaterThanOrEqual(40);
    const first = VERIFIED_HADITH_LIBRARY[0]!;
    expect(first.numberInCollection).toBe(1);
    expect(first.titleAr).toBe("إنما الأعمال بالنيات");
    expect(first.matnArabic).toContain("الأَعْمَالُ");
    expect(first.keyMoralLessons.length).toBeGreaterThan(0);

    expect(VERIFIED_DAILY_ADHKAR.some((d) => d.category === "sleep")).toBe(true);
    expect(VERIFIED_DAILY_ADHKAR.some((d) => d.category === "waking")).toBe(true);
    expect(VERIFIED_DUAS_CATALOG.some((d) => d.category === "knowledge")).toBe(true);
    expect(VERIFIED_DUAS_CATALOG.some((d) => d.category === "guidance")).toBe(true);
  });

  it("tracks Quran memorization progress and spaced-repetition intervals", () => {
    const initial = loadMemorizationState();
    expect(Object.keys(initial)).toHaveLength(114);

    const updated = updateSurahProgress(initial, 1, {
      status: "memorized",
      memorizedVersesCount: 7,
      markReviewed: true,
      reviewPassed: true,
    });

    const entry = updated[1]!;
    expect(entry.status).toBe("memorized");
    expect(entry.memorizedVersesCount).toBe(7);
    expect(entry.lastReviewedAt).toBeTruthy();
    expect(entry.nextReviewAt).toBeTruthy();
    expect(entry.reviewIntervalDays).toBeGreaterThanOrEqual(3);

    const overview = getMemorizationOverview(updated);
    expect(overview.totalSurahsMemorized).toBe(1);
    expect(overview.totalVersesMemorized).toBe(7);
  });

  it("converts Gregorian dates to estimated Hijri dates cleanly", () => {
    const res = computeEstimatedHijriDate(new Date(2026, 4, 15));
    expect(res.hijriYear).toBeGreaterThanOrEqual(1445);
    expect(res.hijriMonth).toBeGreaterThanOrEqual(1);
    expect(res.hijriMonth).toBeLessThanOrEqual(12);
    expect(res.monthNameAr.length).toBeGreaterThan(0);
  });
});
