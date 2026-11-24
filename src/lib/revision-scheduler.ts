import type { QuizAttemptRow, StudyItemRow } from "./firestore-data";
import { analyzeWeakSubjects } from "./recommendations.ts";

export interface RevisionSessionBlock {
  id: string;
  dayIndex: number;
  dateIso: string;
  title: string;
  focusArea: "concepts" | "mistakes" | "practice_quiz" | "light_review";
  durationMinutes: number;
  rationale: string;
}

export interface ExamRevisionPlan {
  examName: string;
  subject: string;
  examDateIso: string;
  daysAvailable: number;
  weaknessDetected: boolean;
  weaknessSummary: string;
  sessions: RevisionSessionBlock[];
}

export function buildExamRevisionSchedule(params: {
  examName: string;
  subject: string;
  examDateIso: string;
  dailyMinutes: number;
  studyItems: StudyItemRow[];
  quizAttempts: QuizAttemptRow[];
  now?: Date;
}): ExamRevisionPlan {
  const now = params.now ?? new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const startMs = Date.parse(`${todayIso}T00:00:00Z`);
  const endMs = Date.parse(`${params.examDateIso.slice(0, 10)}T00:00:00Z`);
  const rawDays = Number.isNaN(endMs) ? 5 : Math.round((endMs - startMs) / 86400_000);
  const daysAvailable = Math.max(1, Math.min(21, rawDays));

  const subjectItems = params.studyItems.filter(
    (s) => s.subject.toLowerCase() === params.subject.toLowerCase(),
  );
  const openMistakes = subjectItems.filter(
    (s) => s.kind === "mistake" && s.mistake_status !== "mastered",
  );
  const dueCards = subjectItems.filter((s) => s.kind === "flashcard");
  const notes = subjectItems.filter((s) => s.kind === "note");

  const weakSpots = analyzeWeakSubjects({
    studyItems: params.studyItems,
    quizAttempts: params.quizAttempts,
  });
  const subjWeak = weakSpots.find((w) => w.subject.toLowerCase() === params.subject.toLowerCase());

  const weaknessDetected = Boolean(
    subjWeak &&
    (subjWeak.openMistakes > 0 || (subjWeak.avgQuizPct !== null && subjWeak.avgQuizPct < 75)),
  );

  const weaknessSummary = weaknessDetected
    ? `Detected ${openMistakes.length} open mistake(s)${subjWeak?.avgQuizPct !== null && subjWeak?.avgQuizPct !== undefined ? ` & ${subjWeak.avgQuizPct}% quiz avg` : ""} — scheduling targeted weak-area drills first.`
    : notes.length + dueCards.length > 0
      ? `Found ${notes.length} note(s) and ${dueCards.length} flashcard(s) in ${params.subject} to weave into spaced review.`
      : `Building a balanced spaced-repetition countdown for ${params.subject}.`;

  const sessions: RevisionSessionBlock[] = [];
  const duration = Math.max(15, Math.min(90, Math.round(params.dailyMinutes)));

  // Distribute revision rhythm across available days
  for (let d = 0; d < daysAvailable; d++) {
    const sessionDate = new Date(startMs + d * 86400_000).toISOString().slice(0, 10);
    const isLastDayBeforeExam = daysAvailable >= 2 && d === daysAvailable - 1;

    let focusArea: RevisionSessionBlock["focusArea"] = "concepts";
    let title = `${params.examName}: Core Concepts (${params.subject})`;
    let rationale = "Active recall over key summaries and formulas.";

    if (isLastDayBeforeExam) {
      focusArea = "light_review";
      title = `${params.examName}: Light Calm Review & Rest (${params.subject})`;
      rationale =
        "Avoid late-night cramming: skim key takeaways and prioritize sleep before exam day.";
    } else if (d === 0 && openMistakes.length > 0) {
      focusArea = "mistakes";
      title = `${params.examName}: Repair ${openMistakes.length} Open Mistake(s) (${params.subject})`;
      rationale = "Fixing recorded errors early creates the biggest score jump.";
    } else if (d % 3 === 1 && dueCards.length > 0) {
      focusArea = "concepts";
      title = `${params.examName}: Spaced Flashcard Recall (${params.subject})`;
      rationale = "Spaced repetition strengthens long-term memory retrieval.";
    } else if (d % 3 === 2 || (daysAvailable === 2 && d === 0)) {
      focusArea = "practice_quiz";
      title = `${params.examName}: Timed Practice Quiz Check (${params.subject})`;
      rationale = "Test understanding under exam-like recall conditions without notes.";
    } else if (notes[d % Math.max(1, notes.length)]) {
      const n = notes[d % notes.length]!;
      title = `${params.examName}: Review "${n.title}" (${params.subject})`;
      rationale = "Summarize core ideas in your own words without looking at the note.";
    }

    sessions.push({
      id: `rev_${d}_${sessionDate}`,
      dayIndex: d + 1,
      dateIso: sessionDate,
      title,
      focusArea,
      durationMinutes: isLastDayBeforeExam ? Math.min(20, duration) : duration,
      rationale,
    });
  }

  return {
    examName: params.examName.trim(),
    subject: params.subject,
    examDateIso: params.examDateIso.slice(0, 10),
    daysAvailable,
    weaknessDetected,
    weaknessSummary,
    sessions,
  };
}
