import test from "node:test";
import assert from "node:assert/strict";
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
  normalizeFontFamily,
  normalizeLayoutWorkspace,
  normalizeReadabilityPreset,
  normalizeUiTheme,
  normalizeWidgetOrder,
} from "../lib/settings.ts";

test("clamps typography scale and spacing values deterministically", () => {
  assert.equal(clampFontScale(0.5), 0.9);
  assert.equal(clampFontScale(2), 1.5);
  assert.equal(clampHeadingScale(0.1), 0.85);
  assert.equal(clampHeadingScale(5), 1.35);
  assert.equal(clampLineHeight(1.0), 1.25);
  assert.equal(clampLineHeight(3.0), 2.1);
  assert.equal(clampLetterSpacing(-0.5), -0.03);
  assert.equal(clampLetterSpacing(0.5), 0.08);
});

test("normalizes theme, font, preset, and workspace enums safely", () => {
  assert.equal(normalizeUiTheme("minimal"), "minimal");
  assert.equal(normalizeUiTheme("invalid"), "classic");
  assert.equal(normalizeFontFamily("serif"), "serif");
  assert.equal(normalizeFontFamily("invalid"), "nexora");
  assert.equal(normalizeReadabilityPreset("large"), "large");
  assert.equal(normalizeReadabilityPreset("invalid"), "standard");
  assert.equal(normalizeLayoutWorkspace("productivity"), "productivity");
  assert.equal(normalizeLayoutWorkspace("invalid"), "balanced");
});

test("builds coherent interface themes and workspace presets", () => {
  const focus = buildInterfaceThemePatch("focus");
  assert.equal(focus.uiTheme, "focus");
  assert.equal(focus.animationLevel, "none");
  assert.equal(focus.readingLayout, "focused");

  const studyWs = buildLayoutWorkspacePatch("study");
  assert.equal(studyWs.layout.sidebarMode, "compact");
  assert.equal(studyWs.layout.showQuickActions, true);
  assert.equal(studyWs.appearance.readingLayout, "focused");
});

test("protects Arabic RTL cursive glyphs by keeping letterSpacing at 0", () => {
  for (const preset of ["standard", "comfortable", "large", "compact", "accessibility"] as const) {
    const ar = buildReadabilityPreset(preset, "ar");
    assert.equal(ar.letterSpacing, 0);
    assert.equal(ar.fontFamily, "arabic");
  }
  const enAccess = buildReadabilityPreset("accessibility", "en");
  assert.equal(enAccess.fontFamily, "accessible");
  assert.ok(enAccess.letterSpacing > 0);
});

test("calculates WCAG contrast ratio and preserves widget order", () => {
  assert.equal(getContrastRatio("#ffffff", "#000000"), 21);
  assert.equal(getContrastForeground("#ffffff"), "#09111b");
  assert.equal(getContrastForeground("#0f172a"), "#f8fafc");
  const widgets = normalizeWidgetOrder(["tasks", "welcome"]);
  assert.equal(widgets.length, 8);
  assert.equal(widgets[0], "tasks");
  assert.ok(widgets.includes("pomodoro"));
});
