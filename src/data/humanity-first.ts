/**
 * NEXORA RAHMAH & HUMANITY FIRST ECOSYSTEM DATA
 *
 * Sincerity, responsibility, compassion, accuracy, humility, and sustainable benefit.
 * Explicitly rejects reward scoring, حسنات calculation, divine acceptance claims,
 * and competitive charity leaderboards.
 */

// ============================================================================
// 1. UNIVERSAL BENEFIT RESOURCE REGISTRY & CONTINUITY TYPES
// ============================================================================

export type BenefitLifecycleState =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "published"
  | "active_maintenance"
  | "update_required"
  | "under_revision"
  | "reverified"
  | "archived";

export type SystemKind =
  | "health_awareness"
  | "human_wisdom"
  | "earth_care"
  | "digital_protection"
  | "community_resource"
  | "life_saving"
  | "open_tools"
  | "family_legacy"
  | "verified_help"
  | "truth_defender"
  | "educational_gift"
  | "islamic_beneficial";

export type ResourceMaintenanceStatus =
  | "healthy"
  | "review_due"
  | "broken_link_reported"
  | "translation_pending"
  | "accessibility_pending"
  | "under_correction";

export interface VersionHistoryEntry {
  version: number;
  date: string;
  changeSummary: string;
  reviewerName: string;
}

export interface ResourceCorrectionReport {
  id: string;
  reportedAt: string;
  kind: "factual_error" | "broken_link" | "outdated" | "inaccessible" | "copyright" | "misleading";
  details: string;
  status: "pending" | "investigating" | "approved" | "rejected";
  resolutionNote?: string;
  resolvedAt?: string;
}

export interface UniversalBenefitResource {
  id: string;
  title: string;
  titleAr: string;
  systemKind: SystemKind;
  lifecycleState: BenefitLifecycleState;
  creatorName: string;
  creatorRole: "student" | "educator" | "specialist" | "family" | "community_volunteer";
  originalSource: string;
  license: string;
  publicationDate: string;
  lastReviewedDate: string;
  reviewIntervalDays: number;
  version: number;
  maintenanceStatus: ResourceMaintenanceStatus;
  accessibilityStatus: {
    hasAudio: boolean;
    hasScreenReaderFormatted: boolean;
    hasSimplifiedText: boolean;
    hasDiagramAltText: boolean;
    hasCaptions: boolean;
  };
  languagesAvailable: string[];
  pendingCorrectionCount: number;
  knownLimitations: string[];
  contentSummary: string;
  fullContent: string;
  targetAudience: string;
  versionHistory: VersionHistoryEntry[];
  correctionReports: ResourceCorrectionReport[];
}

// ============================================================================
// 2. HEALTH AWARENESS TYPES (15 Clinical & Wellness Areas)
// ============================================================================

export type HealthDomainKind =
  | "vision_eye"
  | "brain_nervous"
  | "heart_cardiovascular"
  | "respiratory"
  | "digestive"
  | "oral"
  | "skin"
  | "nutrition"
  | "sleep"
  | "wellness"
  | "mental_wellbeing"
  | "hygiene_prevention"
  | "healthy_habits"
  | "age_appropriate"
  | "preventative_screenings";

export interface HealthGlossaryTerm {
  term: string;
  termAr: string;
  definition: string;
  simpleExplanation: string;
}

export interface HealthFaq {
  question: string;
  questionAr: string;
  answer: string;
}

export interface HealthTopicRecord {
  id: string;
  domain: HealthDomainKind;
  title: string;
  titleAr: string;
  beginnerExplanation: string;
  detailedExplanation: string;
  commonMisconceptions: string[];
  lifestyleChecklist: string[];
  whenToConsultDoctor: string[];
  emergencyWarningSigns: string[]; // Threshold for 112 / 999 / 911
  trustedReferences: Array<{ name: string; url?: string; updateDate: string }>;
  glossary: HealthGlossaryTerm[];
  faqs: HealthFaq[];
  lastClinicalReviewDate: string;
  clinicalReviewer: string;
  limitationsNotice: string;
}

// ============================================================================
// 3. HUMAN WISDOM ARCHIVE TYPES
// ============================================================================

export type WisdomCategoryKind =
  | "educational_journey"
  | "professional_insight"
  | "scientific_discovery"
  | "practical_life_skill"
  | "lessons_from_mistakes"
  | "cultural_heritage";

export interface HumanWisdomRecord {
  id: string;
  category: WisdomCategoryKind;
  title: string;
  titleAr: string;
  contributorAttribution: string; // Name or approved ethical pseudonym
  consentConfirmed: boolean;
  licensingPermitted: boolean;
  coreInsight: string;
  detailedExperience: string;
  practicalAdviceForYouth: string[];
  topicTags: string[];
  submittedDate: string;
  verifiedByReviewer: string;
  preservationStatus: "permanent_archive" | "active_study_reference";
}

// ============================================================================
// 4. EARTH CARE (ENVIRONMENTAL ACTION & INCUBATOR) TYPES
// ============================================================================

export type EarthCareDomain =
  | "water_conservation"
  | "energy_efficiency"
  | "waste_recycling"
  | "biodiversity_ecosystems"
  | "climate_science"
  | "air_quality";

export interface EarthCareChallenge {
  id: string;
  domain: EarthCareDomain;
  title: string;
  titleAr: string;
  problemStatement: string;
  scientificContext: string;
  safeActionSteps: string[];
  supervisionNeeded: boolean;
  verifiableMetricLabel: string;
  estimatedEffortHours: number;
}

export interface EarthCareProjectRecord {
  id: string;
  challengeId: string;
  title: string;
  leadStudentOrTeam: string;
  status: "researching" | "active_action" | "evaluating" | "completed_published";
  researchSummary: string;
  safeActionsTaken: string[];
  measuredOutcome: string; // Honest, evidence-backed observation
  supervisorName: string;
  submittedAt: string;
}

// ============================================================================
// 5. DIGITAL PROTECTION & SAFETY ACADEMY TYPES
// ============================================================================

export interface DigitalSafetyLesson {
  id: string;
  title: string;
  titleAr: string;
  category:
    "account_security" | "phishing_scams" | "privacy_footprint" | "lateral_reading" | "ai_ethics";
  threatExplanation: string;
  defensiveBestPractices: string[];
  interactiveScenario: {
    prompt: string;
    choices: Array<{ text: string; isSafe: boolean; explanation: string }>;
  };
}

export interface DigitalSafetyChecklistItem {
  id: string;
  label: string;
  labelAr: string;
  category: string;
  description: string;
}

// ============================================================================
// 6. COMMUNITY RESOURCE MAP TYPES
// ============================================================================

export type CommunityResourceCategory =
  | "public_library"
  | "educational_center"
  | "accessible_services"
  | "community_center"
  | "verified_nonprofit"
  | "youth_development"
  | "public_health_learning";

export type VerificationConfidence =
  "officially_verified" | "source_confirmed" | "awaiting_verification" | "outdated";

export interface CommunityResourceEntry {
  id: string;
  name: string;
  nameAr: string;
  category: CommunityResourceCategory;
  region: "kuwait" | "gcc" | "global";
  cityLocation: string;
  description: string;
  officialWebsite?: string;
  verifiedPublicContact?: string;
  eligibility: string;
  costInfo: "Free" | "Low-Cost" | "Non-Profit Subsidy";
  accessibilityFeatures: string[];
  verificationConfidence: VerificationConfidence;
  lastVerificationDate: string;
  verificationSource: string;
}

// ============================================================================
// 7. LIFE-SAVING AWARENESS TYPES
// ============================================================================

export interface LifeSavingTopic {
  id: string;
  title: string;
  titleAr: string;
  category:
    | "emergency_dispatch"
    | "warning_signs"
    | "first_aid_principles"
    | "home_fire_safety"
    | "weather_heat";
  emergencyNumbers: {
    kuwait: string;
    gcc: string;
    international: string;
  };
  warningSignsNotice: string;
  immediateActionSteps: string[];
  whatNeverToDo: string[];
  officialGuidelineSource: string;
  certifiedTrainingDisclaimer: string;
}

// ============================================================================
// 8. OPEN TOOLS FOR GOOD TYPES
// ============================================================================

export interface OpenToolRecord {
  id: string;
  name: string;
  nameAr: string;
  purpose: string;
  license: "MIT" | "Apache-2.0" | "GPL-3.0" | "OER-Free";
  version: string;
  maintenanceStatus: "active" | "stable" | "needs_update";
  accessibilityFeatures: string[];
  privacyGuarantee: string;
  creatorAttribution: string;
  documentationUrl?: string;
  inAppExecutableKind?: "contrast_checker" | "text_simplifier" | "glossary_builder";
}

// ============================================================================
// 9. FAMILY KNOWLEDGE LEGACY TYPES
// ============================================================================

export interface FamilyKnowledgeRecord {
  id: string;
  title: string;
  topic: string;
  familyRoleAuthor: string;
  generationPerspective: "grandparent" | "parent" | "youth" | "collaborative";
  summary: string;
  notesAndSteps: string;
  sharedDate: string;
  isPrivateToFamily: true; // Strictly private by default
}

// ============================================================================
// 10. VERIFIED HELP NETWORK (SAFE VOLUNTEERING) TYPES
// ============================================================================

export interface VerifiedHelpOpportunity {
  id: string;
  organizationName: string;
  website: string;
  title: string;
  titleAr: string;
  focusArea:
    | "educational_tutoring"
    | "accessibility_adaptation"
    | "environmental_cleanup"
    | "language_translation"
    | "youth_mentorship";
  description: string;
  eligibilityRequirements: string;
  minimumAge: number;
  remoteAvailable: boolean;
  requiredSupervision: string;
  timeCommitmentHoursPerWeek: number;
  lastVerificationDate: string;
  childSafetyDeclaration: string;
}

// ============================================================================
// 11. TRUTH & KNOWLEDGE DEFENDER TYPES
// ============================================================================

export type ClaimVerdict =
  | "supported_by_evidence"
  | "partially_supported"
  | "contradicted_by_evidence"
  | "insufficient_evidence"
  | "outdated_information"
  | "opinion_or_interpretation"
  | "unverified_claim";

export interface TruthEvaluationItem {
  id: string;
  submittedClaim: string;
  centralAssertion: string;
  deconstructedPoints: string[];
  verdict: ClaimVerdict;
  confidenceExplanation: string;
  sourcesExamined: Array<{
    title: string;
    sourceName: string;
    publicationDate: string;
    quotedSnippet: string;
    url?: string;
  }>;
  identifiedDisagreementsOrNuances: string[];
  evaluatedAt: string;
}

export interface LogicalFallacyModule {
  id: string;
  name: string;
  nameAr: string;
  definition: string;
  everydayExample: string;
  howToSpotIt: string;
  practiceScenario: {
    argumentText: string;
    flawQuestion: string;
    options: string[];
    correctIndex: number;
    remediationNote: string;
  };
}

// ============================================================================
// 12. GOOD CHARACTER & DAILY BENEFIT COMPANION TYPES
// ============================================================================

export interface GoodCharacterTheme {
  id: string;
  titleEn: string;
  titleAr: string;
  arabicConcept: string;
  coreDefinition: string;
  authenticReferences: Array<{
    textAr: string;
    textEn: string;
    sourceBook: string; // e.g. Sahih al-Bukhari, Sahih Muslim, Riyadh as-Salihin, Holy Quran
    citationNumber: string;
    authenticityGrade:
      | "Muttafaq 'Alayh"
      | "Sahih (Bukhari)"
      | "Sahih (Muslim)"
      | "Sahih (Ibn Majah)"
      | "Hasan Sahih"
      | "Quranic Verse";
  }>;
  practicalStudentScenarios: string[];
  dailyReflectionQuestions: string[];
  voluntaryHabitGoal: string;
}

// ============================================================================
// INITIAL DATASETS
// ============================================================================

