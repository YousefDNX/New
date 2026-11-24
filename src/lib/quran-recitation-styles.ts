/**
 * BTC — Advanced Recitation Styles, Vocal Characteristics & Distinctive Signatures
 *
 * Dedicated classification and discovery layer for Quranic recitations.
 *
 * Core Architectural Principles:
 * 1. STRICT SEPARATION:
 *    - Traditional Formats (Murattal, Mujawwad, Tarteel, Mu'allim, Historic Archive) are objective liturgical recitation methods.
 *    - Vocal & Performance Qualities (tone, resonance, articulation, pacing) are descriptive acoustic features.
 *    - Emotional & Spiritual Characteristics (Khushu', deeply moving, tearful, calm) are perceived aesthetic qualities.
 *    - Distinctive Signatures (e.g. Al-Luhaidan, Al-Minshawi, Al-Husary) are listener-recognized vocal identities.
 * 2. ONE RECITER → ONE SURAH → MULTIPLE RECORDINGS → MULTIPLE APPLICABLE STYLE LABELS.
 * 3. NO FABRICATION:
 *    - Audio analysis is never claimed if not performed.
 *    - Emotional and signature labels are only assigned where supported by verified recordings.
 *    - Unclassified recordings remain explicitly empty without forcing artificial tags.
 * 4. HUMAN EDITORIAL REVIEW & LOCAL OVERRIDES:
 *    - Authorized reviewers can correct, add, or refine style classifications with local persistence.
 */

import { matchesAllSearchTokens, normalizeReciterSearchText } from "./quran-reciters-directory";

/** Traditional liturgical recitation formats */
export type TraditionalRecitationFormat =
  "murattal" | "mujawwad" | "tarteel" | "muallim" | "archive";

export interface RecitationFormatMeta {
  id: TraditionalRecitationFormat;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  badgeClass: string;
}

export const TRADITIONAL_FORMATS_META: Record<TraditionalRecitationFormat, RecitationFormatMeta> = {
  murattal: {
    id: "murattal",
    nameAr: "مصحف مرتل",
    nameEn: "Murattal",
    descriptionAr: "تلاوة تعليمية متأنية بأحكام التجويد الأساسية دون تكلف نغمي مفرط.",
    descriptionEn:
      "Standard rhythmic liturgical recitation observing strict Tajweed rules with continuous flow.",
    badgeClass: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
  },
  mujawwad: {
    id: "mujawwad",
    nameAr: "مصحف مجود",
    nameEn: "Mujawwad",
    descriptionAr: "تلاوة احتفالية بطيئة وموسيقية تبرز جمال المقامات وتصوير المعاني.",
    descriptionEn:
      "Deliberate, melodious, and highly modulated classical recitation showcasing maqamat.",
    badgeClass: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
  },
  tarteel: {
    id: "tarteel",
    nameAr: "ترتيل",
    nameEn: "Tarteel",
    descriptionAr: "تلاوة متمهلة متأنية تجمع بين التدبر ووضوح مخارج الحروف.",
    descriptionEn:
      "Measured, deliberate recitation emphasizing meditation and pristine pronunciation.",
    badgeClass: "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30",
  },
  muallim: {
    id: "muallim",
    nameAr: "مصحف معلم",
    nameEn: "Mu'allim (Educational)",
    descriptionAr: "تلاوة تعليمية بوقفات محسوبة تتيح للدارس الترديد خلف القارئ.",
    descriptionEn:
      "Pedagogical recitation with calculated pauses designed for repetition and memorization.",
    badgeClass: "bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30",
  },
  archive: {
    id: "archive",
    nameAr: "أرشيف تاريخي",
    nameEn: "Historic Archive",
    descriptionAr: "تسجيلات تراثية إذاعية نادرة توثق رواد التلاوة الأوائل.",
    descriptionEn:
      "Rare vintage and broadcast recordings documenting foundational masters of Quranic recitation.",
    badgeClass: "bg-stone-500/15 text-stone-800 dark:text-stone-300 border-stone-500/30",
  },
};

/** Perceived emotional and spiritual characteristics */
export type RecitationEmotionalStyle =
  | "khushu"
  | "tearful"
  | "deeply_moving"
  | "calm_contemplative"
  | "emotionally_expressive"
  | "powerful_impactful"
  | "reflective"
  | "gentle_soothing";

export interface RecitationStyleMeta {
  id: RecitationEmotionalStyle;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  colorClass: string;
}

