import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useOptionalPrefs } from "@/lib/preferences";
import {
  INTERFACE_THEMES,
  type BgStylePref,
  type InterfaceTheme,
  type ShadowLevelPref,
  type Theme,
  type ThemeMode,
} from "@/lib/settings";

import { ThemeContext, useTheme, useThemeContext, type ThemeContextValue } from "./ThemeContext";
import {
  THEME_CATALOG,
  getThemePresetById,
  normalizeThemePresetId,
  type ThemeCatalogPreset,
} from "@/lib/theme-catalog";

export type { BgStylePref, InterfaceTheme, ShadowLevelPref, Theme, ThemeMode };
export type { ThemeContextValue };
export { ThemeContext, useTheme, useThemeContext };

const STORAGE_UI_THEME_KEY = "nexora-ui-theme";
const STORAGE_BG_STYLE_KEY = "nexora-bg-style";
const STORAGE_SHADOW_LEVEL_KEY = "nexora-shadow-level";
const STORAGE_COLOR_MODE_KEY = "nexora-theme-mode";
const STORAGE_THEME_PRESET_KEY = "themePreset";

const VALID_UI_THEMES: readonly InterfaceTheme[] = INTERFACE_THEMES;

const VALID_BG_STYLES: readonly BgStylePref[] = ["ambient", "solid", "grid"] as const;
const VALID_SHADOW_LEVELS: readonly ShadowLevelPref[] = ["none", "soft", "rich"] as const;

export function isValidUiTheme(v: unknown): v is InterfaceTheme {
  return typeof v === "string" && (VALID_UI_THEMES as readonly string[]).includes(v);
}

export function isValidBgStyle(v: unknown): v is BgStylePref {
  return typeof v === "string" && (VALID_BG_STYLES as readonly string[]).includes(v);
}

export function isValidShadowLevel(v: unknown): v is ShadowLevelPref {
  return typeof v === "string" && (VALID_SHADOW_LEVELS as readonly string[]).includes(v);
}

function readStoredAppearance<T extends string>(
  storageKey: string,
  prefsField: "uiTheme" | "bgStyle" | "shadowLevel",
  validator: (v: unknown) => v is T,
  fallback: T,
): T {
  if (typeof window === "undefined") return fallback;
  try {
    const direct = localStorage.getItem(storageKey);
    if (validator(direct)) return direct;
    const prefsRaw = localStorage.getItem("nexora.prefs");
    if (prefsRaw) {
      const parsed = JSON.parse(prefsRaw);
      const val = parsed?.appearance?.[prefsField];
      if (validator(val)) return val;
    }
  } catch {
    // ignore storage read errors
  }
  return fallback;
}

