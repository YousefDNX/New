import React, { useMemo, useState } from "react";
import {
  formatVerifiedDuration,
  getCountryMeta,
  getRecitersAndRecordingsForSurah,
  getSurahHighlight,
  matchesAllSearchTokens,
  type AuthenticReciter,
  type VerifiedRecordingEdition,
} from "@/lib/quran-reciters";
import { SURAHS_INDEX, type SurahPageEntry } from "@/lib/quran-mushaf";
import {
  EMOTIONAL_STYLES_META,
  TRADITIONAL_FORMATS_META,
  getEffectiveRecordingClassification,
  type RecordingStyleClassification,
} from "@/lib/quran-recitation-styles";
import { BookOpen, Play, Search, UserCheck } from "lucide-react";

interface SurahBrowserPanelProps {
  isAr: boolean;
  initialSurahId?: number;
  activeReciterId?: string;
  activeRecordingId?: string;
  activeSurahId?: number;
  isPlaying?: boolean;
  userStyleOverrides: Record<string, Partial<RecordingStyleClassification>>;
  onSelectAndPlay: (
    reciter: AuthenticReciter,
    surahId: number,
    recordingId: string,
    autoPlay: boolean,
  ) => void;
  onOpenReciterProfile: (reciter: AuthenticReciter, surahId: number, recordingId?: string) => void;
}

const FEATURED_SURAH_SHORTCUTS = [1, 2, 12, 18, 19, 25, 36, 55, 67] as const;