export const EMOTIONAL_STYLES_META: Record<RecitationEmotionalStyle, RecitationStyleMeta> = {
  khushu: {
    id: "khushu",
    nameAr: "خشوع وتضرع",
    nameEn: "Deeply Reverent (Khushu)",
    descriptionAr: "تلاوة تصطبغ بالسكينة والانكسار الروحي بين يدي الله عز وجل.",
    descriptionEn:
      "Spiritually humble, prayerful, and deeply reverent recitation evoking awe before Allah.",
    colorClass: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
  },
  tearful: {
    id: "tearful",
    nameAr: "تلاوة باكية",
    nameEn: "Tearful & Plaintive",
    descriptionAr: "تلاوة شجية تفيض بالتأثر والانفعال الإيماني عند آيات الوعد والوعيد.",
    descriptionEn:
      "Plaintive, tearful recitation capturing profound emotional awe and heartfelt contrition.",
    colorClass: "bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/30",
  },
  deeply_moving: {
    id: "deeply_moving",
    nameAr: "مؤثرة وجدانية",
    nameEn: "Deeply Moving",
    descriptionAr: "تلاوة قوية الأثر تلامس الوجدان وتستحضر عظمة الآيات ومواقفها.",
    descriptionEn: "Deeply evocative recitation stirring the heart through sincere conviction.",
    colorClass: "bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30",
  },
  calm_contemplative: {
    id: "calm_contemplative",
    nameAr: "هادئة وتأملية",
    nameEn: "Calm & Contemplative",
    descriptionAr: "تلاوة مطمئنة رقيقة الإيقاع تساعد على التأمل وطمأنينة النفس.",
    descriptionEn:
      "Tranquil and serene cadence fostering deep internal stillness and contemplation.",
    colorClass: "bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30",
  },
  emotionally_expressive: {
    id: "emotionally_expressive",
    nameAr: "تعبيرية تصويرية",
    nameEn: "Emotionally Expressive",
    descriptionAr: "تلاوة تعكس معاني الآيات من فرح واستبشار أو وعيد وإنذار ببراعة.",
    descriptionEn:
      "Vivid, narrative delivery adjusting vocal expression to mirror the shifting themes of scripture.",
    colorClass: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
  },
  powerful_impactful: {
    id: "powerful_impactful",
    nameAr: "قوية ومهيبة",
    nameEn: "Powerful & Impactful",
    descriptionAr: "تلاوة جهورية ذات رنين قاطع توقظ الغافل وتثبت القلوب.",
    descriptionEn:
      "Commanding, resonant, and awe-inspiring vocal delivery resonating with majestic authority.",
    colorClass: "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30",
  },
  reflective: {
    id: "reflective",
    nameAr: "تدبرية رصينة",
    nameEn: "Reflective & Meditative",
    descriptionAr: "تلاوة متزنة تتوقف عند معاني الكلمات لتشجيع التدبر والتفكر.",
    descriptionEn:
      "Thoughtful and measured recitation structured to inspire reflection on Quranic wisdom.",
    colorClass: "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30",
  },
  gentle_soothing: {
    id: "gentle_soothing",
    nameAr: "لينة ومريحة",
    nameEn: "Gentle & Soothing",
    descriptionAr: "تلاوة رفيقة ميسرة تبعث الراحة والسكينة في البيوت ومجالس الذكر.",
    descriptionEn:
      "Soft, gentle intonation comforting the listener during evening recitation and quiet study.",
    colorClass: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
  },
};

/** Vocal qualities and performance characteristics */
export type RecitationVocalQuality =
  | "distinctive_tone"
  | "deep_quality"
  | "soft_delivery"
  | "strong_resonant"
  | "clear_measured"
  | "melodic_phrasing"
  | "slow_deliberate"
  | "balanced_moderate";

