/**
 * Verified Classical Tafsir API Client & Surah Educational Overviews
 *
 * Strictly separates 4 layers:
 * 1) Authentic Quran Verse (Uthmani Script)
 * 2) Verified Translation
 * 3) Classical Tafsir text fetched verbatim from Quran.com API v4
 * 4) Educational Study Overview (explicitly marked as non-scripture study summary)
 */

export interface VerifiedTafsirEdition {
  id: number;
  nameAr: string;
  nameEn: string;
  authorAr: string;
  authorEn: string;
  languageCode: "ar" | "en";
  languageLabel: string;
  editionNoteEn: string;
  editionNoteAr: string;
}

export interface FetchedVerseTafsir {
  tafsirId: number;
  verseKey: string;
  textHtmlRemoved: string;
  sourceName: string;
  authorName: string;
  languageCode: "ar" | "en";
}

export interface SurahStudyGuideTheme {
  surahId: number;
  surahNameAr: string;
  surahNameEn: string;
  revelationPeriodAr: string;
  revelationPeriodEn: string;
  coreThemesAr: string[];
  coreThemesEn: string[];
  studyReflectionPromptAr: string;
  studyReflectionPromptEn: string;
  tafsirReferenceNoteAr: string;
  tafsirReferenceNoteEn: string;
}

export const VERIFIED_TAFSIR_EDITIONS: readonly VerifiedTafsirEdition[] = [
  {
    id: 16,
    nameAr: "التفسير الميسر",
    nameEn: "Tafsir Al-Muyassar",
    authorAr: "مجمع الملك فهد لطباعة المصحف الشريف",
    authorEn: "King Fahd Complex Scholars Committee",
    languageCode: "ar",
    languageLabel: "العربية",
    editionNoteAr: "تفسير ميسر واضح المعاني للطلاب والقراء المعاصرين",
    editionNoteEn: "Concise, clear classical Arabic commentary published by King Fahd Complex",
  },
  {
    id: 91,
    nameAr: "تفسير السعدي (تيسير الكريم الرحمن)",
    nameEn: "Tafsir Al-Sa'di",
    authorAr: "الشيخ عبد الرحمن بن ناصر السعدي",
    authorEn: "Shaykh Abdurrahman Al-Sa'di",
    languageCode: "ar",
    languageLabel: "العربية",
    editionNoteAr: "يركز على مقاصد الآيات وفوائدها التربوية والإيمانية",
    editionNoteEn: "Renowned accessible Arabic tafsir emphasizing spiritual and practical lessons",
  },
  {
    id: 14,
    nameAr: "تفسير ابن كثير",
    nameEn: "Tafsir Ibn Kathir (Arabic)",
    authorAr: "الحافظ عماد الدين إسماعيل بن كثير",
    authorEn: "Imam Hafiz Ibn Kathir",
    languageCode: "ar",
    languageLabel: "العربية",
    editionNoteAr: "أشهر كتب التفسير بالمأثور (تفسير القرآن بالقرآن والسنة)",
    editionNoteEn: "Classic narration-based Tafsir linking Quran, Sunnah, and Companion reports",
  },
  {
    id: 15,
    nameAr: "تفسير الطبري (جامع البيان)",
    nameEn: "Tafsir Al-Tabari",
    authorAr: "الإمام محمد بن جرير الطبري",
    authorEn: "Imam Muhammad ibn Jarir al-Tabari",
    languageCode: "ar",
    languageLabel: "العربية",
    editionNoteAr: "أصل من أصول التفسير اللغوي والأثري عند أهل العلم",
    editionNoteEn: "Foundational classical encyclopedic commentary on linguistic & early reports",
  },
  {
    id: 90,
    nameAr: "تفسير القرطبي (الجامع لأحكام القرآن)",
    nameEn: "Tafsir Al-Qurtubi",
    authorAr: "الإمام شمس الدين القرطبي",
    authorEn: "Imam Al-Qurtubi",
    languageCode: "ar",
    languageLabel: "العربية",
    editionNoteAr: "يركز على استنباط الأحكام الفقهية والأدبية من الآيات",
    editionNoteEn: "Classical commentary noted for jurisprudence, ethics, and Arabic eloquence",
  },
  {
    id: 169,
    nameAr: "تفسير ابن كثير (مختصر بالإنجليزية)",
    nameEn: "Tafsir Ibn Kathir (Abridged — English)",
    authorAr: "الحافظ ابن كثير (ترجمة دار السلام)",
    authorEn: "Ibn Kathir (Darussalam English Edition)",
    languageCode: "en",
    languageLabel: "English",
    editionNoteAr: "الترجمة الإنجليزية المختصرة المعتمدة لتفسير ابن كثير",
    editionNoteEn: "Verified English abridged translation via Quran.com API v4",
  },
  {
    id: 168,
    nameAr: "معارف القرآن (بالإنجليزية)",
    nameEn: "Ma'arif al-Qur'an (English)",
    authorAr: "المفتي محمد شفيع العثماني",
    authorEn: "Mufti Muhammad Shafi",
    languageCode: "en",
    languageLabel: "English",
    editionNoteAr: "تفسير شامل بالإنجليزية يربط الفهم بالتطبيق والأحكام",
    editionNoteEn: "Comprehensive 20th-century English commentary with contextual notes",
  },
] as const;

