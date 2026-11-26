import React, { useState, useEffect } from "react";
import { Heart, Sparkles, X, Copy, Check, Users } from "lucide-react";

interface SadaqahJariyahAndDuaaModalProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
  lang?: string;
}

const DUAA_PRAYED_COUNT_KEY = "btc_duaa_in_absentia_prayed_count_v1";
const SINCERE_TASBIH_KEY = "btc_sincere_tasbih_counts_v1";
const FAMILY_DEDICATION_KEY = "btc_sadaqah_family_names_v1";

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
    titleAr: "ليوسف وائل ووالديه وأهله جميعاً",
    titleEn: "For Yousef Wael, His Parents & Whole Family",
    duaaAr:
      "«اللَّهُمَّ اغْفِرْ لِيُوسُف وَائِل وَلِوَالِدَيْهِ وَأَهْلِ بَيْتِهِ وَإِخْوَتِهِ وَأَجْدَادِهِ وَذُرِّيَّتِهِ وَأَقَارِبِهِ الأَحْيَاءِ مِنْهُمْ وَالأَمْوَاتِ، وَاجْعَلْ هَذَا العَمَلَ صَدَقَةً جَارِيَةً خَالِصَةً لِوَجْهِكَ الكَرِيمِ، وَبَارِكْ فِي أَهْلِنَا جَمِيعاً»",
    duaaEn:
      "“O Allah, forgive Yousef Wael, his parents, his entire household, grandparents, siblings, descendants, and relatives — both living and deceased. Accept this platform as a sincere ongoing charity (Sadaqah Jariyah) for Your Countenance.”",
  },
  {
    id: "parents-quranic",
    titleAr: "دعاء القرآن للوالدين والأهل والذرية",
    titleEn: "Quranic Prayer for Parents & Family",
    duaaAr:
      "«رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا ۝ رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا ۝ رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ»",
    duaaEn:
      "“My Lord, have mercy upon both parents as they raised me when I was small. Our Lord, grant us from among our families and offspring comfort to our eyes, and forgive us, our parents, and all believers on the Day of Reckoning.”",
  },
  {
    id: "firdaus",
    titleAr: "الفردوس الأعلى لأهلنا أحياءً وأمواتاً",
    titleEn: "Al-Firdaus Al-A'la for Living & Deceased Family",
    duaaAr:
      "«اللَّهُمَّ ارْزُقْ يُوسُفَ وَوَالِدَيْهِ وَأَهْلَهُ وَأَهْلَنَا جَمِيعاً الفِرْدَوْسَ الأَعْلَى مِنَ الجَنَّةِ بِغَيْرِ حِسَابٍ وَلَا سَابِقَةِ عَذَابٍ، وَارْحَمْ مَوْتَانَا وَاشْفِ مَرْضَانَا، وَاجْمَعْنَا مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ وَالصَّالِحِينَ»",
    duaaEn:
      "“O Allah, grant Yousef, his parents, his family, and all of our families Al-Firdaus Al-A'la without reckoning, have mercy on our departed loved ones, heal our sick, and reunite us with the Prophets and the Righteous.”",
  },
  {
    id: "barakah",
    titleAr: "البركة في العلم والرزق وصلاح الأسرة",
    titleEn: "Barakah in Knowledge, Provision & Family Harmony",
    duaaAr:
      "«اللَّهُمَّ بَارِكْ لَهُ وَلِأَهْلِهِ وَلِأَهْلِنَا فِي العِلْمِ وَالعَمَلِ وَالرِّزْقِ وَالصِّحَّةِ، وَأَلِّفْ بَيْنَ قُلُوبِنَا، وَافْتَحْ لَنَا أَبْوَابَ الخَيْرِ وَالتَّوْفِيقِ وَالتَّفَوُّقِ فِي الدُّنْيَا وَالآخِرَةِ»",
    duaaEn:
      "“O Allah, bless his family and our families with beneficial knowledge, righteous deeds, lawful sustenance, wellness, and united hearts, and open doors of excellence in this life and the Hereafter.”",
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
  const [familyNames, setFamilyNames] = useState<string>("");

  // Tasbih interactive counters (0 XP — pure remembrance)
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
    const syncAll = () => {
      try {
        const savedCount = window.localStorage.getItem(DUAA_PRAYED_COUNT_KEY);
        if (savedCount) setPrayedCount(Number(savedCount));

        const savedTasbih = window.localStorage.getItem(SINCERE_TASBIH_KEY);
        if (savedTasbih) setTasbihCounts(JSON.parse(savedTasbih));

        const savedFamily = window.localStorage.getItem(FAMILY_DEDICATION_KEY);
        if (savedFamily !== null) setFamilyNames(savedFamily);
      } catch {
        // Ignore
      }
    };
    syncAll();
    window.addEventListener("btc:sadaqah-family-updated", syncAll);
    return () => {
      window.removeEventListener("btc:sadaqah-family-updated", syncAll);
    };
  }, []);

  const handleFamilyNamesChange = (val: string) => {
    setFamilyNames(val);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(FAMILY_DEDICATION_KEY, val);
        window.dispatchEvent(new CustomEvent("btc:sadaqah-family-updated"));
      } catch {
        // Ignore
      }
    }
  };

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
  const cleanFamily = familyNames.trim();

  const handleCopyDuaa = () => {
    const dedicationLine = cleanFamily
      ? `\n\n🤲 اللهم واشمل بهذا الدعاء والأجر: ${cleanFamily}`
      : "";
    const textToCopy = `${selectedDuaa.duaaAr}${dedicationLine}\n\n${selectedDuaa.duaaEn}\n\n— صدقة جارية ودعاء بظهر الغيب ليوسف وائل وأهله ولجميع أهالينا (آمِينَ وَلَكَ بِمِثْلٍ)`;
    if (navigator?.clipboard?.writeText) {
      void navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          setCopiedDuaa(true);
          setTimeout(() => setCopiedDuaa(false), 2500);
        })
        .catch(() => {
          setCopiedDuaa(true);
          setTimeout(() => setCopiedDuaa(false), 2500);
        });
    } else {
      setCopiedDuaa(true);
      setTimeout(() => setCopiedDuaa(false), 2500);
    }
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
          className="inline-flex min-h-[40px] items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Heart className="size-3.5 fill-current" />
          <span>{isAr ? "صدقة جارية ودعاء للأهل 🤲" : "Sadaqah Jariyah & Family Duaa 🤲"}</span>
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
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="size-3.5" />
                  <span>
                    {isAr
                      ? "صدقة جارية دائمة · ليوسف وائل ووالديه وأهله وأهالينا أجمعين"
                      : "Ongoing Charity · For Yousef Wael, Parents & All Our Families"}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                  {isAr
                    ? "هدية صالحة: دَعْوَةٌ بِظَهْرِ الغَيْبِ لِلْمُطَوِّرِ وَالأَهْلِ (آمِينَ وَلَكَ بِمِثْلٍ)"
                    : "Blessed Gift: Family & Unseen Supplication (Ameen, unto you the same)"}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {isAr
                    ? "بنى هذه المنصة (يوسف وائل) صدقةً جارية وعِلماً يُنتفع به عن نفسه ووالديه وأهله وإخوته وأجداده وأقاربه الأحياء والأموات — ولك ولأهلك بمثل ما تدعو به أضعافاً مضاعفة."
                    : "Built by Yousef Wael as continuous beneficial knowledge (Sadaqah Jariyah) dedicated to his parents, siblings, grandparents, and entire family — living and deceased — with multiplied blessings for your family too."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={isAr ? "إغلاق النافذة" : "Close modal"}
                className="size-9 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
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

            {/* Optional Custom Family Dedication (Device-Only) */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/70 p-3.5 space-y-2">
              <label
                htmlFor="sadaqah-family-names"
                className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200"
              >
                <Users className="size-3.5 text-emerald-600" />
                <span>
                  {isAr
                    ? "أضف أسماء أهلك وأحبابك لتشملهم بالصدقة والدعاء (اختياري — محفوظ على جهازك):"
                    : "Dedicate to your loved ones / family names (optional, device-only):"}
                </span>
              </label>
              <input
                id="sadaqah-family-names"
                type="text"
                value={familyNames}
                onChange={(e) => handleFamilyNamesChange(e.target.value)}
                placeholder={
                  isAr
                    ? "مثال: والديّ وإخوتي وأجدادي وجميع أهلي..."
                    : "e.g., My parents, grandparents & whole family..."
                }
                className="w-full min-h-[40px] rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_DUAAS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDuaaId(d.id)}
                    className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-start text-xs font-semibold border transition-all cursor-pointer ${
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

                {cleanFamily && (
                  <p className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-center text-xs font-serif text-emerald-800 dark:text-emerald-300">
                    {isAr
                      ? `🤲 اللهم واشمل بهذا الدعاء والأجر: ${cleanFamily}`
                      : `🤲 O Allah, include in this prayer and reward: ${cleanFamily}`}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={handleCopyDuaa}
                    className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    {copiedDuaa ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" />
                        <span>{isAr ? "تم النسخ بنجاح" : "Copied"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>{isAr ? "نسخ الدعاء ومشاركته" : "Copy & Share Duaa"}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    data-testid="confirm-duaa-prayed-btn"
                    onClick={handleRecordDuaa}
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-98 cursor-pointer"
                  >
                    <Heart className="size-4 fill-current text-rose-300" />
                    <span>
                      {isAr
                        ? "دَعَوْتُ لَهُ وَلِوَالِدَيْهِ وَأَهْلِهِ بِظَهْرِ الغَيْبِ (آمِينَ)"
                        : "I prayed for him, parents & family in the unseen (Ameen)"}
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
                      ? "الباقيات الصالحات — أجر جاري لك ولأهلك (بدون نقاط)"
                      : "The Lasting Good Deeds — Sincere Remembrance (0 Points)"}
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
                  className="min-h-[56px] p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-center hover:border-emerald-500 transition-all active:scale-95 space-y-1 cursor-pointer"
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
                  className="min-h-[56px] p-2.5 rounded-xl border border-teal-500/30 bg-teal-50/50 dark:bg-teal-950/20 text-center hover:border-teal-500 transition-all active:scale-95 space-y-1 cursor-pointer"
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
                  className="min-h-[56px] p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20 text-center hover:border-indigo-500 transition-all active:scale-95 space-y-1 cursor-pointer"
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
                  className="min-h-[56px] p-2.5 rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 text-center hover:border-amber-500 transition-all active:scale-95 space-y-1 cursor-pointer"
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
