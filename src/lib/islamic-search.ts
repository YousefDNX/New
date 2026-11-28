/**
 * Unified Islamic Center Search Engine & Responsible AI Study Guardrail
 *
 * - Searches across Reciters, Countries, Surahs, Tafsir Guides, Tajweed Lessons,
 *   Forty Nawawi Hadith, Daily Sunnah, Fiqh Topics, Aqeedah, Seerah Timeline,
 *   99 Names of Allah, Daily Adhkar, and Duas Catalog.
 * - Enforces strict scholarly boundaries on AI responses:
 *   - Blocks personal fatwa requests (directs to qualified scholars)
 *   - Never invents Quran verses, Hadith numbers, or unverified attributions
 *   - Grounds prompts strictly in retrieved verified BTC catalog excerpts
 */

import {
  VERIFIED_DAILY_ADHKAR,
  VERIFIED_DUAS_CATALOG,
  VERIFIED_HADITH_LIBRARY,
  VERIFIED_NAMES_OF_ALLAH,
} from "@/data/islamic-center";
import {
  AQEEDAH_FOUNDATIONS_CATALOG,
  DAILY_SUNNAH_PRACTICES,
  FIQH_TOPICS_CATALOG,
  SEASONAL_AND_AKHLAQ_CATALOG,
  SEERAH_AND_HISTORY_CATALOG,
  TAJWEED_LESSONS,
} from "@/data/islamic-knowledge-catalog";
import { SURAHS_INDEX } from "@/lib/quran-mushaf";
import { matchesSurahOrAyah } from "@/lib/quran";
import { OFFLINE_SURAH_STUDY_GUIDES } from "@/lib/quran-tafsir";
import {
  GLOBAL_COUNTRIES_META,
  GLOBAL_RECITERS_DIRECTORY,
  matchesAllSearchTokens,
  normalizeReciterSearchText,
  type GlobalCountryCode,
} from "@/lib/quran-reciters-directory";
import {
  EMOTIONAL_STYLES_META,
  TRADITIONAL_FORMATS_META,
  VERIFIED_RECORDING_CLASSIFICATIONS,
  VOCAL_QUALITIES_META,
} from "@/lib/quran-recitation-styles";
import { btcLogger, recordAiUsageEvent } from "@/lib/observability";

export type IslamicSearchCategory =
  | "all"
  | "reciter"
  | "country"
  | "surah"
  | "style"
  | "tafsir"
  | "tajweed"
  | "hadith"
  | "sunnah"
  | "fiqh"
  | "aqeedah"
  | "seerah"
  | "adhkar"
  | "dua"
  | "names";

export interface UnifiedIslamicSearchResult {
  id: string;
  category: Exclude<IslamicSearchCategory, "all">;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  sourceRef: string;
  targetTab: string;
  payload?: {
    countryCode?: GlobalCountryCode;
    reciterId?: string;
    recordingId?: string;
    styleId?: string;
    surahId?: number;
    subSection?: string;
  };
}

