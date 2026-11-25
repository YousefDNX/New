/**
 * BTC / NEXORA Centralized Brand Configuration
 * Supports reversible switching between the competition brand (BTC — BE THE CHANGE)
 * and the platform brand (NEXORA) without modifying distributed source files.
 */

export type BrandMode = "BTC" | "NEXORA";

export interface BrandConfig {
  mode: BrandMode;
  name: string;
  shortName: string;
  fullName: string;
  tagline: string;
  taglineAr: string;
  subtagline: string;
  subtaglineAr: string;
  mission: string;
  missionAr: string;
  heroHeadline: string;
  heroHeadlineAr: string;
  heroSubheadline: string;
  heroSubheadlineAr: string;
  copyright: string;
  copyrightAr: string;
  competitionBadge: string;
  competitionBadgeAr: string;
}

// Active brand selector: set to "BTC" for competition, switch to "NEXORA" to restore.
export const ACTIVE_BRAND_MODE: BrandMode = "BTC";

export const BRAND_CONFIGS: Record<BrandMode, BrandConfig> = {
  BTC: {
    mode: "BTC",
    name: "BTC",
    shortName: "BTC",
    fullName: "BE THE CHANGE",
    tagline: "Study. Focus. Grow.",
    taglineAr: "الدراسة. التركيز. النمو.",
    subtagline: "International Student Technology & Innovation Platform",
    subtaglineAr: "منصة التكنولوجيا والابتكار الطلابي الدولية",
    mission:
      "Empowering students worldwide to master subjects, build healthy habits, explore careers, and drive positive global change.",
    missionAr:
      "تمكين الطلاب في كل مكان من إتقان المواد الدراسية، وبناء عادات متوازنة، واستكشاف المستقبل، وصناعة أثر عالمي إيجابي.",
    heroHeadline: "Study. Focus. Grow.",
    heroHeadlineAr: "الدراسة. التركيز. النمو.",
    heroSubheadline:
      "A unified student innovation workspace uniting active recall, smart focus, wellbeing care, and global opportunity pathways.",
    heroSubheadlineAr:
      "مساحة عمل طلابية مبتكرة توحد الاستذكار الفعال، التركيز الذكي، التوازن النفسي، ومسارات الفرص العالمية.",
    copyright: "© 2026 BTC — BE THE CHANGE. All student data encrypted and strictly isolated.",
    copyrightAr: "© 2026 BTC — كُن التغيير. جميع بيانات الطلاب مشفرة ومحمية بالكامل.",
    competitionBadge: "BTC Student Innovation Edition",
    competitionBadgeAr: "إصدار BTC للابتكار الطلابي",
  },
  NEXORA: {
    mode: "NEXORA",
    name: "NEXORA",
    shortName: "NEXORA",
    fullName: "NEXORA Learning Systems",
    tagline: "Study. Focus. Grow.",
    taglineAr: "تعلّم. ركّز. انمُ.",
    subtagline: "Unified Student Growth & Opportunity Platform",
    subtaglineAr: "منصة النمو والفرص الطلابية الموحدة",
    mission:
      "NEXORA is a unified student growth ecosystem uniting academic focus, spaced repetition, personal wellbeing, and educational opportunity pathways.",
    missionAr:
      "نيكسورا هي بيئة نمو طلابية موحدة تجمع بين التركيز الأكاديمي، التكرار المتباعد، الرفاه النفسي، ومسارات الفرص التعليمية.",
    heroHeadline: "Your whole student life, growing in one place.",
    heroHeadlineAr: "حياتك الدراسية بأكملها، تنمو في مكان واحد.",
    heroSubheadline:
      "Every task you finish, session you focus, and mistake you master feeds your personal Growth Map — guiding your next best step.",
    heroSubheadlineAr:
      "كل مهمة تنجزها، جلسة تركز فيها، وخطأ تتقنه يغذي خريطة نموك الشخصية — لتوجيه خطوتك التالية بثقة.",
    copyright: "© 2026 NEXORA Learning Systems. All student data encrypted and strictly isolated.",
    copyrightAr: "© 2026 أنظمة نيكسورا التعليمية. جميع بيانات الطلاب مشفرة ومحمية بالكامل.",
    competitionBadge: "Official Student Growth Edition",
    competitionBadgeAr: "الإصدار الرسمي للنمو الطلابي",
  },
};

export const BRAND: BrandConfig = BRAND_CONFIGS[ACTIVE_BRAND_MODE];

export function getBrand(): BrandConfig {
  return BRAND;
}

export function isBtcMode(): boolean {
  return BRAND.mode === "BTC";
}
