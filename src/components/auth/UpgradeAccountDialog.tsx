import { useQueryClient } from "@tanstack/react-query";
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
  Sparkles,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import {
  evaluatePasswordStrength,
  extractFirebaseAuthCode,
  mapAuthError,
  normalizeEmail,
  validateEmail,
  validateFullName,
} from "@/lib/auth-validation";
import { upgradeAnonymousWithEmail, upgradeAnonymousWithGoogle } from "@/lib/firebase-auth";
import { usePrefs } from "@/lib/preferences";
import { isBtcMode } from "@/config/brand";

export function UpgradeAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, lang } = usePrefs();
  const qc = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [popupBlockedInIframe, setPopupBlockedInIframe] = useState(false);

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);
  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

  async function handleGoogleUpgrade() {
    if (googleBusy || busy) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setPopupBlockedInIframe(false);
    setGoogleBusy(true);
    try {
      await upgradeAnonymousWithGoogle(lang);
      await qc.invalidateQueries();
      toast.success(t("auth.upgrade.googleDone"));
      onOpenChange(false);
    } catch (err) {
      const code = extractFirebaseAuthCode(err);
      let inIframe = false;
      try {
        inIframe = typeof window !== "undefined" && window.self !== window.top;
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
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setGoogleBusy(false);
    }
  }

  async function handleEmailUpgrade(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const nameRes = validateFullName(fullName);
    if (!nameRes.valid) {
      setErrorMsg(t("auth.name.error"));
      return;
    }
    const cleanEmail = normalizeEmail(email);
    if (!validateEmail(cleanEmail)) {
      setErrorMsg(t("auth.email.error"));
      return;
    }
    if (!strength.valid) {
      setErrorMsg(t("auth.pw.invalid"));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg(t("auth.pw.mismatch"));
      return;
    }

    setBusy(true);
    try {
      const res = await upgradeAnonymousWithEmail({
        fullName: nameRes.cleaned,
        email: cleanEmail,
        password,
      });
      await qc.invalidateQueries();

      if (res.verificationSent) {
        setSuccessMsg(t("auth.upgrade.emailDone"));
        toast.success(t("auth.upgrade.emailDone"));
      } else {
        setErrorMsg(`${t("auth.verify.partialErr")} ${res.verificationError ?? ""}`);
      }
    } catch (err) {
      const msg = mapAuthError(err, lang);
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Sparkles className="size-4 text-primary" />
            <span>{t("auth.upgrade.title")}</span>
          </DialogTitle>
          <DialogDescription>{t("auth.upgrade.desc")}</DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div
            role="alert"
            className="space-y-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{errorMsg}</span>
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
                  <span>{lang === "ar" ? "فتح الترقية في تبويب جديد" : "Open in a new tab"}</span>
                </a>
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-success/40 bg-success/10 p-3 text-xs text-foreground"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
            <span>{successMsg}</span>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          disabled={googleBusy || busy}
          onClick={handleGoogleUpgrade}
          className="w-full justify-center gap-2"
        >
          {googleBusy ? <Loader2 className="size-4 animate-spin" /> : null}
          <span>{t("auth.upgrade.googleBtn")}</span>
        </Button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span>{t("auth.or")}</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleEmailUpgrade} className="space-y-3" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="upg-name">{t("auth.fullname")}</Label>
            <div className="relative">
              <User className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="upg-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("auth.fullname.placeholder")}
                className="ps-9"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="upg-email">{t("auth.email")}</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="upg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isBtcMode() ? "student@btc.school" : "student@nexora.school"}
                className="ps-9"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="upg-pw">{t("auth.password")}</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="upg-pw"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pe-10 ps-9"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t("auth.hidepw") : t("auth.showpw")}
                className="absolute end-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {password.length > 0 && (
              <ul className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
                {[
                  [strength.checks.length, "auth.pw.req.length"],
                  [strength.checks.upper, "auth.pw.req.upper"],
                  [strength.checks.lower, "auth.pw.req.lower"],
                  [strength.checks.number, "auth.pw.req.number"],
                ].map(([ok, key]) => (
                  <li
                    key={key as string}
                    className={`flex items-center gap-1 ${ok ? "text-success" : "text-muted-foreground"}`}
                  >
                    <Check className={`size-3 shrink-0 ${ok ? "opacity-100" : "opacity-30"}`} />
                    <span>{t(key as Parameters<typeof t>[0])}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="upg-confirm">{t("auth.confirmpass")}</Label>
            <Input
              id="upg-confirm"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {!passwordsMatch && <p className="text-xs text-destructive">{t("auth.pw.mismatch")}</p>}
          </div>

          <Button type="submit" variant="glow" className="w-full" disabled={busy || googleBusy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            <span>{t("auth.upgrade.emailBtn")}</span>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
