export interface BilingualText {
  en: string;
  ar: string;
}

export interface MartialArtistPrinciple {
  id: string;
  number: number;
  title: BilingualText;
  description: BilingualText;
  dailyPractice: BilingualText;
}

export interface MartialArtDiscipline {
  id: string;
  name: BilingualText;
  category:
    "striking_sport" | "grappling_balance" | "traditional_weapons_sport" | "holistic_tradition";
  origin: BilingualText;
  originNote: BilingualText;
  philosophy: BilingualText;
  trainingFocus: BilingualText;
  trainingEnvironment: BilingualText;
  equipment: BilingualText;
  fitnessAndMentalSkills: BilingualText;
  safetyConsiderations: BilingualText;
  misconceptions: BilingualText;
  ethicalPrinciples: BilingualText;
  references: string[];
  comparison: {
    movementFocus: BilingualText;
    trainingFormat: BilingualText;
    rulesetFocus: BilingualText;
    protectiveGear: BilingualText;
  };
}

export interface DojoLearningPath {
  id: "path_a" | "path_b" | "path_c" | "path_d" | "path_e";
  code: "A" | "B" | "C" | "D" | "E";
  title: BilingualText;
  subtitle: BilingualText;
  safetyNotice?: BilingualText;
  topics: Array<{
    id: string;
    title: BilingualText;
    summary: BilingualText;
    keyTakeaway: BilingualText;
  }>;
}

export interface CharacterPillar {
  id: string;
  title: BilingualText;
  definition: BilingualText;
  reflectionPrompt: BilingualText;
  scenarioQuestion: BilingualText;
  options: Array<{
    en: string;
    ar: string;
    isWise: boolean;
    feedbackEn: string;
    feedbackAr: string;
  }>;
}

export interface BullyingScenario {
  id: string;
  title: BilingualText;
  situation: BilingualText;
  options: Array<{
    id: string;
    label: BilingualText;
    isSafeWise: boolean;
    explanation: BilingualText;
  }>;
}

export interface DojoQuizQuestion {
  id: string;
  level: "foundation" | "intermediate" | "applied";
  kind: "mcq" | "true_false" | "scenario";
  prompt: BilingualText;
  options: Array<{ en: string; ar: string }>;
  correctIndex: number;
  explanation: BilingualText;
}

export const DOJO_MOTTOS = {
  primary: {
    en: "Strength is a responsibility. Discipline is greater than aggression. True martial artists protect, respect, and help others.",
    ar: "القوة مسؤولية. الانضباط أعظم من العدوانية. فنان القتال الحقيقي يحمي ويحترم ويساعد الآخرين.",
  },
  short: {
    en: "Strength With Responsibility.",
    ar: "قوةٌ تقترن بالمسؤولية.",
  },
  banner: {
    en: "Train Your Discipline. Respect Humanity. Protect Through Wisdom.",
    ar: "درّب انضباطك. احترم الإنسانية. احمِ بالحكمة.",
  },
};

export const MARTIAL_ARTIST_CODE_PRINCIPLES: MartialArtistPrinciple[] = [
  {
    id: "p1_respect",
    number: 1,
    title: { en: "Respect Everyone", ar: "احترام الجميع" },
    description: {
      en: "Honor instructors, training partners, classmates, elders, and yourself with courteous words and posture.",
      ar: "احترم المدربين والزملاء وكبار السن ونفسك بالأدب وحسن التعامل.",
    },
    dailyPractice: {
      en: "Greet teachers and classmates politely before asking for help.",
      ar: "ألقِ التحية بأدب قبل طرح الأسئلة أو بدء العمل الجماعي.",
    },
  },
  {
    id: "p2_self_control",
    number: 2,
    title: { en: "Master Self-Control", ar: "إتقان ضبط النفس" },
    description: {
      en: "Calmness under stress shows true mastery; never let anger dictate your tone or actions.",
      ar: "الهدوء عند الغضب هو الإتقان الحقيقي؛ لا تسمح للانفعال أن يوجّه أقوالك أو أفعالك.",
    },
    dailyPractice: {
      en: "Pause for three slow breaths before responding when frustrated.",
      ar: "توقّف لثلاثة أنفاس هادئة قبل الرد عند الشعور بالضيق.",
    },
  },
  {
    id: "p3_humility",
    number: 3,
    title: { en: "Practice Humility", ar: "التواضع في التعلّم" },
    description: {
      en: "Skill never makes anyone superior to others; stay eager to learn from mistakes and feedback.",
      ar: "المهارة لا تجعل أحداً أعلى شأناً من غيره؛ تقبّل النصح وتعلّم من أخطائك.",
    },
    dailyPractice: {
      en: "Thank someone who offers constructive feedback today.",
      ar: "اشكر من يقدّم لك ملاحظة بنّاءة تساعدك على التحسن.",
    },
  },
  {
    id: "p4_patience",
    number: 4,
    title: { en: "Cultivate Patience", ar: "التحلّي بالصبر" },
    description: {
      en: "Lasting coordination, focus, and confidence grow through steady daily effort rather than shortcuts.",
      ar: "التركيز والثبات ينموان بالمداومة اليومية الهادئة لا بالاستعجال.",
    },
    dailyPractice: {
      en: "Complete one challenging study block calmly without rushing.",
      ar: "أنهِ جلسة دراسية صعبة بهدوء دون تسرّع.",
    },
  },
  {
    id: "p5_honesty",
    number: 5,
    title: { en: "Live With Honesty", ar: "الصدق والنزاهة" },
    description: {
      en: "Speak truthfully, admit errors openly, and refuse unfair shortcuts in study or sport.",
      ar: "تحرَّ الصدق، واعترف بالخطأ بشجاعة، وارفض الغش في الدراسة والرياضة.",
    },
    dailyPractice: {
      en: "Keep your promises even on small tasks.",
      ar: "التزم بوعودك حتى في الأمور الصغيرة.",
    },
  },
  {
    id: "p6_responsibility",
    number: 6,
    title: { en: "Accept Responsibility", ar: "تحمّل المسؤولية" },
    description: {
      en: "Own your choices, care for shared spaces, and protect the safety of those around you.",
      ar: "تحمّل تبعات اختياراتك، وحافظ على المكان المشترك، وراعِ سلامة من حولك.",
    },
    dailyPractice: {
      en: "Leave your study desk or training area tidier than you found it.",
      ar: "اترك مكتبك أو مساحة تمرينك أكثر ترتيباً مما كانت عليه.",
    },
  },
  {
    id: "p7_compassion",
    number: 7,
    title: { en: "Lead With Compassion", ar: "الرحمة ومساعدة الآخرين" },
    description: {
      en: "Encourage beginners and notice when someone feels excluded or overwhelmed.",
      ar: "شجّع المبتدئين وانتبه لمن يشعر بالوحدة أو الصعوبة.",
    },
    dailyPractice: {
      en: "Offer sincere encouragement to a younger student or newcomer.",
      ar: "وجّه كلمة تشجيع صادقة لطالب أصغر أو زميل جديد.",
    },
  },
  {
    id: "p8_anti_bullying",
    number: 8,
    title: { en: "Stand Against Bullying", ar: "مناهضة التنمر" },
    description: {
      en: "Never mock, intimidate, or exclude anyone, and seek safe adult help when bullying occurs.",
      ar: "لا تسخر من أحد أو ترهبه، واستعن بشخص بالغ موثوق لحماية المتضررين بأمان.",
    },
    dailyPractice: {
      en: "Refuse to laugh at unkind jokes and check on anyone targeted.",
      ar: "ارفض المشاركة في السخرية واطمئن على من يتعرض للأذى.",
    },
  },
  {
    id: "p9_non_aggression",
    number: 9,
    title: { en: "Choose Non-Aggression", ar: "اختيار السلم وعدم الاعتداء" },
    description: {
      en: "Martial knowledge is never for showing off, settling arguments, or starting conflict.",
      ar: "المعرفة القتالية ليست للتفاخر أو حسم الخلافات أو بدء النزاعات.",
    },
    dailyPractice: {
      en: "Use calm dialogue or walk away from heated provocations.",
      ar: "استخدم الحوار الهادئ أو انسحب من الاستفزازات المتوترة.",
    },
  },
  {
    id: "p10_discipline",
    number: 10,
    title: { en: "Honor Daily Discipline", ar: "الانضباط اليومي" },
    description: {
      en: "Consistent habits in sleep, study, hygiene, and focus build reliable character.",
      ar: "الانتظام في النوم والدراسة والنظافة والتركيز يصنع شخصية متزنة.",
    },
    dailyPractice: {
      en: "Follow your planned study and rest schedule consistently.",
      ar: "التزم بجدولك اليومي للدراسة والراحة.",
    },
  },
  {
    id: "p11_safety_first",
    number: 11,
    title: { en: "Safety Over Ego", ar: "السلامة قبل الغرور" },
    description: {
      en: "Never imitate risky stunts or train without qualified supervision, warm-ups, and rest.",
      ar: "لا تقلّد حركات خطرة ولا تتدرب دون إشراف مؤهل وإحماء وراحة كافية.",
    },
    dailyPractice: {
      en: "Stop immediately and inform an adult or doctor if pain or dizziness occurs.",
      ar: "توقّف فوراً وأخبر شخصاً بالغاً أو طبيباً عند الشعور بألم أو دوار.",
    },
  },
  {
    id: "p12_lifelong_learning",
    number: 12,
    title: { en: "Seek Lifelong Wisdom", ar: "طلب الحكمة والتعلّم المستمر" },
    description: {
      en: "Study culture, history, ethics, and wellness alongside physical coordination.",
      ar: "ادرس التاريخ والثقافة والأخلاق والصحة جنباً إلى جنب مع التناسق البدني.",
    },
    dailyPractice: {
      en: "Learn one historical or ethical insight with curiosity today.",
      ar: "تعلّم فكرة تاريخية أو أخلاقية جديدة بفضول وبصيرة اليوم.",
    },
  },
];

export const CODE_COMPREHENSION_CHECKS = [
  {
    id: "chk_1",
    prompt: {
      en: "If a classmate provokes you to 'prove how tough you are,' what aligns with the Code?",
      ar: "إذا استفزك زميل لتُثبت قوتك، ما التصرف المتوافق مع الميثاق؟",
    },
    options: [
      {
        en: "Stay calm, refuse to fight, and step away",
        ar: "الهدوء، ورفض الشجار، والابتعاد عن التوتر",
      },
      { en: "Demonstrate techniques in the hallway", ar: "استعراض الحركات في الممر المدرسي" },
      { en: "Respond with insults to defend pride", ar: "الرد بالإساءة لحفظ الكبرياء" },
    ],
    correctIndex: 0,
  },
  {
    id: "chk_2",
    prompt: {
      en: "What does 'Safety Over Ego' require if you feel sharp joint pain or dizziness?",
      ar: "ماذا يقتضي مبدأ «السلامة قبل الغرور» عند الشعور بألم حاد في المفاصل أو دوار؟",
    },
    options: [
      { en: "Push harder so nobody notices", ar: "الاستمرار بقوة أكبر كي لا يلاحظ أحد" },
      {
        en: "Stop immediately and notify an instructor, parent, or clinician",
        ar: "التوقف فوراً وإبلاغ المدرب أو ولي الأمر أو الطبيب",
      },
      { en: "Ask a friend to diagnose it online", ar: "طلب تشخيص من صديق عبر الإنترنت" },
    ],
    correctIndex: 1,
  },
];