export const INITIAL_UNIVERSAL_BENEFIT_REGISTRY: UniversalBenefitResource[] = [
  {
    id: "ubr_hlth_vision_screen",
    title: "Student Vision Health & Digital Screen Ergonomics",
    titleAr: "صحة الإبصار للطلبة وبيئة الشاشات الرقمية",
    systemKind: "health_awareness",
    lifecycleState: "published",
    creatorName: "NEXORA Student Health Working Group",
    creatorRole: "specialist",
    originalSource: "American Academy of Ophthalmology (AAO) & WHO Eye Care Guidance",
    license: "CC-BY-4.0",
    publicationDate: "2026-02-10",
    lastReviewedDate: "2026-10-15",
    reviewIntervalDays: 90,
    version: 2,
    maintenanceStatus: "healthy",
    accessibilityStatus: {
      hasAudio: true,
      hasScreenReaderFormatted: true,
      hasSimplifiedText: true,
      hasDiagramAltText: true,
      hasCaptions: true,
    },
    languagesAvailable: ["en", "ar"],
    pendingCorrectionCount: 0,
    knownLimitations: [
      "Educational guidance on the 20-20-20 rule and ambient lighting; does not replace pediatric ophthalmologist refraction exams.",
    ],
    contentSummary:
      "Evidence-based guide to avoiding digital eye strain, optimizing study monitor distance (50-65 cm), and recognizing early refractive warnings.",
    fullContent:
      "Digital eye strain occurs when blink rates drop by up to 50% during close device study. Practice the 20-20-20 rule: every 20 minutes, gaze at an object 20 feet (6 meters) away for 20 seconds. Ensure room ambient light equals screen brightness.",
    targetAudience: "Students in Grades 6–12, educators, and guardians.",
    versionHistory: [
      {
        version: 1,
        date: "2026-02-10",
        changeSummary: "Initial publication with WHO eye health citations.",
        reviewerName: "Dr. A. Al-Hajji (Public Health Reviewer)",
      },
      {
        version: 2,
        date: "2026-10-15",
        changeSummary: "Added 20-20-20 audio reminder track and Arabic diagram alt-text.",
        reviewerName: "M. Al-Kandari (Accessibility Coordinator)",
      },
    ],
    correctionReports: [],
  },
  {
    id: "ubr_dig_phishing_defense",
    title: "Student Defensive Phishing & Account Shielding Guide",
    titleAr: "دليل الطالب لتحصين الحسابات والتصدي للتصيد الرقمي",
    systemKind: "digital_protection",
    lifecycleState: "active_maintenance",
    creatorName: "NEXORA Cyber Literacy Guild",
    creatorRole: "educator",
    originalSource: "CISA Cybersecurity Basics & OWASP Digital Hygiene",
    license: "NEXORA-OER-FREE",
    publicationDate: "2026-03-01",
    lastReviewedDate: "2026-11-01",
    reviewIntervalDays: 120,
    version: 3,
    maintenanceStatus: "healthy",
    accessibilityStatus: {
      hasAudio: true,
      hasScreenReaderFormatted: true,
      hasSimplifiedText: true,
      hasDiagramAltText: true,
      hasCaptions: false,
    },
    languagesAvailable: ["en", "ar"],
    pendingCorrectionCount: 0,
    knownLimitations: [
      "Focuses on non-custodial student personal safety; school-managed enterprise domain accounts may require IT admin policies.",
    ],
    contentSummary:
      "Defensive guide to identifying spoofed sender domains, avoiding credential harvesting portals, and securing recovery options with multi-factor authentication.",
    fullContent:
      "Never enter passwords into links opened directly from SMS or direct messages. Always examine the root domain (example.com vs example-login.com). Enable passkeys or app-based authenticator codes instead of SMS.",
    targetAudience: "Secondary school students, first-time laptop and phone users.",
    versionHistory: [
      {
        version: 1,
        date: "2026-03-01",
        changeSummary: "First release covering SMS smishing and email headers.",
        reviewerName: "R. Sharma (Information Security Educator)",
      },
      {
        version: 2,
        date: "2026-07-12",
        changeSummary: "Updated passkey and FIDO2 authentication standards.",
        reviewerName: "R. Sharma (Information Security Educator)",
      },
      {
        version: 3,
        date: "2026-11-01",
        changeSummary: "Added QR-code quishing scenarios and bilingual check cards.",
        reviewerName: "S. Al-Mutawa (Curriculum Reviewer)",
      },
    ],
    correctionReports: [],
  },
  {
    id: "ubr_earth_water_audit",
    title: "Household Water Footprint & Greywater Conservation Protocol",
    titleAr: "بروتوكول تدقيق وترشيد استهلاك المياه المنزلي",
    systemKind: "earth_care",
    lifecycleState: "published",
    creatorName: "NEXORA EcoStewardship Circle",
    creatorRole: "student",
    originalSource: "UN Water World Water Development Report & Kuwait Water Association Guidelines",
    license: "CC-BY-4.0",
    publicationDate: "2026-04-18",
    lastReviewedDate: "2026-09-25",
    reviewIntervalDays: 180,
    version: 1,
    maintenanceStatus: "healthy",
    accessibilityStatus: {
      hasAudio: false,
      hasScreenReaderFormatted: true,
      hasSimplifiedText: true,
      hasDiagramAltText: true,
      hasCaptions: false,
    },
    languagesAvailable: ["en", "ar"],
    pendingCorrectionCount: 0,
    knownLimitations: [
      "Provides measurable flow-rate measurement and aerator testing methods; structural plumbing repairs require adult certified technicians.",
    ],
    contentSummary:
      "A hands-on protocol teaching students how to measure faucet flow rates (liters per minute) using a calibrated container and evaluate conservation impact without invented claims.",
    fullContent:
      "A standard unregulated tap dispenses 10–12 liters per minute. Installing an inexpensive 4 L/min aerator reduces water consumption by over 50% without diminishing water pressure. Students record baseline flow before and after installation over 14 days.",
    targetAudience: "Middle and high school science classes, family eco-projects.",
    versionHistory: [
      {
        version: 1,
        date: "2026-04-18",
        changeSummary:
          "Published with verified flow calculation formulas and adult supervision clauses.",
        reviewerName: "Eng. F. Al-Saleh (Environmental Engineer)",
      },
    ],
    correctionReports: [],
  },
  {
    id: "ubr_life_heat_firstaid",
    title: "Arid Climate Heat Exhaustion Recognition & First-Aid Principles",
    titleAr: "التعرف على الإجهاد الحراري في البيئات الصحراوية وإسعافاته الأولية",
    systemKind: "life_saving",
    lifecycleState: "published",
    creatorName: "NEXORA Emergency Preparedness Panel",
    creatorRole: "specialist",
    originalSource: "Kuwait Ministry of Health & International Federation of Red Cross (IFRC)",
    license: "Attribution-Reference-Only",
    publicationDate: "2026-05-01",
    lastReviewedDate: "2026-10-30",
    reviewIntervalDays: 60,
    version: 2,
    maintenanceStatus: "healthy",
    accessibilityStatus: {
      hasAudio: true,
      hasScreenReaderFormatted: true,
      hasSimplifiedText: true,
      hasDiagramAltText: true,
      hasCaptions: true,
    },
    languagesAvailable: ["en", "ar"],
    pendingCorrectionCount: 0,
    knownLimitations: [
      "STRICT FIRST-AID NOTICE: Reading this guide does NOT replace certified Red Cross/Crescent training. Heatstroke (confusion, cessation of sweating, hot dry skin) is an immediate medical emergency requiring calling 112 / 999.",
    ],
    contentSummary:
      "Clear distinction between heat exhaustion (cool/moist skin, dizziness, nausea) and life-threatening heatstroke (confusion, hot dry skin, loss of consciousness). Immediate cooling protocols.",
    fullContent:
      "For heat exhaustion: Move immediately to shade or an air-conditioned room. Loosen restrictive clothing. Apply cool damp cloths to neck and underarms. Sip cool water slowly if fully conscious. If vomiting, confusion, or fainting occurs, call 112 / 999 / 911 immediately.",
    targetAudience: "Physical education teachers, student athletes, outdoor community volunteers.",
    versionHistory: [
      {
        version: 1,
        date: "2026-05-01",
        changeSummary: "First release with IFRC heat guidelines.",
        reviewerName: "Paramedic H. Othman (Licensed First-Aid Instructor)",
      },
      {
        version: 2,
        date: "2026-10-30",
        changeSummary:
          "Emphasized critical escalation difference between heat exhaustion and heatstroke.",
        reviewerName: "Paramedic H. Othman (Licensed First-Aid Instructor)",
      },
    ],
    correctionReports: [],
  },
  {
    id: "ubr_tools_wcag_contrast",
    title: "Accessible Color Contrast & Readability Validator Utility",
    titleAr: "أداة تدقيق تباين الألوان ومعايير القراءة الميسرة",
    systemKind: "open_tools",
    lifecycleState: "active_maintenance",
    creatorName: "NEXORA Accessibility Engineering Guild",
    creatorRole: "educator",
    originalSource: "W3C Web Content Accessibility Guidelines (WCAG) 2.2 AA/AAA Algorithms",
    license: "MIT",
    publicationDate: "2026-06-15",
    lastReviewedDate: "2026-11-05",
    reviewIntervalDays: 180,
    version: 2,
    maintenanceStatus: "healthy",
    accessibilityStatus: {
      hasAudio: false,
      hasScreenReaderFormatted: true,
      hasSimplifiedText: true,
      hasDiagramAltText: true,
      hasCaptions: false,
    },
    languagesAvailable: ["en", "ar"],
    pendingCorrectionCount: 0,
    knownLimitations: [
      "Calculates mathematical relative luminance contrast ratios (1:1 to 21:1); subjective color blindness simulation requires multi-spectrum perceptual review.",
    ],
    contentSummary:
      "Open-source mathematical utility computing WCAG contrast ratios between text and background colors with real-time pass/fail indicators for AA (4.5:1) and AAA (7:1).",
    fullContent:
      "Relative luminance is calculated by linearizing sRGB color channels. Text readability depends on sufficient contrast against surrounding cards. This tool helps student designers build accessible study resources.",
    targetAudience: "Student developers, visual aid creators, digital graphic designers.",
    versionHistory: [
      {
        version: 1,
        date: "2026-06-15",
        changeSummary: "Initial MIT-licensed release with W3C formula verification.",
        reviewerName: "T. Vance (Front-End Accessibility Engineer)",
      },
    ],
    correctionReports: [],
  },
  {
    id: "ubr_truth_lateral_reading",
    title: "Lateral Reading & Primary Source Verification Framework",
    titleAr: "منهجية القراءة الجانبية والتحقق من المصادر الأولية",
    systemKind: "truth_defender",
    lifecycleState: "published",
    creatorName: "NEXORA Information Integrity Fellowship",
    creatorRole: "specialist",
    originalSource: "Stanford History Education Group (SHEG) Civic Online Reasoning Project",
    license: "CC-BY-SA-4.0",
    publicationDate: "2026-07-01",
    lastReviewedDate: "2026-10-20",
    reviewIntervalDays: 180,
    version: 1,
    maintenanceStatus: "healthy",
    accessibilityStatus: {
      hasAudio: true,
      hasScreenReaderFormatted: true,
      hasSimplifiedText: true,
      hasDiagramAltText: true,
      hasCaptions: false,
    },
    languagesAvailable: ["en", "ar"],
    pendingCorrectionCount: 0,
    knownLimitations: [
      "Focuses on civic online literacy and factual claim deconstruction; does not make infallible declarations on contested historical interpretations.",
    ],
    contentSummary:
      "Teaches students how professional fact-checkers navigate unfamiliar claims: opening new tabs to evaluate who stands behind the information before reading deeply.",
    fullContent:
      "Do not spend time evaluating an unfamiliar site based solely on its own 'About Us' page. Open a new tab and search what independent peers, academic institutions, and regulatory registries say about the publisher.",
    targetAudience: "Middle and high school students, debaters, science fair researchers.",
    versionHistory: [
      {
        version: 1,
        date: "2026-07-01",
        changeSummary: "Initial publication with 6 interactive fallacy exercises.",
        reviewerName: "Prof. E. Weinberger (Information Ethics Advisor)",
      },
    ],
    correctionReports: [],
  },
  {
    id: "ubr_islamic_character_honesty",
    title: "Truthfulness & Integrity in Speech (الصدق وحفظ اللسان)",
    titleAr: "الصدق وحفظ اللسان والأمانة العلمية في الإسلام",
    systemKind: "islamic_beneficial",
    lifecycleState: "published",
    creatorName: "NEXORA Islamic Heritage Education Team",
    creatorRole: "specialist",
    originalSource:
      "Holy Quran (Surah At-Tawbah 9:119) & Sahih al-Bukhari #6094 / Sahih Muslim #2607",
    license: "CC-BY-4.0",
    publicationDate: "2026-08-01",
    lastReviewedDate: "2026-11-10",
    reviewIntervalDays: 180,
    version: 1,
    maintenanceStatus: "healthy",
    accessibilityStatus: {
      hasAudio: true,
      hasScreenReaderFormatted: true,
      hasSimplifiedText: true,
      hasDiagramAltText: false,
      hasCaptions: false,
    },
    languagesAvailable: ["en", "ar"],
    pendingCorrectionCount: 0,
    knownLimitations: [
      "Educational study module on Islamic character and scholarly attribution; strictly non-fatwa and never calculates divine reward or scores worship.",
    ],
    contentSummary:
      "A guided character lesson on truthfulness in speech, academic integrity, avoiding hearsay, and the Prophet's ﷺ teaching that truthfulness leads to righteousness.",
    fullContent:
      "Allah commands: «يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ» (التوبة: 119). The Prophet ﷺ said: «عَلَيْكُمْ بِالصِّدْقِ، فَإِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ، وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ» (متفق عليه). Students reflect on quoting sources accurately and avoiding exaggeration.",
    targetAudience: "All learners, youth study circles, family reflection sessions.",
    versionHistory: [
      {
        version: 1,
        date: "2026-08-01",
        changeSummary:
          "Published with full Hadith chain citations (Muttafaq 'Alayh) and sincerity notice.",
        reviewerName: "Sheikh T. Al-Ghanim (Islamic Studies Specialist)",
      },
    ],
    correctionReports: [],
  },
];

// ============================================================================
// 13. HEALTH AWARENESS TOPICS (15 Domains)
// ============================================================================

