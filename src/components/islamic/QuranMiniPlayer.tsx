import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ListMusic,
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
import { formatAudioTime } from "@/lib/quran";

interface QuranMiniPlayerProps {
  lang?: string;
  onOpenQuranPage?: () => void;
  className?: string;
}

const SURAH_LIST_OPEN_KEY = "btc_quran_player_surah_list_open_v1";
const MINI_PLAYER_DISMISSED_KEY = "btc_quran_player_dismissed_v1";

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

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(MINI_PLAYER_DISMISSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [surahQuery, setSurahQuery] = useState("");

  // Persist open/collapsed state of the surah list across reloads
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(SURAH_LIST_OPEN_KEY, String(isSurahListOpen));
    } catch {
      // Ignore storage errors
    }
  }, [isSurahListOpen]);

  // Automatically bring back the persistent player if a playback session starts anywhere
  useEffect(() => {
    if (audio?.hasStartedSession && isDismissed) {
      setIsDismissed(false);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(MINI_PLAYER_DISMISSED_KEY, "false");
        } catch {
          // Ignore storage errors
        }
      }
    }
  }, [audio?.hasStartedSession, isDismissed]);

  const filteredSurahs = useMemo(() => {
    const q = surahQuery.trim().toLowerCase();
    if (!q) return SURAHS_INDEX;
    return SURAHS_INDEX.filter(
      (s) =>
        s.nameAr.includes(surahQuery.trim()) ||
        s.nameEn.toLowerCase().includes(q) ||
        String(s.id) === q,
    );
  }, [surahQuery]);

  if (!audio) {
    return null;
  }

  const handleDismiss = () => {
    audio.stopAndDismiss();
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(MINI_PLAYER_DISMISSED_KEY, "true");
      } catch {
        // Ignore storage errors
      }
    }
  };

  const handleReopen = () => {
    setIsDismissed(false);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(MINI_PLAYER_DISMISSED_KEY, "false");
      } catch {
        // Ignore storage errors
      }
    }
  };

  if (isDismissed) {
    return (
      <button
        type="button"
        onClick={handleReopen}
        data-testid="mini-player-reopen"
        aria-label={isAr ? "فتح مشغل القرآن" : "Open Quran MP3 Player"}
        className={`fixed bottom-[4.5rem] end-3 z-40 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-950/95 px-3.5 py-2 text-xs font-semibold text-stone-900 dark:text-stone-100 shadow-lg backdrop-blur-md hover:border-emerald-600 transition-colors md:bottom-4 md:end-4 ${className}`}
      >
        <ListMusic className="size-4 text-emerald-700 dark:text-emerald-400" />
        <span className="whitespace-nowrap">{isAr ? "مشغل القرآن" : "Quran Player"}</span>
      </button>
    );
  }

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

  return (
    <aside
      dir={isAr ? "rtl" : "ltr"}
      data-testid="quran-persistent-mini-player"
      aria-label={isAr ? "مشغل القرآن المستمر" : "Persistent Quran Audio Player"}
      className={`fixed bottom-[4.5rem] inset-x-2 z-40 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-950/95 text-stone-900 dark:text-stone-100 shadow-xl backdrop-blur-md md:bottom-4 md:inset-x-auto md:end-4 md:w-[25rem] ${className}`}
    >
      {/* Persistent Collapsible Surah List (stays visible across page navigation) */}
      {isSurahListOpen && (
        <div
          data-testid="mini-player-surah-list"
          className="border-b border-stone-200 dark:border-stone-800 p-3 space-y-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
              {isAr ? "قائمة السور (١١٤)" : "Surahs (114)"}
            </span>
            <select
              aria-label={isAr ? "اختر القارئ" : "Select reciter"}
              data-testid="mini-player-reciter-select"
              value={audio.activeReciter.id}
              onChange={(e) => {
                const next = getAuthenticReciter(e.target.value);
                audio.loadTrack({
                  reciterId: next.id,
                  surahId: audio.activeSurah.id,
                  autoPlay: audio.isPlaying || audio.hasStartedSession,
                });
              }}
              className="max-w-[13rem] min-h-[34px] rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-2 py-1 text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              {AUTHENTIC_RECITERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {isAr ? r.nameAr : r.nameEn}
                </option>
              ))}
            </select>
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

          <div className="max-h-44 overflow-y-auto space-y-0.5 pe-0.5">
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

      {/* Main Compact Player Surface */}
      <div className="p-3 space-y-2.5">
        {/* Track Header + Surah Drawer Toggle & Close */}
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
            <button
              type="button"
              onClick={() => setIsSurahListOpen((prev) => !prev)}
              data-testid="mini-player-surahs-toggle"
              aria-expanded={isSurahListOpen}
              aria-label={isAr ? "إظهار أو إخفاء قائمة السور" : "Toggle Surah list"}
              className={`inline-flex min-h-[36px] items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
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
                className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-emerald-600 transition-colors"
              >
                <BookOpen className="size-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleDismiss}
              data-testid="mini-player-dismiss"
              aria-label={isAr ? "إغلاق المشغل" : "Close audio player"}
              title={isAr ? "إغلاق المشغل" : "Close player"}
              className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-stone-400 hover:bg-red-500/10 hover:text-red-600 transition-colors"
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
            className={`flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg transition-colors ${
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
              className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
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
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-emerald-700 text-white hover:bg-emerald-600 shadow-sm transition-colors"
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
              className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
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
            className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {audio.isMuted || audio.volume === 0 ? (
              <VolumeX className="size-4 text-red-500" />
            ) : (
              <Volume2 className="size-4" />
            )}
          </button>
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
