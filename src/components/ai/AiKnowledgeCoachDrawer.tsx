import { useMemo, useRef, useState } from "react";
import {
  BookMarked,
  Compass,
  FileUp,
  HelpCircle,
  Layers,
  Link2,
  Paperclip,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildStyledExplanationLocally } from "@/lib/learning-intelligence";
import { usePrefs } from "@/lib/preferences";
import { readFileAsTextSafe } from "@/lib/safe-file";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

export interface AttachedLessonContext {
  title: string;
  subject: string;
  excerpt: string;
}

export function AiKnowledgeCoachDrawer({
  subject,
  attachedContext,
  onAttachContext,
  onClearContext,
  onSendPromptWithContext,
  savedAiTasksCount,
  savedAiCardsCount,
}: {
  subject: string;
  attachedContext: AttachedLessonContext | null;
  onAttachContext: (ctx: AttachedLessonContext) => void;
  onClearContext: () => void;
  onSendPromptWithContext: (promptText: string) => void;
  savedAiTasksCount: number;
  savedAiCardsCount: number;
}) {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: eco, update: updateEco } = useStudentEcosystem();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [tab, setTab] = useState<"document" | "workspace" | "coach">("document");

  // Document companion state
  const [docTitle, setDocTitle] = useState(attachedContext?.title ?? "");
  const [docText, setDocText] = useState(attachedContext?.excerpt ?? "");
  const [docResult, setDocResult] = useState<{
    modeLabel: string;
    output: string;
    epistemicNote: string;
  } | null>(null);
  const [docBusy, setDocBusy] = useState(false);

  // Unified Knowledge Workspace search
  const [wsSearch, setWsSearch] = useState("");

  // Compassionate 4-step AI Study Coach state
  const [coachGoal, setCoachGoal] = useState("");
  const [coachObstacle, setCoachObstacle] = useState("");
  const [coachAdjustment, setCoachAdjustment] = useState("");
  const [coachReflection, setCoachReflection] = useState("");

  const handleUploadTextFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const content = await readFileAsTextSafe(file, {
        allowedExtensions: [".txt", ".md", ".csv"],
      });
      const clipped = content.slice(0, 8000);
      const cleanName = file.name.replace(/\.(txt|md|csv)$/i, "");
      setDocTitle(cleanName);
      setDocText(clipped);
      onAttachContext({ title: cleanName, subject, excerpt: clipped.slice(0, 3500) });
      toast.success(
        isAr
          ? `تم إرفاق الملف «${file.name}» بسياق المحادثة`
          : `Attached "${file.name}" as grounded lesson context`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read selected file.");
    }
  };

  const runStructuredDocAid = async (
    mode: "simplify" | "quiz" | "mistake_explanation" | "study_plan",
    label: string,
  ) => {
    const body = docText.trim();
    if (!body) {
      toast.error(isAr ? "أدخل أو ارفع نص الدرس أولاً." : "Paste or upload study material first.");
      return;
    }
    const title = docTitle.trim() || `${subject} Study Material`;
    onAttachContext({ title, subject, excerpt: body.slice(0, 3500) });
    setDocBusy(true);
    try {
      const res = await fetch("/api/ai/structured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          subject,
          prompt:
            mode === "simplify"
              ? "Summarize key concepts accurately from the excerpt and list any open questions needing textbook verification."
              : mode === "quiz"
                ? "Generate 3 diagnostic practice questions based strictly on this excerpt."
                : mode === "mistake_explanation"
                  ? "Identify likely misconceptions or pitfalls students face in this excerpt and explain how to verify them."
                  : "Break this excerpt into 3 realistic 20-minute study blocks.",
          sourceText: body.slice(0, 6000),
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        data?: {
          simplifiedText?: string;
          summary?: string;
          questions?: Array<{ prompt: string; answer?: string }>;
          steps?: Array<{ title: string; focus?: string }>;
        };
      };
      if (res.ok && json.ok && json.data) {
        const formatted =
          json.data.simplifiedText ??
          json.data.summary ??
          (json.data.questions
            ? json.data.questions
                .map((q, i) => `${i + 1}. ${q.prompt}${q.answer ? ` — Answer: ${q.answer}` : ""}`)
                .join("\n")
            : json.data.steps
              ? json.data.steps.map((s, i) => `${i + 1}. ${s.title}: ${s.focus ?? ""}`).join("\n")
              : JSON.stringify(json.data, null, 2));
        setDocResult({
          modeLabel: `${label} (AI Grounded)`,
          output: formatted,
          epistemicNote:
            "Derived from your attached excerpt. Verify formulas, dates, and external citations against your primary textbook.",
        });
      } else {
        throw new Error("AI offline");
      }
    } catch {
      const local = buildStyledExplanationLocally({
        topic: title,
        styleId: "simple_everyday",
      });
      const sentences = body
        .split(/(?<=[.!?])\s+/)
        .filter((s) => s.trim().length > 12)
        .slice(0, 4);
      setDocResult({
        modeLabel: `${label} (Offline Extractive Fallback)`,
        output:
          sentences.length > 0
            ? `${sentences.map((s, i) => `• ${i + 1}: ${s}`).join("\n")}\n\nSelf-check: ${local.quickCheckQuestion}`
            : `${local.explanation}\n\n${local.quickCheckQuestion}`,
        epistemicNote:
          "Generated locally from your excerpt sentences because AI server is unavailable right now.",
      });
    } finally {
      setDocBusy(false);
    }
  };

  const filteredLibrary = useMemo(() => {
    const q = wsSearch.trim().toLowerCase();
    if (!q) return eco.knowledgeLibrary;
    return eco.knowledgeLibrary.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q),
    );
  }, [eco.knowledgeLibrary, wsSearch]);

  const handleSaveCoachCheckIn = () => {
    if (!coachGoal.trim() || !coachAdjustment.trim()) {
      toast.error(
        isAr
          ? "حدد هدفك الحالي والتعديل الواقعي للخطة."
          : "Enter your current goal and a realistic schedule adjustment first.",
      );
      return;
    }
    updateEco((prev) => ({
      ...prev,
      coachingReflections: [
        {
          id: `coach_${Date.now().toString(36)}`,
          subject,
          goal: coachGoal.trim(),
          obstacle: coachObstacle.trim() || "Heavy workload / energy dip",
          realisticAdjustment: coachAdjustment.trim(),
          reflection: coachReflection.trim() || "Taking one focused step today.",
          createdAt: new Date().toISOString(),
        },
        ...prev.coachingReflections,
      ].slice(0, 20),
    }));
    toast.success(isAr ? "تم حفظ خطة المدرب الدراسي" : "Saved compassionate study coaching plan!");
    setCoachGoal("");
    setCoachObstacle("");
    setCoachAdjustment("");
    setCoachReflection("");
  };

  return (
    <div
      className="surface-card space-y-4 border-primary/30 p-4 text-xs"
      data-testid="ai-knowledge-coach-drawer"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setTab("document")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold whitespace-nowrap ${
              tab === "document"
                ? "bg-primary text-primary-foreground"
                : "bg-surface-2 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Paperclip className="size-3.5" />
            <span>{isAr ? "تلخيص ومناقشة الملفات" : "Document Companion & QA"}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("workspace")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold whitespace-nowrap ${
              tab === "workspace"
                ? "bg-primary text-primary-foreground"
                : "bg-surface-2 text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookMarked className="size-3.5" />
            <span>
              {isAr ? "مساحة المعرفة الموحدة" : "Knowledge Workspace"} (
              {eco.knowledgeLibrary.length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab("coach")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold whitespace-nowrap ${
              tab === "coach"
                ? "bg-primary text-primary-foreground"
                : "bg-surface-2 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Compass className="size-3.5" />
            <span>{isAr ? "مدرب المذاكرة الذكي" : "AI Study Coach"}</span>
          </button>
        </div>

        <span className="text-[11px] text-muted-foreground">
          {savedAiTasksCount} AI tasks · {savedAiCardsCount} AI cards ·{" "}
          {eco.researchCitations.length} citations
        </span>
      </div>

      {/* SUBTAB 1: DOCUMENT COMPANION */}
      {tab === "document" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-muted-foreground">
              {isAr
                ? "ارفع ملف نصي (.txt / .md / .csv) أو الصق مقتطفاً دراسياً لربطه مباشرة بالمعلم الذكي وتوليد ملخص أو أسئلة تدريبية."
                : "Upload a study file (.txt, .md, .csv) or paste notes to ground AI answers in your real course material."}
            </p>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.csv,text/plain,text/markdown,text/csv"
                onChange={handleUploadTextFile}
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-xs"
              >
                <FileUp className="size-3.5" />
                <span>{isAr ? "رفع ملف دراسة" : "Upload .txt / .md / .csv"}</span>
              </Button>
              {attachedContext && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={onClearContext}
                  className="h-8 text-xs text-muted-foreground"
                >
                  Clear Attached
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <Input
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder={isAr ? "عنوان المادة أو الدرس..." : "Document or lesson title..."}
              className="text-xs"
            />
            <div className="flex items-center justify-end gap-1.5 flex-wrap">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={docBusy || !docText.trim()}
                onClick={() => void runStructuredDocAid("simplify", "Plain Summary")}
                className="h-8 text-[11px]"
              >
                <Sparkles className="size-3 text-primary" />
                <span>{isAr ? "تلخيص" : "Summarize"}</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={docBusy || !docText.trim()}
                onClick={() => void runStructuredDocAid("quiz", "Practice Questions")}
                className="h-8 text-[11px]"
              >
                <HelpCircle className="size-3 text-primary" />
                <span>{isAr ? "أسئلة تدريبية" : "Practice Quiz"}</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={docBusy || !docText.trim()}
                onClick={() =>
                  void runStructuredDocAid("mistake_explanation", "Pitfalls & Mistake Check")
                }
                className="h-8 text-[11px]"
              >
                <ShieldAlert className="size-3 text-amber-400" />
                <span>{isAr ? "نقاط اللبس والأخطاء" : "Check Pitfalls"}</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="glow"
                disabled={!docText.trim()}
                onClick={() => {
                  onAttachContext({
                    title: docTitle.trim() || `${subject} Notes`,
                    subject,
                    excerpt: docText.trim().slice(0, 3500),
                  });
                  onSendPromptWithContext(
                    `Using my attached notes "${docTitle.trim() || subject}", explain the core idea and identify any missing prerequisite steps.`,
                  );
                }}
                className="h-8 text-[11px]"
              >
                <span>{isAr ? "اسأل المعلم عن الملف" : "Attach & Ask Tutor"}</span>
              </Button>
            </div>
          </div>

          <Textarea
            rows={4}
            value={docText}
            onChange={(e) => setDocText(e.target.value)}
            placeholder={
              isAr
                ? "الصق هنا ملخص الدرس أو الفقرة الدراسية..."
                : "Paste study notes, lecture transcript, or textbook excerpt here..."
            }
            className="text-xs"
          />

          {docResult && (
            <div className="rounded-xl border border-primary/30 bg-surface-2 p-3.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-primary">{docResult.modeLabel}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px]"
                  onClick={() => {
                    updateEco((prev) => ({
                      ...prev,
                      knowledgeLibrary: [
                        {
                          id: `kdoc_${Date.now().toString(36)}`,
                          title: docTitle.trim() || `${subject} Summary`,
                          subject,
                          sourceType: "summary",
                          content: docResult.output,
                          tags: [subject.toLowerCase(), "document-companion"],
                          pinnedOffline: true,
                          createdAt: new Date().toISOString(),
                        },
                        ...prev.knowledgeLibrary,
                      ],
                    }));
                    toast.success("Saved summary to Knowledge Workspace!");
                  }}
                >
                  Save to Knowledge Workspace
                </Button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-foreground">
                {docResult.output}
              </pre>
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-foreground">
                Epistemic Check: {docResult.epistemicNote}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: KNOWLEDGE WORKSPACE */}
      {tab === "workspace" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="relative min-w-52 flex-1">
              <Search className="pointer-events-none absolute start-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                value={wsSearch}
                onChange={(e) => setWsSearch(e.target.value)}
                placeholder={
                  isAr
                    ? "ابحث في ملخصاتك وموادك المحفوظة..."
                    : "Filter summaries, AI tutor notes & topic collections..."
                }
                className="h-8 ps-8 text-xs"
              />
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Layers className="size-3.5 text-primary" />
                {eco.knowledgeLibrary.length} summaries
              </span>
              <span className="inline-flex items-center gap-1">
                <Link2 className="size-3.5 text-primary" />
                {eco.researchCitations.length} verified references
              </span>
            </div>
          </div>

          {filteredLibrary.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
              {isAr
                ? "لا توجد عناصر محفوظة مطابقة بعد. احفظ إجابات المعلم أو ملخصات الملفات لتظهر هنا دون تكرار."
                : "No matching knowledge items yet. Save an AI tutor insight or Document Companion summary to organize materials here without duplicates."}
            </div>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2 max-h-64 overflow-y-auto pe-1">
              {filteredLibrary.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border border-border bg-surface-2 p-3 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase text-primary">
                        {entry.subject} · {entry.sourceType.replace("_", " ")}
                      </div>
                      <div className="truncate font-semibold text-foreground">{entry.title}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateEco((prev) => ({
                          ...prev,
                          knowledgeLibrary: prev.knowledgeLibrary.filter((x) => x.id !== entry.id),
                        }))
                      }
                      className="text-muted-foreground hover:text-destructive p-1"
                      aria-label="Remove knowledge entry"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                  <p className="line-clamp-3 text-[11px] text-muted-foreground">{entry.content}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px]"
                    onClick={() => {
                      onAttachContext({
                        title: entry.title,
                        subject: entry.subject,
                        excerpt: entry.content.slice(0, 3500),
                      });
                      toast.success(`Attached "${entry.title}" to AI Tutor`);
                    }}
                  >
                    Discuss in AI Chat
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: COMPASSIONATE AI STUDY COACH */}
      {tab === "coach" && (
        <div className="space-y-3">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-[11px] text-foreground">
            {isAr
              ? "مدرب المذاكرة الداعم: نركز على خطوات واقعية متدرجة دون ضغط أو لوم إذا فاتك يوم دراسة."
              : "Supportive Study Coach: Focused on practical next steps and gentle schedule adjustments when tasks slip — never guilt or shame."}
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <Input
              value={coachGoal}
              onChange={(e) => setCoachGoal(e.target.value)}
              placeholder={
                isAr ? "١. الهدف الحالي (مثال: فهم الوحدة 3)" : "1. Current study target..."
              }
              className="text-xs"
            />
            <Input
              value={coachObstacle}
              onChange={(e) => setCoachObstacle(e.target.value)}
              placeholder={
                isAr ? "٢. العائق أو سبب التعثر..." : "2. Biggest bottleneck or fatigue point..."
              }
              className="text-xs"
            />
            <Input
              value={coachAdjustment}
              onChange={(e) => setCoachAdjustment(e.target.value)}
              placeholder={
                isAr
                  ? "٣. تعديل واقعي لجدول اليوم..."
                  : "3. Realistic adjustment (e.g., two 20m blocks)"
              }
              className="text-xs"
            />
            <Input
              value={coachReflection}
              onChange={(e) => setCoachReflection(e.target.value)}
              placeholder={
                isAr ? "٤. ما الذي سأبدأ به خلال 10 دقائق؟" : "4. First small 10-minute action..."
              }
              className="text-xs"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant="glow" onClick={handleSaveCoachCheckIn}>
              {isAr ? "حفظ جلسة التوجيه" : "Save Coaching Plan"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!coachGoal.trim()}
              onClick={() =>
                onSendPromptWithContext(
                  `Act as a compassionate study coach for ${subject}. My goal is "${coachGoal}". Obstacle: "${coachObstacle || "low focus"}". Give me a calm 3-step recovery plan distinguishing core must-dos from optional extras.`,
                )
              }
            >
              Ask AI Coach for Step-by-Step Breakdown
            </Button>
          </div>
          {eco.coachingReflections.length > 0 && (
            <div className="space-y-1.5 border-t border-border/60 pt-2">
              {eco.coachingReflections.slice(0, 3).map((refItem) => (
                <div
                  key={refItem.id}
                  className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-[11px]"
                >
                  <div className="font-semibold text-foreground">
                    {refItem.subject}: {refItem.goal}
                  </div>
                  <div className="text-muted-foreground">
                    Adjustment: {refItem.realisticAdjustment} · First step: {refItem.reflection}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
