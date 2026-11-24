/**
 * Global Verified Quran Reciters Directory & Country Classification Engine
 *
 * Epistemic & Audio Authenticity Guarantees:
 * - Zero synthetic AI recitations or voice cloning.
 * - Strictly human recordings from verified archives (MP3Quran.net v3 API, QuranicAudio.com).
 * - Separates Nationality, Birthplace, Residence, and Associated Country honestly.
 *   Never guesses nationality when unverified; uses neutral "Associated country" phrasing.
 * - Supports ONE RECITER -> ONE SURAH -> MULTIPLE RECORDINGS data model.
 * - Supports partial mushaf collections honestly using exact verified surah_list arrays.
 */

export type GlobalCountryCode =
  | "SA"
  | "EG"
  | "KW"
  | "JO"
  | "PS"
  | "QA"
  | "AE"
  | "OM"
  | "YE"
  | "SY"
  | "IQ"
  | "MA"
  | "DZ"
  | "TN"
  | "LY"
  | "SD"
  | "SO"
  | "ML"
  | "ID"
  | "MY"
  | "IN"
  | "UZ"
  | "US";

export interface ReciterCountryMeta {
  code: GlobalCountryCode;
  nameEn: string;
  nameAr: string;
  flagEmoji: string;
  regionEn: string;
  regionAr: string;
  descriptionEn: string;
  descriptionAr: string;
}

export interface CountryAssociation {
  primaryCountryCode: GlobalCountryCode;
  nationalityAr: string | null;
  nationalityEn: string | null;
  birthplaceAr: string | null;
  birthplaceEn: string | null;
  residenceCountryAr: string | null;
  residenceCountryEn: string | null;
  associatedCountryAr: string;
  associatedCountryEn: string;
  classificationNoteAr: string;
  classificationNoteEn: string;
}

export type RecordingStyle = "Murattal" | "Mujawwad" | "Muallim" | "Archive";

export interface SurahRecordingHighlight {
  verseRange: string;
  verseArabicExcerpt: string;
  noteAr: string;
  noteEn: string;
}

export interface VerifiedRecordingEdition {
  recordingId: string;
  reciterId: string;
  collectionTitleAr: string;
  collectionTitleEn: string;
  riwayahAr: string;
  riwayahEn: string;
  style: RecordingStyle;
  sourceName: string;
  sourceUrl: string;
  serverBaseUrl: string;
  audioFormat?: "mp3" | "m4a";
  customSurahUrls?: Readonly<Record<number, string>>;
  availableSurahIds: readonly number[] | "all";
  qualityNoteAr: string | null;
  qualityNoteEn: string | null;
  addedDate: string | null;
  verifiedDate?: string | null;
  occasionAr?: string | null;
  occasionEn?: string | null;
  audioQualityLabel?: string | null;
  availabilityStatus?: "verified" | "partial" | "unavailable";
  rightsStatusAr?: string;
  rightsStatusEn?: string;
  surahDurationsSeconds?: Readonly<Record<number, number>>;
  surahHighlights?: Readonly<Record<number, SurahRecordingHighlight>>;
  attributionAr: string;
  attributionEn: string;
  licenseNoteEn: string;
  licenseNoteAr: string;
}

export interface FeaturedPassageRef {
  id: string;
  surahId: number;
  verseRange: string;
  verseArabicExcerpt: string;
  titleAr: string;
  titleEn: string;
  noteAr: string;
  noteEn: string;
  preferredRecordingId?: string;
}

export interface VerifiedReciterProfile {
  id: string;
  mp3QuranId: number | null;
  qdcId: number | null;
  nameEn: string;
  nameAr: string;
  titleEn: string;
  titleAr: string;
  bioEn: string;
  bioAr: string;
  countryCode: GlobalCountryCode;
  countryAssociation: CountryAssociation;
  style: "Murattal" | "Mujawwad";
  primaryRiwayahAr: string;
  primaryRiwayahEn: string;
  isFeatured: boolean;
  selectionBasisEn?: string;
  selectionBasisAr?: string;
  serverBaseUrl: string;
  recordings: readonly VerifiedRecordingEdition[];
  featuredPassages?: readonly FeaturedPassageRef[];
  specialEmphasis?: {
    surahId: number;
    surahNameAr: string;
    surahNameEn: string;
    noteAr: string;
    noteEn: string;
    audioUrl: string;
  };
}

export interface DirectoryExpansionStatusItem {
  code: string;
  nameEn: string;
  nameAr: string;
  flagEmoji: string;
  status: "verified" | "pending_verification";
  reasonEn: string;
  reasonAr: string;
}

export interface DirectoryFavoriteAndHistoryState {
  favoriteReciterIds: string[];
  favoriteRecordingKeys: string[]; // `${reciterId}:${recordingId}:${surahId}`
  listeningHistory: Array<{
    reciterId: string;
    recordingId: string;
    surahId: number;
    playedAt: string;
    positionSeconds: number;
  }>;
}

const ALL_114 = "all" as const;

export const GLOBAL_COUNTRIES_META: readonly ReciterCountryMeta[] = [
  {
    code: "SA",
    nameEn: "Saudi Arabia",
    nameAr: "المملكة العربية السعودية",
    flagEmoji: "🇸🇦",
    regionEn: "Arabian Peninsula",
    regionAr: "الجزيرة العربية",
    descriptionEn: "Imams of the Two Holy Mosques and renowned Saudi reciters",
    descriptionAr: "أئمة الحرمين الشريفين ونخبة قرّاء المملكة العربية السعودية",
  },
  {
    code: "EG",
    nameEn: "Egypt",
    nameAr: "مصر",
    flagEmoji: "🇪🇬",
    regionEn: "North Africa & Nile Valley",
    regionAr: "وادي النيل وشمال أفريقيا",
    descriptionEn: "Masters of the Golden Age of Egyptian Murattal & Mujawwad recitation",
    descriptionAr: "أعلام الرعيل الذهبي للمدرسة المصرية في الترتيل والتجويد",
  },
  {
    code: "KW",
    nameEn: "Kuwait",
    nameAr: "الكويت",
    flagEmoji: "🇰🇼",
    regionEn: "Arabian Peninsula",
    regionAr: "الخليج العربي",
    descriptionEn: "Distinguished reciters and Imams of the Grand Mosque of Kuwait",
    descriptionAr: "قرّاء المسجد الكبير وأئمة التلاوة المعتمدون في دولة الكويت",
  },
  {
    code: "JO",
    nameEn: "Jordan",
    nameAr: "الأردن",
    flagEmoji: "🇯🇴",
    regionEn: "Levant",
    regionAr: "بلاد الشام",
    descriptionEn: "Verified Jordanian reciters with full Quran recordings",
    descriptionAr: "قرّاء المملكة الأردنية الهاشمية ذوو المصاحف المسجلة الموثقة",
  },
  {
    code: "PS",
    nameEn: "Palestine",
    nameAr: "فلسطين",
    flagEmoji: "🇵🇸",
    regionEn: "Levant",
    regionAr: "بلاد الشام",
    descriptionEn: "Reciters of Al-Aqsa and historic Palestinian Quran schools",
    descriptionAr: "قرّاء المسجد الأقصى والمدرسة القرآنية الفلسطينية العريقة",
  },
  {
    code: "QA",
    nameEn: "Qatar",
    nameAr: "قطر",
    flagEmoji: "🇶🇦",
    regionEn: "Arabian Peninsula",
    regionAr: "الخليج العربي",
    descriptionEn: "Verified Qatari reciters with complete studio recordings",
    descriptionAr: "قرّاء دولة قطر ذوو المصاحف الكاملة الموثقة",
  },
  {
    code: "AE",
    nameEn: "United Arab Emirates",
    nameAr: "الإمارات العربية المتحدة",
    flagEmoji: "🇦🇪",
    regionEn: "Arabian Peninsula",
    regionAr: "الخليج العربي",
    descriptionEn: "Verified Emirati reciters renowned for serene Tajweed",
    descriptionAr: "قرّاء دولة الإمارات العربية المتحدة المعروفون بالإتقان والهدوء",
  },
  {
    code: "OM",
    nameEn: "Oman",
    nameAr: "سلطنة عُمان",
    flagEmoji: "🇴🇲",
    regionEn: "Arabian Peninsula",
    regionAr: "الخليج العربي",
    descriptionEn: "Verified Omani Quran reciters with authentic audio streams",
    descriptionAr: "قرّاء سلطنة عُمان بالتلاوات الصوتية الموثقة",
  },
  {
    code: "YE",
    nameEn: "Yemen",
    nameAr: "اليمن",
    flagEmoji: "🇾🇪",
    regionEn: "Arabian Peninsula",
    regionAr: "شبه الجزيرة العربية",
    descriptionEn: "Renowned Yemeni reciters celebrated across the Muslim world",
    descriptionAr: "أبرز قرّاء اليمن المتميزين بوضوح الأداء وخشوع التلاوة",
  },
  {
    code: "SY",
    nameEn: "Syria",
    nameAr: "سوريا",
    flagEmoji: "🇸🇾",
    regionEn: "Levant",
    regionAr: "بلاد الشام",
    descriptionEn: "Damascene scholars of Tajweed, Ijazah, and clear recitation",
    descriptionAr: "شيوخ الإقراء والمدرسة الشامية في التجويد والترتيل",
  },
  {
    code: "IQ",
    nameEn: "Iraq",
    nameAr: "العراق",
    flagEmoji: "🇮🇶",
    regionEn: "Mesopotamia",
    regionAr: "بلاد الرافدين",
    descriptionEn: "Iraqi and Kurdish reciters with distinct resonant styles",
    descriptionAr: "قرّاء العراق ذوو المقامات الهادئة والأداء العراقي والكردي المميز",
  },
  {
    code: "MA",
    nameEn: "Morocco",
    nameAr: "المغرب",
    flagEmoji: "🇲🇦",
    regionEn: "Maghreb",
    regionAr: "المغرب العربي",
    descriptionEn: "Masters of the Moroccan Warsh 'an Nafi' recitation tradition",
    descriptionAr: "أعلام المدرسة المغربية العريقة برواية ورش عن نافع",
  },
  {
    code: "DZ",
    nameEn: "Algeria",
    nameAr: "الجزائر",
    flagEmoji: "🇩🇿",
    regionEn: "Maghreb",
    regionAr: "المغرب العربي",
    descriptionEn: "Algerian Warsh & Hafs reciters with verified studio audio",
    descriptionAr: "قرّاء الجزائر المعتمدون برواية ورش عن نافع وحفص عن عاصم",
  },
  {
    code: "TN",
    nameEn: "Tunisia",
    nameAr: "تونس",
    flagEmoji: "🇹🇳",
    regionEn: "Maghreb",
    regionAr: "المغرب العربي",
    descriptionEn: "Tunisian-associated Qalun 'an Nafi' recitation tradition",
    descriptionAr: "أعلام التلاوة المرتبطة بالمدرسة التونسية برواية قالون عن نافع",
  },
  {
    code: "LY",
    nameEn: "Libya",
    nameAr: "ليبيا",
    flagEmoji: "🇱🇾",
    regionEn: "Maghreb",
    regionAr: "المغرب العربي",
    descriptionEn: "Libyan masters of Qalun and the Ten Canonical Qira'at",
    descriptionAr: "قرّاء ليبيا الأعلام برواية قالون عن نافع والقراءات العشر",
  },
  {
    code: "SD",
    nameEn: "Sudan",
    nameAr: "السودان",
    flagEmoji: "🇸🇩",
    regionEn: "Nile Valley & East Africa",
    regionAr: "وادي النيل وشرق أفريقيا",
    descriptionEn: "Sudanese masters of Al-Duri 'an Abi Amr and Hafs recitation",
    descriptionAr: "أئمة التلاوة السودانية برواية الدوري عن أبي عمرو وحفص",
  },
  {
    code: "SO",
    nameEn: "Somalia",
    nameAr: "الصومال",
    flagEmoji: "🇸🇴",
    regionEn: "Horn of Africa",
    regionAr: "القرن الأفريقي",
    descriptionEn: "Renowned Somali reciters teaching the Ten Qira'at globally",
    descriptionAr: "أعلام الإقراء من الصومال في القراءات العشر والروايات النادرة",
  },
  {
    code: "ML",
    nameEn: "Mali",
    nameAr: "مالي",
    flagEmoji: "🇲🇱",
    regionEn: "West Africa",
    regionAr: "غرب أفريقيا",
    descriptionEn: "West African Malian reciters with full Quran recordings",
    descriptionAr: "قرّاء غرب أفريقيا ومالي بالتلاوة الكاملة الموثقة",
  },
  {
    code: "ID",
    nameEn: "Indonesia",
    nameAr: "إندونيسيا",
    flagEmoji: "🇮🇩",
    regionEn: "Southeast Asia",
    regionAr: "جنوب شرق آسيا",
    descriptionEn: "Renowned Indonesian international Tilawah reciters",
    descriptionAr: "أبرز قرّاء إندونيسيا المشاركين في المسابقات القرآنية الدولية",
  },
  {
    code: "MY",
    nameEn: "Malaysia",
    nameAr: "ماليزيا",
    flagEmoji: "🇲🇾",
    regionEn: "Southeast Asia",
    regionAr: "جنوب شرق آسيا",
    descriptionEn: "Acclaimed Malaysian Johan Qari & Qariah competition reciters",
    descriptionAr: "قرّاء وقارئات ماليزيا الفائزون في مسابقات التلاوة الدولية",
  },
  {
    code: "IN",
    nameEn: "India",
    nameAr: "الهند",
    flagEmoji: "🇮🇳",
    regionEn: "South Asia",
    regionAr: "جنوب آسيا",
    descriptionEn: "Verified Indian scholar-reciters with complete 114-surah audio",
    descriptionAr: "قرّاء وعلماء الهند أصحاب المصاحف الكاملة الموثقة",
  },
  {
    code: "UZ",
    nameEn: "Uzbekistan",
    nameAr: "أوزبكستان",
    flagEmoji: "🇺🇿",
    regionEn: "Central Asia",
    regionAr: "آسيا الوسطى",
    descriptionEn: "Verified Uzbek reciters preserving Transoxianian Quran heritage",
    descriptionAr: "قرّاء أوزبكستان الموثقون بالمصحف الكامل",
  },
  {
    code: "US",
    nameEn: "United States",
    nameAr: "الولايات المتحدة الأمريكية",
    flagEmoji: "🇺🇸",
    regionEn: "North America",
    regionAr: "أمريكا الشمالية",
    descriptionEn: "Verified US-based Imams & Qaris with canonical Qira'at audio",
    descriptionAr: "الأئمة والقرّاء المقيمون في الولايات المتحدة بأسانيد القراءات الموثقة",
  },
] as const;

export const DIRECTORY_EXPANSION_STATUS: readonly DirectoryExpansionStatusItem[] = [
  {
    code: "PK",
    nameEn: "Pakistan",
    nameAr: "باكستان",
    flagEmoji: "🇵🇰",
    status: "pending_verification",
    reasonEn:
      "Excluded until direct HTTPS CDN Mushaf files are verified against primary sources (MP3Quran / QuranicAudio).",
    reasonAr: "بانتظار توثيق روابط صوتية مباشرة من مصادر مرخصة موثوقة لتجنب الملفات غير المحققة.",
  },
  {
    code: "BD",
    nameEn: "Bangladesh",
    nameAr: "بنغلاديش",
    flagEmoji: "🇧🇩",
    status: "pending_verification",
    reasonEn:
      "Excluded until official chapter-by-chapter audio streams with confirmed attribution are indexed.",
    reasonAr: "بانتظار فهرسة تسجيلات كاملة بالسور مع توثيق النسبة والمصدر الرسمي.",
  },
  {
    code: "TR",
    nameEn: "Turkey",
    nameAr: "تركيا",
    flagEmoji: "🇹🇷",
    status: "pending_verification",
    reasonEn:
      "Excluded until verified direct-streaming Diyanet / MP3Quran CDN entries are available.",
    reasonAr: "بانتظار توفر مسارات بث مباشر موثقة ضمن خوادم الصوتيات المعتمدة.",
  },
  {
    code: "IR",
    nameEn: "Iran",
    nameAr: "إيران",
    flagEmoji: "🇮🇷",
    status: "pending_verification",
    reasonEn:
      "Excluded until primary direct HTTPS chapter streams pass automated URL and attribution checks.",
    reasonAr: "بانتظار اجتياز الروابط الصوتية المباشرة لفحص التوفر والتوثيق المصدري.",
  },
  {
    code: "NG",
    nameEn: "Nigeria",
    nameAr: "نيجيريا",
    flagEmoji: "🇳🇬",
    status: "pending_verification",
    reasonEn:
      "Excluded until complete surah-indexed CDN archives for verified Nigerian Qaris are integrated.",
    reasonAr: "بانتظار اعتماد أرشيفات صوتية مفهرسة بالسور لقراء نيجيريا الموثقين.",
  },
  {
    code: "SN",
    nameEn: "Senegal",
    nameAr: "السنغال",
    flagEmoji: "🇸🇳",
    status: "pending_verification",
    reasonEn:
      "Excluded until verified direct audio collections for Senegalese reciters are confirmed.",
    reasonAr: "بانتظار تأكيد المصادر الصوتية المباشرة لقراء السنغال.",
  },
  {
    code: "GB",
    nameEn: "United Kingdom",
    nameAr: "المملكة المتحدة",
    flagEmoji: "🇬🇧",
    status: "pending_verification",
    reasonEn:
      "Excluded until UK-resident reciters have complete, verified chapter streams on trusted CDNs.",
    reasonAr: "بانتظار توفر تلاوات كاملة مفهرسة بالسور لقرّاء المملكة المتحدة على خوادم موثوقة.",
  },
] as const;

export const EXCLUDED_OR_SPECIAL_VERIFICATION_NOTES = [
  {
    id: "nabil-al-awadi",
    nameAr: "الشيخ نبيل العوضي",
    nameEn: "Sheikh Nabil Al-Awadi",
    countryAr: "الكويت",
    countryEn: "Kuwait",
    reasonAr:
      "لم يُدرج ضمن فهرس التلاوات لأن أعماله الموثقة في المصادر العامة محاضرات وقصص قرآنية لا مصحف مرتل كامل، وتم استبعاده التزاماً بالدقة الشرعية.",
    reasonEn:
      "Omitted from the recitation catalog because public verified archives hold lectures and Quran story talks rather than a complete canonical Mushaf recitation.",
  },
  {
    id: "muhammad-ayyoub-classification",
    nameAr: "الشيخ محمد أيوب (رحمه الله)",
    nameEn: "Sheikh Muhammad Ayyub",
    countryAr: "المملكة العربية السعودية (مكة والمدينة)",
    countryEn: "Saudi Arabia (Makkah & Madinah)",
    reasonAr:
      "وُلد في مكة المكرمة وحمل الجنسية السعودية وأمّ المصلين في المسجد النبوي الشريف بالمدينة المنورة؛ لذا صُنّف بدقة تحت السعودية لا مصر.",
    reasonEn:
      "Born in Makkah, Saudi citizen, and Imam of Masjid An-Nabawi in Madinah — accurately classified under Saudi Arabia rather than Egypt.",
  },
  {
    id: "muhammad-al-luhaidan-classification",
    nameAr: "الشيخ محمد اللحيدان",
    nameEn: "Sheikh Mohammed Al-Luhaidan",
    countryAr: "المملكة العربية السعودية (الرياض)",
    countryEn: "Saudi Arabia (Riyadh)",
    reasonAr:
      "وُلد في الرياض بالمملكة العربية السعودية وإمام جامع الناصر بالرياض؛ صُنّف تحت السعودية لا الأردن حفاظاً على دقة التصنيف الجغرافي.",
    reasonEn:
      "Born in Riyadh, Saudi Arabia and Imam of Al-Nasir Mosque in Riyadh — accurately classified under Saudi Arabia rather than Jordan.",
  },
] as const;

