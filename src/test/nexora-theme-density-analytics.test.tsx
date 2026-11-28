import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as analyticsSdk from "firebase/analytics";
import {
  getConfiguredMeasurementId,
  initFirebaseAnalytics,
  resetAnalyticsForTests,
  sanitizeAnalyticsEventName,
  sanitizeAnalyticsParams,
  trackHubEvent,
} from "@/lib/analytics";
import { extractCoreUserSettingsDoc, USER_SETTINGS_CORE_KEYS } from "@/lib/firestore-data";
import { getPrefsStorageKey, PreferencesProvider } from "@/lib/preferences";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { DensityControlPanel } from "@/components/theme/DensityControlPanel";
import { AccountPrefsSync } from "@/components/app/AccountPrefsSync";
import { CloudSettingsFallbackError, OfflineSettingsError } from "@/hooks/use-settings";

vi.mock("firebase/analytics", () => ({
  isSupported: vi.fn(async () => true),
  getAnalytics: vi.fn(() => ({ app: { name: "test-app" } })),
  logEvent: vi.fn(),
}));

const { mockSaveSettings, mockAccountSettings, mockUser } = vi.hoisted(() => ({
  mockSaveSettings: vi.fn<(...args: unknown[]) => Promise<void>>(async () => undefined),
  mockAccountSettings: {
    current: null as Record<string, unknown> | null,
  },
  mockUser: {
    current: { uid: "test-student-1", isAnonymous: false } as {
      uid: string;
      isAnonymous: boolean;
    } | null,
  },
}));

vi.mock("@/hooks/use-nexora", () => ({
  useUser: () => ({ data: mockUser.current }),
  useProfile: () => ({ data: null }),
}));

vi.mock("@/hooks/use-settings", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/use-settings")>();
  return {
    ...actual,
    useAccountSettings: () => ({ data: mockAccountSettings.current }),
    useSaveSettings: () => mockSaveSettings,
    useSaveProfile: () => vi.fn(async () => undefined),
  };
});

describe("NEXORA Firebase Analytics initialization & engagement sanitization", () => {
  beforeEach(() => {
    resetAnalyticsForTests();
    vi.clearAllMocks();
  });

  it("reads measurementId from firebase-applet-config.json", () => {
    expect(getConfiguredMeasurementId()).toBe("G-L3N8TJESLM");
  });

  it("sanitizes event names and strips sensitive PII keys from event params", () => {
    expect(sanitizeAnalyticsEventName("Growth Hub Tab!")).toBe("growth_hub_tab");
    expect(sanitizeAnalyticsEventName("123invalid")).toBe("hub_engagement");

    const sanitized = sanitizeAnalyticsParams({
      tab: "growthmap",
      area_count: 6,
      verified: true,
      email: "student@example.com",
      displayName: "Private Name",
      user_id: "uid_123",
      journalEntry: "private reflection",
      phoneNumber: "+9651234567",
      token: "secret-jwt",
    });

    expect(sanitized).toEqual({
      tab: "growthmap",
      area_count: 6,
      verified: true,
    });
  });

  it("initializes analytics safely and handles unsupported / failing browsers gracefully", async () => {
    vi.mocked(analyticsSdk.isSupported).mockResolvedValueOnce(true);
    const instance = await initFirebaseAnalytics();
    expect(instance).not.toBeNull();
    expect(analyticsSdk.getAnalytics).toHaveBeenCalledTimes(1);

    const tracked = await trackHubEvent("growth_hub_tab_select", {
      tab: "legacy",
      email: "hidden@example.com",
    });
    expect(tracked).toBe(true);
    expect(analyticsSdk.logEvent).toHaveBeenCalledWith(expect.anything(), "growth_hub_tab_select", {
      tab: "legacy",
    });

    resetAnalyticsForTests();
    vi.mocked(analyticsSdk.isSupported).mockResolvedValueOnce(false);
    expect(await initFirebaseAnalytics()).toBeNull();

    resetAnalyticsForTests();
    vi.mocked(analyticsSdk.isSupported).mockRejectedValueOnce(new Error("blocked"));
    expect(await initFirebaseAnalytics()).toBeNull();
  });
});

