import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Languages,
  CheckSquare,
  Trophy,
  HeartPulse,
  Compass,
  Sliders,
  Globe,
  Users,
  Radar,
  Atom,
  Calculator,
  Palette,
  Code2,
  BookOpenCheck,
  HeartHandshake,
  Library,
  Lightbulb,
  Map,
  type LucideIcon,
} from "lucide-react";

export type ModuleCategoryKey =
  "learn" | "grow" | "create" | "explore" | "connect_contribute" | "support_discover";

export interface ModuleCategory {
  id: ModuleCategoryKey;
  label: string;
  labelAr: string;
  desc: string;
  color: string;
}

export const MODULE_CATEGORIES: ModuleCategory[] = [
  {
    id: "learn",
    label: "Learn",
    labelAr: "تعلّم",
    desc: "Academics, sciences, math, research, language mastery, and foundational knowledge",
    color: "oklch(0.8 0.14 190)",
  },
  {
    id: "grow",
    label: "Grow",
    labelAr: "انمُ",
    desc: "Productivity, personal growth, life skills, wellness, and career pathways",
    color: "oklch(0.78 0.16 150)",
  },
  {
    id: "create",
    label: "Create",
    labelAr: "ابتكر",
    desc: "Creative arts, digital coding, engineering artifacts, and student ventures",
    color: "oklch(0.82 0.17 80)",
  },
  {
    id: "explore",
    label: "Explore",
    labelAr: "استكشف",
    desc: "AI intelligence, global cultures, scholarships, and student opportunities",
    color: "oklch(0.74 0.16 280)",
  },
  {
    id: "connect_contribute",
    label: "Connect & Contribute",
    labelAr: "تواصل وساهم",
    desc: "Collaborative study circles, peer mentorship, MUN diplomacy, and community impact",
    color: "oklch(0.72 0.15 210)",
  },
  {
    id: "support_discover",
    label: "Support & Discover",
    labelAr: "الدعم والاستكشاف",
    desc: "Universal accessibility, personalized learning accommodations, and platform settings",
    color: "oklch(0.7 0.08 240)",
  },
];

export interface CanonicalModule {
  id: string;
  number: string; // "01" through "20"
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: ModuleCategoryKey;
  to: string;
  icon: LucideIcon;
  guideId: string;
  badge: string;
  color: string;
  capabilities: string[];
}

