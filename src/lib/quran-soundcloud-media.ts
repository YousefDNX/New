import { padSurahNumber } from "./quran-reciters";

export type QuranMediaKind = "soundcloud" | "mp3" | "m4a";

export interface QuranMediaTrackItem {
  id: string;
  kind: QuranMediaKind;
  titleAr: string;
  titleEn: string;
  reciterAr: string;
  reciterEn: string;
  surahId?: number | undefined; // 1..114 when tied to a specific surah (or undefined for full collection/channel)
  url: string;
  embedUrl?: string | undefined;
  sourceLabel: string;
  isUserAdded?: boolean | undefined;
  isLocalFile?: boolean | undefined;
  createdAt?: string | undefined;
}

const SOUNDCLOUD_STORAGE_KEY = "btc_quran_soundcloud_user_tracks_v1";

export function isValidSoundCloudUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return (
      host === "soundcloud.com" ||
      host === "www.soundcloud.com" ||
      host === "m.soundcloud.com" ||
      host === "on.soundcloud.com" ||
      host === "snd.sc"
    );
  } catch {
    return false;
  }
}

export function buildSoundCloudEmbedUrl(soundcloudUrl: string, autoPlay = false): string | null {
  if (!isValidSoundCloudUrl(soundcloudUrl)) return null;
  const encoded = encodeURIComponent(soundcloudUrl.trim());
  return `https://w.soundcloud.com/player/?url=${encoded}&color=%23047857&auto_play=${
    autoPlay ? "true" : "false"
  }&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false`;
}

export function detectDirectAudioFormat(urlOrName: string): "mp3" | "m4a" {
  const clean = urlOrName.split("?")[0]?.split("#")[0]?.toLowerCase() ?? "";
  if (clean.endsWith(".m4a") || clean.endsWith(".mp4") || clean.includes(".m4a")) {
    return "m4a";
  }
  return "mp3";
}

export function isValidDirectAudioUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "blob:";
  } catch {
    return false;
  }
}

export function getLuhaidanSurahMp3Url(
  surahId: number,
  edition: "mp3quran" | "archive_ib" | "archive_ltq" = "mp3quran",
): string {
  const safeId = Math.max(1, Math.min(114, Math.floor(surahId)));
  const padded = padSurahNumber(safeId);
  if (edition === "archive_ib") {
    return `https://archive.org/download/al_luhaidan/${padded}.mp3`;
  }
  if (edition === "archive_ltq") {
    return `https://archive.org/download/listen-to-quran.com_Mohammed-Al-Lohaidan/${padded}.mp3`;
  }
  return `https://server8.mp3quran.net/lhdan/${padded}.mp3`;
}

