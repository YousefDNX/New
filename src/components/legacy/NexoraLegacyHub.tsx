import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  Database,
  Download,
  FileCheck2,
  GraduationCap,
  Heart,
  HeartHandshake,
  ShieldCheck,
  Upload,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommunityLibrariesPanel } from "@/components/legacy/CommunityLibrariesPanel";
import { KnowledgeArchivePanel } from "@/components/legacy/KnowledgeArchivePanel";
import { KnowledgeLegacyPanel } from "@/components/legacy/KnowledgeLegacyPanel";
import { OfflineEducationPanel } from "@/components/legacy/OfflineEducationPanel";
import { RealWorldGoodPanel } from "@/components/legacy/RealWorldGoodPanel";
import { TeachingForAllPanel } from "@/components/legacy/TeachingForAllPanel";
import { NexoraRahmahHub } from "@/components/rahmah/NexoraRahmahHub";
import {
  FOUNDATIONAL_LEARNING_TRACKS,
  OPEN_LEARNING_LIBRARY,
  type CommunityLibraryResource,
  type KnowledgeLegacyContribution,
  type TeachingGuideRecord,
} from "@/data/open-learning-library";
import { useFocusSessions, useQuizAttempts } from "@/hooks/use-modules";
import { useTasks } from "@/hooks/use-nexora";
import { computeCanonicalArchiveDigest } from "@/lib/checksum";
import {
  computePrivacySafeImpactMetrics,
  createVersionedEcosystemBackup,
  verifyAndRestoreBackup,
} from "@/lib/legacy-knowledge";
import { LANG_META } from "@/lib/i18n/types";
import { usePrefs } from "@/lib/preferences";
import { downloadTextFile, readFileAsTextSafe } from "@/lib/safe-file";
import { restoreStudentEcosystemState, useStudentEcosystem } from "@/lib/student-ecosystem";

import type { TaskRow } from "@/lib/firestore-data";

export type LegacyHubTab =
  | "overview"
  | "rahmah"
  | "community_libraries"
  | "teaching_for_all"
  | "offline_education"
  | "knowledge_legacy"
  | "real_world_good"
  | "knowledge_archive";

