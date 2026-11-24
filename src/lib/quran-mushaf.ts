/**
 * Madinah Mushaf (King Fahd Complex Standard - 604 Pages)
 *
 * Implements:
 * 1. Exact 604-page index mapping (Surah, Juz, Page number).
 * 2. 114 Surah start pages table.
 * 3. 30 Juz start pages table.
 * 4. Page verse fetching with local preloaded cache for offline and instant display.
 * 5. Uthmani text layout with aya end symbols ﴿١﴾.
 */

export interface MushafPageMeta {
  pageNumber: number;
  juzNumber: number;
  hizbNumber: number;
  rubNumber: number;
  surahId: number;
  surahNameAr: string;
  surahNameEn: string;
}

export interface MushafVerseData {
  id: number;
  verseKey: string;
  verseNumber: number;
  surahId: number;
  surahNameAr: string;
  surahNameEn: string;
  revelationPlace: "makkah" | "madinah";
  isFirstVerseOfSurah: boolean;
  textUthmani: string;
  pageNumber: number;
  juzNumber: number;
}

export interface SurahPageEntry {
  id: number;
  nameAr: string;
  nameEn: string;
  startPage: number;
  versesCount: number;
  revelationPlace: "makkah" | "madinah";
}

export interface JuzPageEntry {
  juzNumber: number;
  startPage: number;
  startSurahNameAr: string;
  startVerseKey: string;
}

/**
 * Standard 30 Juz start pages in the 604-page Madinah Mushaf.
 */
export const JUZ_START_PAGES: readonly JuzPageEntry[] = [
  { juzNumber: 1, startPage: 1, startSurahNameAr: "الفاتحة", startVerseKey: "1:1" },
  { juzNumber: 2, startPage: 22, startSurahNameAr: "البقرة", startVerseKey: "2:142" },
  { juzNumber: 3, startPage: 42, startSurahNameAr: "البقرة", startVerseKey: "2:253" },
  { juzNumber: 4, startPage: 62, startSurahNameAr: "آل عمران", startVerseKey: "3:93" },
  { juzNumber: 5, startPage: 82, startSurahNameAr: "النساء", startVerseKey: "4:24" },
  { juzNumber: 6, startPage: 102, startSurahNameAr: "النساء", startVerseKey: "4:148" },
  { juzNumber: 7, startPage: 121, startSurahNameAr: "المائدة", startVerseKey: "5:82" },
  { juzNumber: 8, startPage: 142, startSurahNameAr: "الأنعام", startVerseKey: "6:111" },
  { juzNumber: 9, startPage: 162, startSurahNameAr: "الأعراف", startVerseKey: "7:88" },
  { juzNumber: 10, startPage: 182, startSurahNameAr: "الأنفال", startVerseKey: "8:41" },
  { juzNumber: 11, startPage: 201, startSurahNameAr: "التوبة", startVerseKey: "9:93" },
  { juzNumber: 12, startPage: 222, startSurahNameAr: "هود", startVerseKey: "11:6" },
  { juzNumber: 13, startPage: 242, startSurahNameAr: "يوسف", startVerseKey: "12:53" },
  { juzNumber: 14, startPage: 262, startSurahNameAr: "الحجر", startVerseKey: "15:1" },
  { juzNumber: 15, startPage: 282, startSurahNameAr: "الإسراء", startVerseKey: "17:1" },
  { juzNumber: 16, startPage: 302, startSurahNameAr: "الكهف", startVerseKey: "18:75" },
  { juzNumber: 17, startPage: 322, startSurahNameAr: "الأنبياء", startVerseKey: "21:1" },
  { juzNumber: 18, startPage: 342, startSurahNameAr: "المؤمنون", startVerseKey: "23:1" },
  { juzNumber: 19, startPage: 362, startSurahNameAr: "الفرقان", startVerseKey: "25:21" },
  { juzNumber: 20, startPage: 382, startSurahNameAr: "النمل", startVerseKey: "27:56" },
  { juzNumber: 21, startPage: 402, startSurahNameAr: "العنكبوت", startVerseKey: "29:46" },
  { juzNumber: 22, startPage: 422, startSurahNameAr: "الأحزاب", startVerseKey: "33:31" },
  { juzNumber: 23, startPage: 442, startSurahNameAr: "يس", startVerseKey: "36:28" },
  { juzNumber: 24, startPage: 462, startSurahNameAr: "الزمر", startVerseKey: "39:32" },
  { juzNumber: 25, startPage: 482, startSurahNameAr: "فصلت", startVerseKey: "41:47" },
  { juzNumber: 26, startPage: 502, startSurahNameAr: "الأحقاف", startVerseKey: "46:1" },
  { juzNumber: 27, startPage: 522, startSurahNameAr: "الذاريات", startVerseKey: "51:31" },
  { juzNumber: 28, startPage: 542, startSurahNameAr: "المجادلة", startVerseKey: "58:1" },
  { juzNumber: 29, startPage: 562, startSurahNameAr: "الملك", startVerseKey: "67:1" },
  { juzNumber: 30, startPage: 582, startSurahNameAr: "النبأ", startVerseKey: "78:1" },
] as const;

/**
 * Standard 114 Surahs start pages in the 604-page Madinah Mushaf.
 */
