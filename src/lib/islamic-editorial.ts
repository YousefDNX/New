/**
 * Editorial Verification & Epistemic Governance Registry for BTC Islamic Center
 *
 * Ensures transparent source attribution, clear content lifecycle states, and honest
 * disclosure of review boundaries (no unverified external scholar council claim).
 */

export type EditorialVerificationStatus =
  "verified" | "needs_review" | "disputed" | "incomplete_source" | "unavailable" | "archived";

export interface EditorialStatusBadgeMeta {
  status: EditorialVerificationStatus;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export interface EditorialSourceCitation {
  status: EditorialVerificationStatus;
  sourceBookAr: string;
  sourceBookEn: string;
  scholarOrAuthorAr: string;
  scholarOrAuthorEn: string;
  referenceCode: string;
  hadithGrade?: string;
  scholarlyDifferenceNoteAr?: string;
  scholarlyDifferenceNoteEn?: string;
  reviewedDate: string;
}

export const EDITORIAL_STATUS_META: Record<EditorialVerificationStatus, EditorialStatusBadgeMeta> =
  {
    verified: {
      status: "verified",
      labelAr: "موثّق المصدر",
      labelEn: "Verified",
      descriptionAr: "مراجع مقابل مصدر كلاسيكي معتمد أو واجهة API موثوقة مع إسناد واضح.",
      descriptionEn:
        "Checked against named classical source texts or verified primary APIs with attribution.",
    },
    needs_review: {
      status: "needs_review",
      labelAr: "قيد المراجعة",
      labelEn: "Needs review",
      descriptionAr: "معلومة تعليمية أولية تحتاج مراجعة سند أو مقارنة طبعة أخرى.",
      descriptionEn: "Educational summary flagged for additional textual or edition verification.",
    },
    disputed: {
      status: "disputed",
      labelAr: "مسألة خلافية معتبرة",
      labelEn: "Disputed / Scholarly Ikhtilaf",
      descriptionAr: "مسألة فقهية اختلف فيها الفقهاء المعتبرون من أهل العلم؛ تُعرض آراؤها دون تعصب.",
      descriptionEn: "Recognized juristic disagreement among classical Sunni schools of Fiqh.",
    },
    incomplete_source: {
      status: "incomplete_source",
      labelAr: "مصدر جزئي",
      labelEn: "Incomplete source",
      descriptionAr: "النص أو التسجيل متاح جزئياً فقط ويُعرض بالقدر المتحقق دون إكمال اصطناعي.",
      descriptionEn: "Only partial chapters or excerpts exist in the verified upstream source.",
    },
    unavailable: {
      status: "unavailable",
      labelAr: "غير متوفر حالياً",
      labelEn: "Unavailable",
      descriptionAr: "مستبعد من العرض المباشر لعدم توفر مصدر موثوق أو إسناد مؤكد.",
      descriptionEn:
        "Intentionally withheld because verified audio/text attribution is not yet confirmed.",
    },
    archived: {
      status: "archived",
      labelAr: "أرشيف تاريخي",
      labelEn: "Archived",
      descriptionAr: "تسجيل أو وثيقة تراثية محفوظة بحالتها التاريخية الأصلية.",
      descriptionEn: "Historic archival material preserved in its original condition.",
    },
  };

export const BTC_EDITORIAL_DISCLOSURE = {
  reviewedDate: "2026-11-18",
  disclosureEn:
    "Honest Editorial Notice: BTC Islamic Center compiles educational summaries exclusively from named classical references and verified public APIs (Quran.com v4, AlQuran Cloud, MP3Quran.net v3). BTC does not currently operate an independent external Scholar Advisory Board or issue personal fatwas — always consult a qualified local scholar or recognized Dar al-Ifta institution for personal religious rulings.",
  disclosureAr:
    "إفصاح تحريري أمين: يجمع المركز الإسلامي في المنصة المواد التعليمية من المصادر الكلاسيكية المسمّاة وواجهات البيانات الموثوقة (Quran.com v4 وMP3Quran.net v3). لا تمتلك المنصة حالياً هيئة إفتاء أو مجلس علماء خارجي مستقل ولا تصدر فتاوى شخصية — استشر عالماً موثوقاً أو دار إفتاء معتمدة في مسائلك الخاصة.",
} as const;

export const ISLAMIC_MODULE_VERIFICATION_REGISTRY: ReadonlyArray<{
  moduleId: string;
  moduleNameAr: string;
  moduleNameEn: string;
  status: EditorialVerificationStatus;
  primarySourcesAr: string;
  primarySourcesEn: string;
  coverageScopeAr: string;
  coverageScopeEn: string;
  limitationsAr: string;
  limitationsEn: string;
}> = [
  {
    moduleId: "quran-text",
    moduleNameAr: "المصحف الشريف (النص العثماني)",
    moduleNameEn: "Quran Uthmani Text & Translations",
    status: "verified",
    primarySourcesAr: "Quran.com API v4 (رسم مجمع الملك فهد) + AlQuran Cloud",
    primarySourcesEn: "Quran.com API v4 (King Fahd Complex Uthmani Script) + AlQuran Cloud",
    coverageScopeAr: "١١٤ سورة و٦٠٤ صفحة كاملة بلا تحريف أو توليد آلي",
    coverageScopeEn: "Complete 114 Surahs & 604 pages verbatim, zero AI text generation",
    limitationsAr: "يتطلب اتصالاً بالإنترنت عند فتح سورة لم تُخزّن مؤقتاً بعد",
    limitationsEn: "Requires network access on first load of an uncached Surah or page",
  },
  {
    moduleId: "reciters-directory",
    moduleNameAr: "دليل القرّاء والتلاوات العالمي",
    moduleNameEn: "Global Reciters Directory & Audio Library",
    status: "verified",
    primarySourcesAr: "MP3Quran.net API v3 + QuranicAudio.com + التحقق البياني المباشر",
    primarySourcesEn: "MP3Quran.net API v3 + QuranicAudio.com + Live HTTP HEAD stream checks",
    coverageScopeAr: "تلاوات بشرية مسجلة بالسرعة الأصلية (١.٠×) مع حصر الدقيق للسور المتاحة",
    coverageScopeEn:
      "Authentic human studio recordings locked at 1.0x speed with exact Surah lists",
    limitationsAr:
      "٧ دول قيد الانتظار (PK, BD, TR, IR, NG, SN, GB) لعدم اعتماد روابط مباشرة موثقة بعد",
    limitationsEn:
      "7 requested countries remain pending until verified direct HTTPS chapter archives are confirmed",
  },
  {
    moduleId: "tafsir-center",
    moduleNameAr: "بوابة التفسير وعلوم القرآن",
    moduleNameEn: "Tafsir & Quran Understanding Portal",
    status: "verified",
    primarySourcesAr:
      "واجهة Quran.com v4 للتفسير (التفسير الميسر، السعدي، ابن كثير، الطبري، القرطبي)",
    primarySourcesEn:
      "Quran.com API v4 Tafsirs (Ibn Kathir Abridged EN, Ma'arif al-Qur'an, Muyassar, Sa'di, Tabari, Qurtubi)",
    coverageScopeAr: "فصل بصري صارم بين الآية، الترجمة، نص التفسير الكلاسيكي، والملخص التعليمي",
    coverageScopeEn:
      "Strict visual separation of Quran verse, translation, classical Tafsir, and educational overview",
    limitationsAr:
      "نصوص التفسير بالآية تجلب عبر الإنترنت؛ الملخصات التمهيدية متاحة دون اتصال لبعض السور الأساسية",
    limitationsEn:
      "Full verse-by-verse classical Tafsir requires internet access; offline themes cover selected core Surahs",
  },
  {
    moduleId: "tajweed-academy",
    moduleNameAr: "أكاديمية التجويد التفاعلية",
    moduleNameEn: "Interactive Tajweed Academy",
    status: "verified",
    primarySourcesAr: "تحفة الأطفال (الجمزوري) والمقدمة الجزرية (ابن الجزري)",
    primarySourcesEn: "Tuhfat al-Atfal (Al-Jamzuri) & Al-Muqaddimah Al-Jazariyyah (Ibn Al-Jazari)",
    coverageScopeAr: "دروس النون والميم الساكنتين، المدود، القلقلة، التفخيم، واختبارات تطبيقية",
    coverageScopeEn:
      "Structured lessons across Noon/Meem Sakinah, Madd, Qalqalah, Tafkheem, and quizzes",
    limitationsAr: "التعلم الذاتي لا يغني عن المشافهة والتلقي على شيخ مجاز لتصحيح المخارج",
    limitationsEn:
      "Self-study cannot replace live oral correction (Talaqqi) with a qualified teacher",
  },
  {
    moduleId: "hadith-sunnah",
    moduleNameAr: "السنة النبوية والأربعون النووية",
    moduleNameEn: "Forty Nawawi & Daily Sunnah",
    status: "verified",
    primarySourcesAr: "صحيح البخاري، صحيح مسلم، الأربعون النووية، حصن المسلم، رياض الصالحين",
    primarySourcesEn:
      "Sahih al-Bukhari, Sahih Muslim, Forty Nawawi, Hisn al-Muslim, Riyad as-Salihin",
    coverageScopeAr: "الأحاديث الأربعون كاملة + سنن يومية مميّزة بين الفرض والمندوب مع درجة الحديث",
    coverageScopeEn:
      "Complete 40 Nawawi + Daily Sunnah entries with explicit authenticity grade and ruling distinction",
    limitationsAr: "تخريج الحديث المعروض يقتصر على الكتب المتفق على توثيقها ولا يشمل مرويات ضعيفة",
    limitationsEn: "Focused on authenticated primary collections; omits weak/unverified narrations",
  },
  {
    moduleId: "fiqh-library",
    moduleNameAr: "الموسوعة الفقهية التعليمية",
    moduleNameEn: "Educational Fiqh & Rulings Reference",
    status: "disputed",
    primarySourcesAr:
      "الفقه الميسر، الموسوعة الفقهية، المذاهب الأربعة (الحنفي، المالكي، الشافعي، الحنبلي)",
    primarySourcesEn: "Classical Sunni Jurisprudence Overview (Hanafi, Maliki, Shafi'i, Hanbali)",
    coverageScopeAr: "أحكام الطهارة، الصلاة، الصيام، الزكاة، الحلال والحرام، وآداب الطالب والتقنية",
    coverageScopeEn:
      "Purification, Prayer, Fasting, Zakah basics, Halal principles, and student digital ethics",
    limitationsAr: "مرجع تعليمي عام فقط؛ المسائل الشخصية والنوازل تحال إلى أهل الفتوى المختصين",
    limitationsEn:
      "Strictly educational reference — personal rulings and complex cases require qualified scholars",
  },
];
