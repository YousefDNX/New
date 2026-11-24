export interface CurriculumUnitPlan {
  id: string;
  country: string;
  system: string;
  grade: string;
  subject: "English" | "Mathematics" | "Science" | "Coding & AI";
  unitTitle: string;
  contentStatus: "curated_anchor" | "general_learning";
  contentStatusNote: string;
  learningObjectives: string[];
  prerequisites: string[];
  knowledgeNodeId: string;
  estimatedMinutes: number;
  linkedRoute: "/app/english" | "/app/study" | "/app/future" | "/app/ai";
  sampleCheck: {
    question: string;
    options: [string, string, string, string];
    correctIndex: 0 | 1 | 2 | 3;
    explanation: string;
  };
}

export const CURRICULUM_UNITS: CurriculumUnitPlan[] = [
  {
    id: "cur_kw_g9_en_u3",
    country: "Kuwait / GCC",
    system: "General Secondary Foundation",
    grade: "Grade 9",
    subject: "English",
    unitTitle: "Unit 3 · Global Connections, Culture & Healthy Habits",
    contentStatus: "curated_anchor",
    contentStatusNote:
      "Curated practice aligned with the 24 Unit 3 target words ('flavour', 'fibre', British spelling) already verified in NEXORA.",
    learningObjectives: [
      "Use Unit 3 academic vocabulary accurately in sentence context",
      "Distinguish British vs. US spelling conventions ('flavour', 'fibre')",
      "Write cohesive paragraphs comparing traditional and modern diets",
    ],
    prerequisites: ["kn_vocab_context", "kn_sentence_grammar"],
    knowledgeNodeId: "kn_paragraph_cohesion",
    estimatedMinutes: 35,
    linkedRoute: "/app/english",
    sampleCheck: {
      question: "Which sentence uses Unit 3 British curriculum spelling accurately?",
      options: [
        "Whole-grain bread adds fibre and warm spice adds flavour.",
        "Whole-grain bread adds fiber and warm spice adds flavor.",
        "Whole-grain bread adds fibre and spice adds flavor.",
        "Whole-grain bread adds fiver and spice adds flaver.",
      ],
      correctIndex: 0,
      explanation: "Kuwait/British English conventions consistently pair 'fibre' with 'flavour'.",
    },
  },
  {
    id: "cur_kw_g9_math_lin",
    country: "Kuwait / GCC",
    system: "General Secondary Foundation",
    grade: "Grade 9",
    subject: "Mathematics",
    unitTitle: "Ratios, Rates & Linear Equations",
    contentStatus: "general_learning",
    contentStatusNote:
      "Curated general learning practice — verify specific textbook section numbers against your school syllabus.",
    learningObjectives: [
      "Convert proportional ratios and percentage change into decimal multipliers",
      "Interpret slope as rate of change (rise / run) in real-world data",
      "Solve two-step linear equations systematically without sign errors",
    ],
    prerequisites: ["kn_negatives_ops", "kn_ratios_percent"],
    knowledgeNodeId: "kn_linear_equations",
    estimatedMinutes: 40,
    linkedRoute: "/app/study",
    sampleCheck: {
      question:
        "A solar battery charges 12% every 15 minutes. Starting from 20%, when is it at 56%?",
      options: ["30 minutes", "45 minutes", "60 minutes", "75 minutes"],
      correctIndex: 1,
      explanation:
        "Gain needed = 36%. Since 36 / 12 = 3 intervals of 15 minutes, 3 * 15 = 45 minutes.",
    },
  },
  {
    id: "cur_kw_g9_sci_water",
    country: "Kuwait / GCC",
    system: "Applied Environmental Science",
    grade: "Grade 9",
    subject: "Science",
    unitTitle: "Freshwater Desalination, Matter & Experimental Variables",
    contentStatus: "general_learning",
    contentStatusNote:
      "Curated general STEM learning unit linking coastal Gulf science concepts with scientific method fundamentals.",
    learningObjectives: [
      "Separate independent, dependent, and controlled variables in fair tests",
      "Compare thermal distillation and reverse osmosis membrane separation",
      "Interpret concentration data without mistaking correlation for causation",
    ],
    prerequisites: ["kn_scientific_method", "kn_ratios_percent"],
    knowledgeNodeId: "kn_data_inference",
    estimatedMinutes: 35,
    linkedRoute: "/app/future",
    sampleCheck: {
      question:
        "When testing how salt concentration affects membrane flow rate, salt concentration is the:",
      options: ["Independent variable", "Dependent outcome", "Random bias", "Bibliography note"],
      correctIndex: 0,
      explanation:
        "The experimenter deliberately changes the independent variable (salt concentration).",
    },
  },
  {
    id: "cur_intl_g8_math_neg",
    country: "International / IGCSE Track",
    system: "Cambridge / International Secondary",
    grade: "Grade 7–8",
    subject: "Mathematics",
    unitTitle: "Signed Numbers, Fractions & Algebraic Expressions",
    contentStatus: "general_learning",
    contentStatusNote:
      "Curated general foundation unit — ideal prerequisite bridge before Linear Equations.",
    learningObjectives: [
      "Add, subtract, multiply, and divide negative integers accurately",
      "Apply order of operations cleanly around parentheses and exponents",
      "Translate word problems into simple single-variable expressions",
    ],
    prerequisites: [],
    knowledgeNodeId: "kn_negatives_ops",
    estimatedMinutes: 30,
    linkedRoute: "/app/study",
    sampleCheck: {
      question: "Evaluate: -6 + 4 * (-2)",
      options: ["4", "-14", "2", "-20"],
      correctIndex: 1,
      explanation: "Multiplication first: 4 * (-2) = -8. Then -6 + (-8) = -14.",
    },
  },
  {
    id: "cur_intl_g10_ai_code",
    country: "International / IGCSE Track",
    system: "Computing & Digital Literacy",
    grade: "Grade 9–12",
    subject: "Coding & AI",
    unitTitle: "Control Flow, Debugging & Responsible AI Verification",
    contentStatus: "general_learning",
    contentStatusNote:
      "Curated practical programming and AI source-verification unit integrated with Coding Studio.",
    learningObjectives: [
      "Trace conditionals, loops, and boundary off-by-one conditions",
      "Verify AI-generated claims and code against primary documentation",
      "Protect personal privacy and respect intellectual property online",
    ],
    prerequisites: ["kn_logic_foundations"],
    knowledgeNodeId: "kn_code_control_flow",
    estimatedMinutes: 35,
    linkedRoute: "/app/future",
    sampleCheck: {
      question:
        "Why should students test boundary cases (0, empty string, negative numbers) in loops?",
      options: [
        "Computers only fail on Tuesday",
        "Edge inputs reveal off-by-one errors missed by typical middle values",
        "It slows down memory intentionally",
        "AI forbids edge cases",
      ],
      correctIndex: 1,
      explanation: "Boundary testing exposes off-by-one and empty-input edge bugs immediately.",
    },
  },
  {
    id: "cur_kw_g11_en_arg",
    country: "Kuwait / GCC",
    system: "Senior Secondary Academic Track",
    grade: "Grade 10–12",
    subject: "English",
    unitTitle: "Analytical Argument, Hedging & Academic Research Writing",
    contentStatus: "general_learning",
    contentStatusNote:
      "Curated upper-secondary academic English track bridging B1/B2 writing to university readiness.",
    learningObjectives: [
      "Craft nuanced thesis claims backed by verifiable evidence",
      "Use objective reporting verbs ('indicates', 'suggests', 'demonstrates')",
      "Address counterarguments respectfully and concisely",
    ],
    prerequisites: ["kn_paragraph_cohesion"],
    knowledgeNodeId: "kn_academic_argument",
    estimatedMinutes: 45,
    linkedRoute: "/app/english",
    sampleCheck: {
      question: "Which academic verb avoids overclaiming when interpreting small survey data?",
      options: ["proves 100%", "guarantees", "indicates", "forces"],
      correctIndex: 2,
      explanation:
        "'Indicates' accurately reflects measured evidence without unsupported exaggeration.",
    },
  },
];

