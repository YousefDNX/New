/**
 * Verified Islamic Center Knowledge Catalog
 *
 * Includes strictly educational, source-attributed modules for:
 * - Tajweed Academy Lessons (Beginner / Intermediate / Advanced)
 * - Daily Sunnah & Thematic Hadith (distinguishing Obligatory vs Recommended + authenticity grade)
 * - Educational Fiqh & Rulings Reference (Ruling taxonomy + Madhhab difference notes; zero AI fatwas)
 * - Aqeedah & Islamic Foundations
 * - Seerah Timeline, Prophets Overview & Islamic Civilization Contributions
 * - Ramadan / Seasonal Worship & Islamic Moral Character (Akhlaq)
 * - Guided Learning Paths & Knowledge Quizzes
 */

import type { EditorialSourceCitation } from "@/lib/islamic-editorial";

export type TajweedLevel = "beginner" | "intermediate" | "advanced";

export interface TajweedLesson {
  id: string;
  level: TajweedLevel;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  ruleStepsAr: string[];
  ruleStepsEn: string[];
  quranicExamples: Array<{
    arabicPhrase: string;
    verseRef: string;
    highlightNoteAr: string;
    highlightNoteEn: string;
  }>;
  commonMistakeAr: string;
  commonMistakeEn: string;
  practiceReciterId: string;
  practiceSurahId: number;
  citation: EditorialSourceCitation;
}

export interface DailySunnahEntry {
  id: string;
  category: "morning" | "speech" | "social" | "hygiene" | "study" | "family";
  titleAr: string;
  titleEn: string;
  rulingDistinction: "recommended_sunnah" | "obligatory_foundation";
  hadithSummaryAr: string;
  hadithSummaryEn: string;
  authenticSourceAr: string;
  authenticSourceEn: string;
  grade: string;
  dailyActionAr: string;
  dailyActionEn: string;
  citation: EditorialSourceCitation;
}

export type FiqhRulingType =
  "obligatory" | "recommended" | "permissible" | "disliked" | "prohibited" | "scholarly_difference";

export type FiqhMadhhab = "general" | "hanafi" | "maliki" | "shafii" | "hanbali";

export interface FiqhTopicEntry {
  id: string;
  category: "taharah" | "salah" | "siyam" | "zakah" | "halal_principles" | "digital_student_ethics";
  titleAr: string;
  titleEn: string;
  rulingType: FiqhRulingType;
  summaryAr: string;
  summaryEn: string;
  keyConditionsAr: string[];
  keyConditionsEn: string[];
  madhhabNotes: Array<{
    school: Exclude<FiqhMadhhab, "general">;
    schoolLabelAr: string;
    schoolLabelEn: string;
    noteAr: string;
    noteEn: string;
  }>;
  scholarReferralNoticeAr: string;
  scholarReferralNoticeEn: string;
  citation: EditorialSourceCitation;
}

export interface AqeedahTopic {
  id: string;
  group: "pillars_islam" | "pillars_iman" | "levels_of_deen" | "tawheed_ethics";
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  corePointsAr: string[];
  corePointsEn: string[];
  proofReferenceAr: string;
  proofReferenceEn: string;
  citation: EditorialSourceCitation;
}

export interface SeerahAndHistoryEntry {
  id: string;
  kind: "seerah_timeline" | "prophets_quran" | "civilization";
  periodOrEraAr: string;
  periodOrEraEn: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  verifiedReferenceAr: string;
  verifiedReferenceEn: string;
  takeawayAr: string;
  takeawayEn: string;
}

export interface SeasonalAndAkhlaqEntry {
  id: string;
  kind: "ramadan_seasonal" | "akhlaq";
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  practicalStepsAr: string[];
  practicalStepsEn: string[];
  sourceNoteAr: string;
  sourceNoteEn: string;
}

export interface IslamicLearningPath {
  id: string;
  titleAr: string;
  titleEn: string;
  audienceAr: string;
  audienceEn: string;
  steps: Array<{
    id: string;
    titleAr: string;
    titleEn: string;
    recommendedTab: string;
  }>;
}

export interface IslamicQuizQuestion {
  id: string;
  domain: "tajweed" | "aqeedah" | "seerah" | "fiqh" | "hadith";
  questionAr: string;
  questionEn: string;
  optionsAr: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationAr: string;
  explanationEn: string;
  sourceRef: string;
}

const REVIEW_DATE = "2026-11-18";

