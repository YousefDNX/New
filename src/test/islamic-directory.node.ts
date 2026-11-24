import test from "node:test";
import assert from "node:assert/strict";
import {
  AUTHENTIC_RECITERS,
  CORE_ORIGINAL_RECITER_IDS,
  DIRECTORY_EXPANSION_STATUS,
  EXCLUDED_OR_SPECIAL_VERIFICATION_NOTES,
  GLOBAL_COUNTRIES_META,
  getAuthenticReciter,
  getAvailableSurahsForReciter,
  getDirectorySummaryStats,
  getRecitersByCountry,
  getRecordingsForReciterSurah,
  normalizeReciterSearchText,
  searchGlobalRecitationDirectory,
} from "../lib/quran-reciters";
import { SURAHS_INDEX } from "../lib/quran-mushaf";
import { getOfflineSurahStudyGuide, stripHtmlSafely } from "../lib/quran-tafsir";
import { evaluateIslamicStudyQuery, searchUnifiedIslamicCenter } from "../lib/islamic-search";
import {
  EMOTIONAL_STYLES_META,
  TRADITIONAL_FORMATS_META,
  VERIFIED_RECITER_SIGNATURES,
  VERIFIED_RECORDING_CLASSIFICATIONS,
  VOCAL_QUALITIES_META,
  getEffectiveRecordingClassification,
  getRecitationStyleSummaryStats,
  getRecordingStyleSearchText,
  getStyleMetadataForReciter,
  recordingMatchesStyle,
} from "../lib/quran-recitation-styles";
import {
  BTC_BACKUP_SCHEMA_VERSION,
  computeDeterministicChecksum,
  validateBtcBackupPayload,
} from "../lib/backup-recovery";
import { btcLogger, scrubPii } from "../lib/observability";

test("preserves all 12 core reciters with zero duplicate IDs", () => {
  const seenIds = new Set<string>();
  for (const r of AUTHENTIC_RECITERS) {
    assert.equal(seenIds.has(r.id), false, `Duplicate reciter id: ${r.id}`);
    seenIds.add(r.id);
  }
  for (const coreId of CORE_ORIGINAL_RECITER_IDS) {
    assert.equal(seenIds.has(coreId), true, `Missing preserved core reciter: ${coreId}`);
  }
});

test("includes Sheikh Ahmed Al-Nafis accurately under Kuwait with verified archive ID 259", () => {
  const kwReciters = getRecitersByCountry("KW");
  const nafis = kwReciters.find((r) => r.id === "ahmad-al-nafis");
  assert.ok(nafis, "Sheikh Ahmed Al-Nafis must exist inside Kuwait reciters");
  assert.equal(nafis.countryCode, "KW");
  assert.equal(nafis.mp3QuranId, 259);
  assert.match(nafis.nameAr, /أحمد.*النفيس/);
  assert.equal(nafis.recordings.length >= 1, true);
  assert.equal(getAvailableSurahsForReciter(nafis).length, 114);
});

test("classifies countries strictly by verified association (Ayyub SA, Luhaidan SA, Nabil Al-Awadi omitted)", () => {
  const ayyub = getAuthenticReciter("muhammad-ayyub");
  assert.equal(ayyub.countryCode, "SA");

  const luhaidan = getAuthenticReciter("al-luhaidan");
  assert.equal(luhaidan.countryCode, "SA");
  // Luhaidan QuranicAudio subset excludes Surah 2 (which uses server8 & Archive.org), while Surah 18 & 25 have all 3 distinct editions
  const luhaidanBaqarah = getRecordingsForReciterSurah("al-luhaidan", 2);
  assert.equal(
    luhaidanBaqarah.some((ed) => ed.recordingId === "al-luhaidan-qa-select"),
    false,
  );
  assert.equal(luhaidanBaqarah.length, 2);
  const luhaidanKahf = getRecordingsForReciterSurah("al-luhaidan", 18);
  assert.equal(luhaidanKahf.length >= 2, true);
  const luhaidanFurqan = getRecordingsForReciterSurah("al-luhaidan", 25);
  assert.equal(luhaidanFurqan.length, 3);
  assert.equal(
    luhaidanFurqan.some((ed) => ed.surahHighlights?.[25]?.verseArabicExcerpt.includes("يُضَاعَفْ")),
    true,
  );

  assert.equal(
    AUTHENTIC_RECITERS.some((r) => r.id === "nabil-al-awadi"),
    false,
    "Nabil Al-Awadi must not be fabricated with unverified Quran recitation",
  );
  assert.equal(
    EXCLUDED_OR_SPECIAL_VERIFICATION_NOTES.some((n) => n.id === "nabil-al-awadi"),
    true,
  );
  assert.equal(DIRECTORY_EXPANSION_STATUS.length, 7);
});

