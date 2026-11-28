import React, { useEffect, useState } from "react";
import { Heart, Sparkles, ShieldCheck, BookOpen, RotateCcw, Copy, Check } from "lucide-react";

interface SpiritualDevotionPanelProps {
  lang?: string;
}

const SALAWAT_STORAGE_KEY = "btc_sincere_salawat_count_v1";
const BAQIYAT_STORAGE_KEY = "btc_sincere_baqiyat_counts_v1";

interface SincereDeedCard {
  id: string;
  titleAr: string;
  titleEn: string;
  proofAr: string;
  proofEn: string;
  actionAr: string;
  actionEn: string;
}

const DEEDS_LOVED_BY_ALLAH: SincereDeedCard[] = [
  {
    id: "nawafil_after_fard",
    titleAr: "إتقان الفرائض ثم التقرب بالنوافل",
    titleEn: "Perfecting Obligatory Worship & Voluntary Prayer",
    proofAr:
      "حديث قدسي: «وَمَا تَقَرَّبَ إِلَيَّ عَبْدِي بِشَيْءٍ أَحَبَّ إِلَيَّ مِمَّا افْتَرَضْتُ عَلَيْهِ، وَمَا يَزَالُ عَبْدِي يَتَقَرَّبُ إِلَيَّ بِالنَّوَافِلِ حَتَّى أُحِبَّهُ» (رواه البخاري ٦٥٠٢).",
    proofEn:
      "Hadith Qudsi (Bukhari 6502): Nothing draws a servant closer to Allah more beloved to Him than fulfilling obligations, followed by voluntary acts until Allah loves them.",
    actionAr: "حافظ على الصلاة في وقتها مع ركعتي الضحى أو الوتر ولو ركعة خالصة لله.",
    actionEn: "Pray obligatory prayers on time and keep a quiet daily Sunnah prayer.",
  },
  {
    id: "love_prophet_salawat",
    titleAr: "كثرة الصلاة على النبي ﷺ واتباع هديه",
    titleEn: "Abundant Salawat & Following the Prophetic Sunnah",
    proofAr:
      "قال رسول الله ﷺ: «مَنْ صَلَّى عَلَيَّ وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ عَشْرًا» (صحيح مسلم ٤٠٨)، وقال: «إِنَّ مِنْ أَحَبِّكُمْ إِلَيَّ وَأَقْرَبِكُمْ مِنِّي مَجْلِسًا يَوْمَ الْقِيَامَةِ أَحَاسِنَكُمْ أَخْلَاقًا» (الترمذي ٢٠١٨).",
    proofEn:
      "Muslim 408 & Tirmidhi 2018: Whoever sends one blessing upon the Prophet ﷺ receives ten from Allah; the closest to him on the Day of Judgment are those with the finest character.",
    actionAr: "أكثر من الصلاة على النبي ﷺ وحسِّن خُلقك ولين كلامك مع أهلك وزملائك.",
    actionEn:
      "Send Salawat upon the Prophet ﷺ and practice gentle character with family and peers.",
  },
  {
    id: "birr_walidayn",
    titleAr: "بر الوالدين وصلة الرحم والدعاء لهم بظهر الغيب",
    titleEn: "Honoring Parents & Family Ties with Secret Dua",
    proofAr: "قال ﷺ: «أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ: الصَّلَاةُ عَلَى وَقْتِهَا، ثُمَّ بِرُّ الْوَالِدَيْنِ» (متفق عليه).",
    proofEn:
      "Bukhari & Muslim: Among the deeds most beloved to Allah are prayer at its appointed time and dutiful kindness to parents.",
    actionAr: "ادعُ لوالديك وأهلك بالمغفرة والرحمة والفردوس الأعلى كل يوم وأدخل السرور على قلوبهم.",
    actionEn:
      "Pray daily for forgiveness, mercy, and Al-Firdaus Al-A'la for your parents and family.",
  },
  {
    id: "helping_others_khafaa",
    titleAr: "قضاء حوائج الناس والإحسان لذوي الاحتياجات الخاصة والستر في الخفاء",
    titleEn: "Serving Others, Supporting People of Determination & Quiet Charity",
    proofAr:
      "قال ﷺ: «أَحَبُّ النَّاسِ إِلَى اللَّهِ أَنْفَعُهُمْ لِلنَّاسِ، وَأَحَبُّ الأَعْمَالِ إِلَى اللَّهِ سُرُورٌ تُدْخِلُهُ عَلَى مُسْلِمٍ» (صحيح الجامع ١٧٦).",
    proofEn:
      "Sahih al-Jami 176: The most beloved people to Allah are those most beneficial to others, and the most beloved deeds bring quiet joy to another's heart.",
    actionAr:
      "انشر العلم النافع وساعد زملاءك وذوي الاحتياجات الخاصة بنية خالصة لا يطلع عليها إلا الله.",
    actionEn:
      "Share beneficial knowledge and assist classmates and people of determination sincerely for Allah alone.",
  },
];

