import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  detectTextLanguage,
  normalizeTextForSpeech,
  normalizeArabicForSpeech,
  splitSpeechSegments,
  extractArabicText,
  isQuranicRecitationForbidden,
  chunkTextForSpeech,
  getBcp47Locale,
  selectBestNativeVoice,
  speakEnhancedText,
  speakArabicText,
  extractReadablePageText,
  pauseEnhancedSpeech,
  resumeEnhancedSpeech,
  resetSpeechEngineStateForTests,
  PRONUNCIATION_LEXICON,
} from "../lib/speech-service";
import { speakEnglishText } from "../lib/english-speech";
import { synthesizeSpeechWithGemini } from "../lib/ai.server";

class MockUtterance {
  text: string;
  lang = "";
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: SpeechSynthesisVoice | null = null;
  onend: (() => void) | null = null;
  onerror: ((e?: unknown) => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

describe("Speech pronunciation engine, mixed-language routing, and Quranic safety rules", () => {
  beforeEach(() => {
    resetSpeechEngineStateForTests();
    vi.restoreAllMocks();
  });

  it("classifies Arabic, English, and CJK scripts correctly", () => {
    expect(detectTextLanguage("مرحباً بكم في منصة نكسورا التعليمية")).toBe("ar");
    expect(detectTextLanguage("Welcome to the advanced study planner and simulation engine")).toBe(
      "en",
    );
    expect(detectTextLanguage("سورة الفاتحة مكية وآياتها سبع")).toBe("ar");
    expect(detectTextLanguage("Photosynthesis occurs in the chloroplast of plant cells")).toBe(
      "en",
    );
    expect(detectTextLanguage("你好世界")).toBe("zh");
  });

  it("splits mixed-language sentences into Arabic and English segments accurately", () => {
    const mixed1 = splitSpeechSegments("Apple — تفاحة");
    expect(mixed1).toHaveLength(2);
    expect(mixed1[0]).toMatchObject({ lang: "en" });
    expect(mixed1[0]!.text).toContain("Apple");
    expect(mixed1[1]).toEqual({ text: "تفاحة", lang: "ar" });

    const mixed2 = splitSpeechSegments("كلمة photosynthesis تعني البناء الضوئي");
    expect(mixed2).toEqual([
      { text: "كلمة", lang: "ar" },
      { text: "photosynthesis", lang: "en" },
      { text: "تعني البناء الضوئي", lang: "ar" },
    ]);
  });

  it("expands difficult STEM, loanword, silent-letter, and proper-name English pronunciations", () => {
    const input = "Cellular hypertrophy and mitosis occur during muscle development";
    const normalized = normalizeTextForSpeech(input, "en");

    expect(normalized).toContain(PRONUNCIATION_LEXICON["hypertrophy"]!);
    expect(normalized).toContain(PRONUNCIATION_LEXICON["mitosis"]!);

    const chemInput = "We will study stoichiometry and photosynthesis in modern biochemistry";
    const chemNormalized = normalizeTextForSpeech(chemInput, "en");
    expect(chemNormalized).toContain(PRONUNCIATION_LEXICON["stoichiometry"]!);
    expect(chemNormalized).toContain(PRONUNCIATION_LEXICON["photosynthesis"]!);

    const hardInput = "The entrepreneur ate Worcestershire sauce with quinoa after Wednesday.";
    const hardNormalized = normalizeTextForSpeech(hardInput, "en");
    expect(hardNormalized).toContain(PRONUNCIATION_LEXICON["entrepreneur"]!);
    expect(hardNormalized).toContain(PRONUNCIATION_LEXICON["worcestershire"]!);
    expect(hardNormalized).toContain(PRONUNCIATION_LEXICON["quinoa"]!);
    expect(hardNormalized).toContain(PRONUNCIATION_LEXICON["wednesday"]!);
  });

  it("preserves Arabic diacritics (tashkeel), strips tatweel, and converts slashes into pauses", () => {
    const vocalized = "تُفَّاحَةٌ";
    expect(normalizeArabicForSpeech(vocalized)).toBe("تُفَّاحَةٌ");

    const slashMeaning = "مصدر / منـبع";
    expect(normalizeArabicForSpeech(slashMeaning)).toBe("مصدر، أو منبع");

    const extracted = extractArabicText("تفاحة — A sweet crisp fruit\nExample: Eat an apple.");
    expect(extracted).toBe("تفاحة");
  });

  it("forbids synthetic TTS from reciting Quranic verses while allowing standard Arabic", async () => {
    expect(isQuranicRecitationForbidden("إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾")).toBe(true);
    expect(isQuranicRecitationForbidden("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ")).toBe(true);
    expect(isQuranicRecitationForbidden("ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ")).toBe(true);

    expect(isQuranicRecitationForbidden("درس اليوم هو شرح قوانين نيوتن في الحركة الفيزيائية")).toBe(
      false,
    );
    expect(isQuranicRecitationForbidden("أهلاً وسهلاً بك في منصة التعليم المستمر")).toBe(false);

    const serverDenied = await synthesizeSpeechWithGemini({
      text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
    });
    expect(serverDenied.ok).toBe(false);
    if (!serverDenied.ok) {
      expect(serverDenied.code).toBe("FORBIDDEN_QURAN_TTS");
      expect(serverDenied.status).toBe(400);
    }
  });

  it("ranks Natural/Neural Arabic & English voices highest and never picks an English voice for Arabic", () => {
    const mockVoices = [
      {
        name: "eSpeak English",
        lang: "en-US",
        voiceURI: "espeak-en",
        localService: true,
        default: true,
      },
      {
        name: "Daniel",
        lang: "en-GB",
        voiceURI: "apple-daniel",
        localService: true,
        default: false,
      },
      {
        name: "Microsoft Sonia Online (Natural) - English (United Kingdom)",
        lang: "en-GB",
        voiceURI: "ms-sonia-natural",
        localService: false,
        default: false,
      },
      {
        name: "Microsoft Hamed Online (Natural) - Arabic (Saudi Arabia)",
        lang: "ar-SA",
        voiceURI: "ms-hamed-natural",
        localService: false,
        default: false,
      },
    ] as SpeechSynthesisVoice[];

    const bestAr = selectBestNativeVoice("ar", mockVoices, "ar-SA");
    expect(bestAr?.voiceURI).toBe("ms-hamed-natural");

    const bestGb = selectBestNativeVoice("en", mockVoices, "en-GB");
    expect(bestGb?.voiceURI).toBe("ms-sonia-natural");

    // When ONLY English voices exist, Arabic selection MUST return null (never use an English voice for Arabic)
    const englishOnly = mockVoices.filter((v) => v.lang.startsWith("en"));
    expect(selectBestNativeVoice("ar", englishOnly, "ar-SA")).toBeNull();
  });

  it("speaks mixed-language sentences by queuing separate English and Arabic utterances sequentially", () => {
    const spoken: MockUtterance[] = [];
    const arVoice = {
      name: "Google العربية",
      lang: "ar-SA",
      voiceURI: "google-ar",
      localService: false,
      default: false,
    } as SpeechSynthesisVoice;
    const enVoice = {
      name: "Google UK English Female",
      lang: "en-GB",
      voiceURI: "google-en-gb",
      localService: false,
      default: false,
    } as SpeechSynthesisVoice;

    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices: vi.fn(() => [arVoice, enVoice]),
        addEventListener: vi.fn(),
        speak: vi.fn((u: MockUtterance) => {
          spoken.push(u);
          // Immediately complete chunk to advance queue
          u.onend?.();
        }),
      },
    });

    const ok = speakEnhancedText("كلمة homeostasis تعني التوازن الداخلي", {
      preferNativeOnly: true,
    });
    expect(ok).toBe(true);
    expect(spoken).toHaveLength(3);
    expect(spoken[0]!.lang).toBe("ar-SA");
    expect(spoken[0]!.voice?.voiceURI).toBe("google-ar");
    expect(spoken[0]!.text).toBe("كلمة");

    expect(spoken[1]!.lang).toBe("en-GB");
    expect(spoken[1]!.voice?.voiceURI).toBe("google-en-gb");
    expect(spoken[1]!.text).toContain("hoh-mee-oh-STAY-sis".toLowerCase());

    expect(spoken[2]!.lang).toBe("ar-SA");
    expect(spoken[2]!.voice?.voiceURI).toBe("google-ar");
    expect(spoken[2]!.text).toBe("تعني التوازن الداخلي");
  });

