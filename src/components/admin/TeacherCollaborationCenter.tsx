import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookmarkPlus,
  CheckCircle2,
  Flag,
  GraduationCap,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CURRICULUM_UNITS } from "@/data/curriculum-and-challenges";
import { useQuizAttempts, useStudyItems } from "@/hooks/use-modules";
import { useRbac } from "@/hooks/use-rbac";
import {
  SEEDED_SMART_CLASSROOMS,
  computeClassKnowledgeAnalytics,
  generateTeacherDraftLocally,
  type EducatorDraftOutput,
} from "@/lib/empowerment-engines";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem } from "@/lib/student-ecosystem";
import { BRAND } from "@/config/brand";

const TEACHER_CONTRIBUTED_RESOURCES = [
  {
    id: "tcr_kw_g9_sci",
    country: "Kuwait / GCC",
    curriculum: "General Secondary Foundation",
    grade: "Grade 9",
    subject: "Science & Biology",
    unit: "Unit 1 · Scientific Method",
    title: "Controlled Variables & Enzyme Rate Guided Inquiry",
    objectives:
      "1. State independent and dependent variables. 2. Distinguish qualitative from quantitative observations. 3. Graph rate curves safely.",
    assignmentPrompt:
      "Design a 3-step classroom test comparing room vs. chilled water enzyme activity with teacher supervision.",
  },
  {
    id: "tcr_kw_g9_math",
    country: "Kuwait / GCC",
    curriculum: "General Secondary Foundation",
    grade: "Grade 9",
    subject: "Mathematics",
    unit: "Unit 2 · Proportional Reasoning",
    title: "Truss Bridge Ratios & Mechanical Advantage Worksheet",
    objectives:
      "1. Calculate mechanical advantage ratios. 2. Evaluate bridge load capacity vs. budget constraints.",
    assignmentPrompt:
      "Configure a 12m bridge span carrying 250kg under 1,200 credits inside STEM Lab.",
  },
  {
    id: "tcr_intl_g9_eng",
    country: "International / IGCSE Track",
    curriculum: "Secondary ESL / EFL",
    grade: "Grade 9",
    subject: "English",
    unit: "Unit 3 · Balanced Diets & Cohesion",
    title: "Topic Sentence, Evidence & Cohesion Revision Pack",
    objectives:
      "1. Use British spelling conventions consistently ('flavour', 'fibre'). 2. Link cause-effect transitions clearly.",
    assignmentPrompt:
      "Write a 120-word paragraph contrasting traditional whole-grain staples with processed snacks.",
  },
];

type EducatorSubTab = "hub" | "classroom" | "copilot" | "analytics";

