import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  CheckSquare,
  Flame,
  Languages,
  LifeBuoy,
  Map as MapIcon,
  Sparkles,
  Trophy,
} from "lucide-react";
import { usePrefs } from "@/lib/preferences";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { GlossyBadgesDisplay, type StudentBadge } from "@/components/growth/GlossyBadgesDisplay";
import { TasksWidget } from "@/components/dashboard/TasksWidget";
import { GrowthMapExperience } from "@/components/growth/GrowthMapExperience";
import { useProfile, useStats, useTasks, useUser } from "@/hooks/use-nexora";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/config/brand";
import { AlternativeHomeDashboard } from "@/components/dashboard/AlternativeHomeDashboard";

export const Route = createFileRoute("/_authenticated/app/")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => {
    return typeof search["tab"] === "string" ? { tab: search["tab"] } : {};
  },
  head: () => ({
    meta: [
      { title: `Home — ${BRAND.name} Student Pilot` },
      {
        name: "description",
        content: "Student dashboard, Grade 9 Unit 3 quick launch, and live Growth Map.",
      },
    ],
  }),
  component: StudentHomePage,
});

function StudentHomePage() {
  const { t, lang, effectiveBtcVisualTheme } = usePrefs();
  if (effectiveBtcVisualTheme === "btc_alternative") {
    return <AlternativeHomeDashboard />;
  }
  return <OriginalStudentHomePage t={t} lang={lang} />;
}

