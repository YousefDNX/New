import type { LessonExercise } from "./english-curriculum";

export type CefrExtendedBand = "Pre-A1" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/* -------------------------------------------------------------------------- */
/* 1. LISTENING ACADEMY DATA                                                  */
/* -------------------------------------------------------------------------- */

export interface ListeningQuestion {
  id: string;
  skillTested: "main_idea" | "detail" | "inference" | "vocabulary";
  kind: "mcq" | "true_false" | "fill_blank";
  prompt: string;
  options?: string[];
  correctIndex?: number;
  acceptedAnswers?: string[];
  explanation: string;
}

export interface ListeningTrack {
  id: string;
  level: CefrExtendedBand;
  topic: string;
  title: string;
  titleAr: string;
  durationSecEst: number;
  context: string;
  accentHint: string;
  dialogue: Array<{ speaker: string; line: string }>;
  extractedVocab: Array<{
    word: string;
    meaningAr: string;
    definition: string;
    example: string;
  }>;
  questions: ListeningQuestion[];
}

export const LISTENING_TRACKS: ListeningTrack[] = [
  {
    id: "list-a1-routine",
    level: "A1",
    topic: "Daily Routine & School Timetable",
    title: "My Tuesday Study Routine",
    titleAr: "جدول دراستي اليومي يوم الثلاثاء",
    durationSecEst: 30,
    context: "A student explains her afternoon schedule after finishing classes.",
    accentHint: "US American English Accent (en-US)",
    dialogue: [
      { speaker: "Layla", line: "Hi! On Tuesdays I finish science class at half past one." },
      {
        speaker: "Layla",
        line: "First, I eat a light lunch at two o'clock and rest for thirty minutes.",
      },
      {
        speaker: "Layla",
        line: "At four o'clock, I study English vocabulary for twenty minutes using flashcards.",
      },
      {
        speaker: "Layla",
        line: "In the evening, I read a short storybook before going to sleep at ten.",
      },
    ],
    extractedVocab: [
      {
        word: "routine",
        meaningAr: "روتين / نظام يومي",
        definition: "A regular sequence of actions followed every day.",
        example: "A steady study routine reduces evening stress.",
      },
      {
        word: "flashcards",
        meaningAr: "بطاقات المذاكرة",
        definition: "Small study cards with a prompt on the front and meaning on the back.",
        example: "Ten flashcards a day help remember new words easily.",
      },
    ],
    questions: [
      {
        id: "la1-q1",
        skillTested: "detail",
        kind: "mcq",
        prompt: "What time does Layla practice English vocabulary?",
        options: ["At one thirty", "At two o'clock", "At four o'clock", "At ten o'clock"],
        correctIndex: 2,
        explanation:
          "Layla says: 'At four o'clock, I study English vocabulary for twenty minutes.'",
      },
      {
        id: "la1-q2",
        skillTested: "main_idea",
        kind: "true_false",
        prompt: "True or False: Layla reads a short storybook before sleeping at ten.",
        options: ["True", "False"],
        correctIndex: 0,
        explanation: "True! She reads in the evening before going to sleep at ten.",
      },
      {
        id: "la1-q3",
        skillTested: "detail",
        kind: "fill_blank",
        prompt: "How many minutes does Layla spend studying English vocabulary? (number)",
        acceptedAnswers: ["20", "twenty"],
        explanation: "Layla studies English vocabulary for 20 minutes.",
      },
      {
        id: "la1-q4",
        skillTested: "detail",
        kind: "true_false",
        prompt: "True or False: Layla eats lunch at two o'clock.",
        options: ["True", "False"],
        correctIndex: 0,
        explanation: "True! She eats lunch at two o'clock.",
      },
      {
        id: "la1-q5",
        skillTested: "inference",
        kind: "mcq",
        prompt: "What does Layla use to study vocabulary?",
        options: ["Flashcards", "A computer video game", "A dictionary", "A newspaper"],
        correctIndex: 0,
        explanation: "She uses flashcards for twenty minutes.",
      },
    ],
  },
  {
    id: "list-a2-market",
    level: "A2",
    topic: "Culture & Healthy Food (Unit 3 Bridge)",
    title: "Saturday Morning at the Organic Market",
    titleAr: "صباح السبت في سوق المنتجات الطازجة (ربط الوحدة 3)",
    durationSecEst: 40,
    context:
      "A student and her uncle shop for ingredients for a traditional homemade family lunch.",
    accentHint: "UK British English Accent (en-GB)",
    dialogue: [
      {
        speaker: "Noura",
        line: "Uncle Salih, look at those bright tomatoes and fresh mint bundles from local farms!",
      },
      {
        speaker: "Uncle Salih",
        line: "Yes, this organic produce has rich natural flavour without harmful sprays.",
      },
      {
        speaker: "Noura",
        line: "What else do we need for Grandmother's lentil soup recipe?",
      },
      {
        speaker: "Uncle Salih",
        line: "We need red lentils, cumin, and brown whole-grain bread—it gives great dietary fibre. Oh, and let's buy cardamom to serve guests hot tea later.",
      },
    ],
    extractedVocab: [
      {
        word: "produce",
        meaningAr: "محاصيل زراعية طازجة",
        definition: "Fresh fruits and vegetables grown on farms.",
        example: "Saturday mornings bring the freshest local produce.",
      },
      {
        word: "flavour",
        meaningAr: "نكهة / مذاق",
        definition: "The distinctive taste of a food or drink (British spelling).",
        example: "Cardamom adds warm aromatic flavour to tea.",
      },
    ],
    questions: [
      {
        id: "la2-q1",
        skillTested: "main_idea",
        kind: "mcq",
        prompt: "Why are Noura and Uncle Salih at the market?",
        options: [
          "To return broken kitchen tools",
          "To buy fresh ingredients for a family lunch and hospitality tea",
          "To take photos of tall buildings",
          "To buy packaged fast food",
        ],
        correctIndex: 1,
        explanation:
          "They are gathering fresh produce, lentils, spices, and bread for lunch and tea.",
      },
      {
        id: "la2-q2",
        skillTested: "detail",
        kind: "fill_blank",
        prompt:
          "Which British-spelled nutrient does Uncle Salih say whole-grain bread provides? (5 letters)",
        acceptedAnswers: ["fibre", "fiber"],
        explanation: "Uncle Salih mentions brown whole-grain bread provides dietary 'fibre'.",
      },
      {
        id: "la2-q3",
        skillTested: "inference",
        kind: "mcq",
        prompt: "What does buying cardamom for later guests tell us about the family?",
        options: [
          "They do not like visitors.",
          "They value traditional hospitality and welcoming guests warmly.",
          "They forgot to eat breakfast.",
          "They never drink tea.",
        ],
        correctIndex: 1,
        explanation: "Preparing cardamom tea for guests reflects warm cultural hospitality.",
      },
      {
        id: "la2-q4",
        skillTested: "detail",
        kind: "true_false",
        prompt: "True or False: Uncle Salih and Noura are buying red lentils for soup.",
        options: ["True", "False"],
        correctIndex: 0,
        explanation: "True! They need red lentils for Grandmother's lentil soup.",
      },
      {
        id: "la2-q5",
        skillTested: "vocabulary",
        kind: "mcq",
        prompt: "What does the word 'produce' mean in this market context?",
        options: [
          "Fresh fruits and vegetables grown on farms",
          "Plastic toys",
          "Heavy machinery",
          "Office stationery",
        ],
        correctIndex: 0,
        explanation: "Produce refers to fresh farm-grown fruits and vegetables.",
      },
    ],
  },
  {
    id: "list-b1-library-shift",
    level: "B1",
    topic: "Education & Planning",
    title: "Study Group Schedule Update",
    titleAr: "تحديث موعد مجموعة المذاكرة العلمية",
    durationSecEst: 45,
    context: "A school coordinator leaves an audio message updating competition team schedules.",
    accentHint: "Neutral clear academic announcement",
    dialogue: [
      {
        speaker: "Coordinator",
        line: "Hello everyone on the debate and robotics teams. Quick update for Thursday afternoon.",
      },
      {
        speaker: "Coordinator",
        line: "Originally, we booked the main auditorium at 2:30 PM. However, because sound technicians are testing microphones there, our session has moved upstairs to Study Hall C.",
      },
      {
        speaker: "Coordinator",
        line: "Even better, starting at 3:00 PM instead of 2:30 gives you thirty extra minutes after science lab to grab water and review your notes.",
      },
      {
        speaker: "Coordinator",
        line: "Bring your outline cards, and send apologies early if any teammate cannot make the 3:00 PM slot.",
      },
    ],
    extractedVocab: [
      {
        word: "originally",
        meaningAr: "في الأصل / مبدئياً",
        definition: "From or in the beginning, before any changes.",
        example: "Originally, the club met on Mondays before switching to Thursdays.",
      },
      {
        word: "outline",
        meaningAr: "مخطط تمهيدي / ملخص هيكلي",
        definition: "A brief structured summary showing main points in order.",
        example: "Bring five clear outline cards for your speech.",
      },
    ],
    questions: [
      {
        id: "lb1-q1",
        skillTested: "detail",
        kind: "mcq",
        prompt: "Why did the Thursday meeting move out of the main auditorium?",
        options: [
          "The building was closed for holidays.",
          "Technicians are testing microphones in the auditorium.",
          "Students voted to cancel debate.",
          "Study Hall C had fewer chairs.",
        ],
        correctIndex: 1,
        explanation:
          "The coordinator explains technicians are testing audio equipment in the auditorium.",
      },
      {
        id: "lb1-q2",
        skillTested: "detail",
        kind: "fill_blank",
        prompt: "At what new afternoon time does the session begin? (format like 3:00)",
        acceptedAnswers: ["3:00", "3:00 pm", "3 pm", "three"],
        explanation: "It shifted from 2:30 PM to 3:00 PM.",
      },
      {
        id: "lb1-q3",
        skillTested: "inference",
        kind: "true_false",
        prompt: "True or False: The coordinator sounds annoyed about moving to 3:00 PM.",
        options: ["True", "False"],
        correctIndex: 1,
        explanation:
          "False! She says 'Even better', welcoming the extra 30-minute break after lab.",
      },
    ],
  },
  {
    id: "list-b2-solar-desalination",
    level: "B2",
    topic: "STEM & Environment",
    title: "Science Podcast: Desert Solar & Freshwater",
    titleAr: "بودكاست علمي: الطاقة الشمسية وتحلية المياه",
    durationSecEst: 55,
    context:
      "An environmental engineer explains how solar-thermal innovation supports Gulf coastal cities.",
    accentHint: "Broadcast science interview style",
    dialogue: [
      {
        speaker: "Host",
        line: "Today we examine how Gulf coastal research centers cut the energy footprint of freshwater desalination.",
      },
      {
        speaker: "Dr. Samira",
        line: "Conventional plants rely heavily on fossil fuels. Yet modern membrane systems powered by midday solar panels reduce fuel consumption considerably.",
      },
      {
        speaker: "Host",
        line: "What challenge remains in desert regions during summer months?",
      },
      {
        speaker: "Dr. Samira",
        line: "Two practical hurdles: fine dust settles onto glass panels weekly, and storing surplus daytime electricity overnight requires durable thermal or battery reserves.",
      },
    ],
    extractedVocab: [
      {
        word: "conventional",
        meaningAr: "تقليدي / معتاد",
        definition: "Following established or standard traditional methods.",
        example: "Conventional methods are gradually being upgraded with solar power.",
      },
      {
        word: "surplus",
        meaningAr: "فائض",
        definition: "An extra amount remaining beyond what is immediately needed.",
        example: "Engineers store surplus midday electricity for evening use.",
      },
    ],
    questions: [
      {
        id: "lb2-q1",
        skillTested: "main_idea",
        kind: "mcq",
        prompt: "What is Dr. Samira's central message about solar desalination?",
        options: [
          "Solar panels solve all coastal challenges effortlessly.",
          "Solar-membrane systems cut fossil fuel use but require dust maintenance and storage solutions.",
          "Desalination cannot work near oceans.",
          "Batteries only work in winter.",
        ],
        correctIndex: 1,
        explanation:
          "She balances clear progress (lower fuel use) against real engineering hurdles (dust + storage).",
      },
      {
        id: "lb2-q2",
        skillTested: "detail",
        kind: "fill_blank",
        prompt:
          "According to Dr. Samira, what natural desert factor settles onto glass panels every week?",
        acceptedAnswers: ["dust", "fine dust"],
        explanation: "Fine dust reduces solar capture unless panels are cleaned regularly.",
      },
      {
        id: "lb2-q3",
        skillTested: "vocabulary",
        kind: "mcq",
        prompt: "In this dialogue, what does 'surplus daytime electricity' refer to?",
        options: [
          "Lost power",
          "Extra electricity generated beyond midday demand",
          "Expensive imported oil",
          "Broken cables",
        ],
        correctIndex: 1,
        explanation: "'Surplus' means extra supply available to store for later night hours.",
      },
    ],
  },
  {
    id: "list-c1-scholarship-panel",
    level: "C1",
    topic: "Academic & Career Interviews",
    title: "Scholarship Panel Insights: Beyond Grades",
    titleAr: "لقاء لجنة المنح الدراسية: ما بعد الدرجات (C1)",
    durationSecEst: 60,
    context:
      "Two university selection chairs discuss what distinguishes memorable student applicants.",
    accentHint: "Reflective panel discussion",
    dialogue: [
      {
        speaker: "Prof. Hassan",
        line: "High exam marks open the initial file, certainly. Still, when fifty applicants share top grades, clarity of purpose sets a candidate apart.",
      },
      {
        speaker: "Dr. Elena",
        line: "Precisely. Rather than listing ten shallow club titles, tell us honestly how one stubborn problem taught you resilience or helped your neighborhood.",
      },
      {
        speaker: "Prof. Hassan",
        line: "Indeed, authentic curiosity beats rehearsed buzzwords every single time—both in written statements and in live follow-up questions.",
      },
    ],
    extractedVocab: [
      {
        word: "resilience",
        meaningAr: "المرونة النفسية والقدرة على الصمود",
        definition: "The capacity to recover and learn quickly from setbacks.",
        example: "Debugging a failed prototype showed real engineering resilience.",
      },
      {
        word: "rehearsed",
        meaningAr: "محفوظ ومكرر آلياً",
        definition: "Practiced mechanically until sounding scripted rather than genuine.",
        example: "Avoid overly rehearsed answers that miss the interviewer's actual question.",
      },
    ],
    questions: [
      {
        id: "lc1-q1",
        skillTested: "main_idea",
        kind: "mcq",
        prompt: "What do both panel members agree matters most once grades meet the cutoff?",
        options: [
          "Joining the maximum number of superficial clubs",
          "Genuine curiosity and deep reflection on one meaningful challenge",
          "Memorizing complex legal jargon",
          "Writing the longest possible essay",
        ],
        correctIndex: 1,
        explanation:
          "Both prioritize authentic curiosity and substantive depth over shallow checklists.",
      },
      {
        id: "lc1-q2",
        skillTested: "inference",
        kind: "true_false",
        prompt:
          "True or False: The speakers believe exam grades are irrelevant to scholarship selection.",
        options: ["True", "False"],
        correctIndex: 1,
        explanation:
          "False! Prof. Hassan states high marks 'open the initial file'—necessary, just not sufficient alone.",
      },
      {
        id: "lc1-q3",
        skillTested: "vocabulary",
        kind: "fill_blank",
        prompt: "Which noun means the strength to bounce back and grow from tough challenges?",
        acceptedAnswers: ["resilience"],
        explanation: "Dr. Elena highlights how problem-solving teaches 'resilience'.",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* 2. SPEAKING ACADEMY DATA                                                   */
/* -------------------------------------------------------------------------- */

export interface SpeakingScenario {
  id: string;
  mode: "qa" | "roleplay" | "describe" | "presentation" | "opinion" | "simulation";
  modeLabel: string;
  level: CefrExtendedBand;
  title: string;
  titleAr: string;
  prompt: string;
  partnerCue: string;
  usefulPhrases: string[];
  modelResponse: string;
  selfCheckCriteria: string[];
  targetKeywords: string[];
}

export const SPEAKING_SCENARIOS: SpeakingScenario[] = [
  {
    id: "spk-qa-intro",
    mode: "qa",
    modeLabel: "Guided Q&A",
    level: "A1",
    title: "Daily Study Routine Interview",
    titleAr: "مقابلة حول روتين المذاكرة اليومي",
    prompt:
      "Answer clearly in 2–4 sentences: 'What is your favourite time of day to study English, and why?'",
    partnerCue:
      "Hi! Before we set up our study group, when do you focus best, and what do you usually review first?",
    usefulPhrases: [
      "I usually study best in the...",
      "I prefer ... because...",
      "First, I review... and then I...",
    ],
    modelResponse:
      "I usually study best in the quiet afternoon around five o'clock. I prefer studying then because my mind feels rested after a short break. First, I review five vocabulary flashcards aloud, and then I read a short paragraph.",
    selfCheckCriteria: [
      "Gave a direct answer naming a time of day",
      "Added a clear reason starting with 'because'",
      "Shared one concrete study action or example",
    ],
    targetKeywords: ["because", "study", "first", "prefer"],
  },
  {
    id: "spk-roleplay-library",
    mode: "roleplay",
    modeLabel: "Role-Play Dialogue",
    level: "A2",
    title: "Asking a Librarian for Help",
    titleAr: "حوار تمثيلي في المكتبة المدرسية",
    prompt:
      "Imagine you need an intermediate English reader and a quiet desk near a power outlet. Ask politely in 3 sentences.",
    partnerCue: "Good afternoon! Welcome to the school learning center. How can I help you today?",
    usefulPhrases: [
      "Excuse me, could you help me find...?",
      "I'm looking for a book at the ... level.",
      "Would it be possible to sit near...?",
    ],
    modelResponse:
      "Good afternoon! Could you help me find graded English storybooks at the A2 level? Also, would it be possible to reserve a quiet desk near an outlet for thirty minutes? Thank you very much for your help.",
    selfCheckCriteria: [
      "Used polite greeting and request framing ('Could you...' / 'Would it be possible...')",
      "Clearly stated both needs (A2 reader + quiet desk)",
      "Closed politely with appreciation",
    ],
    targetKeywords: ["could", "please", "thank", "find"],
  },
  {
    id: "spk-describe-meal",
    mode: "describe",
    modeLabel: "Situation Description",
    level: "A2",
    title: "Describe a Healthy Family Meal (Unit 3)",
    titleAr: "وصف وجبة عائلية صحية (ربط الوحدة 3)",
    prompt:
      "Describe a memorable homemade dish from your home: mention its ingredients, aroma/flavour, and why families enjoy it on special occasions.",
    partnerCue:
      "Tell our international exchange group about a nutritious dish commonly served in your culture!",
    usefulPhrases: [
      "One distinctive dish in our home is...",
      "Its main fresh ingredients include...",
      "It has an aromatic flavour because...",
      "Families serve it on special occasions to reflect hospitality.",
    ],
    modelResponse:
      "One distinctive homemade dish in our family is spiced grilled fish with herb rice and fresh salad. Its healthy ingredients include crisp vegetables rich in fibre, lemon, and aromatic cardamom. We commonly serve it at weekend gatherings because it reflects warmth and balanced nutrition.",
    selfCheckCriteria: [
      "Named at least two clear ingredients",
      "Included descriptive adjectives (e.g., fresh, aromatic, healthy)",
      "Explained the cultural or health value",
    ],
    targetKeywords: ["ingredients", "healthy", "serve", "because"],
  },
  {
    id: "spk-prep-presentation",
    mode: "presentation",
    modeLabel: "PREP Mini-Presentation",
    level: "B1",
    title: "2-Minute Talk: Should Schools Start 30 Minutes Later?",
    titleAr: "عرض تقديمي قصير (PREP): مواعيد الدوام المدرسي",
    prompt:
      "Use PREP structure: Point (your stance) -> Reason (why) -> Example (concrete scene) -> Point restated.",
    partnerCue:
      "Your student council wants a 60–90 second speech explaining your stance cleanly using PREP.",
    usefulPhrases: [
      "In my view, ...",
      "The primary reason is that...",
      "For example, when students...",
      "Therefore, I strongly believe...",
    ],
    modelResponse:
      "In my view, starting secondary school thirty minutes later would improve both focus and wellbeing. The main reason is that teenagers naturally stay alert later in the evening and struggle with 6:30 AM fatigue. For example, two classes that piloted a slightly later start reported noticeably higher morning quiz concentration. Therefore, adjusting the bell schedule by half an hour is a smart investment in learning.",
    selfCheckCriteria: [
      "Opened immediately with a clear Point",
      "Backed up the Point with at least one logical Reason + concrete Example",
      "Wrapped up crisply with 'Therefore / In conclusion'",
    ],
    targetKeywords: ["reason", "example", "therefore", "believe"],
  },
  {
    id: "spk-opinion-tech",
    mode: "opinion",
    modeLabel: "Opinion & Counterargument",
    level: "B2",
    title: "Balancing Digital Tools with Deep Reading",
    titleAr: "إبداء الرأي المتوازن حول التكنولوجيا والقراءة العميقة",
    prompt:
      "Express a balanced opinion on tablets vs paper textbooks, acknowledging one benefit of each side.",
    partnerCue:
      "Some classmates think paper books are outdated, while others avoid screens for study. Where do you stand?",
    usefulPhrases: [
      "While digital tablets offer undeniable convenience, ...",
      "On the other hand, printed pages help...",
      "The smartest balance is...",
    ],
    modelResponse:
      "While digital tablets offer undeniable convenience for carrying dozens of references and audio dictionaries, printed notebooks still encourage slower, distraction-free concentration. Consequently, I find a hybrid approach works best: listening and vocabulary drills on screens, followed by focused paper summarization.",
    selfCheckCriteria: [
      "Acknowledged both sides fairly using 'While / Although'",
      "Proposed a clear synthesized recommendation",
      "Spoke or drafted smoothly in complete clauses",
    ],
    targetKeywords: ["while", "although", "balance", "focus"],
  },
  {
    id: "spk-sim-mun",
    mode: "simulation",
    modeLabel: "Conversation Simulation",
    level: "C1",
    title: "Diplomatic Committee Negotiation",
    titleAr: "محاكاة تفاوض دبلوماسي في لجنة طلابية (C1)",
    prompt:
      "Respond tactfully to a teammate whose solar-garden proposal is over budget by offering a phased compromise.",
    partnerCue:
      "Delegate: 'We should install solar shades across every school courtyard next month regardless of cost!' How do you respond?",
    usefulPhrases: [
      "I wholeheartedly share your goal of...",
      "However, looking at the current budget constraint...",
      "Might we pilot two high-traffic courtyards first to measure cooling impact?",
    ],
    modelResponse:
      "I completely share your urgency to cool our school courtyards sustainably. However, deploying all twelve campuses at once exceeds this semester's budget. Might we launch a measurable two-school pilot next month, document exact temperature savings, and unlock phase-two funding with hard proof?",
    selfCheckCriteria: [
      "Validated the speaker's shared value first",
      "Framed the budget issue neutrally without harsh dismissal",
      "Proposed a concrete, actionable phased compromise",
    ],
    targetKeywords: ["however", "pilot", "budget", "share"],
  },
];

/* -------------------------------------------------------------------------- */
/* 3. READING ACADEMY DATA                                                    */
/* -------------------------------------------------------------------------- */

export interface ReadingPassage {
  id: string;
  level: CefrExtendedBand;
  genre: "Story" | "Dialogue" | "Article" | "Essay" | "Editorial" | "Diary Entry";
  topic: string;
  title: string;
  titleAr: string;
  recommendedMinutes: number;
  paragraphs: string[];
  extractedVocab: Array<{ word: string; meaningAr: string; definition: string }>;
  questions: Array<{
    id: string;
    focus: "main_idea" | "detail" | "inference" | "vocab_in_context";
    prompt: string;
    options: [string, string, string, string];
    correctIndex: 0 | 1 | 2 | 3;
    explanation: string;
  }>;
}

export const READING_PASSAGES: ReadingPassage[] = [
  {
    id: "read-pre-library",
    level: "Pre-A1",
    genre: "Story",
    topic: "School Life",
    title: "A Quiet Corner in the Blue Library",
    titleAr: "ركن هادئ في المكتبة الزرقاء",
    recommendedMinutes: 3,
    paragraphs: [
      "Every Wednesday after school, Yousef walks three blocks to the neighborhood library. Inside, the walls are painted soft blue and tall windows let in gentle afternoon sunlight.",
      "Yousef picks a wooden chair by the window. First, he takes out a green notebook and opens an illustrated science reader about sea turtles.",
      "At five o'clock, his father waves from the door. Yousef packs his books neatly, thanks the librarian, and walks home smiling because he learned four new words.",
    ],
    extractedVocab: [
      { word: "gentle", meaningAr: "لطيف / هادئ", definition: "Soft, mild, and calm." },
      {
        word: "illustrated",
        meaningAr: "مُصوّر",
        definition: "Containing clear pictures or drawings.",
      },
    ],
    questions: [
      {
        id: "rp1-1",
        focus: "main_idea",
        prompt: "What is the story mainly about?",
        options: [
          "Yousef playing football at the beach",
          "Yousef's calm Wednesday afternoon reading habit at the library",
          "A school trip to a supermarket",
          "Buying green paint for a house",
        ],
        correctIndex: 1,
        explanation:
          "Every paragraph centers on Yousef visiting and reading at the neighborhood library.",
      },
      {
        id: "rp1-2",
        focus: "detail",
        prompt: "What topic is Yousef's illustrated science reader about?",
        options: ["Tall trees", "Sea turtles", "Fast trains", "Desert stars"],
        correctIndex: 1,
        explanation: "Paragraph 2 specifies 'an illustrated science reader about sea turtles.'",
      },
      {
        id: "rp1-3",
        focus: "inference",
        prompt: "How does Yousef feel about his library afternoons?",
        options: [
          "Bored and impatient",
          "Happy and proud of what he learned",
          "Scared of the librarian",
          "Tired of walking",
        ],
        correctIndex: 1,
        explanation: "He walks home 'smiling because he learned four new words.'",
      },
    ],
  },
  {
    id: "read-a1-museum",
    level: "A1",
    genre: "Diary Entry",
    topic: "Science & Curiosity",
    title: "Saturday Visit to the Science Hall",
    titleAr: "زيارة يوم السبت إلى قاعة العلوم",
    recommendedMinutes: 3,
    paragraphs: [
      "Last Saturday, Sami and his sister Maya visited the City Science Hall. Near the front gate, a tall silver model showed how solar panels turn sunlight into electricity.",
      "Inside the second room, Sami tried a bicycle generator. When he pedaled faster, three small bulbs glowed brighter right in front of him.",
      "Before leaving at noon, Maya wrote two questions in her pocket journal so they could research renewable batteries at home.",
    ],
    extractedVocab: [
      {
        word: "renewable",
        meaningAr: "متجدد",
        definition: "Energy from sources that do not run out quickly, such as sunlight or wind.",
      },
      {
        word: "journal",
        meaningAr: "مذكرة / سجل يومي",
        definition: "A notebook where you record observations, questions, or daily notes.",
      },
    ],
    questions: [
      {
        id: "ra1-q1",
        focus: "detail",
        prompt: "What happened when Sami pedaled faster on the bicycle generator?",
        options: [
          "The gate closed",
          "Three small bulbs glowed brighter",
          "Sunlight disappeared",
          "The bicycle stopped",
        ],
        correctIndex: 1,
        explanation:
          "Faster pedaling generated more electrical energy, making three small bulbs glow brighter.",
      },
      {
        id: "ra1-q2",
        focus: "main_idea",
        prompt: "Why did Maya write two questions in her pocket journal?",
        options: [
          "To research renewable batteries when she got home",
          "To buy food at the gate",
          "Because she lost her map",
          "To complain about stairs",
        ],
        correctIndex: 0,
        explanation:
          "She wrote questions so they could continue researching renewable batteries at home.",
      },
    ],
  },
  {
    id: "read-a2-hospitality",
    level: "A2",
    genre: "Article",
    topic: "Culture, Food & Health (Unit 3)",
    title: "More Than a Recipe: What Shared Meals Preserve",
    titleAr: "أكثر من وصفة: ما تحفظه الوجبات العائلية المشتركة",
    recommendedMinutes: 5,
    paragraphs: [
      "In towns across the Gulf and Mediterranean, family recipes rarely live on printed nutrition labels alone. Instead, grandparents pass down exact proportions by demonstrating how herbs should smell—rich, warm, and aromatic—and how slow simmering preserves crisp vegetable flavour.",
      "Nutritionists today increasingly embrace many of these homemade traditions. Compared with ultra-processed snacks packed with excess salt, traditional dishes built around lentils, olive oil, grilled fish, and leafy herbs provide reliable dietary fibre and sustained daytime energy.",
      "Just as importantly, gathering to serve guests and elders at the same table turns an ordinary weekday evening into an unhurried occasion for storytelling, listening, and gratitude.",
    ],
    extractedVocab: [
      {
        word: "embrace",
        meaningAr: "يتبنّى / يرحب بـ",
        definition: "To adopt an idea or practice willingly.",
      },
      {
        word: "sustained",
        meaningAr: "مستدام / متواصل",
        definition: "Continuing steadily over a long period without dropping.",
      },
    ],
    questions: [
      {
        id: "ra2-1",
        focus: "main_idea",
        prompt: "Which title best summarizes the article?",
        options: [
          "Why Restaurant Menus Are Always Better",
          "How Homemade Heritage Meals Support Both Health and Community",
          "How to Print Supermarket Labels",
          "Why Nobody Eats Lentils Today",
        ],
        correctIndex: 1,
        explanation:
          "It links homemade nutritional value (fibre/energy) with cultural hospitality.",
      },
      {
        id: "ra2-2",
        focus: "vocab_in_context",
        prompt: "In paragraph 2, what does 'ultra-processed snacks' contrast with?",
        options: [
          "Grandparents' stories",
          "Homemade meals rich in lentils, fish, and herbs",
          "Printed newspapers",
          "Evening homework",
        ],
        correctIndex: 1,
        explanation:
          "'Compared with ultra-processed snacks' directly contrasts packaged snacks with homemade nutrition.",
      },
      {
        id: "ra2-3",
        focus: "inference",
        prompt: "Why do grandparents teach cooking by demonstration rather than labels?",
        options: [
          "They do not know how to cook.",
          "Sensory experience—smell, timing, and shared practice—matters alongside measurements.",
          "Herbs have no aroma.",
          "Nobody likes eating together.",
        ],
        correctIndex: 1,
        explanation:
          "Paragraph 1 highlights teaching through smell ('aromatic') and visual simmering.",
      },
    ],
  },
  {
    id: "read-b1-mangroves",
    level: "B1",
    genre: "Article",
    topic: "Environment & Science",
    title: "Coastal Guardians: Why Mangrove Forests Matter",
    titleAr: "حراس السواحل: أهمية غابات المانغروف (القرم)",
    recommendedMinutes: 6,
    paragraphs: [
      "Where shallow warm seawater meets muddy desert coastlines, knotted green mangrove trees perform quiet engineering work every tide cycle. Unlike ordinary land trees that perish quickly in saltwater, mangroves filter excess salt through specialized roots and glossy leaves.",
      "Marine biologists have observed that submerged mangrove roots create calm nursery shelters for young fish, crabs, and wading birds. Meanwhile, dense root networks absorb wave force during winter storms, protecting low-lying shoreline roads from gradual erosion.",
      "Encouragingly, youth volunteer teams across Kuwait Bay and neighboring coasts have partnered with researchers to map nursery beds and plant hardy native seedlings—proving that small consistent restoration steps accumulate into measurable coastline resilience.",
    ],
    extractedVocab: [
      {
        word: "erosion",
        meaningAr: "التآكل الساحلي / الانجراف",
        definition: "The gradual wearing away of soil or rock by waves, wind, or rain.",
      },
      {
        word: "restoration",
        meaningAr: "إعادة التأهيل / الترميم البيئي",
        definition: "Returning a damaged ecosystem back toward healthy condition.",
      },
    ],
    questions: [
      {
        id: "rb1-1",
        focus: "detail",
        prompt: "How do mangroves survive in salty coastal water where ordinary trees die?",
        options: [
          "They grow far inland away from all water.",
          "Specialized roots and glossy leaves filter excess salt.",
          "They freeze in winter.",
          "Divers water them daily with bottled freshwater.",
        ],
        correctIndex: 1,
        explanation: "Paragraph 1 states specialized roots and leaves filter out excess salt.",
      },
      {
        id: "rb1-2",
        focus: "main_idea",
        prompt: "What dual role do mangrove roots play according to Paragraph 2?",
        options: [
          "Raising waves and scaring fish",
          "Sheltering young sea life and dampening wave erosion",
          "Blocking boats completely",
          "Heating coastal roads",
        ],
        correctIndex: 1,
        explanation: "Roots serve as nurseries for marine life and wave buffers against erosion.",
      },
      {
        id: "rb1-3",
        focus: "inference",
        prompt: "What tone does the final paragraph take toward youth restoration volunteers?",
        options: [
          "Optimistic and appreciative",
          "Skeptical and dismissive",
          "Indifferent",
          "Angry",
        ],
        correctIndex: 0,
        explanation:
          "Words like 'Encouragingly' and 'measurable coastline resilience' signal clear optimism.",
      },
    ],
  },
  {
    id: "read-b2-spotting-headlines",
    level: "B2",
    genre: "Editorial",
    topic: "Media Literacy & Critical Thinking",
    title: "The Slow Reader in an Instant Headline Era",
    titleAr: "القارئ المتأني في عصر العناوين السريعة (B2)",
    recommendedMinutes: 7,
    paragraphs: [
      "Headline writers face an unforgiving constraint: capture crowded attention in eight dramatic words. Consequently, subtle scientific findings—such as a small correlation observed in forty volunteers over two weeks—often get compressed online into sweeping declarations that 'coffee changes your brain forever.'",
      "Critical readers resist sharing claims on headline impulse alone. Before trusting an alarming or miraculous post, pause to ask three rapid triage questions: Who funded or conducted the original work? How large was the sample? Did the authors claim causation, or merely an early correlation?",
      "Far from making us cynical, slow verification preserves genuine wonder. When a genuinely remarkable discovery holds up under sample size and peer critique, we appreciate it all the more deeply.",
    ],
    extractedVocab: [
      {
        word: "sweeping",
        meaningAr: "شامل ومبالغ فيه / تعميم كاسح",
        definition: "Broad and overly general without careful exceptions.",
      },
      {
        word: "triage",
        meaningAr: "فرز أولي سريع",
        definition: "Quickly sorting priorities or checking critical criteria first.",
      },
    ],
    questions: [
      {
        id: "rb2-1",
        focus: "main_idea",
        prompt: "What is the author's primary advice to readers seeing viral science posts?",
        options: [
          "Never read online articles at all.",
          "Check sample size, source, and correlation vs causation before sharing.",
          "Only trust eight-word headlines.",
          "Become cynical about all science.",
        ],
        correctIndex: 1,
        explanation:
          "Paragraph 2 details three verification checks before trusting or sharing claims.",
      },
      {
        id: "rb2-2",
        focus: "vocab_in_context",
        prompt: "What does 'compressed into sweeping declarations' imply in Paragraph 1?",
        options: [
          "Carefully nuanced data gets oversimplified into exaggerated claims.",
          "Text files become smaller PDFs.",
          "Forty volunteers wrote headlines.",
          "Readers read every footnote slowly.",
        ],
        correctIndex: 0,
        explanation: "Shows how nuance shrinks into exaggerated certainty for clicks.",
      },
      {
        id: "rb2-3",
        focus: "inference",
        prompt: "Why does the author say verification 'preserves genuine wonder'?",
        options: [
          "Checking facts wastes hours.",
          "Separating hype from verified truth lets real breakthroughs stand out credibly.",
          "Headlines never need editors.",
          "Small studies are always useless.",
        ],
        correctIndex: 1,
        explanation:
          "Distinguishing hype from real findings deepens appreciation for verified science.",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* 4. WRITING ACADEMY DATA                                                    */
/* -------------------------------------------------------------------------- */

export interface WritingTask {
  id: string;
  taskType:
    | "sentence_construction"
    | "paragraph"
    | "informal_message"
    | "formal_email"
    | "descriptive"
    | "narrative"
    | "opinion_essay"
    | "summary";
  typeLabel: string;
  level: CefrExtendedBand;
  title: string;
  titleAr: string;
  prompt: string;
  minWords: number;
  maxWords: number;
  targetFeatures: string[];
  requiredKeywords: string[];
  checklist: string[];
  exampleOpening: string;
}

export const WRITING_TASKS: WritingTask[] = [
  {
    id: "wrt-pre-sentences",
    taskType: "sentence_construction",
    typeLabel: "Sentence Construction",
    level: "Pre-A1",
    title: "Introduce Yourself & Your Favourite Subject",
    titleAr: "كتابة جمل بسيطة للتعريف بالنفس والمادة المفضلة",
    prompt:
      "Write 3–4 clear simple sentences introducing your name, age or grade, favourite school subject, and one daily habit.",
    minWords: 20,
    maxWords: 55,
    targetFeatures: [
      "Capital letter at start of every sentence",
      "Clear period (.) ending each sentence",
      "Accurate 'am / is / like' verbs",
    ],
    requiredKeywords: ["my", "i"],
    checklist: [
      "Started every sentence with a capital letter",
      "Ended each sentence with a full stop",
      "Used 'a / an' accurately if mentioning singular nouns",
    ],
    exampleOpening: "Hello! My name is Tariq. I am in Grade 9. My favourite subject is Science...",
  },
  {
    id: "wrt-a1-message",
    taskType: "informal_message",
    typeLabel: "Informal Message",
    level: "A1",
    title: "Invite a Friend to a Weekend Study Group",
    titleAr: "رسالة ودية لدعوة صديق لمجموعة مذاكرة",
    prompt:
      "Write a friendly message to your classmate inviting them to review English vocabulary at the library on Saturday. Mention time, place, and what to bring.",
    minWords: 35,
    maxWords: 75,
    targetFeatures: [
      "Warm opening greeting",
      "Specific time and location",
      "Polite closing sign-off",
    ],
    requiredKeywords: ["saturday", "library"],
    checklist: [
      "Warm friendly greeting ('Hi ...')",
      "Exact place ('library') and time",
      "Friendly ending ('See you soon!')",
    ],
    exampleOpening:
      "Hi Omar, how are you? Would you like to meet at the public library this Saturday at 10:00 AM?",
  },
  {
    id: "wrt-a2-descriptive",
    taskType: "descriptive",
    typeLabel: "Descriptive Paragraph",
    level: "A2",
    title: "Describe a Nutritious Traditional Meal (Unit 3)",
    titleAr: "فقرة وصفية عن وجبة تقليدية صحية (ربط الوحدة 3)",
    prompt:
      "Describe your favourite wholesome homemade dish. Use sensory adjectives (fresh, aromatic, crispy) and explain why it is healthy for students.",
    minWords: 55,
    maxWords: 110,
    targetFeatures: [
      "Clear topic sentence",
      "Sensory adjectives + Grade 9 vocabulary",
      "Concluding health takeaway",
    ],
    requiredKeywords: ["fresh", "healthy"],
    checklist: [
      "Included clear opening topic sentence",
      "Used descriptive adjectives (e.g., aromatic, homemade, fresh)",
      "Closed with a concluding sentence",
    ],
    exampleOpening:
      "Homemade lentil soup with fresh herbs is one of the most nourishing meals on our family table.",
  },
  {
    id: "wrt-a2-narrative",
    taskType: "narrative",
    typeLabel: "Short Narrative",
    level: "A2",
    title: "A Day a Mistake Taught Me Something Valuable",
    titleAr: "قصة قصيرة: يوم علّمني فيه خطأ درساً مهماً",
    prompt:
      "Narrate a short true or realistic school story using Past Simple verbs and sequence connectors ('First,', 'Suddenly,', 'Finally,').",
    minWords: 60,
    maxWords: 120,
    targetFeatures: [
      "Consistent Past Simple verbs",
      "Time sequence transitions",
      "Clear lesson learned at end",
    ],
    requiredKeywords: ["first", "finally"],
    checklist: [
      "Stayed consistently in Past Simple tense",
      "Used at least 2 sequence words (First, Then, Finally)",
      "Ended with a clear reflection",
    ],
    exampleOpening:
      "Last month, I almost forgot to prepare my science slides before the morning assembly.",
  },
  {
    id: "wrt-b1-formal-email",
    taskType: "formal_email",
    typeLabel: "Formal Email",
    level: "B1",
    title: "Email a Principal Proposing a Reading Corner",
    titleAr: "رسالة بريد إلكتروني رسمية لاقتراح ركن قراءة مدرسي",
    prompt:
      "Write a polite, well-structured email to your school principal requesting space for a weekly English Reading Corner. Give 2 practical benefits and offer student help.",
    minWords: 75,
    maxWords: 140,
    targetFeatures: [
      "Respectful salutation ('Dear Principal...')",
      "Clear purpose in line 1",
      "Formal connectors ('Furthermore,', 'Moreover,') & sign-off",
    ],
    requiredKeywords: ["dear", "reading"],
    checklist: [
      "Formal greeting & clear first-sentence purpose",
      "At least 2 supporting student benefits",
      "Polite closing ('Sincerely, / Best regards,')",
    ],
    exampleOpening:
      "Dear Principal Al-Mutairi, I am writing to kindly propose setting up a quiet Friday English Reading Corner in Room 8.",
  },
  {
    id: "wrt-b2-opinion-essay",
    taskType: "opinion_essay",
    typeLabel: "Opinion Essay",
    level: "B2",
    title: "Should Handwritten Note-Taking Stay Part of Digital Classrooms?",
    titleAr: "مقال رأي متوازن: التدوين اليدوي في الفصول الرقمية (B2)",
    prompt:
      "Write a persuasive 2-paragraph essay taking a clear stance. Include at least one concession ('Although / While...') addressing the opposite view plus concrete reasoning.",
    minWords: 95,
    maxWords: 190,
    targetFeatures: [
      "Clear thesis claim",
      "Concession clause ('Although / While')",
      "Formal transition markers ('However,', 'Consequently,')",
    ],
    requiredKeywords: ["although", "because"],
    checklist: [
      "Clear thesis stated early",
      "Included fair counterargument/concession ('Although' or 'While')",
      "Supported position with a concrete academic example",
    ],
    exampleOpening:
      "Although tablets allow students to search and organize files rapidly, handwritten summaries remain essential for deep conceptual retention.",
  },
  {
    id: "wrt-c1-summary",
    taskType: "summary",
    typeLabel: "Academic Paraphrase & Summary",
    level: "C1",
    title: "Summarize Solar Desalination Findings Concisely",
    titleAr: "تلخيص وإعادة صياغة أكاديمية دقيقة (C1)",
    prompt:
      "Summarize in 60–110 words why Gulf coastal engineers combine solar panels with membrane desalination—while noting two remaining maintenance challenges (dust and overnight storage).",
    minWords: 55,
    maxWords: 115,
    targetFeatures: [
      "Neutral objective academic tone",
      "Concise paraphrasing without filler",
      "Accurately includes both benefit and limitations",
    ],
    requiredKeywords: ["solar", "dust", "storage"],
    checklist: [
      "Maintained neutral academic tone (no 'I think' filler)",
      "Mentioned lower fossil fuel usage",
      "Accurately noted both dust and energy storage challenges",
    ],
    exampleOpening:
      "Pairing solar-powered generation with modern membrane desalination reduces fossil-fuel dependence, yet desert implementation faces two practical obstacles...",
  },
];

/* -------------------------------------------------------------------------- */
/* 5. VOCABULARY ACADEMY TOPICS (PLUS GRADE 9 UNIT 3 BRIDGE)                 */
/* -------------------------------------------------------------------------- */

export interface VocabAcademyWord {
  id: string;
  word: string;
  partOfSpeech: string;
  phonetic: string;
  cefr: CefrExtendedBand;
  meaningAr: string;
  definitionEn: string;
  exampleEn: string;
  collocations: string[];
  wordFamily: string[];
  synonyms: string[];
  antonyms: string[];
  quizBlankSentence: string;
}

export interface VocabAcademyTopic {
  id: string;
  title: string;
  titleAr: string;
  cefr: CefrExtendedBand;
  description: string;
  words: VocabAcademyWord[];
}

export const VOCAB_ACADEMY_TOPICS: VocabAcademyTopic[] = [
  {
    id: "vt-pre-everyday",
    title: "Core Everyday Foundations",
    titleAr: "أساسيات الحياة اليومية والدراسة",
    cefr: "Pre-A1",
    description: "Essential verbs, study tools, and daily words every beginner uses immediately.",
    words: [
      {
        id: "vw-morning",
        word: "schedule",
        partOfSpeech: "noun",
        phonetic: "/ˈskedʒ.uːl/",
        cefr: "A1",
        meaningAr: "جدول مواعيد / برنامج يومي",
        definitionEn: "A clear plan listing activities and the times they take place.",
        exampleEn: "Checking my morning schedule helps me arrive at class calm and prepared.",
        collocations: ["daily schedule", "study schedule", "on schedule"],
        wordFamily: ["schedule (verb)", "scheduled (adj)"],
        synonyms: ["timetable", "plan"],
        antonyms: ["chaos", "disorder"],
        quizBlankSentence:
          "Write every homework deadline inside your weekly ___ so nothing is forgotten.",
      },
      {
        id: "vw-practice",
        word: "practice",
        partOfSpeech: "noun / verb",
        phonetic: "/ˈpræk.tɪs/",
        cefr: "Pre-A1",
        meaningAr: "تدرّب / ممارسة منتظمة",
        definitionEn: "Doing an activity repeatedly in order to improve skill and speed.",
        exampleEn: "Ten minutes of daily speaking practice beats three hours right before exams.",
        collocations: ["daily practice", "put into practice"],
        wordFamily: ["practise (BrE verb)", "practical (adj)"],
        synonyms: ["training", "rehearsal"],
        antonyms: ["neglect"],
        quizBlankSentence: "Listening gets noticeably easier with fifteen minutes of daily ___.",
      },
      {
        id: "vw-focus",
        word: "concentrate",
        partOfSpeech: "verb",
        phonetic: "/ˈkɒn.sən.treɪt/",
        cefr: "A1",
        meaningAr: "يركّز انتباهه",
        definitionEn: "To direct all your attention toward one task without distraction.",
        exampleEn: "Turning off phone alerts lets students concentrate deeply on reading.",
        collocations: ["concentrate on", "deeply concentrate"],
        wordFamily: ["concentration (noun)", "concentrated (adj)"],
        synonyms: ["focus", "attend"],
        antonyms: ["wander", "distract"],
        quizBlankSentence: "Quiet rooms make it far easier to ___ on difficult math problems.",
      },
      {
        id: "vw-library",
        word: "borrow",
        partOfSpeech: "verb",
        phonetic: "/ˈbɒr.əʊ/",
        cefr: "A1",
        meaningAr: "يستعير",
        definitionEn: "To take and use something temporarily with permission before returning it.",
        exampleEn: "Students can borrow three English storybooks each week using their card.",
        collocations: ["borrow a book", "borrow notes"],
        wordFamily: ["borrowing (noun)", "borrower (noun)"],
        synonyms: ["loan (receive)", "check out"],
        antonyms: ["lend", "return"],
        quizBlankSentence:
          "Remember to return the dictionary you ___ from the librarian last Monday.",
      },
      {
        id: "vw-polite",
        word: "polite",
        partOfSpeech: "adjective",
        phonetic: "/pəˈlaɪt/",
        cefr: "A1",
        meaningAr: "مهذّب / لبق",
        definitionEn: "Showing respectful manners and consideration when speaking to others.",
        exampleEn:
          "Using 'please' and 'thank you' keeps classroom discussions polite and welcoming.",
        collocations: ["polite request", "polite reply"],
        wordFamily: ["politely (adv)", "politeness (noun)"],
        synonyms: ["courteous", "respectful"],
        antonyms: ["rude", "impolite"],
        quizBlankSentence:
          "'Could you open the window?' is much more ___ than just shouting 'Open it!'",
      },
    ],
  },
  {
    id: "vt-b1-science-study",
    title: "Academic Study & Science Verbs",
    titleAr: "المفردات الأكاديمية والعلوم (B1)",
    cefr: "B1",
    description: "High-leverage academic terms for school essays, lab reports, and presentations.",
    words: [
      {
        id: "vw-evidence",
        word: "evidence",
        partOfSpeech: "noun",
        phonetic: "/ˈev.ɪ.dəns/",
        cefr: "B1",
        meaningAr: "دليل / برهان",
        definitionEn: "Facts, measurements, or examples that help prove whether an idea is true.",
        exampleEn: "Strong essays support every main claim with concrete evidence.",
        collocations: ["clear evidence", "supporting evidence", "based on evidence"],
        wordFamily: ["evident (adj)", "evidently (adv)"],
        synonyms: ["proof", "data"],
        antonyms: ["guesswork"],
        quizBlankSentence:
          "Look inside the passage for textual ___ before choosing your inference answer.",
      },
      {
        id: "vw-compare",
        word: "contrast",
        partOfSpeech: "noun / verb",
        phonetic: "/ˈkɒn.trɑːst/",
        cefr: "B1",
        meaningAr: "تباين / يقارن الاختلاف",
        definitionEn: "To examine clear differences between two ideas, solutions, or systems.",
        exampleEn: "The report contrasts solar cooling costs with traditional grid power.",
        collocations: ["sharp contrast", "by contrast", "compare and contrast"],
        wordFamily: ["contrasting (adj)"],
        synonyms: ["differentiate", "distinguish"],
        antonyms: ["resemble", "match"],
        quizBlankSentence:
          "Use 'however' or 'whereas' to signal a sharp ___ between two viewpoints.",
      },
      {
        id: "vw-durable",
        word: "durable",
        partOfSpeech: "adjective",
        phonetic: "/ˈdjʊə.rə.bəl/",
        cefr: "B1",
        meaningAr: "متين / طويل العمر",
        definitionEn: "Built strongly enough to resist wear and last cleanly for years.",
        exampleEn: "Desert solar panels need durable glass coatings against heat and wind.",
        collocations: ["durable materials", "durable battery"],
        wordFamily: ["durability (noun)", "endure (verb)"],
        synonyms: ["sturdy", "long-lasting"],
        antonyms: ["fragile", "weak"],
        quizBlankSentence: "Reusable steel bottles are far more ___ than thin plastic cups.",
      },
      {
        id: "vw-collaborate",
        word: "collaborate",
        partOfSpeech: "verb",
        phonetic: "/kəˈlæb.ə.reɪt/",
        cefr: "B1",
        meaningAr: "يتعاون مع آخرين في مشروع",
        definitionEn: "To work jointly with teammates toward a shared academic or creative goal.",
        exampleEn: "Four students collaborated to build the water-sensor prototype.",
        collocations: ["collaborate on", "collaborate closely"],
        wordFamily: ["collaboration (noun)", "collaborative (adj)"],
        synonyms: ["cooperate", "partner"],
        antonyms: ["compete", "isolate"],
        quizBlankSentence:
          "Our science and English clubs will ___ on an environmental poster fair.",
      },
      {
        id: "vw-summarize",
        word: "summarise",
        partOfSpeech: "verb",
        phonetic: "/ˈsʌm.ə.raɪz/",
        cefr: "B1",
        meaningAr: "يلخّص الأفكار الأساسية",
        definitionEn:
          "To state the most important points briefly in your own words (British spelling).",
        exampleEn: "Take two minutes after reading to summarise each paragraph in one clean line.",
        collocations: ["summarise findings", "briefly summarise"],
        wordFamily: ["summary (noun)"],
        synonyms: ["recap", "condense"],
        antonyms: ["elaborate", "ramble"],
        quizBlankSentence:
          "At the end of the talk, please ___ our three recommendations in 30 seconds.",
      },
    ],
  },
  {
    id: "vt-b2c1-collocations",
    title: "Phrasal Verbs, Collocations & Academic Nuance",
    titleAr: "الأفعال المركبة والمتلازمات اللفظية الدقيقة (B2–C1)",
    cefr: "B2",
    description: "Natural English phrasing, phrasal verbs, and high-level discourse words.",
    words: [
      {
        id: "vw-carryout",
        word: "carry out",
        partOfSpeech: "phrasal verb",
        phonetic: "/ˈkær.i aʊt/",
        cefr: "B1",
        meaningAr: "ينفّذ (تجربة / خطة / بحثاً)",
        definitionEn: "To conduct, perform, or complete an experiment, survey, or plan.",
        exampleEn: "Students carried out a week-long water-conservation audit at school.",
        collocations: ["carry out research", "carry out an experiment"],
        wordFamily: ["conduct", "execute"],
        synonyms: ["perform", "conduct"],
        antonyms: ["abandon", "cancel"],
        quizBlankSentence:
          "Before publishing, biologists ___ three repeat trials to confirm reliability.",
      },
      {
        id: "vw-figureout",
        word: "figure out",
        partOfSpeech: "phrasal verb",
        phonetic: "/ˈfɪɡ.ər aʊt/",
        cefr: "B1",
        meaningAr: "يستنتج / يكتشف الحل",
        definitionEn: "To solve or finally understand a problem after thinking carefully.",
        exampleEn: "Together, the team figured out why the circuit voltage dropped.",
        collocations: ["figure out how", "figure out a solution"],
        wordFamily: ["solve", "decipher"],
        synonyms: ["work out", "resolve"],
        antonyms: ["misread"],
        quizBlankSentence:
          "Read the context clues carefully to ___ out the meaning of an unfamiliar word.",
      },
      {
        id: "vw-coherent",
        word: "coherent",
        partOfSpeech: "adjective",
        phonetic: "/kəʊˈhɪə.rənt/",
        cefr: "B2",
        meaningAr: "مترابط ومنسجم الأفكار",
        definitionEn: "Logical, consistent, and easy to follow from start to finish.",
        exampleEn: "Transition markers give a multi-paragraph essay a coherent flow.",
        collocations: ["coherent argument", "coherent structure"],
        wordFamily: ["coherence (noun)", "coherently (adv)"],
        synonyms: ["logical", "unified"],
        antonyms: ["scattered", "chaotic"],
        quizBlankSentence:
          "Every essay needs a ___ thread connecting the thesis to its conclusion.",
      },
      {
        id: "vw-compelling",
        word: "compelling",
        partOfSpeech: "adjective",
        phonetic: "/kəmˈpel.ɪŋ/",
        cefr: "C1",
        meaningAr: "مُقنع وجذّاب",
        definitionEn:
          "Evoking strong interest or convincing agreement through vivid force and clarity.",
        exampleEn:
          "Her clean pilot data made a compelling case for expanding the courtyard garden.",
        collocations: ["compelling argument", "compelling evidence"],
        wordFamily: ["compel (verb)"],
        synonyms: ["persuasive", "convincing"],
        antonyms: ["weak", "unconvincing"],
        quizBlankSentence:
          "Combining real local examples with clear numbers creates a ___ presentation.",
      },
      {
        id: "vw-mitigate",
        word: "mitigate",
        partOfSpeech: "verb",
        phonetic: "/ˈmɪt.ɪ.ɡeɪt/",
        cefr: "C1",
        meaningAr: "يخفّف من حدة (مشكلة أو خطر)",
        definitionEn: "To make something harmful, severe, or painful less intense or damaging.",
        exampleEn: "Coastal mangrove belts mitigate storm-surge damage along vulnerable bays.",
        collocations: ["mitigate risk", "mitigate impact"],
        wordFamily: ["mitigation (noun)"],
        synonyms: ["reduce", "alleviate", "ease"],
        antonyms: ["aggravate", "worsen"],
        quizBlankSentence:
          "Shaded walkways help ___ extreme midday courtyard heat during May exams.",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* 6. SYSTEMATIC GRAMMAR ACADEMY (14 FULL TOPICS COVERING ALL SYLLABUS AREAS) */
/* -------------------------------------------------------------------------- */

export interface GrammarTopic {
  id: string;
  title: string;
  titleAr: string;
  cefr: CefrExtendedBand;
  summary: string;
  rules: string[];
  commonPitfall: string;
  examples: Array<{ ok: string; fixFrom?: string }>;
  exercises: LessonExercise[];
}

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    id: "grm-parts-of-speech",
    title: "Parts of Speech & Word Roles",
    titleAr: "أقسام الكلام ووظيفة كل كلمة في الجملة",
    cefr: "Pre-A1",
    summary:
      "Identify nouns, pronouns, verbs, adjectives, and adverbs by how they behave inside sentences.",
    rules: [
      "Nouns name people, places, or things ('library', 'flavour'); Pronouns replace nouns ('she', 'they', 'it').",
      "Verbs show action or state ('reflect', 'is'); Adjectives describe nouns ('aromatic soup'); Adverbs describe verbs or adjectives ('commonly served', 'very warm').",
    ],
    commonPitfall:
      "Putting an adjective where an adverb is needed: say 'She speaks clearly', not 'She speaks clear.'",
    examples: [
      { ok: "The careful student reads slowly.", fixFrom: "The careful student reads slow." },
    ],
    exercises: [
      {
        id: "gp1",
        kind: "mcq",
        prompt: "What part of speech is the bold word: 'Cardamom adds a **warm** scent.'?",
        options: ["Verb", "Noun", "Adjective", "Adverb"],
        correctIndex: 2,
        hint: "It describes the noun 'scent'.",
        explanation: "Words modifying nouns ('warm scent') are adjectives.",
      },
      {
        id: "gp2",
        kind: "fill_blank",
        prompt:
          "Convert 'careful' into an adverb: 'Please check your essay ___ before submitting.'",
        acceptedAnswers: ["carefully"],
        hint: "Add -ly to the adjective.",
        explanation: "Verbs ('check') are modified by adverbs ('carefully').",
      },
    ],
  },
  {
    id: "grm-nouns-articles",
    title: "Nouns, Countability & Articles (a / an / the)",
    titleAr: "الأسماء المعدودة وغير المعدودة وأدوات التعريف والتنكير",
    cefr: "A1",
    summary:
      "Master singular vs plural nouns, uncountable essentials ('advice', 'information'), and exact use of a/an/the.",
    rules: [
      "Use 'a' before consonant sounds ('a university'), 'an' before vowel sounds ('an hour', 'an apple').",
      "Use 'the' when both listener and speaker know the exact item or it was already mentioned.",
      "Uncountable nouns ('information', 'homework', 'advice', 'fibre') NEVER take 'a/an' or '-s' plural!",
    ],
    commonPitfall:
      "Arabic allows plural 'أخبار / نصائح / واجبات', so never write 'informations' or 'an advice'—use 'some advice' or 'pieces of advice'.",
    examples: [
      { ok: "She gave me helpful advice.", fixFrom: "She gave me an helpful advice / advices." },
    ],
    exercises: [
      {
        id: "gna1",
        kind: "mcq",
        prompt: "Choose the accurate sentence:",
        options: [
          "He shared useful informations about the quiz.",
          "He shared useful information about the quiz.",
          "He shared an useful information.",
          "He shared a useful informations.",
        ],
        correctIndex: 1,
        hint: "'information' is uncountable in English.",
        explanation: "Uncountable 'information' has no plural -s and no 'a/an'.",
      },
      {
        id: "gna2",
        kind: "fill_blank",
        prompt: "Insert a / an / the: 'It took ___ hour to finish the full writing revision.'",
        acceptedAnswers: ["an"],
        hint: "'h' in 'hour' is silent—first sound is /aʊ/.",
        explanation:
          "Articles follow spoken SOUND, not spelling: silent 'h' starts with a vowel sound -> 'an hour'.",
      },
    ],
  },
  {
    id: "grm-pronouns-determiners",
    title: "Pronouns, Possessives & Demonstratives",
    titleAr: "الضمائر وصفات الملكية وضمائر الملكية",
    cefr: "A1",
    summary:
      "Distinguish subject/object pronouns (he/him), possessive adjectives (their/its), and standalone pronouns (theirs).",
    rules: [
      "Subject pronouns act before the verb ('They organized...'); Object pronouns receive action ('...helped them').",
      "Never confuse 'its' (possessive: 'its colour') with 'it's' ('it is / it has') or 'their' vs 'there'.",
    ],
    commonPitfall: "Writing 'Me and Omar went' as the subject—say 'Omar and I went.'",
    examples: [{ ok: "The garden lost its leaves, and it's growing back now." }],
    exercises: [
      {
        id: "gpr1",
        kind: "mcq",
        prompt: "Pick the accurate possessive form:",
        options: [
          "That green notebook is your's.",
          "The library updated it's website.",
          "The cat washed its paws carefully.",
          "Their going to the debate hall.",
        ],
        correctIndex: 2,
        hint: "Possessive pronouns ('its', 'yours', 'theirs') never use apostrophes.",
        explanation: "'its' (without apostrophe) shows possession cleanly.",
      },
    ],
  },
  {
    id: "grm-adj-adv-comp",
    title: "Adjectives, Adverbs & Comparatives / Superlatives",
    titleAr: "الصفات والظروف والمقارنة والتفضيل",
    cefr: "A2",
    summary:
      "Compare cleanly with -er/more, -est/most, as...as, and irregular pairs (good -> better -> best).",
    rules: [
      "Short 1-syllable adjectives add -er/-est ('faster / the fastest'); 2+ syllables use 'more / the most' ('more organized / the most compelling').",
      "NEVER double-mark a comparative ('more faster' is incorrect!).",
    ],
    commonPitfall: "Avoid 'more easier' or 'more better'—use 'easier' and 'better'.",
    examples: [
      {
        ok: "Listening at 0.85x speed is easier for beginners.",
        fixFrom: "Listening is more easier.",
      },
    ],
    exercises: [
      {
        id: "gac1",
        kind: "sentence_fix",
        prompt:
          "Correct the error: 'Reading daily is more better than cramming once.' (Type single correct word for 'more better')",
        acceptedAnswers: ["better"],
        hint: "Comparative of good.",
        explanation: "Never combine 'more' with irregular 'better'.",
      },
      {
        id: "gac2",
        kind: "mcq",
        prompt: "Select the accurate superlative:",
        options: [
          "This is the most clearest explanation yet.",
          "This is the clearest explanation yet.",
          "This is clearest than yesterday.",
          "This is more clearest.",
        ],
        correctIndex: 1,
        hint: "1-syllable 'clear' -> 'the clearest'.",
        explanation: "'the clearest' needs no extra 'most'.",
      },
    ],
  },
  {
    id: "grm-present-tenses",
    title: "Present Simple vs. Present Continuous vs. Present Perfect",
    titleAr: "أزمنة المضارع: البسيط والمستمر والتام",
    cefr: "A2",
    summary:
      "Separate timeless habits, actions happening right now, and past experience connected to now.",
    rules: [
      "Present Simple = habits & facts ('Water boils at 100°C.').",
      "Present Continuous (am/is/are + V-ing) = happening right now or temporary plans ('I am revising Unit 3 right now.').",
      "Present Perfect (have/has + V3) = experience/recent completion with present relevance ('She has mastered 12 words so far.').",
    ],
    commonPitfall:
      "Stative verbs ('know', 'belong', 'understand', 'want') normally avoid -ing ('I understand now', not 'I am understanding').",
    examples: [
      {
        ok: "Right now, Nadia is practicing pronunciation, though she usually reads in the morning.",
      },
    ],
    exercises: [
      {
        id: "gpt1",
        kind: "mcq",
        prompt: "Choose the sentence matching a habit vs right-now contrast:",
        options: [
          "Usually Tariq writes notes, but today he records audio.",
          "Usually Tariq is writing notes, but today he record audio.",
          "Usually Tariq writes notes, but right now he is recording audio.",
          "Usually Tariq wrote notes right now.",
        ],
        correctIndex: 2,
        hint: "'Usually' -> Present Simple; 'right now' -> Present Continuous.",
        explanation:
          "'writes' (habit) + 'is recording' (right now) matches English aspect cleanly.",
      },
    ],
  },
  {
    id: "grm-past-future",
    title: "Past Tenses (Simple / Continuous) & Future Forms",
    titleAr: "أزمنة الماضي وأساليب المستقبل (will / going to)",
    cefr: "A2",
    summary:
      "Narrate past background scenes ('was studying when the bell rang') and express future plans vs instant decisions.",
    rules: [
      "Past Continuous (was/were + V-ing) = longer background action interrupted by a short Past Simple action ('While I was reading, my friend knocked.').",
      "Use 'going to' for plans decided before speaking; use 'will' for spontaneous offers, promises, and predictions.",
    ],
    commonPitfall:
      "Never use 'will' inside an 'if/when' time clause about the future ('When she arrives', NOT 'When she will arrive').",
    examples: [{ ok: "While they were testing the solar fan, the clouds cleared." }],
    exercises: [
      {
        id: "gpf1",
        kind: "fill_blank",
        prompt:
          "Complete the background interruption: 'I ___ (walk) home when it suddenly started to rain.'",
        acceptedAnswers: ["was walking"],
        hint: "Past Continuous for the longer ongoing background action.",
        explanation: "'was walking' pairs naturally with short interruption 'started'.",
      },
    ],
  },
  {
    id: "grm-questions-negation",
    title: "Questions, Negation & Tag Accuracy",
    titleAr: "تكوين الأسئلة والنفي بدقة",
    cefr: "A1",
    summary:
      "Form crisp Wh- questions, negatives with don't/doesn't/didn't, and polite indirect questions.",
    rules: [
      "Remember Auxiliary Inversion in direct questions: 'Where does the club meet?' (NOT 'Where the club meets?').",
      "In indirect polite openings ('Could you tell me where...'), keep normal statement order: 'Could you tell me where the club meets?'",
    ],
    commonPitfall:
      "Keeping verb -ed or -s after didn't/doesn't ('Did you went?' -> wrong; say 'Did you go?').",
    examples: [{ ok: "Could you tell me when the library opens today?" }],
    exercises: [
      {
        id: "gqn1",
        kind: "mcq",
        prompt: "Pick the grammatically accurate question:",
        options: [
          "Did you finished the quiz?",
          "Why he didn't come?",
          "Did you finish the listening quiz?",
          "Could you tell me where is Room 4?",
        ],
        correctIndex: 2,
        hint: "'Did' + subject + base verb ('finish').",
        explanation: "After 'Did', main verb stays base ('finish').",
      },
    ],
  },
  {
    id: "grm-prep-conj",
    title: "Prepositions (in/on/at) & Connectors",
    titleAr: "حروف الجر وأدوات الربط (although / because / despite)",
    cefr: "A2",
    summary:
      "Choose precise time/place prepositions (at 5:00, on Monday, in May) and clear logical conjunctions.",
    rules: [
      "Time triangle: 'at' + exact time ('at 4:30 PM'), 'on' + days/dates ('on Wednesday'), 'in' + months/years/parts of day ('in November', 'in the morning').",
      "'Although' + full clause (subject + verb); 'Despite' + noun phrase or -ing ('Despite the rain, we went').",
    ],
    commonPitfall:
      "Writing 'Despite of'—'despite' NEVER takes 'of' ('In spite of' uses 'of', 'Despite' stands alone!).",
    examples: [{ ok: "Despite the warm weather, the team walked briskly." }],
    exercises: [
      {
        id: "gpc1",
        kind: "mcq",
        prompt:
          "Fill the prepositions: 'The ceremony starts ___ 9:00 AM ___ Saturday ___ November.'",
        options: ["in / at / on", "at / on / in", "on / in / at", "at / in / on"],
        correctIndex: 1,
        hint: "Clock time -> at; Day -> on; Month -> in.",
        explanation: "at 9:00 AM · on Saturday · in November.",
      },
    ],
  },
  {
    id: "grm-modals",
    title: "Modal Verbs (Obligation, Advice & Deduction)",
    titleAr: "الأفعال الناقصة (الضرورة والنصيحة والاستنتاج)",
    cefr: "B1",
    summary:
      "Express advice (should/ought to), strong necessity (must/have to), permission (may/could), and logical deduction (must be / can't be).",
    rules: [
      "All pure modals take bare infinitive WITHOUT 'to' ('She must study', never 'She must to study').",
      "'Mustn't' means forbidden ('Don't do it!'); 'Don't have to' means optional ('It isn't required').",
    ],
    commonPitfall: "Mixing up 'mustn't' (prohibited) vs 'don't have to' (unnecessary).",
    examples: [
      {
        ok: "You don't have to memorize every rare idiom today, but you mustn't skip the core check.",
      },
    ],
    exercises: [
      {
        id: "gmd1",
        kind: "mcq",
        prompt: "Which sentence means something is OPTIONAL (not forbidden)?",
        options: [
          "You mustn't talk in the library.",
          "You don't have to bring a printed copy if you uploaded the PDF.",
          "You cannot enter without an ID.",
          "You should never touch hot glass.",
        ],
        correctIndex: 1,
        hint: "'don't have to' = not necessary.",
        explanation: "'don't have to' clearly signals optional convenience.",
      },
    ],
  },
  {
    id: "grm-conditionals",
    title: "Conditionals (Zero, First, Second, Third & Mixed)",
    titleAr: "الجمل الشرطية بأنواعها (0، 1، 2، 3 والمختلطة)",
    cefr: "B1",
    summary:
      "Express scientific facts, real plans, hypothetical wishes, and past reflections smoothly.",
    rules: [
      "Zero (facts): If + Present, Present. First (real): If + Present, will + V.",
      "Second (unreal present): If + Past, would + V. Third (unreal past): If + had V3, would have V3.",
    ],
    commonPitfall:
      "Putting 'would' inside the 'if' half ('If I would have time...' -> incorrect; say 'If I had time, I would help').",
    examples: [{ ok: "If they had reviewed the unit early, they would have felt calmer." }],
    exercises: [
      {
        id: "gcd1",
        kind: "fill_blank",
        prompt:
          "Complete 2nd Conditional: 'If Omar ___ (have) extra time today, he would join our book club.'",
        acceptedAnswers: ["had"],
        hint: "2nd Conditional uses Past Simple inside the if-clause.",
        explanation: "'If Omar had..., he would join...' fits hypothetical present/future.",
      },
    ],
  },
  {
    id: "grm-passive-voice",
    title: "Passive Voice Across Tenses",
    titleAr: "المبني للمجهول في مختلف الأزمنة",
    cefr: "B2",
    summary:
      "Shift focus smoothly onto experiments, processes, and results using be + past participle (V3).",
    rules: [
      "Formula: [Object becomes subject] + appropriate form of BE + V3 (+ optional 'by agent').",
      "Present: is/are written · Past: was/were built · Present Perfect: has/have been tested · Modal: can be recycled.",
    ],
    commonPitfall:
      "Forgetting the auxiliary 'be' ('The lab built in 2020' -> say 'The lab was built in 2020').",
    examples: [{ ok: "All solar batteries are inspected twice before winter." }],
    exercises: [
      {
        id: "gpv1",
        kind: "mcq",
        prompt: "Select the accurate passive modal sentence:",
        options: [
          "Glass bottles can recycle easily.",
          "Glass bottles can be recycled easily.",
          "Glass bottles are recycling easily.",
          "Glass bottles be recycled.",
        ],
        correctIndex: 1,
        hint: "Modal passive = modal + be + V3.",
        explanation: "'can be recycled' uses 'be' + V3 cleanly.",
      },
    ],
  },
  {
    id: "grm-reported-speech",
    title: "Reported Speech & Backshifting",
    titleAr: "الكلام المنقول وتحويل الأزمنة",
    cefr: "B2",
    summary:
      "Report statements, requests, and questions accurately using tell/say and tense backshift.",
    rules: [
      "'Say' does NOT take a direct person object without 'to' ('He said that...' / 'He told ME that...').",
      "When reporting verb is past ('She explained'), shift tenses back: will -> would, can -> could, am -> was.",
      "Reported questions lose question-inversion: 'He asked where I lived' (NOT 'where did I live').",
    ],
    commonPitfall:
      "Writing 'She told that she was busy'—always insert the listener after 'told' ('She told us that...').",
    examples: [{ ok: "The coach told us that practice would begin promptly at four." }],
    exercises: [
      {
        id: "grs1",
        kind: "mcq",
        prompt: "Direct: 'Why did the bell ring early?' -> Reported accurately:",
        options: [
          "She asked why did the bell ring early.",
          "She asked why the bell had rung early.",
          "She told why the bell rang early.",
          "She asked why had the bell rung early.",
        ],
        correctIndex: 1,
        hint: "Statement word order (no 'did') + past backshift.",
        explanation: "Reported Wh-questions keep Subject + Verb order without 'did'.",
      },
    ],
  },
  {
    id: "grm-relative-clauses",
    title: "Relative Clauses (Defining & Non-Defining)",
    titleAr: "جمل الوصل (المحدِّدة وغير المحدِّدة)",
    cefr: "B2",
    summary: "Combine short choppy sentences gracefully using who, which, that, whose, and where.",
    rules: [
      "Use 'who' for people, 'which' for things, 'where' for places (when 'in which'), 'whose' for possession.",
      "Non-defining clauses give bonus info between commas and CANNOT use 'that' ('Kuwait Towers, which opened in 1979, overlook the bay.').",
    ],
    commonPitfall:
      "Repeating a leftover pronoun at the end ('The book that I bought it yesterday' -> drop 'it'!).",
    examples: [{ ok: "The dictionary that I borrowed yesterday helped me finish my essay." }],
    exercises: [
      {
        id: "grc1",
        kind: "sentence_fix",
        prompt:
          "Type the ONE extra unnecessary word to remove from: 'The student who I met her at the debate won first prize.'",
        acceptedAnswers: ["her"],
        hint: "'who' already stands for the person inside the clause.",
        explanation: "Never keep a shadow pronoun ('her') alongside 'who/which/that'.",
      },
    ],
  },
  {
    id: "grm-sentence-structure",
    title: "Sentence Structures, Variety & Avoiding Run-Ons",
    titleAr: "تنوع تراكيب الجمل (البسيطة والمركبة والمعقدة) وتجنب الجمل السائبة",
    cefr: "B2",
    summary:
      "Balance Simple, Compound (FANBOYS), and Complex sentences while fixing comma splices and fragments.",
    rules: [
      "Simple = 1 independent clause; Compound = 2 independent clauses joined with ', and / , but / , so' or semicolon ';'.",
      "Never join two full sentences with only a comma (comma splice) or omit periods completely (run-on).",
    ],
    commonPitfall:
      "Comma splice: 'I read the passage, I answered the quiz.' -> Fix with ', and' or period/semicolon.",
    examples: [{ ok: "Although the wind rose quickly, the solar sensors remained stable." }],
    exercises: [
      {
        id: "gss1",
        kind: "mcq",
        prompt:
          "Which option fixes the comma splice 'Tariq finished reading, he wrote a summary.'?",
        options: [
          "Tariq finished reading, he wrote.",
          "Tariq finished reading; then he wrote a concise summary.",
          "Tariq finished reading he wrote a summary.",
          "Finished reading, a summary.",
        ],
        correctIndex: 1,
        hint: "Semicolon + transition OR comma + conjunction (', and').",
        explanation: "Using a semicolon cleanly links two related independent clauses.",
      },
    ],
  },
  {
    id: "grm-both-neither",
    title: "Correlative Conjunctions: Both ... and & Neither ... nor",
    titleAr: "أدوات الربط المتلازمة: Both ... and (كِلا ... و) و Neither ... nor (لا ... ولا)",
    cefr: "B1",
    summary:
      "Connect equal ideas affirmatively with 'both ... and' (always plural verb) or negatively with 'neither ... nor' (positive verb agreeing with the closest noun).",
    rules: [
      "'Both A and B' joins two positive ideas together and ALWAYS takes a plural verb: 'Both Sara and Dana ARE ready.' (كِلاهما مستعدتان).",
      "'Neither A nor B' rejects BOTH options and already carries a negative meaning, so NEVER use 'not / didn't / don't' with it: 'Neither Omar nor Ali enjoys noise.' (لا عمر ولا علي).",
      "Subject-Verb Agreement with 'Neither A nor B': the verb ALWAYS agrees with B (the noun closer to the verb): 'Neither the teacher nor the students WERE late.' / 'Neither the students nor the teacher WAS late.'",
      "Parallel Balance: Keep grammar types matched after each word ('both fluent and polite', NOT 'both fluently and polite').",
    ],
    commonPitfall:
      "Never write a double negative ('Neither Ali nor Sami didn't study') and never pair 'Both ... nor' or 'Neither ... or' — keep 'both + and' and 'neither + nor'!",
    examples: [
      {
        ok: "Both reading and listening improve your vocabulary.",
        fixFrom: "Both reading nor listening improves your vocabulary.",
      },
      {
        ok: "Neither the coach nor the players want to cancel training.",
        fixFrom: "Neither the coach nor the players doesn't want to cancel training.",
      },
    ],
    exercises: [
      {
        id: "gbn1",
        kind: "mcq",
        prompt:
          "[Easy] Complete the pair: '___ Ali ___ Tariq enjoy playing football after school.'",
        options: ["Both ... and", "Both ... or", "Neither ... and", "Both ... nor"],
        correctIndex: 0,
        hint: "The plural verb 'enjoy' affirms both people together.",
        explanation:
          "'Both ... and' always pairs 'both' with 'and' to include two items together. («Both ... and» تربط بين شيئين معاً).",
      },
      {
        id: "gbn2",
        kind: "mcq",
        prompt:
          "[Easy] Complete the negative pair: '___ tea ___ coffee is healthy before bedtime.'",
        options: ["Neither ... or", "Neither ... nor", "Both ... nor", "Either ... nor"],
        correctIndex: 1,
        hint: "'Neither' always pairs exclusively with 'nor'.",
        explanation:
          "'Neither' is always paired with 'nor' (لا ... ولا). Never mix 'neither' with 'or'.",
      },
      {
        id: "gbn3",
        kind: "mcq",
        prompt:
          "[Easy-Medium] Choose the correct verb: 'Both my sister and my cousin ___ studying English today.'",
        options: ["is", "was", "are", "has"],
        correctIndex: 2,
        hint: "Subjects joined by 'Both ... and' are always treated as plural.",
        explanation:
          "'Both A and B' always takes a plural verb ('are'). («Both ... and» تأخذ دائماً فعلاً بصيغة الجمع).",
      },
      {
        id: "gbn4",
        kind: "mcq",
        prompt: "[Medium] Avoid double negation: 'I tried both apps, so ___.'",
        options: [
          "neither this one nor that one isn't slow",
          "neither this one nor that one doesn't crash",
          "neither this one nor that one crashed",
          "both this one nor that one crashed",
        ],
        correctIndex: 2,
        hint: "'Neither ... nor' already expresses 'not', so the verb must stay positive.",
        explanation:
          "Using 'crashed' (positive verb form) avoids an incorrect double negative with 'neither ... nor'. (النفي موجود في neither فلا نضيف not للفعل).",
      },
      {
        id: "gbn5",
        kind: "mcq",
        prompt:
          "[Medium] Subject-Verb Agreement: 'Neither Nadia nor her friends ___ seen the science announcement yet.'",
        options: ["has", "have", "is", "was"],
        correctIndex: 1,
        hint: "Look closely at the noun right before the verb ('her friends' — plural).",
        explanation:
          "With 'neither ... nor', the verb agrees with the nearest subject ('her friends' -> 'have'). (الفعل يتبع الفاعل الأقرب إليه).",
      },
      {
        id: "gbn6",
        kind: "mcq",
        prompt:
          "[Medium-Hard] Subject-Verb Agreement: 'Neither the students nor their teacher ___ ready to leave early.'",
        options: ["were", "are", "was", "have been"],
        correctIndex: 2,
        hint: "Focus on the closer subject right next to the blank ('their teacher' — singular).",
        explanation:
          "Because 'their teacher' (singular) sits closest to the verb, singular 'was' is required. («their teacher» مفرد وهي الأقرب للفعل فنختار was).",
      },
      {
        id: "gbn7",
        kind: "mcq",
        prompt: "[Hard] Spot the only completely grammatical sentence:",
        options: [
          "Both Mina and Sara likes classical music.",
          "Neither the bus nor the train are arriving on time, and neither one doesn't stop here.",
          "She speaks both Arabic and English clearly and confidently.",
          "Neither Hassan or Omar remembered to save the link.",
        ],
        correctIndex: 2,
        hint: "Check pair matching ('both ... and' / 'neither ... nor') and subject-verb agreement.",
        explanation:
          "Option C keeps 'both Arabic and English' balanced and grammatically clean without pair mismatch or double negation.",
      },
      {
        id: "gbn8",
        kind: "mcq",
        prompt:
          "[Challenge] Rewrite accurately using 'neither ... nor': 'Khaled did not attend the debate, and his classmates did not attend either.'",
        options: [
          "Neither Khaled nor his classmates didn't attend the debate.",
          "Neither Khaled or his classmates attended the debate.",
          "Neither Khaled nor his classmates attended the debate.",
          "Both Khaled and his classmates didn't attended the debate.",
        ],
        correctIndex: 2,
        hint: "Drop 'did not' when introducing 'neither ... nor' and use positive past simple 'attended'.",
        explanation:
          "'Neither Khaled nor his classmates attended the debate' conveys full past negation cleanly without any extra negative word. (نحذف didn't لأن neither تنفي الجملة كاملة).",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* 7. PRONUNCIATION ACADEMY MODULES                                           */
/* -------------------------------------------------------------------------- */

export interface PronunciationModule {
  id: string;
  title: string;
  titleAr: string;
  focusArea:
    "vowels" | "consonants" | "minimal_pairs" | "word_stress" | "sentence_stress" | "intonation";
  cefr: CefrExtendedBand;
  explanation: string;
  arabicCoaching: string;
  pairs: Array<{
    aWord: string;
    aIpa: string;
    bWord: string;
    bIpa: string;
    contrastNote: string;
  }>;
  repeatPhrase: string;
  listeningDiscrimination: {
    targetWord: string;
    distractorWord: string;
    contextSentence: string;
    prompt: string;
  };
}

export const PRONUNCIATION_MODULES: PronunciationModule[] = [
  {
    id: "pro-p-b",
    title: "Plosive Air Burst: /p/ vs /b/",
    titleAr: "التفريق الواضح بين /p/ المهموسة و /b/ المجهورة",
    focusArea: "consonants",
    cefr: "Pre-A1",
    explanation:
      "/p/ pushes a crisp burst of air from closed lips without throat vibration; /b/ vibrates your throat softly.",
    arabicCoaching:
      "ضع راحة يدك أمام فمك: يجب أن تشعر بدفعة هواء واضحة مع pen و paper ولا تشعر بها مع ben و baby.",
    pairs: [
      {
        aWord: "park",
        aIpa: "/pɑːk/",
        bWord: "bark",
        bIpa: "/bɑːk/",
        contrastNote: "car space vs dog sound",
      },
      {
        aWord: "pear",
        aIpa: "/peə/",
        bWord: "bear",
        bIpa: "/beə/",
        contrastNote: "fruit vs animal",
      },
      { aWord: "cap", aIpa: "/kæp/", bWord: "cab", bIpa: "/kæb/", contrastNote: "hat vs taxi" },
    ],
    repeatPhrase: "Please pack a bright blue pen and a pear.",
    listeningDiscrimination: {
      targetWord: "park",
      distractorWord: "bark",
      contextSentence: "We need to find a shaded place to park our car near the library.",
      prompt: "Listen to the target phrase—which word fits 'find a shaded place to ___ our car'?",
    },
  },
  {
    id: "pro-f-v",
    title: "Upper Teeth Vibration: /f/ vs /v/",
    titleAr: "الفرق بين /f/ المهموسة و /v/ المجهورة بالاهتزاز",
    focusArea: "consonants",
    cefr: "A1",
    explanation:
      "Both rest upper teeth gently on your lower lip, but /v/ turns your voice box ON (vibration).",
    arabicCoaching:
      "حرف v غير موجود في الفصحى؛ المس الشفة السفلى بالأسنان العليا وأصدر اهتزازاً في الحنجرة أثناء النطق.",
    pairs: [
      {
        aWord: "fan",
        aIpa: "/fæn/",
        bWord: "van",
        bIpa: "/væn/",
        contrastNote: "cooling fan vs vehicle",
      },
      {
        aWord: "safe",
        aIpa: "/seɪf/",
        bWord: "save",
        bIpa: "/seɪv/",
        contrastNote: "adjective vs verb",
      },
      {
        aWord: "leaf",
        aIpa: "/liːf/",
        bWord: "leave",
        bIpa: "/liːv/",
        contrastNote: "plant leaf vs depart",
      },
    ],
    repeatPhrase: "Five brave volunteers saved very fresh leaves.",
    listeningDiscrimination: {
      targetWord: "save",
      distractorWord: "safe",
      contextSentence: "Remember to save your essay notes before closing the laptop.",
      prompt: "Which word with voiced /v/ completes 'Remember to ___ your essay notes'?",
    },
  },
  {
    id: "pro-vowels-short-long",
    title: "Short vs. Long Vowels: /ɪ/ vs /iː/",
    titleAr: "الفرق بين الكسرة القصيرة /ɪ/ والمد الطويل /iː/",
    focusArea: "vowels",
    cefr: "A1",
    explanation:
      "/ɪ/ ('ship', 'live', 'bit') is relaxed and brief; /iː/ ('sheep', 'leave', 'beat') tenses the lips longer.",
    arabicCoaching:
      "لا تطِل نطق sit أو live؛ التطويل يحوّلها إلى seat و leave ويغيّر معنى الجملة تماماً.",
    pairs: [
      {
        aWord: "ship",
        aIpa: "/ʃɪp/",
        bWord: "sheep",
        bIpa: "/ʃiːp/",
        contrastNote: "boat vs animal",
      },
      {
        aWord: "live",
        aIpa: "/lɪv/",
        bWord: "leave",
        bIpa: "/liːv/",
        contrastNote: "reside vs depart",
      },
      { aWord: "sit", aIpa: "/sɪt/", bWord: "seat", bIpa: "/siːt/", contrastNote: "verb vs chair" },
    ],
    repeatPhrase: "Please sit in your seat before the sheep leave the ship.",
    listeningDiscrimination: {
      targetWord: "seat",
      distractorWord: "sit",
      contextSentence: "Please take your seat near the front row.",
      prompt: "Which long /iː/ noun completes 'take your ___'?",
    },
  },
  {
    id: "pro-word-stress",
    title: "Multi-Syllable Word Stress Patterns",
    titleAr: "النبر الصوتي في الكلمات متعددة المقاطع",
    focusArea: "word_stress",
    cefr: "A2",
    explanation:
      "English gives ONE primary syllable higher pitch, length, and volume; unstressed vowels soften to gentle /ə/.",
    arabicCoaching:
      "ضع الثقل على المقطع الصحيح؛ مثل: in-GRE-di-ent و a-ro-MA-tic و pho-TO-graphy بدلاً من تشديد كل المقاطع بالتساوي.",
    pairs: [
      {
        aWord: "PREsent (noun)",
        aIpa: "/ˈprez.ənt/",
        bWord: "preSENT (verb)",
        bIpa: "/prɪˈzent/",
        contrastNote: "1st syllable = gift; 2nd = show/give",
      },
      {
        aWord: "REcord (noun)",
        aIpa: "/ˈrek.ɔːd/",
        bWord: "reCORD (verb)",
        bIpa: "/rɪˈkɔːd/",
        contrastNote: "1st syllable = file; 2nd = capture audio",
      },
    ],
    repeatPhrase: "Let's reCORD our best REcord about phoTOgraphy today.",
    listeningDiscrimination: {
      targetWord: "reCORD",
      distractorWord: "REcord",
      contextSentence: "Tap the microphone button when you are ready to record your sentence.",
      prompt:
        "In 'ready to record your sentence', is 'record' stressed on the 2nd syllable (verb) or 1st (noun)?",
    },
  },
  {
    id: "pro-sentence-stress",
    title: "Sentence Rhythm: Content vs. Function Words",
    titleAr: "إيقاع الجملة: إبراز الكلمات المهمة مقابل الأدوات",
    focusArea: "sentence_stress",
    cefr: "B1",
    explanation:
      "English stresses content words (nouns, main verbs, adjectives) while shortening helper words (to, the, and, at).",
    arabicCoaching:
      "لا تنطق كل كلمة بنفس القوة؛ أبرز كلمات المعنى (LIBRARY · THREE · BOOKS) ومرّ سريعاً على الحروف القصيرة.",
    pairs: [
      {
        aWord: "READ the BOOK",
        aIpa: "Strong-weak-Strong",
        bWord: "WALK to SCHOOL",
        bIpa: "Strong-weak-Strong",
        contrastNote: "Alternating rhythmic beats",
      },
    ],
    repeatPhrase: "GOOD MORning, we STUDY ENGlish in the LIBrary EVERY DAY.",
    listeningDiscrimination: {
      targetWord: "library",
      distractorWord: "the",
      contextSentence: "We borrowed three science guides from the library this morning.",
      prompt:
        "Which word carries main sentence stress to tell the listener WHERE the action happened?",
    },
  },
  {
    id: "pro-intonation-connected",
    title: "Rising/Falling Intonation & Connected Linking",
    titleAr: "تنغيم الأسئلة والربط الصوتي بين الكلمات",
    focusArea: "intonation",
    cefr: "B2",
    explanation:
      "Yes/No questions usually rise gently at the end; Wh- questions and confident statements fall cleanly. Final consonants link smoothly onto next vowels ('turn it off' -> 'tur-ni-toff').",
    arabicCoaching:
      "ارفع نبرة الصوت نهاية سؤال Yes/No (هل؟) واخفضها بنهاية سؤال Wh- والخبر الواثق؛ وصل الحرف الساكن الأخير بالمتحرك بعده ليزداد نطقك سلاسة.",
    pairs: [
      {
        aWord: "Yes/No: Ready?",
        aIpa: "↗ Rising pitch",
        bWord: "Wh-: When do we start?",
        bIpa: "↘ Falling pitch",
        contrastNote: "Pitch signals sentence intent",
      },
      {
        aWord: "an orange",
        aIpa: "/əˈnɒr.ɪndʒ/",
        bWord: "check it out",
        bIpa: "/tʃe.kɪ.taʊt/",
        contrastNote: "Smooth C-to-V word linking",
      },
    ],
    repeatPhrase: "Did you check it out at the airport? When does our workshop start?",
    listeningDiscrimination: {
      targetWord: "rising",
      distractorWord: "falling",
      contextSentence: "Could you repeat that slowly, please?",
      prompt:
        "Does a polite Yes/No request ('Could you repeat that slowly?') naturally end with a rising or falling pitch?",
    },
  },
];