export const INITIAL_HEALTH_TOPICS: HealthTopicRecord[] = [
  {
    id: "hlt_vision",
    domain: "vision_eye",
    title: "Vision Health & Screen Ergonomics",
    titleAr: "صحة العين والرؤية وبيئة الشاشات",
    beginnerExplanation:
      "When we look at phones or laptops for hours without breaks, our eyes blink less often, causing dry eyes and blurry vision. Taking short breaks keeps your eye muscles relaxed and healthy.",
    detailedExplanation:
      "Prolonged near-work viewing causes accommodative spasm and dry eye syndrome due to decreased spontaneous blink rates. Following the 20-20-20 rule relieves ciliary muscle tension and prevents progressive asthenopia.",
    commonMisconceptions: [
      "Myth: Reading in dim light permanently damages vision. (Reality: It causes temporary fatigue and eye strain, but not permanent physiological damage.)",
      "Myth: Blue light glasses eliminate all screen fatigue. (Reality: Regular screen breaks and proper distance are significantly more clinically effective.)",
    ],
    lifestyleChecklist: [
      "Keep screens at 50–65 cm (arm's length) from your eyes.",
      "Position top of monitor at or slightly below eye level.",
      "Use the 20-20-20 rule during study sessions.",
      "Ensure room ambient light balances screen brightness.",
    ],
    whenToConsultDoctor: [
      "Persistent headaches during reading or study.",
      "Squinting to see classroom whiteboards clearly.",
      "Eye pain, redness that persists beyond 24 hours, or sudden double vision.",
    ],
    emergencyWarningSigns: [
      "Sudden loss of vision in one or both eyes.",
      "Eye trauma involving foreign objects or chemical splashes (rinse with clean water and call 112/999).",
      "Seeing sudden bright flashes of light or dark curtains across vision.",
    ],
    trustedReferences: [
      { name: "American Academy of Ophthalmology (AAO)", updateDate: "2026-04" },
      { name: "World Health Organization — World Report on Vision", updateDate: "2025-10" },
    ],
    glossary: [
      {
        term: "Asthenopia",
        termAr: "إجهاد العين",
        definition: "Eye fatigue resulting from prolonged focus or uncorrected refractive error.",
        simpleExplanation: "Tired, sore eyes from staring closely for too long.",
      },
      {
        term: "20-20-20 Rule",
        termAr: "قاعدة 20-20-20",
        definition: "Looking at an object 20 feet away for 20 seconds every 20 minutes.",
        simpleExplanation: "A 20-second break every 20 minutes to rest your eye muscles.",
      },
    ],
    faqs: [
      {
        question: "How far should my laptop screen be?",
        questionAr: "ما المسافة المناسبة بين العين وشاشة الحاسوب؟",
        answer:
          "Approximately 50 to 65 centimeters (about an arm's length) with the screen angled slightly down.",
      },
    ],
    lastClinicalReviewDate: "2026-10-15",
    clinicalReviewer: "Dr. A. Al-Hajji (Public Health Reviewer)",
    limitationsNotice:
      "Educational overview; does not replace pediatric or adult clinical eye examinations.",
  },
  {
    id: "hlt_sleep",
    domain: "sleep",
    title: "Sleep Architecture & Memory Consolidation",
    titleAr: "بنية النوم وتثبيت الذاكرة والتعلم",
    beginnerExplanation:
      "Sleep is not just resting; it is when your brain organizes what you studied today, moves facts into long-term memory, and cleans out waste products.",
    detailedExplanation:
      "Sleep cycles alternate between non-REM (slow-wave sleep) and REM sleep. Slow-wave sleep facilitates declarative memory consolidation (facts, vocabulary), while REM strengthens procedural and problem-solving connections. Adolescents require 8 to 10 hours for optimal cognitive performance.",
    commonMisconceptions: [
      "Myth: You can pull an all-nighter before an exam and make up for it over the weekend. (Reality: Sacrificing sleep impairs memory recall and critical reasoning far more than extra study hours can compensate.)",
      "Myth: Staying in bed staring at your phone helps you fall asleep. (Reality: Screen blue light suppresses melatonin release and delays circadian phase.)",
    ],
    lifestyleChecklist: [
      "Maintain consistent sleep and wake times, even on weekends.",
      "Avoid caffeine or energy drinks within 6 hours of bedtime.",
      "Stop looking at screens 30–60 minutes before sleeping.",
      "Keep bedroom temperature cool and dark.",
    ],
    whenToConsultDoctor: [
      "Chronic inability to fall asleep within 45 minutes for more than a month.",
      "Excessive daytime sleepiness despite spending 9 hours in bed.",
      "Loud snoring accompanied by waking up gasping for air.",
    ],
    emergencyWarningSigns: [
      "Falling asleep involuntarily while operating a vehicle or bicycle.",
      "Severe confusion or hallucinations caused by acute prolonged sleep deprivation.",
    ],
    trustedReferences: [
      { name: "National Sleep Foundation (NSF) Consensus Guidelines", updateDate: "2026-03" },
      { name: "CDC Sleep and Health Division", updateDate: "2025-11" },
    ],
    glossary: [
      {
        term: "Circadian Rhythm",
        termAr: "الساعة البيولوجية",
        definition: "The 24-hour internal biological clock regulating sleepiness and alertness.",
        simpleExplanation: "Your body's natural timer for sleeping and waking.",
      },
    ],
    faqs: [
      {
        question: "How much sleep do teenage students need?",
        questionAr: "كم ساعة نوم يحتاجها الطالب المراهق؟",
        answer:
          "Clinical consensus recommends 8 to 10 hours per night for healthy development and memory consolidation.",
      },
    ],
    lastClinicalReviewDate: "2026-09-18",
    clinicalReviewer: "Dr. L. Al-Bader (Pediatric Sleep Specialist)",
    limitationsNotice:
      "Educational wellness guide; clinical insomnia requires physician consultation.",
  },
  {
    id: "hlt_nutrition",
    domain: "nutrition",
    title: "Balanced Brain Nutrition & Hydration for Study",
    titleAr: "التغذية المتوازنة وصحة الدماغ والتروية للطلبة",
    beginnerExplanation:
      "Your brain uses about 20% of your body's energy. Eating steady whole grains, healthy proteins, fruits, and drinking plenty of water prevents study crashes.",
    detailedExplanation:
      "Complex carbohydrates provide a steady glucose supply to neural synapses, preventing the sharp glycemic spikes and subsequent reactive hypoglycemia caused by sugary energy drinks. Dehydration of just 1-2% body weight significantly diminishes attention span and working memory.",
    commonMisconceptions: [
      "Myth: Energy drinks improve long-term study performance. (Reality: High sugar and caffeine lead to rapid jitters, heart palpitations, and severe energy crashes.)",
      "Myth: Skipping breakfast boosts alertness. (Reality: Overnight fasting leaves glycogen stores depleted, lowering morning concentration.)",
    ],
    lifestyleChecklist: [
      "Start the day with protein and complex carbs (e.g. eggs, oats, whole wheat).",
      "Drink water regularly throughout study periods (aim for pale yellow urine).",
      "Snack on nuts, fruit, or yogurt instead of processed candy.",
      "Limit caffeinated drinks to moderate morning hours.",
    ],
    whenToConsultDoctor: [
      "Rapid unexplained weight loss or gain.",
      "Extreme fatigue, dizziness upon standing, or suspected iron deficiency.",
      "Digestive pain consistently following everyday meals.",
    ],
    emergencyWarningSigns: [
      "Severe allergic reaction (swelling of lips, tongue, or difficulty breathing) — call 112/999 immediately.",
      "Signs of diabetic ketoacidosis (extreme thirst, sweet-smelling breath, vomiting, confusion).",
    ],
    trustedReferences: [
      { name: "WHO Healthy Diet Fact Sheet", updateDate: "2026-01" },
      {
        name: "Harvard T.H. Chan School of Public Health — Nutrition Source",
        updateDate: "2025-12",
      },
    ],
    glossary: [
      {
        term: "Glycemic Index",
        termAr: "مؤشر السكر في الدم",
        definition:
          "A rating system for foods showing how quickly each food affects blood glucose levels.",
        simpleExplanation: "A measure of how fast a food turns into sugar in your blood.",
      },
    ],
    faqs: [
      {
        question: "Are energy drinks safe for studying?",
        questionAr: "هل مشروبات الطاقة آمنة أثناء المذاكرة؟",
        answer:
          "Pediatricians and public health authorities strongly advise adolescents against energy drinks due to cardiac and sleep risks.",
      },
    ],
    lastClinicalReviewDate: "2026-10-02",
    clinicalReviewer: "Dr. K. Mahmoud (Clinical Nutritionist)",
    limitationsNotice:
      "Educational nutritional literacy; dietary allergies or clinical eating disorders require specialist medical care.",
  },
  {
    id: "hlt_mental_wellbeing",
    domain: "mental_wellbeing",
    title: "Academic Stress Management & Emotional Balance",
    titleAr: "إدارة الضغوط الدراسية والتوازن النفسي",
    beginnerExplanation:
      "Feeling nervous before an exam is normal. Learning healthy breathing, breaking tasks into small steps, and talking to someone you trust helps you stay calm and focused.",
    detailedExplanation:
      "The sympathetic nervous system activates under exam stress (fight-or-flight), elevating cortisol and heart rate. Slow diaphragmatic breathing (4-second inhale, 6-second exhale) activates the vagus nerve and parasympathetic system, restoring prefrontal cortex executive functioning.",
    commonMisconceptions: [
      "Myth: Strong students never feel anxious or stressed. (Reality: Everyone experiences stress; resilience is about using healthy coping strategies rather than suppressing emotions.)",
      "Myth: Asking for emotional support is a sign of weakness. (Reality: Reaching out to a counselor, parent, or trusted elder is an evidence-based sign of maturity and strength.)",
    ],
    lifestyleChecklist: [
      "Practice 3 minutes of slow diaphragmatic breathing when feeling overwhelmed.",
      "Break intimidating study projects into single 20-minute action blocks.",
      "Spend time outside in natural sunlight daily.",
      "Speak to a school counselor, parent, or friend when pressure builds.",
    ],
    whenToConsultDoctor: [
      "Persistent low mood, loss of interest in activities, or feelings of hopelessness lasting more than 2 weeks.",
      "Panic attacks accompanied by chest tightness and hyperventilation.",
      "Difficulty functioning in daily life due to anxiety.",
    ],
    emergencyWarningSigns: [
      "Any thoughts of self-harm, ending one's life, or giving up — reach out immediately to 24/7 confidential crisis helplines (https://findahelpline.com, text HOME to 741741, call 988, or local emergency services).",
    ],
    trustedReferences: [
      { name: "World Health Organization — Mental Health of Adolescents", updateDate: "2026-02" },
      { name: "National Institute of Mental Health (NIMH)", updateDate: "2025-10" },
    ],
    glossary: [
      {
        term: "Diaphragmatic Breathing",
        termAr: "التنفس البطني العميق",
        definition:
          "Deep breathing that engages the diaphragm, slowing the heart rate and reducing stress hormones.",
        simpleExplanation: "Belly breathing that signals your nervous system to calm down.",
      },
    ],
    faqs: [
      {
        question: "What should I do during an exam panic moment?",
        questionAr: "ماذا أفعل إذا شعرت بالارتباك أثناء الامتحان؟",
        answer:
          "Put down your pen, sit straight with feet flat on the floor, take three slow deep breaths exhaling longer than you inhale, and read the easiest question first.",
      },
    ],
    lastClinicalReviewDate: "2026-10-18",
    clinicalReviewer: "Dr. N. Al-Mutawa (Adolescent Psychologist)",
    limitationsNotice:
      "Educational support only. For acute crisis or clinical psychiatric conditions, contact emergency helplines or licensed professionals.",
  },
  {
    id: "hlt_hygiene_prevention",
    domain: "hygiene_prevention",
    title: "Respiratory Hygiene & Infection Prevention in Schools",
    titleAr: "الوقاية من العدوى التنفسية والنظافة الشخصية في المدارس",
    beginnerExplanation:
      "Washing your hands with soap for 20 seconds and covering coughs with your elbow stops viruses from spreading to your classmates and family.",
    detailedExplanation:
      "Pathogenic viruses and bacteria spread via respiratory aerosols and contaminated fomite surfaces. Hand washing with surfactant soap disrupts lipid membranes of enveloped viruses. Staying home when febrile prevents school outbreaks.",
    commonMisconceptions: [
      "Myth: Antibiotics cure common colds and flu. (Reality: Colds and flu are viral; antibiotics only treat bacterial infections and overuse leads to antimicrobial resistance.)",
      "Myth: A quick 3-second hand rinse cleans off germs. (Reality: Surfactant action requires 20 full seconds of friction across palms, backs of hands, and fingertips.)",
    ],
    lifestyleChecklist: [
      "Wash hands with soap for 20 seconds before eating and after using the restroom.",
      "Cough or sneeze into your inner elbow, never into your bare hands.",
      "Avoid touching your eyes, nose, or mouth with unwashed hands.",
      "Stay home if you have a fever (38°C / 100.4°F or higher) until fever-free for 24 hours.",
    ],
    whenToConsultDoctor: [
      "Fever lasting more than 3 consecutive days.",
      "Difficulty breathing, chest wheezing, or persistent productive cough.",
      "Signs of dehydration (dry mouth, dark urine, lethargy).",
    ],
    emergencyWarningSigns: [
      "Severe respiratory distress (stridor, blue lips, gasping for breath) — call 112/999 immediately.",
      "High fever accompanied by a non-blanching rash and stiff neck (suspected meningitis).",
    ],
    trustedReferences: [
      { name: "CDC Handwashing & Cleanliness Guidelines", updateDate: "2026-01" },
      { name: "WHO Infection Prevention and Control (IPC)", updateDate: "2025-09" },
    ],
    glossary: [
      {
        term: "Antimicrobial Resistance",
        termAr: "مقاومة المضادات الحيوية",
        definition:
          "When bacteria evolve to withstand the medications designed to kill them, usually driven by antibiotic overuse.",
        simpleExplanation:
          "Germs becoming immune to medicines because of unnecessary antibiotic use.",
      },
    ],
    faqs: [
      {
        question: "Can I take antibiotics for a cold?",
        questionAr: "هل يفيد المضاد الحيوي في علاج نزلات البرد؟",
        answer:
          "No. Colds are caused by viruses. Antibiotics only treat bacteria and taking them for viral colds is ineffective and harmful.",
      },
    ],
    lastClinicalReviewDate: "2026-08-14",
    clinicalReviewer: "Dr. S. Al-Enezi (Infectious Disease Specialist)",
    limitationsNotice:
      "Educational hygiene facts; fevers and respiratory infections require clinical evaluation by a licensed physician.",
  },
  {
    id: "hlt_brain_nervous",
    domain: "brain_nervous",
    title: "Brain Health, Focus & Cognitive Recovery",
    titleAr: "صحة الدماغ والجهاز العصبي والتركيز",
    beginnerExplanation:
      "Your brain works best when you alternate intense study blocks with quiet physical breaks, hydration, and sufficient rest.",
    detailedExplanation:
      "Neuroplasticity—the strengthening of synaptic connections during learning—depends heavily on alternating focused attention with diffuse rest periods, regular aerobic exercise (which increases BDNF), and avoiding chronic stress overload.",
    commonMisconceptions: [
      "Myth: Multitasking between homework and social chat makes studying faster. (Reality: Attention residue from task-switching lowers comprehension and increases study errors.)",
    ],
    lifestyleChecklist: [
      "Take a 5-minute movement break after every 25–40 minutes of concentrated study.",
      "Silence non-essential phone notifications during deep reading.",
      "Engage in moderate physical activity for at least 30 minutes daily.",
    ],
    whenToConsultDoctor: [
      "Frequent severe migraines accompanied by nausea or light sensitivity.",
      "Sudden unexplained dizziness, numbness, or persistent memory gaps.",
    ],
    emergencyWarningSigns: [
      "Sudden facial drooping, arm weakness, or slurred speech (FAST stroke signs) — call 112/999 immediately.",
      "Head injury followed by loss of consciousness, vomiting, or confusion.",
    ],
    trustedReferences: [
      {
        name: "National Institute of Neurological Disorders and Stroke (NINDS)",
        updateDate: "2026-02",
      },
      { name: "WHO Brain Health Technical Brief", updateDate: "2025-11" },
    ],
    glossary: [
      {
        term: "Neuroplasticity",
        termAr: "المرونة العصبية",
        definition:
          "The brain's ability to reorganize itself by forming new neural connections throughout life.",
        simpleExplanation:
          "How your brain physically rewires and gets stronger when you practice a skill.",
      },
    ],
    faqs: [
      {
        question: "Why do short breaks help memory?",
        questionAr: "لماذا تساعد الاستراحات القصيرة في تقوية الذاكرة؟",
        answer:
          "Quiet breaks allow the hippocampus to replay and stabilize newly learned neural patterns.",
      },
    ],
    lastClinicalReviewDate: "2026-10-10",
    clinicalReviewer: "Dr. F. Al-Sabah (Neurology Consultant)",
    limitationsNotice:
      "Educational neurology literacy; headaches or neurological symptoms require clinical evaluation.",
  },
  {
    id: "hlt_heart_cardiovascular",
    domain: "heart_cardiovascular",
    title: "Cardiovascular Fitness & Active Living",
    titleAr: "صحة القلب والأوعية الدموية واللياقة",
    beginnerExplanation:
      "Regular walking, sports, and limiting ultra-processed salty foods keep your heart muscle strong and your energy steady.",
    detailedExplanation:
      "Aerobic exercise strengthens myocardial stroke volume, lowers resting heart rate, and improves endothelial vascular health. WHO recommends at least 60 minutes per day of moderate-to-vigorous activity for adolescents.",
    commonMisconceptions: [
      "Myth: Heart health only matters for older adults. (Reality: Vascular habits formed in youth shape lifelong cardiovascular resilience.)",
    ],
    lifestyleChecklist: [
      "Accumulate 60 minutes of walking, cycling, or sports daily.",
      "Limit sugary beverages and ultra-processed high-sodium snacks.",
      "Avoid all tobacco and vaping products.",
    ],
    whenToConsultDoctor: [
      "Shortness of breath during mild everyday stairs or light walking.",
      "Frequent heart palpitations or fainting spells during physical activity.",
    ],
    emergencyWarningSigns: [
      "Crushing chest pain, tightness, or pain radiating to the jaw or left arm — call 112/999 immediately.",
      "Sudden collapse or unresponsiveness.",
    ],
    trustedReferences: [
      { name: "American Heart Association (AHA) Youth Guidelines", updateDate: "2026-01" },
      { name: "WHO Physical Activity Fact Sheet", updateDate: "2025-12" },
    ],
    glossary: [
      {
        term: "Resting Heart Rate",
        termAr: "معدل نبض الراحة",
        definition: "Number of times your heart beats per minute while completely at rest.",
        simpleExplanation: "How fast your heart beats when you are sitting calmly.",
      },
    ],
    faqs: [],
    lastClinicalReviewDate: "2026-09-25",
    clinicalReviewer: "Dr. M. Al-Kandari (Preventive Cardiology)",
    limitationsNotice:
      "Educational cardiovascular overview; chest symptoms require urgent clinical care.",
  },
  {
    id: "hlt_respiratory",
    domain: "respiratory",
    title: "Respiratory Wellness & Clean Indoor Air",
    titleAr: "صحة الجهاز التنفسي وجودة الهواء",
    beginnerExplanation:
      "Clean, dust-free air and avoiding smoke help your lungs deliver oxygen efficiently to your muscles and brain.",
    detailedExplanation:
      "Healthy alveolar gas exchange relies on uninflamed airways. Indoor dust, secondhand tobacco smoke, aerosolized chemical sprays, and e-cigarette vapor irritate bronchial cilia and trigger reactive airway inflammation.",
    commonMisconceptions: [
      "Myth: Flavored vaping aerosols are harmless water vapor. (Reality: Vaping liquids release ultrafine particulates, heavy metals, and lung-damaging aldehydes.)",
    ],
    lifestyleChecklist: [
      "Open study room windows periodically for fresh air circulation.",
      "Keep away from cigarette smoke, shisha smoke, and vaping aerosols.",
      "Practice dust control during regional dust storms by staying indoors with closed windows.",
    ],
    whenToConsultDoctor: [
      "Wheezing, whistling breath sounds, or chronic cough lasting more than 2 weeks.",
      "Nighttime coughing that wakes you from sleep.",
    ],
    emergencyWarningSigns: [
      "Inability to speak full sentences due to breathlessness, bluish lips, or chest retractions — call 112/999 immediately.",
    ],
    trustedReferences: [
      { name: "NHS Respiratory Health & Asthma Guidance", updateDate: "2026-03" },
      { name: "WHO Air Quality and Health", updateDate: "2025-10" },
    ],
    glossary: [
      {
        term: "Bronchodilation",
        termAr: "توسع الشعب الهوائية",
        definition: "Relaxation and widening of the airways in the lungs allowing easier airflow.",
        simpleExplanation: "Opening up the breathing tubes so air flows smoothly.",
      },
    ],
    faqs: [],
    lastClinicalReviewDate: "2026-09-10",
    clinicalReviewer: "Dr. R. Al-Mansour (Pulmonology Reviewer)",
    limitationsNotice:
      "Educational respiratory awareness; asthma management plans require a physician.",
  },
  {
    id: "hlt_digestive",
    domain: "digestive",
    title: "Digestive Comfort, Fiber & Meal Rhythm",
    titleAr: "صحة الجهاز الهضمي والألياف الغذائية",
    beginnerExplanation:
      "Eating slowly, chewing well, and including fiber from vegetables and fruits keeps your stomach comfortable and steady.",
    detailedExplanation:
      "Dietary soluble and insoluble fiber nourishes beneficial gut microbiota and maintains normal intestinal motility. Adequate water intake is essential for fiber to function comfortably without constipation.",
    commonMisconceptions: [
      "Myth: Skipping lunch helps you focus better in afternoon classes. (Reality: Regular balanced meals prevent gastric acidity and blood glucose dips.)",
    ],
    lifestyleChecklist: [
      "Eat whole fruits, vegetables, legumes, and whole grains daily.",
      "Drink water steadily rather than gulping carbonated sodas with meals.",
      "Sit calmly while eating and avoid rushing.",
    ],
    whenToConsultDoctor: [
      "Persistent abdominal pain, unexplained nausea, or chronic heartburn.",
      "Sudden change in bowel habits or blood in stool.",
    ],
    emergencyWarningSigns: [
      "Severe, sharp abdominal pain localized to the lower right side accompanied by fever and vomiting — seek emergency evaluation immediately.",
    ],
    trustedReferences: [{ name: "NHS Digestive Health Guidance", updateDate: "2026-01" }],
    glossary: [],
    faqs: [],
    lastClinicalReviewDate: "2026-08-22",
    clinicalReviewer: "Dr. T. Al-Qattan (Gastroenterology Reviewer)",
    limitationsNotice:
      "Educational digestive guidance; acute pain requires prompt physician evaluation.",
  },
  {
    id: "hlt_oral",
    domain: "oral",
    title: "Oral & Dental Hygiene Foundations",
    titleAr: "صحة الفم والأسنان والعناية اليومية",
    beginnerExplanation:
      "Brushing gently twice a day with fluoride toothpaste and cleaning between teeth protects your enamel and gums for life.",
    detailedExplanation:
      "Oral bacteria metabolize dietary sugars into organic acids that demineralize tooth enamel, leading to dental caries. Fluoride remineralizes weakened enamel, while daily flossing disrupts interdental plaque biofilms.",
    commonMisconceptions: [
      "Myth: Brushing harder cleans teeth better. (Reality: Aggressive scrubbing wears down protective enamel and irritates gums; gentle circular brushing for 2 minutes is optimal.)",
    ],
    lifestyleChecklist: [
      "Brush gently for 2 minutes twice daily with fluoride toothpaste.",
      "Floss once a day before bedtime.",
      "Rinse with plain water after eating sweet or acidic snacks.",
    ],
    whenToConsultDoctor: [
      "Toothache triggered by hot, cold, or sweet foods.",
      "Bleeding, swollen gums or visible dark spots on teeth.",
    ],
    emergencyWarningSigns: [
      "Facial swelling spreading toward the eye or neck, accompanied by fever or difficulty swallowing — seek urgent dental/medical care.",
    ],
    trustedReferences: [{ name: "WHO Oral Health Fact Sheet", updateDate: "2026-02" }],
    glossary: [],
    faqs: [],
    lastClinicalReviewDate: "2026-09-05",
    clinicalReviewer: "Dr. H. Al-Shatti (Dental Public Health)",
    limitationsNotice:
      "Educational oral hygiene guide; schedule routine checkups with a licensed dentist.",
  },
  {
    id: "hlt_skin",
    domain: "skin",
    title: "Skin Barrier Care & Desert Sun Protection",
    titleAr: "صحة الجلد والوقاية من أشعة الشمس",
    beginnerExplanation:
      "Using mild cleansers, staying hydrated, and protecting your skin from harsh midday sun keeps your skin barrier strong.",
    detailedExplanation:
      "Ultraviolet (UV-A and UV-B) radiation damages dermal collagen and epidermal DNA, especially in sunny climates. Broad-spectrum shade, protective clothing, and SPF 30+ sunscreen prevent sunburn and long-term photodamage.",
    commonMisconceptions: [
      "Myth: Sun protection is only needed at the beach. (Reality: UV exposure accumulates during outdoor school sports and midday walks.)",
    ],
    lifestyleChecklist: [
      "Seek shade during peak UV hours (10 AM to 4 PM).",
      "Use broad-spectrum SPF 30+ sunscreen on exposed skin outdoors.",
      "Use gentle, fragrance-free cleansers and avoid harsh squeezing of blemishes.",
    ],
    whenToConsultDoctor: [
      "New or changing moles (asymmetry, irregular border, color variation, diameter > 6mm).",
      "Persistent rashes, painful cysts, or worsening eczema.",
    ],
    emergencyWarningSigns: [
      "Severe widespread blistering burns or rapidly spreading hives with facial swelling — call 112/999 immediately.",
    ],
    trustedReferences: [{ name: "CDC Sun Safety & Skin Health", updateDate: "2026-03" }],
    glossary: [],
    faqs: [],
    lastClinicalReviewDate: "2026-09-12",
    clinicalReviewer: "Dr. D. Al-Rasheed (Dermatology Reviewer)",
    limitationsNotice:
      "Educational skin protection overview; consult a dermatologist for persistent skin conditions.",
  },
  {
    id: "hlt_wellness",
    domain: "wellness",
    title: "Study Posture, Back Ergonomics & Mobility",
    titleAr: "الوضعية الجسدية السليمة وبيئة الدراسة",
    beginnerExplanation:
      "Sitting with feet flat, back supported, and screen at eye height prevents neck stiffness and lower back aches.",
    detailedExplanation:
      "Forward-head posture ('text neck') increases cervical spine biomechanical load from 5 kg to over 20 kg at a 45-degree tilt. Ergonomic desk alignment combined with hourly standing stretches protects spinal discs.",
    commonMisconceptions: [
      "Myth: One 'perfect' static posture should be held motionless for hours. (Reality: Dynamic movement and frequent posture shifts every 30 minutes are best for spinal nutrition.)",
    ],
    lifestyleChecklist: [
      "Place feet flat on the floor with knees at roughly 90 degrees.",
      "Elevate laptops on books or a stand when reading for long stretches.",
      "Carry backpacks over both shoulders, keeping weight balanced.",
    ],
    whenToConsultDoctor: [
      "Back or neck pain radiating down an arm or leg.",
      "Persistent tingling, numbness, or muscle weakness.",
    ],
    emergencyWarningSigns: [
      "Back pain following a fall or accident, or pain accompanied by sudden loss of limb sensation — seek emergency care immediately.",
    ],
    trustedReferences: [{ name: "NHS Back Care & Ergonomics Advice", updateDate: "2026-01" }],
    glossary: [],
    faqs: [],
    lastClinicalReviewDate: "2026-09-30",
    clinicalReviewer: "Dr. B. Al-Fadhli (Physical Therapy Advisor)",
    limitationsNotice: "Educational ergonomics guide; persistent pain requires medical assessment.",
  },
  {
    id: "hlt_healthy_habits",
    domain: "healthy_habits",
    title: "Sustainable Healthy Habits & Screen Balance",
    titleAr: "بناء العادات الصحية وتوازن وقت الشاشات",
    beginnerExplanation:
      "Small daily routines—drinking water upon waking, stretching, and screen-free family meals—compound into lasting health.",
    detailedExplanation:
      "Habit architecture succeeds through cue-routine clarity and environment design rather than willpower exhaustion. Protecting screen-free meals and bedtime preserves metabolic cues and social bonding.",
    commonMisconceptions: [
      "Myth: You must overhaul your entire routine overnight to get healthy. (Reality: Small, repeatable 1% improvements sustained over months outperform extreme short-lived diets.)",
    ],
    lifestyleChecklist: [
      "Keep a reusable water bottle on your study desk.",
      "Protect screen-free family meals and pre-bedtime wind-down.",
      "Step outdoors for fresh air and sunlight daily.",
    ],
    whenToConsultDoctor: [
      "Feeling unable to stop compulsive digital use when it disrupts sleep, grades, or mood.",
    ],
    emergencyWarningSigns: [
      "Extreme exhaustion, fainting, or dangerous dieting behaviors — seek prompt medical evaluation.",
    ],
    trustedReferences: [{ name: "CDC Healthy Habits Framework", updateDate: "2026-02" }],
    glossary: [],
    faqs: [],
    lastClinicalReviewDate: "2026-10-05",
    clinicalReviewer: "Dr. A. Al-Hajji (Public Health Reviewer)",
    limitationsNotice:
      "Educational lifestyle habit framework; consult professionals for personalized health plans.",
  },
  {
    id: "hlt_age_appropriate",
    domain: "age_appropriate",
    title: "Adolescent Growth, Bone Strength & Development",
    titleAr: "النمو البدني السليم وبناء العظام لليافعين",
    beginnerExplanation:
      "During school years, your bones and muscles grow rapidly—calcium, vitamin D from sunlight, sleep, and movement build lifelong strength.",
    detailedExplanation:
      "Peak bone mass is largely accrued before age 20. Weight-bearing activities (running, jumping, sports) alongside adequate dietary calcium and vitamin D build dense skeletal reserves.",
    commonMisconceptions: [
      "Myth: Heavy unsupervised weightlifting stunts growth without exception; actually, improper uncoached form risks joint injury, whereas guided bodyweight and sport strength training supports bone density.",
    ],
    lifestyleChecklist: [
      "Include calcium-rich foods (milk, yogurt, leafy greens, fortified foods).",
      "Participate in safe, coached weight-bearing sports.",
      "Avoid extreme restrictive diets during active growth spurts.",
    ],
    whenToConsultDoctor: [
      "Persistent joint pain, swelling, or unusual fatigue during normal growth.",
      "Questions regarding normal growth velocity or delayed physical milestones.",
    ],
    emergencyWarningSigns: [
      "Sudden severe bone or joint pain after trauma with inability to bear weight — seek emergency evaluation.",
    ],
    trustedReferences: [{ name: "WHO Adolescent Health & Development", updateDate: "2026-01" }],
    glossary: [],
    faqs: [],
    lastClinicalReviewDate: "2026-09-14",
    clinicalReviewer: "Dr. Y. Al-Otaibi (Pediatric Advisor)",
    limitationsNotice:
      "Educational adolescent growth guidance; concerns should be reviewed by a pediatrician.",
  },
  {
    id: "hlt_preventative_screenings",
    domain: "preventative_screenings",
    title: "Routine Checkups, Vision & Hearing Screenings",
    titleAr: "الفحوصات الدورية الوقائية للنظر والسمع والأسنان",
    beginnerExplanation:
      "Preventative checkups catch small changes in vision, hearing, or nutrition early before they make classroom learning harder.",
    detailedExplanation:
      "Routine primary care visits verify immunization records, evaluate refractive vision changes (myopia screening), check auditory thresholds, and establish baseline growth charts.",
    commonMisconceptions: [
      "Myth: You only visit a doctor or dentist when something hurts. (Reality: Early preventative checks detect silent issues like mild myopia or dental cavities before pain begins.)",
    ],
    lifestyleChecklist: [
      "Schedule annual school-year vision and dental checkups.",
      "Keep personal immunization records up to date with family clinic.",
      "Protect hearing by keeping headphone volume below 60%.",
    ],
    whenToConsultDoctor: [
      "Struggling to hear teachers in noisy rooms or ringing in ears (tinnitus).",
      "Any missed routine health screenings over the past 18 months.",
    ],
    emergencyWarningSigns: [
      "Sudden complete hearing loss in one ear or high fever with confusion — seek urgent medical care.",
    ],
    trustedReferences: [{ name: "CDC Preventative Care Guidelines", updateDate: "2026-02" }],
    glossary: [],
    faqs: [],
    lastClinicalReviewDate: "2026-10-08",
    clinicalReviewer: "Dr. A. Al-Hajji (Public Health Reviewer)",
    limitationsNotice:
      "Educational preventative screening overview; consult your family clinic for schedules.",
  },
];

