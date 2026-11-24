import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { User } from "firebase/auth";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Mail,
  MailCheck,
  Phone,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { Logo } from "@/components/app/Logo";
import { PhoneVerificationForm } from "@/components/auth/PhoneVerificationForm";
import { Button } from "@/components/ui/button";
import { maskEmail, maskPhone, type AccountAuthState } from "@/lib/auth-state";
import { mapAuthError } from "@/lib/auth-validation";
import { useOptionalAuth } from "@/lib/auth.tsx";
import { auth } from "@/lib/firebase";
import {
  refreshVerificationStatus,
  resendVerificationEmail,
  resolveVerificationTarget,
  signOutFirebase,
} from "@/lib/firebase-auth";
import { usePrefs } from "@/lib/preferences";

export interface VerificationPendingProps {
  /** Override user object (defaults to auth.currentUser) */
  user?: User | null | undefined;
  /** Explicit email address to display when pending email verification */
  email?: string | null | undefined;
  /** Explicit phone number to display when pending phone verification */
  phoneNumber?: string | null | undefined;
  /** Standalone renders full-page route gate shell; embedded renders inner body for /auth */
  variant?: "standalone" | "embedded";
  /** Whether to show the heading and description block inside the component */
  showHeader?: boolean;
  /** Optional initial resend cooldown in seconds */
  initialCooldown?: number;
  /** Optional initial status message */
  initialNotice?: string | null | undefined;
  /** Optional initial error message */
  initialError?: string | null | undefined;
  /** Custom Resend action handler */
  onResend?: () => Promise<void> | void;
  /** Custom Refresh Status action handler; return true if verification is now complete */
  onRefresh?: () => Promise<boolean | void> | boolean | void;
  /** Custom Logout action handler */
  onLogout?: () => Promise<void> | void;
  /** Called automatically after Refresh Status or cross-tab verification succeeds */
  onVerified?: (user: User | null) => Promise<void> | void;
}

