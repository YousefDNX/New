import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Languages,
  Loader2,
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
import { SUPPORTED_LANGS, LANG_META } from "@/lib/i18n-dict";
import { Logo } from "@/components/app/Logo";
import { AppFooter } from "@/components/app/AppFooter";
import { useOptionalAuth } from "@/lib/auth.tsx";
import {
  clearCachedBootstrappedProfile,
  deriveDisplayName,
  ensureFirebaseUserBootstrap,
} from "@/lib/auth-bootstrap";
import { getNicknameErrorMessage, validateGuestNickname } from "@/lib/auth-validation";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { usePrefs } from "@/lib/preferences";
import { useSaveProfile, useSaveSettings } from "@/hooks/use-settings";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: `Welcome — ${BRAND.name}` },
      { name: "description", content: `Set up your ${BRAND.name} guest experience.` },
      { property: "og:title", content: `Welcome — ${BRAND.name}` },
      { property: "og:description", content: "Quick guest setup." },
    ],
  }),
  component: GuestOnboardingPage,
});

function GuestOnboardingPage() {
  const { t, lang, setLang, a11y, setA11y } = usePrefs();
  const isAr = lang === "ar";
  const routeCtx = Route.useRouteContext();
  const optionalAuth = useOptionalAuth();
  const user = routeCtx?.user ?? optionalAuth?.user ?? null;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const saveProfile = useSaveProfile();
  const saveSettings = useSaveSettings();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [nickname, setNickname] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    void ensureFirebaseUserBootstrap(user, lang)
      .then((profile) => {
        if (profile?.onboarded) {
          void navigate({ to: "/app", replace: true });
          return;
        }
        const existing = profile?.display_name;
        if (existing && existing !== "Guest Student" && existing !== "Student") {
          setNickname(existing);
        }
      })
      .catch(() => {
        // Keep wizard interactive
      });
  }, [user, lang, navigate]);

  function validateStepOne(): boolean {
    const check = validateGuestNickname(nickname);
    if (!check.valid) {
      const msg = getNicknameErrorMessage(check.reason, lang);
      setNameError(msg);
      return false;
    }
    setNameError(null);
    return true;
  }

  function handleNext() {
    if (step === 1 && !validateStepOne()) return;
    if (step < 4) {
      setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
    }
  }

  async function handleFinish(e: React.FormEvent) {
    e.preventDefault();
    if (!user || busy) return;
    const check = validateGuestNickname(nickname);
    if (!check.valid) {
      setStep(1);
      setNameError(getNicknameErrorMessage(check.reason, lang));
      return;
    }

    setBusy(true);
    try {
      await ensureFirebaseUserBootstrap(user, lang);
      const now = new Date().toISOString();
      const cleanedName = check.cleaned || deriveDisplayName(user);

      await updateProfile(user, { displayName: cleanedName }).catch(() => undefined);

      try {
        await setDoc(
          doc(db, "profiles", user.uid),
          {
            id: user.uid,
            display_name: cleanedName,
            language: lang,
            region: "kuwait",
            parental_consent: true,
            is_anonymous: Boolean(user.isAnonymous),
            onboarded: true,
            updated_at: now,
          },
          { merge: true },
        );
        clearCachedBootstrappedProfile(user.uid);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `profiles/${user.uid}`);
      }

      await saveProfile({ display_name: cleanedName, language: lang, onboarded: true }).catch(
        () => undefined,
      );
      await saveSettings({
        font_scale: a11y.fontScale,
        dyslexia_font: a11y.dyslexia,
        high_contrast: a11y.contrast,
        reduced_motion: a11y.reduceMotion,
        read_aloud: a11y.readAloud,
      }).catch(() => undefined);

      await qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success(isAr ? "أهلاً بك في BTC!" : "Welcome to BTC!");
      void navigate({ to: "/app", replace: true });
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
    { id: 1 as const, label: isAr ? "الاسم" : "Nickname" },
    { id: 2 as const, label: isAr ? "اللغة" : "Language" },
    { id: 3 as const, label: isAr ? "الوصول" : "Accessibility" },
    { id: 4 as const, label: isAr ? "البدء" : "Enter BTC" },
  ];

  const a11yEnabledSummary = [
    a11y.dyslexia ? (isAr ? "خط عسر القراءة" : "Dyslexia-friendly font") : null,
    a11y.contrast ? (isAr ? "تباين عالٍ" : "High contrast") : null,
    a11y.reduceMotion ? (isAr ? "تقليل الحركة" : "Reduced motion") : null,
    a11y.readAloud ? (isAr ? "القراءة الصوتية" : "Read aloud") : null,
  ].filter(Boolean);

  return (
    <div className="flex min-h-dvh flex-col bg-background bg-hero">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-5 py-5">
        <Logo />
        <LanguageSwitcher compact />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-2">
        <form
          onSubmit={handleFinish}
          className="surface-card w-full max-w-xl space-y-6 border-border/80 p-6 shadow-card sm:p-8"
        >
          {/* Step Progress */}
          <div className="space-y-4 border-b border-border/70 pb-5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                <span>{isAr ? "إعداد سريع للضيف" : "Quick Guest Setup"}</span>
              </span>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {step} / 4
              </span>
            </div>

            <h1 className="font-display text-2xl font-bold text-foreground">
              {isAr ? "تهيئة مساحتك في BTC" : "Set Up Your BTC Space"}
            </h1>

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
                    className={`flex cursor-pointer flex-col gap-1.5 text-start transition-colors ${
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

          {/* Step 1: Nickname */}
          {step === 1 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                  <User className="size-4 text-primary" />
                  <span>{isAr ? "ما الاسم الذي تفضل أن نناديك به؟" : "Choose Your Nickname"}</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isAr
                    ? "يظهر هذا الاسم في الترحيب ومشاركاتك داخل حلقة المعرفة (2 إلى 40 حرفاً)."
                    : "Shown in your greeting and Knowledge Circle posts (2 to 40 characters)."}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest-nickname" className="text-xs font-semibold">
                  {isAr ? "الاسم المستعار / الاسم المعروض" : "Nickname / Display Name"}
                </Label>
                <Input
                  id="guest-nickname"
                  autoFocus
                  required
                  minLength={2}
                  maxLength={40}
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  placeholder={isAr ? "مثال: سارة، يوسف، طالب مجتهد" : "e.g. Sara, Yousef, Omar"}
                  className="h-11 rounded-xl bg-surface-2/60 text-foreground"
                />
                {nameError && (
                  <p role="alert" className="text-xs font-medium text-destructive">
                    {nameError}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Step 2: Language */}
          {step === 2 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                  <Languages className="size-4 text-primary" />
                  <span>{isAr ? "اختر لغة التطبيق" : "Choose Your Language"}</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isAr
                    ? "يتغير اتجاه الواجهة وكل الوحدات فوراً، ويمكنك التبديل في أي وقت."
                    : "Updates layout direction and all modules immediately. You can switch anytime."}
                </p>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-4">
                {SUPPORTED_LANGS.map((code) => {
                  const meta = LANG_META[code];
                  const selected = lang === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLang(code)}
                      className={`cursor-pointer rounded-xl border p-3.5 text-start transition-all ${
                        selected
                          ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-sm"
                          : "border-border bg-surface-2/60 hover:border-primary/40 hover:bg-surface-2"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-bold text-foreground">{meta.nativeName}</span>
                        <span className="rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground uppercase">
                          {meta.dir.toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{meta.englishName}</div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Step 3: Accessibility Preferences */}
          {step === 3 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                  <Accessibility className="size-4 text-primary" />
                  <span>
                    {isAr
                      ? "تفضيلات إمكانية الوصول (اختياري)"
                      : "Accessibility Preferences (Optional)"}
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isAr
                    ? "اضبط القراءة والراحة البصرية بما يناسبك، أو اضغط تخطي."
                    : "Adjust reading comfort to fit your needs, or press Skip."}
                </p>
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-surface-2/50 p-4 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">
                      {isAr ? "حجم الخط" : "Font Scale"}
                    </p>
                    <p className="font-mono text-muted-foreground tabular-nums">
                      {a11y.fontScale.toFixed(2)}x
                    </p>
                  </div>
                  <input
                    type="range"
                    min={0.9}
                    max={1.5}
                    step={0.05}
                    value={a11y.fontScale}
                    aria-label={isAr ? "حجم الخط" : "Font Scale"}
                    onChange={(e) => setA11y({ fontScale: Number(e.target.value) })}
                    className="w-40 accent-primary"
                  />
                </div>

                <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-border/60 pt-3">
                  <span className="font-medium text-foreground">
                    {isAr ? "خط مريح لعسر القراءة" : "Dyslexia-Friendly Font"}
                  </span>
                  <Switch
                    checked={a11y.dyslexia}
                    onCheckedChange={(v) => setA11y({ dyslexia: v })}
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-border/60 pt-3">
                  <span className="font-medium text-foreground">
                    {isAr ? "تباين عالٍ للنصوص والحدود" : "High Contrast"}
                  </span>
                  <Switch
                    checked={a11y.contrast}
                    onCheckedChange={(v) => setA11y({ contrast: v })}
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-border/60 pt-3">
                  <span className="font-medium text-foreground">
                    {isAr ? "تقليل الحركة والانتقالات" : "Reduce Motion"}
                  </span>
                  <Switch
                    checked={a11y.reduceMotion}
                    onCheckedChange={(v) => setA11y({ reduceMotion: v })}
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-border/60 pt-3">
                  <span className="font-medium text-foreground">
                    {isAr ? "تفعيل القراءة الصوتية للصفحات" : "Read Aloud Support"}
                  </span>
                  <Switch
                    checked={a11y.readAloud}
                    onCheckedChange={(v) => setA11y({ readAloud: v })}
                  />
                </label>
              </div>
            </section>
          )}

          {/* Step 4: Summary */}
          {step === 4 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <CheckCircle2 className="size-5 text-success" />
                <span>{isAr ? "أنت جاهز للبدء" : "Ready to Enter BTC"}</span>
              </div>

              <div className="space-y-2.5 rounded-xl border border-border bg-surface-2/60 p-4 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">
                    {isAr ? "الاسم المستعار:" : "Nickname:"}
                  </span>
                  <strong className="text-foreground">{nickname.trim()}</strong>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">{isAr ? "اللغة:" : "Language:"}</span>
                  <strong className="text-foreground">
                    {lang === "ar" ? "العربية (RTL)" : "English (LTR)"}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">
                    {isAr ? "حجم الخط:" : "Font Scale:"}
                  </span>
                  <strong className="font-mono text-foreground">
                    {a11y.fontScale.toFixed(2)}x
                  </strong>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-muted-foreground">
                    {isAr ? "الوصول:" : "Accessibility:"}
                  </span>
                  <strong className="text-end text-foreground">
                    {a11yEnabledSummary.length > 0
                      ? a11yEnabledSummary.join(" · ")
                      : isAr
                        ? "الإعدادات الافتراضية"
                        : "Standard Defaults"}
                  </strong>
                </div>
              </div>
            </section>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-4">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack} className="gap-1.5">
                <ArrowLeft className="size-4 rtl-flip" />
                <span>{isAr ? "السابق" : "Back"}</span>
              </Button>
            ) : (
              <span />
            )}

            {step < 4 ? (
              <div className="flex items-center gap-2">
                {step === 3 && (
                  <Button type="button" variant="ghost" onClick={handleNext} className="text-xs">
                    {isAr ? "تخطي" : "Skip"}
                  </Button>
                )}
                <Button type="button" onClick={handleNext} className="gap-1.5 px-6">
                  <span>{isAr ? "التالي" : "Next"}</span>
                  <ArrowRight className="size-4 rtl-flip" />
                </Button>
              </div>
            ) : (
              <Button
                type="submit"
                size="lg"
                disabled={busy}
                className="h-11 cursor-pointer px-7 text-sm font-semibold shadow-glow"
              >
                {busy ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>{t("common.loading")}</span>
                  </span>
                ) : (
                  <span>{isAr ? "الدخول إلى BTC" : "Enter BTC"}</span>
                )}
              </Button>
            )}
          </div>
        </form>
      </main>
      <AppFooter />
    </div>
  );
}
