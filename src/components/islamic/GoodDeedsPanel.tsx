import React, { useState, useEffect } from "react";
import {
  Heart,
  BookOpen,
  HandHeart,
  Sparkles,
  TreePine,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  ShieldCheck,
  Award,
} from "lucide-react";
import { useStudentEcosystem } from "@/lib/student-ecosystem";
import { SadaqahJariyahAndDuaaModal } from "./SadaqahJariyahAndDuaaModal";

interface GoodDeedsPanelProps {
  lang?: string;
}

interface StudentIntention {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
}

const SINCERE_STUDENT_INTENTIONS: StudentIntention[] = [
  {
    id: "intent_ignorance",
    titleAr: "رفع الجهل عن النفس وعبادة الله على بصيرة",
    titleEn: "Overcoming Ignorance & Worshipping Allah with Insight",
    descAr: "أن أتعلم لأفهم ديني وأبني عقلي وأعبد الله عن علم وفهم وبصيرة.",
    descEn:
      "To learn so I understand my faith, cultivate my mind, and worship Allah with clear insight.",
  },
  {
    id: "intent_benefit_ummah",
    titleAr: "نفع المسلمين والإحسان إلى الناس وتعمير الأرض",
    titleEn: "Benefiting Humanity & Serving the Community",
    descAr: "أن تكون دراستي وعملي سبباً في كشف كربة أو تعليم جاهل أو بناء نفع مستمر.",
    descEn:
      "To use my education to relieve distress, teach others, and build lasting benefit on earth.",
  },
  {
    id: "intent_parents_honor",
    titleAr: "بر الوالدين وإدخال السرور على قلوبهما",
    titleEn: "Honoring Parents & Bringing Sincere Joy to Their Hearts",
    descAr: "أن يكون نجاحي واجتهادي قرة عين لأبي وأمي ورداً لجميلهما وفضلهما.",
    descEn:
      "To make my academic diligence a source of true joy for my parents and honor their sacrifices.",
  },
  {
    id: "intent_halal_independence",
    titleAr: "الاستغناء بالحلال والإنفاق في سبل الخير والصدقة",
    titleEn: "Earning Halal Independence & Giving Generously in Charity",
    descAr: "أن أستغني برزق حلال مبارك، وأتصدق منه وأعين به المحتاجين والضعفاء.",
    descEn:
      "To attain lawful sustenance and spend generously in charity to aid the needy and vulnerable.",
  },
  {
    id: "intent_mastery_itqan",
    titleAr: "إتقان العمل لنيل محبة الله ورضاه",
    titleEn: "Mastery (Itqan) to Earn the Love & Pleasure of Allah",
    descAr: "«إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ» — الإتقان في كل واجب ودرس.",
    descEn:
      "“Verily Allah loves when one of you does a deed, that he does it with mastery (Itqan).”",
  },
  {
    id: "intent_sadaqah_jariyah",
    titleAr: "جعل كل علم ومعلومة صدقة جارية تثقل الميزان",
    titleEn: "Transforming Knowledge into Ongoing Charity (Sadaqah Jariyah)",
    descAr: "أن أشارك ما أتعلمه بالمجان ليبقى ثوابه وأجره جارياً في صحائفي بعد مماتي.",
    descEn:
      "To share beneficial knowledge freely so its divine reward continues flowing after this life.",
  },
];

interface ImpactInitiative {
  id: string;
  titleAr: string;
  categoryAr: string;
  descriptionAr: string;
  practicalActions: string[];
  hadithBasis: string;
  hadithSource: string;
  icon: React.ComponentType<{ className?: string }>;
}