export const CANONICAL_MODULES: CanonicalModule[] = [
  {
    id: "ai-intelligence",
    number: "01",
    name: "AI Intelligence",
    nameAr: "الذكاء الاصطناعي الأكاديمي",
    description:
      "Socratic learning coach, multimodal voice/audio transcription, visual aid generator, and instant document QA.",
    descriptionAr:
      "المعلم السقراطي الذكي، تفريغ الصوت والمحاضرات، استوديو الوسائل البصرية والرسوم البيانية، والتحليل الفوري للمستندات.",
    category: "explore",
    to: "/app/ai",
    icon: Sparkles,
    guideId: "ai-tutor",
    badge: "AI Core",
    color: "oklch(0.82 0.15 75)",
    capabilities: [
      "Socratic Tutor",
      "Audio Transcription",
      "Visual Aid Studio",
      "Document QA",
      "Adaptive Practice",
    ],
  },
  {
    id: "study-academics",
    number: "02",
    name: "Study & Academics",
    nameAr: "الدراسة والأكاديميات",
    description:
      "Smart notes, SM-2 spaced repetition flashcards, interactive quizzes, mistake recovery log, and 3D study lab.",
    descriptionAr:
      "ملاحظات ذكية، بطاقات استرجاع متباعد (SM-2)، اختبارات ذاتية تفاعلية، سجل معالجة الأخطاء، ومختبر ثلاثي الأبعاد.",
    category: "learn",
    to: "/app/study?tab=notes",
    icon: BookOpen,
    guideId: "study-notes",
    badge: "Core Study",
    color: "oklch(0.8 0.14 190)",
    capabilities: [
      "Spaced Repetition",
      "Smart Notes",
      "Quiz Generator",
      "Mistake Log",
      "3D Spatial Models",
    ],
  },
  {
    id: "skills-academy",
    number: "03",
    name: "Skills Academy",
    nameAr: "أكاديمية المهارات",
    description:
      "Practical life mastery: critical thinking, public speaking, leadership, financial literacy, and exam techniques.",
    descriptionAr:
      "مهارات عملية للحياة: التفكير النقدي، الخطابة والإلقاء، القيادة، الوعي المالي، واستراتيجيات التفوق في الامتحانات.",
    category: "grow",
    to: "/app/study?tab=practical_skills",
    icon: GraduationCap,
    guideId: "practical-skills",
    badge: "Life Skills",
    color: "oklch(0.77 0.15 140)",
    capabilities: [
      "Critical Thinking",
      "Financial Literacy",
      "Public Speaking",
      "Leadership",
      "Exam Strategy",
    ],
  },
  {
    id: "language-learning",
    number: "04",
    name: "Language Learning",
    nameAr: "تعلم اللغات والتواصل",
    description:
      "Vocabulary mastery, pronunciation drills, multilingual fluency, contextual dialogues, and grammar clarity.",
    descriptionAr:
      "إتقان المفردات، تدريبات النطق والصوت، الطلاقة اللغوية، الحوارات السياقية، وتبسيط القواعد النحوية.",
    category: "learn",
    to: "/app/english",
    icon: Languages,
    guideId: "unit3-vocab",
    badge: "Languages",
    color: "oklch(0.76 0.16 200)",
    capabilities: [
      "Unit 3 Vocab Mastery",
      "Pronunciation Audio",
      "Dialect Nuances",
      "Context Flashcards",
      "Fluency Drills",
    ],
  },
  {
    id: "productivity-focus",
    number: "05",
    name: "Productivity & Focus",
    nameAr: "الإنتاجية والتركيز",
    description:
      "Pomodoro focus sprints, prioritized task boards, deadline calendar, velocity tracking, and streak protector.",
    descriptionAr:
      "جلسات بومودورو للتركيز العميق، لوحات مهام ذكية، تقويم المواعيد النهائية، قياس سرعة الإنجاز، وحامي السلسلة اليومية.",
    category: "grow",
    to: "/app/tasks",
    icon: CheckSquare,
    guideId: "tasks-planner",
    badge: "Productivity",
    color: "oklch(0.75 0.15 155)",
    capabilities: [
      "Pomodoro Timer",
      "Priority Kanban",
      "Deadline Radar",
      "Daily Goals",
      "Velocity Analytics",
    ],
  },
  {
    id: "personal-growth",
    number: "06",
    name: "Personal Growth",
    nameAr: "النمو الشخصي والمكافآت",
    description:
      "Gamified Adventure World, tiered milestones, achievement badges, Question of the Day, and growth reflections.",
    descriptionAr:
      "عالم المغامرة التفاعلي، مستويات نمو متقدمة، شارات الإنجاز، سؤال اليوم الذهبي، وسجل التأملات وبناء الشخصية.",
    category: "grow",
    to: "/app/level-up",
    icon: Trophy,
    guideId: "adventure-world",
    badge: "Milestones",
    color: "oklch(0.85 0.18 85)",
    capabilities: [
      "Adventure World",
      "XP Engine",
      "Milestone Badges",
      "Question of the Day",
      "Self-Reflection",
    ],
  },
  {
    id: "wellbeing-healthy-habits",
    number: "07",
    name: "Wellbeing & Healthy Habits",
    nameAr: "العافية والعادات الصحية",
    description:
      "Daily mood check-in, sleep and hydration tracking, guided breathing exercises, gratitude journal, and balance radar.",
    descriptionAr:
      "متابعة الحالة المزاجية، سجل النوم والماء، تمارين التنفس الموجه، مفكرة الامتنان، ومؤشر التوازن النفسي والجسدي.",
    category: "grow",
    to: "/app",
    icon: HeartPulse,
    guideId: "care-wellness",
    badge: "Wellness",
    color: "oklch(0.75 0.18 340)",
    capabilities: [
      "Mood Tracker",
      "Sleep & Hydration Log",
      "Guided Breathing",
      "Gratitude Journal",
      "Digital Detox",
    ],
  },
  {
    id: "future-careers",
    number: "08",
    name: "Future & Careers",
    nameAr: "المستقبل والمسارات المهنية",
    description:
      "Career pathway blueprints, strength assessments, university major guides, and mentorship connections.",
    descriptionAr:
      "مخططات المسارات المهنية المستقبلية، مقياس الميول ونقاط القوة، دليل التخصصات الجامعية، وشبكة الإرشاد المهني.",
    category: "grow",
    to: "/app/level-up",
    icon: Compass,
    guideId: "future-pathways",
    badge: "Pathways",
    color: "oklch(0.72 0.16 290)",
    capabilities: [
      "Career Roadmaps",
      "Strengths Finder",
      "Majors Matcher",
      "Mentorship Radar",
      "Internship Prep",
    ],
  },
  {
    id: "accessibility-inclusion",
    number: "09",
    name: "Accessibility & Inclusion",
    nameAr: "إمكانية الوصول والشمولية",
    description:
      "Dyslexia font, high contrast modes, screen reader assistance, simplified UI, motion control, and multi-language support.",
    descriptionAr:
      "خط دعم عسر القراءة (OpenDyslexic)، تباين بصري عالٍ، قارئ الشاشة المدمج، واجهة مبسطة، وضبط الحركة اللمسية.",
    category: "support_discover",
    to: "/app/settings?section=accessibility",
    icon: Sliders,
    guideId: "settings-accessibility",
    badge: "Inclusive UX",
    color: "oklch(0.7 0.08 240)",
    capabilities: [
      "Dyslexia Font",
      "High Contrast Mode",
      "Text-to-Speech",
      "Simplified UI",
      "Reduced Motion",
    ],
  },
  {
    id: "global-explorer",
    number: "10",
    name: "Global Explorer",
    nameAr: "المستكشف العالمي",
    description:
      "Global Culture Hub, cross-cultural exchanges, geography knowledge quests, virtual cultural tours, and global student network.",
    descriptionAr:
      "واحة الثقافات العالمية، جسور التبادل الطلابي، تحديات الجغرافيا والمعالم، الجولات الافتراضية، ورؤى طلاب العالم.",
    category: "explore",
    to: "/app/study",
    icon: Globe,
    guideId: "global-culture",
    badge: "Culture",
    color: "oklch(0.74 0.17 220)",
    capabilities: [
      "Global Culture Hub",
      "Geography Quests",
      "Virtual Landmarks",
      "Cross-Border Dialogue",
      "Global Traditions",
    ],
  },

  {
    id: "opportunity-radar",
    number: "12",
    name: "Opportunity Radar",
    nameAr: "رادار الفرص والمنح",
    description:
      "Verified student competitions, hackathons, academic Olympiads, international scholarships, and research grants.",
    descriptionAr:
      "رادار المسابقات الطلابية المعتمدة، الهاكاثونات، أولمبياد العلوم والرياضيات، المنح الدراسية العالمية، وجوائز التميز.",
    category: "explore",
    to: "/app/level-up",
    icon: Radar,
    guideId: "opportunities-radar",
    badge: "Opportunities",
    color: "oklch(0.78 0.16 50)",
    capabilities: [
      "Hackathons",
      "Global Scholarships",
      "Science Olympiads",
      "Deadlines Watcher",
      "Eligibility Filter",
    ],
  },
  {
    id: "science-discovery",
    number: "13",
    name: "Science & Discovery",
    nameAr: "العلوم والاستكشاف",
    description:
      "Interactive 3D human anatomy explorer, chemical periodic table lab, physics simulations, and scientific experiments.",
    descriptionAr:
      "مستكشف تشريح جسم الإنسان التفاعلي ثلاثي الأبعاد، مختبر الجدول الدوري والكيمياء، ومحاكاة قوانين الفيزياء.",
    category: "learn",
    to: "/app/study?tab=science",
    icon: Atom,
    guideId: "science-studio",
    badge: "STEM Science",
    color: "oklch(0.78 0.17 170)",
    capabilities: [
      "3D Anatomy Explorer",
      "Periodic Table Lab",
      "Physics Simulators",
      "Hypothesis Tester",
      "Lab Notebook",
    ],
  },
  {
    id: "math-engineering",
    number: "14",
    name: "Mathematics & Engineering",
    nameAr: "الرياضيات والهندسة",
    description:
      "Formula derivation lab, interactive graphing calculator, step-by-step problem solver, and geometric visualizer.",
    descriptionAr:
      "مختبر استنتاج المعادلات، آلة حاسبة بيانية تفاعلية، حل المسائل خطوة بخطوة، ونماذج الهندسة الفراغية.",
    category: "learn",
    to: "/app/study?tab=math",
    icon: Calculator,
    guideId: "math-studio",
    badge: "STEM Math",
    color: "oklch(0.76 0.16 240)",
    capabilities: [
      "Graphing Calculator",
      "Step-by-Step Solver",
      "Formula Derivations",
      "Geometry Visualizer",
      "Calculus Practice",
    ],
  },
  {
    id: "creative-studio",
    number: "15",
    name: "Creative Studio",
    nameAr: "الاستوديو الإبداعي",
    description:
      "Digital sketchpad, visual aid canvas, creative writing prompts, idea mapping, and artistic student portfolios.",
    descriptionAr:
      "لوحة رسم وتخطيط رقمية، استوديو التصميم والوسائط، محفزات الكتابة الإبداعية، وخرائط توليد الأفكار الفنية.",
    category: "create",
    to: "/app/study?tab=creativity",
    icon: Palette,
    guideId: "creativity-studio",
    badge: "Creative Arts",
    color: "oklch(0.78 0.18 310)",
    capabilities: [
      "Digital Sketchpad",
      "Visual Aid Canvas",
      "Story Prompt Engine",
      "Moodboard Creator",
      "Creative Portfolio",
    ],
  },
  {
    id: "coding-digital-innovation",
    number: "16",
    name: "Coding & Digital Innovation",
    nameAr: "البرمجة والابتكار الرقمي",
    description:
      "Live interactive code sandbox, algorithm visualizations, syntax exercises, debugging challenges, and tech project builders.",
    descriptionAr:
      "بيئة تشغيل تفاعلية للأكواد البرمجية، محاكاة الخوارزميات، تمارين تصحيح الأخطاء، وبناء المشاريع التقنية للطلاب.",
    category: "create",
    to: "/app/level-up?tab=coding",
    icon: Code2,
    guideId: "coding-studio",
    badge: "Digital Code",
    color: "oklch(0.79 0.16 160)",
    capabilities: [
      "Interactive Code Sandbox",
      "Algorithm Visualizer",
      "Debugging Challenges",
      "Web Tech Starter",
      "Project Templates",
    ],
  },
  {
    id: "quran-islamic-learning",
    number: "17",
    name: "Quran & Islamic Learning",
    nameAr: "القرآن الكريم والعلوم الإسلامية",
    description:
      "Complete 114 Surah reader with authentic audio recitations, Tajweed guidance, verse search, bookmarks, and reflections.",
    descriptionAr:
      "المصحف الشريف كاملاً (114 سورة) مع التلاوات الصوتية، أحكام التجويد الميسرة، البحث الدقيق، العلامات المرجعية، وتأملات الآيات.",
    category: "learn",
    to: "/app/quran",
    icon: BookOpenCheck,
    guideId: "quran-reader",
    badge: "Spiritual & Quran",
    color: "oklch(0.76 0.14 165)",
    capabilities: [
      "114 Surahs Reader",
      "Audio Recitations",
      "Tajweed Highlights",
      "Verse Bookmarks",
      "Daily Reflection Log",
    ],
  },
  {
    id: "community-impact",
    number: "18",
    name: "Community Impact",
    nameAr: "الأثر المجتمعي والمبادرات",
    description:
      "Science fair showcase, SDG student projects, community volunteering log, civic initiatives, and social innovation.",
    descriptionAr:
      "معرض مشاريع العلوم والبيئة، مبادرات أهداف التنمية المستدامة (SDGs)، توثيق ساعات التطوع، ومشاريع الخدمة المجتمعية.",
    category: "connect_contribute",
    to: "/app/circle",
    icon: HeartHandshake,
    guideId: "science-fair-impact",
    badge: "Civic Impact",
    color: "oklch(0.74 0.17 140)",
    capabilities: [
      "Science Fair Expo",
      "SDG Action Projects",
      "Volunteer Tracker",
      "Impact Reports",
      "Civic Initiatives",
    ],
  },
  {
    id: "reading-research",
    number: "19",
    name: "Reading & Research",
    nameAr: "القراءة والبحث العلمي",
    description:
      "Academic citation generator, research paper analyzer, document synthesizer, ready-to-use study libraries, and reading logs.",
    descriptionAr:
      "مولد الاستشهادات الأكاديمية (APA/MLA)، محلل الأوراق البحثية والمراجع، وتلخيص المستندات، ومكتبة المواد الجاهزة.",
    category: "learn",
    to: "/app/study?tab=research",
    icon: Library,
    guideId: "knowledge-tools",
    badge: "Research",
    color: "oklch(0.77 0.13 220)",
    capabilities: [
      "Evidence Matrix",
      "Citation Generator",
      "Research Paper Analyzer",
      "Source Evaluator",
      "Reading Tracker",
    ],
  },
  {
    id: "projects-innovation",
    number: "20",
    name: "Projects & Innovation",
    nameAr: "المشاريع والابتكار الطلابي",
    description:
      "University portfolio builder, Model United Nations (MUN) diplomacy simulator, capstone project planner, and venture tracker.",
    descriptionAr:
      "منشئ ملف الإنجاز الجامعي، محاكي دبلوماسية نموذج الأمم المتحدة (MUN)، ومخطط مشاريع التخرج والابتكارات الطلابية.",
    category: "create",
    to: "/app/study?tab=research",
    icon: Lightbulb,
    guideId: "university-projects",
    badge: "Innovation",
    color: "oklch(0.8 0.17 65)",
    capabilities: [
      "University Portfolio",
      "MUN Simulator",
      "Capstone Planner",
      "Venture Incubator",
      "Evidence Export",
    ],
  },
];

