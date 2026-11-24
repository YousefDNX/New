import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PreferencesProvider } from "@/lib/preferences";
import { AiWorkspace } from "@/components/modules/AiWorkspace";
import { Unit3VocabWorkspace } from "@/components/study/Unit3VocabWorkspace";
import { GRADE_9_UNIT_3_WORDS } from "@/data/grade9-unit3-vocab";
import { formatGeminiError } from "@/lib/ai.server";
import { searchUnifiedIslamicCenter } from "@/lib/islamic-search";

vi.mock("@/hooks/use-nexora", () => ({
  useUser: () => ({ data: null }),
  awardXpIfUnique: vi.fn(async () => undefined),
}));

describe("Regression fixes: AI UI sanitization & Unit 3 Context Scenario Mode 8", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders AiWorkspace without Gemini branding or model tier selector and sends fixed balanced tier", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/api/ai/status")) {
        return new Response(JSON.stringify({ ok: true, configured: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ ok: true, text: "Here is your answer." }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(
      <PreferencesProvider>
        <AiWorkspace />
      </PreferencesProvider>,
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/ai/status");
    });

    expect(container.textContent).not.toMatch(/\bGemini\b/i);
    expect(container.textContent).not.toMatch(/\bHydrogen\b/i);
    expect(container.querySelectorAll("select")).toHaveLength(0);

    const textarea = screen.getByPlaceholderText(/Ask a study question/i);
    fireEvent.change(textarea, { target: { value: "Explain photosynthesis" } });
    fireEvent.submit(textarea.closest("form")!);

    await waitFor(() => {
      const chatCall = fetchMock.mock.calls.find(([url]) => String(url).includes("/api/ai/chat"));
      expect(chatCall).toBeDefined();
      const init = (chatCall as unknown[] | undefined)?.[1] as RequestInit | undefined;
      const body = JSON.parse(String(init?.body ?? "{}"));
      expect(body.modelTier).toBe("balanced");
    });
  });

  it("renders dynamic scenarios across all 24 words in Unit 3 Mode 8 (context_choice)", () => {
    render(
      <PreferencesProvider>
        <Unit3VocabWorkspace />
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Context Scenario/i }));

    expect(screen.getByText("Scenario 1 of 24")).toBeInTheDocument();
    const firstPrompt = screen.getByTestId("context-scenario-prompt").textContent ?? "";
    expect(firstPrompt.length).toBeGreaterThan(20);
    expect(firstPrompt).not.toContain("artificial pesticides or chemical sprays");

    // Word 1 is "reflect" — pick an option, submit, and advance to Scenario 2
    const firstWord = GRADE_9_UNIT_3_WORDS[0]!;
    fireEvent.click(screen.getByRole("button", { name: firstWord.word }));
    fireEvent.click(screen.getByRole("button", { name: "Submit Scenario" }));
    fireEvent.click(screen.getByRole("button", { name: /Next Scenario/i }));

    expect(screen.getByText("Scenario 2 of 24")).toBeInTheDocument();
    const secondPrompt = screen.getByTestId("context-scenario-prompt").textContent ?? "";
    expect(secondPrompt).not.toBe(firstPrompt);
    expect(screen.getByRole("button", { name: GRADE_9_UNIT_3_WORDS[1]!.word })).toBeInTheDocument();
  });

  it("surfaces upstream AI errors cleanly in AiWorkspace instead of fabricating fallback replies", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/api/ai/status")) {
        return new Response(JSON.stringify({ ok: true, configured: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({
          ok: false,
          code: "UPSTREAM_ERROR",
          message: "Service rejected key. Check Settings > Secrets.",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <PreferencesProvider>
        <AiWorkspace />
      </PreferencesProvider>,
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/ai/status");
    });

    const inputEl = screen.getByPlaceholderText(/Ask a study question/i) as HTMLInputElement;
    fireEvent.change(inputEl, { target: { value: "Explain Newton's laws" } });
    fireEvent.submit(inputEl.closest("form")!);

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Service rejected key");
    expect(screen.queryByText(/Local Fallback|Offline Socratic Coach/i)).toBeNull();
    expect(inputEl.value).toBe("Explain Newton's laws");
  });

  it("parses Google GenAI JSON error payloads in formatGeminiError and matches Hadith/Adhkar/Duas in unified search", () => {
    const parsedErr = formatGeminiError(
      new Error(
        JSON.stringify({
          error: {
            code: 400,
            message: "API key not valid. Please pass a valid API key.",
            details: [{ reason: "API_KEY_INVALID" }],
          },
        }),
      ),
      false,
    );
    expect(parsedErr.ok).toBe(false);
    expect(parsedErr.status).toBe(400);
    expect(parsedErr.message).toContain("GEMINI_API_KEY");
    expect(parsedErr.message).not.toContain('{"error"');

    const hadithHits = searchUnifiedIslamicCenter("intentions", "hadith");
    expect(hadithHits.length).toBeGreaterThan(0);
    expect(hadithHits[0]?.subtitleEn.length).toBeGreaterThan(0);

    const adhkarHits = searchUnifiedIslamicCenter("morning", "adhkar");
    expect(adhkarHits.length).toBeGreaterThan(0);
    expect(adhkarHits[0]?.titleEn).toContain("Morning Adhkar");

    const duaHits = searchUnifiedIslamicCenter("parents", "dua");
    expect(duaHits.length).toBeGreaterThan(0);
    expect(duaHits[0]?.sourceRef.length).toBeGreaterThan(0);
  });
});
