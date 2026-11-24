import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { VerificationPending } from "@/components/auth/VerificationPending";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import { ProtectedRoute, useAuth } from "@/lib/auth";
import {
  resolveUserSignInProvider,
  userRequiresEmailVerification,
  waitForAuthReady,
} from "@/lib/firebase-auth";
import { usePrefs } from "@/lib/preferences";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  pendingComponent: () => (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <Loader2 className="size-7 animate-spin text-primary" />
    </div>
  ),
  beforeLoad: async ({ location }) => {
    const user = await waitForAuthReady();
    if (!user) {
      throw redirect({
        to: "/auth",
        search: location.href && location.href !== "/app" ? { redirect: location.href } : {},
      });
    }
    const signInProvider = await resolveUserSignInProvider(user);
    return {
      user,
      signInProvider,
      needsVerification: userRequiresEmailVerification(user, signInProvider),
    };
  },
  component: AuthenticatedGate,
});

function AuthenticatedContent() {
  const { user, requiresVerification, status, refreshUser } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  if (!user) return null;

  if (requiresVerification || userRequiresEmailVerification(user, status.activeSignInProvider)) {
    return (
      <VerificationPending
        variant="standalone"
        user={user}
        email={user.email}
        phoneNumber={user.phoneNumber}
        onVerified={async () => {
          await refreshUser();
          await qc.invalidateQueries();
          await router.invalidate();
        }}
      />
    );
  }

  return <Outlet />;
}

function AuthenticatedGate() {
  const { t } = usePrefs();
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