function makeEd(
  params: Omit<
    VerifiedRecordingEdition,
    | "sourceName"
    | "sourceUrl"
    | "licenseNoteEn"
    | "licenseNoteAr"
    | "attributionAr"
    | "attributionEn"
  > & {
    sourceName?: string;
    sourceUrl?: string;
    rightsStatusAr?: string;
    rightsStatusEn?: string;
  },
): VerifiedRecordingEdition {
  const inferredAvailability =
    params.availabilityStatus ?? (params.availableSurahIds === "all" ? "verified" : "partial");
  return {
    ...params,
    sourceName: params.sourceName ?? "MP3Quran.net Official Archive (v3)",
    sourceUrl: params.sourceUrl ?? "https://www.mp3quran.net/",
    availabilityStatus: inferredAvailability,
    rightsStatusAr:
      params.rightsStatusAr ?? "بث تعليمي وتعبّدي متاح عبر الأرشيف الصوتي العام الموثق",
    rightsStatusEn:
      params.rightsStatusEn ?? "Educational & personal worship stream via verified public archive",
    attributionAr: `${params.collectionTitleAr} — مصدر الصوت: ${params.sourceName ?? "MP3Quran.net"}`,
    attributionEn: `${params.collectionTitleEn} — Verified stream via ${params.sourceName ?? "MP3Quran.net"}`,
    licenseNoteEn:
      "Public streaming via official Islamic audio repository for educational & personal worship use.",
    licenseNoteAr:
      "بث صوتي متاح للاستماع التعليمي والتعبدي الشخصي عبر المستودعات الإسلامية الرسمية.",
  };
}

function makeProfile(input: {
  id: string;
  mp3QuranId?: number | null;
  qdcId?: number | null;
  nameEn: string;
  nameAr: string;
  titleEn: string;
  titleAr: string;
  bioEn: string;
  bioAr: string;
  countryCode: GlobalCountryCode;
  countryAssociation?: Partial<CountryAssociation>;
  style?: "Murattal" | "Mujawwad";
  primaryRiwayahAr?: string;
  primaryRiwayahEn?: string;
  isFeatured?: boolean;
  selectionBasisEn?: string;
  selectionBasisAr?: string;
  serverBaseUrl: string;
  recordings?: VerifiedRecordingEdition[];
  featuredPassages?: FeaturedPassageRef[];
  specialEmphasis?: VerifiedReciterProfile["specialEmphasis"];
}): VerifiedReciterProfile {
  const countryMeta = GLOBAL_COUNTRIES_META.find((c) => c.code === input.countryCode)!;
  const assoc: CountryAssociation = {
    primaryCountryCode: input.countryCode,
    nationalityAr: input.countryAssociation?.nationalityAr ?? countryMeta.nameAr,
    nationalityEn: input.countryAssociation?.nationalityEn ?? countryMeta.nameEn,
    birthplaceAr: input.countryAssociation?.birthplaceAr ?? null,
    birthplaceEn: input.countryAssociation?.birthplaceEn ?? null,
    residenceCountryAr: input.countryAssociation?.residenceCountryAr ?? null,
    residenceCountryEn: input.countryAssociation?.residenceCountryEn ?? null,
    associatedCountryAr: input.countryAssociation?.associatedCountryAr ?? countryMeta.nameAr,
    associatedCountryEn: input.countryAssociation?.associatedCountryEn ?? countryMeta.nameEn,
    classificationNoteAr:
      input.countryAssociation?.classificationNoteAr ??
      `مصنّف ضمن ${countryMeta.nameAr} بناءً على السيرة والمصدر الموثق.`,
    classificationNoteEn:
      input.countryAssociation?.classificationNoteEn ??
      `Associated with ${countryMeta.nameEn} based on verified biographical records.`,
  };

  const defaultEdition: VerifiedRecordingEdition = makeEd({
    recordingId: `${input.id}-primary`,
    reciterId: input.id,
    collectionTitleAr: `تلاوة ${input.primaryRiwayahAr ?? "حفص عن عاصم - مرتل"}`,
    collectionTitleEn: `${input.primaryRiwayahEn ?? "Hafs 'an 'Asim"} — ${input.style ?? "Murattal"}`,
    riwayahAr: input.primaryRiwayahAr ?? "حفص عن عاصم",
    riwayahEn: input.primaryRiwayahEn ?? "Hafs 'an 'Asim",
    style: input.style ?? "Murattal",
    serverBaseUrl: input.serverBaseUrl,
    availableSurahIds: ALL_114,
    qualityNoteAr: "تسجيل MP3 متوافق مع التشغيل المباشر",
    qualityNoteEn: "Verified MP3 stream (source bitrate varies per archive)",
    addedDate: null,
  });

  return {
    id: input.id,
    mp3QuranId: input.mp3QuranId ?? null,
    qdcId: input.qdcId ?? null,
    nameEn: input.nameEn,
    nameAr: input.nameAr,
    titleEn: input.titleEn,
    titleAr: input.titleAr,
    bioEn: input.bioEn,
    bioAr: input.bioAr,
    countryCode: input.countryCode,
    countryAssociation: assoc,
    style: input.style ?? "Murattal",
    primaryRiwayahAr: input.primaryRiwayahAr ?? "حفص عن عاصم",
    primaryRiwayahEn: input.primaryRiwayahEn ?? "Hafs 'an 'Asim",
    isFeatured: input.isFeatured ?? false,
    ...(input.selectionBasisEn ? { selectionBasisEn: input.selectionBasisEn } : {}),
    ...(input.selectionBasisAr ? { selectionBasisAr: input.selectionBasisAr } : {}),
    serverBaseUrl: input.serverBaseUrl,
    recordings:
      input.recordings && input.recordings.length > 0 ? input.recordings : [defaultEdition],
    ...(input.featuredPassages ? { featuredPassages: input.featuredPassages } : {}),
    ...(input.specialEmphasis ? { specialEmphasis: input.specialEmphasis } : {}),
  };
}

