import React, { useState, useEffect } from "react";
import { DigitalQuranReader } from "./DigitalQuranReader";
import { QuranMushafReader } from "./QuranMushafReader";
import { QuranAudioPlayer } from "./QuranAudioPlayer";
import { PrayerTimesCard } from "./PrayerTimesCard";
import { DailyAdhkarPanel } from "./DailyAdhkarPanel";
import { DuasLibraryPanel } from "./DuasLibraryPanel";
import { NamesOfAllahPanel } from "./NamesOfAllahPanel";
import { HadithLibraryPanel } from "./HadithLibraryPanel";
import { IslamicCalendarPanel } from "./IslamicCalendarPanel";
import { QuranMemorizationPanel } from "./QuranMemorizationPanel";
import { DailyRemindersPanel } from "./DailyRemindersPanel";
import { GoodDeedsPanel } from "./GoodDeedsPanel";
import { TafsirPanel } from "./TafsirPanel";
import { TajweedAcademyPanel } from "./TajweedAcademyPanel";
import { IslamicKnowledgeHub, type KnowledgeHubSubSection } from "./IslamicKnowledgeHub";
import { UnifiedIslamicSearchPanel } from "./UnifiedIslamicSearchPanel";
import type { GlobalCountryCode } from "@/lib/quran-reciters-directory";
import type { UnifiedIslamicSearchResult } from "@/lib/islamic-search";
import { SURAHS_INDEX } from "@/lib/quran-mushaf";
import {
  BookOpen,
  Headphones,
  Clock,
  Sparkles,
  Heart,
  Calendar,
  Layers,
  Award,
  Bookmark,
  Bell,
  HelpCircle,
  ShieldCheck,
  Compass,
  ScrollText,
  Scale,
  Search,
} from "lucide-react";

export type IslamicSubSection =
  | "mushaf"
  | "listening"
  | "tafsir"
  | "prayer"
  | "adhkar"
  | "duas"
  | "calendar"
  | "names"
  | "hadith"
  | "memorization"
  | "learning"
  | "knowledge"
  | "reminders"
  | "charity"
  | "search";

interface IslamicCenterWorkspaceProps {
  initialTab?: IslamicSubSection;
  lang?: string;
}

