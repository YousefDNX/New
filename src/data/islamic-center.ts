/**
 * ISLAMIC CENTER DATA & VERIFIED RELIGIOUS REFERENCES
 *
 * Strict Authentic Knowledge Preservation Rules:
 * - Authentic Uthmani text & verified classical Hadith collections only.
 * - Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Jami` at-Tirmidhi, Hisn al-Muslim.
 * - No AI-generated verses, no fabricated hadith, no synthetic recitations.
 * - Prayer calculation uses standard astronomical solar algorithms.
 */

import { COMPLETE_99_NAMES_OF_ALLAH, type NameOfAllah } from "./names-of-allah-99";
import { COMPLETE_NAWAWI_FORTY_HADITHS, type HadithRecord } from "./nawawi-forty";
export { COMPLETE_99_NAMES_OF_ALLAH, COMPLETE_NAWAWI_FORTY_HADITHS };
export type { NameOfAllah, HadithRecord };
export const VERIFIED_NAMES_OF_ALLAH: NameOfAllah[] = COMPLETE_99_NAMES_OF_ALLAH;
export const NAMES_OF_ALLAH_99: NameOfAllah[] = COMPLETE_99_NAMES_OF_ALLAH;
export const VERIFIED_HADITH_LIBRARY: HadithRecord[] = COMPLETE_NAWAWI_FORTY_HADITHS;
export const NAWAWI_FORTY_HADITHS: HadithRecord[] = COMPLETE_NAWAWI_FORTY_HADITHS;

export interface PrayerTimeCity {
  id: string;
  nameEn: string;
  nameAr: string;
  countryEn: string;
  countryAr: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: number; // UTC offset in hours
  defaultMethod: PrayerCalculationMethodKey;
}

export type PrayerCalculationMethodKey =
  "kuwait" | "makkah" | "egypt" | "mwl" | "isna" | "gulf" | "karachi";

export interface PrayerCalculationMethod {
  id: PrayerCalculationMethodKey;
  nameEn: string;
  nameAr: string;
  fajrAngle: number;
  ishaAngle: number;
  ishaIntervalMinutes?: number;
  descriptionEn: string;
  descriptionAr: string;
}

export const PRAYER_CALCULATION_METHODS: Record<
  PrayerCalculationMethodKey,
  PrayerCalculationMethod
> = {
  kuwait: {
    id: "kuwait",
    nameEn: "Kuwait (Ministry of Awqaf)",
    nameAr: "الكويت (وزارة الأوقاف والشؤون الإسلامية)",
    fajrAngle: 18.0,
    ishaAngle: 17.5,
    descriptionEn: "Official Ministry of Awqaf & Islamic Affairs standard (Fajr 18°, Isha 17.5°)",
    descriptionAr: "معتمد وزارة الأوقاف والشؤون الإسلامية بدولة الكويت (الفجر 18°، العشاء 17.5°)",
  },
  makkah: {
    id: "makkah",
    nameEn: "Umm Al-Qura University, Makkah",
    nameAr: "جامعة أم القرى، مكة المكرمة",
    fajrAngle: 18.5,
    ishaAngle: 0,
    ishaIntervalMinutes: 90,
    descriptionEn: "Fajr 18.5°, Isha 90 minutes after Maghrib (120 min during Ramadan)",
    descriptionAr: "الفجر 18.5°، العشاء بعد 90 دقيقة من المغرب (120 دقيقة في رمضان)",
  },
  egypt: {
    id: "egypt",
    nameEn: "Egyptian General Authority of Survey",
    nameAr: "الهيئة المصرية العامة للمساحة",
    fajrAngle: 19.5,
    ishaAngle: 17.5,
    descriptionEn: "Fajr 19.5°, Isha 17.5° (Used widely in Egypt, Levant, and North Africa)",
    descriptionAr: "الفجر 19.5°، العشاء 17.5° (معتمد في مصر وبلاد الشام وشمال أفريقيا)",
  },
  mwl: {
    id: "mwl",
    nameEn: "Muslim World League (MWL)",
    nameAr: "رابطة العالم الإسلامي",
    fajrAngle: 18.0,
    ishaAngle: 17.0,
    descriptionEn: "Fajr 18°, Isha 17° (International baseline for Europe and general regions)",
    descriptionAr: "الفجر 18°، العشاء 17° (المعيار الدولي المعتمد في أوروبا والمناطق العامة)",
  },
  isna: {
    id: "isna",
    nameEn: "Islamic Society of North America (ISNA)",
    nameAr: "الجمعية الإسلامية لأمريكا الشمالية",
    fajrAngle: 15.0,
    ishaAngle: 15.0,
    descriptionEn: "Fajr 15°, Isha 15° (Optimized for North American latitudes)",
    descriptionAr: "الفجر 15°، العشاء 15° (ملائم لخطوط العرض في أمريكا الشمالية)",
  },
  gulf: {
    id: "gulf",
    nameEn: "Gulf Region / UAE / Qatar",
    nameAr: "منطقة الخليج العربي / الإمارات / قطر",
    fajrAngle: 18.5,
    ishaAngle: 0,
    ishaIntervalMinutes: 90,
    descriptionEn: "Fajr 18.5°, Isha 90 minutes after Maghrib",
    descriptionAr: "الفجر 18.5°، العشاء بعد 90 دقيقة من المغرب",
  },
  karachi: {
    id: "karachi",
    nameEn: "University of Islamic Sciences, Karachi",
    nameAr: "جامعة العلوم الإسلامية بكراتشي",
    fajrAngle: 18.0,
    ishaAngle: 18.0,
    descriptionEn: "Fajr 18°, Isha 18° (Used in Pakistan, India, Bangladesh, and Afghanistan)",
    descriptionAr: "الفجر 18°، العشاء 18° (معتمد في باكستان والهند وبنغلاديش وأفغانستان)",
  },
};

export interface PrayerCountryGroup {
  countryCode: string;
  nameAr: string;
  nameEn: string;
  flag: string;
  defaultCityId: string;
  defaultMethod: PrayerCalculationMethodKey;
}

export const PRAYER_COUNTRIES: readonly PrayerCountryGroup[] = [
  {
    countryCode: "KW",
    nameAr: "الكويت",
    nameEn: "Kuwait",
    flag: "🇰🇼",
    defaultCityId: "kw_kuwait",
    defaultMethod: "kuwait",
  },
  {
    countryCode: "EG",
    nameAr: "مصر",
    nameEn: "Egypt",
    flag: "🇪🇬",
    defaultCityId: "eg_cairo",
    defaultMethod: "egypt",
  },
  {
    countryCode: "SA",
    nameAr: "المملكة العربية السعودية",
    nameEn: "Saudi Arabia",
    flag: "🇸🇦",
    defaultCityId: "sa_makkah",
    defaultMethod: "makkah",
  },
  {
    countryCode: "ALL",
    nameAr: "سائر الدول والعواصم",
    nameEn: "Other International Cities",
    flag: "🌍",
    defaultCityId: "kw_kuwait",
    defaultMethod: "kuwait",
  },
] as const;