const BENEFICIAL_INITIATIVES: ImpactInitiative[] = [
  {
    id: "knowledge",
    titleAr: "العلم النافع وبث المعرفة (صدقة جارية)",
    categoryAr: "نشر العلم والتعلّم",
    descriptionAr:
      "المساهمة في شرح درس، أو تأليف ملخص تعليمي مبسط، أو تدريس طالب يحتاج مساعدة، ليبقى أثر العلم جارياً في ميزان الحسنات.",
    practicalActions: [
      "قم بإعداد ملخص مبسط لدرس معقد وشاركه في مكتبة نكسورا المجتمعية للطلاب.",
      "سجل درساً صوتياً أو كتابياً لشرح مفهوم صعب لزملائك الطلاب بالمجان.",
      "ساهم في تصحيح وتدقيق المحتويات التعليمية ونشر الحقائق الموثقة.",
    ],
    hadithBasis:
      "«إِذَا مَاتَ الإنْسَانُ انْقَطَعَ عنْه عَمَلُهُ إِلَّا مِن ثَلَاثَةٍ: إِلَّا مِن صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو له»",
    hadithSource: "صحيح مسلم — رقم ١٦٣١",
    icon: BookOpen,
  },
  {
    id: "parents-family",
    titleAr: "بر الوالدين وصلة الأرحام",
    categoryAr: "الإحسان الأسري",
    descriptionAr:
      "إعلاء شأن بر الوالدين وحسن صحبتهما، وتفقد الأقارب والإحسان إليهم كأعظم وأولى ميادين الخير والبر.",
    practicalActions: [
      "خصص وقتاً يومياً للجلوس مع والديك والاستماع إليهما وتلبية احتياجاتهما بابتسامة.",
      "صل رحمك بمكالمة هاتفية أو زيارة أو رسالة طيبة لأقاربك الذين قد تشغلك عنهم الأيام.",
      "الدعاء المستمر للوالدين في السجود وأدبار الصلوات بظهر الغيب.",
    ],
    hadithBasis: "«مَن سَرَّهُ أَنْ يُبْسَطَ له في رِزْقِهِ، وَأَنْ يُنْسَأَ له في أَثَرِهِ، فَلْيَصِلْ رَحِمَهُ»",
    hadithSource: "صحيح البخاري ومسلم",
    icon: Heart,
  },
  {
    id: "community-volunteering",
    titleAr: "العمل التطوعي وخدمة المجتمع",
    categoryAr: "النفع العام",
    descriptionAr:
      "بذل الجهد البدني والمهاري لخدمة بيئتك المحلية، ومساندة الضعفاء، وتنظيف المرافق العامة، وإعانة المحتاجين.",
    practicalActions: [
      "المشاركة في حملات التشجير وتنظيف البيئة والأحياء والمساجد.",
      "تقديم المساعدة لكبار السن وذوي الاحتياجات الخاصة في قضاء حوائجهم.",
      "التطوع بساعات عمل لمساعدة الجمعيات الخيرية والمبادرات الإنسانية المعتمدة.",
    ],
    hadithBasis: "«تُعِينُ صَانِعًا، أَوْ تَصْنَعُ لِأَخْرَقَ... وَتُمِيطُ الأَذَى عَنِ الطَّرِيقِ صَدَقَةٌ»",
    hadithSource: "صحيح البخاري",
    icon: HandHeart,
  },
  {
    id: "ongoing-relief",
    titleAr: "الصدقة والإحسان الدائم",
    categoryAr: "الصدقات الجارية",
    descriptionAr:
      "المساهمة في المشاريع ذات النفع المستمر كسقيا الماء، وبناء المراكز التعليمية، والمستشفيات، وكفالة الأيتام.",
    practicalActions: [
      "المساهمة في مشاريع سقيا الماء وحفر الآبار في المناطق المحتاجة عبر القنوات الرسمية.",
      "كفالة يتيم أو المساهمة في سداد ديون معسر عبر المنصات الوطنية المعتمدة.",
      "إطعام الطعام وتفقد الجيران والمحتاجين في حيك السكني.",
    ],
    hadithBasis: "«أَفْضَلُ الصَّدَقَةِ سَقْيُ الْمَاءِ»",
    hadithSource: "سنن أبي داود — حديث حسن",
    icon: TreePine,
  },
];

