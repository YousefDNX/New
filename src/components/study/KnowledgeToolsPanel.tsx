import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookMarked,
  Check,
  Columns,
  Download,
  Flag,
  History,
  Library,
  Link2,
  Plus,
  Printer,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { FocusReadingButton, FocusReadingOverlay } from "@/components/common/FocusReadingOverlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OPEN_LEARNING_LIBRARY, type ErrorReportKind } from "@/data/open-learning-library";
import { useStudyActions, useStudyItems } from "@/hooks/use-modules";
import type { StudyItemRow } from "@/lib/firestore-data";
import { downloadTextFile } from "@/lib/safe-file";
import {
  canDownloadResource,
  filterOpenLibrary,
  formatAttributionExportMarkdown,
  isResourceDueForReview,
  resolveEffectiveResource,
  validateErrorReportInput,
} from "@/lib/legacy-knowledge";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

export interface SuggestedNoteLink {
  source: StudyItemRow;
  target: StudyItemRow;
  reason: string;
}

export function computeSuggestedNoteLinks(
  items: StudyItemRow[],
  existingLinks: Array<{ sourceId: string; targetId: string }>,
): SuggestedNoteLink[] {
  const notes = items.filter((i) => i.kind === "note");
  const seenPairs = new Set(
    existingLinks.flatMap((l) => [`${l.sourceId}::${l.targetId}`, `${l.targetId}::${l.sourceId}`]),
  );
  const suggestions: SuggestedNoteLink[] = [];

  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const a = notes[i]!;
      const b = notes[j]!;
      const pairKey = `${a.id}::${b.id}`;
      if (seenPairs.has(pairKey)) continue;

      const wordsA = new Set(
        `${a.title} ${a.content}`
          .toLowerCase()
          .split(/\W+/)
          .filter((w) => w.length >= 5),
      );
      const sharedWords = `${b.title} ${b.content}`
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length >= 5 && wordsA.has(w));

      if (sharedWords.length > 0) {
        suggestions.push({
          source: a,
          target: b,
          reason: `Shared concept keyword "${sharedWords[0]}"`,
        });
      } else if (a.subject === b.subject) {
        suggestions.push({
          source: a,
          target: b,
          reason: `Same subject (${a.subject})`,
        });
      }
      if (suggestions.length >= 6) return suggestions;
    }
  }
  return suggestions;
}

const CONCEPT_COMPARISONS = [
  {
    id: "cmp_mitosis_meiosis",
    title: "Mitosis vs. Meiosis (Cell Division)",
    leftLabel: "Mitosis",
    rightLabel: "Meiosis",
    rows: [
      {
        criterion: "Daughter Cells",
        left: "2 identical diploid (2n)",
        right: "4 genetically unique haploid (n)",
      },
      {
        criterion: "Divisions",
        left: "1 nuclear division",
        right: "2 sequential divisions (I & II)",
      },
      {
        criterion: "Biological Role",
        left: "Body growth & tissue repair",
        right: "Gamete formation & genetic diversity",
      },
    ],
  },
  {
    id: "cmp_series_parallel",
    title: "Series vs. Parallel Electrical Circuits",
    leftLabel: "Series Circuit",
    rightLabel: "Parallel Circuit",
    rows: [
      {
        criterion: "Current Path",
        left: "Single shared loop (I same everywhere)",
        right: "Independent branches (I splits)",
      },
      {
        criterion: "Voltage Drop",
        left: "Divides across resistors",
        right: "Equal V across each branch",
      },
      {
        criterion: "Total Resistance",
        left: "Req = R₁ + R₂ (increases)",
        right: "1/Req = 1/R₁ + 1/R₂ (decreases)",
      },
    ],
  },
  {
    id: "cmp_corr_caus",
    title: "Correlation vs. Causation (Data Reasoning)",
    leftLabel: "Correlation",
    rightLabel: "Causation",
    rows: [
      {
        criterion: "Meaning",
        left: "Two variables move together statistically",
        right: "Changing X directly produces change in Y",
      },
      {
        criterion: "Evidence Needed",
        left: "Observational dataset or scatter plot",
        right: "Controlled experiment ruling out confounders",
      },
      {
        criterion: "Common Pitfall",
        left: "Assuming coincidence proves cause",
        right: "Overlooking lurking third variables",
      },
    ],
  },
];