function OriginalStudentHomePage({
  t,
  lang,
}: {
  t: ReturnType<typeof usePrefs>["t"];
  lang: ReturnType<typeof usePrefs>["lang"];
}) {
  const isAr = lang === "ar";
  const { data: user } = useUser();
  const { data: profile } = useProfile();
  const { data: stats } = useStats();
  const { data: tasks = [] } = useTasks();
  const [showFullGrowthMap, setShowFullGrowthMap] = useState(false);

  const name =
    profile?.display_name ||
    user?.displayName ||
    (user?.isAnonymous ? t("dash.guestName") : t("dash.studentName"));

  const level = stats?.level ?? 1;
  const xp = stats?.xp ?? 0;
  const streak = stats?.current_streak ?? 0;
  const completedCount = tasks.filter((tk) => tk.status === "done").length;
  const openCount = tasks.filter((tk) => tk.status !== "done").length;
  const nextLevelXp = level * 150;
  const progressPct = Math.min(100, Math.round(((xp % 150) / 150) * 100));

  const quickLaunchCards = [
    {
      to: "/app/study" as const,
      search: { tab: "unit3_vocab" },
      icon: BookOpen,
      titleEn: "Study & Grade 9 Unit 3",
      titleAr: "الدراسة والوحدة الثالثة",
      descEn: "24 Unit 3 words, flashcards, notes & practice quiz",
      descAr: "24 كلمة أساسية، بطاقات، ملاحظات واختبار قصير",
      tone: "text-blue-500 bg-blue-500/10",
    },
    {
      to: "/app/english" as const,
      icon: Languages,
      titleEn: "English World",
      titleAr: "عالم الإنجليزية",
      descEn: "Guided lessons, listening & skill academies",
      descAr: "دروس تفاعلية وتدريب مهارات اللغة الإنجليزية",
      tone: "text-emerald-500 bg-emerald-500/10",
    },
    {
      to: "/app/ai" as const,
      icon: Sparkles,
      titleEn: "BTC AI Tutor",
      titleAr: "مساعد BTC الذكي",
      descEn: "Ask study questions in English or Arabic",
      descAr: "اسأل عن أي مفهوم دراسي بالعربية أو الإنجليزية",
      tone: "text-purple-500 bg-purple-500/10",
    },
    {
      to: "/app/quran" as const,
      icon: BookOpenCheck,
      titleEn: "Quran",
      titleAr: "القرآن الكريم",
      descEn: "Listen to verified reciters & read the Uthmani Mushaf",
      descAr: "استماع لقراء معتمدين وقراءة المصحف العثماني",
      tone: "text-teal-500 bg-teal-500/10",
    },
    {
      to: "/app/tasks" as const,
      icon: CheckSquare,
      titleEn: "Tasks & Focus",
      titleAr: "المهام ومؤقت التركيز",
      descEn: `${openCount} open tasks · calm focus timer`,
      descAr: `${openCount} مهام متبقية · مؤقت تركيز هادئ`,
      tone: "text-amber-500 bg-amber-500/10",
    },
    {
      to: "/app/support" as const,
      icon: LifeBuoy,
      titleEn: "Support & Help",
      titleAr: "الدعم والمساعدة",
      descEn: "Report an issue or read quick student guides",
      descAr: "أرسل طلب دعم أو تصفح أدلة المساعدة",
      tone: "text-sky-500 bg-sky-500/10",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Focused Hero Card with 1 Primary CTA */}
      <section className="surface-card relative overflow-hidden p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <span className="inline-block text-xs font-semibold text-primary">
              {isAr ? BRAND.competitionBadgeAr : BRAND.competitionBadge}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {isAr ? `مرحبًا، ${name}` : `Welcome, ${name}`}
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              {isAr
                ? "ابدأ اليوم بمفردات الوحدة الثالثة للصف التاسع أو اختر أي مساحة أدناه."
                : "Start with Grade 9 Unit 3 vocabulary today, or pick any core workspace below."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <FeatureGuideTrigger featureId="dashboard-overview" />
            <Button
              asChild
              size="lg"
              variant="glow"
              className="min-h-[48px] w-full sm:w-auto gap-2 px-6"
            >
              <Link to="/app/study" search={{ tab: "unit3_vocab" }}>
                <BookOpen className="size-4" />
                <span>{isAr ? "افتح الوحدة 3 للصف التاسع" : "Open Grade 9 Unit 3"}</span>
                <ArrowRight className="size-4 rtl-flip" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Growth Map Lite */}
      <section
        data-testid="growth-map-lite"
        aria-label={isAr ? "ملخص التقدم" : "Growth Map Lite"}
        className="surface-card p-5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapIcon className="size-4.5" />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                {isAr ? "خريطة النمو المبسطة" : "Growth Map Lite"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "تقدّمك الشخصي عبر الدراسة والمهام اليومية"
                  : "Your live study progress across lessons and daily tasks"}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFullGrowthMap((v) => !v)}
            className="min-h-[40px] gap-1.5 text-xs"
          >
            <MapIcon className="size-3.5 text-primary" />
            <span>
              {showFullGrowthMap
                ? isAr
                  ? "إخفاء الخريطة التفصيلية"
                  : "Hide Detailed Map"
                : isAr
                  ? "عرض الخريطة التفصيلية"
                  : "View Full Map"}
            </span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <div className="text-[11px] text-muted-foreground">{isAr ? "المستوى" : "Level"}</div>
            <div className="mt-0.5 flex items-center gap-1.5 font-display text-xl font-bold text-foreground">
              <Trophy className="size-4 text-primary" />
              <span>{level}</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <div className="text-[11px] text-muted-foreground">
              {isAr ? "نقاط التقدم" : "Total XP"}
            </div>
            <div className="mt-0.5 font-display text-xl font-bold text-primary tabular-nums">
              {xp}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <div className="text-[11px] text-muted-foreground">
              {isAr ? "الاستمرارية" : "Streak"}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 font-display text-xl font-bold text-foreground">
              <Flame className="size-4 text-amber-500" />
              <span>
                {streak} {isAr ? "أيام" : "d"}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <div className="text-[11px] text-muted-foreground">
              {isAr ? "المهام المنجزة" : "Tasks Done"}
            </div>
            <div className="mt-0.5 font-display text-xl font-bold text-emerald-500 tabular-nums">
              {completedCount}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {isAr ? `التقدم نحو المستوى ${level + 1}` : `Progress to Level ${level + 1}`}
            </span>
            <span className="font-mono tabular-nums">
              {xp} / {nextLevelXp} XP
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.max(4, progressPct)}%` }}
            />
          </div>
        </div>

        {showFullGrowthMap && (
          <div className="border-t border-border/70 pt-4">
            <GrowthMapExperience />
          </div>
        )}
      </section>

      {/* Glossy Milestone Badges Showcase */}
      <section className="surface-card p-5">
        {(() => {
          const sampleBadges: StudentBadge[] = [
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
          return <GlossyBadgesDisplay badges={sampleBadges} />;
        })()}
      </section>

      {/* Clean Quick Launch Grid */}
      <section className="space-y-3">
        <h2 className="font-display text-base font-bold text-foreground">
          {isAr ? "مساحات العمل الأساسية" : "Core Student Workspaces"}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLaunchCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.to}
                to={card.to}
                {...("search" in card && card.search ? { search: card.search } : {})}
                className="surface-card group flex min-h-[76px] items-center gap-3.5 p-4 transition-colors hover:border-primary/45 hover:bg-surface-2/50"
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${card.tone}`}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {isAr ? card.titleAr : card.titleEn}
                  </div>
                  <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {isAr ? card.descAr : card.descEn}
                  </div>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground rtl-flip group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick Active Tasks Preview Widget */}
      <TasksWidget />
    </div>
  );
}