// ============================================================================
// 14. HUMAN WISDOM ARCHIVE RECORDS
// ============================================================================

export const INITIAL_HUMAN_WISDOM_RECORDS: HumanWisdomRecord[] = [
  {
    id: "wis_mistake_to_mastery",
    category: "lessons_from_mistakes",
    title: "From Exam Failure to Scientific Discovery: Embracing Errors",
    titleAr: "من عثرة الاختبار إلى الشغف العلمي: التعلم من الخطأ",
    contributorAttribution: "Eng. Tariq S. (Mechanical Engineer & Mentor)",
    consentConfirmed: true,
    licensingPermitted: true,
    coreInsight:
      "A failed test is diagnostic data, not a verdict on your intellect. Diagnosing the exact misconception turns confusion into mastery.",
    detailedExperience:
      "In secondary school, I received a 42% on my physics midterm because I memorized formulas without understanding why acceleration changes with net force. My teacher sat down with me and asked me to draw free-body diagrams of a moving bus. Once I visualized the forces, physics transformed from a frightening puzzle into how the universe actually moves. I ended up studying mechanical engineering and graduating with honors.",
    practicalAdviceForYouth: [
      "Never hide or throw away an exam with a low mark; review every red mark with your teacher.",
      "Classify your errors: was it careless reading, missing prerequisite concept, or running out of time?",
      "Solve the exact problem again without looking at the answer key 48 hours later.",
    ],
    topicTags: ["physics", "growth_mindset", "exam_resilience", "engineering"],
    submittedDate: "2026-05-12",
    verifiedByReviewer: "NEXORA Editorial Stewardship",
    preservationStatus: "permanent_archive",
  },
  {
    id: "wis_bilingual_reading",
    category: "practical_life_skill",
    title: "Mastering Arabic and English in Parallel: The Dual Reader Method",
    titleAr: "إتقان القراءة بالعربية والإنجليزية معاً: طريقة القارئ الثنائي",
    contributorAttribution: "Fatima A. (Linguist & Educator)",
    consentConfirmed: true,
    licensingPermitted: true,
    coreInsight:
      "Do not treat your native language as a competitor to English; a deep foundation in Arabic enhances your cognitive ability to acquire foreign vocabulary.",
    detailedExperience:
      "Many students think they must abandon Arabic reading to excel in international English curricula. In reality, linguistic research shows that strong conceptual roots in your mother tongue accelerate second language vocabulary through cognates, morphological pattern awareness, and contextual reasoning. I read 20 pages of Arabic history or literature for every 20 pages of English science, keeping a bilingual concept journal.",
    practicalAdviceForYouth: [
      "Keep a pocket bilingual vocabulary notebook for technical terms.",
      "Practice explaining an English science topic to your family in clear Arabic.",
      "Value classical Arabic eloquence while developing fluent academic English prose.",
    ],
    topicTags: ["languages", "bilingualism", "arabic", "english", "literacy"],
    submittedDate: "2026-06-20",
    verifiedByReviewer: "NEXORA Editorial Stewardship",
    preservationStatus: "permanent_archive",
  },
  {
    id: "wis_vocational_patience",
    category: "practical_life_skill",
    title: "The Carpenter's Rule: Measure Twice, Cut Once in Digital Design",
    titleAr: "قاعدة النجار: قِس مرتين واقطع مرة واحدة في التصميم الرقمي",
    contributorAttribution: "Abu Salem (Craftsman & Community Elder)",
    consentConfirmed: true,
    licensingPermitted: true,
    coreInsight:
      "Rushing into building or coding without thoughtful planning always creates three times more work than taking a calm day to blueprint.",
    detailedExperience:
      "My grandfather taught me carpentry in the old shipyards of Kuwait. He would not let me touch a saw until I had measured the timber, drawn the joint with charcoal, and verified the alignment twice. Years later, when my grandson began learning computer programming, I watched him rush into typing code before planning his data structures, only to get stuck for days. The ancient principle holds true in wood, steel, and code: measure twice, verify your blueprint, and then cut with confidence.",
    practicalAdviceForYouth: [
      "Spend at least 30% of your project time on paper sketches and outlines before opening your laptop.",
      "Check your assumptions with a mentor before spending weeks building the wrong feature.",
      "Humility in preparation is the secret to mastery in execution.",
    ],
    topicTags: ["craftsmanship", "planning", "patience", "intergenerational"],
    submittedDate: "2026-07-04",
    verifiedByReviewer: "NEXORA Editorial Stewardship",
    preservationStatus: "permanent_archive",
  },
];

