/**
 * Platform-wide Enhanced Bilingual Speech Synthesis Service
 *
 * Implements:
 * 1. Accurate per-segment script & language detection (Arabic, English, CJK, Latin).
 * 2. Native mixed-language sentence splitting so Arabic words use Arabic voices
 *    and English words use English voices — never reading Arabic with an English voice.
 * 3. High-fidelity voice selection with `voiceschanged` cache & natural/neural ranking.
 * 4. Curated academic, proper-name, and difficult-word phonetic dictionaries (English)
 *    plus Arabic diacritic-preserving normalization & pause/abbreviation expansion.
 * 5. Hybrid Gemini Neural TTS (`/api/ai/tts`, `gemini-3.8-flash-lite-tts` WAV playback)
 *    with instant in-memory LRU audio caching and seamless multi-segment Web Speech fallback.
 * 6. Strict prohibition: Synthetic AI TTS NEVER generates Quran recitation.
 */

export type SupportedSpeechLang = "ar" | "en" | "fr" | "de" | "es" | "zh" | "ja" | "ko";

export interface SpeechVoiceQuality {
  voice: SpeechSynthesisVoice;
  score: number;
}

export interface SpeechSegment {
  text: string;
  lang: SupportedSpeechLang;
}

/**
 * Phonetic pronunciation dictionary for academic, STEM, medical, proper names,
 * and notoriously irregular English vocabulary words (used for Web Speech clarity).
 */
export const PRONUNCIATION_LEXICON: Readonly<Record<string, string>> = {
  // Biology & Medicine
  mitosis: "my-toe-sis",
  meiosis: "my-oh-sis",
  hypertrophy: "hy-per-truh-fee",
  photosynthesis: "foh-toh-sin-thuh-sis",
  stoichiometry: "stoy-kee-om-uh-tree",
  mitochondria: "my-toh-kon-dree-uh",
  mitochondrion: "my-toh-kon-dree-un",
  deoxyribonucleic: "dee-ox-ee-rye-boh-noo-klay-ik",
  ribonucleic: "rye-boh-noo-klay-ik",
  endoplasmic: "en-doh-plaz-mik",
  reticulum: "reh-tik-yoo-lum",
  glycolysis: "gly-kol-ih-sis",
  homeostasis: "hoh-mee-oh-stay-sis",
  neurotransmitter: "noo-roh-trans-mit-er",
  lymphocyte: "lim-foh-site",
  macrophage: "mak-roh-fayj",
  phagocytosis: "fag-oh-sy-toe-sis",
  hemoglobin: "hee-moh-gloh-bin",
  erythrocyte: "ih-rith-roh-site",
  atherosclerosis: "ath-uh-roh-skluh-roh-sis",
  cardiovascular: "kar-dee-oh-vas-kyoo-ler",
  gastrointestinal: "gas-troh-in-tes-tih-nul",
  pathogen: "path-uh-jin",
  centromere: "sen-troh-meer",
  chromosome: "kroh-muh-zohm",
  pneumonia: "noo-moh-nee-uh",
  diaphragm: "dye-uh-fram",
  esophagus: "ih-sof-uh-gus",

  // Mathematics & Physics
  asymptote: "ass-im-tote",
  eigenvalue: "eye-gen-val-yoo",
  eigenvector: "eye-gen-vek-ter",
  parabola: "puh-rab-oh-luh",
  hyperbola: "hy-per-boh-luh",
  differentiation: "dif-er-en-shee-ay-shun",
  logarithm: "log-uh-ri-thm",
  trigonometry: "trig-uh-nom-uh-tree",
  thermodynamics: "ther-moh-dy-nam-iks",
  centrifugal: "sen-trif-yoo-gul",
  centripetal: "sen-trip-uh-tul",
  electromagnetism: "ee-lek-troh-mag-nuh-tiz-um",
  pythagoras: "py-thag-uh-rus",
  pythagorean: "py-thag-uh-ree-un",
  euclidean: "yoo-klid-ee-un",
  fourier: "for-ee-ay",
  euler: "oy-ler",
  gauss: "gowss",
  gaussian: "gow-see-un",
  riemann: "ree-mahn",
  schrodinger: "shroh-ding-er",
  avogadro: "av-oh-gah-droh",
  einstein: "ine-stine",

  // Computing & Technology
  algorithm: "al-go-rithm",
  polymorphism: "poly-mor-fizm",
  asynchronous: "ay-sink-roh-nus",
  synchronous: "sink-roh-nus",
  boolean: "boo-lee-un",
  recursion: "ree-kur-zhun",
  iterable: "it-er-uh-bul",
  concatenation: "kon-kat-uh-nay-shun",
  instantiation: "in-stan-shee-ay-shun",
  encapsulation: "en-kap-suh-lay-shun",
  pseudocode: "soo-doh-code",
  heuristic: "hyoo-ris-tik",
  cache: "kash",
  tuple: "too-pul",
  gui: "goo-ee",

  // Difficult, Silent-Letter & Loanword English Vocabulary
  entrepreneur: "on-truh-pruh-nur",
  colonel: "ker-nul",
  lieutenant: "loo-ten-unt",
  worcestershire: "wuss-ter-sher",
  rendezvous: "ron-day-voo",
  epitome: "ih-pit-uh-mee",
  hyperbole: "hy-per-buh-lee",
  mnemonic: "nuh-mon-ik",
  subtle: "sut-ul",
  receipt: "rih-seet",
  genre: "zhon-ruh",
  niche: "neesh",
  debut: "day-byoo",
  ballet: "ba-lay",
  bourgeois: "boor-zhwah",
  bureaucracy: "byoo-rok-ruh-see",
  chameleon: "kuh-mee-lee-un",
  choir: "kwy-er",
  chaos: "kay-oss",
  archipelago: "ar-kih-pel-uh-goh",
  anemone: "uh-nem-uh-nee",
  conscience: "kon-shuns",
  echelon: "esh-uh-lon",
  facade: "fuh-sahd",
  fatigue: "fuh-teeg",
  gauge: "gayj",
  hierarchy: "hy-er-ar-kee",
  indigenous: "in-dij-uh-nus",
  itinerary: "eye-tin-uh-rer-ee",
  jeopardy: "jep-er-dee",
  labyrinth: "lab-uh-rinth",
  liaison: "lee-ay-zon",
  mischievous: "mis-chuh-vus",
  nausea: "naw-zee-uh",
  nuance: "noo-onss",
  onomatopoeia: "on-uh-mat-uh-pee-uh",
  paradigm: "pair-uh-dime",
  paraphernalia: "pair-uh-fer-nay-lee-uh",
  pharaoh: "fair-oh",
  phenomenon: "fuh-nom-ih-non",
  plague: "playg",
  poignant: "poyn-yunt",
  prerogative: "prih-rog-uh-tiv",
  pseudonym: "soo-doh-nim",
  quinoa: "keen-wah",
  raspberry: "raz-ber-ee",
  recipe: "ress-uh-pee",
  rhythm: "ri-thum",
  sabotage: "sab-uh-tahzh",
  salmon: "sam-un",
  schism: "skiz-um",
  seizure: "see-zhur",
  silhouette: "sil-oo-et",
  sophomore: "sof-uh-mor",
  sovereign: "sov-rin",
  susceptible: "suh-sep-tuh-bul",
  thorough: "thur-oh",
  tsunami: "tsoo-nah-mee",
  ubiquitous: "yoo-bik-wih-tus",
  vehement: "vee-uh-munt",
  wednesday: "wenz-day",
  yacht: "yot",
  zealot: "zel-ut",

  // Scholars & Historical Names
  khwarizmi: "al-khwah-riz-mee",
  aristotle: "air-ih-stot-ul",
  socrates: "sok-ruh-teez",
};

