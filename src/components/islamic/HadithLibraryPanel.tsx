import React, { useState, useEffect } from "react";
import { VERIFIED_HADITH_LIBRARY, type HadithRecord } from "@/data/islamic-center";
import { toArabicIndicDigits } from "@/lib/quran";
import {
  Search,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Copy,
  Check,
  BookmarkCheck,
  Award,
} from "lucide-react";
import { toast } from "sonner";

interface HadithLibraryPanelProps {
  lang?: string;
}

const HADITH_MEMORIZED_KEY = "btc_hadiths_memorized_v1";

export const HadithLibraryPanel: React.FC<HadithLibraryPanelProps> = ({ lang = "ar" }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "memorized" | "pending">("all");
  const [memorizedIds, setMemorizedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem(HADITH_MEMORIZED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(HADITH_MEMORIZED_KEY, JSON.stringify(memorizedIds));
    } catch {
      // Ignore storage errors
    }
  }, [memorizedIds]);

  const toggleMemorized = (id: string) => {
    setMemorizedIds((prev) => {
      const isAlready = prev.includes(id);
      const next = isAlready ? prev.filter((x) => x !== id) : [...prev, id];
      toast.success(
        isAlready
          ? "تم إلغاء التحديد من قائمة المحفوظات."
          : "ما شاء الله! تبارك الله، تم تسجيل الحديث في قائمة حفظك.",
      );
      return next;
    });
  };

  const filteredHadiths = VERIFIED_HADITH_LIBRARY.filter((h) => {
    if (filterTab === "memorized" && !memorizedIds.includes(h.id)) return false;
    if (filterTab === "pending" && memorizedIds.includes(h.id)) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      h.titleAr.includes(q) ||
      h.titleEn.toLowerCase().includes(q) ||
      h.matnArabic.includes(q) ||
      h.narrator.includes(q) ||
      String(h.numberInCollection).includes(q)
    );
  });

  const memorizedPercent = Math.round(
    (memorizedIds.length / Math.max(1, VERIFIED_HADITH_LIBRARY.length)) * 100,
  );

  const handleCopy = (h: HadithRecord) => {
    const text = `الحديث ${h.numberInCollection}: ${h.titleAr}\nعن ${h.narrator}\n\n${h.matnArabic}\n\n[المصدر: ${h.sourceReference} (${h.authenticityGrade})]`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(h.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* Intro Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-md border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>الأربعون النووية — الإمام النووي رحمه الله</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif">رياض الحديث النبوي الشريف</h3>
          <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
            مجموعة من جوامع كَلِم النبي ﷺ الصحيحة التي يدور عليها مدار الإسلام في العقيدة، والأخلاق،
            والمعاملات، والعبادات، مع إمكانية تتبع الحفظ والدروس العملية.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 self-end sm:self-auto shrink-0 font-mono text-xs bg-emerald-800/60 p-2.5 rounded-xl border border-emerald-400/30">
          <div className="flex items-center gap-1.5 text-emerald-200">
            <Award className="w-4 h-4 text-amber-400" />
            <span>
              الحفظ: {memorizedIds.length} / {VERIFIED_HADITH_LIBRARY.length} ({memorizedPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="ابحث في الأحاديث بالعنوان، أو الراوي، أو جزء من المتن..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-xl bg-stone-100 dark:bg-stone-800/70 p-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`rounded-lg px-3 py-1.5 font-bold transition-all cursor-pointer ${
              filterTab === "all"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            }`}
          >
            الكل ({VERIFIED_HADITH_LIBRARY.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("memorized")}
            className={`rounded-lg px-3 py-1.5 font-bold transition-all cursor-pointer ${
              filterTab === "memorized"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            }`}
          >
            المحفوظة ({memorizedIds.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("pending")}
            className={`rounded-lg px-3 py-1.5 font-bold transition-all cursor-pointer ${
              filterTab === "pending"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            }`}
          >
            قيد الحفظ ({VERIFIED_HADITH_LIBRARY.length - memorizedIds.length})
          </button>
        </div>
      </div>

      {/* Hadith Cards List */}
      <div className="space-y-4">
        {filteredHadiths.map((h) => (
          <div
            key={h.id}
            className={`p-5 sm:p-6 rounded-2xl bg-white dark:bg-stone-900 border shadow-sm space-y-4 transition-all ${
              memorizedIds.includes(h.id)
                ? "border-emerald-500/50 bg-emerald-950/5"
                : "border-stone-200 dark:border-stone-800"
            }`}
          >
            {/* Header with Hadith Number and Source */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold text-xs font-mono">
                  {toArabicIndicDigits(h.numberInCollection)}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {h.titleAr}
                  </h4>
                  <div className="text-[11px] text-stone-500">عن {h.narrator}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleMemorized(h.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    memorizedIds.includes(h.id)
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:border-emerald-500"
                  }`}
                  title={
                    memorizedIds.includes(h.id) ? "محفوظ بحمد الله" : "اضغط لتسجيل الحديث كمحفوظ"
                  }
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>{memorizedIds.includes(h.id) ? "محفوظ" : "تحديد كمحفوظ"}</span>
                </button>

                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {h.sourceReference} ({h.authenticityGrade})
                  </span>
                </span>

                <button
                  onClick={() => handleCopy(h)}
                  className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-emerald-600 transition-colors"
                  title="نسخ الحديث"
                  aria-label="نسخ نص الحديث"
                >
                  {copiedId === h.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Arabic Matn */}
            <div
              className="py-2 text-right font-serif text-lg sm:text-xl text-stone-900 dark:text-stone-100 leading-[2.2] select-text"
              style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
            >
              {h.matnArabic}
            </div>

            {/* English Translation */}
            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 text-xs text-stone-600 dark:text-stone-300 italic leading-relaxed">
              "{h.translationEn}"
            </div>

            {/* Key Moral Lessons */}
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>الفوائد والدروس المستفادة:</span>
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-700 dark:text-stone-300">
                {h.keyMoralLessons.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