/* -------------------------------------------------------------------------- */
/* REAL-WORLD CHALLENGES (17) — ALL 9 REQUIRED FIELDS + STRICT MINOR SAFETY   */
/* -------------------------------------------------------------------------- */

export interface RealWorldChallenge {
  id: string;
  domain:
    | "Environmental Sustainability"
    | "Community Problem Solving"
    | "Practical STEM"
    | "Digital Wellness"
    | "Accessibility & Design";
  problemContext: string;
  title: string;
  learningGoals: string[];
  requiredSubjectsAndSkills: string[];
  deliverable: string;
  submissionType:
    "Reflection + Evidence Summary" | "Audit Table + Action Brief" | "Prototype Sketch + Checklist";
  evaluationCriteria: string[];
  reflectionPrompt: string;
  safetyNote: string;
}

export const REAL_WORLD_CHALLENGES: RealWorldChallenge[] = [
  {
    id: "rwc_shade_cooling",
    domain: "Environmental Sustainability",
    problemContext:
      "Outdoor school courtyards and bus stops often overheat during sunny midday hours, reducing comfortable break spaces.",
    title: "Cool Courtyard & Shade Audit Challenge",
    learningGoals: [
      "Measure surface temperature differences between shaded and unshaded school zones safely",
      "Propose passive cooling fixes (canopies, reflective surfaces, native shade plants) with rough cost logic",
    ],
    requiredSubjectsAndSkills: [
      "Science (Thermal Reflection)",
      "Math (Averages & % Reduction)",
      "Persuasive English",
    ],
    deliverable:
      "1-page School Shade Proposal (baseline observations + 2 low-cost design changes).",
    submissionType: "Audit Table + Action Brief",
    evaluationCriteria: [
      "Includes real observational notes (time of day, surface type) without guessing numbers",
      "Proposes at least 2 practical passive cooling improvements",
      "Explains maintenance and water/durability trade-offs",
    ],
    reflectionPrompt:
      "What single design constraint (budget, maintenance, or wind) changed your final recommendation?",
    safetyNote:
      "Use non-contact thermometers or shade observations only with teacher permission; stay hydrated indoors during peak midday heat.",
  },
  {
    id: "rwc_water_audit",
    domain: "Practical STEM",
    problemContext:
      "Desalinated freshwater requires significant energy; small leaky taps or unmeasured irrigation waste thousands of liters monthly.",
    title: "Home & School Freshwater Conservation Audit",
    learningGoals: [
      "Estimate household/school tap flow using safe timed container measurements",
      "Calculate monthly savings of simple aerators or behavior habits",
    ],
    requiredSubjectsAndSkills: [
      "Mathematics (Rates & Unit Conversion)",
      "Environmental Science",
      "Clear Data Reporting",
    ],
    deliverable:
      "Conservation Action Sheet with 3 measured habits and realistic weekly savings estimate.",
    submissionType: "Audit Table + Action Brief",
    evaluationCriteria: [
      "Calculations clearly show liters per minute and assumptions",
      "Separates verified tap checks from rough household estimates",
      "Practical steps usable by a family or classroom immediately",
    ],
    reflectionPrompt:
      "Which habit saved the most water with the least daily disruption, and how would you measure it over 2 weeks?",
    safetyNote:
      "Check household taps with parent/guardian awareness only. Never inspect pressurized pipes or outdoor utility mains.",
  },
  {
    id: "rwc_udl_classroom",
    domain: "Accessibility & Design",
    problemContext:
      "Digital worksheets and slides often have tiny low-contrast text, missing captions, or cluttered layouts that exclude learners.",
    title: "Accessible Learning Redesign (UDL Audit)",
    learningGoals: [
      "Identify 5 common digital accessibility barriers (contrast, font size, alt descriptions, captions, plain structure)",
      "Redesign a real study handout so it works smoothly on mobile screens and screen readers",
    ],
    requiredSubjectsAndSkills: [
      "Communication & Writing",
      "Visual Design Hygiene",
      "Empathy & UX Thinking",
    ],
    deliverable: "Before/After Accessibility Checklist + rewritten plain-language study card.",
    submissionType: "Prototype Sketch + Checklist",
    evaluationCriteria: [
      "Identifies concrete contrast, heading hierarchy, and caption/alt-text gaps",
      "Simplifies dense jargon without sacrificing academic accuracy",
      "Tests readability at small screen widths",
    ],
    reflectionPrompt:
      "How did redesigning for accessibility actually make your study summary clearer for every student?",
    safetyNote:
      "Use anonymized or your own study worksheets only; never upload private classmates' papers.",
  },
  {
    id: "rwc_misinfo_shield",
    domain: "Digital Wellness",
    problemContext:
      "Short social videos frequently attach urgent health, exam, or scholarship claims to fabricated quotes or out-of-context charts.",
    title: "Student Fact-Check & Source Verification Brief",
    learningGoals: [
      "Apply Lateral Reading: verify who runs a source outside the original post",
      "Spot manipulated chart axes, cherry-picked samples, and AI-fabricated citations",
    ],
    requiredSubjectsAndSkills: ["Digital & AI Literacy", "Critical Reading", "Civic Reasoning"],
    deliverable:
      "3-Claim Verification Log comparing surface viral claim vs. primary verified source.",
    submissionType: "Reflection + Evidence Summary",
    evaluationCriteria: [
      "Documents primary source domain and publication date honestly",
      "Marks unverified claims as 'Unconfirmed' instead of guessing",
      "Explains the persuasion technique used in plain words",
    ],
    reflectionPrompt:
      "Which misleading trick was easiest to miss at first glance, and what 30-second check caught it?",
    safetyNote:
      "Verify claims via reputable public libraries, official university sites, or news archives—never click suspicious shortened links.",
  },
  {
    id: "rwc_peer_study_kit",
    domain: "Community Problem Solving",
    problemContext:
      "Younger students transitioning into secondary school often struggle to organize multi-subject exams and end up cramming late.",
    title: "Junior Student Exam Survival Starter Kit",
    learningGoals: [
      "Translate study science (spacing, active recall, zero-shame recovery) into friendly 1-page guidance",
      "Create a reusable 7-day sample checklist younger students can adapt",
    ],
    requiredSubjectsAndSkills: [
      "Metacognition & Study Planning",
      "Bilingual Clarity (EN/AR)",
      "Peer Mentorship",
    ],
    deliverable: "1-page Bilingual Exam Routine Guide + 5 retrieval practice prompts.",
    submissionType: "Reflection + Evidence Summary",
    evaluationCriteria: [
      "Uses encouraging, non-shaming tone suitable for younger peers",
      "Replaces passive rereading advice with concrete retrieval exercises",
      "Includes realistic rest and sleep protection reminders",
    ],
    reflectionPrompt:
      "Which mistake from your own past exam prep inspired the most helpful tip in your guide?",
    safetyNote:
      "Share study kits only through teacher-approved school clubs or moderated Circle rooms without personal phone numbers.",
  },
];

