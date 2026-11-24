export type AccessibilityBarrier =
  "reading_density" | "eye_strain" | "focus_distraction" | "auditory_preference";

export interface AccessibilityRecommendation {
  summary: string;
  changes: {
    dyslexia?: boolean;
    contrast?: boolean;
    reduceMotion?: boolean;
    simplified?: boolean;
    clearLanguage?: boolean;
    readAloud?: boolean;
    fontScale?: number;
    lineHeight?: number;
    letterSpacing?: number;
    readingLayout?: "standard" | "focused";
  };
  appliedLabels: string[];
}

export function buildAccessibilityRecommendation(
  barriers: AccessibilityBarrier[],
  translateFn?: (key: string) => string,
): AccessibilityRecommendation {
  const set = new Set(barriers);
  const changes: AccessibilityRecommendation["changes"] = {};
  const appliedLabels: string[] = [];
  const label = (key: string, fallback: string) => (translateFn ? translateFn(key) : fallback);

  if (set.has("reading_density")) {
    changes.dyslexia = true;
    changes.fontScale = 1.15;
    changes.lineHeight = 1.8;
    changes.letterSpacing = 0.03;
    if (translateFn) {
      appliedLabels.push(label("a11yAssistant.s.dyslexia", "Dyslexia-friendly font & 115% scale"));
    } else {
      appliedLabels.push("Dyslexia-friendly font", "115% text scale", "1.8x relaxed line spacing");
    }
  }

  if (set.has("eye_strain")) {
    changes.contrast = true;
    changes.readingLayout = "focused";
    if (translateFn) {
      appliedLabels.push(label("a11yAssistant.s.contrast", "WCAG high-contrast surfaces"));
    } else {
      appliedLabels.push("High-contrast readability", "Focused reading column");
    }
  }

  if (set.has("focus_distraction")) {
    changes.reduceMotion = true;
    changes.simplified = true;
    changes.readingLayout = "focused";
    if (translateFn) {
      appliedLabels.push(
        label("a11yAssistant.s.motion", "Reduced motion & blur-free calm surface"),
        label("a11yAssistant.s.focus", "Simplified low-distraction layout"),
      );
    } else {
      appliedLabels.push(
        "Reduced motion",
        "Simplified distraction-free interface",
        "Focused layout",
      );
    }
  }

  if (set.has("auditory_preference")) {
    changes.readAloud = true;
    changes.clearLanguage = true;
    if (translateFn) {
      appliedLabels.push(label("a11yAssistant.s.readAloud", "Read-aloud speech & captions"));
    } else {
      appliedLabels.push("Page Read-Aloud speech controls", "Clear plain-language labels");
    }
  }

  if (appliedLabels.length === 0) {
    return {
      summary: translateFn
        ? translateFn("a11yAssistant.sum.empty")
        : "Select one or more study comfort needs to generate a personalized setup.",
      changes: {},
      appliedLabels: [],
    };
  }

  return {
    summary: translateFn
      ? `${translateFn("a11yAssistant.sum.prefix")} ${appliedLabels.join(translateFn("a11yAssistant.sum.sep"))}`
      : `Tailored ${appliedLabels.length} comfort adjustment${appliedLabels.length === 1 ? "" : "s"} based on your study needs.`,
    changes,
    appliedLabels,
  };
}
