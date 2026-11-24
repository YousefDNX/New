export type CurriculumLevelId = "foundation" | "A1" | "A2" | "B1" | "B2" | "C1_C2";

export type AdventureRegionId =
  | "vocabulary-village"
  | "grammar-kingdom"
  | "listening-forest"
  | "pronunciation-mountain"
  | "reading-library"
  | "speaking-city"
  | "writing-academy"
  | "communication-harbor"
  | "english-challenge-arena"
  | "mastery-castle";

export type AcademyWorkspaceId =
  "listening" | "speaking" | "reading" | "writing" | "vocabulary" | "grammar" | "pronunciation";

export interface AdventureRegion {
  id: AdventureRegionId;
  name: string;
  nameAr: string;
  subtitle: string;
  cefrBand: string;
  levelIds: CurriculumLevelId[];
  academyId: AcademyWorkspaceId;
  /** SVG percentage coordinates (0-100) for connected interactive adventure map */
  mapX: number;
  mapY: number;
  prerequisiteRegionIds: AdventureRegionId[];
  unlockHint: string;
  lessonIds: string[];
  objective: string;
  rewardXp: number;
}

export interface CurriculumLevelMeta {
  id: CurriculumLevelId;
  code: string;
  title: string;
  titleAr: string;
  description: string;
  targetOutcome: string;
  certificateTitle: string;
  certificateId: string;
}

export interface LessonExample {
  en: string;
  ar: string;
  highlight: string;
  note: string;
}

export type ExerciseKind = "mcq" | "fill_blank" | "true_false" | "sentence_fix";

export interface LessonExercise {
  id: string;
  kind: ExerciseKind;
  prompt: string;
  options?: string[];
  /** Used for fill_blank / sentence_fix typed checks (case-insensitive trimmed match against acceptedAnswers) */
  acceptedAnswers?: string[];
  /** Used for mcq / true_false option index */
  correctIndex?: number;
  hint: string;
  explanation: string;
}

export interface EnglishLesson {
  id: string;
  levelId: CurriculumLevelId;
  cefrLabel: string;
  unitNumber: number;
  unitTitle: string;
  title: string;
  titleAr: string;
  regionId: AdventureRegionId;
  skillFocus: AcademyWorkspaceId;
  estimatedMinutes: number;
  objective: string;
  intro: string;
  explanation: string[];
  examples: LessonExample[];
  arabicBridge: string;
  guidedPractice: LessonExercise;
  exercises: LessonExercise[];
  revisionSummary: string;
  completionCriteria: string;
  minPassPct: number;
  xpReward: number;
}

export interface LevelMasteryExam {
  id: string;
  levelId: CurriculumLevelId;
  title: string;
  titleAr: string;
  description: string;
  passingPct: number;
  certificateId: string;
  certificateTitle: string;
  questions: Array<{
    id: string;
    skill: AcademyWorkspaceId;
    prompt: string;
    passage?: string;
    options: [string, string, string, string];
    correctIndex: 0 | 1 | 2 | 3;
    explanation: string;
  }>;
}

export interface DailyMissionDef {
  id: string;
  title: string;
  titleAr: string;
  targetType:
    | "lesson"
    | "listening"
    | "vocab"
    | "writing"
    | "reading"
    | "grammar"
    | "speaking"
    | "pronunciation";
  targetCount: number;
  xpBonus: number;
  actionLabel: string;
}

export const CURRICULUM_LEVELS: CurriculumLevelMeta[] = [
  {
    id: "foundation",
    code: "Pre-A1",
    title: "Foundation Explorer",
    titleAr: "المرحلة التأسيسية",
    description:
      "Phonics, everyday greetings, core survival nouns/verbs, numbers, and basic Subject + Verb patterns.",
    targetOutcome: "Read familiar daily expressions and form clear simple sentences.",
    certificateTitle: "NEXORA English Foundation Explorer Certificate",
    certificateId: "cert-en-foundation",
  },
  {
    id: "A1",
    code: "A1",
    title: "Beginner Builder",
    titleAr: "المبتدئ (A1)",
    description:
      "Daily routines, present simple, articles, basic questions, polite requests, and short guided dialogues.",
    targetOutcome:
      "Describe your routine, ask simple questions, and understand short everyday texts.",
    certificateTitle: "NEXORA English A1 Communicator Certificate",
    certificateId: "cert-en-a1",
  },
  {
    id: "A2",
    code: "A2",
    title: "Elementary Navigator",
    titleAr: "الأساسي المتقدم (A2)",
    description:
      "Past narratives, food/health/culture themes (integrated with Grade 9 Unit 3), comparatives, and organized paragraphs.",
    targetOutcome: "Narrate past experiences, compare options, and write unified paragraphs.",
    certificateTitle: "NEXORA English A2 Navigator Certificate",
    certificateId: "cert-en-a2",
  },
  {
    id: "B1",
    code: "B1",
    title: "Intermediate Achiever",
    titleAr: "المتوسط (B1)",
    description:
      "Present perfect vs past simple, conditionals, modal nuance, formal emails, and inference-based reading & listening.",
    targetOutcome:
      "Explain opinions with reasons, handle everyday school/travel situations, and draft clear emails.",
    certificateTitle: "NEXORA English B1 Independent Achiever Certificate",
    certificateId: "cert-en-b1",
  },
  {
    id: "B2",
    code: "B2",
    title: "Upper-Intermediate Scholar",
    titleAr: "فوق المتوسط (B2)",
    description:
      "Reported speech, relative clauses, passive voice in science reports, academic essays, and persuasive speaking.",
    targetOutcome:
      "Analyze multi-perspective articles and write structured, evidence-supported essays.",
    certificateTitle: "NEXORA English B2 Academic Scholar Certificate",
    certificateId: "cert-en-b2",
  },
  {
    id: "C1_C2",
    code: "C1–C2",
    title: "Mastery Specialist",
    titleAr: "الإتقان المتقدم (C1–C2)",
    description:
      "Mixed conditionals, emphatic inversion, rhetorical nuance, diplomatic synthesis, and critical research summaries.",
    targetOutcome:
      "Synthesize complex arguments precisely with academic register and nuanced style.",
    certificateTitle: "NEXORA English C1–C2 Mastery Certificate",
    certificateId: "cert-en-c1c2",
  },
];

export const ADVENTURE_REGIONS: AdventureRegion[] = [
  {
    id: "vocabulary-village",
    name: "Vocabulary Village",
    nameAr: "قرية المفردات",
    subtitle: "Build core word families, meanings & Grade 9 Unit 3 terms",
    cefrBand: "Pre-A1 → A2",
    levelIds: ["foundation", "A1", "A2"],
    academyId: "vocabulary",
    mapX: 10,
    mapY: 50,
    prerequisiteRegionIds: [],
    unlockHint: "Unlocked from the start — begin your word journey here.",
    lessonIds: ["cur-pre-greetings", "cur-a2-heritage-vocab"],
    objective: "Master high-frequency words through multiple spaced interactions.",
    rewardXp: 25,
  },
  {
    id: "grammar-kingdom",
    name: "Grammar Kingdom",
    nameAr: "مملكة القواعد",
    subtitle: "Master sentence structure, tenses, clauses & accuracy",
    cefrBand: "Pre-A1 → B2",
    levelIds: ["foundation", "A1", "A2", "B1", "B2"],
    academyId: "grammar",
    mapX: 26,
    mapY: 22,
    prerequisiteRegionIds: [],
    unlockHint: "Unlocked from the start — build reliable sentence mechanics.",
    lessonIds: ["cur-a1-present-routines", "cur-b1-perfect-vs-past"],
    objective: "Apply verb tenses, clauses, and syntax accurately in real sentences.",
    rewardXp: 25,
  },
  {
    id: "listening-forest",
    name: "Listening Forest",
    nameAr: "غابة الاستماع",
    subtitle: "Train comprehension with graded audio, speed controls & transcripts",
    cefrBand: "A1 → C1",
    levelIds: ["A1", "A2", "B1"],
    academyId: "listening",
    mapX: 28,
    mapY: 76,
    prerequisiteRegionIds: [],
    unlockHint: "Unlocked from the start — train ear for main ideas & details.",
    lessonIds: ["cur-a1-listening-cues", "cur-b1-podcast-details"],
    objective: "Identify main ideas, speaker intent, and specific facts from spoken English.",
    rewardXp: 25,
  },
  {
    id: "pronunciation-mountain",
    name: "Pronunciation Mountain",
    nameAr: "جبل النطق",
    subtitle: "Minimal pairs, IPA vowels, word stress & natural intonation",
    cefrBand: "Pre-A1 → B2",
    levelIds: ["foundation", "A1", "B1"],
    academyId: "pronunciation",
    mapX: 46,
    mapY: 18,
    prerequisiteRegionIds: ["vocabulary-village"],
    unlockHint: "Complete 1 lesson in Vocabulary Village to unlock this peak.",
    lessonIds: ["cur-a1-phonics-pairs"],
    objective: "Distinguish /p/-/b/, /v/-/f/, vowel lengths, and clear syllable stress.",
    rewardXp: 30,
  },
  {
    id: "reading-library",
    name: "Reading Library",
    nameAr: "مكتبة القراءة",
    subtitle: "Stories, cultural essays & science texts with inference checks",
    cefrBand: "A1 → C1",
    levelIds: ["A1", "A2", "B1", "B2"],
    academyId: "reading",
    mapX: 48,
    mapY: 50,
    prerequisiteRegionIds: ["vocabulary-village", "grammar-kingdom"],
    unlockHint: "Complete 1 lesson each in Vocabulary Village & Grammar Kingdom.",
    lessonIds: ["cur-a2-reading-inference", "cur-b2-science-synthesis"],
    objective: "Extract main ideas, infer implied meaning, and deduce vocabulary in context.",
    rewardXp: 30,
  },
  {
    id: "speaking-city",
    name: "Speaking City",
    nameAr: "مدينة المحادثة",
    subtitle: "Guided role-plays, Q&A, voice capture & PREP presentations",
    cefrBand: "A1 → B2",
    levelIds: ["A1", "A2", "B1"],
    academyId: "speaking",
    mapX: 56,
    mapY: 78,
    prerequisiteRegionIds: ["listening-forest"],
    unlockHint: "Complete 1 lesson or listening track in Listening Forest to enter.",
    lessonIds: ["cur-a2-everyday-roleplay"],
    objective: "Respond coherently in realistic school, market, and interview scenarios.",
    rewardXp: 30,
  },
  {
    id: "writing-academy",
    name: "Writing Academy",
    nameAr: "أكاديمية الكتابة",
    subtitle: "Sentences, paragraphs, emails & essays with revision coaching",
    cefrBand: "A2 → C1",
    levelIds: ["A2", "B1", "B2"],
    academyId: "writing",
    mapX: 68,
    mapY: 28,
    prerequisiteRegionIds: ["grammar-kingdom", "reading-library"],
    unlockHint: "Complete Reading Library + Grammar Kingdom foundations to unlock.",
    lessonIds: ["cur-a2-paragraph-craft", "cur-b2-argument-essay"],
    objective: "Draft organized paragraphs, formal emails, and essays, then revise from feedback.",
    rewardXp: 35,
  },
  {
    id: "communication-harbor",
    name: "Communication Harbor",
    nameAr: "ميناء التواصل",
    subtitle: "Cross-cultural dialogue, persuasive presentations & debates",
    cefrBand: "B1 → C1",
    levelIds: ["B1", "B2"],
    academyId: "speaking",
    mapX: 76,
    mapY: 66,
    prerequisiteRegionIds: ["speaking-city", "reading-library"],
    unlockHint: "Unlock after visiting both Speaking City and Reading Library.",
    lessonIds: ["cur-c1-diplomatic-dialogue"],
    objective: "Connect listening, reading evidence, and fluent spoken persuasion.",
    rewardXp: 35,
  },
  {
    id: "english-challenge-arena",
    name: "English Challenge Arena",
    nameAr: "ساحة التحديات",
    subtitle: "Timed grammar precision, unit assessments & mixed mastery",
    cefrBand: "A2 → C2",
    levelIds: ["B1", "B2", "C1_C2"],
    academyId: "grammar",
    mapX: 84,
    mapY: 32,
    prerequisiteRegionIds: ["writing-academy", "listening-forest"],
    unlockHint: "Complete Writing Academy + Listening Forest milestones to enter.",
    lessonIds: ["cur-c1-inversion-nuance"],
    objective: "Test speed and accuracy across integrated grammar, reading, and editing tasks.",
    rewardXp: 40,
  },
  {
    id: "mastery-castle",
    name: "Mastery Castle",
    nameAr: "قلعة الإتقان",
    subtitle: "Capstone synthesis, C1–C2 rhetoric & completion certificates",
    cefrBand: "B2 → C2",
    levelIds: ["B2", "C1_C2"],
    academyId: "writing",
    mapX: 93,
    mapY: 49,
    prerequisiteRegionIds: ["communication-harbor", "english-challenge-arena"],
    unlockHint: "Reach Communication Harbor & Challenge Arena to claim the Castle summit.",
    lessonIds: ["cur-c2-critical-synthesis"],
    objective: "Produce publication-quality academic summaries and earn level certificates.",
    rewardXp: 50,
  },
];

