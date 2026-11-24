import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Languages,
  LayoutPanelTop,
  LogOut,
  Moon,
  Sparkles,
  Sun,
  UserCheck,
  Volume2,
  HelpCircle,
  MessageSquare,
  Settings,
  Shield,
} from "lucide-react";
import { useRbac } from "@/hooks/use-rbac";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UpgradeAccountDialog } from "@/components/auth/UpgradeAccountDialog";
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
import { useProfile, useUser } from "@/hooks/use-nexora";
import { useSaveProfile } from "@/hooks/use-settings";
import { useThemePersistence } from "@/hooks/use-theme-persistence";
import { signOutFirebase } from "@/lib/firebase-auth";
import { LANG_META, SUPPORTED_LANGS } from "@/lib/i18n-dict";
import { usePrefs } from "@/lib/preferences";
import { extractReadablePageText } from "@/lib/speech-service";
import { getUiExperienceById, UI_EXPERIENCES } from "@/lib/ui-experiences";
import { cn } from "@/lib/utils";

export function UserMenu({ compact }: { compact?: boolean }) {
  const { data: user } = useUser();
  const { data: profile } = useProfile();
  const {
    t,
    resolvedTheme,
    lang,
    setLang,
    a11y,
    speakText,
    speechSupported,
    effectiveUiExperience,
    setUiExperience,
  } = usePrefs();
  const { applyColorMode } = useThemePersistence();
  const qc = useQueryClient();
  const saveProfile = useSaveProfile();
  const navigate = useNavigate();
  const rbac = useRbac();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const isGuest = Boolean(user?.isAnonymous);
  const name =
    profile?.display_name ||
    user?.displayName ||
    (isGuest ? t("dash.guestName") : t("dash.studentName"));
  const avatar = profile?.avatar_url || user?.photoURL || null;

  useEffect(() => {
    setAvatarError(false);
  }, [avatar]);

  async function signOut() {
    try {
      await qc.cancelQueries();
      await signOutFirebase();
      qc.clear();
      toast.success(t("common.signedout"));
      navigate({ to: "/auth", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("set.error"));
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
          {avatar && !avatarError ? (
            <img
              src={avatar}
              alt={name}
              referrerPolicy="no-referrer"
              onError={() => setAvatarError(true)}
              className="size-8 shrink-0 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent font-display text-xs font-bold text-accent-foreground">
              {isGuest ? <UserCheck className="size-4" /> : name.slice(0, 1).toUpperCase()}
            </span>
          )}
          {!compact && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{name}</div>
              {isGuest && (
                <div className="truncate text-[10px] font-medium text-primary">
                  {t("auth.guest.badge")}
                </div>
              )}
            </div>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          {isGuest && (
            <>
              <DropdownMenuItem onClick={() => setUpgradeOpen(true)}>
                <Sparkles className="text-primary" />
                <span>{t("auth.guest.upgrade")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={() => {
              const v = resolvedTheme === "dark" ? "light" : "dark";
              void applyColorMode(v);
            }}
          >
            {resolvedTheme === "dark" ? <Sun /> : <Moon />}{" "}
            {resolvedTheme === "dark" ? t("theme.light") : t("theme.dark")}
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Languages />
              <span>
                {t("lang.switch")}: {LANG_META[lang].nativeName}
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {SUPPORTED_LANGS.map((code) => {
                const meta = LANG_META[code];
                const active = code === lang;
                return (
                  <DropdownMenuItem
                    key={code}
                    onClick={() => {
                      const prevLang = lang;
                      setLang(code);
                      saveProfile({ language: code }).catch(() => {
                        setLang(prevLang);
                        toast.error(t("set.error"));
                      });
                    }}
                    className="flex items-center justify-between"
                  >
                    <span>{meta.nativeName}</span>
                    {active && <Check className="size-3.5 text-primary" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <LayoutPanelTop />
              <span>
                {lang === "ar" ? "واجهة وتجربة الموقع" : "UI & UX"}:{" "}
                {lang === "ar"
                  ? getUiExperienceById(effectiveUiExperience).nameAr
                  : getUiExperienceById(effectiveUiExperience).nameEn}
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-60">
              {UI_EXPERIENCES.map((exp) => {
                const active = exp.id === effectiveUiExperience;
                return (
                  <DropdownMenuItem
                    key={exp.id}
                    onClick={() => {
                      setUiExperience(exp.id);
                    }}
                    className="flex items-center justify-between"
                  >
                    <span className="truncate">{lang === "ar" ? exp.nameAr : exp.nameEn}</span>
                    {active && <Check className="size-3.5 shrink-0 text-primary" />}
                  </DropdownMenuItem>
                );
              })}
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
              <Volume2 />
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
          <DropdownMenuItem onClick={() => navigate({ to: "/app/support" })}>
            <MessageSquare className="size-4" />
            <span>{t("nav.supportTickets")}</span>
          </DropdownMenuItem>
          {rbac.isStaff && (
            <DropdownMenuItem
              onClick={() => navigate({ to: "/app/admin" })}
              className="text-primary font-semibold"
            >
              <Shield className="size-4" />
              <span>{t("nav.adminCenter")}</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut /> {t("common.signout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UpgradeAccountDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