export interface VocalQualityMeta {
  id: RecitationVocalQuality;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export const VOCAL_QUALITIES_META: Record<RecitationVocalQuality, VocalQualityMeta> = {
  distinctive_tone: {
    id: "distinctive_tone",
    nameAr: "نبرة صوتية فريدة",
    nameEn: "Distinctive Vocal Tone",
    descriptionAr: "خامة صوتية ذات بصمة لا تخطئها الأذن من الكلمة الأولى.",
    descriptionEn: "Instantly recognizable vocal timbre carrying a unique acoustic signature.",
  },
  deep_quality: {
    id: "deep_quality",
    nameAr: "خامة رخيمة وعميقة",
    nameEn: "Deep & Rich Quality",
    descriptionAr: "طبقات صوتية عميقة ورخيمة تمنح التلاوة وقاراً خاصاً.",
    descriptionEn: "Rich, resonant lower register providing warmth and profound gravity.",
  },
  soft_delivery: {
    id: "soft_delivery",
    nameAr: "أداء خافت وناعم",
    nameEn: "Soft Vocal Delivery",
    descriptionAr: "تلاوة هادئة مخفوضة الجناح تناسب قيام الليل والتهجد.",
    descriptionEn: "Intimate and delicate vocal projection suited for nocturnal Tahajjud prayer.",
  },
  strong_resonant: {
    id: "strong_resonant",
    nameAr: "صوت جهوري رنان",
    nameEn: "Strong & Resonant",
    descriptionAr: "صوت قوي يملأ الأرجاء دون إجهاد، ذو صدى طبيعي مهيب.",
    descriptionEn: "Powerful baritone or tenor projection with natural acoustic carry.",
  },
  clear_measured: {
    id: "clear_measured",
    nameAr: "تحقيق صوتي ومخارج محكمة",
    nameEn: "Clear & Measured Articulation",
    descriptionAr: "إحكام تام لمخارج الحروف وصفاتها وتطبيق دقيق لأحكام التجويد.",
    descriptionEn:
      "Exemplary phonetic precision and exacting adherence to classical Tajweed benchmarks.",
  },
  melodic_phrasing: {
    id: "melodic_phrasing",
    nameAr: "تصوير نغمي ومقامات متقنة",
    nameEn: "Distinctive Melodic Phrasing",
    descriptionAr: "تنقل مقامي بديع يبرز جلال المعنى دون خروج عن أصول القراءة.",
    descriptionEn:
      "Harmonious modal transitions illuminating scriptural imagery within classical bounds.",
  },
  slow_deliberate: {
    id: "slow_deliberate",
    nameAr: "تؤدة وتأنٍ في التلاوة",
    nameEn: "Slow & Deliberate Pacing",
    descriptionAr: "قراءة هادئة الوتيرة تمكّن السامع من متابعة كل حرف وتدبره.",
    descriptionEn: "Unrushed tempo allowing listener retention and contemplative absorption.",
  },
  balanced_moderate: {
    id: "balanced_moderate",
    nameAr: "أداء متوسط ومتزن",
    nameEn: "Balanced & Moderate Delivery",
    descriptionAr: "سرعة معتدلة تجمع بين سلامة النطق وسلاسة الجريان الصوتي.",
    descriptionEn:
      "Well-calibrated tempo balancing phonetic thoroughness with natural rhythmic flow.",
  },
};

/** Distinctive Reciter Signatures */
export interface ReciterVocalSignature {
  id: string;
  reciterId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  listenerContextAr: string;
  listenerContextEn: string;
}

export const VERIFIED_RECITER_SIGNATURES: Record<string, ReciterVocalSignature> = {
  al_luhaidan_signature: {
    id: "al_luhaidan_signature",
    reciterId: "al-luhaidan",
    nameAr: "النبرة اللحيدانية",
    nameEn: "Al-Luhaidan Tearful Cadence",
    descriptionAr:
      "انتقال حاد ومؤثر نحو الطبقات الصوتية العالية بنبرة باكية شجية تلامس شغاف القلب.",
    descriptionEn:
      "Distinctive emotional shift toward high-register tearful phrasing with powerful resonance.",
    listenerContextAr: "اشتهر بها في صلوات التراويح والقيام وخاصة في أواخر سورة الفرقان وسورة ق.",
    listenerContextEn:
      "Renowned during Tahajjud night prayers, especially in Surah Al-Furqan and Surah Qaf.",
  },
  al_husary_signature: {
    id: "al_husary_signature",
    reciterId: "al-husary",
    nameAr: "المدرسة الحصرية المتقنة",
    nameEn: "Al-Husary Benchmark Precision",
    descriptionAr: "تحقيق صوتي فائق الدقة وضبط استثنائي لمخارج الحروف ورنين الغنن وأزمنة المدود.",
    descriptionEn:
      "Unrivaled phonetic accuracy and pristine Tajweed articulation considered global benchmark.",
    listenerContextAr:
      "المرجع العالمي الأول لطلاب القراءات وحفظة كتاب الله في مشارق الأرض ومغاربها.",
    listenerContextEn:
      "Universal global gold standard for Quran students and memorizers worldwide.",
  },
  al_minshawi_signature: {
    id: "al_minshawi_signature",
    reciterId: "al-minshawi",
    nameAr: "الشجن المنشاوي الصافي",
    nameEn: "Al-Minshawi Plaintive Resonance",
    descriptionAr: "صوت باكي رقيق يفيض بالحزن الإيماني العذب والخشوع الشديد دون تكلف.",
    descriptionEn:
      "Heartfelt, soulful melancholy delivering scripture with natural piety and intimacy.",
    listenerContextAr:
      "عُرف بـ'الصوت الباكي' الذي يخلب الألباب في تلاوته المرتلة والمجودة على السواء.",
    listenerContextEn:
      "Famed as 'the weeping voice' touching millions across both Murattal and Mujawwad.",
  },
  abdul_basit_signature: {
    id: "abdul_basit_signature",
    reciterId: "abdul-basit",
    nameAr: "الحنجرة الذهبية الباسطية",
    nameEn: "Abdul Basit Golden Timbre",
    descriptionAr: "نَفَس أسطوري طويل وطبقات صوتية عالية صافية تحلق في سماء التلاوة المصرية.",
    descriptionEn:
      "Legendary expansive breath control and radiant golden high-register projection.",
    listenerContextAr:
      "المحافل الجماهيرية التاريخية في شتى بقاع العالم الإسلامي وخاصة سورة يوسف وقصار السور.",
    listenerContextEn:
      "Iconic international recitations, famously Surah Yusuf and short Meccan Surahs.",
  },
  mustafa_ismail_signature: {
    id: "mustafa_ismail_signature",
    reciterId: "mustafa-ismail",
    nameAr: "عبقرية المقامات الإسماعيلية",
    nameEn: "Mustafa Ismail Modal Genius",
    descriptionAr:
      "تصوير معجز لمعاني الآيات وتطويع فريد للمقامات الموسيقية العربية في خدمة النص القرآني.",
    descriptionEn:
      "Genius modal exposition capturing biblical and Quranic narratives through tonal artistry.",
    listenerContextAr: "التلاوات الجماهيرية الخالدة في قصر عابدين والجامع الأزهر والمساجد الكبرى.",
    listenerContextEn: "Historic monumental mosque recitations at Al-Azhar and Abdeen Palace.",
  },
  al_nafis_signature: {
    id: "al_nafis_signature",
    reciterId: "ahmad-al-nafis",
    nameAr: "السكينة النفسية الرخيمة",
    nameEn: "Al-Nafis Soothing Serenity",
    descriptionAr: "نبرة رخيمة هادئة تبعث الطمأنينة والسكينة في النفس بأداء كويتي معاصر منضبط.",
    descriptionEn:
      "Warm, mellow, soothing delivery inspiring immediate peacefulness and inner calm.",
    listenerContextAr: "تلاوات مسجد الدولة الكبير بالكويت وتسجيلات المصحف المرتل المعاصرة.",
    listenerContextEn:
      "Contemporary Kuwait Grand Mosque prayers and popular modern studio recordings.",
  },
  al_dosari_signature: {
    id: "al_dosari_signature",
    reciterId: "al-dosari",
    nameAr: "الجهورية الدوسرية الحرمية",
    nameEn: "Al-Dosari Majestic Grandeur",
    descriptionAr: "صوت جهوري قوي ذو رنين حاد وصعود نغمي مهيب يستحضر هيبة الحرم المكي الشريف.",
    descriptionEn: "Thunderous, commanding vocal resonance with soaring emotional momentum.",
    listenerContextAr: "صلوات التراويح والقيام والفرائض في المسجد الحرام بمكة المكرمة.",
    listenerContextEn: "Fervent Makkah Grand Mosque Taraweeh and Tahajjud prayer assemblies.",
  },
  alafasy_signature: {
    id: "alafasy_signature",
    reciterId: "alafasy",
    nameAr: "البصمة العفاسية الشجية",
    nameEn: "Alafasy Melodic Clarity",
    descriptionAr: "توازن نغمي سلس ونقاء صوتي دافئ محبب للأجيال المعاصرة بإتقان تام للروايات.",
    descriptionEn:
      "Melodious, warm, and highly accessible phrasing loved globally by youth and families.",
    listenerContextAr: "تلاوات المسجد الكبير بالكويت والإصدارات الصوتية العالمية المنتشرة.",
    listenerContextEn: "Pioneering high-fidelity digital releases and international prayer tours.",
  },
  al_sudais_signature: {
    id: "al_sudais_signature",
    reciterId: "al-sudais",
    nameAr: "الترتيل السديسي الباكي",
    nameEn: "Al-Sudais Tearful Cadence",
    descriptionAr: "نبرة بكائية حثيثة متدفقة ذات طابع حرمي مكي راسخ في وجدان المسلمين منذ عقود.",
    descriptionEn:
      "Rapid, emotional, tearful delivery echoing through the Grand Mosque for decades.",
    listenerContextAr: "صلوات التراويح والتهجد بالحرم المكي ودعاء ختم القرآن الكريم السنوي.",
    listenerContextEn:
      "Beloved annual Makkah Ramadan night prayers and Quran completion supplications.",
  },
  al_shuraim_signature: {
    id: "al_shuraim_signature",
    reciterId: "al-shuraim",
    nameAr: "الوقار الشريمي الرصين",
    nameEn: "Al-Shuraim Stately Solemnity",
    descriptionAr: "خامة صوتية رخيمة عميقة تتسم بالهيبة والوقار وسرعة متوسطة متقنة.",
    descriptionEn:
      "Deep, dignified baritone intonation characterized by stately poise and gravity.",
    listenerContextAr: "إمامة المسجد الحرام لعقود وتلاوات صلاة التراويح المتميزة بالخشوع والسكينة.",
    listenerContextEn:
      "Decades of Makkah Haram leadership marked by profound contemplative gravity.",
  },
  ali_jaber_signature: {
    id: "ali_jaber_signature",
    reciterId: "ali-jaber",
    nameAr: "الخشوع الجابري التهجدي",
    nameEn: "Ali Jaber Nocturnal Reverence",
    descriptionAr:
      "أداء تهجدي خافت رقيق مفعم بالسكينة والرهبة الإلهية والحنين لصلوات الحرم في الثمانينيات.",
    descriptionEn:
      "Intimate, nocturnal, prayerful delivery steeped in humility and nostalgic stillness.",
    listenerContextAr: "تسجيلات قيام الحرم المكي التاريخية للأعوام ١٤٠١–١٤٠٩هـ.",
    listenerContextEn:
      "Iconic 1980s Makkah Tahajjud recordings remembered for timeless spiritual intimacy.",
  },
  al_hudhaifi_signature: {
    id: "al_hudhaifi_signature",
    reciterId: "al-hudhaifi",
    nameAr: "التحقيق الحذيفي المدني",
    nameEn: "Al-Hudhaifi Madinah Dignity",
    descriptionAr:
      "ترتيل هادئ متأنٍ من محراب المسجد النبوي الشريف يمتاز بالتؤدة وإخراج الحروف من أصولها.",
    descriptionEn:
      "Serene, measured, and deliberate pacing rooted in the Prophet's Mosque traditions.",
    listenerContextAr:
      "محراب المسجد النبوي بالمدينة المنورة ومصحف مجمع الملك فهد لطباعة المصحف الشريف.",
    listenerContextEn:
      "Decades at the Prophet's Mosque mihrab and standard King Fahd Complex audio edition.",
  },
};

/** Recording classification descriptor */
export interface RecordingStyleClassification {
  recordingId: string;
  reciterId: string;
  format: TraditionalRecitationFormat;
  emotionalStyles: RecitationEmotionalStyle[];
  vocalQualities: RecitationVocalQuality[];
  signatures: string[];
  editorialReviewNoteAr?: string;
  editorialReviewNoteEn?: string;
  verifiedByReviewer?: boolean;
}

/** Verified catalog of recording classifications (100% matched to GLOBAL_RECITERS_DIRECTORY IDs) */
export const VERIFIED_RECORDING_CLASSIFICATIONS: Record<string, RecordingStyleClassification> = {
  // Sheikh Mohammed Al-Luhaidan (1 reciter -> 2 distinct editions -> distinct style nuances)
  "al-luhaidan-mp3q-server8": {
    recordingId: "al-luhaidan-mp3q-server8",
    reciterId: "al-luhaidan",
    format: "murattal",
    emotionalStyles: ["khushu", "tearful", "deeply_moving", "powerful_impactful"],
    vocalQualities: ["distinctive_tone", "strong_resonant", "melodic_phrasing"],
    signatures: ["al_luhaidan_signature"],
    editorialReviewNoteAr:
      "المصحف المرتل الكامل عبر MP3Quran (Server8 ID 107) — إيقاع متزن وضبط تجويدي متسق مع الانتقال إلى الطبقات العالية في المواضع المؤثرة.",
    editorialReviewNoteEn:
      "Complete 114-Surah Murattal via MP3Quran (Server8 ID 107) — steady acoustic balance and consistent Hafs Tajweed with expressive register elevation on moving passages.",
    verifiedByReviewer: true,
  },
  "al-luhaidan-qa-select": {
    recordingId: "al-luhaidan-qa-select",
    reciterId: "al-luhaidan",
    format: "archive",
    emotionalStyles: ["khushu", "tearful", "deeply_moving", "powerful_impactful"],
    vocalQualities: ["distinctive_tone", "strong_resonant", "melodic_phrasing"],
    signatures: ["al_luhaidan_signature"],
    editorialReviewNoteAr:
      "مختارات تلاوات الصلاة من QuranicAudio (٨٤ سورة موثقة · آخر تعديل للأرشيف يناير ٢٠٢٣؛ بدون سورة البقرة) — تتميز بقوة الإسقاط الصوتي والانتقال الحاد للطبقات العالية والمدود الممتدة عند سورة الفرقان ٢٥:٦٨–٧٠.",
    editorialReviewNoteEn:
      "Selected prayer recitations via QuranicAudio (84 verified Surahs; archive Last-Modified Jan 2023; excludes Al-Baqarah) — notable for stronger loudness & mosque acoustic projection, dynamic high-register transitions, and sustained tearful phrasing at Surah Al-Furqan 25:68–70.",
    verifiedByReviewer: true,
  },
  "al-luhaidan-ltq-archive": {
    recordingId: "al-luhaidan-ltq-archive",
    reciterId: "al-luhaidan",
    format: "archive",
    emotionalStyles: ["khushu", "deeply_moving", "powerful_impactful"],
    vocalQualities: ["distinctive_tone", "strong_resonant"],
    signatures: ["al_luhaidan_signature"],
    editorialReviewNoteAr:
      "أرشيف كامل (١١٤ سورة عبر Archive.org · نُشر في ديسمبر ٢٠١٢) بأزمنة تلاوة مغايرة — يوثق قوة الأداء والصوت الجهوري الممتد عبر سائر السور.",
    editorialReviewNoteEn:
      "Independent 114-Surah Archive.org collection (archived Dec 2012) with distinct pacing and durations — documents sustained breath control and resonant vocal projection across the full Mushaf.",
    verifiedByReviewer: true,
  },

  // Sheikh Mahmoud Khalil Al-Husary
  "al-husary-murattal": {
    recordingId: "al-husary-murattal",
    reciterId: "al-husary",
    format: "murattal",
    emotionalStyles: ["reflective", "calm_contemplative"],
    vocalQualities: ["clear_measured", "slow_deliberate"],
    signatures: ["al_husary_signature"],
    editorialReviewNoteAr: "المصحف المرتل الإذاعي المعتمد — ذروة التحقيق الصوتي والإتقان التجويدي.",
    editorialReviewNoteEn:
      "Authoritative broadcast Murattal — global benchmark for phonetic clarity and Tajweed precision.",
    verifiedByReviewer: true,
  },
  "al-husary-mujawwad": {
    recordingId: "al-husary-mujawwad",
    reciterId: "al-husary",
    format: "mujawwad",
    emotionalStyles: ["reflective", "deeply_moving"],
    vocalQualities: ["clear_measured", "melodic_phrasing"],
    signatures: ["al_husary_signature"],
    editorialReviewNoteAr: "المصحف المجود — تلاوة كلاسيكية متأنية بالمقامات الأصيلة.",
    editorialReviewNoteEn:
      "Complete classical Mujawwad — measured, deliberate, and balanced classical maqam delivery.",
    verifiedByReviewer: true,
  },
  "al-husary-warsh": {
    recordingId: "al-husary-warsh",
    reciterId: "al-husary",
    format: "murattal",
    emotionalStyles: ["reflective"],
    vocalQualities: ["clear_measured", "slow_deliberate"],
    signatures: ["al_husary_signature"],
    verifiedByReviewer: true,
  },
  "al-husary-qalun": {
    recordingId: "al-husary-qalun",
    reciterId: "al-husary",
    format: "murattal",
    emotionalStyles: ["reflective"],
    vocalQualities: ["clear_measured", "slow_deliberate"],
    signatures: ["al_husary_signature"],
    verifiedByReviewer: true,
  },
  "al-husary-iza3a": {
    recordingId: "al-husary-iza3a",
    reciterId: "al-husary",
    format: "archive",
    emotionalStyles: ["calm_contemplative", "reflective"],
    vocalQualities: ["clear_measured", "slow_deliberate"],
    signatures: ["al_husary_signature"],
    editorialReviewNoteAr: "تلاوة الإذاعة المصرية النادرة — أداء تعليمي تاريخي موثق.",
    editorialReviewNoteEn:
      "Rare Egyptian National Radio archive recording preserving classical pedagogical articulation.",
    verifiedByReviewer: true,
  },

  // Sheikh Muhammad Siddiq Al-Minshawi
  "al-minshawi-murattal": {
    recordingId: "al-minshawi-murattal",
    reciterId: "al-minshawi",
    format: "murattal",
    emotionalStyles: ["khushu", "tearful", "deeply_moving", "reflective"],
    vocalQualities: ["clear_measured", "deep_quality", "slow_deliberate"],
    signatures: ["al_minshawi_signature"],
    editorialReviewNoteAr: "المصحف المرتل برواية حفص — الصوت الباكي الندي الصافي.",
    editorialReviewNoteEn:
      "Complete Hafs Murattal — quintessential plaintive warmth and spiritual intimacy.",
    verifiedByReviewer: true,
  },
  "al-minshawi-mujawwad": {
    recordingId: "al-minshawi-mujawwad",
    reciterId: "al-minshawi",
    format: "mujawwad",
    emotionalStyles: ["tearful", "deeply_moving", "emotionally_expressive"],
    vocalQualities: ["melodic_phrasing", "deep_quality", "clear_measured"],
    signatures: ["al_minshawi_signature"],
    editorialReviewNoteAr: "المصحف المجود — شجن رفيع وتصوير بديع لآيات القرآن الكريم.",
    editorialReviewNoteEn:
      "Legendary Mujawwad archive — profound pathos, tearful humility, and sublime melodic transitions.",
    verifiedByReviewer: true,
  },
  "al-minshawi-muallim": {
    recordingId: "al-minshawi-muallim",
    reciterId: "al-minshawi",
    format: "muallim",
    emotionalStyles: ["calm_contemplative", "gentle_soothing"],
    vocalQualities: ["clear_measured", "slow_deliberate"],
    signatures: ["al_minshawi_signature"],
    editorialReviewNoteAr: "المصحف المعلم بترديد الأطفال — مرجع الحفظ والناشئة.",
    editorialReviewNoteEn:
      "Classic Mu'allim children's repetition edition cherished for family memorization.",
    verifiedByReviewer: true,
  },
  "al-minshawi-1967-archive": {
    recordingId: "al-minshawi-1967-archive",
    reciterId: "al-minshawi",
    format: "archive",
    emotionalStyles: ["khushu", "tearful", "deeply_moving"],
    vocalQualities: ["deep_quality", "clear_measured"],
    signatures: ["al_minshawi_signature"],
    editorialReviewNoteAr:
      "التسجيل الإذاعي التاريخي لعام ١٣٨٧هـ / ١٩٦٧م (١١٠ سور) — نبرة المنشاوي الخاشعة الباكية.",
    editorialReviewNoteEn:
      "1967 CE / 1387 AH broadcast session (110 Surahs) preserving Al-Minshawi's deeply moving tearful cadence.",
    verifiedByReviewer: true,
  },

  // Sheikh Abdul Basit Abdul Samad
  "abdul-basit-murattal": {
    recordingId: "abdul-basit-murattal",
    reciterId: "abdul-basit",
    format: "murattal",
    emotionalStyles: ["reflective", "calm_contemplative"],
    vocalQualities: ["clear_measured", "strong_resonant"],
    signatures: ["abdul_basit_signature"],
    verifiedByReviewer: true,
  },
  "abdul-basit-mujawwad": {
    recordingId: "abdul-basit-mujawwad",
    reciterId: "abdul-basit",
    format: "mujawwad",
    emotionalStyles: ["deeply_moving", "powerful_impactful"],
    vocalQualities: ["strong_resonant", "melodic_phrasing"],
    signatures: ["abdul_basit_signature"],
    editorialReviewNoteAr: "المصحف المجود — الحنجرة الذهبية بطبقاتها العالية ونَفَسها الطويل.",
    editorialReviewNoteEn:
      "Celebrated Mujawwad masterwork showcasing expansive breath control and golden timbre.",
    verifiedByReviewer: true,
  },
  "abdul-basit-warsh": {
    recordingId: "abdul-basit-warsh",
    reciterId: "abdul-basit",
    format: "murattal",
    emotionalStyles: ["reflective"],
    vocalQualities: ["clear_measured", "strong_resonant"],
    signatures: ["abdul_basit_signature"],
    verifiedByReviewer: true,
  },

  // Sheikh Mustafa Ismail
  "mustafa-ismail-murattal": {
    recordingId: "mustafa-ismail-murattal",
    reciterId: "mustafa-ismail",
    format: "murattal",
    emotionalStyles: ["reflective"],
    vocalQualities: ["clear_measured", "melodic_phrasing"],
    signatures: ["mustafa_ismail_signature"],
    verifiedByReviewer: true,
  },
  "mustafa-ismail-mujawwad": {
    recordingId: "mustafa-ismail-mujawwad",
    reciterId: "mustafa-ismail",
    format: "mujawwad",
    emotionalStyles: ["emotionally_expressive", "deeply_moving"],
    vocalQualities: ["melodic_phrasing", "distinctive_tone"],
    signatures: ["mustafa_ismail_signature"],
    editorialReviewNoteAr: "المصحف المجود — مدرسة المقامات والتصوير القرآني المعجز.",
    editorialReviewNoteEn:
      "Masterwork of classical Arab maqamat married seamlessly with Quranic exposition.",
    verifiedByReviewer: true,
  },

  // Sheikh Ahmed Al-Nafis (Kuwait)
  "ahmad-al-nafis-hafs-r1": {
    recordingId: "ahmad-al-nafis-hafs-r1",
    reciterId: "ahmad-al-nafis",
    format: "murattal",
    emotionalStyles: ["calm_contemplative", "gentle_soothing", "reflective"],
    vocalQualities: ["distinctive_tone", "deep_quality", "balanced_moderate"],
    signatures: ["al_nafis_signature"],
    editorialReviewNoteAr:
      "المصحف المرتل الكامل (MP3Quran #259) — نبرة رخيمة هادئة تجمع بين الإتقان والسكينة النفسية.",
    editorialReviewNoteEn:
      "Complete verified 114 Surahs (MP3Quran #259) — calm, soothing, and serene Kuwaiti delivery.",
    verifiedByReviewer: true,
  },

  // Sheikh Yasser Al-Dosari
  "al-dosari-mp3q": {
    recordingId: "al-dosari-mp3q",
    reciterId: "al-dosari",
    format: "murattal",
    emotionalStyles: ["powerful_impactful", "deeply_moving", "khushu"],
    vocalQualities: ["strong_resonant", "distinctive_tone"],
    signatures: ["al_dosari_signature"],
    editorialReviewNoteAr:
      "تلاوات الحرم المكي — أداء جهوري مؤثر يتسم بالصعود النغمي والخشوع الشديد.",
    editorialReviewNoteEn:
      "Grand Mosque of Makkah recitations — impassioned resonance, powerful momentum, and deep reverence.",
    verifiedByReviewer: true,
  },
  "al-dosari-qa": {
    recordingId: "al-dosari-qa",
    reciterId: "al-dosari",
    format: "archive",
    emotionalStyles: ["powerful_impactful", "khushu"],
    vocalQualities: ["strong_resonant", "distinctive_tone"],
    signatures: ["al_dosari_signature"],
    verifiedByReviewer: true,
  },

  // Sheikh Mishary Rashid Alafasy
  "alafasy-hafs": {
    recordingId: "alafasy-hafs",
    reciterId: "alafasy",
    format: "murattal",
    emotionalStyles: ["reflective", "calm_contemplative"],
    vocalQualities: ["balanced_moderate", "distinctive_tone", "melodic_phrasing"],
    signatures: ["alafasy_signature"],
    verifiedByReviewer: true,
  },
  "alafasy-duri-kisai": {
    recordingId: "alafasy-duri-kisai",
    reciterId: "alafasy",
    format: "archive",
    emotionalStyles: ["reflective"],
    vocalQualities: ["clear_measured", "balanced_moderate"],
    signatures: ["alafasy_signature"],
    editorialReviewNoteAr: "تسجيل نادر برواية الدوري عن الكسائي — ٦ سور موثقة.",
    editorialReviewNoteEn: "Specialized canonical narration recording in Al-Duri 'an Al-Kisa'i.",
    verifiedByReviewer: true,
  },

  // Sheikh Abdul Rahman Al-Sudais
  "al-sudais-mp3q": {
    recordingId: "al-sudais-mp3q",
    reciterId: "al-sudais",
    format: "murattal",
    emotionalStyles: ["tearful", "khushu", "deeply_moving"],
    vocalQualities: ["strong_resonant"],
    signatures: ["al_sudais_signature"],
    editorialReviewNoteAr: "المصحف المرتل برواية حفص — نبرة بكائية حرمية مألوفة.",
    editorialReviewNoteEn: "Classic Makkah Taraweeh style with emotional, tearful crescendos.",
    verifiedByReviewer: true,
  },

  // Sheikh Saud Al-Shuraim
  "al-shuraim-mp3q": {
    recordingId: "al-shuraim-mp3q",
    reciterId: "al-shuraim",
    format: "murattal",
    emotionalStyles: ["reflective", "powerful_impactful"],
    vocalQualities: ["deep_quality", "strong_resonant", "balanced_moderate"],
    signatures: ["al_shuraim_signature"],
    verifiedByReviewer: true,
  },

  // Sheikh Ali Jaber
  "ali-jaber-primary": {
    recordingId: "ali-jaber-primary",
    reciterId: "ali-jaber",
    format: "murattal",
    emotionalStyles: ["khushu", "deeply_moving", "tearful", "calm_contemplative"],
    vocalQualities: ["soft_delivery", "distinctive_tone"],
    signatures: ["ali_jaber_signature"],
    editorialReviewNoteAr: "تسجيلات قيام الحرم المكي التاريخية — سكون تهجدي ونبرة حزينة مخلصة.",
    editorialReviewNoteEn:
      "Archival 1980s Makkah Tahajjud — legendary nostalgic stillness and tender prayerful humility.",
    verifiedByReviewer: true,
  },

  // Sheikh Ali Al-Hudhaifi
  "al-hudhaifi-hafs": {
    recordingId: "al-hudhaifi-hafs",
    reciterId: "al-hudhaifi",
    format: "tarteel",
    emotionalStyles: ["reflective", "calm_contemplative"],
    vocalQualities: ["clear_measured", "slow_deliberate"],
    signatures: ["al_hudhaifi_signature"],
    editorialReviewNoteAr: "ترتيل المسجد النبوي الرصين — وضوح ناصع في مخارج الحروف وأحكام التجويد.",
    editorialReviewNoteEn:
      "Standard Madinah educational tarteel widely referenced for clarity and Tajweed mastery.",
    verifiedByReviewer: true,
  },

  // Dr. Ayman Swaid (Syria - Mu'allim pedagogical)
  "ayman-swaid-muallim": {
    recordingId: "ayman-swaid-muallim",
    reciterId: "ayman-swaid",
    format: "muallim",
    emotionalStyles: ["reflective"],
    vocalQualities: ["clear_measured", "slow_deliberate"],
    signatures: [],
    editorialReviewNoteAr:
      "المصحف المعلم للدكتور أيمن سويد — معيار تطبيقي لتدريس التجويد والمخارج.",
    editorialReviewNoteEn:
      "Dedicated instructional Mu'allim edition by Dr. Ayman Swaid for applied Tajweed pedagogy.",
    verifiedByReviewer: true,
  },

  // Sheikh Mohamed El-Tablawi
  "al-tablawi-murattal": {
    recordingId: "al-tablawi-murattal",
    reciterId: "al-tablawi",
    format: "murattal",
    emotionalStyles: ["deeply_moving", "reflective"],
    vocalQualities: ["distinctive_tone", "deep_quality"],
    signatures: [],
    verifiedByReviewer: true,
  },
  "al-tablawi-mujawwad": {
    recordingId: "al-tablawi-mujawwad",
    reciterId: "al-tablawi",
    format: "mujawwad",
    emotionalStyles: ["emotionally_expressive", "deeply_moving"],
    vocalQualities: ["distinctive_tone", "melodic_phrasing"],
    signatures: [],
    verifiedByReviewer: true,
  },

  // Sheikh Muhammad Rifaat
  "muhammad-rifaat-archive": {
    recordingId: "muhammad-rifaat-archive",
    reciterId: "muhammad-rifaat",
    format: "archive",
    emotionalStyles: ["deeply_moving", "khushu"],
    vocalQualities: ["distinctive_tone", "melodic_phrasing"],
    signatures: [],
    editorialReviewNoteAr:
      "أرشيف تاريخي نادر (٣١ سورة) — صوت قيثارة السماء في افتتاح الإذاعة المصرية.",
    editorialReviewNoteEn:
      "Vintage 1930s Egyptian broadcast archive — historic pioneer known as 'the harp of heaven'.",
    verifiedByReviewer: true,
  },
};

const OVERRIDES_STORAGE_KEY = "btc_recitation_style_overrides_v1";

export function loadUserStyleOverrides(): Record<string, Partial<RecordingStyleClassification>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(OVERRIDES_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, Partial<RecordingStyleClassification>>;
  } catch {
    return {};
  }
}

