import { useEffect, useMemo, useState } from "react";
import {
  BookmarkPlus,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  FileAudio,
  Focus,
  Headphones,
  Play,
  RotateCcw,
  Square,
  Timer,
  Volume2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModernSelect } from "@/components/ui/modern-select";
import {
  LISTENING_TRACKS,
  READING_PASSAGES,
  type CefrExtendedBand,
} from "@/data/english-academies";
import type { AcademyWorkspaceId } from "@/data/english-curriculum";
import { gradeLessonExercise, type EnglishWorldState } from "@/lib/english-world";
import {
  getAvailableEnglishVoices,
  isSpeechSynthesisAvailable,
  speakEnglishText,
  stopEnglishSpeech,
  type EnglishVoiceOption,
} from "@/lib/english-speech";

export function ListeningAcademyPanel({
  englishState,
  onSaveNotebookWord,
  onSubmitListeningScore,
  onRecordMistake,
}: {
  englishState: EnglishWorldState;
  onSaveNotebookWord: (entry: {
    word: string;
    meaningAr: string;
    definition: string;
    example: string;
    sourceLabel: string;
  }) => void;
  onSubmitListeningScore: (trackId: string, trackTitle: string, scorePct: number) => void;
  onRecordMistake: (input: {
    skill: AcademyWorkspaceId;
    itemTitle: string;
    prompt: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
  }) => void;
}) {
  const [selectedId, setSelectedId] = useState(LISTENING_TRACKS[0]!.id);
  const [rate, setRate] = useState<0.75 | 1 | 1.25>(1);
  const [voices, setVoices] = useState<EnglishVoiceOption[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [mcqChoice, setMcqChoice] = useState<Record<string, number>>({});
  const [textChoice, setTextChoice] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const speechReady = isSpeechSynthesisAvailable();

  useEffect(() => {
    setVoices(getAvailableEnglishVoices());
    return () => stopEnglishSpeech();
  }, []);

  const track = useMemo(
    () => LISTENING_TRACKS.find((t) => t.id === selectedId) ?? LISTENING_TRACKS[0]!,
    [selectedId],
  );

  const selectTrack = (id: string) => {
    stopEnglishSpeech();
    setIsPlaying(false);
    setSelectedId(id);
    setShowTranscript(false);
    setMcqChoice({});
    setTextChoice({});
    setSubmitted(false);
  };

  const handlePlayTrack = () => {
    if (!speechReady) return;
    const script = track.dialogue.map((d) => `${d.speaker} says: ${d.line}`).join(". ");
    setIsPlaying(true);
    const ok = speakEnglishText(script, {
      rate,
      ...(selectedVoiceURI ? { voiceURI: selectedVoiceURI } : {}),
      onEnd: () => setIsPlaying(false),
    });
    if (!ok) setIsPlaying(false);
  };

  const handleStopTrack = () => {
    stopEnglishSpeech();
    setIsPlaying(false);
  };

  const questionResults = track.questions.map((q) => {
    const ok = gradeLessonExercise(q, {
      selectedIndex: mcqChoice[q.id] ?? null,
      textAnswer: textChoice[q.id] ?? "",
    });
    return { q, ok };
  });

  const correctCount = questionResults.filter((r) => r.ok).length;
  const scorePct =
    track.questions.length > 0 ? Math.round((correctCount / track.questions.length) * 100) : 100;

  const handleCheckAnswers = () => {
    setSubmitted(true);
    for (const r of questionResults) {
      if (!r.ok) {
        const expected =
          r.q.options && typeof r.q.correctIndex === "number"
            ? (r.q.options[r.q.correctIndex] ?? "")
            : (r.q.acceptedAnswers?.[0] ?? "");
        const given =
          r.q.options && typeof mcqChoice[r.q.id] === "number"
            ? (r.q.options[mcqChoice[r.q.id]!] ?? "")
            : (textChoice[r.q.id] ?? "(blank)");
        onRecordMistake({
          skill: "listening",
          itemTitle: track.title,
          prompt: r.q.prompt,
          userAnswer: given,
          correctAnswer: expected,
          explanation: r.q.explanation,
        });
      }
    }
    onSubmitListeningScore(track.id, track.title, scorePct);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      {/* Track List */}
      <div className="surface-card space-y-2.5 p-4 lg:col-span-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Headphones className="size-4 text-primary" />
          <span>Graded Audio Tracks ({LISTENING_TRACKS.length})</span>
        </div>
        <div className="space-y-2">
          {LISTENING_TRACKS.map((t) => {
            const active = t.id === track.id;
            const prevScore = englishState.listeningScores[t.id];
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => selectTrack(t.id)}
                className={`flex min-h-[44px] w-full items-start justify-between gap-2 rounded-lg border px-3 py-2.5 text-start transition-colors ${
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface-2 hover:border-primary/40"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-muted-foreground">
                    {t.level} · {t.topic}
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-foreground">{t.title}</div>
                  {typeof prevScore === "number" && (
                    <div className="mt-0.5 text-[11px] text-success font-medium">
                      Best comprehension: {prevScore}%
                    </div>
                  )}
                </div>
                <FileAudio className="mt-1 size-4 shrink-0 text-primary" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Audio Console + Comprehension Check */}
      <div className="surface-card space-y-5 p-5 lg:col-span-8">
        <div className="border-b border-border pb-3">
          <div className="text-xs font-medium text-primary">
            {track.level} · {track.topic} · ~{track.durationSecEst}s · {track.accentHint}
          </div>
          <h4 className="mt-1 font-display text-lg font-bold text-foreground">{track.title}</h4>
          <p className="text-xs text-muted-foreground">{track.context}</p>
        </div>

        {/* Real Audio Controls */}
        <div className="rounded-xl border border-border bg-surface-2 p-4 space-y-3">
          {speechReady ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {!isPlaying ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="glow"
                    onClick={handlePlayTrack}
                    className="min-h-[40px] gap-1.5 whitespace-nowrap shrink-0 text-xs"
                  >
                    <Play className="size-3.5" />
                    <span>Play Audio Passage</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={handleStopTrack}
                    className="min-h-[40px] gap-1.5 whitespace-nowrap shrink-0 text-xs"
                  >
                    <Square className="size-3.5" />
                    <span>Stop Audio</span>
                  </Button>
                )}

                <div className="flex items-center gap-1" role="group" aria-label="Playback speed">
                  {([0.75, 1, 1.25] as const).map((spd) => (
                    <Button
                      key={spd}
                      type="button"
                      size="sm"
                      variant={rate === spd ? "default" : "outline"}
                      onClick={() => setRate(spd)}
                      className="h-9 px-2.5 text-xs"
                    >
                      {spd}x
                    </Button>
                  ))}
                </div>
              </div>

              {voices.length > 0 && (
                <ModernSelect
                  ariaLabel="English voice accent"
                  size="sm"
                  value={selectedVoiceURI}
                  onValueChange={setSelectedVoiceURI}
                  className="max-w-[230px]"
                  options={[
                    { value: "", label: "Default Browser English Voice" },
                    ...voices.map((v) => ({
                      value: v.voiceURI,
                      label: `${v.name} (${v.lang})`,
                    })),
                  ]}
                />
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
              Browser Web Speech synthesis is unavailable in this environment—no simulated audio is
              faked. Reveal the verified dialogue script below to study and answer comprehension
              questions cleanly.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowTranscript((prev) => !prev)}
              className="h-9 gap-1.5 text-xs"
            >
              {showTranscript ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              <span>{showTranscript ? "Hide Transcript" : "Show Transcript"}</span>
            </Button>
            <span className="text-xs text-muted-foreground">
              Tip: Try answering questions once before revealing the script.
            </span>
          </div>

          {showTranscript && (
            <div className="space-y-2 rounded-lg border border-border bg-surface p-3.5 text-sm">
              {track.dialogue.map((line, i) => (
                <div key={i} className="leading-relaxed">
                  <strong className="text-primary">{line.speaker}:</strong>{" "}
                  <span className="text-foreground">{line.line}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Extracted Vocabulary */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Key Vocabulary in Audio (Save to Notebook)
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {track.extractedVocab.map((v) => (
              <div
                key={v.word}
                className="flex items-start justify-between gap-2 rounded-lg border border-border bg-surface-2 p-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground">
                    {v.word}{" "}
                    <span className="font-normal text-muted-foreground">· {v.meaningAr}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{v.definition}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onSaveNotebookWord({
                      ...v,
                      sourceLabel: `Listening · ${track.title}`,
                    })
                  }
                  className="h-8 gap-1 whitespace-nowrap shrink-0 text-[11px]"
                >
                  <BookmarkPlus className="size-3.5" />
                  <span>Save</span>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Comprehension Questions */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h5 className="text-sm font-bold text-foreground">
              Listening Comprehension ({track.questions.length} Checks)
            </h5>
            {submitted && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setMcqChoice({});
                  setTextChoice({});
                  setSubmitted(false);
                }}
                className="h-8 gap-1 text-xs"
              >
                <RotateCcw className="size-3.5" />
                <span>Retry</span>
              </Button>
            )}
          </div>

          {track.questions.map((q, idx) => {
            const ok = submitted
              ? gradeLessonExercise(q, {
                  selectedIndex: mcqChoice[q.id] ?? null,
                  textAnswer: textChoice[q.id] ?? "",
                })
              : null;
            return (
              <div
                key={q.id}
                className="rounded-lg border border-border bg-surface-2 p-3.5 space-y-2"
              >
                <div className="text-[11px] font-medium text-muted-foreground">
                  Question {idx + 1} · Focus: {q.skillTested.replace("_", " ")}
                </div>
                <p className="text-sm font-medium text-foreground">{q.prompt}</p>
                {q.options ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={submitted}
                        onClick={() => setMcqChoice((prev) => ({ ...prev, [q.id]: optIdx }))}
                        className={`min-h-[44px] rounded-lg border px-3 py-2 text-start text-xs font-medium transition-colors ${
                          mcqChoice[q.id] === optIdx
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
                    value={textChoice[q.id] ?? ""}
                    disabled={submitted}
                    onChange={(e) => setTextChoice((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Type answer from the audio..."
                    className="text-sm"
                  />
                )}
                {submitted && (
                  <div
                    className={`rounded-lg border p-2.5 text-xs ${
                      ok
                        ? "border-success/40 bg-success/10 text-foreground"
                        : "border-destructive/40 bg-destructive/10 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold">
                      {ok ? (
                        <>
                          <CheckCircle2 className="size-3.5 text-success" />
                          <span>Correct!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="size-3.5 text-destructive" />
                          <span>
                            Accepted:{" "}
                            {q.options && typeof q.correctIndex === "number"
                              ? q.options[q.correctIndex]
                              : q.acceptedAnswers?.join(" / ")}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-muted-foreground">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}

          {!submitted ? (
            <Button
              type="button"
              variant="glow"
              onClick={handleCheckAnswers}
              className="min-h-[44px]"
            >
              Check Listening Answers
            </Button>
          ) : (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs font-semibold text-foreground">
              Listening Score Saved: {scorePct}% ({correctCount}/{track.questions.length})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* READING ACADEMY                                                            */
/* -------------------------------------------------------------------------- */

export function ReadingAcademyPanel({
  englishState,
  onSaveNotebookWord,
  onSubmitReadingScore,
  onRecordMistake,
}: {
  englishState: EnglishWorldState;
  onSaveNotebookWord: (entry: {
    word: string;
    meaningAr: string;
    definition: string;
    example: string;
    sourceLabel: string;
  }) => void;
  onSubmitReadingScore: (passageId: string, passageTitle: string, scorePct: number) => void;
  onRecordMistake: (input: {
    skill: AcademyWorkspaceId;
    itemTitle: string;
    prompt: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
  }) => void;
}) {
  const [levelFilter, setLevelFilter] = useState<CefrExtendedBand | "ALL">("ALL");
  const filteredPassages = useMemo(
    () =>
      levelFilter === "ALL"
        ? READING_PASSAGES
        : READING_PASSAGES.filter((p) => p.level === levelFilter),
    [levelFilter],
  );
  const [selectedId, setSelectedId] = useState(READING_PASSAGES[0]!.id);
  const [comfortFocus, setComfortFocus] = useState(false);
  const [readingSeconds, setReadingSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!timerActive) return;
    const t = setInterval(() => setReadingSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [timerActive]);

  const passage =
    filteredPassages.find((p) => p.id === selectedId) ??
    filteredPassages[0] ??
    READING_PASSAGES[0]!;

  const selectPassage = (id: string) => {
    setSelectedId(id);
    setAnswers({});
    setSubmitted(false);
    setReadingSeconds(0);
    setTimerActive(false);
  };

  const correctCount = passage.questions.reduce(
    (acc, q) => (answers[q.id] === q.correctIndex ? acc + 1 : acc),
    0,
  );
  const scorePct = Math.round((correctCount / passage.questions.length) * 100);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimerActive(false);
    for (const q of passage.questions) {
      if (answers[q.id] !== q.correctIndex) {
        onRecordMistake({
          skill: "reading",
          itemTitle: passage.title,
          prompt: q.prompt,
          userAnswer:
            typeof answers[q.id] === "number" ? (q.options[answers[q.id]!] ?? "") : "(blank)",
          correctAnswer: q.options[q.correctIndex] ?? "",
          explanation: q.explanation,
        });
      }
    }
    onSubmitReadingScore(passage.id, passage.title, scorePct);
  };

  return (
    <div className="space-y-4">
      {/* Level Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {(["ALL", "Pre-A1", "A2", "B1", "B2"] as const).map((lvl) => (
            <Button
              key={lvl}
              type="button"
              size="sm"
              variant={levelFilter === lvl ? "glow" : "outline"}
              onClick={() => setLevelFilter(lvl)}
              className="h-8 text-xs"
            >
              {lvl === "ALL" ? "All Levels" : lvl}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={timerActive ? "default" : "outline"}
            onClick={() => setTimerActive((v) => !v)}
            className="h-8 gap-1.5 text-xs"
          >
            <Timer className="size-3.5" />
            <span>
              {timerActive ? "Pause Pace" : "Reading Pace"}: {Math.floor(readingSeconds / 60)}:
              {String(readingSeconds % 60).padStart(2, "0")}
            </span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={comfortFocus ? "glow" : "outline"}
            onClick={() => setComfortFocus((v) => !v)}
            className="h-8 gap-1.5 text-xs"
          >
            <Focus className="size-3.5" />
            <span>{comfortFocus ? "Standard Spacing" : "Comfort Reading"}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="surface-card space-y-2 p-4 lg:col-span-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <BookOpen className="size-4 text-primary" />
            <span>Graded Readings ({filteredPassages.length})</span>
          </div>
          {filteredPassages.map((p) => {
            const active = p.id === passage.id;
            const best = englishState.readingScores[p.id];
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => selectPassage(p.id)}
                className={`flex min-h-[44px] w-full flex-col rounded-lg border px-3 py-2.5 text-start transition-colors ${
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface-2 hover:border-primary/40"
                }`}
              >
                <span className="text-[11px] font-medium text-muted-foreground">
                  {p.level} · {p.genre} · ~{p.recommendedMinutes} min
                </span>
                <span className="mt-0.5 text-xs font-semibold text-foreground">{p.title}</span>
                {typeof best === "number" && (
                  <span className="mt-0.5 text-[11px] font-medium text-success">Best: {best}%</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="surface-card space-y-5 p-5 lg:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-3">
            <div>
              <div className="text-xs font-medium text-primary">
                {passage.level} · {passage.genre} · {passage.topic}
              </div>
              <h4 className="mt-1 font-display text-lg font-bold text-foreground">
                {passage.title}
              </h4>
            </div>
            {isSpeechSynthesisAvailable() && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => speakEnglishText(passage.paragraphs.join(" "))}
                className="h-8 gap-1.5 text-xs"
              >
                <Volume2 className="size-3.5" />
                <span>Listen Aloud</span>
              </Button>
            )}
          </div>

          <article
            className={`space-y-4 rounded-xl border border-border bg-surface-2 p-4 text-foreground ${
              comfortFocus ? "text-base leading-loose tracking-wide" : "text-sm leading-relaxed"
            }`}
          >
            {passage.paragraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </article>

          {/* Clickable Extracted Vocab */}
          <div className="grid gap-2 sm:grid-cols-2">
            {passage.extractedVocab.map((v) => (
              <div
                key={v.word}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground">
                    {v.word} ·{" "}
                    <span className="font-normal text-muted-foreground">{v.meaningAr}</span>
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">{v.definition}</div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onSaveNotebookWord({
                      ...v,
                      example: passage.paragraphs[0] ?? v.definition,
                      sourceLabel: `Reading · ${passage.title}`,
                    })
                  }
                  className="h-8 shrink-0 text-[11px]"
                >
                  + Save
                </Button>
              </div>
            ))}
          </div>

          {/* Reading Comprehension Check */}
          <div className="space-y-3 border-t border-border pt-4">
            <h5 className="text-sm font-bold text-foreground">
              Comprehension & Inference Check ({passage.questions.length})
            </h5>
            {passage.questions.map((q, idx) => {
              const chosen = answers[q.id];
              const ok = submitted && chosen === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className="rounded-lg border border-border bg-surface-2 p-3.5 space-y-2"
                >
                  <div className="text-[11px] font-medium text-muted-foreground">
                    Question {idx + 1} · {q.focus.replace(/_/g, " ")}
                  </div>
                  <p className="text-sm font-medium text-foreground">{q.prompt}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        type="button"
                        disabled={submitted}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: oIdx }))}
                        className={`min-h-[44px] rounded-lg border px-3 py-2 text-start text-xs font-medium transition-colors ${
                          chosen === oIdx
                            ? "border-primary bg-primary/15 text-primary font-semibold"
                            : "border-border bg-surface text-foreground hover:border-primary/40"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {submitted && (
                    <div
                      className={`rounded-lg border p-2.5 text-xs ${
                        ok
                          ? "border-success/40 bg-success/10"
                          : "border-destructive/40 bg-destructive/10"
                      }`}
                    >
                      <span className="font-semibold">
                        {ok ? "Correct!" : `Correct Answer: ${q.options[q.correctIndex]}`}
                      </span>
                      <p className="mt-1 text-muted-foreground">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {!submitted ? (
              <Button type="button" variant="glow" onClick={handleSubmit} className="min-h-[44px]">
                Submit Reading Answers
              </Button>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                <span className="text-xs font-semibold text-foreground">
                  Reading Score: {scorePct}% ({correctCount}/{passage.questions.length})
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAnswers({});
                    setSubmitted(false);
                  }}
                  className="h-8 text-xs"
                >
                  Retry Passage
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
