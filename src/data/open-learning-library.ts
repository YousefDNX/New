import { computeCanonicalArchiveDigest } from "@/lib/checksum";

export type ContentReviewStatus =
  | "draft"
  | "pending_review"
  | "under_review"
  | "approved"
  | "needs_correction"
  | "outdated"
  | "archived";

export type ResourceLicense =
  "CC-BY-4.0" | "CC-BY-SA-4.0" | "NEXORA-OER-FREE" | "Attribution-Reference-Only";

export type ErrorReportKind =
  "factual_error" | "broken_link" | "outdated" | "copyright" | "inappropriate" | "accessibility";

export interface CorrectionLogEntry {
  date: string;
  summary: string;
  reviewerRole: "author" | "educator" | "moderator";
}

export interface KnowledgeResource {
  id: string;
  title: string;
  titleAr: string;
  subject: string;
  level: "beginner" | "intermediate" | "advanced";
  language: "en" | "ar" | "bilingual";
  topic: string;
  objectives: string[];
  summary: string;
  body: string;
  workedExample: string;
  authorOwner: string;
  sourceReferences: string[];
  publicationDate: string;
  lastReviewedDate: string;
  reviewStatus: ContentReviewStatus;
  reviewIntervalDays: number;
  highStakes: boolean;
  license: ResourceLicense;
  isDownloadablePermitted: boolean;
  warningsLimitations: string[];
  correctionHistory: CorrectionLogEntry[];
  moduleId: string;
  targetRoute: string;
}

export interface FoundationalStep {
  id: string;
  title: string;
  concept: string;
  workedExample: string;
  checkQuestion: string;
  options: string[];
  correctIndex: number;
}

export interface FoundationalTrack {
  id:
    | "reading"
    | "writing"
    | "mathematics"
    | "basic_science"
    | "english"
    | "arabic"
    | "digital_literacy"
    | "study_skills"
    | "research_skills"
    | "critical_thinking";
  title: string;
  titleAr: string;
  encouragementNote: string;
  targetRoute: string;
  steps: FoundationalStep[];
}

export interface HealthLiteracyCard {
  id: string;
  title: string;
  titleAr: string;
  topic: string;
  summary: string;
  safeChecklist: string[];
  whenToSeekEmergencyCare: string;
  sourceAttribution: string;
  lastReviewedDate: string;
  requiresQualifiedReview: true;
}

export interface IslamicFoundationsGuide {
  authenticQuranRoots: Array<{
    root: string;
    transliteration: string;
    meaning: string;
    studyNote: string;
    verifiedSource: string;
  }>;
  tajweedBasics: Array<{
    rule: string;
    ruleAr: string;
    explanation: string;
    classicalReference: string;
  }>;
  hadithGradingStandards: Array<{
    grade: string;
    gradeAr: string;
    definition: string;
    verificationStandard: string;
  }>;
  seerahStudyIndex: Array<{
    era: string;
    milestone: string;
    classicalSources: string;
  }>;
}