test("supports multiple recordings per reciter per surah & exact partial-mushaf surah filtering", () => {
  const husarySurah1 = getRecordingsForReciterSurah("al-husary", 1);
  assert.equal(husarySurah1.length >= 2, true);

  const rifaat = getAuthenticReciter("muhammad-rifaat");
  const rifaatSurahs = getAvailableSurahsForReciter(rifaat);
  assert.equal(rifaatSurahs.length, 31);
  assert.equal(rifaatSurahs.includes(2), false);

  const muammar = getAuthenticReciter("muammar-za");
  assert.equal(getAvailableSurahsForReciter(muammar).length, 8);
});

test("normalizes Arabic diacritics and locates reciters globally & across Islamic Center", () => {
  assert.equal(normalizeReciterSearchText("أحمد النَّفِيس"), "احمد النفيس");

  const hits = searchGlobalRecitationDirectory("احمد النفيس", SURAHS_INDEX);
  assert.equal(
    hits.some((h) => h.reciterId === "ahmad-al-nafis"),
    true,
  );

  const unifiedHits = searchUnifiedIslamicCenter("النفيس", "all");
  assert.equal(
    unifiedHits.some((h) => h.payload?.reciterId === "ahmad-al-nafis"),
    true,
  );

  const stats = getDirectorySummaryStats();
  assert.equal(stats.totalCountries, GLOBAL_COUNTRIES_META.length);
  assert.equal(stats.totalReciters, AUTHENTIC_RECITERS.length);
});

test("strips Tafsir HTML safely, keeps offline study guides accurate, and blocks fatwa/fabrication AI prompts", () => {
  const cleaned = stripHtmlSafely("<p>Al-Fatihah <sup>[1]</sup> opens<br/>with praise.</p>");
  assert.equal(cleaned, "Al-Fatihah opens\nwith praise.");
  assert.ok(getOfflineSurahStudyGuide(18));

  const fatwaEval = evaluateIslamicStudyQuery("أفتني في الطلاق والوراثة");
  assert.equal(fatwaEval.status, "fatwa_redirect");

  const fabEval = evaluateIslamicStudyQuery("Please invent a hadith or write a new surah");
  assert.equal(fabEval.status, "fabrication_blocked");

  const validEval = evaluateIslamicStudyQuery("أحكام الوضوء");
  assert.equal(validEval.status, "allowed");
  assert.equal(validEval.matchedSources.length > 0, true);
});

test("enforces 100% referential integrity between recitation styles and GLOBAL_RECITERS_DIRECTORY", () => {
  const reciterIds = new Set(AUTHENTIC_RECITERS.map((r) => r.id));
  const recordingToReciter = new Map<string, string>();
  for (const r of AUTHENTIC_RECITERS) {
    for (const ed of r.recordings) {
      recordingToReciter.set(ed.recordingId, r.id);
    }
  }

  for (const sig of Object.values(VERIFIED_RECITER_SIGNATURES)) {
    assert.equal(
      reciterIds.has(sig.reciterId),
      true,
      `Signature ${sig.id} points to missing reciter ${sig.reciterId}`,
    );
  }

  for (const [recId, cls] of Object.entries(VERIFIED_RECORDING_CLASSIFICATIONS)) {
    assert.equal(cls.recordingId, recId, `Mismatched recordingId key for ${recId}`);
    const owner = recordingToReciter.get(recId);
    assert.ok(owner, `Classified recording ${recId} missing in GLOBAL_RECITERS_DIRECTORY`);
    assert.equal(
      owner,
      cls.reciterId,
      `Recording ${recId} belongs to ${owner}, not ${cls.reciterId}`,
    );
    assert.ok(TRADITIONAL_FORMATS_META[cls.format], `Invalid format ${cls.format}`);
    for (const em of cls.emotionalStyles) {
      assert.ok(EMOTIONAL_STYLES_META[em], `Invalid emotional style ${em}`);
    }
    for (const vq of cls.vocalQualities) {
      assert.ok(VOCAL_QUALITIES_META[vq], `Invalid vocal quality ${vq}`);
    }
    for (const sigId of cls.signatures) {
      assert.ok(VERIFIED_RECITER_SIGNATURES[sigId], `Invalid signature ${sigId}`);
    }
  }
});