export const TAJWEED_LESSONS: readonly TajweedLesson[] = [
  {
    id: "tajweed-noon-sakinah",
    level: "beginner",
    titleAr: "أحكام النون الساكنة والتنوين (الإظهار، الإدغام، الإقلاب، الإخفاء)",
    titleEn: "Noon Sakinah & Tanween (Izhar, Idgham, Iqlab & Ikhfa)",
    summaryAr:
      "القاعدة المحورية في تلاوة القرآن: تتغير طريقة نطق النون الخالية من الحركة أو التنوين بحسب الحرف الذي يليها.",
    summaryEn:
      "Foundational recitation rule: an unvoweled Noon (نْ) or Tanween changes pronunciation depending on the following Arabic letter.",
    ruleStepsAr: [
      "الإظهار الحلقي: النطق الواضح للنون دون غنة زائدة قبل (ء هـ ع ح غ خ).",
      "الإدغام: دمج النون في حروف (يرملون)؛ بغنة في (ينمو) وبغير غنة في (ل ر).",
      "الإقلاب: قلب النون ميماً مخفاة مع غنة بمقدار حركتين قبل الباء (ب).",
      "الإخفاء الحقيقي: حالة وسطى بين الإظهار والإدغام مع غنة عند الحروف الـ ١٥ الباقية.",
    ],
    ruleStepsEn: [
      "Izhar Halqi (Clear): Pronounce Noon cleanly before the 6 throat letters (ء هـ ع ح غ خ).",
      "Idgham (Merging): Merge into (ي ر م ل و ن) — with nasal Ghunnah in (ي ن م و), without Ghunnah in (ل ر).",
      "Iqlab (Conversion): Turn Noon into a concealed Meem with 2-count Ghunnah before Ba (ب).",
      "Ikhfa (Concealment): Halfway softened pronunciation with nasal Ghunnah before the remaining 15 letters.",
    ],
    quranicExamples: [
      {
        arabicPhrase: "مِنْ خَوْفٍ",
        verseRef: "Surah Quraysh 106:4",
        highlightNoteAr: "إظهار حلقي: نون ساكنة بعدها خاء",
        highlightNoteEn: "Izhar Halqi: Noon Sakinah followed by Kha (خ)",
      },
      {
        arabicPhrase: "مَن يَعْمَلْ",
        verseRef: "Surah Az-Zalzalah 99:7",
        highlightNoteAr: "إدغام بغنة: نون ساكنة بعدها ياء",
        highlightNoteEn: "Idgham with Ghunnah: Noon Sakinah followed by Ya (ي)",
      },
      {
        arabicPhrase: "سَمِيعٌ بَصِيرٌ",
        verseRef: "Surah Al-Isra 17:1",
        highlightNoteAr: "إقلاب: تنوين بعده باء",
        highlightNoteEn: "Iqlab: Tanween followed by Ba (ب)",
      },
      {
        arabicPhrase: "مِن شَرِّ",
        verseRef: "Surah Al-Falaq 113:2",
        highlightNoteAr: "إخفاء حقيقي: نون ساكنة بعدها شين",
        highlightNoteEn: "Ikhfa Haqiqi: Noon Sakinah followed by Sheen (ش)",
      },
    ],
    commonMistakeAr:
      "المبالغة في الضغط على الشفتين أثناء الإقلاب أو إسكان اللسان تماماً على مخرج النون في الإخفاء.",
    commonMistakeEn:
      "Pressing lips forcefully during Iqlab or anchoring the tongue tip completely during Ikhfa.",
    practiceReciterId: "al-husary",
    practiceSurahId: 106,
    citation: {
      status: "verified",
      sourceBookAr: "تحفة الأطفال والغلمان في تجويد القرآن",
      sourceBookEn: "Tuhfat al-Atfal (Lines 6–16)",
      scholarOrAuthorAr: "الشيخ سليمان الجمزوري",
      scholarOrAuthorEn: "Imam Sulayman al-Jamzuri",
      referenceCode: "Matn Tuhfat al-Atfal #1",
      reviewedDate: REVIEW_DATE,
    },
  },
  {
    id: "tajweed-meem-sakinah",
    level: "beginner",
    titleAr: "أحكام الميم الساكنة (الإخفاء الشفوي، الإدغام، الإظهار الشفوي)",
    titleEn: "Meem Sakinah Rules (Labial Ikhfa, Idgham & Izhar)",
    summaryAr:
      "ضبط الميم الساكنة (مْ) يحمي اللسان من الإدغام الخاطئ خاصة عند لقائها بالواو أو الفاء.",
    summaryEn:
      "Controlling unvoweled Meem (مْ) preserves crisp articulation, especially before Waaw (و) and Fa (ف).",
    ruleStepsAr: [
      "الإخفاء الشفوي: إذا جاء بعد الميم الساكنة حرف الباء (ب) مع غنة بمقدار حركتين.",
      "إدغام المتماثلين الصغير: ميم ساكنة بعدها ميم متحركة تدغمان ميماً مشددة بغنة.",
      "الإظهار الشفوي: عند باقي الحروف الـ ٢٦، ويشتد الحرص على الإظهار عند الواو والفاء.",
    ],
    ruleStepsEn: [
      "Ikhfa Shafawi: Before Ba (ب) — slight gentle labial contact with 2-count Ghunnah.",
      "Idgham Shafawi: Before another Meem (م) — merge cleanly into one doubled Meem with Ghunnah.",
      "Izhar Shafawi: Clear articulation before the remaining 26 letters — extra care before Fa (ف) and Waaw (و).",
    ],
    quranicExamples: [
      {
        arabicPhrase: "تَرْمِيهِم بِحِجَارَةٍ",
        verseRef: "Surah Al-Fil 105:4",
        highlightNoteAr: "إخفاء شفوي: ميم ساكنة بعدها باء",
        highlightNoteEn: "Labial Ikhfa: Meem Sakinah followed by Ba",
      },
      {
        arabicPhrase: "أَطْعَمَهُم مِّن جُوعٍ",
        verseRef: "Surah Quraysh 106:4",
        highlightNoteAr: "إدغام مثلين صغير: ميم ساكنة بعدها ميم",
        highlightNoteEn: "Labial Idgham: Meem Sakinah followed by Meem",
      },
      {
        arabicPhrase: "عَلَيْهِمْ وَلَا",
        verseRef: "Surah Al-Fatihah 1:7",
        highlightNoteAr: "إظهار شفوي قوي عند الواو دون غنة زائدة",
        highlightNoteEn: "Strict Labial Izhar before Waaw without dragging nasal sound",
      },
    ],
    commonMistakeAr:
      "إخفاء الميم عند الواو أو الفاء لقرب مخرجهما من الشفتين (الصواب إظهارها تماماً).",
    commonMistakeEn:
      "Accidentally nasalizing/hiding Meem before Waaw or Fa due to shared lip articulation.",
    practiceReciterId: "ayman-swaid",
    practiceSurahId: 105,
    citation: {
      status: "verified",
      sourceBookAr: "تحفة الأطفال — باب الميم الساكنة",
      sourceBookEn: "Tuhfat al-Atfal — Chapter on Meem Sakinah",
      scholarOrAuthorAr: "الشيخ سليمان الجمزوري",
      scholarOrAuthorEn: "Imam Sulayman al-Jamzuri",
      referenceCode: "Matn Tuhfat al-Atfal #18-23",
      reviewedDate: REVIEW_DATE,
    },
  },
  {
    id: "tajweed-qalqalah",
    level: "intermediate",
    titleAr: "القلقلة ومراتبها (حروف قطب جد)",
    titleEn: "Qalqalah (Echo Bounce on ق ط ب ج د)",
    summaryAr: "اضطراب المخرج عند النطق بأحد حروف (ق ط ب ج د) حال سكونها لكي لا يضيع صوت الحرف.",
    summaryEn:
      "A crisp released echo on stops ق ط ب ج د when unvoweled (Sukoon) so the consonant remains audible.",
    ruleStepsAr: [
      "الحروف الخمسة مجموعة في: «قُطْبُ جَدٍّ».",
      "قلقلة صغرى: إذا سكن الحرف في وسط الكلمة أو أثناء الوصل (مثل: يَدْخُلُونَ).",
      "قلقلة كبرى: إذا وُقف على الحرف الساكن في آخر الكلمة (مثل: قُلْ هُوَ اللَّهُ أَحَدٌ).",
      "تُنطق القلقلة دون إمالة صوتها نحو الفتحة أو الكسرة أو الضمة.",
    ],
    ruleStepsEn: [
      "Five Qalqalah letters: Qaf (ق), Taa (ط), Baa (ب), Jeem (ج), Dal (د).",
      "Minor Qalqalah: When the unvoweled letter occurs mid-word or continuing without pause.",
      "Major Qalqalah: Stronger release when stopping at the end of an Ayah or word.",
      "Avoid adding an unintended vowel (fatha/kasra/damma) onto the bounce.",
    ],
    quranicExamples: [
      {
        arabicPhrase: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
        verseRef: "Surah Al-Falaq 113:1",
        highlightNoteAr: "قلقلة كبرى على القاف عند الوقف",
        highlightNoteEn: "Major Qalqalah on final Qaf when pausing",
      },
      {
        arabicPhrase: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        verseRef: "Surah Al-Ikhlas 112:3",
        highlightNoteAr: "قلقلة صغرى في (يلد) وكبرى عند الوقف في (يولد)",
        highlightNoteEn: "Minor Qalqalah mid-verse, Major Qalqalah at pause",
      },
    ],
    commonMistakeAr: "فتح الحرف المقلقل مثل نطق (أحَدَ) بالفتح بدلاً من سكون خالص مع اضطراب المخرج.",
    commonMistakeEn: "Turning a stopped Qalqalah letter into a full vowel sound like Fatha.",
    practiceReciterId: "al-husary",
    practiceSurahId: 112,
    citation: {
      status: "verified",
      sourceBookAr: "المقدمة الجزرية — باب الصفات",
      sourceBookEn: "Al-Muqaddimah Al-Jazariyyah",
      scholarOrAuthorAr: "الإمام محمد بن الجزري",
      scholarOrAuthorEn: "Imam Ibn al-Jazari",
      referenceCode: "Jazariyyah Line 25",
      reviewedDate: REVIEW_DATE,
    },
  },
  {
    id: "tajweed-madd-rules",
    level: "intermediate",
    titleAr: "أحكام المدود (الطبيعي ٢، المتصل والمنفصل ٤–٥، اللازم ٦ حركات)",
    titleEn: "Vowels & Elongation (Madd Tabi'i, Mutassil, Munfasil & Lazim)",
    summaryAr:
      "إطالة الصوت بحروف المد الثلاثة (الألف، الواو، الياء بشروطها) بموازين زمنية مضبوطة حسب السبب.",
    summaryEn:
      "Prolonging the three vowel letters (Alif, Waaw, Yaa) in balanced 2, 4–5, or 6 counts depending on Hamzah or Sukoon.",
    ruleStepsAr: [
      "المد الطبيعي (الأصلي): حركتان فقط لعدم وجود همز أو سكون بعده.",
      "المد الواجب المتصل: حرف المد والهمزة في نفس الكلمة — ٤ أو ٥ حركات في رواية حفص.",
      "المد الجائز المنفصل: حرف المد آخر الكلمة الأولى والهمزة أول الثانية — ٢ أو ٤ أو ٥ حركات حسب القصر أو التوسط.",
      "المد اللازم: يقع بعد حرف المد سكون أصلي لازم — يمد ٦ حركات بالإجماع.",
    ],
    ruleStepsEn: [
      "Madd Tabi'i (Natural): Always 2 vowel counts when no Hamzah or Sukoon follows.",
      "Madd Wajib Muttasil (Connected): Vowel + Hamzah inside one word — obligatory 4–5 counts in Hafs.",
      "Madd Ja'iz Munfasil (Separated): Vowel ends word 1, Hamzah opens word 2 — 4–5 counts (Shatebiyyah).",
      "Madd Lazim (Compulsory): Vowel followed by permanent Sukoon/Shaddah — consistently 6 counts.",
    ],
    quranicExamples: [
      {
        arabicPhrase: "وَلَا الضَّالِّينَ",
        verseRef: "Surah Al-Fatihah 1:7",
        highlightNoteAr: "مد لازم كلمي مثقل (٦ حركات)",
        highlightNoteEn: "Madd Lazim Kalimi Muthaqqal (6 counts before doubled Lam)",
      },
      {
        arabicPhrase: "إِذَا جَاءَ نَصْرُ اللَّهِ",
        verseRef: "Surah An-Nasr 110:1",
        highlightNoteAr: "مد واجب متصل في كلمة (جاء) ٤–٥ حركات",
        highlightNoteEn: "Madd Wajib Muttasil inside (جَاءَ) 4–5 counts",
      },
    ],
    commonMistakeAr:
      "خلط مقدار المد المنفصل بين ٤ حركات وحركتين في نفس التلاوة، أو تمويج الصوت في المد.",
    commonMistakeEn:
      "Mixing 2-count and 4-count Munfasil lengths inconsistently within the same sitting.",
    practiceReciterId: "al-minshawi",
    practiceSurahId: 110,
    citation: {
      status: "verified",
      sourceBookAr: "تحفة الأطفال — أقسام المد",
      sourceBookEn: "Tuhfat al-Atfal — Sections on Madd",
      scholarOrAuthorAr: "الشيخ سليمان الجمزوري",
      scholarOrAuthorEn: "Imam Sulayman al-Jamzuri",
      referenceCode: "Matn Tuhfat al-Atfal #34-55",
      reviewedDate: REVIEW_DATE,
    },
  },
  {
    id: "tajweed-tafkheem-tarqeeq",
    level: "advanced",
    titleAr: "التفخيم والترقيق وأحكام الراء ولام لفظ الجلالة",
    titleEn: "Tafkheem (Heavy) vs Tarqeeq (Light): Raa & Lam of Allah",
    summaryAr:
      "ضبط امتلاء الفم بصدى الحرف في حروف الاستعلاء (خص ضغط قظ) وتغير حال الراء ولام (الله) بحسب الحركة قبلها.",
    summaryEn:
      "Mastering heavy elevation on (خ ص ض غ ط ق ظ) and conditional heaviness/lightness on Raa (ر) and Allah's Name.",
    ruleStepsAr: [
      "حروف الاستعلاء السبعة (خ ص ض غ ط ق ظ) مفخمة دائماً بدرجاتها.",
      "لام لفظ الجلالة «الله» تفخم بعد الفتح أو الضم (قُلْ هُوَ اللَّهُ) وترقق بعد الكسر (بِسْمِ اللَّهِ).",
      "الراء تفخم إذا كانت مفتوحة أو مضمومة، وترقق إذا كانت مكسورة أو ساكنة بعد كسر أصلي وليس بعدها حرف استعلاء.",
    ],
    ruleStepsEn: [
      "Seven elevated letters (خ ص ض غ ط ق ظ) are always heavy across varying degrees.",
      "Lam in Allah (لله) is heavy after Fatha or Damma (هُوَ اللَّهُ), light after Kasra (بِسْمِ اللَّهِ).",
      "Raa (ر) is heavy when Fatha/Damma, light when Kasra or unvoweled after genuine Kasra.",
    ],
    quranicExamples: [
      {
        arabicPhrase: "بِسْمِ اللَّهِ الرَّحْمَـٰنِ",
        verseRef: "Surah Al-Fatihah 1:1",
        highlightNoteAr: "اللام مرققة بعد كسرة الميم، والراء مفخمة للفتح",
        highlightNoteEn: "Light Lam after Kasra in Bismi; heavy Raa with Fatha",
      },
      {
        arabicPhrase: "قُلْ هُوَ اللَّهُ أَحَدٌ",
        verseRef: "Surah Al-Ikhlas 112:1",
        highlightNoteAr: "تفخيم لام لفظ الجلالة لوقوعها بعد ضمة الواو",
        highlightNoteEn: "Heavy Lam in Allah following the Damma on Huwa",
      },
    ],
    commonMistakeAr:
      "تفخيم حرف مرقق لمجاورته حرفاً مفخماً، مثل تفخيم الألف بعد الباء في كلمة (بَاطِل).",
    commonMistakeEn: "Letting an adjacent heavy letter contaminate neighboring light letters.",
    practiceReciterId: "ayman-swaid",
    practiceSurahId: 1,
    citation: {
      status: "verified",
      sourceBookAr: "المقدمة الجزرية — باب التفخيم والترقيق والراءات",
      sourceBookEn: "Al-Muqaddimah Al-Jazariyyah — Tafkheem & Raa Rules",
      scholarOrAuthorAr: "الإمام ابن الجزري",
      scholarOrAuthorEn: "Imam Ibn al-Jazari",
      referenceCode: "Jazariyyah Lines 37-46",
      reviewedDate: REVIEW_DATE,
    },
  },
];

