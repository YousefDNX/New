import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2, Sparkles, UserCheck } from "lucide-react";
import { sanitizeRedirectPath } from "@/lib/auth-validation";
import { signInAsAnonymousGuest, waitForAuthReady } from "@/lib/firebase-auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/app/Logo";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { usePrefs } from "@/lib/preferences";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string; mode?: string } => {
    const out: { redirect?: string; mode?: string } = {};
    if (typeof search["redirect"] === "string") out.redirect = search["redirect"];
    if (typeof search["mode"] === "string") out.mode = search["mode"];
    return out;
  },
  head: () => ({
    meta: [
      { title: `Welcome — ${BRAND.name}` },
      { name: "description", content: `Enter ${BRAND.name} directly as a student guest.` },
      { property: "og:title", content: `Welcome — ${BRAND.name}` },
      { property: "og:description", content: `Enter ${BRAND.name} directly as a student guest.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { lang } = usePrefs();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const qc = useQueryClient();
  const isAr = lang === "ar";
  const redirectTo = sanitizeRedirectPath(search.redirect) || "/app";

  const [busy, setBusy] = useState(false);

  // Auto-bootstrap guest session
  const handleEnterAsGuest = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signInAsAnonymousGuest(lang);
      await qc.invalidateQueries();
      void navigate({ to: redirectTo as never });
    } catch (err) {
      console.warn("Guest sign in error, navigating directly to /app:", err);
      void navigate({ to: "/app" as never });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    let active = true;
    void waitForAuthReady(lang).then((user) => {
      if (!active) return;
      if (user) {
        void navigate({ to: redirectTo as never });
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

      <main className="flex flex-1 items-center justify-center p-5">
        <div className="surface-card w-full max-w-md p-6 sm:p-8 text-center space-y-6">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-7" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-foreground">
              {isAr ? "مرحباً بك في BTC" : "Welcome to BTC"}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isAr
                ? "منصة دراسية متكاملة لطلاب الصف التاسع: مفردات الوحدات، BTC الذكي، القرآن الكريم، وحلقة المعرفة."
                : "An integrated learning platform for Grade 9 students: Units vocabulary, BTC AI, Quran & Knowledge Circle."}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-2/60 p-4 text-xs text-muted-foreground text-start space-y-1.5">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <UserCheck className="size-4 text-primary shrink-0" />
              <span>{isAr ? "الدخول كضيف متاح مباشرة" : "Guest Mode Ready"}</span>
            </div>
            <p>
              {isAr
                ? "لا حاجة لإنشاء حساب أو تسجيل دخول. يمكنك البدء في الدراسة وإدارة مهامك على الفور."
                : "No registration or account creation needed. You can start studying and managing your tasks immediately."}
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full text-base font-bold shadow-md cursor-pointer"
            onClick={handleEnterAsGuest}
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin me-2" />
                <span>{isAr ? "جارٍ الدخول..." : "Entering..."}</span>
              </>
            ) : (
              <>
                <span>{isAr ? "دخول كضيف ومتابعة" : "Continue as Guest"}</span>
                <ArrowRight className="size-4 rtl-flip ms-2" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