export function saveUserStyleOverrides(
  overrides: Record<string, Partial<RecordingStyleClassification>>,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // Non-fatal
  }
}

export function getEffectiveRecordingClassification(
  recordingId: string,
  userOverrides: Record<string, Partial<RecordingStyleClassification>> = {},
): RecordingStyleClassification | null {
  const base = VERIFIED_RECORDING_CLASSIFICATIONS[recordingId];
  const override = userOverrides[recordingId];
  if (!base && !override) return null;

  const noteAr = override?.editorialReviewNoteAr ?? base?.editorialReviewNoteAr;
  const noteEn = override?.editorialReviewNoteEn ?? base?.editorialReviewNoteEn;

  return {
    recordingId,
    reciterId: override?.reciterId ?? base?.reciterId ?? "",
    format: override?.format ?? base?.format ?? "murattal",
    emotionalStyles: override?.emotionalStyles ?? base?.emotionalStyles ?? [],
    vocalQualities: override?.vocalQualities ?? base?.vocalQualities ?? [],
    signatures: override?.signatures ?? base?.signatures ?? [],
    ...(noteAr !== undefined ? { editorialReviewNoteAr: noteAr } : {}),
    ...(noteEn !== undefined ? { editorialReviewNoteEn: noteEn } : {}),
    verifiedByReviewer: override?.verifiedByReviewer ?? base?.verifiedByReviewer ?? false,
  };
}

