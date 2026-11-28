import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Accessibility,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Briefcase,
  CheckSquare,
  Compass,
  Globe,
  Heart,
  Languages,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { AccessibilityQuickDialog } from "@/components/common/AccessibilityQuickDialog";
import { Logo } from "@/components/app/Logo";
import { usePrefs } from "@/lib/preferences";
import { AppFooter } from "@/components/app/AppFooter";
import { DailyDuaWidget } from "@/components/dashboard/DailyDuaWidget";
import { SadaqahJariyahWidget } from "@/components/dashboard/SadaqahJariyahWidget";
import btcHeroShowcaseUrl from "@/assets/images/btc_flagship_hero_1794845536894.jpg";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BRAND.name} — ${BRAND.fullName} | Student Learning Platform` },
      {
        name: "description",
        content: BRAND.mission,
      },
      { property: "og:title", content: `${BRAND.name} — ${BRAND.fullName}` },
      {
        property: "og:description",
        content: BRAND.heroSubheadline,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const CORE_WORKSPACES = [
  {
    icon: BookOpen,
    to: "/app/study" as const,
    enTitle: "Study & Academics",
    arTitle: "الدراسة والأكاديميات",
    enDesc: "Grade 9 vocabulary flashcards (Units 1–4), summaries, quizzes, and revision.",
    arDesc: "بطاقات مفردات الصف التاسع (الوحدات 1–4)، ملخصات، واختبارات قصيرة.",
  },
  {
    icon: Compass,
    to: "/app/skills" as const,
    enTitle: "Skills Academy",
    arTitle: "أكاديمية المهارات",
    enDesc: "Communication, critical thinking, problem solving, digital & life skills.",
    arDesc: "التواصل، التفكير الناقد، حل المشكلات، والمهارات الرقمية والحياتية.",
  },
  {
    icon: CheckSquare,
    to: "/app/tasks" as const,
    enTitle: "Productivity & Focus",
    arTitle: "الإنتاجية والتركيز",
    enDesc: "Tasks, personal goals, focus timer sessions, and a simple time organizer.",
    arDesc: "المهام، الأهداف، جلسات مؤقت التركيز، ومنظّم الوقت البسيط.",
  },
  {
    icon: Heart,
    to: "/app/care" as const,
    enTitle: "Personal Growth",
    arTitle: "النمو الشخصي",
    enDesc: "Healthy habits, self-reflection journal, mood check-in, and calm routines.",
    arDesc: "العادات الصحية، اليوميات الخاصة، متابعة الحالة، والروتين المتوازن.",
  },
  {
    icon: Briefcase,
    to: "/app/future" as const,
    enTitle: "Future & Careers",
    arTitle: "المستقبل والمهن",
    enDesc: "Explore professions, specializations, educational pathways, and career plans.",
    arDesc: "استكشاف المهن، التخصصات، المسارات التعليمية، وخطط المستقبل.",
  },
  {
    icon: Sparkles,
    to: "/app/ai" as const,
    enTitle: "BTC AI Assistant",
    arTitle: "مساعد BTC الذكي",
    enDesc: "Socratic step-by-step tutor, audio transcription, and clear lesson explanations.",
    arDesc: "معلم ذكي سقراطي خطوة بخطوة، تفريغ صوتي، وشرح مبسط وموثق للدروس.",
  },
  {
    icon: Globe,
    to: "/app/opportunities" as const,
    enTitle: "Opportunity Radar",
    arTitle: "رادار الفرص",
    enDesc: "Competitions, workshops, and scholarships with verified source notes.",
    arDesc: "مسابقات وورش ومنح موثقة التواريخ والمصادر الرسمية.",
  },
  {
    icon: Languages,
    to: "/app/english" as const,
    enTitle: "English World",
    arTitle: "عالم الإنجليزية",
    enDesc: "Vocabulary, listening, reading, grammar, speaking, and writing practice.",
    arDesc: "تدريبات تفاعلية في المفردات والاستماع والقراءة والقواعد والتحدث والكتابة.",
  },
  {
    icon: BookOpenCheck,
    to: "/app/quran" as const,
    enTitle: "Islamic Center",
    arTitle: "المركز الإسلامي",
    enDesc: "Clear Arabic Quran text, verified reciters, prayer times, tafsir, and azkar.",
    arDesc: "المصحف الشريف، تلاوات لقراء معتمدين، تفسير، وأذكار.",
  },
];

function Landing() {
  const { t, lang } = usePrefs();
  const [heroImgError, setHeroImgError] = useState(false);
  const isAr = lang === "ar";

  return (
    <div className="flex min-h-dvh flex-col bg-background bg-hero">
      <header className="glass sticky top-0 z-30 border-b border-border/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
          <Logo size="md" />
          <nav
            aria-label={t("landing.nav.about")}
            className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex"
          >
            <Link to="/about" className="hover:text-foreground transition-colors whitespace-nowrap">
              {t("landing.nav.about")}
            </Link>
            <Link to="/help" className="hover:text-foreground transition-colors whitespace-nowrap">
              {t("landing.nav.helpCenter")}
            </Link>
            <Link
              to="/safety"
              className="hover:text-foreground transition-colors whitespace-nowrap"
            >
              {t("landing.footer.safety")}
            </Link>
            <Link
              to="/privacy"
              className="hover:text-foreground transition-colors whitespace-nowrap"
            >
              {t("landing.footer.privacy")}
            </Link>
          </nav>
          <div className="flex items-center gap-2.5 shrink-0">
            <AccessibilityQuickDialog />
            <LanguageSwitcher compact />
            <Button asChild size="sm" className="whitespace-nowrap shrink-0">
              <Link to="/app">
                <span>{isAr ? "المتابعة كضيف" : "Continue as Guest"}</span>
                <ArrowRight className="size-3.5 rtl-flip" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-5 pb-14 pt-10 md:pb-20 md:pt-16">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
            <div className="flex flex-col justify-center lg:col-span-6">
              <div className="inline-flex w-fit items-center gap-2 text-xs font-semibold tracking-wide text-primary">
                <Sparkles className="size-3.5 shrink-0" />
                <span>{isAr ? BRAND.competitionBadgeAr : BRAND.competitionBadge}</span>
              </div>

              <h1 className="mt-4 max-w-xl text-balance font-display text-4xl font-bold leading-[1.08] tracking-tight text-foreground md:text-5xl xl:text-[3.25rem]">
                {isAr ? "تعلّم بوضوح،" : "Simple, accessible learning,"}{" "}
                <span className="text-gradient">
                  {isAr ? "في مكان واحد" : "built for every student"}
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                {isAr
                  ? "منصة BTC للطلاب: الدراسة، المهارات، التركيز، النمو الشخصي، المستقبل، مساعد BTC الذكي، الفرص، الإنجليزية، والقرآن الكريم — بدون تعقيد أو تسجيل حساب."
                  : "BTC brings Study & Academics, Skills, Focus, Personal Growth, Careers, AI Study Mentor, Opportunities, English World, and Quran together — directly as a guest."}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="whitespace-nowrap shadow-sm">
                  <Link to="/app">
                    <span>{isAr ? "المتابعة كضيف" : "Continue as Guest"}</span>
                    <ArrowRight className="size-4 rtl-flip" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="whitespace-nowrap">
                  <Link to="/safety">{t("landing.cta.safety")}</Link>
                </Button>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/70 pt-5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground/90">
                  <ShieldCheck className="size-3.5 text-primary" />
                  {isAr ? "دخول مباشر كضيف دون كلمة مرور" : "Direct Guest Access — No Sign-Up"}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Accessibility className="size-3.5 text-primary" />
                  {isAr ? "دعم كامل للوصول واللغتين" : "Accessible & Bilingual EN / AR"}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center lg:col-span-6">
              <div className="surface-card overflow-hidden p-2">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[calc(var(--radius)-2px)] bg-surface-2">
                  {!heroImgError ? (
                    <img
                      src={btcHeroShowcaseUrl}
                      alt={`${BRAND.name} — ${BRAND.fullName}`}
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgError(true)}
                      className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-[1.015]"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                      <Logo size="lg" />
                      <p className="max-w-xs text-xs text-muted-foreground">
                        {isAr ? BRAND.missionAr : BRAND.mission}
                      </p>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3.5 start-3.5 end-3.5 flex flex-wrap items-end justify-between gap-2 text-white">
                    <div>
                      <div className="text-[0.7rem] font-medium text-white/80">
                        {isAr
                          ? `${BRAND.name} · ${BRAND.taglineAr}`
                          : `${BRAND.name} · ${BRAND.fullName}`}
                      </div>
                      <div className="font-display text-sm font-bold leading-snug">
                        {isAr ? BRAND.heroHeadlineAr : BRAND.tagline}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                {isAr ? "وحدات التعلم والتطوير" : "Student Learning Modules"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isAr
                  ? "كل وحدة بسيطة ومباشرة وجاهزة للاستخدام فوراً."
                  : "Every module is simple, structured, and ready immediately."}
              </p>
            </div>
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline whitespace-nowrap"
            >
              <span>{isAr ? "الدخول كضيف" : "Continue as Guest"}</span>
              <ArrowRight className="size-3.5 rtl-flip" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_WORKSPACES.map((m) => (
              <Link
                key={m.to}
                to={m.to}
                className="surface-card group flex flex-col justify-between p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-surface-2/40"
              >
                <div>
                  <div className="flex size-10 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <m.icon className="size-5" />
                  </div>
                  <div className="mt-4 font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {isAr ? m.arTitle : m.enTitle}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {isAr ? m.arDesc : m.enDesc}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary opacity-90 group-hover:opacity-100">
                  <span>{isAr ? "فتح الوحدة" : "Open Module"}</span>
                  <ArrowRight className="size-3.5 rtl-flip transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Sadaqah Jariyah & Daily Supplication Featured Section */}
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <Sparkles className="size-3.5" />
                <span>
                  {isAr ? "الصدقة الجارية والعمل الصالح" : "Ongoing Charity & Positive Impact"}
                </span>
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
                {isAr ? "أثر مبارك جارٍ لك ولأهلك" : "Continuous Benefit for You & Your Family"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isAr
                  ? "سجّل أعمالك الصالحة، حدد أهداف الاستمرارية، وشارك النية الصادقة عنك وعن والديك وأهلك."
                  : "Track good deeds, establish long-term consistency goals, and dedicate the sincere reward to your family."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col">
              <DailyDuaWidget lang={lang} className="h-full" />
            </div>
            <div className="lg:col-span-6 flex flex-col">
              <SadaqahJariyahWidget lang={lang} className="h-full" />
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
