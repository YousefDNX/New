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
    id: "sc-luhaidan-taha-jibal-nabrah",
    kind: "mp3",
    titleAr: "النبرة اللحيدانية (العالية) — ﴿وَيَسْأَلُونَكَ عَنِ الْجِبَالِ﴾ (سورة طه · ٢٢:٢٥ د)",
    titleEn: "Al-Luhaidan High Signature — Wa Yas'alunaka 'Anil-Jibal (Surah Taha · 22:25)",
    reciterAr: "الشيخ د. محمد بن إبراهيم اللحيدان",
    reciterEn: "Sheikh Dr. Mohammed Al-Luhaidan",
    surahId: 20,
    url: "https://archive.org/download/al_luhaidan/020.mp3",
    sourceLabel: "أرشيف المحراب 320kbps · MP3",
  },
  {
    id: "sc-luhaidan-furqan-ghafoor-rahim",
    kind: "mp3",
    titleAr: "النبرة اللحيدانية (العالية) — ﴿وَكَانَ اللَّهُ غَفُورًا رَحِيمًا﴾ (سورة الفرقان · ٢٠:٢٤ د)",
    titleEn: "Al-Luhaidan High Signature — Wa Kana Allahu Ghafuran Rahima (Al-Furqan · 20:24)",
    reciterAr: "الشيخ محمد اللحيدان",
    reciterEn: "Sheikh Mohammed Al-Luhaidan",
    surahId: 25,
    url: "https://archive.org/download/al_luhaidan/025.mp3",
    sourceLabel: "أرشيف المحراب 320kbps · MP3",
  },
  {
    id: "sc-luhaidan-qaf-sakrat-al-mawt",
    kind: "mp3",
    titleAr: "النبرة اللحيدانية (العالية) — ﴿وَجَاءَتْ سَكْرَةُ الْمَوْتِ بِالْحَقِّ﴾ (سورة ق)",
    titleEn: "Al-Luhaidan High Signature — Wa Ja'at Sakratul-Mawti Bil-Haqq (Surah Qaf)",
    reciterAr: "الشيخ محمد اللحيدان",
    reciterEn: "Sheikh Mohammed Al-Luhaidan",
    surahId: 50,
    url: "https://archive.org/download/al_luhaidan/050.mp3",
    sourceLabel: "تلاوة المحراب الشهيرة 320kbps · MP3",
  },
  {
    id: "mp3-luhaidan-baqarah-current-beloved",
    kind: "mp3",
    titleAr: "سورة البقرة — التلاوة الأولى المحبوبة (١:٥٦:٤١ د · النبرة اللحيدانية)",
    titleEn: "Surah Al-Baqarah — First Beloved Archival Recording (1:56:41)",
    reciterAr: "الشيخ محمد اللحيدان",
    reciterEn: "Sheikh Mohammed Al-Luhaidan",
    surahId: 2,
    url: "https://archive.org/download/listen-to-quran.com_Mohammed-Al-Lohaidan/002.mp3",
    sourceLabel: "الأرشيف المستقل 64kbps · MP3",
  },
  {
    id: "mp3-luhaidan-baqarah-added",
    kind: "mp3",
    titleAr: "سورة البقرة — التسجيل الإضافي الكامل الموثق (١:٥٥:٣٠ د · النبرة اللحيدانية)",
    titleEn: "Surah Al-Baqarah — Added Verified Complete Recording (1:55:30)",
    reciterAr: "الشيخ محمد اللحيدان",
    reciterEn: "Sheikh Mohammed Al-Luhaidan",
    surahId: 2,
    url: "https://archive.org/download/MuhammadALLuhaidanSurahBaqarahComplete/Muhammad%20AL%20Luhaidan%20-%20Surah%20Baqarah%20Complete.mp3",
    sourceLabel: "تسجيل إضافي موثق 192kbps · MP3",
  },
  {
    id: "m4a-luhaidan-baqarah-calm",
    kind: "m4a",
    titleAr: "سورة البقرة — النبرة الخاشعة والهادئة (١:٥٣:٠١ د · M4A عالي النقاء)",
    titleEn: "Surah Al-Baqarah — Calm & Reverent Cadence (1:53:01 · M4A)",
    reciterAr: "الشيخ محمد اللحيدان",
    reciterEn: "Sheikh Mohammed Al-Luhaidan",
    surahId: 2,
    url: "https://archive.org/download/002_20261007/002.m4a",
    sourceLabel: "المصحف المرتل عالي النقاء · M4A",
  },
  {
    id: "m4a-luhaidan-taha-calm",
    kind: "m4a",
    titleAr: "سورة طه — النبرة الخاشعة والهادئة (٢٣:٢٧ د · M4A عالي النقاء)",
    titleEn: "Surah Taha — Calm & Reverent Cadence (23:27 · M4A)",
    reciterAr: "الشيخ محمد اللحيدان",
    reciterEn: "Sheikh Mohammed Al-Luhaidan",
    surahId: 20,
    url: "https://archive.org/download/002_20261007/020.m4a",
    sourceLabel: "المصحف المرتل عالي النقاء · M4A",
  },
  {
    id: "m4a-luhaidan-furqan-calm",
    kind: "m4a",
    titleAr: "سورة الفرقان — النبرة الخاشعة والهادئة (١٦:٢٠ د · M4A عالي النقاء)",
    titleEn: "Surah Al-Furqan — Calm & Reverent Cadence (16:20 · M4A)",
    reciterAr: "الشيخ محمد اللحيدان",
    reciterEn: "Sheikh Mohammed Al-Luhaidan",
    surahId: 25,
    url: "https://archive.org/download/002_20261007/025.m4a",
    sourceLabel: "المصحف المرتل عالي النقاء · M4A",
  },
  {
    id: "m4a-luhaidan-qaf-calm",
    kind: "m4a",
    titleAr: "سورة ق — النبرة الخاشعة والهادئة (٧:١٩ د · M4A عالي النقاء)",
    titleEn: "Surah Qaf — Calm & Reverent Cadence (7:19 · M4A)",
    reciterAr: "الشيخ محمد اللحيدان",
    reciterEn: "Sheikh Mohammed Al-Luhaidan",
    surahId: 50,
    url: "https://archive.org/download/002_20261007/050.m4a",
    sourceLabel: "المصحف المرتل عالي النقاء · M4A",
  },
  {
    id: "mp3-luhaidan-taha-qa",
    kind: "mp3",
    titleAr: "سورة طه — تلاوة المحراب ﴿وَيَسْأَلُونَكَ عَنِ الْجِبَالِ﴾ (QuranicAudio)",
    titleEn: "Surah Taha — Prayer Archive (22:25 · v. 20:105 Wa Yas'alunaka 'Anil-Jibal)",
    reciterAr: "الشيخ محمد اللحيدان",
    reciterEn: "Sheikh Mohammed Al-Luhaidan",
    surahId: 20,
    url: "https://download.quranicaudio.com/quran/muhammad_alhaidan/020.mp3",
    sourceLabel: "QuranicAudio Prayer MP3",
  },
  {
    id: "mp3-luhaidan-furqan-qa",
    kind: "mp3",
    titleAr: "سورة الفرقان — تلاوة المحراب الباكية (QuranicAudio)",
    titleEn: "Surah Al-Furqan — Prayer Archive (20:24 · v. 25:68–70)",
    reciterAr: "الشيخ محمد اللحيدان",
    reciterEn: "Sheikh Mohammed Al-Luhaidan",
    surahId: 25,
    url: "https://download.quranicaudio.com/quran/muhammad_alhaidan/025.mp3",
    sourceLabel: "QuranicAudio Prayer MP3",
  },
  {
    id: "mp3-luhaidan-furqan-mp3quran",
    kind: "mp3",
    titleAr: "سورة الفرقان كاملة — المصحف المرتل الهادئ (١٦:٢٠ د — MP3Quran)",
    titleEn: "Surah Al-Furqan Complete — Studio Murattal (MP3Quran · 128 kbps MP3)",
    reciterAr: "الشيخ محمد اللحيدان",
    reciterEn: "Sheikh Mohammed Al-Luhaidan",
    surahId: 25,
    url: getLuhaidanSurahMp3Url(25, "mp3quran"),
    sourceLabel: "MP3Quran Studio MP3",
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
