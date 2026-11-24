import React, { useState } from "react";
import { VERIFIED_DUAS_CATALOG, type DuaItem } from "@/data/islamic-center";
import { Search, Copy, Check, Sparkles, Tag } from "lucide-react";

interface DuasLibraryPanelProps {
  lang?: string;
}

export const DuasLibraryPanel: React.FC<DuasLibraryPanelProps> = ({ lang = "ar" }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: "all", nameAr: "جميع الأدعية" },
    { id: "knowledge", nameAr: "طلب العلم والامتحانات" },
    { id: "quranic", nameAr: "أدعية القرآن الكريم" },
    { id: "prophetic", nameAr: "أدعية نبوية مأثورة" },
    { id: "guidance", nameAr: "الهداية والثبات" },
    { id: "distress", nameAr: "تفريج الكرب والهم" },
    { id: "parents", nameAr: "الوالدين والذرية" },
  ];

  const filteredDuas = VERIFIED_DUAS_CATALOG.filter((dua) => {
    if (selectedCategory === "quranic" && dua.type !== "quranic") return false;
    if (selectedCategory === "prophetic" && dua.type !== "prophetic") return false;
    if (
      selectedCategory !== "all" &&
      selectedCategory !== "quranic" &&
      selectedCategory !== "prophetic" &&
      dua.category !== selectedCategory
    ) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = dua.titleAr.includes(q) || dua.titleEn.toLowerCase().includes(q);
      const matchAr = dua.arabicText.includes(q);
      const matchEn = dua.translationEn.toLowerCase().includes(q);
      const matchContext = dua.contextEn.toLowerCase().includes(q);
      const matchCitation = dua.sourceReference.toLowerCase().includes(q);
      return matchTitle || matchAr || matchEn || matchContext || matchCitation;
    }

    return true;
  });

  const handleCopy = (dua: DuaItem) => {
    const text = `${dua.arabicText}\n\n[المصدر: ${dua.sourceReference}]\n${dua.contextEn}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(dua.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* Prophetic Intention Reminder for Students */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>من أسباب البركة في المذاكرة والامتحانات:</span>
          </div>
          <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
            «مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ» (صحيح مسلم ٢٦٩٩) — احتسب
            نية التعلم لنفع نفسك وأهلك ومجتمعك مع الأخذ بأسباب الجد والمراجعة.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSelectedCategory("knowledge")}
          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 transition-colors"
        >
          عرض أدعية الدراسة والامتحانات
        </button>
      </div>

      {/* Search and Category Filter Header */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="ابحث في الأدعية بالكلمات المفتاحية أو المناسبة أو المصدر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === c.id
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
              }`}
            >
              {c.nameAr}
            </button>
          ))}
        </div>
      </div>

      {/* Duas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDuas.map((dua) => (
          <div
            key={dua.id}
            className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all"
          >
            {/* Tag & Citation Header */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                    dua.type === "quranic"
                      ? "bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200"
                      : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200"
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  <span>{dua.type === "quranic" ? "دعاء قرآني" : "دعاء نبوي مأثور"}</span>
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  {dua.sourceReference}
                </span>
              </div>

              <button
                onClick={() => handleCopy(dua)}
                className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-emerald-600 transition-colors"
                title="نسخ نص الدعاء"
                aria-label="نسخ الدعاء"
              >
                {copiedId === dua.id ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="text-sm font-bold text-stone-800 dark:text-stone-200">
              {dua.titleAr}
            </div>

            {/* Arabic Dua Text */}
            <div
              className="py-2 text-right font-serif text-lg sm:text-xl text-stone-900 dark:text-stone-100 leading-[2.1] select-text"
              style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
            >
              {dua.arabicText}
            </div>

            {/* Translation and Occasion */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
              <p className="text-stone-600 dark:text-stone-400 italic leading-relaxed" dir="ltr">
                "{dua.translationEn}"
              </p>
              <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>المناسبة: {dua.contextEn}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