export const IslamicCenterWorkspace: React.FC<IslamicCenterWorkspaceProps> = ({
  initialTab = "mushaf",
  lang = "ar",
}) => {
  const [activeTab, setActiveTab] = useState<IslamicSubSection>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("islamic_tab") as IslamicSubSection;
      if (t) return t;
    }
    return initialTab;
  });

  const [targetMushafPage, setTargetMushafPage] = useState<number>(1);
  const [mushafViewMode, setMushafViewMode] = useState<"interactive" | "pages">("interactive");
  const [targetAudioSurah, setTargetAudioSurah] = useState<number>(1);
  const [targetAudioReciterId, setTargetAudioReciterId] = useState<string>("al-luhaidan");
  const [targetAudioRecordingId, setTargetAudioRecordingId] = useState<string | undefined>(
    undefined,
  );
  const [targetAudioCountryCode, setTargetAudioCountryCode] = useState<
    GlobalCountryCode | undefined
  >(undefined);
  const [targetTafsirSurah, setTargetTafsirSurah] = useState<number>(1);
  const [targetKnowledgeSection, setTargetKnowledgeSection] =
    useState<KnowledgeHubSubSection>("fiqh");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("islamic_tab", activeTab);
      window.history.replaceState({}, "", url.toString());
    }
  }, [activeTab]);

  const handleOpenMushafPage = (page: number) => {
    setTargetMushafPage(page);
    setMushafViewMode("pages");
    setActiveTab("mushaf");
  };

  const handleOpenAudioSurah = (
    surahId: number,
    reciterId?: string,
    countryCode?: GlobalCountryCode,
  ) => {
    setTargetAudioSurah(surahId);
    if (reciterId) setTargetAudioReciterId(reciterId);
    setTargetAudioCountryCode(countryCode);
    setActiveTab("listening");
  };

  const handleNavigateUnifiedResult = (res: UnifiedIslamicSearchResult) => {
    if (res.targetTab === "listening") {
      setTargetAudioSurah(res.payload?.surahId ?? 1);
      if (res.payload?.reciterId) {
        setTargetAudioReciterId(res.payload.reciterId);
      }
      setTargetAudioRecordingId(res.payload?.recordingId);
      setTargetAudioCountryCode(res.payload?.countryCode);
      setActiveTab("listening");
      return;
    }
    if (res.targetTab === "mushaf" && res.payload?.surahId) {
      const surah = SURAHS_INDEX.find((s) => s.id === res.payload?.surahId);
      if (surah) {
        handleOpenMushafPage(surah.startPage);
        return;
      }
    }
    if (res.targetTab === "tafsir") {
      setTargetTafsirSurah(res.payload?.surahId ?? 1);
      setActiveTab("tafsir");
      return;
    }
    if (res.targetTab === "knowledge") {
      if (res.payload?.subSection) {
        setTargetKnowledgeSection(res.payload.subSection as KnowledgeHubSubSection);
      }
      setActiveTab("knowledge");
      return;
    }
    setActiveTab(res.targetTab as IslamicSubSection);
  };

  const navGroups: Array<{
    id: string;
    titleAr: string;
    titleEn: string;
    items: {
      id: IslamicSubSection;
      nameAr: string;
      nameEn: string;
      icon: React.ComponentType<{ className?: string }>;
    }[];
  }> = [
    {
      id: "quran",
      titleAr: "القرآن والتلاوة",
      titleEn: "Quran & Recitation",
      items: [
        { id: "mushaf", nameAr: "المصحف الشريف", nameEn: "Quran Mushaf", icon: BookOpen },
        {
          id: "listening",
          nameAr: "دليل القرّاء والتلاوات",
          nameEn: "Global Reciters",
          icon: Headphones,
        },
        { id: "tafsir", nameAr: "التفسير والفهم", nameEn: "Tafsir & Study", icon: ScrollText },
        { id: "memorization", nameAr: "تحفيظ القرآن", nameEn: "Memorization", icon: Bookmark },
      ],
    },
    {
      id: "study",
      titleAr: "العلوم الشرعية",
      titleEn: "Islamic Learning",
      items: [
        { id: "learning", nameAr: "أكاديمية التجويد", nameEn: "Tajweed Academy", icon: HelpCircle },
        { id: "hadith", nameAr: "رياض الحديث", nameEn: "Hadith Library", icon: Layers },
        { id: "knowledge", nameAr: "الفقه والسنن والعقيدة", nameEn: "Knowledge Hub", icon: Scale },
        { id: "names", nameAr: "أسماء الله الحسنى", nameEn: "Names of Allah", icon: Award },
      ],
    },
    {
      id: "worship",
      titleAr: "العبادة والأوقات",
      titleEn: "Daily Worship",
      items: [
        { id: "prayer", nameAr: "مواقيت الصلاة", nameEn: "Prayer Times", icon: Clock },
        { id: "adhkar", nameAr: "الأذكار اليومية", nameEn: "Daily Adhkar", icon: Sparkles },
        { id: "duas", nameAr: "موسوعة الأدعية", nameEn: "Duas Library", icon: Heart },
        { id: "calendar", nameAr: "التقويم الهجري", nameEn: "Islamic Calendar", icon: Calendar },
      ],
    },
    {
      id: "tools",
      titleAr: "التزكية والبحث",
      titleEn: "Reflection & Search",
      items: [
        { id: "reminders", nameAr: "تذكرة اليوم", nameEn: "Daily Reminders", icon: Bell },
        { id: "charity", nameAr: "أبواب الخير", nameEn: "Good Deeds", icon: ShieldCheck },
        { id: "search", nameAr: "البحث الشامل", nameEn: "Unified Search", icon: Search },
      ],
    },
  ];

  const isAr = lang === "ar";

  return (
    <div
      className="w-full min-w-0 max-w-7xl mx-auto space-y-6 pb-24 overflow-x-hidden"
      dir={isAr ? "rtl" : "ltr"}
      data-testid="islamic-center-workspace"
    >
      {/* Platform Section Brand Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 p-6 sm:p-8 text-white shadow-lg border border-emerald-500/30">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-200 text-xs font-semibold border border-emerald-400/30">
              <Compass className="w-3.5 h-3.5 text-emerald-300" />
              <span>{isAr ? "المركز الإسلامي الشامل" : "Islamic Center · Study & Worship"}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight">
              {isAr ? "المركز الإسلامي الشامل" : "Islamic Center & Quranic Heritage"}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/85 max-w-2xl leading-relaxed">
              {isAr
                ? "تجربة إسلامية قرآنية متكاملة وموثقة: مصحف المدينة برسم عثماني أصيل، تلاوات بأصوات كبار المشايخ، مواقيت الصلاة الفلكية، الأذكار اليومية، والأربعون النووية."
                : "Authentic Quran recitation & Uthmani script Mushaf, scholarly reciters, astronomical prayer times, verified daily Adhkar, and the Forty Nawawi Hadith."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab("search")}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span>{isAr ? "البحث في المركز الإسلامي" : "Search Islamic Center"}</span>
            </button>

            <div className="flex items-center gap-2 text-xs bg-black/35 px-4 py-2.5 rounded-xl border border-emerald-500/30 text-emerald-100">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-start">
                <div className="font-bold">
                  {isAr ? "محتوى شرعي موثق" : "Verified Authentic Texts"}
                </div>
                <div className="text-[11px] text-emerald-200/80">
                  {isAr
                    ? "بدون أصوات ذكاء اصطناعي أو تحريف"
                    : "No AI-fabricated verses, hadith, or synthetic recitation"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Humble Theological & Privacy Safeguard Notice */}
      <div
        data-testid="islamic-sincerity-notice"
        className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-stone-800 dark:text-emerald-100"
      >
        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
        <span>
          {isAr
            ? "تنبيه الإخلاص والخصوصية: لا تقيس المنصة الأجر الإلهي ولا تمنح نقاطاً على العبادات، فالأجر والقبول عند الله وحده. وتبقى سجلات عبادتك الشخصية وأذكارك خاصة بك على جهازك ولا تُعرض في أي لوحة عامة."
            : "Sincerity & Privacy Note: BTC never calculates divine reward or scores worship — reward belongs to Allah alone. Personal worship check-ins remain private by default and never enter competitive leaderboards."}
        </span>
      </div>

      {/* Structured 4-Category Navigation Grid */}
      <nav
        aria-label={isAr ? "أقسام المركز الإسلامي" : "Islamic Center Sections"}
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4"
        data-testid="islamic-center-nav"
      >
        {navGroups.map((group) => (
          <div
            key={group.id}
            className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 p-2.5 space-y-1.5"
          >
            <div className="px-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              {isAr ? group.titleAr : group.titleEn}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {group.items.map((item) => {
                const isCurrent = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    aria-pressed={isCurrent}
                    className={`flex min-h-[44px] items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors text-start ${
                      isCurrent
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-200/70 dark:hover:bg-stone-800"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`}
                    />
                    <span className="leading-snug break-words">
                      {isAr ? item.nameAr : item.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Subsection Content Renderers */}
      <div className="w-full">
        {activeTab === "mushaf" && (
          <div className="space-y-4">
            <DigitalQuranReader />
          </div>
        )}

        {activeTab === "listening" && (
          <div className="space-y-4">
            <QuranAudioPlayer
              initialSurahId={targetAudioSurah}
              initialReciterId={targetAudioReciterId}
              {...(targetAudioRecordingId !== undefined
                ? { initialRecordingId: targetAudioRecordingId }
                : {})}
              {...(targetAudioCountryCode !== undefined
                ? { initialCountryCode: targetAudioCountryCode }
                : {})}
              lang={lang}
            />
          </div>
        )}

        {activeTab === "tafsir" && (
          <div className="space-y-4">
            <TafsirPanel
              lang={lang}
              initialSurahId={targetTafsirSurah}
              onOpenAudioSurah={(sId) => handleOpenAudioSurah(sId)}
              onOpenMushafPage={handleOpenMushafPage}
            />
          </div>
        )}

        {activeTab === "prayer" && (
          <div className="space-y-4">
            <PrayerTimesCard lang={lang} />
          </div>
        )}

        {activeTab === "adhkar" && (
          <div className="space-y-4">
            <DailyAdhkarPanel lang={lang} />
          </div>
        )}

        {activeTab === "duas" && (
          <div className="space-y-4">
            <DuasLibraryPanel lang={lang} />
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="space-y-4">
            <IslamicCalendarPanel lang={lang} />
          </div>
        )}

        {activeTab === "names" && (
          <div className="space-y-4">
            <NamesOfAllahPanel lang={lang} />
          </div>
        )}

        {activeTab === "hadith" && (
          <div className="space-y-4">
            <HadithLibraryPanel lang={lang} />
          </div>
        )}

        {activeTab === "memorization" && (
          <div className="space-y-4">
            <QuranMemorizationPanel
              onOpenMushafPage={handleOpenMushafPage}
              onOpenAudioSurah={handleOpenAudioSurah}
              lang={lang}
            />
          </div>
        )}

        {activeTab === "learning" && (
          <div className="space-y-6">
            <TajweedAcademyPanel
              lang={lang}
              onOpenAudioReciter={(reciterId, surahId) => handleOpenAudioSurah(surahId, reciterId)}
            />

            {/* Islamic Foundations & Tajweed Quick Reference */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>العلوم الشرعية وأحكام التجويد الأساسية</span>
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                دليل تعليمي موثق لمبادئ تلاوة القرآن الكريم وأحكام التجويد المستمدة من متون التجويد
                المعتمدة (تحفة الأطفال والمقدمة الجزرية).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-300">
                    ١. أحكام النون الساكنة والتنوين (٤ أحكام)
                  </h4>
                  <ul className="space-y-1 text-stone-600 dark:text-stone-300">
                    <li>
                      <strong>الإظهار الحلقي:</strong> عند حروف الحلق الستة (ء، هـ، ع، ح، غ، خ).
                    </li>
                    <li>
                      <strong>الإدغام:</strong> في حروف كلمة (يرملون)؛ بغنة في (ينمو) وبغير غنة في
                      (الراء واللام).
                    </li>
                    <li>
                      <strong>الإقلاب:</strong> قلب النون ميماً مخفاة بغنة عند حرف (الباء).
                    </li>
                    <li>
                      <strong>الإخفاء الحقيقي:</strong> عند باقي الحروف الخمسة عشر.
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-300">
                    ٢. أحكام الميم الساكنة (٣ أحكام)
                  </h4>
                  <ul className="space-y-1 text-stone-600 dark:text-stone-300">
                    <li>
                      <strong>الإخفاء الشفوي:</strong> إذا وقع بعدها حرف (الباء) مع الغنة.
                    </li>
                    <li>
                      <strong>الإدغام الصغير:</strong> إذا وقعت بعدها ميم متحركة مع الغنة.
                    </li>
                    <li>
                      <strong>الإظهار الشفوي:</strong> عند سائر الحروف الهجائية، وأشد ما يكون عند
                      الواو والفاء.
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-300">
                    ٣. أحكام المدود (الأصلي والفرعي)
                  </h4>
                  <ul className="space-y-1 text-stone-600 dark:text-stone-300">
                    <li>
                      <strong>المد الطبيعي:</strong> حركتان، وهو ما لا تقوم ذات الحرف إلا به.
                    </li>
                    <li>
                      <strong>المد المتصل:</strong> أن يقع الهمز بعد حرف المد في كلمة واحدة (٤-٥
                      حركات).
                    </li>
                    <li>
                      <strong>المد المنفصل:</strong> أن يكون حرف المد في آخر الكلمة والهمز في أول
                      الأخرى.
                    </li>
                    <li>
                      <strong>المد اللازم:</strong> ٦ حركات لوقوع السكون الأصلي بعد حرف المد.
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-300">
                    ٤. صفات الحروف ومخارجها
                  </h4>
                  <ul className="space-y-1 text-stone-600 dark:text-stone-300">
                    <li>
                      <strong>القلقلة:</strong> في حروف (قطب جد) حال سكونها اضطراباً في المخرج.
                    </li>
                    <li>
                      <strong>التفخيم والترقيق:</strong> حروف الاستعلاء (خص ضغط قظ) مفخمة دائماً.
                    </li>
                    <li>
                      <strong>الهمس والجهر:</strong> حروف الهمس مجموعة في (فحثه شخص سكت).
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "knowledge" && (
          <div className="space-y-4">
            <IslamicKnowledgeHub
              lang={lang}
              initialSection={targetKnowledgeSection}
              onNavigateTab={(tab, payload) => {
                if (tab === "listening") {
                  handleOpenAudioSurah(
                    payload?.surahId ?? 1,
                    payload?.reciterId,
                    payload?.countryCode,
                  );
                } else {
                  setActiveTab(tab as IslamicSubSection);
                }
              }}
            />
          </div>
        )}

        {activeTab === "reminders" && (
          <div className="space-y-4">
            <DailyRemindersPanel lang={lang} />
          </div>
        )}

        {activeTab === "charity" && (
          <div className="space-y-4">
            <GoodDeedsPanel lang={lang} />
          </div>
        )}

        {activeTab === "search" && (
          <div className="space-y-4">
            <UnifiedIslamicSearchPanel lang={lang} onNavigateResult={handleNavigateUnifiedResult} />
          </div>
        )}
      </div>
    </div>
  );
};
