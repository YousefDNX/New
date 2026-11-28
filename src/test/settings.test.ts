import { describe, it, expect } from "vitest";
import { dict, LANG_META, SUPPORTED_LANGS, type DictKey } from "@/lib/i18n-dict";
import { formatDate, formatTime } from "@/lib/locale-format";
import {
  buildInterfaceThemePatch,
  buildLayoutWorkspacePatch,
  buildReadabilityPreset,
  clampFontScale,
  clampHeadingScale,
  clampLetterSpacing,
  clampLineHeight,
  getContrastForeground,
  getContrastRatio,
  getQuizButtonRadiusClass,
  normalizeFontFamily,
  normalizeLayoutWorkspace,
  normalizeQuizButtonStyle,
  normalizeQuizColorPalette,
  normalizeQuizFeedbackStyle,
  normalizeReadabilityPreset,
  normalizeRegion,
  normalizeUiTheme,
  normalizeWidgetOrder,
  prefsToRow,
  rowToPrefs,
} from "@/lib/settings";

describe("settings rules", () => {
  it("clamps text size to 90%–150% and typography sliders to safe bounds", () => {
    expect(clampFontScale(0.5)).toBe(0.9);
    expect(clampFontScale(2)).toBe(1.5);
    expect(clampFontScale(1.25)).toBe(1.25);

    expect(clampHeadingScale(0.2)).toBe(0.85);
    expect(clampHeadingScale(3)).toBe(1.35);
    expect(clampLineHeight(0.9)).toBe(1.25);
    expect(clampLineHeight(3.5)).toBe(2.1);
    expect(clampLetterSpacing(-0.2)).toBe(-0.03);
    expect(clampLetterSpacing(0.5)).toBe(0.08);
  });

  it("normalizes themes, fonts, presets, workspaces, and regions safely", () => {
    expect(normalizeRegion("gcc")).toBe("gcc");
    expect(normalizeRegion("mars")).toBe("global");
    expect(normalizeUiTheme("creative")).toBe("creative");
    expect(normalizeUiTheme("neon")).toBe("classic");
    expect(normalizeFontFamily("arabic")).toBe("arabic");
    expect(normalizeFontFamily("comic-sans")).toBe("nexora");
    expect(normalizeReadabilityPreset("accessibility")).toBe("accessibility");
    expect(normalizeReadabilityPreset("unknown")).toBe("standard");
    expect(normalizeLayoutWorkspace("study")).toBe("study");
    expect(normalizeLayoutWorkspace("chaos")).toBe("balanced");
  });

  it("builds cohesive interface theme patches and workspace layouts", () => {
    const focusPatch = buildInterfaceThemePatch("focus");
    expect(focusPatch).toMatchObject({
      uiTheme: "focus",
      accent: "emerald",
      animationLevel: "none",
      readingLayout: "focused",
    });

    const creativePatch = buildInterfaceThemePatch("creative");
    expect(creativePatch).toMatchObject({
      uiTheme: "creative",
      accent: "rose",
      cardStyle: "glass",
      bgStyle: "grid",
    });

    const studyWs = buildLayoutWorkspacePatch("study");
    expect(studyWs.layout).toEqual({
      workspace: "study",
      sidebarMode: "compact",
      showQuickActions: true,
    });
    expect(studyWs.appearance.readingLayout).toBe("focused");

    const minimalWs = buildLayoutWorkspacePatch("minimal");
    expect(minimalWs.layout.sidebarMode).toBe("simplified");
    expect(minimalWs.layout.showQuickActions).toBe(false);
  });

  it("builds script-aware readability presets and enforces 0em letter-spacing for Arabic RTL", () => {
    const enAccessible = buildReadabilityPreset("accessibility", "en");
    expect(enAccessible.fontFamily).toBe("accessible");
    expect(enAccessible.letterSpacing).toBeGreaterThan(0);

    const arAccessible = buildReadabilityPreset("accessibility", "ar");
    expect(arAccessible.fontFamily).toBe("arabic");
    expect(arAccessible.letterSpacing).toBe(0);

    const arComfortable = buildReadabilityPreset("comfortable", "ar");
    expect(arComfortable.letterSpacing).toBe(0);

    const jaStandard = buildReadabilityPreset("standard", "ja");
    expect(jaStandard.fontFamily).toBe("cjk");
  });

  it("round-trips account settings", () => {
    const a11y = { fontScale: 1.2, dyslexia: true, contrast: false, reduceMotion: true };
    expect(rowToPrefs(prefsToRow("light", a11y))).toEqual({ theme: "light", a11y });
  });

  it("normalizes widget order and preserves all widgets", () => {
    const ordered = normalizeWidgetOrder(["hub", "tasks", "tasks", "welcome"]);
    expect(ordered[0]).toBe("hub");
    expect(ordered[1]).toBe("tasks");
    expect(ordered).toHaveLength(8);
    expect(ordered).toContain("pomodoro");
  });

  it("picks WCAG foreground contrast and computes contrast ratios accurately", () => {
    expect(getContrastForeground("#ffffff")).toBe("#09111b");
    expect(getContrastForeground("#0f172a")).toBe("#f8fafc");
    expect(getContrastRatio("#ffffff", "#000000")).toBe(21);
    expect(getContrastRatio("#14b8a6", "#14b8a6")).toBe(1);
  });
  it("normalizes quiz button styles, color palettes, and feedback styles safely", () => {
    expect(normalizeQuizButtonStyle("pill")).toBe("pill");
    expect(normalizeQuizButtonStyle("hexagon")).toBe("rounded");
    expect(normalizeQuizColorPalette("royal")).toBe("royal");
    expect(normalizeQuizColorPalette("neon")).toBe("default");
    expect(normalizeQuizFeedbackStyle("minimal")).toBe("minimal");
    expect(normalizeQuizFeedbackStyle("loud")).toBe("celebration");
    expect(getQuizButtonRadiusClass("pill")).toBe("rounded-full");
    expect(getQuizButtonRadiusClass("soft_square")).toBe("rounded-md");
    expect(getQuizButtonRadiusClass("rounded")).toBe("rounded-xl");
  });
});