export interface GrowthMapOrchestratorSpec {
  id: "growth-map";
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  to: string;
  icon: LucideIcon;
  guideId: string;
  lifeAreas: {
    key: string;
    label: string;
    labelAr: string;
    modules: string[]; // module numbers
  }[];
}

/**
 * Growth Map is NOT Module 21.
 * It is the central cross-platform orchestrator connecting all 20 canonical modules
 * into a single unified learning loop, XP system, life areas, and weekly velocity engine.
 */
export const GROWTH_MAP_ORCHESTRATOR: GrowthMapOrchestratorSpec = {
  id: "growth-map",
  title: "Growth Map & Life Orchestration",
  titleAr: "خارطة النمو والتوجيه الشامل",
  subtitle: "Cross-platform intelligence unifying all 20 canonical modules",
  subtitleAr: "محرك الذكاء المركزي الذي يربط الوحدات العشرين في دورة نمو واحدة",
  to: "/app",
  icon: Map,
  guideId: "growth-map",
  lifeAreas: [
    {
      key: "academic",
      label: "Academic Mastery",
      labelAr: "التفوق الأكاديمي",
      modules: ["01", "02", "04", "13", "14", "19"],
    },
    {
      key: "productivity",
      label: "Productivity & Focus",
      labelAr: "الإنتاجية والتركيز",
      modules: ["05", "06", "16"],
    },
    {
      key: "skills",
      label: "Practical Skills & Innovation",
      labelAr: "المهارات والابتكار",
      modules: ["03", "15", "16", "20"],
    },
    {
      key: "wellbeing",
      label: "Health & Wellbeing",
      labelAr: "الصحة والعافية",
      modules: ["07", "09", "17"],
    },
    {
      key: "social",
      label: "Community & Culture",
      labelAr: "المجتمع والثقافة",
      modules: ["10", "11", "18"],
    },
    {
      key: "future",
      label: "Future & Opportunities",
      labelAr: "المستقبل والفرص",
      modules: ["08", "12", "20"],
    },
  ],
};

