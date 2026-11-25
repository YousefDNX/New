import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  BookMarked,
  Copyright,
  Database,
  Download,
  HeartHandshake,
  History,
  PlusCircle,
  RotateCcw,
  Search,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadTextFile } from "@/lib/safe-file";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModernSelect } from "@/components/ui/modern-select";
import { Textarea } from "@/components/ui/textarea";
import {
  type KnowledgeLegacyContribution,
  type ResourceLicense,
} from "@/data/open-learning-library";
import { deprecateLegacyContribution } from "@/lib/legacy-knowledge";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

export function KnowledgeLegacyPanel({
  onArchiveRecord,
  onInspireProject,
}: {
  onArchiveRecord?: (item: KnowledgeLegacyContribution) => void;
  onInspireProject?: (item: KnowledgeLegacyContribution) => void;
}) {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: eco, update: updateEco } = useStudentEcosystem();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // New Contribution Modal
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [contributorName, setContributorName] = useState("");
  const [contributorRole, setContributorRole] = useState<
    "student" | "teacher" | "volunteer_scholar"
  >("student");
  const [explanation, setExplanation] = useState("");
  const [license, setLicense] = useState<ResourceLicense>("CC-BY-4.0");

  // Deprecate Dialog (replaces forbidden window.prompt)
  const [deprecateTarget, setDeprecateTarget] = useState<KnowledgeLegacyContribution | null>(null);
  const [deprecateReason, setDeprecateReason] = useState(
    "Updated pedagogical curriculum clarifies or supersedes this earlier explanation.",
  );

  // Add Revision Version Dialog
  const [revisionTarget, setRevisionTarget] = useState<KnowledgeLegacyContribution | null>(null);
  const [revisionSummary, setRevisionSummary] = useState("");
  const [revisionReviewer, setRevisionReviewer] = useState("NEXORA Subject Educator");
  const [revisionBody, setRevisionBody] = useState("");

  const filteredContributions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return eco.legacyContributions.filter((c) => {
      if (roleFilter !== "all" && c.contributorRole !== roleFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [c.title, c.titleAr, c.subject, c.contributorName, c.originalExplanation]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [eco.legacyContributions, roleFilter, statusFilter, searchQuery]);

  const handleConfirmDeprecate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deprecateTarget || deprecateReason.trim().length < 8) {
      toast.error("Please provide a clear pedagogical deprecation rationale (8+ characters).");
      return;
    }
    const deprecated = deprecateLegacyContribution(deprecateTarget, deprecateReason.trim());
    updateEco((prev) => ({
      ...prev,
      legacyContributions: prev.legacyContributions.map((c) =>
        c.id === deprecateTarget.id ? deprecated : c,
      ),
    }));
    toast.success(`Marked '${deprecateTarget.title}' as deprecated with public notice.`);
    setDeprecateTarget(null);
  };

  const handleToggleArchiveStatus = (item: KnowledgeLegacyContribution) => {
    const nextStatus = item.status === "archived" ? "active" : "archived";
    updateEco((prev) => ({
      ...prev,
      legacyContributions: prev.legacyContributions.map((c) =>
        c.id === item.id
          ? {
              ...c,
              status: nextStatus,
              versionHistory: [
                ...c.versionHistory,
                {
                  version: c.versionHistory.length + 1,
                  date: new Date().toISOString().slice(0, 10),
                  changeSummary:
                    nextStatus === "archived"
                      ? "Preserved in read-only Legacy Archive (non-destructive archival)."
                      : "Restored to Active Legacy directory.",
                  reviewer: "NEXORA Knowledge Steward",
                },
              ],
            }
          : c,
      ),
    }));
    toast.success(
      nextStatus === "archived"
        ? `Archived '${item.title}' safely (never deleted).`
        : `Restored '${item.title}' to active status.`,
    );
  };

  const handleConfirmRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionTarget || revisionSummary.trim().length < 5) {
      toast.error("Enter a brief summary of what changed in this revision.");
      return;
    }
    updateEco((prev) => ({
      ...prev,
      legacyContributions: prev.legacyContributions.map((c) =>
        c.id === revisionTarget.id
          ? {
              ...c,
              originalExplanation: revisionBody.trim() || c.originalExplanation,
              versionHistory: [
                ...c.versionHistory,
                {
                  version: c.versionHistory.length + 1,
                  date: new Date().toISOString().slice(0, 10),
                  changeSummary: revisionSummary.trim(),
                  reviewer: revisionReviewer.trim() || "NEXORA Subject Educator",
                },
              ],
            }
          : c,
      ),
    }));
    toast.success(
      `Recorded v${revisionTarget.versionHistory.length + 1} for '${revisionTarget.title}'.`,
    );
    setRevisionTarget(null);
    setRevisionSummary("");
  };

  const handleDownloadContribution = (item: KnowledgeLegacyContribution) => {
    const markdown = [
      `# ${item.title} (${item.titleAr})`,
      "",
      `- **Subject:** ${item.subject}`,
      `- **Contributor:** ${item.contributorName} (${item.contributorRole})`,
      `- **License:** ${item.license}`,
      `- **Status:** ${item.status}`,
      `- **Approved Date:** ${item.approvedDate}`,
      "",
      "## Legal Authorship & Rights Retention",
      item.copyrightRetentionClause,
      "",
      "## Original Explanation & Study Notes",
      item.originalExplanation,
      "",
      "## Version History",
      ...item.versionHistory.map(
        (v) => `- v${v.version} (${v.date}): ${v.changeSummary} [Reviewed by ${v.reviewer}]`,
      ),
      "",
      item.deprecationNotice ? `> **Deprecation Notice:** ${item.deprecationNotice}` : "",
      "",
      "---",
      "NEXORA Knowledge Legacy Archive. Preserved for universal educational benefit.",
    ].join("\n");

    downloadTextFile(markdown, `legacy-${item.id}.md`, "text/markdown;charset=utf-8");
    toast.success(`Exported preserved contribution '${item.title}'.`);
  };

  const handleCreateContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 5) {
      toast.error("Enter a descriptive title for this original contribution.");
      return;
    }
    if (explanation.trim().length < 30) {
      toast.error("Provide a thorough original explanation (30+ characters).");
      return;
    }
    if (!contributorName.trim()) {
      toast.error("Enter author name or student pen name.");
      return;
    }

    const created: KnowledgeLegacyContribution = {
      id: `leg_contr_${Date.now()}`,
      title: title.trim(),
      titleAr: titleAr.trim() || title.trim(),
      contributorName: contributorName.trim(),
      contributorRole,
      subject: subject.trim(),
      originalExplanation: explanation.trim(),
      license,
      copyrightRetentionClause:
        "Contributor retains moral authorship; published under open Creative Commons OER license for ongoing student benefit.",
      approvedDate: new Date().toISOString().slice(0, 10),
      versionHistory: [
        {
          version: 1,
          date: new Date().toISOString().slice(0, 10),
          changeSummary: "Original contribution submitted and approved by educational moderators.",
          reviewer: "NEXORA Knowledge Stewardship Board",
        },
      ],
      status: "active",
    };

    updateEco((prev) => ({
      ...prev,
      legacyContributions: [created, ...prev.legacyContributions],
    }));

    toast.success(`Contribution '${created.title}' preserved in Knowledge Legacy.`);
    setIsSubmitOpen(false);
    setTitle("");
    setTitleAr("");
    setExplanation("");
    setContributorName("");
  };

  return (
    <div className="space-y-5" data-testid="knowledge-legacy-panel">
      {/* Banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-surface-card to-surface-2 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <BookMarked className="size-4" />
              <span>
                {isAr ? "إرث المعرفة والمساهمات الطلابية الأصيلة" : "NEXORA Knowledge Legacy"}
              </span>
            </div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Preserving Student &amp; Teacher Contributions for Future Generations
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              Original peer explanations, creative analogies, and teacher-verified study guides.
              Contributors retain their legal rights; nothing is deleted, only deprecated or
              archived with full version history. Zero personal student data is archived.
            </p>
          </div>

          <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="glow" className="h-8 text-xs">
                <PlusCircle className="size-3.5 me-1.5" />
                Submit Original Work
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                  <BookMarked className="size-4 text-primary" />
                  Preserve Original Explanation in Legacy Archive
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreateContribution} className="space-y-3 text-xs">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="leg-title">Contribution Title (English) *</Label>
                    <Input
                      id="leg-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Visual Proof of Pythagorean Theorem"
                      required
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="leg-title-ar">Title (Arabic, optional)</Label>
                    <Input
                      id="leg-title-ar"
                      value={titleAr}
                      onChange={(e) => setTitleAr(e.target.value)}
                      placeholder="العنوان بالعربية"
                      className="text-xs text-right"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label htmlFor="leg-subject">Subject *</Label>
                    <Input
                      id="leg-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Mathematics / Physics / History"
                      required
                      className="text-xs"
                    />
                  </div>
                  <ModernSelect
                    label="Contributor Role *"
                    value={contributorRole}
                    onValueChange={(v) =>
                      setContributorRole(v as "student" | "teacher" | "volunteer_scholar")
                    }
                    searchable={false}
                    options={[
                      { value: "student", label: "Student Peer Tutor" },
                      { value: "teacher", label: "Classroom Teacher" },
                      { value: "volunteer_scholar", label: "Volunteer Scholar" },
                    ]}
                  />
                  <ModernSelect
                    label="Open License *"
                    value={license}
                    onValueChange={(v) => setLicense(v as ResourceLicense)}
                    searchable={false}
                    options={[
                      { value: "CC-BY-4.0", label: "CC-BY 4.0" },
                      { value: "CC-BY-SA-4.0", label: "CC-BY-SA 4.0" },
                      { value: "NEXORA-OER-FREE", label: "NEXORA OER Free" },
                    ]}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="leg-author">Contributor Name (or Alias) *</Label>
                  <Input
                    id="leg-author"
                    value={contributorName}
                    onChange={(e) => setContributorName(e.target.value)}
                    placeholder="e.g., Yousef K. (Student Tutor)"
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="leg-explanation">Original Explanation / Concept Guide *</Label>
                  <Textarea
                    id="leg-explanation"
                    rows={6}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Explain the concept clearly in your own voice. Use analogies, step-by-step steps, or visual representations..."
                    required
                    className="text-xs leading-relaxed"
                  />
                </div>

                <div className="rounded-lg border border-border bg-surface-2/60 p-2.5 text-[11px] text-muted-foreground space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1">
                    <Copyright className="size-3.5 text-primary" />
                    <span>Authorship &amp; Rights Retention Notice</span>
                  </div>
                  <p>
                    You retain full moral and legal ownership of your original explanation.
                    Publishing here grants non-exclusive open access to students worldwide under
                    your selected Creative Commons license.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSubmitOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" variant="glow">
                    Preserve in Legacy
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid gap-3 sm:grid-cols-4 items-end rounded-2xl border border-border bg-surface-card p-4 text-xs">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="leg-search-input" className="text-xs font-semibold">
            Search Explanations &amp; Authors
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="leg-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Original explanations, authors, subjects..."
              className="min-h-[44px] ps-9 text-sm"
            />
          </div>
        </div>

        <ModernSelect
          label="Role Filter"
          value={roleFilter}
          onValueChange={setRoleFilter}
          searchable={false}
          options={[
            { value: "all", label: "All Roles" },
            { value: "student", label: "Student Tutors" },
            { value: "teacher", label: "Teachers" },
            { value: "volunteer_scholar", label: "Scholars" },
          ]}
        />

        <ModernSelect
          label="Status Filter"
          value={statusFilter}
          onValueChange={setStatusFilter}
          searchable={false}
          options={[
            { value: "all", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "deprecated_outdated", label: "Deprecated" },
            { value: "archived", label: "Archived" },
          ]}
        />
      </div>

      {/* Grid of Contributions */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredContributions.map((item) => (
          <div
            key={item.id}
            className={`surface-card flex flex-col justify-between space-y-3 p-4 transition-all ${
              item.status === "deprecated_outdated"
                ? "border-amber-500/40 bg-amber-500/5"
                : item.status === "archived"
                  ? "border-border/60 opacity-90"
                  : ""
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold uppercase tracking-wide text-primary">
                  {item.subject} · {item.contributorRole.replace(/_/g, " ")}
                </span>
                <span
                  className={`font-mono font-semibold ${
                    item.status === "active"
                      ? "text-emerald-500"
                      : item.status === "deprecated_outdated"
                        ? "text-amber-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {item.status === "active"
                    ? "Active Legacy"
                    : item.status === "deprecated_outdated"
                      ? "Deprecated"
                      : "Archived (Preserved)"}
                </span>
              </div>

              <div>
                <h3 className="font-display text-sm font-bold text-foreground">{item.title}</h3>
                {item.titleAr && (
                  <p className="text-[11px] text-muted-foreground font-arabic mt-0.5">
                    {item.titleAr}
                  </p>
                )}
              </div>

              {item.deprecationNotice && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-700 dark:text-amber-300 space-y-0.5">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="size-3" /> Deprecation Warning
                  </div>
                  <p>{item.deprecationNotice}</p>
                </div>
              )}

              <div className="rounded-lg border border-border/80 bg-surface-2/60 p-3 space-y-1.5 text-xs">
                <div className="font-semibold text-[10px] uppercase text-muted-foreground tracking-wide">
                  Original Explanation
                </div>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {item.originalExplanation}
                </p>
              </div>

              <div className="space-y-1 text-[11px] text-muted-foreground pt-1">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <UserCheck className="size-3.5 text-primary" />
                  <span>
                    Authored by {item.contributorName} · Approved {item.approvedDate}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground/80">
                  Rights: {item.copyrightRetentionClause}
                </div>
              </div>

              <div className="space-y-1 pt-1 border-t border-border/60">
                <div className="font-semibold text-[10px] text-muted-foreground flex items-center gap-1 tabular-nums">
                  <History className="size-3" /> Version History ({item.versionHistory.length})
                </div>
                {item.versionHistory.map((v, i) => (
                  <div key={i} className="text-[10px] font-mono text-muted-foreground">
                    v{v.version} ({v.date}): {v.changeSummary} · {v.reviewer}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
              <div className="font-mono text-[10px] text-muted-foreground">{item.license}</div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setRevisionTarget(item);
                    setRevisionBody(item.originalExplanation);
                    setRevisionSummary("");
                  }}
                  className="h-7 text-[10px]"
                >
                  + Revision
                </Button>

                {item.status === "active" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeprecateTarget(item)}
                    className="h-7 text-[10px] text-muted-foreground hover:text-amber-500"
                  >
                    Deprecate
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleArchiveStatus(item)}
                  className="h-7 text-[10px]"
                >
                  {item.status === "archived" ? (
                    <>
                      <RotateCcw className="size-3 me-1" />
                      Restore
                    </>
                  ) : (
                    <>
                      <Archive className="size-3 me-1" />
                      Archive
                    </>
                  )}
                </Button>

                {onArchiveRecord && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onArchiveRecord(item)}
                    className="h-7 text-[10px]"
                  >
                    <Database className="size-3 me-1 text-primary" />
                    Snapshot Archive
                  </Button>
                )}

                {onInspireProject && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onInspireProject(item)}
                    className="h-7 text-[10px]"
                  >
                    <HeartHandshake className="size-3 me-1 text-primary" />
                    Apply in Project
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadContribution(item)}
                  className="h-7 text-xs"
                >
                  <Download className="size-3 me-1 text-primary" />
                  Preserve (.md)
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Deprecate Reason Dialog */}
      <Dialog
        open={Boolean(deprecateTarget)}
        onOpenChange={(open) => !open && setDeprecateTarget(null)}
      >
        <DialogContent className="max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-bold">
              <AlertTriangle className="size-4 text-amber-500" />
              Deprecate Contribution With Public Notice
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConfirmDeprecate} className="space-y-3">
            <p className="text-muted-foreground">
              Preserving historical context: <strong>{deprecateTarget?.title}</strong> will remain
              readable with a warning banner instead of being deleted.
            </p>
            <div className="space-y-1">
              <Label htmlFor="dep-reason">Deprecation Reason *</Label>
              <Textarea
                id="dep-reason"
                rows={3}
                value={deprecateReason}
                onChange={(e) => setDeprecateReason(e.target.value)}
                required
                className="text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeprecateTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="glow">
                Mark Deprecated
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Revision Dialog */}
      <Dialog
        open={Boolean(revisionTarget)}
        onOpenChange={(open) => !open && setRevisionTarget(null)}
      >
        <DialogContent className="max-w-lg text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-bold">
              <History className="size-4 text-primary" />
              Add Version Revision — {revisionTarget?.title}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConfirmRevision} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="rev-summary">Change Summary *</Label>
              <Input
                id="rev-summary"
                value={revisionSummary}
                onChange={(e) => setRevisionSummary(e.target.value)}
                placeholder="e.g., Added bilingual step check and clarified units"
                required
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rev-reviewer">Reviewer / Educator *</Label>
              <Input
                id="rev-reviewer"
                value={revisionReviewer}
                onChange={(e) => setRevisionReviewer(e.target.value)}
                required
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rev-body">Updated Explanation Text</Label>
              <Textarea
                id="rev-body"
                rows={5}
                value={revisionBody}
                onChange={(e) => setRevisionBody(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRevisionTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="glow">
                Save Revision
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
