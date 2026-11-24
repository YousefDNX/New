/**
 * Verified Authentic Quran Reciters Catalog (Backwards-Compatible Entry & Global Export)
 *
 * - Preserves all original 12 core reciters (SA, EG, KW) & Sheikh Al-Luhaidan Surah Al-Baqarah highlight.
 * - Expands into the Verified Global Country-Based Reciters Directory (23 countries, 40+ reciters, multi-recording support).
 * - Adds Sheikh Ahmed Al-Nafis (أحمد النفيس) verified under Kuwait (MP3Quran ID 259, 114 Surahs).
 * - ZERO AI-generated Quran audio. Strictly original 1.0x recording speed.
 */

import {
  GLOBAL_COUNTRIES_META,
  GLOBAL_RECITERS_DIRECTORY,
  getGlobalReciter,
  getGlobalRecitersByCountry,
  padGlobalSurahNumber,
  type GlobalCountryCode,
  type VerifiedReciterProfile,
} from "./quran-reciters-directory";

export type ReciterCountryCode = GlobalCountryCode;
export type ReciterCountry = (typeof GLOBAL_COUNTRIES_META)[number];
export type AuthenticReciter = VerifiedReciterProfile;

export const CORE_ORIGINAL_RECITER_IDS = [
  "al-luhaidan",
  "al-sudais",
  "al-ghamdi",
  "al-muaiqly",
  "al-dosari",
  "al-suqair",
  "al-husary",
  "al-minshawi",
  "al-banna",
  "al-tablawi",
  "abdul-basit",
  "alafasy",
] as const;

export const QURAN_RECITER_COUNTRIES: readonly ReciterCountry[] = GLOBAL_COUNTRIES_META;
export const AUTHENTIC_RECITERS: readonly AuthenticReciter[] = GLOBAL_RECITERS_DIRECTORY;

export function getRecitersByCountry(countryCode: ReciterCountryCode): AuthenticReciter[] {
  return getGlobalRecitersByCountry(countryCode);
}

export function getAuthenticReciter(reciterId: string): AuthenticReciter {
  return getGlobalReciter(reciterId);
}

export function padSurahNumber(surahNumber: number): string {
  return padGlobalSurahNumber(surahNumber);
}

export function getReciterSurahUrl(
  reciter: AuthenticReciter,
  surahNumber: number,
  recordingId?: string,
): string {
  const padded = padSurahNumber(surahNumber);
  const selectedEdition =
    (recordingId ? reciter.recordings.find((r) => r.recordingId === recordingId) : undefined) ??
    reciter.recordings[0];
  const customUrl = selectedEdition?.customSurahUrls?.[surahNumber];
  if (customUrl && /^https:\/\//i.test(customUrl)) {
    return customUrl;
  }
  const ext = selectedEdition?.audioFormat === "m4a" ? "m4a" : "mp3";
  const rawBase = selectedEdition?.serverBaseUrl ?? reciter.serverBaseUrl;
  const base = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
  return `${base}${padded}.${ext}`;
}

export * from "./quran-reciters-directory";