const DUAS_FIRDAUS_FAMILY = [
  {
    id: "firdaus_1",
    ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ حُبَّكَ، وَحُبَّ مَنْ يُحِبُّكَ، وَالْعَمَلَ الَّذِي يُبَلِّغُنِي حُبَّكَ، اللَّهُمَّ اجْعَلْ حُبَّكَ أَحَبَّ إِلَيَّ مِنْ نَفْسِي وَأَهْلِي وَمِنَ الْمَاءِ الْبَارِدِ.",
    en: "O Allah, I ask You for Your love, the love of those who love You, and deeds that lead me to Your love. (Tirmidhi 3490)",
  },
  {
    id: "firdaus_2",
    ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْفِرْدَوْسَ الأَعْلَى مِنَ الْجَنَّةِ لِي وَلِوَالِدَيَّ وَأَهْلِي وَإِخْوَانِي بِغَيْرِ حِسَابٍ وَلَا سَابِقَةِ عَذَابٍ.",
    en: "O Allah, I ask You for Al-Firdaus Al-A'la of Paradise for myself, my parents, and my entire family without reckoning.",
  },
  {
    id: "firdaus_3",
    ar: "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِمَنْ دَخَلَ بَيْتِيَ مُؤْمِنًا، رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا.",
    en: "My Lord, forgive me, my parents, and grant our families righteousness and the coolness of our eyes (Quran 71:28 & 25:74).",
  },
  {
    id: "firdaus_4",
    ar: "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ، وَارْزُقْنَا حُبَّهُ وَاتِّبَاعَ سُنَّتِهِ وَمُرَافَقَتَهُ فِي الْفِرْدَوْسِ الأَعْلَى.",
    en: "O Allah, send peace and blessings upon our Prophet Muhammad ﷺ, and grant us his love, following his Sunnah, and his companionship in Al-Firdaus Al-A'la.",
  },
  {
    id: "firdaus_5",
    ar: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي، اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، بَارِكْ لِي فِي عِلْمِي وَفَهْمِي وَوَفِّقْنِي لِأَعْلَى الدَّرَجَاتِ فِي الدُّنْيَا وَالآخِرَةِ.",
    en: "My Lord, expand my chest, ease my affairs, bless my study and understanding, and grant me excellence in both worlds.",
  },
];