// ============================================================================
// 15. EARTH CARE CHALLENGES & INCUBATOR PROJECTS
// ============================================================================

export const INITIAL_EARTH_CARE_CHALLENGES: EarthCareChallenge[] = [
  {
    id: "ecc_water_audit",
    domain: "water_conservation",
    title: "Home & School Flow Rate Audit",
    titleAr: "تدقيق معدل تدفق المياه في المنزل والمدرسة",
    problemStatement:
      "Many faucets in schools and homes dispense 12+ liters per minute, wasting clean desalinated water when 4 L/min aerators would provide equal washing efficacy.",
    scientificContext:
      "Desalination in arid coastal regions consumes significant thermal and electrical energy. Conserving water directly reduces regional fossil energy emissions.",
    safeActionSteps: [
      "Use a 1-liter measuring pitcher and a stopwatch.",
      "Open the faucet to full flow for exactly 5 seconds, measure volume collected, and multiply by 12 to find liters/minute.",
      "With adult permission, install a low-flow aerator (cost ~1-2 KWD) and re-measure.",
      "Log baseline vs improved flow rate in your Earth Care journal.",
    ],
    supervisionNeeded: true,
    verifiableMetricLabel: "Liters per minute flow rate reduction",
    estimatedEffortHours: 3,
  },
  {
    id: "ecc_electronic_waste",
    domain: "waste_recycling",
    title: "Safe E-Waste Inventory & Collection Drive",
    titleAr: "حصر وتجميع النفايات الإلكترونية المدرسية بأمان",
    problemStatement:
      "Old batteries, cables, and broken electronic toys contain heavy metals that contaminate municipal landfills if discarded in household trash.",
    scientificContext:
      "Lithium-ion batteries and printed circuit boards contain cobalt, copper, and lead requiring certified industrial recycling facilities.",
    safeActionSteps: [
      "Catalog unneeded cables, dead batteries, and discarded small electronics in your household.",
      "Inspect batteries for swelling or leaks (never handle damaged or leaking batteries).",
      "Coordinate with your school teacher to drop items off at a verified municipal e-waste recycling point.",
    ],
    supervisionNeeded: true,
    verifiableMetricLabel: "Number of electronic items diverted from regular landfill",
    estimatedEffortHours: 4,
  },
  {
    id: "ecc_native_plants",
    domain: "biodiversity_ecosystems",
    title: "Desert Native Plant Biodiversity Mapping",
    titleAr: "توثيق التنوع الحيوي للنباتات الصحراوية المحلية",
    problemStatement:
      "Imported water-thirsty lawn grass depletes municipal irrigation, while drought-resistant indigenous desert flora (Rhanterium, Haloxylon) are overlooked.",
    scientificContext:
      "Native desert shrubs have deep taproot systems and require 80% less water while providing vital micro-habitats for local pollinators and migratory birds.",
    safeActionSteps: [
      "Photograph and identify 3 native desert plants in local gardens or school grounds using botanical guides.",
      "Document irrigation methods and compare their drought resilience with non-native ornamental turf.",
      "Draft an educational recommendation for school garden native planting.",
    ],
    supervisionNeeded: false,
    verifiableMetricLabel: "Native species identified and documented",
    estimatedEffortHours: 5,
  },
];

// ============================================================================
// 16. DIGITAL SAFETY ACADEMY & CHECKLIST
// ============================================================================

export const INITIAL_DIGITAL_SAFETY_LESSONS: DigitalSafetyLesson[] = [
  {
    id: "dsl_passwords_passkeys",
    title: "Passkeys, Passphrases & Password Managers",
    titleAr: "كلمات المرور المركبة ومفاتيح المرور الرقمية (Passkeys)",
    category: "account_security",
    threatExplanation:
      "Reusing the same simple password across multiple websites means a breach on one minor gaming forum exposes your primary email and school portal.",
    defensiveBestPractices: [
      "Use unique, 16+ character passphrases (e.g. 4 random words joined by hyphens).",
      "Adopt modern biometric Passkeys where available (FIDO2 standard).",
      "Never store passwords in plain text files or browser unencrypted notes.",
      "Enable Multi-Factor Authentication (MFA) via an authenticator app.",
    ],
    interactiveScenario: {
      prompt:
        "You receive an urgent email from 'School Support Team' saying your exam portal access will be suspended in 2 hours unless you confirm your password on a provided link. What should you do?",
      choices: [
        {
          text: "Click the link immediately to prevent suspension.",
          isSafe: false,
          explanation:
            "Urgency is the primary psychological trick used in phishing attacks to bypass your critical thinking.",
        },
        {
          text: "Do not click. Open a new browser tab, go to the official school URL directly, and ask your teacher in person.",
          isSafe: true,
          explanation:
            "Independent navigation protects your credentials from spoofed domain clones.",
        },
      ],
    },
  },
  {
    id: "dsl_social_engineering",
    title: "Social Engineering & Impersonation Traps",
    titleAr: "الهندسة الاجتماعية وفخاخ انتحال الشخصية",
    category: "phishing_scams",
    threatExplanation:
      "Attackers impersonate friends, teachers, or gaming buddies asking for 'help receiving a verification code' to take over your account.",
    defensiveBestPractices: [
      "Never forward or share SMS verification codes with ANYONE, even someone claiming to be a friend.",
      "Verify unexpected requests by calling the person directly on voice.",
      "Keep profile privacy settings set to friends/contacts only.",
    ],
    interactiveScenario: {
      prompt:
        "A friend on social media messages: 'Hey, I lost access to my phone, can I send a login code to your number and you send it back to me?'",
      choices: [
        {
          text: "Help them by forwarding the SMS code.",
          isSafe: false,
          explanation:
            "That code is likely the password-reset code for YOUR account, not theirs! Never forward verification codes.",
        },
        {
          text: "Refuse and call your friend directly to check if their account was hacked.",
          isSafe: true,
          explanation:
            "This is a classic account takeover scam. Legitimate recovery never requires an outside friend's phone code.",
        },
      ],
    },
  },
  {
    id: "dsl_misinformation_lateral",
    title: "Lateral Reading & Verifying Viral Headlines",
    titleAr: "القراءة الجانبية والتحقق من العناوين الإخبارية المثيرة",
    category: "lateral_reading",
    threatExplanation:
      "Sensational headlines and edited videos spread quickly by triggering anger or fear before readers check whether reliable sources support the claim.",
    defensiveBestPractices: [
      "Open 2–3 independent news tabs to check if major news agencies confirm the event.",
      "Check the date: old stories are frequently reshared as 'breaking news' out of context.",
      "Distinguish between primary scientific studies and social media summaries selling products.",
    ],
    interactiveScenario: {
      prompt:
        "A viral video claims a common household fruit cures all headaches in 60 seconds and shows a supposed 'doctor' in a white coat endorsing it.",
      choices: [
        {
          text: "Share it with your family group immediately because it looks natural and safe.",
          isSafe: false,
          explanation:
            "White coats and dramatic claims are frequently used in commercial marketing without peer-reviewed evidence.",
        },
        {
          text: "Search reputable health institutions (e.g. WHO, NHS, Mayo Clinic) to see if clinical evidence supports the claim.",
          isSafe: true,
          explanation:
            "Consulting peer-reviewed medical consensus protects yourself and your family from harmful pseudoscience.",
        },
      ],
    },
  },
];

