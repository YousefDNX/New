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
import { SpiritualDevotionPanel } from "./SpiritualDevotionPanel";
import { ZakatCalculatorPanel } from "./ZakatCalculatorPanel";
import { FastingTrackerPanel } from "./FastingTrackerPanel";
import { SadaqahJariyahWidget } from "@/components/dashboard/SadaqahJariyahWidget";
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
  ScrollText,
  Scale,
  Search,
  Coins,
  Moon,
} from "lucide-react";

export type IslamicSubSection =
  | "mushaf"
  | "listening"
  | "tafsir"
  | "prayer"
  | "adhkar"
  | "duas"
  | "calendar"
  | "fasting"
  | "zakat"
  | "names"
  | "hadith"
  | "memorization"
  | "learning"
  | "knowledge"
  | "reminders"
  | "charity"
  | "devotion"
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
  const [mushafJumpSignal, setMushafJumpSignal] = useState<number>(0);
  const [mushafViewMode, setMushafViewMode] = useState<"interactive" | "pages">("pages");
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
    setMushafJumpSignal((n) => n + 1);
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
        { id: "zakat", nameAr: "حاسبة الزكاة والمصارف", nameEn: "Zakat Calculator", icon: Coins },
        { id: "names", nameAr: "أسماء الله الحسنى", nameEn: "Names of Allah", icon: Award },
      ],
    },
    {
      id: "worship",
      titleAr: "العبادة والأوقات",
      titleEn: "Daily Worship",
      items: [
        { id: "prayer", nameAr: "مواقيت الصلاة", nameEn: "Prayer Times", icon: Clock },
        { id: "adhkar", nameAr: "الأذكار اليومية", nameEn: "Daily Azkar", icon: Sparkles },
        { id: "duas", nameAr: "موسوعة الأدعية", nameEn: "Duas Library", icon: Heart },
        { id: "calendar", nameAr: "التقويم الهجري", nameEn: "Islamic Calendar", icon: Calendar },
        { id: "fasting", nameAr: "صيام التطوع والسنن", nameEn: "Sunnah Fasting", icon: Moon },
      ],
    },
    {
      id: "tools",
      titleAr: "التزكية والبحث",
      titleEn: "Reflection & Search",
      items: [
        { id: "reminders", nameAr: "تذكرة اليوم", nameEn: "Daily Reminders", icon: Bell },
        {
          id: "devotion",
          nameAr: "طريق محبة الله والفردوس",
          nameEn: "Allah's Love & Al-Firdaus",
          icon: Heart,
        },
        {
          id: "charity",
          nameAr: "الصدقة الجارية وأبواب الخير",
          nameEn: "Sadaqah Jariyah & Good Deeds",
          icon: ShieldCheck,
        },
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
      {/* Clean Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-stone-900 dark:text-stone-100">
            {isAr ? "المركز الإسلامي" : "Islamic Center"}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
            {isAr
              ? "مصحف المدينة المنورة، تلاوات MP3 لجميع السور، التفسير، مواقيت الصلاة، والأذكار."
              : "Uthmani Quran Mushaf, direct MP3 recitations, Tafsir, Prayer Times, and daily worship tools."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("listening")}
            className="inline-flex min-h-[42px] items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Headphones className="w-4 h-4" />
            <span>{isAr ? "تلاوات MP3" : "Quran MP3s"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className="inline-flex min-h-[42px] items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-emerald-600 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Search className="w-4 h-4" />
            <span>{isAr ? "بحث" : "Search"}</span>
          </button>
        </div>
      </div>

      {/* Quiet Sincerity & Privacy Note */}
      <div
        data-testid="islamic-sincerity-notice"
        className="flex items-start gap-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 px-3.5 py-2.5 text-xs text-stone-600 dark:text-stone-300"
      >
        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-700 dark:text-emerald-400 mt-0.5" />
        <span>
          {isAr
            ? "تنبيه الإخلاص والخصوصية: لا تقيس المنصة الأجر الإلهي ولا تمنح نقاطاً على العبادات، فالأجر والقبول عند الله وحده. وتبقى سجلات عبادتك الشخصية وأذكارك خاصة بك على جهازك ولا تُعرض في أي لوحة عامة."
            : "Sincerity & Privacy Note: BTC never calculates divine reward or scores worship — reward belongs to Allah alone. Personal worship check-ins remain private by default and never enter competitive leaderboards."}
        </span>
      </div>

      {/* Simple Flat Section Tabs */}
      <nav
        aria-label={isAr ? "أقسام المركز الإسلامي" : "Islamic Center Sections"}
        className="space-y-2"
        data-testid="islamic-center-nav"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {navGroups
            .flatMap((g) => g.items)
            .map((item) => {
              const isCurrent = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-pressed={isCurrent}
                  className={`inline-flex min-h-[40px] items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                    isCurrent
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-stone-100/90 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-white" : "text-emerald-700 dark:text-emerald-400"}`}
                  />
                  <span>{isAr ? item.nameAr : item.nameEn}</span>
                </button>
              );
            })}
        </div>
      </nav>

      {/* Subsection Content Renderers */}
      <div className="w-full">
        {activeTab === "mushaf" && (
          <div className="space-y-4">
            <div
              data-testid="mushaf-view-mode-switch"
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/70 p-2"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMushafViewMode("pages")}
                  className={`min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    mushafViewMode === "pages"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>
                    {isAr
                      ? "المصحف الحقيقي (صفحتان / تقليب باللمس)"
                      : "Real Page Mushaf (2-Page / Mobile Swipe)"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setMushafViewMode("interactive")}
                  className={`min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    mushafViewMode === "interactive"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800"
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>
                    {isAr ? "القارئ الصوتي بالسور والترجمة" : "Interactive Surah & Audio Reader"}
                  </span>
                </button>
              </div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 px-2">
                {isAr ? "مصحف المدينة المنورة — ٦٠٤ صفحات" : "Madinah Mushaf — 604 Pages"}
              </span>
            </div>

            {mushafViewMode === "pages" ? (
              <QuranMushafReader
                initialPage={targetMushafPage}
                jumpSignal={mushafJumpSignal}
                lang={lang}
              />
            ) : (
              <DigitalQuranReader />
            )}
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

        {activeTab === "zakat" && (
          <div className="space-y-4">
            <ZakatCalculatorPanel lang={lang} />
          </div>
        )}

        {activeTab === "fasting" && (
          <div className="space-y-4">
            <FastingTrackerPanel lang={lang} />
          </div>
        )}

        {activeTab === "devotion" && (
          <div className="space-y-6">
            <SpiritualDevotionPanel lang={lang} />
          </div>
        )}

        {activeTab === "charity" && (
          <div className="space-y-6">
            <SadaqahJariyahWidget lang={lang} />
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
