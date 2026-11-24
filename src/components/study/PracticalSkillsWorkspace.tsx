import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  CheckCircle2,
  Coins,
  Download,
  Keyboard,
  Laptop,
  ListChecks,
  Pause,
  Play,
  Presentation,
  RotateCcw,
  SearchCheck,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CRITICAL_THINKING_CASES,
  DIGITAL_RESEARCH_CASES,
  PRESENTATION_TEMPLATES,
  TYPING_DRILLS,
  evaluateTypingSessionForDevice,
  formatAcademicCitation,
  type DigitalSourceCase,
  type TypingDeviceMode,
} from "@/data/practical-skills";
import {
  STUDENT_FINANCIAL_SCENARIOS,
  computeBudgetHealth,
  computeCompoundSavings,
} from "@/lib/empowerment-engines";
import { useTaskActions } from "@/hooks/use-nexora";
import { usePrefs } from "@/lib/preferences";
import { downloadTextFile } from "@/lib/safe-file";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

type PracticalTab =
  "typing" | "research" | "presentation" | "financial" | "eisenhower" | "critical";

interface MatrixItem {
  id: string;
  title: string;
  quadrant: "do_first" | "schedule" | "delegate" | "eliminate";
}

export function PracticalSkillsWorkspace() {
  const { lang } = usePrefs();
  const { state, update } = useStudentEcosystem();
  const { addTask } = useTaskActions();

  const [tab, setTab] = useState<PracticalTab>("typing");

  // 1. Typing Lab State (Desktop Hardware vs Mobile Touch separation)
  const [deviceMode, setDeviceMode] = useState<TypingDeviceMode>(() => {
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      return window.matchMedia("(pointer: coarse)").matches ? "mobile" : "desktop";
    }
    return "desktop";
  });
  const [drillIdx, setDrillIdx] = useState(0);
  const activeDrill = TYPING_DRILLS[drillIdx] ?? TYPING_DRILLS[0]!;
  const [typedText, setTypedText] = useState("");
  const [startMs, setStartMs] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [sessionSaved, setSessionSaved] = useState(false);

  useEffect(() => {
    if (!startMs || sessionSaved) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [startMs, sessionSaved]);

  const elapsedMs = startMs ? Math.max(1000, nowMs - startMs) : 0;
  const typingMetrics = useMemo(
    () =>
      evaluateTypingSessionForDevice(
        activeDrill.text,
        typedText,
        elapsedMs,
        deviceMode,
        activeDrill.targetWpm,
      ),
    [activeDrill.text, activeDrill.targetWpm, typedText, elapsedMs, deviceMode],
  );

  const handleTypingChange = (val: string) => {
    if (!startMs && val.length > 0) {
      const t0 = Date.now();
      setStartMs(t0);
      setNowMs(t0);
    }
    setTypedText(val);
    const snapshot = evaluateTypingSessionForDevice(
      activeDrill.text,
      val,
      startMs ? Math.max(1000, Date.now() - startMs) : 1000,
      deviceMode,
      activeDrill.targetWpm,
    );
    if (snapshot.completed && !sessionSaved) {
      setSessionSaved(true);
      update((prev) => ({
        ...prev,
        typingHistory: [
          {
            id: `typ_${Date.now().toString(36)}`,
            drillId: activeDrill.id,
            title: activeDrill.title,
            wpm: snapshot.wpm,
            accuracyPct: snapshot.accuracyPct,
            deviceMode,
            date: new Date().toISOString(),
          },
          ...prev.typingHistory,
        ].slice(0, 20),
      }));
      toast.success(
        `${deviceMode === "mobile" ? "Mobile Touch" : "Desktop Keyboard"} Drill Completed! ${snapshot.wpm} WPM at ${snapshot.accuracyPct}% accuracy.`,
      );
    }
  };

  const resetTypingDrill = (nextIdx = drillIdx) => {
    setDrillIdx(nextIdx);
    setTypedText("");
    setStartMs(null);
    setSessionSaved(false);
  };

  const bestDesktopWpm = useMemo(
    () =>
      state.typingHistory
        .filter((r) => (r.deviceMode ?? "desktop") === "desktop")
        .reduce((mx, r) => Math.max(mx, r.wpm), 0),
    [state.typingHistory],
  );
  const bestMobileWpm = useMemo(
    () =>
      state.typingHistory
        .filter((r) => r.deviceMode === "mobile")
        .reduce((mx, r) => Math.max(mx, r.wpm), 0),
    [state.typingHistory],
  );

  // 2. Digital Research State
  const [researchGuesses, setResearchGuesses] = useState<
    Record<string, DigitalSourceCase["verdict"]>
  >({});
  const [citStyle, setCitStyle] = useState<"APA" | "MLA">("APA");
  const [citAuthor, setCitAuthor] = useState("Al-Sabah, L.");
  const [citYear, setCitYear] = useState("2026");
  const [citTitle, setCitTitle] = useState("Solar Desalination Efficiency in Coastal Cities");
  const [citPublisher, setCitPublisher] = useState("Gulf STEM Student Journal");
  const formattedCitation = useMemo(
    () =>
      formatAcademicCitation({
        style: citStyle,
        author: citAuthor,
        year: citYear,
        title: citTitle,
        publisher: citPublisher,
      }),
    [citStyle, citAuthor, citYear, citTitle, citPublisher],
  );

  // 3. Presentation Builder State
  const [presTplIdx, setPresTplIdx] = useState(0);
  const presTpl = PRESENTATION_TEMPLATES[presTplIdx] ?? PRESENTATION_TEMPLATES[0]!;
  const [presTitle, setPresTitle] = useState("Classroom Smart Energy Saver");
  const [presHook, setPresHook] = useState("");
  const [presThesis, setPresThesis] = useState("");
  const [presEvidence, setPresEvidence] = useState("");
  const [presCta, setPresCta] = useState("");

  const totalPresWords = useMemo(() => {
    const joined = `${presTitle} ${presHook} ${presThesis} ${presEvidence} ${presCta}`.trim();
    return joined ? joined.split(/\s+/).length : 0;
  }, [presTitle, presHook, presThesis, presEvidence, presCta]);
  const estSpeakingSec = Math.round((totalPresWords / 130) * 60);

  const exportPresentationMd = () => {
    const md = [
      `# ${presTitle}`,
      ``,
      `**Estimated Speaking Time (~130 WPM):** ~${estSpeakingSec} seconds (${totalPresWords} words)`,
      ``,
      `## 1. Opening Hook`,
      presHook || presTpl.hookPh,
      ``,
      `## 2. Core Thesis / Claim`,
      presThesis || presTpl.thesisPh,
      ``,
      `## 3. Evidence & Data`,
      presEvidence || presTpl.evidencePh,
      ``,
      `## 4. Call to Action`,
      presCta || presTpl.ctaPh,
    ].join("\n");
    downloadTextFile(md, "btc-presentation-outline.md", "text/markdown;charset=utf-8");
  };

  // 4. Eisenhower Productivity Matrix
  const [matrixTaskInput, setMatrixTaskInput] = useState("");
  const [matrixQuadInput, setMatrixQuadInput] = useState<MatrixItem["quadrant"]>("do_first");
  const [matrixItems, setMatrixItems] = useState<MatrixItem[]>([
    { id: "m1", title: "Finish tomorrow's Unit 3 spelling check", quadrant: "do_first" },
    { id: "m2", title: "Schedule 20-min science lab reading", quadrant: "schedule" },
  ]);

  const handleExportDoFirstTasks = async () => {
    const urgent = matrixItems.filter((i) => i.quadrant === "do_first");
    if (urgent.length === 0) {
      toast.info("Add at least one 'Do First' item to export to Tasks.");
      return;
    }
    try {
      for (const item of urgent) {
        await addTask({
          title: item.title,
          area: "productivity",
          priority: "high",
          details: "Prioritized via BTC Practical Skills Eisenhower Matrix",
        });
      }
      toast.success(`Exported ${urgent.length} Do-First item(s) to Tasks!`);
    } catch {
      toast.error("Sign in or open Tasks to sync tasks to your account.");
    }
  };

  // 5. Critical Thinking
  const [ctChoices, setCtChoices] = useState<Record<string, number>>({});

  // 6. Communication Rehearsal Timer & Rubric
  const [rehearseRunning, setRehearseRunning] = useState(false);
  const [rehearseSec, setRehearseSec] = useState(0);
  const [deliveryChecks, setDeliveryChecks] = useState<string[]>([]);

  useEffect(() => {
    if (!rehearseRunning) return;
    const id = window.setInterval(() => setRehearseSec((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [rehearseRunning]);

  // 7. Financial Literacy Academy
  const [newExpLabel, setNewExpLabel] = useState("");
  const [newExpAmount, setNewExpAmount] = useState("5");
  const [newExpCat, setNewExpCat] = useState<"needs" | "wants" | "savings">("needs");
  const [compInitial, setCompInitial] = useState(50);
  const [compAnnualPct, setCompAnnualPct] = useState(4);
  const [compMonths, setCompMonths] = useState(12);
  const [finChoices, setFinChoices] = useState<Record<string, number>>({});

  const budgetHealth = useMemo(
    () =>
      computeBudgetHealth({
        monthlyAllowance: state.financialLab.monthlyAllowance,
        monthlySavings: state.financialLab.monthlySavings,
        expenses: state.financialLab.expenses,
      }),
    [state.financialLab],
  );
  const savingsProjection = useMemo(
    () =>
      computeCompoundSavings({
        initialPrincipal: compInitial,
        monthlyContribution: state.financialLab.monthlySavings,
        annualRatePct: compAnnualPct,
        months: compMonths,
      }),
    [compInitial, state.financialLab.monthlySavings, compAnnualPct, compMonths],
  );

  return (
    <div className="space-y-5">
      <div className="surface-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-primary">
            {lang === "ar"
              ? "أكاديمية المهارات العملية والرقمية"
              : "Practical & Digital Life Skills Academy"}
          </div>
          <h2 className="mt-1 font-display text-lg font-bold text-foreground">
            Typing, Research, Public Speaking, Financial Literacy, Prioritization &amp; Logic
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <FeatureGuideTrigger featureId="practical-skills" />
          {(
            [
              { id: "typing", label: "Typing Lab", icon: Keyboard },
              { id: "research", label: "Digital Research", icon: SearchCheck },
              { id: "presentation", label: "Speaking & Slides", icon: Presentation },
              { id: "financial", label: "Financial Literacy", icon: Coins },
              { id: "eisenhower", label: "Time Matrix", icon: ListChecks },
              { id: "critical", label: "Critical Thinking", icon: Brain },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                type="button"
                size="sm"
                variant={tab === item.id ? "glow" : "outline"}
                onClick={() => setTab(item.id)}
                className="h-8 text-xs"
              >
                <Icon className="size-3.5" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: TYPING LAB */}
      {tab === "typing" && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="surface-card space-y-4 p-5 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
              <div
                className="flex flex-wrap items-center gap-1.5"
                data-testid="typing-device-toggle"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground me-1">
                  Input Mode:
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant={deviceMode === "desktop" ? "glow" : "outline"}
                  onClick={() => {
                    setDeviceMode("desktop");
                    resetTypingDrill(drillIdx);
                  }}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Laptop className="size-3.5" />
                  <span>Desktop Hardware Keyboard</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={deviceMode === "mobile" ? "glow" : "outline"}
                  onClick={() => {
                    setDeviceMode("mobile");
                    resetTypingDrill(drillIdx);
                  }}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Smartphone className="size-3.5" />
                  <span>Mobile Touch Keyboard</span>
                </Button>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => resetTypingDrill(drillIdx)}
                className="h-8 text-xs"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset</span>
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {TYPING_DRILLS.map((d, i) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => resetTypingDrill(i)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                    drillIdx === i
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d.title}
                </button>
              ))}
            </div>

            {/* Device-Specific Posture & Ergonomics Guidance */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
              <div className="font-semibold text-primary">
                {deviceMode === "desktop"
                  ? "Desktop 10-Finger Home Row Technique"
                  : "Mobile Two-Thumb Touch Technique (Calibrated 65% WPM Target)"}
              </div>
              <p className="mt-0.5 text-muted-foreground">
                {deviceMode === "desktop"
                  ? "Keep index fingers anchored on F & J bumps, wrists neutral above the desk, and look at the passage rather than the keys."
                  : "Hold the phone comfortably with both thumbs poised over the middle row; rely on clean thumb taps rather than rushing autocorrect."}
              </p>
            </div>

            {/* Live Metrics */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-lg border border-border bg-surface-2 p-2.5">
                <div className="text-[0.65rem] text-muted-foreground">Live WPM</div>
                <div className="font-display text-lg font-bold tabular-nums text-primary">
                  {typingMetrics.wpm}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface-2 p-2.5">
                <div className="text-[0.65rem] text-muted-foreground">Accuracy</div>
                <div className="font-display text-lg font-bold tabular-nums text-success">
                  {typingMetrics.accuracyPct}%
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface-2 p-2.5">
                <div className="text-[0.65rem] text-muted-foreground">Errors</div>
                <div className="font-display text-lg font-bold tabular-nums text-destructive">
                  {typingMetrics.errors}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface-2 p-2.5">
                <div className="text-[0.65rem] text-muted-foreground">
                  {deviceMode === "mobile" ? "Mobile Target" : "Desktop Target"}
                </div>
                <div className="font-display text-lg font-bold tabular-nums text-foreground">
                  {typingMetrics.adjustedTargetWpm} WPM
                </div>
              </div>
            </div>

            {/* Target Passage Highlighter */}
            <div className="rounded-xl border border-border bg-surface-2 p-4 font-mono text-sm leading-relaxed select-none">
              {activeDrill.text.split("").map((ch, idx) => {
                const typedCh = typedText[idx];
                let cls = "text-muted-foreground";
                if (typedCh !== undefined) {
                  cls =
                    typedCh === ch
                      ? "text-success font-semibold"
                      : "bg-destructive/20 text-destructive underline";
                } else if (idx === typedText.length) {
                  cls = "bg-primary/25 text-foreground underline";
                }
                return (
                  <span key={`${activeDrill.id}_${idx}`} className={cls}>
                    {ch}
                  </span>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="typing-input" className="text-xs">
                Start typing here (timer begins on your first character):
              </Label>
              <Textarea
                id="typing-input"
                rows={3}
                value={typedText}
                onChange={(e) => handleTypingChange(e.target.value)}
                placeholder="Type the passage above cleanly without skipping spaces..."
                className="font-mono text-sm"
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>

            {sessionSaved && (
              <div className="flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 p-3 text-xs font-semibold text-success">
                <CheckCircle2 className="size-4" />
                <span>
                  Drill complete! Logged {typingMetrics.wpm} WPM ({typingMetrics.accuracyPct}%
                  accuracy · {deviceMode === "mobile" ? "Mobile Touch" : "Desktop"}).
                </span>
              </div>
            )}
          </div>

          <div className="surface-card space-y-3 p-5">
            <h3 className="font-display text-sm font-bold text-foreground">
              Typing Benchmarks by Device
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-border bg-surface-2 p-2.5">
                <div className="text-[0.65rem] text-muted-foreground">Desktop PB</div>
                <div className="font-mono text-sm font-bold text-primary">
                  {bestDesktopWpm > 0 ? `${bestDesktopWpm} WPM` : "—"}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface-2 p-2.5">
                <div className="text-[0.65rem] text-muted-foreground">Mobile Touch PB</div>
                <div className="font-mono text-sm font-bold text-primary">
                  {bestMobileWpm > 0 ? `${bestMobileWpm} WPM` : "—"}
                </div>
              </div>
            </div>
            {state.typingHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Complete any passage above cleanly to record your verified WPM & accuracy history.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {state.typingHistory.slice(0, 8).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-foreground">{log.title}</div>
                      <div className="text-[0.65rem] text-muted-foreground">
                        {log.deviceMode === "mobile" ? "Mobile" : "Desktop"} ·{" "}
                        {log.date.slice(0, 10)} · {log.accuracyPct}% acc
                      </div>
                    </div>
                    <span className="font-mono font-bold text-primary">{log.wpm} WPM</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DIGITAL RESEARCH */}
      {tab === "research" && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="surface-card space-y-4 p-5 lg:col-span-2">
            <h3 className="font-display text-base font-bold text-foreground">
              Source Credibility Evaluation Lab
            </h3>
            <div className="space-y-3">
              {DIGITAL_RESEARCH_CASES.map((cs) => {
                const picked = researchGuesses[cs.id];
                const isCorrect = picked === cs.verdict;
                return (
                  <div
                    key={cs.id}
                    className="space-y-2 rounded-xl border border-border bg-surface-2 p-4 text-xs"
                  >
                    <div className="font-semibold text-foreground">&ldquo;{cs.claim}&rdquo;</div>
                    <div className="text-[0.7rem] text-primary">Source: {cs.sourceLabel}</div>
                    <ul className="list-disc ps-4 text-[0.7rem] text-muted-foreground">
                      {cs.clues.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(
                        [
                          { id: "reliable_primary", label: "Reliable Primary Evidence" },
                          { id: "needs_verification", label: "Secondary — Verify Original" },
                          { id: "unreliable_bias", label: "Unreliable / Biased Claim" },
                        ] as const
                      ).map((opt) => (
                        <Button
                          key={opt.id}
                          type="button"
                          size="sm"
                          variant={picked === opt.id ? "glow" : "outline"}
                          className="h-7 text-[0.7rem]"
                          onClick={() => {
                            setResearchGuesses((prev) => ({ ...prev, [cs.id]: opt.id }));
                            if (opt.id === cs.verdict) toast.success("Strong source verification!");
                          }}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                    {picked && (
                      <div
                        className={`rounded-lg p-2.5 text-[0.72rem] ${
                          isCorrect ? "bg-success/10 text-success" : "bg-xp/10 text-foreground"
                        }`}
                      >
                        {isCorrect ? "Verified: " : "Review Clue: "}
                        {cs.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="surface-card space-y-3 p-5">
            <h3 className="font-display text-sm font-bold text-foreground">
              APA & MLA Citation Builder
            </h3>
            <div className="flex gap-1.5">
              {(["APA", "MLA"] as const).map((st) => (
                <Button
                  key={st}
                  type="button"
                  size="sm"
                  variant={citStyle === st ? "glow" : "outline"}
                  className="h-7 flex-1 text-xs"
                  onClick={() => setCitStyle(st)}
                >
                  {st}
                </Button>
              ))}
            </div>
            <Input
              value={citAuthor}
              onChange={(e) => setCitAuthor(e.target.value)}
              placeholder="Author (Last, F.)"
              className="text-xs"
            />
            <Input
              value={citYear}
              onChange={(e) => setCitYear(e.target.value)}
              placeholder="Year"
              className="text-xs"
            />
            <Input
              value={citTitle}
              onChange={(e) => setCitTitle(e.target.value)}
              placeholder="Article or Study Title"
              className="text-xs"
            />
            <Input
              value={citPublisher}
              onChange={(e) => setCitPublisher(e.target.value)}
              placeholder="Journal or Publisher"
              className="text-xs"
            />
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
              <div className="text-[0.65rem] font-bold uppercase text-primary">
                Formatted {citStyle} Citation
              </div>
              <p className="mt-1 select-all font-serif">{formattedCitation}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRESENTATION BUILDER */}
      {tab === "presentation" && (
        <div className="surface-card space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Structured Talk & Pitch Outliner
              </h3>
              <p className="text-xs text-muted-foreground">
                Estimated pacing (~130 WPM): <strong>~{estSpeakingSec} sec</strong> (
                {totalPresWords} words drafted)
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESENTATION_TEMPLATES.map((tpl, idx) => (
                <Button
                  key={tpl.id}
                  type="button"
                  size="sm"
                  variant={presTplIdx === idx ? "glow" : "outline"}
                  className="h-8 text-xs"
                  onClick={() => setPresTplIdx(idx)}
                >
                  {tpl.name}
                </Button>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={exportPresentationMd}
              >
                <Download className="size-3.5" />
                <span>Export Markdown</span>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 text-xs">
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs">Presentation Title</Label>
              <Input
                value={presTitle}
                onChange={(e) => setPresTitle(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">1. Opening Hook</Label>
              <Textarea
                rows={3}
                value={presHook}
                onChange={(e) => setPresHook(e.target.value)}
                placeholder={presTpl.hookPh}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">2. Core Thesis / Claim</Label>
              <Textarea
                rows={3}
                value={presThesis}
                onChange={(e) => setPresThesis(e.target.value)}
                placeholder={presTpl.thesisPh}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">3. Key Evidence & Numbers</Label>
              <Textarea
                rows={3}
                value={presEvidence}
                onChange={(e) => setPresEvidence(e.target.value)}
                placeholder={presTpl.evidencePh}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">4. Call to Action / Conclusion</Label>
              <Textarea
                rows={3}
                value={presCta}
                onChange={(e) => setPresCta(e.target.value)}
                placeholder={presTpl.ctaPh}
                className="text-xs"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-2 p-4 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-display text-sm font-bold text-foreground">
                  Public Speaking Rehearsal Timer &amp; Delivery Self-Check
                </h4>
                <p className="text-muted-foreground">
                  Local pacing timer &amp; rubric self-check (self-assessed — no audio upload or
                  fake AI vocal scoring).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold tabular-nums text-primary">
                  {String(Math.floor(rehearseSec / 60)).padStart(2, "0")}:
                  {String(rehearseSec % 60).padStart(2, "0")}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="glow"
                  className="h-7 text-xs"
                  onClick={() => setRehearseRunning((r) => !r)}
                >
                  {rehearseRunning ? <Pause className="size-3" /> : <Play className="size-3" />}
                  <span>{rehearseRunning ? "Pause" : "Rehearse"}</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => {
                    setRehearseRunning(false);
                    setRehearseSec(0);
                  }}
                >
                  <RotateCcw className="size-3" />
                </Button>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                "Opening hook stated cleanly in first 15 seconds",
                "Looked up from notes / eye contact maintained",
                "Paused for 1 second after sharing key statistic",
                "Ended with specific actionable conclusion",
              ].map((item) => {
                const checked = deliveryChecks.includes(item);
                return (
                  <label
                    key={item}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setDeliveryChecks((prev) =>
                          prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
                        )
                      }
                      className="accent-primary"
                    />
                    <span className="text-foreground">{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: FINANCIAL LITERACY ACADEMY (#27) */}
      {tab === "financial" && (
        <div className="space-y-5 text-xs" data-testid="financial-literacy-panel">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="surface-card space-y-3 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-foreground">
                  Student Monthly Budget Allocator (50 / 30 / 20 Guide)
                </h3>
                <span
                  className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold uppercase ${
                    budgetHealth.status === "balanced"
                      ? "bg-success/15 text-success"
                      : budgetHealth.status === "tight"
                        ? "bg-xp/15 text-xp"
                        : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {budgetHealth.status}
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">
                    Monthly Allowance / Budget
                  </span>
                  <Input
                    type="number"
                    min={1}
                    value={state.financialLab.monthlyAllowance}
                    onChange={(e) =>
                      update((prev) => ({
                        ...prev,
                        financialLab: {
                          ...prev.financialLab,
                          monthlyAllowance: Math.max(1, Number(e.target.value) || 1),
                        },
                      }))
                    }
                    className="h-8 text-xs"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">
                    Protected Monthly Savings
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={state.financialLab.monthlySavings}
                    onChange={(e) =>
                      update((prev) => ({
                        ...prev,
                        financialLab: {
                          ...prev.financialLab,
                          monthlySavings: Math.max(0, Number(e.target.value) || 0),
                        },
                      }))
                    }
                    className="h-8 text-xs"
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono tabular-nums">
                <div className="rounded-lg border border-border bg-surface-2 p-2.5">
                  <div className="text-[10px] text-muted-foreground">
                    Needs ({budgetHealth.needsPct}%)
                  </div>
                  <div className="font-bold text-foreground">{budgetHealth.needsTotal}</div>
                </div>
                <div className="rounded-lg border border-border bg-surface-2 p-2.5">
                  <div className="text-[10px] text-muted-foreground">
                    Wants ({budgetHealth.wantsPct}%)
                  </div>
                  <div className="font-bold text-foreground">{budgetHealth.wantsTotal}</div>
                </div>
                <div className="rounded-lg border border-border bg-surface-2 p-2.5">
                  <div className="text-[10px] text-muted-foreground">Unallocated</div>
                  <div
                    className={`font-bold ${
                      budgetHealth.remainingBalance < 0 ? "text-destructive" : "text-primary"
                    }`}
                  >
                    {budgetHealth.remainingBalance}
                  </div>
                </div>
              </div>

              <p className="rounded-lg border border-primary/25 bg-primary/5 p-2.5 text-foreground">
                {budgetHealth.advice}
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const amt = Number(newExpAmount);
                  if (!newExpLabel.trim() || !Number.isFinite(amt) || amt <= 0) return;
                  update((prev) => ({
                    ...prev,
                    financialLab: {
                      ...prev.financialLab,
                      expenses: [
                        ...prev.financialLab.expenses,
                        {
                          id: `exp_${Date.now().toString(36)}`,
                          label: newExpLabel.trim(),
                          amount: amt,
                          category: newExpCat,
                        },
                      ],
                    },
                  }));
                  setNewExpLabel("");
                }}
                className="flex flex-wrap gap-1.5"
              >
                <Input
                  value={newExpLabel}
                  onChange={(e) => setNewExpLabel(e.target.value)}
                  placeholder="Expense item..."
                  className="h-8 flex-1 min-w-32 text-xs"
                />
                <Input
                  type="number"
                  min={1}
                  value={newExpAmount}
                  onChange={(e) => setNewExpAmount(e.target.value)}
                  className="h-8 w-20 text-xs"
                />
                <select
                  value={newExpCat}
                  onChange={(e) => setNewExpCat(e.target.value as "needs" | "wants" | "savings")}
                  aria-label="Expense category"
                  className="h-8 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
                >
                  <option value="needs">Need</option>
                  <option value="wants">Want</option>
                  <option value="savings">Savings</option>
                </select>
                <Button type="submit" size="sm" variant="outline" className="h-8 text-xs">
                  Add
                </Button>
              </form>

              <div className="space-y-1 max-h-36 overflow-y-auto">
                {state.financialLab.expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-2.5 py-1.5"
                  >
                    <span>
                      {exp.label}{" "}
                      <span className="text-[10px] uppercase text-muted-foreground">
                        ({exp.category})
                      </span>
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span>{exp.amount}</span>
                      <button
                        type="button"
                        onClick={() =>
                          update((prev) => ({
                            ...prev,
                            financialLab: {
                              ...prev.financialLab,
                              expenses: prev.financialLab.expenses.filter((x) => x.id !== exp.id),
                            },
                          }))
                        }
                        className="text-destructive hover:underline"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card space-y-3 p-5">
              <h3 className="font-display text-base font-bold text-foreground">
                Compound Savings &amp; Goal Simulator
              </h3>
              <p className="text-muted-foreground">
                Explore how consistent monthly saving plus compounding grows over time—educational
                math simulation only (not investment advice).
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                <label className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">Starting Balance</span>
                  <Input
                    type="number"
                    min={0}
                    value={compInitial}
                    onChange={(e) => setCompInitial(Math.max(0, Number(e.target.value) || 0))}
                    className="h-8 text-xs"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">Annual Rate (%)</span>
                  <Input
                    type="number"
                    min={0}
                    max={25}
                    value={compAnnualPct}
                    onChange={(e) => setCompAnnualPct(Math.max(0, Number(e.target.value) || 0))}
                    className="h-8 text-xs"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">Months ({compMonths})</span>
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    value={compMonths}
                    onChange={(e) => setCompMonths(Math.max(1, Number(e.target.value) || 12))}
                    className="h-8 text-xs"
                  />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono tabular-nums pt-1">
                <div className="rounded-lg border border-border bg-surface-2 p-3">
                  <div className="text-[10px] text-muted-foreground">Contributed</div>
                  <div className="font-bold text-foreground">
                    {savingsProjection.totalContributed}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-surface-2 p-3">
                  <div className="text-[10px] text-muted-foreground">Compound Growth</div>
                  <div className="font-bold text-success">+{savingsProjection.growthEarned}</div>
                </div>
                <div className="rounded-lg border border-primary/40 bg-primary/10 p-3">
                  <div className="text-[10px] text-primary">Projected Total</div>
                  <div className="font-bold text-primary">{savingsProjection.finalBalance}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="surface-card space-y-3 p-5">
            <h3 className="font-display text-base font-bold text-foreground">
              Real-World Money, Scam &amp; Subscription Judgment Scenarios
            </h3>
            <div className="grid gap-3 md:grid-cols-3">
              {STUDENT_FINANCIAL_SCENARIOS.map((sc) => {
                const picked = finChoices[sc.id];
                const solved = state.financialLab.completedScenarios.includes(sc.id);
                return (
                  <div
                    key={sc.id}
                    className="rounded-xl border border-border bg-surface-2 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold text-foreground">
                        {sc.title}
                      </span>
                      {solved && <CheckCircle2 className="size-4 text-success shrink-0" />}
                    </div>
                    <p className="text-muted-foreground">{sc.context}</p>
                    <div className="space-y-1.5">
                      {sc.options.map((opt, idx) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setFinChoices((prev) => ({ ...prev, [sc.id]: idx }));
                            if (idx === sc.bestIndex) {
                              update((prev) => ({
                                ...prev,
                                financialLab: {
                                  ...prev.financialLab,
                                  completedScenarios: prev.financialLab.completedScenarios.includes(
                                    sc.id,
                                  )
                                    ? prev.financialLab.completedScenarios
                                    : [...prev.financialLab.completedScenarios, sc.id],
                                },
                              }));
                              toast.success(`Smart financial decision: ${sc.title}!`);
                            }
                          }}
                          className={`w-full rounded-md border px-2.5 py-1.5 text-start text-[11px] ${
                            typeof picked === "number"
                              ? idx === sc.bestIndex
                                ? "border-success bg-success/15 font-semibold"
                                : picked === idx
                                  ? "border-destructive bg-destructive/15"
                                  : "border-border bg-surface opacity-70"
                              : "border-border bg-surface hover:border-primary/40"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {typeof picked === "number" && (
                      <p className="text-[11px] text-primary">{sc.explanation}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EISENHOWER MATRIX */}
      {tab === "eisenhower" && (
        <div className="surface-card space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Eisenhower Study Prioritization Matrix
              </h3>
              <p className="text-xs text-muted-foreground">
                Separate urgent deadlines from high-impact weekly learning goals.
              </p>
            </div>
            <Button type="button" size="sm" variant="glow" onClick={handleExportDoFirstTasks}>
              Export &ldquo;Do First&rdquo; to Real Tasks
            </Button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!matrixTaskInput.trim()) return;
              setMatrixItems((prev) => [
                ...prev,
                {
                  id: `mx_${Date.now().toString(36)}`,
                  title: matrixTaskInput.trim(),
                  quadrant: matrixQuadInput,
                },
              ]);
              setMatrixTaskInput("");
            }}
            className="flex flex-wrap gap-2"
          >
            <Input
              value={matrixTaskInput}
              onChange={(e) => setMatrixTaskInput(e.target.value)}
              placeholder="Add assignment, exam review, or habit..."
              className="flex-1 min-w-48 text-xs"
            />
            <select
              value={matrixQuadInput}
              onChange={(e) => setMatrixQuadInput(e.target.value as MatrixItem["quadrant"])}
              aria-label="Priority quadrant"
              className="h-9 rounded-md border border-input bg-surface-2 px-2.5 text-xs text-foreground"
            >
              <option value="do_first">Important + Urgent (Do First)</option>
              <option value="schedule">Important + Not Urgent (Schedule)</option>
              <option value="delegate">Not Important + Urgent (Quick Batch)</option>
              <option value="eliminate">Low Value Distraction (Drop)</option>
            </select>
            <Button type="submit" size="sm" variant="outline">
              Add Item
            </Button>
          </form>

          <div className="grid gap-3 md:grid-cols-2">
            {(
              [
                {
                  id: "do_first",
                  label: "Q1: Do First (Important & Urgent)",
                  tone: "border-destructive/40",
                },
                {
                  id: "schedule",
                  label: "Q2: Schedule Intentionally (Important)",
                  tone: "border-primary/40",
                },
                { id: "delegate", label: "Q3: Quick Batch / Delegate", tone: "border-xp/40" },
                {
                  id: "eliminate",
                  label: "Q4: Limit or Eliminate Distractions",
                  tone: "border-border",
                },
              ] as const
            ).map((q) => {
              const qItems = matrixItems.filter((i) => i.quadrant === q.id);
              return (
                <div
                  key={q.id}
                  className={`space-y-2 rounded-xl border bg-surface-2 p-4 text-xs ${q.tone}`}
                >
                  <div className="font-display text-sm font-bold text-foreground">{q.label}</div>
                  {qItems.length === 0 ? (
                    <p className="text-[0.7rem] text-muted-foreground">No items placed here.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {qItems.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center justify-between rounded-md border border-border bg-surface px-2.5 py-1.5"
                        >
                          <span>{it.title}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setMatrixItems((prev) => prev.filter((x) => x.id !== it.id))
                            }
                            className="text-[0.68rem] text-destructive hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: CRITICAL THINKING */}
      {tab === "critical" && (
        <div className="space-y-4">
          {CRITICAL_THINKING_CASES.map((ct) => {
            const chosen = ctChoices[ct.id];
            const answered = typeof chosen === "number";
            const correct = answered && chosen === ct.correctIndex;
            return (
              <div key={ct.id} className="surface-card space-y-2.5 p-5 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-foreground">{ct.title}</h3>
                  <span className="font-semibold text-primary">{ct.flawName}</span>
                </div>
                <p className="rounded-lg border border-border bg-surface-2 p-3 text-foreground/90">
                  {ct.scenario}
                </p>
                <div className="font-semibold text-foreground">{ct.question}</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {ct.options.map((opt, idx) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setCtChoices((prev) => ({ ...prev, [ct.id]: idx }));
                        if (idx === ct.correctIndex) {
                          update((prev) => ({
                            ...prev,
                            completedPracticalExercises: prev.completedPracticalExercises.includes(
                              ct.id,
                            )
                              ? prev.completedPracticalExercises
                              : [...prev.completedPracticalExercises, ct.id],
                          }));
                          toast.success(`Spotted logical flaw: ${ct.flawName}!`);
                        }
                      }}
                      className={`rounded-lg border px-3 py-2 text-start transition-colors ${
                        answered
                          ? idx === ct.correctIndex
                            ? "border-success bg-success/15 font-semibold"
                            : chosen === idx
                              ? "border-destructive bg-destructive/15"
                              : "border-border bg-surface-2 opacity-70"
                          : "border-border bg-surface-2 hover:border-primary/40"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {answered && (
                  <div
                    className={`rounded-lg p-2.5 text-[0.72rem] ${
                      correct ? "bg-success/10 text-success" : "bg-xp/10 text-foreground"
                    }`}
                  >
                    {ct.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
