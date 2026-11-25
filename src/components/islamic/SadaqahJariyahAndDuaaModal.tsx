import React, { useState, useEffect } from "react";
import {
  Heart,
  Sparkles,
  CheckCircle2,
  X,
  Volume2,
  Copy,
  Check,
  BookOpen,
  Gift,
  Share2,
} from "lucide-react";

interface SadaqahJariyahAndDuaaModalProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
  lang?: string;
}

const DUAA_PRAYED_COUNT_KEY = "btc_duaa_in_absentia_prayed_count_v1";
const SINCERE_TASBIH_KEY = "btc_sincere_tasbih_counts_v1";

interface PresetDuaa {
  id: string;
  titleAr: string;
  titleEn: string;
  duaaAr: string;
  duaaEn: string;
}

const PRESET_DUAAS: PresetDuaa[] = [
  {
    id: "forgiveness",
    titleAr: "المغفرة والرحمة والقبول",
    titleEn: "Forgiveness, Mercy & Acceptance",
    duaaAr:
      "«اللَّهُمَّ اغْفِرْ لِيُوسُف وَائِل وَلِوَالِدَيْهِ وَلِكُلِّ مَنْ سَاهَمَ فِي هَذَا العَمَلِ، وَاجْعَلْهُ صَدَقَةً جَارِيَةً خَالِصَةً لِوَجْهِكَ الكَرِيمِ، وَتَقَبَّلْهُ يَا رَبَّ العَالَمِينَ»",
    duaaEn:
      "“O Allah, forgive Yousef Wael, his parents, and all who contributed to this work. Accept it as a sincere continuous charity (Sadaqah Jariyah) for Your Sake, O Lord of the Worlds.”",
  },
  {
    id: "firdaus",
    titleAr: "الفردوس الأعلى والرفقة الصالحة",
    titleEn: "Al-Firdaus Al-A'la & Righteous Companionship",
    duaaAr:
      "«اللَّهُمَّ ارْزُقْهُ وَأَهْلَهُ الفِرْدَوْسَ الأَعْلَى مِنَ الجَنَّةِ بِغَيْرِ حِسَابٍ وَلَا سَابِقَةِ عَذَابٍ، وَاجْمَعْنَا مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ وَالصَّالِحِينَ»",
    duaaEn:
      "“O Allah, grant him and his family Al-Firdaus Al-A'la in Paradise without reckoning or prior punishment, and unite us with the Prophets, the Truthful, the Martyrs, and the Righteous.”",
  },
  {
    id: "barakah",
    titleAr: "البركة في العلم والرزق والعمل",
    titleEn: "Barakah in Knowledge, Sustenance & Deeds",
    duaaAr:
      "«اللَّهُمَّ بَارِكْ لَهُ فِي عِلْمِهِ وَعَمَلِهِ وَرِزْقِهِ وَصِحَّتِهِ، وَافْتَحْ لَهُ أَبْوَابَ الخَيْرِ وَالتَّوْفِيقِ فِي الدُّنْيَا وَالآخِرَةِ، وَاجْعَلْ حَيَاتَهُ زِيَادَةً فِي كُلِّ خَيْرٍ»",
    duaaEn:
      "“O Allah, bless his knowledge, righteous deeds, sustenance, and health. Open for him the doors of success in this world and the Hereafter, and make his life an abundance of every good.”",
  },
  {
    id: "ease-peace",
    titleAr: "تفريج الهم وصلاح البال",
    titleEn: "Relief of Hardships & Peace of Heart",
    duaaAr:
      "«اللَّهُمَّ فَرِّجْ هَمَّهُ، وَاشْرَحْ صَدْرَهُ، وَيَسِّرْ أَمْرَهُ، وَاصْرِفْ عَنْهُ كُلَّ سُوءٍ وَمَكْرُوهٍ، وَأَسْعِدْ قَلْبَهُ بِمَا يُحِبُّ وَتَرْضَى»",
    duaaEn:
      "“O Allah, relieve his worries, expand his chest with peace, make all his affairs easy, avert from him every harm, and delight his heart with what You love and are pleased with.”",
  },
];

