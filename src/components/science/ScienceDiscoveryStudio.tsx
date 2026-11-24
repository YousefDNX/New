import { Suspense, lazy, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Atom,
  BookOpenText,
  CheckCircle2,
  FlaskConical,
  Globe2,
  HeartPulse,
  Orbit,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BODY_SYSTEMS,
  EARTH_LAYERS,
  MOLECULE_PRESETS,
  SPACE_MISSIONS,
  SPACE_PLANETS,
  WEATHER_VS_CLIMATE_CARDS,
  computeAcidBasePh,
  computeKinematicsPoint,
  computeOhmsCircuit,
  computePendulumPeriod,
  computePhotosynthesisRate,
  computeSolubilityGrams,
  type BodySystemNode,
  type TitrationReading,
} from "@/data/science-world";
import {
  evaluateExperimentDesign,
  simplifyScientificPaperLocally,
} from "@/lib/empowerment-engines";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

const LazyBodyExplorer3D = lazy(() =>
  import("@/components/science/BodyExplorer3D").then((m) => ({ default: m.BodyExplorer3D })),
);

type ScienceSubTab = "lab" | "body" | "space" | "molecules" | "physics" | "earth" | "inquiry";

export function ScienceDiscoveryStudio() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: eco, update: updateEco } = useStudentEcosystem();
  const [subTab, setSubTab] = useState<ScienceSubTab>("lab");

  const markSimCompleted = (simId: string, label: string) => {
    if (eco.completedSimulations.includes(simId)) return;
    updateEco((prev) => ({
      ...prev,
      completedSimulations: [...prev.completedSimulations, simId],
    }));
    toast.success(
      isAr ? `تم تسجيل إتمام تجربة: ${label}` : `Recorded simulation mastery: ${label}`,
    );
  };

  // #1 Virtual Science Lab State
  const [labExperiment, setLabExperiment] = useState<"titration" | "photosynthesis" | "solubility">(
    "titration",
  );
  const [naohMl, setNaohMl] = useState(12);
  const [titrationLog, setTitrationLog] = useState<TitrationReading[]>([]);
  const [lightDist, setLightDist] = useState(30);
  const [co2Pct, setCo2Pct] = useState(0.08);
  const [solTempC, setSolTempC] = useState(40);
  const [hypothesisChoice, setHypothesisChoice] = useState<string>("");

  const titration = useMemo(() => computeAcidBasePh(naohMl), [naohMl]);
  const bubbleRate = useMemo(
    () => computePhotosynthesisRate(lightDist, co2Pct),
    [lightDist, co2Pct],
  );
  const kno3Sol = useMemo(() => computeSolubilityGrams("KNO3", solTempC), [solTempC]);
  const naclSol = useMemo(() => computeSolubilityGrams("NaCl", solTempC), [solTempC]);

  // #2 Human Body Explorer State
  const [activeBodyId, setActiveBodyId] = useState<BodySystemNode["id"]>("circulatory");
  const activeBody = useMemo(
    () => BODY_SYSTEMS.find((b) => b.id === activeBodyId) ?? BODY_SYSTEMS[0]!,
    [activeBodyId],
  );

  // #3 Space Explorer State
  const [selectedPlanetId, setSelectedPlanetId] = useState("mars");
  const [earthWeightKg, setEarthWeightKg] = useState(60);
  const activePlanet = useMemo(
    () => SPACE_PLANETS.find((p) => p.id === selectedPlanetId) ?? SPACE_PLANETS[2]!,
    [selectedPlanetId],
  );
  const planetWeightKg = useMemo(
    () => Number(((earthWeightKg * activePlanet.gravityMs2) / 9.81).toFixed(1)),
    [earthWeightKg, activePlanet],
  );

  // #4 Molecule Studio State
  const [selectedMoleculeId, setSelectedMoleculeId] = useState("h2o");
  const [customCarbon, setCustomCarbon] = useState(1);
  const [customHydrogen, setCustomHydrogen] = useState(4);
  const [customOxygen, setCustomOxygen] = useState(0);
  const activeMolecule = useMemo(
    () => MOLECULE_PRESETS.find((m) => m.id === selectedMoleculeId) ?? MOLECULE_PRESETS[0]!,
    [selectedMoleculeId],
  );
  const customValenceBalance = customCarbon * 4 + customOxygen * 2 - customHydrogen;

  // #5 Physics Simulator State
  const [physMode, setPhysMode] = useState<"kinematics" | "pendulum" | "wave" | "circuit">(
    "kinematics",
  );
  const [v0, setV0] = useState(4);
  const [accel, setAccel] = useState(2);
  const [pendLength, setPendLength] = useState(1.2);
  const [waveFreq, setWaveFreq] = useState(2.5);
  const [waveAmp, setWaveAmp] = useState(28);
  const [voltage, setVoltage] = useState(12);
  const [r1, setR1] = useState(6);
  const [r2, setR2] = useState(12);
  const [circuitMode, setCircuitMode] = useState<"series" | "parallel">("series");

  const kinematicsPoints = useMemo(
    () =>
      [0, 1, 2, 3, 4, 5].map((sec) => ({
        t: sec,
        ...computeKinematicsPoint(v0, accel, sec),
      })),
    [v0, accel],
  );
  const pendulumPeriod = useMemo(() => computePendulumPeriod(pendLength), [pendLength]);
  const circuitResult = useMemo(
    () => computeOhmsCircuit({ voltage, r1, r2, mode: circuitMode }),
    [voltage, r1, r2, circuitMode],
  );
  const wavePathD = useMemo(() => {
    const pts: string[] = [];
    for (let x = 0; x <= 280; x += 6) {
      const y = 60 - waveAmp * Math.sin((x / 280) * Math.PI * 2 * waveFreq);
      pts.push(`${x === 0 ? "M" : "L"} ${x} ${y.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [waveAmp, waveFreq]);

  // #6 Earth Explorer State
  const [weatherAnswers, setWeatherAnswers] = useState<Record<string, "weather" | "climate">>({});

  // #31 Scientific Paper Simplifier & #32 Experiment Design Studio State
  const [paperTitle, setPaperTitle] = useState("Urban Shade Trees & Courtyard Temperature");
  const [paperAbstract, setPaperAbstract] = useState(
    "This pilot study examined whether planting native Acacia shade trees reduces midday courtyard pavement temperature over 4 weeks. Researchers measured shaded vs unshaded tiles with identical infrared thermometers at noon. Shaded tiles showed 7.4 C lower peak temperatures. Short study duration and single campus measurements limit seasonal generalization.",
  );
  const [paperAiLoading, setPaperAiLoading] = useState(false);
  const [paperAiNote, setPaperAiNote] = useState<string | null>(null);
  const simplifiedPaper = useMemo(
    () => simplifyScientificPaperLocally(paperAbstract, paperTitle),
    [paperAbstract, paperTitle],
  );

  const [expTitle, setExpTitle] = useState("White vs Dark Paper Solar Heat Absorption");
  const [expIv, setExpIv] = useState("Paper color surface (white vs matte black)");
  const [expDv, setExpDv] = useState("Cup water temperature rise after 15 min (°C)");
  const [expControls, setExpControls] = useState(
    "Equal water volume (100 mL), identical cups, same sunlight angle",
  );
  const [expMaterials, setExpMaterials] = useState(
    "2 paper cups, water, digital thermometer, white/black paper sleeves",
  );
  const [expTrialsText, setExpTrialsText] = useState("26.2, 26.5, 26.4");
  const [expHazardChecked, setExpHazardChecked] = useState(true);

  const parsedTrialNumbers = useMemo(
    () =>
      expTrialsText
        .split(/[\s,]+/)
        .map((n) => Number(n.trim()))
        .filter((n) => Number.isFinite(n)),
    [expTrialsText],
  );
  const expEval = useMemo(
    () =>
      evaluateExperimentDesign({
        title: expTitle,
        iv: expIv,
        dv: expDv,
        controls: expControls
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        materials: expMaterials,
        trials: parsedTrialNumbers,
        hazardChecked: expHazardChecked,
      }),
    [expTitle, expIv, expDv, expControls, expMaterials, parsedTrialNumbers, expHazardChecked],
  );

  const tabs: Array<{ id: ScienceSubTab; label: string; icon: typeof FlaskConical }> = [
    { id: "lab", label: isAr ? "المختبر الافتراضي" : "1. Virtual Lab", icon: FlaskConical },
    { id: "body", label: isAr ? "جسم الإنسان" : "2. Body Explorer", icon: HeartPulse },
    { id: "space", label: isAr ? "الفضاء والكواكب" : "3. Space Explorer", icon: Orbit },
    { id: "molecules", label: isAr ? "استوديو الجزيئات" : "4. Molecules", icon: Atom },
    { id: "physics", label: isAr ? "محاكي الفيزياء" : "5. Physics Lab", icon: Zap },
    { id: "earth", label: isAr ? "مستكشف الأرض" : "6. Earth Explorer", icon: Globe2 },
    {
      id: "inquiry",
      label: isAr ? "تصميم التجارب والأوراق" : "Paper & Experiment Studio",
      icon: BookOpenText,
    },
  ];

  return (
    <div className="space-y-5" data-testid="science-discovery-studio">
      <div className="surface-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold font-display text-foreground">
              {isAr ? "عالم العلوم والاكتشافات التفاعلية" : "World of Science Discovery Studio"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "6 مختبرات علمية تفاعلية مع قراءات لحظية وتوثيق للتجارب في خريطة النمو."
                : "6 interactive laboratories covering chemistry, anatomy, astrophysics, molecular geometry, physics, and Earth science."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono tabular-nums text-xs text-primary font-semibold">
              {eco.completedSimulations.filter((id) => id.startsWith("sci_")).length}/6{" "}
              {isAr ? "تجارب موثقة" : "science labs recorded"}
            </span>
            <FeatureGuideTrigger featureId="science-studio" />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
          {tabs.map((tabItem) => {
            const Icon = tabItem.icon;
            const active = subTab === tabItem.id;
            return (
              <button
                key={tabItem.id}
                type="button"
                onClick={() => setSubTab(tabItem.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{tabItem.label}</span>
              </button>
            );
          })}
        </div>

        <div
          data-testid="science-model-limitations"
          className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3.5 py-2 text-[11px] text-foreground flex items-start gap-2"
        >
          <AlertTriangle className="size-3.5 text-sky-400 shrink-0 mt-0.5" />
          <span>
            {isAr
              ? "حدود النماذج العلمية: تستخدم هذه المحاكيات معادلات مثالية مبسطة (تجاهل مقاومة الهواء، الخطية التقريبية للمعايرة، والموصلية الأومية المثالية) لدعم الفهم المفاهيمي ولا تُغني عن القياس المخبري الحقيقي."
              : "Model Limitations Notice: Interactive labs use simplified idealized equations (e.g., dilute strong acid-base stoichiometry, frictionless small-angle pendulums, ideal Ohmic conductors) to visualize physical trends — not replacement metrology for real laboratory tolerances."}
          </span>
        </div>

        {/* #1 VIRTUAL SCIENCE LAB */}
        {subTab === "lab" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-foreground">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                <span>
                  {isAr
                    ? "محاكاة تعليمية آمنة فقط. التجارب المخبرية الحقيقية تتطلب إشراف معلم المختبر وارتداء النظارات والقفازات الواقية."
                    : "Safety notice: Virtual educational model only. Real wet-lab acids/bases require certified teacher supervision, splash goggles, and lab ventilation."}
                </span>
              </div>
              <div className="flex gap-1.5">
                {(["titration", "photosynthesis", "solubility"] as const).map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => setLabExperiment(exp)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${
                      labExperiment === exp
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-2 text-muted-foreground"
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            {labExperiment === "titration" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">
                      HCl + NaOH Neutralization (25.0 mL · 0.10 M)
                    </h3>
                    <span className="font-mono tabular-nums text-xs font-bold text-primary">
                      pH {titration.ph}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className="h-24 w-16 rounded-b-2xl border-2 border-border/80 transition-colors flex items-end justify-center pb-2 text-[10px] font-mono font-bold text-white shadow-inner"
                      style={{ backgroundColor: titration.indicatorHex }}
                    >
                      pH {titration.ph}
                    </div>
                    <div className="flex-1 space-y-2 text-xs">
                      <p className="font-semibold text-foreground">{titration.indicatorLabel}</p>
                      <label className="block space-y-1">
                        <span className="text-muted-foreground font-mono tabular-nums">
                          Added NaOH Volume: {naohMl} mL
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={40}
                          step={1}
                          value={naohMl}
                          onChange={(e) => setNaohMl(Number(e.target.value))}
                          className="w-full accent-primary"
                        />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setTitrationLog((prev) => [
                              ...prev.slice(-5),
                              {
                                volumeMl: naohMl,
                                ph: titration.ph,
                                indicatorColor: titration.indicatorHex,
                              },
                            ]);
                          }}
                          className="h-7 text-xs"
                        >
                          Record Reading
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => markSimCompleted("sci_lab", "Virtual Science Lab")}
                          className="h-7 text-xs"
                        >
                          <CheckCircle2 className="size-3.5 me-1" />
                          Complete Lab
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-muted-foreground">Hypothesis Check:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: "15", label: "Equivalence at 15 mL" },
                        { id: "25", label: "Equivalence at 25 mL (Correct: equal moles)" },
                        { id: "40", label: "Equivalence at 40 mL" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setHypothesisChoice(opt.id)}
                          className={`rounded-md border px-2 py-1 text-[11px] ${
                            hypothesisChoice === opt.id
                              ? opt.id === "25"
                                ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                                : "border-amber-500 bg-amber-500/15 text-amber-400"
                              : "border-border bg-surface-1 text-muted-foreground"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Titration Readings Log
                  </h4>
                  {titrationLog.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center">
                      Adjust the NaOH slider and click &quot;Record Reading&quot; to plot your data
                      table.
                    </p>
                  ) : (
                    <table className="w-full text-xs font-mono tabular-nums">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="py-1 text-start">NaOH (mL)</th>
                          <th className="py-1 text-start">pH</th>
                          <th className="py-1 text-start">Color</th>
                        </tr>
                      </thead>
                      <tbody>
                        {titrationLog.map((r, i) => (
                          <tr key={`${r.volumeMl}-${i}`} className="border-b border-border/50">
                            <td className="py-1">{r.volumeMl} mL</td>
                            <td className="py-1">{r.ph}</td>
                            <td className="py-1">
                              <span
                                className="inline-block size-3 rounded-full align-middle"
                                style={{ backgroundColor: r.indicatorColor }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {labExperiment === "photosynthesis" && (
              <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-foreground">
                    Photosynthesis Limiting Factors (Elodea O₂ Model)
                  </h3>
                  <span className="font-mono tabular-nums text-sm font-bold text-emerald-400">
                    {bubbleRate} O₂ bubbles / min
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <label className="space-y-1">
                    <span className="font-mono tabular-nums text-muted-foreground">
                      Lamp Distance: {lightDist} cm (Inverse-Square Light Intensity)
                    </span>
                    <input
                      type="range"
                      min={10}
                      max={80}
                      step={5}
                      value={lightDist}
                      onChange={(e) => setLightDist(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-mono tabular-nums text-muted-foreground">
                      Dissolved CO₂: {co2Pct.toFixed(2)}%
                    </span>
                    <input
                      type="range"
                      min={0.02}
                      max={0.2}
                      step={0.02}
                      value={co2Pct}
                      onChange={(e) => setCo2Pct(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </label>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => markSimCompleted("sci_lab", "Virtual Science Lab")}
                  className="h-7 text-xs"
                >
                  Record Photosynthesis Observation
                </Button>
              </div>
            )}

            {labExperiment === "solubility" && (
              <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-foreground">
                    Aqueous Solubility vs. Temperature (g solute / 100 g H₂O)
                  </h3>
                  <span className="font-mono tabular-nums text-xs font-bold text-primary">
                    {solTempC} °C
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={solTempC}
                  onChange={(e) => setSolTempC(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="grid gap-3 sm:grid-cols-2 text-xs font-mono tabular-nums">
                  <div className="rounded-lg border border-border bg-surface-1 p-3">
                    <div className="text-muted-foreground">Potassium Nitrate (KNO₃)</div>
                    <div className="text-lg font-bold text-foreground">{kno3Sol} g / 100 g H₂O</div>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-1 p-3">
                    <div className="text-muted-foreground">Sodium Chloride (NaCl)</div>
                    <div className="text-lg font-bold text-foreground">{naclSol} g / 100 g H₂O</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* #2 HUMAN BODY EXPLORER */}
        {subTab === "body" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs text-foreground">
              {isAr
                ? "تنبيه: هذه الأداة تعليمية لاستكشاف أجهزة جسم الإنسان فقط، ولا تُعد استشارة أو تشخيصاً طبياً."
                : "Educational notice: Anatomy schematic for study only — does not provide medical advice, diagnosis, or treatment."}
            </div>
            <div className="grid gap-4 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <Suspense
                  fallback={
                    <div className="h-[340px] rounded-xl border border-border bg-surface-2 flex items-center justify-center text-xs text-muted-foreground">
                      Loading 3D Body Explorer...
                    </div>
                  }
                >
                  <LazyBodyExplorer3D
                    activeSystemId={activeBodyId}
                    onSelectSystem={(id) => {
                      setActiveBodyId(id);
                      markSimCompleted("sci_body", "Human Body Explorer");
                    }}
                  />
                </Suspense>
              </div>
              <div className="lg:col-span-2 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {BODY_SYSTEMS.map((sys) => (
                    <button
                      key={sys.id}
                      type="button"
                      onClick={() => setActiveBodyId(sys.id)}
                      className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${
                        activeBodyId === sys.id
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isAr ? sys.nameAr : sys.nameEn}
                    </button>
                  ))}
                </div>
                <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-full shrink-0"
                      style={{ backgroundColor: activeBody.color }}
                    />
                    <h3 className="text-sm font-bold text-foreground">
                      {isAr ? activeBody.nameAr : activeBody.nameEn}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isAr ? activeBody.roleAr : activeBody.roleEn}
                  </p>
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-foreground">
                      {isAr ? "الأعضاء الرئيسية:" : "Key Structures:"}
                    </div>
                    <div className="text-muted-foreground">{activeBody.organs.join(" · ")}</div>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-foreground">
                      {isAr ? "الترابط الحيوي:" : "System Interconnections:"}
                    </div>
                    <div className="text-primary">{activeBody.interlinks.join(" ↔ ")}</div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => markSimCompleted("sci_body", "Human Body Explorer")}
                    className="h-7 text-xs w-full"
                  >
                    Log Anatomy Study
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* #3 SPACE EXPLORER */}
        {subTab === "space" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                Visual distances are non-linear; numerical AU and gravity values reflect planetary
                measurements.
              </span>
              <Button
                type="button"
                size="sm"
                onClick={() => markSimCompleted("sci_space", "Space Explorer")}
                className="h-7 text-xs"
              >
                Record Astronomy Session
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SPACE_PLANETS.map((planet) => (
                <button
                  key={planet.id}
                  type="button"
                  onClick={() => setSelectedPlanetId(planet.id)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                    selectedPlanetId === planet.id
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: planet.color }}
                  />
                  <span>{planet.name}</span>
                </button>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">{activePlanet.name}</h3>
                  <span className="text-[11px] font-mono text-primary">{activePlanet.type}</span>
                </div>
                <p className="text-xs text-muted-foreground">{activePlanet.highlight}</p>
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono tabular-nums">
                  <div className="rounded-lg bg-surface-1 p-2">
                    <div className="text-muted-foreground">Orbital Radius</div>
                    <div className="font-bold text-foreground">{activePlanet.auDistance} AU</div>
                  </div>
                  <div className="rounded-lg bg-surface-1 p-2">
                    <div className="text-muted-foreground">Surface Gravity</div>
                    <div className="font-bold text-foreground">{activePlanet.gravityMs2} m/s²</div>
                  </div>
                  <div className="rounded-lg bg-surface-1 p-2">
                    <div className="text-muted-foreground">Solar Year</div>
                    <div className="font-bold text-foreground">{activePlanet.yearDays} d</div>
                  </div>
                  <div className="rounded-lg bg-surface-1 p-2">
                    <div className="text-muted-foreground">Known Moons</div>
                    <div className="font-bold text-foreground">{activePlanet.moons}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Gravitational Weight Simulator & Missions
                </h4>
                <label className="block space-y-1 text-xs">
                  <span className="font-mono tabular-nums text-muted-foreground">
                    Reference Earth Mass-Weight: {earthWeightKg} kg →{" "}
                    <strong className="text-primary">{planetWeightKg} kgf</strong> on{" "}
                    {activePlanet.name}
                  </span>
                  <input
                    type="range"
                    min={20}
                    max={120}
                    value={earthWeightKg}
                    onChange={(e) => setEarthWeightKg(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pe-1">
                  {SPACE_MISSIONS.map((m) => (
                    <div
                      key={m.name}
                      className="rounded-lg border border-border/60 bg-surface-1 px-2.5 py-1.5 text-xs"
                    >
                      <span className="font-mono font-bold text-primary">{m.year}</span> ·{" "}
                      <span className="font-semibold text-foreground">{m.name}</span>{" "}
                      <span className="text-muted-foreground">
                        ({m.agency}) — {m.summary}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* #4 MOLECULE STUDIO */}
        {subTab === "molecules" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {MOLECULE_PRESETS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMoleculeId(m.id)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
                      selectedMoleculeId === m.id
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-surface-1 text-muted-foreground"
                    }`}
                  >
                    {m.formula} · {m.name}
                  </button>
                ))}
              </div>
              <svg
                viewBox="0 0 280 185"
                className="w-full rounded-lg border border-border bg-surface-1"
              >
                {activeMolecule.bonds.map((bond, idx) => {
                  const a1 = activeMolecule.atoms[bond.from];
                  const a2 = activeMolecule.atoms[bond.to];
                  if (!a1 || !a2) return null;
                  return (
                    <g key={idx}>
                      <line
                        x1={a1.x}
                        y1={a1.y}
                        x2={a2.x}
                        y2={a2.y}
                        stroke="#94a3b8"
                        strokeWidth={bond.order === 2 ? 6 : 3.5}
                      />
                      {bond.order === 2 && (
                        <line
                          x1={a1.x}
                          y1={a1.y}
                          x2={a2.x}
                          y2={a2.y}
                          stroke="#0f172a"
                          strokeWidth={1.5}
                        />
                      )}
                    </g>
                  );
                })}
                {activeMolecule.atoms.map((atom, idx) => (
                  <g key={idx}>
                    <circle cx={atom.x} cy={atom.y} r={atom.r} fill={atom.color} />
                    <text
                      x={atom.x}
                      y={atom.y + 4}
                      textAnchor="middle"
                      className="fill-slate-950 text-[11px] font-bold"
                    >
                      {atom.symbol}
                    </text>
                  </g>
                ))}
              </svg>
              <div className="text-xs space-y-1">
                <div className="font-mono text-primary font-semibold">
                  {activeMolecule.geometry} · Angle {activeMolecule.bondAngle} ·{" "}
                  {activeMolecule.bondType}
                </div>
                <p className="text-muted-foreground">{activeMolecule.note}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
              <h3 className="text-sm font-bold text-foreground">Custom Valence Bond Checker</h3>
              <p className="text-xs text-muted-foreground">
                Schematic octet model (C = 4 bonds, O = 2 bonds, H = 1 bond). Not a quantum orbital
                solver.
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono tabular-nums">
                <label className="rounded-lg border border-border bg-surface-1 p-2 space-y-1">
                  <span>Carbon (C)</span>
                  <input
                    type="number"
                    min={0}
                    max={4}
                    value={customCarbon}
                    onChange={(e) =>
                      setCustomCarbon(Math.max(0, Math.min(4, Number(e.target.value))))
                    }
                    className="w-full rounded border border-border bg-surface-2 px-2 py-1"
                  />
                </label>
                <label className="rounded-lg border border-border bg-surface-1 p-2 space-y-1">
                  <span>Hydrogen (H)</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={customHydrogen}
                    onChange={(e) =>
                      setCustomHydrogen(Math.max(0, Math.min(10, Number(e.target.value))))
                    }
                    className="w-full rounded border border-border bg-surface-2 px-2 py-1"
                  />
                </label>
                <label className="rounded-lg border border-border bg-surface-1 p-2 space-y-1">
                  <span>Oxygen (O)</span>
                  <input
                    type="number"
                    min={0}
                    max={4}
                    value={customOxygen}
                    onChange={(e) =>
                      setCustomOxygen(Math.max(0, Math.min(4, Number(e.target.value))))
                    }
                    className="w-full rounded border border-border bg-surface-2 px-2 py-1"
                  />
                </label>
              </div>
              <div className="rounded-lg border border-border bg-surface-1 p-3 text-xs space-y-1">
                <div className="font-mono font-bold text-foreground">
                  Formula: {customCarbon ? `C${customCarbon}` : ""}
                  {customHydrogen ? `H${customHydrogen}` : ""}
                  {customOxygen ? `O${customOxygen}` : ""}
                </div>
                <div
                  className={
                    customValenceBalance === 0
                      ? "text-emerald-400 font-semibold"
                      : "text-amber-400 font-semibold"
                  }
                >
                  {customValenceBalance === 0
                    ? "Single-bond octet satisfied (0 unsatisfied valence sites)."
                    : customValenceBalance > 0
                      ? `${customValenceBalance} open bond sites remain — requires double/triple bonds or more H.`
                      : `${Math.abs(customValenceBalance)} excess H atoms beyond single-bond octet capacity.`}
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => markSimCompleted("sci_molecules", "Molecule Studio")}
                className="h-7 text-xs"
              >
                Complete Molecule Practice
              </Button>
            </div>
          </div>
        )}

        {/* #5 PHYSICS SIMULATOR */}
        {subTab === "physics" && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {(["kinematics", "pendulum", "wave", "circuit"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPhysMode(m)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-semibold capitalize ${
                    physMode === m
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
              <Button
                type="button"
                size="sm"
                onClick={() => markSimCompleted("sci_physics", "Physics Simulator")}
                className="h-7 text-xs ms-auto"
              >
                Save Physics Lab
              </Button>
            </div>

            {physMode === "kinematics" && (
              <div className="grid gap-4 md:grid-cols-2 rounded-xl border border-border bg-surface-2/60 p-4">
                <div className="space-y-3 text-xs">
                  <label className="block space-y-1 font-mono tabular-nums">
                    <span>Initial Velocity (v₀): {v0} m/s</span>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={v0}
                      onChange={(e) => setV0(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </label>
                  <label className="block space-y-1 font-mono tabular-nums">
                    <span>Acceleration (a): {accel} m/s²</span>
                    <input
                      type="range"
                      min={-4}
                      max={10}
                      value={accel}
                      onChange={(e) => setAccel(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </label>
                  <p className="text-muted-foreground font-mono">
                    Equations: v = v₀ + at · Δx = v₀t + ½at²
                  </p>
                </div>
                <table className="w-full text-xs font-mono tabular-nums">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="py-1 text-start">t (s)</th>
                      <th className="py-1 text-start">v (m/s)</th>
                      <th className="py-1 text-start">Δx (m)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kinematicsPoints.map((pt) => (
                      <tr key={pt.t} className="border-b border-border/50">
                        <td className="py-1">{pt.t}s</td>
                        <td className="py-1 text-primary">{pt.velocity}</td>
                        <td className="py-1">{pt.displacement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {physMode === "pendulum" && (
              <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between font-mono tabular-nums">
                  <span>String Length: {pendLength.toFixed(1)} m</span>
                  <span className="text-sm font-bold text-primary">
                    Period T = {pendulumPeriod} s (T = 2π√(L/g))
                  </span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={4.0}
                  step={0.1}
                  value={pendLength}
                  onChange={(e) => setPendLength(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <p className="text-muted-foreground">
                  Notice mass does not change small-angle pendulum period — only string length L and
                  gravity g determine T.
                </p>
              </div>
            )}

            {physMode === "wave" && (
              <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3 text-xs">
                <div className="grid gap-3 sm:grid-cols-2 font-mono tabular-nums">
                  <label className="space-y-1">
                    <span>Frequency: {waveFreq.toFixed(1)} Hz</span>
                    <input
                      type="range"
                      min={1}
                      max={6}
                      step={0.5}
                      value={waveFreq}
                      onChange={(e) => setWaveFreq(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </label>
                  <label className="space-y-1">
                    <span>Amplitude: {waveAmp} px</span>
                    <input
                      type="range"
                      min={10}
                      max={48}
                      step={2}
                      value={waveAmp}
                      onChange={(e) => setWaveAmp(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </label>
                </div>
                <svg
                  viewBox="0 0 280 120"
                  className="w-full h-32 rounded-lg border border-border bg-surface-1"
                >
                  <line x1="0" y1="60" x2="280" y2="60" stroke="#475569" strokeDasharray="3 3" />
                  <path d={wavePathD} fill="none" stroke="#14b8a6" strokeWidth="2.5" />
                </svg>
              </div>
            )}

            {physMode === "circuit" && (
              <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3 text-xs font-mono tabular-nums">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={circuitMode === "series" ? "default" : "outline"}
                    onClick={() => setCircuitMode("series")}
                    className="h-7 text-xs"
                  >
                    Series (R₁ + R₂)
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={circuitMode === "parallel" ? "default" : "outline"}
                    onClick={() => setCircuitMode("parallel")}
                    className="h-7 text-xs"
                  >
                    Parallel (1/R₁ + 1/R₂)⁻¹
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="space-y-1">
                    <span>Source: {voltage} V</span>
                    <input
                      type="range"
                      min={1}
                      max={24}
                      value={voltage}
                      onChange={(e) => setVoltage(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </label>
                  <label className="space-y-1">
                    <span>R₁: {r1} Ω</span>
                    <input
                      type="range"
                      min={1}
                      max={50}
                      value={r1}
                      onChange={(e) => setR1(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </label>
                  <label className="space-y-1">
                    <span>R₂: {r2} Ω</span>
                    <input
                      type="range"
                      min={1}
                      max={50}
                      value={r2}
                      onChange={(e) => setR2(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="rounded-lg bg-surface-1 p-2.5">
                    <div className="text-muted-foreground">Req</div>
                    <div className="text-base font-bold text-foreground">
                      {circuitResult.equivalentR} Ω
                    </div>
                  </div>
                  <div className="rounded-lg bg-surface-1 p-2.5">
                    <div className="text-muted-foreground">Current (I = V/R)</div>
                    <div className="text-base font-bold text-primary">
                      {circuitResult.currentAmps} A
                    </div>
                  </div>
                  <div className="rounded-lg bg-surface-1 p-2.5">
                    <div className="text-muted-foreground">Power (P = VI)</div>
                    <div className="text-base font-bold text-foreground">
                      {circuitResult.powerWatts} W
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* #6 EARTH EXPLORER */}
        {subTab === "earth" && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              {EARTH_LAYERS.map((layer) => (
                <div
                  key={layer.id}
                  className="rounded-xl border border-border bg-surface-2/60 p-3.5 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-foreground">{layer.title}</h3>
                    <Activity className="size-3.5 text-primary shrink-0" />
                  </div>
                  <div className="text-[11px] font-mono text-primary">{layer.source}</div>
                  <p className="text-muted-foreground">{layer.mechanism}</p>
                  <p className="text-foreground/90 font-medium">{layer.fact}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Weather vs. Climate Classification Challenge
                </h4>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => markSimCompleted("sci_earth", "Earth Explorer")}
                  className="h-7 text-xs"
                >
                  Record Earth Science
                </Button>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {WEATHER_VS_CLIMATE_CARDS.map((card) => {
                  const chosen = weatherAnswers[card.id];
                  const isCorrect = chosen === card.answer;
                  return (
                    <div
                      key={card.id}
                      className="rounded-lg border border-border bg-surface-1 p-3 space-y-2 text-xs"
                    >
                      <p className="font-medium text-foreground">{card.statement}</p>
                      <div className="flex gap-1.5">
                        {(["weather", "climate"] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setWeatherAnswers((prev) => ({ ...prev, [card.id]: opt }))
                            }
                            className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold capitalize ${
                              chosen === opt
                                ? isCorrect
                                  ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                                  : "border-rose-500 bg-rose-500/15 text-rose-400"
                                : "border-border bg-surface-2 text-muted-foreground"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      {chosen && (
                        <p className="text-[11px] text-muted-foreground">
                          {isCorrect ? "Correct: " : `Expected ${card.answer}: `}
                          {card.why}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* #31 SCIENTIFIC PAPER SIMPLIFIER & #32 EXPERIMENT DESIGN STUDIO */}
        {subTab === "inquiry" && (
          <div className="grid gap-5 lg:grid-cols-2 text-xs" data-testid="science-inquiry-studio">
            {/* Scientific Paper Simplifier */}
            <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-sm font-bold text-foreground">
                  31. Scientific Paper &amp; Abstract Simplifier (IMRAD)
                </h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={paperAiLoading || !paperAbstract.trim()}
                  className="h-7 text-[11px]"
                  onClick={async () => {
                    setPaperAiLoading(true);
                    try {
                      const res = await fetch("/api/ai/structured", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          mode: "simplify",
                          subject: "Science Literature",
                          prompt:
                            "Summarize this scientific abstract plainly with 3 key takeaways and limits.",
                          sourceText: paperAbstract,
                        }),
                      });
                      const json = (await res.json()) as {
                        ok?: boolean;
                        data?: { simplifiedText?: string };
                        message?: string;
                      };
                      if (res.ok && json.ok && json.data?.simplifiedText) {
                        setPaperAiNote(json.data.simplifiedText);
                        toast.success("AI plain-language synthesis ready!");
                      } else {
                        toast.info("AI unavailable — local IMRAD parser active below.");
                      }
                    } catch {
                      toast.info("Offline — local IMRAD parser active below.");
                    } finally {
                      setPaperAiLoading(false);
                    }
                  }}
                >
                  <Sparkles className="size-3 text-primary" />
                  <span>{paperAiLoading ? "Simplifying..." : "AI Plain-Summary"}</span>
                </Button>
              </div>
              <Input
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
                placeholder="Study / Paper Title"
                className="text-xs"
              />
              <Textarea
                rows={4}
                value={paperAbstract}
                onChange={(e) => {
                  setPaperAbstract(e.target.value);
                  setPaperAiNote(null);
                }}
                placeholder="Paste a research abstract or lab paragraph..."
                className="text-xs"
              />
              <div className="space-y-2 rounded-lg border border-border bg-surface p-3">
                <div>
                  <span className="font-bold text-primary">Question: </span>
                  <span className="text-foreground">{simplifiedPaper.question}</span>
                </div>
                <div>
                  <span className="font-bold text-primary">Method &amp; Sample: </span>
                  <span className="text-foreground">{simplifiedPaper.method}</span>
                </div>
                <div>
                  <span className="font-bold text-primary">Key Finding: </span>
                  <span className="text-foreground">{simplifiedPaper.findings}</span>
                </div>
                <div>
                  <span className="font-bold text-xp">Limitations / Caution Checks: </span>
                  <ul className="list-disc ps-4 text-muted-foreground">
                    {simplifiedPaper.limitations.map((lim) => (
                      <li key={lim}>{lim}</li>
                    ))}
                  </ul>
                </div>
                {paperAiNote && (
                  <div className="rounded-md border border-primary/30 bg-primary/5 p-2 text-foreground">
                    <strong>AI Summary:</strong> {paperAiNote}
                  </div>
                )}
              </div>
              <Button
                type="button"
                size="sm"
                variant="glow"
                onClick={() => {
                  updateEco((prev) => ({
                    ...prev,
                    simplifiedPapers: [
                      {
                        id: `pap_${Date.now().toString(36)}`,
                        title: simplifiedPaper.title,
                        question: simplifiedPaper.question,
                        method: simplifiedPaper.method,
                        findings: simplifiedPaper.findings,
                        limitations: simplifiedPaper.limitations.join(" | "),
                        createdAt: new Date().toISOString(),
                      },
                      ...prev.simplifiedPapers,
                    ],
                  }));
                  toast.success("Saved simplified IMRAD study note!");
                }}
              >
                Save IMRAD Breakdown ({eco.simplifiedPapers.length})
              </Button>
            </div>

            {/* Experiment Design Studio */}
            <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-sm font-bold text-foreground">
                  32. Experiment Design Studio (Variables, Controls &amp; Safety Gate)
                </h3>
                <span
                  className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                    expEval.safetyBlocked
                      ? "bg-destructive/20 text-destructive"
                      : expEval.valid
                        ? "bg-success/20 text-success"
                        : "bg-xp/20 text-xp"
                  }`}
                >
                  {expEval.safetyBlocked
                    ? "SAFETY BLOCKED"
                    : expEval.valid
                      ? "READY"
                      : "CHECK DESIGN"}
                </span>
              </div>
              <Input
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                placeholder="Investigation Title"
                className="text-xs"
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  value={expIv}
                  onChange={(e) => setExpIv(e.target.value)}
                  placeholder="Independent Variable (Changed)"
                  className="text-xs"
                />
                <Input
                  value={expDv}
                  onChange={(e) => setExpDv(e.target.value)}
                  placeholder="Dependent Variable (Measured)"
                  className="text-xs"
                />
              </div>
              <Input
                value={expControls}
                onChange={(e) => setExpControls(e.target.value)}
                placeholder="Controlled Variables (comma-separated)"
                className="text-xs"
              />
              <Input
                value={expMaterials}
                onChange={(e) => setExpMaterials(e.target.value)}
                placeholder="Safe Materials (household/classroom certified)"
                className="text-xs"
              />
              <Input
                value={expTrialsText}
                onChange={(e) => setExpTrialsText(e.target.value)}
                placeholder="Trial measurements (e.g., 26.2, 26.5, 26.4)"
                className="text-xs font-mono"
              />
              <label className="flex cursor-pointer items-center gap-2 text-[11px] text-foreground">
                <input
                  type="checkbox"
                  checked={expHazardChecked}
                  onChange={(e) => setExpHazardChecked(e.target.checked)}
                  className="accent-primary"
                />
                <span>
                  I confirm all materials are classroom-safe with no unsupervised flames or
                  hazardous chemicals.
                </span>
              </label>

              <div className="grid grid-cols-3 gap-2 font-mono tabular-nums">
                <div className="rounded-lg bg-surface p-2">
                  <div className="text-[10px] text-muted-foreground">Trials</div>
                  <div className="font-bold">{expEval.trialCount}</div>
                </div>
                <div className="rounded-lg bg-surface p-2">
                  <div className="text-[10px] text-muted-foreground">Mean</div>
                  <div className="font-bold text-primary">{expEval.mean ?? "—"}</div>
                </div>
                <div className="rounded-lg bg-surface p-2">
                  <div className="text-[10px] text-muted-foreground">Range</div>
                  <div className="font-bold">{expEval.range ?? "—"}</div>
                </div>
              </div>

              {expEval.issues.length > 0 && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-[11px] text-foreground space-y-0.5">
                  {expEval.issues.map((iss) => (
                    <p key={iss}>• {iss}</p>
                  ))}
                </div>
              )}

              <Button
                type="button"
                size="sm"
                variant="glow"
                disabled={!expEval.valid}
                onClick={() => {
                  updateEco((prev) => ({
                    ...prev,
                    experimentDesigns: [
                      {
                        id: `exp_${Date.now().toString(36)}`,
                        title: expTitle.trim(),
                        iv: expIv.trim(),
                        dv: expDv.trim(),
                        controls: expControls
                          .split(",")
                          .map((c) => c.trim())
                          .filter(Boolean),
                        materials: expMaterials.trim(),
                        trials: parsedTrialNumbers.map((v, i) => ({
                          label: `Trial ${i + 1}`,
                          value: v,
                        })),
                        hazardChecked: expHazardChecked,
                        conclusion: `Mean=${expEval.mean} across ${expEval.trialCount} controlled trials.`,
                        createdAt: new Date().toISOString(),
                      },
                      ...prev.experimentDesigns,
                    ],
                  }));
                  markSimCompleted("sci_inquiry_design", "Experiment Design Studio");
                  toast.success("Saved validated Experiment Design!");
                }}
              >
                <CheckCircle2 className="size-3.5" />
                <span>Save Validated Experiment ({eco.experimentDesigns.length})</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
