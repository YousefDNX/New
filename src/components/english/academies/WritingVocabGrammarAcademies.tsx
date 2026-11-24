import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookmarkPlus,
  CheckCircle2,
  FileEdit,
  Layers,
  PenTool,
  Plus,
  RotateCcw,
  Sparkles,
  Volume2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  GRADE_9_UNIT_QUIZZES,
  GRADE_9_VOCAB_UNITS,
  type Grade9VocabWord,
} from "@/data/grade9-vocab-units";
import {
  GRAMMAR_TOPICS,
  VOCAB_ACADEMY_TOPICS,
  WRITING_TASKS,
  type VocabAcademyWord,
} from "@/data/english-academies";
import type { AcademyWorkspaceId } from "@/data/english-curriculum";
import {
  evaluateWritingSubmission,
  gradeLessonExercise,
  type EnglishWorldState,
  type WritingSubmissionRecord,
} from "@/lib/english-world";
import { speakEnglishText } from "@/lib/english-speech";
import { speakArabicText } from "@/lib/speech-service";

/* -------------------------------------------------------------------------- */
/* WRITING ACADEMY                                                            */
/* -------------------------------------------------------------------------- */

export function WritingAcademyPanel({
  englishState,
  initialTaskId,
  onSaveWritingSubmission,
}: {
  englishState: EnglishWorldState;
  initialTaskId?: string | null;
  onSaveWritingSubmission: (record: WritingSubmissionRecord) => void;
}) {
  const defaultTask = WRITING_TASKS.find((t) => t.id === initialTaskId) ?? WRITING_TASKS[0]!;
  const [selectedTaskId, setSelectedTaskId] = useState(defaultTask.id);
  const task = useMemo(
    () => WRITING_TASKS.find((t) => t.id === selectedTaskId) ?? WRITING_TASKS[0]!,
    [selectedTaskId],
  );

  const savedSub = englishState.writingSubmissions[task.id];
  const [draft, setDraft] = useState(savedSub?.revisedDraft ?? "");
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    setDraft(englishState.writingSubmissions[task.id]?.revisedDraft ?? "");
    setShowCompare(false);
  }, [task.id, englishState.writingSubmissions]);

  const liveWordCount = draft.trim() ? draft.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleAnalyzeAndSave = () => {
    if (!draft.trim()) return;
    const evalResult = evaluateWritingSubmission(draft, {
      minWords: task.minWords,
      maxWords: task.maxWords,
      requiredKeywords: task.requiredKeywords,
      level: task.level,
    });
    const prev = englishState.writingSubmissions[task.id];
    const record: WritingSubmissionRecord = {
      id: prev?.id ?? `wsub-${task.id}`,
      taskId: task.id,
      taskTitle: task.title,
      initialDraft: prev ? prev.initialDraft : draft,
      revisedDraft: draft,
      initialScorePct: prev ? prev.initialScorePct : evalResult.scorePct,
      latestScorePct: evalResult.scorePct,
      evaluation: evalResult,
      revisionCount: prev ? prev.revisionCount + 1 : 0,
      updatedAt: new Date().toISOString(),
    };
    onSaveWritingSubmission(record);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      {/* Task Selector */}
      <div className="surface-card space-y-2 p-4 lg:col-span-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <PenTool className="size-4 text-primary" />
          <span>Writing Prompts ({WRITING_TASKS.length})</span>
        </div>
        {WRITING_TASKS.map((t) => {
          const active = t.id === task.id;
          const existing = englishState.writingSubmissions[t.id];
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTaskId(t.id)}
              className={`flex min-h-[44px] w-full flex-col rounded-lg border px-3 py-2.5 text-start transition-colors ${
                active
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface-2 hover:border-primary/40"
              }`}
            >
              <span className="text-[11px] font-medium text-muted-foreground">
                {t.level} · {t.typeLabel}
              </span>
              <span className="mt-0.5 text-xs font-semibold text-foreground">{t.title}</span>
              {existing && (
                <span className="mt-0.5 text-[11px] font-medium text-success">
                  Latest score: {existing.latestScorePct}% ({existing.revisionCount} revisions)
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Drafting & Constructive Feedback Coach */}
      <div className="surface-card space-y-4 p-5 lg:col-span-8">
        <div className="border-b border-border pb-3">
          <div className="text-xs font-medium text-primary">
            {task.level} · {task.typeLabel} · Target: {task.minWords}–{task.maxWords} words
          </div>
          <h4 className="mt-1 font-display text-lg font-bold text-foreground">{task.title}</h4>
          <p className="mt-1 text-sm text-foreground">{task.prompt}</p>
        </div>

        {/* Checklist & Starter */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface-2 p-3 text-xs space-y-1">
            <div className="font-semibold text-foreground">Focus Criteria:</div>
            {task.targetFeatures.map((f, i) => (
              <div key={i} className="text-muted-foreground">
                • {f}
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-3 text-xs space-y-1">
            <div className="font-semibold text-foreground">Opening Idea Starter (Optional):</div>
            <p className="italic text-muted-foreground">"{task.exampleOpening}"</p>
          </div>
        </div>

        {/* Editor */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <label htmlFor={`wrt-${task.id}`} className="font-semibold text-foreground">
              Your Draft (never overwritten—revise freely)
            </label>
            <span
              className={`font-medium ${
                liveWordCount >= task.minWords ? "text-success" : "text-muted-foreground"
              }`}
            >
              Word count: {liveWordCount} / {task.minWords}–{task.maxWords}
            </span>
          </div>
          <Textarea
            id={`wrt-${task.id}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={7}
            placeholder="Write your sentences or paragraph carefully here..."
            className="text-sm leading-relaxed"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="glow"
              disabled={!draft.trim()}
              onClick={handleAnalyzeAndSave}
              className="min-h-[44px] gap-1.5"
            >
              <FileEdit className="size-4" />
              <span>
                {savedSub ? "Analyze Revision & Update Feedback" : "Check Writing & Get Feedback"}
              </span>
            </Button>
            {savedSub && savedSub.revisionCount > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCompare((prev) => !prev)}
                className="min-h-[44px] text-xs"
              >
                {showCompare ? "Hide Draft Comparison" : "Compare Initial vs. Revised Draft"}
              </Button>
            )}
          </div>
        </div>

        {/* Constructive Diagnostic Feedback */}
        {savedSub && (
          <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-bold text-foreground">
                Writing Feedback: {savedSub.latestScorePct}% · Estimated Readiness:{" "}
                {savedSub.evaluation.readinessBand}
              </div>
              <span className="text-xs text-muted-foreground">
                {savedSub.evaluation.wordCount} words · {savedSub.evaluation.sentenceCount}{" "}
                sentences
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-success">What You Did Well:</div>
              {savedSub.evaluation.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-foreground">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                  <span>{s}</span>
                </div>
              ))}
            </div>

            {(() => {
              const objectiveCategories = new Set([
                "Capitalization",
                "Punctuation",
                "Run-On Prevention",
              ]);
              const objectiveList =
                savedSub.evaluation.objectiveErrors ??
                savedSub.evaluation.improvements.filter((item) =>
                  objectiveCategories.has(item.category),
                );
              const stylisticList =
                savedSub.evaluation.stylisticSuggestions ??
                savedSub.evaluation.improvements.filter(
                  (item) => !objectiveCategories.has(item.category),
                );

              if (objectiveList.length === 0 && stylisticList.length === 0) {
                return (
                  <p className="text-xs font-semibold text-success">
                    All length, punctuation, cohesion, and prompt checks look balanced!
                  </p>
                );
              }

              return (
                <div className="space-y-3 pt-1">
                  <p className="text-xs font-semibold text-foreground">
                    How to Strengthen Your Next Revision:
                  </p>
                  {objectiveList.length > 0 && (
                    <div
                      className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
                      data-testid="writing-objective-errors"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                        <AlertTriangle className="size-3.5 shrink-0" />
                        <span>
                          Objective Mechanics Checks ({objectiveList.length}) — Capitalization &amp;
                          Punctuation
                        </span>
                      </div>
                      {objectiveList.map((imp, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-border bg-surface p-2.5 text-xs space-y-1"
                        >
                          <div className="font-semibold text-foreground">
                            {imp.category}: {imp.issue}
                          </div>
                          <p className="text-muted-foreground">
                            <strong>Why it matters:</strong> {imp.whyItMatters}
                          </p>
                          <p className="text-primary">
                            <strong>How to fix:</strong> {imp.howToImprove}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {stylisticList.length > 0 && (
                    <div
                      className="space-y-2 rounded-lg border border-primary/25 bg-surface/60 p-3"
                      data-testid="writing-stylistic-suggestions"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <Sparkles className="size-3.5 shrink-0" />
                        <span>
                          Stylistic &amp; Structure Suggestions ({stylisticList.length}) — Flow,
                          Length &amp; Variety
                        </span>
                      </div>
                      {stylisticList.map((imp, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-border bg-surface p-2.5 text-xs space-y-1"
                        >
                          <div className="font-semibold text-foreground">
                            {imp.category}: {imp.issue}
                          </div>
                          <p className="text-muted-foreground">
                            <strong>Why it helps:</strong> {imp.whyItMatters}
                          </p>
                          <p className="text-primary">
                            <strong>How to revise:</strong> {imp.howToImprove}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {showCompare && (
              <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-surface p-3 text-xs space-y-1">
                  <div className="font-semibold text-muted-foreground">
                    First Saved Draft ({savedSub.initialScorePct}%)
                  </div>
                  <p className="whitespace-pre-wrap text-foreground">{savedSub.initialDraft}</p>
                </div>
                <div className="rounded-lg border border-success/40 bg-surface p-3 text-xs space-y-1">
                  <div className="font-semibold text-success">
                    Latest Revision ({savedSub.latestScorePct}%)
                  </div>
                  <p className="whitespace-pre-wrap text-foreground">{savedSub.revisedDraft}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* VOCABULARY ACADEMY (MULTI-PRACTICE MASTERY + UNIT 3 BRIDGE + NOTEBOOK)     */
/* -------------------------------------------------------------------------- */

function toAcademyWords(words: Grade9VocabWord[]): VocabAcademyWord[] {
  return words.map((w) => ({
    id: w.id,
    word: w.word,
    partOfSpeech: w.partOfSpeech,
    phonetic: w.phonetic,
    cefr: "A2",
    meaningAr: w.meaningAr,
    definitionEn: w.definitionEn,
    exampleEn: w.exampleEn,
    collocations: w.collocations,
    wordFamily: [],
    synonyms: w.synonyms,
    antonyms: [],
    quizBlankSentence: w.exampleEn.replace(new RegExp(`\\b${w.word}\\b`, "i"), "___"),
  }));
}

const GRADE_9_DECKS = [
  // Unit 3 remains first so default selectedDeckId stays "vt-g9-unit3"
  ...([3, 1, 2, 4] as const).map((unitNum) => {
    const meta = GRADE_9_VOCAB_UNITS.find((u) => u.unit === unitNum)!;
    return {
      id: meta.deckId,
      unitNumber: meta.unit,
      title: meta.title,
      titleAr: meta.titleAr,
      cefr: "A2" as const,
      description: `${meta.themeEn} · ${meta.themeAr} (British spelling)`,
      words: toAcademyWords(meta.words),
      rawWords: meta.words,
    };
  }),
];

const G9_QUIZ_STORAGE_KEY = "btc_english_g9_vocab_v1";

export function VocabularyAcademyPanel({
  englishState,
  onPracticeWord,
  onAddNotebookWord,
  onPushFlashcardToStudy,
  onOpenUnit3FullArena,
}: {
  englishState: EnglishWorldState;
  onPracticeWord: (input: {
    wordId: string;
    word: string;
    mode: string;
    accurate: boolean;
  }) => void;
  onAddNotebookWord: (entry: {
    word: string;
    meaningAr: string;
    definition: string;
    example: string;
    sourceLabel: string;
  }) => void;
  onPushFlashcardToStudy: (entry: { word: string; back: string }) => void;
  onOpenUnit3FullArena?: () => void;
}) {
  const allDecks = useMemo(() => [...GRADE_9_DECKS, ...VOCAB_ACADEMY_TOPICS], []);

  const [selectedDeckId, setSelectedDeckId] = useState(allDecks[0]!.id);
  const [vocabMode, setVocabMode] = useState<"cards" | "fill" | "match" | "quiz" | "notebook">(
    "cards",
  );
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [deckSearch, setDeckSearch] = useState("");

  // Fill blank state
  const [fillInput, setFillInput] = useState("");
  const [fillChecked, setFillChecked] = useState<boolean | null>(null);

  // Match state
  const [matchLeft, setMatchLeft] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);

  // Unit Quiz state persisted separately from btc_u3_known / btc_u3_mistakes
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(G9_QUIZ_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, number>) : {};
    } catch {
      return {};
    }
  });

  // Custom notebook entry
  const [customWord, setCustomWord] = useState("");
  const [customAr, setCustomAr] = useState("");
  const [customDef, setCustomDef] = useState("");

  const deck = allDecks.find((d) => d.id === selectedDeckId) ?? allDecks[0]!;
  const filteredWords = useMemo(() => {
    const q = deckSearch.trim().toLowerCase();
    if (!q) return deck.words;
    const matches = deck.words.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.meaningAr.includes(deckSearch.trim()) ||
        w.definitionEn.toLowerCase().includes(q),
    );
    return matches.length > 0 ? matches : deck.words;
  }, [deck.words, deckSearch]);

  const currentWord = filteredWords[cardIdx % filteredWords.length] ?? deck.words[0]!;
  const rawCurrentMeta =
    "rawWords" in deck && Array.isArray(deck.rawWords)
      ? (deck.rawWords as Grade9VocabWord[]).find((rw) => rw.id === currentWord.id)
      : undefined;
  const wordProg = englishState.vocabProgress[currentWord.id];

  const deckPracticedCount = useMemo(
    () =>
      deck.words.filter((w) => {
        const st = englishState.vocabProgress[w.id]?.status;
        return st === "practicing" || st === "mastered";
      }).length,
    [deck.words, englishState.vocabProgress],
  );
  const deckMasteredPct =
    deck.words.length > 0 ? Math.round((deckPracticedCount / deck.words.length) * 100) : 0;

  const activeUnitNumber: 1 | 2 | 3 | 4 =
    selectedDeckId === "vt-g9-unit1"
      ? 1
      : selectedDeckId === "vt-g9-unit2"
        ? 2
        : selectedDeckId === "vt-g9-unit4"
          ? 4
          : 3;
  const unitQuizQuestions = GRADE_9_UNIT_QUIZZES[activeUnitNumber];

  const matchSubset = useMemo(() => deck.words.slice(0, 4), [deck]);
  const shuffledRight = useMemo(() => [...matchSubset].reverse(), [matchSubset]);

  const selectDeck = (id: string) => {
    setSelectedDeckId(id);
    setCardIdx(0);
    setFlipped(false);
    setDeckSearch("");
    setFillInput("");
    setFillChecked(null);
    setMatchLeft(null);
    setMatchedIds([]);
  };

  const handleCheckFill = () => {
    const normalized = fillInput.trim().toLowerCase();
    const expected = currentWord.word.toLowerCase();
    const ok =
      normalized === expected || (expected.startsWith(normalized + " ") && normalized.length > 3);
    const isExact = normalized === expected;
    setFillChecked(isExact);
    onPracticeWord({
      wordId: currentWord.id,
      word: currentWord.word,
      mode: "fill_blank",
      accurate: isExact || ok,
    });
  };

  const handleAddCustomWord = () => {
    if (!customWord.trim()) return;
    onAddNotebookWord({
      word: customWord.trim(),
      meaningAr: customAr.trim() || "مفردة محفوظة",
      definition: customDef.trim() || "Personal vocabulary study item.",
      example: `Use '${customWord.trim()}' in one personal sentence today.`,
      sourceLabel: "My Custom Notebook",
    });
    setCustomWord("");
    setCustomAr("");
    setCustomDef("");
  };

  return (
    <div className="space-y-4">
      {/* Top Deck & Mastery Legend */}
      <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="font-display text-base font-bold text-foreground">
            Vocabulary Academy · Grade 9 Units 1, 2, 3 &amp; 4
          </h4>
          <p className="text-xs text-muted-foreground">
            Master British-spelling Grade 9 vocabulary (Units 1–4) with Arabic meanings, examples,
            pronunciation audio, flashcards, fill-in-the-blank drills, and unit quizzes.
          </p>
        </div>
        {onOpenUnit3FullArena && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onOpenUnit3FullArena}
            className="h-9 gap-1.5 whitespace-nowrap shrink-0 text-xs"
          >
            <Sparkles className="size-3.5 text-primary" />
            <span>Open Full Grade 9 Unit 3 (12 Practice Modes)</span>
            <ArrowRight className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Grade 9 Units 1–4 Quick Selector + Additional CEFR Topics */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2" data-testid="g9-unit-tabs">
          {([1, 2, 3, 4] as const).map((unitNum) => {
            const unitDeck = allDecks.find((d) => d.id === `vt-g9-unit${unitNum}`)!;
            const active = selectedDeckId === unitDeck.id;
            const practiced = unitDeck.words.filter((w) => {
              const st = englishState.vocabProgress[w.id]?.status;
              return st === "practicing" || st === "mastered";
            }).length;
            return (
              <Button
                key={unitDeck.id}
                type="button"
                size="sm"
                data-testid={`vocab-unit-${unitNum}-tab`}
                variant={active ? "glow" : "outline"}
                onClick={() => selectDeck(unitDeck.id)}
                className="h-9 text-xs"
              >
                Unit {unitNum} ({unitDeck.words.length}) · {practiced}/{unitDeck.words.length}
              </Button>
            );
          })}
          {VOCAB_ACADEMY_TOPICS.map((d) => (
            <Button
              key={d.id}
              type="button"
              size="sm"
              variant={selectedDeckId === d.id ? "glow" : "outline"}
              onClick={() => selectDeck(d.id)}
              className="h-9 text-xs"
            >
              {d.cefr} · {d.title.split(":")[0]} ({d.words.length})
            </Button>
          ))}
        </div>

        {/* Selected Unit Progress & Search Bar */}
        <div className="surface-card flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="text-xs font-bold text-foreground">{deck.title}</div>
            <div className="text-[11px] text-muted-foreground">
              {deckPracticedCount}/{deck.words.length} words practiced ({deckMasteredPct}%)
            </div>
          </div>
          <Input
            value={deckSearch}
            onChange={(e) => {
              setDeckSearch(e.target.value);
              setCardIdx(0);
            }}
            placeholder="Search word or Arabic meaning..."
            aria-label="Search unit vocabulary"
            className="h-8 max-w-xs text-xs"
          />
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "cards", label: "Flashcards & Word Families" },
            { id: "fill", label: "Fill-in-the-Blank Practice" },
            { id: "match", label: "Match Meaning Pairs" },
            { id: "quiz", label: `Unit ${activeUnitNumber} Quiz (${unitQuizQuestions.length})` },
            {
              id: "notebook",
              label: `Personal Notebook (${englishState.personalNotebook.length})`,
            },
          ] as const
        ).map((m) => (
          <Button
            key={m.id}
            type="button"
            size="sm"
            variant={vocabMode === m.id ? "default" : "outline"}
            onClick={() => setVocabMode(m.id)}
            className="h-9 text-xs"
          >
            {m.label}
          </Button>
        ))}
      </div>

      {/* Mode 1: Flashcards + Detailed Word Breakdown */}
      {vocabMode === "cards" && (
        <div className="surface-card space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Word {(cardIdx % filteredWords.length) + 1} of {filteredWords.length} ·{" "}
              {currentWord.partOfSpeech} · {currentWord.cefr}
            </span>
            <span className="font-semibold text-foreground">
              Mastery Status:{" "}
              {wordProg?.status === "mastered" ? (
                <span className="text-success">Mastered ({wordProg.correctCount} checks)</span>
              ) : wordProg?.status === "needs_revision" ? (
                <span className="text-destructive">Needs Revision</span>
              ) : wordProg?.status === "practicing" ? (
                <span className="text-primary">
                  Practicing ({wordProg.correctCount}/2 checks for mastery)
                </span>
              ) : (
                <span className="text-muted-foreground">New Word</span>
              )}
            </span>
          </div>

          <div className="rounded-xl border border-border bg-surface-2 p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-display text-2xl font-bold text-foreground">
                  {currentWord.word}
                </div>
                <div className="text-xs text-muted-foreground">{currentWord.phonetic}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => speakEnglishText(currentWord.word)}
                  className="h-9 gap-1.5 text-xs"
                >
                  <Volume2 className="size-3.5" />
                  <span>Pronounce</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onPushFlashcardToStudy({
                      word: currentWord.word,
                      back: `${currentWord.meaningAr} — ${currentWord.definitionEn}\nExample: ${currentWord.exampleEn}`,
                    })
                  }
                  className="h-9 gap-1.5 text-xs"
                >
                  <Layers className="size-3.5" />
                  <span>Sync to SM-2 Deck</span>
                </Button>
              </div>
            </div>

            {flipped ? (
              <div className="space-y-2 border-t border-border pt-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-primary font-arabic" dir="rtl">
                    {currentWord.meaningAr}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => speakArabicText(currentWord.meaningAr)}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Volume2 className="size-3.5 text-primary" />
                    <span className="font-arabic">استمع بالعربية</span>
                  </Button>
                </div>
                <p className="text-foreground">{currentWord.definitionEn}</p>
                <p className="italic text-muted-foreground">"{currentWord.exampleEn}"</p>
                {rawCurrentMeta?.exampleAr && (
                  <p className="text-xs text-muted-foreground font-arabic" dir="rtl">
                    {rawCurrentMeta.exampleAr}
                  </p>
                )}
                <div className="grid gap-2 pt-1 text-xs text-muted-foreground sm:grid-cols-2">
                  {currentWord.collocations.length > 0 && (
                    <div>
                      <strong className="text-foreground">Collocations:</strong>{" "}
                      {currentWord.collocations.join(", ")}
                    </div>
                  )}
                  {currentWord.synonyms.length > 0 && (
                    <div>
                      <strong className="text-foreground">Synonyms:</strong>{" "}
                      {currentWord.synonyms.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Try recalling the meaning and one example sentence before revealing the answer.
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setFlipped((f) => !f)}
                className="h-9 text-xs"
              >
                {flipped ? "Hide Meaning" : "Reveal Meaning & Collocations"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="glow"
                onClick={() => {
                  onPracticeWord({
                    wordId: currentWord.id,
                    word: currentWord.word,
                    mode: "flashcard",
                    accurate: true,
                  });
                  setFlipped(false);
                  setCardIdx((i) => (i + 1) % filteredWords.length);
                }}
                className="h-9 gap-1 text-xs"
              >
                <CheckCircle2 className="size-3.5" />
                <span>I Knew This · Next Word</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  onPracticeWord({
                    wordId: currentWord.id,
                    word: currentWord.word,
                    mode: "flashcard",
                    accurate: false,
                  });
                  setFlipped(true);
                }}
                className="h-9 gap-1 text-xs"
              >
                <RotateCcw className="size-3.5" />
                <span>Mark Needs Revision</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Fill in the Blank */}
      {vocabMode === "fill" && (
        <div className="surface-card space-y-4 p-5">
          <div className="text-xs font-semibold text-muted-foreground">
            Fill-in-the-Blank Practice · Word {(cardIdx % filteredWords.length) + 1}/
            {filteredWords.length}
          </div>
          <p className="text-sm font-medium text-foreground">{currentWord.quizBlankSentence}</p>
          <p className="text-xs text-muted-foreground" dir="rtl">
            تلميح المعنى: {currentWord.meaningAr}
          </p>
          <div className="flex flex-wrap gap-2">
            <Input
              value={fillInput}
              onChange={(e) => setFillInput(e.target.value)}
              placeholder="Type exact English word..."
              aria-label="Vocabulary fill-in-the-blank answer"
              className="max-w-xs text-sm"
            />
            <Button type="button" variant="glow" onClick={handleCheckFill} className="min-h-[40px]">
              Check Word
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFillInput("");
                setFillChecked(null);
                setCardIdx((i) => (i + 1) % filteredWords.length);
              }}
              className="min-h-[40px]"
            >
              Next Item
            </Button>
          </div>
          {fillChecked !== null && (
            <div
              className={`rounded-lg border p-3 text-xs ${
                fillChecked
                  ? "border-success/40 bg-success/10 text-foreground"
                  : "border-destructive/40 bg-destructive/10 text-foreground"
              }`}
            >
              {fillChecked
                ? `Accurate! '${currentWord.word}' progress updated.`
                : `Expected: '${currentWord.word}' — ${currentWord.definitionEn}`}
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Match Pairs */}
      {vocabMode === "match" && (
        <div className="surface-card space-y-3 p-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">
              Match English Terms with Arabic Meanings ({matchedIds.length}/{matchSubset.length})
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setMatchLeft(null);
                setMatchedIds([]);
              }}
              className="h-8 text-xs"
            >
              Reset Pairs
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              {matchSubset.map((w) => {
                const done = matchedIds.includes(w.id);
                const selected = matchLeft === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    disabled={done}
                    onClick={() => setMatchLeft(w.id)}
                    className={`min-h-[44px] w-full rounded-lg border px-3 py-2 text-start text-xs font-semibold transition-colors ${
                      done
                        ? "border-success/40 bg-success/10 text-success"
                        : selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-surface-2 text-foreground hover:border-primary/40"
                    }`}
                  >
                    {w.word}
                  </button>
                );
              })}
            </div>
            <div className="space-y-2">
              {shuffledRight.map((w) => {
                const done = matchedIds.includes(w.id);
                return (
                  <button
                    key={w.id}
                    type="button"
                    disabled={done || !matchLeft}
                    onClick={() => {
                      if (!matchLeft) return;
                      const ok = matchLeft === w.id;
                      onPracticeWord({
                        wordId: matchLeft,
                        word: deck.words.find((x) => x.id === matchLeft)?.word ?? "",
                        mode: "match",
                        accurate: ok,
                      });
                      if (ok) setMatchedIds((prev) => [...prev, w.id]);
                      setMatchLeft(null);
                    }}
                    dir="rtl"
                    className={`min-h-[44px] w-full rounded-lg border px-3 py-2 text-start text-xs font-medium transition-colors ${
                      done
                        ? "border-success/40 bg-success/10 text-success"
                        : "border-border bg-surface-2 text-foreground hover:border-primary/40 disabled:opacity-60"
                    }`}
                  >
                    {w.meaningAr}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mode 4: Grade 9 Unit Quiz */}
      {vocabMode === "quiz" && (
        <div className="surface-card space-y-4 p-5" data-testid="g9-unit-quiz">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-foreground">
              Grade 9 Unit {activeUnitNumber} Quick Assessment ({unitQuizQuestions.length}{" "}
              Questions)
            </span>
            <span className="font-mono text-primary">
              Score: {unitQuizQuestions.filter((q) => quizAnswers[q.id] === q.correctIndex).length}/
              {unitQuizQuestions.length}
            </span>
          </div>
          <div className="space-y-4">
            {unitQuizQuestions.map((q, idx) => {
              const chosen = quizAnswers[q.id];
              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-border bg-surface-2 p-4 space-y-2 text-xs"
                >
                  <p className="font-semibold text-foreground">
                    {idx + 1}. {q.promptEn}
                  </p>
                  <p className="text-muted-foreground font-arabic" dir="rtl">
                    {q.promptAr}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, optIdx) => {
                      const picked = chosen === optIdx;
                      const isCorrect = optIdx === q.correctIndex;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            const next = { ...quizAnswers, [q.id]: optIdx };
                            setQuizAnswers(next);
                            if (typeof window !== "undefined") {
                              try {
                                localStorage.setItem(G9_QUIZ_STORAGE_KEY, JSON.stringify(next));
                              } catch {
                                // ignore storage quota errors
                              }
                            }
                          }}
                          className={`rounded-lg border px-3 py-2 text-start font-medium transition-colors cursor-pointer ${
                            picked
                              ? isCorrect
                                ? "border-success bg-success/15 text-success"
                                : "border-destructive bg-destructive/15 text-destructive"
                              : "border-border bg-surface text-foreground hover:border-primary/40"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {chosen !== undefined && (
                    <p className="text-[11px] text-muted-foreground">{q.explanationEn}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 5: Personal Vocabulary Notebook */}
      {vocabMode === "notebook" && (
        <div className="surface-card space-y-4 p-5">
          <div className="grid gap-2 sm:grid-cols-3">
            <Input
              value={customWord}
              onChange={(e) => setCustomWord(e.target.value)}
              placeholder="New English word..."
              aria-label="New vocabulary word"
              className="text-xs"
            />
            <Input
              value={customAr}
              onChange={(e) => setCustomAr(e.target.value)}
              placeholder="Arabic meaning..."
              aria-label="Arabic meaning"
              className="text-xs"
            />
            <div className="flex gap-2">
              <Input
                value={customDef}
                onChange={(e) => setCustomDef(e.target.value)}
                placeholder="Short note / example..."
                aria-label="Short definition or example"
                className="text-xs"
              />
              <Button
                type="button"
                size="sm"
                variant="glow"
                onClick={handleAddCustomWord}
                className="h-9 gap-1 shrink-0 text-xs"
              >
                <Plus className="size-3.5" />
                <span>Add</span>
              </Button>
            </div>
          </div>

          {englishState.personalNotebook.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Your Personal Vocabulary Notebook is ready. Save words from Listening Audio, Reading
              Passages, or add custom terms above!
            </p>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {englishState.personalNotebook.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border border-border bg-surface-2 p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-sm text-foreground">{entry.word}</strong>
                    <span className="text-[11px] text-primary">{entry.sourceLabel}</span>
                  </div>
                  <p className="text-muted-foreground" dir="rtl">
                    {entry.meaningAr}
                  </p>
                  <p className="text-foreground">{entry.definition}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* GRAMMAR ACADEMY (14 TOPICS + INTERACTIVE DRILLS)                           */
/* -------------------------------------------------------------------------- */

export function GrammarAcademyPanel({
  englishState,
  onSubmitGrammarScore,
  onRecordMistake,
}: {
  englishState: EnglishWorldState;
  onSubmitGrammarScore: (topicId: string, topicTitle: string, scorePct: number) => void;
  onRecordMistake: (input: {
    skill: AcademyWorkspaceId;
    itemTitle: string;
    prompt: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
  }) => void;
}) {
  const [selectedId, setSelectedId] = useState(GRAMMAR_TOPICS[0]!.id);
  const [choiceMap, setChoiceMap] = useState<Record<string, number>>({});
  const [textMap, setTextMap] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const topic = useMemo(
    () => GRAMMAR_TOPICS.find((g) => g.id === selectedId) ?? GRAMMAR_TOPICS[0]!,
    [selectedId],
  );

  const selectTopic = (id: string) => {
    setSelectedId(id);
    setChoiceMap({});
    setTextMap({});
    setChecked(false);
  };

  const results = topic.exercises.map((ex) => ({
    ex,
    ok: gradeLessonExercise(ex, {
      selectedIndex: choiceMap[ex.id] ?? null,
      textAnswer: textMap[ex.id] ?? "",
    }),
  }));
  const correctCount = results.filter((r) => r.ok).length;
  const scorePct =
    topic.exercises.length > 0 ? Math.round((correctCount / topic.exercises.length) * 100) : 100;

  const handleCheck = () => {
    setChecked(true);
    for (const r of results) {
      if (!r.ok) {
        onRecordMistake({
          skill: "grammar",
          itemTitle: topic.title,
          prompt: r.ex.prompt,
          userAnswer:
            r.ex.options && typeof choiceMap[r.ex.id] === "number"
              ? (r.ex.options[choiceMap[r.ex.id]!] ?? "")
              : (textMap[r.ex.id] ?? "(blank)"),
          correctAnswer:
            r.ex.options && typeof r.ex.correctIndex === "number"
              ? (r.ex.options[r.ex.correctIndex] ?? "")
              : (r.ex.acceptedAnswers?.[0] ?? ""),
          explanation: r.ex.explanation,
        });
      }
    }
    onSubmitGrammarScore(topic.id, topic.title, scorePct);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <div className="surface-card max-h-[540px] space-y-1.5 overflow-y-auto p-4 lg:col-span-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Grammar Syllabus ({GRAMMAR_TOPICS.length} Topics)
        </div>
        {GRAMMAR_TOPICS.map((g) => {
          const active = g.id === topic.id;
          const prev = englishState.grammarScores[g.id];
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => selectTopic(g.id)}
              className={`flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-start text-xs transition-colors ${
                active
                  ? "border-primary bg-primary/10 font-semibold text-primary"
                  : "border-border bg-surface-2 text-foreground hover:border-primary/40"
              }`}
            >
              <span className="truncate">
                {g.cefr} · {g.title}
              </span>
              {typeof prev === "number" && (
                <span className="shrink-0 text-[11px] font-semibold text-success">{prev}%</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="surface-card space-y-4 p-5 lg:col-span-8">
        <div className="border-b border-border pb-3">
          <div className="text-xs font-medium text-primary">{topic.cefr} · Systematic Grammar</div>
          <h4 className="mt-1 font-display text-lg font-bold text-foreground">{topic.title}</h4>
          <p className="text-xs text-muted-foreground">{topic.titleAr}</p>
          <p className="mt-2 text-sm text-foreground">{topic.summary}</p>
        </div>

        <ul className="space-y-2 text-sm text-foreground">
          {topic.rules.map((r, i) => (
            <li key={i} className="rounded-lg border border-border bg-surface-2 px-3.5 py-2.5">
              {r}
            </li>
          ))}
        </ul>

        <div className="flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/5 p-3 text-xs text-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <strong>Common Pitfall:</strong> {topic.commonPitfall}
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          <h5 className="text-sm font-bold text-foreground">
            Interactive Grammar Practice ({topic.exercises.length})
          </h5>
          {topic.exercises.map((ex, idx) => {
            const ok = checked ? results[idx]?.ok : null;
            return (
              <div
                key={ex.id}
                className="rounded-lg border border-border bg-surface-2 p-3.5 space-y-2"
              >
                <p className="text-sm font-medium text-foreground">{ex.prompt}</p>
                {ex.options ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {ex.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        type="button"
                        disabled={checked}
                        onClick={() => setChoiceMap((prev) => ({ ...prev, [ex.id]: oIdx }))}
                        className={`min-h-[44px] rounded-lg border px-3 py-2 text-start text-xs font-medium transition-colors ${
                          choiceMap[ex.id] === oIdx
                            ? "border-primary bg-primary/15 text-primary font-semibold"
                            : "border-border bg-surface text-foreground hover:border-primary/40"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <Input
                    value={textMap[ex.id] ?? ""}
                    disabled={checked}
                    onChange={(e) => setTextMap((prev) => ({ ...prev, [ex.id]: e.target.value }))}
                    placeholder="Type corrected word/phrase..."
                    className="text-sm"
                  />
                )}
                {checked && (
                  <div
                    className={`rounded-lg border p-2.5 text-xs ${
                      ok
                        ? "border-success/40 bg-success/10"
                        : "border-destructive/40 bg-destructive/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      {ok ? (
                        <>
                          <CheckCircle2 className="size-3.5 text-success" />
                          <span>Accurate!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="size-3.5 text-destructive" />
                          <span>
                            Answer:{" "}
                            {ex.options && typeof ex.correctIndex === "number"
                              ? ex.options[ex.correctIndex]
                              : ex.acceptedAnswers?.join(" / ")}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-muted-foreground">{ex.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex flex-wrap items-center gap-2">
            {!checked ? (
              <Button type="button" variant="glow" onClick={handleCheck} className="min-h-[44px]">
                Check Grammar Answers
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setChoiceMap({});
                  setTextMap({});
                  setChecked(false);
                }}
                className="min-h-[44px] gap-1.5"
              >
                <RotateCcw className="size-4" />
                <span>Practice Again ({scorePct}%)</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
