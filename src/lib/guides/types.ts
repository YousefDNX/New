import type { Lang } from "@/lib/i18n/types";

export interface FeatureGuideLocaleEntry {
  title: string;
  category: string;
  whatItDoes: string;
  whyAndProblem: string;
  whoBenefits: string;
  steps: string[];
  options: Array<{ label: string; desc: string }>;
  limitations: string;
}

export type FeatureGuideEntry = Record<Lang, FeatureGuideLocaleEntry>;

export interface FeatureGuideUiStrings {
  triggerLabel: string;
  triggerAria: string;
  closeAria: string;
  whatItDoesHeading: string;
  whyAndProblemHeading: string;
  whoBenefitsHeading: string;
  stepsHeading: string;
  optionsHeading: string;
  limitationsHeading: string;
  confirmCta: string;
}