/** Aggregate verified style traits across all recordings of a reciter without inventing labels */
export function getStyleMetadataForReciter(
  reciterId: string,
  recordingIds: readonly string[],
  userOverrides: Record<string, Partial<RecordingStyleClassification>> = {},
) {
  const classifications = recordingIds
    .map((id) => getEffectiveRecordingClassification(id, userOverrides))
    .filter((c): c is RecordingStyleClassification => c !== null);

  const formats = Array.from(new Set(classifications.map((c) => c.format)));
  const emotionalStyles = Array.from(new Set(classifications.flatMap((c) => c.emotionalStyles)));
  const vocalQualities = Array.from(new Set(classifications.flatMap((c) => c.vocalQualities)));
  const signatureIds = Array.from(new Set(classifications.flatMap((c) => c.signatures ?? [])));
  const signatures: ReciterVocalSignature[] = signatureIds
    .map((id) => VERIFIED_RECITER_SIGNATURES[id])
    .filter((s): s is ReciterVocalSignature => Boolean(s));

  return {
    hasVerifiedClassifications: classifications.length > 0,
    classifiedCount: classifications.length,
    totalRecordingsCount: recordingIds.length,
    formats,
    emotionalStyles,
    vocalQualities,
    signatures,
  };
}

/** Build searchable bilingual tokens for a classified recording */
export function getRecordingStyleSearchText(
  recordingId: string,
  userOverrides: Record<string, Partial<RecordingStyleClassification>> = {},
): string {
  const c = getEffectiveRecordingClassification(recordingId, userOverrides);
  if (!c) return "";
  const sigParts = (c.signatures ?? []).map((sigId) => {
    const s = VERIFIED_RECITER_SIGNATURES[sigId];
    return s ? `${s.nameAr} ${s.nameEn} ${s.descriptionAr} ${s.descriptionEn}` : sigId;
  });
  return [
    c.format,
    TRADITIONAL_FORMATS_META[c.format]?.nameAr ?? "",
    TRADITIONAL_FORMATS_META[c.format]?.nameEn ?? "",
    ...c.emotionalStyles.map(
      (s) =>
        `${s} ${EMOTIONAL_STYLES_META[s]?.nameAr ?? ""} ${EMOTIONAL_STYLES_META[s]?.nameEn ?? ""}`,
    ),
    ...c.vocalQualities.map(
      (vq) =>
        `${vq} ${VOCAL_QUALITIES_META[vq]?.nameAr ?? ""} ${VOCAL_QUALITIES_META[vq]?.nameEn ?? ""}`,
    ),
    ...sigParts,
  ].join(" ");
}