export const DAILY_SUNNAH_PRACTICES: readonly DailySunnahEntry[] = [
  {
    id: "sunnah-intentions",
    category: "morning",
    titleAr: "تجديد النية الصادقة في العلم والعمل",
    titleEn: "Renewing Sincere Intention Before Study & Work",
    rulingDistinction: "obligatory_foundation",
    hadithSummaryAr:
      "«إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى...» — أساس كل عبادة وطلب علم نافع.",
    hadithSummaryEn:
      '"Actions are judged by intentions, and every person shall have what they intended."',
    authenticSourceAr: "صحيح البخاري (١) وصحيح مسلم (١٩٠٧)",
    authenticSourceEn: "Sahih al-Bukhari #1 & Sahih Muslim #1907",
    grade: "Muttafaqun 'Alayh (Agreed Upon / متفق عليه)",
    dailyActionAr: "احتسب قبل بدء المذاكرة أو مساعدة غيرك أن تنفع به عباد الله.",
    dailyActionEn:
      "Pause briefly before studying to align your effort for beneficial service and truth.",
    citation: {
      status: "verified",
      sourceBookAr: "صحيح البخاري / صحيح مسلم / الأربعون النووية",
      sourceBookEn: "Sahih al-Bukhari & Sahih Muslim",
      scholarOrAuthorAr: "الإمام البخاري والإمام مسلم",
      scholarOrAuthorEn: "Imam Al-Bukhari & Imam Muslim",
      referenceCode: "Bukhari #1 / Nawawi #1",
      hadithGrade: "Sahih (Muttafaqun 'Alayh)",
      reviewedDate: REVIEW_DATE,
    },
  },
  {
    id: "sunnah-gentle-speech",
    category: "speech",
    titleAr: "حفظ اللسان والكلمة الطيبة",
    titleEn: "Speaking Good or Remaining Silent",
    rulingDistinction: "recommended_sunnah",
    hadithSummaryAr: "«من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت».",
    hadithSummaryEn:
      '"Whoever believes in Allah and the Last Day should speak good or remain silent."',
    authenticSourceAr: "صحيح البخاري (٦٠١٨) وصحيح مسلم (٤٧)",
    authenticSourceEn: "Sahih al-Bukhari #6018 & Sahih Muslim #47",
    grade: "Muttafaqun 'Alayh (Agreed Upon / متفق عليه)",
    dailyActionAr: "تثبّت قبل إرسال أي تعليق أو رسالة من نفعها وخلوّها من السخرية والغيبة.",
    dailyActionEn:
      "Pause before posting or speaking to verify that your words are truthful and free from harm.",
    citation: {
      status: "verified",
      sourceBookAr: "صحيح البخاري وصحيح مسلم",
      sourceBookEn: "Sahih al-Bukhari & Sahih Muslim",
      scholarOrAuthorAr: "الإمام النووي (الأربعون رقم ١٥)",
      scholarOrAuthorEn: "Forty Nawawi #15",
      referenceCode: "Bukhari #6018 / Muslim #47",
      hadithGrade: "Sahih",
      reviewedDate: REVIEW_DATE,
    },
  },
  {
    id: "sunnah-cleanliness-siwak",
    category: "hygiene",
    titleAr: "الطهارة والنظافة واستخدام السواك عند الصلاة",
    titleEn: "Personal Cleanliness & Oral Hygiene Before Prayer",
    rulingDistinction: "recommended_sunnah",
    hadithSummaryAr: "«لولا أن أشق على أمتي لأمرتهم بالسواك عند كل صلاة».",
    hadithSummaryEn:
      '"Were it not to place hardship on my community, I would have ordered them to use the Siwak before every prayer."',
    authenticSourceAr: "صحيح البخاري (٨٨٧) وصحيح مسلم (٢٥٢)",
    authenticSourceEn: "Sahih al-Bukhari #887 & Sahih Muslim #252",
    grade: "Muttafaqun 'Alayh",
    dailyActionAr: "حافظ على تجديد الوضوء ونظافة الفم والملبس عند الاستعداد للعبادة والدراسة.",
    dailyActionEn:
      "Maintain oral hygiene and tidy attire as a daily Prophetic habit (recommended Sunnah, distinct from obligatory Wudu).",
    citation: {
      status: "verified",
      sourceBookAr: "صحيح البخاري / صحيح مسلم",
      sourceBookEn: "Sahih al-Bukhari #887 & Sahih Muslim #252",
      scholarOrAuthorAr: "أبو هريرة رضي الله عنه",
      scholarOrAuthorEn: "Narrated by Abu Hurairah (RA)",
      referenceCode: "Bukhari #887",
      hadithGrade: "Sahih",
      reviewedDate: REVIEW_DATE,
    },
  },
  {
    id: "sunnah-salam-peace",
    category: "social",
    titleAr: "إفشاء السلام وبشاشة الوجه",
    titleEn: "Spreading Greetings of Peace (Salam) & Warmth",
    rulingDistinction: "recommended_sunnah",
    hadithSummaryAr:
      "«لا تدخلون الجنة حتى تؤمنوا، ولا تؤمنوا حتى تحابوا، أولا أدلكم على شيء إذا فعلتموه تحاببتم؟ أفشوا السلام بينكم».",
    hadithSummaryEn:
      '"Spread Salam (peace greetings) among yourselves" — cultivating community warmth and trust.',
    authenticSourceAr: "صحيح مسلم (٥٤)",
    authenticSourceEn: "Sahih Muslim #54",
    grade: "Sahih",
    dailyActionAr: "ابدأ بالسلام عند لقاء زملائك وأهلك ومعلميك مع الابتسامة الطيبة.",
    dailyActionEn:
      "Initiate warm greetings of peace toward family, peers, and neighbors (Initiating Salam is Sunnah; returning it is Wajib).",
    citation: {
      status: "verified",
      sourceBookAr: "صحيح مسلم (كتاب الإيمان)",
      sourceBookEn: "Sahih Muslim #54",
      scholarOrAuthorAr: "الإمام مسلم",
      scholarOrAuthorEn: "Imam Muslim",
      referenceCode: "Muslim #54",
      hadithGrade: "Sahih",
      reviewedDate: REVIEW_DATE,
    },
  },
  {
    id: "sunnah-mercy-creation",
    category: "family",
    titleAr: "الرحمة بالناس والرفق في كل أمر",
    titleEn: "Compassion Toward All People & Gentleness",
    rulingDistinction: "recommended_sunnah",
    hadithSummaryAr:
      "«الراحمون يرحمهم الرحمن، ارحموا من في الأرض يرحمكم من في السماء» و«إن الله رفيق يحب الرفق في الأمر كله».",
    hadithSummaryEn:
      '"The merciful are shown mercy by the Most Merciful — show mercy to those on earth" & "Gentleness adorns whatever it enters."',
    authenticSourceAr: "سنن أبي داود (٤٩٤١) والترمذي (١٩٢٤) / صحيح البخاري (٦٩٢٧)",
    authenticSourceEn: "Abu Dawud #4941, Tirmidhi #1924 / Sahih al-Bukhari #6927",
    grade: "Sahih",
    dailyActionAr: "عامل الصغار والكبار وحتى الحيوان برفق وتواضع وتيسير دون غلظة.",
    dailyActionEn:
      "Practice deliberate gentleness in family conversations, study teams, and care for living creatures.",
    citation: {
      status: "verified",
      sourceBookAr: "صحيح البخاري وسنن الترمذي",
      sourceBookEn: "Sahih al-Bukhari & Jami' at-Tirmidhi",
      scholarOrAuthorAr: "المحدثون",
      scholarOrAuthorEn: "Authenticated Hadith Collections",
      referenceCode: "Bukhari #6927 / Tirmidhi #1924",
      hadithGrade: "Sahih",
      reviewedDate: REVIEW_DATE,
    },
  },
  {
    id: "sunnah-beneficial-knowledge",
    category: "study",
    titleAr: "طلب العلم النافع وسؤال الله التوفيق",
    titleEn: "Seeking Beneficial Knowledge Daily",
    rulingDistinction: "recommended_sunnah",
    hadithSummaryAr:
      "«من سلك طريقاً يلتمس فيه علماً سهل الله له به طريقاً إلى الجنة» ودعاء الصباح: «اللهم إني أسألك علماً نافعاً...».",
    hadithSummaryEn:
      '"Whoever follows a path seeking knowledge, Allah makes easy for them a path toward Paradise" & daily morning dua for beneficial knowledge.',
    authenticSourceAr: "صحيح مسلم (٢٦٩٩) وسنن ابن ماجه (٩٢٥)",
    authenticSourceEn: "Sahih Muslim #2699 & Sunan Ibn Majah #925 (Hasan/Sahih)",
    grade: "Sahih",
    dailyActionAr: "ادعُ بعد الفجر بسؤال العلم النافع، واجعل تعلمك سبباً في نفع مجتمعك.",
    dailyActionEn:
      "Recite the Prophetic supplication for beneficial knowledge after Fajr and apply what you learn constructively.",
    citation: {
      status: "verified",
      sourceBookAr: "صحيح مسلم / حصن المسلم",
      sourceBookEn: "Sahih Muslim & Hisn al-Muslim",
      scholarOrAuthorAr: "الإمام مسلم",
      scholarOrAuthorEn: "Imam Muslim",
      referenceCode: "Muslim #2699",
      hadithGrade: "Sahih",
      reviewedDate: REVIEW_DATE,
    },
  },
];

