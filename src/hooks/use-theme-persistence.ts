import { useCallback } from "react";
import { toast } from "sonner";
import {
  CloudSettingsFallbackError,
  OfflineSettingsError,
  useSaveSettings,
} from "@/hooks/use-settings";
import type { UserSettingsRow } from "@/lib/firestore-data";
import { trackHubEvent } from "@/lib/analytics";
import { reportAppError } from "@/lib/error-handler";
import { useOptionalPrefs } from "@/lib/preferences";
import {
  buildInterfaceThemePatch,
  normalizeThemeMode,
  type AppearancePrefs,
  type InterfaceTheme,
  type LayoutPrefs,
  type ThemeMode,
} from "@/lib/settings";
import { getLayoutModeById, type LayoutMode, type ThemeCatalogPreset } from "@/lib/theme-catalog";

type SettingsPatch = Partial<Omit<UserSettingsRow, "user_id" | "theme">> & { theme?: string };

/**
 * Global monotonic counter across all theme/layout switcher UIs so an older
 * async Firestore save or failure NEVER rolls back or overwrites a newer user choice.
 */
let globalThemeMutationSeq = 0;

export function nextThemeMutationSeq(): number {
  globalThemeMutationSeq += 1;
  return globalThemeMutationSeq;
}

export function getCurrentThemeMutationSeq(): number {
  return globalThemeMutationSeq;
}

export function resetThemeMutationSeqForTests(): void {
  globalThemeMutationSeq = 0;
}

export interface PersistThemeOptions {
  /** Override mode when applying a preset, otherwise uses preset.recommendedMode */
  modeOverride?: ThemeMode;
  silent?: boolean;
  /** Optional custom toast label */
  label?: string;
}

