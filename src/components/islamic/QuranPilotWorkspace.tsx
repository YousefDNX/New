import { useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { QuranMushafReader } from "@/components/islamic/QuranMushafReader";
import { PageHeader } from "@/components/app/Page";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { QuranAudioProvider, useQuranAudio } from "@/contexts/QuranAudioContext";
import {
  AUTHENTIC_RECITERS,
  getAuthenticReciter,
  getAvailableSurahsForReciter,
} from "@/lib/quran-reciters";
import { SURAHS_INDEX } from "@/lib/quran-mushaf";
import { formatAudioTime } from "@/lib/quran";
import { usePrefs } from "@/lib/preferences";

const FEATURED_RECITER_IDS = [
  "al-luhaidan",
  "alafasy",
  "al-sudais",
  "al-husary",
  "al-minshawi",
  "al-muaiqly",
  "ahmed-al-nafis",
  "al-dosari",
] as const;

function QuranListenView({ lang }: { lang: string }) {
  const isAr = lang === "ar";
  const audioCtx = useQuranAudio();
  const [reciterSearch, setReciterSearch] = useState("");
  const [surahSearch, setSurahSearch] = useState("");

  const featuredReciters = useMemo(() => {
    const q = reciterSearch.trim().toLowerCase();
    if (q) {
      return AUTHENTIC_RECITERS.filter(
        (r) =>
          r.nameAr.includes(reciterSearch.trim()) ||
          r.nameEn.toLowerCase().includes(q) ||
          r.titleEn.toLowerCase().includes(q) ||
          r.titleAr.includes(reciterSearch.trim()) ||
          r.countryCode.toLowerCase().includes(q),
      ).slice(0, 12);
    }
    const list = FEATURED_RECITER_IDS.map((id) => getAuthenticReciter(id)).filter(Boolean);
    const seen = new Set(list.map((r) => r.id));
    for (const r of AUTHENTIC_RECITERS) {
      if (!seen.has(r.id) && list.length < 8) {
        list.push(r);
        seen.add(r.id);
      }
    }
    return list;
  }, [reciterSearch]);

  const filteredSurahs = useMemo(() => {
    const q = surahSearch.trim().toLowerCase();
    return SURAHS_INDEX.filter((s) => {
      if (!q) return true;
      return (
        s.nameAr.includes(surahSearch.trim()) ||
        s.nameEn.toLowerCase().includes(q) ||
        String(s.id) === q
      );
    });
  }, [surahSearch]);

  const activeReciter = audioCtx.activeReciter;
  const activeSurah = audioCtx.activeSurah;
  const availableSurahs = audioCtx.availableSurahs;
  const audioError = audioCtx.audioError
    ? isAr
      ? audioCtx.audioError.messageAr
      : audioCtx.audioError.messageEn
    : null;

  return (
    <div className="space-y-5" data-testid="quran-listen-view">
      {/* Now Playing Card (Strictly 1.0x Authentic Recitation) */}
      <div className="surface-card space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500">
              <ShieldCheck className="size-3.5 shrink-0" />
              <span>
                {isAr
                  ? "تلاوة أصلية · السرعة ١.٠× (ثابتة)"
                  : "Authentic Recitation · 1.0x Original Speed"}
              </span>
            </div>
            <h2 className="mt-1 font-serif text-xl font-bold text-foreground">
              {isAr ? `سورة ${activeSurah.nameAr}` : `Surah ${activeSurah.nameEn}`}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isAr ? activeReciter.nameAr : activeReciter.nameEn} ·{" "}
              {isAr
                ? audioCtx.activeRecording.collectionTitleAr
                : audioCtx.activeRecording.collectionTitleEn}
            </p>
          </div>
          <div className="text-end font-mono text-[11px] text-muted-foreground">
            <div>
              {activeSurah.versesCount} {isAr ? "آية" : "verses"}
            </div>
            <div>{isAr ? `صفحة ${activeSurah.startPage}` : `Page ${activeSurah.startPage}`}</div>
          </div>
        </div>

        {audioError && (
          <div
            role="alert"
            data-testid="quran-audio-error"
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{audioError}</span>
            </div>
            <button
              type="button"
              onClick={audioCtx.togglePlay}
              className="min-h-[36px] rounded-lg bg-destructive px-3 py-1 text-xs font-bold text-white"
            >
              {isAr ? "إعادة المحاولة" : "Retry"}
            </button>
          </div>
        )}

        <div className="space-y-1.5">
          <input
            type="range"
            min={0}
            max={audioCtx.duration || 100}
            value={audioCtx.currentTime}
            onChange={(e) => audioCtx.seek(Number(e.target.value))}
            aria-label={isAr ? "شريط تقدم التلاوة" : "Playback timeline"}
            className="h-1.5 w-full cursor-pointer rounded-lg accent-emerald-600"
          />
          <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
            <span>{formatAudioTime(audioCtx.currentTime)}</span>
            <span>{formatAudioTime(audioCtx.duration)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => audioCtx.setIsLooping(!audioCtx.isLooping)}
              aria-label={isAr ? "تكرار السورة" : "Loop Surah"}
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border text-xs transition-colors ${
                audioCtx.isLooping
                  ? "border-emerald-500 bg-emerald-500/15 text-emerald-500"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <RotateCcw className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={audioCtx.skipPrevSurah}
              aria-label={isAr ? "السورة السابقة" : "Previous Surah"}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
            >
              <SkipBack className={`size-4 ${isAr ? "rotate-180" : ""}`} />
            </button>
            <button
              type="button"
              onClick={() => audioCtx.seek(Math.max(0, audioCtx.currentTime - 10))}
              className="min-h-[44px] px-2 font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              -10s
            </button>
            <button
              type="button"
              onClick={audioCtx.togglePlay}
              disabled={audioCtx.isLoading}
              data-testid="pilot-play-toggle"
              data-audio-url={audioCtx.track.audioUrl}
              aria-label={
                audioCtx.isPlaying
                  ? isAr
                    ? "إيقاف التلاوة"
                    : "Pause recitation"
                  : isAr
                    ? "بدء التلاوة"
                    : "Play recitation"
              }
              className="flex size-12 items-center justify-center rounded-full bg-emerald-700 text-white shadow-md transition-transform hover:bg-emerald-800 active:scale-95"
            >
              {audioCtx.isLoading ? (
                <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : audioCtx.isPlaying ? (
                <Pause className="size-5 fill-current" />
              ) : (
                <Play className="size-5 fill-current" />
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                audioCtx.seek(Math.min(audioCtx.duration || 999999, audioCtx.currentTime + 10))
              }
              className="min-h-[44px] px-2 font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              +10s
            </button>
            <button
              type="button"
              onClick={audioCtx.skipNextSurah}
              aria-label={isAr ? "السورة التالية" : "Next Surah"}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
            >
              <SkipForward className={`size-4 ${isAr ? "rotate-180" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => audioCtx.setIsMuted(!audioCtx.isMuted)}
              aria-label={
                audioCtx.isMuted
                  ? isAr
                    ? "إلغاء كتم الصوت"
                    : "Unmute"
                  : isAr
                    ? "كتم الصوت"
                    : "Mute"
              }
              className="flex min-h-[44px] min-w-[44px] items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {audioCtx.isMuted || audioCtx.volume === 0 ? (
                <VolumeX className="size-4 text-destructive" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={audioCtx.isMuted ? 0 : audioCtx.volume}
              onChange={(e) => {
                audioCtx.setVolume(Number(e.target.value));
                if (audioCtx.isMuted) audioCtx.setIsMuted(false);
              }}
              aria-label={isAr ? "مستوى الصوت" : "Volume"}
              className="h-1.5 w-20 cursor-pointer accent-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Quick-Pick Verified Reciters + 114 Surah Selector */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="surface-card space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-foreground">
              {isAr ? "اختر القارئ" : "Select Verified Reciter"}
            </h3>
            <div className="relative w-full sm:w-52">
              <Search className="pointer-events-none absolute start-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={reciterSearch}
                onChange={(e) => setReciterSearch(e.target.value)}
                placeholder={isAr ? "ابحث عن قارئ..." : "Search reciters..."}
                className="min-h-[36px] w-full rounded-lg border border-border bg-surface-2 pe-3 ps-8 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
            {featuredReciters.map((rec) => {
              const selected = activeReciter.id === rec.id;
              return (
                <button
                  key={rec.id}
                  type="button"
                  data-testid={`pilot-reciter-${rec.id}`}
                  onClick={() => {
                    const available = getAvailableSurahsForReciter(rec);
                    const nextSurah = available.includes(audioCtx.track.surahId)
                      ? audioCtx.track.surahId
                      : (available[0] ?? 1);
                    audioCtx.loadTrack({ reciterId: rec.id, surahId: nextSurah, autoPlay: false });
                  }}
                  className={`flex min-h-[48px] flex-col items-start justify-center rounded-xl border px-3 py-2 text-start transition-colors ${
                    selected
                      ? "border-emerald-500 bg-emerald-600 text-white shadow-sm"
                      : "border-border bg-surface-2 text-foreground hover:border-emerald-500/50"
                  }`}
                >
                  <span className="line-clamp-1 text-xs font-bold">
                    {isAr ? rec.nameAr : rec.nameEn}
                  </span>
                  <span
                    className={`text-[10px] ${
                      selected ? "text-emerald-100" : "text-muted-foreground"
                    }`}
                  >
                    {isAr ? rec.primaryRiwayahAr : rec.primaryRiwayahEn} · {rec.countryCode}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="surface-card space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-foreground">
              {isAr
                ? `اختر السورة (${availableSurahs.length}/١١٤)`
                : `Select Surah (${availableSurahs.length}/114)`}
            </h3>
            <div className="relative w-full sm:w-52">
              <Search className="pointer-events-none absolute start-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={surahSearch}
                onChange={(e) => setSurahSearch(e.target.value)}
                placeholder={isAr ? "ابحث عن سورة..." : "Search surah..."}
                className="min-h-[36px] w-full rounded-lg border border-border bg-surface-2 pe-3 ps-8 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="max-h-72 space-y-1 overflow-y-auto pe-1">
            {filteredSurahs.map((s) => {
              const selected = activeSurah.id === s.id;
              const isAvailable = availableSurahs.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => audioCtx.selectSurah(s.id)}
                  className={`flex min-h-[40px] w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    !isAvailable
                      ? "cursor-not-allowed text-muted-foreground opacity-45"
                      : selected
                        ? "bg-emerald-600 font-bold text-white"
                        : "bg-surface-2/60 text-foreground hover:bg-surface-2"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="w-6 font-mono text-[10px] opacity-80">{s.id}</span>
                    <span className="truncate">{isAr ? `سورة ${s.nameAr}` : s.nameEn}</span>
                  </span>
                  <span className="font-mono text-[10px] opacity-80">
                    {isAvailable ? `${s.versesCount}` : "—"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuranPilotWorkspace() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const [tab, setTab] = useState<"listen" | "mushaf">("listen");

  return (
    <div className="space-y-5 pb-12" data-testid="quran-pilot-workspace">
      <PageHeader
        title={isAr ? "القرآن الكريم" : "Holy Quran"}
        subtitle={
          isAr
            ? "استمع إلى التلاوات الموثقة بسرعة ١.٠× أو اقرأ المصحف بالرسم العثماني."
            : "Listen to verified human recitations at 1.0x speed or read the Uthmani Mushaf."
        }
        actions={<FeatureGuideTrigger featureId="quran-reader" />}
      />

      <div
        role="tablist"
        aria-label={isAr ? "أقسام القرآن" : "Quran workspace tabs"}
        className="flex flex-wrap gap-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "listen"}
          data-testid="quran-pilot-tab-listen"
          onClick={() => setTab("listen")}
          className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
            tab === "listen"
              ? "bg-emerald-700 text-white shadow-sm"
              : "border border-border bg-surface-2 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Headphones className="size-4" />
          <span>{isAr ? "استماع للتلاوة" : "Listen"}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={tab === "mushaf"}
          data-testid="quran-pilot-tab-mushaf"
          onClick={() => setTab("mushaf")}
          className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
            tab === "mushaf"
              ? "bg-emerald-700 text-white shadow-sm"
              : "border border-border bg-surface-2 text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="size-4" />
          <span>{isAr ? "قراءة المصحف" : "Read Mushaf"}</span>
        </button>
      </div>

      {tab === "listen" ? (
        <QuranAudioProvider initialReciterId="al-luhaidan" initialSurahId={1}>
          <QuranListenView lang={lang} />
        </QuranAudioProvider>
      ) : (
        <QuranMushafReader lang={lang} />
      )}
    </div>
  );
}
