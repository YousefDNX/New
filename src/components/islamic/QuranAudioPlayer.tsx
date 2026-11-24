import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  QURAN_RECITER_COUNTRIES,
  AUTHENTIC_RECITERS,
  DIRECTORY_EXPANSION_STATUS,
  EXCLUDED_OR_SPECIAL_VERIFICATION_NOTES,
  filterAndSortCountries,
  filterAndSortReciters,
  formatVerifiedDuration,
  getAuthenticReciter,
  getAvailableSurahsForReciter,
  getCountryMeta,
  getCountryReciterCounts,
  getDirectorySummaryStats,
  getRecordingsForReciterSurah,
  getSurahHighlight,
  matchesAllSearchTokens,
  normalizeReciterSearchText,
  searchGlobalRecitationDirectory,
  type GlobalCountryCode,
  type AuthenticReciter,
  type VerifiedRecordingEdition,
} from "@/lib/quran-reciters";
import { SURAHS_INDEX, type SurahPageEntry } from "@/lib/quran-mushaf";
import { formatAudioTime } from "@/lib/quran";
import {
  QuranAudioProvider,
  useOptionalQuranAudio,
  useQuranAudio,
} from "@/contexts/QuranAudioContext";
import { SurahBrowserPanel } from "./SurahBrowserPanel";
import { ModernSelect } from "@/components/ui/modern-select";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Compass,
  Disc,
  Edit3,
  ExternalLink,
  Globe,
  Heart,
  History,
  Info,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  EMOTIONAL_STYLES_META,
  TRADITIONAL_FORMATS_META,
  VERIFIED_RECITER_SIGNATURES,
  VOCAL_QUALITIES_META,
  getEffectiveRecordingClassification,
  getRecitationStyleSummaryStats,
  getRecordingStyleSearchText,
  getStyleMetadataForReciter,
  loadUserStyleOverrides,
  recordingMatchesStyle,
  saveUserStyleOverrides,
  type RecitationEmotionalStyle,
  type RecitationVocalQuality,
  type TraditionalRecitationFormat,
  type RecordingStyleClassification,
} from "@/lib/quran-recitation-styles";

type DirectoryViewTab = "countries" | "surahs" | "styles" | "search" | "discover" | "library";

interface QuranAudioPlayerProps {
  initialSurahId?: number;
  initialReciterId?: string;
  initialRecordingId?: string;
  initialCountryCode?: GlobalCountryCode;
  lang?: string;
}

export const QuranAudioPlayer: React.FC<QuranAudioPlayerProps> = (props) => {
  const existingCtx = useOptionalQuranAudio();
  if (existingCtx) {
    return <QuranAudioPlayerInner {...props} />;
  }
  return (
    <QuranAudioProvider
      {...(props.initialReciterId !== undefined
        ? { initialReciterId: props.initialReciterId }
        : {})}
      {...(props.initialSurahId !== undefined ? { initialSurahId: props.initialSurahId } : {})}
      {...(props.initialRecordingId !== undefined
        ? { initialRecordingId: props.initialRecordingId }
        : {})}
    >
      <QuranAudioPlayerInner {...props} />
    </QuranAudioProvider>
  );
};

