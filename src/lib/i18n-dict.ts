import { en, type DictKey, type TranslationMap } from "./i18n/en";
import { ar } from "./i18n/ar";
import { es } from "./i18n/es";
import { ja } from "./i18n/ja";
import { fr } from "./i18n/fr";
import { de } from "./i18n/de";
import { zhCN } from "./i18n/zh-cn";
import { ko } from "./i18n/ko";
import {
  SUPPORTED_LANGS,
  LANG_META,
  isSupportedLang,
  normalizeLang,
  type Lang,
  type LangMeta,
} from "./i18n/types";

export const dict: Record<Lang, TranslationMap> = {
  en,
  ar,
  es,
  ja,
  fr,
  de,
  "zh-CN": zhCN,
  ko,
};

export {
  SUPPORTED_LANGS,
  LANG_META,
  isSupportedLang,
  normalizeLang,
  type Lang,
  type LangMeta,
  type DictKey,
  type TranslationMap,
};
