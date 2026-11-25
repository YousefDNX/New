import { useEffect, useState } from "react";
import {
  BookHeart,
  CheckCircle2,
  Circle,
  HeartPulse,
  Pause,
  Play,
  Plus,
  Sparkles,
  Trash2,
  Wind,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/Page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCareActions,
  useCareEntries,
  useJournalActions,
  useJournalEntries,
} from "@/hooks/use-modules";
import { useUser } from "@/hooks/use-nexora";
import { recordLastVisitedModule } from "@/lib/continue-tracker";
import type { CareMood, JournalMood } from "@/lib/firestore-data";
import { usePrefs } from "@/lib/preferences";

type WellbeingTab = "checkin" | "journal" | "habits" | "calm";

const HEALTHY_HABITS = [
  { id: "water", en: "Drink enough water today", ar: "شرب كمية كافية من الماء اليوم" },
  {
    id: "break",
    en: "Take a 10-minute screen-free break",
    ar: "أخذ استراحة ١٠ دقائق بعيداً عن الشاشة",
  },
  { id: "move", en: "Light stretching or a short walk", ar: "تمارين إطالة خفيفة أو مشي قصير" },
  { id: "sleep", en: "Wind down 30 minutes before sleep", ar: "تهيئة هادئة للنوم قبل ٣٠ دقيقة" },
  { id: "tidy", en: "Tidy study desk for tomorrow", ar: "ترتيب مكتب الدراسة لليوم التالي" },
];

const BREATHING_PHASES = [
  { en: "Inhale slowly", ar: "شهيق هادئ", secs: 4 },
  { en: "Hold gently", ar: "احبس النفس بلطف", secs: 4 },
  { en: "Exhale slowly", ar: "زفير هادئ", secs: 4 },
  { en: "Rest", ar: "استرخاء", secs: 4 },
];

