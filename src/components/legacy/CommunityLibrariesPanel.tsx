import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Flag,
  GraduationCap,
  PlusCircle,
  Search,
  ShieldCheck,
  Sparkles,
  WifiOff,
  XCircle,
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
  type CommunityCollectionKind,
  type CommunityLibraryResource,
  type CommunityResourceKind,
  type ErrorReportKind,
  type ResourceLicense,
} from "@/data/open-learning-library";
import { useUser } from "@/hooks/use-nexora";
import {
  loadCommunityResourcesFromFirestore,
  saveCommunityResourceToFirestore,
  submitContentErrorReportToFirestore,
  updateCommunityResourceModerationInFirestore,
} from "@/lib/legacy-firestore";
import {
  filterCommunityLibraryResources,
  validateCommunityResourceSubmission,
  validateErrorReportInput,
  type ContentErrorReport,
} from "@/lib/legacy-knowledge";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

export function CommunityLibrariesPanel({
  onPromoteToLegacy,
}: {
  onPromoteToLegacy?: (resource: CommunityLibraryResource) => void;
}) {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { data: user } = useUser();
  const { state: eco, update: updateEco } = useStudentEcosystem();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<"all" | CommunityCollectionKind>(
    "all",
  );
  const [selectedKind, setSelectedKind] = useState<"all" | CommunityResourceKind>("all");
  const [selectedGradeBand, setSelectedGradeBand] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<"all" | "en" | "ar" | "bilingual">(
    "all",
  );
  const [downloadableOnly, setDownloadableOnly] = useState(false);
  const [teacherCuratedOnly, setTeacherCuratedOnly] = useState(false);
  const [lowBandwidthView, setLowBandwidthView] = useState(false);
  const [showReviewQueue, setShowReviewQueue] = useState(false);

  // New Resource Submission Modal
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTitleAr, setNewTitleAr] = useState("");
  const [newSubject, setNewSubject] = useState("Mathematics");
  const [newCollection, setNewCollection] = useState<CommunityCollectionKind>("foundational");
  const [newKind, setNewKind] = useState<CommunityResourceKind>("lesson");
  const [newGradeBand, setNewGradeBand] = useState("Grade 6-9");
  const [newLanguage, setNewLanguage] = useState<"en" | "ar" | "bilingual">("en");
  const [newLevel, setNewLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [newSummary, setNewSummary] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newLicense] = useState<ResourceLicense>("CC-BY-4.0");

  // Error Reporting Dialog State
  const [reportingResource, setReportingResource] = useState<CommunityLibraryResource | null>(null);
  const [reportKind, setReportKind] = useState<ErrorReportKind>("factual_error");
  const [reportDetails, setReportDetails] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const cloudItems = await loadCommunityResourcesFromFirestore(user?.uid ?? null);
        if (!active || cloudItems.length === 0) return;
        updateEco((prev) => {
          const byId = new Map(prev.communityResources.map((r) => [r.id, r]));
          for (const item of cloudItems) {
            byId.set(item.id, item);
          }
          return { ...prev, communityResources: Array.from(byId.values()) };
        });
      } catch {
        /* fallback cleanly to local community resources */
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.uid, updateEco]);

  const pendingReviewResources = useMemo(() => {
    return eco.communityResources.filter(
      (r) =>
        r.reviewStatus === "pending_review" ||
        r.reviewStatus === "under_review" ||
        r.reviewStatus === "needs_correction",
    );
  }, [eco.communityResources]);

  const filteredResources = useMemo(() => {
    return filterCommunityLibraryResources(
      eco.communityResources,
      {
        query: searchQuery,
        collection: selectedCollection,
        resourceKind: selectedKind,
        gradeBand: selectedGradeBand,
        language: selectedLanguage,
        downloadableOnly,
        teacherCuratedOnly,
        includePendingReview: false,
      },
      eco.resourceStatusOverrides,
    );
  }, [
    eco.communityResources,
    eco.resourceStatusOverrides,
    searchQuery,
    selectedCollection,
    selectedKind,
    selectedGradeBand,
    selectedLanguage,
    downloadableOnly,
    teacherCuratedOnly,
  ]);

  const handleDownloadResource = (res: CommunityLibraryResource) => {
    if (!res.isDownloadablePermitted) {
      toast.error("This resource is marked reference-only and cannot be exported for offline use.");
      return;
    }
    const markdown = [
      `# ${res.title} (${res.titleAr})`,
      "",
      `- **Collection:** ${res.collection} · **Subject:** ${res.subject} · **Level:** ${res.level}`,
      `- **Grade Band:** ${res.gradeBand} · **Resource Kind:** ${res.resourceKind} · **Language:** ${res.language}`,
      `- **Author:** ${res.author} (${res.authorRole})`,
      `- **License:** ${res.license}`,
      `- **Attribution:** ${res.sourceAttribution}`,
      `- **Quality Rating:** Clarity ${res.qualityScore.clarity}/5 · Accuracy ${res.qualityScore.accuracy}/5`,
      "",
      "## Learning Objectives",
      ...res.learningObjectives.map((o) => `- ${o}`),
      "",
      "## Summary",
      res.summary,
      "",
      "## Educational Content",
      res.content,
      "",
      "---",
      "Exported from NEXORA Community Libraries. Open educational material with preserved attribution.",
    ].join("\n");

    downloadTextFile(
      markdown,
      `${res.id}-${res.gradeBand.toLowerCase().replace(/\s+/g, "-")}.md`,
      "text/markdown;charset=utf-8",
    );
    toast.success(`Downloaded '${res.title}' (${Math.round(res.downloadSizeBytes / 1024)} KB).`);
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCommunityResourceSubmission({
      title: newTitle,
      subject: newSubject,
      collection: newCollection,
      resourceKind: newKind,
      content: newContent,
      author: newAuthor,
      sourceAttribution: newSource,
      license: newLicense,
    });

    if (!validation.ok) {
      toast.error(validation.reason);
      return;
    }

    const created: CommunityLibraryResource = {
      id: `com_lib_${Date.now()}`,
      title: newTitle.trim(),
      titleAr: newTitleAr.trim() || newTitle.trim(),
      collection: newCollection,
      resourceKind: newKind,
      subject: newSubject.trim(),
      gradeBand: newGradeBand,
      level: newLevel,
      language: newLanguage,
      learningObjectives: [newSummary.trim().slice(0, 100) || "Master core concept step-by-step."],
      summary: newSummary.trim() || newContent.trim().slice(0, 120),
      content: newContent.trim(),
      author: newAuthor.trim() || "Community Educator",
      authorRole: "approved_contributor",
      sourceAttribution: newSource.trim(),
      license: newLicense,
      isDownloadablePermitted: true,
      downloadSizeBytes: newContent.length * 2,
      teacherCurated: false,
      reviewStatus: "pending_review",
      lastReviewedDate: new Date().toISOString().slice(0, 10),
      qualityScore: { clarity: 4, depth: 4, accuracy: 4, accessibility: 5 },
    };

    updateEco((prev) => ({
      ...prev,
      communityResources: [created, ...prev.communityResources],
    }));

    if (user?.uid) {
      try {
        await saveCommunityResourceToFirestore(user.uid, created);
      } catch {
        /* queued locally; review queue remains active */
      }
    }

    toast.success(
      `Resource '${created.title}' submitted to Educator Review Queue (status: pending_review).`,
    );
    setShowReviewQueue(true);
    setIsSubmitOpen(false);
    setNewTitle("");
    setNewTitleAr("");
    setNewSummary("");
    setNewContent("");
    setNewAuthor("");
    setNewSource("");
  };

  const handleModerateResource = async (
    resource: CommunityLibraryResource,
    decision: "approved" | "needs_correction",
  ) => {
    const today = new Date().toISOString().slice(0, 10);
    updateEco((prev) => ({
      ...prev,
      communityResources: prev.communityResources.map((r) =>
        r.id === resource.id
          ? {
              ...r,
              reviewStatus: decision,
              teacherCurated: decision === "approved" ? true : r.teacherCurated,
              lastReviewedDate: today,
            }
          : r,
      ),
    }));

    if (user?.uid) {
      try {
        await updateCommunityResourceModerationInFirestore(
          resource.id,
          decision,
          decision === "approved",
        );
      } catch {
        /* non-fatal local update applied */
      }
    }

    toast.success(
      decision === "approved"
        ? `Approved '${resource.title}' for Community Libraries catalog.`
        : `Marked '${resource.title}' as needs_correction for contributor revision.`,
    );
  };

  const handleSubmitErrorReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingResource) return;

    const validation = validateErrorReportInput({
      resourceId: reportingResource.id,
      details: reportDetails,
    });
    if (!validation.ok) {
      toast.error(validation.reason);
      return;
    }

    const report: ContentErrorReport = {
      id: `err_${Date.now()}`,
      resourceId: reportingResource.id,
      resourceTitle: reportingResource.title,
      kind: reportKind,
      details: reportDetails.trim(),
      reportedAt: new Date().toISOString(),
      status: "open",
    };

    updateEco((prev) => ({
      ...prev,
      contentErrorReports: [report, ...prev.contentErrorReports],
      resourceStatusOverrides: {
        ...prev.resourceStatusOverrides,
        [reportingResource.id]: {
          reviewStatus: "needs_correction",
          lastReviewedDate: new Date().toISOString().slice(0, 10),
          correctionHistory: [
            {
              date: new Date().toISOString().slice(0, 10),
              summary: `Flagged (${reportKind}): ${report.details.slice(0, 90)}`,
              reviewerRole: "moderator",
            },
          ],
        },
      },
    }));

    if (user?.uid) {
      try {
        await submitContentErrorReportToFirestore(user.uid, report);
      } catch {
        /* locally preserved */
      }
    }

    toast.success(
      `Reported issue on '${reportingResource.title}' and paused downloads until reviewed.`,
    );
    setReportingResource(null);
    setReportDetails("");
  };

  return (
    <div className="space-y-5" data-testid="community-libraries-panel">
      {/* Header Banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-surface-card to-surface-2 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <BookOpen className="size-4" />
              <span>
                {isAr ? "مكتبات نيكسورا المجتمعية المفتوحة" : "NEXORA Community Libraries"}
              </span>
            </div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Structured Open Educational Knowledge &amp; Teacher Collections
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              Organized by subject, grade band, language, and verified learning objectives. Every
              submission enters educator moderation before publication. Copyrighted scans and
              student PII are strictly rejected.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={showReviewQueue ? "secondary" : "outline"}
              onClick={() => setShowReviewQueue((v) => !v)}
              className="h-8 text-xs"
            >
              <ClipboardCheck className="size-3.5 me-1.5 text-primary" />
              Review Queue ({pendingReviewResources.length})
            </Button>

            <Button
              type="button"
              size="sm"
              variant={lowBandwidthView ? "secondary" : "outline"}
              onClick={() => setLowBandwidthView(!lowBandwidthView)}
              className="h-8 text-xs"
              title="Toggle text-only low-data mode"
            >
              <WifiOff className="size-3.5 me-1.5 text-primary" />
              {lowBandwidthView ? "Standard View" : "Low-Bandwidth Mode"}
            </Button>

            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="glow" className="h-8 text-xs">
                  <PlusCircle className="size-3.5 me-1.5" />
                  Submit Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base font-bold">
                    <Sparkles className="size-4 text-primary" />
                    Submit to Community Libraries Review Queue
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateResource} className="space-y-3.5 text-xs">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="res-title">Title (English) *</Label>
                      <Input
                        id="res-title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g., Visual Fraction Mastery Guide"
                        required
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="res-title-ar">Title (Arabic, optional)</Label>
                      <Input
                        id="res-title-ar"
                        value={newTitleAr}
                        onChange={(e) => setNewTitleAr(e.target.value)}
                        placeholder="العنوان بالعربية"
                        className="text-xs text-right"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <ModernSelect
                      label="Collection *"
                      value={newCollection}
                      onValueChange={(v) => setNewCollection(v as CommunityCollectionKind)}
                      searchable
                      searchPlaceholder="Search collections..."
                      options={[
                        { value: "foundational", label: "Foundational Learning" },
                        { value: "science", label: "Science Fundamentals" },
                        { value: "languages", label: "Languages & Grammar" },
                        { value: "mathematics", label: "Mathematics" },
                        { value: "life_skills", label: "Life Skills & Safety" },
                        { value: "teacher_curated", label: "Teacher Curated" },
                      ]}
                    />

                    <ModernSelect
                      label="Resource Kind *"
                      value={newKind}
                      onValueChange={(v) => setNewKind(v as CommunityResourceKind)}
                      searchable
                      searchPlaceholder="Search resource kinds..."
                      options={[
                        { value: "lesson", label: "Structured Lesson" },
                        { value: "worksheet", label: "Printable Worksheet" },
                        { value: "guide", label: "Practical Guide" },
                        { value: "reference", label: "Reference / Vocabulary" },
                        { value: "book", label: "Open Book Chapter" },
                      ]}
                    />

                    <ModernSelect
                      label="Grade Band *"
                      value={newGradeBand}
                      onValueChange={setNewGradeBand}
                      searchable
                      searchPlaceholder="Search grades..."
                      options={[
                        { value: "Grade 1-4", label: "Primary (Grade 1-4)" },
                        { value: "Grade 5-7", label: "Middle (Grade 5-7)" },
                        { value: "Grade 6-9", label: "Middle / Secondary (Grade 6-9)" },
                        { value: "Grade 8-10", label: "Secondary (Grade 8-10)" },
                        { value: "Grade 11-12", label: "High School (11-12)" },
                        { value: "Universal", label: "Universal All Levels" },
                      ]}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="res-subject">Subject *</Label>
                      <Input
                        id="res-subject"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        required
                        className="min-h-[44px] text-sm"
                      />
                    </div>
                    <ModernSelect
                      label="Language *"
                      value={newLanguage}
                      onValueChange={(v) => setNewLanguage(v as "en" | "ar" | "bilingual")}
                      searchable={false}
                      options={[
                        { value: "en", label: "English" },
                        { value: "ar", label: "Arabic" },
                        { value: "bilingual", label: "Bilingual (AR / EN)" },
                      ]}
                    />
                    <ModernSelect
                      label="Difficulty Level *"
                      value={newLevel}
                      onValueChange={(v) =>
                        setNewLevel(v as "beginner" | "intermediate" | "advanced")
                      }
                      searchable={false}
                      options={[
                        { value: "beginner", label: "Beginner" },
                        { value: "intermediate", label: "Intermediate" },
                        { value: "advanced", label: "Advanced" },
                      ]}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="res-author">Author / Maintainer Name *</Label>
                    <Input
                      id="res-author"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="e.g., Laila Ibrahim (Physics Specialist)"
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="res-source">Source Reference / Citation *</Label>
                    <Input
                      id="res-source"
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value)}
                      placeholder="e.g., OpenStax Prealgebra (CC-BY 4.0) or Original Classroom Materials"
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="res-summary">Brief Learning Objective Summary *</Label>
                    <Input
                      id="res-summary"
                      value={newSummary}
                      onChange={(e) => setNewSummary(e.target.value)}
                      placeholder="One sentence explaining what the student will learn"
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="res-content">Lesson Content / Body *</Label>
                    <Textarea
                      id="res-content"
                      rows={5}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Write the clear educational concept, step-by-step instructions, or worked examples..."
                      required
                      className="text-xs font-sans leading-relaxed"
                    />
                  </div>

                  <div className="rounded-lg border border-border/70 bg-surface-2/60 p-2.5 text-[11px] text-muted-foreground space-y-1">
                    <div className="font-semibold text-foreground">
                      Copyright &amp; Moderation Workflow Notice
                    </div>
                    <p>
                      Submitted items enter the Educator Review Queue (status:{" "}
                      <code>pending_review</code>) before becoming public. You retain original
                      authorship under CC-BY 4.0. Copyrighted textbook scans and PII are excluded.
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
                      Submit for Review
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Educator Moderation & Submission Review Queue */}
      {showReviewQueue && (
        <div
          className="surface-card border-primary/30 space-y-3 p-4 text-xs"
          data-testid="community-review-queue"
        >
          <div className="flex items-center justify-between">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <ClipboardCheck className="size-4 text-primary" />
              <span>
                Educator Submission Review Queue ({pendingReviewResources.length} awaiting review)
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Verify attribution, accuracy, and open licensing before publishing
            </span>
          </div>

          {pendingReviewResources.length === 0 ? (
            <p className="text-muted-foreground text-[11px]">
              All community submissions have been reviewed cleanly.
            </p>
          ) : (
            <div className="space-y-2">
              {pendingReviewResources.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface-2 p-3"
                >
                  <div className="space-y-0.5 min-w-[200px] flex-1">
                    <div className="font-semibold text-foreground">
                      {item.title}{" "}
                      <span className="font-mono text-[10px] text-amber-500">
                        [{item.reviewStatus}]
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      By {item.author} · Source: {item.sourceAttribution} · {item.license}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="glow"
                      onClick={() => void handleModerateResource(item, "approved")}
                      className="h-7 text-[11px]"
                    >
                      <CheckCircle2 className="size-3 me-1" />
                      Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleModerateResource(item, "needs_correction")}
                      className="h-7 text-[11px]"
                    >
                      <XCircle className="size-3 me-1" />
                      Request Revision
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter and Discovery Bar */}
      <div className="space-y-3 rounded-2xl border border-border bg-surface-card p-4 text-xs">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <Label htmlFor="com-lib-search" className="text-xs font-semibold">
              Search Catalog
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="com-lib-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Collections, subjects, authors..."
                className="min-h-[44px] ps-9 text-sm"
              />
            </div>
          </div>

          <ModernSelect
            label="Collection"
            value={selectedCollection}
            onValueChange={(v) => setSelectedCollection(v as "all" | CommunityCollectionKind)}
            searchable
            searchPlaceholder="Filter collections..."
            options={[
              { value: "all", label: "All Collections" },
              { value: "foundational", label: "Foundational Learning" },
              { value: "science", label: "Science Fundamentals" },
              { value: "languages", label: "Languages & Grammar" },
              { value: "mathematics", label: "Mathematics" },
              { value: "life_skills", label: "Life Skills & Safety" },
              { value: "teacher_curated", label: "Teacher Curated" },
            ]}
          />

          <ModernSelect
            label="Resource Kind"
            value={selectedKind}
            onValueChange={(v) => setSelectedKind(v as "all" | CommunityResourceKind)}
            searchable
            searchPlaceholder="Filter resource kinds..."
            options={[
              { value: "all", label: "All Kinds" },
              { value: "lesson", label: "Lessons" },
              { value: "worksheet", label: "Worksheets" },
              { value: "guide", label: "Guides" },
              { value: "reference", label: "References" },
              { value: "book", label: "Books" },
            ]}
          />

          <ModernSelect
            label="Grade Band"
            value={selectedGradeBand}
            onValueChange={setSelectedGradeBand}
            searchable
            searchPlaceholder="Filter grade bands..."
            options={[
              { value: "all", label: "All Grades" },
              { value: "Grade 1-4", label: "Grade 1-4" },
              { value: "Grade 5-7", label: "Grade 5-7" },
              { value: "Grade 6-9", label: "Grade 6-9" },
              { value: "Grade 8-10", label: "Grade 8-10" },
              { value: "Grade 11-12", label: "Grade 11-12" },
              { value: "Universal", label: "Universal" },
            ]}
          />

          <ModernSelect
            label="Language"
            value={selectedLanguage}
            onValueChange={(v) => setSelectedLanguage(v as "all" | "en" | "ar" | "bilingual")}
            searchable
            searchPlaceholder="Filter languages..."
            options={[
              { value: "all", label: "All Languages" },
              { value: "en", label: "English" },
              { value: "ar", label: "Arabic" },
              { value: "bilingual", label: "Bilingual" },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={teacherCuratedOnly ? "secondary" : "outline"}
            onClick={() => setTeacherCuratedOnly(!teacherCuratedOnly)}
            className="min-h-[40px] text-xs"
          >
            <GraduationCap className="size-3.5 me-1.5 text-primary" />
            Curated
          </Button>

          <Button
            type="button"
            size="sm"
            variant={downloadableOnly ? "secondary" : "outline"}
            onClick={() => setDownloadableOnly(!downloadableOnly)}
            className="min-h-[40px] text-xs"
          >
            <Download className="size-3.5 me-1.5 text-primary" />
            Downloadable
          </Button>
        </div>
      </div>

      {/* Specialized Collections Quick Selectors */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] font-medium text-muted-foreground">Collections:</span>
        {(
          [
            ["all", "All Resources"],
            ["foundational", "Foundational Basics"],
            ["science", "Science Labs"],
            ["languages", "Languages"],
            ["mathematics", "Math & Logic"],
            ["life_skills", "Life Skills & Health"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedCollection(key)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
              selectedCollection === key
                ? "bg-primary text-primary-foreground font-semibold"
                : "border border-border/80 bg-surface-2/60 text-muted-foreground hover:bg-surface-2"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Resource Count Banner */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          Showing <strong className="tabular-nums">{filteredResources.length}</strong> approved
          community resources
        </span>
        <span className="font-mono text-[10px]">Attribution Preserved · Zero Paywalls</span>
      </div>

      {/* Grid of Resources */}
      {filteredResources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
          No approved resources matched these filters. Clear filters or check the Educator Review
          Queue above.
        </div>
      ) : (
        <div
          className={
            lowBandwidthView
              ? "space-y-2 font-mono text-[11px]"
              : "grid gap-3.5 sm:grid-cols-2 lg:grid-cols-2"
          }
        >
          {filteredResources.map((res) => {
            if (lowBandwidthView) {
              return (
                <div
                  key={res.id}
                  className="rounded-lg border border-border bg-surface-card p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>
                      {res.title} [{res.subject} · {res.gradeBand} · {res.language}]
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownloadResource(res)}
                      className="h-6 text-[10px] px-2"
                    >
                      Export .MD
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-[10px]">{res.summary}</p>
                  <div className="text-[10px] text-muted-foreground/80">
                    Source: {res.sourceAttribution} · License: {res.license}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={res.id}
                className="surface-card flex flex-col justify-between space-y-3 p-4 transition-all hover:border-primary/40"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-muted-foreground">
                    <span className="font-semibold uppercase tracking-wide text-primary">
                      {res.collection.replace(/_/g, " ")} · {res.resourceKind} · {res.language}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {res.teacherCurated && (
                        <span className="inline-flex items-center gap-1 text-primary font-medium">
                          <ShieldCheck className="size-3" /> Curated
                        </span>
                      )}
                      <span>·</span>
                      <span className="font-mono">{res.gradeBand}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-sm font-bold text-foreground leading-snug">
                      {res.title}
                    </h3>
                    {res.titleAr && (
                      <p className="text-[11px] text-muted-foreground/80 font-arabic mt-0.5">
                        {res.titleAr}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {res.summary}
                  </p>

                  {res.reviewStatus === "needs_correction" && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-500">
                      <AlertTriangle className="size-3.5 shrink-0" />
                      <span>Flagged for content accuracy check</span>
                    </div>
                  )}

                  <div className="rounded-lg bg-surface-2/60 p-2 text-[11px] text-foreground/90 space-y-1">
                    <div className="font-semibold text-[10px] uppercase text-muted-foreground tracking-wide">
                      Core Concept Preview
                    </div>
                    <p className="text-[11px] leading-relaxed line-clamp-3">{res.content}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/60">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
                    <div>
                      By <span className="font-medium text-foreground">{res.author}</span>
                    </div>
                    <span className="font-mono text-muted-foreground">{res.license}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="text-[10px] text-muted-foreground tabular-nums">
                      Quality:{" "}
                      <span className="font-semibold text-primary">
                        {res.qualityScore.clarity}/5
                      </span>{" "}
                      · Size: {Math.round(res.downloadSizeBytes / 1024)} KB
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setReportingResource(res);
                          setReportDetails("");
                        }}
                        className="h-7 px-2 text-[11px] text-muted-foreground hover:text-amber-500"
                      >
                        <Flag className="size-3 me-1" />
                        Report Error
                      </Button>

                      {onPromoteToLegacy && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => onPromoteToLegacy(res)}
                          className="h-7 px-2 text-[11px]"
                        >
                          Preserve Legacy
                        </Button>
                      )}

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadResource(res)}
                        className="h-7 text-[11px]"
                      >
                        <Download className="size-3 me-1 text-primary" />
                        Download Pack
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Error Dialog */}
      <Dialog
        open={Boolean(reportingResource)}
        onOpenChange={(open) => {
          if (!open) setReportingResource(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-bold">
              <Flag className="size-4 text-amber-500" />
              Report Issue: {reportingResource?.title}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitErrorReport} className="space-y-3 text-xs">
            <ModernSelect
              label="Issue Category"
              value={reportKind}
              onValueChange={(v) => setReportKind(v as ErrorReportKind)}
              searchable
              searchPlaceholder="Search categories..."
              options={[
                { value: "factual_error", label: "Factual or Math Inaccuracy" },
                { value: "broken_link", label: "Broken Source / Reference" },
                { value: "outdated", label: "Outdated Information" },
                { value: "accessibility", label: "Accessibility Issue" },
                { value: "copyright", label: "Copyright / Attribution Issue" },
              ]}
            />
            <div className="space-y-1">
              <Label htmlFor="com-error-details">Exact Description (No PII) *</Label>
              <Textarea
                id="com-error-details"
                rows={4}
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Explain the inaccuracy or citation correction clearly (min 10 chars)..."
                required
                className="text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setReportingResource(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="glow">
                Submit Correction Report
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
