import { createFileRoute } from "@tanstack/react-router";
import { Accessibility, Globe, Moon, RotateCcw, Sun, User } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/Page";
import { AccountProfileSection } from "@/components/settings/AccountProfileSection";
import { SettingsRow, SettingsSectionCard } from "@/components/settings/SettingsPrimitives";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BRAND } from "@/config/brand";
import { useProfile, useUser } from "@/hooks/use-nexora";
import {
  CloudSettingsFallbackError,
  OfflineSettingsError,
  useSaveProfile,
  useSaveSettings,
} from "@/hooks/use-settings";
import { useThemePersistence } from "@/hooks/use-theme-persistence";
import { defaultSettingsDoc, type UserSettingsRow } from "@/lib/firestore-data";
import type { Lang } from "@/lib/i18n-dict";
import { usePrefs } from "@/lib/preferences";
import { clampFontScale, clampSpeechRate } from "@/lib/settings";

export const Route = createFileRoute("/_authenticated/app/settings")({
  head: () => ({
    meta: [
      { title: `Settings — ${BRAND.name}` },
      {
        name: "description",
        content: `Language, dark/light theme, accessibility preferences, and guest session settings for ${BRAND.name}.`,
      },
    ],
  }),
  component: SettingsPage,
});

type SettingsPatch = Partial<Omit<UserSettingsRow, "user_id" | "theme">> & { theme?: string };