export function ThemeProvider({
  children,
  defaultUiTheme = "classic",
  defaultBgStyle = "ambient",
  defaultShadowLevel = "soft",
  defaultMode = "dark",
}: {
  children: ReactNode;
  defaultUiTheme?: InterfaceTheme;
  defaultBgStyle?: BgStylePref;
  defaultShadowLevel?: ShadowLevelPref;
  defaultMode?: ThemeMode;
}) {
  const prefs = useOptionalPrefs();

  const [localUiTheme, setLocalUiTheme] = useState<InterfaceTheme>(defaultUiTheme);
  const [localBgStyle, setLocalBgStyle] = useState<BgStylePref>(defaultBgStyle);
  const [localShadowLevel, setLocalShadowLevel] = useState<ShadowLevelPref>(defaultShadowLevel);
  const [localMode, setLocalMode] = useState<ThemeMode>(defaultMode);
  const [localPresetId, setLocalPresetId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [systemTheme, setSystemTheme] = useState<Theme>("dark");

  useEffect(() => {
    setLocalUiTheme(
      readStoredAppearance(STORAGE_UI_THEME_KEY, "uiTheme", isValidUiTheme, defaultUiTheme),
    );
    setLocalBgStyle(
      readStoredAppearance(STORAGE_BG_STYLE_KEY, "bgStyle", isValidBgStyle, defaultBgStyle),
    );
    setLocalShadowLevel(
      readStoredAppearance(
        STORAGE_SHADOW_LEVEL_KEY,
        "shadowLevel",
        isValidShadowLevel,
        defaultShadowLevel,
      ),
    );
    try {
      const storedPreset =
        localStorage.getItem(STORAGE_THEME_PRESET_KEY) ||
        localStorage.getItem("theme-preset") ||
        localStorage.getItem("nexora.theme_preset_id");
      const normalized = normalizeThemePresetId(storedPreset);
      if (normalized) {
        setLocalPresetId(normalized);
      }
    } catch {
      // ignore storage read errors
    }
    try {
      const stored = localStorage.getItem(STORAGE_COLOR_MODE_KEY);
      if (stored === "dark" || stored === "light" || stored === "system") {
        setLocalMode(stored);
      } else {
        const prefsRaw = localStorage.getItem("nexora.prefs");
        if (prefsRaw) {
          const parsed = JSON.parse(prefsRaw);
          if (parsed?.theme === "dark" || parsed?.theme === "light" || parsed?.theme === "system") {
            setLocalMode(parsed.theme);
          }
        }
      }
    } catch {
      // ignore storage read errors
    }
    setHydrated(true);
  }, [defaultUiTheme, defaultBgStyle, defaultShadowLevel]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return undefined;
    setSystemTheme(mq.matches ? "dark" : "light");
    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? "dark" : "light");
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // When PreferencesProvider is mounted above us, mirror its effective preferences seamlessly
  const uiTheme: InterfaceTheme = prefs ? prefs.effectiveAppearance.uiTheme : localUiTheme;
  const bgStyle: BgStylePref = prefs
    ? prefs.effectiveAppearance.reduceVisualEffects
      ? "solid"
      : prefs.effectiveAppearance.bgStyle
    : localBgStyle;
  const shadowLevel: ShadowLevelPref = prefs
    ? prefs.effectiveAppearance.shadowLevel
    : localShadowLevel;
  const mode: ThemeMode = prefs ? prefs.effectiveTheme : localMode;
  const resolvedMode: Theme = prefs
    ? prefs.effectiveResolvedTheme
    : mode === "system"
      ? systemTheme
      : mode;
  const themePresetId: string | null =
    prefs?.themePresetId !== undefined ? prefs.themePresetId : localPresetId;

  // Apply data-ui-theme, data-bg-style, data-shadow-level, data-theme-preset, data-theme, and class to documentElement
  useEffect(() => {
    if (!hydrated || typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-ui-theme", uiTheme);
    root.dataset["uiTheme"] = uiTheme;

    root.setAttribute("data-bg-style", bgStyle);
    root.dataset["bgStyle"] = bgStyle;

    root.setAttribute("data-shadow-level", shadowLevel);
    root.dataset["shadowLevel"] = shadowLevel;

    if (themePresetId) {
      root.setAttribute("data-theme-preset", themePresetId);
      root.dataset["themePreset"] = themePresetId;
    } else {
      root.removeAttribute("data-theme-preset");
      delete root.dataset["themePreset"];
    }

    root.classList.remove("light", "dark");
    root.classList.add(resolvedMode);
    root.setAttribute("data-theme", resolvedMode);

    // Toggle theme CSS classes (e.g. theme-aurora-glass, theme-creative-neon)
    const allThemeClasses = [
      "theme-classic",
      "theme-aurora-glass",
      "theme-aurora",
      "theme-minimal",
      "theme-soft-modern",
      "theme-creative-neon",
      "theme-focus",
      "theme-creative",
      "theme-nordic-frost",
      "theme-sepia-study",
      "theme-cyber-matrix",
      "theme-midnight-purple",
    ];
    root.classList.remove(...allThemeClasses);
    const activeClass = `theme-${uiTheme.replace(/_/g, "-")}`;
    root.classList.add(activeClass);

    try {
      localStorage.setItem(STORAGE_UI_THEME_KEY, uiTheme);
      localStorage.setItem(STORAGE_BG_STYLE_KEY, bgStyle);
      localStorage.setItem(STORAGE_SHADOW_LEVEL_KEY, shadowLevel);
      localStorage.setItem(STORAGE_COLOR_MODE_KEY, mode);
      if (themePresetId) {
        localStorage.setItem(STORAGE_THEME_PRESET_KEY, themePresetId);
        localStorage.setItem("theme-preset", themePresetId);
        localStorage.setItem("nexora.theme_preset_id", themePresetId);
      } else {
        localStorage.removeItem(STORAGE_THEME_PRESET_KEY);
        localStorage.removeItem("theme-preset");
        localStorage.removeItem("nexora.theme_preset_id");
      }
    } catch {
      // ignore storage quota errors
    }
  }, [hydrated, uiTheme, bgStyle, shadowLevel, mode, resolvedMode, themePresetId]);

  const setUiTheme = useCallback(
    (nextTheme: InterfaceTheme) => {
      const safe = isValidUiTheme(nextTheme) ? nextTheme : "classic";
      setLocalUiTheme(safe);
      prefs?.setAppearance({ uiTheme: safe });
    },
    [prefs],
  );

  const setBgStyle = useCallback(
    (nextBg: BgStylePref) => {
      const safe = isValidBgStyle(nextBg) ? nextBg : "ambient";
      setLocalBgStyle(safe);
      prefs?.setAppearance({ bgStyle: safe });
    },
    [prefs],
  );

  const setShadowLevel = useCallback(
    (nextShadow: ShadowLevelPref) => {
      const safe = isValidShadowLevel(nextShadow) ? nextShadow : "soft";
      setLocalShadowLevel(safe);
      prefs?.setAppearance({ shadowLevel: safe });
    },
    [prefs],
  );

  const setMode = useCallback(
    (nextMode: ThemeMode) => {
      setLocalMode(nextMode);
      prefs?.setTheme(nextMode);
    },
    [prefs],
  );

  const setThemePresetId = useCallback(
    (nextPresetId: string | null) => {
      setLocalPresetId(nextPresetId);
      prefs?.setThemePresetId(nextPresetId);
      if (nextPresetId) {
        try {
          localStorage.setItem(STORAGE_THEME_PRESET_KEY, nextPresetId);
          localStorage.setItem("theme-preset", nextPresetId);
          localStorage.setItem("nexora.theme_preset_id", nextPresetId);
        } catch {
          // ignore storage write errors
        }
      } else {
        try {
          localStorage.removeItem(STORAGE_THEME_PRESET_KEY);
          localStorage.removeItem("theme-preset");
          localStorage.removeItem("nexora.theme_preset_id");
        } catch {
          // ignore storage write errors
        }
      }
    },
    [prefs],
  );

  const applyThemePreset = useCallback(
    (presetOrId: ThemeCatalogPreset | string) => {
      const target =
        typeof presetOrId === "string"
          ? getThemePresetById(presetOrId)
          : (getThemePresetById(presetOrId.id) ?? presetOrId);
      if (!target) return;
      setLocalPresetId(target.id);
      setLocalUiTheme(target.baseUiTheme);
      setLocalBgStyle(target.bgStyle);
      setLocalShadowLevel(target.shadowLevel);
      setLocalMode(target.recommendedMode);
      try {
        localStorage.setItem(STORAGE_THEME_PRESET_KEY, target.id);
        localStorage.setItem("theme-preset", target.id);
        localStorage.setItem("nexora.theme_preset_id", target.id);
        localStorage.setItem(STORAGE_UI_THEME_KEY, target.baseUiTheme);
        localStorage.setItem(STORAGE_BG_STYLE_KEY, target.bgStyle);
        localStorage.setItem(STORAGE_SHADOW_LEVEL_KEY, target.shadowLevel);
        localStorage.setItem(STORAGE_COLOR_MODE_KEY, target.recommendedMode);
      } catch {
        // ignore storage write errors
      }
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        root.setAttribute("data-theme-preset", target.id);
        root.dataset["themePreset"] = target.id;
        root.setAttribute("data-ui-theme", target.baseUiTheme);
        root.dataset["uiTheme"] = target.baseUiTheme;
        root.setAttribute("data-bg-style", target.bgStyle);
        root.dataset["bgStyle"] = target.bgStyle;
        root.setAttribute("data-shadow-level", target.shadowLevel);
        root.dataset["shadowLevel"] = target.shadowLevel;
        root.classList.remove("light", "dark");
        root.classList.add(target.recommendedMode);
        root.setAttribute("data-theme", target.recommendedMode);
      }
      if (prefs) {
        prefs.applyThemePreset(target);
      }
    },
    [prefs],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      uiTheme,
      setUiTheme,
      bgStyle,
      setBgStyle,
      shadowLevel,
      setShadowLevel,
      mode,
      resolvedMode,
      setMode,
      themePresetId,
      setThemePresetId,
      themePresets: THEME_CATALOG,
      applyThemePreset,
    }),
    [
      uiTheme,
      setUiTheme,
      bgStyle,
      setBgStyle,
      shadowLevel,
      setShadowLevel,
      mode,
      resolvedMode,
      setMode,
      themePresetId,
      setThemePresetId,
      applyThemePreset,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
