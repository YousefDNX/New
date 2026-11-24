import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Map,
  Sparkles,
  BookOpen,
  BookOpenCheck,
  CheckSquare,
  Users,
  Trophy,
  Accessibility,
  Languages,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { Logo } from "@/components/app/Logo";
import type { DictKey } from "@/lib/i18n-dict";
import { usePrefs } from "@/lib/preferences";
import { AppFooter } from "@/components/app/AppFooter";
import {
  isUserEligibleForApp,
  subscribeToAuthState,
  userRequiresEmailVerification,
  waitForAuthReady,
} from "@/lib/firebase-auth";

import btcHeroShowcaseUrl from "@/assets/images/btc_flagship_hero_1794845536894.jpg";
import { BRAND, isBtcMode } from "@/config/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BRAND.name} — ${BRAND.fullName} | Student Innovation Platform` },
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

const CORE_WORKSPACES: Array<{
  icon: typeof Sparkles;
  nameKey: DictKey;
  descKey: DictKey;
  to: "/app/ai" | "/app/study" | "/app/tasks" | "/app/quran" | "/app/circle";
}> = [
  { icon: Sparkles, nameKey: "mod.ai.name", descKey: "mod.ai.d", to: "/app/ai" },
  { icon: BookOpen, nameKey: "mod.study.name", descKey: "mod.study.d", to: "/app/study" },
  { icon: CheckSquare, nameKey: "nav.tasks", descKey: "mod.tasks.d", to: "/app/tasks" },
  { icon: Users, nameKey: "mod.circle.name", descKey: "mod.circle.d", to: "/app/circle" },
  { icon: BookOpenCheck, nameKey: "nav.quran", descKey: "mod.quran.hub", to: "/app/quran" },
];

const EXTRA_BREADTH: Array<{ icon: typeof Users; nameKey: DictKey }> = [
  { icon: Accessibility, nameKey: "mod.access.name" },
  { icon: Languages, nameKey: "mod.global.name" },
  { icon: Users, nameKey: "mod.circle.name" },
];

