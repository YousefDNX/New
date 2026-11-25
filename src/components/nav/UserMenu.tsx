import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  CheckCircle2,
  HelpCircle,
  Languages,
  LogOut,
  Moon,
  RotateCcw,
  Settings,
  Shield,
  Sparkles,
  Sun,
  UserCheck,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UpgradeAccountDialog } from "@/components/auth/UpgradeAccountDialog";
import { useProfile, useUser } from "@/hooks/use-nexora";
import { useRbac } from "@/hooks/use-rbac";
import { useSaveProfile } from "@/hooks/use-settings";
import { useThemePersistence } from "@/hooks/use-theme-persistence";
import { resetGuestSession, signOutFirebase } from "@/lib/firebase-auth";
import { usePrefs } from "@/lib/preferences";
import { extractReadablePageText } from "@/lib/speech-service";
import { cn } from "@/lib/utils";

export function UserMenu({ compact }: { compact?: boolean }) {
  const { data: user } = useUser();
  const { data: profile } = useProfile();
  const { t, resolvedTheme, lang, setLang, a11y, speakText, speechSupported } = usePrefs();
  const { applyColorMode } = useThemePersistence();
  const qc = useQueryClient();
  const saveProfile = useSaveProfile();
  const navigate = useNavigate();
  const rbac = useRbac();
  const [resetBusy, setResetBusy] = useState(false);
  const [signOutBusy, setSignOutBusy] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const isAr = lang === "ar";
  const isGuest = !user || Boolean(user.isAnonymous);
  const name =
    profile?.display_name ||
    user?.displayName ||
    (isGuest ? (isAr ? "طالب ضيف" : "Guest Student") : isAr ? "طالب" : "Student");

  async function handleResetGuest() {
    if (resetBusy) return;
    setResetBusy(true);
    try {
      await qc.cancelQueries();
      await resetGuestSession(user?.uid);
      qc.clear();
      toast.success(isAr ? "تمت إعادة ضبط جلسة الضيف." : "Guest session reset.");
      void navigate({ to: "/auth", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("set.error"));
    } finally {
      setResetBusy(false);
    }
  }

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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={name}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg p-1.5 text-start hover:bg-surface-2",
            compact && "justify-center",
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent font-display text-xs font-bold text-accent-foreground">
            {isGuest ? <UserCheck className="size-4" /> : <CheckCircle2 className="size-4 text-emerald-500" />}
          </span>
          {!compact && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{name}</div>
              <div className="truncate text-[10px] font-medium text-primary">
                {isGuest
                  ? isAr
                    ? "جلسة ضيف"
                    : "Guest Session"
                  : user?.email || (isAr ? "حساب موثق" : "Verified Account")}
              </div>
            </div>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => {
              const v = resolvedTheme === "dark" ? "light" : "dark";
              void applyColorMode(v);
            }}
          >
            {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}{" "}
            {resolvedTheme === "dark" ? t("theme.light") : t("theme.dark")}
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Languages className="size-4" />
              <span>
                {t("lang.switch")}: {lang === "ar" ? "العربية" : "English"}
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-40">
              {(
                [
                  { code: "en" as const, label: "English" },
                  { code: "ar" as const, label: "العربية" },
                ] as const
              ).map((opt) => (
                <DropdownMenuItem
                  key={opt.code}
                  onClick={() => {
                    const prevLang = lang;
                    setLang(opt.code);
                    saveProfile({ language: opt.code }).catch(() => {
                      setLang(prevLang);
                      toast.error(t("set.error"));
                    });
                  }}
                  className="flex items-center justify-between"
                >
                  <span>{opt.label}</span>
                  {lang === opt.code && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          {a11y.readAloud && speechSupported && (
            <DropdownMenuItem
              onClick={() => {
                const main = document.getElementById("main-content");
                const txt = extractReadablePageText(main);
                if (txt) speakText(txt);
              }}
            >
              <Volume2 className="size-4" />
              <span>{t("a11y.readAloud.page")}</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: "/app/settings" })}>
            <Settings className="size-4" />
            <span>{t("nav.settings")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate({ to: "/app/help" })}>
            <HelpCircle className="size-4" />
            <span>{t("nav.helpCenter")}</span>
          </DropdownMenuItem>
          {rbac.isStaff && (
            <DropdownMenuItem
              onClick={() => navigate({ to: "/app/admin" })}
              className="font-semibold text-primary"
            >
              <Shield className="size-4" />
              <span>{t("nav.adminCenter")}</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {isGuest ? (
            <>
              <DropdownMenuItem onClick={() => setUpgradeOpen(true)}>
                <Sparkles className="size-4 text-primary" />
                <span>{isAr ? "ترقية إلى حساب دائم" : "Upgrade to Permanent Account"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleResetGuest} disabled={resetBusy}>
                <RotateCcw className="size-4" />
                <span>{isAr ? "إعادة ضبط جلسة الضيف" : "Reset Guest Session"}</span>
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={handleSignOut} disabled={signOutBusy} className="text-destructive focus:text-destructive">
              <LogOut className="size-4" />
              <span>{isAr ? "تسجيل الخروج" : "Sign Out"}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <UpgradeAccountDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