const CURATED_GLOSSARY = [
  {
    id: "gl_1",
    term: "Homeostasis",
    subject: "Biology",
    definition:
      "Dynamic physiological regulation maintaining stable internal conditions (temperature, pH, glucose).",
    example: "Sweating & vasodilation cooling body temperature.",
    mastered: false,
  },
  {
    id: "gl_2",
    term: "Stoichiometry",
    subject: "Chemistry",
    definition:
      "Quantitative mole ratios between reactants and products in a balanced chemical equation.",
    example: "2 H₂ + O₂ -> 2 H₂O uses a 2:1:2 mole ratio.",
    mastered: false,
  },
  {
    id: "gl_3",
    term: "Binary Search",
    subject: "Computer Science",
    definition: "O(log n) algorithm halving a sorted array each step until locating the target.",
    example: "Finding a page in a 512-page dictionary in <= 9 checks.",
    mastered: false,
  },
  {
    id: "gl_4",
    term: "Opportunity Cost",
    subject: "Economics",
    definition:
      "Value of the next best alternative foregone when choosing one option over another.",
    example: "Spending 2 hours gaming instead of revising chemistry.",
    mastered: false,
  },
];

export function KnowledgeToolsPanel() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { data: items = [] } = useStudyItems();
  const { updateStudyItem } = useStudyActions();
  const { state: eco, update: updateEco } = useStudentEcosystem();

  const [toolTab, setToolTab] = useState<
    "open_library" | "linking" | "history" | "export" | "compare" | "glossary" | "verification"
  >("open_library");
  const [glossarySearch, setGlossarySearch] = useState("");
  const [newTerm, setNewTerm] = useState("");
  const [newDef, setNewDef] = useState("");
  const [newSubject, setNewSubject] = useState("Science");

  // Open Learning Library filters & error report state
  const [libQuery, setLibQuery] = useState("");
  const [libSubject, setLibSubject] = useState("all");
  const [libLevel, setLibLevel] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [libLang, setLibLang] = useState<"all" | "en" | "ar" | "bilingual">("all");
  const [libDownloadableOnly, setLibDownloadableOnly] = useState(false);
  const [expandedCorrectionId, setExpandedCorrectionId] = useState<string | null>(null);
  const [reportingResourceId, setReportingResourceId] = useState<string | null>(null);
  const [reportKind, setReportKind] = useState<ErrorReportKind>("factual_error");
  const [reportDetails, setReportDetails] = useState("");

  const librarySubjects = useMemo(
    () => Array.from(new Set(OPEN_LEARNING_LIBRARY.map((r) => r.subject))),
    [],
  );

  const filteredLibrary = useMemo(
    () =>
      filterOpenLibrary(
        OPEN_LEARNING_LIBRARY,
        {
          query: libQuery,
          subject: libSubject,
          level: libLevel,
          language: libLang,
          downloadableOnly: libDownloadableOnly,
        },
        eco.resourceStatusOverrides,
      ),
    [libQuery, libSubject, libLevel, libLang, libDownloadableOnly, eco.resourceStatusOverrides],
  );

  const notes = useMemo(() => items.filter((i) => i.kind === "note"), [items]);
  const flashcards = useMemo(() => items.filter((i) => i.kind === "flashcard"), [items]);

  // #41 Smart Notes Linking
  const suggestedLinks = useMemo(
    () => computeSuggestedNoteLinks(items, eco.noteLinks),
    [items, eco.noteLinks],
  );

  const handleLinkAction = (sug: SuggestedNoteLink, approved: boolean) => {
    updateEco((prev) => ({
      ...prev,
      noteLinks: [
        ...prev.noteLinks,
        {
          sourceId: sug.source.id,
          targetId: sug.target.id,
          reason: sug.reason,
          approved,
        },
      ],
    }));
    toast.success(approved ? "Approved note connection" : "Dismissed suggestion");
  };

  // #42 Version History Snapshot & Restore
  const saveManualSnapshot = (note: StudyItemRow) => {
    updateEco((prev) => ({
      ...prev,
      noteRevisions: {
        ...prev.noteRevisions,
        [note.id]: [
          {
            id: `rev_${Date.now().toString(36)}`,
            title: note.title,
            content: note.content,
            savedAt: new Date().toISOString(),
          },
          ...(prev.noteRevisions[note.id] ?? []),
        ].slice(0, 8),
      },
    }));
    toast.success(`Saved version snapshot for "${note.title}"`);
  };

  const restoreSnapshot = async (note: StudyItemRow, title: string, content: string) => {
    await updateStudyItem(note, { title, content });
    toast.success(`Restored version snapshot for "${title}"`);
  };

  // #45 Exporter
  const exportMarkdownPack = () => {
    const lines = [
      "# BTC Student Study Revision Pack",
      "",
      ...notes.map((n) => `## ${n.title} (${n.subject})\n${n.content}\n`),
      "## Flashcards",
      ...flashcards.map((f) => `- **${f.title}**: ${f.answer ?? f.content}`),
    ].join("\n");
    downloadTextFile(lines, "btc-study-revision-pack.md", "text/markdown;charset=utf-8");
    toast.success("Downloaded Study Revision Markdown Pack");
  };

  const exportAnkiCsv = () => {
    const rows = flashcards
      .map(
        (f) => `"${f.title.replace(/"/g, '""')}","${(f.answer ?? f.content).replace(/"/g, '""')}"`,
      )
      .join("\n");
    downloadTextFile(`Front,Back\n${rows}`, "btc-flashcards.csv", "text/csv;charset=utf-8");
    toast.success("Exported Flashcards CSV (Anki-compatible)");
  };

  // #48 Glossary
  const allGlossary = useMemo(() => {
    const merged = [
      ...eco.glossaryTerms,
      ...CURATED_GLOSSARY.filter((c) => !eco.glossaryTerms.some((g) => g.term === c.term)),
    ];
    const q = glossarySearch.trim().toLowerCase();
    return q
      ? merged.filter(
          (g) =>
            g.term.toLowerCase().includes(q) ||
            g.definition.toLowerCase().includes(q) ||
            g.subject.toLowerCase().includes(q),
        )
      : merged;
  }, [eco.glossaryTerms, glossarySearch]);

  const [focusReaderOpen, setFocusReaderOpen] = useState(false);

  const handleAddGlossaryTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newDef.trim()) return;
    updateEco((prev) => ({
      ...prev,
      glossaryTerms: [
        {
          id: `gl_u_${Date.now().toString(36)}`,
          term: newTerm.trim(),
          subject: newSubject.trim() || "General",
          definition: newDef.trim(),
          example: "Student-added definition",
          mastered: true,
        },
        ...prev.glossaryTerms,
      ],
    }));
    setNewTerm("");
    setNewDef("");
    toast.success("Saved term to Learning Glossary");
  };

  return (
    <div className="surface-card p-5 space-y-4" data-testid="knowledge-tools-panel">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold font-display text-foreground">
            {isAr
              ? "أدوات ربط المعرفة والتصدير والمصطلحات"
              : "Knowledge Tools, Versioning & Study Exporter"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "اقترح روابط بين ملاحظاتك بموافقتك، استعد النسخ السابقة، قارن المفاهيم، وصدّر حزم المراجعة."
              : "Reviewable smart note links, revision history snapshots, print/Markdown/CSV export, side-by-side concept matrices, and searchable glossary."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FocusReadingButton onClick={() => setFocusReaderOpen(true)} />
          <FeatureGuideTrigger featureId="knowledge-tools" />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
        {[
          { id: "open_library", label: "Open Learning Library", icon: Library },
          { id: "linking", label: "41. Note Linking", icon: Link2 },
          { id: "history", label: "42. Version History", icon: History },
          { id: "export", label: "45. Export & Print", icon: Download },
          { id: "compare", label: "47. Concept Compare", icon: Columns },
          { id: "glossary", label: "48. Glossary", icon: BookMarked },
          { id: "verification", label: "Verification Log", icon: ShieldCheck },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setToolTab(item.id as typeof toolTab)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                toolTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-2 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* OPEN LEARNING LIBRARY (3A) & REPORT AN ERROR (6C) */}
      {toolTab === "open_library" && (
        <div className="space-y-4 text-xs" data-testid="open-learning-library">
          <div className="grid gap-2 sm:grid-cols-4">
            <div className="relative sm:col-span-2">
              <Search className="size-3.5 text-muted-foreground absolute start-3 top-2.5" />
              <Input
                value={libQuery}
                onChange={(e) => setLibQuery(e.target.value)}
                placeholder="Search by topic, objective, subject, or author..."
                className="ps-8 text-xs"
              />
            </div>
            <select
              value={libSubject}
              onChange={(e) => setLibSubject(e.target.value)}
              aria-label="Filter library by subject"
              className="h-9 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
            >
              <option value="all">All Subjects</option>
              {librarySubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={libLevel}
              onChange={(e) => setLibLevel(e.target.value as typeof libLevel)}
              aria-label="Filter library by level"
              className="h-9 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-1.5">
                <span>Language:</span>
                <select
                  value={libLang}
                  onChange={(e) => setLibLang(e.target.value as typeof libLang)}
                  aria-label="Filter library by language"
                  className="h-7 rounded border border-input bg-surface-2 px-2 text-xs text-foreground"
                >
                  <option value="all">All</option>
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                  <option value="bilingual">Bilingual</option>
                </select>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={libDownloadableOnly}
                  onChange={(e) => setLibDownloadableOnly(e.target.checked)}
                  className="accent-primary"
                />
                <span>Permitted offline downloads only</span>
              </label>
            </div>
            <span className="tabular-nums font-medium">
              {filteredLibrary.length} verified open resource(s)
            </span>
          </div>

          <div className="space-y-3">
            {filteredLibrary.map((res) => {
              const dlCheck = canDownloadResource(res, eco.resourceStatusOverrides);
              const freshness = isResourceDueForReview(res);
              const showCorr = expandedCorrectionId === res.id;
              const isReporting = reportingResourceId === res.id;
              return (
                <article
                  key={res.id}
                  className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-medium text-primary">
                        {res.subject} · {res.level} · {res.language} · {res.license}
                      </div>
                      <h3 className="font-display text-sm font-bold text-foreground mt-0.5">
                        {isAr ? res.titleAr : res.title}
                      </h3>
                    </div>
                    <span
                      className={`text-[11px] font-mono font-semibold tabular-nums ${
                        res.reviewStatus === "approved"
                          ? "text-emerald-500"
                          : res.reviewStatus === "needs_correction"
                            ? "text-destructive"
                            : "text-amber-500"
                      }`}
                    >
                      {res.reviewStatus} · Reviewed {res.lastReviewedDate}
                    </span>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">{res.summary}</p>
                  <p className="text-foreground/90 leading-relaxed">{res.body}</p>

                  <div className="rounded-lg border border-border/70 bg-surface p-2.5 text-[11px]">
                    <strong className="text-foreground">Worked Example: </strong>
                    <span className="text-muted-foreground">{res.workedExample}</span>
                  </div>

                  <div className="text-[11px] text-muted-foreground space-y-1">
                    <div>
                      <strong className="text-foreground">Owner:</strong> {res.authorOwner} ·{" "}
                      <strong className="text-foreground">Sources:</strong>{" "}
                      {res.sourceReferences.join("; ")}
                    </div>
                    {res.warningsLimitations.length > 0 && (
                      <div className="flex items-start gap-1.5 text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                        <span>{res.warningsLimitations.join(" ")}</span>
                      </div>
                    )}
                    {freshness.due && (
                      <div className="text-amber-500 font-medium">
                        Review cadence check flagged ({freshness.daysSinceReview}d since last
                        review).
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={!dlCheck.allowed}
                        title={dlCheck.reason}
                        onClick={() => {
                          const md = formatAttributionExportMarkdown(
                            res,
                            eco.resourceStatusOverrides,
                          );
                          downloadTextFile(md, `${res.id}.md`, "text/markdown;charset=utf-8");
                          toast.success(`Downloaded ${res.title} with source attribution.`);
                        }}
                        className="h-7 text-[11px]"
                      >
                        <Download className="size-3 me-1" />
                        {dlCheck.allowed ? "Download (.md)" : "Reference Only"}
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedCorrectionId(showCorr ? null : res.id)}
                        className="h-7 text-[11px]"
                      >
                        <History className="size-3 me-1" />
                        Correction History ({res.correctionHistory.length})
                      </Button>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setReportingResourceId(isReporting ? null : res.id);
                        setReportDetails("");
                      }}
                      className="h-7 text-[11px] text-muted-foreground hover:text-destructive"
                    >
                      <Flag className="size-3 me-1" />
                      Report an Error
                    </Button>
                  </div>

                  {showCorr && (
                    <div className="rounded-lg border border-border bg-surface p-2.5 space-y-1 text-[11px]">
                      {res.correctionHistory.length === 0 ? (
                        <p className="text-muted-foreground">No corrections logged yet.</p>
                      ) : (
                        res.correctionHistory.map((c, idx) => (
                          <div key={`${c.date}-${idx}`} className="text-muted-foreground">
                            <span className="font-mono text-foreground">{c.date}</span> (
                            {c.reviewerRole}
                            ): {c.summary}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {isReporting && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                      <div className="font-semibold text-foreground">
                        Report an Accuracy, Link, Accessibility, or License Issue
                      </div>
                      <select
                        value={reportKind}
                        onChange={(e) => setReportKind(e.target.value as ErrorReportKind)}
                        aria-label="Error report category"
                        className="h-8 w-full rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
                      >
                        <option value="factual_error">Factual or Scientific Error</option>
                        <option value="broken_link">Broken or Missing Source Reference</option>
                        <option value="outdated">Outdated Information</option>
                        <option value="copyright">Copyright or Attribution Concern</option>
                        <option value="accessibility">Accessibility / Readability Issue</option>
                        <option value="inappropriate">Age-Safety or Inappropriate Material</option>
                      </select>
                      <Textarea
                        rows={2}
                        value={reportDetails}
                        onChange={(e) => setReportDetails(e.target.value)}
                        placeholder="Explain what needs correction (do not include personal contact details)..."
                        className="text-xs"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="h-7 text-[11px]"
                          onClick={() => {
                            const check = validateErrorReportInput({
                              resourceId: res.id,
                              details: reportDetails,
                            });
                            if (!check.ok) {
                              toast.error(check.reason ?? "Invalid error report");
                              return;
                            }
                            const today = new Date().toISOString().slice(0, 10);
                            updateEco((prev) => {
                              const prevOverride = prev.resourceStatusOverrides[res.id];
                              return {
                                ...prev,
                                contentErrorReports: [
                                  {
                                    id: `err_${Date.now().toString(36)}`,
                                    resourceId: res.id,
                                    resourceTitle: res.title,
                                    kind: reportKind,
                                    details: reportDetails.trim(),
                                    reportedAt: new Date().toISOString(),
                                    status: "open",
                                  },
                                  ...prev.contentErrorReports,
                                ],
                                resourceStatusOverrides: {
                                  ...prev.resourceStatusOverrides,
                                  [res.id]: {
                                    reviewStatus: "needs_correction",
                                    lastReviewedDate:
                                      prevOverride?.lastReviewedDate ?? res.lastReviewedDate,
                                    correctionHistory: [
                                      {
                                        date: today,
                                        summary: `Flagged (${reportKind}): ${reportDetails.trim()}`,
                                        reviewerRole: "moderator",
                                      },
                                      ...(prevOverride?.correctionHistory ?? []),
                                    ],
                                  },
                                },
                              };
                            });
                            setReportingResourceId(null);
                            setReportDetails("");
                            toast.success(
                              "Logged error report and moved item to needs_correction until reviewed.",
                            );
                          }}
                        >
                          Submit Correction Report
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px]"
                          onClick={() => setReportingResourceId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* VERIFICATION CADENCE & ERROR QUEUE (6A–F) */}
      {toolTab === "verification" && (
        <div className="space-y-4 text-xs" data-testid="content-verification-log">
          <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2">
            <h3 className="font-bold text-foreground">Content Review Cadence & Trust Registry</h3>
            <p className="text-muted-foreground">
              High-stakes health/safety resources carry a 90–180 day mandatory review interval.
              Unverified items remain locked from redistribution.
            </p>
            <div className="space-y-1.5 pt-2">
              {OPEN_LEARNING_LIBRARY.map((item) => {
                const eff = resolveEffectiveResource(item, eco.resourceStatusOverrides);
                const cadence = isResourceDueForReview(eff);
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2"
                  >
                    <div>
                      <span className="font-semibold text-foreground">{eff.title}</span>
                      <span className="ms-2 text-[11px] text-muted-foreground">
                        Every {eff.reviewIntervalDays}d · Last {eff.lastReviewedDate}
                      </span>
                    </div>
                    <span
                      className={`font-mono text-[11px] font-semibold ${
                        cadence.due ? "text-amber-500" : "text-emerald-500"
                      }`}
                    >
                      {eff.reviewStatus}
                      {cadence.due ? " (Review Due)" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2">
            <h3 className="font-bold text-foreground">
              Reported Errors &amp; Correction Queue ({eco.contentErrorReports.length})
            </h3>
            {eco.contentErrorReports.length === 0 ? (
              <p className="text-muted-foreground">No error reports submitted yet.</p>
            ) : (
              eco.contentErrorReports.map((rep) => (
                <div
                  key={rep.id}
                  className="rounded-lg border border-border bg-surface p-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      {rep.resourceTitle} ({rep.kind})
                    </span>
                    <span className="font-mono text-[11px] uppercase text-primary">
                      {rep.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{rep.details}</p>
                  {rep.resolutionNote && (
                    <p className="text-emerald-500 text-[11px]">Resolution: {rep.resolutionNote}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* #41 SMART NOTES LINKING */}
      {toolTab === "linking" && (
        <div className="space-y-3 text-xs">
          <p className="text-muted-foreground">
            Suggested links based on shared keywords and subjects. Nothing is modified automatically
            without your approval.
          </p>
          {suggestedLinks.length === 0 ? (
            <div className="rounded-lg border border-border bg-surface-2/60 p-4 text-muted-foreground">
              Add at least two study notes (or review remaining connections) to discover new
              cross-links.
            </div>
          ) : (
            <div className="space-y-2">
              {suggestedLinks.map((sug) => (
                <div
                  key={`${sug.source.id}-${sug.target.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface-2/60 p-3"
                >
                  <div>
                    <div className="font-semibold text-foreground">
                      {sug.source.title} ↔ {sug.target.title}
                    </div>
                    <div className="text-[11px] text-primary">{sug.reason}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleLinkAction(sug, true)}
                      className="h-7 text-xs"
                    >
                      <Check className="size-3 me-1" />
                      Approve Link
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleLinkAction(sug, false)}
                      className="h-7 text-xs"
                    >
                      <X className="size-3 me-1" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {eco.noteLinks.filter((l) => l.approved).length > 0 && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-1">
              <div className="font-bold text-emerald-400">
                Approved Connections ({eco.noteLinks.filter((l) => l.approved).length})
              </div>
              {eco.noteLinks
                .filter((l) => l.approved)
                .map((l, idx) => (
                  <div key={idx} className="text-[11px] text-muted-foreground">
                    • {l.reason}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* #42 VERSION HISTORY */}
      {toolTab === "history" && (
        <div className="space-y-3 text-xs">
          {notes.length === 0 ? (
            <p className="text-muted-foreground">
              Create a study note first to checkpoint and restore snapshots.
            </p>
          ) : (
            notes.slice(0, 6).map((note) => {
              const revs = eco.noteRevisions[note.id] ?? [];
              return (
                <div
                  key={note.id}
                  className="rounded-lg border border-border bg-surface-2/60 p-3 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-bold text-foreground">{note.title}</div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => saveManualSnapshot(note)}
                      className="h-7 text-xs"
                    >
                      Save Snapshot Now
                    </Button>
                  </div>
                  {revs.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-border/60">
                      {revs.map((rev) => (
                        <div
                          key={rev.id}
                          className="flex items-center justify-between gap-2 text-[11px]"
                        >
                          <span className="text-muted-foreground">
                            {new Date(rev.savedAt).toLocaleString()} — {rev.content.slice(0, 50)}...
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => void restoreSnapshot(note, rev.title, rev.content)}
                            className="h-6 text-[11px]"
                          >
                            <RotateCcw className="size-3 me-1" />
                            Restore
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* #45 STUDY MATERIAL EXPORTER */}
      {toolTab === "export" && (
        <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3 text-xs">
          <div className="font-bold text-foreground">
            Ready to Export: {notes.length} Notes · {flashcards.length} Flashcards ·{" "}
            {eco.glossaryTerms.length} Custom Terms
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => window.print()} className="h-8 text-xs">
              <Printer className="size-3.5 me-1.5" />
              Print / Save PDF Sheet
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={exportMarkdownPack}
              className="h-8 text-xs"
            >
              <Download className="size-3.5 me-1.5" />
              Export Study Pack (.md)
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={exportAnkiCsv}
              className="h-8 text-xs"
            >
              <Download className="size-3.5 me-1.5" />
              Export Flashcards (.csv)
            </Button>
          </div>
        </div>
      )}

      {/* #47 CONCEPT COMPARISON */}
      {toolTab === "compare" && (
        <div className="space-y-3 text-xs">
          {CONCEPT_COMPARISONS.map((cmp) => (
            <div
              key={cmp.id}
              className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2"
            >
              <h3 className="font-bold text-foreground">{cmp.title}</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-1 text-start">Dimension</th>
                    <th className="py-1 text-start text-primary">{cmp.leftLabel}</th>
                    <th className="py-1 text-start text-sky-400">{cmp.rightLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {cmp.rows.map((r) => (
                    <tr key={r.criterion} className="border-b border-border/50">
                      <td className="py-1.5 font-semibold text-foreground">{r.criterion}</td>
                      <td className="py-1.5 text-muted-foreground">{r.left}</td>
                      <td className="py-1.5 text-muted-foreground">{r.right}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* #48 LEARNING GLOSSARY */}
      {toolTab === "glossary" && (
        <div className="space-y-3 text-xs">
          <div className="relative">
            <Search className="size-3.5 text-muted-foreground absolute start-3 top-2.5" />
            <Input
              value={glossarySearch}
              onChange={(e) => setGlossarySearch(e.target.value)}
              placeholder="Search science, coding, and academic terms..."
              className="ps-8 text-xs"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {allGlossary.map((g) => (
              <div
                key={g.id}
                className="rounded-lg border border-border bg-surface-2/60 p-3 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-foreground">{g.term}</span>
                  <span className="font-mono text-[10px] text-primary">{g.subject}</span>
                </div>
                <p className="text-muted-foreground">{g.definition}</p>
                <p className="text-[11px] text-foreground/80">Ex: {g.example}</p>
              </div>
            ))}
          </div>
          <form
            onSubmit={handleAddGlossaryTerm}
            className="rounded-lg border border-border bg-surface-1 p-3 space-y-2"
          >
            <div className="font-semibold text-foreground">Add Personal Glossary Term</div>
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                placeholder="Term (e.g. Osmosis)"
                className="text-xs"
              />
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Subject"
                className="text-xs"
              />
              <Button type="submit" size="sm" className="h-9 text-xs">
                <Plus className="size-3.5 me-1" />
                Save Term
              </Button>
            </div>
            <Input
              value={newDef}
              onChange={(e) => setNewDef(e.target.value)}
              placeholder="Clear definition in your own words..."
              className="text-xs"
            />
          </form>
        </div>
      )}
      <FocusReadingOverlay
        isOpen={focusReaderOpen}
        onClose={() => setFocusReaderOpen(false)}
        title={
          isAr ? "قراءة أكاديمية مركزة — أدوات المعرفة" : "Academic Deep Reading — Knowledge Brief"
        }
        subtitle={
          toolTab === "glossary"
            ? isAr
              ? "مسرد المصطلحات الأكاديمية"
              : "Academic Glossary & Definitions"
            : isAr
              ? "مصفوفة مقارنة المفاهيم والروابط"
              : "Concept Comparison Matrix & Study Notes"
        }
      >
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary">
              {isAr ? "مقارنة المفاهيم الأكاديمية" : "Core Concept Comparisons"}
            </h2>
            {CONCEPT_COMPARISONS.map((cmp) => (
              <div
                key={cmp.id}
                className="rounded-xl border border-white/15 bg-white/5 p-5 space-y-3"
              >
                <h3 className="text-lg font-bold">{cmp.title}</h3>
                <div className="space-y-2 text-sm opacity-90">
                  {cmp.rows.map((r) => (
                    <div key={r.criterion} className="border-b border-white/10 pb-2">
                      <span className="font-semibold text-primary">{r.criterion}: </span>
                      <span>
                        <strong>{cmp.leftLabel}</strong> — {r.left} |{" "}
                        <strong>{cmp.rightLabel}</strong> — {r.right}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-primary">
              {isAr ? "المسرد والمصطلحات الأساسية" : "Academic Glossary Terms"}
            </h2>
            <div className="space-y-4">
              {allGlossary.map((g) => (
                <div key={g.id} className="border-b border-white/10 pb-3">
                  <div className="font-bold text-base">
                    {g.term} <span className="text-xs font-normal opacity-60">({g.subject})</span>
                  </div>
                  <p className="mt-1 opacity-90">{g.definition}</p>
                  <p className="mt-1 text-xs opacity-70">Example: {g.example}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </FocusReadingOverlay>
    </div>
  );
}