/* -------------------------------------------------------------------------- */
/* DIGITAL & AI LITERACY ACADEMY (19)                                         */
/* -------------------------------------------------------------------------- */

export interface DigitalLiteracyModule {
  id: string;
  pillar:
    | "AI Capabilities & Hallucinations"
    | "Fact-Checking & Misinformation"
    | "Privacy & Password Hygiene"
    | "Academic Integrity & Copyright";
  title: string;
  coreTakeaway: string;
  keyRules: string[];
  realScenario: string;
  scenarioQuestion: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export const DIGITAL_LITERACY_MODULES: DigitalLiteracyModule[] = [
  {
    id: "dl_ai_limits",
    pillar: "AI Capabilities & Hallucinations",
    title: "How AI Generates Answers—and Why Confident Errors Happen",
    coreTakeaway:
      "Language models predict plausible text patterns; even a fluent, polite answer can invent dates, quotes, or dead URLs.",
    keyRules: [
      "Always verify exam dates, scholarship deadlines, and textbook quotes independently.",
      "Ask AI to explain reasoning steps or quote only text you pasted into Ask Your Lesson.",
      "Treat AI as a structured coach—never as an infallible authority.",
    ],
    realScenario:
      "An AI tutor gives you a smooth quote attributed to a 2024 Kuwait Ministry textbook page you don't recognize.",
    scenarioQuestion: "What is the safest academic habit before using that quote?",
    options: [
      "Trust it immediately because the AI sounded confident",
      "Check your actual textbook or official document; mark it unverified until confirmed",
      "Delete your bibliography so teachers won't ask",
      "Ask a different chatbot the same vague prompt without checking sources",
    ],
    correctIndex: 1,
    explanation:
      "Fluency does not equal factual verification; always verify quotes directly against your primary source.",
  },
  {
    id: "dl_fact_check",
    pillar: "Fact-Checking & Misinformation",
    title: "Lateral Reading & Spotting Manipulated Charts",
    coreTakeaway:
      "Check who created a claim and whether primary data supports the headline before resharing in a class chat.",
    keyRules: [
      "Inspect y-axis scales: truncated bars make 2% differences look massive.",
      "Distinguish correlation ('two trends moved together') from proven causation.",
      "Open a separate tab to check the publisher's reputation (Lateral Reading).",
    ],
    realScenario:
      "A viral graphic shows a bar chart doubling in height, but the vertical axis starts at 96% instead of 0%.",
    scenarioQuestion: "What distortion is happening?",
    options: [
      "A truncated axis visually exaggerates a tiny 2–4% difference",
      "The percentages automatically prove causation",
      "The file format corrupted the colors",
      "Zero baseline makes charts unreadable",
    ],
    correctIndex: 0,
    explanation:
      "Starting a bar chart axis near the data minimum visually exaggerates small shifts.",
  },
  {
    id: "dl_privacy_passwords",
    pillar: "Privacy & Password Hygiene",
    title: "Protecting Identity, Passwords & Minor Safety Online",
    coreTakeaway:
      "Never paste passwords, national IDs, home addresses, or private family details into public chats or unverified forms.",
    keyRules: [
      "Use unique 12+ character passphrases across school email, banking, and study accounts.",
      "Enable Two-Factor Authentication (2FA) wherever supported.",
      "In student groups, keep collaboration topic-focused without sharing personal phone numbers or locations.",
    ],
    realScenario:
      "Someone in an online study group sends a form asking for your school portal password to 'unlock free past papers'.",
    scenarioQuestion: "How should you respond?",
    options: [
      "Enter your password once then change a single letter",
      "Never enter passwords on third-party forms; close it and report the suspicious link",
      "Share your friend's login instead",
      "Post the password inside the group chat to ask if it works",
    ],
    correctIndex: 1,
    explanation:
      "Legitimate study platforms never ask for another site's password—this is credential phishing.",
  },
  {
    id: "dl_ip_integrity",
    pillar: "Academic Integrity & Copyright",
    title: "Honest Citation, Copyright & AI-Assisted Learning Ethics",
    coreTakeaway:
      "Using tools to outline, check grammar, or quiz yourself builds skill; submitting unedited AI prose or uncredited work harms your learning.",
    keyRules: [
      "Quote short excerpts inside quotation marks with author/title attribution.",
      "Respect Creative Commons and copyright notices on images and datasets.",
      "Rewrite explanations in your own understanding before turning in assignments.",
    ],
    realScenario:
      "You used NEXORA's Socratic Coach to understand photosynthesis and wrote your own summary using class notes.",
    scenarioQuestion: "Why is this ethically sound and educationally effective?",
    options: [
      "Because hiding help makes grading harder",
      "You used coaching to build genuine understanding and authored the work in your own words",
      "Because Socratic questions count as someone else's essay",
      "Because summaries never require accuracy",
    ],
    correctIndex: 1,
    explanation:
      "Using guided coaching while authoring answers from your own understanding preserves integrity and mastery.",
  },
];

/* -------------------------------------------------------------------------- */
/* FROM ZERO TO HEROFlagship Journeys (22)                                    */
/* -------------------------------------------------------------------------- */

export interface ZeroToHeroJourney {
  id: string;
  skillDomain:
    "English" | "Mathematics" | "Coding" | "Science" | "Communication" | "Critical Thinking";
  title: string;
  summary: string;
  targetOutcome: string;
  stages: Array<{
    stageNumber: number;
    label: string;
    requirementType:
      "assessment" | "lesson_or_map" | "practice_score" | "real_challenge_or_portfolio";
    actionRoute: "/app/english" | "/app/study" | "/app/future" | "/app/ai";
    description: string;
  }>;
}

export const ZERO_TO_HERO_JOURNEYS: ZeroToHeroJourney[] = [
  {
    id: "z2h_english",
    skillDomain: "English",
    title: "English: Pre-A1 Foundation to Confident Academic Expression",
    summary:
      "Diagnose your CEFR starting point, unlock Adventure Map regions, master vocabulary across 2+ modes, and publish a revised writing piece.",
    targetOutcome:
      "Verified Unit completions + multi-practice vocab mastery + Writing revision improvement",
    stages: [
      {
        stageNumber: 1,
        label: "Diagnostic Assessment",
        requirementType: "assessment",
        actionRoute: "/app/english",
        description:
          "Complete the initial English placement check (Vocabulary, Grammar, Reading, Listening).",
      },
      {
        stageNumber: 2,
        label: "Foundation Map & Lessons",
        requirementType: "lesson_or_map",
        actionRoute: "/app/english",
        description: "Complete at least 2 structured curriculum lessons across the Adventure Map.",
      },
      {
        stageNumber: 3,
        label: "Multi-Mode Vocabulary & Practice",
        requirementType: "practice_score",
        actionRoute: "/app/english",
        description: "Master 3+ words across multiple practice modes (never 1-click).",
      },
      {
        stageNumber: 4,
        label: "Applied Portfolio Draft",
        requirementType: "real_challenge_or_portfolio",
        actionRoute: "/app/future",
        description: "Document a completed essay or communication deliverable in your Portfolio.",
      },
    ],
  },
  {
    id: "z2h_math",
    skillDomain: "Mathematics",
    title: "Mathematics: Number Sense to Data & Algebraic Modelling",
    summary:
      "Close missing arithmetic/negative-number prerequisites first, score 75%+ on topic exams, and apply math inside a STEM challenge.",
    targetOutcome: "Prerequisite mastery + Exam improvement + STEM Quantitative Audit",
    stages: [
      {
        stageNumber: 1,
        label: "Prerequisite Gap Scan",
        requirementType: "assessment",
        actionRoute: "/app/study",
        description: "Run Gap Detector or Curriculum check on Negative Numbers & Ratios.",
      },
      {
        stageNumber: 2,
        label: "Visual Concept Connection",
        requirementType: "lesson_or_map",
        actionRoute: "/app/study",
        description: "Master Ratios & Linear Equations nodes on the Knowledge Connection Map.",
      },
      {
        stageNumber: 3,
        label: "Timed Practice Verification",
        requirementType: "practice_score",
        actionRoute: "/app/study",
        description: "Score 70%+ on a Mathematics Exam Simulation.",
      },
      {
        stageNumber: 4,
        label: "Real-World Quantitative Project",
        requirementType: "real_challenge_or_portfolio",
        actionRoute: "/app/future",
        description: "Apply rate/percentage modeling to a Freshwater or Shade Challenge.",
      },
    ],
  },
  {
    id: "z2h_coding",
    skillDomain: "Coding",
    title: "Coding & AI: First Logic Trace to Responsible Builder",
    summary:
      "Move from logic foundations and Digital Literacy into solving sandbox coding challenges and documenting a digital artifact.",
    targetOutcome: "Coding Studio exercises solved + AI Literacy verified + Saved Portfolio build",
    stages: [
      {
        stageNumber: 1,
        label: "AI & Digital Safety Baseline",
        requirementType: "assessment",
        actionRoute: "/app/future",
        description: "Complete 2+ Digital & AI Literacy verification scenarios.",
      },
      {
        stageNumber: 2,
        label: "Logic & Control Flow Map",
        requirementType: "lesson_or_map",
        actionRoute: "/app/study",
        description: "Explore Logic Foundations and Control Flow on the Knowledge Map.",
      },
      {
        stageNumber: 3,
        label: "Hands-On Coding Practice",
        requirementType: "practice_score",
        actionRoute: "/app/future",
        description: "Solve at least 2 interactive coding exercises inside Coding Studio.",
      },
      {
        stageNumber: 4,
        label: "Accessibility or Utility Build",
        requirementType: "real_challenge_or_portfolio",
        actionRoute: "/app/future",
        description: "Save a snippet or UDL challenge brief into your Student Portfolio.",
      },
    ],
  },
  {
    id: "z2h_science",
    skillDomain: "Science",
    title: "Science: Hypothesis Curiosity to Evidence-Based Inquiry",
    summary:
      "Master experimental variables, eliminate correlation/causation misconceptions, and complete a safe Science Fair or Real-World STEM brief.",
    targetOutcome:
      "Scientific Method node + STEM Simulation + Science Fair/Real Challenge Artifact",
    stages: [
      {
        stageNumber: 1,
        label: "Scientific Reasoning Check",
        requirementType: "assessment",
        actionRoute: "/app/study",
        description: "Complete a Science Exam Simulation or Gap Diagnostic.",
      },
      {
        stageNumber: 2,
        label: "Interactive STEM Labs",
        requirementType: "lesson_or_map",
        actionRoute: "/app/future",
        description:
          "Complete interactive STEM lab simulations and connect Variables -> Inference.",
      },
      {
        stageNumber: 3,
        label: "Feynman Mechanism Explain-Back",
        requirementType: "practice_score",
        actionRoute: "/app/study",
        description: "Explain a core science mechanism clearly in your own words.",
      },
      {
        stageNumber: 4,
        label: "Safe Investigation Brief",
        requirementType: "real_challenge_or_portfolio",
        actionRoute: "/app/future",
        description: "Document a Science Fair or Environmental Sustainability Challenge.",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* TEACH ME DIFFERENTLY — 8 PEDAGOGICAL STYLES (PART 1 #7)                    */
/* -------------------------------------------------------------------------- */

export interface TeachingStyleOption {
  id:
    | "simple_everyday"
    | "story_analogy"
    | "visual_step"
    | "real_life_example"
    | "deep_academic"
    | "practice_first"
    | "common_mistakes"
    | "quick_summary";
  label: string;
  shortTag: string;
  instruction: string;
}

export const TEACH_ME_STYLES: TeachingStyleOption[] = [
  {
    id: "simple_everyday",
    label: "1. Simple Everyday Language",
    shortTag: "Simple",
    instruction:
      "Explain using plain, jargon-free everyday words that a 12-year-old understands immediately, without talking down.",
  },
  {
    id: "story_analogy",
    label: "2. Analogy / Story",
    shortTag: "Analogy",
    instruction:
      "Open with a vivid everyday analogy or short story that mirrors the exact mechanism of the concept, then map each story piece to the academic term.",
  },
  {
    id: "visual_step",
    label: "3. Visual Step-by-Step Breakdown",
    shortTag: "Visual Steps",
    instruction:
      "Lay out a clean numbered sequence with spatial cues ([Step 1] -> [Step 2] -> [Result]) so the student sees cause flowing into effect.",
  },
  {
    id: "real_life_example",
    label: "4. Real-Life Student Example",
    shortTag: "Real Example",
    instruction:
      "Anchor the concept directly inside one concrete school, kitchen, sports, or community scenario before stating the rule.",
  },
  {
    id: "deep_academic",
    label: "5. Deep Academic Precision",
    shortTag: "Deep Academic",
    instruction:
      "Use formal academic definitions, boundary conditions, edge cases, and precise disciplinary terminology.",
  },
  {
    id: "practice_first",
    label: "6. Practice-First Guided",
    shortTag: "Practice-First",
    instruction:
      "Give the student one tiny warm-up problem or sentence to try first, show the worked move, and extract the rule afterward.",
  },
  {
    id: "common_mistakes",
    label: "7. Common Mistakes & Traps",
    shortTag: "Mistake Traps",
    instruction:
      "Focus directly on the 2–3 most common traps students fall into on exams with this topic and show side-by-side Wrong vs. Accurate fixes.",
  },
  {
    id: "quick_summary",
    label: "8. Quick Bullet Summary",
    shortTag: "Quick Bullets",
    instruction:
      "Deliver an ultra-crisp 4-bullet cheat sheet + 1 quick takeaway sentence for rapid last-minute review.",
  },
];
