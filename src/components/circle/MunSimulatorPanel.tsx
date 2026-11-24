import { useEffect, useState } from "react";
import { Award, FileText, Globe2, Mic, Pause, Play, Plus, RotateCcw, Timer } from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

const MUN_COMMITTEES = [
  "UN General Assembly (DISEC)",
  "UN Environment Programme (UNEP)",
  "UNESCO World Heritage Committee",
  "UN High Commissioner for Refugees (UNHCR)",
];

const SAMPLE_COUNTRIES = [
  { name: "Kuwait", bloc: "Arab League / GCC", capital: "Kuwait City" },
  { name: "Japan", bloc: "Asia-Pacific", capital: "Tokyo" },
  { name: "Norway", bloc: "Western European & Others", capital: "Oslo" },
  { name: "Kenya", bloc: "African Group", capital: "Nairobi" },
  { name: "Brazil", bloc: "GRULAC", capital: "Brasília" },
];

export function MunSimulatorPanel() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: eco, update: updateEco } = useStudentEcosystem();

  const [committee, setCommittee] = useState(MUN_COMMITTEES[0]!);
  const [selectedCountry, setSelectedCountry] = useState(SAMPLE_COUNTRIES[0]!.name);
  const [agendaTopic, setAgendaTopic] = useState(
    "Equitable Transition to Clean Coastal Desalination & Renewable Energy",
  );
  const [positionPaper, setPositionPaper] = useState(
    "The Delegation emphasizes sustainable microgrid investment, technology transfer protocols, and shared regional water research infrastructure.",
  );
  const [clauseDraft, setClauseDraft] = useState("");
  const [resolutionClauses, setResolutionClauses] = useState<string[]>([
    "Urges member states to establish multilateral open-access solar desalination monitoring hubs;",
    "Encourages student research exchanges focused on arid-region water conservation;",
  ]);

  // Speech Timer
  const [speechSeconds, setSpeechSeconds] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setSpeechSeconds((sec) => {
        if (sec <= 1) {
          setTimerRunning(false);
          toast.info("Delegate's speech time has expired.");
          return 0;
        }
        return sec - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const handleAddClause = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clauseDraft.trim()) return;
    setResolutionClauses((prev) => [...prev, clauseDraft.trim()]);
    setClauseDraft("");
  };

  const handleSaveMunDraft = () => {
    updateEco((prev) => ({
      ...prev,
      munDrafts: [
        {
          id: `mun_${Date.now().toString(36)}`,
          country: selectedCountry,
          committee,
          topic: agendaTopic,
          positionPaper,
          clauses: resolutionClauses,
          updatedAt: new Date().toISOString(),
        },
        ...prev.munDrafts.filter((m) => m.topic !== agendaTopic),
      ],
    }));
    toast.success(
      isAr
        ? "تم حفظ مسودة ورقة الموقف والقرار الأممي"
        : "Saved MUN position paper & resolution draft",
    );
  };

  return (
    <div className="surface-card p-5 space-y-4" data-testid="mun-simulator-panel">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Globe2 className="size-5 text-primary" />
          <div>
            <h2 className="text-base font-bold font-display text-foreground">
              37. Model United Nations (MUN) Diplomatic Simulator
            </h2>
            <p className="text-xs text-muted-foreground">
              Draft formal country position papers, practice timed speeches, and structure UN
              resolution operative clauses.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FeatureGuideTrigger featureId="mun-simulator" />
          <Button type="button" size="sm" onClick={handleSaveMunDraft} className="h-8 text-xs">
            <FileText className="size-3.5 me-1.5" />
            Save MUN Dossier
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 text-xs">
        <div className="space-y-3 md:col-span-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="font-semibold text-foreground block mb-1">Committee</label>
              <select
                aria-label="Committee"
                value={committee}
                onChange={(e) => setCommittee(e.target.value)}
                className="w-full h-8 rounded-lg border border-border bg-surface-2 px-2.5 text-xs text-foreground"
              >
                {MUN_COMMITTEES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-foreground block mb-1">
                Assigned Delegation
              </label>
              <select
                aria-label="Assigned Delegation"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full h-8 rounded-lg border border-border bg-surface-2 px-2.5 text-xs text-foreground"
              >
                {SAMPLE_COUNTRIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.bloc})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Agenda Topic</label>
            <Input
              value={agendaTopic}
              onChange={(e) => setAgendaTopic(e.target.value)}
              className="text-xs font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">
              Position Paper (National Perspective & Concrete Policy)
            </label>
            <Textarea
              rows={4}
              value={positionPaper}
              onChange={(e) => setPositionPaper(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-2 pt-1 border-t border-border">
            <span className="font-bold text-foreground">Draft Operative Clauses</span>
            <form onSubmit={handleAddClause} className="flex gap-2">
              <Input
                value={clauseDraft}
                onChange={(e) => setClauseDraft(e.target.value)}
                placeholder="e.g. Calls upon international agencies to..."
                className="text-xs flex-1"
              />
              <Button type="submit" size="sm" className="h-9 text-xs">
                <Plus className="size-3.5 me-1" />
                Add Clause
              </Button>
            </form>
            <div className="space-y-1.5 font-mono text-[11px] text-muted-foreground">
              {resolutionClauses.map((cl, idx) => (
                <div key={idx} className="rounded-lg bg-surface-2 p-2 text-foreground">
                  {idx + 1}. {cl}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Speech Timer and Guidelines */}
        <div className="space-y-3 rounded-xl border border-border bg-surface-2/60 p-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Timer className="size-4 text-primary" />
              Delegate Speech Timer
            </span>
            <span className="font-mono text-lg font-bold tabular-nums text-primary">
              {String(Math.floor(speechSeconds / 60)).padStart(2, "0")}:
              {String(speechSeconds % 60).padStart(2, "0")}
            </span>
          </div>

          <div className="flex gap-1.5">
            <Button
              type="button"
              size="sm"
              onClick={() => setTimerRunning((r) => !r)}
              className="h-7 text-xs flex-1"
            >
              {timerRunning ? <Pause className="size-3 me-1" /> : <Play className="size-3 me-1" />}
              {timerRunning ? "Pause" : "Start"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setTimerRunning(false);
                setSpeechSeconds(60);
              }}
              className="h-7 text-xs"
            >
              <RotateCcw className="size-3" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setTimerRunning(false);
                setSpeechSeconds(90);
              }}
              className="h-7 text-[11px]"
            >
              90s
            </Button>
          </div>

          <div className="space-y-2 text-[11px] text-muted-foreground pt-2 border-t border-border/80">
            <div className="font-semibold text-foreground">Diplomatic Protocol Reminders</div>
            <p>
              • Address the committee through the Chair (&quot;Honorable Chair, Distinguished
              Delegates&quot;).
            </p>
            <p>
              • Maintain third-person reference (&quot;The Delegation of {selectedCountry}{" "}
              submits...&quot;).
            </p>
            <p>
              • Propose measurable actions backed by regional treaties and economic feasibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
