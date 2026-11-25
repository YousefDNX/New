import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  GraduationCap,
  Hammer,
  ListPlus,
  Plus,
  Rocket,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModernSelect } from "@/components/ui/modern-select";
import { Textarea } from "@/components/ui/textarea";
import { useTaskActions } from "@/hooks/use-nexora";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

const UNI_CHECKLIST_ITEMS = [
  { id: "uni_transcript", label: "Confirm high-school GPA & core STEM/English subject tracks" },
  { id: "uni_english_test", label: "Check required IELTS / TOEFL or placement band target" },
  { id: "uni_projects", label: "Document 2+ concrete student projects in BTC Portfolio" },
  { id: "uni_references", label: "Identify 2 teachers/mentors who can speak to your character" },
  { id: "uni_scholarships", label: "Shortlist 3 national or merit scholarship deadlines" },
  { id: "uni_statement", label: "Draft concise Personal Statement (Hook + Impact + Future Goal)" },
];

export function UniversityAndProjectsPanel({ mode }: { mode: "university" | "projects" }) {
  const { state, update } = useStudentEcosystem();
  const { addTask } = useTaskActions();

  // University Prep local inputs synced cleanly
  const [majorDraft, setMajorDraft] = useState(state.universityPrep.targetMajor);
  const [regionDraft, setRegionDraft] = useState(state.universityPrep.targetRegion);
  const [hookDraft, setHookDraft] = useState(state.universityPrep.essayHook);
  const [impactDraft, setImpactDraft] = useState(state.universityPrep.essayImpact);

  // Step-by-Step Project Builder state
  const [projTitle, setProjTitle] = useState("");
  const [projCategory, setProjCategory] = useState("STEM & Innovation");
  const [projProblem, setProjProblem] = useState("");
  const [projStepsChecked, setProjStepsChecked] = useState<string[]>(["step_define"]);
  const [projShowcaseOptIn, setProjShowcaseOptIn] = useState(false);

  const projectBlueprintSteps = [
    { id: "step_define", title: "1. Define Clear Student / Community Problem" },
    { id: "step_research", title: "2. Verify 2 Credible Sources & Constraints" },
    { id: "step_prototype", title: "3. Build First Working Prototype or Study Guide" },
    { id: "step_test", title: "4. Measure Results & Log Honest Improvements" },
    { id: "step_present", title: "5. Summarize Impact & Publish to Portfolio" },
  ];

  const handleSaveUniversityPrep = () => {
    update((prev) => ({
      ...prev,
      universityPrep: {
        ...prev.universityPrep,
        targetMajor: majorDraft.trim() || prev.universityPrep.targetMajor,
        targetRegion: regionDraft.trim() || prev.universityPrep.targetRegion,
        essayHook: hookDraft.trim(),
        essayImpact: impactDraft.trim(),
      },
    }));
    toast.success("University Prep roadmap saved!");
  };

  const toggleChecklist = (itemId: string) => {
    update((prev) => {
      const done = prev.universityPrep.checklistDone.includes(itemId);
      return {
        ...prev,
        universityPrep: {
          ...prev.universityPrep,
          checklistDone: done
            ? prev.universityPrep.checklistDone.filter((id) => id !== itemId)
            : [...prev.universityPrep.checklistDone, itemId],
        },
      };
    });
  };

  const handleSaveProjectToPortfolio = () => {
    if (!projTitle.trim()) {
      toast.error("Please enter a project title first.");
      return;
    }
    update((prev) => ({
      ...prev,
      portfolio: {
        ...prev.portfolio,
        projects: [
          {
            id: `proj_${Date.now().toString(36)}`,
            title: projTitle.trim(),
            category: projCategory,
            summary:
              projProblem.trim() ||
              `Built via BTC 5-Step Project Builder (${projStepsChecked.length}/5 milestones complete).`,
            stepsCompleted: projStepsChecked.length,
            totalSteps: projectBlueprintSteps.length,
            showcaseOptIn: projShowcaseOptIn,
            createdAt: new Date().toISOString(),
          },
          ...prev.portfolio.projects,
        ],
      },
    }));
    toast.success("Project saved to your BTC Student Portfolio!");
    setProjTitle("");
    setProjProblem("");
  };

  const handleExportProjectToTasks = async () => {
    if (!projTitle.trim()) {
      toast.error("Enter a project title to create actionable Tasks.");
      return;
    }
    try {
      for (const st of projectBlueprintSteps.filter((s) => !projStepsChecked.includes(s.id))) {
        await addTask({
          title: `${projTitle.trim()} — ${st.title}`,
          area: "career",
          priority: "medium",
          details: projProblem.trim() || projCategory,
        });
      }
      toast.success("Remaining project steps exported to Tasks!");
    } catch {
      toast.error("Sign in to sync tasks to your account.");
    }
  };

  if (mode === "university") {
    const doneCount = state.universityPrep.checklistDone.length;
    const pct = Math.round((doneCount / UNI_CHECKLIST_ITEMS.length) * 100);

    return (
      <div className="grid gap-5 lg:grid-cols-2 text-xs">
        <div className="surface-card space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-bold">
              <GraduationCap className="size-4" />
              <span>University Prep Readiness ({pct}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-muted-foreground">
                {doneCount}/{UNI_CHECKLIST_ITEMS.length}
              </span>
              <FeatureGuideTrigger featureId="university-projects" iconOnly />
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full bg-gradient-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="space-y-2">
            {UNI_CHECKLIST_ITEMS.map((item) => {
              const checked = state.universityPrep.checklistDone.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleChecklist(item.id)}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-start hover:border-primary/40"
                >
                  {checked ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span
                    className={checked ? "line-through text-muted-foreground" : "text-foreground"}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="surface-card space-y-3 p-5">
          <h3 className="font-display text-base font-bold text-foreground">
            Target Major & Personal Statement Drafter
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Target Major</Label>
              <Input
                value={majorDraft}
                onChange={(e) => setMajorDraft(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Target Study Region</Label>
              <Input
                value={regionDraft}
                onChange={(e) => setRegionDraft(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Personal Statement Opening Hook</Label>
            <Textarea
              rows={3}
              value={hookDraft}
              onChange={(e) => setHookDraft(e.target.value)}
              placeholder="What specific moment or question sparked your curiosity in this field?"
              className="text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Concrete Evidence & Community Impact</Label>
            <Textarea
              rows={3}
              value={impactDraft}
              onChange={(e) => setImpactDraft(e.target.value)}
              placeholder="What measurable project, teamwork, or experiment proved your dedication?"
              className="text-xs"
            />
          </div>
          <Button type="button" variant="glow" size="sm" onClick={handleSaveUniversityPrep}>
            <Save className="size-3.5" />
            <span>Save University Prep Profile</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2 text-xs">
      <div className="surface-card space-y-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Hammer className="size-4" />
            <span>Step-by-Step Student Project Builder</span>
          </div>
          <FeatureGuideTrigger featureId="university-projects" iconOnly />
        </div>
        <Input
          value={projTitle}
          onChange={(e) => setProjTitle(e.target.value)}
          placeholder="Project Title (e.g. Solar Classroom Monitor)"
          className="text-xs"
        />
        <ModernSelect
          label="Project Category"
          ariaLabel="Project category"
          value={projCategory}
          onValueChange={setProjCategory}
          searchable={false}
          options={[
            { value: "STEM & Innovation", label: "STEM & Innovation" },
            { value: "Digital & Software", label: "Digital & Software" },
            { value: "Community Impact", label: "Community Impact" },
            { value: "Academic Research", label: "Academic Research" },
          ]}
        />
        <Textarea
          rows={3}
          value={projProblem}
          onChange={(e) => setProjProblem(e.target.value)}
          placeholder="Problem statement & intended impact..."
          className="text-xs"
        />

        <div className="space-y-1.5 pt-1">
          <div className="font-semibold text-foreground">Execution Checkpoints</div>
          {projectBlueprintSteps.map((st) => {
            const done = projStepsChecked.includes(st.id);
            return (
              <button
                key={st.id}
                type="button"
                onClick={() =>
                  setProjStepsChecked((prev) =>
                    done ? prev.filter((id) => id !== st.id) : [...prev, st.id],
                  )
                }
                className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-start"
              >
                {done ? (
                  <CheckCircle2 className="size-3.5 text-success" />
                ) : (
                  <Circle className="size-3.5 text-muted-foreground" />
                )}
                <span>{st.title}</span>
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={projShowcaseOptIn}
            onChange={(e) => setProjShowcaseOptIn(e.target.checked)}
          />
          <span>Opt-in to display in BTC Student Showcase (you can toggle anytime)</span>
        </label>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="button" size="sm" variant="glow" onClick={handleSaveProjectToPortfolio}>
            <Plus className="size-3.5" />
            <span>Save Project to Portfolio</span>
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleExportProjectToTasks}>
            <ListPlus className="size-3.5" />
            <span>Send Remaining Steps to Tasks</span>
          </Button>
        </div>
      </div>

      <div className="surface-card space-y-3 p-5">
        <div className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
          <Rocket className="size-4 text-primary" />
          <span>Saved Portfolio Projects ({state.portfolio.projects.length})</span>
        </div>
        {state.portfolio.projects.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            Your structured projects will appear here and sync cleanly with Level Up → Student
            Portfolio.
          </p>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto">
            {state.portfolio.projects.map((p) => (
              <div
                key={p.id}
                className="space-y-1 rounded-xl border border-border bg-surface-2 p-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary text-[0.68rem] uppercase">
                    {p.category}
                  </span>
                  <span className="font-mono text-[0.68rem] text-muted-foreground">
                    {p.stepsCompleted}/{p.totalSteps} steps
                  </span>
                </div>
                <div className="font-display text-sm font-bold text-foreground">{p.title}</div>
                <p className="text-muted-foreground">{p.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