export const VERIFIED_SOUNDCLOUD_AND_ARCHIVE_TRACKS: readonly QuranMediaTrackItem[] = [
  {
    id: "sc-luhaidan-official-channel",
    kind: "soundcloud",
    titleAr: "الحساب الرسمي على ساوند كلاود — الشيخ د. محمد اللحيدان (جميع التلاوات)",
    titleEn: "Official SoundCloud Channel — Sheikh Dr. Mohammed Al-Luhaidan",
    reciterAr: "الشيخ د. محمد بن إبراهيم اللحيدان",
    reciterEn: "Sheikh Dr. Mohammed Al-Luhaidan",
    url: "https://soundcloud.com/muhammad_alluhaidan",
    embedUrl: buildSoundCloudEmbedUrl("https://soundcloud.com/muhammad_alluhaidan") ?? undefined,
    sourceLabel: "SoundCloud Official Profile",
  },
  {
    id: "sc-luhaidan-yusuf-1438",
    kind: "soundcloud",
    titleAr: "سورة يوسف — رمضان ١٤٣٨هـ (ساوند كلاود)",
    titleEn: "Surah Yusuf — Ramadan 1438H (SoundCloud)",
    reciterAr: "الشيخ محمد اللحيدان",
    reciterEn: "Sheikh Mohammed Al-Luhaidan",
    surahId: 12,
    url: "https://soundcloud.com/muhammad_alluhaidan/suratyousef1438",
    embedUrl:
      buildSoundCloudEmbedUrl("https://soundcloud.com/muhammad_alluhaidan/suratyousef1438") ??
      undefined,
    sourceLabel: "SoundCloud Track",
  },
  {
    id: "sc-luhaidan-yunus-1438",
    kind: "soundcloud",
    titleAr: "سورة يونس والأعلى — رمضان ١٤٣٨هـ (ساوند كلاود)",
    titleEn: "Surah Yunus & Al-A'la — 1438H (SoundCloud)",
    reciterAr: "الشيخ محمد اللحيدان",
    reciterEn: "Sheikh Mohammed Al-Luhaidan",
    surahId: 10,
    url: "https://soundcloud.com/muhammad_alluhaidan/surahyunus1438",
    embedUrl:
      buildSoundCloudEmbedUrl("https://soundcloud.com/muhammad_alluhaidan/surahyunus1438") ??
      undefined,
    sourceLabel: "SoundCloud Track",
  },
  {
    id: "mp3-luhaidan-furqan-mp3quran",
    kind: "mp3",
    titleAr: "سورة الفرقان كاملة (١٦:٢٠ دقيقة — MP3Quran ١٢٨ kbps)",
    titleEn: "Surah Al-Furqan Complete (MP3Quran · 128 kbps MP3)",
    reciterAr: "الشيخ محمد اللحيدان",
    reciterEn: "Sheikh Mohammed Al-Luhaidan",
    surahId: 25,
    url: getLuhaidanSurahMp3Url(25, "mp3quran"),
    sourceLabel: "MP3Quran Studio MP3",
  },
  {
    id: "mp3-luhaidan-furqan-archive-ib",
    kind: "mp3",
    titleAr: "سورة الفرقان كاملة — أرشيف التلاوات المستقل (Internet Archive MP3)",
    titleEn: "Surah Al-Furqan Complete — Islamic Bulletin Archive (MP3)",
    reciterAr: "الشيخ محمد اللحيدان",
    reciterEn: "Sheikh Mohammed Al-Luhaidan",
    surahId: 25,
    url: getLuhaidanSurahMp3Url(25, "archive_ib"),
    sourceLabel: "Archive.org MP3",
  },
  {
    id: "mp3-luhaidan-furqan-qa",
    kind: "mp3",
    titleAr: "سورة الفرقان — تلاوة المحراب الخاشعة (٢٠:٢٤ دقيقة · ٢٥:٦٨–٧٠)",
    titleEn: "Surah Al-Furqan — Prayer Archive (20:24 · v. 25:68–70)",
    reciterAr: "الشيخ محمد اللحيدان",
    reciterEn: "Sheikh Mohammed Al-Luhaidan",
    surahId: 25,
    url: "https://download.quranicaudio.com/quran/muhammad_alhaidan/025.mp3",
    sourceLabel: "QuranicAudio MP3",
  },
  {
    id: "m4a-quran-baqarah-aac-1",
    kind: "m4a",
    titleAr: "سورة البقرة — تسجيل صوتي عالي النقاء بصيغة M4A",
    titleEn: "Surah Al-Baqarah — High-Efficiency AAC Recitation (M4A)",
    reciterAr: "مكتبة الأرشيف القرآني (M4A)",
    reciterEn: "Verified Quran Archive (M4A)",
    surahId: 2,
    url: "https://archive.org/download/14_20260303_202603/1.m4a",
    sourceLabel: "Archive.org M4A",
  },
  {
    id: "m4a-quran-baqarah-aac-2",
    kind: "m4a",
    titleAr: "سورة البقرة (الإصدار الثاني) — صيغة M4A",
    titleEn: "Surah Al-Baqarah — Recording #2 (M4A)",
    reciterAr: "مكتبة الأرشيف القرآني (M4A)",
    reciterEn: "Verified Quran Archive (M4A)",
    surahId: 2,
    url: "https://archive.org/download/14_20260303_202603/2.m4a",
    sourceLabel: "Archive.org M4A",
  },
];

export function loadUserSoundCloudAndMediaTracks(): QuranMediaTrackItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SOUNDCLOUD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QuranMediaTrackItem[];
    if (!Array.isArray(parsed)) return [];
    // Never restore ephemeral blob: URLs across reloads since browser revokes them on navigation
    return parsed.filter(
      (item) =>
        item &&
        typeof item.url === "string" &&
        !item.url.startsWith("blob:") &&
        (item.kind === "soundcloud"
          ? isValidSoundCloudUrl(item.url)
          : isValidDirectAudioUrl(item.url)),
    );
  } catch {
    return [];
  }
}

export function saveUserSoundCloudAndMediaTracks(tracks: QuranMediaTrackItem[]): void {
  if (typeof window === "undefined") return;
  try {
    const persistable = tracks.filter((t) => !t.isLocalFile && !t.url.startsWith("blob:"));
    window.localStorage.setItem(SOUNDCLOUD_STORAGE_KEY, JSON.stringify(persistable));
  } catch {
    // Ignore storage quota errors
  }
}
