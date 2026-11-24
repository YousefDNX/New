import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  CheckCircle2,
  Circle,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { downloadTextFile } from "@/lib/safe-file";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { exportStudentDataJson } from "@/hooks/use-settings";
import {
  evaluatePasswordStrength,
  extractFirebaseAuthCode,
  mapAuthError,
  validateEmail,
} from "@/lib/auth-validation";
import { resolveProviderId } from "@/lib/auth-bootstrap";
import { applyAuthPersistence, setSessionRememberPreference } from "@/lib/firebase";
import {
  computeVerificationChecklist,
  deleteCurrentUserAndData,
  linkEmailPasswordToCurrentUser,
  linkGoogleToCurrentUser,
  linkPasswordToCurrentUser,
  reauthenticateWithGoogle,
  reauthenticateWithPassword,
  refreshEmailVerificationStatus,
  requestEmailChangeVerification,
  resendVerificationEmail,
  sendPasswordReset,
  signOutFirebase,
  updateSignedInPassword,
} from "@/lib/firebase-auth";
import type { ProfileRow, UserSettingsRow } from "@/lib/firestore-data";
import { getPrefsStorageKey, usePrefs } from "@/lib/preferences";
import { BRAND, isBtcMode } from "@/config/brand";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { SegmentedChoice, SettingsRow, SettingsSectionCard } from "./SettingsPrimitives";

type SettingsPatch = Partial<Omit<UserSettingsRow, "user_id" | "theme">> & { theme?: string };