export function TeacherCollaborationCenter() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const rbac = useRbac();
  const { state: eco, update: updateEco } = useStudentEcosystem();
  const { data: studyItems = [] } = useStudyItems();
  const { data: quizAttempts = [] } = useQuizAttempts();

  const [eduTab, setEduTab] = useState<EducatorSubTab>("hub");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [reportedIds, setReportedIds] = useState<string[]>([]);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Science");
  const [objectives, setObjectives] = useState("");
  const [assignmentPrompt, setAssignmentPrompt] = useState("");

  // #33 Smart Classroom Builder State
  const [clsTitle, setClsTitle] = useState("");
  const [clsCode, setClsCode] = useState("BTC-G9NEW");
  const [clsSubject, setClsSubject] = useState("Science");
  const [clsAnnouncement, setClsAnnouncement] = useState("");
  const [clsFirstTask, setClsFirstTask] = useState(
    "Complete Controlled Variables check in Future Studio",
  );

  // #34 Teacher AI Copilot State (mandatory human educator review gate)
  const [copSubject, setCopSubject] = useState("Mathematics");
  const [copGrade, setCopGrade] = useState("Grade 9");
  const [copTopic, setCopTopic] = useState("Negative Numbers & Linear Balancing");
  const [copLoading, setCopLoading] = useState(false);
  const [copDraft, setCopDraft] = useState<EducatorDraftOutput | null>(null);
  const [copReviewedByHuman, setCopReviewedByHuman] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});

  // #35 Class Knowledge Analytics
  const analytics = useMemo(
    () =>
      computeClassKnowledgeAnalytics({
        state: eco,
        studyItems,
        quizAttempts,
      }),
    [eco, studyItems, quizAttempts],
  );

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !objectives.trim()) return;
    updateEco((prev) => ({
      ...prev,
      teacherDrafts: [
        {
          id: `tchr_${Date.now().toString(36)}`,
          title: title.trim(),
          subject: subject.trim(),
          objectives: objectives.trim(),
          assignmentPrompt: assignmentPrompt.trim(),
          updatedAt: new Date().toISOString(),
        },
        ...prev.teacherDrafts,
      ],
    }));
    setTitle("");
    setObjectives("");
    setAssignmentPrompt("");
    toast.success(isAr ? "تم حفظ قالب الدرس التعليمي" : "Saved educator lesson template draft");
  };

  const allTemplates = useMemo(() => {
    const teacherEntries = eco.teacherDrafts.map((d) => ({
      id: d.id,
      country: "School Team Draft",
      curriculum: "Educator Contributed",
      grade: "All Grades",
      subject: d.subject,
      unit: "Custom Blueprint",
      title: d.title,
      objectives: d.objectives,
      assignmentPrompt: d.assignmentPrompt,
    }));
    const curriculumEntries = CURRICULUM_UNITS.map((u) => ({
      id: `tcr_${u.id}`,
      country: u.country,
      curriculum: u.system,
      grade: u.grade,
      subject: u.subject,
      unit: u.unitTitle,
      title: `${u.unitTitle} — Lesson Check`,
      objectives: u.learningObjectives.join(" · "),
      assignmentPrompt: u.sampleCheck.question,
    }));
    return [...teacherEntries, ...TEACHER_CONTRIBUTED_RESOURCES, ...curriculumEntries];
  }, [eco.teacherDrafts]);

  const countries = useMemo(
    () => Array.from(new Set(allTemplates.map((t) => t.country))),
    [allTemplates],
  );
  const grades = useMemo(
    () => Array.from(new Set(allTemplates.map((t) => t.grade))),
    [allTemplates],
  );
  const subjects = useMemo(
    () => Array.from(new Set(allTemplates.map((t) => t.subject))),
    [allTemplates],
  );

  const visibleTemplates = useMemo(
    () =>
      allTemplates.filter((item) => {
        if (countryFilter !== "all" && item.country !== countryFilter) return false;
        if (gradeFilter !== "all" && item.grade !== gradeFilter) return false;
        if (subjectFilter !== "all" && item.subject !== subjectFilter) return false;
        return true;
      }),
    [allTemplates, countryFilter, gradeFilter, subjectFilter],
  );

  const handleSaveToNotes = (item: (typeof visibleTemplates)[number]) => {
    const entryId = `hub_${item.id}`;
    updateEco((prev) => {
      if (prev.knowledgeLibrary.some((k) => k.id === entryId)) return prev;
      return {
        ...prev,
        knowledgeLibrary: [
          {
            id: entryId,
            title: `${item.title} (${item.grade})`,
            subject: item.subject,
            sourceType: "tutor_note",
            content: `Unit: ${item.unit}\nObjectives: ${item.objectives}\nTask: ${item.assignmentPrompt}\nSource Note: Teacher-contributed practice resource — not official Ministry syllabus material.`,
            tags: ["teacher-hub", item.grade, item.subject],
            pinnedOffline: true,
            createdAt: new Date().toISOString(),
          },
          ...prev.knowledgeLibrary,
        ],
      };
    });
    toast.success(`Saved "${item.title}" to your Study Library & Offline Notes!`);
  };

  const handleReportResource = (id: string, itemTitle: string) => {
    setReportedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    toast.info(`Flagged "${itemTitle}" for educator accuracy review.`);
  };

  return (
    <div className="surface-card p-5 space-y-4" data-testid="teacher-collaboration-center">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-5 text-primary" />
          <div>
            <h2 className="text-base font-bold font-display text-foreground">
              Educator Studio (#13 Resource Hub, #33 Smart Classroom, #34 AI Copilot, #35 Class
              Analytics)
            </h2>
            <p className="text-xs text-muted-foreground">
              Design classrooms, review AI lesson drafts safely, moderate student contributions, and
              inspect privacy-safe class mastery trends.
            </p>
          </div>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          Role: <strong className="text-foreground capitalize">{rbac.role}</strong>
        </span>
      </div>

      {/* Sub-Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
        {(
          [
            { id: "hub", label: "13. Resource Hub", icon: BookmarkPlus },
            { id: "classroom", label: "33. Smart Classroom & Moderation", icon: Users },
            { id: "copilot", label: "34. Teacher AI Copilot", icon: Sparkles },
            { id: "analytics", label: "35. Class Knowledge Analytics", icon: BarChart3 },
          ] as const
        ).map((tItem) => {
          const Icon = tItem.icon;
          return (
            <Button
              key={tItem.id}
              type="button"
              size="sm"
              variant={eduTab === tItem.id ? "glow" : "outline"}
              className="h-8 text-xs"
              onClick={() => setEduTab(tItem.id)}
            >
              <Icon className="size-3.5" />
              <span>{tItem.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Honest Teacher-Contributed vs Official Disclaimer */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-foreground flex items-start gap-2">
        <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
        <span>
          <strong>Educator Governance Notice:</strong> Materials and AI drafts require human
          educator verification before classroom release and are{" "}
          <strong>not official Ministry or examination-board publications</strong>.
        </span>
      </div>

      {!rbac.isStaff && (
        <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-foreground flex items-center gap-2">
          <Lock className="size-4 text-sky-400 shrink-0" />
          <span>
            {isAr
              ? "معاينة الطالب: يمكنك تصفية الدروس وحفظها في ملاحظاتك أو الإبلاغ عن أي خطأ."
              : "Student Resource Mode: Publishing and moderation actions require staff/educator credentials."}
          </span>
        </div>
      )}

      {/* TAB 1: RESOURCE HUB */}
      {eduTab === "hub" && (
        <div className="space-y-4">
          {rbac.isStaff && (
            <form
              onSubmit={handleSaveTemplate}
              className="space-y-3 rounded-xl border border-border bg-surface-2/60 p-4 text-xs"
            >
              <div className="font-bold text-foreground">Draft New Classroom Lesson Blueprint</div>
              <div className="grid gap-2 sm:grid-cols-3">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Unit Title (e.g. Unit 4: Aqueous Electrochemistry)"
                  className="text-xs sm:col-span-2"
                />
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject / Grade Level"
                  className="text-xs"
                />
              </div>
              <Textarea
                rows={2}
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                placeholder="Learning Objectives (SWBAT 1, 2, 3)..."
                className="text-xs"
              />
              <Textarea
                rows={2}
                value={assignmentPrompt}
                onChange={(e) => setAssignmentPrompt(e.target.value)}
                placeholder="Recommended classroom investigation or simulation task..."
                className="text-xs"
              />
              <Button type="submit" size="sm" className="h-8 text-xs">
                <Plus className="size-3.5 me-1.5" />
                Publish Template to Hub
              </Button>
            </form>
          )}

          {/* Country / Grade / Subject Filters */}
          <div className="grid gap-2 sm:grid-cols-3 text-xs">
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              aria-label="Filter by country or track"
              className="h-8 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
            >
              <option value="all">All Countries / Tracks</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              aria-label="Filter by grade"
              className="h-8 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
            >
              <option value="all">All Grades</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              aria-label="Filter by subject"
              className="h-8 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 text-xs">
            <div className="font-bold text-foreground">
              Curated Lesson &amp; Resource Blueprints ({visibleTemplates.length})
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleTemplates.map((item) => {
                const isSaved = eco.knowledgeLibrary.some((k) => k.id === `hub_${item.id}`);
                const isReported = reportedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-[10px] text-primary">
                          {item.country} · {item.grade} · {item.subject}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{item.unit}</span>
                      </div>
                      <h3 className="font-bold text-foreground">{item.title}</h3>
                      <div className="text-muted-foreground">
                        <strong className="text-foreground">Objectives:</strong> {item.objectives}
                      </div>
                      <div className="text-muted-foreground">
                        <strong className="text-foreground">Task:</strong> {item.assignmentPrompt}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                      <Button
                        type="button"
                        size="sm"
                        variant={isSaved ? "outline" : "glow"}
                        onClick={() => handleSaveToNotes(item)}
                        className="h-7 text-[11px]"
                      >
                        <BookmarkPlus className="size-3 me-1" />
                        {isSaved ? "Saved to Library" : "Save to Study Library"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReportResource(item.id, item.title)}
                        disabled={isReported}
                        className="h-7 text-[11px] text-muted-foreground hover:text-amber-500"
                      >
                        <Flag className="size-3 me-1" />
                        {isReported ? "Reported for Review" : "Report Issue"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: #33 SMART CLASSROOM STUDIO & MODERATION QUEUE */}
      {eduTab === "classroom" && (
        <div className="grid gap-5 lg:grid-cols-2 text-xs" data-testid="educator-smart-classroom">
          <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-foreground">
              Create &amp; Publish Smart Classroom
            </h3>
            {rbac.isStaff ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!clsTitle.trim() || !clsCode.trim()) return;
                  const cleanCode = clsCode.trim().toUpperCase();
                  updateEco((prev) => ({
                    ...prev,
                    smartClassrooms: {
                      ...prev.smartClassrooms,
                      joinedCodes: prev.smartClassrooms.joinedCodes.includes(cleanCode)
                        ? prev.smartClassrooms.joinedCodes
                        : [...prev.smartClassrooms.joinedCodes, cleanCode],
                      createdClassrooms: [
                        {
                          id: `cls_${Date.now().toString(36)}`,
                          code: cleanCode,
                          title: clsTitle.trim(),
                          subject: clsSubject.trim(),
                          grade: "Grade 9",
                          teacherAlias: "Educator Staff",
                          announcement:
                            clsAnnouncement.trim() || "Welcome! Review this week's target skills.",
                          assignments: [
                            {
                              id: `asg_${Date.now().toString(36)}`,
                              title: clsFirstTask.trim() || "Complete starter diagnostic",
                              dueLabel: "Due This Week",
                              kind: "project",
                              targetRoute: "/app/study",
                            },
                          ],
                        },
                        ...prev.smartClassrooms.createdClassrooms,
                      ],
                    },
                  }));
                  setClsTitle("");
                  setClsAnnouncement("");
                  toast.success(`Published Smart Classroom (${cleanCode})!`);
                }}
                className="space-y-2.5"
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={clsTitle}
                    onChange={(e) => setClsTitle(e.target.value)}
                    placeholder="Classroom Name (e.g., Grade 9 Honors Bio)"
                    className="text-xs"
                  />
                  <Input
                    value={clsCode}
                    onChange={(e) => setClsCode(e.target.value.toUpperCase())}
                    placeholder="Join Code (e.g., BIO-9A)"
                    className="font-mono uppercase text-xs"
                  />
                </div>
                <Input
                  value={clsSubject}
                  onChange={(e) => setClsSubject(e.target.value)}
                  placeholder="Subject"
                  className="text-xs"
                />
                <Textarea
                  rows={2}
                  value={clsAnnouncement}
                  onChange={(e) => setClsAnnouncement(e.target.value)}
                  placeholder="Weekly classroom announcement..."
                  className="text-xs"
                />
                <Input
                  value={clsFirstTask}
                  onChange={(e) => setClsFirstTask(e.target.value)}
                  placeholder="Starter assignment title..."
                  className="text-xs"
                />
                <Button type="submit" size="sm" variant="glow">
                  <Plus className="size-3.5" />
                  <span>Create Classroom</span>
                </Button>
              </form>
            ) : (
              <p className="text-muted-foreground">
                Educator staff access required to create classrooms.
              </p>
            )}

            <div className="space-y-2 pt-2 border-t border-border">
              <div className="font-semibold text-foreground">Active Classrooms</div>
              {[...SEEDED_SMART_CLASSROOMS, ...eco.smartClassrooms.createdClassrooms].map((c) => (
                <div key={c.id} className="rounded-lg border border-border bg-surface p-2.5">
                  <div className="flex justify-between font-bold">
                    <span>{c.title}</span>
                    <span className="font-mono text-primary">{c.code}</span>
                  </div>
                  <div className="text-muted-foreground">{c.announcement}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-foreground">
              48 &amp; 50. Student Community Knowledge Moderation Queue
            </h3>
            {eco.communityKnowledgeEntries.length === 0 ? (
              <p className="text-muted-foreground">
                No pending student study-guide submissions right now. Students can submit guides
                from Collaboration → Community Knowledge Library.
              </p>
            ) : (
              <div className="space-y-2">
                {eco.communityKnowledgeEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-border bg-surface p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{entry.title}</span>
                      <span className="font-mono text-[10px] uppercase text-primary">
                        {entry.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{entry.summary}</p>
                    {rbac.isStaff && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="glow"
                          className="h-7 text-[11px]"
                          onClick={() =>
                            updateEco((prev) => ({
                              ...prev,
                              communityKnowledgeEntries: prev.communityKnowledgeEntries.map((x) =>
                                x.id === entry.id ? { ...x, status: "approved" } : x,
                              ),
                            }))
                          }
                        >
                          Approve Guide
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="h-7 text-[11px]"
                          onClick={() =>
                            updateEco((prev) => ({
                              ...prev,
                              communityKnowledgeEntries: prev.communityKnowledgeEntries.map((x) =>
                                x.id === entry.id ? { ...x, status: "flagged" } : x,
                              ),
                            }))
                          }
                        >
                          Reject / Flag
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Content Error Reports & Volunteer Knowledge Moderation Queue */}
            <div className="border-t border-border pt-3 space-y-2">
              <h4 className="font-display text-xs font-bold text-foreground">
                Open Content Error Reports ({eco.contentErrorReports.length}) &amp; Volunteer Queue
                ({eco.volunteerContributions.length})
              </h4>
              {eco.contentErrorReports.map((rep) => (
                <div
                  key={rep.id}
                  className="rounded-lg border border-border bg-surface p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      {rep.resourceTitle} · {rep.kind}
                    </span>
                    <span className="font-mono text-[10px] uppercase text-primary">
                      {rep.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{rep.details}</p>
                  {rbac.isStaff && rep.status === "open" && (
                    <div className="flex flex-wrap gap-2">
                      <Input
                        value={resolutionNotes[rep.id] ?? ""}
                        onChange={(e) =>
                          setResolutionNotes((prev) => ({ ...prev, [rep.id]: e.target.value }))
                        }
                        placeholder="Resolution note & correction summary..."
                        className="h-7 flex-1 text-[11px]"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="glow"
                        className="h-7 text-[11px]"
                        onClick={() => {
                          const note =
                            resolutionNotes[rep.id]?.trim() ||
                            "Verified and corrected by educator reviewer.";
                          const today = new Date().toISOString().slice(0, 10);
                          updateEco((prev) => {
                            const existingOv = prev.resourceStatusOverrides[rep.resourceId];
                            return {
                              ...prev,
                              contentErrorReports: prev.contentErrorReports.map((r) =>
                                r.id === rep.id
                                  ? { ...r, status: "resolved", resolutionNote: note }
                                  : r,
                              ),
                              resourceStatusOverrides: {
                                ...prev.resourceStatusOverrides,
                                [rep.resourceId]: {
                                  reviewStatus: "approved",
                                  lastReviewedDate: today,
                                  correctionHistory: [
                                    {
                                      date: today,
                                      summary: note,
                                      reviewerRole: "educator",
                                    },
                                    ...(existingOv?.correctionHistory ?? []),
                                  ],
                                },
                              },
                            };
                          });
                          toast.success(
                            `Resolved error report and re-approved ${rep.resourceTitle}`,
                          );
                        }}
                      >
                        Verify &amp; Re-Approve
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {eco.volunteerContributions.map((vol) => (
                <div
                  key={vol.id}
                  className="rounded-lg border border-border bg-surface p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      Volunteer: {vol.kind.replace(/_/g, " ")} ({vol.language})
                    </span>
                    <span className="font-mono text-[10px] uppercase text-primary">
                      {vol.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{vol.summary}</p>
                  {rbac.isStaff && vol.status === "pending_review" && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="glow"
                        className="h-7 text-[11px]"
                        onClick={() =>
                          updateEco((prev) => ({
                            ...prev,
                            volunteerContributions: prev.volunteerContributions.map((v) =>
                              v.id === vol.id ? { ...v, status: "approved" } : v,
                            ),
                          }))
                        }
                      >
                        Approve Volunteer Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px]"
                        onClick={() =>
                          updateEco((prev) => ({
                            ...prev,
                            volunteerContributions: prev.volunteerContributions.map((v) =>
                              v.id === vol.id ? { ...v, status: "needs_revision" } : v,
                            ),
                          }))
                        }
                      >
                        Request Revision
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: #34 TEACHER AI COPILOT */}
      {eduTab === "copilot" && (
        <div className="space-y-4 text-xs" data-testid="teacher-ai-copilot">
          <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
            <h3 className="font-display text-sm font-bold text-foreground">
              34. Teacher AI Copilot (Differentiated Lesson &amp; Activity Drafter)
            </h3>
            <p className="text-muted-foreground">
              Draft differentiated lesson activities using server-side {BRAND.shortName} AI (with
              instant structured template fallback offline). Mandatory human educator review
              required before saving.
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                value={copSubject}
                onChange={(e) => setCopSubject(e.target.value)}
                placeholder="Subject"
                className="text-xs"
              />
              <Input
                value={copGrade}
                onChange={(e) => setCopGrade(e.target.value)}
                placeholder="Grade Level"
                className="text-xs"
              />
              <Input
                value={copTopic}
                onChange={(e) => setCopTopic(e.target.value)}
                placeholder="Target Concept / Skill"
                className="text-xs"
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant="glow"
              disabled={copLoading || !copTopic.trim()}
              onClick={async () => {
                setCopLoading(true);
                setCopReviewedByHuman(false);
                const localFallback = generateTeacherDraftLocally({
                  subject: copSubject,
                  grade: copGrade,
                  topic: copTopic,
                });
                try {
                  const res = await fetch("/api/ai/structured", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      mode: "study_plan",
                      subject: copSubject,
                      topic: copTopic,
                      prompt: `Generate a differentiated classroom lesson sequence for ${copGrade} students on ${copTopic}.`,
                    }),
                  });
                  const json = (await res.json()) as {
                    ok?: boolean;
                    data?: {
                      summary?: string;
                      tasks?: Array<{ title: string; details: string }>;
                    };
                  };
                  if (res.ok && json.ok && json.data?.tasks?.length) {
                    setCopDraft({
                      ...localFallback,
                      objectives: [
                        json.data.summary || localFallback.objectives[0]!,
                        ...json.data.tasks.slice(0, 2).map((tk) => `${tk.title}: ${tk.details}`),
                      ],
                    });
                    toast.success(
                      "Generated AI-assisted lesson draft — review carefully before publishing!",
                    );
                  } else {
                    setCopDraft(localFallback);
                    toast.info(
                      "AI unavailable — loaded structured educator differentiation template.",
                    );
                  }
                } catch {
                  setCopDraft(localFallback);
                  toast.info("Offline — loaded structured educator differentiation template.");
                } finally {
                  setCopLoading(false);
                }
              }}
            >
              <Sparkles className="size-3.5" />
              <span>{copLoading ? "Drafting Lesson..." : "Draft Differentiated Lesson"}</span>
            </Button>
          </div>

          {copDraft && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
              <h4 className="font-display text-sm font-bold text-foreground">{copDraft.title}</h4>
              <ul className="list-disc ps-4 space-y-1 text-foreground">
                {copDraft.objectives.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
              <div className="grid gap-2 md:grid-cols-3">
                <div className="rounded-lg border border-border bg-surface p-2.5">
                  <div className="font-bold text-primary">Foundation Support</div>
                  <p className="text-muted-foreground">
                    {copDraft.differentiatedActivities.foundation}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-surface p-2.5">
                  <div className="font-bold text-primary">Standard Practice</div>
                  <p className="text-muted-foreground">
                    {copDraft.differentiatedActivities.standard}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-surface p-2.5">
                  <div className="font-bold text-primary">Extension Transfer</div>
                  <p className="text-muted-foreground">
                    {copDraft.differentiatedActivities.extension}
                  </p>
                </div>
              </div>
              <p className="text-foreground">
                <strong>Exit Question:</strong> {copDraft.exitQuestion}
              </p>

              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5">
                <input
                  type="checkbox"
                  checked={copReviewedByHuman}
                  onChange={(e) => setCopReviewedByHuman(e.target.checked)}
                  className="accent-primary"
                />
                <span>
                  I have reviewed, fact-checked, and approved this draft as appropriate for my
                  students.
                </span>
              </label>

              <Button
                type="button"
                size="sm"
                variant="glow"
                disabled={!rbac.isStaff || !copReviewedByHuman}
                onClick={() => {
                  updateEco((prev) => ({
                    ...prev,
                    teacherDrafts: [
                      {
                        id: `tchr_ai_${Date.now().toString(36)}`,
                        title: copDraft.title,
                        subject: copSubject,
                        objectives: copDraft.objectives.join(" · "),
                        assignmentPrompt: copDraft.exitQuestion,
                        updatedAt: new Date().toISOString(),
                      },
                      ...prev.teacherDrafts,
                    ],
                  }));
                  toast.success("Reviewed lesson draft published to Educator Hub!");
                }}
              >
                <CheckCircle2 className="size-3.5" />
                <span>Publish Reviewed Lesson to Hub</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: #35 PRIVACY-SAFE CLASS KNOWLEDGE ANALYTICS */}
      {eduTab === "analytics" && (
        <div className="space-y-4 text-xs" data-testid="class-knowledge-analytics">
          <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-foreground">
            <ShieldCheck className="size-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{analytics.sampleSizeNotice}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="text-muted-foreground">Avg Simulation Score</div>
              <div className="font-display text-2xl font-bold text-primary">
                {analytics.averageExamPct !== null
                  ? `${analytics.averageExamPct}%`
                  : "No Exams Yet"}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="text-muted-foreground">Strongest Cohort Domain</div>
              <div className="font-display text-base font-bold text-foreground">
                {analytics.strongestSubject ?? "Collecting Signals"}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="text-muted-foreground">Priority Intervention Focus</div>
              <div className="font-display text-base font-bold text-xp">
                {analytics.priorityInterventionTopic ?? "Balanced Across Domains"}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-2 p-4 space-y-2">
            <div className="font-bold text-foreground">
              Aggregated Misconception &amp; Mistake Clusters
            </div>
            {analytics.topMisconceptions.length === 0 ? (
              <p className="text-muted-foreground">
                No recurring topic misconceptions detected yet.
              </p>
            ) : (
              analytics.topMisconceptions.map((mc) => (
                <div
                  key={mc.label}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2"
                >
                  <span className="font-medium text-foreground">{mc.label}</span>
                  <span className="font-mono font-bold text-xp">{mc.count} signal(s)</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