describe("Theme customization (data-ui-theme), density (data-density), and cloud fallback persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    mockSaveSettings.mockReset();
    mockSaveSettings.mockResolvedValue(undefined);
    mockAccountSettings.current = null;
    mockUser.current = { uid: "test-student-1", isAnonymous: false };
    document.documentElement.removeAttribute("data-ui-theme");
    document.documentElement.removeAttribute("data-density");
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.removeAttribute("data-ui-theme");
    document.documentElement.removeAttribute("data-density");
  });

  it("toggles data-ui-theme across minimal, focus, creative, and aurora_glass even when cloud save falls back locally", async () => {
    mockSaveSettings.mockRejectedValue(
      new CloudSettingsFallbackError("Remote rules restricted extended theme keys"),
    );

    render(
      <PreferencesProvider>
        <ThemeProvider>
          <ThemeSwitcher variant="full" />
        </ThemeProvider>
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Base Themes/i }));

    for (const id of ["minimal", "focus", "creative", "aurora_glass"] as const) {
      fireEvent.click(screen.getByTestId(`ui-theme-opt-${id}`));
      await waitFor(() => {
        expect(document.documentElement.getAttribute("data-ui-theme")).toBe(id);
      });
    }
  });

  it("updates data-density across compact, comfortable, and spacious and keeps changes on OfflineSettingsError", async () => {
    mockSaveSettings.mockRejectedValue(new OfflineSettingsError());

    render(
      <PreferencesProvider>
        <DensityControlPanel />
      </PreferencesProvider>,
    );

    for (const option of [
      { id: "compact", label: /Compact/i },
      { id: "spacious", label: /Spacious/i },
      { id: "comfortable", label: /Comfortable/i },
    ]) {
      fireEvent.click(screen.getByTestId("density-control-trigger"));
      const btn = await screen.findByRole("button", { name: option.label });
      fireEvent.click(btn);
      await waitFor(() => {
        expect(document.documentElement.getAttribute("data-density")).toBe(option.id);
      });
    }
  });

  it("AccountPrefsSync preserves newer local data-ui-theme and data-density across reloads when remote doc is older core-only", async () => {
    const uid = "test-student-1";
    const key = getPrefsStorageKey(uid);
    localStorage.setItem(
      key,
      JSON.stringify({
        updatedAt: "2026-11-19T10:00:00.000Z",
        appearance: { uiTheme: "aurora_glass", density: "compact" },
      }),
    );

    mockAccountSettings.current = {
      user_id: uid,
      theme: "dark",
      font_scale: 1,
      dyslexia_font: false,
      high_contrast: false,
      reduced_motion: false,
      updated_at: "2026-11-18T08:00:00.000Z",
    };

    render(
      <PreferencesProvider>
        <AccountPrefsSync />
      </PreferencesProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-ui-theme")).toBe("aurora_glass");
      expect(document.documentElement.getAttribute("data-density")).toBe("compact");
    });
  });

  it("extracts strictly the 12 core blueprint keys in extractCoreUserSettingsDoc", () => {
    const core = extractCoreUserSettingsDoc(
      {
        user_id: "u1",
        theme: "light",
        font_scale: 1.1,
        ui_theme: "aurora_glass",
        density: "compact",
      },
      "u1",
    );
    expect(Object.keys(core).sort()).toEqual([...USER_SETTINGS_CORE_KEYS].sort());
    expect(core["ui_theme"]).toBeUndefined();
    expect(core["density"]).toBeUndefined();
  });

  it("ships explicit TanStack Start client entry and excludes Vite dev/module URLs from SW caching", () => {
    const clientEntry = readFileSync(resolve(process.cwd(), "src/client.tsx"), "utf8");
    expect(clientEntry).toContain("hydrateRoot");
    expect(clientEntry).toContain("StartClient");

    const sw = readFileSync(resolve(process.cwd(), "public/sw.js"), "utf8");
    expect(sw).toMatch(/btc-shell-v[5-9]/);
    expect(sw).toContain("/node_modules/");
    expect(sw).toContain("/@vite/");
    expect(sw).toContain("/@id/");
  });
});
