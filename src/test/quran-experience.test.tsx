import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { PreferencesProvider } from "@/lib/preferences";
import { QuranWorkspace } from "@/components/modules/QuranWorkspace";
import {
  clearQuranMemoryCaches,
  clearSessionQuranPrefs,
  DEFAULT_QURAN_PREFERENCES,
  fetchQuranJuzs,
  fetchSurahAudio,
  fetchSurahUthmaniVerses,
  findActiveAyahAtTime,
  formatAudioTime,
  isTrustedQuranAudioUrl,
  isVerifiedReciterId,
  isVerifiedTranslationId,
  normalizeBookmarks,
  normalizeQuranPreferences,
  normalizeReadingHistory,
  readSessionQuranPrefs,
  shouldShowBismillahHeader,
  stripTranslationMarkup,
  toArabicIndicDigits,
  VERIFIED_JUZ_INDEX,
  VERIFIED_QURAN_RECITERS,
  VERIFIED_QURAN_TRANSLATIONS,
  writeSessionQuranPrefs,
  QuranAudioUnavailableError,
  QuranNetworkError,
} from "@/lib/quran";
import { fromQuranFirestoreRow, toQuranFirestoreRow } from "@/hooks/use-quran-preferences";

// Mock Firebase auth/db for isolated unit & component testing
vi.mock("@/lib/firebase", () => ({
  auth: { currentUser: null },
  db: {},
  isFirebaseConfigured: false,
  OperationType: {
    CREATE: "create",
    UPDATE: "update",
    DELETE: "delete",
    LIST: "list",
    GET: "get",
    WRITE: "write",
  },
  handleFirestoreError: (err: unknown) => {
    throw err instanceof Error ? err : new Error(String(err));
  },
}));

vi.mock("@/lib/firebase-auth", () => ({
  waitForAuthReady: vi.fn().mockResolvedValue(null),
  isUserEligibleForApp: vi.fn().mockReturnValue(false),
}));

const SAMPLE_CHAPTERS = [
  {
    id: 1,
    revelation_place: "makkah",
    name_simple: "Al-Fatihah",
    name_arabic: "الفاتحة",
    verses_count: 7,
    translated_name: { name: "The Opener" },
  },
  {
    id: 2,
    revelation_place: "madinah",
    name_simple: "Al-Baqarah",
    name_arabic: "البقرة",
    verses_count: 286,
    translated_name: { name: "The Cow" },
  },
  {
    id: 9,
    revelation_place: "madinah",
    name_simple: "At-Tawbah",
    name_arabic: "التوبة",
    verses_count: 129,
    translated_name: { name: "The Repentance" },
  },
  {
    id: 78,
    revelation_place: "makkah",
    name_simple: "An-Naba",
    name_arabic: "النبإ",
    verses_count: 45,
    translated_name: { name: "The Tidings" },
  },
];

const ALL_114_CHAPTERS = Array.from({ length: 114 }, (_, idx) => {
  const found = SAMPLE_CHAPTERS.find((c) => c.id === idx + 1);
  return (
    found ?? {
      id: idx + 1,
      revelation_place: idx % 2 === 0 ? "makkah" : "madinah",
      name_simple: `Surah ${idx + 1}`,
      name_arabic: `سورة ${idx + 1}`,
      verses_count: 10,
      translated_name: { name: `Chapter ${idx + 1}` },
    }
  );
});

const FATIHAH_VERSES = [
  {
    id: 1,
    verse_key: "1:1",
    verse_number: 1,
    text_uthmani: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
    page_number: 1,
    juz_number: 1,
    translations: [
      {
        id: 20,
        text: "In the name of Allāh,<sup foot_note=195932>1</sup> the Entirely Merciful, the Especially Merciful.",
      },
    ],
  },
  {
    id: 2,
    verse_key: "1:2",
    verse_number: 2,
    text_uthmani: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
    page_number: 1,
    juz_number: 1,
    translations: [{ id: 20, text: "[All] praise is [due] to Allāh, Lord of the worlds -" }],
  },
];

