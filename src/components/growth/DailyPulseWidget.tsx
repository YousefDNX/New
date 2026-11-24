import { useMemo, useState } from "react";
import { CheckCircle2, HeartPulse, Lock, Sparkles, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCareActions, useCareEntries } from "@/hooks/use-modules";
import type { CareMood } from "@/lib/firestore-data";
import { computeWeeklyPulseSummary } from "@/lib/growth";
import { formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";

export function DailyPulseWidget() {
  const { t, lang } = usePrefs();
  const { data: entries = [] } = useCareEntries();
  const { addCareEntry } = useCareActions();

  const [mood, setMood] = useState<CareMood>("focused");
  const [energy, setEnergy] = useState<number>(4);
  const [stress, setStress] = useState<number>(2);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const summary = useMemo(() => computeWeeklyPulseSummary(entries), [entries]);

  const moodOptions: Array<{ id: CareMood; label: string }> = [
    { id: "calm", label: t("care.mood.calm") },
    { id: "focused", label: t("care.mood.focused") },
    { id: "okay", label: t("care.mood.okay") },
    { id: "tired", label: t("care.mood.tired") },
    { id: "stressed", label: t("care.mood.stressed") },
  ];

  const chartData = useMemo(
    () =>
      summary.points.map((pt) => ({
        day: pt.dateIso.slice(5),
        energy: pt.energy ?? 0,
        stress: pt.stress ?? 0,
        logged: pt.entriesCount > 0,
      })),
    [summary.points],
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addCareEntry({
        mood,
        energy,
        stressLevel: stress,
        sleepHours: null,
        note: note.trim() || null,
      });
      setNote("");
      toast.success(t("pulse.toastSaved"));
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    } finally {
      setBusy(false);
    }
  };

  const insightText =
    summary.insightKind === "positive"
      ? t("pulse.trendInsightPositive")
      : summary.insightKind === "rest"
        ? t("pulse.trendInsightRest")
        : summary.insightKind === "calm"
          ? t("pulse.trendInsightCalm")
          : t("pulse.noData");

  return (
    <div className="surface-card space-y-5 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="size-4.5 text-primary" />
            <h2 className="font-display text-base font-bold text-foreground">{t("pulse.title")}</h2>
            {summary.checkedInToday && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                <CheckCircle2 className="size-3.5" />
                {t("pulse.savedToday")}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t("pulse.sub")}</p>
        </div>

        <div className="flex items-center gap-1.5 text-[0.7rem] font-medium text-muted-foreground">
          <Lock className="size-3.5 text-primary" />
          <span>{t("pulse.privacy")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form onSubmit={handleSave} className="space-y-4 lg:col-span-5">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-foreground">{t("pulse.moodLabel")}</div>
            <div className="flex flex-wrap gap-1.5">
              {moodOptions.map((opt) => {
                const active = mood === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMood(opt.id)}
                    aria-pressed={active}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>{t("pulse.energyLabel")}</span>
                <span className="font-mono tabular-nums text-primary">
                  {formatNumber(energy, lang)}/5
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </label>

            <label className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>{t("pulse.stressLabel")}</span>
                <span className="font-mono tabular-nums text-xp">
                  {formatNumber(stress, lang)}/5
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={stress}
                onChange={(e) => setStress(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </label>
          </div>

          <div className="flex gap-2">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              placeholder={t("pulse.notePh")}
              className="h-9 text-xs"
            />
            <Button
              type="submit"
              variant="glow"
              size="sm"
              disabled={busy}
              className="h-9 whitespace-nowrap shrink-0"
            >
              <Sparkles className="size-3.5" />
              <span>{t("pulse.saveBtn")}</span>
            </Button>
          </div>
        </form>

        <div className="flex flex-col justify-between space-y-3 rounded-xl border border-border bg-surface-2/60 p-4 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <TrendingUp className="size-3.5 text-primary" />
              <span>{t("pulse.weeklySentiment")}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[0.7rem] text-muted-foreground tabular-nums">
              <span>
                {t("pulse.consistency")}:{" "}
                <strong className="text-foreground">
                  {formatNumber(summary.daysCheckedLast7, lang)}/7
                </strong>
              </span>
              {summary.avgEnergy !== null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    {t("pulse.avgEnergy")}:{" "}
                    <strong className="text-primary">{summary.avgEnergy}/5</strong>
                  </span>
                </>
              )}
              {summary.avgStress !== null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    {t("pulse.avgStress")}:{" "}
                    <strong className="text-xp">{summary.avgStress}/5</strong>
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 10, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="pulseEnergyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.8 0.14 190)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="oklch(0.8 0.14 190)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="oklch(0.6 0.02 250)" fontSize={10} tickLine={false} />
                <YAxis
                  domain={[0, 5]}
                  ticks={[1, 3, 5]}
                  stroke="oklch(0.6 0.02 250)"
                  fontSize={10}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.2 0.024 255)",
                    borderColor: "oklch(1 0 0 / 12%)",
                    borderRadius: "0.5rem",
                    color: "#fff",
                    fontSize: "0.75rem",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="energy"
                  name={t("pulse.energyLabel")}
                  stroke="oklch(0.8 0.14 190)"
                  strokeWidth={2}
                  fill="url(#pulseEnergyGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="stress"
                  name={t("pulse.stressLabel")}
                  stroke="oklch(0.82 0.15 75)"
                  strokeWidth={1.75}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">{insightText}</p>
        </div>
      </div>
    </div>
  );
}
