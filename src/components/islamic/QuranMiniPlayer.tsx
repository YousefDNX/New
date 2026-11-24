import React from "react";
import { AlertCircle, BookOpen, Pause, Play, Radio, SkipBack, SkipForward, X } from "lucide-react";
import { useOptionalQuranAudio } from "@/contexts/QuranAudioContext";
import { formatAudioTime } from "@/lib/quran";

interface QuranMiniPlayerProps {
  lang?: string;
  onOpenQuranPage?: () => void;
  className?: string;
}

export const QuranMiniPlayer: React.FC<QuranMiniPlayerProps> = ({
  lang = "en",
  onOpenQuranPage,
  className = "",
}) => {
  const audio = useOptionalQuranAudio();
  if (!audio || !audio.hasStartedSession) {
    return null;
  }

  const isAr = lang === "ar";
  const progressPct =
    audio.duration > 0 ? Math.min(100, Math.round((audio.currentTime / audio.duration) * 100)) : 0;

  return (
    <aside
      dir={isAr ? "rtl" : "ltr"}
      data-testid="quran-persistent-mini-player"
      aria-label={isAr ? "مشغل القرآن المستمر" : "Persistent Quran Audio Player"}
      className={`fixed bottom-[4.5rem] inset-x-2 z-40 rounded-2xl border border-emerald-500/35 bg-surface/95 backdrop-blur-md shadow-xl md:bottom-5 md:inset-x-auto md:end-5 md:w-[24rem] ${className}`}
    >
      {/* Thin progress bar across top */}
      <div className="h-1 w-full overflow-hidden rounded-t-2xl bg-emerald-950/20">
        <div
          className="h-full bg-emerald-500 transition-[width] duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-2.5 p-2.5 sm:p-3">
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Radio className="size-3 shrink-0" />
            <span className="truncate">
              {isAr ? "تلاوة متواصلة · ١.٠×" : "Background Recitation · 1.0x"}
            </span>
          </div>
          <div className="truncate text-xs font-bold text-foreground">
            {isAr
              ? `سورة ${audio.activeSurah.nameAr} — ${audio.activeReciter.nameAr}`
              : `Surah ${audio.activeSurah.nameEn} — ${audio.activeReciter.nameEn}`}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
            <span className="truncate">
              {isAr
                ? audio.activeRecording.collectionTitleAr
                : audio.activeRecording.collectionTitleEn}
            </span>
            <span className="shrink-0">
              {formatAudioTime(audio.currentTime)} / {formatAudioTime(audio.duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={audio.skipPrevSurah}
            aria-label={isAr ? "السورة السابقة" : "Previous Surah"}
            title={isAr ? "السورة السابقة" : "Previous Surah"}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors"
          >
            <SkipBack className={`size-4 ${isAr ? "rotate-180" : ""}`} />
          </button>

          <button
            type="button"
            onClick={audio.togglePlay}
            data-testid="mini-player-toggle-play"
            aria-label={
              audio.isPlaying
                ? isAr
                  ? "إيقاف التلاوة مؤقتاً"
                  : "Pause recitation"
                : isAr
                  ? "استئناف التلاوة"
                  : "Resume recitation"
            }
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm transition-colors"
          >
            {audio.isPlaying ? (
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
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors"
          >
            <SkipForward className={`size-4 ${isAr ? "rotate-180" : ""}`} />
          </button>

          {onOpenQuranPage && (
            <button
              type="button"
              onClick={onOpenQuranPage}
              aria-label={isAr ? "فتح صفحة التلاوات" : "Open Quran Library"}
              title={isAr ? "فتح صفحة التلاوات" : "Open Quran Library"}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border bg-surface-2/70 text-foreground hover:border-emerald-500/40 transition-colors"
            >
              <BookOpen className="size-4" />
            </button>
          )}

          <button
            type="button"
            onClick={audio.stopAndDismiss}
            data-testid="mini-player-dismiss"
            aria-label={isAr ? "إغلاق المشغل" : "Close audio player"}
            title={isAr ? "إغلاق المشغل" : "Close player"}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {audio.audioError && (
        <div
          data-testid="mini-player-error"
          className="flex items-center justify-between gap-2 border-t border-destructive/20 bg-destructive/10 px-3 py-1.5 text-[11px] text-destructive"
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
            className="shrink-0 rounded-md bg-destructive px-2 py-0.5 text-[10px] font-bold text-white"
          >
            {isAr ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      )}
    </aside>
  );
};