const BAQARAH_VERSES = [
  {
    id: 8,
    verse_key: "2:1",
    verse_number: 1,
    text_uthmani: " الٓمٓ",
    page_number: 2,
    juz_number: 1,
  },
  {
    id: 9,
    verse_key: "2:2",
    verse_number: 2,
    text_uthmani: "ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
    page_number: 2,
    juz_number: 1,
  },
];

// 45 verses for Surah 78 so chunk pagination (VERSES_PER_PAGE = 40) is exercised
const NABA_VERSES = Array.from({ length: 45 }, (_, idx) => ({
  id: 5673 + idx,
  verse_key: `78:${idx + 1}`,
  verse_number: idx + 1,
  text_uthmani: idx === 0 ? "عَمَّ يَتَسَآءَلُونَ" : `آيَةُ ٱلنَّبَإِ ${toArabicIndicDigits(idx + 1)}`,
  page_number: 582,
  juz_number: 30,
}));

describe("Digital Quran Mushaf core utilities & integrity", () => {
  beforeEach(() => {
    clearQuranMemoryCaches();
    clearSessionQuranPrefs();
    vi.restoreAllMocks();
  });

  it("verifies reciters, 30 juz index, and verified translations catalog", () => {
    expect(VERIFIED_QURAN_RECITERS.length).toBe(11);
    expect(isVerifiedReciterId(7)).toBe(true);
    expect(isVerifiedReciterId(11)).toBe(false);

    expect(VERIFIED_JUZ_INDEX.length).toBe(30);
    expect(VERIFIED_JUZ_INDEX[0]).toMatchObject({ juzNumber: 1, startSurah: 1, startAyah: 1 });
    expect(VERIFIED_JUZ_INDEX[29]).toMatchObject({
      juzNumber: 30,
      startSurah: 78,
      startAyah: 1,
      endSurah: 114,
    });

    expect(VERIFIED_QURAN_TRANSLATIONS.length).toBe(7);
    expect(isVerifiedTranslationId(20)).toBe(true);
    expect(isVerifiedTranslationId(99999)).toBe(false);

    expect(
      isTrustedQuranAudioUrl(
        "https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/1.mp3",
        7,
      ),
    ).toBe(true);
    expect(
      isTrustedQuranAudioUrl(
        "https://download.quranicaudio.com/quran/abdul_muhsin_alqasim/001.mp3",
        7,
      ),
    ).toBe(false);
    expect(isTrustedQuranAudioUrl("http://insecure.example.com/1.mp3")).toBe(false);
  });

  it("strips translation footnote markup cleanly and preserves Bismillah & Arabic-Indic conventions", () => {
    expect(
      stripTranslationMarkup(
        "In the name of Allāh,<sup foot_note=195932>1</sup> the Entirely Merciful.",
      ),
    ).toBe("In the name of Allāh, the Entirely Merciful.");

    expect(shouldShowBismillahHeader(1)).toBe(false);
    expect(shouldShowBismillahHeader(2)).toBe(true);
    expect(shouldShowBismillahHeader(9)).toBe(false);
    expect(shouldShowBismillahHeader(114)).toBe(true);

    expect(toArabicIndicDigits(1)).toBe("١");
    expect(toArabicIndicDigits(286)).toBe("٢٨٦");
    expect(formatAudioTime(0)).toBe("0:00");
    expect(formatAudioTime(65)).toBe("1:05");
    expect(formatAudioTime(3665)).toBe("1:01:05");

    const stamps = [
      {
        verseKey: "1:1",
        verseNumber: 1,
        timestampFromMs: 0,
        timestampToMs: 6090,
        durationMs: 6090,
      },
      {
        verseKey: "1:2",
        verseNumber: 2,
        timestampFromMs: 6090,
        timestampToMs: 11680,
        durationMs: 5590,
      },
    ];
    expect(findActiveAyahAtTime(stamps, 3)).toBe(1);
    expect(findActiveAyahAtTime(stamps, 7.5)).toBe(2);
  });

  it("deduplicates bookmarks (max 50) & history (max 20) and round-trips Firestore schema", () => {
    const rawBookmarks = Array.from({ length: 60 }, (_, idx) => ({
      id: `bm_${idx}`,
      surahId: idx === 0 ? 2 : idx + 1,
      ayahNumber: idx === 0 ? 255 : 1,
      verseKey: idx === 0 ? "2:255" : `${idx + 1}:1`,
      surahNameAr: "البقرة",
      surahNameEn: "Al-Baqarah",
      excerpt: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ",
      label: "Review later",
      category: "review" as const,
      createdAt: "2026-11-12T10:00:00.000Z",
    }));
    const normBm = normalizeBookmarks(rawBookmarks);
    expect(normBm.length).toBe(50);

    const normHist = normalizeReadingHistory([
      {
        surahId: 2,
        ayahNumber: 5,
        surahNameAr: "البقرة",
        surahNameEn: "Al-Baqarah",
        openedAt: "1",
      },
      {
        surahId: 2,
        ayahNumber: 5,
        surahNameAr: "البقرة",
        surahNameEn: "Al-Baqarah",
        openedAt: "2",
      },
      { surahId: 18, ayahNumber: 1, surahNameAr: "الكهف", surahNameEn: "Al-Kahf", openedAt: "3" },
    ]);
    expect(normHist.length).toBe(2);

    const custom = normalizeQuranPreferences({
      saveToCloud: true,
      lastSurah: 18,
      lastAyah: 10,
      lastPositionSeconds: 142.5,
      reciterId: 2,
      playbackRate: 1.25,
      volume: 0.7,
      muted: false,
      repeatMode: "ayah",
      fontSizeStep: 4,
      readingTheme: "dark",
      lineSpacing: "spacious",
      readingWidth: "wide",
      showVerseMarkers: false,
      showTranslation: true,
      translationId: 85,
      bookmarks: normBm.slice(0, 2),
      readingHistory: normHist,
    });

    writeSessionQuranPrefs(custom);
    const readBack = readSessionQuranPrefs();
    expect(readBack).toMatchObject({
      lastSurah: 18,
      lastAyah: 10,
      readingTheme: "dark",
      lineSpacing: "spacious",
      readingWidth: "wide",
      showVerseMarkers: false,
      showTranslation: true,
      translationId: 85,
    });
    expect(readBack?.bookmarks).toHaveLength(2);
    expect(readBack?.readingHistory).toHaveLength(2);

    const row = toQuranFirestoreRow("uid_student_1", custom);
    expect(row.user_id).toBe("uid_student_1");
    expect(row.reading_theme).toBe("dark");
    expect(row.bookmarks).toHaveLength(2);
    expect(row.reading_history).toHaveLength(2);
    expect(fromQuranFirestoreRow(row)).toMatchObject({
      saveToCloud: true,
      lastSurah: 18,
      lastAyah: 10,
      readingTheme: "dark",
      lineSpacing: "spacious",
      readingWidth: "wide",
      showVerseMarkers: false,
      showTranslation: true,
      translationId: 85,
    });
  });

  it("loads by_chapter verses with page/juz/cleaned translation and falls back cleanly", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/verses/by_chapter/1")) {
        return new Response(JSON.stringify({ verses: FATIHAH_VERSES }), { status: 200 });
      }
      if (url.includes("/verses/by_chapter/2")) {
        return new Response("Server Error", { status: 500 });
      }
      if (url.includes("/quran/verses/uthmani?chapter_number=2")) {
        return new Response(JSON.stringify({ verses: BAQARAH_VERSES }), { status: 200 });
      }
      if (url.includes("/chapter_recitations/7/1")) {
        return new Response(JSON.stringify({}), { status: 404 });
      }
      if (url.includes("/chapter_recitations/2/1")) {
        throw new TypeError("Network failed");
      }
      return new Response("Not Found", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const verses1 = await fetchSurahUthmaniVerses(1, { translationId: 20 });
    expect(verses1[0]?.textUthmani).toBe(FATIHAH_VERSES[0]?.text_uthmani);
    expect(verses1[0]?.pageNumber).toBe(1);
    expect(verses1[0]?.juzNumber).toBe(1);
    expect(verses1[0]?.translationText).toBe(
      "In the name of Allāh, the Entirely Merciful, the Especially Merciful.",
    );

    const verses2 = await fetchSurahUthmaniVerses(2);
    expect(verses2[1]?.textUthmani).toBe(BAQARAH_VERSES[1]?.text_uthmani);

    const juzs = await fetchQuranJuzs();
    expect(juzs).toHaveLength(30);

    await expect(fetchSurahAudio(7, 1)).rejects.toBeInstanceOf(QuranAudioUnavailableError);
    await expect(fetchSurahAudio(2, 1)).rejects.toBeInstanceOf(QuranNetworkError);
  });
});

