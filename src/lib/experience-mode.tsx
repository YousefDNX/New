import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { useOptionalPrefs, usePrefs } from "./preferences";
import {
  getParadigmForExperience,
  getUiExperienceById,
  type ExperienceParadigm,
  type ThemeUxPreset,
  type UiExperienceId,
  type UiExperienceSpec,
} from "./ui-experiences";

const STORAGE_SIDEBAR_COLLAPSED = "nexora.cmdSidebarCollapsed";
const STORAGE_UX_PRESET = "nexora.uxPreset";

export interface SpatialDrawerState {
  open: boolean;
  title: string;
  subtitle?: string | undefined;
  meta?: string | undefined;
  body?: ReactNode | undefined;
}

export interface ExperienceModeContextValue {
  mode: UiExperienceId;
  spec: UiExperienceSpec;
  paradigm: ExperienceParadigm;
  setMode: (next: UiExperienceId) => void;
  activeUxPresetId: string | null;
  applyThemeUxPreset: (preset: ThemeUxPreset) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  radialMenuOpen: boolean;
  setRadialMenuOpen: (open: boolean) => void;
  toggleRadialMenu: () => void;
  spatialDrawer: SpatialDrawerState;
  openSpatialDrawer: (payload: Omit<SpatialDrawerState, "open">) => void;
  closeSpatialDrawer: () => void;
  selectedRecordId: string | null;
  setSelectedRecordId: (id: string | null) => void;
}

const ExperienceModeContext = createContext<ExperienceModeContextValue | null>(null);

export function ExperienceModeProvider({ children }: { children: ReactNode }) {
  const {
    effectiveUiExperience,
    setUiExperience,
    setTheme,
    setAppearance,
    setThemePresetId,
    setLayoutMode,
    cancelPreview,
  } = usePrefs();

  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(STORAGE_SIDEBAR_COLLAPSED) === "1";
    } catch {
      return false;
    }
  });

  const [activeUxPresetId, setActiveUxPresetId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(STORAGE_UX_PRESET);
    } catch {
      return null;
    }
  });

  const [radialMenuOpen, setRadialMenuOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [spatialDrawer, setSpatialDrawer] = useState<SpatialDrawerState>({
    open: false,
    title: "",
  });

  const mode = effectiveUiExperience;
  const spec = getUiExperienceById(mode);
  const paradigm = getParadigmForExperience(mode);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    try {
      localStorage.setItem(STORAGE_SIDEBAR_COLLAPSED, collapsed ? "1" : "0");
    } catch {
      // Ignore storage quota restrictions
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsedState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_SIDEBAR_COLLAPSED, next ? "1" : "0");
      } catch {
        // Ignore storage quota restrictions
      }
      return next;
    });
  }, []);

  const setMode = useCallback(
    (next: UiExperienceId) => {
      cancelPreview();
      setRadialMenuOpen(false);
      setUiExperience(next);
      setActiveUxPresetId(null);
      try {
        localStorage.removeItem(STORAGE_UX_PRESET);
      } catch {
        // Ignore
      }
    },
    [cancelPreview, setUiExperience],
  );

  const applyThemeUxPreset = useCallback(
    (preset: ThemeUxPreset) => {
      cancelPreview();
      setRadialMenuOpen(false);
      setUiExperience(preset.experienceId);
      setLayoutMode(getUiExperienceById(preset.experienceId).pairedLayoutMode);
      setTheme(preset.colorMode);
      setThemePresetId(preset.themePresetId);
      setAppearance({
        ...preset.appearancePatch,
        accent: preset.accent,
        ...(preset.customAccentHex ? { customAccentHex: preset.customAccentHex } : {}),
      });
      setActiveUxPresetId(preset.id);
      try {
        localStorage.setItem(STORAGE_UX_PRESET, preset.id);
      } catch {
        // Ignore
      }
    },
    [cancelPreview, setUiExperience, setLayoutMode, setTheme, setThemePresetId, setAppearance],
  );

  const toggleRadialMenu = useCallback(() => {
    setRadialMenuOpen((prev) => !prev);
  }, []);

  const openSpatialDrawer = useCallback((payload: Omit<SpatialDrawerState, "open">) => {
    setSpatialDrawer({ ...payload, open: true });
  }, []);

  const closeSpatialDrawer = useCallback(() => {
    setSpatialDrawer((prev) => ({ ...prev, open: false }));
  }, []);

  // Close drawer / radial menu cleanly on Escape
  useEffect(() => {
    if (!spatialDrawer.open && !radialMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setRadialMenuOpen(false);
        setSpatialDrawer((prev) => ({ ...prev, open: false }));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [spatialDrawer.open, radialMenuOpen]);

  // Keep DOM attribute synced with architectural paradigm
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset["uxParadigm"] = paradigm;
  }, [paradigm]);

  return (
    <ExperienceModeContext.Provider
      value={{
        mode,
        spec,
        paradigm,
        setMode,
        activeUxPresetId,
        applyThemeUxPreset,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        radialMenuOpen,
        setRadialMenuOpen,
        toggleRadialMenu,
        spatialDrawer,
        openSpatialDrawer,
        closeSpatialDrawer,
        selectedRecordId,
        setSelectedRecordId,
      }}
    >
      {children}

      {/* Global Slide-Over Drawer for Spatial Mode / Inspector Previews */}
      {spatialDrawer.open && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={spatialDrawer.title}
          data-testid="spatial-slide-over-drawer"
          onClick={closeSpatialDrawer}
        >
          <aside
            className="flex h-full w-full max-w-lg flex-col border-s border-border bg-background p-6 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div className="min-w-0">
                {spatialDrawer.meta && (
                  <p className="text-xs font-medium text-primary">{spatialDrawer.meta}</p>
                )}
                <h2 className="mt-0.5 font-display text-xl font-bold text-foreground">
                  {spatialDrawer.title}
                </h2>
                {spatialDrawer.subtitle && (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {spatialDrawer.subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeSpatialDrawer}
                data-testid="close-spatial-drawer"
                aria-label="Close drawer"
                className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 flex-1">{spatialDrawer.body}</div>
          </aside>
        </div>
      )}
    </ExperienceModeContext.Provider>
  );
}