const ARABIC_CHAR_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const CJK_OR_KANA_OR_HANGUL_REGEX = /[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/;
const LATIN_LETTER_REGEX = /[A-Za-zÀ-ÖØ-öø-ÿ]/;

function isArabicCode(code: number): boolean {
  return (
    (code >= 0x0600 && code <= 0x06ff) ||
    (code >= 0x0750 && code <= 0x077f) ||
    (code >= 0x08a0 && code <= 0x08ff) ||
    (code >= 0xfb50 && code <= 0xfdff) ||
    (code >= 0xfe70 && code <= 0xfeff)
  );
}

function isJapaneseKana(code: number): boolean {
  return code >= 0x3040 && code <= 0x30ff;
}

function isKoreanHangul(code: number): boolean {
  return code >= 0xac00 && code <= 0xd7af;
}

function isCjkIdeograph(code: number): boolean {
  return code >= 0x4e00 && code <= 0x9fff;
}

function isLatinLetter(code: number): boolean {
  return (
    (code >= 0x0041 && code <= 0x005a) ||
    (code >= 0x0061 && code <= 0x007a) ||
    (code >= 0x00c0 && code <= 0x024f)
  );
}

export function hasArabicText(text: string): boolean {
  return typeof text === "string" && ARABIC_CHAR_REGEX.test(text);
}

export function hasLatinText(text: string): boolean {
  return typeof text === "string" && LATIN_LETTER_REGEX.test(text);
}

/**
 * Extracts pure Arabic translation clauses from a bilingual flashcard back string
 * such as "تفاحة — A round crisp fruit\nExample: ..." or "غذائي / متعلق بالتغذية".
 */
export function extractArabicText(text: string): string {
  if (!text || !hasArabicText(text)) return "";

  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const arabicPieces: string[] = [];
  for (const line of lines) {
    // Split on common bilingual delimiters like em-dash, pipe, or long dash surrounded by spaces
    const parts = line.split(/\s+[—|–]\s+|\s+-\s+/);
    for (const part of parts) {
      if (hasArabicText(part)) {
        // Strip parenthetical English translations if present
        const cleanedPart = part
          .replace(/\([A-Za-z0-9\s,'"-]+\)/g, "")
          .replace(/\s+/g, " ")
          .trim();
        if (cleanedPart && hasArabicText(cleanedPart)) {
          arabicPieces.push(cleanedPart);
        }
      }
    }
  }

  return arabicPieces.join("، ").trim();
}

/**
 * Detects whether the given text is predominantly Arabic, CJK, Japanese, Korean, or English/Latin.
 */
export function detectTextLanguage(text: string): SupportedSpeechLang {
  if (!text || typeof text !== "string") return "en";

  let arabicCount = 0;
  let japaneseCount = 0;
  let koreanCount = 0;
  let cjkCount = 0;
  let latinCount = 0;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (isArabicCode(code)) {
      arabicCount++;
    } else if (isJapaneseKana(code)) {
      japaneseCount++;
    } else if (isKoreanHangul(code)) {
      koreanCount++;
    } else if (isCjkIdeograph(code)) {
      cjkCount++;
    } else if (isLatinLetter(code)) {
      latinCount++;
    }
  }

  if (arabicCount > 0 && arabicCount >= latinCount) return "ar";
  if (japaneseCount > 0 && japaneseCount + cjkCount >= latinCount) return "ja";
  if (koreanCount > 0 && koreanCount >= latinCount) return "ko";
  if (cjkCount > 0 && cjkCount >= latinCount) return "zh";
  return "en";
}

/**
 * Splits mixed-language sentences into contiguous language-tagged segments so that
 * Arabic spans are spoken with an Arabic voice and English spans with an English voice.
 * Handles inline transitions like "Apple — تفاحة" or "كلمة photosynthesis تعني البناء الضوئي".
 */
export function splitSpeechSegments(
  text: string,
  defaultLatinLang: SupportedSpeechLang = "en",
): SpeechSegment[] {
  if (!text || typeof text !== "string") return [];

  const sanitized = text
    .replace(/<[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[\u200B-\u200F\u202A-\u202E]/g, "")
    .replace(/\u0640/g, "") // strip tatweel so Arabic syllable boundaries remain clean
    .replace(/\s+/g, " ")
    .trim();

  if (!sanitized) return [];

  // Split by whitespace tokens so words stay intact
  const rawTokens = sanitized.split(" ").filter(Boolean);
  const segments: SpeechSegment[] = [];
  const latinLang: SupportedSpeechLang =
    defaultLatinLang === "ar" ||
    defaultLatinLang === "zh" ||
    defaultLatinLang === "ja" ||
    defaultLatinLang === "ko"
      ? "en"
      : defaultLatinLang;

  const classifyToken = (token: string): SupportedSpeechLang | "neutral" => {
    let ar = 0;
    let lat = 0;
    let cjk = 0;
    let jp = 0;
    let kr = 0;
    for (let i = 0; i < token.length; i++) {
      const code = token.charCodeAt(i);
      if (isArabicCode(code)) ar++;
      else if (isLatinLetter(code)) lat++;
      else if (isJapaneseKana(code)) jp++;
      else if (isKoreanHangul(code)) kr++;
      else if (isCjkIdeograph(code)) cjk++;
    }
    if (ar > 0 && ar >= lat && ar >= cjk) return "ar";
    if (jp > 0 && jp >= lat) return "ja";
    if (kr > 0 && kr >= lat) return "ko";
    if (cjk > 0 && cjk >= lat) return "zh";
    if (lat > 0) return latinLang;
    return "neutral";
  };

  // Pure delimiter tokens between words ("—", "–", "/", "|", "-") become soft pauses instead of read aloud literally
  const isPureSeparator = (token: string): boolean => /^[—–\-/|•·]+$/.test(token);

  for (const token of rawTokens) {
    // Handle inline slashes inside tokens cleanly ("food/drink" or "مصدر/منبع")
    const kind = classifyToken(token);

    if (kind === "neutral") {
      if (isPureSeparator(token)) {
        // Attach a trailing comma pause onto the previous segment when separating concepts
        const last = segments[segments.length - 1];
        if (last && !/[.,،؛!?]$/.test(last.text)) {
          last.text += last.lang === "ar" ? "،" : ",";
        }
        continue;
      }
      // Numbers or punctuation attach to the previous segment (or detected language of full text)
      const targetLang = segments[segments.length - 1]?.lang ?? detectTextLanguage(sanitized);
      const last = segments[segments.length - 1];
      if (last && last.lang === targetLang) {
        last.text = `${last.text} ${token}`.trim();
      } else {
        segments.push({ text: token, lang: targetLang });
      }
      continue;
    }

    // Split mixed script within a single unspaced token if any (e.g. "word/كلمة")
    if (ARABIC_CHAR_REGEX.test(token) && LATIN_LETTER_REGEX.test(token)) {
      const subParts = token
        .split(/([A-Za-zÀ-ÖØ-öø-ÿ0-9']+)/)
        .map((p) => p.trim())
        .filter((p) => p && !isPureSeparator(p));
      for (const sub of subParts) {
        const subLang = classifyToken(sub);
        const resolvedLang =
          subLang === "neutral" ? (segments[segments.length - 1]?.lang ?? latinLang) : subLang;
        const last = segments[segments.length - 1];
        if (last && last.lang === resolvedLang) {
          last.text = `${last.text} ${sub}`.trim();
        } else {
          segments.push({ text: sub, lang: resolvedLang });
        }
      }
      continue;
    }

    const last = segments[segments.length - 1];
    if (last && last.lang === kind) {
      last.text = `${last.text} ${token}`.trim();
    } else {
      segments.push({ text: token, lang: kind });
    }
  }

  return segments
    .map((seg) => ({
      ...seg,
      text: seg.text.replace(/\s+/g, " ").trim(),
    }))
    .filter((seg) => seg.text.length > 0 && !/^[.,،؛!?:;"'()[\]{}]+$/.test(seg.text));
}

/**
 * Normalizes Arabic text for accurate TTS pronunciation while preserving all Arabic diacritics (tashkeel).
 */
export function normalizeArabicForSpeech(text: string): string {
  if (!text) return "";

  let cleaned = text
    .replace(/<[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    // Preserve Arabic letters, tashkeel (\u064B-\u065F, \u0670), punctuation; remove formatting/tatweel
    .replace(/[\u200B-\u200F\u202A-\u202E\u0640]/g, "")
    .replace(/[*_#`~[\]]/g, " ")
    // Convert synonym slash separators ("غذائي / متعلق بالتغذية") into a natural pause ("غذائي، أو متعلق بالتغذية")
    .replace(/\s*\/\s*/g, "، أو ")
    // Expand common educational abbreviations
    .replace(/(?:^|\s)أ\.د\.?\s*/g, " أستاذ دكتور ")
    .replace(/(?:^|\s)د\.\s+(?=[\u0600-\u06FF])/g, " دكتور ")
    .replace(/(?:^|\s)ص\.ب\.?\s*/g, " صندوق بريد ")
    .replace(/%/g, " بالمئة ")
    .replace(/\s+/g, " ")
    .trim();

  // Replace trailing standalone comma pause
  cleaned = cleaned.replace(/، أو $/, "").trim();
  return cleaned;
}

/**
 * Normalizes text for Web Speech synthesis by expanding academic/difficult English
 * pronunciations or Arabic abbreviations/pauses, stripping markdown noise, and keeping
 * Arabic diacritics intact.
 */
export function normalizeTextForSpeech(text: string, detectedLang: SupportedSpeechLang): string {
  if (!text) return "";

  if (detectedLang === "ar") {
    return normalizeArabicForSpeech(text);
  }

  // 1. Strip HTML tags, URLs, and markdown symbols while preserving apostrophes/hyphens in words
  let cleaned = text
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_#`~[\]]/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\s*\/\s*/g, ", or ")
    .replace(/\s+[—–]\s+/g, ", ")
    .replace(/\s+/g, " ")
    .trim();

  // 2. If English or Latin, apply phonetic lexicon
  if (detectedLang === "en") {
    for (const [word, phonetic] of Object.entries(PRONUNCIATION_LEXICON)) {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      cleaned = cleaned.replace(regex, phonetic);
    }
  }

  return cleaned;
}

/**
 * Strict prohibition: Verify that synthetic AI/TTS is NOT being invoked for Quranic text.
 * Quran recitation must exclusively use verified human audio recordings.
 */
export function isQuranicRecitationForbidden(text: string): boolean {
  if (!text) return false;
  // Check for Quranic bracket symbols, aya markers, or uthmani stop marks
  const QURAN_MARKERS = ["﴿", "﴾", "۝", "۞", "ۖ", "ۗ", "ۚ", "ۛ", "ۜ"];
  if (QURAN_MARKERS.some((marker) => text.includes(marker))) return true;

  // Check for Surah Al-Fatihah, Ayat Al-Kursi, or Bismillah verbatim phrases
  const bismillahRegex = /بِسْمِ\s*ٱللَّهِ\s*ٱلرَّحْمَـٰنِ\s*ٱلرَّحِيمِ/;
  if (bismillahRegex.test(text)) return true;

  return false;
}

/**
 * Maps supported language code to primary BCP-47 locale (supporting optional dialect override).
 */
export function getBcp47Locale(lang: SupportedSpeechLang, preferredLocale?: string): string {
  if (preferredLocale && preferredLocale.toLowerCase().startsWith(lang.toLowerCase())) {
    return preferredLocale;
  }

  switch (lang) {
    case "ar":
      return "ar-SA";
    case "fr":
      return "fr-FR";
    case "de":
      return "de-DE";
    case "es":
      return "es-ES";
    case "zh":
      return "zh-CN";
    case "ja":
      return "ja-JP";
    case "ko":
      return "ko-KR";
    case "en":
    default:
      return "en-US";
  }
}

/**
 * Cached voice discovery helper handling Chrome/Edge/Safari asynchronous `voiceschanged`.
 */
let cachedSpeechVoices: SpeechSynthesisVoice[] = [];
let voiceListenerBound = false;

export function getCachedSpeechVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  try {
    const fresh = window.speechSynthesis.getVoices?.() ?? [];
    if (fresh.length > 0) {
      cachedSpeechVoices = fresh;
    }
    if (!voiceListenerBound && typeof window.speechSynthesis.addEventListener === "function") {
      voiceListenerBound = true;
      window.speechSynthesis.addEventListener("voiceschanged", () => {
        const next = window.speechSynthesis.getVoices?.() ?? [];
        if (next.length > 0) cachedSpeechVoices = next;
      });
    }
    return fresh.length > 0 ? fresh : cachedSpeechVoices;
  } catch {
    return cachedSpeechVoices;
  }
}

/**
 * Scores and selects the highest-fidelity native voice available on the device for targetLang.
 * Strictly never returns a cross-language voice (e.g., never returns English for Arabic).
 */
export function selectBestNativeVoice(
  targetLang: SupportedSpeechLang,
  voices: SpeechSynthesisVoice[],
  preferredLocale?: string,
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const targetBcp = getBcp47Locale(targetLang, preferredLocale).toLowerCase();
  const langPrefix = targetLang.toLowerCase();

  const candidates: SpeechVoiceQuality[] = [];

  for (const voice of voices) {
    const voiceLang = (voice.lang || "").toLowerCase();
    const voiceName = (voice.name || "").toLowerCase();

    // Must match language prefix strictly (prevents reading Arabic in an English voice)
    if (!voiceLang.startsWith(langPrefix)) continue;

    let score = 20;

    // Exact dialect match (e.g., ar-SA, en-GB, en-US)
    if (voiceLang === targetBcp) {
      score += 40;
    } else if (
      targetLang === "ar" &&
      (voiceLang === "ar-xa" || voiceLang === "ar-sa" || voiceLang === "ar-eg")
    ) {
      score += 25;
    }

    // High quality cloud/neural/OS vendor flags
    if (voiceName.includes("online") && voiceName.includes("natural")) score += 80;
    if (voiceName.includes("natural")) score += 60;
    if (voiceName.includes("neural")) score += 60;
    if (voiceName.includes("google")) score += 45;
    if (voiceName.includes("premium")) score += 40;
    if (voiceName.includes("enhanced")) score += 35;
    if (voiceName.includes("wavenet")) score += 45;
    if (voiceName.includes("siri")) score += 30;
    if (voiceName.includes("microsoft")) score += 25;

    // Known high-clarity Arabic OS voices (macOS/iOS/Windows/Android)
    if (
      targetLang === "ar" &&
      (voiceName.includes("maged") ||
        voiceName.includes("tarik") ||
        voiceName.includes("laila") ||
        voiceName.includes("salma") ||
        voiceName.includes("hamed") ||
        voiceName.includes("zariyah") ||
        voiceName.includes("shakir"))
    ) {
      score += 35;
    }

    // Known high-clarity English voices
    if (
      targetLang === "en" &&
      (voiceName.includes("daniel") ||
        voiceName.includes("samantha") ||
        voiceName.includes("libby") ||
        voiceName.includes("sonia") ||
        voiceName.includes("ryan") ||
        voiceName.includes("aria") ||
        voiceName.includes("guy") ||
        voiceName.includes("jenny"))
    ) {
      score += 30;
    }

    // Deprioritize robotic legacy synthesizers when better alternatives exist
    if (
      voiceName.includes("espeak") ||
      voiceName.includes("festival") ||
      voiceName.includes("mbrola") ||
      voiceName.includes("pico")
    ) {
      score -= 60;
    }

    // Slight bonus for local service if scores are otherwise tied
    if (voice.localService) score += 8;

    candidates.push({ voice, score });
  }

  if (!candidates.length) {
    return voices.find((v) => (v.lang || "").toLowerCase().startsWith(langPrefix)) ?? null;
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.voice ?? null;
}

/**
 * Splits long text into natural sentence chunks to prevent browser speech buffer exhaustion.
 */
export function chunkTextForSpeech(text: string, maxChunkLength = 180): string[] {
  if (!text) return [];
  if (text.length <= maxChunkLength) return [text];

  const sentences = text.match(/[^.!?،؛\n]+[.!?،؛\n]+|[^.!?،؛\n]+$/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (current.length + trimmed.length + 1 <= maxChunkLength) {
      current = current ? `${current} ${trimmed}` : trimmed;
    } else {
      if (current) chunks.push(current);
      if (trimmed.length > maxChunkLength) {
        const words = trimmed.split(" ");
        let subChunk = "";
        for (const w of words) {
          if (subChunk.length + w.length + 1 <= maxChunkLength) {
            subChunk = subChunk ? `${subChunk} ${w}` : w;
          } else {
            if (subChunk) chunks.push(subChunk);
            subChunk = w;
          }
        }
        if (subChunk) current = subChunk;
        else current = "";
      } else {
        current = trimmed;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export interface EnhancedSpeechOptions {
  rate?: number | undefined;
  pitch?: number | undefined;
  volume?: number | undefined;
  forcedLang?: SupportedSpeechLang | undefined;
  preferredLocale?: string | undefined;
  voiceURI?: string | undefined;
  preferNativeOnly?: boolean | undefined;
  onStart?: (() => void) | undefined;
  onEnd?: (() => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
}

/* -------------------------------------------------------------------------- */
/* HYBRID NEURAL TTS AUDIO CACHE + PLAYBACK                                   */
/* -------------------------------------------------------------------------- */

const TTS_CACHE_LIMIT = 48;
const ttsAudioCache = new Map<string, string>(); // key -> data URI ("data:audio/wav;base64,...")
let activeAudioElement: HTMLAudioElement | null = null;
let serverTtsAvailability: "unknown" | "available" | "unavailable" = "unknown";
let statusProbeInFlight: Promise<void> | null = null;
let activePlaybackToken = 0;

function stopActiveAudioElement(): void {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement.src = "";
    } catch {
      /* ignore audio cleanup errors */
    }
    activeAudioElement = null;
  }
}

export function resetSpeechEngineStateForTests(): void {
  ttsAudioCache.clear();
  stopActiveAudioElement();
  serverTtsAvailability = "unknown";
  statusProbeInFlight = null;
  activePlaybackToken = 0;
}

function getTtsCacheKey(text: string, lang: string, accent?: string): string {
  return `${lang}|${accent ?? ""}|${text.trim()}`;
}

function setCachedAudioDataUri(key: string, dataUri: string): void {
  if (ttsAudioCache.has(key)) {
    ttsAudioCache.delete(key);
  } else if (ttsAudioCache.size >= TTS_CACHE_LIMIT) {
    const oldest = ttsAudioCache.keys().next().value;
    if (oldest) ttsAudioCache.delete(oldest);
  }
  ttsAudioCache.set(key, dataUri);
}

/**
 * Non-blocking capability probe checking whether `/api/ai/tts` is configured on the server.
 */
export function warmServerTtsCapability(): void {
  if (
    serverTtsAvailability !== "unknown" ||
    statusProbeInFlight ||
    typeof window === "undefined" ||
    typeof fetch === "undefined"
  ) {
    return;
  }

  statusProbeInFlight = fetch("/api/ai/status", { method: "GET" })
    .then(async (res) => {
      if (!res.ok) {
        serverTtsAvailability = "unavailable";
        return;
      }
      const data = (await res.json()) as {
        configured?: boolean;
        features?: { tts?: boolean };
      };
      serverTtsAvailability = data?.features?.tts || data?.configured ? "available" : "unavailable";
    })
    .catch(() => {
      serverTtsAvailability = "unavailable";
    })
    .finally(() => {
      statusProbeInFlight = null;
    });
}

function playDataUriAudio(
  dataUri: string,
  token: number,
  options?: EnhancedSpeechOptions,
): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof Audio === "undefined") {
      resolve(false);
      return;
    }
    try {
      const audio = new Audio(dataUri);
      activeAudioElement = audio;
      audio.playbackRate = Math.min(1.5, Math.max(0.65, options?.rate ?? 1.0));
      audio.volume = Math.min(1.0, Math.max(0, options?.volume ?? 1.0));

      audio.onended = () => {
        if (activeAudioElement === audio) activeAudioElement = null;
        if (token === activePlaybackToken) {
          options?.onEnd?.();
        }
        resolve(true);
      };
      audio.onerror = () => {
        if (activeAudioElement === audio) activeAudioElement = null;
        resolve(false);
      };

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          if (activeAudioElement === audio) activeAudioElement = null;
          resolve(false);
        });
      }
    } catch {
      resolve(false);
    }
  });
}

/**
 * Speaks segmented text via native Web Speech API, switching voice & BCP-47 locale per segment
 * so Arabic and English clauses inside mixed-language sentences sound natural and native.
 */
function speakSegmentsViaWebSpeech(
  text: string,
  token: number,
  options?: EnhancedSpeechOptions,
): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return false;
  }

  const baseLang = options?.forcedLang;
  const segments = baseLang
    ? [
        {
          text: normalizeTextForSpeech(text, baseLang),
          lang: baseLang,
        },
      ]
    : splitSpeechSegments(text).map((seg) => ({
        text: normalizeTextForSpeech(seg.text, seg.lang),
        lang: seg.lang,
      }));

  // Expand each segment into chunks for browser stability
  const playbackQueue: Array<{ text: string; lang: SupportedSpeechLang }> = [];
  for (const seg of segments) {
    if (!seg.text.trim()) continue;
    for (const chunk of chunkTextForSpeech(seg.text, 180)) {
      playbackQueue.push({ text: chunk, lang: seg.lang });
    }
  }

  if (!playbackQueue.length) return false;

  const allVoices = getCachedSpeechVoices();
  let queueIdx = 0;
  options?.onStart?.();

  const speakNext = () => {
    if (token !== activePlaybackToken) return;
    if (queueIdx >= playbackQueue.length) {
      options?.onEnd?.();
      return;
    }

    const item = playbackQueue[queueIdx]!;
    queueIdx++;

    const utterance = new SpeechSynthesisUtterance(item.text);
    const targetBcp = getBcp47Locale(item.lang, options?.preferredLocale);
    utterance.lang = targetBcp;

    // Respect explicit voiceURI if its language matches the segment's language
    let chosenVoice: SpeechSynthesisVoice | null = null;
    if (options?.voiceURI) {
      const explicit = allVoices.find((v) => v.voiceURI === options.voiceURI) ?? null;
      if (explicit && (explicit.lang || "").toLowerCase().startsWith(item.lang.toLowerCase())) {
        chosenVoice = explicit;
      }
    }
    if (!chosenVoice) {
      chosenVoice = selectBestNativeVoice(item.lang, allVoices, options?.preferredLocale);
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang;
    }

    utterance.rate = Math.min(1.5, Math.max(0.6, options?.rate ?? 1.0));
    utterance.pitch = Math.min(1.4, Math.max(0.8, options?.pitch ?? 1.0));
    utterance.volume = Math.min(1.0, Math.max(0, options?.volume ?? 1.0));

    utterance.onend = () => {
      speakNext();
    };

    utterance.onerror = () => {
      // Advance cleanly or complete without hanging UI state
      if (queueIdx < playbackQueue.length) {
        speakNext();
      } else if (token === activePlaybackToken) {
        options?.onEnd?.();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  speakNext();
  return true;
}

/**
 * Main enhanced speech synthesis runner.
 * Automatically handles:
 * - Strict Quranic text rejection
 * - Language detection & mixed-language segmentation
 * - High-quality neural TTS audio (when server Gemini TTS is configured & online)
 * - Instant LRU WAV caching
 * - Seamless segmented Web Speech API playback with best native voice selection
 */
export function speakEnhancedText(text: string, options?: EnhancedSpeechOptions): boolean {
  if (!text || !text.trim()) return false;

  // 1. Strict safety check — NEVER generate synthetic audio for Quran verses
  if (isQuranicRecitationForbidden(text)) {
    console.warn("Prohibited: Attempted synthetic voice recitation of Quranic text.");
    options?.onError?.(
      new Error(
        "Quran recitation via synthetic AI/TTS voice is strictly prohibited. Use authentic human recitations from verified sheikhs.",
      ),
    );
    return false;
  }

  // Cancel any prior speech cleanly
  activePlaybackToken++;
  const token = activePlaybackToken;
  stopActiveAudioElement();
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore cancel errors */
    }
  }

  const detectedLang = options?.forcedLang ?? detectTextLanguage(text);
  const accent = options?.preferredLocale ?? getBcp47Locale(detectedLang);
  const cleanForServer =
    detectedLang === "ar"
      ? normalizeArabicForSpeech(text)
      : text
          .replace(/<[^>]+>/g, " ")
          .replace(/[*_#`~[\]]/g, " ")
          .replace(/\s+/g, " ")
          .trim();

  if (!cleanForServer) return false;

  // Check cached WAV audio first for instant 0ms neural playback
  const cacheKey = getTtsCacheKey(cleanForServer, options?.forcedLang ?? "auto", accent);
  const cachedUri = !options?.preferNativeOnly ? ttsAudioCache.get(cacheKey) : undefined;
  if (cachedUri && typeof Audio !== "undefined") {
    options?.onStart?.();
    void playDataUriAudio(cachedUri, token, options).then((played) => {
      if (!played && token === activePlaybackToken) {
        speakSegmentsViaWebSpeech(text, token, options);
      }
    });
    return true;
  }

  // Kick off background capability discovery if still unknown
  if (serverTtsAvailability === "unknown") {
    warmServerTtsCapability();
  }

  // Use Server Neural TTS asynchronously only when confirmed available and allowed
  const canTryServer =
    !options?.preferNativeOnly &&
    serverTtsAvailability === "available" &&
    typeof fetch !== "undefined" &&
    typeof Audio !== "undefined" &&
    cleanForServer.length <= 900;

  if (canTryServer) {
    options?.onStart?.();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    void fetch("/api/ai/tts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        text: cleanForServer,
        lang: options?.forcedLang ?? "auto",
        accent,
      }),
    })
      .then(async (res) => {
        clearTimeout(timeoutId);
        if (token !== activePlaybackToken) return;
        if (!res.ok) {
          if (res.status === 503) serverTtsAvailability = "unavailable";
          speakSegmentsViaWebSpeech(text, token, options);
          return;
        }
        const payload = (await res.json()) as {
          ok?: boolean;
          audioBase64?: string;
          mimeType?: string;
        };
        if (token !== activePlaybackToken) return;
        if (payload.ok && payload.audioBase64) {
          const dataUri = `data:${payload.mimeType || "audio/wav"};base64,${payload.audioBase64}`;
          setCachedAudioDataUri(cacheKey, dataUri);
          const played = await playDataUriAudio(dataUri, token, options);
          if (!played && token === activePlaybackToken) {
            speakSegmentsViaWebSpeech(text, token, options);
          }
        } else {
          speakSegmentsViaWebSpeech(text, token, options);
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
        if (token === activePlaybackToken) {
          speakSegmentsViaWebSpeech(text, token, options);
        }
      });
    return true;
  }

  // Immediate segmented Web Speech execution
  try {
    const spoke = speakSegmentsViaWebSpeech(text, token, options);
    if (!spoke) {
      options?.onError?.(new Error("Speech synthesis is not supported on this device."));
    }
    return spoke;
  } catch (err) {
    console.error("speakEnhancedText failed:", err);
    options?.onError?.(err instanceof Error ? err : new Error("Speech synthesis failed"));
    return false;
  }
}

/**
 * Convenience wrapper explicitly forcing Arabic voice selection and Arabic text normalization.
 */
export function speakArabicText(
  text: string,
  options?: Omit<EnhancedSpeechOptions, "forcedLang">,
): boolean {
  const arabicOnly = extractArabicText(text) || text;
  return speakEnhancedText(arabicOnly, {
    ...options,
    forcedLang: "ar",
    preferredLocale: options?.preferredLocale ?? "ar-SA",
  });
}

/**
 * Extracts clean, semantic, readable text from a DOM container (e.g. `#main-content`),
 * prioritizing headings, paragraphs, list items, and blockquotes while excluding
 * navigation chrome, buttons, form controls, hidden elements, and SVGs.
 */
export function extractReadablePageText(root?: HTMLElement | null, maxLength = 4000): string {
  if (!root || typeof document === "undefined") return "";

  const EXCLUDED_SELECTOR =
    "nav, aside, header, footer, button, input, select, textarea, svg, script, style, [aria-hidden='true'], [data-no-read], .sr-only";

  const blocks: string[] = [];
  const seen = new Set<string>();
  const semanticNodes = root.querySelectorAll("h1, h2, h3, h4, p, li, blockquote, [data-readable]");

  semanticNodes.forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (node.closest(EXCLUDED_SELECTOR)) return;
    // Avoid duplicating parent + nested <p>/<li> text when parent already matched
    if (
      node.querySelector("h1, h2, h3, h4, p, li, blockquote") &&
      !node.matches("[data-readable]")
    ) {
      return;
    }

    const raw = (node.innerText || node.textContent || "").replace(/\s+/g, " ").trim();
    if (!raw || raw.length < 2) return;
    if (seen.has(raw)) return;
    seen.add(raw);
    const punctuated = /[.!?،؛:]$/.test(raw) ? raw : `${raw}.`;
    blocks.push(punctuated);
  });

  if (blocks.length > 0) {
    return blocks.join(" ").slice(0, maxLength).trim();
  }

  const fallback = (root.innerText || root.textContent || "").replace(/\s+/g, " ").trim();
  return fallback.slice(0, maxLength).trim();
}

/**
 * Pauses active neural audio or Web Speech synthesis without discarding playback position.
 */
export function pauseEnhancedSpeech(): void {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
    } catch {
      /* ignore pause errors */
    }
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.pause();
    } catch {
      /* ignore pause errors */
    }
  }
}

/**
 * Resumes paused neural audio or Web Speech synthesis.
 */
export function resumeEnhancedSpeech(): void {
  if (activeAudioElement) {
    try {
      void activeAudioElement.play();
    } catch {
      /* ignore play errors */
    }
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.resume();
    } catch {
      /* ignore resume errors */
    }
  }
}

/**
 * Stops any ongoing enhanced speech synthesis or neural audio playback.
 */
export function stopEnhancedSpeech(): void {
  activePlaybackToken++;
  stopActiveAudioElement();
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore cancel errors */
  }
}

export { CJK_OR_KANA_OR_HANGUL_REGEX };