export const MARTIAL_ARTS_DISCIPLINES: MartialArtDiscipline[] = [
  {
    id: "karate",
    name: { en: "Karate", ar: "الكاراتيه" },
    category: "striking_sport",
    origin: {
      en: "Okinawa (Ryukyu Kingdom), later formalized across mainland Japan in the early 20th century.",
      ar: "أوكيناوا (مملكة ريوكيو)، ثم نُظّم لاحقاً في اليابان في مطلع القرن العشرين.",
    },
    originNote: {
      en: "Early Okinawan lineages relied heavily on oral transmission and blended local traditions with southern Chinese influences; some early dates remain historically debated.",
      ar: "اعتمدت السلالات المبكرة في أوكيناوا على النقل الشفهي وتأثرت بالتبادل الثقافي مع جنوب الصين؛ ولا تزال بعض التواريخ المبكرة محل نقاش تاريخي.",
    },
    philosophy: {
      en: "Emphasizes courtesy, posture, balance, and self-restraint ('Karate ni sente nashi' — there is no first attack in Karate).",
      ar: "يركز على الأدب، واتزان القوام، وضبط النفس ومبدأ عدم المبادرة بالاعتداء.",
    },
    trainingFocus: {
      en: "Structured forms (kata), stance stability, timing, spatial distance, and regulated non-contact or light-contact sport drills.",
      ar: "الأشكال الحركية المنظمة (الكاتا)، وثبات الوقفات، والتوقيت، والمسافة الآمنة، والتدريب الرياضي المنضبط.",
    },
    trainingEnvironment: {
      en: "Formal dojo floor with bowing etiquette, uniform (gi), and instructor-led line drills.",
      ar: "صالة دوجو منظمة بتقاليد التحية والزي الرياضي (الجي) وتدريبات جماعية بإشراف المدرب.",
    },
    equipment: {
      en: "Breathable cotton gi, belt, and in sport rulesets: padded gloves, shin/instep guards, and mouthguard.",
      ar: "بدلة كاراتيه قطنية وحزام، وفي المنافسات الرياضية قفازات مبطنة وواقيات للساق والفم.",
    },
    fitnessAndMentalSkills: {
      en: "Core stability, focus, reaction discipline, memory through kata sequences, and calm breathing.",
      ar: "توازن الجذع، والتركيز، والانضباط الحركي، والذاكرة الحركية عبر الكاتا، والتنفس الهادئ.",
    },
    safetyConsiderations: {
      en: "Requires proper knee alignment in deep stances, strict contact control, and qualified supervision.",
      ar: "يتطلب محاذاة سليمة للركبتين في الوقفات، وضبطاً صارماً للاحتكاك، وإشرافاً مؤهلاً.",
    },
    misconceptions: {
      en: "Often misrepresented in movies as board-breaking aggression; traditional dojos treat courtesy and patience as primary.",
      ar: "تُصوَّر خطأً في الأفلام كعنف وتحطيم ألواح، بينما تعطي المدارس الأصيلة الأولوية للأدب والصبر.",
    },
    ethicalPrinciples: {
      en: "Rei (respect), character perfection, sincerity, effort, and refraining from violent behavior.",
      ar: "الاحترام (ري)، وتزكية الخلق، والإخلاص، والاجتهاد، والامتناع عن العنف.",
    },
    references: [
      "World Karate Federation (WKF) Rules & Ethics Charter",
      "Okinawa Prefectural Traditional Karate Archives",
    ],
    comparison: {
      movementFocus: {
        en: "Linear stances, coordinated forms (kata), distance control",
        ar: "وقفات متزنة، وكاتا منظمة، وضبط المسافة",
      },
      trainingFormat: {
        en: "Kihon (basics), Kata (forms), regulated sport Kumite",
        ar: "أساسيات (كيهون)، وكاتا، ومبارزة رياضية مقننة",
      },
      rulesetFocus: {
        en: "Point-based controlled sport rules emphasizing clean form",
        ar: "قواعد نقاط رياضية منضبطة تركّز على دقة الأداء",
      },
      protectiveGear: {
        en: "Sport gloves, foot/shin pads, mouthguard (in sparring)",
        ar: "قفازات رياضية وواقي ساق وفم أثناء التدريب التفاعلي",
      },
    },
  },
  {
    id: "taekwondo",
    name: { en: "Taekwondo", ar: "التايكوندو" },
    category: "striking_sport",
    origin: {
      en: "Korea, unified from multiple post-1945 kwans (schools) into an Olympic sport.",
      ar: "كوريا، توحّدت عدة مدارس حديثة بعد عام ١٩٤٥ لتصبح رياضة أولمبية عالمية.",
    },
    originNote: {
      en: "While often linked culturally to ancient Korean games like Taekkyeon, historians distinguish modern standardized Taekwondo (1950s–1970s) from earlier folk traditions.",
      ar: "رغم ربطه ثقافياً بألعاب كورية قديمة، يميّز المؤرخون بين التايكوندو الحديث المنظّم في منتصف القرن العشرين والتقاليد الشعبية الأقدم.",
    },
    philosophy: {
      en: "Guided by Five Tenets: Courtesy, Integrity, Perseverance, Self-Control, and Indomitable Spirit.",
      ar: "يستند إلى خمسة مبادئ: اللباقة، والنزاهة، والمثابرة، وضبط النفس، والعزيمة.",
    },
    trainingFocus: {
      en: "Agility, dynamic balance, flexibility, poomsae (patterned forms), and Olympic-style footwork.",
      ar: "الرشاقة، والتوازن الحركي، والمرونة، والبومسي (النماذج)، وحركة القدمين الرياضية.",
    },
    trainingEnvironment: {
      en: "Padded dojang mats with flags, structured warm-ups, and electronic scoring gear in sport sessions.",
      ar: "بساط دوجانغ مبطن مع إحماء منظم وأجهزة تسجيل إلكترونية في التمارين الرياضية.",
    },
    equipment: {
      en: "Dobok uniform, chest protector (hogu), headgear, forearm/shin guards, and mouthguard.",
      ar: "بدلة الدوبوك، وواقي الصدر، وخوذة، وواقيات الساعد والساق والفم.",
    },
    fitnessAndMentalSkills: {
      en: "Flexibility, cardiovascular endurance, spatial timing, and goal-oriented patience.",
      ar: "المرونة، والتحمل القلبي، وتوقيت الحركة، والصبر المرحلي.",
    },
    safetyConsiderations: {
      en: "Gradual hip flexibility progression prevents hamstring/groin strain; full protective gear is mandatory in sparring.",
      ar: "التدرج في المرونة يمنع شد العضلات، ويجب ارتداء معدات الوقاية الكاملة في المنافسات.",
    },
    misconceptions: {
      en: "Not merely high-flying acrobatics; foundational poomsae prioritizes calm balance and etiquette.",
      ar: "ليس مجرد حركات استعراضية، بل تركز البومسي على التوازن الهادئ والآداب.",
    },
    ethicalPrinciples: {
      en: "Courtesy and self-control before athletic medals.",
      ar: "تقديم الأدب وضبط النفس على الميداليات الرياضية.",
    },
    references: ["World Taekwondo Tenets & Competition Rules", "Kukkiwon Textbook Ethics Overview"],
    comparison: {
      movementFocus: {
        en: "Footwork agility, upright balance, flexibility",
        ar: "خفة حركة القدمين، والتوازن القائم، والمرونة",
      },
      trainingFormat: {
        en: "Poomsae forms, target pad drills, Olympic sport sparring",
        ar: "نماذج البومسي، وتدريبات الأهداف، والمبارزة الأولمبية",
      },
      rulesetFocus: {
        en: "Protected electronic-vest point scoring",
        ar: "احتساب نقاط إلكتروني مع درع واقٍ",
      },
      protectiveGear: {
        en: "Chest hogu, helmet, shin/arm guards, mouthguard",
        ar: "واقي صدر، وخوذة، وواقيات ساق وذراع وفم",
      },
    },
  },
  {
    id: "judo",
    name: { en: "Judo", ar: "الجودو" },
    category: "grappling_balance",
    origin: {
      en: "Founded in Japan in 1882 by Jigoro Kano as an educational system ('The Gentle Way').",
      ar: "تأسس في اليابان عام ١٨٨٢ على يد جيغورو كانو كمنهج تربوي («الطريق اللين»).",
    },
    originNote: {
      en: "Well-documented educational reform adapting selected classical jujutsu principles into safe sport and character education.",
      ar: "موثق تاريخياً كإصلاح تربوي حوّل مبادئ التوازن القديمة إلى رياضة آمنة وتربية أخلاقية.",
    },
    philosophy: {
      en: "'Maximum efficiency with minimum effort' (Seiryoku-Zenyo) and 'Mutual welfare and benefit' (Jita-Kyoei).",
      ar: "«أقصى فاعلية بأقل جهد» و«المنفعة والخير المتبادل للجميع».",
    },
    trainingFocus: {
      en: "Ukemi (safe falling and posture recovery), balance disruption concepts, and cooperative sport etiquette.",
      ar: "أوكيمي (السقوط الآمن واستعادة التوازن)، وفهم مركز الثقل، والتعاون الرياضي.",
    },
    trainingEnvironment: {
      en: "Spring-supported tatami mats, clean judogi uniforms, mutual bowing before/after every drill.",
      ar: "بساط تاتامي مرن، وبدلة جودو نظيفة، وتحية متبادلة قبل كل تمرين وبعده.",
    },
    equipment: {
      en: "Heavy-weave cotton judogi and belt; clean tatami mats.",
      ar: "بدلة جودوجي قطنية متينة وحزام على بساط تاتامي نظيف.",
    },
    fitnessAndMentalSkills: {
      en: "Grip/core stability, proprioception, safe falling reflexes, and mutual trust with partners.",
      ar: "قوة الجذع، والوعي المكاني، وردود فعل السقوط الآمن، والثقة المتبادلة.",
    },
    safetyConsiderations: {
      en: "Safe falling (ukemi) must be learned first under qualified coaches; age-restricted sport rules protect growing joints.",
      ar: "يجب تعلّم السقوط الآمن أولاً بإشراف مدرب مؤهل، وتراعي القوانين أعمار الناشئين لحماية المفاصل.",
    },
    misconceptions: {
      en: "Strength alone does not govern Judo; Kano designed it explicitly as moral and physical education for schools.",
      ar: "لا يقوم على القوة الغاشمة؛ فقد صُمم في الأصل كمنهج مدرسي للتربية والانضباط.",
    },
    ethicalPrinciples: {
      en: "Mutual Welfare and Benefit — partners protect each other while learning.",
      ar: "المنفعة المتبادلة — حماية الزميل أثناء التعلّم.",
    },
    references: [
      "Kodokan Judo Institute Educational Principles",
      "International Judo Federation Moral Code",
    ],
    comparison: {
      movementFocus: {
        en: "Balance, leverage, and safe falling mechanics",
        ar: "التوازن، والرافعة الحركية، ومهارة السقوط الآمن",
      },
      trainingFormat: {
        en: "Ukemi drills, cooperative uchikomi, regulated sport randori",
        ar: "تمارين السقوط الآمن، والتكرار التعاوني، والممارسة الرياضية المنضبطة",
      },
      rulesetFocus: {
        en: "Olympic grappling sport with strict safety fouls",
        ar: "رياضة أولمبية بقواعد سلامة صارمة",
      },
      protectiveGear: {
        en: "Thick cotton judogi + sprung tatami mats",
        ar: "بدلة قطنية متينة وبساط تاتامي مرن",
      },
    },
  },
  {
    id: "bjj",
    name: { en: "Brazilian Jiu-Jitsu (BJJ)", ar: "الجوجيتسو البرازيلي" },
    category: "grappling_balance",
    origin: {
      en: "Developed in early-to-mid 20th-century Brazil from Kodokan Judo / jujutsu roots.",
      ar: "تطور في البرازيل خلال النصف الأول من القرن العشرين انطلاقاً من جذور الجودو.",
    },
    originNote: {
      en: "Evolved through contributions by Mitsuyo Maeda, the Gracie family, Oswaldo Fadda, and multiple Brazilian lineages.",
      ar: "تشكّل عبر مساهمات ميتسويو مايدا وعائلة غريسي وأوزوالدو فادا ومدارس برازيلية متعددة.",
    },
    philosophy: {
      en: "Uses calm problem-solving, leverage, and positioning without striking.",
      ar: "يعتمد على التفكير الهادئ، واستثمار الرافعة والتموضع دون ضرب.",
    },
    trainingFocus: {
      en: "Postural awareness, positional escapes, calm breathing under pressure, and respectful tap-out culture.",
      ar: "الوعي الوضعي، والتنفس الهادئ تحت الضغط، وثقافة التوقف الفوري احتراماً للسلامة.",
    },
    trainingEnvironment: {
      en: "Clean padded mats; rigorous mat hygiene and partner safety communication ('tap early').",
      ar: "بساط نظيف مبطن مع عناية صارمة بالنظافة والتواصل الفوري لإيقاف التمرين عند الحاجة.",
    },
    equipment: {
      en: "Gi or rashguard/shorts, mouthguard; strict nail/hygiene standards.",
      ar: "بدلة أو ملابس رياضية محكمة، وواقي فم، ومعايير نظافة دقيقة.",
    },
    fitnessAndMentalSkills: {
      en: "Strategic patience, emotional composure under discomfort, and aerobic/isometric stamina.",
      ar: "الصبر الاستراتيجي، والهدوء النفسي، والتحمل البدني.",
    },
    safetyConsiderations: {
      en: "Requires strict supervision, immediate release on tap, and skin/mat hygiene to prevent infections.",
      ar: "يتطلب إشرافاً دقيقاً وتوقفاً فورياً عند إشارة الزميل مع تعقيم البساط باستمرار.",
    },
    misconceptions: {
      en: "Not chaotic brawling; good gyms emphasize patient problem-solving and zero ego.",
      ar: "ليس عراكاً عشوائياً؛ فالأندية المنضبطة تركز على الحل الهادئ والتواضع.",
    },
    ethicalPrinciples: {
      en: "Zero ego, protecting training partners' joints, and mutual care.",
      ar: "التواضع وحماية مفاصل الزملاء والرعاية المتبادلة.",
    },
    references: ["IBJJF Sport Rules & Youth Division Safety Restrictions"],
    comparison: {
      movementFocus: {
        en: "Ground positioning, leverage, calm breathing",
        ar: "التموضع الأرضي، والرافعة الحركية، والتنفس الهادئ",
      },
      trainingFormat: {
        en: "Structured positional drills and supervised sport rounds",
        ar: "تدريبات تموضع منظمة وجولات رياضية بإشراف",
      },
      rulesetFocus: {
        en: "Positional points & strict youth safety limits",
        ar: "نظام نقاط تموضعية وقيود سلامة صارمة للناشئين",
      },
      protectiveGear: {
        en: "Gi/rashguard, mouthguard, padded clean mats",
        ar: "بدلة/ملابس رياضية، واقي فم، وبساط نظيف",
      },
    },
  },
  {
    id: "aikido",
    name: { en: "Aikido", ar: "الأيكيدو" },
    category: "holistic_tradition",
    origin: {
      en: "Founded in Japan in the 1920s–1940s by Morihei Ueshiba.",
      ar: "تأسس في اليابان بين عشرينيات وأربعينيات القرن العشرين على يد موريهي أويشيبا.",
    },
    originNote: {
      en: "Synthesized classical Japanese sword/jujutsu movements with a philosophy explicitly centered on harmony and non-harm.",
      ar: "جمع حركات يابانية تقليدية ضمن فلسفة صريحة تركز على الانسجام وعدم الإيذاء.",
    },
    philosophy: {
      en: "Seeks peaceful resolution and redirection of conflict without injuring oneself or the other person.",
      ar: "يسعى إلى الحل السلمي وتهدئة الصراع دون إيذاء النفس أو الطرف الآخر.",
    },
    trainingFocus: {
      en: "Circular footwork, posture blending, ukemi rolling, and cooperative partner drills.",
      ar: "حركة القدمين الدائرية، والانسجام في القوام، والتدحرج الآمن، والتدريب التعاوني.",
    },
    trainingEnvironment: {
      en: "Quiet, contemplative tatami dojo emphasizing mutual cooperation rather than tournaments.",
      ar: "دوجو هادئ على بساط تاتامي يركز على التعاون المتبادل بعيداً عن البطولات.",
    },
    equipment: {
      en: "Dogi and hakama (traditional pleated trousers) for senior practitioners; wooden training props only under coach supervision.",
      ar: "بدلة دوجي وهاكاما للمتقدمين، وأدوات خشبية تعليمية فقط بإشراف المدرب.",
    },
    fitnessAndMentalSkills: {
      en: "Spatial awareness, relaxed posture, rhythmic movement, and de-escalation mindset.",
      ar: "الوعي المكاني، واسترخاء القوام، والتناسق الحركي، وعقلية التهدئة.",
    },
    safetyConsiderations: {
      en: "Wrist and shoulder mobility warm-ups and safe falling technique are essential before partner drills.",
      ar: "إحماء الرسغين والكتفين وتعلّم السقوط الآمن ضروريان قبل التمارين الثنائية.",
    },
    misconceptions: {
      en: "Misunderstood as theatrical choreography or magic; genuine practice is mindful posture and cooperative movement study.",
      ar: "يُساء فهمه كتمثيل مسرحي، بينما جوهره دراسة واعية للتوازن والتعاون الحركي.",
    },
    ethicalPrinciples: {
      en: "Harmony (Wa) — protecting even an aggressor from unnecessary harm.",
      ar: "الانسجام (وا) — تجنّب الأذى غير المبرر وحفظ الكرامة الإنسانية.",
    },
    references: ["Aikikai Foundation Cultural Overview"],
    comparison: {
      movementFocus: {
        en: "Circular blending, posture, cooperative ukemi",
        ar: "الحركة الدائرية، وتوازن القوام، والتعاون",
      },
      trainingFormat: {
        en: "Non-competitive cooperative partner study",
        ar: "دراسة تعاونية غير تنافسية",
      },
      rulesetFocus: {
        en: "Generally non-tournament ethical movement art",
        ar: "فن حركي أخلاقي لا يعتمد البطولات التنافسية",
      },
      protectiveGear: { en: "Dogi uniform and tatami mats", ar: "بدلة دوجي وبساط تاتامي" },
    },
  },
  {
    id: "kung_fu",
    name: { en: "Kung Fu (Wushu / Traditional Chinese Styles)", ar: "الكونغ فو (الووشو)" },
    category: "holistic_tradition",
    origin: {
      en: "Umbrella term covering hundreds of regional Chinese martial, health, and cultural lineages.",
      ar: "مظلة تضم مئات المدارس الصينية الإقليمية في الحركة والصحة والتراث الثقافي.",
    },
    originNote: {
      en: "Many origin legends (such as Bodhidharma stories) are recognized by modern historians as later folklore rather than verifiable primary records.",
      ar: "يرى المؤرخون المعاصرون أن كثيراً من أساطير النشأة القديمة هي قصص شعبية متأخرة لا وثائق تاريخية مباشرة.",
    },
    philosophy: {
      en: "'Wude' (martial morality): humility, respect, righteousness, trust, and patience through dedicated mastery.",
      ar: "«ووده» (الأخلاق القتالية): التواضع، والاحترام، والاستقامة، والأمانة، والصبر في الإتقان.",
    },
    trainingFocus: {
      en: "Stance endurance, fluid forms (taolu), breathing coordination, and athletic discipline.",
      ar: "ثبات الوقفات، والنماذج الحركية المتدفقة (تاولو)، وتنظيم التنفس، والانضباط الرياضي.",
    },
    trainingEnvironment: {
      en: "Kwoon (training hall) or sport wushu carpet, often combining conditioning and cultural etiquette.",
      ar: "صالة تدريب أو بساط ووشو رياضي يجمع اللياقة والآداب الثقافية.",
    },
    equipment: {
      en: "Lightweight training uniform, flexible indoor shoes; sport sanda uses full protective pads.",
      ar: "ملابس تدريب خفيفة وأحذية مرنة؛ وتستخدم منافسات الساندا الرياضية تجهيزات وقاية كاملة.",
    },
    fitnessAndMentalSkills: {
      en: "Leg stamina, balance, full-body coordination, and patient attention to detail.",
      ar: "تحمل الساقين، والتوازن، والتناسق الشامل، والدقة والتركيز.",
    },
    safetyConsiderations: {
      en: "Deep stances require gradual knee conditioning and proper alignment.",
      ar: "الوقفات العميقة تتطلب تدرجاً في تقوية الركبتين ومحاذاتهما بسلامة.",
    },
    misconceptions: {
      en: "The term 'Kung Fu' literally means skill achieved through hard work over time—applicable to calligraphy, study, or art.",
      ar: "كلمة كونغ فو تعني لغوياً الإتقان المكتسب بالاجتهاد والوقت في أي علم أو فن.",
    },
    ethicalPrinciples: {
      en: "Wude — morality of deed and morality of mind.",
      ar: "أخلاق الفعل وأخلاق القلب (ووده).",
    },
    references: ["International Wushu Federation (IWUF) Cultural & Rules Guide"],
    comparison: {
      movementFocus: {
        en: "Fluid forms, rooted stances, full-body balance",
        ar: "التدفق الحركي، وتجذر الوقفات، والتوازن الشامل",
      },
      trainingFormat: {
        en: "Taolu forms, conditioning, regulated sport drills",
        ar: "نماذج تاولو، واللياقة، والتمارين المنظمة",
      },
      rulesetFocus: {
        en: "Judged forms athleticism or padded sport scoring",
        ar: "تحكيم فني للأشكال أو نقاط رياضية محمية",
      },
      protectiveGear: {
        en: "Uniform & shoes (forms); full pads (sport division)",
        ar: "زي وأحذية خفيفة للنماذج؛ وواقيات كاملة للرياضة",
      },
    },
  },
  {
    id: "boxing",
    name: { en: "Boxing (Olympic / Amateur Sport)", ar: "الملاكمة (الرياضة الأولمبية)" },
    category: "striking_sport",
    origin: {
      en: "Ancient Mediterranean & global pugilism traditions codified into modern Marquess of Queensberry sport rules (1867).",
      ar: "جذور رياضية قديمة جرى تقنينها في القواعد الرياضية الحديثة عام ١٨٦٧ لتصبح رياضة أولمبية.",
    },
    originNote: {
      en: "Modern amateur boxing is strictly regulated by round limits, weight classes, headgear rules, and medical ringside protocols.",
      ar: "تخضع الملاكمة الأولمبية الحديثة لقواعد صارمة في الجولات والأوزان والفحوصات الطبية.",
    },
    philosophy: {
      en: "Sportsmanship, focus, conditioning, footwork geometry, and strict adherence to rules.",
      ar: "الروح الرياضية، والتركيز، واللياقة، وتناغم حركة القدمين، والالتزام التام بالقوانين.",
    },
    trainingFocus: {
      en: "Jump rope, shadow movement, footwork drills, heavy-bag conditioning, and non-contact pad fitness.",
      ar: "القفز بالحبل، والحركة الظلية، وتنسيق القدمين، ولياقة الأكياس دون احتكاك مؤذٍ.",
    },
    trainingEnvironment: {
      en: "Licensed athletic boxing gym with timed rounds, bags, mirrors, and certified coaches.",
      ar: "نادي ملاكمة مرخص بجولات مؤقتة وأكياس ومرايا ومدربين معتمدين.",
    },
    equipment: {
      en: "Hand wraps, padded training gloves, mouthguard, and amateur headgear in sanctioned sport.",
      ar: "أربطة يد، وقفازات مبطنة، وواقي فم، وخوذة في المنافسات المعتمدة للهواة.",
    },
    fitnessAndMentalSkills: {
      en: "Cardio endurance, rhythm, composure, and rapid visual awareness.",
      ar: "اللياقة القلبية، والإيقاع الحركي، ورباطة الجأش، والانتباه البصري.",
    },
    safetyConsiderations: {
      en: "CRITICAL: Avoid head trauma; non-contact fitness boxing is safe and effective without sparring headshots. Seek immediate medical care for any dizziness.",
      ar: "مهم: تجنّب إصابات الرأس؛ الملاكمة اللياقية دون احتكاك بالرأس آمنة ومفيدة. راجع الطبيب فوراً عند أي دوار.",
    },
    misconceptions: {
      en: "Often confused with street fighting; sanctioned boxing forbids all foul conduct and demands medical oversight.",
      ar: "يُخلط بينها وبين الشجار، بينما تحرم الرياضة الرسمية التجاوزات وتفرض رقابة طبية.",
    },
    ethicalPrinciples: {
      en: "Clean sportsmanship, touching gloves in respect, and protecting opponents.",
      ar: "الروح الرياضية النظيفة واحترام المنافس.",
    },
    references: ["World Boxing / Olympic Amateur Boxing Medical & Safety Rules"],
    comparison: {
      movementFocus: {
        en: "Footwork rhythm, posture, hand-eye speed",
        ar: "إيقاع القدمين، وتوازن الجذع، والتآزر البصري",
      },
      trainingFormat: {
        en: "Interval rounds on bags, shadowboxing, conditioning",
        ar: "جولات لياقة على الأكياس وحركة ظلية",
      },
      rulesetFocus: {
        en: "Timed rounds with strict referee & medical oversight",
        ar: "جولات مؤقتة برقابة تحكيمية وطبية صارمة",
      },
      protectiveGear: {
        en: "Hand wraps, padded gloves, mouthguard, headgear",
        ar: "أربطة، قفازات مبطنة، واقي فم، خوذة",
      },
    },
  },
  {
    id: "wrestling",
    name: { en: "Wrestling (Freestyle & Greco-Roman)", ar: "المصارعة الرياضية" },
    category: "grappling_balance",
    origin: {
      en: "One of humanity's oldest documented sports across ancient Mesopotamia, Egypt, Greece, and global folk cultures.",
      ar: "من أقدم الرياضات الموثقة في تاريخ البشرية في حضارات الرافدين ومصر واليونان.",
    },
    originNote: {
      en: "Appeared in the ancient Greek Olympics (708 BCE) and remains a core modern Olympic discipline with strict no-striking rules.",
      ar: "ظهرت في الأولمبياد القديم عام ٧٠٨ ق.م وتُعد ركيزة في الأولمبياد الحديث دون أي ضرب.",
    },
    philosophy: {
      en: "Honest test of balance, endurance, fair play, and respect after every match.",
      ar: "اختبار نزيه للتوازن والتحمل واللعب النظيف والاحترام المتبادل.",
    },
    trainingFocus: {
      en: "Stance stability, agility, core strength, conditioning, and safe mat awareness.",
      ar: "ثبات الوقفة، والرشاقة، وقوة الجذع، واللياقة، والوعي على البساط.",
    },
    trainingEnvironment: {
      en: "Shock-absorbing wrestling mat with strict hygiene protocols and coach supervision.",
      ar: "بساط مصارعة ممتص للصدمات مع تعقيم يومي وإشراف تدريبي.",
    },
    equipment: {
      en: "Wrestling shoes, singlet, optional ear guards / kneepads.",
      ar: "أحذية مصارعة مرنة، وملابس رياضية، وواقيات للأذن والركبة.",
    },
    fitnessAndMentalSkills: {
      en: "Full-body stamina, perseverance, and emotional resilience after tough matches.",
      ar: "لياقة شاملة للجسم، والمثابرة، والمرونة النفسية بعد المنافسة.",
    },
    safetyConsiderations: {
      en: "Zero dangerous slams; strict hygiene and healthy hydration/nutrition (never unsafe weight cutting).",
      ar: "منع السقطات الخطرة مع التزام صارم بالنظافة والتغذية السليمة (دون إنقاص وزن قاسٍ).",
    },
    misconceptions: {
      en: "Entirely distinct from scripted entertainment 'pro wrestling'; Olympic wrestling is pure athletic balance without strikes.",
      ar: "تختلف كلياً عن العروض الترفيهية التمثيلية؛ فهي رياضة أولمبية صافية للتوازن دون ضرب.",
    },
    ethicalPrinciples: {
      en: "Handshake before and after competition regardless of scoreboard outcome.",
      ar: "المصافحة قبل النزال وبعده أياً كانت النتيجة.",
    },
    references: ["United World Wrestling (UWW) Youth & Sport Ethics Regulations"],
    comparison: {
      movementFocus: {
        en: "Center of gravity, stance balance, mat agility",
        ar: "مركز الثقل، وتوازن الوقفة، ورشاقة البساط",
      },
      trainingFormat: {
        en: "Mat agility, stance drills, supervised sport matches",
        ar: "تمارين رشاقة وتوازن ومنافسات رياضية منظمة",
      },
      rulesetFocus: {
        en: "Control & position scoring with strict anti-injury rules",
        ar: "احتساب نقاط السيطرة والتموضع بقواعد أمان صارمة",
      },
      protectiveGear: {
        en: "Wrestling shoes, singlet, headgear/ear guards",
        ar: "أحذية مرنة وواقي أذن وركبة",
      },
    },
  },
  {
    id: "muay_thai",
    name: { en: "Muay Thai", ar: "المواي تاي" },
    category: "striking_sport",
    origin: {
      en: "Thailand, formalized in the early 20th century with rings, gloves, and round timers.",
      ar: "تايلاند، جرى تقنينها كرياضة حديثة في القرن العشرين بحلبة وقفازات وجولات.",
    },
    originNote: {
      en: "Pre-modern battlefield accounts (Muay Boran) blend historical chronicles and national folklore; modern sport Muay Thai adheres to international athletic rules.",
      ar: "تمزج الروايات القديمة بين السجلات والتراث الشعبي، بينما تخضع الرياضة الحديثة لقوانين دولية منظمة.",
    },
    philosophy: {
      en: "Deep gratitude toward teachers, parents, and opponents (symbolized in the traditional Wai Kru).",
      ar: "الامتنان العميق للمعلمين والوالدين واحترام المنافس.",
    },
    trainingFocus: {
      en: "High-aerobic pad work, balance, rhythm, and supportive fitness conditioning.",
      ar: "اللياقة الهوائية العالية على الأهداف المبطنة والتوازن والإيقاع.",
    },
    trainingEnvironment: {
      en: "Athletic gym with heavy bags, Thai pads, and structured coach-held pad rounds.",
      ar: "نادي رياضي مجهز بأكياس ووسائد تدريبية بإشراف مدرب مؤهل.",
    },
    equipment: {
      en: "Hand wraps, padded gloves, shin guards, mouthguard, and protective youth gear in amateur sport.",
      ar: "أربطة، قفازات مبطنة، واقي ساق وفم، ومعدات حماية إضافية للناشئين.",
    },
    fitnessAndMentalSkills: {
      en: "Cardiovascular conditioning, rhythm, mental toughness, and gratitude.",
      ar: "اللياقة القلبية، والإيقاع الحركي، والجلد، والامتنان.",
    },
    safetyConsiderations: {
      en: "Beginners and youth focus on pad conditioning and controlled technical drills without full-power head contact.",
      ar: "يركّز المبتدئون والناشئون على التمرين بالوسائد والتناسق دون احتكاك قوي بالرأس.",
    },
    misconceptions: {
      en: "Reduced to harshness in films, whereas traditional camps emphasize mutual respect and lighthearted camaraderie.",
      ar: "تختزلها الأفلام في القسوة، بينما تسود الأندية الأصيلة روح الاحترام والتآلف.",
    },
    ethicalPrinciples: {
      en: "Gratitude to mentors and respect for training partners.",
      ar: "العرفان للمدربين واحترام الزملاء.",
    },
    references: ["International Federation of Muaythai Associations (IFMA) Youth Rules"],
    comparison: {
      movementFocus: {
        en: "Balanced upright stance, rhythmic conditioning",
        ar: "وقفة قائمة متزنة، وإيقاع لياقي متناسق",
      },
      trainingFormat: {
        en: "Coach-held pad rounds, bag fitness, interval cardio",
        ar: "جولات وسائد مع المدرب ولياقة هوائية",
      },
      rulesetFocus: {
        en: "Amateur IFMA rules mandate headgear & body protection",
        ar: "قواعد الهواة تفرض الخوذة وواقيات الجسم",
      },
      protectiveGear: {
        en: "Gloves, wraps, shin guards, headgear/vest (amateur)",
        ar: "قفازات، واقي ساق، خوذة ودرع صدر للهواة",
      },
    },
  },
  {
    id: "kickboxing",
    name: { en: "Kickboxing (Sport Rulesets)", ar: "الكيك بوكسينغ الرياضي" },
    category: "striking_sport",
    origin: {
      en: "Emerged in Japan, the USA, and Europe during the 1960s–1970s as a regulated ring/tatami sport.",
      ar: "نشأ كرياضة منظمة في اليابان والولايات المتحدة وأوروبا خلال الستينيات والسبعينيات.",
    },
    originNote: {
      en: "Includes distinct sport disciplines such as Point Fighting and Light Contact on tatami mats.",
      ar: "يتضمن فروعاً رياضية متعددة مثل اللعب بالنقاط والتلامس الخفيف على البساط.",
    },
    philosophy: {
      en: "Clean athletic pacing, fair rules compliance, and controlled timing.",
      ar: "التدرج الرياضي النظيف والالتزام بالقواعد والتوقيت المنضبط.",
    },
    trainingFocus: {
      en: "Footwork coordination, bag combinations for fitness, and light-contact point timing.",
      ar: "تناسق القدمين، ولياقة الأكياس، وتوقيت النقاط في التلامس الخفيف.",
    },
    trainingEnvironment: {
      en: "Tatami sport floor or padded fitness studio with structured round timers.",
      ar: "بساط رياضي أو صالة لياقة منظمة بمؤقت جولات.",
    },
    equipment: {
      en: "Training gloves, wraps, foot/shin protectors, mouthguard, and helmet for tatami/amateur formats.",
      ar: "قفازات تدريب، واقيات قدم وساق، واقي فم، وخوذة للهواة.",
    },
    fitnessAndMentalSkills: {
      en: "Aerobic stamina, coordination between hands and feet, and rule discipline.",
      ar: "تحمل هوائي، وتناسق بين اليدين والقدمين، وانضباط بالقانون.",
    },
    safetyConsiderations: {
      en: "Light-contact and point-fighting divisions strictly penalize excessive force.",
      ar: "تعاقب فئات التلامس الخفيف والنقاط أي قوة مفرطة بصرامة.",
    },
    misconceptions: {
      en: "Many participants practice kickboxing strictly for fitness and agility without ever competing in full contact.",
      ar: "يمارسها كثيرون للياقة والرشاقة فقط دون خوض منافسات احتكاك كامل.",
    },
    ethicalPrinciples: {
      en: "Controlled speed without reckless force.",
      ar: "السرعة المنضبطة دون تهور أو إيذاء.",
    },
    references: ["WAKO (World Association of Kickboxing Organizations) Fair Play Rules"],
    comparison: {
      movementFocus: {
        en: "Hand-foot athletic coordination and agility",
        ar: "تآزر حركي بين اليدين والقدمين ورشاقة",
      },
      trainingFormat: {
        en: "Timed fitness rounds & tatami light-contact drills",
        ar: "جولات لياقة وتدريبات بساط خفيفة",
      },
      rulesetFocus: {
        en: "WAKO light/point divisions prioritize clean control",
        ar: "تُعلي فئات النقاط والتلامس الخفيف من الانضباط",
      },
      protectiveGear: {
        en: "Gloves, foot/shin pads, mouthguard, headgear",
        ar: "قفازات وواقيات قدم وساق وفم وخوذة",
      },
    },
  },
  {
    id: "fencing",
    name: { en: "Fencing (Olympic Foil, Épée & Sabre)", ar: "المبارزة الأولمبية (الشيش)" },
    category: "traditional_weapons_sport",
    origin: {
      en: "Evolved from European swordsmanship manuals into a safe, non-lethal Olympic sport since 1896.",
      ar: "تطورت من تقاليد أوروبية إلى رياضة أولمبية آمنة منذ عام ١٨٩٦.",
    },
    originNote: {
      en: "Modern sport fencing uses blunted flexible steel blades, electronic scoring, and full protective masks—zero sharp weapons.",
      ar: "تستخدم المبارزة الحديثة أنصالاً مرنة غير حادة، وتسجيلاً إلكترونياً، وأقنعة حماية كاملة.",
    },
    philosophy: {
      en: "Chivalry, intellectual strategy ('physical chess'), and saluting before and after bouts.",
      ar: "النبل، والاستراتيجية الذهنية («الشطرنج الحركي»)، والتحية قبل النزال وبعده.",
    },
    trainingFocus: {
      en: "Footwork precision, distance judgment, tactical patience, and rapid decision-making.",
      ar: "دقة حركة القدمين، وتقدير المسافة، والصبر التكتيكي، وسرعة القرار.",
    },
    trainingEnvironment: {
      en: "Indoor fencing strip (piste) with electronic scoring reels and strict safety mask rules.",
      ar: "مضمار مبارزة داخلي بتسجيل إلكتروني وقواعد إلزامية للقناع الواقي.",
    },
    equipment: {
      en: "Mandatory steel-mesh mask, puncture-resistant jacket, plastron, glove, and blunted sport blade.",
      ar: "قناع شبكي معدني إلزامي، وسترة واقية، وقفاز، ونصل رياضي غير حاد.",
    },
    fitnessAndMentalSkills: {
      en: "Reflex speed, leg agility, tactical foresight, and grace under pressure.",
      ar: "سرعة البديهة، ورشاقة الساقين، والتخطيط التكتيكي، والهدوء.",
    },
    safetyConsiderations: {
      en: "NEVER handle a sport blade without a certified mask and jacket; blades remain pointed downward off the strip.",
      ar: "يُمنع منعاً باتاً استخدام النصل الرياضي دون القناع والسترة المعتمدة.",
    },
    misconceptions: {
      en: "Not dramatic movie dueling; Olympic fencing relies on subtle millimeter timing and strict sportsmanship.",
      ar: "ليست مبارزات سينمائية؛ بل تعتمد على دقة التوقيت والروح الرياضية الصارمة.",
    },
    ethicalPrinciples: {
      en: "Mandatory salute to opponent, referee, and audience—refusal disqualifies.",
      ar: "التحية الإلزامية للخصم والحكم والجمهور.",
    },
    references: ["FIE (Fédération Internationale d'Escrime) Safety & Ethics Code"],
    comparison: {
      movementFocus: {
        en: "Linear lunge footwork & tactical distance",
        ar: "تقدّم وتراجع خطّي وتقدير دقيق للمسافة",
      },
      trainingFormat: {
        en: "Footwork lanes, target drills, electronic bouts",
        ar: "تمارين خطوات، وأهداف، ونزالات إلكترونية",
      },
      rulesetFocus: {
        en: "Right-of-way & electronic touch scoring",
        ar: "قواعد الأسبقية والتسجيل الإلكتروني",
      },
      protectiveGear: {
        en: "Steel mesh mask, Kevlar-rated jacket, plastron, glove",
        ar: "قناع شبكي معدني وسترة واقية وقفاز",
      },
    },
  },
  {
    id: "kendo",
    name: { en: "Kendo", ar: "الكيندو" },
    category: "traditional_weapons_sport",
    origin: {
      en: "Modern Japanese budo derived from historical kenjutsu schools and standardized in the late 19th–20th centuries.",
      ar: "رياضة بودو يابانية حديثة تطورت عن مدارس السيف التقليدية ونُظّمت في القرنين ١٩ و٢٠.",
    },
    originNote: {
      en: "Uses split-bamboo shinai and full armor (bogu) so practitioners can train safely with zero sharp blades.",
      ar: "تستخدم عصا خيزران مرنة (شيناي) ودرعاً واقياً (بوغو) للتدريب الآمن دون أي شفرات حادة.",
    },
    philosophy: {
      en: "Concept of Kendo: 'To discipline the human character through the application of the principles of the katana.'",
      ar: "مفهوم الكيندو: تهذيب الشخصية الإنسانية بالانضباط والاحترام المتبادل.",
    },
    trainingFocus: {
      en: "Posture, vocal spirit, footwork timing, and deeply respectful etiquette (Reigi).",
      ar: "استقامة القوام، وتوقيت الخطوات، والآداب الصارمة (ريغي).",
    },
    trainingEnvironment: {
      en: "Polished wooden dojo floor with strict sitting meditation (seiza) and bowing etiquette.",
      ar: "أرضية دوجو خشبية مع تأمل هادئ وتحية منظمة.",
    },
    equipment: {
      en: "Bamboo shinai, wooden bokuto (kata only), and bogu armor (men mask, do chestplate, kote gloves, tare).",
      ar: "شيناي من الخيزران ودرع بوغو كامل (قناع، وصدرية، وقفازات، وحزام حماية).",
    },
    fitnessAndMentalSkills: {
      en: "Alertness, posture alignment, decisive commitment, and unwavering respect after every match.",
      ar: "اليقظة الذهنية، واستقامة الظهر، والحسم الهادئ، واحترام الزميل.",
    },
    safetyConsiderations: {
      en: "No unarmored partner contact; inspect bamboo shinai regularly for splinters.",
      ar: "يُمنع الاحتكاك دون درع بوغو، مع فحص الشيناي دورياً لسلامة الخيزران.",
    },
    misconceptions: {
      en: "Celebration/boasting after scoring a point (guts-pose) is actually penalized in Kendo—humility is enforced by rule.",
      ar: "التباهي بعد تسجيل نقطة يؤدي لإلغاء النقطة في الكيندو؛ فالتواضع قانون ملزم.",
    },
    ethicalPrinciples: {
      en: "Mindset of Kendo: honor courtesy, associate with sincerity, cultivate oneself.",
      ar: "حفظ اللباقة، ومخالطة الناس بصدق، وتزكية النفس.",
    },
    references: ["All Japan Kendo Federation — Concept of Kendo"],
    comparison: {
      movementFocus: {
        en: "Upright posture, rhythmic footwork, focus",
        ar: "قوام مستقيم وتناسق خطوات وتركيز",
      },
      trainingFormat: {
        en: "Etiquette, suburi swings, bogu-armored drills",
        ar: "آداب، وتلويح فردي، وتمارين بدرع كامل",
      },
      rulesetFocus: {
        en: "Strict valid-point criteria banning prideful celebration",
        ar: "شروط دقيقة للنقطة تمنع التباهي",
      },
      protectiveGear: {
        en: "Full bogu armor + split-bamboo shinai",
        ar: "درع بوغو كامل وشيناي خيزران",
      },
    },
  },
  {
    id: "traditional_japanese",
    name: {
      en: "Traditional Japanese Martial Arts (Koryu & Modern Budo)",
      ar: "الفنون اليابانية التقليدية (الكوريو والبودو)",
    },
    category: "holistic_tradition",
    origin: {
      en: "Encompasses pre-1868 classical Koryu schools and post-1868 educational Budo traditions (Kyudo, Naginata, Iaido, etc.).",
      ar: "تشمل مدارس الكوريو الكلاسيكية قبل ١٨٦٨ وتقاليد البودو التربوية مثل الكيودو والإيايدو.",
    },
    originNote: {
      en: "Classical Koryu transmission relies on verified lineage scrolls; some early 15th–16th century founding legends remain historically unverifiable.",
      ar: "تعتمد الكوريو على وثائق السلالة، بينما تظل بعض روايات التأسيس الأولى غير قابلة للتحقق التاريخي الكامل.",
    },
    philosophy: {
      en: "Transforming martial movement ('jutsu') into a path of lifelong personal refinement ('do').",
      ar: "تحويل المهارة التقنية إلى مسار أخلاقي للتهذيب المستمر («دو»).",
    },
    trainingFocus: {
      en: "Preservation of cultural forms, mindful breathing, precision, and ceremonial respect.",
      ar: "حفظ الأشكال التراثية، وتنسيق التنفس، والدقة، والوقار.",
    },
    trainingEnvironment: {
      en: "Traditional quiet dojo emphasizing preservation and non-competitive focus.",
      ar: "دوجو تقليدي هادئ يركّز على الحفظ الثقافي والتركيز الهادئ.",
    },
    equipment: {
      en: "Traditional hakama/keikogi and specialized cultural training props used strictly in formal dojo settings.",
      ar: "زي تقليدي وأدوات ثقافية خاصة تُستخدم فقط في الإطار الرسمي للدوجو.",
    },
    fitnessAndMentalSkills: {
      en: "Mindfulness, posture control, concentration, and historical literacy.",
      ar: "الحضور الذهني، وضبط القوام، والتركيز، والثقافة التاريخية.",
    },
    safetyConsiderations: {
      en: "Practiced slowly and deliberately under experienced lineage teachers.",
      ar: "تُمارس ببطء وعناية تحت إشراف أساتذة متمرسين.",
    },
    misconceptions: {
      en: "Not secret ninja mythology; genuine traditions emphasize quiet preservation, posture, and community respect.",
      ar: "ليست أساطير سرية؛ بل تركّز على الحفظ الثقافي والاستقامة واحترام المجتمع.",
    },
    ethicalPrinciples: {
      en: "Stewardship of heritage without arrogance or hostility.",
      ar: "صون التراث دون كِبر أو عداء.",
    },
    references: ["Nippon Budokan — The Budo Charter (1987)"],
    comparison: {
      movementFocus: {
        en: "Ceremonial precision, posture, mindful pacing",
        ar: "دقة مراسمية، وقوام متزن، وإيقاع واعٍ",
      },
      trainingFormat: {
        en: "Solo & paired kata preservation",
        ar: "حفظ الأشكال الحركية الفردية والثنائية",
      },
      rulesetFocus: {
        en: "Focus on etiquette & form rather than medals",
        ar: "تركيز على الأدب والشكل لا الميداليات",
      },
      protectiveGear: { en: "Keikogi & hakama uniform", ar: "زي كيكوجي وهاكاما تقليدي" },
    },
  },
  {
    id: "fma",
    name: {
      en: "Filipino Martial Arts (Arnis / Eskrima / Kali)",
      ar: "الفنون القتالية الفلبينية (أرنيس / إسكريما)",
    },
    category: "traditional_weapons_sport",
    origin: {
      en: "Philippines — recognized as the official National Martial Art & Sport of the Philippines (RA 9850, 2009).",
      ar: "الفلبين — معترف به كرياضة وفن قتالي وطني رسمي في الفلبين.",
    },
    originNote: {
      en: "Pre-colonial records were largely oral; modern Arnis is widely taught in Philippine schools as an athletic coordination sport using padded foam/rattan sticks.",
      ar: "اعتمدت السجلات القديمة على النقل الشفهي، وتُدرَّس الأرنيس اليوم في المدارس الفلبينية كرياضة تناسق باستخدام عصي إسفنجية/راتان مبطنة.",
    },
    philosophy: {
      en: "Coordination, ambidexterity, rhythm, and community respect.",
      ar: "التناسق الحركي، وتوازن اليدين، والإيقاع، واحترام المجتمع.",
    },
    trainingFocus: {
      en: "Rhythmic hand-eye coordination drills (anyo forms and padded sport bouts).",
      ar: "تمارين التآزر البصري الحركي (نماذج أنيو ومنافسات رياضية بعصي مبطنة).",
    },
    trainingEnvironment: {
      en: "School gymnasiums or martial arts clubs using foam-padded sticks and protective helmets in sport divisions.",
      ar: "صالات مدرسية أو أندية تستخدم عصيّاً إسفنجية وخوذاً واقية في الرياضة.",
    },
    equipment: {
      en: "Padded foam sport sticks (for youth/beginners), safety helmet, padded gloves, and forearm/body armor in sport bouts.",
      ar: "عصي إسفنجية آمنة للناشئين، وخوذة واقية، وقفازات مبطنة، ودرع جسم في الرياضة.",
    },
    fitnessAndMentalSkills: {
      en: "Ambidextrous brain-body coordination, rhythm, and focus.",
      ar: "تنسيق الدماغ واليدين معاً، والإيقاع، والتركيز.",
    },
    safetyConsiderations: {
      en: "Youth and beginners should use soft foam training props with eye/head protection—never train with sharp blades.",
      ar: "يستخدم الناشئون والمبتدئون عصيّاً إسفنجية مع حماية الرأس والعينين، ويُمنع التدريب بأدوات حادة.",
    },
    misconceptions: {
      en: "Modern educational Arnis is a safe school sport emphasizing rhythmic anyo forms, not street conflict.",
      ar: "الأرنيس التعليمية الحديثة رياضة مدرسية آمنة تركّز على التناسق الحركي لا نزاعات الشوارع.",
    },
    ethicalPrinciples: {
      en: "Respect for elders, cultural pride, and safe sportsmanship.",
      ar: "احترام الكبار والاعتزاز الثقافي واللعب النظيف.",
    },
    references: [
      "Republic Act No. 9850 (Philippines National Sport of Arnis)",
      "WEKAF Sport Rules",
    ],
    comparison: {
      movementFocus: {
        en: "Ambidextrous hand-eye coordination & rhythm",
        ar: "تآزر اليدين مع العين والإيقاع الحركي",
      },
      trainingFormat: {
        en: "Anyo forms & foam-padded sport timing drills",
        ar: "نماذج أنيو وتمارين توقيت بأدوات إسفنجية",
      },
      rulesetFocus: {
        en: "Armored point scoring & judged cultural forms",
        ar: "نقاط رياضية بدرع كامل وتحكيم نماذج تراثية",
      },
      protectiveGear: {
        en: "Foam sticks, padded helmet, gloves, vest",
        ar: "عصي إسفنجية وخوذة وقفازات ودرع",
      },
    },
  },
];

