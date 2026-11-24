import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ACTIVE_BRAND_MODE, BRAND, BRAND_CONFIGS } from "@/config/brand";
import { GRADE_9_UNIT_3_WORDS, UNIT_3_QUIZZES } from "@/data/grade9-unit3-vocab";
import { READY_TO_USE_LIBRARY } from "@/data/ready-to-use-library";
import { PreferencesProvider, translate, usePrefs } from "@/lib/preferences";
import { INTERFACE_THEMES } from "@/lib/settings";
import {
  LAYOUT_MODES,
  THEME_CATALOG,
  THEME_CATEGORY_LABELS,
  normalizeLayoutMode,
  normalizeThemePresetId,
  type ThemeCategory,
} from "@/lib/theme-catalog";
import { Unit3VocabWorkspace } from "@/components/study/Unit3VocabWorkspace";
import { evaluateWritingSubmission } from "@/lib/english-world";
import { evaluateTypingSessionForDevice, getDeviceTypingTargetWpm } from "@/data/practical-skills";
import { computeBtcSkillProgression } from "@/lib/growth";
import { USER_SETTINGS_ALLOWED_KEYS } from "@/hooks/use-settings";

function ModeLayoutHarness() {
  const { uiMode, setUiMode, layoutMode, setLayoutMode, themePresetId, applyThemePreset } =
    usePrefs();
  return (
    <div>
      <span data-testid="ui-mode">{uiMode}</span>
      <span data-testid="layout-mode">{layoutMode}</span>
      <span data-testid="preset-id">{themePresetId ?? "none"}</span>
      <button type="button" onClick={() => setUiMode("advanced")}>
        Switch Advanced
      </button>
      <button type="button" onClick={() => setLayoutMode("top_nav")}>
        Switch TopNav
      </button>
      <button type="button" onClick={() => applyThemePreset(THEME_CATALOG[1]!)}>
        Apply Preset 2
      </button>
    </div>
  );
}

