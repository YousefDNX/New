import { useMemo, useState } from "react";
import { Bot, CheckCircle2, Code2, Cpu, Layout, Play, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ROBOT_GOAL,
  ROBOT_GRID_SIZE,
  ROBOT_OBSTACLES,
  evaluatePasswordStrength,
  runRobotCommands,
  runSafeEducationalCode,
} from "@/data/coding-curriculum";
import { DIGITAL_LITERACY_MODULES } from "@/data/curriculum-and-challenges";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

type CodingTab = "playground" | "algorithms" | "robotics" | "cyber" | "appdesign";

const INITIAL_SORT_ARRAY = [28, 11, 34, 7, 19, 23];

export function CodingTechStudio() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: eco, update: updateEco } = useStudentEcosystem();
  const [tab, setTab] = useState<CodingTab>("playground");

  const markSolved = (id: string, title: string) => {
    if (!eco.codingExercisesSolved.includes(id)) {
      updateEco((prev) => ({
        ...prev,
        codingExercisesSolved: [...prev.codingExercisesSolved, id],
      }));
      toast.success(isAr ? `تم توثيق إنجاز: ${title}` : `Completed coding milestone: ${title}`);
    }
  };

  // #25 Safe Coding Playground
  const [code, setCode] = useState(
    `let total = 0\nrepeat 4 {\n  let total = total + step * 2\n  print("Step " + step + " -> " + total)\n}\nif (total == 20) {\n  print("Challenge Verified: 20!")\n}`,
  );
  const codeRun = useMemo(() => runSafeEducationalCode(code), [code]);

  // #26 Algorithm Visualizer (Bubble Sort stepper)
  const [sortArr, setSortArr] = useState<number[]>(INITIAL_SORT_ARRAY);
  const [sortStepIdx, setSortStepIdx] = useState(0);
  const [sortComparePair, setSortComparePair] = useState<[number, number] | null>(null);
  const [algoName, setAlgoName] = useState<"bubble" | "binary">("bubble");
  const [binaryTarget] = useState(23);
  const [binaryBounds, setBinaryBounds] = useState<{
    lo: number;
    mid: number;
    hi: number;
    found: boolean;
  }>({
    lo: 0,
    mid: 2,
    hi: 5,
    found: false,
  });

  const stepBubbleSort = () => {
    const arr = [...sortArr];
    const i = sortStepIdx % Math.max(1, arr.length - 1);
    setSortComparePair([i, i + 1]);
    if (arr[i]! > arr[i + 1]!) {
      const tmp = arr[i]!;
      arr[i] = arr[i + 1]!;
      arr[i + 1] = tmp;
      setSortArr(arr);
    }
    setSortStepIdx((s) => s + 1);
  };
  const isSorted = sortArr.every((v, idx) => idx === 0 || sortArr[idx - 1]! <= v);

  const sortedSample = [7, 11, 19, 23, 28, 34];
  const stepBinarySearch = () => {
    const { lo, hi, found } = binaryBounds;
    if (found || lo > hi) return;
    const mid = Math.floor((lo + hi) / 2);
    const val = sortedSample[mid]!;
    if (val === binaryTarget) {
      setBinaryBounds({ lo, mid, hi, found: true });
      markSolved("algo_binary", "Binary Search Trace");
    } else if (val < binaryTarget) {
      setBinaryBounds({ lo: mid + 1, mid, hi, found: false });
    } else {
      setBinaryBounds({ lo, mid, hi: mid - 1, found: false });
    }
  };

  // #27 Robotics Simulator
  const [robotQueue, setRobotQueue] = useState<Array<"FWD" | "LEFT" | "RIGHT">>([
    "FWD",
    "FWD",
    "RIGHT",
    "FWD",
  ]);
  const robotResult = useMemo(() => runRobotCommands(robotQueue), [robotQueue]);

  // #28 Cyber Safety & Digital/AI Literacy Academy
  const [testPassword, setTestPassword] = useState("");
  const pwStrength = useMemo(() => evaluatePasswordStrength(testPassword), [testPassword]);
  const [phishingPicked, setPhishingPicked] = useState<string[]>([]);
  const [literacyAnswers, setLiteracyAnswers] = useState<Record<string, number>>({});

  // #29 App Design Simulator
  const [wireBlocks, setWireBlocks] = useState<string[]>([
    "Navbar (BTC Student Hub)",
    "Hero Progress Banner",
    "3-Column Study Card Grid",
    "Accessible Action Button",
  ]);
  const [previewViewport, setPreviewViewport] = useState<"mobile" | "desktop">("mobile");
  const [contrastGood, setContrastGood] = useState(true);

  const tabs: Array<{ id: CodingTab; label: string; icon: typeof Code2 }> = [
    { id: "playground", label: isAr ? "مختبر البرمجة" : "25. Coding Lab", icon: Code2 },
    { id: "algorithms", label: isAr ? "الخوارزميات" : "26. Algorithms", icon: Cpu },
    { id: "robotics", label: isAr ? "محاكي الروبوت" : "27. Robotics", icon: Bot },
    {
      id: "cyber",
      label: isAr ? "الأمان والوعي بالذكاء الاصطناعي" : "28. Cyber & AI Literacy",
      icon: ShieldCheck,
    },
    { id: "appdesign", label: isAr ? "تصميم التطبيقات" : "29. App Designer", icon: Layout },
  ];

  return (
    <div className="surface-card p-5 space-y-4" data-testid="coding-tech-studio">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold font-display text-foreground">
            {isAr
              ? "البرمجة والتقنية والذكاء الرقمي"
              : "Programming, Algorithms & Digital Tech Lab"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "بيئة برمجية آمنة بدون تعريض المتصفح، مع تتبع الخوارزميات، روبوت افتراضي، أمان رقمي، وتصميم واجهات."
              : "Sandboxed interpreter (zero eval), sorting/search steppers, grid rover navigation, defensive cyber hygiene, and wireframe accessibility audit."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono tabular-nums text-xs font-semibold text-primary">
            {eco.codingExercisesSolved.length} {isAr ? "تمارين مكتملة" : "tech challenges solved"}
          </span>
          <FeatureGuideTrigger featureId="coding-studio" />
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

      {/* #25 CODING PLAYGROUND */}
      {tab === "playground" && (
        <div className="grid gap-4 md:grid-cols-2 text-xs">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <span className="font-semibold text-foreground">
                Safe Subset Editor (let, repeat N &#123;&#125;, if, print)
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setCode((c) => `${c}\nprint("Hello BTC!")`)}
                  className="rounded border border-border px-2 py-0.5 text-[11px] hover:border-primary"
                >
                  + print
                </button>
                <button
                  type="button"
                  onClick={() => setCode((c) => `${c}\nrepeat 3 {\n  print(step)\n}`)}
                  className="rounded border border-border px-2 py-0.5 text-[11px] hover:border-primary"
                >
                  + loop
                </button>
              </div>
            </div>
            <Textarea
              rows={8}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono text-xs"
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                disabled={Boolean(codeRun.error) || codeRun.outputs.length === 0}
                onClick={() => markSolved("code_loop_sum", "Coding Loop Challenge")}
                className="h-7 text-xs"
              >
                <CheckCircle2 className="size-3.5 me-1" />
                Save Working Program
              </Button>
              <span className="font-mono text-[11px] text-muted-foreground">
                Steps executed: {codeRun.stepsExecuted}/500 max guard
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-slate-950 p-4 font-mono text-xs space-y-2 text-slate-100">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Sandboxed Console Output
            </div>
            {codeRun.error ? (
              <div className="rounded border border-rose-500/40 bg-rose-500/10 p-2 text-rose-300">
                {codeRun.error}
              </div>
            ) : (
              <div className="space-y-1">
                {codeRun.outputs.map((line, idx) => (
                  <div key={idx} className="text-emerald-300">
                    &gt; {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* #26 ALGORITHM VISUALIZER */}
      {tab === "algorithms" && (
        <div className="space-y-4 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={algoName === "bubble" ? "default" : "outline"}
              onClick={() => setAlgoName("bubble")}
              className="h-7 text-xs"
            >
              Bubble Sort Stepper
            </Button>
            <Button
              type="button"
              size="sm"
              variant={algoName === "binary" ? "default" : "outline"}
              onClick={() => setAlgoName("binary")}
              className="h-7 text-xs"
            >
              Binary Search (Target = 23)
            </Button>
          </div>

          {algoName === "bubble" ? (
            <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
              <div className="flex items-end gap-2 h-28">
                {sortArr.map((val, idx) => {
                  const highlighted =
                    sortComparePair && (sortComparePair[0] === idx || sortComparePair[1] === idx);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t transition-all ${
                          highlighted ? "bg-amber-400" : isSorted ? "bg-emerald-400" : "bg-primary"
                        }`}
                        style={{ height: `${Math.round((val / 36) * 100)}%` }}
                      />
                      <span className="font-mono font-bold">{val}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" size="sm" onClick={stepBubbleSort} className="h-7 text-xs">
                  <Play className="size-3 me-1" />
                  Next Comparison Step
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSortArr(INITIAL_SORT_ARRAY);
                    setSortStepIdx(0);
                    setSortComparePair(null);
                  }}
                  className="h-7 text-xs"
                >
                  <RotateCcw className="size-3 me-1" />
                  Reset Array
                </Button>
                {isSorted && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => markSolved("algo_bubble", "Bubble Sort Stepper")}
                    className="h-7 text-xs bg-emerald-600 text-white"
                  >
                    Sorted! Record Mastery
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3 font-mono">
              <div className="grid grid-cols-6 gap-2">
                {sortedSample.map((v, idx) => {
                  const inWindow = idx >= binaryBounds.lo && idx <= binaryBounds.hi;
                  const isMid = idx === binaryBounds.mid;
                  return (
                    <div
                      key={v}
                      className={`rounded-lg border p-2.5 text-center font-bold ${
                        binaryBounds.found && isMid
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                          : isMid
                            ? "border-amber-400 bg-amber-400/20 text-amber-300"
                            : inWindow
                              ? "border-primary/40 bg-surface-1"
                              : "border-border/40 opacity-40"
                      }`}
                    >
                      {v}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={stepBinarySearch} className="h-7 text-xs">
                  Check Middle Index ({binaryBounds.mid})
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setBinaryBounds({ lo: 0, mid: 2, hi: 5, found: false })}
                  className="h-7 text-xs"
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* #27 ROBOTICS SIMULATOR */}
      {tab === "robotics" && (
        <div className="grid gap-4 md:grid-cols-2 text-xs">
          <div className="space-y-2">
            <div className="grid grid-cols-6 gap-1 max-w-[260px]">
              {Array.from({ length: ROBOT_GRID_SIZE * ROBOT_GRID_SIZE }).map((_, idx) => {
                const x = idx % ROBOT_GRID_SIZE;
                const y = Math.floor(idx / ROBOT_GRID_SIZE);
                const key = `${x},${y}`;
                const isWall = ROBOT_OBSTACLES.has(key);
                const isGoal = x === ROBOT_GOAL.x && y === ROBOT_GOAL.y;
                const isRover = x === robotResult.finalX && y === robotResult.finalY;
                const visited = robotResult.path.some((p) => p.x === x && p.y === y);
                return (
                  <div
                    key={key}
                    className={`aspect-square rounded border flex items-center justify-center font-mono text-[11px] font-bold ${
                      isWall
                        ? "bg-slate-800 border-slate-700 text-slate-500"
                        : isRover
                          ? "bg-primary text-primary-foreground border-primary"
                          : isGoal
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                            : visited
                              ? "bg-primary/15 border-primary/40"
                              : "bg-surface-2 border-border"
                    }`}
                  >
                    {isWall ? "×" : isRover ? "R" : isGoal ? "★" : ""}
                  </div>
                );
              })}
            </div>
            <p className="text-muted-foreground">
              Rover at ({robotResult.finalX},{robotResult.finalY}) → Goal ★ at (5,4)
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {(["FWD", "LEFT", "RIGHT"] as const).map((cmd) => (
                <Button
                  key={cmd}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setRobotQueue((q) => [...q, cmd])}
                  className="h-7 text-xs font-mono"
                >
                  + {cmd}
                </Button>
              ))}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setRobotQueue([])}
                className="h-7 text-xs"
              >
                Clear Queue
              </Button>
            </div>
            <div className="rounded-lg border border-border bg-surface-2/60 p-2.5 font-mono text-[11px]">
              Program: {robotQueue.join(" → ") || "Empty"}
            </div>
            <div className="rounded-lg border border-border bg-surface-1 p-2.5 font-mono text-[11px] space-y-0.5 max-h-28 overflow-y-auto">
              {robotResult.trace.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
            {robotResult.reachedGoal && (
              <Button
                type="button"
                size="sm"
                onClick={() => markSolved("robot_nav", "Rover Grid Navigation")}
                className="h-7 text-xs bg-emerald-600 text-white"
              >
                Goal Reached! Record Robotics Solve
              </Button>
            )}
          </div>
        </div>
      )}

      {/* #28 CYBER SAFETY & DIGITAL/AI LITERACY ACADEMY */}
      {tab === "cyber" && (
        <div className="space-y-5 text-xs">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2.5">
              <h3 className="font-bold text-foreground">Defensive Password Strength Simulator</h3>
              <p className="text-muted-foreground">
                Evaluates length and character diversity purely in memory (nothing is stored or
                transmitted).
              </p>
              <Input
                type="text"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="Try a sample passphrase like Solar*River*94"
                className="font-mono text-xs"
              />
              <div className="flex items-center justify-between font-mono font-bold">
                <span>Strength: {pwStrength.label}</span>
                <span className="text-primary">{pwStrength.score}/4</span>
              </div>
              {pwStrength.feedback.length > 0 && (
                <ul className="text-[11px] text-muted-foreground list-disc ps-4">
                  {pwStrength.feedback.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2.5">
              <h3 className="font-bold text-foreground">Phishing Clue Inspector</h3>
              <p className="text-muted-foreground">
                Select red flags present in an urgent fake login email:
              </p>
              {[
                { id: "domain", text: "Sender domain is support@g00gle-verify-login.xyz" },
                {
                  id: "urgent",
                  text: "Claims account deletion within 15 minutes unless password is typed",
                },
                { id: "mfa", text: "Encourages turning off 2FA verification" },
              ].map((clue) => {
                const selected = phishingPicked.includes(clue.id);
                return (
                  <button
                    key={clue.id}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? phishingPicked.filter((c) => c !== clue.id)
                        : [...phishingPicked, clue.id];
                      setPhishingPicked(next);
                      if (next.length === 3) markSolved("cyber_phishing", "Phishing Defense Audit");
                    }}
                    className={`w-full rounded-lg border px-2.5 py-1.5 text-start ${
                      selected
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                        : "border-border bg-surface-1 text-muted-foreground"
                    }`}
                  >
                    {selected ? "✓ Flagged: " : ""}
                    {clue.text}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 border-t border-border/80 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-sm font-bold text-foreground">
                  Digital & AI Literacy Academy ({eco.completedLiteracyModules.length}/
                  {DIGITAL_LITERACY_MODULES.length} Scenarios Verified)
                </h3>
                <p className="text-muted-foreground">
                  Hands-on verification drills covering AI hallucinations, truncated charts &
                  lateral reading, password privacy, and academic integrity.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {DIGITAL_LITERACY_MODULES.map((mod) => {
                const picked = literacyAnswers[mod.id];
                const isVerified = eco.completedLiteracyModules.includes(mod.id);
                const answeredCorrectly = picked === mod.correctIndex;
                return (
                  <div
                    key={mod.id}
                    className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold">
                        {mod.pillar}
                      </span>
                      {isVerified && (
                        <span className="text-[11px] font-semibold text-emerald-500">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-foreground">{mod.title}</h4>
                    <p className="text-muted-foreground">{mod.coreTakeaway}</p>
                    <ul className="list-disc ps-4 text-[11px] text-muted-foreground space-y-0.5">
                      {mod.keyRules.map((rule) => (
                        <li key={rule}>{rule}</li>
                      ))}
                    </ul>

                    <div className="rounded-lg border border-border bg-surface-1 p-3 space-y-2">
                      <div className="font-semibold text-foreground">
                        Scenario: {mod.realScenario}
                      </div>
                      <div className="text-[11px] font-medium text-primary">
                        {mod.scenarioQuestion}
                      </div>
                      <div className="space-y-1">
                        {mod.options.map((opt, idx) => {
                          const active = picked === idx;
                          const right = idx === mod.correctIndex;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setLiteracyAnswers((prev) => ({ ...prev, [mod.id]: idx }));
                                if (idx === mod.correctIndex) {
                                  if (!eco.completedLiteracyModules.includes(mod.id)) {
                                    updateEco((prev) => ({
                                      ...prev,
                                      completedLiteracyModules: [
                                        ...prev.completedLiteracyModules,
                                        mod.id,
                                      ],
                                    }));
                                  }
                                  toast.success(`Verified ${mod.pillar}!`);
                                }
                              }}
                              className={`w-full rounded-md border px-2.5 py-1.5 text-start text-[11px] transition-colors ${
                                active
                                  ? right
                                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-500 font-semibold"
                                    : "border-rose-500 bg-rose-500/15 text-rose-400"
                                  : "border-border bg-surface-2 hover:border-primary/40"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {picked !== undefined && (
                        <p
                          className={`text-[11px] ${answeredCorrectly ? "text-emerald-500" : "text-amber-500"}`}
                        >
                          {mod.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* #29 APP DESIGN SIMULATOR */}
      {tab === "appdesign" && (
        <div className="grid gap-4 md:grid-cols-2 text-xs">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {["Stat Summary Strip", "Quiz Action Card", "Accessible Footer"].map((blk) => (
                <Button
                  key={blk}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setWireBlocks((w) => [...w, blk])}
                  className="h-7 text-xs"
                >
                  + {blk}
                </Button>
              ))}
              <button
                type="button"
                onClick={() => setContrastGood((c) => !c)}
                className="rounded-md border border-border px-2 py-1 text-[11px]"
              >
                Contrast Test: {contrastGood ? "AA Pass" : "Low Contrast Demo"}
              </button>
            </div>
            <div className="rounded-lg border border-border bg-surface-2/60 p-3 space-y-1.5">
              <div className="font-bold text-foreground">Built-in Accessibility & UX Audit</div>
              <div className={contrastGood ? "text-emerald-400" : "text-rose-400"}>
                • Color Contrast:{" "}
                {contrastGood ? "WCAG AA Compliant (>= 4.5:1)" : "Failing Contrast (< 3:1)"}
              </div>
              <div className="text-emerald-400">
                • Component Structure: {wireBlocks.length} focusable wireframe regions
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => markSolved("app_wireframe", "App Wireframe & Accessibility Audit")}
              className="h-7 text-xs"
            >
              Save App Design Audit
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex gap-1.5">
              {(["mobile", "desktop"] as const).map((vp) => (
                <button
                  key={vp}
                  type="button"
                  onClick={() => setPreviewViewport(vp)}
                  className={`rounded-md border px-2.5 py-1 capitalize font-semibold ${
                    previewViewport === vp
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {vp} frame
                </button>
              ))}
            </div>
            <div
              className={`mx-auto rounded-xl border border-border p-3 space-y-2 transition-all ${
                previewViewport === "mobile" ? "max-w-[260px]" : "w-full"
              } ${contrastGood ? "bg-slate-950 text-slate-100" : "bg-slate-700 text-slate-500"}`}
            >
              {wireBlocks.map((b, idx) => (
                <div
                  key={`${b}-${idx}`}
                  className="rounded-md border border-current/20 px-2.5 py-2 font-medium flex items-center justify-between"
                >
                  <span>{b}</span>
                  <button
                    type="button"
                    onClick={() => setWireBlocks((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-[10px] opacity-70 hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
