import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  Heart,
  Moon,
  Sun,
  ShieldCheck,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface FastingTrackerPanelProps {
  lang?: string;
}

interface FastingLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: "monday_thursday" | "white_days" | "shawwal" | "arafah" | "ashura" | "other";
  notes?: string;
}

const STORAGE_KEY = "btc_fasting_tracker_v1";

export const FastingTrackerPanel: React.FC<FastingTrackerPanelProps> = ({ lang = "ar" }) => {
  const isAr = lang === "ar";

  const [logs, setLogs] = useState<FastingLogEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [selectedType, setSelectedType] = useState<FastingLogEntry["type"]>("monday_thursday");
  const [logDate, setLogDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch {
      // Ignore storage errors
    }
  }, [logs]);

  const handleAddFastingDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logDate) return;
    if (logs.some((l) => l.date === logDate)) {
      toast.info(isAr ? "تم تسجيل صيام هذا اليوم مسبقاً." : "This day is already logged.");
      return;
    }
    const newEntry: FastingLogEntry = {
      id: `fast-${Date.now()}`,
      date: logDate,
      type: selectedType,
    };
    setLogs((prev) => [newEntry, ...prev]);
    toast.success(
      isAr
        ? "تقبل الله طاعتك وصيامك! تم تسجيل اليوم بنجاح."
        : "May Allah accept your fasting! Day logged successfully.",
    );
  };

  const handleRemoveLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    toast.info(isAr ? "تم حذف السجل." : "Entry removed.");
  };

  const sunnahFasts = [
    {
      id: "monday_thursday",
      titleAr: "صيام الإثنين والخميس",
      titleEn: "Mondays & Thursdays",
      hadithAr: "«تُعْرَضُ الأَعْمَالُ يَوْمَ الاِثْنَيْنِ وَالْخَمِيسِ فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ»",
      hadithRef: "رواه الترمذي (حديث حسن)",
      virtueAr: "عرض الأعمال الصالحة على الله أسبوعياً ومغفرة الذنوب إلا للمتشاحنين.",
      virtueEn:
        "Deeds are presented to Allah on Mondays and Thursdays; the Prophet loved to be fasting when his deeds are shown.",
    },
    {
      id: "white_days",
      titleAr: "صيام الأيام البيض (١٣، ١٤، ١٥ من كل شهر هجري)",
      titleEn: "The White Days (13th, 14th, 15th)",
      hadithAr: "«صِيَامُ ثَلاَثَةِ أَيَّامٍ مِنْ كُلِّ شَهْرٍ صِيَامُ الدَّهْرِ»",
      hadithRef: "متفق عليه",
      virtueAr: "الحسنة بعشر أمثالها، فصيام ثلاثة أيام يعادل صيام الشهر كاملاً.",
      virtueEn: "Fasting 3 days of every lunar month is equivalent to fasting the entire lifetime.",
    },
    {
      id: "arafah",
      titleAr: "صيام يوم عرفة (٩ ذو الحجة لغير الحاج)",
      titleEn: "Day of Arafah (9th Dhul-Hijjah)",
      hadithAr: "«صِيَامُ يَوْمِ عَرَفَةَ أَحْتَسِبُ عَلَى اللَّهِ أَنْ يُكَفِّرَ السَّنَةَ الَّتِي قَبْلَهُ وَالسَّنَةَ الَّتِي بَعْدَهُ»",
      hadithRef: "رواه مسلم",
      virtueAr: "تكفير سنتين كاملتين: سنة ماضية وسنة مقبلة بإذن الله تعالى.",
      virtueEn: "Expiates the sins of two full years: the preceding year and the upcoming year.",
    },
    {
      id: "ashura",
      titleAr: "صيام عاشوراء وتاسوعاء (٩ و١٠ محرم)",
      titleEn: "Day of Ashura & Tasu'a",
      hadithAr: "«صِيَامُ يَوْمِ عَاشُورَاءَ أَحْتَسِبُ عَلَى اللَّهِ أَنْ يُكَفِّرَ السَّنَةَ الَّتِي قَبْلَهُ»",
      hadithRef: "رواه مسلم",
      virtueAr: "شكر لله على نجاة موسى عليه السلام وتكفير ذنوب سنة ماضية كاملة.",
      virtueEn:
        "Gratitude to Allah for saving Musa (AS) and expiation for the sins of the past year.",
    },
    {
      id: "shawwal",
      titleAr: "صيام ست من شوال",
      titleEn: "Six Days of Shawwal",
      hadithAr: "«مَنْ صَامَ رَمَضَانَ ثُمَّ أَتْبَعَهُ سِتّاً مِنْ شَوَّالٍ كَانَ كَصِيَامِ الدَّهْرِ»",
      hadithRef: "رواه مسلم",
      virtueAr: "إتمام أجر صيام سنة كاملة كالفريضة، مع الاستمرار في الطاعة بعد رمضان.",
      virtueEn:
        "Fasting Ramadan followed by six days of Shawwal earns the reward of fasting the whole year.",
    },
  ];

  const thisMonthLogs = logs.filter((l) => {
    const d = new Date(l.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="surface-card rounded-2xl border border-sky-500/20 bg-gradient-to-r from-sky-950/20 via-indigo-950/15 to-transparent p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
                <Moon className="size-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                {isAr ? "سجل صيام التطوع والسنن النبوية" : "Sunnah Fasting & Habit Tracker"}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isAr
                ? "تتبّع أيام صيام النوافل (الإثنين والخميس، الأيام البيض، عاشوراء، وعرفة) وتعرّف على فضائلها النبوية وأدعيتها المأثورة."
                : "Track your voluntary Sunnah fasts (Mondays & Thursdays, White Days, Arafah, Ashura) with authentic Hadiths and Duas."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3.5 py-2 text-xs font-bold text-sky-600 dark:text-sky-400">
              <Flame className="size-4 text-amber-500" />
              <span>
                {isAr ? `أيام الصيام المسجلة: ${logs.length}` : `Total Fasted Days: ${logs.length}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Fasting Logging Form & Duas (5 cols) */}
        <div className="space-y-5 lg:col-span-5">
          {/* Quick Log Form */}
          <form
            onSubmit={handleAddFastingDay}
            className="surface-card rounded-2xl border border-border p-5 space-y-4 shadow-sm"
          >
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="size-4 text-sky-500" />
              <span>{isAr ? "تسجيل يوم صيام جديد" : "Log a Fasted Day"}</span>
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {isAr ? "تاريخ اليوم" : "Date"}
                </label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {isAr ? "نوع الصيام المستحب" : "Sunnah Fasting Category"}
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as FastingLogEntry["type"])}
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="monday_thursday">
                    {isAr ? "الإثنين أو الخميس" : "Monday / Thursday"}
                  </option>
                  <option value="white_days">
                    {isAr ? "الأيام البيض (١٣، ١٤، ١٥)" : "White Days (13, 14, 15)"}
                  </option>
                  <option value="shawwal">{isAr ? "ست من شوال" : "Six of Shawwal"}</option>
                  <option value="arafah">{isAr ? "يوم عرفة" : "Day of Arafah"}</option>
                  <option value="ashura">{isAr ? "عاشوراء وتاسوعاء" : "Ashura / Tasu'a"}</option>
                  <option value="other">{isAr ? "صيام تطوع عام" : "General Voluntary Fast"}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer transition-colors"
              >
                <Plus className="size-4" />
                <span>{isAr ? "حفظ وتثبيت يوم الصيام" : "Save Fasted Day"}</span>
              </button>
            </div>
          </form>

          {/* Authentic Duas for Fasting */}
          <div className="surface-card rounded-2xl border border-border p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Heart className="size-4 text-rose-500" />
              <span>{isAr ? "أدعية وآداب الصيام المأثورة" : "Authentic Fasting Duas"}</span>
            </h3>

            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-surface-2 p-3 space-y-1">
                <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                  {isAr ? "دعاء الإفطار الثابت عن النبي ﷺ:" : "Dua Upon Breaking the Fast:"}
                </span>
                <p className="text-xs font-bold text-foreground font-serif leading-relaxed">
                  «ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ»
                </p>
                <span className="text-[10px] text-muted-foreground block">
                  {isAr ? "رواه أبو داود (حديث حسن)" : "Narrated by Abu Dawood (Hasan)"}
                </span>
              </div>

              <div className="rounded-xl border border-border bg-surface-2 p-3 space-y-1">
                <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                  {isAr ? "إذا شتمك أحد أو سابك وأنت صائم:" : "If Insulted While Fasting:"}
                </span>
                <p className="text-xs font-bold text-foreground font-serif leading-relaxed">
                  «إِنِّي صَائِمٌ، إِنِّي صَائِمٌ»
                </p>
                <span className="text-[10px] text-muted-foreground block">
                  {isAr ? "متفق عليه" : "Sahih Bukhari & Muslim"}
                </span>
              </div>

              <div className="rounded-xl border border-border bg-surface-2 p-3 space-y-1">
                <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                  {isAr ? "نية صيام التطوع:" : "Intention for Voluntary Fasting:"}
                </span>
                <p className="text-xs text-foreground leading-relaxed">
                  {isAr
                    ? "يجوز إيقاع نية صيام التطوع من النهار ما لم يتناول مفطراً، ومحل النية القلب."
                    : "The intention for voluntary fasting may be made during the daytime before eating or drinking."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* History & Virtues (7 cols) */}
        <div className="space-y-5 lg:col-span-7">
          {/* History of logged fasts */}
          <div className="surface-card rounded-2xl border border-border p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>{isAr ? "سجل الأيام المصومة" : "Fasting History Log"}</span>
              </h3>
              <span className="text-xs text-muted-foreground">
                {isAr
                  ? `هذا الشهر: ${thisMonthLogs.length} أيام`
                  : `This Month: ${thisMonthLogs.length} days`}
              </span>
            </div>

            {logs.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                <Moon className="size-8 mx-auto text-muted-foreground/40" />
                <p>
                  {isAr
                    ? "لم تقم بتسجيل أي أيام صيام بعد. ابدأ اليوم!"
                    : "No fasts logged yet. Start logging your days!"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60 max-h-72 overflow-y-auto pr-1">
                {logs.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between py-2.5 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground font-mono">{entry.date}</span>
                        <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">
                          {entry.type === "monday_thursday"
                            ? isAr
                              ? "إثنين/خميس"
                              : "Mon/Thu"
                            : entry.type === "white_days"
                              ? isAr
                                ? "الأيام البيض"
                                : "White Days"
                              : entry.type === "shawwal"
                                ? isAr
                                  ? "شوال"
                                  : "Shawwal"
                                : entry.type === "arafah"
                                  ? isAr
                                    ? "عرفة"
                                    : "Arafah"
                                  : entry.type === "ashura"
                                    ? isAr
                                      ? "عاشوراء"
                                      : "Ashura"
                                    : isAr
                                      ? "تطوع"
                                      : "Voluntary"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveLog(entry.id)}
                      className="text-muted-foreground hover:text-rose-500 p-1 cursor-pointer transition-colors"
                      title="Remove entry"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Virtues of Sunnah Fasts */}
          <div className="surface-card rounded-2xl border border-border p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Award className="size-4 text-amber-500" />
              <span>{isAr ? "أيام صيام التطوع المستحبة وفضائلها" : "Virtues of Sunnah Fasts"}</span>
            </h3>

            <div className="space-y-3">
              {sunnahFasts.map((fast) => (
                <div
                  key={fast.id}
                  className="rounded-xl border border-border bg-surface-2 p-3.5 space-y-1.5 transition-colors hover:border-sky-500/30"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground">
                      {isAr ? fast.titleAr : fast.titleEn}
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {fast.hadithRef}
                    </span>
                  </div>
                  <p className="text-xs font-serif font-semibold text-sky-700 dark:text-sky-300 leading-relaxed">
                    {fast.hadithAr}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {isAr ? fast.virtueAr : fast.virtueEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
