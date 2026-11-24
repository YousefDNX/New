import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FileText,
  FlaskConical,
  Link2,
  Plus,
  Scale,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePrefs } from "@/lib/preferences";
import { downloadTextFile } from "@/lib/safe-file";
import {
  useStudentEcosystem,
  type ResearchCitationRecord,
  type ResearchEvidenceEntry,
  type SourceReliabilityTier,
} from "@/lib/student-ecosystem";

const RESEARCH_MILESTONE_STEPS = [
  {
    id: "rq_narrow",
    en: "Narrow a testable, specific research question & explicit scope boundaries",
    ar: "تحديد سؤال بحثي دقيق ومحدد النطاق قابل للفحص",
  },
  {
    id: "rq_primary",
    en: "Collect at least two primary or peer-reviewed sources (no unverified links alone)",
    ar: "جمع مصدرين أساسيين أو محكّمين على الأقل",
  },
  {
    id: "rq_counter",
    en: "Log at least one contradicting or limiting finding in the comparison matrix",
    ar: "تدوين دليل معارض أو قيد منهجي واحد على الأقل في مصفوفة المقارنة",
  },
  {
    id: "rq_cite",
    en: "Verify author, publication year, and publisher details manually (never fabricate citations)",
    ar: "التحقق اليدوي من المؤلف وسنة النشر والناشر دون اختلاق مراجع",
  },
  {
    id: "rq_limits",
    en: "Document study limitations & open questions honestly",
    ar: "توثيق حدود الدراسة والأسئلة المفتوحة بأمانة علمية",
  },
];

export function formatAcademicCitation(params: {
  author: string;
  year: string;
  title: string;
  container: string;
  url: string;
  style: "APA" | "MLA" | "Chicago";
}): string {
  const author = params.author.trim() || "Unknown Author";
  const year = params.year.trim() || "n.d.";
  const title = params.title.trim() || "Untitled Source";
  const container = params.container.trim() || "Publication";
  const url = params.url.trim();

  if (params.style === "APA") {
    return `${author} (${year}). ${title}. ${container}.${url ? ` ${url}` : ""}`;
  }
  if (params.style === "MLA") {
    return `${author}. "${title}." ${container}, ${year}.${url ? ` ${url}.` : ""}`;
  }
  return `${author}. "${title}." ${container} (${year}).${url ? ` ${url}.` : ""}`;
}

const RELIABILITY_META: Record<
  SourceReliabilityTier,
  { en: string; ar: string; toneClass: string }
> = {
  peer_reviewed: {
    en: "Peer-Reviewed Journal / Textbook",
    ar: "مجلة محكّمة / مرجع أكاديمي",
    toneClass: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  },
  primary: {
    en: "Primary Dataset / Official Document",
    ar: "مصدر أولي / وثيقة رسمية",
    toneClass: "text-sky-400 border-sky-500/40 bg-sky-500/10",
  },
  secondary: {
    en: "Secondary Review / Journalism",
    ar: "مراجعة ثانوية / تقرير علمي",
    toneClass: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  },
  unverified: {
    en: "Unverified Claim — Corroboration Needed",
    ar: "ادعاء غير موثق — يحتاج تحققاً",
    toneClass: "text-rose-400 border-rose-500/40 bg-rose-500/10",
  },
};

