import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User as UserIcon,
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
  registerWithEmail,
  sendPasswordReset,
  signInAsAnonymousGuest,
  signInWithEmail,
  signInWithGoogle,
  userRequiresEmailVerification,
  waitForAuthReady,
} from "@/lib/firebase-auth";
import { VerificationPending } from "@/components/auth/VerificationPending";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/app/Logo";
import { AppFooter } from "@/components/app/AppFooter";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { usePrefs } from "@/lib/preferences";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const out: { redirect?: string } = {};
    if (typeof search["redirect"] === "string") out.redirect = search["redirect"];
    return out;
  },
  head: () => ({
    meta: [
      { title: `Sign In or Continue as Guest — ${BRAND.name}` },
      { name: "description", content: `Access ${BRAND.name}: Guest, Email, or Google login.` },
      { property: "og:title", content: `Sign In or Continue as Guest — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Access ${BRAND.name}: Guest, Email, or Google login.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthEntryPage,
});

type AuthTab = "guest" | "signin" | "signup";

function AuthEntryPage() {
  const { lang } = usePrefs();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const qc = useQueryClient();
  const isAr = lang === "ar";
  const redirectTo = sanitizeRedirectPath(search.redirect) || "/app";

  const [activeTab, setActiveTab] = useState<AuthTab>("guest");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sign In state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Forgot password modal
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotBusy, setForgotBusy] = useState(false);

  // Email verification barrier if required
  const [pendingVerificationUser, setPendingVerificationUser] = useState<FirebaseUser | null>(null);

  const passwordStrength = useMemo(
    () => evaluatePasswordStrength(signupPassword),
    [signupPassword],
  );

  const handleContinueAsGuest = async () => {
    if (busy) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      await signInAsAnonymousGuest(lang);
      await qc.invalidateQueries();
      void navigate({ to: redirectTo as never, replace: true });
    } catch (err) {
      setErrorMsg(mapAuthError(err, lang));
    } finally {
      setBusy(false);
    }
  };

  const handleSignInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const cleanEmail = normalizeEmail(loginEmail);
    if (!validateEmail(cleanEmail)) {
      setErrorMsg(isAr ? "يرجى إدخال بريد إلكتروني صحيح." : "Please enter a valid email address.");
      return;
    }
    if (!loginPassword) {
      setErrorMsg(isAr ? "يرجى إدخال كلمة المرور." : "Please enter your password.");
      return;
    }
    setBusy(true);
    setErrorMsg(null);
    try {
      const user = await signInWithEmail({
        email: cleanEmail,
        password: loginPassword,
        lang,
      });
      if (userRequiresEmailVerification(user, "password")) {
        setPendingVerificationUser(user);
        return;
      }
      await qc.invalidateQueries();
      void navigate({ to: redirectTo as never, replace: true });
    } catch (err) {
      setErrorMsg(mapAuthError(err, lang));
    } finally {
      setBusy(false);
    }
  };

  const handleSignUpWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const nameCheck = validateFullName(signupName);
    if (!nameCheck.valid) {
      setErrorMsg(
        isAr
          ? "يرجى إدخال اسم صحيح مكون من مقطعين على الأقل."
          : "Please enter a valid full name with at least 2 parts.",
      );
      return;
    }
    const cleanEmail = normalizeEmail(signupEmail);
    if (!validateEmail(cleanEmail)) {
      setErrorMsg(isAr ? "يرجى إدخال بريد إلكتروني صحيح." : "Please enter a valid email address.");
      return;
    }
    if (!passwordStrength.valid) {
      setErrorMsg(
        isAr
          ? "يجب أن تكون كلمة المرور 8 أحرف على الأقل وتتضمن أحرفاً كبيرة وصغيرة وأرقاماً."
          : "Password must be at least 8 characters with upper, lower, and numbers.",
      );
      return;
    }
    setBusy(true);
    setErrorMsg(null);
    try {
      const result = await registerWithEmail({
        fullName: nameCheck.cleaned,
        email: cleanEmail,
        password: signupPassword,
        lang,
      });
      if (result.needsVerification && result.user) {
        setPendingVerificationUser(result.user);
        return;
      }
      await qc.invalidateQueries();
      void navigate({ to: redirectTo as never, replace: true });
    } catch (err) {
      setErrorMsg(mapAuthError(err, lang));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleBusy || busy) return;
    setGoogleBusy(true);
    setErrorMsg(null);
    try {
      const res = await signInWithGoogle(lang);
      if (res.user) {
        await qc.invalidateQueries();
        void navigate({ to: redirectTo as never, replace: true });
      }
    } catch (err) {
      const code = extractFirebaseAuthCode(err);
      if (code !== "auth/popup-closed-by-user") {
        setErrorMsg(mapAuthError(err, lang));
      }
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleSendForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = normalizeEmail(forgotEmail);
    if (!validateEmail(cleanEmail)) {
      toast.error(isAr ? "يرجى إدخال بريد إلكتروني صحيح." : "Please enter a valid email address.");
      return;
    }
    setForgotBusy(true);
    try {
      await sendPasswordReset(cleanEmail);
      toast.success(
        isAr
          ? "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني."
          : "Password reset link sent to your email.",
      );
      setForgotOpen(false);
      setForgotEmail("");
    } catch (err) {
      toast.error(mapAuthError(err, lang));
    } finally {
      setForgotBusy(false);
    }
  };

  useEffect(() => {
    let active = true;
    void waitForAuthReady(lang).then((user) => {
      if (!active) return;
      if (user && !userRequiresEmailVerification(user)) {
        void navigate({ to: redirectTo as never, replace: true });
      }
    });
    return () => {
      active = false;
    };
  }, [lang, navigate, redirectTo]);

  return (
    <div className="flex min-h-dvh flex-col bg-background bg-hero">
      <header className="glass sticky top-0 z-30 border-b border-border/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo size="md" />
          <LanguageSwitcher compact />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="surface-card w-full max-w-md space-y-6 p-6 sm:p-8">
          {pendingVerificationUser ? (
            <VerificationPending
              user={pendingVerificationUser}
              variant="embedded"
              onLogout={() => setPendingVerificationUser(null)}
              onVerified={() => {
                setPendingVerificationUser(null);
                void navigate({ to: redirectTo as never, replace: true });
              }}
            />
          ) : (
            <>
              {/* Header */}
              <div className="space-y-2 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="size-6" />
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  {isAr ? "مرحباً بك في BTC" : "Welcome to BTC"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {isAr
                    ? "اختر طريقة الدخول المناسبة لك للوصول إلى أدوات التعلم."
                    : "Choose your preferred way to access your learning workspace."}
                </p>
              </div>

              {/* Segmented Tab Controls */}
              <div
                className="grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1 text-xs font-semibold"
                role="tablist"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "guest"}
                  onClick={() => {
                    setActiveTab("guest");
                    setErrorMsg(null);
                  }}
                  className={`rounded-lg py-2 transition-all cursor-pointer ${
                    activeTab === "guest"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isAr ? "ضيف" : "Guest"}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "signin"}
                  onClick={() => {
                    setActiveTab("signin");
                    setErrorMsg(null);
                  }}
                  className={`rounded-lg py-2 transition-all cursor-pointer ${
                    activeTab === "signin"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isAr ? "تسجيل دخول" : "Sign In"}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "signup"}
                  onClick={() => {
                    setActiveTab("signup");
                    setErrorMsg(null);
                  }}
                  className={`rounded-lg py-2 transition-all cursor-pointer ${
                    activeTab === "signup"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isAr ? "حساب جديد" : "Sign Up"}
                </button>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
                >
                  {errorMsg}
                </div>
              )}

              {/* Tab 1: Guest Access */}
              {activeTab === "guest" && (
                <div className="space-y-4">
                  <div className="space-y-1.5 rounded-xl border border-border bg-surface-2/60 p-4 text-start text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <UserCheck className="size-4 shrink-0 text-primary" />
                      <span>{isAr ? "دخول فوري بدون كلمة مرور" : "Instant Guest Access"}</span>
                    </div>
                    <p className="leading-relaxed">
                      {isAr
                        ? "ابدأ فوراً دون الحاجة لبريد أو كلمة مرور. تُحفظ بياناتك محلياً ويمكنك ترقية حسابك لاحقاً في أي وقت."
                        : "Start learning instantly without an email or password. Your session data persists on this device and can be upgraded anytime."}
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="lg"
                    className="w-full cursor-pointer text-sm font-bold shadow-md"
                    onClick={handleContinueAsGuest}
                    disabled={busy}
                  >
                    {busy ? (
                      <>
                        <Loader2 className="me-2 size-4 animate-spin" />
                        <span>{isAr ? "جارٍ بدء الجلسة..." : "Entering..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{isAr ? "المتابعة كضيف" : "Continue as Guest"}</span>
                        <ArrowRight className="ms-2 size-4 rtl-flip" />
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Tab 2: Sign In */}
              {activeTab === "signin" && (
                <form onSubmit={handleSignInWithEmail} className="space-y-4">
                  <div className="space-y-1 text-start">
                    <Label htmlFor="signin-email" className="text-xs">
                      {isAr ? "البريد الإلكتروني" : "Email Address"}
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute start-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="student@example.com"
                        className="ps-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-start">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-pass" className="text-xs">
                        {isAr ? "كلمة المرور" : "Password"}
                      </Label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(loginEmail);
                          setForgotOpen(true);
                        }}
                        className="text-[11px] font-medium text-primary hover:underline cursor-pointer"
                      >
                        {isAr ? "نسيت كلمة المرور؟" : "Forgot Password?"}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute start-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        id="signin-pass"
                        type={showLoginPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="ps-9 pe-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((v) => !v)}
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                        className="absolute end-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showLoginPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full cursor-pointer text-sm font-bold shadow-md"
                    disabled={busy}
                  >
                    {busy ? (
                      <>
                        <Loader2 className="me-2 size-4 animate-spin" />
                        <span>{isAr ? "جارٍ تسجيل الدخول..." : "Signing In..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{isAr ? "تسجيل الدخول" : "Sign In"}</span>
                        <ArrowRight className="ms-2 size-4 rtl-flip" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Tab 3: Sign Up */}
              {activeTab === "signup" && (
                <form onSubmit={handleSignUpWithEmail} className="space-y-3.5">
                  <div className="space-y-1 text-start">
                    <Label htmlFor="signup-name" className="text-xs">
                      {isAr ? "الاسم الكامل" : "Full Name"}
                    </Label>
                    <div className="relative">
                      <UserIcon className="pointer-events-none absolute start-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        autoComplete="name"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder={isAr ? "محمد أحمد" : "Sarah Jenkins"}
                        className="ps-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-start">
                    <Label htmlFor="signup-email" className="text-xs">
                      {isAr ? "البريد الإلكتروني" : "Email Address"}
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute start-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="student@example.com"
                        className="ps-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-start">
                    <Label htmlFor="signup-pass" className="text-xs">
                      {isAr ? "كلمة المرور" : "Password"}
                    </Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute start-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        id="signup-pass"
                        type={showSignupPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="ps-9 pe-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword((v) => !v)}
                        aria-label={showSignupPassword ? "Hide password" : "Show password"}
                        className="absolute end-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showSignupPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {signupPassword.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-surface-2">
                          {[1, 2, 3, 4].map((step) => {
                            const active = passwordStrength.score >= step;
                            const color =
                              passwordStrength.score >= 3
                                ? "bg-emerald-500"
                                : passwordStrength.score === 2
                                  ? "bg-amber-500"
                                  : "bg-destructive";
                            return (
                              <div
                                key={step}
                                className={`flex-1 transition-colors ${active ? color : "bg-transparent"}`}
                              />
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {isAr
                            ? `قوة كلمة المرور: ${passwordStrength.labelAr}`
                            : `Strength: ${passwordStrength.labelEn}`}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full cursor-pointer text-sm font-bold shadow-md"
                    disabled={busy}
                  >
                    {busy ? (
                      <>
                        <Loader2 className="me-2 size-4 animate-spin" />
                        <span>{isAr ? "جارٍ إنشاء الحساب..." : "Creating Account..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{isAr ? "إنشاء الحساب" : "Create Account"}</span>
                        <ArrowRight className="ms-2 size-4 rtl-flip" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Social Login Divider & Google Button */}
              {activeTab !== "guest" && (
                <div className="space-y-3 pt-2">
                  <div className="relative flex items-center justify-center">
                    <div className="w-full border-t border-border" />
                    <span className="absolute bg-card px-2 text-[11px] text-muted-foreground">
                      {isAr ? "أو المتابعة باستخدام" : "Or continue with"}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={googleBusy || busy}
                    className="w-full gap-2 cursor-pointer text-xs font-semibold"
                  >
                    {googleBusy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>{isAr ? "المتابعة باستخدام Google" : "Continue with Google"}</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <KeyRound className="size-4 text-primary" />
              <span>{isAr ? "إعادة تعيين كلمة المرور" : "Reset Password"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isAr
                ? "أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً لإعادة تعيين كلمة المرور."
                : "Enter your registered email address and we'll send a password reset link."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendForgotPassword} className="space-y-4 pt-2">
            <div className="space-y-1 text-start">
              <Label htmlFor="forgot-email" className="text-xs">
                {isAr ? "البريد الإلكتروني" : "Email"}
              </Label>
              <Input
                id="forgot-email"
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="student@example.com"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setForgotOpen(false)}
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" size="sm" disabled={forgotBusy}>
                {forgotBusy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isAr ? (
                  "إرسال الرابط"
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AppFooter />
    </div>
  );
}