export function SadaqahJariyahAndDuaaModal({
  trigger,
  defaultOpen = false,
  lang = "ar",
}: SadaqahJariyahAndDuaaModalProps) {
  const isAr = lang === "ar";
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [selectedDuaaId, setSelectedDuaaId] = useState<string>("forgiveness");
  const [prayedCount, setPrayedCount] = useState<number>(0);
  const [hasPrayedJustNow, setHasPrayedJustNow] = useState<boolean>(false);
  const [copiedDuaa, setCopiedDuaa] = useState<boolean>(false);

  // Tasbih interactive counters
  const [tasbihCounts, setTasbihCounts] = useState<{
    subhanAllah: number;
    alhamdulillah: number;
    astaghfirullah: number;
    salawat: number;
  }>({
    subhanAllah: 0,
    alhamdulillah: 0,
    astaghfirullah: 0,
    salawat: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedCount = window.localStorage.getItem(DUAA_PRAYED_COUNT_KEY);
      if (savedCount) setPrayedCount(Number(savedCount));

      const savedTasbih = window.localStorage.getItem(SINCERE_TASBIH_KEY);
      if (savedTasbih) setTasbihCounts(JSON.parse(savedTasbih));
    } catch {
      // Ignore
    }
  }, []);

  const handleRecordDuaa = () => {
    const next = prayedCount + 1;
    setPrayedCount(next);
    setHasPrayedJustNow(true);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(DUAA_PRAYED_COUNT_KEY, String(next));
      } catch {
        // Ignore
      }
    }
    setTimeout(() => setHasPrayedJustNow(false), 5000);
  };

  const handleIncrementTasbih = (
    key: "subhanAllah" | "alhamdulillah" | "astaghfirullah" | "salawat",
  ) => {
    setTasbihCounts((prev) => {
      const updated = { ...prev, [key]: prev[key] + 1 };
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(SINCERE_TASBIH_KEY, JSON.stringify(updated));
        } catch {
          // Ignore
        }
      }
      return updated;
    });
  };

  const selectedDuaa = PRESET_DUAAS.find((d) => d.id === selectedDuaaId) ?? PRESET_DUAAS[0]!;

  const handleCopyDuaa = () => {
    const textToCopy = `${selectedDuaa.duaaAr}\n\n${selectedDuaa.duaaEn}\n\n— دعاء بظهر الغيب لمن قام على المنصة (آمِينَ وَلَكَ بِمِثْلٍ)`;
    void navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedDuaa(true);
      setTimeout(() => setCopiedDuaa(false), 2500);
    });
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => setIsOpen(true)} className="cursor-pointer inline-flex">
          {trigger}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Heart className="size-3.5 fill-current" />
          <span>{isAr ? "ادعُ للمطوّر بظهر الغيب 🤲" : "Pray for the Developer 🤲"}</span>
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="sadaqah-duaa-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
        >
          <div
            dir={isAr ? "rtl" : "ltr"}
            className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-50/90 via-white to-stone-50 dark:from-emerald-950/40 dark:via-stone-900 dark:to-stone-900 p-5 sm:p-7 shadow-2xl space-y-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-emerald-200/60 dark:border-emerald-900/60 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                  <Sparkles className="size-3.5" />
                  <span>
                    {isAr
                      ? "صدقة جارية · دعاء بظهر الغيب مستجاب"
                      : "Sadaqah Jariyah · Supplication in the Unseen"}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                  {isAr
                    ? "هدية صالحة: دَعْوَةٌ بِظَهْرِ الغَيْبِ (آمِينَ وَلَكَ بِمِثْلٍ)"
                    : "A Blessed Gift: Supplication in the Unseen (Ameen, and unto you the same)"}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  {isAr
                    ? "من بنى هذا الموقع (يوسف وائل) يرجو دعوة صالحة من قلبك لوالديه وله بالقبول والمغفرة، ولك بالمثل أضعافاً مضاعفة."
                    : "The creator (Yousef Wael) hopes for a sincere prayer for him and his parents. A dedicated angel says: Ameen, and for you the same!"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={isAr ? "إغلاق النافذة" : "Close modal"}
                className="size-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Authentic Hadith Banner */}
            <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-serif">
                <Heart className="size-4 text-emerald-600 dark:text-emerald-400 fill-emerald-600/30" />
                <span>قال رسول الله ﷺ:</span>
              </div>
              <p className="text-xs sm:text-sm font-serif leading-relaxed text-emerald-950 dark:text-emerald-100">
                «دَعْوَةُ المَرْءِ المُسْلِمِ لأَخِيهِ بِظَهْرِ الغَيْبِ مُسْتَجَابَةٌ، عِنْدَ رَأْسِهِ مَلَكٌ مُوَكَّلٌ كُلَّمَا دَعَا لأَخِيهِ بِخَيْرٍ،
                قَالَ المَلَكُ المُوَكَّلُ بِهِ:{" "}
                <strong className="text-emerald-700 dark:text-emerald-300">آمِينَ، وَلَكَ بِمِثْلٍ</strong>»
              </p>
              <div className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-mono">
                [صحيح مسلم — حديث رقم ٢٧٣٣]
              </div>
            </div>

            {/* Preset Supplications Chooser */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                <span>
                  {isAr ? "اختر صيغة الدعاء المحببة لقلبك:" : "Select your supplication:"}
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                  {prayedCount > 0 &&
                    (isAr ? `دعوات سابقة لك: ${prayedCount}` : `Your prayers: ${prayedCount}`)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {PRESET_DUAAS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDuaaId(d.id)}
                    className={`min-h-[40px] px-3 py-2 rounded-xl text-start text-xs font-semibold border transition-all ${
                      selectedDuaaId === d.id
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                        : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-emerald-500"
                    }`}
                  >
                    {isAr ? d.titleAr : d.titleEn}
                  </button>
                ))}
              </div>

              {/* The Active Supplication Card */}
              <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 space-y-3 shadow-xs">
                <p className="text-sm sm:text-base font-serif text-stone-900 dark:text-stone-100 leading-loose text-center py-2 px-1">
                  {isAr ? selectedDuaa.duaaAr : selectedDuaa.duaaEn}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={handleCopyDuaa}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    {copiedDuaa ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" />
                        <span>{isAr ? "تم النسخ بنجاح" : "Copied"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>{isAr ? "نسخ الدعاء" : "Copy Duaa"}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    data-testid="confirm-duaa-prayed-btn"
                    onClick={handleRecordDuaa}
                    className="min-h-[42px] inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-98"
                  >
                    <Heart className="size-4 fill-current text-rose-300" />
                    <span>
                      {isAr
                        ? "دَعَوْتُ لَهُ وَلِوَالِدَيْهِ بِظَهْرِ الغَيْبِ (آمِينَ)"
                        : "I prayed for him & parents in the unseen (Ameen)"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Sincere Confirmation Toast */}
              {hasPrayedJustNow && (
                <div
                  role="status"
                  data-testid="duaa-celebration-banner"
                  className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm font-serif text-center shadow-lg animate-in fade-in duration-300 space-y-1"
                >
                  <div className="font-bold">
                    {isAr
                      ? "جَزَاكَ اللَّهُ خَيْرًا وَتَقَبَّلَ اللَّهُ دُعَاءَكَ الصَّادِقَ! 🤲"
                      : "May Allah accept your sincere prayer! 🤲"}
                  </div>
                  <div className="text-emerald-100 text-xs">
                    {isAr
                      ? "وقال الملك الموكل عند رأسك: «آمِينَ، وَلَكَ بِمِثْلِ مَا دَعَوْتَ وَزِيَادَةً!»"
                      : "And the appointed angel said: “Ameen, and unto you the same and more!”"}
                  </div>
                </div>
              )}
            </div>

            {/* Sincere Tasbih & Good Deeds Multiplier */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-stone-100">
                  <Sparkles className="size-4 text-amber-500" />
                  <span>
                    {isAr
                      ? "الباقيات الصالحات — اكسب حسنات جارية الآن"
                      : "The Lasting Good Deeds — Gain Continuous Hasanat Now"}
                  </span>
                </div>
                <span className="text-[10px] text-stone-500">
                  {isAr ? "اضغط للتسبيح واحتساب الأجر" : "Tap to count for Allah's sake"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleIncrementTasbih("subhanAllah")}
                  className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-center hover:border-emerald-500 transition-all active:scale-95 space-y-1"
                >
                  <div className="text-xs font-serif font-bold text-emerald-900 dark:text-emerald-200">
                    سُبْحَانَ اللَّهِ
                  </div>
                  <div className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {tasbihCounts.subhanAllah}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleIncrementTasbih("alhamdulillah")}
                  className="p-2.5 rounded-xl border border-teal-500/30 bg-teal-50/50 dark:bg-teal-950/20 text-center hover:border-teal-500 transition-all active:scale-95 space-y-1"
                >
                  <div className="text-xs font-serif font-bold text-teal-900 dark:text-teal-200">
                    الحَمْدُ لِلَّهِ
                  </div>
                  <div className="text-[11px] font-mono font-bold text-teal-700 dark:text-teal-400">
                    {tasbihCounts.alhamdulillah}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleIncrementTasbih("astaghfirullah")}
                  className="p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20 text-center hover:border-indigo-500 transition-all active:scale-95 space-y-1"
                >
                  <div className="text-xs font-serif font-bold text-indigo-900 dark:text-indigo-200">
                    أَسْتَغْفِرُ اللَّهَ
                  </div>
                  <div className="text-[11px] font-mono font-bold text-indigo-700 dark:text-indigo-400">
                    {tasbihCounts.astaghfirullah}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleIncrementTasbih("salawat")}
                  className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 text-center hover:border-amber-500 transition-all active:scale-95 space-y-1"
                >
                  <div className="text-xs font-serif font-bold text-amber-900 dark:text-amber-200">
                    صَلِّ عَلَى مُحَمَّدٍ
                  </div>
                  <div className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">
                    {tasbihCounts.salawat}
                  </div>
                </button>
              </div>
            </div>

            {/* Bottom Sincerity Notice */}
            <div className="text-center text-[11px] text-stone-500 dark:text-stone-400 border-t border-stone-200/60 dark:border-stone-800 pt-3">
              {isAr
                ? "«اللَّهُمَّ اجْعَلْ عَمَلَنَا كُلَّهُ صَالِحًا، وَاجْعَلْهُ لِوَجْهِكَ خَالِصًا، وَلَا تَجْعَلْ لأَحَدٍ فِيهِ شَيْئًا»"
                : "“O Allah, make all our deeds righteous, make them purely for Your Countenance, and let there be nothing for anyone else in them.”"}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
