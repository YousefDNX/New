import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  fetchMushafPageVerses,
  getMushafPageMeta,
  SURAHS_INDEX,
  JUZ_START_PAGES,
  MushafPageUnavailableError,
  type MushafVerseData,
  type MushafPageMeta,
} from "@/lib/quran-mushaf";
import { fetchSurahAudio, stripTranslationMarkup, toArabicIndicDigits } from "@/lib/quran";
import {
  AlertCircle,
  BookOpen,
  Columns2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Bookmark,
  BookmarkCheck,
  Pause,
  Play,
  RotateCcw,
  Search,
  List,
  Languages,
} from "lucide-react";

interface QuranMushafReaderProps {
  initialPage?: number;
  onPageChange?: (page: number) => void;
  lang?: string;
}

type MushafTheme = "cream" | "white" | "night";

function MushafPageSheet({
  pageNumber,
  verses,
  fontSize,
  themeStyles,
  selectedVerseKey,
  onSelectVerse,
}: {
  pageNumber: number;
  verses: MushafVerseData[];
  fontSize: number;
  themeStyles: {
    borderOuter: string;
    borderInner: string;
    text: string;
    mutedText: string;
    headerBg: string;
    rosette: string;
    bannerBg: string;
    highlightBg: string;
    boxShadow: string;
  };
  selectedVerseKey: string | null;
  onSelectVerse: (v: MushafVerseData) => void;
}) {
  const pageMeta: MushafPageMeta = useMemo(() => getMushafPageMeta(pageNumber), [pageNumber]);

  const versesBySurah = useMemo(() => {
    const groups: {
      surahId: number;
      surahNameAr: string;
      surahNameEn: string;
      verses: MushafVerseData[];
    }[] = [];
    for (const v of verses) {
      let g = groups.find((item) => item.surahId === v.surahId);
      if (!g) {
        g = {
          surahId: v.surahId,
          surahNameAr: v.surahNameAr,
          surahNameEn: v.surahNameEn,
          verses: [],
        };
        groups.push(g);
      }
      g.verses.push(v);
    }
    return groups;
  }, [verses]);

  return (
    <div
      data-testid={`mushaf-sheet-${pageNumber}`}
      className={`relative w-full min-h-[580px] p-4 sm:p-8 rounded-xl border-4 ${themeStyles.borderOuter} transition-all flex flex-col justify-between`}
      style={{ boxShadow: themeStyles.boxShadow }}
    >
      {/* Inner Decorative Framing Line */}
      <div
        className={`absolute inset-2 sm:inset-3 border rounded pointer-events-none ${themeStyles.borderInner}`}
      />

      {/* Ornate Corner Elements */}
      <div className="absolute top-3 right-3 text-[10px] text-amber-700/60 pointer-events-none">
        ✤
      </div>
      <div className="absolute top-3 left-3 text-[10px] text-amber-700/60 pointer-events-none">
        ✤
      </div>
      <div className="absolute bottom-3 right-3 text-[10px] text-amber-700/60 pointer-events-none">
        ✤
      </div>
      <div className="absolute bottom-3 left-3 text-[10px] text-amber-700/60 pointer-events-none">
        ✤
      </div>

      {/* Page Top Header Bar in Mushaf style */}
      <div
        className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-xs font-semibold mb-6 ${themeStyles.headerBg}`}
      >
        <span>{pageMeta.surahNameAr}</span>
        <span className="text-[11px] font-mono">
          الجزء {toArabicIndicDigits(pageMeta.juzNumber)}
        </span>
      </div>

      {/* Verses Content Area */}
      <div className="w-full my-auto space-y-6">
        {versesBySurah.map((group) => {
          const isFirstSurahVerse = group.verses.some((v) => v.isFirstVerseOfSurah);
          const surahEntry = SURAHS_INDEX.find((s) => s.id === group.surahId);

          return (
            <div key={group.surahId} className="w-full text-center space-y-4">
              {/* Surah Header Banner if a Surah starts on this page */}
              {isFirstSurahVerse && (
                <div className="my-4">
                  <div
                    className={`py-2 px-6 rounded-lg text-center font-bold tracking-wide shadow-sm ${themeStyles.bannerBg}`}
                  >
                    <div className="text-sm sm:text-base font-serif">سُورَةُ {group.surahNameAr}</div>
                    <div className="text-[10px] opacity-90">
                      {surahEntry?.revelationPlace === "madinah" ? "مَدَنِيَّةٌ" : "مَكِّيَّةٌ"} • آيَاتُهَا{" "}
                      {toArabicIndicDigits(surahEntry?.versesCount ?? 0)}
                    </div>
                  </div>

                  {/* Bismillah Banner (Omitted for Surah 9 At-Tawbah & Surah 1 Al-Fatihah already has it as Ayah 1) */}
                  {group.surahId !== 9 && group.surahId !== 1 && (
                    <div
                      className={`text-center font-serif py-3 text-lg sm:text-xl font-bold tracking-wider ${themeStyles.text}`}
                      style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
                    >
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                    </div>
                  )}
                </div>
              )}

              {/* Paragraph-based continuous Mushaf layout with interactive clickable ayahs */}
              <div
                className={`text-justify leading-[2.6] sm:leading-[2.8] tracking-wide font-normal px-1 sm:px-3 ${themeStyles.text}`}
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif",
                  textAlignLast: "center",
                  wordSpacing: "4px",
                }}
              >
                {group.verses.map((v) => {
                  const isSelected = selectedVerseKey === v.verseKey;
                  return (
                    <span key={v.verseKey} data-mushaf-verse={v.verseKey} className="inline">
                      <button
                        type="button"
                        onClick={() => onSelectVerse(v)}
                        aria-pressed={isSelected}
                        className={`inline rounded-md px-0.5 transition-colors cursor-pointer ${
                          isSelected ? themeStyles.highlightBg : "hover:bg-amber-500/10"
                        }`}
                        title={`سورة ${v.surahNameAr} · آية ${v.verseNumber}`}
                      >
                        <span>{v.textUthmani}</span>
                        <span
                          className={`inline-flex items-center justify-center font-sans font-bold mx-1.5 select-none text-xs sm:text-sm ${themeStyles.rosette}`}
                        >
                          ﴿{toArabicIndicDigits(v.verseNumber)}﴾
                        </span>
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Page Bottom Footer with Arabic Page Number */}
      <div
        className={`w-full flex items-center justify-between pt-4 mt-6 border-t ${themeStyles.borderInner} text-xs ${themeStyles.mutedText}`}
      >
        <span className="text-[11px]">الحزب {toArabicIndicDigits(pageMeta.hizbNumber)}</span>
        <div className={`font-bold text-sm sm:text-base ${themeStyles.text}`}>
          — {toArabicIndicDigits(pageNumber)} —
        </div>
        <span className="text-[11px]">{pageMeta.surahNameAr}</span>
      </div>
    </div>
  );
}

export const QuranMushafReader: React.FC<QuranMushafReaderProps> = ({
  initialPage = 1,
  onPageChange,
  lang = "ar",
}) => {
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("btc_quran_last_mushaf_page");
      if (saved) {
        const num = Number(saved);
        if (num >= 1 && num <= 604) return num;
      }
    }
    return Math.min(604, Math.max(1, initialPage));
  });

  const [verses, setVerses] = useState<MushafVerseData[]>([]);
  const [facingVerses, setFacingVerses] = useState<MushafVerseData[]>([]);
  const [twoPageSpread, setTwoPageSpread] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [theme, setTheme] = useState<MushafTheme>("cream");
  const [fontSize, setFontSize] = useState<number>(26);
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("btc_quran_mushaf_bookmarks");
        return raw ? JSON.parse(raw) : [1];
      } catch {
        return [1];
      }
    }
    return [1];
  });
  const [showNavDrawer, setShowNavDrawer] = useState<boolean>(false);
  const [navTab, setNavTab] = useState<"surah" | "juz" | "bookmarks">("surah");
  const [searchFilter, setSearchFilter] = useState<string>("");

  const [selectedVerse, setSelectedVerse] = useState<MushafVerseData | null>(null);
  const [copiedVerseKey, setCopiedVerseKey] = useState<string | null>(null);
  const [verseTranslation, setVerseTranslation] = useState<string | null>(null);
  const [loadingTranslation, setLoadingTranslation] = useState<boolean>(false);
  const [showVerseTranslation, setShowVerseTranslation] = useState<boolean>(false);
  const [isPlayingSurahAudio, setIsPlayingSurahAudio] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pageMeta: MushafPageMeta = useMemo(() => getMushafPageMeta(currentPage), [currentPage]);
  const facingPageNumber = twoPageSpread && currentPage < 604 ? currentPage + 1 : null;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setSelectedVerse(null);
    setVerseTranslation(null);

    const promises: Array<Promise<MushafVerseData[]>> = [fetchMushafPageVerses(currentPage)];
    if (facingPageNumber !== null) {
      promises.push(fetchMushafPageVerses(facingPageNumber));
    }

    Promise.all(promises)
      .then(([primaryData, secondaryData]) => {
        if (!cancelled) {
          setVerses(primaryData ?? []);
          setFacingVerses(secondaryData ?? []);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg =
            err instanceof MushafPageUnavailableError
              ? err.message
              : err instanceof Error
                ? err.message
                : "Unable to load Mushaf page. Please check your connection.";
          setLoadError(msg);
          setVerses([]);
          setFacingVerses([]);
          setLoading(false);
        }
      });

    if (typeof window !== "undefined") {
      window.localStorage.setItem("btc_quran_last_mushaf_page", String(currentPage));
    }
    onPageChange?.(currentPage);

    return () => {
      cancelled = true;
    };
  }, [currentPage, facingPageNumber, onPageChange, retryToken]);

  useEffect(() => {
    if (!selectedVerse || !showVerseTranslation) {
      return;
    }
    let cancelled = false;
    setLoadingTranslation(true);
    setVerseTranslation(null);

    fetch(
      `https://api.quran.com/api/v4/verses/by_key/${selectedVerse.verseKey}?translations=20&fields=verse_key`,
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("Translation unavailable");
        const data = (await res.json()) as {
          verse?: { translations?: Array<{ text?: string }> };
        };
        const raw = data.verse?.translations?.[0]?.text;
        if (!cancelled) {
          setVerseTranslation(
            raw ? stripTranslationMarkup(raw) : "Translation unavailable for this ayah.",
          );
          setLoadingTranslation(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVerseTranslation("Unable to load English translation while offline.");
          setLoadingTranslation(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedVerse, showVerseTranslation]);

  const stepAmount = twoPageSpread ? 2 : 1;
  const handleNextPage = () => {
    if (currentPage < 604) {
      setCurrentPage((p) => Math.min(604, p + stepAmount));
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => Math.max(1, p - stepAmount));
    }
  };

  const toggleBookmark = () => {
    setBookmarks((prev) => {
      const exists = prev.includes(currentPage);
      const updated = exists
        ? prev.filter((p) => p !== currentPage)
        : [...prev, currentPage].sort((a, b) => a - b);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("btc_quran_mushaf_bookmarks", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const isBookmarked = bookmarks.includes(currentPage);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleCopyVerse = async (v: MushafVerseData) => {
    try {
      await navigator.clipboard.writeText(
        `${v.textUthmani} ﴿${toArabicIndicDigits(v.verseNumber)}﴾ (${v.verseKey})`,
      );
      setCopiedVerseKey(v.verseKey);
      setTimeout(() => setCopiedVerseKey(null), 1600);
    } catch {
      /* ignore clipboard denied */
    }
  };

  const handleToggleSurahAudio = async (surahId: number) => {
    setAudioError(null);
    const el = audioRef.current;
    if (!el) return;

    if (isPlayingSurahAudio) {
      el.pause();
      setIsPlayingSurahAudio(false);
      return;
    }

    try {
      const audio = await fetchSurahAudio(7, surahId);
      if (el.src !== audio.audioUrl) {
        el.src = audio.audioUrl;
      }
      el.playbackRate = 1.0;
      await el.play();
      setIsPlayingSurahAudio(true);
    } catch (err) {
      setAudioError(err instanceof Error ? err.message : "Audio unavailable while offline.");
      setIsPlayingSurahAudio(false);
    }
  };

  const isAr = lang === "ar";

  // Explicit contrast-guaranteed color schemes keyed exclusively by the Mushaf theme state
  const themeStyles = {
    cream: {
      bg: "bg-[#FBF8EF]",
      toolbarBg: "bg-[#F3ECE0] border-amber-900/15 text-stone-900",
      controlBg: "bg-white/80 border-amber-900/20 text-stone-800 hover:bg-white",
      borderOuter: "border-amber-700/35",
      borderInner: "border-amber-800/20",
      text: "text-stone-900",
      mutedText: "text-stone-600",
      headerBg: "bg-amber-100/80 text-amber-950",
      rosette: "text-amber-800",
      bannerBg: "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-700 text-amber-50",
      highlightBg: "bg-emerald-600/15 ring-1 ring-emerald-700/40",
      boxShadow: "0 4px 20px rgba(180, 130, 60, 0.12), inset 0 0 20px rgba(245, 230, 200, 0.3)",
    },
    white: {
      bg: "bg-white",
      toolbarBg: "bg-slate-100 border-slate-200 text-slate-900",
      controlBg: "bg-white border-slate-300 text-slate-800 hover:bg-slate-50",
      borderOuter: "border-slate-300",
      borderInner: "border-slate-200",
      text: "text-slate-900",
      mutedText: "text-slate-600",
      headerBg: "bg-slate-100 text-slate-800",
      rosette: "text-emerald-700",
      bannerBg: "bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-800 text-emerald-50",
      highlightBg: "bg-emerald-600/15 ring-1 ring-emerald-700/40",
      boxShadow: "0 4px 20px rgba(15, 23, 42, 0.08)",
    },
    night: {
      bg: "bg-[#12161A]",
      toolbarBg: "bg-[#181E24] border-amber-500/20 text-amber-100",
      controlBg: "bg-stone-900 border-amber-500/25 text-amber-100 hover:bg-stone-800",
      borderOuter: "border-amber-500/25",
      borderInner: "border-amber-400/15",
      text: "text-amber-100/95",
      mutedText: "text-stone-400",
      headerBg: "bg-stone-900 text-amber-300",
      rosette: "text-amber-400",
      bannerBg:
        "bg-gradient-to-r from-stone-900 via-amber-950/60 to-stone-900 text-amber-200 border border-amber-500/30",
      highlightBg: "bg-amber-400/20 ring-1 ring-amber-400/50",
      boxShadow: "0 4px 20px rgba(0,0,0,0.55), inset 0 0 15px rgba(217, 119, 6, 0.06)",
    },
  }[theme];

  return (
    <div
      ref={containerRef}
      data-testid="authentic-mushaf-reader"
      className={`relative flex flex-col items-center w-full min-h-[640px] rounded-2xl transition-colors duration-200 select-text ${themeStyles.bg}`}
      dir="rtl"
    >
      <audio ref={audioRef} preload="none" onEnded={() => setIsPlayingSurahAudio(false)} />

      {/* Top Toolbar */}
      <div
        className={`w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b rounded-t-2xl ${themeStyles.toolbarBg}`}
      >
        {/* Navigation Quick Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNavDrawer(true)}
            className="flex min-h-[36px] items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm transition-all"
            aria-label="قائمة الفهرس والأجزاء"
          >
            <List className="w-4 h-4" />
            <span>الفهرس والأجزاء</span>
          </button>

          <button
            type="button"
            onClick={toggleBookmark}
            className={`flex min-h-[36px] items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isBookmarked
                ? "bg-amber-500/20 text-amber-700 border-amber-500/40 font-bold"
                : themeStyles.controlBg
            }`}
            aria-label={isBookmarked ? "إزالة الإشارة المرجعية" : "حفظ إشارة مرجعية للصفحة"}
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-amber-600 fill-amber-500/20" />
                <span>محفوظة</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>حفظ الصفحة</span>
              </>
            )}
          </button>
        </div>

        {/* Center Page Meta Info */}
        <div className="text-center">
          <div className={`text-xs font-bold ${themeStyles.text}`}>
            {pageMeta.surahNameAr} • الجزء {toArabicIndicDigits(pageMeta.juzNumber)} • الحزب{" "}
            {toArabicIndicDigits(pageMeta.hizbNumber)}
          </div>
          <div className={`text-[10px] font-mono ${themeStyles.mutedText}`}>
            صفحة {toArabicIndicDigits(currentPage)}
            {facingPageNumber ? ` – ${toArabicIndicDigits(facingPageNumber)}` : ""} من ٦٠٤ (King
            Fahd Complex Standard)
          </div>
        </div>

        {/* Right Tools (Spread Mode, Theme, Font Size, Fullscreen) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="mushaf-spread-toggle"
            onClick={() => setTwoPageSpread((v) => !v)}
            className={`hidden xl:inline-flex min-h-[36px] items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
              twoPageSpread ? "bg-emerald-700 text-white border-emerald-700" : themeStyles.controlBg
            }`}
            title={isAr ? "عرض صفحتين متقابلتين كالمصحف المطبوع" : "2-Page Facing Book Spread"}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>{twoPageSpread ? "صفحتان متقابلتان" : "صفحة واحدة"}</span>
          </button>

          {/* Theme Selector */}
          <div
            className={`flex items-center rounded-lg border p-0.5 text-xs ${themeStyles.controlBg}`}
          >
            <button
              type="button"
              onClick={() => setTheme("cream")}
              className={`px-2 py-1 rounded ${theme === "cream" ? "bg-amber-100 text-amber-950 font-bold" : themeStyles.mutedText}`}
              title="مظهر المصحف الدافئ"
            >
              دافئ
            </button>
            <button
              type="button"
              onClick={() => setTheme("white")}
              className={`px-2 py-1 rounded ${theme === "white" ? "bg-slate-200 text-slate-950 font-bold" : themeStyles.mutedText}`}
              title="مظهر المصحف الأبيض"
            >
              أبيض
            </button>
            <button
              type="button"
              onClick={() => setTheme("night")}
              className={`px-2 py-1 rounded ${theme === "night" ? "bg-stone-900 text-amber-300 font-bold" : themeStyles.mutedText}`}
              title="مظهر القراءة الليلية"
            >
              ليلي
            </button>
          </div>

          {/* Font scale buttons */}
          <div
            className={`hidden sm:flex items-center gap-1 rounded-lg border px-2 py-1 text-xs ${themeStyles.controlBg}`}
          >
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.max(18, s - 2))}
              className="px-1.5 font-bold hover:text-emerald-700"
              title="تصغير الخط"
            >
              A-
            </button>
            <span className={`text-[10px] px-1 ${themeStyles.mutedText}`}>{fontSize}px</span>
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.min(38, s + 2))}
              className="px-1.5 font-bold hover:text-emerald-700"
              title="تكبير الخط"
            >
              A+
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`p-1.5 rounded-lg border ${themeStyles.controlBg}`}
            title={isFullscreen ? "إنهاء وضع ملء الشاشة" : "وضع ملء الشاشة"}
            aria-label="تبديل ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Interactive Clicked Ayah Bar */}
      {selectedVerse && (
        <div
          data-testid="mushaf-ayah-toolbar"
          className={`w-full max-w-5xl mt-3 px-4 py-2.5 rounded-xl border ${themeStyles.toolbarBg} flex flex-col gap-2 text-xs`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold">
              سورة {selectedVerse.surahNameAr} · الآية{" "}
              {toArabicIndicDigits(selectedVerse.verseNumber)} ({selectedVerse.verseKey})
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => void handleCopyVerse(selectedVerse)}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 font-semibold ${themeStyles.controlBg}`}
              >
                {copiedVerseKey === selectedVerse.verseKey ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedVerseKey === selectedVerse.verseKey ? "تم النسخ" : "نسخ الآية"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowVerseTranslation((v) => !v)}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 font-semibold ${themeStyles.controlBg}`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{showVerseTranslation ? "إخفاء الترجمة" : "ترجمة الآية (EN)"}</span>
              </button>
              <button
                type="button"
                onClick={() => void handleToggleSurahAudio(selectedVerse.surahId)}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1 font-bold text-white hover:bg-emerald-800"
              >
                {isPlayingSurahAudio ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>{isPlayingSurahAudio ? "إيقاف التلاوة" : "تلاوة السورة (1.0x)"}</span>
              </button>
            </div>
          </div>

          {audioError && <div className="text-[11px] font-medium text-red-600">{audioError}</div>}

          {showVerseTranslation && (
            <div
              dir="ltr"
              className={`rounded-lg border p-2.5 text-left text-xs leading-relaxed ${themeStyles.controlBg}`}
            >
              {loadingTranslation
                ? "Loading Saheeh International translation..."
                : verseTranslation}
            </div>
          )}
        </div>
      )}

      {/* Main Authentic Mushaf Sheet(s) */}
      <div
        className={`w-full p-3 sm:p-6 flex-1 flex flex-col justify-between ${
          twoPageSpread ? "max-w-[90rem]" : "max-w-4xl"
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <div className={`text-xs ${themeStyles.mutedText}`}>
              جاري تحميل صفحة المصحف الشريف...
            </div>
          </div>
        ) : loadError ? (
          <div
            data-testid="mushaf-page-error"
            className="mx-auto my-auto max-w-lg rounded-2xl border border-red-500/35 bg-red-500/10 p-6 text-center space-y-3"
          >
            <AlertCircle className="w-8 h-8 mx-auto text-red-600" />
            <div className="font-bold text-sm text-red-700 dark:text-red-300">
              {isAr ? "تعذر تحميل صفحة المصحف" : "Mushaf Page Unavailable"}
            </div>
            <p className={`text-xs leading-relaxed ${themeStyles.mutedText}`}>{loadError}</p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRetryToken((n) => n + 1)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? "إعادة المحاولة" : "Retry"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowNavDrawer(true)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold ${themeStyles.controlBg}`}
              >
                <List className="w-3.5 h-3.5" />
                <span>{isAr ? "الانتقال إلى صفحة متاحة" : "Open Mushaf Index"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            className={
              twoPageSpread && facingPageNumber
                ? "grid gap-4 xl:grid-cols-2 items-stretch"
                : "w-full"
            }
          >
            <MushafPageSheet
              pageNumber={currentPage}
              verses={verses}
              fontSize={fontSize}
              themeStyles={themeStyles}
              selectedVerseKey={selectedVerse?.verseKey ?? null}
              onSelectVerse={(v) =>
                setSelectedVerse((prev) => (prev?.verseKey === v.verseKey ? null : v))
              }
            />

            {twoPageSpread && facingPageNumber && (
              <MushafPageSheet
                pageNumber={facingPageNumber}
                verses={facingVerses}
                fontSize={fontSize}
                themeStyles={themeStyles}
                selectedVerseKey={selectedVerse?.verseKey ?? null}
                onSelectVerse={(v) =>
                  setSelectedVerse((prev) => (prev?.verseKey === v.verseKey ? null : v))
                }
              />
            )}
          </div>
        )}
      </div>

      {/* Bottom Page Navigation Controls */}
      <div
        className={`w-full px-4 py-3 flex flex-wrap items-center justify-between gap-4 border-t rounded-b-2xl ${
          twoPageSpread ? "max-w-[90rem]" : "max-w-4xl"
        } ${themeStyles.toolbarBg}`}
      >
        <button
          type="button"
          onClick={handleNextPage}
          disabled={currentPage >= 604}
          className="flex min-h-[40px] items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40 transition-all shadow-sm"
          aria-label="الصفحة التالية"
        >
          <span>الصفحة التالية</span>
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Slider and Direct Jump Input */}
        <div className="flex-1 max-w-xs flex items-center gap-2">
          <input
            type="range"
            min={1}
            max={604}
            value={currentPage}
            onChange={(e) => setCurrentPage(Number(e.target.value))}
            className="w-full accent-emerald-700 cursor-pointer"
            aria-label="شريط تمرير صفحات المصحف"
          />
          <div className="flex items-center gap-1 text-xs">
            <input
              type="number"
              min={1}
              max={604}
              value={currentPage}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 1 && val <= 604) setCurrentPage(val);
              }}
              className={`w-14 text-center py-1 border rounded font-mono text-xs ${themeStyles.controlBg}`}
              aria-label="رقم الصفحة المباشر"
            />
            <span className={themeStyles.mutedText}>/ 604</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className="flex min-h-[40px] items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40 transition-all shadow-sm"
          aria-label="الصفحة السابقة"
        >
          <ChevronRight className="w-4 h-4" />
          <span>الصفحة السابقة</span>
        </button>
      </div>

      {/* Navigation Modal / Drawer */}
      {showNavDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
              <div className="flex items-center gap-2 font-bold text-stone-800 dark:text-stone-100">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>فهرس المصحف الشريف</span>
              </div>
              <button
                type="button"
                onClick={() => setShowNavDrawer(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1 rounded"
                aria-label="إغلاق الفهرس"
              >
                ✕
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center border-b border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 px-4 pt-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setNavTab("surah")}
                className={`pb-2 px-3 border-b-2 transition-all ${
                  navTab === "surah"
                    ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                    : "border-transparent text-stone-500"
                }`}
              >
                السور (١١٤ سورة)
              </button>
              <button
                type="button"
                onClick={() => setNavTab("juz")}
                className={`pb-2 px-3 border-b-2 transition-all ${
                  navTab === "juz"
                    ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                    : "border-transparent text-stone-500"
                }`}
              >
                الأجزاء (٣٠ جزءاً)
              </button>
              <button
                type="button"
                onClick={() => setNavTab("bookmarks")}
                className={`pb-2 px-3 border-b-2 transition-all ${
                  navTab === "bookmarks"
                    ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                    : "border-transparent text-stone-500"
                }`}
              >
                الصفحات المحفوظة ({bookmarks.length})
              </button>
            </div>

            {/* Search Filter input */}
            <div className="p-3 border-b border-stone-100 dark:border-stone-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="ابحث عن اسم السورة أو رقم الجزء..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pr-9 pl-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {navTab === "surah" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {SURAHS_INDEX.filter(
                    (s) =>
                      s.nameAr.includes(searchFilter) ||
                      s.nameEn.toLowerCase().includes(searchFilter.toLowerCase()),
                  ).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setCurrentPage(s.startPage);
                        setShowNavDrawer(false);
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors border ${
                        currentPage >= s.startPage &&
                        (s.id === 114 || currentPage < (SURAHS_INDEX[s.id]?.startPage ?? 605))
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-900 dark:text-emerald-200 font-bold"
                          : "bg-white dark:bg-stone-800/60 border-stone-200 dark:border-stone-700/60 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-[10px] font-mono">
                          {s.id}
                        </span>
                        <span>{s.nameAr}</span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono">صـ {s.startPage}</span>
                    </button>
                  ))}
                </div>
              )}

              {navTab === "juz" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {JUZ_START_PAGES.filter(
                    (j) =>
                      String(j.juzNumber).includes(searchFilter) ||
                      j.startSurahNameAr.includes(searchFilter),
                  ).map((j) => (
                    <button
                      key={j.juzNumber}
                      type="button"
                      onClick={() => {
                        setCurrentPage(j.startPage);
                        setShowNavDrawer(false);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors border ${
                        pageMeta.juzNumber === j.juzNumber
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-900 dark:text-emerald-200 font-bold"
                          : "bg-white dark:bg-stone-800/60 border-stone-200 dark:border-stone-700/60 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold text-xs">
                          {toArabicIndicDigits(j.juzNumber)}
                        </span>
                        <div className="text-right">
                          <div className="font-bold">الجزء {toArabicIndicDigits(j.juzNumber)}</div>
                          <div className="text-[10px] text-stone-500">
                            يبدأ من {j.startSurahNameAr} ({j.startVerseKey})
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono">صـ {j.startPage}</span>
                    </button>
                  ))}
                </div>
              )}

              {navTab === "bookmarks" && (
                <div className="space-y-2">
                  {bookmarks.length === 0 ? (
                    <div className="text-center py-10 text-stone-400 text-xs">
                      لا توجد صفحات محفوظة حالياً. انقر على زر "حفظ الصفحة" لحفظ موضع قراءتك.
                    </div>
                  ) : (
                    bookmarks.map((p) => {
                      const m = getMushafPageMeta(p);
                      return (
                        <div
                          key={p}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentPage(p);
                              setShowNavDrawer(false);
                            }}
                            className="flex items-center gap-2 text-right hover:text-emerald-600 transition-colors"
                          >
                            <BookmarkCheck className="w-4 h-4 text-amber-500" />
                            <div>
                              <div className="font-bold text-xs text-stone-800 dark:text-stone-200">
                                صفحة {p} • {m.surahNameAr}
                              </div>
                              <div className="text-[10px] text-stone-500">الجزء {m.juzNumber}</div>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBookmarks((prev) => {
                                const next = prev.filter((b) => b !== p);
                                if (typeof window !== "undefined") {
                                  window.localStorage.setItem(
                                    "btc_quran_mushaf_bookmarks",
                                    JSON.stringify(next),
                                  );
                                }
                                return next;
                              });
                            }}
                            className="text-stone-400 hover:text-red-500 text-xs px-2 py-1"
                            title="حذف الإشارة المرجعية"
                          >
                            حذف
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-center">
              <span className="text-[11px] text-stone-500">
                مصحف المدينة النبوية برواية حفص عن عاصم — مجمع الملك فهد لطباعة المصحف الشريف
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