const PRIVATE_WORSHIP_PROMPTS = [
  {
    key: "prayers_focus",
    ar: "حافظتُ على الصلوات المكتوبة في أوقاتها",
    en: "Completed obligatory prayers mindfully",
  },
  {
    key: "quran_wird",
    ar: "قرأتُ وردي اليومي من القرآن الكريم بتدبر",
    en: "Read my daily Quran portion with reflection",
  },
  {
    key: "adhkar_daily",
    ar: "حافظتُ على أذكار الصباح أو المساء",
    en: "Recited morning / evening Adhkar",
  },
  {
    key: "parents_kindness",
    ar: "بررتُ والديّ أو أدخلتُ سروراً على أهلي",
    en: "Showed kindness to parents / family",
  },
  {
    key: "quiet_sadaqah",
    ar: "قدمتُ نفعاً أو صدقة خالصة في الخفاء",
    en: "Offered a quiet act of charity or help",
  },
];

const SUSTAINABLE_PROJECT_CHECKS = [
  {
    key: "sus_docs",
    ar: "توثيق الخطوات بوضوح لينتفع بها غيرك",
    en: "Clear step-by-step documentation for others to reuse",
  },
  {
    key: "sus_verified",
    ar: "مراجعة صحة المصادر العلمية والشرعية",
    en: "Verified authentic religious and factual sources",
  },
  {
    key: "sus_open",
    ar: "إتاحة الملخص أو المورد مجاناً لطلبة العلم",
    en: "Shared openly without paywalls for fellow learners",
  },
  {
    key: "sus_handover",
    ar: "تحديد منسق بديل أو نسخة احتياطية لاستمرارية الأثر",
    en: "Maintainer handover plan or archived backup copy",
  },
];