export const DOJO_LEARNING_PATHS: DojoLearningPath[] = [
  {
    id: "path_a",
    code: "A",
    title: {
      en: "Path A · Beginner Basics (12 Foundations)",
      ar: "المسار أ · أساسيات المبتدئين (١٢ موضوعاً)",
    },
    subtitle: {
      en: "Posture, etiquette, breathing, focus, and goal setting before stepping onto any mat.",
      ar: "الوقفة، والآداب، والتنفس، والتركيز، ووضع الأهداف قبل دخول أي صالة تدريب.",
    },
    topics: Array.from({ length: 12 }, (_, idx) => {
      const items: Array<{
        enT: string;
        arT: string;
        enS: string;
        arS: string;
        enK: string;
        arK: string;
      }> = [
        {
          enT: "1. Entering the Dojo With Respect",
          arT: "١. دخول الصالة بأدب واحترام",
          enS: "Understand why bowing or formal greetings honor shared learning space and safety.",
          arS: "فهم دلالة التحية الرسمية في احترام المكان المشترك وسلامة الزملاء.",
          enK: "Respect starts before movement begins.",
          arK: "الاحترام يبدأ قبل أي حركة.",
        },
        {
          enT: "2. Mindful Breathing & Calm Focus",
          arT: "٢. التنفس الواعي والتركيز الهادئ",
          enS: "Practice slow nasal inhales and steady exhales to settle nerves.",
          arS: "تدريب الشهيق الهادئ والزفير المتزن لتهدئة التوتر.",
          enK: "Steady breath steadies decisions.",
          arK: "انتظام النفس يضبط القرار.",
        },
        {
          enT: "3. Balanced Posture & Center of Gravity",
          arT: "٣. اتزان القوام ومركز الثقل",
          enS: "Learn how upright spine alignment and relaxed shoulders support balance.",
          arS: "تعلّم أثر استقامة الظهر واسترخاء الكتفين في التوازن.",
          enK: "Good posture reduces strain during movement.",
          arK: "القوام السليم يقلل الإجهاد.",
        },
        {
          enT: "4. Footwork & Spatial Awareness",
          arT: "٤. حركة القدمين والوعي المكاني",
          enS: "Keep clear spacing from others to avoid accidental collisions.",
          arS: "حفظ مسافة آمنة عن الزملاء لتجنّب التصادم غير المقصود.",
          enK: "Space awareness keeps every partner safe.",
          arK: "الوعي بالمكان يحمي الجميع.",
        },
        {
          enT: "5. Listening & Coachability",
          arT: "٥. الإنصات وقابلية التعلّم",
          enS: "Listen fully before acting; ask clarifying questions politely.",
          arS: "الاستماع التام للتعليمات قبل التنفيذ وطرح الأسئلة بأدب.",
          enK: "Coachable learners improve steadily and safely.",
          arK: "حسن الإنصات يسرّع التعلّم الآمن.",
        },
        {
          enT: "6. Patience Through Fundamentals",
          arT: "٦. الصبر على الأساسيات",
          enS: "Value repeating basic alignment rather than rushing advanced moves.",
          arS: "تقدير إتقان الأساسيات بدلاً من استعجال المهارات المتقدمة.",
          enK: "Foundations prevent bad habits and injury.",
          arK: "الأساس المتين يحمي من الأخطاء والإصابات.",
        },
        {
          enT: "7. Choosing a Discipline That Fits Your Goals",
          arT: "٧. اختيار الفن المناسب لأهدافك",
          enS: "Compare balance, forms, agility, and community fit honestly.",
          arS: "المقارنة بين الفنون من حيث التوازن واللياقة والبيئة المناسبة.",
          enK: "There is no single 'best' art—only the best fit for your goals.",
          arK: "لا يوجد فن «أفضل مطلقاً» بل ما يناسب هدفك.",
        },
        {
          enT: "8. Hygiene & Shared Mat Courtesy",
          arT: "٨. النظافة وآداب المكان المشترك",
          enS: "Clean uniforms, trimmed nails, and tidy gear show care for everyone.",
          arS: "نظافة الملابس وتقليم الأظافر وترتيب الأدوات احترام للجميع.",
          enK: "Clean habits protect team health.",
          arK: "النظافة تحمي صحة المجموعة.",
        },
        {
          enT: "9. Understanding Belt & Rank Humility",
          arT: "٩. التواضع في الأحزمة والمراتب",
          enS: "Belts measure personal consistency over time, never superiority.",
          arS: "الأحزمة تقيس الاستمرارية الشخصية لا الأفضلية على الناس.",
          enK: "Character outshines belt color.",
          arK: "الأخلاق أرفع من لون الحزام.",
        },
        {
          enT: "10. Working Cooperatively With Beginners",
          arT: "١٠. التعاون مع المبتدئين",
          enS: "Experienced students match pace patiently when assisting newcomers.",
          arS: "مراعاة وتيرة المبتدئين بروح مشجعة وصبورة.",
          enK: "Strong leaders help others grow comfortably.",
          arK: "القائد الحقيقي يساعد غيره على التعلّم.",
        },
        {
          enT: "11. Learning From Losses & Mistakes",
          arT: "١١. التعلّم من الخسارة والخطأ",
          enS: "Treat missed targets or lost bouts as clear feedback, never shame.",
          arS: "اعتبار الخطأ أو الخسارة فرصة تعلّم واضحة لا سبباً للإحباط.",
          enK: "Every champion first learned how to recover gracefully.",
          arK: "كل متقن تعلّم أولاً كيف ينهض برقي.",
        },
        {
          enT: "12. Carrying Dojo Discipline Into Study Life",
          arT: "١٢. نقل انضباط الدوجو إلى الدراسة",
          enS: "Apply calm focus and punctuality to homework, family, and teamwork.",
          arS: "تطبيق الهدوء والالتزام بالوقت في الدراسة والأسرة والعمل الجماعي.",
          enK: "The real dojo is daily life outside the gym.",
          arK: "الدوجو الحقيقي هو سلوكك في الحياة اليومية.",
        },
      ];
      const item = items[idx]!;
      return {
        id: `pa_t${idx + 1}`,
        title: { en: item.enT, ar: item.arT },
        summary: { en: item.enS, ar: item.arS },
        keyTakeaway: { en: item.enK, ar: item.arK },
      };
    }),
  },
  {
    id: "path_b",
    code: "B",
    title: {
      en: "Path B · History & Cultural Traditions",
      ar: "المسار ب · التاريخ والتقاليد الثقافية",
    },
    subtitle: {
      en: "How regional arts evolved from historical preservation into modern educational sports.",
      ar: "كيف تطورت الفنون الإقليمية إلى رياضات تربوية حديثة قائمة على القيم.",
    },
    topics: [
      {
        id: "pb_oral_vs_record",
        title: {
          en: "1. Separating Verified History From Folklore",
          ar: "١. التمييز بين التاريخ الموثق والأساطير",
        },
        summary: {
          en: "Historians verify modern codification (19th–20th centuries) clearly while acknowledging oral gaps in older eras.",
          ar: "يميز المؤرخون بين التدوين الحديث الموثق وبين الفجوات الشفهية في العصور الأقدم.",
        },
        keyTakeaway: {
          en: "Honest scholarship respects heritage without exaggerating legends.",
          ar: "الأمانة العلمية تحترم التراث دون مبالغة.",
        },
      },
      {
        id: "pb_jutsu_to_do",
        title: {
          en: "2. From 'Jutsu' (Skill) to 'Do' (Way of Character)",
          ar: "٢. من المهارة التقنية إلى مسار الخلق",
        },
        summary: {
          en: "Educators like Jigoro Kano transformed combative techniques into safe school pedagogy focused on mutual welfare.",
          ar: "حوّل مصلحون مثل جيغورو كانو المهارات البدنية إلى تربية مدرسية آمنة.",
        },
        keyTakeaway: {
          en: "Education turns strength into service.",
          ar: "التربية تحوّل القوة إلى خدمة بناءة.",
        },
      },
      {
        id: "pb_olympic",
        title: {
          en: "3. Global Exchange & Olympic Sport Standards",
          ar: "٣. التبادل العالمي والمعايير الأولمبية",
        },
        summary: {
          en: "Judo, Taekwondo, Wrestling, Boxing, and Fencing bring nations together under impartial referees and safety rules.",
          ar: "تجمع الرياضات الأولمبية الشعوب تحت تحكيم نزيه وقواعد سلامة موحدة.",
        },
        keyTakeaway: {
          en: "Shared rules create fair, peaceful competition.",
          ar: "القوانين المشتركة تصنع تنافساً شريفاً.",
        },
      },
    ],
  },
  {
    id: "path_c",
    code: "C",
    title: { en: "Path C · Discipline & Character", ar: "المسار ج · الانضباط وبناء الشخصية" },
    subtitle: {
      en: "Building emotional regulation, reliability, and quiet confidence without arrogance.",
      ar: "بناء التحكم بالانفعالات والاتزان والثقة الهادئة دون غرور.",
    },
    topics: [
      {
        id: "pc_anger",
        title: { en: "1. Cooling Heated Impulses", ar: "١. تهدئة الاندفاع عند الغضب" },
        summary: {
          en: "Recognize early stress cues (tight jaw, raised voice) and choose a pause before responding.",
          ar: "التعرّف إلى علامات التوتر المبكرة واختيار التريث قبل الرد.",
        },
        keyTakeaway: {
          en: "Responding thoughtfully beats reacting impulsively.",
          ar: "الاستجابة الواعية أرقى من رد الفعل المتسرع.",
        },
      },
      {
        id: "pc_consistency",
        title: {
          en: "2. Quiet Consistency Over Showmanship",
          ar: "٢. الثبات الهادئ بدل الاستعراض",
        },
        summary: {
          en: "True progress shows up in steady homework, helpfulness at home, and dependable conduct.",
          ar: "يظهر التقدم الحقيقي في الانتظام الدراسي ومساعدة الأسرة وحسن السلوك.",
        },
        keyTakeaway: {
          en: "Small daily habits outlast bursts of hype.",
          ar: "العادات اليومية الهادئة تدوم أكثر من الحماس المؤقت.",
        },
      },
    ],
  },
  {
    id: "path_d",
    code: "D",
    title: { en: "Path D · Healthy Physical Preparation", ar: "المسار د · الإعداد البدني الصحي" },
    subtitle: {
      en: "Safe general wellness: dynamic warm-ups, hydration, sleep, and rest (zero extreme dieting or medical claims).",
      ar: "العافية العامة الآمنة: الإحماء، وشرب الماء، والنوم، والراحة (دون أي حميات قاسية أو نصائح طبية).",
    },
    safetyNotice: {
      en: "Wellness education only—never a substitute for a doctor, physical therapist, or certified athletic coach.",
      ar: "تثقيف صحي عام فقط — ولا يُغني عن استشارة الطبيب أو المدرب المؤهل.",
    },
    topics: [
      {
        id: "pd_warmup",
        title: { en: "1. Gentle Warm-Up & Cool-Down", ar: "١. الإحماء التدريجي والتهدئة" },
        summary: {
          en: "Begin every workout with 5–10 minutes of light mobility and finish with relaxed breathing and stretching.",
          ar: "ابدأ أي نشاط بإحماء خفيف لـ ٥–١٠ دقائق واختمه بتهدئة وتنفس مريح.",
        },
        keyTakeaway: {
          en: "Warm muscles and calm joints move far more safely.",
          ar: "العضلات المهيأة والمفاصل الدافئة تتحرك بأمان أكبر.",
        },
      },
      {
        id: "pd_hydration",
        title: {
          en: "2. Hydration, Balanced Meals & Sleep",
          ar: "٢. الترطيب والتغذية المتوازنة والنوم",
        },
        summary: {
          en: "Growing students need steady hydration, wholesome meals, and 8–9 hours of sleep—never dehydration or rapid weight-cutting.",
          ar: "يحتاج الطالب إلى شرب الماء، وغذاء متوازن، ونوم كافٍ، مع رفض قاطع لإنقاص الوزن السريع.",
        },
        keyTakeaway: {
          en: "Health always outranks any scoreboard or weight category.",
          ar: "صحتك أهم من أي وزن أو نتيجة.",
        },
      },
      {
        id: "pd_recovery",
        title: {
          en: "3. Listening to Pain & Rest Days",
          ar: "٣. احترام إشارات الألم وأيام الراحة",
        },
        summary: {
          en: "Distinguish mild effort from sharp joint pain, dizziness, or swelling—stop and seek medical guidance immediately if injured.",
          ar: "التفريق بين الجهد الطبيعي والألم الحاد أو الدوار مع التوقف الفوري وطلب الرعاية الطبية عند الإصابة.",
        },
        keyTakeaway: {
          en: "Rest is part of smart progression.",
          ar: "الراحة جزء أساسي من التطور السليم.",
        },
      },
    ],
  },
  {
    id: "path_e",
    code: "E",
    title: {
      en: "Path E · Responsible Self-Protection",
      ar: "المسار هـ · الوقاية الذاتية المسؤولة",
    },
    subtitle: {
      en: "Situational awareness, boundary-setting, calm de-escalation, safe distance, and trusted help—zero fighting tactics.",
      ar: "الوعي المحيطي، ووضع الحدود، والتهدئة اللفظية، وحفظ المسافة، وطلب المساعدة — دون أي تقنيات قتالية.",
    },
    safetyNotice: {
      en: "Non-violent prevention & safety awareness only. Physical defense training belongs strictly under qualified, certified in-person supervision.",
      ar: "محتوى وقائي سلمي فقط؛ وأي تدريب بدني لا يكون إلا حضورياً تحت إشراف مدرب معتمد.",
    },
    topics: [
      {
        id: "pe_awareness",
        title: { en: "1. Situational Awareness & Exits", ar: "١. الوعي بالمحيط ومعرفة المخارج" },
        summary: {
          en: "Stay alert in public spaces (limit headphones in unfamiliar areas), notice well-lit routes, and keep clear exits.",
          ar: "الانتباه للمحيط في الأماكن العامة وملاحظة الممرات المضاءة والمخارج الآمنة.",
        },
        keyTakeaway: {
          en: "Prevention solves dangers long before confrontation starts.",
          ar: "الوقاية تجنّبك الخطر قبل بدايته.",
        },
      },
      {
        id: "pe_deescalation",
        title: {
          en: "2. Clear Voice, Calm Posture & De-Escalation",
          ar: "٢. الصوت الواضح والتهدئة اللفظية",
        },
        summary: {
          en: "Keep open hands visible, maintain safe personal space, and use brief respectful phrases to lower tension.",
          ar: "الحفاظ على مسافة آمنة ونبرة هادئة وعبارات موجزة تخفّض حدة التوتر.",
        },
        keyTakeaway: {
          en: "Walking away from ego conflict is wisdom, not weakness.",
          ar: "الانسحاب من جدال عقيم حكمة لا ضعف.",
        },
      },
      {
        id: "pe_help",
        title: {
          en: "3. Reaching Trusted Adults & Emergency Help",
          ar: "٣. اللجوء إلى بالغين موثوقين أو الطوارئ",
        },
        summary: {
          en: "Move toward staffed areas, teachers, parents, security personnel, or contact emergency services when anyone is at risk.",
          ar: "التوجّه نحو الأماكن المأهولة والمعلمين والوالدين والأمن أو الاتصال بالطوارئ عند أي تهديد.",
        },
        keyTakeaway: {
          en: "True protection prioritizes getting to safety fast.",
          ar: "الحماية الحقيقية أولويتها الوصول إلى الأمان بسرعة.",
        },
      },
    ],
  },
];