/**
 * Primary hook to read and mutate the global UI/UX Architecture Mode.
 * Falls back safely to PreferencesContext if used in isolated unit test trees.
 */
export function useExperienceMode(): ExperienceModeContextValue {
  const ctx = useContext(ExperienceModeContext);
  const prefs = useOptionalPrefs();
  const [fallbackCollapsed, setFallbackCollapsed] = useState(false);
  const [fallbackRadial, setFallbackRadial] = useState(false);
  const [fallbackSelected, setFallbackSelected] = useState<string | null>(null);
  const [fallbackDrawer, setFallbackDrawer] = useState<SpatialDrawerState>({
    open: false,
    title: "",
  });

  if (ctx) return ctx;

  const mode = prefs?.effectiveUiExperience ?? "classic";
  const spec = getUiExperienceById(mode);
  const paradigm = getParadigmForExperience(mode);

  return {
    mode,
    spec,
    paradigm,
    setMode: (next) => prefs?.setUiExperience(next),
    activeUxPresetId: null,
    applyThemeUxPreset: (preset) => {
      prefs?.setUiExperience(preset.experienceId);
      prefs?.setTheme(preset.colorMode);
      prefs?.setThemePresetId(preset.themePresetId);
    },
    sidebarCollapsed: fallbackCollapsed,
    setSidebarCollapsed: setFallbackCollapsed,
    toggleSidebar: () => setFallbackCollapsed((v) => !v),
    radialMenuOpen: fallbackRadial,
    setRadialMenuOpen: setFallbackRadial,
    toggleRadialMenu: () => setFallbackRadial((v) => !v),
    spatialDrawer: fallbackDrawer,
    openSpatialDrawer: (payload) => setFallbackDrawer({ ...payload, open: true }),
    closeSpatialDrawer: () => setFallbackDrawer((prev) => ({ ...prev, open: false })),
    selectedRecordId: fallbackSelected,
    setSelectedRecordId: setFallbackSelected,
  };
}