export function searchUnifiedIslamicCenter(
  query: string,
  categoryFilter: IslamicSearchCategory = "all",
  limit = 40,
): UnifiedIslamicSearchResult[] {
  const q = normalizeReciterSearchText(query);
  if (!q) return [];
  const results: UnifiedIslamicSearchResult[] = [];
  const want = (c: Exclude<IslamicSearchCategory, "all">) =>
    categoryFilter === "all" || categoryFilter === c;

  if (want("country")) {
    for (const c of GLOBAL_COUNTRIES_META) {
      if (matchesAllSearchTokens(`${c.nameAr} ${c.nameEn} ${c.regionAr} ${c.regionEn}`, q)) {
        results.push({
          id: `c-${c.code}`,
          category: "country",
          titleAr: `${c.flagEmoji} ${c.nameAr}`,
          titleEn: `${c.flagEmoji} ${c.nameEn}`,
          subtitleAr: c.descriptionAr,
          subtitleEn: c.descriptionEn,
          sourceRef: "Global Reciters Directory",
          targetTab: "listening",
          payload: { countryCode: c.code },
        });
      }
    }
  }

  if (want("reciter")) {
    for (const r of GLOBAL_RECITERS_DIRECTORY) {
      if (
        matchesAllSearchTokens(
          `${r.nameAr} ${r.nameEn} ${r.titleAr} ${r.titleEn} ${r.primaryRiwayahAr} ${r.primaryRiwayahEn}`,
          q,
        )
      ) {
        results.push({
          id: `rec-${r.id}`,
          category: "reciter",
          titleAr: r.nameAr,
          titleEn: r.nameEn,
          subtitleAr: `${r.titleAr} · ${r.recordings.length} إصدار`,
          subtitleEn: `${r.titleEn} · ${r.recordings.length} edition(s)`,
          sourceRef: "MP3Quran / QuranicAudio / Archive.org",
          targetTab: "listening",
          payload: { reciterId: r.id, countryCode: r.countryCode },
        });
      }
      for (const fp of r.featuredPassages ?? []) {
        if (
          matchesAllSearchTokens(
            `${r.nameAr} ${r.nameEn} ${fp.titleAr} ${fp.titleEn} ${fp.verseArabicExcerpt} ${fp.verseRange} ${fp.noteAr} ${fp.noteEn} سورة الفرقان 25 69`,
            q,
          )
        ) {
          results.push({
            id: `fp-${r.id}-${fp.id}`,
            category: "reciter",
            titleAr: `${fp.titleAr} — ${r.nameAr}`,
            titleEn: `${fp.titleEn} — ${r.nameEn}`,
            subtitleAr: fp.verseArabicExcerpt,
            subtitleEn: fp.noteEn,
            sourceRef: "Verified Recording Highlight",
            targetTab: "listening",
            payload: {
              reciterId: r.id,
              countryCode: r.countryCode,
              surahId: fp.surahId,
              ...((fp.preferredRecordingId ?? r.recordings[0]?.recordingId)
                ? { recordingId: fp.preferredRecordingId ?? r.recordings[0]!.recordingId }
                : {}),
            },
          });
        }
      }
    }
  }

  if (want("surah")) {
    for (const s of SURAHS_INDEX) {
      if (
        matchesAllSearchTokens(`سورة ${s.nameAr} ${s.nameEn} ${s.id}`, q) ||
        matchesSurahOrAyah(s.id, s.nameAr, s.nameEn, query)
      ) {
        results.push({
          id: `surah-${s.id}`,
          category: "surah",
          titleAr: `سورة ${s.nameAr} (${s.id})`,
          titleEn: `Surah ${s.nameEn} (${s.id})`,
          subtitleAr: `${s.versesCount} آية · صفحة ${s.startPage}`,
          subtitleEn: `${s.versesCount} verses · Page ${s.startPage}`,
          sourceRef: "King Fahd Uthmani Mushaf",
          targetTab: "mushaf",
          payload: { surahId: s.id },
        });
      }
    }
  }

  if (want("style")) {
    // 2. Traditional recitation formats
    for (const fmt of Object.values(TRADITIONAL_FORMATS_META)) {
      if (
        matchesAllSearchTokens(
          `${fmt.nameAr} ${fmt.nameEn} ${fmt.descriptionAr} ${fmt.descriptionEn}`,
          q,
        )
      ) {
        results.push({
          id: `fmt-${fmt.id}`,
          category: "style",
          titleAr: fmt.nameAr,
          titleEn: fmt.nameEn,
          subtitleAr: fmt.descriptionAr,
          subtitleEn: fmt.descriptionEn,
          sourceRef: "Traditional Liturgical Format",
          targetTab: "listening",
          payload: { styleId: fmt.id },
        });
      }
    }

    // 3. Emotional and Spiritual Styles
    for (const em of Object.values(EMOTIONAL_STYLES_META)) {
      if (
        matchesAllSearchTokens(
          `${em.nameAr} ${em.nameEn} ${em.descriptionAr} ${em.descriptionEn}`,
          q,
        )
      ) {
        results.push({
          id: `em-${em.id}`,
          category: "style",
          titleAr: em.nameAr,
          titleEn: em.nameEn,
          subtitleAr: em.descriptionAr,
          subtitleEn: em.descriptionEn,
          sourceRef: "Perceived Recitation Quality",
          targetTab: "listening",
          payload: { styleId: em.id },
        });
      }
    }

    // 4. Vocal Qualities
    for (const vq of Object.values(VOCAL_QUALITIES_META)) {
      if (
        matchesAllSearchTokens(
          `${vq.nameAr} ${vq.nameEn} ${vq.descriptionAr} ${vq.descriptionEn}`,
          q,
        )
      ) {
        results.push({
          id: `vq-${vq.id}`,
          category: "style",
          titleAr: vq.nameAr,
          titleEn: vq.nameEn,
          subtitleAr: vq.descriptionAr,
          subtitleEn: vq.descriptionEn,
          sourceRef: "Vocal Characteristic",
          targetTab: "listening",
          payload: { styleId: vq.id },
        });
      }
    }

    // 5. Specific classified recordings
    for (const [recId, cls] of Object.entries(VERIFIED_RECORDING_CLASSIFICATIONS)) {
      const reciter = GLOBAL_RECITERS_DIRECTORY.find((r) => r.id === cls.reciterId);
      const textTokens = [
        cls.recordingId,
        reciter?.nameAr ?? "",
        reciter?.nameEn ?? "",
        cls.format,
        TRADITIONAL_FORMATS_META[cls.format]?.nameAr ?? "",
        TRADITIONAL_FORMATS_META[cls.format]?.nameEn ?? "",
        ...cls.emotionalStyles.map(
          (s) =>
            `${s} ${EMOTIONAL_STYLES_META[s]?.nameAr ?? ""} ${EMOTIONAL_STYLES_META[s]?.nameEn ?? ""}`,
        ),
        ...cls.vocalQualities.map((v) => `${v} ${VOCAL_QUALITIES_META[v]?.nameAr ?? ""}`),
        cls.editorialReviewNoteAr ?? "",
        cls.editorialReviewNoteEn ?? "",
      ].join(" ");

      if (matchesAllSearchTokens(textTokens, q)) {
        results.push({
          id: `rec-style-${cls.recordingId}`,
          category: "style",
          titleAr: `${reciter?.nameAr ?? cls.reciterId} — ${TRADITIONAL_FORMATS_META[cls.format]?.nameAr ?? cls.format}`,
          titleEn: `${reciter?.nameEn ?? cls.reciterId} — ${TRADITIONAL_FORMATS_META[cls.format]?.nameEn ?? cls.format}`,
          subtitleAr:
            cls.editorialReviewNoteAr ??
            cls.emotionalStyles
              .map((s) => EMOTIONAL_STYLES_META[s]?.nameAr)
              .filter(Boolean)
              .join(" · "),
          subtitleEn:
            cls.editorialReviewNoteEn ??
            cls.emotionalStyles
              .map((s) => EMOTIONAL_STYLES_META[s]?.nameEn)
              .filter(Boolean)
              .join(" · "),
          sourceRef: "Verified Style Classification",
          targetTab: "listening",
          payload: {
            reciterId: cls.reciterId,
            recordingId: cls.recordingId,
            ...(reciter?.countryCode ? { countryCode: reciter.countryCode } : {}),
          },
        });
      }
    }
  }

  if (want("tafsir")) {
    for (const g of OFFLINE_SURAH_STUDY_GUIDES) {
      if (
        matchesAllSearchTokens(
          `${g.surahNameAr} ${g.surahNameEn} ${g.coreThemesAr.join(" ")} ${g.coreThemesEn.join(" ")}`,
          q,
        )
      ) {
        results.push({
          id: `taf-${g.surahId}`,
          category: "tafsir",
          titleAr: `تفسير سورة ${g.surahNameAr}`,
          titleEn: `Tafsir Guide: Surah ${g.surahNameEn}`,
          subtitleAr: g.coreThemesAr[0] ?? g.tafsirReferenceNoteAr,
          subtitleEn: g.coreThemesEn[0] ?? g.tafsirReferenceNoteEn,
          sourceRef: "Quran.com v4 Tafsirs",
          targetTab: "tafsir",
          payload: { surahId: g.surahId },
        });
      }
    }
  }

  if (want("tajweed")) {
    for (const l of TAJWEED_LESSONS) {
      if (
        matchesAllSearchTokens(
          `${l.titleAr} ${l.titleEn} ${l.summaryAr} ${l.summaryEn} ${l.ruleStepsAr.join(" ")} ${l.ruleStepsEn.join(" ")}`,
          q,
        )
      ) {
        results.push({
          id: l.id,
          category: "tajweed",
          titleAr: l.titleAr,
          titleEn: l.titleEn,
          subtitleAr: l.summaryAr,
          subtitleEn: l.summaryEn,
          sourceRef: l.citation.sourceBookEn,
          targetTab: "learning",
        });
      }
    }
  }

  if (want("hadith")) {
    for (const h of VERIFIED_HADITH_LIBRARY) {
      if (
        matchesAllSearchTokens(
          `${h.titleAr} ${h.titleEn} ${h.narrator} ${h.matnArabic} ${h.translationEn} ${h.collection} ${h.numberInCollection}`,
          q,
        )
      ) {
        results.push({
          id: `hadith-${h.id}`,
          category: "hadith",
          titleAr: `${h.numberInCollection}. ${h.titleAr}`,
          titleEn: `${h.numberInCollection}. ${h.titleEn}`,
          subtitleAr: h.keyMoralLessons[0] ?? h.narrator,
          subtitleEn: h.narrator,
          sourceRef: `${h.collection} #${h.numberInCollection}`,
          targetTab: "hadith",
        });
      }
    }
  }

  if (want("sunnah")) {
    for (const s of DAILY_SUNNAH_PRACTICES) {
      if (
        matchesAllSearchTokens(
          `${s.titleAr} ${s.titleEn} ${s.hadithSummaryAr} ${s.hadithSummaryEn}`,
          q,
        )
      ) {
        results.push({
          id: s.id,
          category: "sunnah",
          titleAr: s.titleAr,
          titleEn: s.titleEn,
          subtitleAr: s.dailyActionAr,
          subtitleEn: s.dailyActionEn,
          sourceRef: s.authenticSourceEn,
          targetTab: "knowledge",
          payload: { subSection: "sunnah" },
        });
      }
    }
  }

  if (want("fiqh")) {
    for (const f of FIQH_TOPICS_CATALOG) {
      if (
        matchesAllSearchTokens(
          `${f.titleAr} ${f.titleEn} ${f.summaryAr} ${f.summaryEn} ${f.keyConditionsAr.join(" ")} ${f.keyConditionsEn.join(" ")}`,
          q,
        )
      ) {
        results.push({
          id: f.id,
          category: "fiqh",
          titleAr: f.titleAr,
          titleEn: f.titleEn,
          subtitleAr: f.summaryAr,
          subtitleEn: f.summaryEn,
          sourceRef: f.citation.sourceBookEn,
          targetTab: "knowledge",
          payload: { subSection: "fiqh" },
        });
      }
    }
  }

  if (want("aqeedah")) {
    for (const a of AQEEDAH_FOUNDATIONS_CATALOG) {
      if (
        matchesAllSearchTokens(
          `${a.titleAr} ${a.titleEn} ${a.summaryAr} ${a.summaryEn} ${a.corePointsAr.join(" ")} ${a.corePointsEn.join(" ")}`,
          q,
        )
      ) {
        results.push({
          id: a.id,
          category: "aqeedah",
          titleAr: a.titleAr,
          titleEn: a.titleEn,
          subtitleAr: a.summaryAr,
          subtitleEn: a.summaryEn,
          sourceRef: a.proofReferenceEn,
          targetTab: "knowledge",
          payload: { subSection: "aqeedah" },
        });
      }
    }
  }

  if (want("seerah")) {
    for (const e of SEERAH_AND_HISTORY_CATALOG) {
      if (matchesAllSearchTokens(`${e.titleAr} ${e.titleEn} ${e.summaryAr} ${e.summaryEn}`, q)) {
        results.push({
          id: e.id,
          category: "seerah",
          titleAr: e.titleAr,
          titleEn: e.titleEn,
          subtitleAr: e.summaryAr,
          subtitleEn: e.summaryEn,
          sourceRef: e.verifiedReferenceEn,
          targetTab: "knowledge",
          payload: { subSection: "seerah" },
        });
      }
    }
    for (const sa of SEASONAL_AND_AKHLAQ_CATALOG) {
      if (
        matchesAllSearchTokens(
          `${sa.titleAr} ${sa.titleEn} ${sa.descriptionAr} ${sa.descriptionEn}`,
          q,
        )
      ) {
        results.push({
          id: sa.id,
          category: "seerah",
          titleAr: sa.titleAr,
          titleEn: sa.titleEn,
          subtitleAr: sa.descriptionAr,
          subtitleEn: sa.descriptionEn,
          sourceRef: sa.sourceNoteEn,
          targetTab: "knowledge",
          payload: { subSection: "ramadan_akhlaq" },
        });
      }
    }
  }

  if (want("adhkar")) {
    for (const d of VERIFIED_DAILY_ADHKAR) {
      if (
        matchesAllSearchTokens(
          `azkar adhkar أذكار اذكار ${d.categoryLabelAr} ${d.categoryLabelEn} ${d.textAr} ${d.translationEn} ${d.virtueExplanationAr} ${d.virtueExplanationEn}`,
          q,
        )
      ) {
        results.push({
          id: `dhikr-${d.id}`,
          category: "adhkar",
          titleAr: `${d.categoryLabelAr} — ${d.textAr.slice(0, 60)}${d.textAr.length > 60 ? "…" : ""}`,
          titleEn: `${d.categoryLabelEn} — ${d.translationEn.slice(0, 70)}${d.translationEn.length > 70 ? "…" : ""}`,
          subtitleAr: d.virtueExplanationAr,
          subtitleEn: d.virtueExplanationEn,
          sourceRef: d.sourceReference,
          targetTab: "adhkar",
        });
      }
    }
  }

  if (want("dua")) {
    for (const d of VERIFIED_DUAS_CATALOG) {
      if (
        matchesAllSearchTokens(
          `${d.titleAr} ${d.titleEn} ${d.arabicText} ${d.translationEn} ${d.contextEn}`,
          q,
        )
      ) {
        results.push({
          id: `dua-${d.id}`,
          category: "dua",
          titleAr: d.titleAr,
          titleEn: d.titleEn,
          subtitleAr: d.arabicText,
          subtitleEn: d.contextEn,
          sourceRef: d.sourceReference,
          targetTab: "duas",
        });
      }
    }
  }

  if (want("names")) {
    for (const n of VERIFIED_NAMES_OF_ALLAH) {
      if (
        matchesAllSearchTokens(`${n.arabic} ${n.transliteration} ${n.meaningEn} ${n.meaningAr}`, q)
      ) {
        results.push({
          id: `name-${n.number}`,
          category: "names",
          titleAr: `${n.number}. ${n.arabic}`,
          titleEn: `${n.number}. ${n.transliteration} (${n.meaningEn})`,
          subtitleAr: n.meaningAr,
          subtitleEn: n.quranicProof,
          sourceRef: n.quranicProof,
          targetTab: "names",
        });
      }
    }
  }

  return results.slice(0, limit);
}

