/**
 * BTC — Ready-to-Use Learning Library Across All Sections
 * Curated starter materials: Flashcard decks, study notes, task project templates,
 * career roadmaps, and wellbeing grounding protocols.
 * Supports preview and 1-click duplication into student workspace.
 */

export interface ReadyLibraryItem {
  id: string;
  category: "study" | "tasks" | "future" | "care";
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  subject?: string;
  badge: string;
  actionLabelEn: string;
  actionLabelAr: string;
  itemCount: number;
  previewPoints: string[];
  deckData?: Array<{ front: string; back: string }>;
  tasksData?: Array<{ title: string; priority: "high" | "medium" | "low"; details: string }>;
  goalData?: {
    title: string;
    area: "academic" | "productivity" | "career" | "wellbeing";
    milestones: string[];
  };
}

export const READY_TO_USE_LIBRARY: ReadyLibraryItem[] = [
  // 1. STUDY STARTER PACKS
  {
    id: "lib-study-bio",
    category: "study",
    titleEn: "Cellular Biology Fundamentals: Mitosis & Energy",
    titleAr: "أساسيات علم الأحياء الخلوي: الانقسام الخيطي والطاقة",
    subtitleEn:
      "10 high-yield flashcards covering organelle functions, ATP synthesis, and cell cycle stages.",
    subtitleAr: "10 بطاقات تعليمية عالية الأهمية تغطي وظائف العضيات، إنتاج الطاقة، ودورة الخلية.",
    subject: "Biology",
    badge: "10 Flashcards",
    actionLabelEn: "Import Study Deck",
    actionLabelAr: "استيراد البطاقات",
    itemCount: 10,
    previewPoints: [
      "Mitochondria: The site of aerobic cellular respiration generating ATP.",
      "Ribosomes: Cellular machines assembling amino acids into protein chains.",
      "Mitosis Stages: Prophase, Metaphase, Anaphase, Telophase (PMAT).",
      "Chloroplasts: Double-membrane organelles conducting chlorophyll photosynthesis.",
      "Endoplasmic Reticulum: Rough (protein folding) and Smooth (lipid synthesis).",
    ],
    deckData: [
      {
        front: "What is the primary role of the Mitochondria in eukaryotic cells?",
        back: "Aerobic cellular respiration to generate adenosine triphosphate (ATP) energy.",
      },
      {
        front: "Name the four sequential phases of Mitosis.",
        back: "Prophase, Metaphase, Anaphase, Telophase (PMAT), followed by cytokinesis.",
      },
      {
        front: "What cellular organelle is responsible for assembling polypeptide proteins?",
        back: "Ribosomes, located free in the cytoplasm or bound to the rough endoplasmic reticulum.",
      },
      {
        front: "How does passive diffusion differ from active transport across cell membranes?",
        back: "Passive diffusion requires no energy (down gradient); active transport requires ATP (against gradient).",
      },
      {
        front: "What molecule stores and transmits genetic blueprints in the cell nucleus?",
        back: "Deoxyribonucleic acid (DNA), packaged into chromosomes.",
      },
      {
        front: "Define Osmosis in biological systems.",
        back: "The net movement of water molecules across a semi-permeable membrane from low solute to high solute concentration.",
      },
      {
        front: "What is the function of the Golgi Apparatus?",
        back: "Modifying, sorting, and packaging proteins and lipids for transport outside or within the cell.",
      },
      {
        front: "Explain the role of Chlorophyll in plant photosynthesis.",
        back: "A green pigment absorbing blue and red light to convert light energy into chemical glucose energy.",
      },
      {
        front: "What happens during Metaphase in cell division?",
        back: "Replicated sister chromatids align along the central equatorial metaphase plate.",
      },
      {
        front: "What role do Lysosomes perform?",
        back: "Membrane-bound vesicles containing digestive hydrolytic enzymes that break down cellular waste.",
      },
    ],
  },
  {
    id: "lib-study-physics",
    category: "study",
    titleEn: "Physics Mechanics: Newton's Laws & Kinematics",
    titleAr: "ميكانيكا الفيزياء: قوانين نيوتن ومعادلات الحركة",
    subtitleEn:
      "Essential formulas, definitions, and problem-solving principles for exam preparation.",
    subtitleAr: "أهم القوانين والتعاريف ومبادئ حل المسائل الفيزيائية لاختبارات الثانوية والمتوسط.",
    subject: "Physics",
    badge: "8 Formula Cards",
    actionLabelEn: "Import Physics Deck",
    actionLabelAr: "استيراد بطاقات الفيزياء",
    itemCount: 8,
    previewPoints: [
      "Newton's 1st Law (Inertia): An object remains at rest unless acted on by a net external force.",
      "Newton's 2nd Law: Force equals mass multiplied by acceleration (F = m × a).",
      "Kinematic Formula: v = u + at, and s = ut + ½at².",
      "Work-Energy Theorem: Work = Force × displacement × cos(θ).",
    ],
    deckData: [
      {
        front: "State Newton's First Law of Motion (Law of Inertia).",
        back: "An object will remain at rest or move at a constant velocity unless compelled to change by a resultant external force.",
      },
      {
        front: "State Newton's Second Law Formula and SI Units.",
        back: "F_net = m · a (Force in Newtons N, mass in kg, acceleration in m/s²).",
      },
      {
        front: "State Newton's Third Law of Motion.",
        back: "For every action force applied, there is an equal and opposite reaction force acting on the interacting body.",
      },
      {
        front: "What is the first standard Kinematic Equation for constant acceleration?",
        back: "v = u + at (where v = final velocity, u = initial velocity, a = acceleration, t = time elapsed).",
      },
      {
        front: "What is the equation for Gravitational Potential Energy?",
        back: "E_p = m · g · h (where g ≈ 9.8 m/s² on Earth's surface).",
      },
      { front: "What is the equation for Kinetic Energy?", back: "E_k = ½ · m · v² (Joules J)." },
      {
        front: "Define Momentum and its conservation principle.",
        back: "p = m · v. In an isolated system with no external forces, total initial momentum equals total final momentum.",
      },
      {
        front: "What is the mathematical definition of Mechanical Power?",
        back: "Power = Work / time = Force × velocity (measured in Watts W = J/s).",
      },
    ],
  },
  {
    id: "lib-study-cornell",
    category: "study",
    titleEn: "Cornell Note-Taking Starter: Active Recall Format",
    titleAr: "نموذج كورنيل للتدوين الفعال: نظام الاستذكار النشط",
    subtitleEn: "Standardized cue column, main lecture notes, and 2-sentence summary structure.",
    subtitleAr: "هيكل معياري لعمود الأسئلة الكاشفة، الملاحظات الرئيسية، وملخص الاسترجاع السريع.",
    subject: "General",
    badge: "Note Template",
    actionLabelEn: "Use Note Template",
    actionLabelAr: "استخدام نموذج الملاحظات",
    itemCount: 1,
    previewPoints: [
      "Left Column (2.5 inches): Keywords, cue questions, and active recall triggers.",
      "Right Column (6 inches): Concise lecture notes, bullet formulas, indented points.",
      "Bottom Section (2 inches): 2-sentence synthesis answering 'What is the big idea?'.",
    ],
    deckData: [
      {
        front: "Cornell Framework: Cue Question Structure",
        back: "Turn every heading into a question: e.g. 'Why does X occur?' rather than 'Properties of X'.",
      },
      {
        front: "Cornell Framework: The 5 R's of Studying",
        back: "Record, Reduce, Recite, Reflect, Review.",
      },
    ],
  },

  // 2. PRODUCTIVITY & TASKS STARTER PACKS
  {
    id: "lib-tasks-science-fair",
    category: "tasks",
    titleEn: "Science Fair & STEM Project 4-Week Blueprint",
    titleAr: "خطة المعرض العلمي ومشاريع STEM (4 أسابيع)",
    subtitleEn:
      "6 milestone tasks from research hypothesis and lab experiments to poster presentation.",
    subtitleAr: "6 مهام متتالية من صياغة الفرضية والتجربة المخبرية حتى إعداد ملصق العرض.",
    badge: "6-Task Blueprint",
    actionLabelEn: "Add Tasks to Planner",
    actionLabelAr: "إضافة المهام للجدول",
    itemCount: 6,
    previewPoints: [
      "Week 1: Define testable hypothesis and background literature review.",
      "Week 2: Assemble materials, control variables, and conduct 3 test trials.",
      "Week 3: Tabulate raw measurements, compute standard deviation, and plot graphs.",
      "Week 4: Finalize trifold scientific poster and practice 3-minute oral pitch.",
    ],
    tasksData: [
      {
        title: "Define STEM testable hypothesis & research question",
        priority: "high",
        details:
          "Review scientific journals and specify independent, dependent, and controlled variables.",
      },
      {
        title: "Gather experimental apparatus & safety gear",
        priority: "medium",
        details: "Prepare lab supplies, calibrated digital scale, and digital sensor probes.",
      },
      {
        title: "Run experimental trials 1, 2, and 3",
        priority: "high",
        details:
          "Record quantitative observations in a structured lab log without skipping outliers.",
      },
      {
        title: "Statistical data analysis & graph creation",
        priority: "medium",
        details:
          "Plot scatter graphs with error bars, compute percentage changes, and summarize findings.",
      },
      {
        title: "Write Abstract & Conclusion section",
        priority: "high",
        details:
          "Explain whether empirical data supported the original hypothesis and note limitations.",
      },
      {
        title: "Design presentation poster & rehearse 3m pitch",
        priority: "medium",
        details: "Prepare visual diagrams, bulleted findings, and practice Q&A responses.",
      },
    ],
  },
  {
    id: "lib-tasks-exam-14day",
    category: "tasks",
    titleEn: "Final Exam 14-Day Revision Master Schedule",
    titleAr: "جدول المراجعة النهائية للاختبارات (14 يوماً)",
    subtitleEn:
      "Structured multi-subject daily study blocks applying spaced repetition and past-paper drills.",
    subtitleAr:
      "جدول دراسي موزع للمواد المختلفة يطبق التكرار المتباعد وحل نماذج الامتحانات السابقة.",
    badge: "5 Milestone Schedule",
    actionLabelEn: "Add Exam Schedule",
    actionLabelAr: "تثبيت جدول المراجعة",
    itemCount: 5,
    previewPoints: [
      "Days 1-4: Syllabus gap mapping & formula sheet consolidation.",
      "Days 5-8: Timed topic-by-topic flashcard recall sprints.",
      "Days 9-12: Complete 3 timed mock exams under real test constraints.",
      "Days 13-14: Mistake bucket deep-dive and light mental relaxation.",
    ],
    tasksData: [
      {
        title: "Day 1-3: Identify weak curriculum modules via diagnostic quiz",
        priority: "high",
        details: "Use Study Workspace analysis to flag high-difficulty topics and review notes.",
      },
      {
        title: "Day 4-7: Spaced recall flashcard drills (2 × 45m daily)",
        priority: "high",
        details: "Focus on definitions, historical dates, and scientific mechanisms.",
      },
      {
        title: "Day 8-10: Solve 2 official past-exam papers under timed conditions",
        priority: "high",
        details: "Mark strictly against official model answers and write missed items to mistakes.",
      },
      {
        title: "Day 11-12: Target and master 'Needs Review' mistake bucket",
        priority: "medium",
        details: "Re-solve every missed problem until achieving 100% accuracy.",
      },
      {
        title: "Day 13-14: Pre-exam calm review & early sleep routine",
        priority: "medium",
        details: "Organize examination stationery, review summary cheat-sheet, and sleep 8 hours.",
      },
    ],
  },

  // 3. FUTURE & CAREER PATHWAYS
  {
    id: "lib-future-cs",
    category: "future",
    titleEn: "Computer Science & Software Innovation Pathway",
    titleAr: "خارطة طريق علوم الحاسوب وهندسة البرمجيات",
    subtitleEn:
      "Four progression milestones: Core algorithms, Git collaboration, web app development, and open-source.",
    subtitleAr:
      "أربعة معالم رئيسية: الخوارزميات، نظام Git، تطوير التطبيقات الحديثة، والمشاريع البرمجية.",
    badge: "Career Roadmap",
    actionLabelEn: "Adopt Pathway Goal",
    actionLabelAr: "تبنّي الهدف الأكاديمي",
    itemCount: 4,
    previewPoints: [
      "Milestone 1: Master programming fundamentals (variables, loops, functions, OOP).",
      "Milestone 2: Version control workflow (Git commits, branching, pull requests).",
      "Milestone 3: Build & deploy full-stack interactive student web app.",
      "Milestone 4: Contribute to an open-source educational repository or competition.",
    ],
    goalData: {
      title: "Master Software Engineering Foundations & Build Portfolio",
      area: "career",
      milestones: [
        "Complete 30 algorithm problem challenges on data structures",
        "Publish clean GitHub repository with semantic commit messages",
        "Deploy a responsive full-stack application with real persistence",
        "Submit project to an international student competition or showcase",
      ],
    },
  },
  {
    id: "lib-future-premed",
    category: "future",
    titleEn: "Biomedical & Pre-Health Student Pathway",
    titleAr: "مسار العلوم الطبية الحيوية والتحضير للطب",
    subtitleEn:
      "Structured milestones balancing high-GPA science courses, lab methods, and healthcare volunteering.",
    subtitleAr: "خطة متوازنة بين التفوق في العلوم الحيوية، التدريب المخبري، والعمل التطوعي الصحي.",
    badge: "Pre-Med Roadmap",
    actionLabelEn: "Adopt Pre-Med Goal",
    actionLabelAr: "تبنّي المسار الطبي",
    itemCount: 4,
    previewPoints: [
      "Milestone 1: Maintain excellence in organic chemistry and biology prerequisites.",
      "Milestone 2: Master laboratory pipetting, spectrometry, and safety protocols.",
      "Milestone 3: Complete 40 hours of community clinic or hospital volunteering.",
      "Milestone 4: Write reflection journal on clinical ethics and patient communication.",
    ],
    goalData: {
      title: "Prepare Competitive Biomedical University Portfolio",
      area: "career",
      milestones: [
        "Achieve top scores in Biology, Chemistry, and Advanced Mathematics",
        "Complete certified lab safety & fundamental scientific method training",
        "Log 40 hours of meaningful healthcare or community service",
        "Draft a compelling personal statement highlighting compassion and scientific curiosity",
      ],
    },
  },

  // 4. CARE & WELLBEING PROTOCOLS
  {
    id: "lib-care-grounding",
    category: "care",
    titleEn: "5-4-3-2-1 Sensory Grounding De-Stress Routine",
    titleAr: "تقنية التأريض الحسي 5-4-3-2-1 لتخفيف التوتر والقلق",
    subtitleEn: "Scientifically proven 3-minute somatic reset for exam anxiety and focus drift.",
    subtitleAr: "تمرين نفسي مثبت خلال 3 دقائق لاستعادة الهدوء وتخفيف قلق الاختبارات.",
    badge: "Mindfulness Protocol",
    actionLabelEn: "Adopt Daily Habit",
    actionLabelAr: "تثبيت العادة اليومية",
    itemCount: 5,
    previewPoints: [
      "5 things you can SEE around your desk.",
      "4 things you can physically TOUCH and feel.",
      "3 distinct sounds you can HEAR in the room.",
      "2 scents you can SMELL in the air.",
      "1 positive affirmation you TASTE or whisper to yourself.",
    ],
    goalData: {
      title: "Practice Daily Mindful Focus & Stress Regulation",
      area: "wellbeing",
      milestones: [
        "Perform 5-4-3-2-1 reset before starting morning study block",
        "Take a 5-minute screen-free walk after every 50 minutes of studying",
        "Record evening Daily Pulse energy rating and gratitude note",
      ],
    },
  },
];