export const FIQH_TOPICS_CATALOG: readonly FiqhTopicEntry[] = [
  {
    id: "fiqh-wudu-essentials",
    category: "taharah",
    titleAr: "فرائض الوضوء وسننه",
    titleEn: "Purification (Wudu): Obligatory Pillars vs Sunnah Practices",
    rulingType: "obligatory",
    summaryAr:
      "الوضوء شرط لصحة الصلاة، وتتضمن آية المائدة (٦) أركانه الأساسية بينما تزيده السنن إتماماً ونوراً.",
    summaryEn:
      "Ritual ablution (Wudu) is a condition for valid Prayer, rooted in Surah Al-Ma'idah (5:6) with recognized juristic details across the four schools.",
    keyConditionsAr: [
      "غسل الوجه كاملاً مرة واحدة على الأقل (واجب قرآني).",
      "غسل اليدين إلى المرفقين، ومسح الرأس، وغسل الرجلين إلى الكعبين.",
      "النية والترتيب والموالاة (مع اختلاف مذهبي في وجوب بعضها).",
    ],
    keyConditionsEn: [
      "Washing the entire face thoroughly at least once.",
      "Washing both arms up to and including the elbows, wiping the head, and washing feet to the ankles.",
      "Intention, sequential order, and continuity (with documented juristic nuances between schools).",
    ],
    madhhabNotes: [
      {
        school: "hanafi",
        schoolLabelAr: "الحنفية",
        schoolLabelEn: "Hanafi",
        noteAr: "الفروض الأربعة المنصوصة في الآية، مع سنية النية والترتيب ومسح ربع الرأس.",
        noteEn:
          "4 textual pillars from 5:6; intention and strict sequence are emphasized Sunnahs; wiping at least 1/4 of the head.",
      },
      {
        school: "shafii",
        schoolLabelAr: "الشافعية",
        schoolLabelEn: "Shafi'i",
        noteAr: "النية والترتيب ركنان مع الأعضاء الأربعة، ويجزئ مسح أقل ما ينطلق عليه اسم المسح.",
        noteEn:
          "Intention and sequential order are obligatory pillars alongside the 4 bodily washings/wiping.",
      },
      {
        school: "maliki",
        schoolLabelAr: "المالكية",
        schoolLabelEn: "Maliki",
        noteAr: "يوجب الدلك وتعميم جميع الرأس بالمسح والموالاة عند التذكر.",
        noteEn: "Emphasizes rubbing (Dalk), continuity (Muwalah), and wiping the entire head.",
      },
      {
        school: "hanbali",
        schoolLabelAr: "الحنابلة",
        schoolLabelEn: "Hanbali",
        noteAr: "يشترط التسمية مع الذكر والترتيب والموالاة وتعميم مسح الرأس.",
        noteEn:
          "Requires intention, sequence, continuity, wiping the head completely (including ears in Sunnah).",
      },
    ],
    scholarReferralNoticeAr:
      "للمسائل الخاصة كالجبيرة وأعذار الطهارة المزمنة يُرجى استشارة عالم أو فقيه مختص.",
    scholarReferralNoticeEn:
      "For medical casts, chronic excuses, or special purification cases, consult a qualified local scholar.",
    citation: {
      status: "disputed",
      sourceBookAr: "سورة المائدة (٦) والفقه المقارن للمذاهب الأربعة",
      sourceBookEn: "Surah Al-Ma'idah 5:6 & Comparative Classical Fiqh",
      scholarOrAuthorAr: "أئمة المذاهب الأربعة",
      scholarOrAuthorEn: "Classical Sunni Jurisprudence",
      referenceCode: "Quran 5:6 / Comparative Taharah",
      scholarlyDifferenceNoteAr:
        "اتفق العلماء على الغسل والمسح واختلفوا في تفاصيل الترتيب ومسح الرأس.",
      scholarlyDifferenceNoteEn:
        "Consensus on core pillars; respected differences on head-wiping extent and sequence.",
      reviewedDate: REVIEW_DATE,
    },
  },
  {
    id: "fiqh-prayer-pillars",
    category: "salah",
    titleAr: "شروط الصلاة وأركانها وخشوعها",
    titleEn: "Prayer Conditions, Essential Pillars & Calm Composure",
    rulingType: "obligatory",
    summaryAr:
      "الصلاة عمود الإسلام، ولا تصح إلا بتحقق شروطها (كالطهارة ودخول الوقت واستقبال القبلة) وأركانها بطمأنينة.",
    summaryEn:
      "The five daily prayers are an individual obligation, requiring prerequisites (time, purification, Qiblah) and tranquil pillars (Tuma'ninah).",
    keyConditionsAr: [
      "الشروط: الإسلام والعقل والطهارة ودخول الوقت وستر العورة واستقبال القبلة.",
      "الأركان: القيام مع القدرة، تكبيرة الإحرام، قراءة الفاتحة، الركوع، السجود، التشهد الأخير، التسليم، والطمأنينة.",
    ],
    keyConditionsEn: [
      "Prerequisites: Purity, confirmed prayer time window, modest covering, facing Qiblah.",
      "Pillars: Standing if able, Takbiratul Ihram, Al-Fatihah, Ruku', Sujud, final sitting, Salam, and tranquil pause (Tuma'ninah).",
    ],
    madhhabNotes: [
      {
        school: "hanafi",
        schoolLabelAr: "الحنفية",
        schoolLabelEn: "Hanafi",
        noteAr: "يميّزون بين الركن والواجب كقراءة الفاتحة (واجبة عندهم فيسجد للسهو عند تركها سهواً).",
        noteEn:
          "Distinguishes Fard vs Wajib (e.g. missing Al-Fatihah forgetfully is remedied via Sujud as-Sahw).",
      },
      {
        school: "shafii",
        schoolLabelAr: "الشافعية",
        schoolLabelEn: "Shafi'i",
        noteAr: "تجب الفاتحة في كل ركعة على الإمام والمنفرد والمأموم في القول الجديد.",
        noteEn: "Al-Fatihah is an essential pillar in every rak'ah.",
      },
      {
        school: "maliki",
        schoolLabelAr: "المالكية",
        schoolLabelEn: "Maliki",
        noteAr: "الفاتحة ركن للإمام والمنفرد دون المأموم في الجهرية.",
        noteEn: "Al-Fatihah is a pillar for the Imam and solo worshipper.",
      },
      {
        school: "hanbali",
        schoolLabelAr: "الحنابلة",
        schoolLabelEn: "Hanbali",
        noteAr: "يتساهل للمأموم أثناء جهر الإمام مع استحباب القراءة في السكتات.",
        noteEn:
          "Pillar for Imam & solo worshipper; follower listens silently during aloud recitation.",
      },
    ],
    scholarReferralNoticeAr: "أحكام قصر المسافر وسجود السهو المفصلة تُراجع مع الفقيه عند التباسها.",
    scholarReferralNoticeEn:
      "Detailed travel shortening/combining or missed prayer remedies should be reviewed with a teacher.",
    citation: {
      status: "disputed",
      sourceBookAr: "حديث المسيء صلاته (البخاري ٧٥٧ / مسلم ٣٩٧)",
      sourceBookEn: "Hadith of the Man Who Prayed Badly (Bukhari #757 / Muslim #397)",
      scholarOrAuthorAr: "اتفق عليه الشيخان",
      scholarOrAuthorEn: "Al-Bukhari & Muslim",
      referenceCode: "Bukhari #757",
      scholarlyDifferenceNoteAr:
        "تختلف تفاصيل قراءة المأموم خلف الإمام في الصلاة الجهرية بين المذاهب.",
      scholarlyDifferenceNoteEn:
        "Documented school differences exist regarding follower recitation during aloud prayers.",
      reviewedDate: REVIEW_DATE,
    },
  },
  {
    id: "fiqh-fasting-basics",
    category: "siyam",
    titleAr: "أحكام صيام رمضان والأعذار المبيحة للفطر",
    titleEn: "Ramadan Fasting Rules & Valid Exemptions",
    rulingType: "obligatory",
    summaryAr:
      "الصيام إمساك عن المفطرات من طلوع الفجر الصادق إلى غروب الشمس بنية خالصة، مع رخص رحيمة للمريض والمسافر.",
    summaryEn:
      "Fasting Ramadan abstains from food, drink, and marital intimacy from true dawn to sunset with compassionate exemptions for illness and travel.",
    keyConditionsAr: [
      "تبييت النية في صيام الفرض قبل الفجر.",
      "رخصة الفطر مع القضاء للمريض مرضاً يُرجى شفاؤه والمسافر (البقرة ١٨٤–١٨٥).",
      "الفدية إطعام مسكين لمن لا يرجى برؤه لكبر سن أو مرض مزمن.",
    ],
    keyConditionsEn: [
      "Forming intention before dawn for obligatory Ramadan fasts.",
      "Compassionate exemption with later make-up (Qada) for temporary illness or travel (Quran 2:184–185).",
      "Fidyah (feeding a person in need) for permanent inability due to frailty or chronic illness.",
    ],
    madhhabNotes: [
      {
        school: "hanafi",
        schoolLabelAr: "الحنفية",
        schoolLabelEn: "Hanafi",
        noteAr: "يجوز عقد النية لصيام رمضان إلى ما قبل الزوال (نصف النهار الشرعي).",
        noteEn:
          "Permits confirming Ramadan day's intention up until Islamic midday if no invalidator occurred.",
      },
      {
        school: "shafii",
        schoolLabelAr: "الشافعية",
        schoolLabelEn: "Shafi'i",
        noteAr: "يشترط تبييت النية ليلاً لكل يوم من أيام رمضان.",
        noteEn: "Requires renewing intention each night before Fajr.",
      },
      {
        school: "maliki",
        schoolLabelAr: "المالكية",
        schoolLabelEn: "Maliki",
        noteAr: "تكفي نية واحدة في أول الشهر لصيام رمضان المتتابع.",
        noteEn: "One overarching intention at the start of Ramadan covers continuous fasts.",
      },
      {
        school: "hanbali",
        schoolLabelAr: "الحنابلة",
        schoolLabelEn: "Hanbali",
        noteAr: "تجب النية لكل ليلة قبل الفجر لأي صيام واجب.",
        noteEn: "Nightly intention before dawn required per day of obligatory fasting.",
      },
    ],
    scholarReferralNoticeAr:
      "استشر طبيباً مسلماً وعالماً في حالات البخاخات أو الفحوص الطبية أثناء الصيام.",
    scholarReferralNoticeEn:
      "Consult qualified medical & scholarly guidance regarding modern inhalers or medical procedures.",
    citation: {
      status: "verified",
      sourceBookAr: "سورة البقرة (١٨٣–١٨٧)",
      sourceBookEn: "Surah Al-Baqarah 2:183–187",
      scholarOrAuthorAr: "القرآن الكريم وكتب الفقه",
      scholarOrAuthorEn: "Quran & Classical Manuals",
      referenceCode: "Quran 2:183-187",
      reviewedDate: REVIEW_DATE,
    },
  },
  {
    id: "fiqh-zakah-compassion",
    category: "zakah",
    titleAr: "الزكاة والصدقات (تطهير المال والتكافل)",
    titleEn: "Zakah Foundations & Voluntary Charity (Sadaqah)",
    rulingType: "obligatory",
    summaryAr:
      "الزكاة حق معلوم في المال إذا بلغ النصاب وحال عليه الحول، وتُصرف في مصارفها الثمانية (التوبة ٦٠).",
    summaryEn:
      "Zakah is an obligatory annual welfare due once savings reach Nisab for a full lunar year, distributed to the 8 Quranic categories (9:60).",
    keyConditionsAr: [
      "بلوغ النصاب (ما يعادل ٨٥ جم من الذهب الخالص أو ٥٩٥ جم فضة) ومرور حول هجري كامل.",
      "المقدار المعهود في زكاة النقود وعروض التجارة هو ٢.٥٪ (ربع العشر).",
      "الصدقة التطوعية مفتوحة في كل وقت بلا نصاب ولا حول.",
    ],
    keyConditionsEn: [
      "Savings meeting Nisab threshold (benchmark: 85g gold or 595g silver) held for 1 Hijri year.",
      "Standard rate on liquid savings & trade inventory: 2.5%.",
      "Voluntary Sadaqah has zero minimum threshold and includes helping neighbors & students.",
    ],
    madhhabNotes: [
      {
        school: "hanafi",
        schoolLabelAr: "الحنفية",
        schoolLabelEn: "Hanafi",
        noteAr: "يحتسبون نصاب الفضة أحظّ للفقراء عند تفاوت القيمتين.",
        noteEn: "Prefers the silver benchmark when it yields broader benefit to recipients.",
      },
      {
        school: "shafii",
        schoolLabelAr: "الشافعية",
        schoolLabelEn: "Shafi'i",
        noteAr: "لا زكاة في حليّ المرأة المباح المتخذ للزينة المعتادة.",
        noteEn: "Personal worn jewelry within customary limits is exempt.",
      },
    ],
    scholarReferralNoticeAr: "احسب زكاة الأسهم أو الديون التجارية مع مستشار زكاة معتمد أو فقيه.",
    scholarReferralNoticeEn:
      "Complex business assets, stocks, or debt offsets should be reviewed with a qualified Zakah advisor.",
    citation: {
      status: "disputed",
      sourceBookAr: "سورة التوبة (٦٠) وكتب الزكاة",
      sourceBookEn: "Surah At-Tawbah 9:60",
      scholarOrAuthorAr: "أهل العلم",
      scholarOrAuthorEn: "Classical Jurisprudence",
      referenceCode: "Quran 9:60",
      reviewedDate: REVIEW_DATE,
    },
  },
  {
    id: "fiqh-student-digital-ethics",
    category: "digital_student_ethics",
    titleAr: "أمانة الطالب والأخلاق الرقمية (الغش، الغيبة الإلكترونية، توثيق الذكاء الاصطناعي)",
    titleEn: "Student Academic Honesty & Digital Ethics in Islam",
    rulingType: "prohibited",
    summaryAr:
      "الغش في الامتحانات وانتحال أبحاث الغير ونشر الغيبة والشائعات عبر الإنترنت محرم لما فيه من الخيانة والظلم.",
    summaryEn:
      "Cheating on exams, plagiarizing AI/peer work as your own, cyberbullying, and spreading unverified rumors violate Islamic Amanah and honesty.",
    keyConditionsAr: [
      "تحريم الغش: «من غش فليس مني» (صحيح مسلم ١٠٢) — يشمل الامتحانات والتقارير المدرسية.",
      "التثبت قبل النشر: «يا أيها الذين آمنوا إن جاءكم فاسق بنبإ فتبينوا» (الحجرات ٦).",
      "صيانة الأوقات من التشتيت الرقمي والالتزام بغض البصر والكلمة المسؤولة.",
    ],
    keyConditionsEn: [
      'Prohibition of academic deception: "Whoever deceives is not of us" (Sahih Muslim #102).',
      "Fact-checking before sharing online (Surah Al-Hujurat 49:6 & 49:12 on suspicion/backbiting).",
      "Treating digital privacy, copyright/citations, and focus time as trusts (Amanah).",
    ],
    madhhabNotes: [],
    scholarReferralNoticeAr:
      "هذه الضوابط مبنية على نصوص صريحة في الأمانة والصدق؛ استشر المرشد التربوي والشرعي عند إشكال التعاقدات.",
    scholarReferralNoticeEn:
      "Rooted in explicit Islamic principles of trustworthiness; seek scholar counsel for commercial licensing questions.",
    citation: {
      status: "verified",
      sourceBookAr: "سورة الحجرات (٦، ١٢) وصحيح مسلم (١٠٢)",
      sourceBookEn: "Quran 49:6,12 & Sahih Muslim #102",
      scholarOrAuthorAr: "القرآن والسنة الصحيحة",
      scholarOrAuthorEn: "Quran & Authentic Sunnah",
      referenceCode: "Muslim #102 / Quran 49:6",
      reviewedDate: REVIEW_DATE,
    },
  },
];

