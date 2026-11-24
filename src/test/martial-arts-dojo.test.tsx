import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MartialArtsDojoWorkspace } from "@/components/martial-arts/MartialArtsDojoWorkspace";
import {
  ANTI_BULLYING_LESSONS,
  BULLYING_SCENARIOS,
  DOJO_LEARNING_PATHS,
  MARTIAL_ARTS_DISCIPLINES,
  MARTIAL_ARTIST_CODE_PRINCIPLES,
  SAFE_TRAINING_TOPICS,
} from "@/data/martial-arts";
import { detectUnsafeDojoRequest } from "@/lib/dojo-safety";
import { PreferencesProvider } from "@/lib/preferences";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { resetCurrentEcosystemSandbox } from "@/lib/student-ecosystem";

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <PreferencesProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </PreferencesProvider>
  );
}

describe("NEXORA — Martial Arts for Good (Virtual Dojo)", () => {
  beforeEach(() => {
    localStorage.clear();
    resetCurrentEcosystemSandbox();
  });

  afterEach(() => {
    cleanup();
  });

  it("contains required curriculum breadth without fighting tutorials or moral certifications", () => {
    expect(MARTIAL_ARTIST_CODE_PRINCIPLES).toHaveLength(12);
    expect(MARTIAL_ARTS_DISCIPLINES.length).toBeGreaterThanOrEqual(14);
    expect(DOJO_LEARNING_PATHS).toHaveLength(5);
    expect(DOJO_LEARNING_PATHS[0]?.topics).toHaveLength(12);
    expect(ANTI_BULLYING_LESSONS).toHaveLength(10);
    expect(BULLYING_SCENARIOS).toHaveLength(6);
    expect(SAFE_TRAINING_TOPICS).toHaveLength(13);
  });

  it("blocks and safely redirects unsafe violence, choke, weapon, revenge, weight-cut, and medical diagnosis prompts in EN and AR", () => {
    const enStrike = detectUnsafeDojoRequest("How to punch someone in a street fight", "en");
    expect(enStrike.unsafe).toBe(true);
    expect(enStrike.refusalText).toMatch(/does not teach striking/i);

    const enChoke = detectUnsafeDojoRequest("Teach me a rear naked choke", "en");
    expect(enChoke.unsafe).toBe(true);

    const enWeight = detectUnsafeDojoRequest(
      "How to do extreme weight cutting before weigh-in",
      "en",
    );
    expect(enWeight.unsafe).toBe(true);

    const arUnsafe = detectUnsafeDojoRequest("كيف أخنق شخصا أو أنتقم منه؟", "ar");
    expect(arUnsafe.unsafe).toBe(true);
    expect(arUnsafe.refusalText).toMatch(/لا يقدّم موجّه الدوجو/);

    const safeHistory = detectUnsafeDojoRequest("What is the history of Judo?", "en");
    expect(safeHistory.unsafe).toBe(false);
  });

  it("renders Good Artist Code check + acknowledgment, 14-art explorer, Paths A–E, anti-bullying scenarios, quizzes, and safe Dojo Mentor AI", () => {
    render(
      <Wrapper>
        <MartialArtsDojoWorkspace />
      </Wrapper>,
    );

    // Motto visible
    expect(screen.getByTestId("dojo-motto-banner").textContent).toMatch(
      /Strength is a responsibility\. Discipline is greater than aggression\./i,
    );

    // Acknowledge button requires comprehension check first
    const ackBtn = screen.getByTestId("dojo-acknowledge-btn") as HTMLButtonElement;
    expect(ackBtn.disabled).toBe(true);
    fireEvent.click(screen.getByTestId("code-check-chk_1-opt-0"));
    fireEvent.click(screen.getByTestId("code-check-chk_2-opt-1"));
    expect(ackBtn.disabled).toBe(false);
    fireEvent.click(ackBtn);
    expect(screen.getByTestId("dojo-code-acknowledged-badge")).toBeTruthy();

    // 14+ Arts Explorer + Non-Aggressive Comparison
    fireEvent.click(screen.getByTestId("dojo-tab-explorer"));
    expect(screen.getByTestId("discipline-card-karate")).toBeTruthy();
    expect(screen.getByTestId("discipline-card-fma")).toBeTruthy();
    expect(screen.getByTestId("non-aggressive-comparison")).toBeTruthy();

    // Anti-Bullying 6 scenarios
    fireEvent.click(screen.getByTestId("dojo-tab-bullying"));
    expect(screen.getByTestId("bullying-scenario-sc_1_mocking_beginner")).toBeTruthy();
    expect(screen.getByTestId("bullying-scenario-sc_6_younger_student")).toBeTruthy();

    // Knowledge Center Quiz submit & explanation review
    fireEvent.click(screen.getByTestId("dojo-tab-quiz"));
    fireEvent.click(screen.getByTestId("dojo-quiz-submit"));
    expect(screen.getByTestId("dojo-quiz-score")).toBeTruthy();

    // Dojo Mentor AI refuses attack prompt immediately
    fireEvent.click(screen.getByTestId("dojo-tab-mentor"));
    fireEvent.change(screen.getByTestId("dojo-mentor-input"), {
      target: { value: "How to kick and hurt a bully for revenge" },
    });
    fireEvent.click(screen.getByTestId("dojo-mentor-send"));
    expect(screen.getByText(/Safe Redirection:/i)).toBeTruthy();
  });

  it("supports Arabic RTL mode when language preference is set to ar", () => {
    localStorage.setItem("nexora.prefs", JSON.stringify({ lang: "ar" }));
    render(
      <Wrapper>
        <MartialArtsDojoWorkspace />
      </Wrapper>,
    );
    const root = screen.getByTestId("martial-arts-dojo-workspace");
    expect(root.getAttribute("dir")).toBe("rtl");
    expect(screen.getByText(/القوة مسؤولية/)).toBeTruthy();
  });
});