export const SURAHS_INDEX: readonly SurahPageEntry[] = [
  {
    id: 1,
    nameAr: "الفاتحة",
    nameEn: "Al-Fatihah",
    startPage: 1,
    versesCount: 7,
    revelationPlace: "makkah",
  },
  {
    id: 2,
    nameAr: "البقرة",
    nameEn: "Al-Baqarah",
    startPage: 2,
    versesCount: 286,
    revelationPlace: "madinah",
  },
  {
    id: 3,
    nameAr: "آل عمران",
    nameEn: "Ali 'Imran",
    startPage: 50,
    versesCount: 200,
    revelationPlace: "madinah",
  },
  {
    id: 4,
    nameAr: "النساء",
    nameEn: "An-Nisa",
    startPage: 77,
    versesCount: 176,
    revelationPlace: "madinah",
  },
  {
    id: 5,
    nameAr: "المائدة",
    nameEn: "Al-Ma'idah",
    startPage: 106,
    versesCount: 120,
    revelationPlace: "madinah",
  },
  {
    id: 6,
    nameAr: "الأنعام",
    nameEn: "Al-An'am",
    startPage: 128,
    versesCount: 165,
    revelationPlace: "makkah",
  },
  {
    id: 7,
    nameAr: "الأعراف",
    nameEn: "Al-A'raf",
    startPage: 151,
    versesCount: 206,
    revelationPlace: "makkah",
  },
  {
    id: 8,
    nameAr: "الأنفال",
    nameEn: "Al-Anfal",
    startPage: 177,
    versesCount: 75,
    revelationPlace: "madinah",
  },
  {
    id: 9,
    nameAr: "التوبة",
    nameEn: "At-Tawbah",
    startPage: 187,
    versesCount: 129,
    revelationPlace: "madinah",
  },
  {
    id: 10,
    nameAr: "يونس",
    nameEn: "Yunus",
    startPage: 208,
    versesCount: 109,
    revelationPlace: "makkah",
  },
  {
    id: 11,
    nameAr: "هود",
    nameEn: "Hud",
    startPage: 221,
    versesCount: 123,
    revelationPlace: "makkah",
  },
  {
    id: 12,
    nameAr: "يوسف",
    nameEn: "Yusuf",
    startPage: 235,
    versesCount: 111,
    revelationPlace: "makkah",
  },
  {
    id: 13,
    nameAr: "الرعد",
    nameEn: "Ar-Ra'd",
    startPage: 249,
    versesCount: 43,
    revelationPlace: "madinah",
  },
  {
    id: 14,
    nameAr: "إبراهيم",
    nameEn: "Ibrahim",
    startPage: 255,
    versesCount: 52,
    revelationPlace: "makkah",
  },
  {
    id: 15,
    nameAr: "الحجر",
    nameEn: "Al-Hijr",
    startPage: 262,
    versesCount: 99,
    revelationPlace: "makkah",
  },
  {
    id: 16,
    nameAr: "النحل",
    nameEn: "An-Nahl",
    startPage: 267,
    versesCount: 128,
    revelationPlace: "makkah",
  },
  {
    id: 17,
    nameAr: "الإسراء",
    nameEn: "Al-Isra",
    startPage: 282,
    versesCount: 111,
    revelationPlace: "makkah",
  },
  {
    id: 18,
    nameAr: "الكهف",
    nameEn: "Al-Kahf",
    startPage: 293,
    versesCount: 110,
    revelationPlace: "makkah",
  },
  {
    id: 19,
    nameAr: "مريم",
    nameEn: "Maryam",
    startPage: 305,
    versesCount: 98,
    revelationPlace: "makkah",
  },
  {
    id: 20,
    nameAr: "طه",
    nameEn: "Ta-Ha",
    startPage: 312,
    versesCount: 135,
    revelationPlace: "makkah",
  },
  {
    id: 21,
    nameAr: "الأنبياء",
    nameEn: "Al-Anbiya",
    startPage: 322,
    versesCount: 112,
    revelationPlace: "makkah",
  },
  {
    id: 22,
    nameAr: "الحج",
    nameEn: "Al-Hajj",
    startPage: 332,
    versesCount: 78,
    revelationPlace: "madinah",
  },
  {
    id: 23,
    nameAr: "المؤمنون",
    nameEn: "Al-Mu'minun",
    startPage: 342,
    versesCount: 118,
    revelationPlace: "makkah",
  },
  {
    id: 24,
    nameAr: "النور",
    nameEn: "An-Nur",
    startPage: 350,
    versesCount: 64,
    revelationPlace: "madinah",
  },
  {
    id: 25,
    nameAr: "الفرقان",
    nameEn: "Al-Furqan",
    startPage: 359,
    versesCount: 77,
    revelationPlace: "makkah",
  },
  {
    id: 26,
    nameAr: "الشعراء",
    nameEn: "Ash-Shu'ara",
    startPage: 367,
    versesCount: 227,
    revelationPlace: "makkah",
  },
  {
    id: 27,
    nameAr: "النمل",
    nameEn: "An-Naml",
    startPage: 377,
    versesCount: 93,
    revelationPlace: "makkah",
  },
  {
    id: 28,
    nameAr: "القصص",
    nameEn: "Al-Qasas",
    startPage: 385,
    versesCount: 88,
    revelationPlace: "makkah",
  },
  {
    id: 29,
    nameAr: "العنكبوت",
    nameEn: "Al-'Ankabut",
    startPage: 396,
    versesCount: 69,
    revelationPlace: "makkah",
  },
  {
    id: 30,
    nameAr: "الروم",
    nameEn: "Ar-Rum",
    startPage: 404,
    versesCount: 60,
    revelationPlace: "makkah",
  },
  {
    id: 31,
    nameAr: "لقمان",
    nameEn: "Luqman",
    startPage: 411,
    versesCount: 34,
    revelationPlace: "makkah",
  },
  {
    id: 32,
    nameAr: "السجدة",
    nameEn: "As-Sajdah",
    startPage: 415,
    versesCount: 30,
    revelationPlace: "makkah",
  },
  {
    id: 33,
    nameAr: "الأحزاب",
    nameEn: "Al-Ahzab",
    startPage: 418,
    versesCount: 73,
    revelationPlace: "madinah",
  },
  {
    id: 34,
    nameAr: "سبأ",
    nameEn: "Saba",
    startPage: 428,
    versesCount: 54,
    revelationPlace: "makkah",
  },
  {
    id: 35,
    nameAr: "فاطر",
    nameEn: "Fatir",
    startPage: 434,
    versesCount: 45,
    revelationPlace: "makkah",
  },
  {
    id: 36,
    nameAr: "يس",
    nameEn: "Ya-Sin",
    startPage: 440,
    versesCount: 83,
    revelationPlace: "makkah",
  },
  {
    id: 37,
    nameAr: "الصافات",
    nameEn: "As-Saffat",
    startPage: 446,
    versesCount: 182,
    revelationPlace: "makkah",
  },
  {
    id: 38,
    nameAr: "ص",
    nameEn: "Sad",
    startPage: 453,
    versesCount: 88,
    revelationPlace: "makkah",
  },
  {
    id: 39,
    nameAr: "الزمر",
    nameEn: "Az-Zumar",
    startPage: 458,
    versesCount: 75,
    revelationPlace: "makkah",
  },
  {
    id: 40,
    nameAr: "غافر",
    nameEn: "Ghafir",
    startPage: 467,
    versesCount: 85,
    revelationPlace: "makkah",
  },
  {
    id: 41,
    nameAr: "فصلت",
    nameEn: "Fussilat",
    startPage: 477,
    versesCount: 54,
    revelationPlace: "makkah",
  },
  {
    id: 42,
    nameAr: "الشورى",
    nameEn: "Ash-Shura",
    startPage: 483,
    versesCount: 53,
    revelationPlace: "makkah",
  },
  {
    id: 43,
    nameAr: "الزخرف",
    nameEn: "Az-Zukhruf",
    startPage: 489,
    versesCount: 89,
    revelationPlace: "makkah",
  },
  {
    id: 44,
    nameAr: "الدخان",
    nameEn: "Ad-Dukhan",
    startPage: 496,
    versesCount: 59,
    revelationPlace: "makkah",
  },
  {
    id: 45,
    nameAr: "الجاثية",
    nameEn: "Al-Jathiyah",
    startPage: 499,
    versesCount: 37,
    revelationPlace: "makkah",
  },
  {
    id: 46,
    nameAr: "الأحقاف",
    nameEn: "Al-Ahqaf",
    startPage: 502,
    versesCount: 35,
    revelationPlace: "makkah",
  },
  {
    id: 47,
    nameAr: "محمد",
    nameEn: "Muhammad",
    startPage: 507,
    versesCount: 38,
    revelationPlace: "madinah",
  },
  {
    id: 48,
    nameAr: "الفتح",
    nameEn: "Al-Fath",
    startPage: 511,
    versesCount: 29,
    revelationPlace: "madinah",
  },
  {
    id: 49,
    nameAr: "الحجرات",
    nameEn: "Al-Hujurat",
    startPage: 515,
    versesCount: 18,
    revelationPlace: "madinah",
  },
  {
    id: 50,
    nameAr: "ق",
    nameEn: "Qaf",
    startPage: 518,
    versesCount: 45,
    revelationPlace: "makkah",
  },
  {
    id: 51,
    nameAr: "الذاريات",
    nameEn: "Adh-Dhariyat",
    startPage: 520,
    versesCount: 60,
    revelationPlace: "makkah",
  },
  {
    id: 52,
    nameAr: "الطور",
    nameEn: "At-Tur",
    startPage: 523,
    versesCount: 49,
    revelationPlace: "makkah",
  },
  {
    id: 53,
    nameAr: "النجم",
    nameEn: "An-Najm",
    startPage: 526,
    versesCount: 62,
    revelationPlace: "makkah",
  },
  {
    id: 54,
    nameAr: "القمر",
    nameEn: "Al-Qamar",
    startPage: 528,
    versesCount: 55,
    revelationPlace: "makkah",
  },
  {
    id: 55,
    nameAr: "الرحمن",
    nameEn: "Ar-Rahman",
    startPage: 531,
    versesCount: 78,
    revelationPlace: "madinah",
  },
  {
    id: 56,
    nameAr: "الواقعة",
    nameEn: "Al-Waqi'ah",
    startPage: 534,
    versesCount: 96,
    revelationPlace: "makkah",
  },
  {
    id: 57,
    nameAr: "الحديد",
    nameEn: "Al-Hadid",
    startPage: 537,
    versesCount: 29,
    revelationPlace: "madinah",
  },
  {
    id: 58,
    nameAr: "المجادلة",
    nameEn: "Al-Mujadila",
    startPage: 542,
    versesCount: 22,
    revelationPlace: "madinah",
  },
  {
    id: 59,
    nameAr: "الحشر",
    nameEn: "Al-Hashr",
    startPage: 545,
    versesCount: 24,
    revelationPlace: "madinah",
  },
  {
    id: 60,
    nameAr: "الممتحنة",
    nameEn: "Al-Mumtahanah",
    startPage: 549,
    versesCount: 13,
    revelationPlace: "madinah",
  },
  {
    id: 61,
    nameAr: "الصف",
    nameEn: "As-Saff",
    startPage: 551,
    versesCount: 14,
    revelationPlace: "madinah",
  },
  {
    id: 62,
    nameAr: "الجمعة",
    nameEn: "Al-Jumu'ah",
    startPage: 553,
    versesCount: 11,
    revelationPlace: "madinah",
  },
  {
    id: 63,
    nameAr: "المنافقون",
    nameEn: "Al-Munafiqun",
    startPage: 554,
    versesCount: 11,
    revelationPlace: "madinah",
  },
  {
    id: 64,
    nameAr: "التغابن",
    nameEn: "At-Taghabun",
    startPage: 556,
    versesCount: 18,
    revelationPlace: "madinah",
  },
  {
    id: 65,
    nameAr: "الطلاق",
    nameEn: "At-Talaq",
    startPage: 558,
    versesCount: 12,
    revelationPlace: "madinah",
  },
  {
    id: 66,
    nameAr: "التحريم",
    nameEn: "At-Tahrim",
    startPage: 560,
    versesCount: 12,
    revelationPlace: "madinah",
  },
  {
    id: 67,
    nameAr: "الملك",
    nameEn: "Al-Mulk",
    startPage: 562,
    versesCount: 30,
    revelationPlace: "makkah",
  },
  {
    id: 68,
    nameAr: "القلم",
    nameEn: "Al-Qalam",
    startPage: 564,
    versesCount: 52,
    revelationPlace: "makkah",
  },
  {
    id: 69,
    nameAr: "الحاقة",
    nameEn: "Al-Haqqah",
    startPage: 566,
    versesCount: 52,
    revelationPlace: "makkah",
  },
  {
    id: 70,
    nameAr: "المعارج",
    nameEn: "Al-Ma'arij",
    startPage: 568,
    versesCount: 44,
    revelationPlace: "makkah",
  },
  {
    id: 71,
    nameAr: "نوح",
    nameEn: "Nuh",
    startPage: 570,
    versesCount: 28,
    revelationPlace: "makkah",
  },
  {
    id: 72,
    nameAr: "الجن",
    nameEn: "Al-Jinn",
    startPage: 572,
    versesCount: 28,
    revelationPlace: "makkah",
  },
  {
    id: 73,
    nameAr: "المزمل",
    nameEn: "Al-Muzzammil",
    startPage: 574,
    versesCount: 20,
    revelationPlace: "makkah",
  },
  {
    id: 74,
    nameAr: "المدثر",
    nameEn: "Al-Muddaththir",
    startPage: 575,
    versesCount: 56,
    revelationPlace: "makkah",
  },
  {
    id: 75,
    nameAr: "القيامة",
    nameEn: "Al-Qiyamah",
    startPage: 577,
    versesCount: 40,
    revelationPlace: "makkah",
  },
  {
    id: 76,
    nameAr: "الإنسان",
    nameEn: "Al-Insan",
    startPage: 578,
    versesCount: 31,
    revelationPlace: "madinah",
  },
  {
    id: 77,
    nameAr: "المرسلات",
    nameEn: "Al-Mursalat",
    startPage: 580,
    versesCount: 50,
    revelationPlace: "makkah",
  },
  {
    id: 78,
    nameAr: "النبأ",
    nameEn: "An-Naba",
    startPage: 582,
    versesCount: 40,
    revelationPlace: "makkah",
  },
  {
    id: 79,
    nameAr: "النازعات",
    nameEn: "An-Nazi'at",
    startPage: 583,
    versesCount: 46,
    revelationPlace: "makkah",
  },
  {
    id: 80,
    nameAr: "عبس",
    nameEn: "'Abasa",
    startPage: 585,
    versesCount: 42,
    revelationPlace: "makkah",
  },
  {
    id: 81,
    nameAr: "التكوير",
    nameEn: "At-Takwir",
    startPage: 586,
    versesCount: 29,
    revelationPlace: "makkah",
  },
  {
    id: 82,
    nameAr: "الانفطار",
    nameEn: "Al-Infitar",
    startPage: 587,
    versesCount: 19,
    revelationPlace: "makkah",
  },
  {
    id: 83,
    nameAr: "المطففين",
    nameEn: "Al-Mutaffifin",
    startPage: 587,
    versesCount: 36,
    revelationPlace: "makkah",
  },
  {
    id: 84,
    nameAr: "الانشقاق",
    nameEn: "Al-Inshiqaq",
    startPage: 589,
    versesCount: 25,
    revelationPlace: "makkah",
  },
  {
    id: 85,
    nameAr: "البروج",
    nameEn: "Al-Buruj",
    startPage: 590,
    versesCount: 22,
    revelationPlace: "makkah",
  },
  {
    id: 86,
    nameAr: "الطارق",
    nameEn: "At-Tariq",
    startPage: 591,
    versesCount: 17,
    revelationPlace: "makkah",
  },
  {
    id: 87,
    nameAr: "الأعلى",
    nameEn: "Al-A'la",
    startPage: 591,
    versesCount: 19,
    revelationPlace: "makkah",
  },
  {
    id: 88,
    nameAr: "الغاشية",
    nameEn: "Al-Ghashiyah",
    startPage: 592,
    versesCount: 26,
    revelationPlace: "makkah",
  },
  {
    id: 89,
    nameAr: "الفجر",
    nameEn: "Al-Fajr",
    startPage: 593,
    versesCount: 30,
    revelationPlace: "makkah",
  },
  {
    id: 90,
    nameAr: "البلد",
    nameEn: "Al-Balad",
    startPage: 594,
    versesCount: 20,
    revelationPlace: "makkah",
  },
  {
    id: 91,
    nameAr: "الشمس",
    nameEn: "Ash-Shams",
    startPage: 595,
    versesCount: 15,
    revelationPlace: "makkah",
  },
  {
    id: 92,
    nameAr: "الليل",
    nameEn: "Al-Layl",
    startPage: 595,
    versesCount: 21,
    revelationPlace: "makkah",
  },
  {
    id: 93,
    nameAr: "الضحى",
    nameEn: "Ad-Duha",
    startPage: 596,
    versesCount: 11,
    revelationPlace: "makkah",
  },
  {
    id: 94,
    nameAr: "الشرح",
    nameEn: "Ash-Sharh",
    startPage: 596,
    versesCount: 8,
    revelationPlace: "makkah",
  },
  {
    id: 95,
    nameAr: "التين",
    nameEn: "At-Tin",
    startPage: 597,
    versesCount: 8,
    revelationPlace: "makkah",
  },
  {
    id: 96,
    nameAr: "العلق",
    nameEn: "Al-'Alaq",
    startPage: 597,
    versesCount: 19,
    revelationPlace: "makkah",
  },
  {
    id: 97,
    nameAr: "القدر",
    nameEn: "Al-Qadr",
    startPage: 598,
    versesCount: 5,
    revelationPlace: "makkah",
  },
  {
    id: 98,
    nameAr: "البينة",
    nameEn: "Al-Bayyinah",
    startPage: 598,
    versesCount: 8,
    revelationPlace: "madinah",
  },
  {
    id: 99,
    nameAr: "الزلزلة",
    nameEn: "Az-Zalzalah",
    startPage: 599,
    versesCount: 8,
    revelationPlace: "madinah",
  },
  {
    id: 100,
    nameAr: "العاديات",
    nameEn: "Al-'Adiyat",
    startPage: 599,
    versesCount: 11,
    revelationPlace: "makkah",
  },
  {
    id: 101,
    nameAr: "القارعة",
    nameEn: "Al-Qari'ah",
    startPage: 600,
    versesCount: 11,
    revelationPlace: "makkah",
  },
  {
    id: 102,
    nameAr: "التكاثر",
    nameEn: "At-Takathur",
    startPage: 600,
    versesCount: 8,
    revelationPlace: "makkah",
  },
  {
    id: 103,
    nameAr: "العصر",
    nameEn: "Al-'Asr",
    startPage: 601,
    versesCount: 3,
    revelationPlace: "makkah",
  },
  {
    id: 104,
    nameAr: "الهمزة",
    nameEn: "Al-Humazah",
    startPage: 601,
    versesCount: 9,
    revelationPlace: "makkah",
  },
  {
    id: 105,
    nameAr: "الفيل",
    nameEn: "Al-Fil",
    startPage: 601,
    versesCount: 5,
    revelationPlace: "makkah",
  },
  {
    id: 106,
    nameAr: "قريش",
    nameEn: "Quraysh",
    startPage: 602,
    versesCount: 4,
    revelationPlace: "makkah",
  },
  {
    id: 107,
    nameAr: "الماعون",
    nameEn: "Al-Ma'un",
    startPage: 602,
    versesCount: 7,
    revelationPlace: "makkah",
  },
  {
    id: 108,
    nameAr: "الكوثر",
    nameEn: "Al-Kawthar",
    startPage: 602,
    versesCount: 3,
    revelationPlace: "makkah",
  },
  {
    id: 109,
    nameAr: "الكافرون",
    nameEn: "Al-Kafirun",
    startPage: 603,
    versesCount: 6,
    revelationPlace: "makkah",
  },
  {
    id: 110,
    nameAr: "النصر",
    nameEn: "An-Nasr",
    startPage: 603,
    versesCount: 3,
    revelationPlace: "madinah",
  },
  {
    id: 111,
    nameAr: "المسد",
    nameEn: "Al-Masad",
    startPage: 603,
    versesCount: 5,
    revelationPlace: "makkah",
  },
  {
    id: 112,
    nameAr: "الإخلاص",
    nameEn: "Al-Ikhlas",
    startPage: 604,
    versesCount: 4,
    revelationPlace: "makkah",
  },
  {
    id: 113,
    nameAr: "الفلق",
    nameEn: "Al-Falaq",
    startPage: 604,
    versesCount: 5,
    revelationPlace: "makkah",
  },
  {
    id: 114,
    nameAr: "الناس",
    nameEn: "An-Nas",
    startPage: 604,
    versesCount: 6,
    revelationPlace: "makkah",
  },
] as const;

