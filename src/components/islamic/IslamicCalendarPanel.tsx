import React, { useMemo } from "react";
import { computeEstimatedHijriDate, IMPORTANT_ISLAMIC_OCCASIONS } from "@/data/islamic-center";
import { toArabicIndicDigits } from "@/lib/quran";
import { Calendar, Moon, AlertCircle } from "lucide-react";

interface IslamicCalendarPanelProps {
  lang?: string;
}

export const IslamicCalendarPanel: React.FC<IslamicCalendarPanelProps> = ({ lang = "ar" }) => {
  const today = useMemo(() => new Date(), []);
  const hijri = useMemo(() => computeEstimatedHijriDate(today), [today]);

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* Prominent Legal Moon Sighting Notice (Shariah compliance requirement) */}
      <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold">ملاحظة شرعية هامة بشأن ثبوت الهلال:</strong>
          <p className="leading-relaxed opacity-95">
            التقويم الهجري المعروض هنا تقويم حسابي تقديري مبني على الحسابات الفلكية. إن دخول الأشهر
            القمرية وصيام رمضان وإفطاره وعيدي الفطر والأضحى ويوم عرفة معتمد شرعاً بالدرجة الأولى على
            ثبوت رؤية الهلال من قِبَل المحاكم والهيئات الشرعية ودور الإفتاء المعتمدة في بلدان العالم
            الإسلامي عملاً بالحديث الشريف: «صُومُوا لِرُؤْيَتِهِ وَأَفْطِرُوا لِرُؤْيَتِهِ».
          </p>
        </div>
      </div>

      {/* Hero Current Date Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 sm:p-8 text-white shadow-lg border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <Moon className="w-3.5 h-3.5" />
            <span>تاريخ اليوم</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-bold font-serif">
            {toArabicIndicDigits(hijri.hijriDay)} {hijri.monthNameAr}{" "}
            {toArabicIndicDigits(hijri.hijriYear)} هـ
          </h3>

          <p className="text-xs sm:text-sm text-emerald-100/80">
            الموافق لـ{" "}
            {today.toLocaleDateString("ar-SA", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            ميلادي (
            {today.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            )
          </p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-800/50 border border-emerald-500/30 text-center shrink-0">
          <div className="text-[10px] text-emerald-200 uppercase font-bold">
            الشهر الهجري الجاري
          </div>
          <div className="text-xl font-bold font-serif mt-1">{hijri.monthNameAr}</div>
          <div className="text-xs font-mono text-emerald-300 mt-0.5">{hijri.monthNameEn}</div>
        </div>
      </div>

      {/* Directory of Major Islamic Occasions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>أبرز المناسبات والأعياد والمواسم الإسلامية:</span>
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {IMPORTANT_ISLAMIC_OCCASIONS.map((occ) => (
            <div
              key={occ.id}
              className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-start gap-3 hover:border-emerald-500/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold font-serif text-sm">
                {toArabicIndicDigits(occ.hijriDay)}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                    {occ.titleAr}
                  </h5>
                  <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                    {occ.hijriMonthNameAr}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 font-mono">{occ.titleEn}</div>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {occ.descriptionAr}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
