import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  X,
  Mic,
  MicOff,
} from "lucide-react";
import { toast } from "sonner";

interface QuranMushafReaderProps {
  initialPage?: number;
  jumpSignal?: number;
  onPageChange?: (page: number) => void;
  lang?: string;
}

type MushafTheme = "cream" | "white" | "night";

interface MushafAyahSearchHit {
  verseKey: string;
  surahId: number;
  surahNameAr: string;
  surahNameEn: string;
  verseNumber: number;
  snippet: string;
  pageNumber?: number | undefined;
}

interface QuranSpeechRecognitionResultItemLike {
  transcript?: string;
}

interface QuranSpeechRecognitionEventLike {
  results?: ArrayLike<ArrayLike<QuranSpeechRecognitionResultItemLike>>;
}

interface QuranSpeechRecognitionInstanceLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((event: QuranSpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type QuranSpeechRecognitionConstructor = new () => QuranSpeechRecognitionInstanceLike;

function normalizeArabicForMushafSearch(raw: string): string {
  return raw
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}:\-\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function stripSearchMarkup(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function MushafPageSheet({
  pageNumber,
  verses,
  fontSize,
  themeStyles,
  selectedVerseKey,
  highlightedVerseKey,
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
    flashHighlightBg: string;
    boxShadow: string;
  };
  selectedVerseKey: string | null;
  highlightedVerseKey: string | null;
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
      className={`relative w-full min-h-[500px] sm:min-h-[580px] p-4 sm:p-8 rounded-xl border-4 ${themeStyles.borderOuter} transition-all flex flex-col justify-between`}
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
        className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-xs font-semibold mb-4 sm:mb-6 ${themeStyles.headerBg}`}
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
                className={`text-justify leading-[2.4] sm:leading-[2.8] tracking-wide font-normal px-1 sm:px-3 ${themeStyles.text}`}
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif",
                  textAlignLast: "center",
                  wordSpacing: "3px",
                }}
              >
                {group.verses.map((v) => {
                  const isSelected = selectedVerseKey === v.verseKey;
                  const isHighlighted = highlightedVerseKey === v.verseKey;
                  return (
                    <span
                      key={v.verseKey}
                      data-mushaf-verse={v.verseKey}
                      data-highlighted={isHighlighted ? "true" : undefined}
                      className="inline"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectVerse(v)}
                        aria-pressed={isSelected}
                        className={`inline rounded-md px-0.5 transition-all duration-300 cursor-pointer ${
                          isHighlighted
                            ? themeStyles.flashHighlightBg
                            : isSelected
                              ? themeStyles.highlightBg
                              : "hover:bg-amber-500/10"
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
  jumpSignal = 0,
  onPageChange,
  lang = "ar",
}) => {
  const isAr = lang === "ar";
  const [isListeningAyah, setIsListeningAyah] = useState<boolean>(false);
  const speechRecognitionRef = useRef<QuranSpeechRecognitionInstanceLike | null>(null);

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
  const hasManualSpreadToggleRef = useRef<boolean>(false);
  const [twoPageSpread, setTwoPageSpread] = useState<boolean>(() => {
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      return window.matchMedia("(min-width: 1024px)").matches;
    }
    return false;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [theme, setTheme] = useState<MushafTheme>("cream");
  const [fontSize, setFontSize] = useState<number>(() => {
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      return window.matchMedia("(min-width: 640px)").matches ? 26 : 22;
    }
    return 26;
  });
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

  // Unified Mushaf Header Search (Surahs + Ayahs) + 2-second highlight
  const [mushafSearchQuery, setMushafSearchQuery] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [remoteAyahHits, setRemoteAyahHits] = useState<MushafAyahSearchHit[]>([]);
  const [searchingAyahs, setSearchingAyahs] = useState<boolean>(false);
  const [highlightedVerseKey, setHighlightedVerseKey] = useState<string | null>(null);
  const pendingFocusVerseRef = useRef<string | null>(null);
  const highlightTimerRef = useRef<number | null>(null);

  const [selectedVerse, setSelectedVerse] = useState<MushafVerseData | null>(null);
  const [copiedVerseKey, setCopiedVerseKey] = useState<string | null>(null);
  const [verseTranslation, setVerseTranslation] = useState<string | null>(null);
  const [loadingTranslation, setLoadingTranslation] = useState<boolean>(false);
  const [showVerseTranslation, setShowVerseTranslation] = useState<boolean>(false);
  const [isPlayingSurahAudio, setIsPlayingSurahAudio] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const prevJumpSignalRef = useRef<number>(jumpSignal);
  const latestVersesRef = useRef<MushafVerseData[]>([]);
  latestVersesRef.current = [...verses, ...facingVerses];

  const pageMeta: MushafPageMeta = useMemo(() => getMushafPageMeta(currentPage), [currentPage]);
  const facingPageNumber = twoPageSpread && currentPage < 604 ? currentPage + 1 : null;

  // Sync external navigation jump signal (e.g., from Tafsir or Unified Search)
  useEffect(() => {
    if (jumpSignal !== prevJumpSignalRef.current) {
      prevJumpSignalRef.current = jumpSignal;
      setCurrentPage(Math.min(604, Math.max(1, initialPage)));
    }
  }, [initialPage, jumpSignal]);

  // Adapt spread automatically between mobile (< 1024px) and large screens (>= 1024px) unless manually toggled
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!hasManualSpreadToggleRef.current) {
        setTwoPageSpread(e.matches);
      }
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // Cleanup 2-second highlight timer on unmount
  useEffect(() => {
    return () => {
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  const triggerTwoSecondVerseHighlight = useCallback(
    (verseKey: string, allPageVerses?: MushafVerseData[]) => {
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
      setHighlightedVerseKey(verseKey);
      const found = (allPageVerses ?? latestVersesRef.current).find((v) => v.verseKey === verseKey);
      if (found) {
        setSelectedVerse(found);
      }
      window.setTimeout(() => {
        const el = containerRef.current?.querySelector(`[data-mushaf-verse="${verseKey}"]`);
        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 40);
      highlightTimerRef.current = window.setTimeout(() => {
        setHighlightedVerseKey((curr) => (curr === verseKey ? null : curr));
        highlightTimerRef.current = null;
      }, 2000);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    if (!pendingFocusVerseRef.current) {
      setSelectedVerse(null);
    }
    setVerseTranslation(null);

    const promises: Array<Promise<MushafVerseData[]>> = [fetchMushafPageVerses(currentPage)];
    if (facingPageNumber !== null) {
      promises.push(fetchMushafPageVerses(facingPageNumber));
    }

    Promise.all(promises)
      .then(([primaryData, secondaryData]) => {
        if (!cancelled) {
          const pVerses = primaryData ?? [];
          const sVerses = secondaryData ?? [];
          setVerses(pVerses);
          setFacingVerses(sVerses);
          setLoading(false);

          const pendingKey = pendingFocusVerseRef.current;
          if (pendingKey) {
            const combined = [...pVerses, ...sVerses];
            if (combined.some((v) => v.verseKey === pendingKey)) {
              pendingFocusVerseRef.current = null;
              triggerTwoSecondVerseHighlight(pendingKey, combined);
            }
          }
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
  }, [currentPage, facingPageNumber, onPageChange, retryToken, triggerTwoSecondVerseHighlight]);

  // Local Surah search matches across all 114 Surahs
  const surahSearchHits = useMemo(() => {
    const q = normalizeArabicForMushafSearch(mushafSearchQuery);
    if (!q) return [];
    return SURAHS_INDEX.filter((s) => {
      const arNorm = normalizeArabicForMushafSearch(s.nameAr);
      const enLower = s.nameEn.toLowerCase();
      return String(s.id) === q || arNorm.includes(q) || enLower.includes(q);
    }).slice(0, 6);
  }, [mushafSearchQuery]);

  // Local Ayah search matches across currently visible page(s)
  const localAyahHits = useMemo<MushafAyahSearchHit[]>(() => {
    const q = normalizeArabicForMushafSearch(mushafSearchQuery);
    if (q.length < 2) return [];
    const combined = [...verses, ...facingVerses];
    const matches: MushafAyahSearchHit[] = [];
    for (const v of combined) {
      const textNorm = normalizeArabicForMushafSearch(v.textUthmani);
      if (v.verseKey === q || textNorm.includes(q)) {
        matches.push({
          verseKey: v.verseKey,
          surahId: v.surahId,
          surahNameAr: v.surahNameAr,
          surahNameEn: v.surahNameEn,
          verseNumber: v.verseNumber,
          snippet: v.textUthmani,
          pageNumber: v.pageNumber,
        });
      }
      if (matches.length >= 6) break;
    }
    return matches;
  }, [facingVerses, mushafSearchQuery, verses]);

  // Debounced live Ayah search (verse key 2:255 or Arabic/English phrase via Quran.com API v4)
  useEffect(() => {
    const raw = mushafSearchQuery.trim();
    if (raw.length < 2) {
      setRemoteAyahHits([]);
      setSearchingAyahs(false);
      return;
    }

    let cancelled = false;
    setSearchingAyahs(true);

    const timer = window.setTimeout(async () => {
      try {
        const keyMatch = raw.match(/^(\d{1,3})\s*[:-]\s*(\d{1,3})$/);
        if (keyMatch) {
          const sId = Number(keyMatch[1]);
          const aNum = Number(keyMatch[2]);
          const vKey = `${sId}:${aNum}`;
          const res = await fetch(
            `https://api.quran.com/api/v4/verses/by_key/${vKey}?fields=text_uthmani,page_number`,
          );
          if (res.ok && !cancelled) {
            const data = (await res.json()) as {
              verse?: {
                verse_key?: string;
                verse_number?: number;
                text_uthmani?: string;
                page_number?: number;
              };
            };
            const v = data.verse;
            const surahMeta = SURAHS_INDEX.find((s) => s.id === sId);
            if (v?.verse_key) {
              setRemoteAyahHits([
                {
                  verseKey: v.verse_key,
                  surahId: sId,
                  surahNameAr: surahMeta?.nameAr ?? `سورة ${sId}`,
                  surahNameEn: surahMeta?.nameEn ?? `Surah ${sId}`,
                  verseNumber: v.verse_number ?? aNum,
                  snippet: v.text_uthmani ?? v.verse_key,
                  ...(typeof v.page_number === "number" ? { pageNumber: v.page_number } : {}),
                },
              ]);
              setSearchingAyahs(false);
              return;
            }
          }
        }

        const searchRes = await fetch(
          `https://api.quran.com/api/v4/search?q=${encodeURIComponent(raw)}&size=8`,
        );
        if (!searchRes.ok) {
          if (!cancelled) {
            setRemoteAyahHits([]);
            setSearchingAyahs(false);
          }
          return;
        }
        const json = (await searchRes.json()) as {
          search?: {
            results?: Array<{
              verse_key?: string;
              text?: string;
              page_number?: number;
            }>;
          };
        };
        const apiHits: MushafAyahSearchHit[] = [];
        for (const r of json.search?.results ?? []) {
          if (!r.verse_key) continue;
          const [sStr, aStr] = r.verse_key.split(":");
          const sId = Number(sStr);
          const aNum = Number(aStr);
          const surahMeta = SURAHS_INDEX.find((s) => s.id === sId);
          apiHits.push({
            verseKey: r.verse_key,
            surahId: Number.isFinite(sId) ? sId : 1,
            surahNameAr: surahMeta?.nameAr ?? "",
            surahNameEn: surahMeta?.nameEn ?? "",
            verseNumber: Number.isFinite(aNum) ? aNum : 1,
            snippet: stripSearchMarkup(r.text ?? r.verse_key),
            ...(typeof r.page_number === "number" ? { pageNumber: r.page_number } : {}),
          });
        }
        if (!cancelled) {
          setRemoteAyahHits(apiHits);
          setSearchingAyahs(false);
        }
      } catch {
        if (!cancelled) {
          setRemoteAyahHits([]);
          setSearchingAyahs(false);
        }
      }
    }, 260);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [mushafSearchQuery]);

  const combinedAyahHits = useMemo(() => {
    const byKey = new Map<string, MushafAyahSearchHit>();
    for (const h of localAyahHits) {
      byKey.set(h.verseKey, h);
    }
    for (const h of remoteAyahHits) {
      if (!byKey.has(h.verseKey)) {
        byKey.set(h.verseKey, h);
      }
    }
    return [...byKey.values()].slice(0, 8);
  }, [localAyahHits, remoteAyahHits]);

  const handleSelectSurahSearchResult = (startPage: number) => {
    pendingFocusVerseRef.current = null;
    setHighlightedVerseKey(null);
    setCurrentPage(startPage);
    setSearchOpen(false);
  };

  const handleSelectAyahSearchResult = useCallback(
    async (hit: MushafAyahSearchHit) => {
      setSearchOpen(false);
      let targetPage = hit.pageNumber;

      if (!targetPage) {
        try {
          const res = await fetch(
            `https://api.quran.com/api/v4/verses/by_key/${hit.verseKey}?fields=page_number`,
          );
          if (res.ok) {
            const json = (await res.json()) as { verse?: { page_number?: number } };
            if (typeof json.verse?.page_number === "number") {
              targetPage = json.verse.page_number;
            }
          }
        } catch {
          /* fallback to surah start page */
        }
      }

      if (!targetPage) {
        targetPage = SURAHS_INDEX.find((s) => s.id === hit.surahId)?.startPage ?? 1;
      }

      const currentlyVisible = [...verses, ...facingVerses];
      if (
        (targetPage === currentPage || targetPage === facingPageNumber) &&
        currentlyVisible.some((v) => v.verseKey === hit.verseKey)
      ) {
        triggerTwoSecondVerseHighlight(hit.verseKey, currentlyVisible);
        return;
      }

      pendingFocusVerseRef.current = hit.verseKey;
      setCurrentPage(targetPage);
    },
    [currentPage, facingPageNumber, facingVerses, triggerTwoSecondVerseHighlight, verses],
  );

  const performVoiceAyahJump = useCallback(
    async (spokenText: string) => {
      const clean = spokenText.trim();
      if (!clean) return;
      const normSpoken = normalizeArabicForMushafSearch(clean);

      // 1. Check currently visible verses first
      const currentVerses = [...verses, ...facingVerses];
      const directMatch = currentVerses.find((v) => {
        const normV = normalizeArabicForMushafSearch(v.textUthmani);
        return normV.includes(normSpoken) || normSpoken.includes(normV);
      });
      if (directMatch) {
        triggerTwoSecondVerseHighlight(directMatch.verseKey, currentVerses);
        toast.success(
          isAr
            ? `تم تحديد الآية: سورة ${directMatch.surahNameAr} (${directMatch.verseKey})`
            : `Found Ayah: Surah ${directMatch.surahNameEn} (${directMatch.verseKey})`,
        );
        return;
      }

      // 2. Check if spokenText matches a verse key pattern e.g. "2:255"
      const keyMatch = clean.match(/^(\d{1,3})\s*[:-]\s*(\d{1,3})$/);
      if (keyMatch) {
        const sId = Number(keyMatch[1]);
        const aNum = Number(keyMatch[2]);
        const vKey = `${sId}:${aNum}`;
        await handleSelectAyahSearchResult({
          verseKey: vKey,
          surahId: sId,
          surahNameAr: SURAHS_INDEX.find((s) => s.id === sId)?.nameAr ?? `سورة ${sId}`,
          surahNameEn: SURAHS_INDEX.find((s) => s.id === sId)?.nameEn ?? `Surah ${sId}`,
          verseNumber: aNum,
          snippet: vKey,
        });
        return;
      }

      // 3. Search via Quran.com search API
      try {
        toast.loading(
          isAr ? `جاري البحث عن تلاوة: "${clean}"...` : `Searching recitation: "${clean}"...`,
          { id: "voice-ayah-search" },
        );
        const res = await fetch(
          `https://api.quran.com/api/v4/search?q=${encodeURIComponent(clean)}&size=3`,
        );
        if (res.ok) {
          const json = (await res.json()) as {
            search?: {
              results?: Array<{
                verse_key?: string;
                text?: string;
                page_number?: number;
              }>;
            };
          };
          const firstHit = json.search?.results?.[0];
          if (firstHit?.verse_key) {
            const [sStr, aStr] = firstHit.verse_key.split(":");
            const sId = Number(sStr) || 1;
            const aNum = Number(aStr) || 1;
            const surahMeta = SURAHS_INDEX.find((s) => s.id === sId);
            toast.dismiss("voice-ayah-search");
            toast.success(
              isAr
                ? `تم التعرف على الآية: سورة ${surahMeta?.nameAr ?? sId} (${firstHit.verse_key})`
                : `Found Ayah: Surah ${surahMeta?.nameEn ?? sId} (${firstHit.verse_key})`,
            );
            await handleSelectAyahSearchResult({
              verseKey: firstHit.verse_key,
              surahId: sId,
              surahNameAr: surahMeta?.nameAr ?? `سورة ${sId}`,
              surahNameEn: surahMeta?.nameEn ?? `Surah ${sId}`,
              verseNumber: aNum,
              snippet: stripSearchMarkup(firstHit.text ?? firstHit.verse_key),
              ...(typeof firstHit.page_number === "number"
                ? { pageNumber: firstHit.page_number }
                : {}),
            });
            return;
          }
        }
      } catch {
        /* fallback to search query input */
      }
      toast.dismiss("voice-ayah-search");
      setMushafSearchQuery(clean);
      setSearchOpen(true);
    },
    [facingVerses, handleSelectAyahSearchResult, isAr, triggerTwoSecondVerseHighlight, verses],
  );

  const stopVoiceAyahSearch = useCallback(() => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        /* ignore */
      }
      speechRecognitionRef.current = null;
    }
    setIsListeningAyah(false);
  }, []);

  const toggleVoiceAyahSearch = useCallback(() => {
    if (isListeningAyah) {
      stopVoiceAyahSearch();
      return;
    }

    const SpeechRecognitionClass =
      typeof window !== "undefined"
        ? (
            window as unknown as {
              SpeechRecognition?: QuranSpeechRecognitionConstructor;
              webkitSpeechRecognition?: QuranSpeechRecognitionConstructor;
            }
          ).SpeechRecognition ||
          (
            window as unknown as {
              webkitSpeechRecognition?: QuranSpeechRecognitionConstructor;
            }
          ).webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionClass) {
      const promptText = window.prompt(
        isAr
          ? "البحث الصوتي: اكتب أو اقرأ نص الآية الشريفة للانتقال إليها فوراً في المصحف وتظليلها:"
          : "Voice Recitation: Speak or enter Ayah text or number to jump to its page:",
      );
      if (promptText && promptText.trim()) {
        setMushafSearchQuery(promptText.trim());
        void performVoiceAyahJump(promptText.trim());
      }
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      speechRecognitionRef.current = recognition;
      recognition.lang = "ar-SA";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListeningAyah(true);
        toast.info(
          isAr
            ? "🎤 استمع لقراءتك... اقرأ الآية بوضوح وسننتقل إليها فوراً"
            : "🎤 Listening... Recite the Ayah clearly to jump to it",
        );
      };

      recognition.onresult = (event: QuranSpeechRecognitionEventLike) => {
        const transcript = event.results?.[0]?.[0]?.transcript ?? "";
        if (transcript.trim()) {
          setMushafSearchQuery(transcript.trim());
          void performVoiceAyahJump(transcript.trim());
        }
      };

      recognition.onerror = () => {
        setIsListeningAyah(false);
        speechRecognitionRef.current = null;
      };

      recognition.onend = () => {
        setIsListeningAyah(false);
        speechRecognitionRef.current = null;
      };

      recognition.start();
    } catch {
      setIsListeningAyah(false);
      const fallbackText = window.prompt(
        isAr
          ? "اكتب أو اقرأ نص الآية الكريمة للانتقال إليها فوراً:"
          : "Enter or recite the Ayah text to jump to it:",
      );
      if (fallbackText && fallbackText.trim()) {
        setMushafSearchQuery(fallbackText.trim());
        void performVoiceAyahJump(fallbackText.trim());
      }
    }
  }, [isAr, isListeningAyah, performVoiceAyahJump, stopVoiceAyahSearch]);

  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

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

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const touch = e.changedTouches[0];
    if (!start || !touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    // Require clear horizontal swipe (avoids conflicting with vertical mobile scrolling)
    if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy) * 1.4) {
      return;
    }

    // Swiping left (dx < 0) advances to the next page; swiping right (dx > 0) returns to previous
    if (dx < 0) {
      handleNextPage();
    } else {
      handlePrevPage();
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

  // Explicit contrast-guaranteed color schemes keyed exclusively by the Mushaf theme state
  const themeStyles = {
    cream: {
      bg: "bg-[#FBF8EF]",
      toolbarBg: "bg-[#F3ECE0] border-amber-900/15 text-stone-900",
      controlBg: "bg-white/85 border-amber-900/20 text-stone-800 hover:bg-white",
      borderOuter: "border-amber-700/35",
      borderInner: "border-amber-800/20",
      text: "text-stone-900",
      mutedText: "text-stone-600",
      headerBg: "bg-amber-100/80 text-amber-950",
      rosette: "text-amber-800",
      bannerBg: "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-700 text-amber-50",
      highlightBg: "bg-emerald-600/15 ring-1 ring-emerald-700/40",
      flashHighlightBg: "bg-amber-400/40 ring-2 ring-amber-600 shadow-sm",
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
      flashHighlightBg: "bg-amber-300/45 ring-2 ring-amber-500 shadow-sm",
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
      flashHighlightBg: "bg-amber-400/35 ring-2 ring-amber-400 shadow-sm",
      boxShadow: "0 4px 20px rgba(0,0,0,0.55), inset 0 0 15px rgba(217, 119, 6, 0.06)",
    },
  }[theme];

  return (
    <div
      ref={containerRef}
      data-testid="authentic-mushaf-reader"
      className={`relative flex flex-col items-center w-full min-h-[600px] rounded-2xl transition-colors duration-200 select-text ${themeStyles.bg}`}
      dir="rtl"
    >
      <audio ref={audioRef} preload="none" onEnded={() => setIsPlayingSurahAudio(false)} />

      {/* Top Toolbar */}
      <div
        className={`w-full flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 border-b rounded-t-2xl ${themeStyles.toolbarBg}`}
      >
        {/* Navigation Quick Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNavDrawer(true)}
            className="flex min-h-[38px] items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm transition-all cursor-pointer"
            aria-label="قائمة الفهرس والأجزاء"
          >
            <List className="w-4 h-4" />
            <span>الفهرس والأجزاء</span>
          </button>

          <button
            type="button"
            onClick={toggleBookmark}
            className={`flex min-h-[38px] items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
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
        <div className="text-center order-last sm:order-none w-full sm:w-auto">
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
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            data-testid="mushaf-spread-toggle"
            onClick={() => {
              hasManualSpreadToggleRef.current = true;
              setTwoPageSpread((v) => !v);
            }}
            className={`hidden lg:inline-flex min-h-[38px] items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
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
              className={`px-2 py-1 rounded cursor-pointer ${theme === "cream" ? "bg-amber-100 text-amber-950 font-bold" : themeStyles.mutedText}`}
              title="مظهر المصحف الدافئ"
            >
              دافئ
            </button>
            <button
              type="button"
              onClick={() => setTheme("white")}
              className={`px-2 py-1 rounded cursor-pointer ${theme === "white" ? "bg-slate-200 text-slate-950 font-bold" : themeStyles.mutedText}`}
              title="مظهر المصحف الأبيض"
            >
              أبيض
            </button>
            <button
              type="button"
              onClick={() => setTheme("night")}
              className={`px-2 py-1 rounded cursor-pointer ${theme === "night" ? "bg-stone-900 text-amber-300 font-bold" : themeStyles.mutedText}`}
              title="مظهر القراءة الليلية"
            >
              ليلي
            </button>
          </div>

          {/* Font scale buttons (visible on mobile & desktop) */}
          <div
            className={`flex items-center gap-0.5 rounded-lg border px-1.5 py-1 text-xs ${themeStyles.controlBg}`}
          >
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.max(18, s - 2))}
              className="px-1.5 font-bold hover:text-emerald-700 cursor-pointer"
              title="تصغير الخط"
            >
              A-
            </button>
            <span className={`hidden sm:inline text-[10px] px-1 ${themeStyles.mutedText}`}>
              {fontSize}px
            </span>
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.min(38, s + 2))}
              className="px-1.5 font-bold hover:text-emerald-700 cursor-pointer"
              title="تكبير الخط"
            >
              A+
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`p-2 rounded-lg border cursor-pointer ${themeStyles.controlBg}`}
            title={isFullscreen ? "إنهاء وضع ملء الشاشة" : "وضع ملء الشاشة"}
            aria-label="تبديل ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Unified Surah & Ayah Instant Search Bar with Voice Recitation */}
      <div className={`w-full px-3 sm:px-4 py-2.5 border-b relative ${themeStyles.toolbarBg}`}>
        <div className="max-w-3xl mx-auto relative">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 absolute right-3 text-stone-400 pointer-events-none" />
              <input
                type="text"
                data-testid="mushaf-search-input"
                value={mushafSearchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setMushafSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                placeholder={
                  isAr
                    ? "ابحث عن سورة (مثل: الكهف) أو آية (مثل: 2:255 أو آية الكرسي أو نص الآية)..."
                    : "Search Surah (e.g. Al-Kahf) or Ayah (e.g. 2:255 or verse text)..."
                }
                aria-label={isAr ? "البحث في السور والآيات" : "Search Surahs and Ayahs"}
                className={`w-full pr-9 pl-9 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-600/40 ${themeStyles.controlBg}`}
              />
              {mushafSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setMushafSearchQuery("");
                    setSearchOpen(false);
                    setRemoteAyahHits([]);
                  }}
                  aria-label={isAr ? "مسح البحث" : "Clear search"}
                  className="absolute left-2.5 p-1 rounded-md text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Voice Recitation Search Button */}
            <button
              type="button"
              data-testid="mushaf-voice-search-btn"
              onClick={toggleVoiceAyahSearch}
              className={`min-h-[38px] px-3 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0 ${
                isListeningAyah
                  ? "bg-rose-600 text-white border-rose-600 animate-pulse shadow-md"
                  : "bg-emerald-600/10 text-emerald-800 hover:bg-emerald-600/20 border-emerald-600/30 dark:bg-emerald-500/20 dark:text-emerald-300"
              }`}
              title={
                isAr
                  ? "اقرأ الآية الكريمة بصوتك للانتقال إليها وتظليلها فوراً"
                  : "Recite Ayah by voice to jump & highlight directly"
              }
              aria-label={isAr ? "البحث الصوتي عن الآية بالقراءة" : "Voice Recitation Ayah Search"}
            >
              {isListeningAyah ? (
                <MicOff className="w-4 h-4 text-white" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isListeningAyah
                  ? isAr
                    ? "جاري الاستماع..."
                    : "Listening..."
                  : isAr
                    ? "قراءة آية"
                    : "Recite"}
              </span>
            </button>
          </div>

          {/* Voice Listening Active Status Banner */}
          {isListeningAyah && (
            <div className="mt-2 flex items-center justify-between px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>
                  {isAr
                    ? "🎤 استمع لقراءتك للآية... اقرأ أي آية وسننتقل إليها فوراً في المصحف وتظليلها"
                    : "🎤 Listening to your recitation... Recite any verse to jump directly to its Mushaf page"}
                </span>
              </div>
              <button
                type="button"
                onClick={stopVoiceAyahSearch}
                className="text-[11px] underline hover:no-underline font-medium cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
            </div>
          )}

          {searchOpen && mushafSearchQuery.trim().length > 0 && (
            <div
              data-testid="mushaf-search-results"
              className="absolute z-40 left-0 right-0 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-xl p-2 space-y-2 text-stone-900 dark:text-stone-100"
            >
              {surahSearchHits.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    {isAr ? "السور المطابقة" : "Matching Surahs"}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {surahSearchHits.map((s) => (
                      <button
                        key={`surah-${s.id}`}
                        type="button"
                        data-testid={`mushaf-search-surah-${s.id}`}
                        onClick={() => handleSelectSurahSearchResult(s.startPage)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs border border-stone-200/80 dark:border-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-start cursor-pointer"
                      >
                        <span className="font-bold">
                          {s.id}. {s.nameAr} ({s.nameEn})
                        </span>
                        <span className="text-[10px] font-mono text-stone-500">
                          {isAr ? `صـ ${s.startPage}` : `p. ${s.startPage}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(combinedAyahHits.length > 0 || searchingAyahs) && (
                <div className="space-y-1">
                  <div className="px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center justify-between">
                    <span>
                      {isAr
                        ? "الآيات (اضغط للانتقال وتظليل الآية)"
                        : "Matching Ayahs (Click to jump & highlight)"}
                    </span>
                    {searchingAyahs && <span className="text-[10px] opacity-75">...</span>}
                  </div>
                  {combinedAyahHits.map((hit) => (
                    <button
                      key={`ayah-${hit.verseKey}`}
                      type="button"
                      data-testid={`mushaf-search-ayah-${hit.verseKey}`}
                      onClick={() => void handleSelectAyahSearchResult(hit)}
                      className="w-full flex flex-col gap-1 px-3 py-2 rounded-lg text-xs border border-stone-200/80 dark:border-stone-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-start cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">
                          {hit.surahNameAr || hit.surahNameEn} ({hit.verseKey})
                        </span>
                        {hit.pageNumber && (
                          <span className="text-[10px] font-mono text-stone-500">
                            {isAr ? `صفحة ${hit.pageNumber}` : `Page ${hit.pageNumber}`}
                          </span>
                        )}
                      </div>
                      <div
                        className="text-sm font-serif leading-relaxed text-stone-800 dark:text-stone-200 line-clamp-2"
                        style={{ fontFamily: "'Amiri', serif" }}
                      >
                        {hit.snippet}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {surahSearchHits.length === 0 && combinedAyahHits.length === 0 && !searchingAyahs && (
                <div className="py-3 text-center text-xs text-stone-500">
                  {isAr
                    ? "لم يتم العثور على سورة أو آية مطابقة."
                    : "No matching Surah or Ayah found."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Swipe & Scroll UX Hint */}
      <div
        className={`w-full lg:hidden px-3 py-1.5 text-center text-[11px] font-medium border-b ${themeStyles.toolbarBg} ${themeStyles.mutedText}`}
      >
        {isAr
          ? "اقلب الصفحة لليسار للانتقال للصفحة التالية، ولليمين للسابقة · مرّر للأسفل للقراءة"
          : "Swipe left for next page, right for previous · Scroll down to read"}
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

      {/* Main Authentic Mushaf Sheet(s) with Mobile Swipe Left/Right */}
      <div
        data-testid="mushaf-swipe-surface"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`w-full p-2.5 sm:p-6 flex-1 flex flex-col justify-between touch-pan-y ${
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
                ? "grid gap-4 lg:grid-cols-2 items-stretch"
                : "w-full"
            }
          >
            <MushafPageSheet
              pageNumber={currentPage}
              verses={verses}
              fontSize={fontSize}
              themeStyles={themeStyles}
              selectedVerseKey={selectedVerse?.verseKey ?? null}
              highlightedVerseKey={highlightedVerseKey}
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
                highlightedVerseKey={highlightedVerseKey}
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
        className={`w-full px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-t rounded-b-2xl ${
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