/**
 * Finds the Juz number for any page (1 to 604).
 */
export function getJuzNumberForPage(pageNumber: number): number {
  const p = Math.min(604, Math.max(1, Math.round(pageNumber)));
  for (let i = JUZ_START_PAGES.length - 1; i >= 0; i--) {
    const item = JUZ_START_PAGES[i]!;
    if (p >= item.startPage) {
      return item.juzNumber;
    }
  }
  return 1;
}

/**
 * Finds the primary Surah starting or spanning across this page.
 */
export function getPrimarySurahForPage(pageNumber: number): SurahPageEntry {
  const p = Math.min(604, Math.max(1, Math.round(pageNumber)));
  for (let i = SURAHS_INDEX.length - 1; i >= 0; i--) {
    const s = SURAHS_INDEX[i]!;
    if (p >= s.startPage) {
      return s;
    }
  }
  return SURAHS_INDEX[0]!;
}

/**
 * Returns metadata for a specific Mushaf page.
 */
export function getMushafPageMeta(pageNumber: number): MushafPageMeta {
  const p = Math.min(604, Math.max(1, Math.round(pageNumber)));
  const juz = getJuzNumberForPage(p);
  const surah = getPrimarySurahForPage(p);
  const hizb = Math.floor((juz - 1) * 2) + (p % 10 > 5 ? 2 : 1);
  const rub = (hizb - 1) * 4 + 1;

  return {
    pageNumber: p,
    juzNumber: juz,
    hizbNumber: Math.min(60, Math.max(1, hizb)),
    rubNumber: Math.min(240, Math.max(1, rub)),
    surahId: surah.id,
    surahNameAr: surah.nameAr,
    surahNameEn: surah.nameEn,
  };
}

