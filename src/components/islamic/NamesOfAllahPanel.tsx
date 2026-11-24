import React, { useState } from "react";
import { VERIFIED_NAMES_OF_ALLAH, type NameOfAllah } from "@/data/islamic-center";
import { toArabicIndicDigits } from "@/lib/quran";
import { Search, Sparkles, BookOpen, Info } from "lucide-react";

interface NamesOfAllahPanelProps {
  lang?: string;
}

export const NamesOfAllahPanel: React.FC<NamesOfAllahPanelProps> = ({ lang = "ar" }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);

  const filteredNames = VERIFIED_NAMES_OF_ALLAH.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.arabic.includes(q) ||
      n.transliteration.toLowerCase().includes(q) ||
      n.meaningEn.toLowerCase().includes(q) ||
      n.meaningAr.includes(q) ||
      String(n.number).includes(q)
    );
  });

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* Introduction Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-md border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>أسماء الله الحسنى (٩٩ اسماً)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif">
            وَلِلَّهِ ٱلْأَسْمَآءُ ٱلْحُسْنَىٰ فَٱدْعُوهُ بِهَا
          </h3>
          <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
            قال رسول الله ﷺ: «إنَّ لِلَّهِ تِسْعَةً وتِسْعِينَ اسْمًا، مِئَةً إلَّا واحِدًا، مَن أحْصاها دَخَلَ الجَنَّةَ» [رواه
            البخاري ومسلم].
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 font-mono text-sm bg-emerald-800/60 px-4 py-2 rounded-xl border border-emerald-400/30">
          <span>{filteredNames.length} / 99</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute right-3.5 top-3 text-stone-400" />
        <input
          type="text"
          placeholder="ابحث عن الاسم باللغة العربية أو الإنجليزية أو المعنى..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {/* 99 Names Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredNames.map((n) => (
          <button
            key={n.number}
            onClick={() => setSelectedName(n)}
            className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 hover:shadow-md transition-all text-center flex flex-col items-center justify-between gap-2 group"
          >
            <span className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-mono text-stone-500 flex items-center justify-center">
              {toArabicIndicDigits(n.number)}
            </span>

            <div
              className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
              style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
            >
              {n.arabic}
            </div>

            <div className="space-y-0.5">
              <div className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                {n.transliteration}
              </div>
              <div className="text-[10px] text-stone-400 line-clamp-1">{n.meaningEn}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 flex flex-col space-y-4">
            <div className="flex items-start justify-between">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold">
                الاسم رقم {toArabicIndicDigits(selectedName.number)}
              </span>
              <button
                onClick={() => setSelectedName(null)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Arabic Name Showcase */}
            <div className="text-center py-4 border-b border-stone-100 dark:border-stone-800">
              <div
                className="font-serif text-4xl sm:text-5xl font-bold text-emerald-800 dark:text-emerald-400"
                style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
              >
                {selectedName.arabic}
              </div>
              <div className="text-sm font-semibold text-stone-700 dark:text-stone-300 mt-2 font-mono">
                {selectedName.transliteration} • {selectedName.meaningEn}
              </div>
            </div>

            {/* Linguistic Meaning */}
            <div className="space-y-1 text-xs">
              <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                <span>المعنى والبيان:</span>
              </span>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                {selectedName.meaningAr}
              </p>
            </div>

            {/* Quranic Proof */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-500/20 text-xs space-y-1">
              <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>الشاهد من القرآن الكريم:</span>
              </span>
              <div
                className="font-serif text-stone-900 dark:text-stone-100 text-sm leading-relaxed"
                style={{ fontFamily: "'Amiri', serif" }}
              >
                {selectedName.quranicProof}
              </div>
            </div>

            {/* Beneficial Reflection */}
            {selectedName.beneficialReflection && (
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-200">
                <strong>الأثر الإيماني:</strong> {selectedName.beneficialReflection}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