export const OPEN_LEARNING_LIBRARY: KnowledgeResource[] = [
  {
    id: "oer_reading_active_comprehension",
    title: "SQ3R & Structured Paragraph Comprehension",
    titleAr: "استراتيجية القراءة الاستيعابية المنظمة",
    subject: "Reading & Literacy",
    level: "beginner",
    language: "bilingual",
    topic: "Main Idea & Inference",
    objectives: [
      "Survey headings and topic sentences before deep reading.",
      "Distinguish explicit stated facts from author implications.",
    ],
    summary:
      "A clear, step-by-step method helping beginners break dense school passages into manageable claims and evidence.",
    body: "Survey the title and bold headings first. Turn each heading into a short question, read one paragraph at a time to answer it, recite the answer in your own words without looking, and review key terms within 24 hours.",
    workedExample:
      "Passage: 'Mangrove roots trap coastal sediment and shelter juvenile fish.' -> Main idea: Mangrove ecosystems stabilize shorelines and protect marine biodiversity.",
    authorOwner: "NEXORA Foundational Literacy Editorial Team",
    sourceReferences: [
      "Robinson, F. P. (1946). Effective Study — SQ3R Method",
      "UNESCO Literacy & Foundational Skills Framework",
    ],
    publicationDate: "2026-01-15",
    lastReviewedDate: "2026-10-01",
    reviewStatus: "approved",
    reviewIntervalDays: 365,
    highStakes: false,
    license: "CC-BY-4.0",
    isDownloadablePermitted: true,
    warningsLimitations: [
      "Designed as a general study aid; adapt pace for learners using screen readers or dyslexia fonts.",
    ],
    correctionHistory: [
      {
        date: "2026-10-01",
        summary: "Added bilingual Arabic title and simplified example sentence.",
        reviewerRole: "educator",
      },
    ],
    moduleId: "19",
    targetRoute: "/app/study?tab=tools",
  },
  {
    id: "oer_math_fractions_ratios",
    title: "Visual Fractions, Proportions & Unit Rates",
    titleAr: "الكسور البصرية والنسب والتناسب",
    subject: "Mathematics",
    level: "beginner",
    language: "en",
    topic: "Number Sense & Proportional Reasoning",
    objectives: [
      "Convert fluently between fractions, decimals, and percentages.",
      "Solve everyday unit-rate and mixture ratio problems accurately.",
    ],
    summary:
      "Builds intuition for denominators, equivalent scaling, and proportions using real everyday examples before introducing algebra.",
    body: "A fraction represents equal parts of a whole. Multiply or divide both numerator and denominator by the same nonzero number to create equivalent forms. To find a unit rate, divide the total quantity by 1 unit of the second measure.",
    workedExample:
      "If 3 notebooks cost 1.500 KWD, 1 notebook costs 1.500 / 3 = 0.500 KWD. Five notebooks therefore cost 5 x 0.500 = 2.500 KWD.",
    authorOwner: "NEXORA Mathematics Curriculum Group",
    sourceReferences: [
      "OpenStax Prealgebra (CC-BY 4.0) — Fractions & Ratios Chapter",
      "NCTM Principles for Proportional Reasoning",
    ],
    publicationDate: "2026-02-04",
    lastReviewedDate: "2026-09-20",
    reviewStatus: "approved",
    reviewIntervalDays: 365,
    highStakes: false,
    license: "CC-BY-4.0",
    isDownloadablePermitted: true,
    warningsLimitations: [
      "Practice items reinforce foundational numeracy; consult local syllabus notation for exam formatting.",
    ],
    correctionHistory: [],
    moduleId: "14",
    targetRoute: "/app/study?tab=math",
  },
  {
    id: "oer_science_controlled_variables",
    title: "Designing Safe Controlled Experiments",
    titleAr: "تصميم التجارب العلمية المضبوطة بأمان",
    subject: "Science",
    level: "intermediate",
    language: "en",
    topic: "Scientific Inquiry & Safety",
    objectives: [
      "Separate independent, dependent, and controlled variables.",
      "Evaluate experimental safety hazards before collecting trials.",
    ],
    summary:
      "Explains fair-test design, repeat measurements, and mandatory school-lab safety boundaries.",
    body: "Change only ONE independent variable at a time while holding temperature, container size, and starting volume constant. Record at least three trials per condition so random measurement noise does not mislead your conclusion.",
    workedExample:
      "Testing how water temperature affects sugar dissolving time: Independent = water temp; Dependent = seconds until dissolved; Controlled = 100 mL water, 5 g sugar, identical stirring rate.",
    authorOwner: "NEXORA STEM Inquiry Contributors",
    sourceReferences: [
      "OpenStax Concepts of Biology — The Process of Science (CC-BY 4.0)",
      "NGSS Science & Engineering Practices",
    ],
    publicationDate: "2026-03-10",
    lastReviewedDate: "2026-10-12",
    reviewStatus: "approved",
    reviewIntervalDays: 180,
    highStakes: true,
    license: "CC-BY-4.0",
    isDownloadablePermitted: true,
    warningsLimitations: [
      "High-stakes safety rule: never use open flames, pressurized containers, or corrosive chemicals without certified adult/teacher supervision.",
    ],
    correctionHistory: [
      {
        date: "2026-10-12",
        summary: "Added explicit adult-supervision boundary to worked example.",
        reviewerRole: "educator",
      },
    ],
    moduleId: "13",
    targetRoute: "/app/study?tab=science",
  },
  {
    id: "oer_english_cohesion_writing",
    title: "Topic Sentences, Evidence & Linking Transitions",
    titleAr: "بناء الفقرة الإنجليزية وأدوات الربط المنطقي",
    subject: "English",
    level: "intermediate",
    language: "bilingual",
    topic: "Academic Writing & Cohesion",
    objectives: [
      "Anchor every body paragraph with a clear claim sentence.",
      "Use accurate cause-effect and contrast linkers (however, therefore, whereas).",
    ],
    summary:
      "Practical paragraph template for secondary and ESL learners preparing essays and reading responses.",
    body: "Structure concise paragraphs as Claim -> Concrete Evidence -> Explanation -> Link. Avoid stacking disconnected sentences; signal relationships explicitly with contrast ('although', 'nevertheless') or consequence ('consequently').",
    workedExample:
      "Claim: Urban trees reduce summer street heat. Evidence: Shaded pavement measures several degrees cooler than exposed asphalt. Link: Consequently, planting native shade trees lowers cooling energy demand.",
    authorOwner: "NEXORA Language Academies Team",
    sourceReferences: ["CEFR Companion Volume (Council of Europe) — B1/B2 Cohesion Descriptors"],
    publicationDate: "2026-02-18",
    lastReviewedDate: "2026-09-30",
    reviewStatus: "approved",
    reviewIntervalDays: 365,
    highStakes: false,
    license: "NEXORA-OER-FREE",
    isDownloadablePermitted: true,
    warningsLimitations: [
      "Follows international academic prose conventions; confirm British vs. American spelling preference with your teacher.",
    ],
    correctionHistory: [],
    moduleId: "04",
    targetRoute: "/app/english",
  },
  {
    id: "oer_arabic_morphology_roots",
    title: "Arabic Triliteral Roots (الجذر الثلاثي) Reading Key",
    titleAr: "مفتاح الجذور الثلاثية لفهم المفردات العربية",
    subject: "Arabic",
    level: "beginner",
    language: "ar",
    topic: "Morphology & Vocabulary Deduction",
    objectives: [
      "Identify the 3-letter root inside derived Arabic nouns and verbs.",
      "Infer unfamiliar word meanings from root + morphological pattern (الأوزان).",
    ],
    summary:
      "يعلّم المتعلم استخراج الجذر الثلاثي للكلمة لربط المشتقات وفهم النصوص الأدبية والعلمية بسهولة.",
    body: "تتكوّن معظم الكلمات العربية من جذر ثلاثي يحمل المعنى الأساسي، وتُضاف إليه حروف الزيادة (سألتمونيها) وفق أوزان قياسية لتوليد اسم الفاعل أو المفعول أو المصدر أو اسم المكان.",
    workedExample:
      "من الجذر (ك-ت-ب): كَتَبَ (الفعل)، كاتِب (اسم الفاعل)، مَكْتَب (اسم المكان)، مَكْتوب (اسم المفعول).",
    authorOwner: "فريق اللغة العربية — NEXORA",
    sourceReferences: ["شذا العرف في فن الصرف — أحمد الحملاوي (مرجع نحوي كلاسيكي)"],
    publicationDate: "2026-04-02",
    lastReviewedDate: "2026-10-05",
    reviewStatus: "approved",
    reviewIntervalDays: 365,
    highStakes: false,
    license: "CC-BY-SA-4.0",
    isDownloadablePermitted: true,
    warningsLimitations: [
      "مخصص للتأسيس الصرفي المبسّط؛ يُرجع في الشواهد البلاغية والتفسير اللغوي المتخصص إلى أمهات كتب اللغة.",
    ],
    correctionHistory: [],
    moduleId: "19",
    targetRoute: "/app/study?tab=tools",
  },
  {
    id: "oer_digital_literacy_source_verification",
    title: "Digital Safety, Source Checking & Anti-Misinformation",
    titleAr: "السلامة الرقمية والتحقق من موثوقية المصادر",
    subject: "Digital Literacy",
    level: "beginner",
    language: "en",
    topic: "Information Hygiene & Privacy",
    objectives: [
      "Verify author credentials, primary data sources, and publication dates.",
      "Protect personal identity by never sharing phone numbers, addresses, or passwords.",
    ],
    summary:
      "Equips students with lateral reading habits to spot manipulated statistics, phishing links, and unverified claims.",
    body: "Before trusting or sharing a striking statistic online, open a new tab (lateral reading) to check who published it, whether primary peer-reviewed evidence backs it up, and when it was last updated.",
    workedExample:
      "Checking a viral health claim: Does it cite a clinical organization (e.g., WHO, peer-reviewed journal) or only an anonymous social video selling a product?",
    authorOwner: "NEXORA Digital Ethics & Safety Working Group",
    sourceReferences: [
      "Stanford History Education Group — Civic Online Reasoning (Lateral Reading)",
      "UNESCO Media and Information Literacy Curriculum",
    ],
    publicationDate: "2026-04-20",
    lastReviewedDate: "2026-10-18",
    reviewStatus: "approved",
    reviewIntervalDays: 180,
    highStakes: false,
    license: "CC-BY-4.0",
    isDownloadablePermitted: true,
    warningsLimitations: [
      "Does not substitute for device cybersecurity software or guardian guidance for minors.",
    ],
    correctionHistory: [],
    moduleId: "16",
    targetRoute: "/app/level-up?tab=coding",
  },
  {
    id: "oer_health_first_aid_reference_gated",
    title: "Everyday Emergency Recognition & First-Aid Awareness Overview",
    titleAr: "أساسيات التثقيف الصحي والتعرّف على الحالات الطارئة",
    subject: "Health Literacy",
    level: "beginner",
    language: "bilingual",
    topic: "Preventive Habits & Emergency Escalation",
    objectives: [
      "Know when immediate professional emergency services (112 / 999 / 911) must be called.",
      "Recognize heat exhaustion warning signs during outdoor activity.",
    ],
    summary:
      "Reference index highlighting clear emergency escalation criteria and safe preventive habits. Strictly informational — reference-only without redistribution as clinical advice.",
    body: "In severe bleeding, chest pain, difficulty breathing, sudden weakness, or unresponsiveness, immediately alert an adult and call local emergency responders rather than attempting unverified remedies.",
    workedExample:
      "Outdoor sports heat check: Dizziness, heavy sweating, and nausea indicate moving to shade, sipping water if fully alert, and notifying a coach or parent promptly.",
    authorOwner: "NEXORA Student Wellbeing Editorial Team (Pending Clinical Sign-off)",
    sourceReferences: [
      "International Federation of Red Cross and Red Crescent Societies (IFRC) — First Aid Guidelines",
      "World Health Organization — Adolescent Health Literacy Notes",
    ],
    publicationDate: "2026-05-01",
    lastReviewedDate: "2026-05-01",
    reviewStatus: "under_review",
    reviewIntervalDays: 90,
    highStakes: true,
    license: "Attribution-Reference-Only",
    isDownloadablePermitted: false,
    warningsLimitations: [
      "CRITICAL MEDICAL DISCLAIMER: Educational overview only — never replaces licensed medical diagnosis, hands-on certified Red Cross/Red Crescent training, or emergency dispatch.",
      "Requires periodic qualified healthcare professional review before formal school adoption.",
    ],
    correctionHistory: [
      {
        date: "2026-05-01",
        summary:
          "Marked under_review pending external first-aid instructor review; download locked.",
        reviewerRole: "moderator",
      },
    ],
    moduleId: "07",
    targetRoute: "/app/care",
  },
];

