import React, { useState, useMemo } from "react";
import {
  loadMemorizationState,
  updateSurahProgress,
  getMemorizationOverview,
  type SurahMemorizationEntry,
  type MemorizationStatus,
} from "@/lib/quran-memorization";
import { getMushafPageMeta, SURAHS_INDEX } from "@/lib/quran-mushaf";
import { toArabicIndicDigits } from "@/lib/quran";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  RotateCcw,
  Sliders,
  Play,
  Layers,
} from "lucide-react";

interface QuranMemorizationPanelProps {
  onOpenMushafPage?: (page: number) => void;
  onOpenAudioSurah?: (surahId: number) => void;
  lang?: string;
}

export const QuranMemorizationPanel: React.FC<QuranMemorizationPanelProps> = ({
  onOpenMushafPage,
  onOpenAudioSurah,
  lang = "ar",
}) => {
  const [memorizationState, setMemorizationState] = useState(() => loadMemorizationState());
  const [filterTab, setFilterTab] = useState<"all" | "memorizing" | "memorized" | "due">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [khatmahDays, setKhatmahDays] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = Number(window.localStorage.getItem("btc_khatmah_target_days"));
      if (saved >= 7 && saved <= 365) return saved;
    }
    return 30;
  });
  const [completedPages, setCompletedPages] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = Number(window.localStorage.getItem("btc_khatmah_completed_pages"));
      if (saved >= 0 && saved <= 604) return saved;
    }
    return 0;
  });

  const pagesPerDay = Math.max(1, Math.ceil(604 / khatmahDays));
  const todayStartPage = Math.min(604, completedPages + 1);
  const todayEndPage = Math.min(604, completedPages + pagesPerDay);
  const todayStartMeta = useMemo(() => getMushafPageMeta(todayStartPage), [todayStartPage]);
  const todayEndMeta = useMemo(() => getMushafPageMeta(todayEndPage), [todayEndPage]);

  const handleUpdateKhatmahDays = (days: number) => {
    setKhatmahDays(days);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("btc_khatmah_target_days", String(days));
    }
  };

  const handleCompleteDailyWird = () => {
    const nextPages = completedPages >= 604 ? 0 : Math.min(604, completedPages + pagesPerDay);
    setCompletedPages(nextPages);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("btc_khatmah_completed_pages", String(nextPages));
    }
  };

  const overview = useMemo(() => getMemorizationOverview(memorizationState), [memorizationState]);

  const handleStatusChange = (surahId: number, newStatus: MemorizationStatus) => {
    const s = SURAHS_INDEX.find((item) => item.id === surahId);
    const versesCount =
      newStatus === "memorized" || newStatus === "mastered" ? (s?.versesCount ?? 0) : 0;

    const nextState = updateSurahProgress(memorizationState, surahId, {
      status: newStatus,
      memorizedVersesCount: versesCount,
    });
    setMemorizationState(nextState);
  };

  const handleReview = (surahId: number, passed: boolean) => {
    const nextState = updateSurahProgress(memorizationState, surahId, {
      markReviewed: true,
      reviewPassed: passed,
    });
    setMemorizationState(nextState);
  };

  const filteredSurahs = SURAHS_INDEX.filter((s) => {
    const entry = memorizationState[s.id];
    if (
      filterTab === "memorized" &&
      entry?.status !== "memorized" &&
      entry?.status !== "mastered"
    ) {
      return false;
    }
    if (filterTab === "memorizing" && entry?.status !== "memorizing") {
      return false;
    }
    if (filterTab === "due") {
      if (!entry?.nextReviewAt) return false;
      const isDue = new Date(entry.nextReviewAt) <= new Date();
      if (!isDue) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.nameAr.includes(q) || s.nameEn.toLowerCase().includes(q) || String(s.id).includes(q);
    }
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* Global Progress Dashboard */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-lg border border-emerald-500/30 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>متابعة الحفظ والتثبيت بالتكرار المتباعد</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif">
              خطة إتمام حفظ القرآن الكريم
            </h3>
            <p className="text-xs text-emerald-100/80">
              تم حفظ {toArabicIndicDigits(overview.totalVersesMemorized)} آية من أصل ٦٬٢٣٦ آية (
              {overview.overallPercentage}%)
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-center bg-emerald-800/60 px-4 py-2.5 rounded-xl border border-emerald-400/30">
              <div className="text-2xl font-black font-mono text-amber-300">
                {toArabicIndicDigits(overview.totalSurahsMemorized)}
              </div>
              <div className="text-[10px] text-emerald-200">سورة مكتملة</div>
            </div>

            <div className="text-center bg-emerald-800/60 px-4 py-2.5 rounded-xl border border-emerald-400/30">
              <div className="text-2xl font-black font-mono text-emerald-200">
                {toArabicIndicDigits(overview.totalSurahsInProgress)}
              </div>
              <div className="text-[10px] text-emerald-200">قيد الحفظ</div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-emerald-950/80 rounded-full h-3 border border-emerald-500/30 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-amber-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, overview.overallPercentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-emerald-200 font-mono">
            <span>البداية</span>
            <span>{overview.overallPercentage}% مكتمل</span>
            <span>ختم القرآن الكريم (٦٬٢٣٦ آية)</span>
          </div>
        </div>
      </div>

      {/* Daily Quran Khatmah & Wird Planner (604 Madinah Pages) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
          <div>
            <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>مُنظِّم الورد اليومي وختم القرآن الكريم (٦٠٤ صفحة)</span>
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              اختر مدة الختمة وسينقلك النظام يومياً إلى صفحات وردك في مصحف المدينة مباشرة
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { days: 30, label: "ختمة ٣٠ يوماً (جزء/يوم)" },
              { days: 60, label: "ختمة ٦٠ يوماً" },
              { days: 90, label: "ختمة ٩٠ يوماً" },
            ].map((plan) => (
              <button
                key={plan.days}
                type="button"
                onClick={() => handleUpdateKhatmahDays(plan.days)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  khatmahDays === plan.days
                    ? "bg-emerald-700 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
                }`}
              >
                {plan.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-xs">
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 space-y-1">
            <div className="text-stone-500">ورد اليوم المحدد ({pagesPerDay} صفحة)</div>
            {completedPages >= 604 ? (
              <div className="font-bold text-emerald-700 dark:text-emerald-300">
                أتممت الختمة المباركة (٦٠٤/٦٠٤ صفحة) — تقبل الله منك!
              </div>
            ) : (
              <div className="font-bold text-stone-900 dark:text-stone-100">
                من صـ {toArabicIndicDigits(todayStartPage)} ({todayStartMeta.surahNameAr}) إلى صـ{" "}
                {toArabicIndicDigits(todayEndPage)} ({todayEndMeta.surahNameAr})
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 space-y-1">
            <div className="flex items-center justify-between text-stone-500">
              <span>تقدم الختمة الحالية</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                {completedPages} / 604
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all"
                style={{ width: `${Math.round((completedPages / 604) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {completedPages < 604 && (
              <button
                type="button"
                onClick={() => onOpenMushafPage?.(todayStartPage)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                <BookOpen className="w-4 h-4" />
                <span>افتح ورد اليوم (صـ {toArabicIndicDigits(todayStartPage)})</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCompleteDailyWird}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{completedPages >= 604 ? "بدء ختمة جديدة" : "أتممت ورد اليوم"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === "all"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
            }`}
          >
            جميع السور (١١٤)
          </button>
          <button
            onClick={() => setFilterTab("memorizing")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === "memorizing"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
            }`}
          >
            قيد الحفظ ({overview.totalSurahsInProgress})
          </button>
          <button
            onClick={() => setFilterTab("memorized")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === "memorized"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
            }`}
          >
            المكتملة ({overview.totalSurahsMemorized})
          </button>
          <button
            onClick={() => setFilterTab("due")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === "due"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
            }`}
          >
            حان موعد مراجعتها ({overview.dueReviewsCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="ابحث عن سورة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-8 pl-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Surahs Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredSurahs.map((s) => {
          const entry = memorizationState[s.id]!;
          const isMastered = entry.status === "mastered";
          const isMemorized = entry.status === "memorized";
          const isMemorizing = entry.status === "memorizing";

          return (
            <div
              key={s.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                isMastered || isMemorized
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/40"
                  : isMemorizing
                    ? "bg-teal-50/40 dark:bg-teal-950/20 border-teal-500/30"
                    : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono text-xs flex items-center justify-center font-bold">
                    {s.id}
                  </span>
                  <div>
                    <h5 className="font-bold text-sm text-stone-900 dark:text-stone-100 font-serif">
                      سورة {s.nameAr}
                    </h5>
                    <div className="text-[11px] text-stone-500 font-mono">
                      {s.versesCount} آية • صفحة {s.startPage}
                    </div>
                  </div>
                </div>

                {/* Status Switcher Select */}
                <select
                  value={entry.status}
                  onChange={(e) => handleStatusChange(s.id, e.target.value as MemorizationStatus)}
                  className="text-[11px] font-bold py-1 px-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none"
                  aria-label={`تغيير حالة حفظ سورة ${s.nameAr}`}
                >
                  <option value="not_started">لم تبدأ</option>
                  <option value="memorizing">قيد الحفظ</option>
                  <option value="memorized">تم الحفظ</option>
                  <option value="mastered">متقن ومثبت ⭐</option>
                </select>
              </div>

              {/* Action Buttons: Review & Jump to Audio/Mushaf */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenMushafPage?.(s.startPage)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-[11px] transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>المصحف (صـ {s.startPage})</span>
                  </button>

                  <button
                    onClick={() => onOpenAudioSurah?.(s.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-[11px] transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-600" />
                    <span>استماع</span>
                  </button>
                </div>

                {/* Spaced repetition review trigger */}
                {(isMemorized || isMastered || isMemorizing) && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleReview(s.id, true)}
                      className="px-2 py-1 rounded bg-emerald-700 text-white hover:bg-emerald-800 text-[10px] font-bold shadow-sm"
                      title="تمت المراجعة بنجاح (تثبيت الحفظ)"
                    >
                      ✓ أتقنت
                    </button>
                    <button
                      onClick={() => handleReview(s.id, false)}
                      className="px-2 py-1 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-[10px]"
                      title="يحتاج مراجعة إضافية"
                    >
                      يحتاج مراجعة
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
