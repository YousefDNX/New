import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BISMILLAH_UTHMANI,
  QURAN_TEXT_ATTRIBUTION,
  VERIFIED_JUZ_INDEX,
  VERIFIED_QURAN_RECITERS,
  VERIFIED_QURAN_TRANSLATIONS,
  fetchQuranJuzs,
  fetchQuranSurahs,
  fetchSurahAudio,
  fetchSurahUthmaniVerses,
  findActiveAyahAtTime,
  formatAudioTime,
  getVerifiedTranslation,
  shouldShowBismillahHeader,
  toArabicIndicDigits,
  type QuranAudioResult,
  type QuranBookmark,
  type QuranBookmarkCategory,
  type QuranJuz,
  type QuranLineSpacing,
  type QuranReadingTheme,
  type QuranReadingWidth,
  type QuranSurah,
  type QuranVerse,
} from "@/lib/quran";
import { useQuranPreferences } from "@/hooks/use-quran-preferences";
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Search,
  ShieldCheck,
  Sliders,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";

const VERSES_PER_PAGE = 40;

const BOOKMARK_PRESETS: Array<{ category: QuranBookmarkCategory; label: string }> = [
  { category: "continue", label: "Continue later" },
  { category: "review", label: "Review later" },
  { category: "favorite", label: "Favorite" },
];

