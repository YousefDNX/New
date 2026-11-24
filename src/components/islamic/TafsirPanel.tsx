import React, { useEffect, useMemo, useState } from "react";
import { SURAHS_INDEX } from "@/lib/quran-mushaf";
import { fetchSurahUthmaniVerses, type QuranVerse } from "@/lib/quran";
import {
  fetchVerseTafsirFromQuranCom,
  getOfflineSurahStudyGuide,
  VERIFIED_TAFSIR_EDITIONS,
  type FetchedVerseTafsir,
} from "@/lib/quran-tafsir";
import { ModernSelect } from "@/components/ui/modern-select";
import {
  AlertCircle,
  BookOpen,
  Headphones,
  Layers,
  Loader2,
  RefreshCw,
  ScrollText,
  ShieldCheck,
} from "lucide-react";

interface TafsirPanelProps {
  lang?: string;
  initialSurahId?: number;
  onOpenAudioSurah?: (surahId: number) => void;
  onOpenMushafPage?: (page: number) => void;
}

export const TafsirPanel: React.FC<TafsirPanelProps> = ({
  lang = "ar",
  initialSurahId = 1,
  onOpenAudioSurah,
  onOpenMushafPage,
}) => {
  const isAr = lang === "ar";
  const [surahId, setSurahId] = useState<number>(initialSurahId);
  const [ayahNumber, setAyahNumber] = useState<number>(1);
  const [editionId, setEditionId] = useState<number>(isAr ? 16 : 169);

  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [tafsir, setTafsir] = useState<FetchedVerseTafsir | null>(null);
  const [loadingVerse, setLoadingVerse] = useState<boolean>(false);
  const [loadingTafsir, setLoadingTafsir] = useState<boolean>(false);
  const [verseError, setVerseError] = useState<string | null>(null);
  const [tafsirError, setTafsirError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState<number>(0);

  useEffect(() => {
    setSurahId(initialSurahId);
    setAyahNumber(1);
  }, [initialSurahId]);

  const surahMeta = useMemo(
    () => SURAHS_INDEX.find((s) => s.id === surahId) ?? SURAHS_INDEX[0]!,
    [surahId],
  );

  const activeEdition = useMemo(
    () => VERIFIED_TAFSIR_EDITIONS.find((e) => e.id === editionId) ?? VERIFIED_TAFSIR_EDITIONS[0]!,
    [editionId],
  );

  const offlineGuide = useMemo(() => getOfflineSurahStudyGuide(surahId), [surahId]);

  useEffect(() => {
    let cancelled = false;
    setLoadingVerse(true);
    setVerseError(null);
    fetchSurahUthmaniVerses(surahId, { translationId: 20 })
      .then((list) => {
        if (!cancelled) {
          setVerses(list);
          setLoadingVerse(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setVerseError(
            err instanceof Error
              ? err.message
              : isAr
                ? "تعذر تحميل الآية والترجمة من واجهة القرآن."
                : "Could not load verse text and verified translation.",
          );
          setLoadingVerse(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [surahId, reloadNonce, isAr]);

  useEffect(() => {
    let cancelled = false;
    setLoadingTafsir(true);
    setTafsirError(null);
    fetchVerseTafsirFromQuranCom(editionId, surahId, ayahNumber)
      .then((res) => {
        if (!cancelled) {
          setTafsir(res);
          setLoadingTafsir(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setTafsir(null);
          setTafsirError(
            err instanceof Error
              ? err.message
              : isAr
                ? "تعذر جلب نص التفسير الكلاسيكي لهذه الآية حالياً."
                : "Unable to load classical Tafsir from Quran.com v4 right now.",
          );
          setLoadingTafsir(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [editionId, surahId, ayahNumber, reloadNonce, isAr]);

  const activeVerse = useMemo(
    () => verses.find((v) => v.verseNumber === ayahNumber) ?? verses[0] ?? null,
    [verses, ayahNumber],
  );

  const ayahNumbers = useMemo(
    () => Array.from({ length: surahMeta.versesCount }, (_, i) => i + 1),
    [surahMeta.versesCount],
  );

  return (
    <div className="space-y-5" dir={isAr ? "rtl" : "ltr"} data-testid="tafsir-portal-panel">
      {/* Header & Controls */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-emerald-600" />
              <span>
                {isAr
                  ? "بوابة التفسير الموثق وفهم القرآن الكريم"
                  : "Verified Classical Tafsir & Quran Understanding"}
              </span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {isAr
                ? "فصل صريح بين النص القرآني العثماني، والترجمة المعتمدة، ونص التفسير التراثي من Quran.com v4، والملخص التعليمي التمهيدي."
                : "Strict layer separation: verbatim Uthmani Quran text, verified translation, classical scholarly Tafsir via Quran.com v4, and educational thematic guides."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenAudioSurah && (
              <button
                type="button"
                onClick={() => onOpenAudioSurah(surahId)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold whitespace-nowrap"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{isAr ? "استماع للسورة" : "Listen to Surah"}</span>
              </button>
            )}
            {onOpenMushafPage && (
              <button
                type="button"
                onClick={() => onOpenMushafPage(surahMeta.startPage)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold text-stone-800 dark:text-stone-200 whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {isAr
                    ? `صفحة المصحف (${surahMeta.startPage})`
                    : `Mushaf Page (${surahMeta.startPage})`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Selectors: Surah, Ayah, Tafsir Book */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="space-y-1 text-xs">
            <span className="font-bold text-stone-700 dark:text-stone-300 block">
              {isAr ? "السورة:" : "Surah:"}
            </span>
            <ModernSelect
              ariaLabel={isAr ? "السورة" : "Surah"}
              size="sm"
              value={String(surahId)}
              onValueChange={(val) => {
                setSurahId(Number(val));
                setAyahNumber(1);
              }}
              options={SURAHS_INDEX.map((s) => ({
                value: String(s.id),
                label: `${s.id}. ${isAr ? s.nameAr : `${s.nameEn} (${s.nameAr})`}`,
              }))}
            />
          </div>

          <div className="space-y-1 text-xs">
            <span className="font-bold text-stone-700 dark:text-stone-300 block">
              {isAr ? "رقم الآية:" : "Ayah Number:"}
            </span>
            <ModernSelect
              ariaLabel={isAr ? "رقم الآية" : "Ayah Number"}
              size="sm"
              value={String(ayahNumber)}
              onValueChange={(val) => setAyahNumber(Number(val))}
              options={ayahNumbers.map((num) => ({
                value: String(num),
                label: `${surahId}:${num}`,
              }))}
            />
          </div>

          <div className="space-y-1 text-xs">
            <span className="font-bold text-stone-700 dark:text-stone-300 block">
              {isAr ? "كتاب التفسير المعتمد:" : "Verified Classical Tafsir Edition:"}
            </span>
            <ModernSelect
              ariaLabel={isAr ? "كتاب التفسير المعتمد" : "Verified Classical Tafsir Edition"}
              size="sm"
              value={String(editionId)}
              onValueChange={(val) => setEditionId(Number(val))}
              options={VERIFIED_TAFSIR_EDITIONS.map((ed) => ({
                value: String(ed.id),
                label: isAr
                  ? `${ed.nameAr} (${ed.languageLabel})`
                  : `${ed.nameEn} (${ed.languageLabel})`,
              }))}
            />
          </div>
        </div>
      </div>

      {/* LAYER 1: Authentic Quran Text (Uthmani Script) */}
      <section
        data-testid="tafsir-layer-quran"
        className="rounded-2xl border-2 border-emerald-600/35 bg-emerald-50/40 dark:bg-emerald-950/25 p-5 space-y-2.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isAr
                ? "١. نص القرآن الكريم (الرسم العثماني — غير محرّف)"
                : "1. Verbatim Quranic Scripture (King Fahd Uthmani Text)"}
            </span>
          </span>
          <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
            {surahMeta.nameEn} ({surahId}:{ayahNumber})
          </span>
        </div>

        {loadingVerse ? (
          <div className="flex items-center gap-2 py-4 text-xs text-stone-500">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>{isAr ? "جاري تحميل نص الآية..." : "Loading Uthmani verse text..."}</span>
          </div>
        ) : verseError ? (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-red-700 dark:text-red-300">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {verseError}
            </span>
            <button
              type="button"
              onClick={() => setReloadNonce((n) => n + 1)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold"
            >
              <RefreshCw className="w-3 h-3" />
              {isAr ? "إعادة المحاولة" : "Retry"}
            </button>
          </div>
        ) : activeVerse ? (
          <p
            dir="rtl"
            className="text-right font-serif text-2xl sm:text-3xl leading-[2.2] text-stone-950 dark:text-stone-50 pt-1"
          >
            {activeVerse.textUthmani}{" "}
            <span className="text-emerald-700 dark:text-emerald-400">﴿{ayahNumber}﴾</span>
          </p>
        ) : null}
      </section>

      {/* LAYER 2: Verified Translation */}
      <section
        data-testid="tafsir-layer-translation"
        className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-2"
      >
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-bold text-stone-800 dark:text-stone-200">
            {isAr
              ? "٢. ترجمة المعاني الموثقة (وليست قرآناً منزلاً)"
              : "2. Verified Meaning Translation (Interpretive — Not Scripture)"}
          </span>
          <span className="text-[11px] font-mono text-stone-500">Saheeh International</span>
        </div>
        <p dir="ltr" className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
          {activeVerse?.translationText ??
            (loadingVerse
              ? isAr
                ? "جاري تحميل الترجمة..."
                : "Loading verified translation..."
              : isAr
                ? "الترجمة متوفرة عند الاتصال بواجهة القرآن."
                : "Translation appears once Quran.com v4 loads.")}
        </p>
      </section>

      {/* LAYER 3: Classical Tafsir Commentary */}
      <section
        data-testid="tafsir-layer-classical"
        className="rounded-2xl border border-amber-500/35 bg-amber-50/35 dark:bg-stone-900 p-5 space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-amber-500/20 pb-2.5">
          <div>
            <span className="font-bold text-amber-900 dark:text-amber-300 block">
              {isAr ? "٣. التفسير الكلاسيكي المعتمد" : "3. Classical Scholarly Tafsir Commentary"}
            </span>
            <span className="text-[11px] text-stone-600 dark:text-stone-400">
              {isAr ? activeEdition.nameAr : activeEdition.nameEn} —{" "}
              {isAr ? activeEdition.authorAr : activeEdition.authorEn}
            </span>
          </div>
          <span className="font-mono text-[10px] text-amber-800 dark:text-amber-400">
            Quran.com API v4 #{activeEdition.id}
          </span>
        </div>

        <p className="text-[11px] text-stone-500 dark:text-stone-400">
          {isAr ? activeEdition.editionNoteAr : activeEdition.editionNoteEn}
        </p>

        {loadingTafsir ? (
          <div className="flex items-center gap-2 py-6 text-xs text-stone-500">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            <span>
              {isAr ? "جاري جلب نص التفسير للآية..." : "Fetching classical Tafsir text..."}
            </span>
          </div>
        ) : tafsirError ? (
          <div className="rounded-xl border border-amber-500/30 bg-white dark:bg-stone-950 p-4 text-xs space-y-2">
            <div className="text-amber-800 dark:text-amber-300 font-semibold">{tafsirError}</div>
            <button
              type="button"
              onClick={() => setReloadNonce((n) => n + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {isAr ? "تحديث التفسير" : "Retry Tafsir Load"}
            </button>
          </div>
        ) : tafsir ? (
          <div
            dir={tafsir.languageCode === "ar" ? "rtl" : "ltr"}
            className="text-sm leading-loose text-stone-800 dark:text-stone-200 whitespace-pre-line max-h-96 overflow-y-auto pe-2"
          >
            {tafsir.textHtmlRemoved}
          </div>
        ) : null}
      </section>

      {/* LAYER 4: Educational Study Overview (Offline Fallback & Context) */}
      <section
        data-testid="tafsir-layer-study-overview"
        className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/70 p-5 space-y-3 text-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>
              {isAr
                ? "٤. الملخص التعليمي للموضوعات (محتوى دراسي — ليس نصاً قرآنياً ولا تفسيراً مسنداً مستقلاً)"
                : "4. Educational Surah Study Overview (Non-Scripture Study Summary)"}
            </span>
          </span>
        </div>

        {offlineGuide ? (
          <div className="space-y-2.5">
            <div className="font-semibold text-emerald-800 dark:text-emerald-300">
              {isAr
                ? `سورة ${offlineGuide.surahNameAr} (${offlineGuide.revelationPeriodAr})`
                : `Surah ${offlineGuide.surahNameEn} (${offlineGuide.revelationPeriodEn})`}
            </div>
            <ul className="list-disc ps-5 space-y-1 text-stone-700 dark:text-stone-300">
              {(isAr ? offlineGuide.coreThemesAr : offlineGuide.coreThemesEn).map((theme, idx) => (
                <li key={idx}>{theme}</li>
              ))}
            </ul>
            <div className="rounded-xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-3 text-stone-700 dark:text-stone-300">
              <strong>{isAr ? "تأمل دراسي: " : "Study Reflection: "}</strong>
              {isAr ? offlineGuide.studyReflectionPromptAr : offlineGuide.studyReflectionPromptEn}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400">
              {isAr ? offlineGuide.tafsirReferenceNoteAr : offlineGuide.tafsirReferenceNoteEn}
            </div>
          </div>
        ) : (
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
            {isAr
              ? `الملخصات التمهيدية بدون إنترنت متوفرة حالياً للسور المختارة (الفاتحة، البقرة، الكهف، يس، الملك، الإخلاص). استخدم طبقة التفسير الكلاسيكي أعلاه لدراسة سورة ${surahMeta.nameAr} آية بآية من المصدر الموثوق.`
              : `Offline thematic summaries are provided for key foundational Surahs (1, 2, 18, 36, 67, 112). For Surah ${surahMeta.nameEn}, refer to the live classical Tafsir commentary layer above.`}
          </p>
        )}
      </section>
    </div>
  );
};
