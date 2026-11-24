import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { PreferencesProvider, getPrefsStorageKey, usePrefs } from "@/lib/preferences";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { GrowthMap } from "@/components/growth/GrowthMap";
import { AppFooter } from "@/components/app/AppFooter";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { PWAInstallButton } from "@/components/pwa/PWAInstallButton";
import { resetPwaStateForTests, usePWA } from "@/lib/pwa";
import { THEME_CATALOG, findMatchingThemePreset, getThemePresetById } from "@/lib/theme-catalog";
import { dict, SUPPORTED_LANGS } from "@/lib/i18n-dict";
import { prompt3En, type Prompt3Key } from "@/lib/i18n/prompt3";
import { buildAccessibilityRecommendation } from "@/lib/accessibility-assistant";
import { USER_SETTINGS_ALLOWED_KEYS, sanitizeUserSettingsDoc } from "@/hooks/use-settings";

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({
      children,
      to,
      ...rest
    }: {
      children: ReactNode;
      to: string;
      [k: string]: unknown;
    }) => (
      <a href={to} {...rest}>
        {children}
      </a>
    ),
  };
});

vi.mock("@/hooks/use-rbac", () => ({
  useRbac: () => ({
    role: "student",
    isStaff: false,
    isSuperAdmin: false,
    canAccessAdmin: false,
  }),
}));

function TestShell({ children }: { children: ReactNode }) {
  return (
    <PreferencesProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </PreferencesProvider>
  );
}

function AccountIsolationHarness() {
  const { lang, setLang, appearance, setAppearance, syncPrefsForUser } = usePrefs();
  return (
    <div>
      <span data-testid="iso-lang">{lang}</span>
      <span data-testid="iso-theme">{appearance.uiTheme}</span>
      <button
        type="button"
        onClick={() => {
          setLang("ar");
          setAppearance({ uiTheme: "creative_neon" });
        }}
      >
        Set User A Prefs
      </button>
      <button type="button" onClick={() => syncPrefsForUser("user-a")}>
        Sign In A
      </button>
      <button type="button" onClick={() => syncPrefsForUser("user-b")}>
        Sign In B
      </button>
      <button type="button" onClick={() => syncPrefsForUser(null)}>
        Sign Out
      </button>
    </div>
  );
}

function RtlFooterHarness() {
  const { setLang, dir } = usePrefs();
  return (
    <div dir={dir} data-testid="rtl-wrapper">
      <button type="button" onClick={() => setLang("ar")}>
        Switch Arabic
      </button>
      <AppFooter />
    </div>
  );
}

