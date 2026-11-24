import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { mapAuthError } from "@/lib/auth-validation";
import {
  completeEmailVerificationCode,
  isUserEligibleForApp,
  waitForAuthReady,
} from "@/lib/firebase-auth";
import { usePrefs } from "@/lib/preferences";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/app/Logo";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: `Signing in — ${BRAND.name}` },
      { name: "description", content: `Completing account sign-in for ${BRAND.name}.` },
    ],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const { t, lang } = usePrefs();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let active = true;

    async function completeAuth() {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode");
      const oobCode = params.get("oobCode");

      try {
        if (mode === "resetPassword" && oobCode) {
          navigate({
            to: "/reset-password",
            search: { oobCode, type: "recovery" } as Record<string, string>,
            replace: true,
          });
          return;
        }

        if (
          (mode === "verifyEmail" || mode === "verifyAndChangeEmail" || mode === "recoverEmail") &&
          oobCode
        ) {
          await completeEmailVerificationCode(oobCode, lang);
          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            try {
              const channel = new BroadcastChannel("nexora-auth");
              channel.postMessage({ type: "email-verified", mode });
              channel.close();
            } catch {
              // ignore broadcast errors
            }
          }
          if (active) setStatus("success");
          const user = await waitForAuthReady(lang);
          if (user && isUserEligibleForApp(user)) {
            navigate({
              to: mode === "verifyAndChangeEmail" ? "/app/settings" : "/app",
              replace: true,
            });
          } else {
            navigate({
              to: "/auth",
              search: { verified: "1" } as Record<string, string>,
              replace: true,
            });
          }
          return;
        }

        const user = await waitForAuthReady(lang);
        if (user && isUserEligibleForApp(user)) {
          if (active) setStatus("success");
          navigate({ to: "/app", replace: true });
          return;
        }

        navigate({ to: "/auth", replace: true });
      } catch (err) {
        const msg = mapAuthError(err, lang);
        if (active) {
          setStatus("error");
          setErrorMessage(msg);
        }
      }
    }

    void completeAuth();
    return () => {
      active = false;
    };
  }, [lang, navigate]);

  return (
    <div className="flex min-h-dvh flex-col bg-background bg-hero">
      <header className="flex items-center justify-between px-5 py-5">
        <Link to="/">
          <Logo />
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-5 pb-16">
        <div className="surface-card w-full max-w-md space-y-4 p-6 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto size-8 animate-spin text-primary" />
              <h1 className="font-display text-lg font-bold">{t("auth.callback.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("auth.callback.desc")}</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="mx-auto size-8 text-success" />
              <h1 className="font-display text-lg font-bold">{t("auth.success.signin")}</h1>
            </>
          )}
          {status === "error" && (
            <>
              <AlertCircle className="mx-auto size-8 text-destructive" />
              <h1 className="font-display text-lg font-bold">{t("auth.callback.failed")}</h1>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <Button asChild variant="glow" className="mt-2 w-full">
                <Link to="/auth">{t("auth.callback.back")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