export function ResearchDiscoveryLab() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: eco, update: updateEco } = useStudentEcosystem();

  const [projTitle, setProjTitle] = useState("");
  const [researchQuestion, setResearchQuestion] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [scope, setScope] = useState("");
  const [selectedProjId, setSelectedProjId] = useState<string>(eco.researchProjects[0]?.id ?? "");

  // Evidence composer state
  const [evClaim, setEvClaim] = useState("");
  const [evSource, setEvSource] = useState("");
  const [evYearOrUrl, setEvYearOrUrl] = useState("");
  const [evStance, setEvStance] = useState<"supporting" | "contradicting" | "neutral">(
    "supporting",
  );
  const [evReliability, setEvReliability] = useState<SourceReliabilityTier>("primary");

  // Citation organizer state
  const [citAuthor, setCitAuthor] = useState("");
  const [citYear, setCitYear] = useState("2025");
  const [citTitle, setCitTitle] = useState("");
  const [citContainer, setCitContainer] = useState("");
  const [citUrl, setCitUrl] = useState("");
  const [citStyle, setCitStyle] = useState<"APA" | "MLA" | "Chicago">("APA");
  const [citReliability, setCitReliability] = useState<SourceReliabilityTier>("peer_reviewed");

  const activeProject = useMemo(
    () =>
      eco.researchProjects.find((p) => p.id === selectedProjId) ?? eco.researchProjects[0] ?? null,
    [eco.researchProjects, selectedProjId],
  );

  const previewCitation = useMemo(
    () =>
      formatAcademicCitation({
        author: citAuthor,
        year: citYear,
        title: citTitle,
        container: citContainer,
        url: citUrl,
        style: citStyle,
      }),
    [citAuthor, citYear, citTitle, citContainer, citUrl, citStyle],
  );

  const handleCreateProject = () => {
    if (!projTitle.trim() || !researchQuestion.trim()) {
      toast.error(
        isAr
          ? "أدخل عنوان البحث والسؤال البحثي أولاً."
          : "Enter both a research title and specific research question.",
      );
      return;
    }
    const id = `res_${Date.now().toString(36)}`;
    updateEco((prev) => ({
      ...prev,
      researchProjects: [
        {
          id,
          title: projTitle.trim(),
          researchQuestion: researchQuestion.trim(),
          hypothesis: hypothesis.trim() || "Working null/alternative hypothesis pending evidence.",
          scope: scope.trim() || "Bounded classroom & peer-reviewed scope",
          evidenceItems: [],
          checklistDone: ["rq_narrow"],
          createdAt: new Date().toISOString(),
        },
        ...prev.researchProjects,
      ],
    }));
    setSelectedProjId(id);
    setProjTitle("");
    setResearchQuestion("");
    setHypothesis("");
    setScope("");
    toast.success(isAr ? "تم إنشاء ملف البحث العلمي" : "Research investigation created!");
  };

  const handleAddEvidence = () => {
    if (!activeProject || !evClaim.trim() || !evSource.trim()) {
      toast.error(
        isAr
          ? "أدخل الادعاء العلمي واسم المصدر للتحقق منه."
          : "Select or create an investigation and enter both a claim and source title.",
      );
      return;
    }
    const entry: ResearchEvidenceEntry = {
      id: `ev_${Date.now().toString(36)}`,
      claim: evClaim.trim(),
      sourceTitle: evSource.trim(),
      yearOrUrl: evYearOrUrl.trim() || "Verify URL / Year",
      reliability: evReliability,
      stance: evStance,
    };
    updateEco((prev) => ({
      ...prev,
      researchProjects: prev.researchProjects.map((proj) =>
        proj.id === activeProject.id
          ? { ...proj, evidenceItems: [entry, ...proj.evidenceItems] }
          : proj,
      ),
    }));
    setEvClaim("");
    setEvSource("");
    setEvYearOrUrl("");
    toast.success(
      evReliability === "unverified"
        ? "Logged as Unverified — corroborate with a primary source before citing."
        : "Added evidence row to comparison matrix.",
    );
  };

  const handleToggleChecklist = (stepId: string) => {
    if (!activeProject) return;
    updateEco((prev) => ({
      ...prev,
      researchProjects: prev.researchProjects.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        const done = proj.checklistDone.includes(stepId)
          ? proj.checklistDone.filter((x) => x !== stepId)
          : [...proj.checklistDone, stepId];
        return { ...proj, checklistDone: done };
      }),
    }));
  };

  const handleSaveCitation = () => {
    if (!citAuthor.trim() || !citTitle.trim()) {
      toast.error(
        isAr
          ? "أدخل اسم المؤلف وعنوان المصدر الموثق."
          : "Enter verified author and source title before saving a citation.",
      );
      return;
    }
    const rec: ResearchCitationRecord = {
      id: `cit_${Date.now().toString(36)}`,
      author: citAuthor.trim(),
      year: citYear.trim() || "n.d.",
      title: citTitle.trim(),
      container: citContainer.trim() || "Reference",
      url: citUrl.trim(),
      reliability: citReliability,
      style: citStyle,
      formatted: previewCitation,
      createdAt: new Date().toISOString(),
    };
    updateEco((prev) => ({
      ...prev,
      researchCitations: [rec, ...prev.researchCitations],
    }));
    setCitAuthor("");
    setCitTitle("");
    setCitContainer("");
    setCitUrl("");
    toast.success(isAr ? "تم حفظ المرجع في قائمة المراجع" : `Saved ${citStyle} citation reference`);
  };

  const supportingCount =
    activeProject?.evidenceItems.filter((e) => e.stance === "supporting").length ?? 0;
  const contradictingCount =
    activeProject?.evidenceItems.filter((e) => e.stance === "contradicting").length ?? 0;
  const unverifiedCount =
    activeProject?.evidenceItems.filter((e) => e.reliability === "unverified").length ?? 0;

  return (
    <div className="space-y-5" data-testid="research-discovery-lab">
      {/* Header & Integrity Notice */}
      <div className="surface-card p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <FlaskConical className="size-5 text-primary" />
              <span>{isAr ? "مختبر البحث العلمي وتقييم المصادر" : "Research & Discovery Lab"}</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "صياغة الأسئلة البحثية، موازنة الأدلة المؤيدة والمعارضة، فحص موثوقية المصادر، وتنسيق المراجع بأمانة علمية."
                : "Formulate bounded research questions, compare supporting vs. contradicting evidence, grade source reliability, and organize verified APA/MLA/Chicago citations."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono tabular-nums text-xs font-semibold text-primary">
              {eco.researchProjects.length} {isAr ? "أبحاث" : "projects"} ·{" "}
              {eco.researchCitations.length} {isAr ? "مراجع" : "citations"}
            </span>
            <FeatureGuideTrigger featureId="knowledge-tools" />
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-foreground">
          <ShieldAlert className="size-4 shrink-0 text-amber-500 mt-0.5" />
          <span>
            {isAr
              ? "ضابط الأمانة البحثية: لا تخترع أو تقبل مراجع غير محققة. كل مرجع يُحفظ هنا يتطلب مؤلفاً ومصدراً حقيقيين تحققت منهما بنفسك."
              : "Research Integrity Rule: Never fabricate citations or treat uncorroborated claims as settled facts. Only save references whose author, year, and publication you directly inspected."}
          </span>
        </div>
      </div>

      {/* Section 1: Research Question Builder + Active Project Selector */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="surface-card p-5 space-y-3 text-xs">
          <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <span>
              {isAr ? "١. منشئ السؤال البحثي والفرضية" : "1. Research Question & Scope Builder"}
            </span>
          </h3>
          <Input
            value={projTitle}
            onChange={(e) => setProjTitle(e.target.value)}
            placeholder={
              isAr
                ? "عنوان التحقيق (مثال: أثر التشجير المدرسي على حرارة الفناء)"
                : "Investigation title (e.g., Courtyard Shade Trees & Midday Heat)"
            }
            className="text-xs"
          />
          <Textarea
            rows={2}
            value={researchQuestion}
            onChange={(e) => setResearchQuestion(e.target.value)}
            placeholder={
              isAr
                ? "السؤال البحثي الدقيق القابل للقياس..."
                : "Specific, testable research question..."
            }
            className="text-xs"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder={
                isAr ? "الفرضية المبدئية..." : "Testable hypothesis / expected mechanism..."
              }
              className="text-xs"
            />
            <Input
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder={
                isAr ? "نطاق وحدود الدراسة..." : "Scope & limits (e.g., 4 weeks, 1 campus)"
              }
              className="text-xs"
            />
          </div>
          <Button type="button" size="sm" variant="glow" onClick={handleCreateProject}>
            <Plus className="size-3.5" />
            <span>{isAr ? "إنشاء مشروع بحثي" : "Start Research Investigation"}</span>
          </Button>

          {eco.researchProjects.length > 0 && (
            <div className="border-t border-border/60 pt-3 space-y-1.5">
              <div className="font-semibold text-muted-foreground">
                {isAr ? "الأبحاث المحفوظة:" : "Your Saved Investigations:"}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {eco.researchProjects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProjId(p.id)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                      activeProject?.id === p.id
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Evidence Comparison Matrix + Milestones */}
        <div className="surface-card p-5 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <Scale className="size-4 text-primary" />
              <span>
                {isAr
                  ? "٢. مصفوفة مقارنة الأدلة والموثوقية"
                  : "2. Evidence Comparison Matrix & Rigor Check"}
              </span>
            </h3>
            {activeProject && (
              <span className="font-mono tabular-nums text-[11px] text-muted-foreground">
                +{supportingCount} for · {contradictingCount} counter · {unverifiedCount} unverified
              </span>
            )}
          </div>

          {!activeProject ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
              {isAr
                ? "أنشئ تحقيقاً بحثياً أولاً لتبدأ مقارنة الأدلة المؤيدة والمعارضة."
                : "Create or select a research investigation on the left to log supporting and contradicting evidence."}
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border bg-surface-2/60 p-3 space-y-1">
                <div className="font-bold text-foreground">{activeProject.title}</div>
                <div className="text-muted-foreground">Q: {activeProject.researchQuestion}</div>
                <div className="text-[11px] text-primary">Scope: {activeProject.scope}</div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  value={evClaim}
                  onChange={(e) => setEvClaim(e.target.value)}
                  placeholder={isAr ? "النتيجة أو الملاحظة..." : "Observed finding or claim..."}
                  className="text-xs"
                />
                <Input
                  value={evSource}
                  onChange={(e) => setEvSource(e.target.value)}
                  placeholder={
                    isAr ? "المصدر (كتاب، دراسة، موقع)..." : "Source title or dataset..."
                  }
                  className="text-xs"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <select
                  aria-label="Evidence stance"
                  value={evStance}
                  onChange={(e) =>
                    setEvStance(e.target.value as "supporting" | "contradicting" | "neutral")
                  }
                  className="h-8 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
                >
                  <option value="supporting">
                    {isAr ? "يدعم الفرضية" : "Supporting Evidence"}
                  </option>
                  <option value="contradicting">
                    {isAr ? "يعارض / يقيد الفرضية" : "Contradicting / Limiting"}
                  </option>
                  <option value="neutral">{isAr ? "سياق محايد" : "Neutral Context"}</option>
                </select>
                <select
                  aria-label="Source reliability"
                  value={evReliability}
                  onChange={(e) => setEvReliability(e.target.value as SourceReliabilityTier)}
                  className="h-8 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
                >
                  <option value="peer_reviewed">Peer-Reviewed</option>
                  <option value="primary">Primary Source</option>
                  <option value="secondary">Secondary Summary</option>
                  <option value="unverified">Unverified Claim</option>
                </select>
                <Input
                  value={evYearOrUrl}
                  onChange={(e) => setEvYearOrUrl(e.target.value)}
                  placeholder={isAr ? "السنة / الرابط" : "Year / DOI / URL"}
                  className="h-8 text-xs"
                />
              </div>

              <Button type="button" size="sm" variant="outline" onClick={handleAddEvidence}>
                <Plus className="size-3.5" />
                <span>{isAr ? "إضافة دليل للمصفوفة" : "Add Evidence Entry"}</span>
              </Button>

              {activeProject.evidenceItems.length > 0 && (
                <div className="max-h-44 space-y-1.5 overflow-y-auto pe-1">
                  {activeProject.evidenceItems.map((ev) => {
                    const tierMeta = RELIABILITY_META[ev.reliability];
                    return (
                      <div
                        key={ev.id}
                        className="rounded-lg border border-border bg-surface-2 p-2.5 space-y-1"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-foreground uppercase text-[10px]">
                            {ev.stance}
                          </span>
                          <span
                            className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${tierMeta.toneClass}`}
                          >
                            {isAr ? tierMeta.ar : tierMeta.en}
                          </span>
                        </div>
                        <p className="text-foreground">{ev.claim}</p>
                        <div className="text-[11px] text-muted-foreground">
                          {ev.sourceTitle} · {ev.yearOrUrl}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Research Rigor Milestones */}
              <div className="border-t border-border/60 pt-2.5 space-y-1.5">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <ClipboardCheck className="size-3.5 text-primary" />
                  <span>
                    {isAr ? "قائمة تحقق المنهجية البحثية" : "Research Methodology Checklist"} (
                    {activeProject.checklistDone.length}/{RESEARCH_MILESTONE_STEPS.length})
                  </span>
                </div>
                <div className="grid gap-1">
                  {RESEARCH_MILESTONE_STEPS.map((st) => {
                    const checked = activeProject.checklistDone.includes(st.id);
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleToggleChecklist(st.id)}
                        className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-start text-[11px] ${
                          checked
                            ? "border-emerald-500/40 bg-emerald-500/10 text-foreground"
                            : "border-border bg-surface-1 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span>{isAr ? st.ar : st.en}</span>
                        <CheckCircle2
                          className={`size-3.5 shrink-0 ${checked ? "text-emerald-400" : "opacity-30"}`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Section 3: Verified Citation & Reference Organizer */}
      <div className="surface-card p-5 space-y-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <Link2 className="size-4 text-primary" />
              <span>
                {isAr
                  ? "٣. منسق المراجع والاستشهادات العلمية الموثقة"
                  : "3. Verified Citation & Reference Organizer (APA / MLA / Chicago)"}
              </span>
            </h3>
            <p className="text-muted-foreground">
              {isAr
                ? "انسخ المرجع المنسق أو صدّر قائمة مراجعك بصيغة Markdown."
                : "Format only sources you have personally read & verified, then copy or export Markdown bibliographies."}
            </p>
          </div>
          {eco.researchCitations.length > 0 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                const md = [
                  "# Verified Research Bibliography",
                  "",
                  ...eco.researchCitations.map(
                    (c, idx) => `${idx + 1}. [${c.style} · ${c.reliability}] ${c.formatted}`,
                  ),
                ].join("\n");
                downloadTextFile(
                  md,
                  `research-bibliography-${new Date().toISOString().slice(0, 10)}.md`,
                  "text/markdown;charset=utf-8",
                );
              }}
            >
              Export Bibliography (.md)
            </Button>
          )}
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            value={citAuthor}
            onChange={(e) => setCitAuthor(e.target.value)}
            placeholder={isAr ? "المؤلف (مثال: الريس، م.)" : "Author (e.g., Al-Mutairi, N.)"}
            className="text-xs"
          />
          <Input
            value={citYear}
            onChange={(e) => setCitYear(e.target.value)}
            placeholder="Year (2025)"
            className="text-xs font-mono"
          />
          <Input
            value={citTitle}
            onChange={(e) => setCitTitle(e.target.value)}
            placeholder={isAr ? "عنوان الورقة أو الكتاب..." : "Article or Book Title..."}
            className="text-xs"
          />
          <Input
            value={citContainer}
            onChange={(e) => setCitContainer(e.target.value)}
            placeholder={isAr ? "المجلة أو الناشر..." : "Journal / Publisher..."}
            className="text-xs"
          />
          <Input
            value={citUrl}
            onChange={(e) => setCitUrl(e.target.value)}
            placeholder="DOI or official URL (optional)"
            className="text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {(["APA", "MLA", "Chicago"] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setCitStyle(style)}
                className={`rounded-md border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
                  citStyle === style
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-surface-2 text-muted-foreground"
                }`}
              >
                {style}
              </button>
            ))}
            <select
              aria-label="Citation reliability tier"
              value={citReliability}
              onChange={(e) => setCitReliability(e.target.value as SourceReliabilityTier)}
              className="h-8 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
            >
              <option value="peer_reviewed">Peer-Reviewed</option>
              <option value="primary">Primary Source</option>
              <option value="secondary">Secondary Review</option>
              <option value="unverified">Needs Verification</option>
            </select>
          </div>
          <Button type="button" size="sm" variant="glow" onClick={handleSaveCitation}>
            <BookOpenCheck className="size-3.5" />
            <span>{isAr ? "حفظ المرجع الموثق" : "Save Verified Reference"}</span>
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-surface-2/60 p-3 font-mono text-[11px] text-foreground">
          <span className="text-primary font-bold">Live Preview ({citStyle}): </span>
          {previewCitation}
        </div>

        {citReliability === "unverified" && (
          <div className="flex items-center gap-2 text-[11px] text-rose-400">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>
              Flagged as unverified — confirm primary source details before submitting in academic
              work.
            </span>
          </div>
        )}

        {eco.researchCitations.length > 0 && (
          <div className="space-y-2 pt-1">
            {eco.researchCitations.map((cit) => (
              <div
                key={cit.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="font-bold text-primary">{cit.style}</span>
                    <span
                      className={`rounded border px-1.5 py-0.5 font-semibold ${RELIABILITY_META[cit.reliability].toneClass}`}
                    >
                      {RELIABILITY_META[cit.reliability].en}
                    </span>
                  </div>
                  <div className="text-foreground break-words">{cit.formatted}</div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => {
                      void navigator.clipboard.writeText(cit.formatted);
                      toast.success("Copied citation!");
                    }}
                    aria-label="Copy citation"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-destructive"
                    onClick={() =>
                      updateEco((prev) => ({
                        ...prev,
                        researchCitations: prev.researchCitations.filter((x) => x.id !== cit.id),
                      }))
                    }
                    aria-label="Delete citation"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
