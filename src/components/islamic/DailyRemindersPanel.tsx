import React, { useState } from "react";
import {
  Sparkles,
  BookOpen,
  Share2,
  Copy,
  Check,
  Bell,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";

interface DailyRemindersPanelProps {
  lang?: string;
}

interface ReminderEntry {
  id: string;
  type: "quran" | "hadith" | "wisdom";
  titleAr: string;
  contentAr: string;
  sourceCitation: string;
  reflectionAr: string;
}

const VERIFIED_DAILY_REMINDERS: ReminderEntry[] = [
  {
    id: "rem-1",
    type: "quran",
    titleAr: "الباقيات الصالحات",
    contentAr: "وَٱلْبَـٰقِيَـٰتُ ٱلصَّـٰلِحَـٰتُ خَيْرٌ عِندَ رَبِّكَ ثَوَابًا وَخَيْرٌ أَمَلًا",
    sourceCitation: "سورة الكهف — آية ٤٦",
    reflectionAr:
      "كل عمل صالح خالص لوجه الله من تسبيح وتحميد وصدقة وبر وإحسان هو الكنز الحقيقي الذي يدوم نوره وثوابه وأثره عند الله تعالى.",
  },
  {
    id: "rem-2",
    type: "hadith",
    titleAr: "أنفع الناس للناس",
    contentAr:
      "«أَحَبُّ النَّاسِ إِلَى اللَّهِ أَنْفَعُهُمْ لِلنَّاسِ، وَأَحَبُّ الأَعْمَالِ إِلَى اللَّهِ سُرُورٌ تُدْخِلُهُ عَلَى مُسْلِمٍ، أَوْ تَكْشِفُ عَنْهُ كُرْبَةً، أَوْ تَقْضِي عَنْهُ دَيْنًا، أَوْ تَطْرُدُ عَنْهُ جُوعًا»",
    sourceCitation: "صحيح الترغيب والترهيب للألباني — حديث حسن صحيح",
    reflectionAr:
      "جعل النبي ﷺ الإحسان إلى عباد الله ونفعهم وتفريج كروبهم من أعظم القربات وأحب الأعمال إلى خالق الكون سبحانه.",
  },
  {
    id: "rem-3",
    type: "quran",
    titleAr: "معية الله لأهل الصبر والإحسان",
    contentAr: "إِنَّ ٱللَّهَ مَعَ ٱلَّذِينَ ٱتَّقَوا۟ وَّٱلَّذِينَ هُم مُّحْسِنُونَ",
    sourceCitation: "سورة النحل — آية ١٢٨",
    reflectionAr:
      "المعية الخاصة من الله تعالى بالحفظ والتوفيق والنصر والهداية تنال بتقوى الله في السر والعلن والإحسان في القول والعمل.",
  },
  {
    id: "rem-4",
    type: "hadith",
    titleAr: "فضل نشر العلم والخير",
    contentAr: "«مَنْ دَعَا إِلَى هُدًى، كَانَ لَهُ مِنَ الأَجْرِ مِثْلُ أُجُورِ مَنْ تَبِعَهُ، لا يَنْقُصُ ذَلِكَ مِنْ أُجُورِهِمْ شَيْئًا»",
    sourceCitation: "صحيح مسلم — رقم ٢٦٧٤",
    reflectionAr:
      "حين تدل إنساناً على خير أو تعلمه مسألة نافعة أو تسهم في نشر كتاب أو معلومة صحيحة، يكتب لك مثل أجره وأجر من عمل به إلى قيام الساعة.",
  },
];

export const DailyRemindersPanel: React.FC<DailyRemindersPanelProps> = ({ lang = "ar" }) => {
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("btc_islamic_daily_reminders") !== "false";
    }
    return true;
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleReminders = () => {
    setRemindersEnabled((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("btc_islamic_daily_reminders", String(next));
      }
      return next;
    });
  };

  const handleCopy = (rem: ReminderEntry) => {
    const text = `${rem.titleAr}\n${rem.contentAr}\n\n[${rem.sourceCitation}]\n${rem.reflectionAr}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(rem.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const todayReminder = VERIFIED_DAILY_REMINDERS[0]!;

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* Featured Today's Reminder */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 sm:p-8 text-white shadow-lg border border-emerald-500/30 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs border border-amber-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>تذكرة اليوم الموثقة</span>
            </span>
            <span className="text-xs text-emerald-200">{todayReminder.sourceCitation}</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => handleCopy(todayReminder)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white transition-colors"
            >
              {copiedId === todayReminder.id ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>مشاركة التذكرة</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Text */}
        <div
          className="py-4 text-center font-serif text-xl sm:text-3xl font-bold leading-[2.2] text-amber-100 select-text"
          style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
        >
          {todayReminder.contentAr}
        </div>

        {/* Reflection */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
          <strong className="text-amber-300 font-bold block mb-1">الوقفة الإيمانية والتدبر:</strong>
          {todayReminder.reflectionAr}
        </div>
      </div>

      {/* Reminder Notification Settings Card */}
      <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
              التذكير الإيماني اليومي الهادئ
            </div>
            <div className="text-[11px] text-stone-500">
              عرض آية أو حديث شريف صحيح يومياً باقتضاب واحترام، دون إزعاج أو إشعارات غير مرغوبة
            </div>
          </div>
        </div>

        <button
          onClick={toggleReminders}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            remindersEnabled
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300"
          }`}
        >
          {remindersEnabled ? "مفعّل" : "معطّل"}
        </button>
      </div>

      {/* Archive of Verified Reminders */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
          سجل التذكيرات والوقفات الإيمانية
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {VERIFIED_DAILY_REMINDERS.slice(1).map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800 text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  {r.titleAr}
                </span>
                <span className="text-[11px] text-stone-400">{r.sourceCitation}</span>
              </div>

              <div
                className="font-serif text-base sm:text-lg text-stone-900 dark:text-stone-100 leading-relaxed"
                style={{ fontFamily: "'Amiri', serif" }}
              >
                {r.contentAr}
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed pt-2 border-t border-stone-100 dark:border-stone-800">
                {r.reflectionAr}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