export const GLOBAL_RECITERS_DIRECTORY: readonly VerifiedReciterProfile[] = [
  // ============================================================================
  // 🇸🇦 SAUDI ARABIA (Preserves original 6 + Verified Imams & Masters)
  // ============================================================================
  makeProfile({
    id: "al-luhaidan",
    mp3QuranId: 107,
    nameEn: "Sheikh Mohammed Al-Luhaidan",
    nameAr: "الشيخ محمد اللحيدان",
    titleEn: "Imam of Al-Nasir Mosque, Riyadh & Renowned Reciter",
    titleAr: "إمام جامع الناصر بالرياض وقارئ ومحكّم قرآني",
    bioEn:
      "Born in Riyadh, Saudi Arabia; serves as judge and Imam of Jamia Al-Nasir, celebrated for deeply reverent, emotive Hafs 'an 'Asim recitations including Surah Al-Furqan (25:69) and Surah Al-Baqarah.",
    bioAr:
      "وُلد في مدينة الرياض بالمملكة العربية السعودية، ويعمل قاضياً وإماماً لجامع الناصر، واشتهر بتلاواته الخاشعة المؤثرة وبخاصة سورة الفرقان (آية ٦٩) وسورة البقرة.",
    countryCode: "SA",
    countryAssociation: {
      nationalityAr: "سعودي",
      nationalityEn: "Saudi Arabian",
      birthplaceAr: "الرياض، السعودية",
      birthplaceEn: "Riyadh, Saudi Arabia",
      residenceCountryAr: "المملكة العربية السعودية",
      residenceCountryEn: "Saudi Arabia",
      classificationNoteAr: "جنسية ومولد وإقامة موثقة في المملكة العربية السعودية (الرياض).",
      classificationNoteEn: "Verified Saudi nationality, born in Riyadh, serves in Riyadh.",
    },
    isFeatured: true,
    selectionBasisAr:
      "٣ إصدارات صوتية مستقلة وموثقة تشمل سورة الفرقان (آية ٦٩: يُضاعف له العذاب يوم القيامة) وسورة البقرة",
    selectionBasisEn:
      "3 distinct verified archives featuring Surah Al-Furqan (25:69 passage) & complete Surah Al-Baqarah",
    serverBaseUrl: "https://server8.mp3quran.net/lhdan/",
    specialEmphasis: {
      surahId: 2,
      surahNameAr: "سورة البقرة",
      surahNameEn: "Surah Al-Baqarah",
      noteAr: "تسجيل كامل وموثق برواية حفص عن عاصم بصوت الشيخ محمد اللحيدان",
      noteEn:
        "Complete authentic studio recording of Surah Al-Baqarah by Sheikh Mohammed Al-Luhaidan",
      audioUrl: "https://server8.mp3quran.net/lhdan/002.mp3",
    },
    featuredPassages: [
      {
        id: "al-luhaidan-furqan-69",
        surahId: 25,
        verseRange: "25:68–70",
        verseArabicExcerpt: "يُضَاعَفْ لَهُ الْعَذَابُ يَوْمَ الْقِيَامَةِ ... وَكَانَ اللَّهُ غَفُورًا رَحِيمًا",
        titleAr: "سورة الفرقان — المقطع الشهير (يُضاعف له العذاب ... وكان الله غفوراً رحيماً)",
        titleEn: "Surah Al-Furqan — Renowned Passage (v. 69–70: Warning & Mercy)",
        noteAr:
          "يتوفر لسورة الفرقان ٣ تسجيلات مستقلة للشيخ محمد اللحيدان (١٦:٢٠ دقيقة بالمرتل، ٢٠:٢٤ دقيقة بتراويح المحراب، و١٧:٢٢ دقيقة بأرشيف التلاوات) تبرز فيها النبرة اللحيدانية الباكية وقوة الإسقاط الصوتي عند الآيتين ٦٩ و٧٠.",
        noteEn:
          "3 distinct verified recordings of Surah Al-Furqan by Sheikh Al-Luhaidan (16:20 Murattal, 20:24 Taraweeh prayer, 17:22 Archive.org) highlighting his tearful vocal signature and high-register resonance across verses 69–70.",
        preferredRecordingId: "al-luhaidan-qa-select",
      },
      {
        id: "al-luhaidan-baqarah-complete",
        surahId: 2,
        verseRange: "2:1–286",
        verseArabicExcerpt: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ",
        titleAr: "سورة البقرة كاملة (تسجيلان مستقلان موثقان)",
        titleEn: "Complete Surah Al-Baqarah (2 Distinct Verified Editions)",
        noteAr: "متوفرة بتسجيل MP3Quran (١:٥٣:٠١) وتسجيل Archive.org المستقل (١:٥٦:٤١).",
        noteEn: "Available in MP3Quran studio stream (1:53:01) and Archive.org edition (1:56:41).",
        preferredRecordingId: "al-luhaidan-mp3q-server8",
      },
    ],
    recordings: [
      makeEd({
        recordingId: "al-luhaidan-mp3q-server8",
        reciterId: "al-luhaidan",
        collectionTitleAr: "المصحف المرتل الكامل — حفص عن عاصم (MP3Quran · 107)",
        collectionTitleEn: "Complete Murattal — Hafs 'an 'Asim (MP3Quran ID 107)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://server8.mp3quran.net/lhdan/",
        availableSurahIds: ALL_114,
        qualityNoteAr:
          "١٢٨ kbps MP3 — ١١٤ سورة كاملة عبر MP3Quran Server8 (توازن صوتي وتجويد متسق)",
        qualityNoteEn:
          "128 kbps MP3 — 114 Surahs via MP3Quran Server8 (balanced studio dynamics & Tajweed)",
        audioQualityLabel: "128 kbps MP3",
        addedDate: null,
        verifiedDate: "MP3Quran Server8 #107",
        occasionAr: "المصحف المرتل الكامل",
        occasionEn: "Complete Murattal Edition",
        surahDurationsSeconds: {
          1: 44,
          2: 6781,
          12: 2328,
          18: 1788,
          19: 1080,
          25: 980,
        },
        surahHighlights: {
          25: {
            verseRange: "25:68–70",
            verseArabicExcerpt: "يُضَاعَفْ لَهُ الْعَذَابُ يَوْمَ الْقِيَامَةِ",
            noteAr:
              "تضم السورة الكاملة المقطع المؤثر عند ٢٥:٦٨–٧٠ بنبرة متزنة وانتقال طبقي واضح (١٦:٢٠ دقيقة).",
            noteEn:
              "Complete Al-Furqan recording (16:20) featuring clear register transitions at 25:68–70.",
          },
        },
      }),
      makeEd({
        recordingId: "al-luhaidan-qa-select",
        reciterId: "al-luhaidan",
        collectionTitleAr: "تلاوات المحراب المختارة — ٨٤ سورة (QuranicAudio)",
        collectionTitleEn: "Prayer Recitations — 84 Surahs (QuranicAudio)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Archive",
        sourceName: "QuranicAudio.com",
        sourceUrl: "https://quranicaudio.com/",
        serverBaseUrl: "https://download.quranicaudio.com/quran/muhammad_alhaidan/",
        availableSurahIds: [
          1, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
          27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48,
          49, 50, 53, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 72, 75, 76, 77, 78,
          79, 80, 81, 82, 88, 90, 94, 96, 101, 102, 103, 104, 107, 111, 113, 114,
        ],
        qualityNoteAr:
          "١٢٨ kbps MP3 — ٨٤ سورة موثقة (آخر تحديث للأرشيف يناير ٢٠٢٣؛ بدون سورة البقرة) بإسقاط صوتي قوي وطبقات عالية",
        qualityNoteEn:
          "128 kbps MP3 — 84 verified Surahs (archive Last-Modified Jan 2023; excludes Surah 2) with high acoustic projection & register shifts",
        audioQualityLabel: "128 kbps MP3",
        availabilityStatus: "partial",
        addedDate: null,
        verifiedDate: "Jan 2023 archive",
        occasionAr: "تسجيلات المحراب والقيام",
        occasionEn: "Prayer & Night Devotion Archive",
        surahDurationsSeconds: {
          25: 1224,
        },
        surahHighlights: {
          25: {
            verseRange: "25:68–70",
            verseArabicExcerpt: "يُضَاعَفْ لَهُ الْعَذَابُ يَوْمَ الْقِيَامَةِ",
            noteAr:
              "تسجيل محرابي متأني (٢٠:٢٤ دقيقة) تبرز فيه النبرة اللحيدانية الشجية والمدود الممتدة عند ٢٥:٦٨–٧٠.",
            noteEn:
              "Distinct 20:24 prayer recording featuring Al-Luhaidan's resonant high-register cadence and tearful delivery at 25:68–70.",
          },
        },
      }),
      makeEd({
        recordingId: "al-luhaidan-ltq-archive",
        reciterId: "al-luhaidan",
        collectionTitleAr: "أرشيف التلاوات الكامل — ١١٤ سورة (Archive.org)",
        collectionTitleEn: "Complete Archive Edition — 114 Surahs (Archive.org)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Archive",
        sourceName: "Internet Archive (Listen-to-Quran)",
        sourceUrl: "https://archive.org/details/listen-to-quran.com_Mohammed-Al-Lohaidan",
        serverBaseUrl: "https://archive.org/download/listen-to-quran.com_Mohammed-Al-Lohaidan/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "٦٤ kbps MP3 — أرشيف مستقل ١١٤ سورة (ديسمبر ٢٠١٢) بأزمنة ونَفَس ممتد",
        qualityNoteEn:
          "64 kbps MP3 — independent 114-Surah Archive.org set (Dec 2012) with distinct phrasing & pacing",
        audioQualityLabel: "64 kbps MP3",
        availabilityStatus: "verified",
        addedDate: null,
        verifiedDate: "Dec 2012 archive",
        occasionAr: "أرشيف التسجيلات الكاملة المستقلة",
        occasionEn: "Independent Archival Collection",
        surahDurationsSeconds: {
          1: 34,
          2: 7001,
          12: 2102,
          18: 1571,
          19: 1097,
          25: 1042,
        },
        surahHighlights: {
          25: {
            verseRange: "25:68–70",
            verseArabicExcerpt: "يُضَاعَفْ لَهُ الْعَذَابُ يَوْمَ الْقِيَامَةِ",
            noteAr:
              "نسخة أرشيفية ثالثة كاملة لسورة الفرقان (١٧:٢٢ دقيقة) تشمل المقطع المؤثر عند ٢٥:٦٨–٧٠.",
            noteEn: "3rd independent full recording of Surah Al-Furqan (17:22) including 25:68–70.",
          },
        },
      }),
    ],
  }),
  makeProfile({
    id: "al-sudais",
    mp3QuranId: 54,
    qdcId: 3,
    nameEn: "Sheikh Abdul Rahman Al-Sudais",
    nameAr: "الشيخ عبد الرحمن السديس",
    titleEn: "Imam & Khatib of Masjid Al-Haram, Makkah",
    titleAr: "إمام وخطيب المسجد الحرام بمكة المكرمة",
    bioEn:
      "Saudi Islamic scholar and senior Imam & Khatib of the Grand Mosque in Makkah since 1984.",
    bioAr:
      "عالم وإمام وخطيب المسجد الحرام بمكة المكرمة منذ عام ١٤٠٤هـ، من مواليد البكيرية بالقصيم.",
    countryCode: "SA",
    countryAssociation: {
      birthplaceAr: "القصيم، السعودية",
      birthplaceEn: "Al-Qassim, Saudi Arabia",
    },
    isFeatured: true,
    selectionBasisAr: "إمام الحرم المكي — تلاوتان موثقتان من أرشيفين مستقلين",
    selectionBasisEn: "Imam of Masjid Al-Haram — 2 verified independent audio archives",
    serverBaseUrl: "https://server11.mp3quran.net/sds/",
    recordings: [
      makeEd({
        recordingId: "al-sudais-mp3q",
        reciterId: "al-sudais",
        collectionTitleAr: "المصحف المرتل الكامل (MP3Quran)",
        collectionTitleEn: "Complete Murattal (MP3Quran)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://server11.mp3quran.net/sds/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
      makeEd({
        recordingId: "al-sudais-qa",
        reciterId: "al-sudais",
        collectionTitleAr: "نسخة الحرمين الأرشيفية (QuranicAudio)",
        collectionTitleEn: "QuranicAudio Complete Edition",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Archive",
        sourceName: "QuranicAudio.com",
        sourceUrl: "https://quranicaudio.com/",
        serverBaseUrl: "https://download.quranicaudio.com/quran/abdurrahmaan_as-sudays/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "إصدار أرشيفي مستقل عن نسخة MP3Quran",
        qualityNoteEn: "Independent QuranicAudio archive stream",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "al-ghamdi",
    mp3QuranId: 30,
    nameEn: "Sheikh Saad Al-Ghamdi",
    nameAr: "الشيخ سعد الغامدي",
    titleEn: "Former Imam of Masjid An-Nabawi & Acclaimed Reciter",
    titleAr: "إمام المسجد النبوي الشريف سابقاً وأحد أشهر قراء العالم الإسلامي",
    bioEn:
      "Born in Dammam, Saudi Arabia in 1967; holds an Ijazah in Hafs 'an 'Asim and served as Imam at Masjid An-Nabawi in 2009.",
    bioAr:
      "وُلد في الدمام بالمملكة العربية السعودية عام ١٩٦٧م، مجاز بالإسناد برواية حفص عن عاصم وأمّ المصلين في المسجد النبوي.",
    countryCode: "SA",
    countryAssociation: {
      birthplaceAr: "الدمام، السعودية",
      birthplaceEn: "Dammam, Saudi Arabia",
    },
    isFeatured: true,
    selectionBasisAr: "من أوسع المصاحف المرتلة وضوحاً للمراجعة والحفظ",
    selectionBasisEn: "Clear paced Murattal widely used for revision and memorization",
    serverBaseUrl: "https://server7.mp3quran.net/s_gmd/",
  }),
  makeProfile({
    id: "al-muaiqly",
    mp3QuranId: 102,
    nameEn: "Sheikh Maher Al-Muaiqly",
    nameAr: "الشيخ ماهر المعيقلي",
    titleEn: "Imam & Khatib of Masjid Al-Haram, Makkah",
    titleAr: "إمام وخطيب المسجد الحرام بمكة المكرمة",
    bioEn:
      "Born in Madinah, Saudi Arabia; earned a PhD in Fiqh from Umm Al-Qura University and has served as Imam of Masjid Al-Haram since 2007.",
    bioAr:
      "وُلد بالمدينة المنورة، وحصل على الدكتوراه في الفقه من جامعة أم القرى، ويؤم المصلين في المسجد الحرام.",
    countryCode: "SA",
    countryAssociation: {
      birthplaceAr: "المدينة المنورة، السعودية",
      birthplaceEn: "Madinah, Saudi Arabia",
    },
    isFeatured: true,
    selectionBasisAr: "يتوفر بـ ٣ إصدارات: مرتل، مجود، ومصحف معلم",
    selectionBasisEn: "Available in 3 verified editions: Murattal, Mujawwad & Muallim",
    serverBaseUrl: "https://server12.mp3quran.net/maher/",
    recordings: [
      makeEd({
        recordingId: "al-muaiqly-murattal",
        reciterId: "al-muaiqly",
        collectionTitleAr: "المصحف المرتل الكامل — حفص عن عاصم",
        collectionTitleEn: "Complete Murattal — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://server12.mp3quran.net/maher/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "All 114 Surahs",
        addedDate: null,
      }),
      makeEd({
        recordingId: "al-muaiqly-mujawwad",
        reciterId: "al-muaiqly",
        collectionTitleAr: "المصحف المجود الكامل — حفص عن عاصم",
        collectionTitleEn: "Complete Mujawwad Edition — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Mujawwad",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/maher-muaiqly/r3/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة بأسلوب التجويد",
        qualityNoteEn: "114 Surahs in Mujawwad style",
        addedDate: null,
      }),
      makeEd({
        recordingId: "al-muaiqly-muallim",
        reciterId: "al-muaiqly",
        collectionTitleAr: "المصحف المعلم (الفاتحة وجزء عمّ — ٣٨ سورة)",
        collectionTitleEn: "Teacher Edition (Al-Fatihah & Juz Amma — 38 Surahs)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Muallim",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/maher-muaiqly/r2/",
        availableSurahIds: [
          1, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
          100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114,
        ],
        qualityNoteAr: "مخصص للتعليم والتكرار (٣٨ سورة موثقة)",
        qualityNoteEn: "Instructional Juz Amma edition (38 Surahs verified)",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "al-dosari",
    mp3QuranId: 92,
    nameEn: "Sheikh Yasser Al-Dosari",
    nameAr: "الشيخ ياسر الدوسري",
    titleEn: "Imam & Khatib of Masjid Al-Haram, Makkah",
    titleAr: "إمام وخطيب المسجد الحرام",
    bioEn:
      "Born in Al-Kharj, Saudi Arabia; appointed Imam at Masjid Al-Haram and holds a PhD in Comparative Jurisprudence.",
    bioAr:
      "وُلد في محافظة الخرج بالسعودية، إمام وخطيب بالمسجد الحرام وحاصل على الدكتوراه في الفقه المقارن.",
    countryCode: "SA",
    countryAssociation: {
      birthplaceAr: "الخرج، السعودية",
      birthplaceEn: "Al-Kharj, Saudi Arabia",
    },
    isFeatured: true,
    selectionBasisAr: "إمام المسجد الحرام — متوفر بأرشيفين موثقين",
    selectionBasisEn: "Imam of Masjid Al-Haram — 2 verified archives",
    serverBaseUrl: "https://server11.mp3quran.net/yasser/",
    recordings: [
      makeEd({
        recordingId: "al-dosari-mp3q",
        reciterId: "al-dosari",
        collectionTitleAr: "المصحف المرتل الكامل (MP3Quran)",
        collectionTitleEn: "Complete Murattal (MP3Quran)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://server11.mp3quran.net/yasser/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
      makeEd({
        recordingId: "al-dosari-qa",
        reciterId: "al-dosari",
        collectionTitleAr: "إصدار QuranicAudio الكامل",
        collectionTitleEn: "QuranicAudio Complete Edition",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Archive",
        sourceName: "QuranicAudio.com",
        sourceUrl: "https://quranicaudio.com/",
        serverBaseUrl: "https://download.quranicaudio.com/quran/yasser_ad-dussary/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "مصدر أرشيفي مستقل ١١٤ سورة",
        qualityNoteEn: "Independent QuranicAudio complete stream",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "al-suqair",
    nameEn: "Sheikh Yusuf Al-Suqair",
    nameAr: "الشيخ يوسف الصقير",
    titleEn: "Esteemed Saudi Reciter & Imam",
    titleAr: "قارئ وإمام سعودي",
    bioEn: "Saudi Quran reciter with a serene, measured Hafs 'an 'Asim Mushaf hosted on MP3Quran.",
    bioAr: "قارئ وإمام سعودي عُرف بهدوء التلاوة واتزان المخارج برواية حفص عن عاصم.",
    countryCode: "SA",
    serverBaseUrl: "https://server16.mp3quran.net/sqer/",
  }),
  makeProfile({
    id: "al-shuraim",
    mp3QuranId: 31,
    qdcId: 10,
    nameEn: "Sheikh Saud Al-Shuraim",
    nameAr: "الشيخ سعود الشريم",
    titleEn: "Former Imam & Khatib of Masjid Al-Haram, Makkah",
    titleAr: "إمام وخطيب المسجد الحرام بمكة المكرمة سابقاً",
    bioEn:
      "Born in Riyadh in 1966; served over 30 years as Imam of the Grand Mosque in Makkah and Dean of Sharia at Umm Al-Qura University.",
    bioAr:
      "وُلد في الرياض عام ١٣٨٦هـ، وأمّ المصلين في المسجد الحرام لأكثر من ثلاثة عقود، وتولى عمادة كلية الشريعة بجامعة أم القرى.",
    countryCode: "SA",
    countryAssociation: {
      birthplaceAr: "الرياض، السعودية",
      birthplaceEn: "Riyadh, Saudi Arabia",
    },
    isFeatured: true,
    selectionBasisAr: "من أعلام الحرم المكي — متوفر بإصدارين مستقلين",
    selectionBasisEn: "Senior Haram Imam — 2 verified complete editions",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/saud-shuraim/r1/",
    recordings: [
      makeEd({
        recordingId: "al-shuraim-mp3q",
        reciterId: "al-shuraim",
        collectionTitleAr: "المصحف المرتل — حفص عن عاصم (MP3Quran)",
        collectionTitleEn: "Complete Murattal — Hafs 'an 'Asim (MP3Quran)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/saud-shuraim/r1/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
      makeEd({
        recordingId: "al-shuraim-qa",
        reciterId: "al-shuraim",
        collectionTitleAr: "نسخة QuranicAudio الأرشيفية",
        collectionTitleEn: "QuranicAudio Complete Edition",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Archive",
        sourceName: "QuranicAudio.com",
        sourceUrl: "https://quranicaudio.com/",
        serverBaseUrl: "https://download.quranicaudio.com/quran/sa3ood_al-shuraym/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "مصدر أرشيفي ثانٍ ١١٤ سورة",
        qualityNoteEn: "Verified alternate QuranicAudio collection",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "al-juhany",
    mp3QuranId: 62,
    nameEn: "Sheikh Abdullah Awad Al-Juhany",
    nameAr: "الشيخ عبد الله عواد الجهني",
    titleEn: "Imam & Khatib of Masjid Al-Haram, Makkah",
    titleAr: "إمام وخطيب المسجد الحرام بمكة المكرمة",
    bioEn:
      "Born in Madinah in 1976; studied Quran at the Islamic University of Madinah and leads prayers in Masjid Al-Haram.",
    bioAr:
      "وُلد بالمدينة المنورة عام ١٩٧٦م، حفظ القرآن صغيراً وتخرج في الجامعة الإسلامية، وهو إمام وخطيب المسجد الحرام.",
    countryCode: "SA",
    countryAssociation: {
      birthplaceAr: "المدينة المنورة، السعودية",
      birthplaceEn: "Madinah, Saudi Arabia",
    },
    serverBaseUrl: "https://cdn.mp3quran.net/audio/abdullah-juhani/r1/",
  }),
  makeProfile({
    id: "bandar-baleela",
    mp3QuranId: 217,
    nameEn: "Sheikh Bandar Baleela",
    nameAr: "الشيخ بندر بليلة",
    titleEn: "Imam & Khatib of Masjid Al-Haram, Makkah",
    titleAr: "إمام وخطيب المسجد الحرام بمكة المكرمة",
    bioEn:
      "Born in Makkah in 1975; PhD from the Islamic University of Madinah, Imam of Masjid Al-Haram, and member of the Council of Senior Scholars.",
    bioAr:
      "وُلد في مكة المكرمة عام ١٣٩٥هـ، حاصل على الدكتوراه من الجامعة الإسلامية بالمدينة وإمام وخطيب المسجد الحرام.",
    countryCode: "SA",
    countryAssociation: {
      birthplaceAr: "مكة المكرمة، السعودية",
      birthplaceEn: "Makkah, Saudi Arabia",
    },
    serverBaseUrl: "https://cdn.mp3quran.net/audio/bandar-baleela/r1/",
    recordings: [
      makeEd({
        recordingId: "bandar-baleela-mp3q",
        reciterId: "bandar-baleela",
        collectionTitleAr: "المصحف المرتل الكامل (MP3Quran)",
        collectionTitleEn: "Complete Murattal (MP3Quran)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/bandar-baleela/r1/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "All 114 Surahs",
        addedDate: null,
      }),
      makeEd({
        recordingId: "bandar-baleela-qa",
        reciterId: "bandar-baleela",
        collectionTitleAr: "نسخة QuranicAudio الموثقة",
        collectionTitleEn: "QuranicAudio Complete Edition",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Archive",
        sourceName: "QuranicAudio.com",
        sourceUrl: "https://quranicaudio.com/",
        serverBaseUrl: "https://download.quranicaudio.com/quran/bandar_baleela/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "مصدر أرشيفي ثانٍ موثق",
        qualityNoteEn: "Verified independent QuranicAudio archive",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "ali-jaber",
    mp3QuranId: 76,
    nameEn: "Sheikh Ali Jaber",
    nameAr: "الشيخ علي جابر",
    titleEn: "Former Imam of Masjid Al-Haram (Hijazi Style)",
    titleAr: "إمام المسجد الحرام الأسبق (صاحب الأداء الحجازي الرصين)",
    bioEn:
      "Late renowned Saudi Imam of Masjid Al-Haram in Makkah during the 1980s, revered for his heartfelt Hijazi tone.",
    bioAr: "من أشهر أئمة المسجد الحرام في حقبة الثمانينيات الميلادية، تميز بأداء حجازي خاشع متفرد.",
    countryCode: "SA",
    countryAssociation: {
      birthplaceAr: "جدة، السعودية",
      birthplaceEn: "Jeddah, Saudi Arabia",
      classificationNoteAr: "وُلد في جدة وأمّ المصلين في المسجد الحرام.",
      classificationNoteEn:
        "Saudi national; raised in Madinah & served as Imam of Masjid Al-Haram.",
    },
    isFeatured: true,
    selectionBasisAr: "من أشهر قراء الحرم المكي وأصوات التراويح الخاشعة",
    selectionBasisEn: "Historic Haram Imam known for soulful Hijazi Taraweeh",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/ali-jaber/r1/",
  }),
  makeProfile({
    id: "al-hudhaifi",
    mp3QuranId: 74,
    nameEn: "Sheikh Ali Al-Hudhaifi",
    nameAr: "الشيخ علي بن عبد الرحمن الحذيفي",
    titleEn: "Senior Imam & Khatib of Masjid An-Nabawi, Madinah",
    titleAr: "إمام وخطيب المسجد النبوي الشريف بالمدينة المنورة",
    bioEn:
      "Saudi scholar and chief Imam of the Prophet's Mosque in Madinah; holds master chain recordings in multiple Qira'at.",
    bioAr: "شيخ قراء المدينة وإمام وخطيب المسجد النبوي، له مصاحف مسجلة بعدة روايات متواترة.",
    countryCode: "SA",
    countryAssociation: {
      birthplaceAr: "القَرْن المستقيم، الباحة، السعودية",
      birthplaceEn: "Al-Baha Region, Saudi Arabia",
    },
    isFeatured: true,
    selectionBasisAr: "مصاحف كاملة بـ ٣ روايات متواترة: حفص وقالون وشعبة",
    selectionBasisEn: "Complete Quran recorded across 3 canonical Riwayat: Hafs, Qalun & Shu'bah",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/ali-hudhaifi/r1/",
    recordings: [
      makeEd({
        recordingId: "al-hudhaifi-hafs",
        reciterId: "al-hudhaifi",
        collectionTitleAr: "المصحف المرتل — برواية حفص عن عاصم",
        collectionTitleEn: "Complete Murattal — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/ali-hudhaifi/r1/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
      makeEd({
        recordingId: "al-hudhaifi-qalun",
        reciterId: "al-hudhaifi",
        collectionTitleAr: "المصحف المرتل — برواية قالون عن نافع",
        collectionTitleEn: "Complete Murattal — Qalun 'an Nafi'",
        riwayahAr: "قالون عن نافع",
        riwayahEn: "Qalun 'an Nafi'",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/ali-hudhaifi/r2/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة برواية قالون",
        qualityNoteEn: "114 Surahs complete in Qalun 'an Nafi'",
        addedDate: null,
      }),
      makeEd({
        recordingId: "al-hudhaifi-shubah",
        reciterId: "al-hudhaifi",
        collectionTitleAr: "المصحف المرتل — برواية شعبة عن عاصم",
        collectionTitleEn: "Complete Murattal — Shu'bah 'an 'Asim",
        riwayahAr: "شعبة عن عاصم",
        riwayahEn: "Shu'bah 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/ali-hudhaifi/r3/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة برواية شعبة",
        qualityNoteEn: "114 Surahs complete in Shu'bah 'an 'Asim",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "muhammad-ayyub",
    mp3QuranId: 109,
    nameEn: "Sheikh Muhammad Ayyub",
    nameAr: "الشيخ محمد أيوب",
    titleEn: "Former Imam of Masjid An-Nabawi, Madinah",
    titleAr: "إمام المسجد النبوي الشريف الأسبق (من أعلام المدينة المنورة)",
    bioEn:
      "Born in Makkah (1952), Saudi citizen, earned his PhD from the Islamic University of Madinah, and served as Imam of Masjid An-Nabawi.",
    bioAr:
      "وُلد بمكة المكرمة عام ١٣٧٢هـ، سعودي الجنسية، حصل على الدكتوراه من الجامعة الإسلامية وأمّ المسجد النبوي الشريف.",
    countryCode: "SA",
    countryAssociation: {
      nationalityAr: "سعودي (من أصول بورمية أراكانية)",
      nationalityEn: "Saudi Arabian",
      birthplaceAr: "مكة المكرمة، السعودية",
      birthplaceEn: "Makkah, Saudi Arabia",
      residenceCountryAr: "المدينة المنورة، السعودية",
      residenceCountryEn: "Madinah, Saudi Arabia",
      classificationNoteAr: "وُلد في مكة وعاش في المدينة وأمّ المسجد النبوي؛ تصنيف سعودي موثق.",
      classificationNoteEn: "Born in Makkah, lifelong scholar & Imam in Madinah, Saudi Arabia.",
    },
    isFeatured: true,
    selectionBasisAr: "إمام المسجد النبوي الأسبق — متوفر بالمرتل والتلاوة المميزة",
    selectionBasisEn: "Beloved Madinah Imam — available in 2 complete verified editions",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/muhammad-ayyub/r1/",
    recordings: [
      makeEd({
        recordingId: "muhammad-ayyub-r1",
        reciterId: "muhammad-ayyub",
        collectionTitleAr: "المصحف المرتل الكامل — حفص عن عاصم",
        collectionTitleEn: "Complete Murattal — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/muhammad-ayyub/r1/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
      makeEd({
        recordingId: "muhammad-ayyub-r2",
        reciterId: "muhammad-ayyub",
        collectionTitleAr: "المصحف المرتل — تلاوة مميزة (تسجيل ثانٍ)",
        collectionTitleEn: "Distinguished Edition — Hafs 'an 'Asim (Second Recording)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Archive",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/muhammad-ayyub/r2/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "نسخة تسجيل مختلفة كاملة ١١٤ سورة",
        qualityNoteEn: "Distinct 114-Surah collection archived by MP3Quran",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "ahmad-deeban",
    mp3QuranId: 265,
    nameEn: "Sheikh Dr. Ahmad Deban",
    nameAr: "الشيخ د. أحمد ديبان",
    titleEn: "Master of Multiple Canonical Qira'at (Saudi Arabia)",
    titleAr: "شيخ ومقرئ مجاز بالقراءات المتواترة",
    bioEn:
      "Verified Saudi reciter noted for complete multi-riwayah studio recordings across Hafs, Shu'bah, Qalun, Warsh, and Al-Duri.",
    bioAr: "مقرئ سعودي متقن سجّل عدة مصاحف كاملة بروايات متعددة على خوادم الصوتيات المعتمدة.",
    countryCode: "SA",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/ahmad-deeban/r1/",
    recordings: [
      makeEd({
        recordingId: "deeban-hafs",
        reciterId: "ahmad-deeban",
        collectionTitleAr: "حفص عن عاصم — مرتل",
        collectionTitleEn: "Hafs 'an 'Asim — Murattal",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/ahmad-deeban/r1/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
      makeEd({
        recordingId: "deeban-shubah",
        reciterId: "ahmad-deeban",
        collectionTitleAr: "شعبة عن عاصم — مرتل",
        collectionTitleEn: "Shu'bah 'an 'Asim — Murattal",
        riwayahAr: "شعبة عن عاصم",
        riwayahEn: "Shu'bah 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/ahmad-deeban/r2/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
      makeEd({
        recordingId: "deeban-qalun",
        reciterId: "ahmad-deeban",
        collectionTitleAr: "قالون عن نافع — مرتل",
        collectionTitleEn: "Qalun 'an Nafi' — Murattal",
        riwayahAr: "قالون عن نافع",
        riwayahEn: "Qalun 'an Nafi'",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/ahmad-deeban/r5/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
      makeEd({
        recordingId: "deeban-warsh",
        reciterId: "ahmad-deeban",
        collectionTitleAr: "ورش عن نافع من طريق الأزرق — مرتل",
        collectionTitleEn: "Warsh 'an Nafi' (Tariq Al-Azraq) — Murattal",
        riwayahAr: "ورش عن نافع",
        riwayahEn: "Warsh 'an Nafi'",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/ahmad-deeban/r7/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
    ],
  }),

  // ============================================================================
  // 🇪🇬 EGYPT (Preserves original 5 + Verified Egyptian Masters)
  // ============================================================================
  makeProfile({
    id: "al-husary",
    mp3QuranId: 118,
    qdcId: 6,
    nameEn: "Sheikh Mahmoud Khalil Al-Husary",
    nameAr: "الشيخ محمود خليل الحصري",
    titleEn: "President of Egyptian Maqari & Benchmark of Tajweed",
    titleAr: "شيخ عموم المقارئ المصرية الأسبق والمرجع الأول في أحكام التجويد",
    bioEn:
      "Born in Tanta, Gharbia, Egypt (1917–1980); first reciter to record the complete Quran on audio and benchmark authority for Tajweed students.",
    bioAr:
      "وُلد في قرية شبرا النملة بطنطا عام ١٩١٧م وتولى مشيخة المقارئ المصرية، وهو أول من سجل المصحف المرتل صوتياً.",
    countryCode: "EG",
    countryAssociation: {
      birthplaceAr: "طنطا، الغربية، مصر",
      birthplaceEn: "Tanta, Gharbia, Egypt",
    },
    isFeatured: true,
    selectionBasisAr: "مرجع عالمي — متاح بـ ٥ روايات وإصدارات تعليمية ومجودة",
    selectionBasisEn:
      "Global Tajweed benchmark — 5 verified editions across Murattal, Mujawwad & Riwayat",
    serverBaseUrl: "https://server13.mp3quran.net/husr/",
    recordings: [
      makeEd({
        recordingId: "al-husary-murattal",
        reciterId: "al-husary",
        collectionTitleAr: "المصحف المرتل الكامل — حفص عن عاصم",
        collectionTitleEn: "Complete Murattal — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/mahmoud-husary/r1/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "الترتيل الإذاعي المعتمد (١١٤ سورة)",
        qualityNoteEn: "Canonical Murattal edition (114 Surahs)",
        addedDate: null,
      }),
      makeEd({
        recordingId: "al-husary-mujawwad",
        reciterId: "al-husary",
        collectionTitleAr: "المصحف المجود الكامل — حفص عن عاصم",
        collectionTitleEn: "Complete Mujawwad — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Mujawwad",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/mahmoud-husary/r2/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة مجودة",
        qualityNoteEn: "All 114 Surahs in Mujawwad",
        addedDate: null,
      }),
      makeEd({
        recordingId: "al-husary-warsh",
        reciterId: "al-husary",
        collectionTitleAr: "المصحف المرتل — برواية ورش عن نافع",
        collectionTitleEn: "Complete Murattal — Warsh 'an Nafi'",
        riwayahAr: "ورش عن نافع",
        riwayahEn: "Warsh 'an Nafi'",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/mahmoud-husary/r3/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة برواية ورش",
        qualityNoteEn: "114 Surahs in Warsh",
        addedDate: null,
      }),
      makeEd({
        recordingId: "al-husary-qalun",
        reciterId: "al-husary",
        collectionTitleAr: "المصحف المرتل — برواية قالون عن نافع",
        collectionTitleEn: "Complete Murattal — Qalun 'an Nafi'",
        riwayahAr: "قالون عن نافع",
        riwayahEn: "Qalun 'an Nafi'",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/mahmoud-husary/r5/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة برواية قالون",
        qualityNoteEn: "114 Surahs in Qalun",
        addedDate: null,
      }),
      makeEd({
        recordingId: "al-husary-iza3a",
        reciterId: "al-husary",
        collectionTitleAr: "تسجيل الإذاعة المصرية التاريخي (QuranicAudio)",
        collectionTitleEn: "Historic Egyptian Radio Broadcast (QuranicAudio)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Archive",
        sourceName: "QuranicAudio.com",
        sourceUrl: "https://quranicaudio.com/",
        serverBaseUrl: "https://download.quranicaudio.com/quran/mahmood_khaleel_al-husaree_iza3a/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "التسجيل الإذاعي المميز ١١٤ سورة",
        qualityNoteEn: "Historic radio archive (114 Surahs)",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "al-minshawi",
    mp3QuranId: 112,
    qdcId: 9,
    nameEn: "Sheikh Mohamed Siddiq El-Minshawi",
    nameAr: "الشيخ محمد صديق المنشاوي",
    titleEn: "The Reverent Voice (الصوت الخاشع الباكي)",
    titleAr: "أحد أساطين التلاوة المصرية وصاحب الصوت الخاشع الباكي",
    bioEn:
      "Born in Al-Manshah, Sohag, Upper Egypt (1920–1969); celebrated across the Islamic world for deep spiritual humility.",
    bioAr:
      "وُلد بمدينة المنشاة بمحافظة سوهاج في صعيد مصر عام ١٩٢٠م، من أشهر أعلام التلاوة الخاشعة في العالم الإسلامي.",
    countryCode: "EG",
    countryAssociation: {
      birthplaceAr: "المنشاة، سوهاج، مصر",
      birthplaceEn: "Sohag, Upper Egypt",
    },
    isFeatured: true,
    selectionBasisAr: "٤ تسجيلات: المرتل والمجود والمعلم وأرشيف ١٩٦٧م",
    selectionBasisEn: "4 verified archives including Murattal, Mujawwad, Muallim & 1967 Archive",
    serverBaseUrl: "https://server10.mp3quran.net/minsh/",
    recordings: [
      makeEd({
        recordingId: "al-minshawi-murattal",
        reciterId: "al-minshawi",
        collectionTitleAr: "المصحف المرتل الكامل — حفص عن عاصم",
        collectionTitleEn: "Complete Murattal — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/muhammad-minshawi/r1/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
      makeEd({
        recordingId: "al-minshawi-mujawwad",
        reciterId: "al-minshawi",
        collectionTitleAr: "المصحف المجود الكامل — حفص عن عاصم",
        collectionTitleEn: "Complete Mujawwad — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Mujawwad",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/muhammad-minshawi/r2/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة مجودة",
        qualityNoteEn: "114 Surahs in Mujawwad",
        addedDate: null,
      }),
      makeEd({
        recordingId: "al-minshawi-muallim",
        reciterId: "al-minshawi",
        collectionTitleAr: "المصحف المعلم (مع ترديد الأطفال)",
        collectionTitleEn: "Teacher Edition (With Student Repetition)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Muallim",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/muhammad-minshawi/r3/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة تعليمية مثالية للتحفيظ",
        qualityNoteEn: "Educational Mushaf ideal for memorization",
        addedDate: null,
      }),
      makeEd({
        recordingId: "al-minshawi-1967-archive",
        reciterId: "al-minshawi",
        collectionTitleAr: "التلاوة التاريخية المسجلة عام ١٣٨٧هـ / ١٩٦٧م (١١٠ سور)",
        collectionTitleEn: "Historic 1967 CE / 1387 AH Recording (110 Verified Surahs)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Archive",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/muhammad-minshawi/r4/",
        availableSurahIds: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 25, 26, 27, 28,
          29, 30, 31, 32, 33, 34, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
          52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73,
          74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95,
          96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114,
        ],
        qualityNoteAr: "١١٠ سور متوفرة في هذا الأرشيف النادر (باستثناء السور ١٦، ٢٣، ٢٤، ٣٥)",
        qualityNoteEn:
          "110 verified Surahs from 1967 archival session (excluding Surahs 16, 23, 24, 35)",
        availabilityStatus: "partial",
        addedDate: null,
        verifiedDate: "1387 AH (1967 CE)",
        occasionAr: "التسجيل الإذاعي لعام ١٣٨٧هـ",
        occasionEn: "1387 AH (1967 CE) Archival Session",
        surahDurationsSeconds: {
          25: 1064,
        },
      }),
    ],
  }),
  makeProfile({
    id: "abdul-basit",
    mp3QuranId: 51,
    qdcId: 2,
    nameEn: "Sheikh Abdul Basit Abdus Samad",
    nameAr: "الشيخ عبد الباسط عبد الصمد",
    titleEn: "Golden Voice of the Islamic World",
    titleAr: "صاحب الحنجرة الذهبية وسفير القرآن الكريم في العالم",
    bioEn:
      "Born in Armant, Luxor, Upper Egypt (1927–1988); first president of the Egyptian Reciters Syndicate and icon of both Murattal and Mujawwad.",
    bioAr:
      "وُلد بقرية المراعزة بأرمنت في صعيد مصر عام ١٩٢٧م، أول نقيب لقراء مصر وأحد أعظم الأصوات القرآنية عبر العصور.",
    countryCode: "EG",
    countryAssociation: {
      birthplaceAr: "أرمنت، الأقصر، مصر",
      birthplaceEn: "Armant, Luxor, Egypt",
    },
    isFeatured: true,
    selectionBasisAr: "يتوفر بـ ٤ نسخ: المجود والمرتل وورش ونسخة QuranicAudio",
    selectionBasisEn: "4 verified archives across Mujawwad, Murattal & Warsh",
    serverBaseUrl: "https://server7.mp3quran.net/basit/",
    recordings: [
      makeEd({
        recordingId: "abdul-basit-mujawwad",
        reciterId: "abdul-basit",
        collectionTitleAr: "المصحف المجود الكامل — حفص عن عاصم",
        collectionTitleEn: "Complete Mujawwad — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Mujawwad",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/abdulbasit-abdulsamad/r1/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة مجودة كاملة",
        qualityNoteEn: "114 Surahs in classic Mujawwad",
        addedDate: null,
      }),
      makeEd({
        recordingId: "abdul-basit-murattal",
        reciterId: "abdul-basit",
        collectionTitleAr: "المصحف المرتل الكامل — حفص عن عاصم",
        collectionTitleEn: "Complete Murattal — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/abdulbasit-abdulsamad/r3/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة مرتلة كاملة",
        qualityNoteEn: "114 Surahs in clear Murattal",
        addedDate: null,
      }),
      makeEd({
        recordingId: "abdul-basit-warsh",
        reciterId: "abdul-basit",
        collectionTitleAr: "المصحف المرتل — برواية ورش عن نافع",
        collectionTitleEn: "Complete Murattal — Warsh 'an Nafi'",
        riwayahAr: "ورش عن نافع",
        riwayahEn: "Warsh 'an Nafi'",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/abdulbasit-abdulsamad/r2/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة برواية ورش عن نافع",
        qualityNoteEn: "114 Surahs in Warsh 'an Nafi'",
        addedDate: null,
      }),
      makeEd({
        recordingId: "abdul-basit-qa-mujawwad",
        reciterId: "abdul-basit",
        collectionTitleAr: "المصحف المجود — إصدار QuranicAudio",
        collectionTitleEn: "Mujawwad Edition (QuranicAudio Archive)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Archive",
        sourceName: "QuranicAudio.com",
        sourceUrl: "https://quranicaudio.com/",
        serverBaseUrl: "https://download.quranicaudio.com/quran/abdulbaset_mujawwad/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "نسخة مستقلة على خادم QuranicAudio",
        qualityNoteEn: "Independent high-bitrate QuranicAudio edition",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "al-banna",
    mp3QuranId: 121,
    nameEn: "Sheikh Mahmoud Ali Al-Banna",
    nameAr: "الشيخ محمود علي البنا",
    titleEn: "Eminent Egyptian Reciter of Al-Azhar",
    titleAr: "أحد كبار قراء مصر والأزهر الشريف",
    bioEn:
      "Born in Shobra Bakhum, Menoufia, Egypt (1926–1985); celebrated for disciplined classical Egyptian recitation and founding member of the Reciters Syndicate.",
    bioAr: "وُلد في شبرا بخوم بالمنوفية عام ١٩٢٦م، وأحد أعمدة التلاوة المصرية الأصيلة بمصر والأزهر.",
    countryCode: "EG",
    countryAssociation: {
      birthplaceAr: "المنوفية، مصر",
      birthplaceEn: "Menoufia, Egypt",
    },
    serverBaseUrl: "https://server8.mp3quran.net/bna/",
    recordings: [
      makeEd({
        recordingId: "al-banna-murattal",
        reciterId: "al-banna",
        collectionTitleAr: "المصحف المرتل — حفص عن عاصم",
        collectionTitleEn: "Complete Murattal — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/mahmoud-banna/r1/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة مرتلة",
        qualityNoteEn: "114 Surahs Murattal",
        addedDate: null,
      }),
      makeEd({
        recordingId: "al-banna-mujawwad",
        reciterId: "al-banna",
        collectionTitleAr: "المصحف المجود — حفص عن عاصم",
        collectionTitleEn: "Complete Mujawwad — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Mujawwad",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/mahmoud-banna/r2/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة مجودة",
        qualityNoteEn: "114 Surahs Mujawwad",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "al-tablawi",
    mp3QuranId: 106,
    nameEn: "Sheikh Mohamed Mahmoud Al-Tablawi",
    nameAr: "الشيخ محمد محمود الطبلاوي",
    titleEn: "Former Head of Egyptian Reciters Syndicate",
    titleAr: "نقيب القراء المصريين الأسبق",
    bioEn:
      "Born in Giza, Egypt (1934–2020); renowned across generations for expressive Egyptian Mujawwad and Murattal recitations.",
    bioAr:
      "وُلد في ميت عقبة بالجيزة عام ١٩٣٤م، نقيب القراء المصريين الأسبق وصاحب المدرسة الصوتية المتفردة.",
    countryCode: "EG",
    countryAssociation: {
      birthplaceAr: "الجيزة، مصر",
      birthplaceEn: "Giza, Egypt",
    },
    serverBaseUrl: "https://server12.mp3quran.net/tblawi/",
    recordings: [
      makeEd({
        recordingId: "al-tablawi-murattal",
        reciterId: "al-tablawi",
        collectionTitleAr: "المصحف المرتل — حفص عن عاصم",
        collectionTitleEn: "Complete Murattal — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/muhammad-tablawi/r1/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة مرتلة",
        qualityNoteEn: "114 Surahs Murattal",
        addedDate: null,
      }),
      makeEd({
        recordingId: "al-tablawi-mujawwad",
        reciterId: "al-tablawi",
        collectionTitleAr: "المصحف المجود — حفص عن عاصم",
        collectionTitleEn: "Complete Mujawwad — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Mujawwad",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/muhammad-tablawi/r2/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة مجودة",
        qualityNoteEn: "114 Surahs Mujawwad",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "mustafa-ismail",
    mp3QuranId: 125,
    nameEn: "Sheikh Mustafa Ismail",
    nameAr: "الشيخ مصطفى إسماعيل",
    titleEn: "Master of Egyptian Maqamat & Al-Azhar Reciter",
    titleAr: "سلطان القراء وأحد عباقرة المدرسة المصرية",
    bioEn:
      "Born in Mit Ghazal, Gharbia, Egypt (1905–1978); revered by musicians and Quran scholars alike for unmatched maqam mastery.",
    bioAr:
      "وُلد في ميت غزال بالغربية عام ١٩٠٥م، لُقب بسلطان القراء وتولى التلاوة في الجامع الأزهر لسنوات طويلة.",
    countryCode: "EG",
    countryAssociation: {
      birthplaceAr: "الغربية، مصر",
      birthplaceEn: "Gharbia, Egypt",
    },
    isFeatured: true,
    selectionBasisAr: "من أئمة المدرسة المصرية — متاح مرتلاً ومجوداً",
    selectionBasisEn: "Icon of Egyptian recitation — available in both Murattal and Mujawwad",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/mustafa-ismail/r1/",
    recordings: [
      makeEd({
        recordingId: "mustafa-ismail-murattal",
        reciterId: "mustafa-ismail",
        collectionTitleAr: "المصحف المرتل الكامل — حفص عن عاصم",
        collectionTitleEn: "Complete Murattal — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/mustafa-ismail/r1/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة مرتلة",
        qualityNoteEn: "114 Surahs Murattal",
        addedDate: null,
      }),
      makeEd({
        recordingId: "mustafa-ismail-mujawwad",
        reciterId: "mustafa-ismail",
        collectionTitleAr: "المصحف المجود الكامل — حفص عن عاصم",
        collectionTitleEn: "Complete Mujawwad — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Mujawwad",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/mustafa-ismail/r2/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة مجودة",
        qualityNoteEn: "114 Surahs Mujawwad",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "muhammad-rifaat",
    mp3QuranId: 241,
    nameEn: "Sheikh Muhammad Rifaat",
    nameAr: "الشيخ محمد رفعت",
    titleEn: "Pioneer of Broadcast Quran Recitation in Egypt",
    titleAr: "رائد التلاوة الإذاعية المصرية (قيثارة السماء)",
    bioEn:
      "Born in Cairo (1882–1950); inaugurated the Egyptian Radio Quran broadcast in 1934. Archive contains 31 surviving verified Surahs.",
    bioAr:
      "وُلد بالقاهرة عام ١٨٨٢م وافتتح الإذاعة المصرية بتلاوة القرآن عام ١٩٣٤م. يتوفر له ٣١ سورة أرشيفية محققة في هذا المصدر.",
    countryCode: "EG",
    countryAssociation: {
      birthplaceAr: "القاهرة، مصر",
      birthplaceEn: "Cairo, Egypt",
    },
    isFeatured: true,
    selectionBasisAr: "أرشيف تاريخي نادر — ٣١ سورة محفوظة بأمانة دون نقص أو تزوير",
    selectionBasisEn: "Historic broadcast pioneer — 31 genuinely surviving verified Surahs",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/muhammad-refaat/r1/",
    recordings: [
      makeEd({
        recordingId: "muhammad-rifaat-archive",
        reciterId: "muhammad-rifaat",
        collectionTitleAr: "التسجيلات التاريخية المحفوظة (٣١ سورة متاحة)",
        collectionTitleEn: "Surviving Historic Archive (31 Verified Surahs)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Archive",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/muhammad-refaat/r1/",
        availableSurahIds: [
          1, 10, 11, 12, 17, 18, 19, 20, 48, 54, 55, 56, 69, 72, 73, 75, 76, 77, 78, 79, 81, 82, 83,
          85, 86, 87, 88, 89, 96, 98, 100,
        ],
        qualityNoteAr: "تسجيلات تراثية قديمة — متاح ٣١ سورة فقط حسب الموجود تاريخياً",
        qualityNoteEn:
          "Vintage archival audio — accurately scoped to the 31 verified surviving Surahs",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "ahmad-naina",
    mp3QuranId: 9,
    nameEn: "Sheikh Dr. Ahmad Naina",
    nameAr: "الشيخ د. أحمد نعينع",
    titleEn: "Egyptian Physician & Renowned Reciter",
    titleAr: "القارئ الطبيب وأحد أعلام التلاوة المعاصرين في مصر",
    bioEn:
      "Born in Matobas, Kafr El-Sheikh, Egypt (1954); pediatrician and celebrated master reciter in the classic Egyptian tradition.",
    bioAr:
      "وُلد في مطوبس بكفر الشيخ عام ١٩٥٤م، طبيب أطفال وقارئ مصري بارز على خطى مدرسة التلاوة الكلاسيكية.",
    countryCode: "EG",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/ahmad-naina/r1/",
  }),
  makeProfile({
    id: "abdulbari-mohammad",
    mp3QuranId: 50,
    nameEn: "Sheikh Abdulbari Mohammad",
    nameAr: "الشيخ عبد البارئ محمد",
    titleEn: "Egyptian Reciter & Tajweed Teacher",
    titleAr: "قارئ مصري ومعلم تجويد",
    bioEn:
      "Egyptian reciter known for serene Murattal and a 91-surah instructional Teacher edition.",
    bioAr: "قارئ مصري تميز بالتلاوة التعليمية والمصحف المرتل الكامل.",
    countryCode: "EG",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/abdulbari-muhammad/r1/",
    recordings: [
      makeEd({
        recordingId: "abdulbari-r1",
        reciterId: "abdulbari-mohammad",
        collectionTitleAr: "المصحف المرتل الكامل",
        collectionTitleEn: "Complete Murattal — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/abdulbari-muhammad/r1/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
      makeEd({
        recordingId: "abdulbari-r2",
        reciterId: "abdulbari-mohammad",
        collectionTitleAr: "المصحف المعلم (٩١ سورة)",
        collectionTitleEn: "Teacher Edition (91 Surahs)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Muallim",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/abdulbari-muhammad/r2/",
        availableSurahIds: [1, 3, 5, ...Array.from({ length: 88 }, (_, i) => i + 27)],
        qualityNoteAr: "إصدار تعليمي — ٩١ سورة متاحة",
        qualityNoteEn: "Instructional edition — 91 Surahs verified",
        addedDate: null,
      }),
    ],
  }),

  // ============================================================================
  // 🇰🇼 KUWAIT (Includes Sheikh Ahmed Al-Nafis + Preserves Alafasy + Verified KW Reciters)
  // ============================================================================
  makeProfile({
    id: "ahmad-al-nafis",
    mp3QuranId: 259,
    nameEn: "Sheikh Ahmed Al-Nafis",
    nameAr: "الشيخ أحمد بن عبد العزيز النفيس",
    titleEn: "Kuwaiti Qari & Imam at the Grand Mosque of Kuwait",
    titleAr: "قارئ كويتي وإمام في المسجد الكبير بدولة الكويت",
    bioEn:
      "Born in Kuwait (Feb 8, 1991); graduated in Islamic Law from the Islamic University of Madinah; holds formal Ijazah in Hafs & Shu'bah 'an 'Asim and has led prayers at the Grand Mosque of Kuwait.",
    bioAr:
      "الشيخ أحمد بن عبد العزيز النفيس، قارئ كويتي وُلد في الكويت عام ١٩٩١م، تخرج في كلية الشريعة بالجامعة الإسلامية بالمدينة المنورة، مجاز بروايتي حفص وشعبة عن عاصم، وأمّ المصلين في المسجد الكبير بدولة الكويت.",
    countryCode: "KW",
    countryAssociation: {
      nationalityAr: "كويتي",
      nationalityEn: "Kuwaiti",
      birthplaceAr: "دولة الكويت",
      birthplaceEn: "Kuwait",
      residenceCountryAr: "دولة الكويت",
      residenceCountryEn: "Kuwait",
      classificationNoteAr:
        "مولود في الكويت ويؤم المصلين في المسجد الكبير بالكويت؛ تصنيف كويتي موثق.",
      classificationNoteEn: "Born in Kuwait; verified Kuwaiti national and Imam in Kuwait.",
    },
    isFeatured: true,
    selectionBasisAr: "مضاف حديثاً وموثق: ١١٤ سورة كاملة عبر أرشيف MP3Quran الرسمي (رقم ٢٥٩)",
    selectionBasisEn: "Verified complete 114-Surah Murattal via MP3Quran Official Archive (ID 259)",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/ahmad-nufais/r1/",
    recordings: [
      makeEd({
        recordingId: "ahmad-al-nafis-hafs-r1",
        reciterId: "ahmad-al-nafis",
        collectionTitleAr: "المصحف المرتل الكامل — برواية حفص عن عاصم",
        collectionTitleEn: "Complete Murattal — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/ahmad-nufais/r1/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "بث مباشر موثق لجميع السور (١١٤ سورة) — مصدر MP3Quran",
        qualityNoteEn: "Verified direct MP3 streams for all 114 Surahs via MP3Quran",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "alafasy",
    mp3QuranId: 123,
    qdcId: 7,
    nameEn: "Sheikh Mishary Rashid Alafasy",
    nameAr: "الشيخ مشاري راشد العفاسي",
    titleEn: "Imam of the Grand Mosque of Kuwait & Master of Ten Qira'at",
    titleAr: "إمام المسجد الكبير بدولة الكويت والمجاز بالقراءات العشر",
    bioEn:
      "Born in Kuwait in 1976; studied the Ten Qira'at in Madinah and serves as Imam of the Grand Mosque in Kuwait City.",
    bioAr:
      "وُلد في الكويت عام ١٩٧٦م، تلقى القراءات العشر بالمدينة المنورة، وإمام المسجد الكبير بدولة الكويت.",
    countryCode: "KW",
    countryAssociation: {
      birthplaceAr: "دولة الكويت",
      birthplaceEn: "Kuwait",
    },
    isFeatured: true,
    selectionBasisAr: "إمام المسجد الكبير — ٣ إصدارات تشمل حفص والدوري عن الكسائي",
    selectionBasisEn:
      "Imam of the Grand Mosque of Kuwait — 3 verified archives including Al-Duri 'an Al-Kisa'i",
    serverBaseUrl: "https://server8.mp3quran.net/afs/",
    recordings: [
      makeEd({
        recordingId: "alafasy-hafs",
        reciterId: "alafasy",
        collectionTitleAr: "المصحف المرتل الكامل — حفص عن عاصم (MP3Quran)",
        collectionTitleEn: "Complete Murattal — Hafs 'an 'Asim (MP3Quran)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://server8.mp3quran.net/afs/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
      makeEd({
        recordingId: "alafasy-duri-kisai",
        reciterId: "alafasy",
        collectionTitleAr: "إصدار رواية الدوري عن الكسائي (٦ سور متاحة)",
        collectionTitleEn: "Al-Duri 'an Al-Kisa'i Collection (6 Verified Surahs)",
        riwayahAr: "الدوري عن الكسائي",
        riwayahEn: "Al-Duri 'an Al-Kisa'i",
        style: "Archive",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/mishary-alafasy/r2/",
        availableSurahIds: [12, 14, 25, 87, 97, 99],
        qualityNoteAr: "رواية نادرة — ٦ سور موثقة (يوسف، إبراهيم، الفرقان، الأعلى، القدر، الزلزلة)",
        qualityNoteEn: "Rare Riwayah archive — 6 verified Surahs (12, 14, 25, 87, 97, 99)",
        addedDate: null,
      }),
      makeEd({
        recordingId: "alafasy-qa",
        reciterId: "alafasy",
        collectionTitleAr: "النسخة الأرشيفية الكاملة (QuranicAudio)",
        collectionTitleEn: "QuranicAudio Studio Edition",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        sourceName: "QuranicAudio.com",
        sourceUrl: "https://quranicaudio.com/",
        serverBaseUrl: "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "مصدر أرشيفي ثانٍ ١١٤ سورة",
        qualityNoteEn: "Independent QuranicAudio archive",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "fahad-al-kandari",
    mp3QuranId: 83,
    nameEn: "Sheikh Fahad Al-Kandari",
    nameAr: "الشيخ فهد الكندري",
    titleEn: "Kuwaiti Imam & Grand Mosque Reciter",
    titleAr: "إمام المسجد الكبير بالكويت سابقاً وقارئ معروف",
    bioEn:
      "Kuwaiti reciter and former Imam at the Grand Mosque of Kuwait; 77 Surahs verified on MP3Quran.",
    bioAr:
      "قارئ وإمام كويتي أمّ المصلين بالمسجد الكبير بدولة الكويت. يتوفر له ٧٧ سورة موثقة في هذا المصدر.",
    countryCode: "KW",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/fahad-kandari/r1/",
    recordings: [
      makeEd({
        recordingId: "fahad-kandari-r1",
        reciterId: "fahad-al-kandari",
        collectionTitleAr: "حفص عن عاصم — مرتل (٧٧ سورة متاحة)",
        collectionTitleEn: "Hafs 'an 'Asim — Murattal (77 Verified Surahs)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/fahad-kandari/r1/",
        availableSurahIds: [
          1,
          2,
          6,
          12,
          14,
          17,
          18,
          19,
          22,
          23,
          30,
          31,
          36,
          42,
          ...Array.from({ length: 14 }, (_, i) => 51 + i),
          ...Array.from({ length: 49 }, (_, i) => 66 + i),
        ],
        qualityNoteAr: "٧٧ سورة موثقة في الأرشيف الرسمي",
        qualityNoteEn: "77 Surahs verified in official archive",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "abdullah-al-kandari",
    mp3QuranId: 202,
    nameEn: "Sheikh Abdullah Al-Kandari",
    nameAr: "الشيخ عبد الله الكندري",
    titleEn: "Kuwaiti Imam & Complete Quran Reciter",
    titleAr: "قارئ وإمام كويتي بمصحف مرتل كامل",
    bioEn: "Kuwaiti reciter with a complete 114-surah Hafs 'an 'Asim Mushaf hosted on MP3Quran.",
    bioAr: "قارئ وإمام كويتي سجل المصحف المرتل كاملاً برواية حفص عن عاصم.",
    countryCode: "KW",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/abdullah-kandari/r1/",
  }),
  makeProfile({
    id: "yasser-al-mazroyee",
    mp3QuranId: 95,
    nameEn: "Sheikh Yasser Al-Mazroyee",
    nameAr: "الشيخ ياسر المزروعي",
    titleEn: "Kuwaiti Specialist in Qira'at (Ya'qub Al-Hadrami)",
    titleAr: "قارئ كويتي متخصص في القراءات العشر",
    bioEn:
      "Kuwaiti scholar of Qira'at who recorded a complete 114-surah recitation in Qira'at Ya'qub Al-Hadrami (Ruways & Rawh).",
    bioAr: "قارئ كويتي مجاز سجل ختمة كاملة بقراءة يعقوب الحضرمي بروايتي رويس وروح.",
    countryCode: "KW",
    primaryRiwayahAr: "يعقوب الحضرمي (رويس وروح)",
    primaryRiwayahEn: "Ya'qub Al-Hadrami (Ruways & Rawh)",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/yasser-mazrouei/r1/",
  }),
  makeProfile({
    id: "salah-al-hashim",
    mp3QuranId: 44,
    nameEn: "Sheikh Salah Al-Hashim",
    nameAr: "الشيخ صلاح الهاشم",
    titleEn: "Kuwaiti Imam at the Grand Mosque of Kuwait",
    titleAr: "إمام في المسجد الكبير بدولة الكويت",
    bioEn:
      "Kuwaiti Imam and reciter with a complete Hafs 'an 'Asim Mushaf and a 7-surah Qalun 'an Nafi' collection.",
    bioAr: "قارئ وإمام كويتي له ختمة كاملة برواية حفص ومختارات برواية قالون عن نافع.",
    countryCode: "KW",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/salah-hashim/r1/",
    recordings: [
      makeEd({
        recordingId: "salah-hashim-hafs",
        reciterId: "salah-al-hashim",
        collectionTitleAr: "المصحف المرتل الكامل — حفص عن عاصم",
        collectionTitleEn: "Complete Murattal — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/salah-hashim/r1/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
      makeEd({
        recordingId: "salah-hashim-qalun",
        reciterId: "salah-al-hashim",
        collectionTitleAr: "تلاوات برواية قالون عن نافع (٧ سور)",
        collectionTitleEn: "Qalun 'an Nafi' Selection (7 Surahs)",
        riwayahAr: "قالون عن نافع",
        riwayahEn: "Qalun 'an Nafi'",
        style: "Archive",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/salah-hashim/r2/",
        availableSurahIds: [1, 12, 40, 50, 53, 75, 76],
        qualityNoteAr: "٧ سور موثقة برواية قالون عن نافع",
        qualityNoteEn: "7 Surahs verified in Qalun 'an Nafi'",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "ahmad-al-trabulsi",
    mp3QuranId: 201,
    nameEn: "Sheikh Ahmad Al-Trabulsi",
    nameAr: "الشيخ أحمد الطرابلسي",
    titleEn: "Master Reciter in Kuwait (Born in Beirut)",
    titleAr: "شيخ الإقراء في الكويت (لبناني الأصل، كويتي الجنسية والإقامة)",
    bioEn:
      "Born in Beirut, Lebanon; moved to Kuwait where he acquired Kuwaiti citizenship and led Quran education and major Qira'at recordings.",
    bioAr:
      "وُلد في بيروت بلبنان، وانتقل إلى دولة الكويت وحمل جنسيتها، وسجل مصاحف كاملة متقنة في حفص وقالون.",
    countryCode: "KW",
    countryAssociation: {
      nationalityAr: "كويتي (من مواليد لبنان)",
      nationalityEn: "Kuwaiti (Born in Lebanon)",
      birthplaceAr: "بيروت، لبنان",
      birthplaceEn: "Beirut, Lebanon",
      residenceCountryAr: "دولة الكويت",
      residenceCountryEn: "Kuwait",
      classificationNoteAr:
        "مولود في لبنان ومقيم وحامل للجنسية في دولة الكويت — تم التوضيح التزاماً بدقة التصنيف.",
      classificationNoteEn:
        "Born in Beirut, Lebanon; acquired Kuwaiti citizenship and long-term ministry in Kuwait.",
    },
    serverBaseUrl: "https://cdn.mp3quran.net/audio/ahmad-tarabulsi/r2/",
    recordings: [
      makeEd({
        recordingId: "trabulsi-hafs",
        reciterId: "ahmad-al-trabulsi",
        collectionTitleAr: "المصحف المرتل — حفص عن عاصم",
        collectionTitleEn: "Complete Murattal — Hafs 'an 'Asim",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/ahmad-tarabulsi/r2/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
      makeEd({
        recordingId: "trabulsi-qalun",
        reciterId: "ahmad-al-trabulsi",
        collectionTitleAr: "المصحف المرتل — قالون عن نافع",
        collectionTitleEn: "Complete Murattal — Qalun 'an Nafi'",
        riwayahAr: "قالون عن نافع",
        riwayahEn: "Qalun 'an Nafi'",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/ahmad-tarabulsi/r1/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة برواية قالون",
        qualityNoteEn: "114 Surahs complete in Qalun",
        addedDate: null,
      }),
    ],
  }),

  // ============================================================================
  // 🇯🇴 JORDAN
  // ============================================================================
  makeProfile({
    id: "jamal-shaker-abdullah",
    mp3QuranId: 18,
    nameEn: "Sheikh Jamal Shaker Abdullah",
    nameAr: "الشيخ جمال شاكر عبد الله",
    titleEn: "Jordanian Qari with Complete 114-Surah Murattal",
    titleAr: "قارئ أردني مجاز صاحب مصحف مرتل كامل",
    bioEn:
      "Born in Zarqa, Jordan; recorded a complete 114-surah Murattal Mushaf in Hafs 'an 'Asim.",
    bioAr:
      "وُلد في مدينة الزرقاء بالمملكة الأردنية الهاشمية وسجّل مصحفاً مرتلاً كاملاً برواية حفص عن عاصم.",
    countryCode: "JO",
    countryAssociation: {
      birthplaceAr: "الزرقاء، الأردن",
      birthplaceEn: "Zarqa, Jordan",
    },
    isFeatured: true,
    serverBaseUrl: "https://cdn.mp3quran.net/audio/jamal-abdullah/r1/",
  }),

  // ============================================================================
  // 🇵🇸 PALESTINE
  // ============================================================================
  makeProfile({
    id: "mohammad-rashad-alshareef",
    mp3QuranId: 198,
    nameEn: "Sheikh Mohammad Rashad Al-Shareef",
    nameAr: "الشيخ محمد رشاد الشريف",
    titleEn: "Reciter of Al-Aqsa & Ibrahimi Mosques",
    titleAr: "قارئ المسجد الأقصى المبارك والحرم الإبراهيمي",
    bioEn:
      "Born in Hebron (Al-Khalil), Palestine; historic reciter of Al-Aqsa Mosque and the Ibrahimi Mosque.",
    bioAr:
      "وُلد في مدينة الخليل بفلسطين، وتولى التلاوة في المسجد الأقصى المبارك والمسجد الإبراهيمي.",
    countryCode: "PS",
    countryAssociation: {
      birthplaceAr: "الخليل، فلسطين",
      birthplaceEn: "Hebron, Palestine",
    },
    isFeatured: true,
    serverBaseUrl: "https://cdn.mp3quran.net/audio/muhammad-shareef/r1/",
  }),
  makeProfile({
    id: "muhammad-abu-sneina",
    mp3QuranId: 274,
    nameEn: "Sheikh Muhammad Abu Sneina",
    nameAr: "الشيخ محمد أبو سنينة",
    titleEn: "Palestinian Reciter — Qalun 'an Nafi'",
    titleAr: "قارئ فلسطيني برواية قالون عن نافع",
    bioEn:
      "Associated with the Jerusalem / Hebron scholarly tradition; recorded a complete Mushaf in Qalun 'an Nafi'.",
    bioAr: "قارئ من أسرة مقدسية خليلية عريقة، سجل ختمة كاملة برواية قالون عن نافع.",
    countryCode: "PS",
    primaryRiwayahAr: "قالون عن نافع",
    primaryRiwayahEn: "Qalun 'an Nafi'",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/muhammad-abusnaina/r1/",
  }),

  // ============================================================================
  // 🇶🇦 QATAR
  // ============================================================================
  makeProfile({
    id: "malallah-al-jaber",
    mp3QuranId: 284,
    nameEn: "Sheikh Mal-Allah Abdulrahman Al-Jaber",
    nameAr: "الشيخ مال الله عبد الرحمن الجابر",
    titleEn: "Qatari Qari & Complete Quran Reciter",
    titleAr: "قارئ قطري بمصحف مرتل كامل",
    bioEn:
      "Verified Qatari reciter with a complete 114-surah Murattal recording archived on MP3Quran.",
    bioAr: "قارئ قطري موثق له ختمة كاملة ١١٤ سورة برواية حفص عن عاصم.",
    countryCode: "QA",
    isFeatured: true,
    serverBaseUrl: "https://cdn.mp3quran.net/audio/malallah-jaber/r1/",
  }),

  // ============================================================================
  // 🇦🇪 UNITED ARAB EMIRATES
  // ============================================================================
  makeProfile({
    id: "khalifa-al-tunaiji",
    mp3QuranId: 24,
    nameEn: "Sheikh Khalifa Al-Tunaiji",
    nameAr: "الشيخ خليفة الطنيجي",
    titleEn: "Emirati Qari & Tajweed Authority (Sharjah)",
    titleAr: "القارئ الإماراتي وعضو هيئة القرآن الكريم بالشارقة",
    bioEn:
      "Born in Al-Dhaid, Sharjah, UAE; celebrated internationally for calm, exact articulation and precision.",
    bioAr: "وُلد في الذيد بإمارة الشارقة، عُرف بأدائه الهادئ المتقن ودقته في أحكام التجويد.",
    countryCode: "AE",
    countryAssociation: {
      birthplaceAr: "الشارقة، الإمارات",
      birthplaceEn: "Sharjah, UAE",
    },
    isFeatured: true,
    serverBaseUrl: "https://cdn.mp3quran.net/audio/khalifa-tunaiji/r1/",
  }),

  // ============================================================================
  // 🇴🇲 OMAN
  // ============================================================================
  makeProfile({
    id: "hazza-al-balushi",
    mp3QuranId: 231,
    nameEn: "Sheikh Hazza Al-Balushi",
    nameAr: "الشيخ هزاع البلوشي",
    titleEn: "Omani Reciter (Liwa, Sultanate of Oman)",
    titleAr: "قارئ عُماني (ولاية لوى، سلطنة عُمان)",
    bioEn:
      "Born in Liwa, Oman (1995); widely listened-to contemporary Omani reciter (91 verified Surahs in archive).",
    bioAr:
      "وُلد في ولاية لوى بسلطنة عُمان عام ١٩٩٥م. يتوفر له ٩١ سورة موثقة في الأرشيف الصوتي الرسمي.",
    countryCode: "OM",
    countryAssociation: {
      birthplaceAr: "لوى، سلطنة عُمان",
      birthplaceEn: "Liwa, Oman",
    },
    isFeatured: true,
    serverBaseUrl: "https://cdn.mp3quran.net/audio/hazza-balushi/r1/",
    recordings: [
      makeEd({
        recordingId: "hazza-balushi-r1",
        reciterId: "hazza-al-balushi",
        collectionTitleAr: "حفص عن عاصم — مرتل (٩١ سورة متاحة)",
        collectionTitleEn: "Hafs 'an 'Asim — Murattal (91 Verified Surahs)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/hazza-balushi/r1/",
        availableSurahIds: [
          1,
          6,
          8,
          12,
          13,
          14,
          15,
          17,
          18,
          19,
          20,
          21,
          22,
          25,
          29,
          30,
          31,
          32,
          34,
          35,
          36,
          37,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          46,
          47,
          49,
          50,
          51,
          52,
          53,
          54,
          55,
          56,
          57,
          61,
          63,
          ...Array.from({ length: 48 }, (_, i) => 67 + i),
        ],
        qualityNoteAr: "٩١ سورة موثقة في الأرشيف",
        qualityNoteEn: "91 Surahs verified in archive",
        addedDate: null,
      }),
    ],
  }),

  // ============================================================================
  // 🇾🇪 YEMEN
  // ============================================================================
  makeProfile({
    id: "fares-abbad",
    mp3QuranId: 81,
    nameEn: "Sheikh Fares Abbad",
    nameAr: "الشيخ فارس عباد",
    titleEn: "Renowned Yemeni Reciter (Sana'a)",
    titleAr: "من أشهر قرّاء اليمن (صنعاء)",
    bioEn:
      "Born in Sana'a, Yemen; revered globally for his clear, powerful voice and complete Hafs 'an 'Asim Mushaf.",
    bioAr: "وُلد في صنعاء باليمن، من أشهر القراء بصوته القوي الواضح وخاتم القرآن مرتلاً.",
    countryCode: "YE",
    countryAssociation: {
      birthplaceAr: "صنعاء، اليمن",
      birthplaceEn: "Sana'a, Yemen",
    },
    isFeatured: true,
    serverBaseUrl: "https://cdn.mp3quran.net/audio/fares-abbad/r1/",
  }),
  makeProfile({
    id: "wadee-al-yamani",
    mp3QuranId: 219,
    nameEn: "Sheikh Wadee Al-Yamani",
    nameAr: "الشيخ وديع اليمني",
    titleEn: "Yemeni Reciter & Imam Resident in Kuwait",
    titleAr: "قارئ يمني وإمام مقيم بدولة الكويت",
    bioEn:
      "Yemeni-born Quran reciter who earned Islamic Studies credentials in Yemen and serves as an Imam in Kuwait.",
    bioAr: "وُلد في اليمن ودرس بها، ويعمل إماماً في دولة الكويت. عُرف بصوته المؤثر الخاشع.",
    countryCode: "YE",
    countryAssociation: {
      nationalityAr: "يمني",
      nationalityEn: "Yemeni",
      birthplaceAr: "اليمن",
      birthplaceEn: "Yemen",
      residenceCountryAr: "دولة الكويت (مقر الإمامة)",
      residenceCountryEn: "Kuwait (residence & ministry)",
      classificationNoteAr: "يمني المولد والجنسية ومقيم إماماً في الكويت.",
      classificationNoteEn: "Yemeni national serving as an Imam in Kuwait.",
    },
    serverBaseUrl: "https://cdn.mp3quran.net/audio/wadee-yamani/r1/",
  }),

  // ============================================================================
  // 🇸🇾 SYRIA
  // ============================================================================
  makeProfile({
    id: "ayman-swaid",
    mp3QuranId: 21203,
    nameEn: "Sheikh Dr. Ayman Rushdi Swaid",
    nameAr: "الشيخ د. أيمن رشدي سويد",
    titleEn: "Syrian Scholar of Tajweed & Ten Qira'at (Damascus)",
    titleAr: "عالم التجويد والقراءات العشر السوري الدمشقي",
    bioEn:
      "Born in Damascus, Syria (1955); scholar of Tajweed and canonical Qira'at residing in Saudi Arabia.",
    bioAr:
      "وُلد بدمشق عام ١٩٥٥م، من أبرز علماء التجويد والقراءات المعاصرين، ويقيم حالياً في السعودية.",
    countryCode: "SY",
    countryAssociation: {
      nationalityAr: "سوري",
      nationalityEn: "Syrian",
      birthplaceAr: "دمشق، سوريا",
      birthplaceEn: "Damascus, Syria",
      residenceCountryAr: "المملكة العربية السعودية",
      residenceCountryEn: "Saudi Arabia",
    },
    isFeatured: true,
    selectionBasisAr: "المصحف المعلم المرجعي في التجويد والنطق الدقيق (١١٤ سورة)",
    selectionBasisEn: "Benchmark Teacher Edition for Tajweed learners (114 Surahs)",
    serverBaseUrl: "https://server15.mp3quran.net/a-rushdi/Almusshaf-Al-Mo-lim/",
    recordings: [
      makeEd({
        recordingId: "ayman-swaid-muallim",
        reciterId: "ayman-swaid",
        collectionTitleAr: "المصحف المعلم — حفص عن عاصم (١١٤ سورة)",
        collectionTitleEn: "Teacher Mushaf — Hafs 'an 'Asim (114 Surahs)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Muallim",
        serverBaseUrl: "https://server15.mp3quran.net/a-rushdi/Almusshaf-Al-Mo-lim/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة بأسلوب التعليم والتجويد المنضبط",
        qualityNoteEn: "All 114 Surahs with explicit educational Tajweed clarity",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "yahya-hawwa",
    mp3QuranId: 96,
    nameEn: "Sheikh Yahya Hawwa",
    nameAr: "الشيخ يحيى حوا",
    titleEn: "Syrian Reciter (Hama, Syria)",
    titleAr: "قارئ سوري (حماة، سوريا)",
    bioEn:
      "Born in Hama, Syria (1976); holds Islamic Studies doctorate and a complete verified 114-surah Mushaf.",
    bioAr: "وُلد في مدينة حماة بسوريا عام ١٩٧٦م، حاصل على الدكتوراه وسجّل المصحف كاملاً.",
    countryCode: "SY",
    countryAssociation: { birthplaceAr: "حماة، سوريا", birthplaceEn: "Hama, Syria" },
    serverBaseUrl: "https://cdn.mp3quran.net/audio/yahya-hawwa/r1/",
  }),
  makeProfile({
    id: "abdulhadi-kanakeri",
    mp3QuranId: 70,
    nameEn: "Sheikh Abdulhadi Kanakeri",
    nameAr: "الشيخ عبد الهادي أحمد كناكري",
    titleEn: "Syrian Master of Qira'at & Professor",
    titleAr: "مقرئ سوري وأستاذ جامعي في القراءات",
    bioEn:
      "Syrian reciter specializing in Qira'at with a complete 114-surah recording on MP3Quran.",
    bioAr: "مقرئ سوري متخصص في القراءات القرآنية وصاحب ختمة مرتلة كاملة.",
    countryCode: "SY",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/abdulhadi-kanakeri/r1/",
  }),

  // ============================================================================
  // 🇮🇶 IRAQ
  // ============================================================================
  makeProfile({
    id: "raad-al-kurdi",
    mp3QuranId: 221,
    nameEn: "Sheikh Raad Mohammad Al-Kurdi",
    nameAr: "الشيخ رعد محمد الكردي",
    titleEn: "Iraqi Kurdish Reciter (Kirkuk, Iraq)",
    titleAr: "قارئ عراقي كردي (كركوك، العراق)",
    bioEn:
      "Born in Kirkuk, Kurdistan Region / Iraq (1991); celebrated worldwide for his moving, serene recitation.",
    bioAr: "وُلد في كركوك بالعراق عام ١٩٩١م، واشتهر في العالم الإسلامي بصوته المؤثر الخاشع.",
    countryCode: "IQ",
    countryAssociation: { birthplaceAr: "كركوك، العراق", birthplaceEn: "Kirkuk, Iraq" },
    isFeatured: true,
    serverBaseUrl: "https://cdn.mp3quran.net/audio/raad-kurdi/r1/",
  }),
  makeProfile({
    id: "mustafa-al-azzawi",
    mp3QuranId: 127,
    nameEn: "Sheikh Mustafa Raad Al-Azzawi",
    nameAr: "الشيخ مصطفى رعد العزاوي",
    titleEn: "Iraqi Reciter — Complete 114-Surah Murattal",
    titleAr: "قارئ عراقي — مصحف مرتل كامل",
    bioEn: "Iraqi reciter with a complete 114-surah recording hosted on MP3Quran.",
    bioAr: "قارئ عراقي سجل المصحف المرتل كاملاً برواية حفص عن عاصم.",
    countryCode: "IQ",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/mustafa-azzawi/r1/",
  }),
  makeProfile({
    id: "peshawa-al-kurdi",
    mp3QuranId: 268,
    nameEn: "Sheikh Peshawa Qadr Al-Kurdi",
    nameAr: "الشيخ بيشه وا قادر الكردي",
    titleEn: "Iraqi Kurdish Qari — Complete Murattal",
    titleAr: "قارئ عراقي كردي — مصحف مرتل كامل",
    bioEn: "Iraqi Kurdish reciter featured on MP3Quran with a complete 114-surah Hafs Mushaf.",
    bioAr: "قارئ من إقليم كردستان العراق بمصحف مرتل كامل ١١٤ سورة.",
    countryCode: "IQ",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/peshawa-kurdi/r1/",
  }),

  // ============================================================================
  // 🇲🇦 MOROCCO
  // ============================================================================
  makeProfile({
    id: "omar-al-qazabri",
    mp3QuranId: 80,
    nameEn: "Sheikh Omar Al-Qazabri",
    nameAr: "الشيخ عمر القزابري",
    titleEn: "Imam of Hassan II Mosque, Casablanca",
    titleAr: "إمام مسجد الحسن الثاني بالدار البيضاء",
    bioEn:
      "Moroccan reciter and chief Imam of the Hassan II Mosque in Casablanca; complete Warsh 'an Nafi' Mushaf.",
    bioAr: "قارئ مغربي وإمام مسجد الحسن الثاني بالدار البيضاء، صاحب ختمة شهيرة برواية ورش عن نافع.",
    countryCode: "MA",
    primaryRiwayahAr: "ورش عن نافع",
    primaryRiwayahEn: "Warsh 'an Nafi'",
    isFeatured: true,
    serverBaseUrl: "https://cdn.mp3quran.net/audio/omar-kazabri/r1/",
  }),
  makeProfile({
    id: "aloyoon-al-koshi",
    mp3QuranId: 16,
    nameEn: "Sheikh Al-Ayoun Al-Koshi",
    nameAr: "الشيخ العيون الكوشي",
    titleEn: "Renowned Moroccan Reciter — Warsh 'an Nafi'",
    titleAr: "من أعلام القراء المغاربة برواية ورش عن نافع",
    bioEn:
      "Born in Safi, Morocco; internationally acclaimed master of Moroccan Warsh 'an Nafi' recitation.",
    bioAr: "وُلد بمدينة آسفي في المغرب، من أشهر القراء المغاربة برواية ورش عن نافع.",
    countryCode: "MA",
    countryAssociation: { birthplaceAr: "آسفي، المغرب", birthplaceEn: "Safi, Morocco" },
    primaryRiwayahAr: "ورش عن نافع",
    primaryRiwayahEn: "Warsh 'an Nafi'",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/laayoun-kouchi/r1/",
  }),
  makeProfile({
    id: "abdelmoujib-benkirane",
    mp3QuranId: 21199,
    nameEn: "Sheikh Abdelmoujib Benkirane",
    nameAr: "الشيخ عبد المجيب بنكيران",
    titleEn: "Moroccan Reciter — Warsh 'an Nafi'",
    titleAr: "قارئ مغربي — ورش عن نافع",
    bioEn:
      "Moroccan reciter with a complete 114-surah recording in the Moroccan Warsh 'an Nafi' tradition.",
    bioAr: "قارئ مغربي سجل المصحف المرتل كاملاً برواية ورش عن نافع.",
    countryCode: "MA",
    primaryRiwayahAr: "ورش عن نافع",
    primaryRiwayahEn: "Warsh 'an Nafi'",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/abdelmoujib-benkirane/r1/",
  }),
  makeProfile({
    id: "hicham-lharraz",
    mp3QuranId: 305,
    nameEn: "Sheikh Hicham Lharraz",
    nameAr: "الشيخ هشام الهراز",
    titleEn: "Moroccan Reciter — Warsh 'an Nafi' (113 Surahs)",
    titleAr: "قارئ مغربي — ورش عن نافع (١١٣ سورة)",
    bioEn: "Moroccan Warsh reciter with 113 verified Surahs hosted on MP3Quran.",
    bioAr: "قارئ مغربي متميز برواية ورش عن نافع. يتوفر ١١٣ سورة موثقة في الأرشيف.",
    countryCode: "MA",
    primaryRiwayahAr: "ورش عن نافع",
    primaryRiwayahEn: "Warsh 'an Nafi'",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/hicham-lharraz/r1/",
    recordings: [
      makeEd({
        recordingId: "hicham-lharraz-r1",
        reciterId: "hicham-lharraz",
        collectionTitleAr: "ورش عن نافع — مرتل (١١٣ سورة متاحة)",
        collectionTitleEn: "Warsh 'an Nafi' — Murattal (113 Verified Surahs)",
        riwayahAr: "ورش عن نافع",
        riwayahEn: "Warsh 'an Nafi'",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/hicham-lharraz/r1/",
        availableSurahIds: Array.from({ length: 114 }, (_, i) => i + 1).filter((s) => s !== 33),
        qualityNoteAr: "١١٣ سورة موثقة (السورة ٣٣ غير مدرجة في المصدر)",
        qualityNoteEn: "113 Surahs verified (Surah 33 omitted per source archive)",
        addedDate: null,
      }),
    ],
  }),

  // ============================================================================
  // 🇩🇿 ALGERIA
  // ============================================================================
  makeProfile({
    id: "yassen-al-jazairi",
    mp3QuranId: 14,
    nameEn: "Sheikh Al-Qari Yassen Al-Jazairi",
    nameAr: "الشيخ القارئ ياسين الجزائري",
    titleEn: "Algerian Master of Warsh 'an Nafi'",
    titleAr: "شيخ الإقراء في الجزائر برواية ورش عن نافع",
    bioEn:
      "Born in El Harrach, Algiers; first Algerian reciter to produce a complete studio Warsh 'an Nafi' Mushaf.",
    bioAr: "وُلد في الحراش بالجزائر، يُعد أول قارئ جزائري يسجل مصحفاً كاملاً في الاستوديو برواية ورش.",
    countryCode: "DZ",
    countryAssociation: { birthplaceAr: "الجزائر العاصمة", birthplaceEn: "Algiers, Algeria" },
    primaryRiwayahAr: "ورش عن نافع",
    primaryRiwayahEn: "Warsh 'an Nafi'",
    isFeatured: true,
    serverBaseUrl: "https://cdn.mp3quran.net/audio/yassen-jazairi/r1/",
  }),
  makeProfile({
    id: "rachid-belalya",
    mp3QuranId: 27,
    nameEn: "Sheikh Rachid Belalya",
    nameAr: "الشيخ رشيد بلعالية",
    titleEn: "Algerian Reciter — Warsh & Hafs",
    titleAr: "قارئ جزائري برواية ورش وحفص",
    bioEn:
      "Algerian reciter with a complete 114-surah Warsh 'an Nafi' recording and a 5-surah Hafs recording.",
    bioAr: "قارئ جزائري متقن له مصحف كامل برواية ورش عن نافع ومختارات برواية حفص.",
    countryCode: "DZ",
    primaryRiwayahAr: "ورش عن نافع",
    primaryRiwayahEn: "Warsh 'an Nafi'",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/rachid-belalia/r1/",
    recordings: [
      makeEd({
        recordingId: "belalya-warsh",
        reciterId: "rachid-belalya",
        collectionTitleAr: "المصحف الكامل — ورش عن نافع",
        collectionTitleEn: "Complete Murattal — Warsh 'an Nafi'",
        riwayahAr: "ورش عن نافع",
        riwayahEn: "Warsh 'an Nafi'",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/rachid-belalia/r1/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة برواية ورش",
        qualityNoteEn: "114 Surahs in Warsh 'an Nafi'",
        addedDate: null,
      }),
      makeEd({
        recordingId: "belalya-hafs",
        reciterId: "rachid-belalya",
        collectionTitleAr: "حفص عن عاصم (٥ سور: ٤٦–٥٠)",
        collectionTitleEn: "Hafs 'an 'Asim Selection (5 Surahs: 46–50)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Archive",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/rachid-belalia/r2/",
        availableSurahIds: [46, 47, 48, 49, 50],
        qualityNoteAr: "٥ سور موثقة (الأحقاف–ق)",
        qualityNoteEn: "5 verified Surahs (46–50)",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "abdelaziz-sheim",
    mp3QuranId: 307,
    nameEn: "Sheikh Abdelaziz Sheim",
    nameAr: "الشيخ عبد العزيز سحيم",
    titleEn: "Algerian Warsh Reciter (M'Sila, Algeria)",
    titleAr: "قارئ جزائري برواية ورش (المسيلة، الجزائر)",
    bioEn:
      "Born in M'Sila, Algeria; renowned for melodious Warsh 'an Nafi' recitation across 16 verified archived Surahs.",
    bioAr:
      "وُلد بالمسيلة في الجزائر، اشتهر بصوته الخاشع برواية ورش عن نافع (١٦ سورة موثقة في المصدر).",
    countryCode: "DZ",
    countryAssociation: { birthplaceAr: "المسيلة، الجزائر", birthplaceEn: "M'Sila, Algeria" },
    primaryRiwayahAr: "ورش عن نافع",
    primaryRiwayahEn: "Warsh 'an Nafi'",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/abdelaziz-sheim/r1/",
    recordings: [
      makeEd({
        recordingId: "abdelaziz-sheim-r1",
        reciterId: "abdelaziz-sheim",
        collectionTitleAr: "ورش عن نافع — مختارات موثقة (١٦ سورة)",
        collectionTitleEn: "Warsh 'an Nafi' — Verified Selection (16 Surahs)",
        riwayahAr: "ورش عن نافع",
        riwayahEn: "Warsh 'an Nafi'",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/abdelaziz-sheim/r1/",
        availableSurahIds: [1, 18, 19, 31, 49, 50, 51, 55, 56, 66, 67, 72, 75, 87, 89, 112],
        qualityNoteAr: "١٦ سورة متاحة رسمياً على MP3Quran",
        qualityNoteEn: "16 Surahs verified in official archive",
        addedDate: null,
      }),
    ],
  }),

  // ============================================================================
  // 🇹🇳 TUNISIA
  // ============================================================================
  makeProfile({
    id: "marwan-al-akri",
    mp3QuranId: 237,
    nameEn: "Sheikh Marwan Al-Akri",
    nameAr: "الشيخ مروان العكري",
    titleEn: "Qalun 'an Nafi' Reciter (Tunisia Association)",
    titleAr: "قارئ برواية قالون عن نافع (المدرسة التونسية والمغاربية)",
    bioEn:
      "Complete 114-surah recitation in Qalun 'an Nafi', classified via neutral Associated Country designation without fabricating unconfirmed birthplace records.",
    bioAr:
      "سجّل المصحف كاملاً ١١٤ سورة برواية قالون عن نافع المرتبطة بالتقليد القرآني التونسي والمغاربي.",
    countryCode: "TN",
    countryAssociation: {
      nationalityAr: null,
      nationalityEn: null,
      associatedCountryAr: "تونس (ارتباط بالمدرسة التونسية لقالون)",
      associatedCountryEn: "Associated country: Tunisia (Qalun 'an Nafi' tradition)",
      classificationNoteAr:
        "صُنّف بعبارة «البلد المرتبط» دون الجزم ببيانات مولد غير موثقة في المصادر الأولية.",
      classificationNoteEn:
        "Uses neutral Associated Country designation; birthplace details remain unconfirmed in public archive metadata.",
    },
    primaryRiwayahAr: "قالون عن نافع",
    primaryRiwayahEn: "Qalun 'an Nafi'",
    isFeatured: true,
    serverBaseUrl: "https://cdn.mp3quran.net/audio/marwan-akri/r1/",
  }),

  // ============================================================================
  // 🇱🇾 LIBYA
  // ============================================================================
  makeProfile({
    id: "addokali-al-alim",
    mp3QuranId: 208,
    nameEn: "Sheikh Addokali Mohammad Al-Alim",
    nameAr: "الشيخ الدوكالي محمد العالم",
    titleEn: "Renowned Libyan Reciter & Master of Qalun",
    titleAr: "شيخ الإقراء الليبي برواية قالون عن نافع",
    bioEn:
      "Libyan scholar and reciter celebrated across North Africa for authoritative Qalun 'an Nafi' recitation.",
    bioAr: "من كبار قراء ليبيا وأشهر رواة قالون عن نافع في العالم الإسلامي.",
    countryCode: "LY",
    primaryRiwayahAr: "قالون عن نافع",
    primaryRiwayahEn: "Qalun 'an Nafi'",
    isFeatured: true,
    serverBaseUrl: "https://cdn.mp3quran.net/audio/dokali-alim/r1/",
  }),
  makeProfile({
    id: "muftah-al-saltany",
    mp3QuranId: 129,
    nameEn: "Sheikh Dr. Muftah Al-Saltany",
    nameAr: "الشيخ د. مفتاح السلطني",
    titleEn: "Libyan Physician & Master of Ten Qira'at (Benghazi)",
    titleAr: "الطبيب والمقرئ الليبي الجامع للقراءات العشر",
    bioEn:
      "Born in Benghazi, Libya; nephrologist and master reciter who recorded the complete Quran across rare canonical Riwayat.",
    bioAr:
      "وُلد ببنغازي في ليبيا، طبيب واستشاري كلى، وهو أول قارئ ليبي يوثق القراءات العشر الصغرى والكبرى صوتياً.",
    countryCode: "LY",
    countryAssociation: { birthplaceAr: "بنغازي، ليبيا", birthplaceEn: "Benghazi, Libya" },
    isFeatured: true,
    selectionBasisAr: "٥ إصدارات كاملة: الدوري وأبي عمرو والكسائي وحفص وشعبة وابن ذكوان",
    selectionBasisEn: "5 verified canonical Riwayat collections recorded completely",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/muftah-saltani/r3/",
    recordings: [
      makeEd({
        recordingId: "saltany-hafs",
        reciterId: "muftah-al-saltany",
        collectionTitleAr: "حفص عن عاصم — مرتل (١١٤ سورة)",
        collectionTitleEn: "Hafs 'an 'Asim — Murattal (114 Surahs)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/muftah-saltani/r3/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
      makeEd({
        recordingId: "saltany-duri-abiamr",
        reciterId: "muftah-al-saltany",
        collectionTitleAr: "الدوري عن أبي عمرو — مرتل",
        collectionTitleEn: "Al-Duri 'an Abi Amr — Murattal",
        riwayahAr: "الدوري عن أبي عمرو",
        riwayahEn: "Al-Duri 'an Abi Amr",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/muftah-saltani/r1/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
      makeEd({
        recordingId: "saltany-duri-kisai",
        reciterId: "muftah-al-saltany",
        collectionTitleAr: "الدوري عن الكسائي — مرتل",
        collectionTitleEn: "Al-Duri 'an Al-Kisa'i — Murattal",
        riwayahAr: "الدوري عن الكسائي",
        riwayahEn: "Al-Duri 'an Al-Kisa'i",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/muftah-saltani/r2/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
      makeEd({
        recordingId: "saltany-ibn-dhakwan",
        reciterId: "muftah-al-saltany",
        collectionTitleAr: "ابن ذكوان عن ابن عامر — مرتل",
        collectionTitleEn: "Ibn Dhakwan 'an Ibn 'Amir — Murattal",
        riwayahAr: "ابن ذكوان عن ابن عامر",
        riwayahEn: "Ibn Dhakwan 'an Ibn 'Amir",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/muftah-saltani/r5/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
      makeEd({
        recordingId: "saltany-shubah",
        reciterId: "muftah-al-saltany",
        collectionTitleAr: "شعبة عن عاصم (٧٧ سورة: ١–٧٧)",
        collectionTitleEn: "Shu'bah 'an 'Asim (77 Verified Surahs)",
        riwayahAr: "شعبة عن عاصم",
        riwayahEn: "Shu'bah 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/muftah-saltani/r4/",
        availableSurahIds: Array.from({ length: 77 }, (_, i) => i + 1),
        qualityNoteAr: "السور ١–٧٧ متاحة",
        qualityNoteEn: "Surahs 1–77 verified",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "tareq-daawob",
    mp3QuranId: 212,
    nameEn: "Sheikh Tareq Abdulghani Daawob",
    nameAr: "الشيخ طارق عبد الغني دعوب",
    titleEn: "Libyan Reciter — Qalun 'an Nafi' (Zliten)",
    titleAr: "قارئ ليبي برواية قالون عن نافع (زليتن)",
    bioEn: "Born in Zliten, Libya; recorded a complete 114-surah Mushaf in Qalun 'an Nafi'.",
    bioAr: "وُلد بزليتن في ليبيا وسجل ختمة مرتلة كاملة برواية قالون عن نافع.",
    countryCode: "LY",
    countryAssociation: { birthplaceAr: "زليتن، ليبيا", birthplaceEn: "Zliten, Libya" },
    primaryRiwayahAr: "قالون عن نافع",
    primaryRiwayahEn: "Qalun 'an Nafi'",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/tareq-daawob/r1/",
  }),
  makeProfile({
    id: "ibrahim-kshidan",
    mp3QuranId: 279,
    nameEn: "Sheikh Ibrahim Kshidan",
    nameAr: "الشيخ إبراهيم كشيدان",
    titleEn: "Libyan Reciter — Qalun 'an Nafi'",
    titleAr: "قارئ ليبي برواية قالون عن نافع",
    bioEn: "Libyan Quran reciter with a complete 114-surah Mushaf in Qalun 'an Nafi'.",
    bioAr: "قارئ ليبي سجل المصحف المرتل كاملاً برواية قالون عن نافع.",
    countryCode: "LY",
    primaryRiwayahAr: "قالون عن نافع",
    primaryRiwayahEn: "Qalun 'an Nafi'",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/ibrahim-kshidan/r1/",
  }),

  // ============================================================================
  // 🇸🇩 SUDAN
  // ============================================================================
  makeProfile({
    id: "alzain-ahmad",
    mp3QuranId: 13,
    nameEn: "Sheikh Alzain Mohammad Ahmad",
    nameAr: "الشيخ الزين محمد أحمد",
    titleEn: "Renowned Sudanese Reciter",
    titleAr: "من أشهر قرّاء السودان وإفريقيا",
    bioEn:
      "Prominent Sudanese reciter celebrated for heartfelt, measured Hafs 'an 'Asim recitation.",
    bioAr: "من أبرز قراء جمهورية السودان بصوته الخاشع المتأني في الترتيل.",
    countryCode: "SD",
    isFeatured: true,
    serverBaseUrl: "https://cdn.mp3quran.net/audio/zain-ahmad/r1/",
  }),
  makeProfile({
    id: "noreen-siddiq",
    mp3QuranId: 138,
    nameEn: "Sheikh Noreen Mohammad Siddiq",
    nameAr: "الشيخ نورين محمد صديق",
    titleEn: "Renowned Sudanese Reciter — Al-Duri 'an Abi Amr",
    titleAr: "القارئ السوداني الشهير برواية الدوري عن أبي عمرو",
    bioEn:
      "Late Sudanese reciter (1982–2020) renowned across the Muslim world for his distinctive recitation in Al-Duri 'an Abi Amr.",
    bioAr: "قارئ سوداني (١٩٨٢–٢٠٢٠م) اشتهر عالمياً برواية الدوري عن أبي عمرو.",
    countryCode: "SD",
    primaryRiwayahAr: "الدوري عن أبي عمرو",
    primaryRiwayahEn: "Al-Duri 'an Abi Amr",
    isFeatured: true,
    serverBaseUrl: "https://cdn.mp3quran.net/audio/noreen-siddiq/r1/",
  }),
  makeProfile({
    id: "alfateh-alzubair",
    mp3QuranId: 211,
    nameEn: "Sheikh Alfateh Mohammad Al-Zubair",
    nameAr: "الشيخ الفاتح محمد الزبير",
    titleEn: "Sudanese Qari — Al-Duri 'an Abi Amr",
    titleAr: "قارئ سوداني برواية الدوري عن أبي عمرو",
    bioEn: "Sudanese reciter with a complete 114-surah recording in Al-Duri 'an Abi Amr.",
    bioAr: "قارئ سوداني سجل ختمة كاملة ١١٤ سورة برواية الدوري عن أبي عمرو.",
    countryCode: "SD",
    primaryRiwayahAr: "الدوري عن أبي عمرو",
    primaryRiwayahEn: "Al-Duri 'an Abi Amr",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/fateh-zubair/r1/",
  }),

  // ============================================================================
  // 🇸🇴 SOMALIA
  // ============================================================================
  makeProfile({
    id: "abdulrasheed-soufi",
    mp3QuranId: 64,
    nameEn: "Sheikh Abdulrasheed Ali Sufi",
    nameAr: "الشيخ عبد الرشيد صوفي",
    titleEn: "Somali Master of Ten Qira'at (Imam in Qatar)",
    titleAr: "عالم القراءات الصومالي (إمام وخطيب في قطر)",
    bioEn:
      "Born in Somalia; holds Qatari citizenship and serves as Imam in Doha. Master reciter across Khalaf 'an Hamzah, As-Susi, and Hafs.",
    bioAr:
      "وُلد في الصومال ونشأ في بيت علم بالقراءات، يحمل الجنسية القطرية ويؤم في الدوحة. متوفر بـ ٣ روايات كاملة.",
    countryCode: "SO",
    countryAssociation: {
      nationalityAr: "صومالي المولد / قطري الجنسية",
      nationalityEn: "Somali-born / Qatari citizen",
      birthplaceAr: "بوراو، الصومال",
      birthplaceEn: "Somalia",
      residenceCountryAr: "دولة قطر",
      residenceCountryEn: "Qatar",
      classificationNoteAr: "مرتبط بالصومال مولداً ونشأةً وبقطر جنسيةً وإمامةً.",
      classificationNoteEn:
        "Born & trained in Somalia; holds Qatari citizenship and Imam ministry in Doha.",
    },
    isFeatured: true,
    selectionBasisAr: "٣ ختمات كاملة: خلف عن حمزة، السوسي عن أبي عمرو، وحفص عن عاصم",
    selectionBasisEn: "3 complete 114-Surah editions across Khalaf, As-Susi & Hafs",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r3/",
    recordings: [
      makeEd({
        recordingId: "soufi-hafs",
        reciterId: "abdulrasheed-soufi",
        collectionTitleAr: "حفص عن عاصم — مرتل (١١٤ سورة)",
        collectionTitleEn: "Hafs 'an 'Asim — Murattal (114 Surahs)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r3/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة",
        qualityNoteEn: "114 Surahs complete",
        addedDate: null,
      }),
      makeEd({
        recordingId: "soufi-susi",
        reciterId: "abdulrasheed-soufi",
        collectionTitleAr: "السوسي عن أبي عمرو — مرتل (١١٤ سورة)",
        collectionTitleEn: "As-Susi 'an Abi Amr — Murattal (114 Surahs)",
        riwayahAr: "السوسي عن أبي عمرو",
        riwayahEn: "As-Susi 'an Abi Amr",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r2/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة برواية السوسي",
        qualityNoteEn: "114 Surahs in As-Susi",
        addedDate: null,
      }),
      makeEd({
        recordingId: "soufi-khalaf",
        reciterId: "abdulrasheed-soufi",
        collectionTitleAr: "خلف عن حمزة — مرتل (١١٤ سورة)",
        collectionTitleEn: "Khalaf 'an Hamzah — Murattal (114 Surahs)",
        riwayahAr: "خلف عن حمزة",
        riwayahEn: "Khalaf 'an Hamzah",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r1/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة برواية خلف",
        qualityNoteEn: "114 Surahs in Khalaf 'an Hamzah",
        addedDate: null,
      }),
    ],
  }),

  // ============================================================================
  // 🇲🇱 MALI
  // ============================================================================
  makeProfile({
    id: "issa-sanankoua",
    mp3QuranId: 288,
    nameEn: "Sheikh Issa Omar Sanankoua",
    nameAr: "الشيخ عيسى عمر سناكو",
    titleEn: "West African Reciter (Malian Heritage)",
    titleAr: "قارئ من غرب أفريقيا (التقليد المالي)",
    bioEn:
      "West African reciter associated with Malian scholarly heritage (Sanankoua lineage); complete 114-surah recording on MP3Quran.",
    bioAr: "قارئ من غرب أفريقيا مرتبط بالتراث القرآني المالي، له مصحف كامل ١١٤ سورة.",
    countryCode: "ML",
    countryAssociation: {
      nationalityAr: null,
      nationalityEn: null,
      associatedCountryAr: "مالي (نسبة سناكو وغرب أفريقيا)",
      associatedCountryEn: "Associated country: Mali (West Africa)",
      classificationNoteAr:
        "مرتبط بعائلة سناكو والتقليد المالي في غرب أفريقيا دون الجزم بمحل الميلاد الدقيق.",
      classificationNoteEn: "Associated with Mali via surname and West African Quranic lineage.",
    },
    isFeatured: true,
    serverBaseUrl: "https://cdn.mp3quran.net/audio/issa-sanankoua/r1/",
  }),

  // ============================================================================
  // 🇮🇩 INDONESIA
  // ============================================================================
  makeProfile({
    id: "muammar-za",
    mp3QuranId: 128,
    nameEn: "Sheikh KH Muammar ZA",
    nameAr: "الشيخ معمر الإندونيسي",
    titleEn: "Renowned Indonesian International Qari (8 Surahs Verified)",
    titleAr: "القارئ الإندونيسي الدولي (٨ سور موثقة)",
    bioEn:
      "KH Muammar Zainal Asyikin, born in Pemalang, Central Java, Indonesia (1954); international Tilawah champion. Archive includes 8 verified Surahs.",
    bioAr:
      "الشيخ معمر زين العاشقين، وُلد في جاوة الوسطى بإندونيسيا، بطل دولي في تلاوة القرآن. يتوفر له ٨ سور في الأرشيف الموثق.",
    countryCode: "ID",
    countryAssociation: {
      birthplaceAr: "جاوة الوسطى، إندونيسيا",
      birthplaceEn: "Central Java, Indonesia",
    },
    isFeatured: true,
    serverBaseUrl: "https://cdn.mp3quran.net/audio/muammar-za/r1/",
    recordings: [
      makeEd({
        recordingId: "muammar-za-r1",
        reciterId: "muammar-za",
        collectionTitleAr: "تلاوات مختارة — حفص عن عاصم (٨ سور موثقة)",
        collectionTitleEn: "Verified Selection — Hafs 'an 'Asim (8 Surahs)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/muammar-za/r1/",
        availableSurahIds: [36, 93, 94, 97, 101, 109, 110, 111],
        qualityNoteAr:
          "٨ سور متاحة رسمياً (يس، الضحى، الشرح، القدر، القارعة، الكافرون، النصر، المسد)",
        qualityNoteEn: "8 Surahs verified (36, 93, 94, 97, 101, 109, 110, 111)",
        addedDate: null,
      }),
    ],
  }),

  // ============================================================================
  // 🇲🇾 MALAYSIA
  // ============================================================================
  makeProfile({
    id: "ustaz-zamri",
    mp3QuranId: 154,
    nameEn: "Ustaz Zamri Abdullah",
    nameAr: "الأستاذ زامري عبد الله",
    titleEn: "Malaysian Qari & Educator (7 Verified Surahs)",
    titleAr: "قارئ ومعلّم ماليزي (٧ سور موثقة)",
    bioEn: "Malaysian Quran reciter and educator; 7 verified Surahs available on MP3Quran.",
    bioAr: "قارئ ومعلم للقرآن الكريم من ماليزيا. يتوفر له ٧ سور موثقة في المصدر الرسمي.",
    countryCode: "MY",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/zamri-abdullah/r1/",
    recordings: [
      makeEd({
        recordingId: "zamri-r1",
        reciterId: "ustaz-zamri",
        collectionTitleAr: "مختارات مرتلة — حفص عن عاصم (٧ سور)",
        collectionTitleEn: "Verified Murattal Selection (7 Surahs)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/zamri-abdullah/r1/",
        availableSurahIds: [32, 44, 55, 56, 61, 67, 76],
        qualityNoteAr: "٧ سور موثقة (٣٢، ٤٤، ٥٥، ٥٦، ٦١، ٦٧، ٧٦)",
        qualityNoteEn: "7 Surahs verified (32, 44, 55, 56, 61, 67, 76)",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "abdullah-fahmi",
    mp3QuranId: 189,
    nameEn: "Sheikh Abdullah Fahmi Che Nor",
    nameAr: "الشيخ عبد الله فهمي",
    titleEn: "Malaysian Johan Qari Champion (4 Surahs Verified)",
    titleAr: "بطل تلاوة القرآن الدولي في ماليزيا (٤ سور)",
    bioEn:
      "Malaysian national and international Tilawat champion; 4 verified Surahs archived on MP3Quran.",
    bioAr: "قارئ ماليزي حائز على جوائز التلاوة الوطنية والدولية (٤ سور موثقة).",
    countryCode: "MY",
    isFeatured: true,
    serverBaseUrl: "https://cdn.mp3quran.net/audio/abdullah-fahmi/r1/",
    recordings: [
      makeEd({
        recordingId: "abdullah-fahmi-r1",
        reciterId: "abdullah-fahmi",
        collectionTitleAr: "تلاوة مجودة — حفص عن عاصم (٤ سور)",
        collectionTitleEn: "Verified Selection (4 Surahs)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Mujawwad",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/abdullah-fahmi/r1/",
        availableSurahIds: [1, 36, 53, 75],
        qualityNoteAr: "٤ سور موثقة (١، ٣٦، ٥٣، ٧٥)",
        qualityNoteEn: "4 Surahs verified (1, 36, 53, 75)",
        addedDate: null,
      }),
    ],
  }),
  makeProfile({
    id: "sapinah-mamat",
    mp3QuranId: 185,
    nameEn: "Sapinah Mamat",
    nameAr: "القارئة سابينة مامات",
    titleEn: "Malaysian Qariah Champion (4 Verified Surahs)",
    titleAr: "بطلة التلاوة الدولية في ماليزيا (٤ سور)",
    bioEn:
      "Acclaimed Malaysian female Tilawah champion (Qariah); 4 verified Surahs hosted on MP3Quran.",
    bioAr: "قارئة ماليزية دولية من أعلام مسابقات التلاوة النسائية في جنوب شرق آسيا.",
    countryCode: "MY",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/sapinah-mamat/r1/",
    recordings: [
      makeEd({
        recordingId: "sapinah-mamat-r1",
        reciterId: "sapinah-mamat",
        collectionTitleAr: "تلاوة مختارة (٤ سور: ٣، ١٤، ٢١، ٢٢)",
        collectionTitleEn: "Verified Selection (4 Surahs: 3, 14, 21, 22)",
        riwayahAr: "حفص عن عاصم",
        riwayahEn: "Hafs 'an 'Asim",
        style: "Mujawwad",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/sapinah-mamat/r1/",
        availableSurahIds: [3, 14, 21, 22],
        qualityNoteAr: "٤ سور موثقة (آل عمران، إبراهيم، الأنبياء، الحج)",
        qualityNoteEn: "4 Surahs verified (3, 14, 21, 22)",
        addedDate: null,
      }),
    ],
  }),

  // ============================================================================
  // 🇮🇳 INDIA
  // ============================================================================
  makeProfile({
    id: "mohammed-osman-khan",
    mp3QuranId: 206,
    nameEn: "Sheikh Mohammed Osman Khan",
    nameAr: "الشيخ محمد عثمان خان",
    titleEn: "Indian Quran Reciter & Hadith Scholar",
    titleAr: "قارئ ومحدث هندي بمصحف كامل",
    bioEn:
      "Indian Quran reciter and Hadith teacher at Darul Uloom Deoband with a complete 114-surah Murattal Mushaf.",
    bioAr: "قارئ وعالم حديث هندي له مصحف مرتل كامل ١١٤ سورة برواية حفص عن عاصم.",
    countryCode: "IN",
    isFeatured: true,
    serverBaseUrl: "https://cdn.mp3quran.net/audio/muhammad-khan/r1/",
  }),

  // ============================================================================
  // 🇺🇿 UZBEKISTAN
  // ============================================================================
  makeProfile({
    id: "alijon-qori",
    mp3QuranId: 21196,
    nameEn: "Sheikh Alijon Qori",
    nameAr: "الشيخ عليجان قوري",
    titleEn: "Uzbek Quran Reciter & Scholar (Complete 114-Surah Murattal)",
    titleAr: "قارئ وعالم أوزبكي — مصحف مرتل كامل",
    bioEn:
      "Shayx Alijon qori Fayzulloh; prominent Uzbek Quran scholar and reciter with a complete 114-surah Murattal archive.",
    bioAr: "الشيخ عليجان قوري فيض الله الأوزبكي، قارئ وعالم بارز من أوزبكستان بمصحف كامل ١١٤ سورة.",
    countryCode: "UZ",
    isFeatured: true,
    serverBaseUrl: "https://cdn.mp3quran.net/audio/alijon-hamdan/r1/",
  }),

  // ============================================================================
  // 🇺🇸 UNITED STATES
  // ============================================================================
  makeProfile({
    id: "okasha-kameny",
    mp3QuranId: 272,
    nameEn: "Sheikh Okasha Kameny",
    nameAr: "الشيخ عكاشة كميني",
    titleEn: "US-Based Imam & Master of Ten Qira'at (Raleigh, NC)",
    titleAr: "إمام ومقرئ بالقراءات في الولايات المتحدة (ولاية كارولاينا الشمالية)",
    bioEn:
      "Born in West Africa (Ghana); serves as Imam and Quran educator in Raleigh, North Carolina, USA. Verified recordings in Al-Bazzi (114) & Al-Duri (38).",
    bioAr:
      "من أصول غرب أفريقية ويعمل إماماً ومدرساً للقرآن والقراءات في الولايات المتحدة. له ختمة بالبزي عن ابن كثير و٣٨ سورة بالدوري.",
    countryCode: "US",
    countryAssociation: {
      nationalityAr: null,
      nationalityEn: null,
      birthplaceAr: "غرب أفريقيا (غانا)",
      birthplaceEn: "West Africa (Ghana)",
      residenceCountryAr: "الولايات المتحدة الأمريكية (كارولاينا الشمالية)",
      residenceCountryEn: "United States (Raleigh, NC)",
      associatedCountryAr: "الولايات المتحدة الأمريكية (مقر الإمامة والإقامة)",
      associatedCountryEn: "United States (Residence & Imam Ministry)",
      classificationNoteAr:
        "مولود في غرب أفريقيا ومقيم وإمام في الولايات المتحدة الأمريكية؛ تم التوضيح بدقة.",
      classificationNoteEn:
        "Born in West Africa; verified long-term US-based Imam & Qira'at educator.",
    },
    primaryRiwayahAr: "البزي عن ابن كثير / الدوري عن الكسائي",
    primaryRiwayahEn: "Al-Bazzi 'an Ibn Kathir / Al-Duri 'an Al-Kisa'i",
    isFeatured: true,
    selectionBasisAr: "إصداران موثقان بالقراءات النادرة من الولايات المتحدة",
    selectionBasisEn: "2 rare canonical Qira'at collections from a US-based Imam",
    serverBaseUrl: "https://cdn.mp3quran.net/audio/okasha-kameny/r2/",
    recordings: [
      makeEd({
        recordingId: "okasha-bazzi",
        reciterId: "okasha-kameny",
        collectionTitleAr: "البزي عن ابن كثير — مرتل (١١٤ سورة)",
        collectionTitleEn: "Al-Bazzi 'an Ibn Kathir — Murattal (114 Surahs)",
        riwayahAr: "البزي عن ابن كثير",
        riwayahEn: "Al-Bazzi 'an Ibn Kathir",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/okasha-kameny/r2/",
        availableSurahIds: ALL_114,
        qualityNoteAr: "١١٤ سورة كاملة برواية البزي عن ابن كثير",
        qualityNoteEn: "114 Surahs complete in Al-Bazzi 'an Ibn Kathir",
        addedDate: null,
      }),
      makeEd({
        recordingId: "okasha-duri",
        reciterId: "okasha-kameny",
        collectionTitleAr: "الدوري عن الكسائي — مرتل (٣٨ سورة)",
        collectionTitleEn: "Al-Duri 'an Al-Kisa'i — Murattal (38 Surahs)",
        riwayahAr: "الدوري عن الكسائي",
        riwayahEn: "Al-Duri 'an Al-Kisa'i",
        style: "Murattal",
        serverBaseUrl: "https://cdn.mp3quran.net/audio/okasha-kameny/r1/",
        availableSurahIds: [17, ...Array.from({ length: 37 }, (_, i) => 78 + i)],
        qualityNoteAr: "٣٨ سورة موثقة (الإسراء + عمّ)",
        qualityNoteEn: "38 Surahs verified (Surah 17 + Surahs 78–114)",
        addedDate: null,
      }),
    ],
  }),
];

// ============================================================================
// Pure Search, Normalization & Multi-Recording Resolution Helpers
// ============================================================================

/** Normalizes Arabic & Latin text for forgiving search (strips tashkeel & unifies alef/hamza/taa marbuta). */
export function normalizeReciterSearchText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

export function padGlobalSurahNumber(surahNumber: number): string {
  const clamped = Math.min(114, Math.max(1, Math.round(surahNumber)));
  return String(clamped).padStart(3, "0");
}

export function isSurahAvailableInRecording(
  recording: VerifiedRecordingEdition,
  surahId: number,
): boolean {
  if (recording.availableSurahIds === "all") return surahId >= 1 && surahId <= 114;
  return recording.availableSurahIds.includes(surahId);
}

export function getAvailableSurahsForReciter(reciter: VerifiedReciterProfile): number[] {
  const set = new Set<number>();
  for (const rec of reciter.recordings) {
    if (rec.availableSurahIds === "all") {
      return Array.from({ length: 114 }, (_, i) => i + 1);
    }
    for (const s of rec.availableSurahIds) set.add(s);
  }
  return Array.from(set).sort((a, b) => a - b);
}

export function getRecordingsForReciterSurah(
  reciterId: string,
  surahId: number,
): VerifiedRecordingEdition[] {
  const reciter = getGlobalReciter(reciterId);
  return reciter.recordings.filter((rec) => isSurahAvailableInRecording(rec, surahId));
}

export function getRecordingAudioUrl(
  recording: VerifiedRecordingEdition,
  surahNumber: number,
): string {
  const customUrl = recording.customSurahUrls?.[surahNumber];
  if (customUrl && /^https:\/\//i.test(customUrl)) {
    return customUrl;
  }
  const padded = padGlobalSurahNumber(surahNumber);
  const ext = recording.audioFormat === "m4a" ? "m4a" : "mp3";
  const base = recording.serverBaseUrl.endsWith("/")
    ? recording.serverBaseUrl
    : `${recording.serverBaseUrl}/`;
  return `${base}${padded}.${ext}`;
}

export function getGlobalRecitersByCountry(
  countryCode: GlobalCountryCode,
): VerifiedReciterProfile[] {
  return GLOBAL_RECITERS_DIRECTORY.filter((r) => r.countryCode === countryCode);
}

export function getGlobalReciter(reciterId: string): VerifiedReciterProfile {
  return GLOBAL_RECITERS_DIRECTORY.find((r) => r.id === reciterId) ?? GLOBAL_RECITERS_DIRECTORY[0]!;
}

export function getCountryMeta(countryCode: GlobalCountryCode): ReciterCountryMeta {
  return GLOBAL_COUNTRIES_META.find((c) => c.code === countryCode) ?? GLOBAL_COUNTRIES_META[0]!;
}

export function getCountryReciterCounts(): Record<GlobalCountryCode, number> {
  const counts = {} as Record<GlobalCountryCode, number>;
  for (const c of GLOBAL_COUNTRIES_META) counts[c.code] = 0;
  for (const r of GLOBAL_RECITERS_DIRECTORY) {
    counts[r.countryCode] = (counts[r.countryCode] ?? 0) + 1;
  }
  return counts;
}

export function filterAndSortCountries(query: string): ReciterCountryMeta[] {
  const q = normalizeReciterSearchText(query);
  if (!q) return [...GLOBAL_COUNTRIES_META];
  return GLOBAL_COUNTRIES_META.filter((c) => {
    const haystack = normalizeReciterSearchText(
      `${c.nameAr} ${c.nameEn} ${c.regionAr} ${c.regionEn} ${c.code}`,
    );
    return haystack.includes(q);
  });
}

export function filterAndSortReciters(options: {
  countryCode?: GlobalCountryCode;
  query?: string;
  featuredOnly?: boolean;
  sortBy?: "featured" | "name_ar" | "name_en" | "recordings";
}): VerifiedReciterProfile[] {
  const q = normalizeReciterSearchText(options.query ?? "");
  let list = options.countryCode
    ? GLOBAL_RECITERS_DIRECTORY.filter((r) => r.countryCode === options.countryCode)
    : [...GLOBAL_RECITERS_DIRECTORY];

  if (options.featuredOnly) {
    list = list.filter((r) => r.isFeatured);
  }

  if (q) {
    list = list.filter((r) => {
      const country = getCountryMeta(r.countryCode);
      const recsText = r.recordings
        .map(
          (ed) =>
            `${ed.collectionTitleAr} ${ed.collectionTitleEn} ${ed.riwayahAr} ${ed.riwayahEn} ${ed.sourceName}`,
        )
        .join(" ");
      const haystack = normalizeReciterSearchText(
        `${r.nameAr} ${r.nameEn} ${r.titleAr} ${r.titleEn} ${r.primaryRiwayahAr} ${r.primaryRiwayahEn} ${country.nameAr} ${country.nameEn} ${recsText}`,
      );
      return matchesAllSearchTokens(
        `${r.nameAr} ${r.nameEn} ${r.titleAr} ${r.titleEn} ${r.primaryRiwayahAr} ${r.primaryRiwayahEn} ${country.nameAr} ${country.nameEn} ${recsText}`,
        q,
      );
    });
  }

  const sortMode = options.sortBy ?? "featured";
  return [...list].sort((a, b) => {
    if (sortMode === "name_ar") return a.nameAr.localeCompare(b.nameAr, "ar");
    if (sortMode === "name_en") return a.nameEn.localeCompare(b.nameEn, "en");
    if (sortMode === "recordings") return b.recordings.length - a.recordings.length;
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    return 0;
  });
}

export function matchesAllSearchTokens(haystackRaw: string, queryRaw: string): boolean {
  const haystack = normalizeReciterSearchText(haystackRaw);
  const tokens = normalizeReciterSearchText(queryRaw).split(" ").filter(Boolean);
  if (tokens.length === 0) return true;
  return tokens.every((tok) => haystack.includes(tok));
}

export function getSurahHighlight(
  recording: VerifiedRecordingEdition,
  surahId: number,
): SurahRecordingHighlight | null {
  return recording.surahHighlights?.[surahId] ?? null;
}

export interface SurahFirstReciterGroup {
  reciter: VerifiedReciterProfile;
  recordings: VerifiedRecordingEdition[];
}

/** Surah-first reverse directory lookup: given a Surah (1–114), returns every reciter and all distinct verified recordings available for that Surah. */
export function getRecitersAndRecordingsForSurah(surahId: number): SurahFirstReciterGroup[] {
  const groups: SurahFirstReciterGroup[] = [];
  for (const reciter of GLOBAL_RECITERS_DIRECTORY) {
    const recordings = reciter.recordings.filter((ed) => isSurahAvailableInRecording(ed, surahId));
    if (recordings.length > 0) {
      groups.push({ reciter, recordings });
    }
  }
  return groups;
}

export function formatVerifiedDuration(seconds?: number): string | null {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export interface GlobalRecitationSearchHit {
  type: "country" | "reciter" | "recording" | "surah";
  id: string;
  countryCode?: GlobalCountryCode;
  reciterId?: string;
  recordingId?: string;
  surahId?: number;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
}

export function searchGlobalRecitationDirectory(
  query: string,
  surahsIndex: readonly { id: number; nameAr: string; nameEn: string; versesCount: number }[],
  styleTokensLookup?: (recordingId: string) => string,
): GlobalRecitationSearchHit[] {
  const q = normalizeReciterSearchText(query);
  if (!q) return [];
  const hits: GlobalRecitationSearchHit[] = [];

  for (const c of GLOBAL_COUNTRIES_META) {
    if (matchesAllSearchTokens(`${c.nameAr} ${c.nameEn} ${c.regionAr} ${c.regionEn}`, q)) {
      hits.push({
        type: "country",
        id: `country-${c.code}`,
        countryCode: c.code,
        titleAr: `${c.flagEmoji} ${c.nameAr}`,
        titleEn: `${c.flagEmoji} ${c.nameEn}`,
        subtitleAr: `${getGlobalRecitersByCountry(c.code).length} قراء موثقين`,
        subtitleEn: `${getGlobalRecitersByCountry(c.code).length} verified reciters`,
      });
    }
  }

  for (const r of GLOBAL_RECITERS_DIRECTORY) {
    const c = getCountryMeta(r.countryCode);
    const featuredText = (r.featuredPassages ?? [])
      .map(
        (fp) =>
          `${fp.titleAr} ${fp.titleEn} ${fp.verseArabicExcerpt} ${fp.verseRange} ${fp.noteAr} ${fp.noteEn}`,
      )
      .join(" ");
    if (
      matchesAllSearchTokens(
        `${r.nameAr} ${r.nameEn} ${r.titleAr} ${r.titleEn} ${r.bioAr} ${r.bioEn} ${featuredText}`,
        q,
      )
    ) {
      hits.push({
        type: "reciter",
        id: `reciter-${r.id}`,
        countryCode: r.countryCode,
        reciterId: r.id,
        titleAr: r.nameAr,
        titleEn: r.nameEn,
        subtitleAr: `${c.flagEmoji} ${c.nameAr} · ${r.recordings.length} إصدار`,
        subtitleEn: `${c.flagEmoji} ${c.nameEn} · ${r.recordings.length} edition(s)`,
      });
    }
    for (const ed of r.recordings) {
      const styleExtra = styleTokensLookup ? styleTokensLookup(ed.recordingId) : "";
      const matchedHighlightEntry = ed.surahHighlights
        ? Object.entries(ed.surahHighlights).find(([sIdStr, h]) => {
            const sMeta = surahsIndex.find((s) => s.id === Number(sIdStr));
            const sTokens = `${sMeta?.nameAr ?? ""} ${sMeta?.nameEn ?? ""} ${sIdStr} ${h.verseRange} ${h.verseArabicExcerpt} ${h.noteAr} ${h.noteEn} ${r.nameAr} ${r.nameEn}`;
            return matchesAllSearchTokens(sTokens, q);
          })
        : undefined;
      const highlightTokens = ed.surahHighlights
        ? Object.entries(ed.surahHighlights)
            .map(
              ([sId, h]) =>
                `surah ${sId} ${h.verseRange} ${h.verseArabicExcerpt} ${h.noteAr} ${h.noteEn}`,
            )
            .join(" ")
        : "";
      if (
        matchesAllSearchTokens(
          `${r.nameAr} ${r.nameEn} ${ed.collectionTitleAr} ${ed.collectionTitleEn} ${ed.riwayahAr} ${ed.riwayahEn} ${ed.sourceName} ${ed.style} ${ed.occasionAr ?? ""} ${ed.occasionEn ?? ""} ${ed.verifiedDate ?? ""} ${highlightTokens} ${styleExtra}`,
          q,
        )
      ) {
        const matchedSurahId = matchedHighlightEntry
          ? Number(matchedHighlightEntry[0])
          : ed.availableSurahIds === "all"
            ? 1
            : (ed.availableSurahIds[0] ?? 1);
        const matchedHighlight = matchedHighlightEntry?.[1];
        hits.push({
          type: "recording",
          id: `rec-${r.id}-${ed.recordingId}`,
          countryCode: r.countryCode,
          reciterId: r.id,
          recordingId: ed.recordingId,
          surahId: matchedSurahId,
          titleAr: matchedHighlight
            ? `${ed.collectionTitleAr} (${matchedHighlight.verseRange}) — ${r.nameAr}`
            : `${ed.collectionTitleAr} — ${r.nameAr}`,
          titleEn: matchedHighlight
            ? `${ed.collectionTitleEn} (${matchedHighlight.verseRange}) — ${r.nameEn}`
            : `${ed.collectionTitleEn} — ${r.nameEn}`,
          subtitleAr: matchedHighlight
            ? `${matchedHighlight.verseArabicExcerpt} · ${ed.sourceName}`
            : `${ed.sourceName} · ${ed.style}`,
          subtitleEn: matchedHighlight
            ? `${matchedHighlight.noteEn} · ${ed.sourceName}`
            : `${ed.sourceName} · ${ed.style}`,
        });
      }
    }
  }

  for (const s of surahsIndex) {
    if (matchesAllSearchTokens(`سورة ${s.nameAr} ${s.nameEn} ${s.id}`, q)) {
      hits.push({
        type: "surah",
        id: `surah-${s.id}`,
        surahId: s.id,
        titleAr: `سورة ${s.nameAr} (${s.id})`,
        titleEn: `Surah ${s.nameEn} (${s.id})`,
        subtitleAr: `${s.versesCount} آية — اضغط للاستماع بصوت القارئ النشط`,
        subtitleEn: `${s.versesCount} verses — open with selected reciter`,
      });
    }
  }

  return hits.slice(0, 40);
}

/** Genuine, non-fabricated directory statistics */
export function getDirectorySummaryStats() {
  const totalCountries = GLOBAL_COUNTRIES_META.length;
  const totalReciters = GLOBAL_RECITERS_DIRECTORY.length;
  const totalRecordings = GLOBAL_RECITERS_DIRECTORY.reduce(
    (acc, r) => acc + r.recordings.length,
    0,
  );
  const multiRecordingReciters = GLOBAL_RECITERS_DIRECTORY.filter(
    (r) => r.recordings.length > 1,
  ).length;
  const uniqueSurahStreamsEstimate = GLOBAL_RECITERS_DIRECTORY.reduce(
    (acc, r) =>
      acc +
      r.recordings.reduce(
        (edAcc, ed) => edAcc + (ed.availableSurahIds === "all" ? 114 : ed.availableSurahIds.length),
        0,
      ),
    0,
  );
  return {
    totalCountries,
    totalReciters,
    totalRecordings,
    multiRecordingReciters,
    uniqueSurahStreamsEstimate,
    pendingCountriesCount: DIRECTORY_EXPANSION_STATUS.length,
  };
}

const STORAGE_KEY = "btc_quran_reciter_directory_state_v1";

const DEFAULT_DIR_STATE: DirectoryFavoriteAndHistoryState = {
  favoriteReciterIds: [],
  favoriteRecordingKeys: [],
  listeningHistory: [],
};

export function loadDirectoryUserState(): DirectoryFavoriteAndHistoryState {
  if (typeof window === "undefined") return { ...DEFAULT_DIR_STATE };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DIR_STATE };
    const parsed = JSON.parse(raw) as Partial<DirectoryFavoriteAndHistoryState>;
    return {
      favoriteReciterIds: Array.isArray(parsed.favoriteReciterIds) ? parsed.favoriteReciterIds : [],
      favoriteRecordingKeys: Array.isArray(parsed.favoriteRecordingKeys)
        ? parsed.favoriteRecordingKeys
        : [],
      listeningHistory: Array.isArray(parsed.listeningHistory)
        ? parsed.listeningHistory.slice(0, 30)
        : [],
    };
  } catch {
    return { ...DEFAULT_DIR_STATE };
  }
}

export function saveDirectoryUserState(state: DirectoryFavoriteAndHistoryState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Non-fatal storage quota error
  }
}

export function toggleFavoriteReciterInState(
  prev: DirectoryFavoriteAndHistoryState,
  reciterId: string,
): DirectoryFavoriteAndHistoryState {
  const exists = prev.favoriteReciterIds.includes(reciterId);
  const next: DirectoryFavoriteAndHistoryState = {
    ...prev,
    favoriteReciterIds: exists
      ? prev.favoriteReciterIds.filter((id) => id !== reciterId)
      : [reciterId, ...prev.favoriteReciterIds],
  };
  saveDirectoryUserState(next);
  return next;
}

export function toggleFavoriteRecordingInState(
  prev: DirectoryFavoriteAndHistoryState,
  key: string,
): DirectoryFavoriteAndHistoryState {
  const exists = prev.favoriteRecordingKeys.includes(key);
  const next: DirectoryFavoriteAndHistoryState = {
    ...prev,
    favoriteRecordingKeys: exists
      ? prev.favoriteRecordingKeys.filter((k) => k !== key)
      : [key, ...prev.favoriteRecordingKeys],
  };
  saveDirectoryUserState(next);
  return next;
}

export function recordListeningHistoryEntry(
  prev: DirectoryFavoriteAndHistoryState,
  entry: { reciterId: string; recordingId: string; surahId: number; positionSeconds?: number },
): DirectoryFavoriteAndHistoryState {
  const filtered = prev.listeningHistory.filter(
    (item) =>
      !(
        item.reciterId === entry.reciterId &&
        item.recordingId === entry.recordingId &&
        item.surahId === entry.surahId
      ),
  );
  const next: DirectoryFavoriteAndHistoryState = {
    ...prev,
    listeningHistory: [
      {
        reciterId: entry.reciterId,
        recordingId: entry.recordingId,
        surahId: entry.surahId,
        playedAt: new Date().toISOString(),
        positionSeconds: entry.positionSeconds ?? 0,
      },
      ...filtered,
    ].slice(0, 30),
  };
  saveDirectoryUserState(next);
  return next;
}
