import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { doc, setDoc } from "firebase/firestore";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  Compass,
  Globe,
  GraduationCap,
  Loader2,
  Palette,
  Sidebar,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { Logo } from "@/components/app/Logo";
import { useOptionalAuth } from "@/lib/auth.tsx";
import {
  clearCachedBootstrappedProfile,
  deriveDisplayName,
  ensureFirebaseUserBootstrap,
} from "@/lib/auth-bootstrap";
import { maskEmail, maskPhone } from "@/lib/auth-state";
import { validateFullName } from "@/lib/auth-validation";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { clampString, generateSafeDocId, type GoalRow } from "@/lib/firestore-data";
import { ageBand } from "@/lib/growth";
import { usePrefs } from "@/lib/preferences";
import { SUBJECT_OPTIONS } from "@/lib/settings";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: `Get started — ${BRAND.name}` },
      { name: "description", content: `Set up your ${BRAND.name} Growth Map.` },
      { property: "og:title", content: `Get started — ${BRAND.name}` },
      { property: "og:description", content: "Set up your Growth Map." },
    ],
  }),
  component: Onb,
});

function Onb() {
  const {
    t,
    lang,
    setLang,
    a11y,
    setA11y,
    btcVisualTheme,
    setBtcVisualTheme,
    btcNavLayout,
    setBtcNavLayout,
    setLayoutMode,
  } = usePrefs();
  const isAr = lang === "ar";
  const routeCtx = Route.useRouteContext();
  const optionalAuth = useOptionalAuth();
  const user = routeCtx?.user ?? optionalAuth?.user ?? null;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [displayName, setDisplayName] = useState(() => (user ? deriveDisplayName(user) : ""));
  const [dob, setDob] = useState("");
  const [region, setRegion] = useState<"kuwait" | "gcc" | "global">("kuwait");
  const [gradeLevel, setGradeLevel] = useState("high");
  const [learningGoals, setLearningGoals] = useState("");
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>(["Mathematics", "English"]);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDisplayName((prev) => (prev ? prev : deriveDisplayName(user)));
    void ensureFirebaseUserBootstrap(user, lang)
      .then((profile) => {
        if (profile?.display_name) setDisplayName(profile.display_name);
        if (profile?.preferred_subjects?.length) {
          setPreferredSubjects(profile.preferred_subjects.slice(0, 12));
        }
        if (profile?.onboarded) navigate({ to: "/app", replace: true });
      })
      .catch(() => {
        // Keep wizard interactive
      });
  }, [user, lang, navigate]);

  const toggleSubject = (subj: string) => {
    setPreferredSubjects((prev) =>
      prev.includes(subj)
        ? prev.filter((s) => s !== subj)
        : prev.length < 12
          ? [...prev, subj]
          : prev,
    );
  };

  function validateStepOne(): boolean {
    const nameCheck = validateFullName(displayName);
    if (!nameCheck.valid) {
      toast.error(t("auth.name.error"));
      return false;
    }
    if (!dob) {
      toast.error(t("onb.age.error"));
      return false;
    }
    const band = ageBand(dob);
    if (band === "under13") {
      toast.error(t("onb.age.error"));
      return false;
    }
    return true;
  }

  function goNext() {
    if (step === 1 && !validateStepOne()) return;
    if (step < 4) setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
  }

  function goBack() {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || busy) return;
    if (!validateStepOne()) {
      setStep(1);
      return;
    }
    const band = ageBand(dob);
    if (band !== "18+" && !consent) {
      toast.error(t("onb.consent"));
      return;
    }

    setBusy(true);
    try {
      await ensureFirebaseUserBootstrap(user, lang);
      const nameCheck = validateFullName(displayName);
      const cleanedName = nameCheck.cleaned || deriveDisplayName(user);
      const now = new Date().toISOString();
      const trimmedGoals = learningGoals.trim().slice(0, 280);
      const cleanSubjects = preferredSubjects.slice(0, 12);

      try {
        await setDoc(
          doc(db, "profiles", user.uid),
          {
            display_name: cleanedName,
            date_of_birth: dob,
            age_band: band,
            region,
            language: lang,
            grade_level: gradeLevel,
            preferred_subjects: cleanSubjects,
            learning_goals: trimmedGoals,
            parental_consent: band === "18+" ? true : consent,
            onboarded: true,
            updated_at: now,
          },
          { merge: true },
        );
        clearCachedBootstrappedProfile(user.uid);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `profiles/${user.uid}`);
      }

      const initialGoalTitle = clampString(trimmedGoals, 200);
      if (initialGoalTitle) {
        const goalId = generateSafeDocId("goal");
        const seededGoal: GoalRow = {
          id: goalId,
          user_id: user.uid,
          title: initialGoalTitle,
          area: "academic",
          status: "active",
          is_daily: false,
          last_reset_date: null,
          target_date: null,
          completed_at: null,
          created_at: now,
        };
        await setDoc(doc(db, "goals", goalId), seededGoal).catch(() => undefined);
      }

      await Promise.all([
        qc.invalidateQueries({ queryKey: ["profile"] }),
        qc.invalidateQueries({ queryKey: ["goals"] }),
        qc.invalidateQueries({ queryKey: ["stats"] }),
        qc.invalidateQueries({ queryKey: ["activity_events"] }),
      ]);

      toast.success(isAr ? "تم إعداد مساحتك بنجاح!" : "Growth Map setup complete!");
      navigate({ to: "/app", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("set.error"));
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background bg-hero">
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
    );
  }

  const stepsMeta = [
    { id: 1 as const, label: isAr ? "الترحيب والبيانات" : "Profile" },
    { id: 2 as const, label: isAr ? "الراحة والوصول" : "Comfort" },
    { id: 3 as const, label: isAr ? "التصميم والتنقل" : "Look & Nav" },
    { id: 4 as const, label: isAr ? "البدء" : "Enter BTC" },
  ];

  const band = dob ? ageBand(dob) : null;

  return (
    <div className="flex min-h-dvh flex-col bg-background bg-hero">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between gap-2 px-5 py-5">
        <Logo />
        <LanguageSwitcher compact />
      </header>

      <div className="flex flex-1 items-center justify-center px-4 pb-16 pt-2">
        <form
          onSubmit={submit}
          className="surface-card w-full max-w-2xl space-y-6 border-border/80 p-6 shadow-card sm:p-8"
        >
          {/* Header & Step Progress */}
          <div className="space-y-4 border-b border-border/70 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                <span>{isAr ? "ادرس. ركّز. انمُ." : "Study. Focus. Grow."}</span>
              </span>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {step} / 4
              </span>
            </div>

            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{t("onb.title")}</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                {maskEmail(user.email) ||
                  maskPhone(user.phoneNumber) ||
                  (user.isAnonymous ? t("auth.guest.badge") : "")}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {stepsMeta.map((s) => {
                const active = s.id === step;
                const done = s.id < step;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      if (s.id < step || (s.id > 1 && validateStepOne())) {
                        setStep(s.id);
                      }
                    }}
                    className={`flex flex-col gap-1.5 text-start transition-colors cursor-pointer ${
                      active || done ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-full rounded-full transition-colors ${
                        active ? "bg-primary" : done ? "bg-success" : "bg-surface-2"
                      }`}
                    />
                    <span className="truncate text-[11px] font-medium">
                      {s.id}. {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 1: Basic Info + Language + Subjects */}
          {step === 1 && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface-2/60 p-3 text-xs">
                <span className="font-semibold text-foreground">
                  {isAr ? "لغة الواجهة المفضلة" : "Preferred Interface Language"}
                </span>
                <div className="inline-flex gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant={lang === "en" ? "default" : "outline"}
                    onClick={() => setLang("en")}
                    className="h-8 px-3 text-xs"
                  >
                    English
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={lang === "ar" ? "default" : "outline"}
                    onClick={() => setLang("ar")}
                    className="h-8 px-3 text-xs"
                  >
                    العربية
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="onb-name"
                  className="flex items-center gap-1.5 text-xs font-semibold"
                >
                  <User className="size-3.5 text-primary" />
                  <span>{t("set.name")}</span>
                </Label>
                <Input
                  id="onb-name"
                  required
                  minLength={2}
                  maxLength={60}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-11 rounded-xl bg-surface-2/60 text-foreground"
                  placeholder={isAr ? "ادخل اسمك الكامل" : "Enter your full name"}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="dob" className="flex items-center gap-1.5 text-xs font-semibold">
                    <Calendar className="size-3.5 text-primary" />
                    <span>{t("onb.dob")}</span>
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="h-11 rounded-xl bg-surface-2/60 text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rg" className="flex items-center gap-1.5 text-xs font-semibold">
                    <Globe className="size-3.5 text-primary" />
                    <span>{t("onb.region")}</span>
                  </Label>
                  <select
                    id="rg"
                    value={region}
                    onChange={(e) => setRegion(e.target.value as "kuwait" | "gcc" | "global")}
                    className="h-11 w-full rounded-xl border border-input bg-surface-2/60 px-3 text-sm text-foreground"
                  >
                    <option value="kuwait" className="bg-card text-foreground">
                      {t("region.kuwait")}
                    </option>
                    <option value="gcc" className="bg-card text-foreground">
                      {t("region.gcc")}
                    </option>
                    <option value="global" className="bg-card text-foreground">
                      {t("region.global")}
                    </option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="onb-grade"
                    className="flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <GraduationCap className="size-3.5 text-primary" />
                    <span>{t("set.grade")}</span>
                  </Label>
                  <select
                    id="onb-grade"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-surface-2/60 px-3 text-sm text-foreground"
                  >
                    <option value="middle" className="bg-card text-foreground">
                      {t("set.grade.middle")}
                    </option>
                    <option value="high" className="bg-card text-foreground">
                      {t("set.grade.high")}
                    </option>
                    <option value="prep" className="bg-card text-foreground">
                      {t("set.grade.prep")}
                    </option>
                    <option value="undergrad" className="bg-card text-foreground">
                      {t("set.grade.undergrad")}
                    </option>
                    <option value="self" className="bg-card text-foreground">
                      {t("set.grade.self")}
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="onb-goals"
                  className="flex items-center gap-1.5 text-xs font-semibold"
                >
                  <BookOpen className="size-3.5 text-primary" />
                  <span>{t("onb.goals")}</span>
                </Label>
                <Input
                  id="onb-goals"
                  maxLength={280}
                  placeholder={t("set.learningGoals.ph")}
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                  className="h-11 rounded-xl bg-surface-2/60 text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">{t("onb.subjects")}</Label>
                <div className="flex flex-wrap gap-1.5">
                  {SUBJECT_OPTIONS.map((subj) => {
                    const selected = preferredSubjects.includes(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => toggleSubject(subj)}
                        aria-pressed={selected}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-surface-2/70 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {subj}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* STEP 2: Optional Accessibility Comfort with Live Preview */}
          {step === 2 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Accessibility className="size-4 text-primary" />
                <span>
                  {isAr
                    ? "تفضيلات الراحة وإمكانية الوصول (اختياري)"
                    : "Accessibility Comfort (Optional)"}
                </span>
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-surface-2/50 p-4 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">
                      {isAr ? "حجم الخط الأساسي" : "Reading Font Scale"}
                    </p>
                    <p className="text-muted-foreground font-mono tabular-nums">
                      {a11y.fontScale.toFixed(2)}x
                    </p>
                  </div>
                  <input
                    type="range"
                    min={0.9}
                    max={1.5}
                    step={0.05}
                    value={a11y.fontScale}
                    aria-label="Font Scale"
                    onChange={(e) => setA11y({ fontScale: Number(e.target.value) })}
                    className="w-40 accent-primary"
                  />
                </div>

                <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-border/60 pt-3">
                  <span className="font-medium text-foreground">{t("onb.comfort.dyslexia")}</span>
                  <Switch
                    checked={a11y.dyslexia}
                    onCheckedChange={(v) => setA11y({ dyslexia: v })}
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-border/60 pt-3">
                  <span className="font-medium text-foreground">
                    {isAr ? "وضع التباين العالي" : "High-Contrast Borders & Text"}
                  </span>
                  <Switch
                    checked={a11y.highContrast}
                    onCheckedChange={(v) => setA11y({ highContrast: v })}
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-border/60 pt-3">
                  <span className="font-medium text-foreground">
                    {isAr ? "تقليل الحركة والانتقالات" : "Reduced Motion"}
                  </span>
                  <Switch
                    checked={a11y.reduceMotion}
                    onCheckedChange={(v) => setA11y({ reduceMotion: v })}
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-border/60 pt-3">
                  <span className="font-medium text-foreground">{t("onb.comfort.readAloud")}</span>
                  <Switch
                    checked={a11y.readAloud}
                    onCheckedChange={(v) => setA11y({ readAloud: v })}
                  />
                </label>
              </div>

              <div className="rounded-xl border border-primary/25 bg-surface p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  {isAr ? "معاينة فورية للنص" : "Live Readability Preview"}
                </p>
                <p className="mt-2 leading-relaxed text-foreground">
                  {isAr
                    ? "هذا نموذج مباشر لمدى وضوح القراءة داخل الدروس وبطاقات المراجعة."
                    : "Consistent active recall helps turn today's Grade 9 Unit 3 notes into long-term mastery."}
                </p>
              </div>
            </section>
          )}

          {/* STEP 3: Visual Theme & Navigation Layout Selection (Live Switching) */}
          {step === 3 && (
            <section className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Palette className="size-4 text-primary" />
                  <span>{isAr ? "اختر هويتك البصرية" : "Choose Visual Theme"}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setBtcVisualTheme("btc_original")}
                    className={`rounded-xl border p-4 text-start transition-all cursor-pointer ${
                      btcVisualTheme === "btc_original"
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                        : "border-border bg-surface-2/60 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {isAr ? "BTC الأصلي" : "BTC Original"}
                      </span>
                      {btcVisualTheme === "btc_original" && (
                        <Check className="size-4 text-primary" />
                      )}
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {isAr
                        ? "ألوان الفيروزي الكلاسيكية المعتمدة وتصميم البطاقات الكلاسيكي."
                        : "Classic approved teal clarity & flagship dashboard layout."}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBtcVisualTheme("btc_alternative")}
                    className={`rounded-xl border p-4 text-start transition-all cursor-pointer ${
                      btcVisualTheme === "btc_alternative"
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                        : "border-border bg-surface-2/60 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {isAr ? "BTC البديل (Atelier Indigo)" : "BTC Alternative (Redesign)"}
                      </span>
                      {btcVisualTheme === "btc_alternative" && (
                        <Check className="size-4 text-primary" />
                      )}
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {isAr
                        ? "إعادة تصميم كاملة بألوان النيلي الليلي وخطوط Outfit."
                        : "Complete Atelier Indigo editorial redesign across all modules."}
                    </p>
                  </button>
                </div>
              </div>

              <div className="space-y-2 border-t border-border/60 pt-4">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Compass className="size-4 text-primary" />
                  <span>{isAr ? "اختر هيكل التنقل" : "Choose Navigation Layout"}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBtcNavLayout("classic");
                      setLayoutMode("sidebar");
                    }}
                    className={`rounded-xl border p-4 text-start transition-all cursor-pointer ${
                      btcNavLayout === "classic"
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                        : "border-border bg-surface-2/60 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <Sidebar className="size-3.5 text-primary" />
                        <span>{isAr ? "التنقل الكلاسيكي" : "Classic Navigation"}</span>
                      </span>
                      {btcNavLayout === "classic" && <Check className="size-4 text-primary" />}
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {isAr
                        ? "شريط جانبي منظم للمكتب وشريط سفلي للهاتف."
                        : "Structured collapsible desktop sidebar & mobile tab bar."}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBtcNavLayout("modern");
                      setLayoutMode("top_nav");
                    }}
                    className={`rounded-xl border p-4 text-start transition-all cursor-pointer ${
                      btcNavLayout === "modern"
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                        : "border-border bg-surface-2/60 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <Compass className="size-3.5 text-primary" />
                        <span>{isAr ? "التنقل العصري" : "Modern Navigation"}</span>
                      </span>
                      {btcNavLayout === "modern" && <Check className="size-4 text-primary" />}
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {isAr
                        ? "شريط أوامر علوي، قائمة مساحات، ومنصة سريعة عائمة."
                        : "Floating 3-zone top command bar, Spaces popover & quick dock."}
                    </p>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* STEP 4: Final Summary & Parental Consent */}
          {step === 4 && (
            <section className="space-y-4">
              <div className="rounded-xl border border-border bg-surface-2/60 p-4 text-xs space-y-2.5">
                <p className="font-display text-sm font-bold text-foreground">
                  {isAr ? "ملخص مساحتك الجاهزة" : "Your Workspace Summary"}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">{t("set.name")}: </span>
                    <strong className="text-foreground">{displayName}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("set.grade")}: </span>
                    <strong className="text-foreground">{gradeLevel}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{isAr ? "التصميم: " : "Theme: "}</span>
                    <strong className="text-foreground">
                      {btcVisualTheme === "btc_alternative" ? "BTC Alternative" : "BTC Original"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {isAr ? "التنقل: " : "Navigation: "}
                    </span>
                    <strong className="text-foreground">
                      {btcNavLayout === "modern" ? "Modern" : "Classic"}
                    </strong>
                  </div>
                </div>
                {preferredSubjects.length > 0 && (
                  <p className="text-muted-foreground">
                    {isAr ? "المواد: " : "Subjects: "}
                    <span className="text-foreground">{preferredSubjects.join(", ")}</span>
                  </p>
                )}
              </div>

              {band && band !== "18+" && band !== "under13" && (
                <label className="flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-xs leading-relaxed">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 size-4 rounded-sm accent-primary"
                  />
                  <span className="text-foreground">{t("onb.consent")}</span>
                </label>
              )}
            </section>
          )}

          {/* Wizard Controls */}
          <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-4">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={goBack} className="gap-1.5">
                <ArrowLeft className="size-4 rtl-flip" />
                <span>{isAr ? "السابق" : "Back"}</span>
              </Button>
            ) : (
              <span />
            )}

            {step < 4 ? (
              <div className="flex items-center gap-2">
                {step === 2 && (
                  <Button type="button" variant="ghost" onClick={goNext} className="text-xs">
                    {isAr ? "تخطي" : "Skip"}
                  </Button>
                )}
                <Button type="button" onClick={goNext} className="gap-1.5 px-6">
                  <span>{isAr ? "التالي" : "Next"}</span>
                  <ArrowRight className="size-4 rtl-flip" />
                </Button>
              </div>
            ) : (
              <Button
                type="submit"
                size="lg"
                className="h-11 px-7 text-sm font-semibold shadow-glow cursor-pointer"
                disabled={busy}
              >
                {busy ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>{t("common.loading")}</span>
                  </span>
                ) : (
                  <span>{isAr ? "دخول إلى BTC" : "Enter BTC"}</span>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
