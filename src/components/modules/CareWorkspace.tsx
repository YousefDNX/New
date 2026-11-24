import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  HeartHandshake,
  HeartPulse,
  Lock,
  Pause,
  PhoneCall,
  Play,
  ShieldAlert,
  Sparkles,
  Trash2,
  Wind,
  X,
} from "lucide-react";
import { ReportAbuseModal } from "@/components/support/ReportAbuseModal";
import { StudentPrivacyCenter } from "@/components/care/StudentPrivacyCenter";
import { StudentFeedbackStudio } from "@/components/support/StudentFeedbackStudio";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/Page";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { ReadyToUseLibraryView } from "@/components/common/ReadyToUseLibraryModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCareActions, useCareEntries } from "@/hooks/use-modules";
import type { CareMood } from "@/lib/firestore-data";
import { formatDate, formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import { HEALTH_LITERACY_GUIDES } from "@/data/open-learning-library";
import { BRAND } from "@/config/brand";

export function CareWorkspace() {
  const { t, lang, locale, a11y } = usePrefs();
  const { data: entries = [] } = useCareEntries();
  const { addCareEntry, deleteCareEntry } = useCareActions();
  const [showCareLibrary, setShowCareLibrary] = useState(false);

  const [mood, setMood] = useState<CareMood>("calm");
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(2);
  const [sleepHours, setSleepHours] = useState("7.5");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  // 5-4-3-2-1 Sensory Grounding state
  const [groundingChecks, setGroundingChecks] = useState<Record<number, boolean>>({});
  const toggleGrounding = (step: number) => {
    setGroundingChecks((prev) => ({ ...prev, [step]: !prev[step] }));
  };
  const resetGrounding = () => setGroundingChecks({});

  // Breathing timer state
  const [pattern, setPattern] = useState<"box" | "478">("box");
  const [breathingActive, setBreathingActive] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secInPhase, setSecInPhase] = useState(4);
  const [cyclesDone, setCyclesDone] = useState(0);

  const phases = useMemo(
    () =>
      pattern === "box"
        ? [
            { label: t("care.breathe.inhale"), secs: 4 },
            { label: t("care.breathe.hold"), secs: 4 },
            { label: t("care.breathe.exhale"), secs: 4 },
            { label: t("care.breathe.hold"), secs: 4 },
          ]
        : [
            { label: t("care.breathe.inhale"), secs: 4 },
            { label: t("care.breathe.hold"), secs: 7 },
            { label: t("care.breathe.exhale"), secs: 8 },
          ],
    [pattern, t],
  );

  useEffect(() => {
    if (!breathingActive) return;
    const timer = window.setInterval(() => {
      setSecInPhase((prev) => {
        if (prev > 1) return prev - 1;
        const nextIdx = (phaseIdx + 1) % phases.length;
        if (nextIdx === 0) {
          setCyclesDone((c) => c + 1);
        }
        setPhaseIdx(nextIdx);
        return phases[nextIdx]!.secs;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [breathingActive, phaseIdx, phases]);

  const startOrToggleBreathing = () => {
    if (breathingActive) {
      setBreathingActive(false);
      return;
    }
    setPhaseIdx(0);
    setSecInPhase(phases[0]!.secs);
    setBreathingActive(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const parsedSleep = parseFloat(sleepHours);
      await addCareEntry({
        mood,
        energy,
        stressLevel: stress,
        sleepHours: Number.isNaN(parsedSleep) ? null : parsedSleep,
        note: note.trim() || null,
      });
      toast.success(t("care.checkinSaved"));
      setNote("");
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    } finally {
      setBusy(false);
    }
  };

  const trendData = useMemo(() => {
    return [...entries]
      .slice(0, 10)
      .reverse()
      .map((e) => ({
        date: e.created_at.slice(5, 10),
        energy: e.energy,
        stress: e.stress_level,
        sleep: e.sleep_hours ?? 0,
      }));
  }, [entries]);

  const avgSleep = useMemo(() => {
    const withSleep = entries.filter((e) => typeof e.sleep_hours === "number" && e.sleep_hours > 0);
    if (withSleep.length === 0) return null;
    const sum = withSleep.reduce((acc, e) => acc + (e.sleep_hours ?? 0), 0);
    return Math.round((sum / withSleep.length) * 10) / 10;
  }, [entries]);

  const moodOptions: Array<{ id: CareMood; label: string }> = [
    { id: "calm", label: t("care.mood.calm") },
    { id: "focused", label: t("care.mood.focused") },
    { id: "okay", label: t("care.mood.okay") },
    { id: "tired", label: t("care.mood.tired") },
    { id: "stressed", label: t("care.mood.stressed") },
    { id: "overwhelmed", label: t("care.mood.overwhelmed") },
  ];

  const currentPhase = phases[phaseIdx] ?? phases[0]!;
  const ringRadius = 46;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const phasePct = Math.max(0, Math.min(1, secInPhase / Math.max(currentPhase.secs, 1)));
  const ringOffset = ringCircumference * (1 - phasePct);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title={t("care.title")} subtitle={t("care.sub")} />
        <div className="flex flex-wrap items-center gap-2">
          <FeatureGuideTrigger featureId="care-wellness" />
          <Button
            type="button"
            size="sm"
            variant={showCareLibrary ? "glow" : "outline"}
            onClick={() => setShowCareLibrary((s) => !s)}
            className="h-8 gap-1.5 text-xs"
          >
            <BookOpen className="size-3.5" />
            <span>{lang === "ar" ? "روتين العافية الجاهز" : "Wellbeing Starter Packs"}</span>
          </Button>
        </div>
      </div>

      {showCareLibrary && (
        <div className="surface-card space-y-4 border-primary/30 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                Ready-to-Use Wellbeing & Grounding Protocols
              </h2>
              <p className="text-xs text-muted-foreground">
                Adopt a structured 7-day sleep, exam-calm, and digital detox plan in one click.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowCareLibrary(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
          <ReadyToUseLibraryView
            defaultCategory="care"
            onItemImported={() => setShowCareLibrary(false)}
          />
        </div>
      )}

      <div className="surface-card flex flex-col gap-2 border-primary/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Lock className="size-4 shrink-0" />
          <span>{t("care.privateBadge")}</span>
        </div>
        <p className="text-xs text-muted-foreground">{t("care.disclaimer")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Private Check-in Form */}
        <form onSubmit={handleSave} className="surface-card space-y-4 p-5">
          <div className="flex items-center gap-2">
            <HeartPulse className="size-4 text-primary" />
            <h2 className="font-display text-base font-bold text-foreground">
              {t("care.checkin.title")}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {moodOptions.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(m.id)}
                aria-pressed={mood === m.id}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  mood === m.id
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="care-energy" className="text-xs">
                {t("care.energy")}
              </Label>
              <Input
                id="care-energy"
                type="number"
                min={1}
                max={5}
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value) || 3)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="care-stress" className="text-xs">
                {t("care.stress")}
              </Label>
              <Input
                id="care-stress"
                type="number"
                min={1}
                max={5}
                value={stress}
                onChange={(e) => setStress(Number(e.target.value) || 2)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="care-sleep" className="text-xs">
                {t("care.sleep")}
              </Label>
              <Input
                id="care-sleep"
                type="number"
                step="0.5"
                min={0}
                max={24}
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("care.journalPh")}
            />
          </div>

          <Button type="submit" variant="glow" disabled={busy}>
            <span>{t("care.saveCheckin")}</span>
          </Button>
        </form>

        {/* Guided Breathing with SVG Ring & Cycle Counter + Support Resources */}
        <div className="space-y-6">
          <div className="surface-card space-y-4 p-5 text-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="size-4 text-primary" />
                <h2 className="font-display text-base font-bold text-foreground">
                  {t("care.breathe.title")}
                </h2>
              </div>
              <div className="flex gap-1 rounded-lg bg-surface-2 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setBreathingActive(false);
                    setPattern("box");
                    setPhaseIdx(0);
                    setSecInPhase(4);
                  }}
                  className={`rounded px-2 py-1 font-medium ${
                    pattern === "box"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {t("care.breathe.box")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBreathingActive(false);
                    setPattern("478");
                    setPhaseIdx(0);
                    setSecInPhase(4);
                  }}
                  className={`rounded px-2 py-1 font-medium ${
                    pattern === "478"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {t("care.breathe.478")}
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center py-2">
              <div className="relative flex size-32 items-center justify-center">
                <svg viewBox="0 0 112 112" className="size-full -rotate-90" aria-hidden="true">
                  <circle
                    cx={56}
                    cy={56}
                    r={ringRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity={0.12}
                    strokeWidth={6}
                  />
                  <circle
                    cx={56}
                    cy={56}
                    r={ringRadius}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    className={a11y.reduceMotion ? "" : "transition-all duration-300"}
                  />
                </svg>
                <span className="absolute font-display text-2xl font-extrabold tabular-nums text-primary">
                  {formatNumber(secInPhase, lang)}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">{currentPhase.label}</p>
              <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                {t("care.cyclesDone")}: {formatNumber(cyclesDone, lang)}
              </p>
            </div>

            <Button type="button" variant="outline" onClick={startOrToggleBreathing}>
              {breathingActive ? <Pause className="size-4" /> : <Play className="size-4" />}
              <span>{breathingActive ? t("care.breathe.stop") : t("care.breathe.start")}</span>
            </Button>
          </div>

          {/* Safe Place: 5-4-3-2-1 Sensory Grounding Tool */}
          <div className="surface-card space-y-4 p-5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h3 className="font-display text-sm font-bold text-foreground">
                  {lang === "ar" ? "تمرين التأريض الحسي 5-4-3-2-1" : "5-4-3-2-1 Sensory Grounding"}
                </h3>
              </div>
              {Object.values(groundingChecks).filter(Boolean).length > 0 && (
                <button
                  type="button"
                  onClick={resetGrounding}
                  className="text-[11px] text-muted-foreground hover:text-foreground underline"
                >
                  {lang === "ar" ? "إعادة ضبط" : "Reset"}
                </button>
              )}
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              {lang === "ar"
                ? "تمرين مثبت علميًا لتهدئة الجهاز العصبي والتركيز على الحاضر عند الشعور بالقلق أو التشتت."
                : "A proven somatic technique to calm your nervous system and anchor your mind during moments of overwhelm or exam stress."}
            </p>

            <div className="space-y-2">
              {[
                {
                  step: 5,
                  title: lang === "ar" ? "5 أشياء تراها حولك" : "5 things you can SEE",
                  desc:
                    lang === "ar"
                      ? "لاحظ 5 أشياء في غرفتك: لون الجدار، كتاب، قلم، ضوء النافذة."
                      : "Look around your space and notice 5 items: a book, desk lamp, tree outside, shadow.",
                },
                {
                  step: 4,
                  title: lang === "ar" ? "4 أشياء يمكنك لمسها" : "4 things you can FEEL",
                  desc:
                    lang === "ar"
                      ? "تحسس ملمس ملابسك، سطح الطاولة، قدميك على الأرض."
                      : "Feel physical textures: your clothes, the smooth desk, feet grounded on the floor.",
                },
                {
                  step: 3,
                  title: lang === "ar" ? "3 أصوات يمكنك سماعها" : "3 things you can HEAR",
                  desc:
                    lang === "ar"
                      ? "صوت المكيف، حركة بالخارج، دقات الساعة، تنفسك."
                      : "Listen closely: distant traffic, ambient fan hum, birds outside, or your own breath.",
                },
                {
                  step: 2,
                  title: lang === "ar" ? "شيئان يمكنك شمهما" : "2 things you can SMELL",
                  desc:
                    lang === "ar"
                      ? "رائحة القهوة أو الشاي، هواء الغرفة، معطر الجو."
                      : "Notice scents around you: pencil graphite, fresh air, coffee, or a cozy blanket.",
                },
                {
                  step: 1,
                  title:
                    lang === "ar" ? "حقيقة إيجابية عن نفسك" : "1 positive TRUTH about yourself",
                  desc:
                    lang === "ar"
                      ? "أنا أبذل ما بوسعي، وهذا الشعور مؤقت وسيمر."
                      : "Affirm: 'I am safe in this moment, doing my best, and this anxiety will pass.'",
                },
              ].map((item) => {
                const checked = Boolean(groundingChecks[item.step]);
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => toggleGrounding(item.step)}
                    className={`w-full text-start p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                      checked
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-border bg-surface-2 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    <CheckCircle2
                      className={`size-4 shrink-0 mt-0.5 ${
                        checked
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground/40"
                      }`}
                    />
                    <div className="space-y-0.5">
                      <div
                        className={`font-semibold text-xs ${
                          checked
                            ? "text-emerald-700 dark:text-emerald-300 line-through"
                            : "text-foreground"
                        }`}
                      >
                        {item.title}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Safe Place: Verified Crisis Resources & Ethical Boundaries */}
          <div className="surface-card space-y-3.5 p-5 text-xs border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <HeartHandshake className="size-4 text-primary" />
                <span>
                  {lang === "ar"
                    ? "موارد الأمان والدعم الإنساني 24/7"
                    : "24/7 Human Support & Crisis Directory"}
                </span>
              </div>
              <ReportAbuseModal
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] gap-1 text-destructive hover:bg-destructive/10"
                  >
                    <ShieldAlert className="size-3.5" />
                    <span>{lang === "ar" ? "إبلاغ عن إساءة" : "Report Concern"}</span>
                  </Button>
                }
              />
            </div>

            <div className="p-2.5 rounded-lg bg-surface-2 border border-border text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Platform Safety Boundary: </span>
              {BRAND.name} is an educational student platform designed for study habits and personal
              productivity. We are not licensed psychologists, physicians, or emergency responders.
              If you or someone you know is in acute distress or danger, please connect immediately
              with trained human professionals below.
            </div>

            <div className="grid gap-2 sm:grid-cols-2 text-[11px]">
              <a
                href="https://findahelpline.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg border border-border bg-surface-2 hover:border-primary/40 hover:text-foreground transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <PhoneCall className="size-3 text-primary" />
                    Find A Helpline
                  </div>
                  <span className="text-muted-foreground text-[10px]">
                    Free, confidential in 130+ countries
                  </span>
                </div>
                <ExternalLink className="size-3 text-muted-foreground" />
              </a>

              <a
                href="https://www.befrienders.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg border border-border bg-surface-2 hover:border-primary/40 hover:text-foreground transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <HeartHandshake className="size-3 text-primary" />
                    Befrienders Worldwide
                  </div>
                  <span className="text-muted-foreground text-[10px]">
                    Global listening service
                  </span>
                </div>
                <ExternalLink className="size-3 text-muted-foreground" />
              </a>
            </div>

            <p className="text-[10px] text-muted-foreground text-center pt-1 border-t border-border/60">
              Crisis Text Line: Text{" "}
              <span className="font-mono font-semibold text-foreground">HOME</span> to{" "}
              <span className="font-mono font-semibold text-foreground">741741</span> · 988 Suicide
              & Crisis Lifeline: Call or text{" "}
              <span className="font-mono font-semibold text-foreground">988</span> (US/CA)
            </p>
          </div>
        </div>
      </div>

      {/* Sleep, Energy & Stress Trend Chart */}
      {trendData.length >= 2 && (
        <div className="surface-card space-y-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold text-foreground">
              {t("care.trendsTitle")}
            </h2>
            {avgSleep !== null && (
              <span className="text-xs font-semibold tabular-nums text-primary">
                {t("care.avgSleep")}: {formatNumber(avgSleep, lang)}h
              </span>
            )}
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sleep"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  name={t("care.sleep")}
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="var(--success)"
                  strokeWidth={2}
                  name={t("care.energy")}
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  stroke="var(--xp)"
                  strokeWidth={2}
                  name={t("care.stress")}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Private Reflections History */}
      <div className="surface-card space-y-3 p-5">
        <h2 className="font-display text-base font-bold text-foreground">{t("care.history")}</h2>
        {entries.length === 0 ? (
          <p className="text-xs text-muted-foreground">—</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-border bg-surface-2 p-4 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold capitalize text-primary">{entry.mood}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[0.68rem] text-muted-foreground">
                      {formatDate(entry.created_at, { lang, calendar: locale.calendar }, "medium")}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteCareEntry(entry.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={t("common.delete")}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-3 text-[0.7rem] tabular-nums text-muted-foreground">
                  <span>
                    {t("care.energy")}: {entry.energy}/5
                  </span>
                  <span>
                    {t("care.stress")}: {entry.stress_level}/5
                  </span>
                  {entry.sleep_hours !== null && (
                    <span>
                      {t("care.sleep")}: {entry.sleep_hours}h
                    </span>
                  )}
                </div>
                {entry.note && <p className="mt-2 text-foreground">{entry.note}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Health Literacy & Emergency First-Aid Awareness (Section 8) */}
      <section
        aria-label="Health Literacy & Emergency First-Aid Awareness"
        data-testid="health-literacy-awareness"
        className="surface-card space-y-4 p-5 text-xs"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">
              {lang === "ar"
                ? "التثقيف الصحي والوعي بالإسعافات الأولية والطوارئ"
                : "Health Literacy & Emergency First-Aid Awareness"}
            </h2>
            <p className="text-muted-foreground">
              {lang === "ar"
                ? "إرشادات وقائية وتوعوية موثقة المصدر — تتطلب مراجعة طبية مختصة."
                : "Educational preventive health awareness and urgent emergency recognition checklists."}
            </p>
          </div>
          <span className="font-mono text-[11px] font-semibold text-amber-500">
            Requires Qualified Clinical Review
          </span>
        </div>

        <div className="rounded-lg border border-amber-500/35 bg-amber-500/10 p-3 text-[11px] text-foreground leading-relaxed">
          <strong>Medical &amp; Safety Disclaimer:</strong> These cards provide general health
          literacy awareness only. They{" "}
          <strong>
            never replace licensed medical care, diagnosis, hands-on certified first-aid training,
            or emergency responders
          </strong>
          . In any urgent or life-threatening situation, alert an adult and contact local emergency
          services (e.g., 112 / 999 / 911) immediately.
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {HEALTH_LITERACY_GUIDES.map((card) => (
            <article
              key={card.id}
              className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-primary">{card.topic}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  Reviewed {card.lastReviewedDate}
                </span>
              </div>
              <h3 className="font-display text-sm font-bold text-foreground">
                {lang === "ar" ? card.titleAr : card.title}
              </h3>
              <p className="text-muted-foreground">{card.summary}</p>
              <ul className="list-disc ps-4 space-y-1 text-foreground/90">
                {card.safeChecklist.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
              <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-2 text-[11px]">
                <strong className="text-destructive">When to Seek Emergency Care: </strong>
                <span className="text-foreground">{card.whenToSeekEmergencyCare}</span>
              </div>
              <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/60">
                Source: {card.sourceAttribution}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* #49 STUDENT PRIVACY & DATA INVENTORY CENTER */}
      <StudentPrivacyCenter />

      {/* #39 STUDENT FEEDBACK STUDIO */}
      <StudentFeedbackStudio />
    </div>
  );
}
