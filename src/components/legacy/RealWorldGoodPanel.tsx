import { useMemo, useState } from "react";
import {
  CheckCircle2,
  HeartHandshake,
  Lock,
  PlusCircle,
  Printer,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModernSelect } from "@/components/ui/modern-select";
import { Textarea } from "@/components/ui/textarea";
import {
  type RealWorldGoodCategory,
  type RealWorldProjectRecord,
} from "@/data/open-learning-library";
import { useUser } from "@/hooks/use-nexora";
import { saveRealWorldProjectToFirestore } from "@/lib/legacy-firestore";
import { validateRealWorldGoodProject } from "@/lib/legacy-knowledge";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

const PROJECT_STARTER_TEMPLATES = {
  reading_club: {
    label: "Reading Kit Template",
    category: "reading_initiative" as RealWorldGoodCategory,
    title: "Neighborhood Primary Reading & Vocabulary Lending Corner",
    problemDefinition:
      "Younger primary learners lacked leveled bilingual storybooks and guided phonics word cards at after-school clubs.",
    intendedBeneficiaries: "40 primary school learners at the campus after-school club",
    educationalPurpose:
      "Practice fluency coaching, summarization, and age-appropriate literacy support.",
    safeActivityPlan:
      "Set up labeled reading bins in school library supervised by reading teacher; pairs read 20 minutes cleanly with checklist.",
    permissions: "Library Coordinator Approval, Parent Reading Consent",
    outcomes: "Circulate 60 story packs and record comprehension progress logs.",
    metricLabel: "Students participating in weekly reading circles",
  },
  digital_clinic: {
    label: "Digital Literacy Clinic",
    category: "digital_literacy" as RealWorldGoodCategory,
    title: "Community Cybersecurity & Trusted Fact-Checking Clinic",
    problemDefinition:
      "Community members and parents need clear defense steps against SMS phishing and health misinformation.",
    intendedBeneficiaries: "30 community parents and family elders",
    educationalPurpose:
      "Reinforce lateral reading, source attribution, and cyber hygiene communication skills.",
    safeActivityPlan:
      "Host supervised Saturday morning printed-guide walk-throughs in school hall; zero device passwords ever collected.",
    permissions: "School Principal Approval, Community Room Booking",
    outcomes: "30 families equipped with printed anti-scam checklists.",
    metricLabel: "Community members completing cybersecurity checklist",
  },
  responsible_tech: {
    label: "Responsible Tech Audit",
    category: "responsible_tech" as RealWorldGoodCategory,
    title: "School Device Energy & Screen-Health Stewardship Audit",
    problemDefinition:
      "Idle computer lab monitors and default notification clutter waste campus energy and hurt student focus.",
    intendedBeneficiaries: "85 middle school students sharing three campus computer labs",
    educationalPurpose:
      "Combine quantitative watt-hour calculations with digital wellbeing ergonomics.",
    safeActivityPlan:
      "Under IT teacher supervision, audit sleep timers on shared lab desktops and share calm-focus signage.",
    permissions: "IT Lab Coordinator Sign-Off, Vice Principal Approval",
    outcomes: "Configure automatic display sleep across 3 labs and cut idle wattage by 40%.",
    metricLabel: "Shared student workstations configured for energy & focus",
  },
};

