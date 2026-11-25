import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { evaluatePasswordStrength, mapAuthError } from "@/lib/auth-validation";
import { auth } from "@/lib/firebase";
import {
  confirmResetActionCode,
  updateSignedInPassword,
  verifyResetActionCode,
} from "@/lib/firebase-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/app/Logo";
import { AppFooter } from "@/components/app/AppFooter";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { usePrefs } from "@/lib/preferences";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): { oobCode?: string; type?: string } => {
    const out: { oobCode?: string; type?: string } = {};
    if (typeof search["oobCode"] === "string") out.oobCode = search["oobCode"];
    if (typeof search["type"] === "string") out.type = search["type"];
    return out;
  },
  head: () => ({
    meta: [
      { title: `Reset password — ${BRAND.name}` },
      { name: "description", content: `Choose a new ${BRAND.name} password.` },
      { property: "og:title", content: `Reset password — ${BRAND.name}` },
      { property: "og:description", content: "Choose a new password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reset,
});

function Reset() {
  const { t, lang } = usePrefs();
  const navigate = useNavigate();
  const search = Route.useSearch();

  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const strength = useMemo(() => evaluatePasswordStrength(pw), [pw]);
  const match = confirmPw.length === 0 || pw === confirmPw;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = search.oobCode ?? params.get("oobCode");
    if (!code) return;

    setOobCode(code);
    void verifyResetActionCode(code)
      .then((email) => setVerifiedEmail(email))
      .catch((err) => setErrorMsg(mapAuthError(err, lang)));
  }, [search.oobCode, lang]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!strength.valid) {
      setErrorMsg(t("auth.pw.invalid"));
      return;
    }

    if (pw !== confirmPw) {
      setErrorMsg(t("auth.pw.mismatch"));
      return;
    }

    setBusy(true);
    try {
      if (oobCode) {
        await confirmResetActionCode(oobCode, pw);
        setDone(true);
        toast.success(t("auth.reset.updated"));
        navigate({ to: "/auth", replace: true });
      } else if (auth.currentUser) {
        await updateSignedInPassword(pw);
        setDone(true);
        toast.success(t("auth.reset.updated"));
        navigate({ to: "/app", replace: true });
      } else {
        throw new Error(t("auth.reset.needlink"));
      }
    } catch (err) {
      const mapped = mapAuthError(err, lang);
      setErrorMsg(mapped);
      toast.error(mapped);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background bg-hero">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Link to="/">
          <Logo />
        </Link>
        <LanguageSwitcher compact />
      </header>
      <div className="flex flex-1 items-center justify-center px-5 pb-16">
        <form onSubmit={submit} className="surface-card w-full max-w-md space-y-4 p-6">
          <div>
            <h1 className="font-display text-xl font-bold">{t("auth.reset.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {verifiedEmail ? `${t("auth.reset.desc")} (${verifiedEmail})` : t("auth.reset.desc")}
            </p>
          </div>

          {done && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 p-3 text-xs text-foreground"
            >
              <CheckCircle2 className="size-4 text-success" />
              <span>{t("auth.reset.updated")}</span>
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
            >
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="reset-pw">{t("auth.newpass")}</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="reset-pw"
                type={showPw ? "text" : "password"}
                minLength={8}
                required
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="new-password"
                className="pe-10 ps-9"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? t("auth.hidepw") : t("auth.showpw")}
                className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {pw.length > 0 && (
              <ul className="grid grid-cols-1 gap-1 pt-1 text-[11px] sm:grid-cols-2">
                {[
                  [strength.checks.length, "auth.pw.req.length"],
                  [strength.checks.upper, "auth.pw.req.upper"],
                  [strength.checks.lower, "auth.pw.req.lower"],
                  [strength.checks.number, "auth.pw.req.number"],
                ].map(([ok, key]) => (
                  <li
                    key={key as string}
                    className={`flex items-center gap-1.5 ${
                      ok ? "text-success" : "text-muted-foreground"
                    }`}
                  >
                    <Check className={`size-3 shrink-0 ${ok ? "opacity-100" : "opacity-30"}`} />
                    <span>{t(key as Parameters<typeof t>[0])}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reset-confirm">{t("auth.confirmpass")}</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="reset-confirm"
                type={showConfirmPw ? "text" : "password"}
                minLength={8}
                required
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                autoComplete="new-password"
                className="pe-10 ps-9"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw((v) => !v)}
                aria-label={showConfirmPw ? t("auth.hidepw") : t("auth.showpw")}
                className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {!match && <p className="text-xs text-destructive">{t("auth.pw.mismatch")}</p>}
          </div>

          <Button variant="glow" className="w-full" type="submit" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            <span>{t("auth.updatepass")}</span>
          </Button>

          <div className="text-center text-xs">
            <Link to="/auth" className="text-primary hover:underline">
              {t("auth.callback.back")}
            </Link>
          </div>
        </form>
      </div>
      <AppFooter />
    </div>
  );
}