export function useThemePersistence() {
  const prefs = useOptionalPrefs();
  const saveSettings = useSaveSettings();
  const isAr = prefs?.lang === "ar";

  const persistPatch = useCallback(
    async (
      dbPatch: SettingsPatch,
      rollback: () => void,
      options?: {
        toastId?: string;
        successEn?: string;
        successAr?: string;
        offlineEn?: string;
        offlineAr?: string;
        silent?: boolean;
      },
    ): Promise<"saved" | "offline" | "superseded" | "error"> => {
      const seq = nextThemeMutationSeq();
      try {
        await saveSettings(dbPatch);
        if (seq !== globalThemeMutationSeq) {
          return "superseded";
        }
        if (!options?.silent && (options?.successEn || options?.successAr)) {
          toast.success(
            isAr
              ? (options.successAr ?? options.successEn)
              : (options.successEn ?? options.successAr),
            options.toastId ? { id: options.toastId } : undefined,
          );
        }
        return "saved";
      } catch (err) {
        if (seq !== globalThemeMutationSeq) {
          return "superseded";
        }
        if (err instanceof OfflineSettingsError || err instanceof CloudSettingsFallbackError) {
          if (!options?.silent) {
            toast.info(
              isAr
                ? (options?.offlineAr ??
                    "تم الحفظ محلياً على هذا الجهاز؛ وستتم المزامنة عند عودة الاتصال")
                : (options?.offlineEn ?? "Saved on this device; will sync when back online"),
              { id: options?.toastId ?? "theme-offline-save" },
            );
          }
          return "offline";
        }
        const normalized = reportAppError(
          err,
          "theme-persistence",
          "Saved on this device, but cloud sync had an issue. We'll keep your look active.",
          "تم حفظ المظهر على هذا الجهاز، لكن تعذرت المزامنة مع حسابك مؤقتاً.",
        );
        // Only rollback if auth/permission hard-rejected AND no newer mutation happened,
        // otherwise preserve the usable local preference and inform clearly.
        if (normalized.category === "network") {
          if (!options?.silent) {
            toast.info(isAr ? normalized.messageAr : normalized.messageEn, {
              id: options?.toastId ?? "theme-sync-warn",
            });
          }
          return "offline";
        }
        // Keep local preference active if already applied to localStorage, only warn transparently
        void rollback;
        if (!options?.silent) {
          toast.warning(isAr ? normalized.messageAr : normalized.messageEn, {
            id: options?.toastId ?? "theme-sync-warn",
          });
        }
        return "error";
      }
    },
    [saveSettings, isAr],
  );

  const applyPreset = useCallback(
    async (preset: ThemeCatalogPreset, options?: PersistThemeOptions) => {
      if (!prefs) return "error" as const;
      const prevTheme = prefs.theme;
      const prevAppearance = prefs.appearance;
      const prevPresetId = prefs.themePresetId;
      const prevLayoutMode = prefs.layoutMode;
      const prevLayout = prefs.layout;

      const rawTargetMode = normalizeThemeMode(options?.modeOverride ?? preset.recommendedMode);
      const targetMode: "dark" | "light" =
        rawTargetMode === "dark" || rawTargetMode === "light"
          ? rawTargetMode
          : preset.recommendedMode;
      const effectivePreset: ThemeCatalogPreset =
        targetMode === preset.recommendedMode ? preset : { ...preset, recommendedMode: targetMode };
      const layoutSpec = getLayoutModeById(effectivePreset.layoutMode);

      prefs.cancelPreview();
      prefs.applyThemePreset(effectivePreset);
      void trackHubEvent("ui_theme_changed", {
        ui_theme: preset.baseUiTheme,
        preset_id: preset.id,
        layout_mode: layoutSpec.id,
        mode: targetMode,
      });

      const label = options?.label ?? (isAr ? preset.nameAr : preset.nameEn);
      return persistPatch(
        {
          theme_preset_id: preset.id,
          theme: targetMode,
          ui_theme: preset.baseUiTheme,
          layout_mode: layoutSpec.id,
          sidebar_mode: layoutSpec.sidebarMode,
          accent_color: "custom",
          custom_accent_hex: preset.accentHex,
          card_style: preset.cardStyle,
          border_style: preset.borderStyle,
          shadow_level: preset.shadowLevel,
          corner_style: preset.cornerStyle,
          bg_style: preset.bgStyle,
          font_family: preset.fontFamily,
        },
        () => {
          prefs.setTheme(prevTheme);
          prefs.setAppearance(prevAppearance);
          prefs.setThemePresetId(prevPresetId);
          prefs.setLayoutMode(prevLayoutMode);
          prefs.setLayout(prevLayout);
        },
        {
          toastId: "theme-preset-apply",
          ...(options?.silent !== undefined ? { silent: options.silent } : {}),
          successEn: `Applied & synced ${label}`,
          successAr: `تم تطبيق ومزامنة ثيم ${label}`,
          offlineEn: `Applied ${label} locally on this device`,
          offlineAr: `تم تطبيق ثيم ${label} محلياً على هذا الجهاز`,
        },
      );
    },
    [prefs, persistPatch, isAr],
  );

  const applyUiTheme = useCallback(
    async (themeId: InterfaceTheme, options?: { silent?: boolean; label?: string }) => {
      if (!prefs) return "error" as const;
      const prevAppearance = prefs.appearance;
      const prevPresetId = prefs.themePresetId;
      const patch = buildInterfaceThemePatch(themeId);

      prefs.cancelPreview();
      prefs.setThemePresetId(null);
      prefs.setAppearance(patch);
      void trackHubEvent("ui_theme_changed", { ui_theme: themeId, source: "theme_selector" });

      return persistPatch(
        {
          ui_theme: patch.uiTheme,
          accent_color: patch.accent,
          corner_style: patch.cornerStyle,
          card_style: patch.cardStyle,
          border_style: patch.borderStyle,
          shadow_level: patch.shadowLevel,
          animation_level: patch.animationLevel,
          bg_style: patch.bgStyle,
          reading_layout: patch.readingLayout,
          theme_preset_id: null,
        },
        () => {
          prefs.setThemePresetId(prevPresetId);
          prefs.setAppearance(prevAppearance);
        },
        {
          toastId: "ui-theme-apply",
          ...(options?.silent !== undefined ? { silent: options.silent } : {}),
          successEn: options?.label ? `Applied ${options.label}` : "Theme updated & synced",
          successAr: options?.label ? `تم تطبيق ${options.label}` : "تم تحديث ومزامنة الثيم",
        },
      );
    },
    [prefs, persistPatch],
  );

  const applyColorMode = useCallback(
    async (mode: ThemeMode, options?: { silent?: boolean }) => {
      if (!prefs) return "error" as const;
      const prevMode = prefs.theme;
      prefs.setTheme(mode);
      void trackHubEvent("ui_color_mode_changed", { mode });

      return persistPatch({ theme: mode }, () => prefs.setTheme(prevMode), {
        toastId: "color-mode-apply",
        ...(options?.silent !== undefined ? { silent: options.silent } : {}),
        successEn:
          mode === "dark"
            ? "Dark mode saved"
            : mode === "light"
              ? "Light mode saved"
              : "System mode saved",
        successAr:
          mode === "dark"
            ? "تم حفظ الوضع الداكن"
            : mode === "light"
              ? "تم حفظ الوضع الفاتح"
              : "تم حفظ وضع النظام",
      });
    },
    [prefs, persistPatch],
  );

  const applyAppearancePatch = useCallback(
    async (
      appPatch: Partial<AppearancePrefs>,
      dbPatch: SettingsPatch,
      options?: { silent?: boolean; toastId?: string },
    ) => {
      if (!prefs) return "error" as const;
      const prevApp = prefs.appearance;
      prefs.setAppearance(appPatch);
      return persistPatch(dbPatch, () => prefs.setAppearance(prevApp), {
        toastId: options?.toastId ?? "appearance-patch",
        ...(options?.silent !== undefined ? { silent: options.silent } : {}),
      });
    },
    [prefs, persistPatch],
  );

  const applyLayoutMode = useCallback(
    async (modeId: LayoutMode, options?: { silent?: boolean }) => {
      if (!prefs) return "error" as const;
      const spec = getLayoutModeById(modeId);
      const prevMode = prefs.layoutMode;
      const prevLayout = prefs.layout;

      prefs.cancelPreview();
      prefs.setLayoutMode(modeId);
      const layoutPatch: Partial<LayoutPrefs> = {
        sidebarMode: spec.sidebarMode,
        ...(spec.recommendedDensity ? {} : {}),
      };
      prefs.setLayout(layoutPatch);
      void trackHubEvent("ui_layout_changed", { layout_mode: modeId });

      const label = isAr ? spec.nameAr : spec.nameEn;
      return persistPatch(
        {
          layout_mode: modeId,
          sidebar_mode: spec.sidebarMode,
        },
        () => {
          prefs.setLayoutMode(prevMode);
          prefs.setLayout(prevLayout);
        },
        {
          toastId: "layout-mode-apply",
          ...(options?.silent !== undefined ? { silent: options.silent } : {}),
          successEn: `Layout switched to ${label}`,
          successAr: `تم التبديل إلى تخطيط ${label}`,
          offlineEn: `Layout ${label} saved on this device`,
          offlineAr: `تم حفظ تخطيط ${label} محلياً على هذا الجهاز`,
        },
      );
    },
    [prefs, persistPatch, isAr],
  );

  return {
    applyPreset,
    applyUiTheme,
    applyColorMode,
    applyAppearancePatch,
    applyLayoutMode,
    persistPatch,
  };
}
