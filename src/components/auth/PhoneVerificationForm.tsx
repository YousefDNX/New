import type { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Phone, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  COUNTRY_CODES,
  extractFirebaseAuthCode,
  formatCountryLabel,
  mapAuthError,
  validatePhoneNumber,
} from "@/lib/auth-validation";
import { applyAuthPersistence, getSessionRememberPreference } from "@/lib/firebase";
import {
  confirmLinkedPhoneOtp,
  confirmPhoneOtp,
  confirmUpdatedPhoneCode,
  createPhoneRecaptcha,
  linkPhoneOtp,
  sendPhoneOtp,
  sendPhoneVerificationViaProvider,
} from "@/lib/firebase-auth";
import { usePrefs } from "@/lib/preferences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModernSelect } from "@/components/ui/modern-select";

export interface PhoneVerificationFormProps {
  mode: "signin" | "link" | "update" | "upgrade";
  initialPhone?: string | null | undefined;
  rememberMe?: boolean;
  onSuccess: (phoneNumber: string | null) => Promise<void> | void;
  onError?: ((message: string) => void) | undefined;
  onNotice?: ((message: string) => void) | undefined;
  compact?: boolean;
}

type CaptchaState = "loading" | "ready" | "solved" | "expired" | "error";

export function PhoneVerificationForm({
  mode,
  initialPhone,
  rememberMe,
  onSuccess,
  onError,
  onNotice,
  compact = false,
}: PhoneVerificationFormProps) {
  const { t, lang } = usePrefs();

  const [countryDial, setCountryDial] = useState("+965");
  const [phoneInput, setPhoneInput] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [providerVerificationId, setProviderVerificationId] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);

  const [captchaNonce, setCaptchaNonce] = useState(0);
  const [captchaState, setCaptchaState] = useState<CaptchaState>("loading");
  const [captchaSolved, setCaptchaSolved] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [externalBlocker, setExternalBlocker] = useState<string | null>(null);
  const [localNotice, setLocalNotice] = useState<string | null>(null);

  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaHostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!initialPhone) return;
    const match = COUNTRY_CODES.find((c) => initialPhone.startsWith(c.dial));
    if (match) {
      setCountryDial(match.dial);
      setPhoneInput(initialPhone.slice(match.dial.length));
    } else {
      setPhoneInput((prev) => prev || initialPhone);
    }
  }, [initialPhone]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const destroyRecaptcha = useCallback(() => {
    if (recaptchaRef.current) {
      try {
        recaptchaRef.current.clear();
      } catch {
        // Ignore already-cleared widget errors
      }
      recaptchaRef.current = null;
    }
    if (recaptchaHostRef.current) {
      recaptchaHostRef.current.innerHTML = "";
    }
    setCaptchaSolved(false);
  }, []);

  const refreshCaptchaWidget = useCallback(() => {
    destroyRecaptcha();
    setCaptchaState("loading");
    setCaptchaNonce((n) => n + 1);
  }, [destroyRecaptcha]);

  const awaitingOtpStep = Boolean(confirmationResult || providerVerificationId);

  useEffect(() => {
    if (awaitingOtpStep) return;
    const host = recaptchaHostRef.current;
    if (!host || typeof document === "undefined") return;

    let cancelled = false;
    destroyRecaptcha();
    setCaptchaState("loading");

    // Mount into a fresh detached child node so Google reCAPTCHA never collides with a prior widgetId
    const mountNode = document.createElement("div");
    host.appendChild(mountNode);

    try {
      const verifier = createPhoneRecaptcha(mountNode, {
        onSolved: () => {
          if (cancelled) return;
          setCaptchaSolved(true);
          setCaptchaState("solved");
          setLocalError(null);
        },
        onExpired: () => {
          if (cancelled) return;
          setCaptchaSolved(false);
          setCaptchaState("expired");
        },
        onError: () => {
          if (cancelled) return;
          setCaptchaSolved(false);
          setCaptchaState("error");
        },
      });
      recaptchaRef.current = verifier;
      void verifier
        .render()
        .then(() => {
          if (!cancelled) {
            setCaptchaState((prev) => (prev === "solved" ? "solved" : "ready"));
          }
        })
        .catch(() => {
          if (!cancelled) {
            setCaptchaState("error");
          }
        });
    } catch {
      if (!cancelled) {
        setCaptchaState("error");
      }
    }

    return () => {
      cancelled = true;
      destroyRecaptcha();
    };
  }, [awaitingOtpStep, captchaNonce, destroyRecaptcha]);

  function reportError(msg: string) {
    setLocalError(msg);
    setLocalNotice(null);
    onError?.(msg);
    toast.error(msg);
  }

  function reportNotice(msg: string) {
    setLocalNotice(msg);
    setLocalError(null);
    onNotice?.(msg);
    toast.success(msg);
  }

  async function handleSendSms(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    setExternalBlocker(null);
    setLocalNotice(null);

    const parsed = validatePhoneNumber(countryDial, phoneInput);
    if (!parsed.valid) {
      reportError(t("auth.phone.invalid"));
      return;
    }

    if (!recaptchaRef.current) {
      refreshCaptchaWidget();
      reportError(t("auth.phone.captchaError"));
      return;
    }

    if (!captchaSolved) {
      reportError(t("auth.phone.captchaWait"));
      return;
    }

    setBusy(true);
    try {
      const shouldRemember = rememberMe ?? getSessionRememberPreference();
      if (mode === "signin") {
        await applyAuthPersistence(shouldRemember);
      }
      if (mode === "link" || mode === "upgrade") {
        const res = await linkPhoneOtp(parsed.e164, recaptchaRef.current);
        setConfirmationResult(res);
      } else if (mode === "update") {
        const verificationId = await sendPhoneVerificationViaProvider(
          parsed.e164,
          recaptchaRef.current,
        );
        setProviderVerificationId(verificationId);
      } else {
        const res = await sendPhoneOtp(parsed.e164, recaptchaRef.current);
        setConfirmationResult(res);
      }
      setFormattedPhone(parsed.e164);
      setCooldown(60);
      reportNotice(`${t("auth.phone.sent")} ${parsed.e164}`);
    } catch (err) {
      // Consumed reCAPTCHA token cannot be reused — rebuild widget automatically so user can retry immediately
      refreshCaptchaWidget();
      const code = extractFirebaseAuthCode(err);
      const blockerCodes = new Set([
        "auth/billing-not-enabled",
        "auth/operation-not-allowed",
        "auth/quota-exceeded",
        "auth/captcha-check-failed",
        "auth/invalid-app-credential",
        "auth/unauthorized-domain",
      ]);
      const mapped = mapAuthError(err, lang);
      if (code && blockerCodes.has(code)) {
        setExternalBlocker(
          `${mapped} (${code}). Email, Google, and Guest authentication remain available.`,
        );
      }
      reportError(mapped);
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmationResult && !providerVerificationId) return;
    setLocalError(null);

    const cleanCode = smsCode.replace(/\s+/g, "");
    if (!/^\d{6}$/.test(cleanCode)) {
      reportError(t("auth.phone.otpError"));
      return;
    }

    setBusy(true);
    try {
      let verifiedPhone: string | null = formattedPhone;
      if ((mode === "link" || mode === "upgrade") && confirmationResult) {
        const u = await confirmLinkedPhoneOtp(confirmationResult, cleanCode, lang);
        verifiedPhone = u.phoneNumber ?? formattedPhone;
      } else if (mode === "update" && providerVerificationId) {
        const u = await confirmUpdatedPhoneCode(providerVerificationId, cleanCode, lang);
        verifiedPhone = u.phoneNumber ?? formattedPhone;
      } else if (confirmationResult) {
        await applyAuthPersistence(rememberMe ?? getSessionRememberPreference());
        const u = await confirmPhoneOtp(confirmationResult, cleanCode, lang);
        verifiedPhone = u.phoneNumber ?? formattedPhone;
      }

      setConfirmationResult(null);
      setProviderVerificationId(null);
      setSmsCode("");
      await onSuccess(verifiedPhone);
    } catch (err) {
      reportError(mapAuthError(err, lang));
    } finally {
      setBusy(false);
    }
  }

  function handleResetToNumberStep() {
    setConfirmationResult(null);
    setProviderVerificationId(null);
    setSmsCode("");
    setLocalError(null);
    refreshCaptchaWidget();
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-3.5"}>
      {localError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs leading-relaxed text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p className="flex-1">{localError}</p>
        </div>
      )}

      {externalBlocker && (
        <div
          role="note"
          data-testid="phone-external-blocker"
          className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs leading-relaxed text-foreground"
        >
          <p className="font-semibold">Phone SMS Blocked by External Firebase Configuration</p>
          <p className="mt-1 text-muted-foreground">{externalBlocker}</p>
        </div>
      )}

      {localNotice && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-success/40 bg-success/10 p-3 text-xs leading-relaxed text-foreground"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
          <p className="flex-1">{localNotice}</p>
        </div>
      )}

      {!awaitingOtpStep ? (
        <form onSubmit={handleSendSms} className="space-y-3.5" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor={`phone-country-${mode}`}>{t("auth.phone.country")}</Label>
            <ModernSelect
              id={`phone-country-${mode}`}
              ariaLabel={t("auth.phone.country")}
              size="sm"
              value={countryDial}
              onValueChange={setCountryDial}
              options={COUNTRY_CODES.map((c) => ({
                value: c.dial,
                label: formatCountryLabel(c, lang),
              }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`phone-number-${mode}`}>{t("auth.phone.number")}</Label>
            <div className="flex gap-2" dir="ltr">
              <div className="flex h-9 items-center rounded-md border border-input bg-surface-2 px-3 text-sm font-medium text-muted-foreground tabular-nums">
                {countryDial}
              </div>
              <Input
                id={`phone-number-${mode}`}
                type="tel"
                inputMode="tel"
                required
                placeholder="50000000"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                autoComplete="tel-national"
              />
            </div>
          </div>

          {/* Visible Firebase reCAPTCHA Container with dynamic fresh mount & status controls */}
          <div className="space-y-2">
            <div className="overflow-x-auto rounded-lg border border-border/70 bg-surface-2/40 p-2">
              <div
                ref={recaptchaHostRef}
                id={`nexora-phone-recaptcha-${mode}-${captchaNonce}`}
                className="min-h-[78px]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <ShieldCheck
                  className={`size-3.5 ${captchaSolved ? "text-success" : "text-muted-foreground"}`}
                />
                {captchaState === "expired"
                  ? t("auth.phone.captchaExpired")
                  : captchaState === "error"
                    ? t("auth.phone.captchaError")
                    : captchaSolved
                      ? t("common.enabled")
                      : t("auth.phone.captchaWait")}
              </span>
              <button
                type="button"
                onClick={refreshCaptchaWidget}
                disabled={busy}
                className="inline-flex items-center gap-1 text-primary hover:underline disabled:opacity-50"
              >
                <RefreshCw className="size-3" />
                <span>{t("auth.phone.captchaRefresh")}</span>
              </button>
            </div>
          </div>

          <Button type="submit" variant="glow" className="h-10 w-full" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Phone className="size-4" />}
            <span>{t("auth.phone.send")}</span>
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-3.5" noValidate>
          <div className="rounded-xl border border-border bg-surface-2/70 p-3 text-xs text-muted-foreground">
            {t("auth.phone.sent")}{" "}
            <span className="font-semibold text-foreground tabular-nums" dir="ltr">
              {formattedPhone}
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`phone-otp-${mode}`}>{t("auth.phone.code")}</Label>
            <Input
              id={`phone-otp-${mode}`}
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              placeholder="123456"
              value={smsCode}
              onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              dir="ltr"
              className="text-center font-mono text-lg tracking-widest tabular-nums"
              autoComplete="one-time-code"
            />
          </div>

          <Button type="submit" variant="glow" className="h-10 w-full" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            <span>{t("auth.phone.verify")}</span>
          </Button>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <button
              type="button"
              onClick={handleResetToNumberStep}
              disabled={busy}
              className="text-primary hover:underline"
            >
              {t("auth.phone.change")}
            </button>

            {cooldown > 0 ? (
              <span className="text-muted-foreground tabular-nums">
                {t("auth.phone.resendIn")} {cooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResetToNumberStep}
                disabled={busy}
                className="font-medium text-primary hover:underline"
              >
                {t("auth.phone.resend")}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