export const FOUNDATIONAL_LEARNING_TRACKS: FoundationalTrack[] = [
  {
    id: "reading",
    title: "1. Reading & Comprehension",
    titleAr: "القراءة والاستيعاب",
    encouragementNote: "Read at your own pace — every paragraph understood builds lasting fluency.",
    targetRoute: "/app/study?tab=tools",
    steps: [
      {
        id: "fnd_read_1",
        title: "Chunking Words & Topic Sentences",
        concept:
          "Break unfamiliar words into syllables and locate the first sentence carrying the main point.",
        workedExample: "'Con-ser-va-tion' -> protecting natural resources like water and soil.",
        checkQuestion:
          "Where is the main idea of an informational paragraph most commonly introduced?",
        options: [
          "In the opening topic sentence",
          "Only in the bibliography",
          "In random footnotes",
        ],
        correctIndex: 0,
      },
      {
        id: "fnd_read_2",
        title: "Separating Fact from Opinion",
        concept:
          "Facts can be verified with evidence or measurements; opinions express personal judgement.",
        workedExample:
          "'Water boils at 100°C at sea level' (Fact) vs. 'Winter is the best season' (Opinion).",
        checkQuestion: "Which statement is verifiable as a fact?",
        options: [
          "The library opens at 8:00 AM on weekdays.",
          "History is much harder than math.",
          "Green is the prettiest notebook colour.",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "writing",
    title: "2. Clear Writing & Expression",
    titleAr: "الكتابة والتعبير الواضح",
    encouragementNote: "Strong writers revise drafts calmly — clarity matters more than big words.",
    targetRoute: "/app/english",
    steps: [
      {
        id: "fnd_write_1",
        title: "Subject-Verb-Object Clarity",
        concept:
          "Start with a concrete actor, active verb, and specific outcome before adding clauses.",
        workedExample:
          "Clear: 'Students tested three soil samples.' instead of vague passive filler.",
        checkQuestion: "Which sentence communicates its meaning most directly?",
        options: [
          "The solar panel charged the battery in two hours.",
          "Things regarding energy happened with the device.",
          "It was done by various means.",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "mathematics",
    title: "3. Foundational Mathematics",
    titleAr: "أساسيات الرياضيات",
    encouragementNote:
      "Mistakes show where intuition is growing — check units and work step by step.",
    targetRoute: "/app/study?tab=math",
    steps: [
      {
        id: "fnd_math_1",
        title: "Place Value, Fractions & Percentages",
        concept: "Percentages mean parts per hundred: 25% = 25/100 = 1/4 = 0.25.",
        workedExample: "20% of 50 pages = 0.20 x 50 = 10 pages read.",
        checkQuestion: "What fraction equals 50%?",
        options: ["1/2", "1/5", "2/3"],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "basic_science",
    title: "4. Basic Science & Observation",
    titleAr: "العلوم الأساسية والملاحظة",
    encouragementNote: "Curiosity begins with careful observation and asking 'why' honestly.",
    targetRoute: "/app/study?tab=science",
    steps: [
      {
        id: "fnd_sci_1",
        title: "Observation, Hypothesis & Fair Testing",
        concept:
          "Change one variable while keeping other conditions equal to observe reliable patterns.",
        workedExample:
          "Compare plant height in sunny vs. shaded windows using equal water and identical soil.",
        checkQuestion: "Why do scientists hold other variables constant during a fair test?",
        options: [
          "To be sure the measured change comes from the tested factor",
          "To finish without taking any measurements",
          "To guarantee the hypothesis is never questioned",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "english",
    title: "5. English Foundations",
    titleAr: "أساسيات اللغة الإنجليزية",
    encouragementNote: "Daily short listening and high-frequency phrases unlock steady confidence.",
    targetRoute: "/app/english",
    steps: [
      {
        id: "fnd_eng_1",
        title: "Everyday Tense Anchors",
        concept:
          "Use Present Simple for routines ('I study daily') and Past Simple for finished events ('I revised yesterday').",
        workedExample: "Yesterday we reviewed three new science terms together.",
        checkQuestion: "Choose the sentence expressing a finished action yesterday:",
        options: [
          "She completed her reading summary last night.",
          "She completes her reading summary tomorrow.",
          "She completing her reading summary.",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "arabic",
    title: "6. Arabic Foundations (العربية)",
    titleAr: "تأسيس اللغة العربية",
    encouragementNote: "بالتدريج والتأمل تصبح الجملة العربية واضحة وممتعة القراءة.",
    targetRoute: "/app/quran",
    steps: [
      {
        id: "fnd_ar_1",
        title: "الجملة الاسمية والفعلية والجذر",
        concept:
          "الجملة الاسمية تبدأ باسم (مبتدأ + خبر)، والجملة الفعلية تبدأ بفعل وفاعل، والرجوع للجذر يكشف المعنى.",
        workedExample: "«العلمُ نورٌ» (جملة اسمية)، «قرأَ الطالبُ الدرسَ» (جملة فعلية).",
        checkQuestion: "أيٌّ مما يلي يُعدّ جملة فعلية صحيحة؟",
        options: ["كتبَ الباحثُ الملاحظةَ بدقةٍ", "المدرسةُ قريبةٌ من البيتِ", "الكتابُ مفيدٌ جدًّا"],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "digital_literacy",
    title: "7. Digital Literacy & Online Safety",
    titleAr: "محو الأمية الرقمية والأمان",
    encouragementNote: "Safe digital habits protect both your focus and your privacy.",
    targetRoute: "/app/level-up?tab=coding",
    steps: [
      {
        id: "fnd_dig_1",
        title: "Private Credentials & Link Verification",
        concept:
          "Never share passwords, OTP codes, or personal home details online; inspect URLs before signing in.",
        workedExample:
          "Verify HTTPS domain spelling before entering any school or account password.",
        checkQuestion:
          "What should you do if an unknown message asks for your account verification code?",
        options: [
          "Never share the code and report/ignore the message",
          "Send it immediately to be polite",
          "Post it in a public group chat",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "study_skills",
    title: "8. Study Skills & Active Recall",
    titleAr: "مهارات المذاكرة والاسترجاع النشط",
    encouragementNote: "Short spaced sessions beat exhausting late-night cramming every time.",
    targetRoute: "/app/study?tab=flashcards",
    steps: [
      {
        id: "fnd_std_1",
        title: "Active Recall + Spaced Repetition",
        concept:
          "Closing the book to test yourself strengthens memory far more than passive re-reading.",
        workedExample:
          "Study 25 minutes -> close notes -> write 3 key ideas from memory -> check gaps.",
        checkQuestion: "Which study habit produces stronger long-term retention?",
        options: [
          "Testing yourself without notes and revisiting over several days",
          "Highlighting every sentence without pausing to recall",
          "Pulling an all-night marathon right before the test",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "research_skills",
    title: "9. Research & Source Evaluation",
    titleAr: "مهارات البحث وتقييم المصادر",
    encouragementNote:
      "Always trace claims back to primary evidence and acknowledge authors honestly.",
    targetRoute: "/app/study?tab=tools",
    steps: [
      {
        id: "fnd_res_1",
        title: "Primary Sources & Honest Citation",
        concept:
          "Distinguish original studies/documents from summaries and credit every external source clearly.",
        workedExample:
          "Cite author, title, year, and publication when quoting data in a school report.",
        checkQuestion: "Why is citing original authors essential in student research?",
        options: [
          "It preserves intellectual honesty and lets readers verify claims",
          "It hides where ideas came from",
          "It replaces the need to read the evidence",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "critical_thinking",
    title: "10. Critical Thinking & Logic",
    titleAr: "التفكير النقدي والمنطق",
    encouragementNote:
      "Questioning assumptions gently leads to wiser decisions and clearer thinking.",
    targetRoute: "/app/future",
    steps: [
      {
        id: "fnd_crit_1",
        title: "Correlation vs. Causation & Counter-Examples",
        concept:
          "Two trends happening together do not prove one caused the other until confounding factors are checked.",
        workedExample:
          "Ice cream sales and sunburns both rise in July because hot summer weather drives both.",
        checkQuestion:
          "If two metrics rise together during the same month, what is the careful first step?",
        options: [
          "Check for a shared third factor or controlled evidence before claiming causation",
          "Assume the first item definitely caused the second",
          "Ignore all exceptions",
        ],
        correctIndex: 0,
      },
    ],
  },
];

export const HEALTH_LITERACY_GUIDES: HealthLiteracyCard[] = [
  {
    id: "hl_emergency_escalation",
    title: "Recognizing Urgent Red Flags & Calling Emergency Help",
    titleAr: "التعرّف على مؤشرات الطوارئ والتواصل الفوري مع الإسعاف",
    topic: "Emergency Awareness",
    summary:
      "Knowing when to stop self-help and immediately seek trained medical or emergency assistance protects lives.",
    safeChecklist: [
      "Keep local emergency dispatch numbers posted at home and school (e.g., 112 Kuwait/EU, 999, 911).",
      "Alert a responsible adult, school nurse, or emergency responder immediately for trouble breathing, severe bleeding, fainting, chest pain, or suspected poisoning.",
      "Do not move a person with suspected head, neck, or spine injury unless immediate danger threatens them.",
    ],
    whenToSeekEmergencyCare:
      "Immediately for unresponsiveness, breathing difficulty, severe allergic swelling, uncontrolled bleeding, or sudden confusion.",
    sourceAttribution: "IFRC First Aid Reference Principles · Requires Qualified Clinical Review",
    lastReviewedDate: "2026-05-01",
    requiresQualifiedReview: true,
  },
  {
    id: "hl_heat_hydration",
    title: "Hydration & Heat-Safety Awareness for Students",
    titleAr: "الوقاية من الإجهاد الحراري والجفاف للطلاب",
    topic: "Preventive Everyday Habits",
    summary:
      "Recognizing early dehydration and heat fatigue during warm-climate commutes or sports keeps study focus steady.",
    safeChecklist: [
      "Drink clean water steadily across the day rather than waiting until severe thirst appears.",
      "Rest in shade and loosen tight outer layers if feeling dizzy or overly flushed outdoors.",
      "Notify a coach, teacher, or guardian immediately if dizziness or nausea persists.",
    ],
    whenToSeekEmergencyCare:
      "Seek urgent medical care if someone stops sweating despite extreme heat, becomes confused, vomits repeatedly, or faints.",
    sourceAttribution: "WHO Heat-Health Awareness Notes · Requires Qualified Clinical Review",
    lastReviewedDate: "2026-05-01",
    requiresQualifiedReview: true,
  },
];

export const ISLAMIC_FOUNDATIONS_INDEX: IslamicFoundationsGuide = {
  authenticQuranRoots: [
    {
      root: "ع - ل - م",
      transliteration: "ʿ-L-M (ʿIlm — Knowledge)",
      meaning: "Knowing, understanding clearly, marking or recognizing truth.",
      studyNote:
        "Appears across the Quran emphasizing reflection, clarity, and seeking beneficial understanding.",
      verifiedSource: "Al-Mufradat fi Gharib al-Quran — Al-Raghib al-Isfahani",
    },
    {
      root: "ق - ر - أ",
      transliteration: "Q-R-ʾ (Qira'ah — Reading / Reciting)",
      meaning: "Gathering letters and reciting with reflection and clarity.",
      studyNote:
        "Root of 'Iqra' in the opening verses of Surah Al-ʿAlaq (96:1), highlighting literacy and reflection.",
      verifiedSource: "Lisan al-Arab & Tafsir Ibn Kathir (lexical reference)",
    },
    {
      root: "ر - ح - م",
      transliteration: "R-Ḥ-M (Raḥmah — Mercy & Compassion)",
      meaning: "Gentle care, mercy, and steadfast kindness toward creation.",
      studyNote: "Forms Al-Rahman and Al-Rahim opening every Surah (except Surah Al-Tawbah).",
      verifiedSource: "Al-Mufradat fi Gharib al-Quran — Al-Raghib al-Isfahani",
    },
  ],
  tajweedBasics: [
    {
      rule: "Al-Qalqalah (القلقلة)",
      ruleAr: "القلقلة (ق ط ب ج د)",
      explanation:
        "A clear, slight echoing release of the five letters (ق، ط، ب، ج، د) when carrying a sukoon or paused upon.",
      classicalReference: "Al-Muqaddimah al-Jazariyyah — Imam Ibn al-Jazari",
    },
    {
      rule: "Idgham (الإدغام)",
      ruleAr: "الإدغام",
      explanation:
        "Smoothly merging a vowelless Noon Sakinah (نْ) or Tanween into one of the six letters (ي ر م ل و ن) according to ghunnah rules.",
      classicalReference: "Tuhfat al-Atfal — Imam Sulayman al-Jamzuri",
    },
    {
      rule: "Al-Madd (المد)",
      ruleAr: "المد الطبيعي والفرعي",
      explanation:
        "Measured elongation of Arabic vowel sounds (ا، و، ي), preserving the 2-count natural madd or extended counts where required.",
      classicalReference: "Tuhfat al-Atfal & Tajweed Science Consensus",
    },
  ],
  hadithGradingStandards: [
    {
      grade: "Sahih (صحيح)",
      gradeAr: "صحيح",
      definition:
        "Connected chain of trustworthy, accurate narrators without hidden defect (ʿillah) or contradiction (shudhudh).",
      verificationStandard:
        "Requires verified authentication by classical muhaddith scholars (e.g., Sahih al-Bukhari, Sahih Muslim).",
    },
    {
      grade: "Hasan (حسن)",
      gradeAr: "حسن",
      definition:
        "Connected chain meeting soundness criteria with slightly lighter precision than Sahih, free from defect or anomaly.",
      verificationStandard:
        "Classified by recognized hadith critics (e.g., Imam al-Tirmidhi, Ibn Hajar al-Asqalani).",
    },
    {
      grade: "Da'if (ضعيف) & Mawdu' (موضوع)",
      gradeAr: "ضعيف وموضوع",
      definition:
        "Narrations missing chain continuity/precision (Da'if) or fabricated attributions (Mawdu' — strictly rejected).",
      verificationStandard:
        "NEXORA never generates, invents, or paraphrases unverified hadith texts; always check primary graded collections.",
    },
  ],
  seerahStudyIndex: [
    {
      era: "Makkah Period",
      milestone: "Early Revelation, Integrity & Perseverance",
      classicalSources: "Al-Sirah al-Nabawiyyah (Ibn Hisham); Ar-Raheeq Al-Makhtum",
    },
    {
      era: "Madinah Period",
      milestone: "Community Charter, Brotherhood, Knowledge & Justice",
      classicalSources: "Al-Sirah al-Nabawiyyah (Ibn Hisham); Zad al-Ma'ad (Ibn al-Qayyim)",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* SIX LEGACY INITIATIVES: EXTENDED TYPES & SEED DATASETS                    */
/* -------------------------------------------------------------------------- */

export type CommunityCollectionKind =
  "foundational" | "science" | "languages" | "mathematics" | "life_skills" | "teacher_curated";

export type CommunityResourceKind = "book" | "lesson" | "worksheet" | "guide" | "reference";

export interface CommunityLibraryResource {
  id: string;
  title: string;
  titleAr: string;
  collection: CommunityCollectionKind;
  resourceKind: CommunityResourceKind;
  subject: string;
  gradeBand: string;
  level: "beginner" | "intermediate" | "advanced";
  language: "en" | "ar" | "bilingual";
  learningObjectives: string[];
  summary: string;
  content: string;
  author: string;
  authorRole: "educator" | "approved_contributor" | "student_mentor";
  sourceAttribution: string;
  license: ResourceLicense;
  isDownloadablePermitted: boolean;
  downloadSizeBytes: number;
  teacherCurated: boolean;
  reviewStatus: ContentReviewStatus;
  lastReviewedDate: string;
  qualityScore: { clarity: number; depth: number; accuracy: number; accessibility: number };
}

export type PedagogicalModelKind =
  "5e_inquiry" | "direct_instruction" | "socratic_seminar" | "differentiated_stations";

export interface TeachingGuideRecord {
  id: string;
  title: string;
  titleAr: string;
  subject: string;
  pedagogicalModel: PedagogicalModelKind;
  targetGrade: string;
  learningObjective: string;
  remedialAccommodations: string[];
  extensionChallenges: string[];
  printableWorksheetOutline: string;
  multiAngleExplanations: {
    visualDiagramPrompt: string;
    realWorldAnalogy: string;
    everydayApplication: string;
    stepByStepLogic: string;
  };
  author: string;
  version: number;
  qualityRating: { clarity: number; depth: number; accuracy: number; accessibility: number };
  ratingCount?: number;
  supervisorApproved: boolean;
  safetyNotice: string;
  updatedAt: string;
}

export interface OfflineLearningPack {
  id: string;
  title: string;
  titleAr: string;
  subject: string;
  approxSizeBytes: number;
  resourceIds: string[];
  isFullyOfflineCapable: boolean;
  offlineFeaturesList: string[];
  onlineOnlyNotice: string;
  version: string;
}

export interface KnowledgeLegacyContribution {
  id: string;
  title: string;
  titleAr: string;
  contributorName: string;
  contributorRole: "student" | "teacher" | "volunteer_scholar";
  subject: string;
  originalExplanation: string;
  license: ResourceLicense;
  copyrightRetentionClause: string;
  approvedDate: string;
  versionHistory: Array<{
    version: number;
    date: string;
    changeSummary: string;
    reviewer: string;
  }>;
  status: "active" | "deprecated_outdated" | "archived";
  deprecationNotice?: string;
}

export type RealWorldGoodCategory =
  | "reading_initiative"
  | "educational_support"
  | "digital_literacy"
  | "environmental_awareness"
  | "accessibility_awareness"
  | "science_education"
  | "community_knowledge_sharing"
  | "responsible_tech"
  | "student_led_learning";

export interface RealWorldProjectRecord {
  id: string;
  category: RealWorldGoodCategory;
  title: string;
  problemDefinition: string;
  intendedBeneficiaries: string;
  educationalPurpose: string;
  safeActivityPlan: string;
  requiredPermissions: string[];
  supervisorName: string;
  adultSupervised: boolean;
  expectedOutcomes: string;
  evidenceSummary: string;
  reflectionAndLessons: string;
  impactMetricValue: number;
  impactMetricLabel: string;
  teamAliases?: string[];
  milestones?: Array<{ id: string; title: string; done: boolean }>;
  showcaseOptIn: boolean;
  status: "draft" | "in_progress" | "completed_verified";
  createdAt: string;
}

export interface ArchivePreservationRecord {
  id: string;
  resourceId: string;
  title: string;
  checksum: string;
  contentDigest: string;
  originalSource: string;
  preservedAt: string;
  nextReviewDueDate?: string;
  preservationStatus: "preserved_active" | "preserved_archived" | "review_required";
  version: string;
  duplicateDetected: boolean;
  brokenLinkRisk: boolean;
  exportFormat: "json" | "markdown";
}

/* -------------------------------------------------------------------------- */
/* SEED DATASETS FOR THE SIX INITIATIVES                                      */
/* -------------------------------------------------------------------------- */

export const INITIAL_COMMUNITY_LIBRARY_RESOURCES: CommunityLibraryResource[] = [
  {
    id: "com_lib_fraction_foundations",
    title: "Visual Fraction Mastery & Partitioning Guide",
    titleAr: "دليل إتقان الكسور وتجزئة المساحات البصرية",
    collection: "foundational",
    resourceKind: "worksheet",
    subject: "Mathematics",
    gradeBand: "Grade 5-7",
    level: "beginner",
    language: "bilingual",
    learningObjectives: [
      "Decompose fractions into unit fractions with visual area models.",
      "Identify common denominators through real pizza and tile examples.",
    ],
    summary:
      "A classroom-tested worksheet that transforms abstract fraction addition into simple grid partitioning.",
    content:
      "Step 1: Draw a rectangle. Divide horizontally for fraction A. Divide vertically for fraction B. Step 2: Count overlapping units. Step 3: Add units directly without memorizing arbitrary rules.",
    author: "Fatima Al-Mansour (Mathematics Specialist)",
    authorRole: "educator",
    sourceAttribution: "NEXORA Math Commons & OpenStax Prealgebra (CC-BY 4.0)",
    license: "CC-BY-4.0",
    isDownloadablePermitted: true,
    downloadSizeBytes: 42000,
    teacherCurated: true,
    reviewStatus: "approved",
    lastReviewedDate: "2026-10-15",
    qualityScore: { clarity: 5, depth: 4, accuracy: 5, accessibility: 5 },
  },
  {
    id: "com_lib_photosynthesis_lab",
    title: "Light & Plant Energy Transfer: The Simple Leaf Lab",
    titleAr: "التمثيل الضوئي وانتقال الطاقة: تجربة ورقة الشجر المبسطة",
    collection: "science",
    resourceKind: "guide",
    subject: "Basic Science",
    gradeBand: "Grade 7-9",
    level: "beginner",
    language: "en",
    learningObjectives: [
      "Observe oxygen bubbles produced by Elodea under variable light distances.",
      "Understand the chemical equation for glucose synthesis from water and carbon dioxide.",
    ],
    summary:
      "A safe household experiment demonstrating energy conservation and gas exchange in green plants.",
    content:
      "Place sprig in clear water cup with 1 pinch baking soda (dissolved CO2). Count bubbles at 10cm, 20cm, and 40cm lamp distance over 3 minutes. Note how bubble rate decreases with the inverse square of distance.",
    author: "Dr. Tariq Al-Husseini (Biology Educator)",
    authorRole: "educator",
    sourceAttribution: "NEXORA Science Discovery Commons",
    license: "CC-BY-4.0",
    isDownloadablePermitted: true,
    downloadSizeBytes: 38500,
    teacherCurated: true,
    reviewStatus: "approved",
    lastReviewedDate: "2026-09-30",
    qualityScore: { clarity: 5, depth: 5, accuracy: 5, accessibility: 4 },
  },
  {
    id: "com_lib_arabic_root_dictionary",
    title: "The 30 Most Frequent Quranic & Classical Arabic Roots",
    titleAr: "أهم 30 جذراً لغوياً في القرآن الكريم والعربية الفصحى",
    collection: "languages",
    resourceKind: "reference",
    subject: "Arabic",
    gradeBand: "Universal",
    level: "beginner",
    language: "bilingual",
    learningObjectives: [
      "Derive past, present, active participle, and verbal noun forms from 3-letter roots.",
      "Understand morphological patterns (Awzan: Fa'ala, Taf'eel, Mufa'alah).",
    ],
    summary:
      "Systematic lookup reference explaining how 30 tri-literal roots form over 600 common Arabic vocabulary words.",
    content:
      "Root ك-ت-ب (K-T-B) -> كتب (wrote), كاتب (author), كتاب (book), مكتبة (library), مكتوب (written destiny). Root ع-ل-م (ʿ-L-M) -> علم (knowledge), عليم (all-knowing), معلم (teacher), تعليم (education).",
    author: "Ustadh Ahmad Al-Zahrani",
    authorRole: "approved_contributor",
    sourceAttribution: "Mu'jam Maqayis al-Lughah (Ibn Faris); Hans Wehr Dictionary (CC Citation)",
    license: "CC-BY-SA-4.0",
    isDownloadablePermitted: true,
    downloadSizeBytes: 64000,
    teacherCurated: true,
    reviewStatus: "approved",
    lastReviewedDate: "2026-10-10",
    qualityScore: { clarity: 5, depth: 5, accuracy: 5, accessibility: 5 },
  },
  {
    id: "com_lib_digital_security_hygiene",
    title: "Student Cyber Defense & Password Entropy Handbook",
    titleAr: "دليل الطالب للأمن الرقمي وتوليد كلمات المرور القوية",
    collection: "life_skills",
    resourceKind: "guide",
    subject: "Digital Literacy",
    gradeBand: "Grade 6-12",
    level: "beginner",
    language: "bilingual",
    learningObjectives: [
      "Recognize phishing lures, spoofed domains, and social engineering tricks.",
      "Create high-entropy 4-word passphrases instead of complex short passwords.",
    ],
    summary:
      "Practical safety steps every student needs to protect personal accounts and verify links before clicking.",
    content:
      "Rule 1: Length beats complexity — 'green-camel-jumping-sky' (26 characters) takes centuries to crack. Rule 2: Inspect domain extensions (e.g. nexora.org vs nex0ra-login.info). Rule 3: Never share 2FA codes with anyone.",
    author: "NEXORA Cybersecurity Volunteer Guild",
    authorRole: "approved_contributor",
    sourceAttribution: "NIST Special Publication 800-63B; EFF Digital Security Commons",
    license: "NEXORA-OER-FREE",
    isDownloadablePermitted: true,
    downloadSizeBytes: 31000,
    teacherCurated: true,
    reviewStatus: "approved",
    lastReviewedDate: "2026-10-25",
    qualityScore: { clarity: 5, depth: 4, accuracy: 5, accessibility: 5 },
  },
];

export const INITIAL_TEACHING_GUIDES: TeachingGuideRecord[] = [
  {
    id: "teach_guide_inquiry_gravity",
    title: "5E Inquiry Unit: Gravity, Acceleration & Air Resistance",
    titleAr: "وحدة الاستقصاء (5E): الجاذبية والتسارع ومقاومة الهواء",
    subject: "Physics",
    pedagogicalModel: "5e_inquiry",
    targetGrade: "Grade 8-9",
    learningObjective:
      "Students demonstrate that all objects accelerate at 9.8 m/s² in vacuum regardless of mass.",
    remedialAccommodations: [
      "Use paired video clips showing hammer vs feather drop on Apollo 15 moon surface.",
      "Provide pre-drawn comparison charts with vocabulary definitions before the lab.",
    ],
    extensionChallenges: [
      "Calculate terminal velocity formulas for coffee filters falling through still air.",
      "Program a simulated free-fall velocity graph using simple spreadsheet equations.",
    ],
    printableWorksheetOutline:
      "Section A: Prediction table. Section B: Height vs Drop Time timer recording sheet. Section C: Conclusion and error source reflections.",
    multiAngleExplanations: {
      visualDiagramPrompt:
        "Downward force vector (Weight = mg) countered by upward air drag vector.",
      realWorldAnalogy:
        "Dropping a flat sheet of paper versus the same sheet crumpled into a tight ball.",
      everydayApplication:
        "Parachute design for safe payload drops and automotive aerodynamic braking.",
      stepByStepLogic:
        "Step 1: Newton's Second Law F=ma. Step 2: Weight = mg. Step 3: ma = mg - F_drag. Step 4: When F_drag=0, a=g.",
    },
    author: "Professor Laila Ibrahim (STEM Teaching Fellow)",
    version: 2,
    qualityRating: { clarity: 5, depth: 5, accuracy: 5, accessibility: 5 },
    supervisorApproved: true,
    safetyNotice:
      "Strict child protection: No unsupervised private contact between minors and unknown adults. All student queries must be addressed in open teacher-moderated forums.",
    updatedAt: "2026-10-20",
  },
  {
    id: "teach_guide_argumentative_writing",
    title: "Direct Instruction Workshop: Counter-Arguments & Rebuttals",
    titleAr: "ورشة التعليم المباشر: الحجج المضادة والتفنيد المنطقي",
    subject: "English & Writing",
    pedagogicalModel: "direct_instruction",
    targetGrade: "Grade 9-11",
    learningObjective:
      "Students integrate a concession ('Although opponents claim...') and effective rebuttal to strengthen persuasive essays.",
    remedialAccommodations: [
      "Provide fill-in sentence frames for concession ('While it is true that [X], evidence demonstrates that [Y]').",
      "Color-code sample essay paragraphs: Claim (Blue), Counter-argument (Yellow), Rebuttal (Green).",
    ],
    extensionChallenges: [
      "Identify logical fallacies (strawman, false dilemma) in editorial excerpts.",
      "Write two competing paragraphs defending opposite sides of an environmental debate.",
    ],
    printableWorksheetOutline:
      "Examine three claims. For each, draft one opposing counter-argument and construct a strong rebuttal with cited evidence.",
    multiAngleExplanations: {
      visualDiagramPrompt:
        "A scale balance where adding counter-weight and rebuttal balance creates unshakeable equilibrium.",
      realWorldAnalogy:
        "A courtroom defense anticipating the prosecutor's question before it is asked.",
      everydayApplication:
        "Convincing a school board to install solar panels by addressing upfront installation costs first.",
      stepByStepLogic:
        "1. State counter-claim fairly. 2. Acknowledge partial validity. 3. Introduce stronger countervailing data. 4. Reaffirm thesis.",
    },
    author: "Marcus Vance (Secondary English Lead)",
    version: 1,
    qualityRating: { clarity: 5, depth: 4, accuracy: 5, accessibility: 5 },
    supervisorApproved: true,
    safetyNotice:
      "Strict child protection: All peer review rubrics are shared transparently with class educators; zero private backchannels.",
    updatedAt: "2026-09-18",
  },
];

export const INITIAL_OFFLINE_LEARNING_PACKS: OfflineLearningPack[] = [
  {
    id: "pack_foundational_math",
    title: "Foundational Mathematics Pack (From Zero to Ratios)",
    titleAr: "حزمة الرياضيات التأسيسية (من الصفر إلى النسب)",
    subject: "Mathematics",
    approxSizeBytes: 42000,
    resourceIds: ["oer_math_fractions_ratios", "com_lib_fraction_foundations"],
    isFullyOfflineCapable: true,
    offlineFeaturesList: [
      "Interactive Step-by-Step Problem Solver",
      "Visual Fraction & Decimal Practice",
      "Formula Cheat Sheets & Unit Rates",
      "Local Quiz Self-Grading Engine",
    ],
    onlineOnlyNotice: "AI Live Voice explanations and external link resolution require internet.",
    version: "2026.11",
  },
  {
    id: "pack_reading_literacy",
    title: "Reading & Active Literacy Pack (Comprehension & Vocabulary)",
    titleAr: "حزمة القراءة والاستيعاب النشط وتنمية المفردات",
    subject: "Reading & Literacy",
    approxSizeBytes: 38000,
    resourceIds: ["oer_reading_active_comprehension"],
    isFullyOfflineCapable: true,
    offlineFeaturesList: [
      "SQ3R Structured Paragraph Reader",
      "Focus Reading High-Contrast Mode",
      "Offline Personal Vocabulary Notebook",
      "Inference & Main Idea Checkers",
    ],
    onlineOnlyNotice: "Cloud sync of reading logs across multiple devices requires internet.",
    version: "2026.11",
  },
  {
    id: "pack_science_fundamentals",
    title: "Science Fundamentals & Lab Safety Pack",
    titleAr: "حزمة أساسيات العلوم والسلامة التجريبية",
    subject: "Science",
    approxSizeBytes: 44000,
    resourceIds: ["oer_science_controlled_variables", "com_lib_photosynthesis_lab"],
    isFullyOfflineCapable: true,
    offlineFeaturesList: [
      "Scientific Method & Variable Isolation Guides",
      "Safe Household Experiment Worksheets",
      "Periodic Table Reference & Atom Models",
      "Hypothesis Testing Templates",
    ],
    onlineOnlyNotice: "3D WebGL anatomical model rendering may require cache initialization.",
    version: "2026.11",
  },
  {
    id: "pack_digital_safety_study",
    title: "Digital Safety, Cybersecurity & Study Skills Pack",
    titleAr: "حزمة الأمان الرقمي ومهارات المذاكرة الفعالة",
    subject: "Life Skills",
    approxSizeBytes: 36000,
    resourceIds: ["com_lib_digital_security_hygiene", "oer_digital_literacy_source_verification"],
    isFullyOfflineCapable: true,
    offlineFeaturesList: [
      "Password Entropy & Phishing Recognition Guides",
      "Pomodoro Focus Timer & Task Checklist",
      "Spaced Repetition Flashcard Engine",
      "Local Error Recovery Journal",
    ],
    onlineOnlyNotice: "Submitting error reports or community contributions requires internet.",
    version: "2026.11",
  },
];

export const INITIAL_KNOWLEDGE_LEGACY_CONTRIBUTIONS: KnowledgeLegacyContribution[] = [
  {
    id: "leg_contr_pythagorean_proof",
    title: "The Origami & Tile Proof of the Pythagorean Theorem",
    titleAr: "البرهان البصري لنظرية فيثاغورس عبر تجزئة المربعات",
    contributorName: "Yousef K. (Student Peer Tutor)",
    contributorRole: "student",
    subject: "Mathematics",
    originalExplanation:
      "By placing four identical right triangles inside a square of side (a+b), the uncovered center area is exactly c². Rearranging the four triangles into two rectangles leaves uncovered area a² + b². Therefore a² + b² = c².",
    license: "CC-BY-4.0",
    copyrightRetentionClause:
      "Contributor retains original moral and legal authorship; published under open CC-BY-4.0 license for non-commercial student benefit.",
    approvedDate: "2026-10-05",
    versionHistory: [
      {
        version: 1,
        date: "2026-10-05",
        changeSummary: "Original student visual proof approved by mathematics moderator.",
        reviewer: "Fatima Al-Mansour",
      },
    ],
    status: "active",
  },
  {
    id: "leg_contr_cell_organelles_analogy",
    title: "The Smart City Analogy for Living Cell Organelles",
    titleAr: "تشبيه المدينة الذكية لعضيات الخلية الحية",
    contributorName: "Reem Al-Mutawa (Student Science Ambassador)",
    contributorRole: "student",
    subject: "Biology",
    originalExplanation:
      "Nucleus = City Hall (contains blueprints). Mitochondria = Power Plant (generates ATP electricity). Ribosomes = Small factories (assemble proteins). Cell Membrane = Border checkpoints (regulates traffic).",
    license: "CC-BY-SA-4.0",
    copyrightRetentionClause:
      "Contributor retains original moral authorship; published under CC-BY-SA-4.0 for community educational use.",
    approvedDate: "2026-09-12",
    versionHistory: [
      {
        version: 1,
        date: "2026-09-12",
        changeSummary: "Initial peer contribution published with verified biological diagrams.",
        reviewer: "Dr. Tariq Al-Husseini",
      },
    ],
    status: "active",
  },
];

export const INITIAL_REAL_WORLD_GOOD_PROJECTS: RealWorldProjectRecord[] = [
  {
    id: "rwg_proj_school_paper_recycle",
    category: "environmental_awareness",
    title: "Campus Zero-Waste Paper Audit & Notebook Binding Initiative",
    problemDefinition:
      "Over 45 kilograms of single-sided printouts were discarded weekly across middle school study lounges without recycling options.",
    intendedBeneficiaries:
      "120 primary grade students receiving free recycled practice notebooks, and school ecology.",
    educationalPurpose:
      "Apply statistical data collection, mass measurement, and resource conservation ethics in a school community.",
    safeActivityPlan:
      "Clean collection bins placed by library copy machines. Weekly sorting under teacher supervision. Re-binding clean half-pages into scratch pads.",
    requiredPermissions: ["School Principal Approval", "Campus Facilities Team Agreement"],
    supervisorName: "Teacher Huda Al-Sabah (Ecology Advisor)",
    adultSupervised: true,
    expectedOutcomes:
      "Collect 100kg paper, bind 250 student scratch pads, reduce waste volume by 60%.",
    evidenceSummary:
      "Photographed 260 completed bound scratch pads delivered to elementary homework club; weighed 112 kg total diverted paper.",
    reflectionAndLessons:
      "Students learned that consistent sorting systems matter more than one-time cleanups. Peer participation grew when clean pads were distributed.",
    impactMetricValue: 120,
    impactMetricLabel: "Students supplied with free recycled study notebooks",
    showcaseOptIn: true,
    status: "completed_verified",
    createdAt: "2026-10-18",
  },
  {
    id: "rwg_proj_digital_grandparents",
    category: "digital_literacy",
    title: "Community Elders Digital Safety & Health Portal Clinic",
    problemDefinition:
      "Neighborhood seniors struggle with hospital appointment apps, prescription refills, and SMS scam verification.",
    intendedBeneficiaries:
      "35 senior community members in the local neighborhood community center.",
    educationalPurpose:
      "Teach students communication empathy, patience, cybersecurity instruction, and clear step-by-step user onboarding.",
    safeActivityPlan:
      "Weekend 2-hour guided clinic at public library conference hall. Adult family members present. Students assist on paper checklists only — no handling of passwords.",
    requiredPermissions: ["Community Center Directorate Permit", "Parental Consent Forms"],
    supervisorName: "Khaled Al-Ghanim (Community Coordinator)",
    adultSupervised: true,
    expectedOutcomes:
      "Guide 30 seniors on booking medical visits safely and identifying fraudulent bank messages.",
    evidenceSummary:
      "35 seniors completed the 4-step checklist; community center signed letter of appreciation.",
    reflectionAndLessons:
      "Large-print cheat sheets were far more effective than digital explanations. Explaining tech simply reinforces our own mastery.",
    impactMetricValue: 35,
    impactMetricLabel: "Senior citizens trained in secure medical portal navigation",
    showcaseOptIn: true,
    status: "completed_verified",
    createdAt: "2026-10-28",
  },
];

const SEED_ARCHIVE_BASE: Array<Omit<ArchivePreservationRecord, "checksum">> = [
  {
    id: "arc_oer_reading_comprehension",
    resourceId: "oer_reading_active_comprehension",
    title: "SQ3R & Structured Paragraph Comprehension",
    contentDigest: "sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    originalSource: "Robinson, F. P. (1946). Effective Study — SQ3R Method",
    preservedAt: "2026-10-01T08:00:00Z",
    nextReviewDueDate: "2027-04-01",
    preservationStatus: "preserved_active",
    version: "1.2.0",
    duplicateDetected: false,
    brokenLinkRisk: false,
    exportFormat: "markdown",
  },
  {
    id: "arc_oer_math_fractions",
    resourceId: "oer_math_fractions_ratios",
    title: "Visual Fractions, Proportions & Unit Rates",
    contentDigest: "sha256_ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
    originalSource: "OpenStax Prealgebra (CC-BY 4.0)",
    preservedAt: "2026-09-20T10:30:00Z",
    nextReviewDueDate: "2027-03-20",
    preservationStatus: "preserved_active",
    version: "1.1.0",
    duplicateDetected: false,
    brokenLinkRisk: false,
    exportFormat: "json",
  },
  {
    id: "arc_oer_science_experiments",
    resourceId: "oer_science_controlled_variables",
    title: "Designing Safe Controlled Experiments",
    contentDigest: "sha256_4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    originalSource: "National Science Teaching Association (NSTA Inquiry Standards)",
    preservedAt: "2026-10-12T14:15:00Z",
    nextReviewDueDate: "2027-04-12",
    preservationStatus: "preserved_active",
    version: "1.0.1",
    duplicateDetected: false,
    brokenLinkRisk: false,
    exportFormat: "markdown",
  },
];

export const INITIAL_ARCHIVE_PRESERVATION_RECORDS: ArchivePreservationRecord[] =
  SEED_ARCHIVE_BASE.map((rec) => ({
    ...rec,
    checksum: computeCanonicalArchiveDigest(rec),
  }));