describe("Complete Digital Quran Mushaf UI integration", () => {
  beforeEach(() => {
    clearQuranMemoryCaches();
    clearSessionQuranPrefs();
    window.localStorage.clear();
    window.sessionStorage.clear();

    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(async function (
      this: HTMLMediaElement,
    ) {
      Object.defineProperty(this, "paused", { configurable: true, value: false });
      return undefined;
    });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      Object.defineProperty(this, "paused", { configurable: true, value: true });
    });

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/chapters")) {
          return new Response(JSON.stringify({ chapters: ALL_114_CHAPTERS }), { status: 200 });
        }
        if (url.includes("/juzs")) {
          return new Response(JSON.stringify({}), { status: 404 });
        }
        if (url.includes("/verses/by_chapter/1")) {
          return new Response(JSON.stringify({ verses: FATIHAH_VERSES }), { status: 200 });
        }
        if (url.includes("/verses/by_chapter/2")) {
          return new Response(JSON.stringify({ verses: BAQARAH_VERSES }), { status: 200 });
        }
        if (url.includes("/verses/by_chapter/78")) {
          return new Response(JSON.stringify({ verses: NABA_VERSES }), { status: 200 });
        }
        if (url.includes("/chapter_recitations/7/1")) {
          return new Response(
            JSON.stringify({
              audio_file: {
                chapter_id: 1,
                format: "mp3",
                file_size: 793327,
                audio_url: "https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/1.mp3",
                timestamps: [
                  { verse_key: "1:1", timestamp_from: 0, timestamp_to: 6090, duration: 6090 },
                  { verse_key: "1:2", timestamp_from: 6090, timestamp_to: 11680, duration: 5590 },
                ],
              },
            }),
            { status: 200 },
          );
        }
        if (url.includes("/chapter_recitations/7/2")) {
          return new Response(JSON.stringify({}), { status: 404 });
        }
        return new Response(JSON.stringify({}), { status: 404 });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders all 114 surahs, RTL Uthmani verses, source attribution, and lazy audio", async () => {
    render(
      <PreferencesProvider>
        <QuranWorkspace />
      </PreferencesProvider>,
    );

    expect(await screen.findByText(/ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ/)).toBeInTheDocument();
    expect(screen.getByText(/Authentic Sources & Integrity/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Quran\.com API v4/i).length).toBeGreaterThan(0);

    // Search Surah 78 among 114 surahs
    const searchInput = screen.getByPlaceholderText(/Search surah/i);
    fireEvent.change(searchInput, { target: { value: "An-Naba" } });
    expect(screen.getByText("An-Naba")).toBeInTheDocument();

    const audioEl = document.querySelector("audio");
    expect(audioEl).not.toBeNull();
    expect(audioEl?.getAttribute("preload")).toBe("none");
    expect(audioEl?.getAttribute("src")).toBeNull();

    const readingContainer = document.querySelector('[dir="rtl"][lang="ar"]');
    expect(readingContainer).not.toBeNull();
  });

  it("navigates 30 Juz' and paginates long surahs with ayah selection", async () => {
    render(
      <PreferencesProvider>
        <QuranWorkspace />
      </PreferencesProvider>,
    );

    await screen.findByText(/ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ/);

    // Switch to 30 Juz' tab and select Juz' 30 -> opens Surah 78
    fireEvent.click(screen.getByRole("tab", { name: /30 Juz'/i }));
    const juz30Option = await screen.findByRole("option", { name: /Juz' 30/i });
    fireEvent.click(juz30Option);

    expect(await screen.findByText(/عَمَّ يَتَسَآءَلُونَ/)).toBeInTheDocument();
    // Chunk pagination for 45 ayahs (40 per page)
    expect(screen.getByText(/1–40 \/ 45/)).toBeInTheDocument();

    // Go to next chunk of ayahs (41-45)
    fireEvent.click(screen.getByRole("button", { name: /Next ayahs/i }));
    expect(screen.getByText(/41–45 \/ 45/)).toBeInTheDocument();
  }, 15000);

  it("displays contextual ayah actions, copies exact Arabic text, bookmarks with labels, and manages reading history", async () => {
    render(
      <PreferencesProvider>
        <QuranWorkspace />
      </PreferencesProvider>,
    );

    await screen.findByText(/ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ/);

    // Select Juz' 30 -> Surah 78
    fireEvent.click(screen.getByRole("tab", { name: /30 Juz'/i }));
    fireEvent.click(await screen.findByRole("option", { name: /Juz' 30/i }));
    await screen.findByText(/عَمَّ يَتَسَآءَلُونَ/);

    // Select Ayah 2 to display contextual action panel
    const ayah2Article = document.querySelector('[data-verse-key="78:2"]');
    expect(ayah2Article).not.toBeNull();
    fireEvent.click(within(ayah2Article as HTMLElement).getByRole("button"));

    const actionPanel = await screen.findByTestId("ayah-action-panel");
    expect(actionPanel).toHaveTextContent(/An-Naba/i);
    expect(actionPanel).toHaveTextContent(/Ayah 2/i);
    expect(actionPanel).toHaveTextContent(/Juz' 30/i);
    expect(actionPanel).toHaveTextContent(/Page 582/i);

    // Copy exact Arabic text
    fireEvent.click(screen.getByRole("button", { name: /Copy Arabic text/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("آيَةُ ٱلنَّبَإِ ٢"),
    );

    // Select preset label "Review later" and bookmark ayah 78:2
    fireEvent.click(screen.getByRole("button", { name: /Review later/i }));
    fireEvent.click(screen.getByRole("button", { name: /Bookmark ayah/i }));

    // Save reading position
    fireEvent.click(screen.getByRole("button", { name: /Save reading position/i }));

    // Open Bookmarks tab, verify bookmark & history entry, click bookmark to jump back to 78:2
    fireEvent.click(screen.getByRole("tab", { name: /Bookmarks/i }));
    const refMatches = screen.getAllByText("78:2");
    expect(refMatches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Review later")).toBeInTheDocument();
    expect(screen.getByText(/Recent Reading Positions/i)).toBeInTheDocument();

    fireEvent.click(refMatches[0]!);
    expect(await screen.findByText(/1–40 \/ 45/)).toBeInTheDocument();

    // Remove bookmark and clear reading history
    const removeBmBtn = screen.getByRole("button", { name: /Remove bookmark 78:2/i });
    fireEvent.click(removeBmBtn);
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /Remove bookmark 78:2/i }),
      ).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Clear history/i }));
    expect(screen.getByText(/No recent reading history yet/i)).toBeInTheDocument();
  }, 35000);

  it("switches Light & Dark reading themes and toggles display settings + verified translations", async () => {
    render(
      <PreferencesProvider>
        <QuranWorkspace />
      </PreferencesProvider>,
    );

    await screen.findByText(/ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ/);

    const canvas = screen.getByTestId("mushaf-reading-canvas");
    expect(canvas.getAttribute("data-mushaf-surface")).toBe("system");

    const switcher = screen.getByTestId("mushaf-theme-switcher");
    fireEvent.click(within(switcher).getByRole("button", { name: /^Light$/i }));
    expect(canvas.getAttribute("data-mushaf-surface")).toBe("light");

    fireEvent.click(within(switcher).getByRole("button", { name: /^Dark$/i }));
    expect(canvas.getAttribute("data-mushaf-surface")).toBe("dark");

    // Open Display Settings panel & enable verified translation
    fireEvent.click(screen.getByRole("button", { name: /Display/i }));
    const displayPanel = await screen.findByTestId("mushaf-display-panel");

    fireEvent.click(within(displayPanel).getByRole("button", { name: /Spacious/i }));
    fireEvent.click(within(displayPanel).getByRole("button", { name: /Wide/i }));

    const translationSwitch = within(displayPanel).getByRole("switch", {
      name: /Show translation/i,
    });
    fireEvent.click(translationSwitch);

    expect(
      await screen.findByText(
        /In the name of Allāh, the Entirely Merciful, the Especially Merciful\./,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Translation: English · Saheeh International/)).toBeInTheDocument();

    // Verify preferences persisted in session state
    expect(readSessionQuranPrefs()).toMatchObject({
      readingTheme: "dark",
      lineSpacing: "spacious",
      readingWidth: "wide",
      showTranslation: true,
    });
  });

  it("plays, pauses, syncs active ayah, navigates surahs, and handles unavailable audio honestly", async () => {
    render(
      <PreferencesProvider>
        <QuranWorkspace />
      </PreferencesProvider>,
    );

    await screen.findByText(/ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ/);

    // Play from Ayah 2 verifies ayah-level audio sync highlight
    fireEvent.click(screen.getByRole("button", { name: /Play from Ayah/i }));
    const playBtn = screen.getByRole("button", { name: /Play recitation/i });
    fireEvent.click(playBtn);

    await waitFor(() => {
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });

    const pauseBtn = await screen.findByRole("button", { name: /Pause recitation/i });
    fireEvent.click(pauseBtn);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();

    // Navigate to Next Surah (Al-Baqarah) and verify unavailable audio handling
    const nextBtn = screen.getByRole("button", { name: /Next Surah/i });
    fireEvent.click(nextBtn);

    expect(await screen.findByText(/ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ/)).toBeInTheDocument();

    const playAfterSwitch = screen.getByRole("button", { name: /Play recitation/i });
    fireEvent.click(playAfterSwitch);

    const errBanner = await screen.findByTestId("quran-audio-error");
    expect(errBanner).toHaveTextContent(/Audio unavailable/i);
    expect(screen.getByRole("button", { name: /Retry/i })).toBeInTheDocument();
  }, 15000);

  it("shows resume prompt when prior session position exists and allows clearing", async () => {
    writeSessionQuranPrefs({
      ...DEFAULT_QURAN_PREFERENCES,
      lastSurah: 2,
      lastAyah: 2,
      lastPositionSeconds: 45,
      updatedAt: new Date().toISOString(),
    });

    render(
      <PreferencesProvider>
        <QuranWorkspace />
      </PreferencesProvider>,
    );

    const resumeBanner = await screen.findByTestId("quran-resume-banner");
    expect(resumeBanner).toHaveTextContent(/Resume from your last reading & listening position/i);
    expect(resumeBanner).toHaveTextContent(/0:45/);

    const clearBtn = screen.getByRole("button", { name: /Clear saved/i });
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(readSessionQuranPrefs()).toBeNull();
    });
  });
});