describe("BTC Master Update: Brand, Library, Unit 3, UI Modes & Design Presets", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("provides reversible BTC and NEXORA brand configurations and translates UI strings cleanly", () => {
    expect(ACTIVE_BRAND_MODE).toBe("BTC");
    expect(BRAND.name).toBe("BTC");
    expect(BRAND.fullName).toBe("BE THE CHANGE");
    expect(BRAND_CONFIGS.NEXORA.name).toBe("NEXORA");
    expect(BRAND_CONFIGS.NEXORA.tagline).toBe("Study. Focus. Grow.");
    expect(translate("en", "nav.ai")).toBe("BTC AI");
  });

  it("contains all 24 Grade 9 Unit 3 vocabulary entries with British spelling and 5 graded quizzes", () => {
    expect(GRADE_9_UNIT_3_WORDS).toHaveLength(24);
    const words = GRADE_9_UNIT_3_WORDS.map((w) => w.word);
    expect(words).toContain("flavour");
    expect(words).toContain("fibre");
    expect(words).not.toContain("flavor");
    expect(words).not.toContain("fiber");
    expect(UNIT_3_QUIZZES).toHaveLength(5);
  });

  it("provides ready-to-use starter templates across all 4 learning domains", () => {
    const categories = new Set(READY_TO_USE_LIBRARY.map((i) => i.category));
    expect(categories).toEqual(new Set(["study", "tasks", "future", "care"]));
  });

  it("defines 2 approved design presets with Firestore-safe baseUiTheme", () => {
    expect(THEME_CATALOG).toHaveLength(2);
    const ids = new Set(THEME_CATALOG.map((p) => p.id));
    expect(ids.size).toBe(2);

    for (const preset of THEME_CATALOG) {
      expect(INTERFACE_THEMES).toContain(preset.baseUiTheme);
    }

    expect(normalizeLayoutMode("prime_academy")).toBe("executive_kpi");
    expect(normalizeThemePresetId("desert_sand")).toBe("champagne_gold");
  });

  it("persists uiMode, layoutMode, and themePresetId on DOM dataset and localStorage", () => {
    render(
      <PreferencesProvider>
        <ModeLayoutHarness />
      </PreferencesProvider>,
    );

    expect(screen.getByTestId("ui-mode")).toHaveTextContent("simplified");
    expect(document.documentElement.dataset["uiMode"]).toBe("simplified");
    expect(document.documentElement.dataset["layoutMode"]).toBe("classic");

    fireEvent.click(screen.getByRole("button", { name: "Switch Advanced" }));
    expect(screen.getByTestId("ui-mode")).toHaveTextContent("advanced");
    expect(document.documentElement.dataset["uiMode"]).toBe("advanced");

    fireEvent.click(screen.getByRole("button", { name: "Switch TopNav" }));
    expect(screen.getByTestId("layout-mode")).toHaveTextContent("top_nav");
    expect(document.documentElement.dataset["layoutMode"]).toBe("top_nav");

    fireEvent.click(screen.getByRole("button", { name: "Apply Preset 2" }));
    expect(document.documentElement.dataset["themePreset"]).toBe(THEME_CATALOG[1]!.id);
    expect(localStorage.getItem("nexora.prefs")).toContain("advanced");
  });

  it("renders Flashcard with English audio on front and conditionally reveals Arabic audio on flip", () => {
    render(<Unit3VocabWorkspace />);
    expect(screen.queryByText("استمع بالعربية")).toBeNull();
    expect(screen.getByLabelText("Listen to pronunciation")).toBeTruthy();

    // Click card to flip
    fireEvent.click(screen.getByText("(Click card to reveal Arabic meaning & definition)"));
    expect(screen.getByText("استمع بالعربية")).toBeTruthy();
  });

  it("separates objective mechanics errors from stylistic suggestions in writing evaluation", () => {
    const result = evaluateWritingSubmission("hello world i like study english because it is fun", {
      minWords: 30,
      maxWords: 80,
    });
    expect(result.objectiveErrors.some((e) => e.category === "Capitalization")).toBe(true);
    expect(result.objectiveErrors.some((e) => e.category === "Punctuation")).toBe(true);
    expect(result.stylisticSuggestions.some((s) => s.category === "Development & Length")).toBe(
      true,
    );
    expect(result.improvements.length).toBe(
      result.objectiveErrors.length + result.stylisticSuggestions.length,
    );
  });

  it("evaluates typing sessions with calibrated desktop vs mobile touch targets", () => {
    const desktopTarget = getDeviceTypingTargetWpm({ targetWpm: 40 }, "desktop");
    const mobileTarget = getDeviceTypingTargetWpm({ targetWpm: 40 }, "mobile");
    expect(desktopTarget).toBe(40);
    expect(mobileTarget).toBe(26); // Math.round(40 * 0.65)

    const mobileEval = evaluateTypingSessionForDevice(
      "clean text",
      "clean text",
      10000,
      "mobile",
      40,
    );
    expect(mobileEval.deviceMode).toBe("mobile");
    expect(mobileEval.adjustedTargetWpm).toBe(26);
  });

  it("strictly gates skill_mastered behind multi-attempt verification in 4-stage progression", () => {
    const singleAttempt = computeBtcSkillProgression({
      listeningScores: { l1: 100 },
      readingScores: {},
      grammarScores: {},
      writingRevisions: [],
      speakingCount: 0,
      vocabProgressList: [],
      typingSessions: [],
      masteredPathStepsCount: 0,
    });
    const listeningItem = singleAttempt.items.find((i) => i.id === "en_listening");
    expect(listeningItem?.stage).not.toBe("skill_mastered");

    const multiAttempt = computeBtcSkillProgression({
      listeningScores: { l1: 90, l2: 85 },
      readingScores: {},
      grammarScores: {},
      writingRevisions: [],
      speakingCount: 0,
      vocabProgressList: [],
      typingSessions: [],
      masteredPathStepsCount: 0,
    });
    const multiListening = multiAttempt.items.find((i) => i.id === "en_listening");
    expect(multiListening?.stage).toBe("skill_mastered");
  });

  it("verifies user_settings allowed keys include ui_mode, theme_preset_id, and layout_mode", () => {
    expect(USER_SETTINGS_ALLOWED_KEYS).toContain("ui_mode");
    expect(USER_SETTINGS_ALLOWED_KEYS).toContain("theme_preset_id");
    expect(USER_SETTINGS_ALLOWED_KEYS).toContain("layout_mode");
  });
});