describe("10-language multilingual coverage and locale formatting", () => {
  it("supports all 10 languages with matching complete dictionaries and directionality", () => {
    expect(SUPPORTED_LANGS).toEqual([
      "en",
      "ar",
      "es",
      "ja",
      "fr",
      "de",
      "zh-CN",
      "ko",
      "tr",
      "ur",
    ]);
    expect(LANG_META.ar.dir).toBe("rtl");
    expect(LANG_META.ur.dir).toBe("rtl");
    expect(LANG_META.en.dir).toBe("ltr");
    expect(LANG_META.es.dir).toBe("ltr");
    expect(LANG_META.ja.dir).toBe("ltr");
    expect(LANG_META.tr.dir).toBe("ltr");
    expect(LANG_META["zh-CN"].dir).toBe("ltr");
    expect(LANG_META.ko.dir).toBe("ltr");

    const enKeys = Object.keys(dict.en) as DictKey[];
    expect(enKeys.length).toBeGreaterThan(250);

    for (const lang of SUPPORTED_LANGS) {
      const table = dict[lang];
      expect(Object.keys(table).sort()).toEqual([...enKeys].sort());
      for (const k of enKeys) {
        expect(typeof table[k]).toBe("string");
        expect(table[k].trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("formats Gregorian, Hijri, and 12h/24h times safely", () => {
    const sample = "2026-11-12T15:30:00Z";
    expect(formatDate(sample, { lang: "en", dateFormat: "ymd", timezone: "UTC" })).toBe(
      "2026-11-12",
    );
    expect(formatDate(sample, { lang: "en", dateFormat: "dmy", timezone: "UTC" })).toBe(
      "12/11/2026",
    );
    const hijri = formatDate(sample, { lang: "ar", calendar: "hijri", timezone: "Asia/Kuwait" });
    expect(hijri.length).toBeGreaterThan(4);
    const t24 = formatTime(sample, { lang: "de", timeFormat: "24h", timezone: "UTC" });
    expect(t24).toContain("15:30");
  });
});
