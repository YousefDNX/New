import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Headphones,
  ListMusic,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Search,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useOptionalQuranAudio } from "@/contexts/QuranAudioContext";
import { AUTHENTIC_RECITERS, getAuthenticReciter } from "@/lib/quran-reciters";
import { SURAHS_INDEX } from "@/lib/quran-mushaf";
import { formatAudioTime, matchesSurahOrAyah } from "@/lib/quran";
import { ModernSelect } from "@/components/ui/modern-select";

interface QuranMiniPlayerProps {
  lang?: string;
  onOpenQuranPage?: () => void;
  className?: string;
}

export type MiniPlayerSize = "sm" | "md" | "lg";

const SURAH_LIST_OPEN_KEY = "btc_quran_player_surah_list_open_v1";
const MINI_PLAYER_DISMISSED_KEY = "btc_quran_player_dismissed_v1";
const MINI_PLAYER_SIZE_KEY = "btc_quran_player_size_v1";
const MINI_PLAYER_DOCKED_TAB_KEY = "btc_quran_player_docked_tab_v1";
const MINI_PLAYER_HIDDEN_KEY = "btc_quran_player_hidden_v1";

export const QuranMiniPlayer: React.FC<QuranMiniPlayerProps> = ({
  lang = "en",
  onOpenQuranPage,
  className = "",
}) => {
  const audio = useOptionalQuranAudio();
  const isAr = lang === "ar";

  const [isSurahListOpen, setIsSurahListOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const saved = window.localStorage.getItem(SURAH_LIST_OPEN_KEY);
      if (saved !== null) return saved === "true";
    } catch {
      // Ignore storage errors
    }
    return true;
  });

  // Size control: "sm" (compact), "md" (standard/default), "lg" (spacious)
  const [playerSize, setPlayerSize] = useState<MiniPlayerSize>(() => {
    if (typeof window === "undefined") return "md";
    try {
      const saved = window.localStorage.getItem(MINI_PLAYER_SIZE_KEY);
      if (saved === "sm" || saved === "md" || saved === "lg") return saved;
    } catch {
      // Ignore
    }
    return "md";
  });

  // Docked bottom tab mode ("مش إخفاء كامل — ظاهرة كأنها tab موجودة تحت ترجعلها تاني بضغطة")
  const [isDockedAsTab, setIsDockedAsTab] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = window.localStorage.getItem(MINI_PLAYER_DOCKED_TAB_KEY);
      if (saved !== null) return saved === "true";
      return window.localStorage.getItem(MINI_PLAYER_DISMISSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Complete hide mode (closes and hides mini player completely until user plays Quran again)
  const [isCompletelyHidden, setIsCompletelyHidden] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(MINI_PLAYER_HIDDEN_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [surahQuery, setSurahQuery] = useState("");

  // Persist open/collapsed state of the surah list
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(SURAH_LIST_OPEN_KEY, String(isSurahListOpen));
    } catch {
      // Ignore storage errors
    }
  }, [isSurahListOpen]);

  // Persist size preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(MINI_PLAYER_SIZE_KEY, playerSize);
    } catch {
      // Ignore storage errors
    }
  }, [playerSize]);

  // Persist docked tab mode
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(MINI_PLAYER_DOCKED_TAB_KEY, String(isDockedAsTab));
      window.localStorage.setItem(MINI_PLAYER_DISMISSED_KEY, String(isDockedAsTab));
    } catch {
      // Ignore storage errors
    }
  }, [isDockedAsTab]);

  // Persist hidden state
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(MINI_PLAYER_HIDDEN_KEY, String(isCompletelyHidden));
    } catch {
      // Ignore storage errors
    }
  }, [isCompletelyHidden]);

  // Automatically reveal mini player if user actively starts playback
  useEffect(() => {
    if (audio?.isPlaying && isCompletelyHidden) {
      setIsCompletelyHidden(false);
    }
  }, [audio?.isPlaying, isCompletelyHidden]);

  const filteredSurahs = useMemo(() => {
    const q = surahQuery.trim();
    if (!q) return SURAHS_INDEX;
    return SURAHS_INDEX.filter((s) => matchesSurahOrAyah(s.id, s.nameAr, s.nameEn, q));
  }, [surahQuery]);

  if (!audio || isCompletelyHidden) {
    return null;
  }

  const handleDockToBottomTab = () => {
    setIsDockedAsTab(true);
  };

  const handleRestoreFromTab = () => {
    setIsDockedAsTab(false);
  };

  const handleHideCompletely = () => {
    if (audio.isPlaying) {
      audio.pause();
    }
    setIsCompletelyHidden(true);
  };

  const displayTitle = audio.activeCustomTrack
    ? isAr
      ? audio.activeCustomTrack.titleAr
      : audio.activeCustomTrack.titleEn
    : isAr
      ? `سورة ${audio.activeSurah.nameAr}`
      : `Surah ${audio.activeSurah.nameEn}`;

  const displayReciter = audio.activeCustomTrack
    ? isAr
      ? audio.activeCustomTrack.reciterNameAr
      : audio.activeCustomTrack.reciterNameEn
    : isAr
      ? audio.activeReciter.nameAr
      : audio.activeReciter.nameEn;

  const availableSet = new Set(audio.availableSurahs);

  // Sizing styles mapping
  const widthClass =
    playerSize === "sm" ? "md:w-80" : playerSize === "lg" ? "md:w-[32rem]" : "md:w-[25rem]";

  const surahListMaxHeight =
    playerSize === "sm" ? "max-h-28" : playerSize === "lg" ? "max-h-64" : "max-h-44";

  // DOCKED BOTTOM TAB: Sits cleanly at the bottom edge as a persistent interactive tab
  if (isDockedAsTab) {
    return (
      <div
        dir={isAr ? "rtl" : "ltr"}
        data-testid="mini-player-collapsed-tab"
        className={`fixed bottom-0 end-2 z-40 flex items-center gap-2 rounded-t-2xl border-t border-x border-emerald-500/30 dark:border-emerald-500/30 bg-white/95 dark:bg-stone-950/95 px-3.5 py-2 shadow-2xl backdrop-blur-md md:end-6 transition-all ${className}`}
      >
        <button
          type="button"
          onClick={handleRestoreFromTab}
          data-testid="mini-player-reopen"
          aria-label={isAr ? "استعادة مشغل القرآن" : "Expand Quran Audio Player"}
          className="flex items-center gap-2 text-start focus:outline-none min-w-0"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Headphones className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 max-w-[12rem] sm:max-w-[16rem]">
            <div className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
              {displayTitle}
            </div>
            <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
              {displayReciter} · 1.0x
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1 shrink-0 ps-1 border-s border-stone-200 dark:border-stone-800">
          <button
            type="button"
            onClick={audio.togglePlay}
            aria-label={audio.isPlaying ? (isAr ? "إيقاف مؤقت" : "Pause") : isAr ? "تشغيل" : "Play"}
            className="w-8 h-8 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors shadow-xs"
          >
            {audio.isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
          </button>

          <button
            type="button"
            onClick={handleRestoreFromTab}
            title={isAr ? "تكبير المشغل" : "Expand Player"}
            aria-label={isAr ? "تكبير المشغل" : "Expand Player"}
            className="w-8 h-8 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleHideCompletely}
            data-testid="mini-player-close-hide"
            title={isAr ? "إغلاق وإخفاء المشغل تماماً" : "Close & hide player"}
            aria-label={isAr ? "إغلاق وإخفاء المشغل تماماً" : "Close and hide player"}
            className="w-8 h-8 rounded-lg text-stone-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside
      dir={isAr ? "rtl" : "ltr"}
      data-testid="quran-persistent-mini-player"
      aria-label={isAr ? "مشغل القرآن المستمر" : "Persistent Quran Audio Player"}
      className={`fixed bottom-[4.5rem] inset-x-2 z-40 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-950/95 text-stone-900 dark:text-stone-100 shadow-2xl backdrop-blur-md md:bottom-4 md:inset-x-auto md:end-4 ${widthClass} transition-all duration-200 ${className}`}
    >
      {/* Persistent Collapsible Surah List with dynamic size height */}
      {isSurahListOpen && (
        <div
          data-testid="mini-player-surah-list"
          className="border-b border-stone-200 dark:border-stone-800 p-3 space-y-2.5"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                {isAr ? "قائمة السور (١١٤)" : "Surahs (114)"}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {audio.activeReciter.nameAr}
              </span>
            </div>
            <ModernSelect
              ariaLabel={isAr ? "اختر القارئ" : "Select reciter"}
              data-testid="mini-player-reciter-select"
              size="sm"
              value={audio.activeReciter.id}
              onValueChange={(val) => {
                const next = getAuthenticReciter(val);
                audio.loadTrack({
                  reciterId: next.id,
                  surahId: audio.activeSurah.id,
                  autoPlay: audio.isPlaying || audio.hasStartedSession,
                });
              }}
              searchable
              searchPlaceholder={isAr ? "ابحث عن قارئ..." : "Search reciter..."}
              options={AUTHENTIC_RECITERS.map((r) => ({
                value: r.id,
                label: isAr ? r.nameAr : r.nameEn,
                description: isAr ? r.nameEn : r.nameAr,
              }))}
            />
          </div>

          <div className="relative">
            <Search className="size-3.5 absolute start-2.5 top-2.5 text-stone-400" />
            <input
              type="text"
              data-testid="mini-player-surah-search"
              value={surahQuery}
              onChange={(e) => setSurahQuery(e.target.value)}
              placeholder={
                isAr ? "ابحث برقم السورة أو اسمها..." : "Filter surah by name or number..."
              }
              className="w-full min-h-[36px] rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 ps-8 pe-3 py-1 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div
            className={`${surahListMaxHeight} overflow-y-auto space-y-0.5 pe-0.5 transition-all`}
          >
            {filteredSurahs.length === 0 ? (
              <p className="py-4 text-center text-xs text-stone-500">
                {isAr ? "لا توجد سورة مطابقة" : "No matching Surah"}
              </p>
            ) : (
              filteredSurahs.map((s) => {
                const isSelected = !audio.activeCustomTrack && audio.activeSurah.id === s.id;
                const isAvailable = availableSet.has(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    data-testid={`mini-player-surah-${s.id}`}
                    disabled={!isAvailable}
                    onClick={() =>
                      audio.loadTrack({
                        reciterId: audio.activeReciter.id,
                        surahId: s.id,
                        autoPlay: true,
                      })
                    }
                    className={`w-full min-h-[36px] flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors text-start ${
                      !isAvailable
                        ? "opacity-40 cursor-not-allowed text-stone-400"
                        : isSelected
                          ? "bg-emerald-700 text-white font-semibold"
                          : "hover:bg-stone-100 dark:hover:bg-stone-800/80 text-stone-800 dark:text-stone-200"
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-6 text-[11px] font-mono tabular-nums shrink-0 ${
                          isSelected ? "text-emerald-100" : "text-stone-400"
                        }`}
                      >
                        {s.id}.
                      </span>
                      <span className="truncate">
                        {isAr ? `سورة ${s.nameAr}` : `${s.nameEn} · ${s.nameAr}`}
                      </span>
                    </span>
                    <span
                      className={`text-[11px] font-mono tabular-nums shrink-0 ${
                        isSelected ? "text-emerald-100" : "text-stone-400"
                      }`}
                    >
                      {s.versesCount}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Main Player Surface */}
      <div className="p-3 space-y-2.5">
        {/* Header Controls: Track Info + Size Selectors + Surahs Toggle + Tab Dock */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
              {displayTitle}
            </div>
            <div className="flex items-center gap-1.5 truncate text-xs text-stone-500 dark:text-stone-400">
              <span className="truncate">{displayReciter}</span>
              <span aria-hidden="true">·</span>
              <span className="shrink-0 font-mono tabular-nums">1.0x</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Size Controls: S / M / L */}
            <div
              className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              title={isAr ? "التحكم بحجم المشغل والقائمة" : "Adjust window & list size"}
            >
              <button
                type="button"
                data-testid="mini-player-size-sm"
                onClick={() => setPlayerSize("sm")}
                aria-label={isAr ? "حجم صغير" : "Small size"}
                className={`min-h-[28px] px-1.5 rounded text-[10px] font-bold transition-colors ${
                  playerSize === "sm"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-emerald-600"
                }`}
              >
                {isAr ? "ص" : "S"}
              </button>
              <button
                type="button"
                data-testid="mini-player-size-md"
                onClick={() => setPlayerSize("md")}
                aria-label={isAr ? "حجم متوسط" : "Medium size"}
                className={`min-h-[28px] px-1.5 rounded text-[10px] font-bold transition-colors ${
                  playerSize === "md"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-emerald-600"
                }`}
              >
                {isAr ? "م" : "M"}
              </button>
              <button
                type="button"
                data-testid="mini-player-size-lg"
                onClick={() => setPlayerSize("lg")}
                aria-label={isAr ? "حجم كبير" : "Large size"}
                className={`min-h-[28px] px-1.5 rounded text-[10px] font-bold transition-colors ${
                  playerSize === "lg"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-emerald-600"
                }`}
              >
                {isAr ? "ك" : "L"}
              </button>
            </div>

            {/* Surah List Expand/Collapse */}
            <button
              type="button"
              onClick={() => setIsSurahListOpen((prev) => !prev)}
              data-testid="mini-player-surahs-toggle"
              aria-expanded={isSurahListOpen}
              aria-label={isAr ? "إظهار أو إخفاء قائمة السور" : "Toggle Surah list"}
              className={`inline-flex min-h-[32px] items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                isSurahListOpen
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              <ListMusic className="size-3.5" />
              <span>{isAr ? "السور" : "Surahs"}</span>
              {isSurahListOpen ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronUp className="size-3.5" />
              )}
            </button>

            {onOpenQuranPage && (
              <button
                type="button"
                onClick={onOpenQuranPage}
                aria-label={isAr ? "فتح صفحة التلاوات" : "Open Full Quran Page"}
                title={isAr ? "فتح صفحة التلاوات" : "Open Full Quran Page"}
                className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-emerald-600 transition-colors"
              >
                <BookOpen className="size-3.5" />
              </button>
            )}

            {/* Dock into sleek bottom tab */}
            <button
              type="button"
              onClick={handleDockToBottomTab}
              data-testid="mini-player-dismiss"
              aria-label={isAr ? "تصغير إلى شريط أسفل الشاشة" : "Dock as Bottom Tab"}
              title={
                isAr
                  ? "تصغير إلى شريط سفلي (ترجع له بضغطة)"
                  : "Dock to bottom tab (restore in 1 click)"
              }
              className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            >
              <ChevronDown className="size-4" />
            </button>

            {/* Complete Hide / Close X Button */}
            <button
              type="button"
              onClick={handleHideCompletely}
              data-testid="mini-player-close-hide"
              aria-label={isAr ? "إغلاق وإخفاء المشغل تماماً" : "Close & hide player"}
              title={isAr ? "إغلاق وإخفاء المشغل تماماً" : "Close & hide player"}
              className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-stone-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Interactive Seek Bar + Tabular Timestamps */}
        <div className="space-y-1">
          <input
            type="range"
            data-testid="mini-player-seek-bar"
            min={0}
            max={audio.duration || 100}
            value={audio.currentTime}
            onChange={(e) => audio.seek(Number(e.target.value))}
            aria-label={isAr ? "شريط التقديم والتأخير" : "Seek playback position"}
            className="w-full h-1.5 accent-emerald-600 bg-stone-200 dark:bg-stone-800 rounded-lg cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-stone-500 dark:text-stone-400">
            <span>{formatAudioTime(audio.currentTime)}</span>
            <span>{formatAudioTime(audio.duration)}</span>
          </div>
        </div>

        {/* Transport Controls: Loop | Prev | Play/Pause | Next | Mute */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => audio.setIsLooping(!audio.isLooping)}
            aria-label={isAr ? "تكرار السورة" : "Loop Surah"}
            title={isAr ? "تكرار السورة" : "Loop Surah"}
            className={`flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg transition-colors ${
              audio.isLooping
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <RotateCcw className="size-4" />
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={audio.skipPrevSurah}
              aria-label={isAr ? "السورة السابقة" : "Previous Surah"}
              title={isAr ? "السورة السابقة" : "Previous Surah"}
              className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <SkipBack className={`size-4 ${isAr ? "rotate-180" : ""}`} />
            </button>

            <button
              type="button"
              onClick={audio.togglePlay}
              disabled={audio.isLoading}
              data-testid="mini-player-toggle-play"
              aria-label={
                audio.isPlaying
                  ? isAr
                    ? "إيقاف مؤقت"
                    : "Pause recitation"
                  : isAr
                    ? "تشغيل"
                    : "Play recitation"
              }
              className="flex min-h-[42px] min-w-[42px] items-center justify-center rounded-xl bg-emerald-700 text-white hover:bg-emerald-600 shadow-sm transition-colors"
            >
              {audio.isLoading ? (
                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : audio.isPlaying ? (
                <Pause className="size-4 fill-current" />
              ) : (
                <Play className="size-4 fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={audio.skipNextSurah}
              aria-label={isAr ? "السورة التالية" : "Next Surah"}
              title={isAr ? "السورة التالية" : "Next Surah"}
              className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <SkipForward className={`size-4 ${isAr ? "rotate-180" : ""}`} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => audio.setIsMuted(!audio.isMuted)}
            aria-label={
              audio.isMuted ? (isAr ? "إلغاء كتم الصوت" : "Unmute") : isAr ? "كتم الصوت" : "Mute"
            }
            className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {audio.isMuted || audio.volume === 0 ? (
              <VolumeX className="size-4 text-red-500" />
            ) : (
              <Volume2 className="size-4" />
            )}
          </button>
        </div>

        {/* Background playback reassurance badge */}
        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-stone-200/60 dark:border-stone-800 text-[10px] text-emerald-800 dark:text-emerald-300">
          <span className="flex items-center gap-1 min-w-0 truncate">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">
              {isAr
                ? "الصوت مستمر بالخلفية عند قفل الشاشة أو مغادرة المتصفح"
                : "Background audio active (plays when locked)"}
            </span>
          </span>
          <span className="font-mono text-stone-400 dark:text-stone-500 text-[9px] shrink-0">
            Background Play
          </span>
        </div>
      </div>

      {audio.audioError && (
        <div
          data-testid="mini-player-error"
          className="flex items-center justify-between gap-2 border-t border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300"
        >
          <span className="flex items-center gap-1.5 min-w-0 truncate">
            <AlertCircle className="size-3.5 shrink-0" />
            <span className="truncate">
              {isAr ? audio.audioError.messageAr : audio.audioError.messageEn}
            </span>
          </span>
          <button
            type="button"
            onClick={audio.play}
            className="shrink-0 rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white"
          >
            {isAr ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      )}
    </aside>
  );
};