export const SpiritualDevotionPanel: React.FC<SpiritualDevotionPanelProps> = ({ lang = "ar" }) => {
  const isAr = lang === "ar";
  const [salawatCount, setSalawatCount] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      return Number(window.localStorage.getItem(SALAWAT_STORAGE_KEY) || "0") || 0;
    } catch {
      return 0;
    }
  });

  const [baqiyatCounts, setBaqiyatCounts] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(BAQIYAT_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, number>) : {};
    } catch {
      return {};
    }
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(SALAWAT_STORAGE_KEY, String(salawatCount));
    } catch {
      /* ignore */
    }
  }, [salawatCount]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(BAQIYAT_STORAGE_KEY, JSON.stringify(baqiyatCounts));
    } catch {
      /* ignore */
    }
  }, [baqiyatCounts]);

  const handleCopyDua = (id: string, text: string) => {
    if (navigator?.clipboard?.writeText) {
      void navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"} data-testid="spiritual-devotion-panel">
      {/* Sincere Niyyah Banner (100% Khālis for Allah — zero XP / zero leaderboard) */}
      <div className="rounded-2xl border border-emerald-500/35 bg-gradient-to-br from-emerald-50/90 via-white to-amber-50/50 dark:from-emerald-950/35 dark:via-stone-900 dark:to-stone-900 p-5 sm:p-6 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Heart className="size-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
                {isAr
                  ? "طريق محبة الله والرسول ﷺ والفردوس الأعلى"
                  : "Path to Allah's Love, the Prophet ﷺ & Al-Firdaus Al-A'la"}
              </h2>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                {isAr
                  ? "إخلاص تام ١٠٠٪ لله تعالى — لا نقاط ولا مسابقات، بل زاد خالص لك ولوالديك وأهلك"
                  : "100% Sincere for Allah Alone — zero points, zero leaderboards, purely for you & your family"}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="size-3.5" />
            <span>{isAr ? "خاص بينك وبين الله" : "Private Between You & Allah"}</span>
          </span>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300">
          {isAr
            ? "اللهم اجعل هذا العمل خالصاً لوجهك الكريم، لا رياء فيه ولا سمعة، واجعله سبباً في محبتك ومحبة نبيك ﷺ ورضاك، ومغفرةً ورحمةً ورفعةً في الفردوس الأعلى لنا ولوالدينا وأهلينا أجمعين."
            : "Make every study hour, every kind word, and every act of assistance a sincere Sadaqah Jariyah seeking Allah's pleasure, love, and Al-Firdaus Al-A'la for yourself, your parents, and your family."}
        </p>
      </div>

      {/* Interactive Private Salawat & Al-Baqiyat Al-Salihat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                {isAr ? "الصلاة على النبي ﷺ (زاد القلوب)" : "Salawat Upon the Prophet ﷺ"}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isAr
                  ? "«من صلى عليّ واحدة صلى الله عليه عشراً» (صحيح مسلم)"
                  : "One blessing sends ten blessings from Allah (Sahih Muslim)"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSalawatCount(0)}
              className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              aria-label={isAr ? "تصفير عداد الصلاة على النبي" : "Reset Salawat counter"}
              title={isAr ? "إعادة التعيين" : "Reset"}
            >
              <RotateCcw className="size-4" />
            </button>
          </div>

          <div
            className="rounded-xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-500/20 p-4 text-center font-serif text-lg sm:text-xl text-stone-900 dark:text-stone-100"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ
          </div>

          <button
            type="button"
            onClick={() => setSalawatCount((c) => c + 1)}
            data-testid="sincere-salawat-btn"
            className="w-full min-h-[48px] flex items-center justify-between px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-colors cursor-pointer"
          >
            <span>
              {isAr ? "صلِّ على النبي ﷺ (محفوظة في جهازك)" : "Tap for Salawat (Saved privately)"}
            </span>
            <span className="font-mono text-base bg-emerald-900/70 px-3 py-0.5 rounded-lg">
              {salawatCount}
            </span>
          </button>
        </div>

        {/* Al-Baqiyat Al-Salihat */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                {isAr ? "الباقيات الصالحات (غراس الجنة)" : "Al-Baqiyat Al-Salihat"}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isAr ? "أحب الكلام إلى الله تعالى" : "Speech most beloved to Allah"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBaqiyatCounts({})}
              className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              aria-label={isAr ? "تصفير الباقيات الصالحات" : "Reset Al-Baqiyat counter"}
            >
              <RotateCcw className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "subhanallah", ar: "سُبْحَانَ اللَّهِ" },
              { id: "alhamdulillah", ar: "الْحَمْدُ لِلَّهِ" },
              { id: "lailaha", ar: "لَا إِلَٰهَ إِلَّا اللَّهُ" },
              { id: "akbar", ar: "اللَّهُ أَكْبَرُ" },
              { id: "istighfar", ar: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ" },
              { id: "hawqala", ar: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ" },
            ].map((item) => {
              const cnt = baqiyatCounts[item.id] || 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setBaqiyatCounts((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }))
                  }
                  className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/70 hover:border-emerald-600 text-xs font-bold text-stone-900 dark:text-stone-100 transition-colors cursor-pointer"
                >
                  <span className="truncate font-serif text-sm">{item.ar}</span>
                  <span className="shrink-0 font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    {cnt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Authentic Deeds Loved by Allah */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100">
          <Sparkles className="size-4 text-emerald-600" />
          <span>
            {isAr
              ? "أعمال تقرّبك إلى محبة الله ومحبة رسوله ﷺ"
              : "Verified Deeds That Earn Allah's Love"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEEDS_LOVED_BY_ALLAH.map((card) => (
            <div
              key={card.id}
              className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-2.5 shadow-sm"
            >
              <h4 className="font-serif text-base font-bold text-emerald-800 dark:text-emerald-300">
                {isAr ? card.titleAr : card.titleEn}
              </h4>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300">
                {isAr ? card.proofAr : card.proofEn}
              </p>
              <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-500/20 p-3 text-xs text-stone-800 dark:text-stone-200 font-medium">
                {isAr ? card.actionAr : card.actionEn}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Duas for Parents, Family & Al-Firdaus Al-A'la */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100">
          <BookOpen className="size-4 text-emerald-600" />
          <span>
            {isAr
              ? "أدعية خالصة لك ولوالديك وأهلك بالفردوس الأعلى والرضا"
              : "Sincere Duas for Parents, Family & Al-Firdaus Al-A'la"}
          </span>
        </div>

        <div className="space-y-3">
          {DUAS_FIRDAUS_FAMILY.map((d) => (
            <div
              key={d.id}
              className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
            >
              <div className="space-y-1.5">
                <p
                  className="font-serif text-base sm:text-lg leading-loose text-stone-900 dark:text-stone-100"
                  style={{ fontFamily: "'Amiri', serif" }}
                >
                  {d.ar}
                </p>
                {!isAr && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    {d.en}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleCopyDua(d.id, d.ar)}
                className="shrink-0 min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:border-emerald-600 cursor-pointer"
              >
                {copiedId === d.id ? (
                  <>
                    <Check className="size-3.5 text-emerald-600" />
                    <span>{isAr ? "تم النسخ" : "Copied"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>{isAr ? "نسخ الدعاء" : "Copy Dua"}</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