export const VERIFIED_PRAYER_CITIES: PrayerTimeCity[] = [
  // --- KUWAIT 🇰🇼 (وزارة الأوقاف والشؤون الإسلامية بدولة الكويت) ---
  {
    id: "kw_kuwait",
    nameEn: "Kuwait City",
    nameAr: "مدينة الكويت",
    countryEn: "Kuwait",
    countryAr: "الكويت",
    countryCode: "KW",
    latitude: 29.3759,
    longitude: 47.9774,
    timezone: 3,
    defaultMethod: "kuwait",
  },
  {
    id: "kw_hawalli",
    nameEn: "Hawalli",
    nameAr: "حولي",
    countryEn: "Kuwait",
    countryAr: "الكويت",
    countryCode: "KW",
    latitude: 29.3328,
    longitude: 48.0289,
    timezone: 3,
    defaultMethod: "kuwait",
  },
  {
    id: "kw_ahmadi",
    nameEn: "Al Ahmadi",
    nameAr: "الأحمدي",
    countryEn: "Kuwait",
    countryAr: "الكويت",
    countryCode: "KW",
    latitude: 29.0769,
    longitude: 48.0839,
    timezone: 3,
    defaultMethod: "kuwait",
  },
  {
    id: "kw_farwaniya",
    nameEn: "Al Farwaniyah",
    nameAr: "الفروانية",
    countryEn: "Kuwait",
    countryAr: "الكويت",
    countryCode: "KW",
    latitude: 29.2778,
    longitude: 47.9589,
    timezone: 3,
    defaultMethod: "kuwait",
  },
  {
    id: "kw_jahra",
    nameEn: "Al Jahra",
    nameAr: "الجهراء",
    countryEn: "Kuwait",
    countryAr: "الكويت",
    countryCode: "KW",
    latitude: 29.3375,
    longitude: 47.6581,
    timezone: 3,
    defaultMethod: "kuwait",
  },
  {
    id: "kw_mubarak",
    nameEn: "Mubarak Al-Kabeer",
    nameAr: "مبارك الكبير",
    countryEn: "Kuwait",
    countryAr: "الكويت",
    countryCode: "KW",
    latitude: 29.2081,
    longitude: 48.0772,
    timezone: 3,
    defaultMethod: "kuwait",
  },

  // --- EGYPT 🇪🇬 (الهيئة المصرية العامة للمساحة) ---
  {
    id: "eg_cairo",
    nameEn: "Cairo",
    nameAr: "القاهرة",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 30.0444,
    longitude: 31.2357,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_giza",
    nameEn: "Giza",
    nameAr: "الجيزة",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 30.0131,
    longitude: 31.2089,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_alexandria",
    nameEn: "Alexandria",
    nameAr: "الإسكندرية",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 31.2001,
    longitude: 29.9187,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_mansoura",
    nameEn: "Mansoura (Dakahlia)",
    nameAr: "المنصورة (الدقهلية)",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 31.0409,
    longitude: 31.3785,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_tanta",
    nameEn: "Tanta (Gharbia)",
    nameAr: "طنطا (الغربية)",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 30.7865,
    longitude: 31.0004,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_portsaid",
    nameEn: "Port Said",
    nameAr: "بورسعيد",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 31.2653,
    longitude: 32.3019,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_ismailia",
    nameEn: "Ismailia",
    nameAr: "الإسماعيلية",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 30.5965,
    longitude: 32.2715,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_suez",
    nameEn: "Suez",
    nameAr: "السويس",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 29.9668,
    longitude: 32.5498,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_aswan",
    nameEn: "Aswan",
    nameAr: "أسوان",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 24.0889,
    longitude: 32.8998,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_luxor",
    nameEn: "Luxor",
    nameAr: "الأقصر",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 25.6872,
    longitude: 32.6396,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_asyut",
    nameEn: "Asyut",
    nameAr: "أسيوط",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 27.1801,
    longitude: 31.1837,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_sohag",
    nameEn: "Sohag",
    nameAr: "سوهاج",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 26.5569,
    longitude: 31.6948,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_qena",
    nameEn: "Qena",
    nameAr: "قنا",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 26.1551,
    longitude: 32.716,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_faiyum",
    nameEn: "Faiyum",
    nameAr: "الفيوم",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 29.3084,
    longitude: 30.8428,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_zagazig",
    nameEn: "Zagazig (Sharqia)",
    nameAr: "الزقازيق (الشرقية)",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 30.5765,
    longitude: 31.5041,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_shibin",
    nameEn: "Shibin El Kom (Monufia)",
    nameAr: "شبين الكوم (المنوفية)",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 30.5568,
    longitude: 31.0089,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_banha",
    nameEn: "Banha (Qalyubia)",
    nameAr: "بنها (القليوبية)",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 30.466,
    longitude: 31.1856,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_kafr_elsheikh",
    nameEn: "Kafr El Sheikh",
    nameAr: "كفر الشيخ",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 31.1107,
    longitude: 30.9388,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_damanhur",
    nameEn: "Damanhur (Beheira)",
    nameAr: "دمنهور (البحيرة)",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 31.0425,
    longitude: 30.4689,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_hurghada",
    nameEn: "Hurghada (Red Sea)",
    nameAr: "الغردقة (البحر الأحمر)",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 27.2579,
    longitude: 33.8116,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_sharm",
    nameEn: "Sharm El Sheikh (South Sinai)",
    nameAr: "شرم الشيخ (جنوب سيناء)",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 27.9158,
    longitude: 34.3299,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_matruh",
    nameEn: "Marsa Matruh",
    nameAr: "مرسى مطروح",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 31.3543,
    longitude: 27.2373,
    timezone: 2,
    defaultMethod: "egypt",
  },
  {
    id: "eg_arish",
    nameEn: "Arish (North Sinai)",
    nameAr: "العريش (شمال سيناء)",
    countryEn: "Egypt",
    countryAr: "مصر",
    countryCode: "EG",
    latitude: 31.1316,
    longitude: 33.8034,
    timezone: 2,
    defaultMethod: "egypt",
  },

  // --- SAUDI ARABIA 🇸🇦 (جامعة أم القرى بمكة المكرمة) ---
  {
    id: "sa_makkah",
    nameEn: "Mecca",
    nameAr: "مكة المكرمة",
    countryEn: "Saudi Arabia",
    countryAr: "المملكة العربية السعودية",
    countryCode: "SA",
    latitude: 21.4225,
    longitude: 39.8262,
    timezone: 3,
    defaultMethod: "makkah",
  },
  {
    id: "sa_madinah",
    nameEn: "Medina",
    nameAr: "المدينة المنورة",
    countryEn: "Saudi Arabia",
    countryAr: "المملكة العربية السعودية",
    countryCode: "SA",
    latitude: 24.5247,
    longitude: 39.5692,
    timezone: 3,
    defaultMethod: "makkah",
  },
  {
    id: "sa_riyadh",
    nameEn: "Riyadh",
    nameAr: "الرياض",
    countryEn: "Saudi Arabia",
    countryAr: "المملكة العربية السعودية",
    countryCode: "SA",
    latitude: 24.7136,
    longitude: 46.6753,
    timezone: 3,
    defaultMethod: "makkah",
  },
  {
    id: "sa_jeddah",
    nameEn: "Jeddah",
    nameAr: "جدة",
    countryEn: "Saudi Arabia",
    countryAr: "المملكة العربية السعودية",
    countryCode: "SA",
    latitude: 21.5433,
    longitude: 39.1728,
    timezone: 3,
    defaultMethod: "makkah",
  },
  {
    id: "sa_dammam",
    nameEn: "Dammam",
    nameAr: "الدمام",
    countryEn: "Saudi Arabia",
    countryAr: "المملكة العربية السعودية",
    countryCode: "SA",
    latitude: 26.4207,
    longitude: 50.0888,
    timezone: 3,
    defaultMethod: "makkah",
  },

  // --- OTHER GULF & INTERNATIONAL CITIES 🌍 ---
  {
    id: "ae_dubai",
    nameEn: "Dubai",
    nameAr: "دبي",
    countryEn: "United Arab Emirates",
    countryAr: "الإمارات العربية المتحدة",
    countryCode: "AE",
    latitude: 25.2048,
    longitude: 55.2708,
    timezone: 4,
    defaultMethod: "gulf",
  },
  {
    id: "qa_doha",
    nameEn: "Doha",
    nameAr: "الدوحة",
    countryEn: "Qatar",
    countryAr: "قطر",
    countryCode: "QA",
    latitude: 25.2854,
    longitude: 51.531,
    timezone: 3,
    defaultMethod: "gulf",
  },
  {
    id: "bh_manama",
    nameEn: "Manama",
    nameAr: "المنامة",
    countryEn: "Bahrain",
    countryAr: "البحرين",
    countryCode: "BH",
    latitude: 26.2285,
    longitude: 50.586,
    timezone: 3,
    defaultMethod: "gulf",
  },
  {
    id: "om_muscat",
    nameEn: "Muscat",
    nameAr: "مسقط",
    countryEn: "Oman",
    countryAr: "عُمان",
    countryCode: "OM",
    latitude: 23.588,
    longitude: 58.3829,
    timezone: 4,
    defaultMethod: "gulf",
  },
  {
    id: "jo_amman",
    nameEn: "Amman",
    nameAr: "عمّان",
    countryEn: "Jordan",
    countryAr: "الأردن",
    countryCode: "JO",
    latitude: 31.9454,
    longitude: 35.9284,
    timezone: 3,
    defaultMethod: "mwl",
  },
  {
    id: "tr_istanbul",
    nameEn: "Istanbul",
    nameAr: "إسطنبول",
    countryEn: "Turkey",
    countryAr: "تركيا",
    countryCode: "TR",
    latitude: 41.0082,
    longitude: 28.9784,
    timezone: 3,
    defaultMethod: "mwl",
  },
  {
    id: "gb_london",
    nameEn: "London",
    nameAr: "لندن",
    countryEn: "United Kingdom",
    countryAr: "المملكة المتحدة",
    countryCode: "GB",
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 0,
    defaultMethod: "mwl",
  },
  {
    id: "us_new_york",
    nameEn: "New York",
    nameAr: "نيويورك",
    countryEn: "United States",
    countryAr: "الولايات المتحدة",
    countryCode: "US",
    latitude: 40.7128,
    longitude: -74.006,
    timezone: -5,
    defaultMethod: "isna",
  },
];

/* -------------------------------------------------------------------------- */
/* ASTRONOMICAL PRAYER CALCULATION ENGINE                                     */
/* -------------------------------------------------------------------------- */

export interface PrayerTimesResult {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  dateIso: string;
  cityName: string;
  methodName: string;
  nextPrayer: {
    nameKey: "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
    nameEn: string;
    nameAr: string;
    time: string;
    remainingMs: number;
  };
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180.0;
}

function radToDeg(rad: number): number {
  return (rad * 180.0) / Math.PI;
}

function fixAngle(angle: number): number {
  let a = angle - 360.0 * Math.floor(angle / 360.0);
  if (a < 0) a += 360.0;
  return a;
}

function fixHour(hour: number): number {
  let h = hour - 24.0 * Math.floor(hour / 24.0);
  if (h < 0) h += 24.0;
  return h;
}

/**
 * Calculates solar coordinates for a given Julian Day.
 */