/** Check if recording matches a style query or tag */
export function recordingMatchesStyle(
  classification: RecordingStyleClassification | null,
  criteria: {
    format?: TraditionalRecitationFormat | "all";
    emotionalStyle?: RecitationEmotionalStyle | "all";
    vocalQuality?: RecitationVocalQuality | "all";
    signatureId?: string | "all";
    query?: string;
  },
): boolean {
  if (!classification) return false;

  if (criteria.format && criteria.format !== "all" && classification.format !== criteria.format) {
    return false;
  }
  if (
    criteria.emotionalStyle &&
    criteria.emotionalStyle !== "all" &&
    !classification.emotionalStyles.includes(criteria.emotionalStyle)
  ) {
    return false;
  }
  if (
    criteria.vocalQuality &&
    criteria.vocalQuality !== "all" &&
    !classification.vocalQualities.includes(criteria.vocalQuality)
  ) {
    return false;
  }
  if (
    criteria.signatureId &&
    criteria.signatureId !== "all" &&
    !classification.signatures.includes(criteria.signatureId)
  ) {
    return false;
  }

  if (criteria.query && criteria.query.trim()) {
    const q = normalizeReciterSearchText(criteria.query);
    const haystack = [
      classification.format,
      TRADITIONAL_FORMATS_META[classification.format]?.nameAr ?? "",
      TRADITIONAL_FORMATS_META[classification.format]?.nameEn ?? "",
      ...classification.emotionalStyles.map(
        (s) =>
          `${s} ${EMOTIONAL_STYLES_META[s]?.nameAr ?? ""} ${EMOTIONAL_STYLES_META[s]?.nameEn ?? ""}`,
      ),
      ...classification.vocalQualities.map(
        (vq) =>
          `${vq} ${VOCAL_QUALITIES_META[vq]?.nameAr ?? ""} ${VOCAL_QUALITIES_META[vq]?.nameEn ?? ""}`,
      ),
      ...(classification.signatures ?? []).map((sigId) => {
        const s = VERIFIED_RECITER_SIGNATURES[sigId];
        return s ? `${s.nameAr} ${s.nameEn}` : sigId;
      }),
    ].join(" ");

    if (!matchesAllSearchTokens(haystack, q)) {
      return false;
    }
  }

  return true;
}

