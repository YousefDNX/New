import {
  CheckCircle2,
  Download,
  Loader2,
  LogOut,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "firebase/auth";
import { toast } from "sonner";
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
import { BRAND } from "@/config/brand";
import { useUser } from "@/hooks/use-nexora";
import { exportStudentDataJson, useSaveProfile } from "@/hooks/use-settings";
import { getNicknameErrorMessage, validateGuestNickname } from "@/lib/auth-validation";
import { resetGuestSession, signOutFirebase } from "@/lib/firebase-auth";
import type { ProfileRow } from "@/lib/firestore-data";
import { usePrefs } from "@/lib/preferences";
import { downloadTextFile } from "@/lib/safe-file";
import { UpgradeAccountDialog } from "@/components/auth/UpgradeAccountDialog";
import { SettingsSectionCard } from "./SettingsPrimitives";

export function AccountProfileSection({ profile }: { profile: ProfileRow | null | undefined }) {
  const { t, lang } = usePrefs();
  const isAr = lang === "ar";
  const { data: user } = useUser();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const saveProfile = useSaveProfile();

  const [nickname, setNickname] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [signOutBusy, setSignOutBusy] = useState(false);

  const isGuest = !user || Boolean(user.isAnonymous);

  async function handleSignOut() {
    if (signOutBusy) return;
    setSignOutBusy(true);
    try {
      await qc.cancelQueries();
      await signOutFirebase();
      qc.clear();
      toast.success(isAr ? "تم تسجيل الخروج بنجاح." : "Signed out successfully.");
      void navigate({ to: "/auth", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("set.error"));
    } finally {
      setSignOutBusy(false);
    }
  }

  useEffect(() => {
    if (profile?.display_name) {
      setNickname(profile.display_name);
    }
  }, [profile]);

  async function handleSaveNickname(e: React.FormEvent) {
    e.preventDefault();
    const check = validateGuestNickname(nickname);
    if (!check.valid) {
      setNameError(getNicknameErrorMessage(check.reason, lang));
      return;
    }
    setNameError(null);
    setSaving(true);
    try {
      if (user) {
        await updateProfile(user, { displayName: check.cleaned }).catch(() => undefined);
      }
      await saveProfile({ display_name: check.cleaned });
      toast.success(isAr ? "تم تحديث الاسم المستعار." : "Nickname updated.");
    } catch {
      toast.error(t("set.error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleExportAllData() {
    if (exportBusy) return;
    setExportBusy(true);
    try {
      const payload = await exportStudentDataJson();
      downloadTextFile(
        JSON.stringify(payload, null, 2),
        `${BRAND.shortName.toLowerCase()}-guest-data-${new Date().toISOString().slice(0, 10)}.json`,
        "application/json;charset=utf-8",
      );
      toast.success(isAr ? "تم تصدير بياناتك بنجاح." : "Your data has been exported.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("set.error"));
    } finally {
      setExportBusy(false);
    }
  }

  async function handleResetSession() {
    if (resetBusy) return;
    setResetBusy(true);
    try {
      await qc.cancelQueries();
      await resetGuestSession(user?.uid);
      qc.clear();
      setResetOpen(false);
      toast.success(isAr ? "تمت إعادة ضبط جلسة الضيف." : "Guest session reset.");
      void navigate({ to: "/auth", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("set.error"));
    } finally {
      setResetBusy(false);
    }
  }

  return (
    <SettingsSectionCard
      id="cat-account"
      title={isAr ? "جلسة الضيف والبيانات" : "Guest Session & Data"}
      desc={
        isAr
          ? "إدارة الاسم المستعار وتصدير البيانات أو إعادة ضبط جلسة الضيف الحالية."
          : "Manage your nickname, export your data, or reset your current guest session."
      }
    >
      <div className="space-y-5 pt-3">
        <div className="rounded-xl border border-border bg-surface-2/50 p-3.5 text-xs text-muted-foreground">
          <div className="flex items-center justify-between gap-2 font-semibold text-foreground">
            <div className="flex items-center gap-2">
              {isGuest ? (
                <User className="size-4 text-primary" />
              ) : (
                <CheckCircle2 className="size-4 text-emerald-500" />
              )}
              <span>
                {isGuest
                  ? isAr
                    ? "معلومة جلسة الضيف"
                    : "Guest Session Info"
                  : isAr
                    ? "الحساب الموثق"
                    : "Verified Account"}
              </span>
            </div>
            {!isGuest && user?.email && (
              <span className="font-mono text-[11px] text-muted-foreground">{user.email}</span>
            )}
          </div>
          <p className="mt-1 leading-relaxed">
            {isGuest
              ? isAr
                ? "أنت تستخدم BTC في وضع الضيف. يتم حفظ تفضيلاتك وبياناتك الدراسية المرتبطة بهذه الجلسة على هذا المتصفح، ويمكنك ترقية حسابك لحفظ تقدمك بشكل دائم."
                : "You are using BTC in Guest Mode. Your preferences and progress remain tied to this browser session. You can upgrade to a permanent account anytime."
              : isAr
                ? "حسابك موثّق وبياناتك متزامنة بأمان عبر السحابة مع BTC."
                : "Your account is verified and your study progress syncs securely with BTC."}
          </p>
        </div>

        {isGuest && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3.5">
            <div>
              <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-4 text-primary" />
                <span>{isAr ? "ترقية إلى حساب دائم" : "Upgrade to Permanent Account"}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "احفظ مهامك وسلسلتك الدراسية وتفضيلاتك بحساب بريد إلكتروني أو Google."
                  : "Preserve your tasks, study streaks, and progress with an email or Google account."}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="glow"
              onClick={() => setUpgradeOpen(true)}
              className="gap-1.5 cursor-pointer"
            >
              <Sparkles className="size-3.5" />
              <span>{isAr ? "ترقية الحساب" : "Upgrade Now"}</span>
            </Button>
          </div>
        )}

        <form onSubmit={handleSaveNickname} className="space-y-2.5">
          <Label htmlFor="prof-nickname" className="text-xs font-semibold">
            {isAr ? "الاسم المستعار" : "Guest Nickname"}
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="prof-nickname"
              value={nickname}
              minLength={2}
              maxLength={40}
              onChange={(e) => {
                setNickname(e.target.value);
                if (nameError) setNameError(null);
              }}
              className="flex-1"
            />
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : t("common.save")}
            </Button>
          </div>
          {nameError && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {nameError}
            </p>
          )}
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
          <div>
            <div className="text-sm font-semibold text-foreground">
              {isAr ? "تصدير البيانات (JSON)" : "Export My Data (JSON)"}
            </div>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "تنزيل نسخة من مهامك وأهدافك وملاحظاتك من جلسة الضيف."
                : "Download a copy of your tasks, goals, and notes from this session."}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={exportBusy}
            onClick={handleExportAllData}
            data-testid="settings-export-all-btn"
            className="gap-1.5"
          >
            {exportBusy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            <span>{isAr ? "تصدير" : "Export"}</span>
          </Button>
        </div>

        {isGuest ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
            <div>
              <div className="text-sm font-semibold text-destructive">
                {isAr ? "إعادة ضبط جلسة الضيف" : "Reset Guest Session"}
              </div>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "حذف بيانات جلسة الضيف الحالية والبدء بملف ضيف جديد."
                  : "Delete this guest session's data and start a fresh session."}
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setResetOpen(true)}
              className="gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              <span>{isAr ? "إعادة ضبط" : "Reset Session"}</span>
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
            <div>
              <div className="text-sm font-semibold text-destructive">
                {isAr ? "تسجيل الخروج" : "Sign Out"}
              </div>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "تسجيل الخروج الآمن من حسابك على هذا الجهاز."
                  : "Securely sign out of your account on this device."}
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleSignOut}
              disabled={signOutBusy}
              className="gap-1.5"
            >
              {signOutBusy ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <LogOut className="size-3.5" />
              )}
              <span>{isAr ? "تسجيل الخروج" : "Sign Out"}</span>
            </Button>
          </div>
        )}
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-destructive">
              <ShieldAlert className="size-5" />
              <span>{isAr ? "تأكيد إعادة ضبط الجلسة" : "Confirm Session Reset"}</span>
            </DialogTitle>
            <DialogDescription>
              {isAr
                ? "سيؤدي هذا الإجراء إلى مسح مهامك ومشاركاتك المحفوظة وتفضيلات هذه الجلسة نهائياً."
                : "This will permanently remove your tasks, saved items, and preferences for this guest session."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResetOpen(false)}
              disabled={resetBusy}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleResetSession}
              disabled={resetBusy}
              className="gap-1.5"
            >
              {resetBusy && <Loader2 className="size-3.5 animate-spin" />}
              <span>{isAr ? "تأكيد إعادة الضبط" : "Reset Guest Session"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradeAccountDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </SettingsSectionCard>
  );
}