export const DigitalQuranReader: React.FC = () => {
  const { prefs, cloudStatus, persistPreferences, clearSavedPreferences } = useQuranPreferences();

  const [surahs, setSurahs] = useState<QuranSurah[]>([]);
  const [juzs, setJuzs] = useState<QuranJuz[]>([...VERIFIED_JUZ_INDEX]);
  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeSurahId, setActiveSurahId] = useState<number>(prefs.lastSurah || 1);
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number>(prefs.lastAyah || 1);
  const [activeAyahNumber, setActiveAyahNumber] = useState<number | null>(null);
  const [chunkIndex, setChunkIndex] = useState(0);

  const [navTab, setNavTab] = useState<"surahs" | "juz" | "bookmarks">("surahs");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDisplayPanel, setShowDisplayPanel] = useState(false);

  const [selectedBookmarkCategory, setSelectedBookmarkCategory] =
    useState<QuranBookmarkCategory>("continue");
  const [selectedBookmarkLabel, setSelectedBookmarkLabel] = useState<string>("Continue later");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState<boolean>(
    () => prefs.lastSurah > 1 || prefs.lastAyah > 1 || prefs.lastPositionSeconds > 0,
  );

  // Audio states — strictly 1.0x original human recording speed, lazy-loaded only on Play
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioData, setAudioData] = useState<QuranAudioResult | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const activeSurah = useMemo(
    () =>
      surahs.find((s) => s.id === activeSurahId) ?? {
        id: activeSurahId,
        nameArabic: activeSurahId === 1 ? "الفاتحة" : `سورة ${activeSurahId}`,
        nameSimple: activeSurahId === 1 ? "Al-Fatihah" : `Surah ${activeSurahId}`,
        translatedName: "",
        versesCount: verses.length || 7,
        revelationPlace: "makkah" as const,
      },
    [surahs, activeSurahId, verses.length],
  );

  const activeTranslation = useMemo(
    () => getVerifiedTranslation(prefs.translationId),
    [prefs.translationId],
  );

  // Load 114 Surahs and 30 Juz index on mount
  useEffect(() => {
    let active = true;
    fetchQuranSurahs("en")
      .then((list) => {
        if (active) setSurahs(list);
      })
      .catch(() => {
        /* non-fatal fallback uses index data */
      });
    fetchQuranJuzs()
      .then((list) => {
        if (active) setJuzs(list);
      })
      .catch(() => {
        /* fallback VERIFIED_JUZ_INDEX already active */
      });
    return () => {
      active = false;
    };
  }, []);

  // Load Uthmani Verses when surah or translation settings change
  useEffect(() => {
    let active = true;
    setLoadingVerses(true);
    setLoadError(null);

    fetchSurahUthmaniVerses(activeSurahId, {
      translationId: prefs.showTranslation ? prefs.translationId : null,
    })
      .then((list) => {
        if (!active) return;
        setVerses(list);
        setLoadingVerses(false);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load Surah verses.");
        setLoadingVerses(false);
      });

    return () => {
      active = false;
    };
  }, [activeSurahId, prefs.showTranslation, prefs.translationId]);

  // Reset lazy audio stream when surah or reciter changes
  useEffect(() => {
    const audioEl = audioRef.current;
    if (audioEl) {
      if (!audioEl.paused) {
        audioEl.pause();
      }
      if (audioEl.hasAttribute("src")) {
        audioEl.removeAttribute("src");
      }
    }
    setIsPlaying(false);
    setAudioData(null);
    setAudioError(null);
    setCurrentTime(0);
    setDuration(0);
    setActiveAyahNumber(null);
  }, [activeSurahId, prefs.reciterId]);

  // Sync audio volume & mute
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = prefs.volume;
    audioRef.current.muted = prefs.muted;
  }, [prefs.volume, prefs.muted]);

  const totalChunks = Math.max(1, Math.ceil(verses.length / VERSES_PER_PAGE));
  const safeChunk = Math.min(chunkIndex, totalChunks - 1);
  const startVerseIdx = safeChunk * VERSES_PER_PAGE;
  const visibleVerses = verses.slice(startVerseIdx, startVerseIdx + VERSES_PER_PAGE);
  const rangeStart = verses.length === 0 ? 0 : startVerseIdx + 1;
  const rangeEnd = startVerseIdx + visibleVerses.length;

  const selectedVerse = useMemo(
    () => verses.find((v) => v.verseNumber === selectedAyahNumber) ?? verses[0] ?? null,
    [verses, selectedAyahNumber],
  );

  const filteredSurahs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return surahs;
    return surahs.filter(
      (s) =>
        s.nameSimple.toLowerCase().includes(q) ||
        s.nameArabic.includes(searchQuery.trim()) ||
        String(s.id) === q,
    );
  }, [surahs, searchQuery]);

  const jumpToLocation = (surahId: number, ayahNumber = 1) => {
    const targetSurah = Math.min(114, Math.max(1, surahId));
    const targetAyah = Math.max(1, ayahNumber);
    setActiveSurahId(targetSurah);
    setSelectedAyahNumber(targetAyah);
    setChunkIndex(Math.floor((targetAyah - 1) / VERSES_PER_PAGE));
    void persistPreferences({
      ...prefs,
      lastSurah: targetSurah,
      lastAyah: targetAyah,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCopyVerse = async (verse: QuranVerse) => {
    try {
      await navigator.clipboard.writeText(
        `${verse.textUthmani} ﴿${toArabicIndicDigits(verse.verseNumber)}﴾ (${verse.verseKey})`,
      );
      setCopiedKey(verse.verseKey);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      /* ignore clipboard denied */
    }
  };

  const handleBookmarkAyah = (verse: QuranVerse) => {
    const newBm: QuranBookmark = {
      id: `bm_${verse.verseKey}`,
      surahId: activeSurahId,
      ayahNumber: verse.verseNumber,
      verseKey: verse.verseKey,
      surahNameAr: activeSurah.nameArabic,
      surahNameEn: activeSurah.nameSimple,
      excerpt: verse.textUthmani.slice(0, 120),
      label: selectedBookmarkLabel,
      category: selectedBookmarkCategory,
      createdAt: new Date().toISOString(),
    };
    const nextBookmarks = [newBm, ...prefs.bookmarks.filter((b) => b.verseKey !== verse.verseKey)];
    void persistPreferences({
      ...prefs,
      bookmarks: nextBookmarks,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRemoveBookmark = (verseKey: string) => {
    void persistPreferences({
      ...prefs,
      bookmarks: prefs.bookmarks.filter((b) => b.verseKey !== verseKey),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveReadingPosition = (verse: QuranVerse) => {
    const nextHistory = [
      {
        surahId: activeSurahId,
        ayahNumber: verse.verseNumber,
        surahNameAr: activeSurah.nameArabic,
        surahNameEn: activeSurah.nameSimple,
        openedAt: new Date().toISOString(),
      },
      ...prefs.readingHistory.filter(
        (h) => !(h.surahId === activeSurahId && h.ayahNumber === verse.verseNumber),
      ),
    ];
    void persistPreferences({
      ...prefs,
      lastSurah: activeSurahId,
      lastAyah: verse.verseNumber,
      readingHistory: nextHistory,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleClearHistory = () => {
    void persistPreferences({
      ...prefs,
      readingHistory: [],
      updatedAt: new Date().toISOString(),
    });
  };

  const startPlayback = async (fromAyahNumber?: number) => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    setAudioError(null);
    let currentResult = audioData;

    if (
      !currentResult ||
      currentResult.surahId !== activeSurahId ||
      currentResult.reciterId !== prefs.reciterId
    ) {
      setAudioLoading(true);
      try {
        currentResult = await fetchSurahAudio(prefs.reciterId, activeSurahId);
        setAudioData(currentResult);
        audioEl.setAttribute("src", currentResult.audioUrl);
        audioEl.src = currentResult.audioUrl;
        audioEl.playbackRate = 1.0;
      } catch (err) {
        setAudioError(
          err instanceof Error
            ? `Audio unavailable: ${err.message}`
            : "Audio unavailable for this surah.",
        );
        setAudioLoading(false);
        return;
      } finally {
        setAudioLoading(false);
      }
    }

    if (typeof fromAyahNumber === "number" && currentResult.timestamps.length > 0) {
      const ts = currentResult.timestamps.find((t) => t.verseNumber === fromAyahNumber);
      if (ts) {
        audioEl.currentTime = ts.timestampFromMs / 1000;
        setActiveAyahNumber(fromAyahNumber);
      }
    }

    try {
      audioEl.playbackRate = 1.0;
      await audioEl.play();
      setIsPlaying(true);
    } catch {
      setAudioError("Audio unavailable: Playback could not start.");
      setIsPlaying(false);
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const spacingClass =
    prefs.lineSpacing === "spacious"
      ? "leading-[2.7]"
      : prefs.lineSpacing === "compact"
        ? "leading-[1.95]"
        : "leading-[2.35]";

  const fontSizeClass =
    prefs.fontSizeStep === 5
      ? "text-3xl"
      : prefs.fontSizeStep === 4
        ? "text-2xl"
        : prefs.fontSizeStep === 2
          ? "text-lg"
          : prefs.fontSizeStep === 1
            ? "text-base"
            : "text-xl";

  return (
    <div className="w-full space-y-4">
      {/* Resume Prompt Banner */}
      {showResumeBanner && (
        <div
          data-testid="quran-resume-banner"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/35 bg-emerald-50/80 dark:bg-emerald-950/40 px-4 py-3 text-xs"
        >
          <div className="space-y-0.5">
            <div className="font-bold text-emerald-900 dark:text-emerald-200">
              Resume from your last reading &amp; listening position
            </div>
            <div className="text-stone-600 dark:text-stone-300 font-mono">
              Surah {prefs.lastSurah} · Ayah {prefs.lastAyah} ·{" "}
              {formatAudioTime(prefs.lastPositionSeconds)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                jumpToLocation(prefs.lastSurah, prefs.lastAyah);
                setShowResumeBanner(false);
              }}
              className="rounded-lg bg-emerald-700 px-3 py-1.5 font-bold text-white hover:bg-emerald-800"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={() => {
                void clearSavedPreferences();
                setShowResumeBanner(false);
              }}
              className="rounded-lg border border-stone-300 dark:border-stone-700 px-3 py-1.5 font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Clear saved
            </button>
          </div>
        </div>
      )}

      {/* Top Integrity Attribution & Theme/Display Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold text-stone-800 dark:text-stone-100">
              Authentic Sources &amp; Integrity
            </span>
            <span className="mx-2 text-stone-400">·</span>
            <span className="text-stone-600 dark:text-stone-300">
              {QURAN_TEXT_ATTRIBUTION.provider}
            </span>
            {cloudStatus === "saved" && (
              <span className="ms-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                · Cloud Synced
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Light/Dark/System Reading Theme Switcher */}
          <div
            data-testid="mushaf-theme-switcher"
            className="flex items-center rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-0.5"
          >
            {(["system", "light", "dark"] as QuranReadingTheme[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => void persistPreferences({ ...prefs, readingTheme: mode })}
                aria-pressed={prefs.readingTheme === mode}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-colors ${
                  prefs.readingTheme === mode
                    ? "bg-emerald-700 text-white"
                    : "text-stone-600 dark:text-stone-300 hover:text-stone-900"
                }`}
              >
                {mode === "system" ? "System" : mode === "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowDisplayPanel((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-1.5 font-semibold text-stone-700 dark:text-stone-200 hover:border-emerald-500/40"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Display</span>
          </button>
        </div>
      </div>

      {/* Collapsible Display & Verified Translation Panel */}
      {showDisplayPanel && (
        <div
          data-testid="mushaf-display-panel"
          className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 text-xs space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <div className="font-bold text-stone-700 dark:text-stone-200">Line Spacing</div>
              <div className="flex gap-1.5">
                {(["compact", "comfortable", "spacious"] as QuranLineSpacing[]).map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => void persistPreferences({ ...prefs, lineSpacing: sp })}
                    className={`rounded-md border px-2.5 py-1 capitalize ${
                      prefs.lineSpacing === sp
                        ? "border-emerald-600 bg-emerald-700 text-white font-bold"
                        : "border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    {sp === "compact"
                      ? "Compact"
                      : sp === "comfortable"
                        ? "Comfortable"
                        : "Spacious"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="font-bold text-stone-700 dark:text-stone-200">Reading Width</div>
              <div className="flex gap-1.5">
                {(["focused", "wide"] as QuranReadingWidth[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => void persistPreferences({ ...prefs, readingWidth: w })}
                    className={`rounded-md border px-2.5 py-1 capitalize ${
                      prefs.readingWidth === w
                        ? "border-emerald-600 bg-emerald-700 text-white font-bold"
                        : "border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    {w === "focused" ? "Focused" : "Wide"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="font-bold text-stone-700 dark:text-stone-200">
                Verified Translation
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={prefs.showTranslation}
                  aria-label="Show translation"
                  onClick={() =>
                    void persistPreferences({
                      ...prefs,
                      showTranslation: !prefs.showTranslation,
                    })
                  }
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-semibold ${
                    prefs.showTranslation
                      ? "border-emerald-600 bg-emerald-700 text-white"
                      : "border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  <span>{prefs.showTranslation ? "Translation On" : "Show translation"}</span>
                </button>

                <select
                  aria-label="Select translation edition"
                  value={prefs.translationId}
                  onChange={(e) =>
                    void persistPreferences({
                      ...prefs,
                      translationId: Number(e.target.value),
                    })
                  }
                  className="rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-2 py-1 text-xs"
                >
                  {VERIFIED_QURAN_TRANSLATIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.languageLabel} · {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Split Grid: Sidebar Index + Reading Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sidebar: 114 Surahs / 30 Juz' / Bookmarks & History */}
        <aside className="lg:col-span-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-3 flex flex-col gap-3 max-h-[680px]">
          <div
            role="tablist"
            className="grid grid-cols-3 gap-1 rounded-lg bg-stone-100 dark:bg-stone-800 p-1 text-xs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={navTab === "surahs"}
              onClick={() => setNavTab("surahs")}
              className={`rounded-md py-1.5 font-bold ${
                navTab === "surahs"
                  ? "bg-emerald-700 text-white"
                  : "text-stone-600 dark:text-stone-300"
              }`}
            >
              114 Surahs
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={navTab === "juz"}
              onClick={() => setNavTab("juz")}
              className={`rounded-md py-1.5 font-bold ${
                navTab === "juz"
                  ? "bg-emerald-700 text-white"
                  : "text-stone-600 dark:text-stone-300"
              }`}
            >
              30 Juz&apos;
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={navTab === "bookmarks"}
              onClick={() => setNavTab("bookmarks")}
              className={`rounded-md py-1.5 font-bold ${
                navTab === "bookmarks"
                  ? "bg-emerald-700 text-white"
                  : "text-stone-600 dark:text-stone-300"
              }`}
            >
              Bookmarks
            </button>
          </div>

          {navTab === "surahs" && (
            <>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute start-2.5 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search surah name or number..."
                  className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 ps-8 pe-3 py-1.5 text-xs"
                />
              </div>

              <div
                role="listbox"
                aria-label="114 Surahs"
                className="flex-1 overflow-y-auto space-y-1"
              >
                {filteredSurahs.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="option"
                    aria-selected={s.id === activeSurahId}
                    onClick={() => jumpToLocation(s.id, 1)}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors ${
                      s.id === activeSurahId
                        ? "bg-emerald-700 text-white font-bold"
                        : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-mono opacity-80">{s.id}.</span>
                      <span>{s.nameSimple}</span>
                    </span>
                    <span className="font-quran text-sm">{s.nameArabic}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {navTab === "juz" && (
            <div role="listbox" aria-label="30 Juz" className="flex-1 overflow-y-auto space-y-1">
              {juzs.map((j) => (
                <button
                  key={j.juzNumber}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => jumpToLocation(j.startSurah, j.startAyah)}
                  className="w-full flex items-center justify-between rounded-lg border border-stone-200 dark:border-stone-800 px-3 py-2 text-xs hover:border-emerald-500/40 text-start"
                >
                  <span className="font-bold text-stone-800 dark:text-stone-100">
                    Juz&apos; {j.juzNumber}
                  </span>
                  <span className="font-mono text-stone-500">
                    Surah {j.startSurah}:{j.startAyah}
                  </span>
                </button>
              ))}
            </div>
          )}

          {navTab === "bookmarks" && (
            <div className="flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-2">
                <div className="font-bold text-stone-700 dark:text-stone-200">
                  Saved Bookmarks ({prefs.bookmarks.length})
                </div>
                {prefs.bookmarks.length === 0 ? (
                  <p className="text-stone-500">
                    Select an ayah and click Bookmark ayah to save it.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {prefs.bookmarks.map((bm) => (
                      <div
                        key={bm.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 dark:border-stone-700 p-2"
                      >
                        <button
                          type="button"
                          onClick={() => jumpToLocation(bm.surahId, bm.ayahNumber)}
                          className="text-start flex-1 hover:text-emerald-700"
                        >
                          <div className="font-bold text-stone-900 dark:text-stone-100">
                            <span>{bm.verseKey}</span>
                            {bm.label ? (
                              <span className="ms-2 text-emerald-700 dark:text-emerald-300">
                                {bm.label}
                              </span>
                            ) : null}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {bm.surahNameEn || bm.surahNameAr}
                          </div>
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove bookmark ${bm.verseKey}`}
                          onClick={() => handleRemoveBookmark(bm.verseKey)}
                          className="p-1 text-stone-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t border-stone-200 dark:border-stone-800 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-700 dark:text-stone-200">
                    Recent Reading Positions
                  </span>
                  {prefs.readingHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="text-[11px] font-semibold text-stone-500 hover:text-red-600"
                    >
                      Clear history
                    </button>
                  )}
                </div>
                {prefs.readingHistory.length === 0 ? (
                  <p className="text-stone-500">No recent reading history yet</p>
                ) : (
                  <div className="space-y-1">
                    {prefs.readingHistory.map((h) => (
                      <button
                        key={`${h.surahId}:${h.ayahNumber}`}
                        type="button"
                        onClick={() => jumpToLocation(h.surahId, h.ayahNumber)}
                        className="w-full flex items-center justify-between rounded border border-stone-200 dark:border-stone-800 px-2.5 py-1.5 text-start hover:bg-stone-50 dark:hover:bg-stone-800"
                      >
                        <span className="font-semibold">
                          {h.surahNameEn || `Surah ${h.surahId}`} ({h.surahId}:{h.ayahNumber})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Main Mushaf Canvas & Audio Deck */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div
            data-testid="mushaf-reading-canvas"
            data-mushaf-surface={prefs.readingTheme}
            className={`mushaf-reading-canvas rounded-2xl border p-4 sm:p-6 space-y-4 ${
              prefs.readingWidth === "wide" ? "max-w-none" : "max-w-4xl"
            }`}
          >
            {/* Surah Header + Next/Prev Surah Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/70 dark:border-stone-800 pb-3 text-xs">
              <div>
                <h2 className="text-base sm:text-lg font-bold">
                  {activeSurah.nameSimple} ·{" "}
                  <span className="font-quran">{activeSurah.nameArabic}</span>
                </h2>
                {prefs.showTranslation && (
                  <div className="text-[11px] text-stone-500">
                    Translation: {activeTranslation.languageLabel} · {activeTranslation.name}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeSurahId <= 1}
                  onClick={() => jumpToLocation(activeSurahId - 1, 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-stone-300 dark:border-stone-700 px-2.5 py-1 font-semibold disabled:opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>Previous Surah</span>
                </button>
                <button
                  type="button"
                  disabled={activeSurahId >= 114}
                  onClick={() => jumpToLocation(activeSurahId + 1, 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-stone-300 dark:border-stone-700 px-2.5 py-1 font-semibold disabled:opacity-40"
                >
                  <span>Next Surah</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Verse Chunk Pagination Bar */}
            {verses.length > 0 && (
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-mono text-stone-500">
                  {rangeStart}–{rangeEnd} / {verses.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={safeChunk <= 0}
                    onClick={() => setChunkIndex((i) => Math.max(0, i - 1))}
                    className="rounded-lg border border-stone-300 dark:border-stone-700 px-2.5 py-1 font-semibold disabled:opacity-40"
                  >
                    Previous ayahs
                  </button>
                  <button
                    type="button"
                    disabled={safeChunk >= totalChunks - 1}
                    onClick={() => setChunkIndex((i) => Math.min(totalChunks - 1, i + 1))}
                    className="rounded-lg border border-stone-300 dark:border-stone-700 px-2.5 py-1 font-semibold disabled:opacity-40"
                  >
                    Next ayahs
                  </button>
                </div>
              </div>
            )}

            {/* Selected Ayah Action Bar (or quick Play from Ayah trigger) */}
            {selectedVerse && (
              <div
                data-testid="ayah-action-panel"
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2.5 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold">
                    {activeSurah.nameSimple} · Ayah {selectedVerse.verseNumber} · Juz&apos;{" "}
                    {selectedVerse.juzNumber ?? 1} · Page {selectedVerse.pageNumber ?? 1}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => void handleCopyVerse(selectedVerse)}
                      className="inline-flex items-center gap-1 rounded-md border border-stone-300 dark:border-stone-700 px-2.5 py-1 font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      {copiedKey === selectedVerse.verseKey ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy Arabic text</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => void startPlayback(selectedVerse.verseNumber)}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-1 font-bold text-white hover:bg-emerald-800"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Play from Ayah {selectedVerse.verseNumber}</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {BOOKMARK_PRESETS.map((preset) => (
                    <button
                      key={preset.category}
                      type="button"
                      aria-label={preset.label}
                      onClick={() => {
                        setSelectedBookmarkCategory(preset.category);
                        setSelectedBookmarkLabel(preset.label);
                      }}
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                        selectedBookmarkLabel === preset.label
                          ? "border-emerald-600 bg-emerald-700 text-white"
                          : "border-stone-300 dark:border-stone-700"
                      }`}
                    >
                      Tag: {preset.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleBookmarkAyah(selectedVerse)}
                    className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-bold text-amber-800 dark:text-amber-300"
                  >
                    {prefs.bookmarks.some((b) => b.verseKey === selectedVerse.verseKey) ? (
                      <BookmarkCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5" />
                    )}
                    <span>Bookmark ayah</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveReadingPosition(selectedVerse)}
                    className="inline-flex items-center gap-1 rounded-md border border-stone-300 dark:border-stone-700 px-2.5 py-1 font-semibold"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Save reading position</span>
                  </button>
                </div>
              </div>
            )}

            {/* Authentic Framed Page-Based Mushaf Layout */}
            {loadingVerses ? (
              <div className="py-12 text-center text-xs text-stone-500">
                Loading Uthmani Mushaf text...
              </div>
            ) : loadError ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-700 dark:text-red-300">
                {loadError}
              </div>
            ) : (
              <div dir="rtl" lang="ar" className="space-y-6">
                {(() => {
                  const pageGroups: Array<{
                    pageNumber: number;
                    juzNumber: number;
                    items: QuranVerse[];
                  }> = [];
                  for (const verse of visibleVerses) {
                    const pNum = verse.pageNumber ?? 1;
                    const lastGroup = pageGroups[pageGroups.length - 1];
                    if (!lastGroup || lastGroup.pageNumber !== pNum) {
                      pageGroups.push({
                        pageNumber: pNum,
                        juzNumber: verse.juzNumber ?? 1,
                        items: [verse],
                      });
                    } else {
                      lastGroup.items.push(verse);
                    }
                  }

                  return pageGroups.map((pageGroup, pageIdx) => (
                    <section
                      key={`mushaf-p-${pageGroup.pageNumber}-${pageIdx}`}
                      data-testid="digital-mushaf-page"
                      className="relative rounded-2xl border-4 border-amber-700/25 p-4 sm:p-7 shadow-sm"
                      style={{
                        boxShadow:
                          prefs.readingTheme === "dark"
                            ? "inset 0 0 18px rgba(217, 119, 6, 0.06)"
                            : "inset 0 0 22px rgba(217, 169, 95, 0.14)",
                      }}
                    >
                      {/* Inner decorative Mushaf frame */}
                      <div className="pointer-events-none absolute inset-2 rounded-xl border border-amber-700/20" />

                      {/* Mushaf Page Top Strip */}
                      <div className="relative z-10 mb-5 flex items-center justify-between border-b border-amber-700/20 pb-2 text-xs font-semibold opacity-85">
                        <span className="font-quran text-sm">سُورَةُ {activeSurah.nameArabic}</span>
                        <span className="font-mono text-[11px]">
                          الجزء {toArabicIndicDigits(pageGroup.juzNumber)} · صفحة{" "}
                          {toArabicIndicDigits(pageGroup.pageNumber)}
                        </span>
                      </div>

                      {/* Ornate Surah Banner & Bismillah on page start */}
                      {pageIdx === 0 && safeChunk === 0 && (
                        <div className="relative z-10 mb-5 text-center space-y-3">
                          <div className="mx-auto max-w-md rounded-xl border border-amber-700/35 bg-amber-500/10 px-4 py-2 font-quran text-base font-bold">
                            سُورَةُ {activeSurah.nameArabic} —{" "}
                            {toArabicIndicDigits(activeSurah.versesCount)} آية
                          </div>
                          {shouldShowBismillahHeader(activeSurahId) && (
                            <div className="text-center font-quran text-2xl sm:text-[1.7rem] font-bold py-1">
                              {BISMILLAH_UTHMANI}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Continuous Horizontal RTL Printed Mushaf Text Flow */}
                      <div
                        className={`relative z-10 font-quran ${fontSizeClass} ${spacingClass} px-1 sm:px-3`}
                        style={{
                          textAlign: "justify",
                          textAlignLast: "center",
                          wordSpacing: "0.14em",
                        }}
                      >
                        {pageGroup.items.map((v) => {
                          const isActiveAudio = activeAyahNumber === v.verseNumber;
                          const isSelected = selectedAyahNumber === v.verseNumber;
                          return (
                            <span key={v.verseKey} data-verse-key={v.verseKey} className="inline">
                              <button
                                type="button"
                                onClick={() => setSelectedAyahNumber(v.verseNumber)}
                                aria-pressed={isSelected}
                                className={`inline rounded-md px-1 py-0.5 text-inherit transition-colors cursor-pointer ${
                                  isActiveAudio || isSelected
                                    ? "bg-emerald-500/20 ring-1 ring-emerald-500/50"
                                    : "hover:bg-amber-500/10"
                                }`}
                              >
                                <span>{v.textUthmani}</span>
                                {prefs.showVerseMarkers && (
                                  <span className="mx-1.5 font-sans text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 select-none">
                                    ﴿{toArabicIndicDigits(v.verseNumber)}﴾
                                  </span>
                                )}
                              </button>
                            </span>
                          );
                        })}
                      </div>

                      {/* Optional Margin/Footnote Translations when Enabled */}
                      {prefs.showTranslation && pageGroup.items.some((v) => v.translationText) && (
                        <div
                          dir="ltr"
                          lang="en"
                          className="relative z-10 mt-6 space-y-2 border-t border-amber-700/20 pt-4 text-left"
                        >
                          {pageGroup.items.map((v) =>
                            v.translationText ? (
                              <p
                                key={`tr-${v.verseKey}`}
                                className={`text-xs leading-relaxed ${
                                  selectedAyahNumber === v.verseNumber
                                    ? "font-medium opacity-100"
                                    : "opacity-80"
                                }`}
                              >
                                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 me-1.5">
                                  [{v.verseNumber}]
                                </span>
                                {v.translationText}
                              </p>
                            ) : null,
                          )}
                        </div>
                      )}

                      {/* Authentic Centered Arabic Page Number Footer */}
                      <div className="relative z-10 mt-6 flex items-center justify-between border-t border-amber-700/15 pt-3 text-[11px] opacity-75">
                        <span>{activeSurah.nameSimple}</span>
                        <span className="font-bold text-sm">
                          — {toArabicIndicDigits(pageGroup.pageNumber)} —
                        </span>
                        <span>{activeSurah.nameArabic}</span>
                      </div>
                    </section>
                  ));
                })()}
              </div>
            )}
          </div>

          {/* Authentic Recitation Audio Bar (Strictly 1.0x original speed, zero AI voice) */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 space-y-3 text-xs">
            <audio
              ref={audioRef}
              preload="none"
              onTimeUpdate={(e) => {
                const t = e.currentTarget.currentTime;
                setCurrentTime(t);
                if (audioData?.timestamps.length) {
                  const found = findActiveAyahAtTime(audioData.timestamps, t);
                  if (found) setActiveAyahNumber(found);
                }
              }}
              onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
              onEnded={() => {
                if (prefs.repeatMode === "surah" && audioRef.current) {
                  audioRef.current.currentTime = 0;
                  void audioRef.current.play();
                } else {
                  setIsPlaying(false);
                }
              }}
            />

            {audioError && (
              <div
                data-testid="quran-audio-error"
                className="flex items-center justify-between gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-700 dark:text-red-300"
              >
                <span>{audioError}</span>
                <button
                  type="button"
                  onClick={() => void startPlayback()}
                  className="inline-flex items-center gap-1 rounded border border-red-400/50 px-2.5 py-1 font-bold hover:bg-red-500/20"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {isPlaying ? (
                  <button
                    type="button"
                    aria-label="Pause recitation"
                    onClick={pausePlayback}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 font-bold text-white hover:bg-emerald-800"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Pause recitation</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label="Play recitation"
                    disabled={audioLoading}
                    onClick={() => void startPlayback()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    <span>{audioLoading ? "Loading audio..." : "Play recitation"}</span>
                  </button>
                )}

                <select
                  aria-label="Select authentic reciter"
                  value={prefs.reciterId}
                  onChange={(e) =>
                    void persistPreferences({
                      ...prefs,
                      reciterId: Number(e.target.value),
                    })
                  }
                  className="rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-2.5 py-1.5"
                >
                  {VERIFIED_QURAN_RECITERS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nameAr} · {r.nameEn} ({r.style})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-stone-500">
                  {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    void persistPreferences({
                      ...prefs,
                      repeatMode: prefs.repeatMode === "surah" ? "off" : "surah",
                    })
                  }
                  aria-label="Toggle surah repeat"
                  className={`rounded p-1.5 border ${
                    prefs.repeatMode === "surah"
                      ? "border-emerald-600 bg-emerald-700 text-white"
                      : "border-stone-200 dark:border-stone-700 text-stone-500"
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => void persistPreferences({ ...prefs, muted: !prefs.muted })}
                  aria-label={prefs.muted ? "Unmute" : "Mute"}
                  className="text-stone-500 hover:text-stone-800"
                >
                  {prefs.muted ? (
                    <VolumeX className="w-4 h-4 text-red-500" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