export const CHARACTER_DOJO_PILLARS: CharacterPillar[] = [
  {
    id: "char_respect",
    title: { en: "Respect", ar: "الاحترام" },
    definition: {
      en: "Recognizing the dignity of teachers, parents, peers, and beginners in every setting.",
      ar: "تقدير كرامة المعلمين والوالدين والأقران والمبتدئين في كل موقف.",
    },
    reflectionPrompt: {
      en: "Who helped you learn something recently, and how can you express gratitude today?",
      ar: "من ساعدك في تعلّم شيء حديثاً، وكيف تعبّر له عن شكرك اليوم؟",
    },
    scenarioQuestion: {
      en: "A new student struggles to follow group warm-up steps and drops their water bottle.",
      ar: "طالب جديد يجد صعوبة في متابعة خطوات الإحماء وسقطت قارورة مائه.",
    },
    options: [
      {
        en: "Help pick it up kindly and show the step slowly",
        ar: "تساعده بلطف وتشرح له الخطوة بهدوء",
        isWise: true,
        feedbackEn: "Warm hospitality reflects genuine Dojo character.",
        feedbackAr: "اللطف والترحيب يجسدان أخلاق الدوجو الأصيلة.",
      },
      {
        en: "Smile knowingly at friends so they notice",
        ar: "تبتسم لأصدقائك سخريةً من ارتباكه",
        isWise: false,
        feedbackEn: "Quiet mockery damages trust and violates Respect.",
        feedbackAr: "السخرية الخفية تهدم الثقة وتخالف مبدأ الاحترام.",
      },
    ],
  },
  {
    id: "char_humility",
    title: { en: "Humility", ar: "التواضع" },
    definition: {
      en: "Holding confidence quietly while remaining open to growth and correction.",
      ar: "ثقة هادئة بالنفس مع انفتاح دائم على التعلّم والتصحيح.",
    },
    reflectionPrompt: {
      en: "What mistake recently taught you a helpful lesson?",
      ar: "ما الخطأ الذي علّمك درساً مفيداً مؤخراً؟",
    },
    scenarioQuestion: {
      en: "You win first place in a school sports event while a close friend finishes unplaced.",
      ar: "فزت بالمركز الأول في مسابقة مدرسية بينما لم يحالف التوفيق صديقاً مقرباً.",
    },
    options: [
      {
        en: "Thank the organizers, shake hands warmly, and encourage your friend privately",
        ar: "تشكر المنظمين وتصافح الجميع بود وتُثني على جهد صديقك",
        isWise: true,
        feedbackEn: "Graciousness in victory honors both effort and friendship.",
        feedbackAr: "الرقي عند الفوز يحفظ الود ويُعلي من قدر الجهد.",
      },
      {
        en: "Boast repeatedly about how easy the event was",
        ar: "تتفاخر باستمرار بأن المنافسة كانت سهلة جداً",
        isWise: false,
        feedbackEn: "Boasting diminishes others' hard work and harms humility.",
        feedbackAr: "التفاخر ينتقص من جهد الآخرين ويخالف التواضع.",
      },
    ],
  },
  {
    id: "char_self_control",
    title: { en: "Self-Control", ar: "ضبط النفس" },
    definition: {
      en: "Choosing calm actions and measured words even when provoked or tired.",
      ar: "اختيار السلوك الهادئ والكلمة الموزونة حتى عند الاستفزاز أو التعب.",
    },
    reflectionPrompt: {
      en: "What personal trigger tends to make you impatient, and what calm reset works best for you?",
      ar: "ما الموقف الذي يثير تسرعك عادةً، وما أسلوب التهدئة الأنسب لك؟",
    },
    scenarioQuestion: {
      en: "Someone bumps your shoulder intentionally in a crowded corridor and mutters an insult.",
      ar: "تعمد أحدهم دفع كتفك في ممر مزدحم وتفوه بعبارة مسيئة.",
    },
    options: [
      {
        en: "Breathe steadily, maintain safe space, and report if harassment continues",
        ar: "تتنفس بهدوء وتحفظ مسافة آمنة وتبلغ مشرفاً إذا تكرر المضايقة",
        isWise: true,
        feedbackEn: "You stayed in charge of your choices and kept everyone safe.",
        feedbackAr: "حافظت على قيادة قرارك وحميت نفسك ومن حولك.",
      },
      {
        en: "Shove back so they know not to mess with you",
        ar: "تدفعه بالمثل كي يعرف أنك لا تسكت",
        isWise: false,
        feedbackEn: "Escalating turns a fleeting insult into dangerous conflict.",
        feedbackAr: "التصعيد يحوّل إساءة عابرة إلى أذى وخطر متفاقم.",
      },
    ],
  },
  {
    id: "char_responsibility",
    title: { en: "Responsibility", ar: "المسؤولية" },
    definition: {
      en: "Stepping up reliably for safety, commitments, and honest repair when errors happen.",
      ar: "الالتزام الموثوق بالسلامة والوعود وإصلاح الخطأ بصدق.",
    },
    reflectionPrompt: {
      en: "Where can you show stronger dependability in your family or study team this week?",
      ar: "أين يمكنك إظهار التزام أكبر مع أسرتك أو فريقك الدراسي هذا الأسبوع؟",
    },
    scenarioQuestion: {
      en: "You notice loose gear blocking an emergency exit door at a sports hall.",
      ar: "لاحظت معدات متناثرة تسد باب الخروج في صالة رياضية.",
    },
    options: [
      {
        en: "Move safe items neatly or alert staff immediately to keep the exit clear",
        ar: "تزيل العوائق بأمان أو تنبّه المشرف فوراً لإبقاء المخرج سالكاً",
        isWise: true,
        feedbackEn: "Responsibility notices hazards before accidents occur.",
        feedbackAr: "المسؤولية تعني المبادرة لدرء الخطر قبل وقوعه.",
      },
      {
        en: "Step over it because you didn't put it there",
        ar: "تتجاوزها لأنك لست من وضعها",
        isWise: false,
        feedbackEn: "Community safety belongs to everyone present.",
        feedbackAr: "السلامة الجماعية مسؤولية الجميع.",
      },
    ],
  },
  {
    id: "char_compassion",
    title: { en: "Compassion", ar: "الرحمة" },
    definition: {
      en: "Pairing courage with genuine kindness toward anyone vulnerable or discouraged.",
      ar: "مقارنة الشجاعة بالرحمة الصادقة تجاه الضعيف أو المحبط.",
    },
    reflectionPrompt: {
      en: "Think of one practical kindness you can offer without seeking praise.",
      ar: "فكّر في مبادرة خير عملية يمكنك تقديمها دون انتظار ثناء.",
    },
    scenarioQuestion: {
      en: "A younger student sits alone at lunch after being left out of a game.",
      ar: "طالب أصغر يجلس وحيداً بعد استبعاده من اللعب الجماعي.",
    },
    options: [
      {
        en: "Invite them warmly to join your table or group activity",
        ar: "تدعوه بلطف للجلوس أو المشاركة في النشاط",
        isWise: true,
        feedbackEn: "Small acts of inclusion transform someone's entire day.",
        feedbackAr: "مبادرة احتواء بسيطة قد تغيّر يوم إنسان بالكامل.",
      },
      {
        en: "Ignore it because it isn't your grade level",
        ar: "تتجاهل الأمر لأنه ليس من صفك الدراسي",
        isWise: false,
        feedbackEn: "Compassion reaches beyond social circles.",
        feedbackAr: "الرحمة تتجاوز حدود الصف والدائرة الضيقة.",
      },
    ],
  },
];

