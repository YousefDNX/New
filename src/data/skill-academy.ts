export type EnglishSkillAreaId =
  | "listening"
  | "speaking"
  | "reading"
  | "writing"
  | "vocabulary"
  | "grammar"
  | "pronunciation"
  | "everyday"
  | "academic"
  | "communication";

export type PlacementDimensionId =
  "reading" | "listening" | "grammar_vocab" | "writing" | "communication";

export type CefrBand = "A1" | "A2" | "B1" | "B2" | "C1";

export interface SkillLesson {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  example: string;
  arabicTip: string;
}

export interface SkillDrillQuestion {
  id: string;
  prompt: string;
  audioScript?: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface EnglishSkillArea {
  id: EnglishSkillAreaId;
  title: string;
  titleAr: string;
  dimension: PlacementDimensionId;
  tagline: string;
  cefrRange: string;
  capabilityNote?: string;
  lessons: SkillLesson[];
  drills: SkillDrillQuestion[];
}

export interface PlacementQuestion {
  id: string;
  dimension: PlacementDimensionId;
  skillLabel: string;
  prompt: string;
  audioScript?: string;
  passage?: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface LearningPathStep {
  id: string;
  title: string;
  kind: "lesson" | "practice" | "project" | "checkpoint";
  summary: string;
  prerequisiteIds: string[];
  targetRoute: "/app/study" | "/app/tasks" | "/app/ai" | "/app/future";
  linkedSkillArea?: EnglishSkillAreaId;
  minMasteryScore: number;
  checkQuestion: {
    prompt: string;
    options: [string, string, string, string];
    correctIndex: 0 | 1 | 2 | 3;
    explanation: string;
  };
}

export interface AdaptiveLearningPath {
  id: string;
  title: string;
  titleAr: string;
  domain: "english" | "stem" | "academic" | "future";
  description: string;
  steps: LearningPathStep[];
}

export const PLACEMENT_DIMENSION_META: Record<
  PlacementDimensionId,
  { label: string; labelAr: string; linkedAreas: EnglishSkillAreaId[] }
> = {
  reading: {
    label: "Reading Comprehension",
    labelAr: "الفهم القرائي",
    linkedAreas: ["reading", "academic"],
  },
  listening: {
    label: "Listening Comprehension",
    labelAr: "الاستماع والفهم السماعي",
    linkedAreas: ["listening", "pronunciation"],
  },
  grammar_vocab: {
    label: "Grammar & Vocabulary",
    labelAr: "القواعد والمفردات",
    linkedAreas: ["grammar", "vocabulary"],
  },
  writing: {
    label: "Writing & Structure",
    labelAr: "الكتابة وبناء الفقرة",
    linkedAreas: ["writing", "academic"],
  },
  communication: {
    label: "Speaking & Communication",
    labelAr: "التحدث والتواصل العملي",
    linkedAreas: ["speaking", "everyday", "communication"],
  },
};

export const ENGLISH_SKILL_AREAS: EnglishSkillArea[] = [
  {
    id: "listening",
    title: "Listening",
    titleAr: "الاستماع",
    dimension: "listening",
    tagline: "Catch main ideas, speaker intent, and factual details using audio playback.",
    cefrRange: "A2–C1",
    capabilityNote:
      "Audio playback uses your browser Web Speech synthesizer with full synchronized transcripts for offline reliability.",
    lessons: [
      {
        id: "lst_1",
        title: "Signpost Words in Lectures & Briefings",
        summary:
          "Speakers signal shifts in meaning using words like 'however', 'in contrast', and 'above all'.",
        keyPoints: [
          "Focus on transition markers before taking rapid notes.",
          "Listen for contrast cues ('although', 'despite') — exam questions often test the clause after them.",
          "Summarize each 20-second clip in 5 keywords.",
        ],
        example:
          "'Our prototype reduced energy use by 18%; HOWEVER, battery weight increased slightly.' -> Core takeaway = trade-off between efficiency and weight.",
        arabicTip:
          "انتبه لكلمات التحول مثل however و although لأن الفكرة الرئيسية غالباً تأتي بعدها مباشرة.",
      },
      {
        id: "lst_2",
        title: "Distinguishing Fact from Speaker Opinion",
        summary: "Separate verifiable numbers and dates from tentative claims.",
        keyPoints: [
          "Markers like 'appears to', 'researchers argue', or 'in my view' show interpretation.",
          "Verify dates, units, and comparisons before selecting an answer.",
        ],
        example:
          "'The library opens at 8 AM (fact), which feels too late during exam week (opinion).'",
        arabicTip: "فرّق بين الأرقام والحقائق المؤكدة وبين تعبيرات الرأي مثل In my view.",
      },
    ],
    drills: [
      {
        id: "lst_d1",
        audioScript:
          "Good morning, robotics team. Originally we planned to test the solar rover on Tuesday, but rain is forecast all morning. Therefore, we will assemble the sensors indoors tomorrow and run outdoor field trials on Thursday afternoon.",
        prompt:
          "Listen to the briefing (or read transcript). When will outdoor field trials happen?",
        options: ["Tuesday morning", "Tomorrow morning", "Thursday afternoon", "Friday evening"],
        correctIndex: 2,
        explanation:
          "The speaker changed Tuesday's plan because of rain and moved outdoor trials to Thursday afternoon.",
      },
      {
        id: "lst_d2",
        audioScript:
          "While many students memorize isolated vocabulary lists, studies show that reading words inside realistic sentences boosts recall far more reliably.",
        prompt: "What does the speaker emphasize improves vocabulary recall?",
        options: [
          "Memorizing isolated lists",
          "Reading words in realistic context sentences",
          "Skipping written notes completely",
          "Studying once a month",
        ],
        correctIndex: 1,
        explanation:
          "After 'While...', the main contrast affirms reading words inside realistic sentences.",
      },
    ],
  },
  {
    id: "speaking",
    title: "Speaking",
    titleAr: "التحدث",
    dimension: "communication",
    tagline: "Structure clear spoken answers using PREP (Point, Reason, Example, Point).",
    cefrRange: "A2–B2",
    capabilityNote:
      "Honest Limitation Notice: Browser tools provide Web Speech audio models and guided self-check rubrics; this app does not score raw microphone acoustic fluency.",
    lessons: [
      {
        id: "spk_1",
        title: "The PREP 30-Second Response Structure",
        summary: "Organize answers smoothly under time pressure without freezing.",
        keyPoints: [
          "P — State your clear Point in one sentence.",
          "R — Give one logical Reason ('because' / 'since').",
          "E — Provide one concrete real-life Example.",
          "P — Restate or wrap up your Point cleanly.",
        ],
        example:
          "'Joining a study circle builds consistency (P) because teammates check in weekly (R). For instance, our physics group solved three past papers together before midterms (E). That steady habit keeps everyone accountable (P).'",
        arabicTip:
          "تدرّب على هيكل PREP (الفكرة، السبب، المثال، الخلاصة) لتتجنب التردد أثناء التحدث.",
      },
    ],
    drills: [
      {
        id: "spk_d1",
        prompt: "In a structured spoken answer, what follows 'Point' and 'Reason' in PREP?",
        options: [
          "An unrelated joke",
          "A concrete real-life Example",
          "Repeating the exact question silently",
          "Changing the topic completely",
        ],
        correctIndex: 1,
        explanation: "PREP stands for Point -> Reason -> Example -> Point.",
      },
    ],
  },
  {
    id: "reading",
    title: "Reading",
    titleAr: "القراءة",
    dimension: "reading",
    tagline: "Master skimming, scanning, and inference from academic and everyday texts.",
    cefrRange: "A2–C1",
    lessons: [
      {
        id: "rd_1",
        title: "Skimming vs. Scanning vs. Deep Inference",
        summary: "Match your reading speed to the question goal instead of reading word-by-word.",
        keyPoints: [
          "Skim headings and topic sentences (first sentence of each paragraph) to map structure.",
          "Scan for numbers, proper nouns, and keywords when locating specific evidence.",
          "Infer implied meaning by combining two clues across sentences.",
        ],
        example:
          "'Coastal cities face rising heat; consequently, reflective roofs are shifting from optional to standard building codes.' -> Implies urban heat is driving policy changes.",
        arabicTip:
          "استخدم القراءة السريعة (Skimming) لفهم الفكرة العامة، والمسح (Scanning) للبحث عن تفاصيل محددة.",
      },
    ],
    drills: [
      {
        id: "rd_d1",
        prompt:
          "Passage: 'Though mangrove forests cover less than 1% of tropical coastlines, they absorb four times more carbon per hectare than many inland forests.' What can be inferred?",
        options: [
          "Mangroves cover most of the ocean.",
          "Mangroves have unusually high carbon storage density despite small area.",
          "Inland forests absorb zero carbon.",
          "Coastal mangroves cannot survive in tropics.",
        ],
        correctIndex: 1,
        explanation:
          "Small coverage (<1%) paired with 4x carbon per hectare shows very high storage density.",
      },
    ],
  },
  {
    id: "writing",
    title: "Writing",
    titleAr: "الكتابة",
    dimension: "writing",
    tagline: "Write cohesive topic sentences, logical transitions, and concise paragraphs.",
    cefrRange: "A2–C1",
    lessons: [
      {
        id: "wr_1",
        title: "Cohesion Through Topic Sentences & Transitions",
        summary: "Every strong paragraph opens with one claim and supports it cleanly.",
        keyPoints: [
          "Topic Sentence: Names the subject + controlling idea.",
          "Evidence: Explains how or why with specific facts or examples.",
          "Transitions: Use 'Consequently', 'In contrast', or 'Furthermore' accurately.",
        ],
        example:
          "Weak: 'Water is good for farming and climate.' Strong: 'Drip irrigation preserves scarce freshwater reserves by delivering droplets directly to plant roots.'",
        arabicTip: "ابدأ كل فقرة بجملة رئيسية واضحة (Topic Sentence) ثم ادعمها بمثال أو دليل.",
      },
    ],
    drills: [
      {
        id: "wr_d1",
        prompt: "Which sentence works best as an academic topic sentence?",
        options: [
          "I want to talk about solar panels today.",
          "Solar panels are really cool and nice.",
          "Community solar microgrids lower rural electricity outages while cutting fuel costs.",
          "Sun and electricity happen in many places.",
        ],
        correctIndex: 2,
        explanation:
          "Option C gives a clear, specific subject and controlling argument without casual filler.",
      },
    ],
  },
  {
    id: "vocabulary",
    title: "Vocabulary",
    titleAr: "المفردات",
    dimension: "grammar_vocab",
    tagline: "Build active word families, collocations, and British curriculum precision.",
    cefrRange: "A2–C1",
    lessons: [
      {
        id: "voc_1",
        title: "Learning Word Families & Collocations",
        summary: "Learn a root word along with its verb, noun, adjective, and natural partners.",
        keyPoints: [
          "Pair verbs with natural nouns: 'reach a compromise', 'maintain balance', 'conduct research'.",
          "Notice British vs. American spelling consistency in formal exams (e.g., 'flavour', 'fibre').",
        ],
        example: "maintain (verb) -> maintenance (noun) -> maintainable (adjective).",
        arabicTip: "احفظ الكلمة مع الكلمات التي ترافقها (Collocations) مثل maintain balance.",
      },
    ],
    drills: [
      {
        id: "voc_d1",
        prompt:
          "Choose the natural academic collocation: 'Both sides worked hard to ___ a fair compromise.'",
        options: ["reach", "cook", "carry", "shout"],
        correctIndex: 0,
        explanation: "'Reach a compromise' is the standard English collocation.",
      },
    ],
  },
  {
    id: "grammar",
    title: "Grammar",
    titleAr: "القواعد",
    dimension: "grammar_vocab",
    tagline: "Control tenses, conditionals, subject-verb agreement, and complex clauses.",
    cefrRange: "A2–C1",
    lessons: [
      {
        id: "grm_1",
        title: "Present Perfect vs. Past Simple & Conditionals",
        summary:
          "Match verb tense to whether an action is finished in a closed past time or linked to now.",
        keyPoints: [
          "Past Simple ('studied yesterday'): completed at a specific past time.",
          "Present Perfect ('have studied for three hours'): experience or ongoing effect up to now.",
          "First Conditional ('If we test early, we will spot errors'): real future possibility.",
        ],
        example:
          "'Since Monday, our team has tested five prototypes.' (time period continues up to now).",
        arabicTip: "استخدم المضارع التام عند ارتباط الحدث بالحاضر أو عدم تحديد وقت انتهائه.",
      },
    ],
    drills: [
      {
        id: "grm_d1",
        prompt: "Select the grammatically accurate sentence:",
        options: [
          "Neither the teacher nor the students was late yesterday.",
          "Neither the teacher nor the students were late yesterday.",
          "Neither the teacher nor the students is late yesterday.",
          "Neither the teacher nor the students be late yesterday.",
        ],
        correctIndex: 1,
        explanation:
          "With 'neither...nor', the verb agrees with the closer subject ('the students' -> plural 'were').",
      },
    ],
  },
  {
    id: "pronunciation",
    title: "Pronunciation",
    titleAr: "النطق",
    dimension: "listening",
    tagline: "Master word stress, minimal pairs, and connected speech clarity via audio models.",
    cefrRange: "A2–B2",
    capabilityNote:
      "Honest Limitation Notice: Audio playback demonstrates target stress via Web Speech TTS; microphone acoustic scoring is not claimed without dedicated phonetic evaluation.",
    lessons: [
      {
        id: "prn_1",
        title: "Word Stress Shifts Between Nouns and Verbs",
        summary:
          "Two-syllable English words often stress syllable 1 as nouns and syllable 2 as verbs.",
        keyPoints: [
          "PRE-sent (noun: gift) vs. pre-SENT (verb: to show or give).",
          "RE-cord (noun: stored data) vs. re-CORD (verb: to capture audio/data).",
          "PRO-ject (noun: planned task) vs. pro-JECT (verb: to estimate or display).",
        ],
        example: "'Students will pre-SENT their science PRO-ject on Thursday.'",
        arabicTip: "في الكلمات الثنائية المقطع، يتغير التشديد (Stress) غالباً بين الاسم والفعل.",
      },
    ],
    drills: [
      {
        id: "prn_d1",
        audioScript:
          "We need to record every measurement carefully before submitting our lab record.",
        prompt:
          "In 'We need to record every measurement', where does primary stress fall on 'record' (verb)?",
        options: [
          "First syllable (RE-cord)",
          "Second syllable (re-CORD)",
          "Silent first letter",
          "No stress",
        ],
        correctIndex: 1,
        explanation: "As a verb, 're-CORD' stresses the second syllable.",
      },
    ],
  },
  {
    id: "everyday",
    title: "Everyday English",
    titleAr: "الإنجليزية اليومية",
    dimension: "communication",
    tagline: "Navigate polite requests, clarification, and practical everyday conversations.",
    cefrRange: "A1–B2",
    lessons: [
      {
        id: "ev_1",
        title: "Polite Requests & Active Clarification",
        summary: "Use indirect openings to sound collaborative and natural.",
        keyPoints: [
          "Use 'Could you clarify...' or 'Would you mind repeating...' instead of blunt imperatives.",
          "Confirm shared understanding with 'Just to make sure I followed...'.",
        ],
        example: "'Excuse me, could you let me know which room the workshop starts in?'",
        arabicTip: "استخدم صيغ اللطف مثل Could you أو Would you mind في المحادثات اليومية.",
      },
    ],
    drills: [
      {
        id: "ev_d1",
        prompt: "Which response is most polite when asking a mentor to repeat an explanation?",
        options: [
          "Say that again right now.",
          "What? Speak louder.",
          "Sorry, could you explain that last step one more time?",
          "You talked too fast.",
        ],
        correctIndex: 2,
        explanation:
          "'Sorry, could you explain...' asks politely and clearly identifies what you need.",
      },
    ],
  },
  {
    id: "academic",
    title: "Academic English",
    titleAr: "الإنجليزية الأكاديمية",
    dimension: "reading",
    tagline: "Use formal register, hedging, evidence citation verbs, and objective style.",
    cefrRange: "B1–C1",
    lessons: [
      {
        id: "ac_1",
        title: "Formal Register & Hedging Claims",
        summary: "Academic prose favors precise reporting verbs and measured certainty.",
        keyPoints: [
          "Replace conversational idioms ('a lot of', 'proves 100%') with 'numerous', 'suggests', or 'indicates'.",
          "Use analytical verbs: demonstrate, contrast, evaluate, establish.",
        ],
        example:
          "Informal: 'The graph proves sleep fixes everything.' Academic: 'The data suggests a strong correlation between sleep regularity and recall accuracy.'",
        arabicTip:
          "تجنب المبالغة في اللغة الأكاديمية واستخدم أفعالاً دقيقة مثل indicates و demonstrates.",
      },
    ],
    drills: [
      {
        id: "ac_d1",
        prompt: "Which phrase best fits an academic science report?",
        options: [
          "The numbers totally prove we won.",
          "The measurements indicate a 14% improvement across three trials.",
          "Lots of stuff got way better.",
          "Basically, it worked super well.",
        ],
        correctIndex: 1,
        explanation: "Specific figures paired with 'indicate' reflect objective academic tone.",
      },
    ],
  },
  {
    id: "communication",
    title: "Communication Skills",
    titleAr: "مهارات التواصل",
    dimension: "communication",
    tagline: "Deliver constructive peer feedback, handle disagreement, and collaborate smoothly.",
    cefrRange: "B1–C1",
    lessons: [
      {
        id: "cm_1",
        title: "Constructive Feedback with Observation + Next Step",
        summary: "Keep teamwork respectful and actionable using objective feedback.",
        keyPoints: [
          "Lead with one genuine strength backed by specifics.",
          "Frame suggestions around the work rather than the person ('Adding a chart on slide 3 could clarify the trend').",
        ],
        example:
          "'Your introduction hooks the audience well; adding one real-world example in section two would make the argument even stronger.'",
        arabicTip: "قدّم الملاحظات البناءة بالتركيز على تحسين العمل نفسه مع ذكر نقطة قوة أولاً.",
      },
    ],
    drills: [
      {
        id: "cm_d1",
        prompt: "Which feedback statement is both supportive and actionable for a teammate?",
        options: [
          "Your slides are confusing and boring.",
          "Everything is great, no need to read it.",
          "Your opening data is clear; summarizing the takeaway in one bullet at the bottom would help readers follow faster.",
          "Do the whole presentation over tonight.",
        ],
        correctIndex: 2,
        explanation:
          "It highlights what works clearly and proposes one concrete, respectful improvement.",
      },
    ],
  },
];

export const PLACEMENT_ASSESSMENT_QUESTIONS: PlacementQuestion[] = [
  // Reading (4)
  {
    id: "pl_rd_1",
    dimension: "reading",
    skillLabel: "Reading — Main Idea",
    passage:
      "Public libraries are evolving beyond quiet bookshelves. Today, many house 3D printers, quiet exam pods, and peer tutoring workshops so every student can access tools regardless of family income.",
    prompt: "What is the central purpose of the passage?",
    options: [
      "To complain about noisy libraries",
      "To show how modern libraries expand equitable student access to tools and learning spaces",
      "To announce that books are being banned",
      "To advertise expensive private tutors",
    ],
    correctIndex: 1,
    explanation:
      "The passage contrasts traditional bookshelves with expanded equitable tools and workshops.",
  },
  {
    id: "pl_rd_2",
    dimension: "reading",
    skillLabel: "Reading — Inference",
    passage:
      "When learners test themselves on five flashcards before sleep, retention rises noticeably compared to rereading highlighted chapters twice.",
    prompt: "What does the author imply about highlighting alone?",
    options: [
      "Highlighting is less effective for memory than active self-testing.",
      "Highlighting is impossible before sleep.",
      "Flashcards should never be reviewed.",
      "Reading twice always guarantees 100% recall.",
    ],
    correctIndex: 0,
    explanation:
      "Active self-testing produces higher retention than passive rereading of highlights.",
  },
  {
    id: "pl_rd_3",
    dimension: "reading",
    skillLabel: "Reading — Tone & Register",
    passage:
      "Preliminary findings demonstrate a modest gain in comprehension when captions accompany technical video lectures.",
    prompt: "Which word signals cautious academic evidence?",
    options: ["Preliminary", "Video", "Technical", "Lectures"],
    correctIndex: 0,
    explanation: "'Preliminary' shows the research findings are initial rather than final.",
  },
  {
    id: "pl_rd_4",
    dimension: "reading",
    skillLabel: "Reading — Vocabulary in Context",
    passage:
      "To mitigate heat islands in dense districts, architects planted native shade trees along pedestrian corridors.",
    prompt: "In this context, 'mitigate' means:",
    options: ["worsen", "reduce or lessen the severity of", "measure temperature of", "ignore"],
    correctIndex: 1,
    explanation: "Planting shade trees helps lessen excessive urban heat.",
  },

  // Listening (4)
  {
    id: "pl_ls_1",
    dimension: "listening",
    skillLabel: "Listening — Schedule Change",
    audioScript:
      "Attention Grade 9 students: the science fair registration closes on Wednesday at 3 PM, not Friday as printed on the older poster.",
    prompt: "When does science fair registration close?",
    options: ["Monday at 9 AM", "Wednesday at 3 PM", "Friday afternoon", "Saturday morning"],
    correctIndex: 1,
    explanation: "The announcement explicitly corrects the older poster to Wednesday at 3 PM.",
  },
  {
    id: "pl_ls_2",
    dimension: "listening",
    skillLabel: "Listening — Speaker Attitude",
    audioScript:
      "I was nervous about speaking in front of twenty classmates, yet practicing with a two-minute timer made the talk feel surprisingly calm.",
    prompt: "How did the speaker feel after using the timer?",
    options: [
      "More panicked than before",
      "Surprisingly calm and prepared",
      "Completely silent",
      "Angry at classmates",
    ],
    correctIndex: 1,
    explanation:
      "The contrast cue 'yet' introduces the positive shift to feeling surprisingly calm.",
  },
  {
    id: "pl_ls_3",
    dimension: "listening",
    skillLabel: "Listening — Contrast Cue",
    audioScript:
      "Battery recycling requires careful sorting at collection centers; however, recovering lithium reduces mining impact significantly.",
    prompt: "What benefit follows 'however'?",
    options: [
      "Lithium mining impact increases",
      "Batteries cannot be collected",
      "Recovering lithium lowers mining impact",
      "Sorting is unnecessary",
    ],
    correctIndex: 2,
    explanation: "Following 'however', recovering lithium significantly reduces mining impact.",
  },
  {
    id: "pl_ls_4",
    dimension: "listening",
    skillLabel: "Listening — Practical Instruction",
    audioScript:
      "Before clicking submit on your essay, verify that every borrowed quote includes its author name and publication year.",
    prompt: "What must students verify before submitting?",
    options: [
      "Only font color",
      "Author name and publication year on borrowed quotes",
      "Deleting all references",
      "Changing the essay title to blank",
    ],
    correctIndex: 1,
    explanation: "The speaker instructs checking author name and publication year for quotes.",
  },

  // Grammar & Vocabulary (4)
  {
    id: "pl_gv_1",
    dimension: "grammar_vocab",
    skillLabel: "Grammar — Subject-Verb Agreement",
    prompt:
      "Complete the sentence: 'The collection of historical maps ___ displayed in the main hall.'",
    options: ["are", "is", "were", "have"],
    correctIndex: 1,
    explanation: "The head noun is singular ('collection'), so singular 'is' agrees.",
  },
  {
    id: "pl_gv_2",
    dimension: "grammar_vocab",
    skillLabel: "Vocabulary — Academic Verb",
    prompt: "Choose the most accurate verb: 'Regular sleep helps ___ long-term memory stability.'",
    options: ["maintain", "destroy", "interrupt", "refuse"],
    correctIndex: 0,
    explanation: "'Maintain' means to keep in a steady, healthy state.",
  },
  {
    id: "pl_gv_3",
    dimension: "grammar_vocab",
    skillLabel: "Grammar — Conditionals",
    prompt:
      "Select the accurate conditional: 'If students ___ their mistakes weekly, exam confidence grows.'",
    options: ["review", "reviewed", "will reviewing", "had review"],
    correctIndex: 0,
    explanation: "Zero/general truth conditional uses Present Simple in both clauses.",
  },
  {
    id: "pl_gv_4",
    dimension: "grammar_vocab",
    skillLabel: "Vocabulary — Part of Speech",
    prompt:
      "Pick the noun form that completes: 'Their solar boat showed remarkable ___ during storms.'",
    options: ["resilient", "resilience", "resiliently", "resistive"],
    correctIndex: 1,
    explanation: "After the adjective 'remarkable', a noun ('resilience') is required.",
  },

  // Writing & Structure (4)
  {
    id: "pl_wr_1",
    dimension: "writing",
    skillLabel: "Writing — Cohesion",
    prompt:
      "Choose the best transition: 'Wind turbines produced surplus power overnight; ___, battery storage captured the extra energy.'",
    options: ["however", "consequently", "meanwhile yesterday", "nevertheless"],
    correctIndex: 1,
    explanation: "'Consequently' accurately signals cause and effect.",
  },
  {
    id: "pl_wr_2",
    dimension: "writing",
    skillLabel: "Writing — Conciseness",
    prompt: "Which revision eliminates unnecessary wordiness while keeping exact meaning?",
    options: [
      "Due to the fact that we practiced daily, we improved.",
      "Because we practiced daily, we improved.",
      "In light of the reason of daily practice, improvement happened by us.",
      "Practice daily was why improvement did occur.",
    ],
    correctIndex: 1,
    explanation: "'Because' cleanly replaces the bloated phrase 'Due to the fact that'.",
  },
  {
    id: "pl_wr_3",
    dimension: "writing",
    skillLabel: "Writing — Topic Sentence Focus",
    prompt: "Which sentence best opens a paragraph on peer tutoring?",
    options: [
      "Schools have desks and whiteboards.",
      "Structured peer tutoring deepens mastery for both the learner and the student explainer.",
      "Today I will talk about my friend.",
      "Tutoring exists in books.",
    ],
    correctIndex: 1,
    explanation: "It introduces both topic and analytical argument directly.",
  },
  {
    id: "pl_wr_4",
    dimension: "writing",
    skillLabel: "Writing — Punctuation",
    prompt: "Which sentence uses semicolon + conjunctive adverb punctuation properly?",
    options: [
      "The experiment succeeded, however we repeated one trial.",
      "The experiment succeeded; however, we repeated one trial.",
      "The experiment succeeded however; we repeated one trial.",
      "The experiment succeeded: however we repeated one trial.",
    ],
    correctIndex: 1,
    explanation:
      "Place a semicolon before 'however' and a comma after it when joining two independent clauses.",
  },

  // Speaking & Communication (4)
  {
    id: "pl_cm_1",
    dimension: "communication",
    skillLabel: "Communication — Polite Clarification",
    prompt: "During a group discussion, how should you ask for clarification constructively?",
    options: [
      "You aren't making any sense at all.",
      "Wait—I want to understand your timeline; could you walk through step two again?",
      "Stop talking and start over.",
      "That point is irrelevant.",
    ],
    correctIndex: 1,
    explanation: "Calmly referencing the exact point ('step two') invites collaborative clarity.",
  },
  {
    id: "pl_cm_2",
    dimension: "communication",
    skillLabel: "Communication — Audience Adaptation",
    prompt: "When presenting a science project to non-specialists, the strongest opening step is:",
    options: [
      "Reading raw spreadsheet tables aloud for 3 minutes",
      "Connecting the problem to a relatable everyday question before introducing jargon",
      "Skipping what the project solves",
      "Memorizing acronyms without defining them",
    ],
    correctIndex: 1,
    explanation:
      "Anchoring technical work in a relatable question builds shared understanding first.",
  },
  {
    id: "pl_cm_3",
    dimension: "communication",
    skillLabel: "Everyday English — Pragmatics",
    prompt:
      "Your lab partner looks overwhelmed before a deadline. What response best fosters teamwork?",
    options: [
      "Finish everything yourself by midnight.",
      "Let's split the remaining checks into two 15-minute pieces—I can verify the citations while you check the graph labels.",
      "Complain to another team.",
      "Ignore the deadline.",
    ],
    correctIndex: 1,
    explanation: "Offering concrete division of tasks supports momentum clearly.",
  },
  {
    id: "pl_cm_4",
    dimension: "communication",
    skillLabel: "Speaking — Structured Reasoning",
    prompt: "Which spoken transition clearly introduces supporting evidence?",
    options: [
      "Anyway, whatever...",
      "To illustrate that point with concrete data...",
      "Wait, I forgot.",
      "Never mind that earlier sentence.",
    ],
    correctIndex: 1,
    explanation: "'To illustrate that point...' bridges claim to evidence seamlessly.",
  },
];

export const ADAPTIVE_LEARNING_PATHS: AdaptiveLearningPath[] = [
  {
    id: "path_g9_english",
    title: "Grade 9 English Mastery Path",
    titleAr: "مسار إتقان الإنجليزية للصف التاسع",
    domain: "english",
    description:
      "Builds from core Unit 3 vocabulary and sentence accuracy to academic paragraph clarity and structured communication.",
    steps: [
      {
        id: "g9_step_1",
        title: "Foundation: Context Clues & Unit 3 Word Precision",
        kind: "lesson",
        summary:
          "Distinguish shades of meaning, British spelling ('flavour', 'fibre'), and collocations.",
        prerequisiteIds: [],
        targetRoute: "/app/study",
        linkedSkillArea: "vocabulary",
        minMasteryScore: 70,
        checkQuestion: {
          prompt: "Which spelling follows standard British English taught in Unit 3?",
          options: ["flavor / fiber", "flavour / fibre", "flavur / fybre", "flaver / fibur"],
          correctIndex: 1,
          explanation: "Unit 3 uses standard British English: 'flavour' and 'fibre'.",
        },
      },
      {
        id: "g9_step_2",
        title: "Grammar Bridge: Active Tenses & Agreement",
        kind: "practice",
        summary: "Ensure clauses match time frames and singular/plural subjects accurately.",
        prerequisiteIds: ["g9_step_1"],
        targetRoute: "/app/study",
        linkedSkillArea: "grammar",
        minMasteryScore: 70,
        checkQuestion: {
          prompt: "Pick the accurate verb: 'Each of the laboratory microscopes ___ calibrated.'",
          options: ["were", "was", "are", "have been"],
          correctIndex: 1,
          explanation: "'Each' is singular, requiring singular verb 'was'.",
        },
      },
      {
        id: "g9_step_3",
        title: "Structured Paragraph & Transition Craft",
        kind: "project",
        summary: "Draft a concise 4-sentence analytical paragraph with a clear topic sentence.",
        prerequisiteIds: ["g9_step_2"],
        targetRoute: "/app/ai",
        linkedSkillArea: "writing",
        minMasteryScore: 75,
        checkQuestion: {
          prompt: "Which transition introduces a contrasting limitation formally?",
          options: ["Plus", "However", "Like", "Totally"],
          correctIndex: 1,
          explanation: "'However' introduces contrast clearly in formal writing.",
        },
      },
      {
        id: "g9_step_4",
        title: "Mastery Checkpoint: Academic Communication",
        kind: "checkpoint",
        summary: "Combine reading inference, polite feedback, and concise reasoning.",
        prerequisiteIds: ["g9_step_3"],
        targetRoute: "/app/study",
        linkedSkillArea: "communication",
        minMasteryScore: 80,
        checkQuestion: {
          prompt: "In the PREP speaking method, which element grounds your claim in reality?",
          options: ["Point", "Example", "Silence", "Digression"],
          correctIndex: 1,
          explanation: "The 'E' (Example) grounds your Point and Reason in concrete evidence.",
        },
      },
    ],
  },
  {
    id: "path_stem_research",
    title: "STEM Research & Critical Reasoning",
    titleAr: "مسار البحث العلمي والتفكير النقدي",
    domain: "stem",
    description:
      "Connect scientific method, source verification, logical fallacy spotting, and mathematical rigor.",
    steps: [
      {
        id: "stem_step_1",
        title: "Source Reliability & Evidence Verification",
        kind: "lesson",
        summary: "Tell primary empirical studies apart from unverified opinion posts.",
        prerequisiteIds: [],
        targetRoute: "/app/study",
        minMasteryScore: 70,
        checkQuestion: {
          prompt: "Which source carries strongest weight for a scientific claim?",
          options: [
            "Anonymous social screenshot",
            "Peer-reviewed experiment with transparent dataset",
            "Single sponsor slogan",
            "Unverified rumor",
          ],
          correctIndex: 1,
          explanation: "Transparent peer-reviewed methodology allows independent verification.",
        },
      },
      {
        id: "stem_step_2",
        title: "Correlation vs. Causation Diagnostic",
        kind: "practice",
        summary: "Avoid mistaking simultaneous trends for direct cause-and-effect.",
        prerequisiteIds: ["stem_step_1"],
        targetRoute: "/app/study",
        minMasteryScore: 75,
        checkQuestion: {
          prompt:
            "If ice cream sales and drowning accidents both rise in July, what explains both?",
          options: [
            "Ice cream causes swimming issues",
            "A third confounding variable (warm summer weather)",
            "Drowning increases appetite",
            "No mathematics applies",
          ],
          correctIndex: 1,
          explanation: "Warm weather increases both outdoor swimming and ice cream consumption.",
        },
      },
      {
        id: "stem_step_3",
        title: "Mini Experiment / Hypothesis Brief",
        kind: "checkpoint",
        summary: "Define independent, dependent, and control variables for a real test.",
        prerequisiteIds: ["stem_step_2"],
        targetRoute: "/app/future",
        minMasteryScore: 80,
        checkQuestion: {
          prompt:
            "In testing study recall with 15-min vs 30-min spacing, the spacing interval is the:",
          options: [
            "Independent variable",
            "Dependent outcome",
            "Uncontrolled noise",
            "Bibliography",
          ],
          correctIndex: 0,
          explanation:
            "The variable deliberately changed by the experimenter is the independent variable.",
        },
      },
    ],
  },
  {
    id: "path_future_ready",
    title: "University & Career Portfolio Track",
    titleAr: "مسار الجاهزية الجامعية والملف الشخصي",
    domain: "future",
    description:
      "Turn daily academic projects into verified portfolio artifacts, study timelines, and scholarship readiness.",
    steps: [
      {
        id: "fut_step_1",
        title: "Time-Blocking & Priority Matrix Setup",
        kind: "practice",
        summary: "Separate urgent deadlines from high-impact long-term skill building.",
        prerequisiteIds: [],
        targetRoute: "/app/tasks",
        minMasteryScore: 70,
        checkQuestion: {
          prompt: "In an Eisenhower Matrix, long-term exam prep with no crisis today belongs in:",
          options: [
            "Important & Not Urgent (Schedule intentionally)",
            "Urgent & Not Important",
            "Delete quadrant",
            "Random procrastination",
          ],
          correctIndex: 0,
          explanation:
            "Scheduling Quadrant 2 (Important, Not Urgent) prevents last-minute cramming.",
        },
      },
      {
        id: "fut_step_2",
        title: "Documenting a Verified Student Project",
        kind: "project",
        summary: "Capture problem, process, outcome, and reflection in your BTC Portfolio.",
        prerequisiteIds: ["fut_step_1"],
        targetRoute: "/app/future",
        minMasteryScore: 75,
        checkQuestion: {
          prompt: "What makes a student portfolio entry persuasive to university reviewers?",
          options: [
            "Listing dozens of buzzwords without proof",
            "Explaining problem, concrete actions taken, measurable outcome, and honest reflection",
            "Hiding failures completely",
            "Copying another student's project title",
          ],
          correctIndex: 1,
          explanation:
            "Concrete evidence of action, outcome, and reflection shows authentic growth.",
        },
      },
    ],
  },
];