export const OFFLINE_SURAH_STUDY_GUIDES: readonly SurahStudyGuideTheme[] = [
  {
    surahId: 1,
    surahNameAr: "الفاتحة",
    surahNameEn: "Al-Fatihah",
    revelationPeriodAr: "مكية — ٧ آيات",
    revelationPeriodEn: "Makkan — 7 Verses",
    coreThemesAr: [
      "توحيد الله في الربوبية والألوهية والأسماء والصفات",
      "العبودية الخالصة والاستعانة بالله وحده",
      "الدعاء بالهداية إلى الصراط المستقيم في كل ركعة",
    ],
    coreThemesEn: [
      "Praise and recognition of Allah as Rabb of all worlds and Master of Judgment",
      "Exclusive worship and seeking aid from Allah alone (1:5)",
      "Daily supplication for steadfast guidance on the Straight Path",
    ],
    studyReflectionPromptAr:
      "تأمل كيف يجمع المؤمن بين الثناء على الله ثم سؤال الهداية في صلاته كل يوم.",
    studyReflectionPromptEn:
      "Reflect on how daily prayer joins praise of Allah with sincere requests for guidance.",
    tafsirReferenceNoteAr:
      "راجع تفسير السعدي وابن كثير في بيان فضائل أم الكتاب (صحيح البخاري ٤٤٧٤).",
    tafsirReferenceNoteEn:
      "Cross-reference Ibn Kathir & Al-Sa'di alongside Sahih al-Bukhari (4474).",
  },
  {
    surahId: 2,
    surahNameAr: "البقرة",
    surahNameEn: "Al-Baqarah",
    revelationPeriodAr: "مدنية — ٢٨٦ آية",
    revelationPeriodEn: "Madinan — 286 Verses",
    coreThemesAr: [
      "أصناف الناس أمام الهداية: المؤمنون، الكافرون، المنافقون",
      "استخلاف الإنسان وبناء المجتمع المسلم والتشريعات",
      "آية الكرسي (٢٥٥) وخواتيم البقرة في التوحيد والتوكل",
    ],
    coreThemesEn: [
      "Human responses to revelation and building the Madinan moral community",
      "Social, financial, and worship foundations including charity & integrity",
      "Ayat al-Kursi (2:255) and the closing verses of responsibility and supplication",
    ],
    studyReflectionPromptAr:
      "كيف توازن سورة البقرة بين تصحيح العقيدة وبناء العدل والتكافل في المجتمع؟",
    studyReflectionPromptEn:
      "How does Surah Al-Baqarah unite inward faith with social ethics and trust in Allah?",
    tafsirReferenceNoteAr: "المصدر: التفسير الميسر وتفسير ابن كثير لأول سورة نزلت في المدينة.",
    tafsirReferenceNoteEn: "Verified overview anchored in Tafsir Ibn Kathir & Al-Muyassar.",
  },
  {
    surahId: 18,
    surahNameAr: "الكهف",
    surahNameEn: "Al-Kahf",
    revelationPeriodAr: "مكية — ١١٠ آيات",
    revelationPeriodEn: "Makkan — 110 Verses",
    coreThemesAr: [
      "أربع قصص كبرى تعالج فتن الدين والمال والعلم والسلطان",
      "أصحاب الكهف: الثبات على العقيدة والاعتزال عند الفتنة",
      "قصة موسى والخضر: تواضع العالم وأدب طلب العلم",
    ],
    coreThemesEn: [
      "Four foundational parables addressing trials of faith, wealth, knowledge, and power",
      "People of the Cave: principled courage and reliance on Allah's mercy",
      "Prophet Musa and Al-Khidr: intellectual humility in seeking knowledge",
    ],
    studyReflectionPromptAr:
      "ما الدروس العملية للطالب من رحلة موسى عليه السلام في الصبر على طلب العلم؟",
    studyReflectionPromptEn:
      "What habits of patience and humility can students apply from Prophet Musa's journey?",
    tafsirReferenceNoteAr:
      "سنّتها يوم الجمعة ثابتة في صحيح مسلم (٨٥٤ / ٨٠٩)؛ يُقرأ التفسير عبر الميسر وابن كثير.",
    tafsirReferenceNoteEn:
      "Virtue of Friday recitation reported in Sahih Muslim; commentary via Ibn Kathir.",
  },
  {
    surahId: 36,
    surahNameAr: "يس",
    surahNameEn: "Ya-Sin",
    revelationPeriodAr: "مكية — ٨٣ آية",
    revelationPeriodEn: "Makkan — 83 Verses",
    coreThemesAr: [
      "صدق الرسالة والوحي القرآني الحكيم",
      "قصة أصحاب القرية والناصح الصادق (حبيب النجار)",
      "آيات الله الكونية في الليل والنهار والشمس والقمر والبعث",
    ],
    coreThemesEn: [
      "Affirmation of revelation and the wisdom of the Quran",
      "Moral courage of the sincere believer calling his people to truth",
      "Signs in creation (night, day, sun, moon) pointing to resurrection",
    ],
    studyReflectionPromptAr: "ما وجه الترابط بين التفكر في آيات الكون واليقين بالبعث والحساب؟",
    studyReflectionPromptEn:
      "How does observing cosmic order cultivate accountability and gratitude?",
    tafsirReferenceNoteAr: "المصدر: التفسير الميسر وتفسير السعدي.",
    tafsirReferenceNoteEn: "Source: Tafsir Al-Muyassar & Tafsir Al-Sa'di.",
  },
  {
    surahId: 67,
    surahNameAr: "الملك",
    surahNameEn: "Al-Mulk",
    revelationPeriodAr: "مكية — ٣٠ آية",
    revelationPeriodEn: "Makkan — 30 Verses",
    coreThemesAr: [
      "ملك الله المطلق وإتقان خلق السماوات السبع بلا تفاوت",
      "حكمة الحياة والموت في اختبار أحسن الناس عملاً",
      "توكل العبد وخشية الله بالغيب",
    ],
    coreThemesEn: [
      "Allah's absolute sovereignty and flawless design of the seven heavens",
      "Purpose of life and death as a test of excellence in righteous action (67:2)",
      "Quiet reverence and reliance upon the Sustainer",
    ],
    studyReflectionPromptAr:
      "تأمل قوله تعالى «ليبلوكم أيكم أحسن عملاً» — الجودة والإتقان قبل الكثرة.",
    studyReflectionPromptEn:
      "Reflect on 67:2 ('which of you is best in deed') — quality and sincerity over quantity.",
    tafsirReferenceNoteAr: "المصدر: الترمذي وحسّنه، وتفسير ابن كثير والسعدي.",
    tafsirReferenceNoteEn: "Source: Ibn Kathir & Al-Sa'di.",
  },
  {
    surahId: 112,
    surahNameAr: "الإخلاص",
    surahNameEn: "Al-Ikhlas",
    revelationPeriodAr: "مكية — ٤ آيات",
    revelationPeriodEn: "Makkan — 4 Verses",
    coreThemesAr: [
      "تجريد التوحيد الخالص لله الأحد الصمد",
      "نفي المثل والند والشريك والولد عن الله سبحانه",
      "تعديل ثلث القرآن في موضوع التوحيد وأسماء الله وصفاته",
    ],
    coreThemesEn: [
      "Pure declaration of Allah's absolute Oneness (Al-Ahad) and Self-Sufficiency (As-Samad)",
      "Transcendence beyond human lineage, likeness, or partnership",
      "Described in Sahih Muslim as equaling one-third of the Quran in meaning",
    ],
    studyReflectionPromptAr: "لماذا سميت سورة الإخلاص بهذا الاسم وهي تعالج خلوص التوحيد في القلب؟",
    studyReflectionPromptEn:
      "Why does pure Tawheed purify human intention from seeking creation's approval?",
    tafsirReferenceNoteAr: "صحيح البخاري (٥٠١٣) وصحيح مسلم (٨١١) في فضلها؛ وتفسير السعدي.",
    tafsirReferenceNoteEn: "Reported in Sahih al-Bukhari (5013) & Sahih Muslim (811).",
  },
] as const;