export function getCanonicalModule(idOrNumber: string): CanonicalModule | undefined {
  return CANONICAL_MODULES.find((m) => m.id === idOrNumber || m.number === idOrNumber);
}

export function getModulesByCategory(category: ModuleCategoryKey): CanonicalModule[] {
  return CANONICAL_MODULES.filter((m) => m.category === category);
}

export function searchModules(query: string, lang: "en" | "ar" = "en"): CanonicalModule[] {
  const q = query.trim().toLowerCase();
  if (!q) return CANONICAL_MODULES;
  return CANONICAL_MODULES.filter((m) => {
    const haystacks = [
      m.number,
      m.name.toLowerCase(),
      m.nameAr,
      m.description.toLowerCase(),
      m.descriptionAr,
      m.badge.toLowerCase(),
      ...m.capabilities.map((c) => c.toLowerCase()),
    ];
    return haystacks.some((h) => h.includes(q));
  });
}

/**
 * Approved active BTC module directory: strictly removes legacy Wellbeing/Care,
 * Future & Careers, Opportunity Radar, Rahmah/Martial Arts, and redundant cards
 * while keeping CANONICAL_MODULES intact for architecture validation.
 */
export const EXCLUDED_LEGACY_MODULE_IDS = new Set([
  "wellbeing-healthy-habits",
  "future-careers",
  "opportunity-radar",
  "community-impact",
  "projects-innovation",
  "skills-academy",
]);

export const APPROVED_BTC_MODULES: CanonicalModule[] = CANONICAL_MODULES.filter(
  (m) => !EXCLUDED_LEGACY_MODULE_IDS.has(m.id),
);

export const MODULES_CATALOG = APPROVED_BTC_MODULES;
