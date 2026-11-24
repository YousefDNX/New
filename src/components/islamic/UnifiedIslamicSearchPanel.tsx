import React, { useMemo, useState } from "react";
import {
  searchUnifiedIslamicCenter,
  type IslamicSearchCategory,
  type UnifiedIslamicSearchResult,
} from "@/lib/islamic-search";
import { ArrowUpRight, Search } from "lucide-react";

interface UnifiedIslamicSearchPanelProps {
  lang?: string;
  onNavigateResult: (result: UnifiedIslamicSearchResult) => void;
}

const CATEGORIES: ReadonlyArray<{
  id: IslamicSearchCategory;
  labelAr: string;
  labelEn: string;
}> = [
  { id: "all", labelAr: "الكل", labelEn: "All" },
  { id: "country", labelAr: "الدول", labelEn: "Countries" },
  { id: "reciter", labelAr: "القراء", labelEn: "Reciters" },
  { id: "surah", labelAr: "السور", labelEn: "Surahs" },
  { id: "style", labelAr: "الأنماط الصوتية", labelEn: "Recitation Styles" },
  { id: "tafsir", labelAr: "التفسير", labelEn: "Tafsir" },
  { id: "tajweed", labelAr: "التجويد", labelEn: "Tajweed" },
  { id: "hadith", labelAr: "الحديث", labelEn: "Hadith" },
  { id: "sunnah", labelAr: "السنن", labelEn: "Sunnah" },
  { id: "fiqh", labelAr: "الفقه", labelEn: "Fiqh" },
  { id: "aqeedah", labelAr: "العقيدة", labelEn: "Aqeedah" },
  { id: "seerah", labelAr: "السيرة", labelEn: "Seerah" },
  { id: "adhkar", labelAr: "الأذكار", labelEn: "Adhkar" },
  { id: "dua", labelAr: "الأدعية", labelEn: "Duas" },
  { id: "names", labelAr: "الأسماء الحسنى", labelEn: "99 Names" },
];

export const UnifiedIslamicSearchPanel: React.FC<UnifiedIslamicSearchPanelProps> = ({
  lang = "ar",
  onNavigateResult,
}) => {
  const isAr = lang === "ar";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IslamicSearchCategory>("all");

  const results = useMemo(() => searchUnifiedIslamicCenter(query, category, 48), [query, category]);

  return (
    <div
      className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-4 shadow-sm"
      dir={isAr ? "rtl" : "ltr"}
      data-testid="unified-islamic-search-panel"
    >
      <div className="space-y-1">
        <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
          {isAr ? "محرك البحث الشامل في المركز الإسلامي" : "Unified Islamic Center Search"}
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {isAr
            ? "ابحث في وقت واحد عبر القرّاء، الدول، السور، التفسير، التجويد، الأربعين النووية، السنن، الفقه، العقيدة، السيرة، الأذكار، الأدعية، وأسماء الله الحسنى."
            : "Search simultaneously across countries, reciters, surahs, Tafsir guides, Tajweed rules, Forty Nawawi, Daily Sunnah, Fiqh, Aqeedah, Seerah, Adhkar, Duas, and Names of Allah."}
        </p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute start-3.5 top-3 text-stone-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            isAr
              ? "مثال: أحمد النفيس، الكويت، النون الساكنة، الوضوء، الكهف..."
              : "Try: Al-Nafis, Kuwait, Noon Sakinah, Wudu, Al-Kahf, Bukhari..."
          }
          className="w-full ps-10 pe-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
              category === cat.id
                ? "bg-emerald-700 text-white"
                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
            }`}
          >
            {isAr ? cat.labelAr : cat.labelEn}
          </button>
        ))}
      </div>

      {!query.trim() ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-xs text-stone-500">
          {isAr
            ? "ابدأ بكتابة أي كلمة عربية أو إنجليزية لعرض النتائج الفورية من جميع أقسام المركز الإسلامي."
            : "Type any Arabic or English keyword to search across every verified section of the Islamic Center."}
        </div>
      ) : results.length === 0 ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-xs text-stone-500">
          {isAr
            ? "لم يتم العثور على نتائج مطابقة لهذا البحث."
            : "No verified catalog matches found."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onNavigateResult(r)}
              className="flex items-start justify-between gap-2 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-emerald-500 bg-stone-50/60 dark:bg-stone-950 text-start transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400">
                  <span>{r.category}</span>
                  <span>·</span>
                  <span className="truncate">{r.sourceRef}</span>
                </div>
                <div className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                  {isAr ? r.titleAr : r.titleEn}
                  {r.titleAr !== r.titleEn && (
                    <span className="ms-1.5 font-normal text-[11px] text-stone-500 dark:text-stone-400">
                      ({isAr ? r.titleEn : r.titleAr})
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                  {isAr ? r.subtitleAr : r.subtitleEn}
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