// Memory cache for fetched pages
const pageVersesCache = new Map<number, MushafVerseData[]>();

/**
 * Curated offline fallback verses for core pages (Page 1 Al-Fatihah, Page 2 Al-Baqarah start, Page 604 Al-Mu'awwidhat).
 */
const PRELOADED_CORE_PAGES: Record<number, MushafVerseData[]> = {
  1: [
    {
      id: 1,
      verseKey: "1:1",
      verseNumber: 1,
      surahId: 1,
      surahNameAr: "الفاتحة",
      surahNameEn: "Al-Fatihah",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: true,
      textUthmani: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
      pageNumber: 1,
      juzNumber: 1,
    },
    {
      id: 2,
      verseKey: "1:2",
      verseNumber: 2,
      surahId: 1,
      surahNameAr: "الفاتحة",
      surahNameEn: "Al-Fatihah",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: false,
      textUthmani: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
      pageNumber: 1,
      juzNumber: 1,
    },
    {
      id: 3,
      verseKey: "1:3",
      verseNumber: 3,
      surahId: 1,
      surahNameAr: "الفاتحة",
      surahNameEn: "Al-Fatihah",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: false,
      textUthmani: "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
      pageNumber: 1,
      juzNumber: 1,
    },
    {
      id: 4,
      verseKey: "1:4",
      verseNumber: 4,
      surahId: 1,
      surahNameAr: "الفاتحة",
      surahNameEn: "Al-Fatihah",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: false,
      textUthmani: "مَـٰلِكِ يَوْمِ ٱلدِّينِ",
      pageNumber: 1,
      juzNumber: 1,
    },
    {
      id: 5,
      verseKey: "1:5",
      verseNumber: 5,
      surahId: 1,
      surahNameAr: "الفاتحة",
      surahNameEn: "Al-Fatihah",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: false,
      textUthmani: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      pageNumber: 1,
      juzNumber: 1,
    },
    {
      id: 6,
      verseKey: "1:6",
      verseNumber: 6,
      surahId: 1,
      surahNameAr: "الفاتحة",
      surahNameEn: "Al-Fatihah",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: false,
      textUthmani: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
      pageNumber: 1,
      juzNumber: 1,
    },
    {
      id: 7,
      verseKey: "1:7",
      verseNumber: 7,
      surahId: 1,
      surahNameAr: "الفاتحة",
      surahNameEn: "Al-Fatihah",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: false,
      textUthmani: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
      pageNumber: 1,
      juzNumber: 1,
    },
  ],
  2: [
    {
      id: 8,
      verseKey: "2:1",
      verseNumber: 1,
      surahId: 2,
      surahNameAr: "البقرة",
      surahNameEn: "Al-Baqarah",
      revelationPlace: "madinah",
      isFirstVerseOfSurah: true,
      textUthmani: "الٓمٓ",
      pageNumber: 2,
      juzNumber: 1,
    },
    {
      id: 9,
      verseKey: "2:2",
      verseNumber: 2,
      surahId: 2,
      surahNameAr: "البقرة",
      surahNameEn: "Al-Baqarah",
      revelationPlace: "madinah",
      isFirstVerseOfSurah: false,
      textUthmani: "ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًۭى لِّلْمُتَّقِينَ",
      pageNumber: 2,
      juzNumber: 1,
    },
    {
      id: 10,
      verseKey: "2:3",
      verseNumber: 3,
      surahId: 2,
      surahNameAr: "البقرة",
      surahNameEn: "Al-Baqarah",
      revelationPlace: "madinah",
      isFirstVerseOfSurah: false,
      textUthmani: "ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَـٰهُمْ يُنفِقُونَ",
      pageNumber: 2,
      juzNumber: 1,
    },
    {
      id: 11,
      verseKey: "2:4",
      verseNumber: 4,
      surahId: 2,
      surahNameAr: "البقرة",
      surahNameEn: "Al-Baqarah",
      revelationPlace: "madinah",
      isFirstVerseOfSurah: false,
      textUthmani: "وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ وَبِٱلْـَٔاخِرَةِ هُمْ يُوقِنُونَ",
      pageNumber: 2,
      juzNumber: 1,
    },
    {
      id: 12,
      verseKey: "2:5",
      verseNumber: 5,
      surahId: 2,
      surahNameAr: "البقرة",
      surahNameEn: "Al-Baqarah",
      revelationPlace: "madinah",
      isFirstVerseOfSurah: false,
      textUthmani: "أُو۟لَـٰٓئِكَ عَلَىٰ هُدًۭى مِّن رَّبِّهِمْ ۖ وَأُو۟لَـٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ",
      pageNumber: 2,
      juzNumber: 1,
    },
  ],
  604: [
    {
      id: 6222,
      verseKey: "112:1",
      verseNumber: 1,
      surahId: 112,
      surahNameAr: "الإخلاص",
      surahNameEn: "Al-Ikhlas",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: true,
      textUthmani: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
      pageNumber: 604,
      juzNumber: 30,
    },
    {
      id: 6223,
      verseKey: "112:2",
      verseNumber: 2,
      surahId: 112,
      surahNameAr: "الإخلاص",
      surahNameEn: "Al-Ikhlas",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: false,
      textUthmani: "ٱللَّهُ ٱلصَّمَدُ",
      pageNumber: 604,
      juzNumber: 30,
    },
    {
      id: 6224,
      verseKey: "112:3",
      verseNumber: 3,
      surahId: 112,
      surahNameAr: "الإخلاص",
      surahNameEn: "Al-Ikhlas",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: false,
      textUthmani: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
      pageNumber: 604,
      juzNumber: 30,
    },
    {
      id: 6225,
      verseKey: "112:4",
      verseNumber: 4,
      surahId: 112,
      surahNameAr: "الإخلاص",
      surahNameEn: "Al-Ikhlas",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: false,
      textUthmani: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
      pageNumber: 604,
      juzNumber: 30,
    },
    {
      id: 6226,
      verseKey: "113:1",
      verseNumber: 1,
      surahId: 113,
      surahNameAr: "الفلق",
      surahNameEn: "Al-Falaq",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: true,
      textUthmani: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ",
      pageNumber: 604,
      juzNumber: 30,
    },
    {
      id: 6227,
      verseKey: "113:2",
      verseNumber: 2,
      surahId: 113,
      surahNameAr: "الفلق",
      surahNameEn: "Al-Falaq",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: false,
      textUthmani: "مِن شَرِّ مَا خَلَقَ",
      pageNumber: 604,
      juzNumber: 30,
    },
    {
      id: 6228,
      verseKey: "113:3",
      verseNumber: 3,
      surahId: 113,
      surahNameAr: "الفلق",
      surahNameEn: "Al-Falaq",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: false,
      textUthmani: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
      pageNumber: 604,
      juzNumber: 30,
    },
    {
      id: 6229,
      verseKey: "113:4",
      verseNumber: 4,
      surahId: 113,
      surahNameAr: "الفلق",
      surahNameEn: "Al-Falaq",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: false,
      textUthmani: "وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ",
      pageNumber: 604,
      juzNumber: 30,
    },
    {
      id: 6230,
      verseKey: "113:5",
      verseNumber: 5,
      surahId: 113,
      surahNameAr: "الفلق",
      surahNameEn: "Al-Falaq",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: false,
      textUthmani: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
      pageNumber: 604,
      juzNumber: 30,
    },
    {
      id: 6231,
      verseKey: "114:1",
      verseNumber: 1,
      surahId: 114,
      surahNameAr: "الناس",
      surahNameEn: "An-Nas",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: true,
      textUthmani: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
      pageNumber: 604,
      juzNumber: 30,
    },
    {
      id: 6232,
      verseKey: "114:2",
      verseNumber: 2,
      surahId: 114,
      surahNameAr: "الناس",
      surahNameEn: "An-Nas",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: false,
      textUthmani: "مَلِكِ ٱلنَّاسِ",
      pageNumber: 604,
      juzNumber: 30,
    },
    {
      id: 6233,
      verseKey: "114:3",
      verseNumber: 3,
      surahId: 114,
      surahNameAr: "الناس",
      surahNameEn: "An-Nas",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: false,
      textUthmani: "إِلَـٰهِ ٱلنَّاسِ",
      pageNumber: 604,
      juzNumber: 30,
    },
    {
      id: 6234,
      verseKey: "114:4",
      verseNumber: 4,
      surahId: 114,
      surahNameAr: "الناس",
      surahNameEn: "An-Nas",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: false,
      textUthmani: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ",
      pageNumber: 604,
      juzNumber: 30,
    },
    {
      id: 6235,
      verseKey: "114:5",
      verseNumber: 5,
      surahId: 114,
      surahNameAr: "الناس",
      surahNameEn: "An-Nas",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: false,
      textUthmani: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ",
      pageNumber: 604,
      juzNumber: 30,
    },
    {
      id: 6236,
      verseKey: "114:6",
      verseNumber: 6,
      surahId: 114,
      surahNameAr: "الناس",
      surahNameEn: "An-Nas",
      revelationPlace: "makkah",
      isFirstVerseOfSurah: false,
      textUthmani: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
      pageNumber: 604,
      juzNumber: 30,
    },
  ],
};

