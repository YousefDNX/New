import { lazy, Suspense, useMemo, useState } from "react";
import {
  BookmarkCheck,
  ExternalLink,
  Globe,
  Info,
  ListTodo,
  MapPin,
  Plus,
  Radar,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/Page";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { GroundedSourcesPanel } from "@/components/ai/GroundedSourcesPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOpportunities, useOpportunityActions } from "@/hooks/use-modules";
import { useProfile, useStats, useTaskActions } from "@/hooks/use-nexora";
import type { GroundedWebSource } from "@/lib/ai.server";
import { evaluateOpportunityEligibility } from "@/lib/empowerment-engines";
import { sanitizeHttpUrl, type OpportunityCategory } from "@/lib/firestore-data";
import { formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import { REFERENCE_OPPORTUNITIES, type ReferenceOpportunityItem } from "@/lib/recommendations";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

const LazyLearningPlacesMap = lazy(() =>
  import("@/components/maps/LearningPlacesMap").then((m) => ({ default: m.LearningPlacesMap })),
);

function computeDaysLeft(deadline: string | null | undefined, todayIso: string): number | null {
  if (!deadline || !/^\d{4}-\d{2}-\d{2}/.test(deadline)) return null;
  const targetMs = Date.parse(`${deadline.slice(0, 10)}T00:00:00Z`);
  const todayMs = Date.parse(`${todayIso}T00:00:00Z`);
  if (Number.isNaN(targetMs) || Number.isNaN(todayMs)) return null;
  return Math.round((targetMs - todayMs) / 86400_000);
}

export function OpportunitiesWorkspace() {
  const { t, lang, locale } = usePrefs();
  const { data: profile } = useProfile();
  const { data: stats } = useStats();
  const { state: eco } = useStudentEcosystem();
  const { data: saved = [] } = useOpportunities();
  const { saveOpportunity, updateOpportunityStatus, updateOpportunityNotes, deleteOpportunity } =
    useOpportunityActions();
  const { addTask } = useTaskActions();
  const [expandedEligId, setExpandedEligId] = useState<string | null>(null);

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const defaultScope =
    locale.opportunityScope === "local"
      ? "kuwait"
      : locale.opportunityScope === "gcc"
        ? "gcc"
        : "all";

  const [tab, setTab] = useState<"discover" | "saved">("discover");
  const [scope, setScope] = useState<"all" | "kuwait" | "gcc" | "global">(defaultScope);
  const [category, setCategory] = useState<"all" | OpportunityCategory>("all");
  const [search, setSearch] = useState("");
  const [savedFilter, setSavedFilter] = useState<"all" | "saved" | "applied" | "archived">("all");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  // Manual opportunity form
  const [mTitle, setMTitle] = useState("");
  const [mOrg, setMOrg] = useState("");
  const [mCat, setMCat] = useState<OpportunityCategory>("scholarship");
  const [mScope, setMScope] = useState<"kuwait" | "gcc" | "global">("kuwait");
  const [mDeadline, setMDeadline] = useState("");
  const [mUrl, setMUrl] = useState("");

  // Search Grounding & Maps Explorer state
  const [showPlacesMap, setShowPlacesMap] = useState(false);
  const [webVerifyQuery, setWebVerifyQuery] = useState(
    "Kuwait GCC youth STEM scholarships programs",
  );
  const [webVerifyLoading, setWebVerifyLoading] = useState(false);
  const [webVerifyAnswer, setWebVerifyAnswer] = useState("");
  const [webVerifySources, setWebVerifySources] = useState<GroundedWebSource[]>([]);
  const [webVerifyQueries, setWebVerifyQueries] = useState<string[]>([]);

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    return REFERENCE_OPPORTUNITIES.filter((item) => {
      if (scope !== "all" && item.region_scope !== scope) return false;
      if (category !== "all" && item.category !== category) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.organizer.toLowerCase().includes(q) ||
        item.eligibility.toLowerCase().includes(q)
      );
    });
  }, [scope, category, search]);

  const filteredSaved = useMemo(() => {
    if (savedFilter === "all") return saved;
    return saved.filter((o) => o.status === savedFilter);
  }, [saved, savedFilter]);

  const handleSaveCatalogItem = async (item: ReferenceOpportunityItem) => {
    try {
      await saveOpportunity({
        title: item.title,
        organizer: item.organizer,
        category: item.category,
        region_scope: item.region_scope,
        eligibility: item.eligibility,
        deadline: item.deadline,
        cost: item.cost,
        url: item.url,
        source: item.source,
        source_kind: "reference_catalog",
        last_verified_at: item.last_verified_at,
      });
      toast.success(`${t("opp.saveOpp")} (+15 XP)`);
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    }
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle.trim() || !mOrg.trim()) return;
    try {
      await saveOpportunity({
        title: mTitle.trim(),
        organizer: mOrg.trim(),
        category: mCat,
        region_scope: mScope,
        deadline: mDeadline || null,
        url: mUrl || null,
        source: "Student Added",
        source_kind: "manual",
      });
      toast.success(`${t("opp.saveOpp")} (+15 XP)`);
      setMTitle("");
      setMOrg("");
      setMDeadline("");
      setMUrl("");
      setTab("saved");
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    }
  };

  const handleAddDeadlineTask = async (
    oppTitle: string,
    deadline: string | null,
    withChecklist = false,
  ) => {
    try {
      const parsedIso =
        deadline && /^\d{4}-\d{2}-\d{2}/.test(deadline)
          ? new Date(`${deadline.slice(0, 10)}T12:00:00Z`).toISOString()
          : null;
      await addTask({
        title: `Prepare application: ${oppTitle}`,
        area: "career",
        priority: "high",
        due_at: parsedIso,
        ...(withChecklist
          ? {
              subtasks: [
                { id: "prep_1", title: "Review eligibility & rubric", done: false },
                { id: "prep_2", title: "Prepare transcript & CV", done: false },
                { id: "prep_3", title: "Draft personal statement", done: false },
              ],
            }
          : {}),
      });
      toast.success(t("dash.tasks.toastAdd"));
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={t("opp.title")}
        subtitle={t("opp.sub")}
        actions={
          <FeatureGuideTrigger
            featureId={showPlacesMap ? "learning-places-map" : "opportunities-radar"}
          />
        }
      />

      <div className="surface-card flex flex-wrap items-center justify-between gap-3 border-primary/30 p-4 text-xs text-muted-foreground">
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{t("opp.noticeCatalog")}</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant={showPlacesMap ? "glow" : "outline"}
          onClick={() => setShowPlacesMap((s) => !s)}
          className="h-8 text-xs"
        >
          <MapPin className="size-3.5" />
          <span>{t("p5.maps.hubTitle")}</span>
        </Button>
      </div>

      {/* Live Web Search Verification via Google Search Grounding */}
      <div className="surface-card space-y-3 border-primary/25 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Globe className="size-4" />
            <span>Live Scholarship & Program Web Verification</span>
          </div>
          <span className="text-[0.68rem] text-muted-foreground">
            {t("p5.search.badgeGrounded")}
          </span>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!webVerifyQuery.trim()) return;
            setWebVerifyLoading(true);
            try {
              const res = await fetch("/api/ai/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  query: webVerifyQuery.trim(),
                  subject: "Scholarships & Student Opportunities",
                  language: lang,
                }),
              });
              const data = (await res.json()) as {
                ok?: boolean;
                text?: string;
                sources?: GroundedWebSource[];
                searchQueries?: string[];
                message?: string;
              };
              if (!res.ok || !data.ok || !data.text) {
                toast.error(data.message ?? "Web search grounding failed.");
                return;
              }
              setWebVerifyAnswer(data.text);
              setWebVerifySources(data.sources ?? []);
              setWebVerifyQueries(data.searchQueries ?? []);
            } catch {
              toast.error("Network error during web verification.");
            } finally {
              setWebVerifyLoading(false);
            }
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <Input
            value={webVerifyQuery}
            onChange={(e) => setWebVerifyQuery(e.target.value)}
            placeholder="Verify current scholarship deadlines or STEM programs..."
            className="h-8 text-xs"
          />
          <Button
            type="submit"
            size="sm"
            variant="glow"
            disabled={webVerifyLoading || !webVerifyQuery.trim()}
            className="h-8 shrink-0 text-xs"
          >
            <Globe className="size-3.5" />
            <span>{webVerifyLoading ? "Searching..." : "Verify with Google Search"}</span>
          </Button>
        </form>
        {webVerifyAnswer && (
          <div className="space-y-2 rounded-lg border border-border bg-surface-2 p-3 text-xs">
            <div className="whitespace-pre-wrap leading-relaxed text-foreground">
              {webVerifyAnswer}
            </div>
            <GroundedSourcesPanel
              mode={webVerifySources.length > 0 ? "search" : "ungrounded"}
              webSources={webVerifySources}
              searchQueries={webVerifyQueries}
            />
          </div>
        )}
      </div>

      {showPlacesMap && (
        <Suspense
          fallback={
            <div className="surface-card p-6 text-center text-xs text-muted-foreground">
              Loading Educational Places Map...
            </div>
          }
        >
          <LazyLearningPlacesMap initialQuery="university library educational innovation center" />
        </Suspense>
      )}

      {/* Tabs + Filters */}
      <div className="surface-card flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setTab("discover")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              tab === "discover"
                ? "bg-primary text-primary-foreground"
                : "bg-surface-2 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Radar className="size-3.5" />
            <span>{t("opp.tab.discover")}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("saved")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              tab === "saved"
                ? "bg-primary text-primary-foreground"
                : "bg-surface-2 text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookmarkCheck className="size-3.5" />
            <span>
              {t("opp.tab.saved")} ({saved.length})
            </span>
          </button>
        </div>

        {tab === "discover" ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-44">
              <Search className="pointer-events-none absolute start-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("study.searchPh")}
                className="h-8 ps-8 text-xs"
              />
            </div>

            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as typeof scope)}
              aria-label={t("set.oppscope")}
              className="h-8 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
            >
              <option value="all">{t("common.all")}</option>
              <option value="kuwait">{t("set.oppscope.local")}</option>
              <option value="gcc">{t("set.oppscope.gcc")}</option>
              <option value="global">{t("set.oppscope.global")}</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              aria-label={t("opp.tab.discover")}
              className="h-8 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
            >
              <option value="all">{t("common.all")}</option>
              <option value="scholarship">{t("opp.cat.scholarship")}</option>
              <option value="competition">{t("opp.cat.competition")}</option>
              <option value="program">{t("opp.cat.program")}</option>
              <option value="course">{t("opp.cat.course")}</option>
              <option value="initiative">{t("opp.cat.initiative")}</option>
            </select>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {(["all", "saved", "applied", "archived"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSavedFilter(st)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                  savedFilter === st
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                {st === "all" ? t("opp.filterAll") : t(`opp.status.${st}`)}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === "discover" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredCatalog.map((item) => {
            const safeUrl = sanitizeHttpUrl(item.url);
            const isSaved = saved.some((s) => s.title === item.title);
            const elig = evaluateOpportunityEligibility({
              opportunity: item,
              profile,
              state: eco,
              currentStreak: stats?.current_streak ?? 0,
            });
            const eligOpen = expandedEligId === item.id;
            return (
              <div
                key={item.id}
                className="surface-card flex flex-col justify-between space-y-4 p-5"
              >
                <div className="space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[0.7rem] text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="border-s-2 border-primary ps-2 font-semibold capitalize text-primary">
                        {item.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="uppercase">{item.region_scope}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedEligId(eligOpen ? null : item.id)}
                      className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                        elig.status === "strong_match"
                          ? "bg-success/15 text-success"
                          : elig.status === "partial_match"
                            ? "bg-xp/15 text-xp"
                            : "bg-surface-2 text-muted-foreground"
                      }`}
                    >
                      Eligibility Fit: {elig.fitScore}% ({eligOpen ? "Hide" : "Check"})
                    </button>
                  </div>
                  <h3 className="font-display text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground">
                    <strong>{t("opp.organizer")}:</strong> {item.organizer}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>{t("opp.eligibility")}:</strong> {item.eligibility}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>{t("opp.deadline")}:</strong> {item.deadline} ·{" "}
                    <strong>{t("opp.cost")}:</strong> {item.cost}
                  </p>
                  <p className="text-[0.68rem] text-muted-foreground">
                    <strong>{t("opp.source")}:</strong> {item.source} ·{" "}
                    <strong>{t("opp.verifiedDate")}:</strong> {item.last_verified_at} (
                    {t("opp.unverifiedHint")})
                  </p>

                  {eligOpen && (
                    <div
                      className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-1.5 text-[11px]"
                      data-testid={`eligibility-detail-${item.id}`}
                    >
                      <div className="font-bold text-primary">
                        41. Eligibility Fit Breakdown ({elig.fitScore}%)
                      </div>
                      {elig.matchedCriteria.map((m) => (
                        <p key={m} className="text-success">
                          ✓ {m}
                        </p>
                      ))}
                      {elig.missingCriteria.map((m) => (
                        <p key={m} className="text-xp">
                          • Check / Gap: {m}
                        </p>
                      ))}
                      <p className="text-foreground">
                        <strong>Next Step:</strong> {elig.recommendedSteps[0]}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={isSaved ? "outline" : "glow"}
                    disabled={isSaved}
                    onClick={() => handleSaveCatalogItem(item)}
                  >
                    <span>{isSaved ? t("opp.savedBadge") : `${t("opp.saveOpp")} (+15 XP)`}</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddDeadlineTask(item.title, null, true)}
                  >
                    <ListTodo className="size-3.5" />
                    <span>{t("opp.prepChecklist")}</span>
                  </Button>
                  {safeUrl && (
                    <a
                      href={safeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <span>{t("opp.openOfficial")}</span>
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <form onSubmit={handleAddManual} className="surface-card space-y-3 p-5 lg:col-span-1">
            <h2 className="font-display text-base font-bold text-foreground">
              {t("opp.addCustom")}
            </h2>
            <div className="space-y-1">
              <Label htmlFor="op-title" className="text-xs">
                {t("dash.tasks.fieldTitle")}
              </Label>
              <Input
                id="op-title"
                required
                value={mTitle}
                onChange={(e) => setMTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="op-org" className="text-xs">
                {t("opp.organizer")}
              </Label>
              <Input id="op-org" required value={mOrg} onChange={(e) => setMOrg(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={mCat}
                onChange={(e) => setMCat(e.target.value as OpportunityCategory)}
                aria-label="Category"
                className="h-9 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
              >
                <option value="scholarship">{t("opp.cat.scholarship")}</option>
                <option value="competition">{t("opp.cat.competition")}</option>
                <option value="program">{t("opp.cat.program")}</option>
                <option value="course">{t("opp.cat.course")}</option>
                <option value="initiative">{t("opp.cat.initiative")}</option>
                <option value="internship">{t("opp.cat.internship")}</option>
              </select>
              <select
                value={mScope}
                onChange={(e) => setMScope(e.target.value as "kuwait" | "gcc" | "global")}
                aria-label="Scope"
                className="h-9 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
              >
                <option value="kuwait">{t("set.oppscope.local")}</option>
                <option value="gcc">{t("set.oppscope.gcc")}</option>
                <option value="global">{t("set.oppscope.global")}</option>
              </select>
            </div>
            <Input
              type="date"
              value={mDeadline}
              onChange={(e) => setMDeadline(e.target.value)}
              aria-label={t("opp.deadline")}
            />
            <Input
              type="url"
              value={mUrl}
              onChange={(e) => setMUrl(e.target.value)}
              placeholder="https://..."
            />
            <Button type="submit" variant="glow" className="w-full">
              <Plus className="size-4" />
              <span>{t("opp.saveOpp")}</span>
            </Button>
          </form>

          <div className="space-y-3 lg:col-span-2">
            {filteredSaved.map((opp) => {
              const safeUrl = sanitizeHttpUrl(opp.url);
              const daysLeft = computeDaysLeft(opp.deadline, todayIso);
              const draftNotes = noteDrafts[opp.id] ?? opp.notes ?? "";
              return (
                <div key={opp.id} className="surface-card space-y-2.5 p-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-bold text-foreground">{opp.title}</h3>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={opp.status}
                        onChange={(e) =>
                          updateOpportunityStatus(
                            opp,
                            e.target.value as "saved" | "applied" | "archived",
                          )
                        }
                        aria-label={opp.title}
                        className="h-7 rounded border border-input bg-surface-2 px-2 text-xs text-foreground"
                      >
                        <option value="saved">{t("opp.status.saved")}</option>
                        <option value="applied">{t("opp.status.applied")}</option>
                        <option value="archived">{t("opp.status.archived")}</option>
                      </select>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteOpportunity(opp.id)}
                        aria-label={t("common.delete")}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    {opp.organizer} {opp.deadline ? `· ${opp.deadline}` : ""}
                    {daysLeft !== null && (
                      <span
                        className={`ms-2 font-semibold tabular-nums ${
                          daysLeft < 0
                            ? "text-destructive"
                            : daysLeft <= 7
                              ? "text-xp"
                              : "text-primary"
                        }`}
                      >
                        ({formatNumber(daysLeft, lang)} {t("opp.daysLeft")})
                      </span>
                    )}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <Textarea
                      rows={2}
                      value={draftNotes}
                      onChange={(e) =>
                        setNoteDrafts((prev) => ({ ...prev, [opp.id]: e.target.value }))
                      }
                      placeholder={t("opp.notesPh")}
                      className="text-xs"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={async () => {
                          await updateOpportunityNotes(opp, draftNotes.trim() || null);
                          toast.success(t("common.save"));
                        }}
                      >
                        {t("opp.saveNotes")}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => handleAddDeadlineTask(opp.title, opp.deadline, true)}
                      >
                        <ListTodo className="size-3" />
                        <span>{t("opp.prepChecklist")}</span>
                      </Button>
                      {safeUrl && (
                        <a
                          href={safeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                        >
                          <span>{t("opp.openOfficial")}</span>
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