export const ANTI_BULLYING_LESSONS: Array<{
  id: string;
  title: BilingualText;
  point: BilingualText;
}> = [
  {
    id: "ab_1",
    title: { en: "1. What Bullying Actually Is", ar: "١. تعريف التنمر الحقيقي" },
    point: {
      en: "Repeated, intentional mistreatment—verbal, social exclusion, physical, or digital—using perceived power.",
      ar: "سلوك مؤذٍ متكرر ومقصود — لفظياً أو اجتماعياً أو بدنياً أو رقمياً — لاستغلال فرق القوة.",
    },
  },
  {
    id: "ab_2",
    title: {
      en: "2. Why Strength Never Justifies Intimidation",
      ar: "٢. لماذا لا تبرر القوة الترهيب أبداً",
    },
    point: {
      en: "Anyone who threatens others with athletic skill violates the very heart of martial arts ethics.",
      ar: "من يهدد الناس بمهارته الرياضية يخالف جوهر أخلاق فنون القتال.",
    },
  },
  {
    id: "ab_3",
    title: {
      en: "3. Recognizing Digital & Group Exclusion",
      ar: "٣. الانتباه للتنمر الرقمي والاستبعاد",
    },
    point: {
      en: "Mocking messages, screenshots, and silent group ostracism hurt deeply; refuse to forward or join in.",
      ar: "الرسائل الساخرة أو الإقصاء المتعمد تؤلم بشدة؛ ارفض إعادة نشرها أو المشاركة فيها.",
    },
  },
  {
    id: "ab_4",
    title: {
      en: "4. Safe Bystander Support (Without Fighting)",
      ar: "٤. مساندة المتضرر بأمان دون عراك",
    },
    point: {
      en: "Stand alongside the targeted person, redirect attention calmly, and escort them toward adults.",
      ar: "قف بجانب الشخص المستهدف واصرف الموقف بهدوء ورافقه نحو المشرفين.",
    },
  },
  {
    id: "ab_5",
    title: {
      en: "5. Reporting Is Courage, Not 'Snitching'",
      ar: "٥. الإبلاغ شجاعة وحماية لا وشاية",
    },
    point: {
      en: "Telling parents, teachers, or counselors stops ongoing harm and protects younger students too.",
      ar: "إبلاغ المعلمين أو الوالدين يوقف الأذى المتكرر ويحمي الأصغر سناً.",
    },
  },
  {
    id: "ab_6",
    title: { en: "6. Setting Clear Calm Boundaries", ar: "٦. وضع حدود واضحة بهدوء" },
    point: {
      en: "Short firm statements like 'Stop—that isn't okay' paired with leaving to a safe group deny escalators control.",
      ar: "عبارات قصيرة حازمة مثل «توقّف، هذا غير مقبول» مع المغادرة لمكان آمن.",
    },
  },
  {
    id: "ab_7",
    title: {
      en: "7. Refusing Peer Pressure to Show Off Moves",
      ar: "٧. رفض ضغط الأقران لاستعراض الحركات",
    },
    point: {
      en: "Friends asking for 'cool fights' don't face the injury risk—stay firm and decline.",
      ar: "الأصدقاء الذين يطلبون «عرضاً قتالياً» لا يتحملون خطر الإصابة — ارفض بثبات.",
    },
  },
  {
    id: "ab_8",
    title: {
      en: "8. Keeping Evidence When Cyberbullying Happens",
      ar: "٨. حفظ الأدلة عند التنمر الإلكتروني",
    },
    point: {
      en: "Save timestamps/screenshots, block the account, do not reply angrily, and show a trusted adult.",
      ar: "احتفظ بلقطات الشاشة، واحظر الحساب، ولا ترد بغضب، واعرض الأمر على بالغ موثوق.",
    },
  },
  {
    id: "ab_9",
    title: {
      en: "9. Emotional Recovery & Zero Self-Blame",
      ar: "٩. التعافي النفسي وعدم لوم الذات",
    },
    point: {
      en: "Being targeted by a bully is never the victim's fault; talking with counselors or family restores peace.",
      ar: "التعرّض للتنمر ليس ذنب الضحية أبداً؛ والحديث مع الأسرة أو المرشد يعيد الأمان.",
    },
  },
  {
    id: "ab_10",
    title: { en: "10. Building Inclusive Friendships", ar: "١٠. بناء صداقات تحترم الجميع" },
    point: {
      en: "Culture changes when student teams normalize welcoming newcomers and cheering effort.",
      ar: "تتغير بيئة المدرسة حين يصبح الترحيب بالجميع وتشجيع الجهد هو السائد.",
    },
  },
];