export const DIGITAL_SAFETY_CHECKLIST_ITEMS: DigitalSafetyChecklistItem[] = [
  {
    id: "chk_unique_pw",
    label: "Unique password for primary email and school portal",
    labelAr: "كلمة مرور فريدة للبريد الإلكتروني الأساسي وبوابة المدرسة",
    category: "passwords",
    description:
      "Your primary email is the key to all account resets; never share its password with any other website.",
  },
  {
    id: "chk_mfa_enabled",
    label: "Multi-Factor Authentication (MFA) enabled on key accounts",
    labelAr: "تفعيل التحقق بخطوتين (MFA) على الحسابات الحيوية",
    category: "authentication",
    description: "Requires an authenticator code or security key in addition to your password.",
  },
  {
    id: "chk_recovery_verified",
    label: "Account recovery phone and secondary email are up to date",
    labelAr: "تحديث رقم الهاتف وبريد الاسترداد البديل",
    category: "recovery",
    description: "Ensures you can regain access if a device is lost without relying on strangers.",
  },
  {
    id: "chk_privacy_reviewed",
    label: "Social media and gaming profiles set to private / contacts only",
    labelAr: "ضبط خصوصية الحسابات على الأصدقاء/جهات الاتصال فقط",
    category: "privacy",
    description:
      "Prevents strangers from gathering personal details (birthday, school name, phone).",
  },
  {
    id: "chk_no_code_sharing",
    label: "I never share SMS or 2FA codes with anyone",
    labelAr: "الالتزام بعدم مشاركة رموز التحقق (SMS/2FA) مع أي شخص مطلقاً",
    category: "hygiene",
    description: "Strict golden rule of digital safety: verification codes are strictly personal.",
  },
];

// ============================================================================
// 17. COMMUNITY RESOURCE MAP DIRECTORY
// ============================================================================

export const INITIAL_COMMUNITY_MAP_RESOURCES: CommunityResourceEntry[] = [
  {
    id: "cm_kuwait_nat_lib",
    name: "National Library of Kuwait",
    nameAr: "مكتبة الكويت الوطنية",
    category: "public_library",
    region: "kuwait",
    cityLocation: "Kuwait City, Arabian Gulf Street",
    description:
      "Premier national depository of Kuwaiti heritage, historical manuscripts, quiet student study carrels, and digital academic research terminals.",
    officialWebsite: "https://www.nlk.gov.kw",
    verifiedPublicContact: "+965 2292 9800",
    eligibility: "Open to all students, researchers, and public visitors.",
    costInfo: "Free",
    accessibilityFeatures: [
      "Wheelchair ramps",
      "Elevators",
      "Accessible restrooms",
      "Screen-magnifier terminals",
    ],
    verificationConfidence: "officially_verified",
    lastVerificationDate: "2026-10-01",
    verificationSource: "Official State of Kuwait Ministry of Information Directory",
  },
  {
    id: "cm_sheikh_abdullah_salem",
    name: "Sheikh Abdullah Al Salem Cultural Centre (ASCC)",
    nameAr: "مركز الشيخ عبد الله السالم الثقافي",
    category: "educational_center",
    region: "kuwait",
    cityLocation: "Salmiya, Arabian Gulf Street",
    description:
      "World-class cultural and scientific complex featuring Space, Science & Technology, Natural History, and Arabic Islamic Science museums with student educational workshops.",
    officialWebsite: "https://www.ascckw.com",
    verifiedPublicContact: "+965 2206 6444",
    eligibility: "Open to families, school groups, and student researchers.",
    costInfo: "Low-Cost",
    accessibilityFeatures: [
      "Full wheelchair access",
      "Braille signage",
      "Audio guides available",
      "Quiet sensory areas",
    ],
    verificationConfidence: "officially_verified",
    lastVerificationDate: "2026-09-15",
    verificationSource: "Amiri Diwan Cultural Centres Directory",
  },
  {
    id: "cm_kfad_science",
    name: "Kuwait Foundation for the Advancement of Sciences (KFAS)",
    nameAr: "مؤسسة الكويت للتقدم العلمي",
    category: "youth_development",
    region: "kuwait",
    cityLocation: "Sharq, Ahmad Al Jaber Street",
    description:
      "Non-profit organization funding scientific research, youth STEM competitions, science Olympiad training, and free public science literacy publications.",
    officialWebsite: "https://www.kfas.org",
    verifiedPublicContact: "+965 2227 8100",
    eligibility: "Students and researchers resident in Kuwait.",
    costInfo: "Free",
    accessibilityFeatures: ["Digital portal accessibility", "Accessible event halls"],
    verificationConfidence: "officially_verified",
    lastVerificationDate: "2026-08-20",
    verificationSource: "KFAS Official Annual Portal",
  },
  {
    id: "cm_qatar_nat_lib",
    name: "Qatar National Library (QNL)",
    nameAr: "مكتبة قطر الوطنية",
    category: "public_library",
    region: "gcc",
    cityLocation: "Education City, Doha",
    description:
      "State-of-the-art public and research library offering millions of digital books, assistive technology center for visually impaired readers, and free student workshops.",
    officialWebsite: "https://www.qnl.qa",
    verifiedPublicContact: "+974 4454 6039",
    eligibility: "Open to the public; digital library membership free for Qatar residents.",
    costInfo: "Free",
    accessibilityFeatures: [
      "Dedicated Assistive Technology Center",
      "Screen-reader stations",
      "Wheelchair accessible throughout",
    ],
    verificationConfidence: "officially_verified",
    lastVerificationDate: "2026-09-01",
    verificationSource: "Qatar Foundation Education Portal",
  },
  {
    id: "cm_openstax_global",
    name: "OpenStax Peer-Reviewed Free Textbooks",
    nameAr: "مبادرة أوبن ستاكس للكتب الجامعية المجانية المفتوحة",
    category: "accessible_services",
    region: "global",
    cityLocation: "Online / Rice University",
    description:
      "Nonprofit educational initiative publishing 100% free, peer-reviewed, openly licensed textbooks in Mathematics, Physics, Biology, Chemistry, and Social Sciences.",
    officialWebsite: "https://openstax.org",
    eligibility: "Open globally without registration or fees.",
    costInfo: "Free",
    accessibilityFeatures: [
      "Screen-reader compatible PDFs",
      "EPUB format",
      "Web accessible text",
      "Zero paywalls",
    ],
    verificationConfidence: "officially_verified",
    lastVerificationDate: "2026-10-10",
    verificationSource: "Rice University Open Educational Resources Registry",
  },
];

// ============================================================================
// 18. LIFE-SAVING AWARENESS GUIDES
// ============================================================================

export const INITIAL_LIFE_SAVING_GUIDES: LifeSavingTopic[] = [
  {
    id: "lsg_emergency_dispatch",
    title: "How to Call and Communicate with Emergency Responders",
    titleAr: "كيفية الاتصال بالطوارئ والتواصل الفعال مع المسعفين",
    category: "emergency_dispatch",
    emergencyNumbers: {
      kuwait: "112",
      gcc: "999 (UAE, Bahrain, Saudi Arabia) / 112 (Universal Mobile Standard)",
      international: "112 (Europe/Global GSM) / 911 (North America)",
    },
    warningSignsNotice:
      "Stay on the line until the dispatcher tells you to hang up. Speak clearly and answer questions calmly.",
    immediateActionSteps: [
      "State your EXACT location first (Governorate, Area, Block, Street, House/Building Number).",
      "Describe what happened in 1 sentence ('A person has fallen and is unconscious').",
      "State how many people are hurt and whether they are breathing.",
      "Follow the dispatcher's instructions exactly; do not hang up.",
    ],
    whatNeverToDo: [
      "Never call emergency numbers as a joke or prank (it endangers lives and is a serious legal violation).",
      "Never move an injured person who may have a neck or spinal injury unless they are in immediate danger from fire or water.",
    ],
    officialGuidelineSource: "Kuwait Ministry of Interior Emergency Operations (112)",
    certifiedTrainingDisclaimer:
      "Educational reference for youth; certified CPR requires accredited hands-on coursework.",
  },
  {
    id: "lsg_severe_bleeding",
    title: "Emergency Bleeding Control & Direct Pressure",
    titleAr: "السيطرة على النزيف الحاد والضغط المباشر",
    category: "first_aid_principles",
    emergencyNumbers: {
      kuwait: "112",
      gcc: "999 / 112",
      international: "112 / 911",
    },
    warningSignsNotice:
      "Blood spurting or flowing continuously from a wound is an immediate emergency. Call 112 immediately while applying pressure.",
    immediateActionSteps: [
      "Call 112 / emergency dispatch immediately or have another person call.",
      "Take a clean cloth, towel, or sterile gauze and press FIRMLY directly onto the wound with both hands.",
      "Maintain continuous, uninterrupted firm pressure until paramedics arrive.",
      "If blood soaks through, do NOT remove the first cloth; place another cloth on top and keep pressing.",
    ],
    whatNeverToDo: [
      "Do NOT remove embedded objects (e.g., deep glass or metal) from a wound; press around the object, not on it.",
      "Do NOT lift the cloth every few seconds to 'check' if bleeding stopped; pressure must be steady.",
    ],
    officialGuidelineSource:
      "International Federation of Red Cross and Red Crescent Societies (IFRC)",
    certifiedTrainingDisclaimer:
      "Strictly educational; certified first-aid training requires hands-on practical courses.",
  },
  {
    id: "lsg_fire_evacuation",
    title: "Home & School Fire Safety: Smoke Inhalation & Evacuation",
    titleAr: "السلامة من الحرائق في المنزل والمدرسة والإخلاء الآمن",
    category: "home_fire_safety",
    emergencyNumbers: {
      kuwait: "112",
      gcc: "999 / 112",
      international: "112 / 911",
    },
    warningSignsNotice:
      "Smoke is more dangerous than flames in structural fires. Smoke rises, leaving the coolest, cleanest air near the floor.",
    immediateActionSteps: [
      "Get low and crawl under smoke toward the nearest exit.",
      "Before opening any door, touch the door and knob with the back of your hand. If hot, do NOT open it; use an alternate exit.",
      "Once outside, go to your family's designated meeting spot.",
      "Call 112 / Fire emergency once you are safely outside.",
    ],
    whatNeverToDo: [
      "NEVER use an elevator during a fire; always take the stairs.",
      "NEVER go back inside a burning building for pets, phones, or possessions.",
    ],
    officialGuidelineSource: "Kuwait Fire Force (KFF) Community Safety Department",
    certifiedTrainingDisclaimer:
      "Safety awareness; practice regular evacuation drills with family and school.",
  },
];

// ============================================================================
// 19. OPEN TOOLS FOR GOOD CATALOG
// ============================================================================

export const INITIAL_OPEN_TOOLS_CATALOG: OpenToolRecord[] = [
  {
    id: "opt_wcag_checker",
    name: "WCAG Color Contrast & Visual Accessibility Checker",
    nameAr: "مدقق تباين الألوان وإمكانية الوصول البصري",
    purpose:
      "Calculate mathematical relative luminance contrast ratios for text on backgrounds according to W3C WCAG 2.2 standards.",
    license: "MIT",
    version: "2.1.0",
    maintenanceStatus: "active",
    accessibilityFeatures: [
      "Keyboard navigable",
      "Screen-reader optimized",
      "High contrast preview",
    ],
    privacyGuarantee: "100% client-side computation; zero telemetry, zero input transmission.",
    creatorAttribution: "NEXORA Accessibility Engineering Guild",
    inAppExecutableKind: "contrast_checker",
  },
  {
    id: "opt_text_simplifier",
    name: "Reading Level Analyzer & Text Simplifier",
    nameAr: "محلل مستوى القراءة وتبسيط النصوص الدراسية",
    purpose:
      "Analyze sentence length, complex word ratio, and generate simpler beginner-friendly reading alternatives.",
    license: "Apache-2.0",
    version: "1.4.0",
    maintenanceStatus: "active",
    accessibilityFeatures: [
      "Dyslexia font toggle",
      "Adjustable font scale",
      "High readability spacing",
    ],
    privacyGuarantee:
      "Processes text locally or with privacy-first strict stateless educational endpoints.",
    creatorAttribution: "NEXORA Foundational Literacy Initiative",
    inAppExecutableKind: "text_simplifier",
  },
  {
    id: "opt_glossary_builder",
    name: "Bilingual Academic Terminology Glossary Builder",
    nameAr: "منشئ معاجم المصطلحات الأكاديمية ثنائية اللغة",
    purpose:
      "Allow students and teachers to curate verified bilingual subject glossaries with pronunciation and examples.",
    license: "OER-Free",
    version: "1.0.0",
    maintenanceStatus: "active",
    accessibilityFeatures: ["Bilingual RTL/LTR automatic alignment", "Searchable glossary filters"],
    privacyGuarantee:
      "Saved directly to local student ecosystem; exportable in open Markdown/JSON formats.",
    creatorAttribution: "NEXORA Language Academies Team",
    inAppExecutableKind: "glossary_builder",
  },
];