describe("Prompt 3 Core Systems: Theme Switcher, Recharts GrowthMap, Settings Security, Isolation, RTL & PWA", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    resetPwaStateForTests();
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
    document.documentElement.dataset["uiTheme"] = "classic";
    document.documentElement.dir = "ltr";
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  });

  it("toggles data-ui-theme presets (aurora_glass, creative_neon, soft_modern) and color mode from sidebar switcher", async () => {
    render(
      <TestShell>
        <ThemeSwitcher variant="sidebar" persistToAccount={false} />
      </TestShell>,
    );

    expect(screen.getByTestId("sidebar-theme-switcher")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("sidebar-theme-opt-aurora_glass"));
    await waitFor(() => {
      expect(document.documentElement.dataset["uiTheme"]).toBe("aurora_glass");
    });

    fireEvent.click(screen.getByTestId("sidebar-theme-opt-creative_neon"));
    await waitFor(() => {
      expect(document.documentElement.dataset["uiTheme"]).toBe("creative_neon");
    });

    fireEvent.click(screen.getByTestId("sidebar-theme-opt-soft_modern"));
    await waitFor(() => {
      expect(document.documentElement.dataset["uiTheme"]).toBe("soft_modern");
    });

    fireEvent.click(screen.getByTestId("sidebar-color-mode-toggle"));
    await waitFor(() => {
      expect(document.documentElement.classList.contains("light")).toBe(true);
    });
  });

  it("renders Visual Growth Map with Recharts chart and interactive 6-domain constellation nodes", () => {
    render(
      <TestShell>
        <GrowthMap
          level={5}
          xp={2150}
          scores={{
            academic: 84,
            productivity: 72,
            growth: 66,
            wellbeing: 90,
            career: 58,
            community: 45,
          }}
          completedTasksByArea={{ academic: 6, productivity: 4 }}
          goals={[{ area: "career", status: "active" }]}
          events={[{ area: "academic", xp: 120 }]}
        />
      </TestShell>,
    );

    expect(screen.getByTestId("growth-map-visual")).toBeInTheDocument();
    expect(screen.getByTestId("growth-map-recharts")).toBeInTheDocument();
    expect(screen.getByTestId("growth-node-academic")).toBeInTheDocument();
    expect(screen.getByTestId("growth-node-wellbeing")).toBeInTheDocument();
    expect(screen.getByTestId("growth-node-career")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("growth-node-wellbeing"));
    expect(screen.getByTestId("growth-map-inspector")).toHaveTextContent("90%");
  });

  it("sanitizes user_settings documents against the exact Firestore rules whitelist", () => {
    const dirtyDoc = {
      theme: "light",
      ui_theme: "aurora_glass",
      avatar_style: "legacy-removed-field",
      experimental_extra: { bad: true },
      undefined_key: undefined,
    };
    const cleaned = sanitizeUserSettingsDoc(dirtyDoc, "student_123");

    expect(cleaned["user_id"]).toBe("student_123");
    expect(cleaned["theme"]).toBe("light");
    expect(cleaned["ui_theme"]).toBe("aurora_glass");
    expect(cleaned).not.toHaveProperty("avatar_style");
    expect(cleaned).not.toHaveProperty("experimental_extra");
    expect(cleaned).not.toHaveProperty("undefined_key");
    for (const key of Object.keys(cleaned)) {
      expect(USER_SETTINGS_ALLOWED_KEYS.has(key)).toBe(true);
    }
  });

  it("isolates preferences per account uid and clears state cleanly on sign-out", () => {
    render(
      <TestShell>
        <AccountIsolationHarness />
      </TestShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sign In A" }));
    fireEvent.click(screen.getByRole("button", { name: "Set User A Prefs" }));
    expect(screen.getByTestId("iso-lang")).toHaveTextContent("ar");
    expect(screen.getByTestId("iso-theme")).toHaveTextContent("creative_neon");
    expect(localStorage.getItem(getPrefsStorageKey("user-a"))).toContain("creative_neon");

    fireEvent.click(screen.getByRole("button", { name: "Sign In B" }));
    expect(screen.getByTestId("iso-lang")).toHaveTextContent("en");
    expect(screen.getByTestId("iso-theme")).toHaveTextContent("classic");

    fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));
    expect(screen.getByTestId("iso-lang")).toHaveTextContent("en");

    fireEvent.click(screen.getByRole("button", { name: "Sign In A" }));
    expect(screen.getByTestId("iso-lang")).toHaveTextContent("ar");
    expect(screen.getByTestId("iso-theme")).toHaveTextContent("creative_neon");
  });

  it("renders OfflineIndicator when offline and triggers PWA install prompt on beforeinstallprompt", async () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });

    render(
      <TestShell>
        <OfflineIndicator />
        <PWAInstallButton />
      </TestShell>,
    );

    expect(screen.getByTestId("offline-status-banner")).toBeInTheDocument();

    const promptMock = vi.fn(async () => undefined);
    const installEvent = new Event("beforeinstallprompt") as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
      platforms: string[];
    };
    installEvent.prompt = promptMock;
    installEvent.userChoice = Promise.resolve({ outcome: "accepted", platform: "web" });
    installEvent.platforms = ["web"];

    act(() => {
      window.dispatchEvent(installEvent);
    });

    const installBtn = await screen.findByTestId("pwa-install-btn");
    fireEvent.click(installBtn);

    await waitFor(() => {
      expect(promptMock).toHaveBeenCalledTimes(1);
    });
  });

  it("switches AppFooter and document root cleanly to Arabic RTL", async () => {
    render(
      <TestShell>
        <RtlFooterHarness />
      </TestShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Switch Arabic" }));
    await waitFor(() => {
      expect(document.documentElement.dir).toBe("rtl");
      expect(screen.getByTestId("rtl-wrapper")).toHaveAttribute("dir", "rtl");
      expect(screen.getByText("بيئة التعلّم")).toBeInTheDocument();
      expect(screen.getByText("الإبلاغ عن مشكلة")).toBeInTheDocument();
    });
  });

  it("applies both approved studio theme presets with matching glow, theme-color meta, and deterministic restoration", async () => {
    expect(THEME_CATALOG).toHaveLength(2);
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#000000";
    document.head.appendChild(meta);

    function PresetHarness() {
      const { applyThemePreset, setTheme, appearance } = usePrefs();
      return (
        <div>
          <span data-testid="active-accent">{appearance.customAccentHex}</span>
          <button
            type="button"
            onClick={() => applyThemePreset(getThemePresetById("nordic_frost")!, "light")}
          >
            Apply Nordic
          </button>
          <button type="button" onClick={() => setTheme("light")}>
            Light Mode
          </button>
        </div>
      );
    }

    render(
      <TestShell>
        <PresetHarness />
      </TestShell>,
    );

    for (const preset of THEME_CATALOG) {
      const matched = findMatchingThemePreset({
        ui_theme: preset.baseUiTheme,
        accent_color: "custom",
        custom_accent_hex: preset.accentHex,
        bg_style: preset.bgStyle,
        corner_style: preset.cornerStyle,
      });
      expect(matched?.baseUiTheme).toBe(preset.baseUiTheme);
      expect(matched?.accentHex.toLowerCase()).toBe(preset.accentHex.toLowerCase());
    }

    fireEvent.click(screen.getByRole("button", { name: "Apply Nordic" }));
    await waitFor(() => {
      expect(document.documentElement.dataset["themePreset"]).toBe("nordic_frost");
      expect(document.documentElement.style.getPropertyValue("--primary-glow")).toBe("#38bdf8");
    });

    fireEvent.click(screen.getByRole("button", { name: "Light Mode" }));
    await waitFor(() => {
      expect(meta.getAttribute("content")).toBe("#f1f6fa");
    });

    meta.remove();
  });

  it("waits for service worker controllerchange before reloading during applyUpdate", async () => {
    const postMessage = vi.fn();
    let controllerChangeCb: (() => void) | undefined;
    const swListeners = new Set<() => void>();
    const reloadSpy = vi.fn();

    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, reload: reloadSpy },
    });

    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        controller: {},
        register: vi.fn().mockResolvedValue({
          waiting: { postMessage },
          addEventListener: vi.fn(),
        }),
        addEventListener: vi.fn((event: string, cb: () => void) => {
          if (event === "controllerchange") {
            controllerChangeCb = cb;
            swListeners.add(cb);
          }
        }),
      },
    });

    function UpdateHarness() {
      const { hasUpdate, applyUpdate } = usePWA();
      return (
        <div>
          <span data-testid="sw-has-update">{String(hasUpdate)}</span>
          <button type="button" onClick={applyUpdate}>
            Update Now
          </button>
        </div>
      );
    }

    render(<UpdateHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("sw-has-update")).toHaveTextContent("true");
    });

    fireEvent.click(screen.getByRole("button", { name: "Update Now" }));
    expect(postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
    expect(reloadSpy).not.toHaveBeenCalled();

    act(() => {
      controllerChangeCb?.();
    });
    expect(reloadSpy).toHaveBeenCalledTimes(1);

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("provides non-empty Prompt 3 translations across all 7 languages and localizes Accessibility Assistant summaries", () => {
    const p3Keys = Object.keys(prompt3En) as Prompt3Key[];
    for (const lang of SUPPORTED_LANGS) {
      for (const key of p3Keys) {
        expect(dict[lang][key].trim().length, `Missing ${lang}.${key}`).toBeGreaterThan(0);
      }
    }

    const defaultRec = buildAccessibilityRecommendation(["reading_density", "eye_strain"]);
    expect(defaultRec.changes.dyslexia).toBe(true);
    expect(defaultRec.summary).toContain("comfort adjustment");

    const arRec = buildAccessibilityRecommendation(
      ["reading_density", "auditory_preference"],
      (key) => dict.ar[key as keyof typeof dict.ar] ?? key,
    );
    expect(arRec.summary).toContain(dict.ar["a11yAssistant.sum.prefix"]);
    expect(arRec.appliedLabels).toContain(dict.ar["a11yAssistant.s.dyslexia"]);
    expect(arRec.appliedLabels).toContain(dict.ar["a11yAssistant.s.readAloud"]);
  });
});
