import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpenCheck,
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  Flag,
  Globe2,
  GraduationCap,
  HeartHandshake,
  ImageIcon,
  LogOut,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  ThumbsUp,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { BRAND } from "@/config/brand";
import { PageHeader } from "@/components/app/Page";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { VisualAidStudio } from "@/components/ai/VisualAidStudio";
import { KnowledgeCircleQaBoard } from "@/components/circle/KnowledgeCircleQaBoard";
import { MunSimulatorPanel } from "@/components/circle/MunSimulatorPanel";
import { GlobalCultureHub } from "@/components/global/GlobalCultureHub";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCircleActions, useCircleDetails, useCircles } from "@/hooks/use-modules";
import { useProfile, useStats, useUser } from "@/hooks/use-nexora";
import {
  CURATED_COMMUNITY_GUIDES,
  SEEDED_SMART_CLASSROOMS,
  matchSafeStudyCohorts,
  validateSafeCommunityContribution,
} from "@/lib/empowerment-engines";
import { sanitizeHttpUrl, type ModerationReportRow } from "@/lib/firestore-data";
import { OPEN_LEARNING_LIBRARY } from "@/data/open-learning-library";
import { validateVolunteerContribution, type VolunteerTaskKind } from "@/lib/legacy-knowledge";
import { formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

type CircleTab = "feed" | "tasks" | "resources" | "members" | "showcase" | "mun" | "global";
export type CircleHubSection =
  "qa" | "teams" | "matcher" | "classrooms" | "library" | "girls_space";

export function CircleWorkspace({ initialSection }: { initialSection?: CircleHubSection }) {
  const { t, lang, privacy } = usePrefs();
  const { data: user } = useUser();
  const { data: profile } = useProfile();
  const { data: stats } = useStats();
  const { data: circles = [] } = useCircles();
  const { state: ecoState, update: updateEco } = useStudentEcosystem();
  const [hubSection, setHubSection] = useState<CircleHubSection>(initialSection ?? "teams");

  useEffect(() => {
    if (initialSection) {
      setHubSection(initialSection);
    }
  }, [initialSection]);
  const [classCodeInput, setClassCodeInput] = useState("");
  const [contribTitle, setContribTitle] = useState("");
  const [contribSubject, setContribSubject] = useState("Science");
  const [contribGrade, setContribGrade] = useState("Grades 8–10");
  const [contribSummary, setContribSummary] = useState("");
  const [contribSteps, setContribSteps] = useState("");
  const [volKind, setVolKind] = useState<VolunteerTaskKind>("translation");
  const [volLang, setVolLang] = useState("Arabic / English");
  const [volTargetId, setVolTargetId] = useState(OPEN_LEARNING_LIBRARY[0]!.id);
  const [volSummary, setVolSummary] = useState("");
  const [volSupervisorOk, setVolSupervisorOk] = useState(false);
  const {
    createCircle,
    joinByInviteCode,
    createCirclePost,
    updateCirclePost,
    deleteCirclePost,
    togglePostStatus,
    toggleHelpful,
    updateCircleGoal,
    leaveCircle,
    submitModerationReport,
  } = useCircleActions();

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostBody, setEditPostBody] = useState("");

  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const activeCircle = circles.find((c) => c.id === selectedCircleId) ?? circles[0] ?? null;

  useEffect(() => {
    if (!selectedCircleId && circles[0]) {
      setSelectedCircleId(circles[0].id);
    }
  }, [circles, selectedCircleId]);

  const { data: details } = useCircleDetails(activeCircle?.id ?? null);
  const [tab, setTab] = useState<CircleTab>("feed");
  const [postSearch, setPostSearch] = useState("");
  const [confirmLeave, setConfirmLeave] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qTab = params.get("tab") as CircleTab | null;
    const valid: CircleTab[] = [
      "feed",
      "tasks",
      "resources",
      "members",
      "showcase",
      "mun",
      "global",
    ];
    if (qTab && valid.includes(qTab)) {
      setTab(qTab);
    }
  }, []);

  // Owner shared goal edit
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState("");

  // Create / Join state
  const [teamName, setTeamName] = useState("");
  const [teamSubject, setTeamSubject] = useState("");
  const [sharedGoal, setSharedGoal] = useState("");
  const [inviteInput, setInviteInput] = useState("");
  const [busy, setBusy] = useState(false);

  // Post composer
  const [postKind, setPostKind] = useState<"discussion" | "resource" | "task">("discussion");
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [postAssignee, setPostAssignee] = useState("");
  const [showVisualStudio, setShowVisualStudio] = useState(false);

  // Safety Report Dialog
  const [reportTarget, setReportTarget] = useState<{
    type: ModerationReportRow["target_type"];
    id: string;
  } | null>(null);
  const [reportReason, setReportReason] = useState<ModerationReportRow["reason"]>("inappropriate");
  const [reportDetails, setReportDetails] = useState("");

  const displayName = profile?.display_name || user?.displayName || t("dash.studentName");

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setBusy(true);
    try {
      const created = await createCircle({
        name: teamName.trim(),
        subject: teamSubject.trim() || null,
        sharedGoal: sharedGoal.trim() || null,
        memberDisplayName: displayName,
        showProgress: privacy.showInCircle,
        xpSnapshot: stats?.xp ?? 0,
        levelSnapshot: stats?.level ?? 1,
      });
      setSelectedCircleId(created.id);
      setTeamName("");
      setTeamSubject("");
      setSharedGoal("");
      toast.success(`${t("circle.createTeam")} (+25 XP)`);
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    } finally {
      setBusy(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;
    setBusy(true);
    try {
      const res = await joinByInviteCode({
        inviteCode: inviteInput,
        memberDisplayName: displayName,
        showProgress: privacy.showInCircle,
        xpSnapshot: stats?.xp ?? 0,
        levelSnapshot: stats?.level ?? 1,
      });
      if (!res.joined) {
        toast.error(t("circle.invalidCode"));
        return;
      }
      if (res.circleId) setSelectedCircleId(res.circleId);
      setInviteInput("");
      toast.success(`${t("circle.joinBtn")} (+25 XP)`);
    } catch {
      toast.error(t("circle.invalidCode"));
    } finally {
      setBusy(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCircle || !postTitle.trim()) return;
    setBusy(true);
    try {
      await createCirclePost({
        circle: activeCircle,
        authorName: displayName,
        kind: postKind,
        title: postTitle.trim(),
        body: postBody.trim() || null,
        resourceUrl: postKind === "resource" ? postUrl.trim() || null : null,
        assigneeName: postKind === "task" ? postAssignee.trim() || null : null,
      });
      setPostTitle("");
      setPostBody("");
      setPostUrl("");
      setPostAssignee("");
      toast.success(t("circle.publish"));
    } catch {
      toast.error(t("dash.tasks.errAdd"));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportTarget) return;
    await submitModerationReport({
      circleId: activeCircle?.id ?? null,
      targetType: reportTarget.type,
      targetId: reportTarget.id,
      reason: reportReason,
      details: reportDetails.trim() || null,
    });
    setReportTarget(null);
    setReportDetails("");
    toast.success(t("circle.reportDone"));
  };

  const members = details?.members ?? [];
  const allPosts = useMemo(() => details?.posts ?? [], [details?.posts]);
  const taskPosts = useMemo(() => allPosts.filter((p) => p.kind === "task"), [allPosts]);
  const doneTaskCount = useMemo(
    () => taskPosts.filter((p) => p.status === "done").length,
    [taskPosts],
  );
  const taskProgressPct =
    taskPosts.length > 0 ? Math.round((doneTaskCount / taskPosts.length) * 100) : 0;

  const filteredPosts = useMemo(() => {
    const q = postSearch.trim().toLowerCase();
    return allPosts
      .filter((p) => {
        if (tab === "tasks") return p.kind === "task";
        if (tab === "resources") return p.kind === "resource";
        return p.kind === "discussion";
      })
      .filter((p) => {
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          (p.body ?? "").toLowerCase().includes(q) ||
          p.author_name.toLowerCase().includes(q)
        );
      });
  }, [allPosts, tab, postSearch]);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={t("circle.title")}
        subtitle={t("circle.sub")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/app"
              search={{ tab: "legacy" }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary whitespace-nowrap"
            >
              <HeartHandshake className="size-3.5 text-emerald-400" />
              <span>{lang === "ar" ? "الأثر والمشاريع النافعة" : "Legacy & Impact"}</span>
            </Link>
            <FeatureGuideTrigger
              featureId={
                tab === "mun"
                  ? "mun-simulator"
                  : tab === "global"
                    ? "global-culture"
                    : "study-circles"
              }
            />
          </div>
        }
      />

      {/* Rooms & Innovation Circles Architectural Geometric Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-card">
        <div className="relative h-48 md:h-60 w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950">
          <svg
            viewBox="0 0 1200 320"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            className="h-full w-full opacity-90"
          >
            <defs>
              <linearGradient id="btcRoomGlowA" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.34" />
                <stop offset="55%" stopColor="#0ea5e9" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.22" />
              </linearGradient>
              <linearGradient id="btcRoomLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.55" />
              </linearGradient>
              <pattern id="btcRoomGrid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path
                  d="M 48 0 L 0 0 0 48"
                  fill="none"
                  stroke="rgba(148,163,184,0.12)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="1200" height="320" fill="url(#btcRoomGlowA)" />
            <rect width="1200" height="320" fill="url(#btcRoomGrid)" />
            {/* Architectural studio arches */}
            <g stroke="rgba(45,212,191,0.22)" strokeWidth="1.5" fill="none">
              <path d="M840 310 V130 A95 95 0 0 1 1030 130 V310" />
              <path d="M870 310 V145 A65 65 0 0 1 1000 145 V310" />
              <path d="M1065 310 V155 A70 70 0 0 1 1185 155" />
            </g>
            {/* Floating geometric polyhedra & study node orbital rings */}
            <g transform="translate(945 148)">
              <ellipse
                rx="132"
                ry="46"
                transform="rotate(-18)"
                fill="none"
                stroke="url(#btcRoomLine)"
                strokeWidth="1.6"
              />
              <ellipse
                rx="116"
                ry="38"
                transform="rotate(24)"
                fill="none"
                stroke="rgba(251,191,36,0.45)"
                strokeWidth="1.3"
              />
              <polygon
                points="0,-54 48,-18 30,44 -30,44 -48,-18"
                fill="rgba(20,184,166,0.16)"
                stroke="#2dd4bf"
                strokeWidth="2"
              />
              <polygon
                points="0,-32 28,16 -28,16"
                fill="rgba(245,158,11,0.18)"
                stroke="#fbbf24"
                strokeWidth="1.5"
              />
              <circle cx="-116" cy="-22" r="4" fill="#2dd4bf" />
              <circle cx="110" cy="28" r="4" fill="#fbbf24" />
              <circle cx="0" cy="-54" r="4" fill="#38bdf8" />
            </g>
            {/* Minimal architectural studio desk silhouette */}
            <path
              d="M650 295 H1160 M720 265 H1110 L1140 295 M720 265 L695 295"
              stroke="rgba(226,232,240,0.2)"
              strokeWidth="2"
              fill="none"
            />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 md:bottom-5 md:left-6 md:right-6">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary">
              <Sparkles className="size-3.5" />
              <span>BTC Knowledge Circle · Share What You Know. Help Someone Grow.</span>
            </div>
            <h2 className="mt-1.5 font-display text-xl md:text-2xl font-bold text-foreground">
              Knowledge Circle: Study Together, Lead Together, Be The Change.
            </h2>
            <p className="mt-1 max-w-xl text-xs md:text-sm text-muted-foreground/90 leading-relaxed">
              Join moderated student project teams, share peer study resources, collaborate on STEM
              challenges, and support your fellow students in dedicated learning spaces.
            </p>
          </div>
        </div>
      </div>

      <div className="surface-card flex items-start gap-2.5 border-primary/30 p-4 text-xs text-muted-foreground">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>{t("circle.safetyBanner")}</span>
      </div>

      {/* Top Hub Switcher: Q&A | Teams | Safe Matcher | Smart Classrooms | Community Library | Girls' Space */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            {
              id: "teams",
              label: lang === "ar" ? "حلقات الدراسة والفرق" : "Study Circles & Teams",
              icon: Users,
            },
            {
              id: "qa",
              label: lang === "ar" ? "أسئلة وأجوبة (١٠ مواد)" : "Knowledge Q&A (10 Subjects)",
              icon: Sparkles,
            },
            {
              id: "matcher",
              label: lang === "ar" ? "مطابقة الدراسة الآمنة" : "Safe Study Matcher",
              icon: Globe2,
            },
            {
              id: "classrooms",
              label: lang === "ar" ? "الفصول الذكية" : "Smart Classrooms",
              icon: GraduationCap,
            },
            {
              id: "library",
              label: lang === "ar" ? "مكتبة المعرفة المفتوحة" : "Community Knowledge Library",
              icon: BookOpenCheck,
            },
            {
              id: "girls_space",
              label: lang === "ar" ? "مساحة الفتيات (محمية)" : "Girls' Space (STEM & Leadership)",
              icon: HeartHandshake,
            },
          ] as const
        ).map((sec) => {
          const Icon = sec.icon;
          const isGirlsBtn = sec.id === "girls_space";
          return (
            <Button
              key={sec.id}
              type="button"
              size="sm"
              variant={hubSection === sec.id ? "glow" : "outline"}
              onClick={() => setHubSection(sec.id)}
              className={`h-9 text-xs ${
                isGirlsBtn && hubSection !== "girls_space"
                  ? "border-rose-500/35 text-rose-400 hover:bg-rose-500/10"
                  : ""
              }`}
            >
              <Icon className="size-3.5" />
              <span>{sec.label}</span>
            </Button>
          );
        })}
      </div>

      {hubSection === "qa" && (
        <KnowledgeCircleQaBoard
          authorName={displayName}
          onReportThread={(threadId) => {
            setReportTarget({ type: "post", id: threadId });
          }}
        />
      )}

      {/* SAFE STUDY GROUP MATCHER (#12) & EXCHANGE (#40) */}
      {hubSection === "matcher" &&
        (() => {
          const matches = matchSafeStudyCohorts({
            subjects: ecoState.studyMatcher.subjects,
            gradeBand: ecoState.studyMatcher.gradeBand,
            preferredPace: ecoState.studyMatcher.preferredPace,
            language: ecoState.studyMatcher.language,
            blockedCohortIds: ecoState.studyMatcher.blockedCohortIds,
          });
          return (
            <div className="space-y-4 text-xs" data-testid="safe-study-matcher">
              <div className="surface-card space-y-3 p-5">
                <h3 className="font-display text-base font-bold text-foreground">
                  12. Safe Study Group Matcher &amp; Global Exchange Cohorts (#40)
                </h3>
                <p className="text-muted-foreground">
                  Matched by subject, grade band, study pace, and language using anonymized study
                  aliases only. Zero unrestricted private messaging and instant block/report
                  protection.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="space-y-1">
                    <span className="text-[11px] text-muted-foreground">Grade Band</span>
                    <select
                      value={ecoState.studyMatcher.gradeBand}
                      onChange={(e) =>
                        updateEco((prev) => ({
                          ...prev,
                          studyMatcher: { ...prev.studyMatcher, gradeBand: e.target.value },
                        }))
                      }
                      className="h-8 w-full rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
                    >
                      <option value="Grades 7–9">Grades 7–9</option>
                      <option value="Grades 8–10">Grades 8–10</option>
                      <option value="Grades 9–12">Grades 9–12</option>
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-[11px] text-muted-foreground">Study Pace</span>
                    <select
                      value={ecoState.studyMatcher.preferredPace}
                      onChange={(e) =>
                        updateEco((prev) => ({
                          ...prev,
                          studyMatcher: {
                            ...prev.studyMatcher,
                            preferredPace: e.target.value as "gentle" | "balanced" | "intensive",
                          },
                        }))
                      }
                      className="h-8 w-full rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
                    >
                      <option value="gentle">Gentle Recovery</option>
                      <option value="balanced">Balanced Weekly</option>
                      <option value="intensive">Exam Intensive</option>
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-[11px] text-muted-foreground">Preferred Language</span>
                    <select
                      value={ecoState.studyMatcher.language}
                      onChange={(e) =>
                        updateEco((prev) => ({
                          ...prev,
                          studyMatcher: { ...prev.studyMatcher, language: e.target.value },
                        }))
                      }
                      className="h-8 w-full rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية (Arabic)</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {matches.map(({ cohort, compatibilityScore, matchReasons }) => {
                  const joined = ecoState.studyMatcher.joinedCohortIds.includes(cohort.id);
                  return (
                    <div
                      key={cohort.id}
                      className="surface-card flex flex-col justify-between space-y-3 p-5"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-primary">
                            {cohort.subject} · {cohort.gradeBand}
                          </span>
                          <span className="rounded bg-primary/15 px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
                            {compatibilityScore}% Fit
                          </span>
                        </div>
                        <h4 className="font-display text-sm font-bold text-foreground">
                          {cohort.aliasName}
                        </h4>
                        <p className="text-muted-foreground">{cohort.sharedGoal}</p>
                        <div className="rounded-lg border border-border bg-surface-2 p-2.5 text-[11px]">
                          <strong className="text-primary">Global Exchange Brief:</strong>{" "}
                          {cohort.exchangePrompt}
                        </div>
                        <p className="text-[11px] text-success">
                          Why matched: {matchReasons.join(" · ")}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                        <Button
                          type="button"
                          size="sm"
                          variant={joined ? "outline" : "glow"}
                          className="h-7 text-[11px]"
                          onClick={() => {
                            updateEco((prev) => ({
                              ...prev,
                              studyMatcher: {
                                ...prev.studyMatcher,
                                joinedCohortIds: joined
                                  ? prev.studyMatcher.joinedCohortIds.filter(
                                      (id) => id !== cohort.id,
                                    )
                                  : [...prev.studyMatcher.joinedCohortIds, cohort.id],
                              },
                            }));
                            toast.success(
                              joined
                                ? `Left cohort ${cohort.aliasName}`
                                : `Joined moderated cohort ${cohort.aliasName} (Code: ${cohort.inviteCode})`,
                            );
                          }}
                        >
                          {joined ? "Joined Cohort" : `Join Cohort (${cohort.inviteCode})`}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            updateEco((prev) => ({
                              ...prev,
                              studyMatcher: {
                                ...prev.studyMatcher,
                                blockedCohortIds: [
                                  ...prev.studyMatcher.blockedCohortIds,
                                  cohort.id,
                                ],
                                reportedCohortIds: [
                                  ...prev.studyMatcher.reportedCohortIds,
                                  cohort.id,
                                ],
                              },
                            }));
                            toast.info("Hidden cohort & queued safety report.");
                          }}
                        >
                          <Flag className="size-3 me-1" />
                          <span>Block / Report</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

      {/* STUDENT SMART CLASSROOMS (#33) */}
      {hubSection === "classrooms" &&
        (() => {
          const allClassrooms = [
            ...SEEDED_SMART_CLASSROOMS,
            ...ecoState.smartClassrooms.createdClassrooms,
          ];
          const joinedRooms = allClassrooms.filter((c) =>
            ecoState.smartClassrooms.joinedCodes.includes(c.code),
          );
          return (
            <div className="space-y-4 text-xs" data-testid="student-smart-classrooms">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const code = classCodeInput.trim().toUpperCase();
                  if (!code) return;
                  const match = allClassrooms.find((c) => c.code === code);
                  if (!match) {
                    toast.error("Classroom code not found (try BTC-STEM9 or BTC-ENG9).");
                    return;
                  }
                  updateEco((prev) => ({
                    ...prev,
                    smartClassrooms: {
                      ...prev.smartClassrooms,
                      joinedCodes: prev.smartClassrooms.joinedCodes.includes(code)
                        ? prev.smartClassrooms.joinedCodes
                        : [...prev.smartClassrooms.joinedCodes, code],
                    },
                  }));
                  setClassCodeInput("");
                  toast.success(`Joined Smart Classroom: ${match.title}`);
                }}
                className="surface-card flex flex-wrap items-center gap-2 p-5"
              >
                <div className="flex-1 min-w-52">
                  <h3 className="font-display text-base font-bold text-foreground">
                    33. Student Smart Classrooms &amp; Assignment Board
                  </h3>
                  <p className="text-muted-foreground">
                    Join your teacher&apos;s classroom with a class code (demo codes:{" "}
                    <code className="font-mono text-primary">BTC-STEM9</code>,{" "}
                    <code className="font-mono text-primary">BTC-ENG9</code>).
                  </p>
                </div>
                <Input
                  value={classCodeInput}
                  onChange={(e) => setClassCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter class code (e.g., BTC-ENG9)"
                  className="h-8 w-52 font-mono uppercase text-xs"
                />
                <Button type="submit" size="sm" variant="glow" className="h-8 text-xs">
                  Join Classroom
                </Button>
              </form>

              <div className="grid gap-4 md:grid-cols-2">
                {joinedRooms.map((cls) => (
                  <div key={cls.id} className="surface-card space-y-3 p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-primary">
                        {cls.code} · {cls.subject} · {cls.grade}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{cls.teacherAlias}</span>
                    </div>
                    <h4 className="font-display text-sm font-bold text-foreground">{cls.title}</h4>
                    <p className="rounded-lg border border-primary/25 bg-primary/5 p-2.5 text-foreground">
                      {cls.announcement}
                    </p>
                    <div className="space-y-2">
                      <div className="font-semibold text-foreground">Classroom Assignments</div>
                      {cls.assignments.map((asg) => {
                        const done = ecoState.smartClassrooms.completedAssignmentIds.includes(
                          asg.id,
                        );
                        return (
                          <div
                            key={asg.id}
                            className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 p-2.5"
                          >
                            <div>
                              <div className="font-semibold text-foreground">{asg.title}</div>
                              <div className="text-[10px] text-muted-foreground">
                                {asg.kind.toUpperCase()} · {asg.dueLabel}
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant={done ? "outline" : "glow"}
                              className="h-7 text-[11px]"
                              onClick={() => {
                                updateEco((prev) => ({
                                  ...prev,
                                  smartClassrooms: {
                                    ...prev.smartClassrooms,
                                    completedAssignmentIds:
                                      prev.smartClassrooms.completedAssignmentIds.includes(asg.id)
                                        ? prev.smartClassrooms.completedAssignmentIds.filter(
                                            (x) => x !== asg.id,
                                          )
                                        : [...prev.smartClassrooms.completedAssignmentIds, asg.id],
                                  },
                                }));
                              }}
                            >
                              {done ? "Completed ✓" : "Mark Done"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

      {/* MODERATED COMMUNITY KNOWLEDGE LIBRARY (#48 & #50) */}
      {hubSection === "library" &&
        (() => {
          const allGuides = [
            ...CURATED_COMMUNITY_GUIDES,
            ...ecoState.communityKnowledgeEntries.filter((e) => e.status !== "flagged"),
          ];
          return (
            <div className="space-y-5 text-xs" data-testid="community-knowledge-library">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const check = validateSafeCommunityContribution({
                    title: contribTitle,
                    summary: contribSummary,
                    stepsText: contribSteps,
                  });
                  if (!check.ok) {
                    toast.error(check.reason ?? "Contribution failed safety check.");
                    return;
                  }
                  updateEco((prev) => ({
                    ...prev,
                    communityKnowledgeEntries: [
                      {
                        id: `ck_${Date.now().toString(36)}`,
                        title: contribTitle.trim(),
                        subject: contribSubject,
                        grade: contribGrade,
                        summary: contribSummary.trim(),
                        steps: contribSteps
                          .split("\n")
                          .map((s) => s.trim())
                          .filter(Boolean),
                        authorAlias: displayName || `${BRAND.shortName} Student`,
                        status: "pending_review",
                        votes: 1,
                        createdAt: new Date().toISOString(),
                      },
                      ...prev.communityKnowledgeEntries,
                    ],
                  }));
                  setContribTitle("");
                  setContribSummary("");
                  setContribSteps("");
                  toast.success(
                    "Submitted study guide to the educator moderation queue (zero unmoderated public exposure).",
                  );
                }}
                className="surface-card space-y-3 p-5"
              >
                <h3 className="font-display text-base font-bold text-foreground">
                  48 &amp; 50. Contribute to the Moderated Community Knowledge Library
                </h3>
                <p className="text-muted-foreground">
                  Share clear concept explanations or step-by-step memory tricks. Automatic PII
                  filters block emails/phone numbers and educator staff review every entry before
                  public approval.
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input
                    value={contribTitle}
                    onChange={(e) => setContribTitle(e.target.value)}
                    placeholder="Guide Title (e.g., Balancing Chemical Equations)"
                    className="text-xs sm:col-span-2"
                  />
                  <select
                    value={contribSubject}
                    onChange={(e) => setContribSubject(e.target.value)}
                    aria-label="Contribution subject"
                    className="h-9 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Coding & AI">Coding &amp; AI</option>
                  </select>
                </div>
                <Input
                  value={contribGrade}
                  onChange={(e) => setContribGrade(e.target.value)}
                  placeholder="Grade Band (e.g., Grades 8–10)"
                  className="text-xs"
                />
                <Textarea
                  rows={2}
                  value={contribSummary}
                  onChange={(e) => setContribSummary(e.target.value)}
                  placeholder="Plain-language explanation (no personal contact info)..."
                  className="text-xs"
                />
                <Textarea
                  rows={2}
                  value={contribSteps}
                  onChange={(e) => setContribSteps(e.target.value)}
                  placeholder="Step-by-step bullets (one step per line)..."
                  className="text-xs"
                />
                <Button type="submit" size="sm" variant="glow">
                  <Plus className="size-3.5" />
                  <span>Submit for Moderation Review</span>
                </Button>
              </form>

              <div className="grid gap-4 md:grid-cols-2">
                {allGuides.map((g) => (
                  <div key={g.id} className="surface-card space-y-2 p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-primary">
                        {g.subject} · {g.grade}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                          g.status === "approved"
                            ? "bg-success/15 text-success"
                            : "bg-xp/15 text-xp"
                        }`}
                      >
                        {g.status === "approved" ? "Approved Guide" : "Pending Staff Review"}
                      </span>
                    </div>
                    <h4 className="font-display text-sm font-bold text-foreground">{g.title}</h4>
                    <p className="text-muted-foreground">{g.summary}</p>
                    {g.steps.length > 0 && (
                      <ol className="list-decimal ps-4 space-y-0.5 text-foreground/90">
                        {g.steps.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ol>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-border text-[11px] text-muted-foreground">
                      <span>By {g.authorAlias}</span>
                      <span>Helpful Votes: {g.votes}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Volunteer Knowledge Program (Section 9D) */}
              <div className="surface-card space-y-4 p-5" data-testid="volunteer-knowledge-program">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Volunteer Knowledge Program (Supervised Contributions)
                  </h3>
                  <p className="text-muted-foreground">
                    Help expand equal access through supervised translation, proofreading,
                    accessibility alt-text checks, and readability reviews. Personal contact links
                    are blocked automatically and every submission enters coordinator review.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const check = validateVolunteerContribution({
                      summary: volSummary,
                      targetResourceId: volTargetId,
                      supervisorApproved: volSupervisorOk,
                    });
                    if (!check.ok) {
                      toast.error(check.reason ?? "Contribution needs correction.");
                      return;
                    }
                    updateEco((prev) => ({
                      ...prev,
                      volunteerContributions: [
                        {
                          id: `vol_${Date.now().toString(36)}`,
                          kind: volKind,
                          language: volLang.trim() || "English",
                          targetResourceId: volTargetId,
                          summary: volSummary.trim(),
                          supervisorApproved: true,
                          status: "pending_review",
                          createdAt: new Date().toISOString(),
                        },
                        ...prev.volunteerContributions,
                      ],
                    }));
                    setVolSummary("");
                    setVolSupervisorOk(false);
                    toast.success("Submitted volunteer knowledge improvement to moderation queue.");
                  }}
                  className="space-y-2.5"
                >
                  <div className="grid gap-2 sm:grid-cols-3">
                    <select
                      value={volKind}
                      onChange={(e) => setVolKind(e.target.value as VolunteerTaskKind)}
                      aria-label="Volunteer contribution type"
                      className="h-9 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground"
                    >
                      <option value="translation">Bilingual Translation</option>
                      <option value="proofreading">Proofreading &amp; Clarity</option>
                      <option value="accessibility_improvement">
                        Accessibility / Alt-Text Review
                      </option>
                      <option value="content_review">Source &amp; Fact Review</option>
                    </select>
                    <select
                      value={volTargetId}
                      onChange={(e) => setVolTargetId(e.target.value)}
                      aria-label="Target open library resource"
                      className="h-9 rounded-md border border-input bg-surface-2 px-2 text-xs text-foreground sm:col-span-2"
                    >
                      {OPEN_LEARNING_LIBRARY.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title} ({r.subject})
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    value={volLang}
                    onChange={(e) => setVolLang(e.target.value)}
                    placeholder="Working Language (e.g., Arabic / English)"
                    className="text-xs"
                  />
                  <Textarea
                    rows={2}
                    value={volSummary}
                    onChange={(e) => setVolSummary(e.target.value)}
                    placeholder="Describe your proposed translation, readability edit, or accessibility alt-text..."
                    className="text-xs"
                  />
                  <label className="flex items-start gap-2 rounded-lg border border-border bg-surface-2/60 p-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={volSupervisorOk}
                      onChange={(e) => setVolSupervisorOk(e.target.checked)}
                      className="mt-0.5 accent-primary"
                    />
                    <span>
                      I confirm this contribution contains no personal contact info and is submitted
                      under educator/coordinator supervision.
                    </span>
                  </label>
                  <Button type="submit" size="sm" variant="outline">
                    <Plus className="size-3.5" />
                    <span>Queue Volunteer Contribution</span>
                  </Button>
                </form>

                {ecoState.volunteerContributions.length > 0 && (
                  <div className="space-y-2 border-t border-border pt-3">
                    <div className="font-semibold text-foreground">
                      Your Volunteer Queue ({ecoState.volunteerContributions.length})
                    </div>
                    {ecoState.volunteerContributions.map((v) => (
                      <div
                        key={v.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface-2/60 p-2.5"
                      >
                        <div>
                          <div className="font-semibold text-foreground">
                            {v.kind.replace(/_/g, " ")} · {v.language}
                          </div>
                          <div className="text-muted-foreground">{v.summary}</div>
                        </div>
                        <span className="font-mono text-[11px] uppercase text-primary">
                          {v.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      {/* GIRLS' SPACE — WELCOMING, SAFE & PRIVACY-PROTECTED EDUCATIONAL LEADERSHIP */}
      {hubSection === "girls_space" && (
        <div className="space-y-6 text-xs" data-testid="girls-space-hub">
          {/* Hero Safety & Empowerment Banner with gentle Rose & Lavender accents */}
          <div className="surface-card relative overflow-hidden rounded-2xl border border-rose-500/35 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-surface-2 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                  <HeartHandshake className="size-4" />
                  <span>
                    {lang === "ar"
                      ? "مساحة الفتيات · خصوصية تامة ولا يتم الكشف عن العضوية علناً"
                      : "Girls' Space · Privacy-Protected · Membership & Gender Never Publicly Disclosed"}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {lang === "ar"
                    ? "مساحة تعليمية وقيادية آمنة ومحمية الخصوصية لطالبات العلم"
                    : "Welcoming, Safe & Privacy-Protected Educational Leadership Space"}
                </h3>
                <p className="max-w-2xl text-xs text-muted-foreground leading-relaxed">
                  {lang === "ar"
                    ? "منصة داعمة ومحترمة ومحمية الخصوصية تمكن الطالبات من قيادة أفرقة البحث العلمي، ومناقشة التحديات التقنية، والتعاون في مسارات STEM ونماذج المحاكاة الدبلوماسية."
                    : "A dedicated, safe, and moderated space for female students to connect, learn, mentor, and lead in STEM, public speaking, and community innovation."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <FeatureGuideTrigger featureId="girls-space" />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReportTarget({ type: "circle", id: "girls_space" });
                    setReportReason("inappropriate");
                    setReportDetails("Moderator support request from Girls' Space");
                  }}
                  className="gap-1.5 border-primary/30 text-xs cursor-pointer"
                >
                  <ShieldAlert className="size-3.5 text-primary" />
                  <span>{lang === "ar" ? "طلب مساعدة المشرفات" : "Ask Moderator Help"}</span>
                </Button>
              </div>
            </div>

            {/* Zero Tolerance Safeguards Notice */}
            <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-border bg-surface-2/70 p-3 text-xs text-muted-foreground">
              <ShieldAlert className="size-4 shrink-0 text-primary" />
              <span>
                {lang === "ar"
                  ? "سياسة عدم التسامح مطلقاً مع التنمر أو المضايقة: تتم حماية خصوصية جميع الطالبات، وتتم مراجعة المحتوى دورياً لضمان بيئة تعليمية داعمة ومحفزة."
                  : "Zero-Tolerance Anti-Bullying Safeguard: Student privacy is strictly protected. All peer interactions adhere to respectful academic collaboration standards."}
              </span>
            </div>
          </div>

          {/* 4 Core Pillars of Girls' Space */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="surface-card space-y-2 p-4">
              <span className="text-xl">👩‍💻</span>
              <h4 className="font-bold text-foreground">
                {lang === "ar" ? "الذكاء الاصطناعي والروبوتات" : "AI & Robotics Circle"}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {lang === "ar"
                  ? "برمجة بايثون، الذكاء الاصطناعي التوليدي، وتحديات الروبوتات والابتكار الهندسي."
                  : "Python engineering, generative AI research, algorithmic challenges, and robotics competitions."}
              </p>
              <span className="inline-flex items-center text-[10px] font-semibold text-primary">
                {lang === "ar" ? "١٢ حلقة نقاش نشطة" : "12 Active Study Cohorts"}
              </span>
            </div>

            <div className="surface-card space-y-2 p-4">
              <span className="text-xl">🧬</span>
              <h4 className="font-bold text-foreground">
                {lang === "ar" ? "العلوم الطبية والحيوية" : "Biomedical & Life Sciences"}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {lang === "ar"
                  ? "أحياء متقدمة، كيمياء حيوية، والاستعداد لمسابقات الأولمبياد والدراسات الطبية."
                  : "Genetics, cellular biology, organic chemistry, and medical olympiad study groups."}
              </p>
              <span className="inline-flex items-center text-[10px] font-semibold text-primary">
                {lang === "ar" ? "٨ حلقات دراسية" : "8 Active Study Cohorts"}
              </span>
            </div>

            <div className="surface-card space-y-2 p-4">
              <span className="text-xl">📐</span>
              <h4 className="font-bold text-foreground">
                {lang === "ar" ? "الرياضيات والمنطق التحليلي" : "Quantitative Mastery"}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {lang === "ar"
                  ? "حل المسائل المتقدمة، نظرية الأعداد، والتفكير الرياضي والتفكير المنطقي الأولمبي."
                  : "Advanced calculus, discrete mathematics, analytical puzzles, and proof writing."}
              </p>
              <span className="inline-flex items-center text-[10px] font-semibold text-primary">
                {lang === "ar" ? "١٥ مجموعة تفاعلية" : "15 Interactive Groups"}
              </span>
            </div>

            <div className="surface-card space-y-2 p-4">
              <span className="text-xl">🎙️</span>
              <h4 className="font-bold text-foreground">
                {lang === "ar"
                  ? "القيادة الدبلوماسية ونموذج الأمم المتحدة"
                  : "Diplomacy & MUN Leadership"}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {lang === "ar"
                  ? "مهارات الإلقاء والخطابة، التفاوض، وصياغة القرارات الدولية والقيادة المجتمعية."
                  : "Rhetoric, parliamentary procedure, resolution drafting, and youth delegation prep."}
              </p>
              <span className="inline-flex items-center text-[10px] font-semibold text-primary">
                {lang === "ar" ? "١٠ وفود طلابية" : "10 Student Delegations"}
              </span>
            </div>
          </div>

          {/* Featured Safe Mentorship Cohorts */}
          <div className="surface-card space-y-3 p-5">
            <div>
              <h4 className="font-display text-sm font-bold text-foreground">
                {lang === "ar"
                  ? "حلقات التمكين والتوجيه الأكاديمي المعتمدة"
                  : "Curated Mentorship & Study Circles"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {lang === "ar"
                  ? "انضمي إلى حلقة دراسية معتمدة مع مشرفات ومعلمات مؤهلات في بيئة خاصة ومحمية."
                  : "Join verified student study circles guided by mentors and high-achieving peers in a safe environment."}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {[
                {
                  id: "gs-cohort-1",
                  title:
                    lang === "ar"
                      ? "حلقة هندسة الذكاء الاصطناعي للبنات"
                      : "Girls in AI & Machine Learning",
                  mentor: "Dr. Sarah A. · AI Researcher",
                  focus: "Python, Neural Networks, PyTorch",
                  members: 14,
                  tag: "STEM",
                },
                {
                  id: "gs-cohort-2",
                  title:
                    lang === "ar"
                      ? "حلقة التحضير للأولمبياد العلمي الطبي"
                      : "Biomedical Science Olympiad Prep",
                  mentor: "Noura Al-K. · Medical Sciences",
                  focus: "Human Physiology, Genetics, Lab Skills",
                  members: 18,
                  tag: "Medicine",
                },
                {
                  id: "gs-cohort-3",
                  title:
                    lang === "ar"
                      ? "نادي الخطابة والقيادة الطلابية الدبلوماسية"
                      : "Female Leaders in MUN & Rhetoric",
                  mentor: "Reem H. · MUN Delegate Coach",
                  focus: "Public Speaking, International Law, Debate",
                  members: 22,
                  tag: "Leadership",
                },
                {
                  id: "gs-cohort-4",
                  title:
                    lang === "ar"
                      ? "حلقة الخوارزميات وحل المشكلات الرياضية"
                      : "Competitive Math & Algorithmics",
                  mentor: "Laila M. · Math Olympiad Coach",
                  focus: "Combinatorics, Number Theory, Geometry",
                  members: 11,
                  tag: "Math",
                },
              ].map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col justify-between rounded-xl border border-border bg-surface-2/60 p-4 space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {c.tag}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {c.members} {lang === "ar" ? "طالبة" : "Students"}
                      </span>
                    </div>
                    <h5 className="font-bold text-foreground text-xs">{c.title}</h5>
                    <p className="text-[11px] text-muted-foreground">{c.mentor}</p>
                    <p className="text-[11px] text-foreground/80 font-mono">{c.focus}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="glow"
                    className="w-full text-xs cursor-pointer"
                    onClick={() =>
                      toast.success(
                        lang === "ar"
                          ? "تم إرسال طلب الانضمام إلى الحلقة الدراسية بنجاح"
                          : "Requested to join Girls' Study Circle",
                      )
                    }
                  >
                    {lang === "ar" ? "طلب الانضمام للحلقة الآمنة" : "Request to Join Safe Circle"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create or Join Team */}
      {hubSection === "teams" && (
        <div className="grid gap-4 md:grid-cols-2">
          <form onSubmit={handleCreateTeam} className="surface-card space-y-3 p-5">
            <h2 className="font-display text-sm font-bold text-foreground">
              {t("circle.createTeam")}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder={t("circle.teamName")}
              />
              <Input
                value={teamSubject}
                onChange={(e) => setTeamSubject(e.target.value)}
                placeholder={t("study.subject")}
              />
            </div>
            <Input
              value={sharedGoal}
              onChange={(e) => setSharedGoal(e.target.value)}
              placeholder={t("circle.sharedGoal")}
            />
            <Button type="submit" variant="glow" size="sm" disabled={busy}>
              <Plus className="size-3.5" />
              <span>{t("circle.createTeam")} (+25 XP)</span>
            </Button>
          </form>

          <form
            onSubmit={handleJoinTeam}
            className="surface-card flex flex-col justify-between space-y-3 p-5"
          >
            <div className="space-y-2">
              <h2 className="font-display text-sm font-bold text-foreground">
                {t("circle.joinTeam")}
              </h2>
              <Input
                required
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
                placeholder={t("circle.inviteCode")}
                className="font-mono uppercase"
              />
            </div>
            <Button type="submit" variant="outline" size="sm" disabled={busy}>
              <Users className="size-3.5" />
              <span>{t("circle.joinBtn")}</span>
            </Button>
          </form>
        </div>
      )}

      {/* Active Teams List */}
      {hubSection === "teams" && circles.length > 0 && activeCircle && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {circles.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedCircleId(c.id);
                  setConfirmLeave(false);
                  setEditingGoal(false);
                }}
                className={`rounded-xl border px-3.5 py-2 text-xs font-semibold ${
                  activeCircle.id === c.id
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="surface-card space-y-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/80 pb-4">
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-foreground">
                  {activeCircle.name}
                </h3>
                {editingGoal ? (
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={goalDraft}
                      onChange={(e) => setGoalDraft(e.target.value)}
                      placeholder={t("circle.sharedGoal")}
                      className="h-7 w-64 text-xs"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="glow"
                      className="h-7 text-xs"
                      onClick={async () => {
                        await updateCircleGoal(activeCircle, goalDraft.trim() || null);
                        setEditingGoal(false);
                        toast.success(t("common.save"));
                      }}
                    >
                      {t("common.save")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => setEditingGoal(false)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{activeCircle.shared_goal || t("circle.sharedGoal")}</span>
                    {activeCircle.owner_id === user?.uid && (
                      <button
                        type="button"
                        onClick={() => {
                          setGoalDraft(activeCircle.shared_goal ?? "");
                          setEditingGoal(true);
                        }}
                        aria-label={t("circle.editGoal")}
                        className="text-primary hover:underline"
                      >
                        <Pencil className="size-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(activeCircle.invite_code);
                    toast.success(activeCircle.invite_code);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-1 font-mono text-xs font-semibold text-primary"
                >
                  <span>{activeCircle.invite_code}</span>
                  <Copy className="size-3" />
                </button>
                {activeCircle.owner_id !== user?.uid &&
                  (confirmLeave ? (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs"
                        onClick={() => leaveCircle(activeCircle)}
                      >
                        {t("circle.leaveConfirm")}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setConfirmLeave(false)}
                      >
                        {t("common.cancel")}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmLeave(true)}
                    >
                      <LogOut className="size-3.5" />
                      <span>{t("circle.leaveTeam")}</span>
                    </Button>
                  ))}
              </div>
            </div>

            {taskPosts.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">
                    {t("circle.taskProgress")}
                  </span>
                  <span className="font-mono tabular-nums text-primary">
                    {formatNumber(doneTaskCount, lang)}/{formatNumber(taskPosts.length, lang)} (
                    {formatNumber(taskProgressPct, lang)}%)
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-sm bg-surface-2">
                  <div
                    className="h-full bg-gradient-primary transition-all"
                    style={{ width: `${taskProgressPct}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {(
                  ["feed", "tasks", "resources", "showcase", "members", "mun", "global"] as const
                ).map((tb) => (
                  <button
                    key={tb}
                    type="button"
                    onClick={() => {
                      setTab(tb);
                      if (tb === "tasks") setPostKind("task");
                      else if (tb === "resources") setPostKind("resource");
                      else if (tb === "feed") setPostKind("discussion");
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      tab === tb
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-2 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tb === "showcase"
                      ? "Student Showcase"
                      : tb === "mun"
                        ? "MUN Simulator (#37)"
                        : tb === "global"
                          ? "Global & Culture (#30–35)"
                          : t(`circle.tab.${tb}`)}
                  </button>
                ))}
              </div>

              {tab !== "members" && tab !== "showcase" && (
                <div className="relative sm:w-56">
                  <Search className="pointer-events-none absolute start-2.5 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    value={postSearch}
                    onChange={(e) => setPostSearch(e.target.value)}
                    placeholder={t("circle.searchPh")}
                    className="h-8 ps-8 text-xs"
                  />
                </div>
              )}
            </div>

            {tab === "showcase" ? (
              <div className="space-y-4 text-xs">
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-muted-foreground">
                  Only projects you explicitly marked <strong>Showcase Opt-In: ON</strong> in Future
                  / Portfolio appear here. Never share personal contact details or private student
                  records.
                </div>
                {ecoState.portfolio.projects.filter((p) => p.showcaseOptIn).length === 0 ? (
                  <p className="py-6 text-center text-muted-foreground">
                    No opted-in showcase projects yet. Create one under Future → Step-by-Step
                    Project Builder and toggle Showcase Opt-In!
                  </p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {ecoState.portfolio.projects
                      .filter((p) => p.showcaseOptIn)
                      .map((proj) => (
                        <div
                          key={proj.id}
                          className="space-y-2 rounded-xl border border-border bg-surface-2 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary uppercase text-[0.65rem]">
                              {proj.category}
                            </span>
                            <span className="font-mono text-[0.68rem] text-muted-foreground">
                              {proj.stepsCompleted}/{proj.totalSteps} milestones
                            </span>
                          </div>
                          <h4 className="font-display text-sm font-bold text-foreground">
                            {proj.title}
                          </h4>
                          <p className="text-muted-foreground">{proj.summary}</p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-[0.7rem]"
                            onClick={async () => {
                              await createCirclePost({
                                circle: activeCircle,
                                authorName: displayName,
                                kind: "discussion",
                                title: `[Showcase] ${proj.title}`,
                                body: `${proj.category} · ${proj.summary}`,
                              });
                              setTab("feed");
                              toast.success("Shared project highlight to team feed!");
                            }}
                          >
                            Share Highlight to {activeCircle.name}
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : tab !== "members" ? (
              <div className="grid gap-6 lg:grid-cols-3">
                <form
                  onSubmit={handleCreatePost}
                  className="space-y-2.5 rounded-xl border border-border bg-surface-2 p-4 lg:col-span-1"
                >
                  <select
                    value={postKind}
                    onChange={(e) =>
                      setPostKind(e.target.value as "discussion" | "resource" | "task")
                    }
                    aria-label="Post type"
                    className="h-8 w-full rounded-md border border-input bg-surface px-2 text-xs text-foreground"
                  >
                    <option value="discussion">{t("circle.postKind.discussion")}</option>
                    <option value="resource">{t("circle.postKind.resource")}</option>
                    <option value="task">{t("circle.postKind.task")}</option>
                  </select>
                  <Input
                    required
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder={t("circle.postTitle")}
                  />
                  <Textarea
                    rows={3}
                    value={postBody}
                    onChange={(e) => setPostBody(e.target.value)}
                    placeholder={t("circle.postBody")}
                  />
                  {postKind === "resource" && (
                    <Input
                      type="url"
                      value={postUrl}
                      onChange={(e) => setPostUrl(e.target.value)}
                      placeholder={t("circle.postUrl")}
                    />
                  )}
                  {postKind === "task" && (
                    <Input
                      value={postAssignee}
                      onChange={(e) => setPostAssignee(e.target.value)}
                      placeholder={t("circle.assignee")}
                    />
                  )}
                  <Button type="submit" variant="glow" size="sm" className="w-full" disabled={busy}>
                    {t("circle.publish")}
                  </Button>
                  <Button
                    type="button"
                    variant={showVisualStudio ? "glow" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => setShowVisualStudio((s) => !s)}
                  >
                    <ImageIcon className="size-3.5" />
                    <span>{t("p5.image.title")}</span>
                  </Button>
                </form>

                <div className="space-y-3 lg:col-span-2">
                  {showVisualStudio && (
                    <AppErrorBoundary
                      fallbackTitle="Visual Aid Studio encountered a problem"
                      fallbackDesc="Image upload or generation reset safely. Your circle draft is intact."
                    >
                      <VisualAidStudio
                        defaultPrompt={`${activeCircle.subject || activeCircle.name} study diagram`}
                        onAttachCaption={(cap) => {
                          setPostBody((prev) => (prev ? `${prev}\n${cap}` : cap));
                          if (!postTitle.trim()) setPostTitle("Team Study Diagram");
                        }}
                      />
                    </AppErrorBoundary>
                  )}
                  {filteredPosts.map((post) => {
                    const safeUrl = sanitizeHttpUrl(post.resource_url);
                    const liked = Boolean(user?.uid && post.helpful_uids.includes(user.uid));
                    const isAuthor = Boolean(user?.uid && post.author_id === user.uid);
                    const isEditing = editingPostId === post.id;
                    return (
                      <div
                        key={post.id}
                        className="rounded-xl border border-border bg-surface-2 p-4 text-xs"
                      >
                        {isEditing ? (
                          <div className="space-y-2.5">
                            <Input
                              value={editPostTitle}
                              onChange={(e) => setEditPostTitle(e.target.value)}
                              className="h-8 text-xs"
                            />
                            <Textarea
                              rows={3}
                              value={editPostBody}
                              onChange={(e) => setEditPostBody(e.target.value)}
                              className="text-xs"
                            />
                            <div className="flex justify-end gap-1.5">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingPostId(null)}
                              >
                                {t("common.cancel")}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="glow"
                                disabled={!editPostTitle.trim()}
                                onClick={async () => {
                                  await updateCirclePost(post, {
                                    title: editPostTitle.trim(),
                                    body: editPostBody.trim() || null,
                                  });
                                  setEditingPostId(null);
                                  toast.success(t("common.save"));
                                }}
                              >
                                {t("circle.post.save")}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {post.kind === "task" && (
                                  <button
                                    type="button"
                                    onClick={() => togglePostStatus(post)}
                                    aria-label={post.title}
                                  >
                                    {post.status === "done" ? (
                                      <CheckCircle2 className="size-4 text-success" />
                                    ) : (
                                      <Circle className="size-4 text-muted-foreground" />
                                    )}
                                  </button>
                                )}
                                <div>
                                  <h4 className="font-display text-sm font-bold text-foreground">
                                    {post.title}
                                  </h4>
                                  <span className="text-[0.68rem] text-muted-foreground">
                                    {post.author_name}
                                    {post.assignee_name ? ` → ${post.assignee_name}` : ""}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={liked ? "default" : "ghost"}
                                  className="h-7 gap-1 px-2 text-[0.68rem]"
                                  onClick={() => toggleHelpful(post)}
                                >
                                  <ThumbsUp className="size-3" />
                                  <span>{post.helpful_uids.length}</span>
                                </Button>
                                {isAuthor && (
                                  <>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 gap-1 px-2 text-[0.68rem] text-muted-foreground hover:text-primary"
                                      onClick={() => {
                                        setEditingPostId(post.id);
                                        setEditPostTitle(post.title);
                                        setEditPostBody(post.body ?? "");
                                      }}
                                    >
                                      <Pencil className="size-3" />
                                      <span>{t("circle.post.edit")}</span>
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 gap-1 px-2 text-[0.68rem] text-muted-foreground hover:text-destructive"
                                      onClick={async () => {
                                        await deleteCirclePost(post);
                                        toast.info(t("common.delete"));
                                      }}
                                    >
                                      <Trash2 className="size-3" />
                                      <span>{t("circle.post.delete")}</span>
                                    </Button>
                                  </>
                                )}
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 gap-1 px-2 text-[0.68rem] text-muted-foreground hover:text-destructive"
                                  onClick={() => setReportTarget({ type: "post", id: post.id })}
                                >
                                  <Flag className="size-3" />
                                  <span>{t("circle.report")}</span>
                                </Button>
                              </div>
                            </div>
                            {post.body && (
                              <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                                {post.body}
                              </p>
                            )}
                            {safeUrl && (
                              <a
                                href={safeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                              >
                                <span>{t("opp.openOfficial")}</span>
                                <ExternalLink className="size-3" />
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((m) => (
                  <div
                    key={m.uid}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface-2 p-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-foreground">{m.display_name}</div>
                      <div className="text-[0.68rem] text-muted-foreground">
                        {m.show_progress
                          ? `${t("common.level")} ${formatNumber(m.level_snapshot ?? 1, lang)} · ${formatNumber(m.xp_snapshot ?? 0, lang)} ${t("common.xp")}`
                          : t("circle.progressHidden")}
                      </div>
                    </div>
                    <span className="border-s-2 border-primary ps-2 text-[0.68rem] font-medium capitalize text-muted-foreground">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {tab === "mun" && <MunSimulatorPanel />}
            {tab === "global" && <GlobalCultureHub />}
          </div>
        </div>
      )}

      {/* Safety Report Dialog */}
      <Dialog open={reportTarget !== null} onOpenChange={(o) => !o && setReportTarget(null)}>
        <DialogContent className="surface-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{t("circle.reportTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="rep-reason" className="text-xs">
                {t("circle.reportReason")}
              </Label>
              <select
                id="rep-reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value as ModerationReportRow["reason"])}
                className="h-9 w-full rounded-md border border-input bg-surface-2 px-3 text-xs text-foreground"
              >
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="pii_sharing">Personal Contact / PII Sharing</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Textarea
              rows={3}
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder={t("circle.postBody")}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setReportTarget(null)}>
              {t("common.cancel")}
            </Button>
            <Button type="button" variant="destructive" onClick={handleSubmitReport}>
              {t("circle.reportSubmit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
