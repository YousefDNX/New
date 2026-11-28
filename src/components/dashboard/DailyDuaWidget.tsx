import React, { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { VERIFIED_DAILY_ADHKAR } from "@/data/islamic-center";

interface DailyDuaWidgetProps {
  lang?: string;
  className?: string;
}

const FAVORITE_DUAS_STORAGE_KEY = "btc_favorite_duas_storage_v1";

export const DailyDuaWidget: React.FC<DailyDuaWidgetProps> = ({ lang = "ar", className = "" }) => {
  const isAr = lang === "ar";

  // Pick a rotating duaa daily or allow cycling
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([
    "adhkar_morn_kursi",
    "adhkar_morn_sayyid_istighfar",
  ]);

  const [copied, setCopied] = useState<boolean>(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const isFirstMount = React.useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    setCurrentIndex(dayOfYear % VERIFIED_DAILY_ADHKAR.length);

    try {
      const saved = window.localStorage.getItem(FAVORITE_DUAS_STORAGE_KEY);
      if (saved) {
        setFavoriteIds(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(FAVORITE_DUAS_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // Ignore
    }
  }, [favoriteIds]);

  const activeList = useMemo(() => {
    if (showOnlyFavorites) {
      return VERIFIED_DAILY_ADHKAR.filter((item) => favoriteIds.includes(item.id));
    }
    return VERIFIED_DAILY_ADHKAR;
  }, [favoriteIds, showOnlyFavorites]);

  const safeIndex = activeList.length > 0 ? currentIndex % activeList.length : 0;
  const currentItem = activeList[safeIndex] ?? VERIFIED_DAILY_ADHKAR[0]!;
  const isFavorite = favoriteIds.includes(currentItem.id);
  const noFavoritesInFilter = showOnlyFavorites && activeList.length === 0;

  const handleToggleFavorite = () => {
    setFavoriteIds((prev) =>
      prev.includes(currentItem.id)
        ? prev.filter((id) => id !== currentItem.id)
        : [...prev, currentItem.id],
    );
  };

  const handleNextDua = () => {
    const len = Math.max(1, activeList.length);
    setCurrentIndex((prev) => (prev + 1) % len);
  };

  const handlePrevDua = () => {
    const len = Math.max(1, activeList.length);
    setCurrentIndex((prev) => (prev - 1 + len) % len);
  };

  const handleCopyDua = () => {
    const label = isAr ? currentItem.categoryLabelAr : currentItem.categoryLabelEn;
    const virtue = isAr ? currentItem.virtueExplanationAr : currentItem.virtueExplanationEn;
    const text = `${currentItem.textAr}\n\n[${label} · ${currentItem.sourceReference}]${virtue ? `\n— ${virtue}` : ""}`;
    if (navigator?.clipboard?.writeText) {
      void navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
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
      className={`flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 dark:from-emerald-950/40 dark:via-stone-900 dark:to-stone-900 p-5 sm:p-6 shadow-sm space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-9 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="size-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {isAr ? "الدعاء والذكر اليومي · خالص لله" : "Daily Supplication & Azkar"}
            </span>
            <h4 className="text-sm sm:text-base font-bold font-serif text-stone-900 dark:text-stone-100 truncate">
              {isAr ? currentItem.categoryLabelAr : currentItem.categoryLabelEn}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowOnlyFavorites((v) => !v);
              setCurrentIndex(0);
            }}
            data-testid="dua-favorites-filter-btn"
            aria-pressed={showOnlyFavorites}
            className={`min-h-[40px] px-2.5 rounded-lg inline-flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              showOnlyFavorites
                ? "bg-emerald-600 text-white"
                : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-emerald-600"
            }`}
          >
            <Bookmark className="size-3.5" />
            <span>
              {isAr ? `المفضلة (${favoriteIds.length})` : `Saved (${favoriteIds.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={isAr ? "حفظ في المفضلة" : "Bookmark duaa"}
            title={isAr ? "حفظ في المفضلة" : "Bookmark duaa"}
            aria-pressed={isFavorite}
            className={`size-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              isFavorite
                ? "bg-emerald-600 text-white"
                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-emerald-600"
            }`}
          >
            {isFavorite ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
          </button>

          <button
            type="button"
            onClick={handlePrevDua}
            aria-label={isAr ? "دعاء سابق" : "Previous supplication"}
            title={isAr ? "دعاء سابق" : "Previous supplication"}
            className="size-10 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-emerald-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className={`size-4 ${isAr ? "" : "rotate-180"}`} />
          </button>

          <button
            type="button"
            onClick={handleNextDua}
            aria-label={isAr ? "دعاء تالي" : "Next supplication"}
            title={isAr ? "دعاء تالي" : "Next supplication"}
            className="size-10 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-emerald-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            {showOnlyFavorites ? (
              <ChevronLeft className={`size-4 ${isAr ? "" : "rotate-180"}`} />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Dhikr / Duaa Text or Empty Favorites State */}
      {noFavoritesInFilter ? (
        <div className="rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-950/70 p-6 text-center space-y-3">
          <p className="text-sm text-stone-700 dark:text-stone-300">
            {isAr
              ? "لا توجد أدعية محفوظة في المفضلة حالياً. اضغط على زر الحفظ لإضافة أذكارك المختارة."
              : "No supplications saved yet. Tap the bookmark icon on any supplication to save it here."}
          </p>
          <button
            type="button"
            onClick={() => setShowOnlyFavorites(false)}
            className="min-h-[40px] inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
          >
            {isAr ? "عرض جميع الأذكار" : "Show All Azkar"}
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-950/70 p-4 sm:p-5 space-y-3">
          <p
            className="text-base sm:text-lg font-serif leading-loose text-stone-900 dark:text-stone-100 text-center py-1"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            {currentItem.textAr}
          </p>

          {!isAr && currentItem.translationEn && (
            <p className="text-xs text-stone-600 dark:text-stone-300 text-center leading-relaxed">
              {currentItem.translationEn}
            </p>
          )}

          {currentItem.virtueExplanationAr && (
            <p className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 leading-relaxed">
              <strong>{isAr ? "المنفعة والفضل:" : "Virtue / Benefit:"}</strong>{" "}
              {isAr ? currentItem.virtueExplanationAr : currentItem.virtueExplanationEn}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 font-mono">
            <span>{currentItem.sourceReference}</span>
            <span>
              {activeList.length > 0 && `${safeIndex + 1}/${activeList.length} · `}
              {isAr
                ? `التكرار المطلوب: ${currentItem.targetCount} مرات`
                : `Target: ${currentItem.targetCount}x`}
            </span>
          </div>
        </div>
      )}

      {/* Footer Actions & Link to Islamic Center */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={handleCopyDua}
          className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:border-emerald-500 transition-colors cursor-pointer"
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
          className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
        >
          <span>{isAr ? "فتح موسوعة الأذكار كاملة" : "Open Full Azkar Library"}</span>
          <ArrowRight className={`size-3.5 ${isAr ? "rotate-180" : ""}`} />
        </Link>
      </div>
    </div>
  );
};