export const BULLYING_SCENARIOS: BullyingScenario[] = [
  {
    id: "sc_1_mocking_beginner",
    title: { en: "Scenario 1 · Mocking a Beginner", ar: "الموقف ١ · السخرية من مبتدئ" },
    situation: {
      en: "Two older students laugh loudly at a newcomer struggling with balance drills during gym class.",
      ar: "طالبان أكبر سناً يضحكان بصوت مرتفع على زميل جديد يجد صعوبة في التوازن.",
    },
    options: [
      {
        id: "sc1_a",
        label: {
          en: "Walk next to the beginner, offer a friendly tip, and alert the coach/teacher",
          ar: "تمشي بجانب المبتدئ وتشجعه بلطف وتنبّه المعلم",
        },
        isSafeWise: true,
        explanation: {
          en: "Solidarity removes the bullies' audience without starting a confrontation.",
          ar: "الوقوف بود بجانب الزميل ينهي السخرية دون خلق شجار.",
        },
      },
      {
        id: "sc1_b",
        label: {
          en: "Shove the older students to teach them a lesson",
          ar: "تدفع الطالبين لتلقينهما درساً",
        },
        isSafeWise: false,
        explanation: {
          en: "Physical retaliation escalates harm and breaks safety rules.",
          ar: "الرد البدني يضاعف الخطر ويخالف قواعد السلامة.",
        },
      },
    ],
  },
  {
    id: "sc_2_demo_move",
    title: {
      en: "Scenario 2 · Asked to Demonstrate a Dangerous Move",
      ar: "الموقف ٢ · طلب استعراض حركة خطرة",
    },
    situation: {
      en: "Classmates dare you at recess: 'Show us how a real choke or takedown works on Ali!'",
      ar: "يطلب زملاء في الاستراحة: «أرِنا كيف تُنفذ حركة إخضاع حقيقية على علي!»",
    },
    options: [
      {
        id: "sc2_a",
        label: {
          en: "Refuse clearly: 'No—techniques only happen on padded mats with a coach.'",
          ar: "ترفض بوضوح: «لا، التمارين تكون فقط على البساط وبإشراف مدرب»",
        },
        isSafeWise: true,
        explanation: {
          en: "Asphalt and untrained partners lead to serious concussions and joint injuries.",
          ar: "الساحات الصلبة وغياب المدرب يسببان إصابات خطيرة.",
        },
      },
      {
        id: "sc2_b",
        label: {
          en: "Do it gently at half speed so it looks cool",
          ar: "تنفذها بلطف وبنصف سرعة كي لا تبدو متردداً",
        },
        isSafeWise: false,
        explanation: {
          en: "Even 'half-speed' unplanned demonstrations on hard ground cause real harm.",
          ar: "حتى التنفيذ البطيء على أرض صلبة قد يسبب إصابة بالغة.",
        },
      },
    ],
  },
  {
    id: "sc_3_witnessing",
    title: {
      en: "Scenario 3 · Witnessing Bullying Behind School",
      ar: "الموقف ٣ · مشاهدة تنمر في فناء المدرسة",
    },
    situation: {
      en: "You see someone cornered and having their backpack tossed around by a group.",
      ar: "تشاهد مجموعة تحاصر طالباً وتتناقل حقيبته لإزعاجه.",
    },
    options: [
      {
        id: "sc3_a",
        label: {
          en: "Immediately summon a nearby teacher/supervisor and call out calmly to leave with the student",
          ar: "تستدعي فوراً أقرب معلم أو مشرف وتساعد الطالب على المغادرة بأمان",
        },
        isSafeWise: true,
        explanation: {
          en: "Getting adult supervision protects both you and the targeted student reliably.",
          ar: "استدعاء المشرفين يحمي المتضرر ويضمن سلامتك.",
        },
      },
      {
        id: "sc3_b",
        label: {
          en: "Pull out your phone to record a video",
          ar: "تخرج هاتفك لتصوير الموقف",
        },
        isSafeWise: false,
        explanation: {
          en: "Filming humiliates the victim further instead of getting help.",
          ar: "التصوير يضاعف أذى الضحية بدلاً من إنقاذه.",
        },
      },
    ],
  },
  {
    id: "sc_4_losing",
    title: {
      en: "Scenario 4 · Losing a Fair Competition",
      ar: "الموقف ٤ · الخسارة في منافسة عادلة",
    },
    situation: {
      en: "You lose a close match because of a minor mistake in the last seconds and feel intense frustration.",
      ar: "تخسر مباراة متقاربة في الثواني الأخيرة بسبب خطأ بسيط وتشعر بإحباط شديد.",
    },
    options: [
      {
        id: "sc4_a",
        label: {
          en: "Bow or shake hands respectfully, breathe slowly, and ask your coach what to refine",
          ar: "تصافح منافسك باحترام وتتنفس بهدوء وتسأل مدربك عمّا تحسّنه",
        },
        isSafeWise: true,
        explanation: {
          en: "Gracious defeat builds resilience faster than any easy win.",
          ar: "الرقي عند الخسارة يبني قوة شخصية أعمق من أي فوز سهل.",
        },
      },
      {
        id: "sc4_b",
        label: {
          en: "Blame the referee loudly and walk out without shaking hands",
          ar: "تصرخ على الحكم وتغادر دون تحية",
        },
        isSafeWise: false,
        explanation: {
          en: "Losing temper undermines sportsmanship and respect.",
          ar: "فقدان الأعصاب يفسد الروح الرياضية.",
        },
      },
    ],
  },
  {
    id: "sc_5_insult",
    title: {
      en: "Scenario 5 · Receiving a Taunt Online",
      ar: "الموقف ٥ · تلقي إهانة عبر الإنترنت",
    },
    situation: {
      en: "Someone leaves mocking comments on your study project or fitness progress.",
      ar: "يترك شخص تعليقات ساخرة على مشروعك الدراسي أو تقدمك الرياضي.",
    },
    options: [
      {
        id: "sc5_a",
        label: {
          en: "Screenshot for records, block/report the user, and share with a parent or mentor",
          ar: "تلتقط صورة للشاشة، وتحظر وتبلّغ، وتستشير والديك أو معلماً",
        },
        isSafeWise: true,
        explanation: {
          en: "Refusing to engage protects your mental energy and stops escalation.",
          ar: "تجنّب الجدال يحفظ طاقتك الذهنية ويوقف التصعيد.",
        },
      },
      {
        id: "sc5_b",
        label: {
          en: "Send back threats or organize friends to spam their page",
          ar: "ترسل تهديدات أو تحشد أصدقاءك لمهاجمة صفحته",
        },
        isSafeWise: false,
        explanation: {
          en: "Retaliation spreads harm and violates both Dojo ethics and school rules.",
          ar: "الانتقام ينشر الأذى ويخالف أخلاق الدوجو والنظام.",
        },
      },
    ],
  },
  {
    id: "sc_6_younger_student",
    title: {
      en: "Scenario 6 · Helping a Struggling Younger Student",
      ar: "الموقف ٦ · مساعدة طالب أصغر متعثر",
    },
    situation: {
      en: "A younger student feels nervous before their first assessment and wants to quit.",
      ar: "طالب أصغر يشعر بتوتر شديد قبل أول تقييم له ويفكر في الانسحاب.",
    },
    options: [
      {
        id: "sc6_a",
        label: {
          en: "Reassure them that everyone started as a beginner and review slow breathing together",
          ar: "تطمئنه بأن الجميع بدأ مبتدئاً وتشاركه تنفساً هادئاً",
        },
        isSafeWise: true,
        explanation: {
          en: "Empathy turns fear into steady confidence.",
          ar: "التعاطف يحوّل الخوف إلى ثقة هادئة.",
        },
      },
      {
        id: "sc6_b",
        label: {
          en: "Tell them maybe sports or study tracks just aren't for everyone",
          ar: "تخبره أن الرياضة أو الدراسة قد لا تناسب الجميع",
        },
        isSafeWise: false,
        explanation: {
          en: "Discouragement closes doors that patience would keep open.",
          ar: "التثبيط يغلق أبواباً يفتحها الصبر والتشجيع.",
        },
      },
    ],
  },
];

