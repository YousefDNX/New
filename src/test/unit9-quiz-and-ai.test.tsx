import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PreferencesProvider } from "@/lib/preferences";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/common/ToastProvider";
import { Unit9VocabQuiz } from "@/components/study/Unit9VocabQuiz";
import { StudyWorkspace } from "@/components/modules/StudyWorkspace";
import { AiWorkspace } from "@/components/modules/AiWorkspace";
import { GRADE_9_UNIT_9_WORDS, UNIT_9_INTERACTIVE_QUIZ_QUESTIONS } from "@/data/grade9-unit9-vocab";
import { ALL_STUDY_VOCAB_UNITS, GRADE_9_ESSENTIAL_WORDS } from "@/data/grade9-vocab-units";
import { generateStudyAssistantReply, resolveChatModelConfig } from "@/lib/ai.server";

vi.mock("@/hooks/use-nexora", () => ({
  useUser: () => ({ data: null }),
  awardXpIfUnique: vi.fn(async () => ({ awarded: false })),
}));

function renderWithUiProviders(ui: React.ReactNode) {
  return render(
    <ThemeProvider>
      <PreferencesProvider>
        <ToastProvider>{ui}</ToastProvider>
      </PreferencesProvider>
    </ThemeProvider>,
  );
}

describe("Important Vocabulary Interactive Quiz, Expanded Study Vocabulary & Gemini Chatbot Routing", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("includes 24 Important Vocabulary words, 16 interactive quiz questions, and 24 Essential student vocabulary words", () => {
    expect(GRADE_9_UNIT_9_WORDS).toHaveLength(24);
    expect(UNIT_9_INTERACTIVE_QUIZ_QUESTIONS).toHaveLength(16);
    expect(GRADE_9_ESSENTIAL_WORDS).toHaveLength(24);
    const totalWords = ALL_STUDY_VOCAB_UNITS.reduce((sum, u) => sum + u.words.length, 0);
    expect(totalWords).toBe(141);
  });

  it("Unit9VocabQuiz delivers immediate feedback, explanations, and completes Quick Sprint cleanly", () => {
    renderWithUiProviders(<Unit9VocabQuiz />);

    // Switch to 8-question Quick Sprint
    fireEvent.click(screen.getByRole("button", { name: /Quick Sprint \(8\)/i }));

    for (let i = 0; i < 8; i++) {
      const q = UNIT_9_INTERACTIVE_QUIZ_QUESTIONS[i]!;
      expect(screen.getByText(q.question)).toBeInTheDocument();

      // Answer Q0 correctly and Q1 incorrectly to verify both feedback states
      const targetIdx = i === 1 ? (q.correctIndex + 1) % q.options.length : q.correctIndex;
      const optionButtons = within(screen.getByRole("radiogroup")).getAllByRole("button");
      fireEvent.click(optionButtons[targetIdx]!);

      const feedback = screen.getByTestId("unit9-immediate-feedback");
      expect(feedback).toBeInTheDocument();
      expect(feedback.textContent).toContain(q.explanation);

      if (i === 1) {
        expect(feedback.textContent).toMatch(/Not quite/i);
      } else {
        expect(feedback.textContent).toMatch(/Correct! Great job/i);
      }

      const nextBtnLabel = i < 7 ? /Next Question/i : /Finish & See Results/i;
      fireEvent.click(screen.getByRole("button", { name: nextBtnLabel }));
    }

    const summary = screen.getByTestId("unit9-quiz-summary");
    expect(summary).toBeInTheDocument();
    expect(summary.textContent).toContain("7 out of 8");
  });

  it("StudyWorkspace exposes Important Vocabulary Interactive Quiz and Expanded 141-word Vocabulary Cards", () => {
    renderWithUiProviders(<StudyWorkspace />);

    expect(screen.getByText(/Grade 9 Study & Vocabulary/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Browse All Study Cards & Essential Words \(141\)/i),
    ).toBeInTheDocument();

    // Open Important Vocabulary Interactive Quiz directly
    fireEvent.click(screen.getByRole("button", { name: /Important Vocabulary Interactive Quiz/i }));
    expect(screen.getByTestId("unit9-interactive-quiz")).toBeInTheDocument();

    // Go back and browse expanded study cards including Essential Mastery words
    fireEvent.click(screen.getByRole("button", { name: /Back to Study Units/i }));
    fireEvent.click(screen.getByRole("button", { name: /Browse All Study Cards/i }));
    expect(screen.getByText("Expanded Student Vocabulary Cards")).toBeInTheDocument();
    expect(screen.getByText("perseverance")).toBeInTheDocument();
  });

  it("routes Gemini models properly for fast, general, complex interactive, and deep reasoning tasks", () => {
    expect(resolveChatModelConfig("fast").model).toBe("gemini-3.1-flash-lite");
    expect(resolveChatModelConfig("balanced").model).toBe("gemini-4-hydrogen");
    expect(resolveChatModelConfig("complex").model).toBe("gemini-4-neon");
    expect(resolveChatModelConfig("deep").model).toBe("gemini-4-carbon");
  });

  it("AiWorkspace maintains multi-turn history and passes role + model tier to /api/ai/chat", async () => {
    const capturedBodies: Array<Record<string, unknown>> = [];
    const fetchMock = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      capturedBodies.push(body);
      return new Response(
        JSON.stringify({
          ok: true,
          text: `Response #${capturedBodies.length}: ${String(body["message"])}`,
          modelUsed:
            body["modelTier"] === "deep"
              ? "gemini-4-carbon"
              : body["modelTier"] === "complex"
                ? "gemini-4-neon"
                : body["modelTier"] === "fast"
                  ? "gemini-3.1-flash-lite"
                  : "gemini-4-hydrogen",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    renderWithUiProviders(<AiWorkspace />);

    // Select Vocab Coach role and Deep Reasoning (Carbon) model
    fireEvent.click(screen.getByRole("button", { name: /Vocab & Important Words Coach/i }));
    fireEvent.click(screen.getByRole("button", { name: /Deep Reason \(Carbon\)/i }));

    const input = screen.getByPlaceholderText(/Ask a study question/i);
    fireEvent.change(input, { target: { value: "Define algorithm" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Response #1: Define algorithm")).toBeInTheDocument();
    });

    // Send a second follow-up turn
    fireEvent.change(input, { target: { value: "Give me an example sentence" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Response #2: Give me an example sentence")).toBeInTheDocument();
    });

    expect(capturedBodies).toHaveLength(2);
    expect(capturedBodies[0]!["chatbotRole"]).toBe("vocab");
    expect(capturedBodies[0]!["modelTier"]).toBe("deep");
    expect(capturedBodies[0]!["history"]).toEqual([]);

    // Second turn must contain both messages from turn 1 in conversation history
    expect(capturedBodies[1]!["history"]).toEqual([
      { role: "user", content: "Define algorithm" },
      { role: "assistant", content: "Response #1: Define algorithm" },
    ]);
  });

  it("generateStudyAssistantReply handles Important Vocabulary words and quiz prompts smoothly without error fallbacks", async () => {
    const vocabRes = await generateStudyAssistantReply({
      message: "What does algorithm mean?",
      chatbotRole: "vocab",
      modelTier: "fast",
    });
    expect(vocabRes.ok).toBe(true);
    if (vocabRes.ok) {
      expect(vocabRes.text.toLowerCase()).toContain("algorithm");
      expect(vocabRes.text).toContain("خوارزمية");
    }

    const quizFollowup = await generateStudyAssistantReply({
      message: "B",
      chatbotRole: "exam",
      history: [
        { role: "user", content: "Give me a quiz" },
        { role: "assistant", content: "A) prototype B) hypothesis" },
      ],
    });
    expect(quizFollowup.ok).toBe(true);
    if (quizFollowup.ok) {
      expect(quizFollowup.text).toContain("hypothesis");
    }
  });
});
