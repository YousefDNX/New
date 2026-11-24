import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { PreferencesProvider } from "../lib/preferences";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import { ToastProvider } from "../components/common/ToastProvider";
import { Unit3VocabWorkspace } from "../components/study/Unit3VocabWorkspace";
import { VocabularyAcademyPanel } from "../components/english/academies/WritingVocabGrammarAcademies";
import { StudyWorkspace } from "../components/modules/StudyWorkspace";
import { createInitialEnglishWorldState } from "../lib/english-world";
import { resetSpeechEngineStateForTests } from "../lib/speech-service";

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({
      children,
      to,
      ...rest
    }: {
      children: ReactNode;
      to: string;
      [k: string]: unknown;
    }) => (
      <a href={to} {...rest}>
        {children}
      </a>
    ),
  };
});

vi.mock("../hooks/use-nexora", () => ({
  useUser: () => ({ user: { uid: "test-student" } }),
  awardXpIfUnique: vi.fn(async () => ({ awarded: false })),
  useTaskActions: () => ({
    addTask: vi.fn(async () => "task-1"),
  }),
}));

const mockReviewFlashcard = vi.fn(async () => undefined);
const mockStudyItems = [
  {
    id: "fc-apple",
    user_id: "test-student",
    kind: "flashcard" as const,
    subject: "English",
    title: "Apple",
    content: "Apple",
    answer: "تفاحة — A crisp sweet fruit eaten fresh",
    difficulty: "easy" as const,
    next_review_at: "2020-01-01T00:00:00.000Z",
    review_count: 0,
    mistake_status: null,
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

vi.mock("../hooks/use-modules", () => ({
  useStudyItems: () => ({
    data: mockStudyItems,
    isLoading: false,
  }),
  useStudyActions: () => ({
    addStudyItem: vi.fn(async () => undefined),
    updateStudyItem: vi.fn(async () => undefined),
    deleteStudyItem: vi.fn(async () => undefined),
    reviewFlashcard: mockReviewFlashcard,
    recordQuizAttempt: vi.fn(async () => undefined),
    updateMistakeStatus: vi.fn(async () => undefined),
  }),
  useQuizAttempts: () => ({ data: [], isLoading: false }),
  useFocusActions: () => ({ logFocusSession: vi.fn(async () => undefined) }),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <ThemeProvider>
      <PreferencesProvider>
        <ToastProvider>{ui}</ToastProvider>
      </PreferencesProvider>
    </ThemeProvider>,
  );
}

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

describe("Vocabulary Flashcards — Conditional 'استمع بالعربية' Arabic Audio & Independent Pronunciation", () => {
  let spokenUtterances: MockUtterance[] = [];

  beforeEach(() => {
    resetSpeechEngineStateForTests();
    localStorage.clear();
    spokenUtterances = [];

    const arVoice = {
      name: "Microsoft Hamed Online (Natural) - Arabic (Saudi Arabia)",
      lang: "ar-SA",
      voiceURI: "ms-ar",
      localService: false,
      default: false,
    } as SpeechSynthesisVoice;

    const enGbVoice = {
      name: "Microsoft Sonia Online (Natural) - English (United Kingdom)",
      lang: "en-GB",
      voiceURI: "ms-en-gb",
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
        getVoices: vi.fn(() => [arVoice, enGbVoice]),
        addEventListener: vi.fn(),
        speak: vi.fn((u: MockUtterance) => {
          spokenUtterances.push(u);
          u.onend?.();
        }),
      },
    });
  });

  it("Unit3VocabWorkspace: hides 'استمع بالعربية' on front, shows & plays Arabic translation only after flip", () => {
    renderWithProviders(<Unit3VocabWorkspace />);

    // Front side: displays English word + English pronunciation, NO Arabic audio button
    expect(screen.getByText("reflect")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /استمع بالعربية/ })).toBeNull();

    // Front English button pronounces English word in en-GB
    fireEvent.click(screen.getByRole("button", { name: /Listen to pronunciation/i }));
    expect(spokenUtterances).toHaveLength(1);
    expect(spokenUtterances[0]!.text).toBe("reflect");
    expect(spokenUtterances[0]!.lang).toBe("en-GB");

    // Flip card to reveal Arabic translation
    fireEvent.click(screen.getByText(/Click to flip back/i));

    // Back side: shows original English word, Arabic translation, and "استمع بالعربية" button
    expect(screen.getByText("reflect")).toBeInTheDocument();
    expect(screen.getByText("يعكس / يتأمّل ويفكّر بعمق")).toBeInTheDocument();
    const arabicBtn = screen.getByRole("button", { name: /استمع بالعربية/ });
    expect(arabicBtn).toBeInTheDocument();

    // Clicking "استمع بالعربية" plays the Arabic translation in an Arabic voice without flipping back
    fireEvent.click(arabicBtn);
    expect(spokenUtterances).toHaveLength(2);
    expect(spokenUtterances[1]!.text).toBe("يعكس، أو يتأمّل ويفكّر بعمق");
    expect(spokenUtterances[1]!.lang).toBe("ar-SA");
    expect(screen.getByText("يعكس / يتأمّل ويفكّر بعمق")).toBeInTheDocument();

    // English button remains completely independent on the flipped side
    fireEvent.click(screen.getByRole("button", { name: /Listen \(en-GB\)/i }));
    expect(spokenUtterances).toHaveLength(3);
    expect(spokenUtterances[2]!.text).toBe("reflect");
    expect(spokenUtterances[2]!.lang).toBe("en-GB");
  });

  it("VocabularyAcademyPanel: shows 'استمع بالعربية' strictly after flipping to reveal Arabic translation", () => {
    renderWithProviders(
      <VocabularyAcademyPanel
        englishState={createInitialEnglishWorldState()}
        onPracticeWord={vi.fn()}
        onAddNotebookWord={vi.fn()}
        onPushFlashcardToStudy={vi.fn()}
      />,
    );

    // Front: English word + Pronounce button visible, "استمع بالعربية" NOT in DOM
    expect(screen.queryByRole("button", { name: /استمع بالعربية/ })).toBeNull();

    const pronounceBtn = screen.getByRole("button", { name: /^Pronounce$/i });
    fireEvent.click(pronounceBtn);
    expect(spokenUtterances).toHaveLength(1);
    expect(spokenUtterances[0]!.lang).toBe("en-GB");
    const firstEnglishText = spokenUtterances[0]!.text;

    // Flip to reveal translation
    fireEvent.click(screen.getByRole("button", { name: /Reveal Meaning & Collocations/i }));

    // Now "استمع بالعربية" appears
    const arabicBtn = screen.getByRole("button", { name: /استمع بالعربية/ });
    expect(arabicBtn).toBeInTheDocument();

    // Clicking Arabic button speaks Arabic translation ONLY, not the English word
    fireEvent.click(arabicBtn);
    expect(spokenUtterances).toHaveLength(2);
    expect(spokenUtterances[1]!.lang).toBe("ar-SA");
    expect(spokenUtterances[1]!.text).not.toBe(firstEnglishText);
    expect(/[\u0600-\u06FF]/.test(spokenUtterances[1]!.text)).toBe(true);

    // Flipping back hides "استمع بالعربية" again
    fireEvent.click(screen.getByRole("button", { name: /Hide Meaning/i }));
    expect(screen.queryByRole("button", { name: /استمع بالعربية/ })).toBeNull();
  });

  it("StudyWorkspace Flashcard review: reveals 'استمع بالعربية' only on flip and speaks Arabic translation", () => {
    renderWithProviders(<StudyWorkspace />);

    // Open Unit 3 flashcards from the Grade 9 Study & Vocabulary hub
    fireEvent.click(screen.getByRole("button", { name: /Open Food, Culture & Healthy Living/i }));

    // Front: "reflect" + Listen (British English) button, NO "استمع بالعربية" button
    expect(screen.getByText("reflect")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /استمع بالعربية/ })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Listen \(British English\)/i }));
    expect(spokenUtterances).toHaveLength(1);
    expect(spokenUtterances[0]!.text).toBe("reflect");
    expect(spokenUtterances[0]!.lang).toBe("en-GB");

    // Reveal Arabic Meaning
    fireEvent.click(screen.getByRole("button", { name: /Reveal Arabic Meaning/i }));

    // Back: shows original English word, Arabic translation, and "استمع بالعربية"
    expect(screen.getByText("reflect")).toBeInTheDocument();
    expect(screen.getByText("يعكس / يتأمّل ويفكّر بعمق")).toBeInTheDocument();
    const arabicBtn = screen.getByRole("button", { name: /استمع بالعربية/ });
    expect(arabicBtn).toBeInTheDocument();

    fireEvent.click(arabicBtn);
    expect(spokenUtterances).toHaveLength(2);
    expect(spokenUtterances[1]!.text).toBe("يعكس، أو يتأمّل ويفكّر بعمق");
    expect(spokenUtterances[1]!.lang).toBe("ar-SA");
  });
});
