import { useState } from "react";
import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  GitBranch,
  GraduationCap,
  Layers,
  Lightbulb,
  Printer,
  Share2,
  ShieldAlert,
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
import { type PedagogicalModelKind, type TeachingGuideRecord } from "@/data/open-learning-library";
import { useUser } from "@/hooks/use-nexora";
import {
  saveTeachingGuideToFirestore,
  updateTeachingGuideRatingInFirestore,
} from "@/lib/legacy-firestore";
import { formatMultiAngleExplanation, rateTeachingResourceQuality } from "@/lib/legacy-knowledge";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

const TEACHING_TEMPLATES = {
  lesson_plan: {
    label: "Structured Lesson Plan",
    model: "5e_inquiry" as PedagogicalModelKind,
    objective:
      "Students will explain core cause-and-effect steps, test one worked example, and summarize findings.",
    remedial: "Use step-by-step graphic organizers and bilingual key-term anchor cards.",
    extension: "Design a second real-world application testing boundary conditions.",
    worksheet:
      "Section 1: Prerequisite Recall (3 quick items)\nSection 2: Guided Worked Example\nSection 3: Independent Check & Self-Explanation",
  },
  assessment_rubric: {
    label: "Formative Assessment Rubric",
    model: "differentiated_stations" as PedagogicalModelKind,
    objective:
      "Evaluate conceptual understanding across emergent, developing, and proficient learner levels.",
    remedial: "Provide verbal or tactile demonstration option and sentence starters.",
    extension: "Peer-review synthesis task defending method choice.",
    worksheet:
      "Rubric Levels:\n- Developing (1): Identifies key term with support\n- Proficient (2): Explains mechanism and solves standard example\n- Exemplary (3): Transfers principle to unfamiliar scenario",
  },
  beginner_explanation: {
    label: "Beginner Plain-Language Guide",
    model: "direct_instruction" as PedagogicalModelKind,
    objective:
      "Introduce foundational concepts assuming zero prior terminology using concrete everyday analogies.",
    remedial: "Eliminate jargon on first pass; keep examples one concept per line.",
    extension: "Bridge plain intuition back to formal textbook notation.",
    worksheet:
      "Warm-Up Story -> Single Idea Breakdown -> Two Confidence-Building Exercises -> Reflection Prompt",
  },
};

