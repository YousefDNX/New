import React, { useState } from "react";
import { VERIFIED_DAILY_ADHKAR, type DhikrRecord } from "@/data/islamic-center";
import { toArabicIndicDigits } from "@/lib/quran";
import {
  Sun,
  Moon,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

interface DailyAdhkarPanelProps {
  lang?: string;
}

export const DailyAdhkarPanel: React.FC<DailyAdhkarPanelProps> = ({ lang = "ar" }) => {
  const [activeCategory, setActiveCategory] = useState<
    "morning" | "evening" | "post_prayer" | "sleep_wake"
  >("morning");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredAdhkar = VERIFIED_DAILY_ADHKAR.filter((item) => {
    if (activeCategory === "sleep_wake") {
      return item.category === "sleep" || item.category === "waking";
    }
    if (activeCategory === "post_prayer") {
      return item.category === "after_prayer";
    }
    return item.category === activeCategory;
  });

  const incrementCount = (id: string, targetCount: number) => {
    setCounts((prev) => {
      const current = prev[id] || 0;
      if (current >= targetCount) return prev;
      return { ...prev, [id]: current + 1 };
    });
  };

  const resetCount = (id: string) => {
    setCounts((prev) => ({ ...prev, [id]: 0 }));
  };

  const handleCopy = (item: DhikrRecord) => {
    const text = `${item.textAr}\n\n[المصدر: ${item.sourceReference}]`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <button
          onClick={() => setActiveCategory("morning")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeCategory === "morning"
              ? "bg-amber-500 text-stone-950 shadow-sm"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>أذكار الصباح</span>
        </button>

        <button
          onClick={() => setActiveCategory("evening")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeCategory === "evening"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
          }`}
        >
          <Moon className="w-4 h-4" />
          <span>أذكار المساء</span>
        </button>

        <button
          onClick={() => setActiveCategory("post_prayer")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeCategory === "post_prayer"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>أذكار ما بعد الصلاة المكتوبة</span>
        </button>

        <button
          onClick={() => setActiveCategory("sleep_wake")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeCategory === "sleep_wake"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>أذكار النوم والاستيقاظ</span>
        </button>
      </div>

      {/* Adhkar Cards List */}
      <div className="space-y-4">
        {filteredAdhkar.map((item) => {
          const count = counts[item.id] || 0;
          const isCompleted = count >= item.targetCount;

          return (
            <div
              key={item.id}
              className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                isCompleted
                  ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/40"
                  : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-sm"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold text-xs">
                    {item.targetCount}×
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{item.sourceReference}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => handleCopy(item)}
                    className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-emerald-600 text-xs transition-colors"
                    title="نسخ الذكر"
                    aria-label="نسخ نص الذكر"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => resetCount(item.id)}
                    className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-400 hover:text-stone-700 text-xs transition-colors"
                    title="إعادة تعيين العداد"
                    aria-label="إعادة تعيين العداد"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Arabic Dhikr Text */}
              <div
                className="py-5 text-right font-serif text-lg sm:text-xl text-stone-900 dark:text-stone-100 leading-[2.2] select-text"
                style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
              >
                {item.textAr}
              </div>

              {/* Virtue & Reward */}
              {item.virtueExplanationAr && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>فضل هذا الذكر:</span>
                  </span>
                  <p className="leading-relaxed opacity-95">{item.virtueExplanationAr}</p>
                </div>
              )}

              {/* Interactive Counter Button */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  onClick={() => incrementCount(item.id, item.targetCount)}
                  disabled={isCompleted}
                  className={`flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-[0.98] ${
                    isCompleted
                      ? "bg-emerald-600 text-white cursor-default"
                      : "bg-emerald-700 hover:bg-emerald-800 text-white"
                  }`}
                  aria-label={`تكرار الذكر، تم ${count} من ${item.targetCount}`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-white" />
                      <span>اكتمل التكرار ({toArabicIndicDigits(item.targetCount)} مرة)</span>
                    </>
                  ) : (
                    <>
                      <span>انقر للتكرار</span>
                      <span className="font-mono text-base bg-emerald-800/80 px-2.5 py-0.5 rounded-lg">
                        {count} / {item.targetCount}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