const QuranAudioPlayerInner: React.FC<QuranAudioPlayerProps> = ({
  initialSurahId = 1,
  initialReciterId = "al-luhaidan",
  initialRecordingId,
  initialCountryCode,
  lang = "ar",
}) => {
  const isAr = lang === "ar";
  const audioCtx = useQuranAudio();

  const [viewTab, setViewTab] = useState<DirectoryViewTab>("countries");
  const [directoryStep, setDirectoryStep] = useState<"country_grid" | "country_detail">(
    initialCountryCode ||
      initialReciterId !== "al-luhaidan" ||
      initialRecordingId ||
      audioCtx.hasStartedSession
      ? "country_detail"
      : "country_grid",
  );
  const [selectedCountry, setSelectedCountry] = useState<GlobalCountryCode>(
    initialCountryCode ??
      (audioCtx.hasStartedSession
        ? audioCtx.activeReciter.countryCode
        : getAuthenticReciter(initialReciterId).countryCode),
  );

  // Filters & sorting
  const [countrySearch, setCountrySearch] = useState("");
  const [withinCountrySearch, setWithinCountrySearch] = useState("");
  const [featuredOnlyInCountry, setFeaturedOnlyInCountry] = useState(false);
  const [countrySort, setCountrySort] = useState<"featured" | "name_ar" | "name_en" | "recordings">(
    "featured",
  );
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [surahFilter, setSurahFilter] = useState("");
  const [showAllDirectoryInfo, setShowAllDirectoryInfo] = useState(false);

  // Recitation Styles & Vocal Characteristics Discovery
  const [styleCategoryFilter, setStyleCategoryFilter] = useState<
    "all" | "emotional" | "vocal" | "format" | "signature"
  >("all");
  const [selectedStyleTag, setSelectedStyleTag] = useState<string>("all");
  const [styleQuery, setStyleQuery] = useState("");
  const [userStyleOverrides, setUserStyleOverrides] = useState<
    Record<string, Partial<RecordingStyleClassification>>
  >(() => loadUserStyleOverrides());
  const [reviewingRecording, setReviewingRecording] = useState<RecordingStyleClassification | null>(
    null,
  );
  const [activeReciterStyleFilter, setActiveReciterStyleFilter] = useState<string>("all");

  // Track external prop changes (e.g. deep-links from Tafsir or Unified Search) without clobbering active background playback on re-mount
  const prevPropsRef = useRef({
    initialSurahId,
    initialReciterId,
    initialRecordingId,
    initialCountryCode,
  });
  const didInitialSyncRef = useRef(false);

  useEffect(() => {
    const prev = prevPropsRef.current;
    const changed =
      prev.initialSurahId !== initialSurahId ||
      prev.initialReciterId !== initialReciterId ||
      prev.initialRecordingId !== initialRecordingId ||
      prev.initialCountryCode !== initialCountryCode;

    if (changed) {
      prevPropsRef.current = {
        initialSurahId,
        initialReciterId,
        initialRecordingId,
        initialCountryCode,
      };
      const nextReciter = getAuthenticReciter(initialReciterId);
      setSelectedCountry(initialCountryCode ?? nextReciter.countryCode);
      setActiveReciterStyleFilter("all");
      audioCtx.loadTrack({
        reciterId: initialReciterId,
        surahId: initialSurahId,
        ...(initialRecordingId !== undefined ? { recordingId: initialRecordingId } : {}),
        autoPlay: false,
      });
      didInitialSyncRef.current = true;
    } else if (!didInitialSyncRef.current) {
      didInitialSyncRef.current = true;
      if (!audioCtx.hasStartedSession) {
        const targetReciter = getAuthenticReciter(initialReciterId);
        const needsSync =
          audioCtx.track.reciterId !== targetReciter.id ||
          audioCtx.track.surahId !== initialSurahId ||
          (initialRecordingId && audioCtx.track.recordingId !== initialRecordingId);
        if (needsSync) {
          audioCtx.loadTrack({
            reciterId: initialReciterId,
            surahId: initialSurahId,
            ...(initialRecordingId !== undefined ? { recordingId: initialRecordingId } : {}),
            autoPlay: false,
          });
        }
      }
    }
  }, [initialReciterId, initialRecordingId, initialSurahId, initialCountryCode, audioCtx]);

  const selectedReciter = audioCtx.activeReciter;
  const selectedSurah = audioCtx.track.surahId;
  const surahRecordings = audioCtx.surahRecordings;
  const activeRecording = audioCtx.activeRecording;
  const availableSurahsForReciter = audioCtx.availableSurahs;
  const currentSurahMeta: SurahPageEntry = audioCtx.activeSurah;

  const userState = audioCtx.userState;
  const isPlaying = audioCtx.isPlaying;
  const isLoading = audioCtx.isLoading;
  const currentTime = audioCtx.currentTime;
  const duration = audioCtx.duration;
  const volume = audioCtx.volume;
  const isMuted = audioCtx.isMuted;
  const isLooping = audioCtx.isLooping;
  const audioError = audioCtx.audioError
    ? isAr
      ? audioCtx.audioError.messageAr
      : audioCtx.audioError.messageEn
    : null;

  const styleStats = useMemo(
    () => getRecitationStyleSummaryStats(userStyleOverrides),
    [userStyleOverrides],
  );

  const reciterStyleMeta = useMemo(
    () =>
      getStyleMetadataForReciter(
        selectedReciter.id,
        selectedReciter.recordings.map((ed) => ed.recordingId),
        userStyleOverrides,
      ),
    [selectedReciter, userStyleOverrides],
  );

  const allDirectoryClassifiedRecordings = useMemo(() => {
    const list: Array<{
      classification: RecordingStyleClassification;
      reciter: AuthenticReciter;
      recording: VerifiedRecordingEdition;
    }> = [];

    for (const rec of AUTHENTIC_RECITERS) {
      for (const ed of rec.recordings) {
        const cls = getEffectiveRecordingClassification(ed.recordingId, userStyleOverrides);
        if (cls) {
          list.push({ classification: cls, reciter: rec, recording: ed });
        }
      }
    }
    return list;
  }, [userStyleOverrides]);

  const filteredStyleRecordings = useMemo(() => {
    return allDirectoryClassifiedRecordings.filter((item) => {
      if (selectedStyleTag !== "all") {
        if (
          styleCategoryFilter === "emotional" &&
          !item.classification.emotionalStyles.includes(
            selectedStyleTag as RecitationEmotionalStyle,
          )
        ) {
          return false;
        }
        if (
          styleCategoryFilter === "vocal" &&
          !item.classification.vocalQualities.includes(selectedStyleTag as RecitationVocalQuality)
        ) {
          return false;
        }
        if (styleCategoryFilter === "format" && item.classification.format !== selectedStyleTag) {
          return false;
        }
        if (
          styleCategoryFilter === "signature" &&
          !item.classification.signatures.includes(selectedStyleTag)
        ) {
          return false;
        }
      }

      // 2. Query text search
      if (styleQuery.trim()) {
        const criteria = { query: styleQuery };
        if (!recordingMatchesStyle(item.classification, criteria)) {
          const q = normalizeReciterSearchText(styleQuery);
          if (!matchesAllSearchTokens(`${item.reciter.nameAr} ${item.reciter.nameEn}`, q)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [allDirectoryClassifiedRecordings, selectedStyleTag, styleCategoryFilter, styleQuery]);

  const togglePlay = () => audioCtx.togglePlay();
  const handleSeek = (newSec: number) => audioCtx.seek(newSec);
  const setVolume = (v: number) => audioCtx.setVolume(v);
  const setIsMuted = (m: boolean) => audioCtx.setIsMuted(m);
  const setIsLooping = (l: boolean) => audioCtx.setIsLooping(l);

  const selectReciterAndLoad = (
    reciter: AuthenticReciter,
    surahOverride?: number,
    recId?: string,
    autoPlay?: boolean,
  ) => {
    setSelectedCountry(reciter.countryCode);
    setActiveReciterStyleFilter("all");
    const available = getAvailableSurahsForReciter(reciter);
    const targetSurah =
      surahOverride && available.includes(surahOverride)
        ? surahOverride
        : available.includes(selectedSurah)
          ? selectedSurah
          : (available[0] ?? 1);
    audioCtx.loadTrack({
      reciterId: reciter.id,
      surahId: targetSurah,
      ...(recId !== undefined ? { recordingId: recId } : {}),
      ...(autoPlay !== undefined ? { autoPlay } : {}),
    });
  };

  const playSpecialAlBaqarah = () => {
    const luhaidan = getAuthenticReciter("al-luhaidan");
    selectReciterAndLoad(luhaidan, 2, "al-luhaidan-mp3q-server8", true);
  };

  const playLuhaidanAlFurqan = (recordingId = "al-luhaidan-qa-select") => {
    const luhaidan = getAuthenticReciter("al-luhaidan");
    selectReciterAndLoad(luhaidan, 25, recordingId, true);
    setDirectoryStep("country_detail");
  };

  const countryCounts = useMemo(() => getCountryReciterCounts(), []);
  const dirStats = useMemo(() => getDirectorySummaryStats(), []);
  const filteredCountries = useMemo(() => filterAndSortCountries(countrySearch), [countrySearch]);
  const countryReciters = useMemo(
    () =>
      filterAndSortReciters({
        countryCode: selectedCountry,
        query: withinCountrySearch,
        featuredOnly: featuredOnlyInCountry,
        sortBy: countrySort,
      }),
    [selectedCountry, withinCountrySearch, featuredOnlyInCountry, countrySort],
  );

  const globalSearchHits = useMemo(
    () =>
      searchGlobalRecitationDirectory(globalSearchQuery, SURAHS_INDEX, (recordingId) =>
        getRecordingStyleSearchText(recordingId, userStyleOverrides),
      ),
    [globalSearchQuery, userStyleOverrides],
  );

  const featuredRecommendations = useMemo(
    () => AUTHENTIC_RECITERS.filter((r) => r.isFeatured).slice(0, 8),
    [],
  );

  const filteredSurahs = useMemo(() => {
    const q = surahFilter.trim().toLowerCase();
    return SURAHS_INDEX.filter((s) => {
      if (!q) return true;
      return (
        s.nameAr.includes(surahFilter) || s.nameEn.toLowerCase().includes(q) || String(s.id) === q
      );
    });
  }, [surahFilter]);

  const activeCountryMeta = getCountryMeta(selectedCountry);
  const isReciterFav = userState.favoriteReciterIds.includes(selectedReciter.id);
  const activeRecFavKey = `${selectedReciter.id}:${activeRecording.recordingId}:${selectedSurah}`;
  const isActiveRecordingFav = userState.favoriteRecordingKeys.includes(activeRecFavKey);
  const latestHistory = userState.listeningHistory[0] ?? null;

  return (
    <div
      className="w-full flex flex-col gap-6"
      dir={isAr ? "rtl" : "ltr"}
      data-testid="quran-reciters-directory"
    >
      {/* PRIMARY STREAMLINED PLAYER: NOW PLAYING + 114-SURAH PICKER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Playback Control Deck */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                {isAr ? "التلاوة الحالية · ١.٠×" : "Now Playing · 1.0x Original Speed"}
              </span>
              <h4 className="text-lg sm:text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                {isAr ? `سورة ${currentSurahMeta.nameAr}` : `Surah ${currentSurahMeta.nameEn}`}
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                {isAr ? selectedReciter.nameAr : selectedReciter.nameEn} ·{" "}
                {isAr ? activeRecording.collectionTitleAr : activeRecording.collectionTitleEn}
              </p>
            </div>

            <div className="text-end text-[11px] text-stone-500 dark:text-stone-400 font-mono shrink-0 space-y-0.5">
              <div>
                {currentSurahMeta.revelationPlace === "madinah"
                  ? isAr
                    ? "مدنية"
                    : "Madinan"
                  : isAr
                    ? "مكية"
                    : "Makkan"}{" "}
                · {currentSurahMeta.versesCount} {isAr ? "آية" : "verses"}
              </div>
              <div>
                {isAr ? `صفحة ${currentSurahMeta.startPage}` : `Page ${currentSurahMeta.startPage}`}
              </div>
            </div>
          </div>

          {audioError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-xs flex flex-wrap items-center justify-between gap-2">
              <span>{audioError}</span>
              <button
                type="button"
                onClick={togglePlay}
                className="min-h-[36px] px-3 py-1 rounded-lg bg-red-600 text-white font-bold text-xs"
              >
                {isAr ? "إعادة المحاولة" : "Retry"}
              </button>
            </div>
          )}

          <div className="space-y-1.5">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-stone-200 dark:bg-stone-800 rounded-lg"
              aria-label={isAr ? "شريط تقدم التلاوة" : "Playback timeline"}
            />
            <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
              <span>{formatAudioTime(currentTime)}</span>
              <span>{formatAudioTime(duration)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsLooping(!isLooping)}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg border text-xs transition-colors ${
                  isLooping
                    ? "bg-emerald-50 text-emerald-700 border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300"
                    : "text-stone-500 border-stone-200 dark:border-stone-800 hover:bg-stone-100"
                }`}
                title={isAr ? "تكرار السورة" : "Loop Surah"}
                aria-label={isAr ? "تكرار السورة" : "Loop Surah"}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => audioCtx.toggleFavoriteRecording(activeRecFavKey)}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg border text-xs transition-colors ${
                  isActiveRecordingFav
                    ? "bg-rose-500/10 border-rose-500/40 text-rose-500"
                    : "text-stone-500 border-stone-200 dark:border-stone-800 hover:bg-stone-100"
                }`}
                aria-label={isAr ? "حفظ التلاوة الحالية في المفضلة" : "Favorite current recording"}
              >
                <Heart className={`w-4 h-4 ${isActiveRecordingFav ? "fill-current" : ""}`} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <button
                type="button"
                onClick={audioCtx.skipPrevSurah}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 p-2"
                aria-label={isAr ? "السورة السابقة" : "Previous Surah"}
                title={isAr ? "السورة السابقة" : "Previous Surah"}
              >
                <SkipBack className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
              </button>
              <button
                type="button"
                onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                className="min-h-[44px] px-2.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-mono"
                title={isAr ? "تأخير ١٠ ثوانٍ" : "Back 10s"}
              >
                -10s
              </button>

              <button
                type="button"
                onClick={togglePlay}
                disabled={isLoading}
                className="w-12 h-12 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
                aria-label={
                  isPlaying
                    ? isAr
                      ? "إيقاف التلاوة"
                      : "Pause recitation"
                    : isAr
                      ? "بدء التلاوة"
                      : "Play recitation"
                }
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSeek(Math.min(duration || 999999, currentTime + 10))}
                className="min-h-[44px] px-2.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-mono"
                title={isAr ? "تقديم ١٠ ثوانٍ" : "Forward 10s"}
              >
                +10s
              </button>
              <button
                type="button"
                onClick={audioCtx.skipNextSurah}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 p-2"
                aria-label={isAr ? "السورة التالية" : "Next Surah"}
                title={isAr ? "السورة التالية" : "Next Surah"}
              >
                <SkipForward className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 p-1"
                aria-label={
                  isMuted ? (isAr ? "إلغاء كتم الصوت" : "Unmute") : isAr ? "كتم الصوت" : "Mute"
                }
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-500" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-20 accent-emerald-600 h-1.5 cursor-pointer"
                aria-label={isAr ? "مستوى الصوت" : "Volume"}
              />
            </div>
          </div>

          <div className="text-[11px] text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800 pt-2.5 flex flex-wrap items-center justify-between gap-2">
            <span>{isAr ? activeRecording.attributionAr : activeRecording.attributionEn}</span>
            <span className="font-medium text-stone-700 dark:text-stone-300">
              {isAr ? selectedReciter.primaryRiwayahAr : selectedReciter.primaryRiwayahEn}
            </span>
          </div>
        </div>

        {/* Clean Surah Selector */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col h-[340px]">
          <div className="flex items-center justify-between pb-2.5 border-b border-stone-100 dark:border-stone-800">
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Disc className="w-4 h-4 text-emerald-600" />
              <span>
                {isAr
                  ? `السور (${availableSurahsForReciter.length}/١١٤)`
                  : `Surahs (${availableSurahsForReciter.length}/114)`}
              </span>
            </span>
            <span className="text-[11px] text-stone-400 font-mono">{filteredSurahs.length}</span>
          </div>

          <div className="py-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute start-2.5 top-3 text-stone-400" />
              <input
                type="text"
                placeholder={isAr ? "ابحث عن سورة..." : "Search surah..."}
                value={surahFilter}
                onChange={(e) => setSurahFilter(e.target.value)}
                className="w-full min-h-[40px] ps-8 pe-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pe-0.5">
            {filteredSurahs.map((s) => {
              const isSelected = selectedSurah === s.id;
              const isAvailable = availableSurahsForReciter.includes(s.id);
              const surahEds = getRecordingsForReciterSurah(selectedReciter.id, s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => audioCtx.selectSurah(s.id)}
                  className={`w-full min-h-[40px] flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                    !isAvailable
                      ? "opacity-45 cursor-not-allowed text-stone-400 dark:text-stone-600"
                      : isSelected
                        ? "bg-emerald-600 text-white font-bold"
                        : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono shrink-0 ${
                        isSelected
                          ? "bg-emerald-700 text-white"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                      }`}
                    >
                      {s.id}
                    </span>
                    <span className="truncate">{isAr ? `سورة ${s.nameAr}` : s.nameEn}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono shrink-0">
                    {isAvailable && surahEds.length > 1 && (
                      <span
                        className={
                          isSelected ? "text-emerald-100" : "text-emerald-700 dark:text-emerald-400"
                        }
                      >
                        {surahEds.length}×
                      </span>
                    )}
                    <span className={isSelected ? "text-emerald-100" : "text-stone-400"}>
                      {isAvailable ? `${s.versesCount}` : "—"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Continue Listening Quick Bar (only if history exists) */}
      {latestHistory && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-2 text-xs">
          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-200 min-w-0">
            <History className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">
              <strong>{isAr ? "متابعة:" : "Resume:"}</strong>{" "}
              {(() => {
                const hReciter = getAuthenticReciter(latestHistory.reciterId);
                const hSurah = SURAHS_INDEX.find((s) => s.id === latestHistory.surahId);
                return isAr
                  ? `${hReciter.nameAr} — سورة ${hSurah?.nameAr ?? latestHistory.surahId}`
                  : `${hReciter.nameEn} — Surah ${hSurah?.nameEn ?? latestHistory.surahId}`;
              })()}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const hReciter = getAuthenticReciter(latestHistory.reciterId);
              selectReciterAndLoad(hReciter, latestHistory.surahId, latestHistory.recordingId);
              setDirectoryStep("country_detail");
              setViewTab("countries");
            }}
            className="min-h-[36px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline whitespace-nowrap"
          >
            {isAr ? "تشغيل" : "Open"}
          </button>
        </div>
      )}

      {/* Compact Directory Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              {
                id: "countries",
                labelAr: `الدول (${dirStats.totalCountries})`,
                labelEn: `Countries (${dirStats.totalCountries})`,
                icon: Globe,
              },
              {
                id: "surahs",
                labelAr: "السور (١١٤)",
                labelEn: "Surahs (114)",
                icon: BookOpen,
              },
              {
                id: "styles",
                labelAr: `الأنماط الصوتية (${styleStats.totalClassifiedRecordings})`,
                labelEn: `Styles (${styleStats.totalClassifiedRecordings})`,
                icon: Sparkles,
              },
              {
                id: "search",
                labelAr: "بحث",
                labelEn: "Search",
                icon: Search,
              },
              {
                id: "discover",
                labelAr: "مختارات",
                labelEn: "Featured",
                icon: Compass,
              },
              {
                id: "library",
                labelAr: `المفضلة (${userState.favoriteReciterIds.length})`,
                labelEn: `Library (${userState.favoriteReciterIds.length})`,
                icon: Heart,
              },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = viewTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                data-testid={`quran-tab-${t.id}`}
                onClick={() => setViewTab(t.id)}
                className={`min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isAr ? t.labelAr : t.labelEn}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowAllDirectoryInfo((v) => !v)}
          className="min-h-[40px] inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-300 whitespace-nowrap"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{isAr ? "توثيق المصادر" : "Verification Info"}</span>
        </button>
      </div>

      {/* Collapsible Verification & Sanctity Disclosure */}
      {showAllDirectoryInfo && (
        <div
          className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/70 p-4 space-y-4 text-xs"
          data-testid="directory-verification-disclosure"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isAr
                  ? `${dirStats.totalCountries} دولة موثقة · ${dirStats.totalReciters} قارئاً · ${dirStats.totalRecordings} تسجيلاً — أصوات بشرية أصلية بسرعة ١.٠× فقط`
                  : `${dirStats.totalCountries} countries · ${dirStats.totalReciters} reciters · ${dirStats.totalRecordings} archives — Human recitations only, strict 1.0x speed`}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-stone-900 dark:text-stone-100">
              {isAr
                ? "تصنيف البلدان والتحقق المصدري"
                : "Accurate Country Classification & Verification Status"}
            </h4>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              {isAr
                ? "نفرّق بدقة بين الجنسية ومحل الميلاد وبلد الإقامة والبلد المرتبط بالتلاوة. لا نُدرج أي دولة أو قارئ بروابط غير متحقق منها."
                : "We explicitly distinguish Nationality, Birthplace, Residence, and Associated Country. No country or reciter profile is invented without verified direct audio URLs."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {EXCLUDED_OR_SPECIAL_VERIFICATION_NOTES.map((note) => (
              <div
                key={note.id}
                className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-3 space-y-1"
              >
                <div className="font-bold text-stone-900 dark:text-stone-100">
                  {isAr ? note.nameAr : note.nameEn}
                </div>
                <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  {isAr ? note.countryAr : note.countryEn}
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                  {isAr ? note.reasonAr : note.reasonEn}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 pt-1 border-t border-stone-200 dark:border-stone-800">
            <div className="font-bold text-stone-800 dark:text-stone-200">
              {isAr
                ? "دول قيد الانتظار (مستبعدة مؤقتاً لعدم توفر أرشيف صوتي مباشر موثق):"
                : "Expandable Countries Awaiting Verified Direct Audio Feeds (Omitted Without Fabrication):"}
            </div>
            <div className="flex flex-wrap gap-2">
              {DIRECTORY_EXPANSION_STATUS.map((item) => (
                <div
                  key={item.code}
                  className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 px-2.5 py-1.5 text-[11px]"
                >
                  <span className="font-bold">
                    {item.flagEmoji} {isAr ? item.nameAr : item.nameEn}
                  </span>
                  <span className="text-stone-500 dark:text-stone-400">
                    {" — "}
                    {isAr ? item.reasonAr : item.reasonEn}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: COUNTRY BROWSER & COUNTRY DETAIL VIEW */}
      {viewTab === "countries" && (
        <div className="space-y-5">
          {directoryStep === "country_grid" ? (
            <div className="space-y-4" data-testid="country-browser-grid">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {isAr ? "تصفح القرّاء حسب الدولة" : "Browse Verified Reciters by Country"}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {isAr
                      ? "اختر دولة لعرض القرّاء المعتمدين والمصاحف والروايات المتاحة."
                      : "Select any country below to explore verified reciters, editions, and biographies."}
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute start-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    placeholder={
                      isAr
                        ? "ابحث عن دولة (الكويت، مصر، المغرب...)"
                        : "Filter countries (Kuwait, Egypt, Morocco...)"
                    }
                    className="w-full ps-9 pe-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredCountries.map((c) => {
                  const recCount = countryCounts[c.code] ?? 0;
                  const isActive = selectedCountry === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      data-testid={`country-card-${c.code}`}
                      onClick={() => {
                        setSelectedCountry(c.code);
                        setDirectoryStep("country_detail");
                        setWithinCountrySearch("");
                        const firstRec = filterAndSortReciters({ countryCode: c.code })[0];
                        if (firstRec && selectedReciter.countryCode !== c.code) {
                          selectReciterAndLoad(firstRec);
                        }
                      }}
                      className={`group flex flex-col justify-between gap-2 p-4 rounded-2xl border text-start transition-all ${
                        isActive
                          ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-emerald-400 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl select-none" aria-hidden="true">
                            {c.flagEmoji}
                          </span>
                          <div>
                            <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                              {isAr ? c.nameAr : c.nameEn}
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-stone-400">
                              {isAr ? c.nameEn : c.nameAr}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                          {recCount}{" "}
                          {isAr
                            ? recCount === 1
                              ? "قارئ"
                              : "قرّاء"
                            : recCount === 1
                              ? "reciter"
                              : "reciters"}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                        {isAr ? c.descriptionAr : c.descriptionEn}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* DEDICATED COUNTRY RECITERS PAGE */
            <div className="space-y-4" data-testid="country-detail-view">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDirectoryStep("country_grid")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 whitespace-nowrap"
                  >
                    {isAr ? (
                      <ArrowRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowLeft className="w-3.5 h-3.5" />
                    )}
                    <span>{isAr ? "عودة لقائمة الدول" : "Back to Countries"}</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeCountryMeta.flagEmoji}</span>
                    <div>
                      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                        {isAr ? activeCountryMeta.nameAr : activeCountryMeta.nameEn}
                      </h3>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        {isAr ? activeCountryMeta.descriptionAr : activeCountryMeta.descriptionEn}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search, Featured & Sort inside country */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute start-2.5 top-3 text-stone-400" />
                    <input
                      type="text"
                      value={withinCountrySearch}
                      onChange={(e) => setWithinCountrySearch(e.target.value)}
                      placeholder={isAr ? "بحث داخل الدولة..." : "Filter reciters..."}
                      className="min-h-[40px] ps-8 pe-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 w-44"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeaturedOnlyInCountry((v) => !v)}
                    className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap ${
                      featuredOnlyInCountry
                        ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300"
                        : "border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300"
                    }`}
                  >
                    {isAr ? "المميزون فقط" : "Featured Only"}
                  </button>
                  <ModernSelect
                    value={countrySort}
                    onValueChange={(val) => setCountrySort(val as typeof countrySort)}
                    ariaLabel={isAr ? "ترتيب القراء" : "Sort reciters"}
                    size="sm"
                    className="w-40"
                    options={[
                      { value: "featured", label: isAr ? "الأبرز أولاً" : "Featured First" },
                      {
                        value: isAr ? "name_ar" : "name_en",
                        label: isAr ? "أبجدي (أ–ي)" : "Alphabetical (A–Z)",
                      },
                      { value: "recordings", label: isAr ? "الأكثر إصدارات" : "Most Editions" },
                    ]}
                  />
                </div>
              </div>

              {/* Reciters Cards inside Selected Country */}
              {countryReciters.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 text-xs text-stone-500">
                  {isAr
                    ? "لا توجد نتائج مطابقة للبحث داخل هذه الدولة."
                    : "No reciters match this filter inside the selected country."}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {countryReciters.map((r) => {
                    const isSelected = selectedReciter.id === r.id;
                    const fav = userState.favoriteReciterIds.includes(r.id);
                    const totalAvailableSurahs = getAvailableSurahsForReciter(r).length;
                    return (
                      <div
                        key={r.id}
                        data-testid={`reciter-card-${r.id}`}
                        className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                            : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 hover:border-emerald-400"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => selectReciterAndLoad(r)}
                            className="text-start flex-1 space-y-1"
                          >
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm">
                                {isAr ? r.nameAr : r.nameEn}
                              </span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                            </div>
                            <div
                              className={`text-[11px] line-clamp-1 ${
                                isSelected
                                  ? "text-emerald-100"
                                  : "text-stone-500 dark:text-stone-400"
                              }`}
                            >
                              {isAr ? r.nameEn : r.nameAr}
                            </div>
                            <div
                              className={`text-xs line-clamp-2 ${
                                isSelected
                                  ? "text-emerald-50"
                                  : "text-stone-600 dark:text-stone-300"
                              }`}
                            >
                              {isAr ? r.titleAr : r.titleEn}
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => audioCtx.toggleFavoriteReciter(r.id)}
                            aria-label={isAr ? "تفضيل القارئ" : "Favorite reciter"}
                            className={`min-h-[40px] min-w-[40px] flex items-center justify-center p-1.5 rounded-lg transition-colors ${
                              isSelected
                                ? "hover:bg-emerald-700 text-white"
                                : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400"
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 ${fav ? "fill-rose-500 text-rose-500" : ""}`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-current/15 text-[11px]">
                          <span className="min-w-0 truncate">
                            {isAr ? r.primaryRiwayahAr : r.primaryRiwayahEn}
                          </span>
                          <span className="tabular-nums shrink-0 whitespace-nowrap">
                            {r.recordings.length}{" "}
                            {isAr
                              ? r.recordings.length === 1
                                ? "تسجيل"
                                : "تسجيلات"
                              : r.recordings.length === 1
                                ? "edition"
                                : "editions"}
                            {" · "}
                            {totalAvailableSurahs}/114
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 1B: SURAH-FIRST BROWSER (114 SURAHS -> RECITERS -> MULTIPLE RECORDINGS) */}
      {viewTab === "surahs" && (
        <SurahBrowserPanel
          isAr={isAr}
          initialSurahId={selectedSurah === 1 ? 25 : selectedSurah}
          activeReciterId={selectedReciter.id}
          activeRecordingId={activeRecording.recordingId}
          activeSurahId={selectedSurah}
          isPlaying={isPlaying}
          userStyleOverrides={userStyleOverrides}
          onSelectAndPlay={(reciter, surahId, recordingId, autoPlay) => {
            selectReciterAndLoad(reciter, surahId, recordingId, autoPlay);
          }}
          onOpenReciterProfile={(reciter, surahId, recordingId) => {
            selectReciterAndLoad(reciter, surahId, recordingId, false);
            setDirectoryStep("country_detail");
            setViewTab("countries");
          }}
        />
      )}

      {/* TAB 2: RECITATION STYLES & DISTINCTIVE SIGNATURES DISCOVERY */}
      {viewTab === "styles" && (
        <div className="space-y-5" data-testid="recitation-styles-explorer">
          {/* Header Banner */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isAr
                      ? "دليل الأنماط الصوتية والبصمات المميزة"
                      : "Recitation Styles, Vocal Qualities & Reciter Signatures"}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-serif">
                  {isAr
                    ? "استكشاف التلاوات وفق الخصائص الصوتية والوجدانية"
                    : "Discover Recitations by Vocal Signatures & Emotional Character"}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
                  {isAr
                    ? "نظام استكشاف يفرّق بين الأنماط التراثية الرسمية (مرتل ومجود)، والصفات الوجدانية (خشوع وباكية)، والخامات الصوتية (رخيمة وجهورية)، والبصمات المميزة للقرّاء."
                    : "Structured discovery distinguishing traditional liturgical formats (Murattal, Mujawwad), spiritual qualities (Khushu', tearful), vocal traits, and verified reciter signatures."}
                </p>
              </div>

              {/* Quick Search across Styles */}
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="w-4 h-4 absolute start-3 top-3 text-stone-400" />
                <input
                  type="text"
                  value={styleQuery}
                  onChange={(e) => setStyleQuery(e.target.value)}
                  placeholder={
                    isAr
                      ? "ابحث بنمط: خاشعة، باكية، جهوري، اللحيدان..."
                      : "Filter: tearful, khushu, resonant, Al-Luhaidan..."
                  }
                  className="w-full min-h-[42px] ps-9 pe-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Category Filter Segments */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
              {(
                [
                  { id: "all", labelAr: "كل الأنماط", labelEn: "All Classifications" },
                  {
                    id: "signature",
                    labelAr: "البصمات المميزة لكبار القرّاء",
                    labelEn: "Reciter Signatures",
                  },
                  {
                    id: "emotional",
                    labelAr: "الأنماط الوجدانية والخشوع",
                    labelEn: "Spiritual & Emotional",
                  },
                  {
                    id: "vocal",
                    labelAr: "الخامات الصوتية والأداء",
                    labelEn: "Vocal Delivery",
                  },
                  {
                    id: "format",
                    labelAr: "الأنماط التراثية المعتمدة",
                    labelEn: "Traditional Formats",
                  },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setStyleCategoryFilter(cat.id);
                    setSelectedStyleTag("all");
                  }}
                  className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    styleCategoryFilter === cat.id
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-700"
                  }`}
                >
                  {isAr ? cat.labelAr : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Structured Sub-options (Clean grouped selector, no rainbow pill cloud) */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedStyleTag("all")}
                  className={`min-h-[36px] px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    selectedStyleTag === "all"
                      ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                  }`}
                >
                  {isAr ? "عرض كل التصنيفات" : "Show All"}
                </button>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 tabular-nums">
                  {filteredStyleRecordings.length} {isAr ? "تسجيل مطابق" : "matching editions"}
                </span>
              </div>

              {styleCategoryFilter === "all" && (
                <div className="space-y-2 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/30 p-3">
                  <div>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      {isAr ? "البصمات الصوتية المميزة" : "Distinctive Reciter Signatures"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.values(VERIFIED_RECITER_SIGNATURES).map((sig) => (
                        <button
                          key={`all-${sig.id}`}
                          type="button"
                          data-testid={`style-chip-${sig.id}`}
                          onClick={() => {
                            setStyleCategoryFilter("signature");
                            setSelectedStyleTag(sig.id);
                          }}
                          className="min-h-[36px] px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300"
                        >
                          {isAr ? sig.nameAr : sig.nameEn}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-stone-200/70 dark:border-stone-800 pt-2">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      {isAr ? "الصفات الوجدانية والخشوع" : "Spiritual & Emotional Qualities"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.values(EMOTIONAL_STYLES_META).map((em) => (
                        <button
                          key={`all-${em.id}`}
                          type="button"
                          data-testid={`style-chip-${em.id}`}
                          onClick={() => {
                            setStyleCategoryFilter("emotional");
                            setSelectedStyleTag(em.id);
                          }}
                          className="min-h-[36px] px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                        >
                          {isAr ? em.nameAr : em.nameEn}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {styleCategoryFilter === "signature" && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.values(VERIFIED_RECITER_SIGNATURES).map((sig) => (
                    <button
                      key={sig.id}
                      type="button"
                      onClick={() => setSelectedStyleTag(sig.id)}
                      className={`min-h-[36px] px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors border ${
                        selectedStyleTag === sig.id
                          ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-500"
                      }`}
                    >
                      {isAr ? sig.nameAr : sig.nameEn}
                    </button>
                  ))}
                </div>
              )}

              {styleCategoryFilter === "emotional" && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.values(EMOTIONAL_STYLES_META).map((em) => (
                    <button
                      key={em.id}
                      type="button"
                      onClick={() => setSelectedStyleTag(em.id)}
                      className={`min-h-[36px] px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors border ${
                        selectedStyleTag === em.id
                          ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-500"
                      }`}
                    >
                      {isAr ? em.nameAr : em.nameEn}
                    </button>
                  ))}
                </div>
              )}

              {styleCategoryFilter === "vocal" && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.values(VOCAL_QUALITIES_META).map((vq) => (
                    <button
                      key={vq.id}
                      type="button"
                      onClick={() => setSelectedStyleTag(vq.id)}
                      className={`min-h-[36px] px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors border ${
                        selectedStyleTag === vq.id
                          ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-500"
                      }`}
                    >
                      {isAr ? vq.nameAr : vq.nameEn}
                    </button>
                  ))}
                </div>
              )}

              {styleCategoryFilter === "format" && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.values(TRADITIONAL_FORMATS_META).map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setSelectedStyleTag(fmt.id)}
                      className={`min-h-[36px] px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors border ${
                        selectedStyleTag === fmt.id
                          ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-500"
                      }`}
                    >
                      {isAr ? fmt.nameAr : fmt.nameEn}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Results Grid of Matching Verified Recordings */}
          {filteredStyleRecordings.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 text-xs text-stone-500">
              {isAr
                ? "لا توجد تسجيلات مطابقة لهذا النمط أو البحث حالياً."
                : "No verified recordings match this style tag or filter."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStyleRecordings.map(({ classification, reciter, recording }) => {
                const isSelected =
                  selectedReciter.id === reciter.id &&
                  activeRecording.recordingId === recording.recordingId;
                const cMeta = getCountryMeta(reciter.countryCode);
                const formatMeta = TRADITIONAL_FORMATS_META[classification.format];
                const sigText = classification.signatures
                  .map((sigId) => {
                    const sig = VERIFIED_RECITER_SIGNATURES[sigId];
                    return sig ? (isAr ? sig.nameAr : sig.nameEn) : null;
                  })
                  .filter(Boolean)
                  .join(" · ");
                const traitsText = [
                  ...classification.emotionalStyles.map((emId) => {
                    const em = EMOTIONAL_STYLES_META[emId];
                    return em ? (isAr ? em.nameAr : em.nameEn) : null;
                  }),
                  ...classification.vocalQualities.map((vqId) => {
                    const vq = VOCAL_QUALITIES_META[vqId];
                    return vq ? (isAr ? vq.nameAr : vq.nameEn) : null;
                  }),
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <div
                    key={`${reciter.id}-${recording.recordingId}`}
                    data-testid={`style-recording-card-${recording.recordingId}`}
                    className={`rounded-xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                      isSelected
                        ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500"
                        : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-emerald-400"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xl shrink-0">{cMeta.flagEmoji}</span>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                              {isAr ? reciter.nameAr : reciter.nameEn}
                            </h4>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                              {isAr ? reciter.titleAr : reciter.titleEn}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                          {isAr ? formatMeta?.nameAr : formatMeta?.nameEn}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 pt-1">
                        {isAr ? recording.collectionTitleAr : recording.collectionTitleEn}
                      </div>

                      {/* Clean Signature & Style Summary Lines (replaces pill clutter) */}
                      {sigText && (
                        <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                          {sigText}
                        </div>
                      )}
                      {traitsText && (
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                          {traitsText}
                        </p>
                      )}

                      {/* Editorial Context */}
                      {(classification.editorialReviewNoteAr ||
                        classification.editorialReviewNoteEn) && (
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed bg-stone-50 dark:bg-stone-800/40 p-2.5 rounded-lg border border-stone-200/60 dark:border-stone-800">
                          {isAr
                            ? classification.editorialReviewNoteAr
                            : classification.editorialReviewNoteEn}
                        </p>
                      )}
                    </div>

                    {/* Action Deck */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          selectReciterAndLoad(reciter, undefined, recording.recordingId);
                          setViewTab("countries");
                          setDirectoryStep("country_detail");
                        }}
                        className="min-h-[36px] text-stone-600 dark:text-stone-300 hover:text-emerald-600 text-[11px] font-medium"
                      >
                        {isAr ? "ملف القارئ" : "View Profile"}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setReviewingRecording(classification)}
                          aria-label={
                            isAr
                              ? "مراجعة وتعديل التصنيف التحريري"
                              : "Review / Edit Style Classification"
                          }
                          title={
                            isAr
                              ? "مراجعة وتعديل التصنيف التحريري"
                              : "Review / Edit Style Classification"
                          }
                          className="min-h-[38px] min-w-[38px] flex items-center justify-center p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            selectReciterAndLoad(reciter, undefined, recording.recordingId, true);
                          }}
                          className="min-h-[40px] inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{isAr ? "استمع الآن (١.٠×)" : "Play (1.0x)"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GLOBAL RECITATION SEARCH */}
      {viewTab === "search" && (
        <div
          className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-4"
          data-testid="global-recitation-search"
        >
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {isAr
                ? "البحث الشامل في دليل القراء والتلاوات"
                : "Global Search Across Countries, Reciters, Surahs & Recordings"}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {isAr
                ? "ابحث باسم القارئ بالعربية أو الإنجليزية (مثل: النفيس، الحصري، المنشاوي، الكويت، البقرة، ورش...)"
                : "Search by Arabic or English name (e.g., Al-Nafis, Kuwait, Al-Husary, Al-Baqarah, Warsh, QuranicAudio)"}
            </p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute start-3 top-3 text-stone-400" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder={
                isAr
                  ? "اكتب اسم القارئ أو الدولة أو السورة أو الرواية..."
                  : "Type reciter name, country, surah, or riwayah..."
              }
              className="w-full ps-10 pe-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {globalSearchQuery.trim() && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto">
              {globalSearchHits.length === 0 ? (
                <div className="col-span-full p-6 text-center text-xs text-stone-500">
                  {isAr ? "لا توجد نتائج مطابقة لهذا البحث." : "No matching results found."}
                </div>
              ) : (
                globalSearchHits.map((hit) => (
                  <button
                    key={hit.id}
                    type="button"
                    onClick={() => {
                      if (hit.type === "country" && hit.countryCode) {
                        setSelectedCountry(hit.countryCode);
                        setDirectoryStep("country_detail");
                        setViewTab("countries");
                        const first = filterAndSortReciters({ countryCode: hit.countryCode })[0];
                        if (first) selectReciterAndLoad(first);
                      } else if (hit.reciterId) {
                        const r = getAuthenticReciter(hit.reciterId);
                        selectReciterAndLoad(r, hit.surahId, hit.recordingId);
                        setDirectoryStep("country_detail");
                        setViewTab("countries");
                      } else if (hit.type === "surah" && hit.surahId) {
                        audioCtx.selectSurah(hit.surahId);
                        setViewTab("countries");
                      }
                    }}
                    className="flex items-start justify-between gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-emerald-500 bg-stone-50/70 dark:bg-stone-800/40 text-start transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        {hit.type}
                      </div>
                      <div className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                        {isAr ? hit.titleAr : hit.titleEn}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                        {isAr ? hit.subtitleAr : hit.subtitleEn}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HONEST CURATED DISCOVERY & RECOMMENDATIONS */}
      {viewTab === "discover" && (
        <div
          className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-4"
          data-testid="reciter-discovery-panel"
        >
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {isAr
                ? "مختارات وتوصيات تعليمية موثقة"
                : "Verified Editorial Discovery & Multi-Riwayah Highlights"}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {isAr
                ? "معروضة بسبب قيمتها التعليمية وتعدد الروايات الموثقة — دون أي أرقام استماع وهمية أو تقييمات مصطنعة."
                : "Featured strictly on educational merit, verified multi-edition recordings, and classical Qira'at diversity — zero fabricated play counts."}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {featuredRecommendations.map((r) => {
              const c = getCountryMeta(r.countryCode);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    selectReciterAndLoad(r);
                    setDirectoryStep("country_detail");
                    setViewTab("countries");
                  }}
                  className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-emerald-500 bg-stone-50/70 dark:bg-stone-800/40 text-start flex flex-col justify-between gap-2 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      {c.flagEmoji} {isAr ? c.nameAr : c.nameEn}
                    </div>
                    <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      {isAr ? r.nameAr : r.nameEn}
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-2">
                      {isAr ? (r.selectionBasisAr ?? r.titleAr) : (r.selectionBasisEn ?? r.titleEn)}
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                    {r.recordings.length} {isAr ? "إصدارات متاحة" : "verified edition(s)"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: FAVORITES & LISTENING HISTORY */}
      {viewTab === "library" && (
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          data-testid="favorites-history-panel"
        >
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-3">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>
                {isAr
                  ? `المفضلة (${userState.favoriteReciterIds.length} قارئ · ${userState.favoriteRecordingKeys.length} تلاوة)`
                  : `Saved Favorites (${userState.favoriteReciterIds.length} reciters · ${userState.favoriteRecordingKeys.length} recordings)`}
              </span>
            </h3>
            {userState.favoriteReciterIds.length === 0 &&
            userState.favoriteRecordingKeys.length === 0 ? (
              <p className="text-xs text-stone-500 py-4">
                {isAr
                  ? "اضغط على أيقونة القلب بجانب أي قارئ أو تسجيل لحفظه هنا."
                  : "Click the heart button on any reciter card or recording edition to save it here."}
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userState.favoriteReciterIds.map((id) => {
                  const r = getAuthenticReciter(id);
                  const c = getCountryMeta(r.countryCode);
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          selectReciterAndLoad(r);
                          setDirectoryStep("country_detail");
                          setViewTab("countries");
                        }}
                        className="text-start font-bold text-stone-900 dark:text-stone-100 hover:underline"
                      >
                        {c.flagEmoji} {isAr ? r.nameAr : r.nameEn}
                      </button>
                      <button
                        type="button"
                        onClick={() => audioCtx.toggleFavoriteReciter(id)}
                        className="text-rose-500 text-[11px] font-semibold min-h-[36px] px-2"
                      >
                        {isAr ? "إزالة" : "Remove"}
                      </button>
                    </div>
                  );
                })}
                {userState.favoriteRecordingKeys.map((key) => {
                  const [rId, recId, sStr] = key.split(":");
                  const r = getAuthenticReciter(rId ?? "al-luhaidan");
                  const surahNum = Number(sStr ?? 1);
                  const sMeta = SURAHS_INDEX.find((s) => s.id === surahNum);
                  const ed = r.recordings.find((x) => x.recordingId === recId) ?? r.recordings[0]!;
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          selectReciterAndLoad(r, surahNum, recId);
                          setViewTab("countries");
                        }}
                        className="text-start"
                      >
                        <div className="font-bold text-stone-900 dark:text-stone-100">
                          {isAr
                            ? `سورة ${sMeta?.nameAr ?? surahNum} — ${r.nameAr}`
                            : `Surah ${sMeta?.nameEn ?? surahNum} — ${r.nameEn}`}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {isAr ? ed.collectionTitleAr : ed.collectionTitleEn}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => audioCtx.toggleFavoriteRecording(key)}
                        className="text-rose-500 text-[11px] font-semibold min-h-[36px] px-2"
                      >
                        {isAr ? "إزالة" : "Remove"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-3">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? "سجل الاستماع الأخير" : "Recent Listening History"}</span>
            </h3>
            {userState.listeningHistory.length === 0 ? (
              <p className="text-xs text-stone-500 py-4">
                {isAr
                  ? "سيُسجل هنا تاريخ تلاواتك التي شغّلتها لتعود إليها بسهولة."
                  : "Surahs and editions you play will appear here privately on your device."}
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userState.listeningHistory.slice(0, 12).map((item) => {
                  const r = getAuthenticReciter(item.reciterId);
                  const sMeta = SURAHS_INDEX.find((s) => s.id === item.surahId);
                  const ed =
                    r.recordings.find((x) => x.recordingId === item.recordingId) ??
                    r.recordings[0]!;
                  return (
                    <button
                      key={`${item.reciterId}-${item.recordingId}-${item.surahId}`}
                      type="button"
                      onClick={() => selectReciterAndLoad(r, item.surahId, item.recordingId)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-emerald-500 text-xs text-start"
                    >
                      <div>
                        <div className="font-bold text-stone-900 dark:text-stone-100">
                          {isAr
                            ? `سورة ${sMeta?.nameAr ?? item.surahId} — ${r.nameAr}`
                            : `Surah ${sMeta?.nameEn ?? item.surahId} — ${r.nameEn}`}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {isAr ? ed.collectionTitleAr : ed.collectionTitleEn}
                        </div>
                      </div>
                      <Play className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SELECTED RECITER RECORDINGS & PROFILE */}
      <div
        className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-4 shadow-sm"
        data-testid="active-reciter-profile"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg">
                {getCountryMeta(selectedReciter.countryCode).flagEmoji}
              </span>
              <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
                {isAr ? selectedReciter.nameAr : selectedReciter.nameEn}
              </h3>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                · {isAr ? selectedReciter.titleAr : selectedReciter.titleEn}
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {isAr ? selectedReciter.bioAr : selectedReciter.bioEn}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-500 dark:text-stone-400 pt-1">
              <span>
                {isAr ? "البلد المرتبط:" : "Associated country:"}{" "}
                <strong className="text-stone-800 dark:text-stone-200">
                  {isAr
                    ? selectedReciter.countryAssociation.associatedCountryAr
                    : selectedReciter.countryAssociation.associatedCountryEn}
                </strong>
              </span>
              <span>
                {availableSurahsForReciter.length}/114 {isAr ? "سورة" : "Surahs"} ·{" "}
                {selectedReciter.recordings.length} {isAr ? "تسجيل" : "edition(s)"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => audioCtx.toggleFavoriteReciter(selectedReciter.id)}
            className={`min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition-colors shrink-0 ${
              isReciterFav
                ? "bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400"
                : "border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isReciterFav ? "fill-current" : ""}`} />
            <span>
              {isReciterFav ? (isAr ? "قارئ مفضل" : "Favorited") : isAr ? "حفظ القارئ" : "Favorite"}
            </span>
          </button>
        </div>

        {/* Clean Single-Row Style Summary (No pill clutter) */}
        <div
          className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/30 p-3 space-y-2"
          data-testid="reciter-style-characteristics"
        >
          {!reciterStyleMeta.hasVerifiedClassifications ? (
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {isAr
                ? "لا توجد ملاحظات أسلوبية إضافية لهذا القارئ."
                : "No extra vocal notes recorded for this reciter."}
            </p>
          ) : (
            <div className="space-y-2">
              {reciterStyleMeta.signatures.map((sig) => (
                <div
                  key={sig.id}
                  data-testid={`reciter-signature-banner-${sig.id}`}
                  className="text-xs space-y-1"
                >
                  <div className="font-bold text-stone-900 dark:text-stone-100">
                    {isAr ? sig.nameAr : sig.nameEn}
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                    {isAr ? sig.descriptionAr : sig.descriptionEn}
                  </p>
                </div>
              ))}

              <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
                <button
                  type="button"
                  onClick={() => setActiveReciterStyleFilter("all")}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                    activeReciterStyleFilter === "all"
                      ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                      : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300"
                  }`}
                >
                  {isAr ? "الكل" : "All"}
                </button>
                {reciterStyleMeta.formats.map((fmtId) => {
                  const meta = TRADITIONAL_FORMATS_META[fmtId];
                  const filterKey = `fmt:${fmtId}`;
                  return (
                    <button
                      key={filterKey}
                      type="button"
                      onClick={() =>
                        setActiveReciterStyleFilter((prev) =>
                          prev === filterKey ? "all" : filterKey,
                        )
                      }
                      className={`px-2 py-0.5 rounded-md border font-semibold transition-colors ${
                        activeReciterStyleFilter === filterKey
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      {isAr ? meta.nameAr : meta.nameEn}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ONE RECITER -> ONE SURAH -> MULTIPLE RECORDINGS SELECTOR */}
        <div className="space-y-2" data-testid="surah-recordings-list">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>
                {isAr
                  ? `التسجيلات المتوفرة لسورة ${currentSurahMeta.nameAr} (${surahRecordings.length})`
                  : `Recordings for Surah ${currentSurahMeta.nameEn} (${surahRecordings.length})`}
              </span>
            </div>
            {activeReciterStyleFilter !== "all" && (
              <button
                type="button"
                onClick={() => setActiveReciterStyleFilter("all")}
                className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
              >
                {isAr ? "إظهار الكل" : "Show all"}
              </button>
            )}
          </div>

          {(() => {
            const visibleSurahRecordings = surahRecordings.filter((ed) => {
              if (activeReciterStyleFilter === "all") return true;
              const cls = getEffectiveRecordingClassification(ed.recordingId, userStyleOverrides);
              if (!cls) return false;
              if (activeReciterStyleFilter.startsWith("fmt:")) {
                return cls.format === activeReciterStyleFilter.slice(4);
              }
              if (activeReciterStyleFilter.startsWith("em:")) {
                return cls.emotionalStyles.includes(
                  activeReciterStyleFilter.slice(3) as RecitationEmotionalStyle,
                );
              }
              return true;
            });

            if (visibleSurahRecordings.length === 0) {
              return (
                <div className="p-4 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 text-xs text-stone-500 flex items-center justify-between gap-2">
                  <span>
                    {isAr
                      ? "لا يوجد تسجيل مطابق لهذا الفلتر."
                      : "No recording matches this filter."}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveReciterStyleFilter("all")}
                    className="text-emerald-700 font-bold hover:underline shrink-0"
                  >
                    {isAr ? "إعادة ضبط" : "Reset"}
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {visibleSurahRecordings.map((ed) => {
                  const isEdActive = activeRecording.recordingId === ed.recordingId;
                  const edFavKey = `${selectedReciter.id}:${ed.recordingId}:${selectedSurah}`;
                  const isEdFav = userState.favoriteRecordingKeys.includes(edFavKey);
                  const cls = getEffectiveRecordingClassification(
                    ed.recordingId,
                    userStyleOverrides,
                  );
                  const fmtMeta = cls ? TRADITIONAL_FORMATS_META[cls.format] : null;
                  const durLabel = formatVerifiedDuration(
                    ed.surahDurationsSeconds?.[selectedSurah],
                  );
                  const surahHighlight = getSurahHighlight(ed, selectedSurah);
                  const inferDefaultFormat = (): TraditionalRecitationFormat => {
                    const low = ed.style.toLowerCase();
                    if (low.includes("mujawwad")) return "mujawwad";
                    if (low.includes("muallim") || low.includes("mu'allim")) return "muallim";
                    if (low.includes("archive")) return "archive";
                    return "murattal";
                  };
                  const styleSummary = cls
                    ? cls.emotionalStyles
                        .map((id) =>
                          isAr
                            ? EMOTIONAL_STYLES_META[id]?.nameAr
                            : EMOTIONAL_STYLES_META[id]?.nameEn,
                        )
                        .filter(Boolean)
                        .join(" · ")
                    : "";

                  return (
                    <div
                      key={ed.recordingId}
                      data-testid={`recording-option-${ed.recordingId}`}
                      className={`rounded-xl border p-3.5 flex items-start justify-between gap-2 transition-all ${
                        isEdActive
                          ? "bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-500 ring-1 ring-emerald-500"
                          : "bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 hover:border-emerald-400"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => audioCtx.selectRecordingId(ed.recordingId)}
                        className="text-start flex-1 space-y-1 min-w-0"
                      >
                        <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                          {isAr ? ed.collectionTitleAr : ed.collectionTitleEn}
                        </div>
                        <div className="text-[11px] text-stone-600 dark:text-stone-300">
                          {isAr ? ed.riwayahAr : ed.riwayahEn} ·{" "}
                          {fmtMeta ? (isAr ? fmtMeta.nameAr : fmtMeta.nameEn) : ed.style}
                          {durLabel ? ` · ${durLabel}` : ""}
                          {ed.verifiedDate ? ` · ${ed.verifiedDate}` : ""}
                        </div>
                        {styleSummary && (
                          <div className="text-[11px] text-stone-500 dark:text-stone-400">
                            {styleSummary}
                          </div>
                        )}
                        {surahHighlight && (
                          <div className="text-[11px] font-serif text-amber-800 dark:text-amber-300 pt-0.5">
                            ﴿{surahHighlight.verseArabicExcerpt}﴾ ({surahHighlight.verseRange})
                          </div>
                        )}
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          data-testid={`edit-style-${ed.recordingId}`}
                          onClick={() =>
                            setReviewingRecording(
                              cls ?? {
                                recordingId: ed.recordingId,
                                reciterId: selectedReciter.id,
                                format: inferDefaultFormat(),
                                emotionalStyles: [],
                                vocalQualities: [],
                                signatures: [],
                                editorialReviewNoteAr: "",
                                editorialReviewNoteEn: "",
                                verifiedByReviewer: true,
                              },
                            )
                          }
                          aria-label={isAr ? "تعديل التصنيف" : "Edit style classification"}
                          title={isAr ? "تعديل التصنيف" : "Review / Edit Classification"}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center p-1 text-stone-400 hover:text-emerald-600"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => audioCtx.toggleFavoriteRecording(edFavKey)}
                          aria-label={isAr ? "تفضيل التسجيل" : "Favorite recording"}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center p-1 text-stone-400 hover:text-rose-500"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${isEdFav ? "fill-rose-500 text-rose-500" : ""}`}
                          />
                        </button>
                        <a
                          href={ed.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={isAr ? "المصدر" : "Source"}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-400 hover:text-emerald-600"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Compact Quick-Play Bar for Featured Passages (Tucked calmly below primary workflow) */}
      <div
        data-testid="luhaidan-furqan-spotlight"
        className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs"
      >
        <div className="min-w-0">
          <span className="font-bold text-stone-900 dark:text-stone-100">
            {isAr
              ? "مقطع مختار: سورة الفرقان ﴿يُضَاعَفْ لَهُ الْعَذَابُ يَوْمَ الْقِيَامَةِ﴾ (٢٥:٦٨–٧٠)"
              : "Quick Listen: Surah Al-Furqan (25:68–70) & Al-Baqarah — Sheikh Al-Luhaidan"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => playLuhaidanAlFurqan("al-luhaidan-qa-select")}
            className="min-h-[36px] inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isAr ? "الفرقان (المحراب ٢٠:٢٤)" : "Al-Furqan (20:24)"}</span>
          </button>
          <button
            type="button"
            onClick={() => playLuhaidanAlFurqan("al-luhaidan-mp3q-server8")}
            className="min-h-[36px] inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 font-semibold text-xs text-stone-700 dark:text-stone-200"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isAr ? "الفرقان (مرتل ١٦:٢٠)" : "Murattal (16:20)"}</span>
          </button>
          <button
            type="button"
            onClick={playSpecialAlBaqarah}
            className="min-h-[36px] inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 font-semibold text-xs text-stone-700 dark:text-stone-200"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isAr ? "البقرة كاملة" : "Al-Baqarah"}</span>
          </button>
        </div>
      </div>

      {/* EDITORIAL STYLE REVIEW & CLASSIFICATION CORRECTION MODAL */}
      {reviewingRecording && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          data-testid="style-editorial-modal"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {isAr
                      ? "مراجعة وتحديث التصنيف الصوتي والأسلوبي"
                      : "Editorial Review — Recitation Style Classification"}
                  </h4>
                  <p className="text-[11px] font-mono text-stone-500">
                    {reviewingRecording.recordingId} · {reviewingRecording.reciterId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewingRecording(null)}
                aria-label={isAr ? "إغلاق" : "Close"}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Objective Traditional Format (Strictly Separated) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                {isAr
                  ? "١. النمط التراثي الرسمي (منفصل عن الانطباعات الوجدانية):"
                  : "1. Traditional Recitation Format (Kept distinct from emotional labels):"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {Object.values(TRADITIONAL_FORMATS_META).map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() =>
                      setReviewingRecording((prev) => (prev ? { ...prev, format: fmt.id } : null))
                    }
                    className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                      reviewingRecording.format === fmt.id
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    {isAr ? fmt.nameAr : fmt.nameEn}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Spiritual / Emotional Characteristics */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                {isAr
                  ? "٢. الخصائص الوجدانية والخشوع:"
                  : "2. Perceived Emotional & Spiritual Traits:"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {Object.values(EMOTIONAL_STYLES_META).map((em) => {
                  const selected = reviewingRecording.emotionalStyles.includes(em.id);
                  return (
                    <button
                      key={em.id}
                      type="button"
                      onClick={() =>
                        setReviewingRecording((prev) => {
                          if (!prev) return null;
                          const next = selected
                            ? prev.emotionalStyles.filter((x) => x !== em.id)
                            : [...prev.emotionalStyles, em.id];
                          return { ...prev, emotionalStyles: next };
                        })
                      }
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${
                        selected
                          ? "bg-indigo-700 text-white border-indigo-700"
                          : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" />}
                      <span>{isAr ? em.nameAr : em.nameEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Vocal & Acoustic Qualities */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                {isAr ? "٣. الصفات الصوتية والأداء:" : "3. Vocal & Acoustic Qualities:"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {Object.values(VOCAL_QUALITIES_META).map((vq) => {
                  const selected = reviewingRecording.vocalQualities.includes(vq.id);
                  return (
                    <button
                      key={vq.id}
                      type="button"
                      onClick={() =>
                        setReviewingRecording((prev) => {
                          if (!prev) return null;
                          const next = selected
                            ? prev.vocalQualities.filter((x) => x !== vq.id)
                            : [...prev.vocalQualities, vq.id];
                          return { ...prev, vocalQualities: next };
                        })
                      }
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${
                        selected
                          ? "bg-teal-700 text-white border-teal-700"
                          : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" />}
                      <span>{isAr ? vq.nameAr : vq.nameEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Editorial Review Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300 block">
                  {isAr ? "ملاحظة المراجع (عربي)" : "Reviewer Note (Arabic)"}
                </label>
                <textarea
                  rows={2}
                  value={reviewingRecording.editorialReviewNoteAr ?? ""}
                  onChange={(e) =>
                    setReviewingRecording((prev) =>
                      prev ? { ...prev, editorialReviewNoteAr: e.target.value } : null,
                    )
                  }
                  className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300 block">
                  {isAr ? "ملاحظة المراجع (إنجليزي)" : "Reviewer Note (English)"}
                </label>
                <textarea
                  rows={2}
                  value={reviewingRecording.editorialReviewNoteEn ?? ""}
                  onChange={(e) =>
                    setReviewingRecording((prev) =>
                      prev ? { ...prev, editorialReviewNoteEn: e.target.value } : null,
                    )
                  }
                  className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => {
                  const next = { ...userStyleOverrides };
                  delete next[reviewingRecording.recordingId];
                  saveUserStyleOverrides(next);
                  setUserStyleOverrides(next);
                  setReviewingRecording(null);
                }}
                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                {isAr ? "استعادة التصنيف الافتراضي" : "Reset to Baseline"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReviewingRecording(null)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  data-testid="save-style-editorial-btn"
                  onClick={() => {
                    const next = {
                      ...userStyleOverrides,
                      [reviewingRecording.recordingId]: {
                        ...reviewingRecording,
                        verifiedByReviewer: true,
                      },
                    };
                    saveUserStyleOverrides(next);
                    setUserStyleOverrides(next);
                    setReviewingRecording(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isAr ? "حفظ التصنيف" : "Save Classification"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