interface QuranComPageVersesResponse {
  verses?: Array<{
    id: number;
    verse_key: string;
    verse_number?: number;
    text_uthmani: string;
    page_number?: number;
    juz_number?: number;
  }>;
}

export class MushafPageUnavailableError extends Error {
  readonly pageNumber: number;

  constructor(pageNumber: number, message?: string) {
    super(
      message ??
        `Unable to load Mushaf page ${pageNumber} while offline. Connect to the internet to fetch this page.`,
    );
    this.name = "MushafPageUnavailableError";
    this.pageNumber = pageNumber;
  }
}

/**
 * Fetches the exact Uthmani verses for any given page in the 604-page Madinah Mushaf.
 */
export async function fetchMushafPageVerses(pageNumber: number): Promise<MushafVerseData[]> {
  const p = Math.min(604, Math.max(1, Math.round(pageNumber)));

  const cached = pageVersesCache.get(p);
  if (cached) return cached;

  if (PRELOADED_CORE_PAGES[p]) {
    pageVersesCache.set(p, PRELOADED_CORE_PAGES[p]!);
    return PRELOADED_CORE_PAGES[p]!;
  }

  try {
    const url = `https://api.quran.com/api/v4/verses/by_page/${p}?words=false&fields=text_uthmani,page_number,juz_number&per_page=50`;
    const res = await fetch(url);
    if (res.ok) {
      const json = (await res.json()) as QuranComPageVersesResponse;
      if (Array.isArray(json.verses) && json.verses.length > 0) {
        const mapped: MushafVerseData[] = json.verses.map((v) => {
          const parts = v.verse_key.split(":");
          const sId = Number(parts[0] || 1);
          const vNum = Number(v.verse_number ?? parts[1] ?? 1);
          const sEntry = SURAHS_INDEX.find((s) => s.id === sId) ?? SURAHS_INDEX[0]!;

          return {
            id: v.id,
            verseKey: v.verse_key,
            verseNumber: vNum,
            surahId: sId,
            surahNameAr: sEntry.nameAr,
            surahNameEn: sEntry.nameEn,
            revelationPlace: sEntry.revelationPlace,
            isFirstVerseOfSurah: vNum === 1,
            textUthmani: v.text_uthmani.trim(),
            pageNumber: p,
            juzNumber: v.juz_number ?? getJuzNumberForPage(p),
          };
        });

        pageVersesCache.set(p, mapped);
        return mapped;
      }
    }
  } catch {
    /* fallback to AlQuran Cloud */
  }

  // Fallback: alquran.cloud /v1/page/{pageNumber}/quran-uthmani
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/page/${p}/quran-uthmani`);
    if (res.ok) {
      const json = await res.json();
      const ayahs = json.data?.ayahs;
      if (Array.isArray(ayahs) && ayahs.length > 0) {
        const mapped: MushafVerseData[] = ayahs.map(
          (a: {
            number?: number;
            numberInSurah?: number;
            text?: string;
            juz?: number;
            surah?: { number?: number; name?: string; englishName?: string };
          }) => {
            const sId = Number(a.surah?.number ?? 1);
            const vNum = Number(a.numberInSurah ?? 1);
            const sEntry = SURAHS_INDEX.find((s) => s.id === sId) ?? SURAHS_INDEX[0]!;

            return {
              id: Number(a.number),
              verseKey: `${sId}:${vNum}`,
              verseNumber: vNum,
              surahId: sId,
              surahNameAr: a.surah?.name ?? sEntry.nameAr,
              surahNameEn: a.surah?.englishName ?? sEntry.nameEn,
              revelationPlace: sEntry.revelationPlace,
              isFirstVerseOfSurah: vNum === 1,
              textUthmani: String(a.text).trim(),
              pageNumber: p,
              juzNumber: Number(a.juz ?? getJuzNumberForPage(p)),
            };
          },
        );

        pageVersesCache.set(p, mapped);
        return mapped;
      }
    }
  } catch {
    /* handled below with explicit unavailable error */
  }

  throw new MushafPageUnavailableError(p);
}
