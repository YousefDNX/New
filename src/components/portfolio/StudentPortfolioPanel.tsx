import { useState } from "react";
import { Award, Download, Gem, Globe, Keyboard, Pencil, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStats, useTasks } from "@/hooks/use-nexora";
import { downloadTextFile } from "@/lib/safe-file";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

export function StudentPortfolioPanel() {
  const { state, update, exportJson } = useStudentEcosystem();
  const { data: stats } = useStats();
  const { data: tasks = [] } = useTasks();

  const [editingBio, setEditingBio] = useState(false);
  const [headlineDraft, setHeadlineDraft] = useState(state.portfolio.headline);
  const [bioDraft, setBioDraft] = useState(state.portfolio.bio);

  const completedTasks = tasks.filter((tk) => tk.status === "done").length;
  const bestWpm = state.typingHistory.reduce((mx, r) => Math.max(mx, r.wpm), 0);

  const handleSaveBio = () => {
    update((prev) => ({
      ...prev,
      portfolio: {
        ...prev.portfolio,
        headline: headlineDraft.trim() || prev.portfolio.headline,
        bio: bioDraft.trim() || prev.portfolio.bio,
      },
    }));
    setEditingBio(false);
    toast.success("Portfolio profile updated.");
  };

  const handleExportPortfolioMd = () => {
    const lines = [
      `# BTC Verified Student Portfolio`,
      `**Headline:** ${state.portfolio.headline}`,
      `**Bio:** ${state.portfolio.bio}`,
      ``,
      `## Verified Academic Metrics`,
      `- Level: ${stats?.level ?? 1} (${stats?.xp ?? 0} XP)`,
      `- Completed Tasks: ${completedTasks}`,
      `- Best Typing Speed: ${bestWpm} WPM`,
      `- Citadel Relics Collected: ${state.adventure.collectedRelics.length}/4`,
      ``,
      ...(state.placement
        ? [
            `## English 5-Dimension Placement Bands`,
            ...state.placement.dimensions.map(
              (d) => `- ${d.label}: CEFR ${d.cefr} (${d.scorePct}%)`,
            ),
            ``,
          ]
        : []),
      `## Portfolio Projects (${state.portfolio.projects.length})`,
      ...state.portfolio.projects.map(
        (p) =>
          `### ${p.title} [${p.category}]\n${p.summary}\nProgress: ${p.stepsCompleted}/${p.totalSteps} · Showcase Opt-In: ${p.showcaseOptIn ? "Yes" : "Private"}\n`,
      ),
    ];
    downloadTextFile(lines.join("\n"), "btc-student-portfolio.md", "text/markdown;charset=utf-8");
  };

  const handleExportJson = () => {
    downloadTextFile(exportJson(), "btc-portfolio-bundle.json", "application/json;charset=utf-8");
  };

  return (
    <div className="space-y-5 text-xs">
      <div className="surface-card space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Award className="size-4" />
              <span>Unified Student & Personal Development Portfolio</span>
            </div>
            {editingBio ? (
              <div className="mt-2 space-y-2 max-w-xl">
                <Input
                  value={headlineDraft}
                  onChange={(e) => setHeadlineDraft(e.target.value)}
                  className="text-xs"
                />
                <Textarea
                  rows={2}
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  className="text-xs"
                />
                <Button type="button" size="sm" variant="glow" onClick={handleSaveBio}>
                  <Save className="size-3.5" />
                  <span>Save Headline & Bio</span>
                </Button>
              </div>
            ) : (
              <>
                <h2 className="font-display text-lg font-bold text-foreground">
                  {state.portfolio.headline}
                </h2>
                <p className="max-w-2xl text-muted-foreground">{state.portfolio.bio}</p>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FeatureGuideTrigger featureId="student-portfolio" />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setHeadlineDraft(state.portfolio.headline);
                setBioDraft(state.portfolio.bio);
                setEditingBio((e) => !e);
              }}
            >
              <Pencil className="size-3.5" />
              <span>{editingBio ? "Cancel Edit" : "Edit Bio"}</span>
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleExportPortfolioMd}>
              <Download className="size-3.5" />
              <span>Export Markdown</span>
            </Button>
            <Button type="button" size="sm" variant="glow" onClick={handleExportJson}>
              <Download className="size-3.5" />
              <span>Export JSON</span>
            </Button>
          </div>
        </div>

        {/* Summary Credentials */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-surface-2 p-3.5">
            <div className="flex items-center gap-1.5 text-[0.68rem] text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              <span>Platform Growth</span>
            </div>
            <div className="mt-1 font-display text-base font-bold text-foreground">
              Level {stats?.level ?? 1} · {stats?.xp ?? 0} XP
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface-2 p-3.5">
            <div className="flex items-center gap-1.5 text-[0.68rem] text-muted-foreground">
              <Keyboard className="size-3.5 text-primary" />
              <span>Typing Benchmark</span>
            </div>
            <div className="mt-1 font-display text-base font-bold text-foreground">
              {bestWpm > 0 ? `${bestWpm} WPM Verified` : "No typing logs yet"}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface-2 p-3.5">
            <div className="flex items-center gap-1.5 text-[0.68rem] text-muted-foreground">
              <Gem className="size-3.5 text-xp" />
              <span>Adventure Relics</span>
            </div>
            <div className="mt-1 font-display text-base font-bold text-foreground">
              {state.adventure.collectedRelics.length} / 4 Citadel Relics
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface-2 p-3.5">
            <div className="flex items-center gap-1.5 text-[0.68rem] text-muted-foreground">
              <Globe className="size-3.5 text-success" />
              <span>Projects Built</span>
            </div>
            <div className="mt-1 font-display text-base font-bold text-foreground">
              {state.portfolio.projects.length} Documented
            </div>
          </div>
        </div>

        {/* Placement Dimensions */}
        {state.placement && (
          <div className="space-y-2 border-t border-border/80 pt-3">
            <div className="font-display text-sm font-bold text-foreground">
              Per-Skill Language Profile
            </div>
            <div className="grid gap-2 sm:grid-cols-5">
              {state.placement.dimensions.map((d) => (
                <div
                  key={d.dimension}
                  className="rounded-lg border border-border bg-surface-2 p-2.5"
                >
                  <div className="font-bold text-primary">CEFR {d.cefr}</div>
                  <div className="font-medium text-foreground truncate">{d.label}</div>
                  <div className="text-[0.68rem] text-muted-foreground">{d.scorePct}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Portfolio Projects */}
      <div className="surface-card space-y-3 p-5">
        <div>
          <h3 className="font-display text-base font-bold text-foreground">
            Documented Projects & Showcase Permissions
          </h3>
          <p className="text-muted-foreground">
            Create structured projects inside the Future → Project Builder tab. Toggle
            &ldquo;Showcase Opt-In&rdquo; to display a project safely in BTC Student Showcase
            (Circle).
          </p>
        </div>

        {state.portfolio.projects.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">
            No documented projects yet. Open Future → Project Builder to scaffold your first STEM or
            community project!
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {state.portfolio.projects.map((proj) => (
              <div
                key={proj.id}
                className="space-y-2 rounded-xl border border-border bg-surface-2 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[0.65rem] font-bold uppercase text-primary">
                      {proj.category}
                    </span>
                    <h4 className="font-display text-sm font-bold text-foreground">{proj.title}</h4>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={proj.showcaseOptIn ? "glow" : "outline"}
                    className="h-7 text-[0.68rem]"
                    onClick={() =>
                      update((prev) => ({
                        ...prev,
                        portfolio: {
                          ...prev.portfolio,
                          projects: prev.portfolio.projects.map((p) =>
                            p.id === proj.id ? { ...p, showcaseOptIn: !p.showcaseOptIn } : p,
                          ),
                        },
                      }))
                    }
                  >
                    {proj.showcaseOptIn ? "Showcase Opt-In: ON" : "Private Only"}
                  </Button>
                </div>
                <p className="text-muted-foreground">{proj.summary}</p>
                <div className="text-[0.68rem] text-primary font-semibold">
                  Steps Completed: {proj.stepsCompleted} / {proj.totalSteps}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
