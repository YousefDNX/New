import React, { useEffect, useMemo, useRef, useState } from "react";
import { SURAHS_INDEX } from "@/lib/quran-mushaf";
import { useQuranAudio } from "@/contexts/QuranAudioContext";
import {
  VERIFIED_SOUNDCLOUD_AND_ARCHIVE_TRACKS,
  buildSoundCloudEmbedUrl,
  detectDirectAudioFormat,
  getLuhaidanSurahMp3Url,
  isValidDirectAudioUrl,
  isValidSoundCloudUrl,
  loadUserSoundCloudAndMediaTracks,
  saveUserSoundCloudAndMediaTracks,
  type QuranMediaKind,
  type QuranMediaTrackItem,
} from "@/lib/quran-soundcloud-media";
import {
  Disc3,
  FileAudio,
  Headphones,
  Link2,
  Music2,
  Play,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";

interface SoundCloudAudioHubProps {
  isAr: boolean;
}

const FEATURED_SURAH_SHORTCUTS = [1, 2, 12, 18, 25, 36, 55, 67] as const;

export const SoundCloudAudioHub: React.FC<SoundCloudAudioHubProps> = ({ isAr }) => {
  const audioCtx = useQuranAudio();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const createdBlobUrlsRef = useRef<string[]>([]);

  const [userTracks, setUserTracks] = useState<QuranMediaTrackItem[]>(() =>
    loadUserSoundCloudAndMediaTracks(),
  );
  const [selectedArchiveEdition, setSelectedArchiveEdition] = useState<
    "mp3quran" | "archive_ib" | "archive_ltq"
  >("mp3quran");
  const [selectedSurahId, setSelectedSurahId] = useState<number>(25); // Default to Surah Al-Furqan (25)

  const [activeSoundCloudTrackId, setActiveSoundCloudTrackId] = useState<string>(
    "sc-luhaidan-official-channel",
  );
  const [soundCloudAutoPlay, setSoundCloudAutoPlay] = useState(false);
  const [kindFilter, setKindFilter] = useState<"all" | QuranMediaKind>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Add URL form state
  const [urlInput, setUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<string | null>(null);

  useEffect(() => {
    saveUserSoundCloudAndMediaTracks(userTracks);
  }, [userTracks]);

  // Revoke any object URLs on unmount
  useEffect(() => {
    const urls = createdBlobUrlsRef.current;
    return () => {
      for (const u of urls) {
        try {
          URL.revokeObjectURL(u);
        } catch {
          // Non-fatal
        }
      }
    };
  }, []);

  const allMediaTracks = useMemo(
    () => [...userTracks, ...VERIFIED_SOUNDCLOUD_AND_ARCHIVE_TRACKS],
    [userTracks],
  );

  const soundCloudTracks = useMemo(
    () => allMediaTracks.filter((item) => item.kind === "soundcloud" && item.embedUrl),
    [allMediaTracks],
  );

  const activeSoundCloudTrack = useMemo(
    () =>
      soundCloudTracks.find((t) => t.id === activeSoundCloudTrackId) ??
      soundCloudTracks[0] ??
      VERIFIED_SOUNDCLOUD_AND_ARCHIVE_TRACKS[0]!,
    [soundCloudTracks, activeSoundCloudTrackId],
  );

  const filteredMediaTracks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allMediaTracks.filter((item) => {
      if (kindFilter !== "all" && item.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        item.titleAr.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.reciterAr.toLowerCase().includes(q) ||
        item.reciterEn.toLowerCase().includes(q) ||
        item.sourceLabel.toLowerCase().includes(q)
      );
    });
  }, [allMediaTracks, kindFilter, searchQuery]);

  const currentSurahMeta = useMemo(
    () => SURAHS_INDEX.find((s) => s.id === selectedSurahId) ?? SURAHS_INDEX[24]!,
    [selectedSurahId],
  );

  const activeSoundCloudEmbedUrl = useMemo(
    () => buildSoundCloudEmbedUrl(activeSoundCloudTrack.url, soundCloudAutoPlay),
    [activeSoundCloudTrack.url, soundCloudAutoPlay],
  );

  const playLuhaidanSurah = (
    surahId: number,
    edition: "mp3quran" | "archive_ib" | "archive_ltq" = selectedArchiveEdition,
  ) => {
    const sMeta = SURAHS_INDEX.find((s) => s.id === surahId) ?? SURAHS_INDEX[0]!;
    const url = getLuhaidanSurahMp3Url(surahId, edition);
    const editionLabel =
      edition === "mp3quran"
        ? "MP3Quran Studio (128kbps)"
        : edition === "archive_ib"
          ? "Archive.org (Al-Luhaidan)"
          : "Archive.org (Listen-to-Quran)";

    setSoundCloudAutoPlay(false);
    setSelectedSurahId(surahId);
    audioCtx.playCustomAudio(
      {
        id: `mp3-luhaidan-${edition}-${surahId}`,
        titleAr: `سورة ${sMeta.nameAr} (${sMeta.id}) — الشيخ محمد اللحيدان`,
        titleEn: `Surah ${sMeta.nameEn} (${sMeta.id}) — Sheikh Al-Luhaidan`,
        reciterNameAr: "الشيخ محمد اللحيدان",
        reciterNameEn: "Sheikh Mohammed Al-Luhaidan",
        format: "mp3",
        audioUrl: url,
        surahId: sMeta.id,
        sourceLabel: editionLabel,
      },
      true,
    );
  };

  const handlePlayTrackItem = (item: QuranMediaTrackItem) => {
    if (item.kind === "soundcloud") {
      if (audioCtx.isPlaying) {
        audioCtx.pause();
      }
      setActiveSoundCloudTrackId(item.id);
      setSoundCloudAutoPlay(true);
      return;
    }
    setSoundCloudAutoPlay(false);
    audioCtx.playCustomAudio(
      {
        id: item.id,
        titleAr: item.titleAr,
        titleEn: item.titleEn,
        reciterNameAr: item.reciterAr,
        reciterNameEn: item.reciterEn,
        format: item.kind,
        audioUrl: item.url,
        ...(item.surahId !== undefined ? { surahId: item.surahId } : {}),
        sourceLabel: item.sourceLabel,
      },
      true,
    );
  };

  const handleAddExternalUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormNotice(null);

    const rawUrl = urlInput.trim();
    if (!rawUrl) {
      setFormError(
        isAr
          ? "يرجى لصق رابط SoundCloud أو رابط ملف MP3 / M4A مباشر."
          : "Please paste a SoundCloud URL or direct MP3 / M4A audio link.",
      );
      return;
    }

    const customTitle = titleInput.trim();

    if (isValidSoundCloudUrl(rawUrl)) {
      const embedUrl = buildSoundCloudEmbedUrl(rawUrl, false);
      if (!embedUrl) {
        setFormError(isAr ? "تعذر تجهيز مشغل SoundCloud لهذا الرابط." : "Invalid SoundCloud link.");
        return;
      }
      const newTrack: QuranMediaTrackItem = {
        id: `user-sc-${Date.now()}`,
        kind: "soundcloud",
        titleAr: customTitle || "تلاوة ساوند كلاود مضافة",
        titleEn: customTitle || "Added SoundCloud Track",
        reciterAr: "الشيخ محمد اللحيدان / مضاف يدوياً",
        reciterEn: "SoundCloud Custom Link",
        url: rawUrl,
        embedUrl,
        sourceLabel: "SoundCloud Embed",
        isUserAdded: true,
        createdAt: new Date().toISOString(),
      };
      setUserTracks((prev) => [newTrack, ...prev]);
      setActiveSoundCloudTrackId(newTrack.id);
      setUrlInput("");
      setTitleInput("");
      setFormNotice(
        isAr
          ? "تمت إضافة رابط SoundCloud وتحميله في المشغل أعلاه."
          : "SoundCloud link added and loaded in the player above.",
      );
      return;
    }

    if (isValidDirectAudioUrl(rawUrl)) {
      const format = detectDirectAudioFormat(rawUrl);
      const newTrack: QuranMediaTrackItem = {
        id: `user-${format}-${Date.now()}`,
        kind: format,
        titleAr: customTitle || `ملف تلاوة (${format.toUpperCase()})`,
        titleEn: customTitle || `Added Quran Audio (${format.toUpperCase()})`,
        reciterAr: "مصدر خارجي موثق",
        reciterEn: "Direct Audio Link",
        url: rawUrl,
        sourceLabel: `HTTPS ${format.toUpperCase()}`,
        isUserAdded: true,
        createdAt: new Date().toISOString(),
      };
      setUserTracks((prev) => [newTrack, ...prev]);
      setUrlInput("");
      setTitleInput("");
      handlePlayTrackItem(newTrack);
      setFormNotice(
        isAr
          ? `تمت إضافة ملف ${format.toUpperCase()} وبدأ التشغيل.`
          : `${format.toUpperCase()} track added and queued in the player.`,
      );
      return;
    }

    setFormError(
      isAr
        ? "الرابط غير صالح. استخدم رابط soundcloud.com آمن أو رابط https مباشر بصيغة .mp3 أو .m4a."
        : "Invalid URL. Enter an https://soundcloud.com/... link or a direct https:// .mp3 / .m4a audio URL.",
    );
  };

  const handleLocalFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setFormError(null);
    setFormNotice(null);

    const added: QuranMediaTrackItem[] = [];
    for (const file of files) {
      const format = detectDirectAudioFormat(file.name);
      const blobUrl = URL.createObjectURL(file);
      createdBlobUrlsRef.current.push(blobUrl);
      const cleanName = file.name.replace(/\.(mp3|m4a|mp4)$/i, "");
      added.push({
        id: `local-${format}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        kind: format,
        titleAr: cleanName,
        titleEn: cleanName,
        reciterAr: "ملف محلي على جهازك",
        reciterEn: "Local Device Audio",
        url: blobUrl,
        sourceLabel: `Local ${format.toUpperCase()}`,
        isUserAdded: true,
        isLocalFile: true,
        createdAt: new Date().toISOString(),
      });
    }

    setUserTracks((prev) => [...added, ...prev]);
    if (added[0]) {
      handlePlayTrackItem(added[0]);
      setFormNotice(
        isAr
          ? `تم تحميل ${added.length} ملف صوتي (${added[0].kind.toUpperCase()}) من جهازك.`
          : `Loaded ${added.length} local audio file(s) from your device.`,
      );
    }
    e.target.value = "";
  };

  const handleRemoveUserTrack = (id: string) => {
    setUserTracks((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-5" dir={isAr ? "rtl" : "ltr"} data-testid="soundcloud-mp3-m4a-hub">
      {/* 1. SHEIKH MOHAMMED AL-LUHAIDAN: ALL 114 SURAHS & SURAH AL-FURQAN SPOTLIGHT */}
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/70 via-white to-stone-50 dark:from-emerald-950/30 dark:via-stone-900 dark:to-stone-900 p-5 space-y-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              <Headphones className="w-3.5 h-3.5" />
              <span>
                {isAr
                  ? "الشيخ د. محمد اللحيدان · المصحف الكامل (١١٤ سورة) + سورة الفرقان"
                  : "Sheikh Mohammed Al-Luhaidan · All 114 Surahs (MP3) + Surah Al-Furqan"}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
              {isAr
                ? "تشغيل مباشر لجميع السور بصيغة MP3 وساوند كلاود و M4A"
                : "Direct MP3, M4A & SoundCloud Player — Al-Luhaidan & All 114 Surahs"}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              {isAr
                ? "اختر أي سورة من ١ إلى ١١٤ أو استمع مباشرة لسورة الفرقان، أو استخدم مشغل SoundCloud وملفات M4A أدناه."
                : "Pick any Surah from 1–114 for Sheikh Mohammed Al-Luhaidan, launch Surah Al-Furqan in 1 click, stream SoundCloud, or add MP3/M4A files."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="quick-play-furqan-mp3quran"
              onClick={() => playLuhaidanSurah(25, "mp3quran")}
              className="min-h-[42px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isAr ? "تشغيل سورة الفرقان MP3" : "Play Surah Al-Furqan MP3"}</span>
            </button>
            <button
              type="button"
              data-testid="quick-play-furqan-archive"
              onClick={() => playLuhaidanSurah(25, "archive_ib")}
              className="min-h-[42px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-emerald-500 text-stone-800 dark:text-stone-200 text-xs font-bold transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current text-emerald-600" />
              <span>{isAr ? "الفرقان (أرشيف Archive.org)" : "Al-Furqan (Archive.org)"}</span>
            </button>
          </div>
        </div>

        {/* All 114 Surahs Selector for Mohammed Al-Luhaidan */}
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/90 p-3.5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end">
            <div className="md:col-span-5 space-y-1">
              <label
                htmlFor="luhaidan-114-surah-select"
                className="block text-[11px] font-bold text-stone-700 dark:text-stone-300"
              >
                {isAr
                  ? "اختر أي سورة (١–١١٤) — الشيخ محمد اللحيدان:"
                  : "All 114 Surahs — Sheikh Mohammed Al-Luhaidan:"}
              </label>
              <select
                id="luhaidan-114-surah-select"
                data-testid="luhaidan-114-surah-select"
                value={selectedSurahId}
                onChange={(e) => setSelectedSurahId(Number(e.target.value))}
                className="w-full min-h-[40px] rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {SURAHS_INDEX.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id}. {isAr ? `سورة ${s.nameAr}` : `Surah ${s.nameEn} (${s.nameAr})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4 space-y-1">
              <label
                htmlFor="luhaidan-archive-source-select"
                className="block text-[11px] font-bold text-stone-700 dark:text-stone-300"
              >
                {isAr ? "خادم المصحف الكامل (MP3):" : "Full 114-Surah MP3 Archive:"}
              </label>
              <select
                id="luhaidan-archive-source-select"
                value={selectedArchiveEdition}
                onChange={(e) =>
                  setSelectedArchiveEdition(
                    e.target.value as "mp3quran" | "archive_ib" | "archive_ltq",
                  )
                }
                className="w-full min-h-[40px] rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="mp3quran">
                  {isAr ? "MP3Quran Studio (سيرفر ٨)" : "MP3Quran Studio (Server 8)"}
                </option>
                <option value="archive_ib">
                  {isAr ? "Archive.org (al_luhaidan)" : "Archive.org (al_luhaidan)"}
                </option>
                <option value="archive_ltq">
                  {isAr ? "Archive.org (Listen-to-Quran)" : "Archive.org (Listen-to-Quran)"}
                </option>
              </select>
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <button
                type="button"
                data-testid="play-selected-114-surah-btn"
                onClick={() => playLuhaidanSurah(selectedSurahId, selectedArchiveEdition)}
                className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {isAr ? `تشغيل ${currentSurahMeta.nameAr}` : `Play ${currentSurahMeta.nameEn}`}
                </span>
              </button>
            </div>
          </div>

          {/* 1-Click Popular Surah Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-stone-100 dark:border-stone-800">
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 me-1">
              {isAr ? "سور مختارة:" : "Quick Surahs:"}
            </span>
            {FEATURED_SURAH_SHORTCUTS.map((sId) => {
              const s = SURAHS_INDEX.find((item) => item.id === sId);
              if (!s) return null;
              const isActive = selectedSurahId === sId;
              return (
                <button
                  key={sId}
                  type="button"
                  onClick={() => playLuhaidanSurah(sId, selectedArchiveEdition)}
                  className={`min-h-[32px] px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    isActive
                      ? "bg-emerald-700 text-white"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950/40"
                  }`}
                >
                  {s.id}. {isAr ? s.nameAr : s.nameEn}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. EMBEDDED OFFICIAL SOUNDCLOUD PLAYER + ADD SOUNDCLOUD / MP3 / M4A FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* SoundCloud Widget Embed */}
        <div className="lg:col-span-7 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 space-y-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                <Disc3 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                  {isAr ? activeSoundCloudTrack.titleAr : activeSoundCloudTrack.titleEn}
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  {isAr ? activeSoundCloudTrack.reciterAr : activeSoundCloudTrack.reciterEn}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {soundCloudTracks.map((sc) => {
              const selected = sc.id === activeSoundCloudTrack.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    if (audioCtx.isPlaying) audioCtx.pause();
                    setActiveSoundCloudTrackId(sc.id);
                    setSoundCloudAutoPlay(true);
                  }}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                    selected
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-orange-400"
                  }`}
                >
                  {isAr ? sc.titleAr : sc.titleEn}
                </button>
              );
            })}
          </div>

          {activeSoundCloudEmbedUrl && (
            <div className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
              <iframe
                title={isAr ? activeSoundCloudTrack.titleAr : activeSoundCloudTrack.titleEn}
                data-testid="soundcloud-embed-iframe"
                width="100%"
                height="210"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={activeSoundCloudEmbedUrl}
                className="w-full block"
              />
            </div>
          )}
        </div>

        {/* Add SoundCloud / MP3 / M4A URL or Upload Local File */}
        <div className="lg:col-span-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                {isAr ? "إضافة رابط SoundCloud أو ملف MP3 / M4A" : "Add SoundCloud, MP3, or M4A"}
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {isAr
                  ? "الصق رابط SoundCloud للتشغيل أو أضف ملف .mp3 / .m4a من الإنترنت أو جهازك."
                  : "Paste any soundcloud.com link, direct https:// .mp3/.m4a URL, or upload local audio."}
              </p>
            </div>
          </div>

          <form onSubmit={handleAddExternalUrl} className="space-y-2.5">
            <input
              type="url"
              data-testid="custom-audio-url-input"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://soundcloud.com/... or https://.../025.mp3 or .m4a"
              className="w-full min-h-[40px] px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <input
              type="text"
              data-testid="custom-audio-title-input"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder={
                isAr
                  ? "عنوان اختياري (مثال: سورة الفرقان - اللحيدان)"
                  : "Optional title (e.g., Surah Al-Furqan - Al-Luhaidan)"
              }
              className="w-full min-h-[40px] px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                data-testid="add-custom-audio-btn"
                className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? "إضافة وتشغيل" : "Add & Load"}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:border-emerald-500 text-stone-700 dark:text-stone-200 text-xs font-bold transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isAr ? "رفع MP3 / M4A" : "Upload MP3/M4A"}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a"
                multiple
                onChange={handleLocalFilesUpload}
                className="hidden"
                aria-label={isAr ? "رفع ملفات MP3 أو M4A" : "Upload MP3 or M4A audio files"}
              />
            </div>

            {formError && (
              <p
                role="alert"
                className="text-[11px] font-medium text-red-700 dark:text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1.5"
              >
                {formError}
              </p>
            )}
            {formNotice && (
              <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5">
                {formNotice}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* 3. FILTERABLE MP3, M4A & SOUNDCLOUD MEDIA CATALOG */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "all", labelAr: "الكل", labelEn: "All Formats" },
                { id: "soundcloud", labelAr: "SoundCloud", labelEn: "SoundCloud" },
                { id: "mp3", labelAr: "MP3", labelEn: "MP3" },
                { id: "m4a", labelAr: "M4A", labelEn: "M4A" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                data-testid={`media-filter-${f.id}`}
                onClick={() => setKindFilter(f.id)}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  kindFilter === f.id
                    ? "bg-emerald-700 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200/70"
                }`}
              >
                {isAr ? f.labelAr : f.labelEn}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute start-3 top-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAr ? "بحث في المكتبة (الفرقان، M4A...)" : "Search tracks (Al-Furqan, M4A...)"
              }
              className="w-full min-h-[38px] ps-8 pe-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {filteredMediaTracks.map((item) => {
            const isPlayingThisCustom = audioCtx.activeCustomTrack?.id === item.id;
            const isLoadedSoundCloud =
              item.kind === "soundcloud" && activeSoundCloudTrack.id === item.id;
            const isHighlighted = isPlayingThisCustom || isLoadedSoundCloud;

            return (
              <div
                key={item.id}
                data-testid={`media-track-card-${item.id}`}
                className={`rounded-xl border p-3.5 flex items-center justify-between gap-3 transition-all ${
                  isHighlighted
                    ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500"
                    : "bg-stone-50/70 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 hover:border-emerald-400"
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      item.kind === "soundcloud"
                        ? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                        : item.kind === "m4a"
                          ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                          : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {item.kind === "soundcloud" ? (
                      <Disc3 className="w-4 h-4" />
                    ) : item.kind === "m4a" ? (
                      <FileAudio className="w-4 h-4" />
                    ) : (
                      <Music2 className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                      {isAr ? item.titleAr : item.titleEn}
                    </div>
                    <div className="text-[11px] text-stone-600 dark:text-stone-300 truncate">
                      {isAr ? item.reciterAr : item.reciterEn} · {item.sourceLabel}
                    </div>
                    <div className="inline-block text-[10px] font-mono uppercase font-bold text-stone-500 dark:text-stone-400">
                      {item.kind}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.isUserAdded && (
                    <button
                      type="button"
                      onClick={() => handleRemoveUserTrack(item.id)}
                      aria-label={isAr ? "حذف" : "Remove"}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-stone-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    data-testid={`play-media-item-${item.id}`}
                    onClick={() => handlePlayTrackItem(item)}
                    className={`min-h-[36px] inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      item.kind === "soundcloud"
                        ? "bg-orange-600 hover:bg-orange-500 text-white"
                        : "bg-emerald-700 hover:bg-emerald-600 text-white"
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isAr ? "تشغيل" : "Play"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
