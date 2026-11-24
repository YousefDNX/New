/**
 * Grade 9 Unit 3 English Vocabulary Library
 * Unit Theme: Food, Culture & Healthy Living
 * Preserves exact British spelling conventions (e.g. flavour, fibre).
 */

export interface Unit3VocabItem {
  id: string;
  word: string;
  partOfSpeech: "noun" | "verb" | "adjective" | "adverb" | "phrase";
  phonetic: string;
  definitionEn: string;
  meaningAr: string;
  exampleEn: string;
  exampleAr: string;
  collocations: string[];
  synonyms: string[];
  unit: number;
  grade: number;
}

export const GRADE_9_UNIT_3_WORDS: Unit3VocabItem[] = [
  {
    id: "u3-reflect",
    word: "reflect",
    partOfSpeech: "verb",
    phonetic: "/rɪˈflekt/",
    definitionEn:
      "To think deeply or carefully about something; or to send back light, heat, or an image.",
    meaningAr: "يعكس / يتأمّل ويفكّر بعمق",
    exampleEn: "Our traditional meals reflect the rich cultural heritage of our ancestors.",
    exampleAr: "تعكس وجباتنا التقليدية التراث الثقافي الغني لأجدادنا.",
    collocations: ["reflect culture", "reflect on the past", "clearly reflect"],
    synonyms: ["mirror", "express", "contemplate"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-serve",
    word: "serve",
    partOfSpeech: "verb",
    phonetic: "/sɜːv/",
    definitionEn: "To present food or drink to someone at a meal; or to perform duties for others.",
    meaningAr: "يقدّم الطعام والشراب / يخدم",
    exampleEn: "Hospitality dictates that we serve hot mint tea and dates to all welcoming guests.",
    exampleAr: "تقتضي الضيافة أن نقدّم الشاي الساخن بالنعناع والتمر لجميع الضيوف المرحّب بهم.",
    collocations: ["serve guests", "serve hot", "serve dinner"],
    synonyms: ["provide", "dish up", "assist"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-symbol",
    word: "symbol",
    partOfSpeech: "noun",
    phonetic: "/ˈsɪm.bəl/",
    definitionEn: "A mark, object, or sign that represents an idea, quality, or process.",
    meaningAr: "رمز / إشارة دالّة",
    exampleEn: "The olive branch has been a universal symbol of peace for centuries.",
    exampleAr: "كان غصن الزيتون رمزاً عالمياً للسلام لقرون طويلة.",
    collocations: ["universal symbol", "symbol of peace", "national symbol"],
    synonyms: ["sign", "emblem", "representation"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-occasion",
    word: "occasion",
    partOfSpeech: "noun",
    phonetic: "/əˈkeɪ.ʒən/",
    definitionEn: "A particular event, celebration, or special time.",
    meaningAr: "مناسبة / احتفال / حدث خاص",
    exampleEn: "Graduation day is a memorable occasion that families celebrate with pride.",
    exampleAr: "يوم التخرج مناسبة لا تُنسى تحتفل بها العائلات بكل فخر.",
    collocations: ["special occasion", "festive occasion", "mark the occasion"],
    synonyms: ["celebration", "ceremony", "event"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-aromatic",
    word: "aromatic",
    partOfSpeech: "adjective",
    phonetic: "/ˌær.əˈmæt.ɪk/",
    definitionEn: "Having a pleasant, distinctive, and sweet or spicy smell.",
    meaningAr: "عطري / ذو رائحة زكيّة وفوّاحة",
    exampleEn: "Cardamom and saffron give Arabic coffee its aromatic fragrance.",
    exampleAr: "يمنح الهيل والزعفران القهوة العربية شذاها العطري الزكي.",
    collocations: ["aromatic spices", "aromatic herbs", "aromatic fragrance"],
    synonyms: ["fragrant", "scented", "perfumed"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-ingredient",
    word: "ingredient",
    partOfSpeech: "noun",
    phonetic: "/ɪnˈɡriː.di.ənt/",
    definitionEn: "One of the items of food you need to prepare a particular dish.",
    meaningAr: "مكوّن / عنصر في وصفة",
    exampleEn: "Fresh garlic and olive oil are the key ingredients in this salad dressing.",
    exampleAr: "الثوم الطازج وزيت الزيتون هما المكونان الأساسيان في تتبيلة هذه السلطة.",
    collocations: ["key ingredient", "fresh ingredients", "main ingredient"],
    synonyms: ["component", "element", "constituent"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-distinctive",
    word: "distinctive",
    partOfSpeech: "adjective",
    phonetic: "/dɪˈstɪŋk.tɪv/",
    definitionEn:
      "Having a special quality, style, or characteristic that makes something easily recognized.",
    meaningAr: "مميّز / فريد يسهل تمييزه",
    exampleEn: "Traditional Kuwaiti architecture has a distinctive style shaped by coastal life.",
    exampleAr: "تتميز العمارة الكويتية التقليدية بأسلوب مميّز شكّلته الحياة الساحلية.",
    collocations: ["distinctive style", "distinctive flavour", "distinctive feature"],
    synonyms: ["characteristic", "unique", "distinguishable"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-recipe",
    word: "recipe",
    partOfSpeech: "noun",
    phonetic: "/ˈres.ɪ.pi/",
    definitionEn: "A set of written instructions telling you how to prepare and cook food.",
    meaningAr: "وصفة طعام / طريقة التحضير",
    exampleEn: "My grandmother handed down a secret recipe for authentic machboos.",
    exampleAr: "أورثتنا جدتي وصفة سرية لتحضير المجبوس الأصيل.",
    collocations: ["secret recipe", "follow a recipe", "recipe book"],
    synonyms: ["formula", "cooking instructions", "directions"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-commonly",
    word: "commonly",
    partOfSpeech: "adverb",
    phonetic: "/ˈkɒm.ən.li/",
    definitionEn: "Often, frequently, or by most people in normal circumstances.",
    meaningAr: "عادةً / بشكل شائع / غالباً",
    exampleEn: "Lentils are commonly used in soups across Mediterranean and Arab cuisines.",
    exampleAr: "يُستخدم العدس عادةً في أطباق الحساء عبر مطابخ البحر المتوسط والمطبخ العربي.",
    collocations: ["commonly known", "commonly used", "commonly believed"],
    synonyms: ["frequently", "normally", "usually"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-flavour",
    word: "flavour",
    partOfSpeech: "noun",
    phonetic: "/ˈfleɪ.vər/",
    definitionEn:
      "The distinctive taste of food or drink, often combined with its aroma (British spelling).",
    meaningAr: "نكهة / مذاق الطعام والشراب",
    exampleEn: "Slow roasting spices in butter enhances the rich flavour of the sauce.",
    exampleAr: "تحميص التوابل ببطء في الزبدة يعزز النكهة الغنية للصلصة.",
    collocations: ["rich flavour", "natural flavour", "enhance the flavour"],
    synonyms: ["taste", "savour", "seasoning"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-embrace",
    word: "embrace",
    partOfSpeech: "verb",
    phonetic: "/ɪmˈbreɪs/",
    definitionEn: "To accept a new idea, habit, or belief enthusiastically and willingly.",
    meaningAr: "يتبنّى / يعتنق / يرحب بفكرة بحماس",
    exampleEn:
      "Young people readily embrace healthy nutritional habits when schools provide wholesome options.",
    exampleAr: "يتبنّى الشباب العادات الغذائية الصحية عن طيب خاطر عندما توفر المدارس خيارات مفيدة.",
    collocations: ["embrace change", "readily embrace", "embrace diversity"],
    synonyms: ["adopt", "welcome", "accept"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-variety",
    word: "variety",
    partOfSpeech: "noun",
    phonetic: "/vəˈraɪ.ə.ti/",
    definitionEn: "A collection of many different things of the same general type; diversity.",
    meaningAr: "تنوع / تشكيلة مختلفة",
    exampleEn: "Eating a wide variety of colourful fruits ensures you receive balanced vitamins.",
    exampleAr: "تناول تشكيلة متنوعة من الفواكه الملونة يضمن لك الحصول على فيتامينات متوازنة.",
    collocations: ["wide variety", "variety of dishes", "great variety"],
    synonyms: ["diversity", "assortment", "range"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-raw",
    word: "raw",
    partOfSpeech: "adjective",
    phonetic: "/rɔː/",
    definitionEn: "Not cooked; in a natural and unprocessed condition.",
    meaningAr: "نيء / غير مطبوخ / بحالته الطبيعية",
    exampleEn: "Some vegetables retain more delicate vitamins when consumed raw in fresh salads.",
    exampleAr:
      "تحتفظ بعض الخضراوات بالفيتامينات الحساسة بصورة أفضل عند تناولها نيئة في السلطات الطازجة.",
    collocations: ["raw vegetables", "raw materials", "eat raw"],
    synonyms: ["uncooked", "fresh", "unprocessed"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-energetic",
    word: "energetic",
    partOfSpeech: "adjective",
    phonetic: "/ˌen.əˈdʒet.ɪk/",
    definitionEn: "Having or involving great activity, enthusiasm, and physical vitality.",
    meaningAr: "مفعم بالنشاط / حيوي ونشيط",
    exampleEn:
      "A nutritious breakfast helps students remain energetic and attentive throughout the morning.",
    exampleAr: "تساعد وجبة الإفطار المغذية الطلاب على البقاء مفعمين بالنشاط والتركيز طوال الصباح.",
    collocations: ["energetic workout", "feel energetic", "energetic youth"],
    synonyms: ["vigorous", "active", "dynamic"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-source",
    word: "source",
    partOfSpeech: "noun",
    phonetic: "/sɔːs/",
    definitionEn: "The place, thing, or person from which something originates or can be obtained.",
    meaningAr: "مصدر / منبع",
    exampleEn: "Lentils and chickpeas are an exceptional source of plant-based protein.",
    exampleAr: "يعتبر العدس والحمص مصدراً استثنائياً للبروتين النباتي.",
    collocations: ["rich source", "primary source", "source of energy"],
    synonyms: ["origin", "fountainhead", "supplier"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-fibre",
    word: "fibre",
    partOfSpeech: "noun",
    phonetic: "/ˈfaɪ.bər/",
    definitionEn:
      "The indigestible plant substance that promotes healthy digestion (British spelling).",
    meaningAr: "ألياف غذائية تعزز صحة الجهاز الهضمي",
    exampleEn:
      "Whole grain oats are packed with dietary fibre, which regulates blood sugar levels.",
    exampleAr: "الشوفان كامل الحبة غني بالألياف الغذائية التي تضبط مستويات السكر في الدم.",
    collocations: ["dietary fibre", "high in fibre", "rich in fibre"],
    synonyms: ["roughage", "plant tissue"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-considerably",
    word: "considerably",
    partOfSpeech: "adverb",
    phonetic: "/kənˈsɪd.ər.ə.bli/",
    definitionEn: "To a notable, significant, or very large extent; noticeably.",
    meaningAr: "بدرجة كبيرة / إلى حد ملحوظ",
    exampleEn: "Reducing refined sugar consumption improves energy levels considerably.",
    exampleAr: "يؤدي تقليل استهلاك السكر المكرر إلى تحسين مستويات الطاقة بدرجة كبيرة.",
    collocations: ["improve considerably", "differ considerably", "increase considerably"],
    synonyms: ["substantially", "significantly", "greatly"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-homemade",
    word: "homemade",
    partOfSpeech: "adjective",
    phonetic: "/ˌhəʊmˈmeɪd/",
    definitionEn: "Made or prepared at home rather than bought from a commercial shop or factory.",
    meaningAr: "منزلي الصنع / بيتي طازج",
    exampleEn:
      "Homemade soup is far healthier than canned alternatives because it contains no preservatives.",
    exampleAr: "الحساء منزلي الصنع أكثر صحة بكثير من البدائل المعلبة لأنه خالٍ من المواد الحافظة.",
    collocations: ["homemade meal", "homemade bread", "fresh homemade"],
    synonyms: ["home-cooked", "handmade", "freshly made"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-produce",
    word: "produce",
    partOfSpeech: "noun",
    phonetic: "/ˈprɒd.juːs/",
    definitionEn: "Agricultural crops, especially fresh fruit, vegetables, and farm harvest.",
    meaningAr: "منتجات زراعية / خضار وفواكه طازجة",
    exampleEn:
      "The local farmers market offers fresh, locally grown produce every Saturday morning.",
    exampleAr: "يقدم سوق المزارعين المحلي محاصيل وخضروات طازجة محلية صباح كل سبت.",
    collocations: ["fresh produce", "local produce", "organic produce"],
    synonyms: ["harvest", "crops", "farm goods"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-organic",
    word: "organic",
    partOfSpeech: "adjective",
    phonetic: "/ɔːˈɡæn.ɪk/",
    definitionEn:
      "Produced without using artificial chemicals, synthetic fertilizers, or pesticides.",
    meaningAr: "عضوي / طبيعي خالٍ من المواد الكيميائية",
    exampleEn:
      "Consumers are willing to pay slightly more for organic apples free from toxic sprays.",
    exampleAr: "المستهلكون مستعدون لدفع المزيد قليلاً لشراء تفاح عضوي خالٍ من المبيدات السامة.",
    collocations: ["organic farming", "organic food", "certified organic"],
    synonyms: ["natural", "chemical-free", "biological"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-harmful",
    word: "harmful",
    partOfSpeech: "adjective",
    phonetic: "/ˈhɑːm.fəl/",
    definitionEn: "Causing or likely to cause damage, injury, illness, or disadvantage.",
    meaningAr: "ضار / مؤذٍ للصحة أو البيئة",
    exampleEn:
      "Excessive consumption of artificial colourings can be harmful to developing children.",
    exampleAr: "الإفراط في تناول الملونات الاصطناعية قد يكون ضاراً بالأطفال في طور النمو.",
    collocations: ["harmful effects", "harmful chemicals", "potentially harmful"],
    synonyms: ["damaging", "injurious", "detrimental"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-label",
    word: "label",
    partOfSpeech: "noun",
    phonetic: "/ˈleɪ.bəl/",
    definitionEn:
      "A piece of paper or plastic attached to an item that provides detailed information.",
    meaningAr: "ملصق بيانات / بطاقة تعريفية",
    exampleEn:
      "Always inspect the nutrition label on packaged cereals to check sugar and sodium content.",
    exampleAr: "تحقق دائماً من ملصق البيانات الغذائية على حبوب الإفطار لمعرفة نسبة السكر والصوديوم.",
    collocations: ["nutrition label", "food label", "read the label"],
    synonyms: ["tag", "marker", "specification ticket"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-obviously",
    word: "obviously",
    partOfSpeech: "adverb",
    phonetic: "/ˈɒb.vi.əs.li/",
    definitionEn: "In a way that is easily seen, understood, or recognized; clearly.",
    meaningAr: "بوضوح / من البديهي / بصورة جلية",
    exampleEn:
      "Drinking adequate water is obviously essential for maintaining body temperature and focus.",
    exampleAr: "شرب كميات كافية من الماء أمر بديهي وأساسي للحفاظ على حرارة الجسم والتركيز.",
    collocations: ["obviously true", "obviously important", "most obviously"],
    synonyms: ["clearly", "evidently", "plainly"],
    unit: 3,
    grade: 9,
  },
  {
    id: "u3-maintain",
    word: "maintain",
    partOfSpeech: "verb",
    phonetic: "/meɪnˈteɪn/",
    definitionEn:
      "To cause something to continue in the same state, preserve, or keep in good condition.",
    meaningAr: "يحافظ على / يصون / يُبقي الشيء في حالة جيدة",
    exampleEn: "Regular physical activity helps students maintain a healthy cardiovascular system.",
    exampleAr: "يساعد النشاط البدني المنتظم الطلاب على الحفاظ على صحة القلب والأوعية الدموية.",
    collocations: ["maintain health", "maintain balance", "maintain standards"],
    synonyms: ["preserve", "sustain", "keep up"],
    unit: 3,
    grade: 9,
  },
];

export interface Unit3QuizQuestion {
  id: string;
  word: string;
  questionEn: string;
  questionAr?: string;
  options: string[];
  correctIndex: number;
  explanationEn: string;
  explanationAr: string;
}

export interface Unit3QuizTier {
  id: "beginner" | "intermediate" | "advanced" | "mixed" | "final";
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  xpReward: number;
  questions: Unit3QuizQuestion[];
}

export const UNIT_3_QUIZZES: Unit3QuizTier[] = [
  {
    id: "beginner",
    titleEn: "Beginner Quiz: Fundamentals & Definitions",
    titleAr: "اختبار المبتدئين: المعاني والمفاهيم الأساسية",
    descriptionEn:
      "Test core definitions and direct Arabic translations of key culinary vocabulary.",
    descriptionAr: "اختبر معرفتك بالمعاني المباشرة وترجمات الكلمات الأساسية للوحدة.",
    xpReward: 25,
    questions: [
      {
        id: "q-b1",
        word: "recipe",
        questionEn:
          "What is a set of written instructions for preparing and cooking a dish called?",
        questionAr: "ماذا تُسمى مجموعة التعليمات المكتوبة لتحضير وطبخ طبق معين؟",
        options: ["recipe", "ingredient", "symbol", "produce"],
        correctIndex: 0,
        explanationEn: "A 'recipe' contains the ingredients and steps required to cook a dish.",
        explanationAr: "'Recipe' تعني وصفة طعام تحتوي على خطوات ومكونات التحضير.",
      },
      {
        id: "q-b2",
        word: "aromatic",
        questionEn:
          "Which word describes something that has a pleasant, distinctive, and sweet smell?",
        questionAr: "أي كلمة تصف شيئاً ذا رائحة زكية وفوّاحة ومميّزة؟",
        options: ["harmful", "raw", "aromatic", "energetic"],
        correctIndex: 2,
        explanationEn: "'Aromatic' refers to spices or herbs that produce a fragrant aroma.",
        explanationAr: "'Aromatic' تعني عطري أو فوّاح الرائحة مثل الهيل والزعفران.",
      },
      {
        id: "q-b3",
        word: "ingredient",
        questionEn: "Tomatoes and onions are two essential _____ in salsa sauce.",
        questionAr: "الطماطم والبصل هما اثنان من _____ الأساسية في صلصة الصلصا.",
        options: ["symbols", "occasions", "ingredients", "labels"],
        correctIndex: 2,
        explanationEn: "An 'ingredient' is any food item used to construct a cooked dish.",
        explanationAr: "'Ingredient' تعني مكوّن أو عنصر يدخل في تحضير الوجبة.",
      },
      {
        id: "q-b4",
        word: "symbol",
        questionEn: "What is the Arabic meaning of the word 'symbol'?",
        questionAr: "ما هو المعنى الصحيح لكلمة 'symbol' باللغة العربية؟",
        options: ["وصفة", "رمز أو دلالة", "مكوّن", "نكهة"],
        correctIndex: 1,
        explanationEn: "'Symbol' translates to 'رمز' (an emblem or sign representing an idea).",
        explanationAr: "'Symbol' تعني رمزاً أو إشارة تمثل فكرة أو معنى مجرداً.",
      },
      {
        id: "q-b5",
        word: "homemade",
        questionEn: "Food prepared in a family kitchen rather than a factory is termed:",
        questionAr: "الطعام المحضّر في مطبخ المنزل بدلاً من المصانع يُسمى:",
        options: ["organic", "homemade", "raw", "distinctive"],
        correctIndex: 1,
        explanationEn:
          "'Homemade' means made at home, usually fresher and with fewer preservatives.",
        explanationAr: "'Homemade' تعني منزلي الصنع، وغالباً ما يكون أكثر فائدة وصحة.",
      },
      {
        id: "q-b6",
        word: "serve",
        questionEn: "To present food or drinks to guests at a dining table means to:",
        questionAr: "أن تقدم الطعام والشراب للضيوف على مائدة الطعام يعني أن:",
        options: ["maintain", "embrace", "serve", "reflect"],
        correctIndex: 2,
        explanationEn: "To 'serve' means to hand out or present refreshments and meals.",
        explanationAr: "'Serve' تعني يقدّم الطعام أو يقوم بخدمة الضيوف.",
      },
      {
        id: "q-b7",
        word: "harmful",
        questionEn: "Chemical additives that cause damage or health hazards are described as:",
        questionAr: "المضافات الكيميائية التي تسبب أضراراً ومخاطر صحية توصف بأنها:",
        options: ["energetic", "harmful", "distinctive", "aromatic"],
        correctIndex: 1,
        explanationEn:
          "'Harmful' describes anything that causes harm, damage, or negative effects.",
        explanationAr: "'Harmful' تعني ضار أو مؤذٍ للصحة.",
      },
      {
        id: "q-b8",
        word: "produce",
        questionEn:
          "In agriculture and grocery markets, fresh fruits and vegetables are referred to as:",
        questionAr: "في الزراعة وأسواق الأغذية، يُشار إلى الخضروات والفواكه الطازجة باسم:",
        options: ["produce", "variety", "occasion", "fibre"],
        correctIndex: 0,
        explanationEn: "As a noun, 'produce' (pronounced /ˈprɒd.juːs/) denotes harvested crops.",
        explanationAr: "كلمة 'produce' كاسم تشير إلى الغلال والمنتجات الزراعية الطازجة.",
      },
    ],
  },
  {
    id: "intermediate",
    titleEn: "Intermediate Quiz: Sentence Mastery & Parts of Speech",
    titleAr: "اختبار المستوى المتوسط: تركيب الجمل وأقسام الكلام",
    descriptionEn:
      "Practice applying vocabulary in contextual sentences with accurate grammatical roles.",
    descriptionAr: "تدرب على توظيف المفردات في سياقات لغوية متكاملة وبشكل نحوي دقيق.",
    xpReward: 35,
    questions: [
      {
        id: "q-i1",
        word: "reflect",
        questionEn:
          "The traditional spices used in Kuwaiti machboos _____ historical maritime trade with India.",
        questionAr:
          "التوابل التقليدية المستخدمة في المجبوس الكويتي _____ التجارة البحرية التاريخية مع الهند.",
        options: ["maintain", "reflect", "embrace", "serve"],
        correctIndex: 1,
        explanationEn:
          "'Reflect' means to demonstrate, mirror, or show the existence of past connections.",
        explanationAr: "'Reflect' تعني تعكس وتُظهر الروابط التجارية والتاريخية العريقة.",
      },
      {
        id: "q-i2",
        word: "fibre",
        questionEn:
          "Which British spelling correctly names the indigestible nutrient that aids digestion?",
        questionAr: "أي هجاء بريطاني يمثل العنصر الغذائي الذي يعزز عملية الهضم؟",
        options: ["fiber", "fibre", "fibar", "phybre"],
        correctIndex: 1,
        explanationEn: "In British curriculum English, the official spelling is 'fibre' with -re.",
        explanationAr: "في المنهج البريطاني، الهجاء المعتمد هو 'fibre' بألياف تنتهي بـ re.",
      },
      {
        id: "q-i3",
        word: "flavour",
        questionEn:
          "Adding fresh coriander leaves at the very end of cooking enhances the stew's _____.",
        questionAr: "إضافة أوراق الكزبرة الطازجة في ختام الطهي يعزز _____ الحساء.",
        options: ["occasion", "flavour", "label", "recipe"],
        correctIndex: 1,
        explanationEn:
          "'Flavour' (British spelling) denotes the combined taste and scent of a dish.",
        explanationAr: "'Flavour' تعني نكهة ومذاق الطعام بالهجاء البريطاني الأصيل.",
      },
      {
        id: "q-i4",
        word: "considerably",
        questionEn: "Students who replace soda with water improve their cognitive stamina _____.",
        questionAr: "الطلاب الذين يستبدلون المشروبات الغازية بالماء يزداد نشاطهم الذهني _____.",
        options: ["commonly", "obviously", "considerably", "raw"],
        correctIndex: 2,
        explanationEn:
          "'Considerably' is an adverb meaning 'to a significant and remarkable degree'.",
        explanationAr: "'Considerably' ظرف يعني بدرجة كبيرة وإلى حد ملحوظ.",
      },
      {
        id: "q-i5",
        word: "embrace",
        questionEn:
          "Schools should encourage teenagers to _____ active lifestyles and balanced diets.",
        questionAr: "ينبغي على المدارس تشجيع المراهقين على _____ أسلوب حياة نشط وغذاء متوازن.",
        options: ["embrace", "reflect", "label", "serve"],
        correctIndex: 0,
        explanationEn:
          "To 'embrace' an idea means to adopt it willingly and with genuine commitment.",
        explanationAr: "'Embrace' تعني يتبنّى ويعتنق نمط حياة صحي بحماس.",
      },
      {
        id: "q-i6",
        word: "energetic",
        questionEn: "What is the part of speech of the word 'energetic'?",
        questionAr: "ما هو تصنيف كلمة 'energetic' من أقسام الكلام؟",
        options: ["Noun", "Verb", "Adjective", "Adverb"],
        correctIndex: 2,
        explanationEn:
          "'Energetic' is an adjective that describes someone full of vitality and vigor.",
        explanationAr: "'Energetic' هي صفة (Adjective) تصف الشخص النشيط والمفعم بالحيوية.",
      },
      {
        id: "q-i7",
        word: "organic",
        questionEn:
          "Apples grown without synthetic sprays and toxic fertilizers are classified as _____ produce.",
        questionAr: "التفاح المزروع دون رش اصطناعي أو أسمدة كيميائية يُصنّف كمنتج _____.",
        options: ["distinctive", "organic", "raw", "homemade"],
        correctIndex: 1,
        explanationEn:
          "'Organic' describes food produced via ecological and chemical-free methods.",
        explanationAr: "'Organic' تعني عضوي أو طبيعي بالكامل دون تدخل كيميائي.",
      },
      {
        id: "q-i8",
        word: "source",
        questionEn: "Citrus fruits like oranges and lemons are a rich _____ of vitamin C.",
        questionAr: "تعتبر الحمضيات كالبرتقال والليمون _____ غنياً بفيتامين سي.",
        options: ["occasion", "symbol", "source", "variety"],
        correctIndex: 2,
        explanationEn:
          "'Source' refers to where a nutrient or resource originates and is supplied.",
        explanationAr: "'Source' تعني مصدراً أو منبعاً غنياً بالعناصر الغذائية.",
      },
      {
        id: "q-i9",
        word: "distinctive",
        questionEn:
          "Saffron imparts a bright yellow colour and a _____ earthy aroma to festive rice dishes.",
        questionAr: "يمنح الزعفران لوناً أصفر زاهياً ورائحة ترابية _____ لأطباق الأرز في الاحتفالات.",
        options: ["harmful", "distinctive", "commonly", "raw"],
        correctIndex: 1,
        explanationEn: "'Distinctive' signifies an unmistakable quality that stands apart clearly.",
        explanationAr: "'Distinctive' تعني مميزاً وفريداً يسهل تمييزه عن غيره.",
      },
      {
        id: "q-i10",
        word: "maintain",
        questionEn:
          "Drinking enough fluids during athletic training is vital to _____ proper hydration.",
        questionAr:
          "تناول سوائل كافية أثناء التدريب الرياضي أمر حيوي لـ _____ الترطيب السليم للجسم.",
        options: ["maintain", "reflect", "embrace", "serve"],
        correctIndex: 0,
        explanationEn: "'Maintain' means to keep in an optimal state over time without decline.",
        explanationAr: "'Maintain' تعني يحافظ على المستوى المتوازن ويصونه.",
      },
    ],
  },
  {
    id: "advanced",
    titleEn: "Advanced Quiz: Nuance, Collocations & British Spelling",
    titleAr: "اختبار المستوى المتقدم: الدقة اللغوية والهجاء البريطاني",
    descriptionEn:
      "Challenge your command of subtle connotations, contextual appropriateness, and British spelling rules.",
    descriptionAr:
      "تحدَّ براعتك اللغوية في التمييز بين الفروق الدقيقة وقواعد الهجاء الإنجليزي الدقيق.",
    xpReward: 50,
    questions: [
      {
        id: "q-a1",
        word: "flavour",
        questionEn:
          "Identify the sentence that correctly adheres to Grade 9 British curriculum spelling standards:",
        questionAr: "حدد الجملة التي تلتزم بمعايير الهجاء البريطاني لمنهج الصف التاسع بدقة:",
        options: [
          "The natural flavor of cardamom enhances the tea.",
          "The natural flavour of cardamom enhances the tea.",
          "The natural flaver of cardamom enhances the tea.",
          "The natural flavur of cardamom enhances the tea.",
        ],
        correctIndex: 1,
        explanationEn:
          "British English preserves the 'our' ending in words such as 'flavour' and 'colour'.",
        explanationAr: "اللغة الإنجليزية البريطانية تحافظ على النهاية 'our' في كلمة 'flavour'.",
      },
      {
        id: "q-a2",
        word: "fibre",
        questionEn:
          "Which pair correctly highlights the British spelling of the two Grade 9 vocabulary words?",
        questionAr: "أي زوج يمثل الهجاء البريطاني الصحيح للكلمتين في منهج الصف التاسع؟",
        options: ["fiber & flavor", "fibre & flavour", "fiber & flavour", "fibre & flavor"],
        correctIndex: 1,
        explanationEn:
          "Both 'fibre' (-re) and 'flavour' (-our) are the official British forms tested in Kuwait curricula.",
        explanationAr:
          "كلا الكلمتين 'fibre' و 'flavour' هما الصيغتان البريطانيتان المعتمدتان في المنهج.",
      },
      {
        id: "q-a3",
        word: "label",
        questionEn:
          "Before purchasing packaged juice, an observant shopper should scrutinise the nutrition _____.",
        questionAr: "قبل شراء العصير المعلب، ينبغي على المتسوق الفطن فحص _____ الغذائي بعناية.",
        options: ["symbol", "recipe", "label", "produce"],
        correctIndex: 2,
        explanationEn:
          "A 'nutrition label' displays mandatory information on calories, sugars, and additives.",
        explanationAr: "'Nutrition label' هو ملصق الحقائق والبيانات الغذائية الملصق على العبوة.",
      },
      {
        id: "q-a4",
        word: "raw",
        questionEn:
          "Which food item is most safely and nutrient-densely consumed in its 'raw' form?",
        questionAr: "أي صنف غذائي يمكن تناوله بشكله 'النيء' بأمان تام مع أقصى فائدة غذائية؟",
        options: [
          "Fresh baby spinach",
          "Uncooked chicken breast",
          "Raw kidney beans",
          "Unpasteurised wild cassava",
        ],
        correctIndex: 0,
        explanationEn:
          "Tender leafy greens like baby spinach are commonly eaten raw to preserve heat-sensitive vitamin C.",
        explanationAr: "السبانخ الطازجة تُؤكل نيئة للحفاظ على فيتامين سي الحساس للحرارة.",
      },
      {
        id: "q-a5",
        word: "occasion",
        questionEn:
          "Eid celebrations and national festivals are regarded as joyous _____ across the Gulf region.",
        questionAr:
          "تُعد احتفالات العيد والمهرجانات الوطنية _____ بهيجة في كافة أرجاء منطقة الخليج.",
        options: ["recipes", "occasions", "substances", "labels"],
        correctIndex: 1,
        explanationEn:
          "'Occasions' denotes formal or cultural celebratory events marked by community gatherings.",
        explanationAr: "'Occasions' تشير إلى المناسبات والأعياد الاجتماعية والوطنية.",
      },
      {
        id: "q-a6",
        word: "commonly",
        questionEn:
          "In the sentence 'Dates are commonly offered as a gesture of hospitality', 'commonly' functions as:",
        questionAr: "في الجملة السابقة، ما هي الوظيفة النحوية لكلمة 'commonly'؟",
        options: [
          "An adjective describing dates",
          "An adverb modifying the passive verb 'are offered'",
          "A relative noun",
          "A preposition",
        ],
        correctIndex: 1,
        explanationEn:
          "'Commonly' is an adverb of frequency modifying the verb phrase 'are offered'.",
        explanationAr: "'Commonly' هي ظرف تكرار (adverb) يوضح تكرار تقديم التمر كعادة شائعة.",
      },
      {
        id: "q-a7",
        word: "variety",
        questionEn:
          "Dietitians emphasize dietary _____ because no single food group can supply every essential micronutrient.",
        questionAr:
          "يؤكد خبراء التغذية على _____ الغذائي لأن أي طعام بمفرده لا يوفر جميع المغذيات الدقيقة.",
        options: ["symbol", "variety", "occasion", "produce"],
        correctIndex: 1,
        explanationEn:
          "'Dietary variety' is the established collocation denoting the inclusion of diverse food groups.",
        explanationAr: "'Dietary variety' هو التعبير الدال على التنوع الغذائي بين مختلف المجموعات.",
      },
      {
        id: "q-a8",
        word: "obviously",
        questionEn: "Choose the word that serves as a synonym for 'evidently' or 'clearly':",
        questionAr: "اختر الكلمة التي تعطي نفس معنى 'evidently' أو 'clearly':",
        options: ["considerably", "aromatic", "obviously", "distinctive"],
        correctIndex: 2,
        explanationEn:
          "'Obviously' means in a manner that requires no explanation because it is self-evident.",
        explanationAr: "'Obviously' تعني بوضوح وبصورة بديهية لا تحتاج إلى برهان.",
      },
      {
        id: "q-a9",
        word: "distinctive",
        questionEn: "The phrase 'distinctive feature' most closely aligns with which meaning?",
        questionAr: "أي معنى هو الأقرب لعبارة 'distinctive feature'؟",
        options: [
          "A trait that causes confusion and error",
          "An easily noticed characteristic distinguishing an entity from others",
          "A temporary phase that vanishes quickly",
          "An expensive addition with little utility",
        ],
        correctIndex: 1,
        explanationEn: "'Distinctive' highlights uniqueness and ease of identification.",
        explanationAr: "'Distinctive' تعني سمة فارقة تميز الشيء عن غيره بوضوح.",
      },
      {
        id: "q-a10",
        word: "energetic",
        questionEn:
          "Which lifestyle factor most directly aids students in feeling 'energetic' throughout school days?",
        questionAr: "أي عامل نمط حياة يساعد الطلاب بشكل مباشر على الشعور بالحيوية والنشاط؟",
        options: [
          "Skipping breakfast to save time",
          "Consistent 8-hour sleep coupled with nutrient-dense meals",
          "Consuming energy drinks containing high chemical caffeine",
          "Studying continuously without physical pauses",
        ],
        correctIndex: 1,
        explanationEn:
          "Healthy balanced sleep and whole-food nutrition produce sustained cellular energy.",
        explanationAr: "النوم المنتظم والتغذية الصحية هما الأساس الفعلي للطاقة والنشاط المستدام.",
      },
      {
        id: "q-a11",
        word: "reflect",
        questionEn:
          "Select the sentence where 'reflect' means 'to contemplate or deliberate deeply':",
        questionAr: "اختر الجملة التي تأتي فيها كلمة 'reflect' بمعنى 'يتأمل ويفكر بعمق':",
        options: [
          "The polished mirror reflects sunlight into the classroom.",
          "At the close of each term, wise learners reflect on their academic habits.",
          "The calm lake reflects the towering mountain peaks.",
          "Shiny car chrome reflects headlights at night.",
        ],
        correctIndex: 1,
        explanationEn:
          "In educational contexts, 'reflect on' indicates self-assessment and deep thought.",
        explanationAr:
          "في السياق التعليمي، 'reflect on' تعني التفكير التأملي ومراجعة الذات والقرارات.",
      },
      {
        id: "q-a12",
        word: "maintain",
        questionEn:
          "Which collocation with 'maintain' is standard when discussing athletic and cardiovascular health?",
        questionAr: "أي تعبير هو المتداول والأصح عند الحديث عن اللياقة وصحة القلب؟",
        options: [
          "maintain physical fitness",
          "maintain aromatic spices",
          "maintain raw recipes",
          "maintain produce symbols",
        ],
        correctIndex: 0,
        explanationEn:
          "'Maintain physical fitness' is the canonical collocation used in health education.",
        explanationAr:
          "'Maintain physical fitness' هو التعبير الاصطلاحي الشائع للحفاظ على اللياقة البدنية.",
      },
    ],
  },
  {
    id: "mixed",
    titleEn: "Mixed Comprehensive Quiz: Rapid Diagnostic",
    titleAr: "الاختبار الشامل المختلط: تقييم سريع متكامل",
    descriptionEn:
      "15 varied questions spanning vocabulary definitions, sentence contexts, and spelling.",
    descriptionAr: "15 سؤالاً متنوعاً يغطي معاني المفردات، السياقات التطبيقية، وقواعد الهجاء.",
    xpReward: 60,
    questions: [
      {
        id: "q-m1",
        word: "recipe",
        questionEn:
          "If you want to bake authentic whole-wheat bread, you must carefully follow the _____.",
        questionAr: "إذا أردت خبز خبز القمح الكامل الأصيل، يجب عليك اتباع الـ _____ بدقة.",
        options: ["occasion", "recipe", "label", "source"],
        correctIndex: 1,
        explanationEn: "A recipe provides instructions for baking and food preparation.",
        explanationAr: "الوصفة (recipe) توفر الإرشادات اللازمة للخبز والطهي.",
      },
      {
        id: "q-m2",
        word: "fibre",
        questionEn: "Which nutrient found in bran and vegetables prevents digestive sluggishness?",
        questionAr: "أي عنصر غذائي موجود في النخالة والخضراوات يحمي من اضطرابات الهضم؟",
        options: ["sugar", "fibre", "artificial flavour", "preservative"],
        correctIndex: 1,
        explanationEn: "'Fibre' (British spelling) promotes smooth gastrointestinal health.",
        explanationAr: "'Fibre' هي الألياف الغذائية بالهجاء البريطاني.",
      },
      {
        id: "q-m3",
        word: "harmful",
        questionEn: "What is the antonym (opposite meaning) of 'harmful'?",
        questionAr: "ما هو المضاد (عكس المعنى) لكلمة 'harmful'؟",
        options: ["damaging", "beneficial", "raw", "aromatic"],
        correctIndex: 1,
        explanationEn: "'Beneficial' is the exact opposite of 'harmful'.",
        explanationAr: "'Beneficial' (نافع ومفيد) هي عكس كلمة 'harmful' (ضار).",
      },
      {
        id: "q-m4",
        word: "produce",
        questionEn: "Supermarkets store fresh carrots, greens, and apples in the _____ aisle.",
        questionAr: "تخزن الأسواق المركزية الجزر والخضار والتفاح في ممر _____.",
        options: ["canned goods", "fresh produce", "beverages", "confectionery"],
        correctIndex: 1,
        explanationEn: "'Fresh produce' refers to agricultural fruit and vegetable sections.",
        explanationAr: "'Fresh produce' تعني قسم الخضار والفواكه والمحاصيل الطازجة.",
      },
      {
        id: "q-m5",
        word: "organic",
        questionEn: "What does 'organic farming' prohibit the use of?",
        questionAr: "ما الذي تمنع الزراعة العضوية (organic farming) استخدامه؟",
        options: [
          "Natural sunlight",
          "Rainwater irrigation",
          "Synthetic chemical pesticides",
          "Compost organic fertilizer",
        ],
        correctIndex: 2,
        explanationEn:
          "Organic standards strictly ban artificial pesticides and chemical fertilizers.",
        explanationAr: "تمنع المعايير العضوية استخدام المبيدات والأسمدة الكيميائية المصنعة.",
      },
      {
        id: "q-m6",
        word: "aromatic",
        questionEn:
          "Rose water and crushed cardamom are prized in Gulf desserts for their _____ qualities.",
        questionAr: "يُقدّر ماء الورد والهيل المطحون في الحلويات الخليجية لخصائصها الـ _____.",
        options: ["harmful", "raw", "aromatic", "considerable"],
        correctIndex: 2,
        explanationEn: "'Aromatic' refers to pleasant, distinctive fragrance.",
        explanationAr: "'Aromatic' تعني ذات رائحة عطرية زكية تمنح الحلويات مذاقاً متميزاً.",
      },
      {
        id: "q-m7",
        word: "ingredient",
        questionEn:
          "Without yeast, bread will not rise; therefore, yeast is an indispensable _____.",
        questionAr: "بدون الخميرة لن يختمر الخبز، ولهذا تعد الخميرة _____ لا غنى عنه.",
        options: ["symbol", "ingredient", "occasion", "label"],
        correctIndex: 1,
        explanationEn: "Yeast is an active ingredient in leavened baking.",
        explanationAr: "الخميرة هي مكوّن أساسي (ingredient) في عملية الخَبز.",
      },
      {
        id: "q-m8",
        word: "serve",
        questionEn:
          "In Kuwaiti hospitality, the host will immediately _____ aromatic Arabic coffee upon your arrival.",
        questionAr:
          "في الضيافة الكويتية، يقوم المضيف فوراً بـ _____ القهوة العربية العطرة عند وصولك.",
        options: ["maintain", "reflect", "serve", "embrace"],
        correctIndex: 2,
        explanationEn: "To 'serve' means to offer refreshments politely to guests.",
        explanationAr: "'Serve' تعني يقدّم القهوة والضيافة للزائرين.",
      },
      {
        id: "q-m9",
        word: "source",
        questionEn:
          "Sunlight hitting the skin stimulates the body to synthesize a critical _____ of Vitamin D.",
        questionAr: "يحفز ضوء الشمس الجلد لتكوين _____ حيوي لفيتامين د.",
        options: ["source", "recipe", "occasion", "label"],
        correctIndex: 0,
        explanationEn: "Sunlight is a natural source of Vitamin D synthesis.",
        explanationAr: "ضوء الشمس هو مصدر طبيعي لتكوين فيتامين د في الجسم.",
      },
      {
        id: "q-m10",
        word: "homemade",
        questionEn:
          "Why do athletes often favour 'homemade' granola bars over packaged commercial ones?",
        questionAr: "لماذا يفضل الرياضيون ألواح الغرانولا 'منزلية الصنع' على التجارية الجاهزة؟",
        options: [
          "They are wrapped in expensive glossy plastic",
          "They allow control over natural ingredients and contain zero artificial preservatives",
          "They take months to prepare and store",
          "They lack any dietary fibre",
        ],
        correctIndex: 1,
        explanationEn:
          "Homemade options allow total control of sugar, nuts, and clean ingredients.",
        explanationAr: "الأطعمة منزلية الصنع تسمح بالتحكم في المكونات وتخلو من المواد الحافظة.",
      },
      {
        id: "q-m11",
        word: "considerably",
        questionEn:
          "Swapping fried chips for crisp roasted almonds reduces trans-fat intake _____.",
        questionAr: "استبدال رقائق البطاطس المقلية باللوز المحمص يقلل من الدهون المتحولة _____.",
        options: ["considerably", "aromatic", "raw", "homemade"],
        correctIndex: 0,
        explanationEn: "'Considerably' emphasizes the substantial magnitude of reduction.",
        explanationAr: "'Considerably' توضح أن مقدار الانخفاض كان كبيراً وجوهرياً.",
      },
      {
        id: "q-m12",
        word: "symbol",
        questionEn: "The traditional dhow boat is a historic _____ of Gulf pearl-diving heritage.",
        questionAr: "سفينة البوم التقليدية هي _____ تاريخي لتراث الغوص على اللؤلؤ في الخليج.",
        options: ["symbol", "ingredient", "recipe", "produce"],
        correctIndex: 0,
        explanationEn: "A 'symbol' stands as a visible representation of national identity.",
        explanationAr: "الرمز (symbol) يمثل دلالة بصرية على الهوية والتاريخ.",
      },
      {
        id: "q-m13",
        word: "maintain",
        questionEn:
          "To _____ academic excellence, students should review flashcards daily using spaced repetition.",
        questionAr:
          "من أجل _____ التفوق الدراسي، ينبغي على الطلاب مراجعة البطاقات يومياً بالتكرار المتباعد.",
        options: ["maintain", "reflect", "serve", "label"],
        correctIndex: 0,
        explanationEn: "'Maintain' denotes keeping performance at a high level consistently.",
        explanationAr: "'Maintain' تعني الحفاظ على مستوى التميز والاستمرار فيه.",
      },
      {
        id: "q-m14",
        word: "obviously",
        questionEn: "Eating spoiled food will _____ cause severe digestive distress.",
        questionAr: "تناول الطعام الفاسد سيؤدي _____ إلى اضطرابات هضمية حادة.",
        options: ["rarely", "obviously", "commonly", "delicately"],
        correctIndex: 1,
        explanationEn: "'Obviously' marks a predictable and evident outcome.",
        explanationAr: "'Obviously' تعني بكل تأكيد ومن البديهي أنه يسبب أضراراً.",
      },
      {
        id: "q-m15",
        word: "distinctive",
        questionEn: "Za'atar herb blend has a _____ tangy flavour due to dried sumac berries.",
        questionAr: "يتمتع خليط الزعتر بنكهة لاذعة _____ بفضل حبوب السماق المجففة.",
        options: ["harmful", "raw", "distinctive", "produced"],
        correctIndex: 2,
        explanationEn: "'Distinctive' signifies an unmistakable taste recognizable immediately.",
        explanationAr: "'Distinctive' تعني نكهة مميزة وفريدة تميز خلطة الزعتر.",
      },
    ],
  },
  {
    id: "final",
    titleEn: "Final Revision Mastery Examination: All 24 Words",
    titleAr: "امتحان المراجعة النهائية الشامل: كافة الكلمات الـ 24",
    descriptionEn:
      "Complete comprehensive assessment testing mastery across all 24 Grade 9 Unit 3 vocabulary words.",
    descriptionAr:
      "التقييم الختامي الشامل لجميع الكلمات الـ 24 لمنهج الصف التاسع - الوحدة الثالثة.",
    xpReward: 100,
    questions: [
      {
        id: "q-f1",
        word: "reflect",
        questionEn: "Word 1/24: A healthy diet will quickly _____ in your skin vitality and focus.",
        options: ["reflect", "serve", "symbol", "produce"],
        correctIndex: 0,
        explanationEn: "'Reflect' means to show or demonstrate as a natural outcome.",
        explanationAr: "'Reflect' تعني ينعكس ويظهر بوضوح في حيوية ونضارة البشرة.",
      },
      {
        id: "q-f2",
        word: "serve",
        questionEn:
          "Word 2/24: Waiters in traditional restaurants _____ guests with silver teapots.",
        options: ["maintain", "serve", "embrace", "reflect"],
        correctIndex: 1,
        explanationEn: "To 'serve' means to pour, deliver, or present meals and drinks.",
        explanationAr: "'Serve' تعني يقدّم المشروبات والوجبات للضيوف.",
      },
      {
        id: "q-f3",
        word: "symbol",
        questionEn:
          "Word 3/24: The falcon is regarded as an enduring _____ of courage in Arabian lore.",
        options: ["symbol", "occasion", "source", "recipe"],
        correctIndex: 0,
        explanationEn: "A 'symbol' stands as a token of noble qualities.",
        explanationAr: "'Symbol' تعني رمزاً للشجاعة والإقدام.",
      },
      {
        id: "q-f4",
        word: "occasion",
        questionEn: "Word 4/24: National Day is a patriotic _____ marked by joyous parades.",
        options: ["occasion", "ingredient", "produce", "label"],
        correctIndex: 0,
        explanationEn: "An 'occasion' is a special celebration or ceremony.",
        explanationAr: "'Occasion' تعني مناسبة احتفالية وطنية.",
      },
      {
        id: "q-f5",
        word: "aromatic",
        questionEn:
          "Word 5/24: Boiling cinnamon sticks releases an _____ scent through the whole home.",
        options: ["harmful", "aromatic", "raw", "energetic"],
        correctIndex: 1,
        explanationEn: "'Aromatic' describes fragrant, pleasant scents.",
        explanationAr: "'Aromatic' تعني عطري وفوّاح الرائحة.",
      },
      {
        id: "q-f6",
        word: "ingredient",
        questionEn: "Word 6/24: Saffron is an expensive culinary _____ prized for its golden hue.",
        options: ["ingredient", "symbol", "occasion", "variety"],
        correctIndex: 0,
        explanationEn: "Saffron is a valuable cooking ingredient.",
        explanationAr: "'Ingredient' تعني مكوّن غذائي في وصفات الطبخ.",
      },
      {
        id: "q-f7",
        word: "distinctive",
        questionEn:
          "Word 7/24: Traditional Kuwaiti bisht robes feature a _____ gold embroidery pattern.",
        options: ["distinctive", "harmful", "raw", "commonly"],
        correctIndex: 0,
        explanationEn: "'Distinctive' denotes unique and identifiable craftsmanship.",
        explanationAr: "'Distinctive' تعني مميزاً وفريداً في طرازه وتصميمه.",
      },
      {
        id: "q-f8",
        word: "recipe",
        questionEn:
          "Word 8/24: An accurate _____ specifies exact oven temperature and baking minutes.",
        options: ["recipe", "symbol", "occasion", "produce"],
        correctIndex: 0,
        explanationEn: "A 'recipe' details instructions for cooking.",
        explanationAr: "'Recipe' تعني وصفة تحضير دقيقة ومفصلة.",
      },
      {
        id: "q-f9",
        word: "commonly",
        questionEn: "Word 9/24: Tea is _____ served with mint in Arabian gatherings.",
        options: ["obviously", "commonly", "considerably", "raw"],
        correctIndex: 1,
        explanationEn: "'Commonly' means frequently and as customary practice.",
        explanationAr: "'Commonly' تعني بشكل شائع وعادة متبعة في المجالس.",
      },
      {
        id: "q-f10",
        word: "flavour",
        questionEn: "Word 10/24: In British English, which spelling denotes the taste of food?",
        options: ["flavor", "flavour", "flavre", "flayvor"],
        correctIndex: 1,
        explanationEn: "'Flavour' is the correct British spelling required in Grade 9.",
        explanationAr: "'Flavour' هو الهجاء البريطاني الصحيح المطلوب بالمنهج.",
      },
      {
        id: "q-f11",
        word: "embrace",
        questionEn:
          "Word 11/24: Progressive educators _____ new technological tools to assist learners.",
        options: ["embrace", "reflect", "serve", "produce"],
        correctIndex: 0,
        explanationEn: "To 'embrace' means to welcome and adopt eagerly.",
        explanationAr: "'Embrace' تعني يتبنى ويرحب بالأدوات التعليمية الحديثة.",
      },
      {
        id: "q-f12",
        word: "variety",
        questionEn:
          "Word 12/24: A healthy fruit basket contains a colourful _____ of seasonal produce.",
        options: ["variety", "symbol", "occasion", "label"],
        correctIndex: 0,
        explanationEn: "'Variety' means assortment and diversity of items.",
        explanationAr: "'Variety' تعني تشكيلة متنوعة ومختلفة من الأصناف.",
      },
      {
        id: "q-f13",
        word: "raw",
        questionEn: "Word 13/24: Fresh carrots taste sweet and crunchy when eaten _____ in snacks.",
        options: ["raw", "cooked", "harmful", "aromatic"],
        correctIndex: 0,
        explanationEn: "'Raw' means uncooked and fresh from the earth.",
        explanationAr: "'Raw' تعني نيئاً وطازجاً دون طهي.",
      },
      {
        id: "q-f14",
        word: "energetic",
        questionEn:
          "Word 14/24: After brisk morning exercise, students feel alert and highly _____.",
        options: ["energetic", "harmful", "raw", "distinctive"],
        correctIndex: 0,
        explanationEn: "'Energetic' describes physical vitality and enthusiasm.",
        explanationAr: "'Energetic' تعني مفعماً بالطاقة والنشاط والحيوية.",
      },
      {
        id: "q-f15",
        word: "source",
        questionEn:
          "Word 15/24: Almonds and chia seeds are a notable _____ of wholesome omega fats.",
        options: ["source", "symbol", "occasion", "label"],
        correctIndex: 0,
        explanationEn: "'Source' is where a nutrient originates and is derived.",
        explanationAr: "'Source' تعني مصدراً غنياً بالدهون الصحية.",
      },
      {
        id: "q-f16",
        word: "fibre",
        questionEn:
          "Word 16/24: In British English, the dietary substance aiding digestion is spelt:",
        options: ["fiber", "fibre", "fibbre", "fyber"],
        correctIndex: 1,
        explanationEn: "'Fibre' with -re is the official British curriculum spelling.",
        explanationAr: "'Fibre' بنهاية re هو الهجاء البريطاني المعتمد رسمياً.",
      },
      {
        id: "q-f17",
        word: "considerably",
        questionEn:
          "Word 17/24: Daily meditation lowers cortisol stress levels _____ over a month.",
        options: ["considerably", "aromatic", "raw", "distinctive"],
        correctIndex: 0,
        explanationEn: "'Considerably' means significantly and to a large extent.",
        explanationAr: "'Considerably' تعني إلى حد ملحوظ وبدرجة كبيرة.",
      },
      {
        id: "q-f18",
        word: "homemade",
        questionEn:
          "Word 18/24: Warm _____ bread right out of mother's oven beats any packaged loaf.",
        options: ["homemade", "harmful", "raw", "organic"],
        correctIndex: 0,
        explanationEn: "'Homemade' signifies food lovingly prepared at home.",
        explanationAr: "'Homemade' تعني خبزاً بيتي الصنع وطازجاً.",
      },
      {
        id: "q-f19",
        word: "produce",
        questionEn:
          "Word 19/24: The agricultural cooperative brings fresh farm _____ to town daily.",
        options: ["produce", "variety", "symbols", "occasions"],
        correctIndex: 0,
        explanationEn: "Noun 'produce' refers to farm harvests of fruits and vegetables.",
        explanationAr: "'Produce' كاسم تعني المحاصيل والمنتجات الزراعية.",
      },
      {
        id: "q-f20",
        word: "organic",
        questionEn:
          "Word 20/24: Crops grown with natural compost instead of toxic chemicals are _____.",
        options: ["organic", "harmful", "raw", "distinctive"],
        correctIndex: 0,
        explanationEn: "'Organic' crops are chemical-free and naturally cultivated.",
        explanationAr: "'Organic' تعني محاصيل عضوية طبيعية خالية من الكيماويات.",
      },
      {
        id: "q-f21",
        word: "harmful",
        questionEn:
          "Word 21/24: Smoking and excess trans-fats are extremely _____ to arterial health.",
        options: ["harmful", "energetic", "aromatic", "distinctive"],
        correctIndex: 0,
        explanationEn: "'Harmful' designates damaging and hazardous factors.",
        explanationAr: "'Harmful' تعني ضاراً ومؤذياً بصحة الشرايين.",
      },
      {
        id: "q-f22",
        word: "label",
        questionEn: "Word 22/24: Always check the expiration date printed on the product's _____.",
        options: ["label", "symbol", "occasion", "recipe"],
        correctIndex: 0,
        explanationEn: "A 'label' carries essential product information.",
        explanationAr: "'Label' تعني الملصق أو بطاقة بيانات الصلاحية للمنتج.",
      },
      {
        id: "q-f23",
        word: "obviously",
        questionEn: "Word 23/24: A healthy body _____ requires consistent nourishment and sleep.",
        options: ["obviously", "rarely", "scarcely", "barely"],
        correctIndex: 0,
        explanationEn: "'Obviously' means clearly and undeniably.",
        explanationAr: "'Obviously' تعني بوضوح ودون أدنى شك.",
      },
      {
        id: "q-f24",
        word: "maintain",
        questionEn:
          "Word 24/24: Practising vocabulary daily helps students _____ long-term memory fluency.",
        options: ["maintain", "reflect", "serve", "produce"],
        correctIndex: 0,
        explanationEn: "'Maintain' means to sustain and keep fluent without forgetting.",
        explanationAr: "'Maintain' تعني يحافظ على الطلاقة وقوة الذاكرة دون نسيان.",
      },
    ],
  },
];
