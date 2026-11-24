import { createFileRoute, Link } from "@tanstack/react-router";
import { AppFooter } from "@/components/app/AppFooter";
import { Logo } from "@/components/app/Logo";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert, Heart, Users, Lock, BookOpen } from "lucide-react";
import { ReportAbuseModal } from "@/components/support/ReportAbuseModal";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/community-guidelines")({
  head: () => ({
    meta: [
      { title: `Community Guidelines — ${BRAND.name}` },
      {
        name: "description",
        content:
          "Our code of conduct for respectful, supportive, and ethical student collaboration.",
      },
      { property: "og:title", content: `Community Guidelines — ${BRAND.name}` },
    ],
  }),
  component: CommunityGuidelinesPage,
});

function CommunityGuidelinesPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-background bg-hero">
      <header className="glass sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border px-4 md:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-xs h-8">
            <Link to="/help">Help Center</Link>
          </Button>
          <Button asChild variant="glow" size="sm" className="text-xs h-8">
            <Link to="/app">Workspace</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-10 md:py-16 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
            <ShieldCheck className="size-3.5" />
            <span>Student Code of Conduct</span>
          </div>
          <h1 className="text-balance text-3xl font-black font-display text-foreground">
            {BRAND.name} Community Guidelines
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            {BRAND.name} is designed as a sanctuary for focused learning, thoughtful reflection, and
            genuine human encouragement. By participating in Knowledge Circles or sharing resources,
            every student agrees to uphold these standards.
          </p>
        </div>

        <div className="space-y-6">
          {/* Rule 1 */}
          <div className="surface-card p-5 space-y-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Heart className="size-4 text-rose-600 dark:text-rose-400" />
              1. Kindness &amp; Mutual Respect
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every student comes from a different academic background and learns at their own pace.
              Bullying, mockery, offensive jokes, slurs, or condescending remarks are strictly
              prohibited. Always offer feedback constructively.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="surface-card p-5 space-y-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              2. Academic Honesty &amp; Ethical AI
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Use {BRAND.name} AI and peer discussions to deepen your understanding, not to
              circumvent academic honor codes. Sharing uncredited exam answers, leaked test keys, or
              commercial paper-writing links is a severe violation.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="surface-card p-5 space-y-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Lock className="size-4 text-emerald-600 dark:text-emerald-400" />
              3. Protection of Minor &amp; Peer Privacy
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Never share phone numbers, physical addresses, personal social media handles, or
              identifying photos of yourself or peers in team discussions. Knowledge Circles operate
              on anonymous display names to guarantee safety.
            </p>
          </div>

          {/* Rule 4 */}
          <div className="surface-card p-5 space-y-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Users className="size-4 text-blue-600 dark:text-blue-400" />
              4. Safe Collaboration
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Do not flood team boards with spam, advertisements, or non-educational content. Keep
              discussions focused on coursework, study techniques, revision planning, and shared
              project milestones.
            </p>
          </div>
        </div>

        {/* Reporting Process */}
        <div className="surface-card p-6 space-y-4 border-destructive/35 bg-destructive/[0.03]">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="size-5 text-destructive" />
              Reporting Policy Violations
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If you witness harassment, hate speech, self-harm concerns, or policy violations,
              report it immediately. All reports are confidential and reviewed directly by human
              trust and safety coordinators.
            </p>
          </div>
          <div className="flex gap-2">
            <ReportAbuseModal
              trigger={
                <Button type="button" variant="destructive" size="sm" className="text-xs gap-1.5">
                  <ShieldAlert className="size-3.5" />
                  <span>Submit Confidential Safety Report</span>
                </Button>
              }
            />
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
