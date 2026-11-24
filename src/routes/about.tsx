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
} from "lucide-react";

import { BRAND } from "@/config/brand";

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