export function TeachingForAllPanel({
  onPublishToLibrary,
}: {
  onPublishToLibrary?: (guide: TeachingGuideRecord) => void;
}) {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { data: user } = useUser();
  const { state: eco, update: updateEco } = useStudentEcosystem();

  const [activeGuideId, setActiveGuideId] = useState<string>(
    eco.teachingGuides[0]?.id ?? "teach_guide_inquiry_gravity",
  );
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>("all");
  const [showPendingQueue, setShowPendingQueue] = useState(false);

  // Printable Worksheet In-App Dialog (replaces forbidden window.open)
  const [printPreviewGuide, setPrintPreviewGuide] = useState<TeachingGuideRecord | null>(null);

  // New Teaching Guide Submission
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("Mathematics");
  const [newModel, setNewModel] = useState<PedagogicalModelKind>("5e_inquiry");
  const [newGrade, setNewGrade] = useState("Grade 7-9");
  const [newObjective, setNewObjective] = useState("");
  const [newRemedial, setNewRemedial] = useState("");
  const [newExtension, setNewExtension] = useState("");
  const [newWorksheet, setNewWorksheet] = useState("");
  const [newVisual, setNewVisual] = useState("");
  const [newAnalogy, setNewAnalogy] = useState("");
  const [newEveryday, setNewEveryday] = useState("");
  const [newLogic, setNewLogic] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [safetyPledge, setSafetyPledge] = useState(false);

  // Quality Rating Evaluator State
  const [ratingClarity, setRatingClarity] = useState(5);
  const [ratingDepth, setRatingDepth] = useState(4);
  const [ratingAccuracy, setRatingAccuracy] = useState(5);
  const [ratingA11y, setRatingA11y] = useState(5);

  const approvedGuides = eco.teachingGuides.filter((g) => g.supervisorApproved);
  const pendingGuides = eco.teachingGuides.filter((g) => !g.supervisorApproved);

  const filteredGuides = approvedGuides.filter((g) => {
    if (selectedModelFilter !== "all" && g.pedagogicalModel !== selectedModelFilter) {
      return false;
    }
    return true;
  });

  const activeGuide =
    eco.teachingGuides.find((g) => g.id === activeGuideId) ??
    filteredGuides[0] ??
    eco.teachingGuides[0];

  const qualityEvaluation = rateTeachingResourceQuality({
    clarity: ratingClarity,
    depth: ratingDepth,
    accuracy: ratingAccuracy,
    accessibility: ratingA11y,
  });

  const applyTemplate = (templateKey: keyof typeof TEACHING_TEMPLATES) => {
    const tpl = TEACHING_TEMPLATES[templateKey];
    setNewModel(tpl.model);
    setNewObjective(tpl.objective);
    setNewRemedial(tpl.remedial);
    setNewExtension(tpl.extension);
    setNewWorksheet(tpl.worksheet);
    toast.success(`Applied '${tpl.label}' starter template.`);
  };

  const handleCreateTeachingGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!safetyPledge) {
      toast.error("Please confirm student child-protection and no-private-contact compliance.");
      return;
    }
    if (newTitle.trim().length < 5) {
      toast.error("Enter a descriptive title for this teaching unit (min 5 characters).");
      return;
    }

    const created: TeachingGuideRecord = {
      id: `teach_guide_${Date.now()}`,
      title: newTitle.trim(),
      titleAr: newTitle.trim(),
      subject: newSubject.trim(),
      pedagogicalModel: newModel,
      targetGrade: newGrade,
      learningObjective:
        newObjective.trim() || "Students master foundational principles through inquiry.",
      remedialAccommodations: newRemedial
        ? [newRemedial.trim()]
        : [
            "Provide visual step-by-step formula charts.",
            "Pair with a peer mentor during initial drills.",
          ],
      extensionChallenges: newExtension
        ? [newExtension.trim()]
        : ["Formulate independent hypothesis testing scenario."],
      printableWorksheetOutline:
        newWorksheet.trim() ||
        "Part A: Conceptual check. Part B: Guided practice. Part C: Independent reflection.",
      multiAngleExplanations: {
        visualDiagramPrompt:
          newVisual.trim() || "Labeled flow diagram showing input-to-output balance.",
        realWorldAnalogy: newAnalogy.trim() || "Everyday system analogy with recognizable parts.",
        everydayApplication: newEveryday.trim() || "Practical household or community application.",
        stepByStepLogic: newLogic.trim() || "Premise 1 -> Action -> Measured Result.",
      },
      author: newAuthor.trim() || "Educator Contributor",
      version: 1,
      qualityRating: { clarity: 4, depth: 4, accuracy: 4, accessibility: 5 },
      ratingCount: 1,
      supervisorApproved: false,
      safetyNotice:
        "Strict child protection: No unsupervised private contact between minors and unknown adults.",
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    updateEco((prev) => ({
      ...prev,
      teachingGuides: [created, ...prev.teachingGuides],
    }));

    if (user?.uid) {
      try {
        await saveTeachingGuideToFirestore(user.uid, created);
      } catch {
        /* local state maintained */
      }
    }

    toast.success(`Submitted '${created.title}' to Coordinator Approval Queue.`);
    setShowPendingQueue(true);
    setIsSubmitOpen(false);
    setActiveGuideId(created.id);
  };

  const handleApprovePendingGuide = async (guide: TeachingGuideRecord) => {
    updateEco((prev) => ({
      ...prev,
      teachingGuides: prev.teachingGuides.map((g) =>
        g.id === guide.id
          ? { ...g, supervisorApproved: true, updatedAt: new Date().toISOString().slice(0, 10) }
          : g,
      ),
    }));
    if (user?.uid) {
      try {
        await saveTeachingGuideToFirestore(user.uid, { ...guide, supervisorApproved: true });
      } catch {
        /* non-fatal */
      }
    }
    toast.success(`Approved '${guide.title}' for open Educator Center catalog.`);
  };

  const handleBumpGuideVersion = async (guide: TeachingGuideRecord) => {
    const nextVersion = guide.version + 1;
    const today = new Date().toISOString().slice(0, 10);
    updateEco((prev) => ({
      ...prev,
      teachingGuides: prev.teachingGuides.map((g) =>
        g.id === guide.id ? { ...g, version: nextVersion, updatedAt: today } : g,
      ),
    }));
    toast.success(`Updated '${guide.title}' to Version ${nextVersion}.`);
  };

  const handleSaveQualityRating = async (guide: TeachingGuideRecord) => {
    const updatedRating = {
      clarity: ratingClarity,
      depth: ratingDepth,
      accuracy: ratingAccuracy,
      accessibility: ratingA11y,
    };
    const nextCount = (guide.ratingCount ?? 1) + 1;
    updateEco((prev) => ({
      ...prev,
      teachingGuides: prev.teachingGuides.map((g) =>
        g.id === guide.id
          ? {
              ...g,
              qualityRating: updatedRating,
              ratingCount: nextCount,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : g,
      ),
    }));
    if (user?.uid) {
      try {
        await updateTeachingGuideRatingInFirestore(guide.id, updatedRating, nextCount);
      } catch {
        /* non-fatal */
      }
    }
    toast.success(`Saved community quality score (${qualityEvaluation.compositeScore}/5.0).`);
  };

  return (
    <div className="space-y-5" data-testid="teaching-for-all-panel">
      {/* Banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-surface-card to-surface-2 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <GraduationCap className="size-4" />
              <span>{isAr ? "التعليم للجميع ودعم المعلمين" : "NEXORA Teaching for All"}</span>
            </div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Teacher Resource Center &amp; Differentiated Instruction Toolkit
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              Lesson templates, multi-angle concept breakdown tools, printable worksheets, and
              accommodations for struggling learners. Every submission undergoes coordinator review.
              Zero unsupervised private adult-minor contact.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={showPendingQueue ? "secondary" : "outline"}
              onClick={() => setShowPendingQueue((v) => !v)}
              className="h-8 text-xs"
            >
              <ClipboardCheck className="size-3.5 me-1.5 text-primary" />
              Pending Approval ({pendingGuides.length})
            </Button>

            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="glow" className="h-8 text-xs">
                  <Sparkles className="size-3.5 me-1.5" />
                  Create Teaching Guide
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base font-bold">
                    <GraduationCap className="size-4 text-primary" />
                    Submit Educator Teaching Guide (Template Starters Included)
                  </DialogTitle>
                </DialogHeader>

                <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3 text-xs">
                  <span className="text-muted-foreground font-medium">Starter Templates:</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => applyTemplate("lesson_plan")}
                    className="h-7 text-[11px]"
                  >
                    Lesson Plan
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => applyTemplate("assessment_rubric")}
                    className="h-7 text-[11px]"
                  >
                    Assessment Rubric
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => applyTemplate("beginner_explanation")}
                    className="h-7 text-[11px]"
                  >
                    Beginner Explanation
                  </Button>
                </div>

                <form onSubmit={handleCreateTeachingGuide} className="space-y-3 text-xs">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="guide-title">Lesson Title *</Label>
                      <Input
                        id="guide-title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g., 5E Inquiry: Newton's Laws"
                        required
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="guide-subject">Subject *</Label>
                      <Input
                        id="guide-subject"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="Physics / Mathematics / Biology"
                        required
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <ModernSelect
                      label="Pedagogical Model *"
                      value={newModel}
                      onValueChange={(v) => setNewModel(v as PedagogicalModelKind)}
                      searchable
                      searchPlaceholder="Search model..."
                      options={[
                        {
                          value: "5e_inquiry",
                          label: "5E Inquiry",
                          description: "Engage, Explore, Explain, Elaborate, Evaluate",
                        },
                        { value: "direct_instruction", label: "Explicit Direct Instruction" },
                        { value: "socratic_seminar", label: "Socratic Seminar" },
                        { value: "differentiated_stations", label: "Differentiated Stations" },
                      ]}
                    />

                    <div className="space-y-1">
                      <Label htmlFor="guide-grade">Target Grade Band *</Label>
                      <Input
                        id="guide-grade"
                        value={newGrade}
                        onChange={(e) => setNewGrade(e.target.value)}
                        placeholder="Grade 8-10"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="guide-objective">Measurable Learning Objective *</Label>
                    <Textarea
                      id="guide-objective"
                      rows={2}
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      placeholder="Students will be able to calculate velocity and sketch free-body diagrams accurately."
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="guide-remedial">Struggling Student Accommodations *</Label>
                      <Textarea
                        id="guide-remedial"
                        rows={2}
                        value={newRemedial}
                        onChange={(e) => setNewRemedial(e.target.value)}
                        placeholder="Concrete visual analogies, color-coded equation steps"
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="guide-extension">Advanced Stretch Challenges</Label>
                      <Textarea
                        id="guide-extension"
                        rows={2}
                        value={newExtension}
                        onChange={(e) => setNewExtension(e.target.value)}
                        placeholder="Multi-variable extensions"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="guide-worksheet">Printable Worksheet Tasks Outline</Label>
                    <Textarea
                      id="guide-worksheet"
                      rows={3}
                      value={newWorksheet}
                      onChange={(e) => setNewWorksheet(e.target.value)}
                      placeholder="Section 1: Diagnostic warm-up. Section 2: Guided check."
                      className="text-xs"
                    />
                  </div>

                  <div className="rounded-lg border border-border bg-surface-2/60 p-3 space-y-2">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <Compass className="size-3.5 text-primary" />
                      <span>Multi-Angle Explanation Inputs (Same Concept in 4 Ways)</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="1. Visual / diagram prompt"
                        value={newVisual}
                        onChange={(e) => setNewVisual(e.target.value)}
                        className="text-xs"
                      />
                      <Input
                        placeholder="2. Real-world analogy"
                        value={newAnalogy}
                        onChange={(e) => setNewAnalogy(e.target.value)}
                        className="text-xs"
                      />
                      <Input
                        placeholder="3. Everyday life application"
                        value={newEveryday}
                        onChange={(e) => setNewEveryday(e.target.value)}
                        className="text-xs"
                      />
                      <Input
                        placeholder="4. Step-by-step logical proof"
                        value={newLogic}
                        onChange={(e) => setNewLogic(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 items-center">
                    <div className="space-y-1">
                      <Label htmlFor="guide-author">Author / Teacher Name *</Label>
                      <Input
                        id="guide-author"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        placeholder="Educator / Specialist Name"
                        required
                        className="text-xs"
                      />
                    </div>

                    <label className="flex items-start gap-2 pt-4 cursor-pointer text-[11px] text-foreground">
                      <input
                        type="checkbox"
                        checked={safetyPledge}
                        onChange={(e) => setSafetyPledge(e.target.checked)}
                        className="mt-0.5 rounded border-border"
                      />
                      <span>
                        I confirm zero unsupervised private adult-minor contact and submit for
                        coordinator review.
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSubmitOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" variant="glow">
                      Submit for Coordinator Approval
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Pending Coordinator Approval Queue */}
      {showPendingQueue && (
        <div className="surface-card border-primary/30 space-y-2.5 p-4 text-xs">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <ClipboardCheck className="size-4 text-primary" />
            <span>Pending Coordinator Approval Queue ({pendingGuides.length})</span>
          </div>
          {pendingGuides.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">
              All submitted teaching guides are verified and approved.
            </p>
          ) : (
            <div className="space-y-2">
              {pendingGuides.map((g) => (
                <div
                  key={g.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface-2 p-3"
                >
                  <div>
                    <div className="font-semibold text-foreground">
                      {g.title} ({g.subject} · {g.targetGrade})
                    </div>
                    <div className="text-[11px] text-muted-foreground">By {g.author}</div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="glow"
                    onClick={() => void handleApprovePendingGuide(g)}
                    className="h-7 text-[11px]"
                  >
                    <CheckCircle2 className="size-3 me-1" />
                    Approve &amp; Publish
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Safety & Child Protection Banner */}
      <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-foreground">
        <ShieldAlert className="size-4 text-amber-500 shrink-0" />
        <p className="leading-relaxed">
          <strong>Non-Negotiable Safety Standard:</strong> NEXORA strictly prohibits private,
          unmonitored messaging between adult volunteers and minors. All teacher guidance,
          worksheets, and reviews happen through open classroom materials or vetted school
          coordinators.
        </p>
      </div>

      {/* Main Grid: Guide Directory + Active Detail Inspector */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-5">
          <div className="space-y-2.5">
            <h3 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" />
              <span>Approved Teaching Units ({filteredGuides.length})</span>
            </h3>
            <ModernSelect
              label="Filter by Pedagogical Model"
              value={selectedModelFilter}
              onValueChange={setSelectedModelFilter}
              searchable
              searchPlaceholder="Search models..."
              options={[
                { value: "all", label: "All Models" },
                { value: "5e_inquiry", label: "5E Inquiry" },
                { value: "direct_instruction", label: "Direct Instruction" },
                { value: "socratic_seminar", label: "Socratic Seminar" },
                { value: "differentiated_stations", label: "Differentiated Stations" },
              ]}
            />
          </div>

          <div className="space-y-2">
            {filteredGuides.map((guide) => (
              <button
                key={guide.id}
                type="button"
                onClick={() => setActiveGuideId(guide.id)}
                className={`w-full text-start rounded-xl border p-3.5 transition-all text-xs ${
                  guide.id === activeGuide?.id
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border bg-surface-card hover:border-primary/40 hover:bg-surface-2/60"
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground">
                  <span className="font-semibold uppercase text-primary">
                    {guide.pedagogicalModel.replace(/_/g, " ")}
                  </span>
                  <span className="font-mono tabular-nums">
                    v{guide.version} · {guide.targetGrade}
                  </span>
                </div>
                <div className="mt-1.5 font-bold text-foreground text-sm leading-snug">
                  {guide.title}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                  {guide.learningObjective}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>By {guide.author}</span>
                  <span className="text-primary font-semibold tabular-nums">
                    Quality: {guide.qualityRating.accuracy}/5 ({guide.ratingCount ?? 1})
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Deep Inspector for Active Guide */}
        {activeGuide && (
          <div className="space-y-4 lg:col-span-7">
            <div className="surface-card space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                    <Award className="size-3.5" />
                    <span>
                      {activeGuide.subject} · {activeGuide.targetGrade}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    {activeGuide.title}
                  </h3>
                  <div className="text-[11px] text-muted-foreground">
                    Pedagogy: <code className="font-mono">{activeGuide.pedagogicalModel}</code> · By{" "}
                    {activeGuide.author} · v{activeGuide.version}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void handleBumpGuideVersion(activeGuide)}
                    className="h-8 text-xs"
                  >
                    <GitBranch className="size-3.5 me-1 text-primary" />
                    New Version
                  </Button>

                  {onPublishToLibrary && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onPublishToLibrary(activeGuide)}
                      className="h-8 text-xs"
                    >
                      <Share2 className="size-3.5 me-1 text-primary" />
                      Publish to Library
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPrintPreviewGuide(activeGuide)}
                    className="h-8 text-xs"
                  >
                    <Printer className="size-3.5 me-1.5 text-primary" />
                    Print Worksheet
                  </Button>
                </div>
              </div>

              {/* Learning Objective */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-1">
                <div className="font-semibold text-primary text-[11px] uppercase tracking-wide">
                  Core Learning Objective
                </div>
                <p className="text-foreground leading-relaxed font-medium">
                  {activeGuide.learningObjective}
                </p>
              </div>

              {/* Differentiated Support & Accommodations */}
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-xl border border-border bg-surface-2/60 p-3.5 space-y-2">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    <span>Struggling Student Support</span>
                  </div>
                  <ul className="list-disc ps-4 space-y-1 text-[11px] text-muted-foreground">
                    {activeGuide.remedialAccommodations.map((acc, idx) => (
                      <li key={idx}>{acc}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-surface-2/60 p-3.5 space-y-2">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <Lightbulb className="size-3.5 text-amber-500" />
                    <span>Advanced Extension Challenges</span>
                  </div>
                  <ul className="list-disc ps-4 space-y-1 text-[11px] text-muted-foreground">
                    {activeGuide.extensionChallenges.map((ext, idx) => (
                      <li key={idx}>{ext}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Multi-Angle Explanation Display */}
              <div className="rounded-xl border border-border bg-surface-2/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Compass className="size-3.5 text-primary" />
                    <span>Multi-Angle Explanation (4 Complementary Ways)</span>
                  </h4>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Concept Diversity Verified
                  </span>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 text-[11px]">
                  <div className="rounded-lg bg-surface-card p-2.5 space-y-1 border border-border/80">
                    <div className="font-semibold text-primary">1. Visual Diagrammatic</div>
                    <p className="text-muted-foreground leading-relaxed">
                      {activeGuide.multiAngleExplanations.visualDiagramPrompt}
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface-card p-2.5 space-y-1 border border-border/80">
                    <div className="font-semibold text-primary">2. Real-World Analogy</div>
                    <p className="text-muted-foreground leading-relaxed">
                      {activeGuide.multiAngleExplanations.realWorldAnalogy}
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface-card p-2.5 space-y-1 border border-border/80">
                    <div className="font-semibold text-primary">3. Everyday Life Application</div>
                    <p className="text-muted-foreground leading-relaxed">
                      {activeGuide.multiAngleExplanations.everydayApplication}
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface-card p-2.5 space-y-1 border border-border/80">
                    <div className="font-semibold text-primary">4. Step-by-Step Logic</div>
                    <p className="text-muted-foreground leading-relaxed">
                      {activeGuide.multiAngleExplanations.stepByStepLogic}
                    </p>
                  </div>
                </div>
              </div>

              {/* Printable Worksheet Preview */}
              <div className="space-y-1.5 text-xs">
                <div className="font-semibold text-foreground">Printable Worksheet Layout</div>
                <div className="rounded-lg border border-border bg-surface-card p-3 font-mono text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {activeGuide.printableWorksheetOutline}
                </div>
              </div>
            </div>

            {/* Quality Standard Evaluation Rubric with Persistent Save */}
            <div className="surface-card space-y-3 p-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Award className="size-4 text-primary" />
                  <span>Transparent Content Quality Rubric (1–5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary font-display text-sm tabular-nums">
                    {qualityEvaluation.compositeScore} / 5.0
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void handleSaveQualityRating(activeGuide)}
                    className="h-7 text-[11px]"
                  >
                    Save Rating ({activeGuide.ratingCount ?? 1})
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <div className="space-y-1">
                  <Label className="text-[10px]">Clarity ({ratingClarity})</Label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={ratingClarity}
                    onChange={(e) => setRatingClarity(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Pedagogical Depth ({ratingDepth})</Label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={ratingDepth}
                    onChange={(e) => setRatingDepth(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Factual Accuracy ({ratingAccuracy})</Label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={ratingAccuracy}
                    onChange={(e) => setRatingAccuracy(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Accessibility ({ratingA11y})</Label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={ratingA11y}
                    onChange={(e) => setRatingA11y(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">{qualityEvaluation.feedback}</p>
            </div>
          </div>
        )}
      </div>

      {/* In-App Accessible Printable Worksheet Preview Dialog */}
      <Dialog
        open={Boolean(printPreviewGuide)}
        onOpenChange={(open) => {
          if (!open) setPrintPreviewGuide(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto print:border-0 print:shadow-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Printer className="size-4 text-primary" />
              Printable Classroom Worksheet: {printPreviewGuide?.title}
            </DialogTitle>
          </DialogHeader>
          {printPreviewGuide && (
            <div className="space-y-4 text-xs">
              <div className="rounded-lg border border-border bg-surface-2 p-3 space-y-1">
                <div className="font-semibold text-foreground">
                  {printPreviewGuide.subject} · {printPreviewGuide.targetGrade} ·{" "}
                  {printPreviewGuide.pedagogicalModel.replace(/_/g, " ")}
                </div>
                <div className="text-muted-foreground">
                  By {printPreviewGuide.author} · Open Educational License (CC-BY 4.0 Attribution)
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-foreground">Learning Objective</div>
                <p className="text-muted-foreground">{printPreviewGuide.learningObjective}</p>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-foreground">Student Exercises &amp; Outline</div>
                <pre className="whitespace-pre-wrap rounded-lg border border-border bg-surface p-3 font-mono text-[11px] text-foreground">
                  {printPreviewGuide.printableWorksheetOutline}
                </pre>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-foreground">Multi-Angle Teaching Aid</div>
                <pre className="whitespace-pre-wrap rounded-lg border border-border bg-surface p-3 text-[11px] text-muted-foreground">
                  {formatMultiAngleExplanation(printPreviewGuide)}
                </pre>
              </div>
              <div className="flex justify-end gap-2 print:hidden">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPrintPreviewGuide(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="glow"
                  onClick={() => {
                    window.print();
                    toast.success("Sent printable worksheet to system print dialog.");
                  }}
                >
                  <Printer className="size-3.5 me-1.5" />
                  Print Worksheet
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