function sunPosition(jd: number) {
  const d = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * d);
  const q = fixAngle(280.459 + 0.98564736 * d);
  const l = fixAngle(q + 1.915 * Math.sin(degToRad(g)) + 0.02 * Math.sin(degToRad(2 * g)));
  const e = 23.439 - 0.00000036 * d;

  const ra =
    radToDeg(Math.atan2(Math.cos(degToRad(e)) * Math.sin(degToRad(l)), Math.cos(degToRad(l)))) /
    15.0;
  const dSun = radToDeg(Math.asin(Math.sin(degToRad(e)) * Math.sin(degToRad(l))));
  const eqt = q / 15.0 - fixHour(ra);

  return { declination: dSun, equationOfTime: eqt };
}

function julianDay(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
}

function computeHourAngle(angle: number, lat: number, dec: number): number {
  const cosH =
    (Math.sin(degToRad(-angle)) - Math.sin(degToRad(lat)) * Math.sin(degToRad(dec))) /
    (Math.cos(degToRad(lat)) * Math.cos(degToRad(dec)));
  if (cosH > 1) return 0; // sun never rises to this angle
  if (cosH < -1) return 180; // sun never sets below this angle
  return radToDeg(Math.acos(cosH));
}

function formatHoursToTimeString(decimalHours: number): string {
  const totalMinutes = Math.round(fixHour(decimalHours) * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function resolveEffectiveTimezone(city: PrayerTimeCity, date: Date = new Date()): number {
  if (
    city.countryCode === "KW" ||
    city.countryCode === "SA" ||
    city.countryCode === "QA" ||
    city.countryCode === "BH"
  ) {
    return 3;
  }
  if (city.countryCode === "AE" || city.countryCode === "OM") {
    return 4;
  }
  if (city.countryCode === "EG") {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Cairo",
        timeZoneName: "shortOffset",
      }).formatToParts(date);
      const tzPart = parts.find((p) => p.type === "timeZoneName")?.value;
      const match = tzPart?.match(/GMT([+-]\d+)/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    } catch {
      // Fallback below
    }
    const m = date.getMonth(); // 0-indexed
    // In Egypt, daylight saving time (UTC+3) typically runs from last Friday of April to last Thursday of October
    if (m >= 4 && m <= 8) return 3;
    if (m === 3) {
      const lastDayOfApril = new Date(date.getFullYear(), 3, 30);
      const dayOfWeek = lastDayOfApril.getDay();
      const lastFriday = 30 - ((dayOfWeek + 2) % 7);
      if (date.getDate() >= lastFriday) return 3;
    }
    if (m === 9) {
      const lastDayOfOct = new Date(date.getFullYear(), 9, 31);
      const dayOfWeek = lastDayOfOct.getDay();
      const lastThursday = 31 - ((dayOfWeek + 3) % 7);
      if (date.getDate() <= lastThursday) return 3;
    }
    return 2;
  }
  return city.timezone;
}