// ============================================================================
// Grounded Islamic AI Study Helper Guardrail
// ============================================================================

const FATWA_KEYWORDS = [
  "fatwa",
  "فتوى",
  "أفتني",
  "هل يجوز لي",
  "طلاق",
  "ميراث",
  "divorce",
  "inheritance",
  "is it haram for me",
  "is it halal for me",
  "give me a ruling on my",
  "حكمي الشخصي",
];

const FABRICATION_KEYWORDS = [
  "invent a hadith",
  "make up a verse",
  "write a new surah",
  "ألف آية",
  "اخترع حديث",
  "تلاوة بالذكاء",
  "generate quran audio",
];

export interface GuardedStudyEvaluation {
  status: "allowed" | "fatwa_redirect" | "fabrication_blocked";
  matchedSources: UnifiedIslamicSearchResult[];
  safeRefusalAr?: string;
  safeRefusalEn?: string;
}

export function evaluateIslamicStudyQuery(rawQuery: string): GuardedStudyEvaluation {
  const lower = normalizeReciterSearchText(rawQuery);
  let matchedSources = searchUnifiedIslamicCenter(rawQuery, "all", 5);
  if (matchedSources.length === 0) {
    const tokens = lower.split(" ").filter((t) => t.length >= 3);
    const seen = new Set<string>();
    const combined: UnifiedIslamicSearchResult[] = [];
    for (const tok of tokens) {
      for (const hit of searchUnifiedIslamicCenter(tok, "all", 3)) {
        if (!seen.has(hit.id)) {
          seen.add(hit.id);
          combined.push(hit);
        }
      }
    }
    matchedSources = combined.slice(0, 5);
  }

  if (FABRICATION_KEYWORDS.some((kw) => lower.includes(normalizeReciterSearchText(kw)))) {
    recordAiUsageEvent({ type: "blocked_fabrication" });
    btcLogger.security("ai", "Blocked scriptural fabrication attempt", {
      queryLength: rawQuery.length,
    });
    return {
      status: "fabrication_blocked",
      matchedSources,
      safeRefusalAr:
        "تنبيه شرعي صارم: لا يُسمح بتوليد نصوص قرآنية أو أحاديث أو تلاوات بالذكاء الاصطناعي. يمكنك قراءة المصحف الشريف أو الأحاديث الموثقة مباشرة من المكتبة.",
      safeRefusalEn:
        "Strict Safeguard: This helper cannot fabricate Quranic text, Hadith narrations, or synthetic recitations. Please inspect the verified Quran text and classical collections directly.",
    };
  }

  if (FATWA_KEYWORDS.some((kw) => lower.includes(normalizeReciterSearchText(kw)))) {
    recordAiUsageEvent({ type: "blocked_fatwa" });
    btcLogger.info("ai", "Redirected personal fatwa query to qualified scholars", {
      queryLength: rawQuery.length,
    });
    return {
      status: "fatwa_redirect",
      matchedSources,
      safeRefusalAr:
        "تنبيه الفقه والفتوى: هذا المساعد تعليمي مقتصر على شرح المصادر الموثقة بالمركز الإسلامي ولا يصدر فتاوى شخصية أو أحكام معاملات خاصة. يُرجى مراجعة عالم مؤهل أو دار إفتاء رسمية.",
      safeRefusalEn:
        "Jurisprudence Safeguard: BTC's study helper summarizes general educational concepts only and never issues personal Fatwas. Please consult a qualified local scholar or recognized Dar al-Ifta institution for personal rulings.",
    };
  }

  recordAiUsageEvent({ type: "allowed_study", tokensEstimate: 140 });
  btcLogger.info("ai", "Processed educational study query against verified catalog", {
    sourcesCount: matchedSources.length,
  });

  return {
    status: "allowed",
    matchedSources,
  };
}