export const CURRICULUM_LESSONS: EnglishLesson[] = [
  {
    id: "cur-pre-greetings",
    levelId: "foundation",
    cefrLabel: "Pre-A1",
    unitNumber: 1,
    unitTitle: "Unit 1 · Everyday Foundations",
    title: "Greetings, Introductions & Core Survival Words",
    titleAr: "التحية والتعريف بالنفس والكلمات الأساسية",
    regionId: "vocabulary-village",
    skillFocus: "vocabulary",
    estimatedMinutes: 8,
    objective:
      "Introduce yourself clearly, ask someone's name politely, and use basic time-of-day greetings.",
    intro:
      "Every English conversation starts with a warm greeting. Mastering polite openings builds immediate confidence when meeting classmates or teachers.",
    explanation: [
      "Use 'Good morning' before 12:00 PM, 'Good afternoon' from 12:00 to 5:00 PM, and 'Good evening' after 5:00 PM.",
      "Introduce yourself with 'Hello, my name is...' or 'Hi, I am...' followed by a friendly follow-up question like 'Nice to meet you.'",
      "Always pair basic nouns with 'a' or 'an' for one singular item: 'a book', 'an apple' (use 'an' before vowel sounds a, e, i, o, u).",
    ],
    examples: [
      {
        en: "Good morning! My name is Tariq. I am a student.",
        ar: "صباح الخير! اسمي طارق. أنا طالب.",
        highlight: "My name is ... I am a ...",
        note: "Formal and polite opening for school or morning classes.",
      },
      {
        en: "Nice to meet you, Sara. Here is an orange and a notebook.",
        ar: "تشرفت بلقائك يا سارة. تفضلي برتقالة ودفتر ملاحظات.",
        highlight: "an orange / a notebook",
        note: "'orange' starts with a vowel sound → 'an'; 'notebook' starts with a consonant → 'a'.",
      },
    ],
    arabicBridge:
      "في العربية لا توجد أداة نكرة منفصلة مثل a/an، لكن في الإنجليزية يجب وضع a أو an قبل الاسم المفرد المعدود دائماً (مثل: a student، an umbrella).",
    guidedPractice: {
      id: "cur-pre-greetings-gp",
      kind: "mcq",
      prompt: "Which sentence uses 'a / an' accurately when introducing a classroom item?",
      options: [
        "I have a eraser in my bag.",
        "I have an eraser in my bag.",
        "I have eraser in my bag.",
        "I have an pencil in my bag.",
      ],
      correctIndex: 1,
      hint: "Look at the first sound of the noun after the article: 'eraser' begins with a vowel sound.",
      explanation: "'Eraser' begins with a vowel sound, so 'an eraser' is grammatically accurate.",
    },
    exercises: [
      {
        id: "cur-pre-g-1",
        kind: "mcq",
        prompt: "You meet your English teacher at 8:30 AM. What is the most natural greeting?",
        options: [
          "Good night, teacher!",
          "Good morning, teacher!",
          "Goodbye, see you tomorrow!",
          "Good evening, friend!",
        ],
        correctIndex: 1,
        hint: "Think about the time of day: 8:30 AM.",
        explanation: "'Good morning' is used from waking up until noon (12:00 PM).",
      },
      {
        id: "cur-pre-g-2",
        kind: "fill_blank",
        prompt: "Complete politely: 'Hello! My ___ is Nadia. Nice to meet you.'",
        acceptedAnswers: ["name"],
        hint: "What word introduces who you are?",
        explanation: "'My name is Nadia' is the standard clear self-introduction.",
      },
      {
        id: "cur-pre-g-3",
        kind: "true_false",
        prompt: "True or False: We say 'Good evening' when we leave someone to go to sleep.",
        options: ["True", "False"],
        correctIndex: 1,
        hint: "'Good evening' greets someone; 'Good night' says farewell before sleep.",
        explanation:
          "False! 'Good evening' is a greeting at sunset/night; 'Good night' is only a farewell.",
      },
    ],
    revisionSummary:
      "Greetings match time of day (morning/afternoon/evening); introduce with 'My name is...'; remember 'a' + consonant sound, 'an' + vowel sound.",
    completionCriteria: "Complete the guided check and score at least 70% on the exercises.",
    minPassPct: 70,
    xpReward: 20,
  },
  {
    id: "cur-a1-present-routines",
    levelId: "A1",
    cefrLabel: "A1",
    unitNumber: 1,
    unitTitle: "Unit 1 · Daily Life & Present Simple",
    title: "Daily Routines, Subject-Verb Agreement & Questions",
    titleAr: "الروتين اليومي والمضارع البسيط وتكوين الأسئلة",
    regionId: "grammar-kingdom",
    skillFocus: "grammar",
    estimatedMinutes: 10,
    objective:
      "Describe daily habits accurately using Present Simple (+s for he/she/it) and form Do/Does questions.",
    intro:
      "When talking about habits, timetables, and facts that happen repeatedly, English relies on the Present Simple tense.",
    explanation: [
      "Use the base verb with I, you, we, and they: 'We study English every afternoon.'",
      "Add -s or -es with he, she, and it: 'She walks to school.' / 'He watches educational videos.'",
      "To ask a yes/no question, start with 'Do' (I/you/we/they) or 'Does' (he/she/it) — and drop the -s from the main verb!",
    ],
    examples: [
      {
        en: "Omar usually drinks water before his study session, and his sisters drink mint tea.",
        ar: "عادةً يشرب عمر الماء قبل جلسة مذاكرته، وتشرب أخواته الشاي بالنعناع.",
        highlight: "Omar drinks / sisters drink",
        note: "Singular 'Omar' takes -s ('drinks'); plural 'sisters' uses base verb ('drink').",
      },
      {
        en: "Does Nadia study at the public library on Saturdays?",
        ar: "هل تدرس نادية في المكتبة العامة أيام السبت؟",
        highlight: "Does Nadia study...?",
        note: "Notice 'study' stays in base form because 'Does' already carries the -es marker.",
      },
    ],
    arabicBridge:
      "انتبه للخطأ الشائع: لا تضع حرف s للفعل بعد Does أو Doesn't! الصواب: 'Does she live here?' وليس 'Does she lives here?'.",
    guidedPractice: {
      id: "cur-a1-routines-gp",
      kind: "mcq",
      prompt: "Choose the accurate negative sentence in Present Simple:",
      options: [
        "My brother don't like waking up early.",
        "My brother doesn't likes waking up early.",
        "My brother doesn't like waking up early.",
        "My brother not like waking up early.",
      ],
      correctIndex: 2,
      hint: "For singular 'my brother', use 'doesn't' + base verb without -s.",
      explanation: "'Doesn't' takes the third-person marker, so the main verb remains 'like'.",
    },
    exercises: [
      {
        id: "cur-a1-r-1",
        kind: "fill_blank",
        prompt: "Fill in the blank: 'Layla ___ (read) one English story every Friday evening.'",
        acceptedAnswers: ["reads"],
        hint: "Layla = she (third-person singular).",
        explanation:
          "With singular subject 'Layla', the Present Simple habit verb takes -s: 'reads'.",
      },
      {
        id: "cur-a1-r-2",
        kind: "mcq",
        prompt: "Which question is grammatically correct?",
        options: [
          "Do your friend plays football?",
          "Does your friend play football?",
          "Does your friend plays football?",
          "Is your friend play football?",
        ],
        correctIndex: 1,
        hint: "'Your friend' is singular (he/she). Start with 'Does' + base verb.",
        explanation: "'Does your friend play football?' correctly pairs 'Does' with base 'play'.",
      },
      {
        id: "cur-a1-r-3",
        kind: "sentence_fix",
        prompt:
          "Fix the error in: 'He don't eat sugary snacks at school.' (Type the corrected word for 'don't')",
        acceptedAnswers: ["doesn't", "does not"],
        hint: "'He' cannot pair with 'don't'.",
        explanation: "Third-person singular 'he' uses 'doesn't' (or 'does not').",
      },
    ],
    revisionSummary:
      "He/She/It adds -s/-es in affirmative Present Simple; Questions and Negatives use Does/Doesn't + base verb.",
    completionCriteria: "Score >= 70% across the routine drills.",
    minPassPct: 70,
    xpReward: 20,
  },
  {
    id: "cur-a1-listening-cues",
    levelId: "A1",
    cefrLabel: "A1",
    unitNumber: 2,
    unitTitle: "Unit 2 · Listening for Everyday Cues",
    title: "Catching Names, Times & Places in Short Announcements",
    titleAr: "التقاط الأسماء والأوقات والأماكن في الإعلانات القصيرة",
    regionId: "listening-forest",
    skillFocus: "listening",
    estimatedMinutes: 8,
    objective:
      "Extract key numbers, days, and locations from clear spoken classroom and library announcements.",
    intro:
      "You don't need to understand every single word while listening—focus first on WHO, WHEN, and WHERE.",
    explanation: [
      "Listen once for the big picture (Where are the speakers? Who is talking?).",
      "Listen a second time for exact details: room numbers, times (e.g., 10:15 vs 10:50), and dates.",
      "Watch for contrast words like 'actually' or 'changed to'—speakers often correct an earlier time or plan.",
    ],
    examples: [
      {
        en: "The English club meets in Room 12 at 3:15 PM—actually, sorry, Room 14 because Room 12 is being painted.",
        ar: "يجتمع نادي الإنجليزية في الغرفة 12 الساعة 3:15 مساءً—في الحقيقة عفواً، الغرفة 14 لأن 12 قيد الطلاء.",
        highlight: "actually, sorry, Room 14",
        note: "In real listening exams, self-corrections reveal the final true answer!",
      },
    ],
    arabicBridge:
      "انتبه في أسئلة الاستماع لكلمات التصحيح مثل (Actually / Sorry / Instead)، فغالباً ما يذكر المتحدث معلومة أولى ثم يصححها لذكر الإجابة الصحيحة.",
    guidedPractice: {
      id: "cur-a1-list-gp",
      kind: "mcq",
      prompt:
        "If a librarian says: 'The science quiz starts at 9:30, oh wait, it has moved to 9:45 in Hall B,' what time does it start?",
      options: ["9:15", "9:30", "9:45", "10:00"],
      correctIndex: 2,
      hint: "Notice 'oh wait, it has moved to...'.",
      explanation: "Speakers often update times mid-sentence; the final confirmed time is 9:45.",
    },
    exercises: [
      {
        id: "cur-a1-l-1",
        kind: "true_false",
        prompt:
          "True or False: In listening comprehension, you should freeze on the first unknown word instead of listening for the rest of the sentence.",
        options: ["True", "False"],
        correctIndex: 1,
        hint: "Stay calm and keep listening for context words.",
        explanation: "False! Keep listening forward—the next clause often explains the meaning.",
      },
      {
        id: "cur-a1-l-2",
        kind: "mcq",
        prompt:
          "Listen cue: 'Please bring a blue pen and your yellow workbook—not the red notebook.' What two items are needed?",
        options: [
          "Red notebook and blue pen",
          "Blue pen and yellow workbook",
          "Yellow pen and red notebook",
          "Only a red notebook",
        ],
        correctIndex: 1,
        hint: "Note the word 'not' eliminating the red notebook.",
        explanation: "Negation ('not the red notebook') excludes the distractor option.",
      },
      {
        id: "cur-a1-l-3",
        kind: "fill_blank",
        prompt:
          "What single question word helps you listen specifically for a time or date? (Wh___)",
        acceptedAnswers: ["when"],
        hint: "Starts with W-h-e...",
        explanation: "'When' targets times, days, and dates.",
      },
    ],
    revisionSummary:
      "Listen twice: first for overall topic, second for self-corrections ('actually', 'instead') and key details.",
    completionCriteria: "Pass the announcement listening cue checks (>= 70%).",
    minPassPct: 70,
    xpReward: 20,
  },
  {
    id: "cur-a1-phonics-pairs",
    levelId: "A1",
    cefrLabel: "A1",
    unitNumber: 3,
    unitTitle: "Unit 3 · Sound Clarity & Minimal Pairs",
    title: "Voiced vs. Voiceless Consonants (/p/ vs /b/, /f/ vs /v/)",
    titleAr: "الفرق بين الأصوات المهموسة والمجهورة (/p/ و /b/، /f/ و /v/)",
    regionId: "pronunciation-mountain",
    skillFocus: "pronunciation",
    estimatedMinutes: 8,
    objective:
      "Distinguish high-impact consonant pairs that change English word meanings completely.",
    intro:
      "Changing a single burst of air or throat vibration turns 'park' into 'bark' or 'save' into 'safe'. Clear articulation makes your spoken English effortless to understand.",
    explanation: [
      "/p/ is voiceless with a strong puff of air (place your hand near your mouth for 'pen', 'park', 'paper').",
      "/b/ is voiced—your vocal cords vibrate with gentle air ('ben', 'bark', 'baby').",
      "/v/ vibrates your upper teeth against your bottom lip ('van', 'very', 'save'); /f/ has no throat vibration ('fan', 'ferry', 'safe').",
    ],
    examples: [
      {
        en: "Please park the big bus beside the pharmacy.",
        ar: "من فضلك أوقف الحافلة الكبيرة بجانب الصيدلية.",
        highlight: "Please park (/p/) vs big bus beside (/b/)",
        note: "Feel the puff of air on 'Please park' versus gentle throat vibration on 'big bus'.",
      },
    ],
    arabicBridge:
      "نظراً لأن اللغة العربية تستخدم صوت الباء والفاء غالباً، يتشابه نطق p مع b و v مع f أحياناً. ضع ورقة صغيرة أمام فمك عند نطق pen أو park—يجب أن تتحرك الورقة بهواء النطق!",
    guidedPractice: {
      id: "cur-a1-phon-gp",
      kind: "mcq",
      prompt: "Which pair of words differs ONLY in voiced /v/ vs voiceless /f/?",
      options: ["pin / bin", "fan / van", "cup / cub", "time / dime"],
      correctIndex: 1,
      hint: "Look for a pair starting with F vs V.",
      explanation:
        "'fan' (/f/) and 'van' (/v/) are a classic minimal pair differing only in voicing.",
    },
    exercises: [
      {
        id: "cur-a1-p-1",
        kind: "mcq",
        prompt:
          "Which word begins with a strong puff of air (/p/) rather than throat vibration (/b/)?",
        options: ["basket", "pencil", "bridge", "brother"],
        correctIndex: 1,
        hint: "Look for the letter 'p' at the start.",
        explanation: "'pencil' starts with aspirated voiceless /p/.",
      },
      {
        id: "cur-a1-p-2",
        kind: "fill_blank",
        prompt:
          "Complete the meaningful sentence: 'Remember to ___ (save / safe) your study file before closing.'",
        acceptedAnswers: ["save"],
        hint: "You need the verb with voiced /v/ at the end.",
        explanation: "'save' (verb, /v/) vs 'safe' (adjective, /f/).",
      },
      {
        id: "cur-a1-p-3",
        kind: "true_false",
        prompt:
          "True or False: Saying 'berry' instead of 'very' can confuse listeners because /b/ and /v/ use different mouth positions.",
        options: ["True", "False"],
        correctIndex: 0,
        hint: "/v/ touches top teeth to bottom lip; /b/ closes both lips.",
        explanation:
          "True! Top teeth on bottom lip makes /v/ ('very') clear and distinct from /b/ ('berry').",
      },
    ],
    revisionSummary:
      "/p/ blows air (paper test), /b/ vibrates lips; /v/ vibrates teeth-on-lip, /f/ blows gently without throat vibration.",
    completionCriteria: "Score >= 70% on minimal pair articulation checks.",
    minPassPct: 70,
    xpReward: 20,
  },
  {
    id: "cur-a2-heritage-vocab",
    levelId: "A2",
    cefrLabel: "A2",
    unitNumber: 1,
    unitTitle: "Unit 1 · Grade 9 Unit 3 Bridge: Culture, Food & Health",
    title: "Descriptive Adjectives, Nutrition Nouns & British Spelling",
    titleAr: "الصفات الثقافية ومفردات التغذية والتهجئة البريطانية (الوحدة 3)",
    regionId: "vocabulary-village",
    skillFocus: "vocabulary",
    estimatedMinutes: 10,
    objective:
      "Use high-value Grade 9 Unit 3 words (flavour, fibre, aromatic, organic, embrace, reflect) naturally in context.",
    intro:
      "This lesson bridges your Grade 9 Unit 3 textbook directly into the English Adventure World so school vocabulary becomes active fluency.",
    explanation: [
      "Notice British spelling conventions in international academic curricula: 'flavour' (not flavor) and 'fibre' (not fiber).",
      "Combine adjectives and nouns in natural collocations: 'aromatic spices', 'organic produce', 'rich flavour', 'dietary fibre'.",
      "Distinguish literal vs figurative verbs: 'reflect culture' (express heritage) and 'embrace healthy habits' (adopt willingly).",
    ],
    examples: [
      {
        en: "Homemade lentil soup uses fresh aromatic ingredients without harmful preservatives.",
        ar: "يستخدم حساء العدس المنزلي مكونات طازجة وعطرية دون مواد حافظة ضارة.",
        highlight: "homemade · aromatic · ingredients · harmful",
        note: "Natural sentence combining 4 Grade 9 Unit 3 words smoothly.",
      },
    ],
    arabicBridge:
      "تذكّر التهجئة البريطانية المعتمدة في منهج الكويت للصف التاسع: flavour بحرف u، و fibre بحرف re في النهاية.",
    guidedPractice: {
      id: "cur-a2-her-gp",
      kind: "mcq",
      prompt: "Which sentence uses the correct British spelling from Grade 9 Unit 3?",
      options: [
        "Whole grains provide essential flavor and fiber.",
        "Whole grains provide essential flavour and fibre.",
        "Whole grains provide essential flaver and fibur.",
        "Whole grains provide essential flaver and fibre.",
      ],
      correctIndex: 1,
      hint: "Both 'flavour' (-our) and 'fibre' (-re) follow British spelling.",
      explanation: "'flavour' and 'fibre' match exact Kuwait Grade 9 British English conventions.",
    },
    exercises: [
      {
        id: "cur-a2-h-1",
        kind: "fill_blank",
        prompt:
          "Fill in the exact word from Unit 3: 'Cardamom gives Arabic coffee a warm, ___ scent.' (meaning sweet-smelling/spicy)",
        acceptedAnswers: ["aromatic"],
        hint: "Starts with 'aroma...'",
        explanation: "'aromatic' describes a pleasant, distinctive herbal or spicy smell.",
      },
      {
        id: "cur-a2-h-2",
        kind: "mcq",
        prompt: "If a dish stands out immediately from all others, it is:",
        options: ["raw", "distinctive", "harmful", "common"],
        correctIndex: 1,
        hint: "Think of 'distinct' / special.",
        explanation: "'distinctive' means having a unique quality that sets it apart.",
      },
      {
        id: "cur-a2-h-3",
        kind: "fill_blank",
        prompt:
          "Write the British-spelled noun meaning the plant roughage in oats and vegetables: ___",
        acceptedAnswers: ["fibre"],
        hint: "Five letters: f-i-b-r-e.",
        explanation: "'fibre' (British spelling) helps keep digestion healthy.",
      },
    ],
    revisionSummary:
      "Master collocations ('serve guests', 'aromatic flavour', 'organic produce') alongside British spellings 'flavour' and 'fibre'.",
    completionCriteria: "Score >= 70% and explore the 24-word deck in Vocabulary Academy.",
    minPassPct: 70,
    xpReward: 25,
  },
  {
    id: "cur-a2-reading-inference",
    levelId: "A2",
    cefrLabel: "A2",
    unitNumber: 2,
    unitTitle: "Unit 2 · Active Reading & Inference",
    title: "Distinguishing Stated Facts from Implied Meaning",
    titleAr: "التمييز بين الحقائق الصريحة والاستنتاج الضمني في القراءة",
    regionId: "reading-library",
    skillFocus: "reading",
    estimatedMinutes: 10,
    objective:
      "Identify main ideas, find supporting evidence, and infer unstated motives using text clues.",
    intro:
      "Strong readers don't only read what sits on the surface—they connect clues across sentences to understand why characters act or what an author implies.",
    explanation: [
      "Explicit detail = directly stated in the passage (names, numbers, dates).",
      "Inference = logical conclusion built by combining text clues + common sense.",
      "Vocabulary in context = look at neighboring contrast words ('unlike', 'however') or examples ('such as') before reaching for a dictionary.",
    ],
    examples: [
      {
        en: "Tariq set his alarm for 5:30 AM and packed his debate notes twice before going to sleep.",
        ar: "ضبط طارق منبهه على الخامسة والنصف صباحاً ورتب أوراق المناظرة مرتين قبل النوم.",
        highlight: "packed twice + early alarm",
        note: "Inference: Even though the text doesn't say 'Tariq was excited/careful', checking twice proves how seriously he prepared.",
      },
    ],
    arabicBridge:
      "سؤال الاستنتاج (Inference) لا يُجيب عنه النص بكلمة مباشرة، بل يطلب منك ربط القرائن داخل الفقرة للوصول إلى النتيجة المنطقية دون تخمين بعيد عن النص.",
    guidedPractice: {
      id: "cur-a2-read-gp",
      kind: "mcq",
      prompt:
        "Read: 'Although the desert wind rattled the windows, Grandma kept simmering saffron pudding calmly for the whole street.' What can we infer about Grandma?",
      options: [
        "She felt nervous about cooking.",
        "She forgot about the storm outside.",
        "She was generous and experienced at hosting.",
        "She disliked saffron pudding.",
      ],
      correctIndex: 2,
      hint: "Notice 'calmly' and 'for the whole street'.",
      explanation:
        "Cooking calmly for neighbors despite stormy weather implies hospitality, composure, and generosity.",
    },
    exercises: [
      {
        id: "cur-a2-ri-1",
        kind: "mcq",
        prompt:
          "Read: 'Unlike plastic wrappers that linger for decades, banana leaves decompose cleanly into garden soil.' What does 'decompose' most likely mean?",
        options: ["Stay hard forever", "Break down naturally", "Turn into metal", "Smell strongly"],
        correctIndex: 1,
        hint: "Use the contrast cue 'Unlike plastic wrappers that linger for decades'.",
        explanation:
          "'Unlike' signals contrast: plastic lingers, so banana leaves break down quickly.",
      },
      {
        id: "cur-a2-ri-2",
        kind: "true_false",
        prompt:
          "True or False: Guessing something completely unsupported by the passage counts as valid inference.",
        options: ["True", "False"],
        correctIndex: 1,
        hint: "Inference always requires concrete clues inside the text.",
        explanation: "False! Valid inference must be anchored in evidence in the text.",
      },
      {
        id: "cur-a2-ri-3",
        kind: "fill_blank",
        prompt:
          "Which contrast signal word in 'Heavy rain fell; ___, the outdoor robotics showcase was moved indoors' connects cause and shift?",
        acceptedAnswers: ["however", "therefore", "consequently"],
        hint: "Think of 'therefore' or 'consequently' (result).",
        explanation:
          "'therefore' / 'consequently' cleanly links the cause (rain) to the result (moving indoors).",
      },
    ],
    revisionSummary:
      "Separate stated facts from evidence-backed inferences, and use signal words (unlike, however, therefore) to decode unknown vocabulary.",
    completionCriteria: "Score >= 70% on reading inference checks.",
    minPassPct: 70,
    xpReward: 25,
  },
  {
    id: "cur-a2-everyday-roleplay",
    levelId: "A2",
    cefrLabel: "A2",
    unitNumber: 3,
    unitTitle: "Unit 3 · Speaking in Real Situations",
    title: "Polite Requests, Clarifying & Extending Answers",
    titleAr: "الطلبات المهذبة وتوضيح المعنى وتطوير الإجابات في المحادثة",
    regionId: "speaking-city",
    skillFocus: "speaking",
    estimatedMinutes: 8,
    objective:
      "Replace one-word replies with polite, complete conversational turns using modals like 'Could you...' and 'I'd like...'.",
    intro:
      "In real conversations, politeness and follow-up details turn awkward silence into natural dialogue.",
    explanation: [
      "Upgrade direct imperatives ('Give me water') to polite requests ('Could I have a glass of water, please?' / 'Would you mind...?').",
      "Use conversation extenders so you never stop after 'Yes/No': Answer + Reason + Example.",
      "If you didn't hear clearly, say politely: 'Could you repeat that a bit more slowly, please?'",
    ],
    examples: [
      {
        en: "Actually, I prefer studying in the morning because my mind feels fresher and the house is quiet.",
        ar: "في الواقع، أفضل الدراسة صباحاً لأن ذهني يكون أكثر صفاءً والمنزل هادئ.",
        highlight: "Prefer ... because + detail",
        note: "Gives a complete 15-word conversational answer instead of just 'Morning.'",
      },
    ],
    arabicBridge:
      "تجنّب الإجابات ذات الكلمة الواحدة مثل Yes أو Maybe. طبّق قاعدة (إجابة + لأن + مثال) لتبدو لغتك طبيعية وطليقة فوراً.",
    guidedPractice: {
      id: "cur-a2-spk-gp",
      kind: "mcq",
      prompt: "Which request to a school librarian is both natural and polite?",
      options: [
        "Bring me the English dictionary now.",
        "Could you help me find the intermediate English dictionary, please?",
        "I want dictionary quickly.",
        "Tell me where dictionary is.",
      ],
      correctIndex: 1,
      hint: "Look for 'Could you... please?'.",
      explanation: "'Could you help me..., please?' balances warmth and clear English etiquette.",
    },
    exercises: [
      {
        id: "cur-a2-sp-1",
        kind: "mcq",
        prompt: "You didn't catch a classmate's instructions. What is the best thing to say?",
        options: [
          "Speak better!",
          "What?",
          "Sorry, could you repeat that a little more slowly, please?",
          "Nothing, forget it.",
        ],
        correctIndex: 2,
        hint: "Choose the respectful clarification strategy.",
        explanation: "Politely asking to repeat slowly keeps communication flowing smoothly.",
      },
      {
        id: "cur-a2-sp-2",
        kind: "fill_blank",
        prompt: "Complete the polite café order: 'I'd ___ a warm mint tea, please.'",
        acceptedAnswers: ["like"],
        hint: "'I would ___...' is softer than 'I want'.",
        explanation:
          "'I'd like...' (I would like) is the standard polite phrase for ordering or requesting.",
      },
      {
        id: "cur-a2-sp-3",
        kind: "true_false",
        prompt:
          "True or False: Giving a reason with 'because' or an example makes speaking scores noticeably stronger.",
        options: ["True", "False"],
        correctIndex: 0,
        hint: "Think about extending your response.",
        explanation: "True! Adding a reason demonstrates grammar control and richer vocabulary.",
      },
    ],
    revisionSummary:
      "Use 'Could you... / I'd like...' for politeness and expand every answer with 'Answer + Reason + Detail'.",
    completionCriteria: "Score >= 70% on speaking strategy checks.",
    minPassPct: 70,
    xpReward: 25,
  },
  {
    id: "cur-a2-paragraph-craft",
    levelId: "A2",
    cefrLabel: "A2",
    unitNumber: 4,
    unitTitle: "Unit 4 · Organized Paragraph Writing",
    title: "Topic Sentences, Supporting Details & Transitions",
    titleAr: "بناء الفقرة المتماسكة: جملة الموضوع والتفاصيل الداعمة والروابط",
    regionId: "writing-academy",
    skillFocus: "writing",
    estimatedMinutes: 10,
    objective:
      "Structure a unified 5–7 sentence paragraph with a clear topic sentence, specific examples, and closing takeaway.",
    intro:
      "Great writing isn't complicated vocabulary—it's organized ideas that guide the reader smoothly from sentence to sentence.",
    explanation: [
      "1. Topic Sentence: States one main idea clearly (e.g., 'Preparing a homemade family meal builds healthy habits and lasting memories.').",
      "2. Supporting Sentences (2–4): Give reasons, facts, or vivid examples connected with transitions ('First,', 'In addition,', 'For example,').",
      "3. Concluding Sentence: Summarizes the point warmly without repeating word-for-word ('As a result, cooking together strengthens both wellness and family bonds.').",
    ],
    examples: [
      {
        en: "First, fresh vegetables provide natural fibre. In addition, cooking at home lets families control salt and oil.",
        ar: "أولاً، توفر الخضروات الطازجة أليافاً طبيعية. بالإضافة إلى ذلك، يتيح الطبخ المنزلي للعائلات التحكم بالملح والزيت.",
        highlight: "First, ... In addition, ...",
        note: "Ordered transitions prevent a paragraph from sounding like random disconnected sentences.",
      },
    ],
    arabicBridge:
      "الفقرة الإنجليزية تدور حول فكرة رئيسية واحدة فقط! لا تضع عشرات الجمل في جملة واحدة مربوطة بـ and فقط—افصل كل فكرة بنقطة واستخدم روابِط مثل However و For example.",
    guidedPractice: {
      id: "cur-a2-para-gp",
      kind: "mcq",
      prompt:
        "Which sentence works best as a strong TOPIC SENTENCE for a paragraph about school libraries?",
      options: [
        "There are 40 wooden chairs inside.",
        "School libraries play a vital role in helping students focus, read deeply, and collaborate.",
        "Yesterday I borrowed a blue book.",
        "Books have many pages.",
      ],
      correctIndex: 1,
      hint: "A topic sentence announces the main claim that the rest of the paragraph will support.",
      explanation: "Option B states a clear main point ready for supporting reasons and examples.",
    },
    exercises: [
      {
        id: "cur-a2-w-1",
        kind: "mcq",
        prompt: "Which transition introduces an illustration or specific proof?",
        options: ["Nevertheless,", "For example,", "In conclusion,", "Meanwhile,"],
        correctIndex: 1,
        hint: "Choose the phrase that signals an instance.",
        explanation: "'For example,' / 'For instance,' explicitly signals supporting evidence.",
      },
      {
        id: "cur-a2-w-2",
        kind: "fill_blank",
        prompt:
          "Complete the closing transition: 'In ___, regular vocabulary review saves hours before final exams.'",
        acceptedAnswers: ["conclusion", "short", "summary"],
        hint: "Common 10-letter noun after 'In...'",
        explanation: "'In conclusion,' / 'In summary,' marks the wrap-up sentence of a paragraph.",
      },
      {
        id: "cur-a2-w-3",
        kind: "true_false",
        prompt:
          "True or False: Writing one long 60-word sentence with only commas and 'and' makes a paragraph easier to read.",
        options: ["True", "False"],
        correctIndex: 1,
        hint: "Run-on sentences confuse readers.",
        explanation:
          "False! Varying clean short and medium sentences with clear periods boosts clarity.",
      },
    ],
    revisionSummary:
      "Follow the Paragraph Burger: Topic Sentence + 2–3 Transition-linked Examples + Concluding Sentence.",
    completionCriteria:
      "Pass the paragraph craft quiz (>= 70%) and practice drafting inside Writing Academy.",
    minPassPct: 70,
    xpReward: 25,
  },
  {
    id: "cur-b1-perfect-vs-past",
    levelId: "B1",
    cefrLabel: "B1",
    unitNumber: 1,
    unitTitle: "Unit 1 · Time & Perspective (B1)",
    title: "Present Perfect vs. Past Simple & Conditionals 1 & 2",
    titleAr: "الفرق بين المضارع التام والماضي البسيط والجمل الشرطية",
    regionId: "grammar-kingdom",
    skillFocus: "grammar",
    estimatedMinutes: 12,
    objective:
      "Distinguish finished past times ('yesterday', 'in 2024') from ongoing/recent impact ('since', 'for', 'already').",
    intro:
      "At B1, you move from simple timelines to expressing how past actions still affect the present moment.",
    explanation: [
      "Past Simple highlights a finished time in the past: 'I visited Dubai last winter.' (Time is finished: 'last winter').",
      "Present Perfect (have/has + V3) links past experience to NOW without naming a finished time: 'I have visited three science museums since September.'",
      "Zero/First Conditional talks about real results ('If you practice daily, your fluency improves'); Second Conditional expresses imaginary scenarios ('If I lived in London, I would visit museums weekly').",
    ],
    examples: [
      {
        en: "Huda has written twelve journal entries since October, and she finished her twelfth one yesterday.",
        ar: "كتبت هدى اثني عشر مقالاً منذ أكتوبر، وأنهت المقال الثاني عشر أمس.",
        highlight: "has written ... since October / finished ... yesterday",
        note: "Both tenses appear together properly: ongoing span ('since') vs finished point ('yesterday').",
      },
    ],
    arabicBridge:
      "عند وجود زمن ماضٍ منتهٍ (yesterday, in 2022, ago) استخدم الماضي البسيط دائماً ولا تستخدم have/has + V3.",
    guidedPractice: {
      id: "cur-b1-pp-gp",
      kind: "mcq",
      prompt: "Select the accurate tense pairing with 'in 2023':",
      options: [
        "Our school has launched its robotics lab in 2023.",
        "Our school launched its robotics lab in 2023.",
        "Our school launches its robotics lab in 2023.",
        "Our school is launching its robotics lab in 2023.",
      ],
      correctIndex: 1,
      hint: "'in 2023' is a completed past date.",
      explanation: "Finished past dates take Past Simple ('launched'), never Present Perfect.",
    },
    exercises: [
      {
        id: "cur-b1-g-1",
        kind: "fill_blank",
        prompt: "Complete accurately: 'We have lived in Salmiya ___ six years.' (for / since)",
        acceptedAnswers: ["for"],
        hint: "'six years' is a duration/length of time, not a starting date.",
        explanation:
          "Use 'for' + duration ('for six years'); use 'since' + starting point ('since 2020').",
      },
      {
        id: "cur-b1-g-2",
        kind: "mcq",
        prompt: "Which First Conditional sentence expresses a realistic plan?",
        options: [
          "If I finish revision early, I would join the study circle.",
          "If I finish revision early, I will join the study circle.",
          "If I finished revision early, I will join the study circle.",
          "If I will finish revision early, I join the study circle.",
        ],
        correctIndex: 1,
        hint: "1st Conditional = If + Present Simple, will + base verb.",
        explanation: "'If + present simple, will + base' expresses real likely future outcomes.",
      },
      {
        id: "cur-b1-g-3",
        kind: "sentence_fix",
        prompt:
          "Replace the mistaken verb: 'Have you ever ate fresh figs?' (Type the correct past participle)",
        acceptedAnswers: ["eaten"],
        hint: "V3 of eat is eat -> ate -> ___.",
        explanation:
          "Present Perfect uses the V3 past participle 'eaten' ('Have you ever eaten...').",
      },
    ],
    revisionSummary:
      "Finished time marker -> Past Simple; duration/life impact ('for/since/yet') -> Present Perfect.",
    completionCriteria: "Score >= 70% on B1 tense & conditional drills.",
    minPassPct: 70,
    xpReward: 30,
  },
  {
    id: "cur-b1-podcast-details",
    levelId: "B1",
    cefrLabel: "B1",
    unitNumber: 2,
    unitTitle: "Unit 2 · Academic Listening & Note-Taking",
    title: "Following Speaker Attitude, Signposts & Cause-Effect",
    titleAr: "تتبع نبرة المتحدث وإشارات الانتقال والسبب والنتيجة في الاستماع",
    regionId: "listening-forest",
    skillFocus: "listening",
    estimatedMinutes: 10,
    objective:
      "Recognize signpost phrases ('On the other hand', 'To clarify') to capture structured notes from podcasts and talks.",
    intro:
      "Speakers leave verbal road signs showing when they are shifting topics, contrasting ideas, or giving the key reason.",
    explanation: [
      "Contrast markers ('Whereas', 'On the contrary', 'Yet') warn that the next point disagrees with the previous one.",
      "Emphasis cues ('Crucially', 'The key takeaway is') spotlight main exam-worthy points.",
      "Listen for tone—does a speaker sound skeptical, enthusiastic, or cautious?",
    ],
    examples: [
      {
        en: "Solar rooftops save electricity; however, regular dust cleaning is crucial in desert climates to preserve output.",
        ar: "توفر الألواح الشمسية الكهرباء؛ غير أن تنظيف الغبار بانتظام ضروري في المناخات الصحراوية للحفاظ على الإنتاجية.",
        highlight: "however ... crucial",
        note: "Signpost 'however' prepares your notes for an important practical limitation.",
      },
    ],
    arabicBridge:
      "استمع بعناية لعبارات الإشارة الصوتية (Signposts) مثل: The turning point was / Yet / Crucially؛ فهي تدل على الفكرة الجوهرية في المحاضرة.",
    guidedPractice: {
      id: "cur-b1-pod-gp",
      kind: "mcq",
      prompt:
        "If a lecturer says, 'First, let's examine desalination costs; more importantly, let's weigh energy sources,' what comes next?",
      options: [
        "An unrelated joke",
        "A transition to the main priority: energy sources",
        "The end of the lecture",
        "A list of student names",
      ],
      correctIndex: 1,
      hint: "Pay attention to 'more importantly'.",
      explanation: "'more importantly' prioritizes the upcoming subtopic for your notes.",
    },
    exercises: [
      {
        id: "cur-b1-pd-1",
        kind: "mcq",
        prompt: "Which phrase signals a contrasting argument in a discussion?",
        options: ["Furthermore,", "On the other hand,", "For instance,", "Consequently,"],
        correctIndex: 1,
        hint: "Think about comparing two opposite sides.",
        explanation:
          "'On the other hand,' explicitly introduces an opposing or balancing viewpoint.",
      },
      {
        id: "cur-b1-pd-2",
        kind: "fill_blank",
        prompt:
          "What single word starting with 'c' signals an effect or outcome ('___, output dropped by 20%')?",
        acceptedAnswers: ["consequently"],
        hint: "Synonyms: therefore / as a result.",
        explanation: "'Consequently,' connects a preceding cause to its measurable result.",
      },
      {
        id: "cur-b1-pd-3",
        kind: "true_false",
        prompt:
          "True or False: Effective lecture notes record every single word rather than keywords and arrows.",
        options: ["True", "False"],
        correctIndex: 1,
        hint: "Fast verbatim copying prevents comprehension.",
        explanation: "False! Capture structured keywords, relationships (→, vs), and examples.",
      },
    ],
    revisionSummary:
      "Track verbal road signs (However, Crucial, Consequently) to anticipate structure instead of writing verbatim transcripts.",
    completionCriteria: "Score >= 70% on B1 listening strategy drills.",
    minPassPct: 70,
    xpReward: 30,
  },
  {
    id: "cur-b2-science-synthesis",
    levelId: "B2",
    cefrLabel: "B2",
    unitNumber: 1,
    unitTitle: "Unit 1 · Academic Reading & Passive Synthesis",
    title: "Evaluating Evidence, Passive Voice & Author Claims",
    titleAr: "تقييم الأدلة وصيغة المبني للمجهول في القراءة الأكاديمية",
    regionId: "reading-library",
    skillFocus: "reading",
    estimatedMinutes: 12,
    objective:
      "Read multi-paragraph scientific/social articles critically, distinguish claims from data, and interpret academic passive structures.",
    intro:
      "B2 academic English focuses on objectivity: emphasizing experiments, findings, and logical limits rather than personal bias.",
    explanation: [
      "Academic texts use the Passive Voice ('Solar mirrors were aligned...') because the process matters more than who performed it.",
      "Hedging words ('suggests', 'appears to indicate', 'preliminary data') show cautious scientific accuracy—never confuse 'suggests' with '100% proves'.",
      "Compare two viewpoints fairly before deciding which argument is supported by stronger evidence.",
    ],
    examples: [
      {
        en: "While battery recycling rates have doubled, preliminary trials suggest thermal storage remains costly at scale.",
        ar: "بينما تضاعفت معدلات تدوير البطاريات، تشير التجارب الأولية إلى أن التخزين الحراري لا يزال مكلفاً على نطاق واسع.",
        highlight: "preliminary trials suggest",
        note: "Cautious scientific phrasing signals tentative—not final—conclusions.",
      },
    ],
    arabicBridge:
      "تستخدم الأوراق العلمية لغة التحفظ الأكاديمي (Hedging) مثل suggests / may indicate بدلاً من التعميم المطلق؛ انتبه لهذه الفروق الدقيقة في أسئلة الفهم.",
    guidedPractice: {
      id: "cur-b2-sci-gp",
      kind: "mcq",
      prompt:
        "If an article states 'Early samples indicate a possible link,' which summary is most accurate?",
      options: [
        "Scientists definitively proved the cause forever.",
        "There is tentative early evidence worth testing further.",
        "The study found zero link.",
        "Research has been cancelled permanently.",
      ],
      correctIndex: 1,
      hint: "Look closely at 'Early samples indicate' and 'possible'.",
      explanation: "Hedging terms emphasize cautious preliminary evidence rather than final proof.",
    },
    exercises: [
      {
        id: "cur-b2-s-1",
        kind: "mcq",
        prompt:
          "Rewrite actively-focused lab text into objective Passive Voice: 'Engineers tested the turbine.' ->",
        options: [
          "The turbine tested engineers.",
          "The turbine was tested by engineers.",
          "The turbine is testing.",
          "Engineers were testing by turbine.",
        ],
        correctIndex: 1,
        hint: "Past Passive = was/were + past participle (V3).",
        explanation: "'was tested' places focus neutrally on the apparatus rather than the person.",
      },
      {
        id: "cur-b2-s-2",
        kind: "fill_blank",
        prompt:
          "Complete the formal passive report: 'Freshwater samples are ___ (collect) every Monday.'",
        acceptedAnswers: ["collected"],
        hint: "Past participle of collect.",
        explanation: "Present Simple Passive = am/is/are + past participle ('collected').",
      },
      {
        id: "cur-b2-s-3",
        kind: "true_false",
        prompt:
          "True or False: In academic writing, replacing 'proved beyond doubt' with 'evidence strongly suggests' shows nuanced B2 mastery.",
        options: ["True", "False"],
        correctIndex: 0,
        hint: "Scientific credibility rewards calibrated claims.",
        explanation: "True! Calibrated academic tone reflects real scholarly rigor.",
      },
    ],
    revisionSummary:
      "Decode Passive Voice objectively and notice hedging qualifiers ('suggests', 'preliminary') when summarizing academic findings.",
    completionCriteria: "Score >= 75% on B2 academic reading items.",
    minPassPct: 75,
    xpReward: 35,
  },
  {
    id: "cur-b2-argument-essay",
    levelId: "B2",
    cefrLabel: "B2",
    unitNumber: 2,
    unitTitle: "Unit 2 · Persuasive & Analytical Writing",
    title: "Balanced Essays: Thesis, Counterargument & Concession",
    titleAr: "كتابة المقال الحجاجي: الأطروحة والرأي المخالف والرد المقنع",
    regionId: "writing-academy",
    skillFocus: "writing",
    estimatedMinutes: 12,
    objective:
      "Craft persuasive B2 paragraphs that state a thesis, acknowledge an opposing point fairly with 'Although / While', and rebut with evidence.",
    intro:
      "An exceptional essay never ignores the other side—acknowledging a valid concern and answering it makes your argument twice as convincing.",
    explanation: [
      "State a clear thesis position early rather than sitting passively in the middle.",
      "Use concession structures ('Admittedly, ...', 'While critics argue that..., evidence shows...') to introduce counterpoints professionally.",
      "Avoid vague words like 'good/bad/things'—choose concrete verbs and precise nouns ('accelerate', 'urban greenery', 'sustained focus').",
    ],
    examples: [
      {
        en: "Although digital tablets streamline textbook weight, handwritten summary notes still deepen long-term conceptual recall.",
        ar: "رغم أن الأجهزة اللوحية تخفف وزن الحقائب، تظل الملخصات المكتوبة يدوياً تعزز الاستيعاب طويل المدى.",
        highlight: "Although ..., ... still ...",
        note: "Grants a fair benefit to tablets before advancing the stronger main claim.",
      },
    ],
    arabicBridge:
      "الاعتراف الذكي برأي الخصم باستخدام Although / Admittedly ثم الرد عليه بدليل يرفع تقييم كتابتك فوراً من مستوى A2/B1 إلى مستوى B2 الاحترافي.",
    guidedPractice: {
      id: "cur-b2-arg-gp",
      kind: "mcq",
      prompt: "Which opening sentence demonstrates balanced B2 concession?",
      options: [
        "Homework is bad and nobody likes it.",
        "I think homework is okay maybe.",
        "While excessive homework can cause fatigue, brief targeted practice reinforces classroom problem-solving.",
        "Homework has paper.",
      ],
      correctIndex: 2,
      hint: "Look for 'While [concession], [nuanced thesis]'.",
      explanation:
        "Option C concedes a real risk ('fatigue') while defending structured purposeful practice.",
    },
    exercises: [
      {
        id: "cur-b2-w-1",
        kind: "fill_blank",
        prompt:
          "Complete the formal concession word: '___, remote learning widens flexibility; nevertheless, in-person labs remain irreplaceable.'",
        acceptedAnswers: ["admittedly"],
        hint: "Adv. related to 'admit', 10 letters.",
        explanation:
          "'Admittedly,' gracefully concedes a fair point before countering with 'nevertheless'.",
      },
      {
        id: "cur-b2-w-2",
        kind: "mcq",
        prompt:
          "Which phrase is stronger and more formal than 'lots of good things' in a B2 essay?",
        options: ["nice stuff", "tangible long-term benefits", "cool things", "some good parts"],
        correctIndex: 1,
        hint: "Choose formal, specific noun phrasing.",
        explanation: "'tangible long-term benefits' delivers academic precision.",
      },
      {
        id: "cur-b2-w-3",
        kind: "true_false",
        prompt: "True or False: Addressing a counterargument weakens your thesis statement.",
        options: ["True", "False"],
        correctIndex: 1,
        hint: "Balanced evaluation proves critical thinking.",
        explanation: "False! Thoughtful concession proves fairness and strengthens persuasion.",
      },
    ],
    revisionSummary:
      "Pair clear thesis claims with concession markers ('While...', 'Admittedly...') and replace vague words with precise academic terms.",
    completionCriteria: "Score >= 75% and submit a structured B2 essay inside Writing Academy.",
    minPassPct: 75,
    xpReward: 35,
  },
  {
    id: "cur-c1-diplomatic-dialogue",
    levelId: "C1_C2",
    cefrLabel: "C1",
    unitNumber: 1,
    unitTitle: "Unit 1 · Diplomatic Speaking & Nuanced Leadership",
    title: "Tactful Disagreement, Register Shifting & Summarizing",
    titleAr: "الاختلاف اللبق وتعديل نبرة الخطاب والتلخيص في النقاشات",
    regionId: "communication-harbor",
    skillFocus: "speaking",
    estimatedMinutes: 10,
    objective:
      "Lead academic discussions or Model UN debates using diplomatic disagreement, consensus framing, and precise register.",
    intro:
      "At C1–C2, communication isn't merely accurate—it builds trust across disagreement in scholarly, community, and leadership settings.",
    explanation: [
      "Replace blunt rejection ('You're wrong') with diplomatic framing: 'I appreciate your perspective on cost; however, could we also examine long-term scalability?'",
      "Synthesize two teammates' views aloud: 'If I understand both points correctly, we agree on quality while differing on timeline.'",
      "Adjust register smoothly between casual warmth with peers and crisp formality with panels or interviewers.",
    ],
    examples: [
      {
        en: "That raises a compelling point regarding budget; might I suggest piloting the programme in two classrooms first?",
        ar: "يثير هذا نقطة وجيهة بشأن الميزانية؛ هل لي أن أقترح تجربة البرنامج في فصلين دراسيين أولاً؟",
        highlight: "That raises a compelling point ... might I suggest",
        note: "Validates the listener while pivoting constructively toward a testable solution.",
      },
    ],
    arabicBridge:
      "في النقاشات الأكاديمية والمناظرات (مثل محاكاة الأمم المتحدة)، استخدم عبارات مثل 'I take your point, yet...' لاحترام الطرف الآخر قبل طرح رؤيتك.",
    guidedPractice: {
      id: "cur-c1-dip-gp",
      kind: "mcq",
      prompt: "Which response disagrees diplomatically during a student committee debate?",
      options: [
        "That proposal makes zero sense.",
        "Why would anyone vote for that?",
        "I see why rapid rollout is appealing, though a phased pilot could reduce early bottlenecks.",
        "Forget that idea completely.",
      ],
      correctIndex: 2,
      hint: "Look for acknowledgment + constructive alternative.",
      explanation:
        "Recognizing appeal before proposing a safeguard keeps collaboration constructive.",
    },
    exercises: [
      {
        id: "cur-c1-d-1",
        kind: "fill_blank",
        prompt:
          "Complete politely: 'I appreciate your concern; ___, recent pilot data points in another direction.' (formal contrast)",
        acceptedAnswers: ["nonetheless", "nevertheless", "however"],
        hint: "Formal single-word contrast connector.",
        explanation:
          "'however' / 'nevertheless' / 'nonetheless' smoothly bridges agreement and divergence.",
      },
      {
        id: "cur-c1-d-2",
        kind: "mcq",
        prompt: "What does 'register shifting' mean in advanced English communication?",
        options: [
          "Changing font size in an essay",
          "Adapting tone, vocabulary, and formality to match audience and setting",
          "Translating word for word",
          "Speaking twice as fast",
        ],
        correctIndex: 1,
        hint: "Think casual chat vs scholarship interview.",
        explanation: "Register mastery calibrates tone to audience, purpose, and social context.",
      },
      {
        id: "cur-c1-d-3",
        kind: "true_false",
        prompt:
          "True or False: Summarizing another speaker's point accurately before responding demonstrates active C1–C2 listening and leadership.",
        options: ["True", "False"],
        correctIndex: 0,
        hint: "Think about academic seminar norms.",
        explanation:
          "True! Paraphrasing shows precision, empathy, and command of complex dialogue.",
      },
    ],
    revisionSummary:
      "Validate first, paraphrase clearly, and propose constructive solutions using formal diplomatic framing.",
    completionCriteria: "Score >= 75% on C1 Communication Harbor scenarios.",
    minPassPct: 75,
    xpReward: 40,
  },
  {
    id: "cur-c1-inversion-nuance",
    levelId: "C1_C2",
    cefrLabel: "C1",
    unitNumber: 2,
    unitTitle: "Unit 2 · High-Precision Grammar & Rhetoric",
    title: "Negative Inversion, Cleft Emphasis & Mixed Conditionals",
    titleAr: "التقديم والتأخير التوكيدي والجمل الشرطية المختلطة (C1–C2)",
    regionId: "english-challenge-arena",
    skillFocus: "grammar",
    estimatedMinutes: 12,
    objective:
      "Deploy negative inversion ('Not only did...', 'Seldom have...'), cleft sentences, and mixed conditionals for persuasive precision.",
    intro:
      "C1–C2 grammar transforms plain statements into memorable emphasis used in scholarship essays, editorials, and keynote speeches.",
    explanation: [
      "When a negative or restrictive adverb opens a sentence ('Not only', 'Never', 'Seldom', 'Only after'), invert auxiliary + subject: 'Not only did she master the lexicon, but she also mentored peers.'",
      "Use Cleft Sentences ('It was curiosity that sparked...', 'What matters most is consistency') to spotlight essential ideas.",
      "Mixed Conditionals link a past cause to a present outcome: 'If they had preserved those wetlands earlier (past), coastal biodiversity would be richer today (now).'",
    ],
    examples: [
      {
        en: "Seldom have young researchers collaborated across so many disciplines at once.",
        ar: "قلّما تعاون باحثون شباب عبر هذا العدد من التخصصات في آنٍ واحد.",
        highlight: "Seldom have young researchers collaborated",
        note: "'Seldom' at the front triggers auxiliary inversion ('have young researchers').",
      },
    ],
    arabicBridge:
      "يشبه أسلوب التوكيد بـ Not only did... أسلوب التقديم والتأخير البلاغي في العربية لإبراز المعنى؛ تذكر وضع الفعل المساعد قبل الفاعل فوراً بعد الكلمة الافتتاحية.",
    guidedPractice: {
      id: "cur-c1-inv-gp",
      kind: "mcq",
      prompt: "Which sentence uses Negative Inversion accurately?",
      options: [
        "Not only she completed the reading, she wrote a summary.",
        "Not only did she complete the reading, but she also drafted a synthesis.",
        "Not only completed she the reading, she wrote a summary.",
        "Not only did she completed the reading, but also wrote.",
      ],
      correctIndex: 1,
      hint: "After 'Not only', invert 'did' + subject + base verb.",
      explanation: "'Not only did she complete...' obeys strict auxiliary inversion + base verb.",
    },
    exercises: [
      {
        id: "cur-c1-i-1",
        kind: "fill_blank",
        prompt:
          "Complete the inverted opening: 'Never ___ (have / had) students seen such a clear interactive map.' (present perfect plural)",
        acceptedAnswers: ["have"],
        hint: "Plural subject 'students' in Present Perfect.",
        explanation: "'Never have students seen...' places 'have' before 'students'.",
      },
      {
        id: "cur-c1-i-2",
        kind: "mcq",
        prompt: "Which is a Mixed Conditional (past condition -> present consequence)?",
        options: [
          "If I studied harder, I would pass yesterday.",
          "If we had planted shade trees twenty years ago, this courtyard would be cooler today.",
          "If it rains tomorrow, we stay inside.",
          "If you heat water, it boils.",
        ],
        correctIndex: 1,
        hint: "'had planted' (past) + 'would be cooler today' (present).",
        explanation: "Mixes 3rd conditional condition with 2nd conditional present outcome.",
      },
      {
        id: "cur-c1-i-3",
        kind: "sentence_fix",
        prompt:
          "Fix the verb after 'did' in: 'Rarely did the committee disagreed on safety.' (Type the corrected word)",
        acceptedAnswers: ["disagree"],
        hint: "After auxiliary 'did', always use base form.",
        explanation:
          "'Rarely did the committee disagree...' uses base verb 'disagree' after 'did'.",
      },
    ],
    revisionSummary:
      "Fronted negative adverbs invert Aux + Subject + Base/Participle; mixed conditionals connect past decisions to present reality.",
    completionCriteria: "Score >= 75% in the Challenge Arena grammar round.",
    minPassPct: 75,
    xpReward: 40,
  },
  {
    id: "cur-c2-critical-synthesis",
    levelId: "C1_C2",
    cefrLabel: "C1–C2",
    unitNumber: 3,
    unitTitle: "Unit 3 · Mastery Castle Capstone",
    title: "Concise Academic Paraphrase, Precision & Rhetorical Synthesis",
    titleAr: "إعادة الصياغة الأكاديمية الدقيقة والتركيب النقدي (قلعة الإتقان)",
    regionId: "mastery-castle",
    skillFocus: "writing",
    estimatedMinutes: 12,
    objective:
      "Compress wordy prose into crisp, authoritative C1–C2 academic English without losing nuance or distorting sources.",
    intro:
      "True mastery isn't using ten rare words where three exact ones shine—it is clarity, compression, and intellectual integrity.",
    explanation: [
      "Eliminate filler padding ('due to the fact that' -> 'because'; 'in order to be able to' -> 'to').",
      "Preserve exact source intent during paraphrasing: don't replace careful statistics ('roughly a third') with exaggerations ('almost everyone').",
      "Use strong nominalizations sparingly paired with vivid active verbs so prose stays energetic.",
    ],
    examples: [
      {
        en: "Wordy: 'Due to the fact that water scarcity is increasing, conservation is needed.' -> Crisp C2: 'Accelerating water scarcity demands disciplined conservation.'",
        ar: "مختصر رشيق بدلاً من الحشو الزائد مع الحفاظ على كامل المعنى الدقيق.",
        highlight: "demands disciplined conservation",
        note: "Cuts 13 words to 7 while raising authority and readability.",
      },
    ],
    arabicBridge:
      "الإتقان الأكاديمي الحقيقي يقوم على الإيجاز المحكم (Concision) والأمانة العلمية في النقل، لا على إطالة الجمل بلا مبرر.",
    guidedPractice: {
      id: "cur-c2-syn-gp",
      kind: "mcq",
      prompt: "Which revision preserves full accuracy while cutting unnecessary wordiness?",
      options: [
        "At this current point in time, we are looking into trying to figure out clean solar storage.",
        "Researchers are currently investigating scalable solar storage.",
        "Solar batteries fix every energy problem immediately.",
        "People like clean sun power.",
      ],
      correctIndex: 1,
      hint: "Look for concise, accurate academic phrasing.",
      explanation: "Option B communicates the exact research status cleanly in 7 words.",
    },
    exercises: [
      {
        id: "cur-c2-s-1",
        kind: "fill_blank",
        prompt: "Replace the 5-word filler 'due to the fact that' with one clean conjunction: ___",
        acceptedAnswers: ["because", "since"],
        hint: "7-letter word introducing a cause.",
        explanation: "'because' communicates the causal link crisply without filler words.",
      },
      {
        id: "cur-c2-s-2",
        kind: "mcq",
        prompt:
          "If a report states '34% of surveyed schools piloted solar shading,' which paraphrase stays faithful?",
        options: [
          "Almost every school uses solar shading.",
          "Roughly one-third of participating schools trialled solar shading.",
          "Half of national schools rejected solar shading.",
          "No schools tested solar shading.",
        ],
        correctIndex: 1,
        hint: "34% ≈ roughly one-third.",
        explanation:
          "'Roughly one-third of participating schools trialled...' preserves both proportion and scope.",
      },
      {
        id: "cur-c2-s-3",
        kind: "true_false",
        prompt:
          "True or False: C1–C2 mastery prioritizes authentic precision and clear synthesis over stuffing obscure synonyms.",
        options: ["True", "False"],
        correctIndex: 0,
        hint: "Think about clarity and precision.",
        explanation:
          "True! Top writers prioritize accuracy, rhythm, and clarity above ornamental jargon.",
      },
    ],
    revisionSummary:
      "Cut filler phrases, match source proportions faithfully, and write concise high-impact academic syntheses.",
    completionCriteria: "Score >= 75% to claim Mastery Castle completion progress.",
    minPassPct: 75,
    xpReward: 50,
  },
];