const tafsirCache = new Map<string, FetchedVerseTafsir>();

export function stripHtmlSafely(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<sup[^>]*>.*?<\/sup>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function fetchVerseTafsirFromQuranCom(
  tafsirId: number,
  surahId: number,
  ayahNumber: number,
): Promise<FetchedVerseTafsir> {
  const edition =
    VERIFIED_TAFSIR_EDITIONS.find((e) => e.id === tafsirId) ?? VERIFIED_TAFSIR_EDITIONS[0]!;
  const safeSurah = Math.max(1, Math.min(114, Math.round(surahId)));
  const safeAyah = Math.max(1, Math.round(ayahNumber));
  const verseKey = `${safeSurah}:${safeAyah}`;
  const cacheKey = `${edition.id}:${verseKey}`;

  const cached = tafsirCache.get(cacheKey);
  if (cached) return cached;

  const url = `https://api.quran.com/api/v4/tafsirs/${edition.id}/by_ayah/${verseKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Tafsir API returned status ${res.status}`);
  }
  const json = (await res.json()) as {
    tafsir?: {
      resource_id?: number;
      resource_name?: string;
      text?: string;
    };
  };
  const rawText = json.tafsir?.text ?? "";
  if (!rawText.trim()) {
    throw new Error("Tafsir entry is empty for this verse in the selected edition.");
  }

  const clean: FetchedVerseTafsir = {
    tafsirId: edition.id,
    verseKey,
    textHtmlRemoved: stripHtmlSafely(rawText),
    sourceName: json.tafsir?.resource_name || edition.nameEn,
    authorName: edition.authorEn,
    languageCode: edition.languageCode,
  };
  tafsirCache.set(cacheKey, clean);
  return clean;
}

export function getOfflineSurahStudyGuide(surahId: number): SurahStudyGuideTheme | null {
  return OFFLINE_SURAH_STUDY_GUIDES.find((g) => g.surahId === surahId) ?? null;
}