export const SAFE_TRAINING_TOPICS: Array<{
  id: string;
  title: BilingualText;
  guidance: BilingualText;
}> = [
  {
    id: "st_1",
    title: { en: "1. Certified In-Person Supervision", ar: "١. الإشراف الحضوري المؤهل" },
    guidance: {
      en: "Physical partner training must only happen under qualified coaches—never learned from random videos alone.",
      ar: "التدريب البدني الثنائي لا يكون إلا بحضور مدرب مؤهل، لا بمجرد تقليد مقاطع الفيديو.",
    },
  },
  {
    id: "st_2",
    title: { en: "2. Proper Protective Equipment", ar: "٢. معدات الوقاية المناسبة" },
    guidance: {
      en: "Use properly fitted headgear, mouthguards, masks, shin guards, or padded sticks appropriate to each sport.",
      ar: "استخدم الخوذة وواقي الفم والقناع وواقيات الساق المناسبة لكل رياضة وبمقاس سليم.",
    },
  },
  {
    id: "st_3",
    title: { en: "3. Gradual Warm-Ups & Mobility", ar: "٣. الإحماء التدريجي والمرونة" },
    guidance: {
      en: "Never force splits or cold maximal lifts; prepare joints gently for 8–10 minutes first.",
      ar: "لا تُجبر العضلات الباردة على الإطالة القصوى؛ ابدأ بإحماء هادئ لـ ٨–١٠ دقائق.",
    },
  },
  {
    id: "st_4",
    title: {
      en: "4. Zero Head Impact / Concussion Awareness",
      ar: "٤. الوعي بصحة الرأس والارتجاج",
    },
    guidance: {
      en: "Stop immediately after any head bump, dizziness, headache, blurred vision, or nausea and consult a doctor.",
      ar: "توقّف فوراً عند أي ضربة رأس أو دوار أو صداع أو غثيان وراجع الطبيب فوراً.",
    },
  },
  {
    id: "st_5",
    title: { en: "5. Respecting the 'Tap' Immediately", ar: "٥. احترام إشارة التوقف فوراً" },
    guidance: {
      en: "When a partner taps, says 'stop', or looks uncomfortable, halt instantly every single time.",
      ar: "عند أي إشارة توقف أو شعور بعدم الارتياح من الزميل، يجب التوقف الفوري دون تأخير.",
    },
  },
  {
    id: "st_6",
    title: { en: "6. Rejecting Dangerous Weight-Cutting", ar: "٦. رفض إنقاص الوزن الخطير" },
    guidance: {
      en: "Saunas, plastic suits, and dehydration before youth competitions endanger kidneys and hearts—never do them.",
      ar: "الامتناع عن السوائل أو استخدام ملابس التعرق القاسي لخفض الوزن خطر طبي جسيم ومرفوض تماماً.",
    },
  },
  {
    id: "st_7",
    title: { en: "7. Mat Hygiene & Skin Protection", ar: "٧. نظافة البساط والوقاية الجلدية" },
    guidance: {
      en: "Wash training gear after every session, trim nails, cover small scrapes, and shower promptly.",
      ar: "اغسل البدلة بعد كل تمرين، وقص الأظافر، وغطِّ الخدوش، واستحم بعد التدريب.",
    },
  },
  {
    id: "st_8",
    title: { en: "8. Safe Falling Foundations First", ar: "٨. أولوية أساسيات السقوط الآمن" },
    guidance: {
      en: "Tucking chin and slapping mats safely (under coaching) protects heads before any throwing drill.",
      ar: "حماية الرأس أثناء السقوط بإشراف المدرب تسبق أي تمارين رَمي أو إسقاط.",
    },
  },
  {
    id: "st_9",
    title: { en: "9. Age-Appropriate Rulesets", ar: "٩. قواعد مناسبة للعمر والنمو" },
    guidance: {
      en: "Youth rules prohibit high-risk locks and hard strikes to protect open growth plates.",
      ar: "تمنع قوانين الناشئين الحركات عالية الخطورة لحماية العظام والمفاصل في مرحلة النمو.",
    },
  },
  {
    id: "st_10",
    title: { en: "10. Hydration & Rest Between Sessions", ar: "١٠. الترطيب والراحة بين الجلسات" },
    guidance: {
      en: "Drink water before, during, and after activity, and schedule rest days weekly.",
      ar: "اشرب الماء بانتظام وخصّص أيام راحة أسبوعية لتعافي العضلات.",
    },
  },
  {
    id: "st_11",
    title: {
      en: "11. Zero Home 'Sparring' Without Adults",
      ar: "١١. منع المبارزة المنزلية غير المشرفة",
    },
    guidance: {
      en: "Unregulated living-room or backyard sparring without gear or adults leads to preventable ER visits.",
      ar: "التدريب التفاعلي العشوائي في المنزل أو الشارع دون معدات وإشراف يسبب إصابات خطيرة.",
    },
  },
  {
    id: "st_12",
    title: {
      en: "12. Safe Environment & Psychological Safety",
      ar: "١٢. السلامة النفسية واحترام المتدرب",
    },
    guidance: {
      en: "A healthy dojo never uses humiliation, yelling, or shaming; leave any gym that compromises dignity.",
      ar: "النادي السليم لا يستخدم الإهانة أو الصراخ المهين؛ غادر أي مكان ينتقص من كرامتك.",
    },
  },
  {
    id: "st_13",
    title: { en: "13. Reporting Pain or Unsafe Conditions", ar: "١٣. الإبلاغ عن الألم أو أي خطر" },
    guidance: {
      en: "Speak immediately to a parent, coach, or healthcare clinician whenever injury or unsafe peer conduct arises.",
      ar: "أخبر والديك أو المدرب أو الطبيب فوراً عند أي إصابة أو سلوك غير آمن.",
    },
  },
];

