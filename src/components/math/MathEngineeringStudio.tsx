import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  Compass,
  Dice5,
  Hammer,
  Lightbulb,
  LineChart,
  Scale,
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  computeFunctionSummary,
  computeGeometryMetrics,
  computeLeverAdvantage,
  computeStatistics,
  evaluateFunctionY,
  evaluateTrussBridge,
  type MathFunctionKind,
} from "@/data/math-engineering";
import { PROBLEM_SOLVING_CHALLENGES, SEVEN_PROBLEM_STEPS } from "@/lib/empowerment-engines";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

type MathSubTab = "graph" | "geometry" | "balance" | "stats" | "prob" | "engineering" | "arena";

export function MathEngineeringStudio() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: eco, update: updateEco } = useStudentEcosystem();
  const [subTab, setSubTab] = useState<MathSubTab>("graph");

  const markSimCompleted = (id: string, label: string) => {
    if (eco.completedSimulations.includes(id)) return;
    updateEco((prev) => ({
      ...prev,
      completedSimulations: [...prev.completedSimulations, id],
    }));
    toast.success(isAr ? `تم تسجيل إتقان: ${label}` : `Recorded mastery: ${label}`);
  };

  // #7 Math Visualizer
  const [fnKind, setFnKind] = useState<MathFunctionKind>("quadratic");
  const [coefA, setCoefA] = useState(0.5);
  const [coefB, setCoefB] = useState(0);
  const [coefC, setCoefC] = useState(-2);

  const fnSummary = useMemo(
    () => computeFunctionSummary(fnKind, coefA, coefB, coefC),
    [fnKind, coefA, coefB, coefC],
  );
  const graphPath = useMemo(() => {
    const pts: string[] = [];
    for (let px = 0; px <= 280; px += 4) {
      const x = ((px - 140) / 140) * 6; // domain -6..6
      const y = evaluateFunctionY(fnKind, x, coefA, coefB, coefC);
      const py = Math.max(-20, Math.min(200, 90 - y * 12));
      pts.push(`${px === 0 ? "M" : "L"} ${px} ${py.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [fnKind, coefA, coefB, coefC]);

  // #8 Geometry Playground
  const [shape, setShape] = useState<"triangle" | "circle" | "rectangle" | "cylinder">("triangle");
  const [dimA, setDimA] = useState(8);
  const [dimB, setDimB] = useState(6);
  const [rotateDeg, setRotateDeg] = useState(0);
  const geomMetrics = useMemo(() => computeGeometryMetrics(shape, dimA, dimB), [shape, dimA, dimB]);

  // #9 Equation Balance (ax + b = c -> linear scale)
  const [eqCoefX, setEqCoefX] = useState(2);
  const [eqLeftConst, setEqLeftConst] = useState(4);
  const [eqRightConst, setEqRightConst] = useState(14);
  const [eqHistory, setEqHistory] = useState<string[]>(["Start: 2x + 4 = 14"]);

  const resetEquation = (a = 2, b = 4, c = 14) => {
    setEqCoefX(a);
    setEqLeftConst(b);
    setEqRightConst(c);
    setEqHistory([`Start: ${a}x ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`} = ${c}`]);
  };
  const applyOpBothSides = (op: "sub2" | "add2" | "div2") => {
    if (op === "sub2") {
      setEqLeftConst((v) => v - 2);
      setEqRightConst((v) => v - 2);
      setEqHistory((h) => [...h, "Subtract 2 from both sides"]);
    } else if (op === "add2") {
      setEqLeftConst((v) => v + 2);
      setEqRightConst((v) => v + 2);
      setEqHistory((h) => [...h, "Add 2 to both sides"]);
    } else if (op === "div2" && eqCoefX !== 1) {
      setEqCoefX((v) => Number((v / 2).toFixed(2)));
      setEqLeftConst((v) => Number((v / 2).toFixed(2)));
      setEqRightConst((v) => Number((v / 2).toFixed(2)));
      setEqHistory((h) => [...h, "Divide both sides by 2"]);
    }
  };
  const eqSolved = eqCoefX === 1 && eqLeftConst === 0;

  // #10 Statistics Studio
  const [rawDataset, setRawDataset] = useState("12, 15, 18, 18, 22, 24, 30");
  const parsedValues = useMemo(
    () =>
      rawDataset
        .split(/[\s,]+/)
        .map((n) => Number(n.trim()))
        .filter((n) => Number.isFinite(n)),
    [rawDataset],
  );
  const stats = useMemo(() => computeStatistics(parsedValues), [parsedValues]);

  // #11 Probability Simulator
  const [probDevice, setProbDevice] = useState<"coin" | "die" | "spinner">("coin");
  const [probCounts, setProbCounts] = useState<Record<string, number>>({});
  const runTrials = (trials: number) => {
    const outcomes =
      probDevice === "coin"
        ? ["Heads", "Tails"]
        : probDevice === "die"
          ? ["1", "2", "3", "4", "5", "6"]
          : ["Red (50%)", "Red (50%)", "Blue (25%)", "Green (25%)"];
    setProbCounts((prev) => {
      const next = { ...prev };
      for (let i = 0; i < trials; i++) {
        const pick = outcomes[Math.floor(Math.random() * outcomes.length)]!;
        const key = `${probDevice}:${pick}`;
        next[key] = (next[key] ?? 0) + 1;
      }
      return next;
    });
  };
  const deviceEntries = Object.entries(probCounts).filter(([k]) => k.startsWith(`${probDevice}:`));
  const totalTrials = deviceEntries.reduce((acc, [, v]) => acc + v, 0);

  // #12 Engineering Design Lab
  const [spanMeters, setSpanMeters] = useState(12);
  const [trianglesCount, setTrianglesCount] = useState(5);
  const [bridgeMaterial, setBridgeMaterial] = useState<"balsa" | "aluminum" | "steel">("aluminum");
  const [appliedLoadKg, setAppliedLoadKg] = useState(250);
  const [effortArm, setEffortArm] = useState(60);
  const [loadArm, setLoadArm] = useState(20);
  const trussEval = useMemo(
    () =>
      evaluateTrussBridge({
        spanMeters,
        trianglesCount,
        material: bridgeMaterial,
        appliedLoadKg,
        budgetLimit: 1200,
      }),
    [spanMeters, trianglesCount, bridgeMaterial, appliedLoadKg],
  );
  const leverEval = useMemo(
    () => computeLeverAdvantage(effortArm, loadArm, 60),
    [effortArm, loadArm],
  );

  // Prototyping & Design Thinking Canvas State
  const [protoTitle, setProtoTitle] = useState("");
  const [protoProblem, setProtoProblem] = useState("");
  const [protoConstraints, setProtoConstraints] = useState(
    "Budget < 15 KWD · Cardboard/Recycled PLA · Non-thermal safe tools only",
  );
  const [protoMetric, setProtoMetric] = useState("Supports 2.5 kg load with < 5mm deflection");
  const [protoSafeMaterials, setProtoSafeMaterials] = useState(
    "Corrugated cardboard, wood craft sticks, PVA white glue, digital scale",
  );
  const [protoTestProtocol, setProtoTestProtocol] = useState(
    "Incremental 250g weights placed at center span; measure sag every 60s.",
  );

  // #13 Problem Solving Arena State
  const [arenaChallengeId, setArenaChallengeId] = useState(PROBLEM_SOLVING_CHALLENGES[0]!.id);
  const [arenaStepsDone, setArenaStepsDone] = useState<number[]>([1]);
  const [arenaHypothesis, setArenaHypothesis] = useState("");
  const [arenaVerification, setArenaVerification] = useState("");
  const [arenaReflection, setArenaReflection] = useState("");
  const [arenaAnswerIdx, setArenaAnswerIdx] = useState<number | null>(null);
  const activeArenaChallenge =
    PROBLEM_SOLVING_CHALLENGES.find((c) => c.id === arenaChallengeId) ??
    PROBLEM_SOLVING_CHALLENGES[0]!;

  const tabs: Array<{ id: MathSubTab; label: string; icon: typeof LineChart }> = [
    { id: "graph", label: isAr ? "راسم الدوال" : "7. Math Visualizer", icon: LineChart },
    { id: "geometry", label: isAr ? "الهندسة التفاعلية" : "8. Geometry", icon: Compass },
    { id: "balance", label: isAr ? "ميزان المعادلات" : "9. Equation Balance", icon: Scale },
    { id: "stats", label: isAr ? "استوديو الإحصاء" : "10. Statistics", icon: BarChart2 },
    { id: "prob", label: isAr ? "محاكي الاحتمالات" : "11. Probability", icon: Dice5 },
    { id: "engineering", label: isAr ? "مختبر الهندسة" : "12. Engineering Lab", icon: Hammer },
    { id: "arena", label: isAr ? "ساحة حل المشكلات" : "Problem Solving Arena", icon: Lightbulb },
  ];

  return (
    <div className="space-y-5" data-testid="math-engineering-studio">
      <div className="surface-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold font-display text-foreground">
              {isAr ? "الرياضيات والهندسة التطبيقية" : "Mathematics & Engineering Workbench"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "تصوّر الدوال، الأشكال الهندسية، موازنة الجبر، البيانات الإحصائية، الاحتمالات، وتصميم الجسور."
                : "Visualize functions, explore geometry transforms, solve algebraic balances, run statistics & probability trials, and test truss designs."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono tabular-nums text-xs font-semibold text-primary">
              {eco.completedSimulations.filter((id) => id.startsWith("math_")).length}/6{" "}
              {isAr ? "مختبرات مكتملة" : "workbenches logged"}
            </span>
            <FeatureGuideTrigger featureId="math-studio" />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = subTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSubTab(item.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
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

        {/* #7 MATH VISUALIZER */}
        {subTab === "graph" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {(["linear", "quadratic", "sine", "exponential"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setFnKind(k)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold capitalize ${
                      fnKind === k
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-surface-1 text-muted-foreground"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <div className="space-y-2 text-xs font-mono tabular-nums">
                <label className="block space-y-1">
                  <span>a = {coefA.toFixed(1)}</span>
                  <input
                    type="range"
                    min={-3}
                    max={3}
                    step={0.1}
                    value={coefA}
                    onChange={(e) => setCoefA(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </label>
                <label className="block space-y-1">
                  <span>b = {coefB.toFixed(1)}</span>
                  <input
                    type="range"
                    min={-4}
                    max={4}
                    step={0.1}
                    value={coefB}
                    onChange={(e) => setCoefB(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </label>
                {fnKind !== "linear" && (
                  <label className="block space-y-1">
                    <span>c = {coefC.toFixed(1)}</span>
                    <input
                      type="range"
                      min={-4}
                      max={4}
                      step={0.1}
                      value={coefC}
                      onChange={(e) => setCoefC(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs font-mono text-primary">{fnSummary}</p>
              <Button
                type="button"
                size="sm"
                onClick={() => markSimCompleted("math_graph", "Math Visualizer")}
                className="h-7 text-xs"
              >
                Save Function Exploration
              </Button>
            </div>
            <svg
              viewBox="0 0 280 180"
              className="w-full rounded-xl border border-border bg-surface-1"
            >
              <line x1="0" y1="90" x2="280" y2="90" stroke="#475569" strokeDasharray="3 3" />
              <line x1="140" y1="0" x2="140" y2="180" stroke="#475569" strokeDasharray="3 3" />
              <path d={graphPath} fill="none" stroke="#14b8a6" strokeWidth="2.5" />
            </svg>
          </div>
        )}

        {/* #8 GEOMETRY PLAYGROUND */}
        {subTab === "geometry" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3 text-xs">
              <div className="flex flex-wrap gap-1.5">
                {(["triangle", "circle", "rectangle", "cylinder"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setShape(s)}
                    className={`rounded-md border px-2.5 py-1 font-semibold capitalize ${
                      shape === s
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-surface-1 text-muted-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="space-y-2 font-mono tabular-nums">
                <label className="block space-y-1">
                  <span>
                    {shape === "circle" || shape === "cylinder" ? "Radius r" : "Width / Base"}:{" "}
                    {dimA} cm
                  </span>
                  <input
                    type="range"
                    min={2}
                    max={14}
                    value={dimA}
                    onChange={(e) => setDimA(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </label>
                {shape !== "circle" && (
                  <label className="block space-y-1">
                    <span>Height h: {dimB} cm</span>
                    <input
                      type="range"
                      min={2}
                      max={14}
                      value={dimB}
                      onChange={(e) => setDimB(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </label>
                )}
                <label className="block space-y-1">
                  <span>Rotation Transform: {rotateDeg}°</span>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={15}
                    value={rotateDeg}
                    onChange={(e) => setRotateDeg(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono tabular-nums">
                <div className="rounded-lg bg-surface-1 p-2.5">
                  <div className="text-muted-foreground">Area / Surface</div>
                  <div className="font-bold text-foreground">{geomMetrics.areaLabel}</div>
                </div>
                <div className="rounded-lg bg-surface-1 p-2.5">
                  <div className="text-muted-foreground">Metric</div>
                  <div className="font-bold text-primary">{geomMetrics.perimeterOrVolumeLabel}</div>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => markSimCompleted("math_geometry", "Geometry Playground")}
                className="h-7 text-xs"
              >
                Log Geometry Construction
              </Button>
            </div>
            <svg
              viewBox="0 0 240 180"
              className="w-full rounded-xl border border-border bg-surface-1"
            >
              <g transform={`translate(120 90) rotate(${rotateDeg})`}>
                {shape === "circle" && (
                  <circle
                    cx="0"
                    cy="0"
                    r={dimA * 4.2}
                    fill="#14b8a630"
                    stroke="#14b8a6"
                    strokeWidth="2.5"
                  />
                )}
                {shape === "rectangle" && (
                  <rect
                    x={-dimA * 4}
                    y={-dimB * 3}
                    width={dimA * 8}
                    height={dimB * 6}
                    fill="#38bdf830"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                  />
                )}
                {shape === "triangle" && (
                  <polygon
                    points={`${-dimA * 4},${dimB * 3} ${dimA * 4},${dimB * 3} ${-dimA * 4},${-dimB * 3}`}
                    fill="#a855f730"
                    stroke="#a855f7"
                    strokeWidth="2.5"
                  />
                )}
                {shape === "cylinder" && (
                  <g>
                    <rect
                      x={-dimA * 3.5}
                      y={-dimB * 3}
                      width={dimA * 7}
                      height={dimB * 6}
                      rx="6"
                      fill="#f59e0b25"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />
                    <ellipse
                      cx="0"
                      cy={-dimB * 3}
                      rx={dimA * 3.5}
                      ry={8}
                      fill="#f59e0b40"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </g>
            </svg>
          </div>
        )}

        {/* #9 EQUATION BALANCE */}
        {subTab === "balance" && (
          <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-mono text-lg font-bold text-foreground">
                {eqCoefX === 1 ? "x" : `${eqCoefX}x`}{" "}
                {eqLeftConst === 0
                  ? ""
                  : eqLeftConst > 0
                    ? `+ ${eqLeftConst}`
                    : `- ${Math.abs(eqLeftConst)}`}{" "}
                = {eqRightConst}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyOpBothSides("sub2")}
                  className="h-7 text-xs font-mono"
                >
                  − 2 both sides
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyOpBothSides("add2")}
                  className="h-7 text-xs font-mono"
                >
                  + 2 both sides
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyOpBothSides("div2")}
                  className="h-7 text-xs font-mono"
                >
                  ÷ 2 both sides
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => resetEquation()}
                  className="h-7 text-xs"
                >
                  Reset (2x+4=14)
                </Button>
              </div>
            </div>
            {eqSolved && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs">
                <span className="font-semibold text-emerald-400">
                  Solved! x = {eqRightConst} while keeping both sides balanced.
                </span>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => markSimCompleted("math_balance", "Equation Balance")}
                  className="h-7 text-xs"
                >
                  Record Algebra Solve
                </Button>
              </div>
            )}
            <div className="space-y-1 text-xs font-mono text-muted-foreground">
              {eqHistory.map((step, i) => (
                <div key={i}>
                  {i + 1}. {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* #10 STATISTICS STUDIO */}
        {subTab === "stats" && (
          <div className="space-y-3 rounded-xl border border-border bg-surface-2/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                className="text-xs font-semibold text-foreground"
                htmlFor="stats-dataset-input"
              >
                Comma-separated numerical dataset:
              </label>
              <Button
                type="button"
                size="sm"
                onClick={() => markSimCompleted("math_stats", "Statistics Studio")}
                className="h-7 text-xs"
              >
                Save Statistics Analysis
              </Button>
            </div>
            <Input
              id="stats-dataset-input"
              value={rawDataset}
              onChange={(e) => setRawDataset(e.target.value)}
              className="font-mono text-xs"
            />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono tabular-nums">
              <div className="rounded-lg bg-surface-1 p-2.5">
                <div className="text-muted-foreground">Mean</div>
                <div className="font-bold text-primary">{stats.mean}</div>
              </div>
              <div className="rounded-lg bg-surface-1 p-2.5">
                <div className="text-muted-foreground">Median</div>
                <div className="font-bold text-foreground">{stats.median}</div>
              </div>
              <div className="rounded-lg bg-surface-1 p-2.5">
                <div className="text-muted-foreground">Mode(s)</div>
                <div className="font-bold text-foreground">
                  {stats.modes.length ? stats.modes.join(", ") : "None"}
                </div>
              </div>
              <div className="rounded-lg bg-surface-1 p-2.5">
                <div className="text-muted-foreground">Range</div>
                <div className="font-bold text-foreground">{stats.range}</div>
              </div>
              <div className="rounded-lg bg-surface-1 p-2.5">
                <div className="text-muted-foreground">Count (n)</div>
                <div className="font-bold text-foreground">{stats.count}</div>
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-24 pt-2 border-t border-border/60">
              {parsedValues.slice(0, 16).map((v, i) => {
                const hPct = stats.max > 0 ? Math.max(8, Math.round((v / stats.max) * 100)) : 10;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-primary/70 transition-all"
                      style={{ height: `${hPct}%` }}
                      title={String(v)}
                    />
                    <span className="text-[10px] font-mono text-muted-foreground">{v}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* #11 PROBABILITY SIMULATOR */}
        {subTab === "prob" && (
          <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1.5">
                {(["coin", "die", "spinner"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setProbDevice(d)}
                    className={`rounded-md border px-2.5 py-1 font-semibold capitalize ${
                      probDevice === d
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-surface-1 text-muted-foreground"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => runTrials(1)}
                  className="h-7 text-xs"
                >
                  +1 Trial
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => runTrials(10)}
                  className="h-7 text-xs"
                >
                  +10 Trials
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => runTrials(100)}
                  className="h-7 text-xs"
                >
                  +100 Trials
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => markSimCompleted("math_prob", "Probability Simulator")}
                  className="h-7 text-xs"
                >
                  Save Trials
                </Button>
              </div>
            </div>
            <div className="font-mono tabular-nums text-muted-foreground">
              Total recorded {probDevice} trials:{" "}
              <strong className="text-foreground">{totalTrials}</strong>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 font-mono tabular-nums">
              {deviceEntries.map(([key, count]) => {
                const label = key.replace(`${probDevice}:`, "");
                const empPct = totalTrials > 0 ? ((count / totalTrials) * 100).toFixed(1) : "0.0";
                return (
                  <div key={key} className="rounded-lg border border-border bg-surface-1 p-2.5">
                    <div className="font-semibold text-foreground">{label}</div>
                    <div className="text-primary">
                      {count} hits · {empPct}% empirical
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* #12 ENGINEERING DESIGN LAB */}
        {subTab === "engineering" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-foreground">
              <AlertTriangle className="size-4 text-amber-500 shrink-0" />
              <span>
                Simplified educational mechanics model only — not certified structural engineering
                software for real construction.
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground">
                    Truss Bridge Span Challenge (Budget: 1,200)
                  </h3>
                  <span
                    className={`font-mono font-bold ${
                      trussEval.passed ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {trussEval.passed ? "PASS" : "FAIL"}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {(["balsa", "aluminum", "steel"] as const).map((mat) => (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => setBridgeMaterial(mat)}
                      className={`rounded-md border px-2.5 py-1 font-semibold capitalize ${
                        bridgeMaterial === mat
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-surface-1 text-muted-foreground"
                      }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
                <div className="space-y-2 font-mono tabular-nums">
                  <label className="block space-y-1">
                    <span>Span Length: {spanMeters} m</span>
                    <input
                      type="range"
                      min={6}
                      max={24}
                      value={spanMeters}
                      onChange={(e) => setSpanMeters(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span>Triangular Trusses: {trianglesCount}</span>
                    <input
                      type="range"
                      min={2}
                      max={10}
                      value={trianglesCount}
                      onChange={(e) => setTrianglesCount(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span>Test Load: {appliedLoadKg} kg</span>
                    <input
                      type="range"
                      min={50}
                      max={600}
                      step={25}
                      value={appliedLoadKg}
                      onChange={(e) => setAppliedLoadKg(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono tabular-nums">
                  <div className="rounded-lg bg-surface-1 p-2">
                    <div className="text-muted-foreground">Cost</div>
                    <div className="font-bold">{trussEval.materialCost}</div>
                  </div>
                  <div className="rounded-lg bg-surface-1 p-2">
                    <div className="text-muted-foreground">Max Safe Load</div>
                    <div className="font-bold text-primary">{trussEval.safeLoadCapacityKg} kg</div>
                  </div>
                  <div className="rounded-lg bg-surface-1 p-2">
                    <div className="text-muted-foreground">Stress</div>
                    <div className="font-bold">{trussEval.utilizationPct}%</div>
                  </div>
                </div>
                <p className="text-muted-foreground">{trussEval.failureDiagnosis}</p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => markSimCompleted("math_engineering", "Engineering Design Lab")}
                  className="h-7 text-xs"
                >
                  Log Engineering Iteration
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3 text-xs font-mono tabular-nums">
                <h3 className="font-sans text-sm font-bold text-foreground">
                  Class-1 Lever Fulcrum Mechanical Advantage (60 kg load)
                </h3>
                <label className="block space-y-1">
                  <span>Effort Arm: {effortArm} cm</span>
                  <input
                    type="range"
                    min={10}
                    max={120}
                    step={5}
                    value={effortArm}
                    onChange={(e) => setEffortArm(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </label>
                <label className="block space-y-1">
                  <span>Load Arm: {loadArm} cm</span>
                  <input
                    type="range"
                    min={10}
                    max={80}
                    step={5}
                    value={loadArm}
                    onChange={(e) => setLoadArm(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="rounded-lg bg-surface-1 p-3">
                    <div className="text-muted-foreground">Mechanical Advantage</div>
                    <div className="text-base font-bold text-primary">
                      {leverEval.mechanicalAdvantage}×
                    </div>
                  </div>
                  <div className="rounded-lg bg-surface-1 p-3">
                    <div className="text-muted-foreground">Effort Needed</div>
                    <div className="text-base font-bold text-foreground">
                      {leverEval.requiredEffortKg} kgf
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Design Thinking & Safe Prototyping Spec Studio */}
            <div
              className="rounded-xl border border-primary/30 bg-surface-2/60 p-4 space-y-3 text-xs"
              data-testid="engineering-prototyping-studio"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    {isAr
                      ? "لوحة التفكير التصميمي وبناء النماذج الآمنة"
                      : "Design Thinking & Safe Prototyping Spec Builder"}
                  </h3>
                  <p className="text-muted-foreground">
                    {isAr
                      ? "حدد المشكلة، القيود الهندسية، معيار الاختبار القابل للقياس، وأضف المشروع مباشرة إلى ملف إنجازاتك."
                      : "Define the engineering problem, constraints, measurable target, and safe test protocol — and export directly to your Student Portfolio."}
                  </p>
                </div>
                <span className="font-mono text-primary font-semibold">
                  {eco.engineeringSpecs.length} specs saved
                </span>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <Input
                  value={protoTitle}
                  onChange={(e) => setProtoTitle(e.target.value)}
                  placeholder="Prototype title (e.g., Passive Solar Classroom Cooling Louver)"
                  className="text-xs"
                />
                <Input
                  value={protoMetric}
                  onChange={(e) => setProtoMetric(e.target.value)}
                  placeholder="Target success metric..."
                  className="text-xs"
                />
                <Textarea
                  rows={2}
                  value={protoProblem}
                  onChange={(e) => setProtoProblem(e.target.value)}
                  placeholder="Problem statement & user need..."
                  className="text-xs"
                />
                <Textarea
                  rows={2}
                  value={protoConstraints}
                  onChange={(e) => setProtoConstraints(e.target.value)}
                  placeholder="Cost, size, energy, and safety constraints..."
                  className="text-xs"
                />
                <Input
                  value={protoSafeMaterials}
                  onChange={(e) => setProtoSafeMaterials(e.target.value)}
                  placeholder="Classroom-safe materials list..."
                  className="text-xs"
                />
                <Input
                  value={protoTestProtocol}
                  onChange={(e) => setProtoTestProtocol(e.target.value)}
                  placeholder="Iterative verification test protocol..."
                  className="text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="glow"
                  onClick={() => {
                    if (!protoTitle.trim() || !protoProblem.trim()) {
                      toast.error("Enter a prototype title and problem statement first.");
                      return;
                    }
                    const now = new Date().toISOString();
                    updateEco((prev) => ({
                      ...prev,
                      engineeringSpecs: [
                        {
                          id: `eng_${Date.now().toString(36)}`,
                          title: protoTitle.trim(),
                          problemStatement: protoProblem.trim(),
                          constraints: protoConstraints.trim(),
                          targetMetric: protoMetric.trim(),
                          materialsSafeNote: protoSafeMaterials.trim(),
                          testProtocol: protoTestProtocol.trim(),
                          savedToPortfolio: true,
                          createdAt: now,
                        },
                        ...prev.engineeringSpecs,
                      ],
                      portfolio: {
                        ...prev.portfolio,
                        projects: [
                          {
                            id: `port_eng_${Date.now().toString(36)}`,
                            title: protoTitle.trim(),
                            category: "Engineering Prototype",
                            summary: `${protoProblem.trim()} — Target: ${protoMetric.trim()}`,
                            stepsCompleted: 1,
                            totalSteps: 4,
                            showcaseOptIn: false,
                            createdAt: now,
                          },
                          ...prev.portfolio.projects,
                        ],
                      },
                    }));
                    markSimCompleted("math_engineering", "Engineering Design Lab");
                    setProtoTitle("");
                    setProtoProblem("");
                    toast.success("Saved prototype spec & added to your Student Portfolio!");
                  }}
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Save Prototype Spec &amp; Add to Portfolio</span>
                </Button>
              </div>

              {eco.engineeringSpecs.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2 border-t border-border/60 pt-3">
                  {eco.engineeringSpecs.slice(0, 4).map((sp) => (
                    <div
                      key={sp.id}
                      className="rounded-lg border border-border bg-surface-1 p-2.5 space-y-1"
                    >
                      <div className="font-bold text-foreground">{sp.title}</div>
                      <div className="text-muted-foreground">{sp.problemStatement}</div>
                      <div className="text-[11px] font-mono text-primary">
                        Target: {sp.targetMetric}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* #29 PROBLEM SOLVING ARENA */}
        {subTab === "arena" && (
          <div className="space-y-4 text-xs" data-testid="problem-solving-arena">
            <div className="flex flex-wrap gap-2">
              {PROBLEM_SOLVING_CHALLENGES.map((ch) => (
                <Button
                  key={ch.id}
                  type="button"
                  size="sm"
                  variant={arenaChallengeId === ch.id ? "glow" : "outline"}
                  className="h-8 text-xs"
                  onClick={() => {
                    setArenaChallengeId(ch.id);
                    setArenaAnswerIdx(null);
                  }}
                >
                  {ch.title}
                </Button>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
                <div className="text-[11px] font-bold uppercase text-primary">
                  {activeArenaChallenge.domain}
                </div>
                <h3 className="font-display text-base font-bold text-foreground">
                  {activeArenaChallenge.title}
                </h3>
                <p className="text-foreground/90 leading-relaxed">{activeArenaChallenge.prompt}</p>
                <div className="space-y-1">
                  <div className="font-semibold text-foreground">Given Constraints:</div>
                  <ul className="list-disc ps-4 text-muted-foreground space-y-0.5">
                    {activeArenaChallenge.constraints.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 border-t border-border pt-3">
                  <div className="font-semibold text-foreground">
                    7-Step Reasoning Checklist ({arenaStepsDone.length}/7)
                  </div>
                  <div className="grid gap-1.5">
                    {SEVEN_PROBLEM_STEPS.map((st, idx) => {
                      const num = idx + 1;
                      const done = arenaStepsDone.includes(num);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() =>
                            setArenaStepsDone((prev) =>
                              prev.includes(num) ? prev.filter((x) => x !== num) : [...prev, num],
                            )
                          }
                          className={`flex items-center justify-between rounded-lg border px-3 py-1.5 text-start ${
                            done
                              ? "border-success/40 bg-success/10 text-foreground"
                              : "border-border bg-surface text-muted-foreground"
                          }`}
                        >
                          <span>{st}</span>
                          {done && <CheckCircle2 className="size-3.5 text-success shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
                <div className="font-semibold text-foreground">
                  {activeArenaChallenge.targetCheckQuestion}
                </div>
                <div className="space-y-1.5">
                  {activeArenaChallenge.options.map((opt, idx) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setArenaAnswerIdx(idx)}
                      className={`w-full rounded-lg border px-3 py-2 text-start ${
                        arenaAnswerIdx !== null
                          ? idx === activeArenaChallenge.correctIndex
                            ? "border-success bg-success/15 font-semibold"
                            : arenaAnswerIdx === idx
                              ? "border-destructive bg-destructive/15"
                              : "border-border bg-surface opacity-70"
                          : "border-border bg-surface hover:border-primary/40"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <Input
                  value={arenaHypothesis}
                  onChange={(e) => setArenaHypothesis(e.target.value)}
                  placeholder="Step 4: Candidate strategy / hypothesis..."
                  className="text-xs"
                />
                <Input
                  value={arenaVerification}
                  onChange={(e) => setArenaVerification(e.target.value)}
                  placeholder="Step 6: How did you verify edge cases?"
                  className="text-xs"
                />
                <Textarea
                  rows={2}
                  value={arenaReflection}
                  onChange={(e) => setArenaReflection(e.target.value)}
                  placeholder="Step 7: What pattern can you reuse on similar problems?"
                  className="text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="glow"
                  onClick={() => {
                    if (!arenaHypothesis.trim() || !arenaVerification.trim()) {
                      toast.error("Record your hypothesis and verification check before saving.");
                      return;
                    }
                    updateEco((prev) => ({
                      ...prev,
                      problemSolvingLogs: [
                        {
                          id: `ps_${Date.now().toString(36)}`,
                          challengeId: activeArenaChallenge.id,
                          title: activeArenaChallenge.title,
                          stepsDone: arenaStepsDone.length,
                          hypothesis: arenaHypothesis.trim(),
                          verificationNote: arenaVerification.trim(),
                          reflection: arenaReflection.trim(),
                          createdAt: new Date().toISOString(),
                        },
                        ...prev.problemSolvingLogs,
                      ],
                    }));
                    setArenaHypothesis("");
                    setArenaVerification("");
                    setArenaReflection("");
                    toast.success("Saved 7-step problem solving log!");
                  }}
                >
                  Save Arena Solution Log
                </Button>

                {eco.problemSolvingLogs.length > 0 && (
                  <div className="space-y-1.5 border-t border-border pt-2">
                    <div className="font-semibold text-foreground">
                      Saved Reasoning Logs ({eco.problemSolvingLogs.length})
                    </div>
                    {eco.problemSolvingLogs.slice(0, 3).map((lg) => (
                      <div key={lg.id} className="rounded-md bg-surface p-2 text-[11px]">
                        <div className="font-bold text-foreground">
                          {lg.title} ({lg.stepsDone}/7 steps)
                        </div>
                        <div className="text-muted-foreground">Verify: {lg.verificationNote}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
