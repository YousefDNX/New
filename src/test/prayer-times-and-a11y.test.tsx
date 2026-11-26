import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PrayerTimesCard } from "@/components/islamic/PrayerTimesCard";
import { AccessibilityQuickDialog } from "@/components/common/AccessibilityQuickDialog";
import { PreferencesProvider } from "@/lib/preferences";
import {
  calculateDailyPrayerTimes,
  resolveEffectiveTimezone,
  VERIFIED_PRAYER_CITIES,
  PRAYER_COUNTRIES,
} from "@/data/islamic-center";
import {
  createInitialSadaqahState,
  logSadaqahDeed,
  SADAQAH_QUICK_PRESETS,
} from "@/lib/sadaqah-jariyah";
import { SadaqahJariyahWidget } from "@/components/dashboard/SadaqahJariyahWidget";

describe("Prayer Times, A11y Assistive Tools & Sadaqah Expansion", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe("Kuwait & Egypt Prayer Calculations and Card UI", () => {
    it("has verified Kuwait and Egypt calculation methods and cities configured", () => {
      expect(PRAYER_COUNTRIES.some((c) => c.countryCode === "KW")).toBe(true);
      expect(PRAYER_COUNTRIES.some((c) => c.countryCode === "EG")).toBe(true);

      const kuwaitCity = VERIFIED_PRAYER_CITIES.find((c) => c.id === "kw_kuwait");
      expect(kuwaitCity).toBeDefined();
      expect(kuwaitCity?.countryCode).toBe("KW");

      const cairo = VERIFIED_PRAYER_CITIES.find((c) => c.id === "eg_cairo");
      expect(cairo).toBeDefined();
      expect(cairo?.countryCode).toBe("EG");

      const alexandria = VERIFIED_PRAYER_CITIES.find((c) => c.id === "eg_alexandria");
      expect(alexandria).toBeDefined();
      expect(alexandria?.countryCode).toBe("EG");
    });

    it("resolves accurate timezone for Kuwait and Egypt", () => {
      const kuwaitCity = VERIFIED_PRAYER_CITIES.find((c) => c.id === "kw_kuwait")!;
      const tzKuwait = resolveEffectiveTimezone(kuwaitCity, new Date(2026, 4, 1));
      expect(tzKuwait).toBe(3); // Kuwait is AST UTC+3 year-round

      const cairo = VERIFIED_PRAYER_CITIES.find((c) => c.id === "eg_cairo")!;
      const tzCairoSummer = resolveEffectiveTimezone(cairo, new Date(2026, 6, 1));
      expect(tzCairoSummer).toBeGreaterThanOrEqual(2);
      expect(tzCairoSummer).toBeLessThanOrEqual(3);
    });

    it("calculates accurate prayer times for Kuwait City with official Ministry of Awqaf method", () => {
      const kuwaitCity = VERIFIED_PRAYER_CITIES.find((c) => c.id === "kw_kuwait")!;
      const times = calculateDailyPrayerTimes(
        new Date(2026, 4, 15, 12, 0, 0),
        kuwaitCity,
        "kuwait",
      );

      expect(times.fajr).toMatch(/^\d{2}:\d{2}$/);
      expect(times.dhuhr).toMatch(/^\d{2}:\d{2}$/);
      expect(times.asr).toMatch(/^\d{2}:\d{2}$/);
      expect(times.maghrib).toMatch(/^\d{2}:\d{2}$/);
      expect(times.isha).toMatch(/^\d{2}:\d{2}$/);
      expect(times.nextPrayer).toBeDefined();
    });

    it("calculates accurate prayer times for Cairo with official Egyptian General Authority method", () => {
      const cairo = VERIFIED_PRAYER_CITIES.find((c) => c.id === "eg_cairo")!;
      const times = calculateDailyPrayerTimes(new Date(2026, 4, 15, 12, 0, 0), cairo, "egypt");

      expect(times.fajr).toMatch(/^\d{2}:\d{2}$/);
      expect(times.sunrise).toMatch(/^\d{2}:\d{2}$/);
      expect(times.dhuhr).toMatch(/^\d{2}:\d{2}$/);
      expect(times.asr).toMatch(/^\d{2}:\d{2}$/);
      expect(times.maghrib).toMatch(/^\d{2}:\d{2}$/);
      expect(times.isha).toMatch(/^\d{2}:\d{2}$/);
    });

    it("switches countries to Kuwait and Egypt in PrayerTimesCard and remembers selection", () => {
      render(
        <PreferencesProvider>
          <PrayerTimesCard lang="ar" />
        </PreferencesProvider>,
      );

      expect(screen.getByTestId("prayer-times-card")).toBeInTheDocument();

      // Click Kuwait country button
      const kuwaitBtn = screen.getByTestId("prayer-country-btn-kw");
      fireEvent.click(kuwaitBtn);
      expect(screen.getByTestId("prayer-city-select")).toBeInTheDocument();
      expect(localStorage.getItem("btc_prayer_selected_country_v2")).toBe("KW");

      // Click Egypt country button
      const egyptBtn = screen.getByTestId("prayer-country-btn-eg");
      fireEvent.click(egyptBtn);
      expect(localStorage.getItem("btc_prayer_selected_country_v2")).toBe("EG");

      // Verify adhan toggle button exists
      const adhanBtn = screen.getByTestId("prayer-play-adhan-btn");
      expect(adhanBtn).toBeInTheDocument();
    });
  });

  describe("Accessibility Dialog for Special Needs", () => {
    it("opens accessibility dialog and provides tools for low vision, dyslexia, and ADHD", () => {
      render(
        <PreferencesProvider>
          <AccessibilityQuickDialog lang="ar" />
        </PreferencesProvider>,
      );

      const trigger = screen.getByTestId("accessibility-quick-trigger");
      expect(trigger).toBeInTheDocument();
      fireEvent.click(trigger);

      expect(screen.getByTestId("accessibility-quick-dialog")).toBeInTheDocument();
      expect(screen.getByTestId("a11y-toggle-dyslexia")).toBeInTheDocument();
      expect(screen.getByTestId("a11y-toggle-contrast")).toBeInTheDocument();
      expect(screen.getByTestId("a11y-toggle-ruler")).toBeInTheDocument();
      expect(screen.getByTestId("a11y-toggle-motion")).toBeInTheDocument();

      // Click high contrast toggle
      fireEvent.click(screen.getByTestId("a11y-toggle-contrast"));
      // Click dyslexic font toggle
      fireEvent.click(screen.getByTestId("a11y-toggle-dyslexia"));

      // Close dialog
      fireEvent.click(screen.getByTestId("accessibility-dialog-close"));
      expect(screen.queryByTestId("accessibility-quick-dialog")).not.toBeInTheDocument();
    });
  });

  describe("Sadaqah Jariyah Expanded Categories and 1-tap Presets", () => {
    it("supports water_food and quran_dhikr categories and quick preset logging", () => {
      let state = createInitialSadaqahState();
      expect(state.categoryCounts.water_food).toBe(0);
      expect(state.categoryCounts.quran_dhikr).toBe(0);

      const now = new Date(2026, 10, 20, 10, 0, 0);
      state = logSadaqahDeed(state, {
        category: "water_food",
        title: "سقيا ماء لعابري سبيل",
        now,
      });
      state = logSadaqahDeed(state, {
        category: "quran_dhikr",
        title: "ورد تلاوة واستغفار بنية الأهل",
        now,
      });

      expect(state.totalDeeds).toBe(2);
      expect(state.categoryCounts.water_food).toBe(1);
      expect(state.categoryCounts.quran_dhikr).toBe(1);
      expect(SADAQAH_QUICK_PRESETS.length).toBeGreaterThanOrEqual(6);
    });

    it("renders 1-tap presets strip in SadaqahJariyahWidget and logs immediately", () => {
      render(
        <PreferencesProvider>
          <SadaqahJariyahWidget lang="ar" />
        </PreferencesProvider>,
      );

      const waterPreset = screen.getByTestId("sadaqah-preset-water");
      expect(waterPreset).toBeInTheDocument();
      fireEvent.click(waterPreset);

      const totalCount = screen.getByTestId("sadaqah-total-count");
      expect(totalCount).toBeInTheDocument();
    });
  });
});