export const LEVEL_MASTERY_EXAMS: LevelMasteryExam[] = [
  {
    id: "exam-foundation-a1",
    levelId: "foundation",
    title: "Foundation & A1 Gate Assessment",
    titleAr: "تقييم اجتياز المرحلة التأسيسية و A1",
    description:
      "Tests greetings, a/an, Present Simple agreement, minimal pairs, and short reading comprehension.",
    passingPct: 70,
    certificateId: "cert-en-foundation",
    certificateTitle: "NEXORA English Foundation Explorer Certificate",
    questions: [
      {
        id: "ex-f-1",
        skill: "grammar",
        prompt: "Complete: 'My sister ___ to the science club every Tuesday.'",
        options: ["go", "goes", "going", "gone"],
        correctIndex: 1,
        explanation: "Third-person singular subject ('My sister') takes '-es': 'goes'.",
      },
      {
        id: "ex-f-2",
        skill: "vocabulary",
        prompt: "Choose the right article: 'Tariq packed ___ apple and a water bottle.'",
        options: ["a", "an", "two", "are"],
        correctIndex: 1,
        explanation: "'apple' begins with a vowel sound -> 'an apple'.",
      },
      {
        id: "ex-f-3",
        skill: "reading",
        passage:
          "Amna opens her notebook at 4:00 PM. First, she reads five English words aloud. Then she writes two short sentences.",
        prompt: "What does Amna do right after reading five English words aloud?",
        options: [
          "She closes her notebook.",
          "She writes two short sentences.",
          "She watches television.",
          "She sleeps.",
        ],
        correctIndex: 1,
        explanation: "The passage states: 'Then she writes two short sentences.'",
      },
      {
        id: "ex-f-4",
        skill: "pronunciation",
        prompt: "Which word starts with the voiceless aspirated sound /p/?",
        options: ["bag", "pen", "box", "bus"],
        correctIndex: 1,
        explanation: "'pen' starts with voiceless /p/.",
      },
      {
        id: "ex-f-5",
        skill: "speaking",
        prompt: "What is the politest reply when meeting a guest teacher?",
        options: ["Go away.", "Good morning, nice to meet you!", "Give me book.", "Me student."],
        correctIndex: 1,
        explanation: "'Good morning, nice to meet you!' is warm and polite.",
      },
    ],
  },
  {
    id: "exam-a2-intermediate",
    levelId: "A2",
    title: "A2 & Grade 9 Heritage Mastery Assessment",
    titleAr: "تقييم إتقان المستوى A2 ومفردات الصف التاسع",
    description:
      "Combines Grade 9 Unit 3 British vocabulary, reading inference, past narration, and paragraph structure.",
    passingPct: 75,
    certificateId: "cert-en-a2",
    certificateTitle: "NEXORA English A2 Navigator Certificate",
    questions: [
      {
        id: "ex-a2-1",
        skill: "vocabulary",
        prompt:
          "Which British-spelled word names the natural roughage found in oats and leafy greens?",
        options: ["flavour", "fibre", "symbol", "recipe"],
        correctIndex: 1,
        explanation: "'fibre' is the British spelling for dietary roughage.",
      },
      {
        id: "ex-a2-2",
        skill: "grammar",
        prompt: "Choose the accurate Past Simple sentence:",
        options: [
          "We visit the heritage souq yesterday.",
          "We visited the heritage souq yesterday.",
          "We was visit the heritage souq yesterday.",
          "We visiting the heritage souq yesterday.",
        ],
        correctIndex: 1,
        explanation: "'yesterday' requires Past Simple ('visited').",
      },
      {
        id: "ex-a2-3",
        skill: "reading",
        passage:
          "Because the local market ran out of imported berries, Chef Noura created a crisp salad using figs, mint, and toasted almonds grown nearby.",
        prompt: "What can we infer about Chef Noura?",
        options: [
          "She cancelled dinner when berries ran out.",
          "She adapts creatively using fresh local ingredients.",
          "She only cooks frozen food.",
          "She dislikes mint and almonds.",
        ],
        correctIndex: 1,
        explanation: "Substituting local figs and mint shows culinary adaptability.",
      },
      {
        id: "ex-a2-4",
        skill: "writing",
        prompt: "Which sentence best serves as a closing takeaway for a healthy-habits paragraph?",
        options: [
          "Oranges are orange.",
          "In conclusion, small daily nutrition choices build lasting energy for study.",
          "First, wake up early.",
          "Do not write.",
        ],
        correctIndex: 1,
        explanation: "Includes transition 'In conclusion,' and wraps up the main claim.",
      },
      {
        id: "ex-a2-5",
        skill: "listening",
        prompt:
          "If a coach says 'Training moves from 4:00 to 4:30 due to heat,' when should students arrive?",
        options: ["At 3:00", "By 4:30", "Tomorrow", "Never"],
        correctIndex: 1,
        explanation: "'moves from 4:00 to 4:30' updates the confirmed time to 4:30.",
      },
    ],
  },
  {
    id: "exam-b1-b2-academic",
    levelId: "B1",
    title: "B1–B2 Academic Fluency Assessment",
    titleAr: "تقييم الطلاقة الأكاديمية للمستوى المتوسط والمتقدم (B1–B2)",
    description:
      "Evaluates Present Perfect vs Past, passive academic reading, conditionals, and concession essay arguments.",
    passingPct: 75,
    certificateId: "cert-en-b1",
    certificateTitle: "NEXORA English B1–B2 Academic Achiever Certificate",
    questions: [
      {
        id: "ex-b1-1",
        skill: "grammar",
        prompt: "Select the accurate sentence:",
        options: [
          "I have lived in Kuwait since five years.",
          "I have lived in Kuwait for five years.",
          "I lived in Kuwait since five years.",
          "I am living in Kuwait since 2020.",
        ],
        correctIndex: 1,
        explanation: "'for' pairs with a duration ('five years').",
      },
      {
        id: "ex-b1-2",
        skill: "writing",
        prompt: "Which connector introduces a balanced concession in an essay?",
        options: ["Because of", "Although", "Such as", "Firstly"],
        correctIndex: 1,
        explanation: "'Although' concedes an opposing idea cleanly before your main clause.",
      },
      {
        id: "ex-b1-3",
        skill: "reading",
        passage:
          "Preliminary trials suggest that shaded vertical farms cut evaporation by nearly 60%.",
        prompt: "Why does the author use the phrase 'Preliminary trials suggest'?",
        options: [
          "To show early promising evidence without overclaiming final universal proof",
          "To prove the experiment failed",
          "To hide the numbers",
          "Because 60% means zero",
        ],
        correctIndex: 0,
        explanation: "Scientific hedging matches B1–B2 evidentiary accuracy.",
      },
      {
        id: "ex-b1-4",
        skill: "grammar",
        prompt:
          "Convert into objective scientific Passive Voice: 'Students recorded daily temperatures.'",
        options: [
          "Daily temperatures recorded students.",
          "Daily temperatures were recorded by students.",
          "Daily temperatures are record.",
          "Students was recorded daily temperatures.",
        ],
        correctIndex: 1,
        explanation: "Past passive = 'were recorded'.",
      },
      {
        id: "ex-b1-5",
        skill: "speaking",
        prompt: "How can you keep a two-minute opinion talk clearly structured?",
        options: [
          "Repeat one word ten times",
          "Follow PREP: Point -> Reason -> Example -> Point restated",
          "Stop speaking after two seconds",
          "Read unrelated numbers",
        ],
        correctIndex: 1,
        explanation: "The PREP framework creates clear, memorable spoken structure.",
      },
    ],
  },
  {
    id: "exam-c1c2-mastery",
    levelId: "C1_C2",
    title: "C1–C2 Mastery Castle Capstone Exam",
    titleAr: "الاختبار النهائي لإتقان المستوى المتقدم (C1–C2)",
    description:
      "Capstone exam assessing negative inversion, mixed conditionals, concise paraphrase, and diplomatic rhetoric.",
    passingPct: 80,
    certificateId: "cert-en-c1c2",
    certificateTitle: "NEXORA English C1–C2 Mastery Certificate",
    questions: [
      {
        id: "ex-c1-1",
        skill: "grammar",
        prompt: "Choose the sentence demonstrating flawless Negative Inversion:",
        options: [
          "Not only the lab reduced waste, but it also cut costs.",
          "Not only did the lab reduce waste, but it also cut energy costs.",
          "Not only did the lab reduced waste, but also cut energy costs.",
          "Not only reduced the lab waste, but it cut costs.",
        ],
        correctIndex: 1,
        explanation: "'Not only did + subject + base verb' is required for fronted inversion.",
      },
      {
        id: "ex-c1-2",
        skill: "writing",
        prompt: "Which revision best eliminates academic bloat while staying exact?",
        options: [
          "Due to the fact that rain fell, in order to stay dry we moved indoors.",
          "Because heavy rain arrived, we moved the showcase indoors.",
          "Rain came, stuff got wet, inside now.",
          "The meteorological liquid phenomenon necessitated indoor relocation.",
        ],
        correctIndex: 1,
        explanation: "Option B is vivid, natural, concise, and free of padding or pretentiousness.",
      },
      {
        id: "ex-c1-3",
        skill: "reading",
        passage:
          "While automated summaries save minutes on routine memos, nuanced primary literature still rewards slow, unhurried annotation.",
        prompt: "What is the author's central argument?",
        options: [
          "Automated summaries should replace all reading.",
          "Deep primary texts remain valuable for thoughtful human reading despite fast summaries.",
          "Nobody should write memos.",
          "Primary literature cannot be read.",
        ],
        correctIndex: 1,
        explanation: "Balanced 'While X, Y' structure emphasizes Y as the thesis.",
      },
      {
        id: "ex-c1-4",
        skill: "speaking",
        prompt: "Which reply exemplifies diplomatic C1 committee negotiation?",
        options: [
          "Your point is useless.",
          "I share your urgency on water efficiency; however, a two-school pilot lets us verify maintenance costs before scaling.",
          "Whatever you decide doesn't matter.",
          "No, listen only to me.",
        ],
        correctIndex: 1,
        explanation: "Pairs empathy/shared goal with a pragmatic counterproposal.",
      },
      {
        id: "ex-c1-5",
        skill: "grammar",
        prompt:
          "Complete the Mixed Conditional: 'If earlier planners had protected those mangroves, shoreline erosion ___ milder today.'",
        options: ["is", "would be", "would have been", "will be"],
        correctIndex: 1,
        explanation:
          "Past unrealized condition ('had protected') -> present result ('would be ... today').",
      },
    ],
  },
];

export const DAILY_ENGLISH_MISSIONS: DailyMissionDef[] = [
  {
    id: "mission-lesson",
    title: "Complete 1 Guided Curriculum Lesson",
    titleAr: "أكمل درساً تعليمياً واحداً",
    targetType: "lesson",
    targetCount: 1,
    xpBonus: 15,
    actionLabel: "Open Lessons",
  },
  {
    id: "mission-vocab",
    title: "Practice 5 Vocabulary Words Across Drills",
    titleAr: "تدرّب على 5 مفردات جديدة أو مراجعة",
    targetType: "vocab",
    targetCount: 5,
    xpBonus: 15,
    actionLabel: "Practice Words",
  },
  {
    id: "mission-listening",
    title: "Complete 1 Listening Audio Track",
    titleAr: "أكمل مسار استماع صوتي واحد",
    targetType: "listening",
    targetCount: 1,
    xpBonus: 15,
    actionLabel: "Listen Now",
  },
  {
    id: "mission-writing",
    title: "Draft & Revise 1 Writing Response",
    titleAr: "اكتب وراجع مهمة كتابية واحدة",
    targetType: "writing",
    targetCount: 1,
    xpBonus: 20,
    actionLabel: "Open Writing",
  },
];
