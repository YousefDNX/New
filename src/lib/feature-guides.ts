import { CORE_GUIDES } from "@/lib/guides/catalog-core";
import { STUDY_GUIDES_A } from "@/lib/guides/catalog-study-a";
import { STUDY_GUIDES_B } from "@/lib/guides/catalog-study-b";
import { ECO_GUIDES_A } from "@/lib/guides/catalog-eco-a";
import { ECO_GUIDES_B } from "@/lib/guides/catalog-eco-b";
import { ECO_GUIDES_C } from "@/lib/guides/catalog-eco-c";
import type { FeatureGuideEntry, FeatureGuideLocaleEntry } from "@/lib/guides/types";
import { normalizeLang, type Lang } from "@/lib/i18n/types";

export type { FeatureGuideEntry, FeatureGuideLocaleEntry } from "@/lib/guides/types";
export type FeatureGuideId = string;
export { FEATURE_GUIDE_UI_STRINGS } from "@/lib/guides/ui-strings";

export const FEATURE_GUIDES: Record<string, FeatureGuideEntry> = {
  ...CORE_GUIDES,
  ...STUDY_GUIDES_A,
  ...STUDY_GUIDES_B,
  ...ECO_GUIDES_A,
  ...ECO_GUIDES_B,
  ...ECO_GUIDES_C,
};

export const FEATURE_GUIDE_IDS = Object.keys(FEATURE_GUIDES);

export function hasFeatureGuide(featureId: string): boolean {
  return Object.prototype.hasOwnProperty.call(FEATURE_GUIDES, featureId);
}

export function getFeatureGuide(
  featureId: string,
  lang: Lang | string = "en",
): FeatureGuideLocaleEntry {
  const safeLang = normalizeLang(lang);
  const entry = FEATURE_GUIDES[featureId];
  if (entry) {
    return entry[safeLang] ?? entry.en;
  }
  const fallback = FEATURE_GUIDES["dashboard-overview"]!;
  return fallback[safeLang] ?? fallback.en;
}
