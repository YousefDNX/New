import { useState } from "react";
import {
  BrainCircuit,
  CheckCircle2,
  GitBranch,
  MessageSquareQuote,
  Puzzle,
  Scale,
  SearchCheck,
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

type ThinkingTab = "decision" | "debate" | "ethics" | "media" | "argument" | "logic";

const DECISION_SCENARIOS = [
  {
    id: "dec_exam",
    title: "Exam Week Time Allocation vs. Club Hackathon",
    branches: [
      {
        label: "Pull two all-nighters to do both fully",
        immediate: "Short-term progress on hackathon prototype.",
        longTerm: "Severe sleep debt drops memory recall accuracy and exam synthesis.",
        tradeoff: "High burnout risk with weak academic outcome.",
      },
      {
        label: "Scope a lean MVP for hackathon (4h) + sleep 8h before exams",
        immediate: "Focused, bounded contribution to your team.",
        longTerm: "Preserves prefrontal recall for exams while shipping a real working core.",
        tradeoff: "Requires trimming optional stretch features early.",
      },
    ],
  },
];

const ETHICS_DILEMMAS = [
  {
    id: "eth_ai",
    title: "AI Study Tool vs. Independent Essay Authorship",
    perspectives: [
      "Efficiency view: Using AI for outlining speeds structural planning.",
      "Academic integrity view: Submitting unverified or AI-written prose misrepresents mastery and weakens writing skill.",
      "Balanced policy: Disclose outline/brainstorming assistance while authoring 100% of arguments and verifying citations manually.",
    ],
  },
  {
    id: "eth_privacy",
    title: "School App Analytics vs. Student Data Privacy",
    perspectives: [
      "Personalization view: Activity telemetry helps identify struggling topics faster.",
      "Privacy-by-design view: Sensitive personal reflections and care journals must remain private and excluded from analytics or AI prompts.",
    ],
  },
];

const MEDIA_EXERCISES = [
  {
    id: "med_1",
    headline:
      "Viral Post: 'New battery charges phones in 2 seconds with zero heat!' (No lab citation, unknown domain)",
    clues: [
      "Extraordinary physics claim without peer-reviewed paper",
      "No named university or testing methodology",
      "Urgency clickbait framing",
    ],
  },
  {
    id: "med_2",
    headline:
      "UNESCO Global Education Monitoring Report Summary (Dated 2025, linked methodology appendix)",
    clues: [
      "Named institutional publisher",
      "Transparent sample methodology",
      "Explicit date and limitations noted",
    ],
  },
];

const LOGIC_PUZZLES = [
  {
    id: "log_1",
    prompt:
      "All renewable microgrids reduce peak diesel use. Bay-7 is a renewable microgrid. What must follow?",
    options: [
      "Bay-7 reduces peak diesel use.",
      "Every city uses Bay-7.",
      "Diesel is completely eliminated worldwide.",
    ],
    correctIndex: 0,
    explanation: "Valid deductive Modus Ponens (All A are B; X is A -> X is B).",
  },
  {
    id: "log_2",
    prompt: "Find the next term in the sequence: 2, 6, 12, 20, 30, ___",
    options: ["36", "40", "42"],
    correctIndex: 2,
    explanation: "Differences grow by +2 each step (+4, +6, +8, +10, +12 -> 30 + 12 = 42).",
  },
  {
    id: "log_fallacy_1",
    prompt:
      "Fallacy Spotter: 'Students who bring laptops earn higher grades, so buying any expensive laptop automatically raises exam scores.' What reasoning flaw is this?",
    options: [
      "Correlation confused with causation + hidden socioeconomic/study-habit variables",
      "Valid transitive syllogism",
      "Proof by contradiction",
    ],
    correctIndex: 0,
    explanation:
      "Hidden confounding variables (resource access, study hours) can explain both ownership and grades without the device itself causing higher scores.",
  },
];

const DIGITAL_CITIZENSHIP_SCENARIOS = [
  {
    id: "dc_phishing",
    title: "Suspicious Scholarship Fee Link",
    prompt:
      "A direct message says you won an urgent scholarship and asks for your login password or an activation fee within 30 minutes.",
    safeAction:
      "Verify only via the institution's official .edu / .gov portal and never share passwords.",
  },
  {
    id: "dc_ai_cite",
    title: "Unverified AI-Generated Reference",
    prompt:
      "An AI summary outputs an impressive statistic and journal name for your history essay, but you haven't opened the source.",
    safeAction:
      "Locate and read the original publisher or dataset directly before citing, or remove the unverified claim.",
  },
  {
    id: "dc_privacy",
    title: "Collaborative Study Folder Privacy",
    prompt:
      "Uploading class notes to a public circle folder that accidentally includes a friend's phone number and home address.",
    safeAction:
      "Remove all personal contact info/PII before uploading shared educational resources.",
  },
];

export function ThinkingAnalysisStudio() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: eco, update: updateEco } = useStudentEcosystem();
  const [tab, setTab] = useState<ThinkingTab>("decision");

  const logThinkingRecord = (
    kind: "debate" | "ethics" | "argument" | "decision" | "media_audit" | "logic",
    topic: string,
    stance: string,
    summary: string,
  ) => {
    updateEco((prev) => ({
      ...prev,
      debateAndEthicsLogs: [
        {
          id: `th_${Date.now().toString(36)}`,
          kind,
          topic,
          stance,
          summary,
          createdAt: new Date().toISOString(),
        },
        ...prev.debateAndEthicsLogs,
      ].slice(0, 40),
    }));
    toast.success(
      isAr ? "تم توثيق التمرين في ملف إنجازاتك" : "Saved reasoning artifact to portfolio evidence",
    );
  };

  // #19 Decision
  const [selectedBranchIdx, setSelectedBranchIdx] = useState<number | null>(null);
  const [decisionReflection, setDecisionReflection] = useState("");

  // #20 Debate
  const [debateMotion, setDebateMotion] = useState(
    "Schools should replace timed memorization exams with open-resource applied projects.",
  );
  const [debatePro, setDebatePro] = useState(
    "Builds real research and synthesis skills closer to university and industry.",
  );
  const [debateCon, setDebateCon] = useState(
    "Harder to standardize grading equity without foundational recall benchmarks.",
  );
  const [debateScore, setDebateScore] = useState(4);

  // #21 Ethics
  const [ethicsReflection, setEthicsReflection] = useState("");

  // #22 Media Literacy
  const [mediaFlags, setMediaFlags] = useState<Record<string, "verify" | "reliable">>({});

  // #23 Argument Builder
  const [argClaim, setArgClaim] = useState("");
  const [argEvidence, setArgEvidence] = useState("");
  const [argCounter, setArgCounter] = useState("");
  const [argRebuttal, setArgRebuttal] = useState("");

  // #24 Logic Lab
  const [logicAnswers, setLogicAnswers] = useState<Record<string, number>>({});

  const tabs: Array<{ id: ThinkingTab; label: string; icon: typeof GitBranch }> = [
    { id: "decision", label: isAr ? "محاكي القرارات" : "19. Decisions", icon: GitBranch },
    { id: "debate", label: isAr ? "ساحة المناظرة" : "20. Debate Arena", icon: MessageSquareQuote },
    { id: "ethics", label: isAr ? "معضلات أخلاقية" : "21. Ethics", icon: Scale },
    { id: "media", label: isAr ? "الوعي الإعلامي" : "22. Media Literacy", icon: SearchCheck },
    { id: "argument", label: isAr ? "بناء الحجة" : "23. Argument", icon: BrainCircuit },
    { id: "logic", label: isAr ? "مختبر المنطق" : "24. Logic Lab", icon: Puzzle },
  ];

  const argCompleteness = [argClaim, argEvidence, argCounter, argRebuttal].filter(
    (s) => s.trim().length > 8,
  ).length;

  return (
    <div className="surface-card p-5 space-y-4" data-testid="thinking-analysis-studio">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold font-display text-foreground">
            {isAr ? "منظومة التفكير والتحليل النقدي" : "Critical Thinking, Debate & Ethics Studio"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "تدرب على تحليل العواقب، المناظرة الموزونة، الأخلاقيات التقنية، التحقق من المصادر، وبناء الحجج."
              : "Explore multi-branch decisions, prepare balanced Pro/Con debates, analyze ethical trade-offs, verify sources, and solve formal logic."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono tabular-nums text-xs font-semibold text-primary">
            {eco.debateAndEthicsLogs.length} {isAr ? "سجلات تحليلية" : "logged analyses"}
          </span>
          <FeatureGuideTrigger featureId="thinking-studio" />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                tab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-2 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* #19 DECISION SIMULATOR */}
      {tab === "decision" && (
        <div className="space-y-3 text-xs">
          <h3 className="text-sm font-bold text-foreground">{DECISION_SCENARIOS[0]!.title}</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {DECISION_SCENARIOS[0]!.branches.map((branch, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedBranchIdx(idx)}
                className={`rounded-xl border p-3.5 text-start space-y-1.5 transition-colors ${
                  selectedBranchIdx === idx
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface-2/60 hover:border-primary/40"
                }`}
              >
                <div className="font-bold text-foreground">{branch.label}</div>
                {selectedBranchIdx === idx && (
                  <div className="space-y-1 text-muted-foreground pt-1">
                    <div>
                      <strong className="text-foreground">Immediate:</strong> {branch.immediate}
                    </div>
                    <div>
                      <strong className="text-foreground">Downstream:</strong> {branch.longTerm}
                    </div>
                    <div className="text-primary font-medium">Trade-off: {branch.tradeoff}</div>
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Input
              value={decisionReflection}
              onChange={(e) => setDecisionReflection(e.target.value)}
              placeholder="Write what trade-off matters most in your situation..."
              className="flex-1 text-xs"
            />
            <Button
              type="button"
              size="sm"
              onClick={() =>
                logThinkingRecord(
                  "decision",
                  DECISION_SCENARIOS[0]!.title,
                  selectedBranchIdx === 1 ? "Scoped balance" : "Selected path",
                  decisionReflection || "Evaluated immediate vs downstream consequences",
                )
              }
              className="h-9 text-xs"
            >
              Log Decision Reflection
            </Button>
          </div>
        </div>
      )}

      {/* #20 DEBATE ARENA */}
      {tab === "debate" && (
        <div className="space-y-3 text-xs">
          <Input
            value={debateMotion}
            onChange={(e) => setDebateMotion(e.target.value)}
            placeholder="Debate motion..."
            className="text-xs font-semibold"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <span className="font-bold text-emerald-400">Proposition (For)</span>
              <Textarea
                rows={3}
                value={debatePro}
                onChange={(e) => setDebatePro(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <span className="font-bold text-rose-400">Opposition (Against)</span>
              <Textarea
                rows={3}
                value={debateCon}
                onChange={(e) => setDebateCon(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-2 font-mono">
              <span>Evidence & Rebuttal Rubric Score: {debateScore}/5</span>
              <input
                type="range"
                min={1}
                max={5}
                value={debateScore}
                onChange={(e) => setDebateScore(Number(e.target.value))}
                className="accent-primary"
              />
            </label>
            <Button
              type="button"
              size="sm"
              onClick={() =>
                logThinkingRecord(
                  "debate",
                  debateMotion,
                  `Score ${debateScore}/5`,
                  `${debatePro} | Counter: ${debateCon}`,
                )
              }
              className="h-7 text-xs"
            >
              Save Debate Brief
            </Button>
          </div>
        </div>
      )}

      {/* #21 ETHICAL DILEMMAS */}
      {tab === "ethics" && (
        <div className="space-y-3 text-xs">
          <div className="grid gap-3 md:grid-cols-2">
            {ETHICS_DILEMMAS.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2"
              >
                <h3 className="font-bold text-foreground">{item.title}</h3>
                <ul className="space-y-1 text-muted-foreground list-disc ps-4">
                  {item.perspectives.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Input
              value={ethicsReflection}
              onChange={(e) => setEthicsReflection(e.target.value)}
              placeholder="Note why both stakeholder viewpoints carry real merit..."
              className="flex-1 text-xs"
            />
            <Button
              type="button"
              size="sm"
              onClick={() =>
                logThinkingRecord(
                  "ethics",
                  "Digital & Academic Ethics",
                  "Multi-stakeholder synthesis",
                  ethicsReflection || "Balanced efficiency and integrity perspectives",
                )
              }
              className="h-9 text-xs"
            >
              Save Ethics Reflection
            </Button>
          </div>
        </div>
      )}

      {/* #22 MEDIA LITERACY LAB */}
      {tab === "media" && (
        <div className="space-y-3 text-xs">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-foreground">
            Important: Neither checklists nor automated tools can guarantee truth alone — always
            perform lateral reading across primary institutional sources.
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {MEDIA_EXERCISES.map((ex) => {
              const choice = mediaFlags[ex.id];
              return (
                <div
                  key={ex.id}
                  className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2"
                >
                  <div className="font-semibold text-foreground">{ex.headline}</div>
                  <ul className="text-[11px] text-muted-foreground list-disc ps-4">
                    {ex.clues.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                  <div className="flex gap-1.5 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={choice === "verify" ? "default" : "outline"}
                      onClick={() => {
                        setMediaFlags((p) => ({ ...p, [ex.id]: "verify" }));
                        logThinkingRecord(
                          "media_audit",
                          ex.headline,
                          "Flagged to verify",
                          "Applied lateral reading",
                        );
                      }}
                      className="h-7 text-xs"
                    >
                      Needs Primary Verification
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={choice === "reliable" ? "default" : "outline"}
                      onClick={() => {
                        setMediaFlags((p) => ({ ...p, [ex.id]: "reliable" }));
                        logThinkingRecord(
                          "media_audit",
                          ex.headline,
                          "Traceable methodology",
                          "Checked publisher provenance",
                        );
                      }}
                      className="h-7 text-xs"
                    >
                      Traceable Methodology
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Digital Citizenship & Defensive Cyber Hygiene Drills */}
          <div className="rounded-xl border border-primary/25 bg-surface-2/40 p-4 space-y-2.5">
            <h3 className="font-display text-sm font-bold text-foreground">
              Digital Citizenship, Privacy &amp; AI Verification Checklist
            </h3>
            <div className="grid gap-2.5 md:grid-cols-3">
              {DIGITAL_CITIZENSHIP_SCENARIOS.map((sc) => (
                <div
                  key={sc.id}
                  className="rounded-lg border border-border bg-surface-1 p-3 space-y-1.5"
                >
                  <div className="font-bold text-foreground">{sc.title}</div>
                  <p className="text-[11px] text-muted-foreground">{sc.prompt}</p>
                  <p className="text-[11px] text-emerald-400 font-medium">
                    Safe Practice: {sc.safeAction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* #23 ARGUMENT BUILDER */}
      {tab === "argument" && (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between font-mono">
            <span className="font-sans font-semibold text-foreground">
              Claim → Evidence → Counterargument → Rebuttal
            </span>
            <span className="text-primary font-bold">{argCompleteness}/4 sections drafted</span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <Input
              value={argClaim}
              onChange={(e) => setArgClaim(e.target.value)}
              placeholder="1. Central Claim..."
              className="text-xs"
            />
            <Input
              value={argEvidence}
              onChange={(e) => setArgEvidence(e.target.value)}
              placeholder="2. Empirical Evidence & Source..."
              className="text-xs"
            />
            <Input
              value={argCounter}
              onChange={(e) => setArgCounter(e.target.value)}
              placeholder="3. Strongest Counterargument..."
              className="text-xs"
            />
            <Input
              value={argRebuttal}
              onChange={(e) => setArgRebuttal(e.target.value)}
              placeholder="4. Evidence-Based Rebuttal..."
              className="text-xs"
            />
          </div>
          <Button
            type="button"
            size="sm"
            disabled={argCompleteness < 2}
            onClick={() =>
              logThinkingRecord(
                "argument",
                argClaim || "Structured Essay Argument",
                `${argCompleteness}/4 completeness`,
                `Evidence: ${argEvidence} | Rebuttal: ${argRebuttal}`,
              )
            }
            className="h-7 text-xs"
          >
            <CheckCircle2 className="size-3.5 me-1" />
            Save Argument Essay Outline
          </Button>
        </div>
      )}

      {/* #24 LOGIC LAB */}
      {tab === "logic" && (
        <div className="grid gap-3 md:grid-cols-2 text-xs">
          {LOGIC_PUZZLES.map((puz) => {
            const picked = logicAnswers[puz.id];
            const isCorrect = picked === puz.correctIndex;
            return (
              <div
                key={puz.id}
                className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2.5"
              >
                <p className="font-semibold text-foreground">{puz.prompt}</p>
                <div className="space-y-1.5">
                  {puz.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setLogicAnswers((prev) => ({ ...prev, [puz.id]: idx }));
                        if (idx === puz.correctIndex) {
                          logThinkingRecord("logic", puz.id, "Solved", puz.explanation);
                        }
                      }}
                      className={`w-full rounded-lg border px-2.5 py-1.5 text-start ${
                        picked === idx
                          ? isCorrect
                            ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                            : "border-rose-500 bg-rose-500/15 text-rose-400"
                          : "border-border bg-surface-1 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {picked !== undefined && (
                  <p className="text-[11px] text-muted-foreground">{puz.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