export function calculateDailyPrayerTimes(
  date: Date,
  city: PrayerTimeCity,
  methodOverride?: PrayerCalculationMethodKey,
): PrayerTimesResult {
  const method =
    PRAYER_CALCULATION_METHODS[methodOverride ?? city.defaultMethod] ??
    PRAYER_CALCULATION_METHODS.kuwait;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const jd = julianDay(year, month, day);
  const { declination, equationOfTime } = sunPosition(jd);

  const effectiveTimezone = resolveEffectiveTimezone(city, date);

  // Solar noon (Dhuhr)
  const dhuhrBase = 12 + effectiveTimezone - city.longitude / 15.0 - equationOfTime;

  // Sunrise and Sunset (zenith 0.833° for atmospheric refraction)
  const sunRiseSetHa = computeHourAngle(0.833, city.latitude, declination) / 15.0;
  const sunriseDec = dhuhrBase - sunRiseSetHa;
  const sunsetDec = dhuhrBase + sunRiseSetHa;

  // Fajr
  const fajrHa = computeHourAngle(method.fajrAngle, city.latitude, declination) / 15.0;
  const fajrDec = dhuhrBase - fajrHa;

  // Asr (Standard shadow 1:1)
  const asrAlt = radToDeg(
    Math.atan(1.0 + Math.tan(degToRad(Math.abs(city.latitude - declination)))),
  );
  const asrHa = computeHourAngle(90 - asrAlt, city.latitude, declination) / 15.0;
  const asrDec = dhuhrBase + asrHa;

  // Maghrib: sunset + 2 minutes
  const maghribDec = sunsetDec + 2 / 60.0;

  // Isha
  let ishaDec: number;
  if (method.ishaIntervalMinutes && method.ishaIntervalMinutes > 0) {
    ishaDec = maghribDec + method.ishaIntervalMinutes / 60.0;
  } else {
    const ishaHa = computeHourAngle(method.ishaAngle, city.latitude, declination) / 15.0;
    ishaDec = dhuhrBase + ishaHa;
  }

  const timesMap: Array<{
    key: PrayerTimesResult["nextPrayer"]["nameKey"];
    nameEn: string;
    nameAr: string;
    dec: number;
  }> = [
    { key: "fajr", nameEn: "Fajr", nameAr: "الفجر", dec: fajrDec },
    { key: "sunrise", nameEn: "Sunrise", nameAr: "الشروق", dec: sunriseDec },
    { key: "dhuhr", nameEn: "Dhuhr", nameAr: "الظهر", dec: dhuhrBase },
    { key: "asr", nameEn: "Asr", nameAr: "العصر", dec: asrDec },
    { key: "maghrib", nameEn: "Maghrib", nameAr: "المغرب", dec: maghribDec },
    { key: "isha", nameEn: "Isha", nameAr: "العشاء", dec: ishaDec },
  ];

  // Determine next prayer relative to city's current local time
  const now = new Date();
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60.0 + now.getUTCSeconds() / 3600.0;
  const cityNowTz = resolveEffectiveTimezone(city, now);
  const cityCurrentHours = fixHour(utcHours + cityNowTz);

  let nextPrayerItem = timesMap.find((p) => p.dec > cityCurrentHours);
  let nextRemainingMs = 0;

  if (nextPrayerItem) {
    nextRemainingMs = Math.max(
      0,
      Math.round((nextPrayerItem.dec - cityCurrentHours) * 3600 * 1000),
    );
  } else {
    // Past Isha -> Next is Tomorrow's Fajr
    nextPrayerItem = timesMap[0]!;
    nextRemainingMs = Math.max(
      0,
      Math.round((nextPrayerItem.dec + 24 - cityCurrentHours) * 3600 * 1000),
    );
  }

  return {
    fajr: formatHoursToTimeString(fajrDec),
    sunrise: formatHoursToTimeString(sunriseDec),
    dhuhr: formatHoursToTimeString(dhuhrBase),
    asr: formatHoursToTimeString(asrDec),
    maghrib: formatHoursToTimeString(maghribDec),
    isha: formatHoursToTimeString(ishaDec),
    dateIso: date.toISOString().slice(0, 10),
    cityName: city.nameEn,
    methodName: method.nameEn,
    nextPrayer: {
      nameKey: nextPrayerItem.key,
      nameEn: nextPrayerItem.nameEn,
      nameAr: nextPrayerItem.nameAr,
      time: formatHoursToTimeString(nextPrayerItem.dec),
      remainingMs: nextRemainingMs,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* 99 NAMES OF ALLAH (أسماء الله الحسنى)                                      */
/* -------------------------------------------------------------------------- */

interface _LegacyNameOfAllah {
  number: number;
  nameAr: string;
  transliteration: string;
  meaningEn: string;
  explanationEn: string;
  explanationAr: string;
  quranicEvidence: string;
}

const _LEGACY_NAMES: _LegacyNameOfAllah[] = [
  {
    number: 1,
    nameAr: "الرَّحْمَٰنُ",
    transliteration: "Ar-Rahman",
    meaningEn: "The Entirely Merciful",
    explanationEn: "He whose mercy encompasses all creation in the universe with limitless grace.",
    explanationAr: "واسع الرحمة التي وسعت كل شيء وعمت جميع خلقه في الدنيا.",
    quranicEvidence: "سورة الفاتحة (1:3): الرَّحْمَٰنِ الرَّحِيمِ",
  },
  {
    number: 2,
    nameAr: "الرَّحِيمُ",
    transliteration: "Ar-Raheem",
    meaningEn: "The Especially Merciful",
    explanationEn: "He who bestows special mercy, guidance, and eternal reward upon the believers.",
    explanationAr: "الواصل رحمته إلى عباده المؤمنين هدايةً وثباتاً ومغفرةً ونعيماً مقيماً.",
    quranicEvidence: "سورة الأحزاب (33:43): وَكَانَ بِالْمُؤْمِنِينَ رَحِيمًا",
  },
  {
    number: 3,
    nameAr: "الْمَلِكُ",
    transliteration: "Al-Malik",
    meaningEn: "The Sovereign / King",
    explanationEn:
      "The Absolute Ruler to Whom belongs the true ownership and authority over the heavens and earth.",
    explanationAr: "المتصرف في ملكه كيف يشاء، المالك الحقيقي لكل ما في السماوات والأرض.",
    quranicEvidence: "سورة طه (20:114): فَتَعَالَى اللَّهُ الْمَلِكُ الْحَقُّ",
  },
  {
    number: 4,
    nameAr: "الْقُدُّوسُ",
    transliteration: "Al-Quddus",
    meaningEn: "The Pure / The Holy",
    explanationEn: "The One free from all imperfections, deficiencies, or partner.",
    explanationAr: "المنزه والمطهر عن كل عيب ونقص وشبيه، المسبوح بحمده في الملأ الأعلى.",
    quranicEvidence: "سورة الجمعة (62:1): يُسَبِّحُ لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ الْمَلِكِ الْقُدُّوسِ",
  },
  {
    number: 5,
    nameAr: "السَّلَامُ",
    transliteration: "As-Salam",
    meaningEn: "The Source of Peace",
    explanationEn: "The One free from defect, Who spreads safety and peace to His servants.",
    explanationAr: "السالم من كل آفة ونقص، الذي ينشر السلام والأمان على أوليائه وعباده.",
    quranicEvidence: "سورة الحشر (59:23): هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ",
  },
  {
    number: 6,
    nameAr: "الْمُؤْمِنُ",
    transliteration: "Al-Mu'min",
    meaningEn: "The Granter of Security / Affirming",
    explanationEn: "The Giver of faith and security, Who confirms the truth of His messengers.",
    explanationAr: "المصدق لرسله بالمعجزات، والمؤمّن لعباده من الخوف والظلم.",
    quranicEvidence: "سورة الحشر (59:23): الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ",
  },
  {
    number: 7,
    nameAr: "الْمُهَيْمِنُ",
    transliteration: "Al-Muhaymin",
    meaningEn: "The Guardian / Overseer",
    explanationEn: "The Preserver, Overseer, and Witness over every single action and intention.",
    explanationAr: "الرقيب الشاهد على جميع أعمال العباد ونياتهم، الحافظ لأرزاقهم وآجالهم.",
    quranicEvidence: "سورة الحشر (59:23): الْمُهَيْمِنُ الْعَزِيزُ الْجَبَّارُ",
  },
  {
    number: 8,
    nameAr: "الْعَزِيزُ",
    transliteration: "Al-Aziz",
    meaningEn: "The Almighty / Victorious",
    explanationEn:
      "The Invincible One Whom nothing can overcome, possessing honor and absolute strength.",
    explanationAr: "القوي القاهر الذي لا يغلبه شيء، صاحب العزة والجلال والقوة المطلقة.",
    quranicEvidence: "سورة البقرة (2:209): وَاعْلَمُوا أَنَّ اللَّهَ عَزِيزٌ حَكِيمٌ",
  },
  {
    number: 9,
    nameAr: "الْجَبَّارُ",
    transliteration: "Al-Jabbar",
    meaningEn: "The Compeller / The Restorer",
    explanationEn:
      "He Who mends the brokenhearted, enriches the humble, and compels all to His command.",
    explanationAr: "الذي يجبر قلوب المنكسرين، ويغني الفقير، ويخضع لعظمته كل جبار.",
    quranicEvidence: "سورة الحشر (59:23): الْجَبَّارُ الْمُتَكَبِّرُ",
  },
  {
    number: 10,
    nameAr: "الْمُتَكَبِّرُ",
    transliteration: "Al-Mutakabbir",
    meaningEn: "The Supreme in Greatness",
    explanationEn: "The Majestic One Who is supreme above all evil, arrogance, and injustice.",
    explanationAr: "المتعالي عن كل سوء وظلم، ذو الكبرياء والعظمة الحقيقية.",
    quranicEvidence: "سورة الحشر (59:23): الْمُتَكَبِّرُ سُبْحَانَ اللَّهِ عَمَّا يُشْرِكُونَ",
  },
  {
    number: 11,
    nameAr: "الْخَالِقُ",
    transliteration: "Al-Khaliq",
    meaningEn: "The Creator",
    explanationEn:
      "The Originator Who brings all things into existence from nothingness according to His measure.",
    explanationAr: "الموجد للأشياء من العدم على غير مثال سابق بتقديره وحكمته.",
    quranicEvidence: "سورة الحشر (59:24): هُوَ اللَّهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ",
  },
  {
    number: 12,
    nameAr: "الْبَارِئُ",
    transliteration: "Al-Bari'",
    meaningEn: "The Evolver / Maker",
    explanationEn: "The Maker Who brings what He planned into actual being with exquisite harmony.",
    explanationAr: "المنفذ لما قضاه وقدره، المبرئ للخلق والمميز لبعضهم عن بعض.",
    quranicEvidence: "سورة الحشر (59:24): هُوَ اللَّهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ",
  },
  {
    number: 13,
    nameAr: "الْمُصَوِّرُ",
    transliteration: "Al-Musawwir",
    meaningEn: "The Fashioner of Forms",
    explanationEn: "He Who designs and shapes every creation in its unique, harmonious form.",
    explanationAr: "المعطي لكل مخلوق صورته وشكله وهيئته المتناسقة بحكمته البالغة.",
    quranicEvidence: "سورة آل عمران (3:6): هُوَ الَّذِي يُصَوِّرُكُمْ فِي الْأَرْحَامِ كَيْفَ يَشَاءُ",
  },
  {
    number: 14,
    nameAr: "الْغَفَّارُ",
    transliteration: "Al-Ghaffar",
    meaningEn: "The Perpetual Forgiver",
    explanationEn:
      "The One Who repeatedly veils and forgives the sins of those who turn to Him in sincere repentance.",
    explanationAr: "الستار لذنوب عباده، العافي عنهم تكراراً كلما تابوا وأنابوا إليه.",
    quranicEvidence: "سورة نوح (71:10): فَقُلْتُ اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا",
  },
  {
    number: 15,
    nameAr: "الْقَهَّارُ",
    transliteration: "Al-Qahhar",
    meaningEn: "The Subduer / All-Dominant",
    explanationEn:
      "The All-Dominant One before Whose majesty and decree the entire creation yields.",
    explanationAr: "الغالب الذي خضعت لسطوته وقدرته جميع الخلائق في الكون.",
    quranicEvidence: "سورة الزمر (39:4): سُبْحَانَهُ هُوَ اللَّهُ الْوَاحِدُ الْقَهَّارُ",
  },
  {
    number: 16,
    nameAr: "الْوَهَّابُ",
    transliteration: "Al-Wahhab",
    meaningEn: "The Supreme Bestower",
    explanationEn:
      "The Constant Giver of blessings, wisdom, and life without expecting anything in return.",
    explanationAr: "كثير العطاء والهبات لجميع عباده من غير عوض ولا طلب.",
    quranicEvidence: "سورة آل عمران (3:8): إِنَّكَ أَنْتَ الْوَهَّابُ",
  },
  {
    number: 17,
    nameAr: "الرَّزَّاقُ",
    transliteration: "Ar-Razzaq",
    meaningEn: "The Provider",
    explanationEn:
      "The Sustainer Who guarantees sustenance to all creatures, providing both material and spiritual nourishment.",
    explanationAr: "المتكفل بأرزاق العباد وأقواتهم، الواهب للقلوب نور الإيمان والمعرفة.",
    quranicEvidence: "سورة الذاريات (51:58): إِنَّ اللَّهَ هُوَ الرَّزَّاقُ ذُو الْقُوَّةِ الْمَتِينُ",
  },
  {
    number: 18,
    nameAr: "الْفَتَّاحُ",
    transliteration: "Al-Fattah",
    meaningEn: "The Opener / Arbiter",
    explanationEn:
      "The Opener of the gates of mercy, knowledge, and success, Who judges between people with absolute justice.",
    explanationAr: "الحاكم بين عباده بالعدل، الذي يفتح لهم أبواب رحمته ورزقه وبصائرهم.",
    quranicEvidence: "سورة سبأ (34:26): قُلْ يَجْمَعُ بَيْنَنَا رَبُّنَا ثُمَّ يَفْتَحُ بَيْنَنَا بِالْحَقِّ وَهُوَ الْفَتَّاحُ الْعَلِيمُ",
  },
  {
    number: 19,
    nameAr: "الْعَلِيمُ",
    transliteration: "Al-Aleem",
    meaningEn: "The All-Knowing",
    explanationEn:
      "He whose knowledge encompasses all things, past, present, and future, the visible and the unseen.",
    explanationAr:
      "المحيط علمه بكل شيء ظاهراً وباطناً، لا يخفى عليه مثقال ذرة في الأرض ولا في السماء.",
    quranicEvidence: "سورة البقرة (2:29): وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ",
  },
  {
    number: 20,
    nameAr: "الْحَكِيمُ",
    transliteration: "Al-Hakeem",
    meaningEn: "The All-Wise",
    explanationEn:
      "The One Who places everything in its right place with perfect wisdom and purpose.",
    explanationAr: "المحكم لتدبير الكون، الذي يضع كل أمر في موضعه الصحيح بحكمة تامة.",
    quranicEvidence: "سورة البقرة (2:129): إِنَّكَ أَنْتَ الْعَزِيزُ الْحَكِيمُ",
  },
  {
    number: 21,
    nameAr: "السَّمِيعُ",
    transliteration: "As-Samee'",
    meaningEn: "The All-Hearing",
    explanationEn:
      "He Who hears every sound, whisper, and prayer throughout the universe without exception.",
    explanationAr: "الذي يسمع كل صوت خفي ودعاء في خلوات الليل والنهار بلا التباس.",
    quranicEvidence: "سورة البقرة (2:127): إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ",
  },
  {
    number: 22,
    nameAr: "الْبَصِيرُ",
    transliteration: "Al-Baseer",
    meaningEn: "The All-Seeing",
    explanationEn:
      "The One Who perceives every detail, movement, and hidden deed throughout creation.",
    explanationAr:
      "الذي يبصر دبيب النملة السوداء على الصخرة الملساء في الليلة الظلماء، محيط بكل شيء.",
    quranicEvidence: "سورة الإسراء (17:1): إِنَّهُ هُوَ السَّمِيعُ الْبَصِيرُ",
  },
];

/* -------------------------------------------------------------------------- */
/* VERIFIED DAILY ADHKAR (الأذكار اليومية الصحيحة)                              */
/* -------------------------------------------------------------------------- */

export type AdhkarCategoryKey =
  "morning" | "evening" | "after_prayer" | "sleep" | "waking" | "home_mosque" | "general";

export interface DhikrRecord {
  id: string;
  category: AdhkarCategoryKey;
  categoryLabelAr: string;
  categoryLabelEn: string;
  textAr: string;
  transliteration: string;
  translationEn: string;
  targetCount: number;
  sourceReference: string;
  virtueExplanationEn: string;
  virtueExplanationAr: string;
}

export const VERIFIED_DAILY_ADHKAR: DhikrRecord[] = [
  // Morning Adhkar
  {
    id: "adhkar_morn_kursi",
    category: "morning",
    categoryLabelAr: "أذكار الصباح",
    categoryLabelEn: "Morning Azkar",
    textAr:
      "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    transliteration:
      "Allahu la ilaha illa Huwa, Al-Hayyul-Qayyum. La ta'khudhuhu sinatun wa la nawm...",
    translationEn:
      "Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep...",
    targetCount: 1,
    sourceReference: "سورة البقرة (2:255) · صحيح الترغيب والترهيب 655",
    virtueExplanationEn:
      "Whoever recites it in the morning will be protected from all evil until the evening.",
    virtueExplanationAr: "من قرأها حين يصبح أُجير من الجن والشياطين حتى يمسي.",
  },
  {
    id: "adhkar_morn_asbahna",
    category: "morning",
    categoryLabelAr: "أذكار الصباح",
    categoryLabelEn: "Morning Azkar",
    textAr:
      "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
    transliteration:
      "Asbahna wa asbahal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah...",
    translationEn:
      "We have reached the morning and at this very morning unto Allah belongs all sovereignty, and all praise is for Allah...",
    targetCount: 1,
    sourceReference: "صحيح مسلم 2723",
    virtueExplanationEn:
      "Prophetic declaration of reliance, gratitude, and seeking protection at sunrise.",
    virtueExplanationAr:
      "إعلان التوحيد والتوكل على الله، واستعاذة من الكسل وسوء الكبر وعذاب القبر.",
  },
  {
    id: "adhkar_morn_sayyid_istighfar",
    category: "morning",
    categoryLabelAr: "أذكار الصباح",
    categoryLabelEn: "Morning Azkar",
    textAr:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration:
      "Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu...",
    translationEn:
      "O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant...",
    targetCount: 1,
    sourceReference: "صحيح البخاري 6306 (سيد الاستغفار)",
    virtueExplanationEn:
      "The Master Supplication for Forgiveness. Whoever says it with conviction in the morning and dies that day enters Paradise.",
    virtueExplanationAr:
      "سيد الاستغفار؛ من قاله موقناً به حين يصبح فمات من يومه قبل أن يمسي دخل الجنة.",
  },
  {
    id: "adhkar_morn_bismillah",
    category: "morning",
    categoryLabelAr: "أذكار الصباح",
    categoryLabelEn: "Morning Azkar",
    textAr: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration:
      "Bismillahil-ladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Sami'ul-'Alim.",
    translationEn:
      "In the Name of Allah, with Whose Name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing.",
    targetCount: 3,
    sourceReference: "سنن أبي داود 5088 · جامع الترمذي 3388 (حسن صحيح)",
    virtueExplanationEn:
      "Whoever repeats this three times in the morning and evening will not be harmed by anything.",
    virtueExplanationAr: "من قالها ثلاثاً إذا أصبح وثلاثاً إذا أسر لم يضره شيء.",
  },
  {
    id: "adhkar_morn_raditu",
    category: "morning",
    categoryLabelAr: "أذكار الصباح",
    categoryLabelEn: "Morning Azkar",
    textAr: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
    transliteration:
      "Raditu billahi Rabba, wa bil-Islami dina, wa bi-Muhammadin sallallahu 'alayhi wa sallama Nabiyya.",
    translationEn:
      "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (peace and blessings be upon him) as my Prophet.",
    targetCount: 3,
    sourceReference: "سنن أبي داود 5074 · مسند أحمد (إسناد حسن)",
    virtueExplanationEn:
      "Allah guarantees to please whoever says this with sincerity every morning and evening.",
    virtueExplanationAr: "كان حقاً على الله تعالى أن يرضيه يوم القيامة.",
  },
  {
    id: "adhkar_morn_subhanallah_100",
    category: "morning",
    categoryLabelAr: "أذكار الصباح",
    categoryLabelEn: "Morning Azkar",
    textAr: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "Subhanallahi wa bihamdihi.",
    translationEn: "Glory be to Allah and all praise is His.",
    targetCount: 100,
    sourceReference: "صحيح مسلم 2692",
    virtueExplanationEn:
      "Whoever recites it 100 times in the morning will have his sins forgiven even if they were like the foam of the sea.",
    virtueExplanationAr:
      "من قالها مائة مرة حين يصبح وحين يمسي حطت خطاياه وإن كانت مثل زبد البحر، ولم يأتِ أحد بمثل ما جاء به إلا من قال مثله أو زاد.",
  },

  // Evening Adhkar
  {
    id: "adhkar_eve_amsayna",
    category: "evening",
    categoryLabelAr: "أذكار المساء",
    categoryLabelEn: "Evening Azkar",
    textAr:
      "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا...",
    transliteration:
      "Amsayna wa amsal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah...",
    translationEn:
      "We have reached the evening and at this very evening unto Allah belongs all sovereignty, and all praise is for Allah...",
    targetCount: 1,
    sourceReference: "صحيح مسلم 2723",
    virtueExplanationEn:
      "Prophetic evening renewal of monotheism and protection from evil of the night.",
    virtueExplanationAr: "تجديد التوحيد والاستعاذة من شر الليل وما فيه.",
  },
  {
    id: "adhkar_eve_audhu_bikalimat",
    category: "evening",
    categoryLabelAr: "أذكار المساء",
    categoryLabelEn: "Evening Azkar",
    textAr: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bi kalimatillahit-tammati min sharri ma khalaq.",
    translationEn:
      "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    targetCount: 3,
    sourceReference: "صحيح مسلم 2709",
    virtueExplanationEn:
      "Protects from any poisonous bite or harm throughout the night until morning.",
    virtueExplanationAr: "من قالها حين يمسي ثلاث مرات لم تضره حُمَة (لدغة عقرب أو سم) تلك الليلة.",
  },

  // After-Prayer Adhkar
  {
    id: "adhkar_post_astaghfirullah",
    category: "after_prayer",
    categoryLabelAr: "أذكار بعد الصلاة",
    categoryLabelEn: "After-Prayer Azkar",
    textAr:
      "أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    transliteration:
      "Astaghfirullah (3x), Allahumma Antas-Salam wa minkas-salam, tabarakta ya Dhal-Jalali wal-Ikram.",
    translationEn:
      "I seek the forgiveness of Allah (3 times). O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of majesty and honor.",
    targetCount: 1,
    sourceReference: "صحيح مسلم 591",
    virtueExplanationEn: "The immediate authentic Sunnah upon concluding the obligatory prayer.",
    virtueExplanationAr: "سنة نبوية ثابتة فور التسليم من الصلاة المفروضة.",
  },
  {
    id: "adhkar_post_tasbih_33",
    category: "after_prayer",
    categoryLabelAr: "أذكار بعد الصلاة",
    categoryLabelEn: "After-Prayer Azkar",
    textAr:
      "سُبْحَانَ اللَّهِ (٣٣)، وَالْحَمْدُ لِلَّهِ (٣٣)، وَاللَّهُ أَكْبَرُ (٣٣)، تَمَامَ الْمِائَةِ: لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration:
      "Subhanallah (33x), Alhamdulillah (33x), Allahu Akbar (33x), Completing 100 with La ilaha illallah wahdahu la sharika lah...",
    translationEn:
      "Glory be to Allah (33 times), Praise be to Allah (33 times), Allah is the Greatest (33 times), completing 100 with monotheism.",
    targetCount: 1,
    sourceReference: "صحيح مسلم 597",
    virtueExplanationEn: "Forgives sins even if they equal the foam of the ocean.",
    virtueExplanationAr: "غُفرت خطاياه وإن كانت مثل زبد البحر.",
  },

  // Sleep & Waking Adhkar (أذكار النوم والاستيقاظ)
  {
    id: "adhkar_sleep_bismika",
    category: "sleep",
    categoryLabelAr: "أذكار النوم",
    categoryLabelEn: "Sleep Azkar",
    textAr: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "BismikAllahumma amutu wa ahya.",
    translationEn: "In Your Name, O Allah, I die and I live.",
    targetCount: 1,
    sourceReference: "صحيح البخاري 6324",
    virtueExplanationEn:
      "The Prophet ﷺ would recite this supplication when lying down to sleep, entrusting his soul to Allah.",
    virtueExplanationAr: "كان النبي ﷺ إذا أخذ مضجعه من الليل قالها مفوّضاً أمره إلى الله تعالى.",
  },
  {
    id: "adhkar_sleep_muawwidhat",
    category: "sleep",
    categoryLabelAr: "أذكار النوم",
    categoryLabelEn: "Sleep Azkar",
    textAr:
      "يجمع كفيه ثم ينفث فيهما فيقرأ: ﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾، و﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ﴾، و﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ﴾، ثم يمسح بهما ما استطاع من جسده، يبدأ بهما على رأسه ووجهه وما أقبل من جسده (يفعل ذلك ثلاث مرات).",
    transliteration:
      "Recite Surah Al-Ikhlas, Al-Falaq, and An-Nas into cupped hands and wipe over the body (3x).",
    translationEn:
      "Recite the three Quls (Al-Ikhlas, Al-Falaq, An-Nas) into your palms, blow gently, and wipe over your head, face, and body three times.",
    targetCount: 3,
    sourceReference: "صحيح البخاري 5017",
    virtueExplanationEn:
      "Prophetic Sunnah of nightly physical and spiritual protection before sleep.",
    virtueExplanationAr: "سنة نبوية ثابتة للحفظ والتحصين كل ليلة عند النوم.",
  },
  {
    id: "adhkar_sleep_tasbih_fatimah",
    category: "sleep",
    categoryLabelAr: "أذكار النوم",
    categoryLabelEn: "Sleep Azkar",
    textAr: "سُبْحَانَ اللَّهِ (٣٣) · الْحَمْدُ لِلَّهِ (٣٣) · اللَّهُ أَكْبَرُ (٣٤)",
    transliteration: "Subhanallah (33x), Alhamdulillah (33x), Allahu Akbar (34x).",
    translationEn:
      "Glory be to Allah (33x), Praise be to Allah (33x), Allah is the Greatest (34x).",
    targetCount: 1,
    sourceReference: "صحيح البخاري 6318 · صحيح مسلم 2727",
    virtueExplanationEn:
      "Taught by the Prophet ﷺ to Ali and Fatimah as better than a servant to renew strength and blessing.",
    virtueExplanationAr:
      "علّمها النبي ﷺ علياً وفاطمة رضي الله عنهما عند النوم وأخبر أنها خير من خادم.",
  },
  {
    id: "adhkar_wake_alhamdulillah",
    category: "waking",
    categoryLabelAr: "أذكار الاستيقاظ",
    categoryLabelEn: "Waking Up Azkar",
    textAr: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdulillahi-lladhi ahyana ba'da ma amatana wa ilayhin-nushur.",
    translationEn:
      "All praise is due to Allah Who gave us life after causing us to die (sleep), and unto Him is the resurrection.",
    targetCount: 1,
    sourceReference: "صحيح البخاري 6312",
    virtueExplanationEn:
      "Gratitude to Allah upon waking each morning with a renewed day of purpose.",
    virtueExplanationAr:
      "شكر الله تعالى على نعمة الإحياء في يوم جديد واغتنام الوقت في الطاعة وطلب العلم.",
  },
  {
    id: "adhkar_wake_night_prayer",
    category: "waking",
    categoryLabelAr: "أذكار الاستيقاظ",
    categoryLabelEn: "Waking Up Azkar",
    textAr:
      "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration:
      "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa Huwa 'ala kulli shay'in Qadir...",
    translationEn:
      "There is none worthy of worship except Allah alone without partner; to Him belongs dominion and praise, and He has power over all things...",
    targetCount: 1,
    sourceReference: "صحيح البخاري 1154 (دعاء الاستيقاظ من الليل)",
    virtueExplanationEn:
      "Whoever wakes at night and recites this then asks forgiveness or prays will have his supplication answered.",
    virtueExplanationAr: "من تعارّ من الليل فقالها ثم قال: اللهم اغفر لي، أو دعا، استُجيب له.",
  },
];

/* -------------------------------------------------------------------------- */
/* VERIFIED DUAS LIBRARY (أدعية مختارة من الكتاب والسنة)                       */
/* -------------------------------------------------------------------------- */

export type DuaCategoryKey =
  | "quranic"
  | "prophetic"
  | "forgiveness"
  | "parents"
  | "knowledge"
  | "guidance"
  | "protection"
  | "distress";

export interface DuaItem {
  id: string;
  category: DuaCategoryKey;
  type: "quranic" | "prophetic";
  titleAr: string;
  titleEn: string;
  arabicText: string;
  transliteration: string;
  translationEn: string;
  sourceReference: string;
  contextEn: string;
  virtueExplanationEn?: string;
}

export const VERIFIED_DUAS_CATALOG: DuaItem[] = [
  {
    id: "dua_rabbana_atinah",
    category: "quranic",
    type: "quranic",
    titleAr: "دعاء خيري الدنيا والآخرة",
    titleEn: "Good in this World and the Hereafter",
    arabicText: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration:
      "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar.",
    translationEn:
      "Our Lord, give us in this world that which is good and in the Hereafter that which is good and protect us from the punishment of the Fire.",
    sourceReference: "سورة البقرة (2:201) · كان أكثر دعاء النبي ﷺ (صحيح البخاري 6389)",
    contextEn:
      "The most frequent supplication of the Prophet Muhammad ﷺ encompassing comprehensive wellbeing in both lives.",
  },
  {
    id: "dua_parents_rahma",
    category: "parents",
    type: "quranic",
    titleAr: "الدعاء للوالدين بالرحمة والمغفرة",
    titleEn: "Supplication for Mercy upon Parents",
    arabicText: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Rabbi irhamhuma kama rabbayani sagheera.",
    translationEn: "My Lord, have mercy upon them both as they brought me up when I was small.",
    sourceReference: "سورة الإسراء (17:24)",
    contextEn:
      "Divine Quranic instruction to express gratitude and implore eternal mercy for one's parents.",
  },
  {
    id: "dua_parents_maghfirah",
    category: "parents",
    type: "quranic",
    titleAr: "دعاء نوح وإبراهيم عليهما السلام للوالدين",
    titleEn: "Supplication for Forgiveness of Parents & Believers",
    arabicText: "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ",
    transliteration: "Rabbana ighfir li wa li-walidayya wa lil-mu'minina yawma yaqumul-hisab.",
    translationEn:
      "Our Lord, forgive me and my parents and the believers the Day the account is established.",
    sourceReference: "سورة إبراهيم (14:41)",
    contextEn:
      "The heartfelt prayer of Prophet Ibrahim for himself, his parents, and all faithful believers.",
  },
  {
    id: "dua_knowledge_increase",
    category: "knowledge",
    type: "quranic",
    titleAr: "طلب الزيادة في العلم النافع",
    titleEn: "Seeking Increase in Beneficial Knowledge",
    arabicText: "رَّبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidni 'ilma.",
    translationEn: "My Lord, increase me in knowledge.",
    sourceReference: "سورة طه (20:114)",
    contextEn:
      "The only matter in which Allah commanded His Prophet ﷺ to ask for increase was knowledge.",
  },
  {
    id: "dua_an_nafi_knowledge",
    category: "knowledge",
    type: "prophetic",
    titleAr: "سؤال العلم النافع والرزق الطيب والعمل المتقبل",
    titleEn: "Supplication for Beneficial Knowledge & Halal Sustenance",
    arabicText: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
    transliteration:
      "Allahumma inni as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbala.",
    translationEn:
      "O Allah, I ask You for beneficial knowledge, wholesome sustenance, and deeds that are accepted.",
    sourceReference: "سنن ابن ماجه 925 · صحيح",
    contextEn: "Recited daily by the Prophet ﷺ following the Fajr prayer.",
  },
  {
    id: "dua_distress_relief",
    category: "distress",
    type: "prophetic",
    titleAr: "دعاء الكرب وتفريج الهم",
    titleEn: "Supplication for Relief from Anxiety and Debt",
    arabicText:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
    transliteration:
      "Allahumma inni a'udhu bika minal-hammi wal-hazan, wal-'ajzi wal-kasal, wal-bukhli wal-jubn, wa dala'id-dayni wa ghalabatir-rijal.",
    translationEn:
      "O Allah, I seek refuge in You from grief and sadness, weakness and laziness, miserliness and cowardice, the burden of debt and the oppression of men.",
    sourceReference: "صحيح البخاري 2893",
    contextEn:
      "Comprehensive protection against mental distress, lethargy, financial burden, and helplessness.",
  },
  {
    id: "dua_younus",
    category: "distress",
    type: "quranic",
    titleAr: "دعاء ذي النون عليه السلام في ظلمات الحوت",
    titleEn: "Supplication of Prophet Yunus (Dhun-Nun)",
    arabicText: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa Anta subhanaka inni kuntu minaz-zalimin.",
    translationEn:
      "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    sourceReference: "سورة الأنبياء (21:87) · جامع الترمذي 3505 (صحيح)",
    virtueExplanationEn:
      "No Muslim ever calls upon Allah with this supplication in any difficulty except that Allah answers him.",
    contextEn:
      "Prophetic testimony of monotheism, adoration, and humble admission of human imperfection.",
  },
  {
    id: "dua_musa_ishrah_sadri",
    category: "knowledge",
    type: "quranic",
    titleAr: "دعاء انشراح الصدر وتيسير الأمر والفهم (للدراسة والامتحانات)",
    titleEn: "Expansion of the Heart, Clarity of Speech & Ease in Study",
    arabicText: "رَبِّ اشْرَحْ لِي صَدْرِي ۝ وَيَسِّرْ لِي أَمْرِي ۝ وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي ۝ يَفْقَهُوا قَوْلِي",
    transliteration:
      "Rabbishrah li sadri, wa yassir li amri, wahlul 'uqdatan min lisani yafqahu qawli.",
    translationEn:
      "My Lord, expand for me my breast, and ease for me my task, and untie the knot from my tongue that they may understand my speech.",
    sourceReference: "سورة طه (20:25-28)",
    contextEn:
      "Ideal Quranic supplication before studying difficult subjects, oral presentations, or entering exams.",
  },
  {
    id: "dua_la_sahla",
    category: "knowledge",
    type: "prophetic",
    titleAr: "دعاء التيسير في الصعاب والامتحانات",
    titleEn: "Making Difficult Tasks & Exams Easy",
    arabicText: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",
    transliteration:
      "Allahumma la sahla illa ma ja'altahu sahla, wa Anta taj'alul-hazna idha shi'ta sahla.",
    translationEn:
      "O Allah, there is no ease except in that which You have made easy, and You make the difficulty, if You wish, easy.",
    sourceReference: "صحيح ابن حبان 974 · إسناده صحيح",
    contextEn:
      "Recited by students when facing challenging coursework, revision, or examination questions.",
  },
  {
    id: "dua_infaani_bima_allamtani",
    category: "knowledge",
    type: "prophetic",
    titleAr: "سؤال الانتفاع بالعلم وزيادته",
    titleEn: "Seeking Benefit From What Was Learned",
    arabicText: "اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي، وَعَلِّمْنِي مَا يَنْفَعُنِي، وَزِدْنِي عِلْمًا",
    transliteration: "Allahumm-anfa'ni bima 'allamtani, wa 'allimni ma yanfa'uni, wa zidni 'ilma.",
    translationEn:
      "O Allah, benefit me with what You have taught me, teach me that which will benefit me, and increase me in knowledge.",
    sourceReference: "جامع الترمذي 3599 · سنن ابن ماجه 251 (صحيح)",
    contextEn: "Prophetic supplication turning study hours into lasting, beneficial knowledge.",
  },
  {
    id: "dua_hayy_qayyum_student",
    category: "distress",
    type: "prophetic",
    titleAr: "الاستغاثة بالله لإصلاح الشأن كله عند الضغط والتشتت",
    titleEn: "Seeking Allah's Help to Set All Affairs Right",
    arabicText: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    transliteration:
      "Ya Hayyu ya Qayyum birahmatika astaghith, aslih li sha'ni kullahu wa la takilni ila nafsi tarfata 'ayn.",
    translationEn:
      "O Ever-Living, O Sustainer, in Your mercy I seek relief; rectify for me all of my affairs and do not leave me to myself even for the blink of an eye.",
    sourceReference: "سنن النسائي الكبرى 10330 · صحيح الترغيب 661 (حسن)",
    contextEn: "Encourages complete reliance on Allah alongside diligent preparation.",
  },
  {
    id: "dua_guidance_huda_tuqa",
    category: "guidance",
    type: "prophetic",
    titleAr: "سؤال الهدى والتقى والعفاف والغنى",
    titleEn: "Supplication for Guidance, Piety & Self-Sufficiency",
    arabicText: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
    transliteration: "Allahumma inni as'alukal-huda wat-tuqa wal-'afafa wal-ghina.",
    translationEn:
      "O Allah, I ask You for guidance, righteousness, chastity, and contentment of soul.",
    sourceReference: "صحيح مسلم 2721",
    contextEn: "Prophetic prayer for steadfastness on truth, moral integrity, and inner richness.",
  },
  {
    id: "dua_guidance_saddidni",
    category: "guidance",
    type: "prophetic",
    titleAr: "سؤال الهداية والسداد في القرار والأقوال",
    titleEn: "Seeking Guidance and Precision (Al-Huda was-Sadad)",
    arabicText: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي",
    transliteration: "Allahummahdini wa saddidni.",
    translationEn: "O Allah, guide me and direct me rightly upon precision and truth.",
    sourceReference: "صحيح مسلم 2725",
    contextEn:
      "A concise Prophetic prayer recalling the precision of aiming straight toward truth and righteous effort.",
  },
];

/* -------------------------------------------------------------------------- */
/* HADITH LIBRARY (الأربعون النووية ومختارات الصحيحين)                          */
/* -------------------------------------------------------------------------- */

interface _LegacyHadithRecord {
  id: string;
  collection: "nawawi_40" | "bukhari" | "muslim";
  collectionNameAr: string;
  collectionNameEn: string;
  numberInCollection: number;
  chapterTitleAr: string;
  chapterTitleEn: string;
  narratorAr: string;
  narratorEn: string;
  arabicMatn: string;
  englishTranslation: string;
  grade: "Sahih" | "Muttafaq 'Alayh";
  canonicalSource: string;
  takeawaysEn: string[];
}

const _LEGACY_HADITH_LIBRARY: _LegacyHadithRecord[] = [
  {
    id: "hadith_nawawi_01",
    collection: "nawawi_40",
    collectionNameAr: "الأربعون النووية",
    collectionNameEn: "An-Nawawi's 40 Hadith",
    numberInCollection: 1,
    chapterTitleAr: "الإخلاص والنية",
    chapterTitleEn: "Sincerity and Good Intentions",
    narratorAr: "أمير المؤمنين عمر بن الخطاب رضي الله عنه",
    narratorEn: "Amir al-Mu'minin Umar ibn al-Khattab (may Allah be pleased with him)",
    arabicMatn:
      "سَمِعْتُ رَسُولَ اللَّهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ يَقُولُ: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا، أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا، فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ».",
    englishTranslation:
      "I heard the Messenger of Allah (peace and blessings be upon him) say: 'Actions are judged by intentions, and every person will get what they intended. So whoever emigrated for worldly gain or to marry a woman, their emigration was for that which they emigrated.'",
    grade: "Muttafaq 'Alayh",
    canonicalSource: "صحيح البخاري (1) · صحيح مسلم (1907)",
    takeawaysEn: [
      "Every educational and personal act must be rooted in sincere intention.",
      "Outer accomplishments without honest inner purpose yield no lasting spiritual fruit.",
      "The foundation of all Islamic jurisprudence and human ethical action.",
    ],
  },
  {
    id: "hadith_nawawi_02",
    collection: "nawawi_40",
    collectionNameAr: "الأربعون النووية",
    collectionNameEn: "An-Nawawi's 40 Hadith",
    numberInCollection: 2,
    chapterTitleAr: "مراتب الدين: الإسلام والإيمان والإحسان",
    chapterTitleEn: "The Levels of Religion (Hadith Jibril)",
    narratorAr: "عمر بن الخطاب رضي الله عنه",
    narratorEn: "Umar ibn al-Khattab (may Allah be pleased with him)",
    arabicMatn:
      "بَيْنَمَا نَحْنُ جُلُوسٌ عِنْدَ رَسُولِ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ ذَاتَ يَوْمٍ إِذْ طَلَعَ عَلَيْنَا رَجُلٌ شَدِيدُ بَيَاضِ الثِّيَابِ، شَدِيدُ سَوَادِ الشَّعَرِ... قَالَ: يَا مُحَمَّدُ أَخْبِرْنِي عَنِ الْإِسْلَامِ... قَالَ: فَأَخْبِرْنِي عَنِ الْإِيمَانِ... قَالَ: فَأَخْبِرْنِي عَنِ الْإِحْسَانِ، قَالَ: «أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ»... قَالَ: «هَذَا جِبْرِيلُ أَتَاكُمْ يُعَلِّمُكُمْ دِينَكُمْ».",
    englishTranslation:
      "While we were sitting with the Messenger of Allah one day, there appeared before us a man with exceedingly white clothes and exceedingly black hair... He said: 'Tell me about Ihsan (excellence).' The Prophet replied: 'It is to worship Allah as if you see Him, and if you cannot see Him, then know that He sees you.'... The Prophet said: 'That was Jibril who came to teach you your religion.'",
    grade: "Sahih",
    canonicalSource: "صحيح مسلم (8)",
    takeawaysEn: [
      "Ihsan is the pursuit of excellence and conscious mindfulness of God in every action.",
      "Distinguishes outward practice (Islam), inward conviction (Iman), and spiritual mastery (Ihsan).",
      "Model pedagogical dialogue between teacher and student.",
    ],
  },
  {
    id: "hadith_nawawi_13",
    collection: "nawawi_40",
    collectionNameAr: "الأربعون النووية",
    collectionNameEn: "An-Nawawi's 40 Hadith",
    numberInCollection: 13,
    chapterTitleAr: "أخوة الإيمان ومحبة الخير للغير",
    chapterTitleEn: "Brotherhood & Wishing Good for Others",
    narratorAr: "أنس بن مالك رضي الله عنه خادم رسول الله ﷺ",
    narratorEn: "Anas ibn Malik (may Allah be pleased with him)",
    arabicMatn:
      "عَنْ أَبِي حَمْزَةَ أَنَسِ بْنِ مَالِكٍ رَضِيَ اللَّهُ عَنْهُ عَنِ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: «لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ».",
    englishTranslation:
      "The Prophet (peace and blessings be upon him) said: 'None of you truly believes until he loves for his brother what he loves for himself.'",
    grade: "Muttafaq 'Alayh",
    canonicalSource: "صحيح البخاري (13) · صحيح مسلم (45)",
    takeawaysEn: [
      "The pinnacle of social empathy and mutual support.",
      "Rejection of selfishness, envy, and exclusivity in knowledge or opportunity.",
      "Encourages active community sharing and peer mentoring.",
    ],
  },
  {
    id: "hadith_nawawi_18",
    collection: "nawawi_40",
    collectionNameAr: "الأربعون النووية",
    collectionNameEn: "An-Nawawi's 40 Hadith",
    numberInCollection: 18,
    chapterTitleAr: "التقوى وحسن الخلق",
    chapterTitleEn: "God-Consciousness & Beautiful Character",
    narratorAr: "أبو ذر ومعاذ بن جبل رضي الله عنهما",
    narratorEn: "Abu Dharr and Mu'adh ibn Jabal (may Allah be pleased with them)",
    arabicMatn:
      "عَنْ أَبِي ذَرٍّ جُنْدَبِ بْنِ جُنَادَةَ، وَأَبِي عَبْدِ الرَّحْمَنِ مُعَاذِ بْنِ جَبَلٍ رَضِيَ اللَّهُ عَنْهُمَا، عَنْ رَسُولِ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ قَالَ: «اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ».",
    englishTranslation:
      "The Messenger of Allah (peace and blessings be upon him) said: 'Fear Allah wherever you are, follow a bad deed with a good one and it will wipe it out, and treat people with good character.'",
    grade: "Sahih",
    canonicalSource: "جامع الترمذي (1987) · حديث حسن صحيح",
    takeawaysEn: [
      "Integrity is consistency across private solitude and public interaction.",
      "Human errors should immediately trigger restorative beneficial actions.",
      "Noble character is essential in interacting with all people.",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* ISLAMIC CALENDAR OCCASIONS & HIJRI CALCULATIONS                            */
/* -------------------------------------------------------------------------- */

export interface IslamicOccasion {
  id: string;
  titleAr: string;
  titleEn: string;
  hijriDay: number;
  hijriMonth: number; // 1-12
  hijriMonthNameAr: string;
  hijriMonthNameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  isConfirmedByMoonSightingNotice: true;
}

export const HIJRI_MONTHS_META = [
  { month: 1, nameAr: "مُحَرَّم", nameEn: "Muharram" },
  { month: 2, nameAr: "صَفَر", nameEn: "Safar" },
  { month: 3, nameAr: "رَبِيعُ الأَوَّل", nameEn: "Rabi' al-Awwal" },
  { month: 4, nameAr: "رَبِيعُ الآخِر", nameEn: "Rabi' al-Thani" },
  { month: 5, nameAr: "جُمَادَى الأُولَى", nameEn: "Jumada al-Ula" },
  { month: 6, nameAr: "جُمَادَى الآخِرَة", nameEn: "Jumada al-Akhirah" },
  { month: 7, nameAr: "رَجَب", nameEn: "Rajab" },
  { month: 8, nameAr: "شَعْبَان", nameEn: "Sha'ban" },
  { month: 9, nameAr: "رَمَضَان", nameEn: "Ramadan" },
  { month: 10, nameAr: "شَوَّال", nameEn: "Shawwal" },
  { month: 11, nameAr: "ذُو القَعْدَة", nameEn: "Dhul-Qi'dah" },
  { month: 12, nameAr: "ذُو الحِجَّة", nameEn: "Dhul-Hijjah" },
] as const;

export const IMPORTANT_ISLAMIC_OCCASIONS: IslamicOccasion[] = [
  {
    id: "occ_muharram_1",
    titleAr: "رأس السنة الهجرية",
    titleEn: "Islamic New Year (1st of Muharram)",
    hijriDay: 1,
    hijriMonth: 1,
    hijriMonthNameAr: "محرم",
    hijriMonthNameEn: "Muharram",
    descriptionAr: "ذكرى الهجرة النبوية المباركة وتجديد العزيمة على العمل الصالح.",
    descriptionEn: "Commemorating the Prophet's Hijrah from Makkah to Madinah.",
    isConfirmedByMoonSightingNotice: true,
  },
  {
    id: "occ_ashura",
    titleAr: "يوم عاشوراء",
    titleEn: "Day of Ashura (10th of Muharram)",
    hijriDay: 10,
    hijriMonth: 1,
    hijriMonthNameAr: "محرم",
    hijriMonthNameEn: "Muharram",
    descriptionAr: "يوم نجّى الله فيه موسى عليه السلام، ويُسن صيامه شكراً لله.",
    descriptionEn: "The day Allah delivered Prophet Musa; recommended fasting day.",
    isConfirmedByMoonSightingNotice: true,
  },
  {
    id: "occ_ramadan_start",
    titleAr: "غرة شهر رمضان المبارك",
    titleEn: "First Day of Blessed Ramadan",
    hijriDay: 1,
    hijriMonth: 9,
    hijriMonthNameAr: "رمضان",
    hijriMonthNameEn: "Ramadan",
    descriptionAr: "شهر الصيام والقيام ونزول القرآن الكريم وتضاعف الحسنات.",
    descriptionEn: "The holy month of fasting, nightly prayers, and Quranic revelation.",
    isConfirmedByMoonSightingNotice: true,
  },
  {
    id: "occ_laylatul_qadr",
    titleAr: "ليلة القدر المباركة (العشر الأواخر)",
    titleEn: "Laylatul Qadr (The Night of Decree)",
    hijriDay: 27,
    hijriMonth: 9,
    hijriMonthNameAr: "رمضان",
    hijriMonthNameEn: "Ramadan",
    descriptionAr: "خيرٌ من ألف شهر، تُرجى في الأوتار من العشر الأواخر من رمضان.",
    descriptionEn: "Better than a thousand months; sought in the odd nights of the last ten days.",
    isConfirmedByMoonSightingNotice: true,
  },
  {
    id: "occ_eid_fitr",
    titleAr: "عيد الفطر المبارك",
    titleEn: "Eid al-Fitr (1st of Shawwal)",
    hijriDay: 1,
    hijriMonth: 10,
    hijriMonthNameAr: "شوال",
    hijriMonthNameEn: "Shawwal",
    descriptionAr: "يوم فرح للمسلمين بإتمام صيام شهر رمضان المبارك وأداء زكاة الفطر.",
    descriptionEn: "Celebration of the completion of fasting and communal prayer.",
    isConfirmedByMoonSightingNotice: true,
  },
  {
    id: "occ_arafah",
    titleAr: "يوم عرفة المبارك",
    titleEn: "Day of Arafah (9th of Dhul-Hijjah)",
    hijriDay: 9,
    hijriMonth: 12,
    hijriMonthNameAr: "ذو الحجة",
    hijriMonthNameEn: "Dhul-Hijjah",
    descriptionAr: "أعظم أيام العام، ركن الحج الأكبر، ويُسن صيامه لغير الحاج.",
    descriptionEn: "The pinnacle day of Hajj pilgrimage and recommended fasting day.",
    isConfirmedByMoonSightingNotice: true,
  },
  {
    id: "occ_eid_adha",
    titleAr: "عيد الأضحى المبارك",
    titleEn: "Eid al-Adha (10th of Dhul-Hijjah)",
    hijriDay: 10,
    hijriMonth: 12,
    hijriMonthNameAr: "ذو الحجة",
    hijriMonthNameEn: "Dhul-Hijjah",
    descriptionAr: "يوم النحر وأعظم أيام الحج، اقتداءً بسيدنا إبراهيم عليه السلام.",
    descriptionEn: "The Festival of Sacrifice commemorating Prophet Ibrahim's devotion.",
    isConfirmedByMoonSightingNotice: true,
  },
];

/**
 * Converts a Gregorian date into an approximate Hijri date with manual offset adjustment.
 */
export function computeEstimatedHijriDate(
  date: Date,
  offsetDays = 0,
): {
  hijriYear: number;
  hijriMonth: number;
  hijriDay: number;
  monthNameAr: string;
  monthNameEn: string;
  formattedAr: string;
  formattedEn: string;
} {
  const adjusted = new Date(date.getTime() + offsetDays * 86400 * 1000);
  const jd = julianDay(adjusted.getFullYear(), adjusted.getMonth() + 1, adjusted.getDate());

  // Approximate Kuweit algorithm for Hijri calculation
  const l = Math.floor(jd - 1948440 + 10632);
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 =
    l2 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const m = Math.floor((24 * l3) / 709);
  const d = l3 - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;

  const monthIdx = Math.max(1, Math.min(12, m));
  const meta = HIJRI_MONTHS_META[monthIdx - 1] ?? HIJRI_MONTHS_META[0]!;

  return {
    hijriYear: y,
    hijriMonth: monthIdx,
    hijriDay: d,
    monthNameAr: meta.nameAr,
    monthNameEn: meta.nameEn,
    formattedAr: `${d} ${meta.nameAr} ${y} هـ`,
    formattedEn: `${d} ${meta.nameEn} ${y} AH`,
  };
}