export const AQEEDAH_FOUNDATIONS_CATALOG: readonly AqeedahTopic[] = [
  {
    id: "aqeedah-islam-pillars",
    group: "pillars_islam",
    titleAr: "أركان الإسلام الخمسة",
    titleEn: "The Five Pillars of Islam",
    summaryAr: "الأساس العملي الظاهر الذي بُني عليه الإسلام كما في حديث ابن عمر وحديث جبريل.",
    summaryEn: "The five outward foundational acts of worship upon which Islam is structured.",
    corePointsAr: [
      "١. شهادة أن لا إله إلا الله وأن محمداً رسول الله",
      "٢. إقام الصلاة الخمس في أوقاتها",
      "٣. إيتاء الزكاة المفروضة",
      "٤. صوم شهر رمضان",
      "٥. حج بيت الله الحرام لمن استطاع إليه سبيلاً",
    ],
    corePointsEn: [
      "1. Testimony of Faith (Shahadah: None worthy of worship except Allah, Muhammad is His Messenger)",
      "2. Establishing the five daily Prayers",
      "3. Giving obligatory Zakah",
      "4. Fasting the month of Ramadan",
      "5. Hajj pilgrimage once in a lifetime for those physically and financially able",
    ],
    proofReferenceAr: "صحيح البخاري (٨) وصحيح مسلم (١٦)",
    proofReferenceEn: "Sahih al-Bukhari #8 & Sahih Muslim #16",
    citation: {
      status: "verified",
      sourceBookAr: "صحيح البخاري / مسلم",
      sourceBookEn: "Sahih al-Bukhari #8 / Sahih Muslim #16",
      scholarOrAuthorAr: "ابن عمر رضي الله عنهما",
      scholarOrAuthorEn: "Narrated by Ibn Umar (RA)",
      referenceCode: "Bukhari #8",
      hadithGrade: "Sahih",
      reviewedDate: REVIEW_DATE,
    },
  },
  {
    id: "aqeedah-iman-pillars",
    group: "pillars_iman",
    titleAr: "أركان الإيمان الستة",
    titleEn: "The Six Pillars of Faith (Iman)",
    summaryAr: "الإيمان القلبي اليقيني بالغيب وأصول العقيدة الإسلامية الجامعة.",
    summaryEn: "The six inward creedal articles of Islamic belief taught in the Hadith of Jibril.",
    corePointsAr: [
      "١. الإيمان بالله (ربوبيته وألوهيته وأسمائه وصفاته)",
      "٢. الإيمان بالملائكة الكرام",
      "٣. الإيمان بالكتب السماوية المنزلة وخاتمها القرآن",
      "٤. الإيمان بجميع الرسل والأنبياء دون تفريق",
      "٥. الإيمان باليوم الآخر والبعث والحساب",
      "٦. الإيمان بالقدر خيره وشره مع الأخذ بالأسباب",
    ],
    corePointsEn: [
      "1. Belief in Allah (His Lordship, exclusive right to worship, and His Names & Attributes)",
      "2. Belief in His Angels",
      "3. Belief in Revealed Scriptures culminating in the preserved Quran",
      "4. Belief in all Prophets and Messengers",
      "5. Belief in the Last Day and Accountability",
      "6. Belief in Divine Decree (Qadr) alongside sincere human responsibility & effort",
    ],
    proofReferenceAr: "صحيح مسلم (٨) — حديث جبريل عليه السلام (الأربعون النووية رقم ٢)",
    proofReferenceEn: "Sahih Muslim #8 (Hadith Jibril / Nawawi #2)",
    citation: {
      status: "verified",
      sourceBookAr: "صحيح مسلم (٨)",
      sourceBookEn: "Sahih Muslim #8",
      scholarOrAuthorAr: "الإمام مسلم",
      scholarOrAuthorEn: "Imam Muslim",
      referenceCode: "Muslim #8",
      hadithGrade: "Sahih",
      reviewedDate: REVIEW_DATE,
    },
  },
  {
    id: "aqeedah-ihsan-balance",
    group: "levels_of_deen",
    titleAr: "مرتبة الإحسان ومراقبة الله",
    titleEn: "Ihsan: Spiritual Excellence & Moral Integrity",
    summaryAr:
      "«الإحسان أن تعبد الله كأنك تراه، فإن لم تكن تراه فإنه يراك» — يربط الإتقان الداخلي بالسلوك الحسن.",
    summaryEn:
      '"Ihsan is to worship Allah as though you see Him; for though you see Him not, He sees you" — cultivating silent integrity.',
    corePointsAr: [
      "الإتقان في الدراسة والعمل في الخلوة والعلن.",
      "اجتناب الرياء والتفاخر بالطاعات والعبادات.",
      "الجمع بين الرجاء في رحمة الله والحياء من معصيته.",
    ],
    corePointsEn: [
      "Doing your finest work in study and service whether anyone watches or not.",
      "Guarding sincerity from showing off (Riyaa).",
      "Balancing hope in Allah's mercy with mindful reverence.",
    ],
    proofReferenceAr: "صحيح مسلم (٨) وسورة آل عمران (١٣٤)",
    proofReferenceEn: "Sahih Muslim #8 & Quran 3:134",
    citation: {
      status: "verified",
      sourceBookAr: "الأربعون النووية رقم ٢",
      sourceBookEn: "Forty Nawawi #2 (Muslim #8)",
      scholarOrAuthorAr: "الإمام النووي",
      scholarOrAuthorEn: "Imam An-Nawawi",
      referenceCode: "Nawawi #2",
      hadithGrade: "Sahih",
      reviewedDate: REVIEW_DATE,
    },
  },
];

