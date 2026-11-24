export const SUPPORTED_LANGS = ["en", "ar", "ja", "fr", "de", "zh-CN", "ko"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export const PILOT_LANGS = ["en", "ar"] as const;
export type PilotLang = (typeof PILOT_LANGS)[number];

export interface LangMeta {
  code: Lang;
  bcp47: string;
  nativeName: string;
  englishName: string;
  dir: "ltr" | "rtl";
  shortCode: string;
}

export const LANG_META: Record<Lang, LangMeta> = {
  en: {
    code: "en",
    bcp47: "en-US",
    nativeName: "English",
    englishName: "English",
    dir: "ltr",
    shortCode: "EN",
  },
  ar: {
    code: "ar",
    bcp47: "ar-KW",
    nativeName: "العربية",
    englishName: "Arabic",
    dir: "rtl",
    shortCode: "AR",
  },
  ja: {
    code: "ja",
    bcp47: "ja-JP",
    nativeName: "日本語",
    englishName: "Japanese",
    dir: "ltr",
    shortCode: "JA",
  },
  fr: {
    code: "fr",
    bcp47: "fr-FR",
    nativeName: "Français",
    englishName: "French",
    dir: "ltr",
    shortCode: "FR",
  },
  de: {
    code: "de",
    bcp47: "de-DE",
    nativeName: "Deutsch",
    englishName: "German",
    dir: "ltr",
    shortCode: "DE",
  },
  "zh-CN": {
    code: "zh-CN",
    bcp47: "zh-CN",
    nativeName: "简体中文",
    englishName: "Chinese (Simplified)",
    dir: "ltr",
    shortCode: "中文",
  },
  ko: {
    code: "ko",
    bcp47: "ko-KR",
    nativeName: "한국어",
    englishName: "Korean",
    dir: "ltr",
    shortCode: "KO",
  },
};

export function isSupportedLang(value: unknown): value is Lang {
  return typeof value === "string" && (SUPPORTED_LANGS as readonly string[]).includes(value);
}

export function normalizeLang(value: unknown): Lang {
  if (isSupportedLang(value)) return value;
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower.startsWith("ar")) return "ar";
    if (lower.startsWith("ja")) return "ja";
    if (lower.startsWith("fr")) return "fr";
    if (lower.startsWith("de")) return "de";
    if (lower.startsWith("zh")) return "zh-CN";
    if (lower.startsWith("ko")) return "ko";
  }
  return "en";
}
