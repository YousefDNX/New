import { useState } from "react";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  FlaskConical,
  Globe2,
  HeartHandshake,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { REAL_WORLD_CHALLENGES, type RealWorldChallenge } from "@/data/curriculum-and-challenges";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

export function ScienceFairAndImpactPanel() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: eco, update: updateEco } = useStudentEcosystem();

  // #36 Science Fair Builder
  const [sfTitle, setSfTitle] = useState("");
  const [sfQuestion, setSfQuestion] = useState("");
  const [sfHypothesis, setSfHypothesis] = useState("");
  const [sfMaterials, setSfMaterials] = useState("");
  const [sfObservations, setSfObservations] = useState("");

  // #38 Community Impact Projects
  const [ciTitle, setCiTitle] = useState("");
  const [ciNeed, setCiNeed] = useState("");
  const [ciBeneficiaries, setCiBeneficiaries] = useState("");
  const [ciSupervisor, setCiSupervisor] = useState("");
  const [ciSupervisedConfirm, setCiSupervisedConfirm] = useState(false);
  const [outcomeDrafts, setOutcomeDrafts] = useState<Record<string, string>>({});

  // Real-World Challenges (#17)
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(
    REAL_WORLD_CHALLENGES[0]!.id,
  );
  const [rwcEvidence, setRwcEvidence] = useState("");
  const [rwcReflection, setRwcReflection] = useState("");

  const activeChallenge: RealWorldChallenge =
    REAL_WORLD_CHALLENGES.find((c) => c.id === selectedChallengeId) ?? REAL_WORLD_CHALLENGES[0]!;
  const challengeRecord = eco.completedRealChallenges[activeChallenge.id];

  const handleSaveScienceFair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sfTitle.trim() || !sfQuestion.trim()) return;
    updateEco((prev) => ({
      ...prev,
      scienceFairProjects: [
        {
          id: `sf_${Date.now().toString(36)}`,
          title: sfTitle.trim(),
          question: sfQuestion.trim(),
          hypothesis: sfHypothesis.trim() || "To be tested",
          safeMaterials: sfMaterials.trim() || "Safe household / school kit materials only",
          safeProcedure: "Measure variables repeatedly and log controlled trials.",
          observations: sfObservations.trim(),
          conclusion: "Pending full fair poster review",
          createdAt: new Date().toISOString(),
        },
        ...prev.scienceFairProjects,
      ],
    }));
    setSfTitle("");
    setSfQuestion("");
    setSfHypothesis("");
    setSfMaterials("");
    setSfObservations("");
    toast.success("Saved Science Fair investigation plan");
  };

  const handleSaveCommunityImpact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ciTitle.trim() || !ciNeed.trim()) return;
    if (!ciSupervisedConfirm || !ciSupervisor.trim()) {
      toast.error(
        isAr
          ? "يرجى إدخال اسم المشرف البالغ أو المعلم وتأكيد الإشراف السلامي أولاً."
          : "Please list a teacher/parent supervisor and confirm adult safety review.",
      );
      return;
    }
    updateEco((prev) => ({
      ...prev,
      communityProjects: [
        {
          id: `ci_${Date.now().toString(36)}`,
          title: ciTitle.trim(),
          need: ciNeed.trim(),
          intendedBeneficiaries: ciBeneficiaries.trim() || "Local school peers",
          measuredOutcome: "",
          supervisorName: ciSupervisor.trim(),
          adultSupervised: true,
          milestones: [
            { title: "Supervisor & school coordinator sign-off", done: true },
            { title: "Prepare resource kit & schedule", done: false },
            { title: "Document measurable community outcome", done: false },
          ],
          impactReflection: "",
          createdAt: new Date().toISOString(),
        },
        ...prev.communityProjects,
      ],
    }));
    setCiTitle("");
    setCiNeed("");
    setCiBeneficiaries("");
    setCiSupervisor("");
    setCiSupervisedConfirm(false);
    toast.success("Created supervised Community Impact project plan");
  };

  const handleSubmitRealWorldChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rwcEvidence.trim() || !rwcReflection.trim()) {
      toast.error("Add both your deliverable evidence summary and your reflection.");
      return;
    }
    const nowIso = new Date().toISOString();
    const portfolioId = `rwc_port_${activeChallenge.id}`;

    updateEco((prev) => {
      const existingProjects = prev.portfolio.projects.filter((p) => p.id !== portfolioId);
      return {
        ...prev,
        completedRealChallenges: {
          ...prev.completedRealChallenges,
          [activeChallenge.id]: {
            evidenceSummary: rwcEvidence.trim(),
            reflection: rwcReflection.trim(),
            completedAt: nowIso,
          },
        },
        portfolio: {
          ...prev.portfolio,
          projects: [
            {
              id: portfolioId,
              title: activeChallenge.title,
              category: `Real-World Challenge · ${activeChallenge.domain}`,
              summary: `${rwcEvidence.trim()} — Reflection: ${rwcReflection.trim()}`,
              stepsCompleted: activeChallenge.evaluationCriteria.length,
              totalSteps: activeChallenge.evaluationCriteria.length,
              showcaseOptIn: false,
              createdAt: nowIso,
            },
            ...existingProjects,
          ],
        },
      };
    });
    setRwcEvidence("");
    setRwcReflection("");
    toast.success(
      `Submitted "${activeChallenge.title}" and saved an artifact into your Student Portfolio!`,
    );
  };

  return (
    <div className="space-y-6" data-testid="science-fair-impact-panel">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* #36 SCIENCE FAIR BUILDER */}
        <form onSubmit={handleSaveScienceFair} className="surface-card p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="size-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                36. Science Fair Project Builder
              </h3>
            </div>
            <FeatureGuideTrigger featureId="science-fair-impact" iconOnly />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-foreground">
            <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
            <span>
              Use safe school-approved materials only; never attempt hazardous chemicals or open
              flames unsupervised.
            </span>
          </div>
          <Input
            value={sfTitle}
            onChange={(e) => setSfTitle(e.target.value)}
            placeholder="Project Title (e.g., Reflective Roof Paint Cooling Test)"
            className="text-xs"
          />
          <Input
            value={sfQuestion}
            onChange={(e) => setSfQuestion(e.target.value)}
            placeholder="Research Question"
            className="text-xs"
          />
          <Input
            value={sfHypothesis}
            onChange={(e) => setSfHypothesis(e.target.value)}
            placeholder="Testable Hypothesis (If... then...)"
            className="text-xs"
          />
          <Input
            value={sfMaterials}
            onChange={(e) => setSfMaterials(e.target.value)}
            placeholder="Safe Materials List"
            className="text-xs"
          />
          <Textarea
            rows={2}
            value={sfObservations}
            onChange={(e) => setSfObservations(e.target.value)}
            placeholder="Initial data readings & observations..."
            className="text-xs"
          />
          <Button type="submit" size="sm" className="h-8 text-xs">
            <Plus className="size-3.5 me-1" />
            Save Science Fair Poster Plan
          </Button>

          {eco.scienceFairProjects.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-border">
              {eco.scienceFairProjects.map((p) => (
                <div key={p.id} className="rounded-lg bg-surface-2 p-2.5">
                  <div className="font-bold text-foreground">{p.title}</div>
                  <div className="text-muted-foreground">Q: {p.question}</div>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* #38 COMMUNITY IMPACT PROJECTS */}
        <form onSubmit={handleSaveCommunityImpact} className="surface-card p-5 space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <HeartHandshake className="size-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              38. Community Impact Project Planner
            </h3>
          </div>
          <p className="text-muted-foreground">
            Plan safe, school-coordinated initiatives (peer tutoring, book drives, campus
            recycling). Requires adult supervisor sign-off.
          </p>
          <Input
            value={ciTitle}
            onChange={(e) => setCiTitle(e.target.value)}
            placeholder="Initiative Title (e.g., Grade 7 Peer Math Mentoring)"
            className="text-xs"
          />
          <Input
            value={ciNeed}
            onChange={(e) => setCiNeed(e.target.value)}
            placeholder="Real School / Neighborhood Need Addressed"
            className="text-xs"
          />
          <Input
            value={ciBeneficiaries}
            onChange={(e) => setCiBeneficiaries(e.target.value)}
            placeholder="Intended Beneficiaries (e.g., Grade 7 STEM learners)"
            className="text-xs"
          />
          <Input
            value={ciSupervisor}
            onChange={(e) => setCiSupervisor(e.target.value)}
            placeholder="Required Adult / Teacher Supervisor Name"
            className="text-xs"
          />
          <label className="flex items-start gap-2 rounded-lg border border-border bg-surface-2/60 p-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={ciSupervisedConfirm}
              onChange={(e) => setCiSupervisedConfirm(e.target.checked)}
              className="mt-0.5 accent-primary"
            />
            <span>
              I confirm this activity follows school safety guidelines and includes adult/teacher
              supervision.
            </span>
          </label>
          <Button type="submit" size="sm" className="h-8 text-xs">
            <Plus className="size-3.5 me-1" />
            Launch Supervised Impact Plan
          </Button>

          {eco.communityProjects.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              {eco.communityProjects.map((c) => (
                <div key={c.id} className="rounded-lg bg-surface-2 p-2.5 space-y-1.5">
                  <div className="font-bold text-foreground">{c.title}</div>
                  <div className="text-muted-foreground">
                    Supervisor: {c.supervisorName} · Beneficiaries:{" "}
                    {c.intendedBeneficiaries || "School peers"} · Need: {c.need}
                  </div>
                  {c.measuredOutcome ? (
                    <div className="text-[11px] text-emerald-500">
                      Measured Outcome: {c.measuredOutcome}
                    </div>
                  ) : (
                    <div className="flex gap-1.5 pt-1">
                      <Input
                        value={outcomeDrafts[c.id] ?? ""}
                        onChange={(e) =>
                          setOutcomeDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))
                        }
                        placeholder="Record observed outcome (e.g., 14 students attended tutoring)..."
                        className="h-7 text-[11px]"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] shrink-0"
                        onClick={() => {
                          const outcome = outcomeDrafts[c.id]?.trim();
                          if (!outcome) return;
                          updateEco((prev) => ({
                            ...prev,
                            communityProjects: prev.communityProjects.map((p) =>
                              p.id === c.id ? { ...p, measuredOutcome: outcome } : p,
                            ),
                          }));
                          toast.success("Logged measured community outcome");
                        }}
                      >
                        Log Outcome
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* REAL-WORLD CHALLENGES (#17) */}
      <div className="surface-card p-5 space-y-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3">
          <div>
            <h3 className="text-base font-bold font-display text-foreground flex items-center gap-2">
              <Globe2 className="size-4 text-primary" />
              Real-World Student Challenges ({Object.keys(eco.completedRealChallenges).length}/
              {REAL_WORLD_CHALLENGES.length} Completed)
            </h3>
            <p className="text-muted-foreground">
              Safe, authentic community, environmental, STEM, digital wellness, and accessibility
              challenges saved directly to your Student Portfolio.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {REAL_WORLD_CHALLENGES.map((ch) => {
            const done = Boolean(eco.completedRealChallenges[ch.id]);
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => setSelectedChallengeId(ch.id)}
                className={`rounded-xl border px-3 py-1.5 text-start font-semibold transition-all ${
                  selectedChallengeId === ch.id
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                {done ? "✓ " : ""}
                {ch.domain}
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-3 rounded-xl border border-border bg-surface-2/60 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold">
                {activeChallenge.domain} · {activeChallenge.submissionType}
              </span>
              {challengeRecord && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                  <CheckCircle2 className="size-3.5" /> Completed
                </span>
              )}
            </div>
            <h4 className="font-display text-sm font-bold text-foreground">
              {activeChallenge.title}
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Problem Context:</strong>{" "}
              {activeChallenge.problemContext}
            </p>

            <div>
              <div className="font-bold text-foreground mb-1">Learning Goals:</div>
              <ul className="list-disc ps-4 space-y-0.5 text-muted-foreground">
                {activeChallenge.learningGoals.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-bold text-foreground mb-1">Required Subjects & Skills:</div>
              <div className="flex flex-wrap gap-1.5">
                {activeChallenge.requiredSubjectsAndSkills.map((sk) => (
                  <span
                    key={sk}
                    className="rounded-md border border-border bg-surface-1 px-2 py-0.5 text-[11px]"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface-1 p-3 space-y-1">
              <div>
                <strong className="text-foreground">Expected Deliverable:</strong>{" "}
                <span className="text-muted-foreground">{activeChallenge.deliverable}</span>
              </div>
              <div>
                <strong className="text-foreground">Evaluation Criteria:</strong>
                <ul className="list-disc ps-4 mt-1 text-muted-foreground space-y-0.5">
                  {activeChallenge.evaluationCriteria.map((ec) => (
                    <li key={ec}>{ec}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-foreground">
              <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Safety Rule:</strong> {activeChallenge.safetyNote}
              </span>
            </div>
          </div>

          <form
            onSubmit={handleSubmitRealWorldChallenge}
            className="lg:col-span-2 space-y-3 rounded-xl border border-border bg-surface-2/60 p-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <Award className="size-4 text-primary" />
                Submit Challenge Deliverable & Reflection
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground block">
                  Deliverable Evidence Summary ({activeChallenge.submissionType})
                </label>
                <Textarea
                  rows={3}
                  value={rwcEvidence}
                  onChange={(e) => setRwcEvidence(e.target.value)}
                  placeholder="Describe your measured check, prototype sketch, or 3-claim verification log..."
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground block">
                  Reflection Prompt: {activeChallenge.reflectionPrompt}
                </label>
                <Textarea
                  rows={3}
                  value={rwcReflection}
                  onChange={(e) => setRwcReflection(e.target.value)}
                  placeholder="Write an honest reflection on what changed your thinking..."
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button type="submit" size="sm" variant="glow" className="w-full h-8 text-xs">
                <CheckCircle2 className="size-3.5 me-1.5" />
                Complete Challenge & Add to Portfolio
              </Button>
              {challengeRecord && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-[11px]">
                  <div className="font-semibold text-emerald-500">Latest Saved Submission</div>
                  <div className="text-muted-foreground mt-0.5">
                    {challengeRecord.evidenceSummary}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