export const SEERAH_AND_HISTORY_CATALOG: readonly SeerahAndHistoryEntry[] = [
  {
    id: "seerah-makkah-revelation",
    kind: "seerah_timeline",
    periodOrEraAr: "٥٧٠ – ٦٢٢ م (العهد المكي)",
    periodOrEraEn: "570 – 622 CE (Makkan Era)",
    titleAr: "النشأة، الصادق الأمين، ونزول الوحي في غار حراء",
    titleEn: "Trustworthy Character, First Revelation & Makkan Steadfastness",
    summaryAr:
      "عُرف النبي محمد ﷺ قبل النبوة بلقب «الصادق الأمين»، وتلقى أول آيات القرآن «اقرأ» في غار حراء، وصبر مع الصحابة ١٣ عاماً على الأذى في بناء العقيدة والرحمة.",
    summaryEn:
      "Known as Al-Sadiq Al-Amin (the Truthful, Trustworthy) before Prophethood; received the first revelation ('Iqra') in Cave Hira and spent 13 years nurturing faith and moral dignity in Makkah.",
    verifiedReferenceAr: "سورة العلق (١–٥)، صحيح البخاري (٣)، وسيرة ابن هشام",
    verifiedReferenceEn: "Surah Al-Alaq 96:1-5, Sahih al-Bukhari #3 & Classical Seerah",
    takeawayAr: "السبق بالأخلاق والأمانة كان تمهيداً لحمل رسالة الحق والصبر على البدايات الشاقة.",
    takeawayEn: "Integrity and patience laid the moral foundation years before public leadership.",
  },
  {
    id: "seerah-hijrah-madinah",
    kind: "seerah_timeline",
    periodOrEraAr: "١ هـ / ٦٢٢ م",
    periodOrEraEn: "1 AH / 622 CE",
    titleAr: "الهجرة إلى المدينة المنورة والمؤاخاة وصحيفة المدينة",
    titleEn: "The Hijrah, Brotherhood & Constitution of Madinah",
    summaryAr:
      "بدأت السنة الهجرية ببناء المسجد النبوي، والمؤاخاة بين المهاجرين والأنصار، ووضع وثيقة المدنية لتنظيم العدل والتعايش والأمن المشترك.",
    summaryEn:
      "Established the Prophet's Mosque as an educational & civic hub, forged brotherhood between Muhajirun and Ansar, and instituted the Charter of Madinah governing justice and mutual protection.",
    verifiedReferenceAr: "صحيح البخاري (٣٩٠٥–٣٩٣٩) والمصادر التاريخية المعتمدة",
    verifiedReferenceEn: "Sahih al-Bukhari & Historical Seerah Chronicles",
    takeawayAr: "المسجد والعدل الاجتماعي والتكافل أركان بناء أي مجتمع متماسك.",
    takeawayEn: "Community solidarity, fair agreements, and shared learning anchors civic trust.",
  },
  {
    id: "seerah-farewell-sermon",
    kind: "seerah_timeline",
    periodOrEraAr: "١٠ هـ / ٦٣٢ م",
    periodOrEraEn: "10 AH / 632 CE",
    titleAr: "فتح مكة وحجة الوداع",
    titleEn: "Peaceful Opening of Makkah & The Farewell Sermon",
    summaryAr:
      "عفا ﷺ عن أهل مكة قائلاً «اذهبوا فأنتم الطلقاء»، وأعلن في حجة الوداع حرمة الدماء والأموال والمساواة بين البشر بالتقوى والعمل الصالح.",
    summaryEn:
      "Granted broad amnesty upon Makkah's opening and delivered the Farewell Sermon affirming human dignity, equality irrespective of race, women's rights, and holding fast to the Quran.",
    verifiedReferenceAr: "صحيح مسلم (١٢١٨) وخطبة الوداع في البخاري",
    verifiedReferenceEn: "Sahih Muslim #1218 & Sahih al-Bukhari",
    takeawayAr: "النصر الحقيقي يتوج بالعفو والعدل والمسؤولية لا بالانتقام.",
    takeawayEn:
      "True leadership culminates in magnanimity, equality, and principled accountability.",
  },
  {
    id: "prophets-ibrahim-musa-isa",
    kind: "prophets_quran",
    periodOrEraAr: "أولو العزم من الرسل",
    periodOrEraEn: "Prophets of Steadfast Resolve (Quranic Narratives)",
    titleAr: "مسيرة التوحيد: نوح وإبراهيم وموسى وعيسى عليهم السلام",
    titleEn: "Shared Message of Tawheed: Nuh, Ibrahim, Musa & Isa (AS)",
    summaryAr:
      "يقص القرآن الكريم سير الأنبياء لتسلية المؤمنين وتعليم الصبر والشكر والحكمة؛ في نوح صبر الدعوة، وفي إبراهيم الحنيفية وبناء البيت، وفي موسى الشجاعة أمام الطغيان، وفي عيسى الرحمة والدعوة للحق.",
    summaryEn:
      "The Quran relates prophetic stories as lessons in perseverance and wisdom: Nuh's endurance, Ibrahim's hospitality and monotheism, Musa's courage against tyranny, and Isa's compassion and devotion.",
    verifiedReferenceAr: "سور هود، إبراهيم، طه، القصص، آل عمران، مريم",
    verifiedReferenceEn: "Quran Surahs 11, 14, 19, 20, 28 & 3",
    takeawayAr: "رسالة جميع الأنبياء واحدة في توحيد الله وإقامة العدل والرحمة.",
    takeawayEn:
      "All prophets carried one continuous ethical call to worship Allah alone and uphold justice.",
  },
  {
    id: "civ-science-scholarship",
    kind: "civilization",
    periodOrEraAr: "القرون ٣–٧ هـ / ٩–١٣ م",
    periodOrEraEn: "9th – 13th Centuries CE",
    titleAr: "إسهامات الحضارة الإسلامية في العلم والطب والرياضيات",
    titleEn: "Islamic Civilization: Science, Optics, Algebra & Hospitals",
    summaryAr:
      "انطلاقاً من الأمر القرآني بالتفكر في الكون، قدّم علماء المسلمين إضافات تاريخية موثقة: الحسن بن الهيثم في البصريات والمنهج التجريبي، ومحمد بن موسى الخوارزمي في الجبر والخوارزميات، والزهراوي في الجراحة، إلى جانب مؤسسات الأوقاف والمستشفيات التعليمية والجامعات كالقرويين بفاس.",
    summaryEn:
      "Inspired by Quranic calls to reflect on creation, scholars in Baghdad, Cordoba, Cairo, and Fez advanced documented science: Ibn al-Haytham in optics & experimental verification, Al-Khwarizmi in algebra & algorithms, Al-Zahrawi in surgical tools, and endowed teaching hospitals (Bimaristans).",
    verifiedReferenceAr:
      "تاريخ العلوم — المصادر التاريخية الموثقة (كتاب المناظر، المختصر في حساب الجبر)",
    verifiedReferenceEn:
      "Documented History of Science (Kitab al-Manazir, Al-Jabr, University of al-Qarawiyyin)",
    takeawayAr: "لا تعارض في الإسلام بين الإيمان الراسخ والبحث العلمي المنضبط النافع للبشرية.",
    takeawayEn: "Faith and disciplined empirical inquiry flourished together to serve humanity.",
  },
];

