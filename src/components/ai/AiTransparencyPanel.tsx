import { Bot, CheckCircle2, Globe, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { usePrefs } from "@/lib/preferences";

export function AiTransparencyPanel() {
  const { ecosystem } = usePrefs();

  return (
    <div className="surface-card p-5 space-y-4" data-testid="ai-transparency-panel">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <div>
            <h2 className="text-base font-bold font-display text-foreground">
              50. AI Learning Intelligence & Provenance Transparency Center
            </h2>
            <p className="text-xs text-muted-foreground">
              Audit how AI models operate inside BTC, how answers are grounded, and how your privacy
              is protected.
            </p>
          </div>
        </div>
        <FeatureGuideTrigger featureId="ai-transparency" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
        <div className="rounded-xl border border-border bg-surface-2/60 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Bot className="size-4 text-primary" />
            <span>Active Model Tier</span>
          </div>
          <div className="font-mono text-xs text-primary font-bold">
            Normal / Fast / Pro / Research ({ecosystem.aiModelTier})
          </div>
          <p className="text-[11px] text-muted-foreground">
            Low-latency student tutor optimized for step-by-step reasoning, STEM problem solving,
            and multilingual translation.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface-2/60 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Sparkles className="size-4 text-primary" />
            <span>Pedagogical Modes</span>
          </div>
          <div className="font-mono text-xs text-primary font-bold">Socratic vs. Direct</div>
          <p className="text-[11px] text-muted-foreground">
            Socratic mode asks guiding questions rather than doing homework for you, ensuring
            independent concept mastery.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface-2/60 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Globe className="size-4 text-primary" />
            <span>Search Grounding</span>
          </div>
          <div className="font-mono text-xs text-primary font-bold">Google Search Grounding</div>
          <p className="text-[11px] text-muted-foreground">
            When enabled, factual claims cite live dated sources with URLs and exact titles to
            counter hallucination.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface-2/60 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Lock className="size-4 text-primary" />
            <span>Privacy Perimeter</span>
          </div>
          <div className="font-mono text-xs text-primary font-bold">Care Notes Excluded</div>
          <p className="text-[11px] text-muted-foreground">
            Personal Care journals, emotional check-ins, and passwords are never transmitted to AI
            prompt contexts.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface-2/40 p-4 space-y-2 text-xs">
        <h3 className="font-bold text-foreground">Content Provenance Tagging Standard</h3>
        <p className="text-muted-foreground">
          Every piece of knowledge in BTC carries an explicit provenance tag to avoid confusing AI
          estimates with verified reality:
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 font-mono text-[11px]">
          <div className="rounded-lg border border-border bg-surface-1 p-2 space-y-0.5">
            <span className="text-primary font-bold">Curated Curricular</span>
            <p className="font-sans text-muted-foreground">
              Official textbook benchmarks and verified scientific laws.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface-1 p-2 space-y-0.5">
            <span className="text-emerald-400 font-bold">Source-Grounded</span>
            <p className="font-sans text-muted-foreground">
              Backed by live Google Search references with linked URLs.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface-1 p-2 space-y-0.5">
            <span className="text-amber-400 font-bold">AI-Generated</span>
            <p className="font-sans text-muted-foreground">
              Model synthesis requiring student critical verification.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface-1 p-2 space-y-0.5">
            <span className="text-sky-400 font-bold">Student-Created</span>
            <p className="font-sans text-muted-foreground">
              Your original notes, code submissions, and creative projects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