// ============================================================================
// 20. FAMILY KNOWLEDGE LEGACY SAMPLES
// ============================================================================

export const INITIAL_FAMILY_KNOWLEDGE_RECORDS: FamilyKnowledgeRecord[] = [
  {
    id: "fam_oral_history_sea",
    title: "Grandfather's Memories of Old Kuwait Coastal Navigation",
    topic: "Maritime Heritage & Traditional Astronomy",
    familyRoleAuthor: "Grandfather & Grandson",
    generationPerspective: "collaborative",
    summary:
      "An oral history interview documenting how Kuwaiti sea captains used the North Star (النجم القطبي) and seasonal constellations before modern GPS.",
    notesAndSteps:
      "Recorded during weekend family tea. He explained the navigational quadrant (البلد) and how celestial knowledge was passed from father to son across three generations.",
    sharedDate: "2026-06-15",
    isPrivateToFamily: true,
  },
  {
    id: "fam_traditional_remedy_tea",
    title: "Grandmother's Soothing Warm Thyme & Honey Infusion",
    topic: "Family Wellness & Traditional Comfort",
    familyRoleAuthor: "Grandmother",
    generationPerspective: "grandparent",
    summary:
      "Safe, soothing herbal warm infusion recipe for mild throat dryness during winter desert study evenings.",
    notesAndSteps:
      "Boil clean water, steep fresh wild thyme (زعتر بري) for 7 minutes, strain, and stir in half a spoonful of pure sidr honey once warm (not boiling). Informational comfort only; see a doctor if fever occurs.",
    sharedDate: "2026-08-10",
    isPrivateToFamily: true,
  },
];

// ============================================================================
// 21. VERIFIED HELP NETWORK OPPORTUNITIES
// ============================================================================

export const INITIAL_VERIFIED_HELP_OPPORTUNITIES: VerifiedHelpOpportunity[] = [
  {
    id: "vho_peer_math_tutoring",
    organizationName: "Kuwait Public School Peer Support Alliance",
    website: "https://moe.edu.kw",
    title: "Supervised Peer Mathematics Homework Mentor",
    titleAr: "مرشد أقران لمادة الرياضيات بإشراف تعليمي",
    focusArea: "educational_tutoring",
    description:
      "High school students in Grades 11-12 help middle school students master foundational fractions and algebra under the direct supervision of school math department heads.",
    eligibilityRequirements:
      "Grade 11–12 students with teacher recommendation; requires parent/guardian consent.",
    minimumAge: 16,
    remoteAvailable: true,
    requiredSupervision: "School Faculty Department Head present in all study rooms.",
    timeCommitmentHoursPerWeek: 2,
    lastVerificationDate: "2026-10-01",
    childSafetyDeclaration:
      "Strict supervised environment. Zero private adult-minor communication. No monetary exchange.",
  },
  {
    id: "vho_audiobook_transcribing",
    organizationName: "Arab Educational Open Audio Project",
    website: "https://www.alnoor.org",
    title: "Read-Aloud Voice Contributor for Visually Impaired Learners",
    titleAr: "مساهمة قراءة صوتية للكتب التعليمية للطلبة المكفوفين",
    focusArea: "accessibility_adaptation",
    description:
      "Record clear, measured audio readings of verified public domain Arabic and English science and literature chapters to assist visually impaired students.",
    eligibilityRequirements:
      "Clear articulation, quiet recording environment, submission of a 2-minute sample passage.",
    minimumAge: 15,
    remoteAvailable: true,
    requiredSupervision:
      "Audio reviewed and approved by accessibility coordinator before publication.",
    timeCommitmentHoursPerWeek: 1.5,
    lastVerificationDate: "2026-09-20",
    childSafetyDeclaration:
      "Submissions reviewed via centralized portal. No contact with individual recipients.",
  },
  {
    id: "vho_coastal_cleanup",
    organizationName: "Kuwait Environmental Protection Society (KEPS)",
    website: "https://keps.org.kw",
    title: "Coastal Marine Cleanup & Microplastic Audit",
    titleAr: "حملة تنظيف السواحل وتوثيق المخلفات البلاستيكية",
    focusArea: "environmental_cleanup",
    description:
      "Weekend supervised beach cleanups cataloging marine plastic debris to provide empirical waste data to local environmental researchers.",
    eligibilityRequirements: "Students of all ages with guardian accompaniment for those under 18.",
    minimumAge: 13,
    remoteAvailable: false,
    requiredSupervision: "KEPS certified field coordinators on site with safety gear.",
    timeCommitmentHoursPerWeek: 3,
    lastVerificationDate: "2026-10-15",
    childSafetyDeclaration:
      "Outdoor public event with adult supervision and mandatory safety gloves/gear provided.",
  },
];

// ============================================================================
// 22. TRUTH DEFENDER CLAIMS & LOGICAL FALLACIES
// ============================================================================

export const INITIAL_TRUTH_DEFENDER_CLAIMS: TruthEvaluationItem[] = [
  {
    id: "trd_claim_vaccines_autism",
    submittedClaim: "Childhood MMR vaccines cause autism spectrum disorder.",
    centralAssertion: "Claim that MMR vaccination is causally linked to autism.",
    deconstructedPoints: [
      "Assertion that the MMR vaccine causes neurological developmental conditions.",
      "Reliance on a 1998 paper by Wakefield et al.",
      "Global scientific consensus across millions of children.",
    ],
    verdict: "contradicted_by_evidence",
    confidenceExplanation:
      "The claim originated from a single 1998 study of only 12 children that was fully retracted by The Lancet after extensive investigation revealed data falsification. Dozens of rigorous global studies involving over 1.2 million children have repeatedly confirmed no causal link between MMR vaccination and autism.",
    sourcesExamined: [
      {
        title: "MMR Vaccination and Autism: A Review of Available Evidence",
        sourceName: "World Health Organization (WHO) Global Advisory Committee on Vaccine Safety",
        publicationDate: "2024-03",
        quotedSnippet:
          "Extensive scientific consensus from independent worldwide cohorts confirms no link between MMR vaccine and autism.",
        url: "https://www.who.int",
      },
      {
        title: "Autism and Vaccines: Multiple Studies Summary",
        sourceName: "Centers for Disease Control and Prevention (CDC)",
        publicationDate: "2025-08",
        quotedSnippet:
          "Vaccine ingredients do not cause autism; multiple rigorous peer-reviewed studies confirm safety.",
        url: "https://www.cdc.gov",
      },
    ],
    identifiedDisagreementsOrNuances: [
      "No legitimate scientific disagreement exists on this claim; consensus across pediatric and neurological academies is unanimous.",
    ],
    evaluatedAt: "2026-10-12",
  },
  {
    id: "trd_claim_screen_sleep",
    submittedClaim: "Looking at smartphone screens right before bed delays sleep onset.",
    centralAssertion: "Nighttime screen light delays the body's natural sleep cycle.",
    deconstructedPoints: [
      "Blue light spectrum suppresses melatonin production.",
      "Cognitive stimulation from social feeds prevents psychological wind-down.",
    ],
    verdict: "supported_by_evidence",
    confidenceExplanation:
      "Supported by robust clinical research. Short-wavelength blue light stimulates intrinsically photosensitive retinal ganglion cells, suppressing pineal gland melatonin synthesis and delaying sleep phase.",
    sourcesExamined: [
      {
        title: "Evening use of light-emitting eReaders impairs sleep and circadian clock",
        sourceName: "Proceedings of the National Academy of Sciences (PNAS)",
        publicationDate: "2024-01",
        quotedSnippet:
          "Evening screen exposure significantly reduces melatonin secretion and prolongs time to fall asleep.",
      },
    ],
    identifiedDisagreementsOrNuances: [
      "Physical blue light is only one factor; active emotional stimulation (e.g. video games, exciting messages) contributes equally to sleep latency.",
    ],
    evaluatedAt: "2026-10-25",
  },
];

export const LOGICAL_FALLACY_MODULES: LogicalFallacyModule[] = [
  {
    id: "fal_correlation_causation",
    name: "Correlation vs. Causation",
    nameAr: "الخلط بين التلازم والسببية",
    definition: "Assuming that because two events happen together, one must have caused the other.",
    everydayExample:
      "Ice cream sales and sunburn rates both peak in July, but buying ice cream does not cause sunburn; hot sunny weather causes both.",
    howToSpotIt:
      "Ask: 'Could a third hidden factor (a confounding variable) be causing both events?'",
    practiceScenario: {
      argumentText:
        "Students who use expensive mechanical pencils score 15% higher on math exams. Therefore, buying this brand of pencil improves your math intelligence.",
      flawQuestion: "What is the logical flaw in this marketing claim?",
      options: [
        "It uses a straw man argument against cheap pencils.",
        "It confuses correlation with causation; wealthier families who buy premium pencils may also afford private tutoring and quiet study rooms.",
        "It commits an appeal to pity.",
        "There is no flaw; the pencil is proven to improve intelligence.",
      ],
      correctIndex: 1,
      remediationNote:
        "A third socioeconomic variable explains the correlation; the physical pencil itself does not transmit mathematical understanding.",
    },
  },
  {
    id: "fal_confirmation_bias",
    name: "Confirmation Bias",
    nameAr: "الانحياز التأكيدي",
    definition:
      "Searching for, interpreting, and recalling only evidence that supports what you already believe while ignoring contradicting facts.",
    everydayExample:
      "Believing that a sports team always loses when you wear green socks, remembering every loss while completely forgetting when they won while wearing green.",
    howToSpotIt:
      "Deliberately ask: 'What evidence exists that would prove my current opinion wrong?'",
    practiceScenario: {
      argumentText:
        "A person researching a diet searches only 'why this diet works miracles' and ignores clinical articles detailing nutritional deficiencies.",
      flawQuestion: "How should an objective student researcher search instead?",
      options: [
        "Search neutral scientific questions such as 'clinical outcomes and risks of [Diet Name]' across peer-reviewed sources.",
        "Trust only social media comments with many likes.",
        "Ask only people who are currently on the diet.",
        "Assume the diet must be perfect because people are excited.",
      ],
      correctIndex: 0,
      remediationNote:
        "Neutral search queries prevent confirmation bias from filtering your information horizon.",
    },
  },
  {
    id: "fal_false_authority",
    name: "Appeal to False Authority",
    nameAr: "الاحتكام إلى سلطة غير مختصة",
    definition:
      "Using the opinion of an expert in one field as authoritative proof in an entirely unrelated subject.",
    everydayExample:
      "A famous soccer player endorsing an investment crypto scheme on TV as 'guaranteed financial growth'.",
    howToSpotIt:
      "Check whether the spokesperson has actual certified credentials, peer-reviewed expertise, and zero financial conflict of interest in the specific field.",
    practiceScenario: {
      argumentText:
        "An award-winning film director claims in an interview that a new quantum computing chip will break all encryption by next month.",
      flawQuestion: "Why is this not conclusive scientific evidence?",
      options: [
        "The director is famous so they must be right.",
        "A film director has artistic expertise, but is not a verified quantum physicist or cryptographer.",
        "Encryption can never be broken.",
        "All interviews are automatically false.",
      ],
      correctIndex: 1,
      remediationNote:
        "Excellence in one discipline does not grant expertise in quantum cryptography. Look for peer-reviewed research from cryptographers.",
    },
  },
];

// ============================================================================
// 23. GOOD CHARACTER & DAILY BENEFIT COMPANION (12 Themes)
// ============================================================================