export const SurahBrowserPanel: React.FC<SurahBrowserPanelProps> = ({
  isAr,
  initialSurahId = 25,
  activeReciterId,
  activeRecordingId,
  activeSurahId,
  isPlaying = false,
  userStyleOverrides,
  onSelectAndPlay,
  onOpenReciterProfile,
}) => {
  const [selectedSurahId, setSelectedSurahId] = useState<number>(initialSurahId);
  const [surahQuery, setSurahQuery] = useState("");
  const [reciterFilter, setReciterFilter] = useState("");
  const [multiOnly, setMultiOnly] = useState(false);

  const selectedSurah: SurahPageEntry = useMemo(
    () => SURAHS_INDEX.find((s) => s.id === selectedSurahId) ?? SURAHS_INDEX[0]!,
    [selectedSurahId],
  );

  const filteredSurahs = useMemo(() => {
    const q = surahQuery.trim();
    if (!q) return SURAHS_INDEX;
    return SURAHS_INDEX.filter((s) =>
      matchesAllSearchTokens(`سورة ${s.nameAr} ${s.nameEn} ${s.id}`, q),
    );
  }, [surahQuery]);

  const surahReciterGroups = useMemo(() => {
    const groups = getRecitersAndRecordingsForSurah(selectedSurahId);
    return groups.filter((group) => {
      if (multiOnly && group.recordings.length < 2) return false;
      if (reciterFilter.trim()) {
        const c = getCountryMeta(group.reciter.countryCode);
        const edsText = group.recordings
          .map(
            (ed) =>
              `${ed.collectionTitleAr} ${ed.collectionTitleEn} ${ed.sourceName} ${ed.riwayahAr} ${ed.riwayahEn}`,
          )
          .join(" ");
        return matchesAllSearchTokens(
          `${group.reciter.nameAr} ${group.reciter.nameEn} ${c.nameAr} ${c.nameEn} ${edsText}`,
          reciterFilter,
        );
      }
      return true;
    });
  }, [selectedSurahId, multiOnly, reciterFilter]);

  const totalRecordingsForSurah = useMemo(
    () => surahReciterGroups.reduce((acc, g) => acc + g.recordings.length, 0),
    [surahReciterGroups],
  );

  return (
    <div className="space-y-4" data-testid="surah-first-browser">
      {/* Header + Quick Jump Surahs */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isAr
                  ? "تصفح حسب السورة (١١٤ سورة ← القراء ← كل التسجيلات المتاحة)"
                  : "Browse by Surah (114 Surahs → Verified Reciters → Multiple Recordings)"}
              </span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {isAr
                ? "اختر أي سورة لعرض جميع القرّاء الموثقين وكل التسجيلات المستقلة لتلك السورة مع توثيق المصدر والأسلوب."
                : "Select any Surah to inspect every reciter and distinct verified recording available for that chapter."}
            </p>
          </div>
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 absolute start-3 top-3 text-stone-400" />
            <input
              type="text"
              value={surahQuery}
              onChange={(e) => setSurahQuery(e.target.value)}
              placeholder={
                isAr ? "ابحث برقم أو اسم السورة (الفرقان، ٢٥...)" : "Find Surah (Al-Furqan, 25...)"
              }
              className="w-full min-h-[44px] ps-9 pe-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 me-1">
            {isAr ? "سور مختارة:" : "Quick Surahs:"}
          </span>
          {FEATURED_SURAH_SHORTCUTS.map((sId) => {
            const s = SURAHS_INDEX.find((item) => item.id === sId);
            if (!s) return null;
            const active = selectedSurahId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                data-testid={`surah-shortcut-${s.id}`}
                onClick={() => setSelectedSurahId(s.id)}
                className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                  active
                    ? "bg-emerald-700 text-white border-emerald-700"
                    : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:border-emerald-400"
                }`}
              >
                {s.id}. {isAr ? s.nameAr : s.nameEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column Mobile-Safe Split: Surah List + Reciters & Recordings for Selected Surah */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Column 1: 114 Surahs Selector */}
        <div className="lg:col-span-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-3 flex flex-col max-h-[340px] lg:max-h-[580px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 dark:border-stone-800 text-xs font-bold text-stone-700 dark:text-stone-200">
            <span>{isAr ? "قائمة السور (١١٤)" : "All 114 Surahs"}</span>
            <span className="font-mono text-[11px] text-stone-400">{filteredSurahs.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pe-1">
            {filteredSurahs.map((s) => {
              const isSelected = selectedSurahId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  data-testid={`surah-browser-item-${s.id}`}
                  onClick={() => setSelectedSurahId(s.id)}
                  className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                    isSelected
                      ? "bg-emerald-700 text-white font-bold shadow-xs"
                      : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200"
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0 truncate">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-[10px] shrink-0 ${
                        isSelected
                          ? "bg-emerald-800 text-white"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                      }`}
                    >
                      {s.id}
                    </span>
                    <span className="truncate">
                      {isAr ? `سورة ${s.nameAr}` : `${s.nameEn} (${s.nameAr})`}
                    </span>
                  </span>
                  <span
                    className={`font-mono text-[10px] shrink-0 ${
                      isSelected ? "text-emerald-100" : "text-stone-400"
                    }`}
                  >
                    {s.versesCount} {isAr ? "آية" : "v"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Reciters & Distinct Recordings for Selected Surah */}
        <div className="lg:col-span-8 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
            <div className="space-y-0.5">
              <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                {isAr
                  ? `السورة رقم ${selectedSurah.id} · ${selectedSurah.versesCount} آية`
                  : `Surah #${selectedSurah.id} · ${selectedSurah.versesCount} verses`}
              </div>
              <h4 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
                {isAr
                  ? `سورة ${selectedSurah.nameAr} — ${surahReciterGroups.length} قارئاً (${totalRecordingsForSurah} تسجيلاً موثقاً)`
                  : `Surah ${selectedSurah.nameEn} — ${surahReciterGroups.length} Reciters (${totalRecordingsForSurah} Verified Recordings)`}
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-3.5 h-3.5 absolute start-2.5 top-3 text-stone-400" />
                <input
                  type="text"
                  value={reciterFilter}
                  onChange={(e) => setReciterFilter(e.target.value)}
                  placeholder={isAr ? "تصفية القراء..." : "Filter reciters..."}
                  className="w-full sm:w-44 min-h-[40px] ps-8 pe-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>
              <button
                type="button"
                onClick={() => setMultiOnly((v) => !v)}
                className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap ${
                  multiOnly
                    ? "bg-emerald-700 text-white border-emerald-700"
                    : "border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300"
                }`}
              >
                {isAr ? "متعدد التسجيلات فقط" : "Multi-Recording Only"}
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pe-1">
            {surahReciterGroups.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500 border border-dashed border-stone-300 dark:border-stone-700 rounded-xl">
                {isAr
                  ? "لا توجد نتائج مطابقة لهذا البحث في هذه السورة."
                  : "No matching reciters found for this Surah."}
              </div>
            ) : (
              surahReciterGroups.map(({ reciter, recordings }) => {
                const country = getCountryMeta(reciter.countryCode);
                return (
                  <div
                    key={reciter.id}
                    data-testid={`surah-reciter-group-${reciter.id}`}
                    className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/35 p-3.5 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg shrink-0">{country.flagEmoji}</span>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                            {isAr ? reciter.nameAr : reciter.nameEn}
                          </div>
                          <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                            {isAr ? country.nameAr : country.nameEn} · {recordings.length}{" "}
                            {isAr
                              ? recordings.length === 1
                                ? "تسجيل لهذه السورة"
                                : "تسجيلات مستقلة لهذه السورة"
                              : recordings.length === 1
                                ? "verified recording"
                                : "distinct verified recordings"}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onOpenReciterProfile(reciter, selectedSurahId, recordings[0]?.recordingId)
                        }
                        className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:border-emerald-500"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isAr ? "ملف القارئ" : "Reciter Profile"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {recordings.map((ed: VerifiedRecordingEdition) => {
                        const cls = getEffectiveRecordingClassification(
                          ed.recordingId,
                          userStyleOverrides,
                        );
                        const fmtMeta = cls ? TRADITIONAL_FORMATS_META[cls.format] : null;
                        const durationStr = formatVerifiedDuration(
                          ed.surahDurationsSeconds?.[selectedSurahId],
                        );
                        const highlight = getSurahHighlight(ed, selectedSurahId);
                        const isCurrentlyPlayingThis =
                          isPlaying &&
                          activeReciterId === reciter.id &&
                          activeRecordingId === ed.recordingId &&
                          activeSurahId === selectedSurahId;

                        return (
                          <div
                            key={ed.recordingId}
                            data-testid={`surah-recording-card-${reciter.id}-${ed.recordingId}`}
                            className={`rounded-xl border p-3 flex flex-col justify-between gap-2 bg-white dark:bg-stone-900 ${
                              isCurrentlyPlayingThis
                                ? "border-emerald-500 ring-1 ring-emerald-500"
                                : "border-stone-200 dark:border-stone-700"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                                  {isAr ? ed.collectionTitleAr : ed.collectionTitleEn}
                                </span>
                                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 shrink-0">
                                  {fmtMeta ? (isAr ? fmtMeta.nameAr : fmtMeta.nameEn) : ed.style}
                                </span>
                              </div>

                              <div className="text-[11px] text-stone-600 dark:text-stone-300">
                                {isAr ? ed.riwayahAr : ed.riwayahEn} · {ed.sourceName}
                                {durationStr ? ` · ${durationStr}` : ""}
                                {ed.verifiedDate ? ` · ${ed.verifiedDate}` : ""}
                              </div>

                              {highlight && (
                                <div className="text-[11px] font-serif text-amber-800 dark:text-amber-300 pt-0.5">
                                  ﴿{highlight.verseArabicExcerpt}﴾ ({highlight.verseRange})
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                              <span className="text-[11px] text-stone-500">
                                {ed.availableSurahIds === "all"
                                  ? isAr
                                    ? "١١٤ سورة"
                                    : "All 114"
                                  : `${ed.availableSurahIds.length} ${isAr ? "سورة" : "surahs"}`}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  onSelectAndPlay(reciter, selectedSurahId, ed.recordingId, true)
                                }
                                className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-colors"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>
                                  {isCurrentlyPlayingThis
                                    ? isAr
                                      ? "قيد التشغيل"
                                      : "Playing"
                                    : isAr
                                      ? "تشغيل (١.٠×)"
                                      : "Play (1.0x)"}
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
