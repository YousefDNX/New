import { createContext, useContext } from "react";
import type {
  BgStylePref,
  InterfaceTheme,
  ShadowLevelPref,
  Theme,
  ThemeMode,
} from "@/lib/settings";
import { THEME_CATALOG, type ThemeCatalogPreset } from "@/lib/theme-catalog";

export interface ThemeContextValue {
  uiTheme: InterfaceTheme;
  setUiTheme: (theme: InterfaceTheme) => void;
  bgStyle: BgStylePref;
  setBgStyle: (bgStyle: BgStylePref) => void;
  shadowLevel: ShadowLevelPref;
  setShadowLevel: (shadowLevel: ShadowLevelPref) => void;
  mode: ThemeMode;
  resolvedMode: Theme;
  setMode: (mode: ThemeMode) => void;
  themePresetId: string | null;
  setThemePresetId: (id: string | null) => void;
  themePresets: ThemeCatalogPreset[];
  applyThemePreset: (preset: ThemeCatalogPreset | string) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;

  if (typeof document !== "undefined") {
    const root = document.documentElement;
    const currentUi = (root.getAttribute("data-ui-theme") as InterfaceTheme) || "classic";
    const currentBg = (root.getAttribute("data-bg-style") as BgStylePref) || "ambient";
    const currentShadow = (root.getAttribute("data-shadow-level") as ShadowLevelPref) || "soft";
    const currentMode = (root.getAttribute("data-theme") as Theme) || "dark";
    const currentPreset = root.getAttribute("data-theme-preset") || null;
    return {
      uiTheme: currentUi,
      setUiTheme: () => {},
      bgStyle: currentBg,
      setBgStyle: () => {},
      shadowLevel: currentShadow,
      setShadowLevel: () => {},
      mode: currentMode,
      resolvedMode: currentMode,
      setMode: () => {},
      themePresetId: currentPreset,
      setThemePresetId: () => {},
      themePresets: THEME_CATALOG,
      applyThemePreset: () => {},
    };
  }

  return {
    uiTheme: "classic",
    setUiTheme: () => {},
    bgStyle: "ambient",
    setBgStyle: () => {},
    shadowLevel: "soft",
    setShadowLevel: () => {},
    mode: "dark",
    resolvedMode: "dark",
    setMode: () => {},
    themePresetId: null,
    setThemePresetId: () => {},
    themePresets: THEME_CATALOG,
    applyThemePreset: () => {},
  };
}

export const useThemeContext = useTheme;