export const DOJO_KNOWLEDGE_QUIZ: DojoQuizQuestion[] = [
  {
    id: "dq_1",
    level: "foundation",
    kind: "mcq",
    prompt: {
      en: "Which Japanese term founded by Jigoro Kano in Judo means 'Mutual Welfare and Benefit'?",
      ar: "أي مبدأ أسّسه جيغورو كانو في الجودو يعني «المنفعة والخير المتبادل»؟",
    },
    options: [
      { en: "Jita-Kyoei", ar: "جيتا-كيوي (Jita-Kyoei)" },
      { en: "Full aggression", ar: "الهجوم الكامل" },
      { en: "Solo rivalry", ar: "التنافس الفردي الأعمى" },
    ],
    correctIndex: 0,
    explanation: {
      en: "Jita-Kyoei teaches that partners help each other progress safely together.",
      ar: "يعني مبدأ جيتا-كيوي أن يتعاون الشريكان في التعلّم بأمان وتقدم مشترك.",
    },
  },
  {
    id: "dq_2",
    level: "foundation",
    kind: "true_false",
    prompt: {
      en: "True or False: In traditional Kendo, boasting or pumping your fist after scoring a point is encouraged.",
      ar: "صح أم خطأ: في رياضة الكيندو التقليدية، يُشجَّع اللاعب على التباهي والاحتفال الصاخب بعد تسجيل نقطة.",
    },
    options: [
      { en: "True / صحيح", ar: "صحيح" },
      { en: "False / خطأ", ar: "خطأ" },
    ],
    correctIndex: 1,
    explanation: {
      en: "False — proud celebration (guts-pose) actually invalidates the point in Kendo rules because humility is mandatory.",
      ar: "خطأ — التباهي يلغي النقطة في قوانين الكيندو لأن التواضع ركيزة أساسية.",
    },
  },
  {
    id: "dq_3",
    level: "intermediate",
    kind: "mcq",
    prompt: {
      en: "Which phrase best captures the ethical core of Chinese 'Wude' (martial morality)?",
      ar: "أي عبارة تعبّر بدقة عن جوهر «ووده» (الأخلاق القتالية الصينية)؟",
    },
    options: [
      { en: "Winning at all costs regardless of rules", ar: "الفوز بأي ثمن ولو بمخالفة القانون" },
      {
        en: "Humility, righteousness, trust, respect, and self-restraint",
        ar: "التواضع والاستقامة والأمانة والاحترام وضبط النفس",
      },
      { en: "Demonstrating stunts on hard floors", ar: "استعراض الحركات في الأماكن غير المهيأة" },
    ],
    correctIndex: 1,
    explanation: {
      en: "Wude stresses morality of deed and mind—character precedes physical proficiency.",
      ar: "تربط ووده بين صلاح الفعل وصفاء القلب قبل المهارة الحركية.",
    },
  },
  {
    id: "dq_4",
    level: "intermediate",
    kind: "true_false",
    prompt: {
      en: "True or False: Olympic Fencing uses blunted sport blades, electronic scoring, and mandatory steel-mesh masks.",
      ar: "صح أم خطأ: تستخدم المبارزة الأولمبية أنصالاً رياضية غير حادة وتسجيلاً إلكترونياً وأقنعة حماية إلزامية.",
    },
    options: [
      { en: "True / صحيح", ar: "صحيح" },
      { en: "False / خطأ", ar: "خطأ" },
    ],
    correctIndex: 0,
    explanation: {
      en: "True — modern Olympic fencing prioritizes athlete safety with protective gear and strict etiquette.",
      ar: "صحيح — تضع المبارزة الأولمبية السلامة والآداب في المقام الأول.",
    },
  },
  {
    id: "dq_5",
    level: "applied",
    kind: "scenario",
    prompt: {
      en: "A student feels dizzy after bumping their head lightly in practice. What is the ONLY safe response?",
      ar: "شعر طالب بدوار بعد اصطدام خفيف بالرأس أثناء التمرين. ما الإجراء الآمن الوحيد؟",
    },
    options: [
      {
        en: "Drink cold water and jump right back into drills",
        ar: "شرب الماء والعودة فوراً للتمرين",
      },
      {
        en: "Stop immediately, inform the coach/parent, and seek medical evaluation",
        ar: "التوقف فوراً وإبلاغ المدرب وولي الأمر وطلب تقييم طبي",
      },
      {
        en: "Wait until the next day to mention it",
        ar: "الانتظار حتى اليوم التالي قبل ذكر الأمر",
      },
    ],
    correctIndex: 1,
    explanation: {
      en: "Any potential concussion sign requires immediate stop and professional medical evaluation.",
      ar: "أي علامة محتملة لإصابة الرأس تستوجب التوقف الفوري والفحص الطبي.",
    },
  },
  {
    id: "dq_6",
    level: "applied",
    kind: "scenario",
    prompt: {
      en: "Which response reflects Path E (Responsible Self-Protection) during a tense verbal argument?",
      ar: "أي تصرف يعكس المسار هـ (الوقاية الذاتية المسؤولة) أثناء مشادة لفظية متوترة؟",
    },
    options: [
      {
        en: "Keep calm distance, lower voice, step toward an exit/trusted adult",
        ar: "حفظ مسافة آمنة، وخفض الصوت، والانسحاب نحو مخرج أو شخص بالغ موثوق",
      },
      { en: "Close the distance to prove you are unafraid", ar: "الاقتراب لإثبات أنك لا تخاف" },
      { en: "Film the argument for social media", ar: "تصوير المشادة لنشرها على المنصات" },
    ],
    correctIndex: 0,
    explanation: {
      en: "Safe distance, calm de-escalation, and moving toward safety prevent harm.",
      ar: "المسافة الآمنة والتهدئة والانتقال إلى مكان آمن تمنع تفاقم الأذى.",
    },
  },
];

export const HUMANITY_CHALLENGES: Array<{
  id: string;
  title: BilingualText;
  description: BilingualText;
}> = [
  {
    id: "hc_kind_tip",
    title: { en: "7-Day Respect & Greeting Challenge", ar: "تحدي ٧ أيام من الاحترام والتحية" },
    description: {
      en: "Greet teachers, family, and peers with warmth and sincere gratitude every day for a week.",
      ar: "ألقِ التحية والامتنان الصادق على المعلمين والأسرة والزملاء يومياً لمدة أسبوع.",
    },
  },
  {
    id: "hc_calm_pause",
    title: { en: "3-Breath Calm Response Habit", ar: "عادة الأنفاس الثلاثة الهادئة" },
    description: {
      en: "Pause for three slow breaths before replying whenever frustration or rushing arises.",
      ar: "توقّف لثلاثة أنفاس هادئة قبل الرد عند الشعور بالضيق أو الاستعجال.",
    },
  },
  {
    id: "hc_include_peer",
    title: { en: "Include a Newcomer or Quiet Peer", ar: "إشراك زميل جديد أو هادئ" },
    description: {
      en: "Invite someone standing alone into your group project, table, or activity warmly.",
      ar: "ادعُ طالباً بمفرده للمشاركة في مجموعتك أو نشاطك بلطف.",
    },
  },
  {
    id: "hc_tidy_space",
    title: { en: "Leave Every Space Better", ar: "اترك المكان أفضل مما كان" },
    description: {
      en: "Neatly organize shared desks, mats, or study rooms without waiting to be asked.",
      ar: "رتّب مساحة الدراسة أو التمرين المشتركة دون انتظار طلب من أحد.",
    },
  },
  {
    id: "hc_study_focus",
    title: { en: "Dojo Focus Study Block", ar: "جلسة تركيز بانضباط الدوجو" },
    description: {
      en: "Apply silent focus and upright posture to a 25-minute distraction-free study sprint.",
      ar: "طبّق التركيز الهادئ والجلسة المستقيمة في جلسة مذاكرة لـ ٢٥ دقيقة.",
    },
  },
];

export const SAFEGUARDING_INSTRUCTOR_CHECKLIST: Array<{
  id: string;
  question: BilingualText;
  whyItMatters: BilingualText;
}> = [
  {
    id: "sg_1",
    question: {
      en: "Does the club verify instructor background checks, First Aid/CPR training, and coaching credentials?",
      ar: "هل يتحقق النادي من أهلية المدربين وشهادات الإسعافات الأولية واعتماد التدريب؟",
    },
    whyItMatters: {
      en: "NEXORA cannot verify external local clubs in person; parents should inspect credentials directly.",
      ar: "لا تستطيع منصة NEXORA فحص الأندية المحلية حضورياً؛ لذا يُرجى تحقق أولياء الأمور مباشرة.",
    },
  },
  {
    id: "sg_2",
    question: {
      en: "Are parents allowed to watch classes openly, and are youth separated safely by age and size?",
      ar: "هل يُسمح لأولياء الأمور بمتابعة الحصص علناً مع تقسيم الفئات حسب العمر والحجم؟",
    },
    whyItMatters: {
      en: "Open observation and age-matched groups are essential youth safeguarding practices.",
      ar: "الشفافية وتقسيم الفئات العمرية ركيزتان لحماية النشء.",
    },
  },
  {
    id: "sg_3",
    question: {
      en: "Does the dojo enforce clean mats, clear concussion/injury stop rules, and respectful non-humiliating coaching?",
      ar: "هل يلتزم النادي بنظافة البساط وقواعد التوقف عند الإصابة وبأسلوب تدريبي يحترم كرامة الطالب؟",
    },
    whyItMatters: {
      en: "Healthy martial arts build confidence through encouragement—never fear, shame, or bullying by coaches.",
      ar: "الفنون السليمة تبني الثقة بالتشجيع لا بالتخويف أو الإهانة.",
    },
  },
  {
    id: "sg_4",
    question: {
      en: "Are competition weight-cutting pressures strictly forbidden for minors?",
      ar: "هل يُمنع الضغط على الناشئين لإنقاص الوزن قبل البطولات؟",
    },
    whyItMatters: {
      en: "Growing youth athletes should compete at their natural healthy weight without dehydration.",
      ar: "يجب أن ينافس الناشئون بوزنهم الطبيعي الصحي دون تجفيف.",
    },
  },
];
