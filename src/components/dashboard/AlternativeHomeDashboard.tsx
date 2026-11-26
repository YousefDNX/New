import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  CheckSquare,
  Compass,
  Flame,
  Languages,
  LifeBuoy,
  Map as MapIcon,
  Sparkles,
  Trophy,
} from "lucide-react";
import { usePrefs } from "@/lib/preferences";
import { useProfile, useStats, useTasks, useUser } from "@/hooks/use-nexora";
import { GrowthMapExperience } from "@/components/growth/GrowthMapExperience";
import { GlossyBadgesDisplay, type StudentBadge } from "@/components/growth/GlossyBadgesDisplay";
import { TasksWidget } from "@/components/dashboard/TasksWidget";
import { DailyDuaWidget } from "@/components/dashboard/DailyDuaWidget";
import { SadaqahJariyahWidget } from "@/components/dashboard/SadaqahJariyahWidget";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/config/brand";
import { formatNumber } from "@/lib/locale-format";

export function AlternativeHomeDashboard() {
  const { t, lang } = usePrefs();
  const isAr = lang === "ar";
  const { data: user } = useUser();
  const { data: profile } = useProfile();
  const { data: stats } = useStats();
  const { data: tasks = [] } = useTasks();
  const [mapExpanded, setMapExpanded] = useState(false);

  const name =
    profile?.display_name ||
    user?.displayName ||
    (user?.isAnonymous ? t("dash.guestName") : t("dash.studentName"));

  const level = stats?.level ?? 1;
  const xp = stats?.xp ?? 0;
  const streak = stats?.current_streak ?? 0;
  const completedCount = tasks.filter((tk) => tk.status === "done").length;
  const openTasks = tasks.filter((tk) => tk.status !== "done");
  const nextLevelXp = level * 150;
  const progressPct = Math.min(100, Math.round(((xp % 150) / 150) * 100));

  const atlasModules = [
    {
      index: "01",
      to: "/app/study" as const,
      search: { tab: "unit3_vocab" },
      icon: BookOpen,
      title: isAr ? "مختبر الدراسة والوحدة ٣" : "Study & Unit 3 Lab",
      meta: isAr ? "٢٤ مفردة · بطاقات استرجاع" : "24 terms · active recall",
      desc: isAr
        ? "ابدأ مراجعة مفردات الصف التاسع، الملاحظات، واختبارات الاستعداد."
        : "Master Grade 9 Unit 3 vocabulary, structured notes, and mistake reviews.",
    },
    {
      index: "02",
      to: "/app/english" as const,
      icon: Languages,
      title: isAr ? "عالم الإنجليزية" : "English World",
      meta: isAr ? "Pre-A1 إلى C2 · 6 أكاديميات" : "Pre-A1 to C2 · 6 Academies",
      desc: isAr
        ? "استماع وتحدث وكتابة وقواعد وفق الإطار الأوروبي."
        : "CEFR proficiency studios covering reading, listening, speaking, and writing.",
    },
    {
      index: "03",
      to: "/app/ai" as const,
      icon: Sparkles,
      title: isAr ? "المعلم الذكي BTC" : "BTC AI Mentor",
      meta: isAr ? "شرح سقراطي · ثنائي اللغة" : "Socratic guidance · EN / AR",
      desc: isAr
        ? "تحليل المسائل، تلخيص المفاهيم، وتدريب الأسئلة بأسلوب موثوق."
        : "Step-by-step concept breakdowns and guided Socratic exam readiness.",
    },
    {
      index: "04",
      to: "/app/quran" as const,
      icon: BookOpenCheck,
      title: isAr ? "ملاذ القرآن الكريم" : "Quran Sanctuary",
      meta: isAr ? "المصحف العثماني · تلاوات" : "Uthmani script · verified reciters",
      desc: isAr
        ? "قراءة خاشعة واستماع هادئ للسور مع حفظ مواضع القراءة."
        : "Distraction-free Uthmani reading and curated recitation tracks.",
    },
    {
      index: "05",
      to: "/app/skills" as const,
      icon: Compass,
      title: isAr ? "أكاديمية المهارات" : "Skills Academy",
      meta: isAr ? "٨ مهارات أساسية · تطبيقات" : "8 Core Skills · Practical Drills",
      desc: isAr
        ? "طوّر مهارات التواصل، التفكير الناقد، حل المشكلات، والسلامة الرقمية."
        : "Master communication, critical thinking, digital literacy, and real-world problem solving.",
    },
    {
      index: "06",
      to: "/app/tasks" as const,
      icon: CheckSquare,
      title: isAr ? "المهام ومؤقت التركيز" : "Tasks & Focus Blocks",
      meta: isAr
        ? `${formatNumber(openTasks.length, lang)} مهام مفتوحة`
        : `${formatNumber(openTasks.length, lang)} open tasks`,
      desc: isAr
        ? "تنظيم الجدول الدراسي بجلسات بومودورو هادئة."
        : "Timebox study deliverables alongside calm Pomodoro intervals.",
    },
  ];

  const badges: StudentBadge[] = [
    {
      id: "b1",
      titleEn: "Unit 3 Master",
      titleAr: "خبير الوحدة الثالثة",
      descEn: "Completed Grade 9 Unit 3 vocabulary and practice test",
      descAr: "أتممت مفردات الوحدة الثالثة للصف التاسع واختبار التدريب",
      icon: "book",
      earned: true,
    },
    {
      id: "b2",
      titleEn: "7-Day Streak",
      titleAr: "مثابرة 7 أيام متتالية",
      descEn: "Logged in and studied for 7 consecutive days",
      descAr: "سجلت الدخول ودرست لمدة 7 أيام متتالية",
      icon: "flame",
      earned: streak >= 7,
      progressTextEn: `${streak}/7 days`,
      progressTextAr: `${streak}/7 أيام`,
    },
    {
      id: "b3",
      titleEn: "XP Pioneer",
      titleAr: "رائد نقاط الخبرة",
      descEn: "Reached Level 2 and earned 150+ XP",
      descAr: "وصلت للمستوى الثاني وحصلت على أكثر من 150 نقطة",
      icon: "star",
      earned: level >= 2 || xp >= 150,
      progressTextEn: `${xp}/150 XP`,
      progressTextAr: `${xp}/150 نقطة`,
    },
    {
      id: "b4",
      titleEn: "Focus Champion",
      titleAr: "بطل التركيز",
      descEn: "Completed 5 calm focus timer study blocks",
      descAr: "أتممت 5 جلسات تركيز هادئة",
      icon: "target",
      earned: completedCount >= 3,
      progressTextEn: `${completedCount}/5 tasks`,
      progressTextAr: `${completedCount}/5 مهام`,
    },
  ];

  return (
    <div data-testid="btc-alternative-home" className="space-y-10 pb-12">
      {/* Editorial Asymmetric Hero Masthead */}
      <section className="border-b border-border/80 pb-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
          <div className="flex flex-col justify-between space-y-4 lg:col-span-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="font-semibold text-primary">
                  {isAr ? BRAND.competitionBadgeAr : BRAND.competitionBadge}
                </span>
                <span aria-hidden="true">·</span>
                <span>{isAr ? "استوديو الطالب المتكامل" : "Atelier Indigo Student Workspace"}</span>
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12] [text-wrap:balance]">
                {isAr ? `أهلاً بعودتك، ${name}` : `Study with clarity, ${name}.`}
              </h1>

              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {isAr
                  ? "ركز على وحدة اليوم الدراسية، راجع تقدمك الأسبوعي، وانتقل بسلاسة بين مساحات الدراسة والذكاء الاصطناعي والقرآن وأكاديمية المهارات."
                  : "Follow your current academic milestone, review live XP velocity, and move cleanly between study drills, AI mentorship, Quran sanctuary, and core skills."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                asChild
                size="lg"
                className="min-h-[46px] gap-2 px-6 font-semibold shadow-glow"
              >
                <Link to="/app/study" search={{ tab: "unit3_vocab" }}>
                  <BookOpen className="size-4" />
                  <span>{isAr ? "متابعة الوحدة ٣ (الصف ٩)" : "Launch Grade 9 Unit 3"}</span>
                  <ArrowRight className="size-4 rtl-flip" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-h-[46px] gap-2 px-5">
                <Link to="/app/ai">
                  <Sparkles className="size-4 text-primary" />
                  <span>{isAr ? "مساعد BTC الذكي" : "Ask BTC AI"}</span>
                </Link>
              </Button>
              <FeatureGuideTrigger featureId="dashboard-overview" />
            </div>
          </div>

          {/* Right Mastery Progress Readout */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 lg:col-span-4">
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-primary">
                  {isAr ? "تقدم المستوى" : "Mastery Trajectory"}
                </span>
                <span className="font-mono tabular-nums">{formatNumber(progressPct, lang)}%</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold text-foreground tabular-nums">
                    {isAr
                      ? `المستوى ${formatNumber(level, lang)}`
                      : `Level ${formatNumber(level, lang)}`}
                  </span>
                </div>
                <span className="font-mono text-xs font-semibold text-xp tabular-nums">
                  {formatNumber(xp, lang)} / {formatNumber(nextLevelXp, lang)} XP
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(5, progressPct)}%`,
                    background: "var(--gradient-xp)",
                  }}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Flame className="size-3.5 text-xp" />
                <strong className="font-mono text-foreground tabular-nums">
                  {formatNumber(streak, lang)}
                </strong>{" "}
                {isAr ? "أيام متتالية" : "day streak"}
              </span>
              <Link
                to="/app/level-up"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                <span>{isAr ? "خريطة النمو" : "Growth Map"}</span>
                <ArrowRight className="size-3 rtl-flip" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Unboxed Editorial Telemetry Strip */}
      <section aria-label={isAr ? "مؤشرات الأداء" : "Key Metrics"}>
        <div className="grid grid-cols-2 divide-y divide-border/60 border-b border-border/80 pb-6 sm:grid-cols-4 sm:divide-x sm:divide-y-0 rtl:sm:divide-x-reverse">
          <div className="py-2 sm:pe-6">
            <p className="text-[11px] font-medium text-muted-foreground">
              {isAr ? "نقاط التقدم المكتسبة" : "Verified Experience"}
            </p>
            <p className="mt-1 flex items-center gap-2 font-display text-2xl font-bold text-foreground tabular-nums">
              <Sparkles className="size-4 text-xp" />
              <span>{formatNumber(xp, lang)} XP</span>
            </p>
          </div>
          <div className="py-2 sm:px-6">
            <p className="text-[11px] font-medium text-muted-foreground">
              {isAr ? "رتبة الطالب" : "Academic Standing"}
            </p>
            <p className="mt-1 flex items-center gap-2 font-display text-2xl font-bold text-foreground tabular-nums">
              <Trophy className="size-4 text-primary" />
              <span>
                {isAr ? `م ${formatNumber(level, lang)}` : `Tier ${formatNumber(level, lang)}`}
              </span>
            </p>
          </div>
          <div className="py-2 sm:px-6">
            <p className="text-[11px] font-medium text-muted-foreground">
              {isAr ? "المهام المنجزة" : "Completed Tasks"}
            </p>
            <p className="mt-1 flex items-center gap-2 font-display text-2xl font-bold text-success tabular-nums">
              <CheckCircle2 className="size-4" />
              <span>{formatNumber(completedCount, lang)}</span>
            </p>
          </div>
          <div className="py-2 sm:ps-6">
            <p className="text-[11px] font-medium text-muted-foreground">
              {isAr ? "المتبقي اليوم" : "Active Queue"}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground tabular-nums">
              {formatNumber(openTasks.length, lang)} {isAr ? "مهام" : "open"}
            </p>
          </div>
        </div>
      </section>

      {/* Paired Reflection Row: Daily Dua & Sadaqah Jariyah */}
      <section
        aria-label={isAr ? "الدعاء والصدقة الجارية" : "Daily Dua & Sadaqah Jariyah"}
        className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch"
      >
        <div className="lg:col-span-6">
          <DailyDuaWidget lang={lang} className="h-full" />
        </div>
        <div className="lg:col-span-6">
          <SadaqahJariyahWidget lang={lang} className="h-full" />
        </div>
      </section>

      {/* Curated Workspace Atlas Grid */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold text-primary">
              {isAr ? "مساحات التعلم" : "Academic Atlas"}
            </p>
            <h2 className="font-display text-xl font-bold text-foreground">
              {isAr ? "انتقل مباشرة إلى مساحتك" : "Focused Learning Studios"}
            </h2>
          </div>
          <Link
            to="/app/support"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
          >
            <LifeBuoy className="size-3.5" />
            <span>{isAr ? "الدعم والمساعدة السريعة" : "Need support or help?"}</span>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {atlasModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.to}
                to={mod.to}
                {...(mod.search ? { search: mod.search as never } : {})}
                className="group flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-surface p-5 transition-all hover:border-primary/60 hover:bg-surface-2/60"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-primary tabular-nums">
                      {mod.index}
                    </span>
                    <Icon className="size-4.5 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <h3 className="mt-3 font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {mod.title}
                  </h3>
                  <p className="mt-1 text-[11px] font-medium text-muted-foreground">{mod.meta}</p>
                  <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{mod.desc}</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs font-semibold text-foreground/80 group-hover:text-primary">
                  <span>{isAr ? "فتح المساحة" : "Open studio"}</span>
                  <ArrowRight className="size-3.5 rtl-flip transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Split Lower Deck: Active Tasks + Interactive Growth Map */}
      <section className="grid gap-6 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-5">
          <div className="h-full rounded-2xl border border-border bg-surface p-5">
            <TasksWidget />
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-5 space-y-5">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div>
                  <h2 className="font-display text-base font-bold text-foreground">
                    {isAr ? "الأوسمة ومعالم الإنجاز" : "Milestone Badges & Growth"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isAr
                      ? "توثيق تقدمك الفعلي عبر الدراسة والاستمرارية"
                      : "Earned recognition across lessons, streaks, and focus blocks"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMapExpanded((v) => !v)}
                  className="gap-1.5 text-xs"
                >
                  <MapIcon className="size-3.5 text-primary" />
                  <span>
                    {mapExpanded
                      ? isAr
                        ? "إخفاء الخريطة"
                        : "Hide Detailed Map"
                      : isAr
                        ? "استعراض الخريطة الكاملة"
                        : "Expand Full Map"}
                  </span>
                </Button>
              </div>

              <GlossyBadgesDisplay badges={badges} />
            </div>

            {mapExpanded && (
              <div className="border-t border-border/60 pt-4">
                <GrowthMapExperience />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