export const SEASONAL_AND_AKHLAQ_CATALOG: readonly SeasonalAndAkhlaqEntry[] = [
  {
    id: "ramadan-worship-guide",
    kind: "ramadan_seasonal",
    titleAr: "دليل شهر رمضان المبارك وليلة القدر",
    titleEn: "Ramadan Preparation & Laylatul Qadr Guide",
    descriptionAr:
      "تنظيم عبادة رمضان بتدرج واقعي دون إرهاق: تلاوة القرآن، القيام، الصدقة، وحفظ اللسان والعشر الأواخر.",
    descriptionEn:
      "Balanced Ramadan habits centered on Quran connection, calm night prayer (Qiyam), quiet charity, and seeking Laylatul Qadr in the final 10 odd nights.",
    practicalStepsAr: [
      "قراءة ورد قرآني ثابت يومياً مع الفهم والتدبر.",
      "تحري ليلة القدر في الوتر من العشر الأواخر ودعاء «اللهم إنك عفو تحب العفو فاعف عني» (الترمذي ٣٥١٣).",
      "الاعتناء بالسحور وتفطير الصائمين والرفق في المعاملة.",
    ],
    practicalStepsEn: [
      "Set a realistic daily Quran reading & Tafsir reflection pace.",
      "Seek Laylatul Qadr in the odd nights of the last 10 days with the verified dua from Jami' at-Tirmidhi #3513.",
      "Share meals, stay hydrated at Suhoor, and guard patience in daily interactions.",
    ],
    sourceNoteAr: "صحيح البخاري (٢٠١٧) وسنن الترمذي (٣٥١٣)",
    sourceNoteEn: "Sahih al-Bukhari #2017 & Tirmidhi #3513",
  },
  {
    id: "seasonal-eid-dhulhijjah-ashura",
    kind: "ramadan_seasonal",
    titleAr: "المواسم الفاضلة: عشر ذي الحجة والعيدان وعاشوراء",
    titleEn: "Blessed Seasons: First 10 Days of Dhul Hijjah, Eid & Ashura",
    descriptionAr:
      "اغتنام المواسم السنوية بتوازن: صيام يوم عرفة لغير الحاج، التكبير، الأضحية، صيام عاشوراء، وصلة الرحم في العيدين.",
    descriptionEn:
      "Navigating annual sacred milestones: Dhul Hijjah's first ten days, fasting Arafah (for non-pilgrims), Takbir, Eid joy & family ties, and Ashura.",
    practicalStepsAr: [
      "التكبير والعمل الصالح في عشر ذي الحجة (البخاري ٩٦٩).",
      "صيام يوم عرفة (مسلم ١١٦٢) لغير الحاج.",
      "إظهار الفرح المباح وصلة الرحم وإدخال السرور على الأهل يوم العيد.",
    ],
    practicalStepsEn: [
      "Multiply good deeds and Dhikr during the 1st–10th of Dhul Hijjah (Bukhari #969).",
      "Fast Day of Arafah (9th Dhul Hijjah) if not on Hajj (Muslim #1162).",
      "Honor Eid with prayer, joyful attire, charity before Eid prayer, and visiting relatives.",
    ],
    sourceNoteAr: "صحيح البخاري (٩٦٩) وصحيح مسلم (١١٦٢)",
    sourceNoteEn: "Sahih al-Bukhari #969 & Sahih Muslim #1162",
  },
  {
    id: "akhlaq-honesty-parents-patience",
    kind: "akhlaq",
    titleAr: "أخلاق الطالب المسلم: الصدق والأمانة وبر الوالدين وضبط الغضب",
    titleEn: "Core Character (Akhlaq): Truthfulness, Amanah, Parents & Self-Restraint",
    descriptionAr:
      "«إنما بعثت لأتمم صالح الأخلاق» — بناء الشخصية المتوازنة في الأسرة والمدرسة والمجتمع.",
    descriptionEn:
      '"I was sent only to perfect noble character" — translating worship into reliability, filial kindness, and emotional restraint.',
    practicalStepsAr: [
      "الصدق في القول والوعد والمواعيد (البخاري ٦٠٩٤).",
      "بر الوالدين واللطف معهما في الحديث والخدمة (الإسراء ٢٣).",
      "ضبط الغضب: «ليس الشديد بالصرعة، إنما الشديد الذي يملك نفسه عند الغضب» (البخاري ٦١١٤).",
    ],
    practicalStepsEn: [
      "Truthfulness & keeping promises even when inconvenient (Bukhari #6094).",
      "Respect, gentle speech, and active service to parents (Quran 17:23).",
      "Strength in anger management: pausing, changing posture, and cooling down before replying (Bukhari #6114).",
    ],
    sourceNoteAr: "صحيح البخاري (٦٠٩٤، ٦١١٤) وسورة الإسراء (٢٣)",
    sourceNoteEn: "Sahih al-Bukhari #6094, #6114 & Quran 17:23",
  },
];

export const ISLAMIC_LEARNING_PATHS: readonly IslamicLearningPath[] = [
  {
    id: "path-foundations",
    titleAr: "مسار الأساسيات وبداية التعلم الميسّر",
    titleEn: "Foundations & New Learner Track",
    audienceAr: "للمبتدئين والطلاب لبناء تصور واضح ومتوازن",
    audienceEn: "Structured clear overview for students and newcomers",
    steps: [
      {
        id: "pf-1",
        titleAr: "فهم أركان الإسلام والإيمان والإحسان",
        titleEn: "Study Islam, Iman & Ihsan",
        recommendedTab: "knowledge",
      },
      {
        id: "pf-2",
        titleAr: "قراءة الفاتحة وأذكار الصباح والمساء",
        titleEn: "Explore Al-Fatihah & Daily Adhkar",
        recommendedTab: "adhkar",
      },
      {
        id: "pf-3",
        titleAr: "تعلم شروط الصلاة وفرائض الوضوء",
        titleEn: "Review Wudu & Prayer Essentials",
        recommendedTab: "knowledge",
      },
      {
        id: "pf-4",
        titleAr: "اختبار التثبيت السريع",
        titleEn: "Complete Foundations Check",
        recommendedTab: "knowledge",
      },
    ],
  },
  {
    id: "path-quran-tajweed",
    titleAr: "مسار إتقان التلاوة والتجويد والتفسير",
    titleEn: "Quran Reading, Tajweed & Tafsir Fluency Path",
    audienceAr: "لتطوير التلاوة الصحيحة والفهم المتدبر",
    audienceEn: "Improving recitation accuracy alongside classic Tafsir",
    steps: [
      {
        id: "pq-1",
        titleAr: "درس النون الساكنة والتنوين + الاستماع للحصري",
        titleEn: "Noon Sakinah + Listen to Al-Husary",
        recommendedTab: "learning",
      },
      {
        id: "pq-2",
        titleAr: "درس الميم الساكنة والقلقلة والمدود",
        titleEn: "Meem Sakinah, Qalqalah & Madd Rules",
        recommendedTab: "learning",
      },
      {
        id: "pq-3",
        titleAr: "قراءة تفسير السور المختارة (الفاتحة، الكهف، الملك)",
        titleEn: "Read Verified Tafsir Layers",
        recommendedTab: "tafsir",
      },
      {
        id: "pq-4",
        titleAr: "اختبار التجويد والتفسير",
        titleEn: "Pass Tajweed Mastery Quiz",
        recommendedTab: "knowledge",
      },
    ],
  },
  {
    id: "path-seerah-character",
    titleAr: "مسار السيرة النبوية والحديث والأخلاق",
    titleEn: "Prophetic Character, Nawawi Hadith & Seerah Path",
    audienceAr: "لبناء الأخلاق العملية والقدوة النبوية",
    audienceEn: "Building everyday ethical character from Seerah & Sunnah",
    steps: [
      {
        id: "ps-1",
        titleAr: "قراءة خط زمني للسيرة النبوية والحضارة الإسلامية",
        titleEn: "Explore Seerah & Civilization Timeline",
        recommendedTab: "knowledge",
      },
      {
        id: "ps-2",
        titleAr: "دراسة ٥ أحاديث من الأربعين النووية",
        titleEn: "Study 5 Forty Nawawi Hadith",
        recommendedTab: "hadith",
      },
      {
        id: "ps-3",
        titleAr: "تطبيق سنن اللسان والرحمة والأمانة الرقمية",
        titleEn: "Practice Speech & Digital Ethics",
        recommendedTab: "knowledge",
      },
    ],
  },
];

