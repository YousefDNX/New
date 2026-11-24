import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquareQuote,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TEACH_ME_STYLES } from "@/data/curriculum-and-challenges";
import {
  answerLessonQuestionLocally,
  buildStyledExplanationLocally,
} from "@/lib/learning-intelligence";

const QUICK_LESSON_PROMPTS = [
  "What does this paragraph mean?",
  "Explain this definition",
  "Give me an example",
  "Why is this step needed?",
  "What should I memorize from this?",
  "Compare two concepts in this lesson",
  "Quiz me briefly on this lesson",
];

export function AskYourLessonPanel({
  lessonTitle,
  subject,
  lessonText,
}: {
  lessonTitle: string;
  subject: string;
  lessonText: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [question, setQuestion] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string>("simple_everyday");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    mode: "lesson" | "style";
    answer: string;
    quotedPassages: string[];
    coveredInLesson: boolean;
    viaOnlineAi: boolean;
  } | null>(null);

  const askQuestion = async (promptText: string) => {
    const q = promptText.trim();
    if (!q || loading) return;
    setQuestion(q);
    setLoading(true);

    // Try live grounded AI when online and configured; gracefully fall back to verbatim local matcher
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          modelTier: "fast",
          lessonContext: {
            title: lessonTitle,
            subject,
            excerpt: lessonText,
          },
          enableActionProposals: false,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { ok?: boolean; text?: string };
        if (data.ok && data.text) {
          const localMatch = answerLessonQuestionLocally({
            lessonTitle,
            lessonText,
            question: q,
          });
          setResponse({
            mode: "lesson",
            answer: data.text,
            quotedPassages: localMatch.quotedPassages,
            coveredInLesson: localMatch.coveredInLesson,
            viaOnlineAi: true,
          });
          setLoading(false);
          return;
        }
      }
    } catch {
      /* offline or API unconfigured -> use local source-grounded analyzer */
    }

    const local = answerLessonQuestionLocally({
      lessonTitle,
      lessonText,
      question: q,
    });
    setResponse({
      mode: "lesson",
      answer: local.answer,
      quotedPassages: local.quotedPassages,
      coveredInLesson: local.coveredInLesson,
      viaOnlineAi: false,
    });
    setLoading(false);
  };

  const explainWithStyle = async (styleId: string) => {
    setSelectedStyle(styleId);
    const styleObj = TEACH_ME_STYLES.find((s) => s.id === styleId);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Explain "${lessonTitle}" cleanly using this teaching style.`,
          modelTier: "fast",
          teachingStyle: styleObj?.instruction,
          lessonContext: {
            title: lessonTitle,
            subject,
            excerpt: lessonText,
          },
          enableActionProposals: false,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { ok?: boolean; text?: string };
        if (data.ok && data.text) {
          setResponse({
            mode: "style",
            answer: data.text,
            quotedPassages: [],
            coveredInLesson: true,
            viaOnlineAi: true,
          });
          setLoading(false);
          return;
        }
      }
    } catch {
      /* offline fallback */
    }

    const localStyle = buildStyledExplanationLocally({
      topic: lessonTitle,
      styleId,
      sourceExcerpt: lessonText,
    });
    setResponse({
      mode: "style",
      answer: `${localStyle.explanation}\n\n${localStyle.quickCheckQuestion}`,
      quotedPassages: [],
      coveredInLesson: true,
      viaOnlineAi: false,
    });
    setLoading(false);
  };

  return (
    <div className="rounded-xl border border-primary/25 bg-surface-2 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="size-4 text-primary" />
          <div>
            <div className="text-xs font-bold text-foreground">
              Ask Your Lesson & Teach Me Differently
            </div>
            <div className="text-[11px] text-muted-foreground">
              Grounded strictly in &ldquo;{lessonTitle}&rdquo; · Never invents outside textbook
              quotes
            </div>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant={expanded ? "outline" : "glow"}
          onClick={() => setExpanded((v) => !v)}
          className="h-8 gap-1 text-xs"
        >
          <Sparkles className="size-3.5" />
          <span>{expanded ? "Hide Assistant" : "Open Lesson Assistant"}</span>
          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-border pt-3">
          {/* Quick Ask Chips */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Ask About This Lesson
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_LESSON_PROMPTS.map((qp) => (
                <button
                  key={qp}
                  type="button"
                  onClick={() => void askQuestion(qp)}
                  className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:border-primary/40"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* 8 Teaching Styles Switcher */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Switch Explanation Style (8 Modes)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TEACH_ME_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => void explainWithStyle(style.id)}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    selectedStyle === style.id && response?.mode === "style"
                      ? "border-primary bg-primary/15 text-primary font-semibold"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {style.shortTag}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Lesson Question Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void askQuestion(question);
            }}
            className="flex gap-2"
          >
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything specific about this lesson text..."
              aria-label="Ask a question about this lesson"
              className="h-9 text-xs"
            />
            <Button
              type="submit"
              size="sm"
              variant="glow"
              disabled={loading || !question.trim()}
              className="h-9"
            >
              {loading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              <span className="ms-1">Ask</span>
            </Button>
          </form>

          {response && (
            <div className="rounded-lg border border-border bg-surface p-3.5 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  <BookOpen className="size-3.5" />
                  {response.viaOnlineAi
                    ? "Grounded Lesson AI Tutor"
                    : "Local Source-Grounded Reader"}
                </span>
                <span>
                  {response.coveredInLesson
                    ? "Matched lesson content"
                    : "Not explicitly in lesson text"}
                </span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                {response.answer}
              </p>
              {response.quotedPassages.length > 0 && (
                <div className="border-t border-border pt-2 space-y-1">
                  <div className="text-[11px] font-semibold text-muted-foreground">
                    Verbatim Lesson Passages Cited:
                  </div>
                  {response.quotedPassages.map((p, idx) => (
                    <blockquote
                      key={idx}
                      className="rounded border border-border bg-surface-2 px-2.5 py-1.5 text-[11px] italic text-foreground"
                    >
                      &ldquo;{p}&rdquo;
                    </blockquote>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