export function VerificationPending({
  user,
  email,
  phoneNumber,
  variant = "standalone",
  showHeader = true,
  initialCooldown = 0,
  initialNotice = null,
  initialError = null,
  onResend,
  onRefresh,
  onLogout,
  onVerified,
}: VerificationPendingProps) {
  const { t, lang } = usePrefs();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const optionalAuth = useOptionalAuth();

  const resolvedUser = user ?? optionalAuth?.user ?? auth.currentUser;
  const { channel, target } = resolveVerificationTarget({
    user: resolvedUser,
    email,
    phoneNumber,
  });

  const [cooldown, setCooldown] = useState(initialCooldown);
  const [busyAction, setBusyAction] = useState<"resend" | "refresh" | "logout" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError ?? null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(initialNotice ?? null);
  const [showPhoneResendForm, setShowPhoneResendForm] = useState(false);
  const [revealTarget, setRevealTarget] = useState(false);

  useEffect(() => {
    setCooldown(initialCooldown);
  }, [initialCooldown]);

  useEffect(() => {
    if (initialNotice !== undefined) {
      setNoticeMsg(initialNotice ?? null);
    }
  }, [initialNotice]);

  useEffect(() => {
    if (initialError !== undefined) {
      setErrorMsg(initialError ?? null);
    }
  }, [initialError]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const checkSilently = useCallback(async () => {
    if (onRefresh) return;
    if (!auth.currentUser || channel !== "email") return;
    try {
      const res = await refreshVerificationStatus(lang);
      if (res.verified) {
        await qc.invalidateQueries();
        await onVerified?.(res.user);
      }
    } catch {
      // Silent background sync ignores transient network errors
    }
  }, [channel, lang, onRefresh, onVerified, qc]);

  useEffect(() => {
    if (typeof window === "undefined" || channel !== "email" || onRefresh) return;

    const onFocusOrVisible = () => {
      if (document.visibilityState === "visible") {
        void checkSilently();
      }
    };
    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);

    let channelSync: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      try {
        channelSync = new BroadcastChannel("nexora-auth");
        channelSync.onmessage = (ev) => {
          if (ev.data?.type === "email-verified") {
            void checkSilently();
          }
        };
      } catch {
        channelSync = null;
      }
    }

    return () => {
      window.removeEventListener("focus", onFocusOrVisible);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
      channelSync?.close();
    };
  }, [channel, checkSilently, onRefresh]);

  async function handleResend() {
    if (busyAction !== null || cooldown > 0) return;
    setErrorMsg(null);
    setNoticeMsg(null);

    if (onResend) {
      setBusyAction("resend");
      try {
        await onResend();
        setCooldown(60);
        setNoticeMsg(
          channel === "phone" ? t("auth.verify.phoneResendNotice") : t("auth.resend.sent"),
        );
      } catch (err) {
        const msg = mapAuthError(err, lang);
        setErrorMsg(msg);
        toast.error(msg);
      } finally {
        setBusyAction(null);
      }
      return;
    }

    if (channel === "phone") {
      setShowPhoneResendForm(true);
      setNoticeMsg(t("auth.verify.phoneResendNotice"));
      return;
    }

    setBusyAction("resend");
    try {
      await resendVerificationEmail(resolvedUser);
      setCooldown(60);
      setNoticeMsg(t("auth.resend.sent"));
      toast.success(t("auth.resend.sent"));
    } catch (err) {
      const msg = mapAuthError(err, lang);
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRefreshStatus() {
    if (busyAction !== null) return;
    setErrorMsg(null);
    setNoticeMsg(null);
    setBusyAction("refresh");
    try {
      if (onRefresh) {
        const verified = await onRefresh();
        if (verified === true) {
          await onVerified?.(auth.currentUser ?? resolvedUser ?? null);
        }
        return;
      }

      const res = await refreshVerificationStatus(lang);
      if (res.verified) {
        toast.success(t("auth.success.signup"));
        await qc.invalidateQueries();
        await onVerified?.(res.user);
        return;
      }

      const pendingMessage =
        channel === "phone" ? t("auth.verify.phoneNotYet") : t("auth.verify.notyet");
      setErrorMsg(pendingMessage);
    } catch (err) {
      const msg = mapAuthError(err, lang);
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setBusyAction(null);
    }
  }

  async function handleLogout() {
    if (busyAction !== null) return;
    setErrorMsg(null);
    setNoticeMsg(null);
    setBusyAction("logout");
    try {
      if (onLogout) {
        await onLogout();
        return;
      }
      if (optionalAuth) {
        await optionalAuth.signOut();
      } else {
        await signOutFirebase();
      }
      qc.clear();
      toast.success(t("common.signedout"));
      navigate({ to: "/auth", replace: true });
    } catch (err) {
      const msg = mapAuthError(err, lang);
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setBusyAction(null);
    }
  }

  const isBusy = busyAction !== null;
  const maskedTarget = target ? (channel === "phone" ? maskPhone(target) : maskEmail(target)) : "—";
  const displayTarget = revealTarget && target ? target : maskedTarget;
  const pendingStateCode: AccountAuthState =
    channel === "phone" ? "PHONE_VERIFICATION_PENDING" : "EMAIL_VERIFICATION_PENDING";

  const content = (
    <div className="space-y-4" data-testid="verification-pending">
      {showHeader && (
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">
            {channel === "phone" ? t("auth.verify.phoneTitle") : t("auth.verify.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {channel === "phone" ? t("auth.verify.phoneWaiting") : t("auth.verify.waiting")}
          </p>
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs leading-relaxed text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p className="flex-1">{errorMsg}</p>
        </div>
      )}

      {noticeMsg && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-success/40 bg-success/10 p-3 text-xs leading-relaxed text-foreground"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
          <p className="flex-1">{noticeMsg}</p>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/70 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          {channel === "phone" ? <Phone className="size-5" /> : <MailCheck className="size-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {channel === "phone" ? t("auth.verify.targetPhone") : t("auth.verify.targetEmail")}
            </p>
            <span
              data-testid="verification-state-badge"
              className="rounded border border-border/70 bg-background/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              {pendingStateCode}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <p
              dir="ltr"
              data-testid="verification-pending-target"
              className="truncate text-sm font-semibold text-foreground tabular-nums"
            >
              {displayTarget}
            </p>
            {Boolean(target) && (
              <button
                type="button"
                onClick={() => setRevealTarget((prev) => !prev)}
                aria-label={revealTarget ? "Hide target" : "Show target"}
                className="shrink-0 rounded p-1 text-muted-foreground hover:bg-background/70 hover:text-foreground"
              >
                {revealTarget ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {showPhoneResendForm && channel === "phone" && (
        <div className="rounded-xl border border-border bg-surface-2/40 p-4">
          <PhoneVerificationForm
            mode={resolvedUser ? "link" : "signin"}
            initialPhone={target || undefined}
            compact
            onSuccess={async () => {
              setShowPhoneResendForm(false);
              await qc.invalidateQueries();
              await onVerified?.(auth.currentUser);
            }}
          />
        </div>
      )}

      <div className="space-y-2.5">
        <Button
          type="button"
          variant="glow"
          className="w-full"
          disabled={isBusy}
          onClick={handleRefreshStatus}
        >
          {busyAction === "refresh" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          <span>{t("auth.verify.refresh")}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isBusy || cooldown > 0}
          onClick={handleResend}
        >
          {busyAction === "resend" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : channel === "phone" ? (
            <Phone className="size-4" />
          ) : (
            <Mail className="size-4" />
          )}
          <span>
            {cooldown > 0 ? `${t("auth.verify.resend")} (${cooldown}s)` : t("auth.verify.resend")}
          </span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground"
          disabled={isBusy}
          onClick={handleLogout}
        >
          {busyAction === "logout" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          <span>{t("auth.verify.logout")}</span>
        </Button>
      </div>
    </div>
  );

  if (variant === "embedded") {
    return content;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background bg-hero">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <LanguageSwitcher compact />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center px-5 pb-16">
        <div className="surface-card w-full p-6 sm:p-7">{content}</div>
      </main>
    </div>
  );
}
