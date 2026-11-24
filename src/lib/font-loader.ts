import type { Lang } from "./i18n-dict";
import type { FontFamilyPref } from "./settings";

const loadedFontKeys = new Set<string>();

const OPTIONAL_FONT_URLS: Record<string, string> = {
  humanist:
    "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
  compact:
    "https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap",
  serif:
    "https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;500;600;700&display=swap",
  fraunces:
    "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap",
  accessible:
    "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap",
  arabic:
    "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap",
  "ar-tajawal": "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap",
  "ar-amiri": "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap",
  "ar-readex":
    "https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;500;600;700&display=swap",
  "ar-cairo": "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap",
  "ar-almarai": "https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&display=swap",
  ja: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap",
  "zh-CN": "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap",
  ko: "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap",
};

const FONT_NAME_TO_KEY: Record<string, string> = {
  "Plus Jakarta Sans": "humanist",
  Outfit: "compact",
  "Source Serif 4": "serif",
  Fraunces: "fraunces",
  "Atkinson Hyperlegible": "accessible",
  "IBM Plex Sans Arabic": "arabic",
  Tajawal: "ar-tajawal",
  Amiri: "ar-amiri",
  "Readex Pro": "ar-readex",
  Cairo: "ar-cairo",
  Almarai: "ar-almarai",
};

function injectFontStylesheet(key: string, href: string) {
  if (typeof document === "undefined" || loadedFontKeys.has(key)) return;
  const existing = document.head.querySelector(`link[data-nexora-font="${key}"]`);
  if (existing) {
    loadedFontKeys.add(key);
    return;
  }
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset["nexoraFont"] = key;
  document.head.appendChild(link);
  loadedFontKeys.add(key);
}

/**
 * Lazily loads Google Font stylesheets required for the active Design Preset's English & Arabic families.
 */
export function ensurePresetFonts(englishFont?: string, arabicFont?: string) {
  if (typeof document === "undefined") return;
  if (englishFont) {
    const key = FONT_NAME_TO_KEY[englishFont];
    if (key && OPTIONAL_FONT_URLS[key]) {
      injectFontStylesheet(key, OPTIONAL_FONT_URLS[key]!);
    }
  }
  if (arabicFont) {
    const key = FONT_NAME_TO_KEY[arabicFont];
    if (key && OPTIONAL_FONT_URLS[key]) {
      injectFontStylesheet(key, OPTIONAL_FONT_URLS[key]!);
    }
  }
}

/**
 * Lazily loads only the Google Font stylesheets needed for the active language or selected font preset.
 */
export function ensureFontsForSelection(lang: Lang, fontFamily: FontFamilyPref, dyslexia = false) {
  if (typeof document === "undefined") return;

  if (dyslexia || fontFamily === "accessible") {
    injectFontStylesheet("accessible", OPTIONAL_FONT_URLS["accessible"]!);
  }
  if (fontFamily === "humanist" || fontFamily === "nexora") {
    injectFontStylesheet("humanist", OPTIONAL_FONT_URLS["humanist"]!);
  } else if (fontFamily === "compact") {
    injectFontStylesheet("compact", OPTIONAL_FONT_URLS["compact"]!);
  } else if (fontFamily === "serif") {
    injectFontStylesheet("serif", OPTIONAL_FONT_URLS["serif"]!);
  } else if (fontFamily === "arabic") {
    injectFontStylesheet("arabic", OPTIONAL_FONT_URLS["arabic"]!);
  } else if (fontFamily === "cjk") {
    injectFontStylesheet("ja", OPTIONAL_FONT_URLS["ja"]!);
    injectFontStylesheet("zh-CN", OPTIONAL_FONT_URLS["zh-CN"]!);
    injectFontStylesheet("ko", OPTIONAL_FONT_URLS["ko"]!);
  }

  if (lang === "ar") {
    injectFontStylesheet("arabic", OPTIONAL_FONT_URLS["arabic"]!);
  } else if (lang === "ja") {
    injectFontStylesheet("ja", OPTIONAL_FONT_URLS["ja"]!);
  } else if (lang === "zh-CN") {
    injectFontStylesheet("zh-CN", OPTIONAL_FONT_URLS["zh-CN"]!);
  } else if (lang === "ko") {
    injectFontStylesheet("ko", OPTIONAL_FONT_URLS["ko"]!);
  }
}
