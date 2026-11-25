import React, { useMemo } from "react";
import { AlertCircle, CheckCircle2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface WritingIssue {
  id: string;
  category: "Spelling" | "Capitalization" | "Punctuation" | "Grammar & Form";
  issueText: string;
  suggestion: string;
  badSnippet: string;
}

export function detectRealTimeWritingIssues(text: string): WritingIssue[] {
  if (!text || text.trim().length === 0) return [];
  const issues: WritingIssue[] = [];
  const trimmed = text.trim();

  // 1. Common misspellings check
  const COMMON_MISSPELLINGS: Record<string, string> = {
    yestarday: "yesterday",
    techer: "teacher",
    recieve: "receive",
    beautifull: "beautiful",
    frind: "friend",
    becuz: "because",
    tomororw: "tomorrow",
    definatly: "definitely",
    skool: "school",
    cheep: "cheap",
    writng: "writing",
    studyd: "studied",
    enviroment: "environment",
    governmet: "government",
    neccessary: "necessary",
  };

  const words = trimmed.split(/\s+/);
  for (const rawW of words) {
    const cleanW = rawW.toLowerCase().replace(/[^a-z]/g, "");
    if (COMMON_MISSPELLINGS[cleanW]) {
      const correct = COMMON_MISSPELLINGS[cleanW];
      issues.push({
        id: `spell_${rawW}_${Math.random().toString(36).slice(2, 6)}`,
        category: "Spelling",
        issueText: `Misspelled word '${rawW}'.`,
        suggestion: `Change to '${correct}'.`,
        badSnippet: rawW,
      });
    }
  }

  // 2. Capitalization check (first letter of text)
  if (trimmed.length > 0 && /^[a-z]/.test(trimmed)) {
    issues.push({
      id: "cap_start",
      category: "Capitalization",
      issueText: "Sentence starts with a lowercase letter.",
      suggestion: `Capitalize the first letter: '${trimmed[0]?.toUpperCase()}${trimmed.slice(1)}'.`,
      badSnippet: trimmed.slice(0, 10),
    });
  }

  // 3. Ending punctuation check
  if (trimmed.length > 5 && !/[.!?]$/.test(trimmed)) {
    issues.push({
      id: "punct_end",
      category: "Punctuation",
      issueText: "Draft is missing ending punctuation (. ! ?).",
      suggestion: "Add a period (.) or exclamation mark (!) at the end.",
      badSnippet: trimmed.slice(-10),
    });
  }

  return issues;
}

export function RealTimeWritingChecker({
  draft,
  onApplyCorrection,
}: {
  draft: string;
  onApplyCorrection?: (fixedText: string) => void;
}) {
  const issues = useMemo(() => detectRealTimeWritingIssues(draft), [draft]);

  if (!draft.trim()) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface-2/40 px-3.5 py-2 text-xs text-muted-foreground">
        <Sparkles className="size-3.5 text-primary shrink-0" />
        <span>
          Real-time writing assistant ready. Start typing to see live grammar & spelling checks.
        </span>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-4 shrink-0" />
        <span>No grammatical or lexical errors detected in live check. Looking pristine!</span>
      </div>
    );
  }

  const handleAutoFix = () => {
    let fixed = draft;
    const COMMON_MISSPELLINGS: Record<string, string> = {
      yestarday: "yesterday",
      techer: "teacher",
      recieve: "receive",
      beautifull: "beautiful",
      frind: "friend",
      becuz: "because",
      tomororw: "tomorrow",
      definatly: "definitely",
      skool: "school",
      cheep: "cheap",
      writng: "writing",
      studyd: "studied",
      enviroment: "environment",
      governmet: "government",
      neccessary: "necessary",
    };
    for (const [typo, correct] of Object.entries(COMMON_MISSPELLINGS)) {
      const regex = new RegExp(`\\b${typo}\\b`, "gi");
      fixed = fixed.replace(regex, correct);
    }
    if (/^[a-z]/.test(fixed)) {
      fixed = fixed[0]!.toUpperCase() + fixed.slice(1);
    }
    if (fixed.length > 5 && !/[.!?]$/.test(fixed)) {
      fixed = `${fixed.trim()}.`;
    }
    onApplyCorrection?.(fixed);
  };

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
          <AlertCircle className="size-4 shrink-0 text-amber-500" />
          <span>Real-Time Writing Suggestions ({issues.length} found)</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAutoFix}
          className="h-7 gap-1 text-[11px] font-semibold border-amber-500/40 text-amber-800 dark:text-amber-200 hover:bg-amber-500/20"
        >
          <Wand2 className="size-3 text-amber-500" />
          <span>Auto-Fix & Polish</span>
        </Button>
      </div>

      <div className="space-y-1.5">
        {issues.map((iss) => (
          <div
            key={iss.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-lg border border-border/70 bg-surface/80 px-3 py-2 text-xs"
          >
            <div className="space-y-0.5">
              <span className="font-semibold text-foreground">
                [{iss.category}] {iss.issueText}
              </span>
              <p className="text-[11px] text-muted-foreground">{iss.suggestion}</p>
            </div>
            <span className="font-mono text-[10px] bg-surface-2 px-2 py-1 rounded text-primary font-medium shrink-0">
              "{iss.badSnippet}"
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