export const ISLAMIC_KNOWLEDGE_QUIZZES: readonly IslamicQuizQuestion[] = [
  {
    id: "quiz-tajweed-1",
    domain: "tajweed",
    questionAr: "أي مجموعة تمثل حروف الإظهار الحلقي الستة عند التقاء النون الساكنة؟",
    questionEn:
      "Which 6 throat letters cause Izhar Halqi (clear pronunciation) after Noon Sakinah?",
    optionsAr: ["ء، هـ، ع، ح، غ، خ", "ي، ر، م، ل، و، ن", "ق، ط، ب، ج، د", "خ، ص، ض، غ، ط، ق، ظ"],
    optionsEn: [
      "ء، هـ، ع، ح، غ، خ (Al-Halq throat letters)",
      "ي، ر، م، ل، و، ن (Yarmalun)",
      "ق، ط، ب، ج، د (Qutb Jadd)",
      "خ، ص، ض، غ، ط، ق، ظ (Elevation letters)",
    ],
    correctIndex: 0,
    explanationAr:
      "تظهر النون الساكنة بوضوح عند حروف الحلق الستة: الهمزة والهاء والعين والحاء والغين والخاء.",
    explanationEn:
      "Noon Sakinah is pronounced clearly before the six throat letters: ء، هـ، ع، ح، غ، خ.",
    sourceRef: "Tuhfat al-Atfal #6-8",
  },
  {
    id: "quiz-tajweed-2",
    domain: "tajweed",
    questionAr: "ما الحكم إذا جاءت ميم ساكنة وبعدها حرف الواو كما في «عَلَيْهِمْ وَلَا»؟",
    questionEn:
      "What is the Tajweed rule when Meem Sakinah is followed by Waaw (و) as in «عَلَيْهِمْ وَلَا»?",
    optionsAr: [
      "إظهار شفوي قوي دون غنة زائدة",
      "إخفاء شفوي بمقدار حركتين",
      "إدغام مثلين صغير",
      "إقلاب",
    ],
    optionsEn: [
      "Strict Izhar Shafawi (clear pronunciation without extra nasalization)",
      "Labial Ikhfa (2 counts)",
      "Labial Idgham",
      "Iqlab",
    ],
    correctIndex: 0,
    explanationAr:
      "تظهر الميم الساكنة إظهاراً شفوياً عند جميع الحروف عدا الباء والميم، ويُحذّر من إخفائها عند الواو والفاء لاتحاد المخرج.",
    explanationEn: "Meem Sakinah is always pronounced clearly (Izhar Shafawi) before Waaw and Fa.",
    sourceRef: "Tuhfat al-Atfal #22-23",
  },
  {
    id: "quiz-fiqh-1",
    domain: "fiqh",
    questionAr:
      "ما الفارق المنهجي الصحيح في التعامل مع القضايا الفقهية الشخصية المعقدة في المركز الإسلامي؟",
    questionEn: "How does BTC handle personal complex religious rulings (Fatwas)?",
    optionsAr: [
      "المركز مرجع تعليمي للمعلومات العامة ويحيل المسائل الشخصية لأهل العلم والفتوى المختصين",
      "يصدر الذكاء الاصطناعي فتوى ملزمة شخصية فوراً",
      "يلزم جميع الطلاب بمذهب فقهي واحد ويمنع عرض الخلاف المعتبر",
      "يتجاهل مصادر المذاهب الأربعة",
    ],
    optionsEn: [
      "Presents verified educational Fiqh overview & directs personal cases to qualified human scholars",
      "Issues automated AI personal Fatwas",
      "Enforces a single school and omits valid Ikhtilaf",
      "Ignores classical sources",
    ],
    correctIndex: 0,
    explanationAr:
      "الدراسة الفقهية الميسرة تعرض الأصول المتفق عليها وأقوال المذاهب المعتبرة، بينما الفتوى الشخصية تقتضي سؤالا مباشراً لعالم مؤهل.",
    explanationEn:
      "BTC provides structured educational Fiqh summaries and never acts as an automated Mufti.",
    sourceRef: "BTC Scholarly Safeguard Policy",
  },
  {
    id: "quiz-aqeedah-1",
    domain: "aqeedah",
    questionAr: "أي حديث صحيح جمع بيان مراتب الدين الثلاث (الإسلام والإيمان والإحسان)؟",
    questionEn: "Which authentic Hadith defines Islam, Iman, and Ihsan together?",
    optionsAr: [
      "حديث جبريل عليه السلام (صحيح مسلم رقم ٨ / الأربعون النووية ٢)",
      "حديث النية فقط",
      "أثر غير مسند",
      "مقولة أدبية حديثة",
    ],
    optionsEn: [
      "Hadith of Jibril (Sahih Muslim #8 / Forty Nawawi #2)",
      "Hadith on Siwak alone",
      "Unverified proverb",
      "Modern essay",
    ],
    correctIndex: 0,
    explanationAr:
      "حديث عمر بن الخطاب في سؤال جبريل للنبي ﷺ عن الإسلام والإيمان والإحسان، رواه مسلم.",
    explanationEn:
      "Umar ibn al-Khattab's narration in Sahih Muslim #8 (Nawawi #2) outlines Islam, Iman, and Ihsan.",
    sourceRef: "Sahih Muslim #8",
  },
  {
    id: "quiz-seerah-1",
    domain: "seerah",
    questionAr: "في أي عام هاجر النبي ﷺ إلى المدينة المنورة وأرسي أسس المؤاخاة والوثيقة؟",
    questionEn:
      "Which milestone inaugurated the Islamic Hijri calendar alongside establishing community brotherhood in Madinah?",
    optionsAr: [
      "١ هـ / ٦٢٢ م — الهجرة النبوية الشريفة",
      "١٠ هـ — حجة الوداع",
      "٨ هـ — فتح مكة",
      "قبل البعثة بعشر سنوات",
    ],
    optionsEn: [
      "1 AH / 622 CE — The Hijrah to Madinah",
      "10 AH — Farewell Pilgrimage",
      "8 AH — Opening of Makkah",
      "Ten years before Revelation",
    ],
    correctIndex: 0,
    explanationAr:
      "كانت الهجرة إلى المدينة (٦٢٢م / ١هـ) نقطة التحول التي أنشئت فيها الدولة المدنية والوثيقة والمؤاخاة.",
    explanationEn:
      "The Hijrah in 622 CE (1 AH) marked the founding of the Madinan community and Charter.",
    sourceRef: "Sahih al-Bukhari / Seerah Chronicles",
  },
  {
    id: "quiz-hadith-1",
    domain: "hadith",
    questionAr: "ما الحكم الشرعي للبدء بإلقاء السلام على الآخرين مقارنة برد السلام؟",
    questionEn:
      "How do scholars distinguish initiating Salam vs returning someone's Salam greeting?",
    optionsAr: [
      "البدء بالسلام سنة مستحبة مؤكدة، بينما رده واجب",
      "كلاهما مكروه",
      "البدء فرض عين والرد اختياري",
      "لا أصل للسلام في صحيح مسلم",
    ],
    optionsEn: [
      "Initiating Salam is a recommended Sunnah; returning a greeting is obligatory (Wajib)",
      "Both are discouraged",
      "Initiating is obligatory while returning is optional",
      "No Hadith mentions Salam",
    ],
    correctIndex: 0,
    explanationAr:
      "يميز العلماء بين المندوب والواجب: إلقاء السلام سنة عظيمة ثابتة في صحيح مسلم (٥٤)، ورده واجب لقوله تعالى في سورة النساء (٨٦).",
    explanationEn:
      "Initiating Salam is a cherished Sunnah (Muslim #54) while returning it is obligatory (Quran 4:86).",
    sourceRef: "Sahih Muslim #54 & Quran 4:86",
  },
];