/** Distinctive Recitation Discovery Statistics */
export function getRecitationStyleSummaryStats(
  userOverrides: Record<string, Partial<RecordingStyleClassification>> = {},
) {
  const allKeys = new Set([
    ...Object.keys(VERIFIED_RECORDING_CLASSIFICATIONS),
    ...Object.keys(userOverrides),
  ]);
  const allClassified = Array.from(allKeys)
    .map((k) => getEffectiveRecordingClassification(k, userOverrides))
    .filter((c): c is RecordingStyleClassification => c !== null);

  const byFormat: Record<TraditionalRecitationFormat, number> = {
    murattal: 0,
    mujawwad: 0,
    tarteel: 0,
    muallim: 0,
    archive: 0,
  };
  for (const c of allClassified) {
    byFormat[c.format] = (byFormat[c.format] || 0) + 1;
  }

  const byEmotionalStyle: Partial<Record<RecitationEmotionalStyle, number>> = {};
  for (const c of allClassified) {
    for (const style of c.emotionalStyles) {
      byEmotionalStyle[style] = (byEmotionalStyle[style] || 0) + 1;
    }
  }

  const multiStyleRecordings = allClassified.filter(
    (c) => c.emotionalStyles.length + c.vocalQualities.length > 2,
  ).length;

  return {
    totalClassifiedRecordings: allClassified.length,
    totalSignaturesCount: Object.keys(VERIFIED_RECITER_SIGNATURES).length,
    byFormat,
    byEmotionalStyle,
    multiStyleRecordings,
  };
}
