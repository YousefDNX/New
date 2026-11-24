import type { StudyItemRow } from "./firestore-data";
import { BRAND } from "../config/brand.ts";

export interface ParsedFlashcardDraft {
  title: string;
  answer: string;
  subject: string;
}

/**
 * Parses bulk lines formatted as `question | answer`, `question :: answer`, or `question\tanswer`.
 */
export function parseBulkFlashcards(
  raw: string,
  defaultSubject = "General",
): ParsedFlashcardDraft[] {
  const subj = defaultSubject.trim().slice(0, 60) || "General";
  const out: ParsedFlashcardDraft[] = [];
  const lines = raw.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let front = "";
    let back = "";
    if (trimmed.includes("\t")) {
      const idx = trimmed.indexOf("\t");
      front = trimmed.slice(0, idx).trim();
      back = trimmed.slice(idx + 1).trim();
    } else if (trimmed.includes("::")) {
      const idx = trimmed.indexOf("::");
      front = trimmed.slice(0, idx).trim();
      back = trimmed.slice(idx + 2).trim();
    } else if (trimmed.includes("|")) {
      const idx = trimmed.indexOf("|");
      front = trimmed.slice(0, idx).trim();
      back = trimmed.slice(idx + 1).trim();
    }

    if (front && back) {
      out.push({
        title: front.slice(0, 160),
        answer: back.slice(0, 2000),
        subject: subj,
      });
      if (out.length >= 30) break;
    }
  }
  return out;
}

export function formatStudyDeckMarkdown(items: StudyItemRow[], subjectFilter = "All"): string {
  const notes = items.filter((i) => i.kind === "note");
  const cards = items.filter((i) => i.kind === "flashcard");
  const mistakes = items.filter((i) => i.kind === "mistake");

  const lines: string[] = [
    `# ${BRAND.shortName} Study Sheet (${subjectFilter})`,
    "",
    `Exported: ${new Date().toISOString().slice(0, 10)} | Notes: ${notes.length} | Flashcards: ${cards.length} | Mistakes: ${mistakes.length}`,
    "",
  ];

  if (notes.length > 0) {
    lines.push("## Notes & Summaries", "");
    for (const n of notes) {
      lines.push(`### ${n.title} (${n.subject}${n.deck ? ` · ${n.deck}` : ""})`);
      lines.push(n.content || "_No body_");
      lines.push("");
    }
  }

  if (cards.length > 0) {
    lines.push("## Flashcards", "");
    for (const c of cards) {
      lines.push(`- **Q (${c.subject}):** ${c.title}`);
      lines.push(`  - **A:** ${c.answer || c.content}`);
    }
    lines.push("");
  }

  if (mistakes.length > 0) {
    lines.push("## Mistake Log", "");
    for (const m of mistakes) {
      lines.push(`- **${m.title}** (${m.subject} · ${m.mistake_status})`);
      if (m.mistake_reason) lines.push(`  - Lesson: ${m.mistake_reason}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export interface QuizChoiceOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

/**
 * Generates deterministic 4-choice MCQ options for a flashcard using other cards in the pool.
 */
export function buildQuizOptions(
  target: Pick<StudyItemRow, "id" | "answer" | "content">,
  pool: Pick<StudyItemRow, "id" | "answer" | "content">[],
): QuizChoiceOption[] {
  const correctText = (target.answer || target.content || "").trim();
  if (!correctText) return [];

  const distractors: string[] = [];
  const seen = new Set<string>([correctText.toLowerCase()]);

  for (const candidate of pool) {
    if (candidate.id === target.id) continue;
    const text = (candidate.answer || candidate.content || "").trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      distractors.push(text);
      if (distractors.length >= 3) break;
    }
  }

  if (distractors.length < 3) return [];

  const combined: QuizChoiceOption[] = [
    { id: `${target.id}_correct`, label: correctText, isCorrect: true },
    ...distractors.map((d, idx) => ({
      id: `${target.id}_dist_${idx}`,
      label: d,
      isCorrect: false,
    })),
  ];

  // Deterministic rotation based on target.id char sum so UI renders stable order per question
  const hash = target.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const shift = hash % combined.length;
  return [...combined.slice(shift), ...combined.slice(0, shift)];
}
