import { createFileRoute, Link } from "@tanstack/react-router";
import { AppFooter } from "@/components/app/AppFooter";
import { Logo } from "@/components/app/Logo";
import { Button } from "@/components/ui/button";
import {
  Compass,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Zap,
  Heart,
  Users,
  Target,
  BookOpen,
  Code2,
} from "lucide-react";

import { BRAND } from "@/config/brand";
import { SadaqahJariyahAndDuaaModal } from "@/components/islamic/SadaqahJariyahAndDuaaModal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About ${BRAND.name} — ${BRAND.fullName}` },
      {
        name: "description",
        content: BRAND.mission,
      },
      { property: "og:title", content: `About ${BRAND.name} — ${BRAND.fullName}` },
      {
        property: "og:description",
        content: BRAND.subtagline,
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-background bg-hero">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/80 bg-surface/90 px-4 backdrop-blur-md md:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-xs h-8">
            <Link to="/help">Help Center</Link>
          </Button>
          <Button asChild size="sm" className="text-xs h-8">
            <Link to="/auth">Enter Workspace</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-10 md:py-16 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>Human Impact &amp; Learning Science</span>
          </div>
          <h1 className="text-balance text-3xl md:text-5xl font-black font-display tracking-tight text-foreground">
            A Platform Built for Student Momentum
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {BRAND.name} was born from a fundamental observation: students don&apos;t need another
            generic to-do list. They need a calm, structured environment that connects daily study
            sessions with their long-term growth and future horizons.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="surface-card p-6 space-y-3">
            <div className="size-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <Compass className="size-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Unified Growth Map</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every completed task, focus sprint, and journal entry feeds into your personal Growth
              Map, visualizing tangible progress across academic knowledge, discipline, and
              curiosity.
            </p>
          </div>

          <div className="surface-card p-6 space-y-3">
            <div className="size-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Zero-Trust Privacy</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Student privacy is non-negotiable. Personal notes, grades, and reflections are
              strictly protected with attribute-based security rules. We never sell or train public
              models on your private data.
            </p>
          </div>

          <div className="surface-card p-6 space-y-3">
            <div className="size-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <GraduationCap className="size-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Ethical AI Mentorship</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {BRAND.name} AI operates as a Socratic study coach. It asks clarifying questions and
              guides students through principles rather than simply doing homework for them.
            </p>
          </div>
        </div>

        {/* Narrative & Philosophy */}
        <div className="surface-card p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-display text-foreground">
              Our Educational Philosophy
            </h2>
            <p className="text-xs text-muted-foreground">
              Four foundational principles guiding every feature we create:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-1.5">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <Target className="size-4 text-primary" />
                1. Focus Over Fatigue
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Rather than encouraging all-night cramming, {BRAND.name} structures revision into
                25-minute Pomodoro sprints and spaced repetition intervals, proven by cognitive
                science to maximize retention.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-1.5">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <Heart className="size-4 text-rose-600 dark:text-rose-400" />
                2. Wellbeing is Essential
              </div>
              <p className="text-muted-foreground leading-relaxed">
                High achievement without mental health leads to burnout. {BRAND.name}&apos;s private
                Care module gives students space to log stress, monitor sleep, and take calm
                breathers between study blocks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-1.5">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <Users className="size-4 text-blue-600 dark:text-blue-400" />
                3. Safe, Moderated Circles
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Knowledge Circles provide peer study without the toxic algorithms of social media.
                No follower counts, no advertisements—just focused students collaborating on shared
                subjects.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-1.5">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <Zap className="size-4 text-amber-600 dark:text-amber-400" />
                4. Session Persistence &amp; Reliability
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {BRAND.name} uses encrypted persistent browser sessions so you stay signed in across
                device reboots and tab refreshes without interrupting your study momentum.
              </p>
            </div>
          </div>
        </div>

        {/* Ethical Sustainability & Knowledge Preservation Commitment */}
        <div className="surface-card p-6 md:p-8 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-sm font-bold font-display text-foreground">
            <BookOpen className="size-4 text-primary" />
            <span>Ethical Sustainability &amp; Continuous Educational Access</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {BRAND.name} keeps core learning tools, foundational literacy tracks, and open resource
            libraries free for learners without advertising clutter, exploitative minor
            monetization, or dark-pattern streaks. Educational materials carry transparent
            author/source metadata, error-correction logs, and qualified human review notices for
            religious and health literacy topics.
          </p>
        </div>

        {/* Platform Creator & Lead Developer Attribution */}
        <section
          aria-label="Platform Creator"
          data-testid="about-creator-credit"
          className="surface-card p-6 md:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
        >
          <div className="flex items-start gap-4">
            <div className="size-11 shrink-0 rounded-xl bg-primary/12 border border-primary/25 text-primary flex items-center justify-center">
              <Code2 className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-semibold tracking-wide text-primary">
                Platform Creator &amp; Architecture
              </div>
              <h2 className="text-base md:text-lg font-bold font-display text-foreground">
                Youssef Wael — Lead Developer &amp; Creator
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                Designed, architected, and built by{" "}
                <span className="font-semibold text-foreground">Youssef Wael</span> as the Lead
                Developer and Creator of this platform—uniting calm study focus, ethical AI
                guidance, and student growth tools into a single experience.
              </p>
            </div>
          </div>
          <div className="shrink-0 sm:text-end border-t sm:border-t-0 sm:border-s border-border/70 pt-3 sm:pt-0 sm:ps-5">
            <div className="text-xs font-semibold text-foreground">{BRAND.name} Studio</div>
            <div className="text-[11px] text-muted-foreground tabular-nums">© 2026</div>
          </div>
        </section>

        {/* Sincere Dedication & Duaa in the Unseen Section (صدقة جارية ودعاء بظهر الغيب) */}
        <section
          aria-label="Sadaqah Jariyah & Sincere Duaa"
          data-testid="about-sadaqah-duaa-section"
          className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-surface-card to-background p-6 md:p-8 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30">
                <Sparkles className="size-3.5" />
                <span>صدقة جارية · علم يُنتفع به · خالص لوجه الله تعالى</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold font-display text-foreground">
                هدية هذا العمل: دعوة صالحة بظهر الغيب لمن قام عليه ووالديه
              </h3>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                بُنيت هذه المنصة بنية العلم النافع والصدقة الجارية تقرباً إلى الله تعالى ورجاء مغفرته
                ورضوانه. نسأل الله أن يبارك لكل متعلم ومعلم، وندعوكم لأعظم هدية تقدمونها لأخيكم
                المطور (يوسف وائل) ووالديه: دعوة صادقة بظهر الغيب، لتنالوا مثل ما دعوتم وأكثر.
              </p>
            </div>

            <div className="shrink-0">
              <SadaqahJariyahAndDuaaModal
                trigger={
                  <Button
                    size="lg"
                    data-testid="about-duaa-open-btn"
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm px-6 shadow-md"
                  >
                    <Heart className="size-4 fill-rose-300 text-rose-300 me-2" />
                    <span>ادعُ للمطوّر بظهر الغيب 🤲</span>
                  </Button>
                }
              />
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-surface/80 p-4 text-xs text-muted-foreground space-y-1.5">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <Heart className="size-3.5 text-emerald-600 fill-emerald-600/30" />
              <span>حديث شريف في فضل الدعاء بظهر الغيب:</span>
            </div>
            <p className="font-serif leading-relaxed text-foreground/90">
              «دَعْوَةُ المَرْءِ المُسْلِمِ لأَخِيهِ بِظَهْرِ الغَيْبِ مُسْتَجَابَةٌ، عِنْدَ رَأْسِهِ مَلَكٌ مُوَكَّلٌ كُلَّمَا دَعَا لأَخِيهِ بِخَيْرٍ،
              قَالَ المَلَكُ المُوَكَّلُ بِهِ:{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">آمِينَ، وَلَكَ بِمِثْلٍ</strong>»
              [رواه مسلم].
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center space-y-3 pt-4">
          <h3 className="text-xl font-bold font-display text-foreground">
            Begin Your Learning Journey
          </h3>
          <p className="text-xs text-muted-foreground">
            Start organizing your studies, building daily momentum, and exploring guided tools.
          </p>
          <Button asChild size="lg" className="px-8">
            <Link to="/auth">Get Started Free</Link>
          </Button>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