export const GoodDeedsPanel: React.FC<GoodDeedsPanelProps> = ({ lang = "ar" }) => {
  const isAr = lang === "ar";
  const { state: eco, update } = useStudentEcosystem();
  const [noteTitle, setNoteTitle] = useState("");
  const [noteSubject, setNoteSubject] = useState("العلوم / الرياضيات / اللغة");
  const [noteContent, setNoteContent] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [sustainableDone, setSustainableDone] = useState<string[]>([]);

  const [activeIntentions, setActiveIntentions] = useState<string[]>(() => {
    if (typeof window === "undefined") return ["intent_ignorance", "intent_benefit_ummah"];
    try {
      const saved = window.localStorage.getItem("btc_student_intentions_v1");
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return ["intent_ignorance", "intent_benefit_ummah"];
  });

  const toggleIntention = (id: string) => {
    setActiveIntentions((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("btc_student_intentions_v1", JSON.stringify(next));
        } catch {
          // Ignore
        }
      }
      return next;
    });
  };

  const todayIso = new Date().toISOString().slice(0, 10);
  const activeWorshipKeys =
    eco.privateWorshipChecklist.dateIso === todayIso
      ? eco.privateWorshipChecklist.completedKeys
      : [];

  const togglePrivateWorshipItem = (key: string) => {
    update((prev) => {
      const current =
        prev.privateWorshipChecklist.dateIso === todayIso
          ? prev.privateWorshipChecklist.completedKeys
          : [];
      const next = current.includes(key) ? current.filter((x) => x !== key) : [...current, key];
      return {
        ...prev,
        privateWorshipChecklist: {
          ...prev.privateWorshipChecklist,
          dateIso: todayIso,
          completedKeys: next,
        },
      };
    });
  };

  const handleSaveBeneficialNote = () => {
    const cleanTitle = noteTitle.trim();
    const cleanBody = noteContent.trim();
    if (!cleanTitle || !cleanBody) return;

    update((prev) => ({
      ...prev,
      knowledgeLibrary: [
        {
          id: `sadaqah_${Date.now().toString(36)}`,
          title: cleanTitle,
          subject: noteSubject.trim() || "Beneficial Knowledge",
          sourceType: "offline_pack",
          content: cleanBody,
          tags: ["sadaqah-jariyah", "peer-summary"],
          pinnedOffline: true,
          createdAt: new Date().toISOString(),
        },
        ...prev.knowledgeLibrary,
      ],
    }));

    setSavedNotice(true);
    setNoteTitle("");
    setNoteContent("");
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleCopyShareNote = () => {
    const formatted = `${noteTitle.trim() || "ملخص علمي نافع"} (${noteSubject})\n\n${noteContent.trim()}\n\n— نُشر بنية العلم النافع الذي يُنتفع به`;
    void navigator.clipboard.writeText(formatted).then(() => {
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2500);
    });
  };

  return (
    <div
      className="w-full flex flex-col gap-6"
      dir={isAr ? "rtl" : "ltr"}
      data-testid="good-deeds-panel"
    >
      {/* Principle of Sincerity & Lasting Impact Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-md border border-emerald-500/30 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? "مبدأ الأثر المستدام والإخلاص" : "Sincerity & Sustainable Benefit"}</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold font-serif">
          {isAr
            ? "أَبْوَابُ الخَيْرِ وَالأَثَرِ الدَّائِمِ (الصَّدَقَةُ الجَارِيَةُ)"
            : "Doors of Good, Private Worship & Lasting Benefit (Sadaqah Jariyah)"}
        </h3>
        <p className="text-xs text-emerald-100/90 max-w-3xl leading-relaxed">
          {isAr
            ? "نبتعد في هذه المنصة عن أنظمة النقاط المصطنعة أو الشارات الاستعراضية، احتراماً لقدسية العمل الصالح وإخلاصه لله وحده. هدفنا إرشادك إلى مبادرات عملية حقيقية تدوم بركتها وتترك أثراً نافعاً في مجتمعك وأمتك."
            : "This space deliberately has zero XP points, streaks leaderboard, or public badges for worship. Good deeds belong between you and Allah — focus on sincerity, private reflection, and beneficial community work that lasts."}
        </p>
      </div>

      {/* SINCERE DUA'A IN ABSENTIA FOR DEVELOPER & SADAQAH JARIYAH SECTION */}
      <div
        data-testid="good-deeds-duaa-sadaqah-card"
        className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/40 dark:via-stone-900 dark:to-stone-900 p-5 sm:p-6 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <Heart className="size-4 fill-emerald-600/30 text-emerald-600" />
              <span>
                {isAr
                  ? "دعوة صالحة بظهر الغيب لمن بنى هذه المنصة ولوالديه (ولك بمثل ما دعوت وزيادة)"
                  : "Supplication in Absentia for the Platform Creator & Parents"}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
              {isAr
                ? "أعظم هدية تقدمها لأخيك المطور: دعوة مستجابة في ظهر الغيب"
                : "The Greatest Gift: A sincere prayer for the developer in the unseen"}
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
              {isAr
                ? "صمم وبنى هذه المنصة أخوكم (يوسف وائل) متقرباً بها إلى الله تعالى صدقةً جارية وعِلماً يُنتفع به. ادعُ له ولوالديه بالمغفرة والقبول وصلاح البال، ولك مثل ما دعوت بدعاء الملك الموكل."
                : "Architected and built by Yousef Wael as continuous beneficial knowledge (Sadaqah Jariyah) for Allah's Sake. Pray for him and his parents, and the appointed angel answers: Ameen, and for you the same!"}
            </p>
          </div>

          <div className="shrink-0">
            <SadaqahJariyahAndDuaaModal
              lang={lang}
              trigger={
                <button
                  type="button"
                  data-testid="open-duaa-modal-from-good-deeds"
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-98"
                >
                  <Heart className="size-4 fill-current text-rose-300" />
                  <span>{isAr ? "ادعُ للمطوّر بظهر الغيب 🤲" : "Pray in Absentia 🤲"}</span>
                </button>
              }
            />
          </div>
        </div>
      </div>

      {/* 7 SINCERE INTENTIONS FOR SEEKING KNOWLEDGE (نوايا طالب العلم السبع لنيل حب الله ورضاه) */}
      <div
        data-testid="good-deeds-intentions-card"
        className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 sm:p-6 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <Sparkles className="size-3.5" />
              <span>
                {isAr ? "تجديد النية وتحويل المذاكرة إلى عبادة" : "Renewing Sincere Intentions"}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
              {isAr
                ? "نوايا طالب العلم السبع لكسب حب الله ورضاه وأعظم الحسنات"
                : "7 Sincere Intentions to Turn Every Study Hour into Divine Worship"}
            </h4>
          </div>
          <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400">
            {activeIntentions.length}/{SINCERE_STUDENT_INTENTIONS.length}{" "}
            {isAr ? "نوايا معقودة اليوم" : "intentions held"}
          </span>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          {isAr
            ? "قال رسول الله ﷺ: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى». اعقد هذه النوايا الصالحة قبل أن تبدأ مذاكرتك أو عملك، لتتحول كل دقيقة تجلسها أمام دروسك إلى حسنات جارية في ميزانك."
            : "The Prophet ﷺ said: “Actions are only by intentions, and every person will have only what they intended.” Align your heart before studying to transform every minute into lasting Hasanat."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SINCERE_STUDENT_INTENTIONS.map((intent) => {
            const isHeld = activeIntentions.includes(intent.id);
            return (
              <button
                key={intent.id}
                type="button"
                onClick={() => toggleIntention(intent.id)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-start transition-all ${
                  isHeld
                    ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-stone-900 dark:text-stone-100 shadow-2xs"
                    : "border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-600 dark:text-stone-300 hover:border-emerald-400"
                }`}
              >
                <div
                  className={`size-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isHeld
                      ? "bg-emerald-700 text-white"
                      : "border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-transparent"
                  }`}
                >
                  <Check className="size-3.5 stroke-[3]" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="font-bold text-xs leading-snug">
                    {isAr ? intent.titleAr : intent.titleEn}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                    {isAr ? intent.descAr : intent.descEn}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Private Worship Check-In & Sustainable Project Continuity Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div
          data-testid="private-worship-tracker"
          className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
              {isAr
                ? "متابعة العبادات اليومية الخاصة (سري تماماً — 0 نقاط)"
                : "Private Daily Worship Reflection (Device-Only · 0 Points)"}
            </h4>
            <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
              {activeWorshipKeys.length}/{PRIVATE_WORSHIP_PROMPTS.length}
            </span>
          </div>
          <p className="text-[11px] text-stone-500">
            {isAr
              ? "مفكرة شخصية بينك وبين الله — لا تُشارك ولا تُصدّر في التقارير."
              : "Personal check-in kept strictly private and excluded from exports or leaderboards."}
          </p>
          <div className="space-y-1.5">
            {PRIVATE_WORSHIP_PROMPTS.map((item) => {
              const checked = activeWorshipKeys.includes(item.key);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => togglePrivateWorshipItem(item.key)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-start transition-colors ${
                    checked
                      ? "border-emerald-500/50 bg-emerald-500/10 text-stone-900 dark:text-emerald-100"
                      : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 text-stone-600 dark:text-stone-300"
                  }`}
                >
                  <span>{isAr ? item.ar : item.en}</span>
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${checked ? "text-emerald-600" : "opacity-30"}`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div
          data-testid="sustainable-handover-checklist"
          className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
              {isAr
                ? "ميثاق استدامة المشاريع النافعة (علم يُنتفع به)"
                : "Sustainable Beneficial Project & Knowledge Handover Kit"}
            </h4>
            <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
              {sustainableDone.length}/{SUSTAINABLE_PROJECT_CHECKS.length}
            </span>
          </div>
          <p className="text-[11px] text-stone-500">
            {isAr
              ? "اضمن بقاء أثرك التعليمي والمجتمعي نافعاً وسهل الصيانة بعد انتقالك للمرحلة التالية."
              : "Ensure your study guides or community initiatives remain verifiable, accessible, and easy for future students to maintain."}
          </p>
          <div className="space-y-1.5">
            {SUSTAINABLE_PROJECT_CHECKS.map((item) => {
              const checked = sustainableDone.includes(item.key);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setSustainableDone((prev) =>
                      prev.includes(item.key)
                        ? prev.filter((x) => x !== item.key)
                        : [...prev, item.key],
                    )
                  }
                  className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-start transition-colors ${
                    checked
                      ? "border-emerald-500/50 bg-emerald-500/10 text-stone-900 dark:text-emerald-100"
                      : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 text-stone-600 dark:text-stone-300"
                  }`}
                >
                  <span>{isAr ? item.ar : item.en}</span>
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${checked ? "text-emerald-600" : "opacity-30"}`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sadaqah Jariyah Study Note Creator */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-stone-900 border border-emerald-500/30 shadow-sm space-y-4 text-xs">
        <div className="space-y-1">
          <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span>شارك ملخصاً أو شرحاً لزملائك بنية «علمٍ يُنتفع به»</span>
          </h4>
          <p className="text-stone-500">
            اكتب شرحاً مبسطاً لقاعدة أو مفهوم استصعبته ثم فهمته، واحفظه في مكتبتك أو انسخه لمشاركته
            مجاناً مع الطلاب.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="عنوان الملخص (مثال: تبسيط قوانين نيوتن للحركة)"
            className="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
          />
          <input
            type="text"
            value={noteSubject}
            onChange={(e) => setNoteSubject(e.target.value)}
            placeholder="المادة الدراسية"
            className="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
          />
        </div>

        <textarea
          rows={3}
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="اشرح المفهوم بوضوح وأمثلة عملية تساعد غيرك على الفهم السريع..."
          className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!noteTitle.trim() || !noteContent.trim()}
            onClick={handleSaveBeneficialNote}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 px-4 py-2 font-bold text-white transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>حفظ في مكتبة العلم النافع (Offline)</span>
          </button>

          <button
            type="button"
            disabled={!noteContent.trim()}
            onClick={handleCopyShareNote}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 dark:border-stone-700 px-4 py-2 font-semibold text-stone-700 dark:text-stone-200 disabled:opacity-40"
          >
            {copiedNotice ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>{copiedNotice ? "تم النسخ للمشاركة!" : "نسخ الملخص لمشاركته"}</span>
          </button>

          {savedNotice && (
            <span className="font-bold text-emerald-700 dark:text-emerald-300">
              ✓ تم حفظ الملخص في مكتبتك وتثبيته للقراءة بدون إنترنت.
            </span>
          )}
        </div>
      </div>

      {/* Initiatives Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BENEFICIAL_INITIATIVES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                      {item.categoryAr}
                    </span>
                    <h4 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                      {item.titleAr}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {item.descriptionAr}
                </p>
              </div>

              {/* Practical Actions */}
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-2">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  خطوات عملية مقترحة:
                </span>
                <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                  {item.practicalActions.map((act, aIdx) => (
                    <li key={aIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hadith Citation */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                <div
                  className="font-serif text-stone-800 dark:text-stone-200 leading-relaxed"
                  style={{ fontFamily: "'Amiri', serif" }}
                >
                  {item.hadithBasis}
                </div>
                <div className="text-[10px] text-stone-500 mt-1 font-mono">
                  [{item.hadithSource}]
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