export function WellbeingWorkspace() {
  const { lang } = usePrefs();
  const { data: user } = useUser();
  const isAr = lang === "ar";

  useEffect(() => {
    recordLastVisitedModule(user?.uid, {
      path: "/app/care",
      labelEn: "Personal Growth",
      labelAr: "النمو الشخصي",
    });
  }, [user?.uid]);

  const { data: careEntries = [] } = useCareEntries();
  const { addCareEntry, deleteCareEntry } = useCareActions();
  const { data: journalEntries = [] } = useJournalEntries();
  const { addJournalEntry, deleteJournalEntry } = useJournalActions();

  const [tab, setTab] = useState<WellbeingTab>("checkin");

  // Emotional Check-In state
  const [mood, setMood] = useState<CareMood>("calm");
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(2);
  const [sleepHours, setSleepHours] = useState("7.5");
  const [careNote, setCareNote] = useState("");
  const [careBusy, setCareBusy] = useState(false);

  // Journal state
  const [jTitle, setJTitle] = useState("");
  const [jMood, setJMood] = useState<JournalMood>("reflective");
  const [jBody, setJBody] = useState("");
  const [jWin, setJWin] = useState("");
  const [jNext, setJNext] = useState("");
  const [jBusy, setJBusy] = useState(false);

  // Habits state (per user per day)
  const todayKey = new Date().toISOString().slice(0, 10);
  const habitsStorageKey = `btc_habits_${user?.uid || "guest"}_${todayKey}`;
  const [habitState, setHabitState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(habitsStorageKey);
      setHabitState(raw ? (JSON.parse(raw) as Record<string, boolean>) : {});
    } catch {
      setHabitState({});
    }
  }, [habitsStorageKey]);

  const toggleHabit = (id: string) => {
    setHabitState((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        window.localStorage.setItem(habitsStorageKey, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Breathing timer
  const [breathingActive, setBreathingActive] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secInPhase, setSecInPhase] = useState(4);

  useEffect(() => {
    if (!breathingActive) return;
    const timer = window.setInterval(() => {
      setSecInPhase((prev) => {
        if (prev > 1) return prev - 1;
        const nextIdx = (phaseIdx + 1) % BREATHING_PHASES.length;
        setPhaseIdx(nextIdx);
        return BREATHING_PHASES[nextIdx]!.secs;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [breathingActive, phaseIdx]);

  const [grounding, setGrounding] = useState<Record<number, boolean>>({});

  const handleSaveCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCareBusy(true);
    try {
      const parsedSleep = parseFloat(sleepHours);
      await addCareEntry({
        mood,
        energy,
        stressLevel: stress,
        sleepHours: Number.isNaN(parsedSleep) ? null : parsedSleep,
        note: careNote.trim() || null,
      });
      setCareNote("");
      toast.success(isAr ? "تم حفظ تسجيل حالتك." : "Check-in saved privately.");
    } catch {
      toast.error(isAr ? "تعذر حفظ التسجيل." : "Could not save check-in.");
    } finally {
      setCareBusy(false);
    }
  };

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jTitle.trim() || !jBody.trim()) return;
    setJBusy(true);
    try {
      await addJournalEntry({
        entryDate: todayKey,
        title: jTitle.trim(),
        reflection: jBody.trim(),
        keyWin: jWin.trim() || null,
        nextStep: jNext.trim() || null,
        area: "wellbeing",
        mood: jMood,
      });
      setJTitle("");
      setJBody("");
      setJWin("");
      setJNext("");
      toast.success(isAr ? "تم حفظ التأمل في دفتر اليوميات." : "Reflection saved.");
    } catch {
      toast.error(isAr ? "تعذر حفظ التأمل." : "Could not save reflection.");
    } finally {
      setJBusy(false);
    }
  };

  const moodLabels: Record<CareMood, { en: string; ar: string }> = {
    calm: { en: "Calm", ar: "هادئ" },
    focused: { en: "Focused", ar: "مركّز" },
    okay: { en: "Okay", ar: "جيد" },
    tired: { en: "Tired", ar: "متعب" },
    stressed: { en: "Stressed", ar: "متوتر" },
    overwhelmed: { en: "Overwhelmed", ar: "مثقل" },
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={isAr ? "النمو الشخصي" : "Personal Growth"}
        subtitle={
          isAr
            ? "مساحة هادئة لمتابعة مشاعرك، كتابة تأملاتك، وبناء عادات صحية دون أي ضغط."
            : "A calm private space for check-ins, reflections, healthy habits, and grounding routines."
        }
      />

      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface/60 p-1.5">
        {(
          [
            { id: "checkin", en: "Emotional Check-In", ar: "تسجيل الحالة", icon: HeartPulse },
            { id: "journal", en: "Reflection Journal", ar: "دفتر التأمل", icon: BookHeart },
            { id: "habits", en: "Healthy Habits", ar: "العادات الصحية", icon: Sparkles },
            { id: "calm", en: "Calm Routines", ar: "تمارين الهدوء", icon: Wind },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={tab === item.id ? "glow" : "ghost"}
              onClick={() => setTab(item.id)}
              className="gap-1.5 text-xs"
            >
              <Icon className="size-3.5" />
              <span>{isAr ? item.ar : item.en}</span>
            </Button>
          );
        })}
      </div>

      {/* EMOTIONAL CHECK-IN */}
      {tab === "checkin" && (
        <div className="grid gap-5 lg:grid-cols-12">
          <form onSubmit={handleSaveCheckin} className="surface-card space-y-4 p-5 lg:col-span-7">
            <div className="text-sm font-bold text-foreground">
              {isAr ? "كيف تشعر الآن؟" : "How are you feeling right now?"}
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(moodLabels) as CareMood[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer ${
                    mood === m
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-2 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isAr ? moodLabels[m].ar : moodLabels[m].en}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="care-energy" className="text-xs">
                  {isAr ? `الطاقة (${energy}/5)` : `Energy (${energy}/5)`}
                </Label>
                <input
                  id="care-energy"
                  type="range"
                  min={1}
                  max={5}
                  value={energy}
                  onChange={(e) => setEnergy(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
              </div>
              <div>
                <Label htmlFor="care-stress" className="text-xs">
                  {isAr ? `التوتر (${stress}/5)` : `Stress (${stress}/5)`}
                </Label>
                <input
                  id="care-stress"
                  type="range"
                  min={1}
                  max={5}
                  value={stress}
                  onChange={(e) => setStress(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
              </div>
              <div>
                <Label htmlFor="care-sleep" className="text-xs">
                  {isAr ? "ساعات النوم" : "Sleep (hours)"}
                </Label>
                <Input
                  id="care-sleep"
                  type="number"
                  step="0.5"
                  min={0}
                  max={24}
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="mt-1 h-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="care-note" className="text-xs">
                {isAr ? "ملاحظة خاصة (اختياري)" : "Private note (optional)"}
              </Label>
              <Textarea
                id="care-note"
                rows={3}
                value={careNote}
                onChange={(e) => setCareNote(e.target.value)}
                placeholder={
                  isAr ? "اكتب ما يدور في بالك بحرية..." : "Write a quick thought for yourself..."
                }
                className="mt-1"
              />
            </div>

            <Button type="submit" disabled={careBusy} size="sm" variant="glow">
              {isAr ? "حفظ التسجيل" : "Save Check-In"}
            </Button>
          </form>

          <div className="surface-card space-y-3 p-5 lg:col-span-5">
            <h3 className="font-display text-sm font-bold text-foreground">
              {isAr ? "السجل الخاص بك" : "Recent Check-Ins"}
            </h3>
            {careEntries.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                {isAr ? "لا توجد تسجيلات بعد." : "No check-ins recorded yet."}
              </p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {careEntries.slice(0, 10).map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-border/80 bg-surface-2/40 p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">
                        {isAr ? moodLabels[entry.mood]?.ar : moodLabels[entry.mood]?.en}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {entry.created_at.slice(0, 10)}
                        </span>
                        <button
                          type="button"
                          onClick={() => void deleteCareEntry(entry.id)}
                          aria-label={isAr ? "حذف" : "Delete"}
                          className="text-muted-foreground hover:text-destructive cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-muted-foreground">
                      {isAr
                        ? `الطاقة: ${entry.energy}/5 · التوتر: ${entry.stress_level}/5`
                        : `Energy: ${entry.energy}/5 · Stress: ${entry.stress_level}/5`}
                    </div>
                    {entry.note && <p className="text-foreground pt-1">{entry.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* REFLECTION JOURNAL */}
      {tab === "journal" && (
        <div className="grid gap-5 lg:grid-cols-12">
          <form onSubmit={handleSaveJournal} className="surface-card space-y-3.5 p-5 lg:col-span-6">
            <div>
              <Label htmlFor="j-title" className="text-xs">
                {isAr ? "عنوان التأمل" : "Reflection title"}
              </Label>
              <Input
                id="j-title"
                value={jTitle}
                onChange={(e) => setJTitle(e.target.value)}
                placeholder={isAr ? "مثال: ماذا تعلمت اليوم؟" : "e.g. What went well today"}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="j-mood" className="text-xs">
                {isAr ? "الشعور العام" : "Reflection tone"}
              </Label>
              <select
                id="j-mood"
                value={jMood}
                onChange={(e) => setJMood(e.target.value as JournalMood)}
                className="mt-1 flex h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-foreground"
              >
                <option value="reflective">{isAr ? "متأمّل" : "Reflective"}</option>
                <option value="focused">{isAr ? "مركّز" : "Focused"}</option>
                <option value="confident">{isAr ? "واثق" : "Confident"}</option>
                <option value="curious">{isAr ? "متطلّع" : "Curious"}</option>
                <option value="challenged">{isAr ? "متحدٍ" : "Challenged"}</option>
                <option value="energized">{isAr ? "نشيط" : "Energized"}</option>
              </select>
            </div>

            <div>
              <Label htmlFor="j-body" className="text-xs">
                {isAr ? "التأمل الشخصي" : "Your reflection"}
              </Label>
              <Textarea
                id="j-body"
                rows={4}
                value={jBody}
                onChange={(e) => setJBody(e.target.value)}
                placeholder={isAr ? "اكتب أفكارك بحرية..." : "Write honestly for yourself..."}
                className="mt-1"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="j-win" className="text-xs">
                  {isAr ? "إنجاز صغير اليوم" : "One small win (optional)"}
                </Label>
                <Input
                  id="j-win"
                  value={jWin}
                  onChange={(e) => setJWin(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="j-next" className="text-xs">
                  {isAr ? "خطوة الغد" : "Next gentle step (optional)"}
                </Label>
                <Input
                  id="j-next"
                  value={jNext}
                  onChange={(e) => setJNext(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={jBusy || !jTitle.trim() || !jBody.trim()}
              size="sm"
              variant="glow"
              className="gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>{isAr ? "حفظ التأمل" : "Save Entry"}</span>
            </Button>
          </form>

          <div className="surface-card space-y-3 p-5 lg:col-span-6">
            <h3 className="font-display text-sm font-bold text-foreground">
              {isAr ? "تأملاتك الخاصة" : "Your Private Entries"}
            </h3>
            {journalEntries.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                {isAr ? "لا توجد تدوينات بعد." : "No journal entries yet."}
              </p>
            ) : (
              <div className="space-y-3 max-h-[28rem] overflow-y-auto">
                {journalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-border/80 bg-surface-2/40 p-3.5 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm text-foreground">{entry.title}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {entry.entry_date} · {entry.mood}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => void deleteJournalEntry(entry.id)}
                        aria-label={isAr ? "حذف التدوينة" : "Delete entry"}
                        className="text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                      {entry.reflection}
                    </p>
                    {entry.key_win && (
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        {isAr ? "إنجاز: " : "Win: "}
                        {entry.key_win}
                      </div>
                    )}
                    {entry.next_step && (
                      <div className="text-[11px] text-primary">
                        {isAr ? "الخطوة التالية: " : "Next: "}
                        {entry.next_step}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* HEALTHY HABITS */}
      {tab === "habits" && (
        <div className="surface-card space-y-4 p-5 max-w-2xl">
          <div>
            <h2 className="font-display text-base font-bold text-foreground">
              {isAr ? "العادات الصحية اليومية" : "Gentle Daily Habits"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "اختر ما يناسب يومك دون أي عدادات ضاغطة."
                : "Check off what supports your body and mind today—no streak pressure."}
            </p>
          </div>
          <div className="space-y-2.5">
            {HEALTHY_HABITS.map((habit) => {
              const checked = Boolean(habitState[habit.id]);
              return (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => toggleHabit(habit.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-start text-sm transition-colors cursor-pointer ${
                    checked
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-border/80 bg-surface-2/40 hover:bg-surface-2"
                  }`}
                >
                  {checked ? (
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span
                    className={checked ? "line-through text-muted-foreground" : "text-foreground"}
                  >
                    {isAr ? habit.ar : habit.en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CALM ROUTINES */}
      {tab === "calm" && (
        <div className="grid gap-5 md:grid-cols-2">
          <div className="surface-card space-y-4 p-5 text-center">
            <h3 className="font-display text-base font-bold text-foreground">
              {isAr ? "تنفس المربع الهادئ (4-4-4-4)" : "Calm Box Breathing (4-4-4-4)"}
            </h3>
            <div className="py-4">
              <div className="text-lg font-bold text-primary">
                {isAr ? BREATHING_PHASES[phaseIdx]!.ar : BREATHING_PHASES[phaseIdx]!.en}
              </div>
              <div className="mt-1 font-mono text-4xl font-bold text-foreground tabular-nums">
                {secInPhase}s
              </div>
            </div>
            <Button
              type="button"
              variant="glow"
              onClick={() => {
                if (breathingActive) {
                  setBreathingActive(false);
                } else {
                  setPhaseIdx(0);
                  setSecInPhase(4);
                  setBreathingActive(true);
                }
              }}
              className="gap-2"
            >
              {breathingActive ? <Pause className="size-4" /> : <Play className="size-4" />}
              <span>
                {breathingActive
                  ? isAr
                    ? "إيقاف"
                    : "Pause"
                  : isAr
                    ? "ابدأ التمرين"
                    : "Start Breathing"}
              </span>
            </Button>
          </div>

          <div className="surface-card space-y-3 p-5">
            <h3 className="font-display text-base font-bold text-foreground">
              {isAr ? "تمرين التهدئة الحسي 5-4-3-2-1" : "5-4-3-2-1 Grounding"}
            </h3>
            {[
              { step: 5, en: "5 things you can see around you", ar: "٥ أشياء يمكنك رؤيتها حولك" },
              { step: 4, en: "4 things you can touch", ar: "٤ أشياء يمكنك لمسها" },
              { step: 3, en: "3 gentle sounds you hear", ar: "٣ أصوات تسمعها الآن" },
              { step: 2, en: "2 scents in the air", ar: "٢ رائحتين تشعر بهما" },
              { step: 1, en: "1 steady slow breath", ar: "١ نفس عميق وهادئ" },
            ].map((item) => {
              const checked = Boolean(grounding[item.step]);
              return (
                <button
                  key={item.step}
                  type="button"
                  onClick={() =>
                    setGrounding((prev) => ({ ...prev, [item.step]: !prev[item.step] }))
                  }
                  className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-start text-xs cursor-pointer ${
                    checked
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-border/80 bg-surface-2/40"
                  }`}
                >
                  {checked ? (
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span>{isAr ? item.ar : item.en}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