export function PrivacySecuritySection({
  user,
  profile,
  onOpenUpgrade,
  runSave,
}: {
  user: ReturnType<typeof import("@/hooks/use-nexora").useUser>["data"];
  profile: ProfileRow | null | undefined;
  onOpenUpgrade: () => void;
  runSave: (apply: () => void, undo: () => void, patch: SettingsPatch) => void;
}) {
  const { t, lang, privacy, setPrivacy } = usePrefs();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [emailFormOpen, setEmailFormOpen] = useState(false);
  const [pwFormOpen, setPwFormOpen] = useState(false);

  const [emailInput, setEmailInput] = useState("");
  const [emailLinkPassword, setEmailLinkPassword] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPwInput, setConfirmPwInput] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);

  const [verifyRefreshBusy, setVerifyRefreshBusy] = useState(false);
  const [googleLinkBusy, setGoogleLinkBusy] = useState(false);
  const [emailActionBusy, setEmailActionBusy] = useState(false);
  const [pwActionBusy, setPwActionBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Re-authentication modal when Firebase throws auth/requires-recent-login
  const [reauthOpen, setReauthOpen] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthBusy, setReauthBusy] = useState(false);
  const [pendingSensitiveAction, setPendingSensitiveAction] = useState<
    (() => Promise<void>) | null
  >(null);

  const isMinor =
    profile?.age_band === "13-17" || profile?.age_band === "13-15" || profile?.age_band === "16-17";
  const providers =
    user?.providerData.map((p) => p.providerId).filter((id): id is string => Boolean(id)) ?? [];

  const checklist = computeVerificationChecklist({
    isAnonymous: user?.isAnonymous,
    email: user?.email,
    emailVerified: user?.emailVerified,
    phoneNumber: user?.phoneNumber,
    profilePhone: profile?.phone_number,
    providers,
    ageBand: profile?.age_band,
  });
  const visibleCompletedCount = [
    checklist.emailVerified,
    checklist.hasGoogle,
    checklist.hasPassword,
  ].filter(Boolean).length;
  const visibleTotalChecks = 3;

  const pwStrength = useMemo(
    () =>
      evaluatePasswordStrength(
        emailFormOpen && !user?.email ? emailLinkPassword : newPasswordInput,
      ),
    [emailFormOpen, user?.email, emailLinkPassword, newPasswordInput],
  );

  function triggerReauth(retryAction: () => Promise<void>) {
    setPendingSensitiveAction(() => retryAction);
    setReauthPassword("");
    setReauthOpen(true);
  }

  function updatePrivacy(patch: Partial<typeof privacy>, dbPatch: SettingsPatch) {
    const prev = privacy;
    runSave(
      () => setPrivacy(patch),
      () => setPrivacy(prev),
      dbPatch,
    );
  }

  async function handleTogglePersistence(checked: boolean) {
    setSessionRememberPreference(checked);
    await applyAuthPersistence(checked);
    updatePrivacy({ keepSignedIn: checked }, { keep_signed_in: checked });
  }

  async function handleCheckEmailVerified() {
    setVerifyRefreshBusy(true);
    try {
      const res = await refreshEmailVerificationStatus(lang);
      await qc.invalidateQueries({ queryKey: ["profile"] });
      if (res.verified) {
        toast.success(t("set.sec.verified"));
      } else {
        toast.info(t("auth.verify.notyet"));
      }
    } catch (err) {
      toast.error(mapAuthError(err, lang));
    } finally {
      setVerifyRefreshBusy(false);
    }
  }

  async function handleLinkGoogle() {
    setGoogleLinkBusy(true);
    try {
      await linkGoogleToCurrentUser(lang);
      await qc.invalidateQueries();
      toast.success(t("auth.chk.googleLinked"));
    } catch (err) {
      toast.error(mapAuthError(err, lang));
    } finally {
      setGoogleLinkBusy(false);
    }
  }

  async function submitEmailAction() {
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!validateEmail(cleanEmail)) {
      toast.error(t("auth.email.error"));
      return;
    }

    setEmailActionBusy(true);
    try {
      if (!user?.email) {
        if (!evaluatePasswordStrength(emailLinkPassword).valid) {
          toast.error(t("auth.pw.invalid"));
          return;
        }
        await linkEmailPasswordToCurrentUser({
          email: cleanEmail,
          password: emailLinkPassword,
          lang,
        });
        await qc.invalidateQueries();
        setEmailInput("");
        setEmailLinkPassword("");
        setEmailFormOpen(false);
        toast.success(t("auth.chk.emailLinked"));
      } else {
        await requestEmailChangeVerification(cleanEmail);
        setEmailInput("");
        setEmailFormOpen(false);
        toast.success(t("auth.chk.updateEmailSent"));
      }
    } catch (err) {
      if (extractFirebaseAuthCode(err) === "auth/requires-recent-login") {
        triggerReauth(submitEmailAction);
      } else {
        toast.error(mapAuthError(err, lang));
      }
    } finally {
      setEmailActionBusy(false);
    }
  }

  async function submitPasswordAction() {
    if (!evaluatePasswordStrength(newPasswordInput).valid) {
      toast.error(t("auth.pw.invalid"));
      return;
    }
    if (newPasswordInput !== confirmPwInput) {
      toast.error(t("auth.pw.mismatch"));
      return;
    }

    setPwActionBusy(true);
    try {
      if (checklist.hasPassword) {
        await updateSignedInPassword(newPasswordInput);
      } else {
        await linkPasswordToCurrentUser({ password: newPasswordInput, lang });
      }
      await qc.invalidateQueries();
      setNewPasswordInput("");
      setConfirmPwInput("");
      setPwFormOpen(false);
      toast.success(t("auth.chk.pwUpdated"));
    } catch (err) {
      if (extractFirebaseAuthCode(err) === "auth/requires-recent-login") {
        triggerReauth(submitPasswordAction);
      } else {
        toast.error(mapAuthError(err, lang));
      }
    } finally {
      setPwActionBusy(false);
    }
  }

  async function handleExportJson() {
    setExportBusy(true);
    try {
      const payload = await exportStudentDataJson();
      downloadTextFile(
        JSON.stringify(payload, null, 2),
        `${BRAND.shortName.toLowerCase()}-student-data-${new Date().toISOString().slice(0, 10)}.json`,
        "application/json;charset=utf-8",
      );
      toast.success(t("set.sec.export.done"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("set.error"));
    } finally {
      setExportBusy(false);
    }
  }

  async function executeDeleteAccount() {
    if (!user?.uid) return;
    setDeleteBusy(true);
    try {
      await deleteCurrentUserAndData(user.uid);
      localStorage.removeItem(getPrefsStorageKey(user.uid));
      localStorage.removeItem("nexora.prefs");
      qc.clear();
      setDeleteOpen(false);
      toast.success(t("set.sec.delete.done"));
      navigate({ to: "/auth", replace: true });
    } catch (err) {
      if (extractFirebaseAuthCode(err) === "auth/requires-recent-login") {
        setDeleteOpen(false);
        triggerReauth(executeDeleteAccount);
      } else {
        toast.error(mapAuthError(err, lang));
      }
    } finally {
      setDeleteBusy(false);
    }
  }

  async function handleReauthPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!reauthPassword) return;
    setReauthBusy(true);
    try {
      await reauthenticateWithPassword(reauthPassword);
      setReauthOpen(false);
      setReauthPassword("");
      toast.success(t("auth.chk.reauthDone"));
      const fn = pendingSensitiveAction;
      setPendingSensitiveAction(null);
      if (fn) await fn();
    } catch (err) {
      toast.error(mapAuthError(err, lang));
    } finally {
      setReauthBusy(false);
    }
  }

  async function handleReauthGoogle() {
    setReauthBusy(true);
    try {
      await reauthenticateWithGoogle();
      setReauthOpen(false);
      toast.success(t("auth.chk.reauthDone"));
      const fn = pendingSensitiveAction;
      setPendingSensitiveAction(null);
      if (fn) await fn();
    } catch (err) {
      toast.error(mapAuthError(err, lang));
    } finally {
      setReauthBusy(false);
    }
  }

  return (
    <SettingsSectionCard
      id="cat-privacy-security"
      title={t("set.sec.title")}
      desc={t("set.sec.d")}
      badge={<FeatureGuideTrigger featureId="settings-privacy-account" />}
    >
      {/* Account Verification Checklist */}
      {user && (
        <div className="space-y-3 py-3.5">
          <div className="rounded-xl border border-border bg-surface-2/50 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="size-4 text-primary" />
                  <span>{t("auth.chk.title")}</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t("auth.chk.desc")}</p>
              </div>
              <span className="rounded-md border border-border bg-card px-2 py-0.5 text-xs font-medium tabular-nums">
                {visibleCompletedCount}/{visibleTotalChecks}
              </span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-xs">
                <span className="flex items-center gap-2">
                  {checklist.emailVerified ? (
                    <CheckCircle2 className="size-3.5 text-success" />
                  ) : (
                    <Circle className="size-3.5 text-muted-foreground" />
                  )}
                  <span>{t("auth.chk.email")}</span>
                </span>
                <span
                  className={
                    checklist.emailVerified ? "font-medium text-success" : "text-muted-foreground"
                  }
                >
                  {checklist.emailVerified
                    ? t("auth.chk.linked")
                    : checklist.hasEmail
                      ? t("set.sec.unverified")
                      : t("auth.chk.notLinked")}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-xs">
                <span className="flex items-center gap-2">
                  {checklist.hasGoogle ? (
                    <CheckCircle2 className="size-3.5 text-success" />
                  ) : (
                    <Circle className="size-3.5 text-muted-foreground" />
                  )}
                  <span>{t("auth.chk.google")}</span>
                </span>
                {checklist.hasGoogle ? (
                  <span className="font-medium text-success">{t("auth.chk.linked")}</span>
                ) : !user.isAnonymous ? (
                  <button
                    type="button"
                    onClick={handleLinkGoogle}
                    disabled={googleLinkBusy}
                    className="font-medium text-primary hover:underline disabled:opacity-50"
                  >
                    {googleLinkBusy ? "…" : t("auth.chk.linkGoogle")}
                  </button>
                ) : (
                  <span className="text-muted-foreground">{t("auth.chk.notLinked")}</span>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-xs">
                <span className="flex items-center gap-2">
                  {checklist.hasPassword ? (
                    <CheckCircle2 className="size-3.5 text-success" />
                  ) : (
                    <Circle className="size-3.5 text-muted-foreground" />
                  )}
                  <span>{t("auth.chk.password")}</span>
                </span>
                {!user.isAnonymous && (user.email || checklist.hasPassword) ? (
                  <button
                    type="button"
                    onClick={() => setPwFormOpen((o) => !o)}
                    className="font-medium text-primary hover:underline"
                  >
                    {checklist.hasPassword ? t("auth.chk.changePw") : t("auth.chk.setPw")}
                  </button>
                ) : (
                  <span className="text-muted-foreground">
                    {checklist.hasPassword ? t("auth.chk.set") : t("auth.chk.notSet")}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between rounded-lg border border-border/60 bg-card/50 px-3 py-2 text-xs">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Shield className="size-3.5 text-primary" />
                <span>{t("auth.chk.minor")}</span>
              </span>
              <span className="font-medium text-foreground">
                {checklist.isMinorProtected
                  ? t("auth.chk.minorActive")
                  : t("auth.chk.adultStandard")}
              </span>
            </div>
          </div>

          {/* Connected Providers */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div>
              <p className="text-sm font-medium">{t("set.sec.providers")}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {user.isAnonymous
                  ? t("auth.guest.badge")
                  : resolveProviderId(user) === "google.com"
                    ? t("auth.chk.google")
                    : t("auth.chk.email")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {user.isAnonymous ? (
                <Button
                  type="button"
                  size="sm"
                  variant="glow"
                  onClick={onOpenUpgrade}
                  className="gap-1.5"
                >
                  <Sparkles className="size-3.5" />
                  <span>{t("auth.guest.upgrade")}</span>
                </Button>
              ) : (
                providers.map((p) => (
                  <span
                    key={p}
                    className="rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] font-medium text-foreground"
                  >
                    {p === "google.com"
                      ? t("auth.chk.google")
                      : p === "password"
                        ? t("auth.chk.email")
                        : p}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Email Verification Status + Link/Change Email */}
          <div className="space-y-3 rounded-lg border border-border/70 bg-surface-2/40 p-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{t("set.sec.emailStatus")}</p>
                  <p className="text-muted-foreground">{user.email || t("set.sec.noEmail")}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {user.email ? (
                  user.emailVerified ? (
                    <span className="inline-flex items-center gap-1 font-medium text-success">
                      <CheckCircle2 className="size-3.5" />
                      <span>{t("set.sec.verified")}</span>
                    </span>
                  ) : (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await resendVerificationEmail(user);
                            toast.success(t("auth.resend.sent"));
                          } catch (err) {
                            toast.error(mapAuthError(err, lang));
                          }
                        }}
                      >
                        {t("auth.resend")}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={verifyRefreshBusy}
                        onClick={handleCheckEmailVerified}
                        className="gap-1"
                      >
                        <RefreshCw
                          className={`size-3 ${verifyRefreshBusy ? "animate-spin" : ""}`}
                        />
                        <span>{t("auth.verify.check")}</span>
                      </Button>
                    </>
                  )
                ) : null}

                {!user.isAnonymous && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setEmailFormOpen((o) => !o)}
                  >
                    {user.email ? t("auth.chk.changeEmail") : t("auth.chk.linkEmail")}
                  </Button>
                )}
              </div>
            </div>

            {emailFormOpen && !user.isAnonymous && (
              <div className="space-y-2.5 border-t border-border pt-3">
                <div className="space-y-1">
                  <Label htmlFor="sec-new-email">{t("auth.chk.newEmail")}</Label>
                  <Input
                    id="sec-new-email"
                    type="email"
                    dir="ltr"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={isBtcMode() ? "student@btc.school" : "student@nexora.school"}
                  />
                </div>
                {!user.email && (
                  <div className="space-y-1">
                    <Label htmlFor="sec-link-pw">{t("auth.password")}</Label>
                    <Input
                      id="sec-link-pw"
                      type="password"
                      value={emailLinkPassword}
                      onChange={(e) => setEmailLinkPassword(e.target.value)}
                    />
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEmailFormOpen(false)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="glow"
                    disabled={emailActionBusy}
                    onClick={submitEmailAction}
                  >
                    {emailActionBusy && <Loader2 className="size-3.5 animate-spin" />}
                    <span>{t("auth.chk.sendVerify")}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Password Set / Change Form */}
          {pwFormOpen && !user.isAnonymous && (
            <div className="space-y-2.5 rounded-lg border border-border/70 bg-surface-2/40 p-3 text-xs">
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <KeyRound className="size-3.5 text-primary" />
                <span>{checklist.hasPassword ? t("auth.chk.changePw") : t("auth.chk.setPw")}</span>
              </p>
              <div className="relative">
                <Input
                  type={showNewPw ? "text" : "password"}
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder={t("auth.newpass")}
                  className="pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw((v) => !v)}
                  aria-label={showNewPw ? t("auth.hidepw") : t("auth.showpw")}
                  className="absolute end-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {showNewPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {newPasswordInput.length > 0 && (
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  {[
                    [pwStrength.checks.length, "auth.pw.req.length"],
                    [pwStrength.checks.upper, "auth.pw.req.upper"],
                    [pwStrength.checks.lower, "auth.pw.req.lower"],
                    [pwStrength.checks.number, "auth.pw.req.number"],
                  ].map(([ok, key]) => (
                    <span
                      key={key as string}
                      className={`flex items-center gap-1 ${ok ? "text-success" : "text-muted-foreground"}`}
                    >
                      <Check className={`size-3 shrink-0 ${ok ? "opacity-100" : "opacity-30"}`} />
                      <span>{t(key as Parameters<typeof t>[0])}</span>
                    </span>
                  ))}
                </div>
              )}
              <Input
                type={showNewPw ? "text" : "password"}
                value={confirmPwInput}
                onChange={(e) => setConfirmPwInput(e.target.value)}
                placeholder={t("auth.confirmpass")}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setPwFormOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="glow"
                  disabled={pwActionBusy}
                  onClick={submitPasswordAction}
                >
                  {pwActionBusy && <Loader2 className="size-3.5 animate-spin" />}
                  <span>{t("common.save")}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <SettingsRow id="sec-persist" label={t("set.sec.session")} desc={t("set.sec.sessionNote")}>
        <div className="flex flex-wrap items-center gap-2">
          <Switch
            id="sec-persist"
            checked={privacy.keepSignedIn}
            onCheckedChange={handleTogglePersistence}
          />
          {user?.email && providers.includes("password") && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={async () => {
                if (!user.email) return;
                try {
                  await sendPasswordReset(user.email);
                  toast.success(t("auth.reset.sent"));
                } catch (err) {
                  toast.error(mapAuthError(err, lang));
                }
              }}
            >
              {t("auth.forgot")}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={async () => {
              await signOutFirebase();
              qc.clear();
              toast.success(t("common.signedout"));
              navigate({ to: "/auth", replace: true });
            }}
            className="gap-1.5"
          >
            <LogOut className="size-3.5" />
            <span>{t("set.sec.signout")}</span>
          </Button>
        </div>
      </SettingsRow>

      <SettingsRow
        label={t("set.sec.visibility")}
        desc={isMinor ? t("set.sec.vis.minorNote") : undefined}
      >
        <SegmentedChoice
          label={t("set.sec.visibility")}
          value={isMinor ? "private" : privacy.profileVisibility}
          onChange={(v) => {
            if (isMinor && v !== "private") {
              toast.info(t("set.sec.vis.minorNote"));
              return;
            }
            updatePrivacy({ profileVisibility: v }, { profile_visibility: v });
          }}
          options={[
            { v: "private", l: t("set.sec.vis.private") },
            ...(isMinor ? [] : [{ v: "team" as const, l: t("set.sec.vis.team") }]),
          ]}
        />
      </SettingsRow>

      <SettingsRow id="sec-circle" label={t("set.sec.circle")}>
        <Switch
          id="sec-circle"
          checked={privacy.showInCircle}
          onCheckedChange={(v) => updatePrivacy({ showInCircle: v }, { show_in_circle: v })}
        />
      </SettingsRow>

      <SettingsRow label={t("set.sec.export")} desc={t("set.sec.export.d")}>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleExportJson}
          disabled={exportBusy}
          className="gap-1.5"
        >
          {exportBusy ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Download className="size-3.5" />
          )}
          <span>{t("set.sec.export")}</span>
        </Button>
      </SettingsRow>

      <SettingsRow label={t("set.sec.delete")} desc={t("set.sec.delete.d")}>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => setDeleteOpen(true)}
          className="gap-1.5"
        >
          <Trash2 className="size-3.5" />
          <span>{t("set.sec.delete")}</span>
        </Button>
      </SettingsRow>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-destructive">
              <ShieldAlert className="size-5" />
              <span>{t("set.sec.delete.confirmTitle")}</span>
            </DialogTitle>
            <DialogDescription>{t("set.sec.delete.confirmDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteBusy}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={executeDeleteAccount}
              disabled={deleteBusy}
              className="gap-1.5"
            >
              {deleteBusy && <Loader2 className="size-3.5 animate-spin" />}
              <span>{t("set.sec.delete.confirmBtn")}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Re-authentication Dialog on auth/requires-recent-login */}
      <Dialog open={reauthOpen} onOpenChange={setReauthOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <KeyRound className="size-4 text-primary" />
              <span>{t("auth.chk.reauthTitle")}</span>
            </DialogTitle>
            <DialogDescription>{t("auth.chk.reauthDesc")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReauthPassword} className="space-y-3">
            {checklist.hasGoogle && (
              <Button
                type="button"
                variant="outline"
                disabled={reauthBusy}
                onClick={handleReauthGoogle}
                className="w-full"
              >
                {reauthBusy ? <Loader2 className="size-4 animate-spin" /> : null}
                <span>{t("auth.chk.reauthGoogle")}</span>
              </Button>
            )}

            {checklist.hasPassword && user?.email && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="reauth-pw">{t("auth.chk.reauthPw")}</Label>
                  <Input
                    id="reauth-pw"
                    type="password"
                    value={reauthPassword}
                    onChange={(e) => setReauthPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="glow" disabled={reauthBusy} className="w-full">
                  {reauthBusy && <Loader2 className="size-4 animate-spin" />}
                  <span>{t("auth.chk.reauthBtn")}</span>
                </Button>
              </>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </SettingsSectionCard>
  );
}