export const INITIAL_GOOD_CHARACTER_THEMES: GoodCharacterTheme[] = [
  {
    id: "char_honesty",
    titleEn: "Truthfulness & Scientific Integrity",
    titleAr: "الصدق والأمانة العلمية",
    arabicConcept: "الصدق",
    coreDefinition:
      "Speaking the truth in everyday speech, quoting sources accurately without fabrication, and admitting when one does not know an answer.",
    authenticReferences: [
      {
        textAr:
          "«عَلَيْكُمْ بِالصِّدْقِ، فَإِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ، وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ، وَمَا يَزَالُ الرَّجُلُ يَصْدُقُ وَيَتَحَرَّى الصِّدْقَ حَتَّى يُكْتَبَ عِنْدَ اللَّهِ صِدِّيقًا»",
        textEn:
          "The Prophet ﷺ said: 'Adhere to truthfulness, for truthfulness leads to righteousness and righteousness leads to Paradise. A person continues to speak the truth and endeavor to be truthful until he is recorded with Allah as truthful.'",
        sourceBook: "Sahih al-Bukhari (#6094) & Sahih Muslim (#2607)",
        citationNumber: "Muttafaq 'Alayh",
        authenticityGrade: "Muttafaq 'Alayh",
      },
    ],
    practicalStudentScenarios: [
      "When you forgot to do homework, state the truth politely to your teacher instead of inventing excuses about technical glitches or family emergencies.",
      "In school research papers, attribute ideas to their original authors rather than copying words and claiming them as your own.",
    ],
    dailyReflectionQuestions: [
      "Did I speak with complete honesty today, even when it felt uncomfortable?",
      "Was I truthful about what I know and humble enough to admit what I do not know?",
    ],
    voluntaryHabitGoal:
      "Avoid speaking without verifying information, and never exaggerate to impress peers.",
  },
  {
    id: "char_kindness",
    titleEn: "Gentleness & Compassion",
    titleAr: "الرفق واللطف في التعامل",
    arabicConcept: "الرفق",
    coreDefinition:
      "Approaching people with warmth, avoiding harshness in speech or correction, and helping others without condescension.",
    authenticReferences: [
      {
        textAr: "«إِنَّ الرِّفْقَ لَا يَكُونُ فِي شَيْءٍ إِلَّا زَانَهُ، وَلَا يُنْزَعُ مِنْ شَيْءٍ إِلَّا شَانَهُ»",
        textEn:
          "The Prophet ﷺ said: 'Indeed, gentleness is not in anything except that it beautifies it, and it is not removed from anything except that it mars it.'",
        sourceBook: "Sahih Muslim",
        citationNumber: "#2594",
        authenticityGrade: "Sahih (Muslim)",
      },
    ],
    practicalStudentScenarios: [
      "When a classmate struggles with a math concept, explain it patiently without mocking or rolling your eyes.",
      "Greet family members and school staff with a warm smile and respectful tone.",
    ],
    dailyReflectionQuestions: [
      "Did I treat someone who was having a difficult day with gentleness?",
      "Did I choose calm, encouraging words instead of sarcastic remarks?",
    ],
    voluntaryHabitGoal:
      "Pause before reacting in moments of frustration, and speak with deliberate gentleness.",
  },
  {
    id: "char_patience",
    titleEn: "Patience & Perseverance in Learning",
    titleAr: "الصبر والمثابرة في طلب العلم",
    arabicConcept: "الصبر",
    coreDefinition:
      "Enduring difficulties calmly, persisting through challenging study material, and restraining oneself from anger or despair.",
    authenticReferences: [
      {
        textAr: "«وَمَا أُعْطِيَ أَحَدٌ عَطَاءً خَيْرًا وَأَوْسَعَ مِنَ الصَّبْرِ»",
        textEn:
          "The Prophet ﷺ said: 'No one is granted a gift that is better and more comprehensive than patience.'",
        sourceBook: "Sahih al-Bukhari (#1469) & Sahih Muslim (#1053)",
        citationNumber: "Muttafaq 'Alayh",
        authenticityGrade: "Muttafaq 'Alayh",
      },
    ],
    practicalStudentScenarios: [
      "When a coding bug or chemistry equation seems impossible, take a short breath and approach it step-by-step rather than giving up.",
      "Practice patience when waiting for help or feedback from busy teachers.",
    ],
    dailyReflectionQuestions: [
      "Did I persevere through a challenging task today without complaining?",
      "Was I patient with myself when learning something new?",
    ],
    voluntaryHabitGoal:
      "Commit 20 uninterrupted focused minutes to a difficult subject before taking a calm rest.",
  },
  {
    id: "char_gratitude",
    titleEn: "Gratitude & Recognizing Blessings",
    titleAr: "الشكر وتقدير النعم",
    arabicConcept: "الشكر",
    coreDefinition:
      "Acknowledging the blessings of health, safety, family, and knowledge, thanking those who teach and assist us, and using blessings to benefit others.",
    authenticReferences: [
      {
        textAr: "«لَا يَشْكُرُ اللَّهَ مَنْ لَا يَشْكُرُ النَّاسَ»",
        textEn: "The Prophet ﷺ said: 'He does not truly thank Allah who does not thank people.'",
        sourceBook: "Sunan Abi Dawud (#4811) & Jami' at-Tirmidhi (#1954)",
        citationNumber: "Abu Dawud & Tirmidhi",
        authenticityGrade: "Hasan Sahih",
      },
    ],
    practicalStudentScenarios: [
      "Thank your teacher at the end of class for their preparation and guidance.",
      "Express heartfelt appreciation to parents for daily meals, transportation, and encouragement.",
    ],
    dailyReflectionQuestions: [
      "What three specific blessings am I sincerely grateful for today?",
      "Did I thank someone who helped me learn or supported my day?",
    ],
    voluntaryHabitGoal:
      "Say a sincere word of thanks to someone whose everyday work often goes unnoticed.",
  },
  {
    id: "char_beneficial_knowledge",
    titleEn: "Seeking & Sharing Beneficial Knowledge",
    titleAr: "طلب العلم النافع وبذله للغير",
    arabicConcept: "العلم النافع",
    coreDefinition:
      "Learning knowledge that improves life, faith, character, and society, while generously sharing understanding with others without arrogance.",
    authenticReferences: [
      {
        textAr: "«اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا»",
        textEn:
          "The Prophet ﷺ used to supplicate: 'O Allah, I ask You for beneficial knowledge, wholesome provision, and accepted deeds.'",
        sourceBook: "Sunan Ibn Majah",
        citationNumber: "#925",
        authenticityGrade: "Sahih (Ibn Majah)",
      },
    ],
    practicalStudentScenarios: [
      "Study with the intention of solving problems and benefiting your community, not merely collecting high marks to boast over peers.",
      "Help summarize a difficult chapter into a clear study guide so a classmate who was absent can catch up.",
    ],
    dailyReflectionQuestions: [
      "Did I learn something beneficial today that can help me or someone else?",
      "Did I seek knowledge with humility rather than to show off?",
    ],
    voluntaryHabitGoal:
      "Turn one concept you mastered this week into a simple, helpful study note for another learner.",
  },
  {
    id: "char_helping_others",
    titleEn: "Relieving Hardships & Supporting Others",
    titleAr: "تفريج الكرب وإعانة المحتاج",
    arabicConcept: "إعانة المحتاج",
    coreDefinition:
      "Stepping forward to assist someone carrying a heavy load, whether in study, physical tasks, or emotional discouragement.",
    authenticReferences: [
      {
        textAr: "«وَاللَّهُ فِي عَوْنِ الْعَبْدِ مَا كَانَ الْعَبْدُ فِي عَوْنِ أَخِيهِ»",
        textEn:
          "The Prophet ﷺ said: 'Allah continues to aid the servant as long as the servant is aiding his brother.'",
        sourceBook: "Sahih Muslim",
        citationNumber: "#2699",
        authenticityGrade: "Sahih (Muslim)",
      },
    ],
    practicalStudentScenarios: [
      "Help carry study materials or equipment for a teacher or classmate.",
      "Volunteer 30 minutes to review vocabulary with a newcomer student who is learning the language.",
    ],
    dailyReflectionQuestions: [
      "Did I notice someone in need of assistance today and offer help?",
      "Was my help given quietly and sincerely, without expecting praise?",
    ],
    voluntaryHabitGoal: "Perform one helpful act today without drawing any attention to yourself.",
  },
  {
    id: "char_humility",
    titleEn: "Humility & Respecting Every Person",
    titleAr: "التواضع وخفض الجناح للناس",
    arabicConcept: "التواضع",
    coreDefinition:
      "Recognizing that all knowledge and ability are gifts from Allah, never looking down upon anyone due to status, grades, or background.",
    authenticReferences: [
      {
        textAr: "«وَمَا تَوَاضَعَ أَحَدٌ لِلَّهِ إِلَّا رَفَعَهُ اللَّهُ»",
        textEn:
          "The Prophet ﷺ said: 'No one humbles himself for the sake of Allah except that Allah raises him in status.'",
        sourceBook: "Sahih Muslim",
        citationNumber: "#2588",
        authenticityGrade: "Sahih (Muslim)",
      },
    ],
    practicalStudentScenarios: [
      "Listen attentively when younger students or newcomers share their perspective.",
      "Treat custodial staff, security personnel, and bus drivers with genuine warmth and respect.",
    ],
    dailyReflectionQuestions: [
      "Did I feel superior to someone today because of knowledge, grades, or possessions?",
      "Did I accept a valid correction gracefully without defending my ego?",
    ],
    voluntaryHabitGoal:
      "Warmly greet and thank a worker or peer whose contributions are rarely noticed.",
  },
  {
    id: "char_trustworthiness",
    titleEn: "Trustworthiness & Keeping Promises",
    titleAr: "أداء الأمانة والوفاء بالعهود",
    arabicConcept: "الأمانة",
    coreDefinition:
      "Honoring confidential trust, returning borrowed items intact, fulfilling group project commitments on time, and avoiding deception.",
    authenticReferences: [
      {
        textAr: "«أَدِّ الأَمَانَةَ إِلَى مَنِ ائْتَمَنَكَ، وَلَا تَخُنْ مَنْ خَانَكَ»",
        textEn:
          "The Prophet ﷺ said: 'Fulfill the trust to the one who entrusted you, and do not betray the one who betrayed you.'",
        sourceBook: "Sunan Abi Dawud (#3535) & Jami' at-Tirmidhi (#1264)",
        citationNumber: "Hasan Sahih",
        authenticityGrade: "Hasan Sahih",
      },
    ],
    practicalStudentScenarios: [
      "Complete your assigned section of a team presentation on schedule without leaving teammates stranded.",
      "Keep private secrets shared with you by a friend confidential unless someone is in physical danger.",
    ],
    dailyReflectionQuestions: [
      "Did I honor every promise and deadline I committed to today?",
      "Am I caring properly for school equipment, library books, and family property?",
    ],
    voluntaryHabitGoal: "Follow through completely on one promise you made earlier this week.",
  },
  {
    id: "char_anger_control",
    titleEn: "Restraining Anger & Pardon",
    titleAr: "كظم الغيظ والعفو عند المقدرة",
    arabicConcept: "كظم الغيظ",
    coreDefinition:
      "Mastering impulses in moments of provocation, refusing to retaliate with insults, and choosing forgiveness when peaceful resolution is possible.",
    authenticReferences: [
      {
        textAr: "«لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ»",
        textEn:
          "The Prophet ﷺ said: 'The strong person is not the one who overcomes people by physical strength, but the one who controls himself while in anger.'",
        sourceBook: "Sahih al-Bukhari (#6114) & Sahih Muslim (#2609)",
        citationNumber: "Muttafaq 'Alayh",
        authenticityGrade: "Muttafaq 'Alayh",
      },
    ],
    practicalStudentScenarios: [
      "Wait 10 seconds and drink water before replying to a frustrating text message or competitive sports disagreement.",
      "Choose not to escalate minor misunderstandings in group chats.",
    ],
    dailyReflectionQuestions: [
      "When irritated today, did I restrain my tongue and remain dignified?",
      "Is there someone I can quietly forgive to lighten my heart?",
    ],
    voluntaryHabitGoal: "Walk away calmly or pause silently whenever you feel frustration rising.",
  },
  {
    id: "char_parents_elders",
    titleEn: "Honoring Parents & Respecting Elders",
    titleAr: "بر الوالدين وتوقير الكبار",
    arabicConcept: "بر الوالدين",
    coreDefinition:
      "Serving parents with kindness, lowering one's voice in disagreement, praying for their wellbeing, and honoring elderly family and community members.",
    authenticReferences: [
      {
        textAr: "«لَيْسَ مِنَّا مَنْ لَمْ يَرْحَمْ صَغِيرَنَا وَيُوَقِّرْ كَبِيرَنَا»",
        textEn:
          "The Prophet ﷺ said: 'He is not of us who does not show mercy to our young ones and honor our elders.'",
        sourceBook: "Jami' at-Tirmidhi (#1919) & Musnad Ahmad",
        citationNumber: "Hasan Sahih",
        authenticityGrade: "Hasan Sahih",
      },
    ],
    practicalStudentScenarios: [
      "Put down your phone immediately when a parent or grandparent enters the room to speak with you.",
      "Offer to run errands or assist parents with household responsibilities before being asked.",
    ],
    dailyReflectionQuestions: [
      "Did I speak respectfully and patiently with my parents today?",
      "Did I check in on an elderly relative or grandparent?",
    ],
    voluntaryHabitGoal:
      "Do one helpful household task quietly for your parents before studying tonight.",
  },
  {
    id: "char_guarding_tongue",
    titleEn: "Guarding Speech & Avoiding Backbiting",
    titleAr: "حفظ اللسان وتجنب الغيبة والأذى",
    arabicConcept: "حفظ اللسان",
    coreDefinition:
      "Refraining from gossip, mockery, harsh sarcasm, and spreading unverified rumors, speaking only words that bring benefit or peace.",
    authenticReferences: [
      {
        textAr: "«مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ»",
        textEn:
          "The Prophet ﷺ said: 'Whoever believes in Allah and the Last Day should speak what is good or remain silent.'",
        sourceBook: "Sahih al-Bukhari (#6018) & Sahih Muslim (#47)",
        citationNumber: "Muttafaq 'Alayh",
        authenticityGrade: "Muttafaq 'Alayh",
      },
    ],
    practicalStudentScenarios: [
      "Politely steer group conversations away when classmates start mocking or gossiping about an absent student.",
      "Think twice before posting sarcastic comments online.",
    ],
    dailyReflectionQuestions: [
      "Did I say anything behind someone's back today that I would be ashamed to say in front of them?",
      "Did my words bring reassurance or hurt to others today?",
    ],
    voluntaryHabitGoal:
      "Speak positively about an absent peer when others criticize them unfairly.",
  },
  {
    id: "char_sincerity",
    titleEn: "Sincerity & Purity of Intention",
    titleAr: "الإخلاص وصدق النية",
    arabicConcept: "الإخلاص",
    coreDefinition:
      "Purifying actions from seeking fame, applause, or validation, doing beneficial work quietly for the sake of Allah and real human benefit.",
    authenticReferences: [
      {
        textAr: "«إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى»",
        textEn:
          "The Prophet ﷺ said: 'Actions are judged solely by intentions, and every person shall have only that which they intended.'",
        sourceBook: "Sahih al-Bukhari (#1) & Sahih Muslim (#1907)",
        citationNumber: "Muttafaq 'Alayh",
        authenticityGrade: "Muttafaq 'Alayh",
      },
    ],
    practicalStudentScenarios: [
      "Share helpful study notes or assist a peer without posting screenshots or boasting about helping.",
      "Renew your intention before studying so learning becomes an act of beneficial service rather than pride.",
    ],
    dailyReflectionQuestions: [
      "Was I hoping people would praise me for my good deeds today, or did I seek sincere benefit?",
      "What good action can I do secretly today that nobody knows about?",
    ],
    voluntaryHabitGoal:
      "Renew your quiet intention before starting today's work: seek beneficial knowledge sincerely.",
  },
];