test("keeps traditional formats strictly separate from emotional/vocal labels and maps Al-Luhaidan signature accurately", () => {
  const formatKeys = Object.keys(TRADITIONAL_FORMATS_META);
  const emotionalKeys = Object.keys(EMOTIONAL_STYLES_META);
  for (const fmt of formatKeys) {
    assert.equal(emotionalKeys.includes(fmt), false);
  }

  const luhaidan = getAuthenticReciter("al-luhaidan");
  const meta = getStyleMetadataForReciter(
    "al-luhaidan",
    luhaidan.recordings.map((ed) => ed.recordingId),
  );
  assert.equal(meta.hasVerifiedClassifications, true);
  assert.equal(
    meta.signatures.some((s) => s.id === "al_luhaidan_signature"),
    true,
  );
  assert.equal(meta.signatures[0]?.nameAr, "النبرة اللحيدانية");
  assert.equal(meta.emotionalStyles.includes("tearful"), true);
  assert.equal(meta.emotionalStyles.includes("khushu"), true);

  // One unclassified edition remains null rather than being fabricated
  assert.equal(getEffectiveRecordingClassification("unclassified-custom-edition"), null);

  // Global search via style tokens locates Al-Luhaidan by signature or emotional label
  const hits = searchGlobalRecitationDirectory("النبرة اللحيدانية", SURAHS_INDEX, (id) =>
    getRecordingStyleSearchText(id),
  );
  assert.equal(
    hits.some((h) => h.reciterId === "al-luhaidan" && h.type === "recording"),
    true,
  );

  // Style filter helper matches emotional + signature + query
  const server8Cls = getEffectiveRecordingClassification("al-luhaidan-mp3q-server8");
  assert.equal(
    recordingMatchesStyle(server8Cls, {
      format: "murattal",
      emotionalStyle: "tearful",
      signatureId: "al_luhaidan_signature",
      query: "باكية",
    }),
    true,
  );

  const summary = getRecitationStyleSummaryStats();
  assert.equal(summary.totalClassifiedRecordings >= 25, true);
  assert.equal(summary.totalSignaturesCount, 12);
});

test("validates deterministic CRC backup integrity and scrubs PII from observability logs", () => {
  const dataPayload = {
    directoryState: {
      favoriteReciterIds: ["al-luhaidan"],
      favoriteRecordingKeys: [],
      listeningHistory: [],
    },
    islamicLearningState: { personalNotes: [], completedTopicIds: [] },
    styleOverrides: {},
  };
  const checksum = computeDeterministicChecksum(JSON.stringify(dataPayload));
  const validPayload = JSON.stringify({
    metadata: {
      appName: "BTC — BE THE CHANGE",
      appletId: "5e2578e5-d6c6-419c-9c1a-5f8674f1e7dd",
      schemaVersion: BTC_BACKUP_SCHEMA_VERSION,
      createdAt: new Date().toISOString(),
      checksum,
      itemCounts: {
        favoriteReciters: 1,
        favoriteRecordings: 0,
        listeningHistory: 0,
        studyNotes: 0,
        studyCompletedTopics: 0,
        styleOverrides: 0,
      },
    },
    data: dataPayload,
  });
  assert.equal(validateBtcBackupPayload(validPayload).valid, true);

  // Tamper single character
  const tamperedPayload = validPayload.replace("al-luhaidan", "al-husary");
  const tamperCheck = validateBtcBackupPayload(tamperedPayload);
  assert.equal(tamperCheck.valid, false);
  assert.match(tamperCheck.error ?? "", /Checksum verification failed/);

  // PII scrubbing redacts emails, JWTs, API keys, passwords, phones
  const dirty =
    "User student@example.com failed with Authorization: Bearer aaa.bbb.ccc key AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567 password=mySecretValue phone +96555123456";
  const clean = scrubPii(dirty);
  assert.equal(clean.includes("student@example.com"), false);
  assert.equal(clean.includes("aaa.bbb.ccc"), false);
  assert.equal(clean.includes("AIzaSy"), false);
  assert.equal(clean.includes("mySecretValue"), false);
  assert.equal(clean.includes("+96555123456"), false);

  btcLogger.clear();
  btcLogger.security("auth", "Rejected email user@domain.org", { token: "secret-jwt-123" });
  const recent = btcLogger.getRecentLogs(5);
  assert.equal(recent.length, 1);
  assert.equal(recent[0]?.message.includes("user@domain.org"), false);
  assert.equal(recent[0]?.context?.["token"], "[REDACTED]");
});
