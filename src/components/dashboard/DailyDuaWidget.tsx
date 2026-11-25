import React, { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  Heart,
  Copy,
  Check,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  Volume2,
  Share2,
  ArrowRight,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { VERIFIED_DAILY_ADHKAR, type DhikrRecord } from "@/data/islamic-center";

interface DailyDuaWidgetProps {
  lang?: string;
  className?: string;
}

const FAVORITE_DUAS_STORAGE_KEY = "btc_favorite_duas_storage_v1";

export const DailyDuaWidget: React.FC<DailyDuaWidgetProps> = ({ lang = "ar", className = "" }) => {
  const isAr = lang === "ar";

  // Pick a rotating duaa daily or allow cycling
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    // Rotate based on day of year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dayOfYear % VERIFIED_DAILY_ADHKAR.length;
  });

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem(FAVORITE_DUAS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return ["adhkar_morn_kursi", "adhkar_morn_sayyid_istighfar"];
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(FAVORITE_DUAS_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // Ignore
    }
  }, [favoriteIds]);

  const currentItem = useMemo(() => {
    if (showOnlyFavorites && favoriteIds.length > 0) {
      const favList = VERIFIED_DAILY_ADHKAR.filter((item) => favoriteIds.includes(item.id));
      const idx = currentIndex % favList.length;
      return favList[idx] ?? VERIFIED_DAILY_ADHKAR[0]!;
    }
    return VERIFIED_DAILY_ADHKAR[currentIndex % VERIFIED_DAILY_ADHKAR.length]!;
  }, [currentIndex, favoriteIds, showOnlyFavorites]);

  const isFavorite = favoriteIds.includes(currentItem.id);

  const handleToggleFavorite = () => {
    setFavoriteIds((prev) => {
      const next = prev.includes(currentItem.id)
        ? prev.filter((id) => id !== currentItem.id)
        : [...prev, currentItem.id];
      return next;
    });
  };

  const handleNextDua = () => {
    setCurrentIndex((prev) => (prev + 1) % VERIFIED_DAILY_ADHKAR.length);
  };

  const handleCopyDua = () => {
    const text = `${currentItem.textAr}\n\n[${currentItem.categoryLabelAr} · ${currentItem.sourceReference}]\n— ${currentItem.virtueExplanationAr}`;
    if (navigator?.clipboard?.writeText) {
      void navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      data-testid="daily-dua-adhkar-widget"
      className={`rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 dark:from-emerald-950/40 dark:via-stone-900 dark:to-stone-900 p-5 sm:p-6 shadow-sm space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="size-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {isAr ? "الدعاء والذكر اليومي" : "Daily Supplication & Adhkar"}
            </span>
            <h4 className="text-sm sm:text-base font-bold font-serif text-stone-900 dark:text-stone-100">
              {isAr ? currentItem.categoryLabelAr : currentItem.categoryLabelEn}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={isAr ? "حفظ في المفضلة" : "Bookmark duaa"}
            title={isAr ? "حفظ في المفضلة" : "Bookmark duaa"}
            className={`size-8 rounded-lg flex items-center justify-center transition-colors ${
              isFavorite
                ? "bg-emerald-600 text-white"
                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-emerald-600"
            }`}
          >
            {isFavorite ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
          </button>

          <button
            type="button"
            onClick={handleNextDua}
            aria-label={isAr ? "دعاء تالي" : "Next supplication"}
            title={isAr ? "دعاء تالي" : "Next supplication"}
            className="size-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-emerald-600 flex items-center justify-center transition-colors"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Main Dhikr / Duaa Text */}
      <div className="rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-950/70 p-4 sm:p-5 space-y-3">
        <p
          className="text-base sm:text-lg font-serif leading-loose text-stone-900 dark:text-stone-100 text-center py-1"
          style={{ fontFamily: "'Amiri', serif" }}
        >
          {currentItem.textAr}
        </p>

        {currentItem.virtueExplanationAr && (
          <p className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 leading-relaxed">
            <strong>{isAr ? "المنفعة والفضل:" : "Virtue / Benefit:"}</strong>{" "}
            {isAr ? currentItem.virtueExplanationAr : currentItem.virtueExplanationEn}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 font-mono">
          <span>{currentItem.sourceReference}</span>
          <span>
            {isAr
              ? `التكرار المطلوب: ${currentItem.targetCount} مرات`
              : `Target: ${currentItem.targetCount}x`}
          </span>
        </div>
      </div>

      {/* Footer Actions & Link to Islamic Center */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={handleCopyDua}
          className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:border-emerald-500 transition-colors"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-600" />
              <span>{isAr ? "تم النسخ" : "Copied"}</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>{isAr ? "نسخ ومشاركة" : "Copy & Share"}</span>
            </>
          )}
        </button>

        <Link
          to="/app/quran"
          search={{ islamic_tab: "adhkar" }}
          className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
        >
          <span>{isAr ? "فتح موسوعة الأذكار كاملة" : "Open Full Adhkar Library"}</span>
          <ArrowRight className={`size-3.5 ${isAr ? "rotate-180" : ""}`} />
        </Link>
      </div>
    </div>
  );
};