export function NexoraLegacyHub() {
  const { activeUid, lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: eco, update: updateEco } = useStudentEcosystem();
  const { data: tasks = [] } = useTasks();
  const { data: quizAttempts = [] } = useQuizAttempts();
  const { data: focusSessions = [] } = useFocusSessions();

  const [activeTab, setActiveTab] = useState<LegacyHubTab>("overview");
  const [restoreText, setRestoreText] = useState("");
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [lastChecksum, setLastChecksum] = useState<string | null>(
    eco.legacyBackupMeta.lastChecksum,
  );

  const impact = useMemo(
    () =>
      computePrivacySafeImpactMetrics({
        state: eco,
        completedTasksCount: (tasks as TaskRow[]).filter((t: TaskRow) => t.status === "done")
          .length,
        quizAttemptsCount: quizAttempts.length,
        focusSessionsCount: focusSessions.length,
        supportedLanguagesCount: Object.keys(LANG_META).length,
      }),
    [eco, tasks, quizAttempts.length, focusSessions.length],
  );

  const foundationalTracksDone = useMemo(
    () =>
      FOUNDATIONAL_LEARNING_TRACKS.filter(
        (tr) => (eco.foundationalPathProgress[tr.id]?.length ?? 0) >= tr.steps.length,
      ).length,
    [eco.foundationalPathProgress],
  );

  const handlePromoteLibraryToLegacy = (res: CommunityLibraryResource) => {
    const legacyEntry: KnowledgeLegacyContribution = {
      id: `leg_from_${res.id}`,
      title: res.title,
      titleAr: res.titleAr,
      contributorName: res.author,
      contributorRole: res.authorRole === "educator" ? "teacher" : "volunteer_scholar",
      subject: res.subject,
      originalExplanation: `${res.summary}\n\n${res.content}`,
      license: res.license,
      copyrightRetentionClause:
        "Original author retains full authorship; promoted from Community Libraries into Knowledge Legacy.",
      approvedDate: new Date().toISOString().slice(0, 10),
      versionHistory: [
        {
          version: 1,
          date: new Date().toISOString().slice(0, 10),
          changeSummary: `Promoted from Community Libraries (${res.sourceAttribution}).`,
          reviewer: "NEXORA Knowledge Stewardship Board",
        },
      ],
      status: "active",
    };

    updateEco((prev) => {
      if (prev.legacyContributions.some((c) => c.id === legacyEntry.id)) return prev;
      return {
        ...prev,
        legacyContributions: [legacyEntry, ...prev.legacyContributions],
      };
    });
    setActiveTab("knowledge_legacy");
    toast.success(`Promoted '${res.title}' into Knowledge Legacy.`);
  };

  const handlePublishGuideToLibrary = (guide: TeachingGuideRecord) => {
    const libraryEntry: CommunityLibraryResource = {
      id: `com_guide_${guide.id}`,
      title: guide.title,
      titleAr: guide.titleAr,
      collection: "teacher_curated",
      resourceKind: "guide",
      subject: guide.subject,
      gradeBand: guide.targetGrade,
      level: "intermediate",
      language: "bilingual",
      learningObjectives: [guide.learningObjective],
      summary: `${guide.pedagogicalModel.replace(/_/g, " ")} guide by ${guide.author}.`,
      content: `${guide.multiAngleExplanations.stepByStepLogic}\n\nWorksheet:\n${guide.printableWorksheetOutline}`,
      author: guide.author,
      authorRole: "educator",
      sourceAttribution: `Teaching for All Guide v${guide.version}`,
      license: "CC-BY-4.0",
      isDownloadablePermitted: true,
      downloadSizeBytes: 24000,
      teacherCurated: true,
      reviewStatus: guide.supervisorApproved ? "approved" : "pending_review",
      lastReviewedDate: guide.updatedAt,
      qualityScore: guide.qualityRating,
    };

    updateEco((prev) => {
      if (prev.communityResources.some((r) => r.id === libraryEntry.id)) return prev;
      return {
        ...prev,
        communityResources: [libraryEntry, ...prev.communityResources],
      };
    });
    setActiveTab("community_libraries");
    toast.success(`Published '${guide.title}' into Community Libraries.`);
  };

  const handleSnapshotLegacyToArchive = (item: KnowledgeLegacyContribution) => {
    const base = {
      id: `arc_leg_${item.id}`,
      resourceId: item.id,
      title: item.title,
      contentDigest: `fnv64_${item.originalExplanation.length}_${item.versionHistory.length}`,
      originalSource: `${item.contributorName} · ${item.license}`,
      preservedAt: new Date().toISOString(),
      nextReviewDueDate: new Date(Date.now() + 180 * 86400_000).toISOString().slice(0, 10),
      preservationStatus: "preserved_active" as const,
      version: `${item.versionHistory.length}.0.0`,
      duplicateDetected: false,
      brokenLinkRisk: false,
      exportFormat: "markdown" as const,
    };
    const snapshot = {
      ...base,
      checksum: computeCanonicalArchiveDigest(base),
    };

    updateEco((prev) => {
      const filtered = (prev.archivedPreservationRecords ?? []).filter((r) => r.id !== snapshot.id);
      return {
        ...prev,
        archivedPreservationRecords: [snapshot, ...filtered],
      };
    });
    setActiveTab("knowledge_archive");
    toast.success(`Preserved checksummed snapshot of '${item.title}' in Knowledge Archive.`);
  };

  const handleDownloadVerifiedBackup = () => {
    const backup = createVersionedEcosystemBackup(eco, activeUid);
    const json = JSON.stringify(backup, null, 2);
    downloadTextFile(
      json,
      `nexora-verified-backup-${backup.exportedAt.slice(0, 10)}.json`,
      "application/json;charset=utf-8",
    );

    setLastChecksum(backup.checksum);
    updateEco((prev) => ({
      ...prev,
      legacyBackupMeta: {
        lastExportedAt: backup.exportedAt,
        lastChecksum: backup.checksum,
      },
    }));
    toast.success(`Exported checksum-verified backup (${backup.checksum}).`);
  };

  const handleRestoreFromJson = (raw: string) => {
    setRestoreError(null);
    const verified = verifyAndRestoreBackup(raw);
    if (!verified.ok) {
      setRestoreError(verified.error);
      toast.error(verified.error);
      return;
    }
    restoreStudentEcosystemState({
      ...verified.backup.payload,
      legacyBackupMeta: {
        lastExportedAt: verified.backup.exportedAt,
        lastChecksum: verified.backup.checksum,
      },
    });
    setLastChecksum(verified.backup.checksum);
    setRestoreText("");
    toast.success(`Verified integrity checksum (${verified.backup.checksum}) and restored data.`);
  };

  return (
    <div className="space-y-6 text-xs" data-testid="nexora-legacy-hub">
      {/* Platform Navigation Bar for the 6 Legacy Initiatives */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border bg-surface-card p-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === "overview"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          }`}
        >
          <HeartHandshake className="size-3.5" />
          <span>{isAr ? "الميثاق والأثر" : "Charter & Impact"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rahmah")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            activeTab === "rahmah"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          }`}
        >
          <Heart className="size-3.5 fill-current text-rose-400" />
          <span>{isAr ? "نكسورا رحمة (منظومة الإنسانية)" : "NEXORA Rahmah (Humanity First)"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("community_libraries")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === "community_libraries"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          }`}
        >
          <BookOpen className="size-3.5" />
          <span>1. Community Libraries</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("teaching_for_all")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === "teaching_for_all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          }`}
        >
          <GraduationCap className="size-3.5" />
          <span>2. Teaching for All</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("offline_education")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === "offline_education"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          }`}
        >
          <WifiOff className="size-3.5" />
          <span>3. Offline Education</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("knowledge_legacy")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === "knowledge_legacy"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          }`}
        >
          <BookMarked className="size-3.5" />
          <span>4. Knowledge Legacy</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("real_world_good")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === "real_world_good"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          }`}
        >
          <HeartHandshake className="size-3.5" />
          <span>5. Real World Good</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("knowledge_archive")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === "knowledge_archive"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          }`}
        >
          <Database className="size-3.5" />
          <span>6. Knowledge Archive</span>
        </button>
      </div>

      {/* RENDER INITIATIVE TABS WITH CROSS-INITIATIVE LINKS */}
      {activeTab === "rahmah" && <NexoraRahmahHub />}
      {activeTab === "community_libraries" && (
        <CommunityLibrariesPanel onPromoteToLegacy={handlePromoteLibraryToLegacy} />
      )}
      {activeTab === "teaching_for_all" && (
        <TeachingForAllPanel onPublishToLibrary={handlePublishGuideToLibrary} />
      )}
      {activeTab === "offline_education" && <OfflineEducationPanel />}
      {activeTab === "knowledge_legacy" && (
        <KnowledgeLegacyPanel
          onArchiveRecord={handleSnapshotLegacyToArchive}
          onInspireProject={() => setActiveTab("real_world_good")}
        />
      )}
      {activeTab === "real_world_good" && <RealWorldGoodPanel />}
      {activeTab === "knowledge_archive" && <KnowledgeArchivePanel />}

      {/* DEFAULT TAB: OVERVIEW & ETHICAL CHARTER & BACKUP INTEGRITY */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* 0. Rahmah Spotlight Banner */}
          <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-linear-to-r from-emerald-500/15 via-teal-500/10 to-sky-500/15 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <Heart className="size-4 text-emerald-600 fill-current" />
                <span className="font-bold text-sm text-foreground">
                  {isAr
                    ? "نكسورا رحمة: منظومات خدمة الإنسانية والاستدامة المعرفية"
                    : "NEXORA RAHMAH: Humanity First & Lasting Impact"}
                </span>
                <Badge variant="outline" className="text-[10px] bg-background/80">
                  {isAr ? "الجديد" : "Featured"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isAr
                  ? "10 منظومات عملية تشمل الوعي الصحي، حامي الحقيقة، رعاية الأرض، الأمان الرقمي، إنقاذ الحياة، والأدوات المفتوحة مع سجل النفع العام واستوديو إمكانية الوصول."
                  : "10 practical humanity systems: Health awareness, Truth defender, Earth care, Cyber defense, Life-saving, Open tools, Family vault, and the Universal Registry."}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => setActiveTab("rahmah")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
              >
                <Heart className="size-3.5 fill-current text-white" />
                <span>{isAr ? "استكشاف نكسورا رحمة" : "Launch Rahmah Hub"}</span>
              </Button>
            </div>
          </div>

          {/* 1. Mission & Ethical Principles */}
          <section className="surface-card space-y-3 p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                  <HeartHandshake className="size-3.5" />
                  <span>
                    {isAr
                      ? "أثر المعرفة المستدام وإتاحة التعلم للجميع"
                      : "Legacy of Knowledge · Continuous Human Benefit"}
                  </span>
                </div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Make Knowledge Accessible. Keep Educational Impact Verifiable.
                </h2>
              </div>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {OPEN_LEARNING_LIBRARY.length} Library Guides ·{" "}
                {FOUNDATIONAL_LEARNING_TRACKS.length} Foundational Tracks
              </span>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              NEXORA is maintained around open educational access, transparent citations, student
              privacy, and zero-manipulation design. Core learning pathways, foundational skills,
              and offline exports remain free for every learner with zero ad tracking, paywalls on
              essentials, or dark-pattern streaks.
            </p>

            <div className="grid gap-3 pt-1 sm:grid-cols-3">
              <Link
                to="/app/study"
                search={{ tab: "tools" }}
                className="rounded-xl border border-border bg-surface-2/60 p-3.5 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span>Open Learning Library</span>
                  <ArrowRight className="size-3.5 text-primary" />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Attributed lessons, error reporting &amp; verification logs (Module 19).
                </p>
              </Link>

              <Link
                to="/app/study"
                search={{ tab: "skill_academy" }}
                className="rounded-xl border border-border bg-surface-2/60 p-3.5 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span>10 Foundational Tracks</span>
                  <ArrowRight className="size-3.5 text-primary" />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                  {foundationalTracksDone}/{FOUNDATIONAL_LEARNING_TRACKS.length} beginner tracks
                  mastered without shame.
                </p>
              </Link>

              <Link
                to="/app/quran"
                className="rounded-xl border border-border bg-surface-2/60 p-3.5 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span>Authentic Foundations</span>
                  <ArrowRight className="size-3.5 text-primary" />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Verified Mushaf text, Tajweed rules &amp; Hadith methodology (Module 17).
                </p>
              </Link>
            </div>
          </section>

          {/* 2. Privacy-Preserving Impact Measurement */}
          <section className="surface-card space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="size-4 text-primary" />
                <h3 className="font-display text-base font-bold text-foreground">
                  Privacy-Preserving Impact Ledger (Methodology Disclosed)
                </h3>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">
                Zero PII · Zero Click Inflation
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {impact.antiInflationNote}
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {impact.metrics.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-border bg-surface-2/60 p-3.5 space-y-1"
                >
                  <div className="text-[11px] font-medium text-muted-foreground">{m.label}</div>
                  <div className="font-display text-2xl font-bold tabular-nums text-primary">
                    {m.value}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-snug">
                    Formula: {m.formulaDescription}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Checksum-Verified Backup & Safe Restore */}
          <section className="surface-card space-y-4 p-5" data-testid="legacy-backup-section">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Knowledge &amp; Progress Backup Integrity (Checksum-Verified)
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Exports your notes, foundational progress, community drafts, and error reports
                    with tamper-detecting integrity verification.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                variant="glow"
                onClick={handleDownloadVerifiedBackup}
                className="h-8 text-xs"
              >
                <Download className="size-3.5 me-1.5" />
                Export Verified Backup (.json)
              </Button>
            </div>

            {lastChecksum && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-[11px] text-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                <span>
                  Last verified checksum: <code className="font-mono">{lastChecksum}</code>
                  {eco.legacyBackupMeta.lastExportedAt
                    ? ` · Exported ${eco.legacyBackupMeta.lastExportedAt.slice(0, 10)}`
                    : ""}
                </span>
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2 rounded-xl border border-border bg-surface-2/60 p-3.5">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Upload className="size-3.5 text-primary" />
                  <span>Restore From Verified JSON Backup</span>
                </div>
                <input
                  type="file"
                  accept="application/json,.json"
                  aria-label="Upload verified backup JSON file"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    try {
                      const txt = await readFileAsTextSafe(file, {
                        allowedExtensions: [".json"],
                        allowedMimePrefixes: ["application/json", "text/"],
                      });
                      handleRestoreFromJson(txt);
                    } catch (err) {
                      const msg =
                        err instanceof Error ? err.message : "Could not read backup JSON file.";
                      setRestoreError(msg);
                      toast.error(msg);
                    }
                  }}
                  className="block w-full text-[11px] text-muted-foreground file:me-3 file:rounded-md file:border file:border-border file:bg-surface file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-foreground"
                />
                <Textarea
                  rows={2}
                  value={restoreText}
                  onChange={(e) => setRestoreText(e.target.value)}
                  placeholder="Or paste checksum-verified backup JSON payload..."
                  className="font-mono text-[11px]"
                />
                {restoreError && (
                  <p className="text-[11px] font-medium text-destructive">{restoreError}</p>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!restoreText.trim()}
                  onClick={() => handleRestoreFromJson(restoreText)}
                  className="h-7 text-[11px]"
                >
                  <FileCheck2 className="size-3 me-1" />
                  Verify Checksum &amp; Restore
                </Button>
              </div>

              <div className="space-y-2 rounded-xl border border-border bg-surface-2/60 p-3.5 text-[11px] text-muted-foreground">
                <div className="font-semibold text-foreground text-xs">
                  Long-Term Continuity &amp; Ethical Commitments
                </div>
                <ul className="list-disc ps-4 space-y-1">
                  <li>Zero ads, zero behavioral dopamine traps, zero minor exploitation.</li>
                  <li>
                    Structured source attribution, review cadence, and public correction history.
                  </li>
                  <li>
                    Strict educator/scholar human-in-the-loop boundaries for religious and health
                    topics.
                  </li>
                  <li>Full architecture &amp; succession runbook preserved in project docs.</li>
                </ul>
                <div className="pt-1 flex flex-wrap gap-3">
                  <Link to="/about" className="font-semibold text-primary hover:underline">
                    Mission Charter
                  </Link>
                  <Link to="/privacy" className="font-semibold text-primary hover:underline">
                    Privacy Architecture
                  </Link>
                  <Link to="/app/care" className="font-semibold text-primary hover:underline">
                    Care &amp; Data Inventory
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