  it("forces Arabic voice for speakArabicText and British/best English voice for speakEnglishText", () => {
    const spoken: MockUtterance[] = [];
    const arVoice = {
      name: "Maged",
      lang: "ar-SA",
      voiceURI: "maged",
      localService: true,
      default: false,
    } as SpeechSynthesisVoice;
    const enVoice = {
      name: "Daniel",
      lang: "en-GB",
      voiceURI: "daniel",
      localService: true,
      default: false,
    } as SpeechSynthesisVoice;

    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices: vi.fn(() => [arVoice, enVoice]),
        addEventListener: vi.fn(),
        speak: vi.fn((u: MockUtterance) => {
          spoken.push(u);
          u.onend?.();
        }),
      },
    });

    expect(speakArabicText("تُفَّاحَةٌ", { preferNativeOnly: true })).toBe(true);
    expect(spoken[0]!.lang).toBe("ar-SA");
    expect(spoken[0]!.voice?.voiceURI).toBe("maged");
    expect(spoken[0]!.text).toBe("تُفَّاحَةٌ");

    expect(speakEnglishText("stoichiometry", { lang: "en-GB" })).toBe(true);
    expect(spoken[1]!.lang).toBe("en-GB");
    expect(spoken[1]!.voice?.voiceURI).toBe("daniel");
    expect(spoken[1]!.text).toBe(PRONUNCIATION_LEXICON["stoichiometry"]);
  });

  it("splits long paragraphs into natural sentence chunks without exceeding bounds", () => {
    const longParagraph =
      "In biology, cellular respiration is a set of metabolic reactions and processes that take place in the cells of organisms to convert biochemical energy from nutrients into adenosine triphosphate, and then release waste products. The reactions involved in respiration are catabolic reactions, which break large molecules into smaller ones, releasing energy because weak high-energy bonds, in particular in molecular oxygen, are replaced by stronger bonds in the products.";

    const chunks = chunkTextForSpeech(longParagraph, 120);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(130);
    }
  });

  it("returns standard BCP-47 locale codes", () => {
    expect(getBcp47Locale("ar")).toBe("ar-SA");
    expect(getBcp47Locale("en")).toBe("en-US");
    expect(getBcp47Locale("en", "en-GB")).toBe("en-GB");
    expect(getBcp47Locale("fr")).toBe("fr-FR");
  });

  it("synthesizes WAV audio on server error/guard paths and plays cached neural WAV via /api/ai/tts", async () => {
    // 1. Server guards on empty or missing key
    const emptyRes = await synthesizeSpeechWithGemini({ text: "   " });
    expect(emptyRes.ok).toBe(false);
    if (!emptyRes.ok) expect(emptyRes.code).toBe("BAD_REQUEST");

    const unconfiguredRes = await synthesizeSpeechWithGemini({ text: "Hello", lang: "en" }, {});
    expect(unconfiguredRes.ok).toBe(false);
    if (!unconfiguredRes.ok) expect(unconfiguredRes.code).toBe("NOT_CONFIGURED");

    // 2. Client hybrid WAV playback + LRU cache when /api/ai/status enables TTS
    const riffWavBytes = Buffer.from(
      "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=",
      "base64",
    );
    expect(riffWavBytes.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(riffWavBytes.subarray(8, 12).toString("ascii")).toBe("WAVE");

    const playedSrcs: string[] = [];
    class MockAudio {
      src: string;
      playbackRate = 1;
      volume = 1;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(src = "") {
        this.src = src;
      }
      pause = vi.fn();
      currentTime = 0;
      play = vi.fn(async () => {
        playedSrcs.push(this.src);
        this.onended?.();
      });
    }

    vi.stubGlobal("Audio", MockAudio);
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/ai/status")) {
        return new Response(JSON.stringify({ configured: true, features: { tts: true } }), {
          status: 200,
        });
      }
      if (url.includes("/api/ai/tts")) {
        return new Response(
          JSON.stringify({
            ok: true,
            audioBase64: riffWavBytes.toString("base64"),
            mimeType: "audio/wav",
            detectedLang: "ar",
            modelUsed: "gemini-3.8-flash-lite-tts",
          }),
          { status: 200 },
        );
      }
      return new Response("{}", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    // Trigger capability probe, wait microtask, then invoke neural playback twice (2nd must hit cache)
    const { warmServerTtsCapability } = await import("../lib/speech-service");
    warmServerTtsCapability();
    await new Promise((r) => setTimeout(r, 15));

    expect(speakArabicText("تُفَّاحَةٌ")).toBe(true);
    await new Promise((r) => setTimeout(r, 20));
    expect(playedSrcs).toHaveLength(1);
    expect(playedSrcs[0]).toMatch(/^data:audio\/wav;base64,UklGR/);

    // Second identical playback hits client LRU cache with no extra /api/ai/tts fetch
    expect(speakArabicText("تُفَّاحَةٌ")).toBe(true);
    await new Promise((r) => setTimeout(r, 20));
    expect(playedSrcs).toHaveLength(2);
    const ttsFetchCount = fetchMock.mock.calls.filter(([u]) =>
      String(u).includes("/api/ai/tts"),
    ).length;
    expect(ttsFetchCount).toBe(1);
  });

  it("extracts semantic readable page text while excluding nav, buttons, and aria-hidden chrome", () => {
    const container = document.createElement("main");
    container.innerHTML = `
      <nav aria-label="Breadcrumb"><a href="/app">Home</a></nav>
      <h1>Photosynthesis Lesson</h1>
      <p>Plants convert sunlight into chemical energy.</p>
      <button type="button">Save Progress</button>
      <div aria-hidden="true"><p>Hidden decorative caption</p></div>
      <ul><li>Chloroplasts absorb light</li></ul>
    `;
    const extracted = extractReadablePageText(container);
    expect(extracted).toContain("Photosynthesis Lesson.");
    expect(extracted).toContain("Plants convert sunlight into chemical energy.");
    expect(extracted).toContain("Chloroplasts absorb light.");
    expect(extracted).not.toContain("Home");
    expect(extracted).not.toContain("Save Progress");
    expect(extracted).not.toContain("Hidden decorative caption");

    expect(() => {
      pauseEnhancedSpeech();
      resumeEnhancedSpeech();
    }).not.toThrow();
  });
});