function Landing() {
  const { t, lang } = usePrefs();
  const [heroImgError, setHeroImgError] = useState(false);
  const btc = isBtcMode();
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
            <LanguageSwitcher compact />
            <Button asChild size="sm" className="whitespace-nowrap shrink-0">
              <Link to="/app">
                <span>{isAr ? "دخول كضيف" : "Enter as Guest"}</span>
                <ArrowRight className="size-3.5 rtl-flip" />
              </Link>
            </Button>
          </div>
        </div>
        <nav
          aria-label={t("landing.nav.about")}
          className="mx-auto flex max-w-6xl items-center gap-4 overflow-x-auto no-scrollbar border-t border-border/60 px-5 py-2 text-xs font-medium text-muted-foreground md:hidden"
        >
          <Link to="/about" className="whitespace-nowrap py-1 hover:text-foreground">
            {t("landing.nav.about")}
          </Link>
          <Link to="/help" className="whitespace-nowrap py-1 hover:text-foreground">
            {t("landing.nav.helpCenter")}
          </Link>
          <Link to="/safety" className="whitespace-nowrap py-1 hover:text-foreground">
            {t("landing.footer.safety")}
          </Link>
          <Link to="/privacy" className="whitespace-nowrap py-1 hover:text-foreground">
            {t("landing.footer.privacy")}
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-5 pb-14 pt-10 md:pb-20 md:pt-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="flex flex-col justify-center lg:col-span-6">
              <div className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-primary">
                <Map className="size-3.5 shrink-0" />
                <span>
                  {btc
                    ? isAr
                      ? BRAND.competitionBadgeAr
                      : BRAND.competitionBadge
                    : t("landing.badge")}
                </span>
              </div>

              <h1 className="mt-4 max-w-xl text-balance font-display text-4xl font-bold leading-[1.08] tracking-tight text-foreground md:text-5xl xl:text-[3.25rem]">
                {t("landing.hero.title1")}{" "}
                <span className="text-gradient">{t("landing.hero.title2")}</span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                {btc
                  ? isAr
                    ? BRAND.heroSubheadlineAr
                    : BRAND.heroSubheadline
                  : t("landing.hero.desc")}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="whitespace-nowrap">
                  <Link to="/app">
                    <span>{isAr ? "دخول كضيف" : "Enter as Guest"}</span>
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
                  {t("landing.badge.age")}
                </span>
                <span aria-hidden="true">·</span>
                <span>{t("landing.badge.bilingual")}</span>
                <span aria-hidden="true">·</span>
                <span>{isAr ? "الدراسة والمهام" : "Study & Tasks"}</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="surface-card overflow-hidden p-2">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[calc(var(--radius)-2px)] bg-surface-2">
                  {!heroImgError ? (
                    <img
                      src={btcHeroShowcaseUrl}
                      alt={`${BRAND.name} — ${BRAND.fullName} student growth and study workspace`}
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgError(true)}
                      className="h-full w-full object-cover object-center"
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
                    <div className="text-[0.7rem] font-semibold text-white/85 tabular-nums">
                      {t("landing.cta.moduleCount")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Simple 3-Step Student Rhythm */}
        <section className="border-y border-border/70 bg-surface/40 py-12">
          <div className="mx-auto max-w-6xl px-5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-1.5">
                <span className="font-mono text-xs font-semibold text-primary">01</span>
                <h2 className="font-display text-base font-bold text-foreground">
                  {isAr ? "رتّب يومك بوضوح" : "Organize Today Clearly"}
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {isAr
                    ? "اجمع مهامك، أهدافك اليومية، ومؤقت التركيز في شاشة واحدة بسيطة بعيداً عن التشتت."
                    : "Keep today's tasks, daily goals, and a calm focus timer together without distraction."}
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="font-mono text-xs font-semibold text-primary">02</span>
                <h2 className="font-display text-base font-bold text-foreground">
                  {isAr ? "تعلّم مع المرشد الذكي" : "Learn With Guided Support"}
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {isAr
                    ? "شروحات خطوة بخطوة، بطاقات استذكار، القرآن الكريم، والإنجليزية في بيئة آمنة."
                    : "Step-by-step AI study coaching, flashcards, Qur'an study, and language labs in one space."}
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="font-mono text-xs font-semibold text-primary">03</span>
                <h2 className="font-display text-base font-bold text-foreground">
                  {isAr ? "شاهد تطورك الحقيقي" : "See Meaningful Growth"}
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {isAr
                    ? "تابع استمراريتك ونقاط التقدم عبر مجالات حياتك الدراسية والشخصية بمرونة تامة."
                    : "Track consistent study habits, streaks, and balanced growth across every subject."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Curated Core Workspaces */}
        <section className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                {isAr ? "مساحات العمل الأساسية للطالب" : "Core Student Workspaces"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isAr
                  ? "ابدأ بما تحتاجه الآن — وكل الأدوات الإضافية متاحة متى أردت."
                  : "Start with the essentials you use every day — with specialized labs ready whenever you need them."}
              </p>
            </div>
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline whitespace-nowrap"
            >
              <span>{t("landing.nav.about")}</span>
              <ArrowRight className="size-3.5 rtl-flip" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_WORKSPACES.map((m) => (
              <Link
                key={m.nameKey}
                to={m.to}
                className="surface-card group flex flex-col justify-between p-5 transition-colors hover:border-primary/40"
              >
                <div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <m.icon className="size-5" />
                  </div>
                  <div className="mt-4 font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {t(m.nameKey)}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {t(m.descKey)}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary opacity-85 group-hover:opacity-100">
                  <span>{isAr ? "استكشاف" : "Explore"}</span>
                  <ArrowRight className="size-3.5 rtl-flip transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/80 bg-surface-2/40 px-5 py-4 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {EXTRA_BREADTH.map((item) => (
                <span key={item.nameKey} className="inline-flex items-center gap-1.5 font-medium">
                  <item.icon className="size-3.5 text-primary" />
                  <span>{t(item.nameKey)}</span>
                </span>
              ))}
            </div>
            <Link
              to="/app"
              className="font-semibold text-primary hover:underline whitespace-nowrap"
            >
              {isAr ? "دخول كضيف ومتابعة" : "Open App & Continue"}
            </Link>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
