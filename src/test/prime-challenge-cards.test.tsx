import { beforeEach, describe, expect, it } from "vitest";
import {
  buildEligibleChallengePool,
  drawNextChallenge,
  evaluateChallengeResponse,
} from "@/lib/prime-challenge-engine";
import { normalizeLayoutMode } from "@/lib/theme-catalog";
import type { StudyItemRow } from "@/lib/firestore-data";

const SAMPLE_STUDY_ITEMS: StudyItemRow[] = [
  {
    id: "fc1",
    user_id: "u1",
    kind: "flashcard",
    subject: "Science",
    deck: null,
    title: "Water Boiling Point",
    content: "At standard pressure, what is water's boiling point in Celsius?",
    answer: "100",
    difficulty: "easy",
    study_status: "not_started",
    mistake_reason: null,
    mistake_status: "open",
    review_count: 0,
    next_review_at: null,
    created_at: "2026-11-18T00:00:00.000Z",
    updated_at: "2026-11-18T00:00:00.000Z",
  },
  {
    id: "note1",
    user_id: "u1",
    kind: "note",
    subject: "History",
    deck: null,
    title: "Silk Road",
    content: "Connected East Asia and the Mediterranean through overland and maritime trade.",
    answer: null,
    difficulty: "medium",
    study_status: "not_started",
    mistake_reason: null,
    mistake_status: "open",
    review_count: 0,
    next_review_at: null,
    created_at: "2026-11-18T00:00:00.000Z",
    updated_at: "2026-11-18T00:00:00.000Z",
  },
];

describe("Prime Academy Experience & Challenge Cards (بطاقات التحدّي)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("never labels Challenge Cards as Luck Cards and draws non-repeating questions without pronunciation when SpeechRecognition is absent", () => {
    const pool = buildEligibleChallengePool({
      studyItems: SAMPLE_STUDY_ITEMS,
      speechRecognitionAvailable: false,
    });
    expect(pool.length).toBeGreaterThan(10);
    expect(pool.some((q) => q.format === "pronunciation")).toBe(false);
    expect(pool.some((q) => q.format === "mcq")).toBe(true);
    expect(pool.some((q) => q.format === "missing_word")).toBe(true);
    expect(pool.some((q) => q.format === "true_false")).toBe(true);
    expect(pool.some((q) => q.format === "short_answer")).toBe(true);

    // Non-repeating draws across unique draws
    const used = new Set<string>();
    for (let i = 0; i < 6; i++) {
      const drawn = drawNextChallenge(pool, used);
      expect(drawn).not.toBeNull();
      expect(used.has(drawn!.id)).toBe(false);
      used.add(drawn!.id);
    }

    // Open note without answer key resolves as honest self_review (never fake auto-score)
    const openNoteItem = pool.find((q) => q.id === "si_note_note1")!;
    const evalOpen = evaluateChallengeResponse(openNoteItem, {
      textAnswer: "It was a historical trade network linking Asia and the Mediterranean.",
    });
    expect(evalOpen.outcome).toBe("self_review");
  });

  it("only includes pronunciation challenges when SpeechRecognition is genuinely supported", () => {
    const poolWithSpeech = buildEligibleChallengePool({
      studyItems: SAMPLE_STUDY_ITEMS,
      speechRecognitionAvailable: true,
    });
    expect(poolWithSpeech.some((q) => q.format === "pronunciation")).toBe(true);
  });

  it("maps retired prime_academy layout ID cleanly to executive_kpi", () => {
    expect(normalizeLayoutMode("prime_academy")).toBe("executive_kpi");
    expect(normalizeLayoutMode("classic")).toBe("classic");
  });
});
