import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PreferencesProvider } from "@/lib/preferences";
import { GrammarAcademyPanel } from "@/components/english/academies/WritingVocabGrammarAcademies";
import { SafeMarkdownRenderer } from "@/components/ai/SafeMarkdownRenderer";
import { AiWorkspace } from "@/components/modules/AiWorkspace";
import { createInitialEnglishWorldState } from "@/lib/english-world";
import { GRAMMAR_TOPICS } from "@/data/english-academies";
import { streamStudyAssistantReply } from "@/lib/ai.server";
import * as soundEffects from "@/lib/sound-effects";

vi.mock("@/hooks/use-nexora", () => ({
  useUser: () => ({ data: null }),
  awardXpIfUnique: vi.fn(async () => ({ awarded: false })),
}));

describe("Grammar 'Both...and / Neither...nor', Sound Feedback, SafeMarkdown & Streaming AI", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("GrammarAcademyPanel supports Both...and / Neither...nor graded quiz, locked choices, and synthesized UI sound effects", () => {
    const bothNeitherTopic = GRAMMAR_TOPICS.find((t) => t.id === "grm-both-neither");
    expect(bothNeitherTopic).toBeDefined();
    expect(bothNeitherTopic!.exercises.length).toBeGreaterThanOrEqual(8);

    const correctSpy = vi
      .spyOn(soundEffects, "playCorrectSound")
      .mockImplementation(() => undefined);
    const incorrectSpy = vi
      .spyOn(soundEffects, "playIncorrectSound")
      .mockImplementation(() => undefined);

    const onRecordMistake = vi.fn();
    render(
      <PreferencesProvider>
        <GrammarAcademyPanel
          englishState={createInitialEnglishWorldState()}
          onSubmitGrammarScore={vi.fn()}
          onRecordMistake={onRecordMistake}
        />
      </PreferencesProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Both \.\.\. and & Neither \.\.\. nor/i }));
    const ex0 = bothNeitherTopic!.exercises[0]!;
    expect(screen.getByText(`1. ${ex0.prompt}`)).toBeInTheDocument();

    const radioGroup = screen.getByRole("radiogroup");
    const optButtons = within(radioGroup).getAllByRole("button");
    fireEvent.click(optButtons[ex0.correctIndex!]!);

    expect(correctSpy).toHaveBeenCalledTimes(1);
    expect(incorrectSpy).not.toHaveBeenCalled();

    const feedback = screen.getByTestId("grammar-immediate-feedback");
    expect(feedback.textContent).toMatch(/Correct!/i);
    expect(feedback.textContent).toContain(ex0.explanation);

    // Selected answer should lock option buttons until moving to next question
    for (const btn of optButtons) {
      expect(btn).toBeDisabled();
    }

    fireEvent.click(screen.getByRole("button", { name: /Next Question/i }));
    const ex1 = bothNeitherTopic!.exercises[1]!;
    const wrongIdx = ((ex1.correctIndex ?? 0) + 1) % ex1.options!.length;
    const nextButtons = within(screen.getByRole("radiogroup")).getAllByRole("button");
    fireEvent.click(nextButtons[wrongIdx]!);

    expect(incorrectSpy).toHaveBeenCalledTimes(1);
    expect(onRecordMistake).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("grammar-immediate-feedback").textContent).toMatch(/Incorrect/i);
  });

  it("SafeMarkdownRenderer sanitizes dangerous links/HTML, formats tables & copyable code, and handles streaming fences", () => {
    const md = [
      "# Study Summary",
      "",
      "أهلاً بك يا بطل in **BTC** with `dir=auto` support.",
      "",
      "[Unsafe JS](javascript:alert(1)) and [Safe Link](https://example.com/docs)",
      "",
      "<script>window.__xss = true;</script>",
      "",
      "| Item | Status |",
      "| --- | --- |",
      "| Streaming | Ready |",
      "",
      "```ts",
      "const greet = (name: string) => `Hi ${name}`;",
      "```",
      "",
      "```python",
      "print('still streaming')",
    ].join("\n");

    const { container } = render(<SafeMarkdownRenderer content={md} />);

    // No raw <script> tag injected into DOM
    expect(container.querySelector("script")).toBeNull();
    // Script text escapes safely as text content
    expect(container.textContent).toContain("<script>window.__xss = true;</script>");

    // Dangerous href protocol removed
    const links = Array.from(container.querySelectorAll("a"));
    expect(links).toHaveLength(1);
    expect(links[0]!.getAttribute("href")).toBe("https://example.com/docs");
    expect(links.some((a) => (a.getAttribute("href") ?? "").startsWith("javascript:"))).toBe(false);

    // Bilingual paragraph uses dir="auto"
    const dirAutoEls = container.querySelectorAll('[dir="auto"]');
    expect(dirAutoEls.length).toBeGreaterThan(0);

    // Both closed and streaming code fences render copy buttons
    const copyCodeButtons = screen.getAllByRole("button", { name: /Copy code block/i });
    expect(copyCodeButtons).toHaveLength(2);
    expect(screen.getByText("Streaming")).toBeInTheDocument();
  });

  it("AiWorkspace progressively streams SSE events and renders Markdown cleanly", async () => {
    const encoder = new TextEncoder();
    const sseStream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"type":"delta","text":"## أهلاً!\\n\\n"}\n\n'));
        controller.enqueue(
          encoder.encode(
            'data: {"type":"delta","text":"إليك مثال بسيط:\\n\\n```js\\nconsole.log(1);\\n```"}\n\n',
          ),
        );
        controller.enqueue(
          encoder.encode(
            'data: {"type":"done","modelUsed":"gemini-4-hydrogen","tierUsed":"balanced","isGrounded":false,"sources":[],"searchQueries":[],"proposedActions":[]}\n\n',
          ),
        );
        controller.close();
      },
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(sseStream, {
          status: 200,
          headers: { "Content-Type": "text/event-stream; charset=utf-8" },
        });
      }),
    );

    render(
      <PreferencesProvider>
        <AiWorkspace />
      </PreferencesProvider>,
    );

    const textarea = screen.getByPlaceholderText(/Ask a study question/i);
    fireEvent.change(textarea, { target: { value: "ازيك؟ اديني مثال جافاسكربت" } });
    fireEvent.submit(textarea.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("console.log(1);")).toBeInTheDocument();
    });
    expect(screen.getByText("Normal Mode")).toBeInTheDocument();
  });

  it("streamStudyAssistantReply emits honest NOT_CONFIGURED error when API key is missing", async () => {
    const events = [];
    for await (const evt of streamStudyAssistantReply(
      { message: "Hello BTC AI", modelTier: "balanced" },
      { GEMINI_API_KEY: "" },
    )) {
      events.push(evt);
    }

    expect(events).toHaveLength(1);
    expect(events[0]!.type).toBe("error");
    if (events[0]!.type === "error") {
      expect(events[0]!.code).toBe("NOT_CONFIGURED");
      expect(events[0]!.status).toBe(503);
    }
  });
});