function SettingsPage() {
  const { t, lang, setLang, resolvedTheme, a11y, setA11y, resetAllPreferences } = usePrefs();
  const isAr = lang === "ar";
  const { data: user } = useUser();
  const { data: profile } = useProfile();
  const saveSettings = useSaveSettings();
  const saveProfile = useSaveProfile();
  const { applyColorMode } = useThemePersistence();

  function saveA11y(patch: Parameters<typeof setA11y>[0], dbPatch: SettingsPatch) {
    const prev = a11y;
    setA11y(patch);
    void saveSettings(dbPatch)
      .then(() => toast.success(t("set.saved"), { id: "set-saved", duration: 1200 }))
      .catch((err) => {
        if (err instanceof OfflineSettingsError || err instanceof CloudSettingsFallbackError) {
          toast.info(t("set.savedLocalFallback"), { id: "set-saved", duration: 1500 });
          return;
        }
        setA11y(prev);
        toast.error(t("set.error"));
      });
  }

  function handleLangChange(nextLang: Lang) {
    const prev = lang;
    setLang(nextLang);
    void saveProfile({ language: nextLang })
      .then(() => toast.success(t("set.saved"), { id: "set-saved", duration: 1200 }))
      .catch(() => {
        setLang(prev);
        toast.error(t("set.error"));
      });
  }

  async function handleResetPrefs() {
    resetAllPreferences();
    if (user?.uid) {
      try {
        const defaults = defaultSettingsDoc(user.uid);
        const { user_id: _uid, ...rest } = defaults;
        await saveSettings(rest);
      } catch {
        // Keep local reset
      }
    }
    toast.success(isAr ? "تمت استعادة الإعدادات الافتراضية." : "Preferences reset to defaults.");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <PageHeader
        title={isAr ? "الإعدادات وإمكانية الوصول" : "Settings & Accessibility"}
        subtitle={
          isAr
            ? "اللغة، المظهر، تفضيلات الوصول، وإدارة جلسة الضيف."
            : "Language, theme, accessibility controls, and guest session info."
        }
        actions={
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleResetPrefs}
            className="gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            <span>{isAr ? "استعادة الافتراضي" : "Reset Preferences"}</span>
          </Button>
        }
      />

      {/* 1. Language */}
      <SettingsSectionCard
        id="cat-language"
        title={isAr ? "اللغة" : "Language"}
        desc={
          isAr
            ? "بدّل فوراً بين الإنجليزية والعربية مع ضبط اتجاه الصفحة."
            : "Switch cleanly between English (LTR) and Arabic (RTL)."
        }
      >
        <SettingsRow
          label={isAr ? "لغة الواجهة" : "Interface Language"}
          desc={
            isAr ? "تُحفظ للجلسة الحالية وتطبّق على جميع الأقسام." : "Applied across all modules."
          }
        >
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={lang === "en" ? "default" : "outline"}
              onClick={() => handleLangChange("en")}
              className="gap-1.5"
            >
              <Globe className="size-3.5" />
              <span>English (LTR)</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant={lang === "ar" ? "default" : "outline"}
              onClick={() => handleLangChange("ar")}
              className="gap-1.5"
            >
              <Globe className="size-3.5" />
              <span>العربية (RTL)</span>
            </Button>
          </div>
        </SettingsRow>
      </SettingsSectionCard>

      {/* 2. Theme */}
      <SettingsSectionCard
        id="cat-theme"
        title={isAr ? "المظهر" : "Theme"}
        desc={isAr ? "اختر بين الوضع الفاتح والداكن." : "Choose between Light and Dark mode."}
      >
        <SettingsRow label={isAr ? "وضع الألوان" : "Color Mode"}>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={resolvedTheme === "light" ? "default" : "outline"}
              onClick={() => void applyColorMode("light")}
              className="gap-1.5"
            >
              <Sun className="size-3.5" />
              <span>{t("theme.light")}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant={resolvedTheme === "dark" ? "default" : "outline"}
              onClick={() => void applyColorMode("dark")}
              className="gap-1.5"
            >
              <Moon className="size-3.5" />
              <span>{t("theme.dark")}</span>
            </Button>
          </div>
        </SettingsRow>
      </SettingsSectionCard>

      {/* 3. Accessibility */}
      <SettingsSectionCard
        id="cat-accessibility"
        title={isAr ? "إمكانية الوصول" : "Accessibility"}
        desc={
          isAr
            ? "تخصيص حجم الخط، التباين العالي، خط عسر القراءة، والقراءة الصوتية."
            : "Adjust font scale, contrast, dyslexia-friendly typography, motion, and read-aloud."
        }
        badge={<Accessibility className="size-4 text-primary" />}
      >
        <SettingsRow
          label={isAr ? "حجم الخط" : "Font Scale"}
          desc={`${a11y.fontScale.toFixed(2)}x`}
        >
          <input
            type="range"
            min={0.9}
            max={1.5}
            step={0.05}
            value={a11y.fontScale}
            aria-label={isAr ? "حجم الخط" : "Font Scale"}
            onChange={(e) => {
              const val = clampFontScale(Number(e.target.value));
              saveA11y({ fontScale: val }, { font_scale: val });
            }}
            className="w-44 accent-primary"
          />
        </SettingsRow>

        <SettingsRow
          id="a11y-dyslexia"
          label={isAr ? "خط مريح لعسر القراءة" : "Dyslexia-Friendly Font"}
        >
          <Switch
            id="a11y-dyslexia"
            checked={a11y.dyslexia}
            onCheckedChange={(v) => saveA11y({ dyslexia: v }, { dyslexia_font: v })}
          />
        </SettingsRow>

        <SettingsRow id="a11y-contrast" label={isAr ? "وضع التباين العالي" : "High Contrast"}>
          <Switch
            id="a11y-contrast"
            checked={a11y.contrast}
            onCheckedChange={(v) => saveA11y({ contrast: v }, { high_contrast: v })}
          />
        </SettingsRow>

        <SettingsRow id="a11y-motion" label={isAr ? "تقليل الحركة والانتقالات" : "Reduce Motion"}>
          <Switch
            id="a11y-motion"
            checked={a11y.reduceMotion}
            onCheckedChange={(v) => saveA11y({ reduceMotion: v }, { reduced_motion: v })}
          />
        </SettingsRow>

        <SettingsRow
          id="a11y-focus"
          label={isAr ? "إبراز إطار التركيز" : "Strong Keyboard Focus Ring"}
        >
          <Switch
            id="a11y-focus"
            checked={a11y.focusRing}
            onCheckedChange={(v) => saveA11y({ focusRing: v }, { focus_ring: v })}
          />
        </SettingsRow>

        <SettingsRow
          id="a11y-readaloud"
          label={isAr ? "القراءة الصوتية للصفحات" : "Read Aloud Support"}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Switch
              id="a11y-readaloud"
              checked={a11y.readAloud}
              onCheckedChange={(v) => saveA11y({ readAloud: v }, { read_aloud: v })}
            />
            {a11y.readAloud && (
              <input
                type="range"
                min={0.75}
                max={1.4}
                step={0.05}
                value={a11y.readAloudRate}
                aria-label={isAr ? "سرعة القراءة" : "Read-aloud speed"}
                onChange={(e) => {
                  const rate = clampSpeechRate(Number(e.target.value));
                  saveA11y({ readAloudRate: rate }, { read_aloud_rate: rate });
                }}
                className="w-28 accent-primary"
              />
            )}
          </div>
        </SettingsRow>
      </SettingsSectionCard>

      {/* 4. Guest Session & Data */}
      <AccountProfileSection profile={profile} />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <User className="size-3.5 text-primary" />
        <span>
          {BRAND.name} — {BRAND.fullName}
        </span>
      </div>
    </div>
  );
}