export function RealWorldGoodPanel() {
  const { data: user } = useUser();
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: eco, update: updateEco } = useStudentEcosystem();

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Printable Impact Report Modal
  const [reportProject, setReportProject] = useState<RealWorldProjectRecord | null>(null);

  // New Project Form State (10 Dimensions)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [cat, setCat] = useState<RealWorldGoodCategory>("reading_initiative");
  const [title, setTitle] = useState("");
  const [problemDef, setProblemDef] = useState("");
  const [beneficiaries, setBeneficiaries] = useState("");
  const [eduPurpose, setEduPurpose] = useState("");
  const [safePlan, setSafePlan] = useState("");
  const [permissionsStr, setPermissionsStr] = useState("School Principal Approval, Parent Consent");
  const [supervisor, setSupervisor] = useState("");
  const [teamAliasesStr, setTeamAliasesStr] = useState("Student Lead A, Coordinator B");
  const [outcomes, setOutcomes] = useState("");
  const [evidence, setEvidence] = useState("");
  const [reflection, setReflection] = useState("");
  const [metricVal, setMetricVal] = useState(50);
  const [metricLabel, setMetricLabel] = useState("Students directly supported with study kits");

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return eco.realWorldGoodProjects.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (!q) return true;
      const haystack = [p.title, p.problemDefinition, p.intendedBeneficiaries, p.supervisorName]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [eco.realWorldGoodProjects, categoryFilter, searchQuery]);

  const totalBeneficiaries = useMemo(() => {
    return eco.realWorldGoodProjects.reduce((sum, p) => sum + p.impactMetricValue, 0);
  }, [eco.realWorldGoodProjects]);

  const applyStarterTemplate = (key: keyof typeof PROJECT_STARTER_TEMPLATES) => {
    const tpl = PROJECT_STARTER_TEMPLATES[key];
    setCat(tpl.category);
    setTitle(tpl.title);
    setProblemDef(tpl.problemDefinition);
    setBeneficiaries(tpl.intendedBeneficiaries);
    setEduPurpose(tpl.educationalPurpose);
    setSafePlan(tpl.safeActivityPlan);
    setPermissionsStr(tpl.permissions);
    setOutcomes(tpl.outcomes);
    setMetricLabel(tpl.metricLabel);
    toast.info(`Loaded '${tpl.label}' planner draft.`);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const evidenceText =
      evidence.trim() ||
      "Planned milestone log awaiting adult supervisor sign-off after execution.";
    const reflectionText =
      reflection.trim() ||
      "Initial planning completed; post-activity reflection scheduled upon delivery.";

    const projectDraft: Partial<RealWorldProjectRecord> = {
      title,
      category: cat,
      problemDefinition: problemDef,
      intendedBeneficiaries: beneficiaries,
      educationalPurpose: eduPurpose,
      safeActivityPlan: safePlan,
      requiredPermissions: permissionsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      supervisorName: supervisor,
      adultSupervised: true,
      expectedOutcomes: outcomes,
      evidenceSummary: evidenceText,
      reflectionAndLessons: reflectionText,
      impactMetricValue: Number(metricVal),
      impactMetricLabel: metricLabel,
    };

    const validation = validateRealWorldGoodProject(projectDraft);
    if (!validation.ok) {
      toast.error(validation.reason);
      return;
    }

    const created: RealWorldProjectRecord = {
      id: `rwg_proj_${Date.now()}`,
      category: cat,
      title: title.trim(),
      problemDefinition: problemDef.trim(),
      intendedBeneficiaries: beneficiaries.trim(),
      educationalPurpose: eduPurpose.trim(),
      safeActivityPlan: safePlan.trim(),
      requiredPermissions: permissionsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      supervisorName: supervisor.trim(),
      adultSupervised: true,
      expectedOutcomes: outcomes.trim(),
      evidenceSummary: evidenceText,
      reflectionAndLessons: reflectionText,
      impactMetricValue: Number(metricVal),
      impactMetricLabel: metricLabel.trim(),
      teamAliases: teamAliasesStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 10),
      milestones: [
        { id: "m1", title: "Permissions & adult supervisor safety check", done: true },
        { id: "m2", title: "Deliver activity & record safe participation", done: false },
        { id: "m3", title: "Document verified evidence & reflection", done: false },
      ],
      showcaseOptIn: true,
      status: "draft",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    updateEco((prev) => ({
      ...prev,
      realWorldGoodProjects: [created, ...prev.realWorldGoodProjects],
    }));

    if (user?.uid) {
      try {
        await saveRealWorldProjectToFirestore(user.uid, created);
      } catch {
        /* local ledger still saved */
      }
    }

    toast.success(
      `Project '${created.title}' saved as Draft — complete milestones to verify outcomes.`,
    );
    setIsCreateOpen(false);
    setTitle("");
    setProblemDef("");
    setBeneficiaries("");
    setEduPurpose("");
    setSafePlan("");
    setSupervisor("");
    setOutcomes("");
    setEvidence("");
    setReflection("");
  };

  const handleToggleMilestone = (projectId: string, milestoneId: string) => {
    updateEco((prev) => ({
      ...prev,
      realWorldGoodProjects: prev.realWorldGoodProjects.map((p) => {
        if (p.id !== projectId) return p;
        const nextMilestones = (p.milestones ?? []).map((m) =>
          m.id === milestoneId ? { ...m, done: !m.done } : m,
        );
        return {
          ...p,
          milestones: nextMilestones,
          status: p.status === "draft" ? "in_progress" : p.status,
        };
      }),
    }));
  };

  const handleAdvanceStatus = async (project: RealWorldProjectRecord) => {
    const nextStatus: RealWorldProjectRecord["status"] =
      project.status === "draft" ? "in_progress" : "completed_verified";

    if (nextStatus === "completed_verified") {
      const check = validateRealWorldGoodProject(project);
      if (!check.ok) {
        toast.error(check.reason);
        return;
      }
    }

    const updated: RealWorldProjectRecord = { ...project, status: nextStatus };
    updateEco((prev) => ({
      ...prev,
      realWorldGoodProjects: prev.realWorldGoodProjects.map((p) =>
        p.id === project.id ? updated : p,
      ),
    }));

    if (user?.uid) {
      try {
        await saveRealWorldProjectToFirestore(user.uid, updated);
      } catch {
        /* graceful fallback */
      }
    }
    toast.success(
      nextStatus === "in_progress"
        ? `'${project.title}' moved to In Progress.`
        : `'${project.title}' verified & completed!`,
    );
  };

  return (
    <div className="space-y-5" data-testid="real-world-good-panel">
      {/* Banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-surface-card to-surface-2 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <HeartHandshake className="size-4" />
              <span>
                {isAr ? "مبادرات النفع الحقيقي في العالم الواقعي" : "NEXORA Real World Good"}
              </span>
            </div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Connecting Knowledge with Responsible Community Impact
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              Transforming academic study into ethical action across 9 structured initiative
              domains. Projects start in Draft/Planning, track supervised milestones, and require
              verified adult oversight before impact completion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-mono">
              <span className="text-muted-foreground">Documented Beneficiaries:</span>{" "}
              <strong className="text-primary font-bold text-sm tabular-nums">
                {totalBeneficiaries}
              </strong>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="glow" className="h-8 text-xs">
                  <PlusCircle className="size-3.5 me-1.5" />
                  Plan Community Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base font-bold">
                    <HeartHandshake className="size-4 text-primary" />
                    New Real World Good Project (10-Point Checklist)
                  </DialogTitle>
                </DialogHeader>

                <div className="flex flex-wrap items-center gap-1.5 pb-1">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Sparkles className="size-3 text-primary" /> Starter Templates:
                  </span>
                  {(
                    Object.keys(PROJECT_STARTER_TEMPLATES) as Array<
                      keyof typeof PROJECT_STARTER_TEMPLATES
                    >
                  ).map((key) => (
                    <Button
                      key={key}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => applyStarterTemplate(key)}
                      className="h-6 text-[10px]"
                    >
                      {PROJECT_STARTER_TEMPLATES[key].label}
                    </Button>
                  ))}
                </div>

                <form onSubmit={(e) => void handleCreateProject(e)} className="space-y-3.5 text-xs">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="proj-title">1. Project Title *</Label>
                      <Input
                        id="proj-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Campus Zero-Waste Paper Binding"
                        required
                        className="text-xs"
                      />
                    </div>

                    <ModernSelect
                      label="Category (All 9 Domains) *"
                      value={cat}
                      onValueChange={(v) => setCat(v as RealWorldGoodCategory)}
                      searchable
                      searchPlaceholder="Search domain..."
                      options={[
                        { value: "reading_initiative", label: "Reading Initiative" },
                        { value: "educational_support", label: "Educational Support" },
                        { value: "digital_literacy", label: "Digital Literacy Clinic" },
                        { value: "environmental_awareness", label: "Environmental Awareness" },
                        { value: "accessibility_awareness", label: "Accessibility Awareness" },
                        { value: "science_education", label: "Science Community Lab" },
                        { value: "community_knowledge_sharing", label: "Knowledge Sharing" },
                        { value: "responsible_tech", label: "Responsible Technology" },
                        { value: "student_led_learning", label: "Student-Led Learning" },
                      ]}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="proj-problem">2. Problem Definition *</Label>
                    <Textarea
                      id="proj-problem"
                      rows={2}
                      value={problemDef}
                      onChange={(e) => setProblemDef(e.target.value)}
                      placeholder="What exact real community or school challenge are you addressing?"
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="proj-beneficiaries">3. Intended Beneficiaries *</Label>
                      <Input
                        id="proj-beneficiaries"
                        value={beneficiaries}
                        onChange={(e) => setBeneficiaries(e.target.value)}
                        placeholder="e.g., 60 primary students needing homework help"
                        required
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="proj-purpose">4. Educational Purpose *</Label>
                      <Input
                        id="proj-purpose"
                        value={eduPurpose}
                        onChange={(e) => setEduPurpose(e.target.value)}
                        placeholder="What academic or character skill was practiced?"
                        required
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="proj-plan">5. Safe Activity Plan *</Label>
                    <Textarea
                      id="proj-plan"
                      rows={2}
                      value={safePlan}
                      onChange={(e) => setSafePlan(e.target.value)}
                      placeholder="Step-by-step activity description emphasizing safety and transparency"
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label htmlFor="proj-permissions">6. Required Permissions *</Label>
                      <Input
                        id="proj-permissions"
                        value={permissionsStr}
                        onChange={(e) => setPermissionsStr(e.target.value)}
                        placeholder="School administration, venue coordinator"
                        required
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="proj-supervisor">7. Adult Supervisor *</Label>
                      <Input
                        id="proj-supervisor"
                        value={supervisor}
                        onChange={(e) => setSupervisor(e.target.value)}
                        placeholder="Teacher or parent coordinator name"
                        required
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="proj-aliases">Team Aliases (PII-Safe)</Label>
                      <Input
                        id="proj-aliases"
                        value={teamAliasesStr}
                        onChange={(e) => setTeamAliasesStr(e.target.value)}
                        placeholder="Student A, Student B"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="proj-outcomes">8. Expected Outcomes *</Label>
                      <Input
                        id="proj-outcomes"
                        value={outcomes}
                        onChange={(e) => setOutcomes(e.target.value)}
                        placeholder="Target goals (e.g. 100 books cataloged)"
                        required
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="proj-evidence">9. Evidence Plan / Completion Log</Label>
                      <Input
                        id="proj-evidence"
                        value={evidence}
                        onChange={(e) => setEvidence(e.target.value)}
                        placeholder="Signed certificate, attendance count (or planned log)"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="proj-reflection">10. Reflection &amp; Lessons Learned</Label>
                    <Textarea
                      id="proj-reflection"
                      rows={2}
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="Initial reflection or key takeaway (can be updated after completion)"
                      className="text-xs"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="proj-metric-val">Impact Metric Value (Count) *</Label>
                      <Input
                        id="proj-metric-val"
                        type="number"
                        min={1}
                        value={metricVal}
                        onChange={(e) => setMetricVal(Number(e.target.value))}
                        required
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="proj-metric-lbl">Impact Metric Description *</Label>
                      <Input
                        id="proj-metric-lbl"
                        value={metricLabel}
                        onChange={(e) => setMetricLabel(e.target.value)}
                        placeholder="e.g., Seniors assisted in health portal clinic"
                        required
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-surface-2/60 p-2.5 text-[11px] text-muted-foreground flex items-start gap-2">
                    <Lock className="size-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      NEXORA Privacy Guarantee: Student personal contact info is rejected. New
                      initiatives open as Drafts and transition through In Progress to Completed
                      under adult supervision.
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreateOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" variant="glow">
                      Save Project Plan (Draft)
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid gap-3 sm:grid-cols-3 items-end rounded-2xl border border-border bg-surface-card p-4 text-xs">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="rwg-search-input" className="text-xs font-semibold">
            Search Initiatives
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="rwg-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Community initiatives, beneficiaries, mentors..."
              className="min-h-[44px] ps-9 text-sm"
            />
          </div>
        </div>

        <ModernSelect
          label="Category Filter"
          value={categoryFilter}
          onValueChange={setCategoryFilter}
          searchable
          searchPlaceholder="Search categories..."
          options={[
            { value: "all", label: "All 9 Categories" },
            { value: "reading_initiative", label: "Reading Initiatives" },
            { value: "educational_support", label: "Educational Support" },
            { value: "digital_literacy", label: "Digital Literacy" },
            { value: "environmental_awareness", label: "Environmental" },
            { value: "accessibility_awareness", label: "Accessibility" },
            { value: "science_education", label: "Science Education" },
            { value: "community_knowledge_sharing", label: "Knowledge Sharing" },
            { value: "responsible_tech", label: "Responsible Technology" },
            { value: "student_led_learning", label: "Student-Led Learning" },
          ]}
        />
      </div>

      {/* Projects Showcase Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredProjects.map((p) => (
          <div
            key={p.id}
            className="surface-card flex flex-col justify-between space-y-3.5 p-5 transition-all hover:border-primary/40"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold uppercase tracking-wide text-primary">
                  {p.category.replace(/_/g, " ")}
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    p.status === "completed_verified"
                      ? "text-emerald-500"
                      : p.status === "in_progress"
                        ? "text-primary"
                        : "text-amber-500"
                  }`}
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>
                    {p.status === "completed_verified"
                      ? "Completed & Verified"
                      : p.status === "in_progress"
                        ? "In Progress (Supervised)"
                        : "Draft Plan"}
                  </span>
                </span>
              </div>

              <div>
                <h3 className="font-display text-base font-bold text-foreground">{p.title}</h3>
                <div className="text-[11px] text-muted-foreground">
                  Supervisor: <strong className="text-foreground">{p.supervisorName}</strong> ·
                  Logged {p.createdAt}
                  {p.teamAliases && p.teamAliases.length > 0
                    ? ` · Team: ${p.teamAliases.join(", ")}`
                    : ""}
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Problem Solved: </span>
                  {p.problemDefinition}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Intended Beneficiaries: </span>
                  {p.intendedBeneficiaries}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Safe Activity Plan: </span>
                  {p.safeActivityPlan}
                </div>
              </div>

              {p.milestones && p.milestones.length > 0 && (
                <div className="rounded-lg border border-border bg-surface-2/60 p-2.5 space-y-1 text-[11px]">
                  <div className="font-semibold text-foreground">Project Milestones Checklist</div>
                  {p.milestones.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={m.done}
                        onChange={() => handleToggleMilestone(p.id, m.id)}
                        className="accent-primary"
                      />
                      <span
                        className={
                          m.done ? "line-through text-muted-foreground" : "text-foreground"
                        }
                      >
                        {m.title}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-1">
                <div className="font-bold text-primary flex items-center justify-between">
                  <span>Measured Human Impact</span>
                  <span className="font-mono text-sm tabular-nums font-extrabold">
                    {p.impactMetricValue}
                  </span>
                </div>
                <p className="text-[11px] text-foreground/90">{p.impactMetricLabel}</p>
              </div>

              <div className="rounded-lg bg-surface-2/60 p-2.5 text-[11px] text-muted-foreground space-y-1">
                <div className="font-semibold text-foreground">Evidence &amp; Lessons Learned</div>
                <p>{p.evidenceSummary}</p>
                <p className="italic text-foreground/80">"{p.reflectionAndLessons}"</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
              <span>Permissions: {p.requiredPermissions.join(", ")}</span>

              <div className="flex items-center gap-1.5">
                {p.status !== "completed_verified" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void handleAdvanceStatus(p)}
                    className="h-6 text-[10px]"
                  >
                    {p.status === "draft" ? "Start Project" : "Verify Outcomes & Complete"}
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setReportProject(p)}
                  className="h-6 text-[10px]"
                >
                  <Printer className="size-3 me-1 text-primary" />
                  Impact Report
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* In-App Printable Impact Report Dialog */}
      <Dialog open={Boolean(reportProject)} onOpenChange={(o) => !o && setReportProject(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Printer className="size-4 text-primary" />
              Real World Good — Verified Impact Report
            </DialogTitle>
          </DialogHeader>
          {reportProject && (
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-surface-2 p-4 space-y-2">
                <div className="text-[11px] font-bold uppercase text-primary">
                  {reportProject.category.replace(/_/g, " ")} · Status: {reportProject.status}
                </div>
                <h3 className="font-display text-base font-bold text-foreground">
                  {reportProject.title}
                </h3>
                <p className="text-muted-foreground">
                  <strong>Adult Supervisor:</strong> {reportProject.supervisorName} ·{" "}
                  <strong>Permissions:</strong> {reportProject.requiredPermissions.join(", ")}
                </p>
                <p>
                  <strong>Beneficiaries Reached ({reportProject.impactMetricValue}):</strong>{" "}
                  {reportProject.intendedBeneficiaries} — {reportProject.impactMetricLabel}
                </p>
                <p>
                  <strong>Evidence Summary:</strong> {reportProject.evidenceSummary}
                </p>
                <p>
                  <strong>Reflection:</strong> {reportProject.reflectionAndLessons}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground">
                  PII Guarantee: Zero student contact data published. Safe print view ready.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReportProject(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="glow"
                  size="sm"
                  onClick={() => {
                    if (typeof window !== "undefined") window.print();
                  }}
                >
                  <Printer className="size-3.5 me-1" />
                  Print Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
