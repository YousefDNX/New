import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PreferencesProvider } from "@/lib/preferences";
import { AiWorkspace } from "@/components/modules/AiWorkspace";
import { generateCurriculumAwareReply } from "@/lib/ai-fallback";
import * as soundEffects from "@/lib/sound-effects";
import { Grade9StudyCenter } from "@/components/english/Grade9StudyCenter";
import { SimpleEnglishWorkspace } from "@/components/modules/SimpleEnglishWorkspace";
import { QuranMushafReader } from "@/components/islamic/QuranMushafReader";
import { SpiritualDevotionPanel } from "@/components/islamic/SpiritualDevotionPanel";
import { VERIFIED_DAILY_ADHKAR } from "@/data/islamic-center";
import { NAV_PRIMARY_ITEMS, ROUTE_META } from "@/config/navigation";
import { quranAr, quranEn } from "@/lib/i18n/quran";
import { ThemesLayoutsSection } from "@/components/settings/ThemesLayoutsSection";
import { buildGeminiChatHistory, sanitizeAiDisplayText } from "@/lib/ai.server";

vi.mock("@/hooks/use-nexora", () => ({
  useUser: () => ({ data: null }),
  awardXpIfUnique: vi.fn(async () => undefined),
}));

describe("Part B Enhancements: AI Tiers, Task/Milestone Sounds, Grade 9 Split, Azkar & Mushaf Search/Swipe", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("exposes Super Fast / Normal / Pro / Pro Research tiers cleanly in AiWorkspace without legacy codenames", () => {
    render(
      <PreferencesProvider>
        <AiWorkspace />
      </PreferencesProvider>,
    );

    const modelCombo = screen.getByRole("combobox", {
      name: /Model Mode|Model Speed|سرعة النموذج/i,
    });
    fireEvent.click(modelCombo);

    const listbox = screen.getByRole("listbox");
    const text = listbox.textContent ?? "";
    expect(text).toContain("Super Fast");
    expect(text).toContain("Normal");
    expect(text).toContain("Pro");
    expect(text).toContain("Pro Research");

    expect(text.toLowerCase()).not.toContain("hydrogen");
    expect(text.toLowerCase()).not.toContain("neon");
    expect(text.toLowerCase()).not.toContain("carbon");
    expect(text.toLowerCase()).not.toContain("argon");
    expect(text.toLowerCase()).not.toContain("flash");
  });

  it("returns warm natural multilingual/dialect replies in fallback helper instead of robotic intro boilerplate", () => {
    const salam = generateCurriculumAwareReply({
      message: "السلام عليكم ورحمة الله وبركاته",
      langHint: "ar",
    });
    expect(salam).toContain("وعليكم السلام");
    expect(salam).not.toContain("بصفتي مساعد");

    const egyptian = generateCurriculumAwareReply({
      message: "ازيك عامل ايه",
      langHint: "ar",
    });
    expect(egyptian).toContain("الحمد لله");
    expect(egyptian).not.toContain("***");
  });

  it("provides distinct playTaskCompleteSound and playMilestoneSound utilities", () => {
    expect(typeof soundEffects.playTaskCompleteSound).toBe("function");
    expect(typeof soundEffects.playMilestoneSound).toBe("function");
    expect(soundEffects.playTaskCompleteSound).not.toBe(soundEffects.playMilestoneSound);
    expect(() => soundEffects.playTaskCompleteSound()).not.toThrow();
    expect(() => soundEffects.playMilestoneSound()).not.toThrow();
  });

  it("separates Important & Essential Vocab from Grade 9 Units 1–4 inside English World", () => {
    render(
      <PreferencesProvider>
        <Grade9StudyCenter />
      </PreferencesProvider>,
    );
    expect(screen.queryByRole("button", { name: /IMPORTANT VOCAB/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /ESSENTIAL PACK/i })).toBeNull();

    cleanup();

    render(
      <PreferencesProvider>
        <SimpleEnglishWorkspace />
      </PreferencesProvider>,
    );

    const vocabHubTab = screen.getByRole("button", { name: /Important & Essential Vocab/i });
    expect(vocabHubTab).toBeInTheDocument();
    fireEvent.click(vocabHubTab);
    expect(screen.getAllByText(/Important Vocabulary/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Essential Vocabulary/i).length).toBeGreaterThan(0);
  });

  it("uses Azkar naming in English labels across VERIFIED_DAILY_ADHKAR", () => {
    expect(VERIFIED_DAILY_ADHKAR.every((item) => !item.categoryLabelEn.includes("Adhkar"))).toBe(
      true,
    );
    expect(VERIFIED_DAILY_ADHKAR.some((item) => item.categoryLabelEn.includes("Azkar"))).toBe(true);
  });

  it("searches Surahs & Ayahs in QuranMushafReader, jumps immediately, and highlights target Ayah for 2 seconds", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/verses/by_page/1")) {
          return new Response(
            JSON.stringify({
              verses: [
                {
                  id: 1,
                  verse_key: "1:1",
                  verse_number: 1,
                  text_uthmani: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
                  page_number: 1,
                  juz_number: 1,
                },
              ],
            }),
            { status: 200 },
          );
        }
        if (url.includes("/verses/by_page/42")) {
          return new Response(
            JSON.stringify({
              verses: [
                {
                  id: 262,
                  verse_key: "2:255",
                  verse_number: 255,
                  text_uthmani: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ",
                  page_number: 42,
                  juz_number: 3,
                },
              ],
            }),
            { status: 200 },
          );
        }
        if (url.includes("/verses/by_key/2:255")) {
          return new Response(
            JSON.stringify({
              verse: {
                verse_key: "2:255",
                verse_number: 255,
                text_uthmani: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ",
                page_number: 42,
              },
            }),
            { status: 200 },
          );
        }
        return new Response(JSON.stringify({ verses: [] }), { status: 200 });
      }),
    );

    render(<QuranMushafReader initialPage={1} lang="ar" />);
    await screen.findByTestId("mushaf-sheet-1");

    const searchInput = screen.getByTestId("mushaf-search-input");
    fireEvent.change(searchInput, { target: { value: "2:255" } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(320);
    });

    const ayahResult = await screen.findByTestId("mushaf-search-ayah-2:255");
    await act(async () => {
      fireEvent.click(ayahResult);
    });

    const sheet42 = await screen.findByTestId("mushaf-sheet-42");
    const verseEl = sheet42.querySelector('[data-mushaf-verse="2:255"]');
    expect(verseEl).toHaveAttribute("data-highlighted", "true");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100);
    });

    expect(verseEl).not.toHaveAttribute("data-highlighted", "true");
  });

  it("supports horizontal touch swipe navigation on mobile Mushaf sheets", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        const match = url.match(/\/verses\/by_page\/(\d+)/);
        const pageNum = match ? Number(match[1]) : 1;
        return new Response(
          JSON.stringify({
            verses: [
              {
                id: pageNum * 10,
                verse_key: `2:${pageNum}`,
                verse_number: pageNum,
                text_uthmani: "وَٱللَّهُ عَلِيمٌ حَكِيمٌ",
                page_number: pageNum,
                juz_number: 1,
              },
            ],
          }),
          { status: 200 },
        );
      }),
    );

    render(<QuranMushafReader initialPage={1} lang="ar" />);
    await screen.findByTestId("mushaf-sheet-1");

    const surface = screen.getByTestId("mushaf-swipe-surface");
    fireEvent.touchStart(surface, { changedTouches: [{ clientX: 300, clientY: 200 }] });
    fireEvent.touchEnd(surface, { changedTouches: [{ clientX: 120, clientY: 205 }] });

    await waitFor(() => {
      expect(screen.getByTestId("mushaf-sheet-2")).toBeInTheDocument();
    });
  });

  it("renders sincere SpiritualDevotionPanel focused on Allah's love and Al-Firdaus with zero XP", () => {
    render(<SpiritualDevotionPanel lang="ar" />);
    const panel = screen.getByTestId("spiritual-devotion-panel");
    expect(panel).toHaveTextContent(/إخلاص تام ١٠٠٪ لله تعالى/);
    expect(panel).toHaveTextContent(/الْفِرْدَوْسَ الأَعْلَى/);
    expect(panel.textContent).not.toMatch(/XP|Leaderboard/i);

    fireEvent.click(screen.getByTestId("sincere-salawat-btn"));
    expect(screen.getByTestId("sincere-salawat-btn")).toHaveTextContent("1");
  });

  it("renames Quran & Islamic Center to Islamic Center / المركز الإسلامي across nav, routes, and i18n", () => {
    const quranNav = NAV_PRIMARY_ITEMS.find((item) => item.id === "quran");
    expect(quranNav?.labelEn).toBe("Islamic Center");
    expect(quranNav?.labelAr).toBe("المركز الإسلامي");

    expect(ROUTE_META["/app/quran"]?.labelEn).toBe("Islamic Center");
    expect(ROUTE_META["/app/quran"]?.labelAr).toBe("المركز الإسلامي");

    expect(quranEn["nav.quran"]).toBe("Islamic Center");
    expect(quranEn["mod.quran.name"]).toBe("Islamic Center");
    expect(quranAr["nav.quran"]).toBe("المركز الإسلامي");
    expect(quranAr["mod.quran.name"]).toBe("المركز الإسلامي");
  });

  it("renders 6 signature layouts & 5 menu shapes in Settings, switches DOM attributes, and persists menu style", () => {
    render(
      <PreferencesProvider>
        <ThemesLayoutsSection runSave={(apply) => apply()} highlightedRowId={null} />
      </PreferencesProvider>,
    );

    const layoutsContainer = screen.getByTestId("signature-6-layouts");
    const layoutButtons = layoutsContainer.querySelectorAll('[data-testid^="signature-layout-"]');
    expect(layoutButtons).toHaveLength(6);

    fireEvent.click(screen.getByTestId("signature-layout-double_header"));
    expect(document.documentElement.getAttribute("data-layout-mode")).toBe("double_header");

    fireEvent.click(screen.getByTestId("signature-layout-floating"));
    expect(document.documentElement.getAttribute("data-layout-mode")).toBe("floating");

    const menuContainer = screen.getByTestId("menu-style-switcher");
    const menuButtons = menuContainer.querySelectorAll('[data-testid^="menu-style-"]');
    expect(menuButtons).toHaveLength(5);

    fireEvent.click(screen.getByTestId("menu-style-glass_pills"));
    expect(document.documentElement.getAttribute("data-menu-style")).toBe("glass_pills");
    expect(localStorage.getItem("btc-menu-style")).toBe("glass_pills");

    fireEvent.click(screen.getByTestId("menu-style-floating_cards"));
    expect(document.documentElement.getAttribute("data-menu-style")).toBe("floating_cards");
    expect(localStorage.getItem("btc-menu-style")).toBe("floating_cards");
  });

  it("keeps Gemini chat history alternating ending on model turn and strips decorative *** / quotes cleanly", () => {
    const clean = sanitizeAiDisplayText('***ماذا أفعل لك"""؟\n```ts\nconst x = "***keep***";\n```');
    expect(clean).toContain("ماذا أفعل لك؟");
    expect(clean).not.toContain('"""');
    expect(clean).toContain('const x = "***keep***";');

    const normalized = buildGeminiChatHistory(
      [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
        { role: "user", content: "Unanswered turn 1" },
        { role: "user", content: "Unanswered turn 2" },
      ],
      "Current message",
    );
    expect(normalized).toHaveLength(2);
    expect(normalized[0]?.role).toBe("user");
    expect(normalized[1]?.role).toBe("model");
  });

  it("shows a clean Secrets setup notice on NOT_CONFIGURED without firing any mount fetch", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            ok: false,
            code: "NOT_CONFIGURED",
            message: "BTC AI is not configured yet (missing GEMINI_API_KEY in Settings > Secrets).",
          }),
          { status: 503, headers: { "Content-Type": "application/json" } },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <PreferencesProvider>
        <AiWorkspace />
      </PreferencesProvider>,
    );

    expect(fetchMock).toHaveBeenCalledTimes(0);

    const input = screen.getByPlaceholderText(/Ask a study question|اكتب سؤالك هنا/i);
    fireEvent.change(input, { target: { value: "السلام عليكم" } });
    fireEvent.click(screen.getByRole("button", { name: /Send|إرسال/i }));

    await waitFor(() => {
      expect(screen.getByTestId("ai-key-setup-notice")).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("provides voice recitation button in QuranMushafReader and handles recitation jump", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/verses/by_page/1")) {
          return new Response(
            JSON.stringify({
              verses: [
                {
                  id: 1,
                  verse_key: "1:1",
                  verse_number: 1,
                  text_uthmani: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
                  page_number: 1,
                  juz_number: 1,
                },
              ],
            }),
            { status: 200 },
          );
        }
        if (url.includes("/verses/by_page/42")) {
          return new Response(
            JSON.stringify({
              verses: [
                {
                  id: 262,
                  verse_key: "2:255",
                  verse_number: 255,
                  text_uthmani: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ",
                  page_number: 42,
                  juz_number: 3,
                },
              ],
            }),
            { status: 200 },
          );
        }
        if (url.includes("/verses/by_key/2:255")) {
          return new Response(
            JSON.stringify({
              verse: {
                verse_key: "2:255",
                verse_number: 255,
                text_uthmani: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ",
                page_number: 42,
              },
            }),
            { status: 200 },
          );
        }
        return new Response(JSON.stringify({ verses: [] }), { status: 200 });
      }),
    );

    // Mock prompt for test environment without Web Speech API
    const promptSpy = vi.spyOn(window, "prompt").mockImplementation(() => "2:255");

    render(<QuranMushafReader initialPage={1} lang="ar" />);
    await screen.findByTestId("mushaf-sheet-1");

    const voiceBtn = screen.getByTestId("mushaf-voice-search-btn");
    expect(voiceBtn).toBeInTheDocument();

    fireEvent.click(voiceBtn);
    expect(promptSpy).toHaveBeenCalled();

    const sheet42 = await screen.findByTestId("mushaf-sheet-42");
    expect(sheet42).toBeInTheDocument();
  });

  it("supports multi-session chat history, creation, and switching in AiWorkspace", async () => {
    render(
      <PreferencesProvider>
        <AiWorkspace />
      </PreferencesProvider>,
    );

    // Open chat history sidebar
    const toggleBtn = screen.getByTestId("ai-toggle-sessions");
    fireEvent.click(toggleBtn);

    const sidebar = await screen.findByTestId("ai-sessions-sidebar");
    expect(sidebar).toBeInTheDocument();

    // Create a new conversation
    const newChatBtn = screen.getByTestId("ai-sidebar-new-chat");
    fireEvent.click(newChatBtn);

    // Verify session count updated
    const sessionItems = screen.getAllByTestId(/^ai-session-item-/);
    expect(sessionItems.length).toBeGreaterThanOrEqual(2);
  });
});
