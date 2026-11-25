import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Compass,
  GraduationCap,
  Hammer,
  ListPlus,
  MapPin,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/Page";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { useToast } from "@/components/common/ToastProvider";
import { ReadyToUseLibraryView } from "@/components/common/ReadyToUseLibraryModal";
import { UniversityAndProjectsPanel } from "@/components/future/UniversityAndProjectsPanel";
import { ScienceFairAndImpactPanel } from "@/components/future/ScienceFairAndImpactPanel";
import { FlaskConical } from "lucide-react";

const LazyLearningPlacesMap = lazy(() =>
  import("@/components/maps/LearningPlacesMap").then((m) => ({ default: m.LearningPlacesMap })),
);
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModernSelect } from "@/components/ui/modern-select";
import { Textarea } from "@/components/ui/textarea";
import { useFutureActions, useFuturePlans } from "@/hooks/use-modules";
import { useTaskActions } from "@/hooks/use-nexora";
import { formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import { FUTURE_PATHWAYS, type PathwayTemplate } from "@/lib/recommendations";

const ALL_INTERESTS = Array.from(new Set(FUTURE_PATHWAYS.flatMap((p) => p.interests)));
const ALL_STRENGTHS = Array.from(new Set(FUTURE_PATHWAYS.flatMap((p) => p.strengths)));

export function FutureWorkspace() {
  const { t, lang, uiMode, setUiMode } = usePrefs();
  const appToast = useToast();
  const { data: plans = [] } = useFuturePlans();
  const { saveFuturePlan, updateFuturePlan, deleteFuturePlan } = useFutureActions();
  const { addTask } = useTaskActions();
  const [showStarterLibrary, setShowStarterLibrary] = useState(false);
  const [showCampusMap, setShowCampusMap] = useState(false);
  const [subTab, setSubTab] = useState<"pathways" | "university" | "projects" | "science_impact">(
    "pathways",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qTab = params.get("tab");
    if (
      qTab === "pathways" ||
      qTab === "university" ||
      qTab === "projects" ||
      qTab === "science_impact"
    ) {
      setSubTab(qTab);
    }
  }, []);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);

  // Custom Pathway Creator
  const [customTitle, setCustomTitle] = useState("");
  const [customStep1, setCustomStep1] = useState("");
  const [customStep2, setCustomStep2] = useState("");
  const [savingCustom, setSavingCustom] = useState(false);

  // Plan notes drafts
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const computeFitScore = (p: PathwayTemplate): number | null => {
    const totalSelected = selectedInterests.length + selectedStrengths.length;
    if (totalSelected === 0) return null;
    const matchedI = p.interests.filter((i) => selectedInterests.includes(i)).length;
    const matchedS = p.strengths.filter((s) => selectedStrengths.includes(s)).length;
    return Math.min(100, Math.round(((matchedI + matchedS) / totalSelected) * 100));
  };

  const filteredPathways = useMemo(() => {
    if (selectedInterests.length === 0 && selectedStrengths.length === 0) return FUTURE_PATHWAYS;
    return FUTURE_PATHWAYS.filter((p) => {
      const iMatch =
        selectedInterests.length === 0 || p.interests.some((i) => selectedInterests.includes(i));
      const sMatch =
        selectedStrengths.length === 0 || p.strengths.some((s) => selectedStrengths.includes(s));
      return iMatch && sMatch;
    });
  }, [selectedInterests, selectedStrengths]);

  const handleSavePathway = async (p: PathwayTemplate) => {
    try {
      await saveFuturePlan({
        pathway_id: p.id,
        title: p.title,
        interests: p.interests,
        strengths: p.strengths,
        milestones: p.milestones.map((m, idx) => ({
          id: `${p.id}_m${idx}`,
          title: m,
          done: false,
        })),
      });
      toast.success(`${t("future.savePlan")} (+20 XP)`);
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    }
  };

  const handleCreateCustomPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    setSavingCustom(true);
    try {
      const steps = [customStep1.trim(), customStep2.trim()].filter(Boolean);
      const pid = `custom_${Date.now().toString(36)}`;
      await saveFuturePlan({
        pathway_id: pid,
        title: customTitle.trim(),
        interests: selectedInterests,
        strengths: selectedStrengths,
        milestones: (steps.length > 0 ? steps : [customTitle.trim()]).map((m, idx) => ({
          id: `${pid}_m${idx}`,
          title: m,
          done: false,
        })),
      });
      toast.success(`${t("future.savePlan")} (+20 XP)`);
      setCustomTitle("");
      setCustomStep1("");
      setCustomStep2("");
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    } finally {
      setSavingCustom(false);
    }
  };

  const handleCreatePrepTask = async (milestoneTitle: string, pathwayTitle: string) => {
    try {
      await addTask({
        title: milestoneTitle,
        details: pathwayTitle,
        area: "career",
        priority: "medium",
      });
      toast.success(t("dash.tasks.toastAdd"));
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title={t("future.title")} subtitle={t("future.sub")} />
        <div className="flex flex-wrap items-center gap-2">
          <FeatureGuideTrigger
            featureId={
              showCampusMap
                ? "learning-places-map"
                : subTab === "science_impact"
                  ? "science-fair-impact"
                  : subTab === "university" || subTab === "projects"
                    ? "university-projects"
                    : "future-pathways"
            }
          />
          <Button
            type="button"
            size="sm"
            variant={showCampusMap ? "glow" : "outline"}
            onClick={() => setShowCampusMap((s) => !s)}
            className="h-8 gap-1.5 text-xs"
          >
            <MapPin className="size-3.5" />
            <span>{t("p5.maps.hubTitle")}</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={showStarterLibrary ? "glow" : "outline"}
            onClick={() => setShowStarterLibrary((s) => !s)}
            className="h-8 gap-1.5 text-xs"
          >
            <BookOpen className="size-3.5" />
            <span>{lang === "ar" ? "مسارات وخطط جاهزة" : "Ready-to-Use Career Roadmaps"}</span>
          </Button>
        </div>
      </div>

      {showCampusMap && (
        <Suspense
          fallback={
            <div className="surface-card p-6 text-center text-xs text-muted-foreground">
              Loading Campus & Learning Hub Explorer...
            </div>
          }
        >
          <LazyLearningPlacesMap initialQuery="university campus engineering center library" />
        </Suspense>
      )}

      {showStarterLibrary && (
        <div className="surface-card space-y-4 border-primary/30 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                Ready-to-Use Career & Portfolio Roadmaps
              </h2>
              <p className="text-xs text-muted-foreground">
                Adopt structured portfolio and scholarship milestones directly into your Growth Map.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowStarterLibrary(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
          <ReadyToUseLibraryView
            defaultCategory="future"
            onItemImported={() => setShowStarterLibrary(false)}
          />
        </div>
      )}

      <div className="surface-card border-primary/30 p-4 text-xs text-muted-foreground">
        {t("future.disclaimer")}
      </div>

      {/* Sub-navigation: Career Pathways | University Prep Center | Project Builder */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "pathways", label: "Career & Subject Pathways", icon: Compass },
            { id: "university", label: "University Prep Center", icon: GraduationCap },
            { id: "projects", label: "Step-by-Step Project Builder", icon: Hammer },
            { id: "science_impact", label: "Science Fair & Impact (#36/38)", icon: FlaskConical },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={subTab === item.id ? "glow" : "outline"}
              onClick={() => setSubTab(item.id)}
              className="h-8 text-xs"
            >
              <Icon className="size-3.5" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </div>

      {subTab === "university" && <UniversityAndProjectsPanel mode="university" />}

      {subTab === "projects" && <UniversityAndProjectsPanel mode="projects" />}

      {subTab === "science_impact" && <ScienceFairAndImpactPanel />}

      {subTab === "pathways" && (
        <>
          {/* Interests & Strengths Explorer + Custom Pathway Builder */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="surface-card space-y-4 p-5 lg:col-span-2">
              <div className="space-y-2">
                <h2 className="font-display text-sm font-bold text-foreground">
                  {t("future.interests")}
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_INTERESTS.map((interest) => {
                    const active = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() =>
                          toggleItem(selectedInterests, setSelectedInterests, interest)
                        }
                        className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                          active
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="font-display text-sm font-bold text-foreground">
                  {t("future.strengths")}
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_STRENGTHS.map((strength) => {
                    const active = selectedStrengths.includes(strength);
                    return (
                      <button
                        key={strength}
                        type="button"
                        onClick={() =>
                          toggleItem(selectedStrengths, setSelectedStrengths, strength)
                        }
                        className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                          active
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {strength}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {uiMode === "advanced" ? (
              <form onSubmit={handleCreateCustomPlan} className="surface-card space-y-2.5 p-5">
                <h2 className="font-display text-sm font-bold text-foreground">
                  {t("future.customTitle")}
                </h2>
                <Input
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={t("future.customPh")}
                  className="text-xs"
                />
                <Input
                  value={customStep1}
                  onChange={(e) => setCustomStep1(e.target.value)}
                  placeholder="Milestone 1..."
                  className="text-xs"
                />
                <Input
                  value={customStep2}
                  onChange={(e) => setCustomStep2(e.target.value)}
                  placeholder="Milestone 2..."
                  className="text-xs"
                />
                <Button
                  type="submit"
                  variant="glow"
                  size="sm"
                  className="w-full"
                  disabled={savingCustom}
                >
                  <Plus className="size-3.5" />
                  <span>{t("future.savePlan")} (+20 XP)</span>
                </Button>
              </form>
            ) : (
              <div className="surface-card flex flex-col justify-between space-y-3 border-primary/25 bg-primary/5 p-5">
                <div className="space-y-1.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-primary">
                    {lang === "ar" ? "الوضع المبسط" : "Simplified Mode"}
                  </div>
                  <h2 className="font-display text-sm font-bold text-foreground">
                    {lang === "ar" ? "استكشف المسارات الجاهزة أدناه" : "Pick a Ready Pathway Below"}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {lang === "ar"
                      ? "اختر اهتماماتك أو اعتمد خارطة طريق مهنية جاهزة. لبناء مسار مخصص، انتقل للوضع المتقدم."
                      : "Filter curated career roadmaps by your interests, or switch to Advanced mode to build custom milestones."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowStarterLibrary(true)}
                    className="text-xs"
                  >
                    {lang === "ar" ? "تصفح الخطط" : "Starter Packs"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setUiMode("advanced")}
                    className="text-xs"
                  >
                    {lang === "ar" ? "تفعيل الوضع المتقدم" : "Custom Builder"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Explore Pathways */}
          <div className="space-y-3">
            <h2 className="font-display text-base font-bold text-foreground">
              {t("future.pathways")}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredPathways.map((p) => {
                const alreadySaved = plans.some((pl) => pl.pathway_id === p.id);
                const matchPct = computeFitScore(p);
                return (
                  <div
                    key={p.id}
                    className="surface-card flex flex-col justify-between space-y-4 p-5"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-primary">
                          <Compass className="size-4" />
                          <h3 className="font-display text-sm font-bold text-foreground">
                            {p.title}
                          </h3>
                        </div>
                        {matchPct !== null && (
                          <span className="font-mono text-xs font-semibold tabular-nums text-primary">
                            {formatNumber(matchPct, lang)}% {t("future.matchLabel")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">{p.summary}</p>
                      <div className="text-[0.7rem] text-muted-foreground">
                        <strong className="text-foreground">{t("future.subjects")}:</strong>{" "}
                        {p.subjects.join(" · ")}
                      </div>
                      <ul className="space-y-1 pt-1 text-xs text-muted-foreground">
                        {p.milestones.map((m) => (
                          <li key={m} className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      type="button"
                      variant={alreadySaved ? "outline" : "glow"}
                      size="sm"
                      disabled={alreadySaved}
                      onClick={() => handleSavePathway(p)}
                    >
                      <Plus className="size-3.5" />
                      <span>
                        {alreadySaved ? t("opp.savedBadge") : `${t("future.savePlan")} (+20 XP)`}
                      </span>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Saved Pathway Plans */}
          <div className="space-y-3">
            <h2 className="font-display text-base font-bold text-foreground">
              {t("future.myPlans")}
            </h2>
            {plans.length === 0 ? (
              <div className="surface-card p-6 text-center text-xs text-muted-foreground">—</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {plans.map((plan) => {
                  const totalMs = Math.max(plan.milestones.length, 1);
                  const doneMs = plan.milestones.filter((m) => m.done).length;
                  const pct = Math.round((doneMs / totalMs) * 100);
                  const currentNotes = noteDrafts[plan.id] ?? plan.notes ?? "";

                  return (
                    <div key={plan.id} className="surface-card space-y-3 p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-display text-sm font-bold text-foreground">
                            {plan.title}
                          </h3>
                          <div className="mt-1 text-[0.7rem] tabular-nums text-muted-foreground">
                            {t("future.completion")}: {formatNumber(doneMs, lang)}/
                            {formatNumber(totalMs, lang)} ({formatNumber(pct, lang)}%)
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ModernSelect
                            ariaLabel={plan.title}
                            size="sm"
                            className="w-36"
                            value={plan.status}
                            onValueChange={(v) =>
                              updateFuturePlan(plan, {
                                status: v as "exploring" | "active" | "achieved",
                              })
                            }
                            searchable={false}
                            options={[
                              { value: "exploring", label: t("future.status.exploring") },
                              { value: "active", label: t("future.status.active") },
                              { value: "achieved", label: t("future.status.achieved") },
                            ]}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteFuturePlan(plan.id)}
                            aria-label={t("common.delete")}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <div className="h-1.5 w-full overflow-hidden rounded-sm bg-surface-2">
                        <div
                          className="h-full bg-gradient-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="space-y-2">
                        {plan.milestones.map((ms) => (
                          <div
                            key={ms.id}
                            className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                const willBeDone = !ms.done;
                                const next = plan.milestones.map((m) =>
                                  m.id === ms.id ? { ...m, done: !m.done } : m,
                                );
                                void updateFuturePlan(plan, { milestones: next });
                                if (willBeDone) {
                                  appToast.milestoneAchieved(ms.title, 25, plan.title);
                                }
                              }}
                              className="flex flex-1 items-center gap-2 text-start"
                            >
                              {ms.done ? (
                                <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                              ) : (
                                <Circle className="size-3.5 shrink-0 text-muted-foreground" />
                              )}
                              <span
                                className={
                                  ms.done ? "line-through text-muted-foreground" : "text-foreground"
                                }
                              >
                                {ms.title}
                              </span>
                            </button>

                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-[0.68rem]"
                              onClick={() => handleCreatePrepTask(ms.title, plan.title)}
                            >
                              <ListPlus className="size-3" />
                              <span>{t("future.addStep")}</span>
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1.5 border-t border-border/60 pt-2">
                        <Textarea
                          rows={2}
                          value={currentNotes}
                          onChange={(e) =>
                            setNoteDrafts((prev) => ({ ...prev, [plan.id]: e.target.value }))
                          }
                          placeholder={t("opp.notesPh")}
                          className="text-xs"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={async () => {
                            await updateFuturePlan(plan, { notes: currentNotes.trim() || null });
                            toast.success(t("common.save"));
                          }}
                        >
                          {t("opp.saveNotes")}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
