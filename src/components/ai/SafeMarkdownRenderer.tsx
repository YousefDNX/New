import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface SafeMarkdownRendererProps {
  content: string;
  className?: string;
}

function sanitizeHref(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (
      parsed.protocol === "https:" ||
      parsed.protocol === "http:" ||
      parsed.protocol === "mailto:"
    ) {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

function renderInlineNodes(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Matches: [label](url), `code`, **bold**, __bold__, *italic*, _italic_
  const tokenRegex =
    /\[([^\]\n]+)\]\(([^)\s]+)\)|`([^`\n]+)`|\*\*([^*\n]+)\*\*|__([^_\n]+)__|\*([^*\n]+)\*|_([^_\n]+)_/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const key = `${keyPrefix}-${idx++}`;
    if (match[1] !== undefined && match[2] !== undefined) {
      const safeUrl = sanitizeHref(match[2]);
      if (safeUrl) {
        nodes.push(
          <a
            key={key}
            href={safeUrl}
            target={safeUrl.startsWith("/") ? undefined : "_blank"}
            rel={safeUrl.startsWith("/") ? undefined : "noopener noreferrer"}
            className="font-semibold text-primary underline underline-offset-2 hover:opacity-85"
          >
            {match[1]}
          </a>,
        );
      } else {
        nodes.push(match[1]);
      }
    } else if (match[3] !== undefined) {
      nodes.push(
        <code
          key={key}
          dir="ltr"
          className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.88em] text-foreground border border-border/50"
        >
          {match[3]}
        </code>,
      );
    } else if (match[4] !== undefined || match[5] !== undefined) {
      nodes.push(
        <strong key={key} className="font-bold text-foreground">
          {match[4] ?? match[5]}
        </strong>,
      );
    } else if (match[6] !== undefined || match[7] !== undefined) {
      nodes.push(
        <em key={key} className="italic">
          {match[6] ?? match[7]}
        </em>,
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div
      dir="ltr"
      className="my-2 overflow-hidden rounded-xl border border-border/80 bg-zinc-950 text-zinc-100"
    >
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs">
        <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code block"
          className="inline-flex min-h-[32px] items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

type Segment =
  { type: "text"; content: string } | { type: "code"; language: string; content: string };

function splitCodeFences(raw: string): Segment[] {
  const segments: Segment[] = [];
  const lines = raw.split(/\r?\n/);
  let currentText: string[] = [];
  let inCode = false;
  let codeLang = "";
  let currentCode: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!inCode) {
      const openMatch = /^```([a-zA-Z0-9_+-]*)\s*$/.exec(trimmed);
      if (openMatch) {
        if (currentText.length > 0) {
          segments.push({ type: "text", content: currentText.join("\n") });
          currentText = [];
        }
        inCode = true;
        codeLang = openMatch[1] ?? "";
        currentCode = [];
      } else {
        currentText.push(line);
      }
    } else {
      if (trimmed === "```") {
        segments.push({
          type: "code",
          language: codeLang,
          content: currentCode.join("\n"),
        });
        inCode = false;
        codeLang = "";
        currentCode = [];
      } else {
        currentCode.push(line);
      }
    }
  }

  // Handle unclosed trailing fence cleanly (important during live SSE streaming)
  if (inCode) {
    segments.push({
      type: "code",
      language: codeLang,
      content: currentCode.join("\n"),
    });
  } else if (currentText.length > 0) {
    segments.push({ type: "text", content: currentText.join("\n") });
  }

  return segments;
}

function isTableSeparatorLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes("|")) return false;
  const cells = trimmed.replace(/^\|/, "").replace(/\|$/, "").split("|");
  return cells.length >= 2 && cells.every((c) => /^\s*:?-{2,}:?\s*$/.test(c));
}

function parseTableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderTextSegment(text: string, segIdx: number): React.ReactNode[] {
  const cleanedText = text
    .replace(/"""+/g, "")
    .replace(/'''+/g, "")
    .replace(/\*{3,}/g, "");
  const lines = cleanedText.split(/\r?\n/);
  const out: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^([-*_]){3,}$/.test(trimmed)) {
      out.push(<hr key={`hr-${segIdx}-${i}`} className="my-2 border-border/70" />);
      i++;
      continue;
    }

    // Headings # .. ####
    const headingMatch = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      const level = headingMatch[1]!.length;
      const body = headingMatch[2]!;
      const cls =
        level === 1
          ? "font-display text-lg font-bold text-foreground mt-2 mb-1"
          : level === 2
            ? "font-display text-base font-bold text-foreground mt-2 mb-1"
            : "font-display text-sm font-bold text-foreground mt-1.5 mb-0.5";
      out.push(
        <div key={`h-${segIdx}-${i}`} dir="auto" role="heading" aria-level={level} className={cls}>
          {renderInlineNodes(body, `h-${segIdx}-${i}`)}
        </div>,
      );
      i++;
      continue;
    }

    // Table detection (header + |---| separator)
    if (line.includes("|") && i + 1 < lines.length && isTableSeparatorLine(lines[i + 1] ?? "")) {
      const headers = parseTableCells(line);
      const rows: string[][] = [];
      let j = i + 2;
      while (j < lines.length && (lines[j] ?? "").includes("|") && (lines[j] ?? "").trim() !== "") {
        rows.push(parseTableCells(lines[j] ?? ""));
        j++;
      }
      out.push(
        <div
          key={`tbl-${segIdx}-${i}`}
          dir="auto"
          className="my-2 overflow-x-auto rounded-lg border border-border/70"
        >
          <table className="w-full text-xs border-collapse">
            <thead className="bg-surface-2/80">
              <tr>
                {headers.map((h, hIdx) => (
                  <th
                    key={hIdx}
                    className="border-b border-border/70 px-3 py-2 text-start font-semibold text-foreground"
                  >
                    {renderInlineNodes(h, `th-${segIdx}-${i}-${hIdx}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, rIdx) => (
                <tr key={rIdx} className="border-b border-border/40 last:border-b-0">
                  {headers.map((_, cIdx) => (
                    <td key={cIdx} className="px-3 py-1.5 text-foreground/90">
                      {renderInlineNodes(r[cIdx] ?? "", `td-${segIdx}-${i}-${rIdx}-${cIdx}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      i = j;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      let j = i;
      while (j < lines.length && (lines[j] ?? "").trim().startsWith(">")) {
        quoteLines.push((lines[j] ?? "").trim().replace(/^>\s?/, ""));
        j++;
      }
      out.push(
        <blockquote
          key={`bq-${segIdx}-${i}`}
          dir="auto"
          className="my-1.5 border-s-4 border-primary/50 bg-primary/5 ps-3 py-1.5 rounded-e-lg text-foreground/90"
        >
          {renderInlineNodes(quoteLines.join(" "), `bq-${segIdx}-${i}`)}
        </blockquote>,
      );
      i = j;
      continue;
    }

    // Unordered list
    if (/^[-*•]\s+/.test(trimmed)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && /^[-*•]\s+/.test((lines[j] ?? "").trim())) {
        items.push((lines[j] ?? "").trim().replace(/^[-*•]\s+/, ""));
        j++;
      }
      out.push(
        <ul key={`ul-${segIdx}-${i}`} className="my-1.5 list-disc ps-5 space-y-1">
          {items.map((item, itemIdx) => (
            <li key={itemIdx} dir="auto" className="leading-relaxed">
              {renderInlineNodes(item, `ul-${segIdx}-${i}-${itemIdx}`)}
            </li>
          ))}
        </ul>,
      );
      i = j;
      continue;
    }

    // Ordered list
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && /^\d+[.)]\s+/.test((lines[j] ?? "").trim())) {
        items.push((lines[j] ?? "").trim().replace(/^\d+[.)]\s+/, ""));
        j++;
      }
      out.push(
        <ol key={`ol-${segIdx}-${i}`} className="my-1.5 list-decimal ps-5 space-y-1">
          {items.map((item, itemIdx) => (
            <li key={itemIdx} dir="auto" className="leading-relaxed">
              {renderInlineNodes(item, `ol-${segIdx}-${i}-${itemIdx}`)}
            </li>
          ))}
        </ol>,
      );
      i = j;
      continue;
    }

    // Paragraph (gather consecutive normal lines)
    const paraLines: string[] = [];
    let j = i;
    while (j < lines.length) {
      const cur = lines[j] ?? "";
      const curTrim = cur.trim();
      if (
        !curTrim ||
        /^(#{1,4})\s+/.test(curTrim) ||
        /^[-*•]\s+/.test(curTrim) ||
        /^\d+[.)]\s+/.test(curTrim) ||
        curTrim.startsWith(">") ||
        /^([-*_]){3,}$/.test(curTrim)
      ) {
        break;
      }
      paraLines.push(curTrim);
      j++;
    }

    out.push(
      <p key={`p-${segIdx}-${i}`} dir="auto" className="leading-relaxed break-words">
        {renderInlineNodes(paraLines.join(" "), `p-${segIdx}-${i}`)}
      </p>,
    );
    i = j;
  }

  return out;
}

export function SafeMarkdownRenderer({ content, className = "" }: SafeMarkdownRendererProps) {
  const segments = splitCodeFences(content);

  return (
    <div className={`space-y-1.5 text-foreground break-words ${className}`}>
      {segments.map((seg, idx) =>
        seg.type === "code" ? (
          <CodeBlock key={`code-${idx}`} language={seg.language} code={seg.content} />
        ) : (
          <React.Fragment key={`seg-${idx}`}>{renderTextSegment(seg.content, idx)}</React.Fragment>
        ),
      )}
    </div>
  );
}
