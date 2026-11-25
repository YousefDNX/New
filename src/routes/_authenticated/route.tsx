import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import { ProtectedRoute, useAuth } from "@/lib/auth";
import {
  resolveUserSignInProvider,
  signInAsAnonymousGuest,
  userRequiresEmailVerification,
  waitForAuthReady,
} from "@/lib/firebase-auth";
import { VerificationPending } from "@/components/auth/VerificationPending";
import { usePrefs } from "@/lib/preferences";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  pendingComponent: () => (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <Loader2 className="size-7 animate-spin text-primary" />
    </div>
  ),
  beforeLoad: async ({ location }) => {
    let user = await waitForAuthReady();
    if (!user) {
      try {
        user = await signInAsAnonymousGuest("en");
      } catch (err) {
        console.warn("Auto-guest signIn failed:", err);
      }
    }
    if (!user) {
      throw redirect({
        to: "/auth",
        search: location.href && location.href !== "/app" ? { redirect: location.href } : {},
      });
    }
    const signInProvider = await resolveUserSignInProvider(user);
    const needsVerification = userRequiresEmailVerification(user, signInProvider);
    return {
      user,
      signInProvider,
      needsVerification,
    };
  },
  component: AuthenticatedGate,
});

function AuthenticatedContent() {
  const { user } = useAuth();
  if (!user) return null;
  return <Outlet />;
}

function AuthenticatedGate() {
  const { t } = usePrefs();
  const { user, requiresVerification } = useAuth();

  if (user && requiresVerification) {
    return <VerificationPending user={user} variant="standalone" />;
  }

  return (
    <ProtectedRoute>
      <AppErrorBoundary
        fallbackTitle={t("common.error.title")}
        fallbackDesc={t("common.error.desc")}
        retryLabel={t("common.error.retry")}
        homeLabel={t("common.notfound.home")}
      >
        <AuthenticatedContent />
      </AppErrorBoundary>
    </ProtectedRoute>
  );
}
