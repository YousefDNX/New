import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Map as MapIcon,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  evaluatePasswordStrength,
  extractFirebaseAuthCode,
  mapAuthError,
  normalizeEmail,
  sanitizeRedirectPath,
  validateEmail,
  validateFullName,
} from "@/lib/auth-validation";
import {
  applyAuthPersistence,
  auth,
  getSessionRememberPreference,
  setSessionRememberPreference,
} from "@/lib/firebase";
import {
  consumeLastRedirectError,
  isUserEligibleForApp,
  registerWithEmail,
  resolveUserSignInProvider,
  sendPasswordReset,
  signInAsAnonymousGuest,
  signInWithEmail,
  signInWithGoogle,
  signOutFirebase,
  userRequiresEmailVerification,
  waitForAuthReady,
} from "@/lib/firebase-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/app/Logo";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { VerificationPending } from "@/components/auth/VerificationPending";
import { usePrefs } from "@/lib/preferences";
import { BRAND, isBtcMode } from "@/config/brand";
import btcHeroShowcaseUrl from "@/assets/images/btc_flagship_hero_1794845536894.jpg";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string; mode?: string } => {
    const out: { redirect?: string; mode?: string } = {};
    if (typeof search["redirect"] === "string") out.redirect = search["redirect"];
    if (typeof search["mode"] === "string") out.mode = search["mode"];
    return out;
  },
  head: () => ({
    meta: [
      { title: `Sign in — ${BRAND.name}` },
      { name: "description", content: `Sign in or create your ${BRAND.name} student account.` },
      { property: "og:title", content: `Sign in — ${BRAND.name}` },
      { property: "og:description", content: `Sign in or create your ${BRAND.name} account.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function GoogleG() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.820z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.450 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

type AuthMode = "signin" | "signup" | "forgot" | "verify";

function AuthPage() {
  const { t, lang, effectiveBtcVisualTheme, setBtcVisualTheme } = usePrefs();
  const isAltTheme = effectiveBtcVisualTheme === "btc_alternative";
  const navigate = useNavigate();
  const search = Route.useSearch();
  const qc = useQueryClient();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [redirectTo, setRedirectTo] = useState<string>(() => sanitizeRedirectPath(search.redirect));

  // Email / Password state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState<boolean>(() => getSessionRememberPreference());

  // Email verification waiting state
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState<string>("");
  const [verifyCooldown, setVerifyCooldown] = useState(0);

  // Async flags & messages
  const [authChecking, setAuthChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [guestBusy, setGuestBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [popupBlockedInIframe, setPopupBlockedInIframe] = useState(false);
  const [panelImgError, setPanelImgError] = useState(false);

  const pwStrength = useMemo(() => evaluatePasswordStrength(password), [password]);
  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

  // Hydrate Firebase Auth state & handle redirect parameters cleanly
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const paramMode = search.mode ?? params.get("mode");
    const target = sanitizeRedirectPath(search.redirect ?? params.get("redirect"));
    setRedirectTo(target);

    if (
      paramMode === "signup" ||
      paramMode === "forgot" ||
      paramMode === "signin" ||
      paramMode === "verify"
    ) {
      setMode(paramMode);
    } else if (paramMode === "phone") {
      setMode("signin");
    }

    const oobMode = params.get("mode");
    const oobCode = params.get("oobCode");
    if (oobCode && (oobMode === "verifyEmail" || oobMode === "resetPassword")) {
      navigate({
        to: oobMode === "resetPassword" ? "/reset-password" : "/auth/callback",
        search: { mode: oobMode, oobCode } as Record<string, string>,
        replace: true,
      });
      return;
    }

    if (params.get("verified") === "1") {
      setInfoNotice(t("auth.verify.completeNotice"));
    }

    void waitForAuthReady(lang)
      .then(async (user) => {
        if (!active) return;
        const redirectErr = consumeLastRedirectError();
        if (user) {
          const providerClaim = await resolveUserSignInProvider(user);
          if (!active) return;
          if (userRequiresEmailVerification(user, providerClaim)) {
            setPendingVerifyEmail(user.email ?? "");
            setMode("verify");
          } else if (isUserEligibleForApp(user, providerClaim)) {
            await qc.invalidateQueries();
            if (!active) return;
            navigate({ to: target as "/app", replace: true });
            return;
          }
        } else if (redirectErr) {
          const msg = mapAuthError(redirectErr, lang);
          setFormError(msg);
          toast.error(msg);
        }
        setAuthChecking(false);
      })
      .catch(() => {
        if (active) setAuthChecking(false);
      });

    return () => {
      active = false;
    };
  }, [navigate, qc, lang, search.mode, search.redirect, t]);

  const switchMode = useCallback((nextMode: AuthMode) => {
    setMode(nextMode);
    setFormError(null);
    setInfoNotice(null);
    setPopupBlockedInIframe(false);
  }, []);

  async function submitEmailForm(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setInfoNotice(null);

    const cleanEmail = normalizeEmail(email);
    if (!validateEmail(cleanEmail)) {
      setFormError(t("auth.email.error"));
      return;
    }

    if (mode === "signup") {
      const nameCheck = validateFullName(fullName);
      if (!nameCheck.valid) {
        setFormError(t("auth.name.error"));
        return;
      }
      if (!pwStrength.valid) {
        setFormError(t("auth.pw.invalid"));
        return;
      }
      if (password !== confirmPassword) {
        setFormError(t("auth.pw.mismatch"));
        return;
      }
    } else if (mode === "signin" && password.length < 1) {
      setFormError(t("auth.pw.missing"));
      return;
    }

    setSessionRememberPreference(rememberMe);
    setBusy(true);
    try {
      if (mode === "signin") {
        const res = await signInWithEmail({
          email: cleanEmail,
          password,
          rememberMe,
          lang,
        });
        if (res.needsEmailVerification) {
          setPendingVerifyEmail(res.user.email ?? cleanEmail);
          setMode("verify");
          setInfoNotice(t("auth.verify.waiting"));
          return;
        }
        toast.success(t("auth.success.signin"));
        await qc.invalidateQueries();
        navigate({ to: redirectTo as "/app", replace: true });
      } else if (mode === "signup") {
        const res = await registerWithEmail({
          fullName,
          email: cleanEmail,
          password,
          rememberMe,
        });

        setPendingVerifyEmail(res.user.email ?? cleanEmail);
        setMode("verify");

        if (res.verificationSent) {
          setVerifyCooldown(60);
          setInfoNotice(t("auth.check"));
          toast.success(t("auth.check"));
        } else {
          const errMsg = mapAuthError(res.verificationError, lang);
          setFormError(`${t("auth.verify.partialErr")} ${errMsg}`);
          toast.error(errMsg);
        }
      } else if (mode === "forgot") {
        await sendPasswordReset(cleanEmail);
        setInfoNotice(t("auth.reset.sent"));
        toast.success(t("auth.reset.sent"));
      }
    } catch (err) {
      const msg = mapAuthError(err, lang);
      setFormError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  const handleSwitchFromVerify = useCallback(async () => {
    await signOutFirebase();
    qc.clear();
    setPendingVerifyEmail("");
    switchMode("signin");
  }, [qc, switchMode]);

  async function handleGoogleAuth() {
    if (googleBusy || busy || guestBusy) return;
    setFormError(null);
    setInfoNotice(null);
    setPopupBlockedInIframe(false);
    setSessionRememberPreference(rememberMe);
    setGoogleBusy(true);
    try {
      const res = await signInWithGoogle(lang, rememberMe);
      if (res.redirected) {
        return;
      }
      toast.success(t("auth.success.signin"));
      await qc.invalidateQueries();
      navigate({ to: redirectTo as "/app", replace: true });
    } catch (err) {
      const code = extractFirebaseAuthCode(err);
      let inIframe = false;
      try {
        inIframe = window.self !== window.top;
      } catch {
        inIframe = true;
      }
      if (
        inIframe &&
        (code === "auth/popup-blocked" ||
          code === "auth/operation-not-supported-in-this-environment" ||
          code === "auth/web-storage-unsupported")
      ) {
        setPopupBlockedInIframe(true);
      }
      const msg = mapAuthError(err, lang);
      setFormError(msg);
      toast.error(msg);
    } finally {
      setGoogleBusy(false);
    }
  }

  async function handleGuestSignIn() {
    setFormError(null);
    setInfoNotice(null);
    setGuestBusy(true);
    try {
      await signInAsAnonymousGuest(lang);
      toast.success(t("auth.guest.welcome"));
      await qc.invalidateQueries();
      navigate({ to: redirectTo as "/app", replace: true });
    } catch (err) {
      const msg = mapAuthError(err, lang);
      setFormError(msg);
      toast.error(msg);
    } finally {
      setGuestBusy(false);
    }
  }

  const strengthLabel =
    pwStrength.score <= 1
      ? t("auth.pw.weak")
      : pwStrength.score === 2
        ? t("auth.pw.fair")
        : pwStrength.score === 3
          ? t("auth.pw.good")
          : t("auth.pw.strong");

  const strengthColor =
    pwStrength.score <= 1 ? "bg-destructive" : pwStrength.score === 2 ? "bg-xp" : "bg-success";

  if (authChecking) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background bg-hero px-5">
        <Loader2 className="size-7 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div
      data-testid={isAltTheme ? "btc-alternative-auth" : undefined}
      className="flex min-h-dvh flex-col bg-background bg-hero"
    >
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <Link to="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBtcVisualTheme(isAltTheme ? "btc_original" : "btc_alternative")}
            className="rounded-lg border border-border bg-surface/85 px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {isAltTheme
              ? lang === "ar"
                ? "التبديل إلى BTC الأصلي"
                : "BTC Original"
              : lang === "ar"
                ? "معاينة BTC البديل"
                : "BTC Alternative"}
          </button>
          <LanguageSwitcher compact />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-5 pb-14 pt-2">
        <div className="grid w-full items-stretch gap-6 lg:grid-cols-12">
          {/* Brand & Security Assurance Panel */}
          <aside
            className={
              isAltTheme
                ? "hidden flex-col justify-between gap-5 rounded-2xl border border-primary/25 bg-surface p-7 lg:col-span-5 lg:flex"
                : "surface-card hidden flex-col justify-between gap-5 p-6 lg:col-span-5 lg:flex"
            }
          >
            <div className="space-y-4">
              {!panelImgError && (
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-surface-2">
                  <img
                    src={btcHeroShowcaseUrl}
                    alt={`${BRAND.name} — ${BRAND.fullName}`}
                    referrerPolicy="no-referrer"
                    onError={() => setPanelImgError(true)}
                    className="h-full w-full object-cover object-center"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute bottom-2.5 start-3 end-3 flex items-center justify-between gap-2 text-white">
                    <span className="font-display text-xs font-bold tracking-wider">
                      {BRAND.name} · {BRAND.fullName}
                    </span>
                    <span className="text-[10px] font-medium text-white/80">
                      {lang === "ar" ? BRAND.competitionBadgeAr : BRAND.competitionBadge}
                    </span>
                  </div>
                </div>
              )}

              <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                <MapIcon className="size-4" />
                <span>{t("app.tagline")}</span>
              </div>
              <h2 className="font-display text-2xl font-bold leading-snug text-foreground">
                {t("auth.panel.headline")}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("auth.panel.desc")}
              </p>

              <ul className="space-y-2.5 border-t border-border/70 pt-3 text-sm text-foreground/90">
                <li className="flex items-start gap-2.5">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{t("auth.panel.b1")}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
                  <span>{t("auth.panel.b2")}</span>
                </li>
              </ul>
            </div>
          </aside>

          {/* Main Auth Card */}
          <div className="surface-card mx-auto w-full max-w-md p-6 sm:p-8 lg:col-span-7 lg:max-w-none">
            {/* Mode Switcher Tabs (Sign In / Sign Up) */}
            {mode !== "forgot" && mode !== "verify" && (
              <div
                role="tablist"
                aria-label={t("auth.mode.label")}
                className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface-2 p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "signin"}
                  onClick={() => switchMode("signin")}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                    mode === "signin"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("auth.signin")}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "signup"}
                  onClick={() => switchMode("signup")}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                    mode === "signup"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("auth.signup")}
                </button>
              </div>
            )}

            <div>
              <h1 className="font-display text-xl font-bold">
                {mode === "signup"
                  ? t("auth.signup")
                  : mode === "forgot"
                    ? t("auth.forgot")
                    : mode === "verify"
                      ? t("auth.verify.title")
                      : t("auth.signin")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "forgot"
                  ? t("auth.forgot.desc")
                  : mode === "verify"
                    ? t("auth.verify.waiting")
                    : t("app.tagline")}
              </p>
            </div>

            {formError && mode !== "verify" && (
              <div
                role="alert"
                className="mt-4 space-y-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs leading-relaxed text-destructive"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <p className="flex-1">{formError}</p>
                </div>
                {popupBlockedInIframe && typeof window !== "undefined" && (
                  <div className="ps-6">
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-background/80 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-background"
                    >
                      <ExternalLink className="size-3.5 text-primary" />
                      <span>
                        {lang === "ar"
                          ? "فتح صفحة الدخول في تبويب جديد"
                          : "Open sign-in in a new tab"}
                      </span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {infoNotice && mode !== "verify" && (
              <div
                role="status"
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-success/40 bg-success/10 p-3 text-xs leading-relaxed text-foreground"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                <p className="flex-1">{infoNotice}</p>
              </div>
            )}

            {/* VERIFICATION PENDING GATE */}
            {mode === "verify" ? (
              <div className="mt-5">
                <VerificationPending
                  variant="embedded"
                  showHeader={false}
                  email={pendingVerifyEmail || auth.currentUser?.email}
                  phoneNumber={auth.currentUser?.phoneNumber}
                  initialCooldown={verifyCooldown}
                  initialNotice={infoNotice}
                  initialError={formError}
                  onVerified={async () => {
                    await qc.invalidateQueries();
                    navigate({ to: redirectTo as "/app", replace: true });
                  }}
                  onLogout={handleSwitchFromVerify}
                />
              </div>
            ) : (
              <>
                {(mode === "signin" || mode === "signup") && (
                  <>
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={googleBusy || busy || guestBusy}
                      className="mt-5 flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-[#747775] bg-[#FFFFFF] px-4 text-sm font-semibold text-[#1F1F1F] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {googleBusy ? <Loader2 className="size-4 animate-spin" /> : <GoogleG />}
                      <span>{t("auth.google")}</span>
                    </button>

                    <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="h-px flex-1 bg-border" />
                      <span>{t("auth.or")}</span>
                      <span className="h-px flex-1 bg-border" />
                    </div>
                  </>
                )}

                <form onSubmit={submitEmailForm} className="space-y-3.5" noValidate>
                  {mode === "signup" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="auth-fullname">{t("auth.fullname")}</Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="auth-fullname"
                          type="text"
                          required
                          minLength={2}
                          maxLength={60}
                          placeholder={t("auth.fullname.placeholder")}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          autoComplete="name"
                          className="ps-9"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="auth-email">{t("auth.email")}</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="auth-email"
                        type="email"
                        required
                        dir="ltr"
                        placeholder={isBtcMode() ? "student@btc.school" : "student@nexora.school"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        className="ps-9"
                      />
                    </div>
                  </div>

                  {mode !== "forgot" && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auth-password">{t("auth.password")}</Label>
                        {mode === "signin" && (
                          <button
                            type="button"
                            onClick={() => switchMode("forgot")}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            {t("auth.forgot")}
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="auth-password"
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={mode === "signup" ? 8 : 1}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete={mode === "signup" ? "new-password" : "current-password"}
                          className="pe-10 ps-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? t("auth.hidepw") : t("auth.showpw")}
                          className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>

                      {mode === "signup" && password.length > 0 && (
                        <div className="mt-2 space-y-2 rounded-xl border border-border bg-surface-2/60 p-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{t("auth.pw.strength")}</span>
                            <span className="font-semibold">{strengthLabel}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[1, 2, 3, 4].map((step) => (
                              <div
                                key={step}
                                className={`h-1.5 rounded-full transition-colors ${
                                  pwStrength.score >= step ? strengthColor : "bg-muted"
                                }`}
                              />
                            ))}
                          </div>
                          <ul className="grid grid-cols-1 gap-1 pt-0.5 text-[11px] sm:grid-cols-2">
                            {[
                              [pwStrength.checks.length, "auth.pw.req.length"],
                              [pwStrength.checks.upper, "auth.pw.req.upper"],
                              [pwStrength.checks.lower, "auth.pw.req.lower"],
                              [pwStrength.checks.number, "auth.pw.req.number"],
                            ].map(([ok, key]) => (
                              <li
                                key={key as string}
                                className={`flex items-center gap-1.5 ${
                                  ok ? "text-success" : "text-muted-foreground"
                                }`}
                              >
                                <Check
                                  className={`size-3 shrink-0 ${ok ? "opacity-100" : "opacity-30"}`}
                                />
                                <span>{t(key as Parameters<typeof t>[0])}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {mode === "signup" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="auth-confirm-password">{t("auth.confirmpass")}</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="auth-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          aria-invalid={!passwordsMatch}
                          className="pe-10 ps-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          aria-label={showConfirmPassword ? t("auth.hidepw") : t("auth.showpw")}
                          className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                      {!passwordsMatch && (
                        <p className="text-xs text-destructive">{t("auth.pw.mismatch")}</p>
                      )}
                    </div>
                  )}

                  {(mode === "signin" || mode === "signup") && (
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => {
                          const next = e.target.checked;
                          setRememberMe(next);
                          void applyAuthPersistence(next).catch(() => undefined);
                        }}
                        className="size-4 rounded border-border accent-primary"
                      />
                      <span>{t("auth.remember")}</span>
                    </label>
                  )}

                  <Button
                    type="submit"
                    variant="glow"
                    className="h-10 w-full"
                    disabled={busy || googleBusy || guestBusy}
                  >
                    {busy && <Loader2 className="size-4 animate-spin" />}
                    <span>
                      {mode === "signup"
                        ? t("auth.signup")
                        : mode === "forgot"
                          ? t("common.next")
                          : t("auth.signin")}
                    </span>
                  </Button>
                </form>

                {mode === "forgot" && (
                  <div className="mt-4 text-center text-xs">
                    <button
                      type="button"
                      onClick={() => switchMode("signin")}
                      className="font-semibold text-primary hover:underline"
                    >
                      {t("auth.callback.back")}
                    </button>
                  </div>
                )}

                {mode !== "forgot" && (
                  <div className="mt-4 border-t border-border pt-4">
                    <button
                      type="button"
                      disabled={guestBusy || busy || googleBusy}
                      onClick={handleGuestSignIn}
                      className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-2/80 text-xs font-semibold text-foreground transition-colors hover:bg-surface-2 disabled:opacity-60"
                    >
                      {guestBusy ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <UserCheck className="size-3.5 text-primary" />
                      )}
                      <span>{t("auth.guest.cta")}</span>
                    </button>
                    <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
                      {t("auth.guest.note")}
                    </p>
                  </div>
                )}
              </>
            )}

            <p className="mt-5 text-[0.72rem] leading-relaxed text-muted-foreground">
              {t("auth.terms.prefix")}{" "}
              <Link to="/terms" className="underline hover:text-foreground">
                {t("auth.terms.link")}
              </Link>{" "}
              {t("auth.terms.and")}{" "}
              <Link to="/privacy" className="underline hover:text-foreground">
                {t("auth.privacy.link")}
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
