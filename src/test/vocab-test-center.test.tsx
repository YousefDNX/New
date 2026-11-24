import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import { VocabTestCenter } from "@/components/study/VocabTestCenter";
import {
  COMPREHENSIVE_VOCAB_TEST_SUITES,
  ACADEMIC_STUDENT_VOCABULARY,
  CONFUSING_WORDS_DECKS,
} from "@/data/grade9-expanded-vocab";
import { PreferencesProvider } from "@/lib/preferences";

function renderWithPrefs(ui: React.ReactElement, lang: "en" | "ar" = "en") {
  return render(<PreferencesProvider initialLang={lang}>{ui}</PreferencesProvider>);
}

describe("Expanded Vocabulary & Interactive VocabTestCenter", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("verifies expanded vocabulary datasets are populated with definitions and examples", () => {
    expect(ACADEMIC_STUDENT_VOCABULARY.length).toBeGreaterThanOrEqual(15);
    expect(CONFUSING_WORDS_DECKS.length).toBeGreaterThanOrEqual(5);
    expect(COMPREHENSIVE_VOCAB_TEST_SUITES.length).toBeGreaterThanOrEqual(3);

    const evaluateWord = ACADEMIC_STUDENT_VOCABULARY.find((w) => w.word === "evaluate");
    expect(evaluateWord).toBeDefined();
    expect(evaluateWord?.meaningAr).toContain("يُقيّم");

    const affectPair = CONFUSING_WORDS_DECKS.find((w) => w.id === "conf-affect-effect");
    expect(affectPair).toBeDefined();
    expect(affectPair?.tipsEn).toContain("RAVEN");
  });

  it("renders VocabTestCenter, switches between test suites, and provides instant feedback", () => {
    renderWithPrefs(<VocabTestCenter />);

    expect(screen.getByTestId("vocab-test-center")).toBeInTheDocument();
    expect(screen.getByText(/Interactive Vocabulary Test Center/i)).toBeInTheDocument();

    // Verify all 3 test suite cards are rendered
    expect(screen.getByText(/Quick 10-Question Sprint/i)).toBeInTheDocument();
    expect(screen.getByText(/Grade 9 Vocabulary Mock Exam/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Important Vocabulary Science & Inventions Master Test/i),
    ).toBeInTheDocument();

    // Answer Q1 correctly
    const q1Options = within(screen.getByRole("radiogroup")).getAllByRole("button");
    expect(q1Options.length).toBe(4);
    fireEvent.click(q1Options[0]!);

    // Verify immediate feedback box appears with explanation
    const feedback = screen.getByTestId("vocab-test-feedback");
    expect(feedback).toBeInTheDocument();
    expect(feedback.textContent).toContain("Correct! Excellent job!");
    expect(feedback.textContent).toContain("Innovate");

    // Click Next Question
    fireEvent.click(screen.getByRole("button", { name: /Next Question/i }));
    expect(screen.getByText(/Question 2 \/ 10/i)).toBeInTheDocument();
  });

  it("completes a full quiz and presents score summary and review option", () => {
    renderWithPrefs(<VocabTestCenter />);

    const suite = COMPREHENSIVE_VOCAB_TEST_SUITES[0]!;

    for (let i = 0; i < suite.questions.length; i++) {
      const q = suite.questions[i]!;
      const options = within(screen.getByRole("radiogroup")).getAllByRole("button");

      // For question 2, pick wrong option to test error tracking
      const targetIdx = i === 1 ? (q.correctIndex + 1) % q.options.length : q.correctIndex;
      fireEvent.click(options[targetIdx]!);

      const nextLabel = i < suite.questions.length - 1 ? /Next Question/i : /Finish & See Results/i;
      fireEvent.click(screen.getByRole("button", { name: nextLabel }));
    }

    const summary = screen.getByTestId("vocab-test-summary");
    expect(summary).toBeInTheDocument();
    expect(summary.textContent).toContain("9 out of 10 questions correctly");

    // Practice missed questions button should be available
    const practiceMissedBtn = screen.getByRole("button", { name: /Practice Missed Only/i });
    expect(practiceMissedBtn).toBeInTheDocument();
    fireEvent.click(practiceMissedBtn);

    expect(screen.getByText(/Reviewing Mistakes \(1\/1\)/i)).toBeInTheDocument();
  });
});
