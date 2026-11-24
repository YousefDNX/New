import type {
  ArchivePreservationRecord,
  CommunityCollectionKind,
  CommunityLibraryResource,
  CommunityResourceKind,
  ContentReviewStatus,
  CorrectionLogEntry,
  ErrorReportKind,
  KnowledgeLegacyContribution,
  KnowledgeResource,
  OfflineLearningPack,
  RealWorldProjectRecord,
  ResourceLicense,
  TeachingGuideRecord,
} from "@/data/open-learning-library";
import type { StudentEcosystemState } from "@/lib/student-ecosystem";
import { computeCanonicalArchiveDigest, computeDeterministicChecksum } from "@/lib/checksum";

export { computeCanonicalArchiveDigest, computeDeterministicChecksum };

export interface ResourceStatusOverride {
  reviewStatus: ContentReviewStatus;
  lastReviewedDate: string;
  correctionHistory: CorrectionLogEntry[];
}

export interface ContentErrorReport {
  id: string;
  resourceId: string;
  resourceTitle: string;
  kind: ErrorReportKind;
  details: string;
  reportedAt: string;
  status: "open" | "resolved";
  resolutionNote?: string;
}

export type VolunteerTaskKind =
  "translation" | "proofreading" | "accessibility_improvement" | "content_review";

export interface VolunteerContributionRecord {
  id: string;
  kind: VolunteerTaskKind;
  language: string;
  targetResourceId: string;
  summary: string;
  supervisorApproved: boolean;
  status: "pending_review" | "approved" | "needs_revision";
  createdAt: string;
}

export interface OpenLibraryFilters {
  query?: string;
  subject?: string;
  level?: "all" | "beginner" | "intermediate" | "advanced";
  language?: "all" | "en" | "ar" | "bilingual";
  downloadableOnly?: boolean;
}

export function resolveEffectiveResource(
  item: KnowledgeResource,
  overrides: Record<string, ResourceStatusOverride> = {},
): KnowledgeResource {
  const ov = overrides[item.id];
  if (!ov) return item;
  return {
    ...item,
    reviewStatus: ov.reviewStatus,
    lastReviewedDate: ov.lastReviewedDate,
    correctionHistory: [...ov.correctionHistory, ...item.correctionHistory],
  };
}

export function isResourceDueForReview(
  item: KnowledgeResource,
  nowIso: string = new Date().toISOString(),
): { due: boolean; daysSinceReview: number } {
  const reviewedMs = Date.parse(item.lastReviewedDate);
  const nowMs = Date.parse(nowIso);
  if (!Number.isFinite(reviewedMs) || !Number.isFinite(nowMs)) {
    return { due: true, daysSinceReview: 999 };
  }
  const daysSinceReview = Math.max(0, Math.floor((nowMs - reviewedMs) / 86_400_000));
  const due =
    daysSinceReview >= item.reviewIntervalDays ||
    item.reviewStatus === "needs_correction" ||
    item.reviewStatus === "outdated";
  return { due, daysSinceReview };
}

export function canDownloadResource(
  item: KnowledgeResource,
  overrides: Record<string, ResourceStatusOverride> = {},
): { allowed: boolean; reason: string } {
  const effective = resolveEffectiveResource(item, overrides);
  if (!effective.isDownloadablePermitted || effective.license === "Attribution-Reference-Only") {
    return {
      allowed: false,
      reason:
        "Reference-only license or clinical/scholarly pre-release item; offline file download is disabled.",
    };
  }
  if (
    effective.reviewStatus === "needs_correction" ||
    effective.reviewStatus === "outdated" ||
    effective.reviewStatus === "archived"
  ) {
    return {
      allowed: false,
      reason: `Resource is currently marked '${effective.reviewStatus}' pending verification before offline download.`,
    };
  }
  return {
    allowed: true,
    reason: `Permitted under ${effective.license} with attribution preserved.`,
  };
}

export function filterOpenLibrary(
  items: KnowledgeResource[],
  filters: OpenLibraryFilters,
  overrides: Record<string, ResourceStatusOverride> = {},
): KnowledgeResource[] {
  const q = (filters.query ?? "").trim().toLowerCase();
  return items
    .map((item) => resolveEffectiveResource(item, overrides))
    .filter((item) => {
      if (item.reviewStatus === "archived") return false;
      if (filters.subject && filters.subject !== "all" && item.subject !== filters.subject) {
        return false;
      }
      if (filters.level && filters.level !== "all" && item.level !== filters.level) {
        return false;
      }
      if (filters.language && filters.language !== "all" && item.language !== filters.language) {
        return false;
      }
      if (filters.downloadableOnly && !canDownloadResource(item, overrides).allowed) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        item.title,
        item.titleAr,
        item.subject,
        item.topic,
        item.summary,
        item.authorOwner,
        ...item.objectives,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
}

export function formatAttributionExportMarkdown(
  item: KnowledgeResource,
  overrides: Record<string, ResourceStatusOverride> = {},
): string {
  const eff = resolveEffectiveResource(item, overrides);
  return [
    `# ${eff.title} (${eff.titleAr})`,
    "",
    `- **Subject:** ${eff.subject} · **Level:** ${eff.level} · **Language:** ${eff.language}`,
    `- **Author / Maintainer:** ${eff.authorOwner}`,
    `- **License:** ${eff.license}`,
    `- **Review Status:** ${eff.reviewStatus} (Last Reviewed: ${eff.lastReviewedDate})`,
    "",
    "## Learning Objectives",
    ...eff.objectives.map((o) => `- ${o}`),
    "",
    "## Summary & Explanation",
    eff.summary,
    "",
    eff.body,
    "",
    "## Worked Example",
    eff.workedExample,
    "",
    "## Source References",
    ...eff.sourceReferences.map((s) => `- ${s}`),
    "",
    "## Warnings & Limitations",
    ...eff.warningsLimitations.map((w) => `- ${w}`),
    "",
    "---",
    "Exported from NEXORA Open Learning Library. Preserve author & license attribution.",
  ].join("\n");
}

const EMAIL_OR_PHONE_REGEX =
  /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\+?\d[\d\s()-]{6,}\d)/;

export function validateErrorReportInput(input: { resourceId: string; details: string }): {
  ok: boolean;
  reason?: string;
} {
  if (!input.resourceId.trim()) {
    return { ok: false, reason: "Select a valid resource to report." };
  }
  const text = input.details.trim();
  if (text.length < 10) {
    return {
      ok: false,
      reason: "Please describe the error or broken source clearly (at least 10 characters).",
    };
  }
  if (EMAIL_OR_PHONE_REGEX.test(text)) {
    return {
      ok: false,
      reason:
        "For student privacy, remove email addresses or phone numbers from public error logs.",
    };
  }
  return { ok: true };
}

export function validateVolunteerContribution(input: {
  summary: string;
  targetResourceId: string;
  supervisorApproved: boolean;
}): { ok: boolean; reason?: string } {
  if (!input.targetResourceId.trim()) {
    return { ok: false, reason: "Select the resource or track you are helping improve." };
  }
  const clean = input.summary.trim();
  if (clean.length < 15) {
    return {
      ok: false,
      reason:
        "Describe the exact translation, accessibility alt-text, or proofreading improvement (15+ characters).",
    };
  }
  if (EMAIL_OR_PHONE_REGEX.test(clean) || /https?:\/\//i.test(clean)) {
    return {
      ok: false,
      reason:
        "Remove personal contact info or external links; volunteer edits pass coordinator review safely.",
    };
  }
  if (!input.supervisorApproved) {
    return {
      ok: false,
      reason: "Confirm educator/coordinator supervision review before submitting.",
    };
  }
  return { ok: true };
}

export interface PrivacySafeImpactMetric {
  id: string;
  label: string;
  value: number;
  formulaDescription: string;
}

export interface PrivacySafeImpactSnapshot {
  generatedAt: string;
  antiInflationNote: string;
  metrics: PrivacySafeImpactMetric[];
}

export function computePrivacySafeImpactMetrics(params: {
  state: StudentEcosystemState;
  completedTasksCount: number;
  quizAttemptsCount: number;
  focusSessionsCount: number;
  supportedLanguagesCount: number;
}): PrivacySafeImpactSnapshot {
  const {
    state,
    completedTasksCount,
    quizAttemptsCount,
    focusSessionsCount,
    supportedLanguagesCount,
  } = params;

  const foundationalStepsDone = Object.values(state.foundationalPathProgress ?? {}).reduce(
    (sum, steps) => sum + (Array.isArray(steps) ? steps.length : 0),
    0,
  );
  const resolvedGapsCount = (state.resolvedGapIds ?? []).length;
  const masteredAdaptiveSteps = (state.masteredPathSteps ?? []).length;
  const openErrorReportsCount = (state.contentErrorReports ?? []).filter(
    (r) => r.status === "open",
  ).length;
  const resolvedErrorReportsCount = (state.contentErrorReports ?? []).filter(
    (r) => r.status === "resolved",
  ).length;
  const volunteerEntriesReviewed = (state.volunteerContributions ?? []).filter(
    (v) => v.status === "approved",
  ).length;
  const supervisedCommunityPlans = (state.communityProjects ?? []).filter(
    (c) => c.adultSupervised,
  ).length;

  return {
    generatedAt: new Date().toISOString(),
    antiInflationNote:
      "NEXORA never counts raw page views, clicks, or idle logins as human impact. Every indicator below maps to a verifiable learning, remediation, accessibility, or supervised contribution action with zero identifiable user data.",
    metrics: [
      {
        id: "foundational_mastery",
        label: "Foundational Learning Checks Passed",
        value:
          foundationalStepsDone + (state.literacyTrackProgress?.completedModuleIds?.length ?? 0),
        formulaDescription:
          "Count of completed steps across the 10 Foundational Tracks + Read-Aloud Literacy modules",
      },
      {
        id: "remediation_and_mastery",
        label: "Learning Gaps Resolved & Adaptive Steps Mastered",
        value: resolvedGapsCount + masteredAdaptiveSteps,
        formulaDescription:
          "resolvedGapIds.length + masteredPathSteps.length (excludes passive page views)",
      },
      {
        id: "disciplined_practice",
        label: "Verified Tasks, Quizzes & Focus Sprints",
        value: completedTasksCount + quizAttemptsCount + focusSessionsCount,
        formulaDescription:
          "Completed study tasks + scored quiz attempts + completed Pomodoro focus blocks",
      },
      {
        id: "offline_resilience",
        label: "Offline Revision Packs Ready",
        value:
          (state.offlinePacksDownloaded ?? []).length +
          (state.knowledgeLibrary ?? []).filter((k) => k.pinnedOffline).length,
        formulaDescription:
          "Downloaded offline study packs + student notes pinned for offline access",
      },
      {
        id: "community_impact_verified",
        label: "Supervised Community & Approved Volunteer Contributions",
        value: supervisedCommunityPlans + volunteerEntriesReviewed,
        formulaDescription:
          "Adult-supervised community initiatives + moderator-approved volunteer edits",
      },
      {
        id: "content_trust_stewardship",
        label: "Content Corrections Verified / Open Reports",
        value: resolvedErrorReportsCount + openErrorReportsCount,
        formulaDescription: `${resolvedErrorReportsCount} resolved correction(s) and ${openErrorReportsCount} queued review(s)`,
      },
      {
        id: "language_access",
        label: "Supported UI & Learning Languages",
        value: supportedLanguagesCount,
        formulaDescription: "Configured interface languages supporting localized RTL/LTR study",
      },
    ],
  };
}

export interface VersionedEcosystemBackup {
  schemaVersion: "nexora.legacy.backup.v1";
  exportedAt: string;
  uidScope: string;
  checksum: string;
  payload: StudentEcosystemState;
}

export function createVersionedEcosystemBackup(
  state: StudentEcosystemState,
  activeUid: string | null,
): VersionedEcosystemBackup {
  const exportedAt = new Date().toISOString();
  const uidScope = activeUid ?? "guest_session";
  const serializedPayload = JSON.stringify(state);
  const checksum = computeDeterministicChecksum(serializedPayload);
  return {
    schemaVersion: "nexora.legacy.backup.v1",
    exportedAt,
    uidScope,
    checksum,
    payload: state,
  };
}

export function verifyAndRestoreBackup(
  rawJson: string,
): { ok: true; backup: VersionedEcosystemBackup } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(rawJson) as Partial<VersionedEcosystemBackup>;
    if (parsed.schemaVersion !== "nexora.legacy.backup.v1") {
      return {
        ok: false,
        error: "Unsupported backup schemaVersion; expected 'nexora.legacy.backup.v1'.",
      };
    }
    if (
      !parsed.payload ||
      typeof parsed.payload !== "object" ||
      typeof parsed.checksum !== "string"
    ) {
      return { ok: false, error: "Backup file is missing required payload or integrity checksum." };
    }
    const recomputed = computeDeterministicChecksum(JSON.stringify(parsed.payload));
    if (recomputed !== parsed.checksum) {
      return {
        ok: false,
        error:
          "Checksum mismatch — this backup file appears modified or corrupted and was rejected safely.",
      };
    }
    return { ok: true, backup: parsed as VersionedEcosystemBackup };
  } catch {
    return { ok: false, error: "Invalid JSON backup format." };
  }
}

/* -------------------------------------------------------------------------- */
/* SIX LEGACY INITIATIVES: DOMAIN LOGIC & VALIDATION                          */
/* -------------------------------------------------------------------------- */

export interface CommunityLibraryFilters {
  query?: string;
  collection?: "all" | CommunityCollectionKind;
  resourceKind?: "all" | CommunityResourceKind;
  gradeBand?: string;
  language?: "all" | "en" | "ar" | "bilingual";
  downloadableOnly?: boolean;
  teacherCuratedOnly?: boolean;
  includePendingReview?: boolean;
}

export function filterCommunityLibraryResources(
  resources: CommunityLibraryResource[],
  filters: CommunityLibraryFilters,
  overrides: Record<string, ResourceStatusOverride> = {},
): CommunityLibraryResource[] {
  const q = (filters.query ?? "").trim().toLowerCase();
  return resources
    .map((res) => {
      const ov = overrides[res.id];
      return ov
        ? { ...res, reviewStatus: ov.reviewStatus, lastReviewedDate: ov.lastReviewedDate }
        : res;
    })
    .filter((res) => {
      if (res.reviewStatus === "archived") return false;
      if (!filters.includePendingReview && res.reviewStatus === "pending_review") {
        return false;
      }
      if (
        filters.collection &&
        filters.collection !== "all" &&
        res.collection !== filters.collection
      ) {
        return false;
      }
      if (
        filters.resourceKind &&
        filters.resourceKind !== "all" &&
        res.resourceKind !== filters.resourceKind
      ) {
        return false;
      }
      if (filters.gradeBand && filters.gradeBand !== "all" && res.gradeBand !== filters.gradeBand) {
        return false;
      }
      if (filters.language && filters.language !== "all" && res.language !== filters.language) {
        return false;
      }
      if (filters.downloadableOnly && !res.isDownloadablePermitted) {
        return false;
      }
      if (filters.teacherCuratedOnly && !res.teacherCurated) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        res.title,
        res.titleAr,
        res.subject,
        res.summary,
        res.author,
        res.sourceAttribution,
        ...res.learningObjectives,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
}

export function validateCommunityResourceSubmission(input: {
  title: string;
  subject: string;
  collection: CommunityCollectionKind;
  resourceKind: CommunityResourceKind;
  content: string;
  author: string;
  sourceAttribution: string;
  license: ResourceLicense;
}): { ok: boolean; reason?: string } {
  if (input.title.trim().length < 5) {
    return {
      ok: false,
      reason: "Please enter a descriptive resource title (at least 5 characters).",
    };
  }
  if (!input.subject.trim()) {
    return { ok: false, reason: "Specify an academic or life skills subject." };
  }
  if (input.content.trim().length < 25) {
    return {
      ok: false,
      reason: "Content or lesson body must provide meaningful learning text (25+ characters).",
    };
  }
  if (!input.sourceAttribution.trim()) {
    return {
      ok: false,
      reason: "Clear source attribution or reference is required to preserve trust.",
    };
  }
  if (EMAIL_OR_PHONE_REGEX.test(input.content) || EMAIL_OR_PHONE_REGEX.test(input.author)) {
    return {
      ok: false,
      reason: "Remove personal phone numbers or emails to safeguard contributor privacy.",
    };
  }
  return { ok: true };
}

export function rateTeachingResourceQuality(ratings: {
  clarity: number;
  depth: number;
  accuracy: number;
  accessibility: number;
}): { compositeScore: number; passesStandard: boolean; feedback: string } {
  const { clarity, depth, accuracy, accessibility } = ratings;
  const clampedClarity = Math.min(5, Math.max(1, clarity));
  const clampedDepth = Math.min(5, Math.max(1, depth));
  const clampedAccuracy = Math.min(5, Math.max(1, accuracy));
  const clampedAccessibility = Math.min(5, Math.max(1, accessibility));
  const avg = (clampedClarity + clampedDepth + clampedAccuracy + clampedAccessibility) / 4;
  const compositeScore = Math.round(avg * 10) / 10;
  const passesStandard = clampedAccuracy >= 4 && compositeScore >= 3.5;
  const feedback = passesStandard
    ? `Quality score ${compositeScore}/5 meets NEXORA pedagogical standard.`
    : `Quality score ${compositeScore}/5 requires educator revision on clarity or factual accuracy.`;
  return { compositeScore, passesStandard, feedback };
}

export function formatMultiAngleExplanation(guide: TeachingGuideRecord): string {
  const { multiAngleExplanations } = guide;
  return [
    `### Multi-Angle Explanation: ${guide.title}`,
    "",
    "1. **Visual / Diagrammatic View:**",
    `   ${multiAngleExplanations.visualDiagramPrompt}`,
    "",
    "2. **Real-World Analogy:**",
    `   ${multiAngleExplanations.realWorldAnalogy}`,
    "",
    "3. **Everyday Life Application:**",
    `   ${multiAngleExplanations.everydayApplication}`,
    "",
    "4. **Step-by-Step Logical Proof:**",
    `   ${multiAngleExplanations.stepByStepLogic}`,
  ].join("\n");
}

export function estimateOfflinePacksSize(
  downloadedPackIds: string[],
  allPacks: OfflineLearningPack[],
): { totalBytes: number; formattedSize: string } {
  const totalBytes = allPacks
    .filter((p) => downloadedPackIds.includes(p.id))
    .reduce((sum, p) => sum + p.approxSizeBytes, 0);

  if (totalBytes < 1024) return { totalBytes, formattedSize: `${totalBytes} B` };
  if (totalBytes < 1024 * 1024) {
    return { totalBytes, formattedSize: `${Math.round(totalBytes / 1024)} KB` };
  }
  return {
    totalBytes,
    formattedSize: `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`,
  };
}

export function simulateOfflineDataSync(
  pendingQueue: Array<{ id: string; kind: string; queuedAt: string; label: string }>,
): {
  syncedCount: number;
  resolvedConflicts: number;
  syncTimestamp: string;
} {
  const syncTimestamp = new Date().toISOString();
  return {
    syncedCount: pendingQueue.length,
    resolvedConflicts: 0,
    syncTimestamp,
  };
}

export function deprecateLegacyContribution(
  contribution: KnowledgeLegacyContribution,
  reason: string,
): KnowledgeLegacyContribution {
  return {
    ...contribution,
    status: "deprecated_outdated",
    deprecationNotice: reason,
    versionHistory: [
      ...contribution.versionHistory,
      {
        version: contribution.versionHistory.length + 1,
        date: new Date().toISOString().slice(0, 10),
        changeSummary: `Deprecated: ${reason}`,
        reviewer: "Ecosystem Stewardship Board",
      },
    ],
  };
}

export function validateRealWorldGoodProject(project: Partial<RealWorldProjectRecord>): {
  ok: boolean;
  missingFields: string[];
  reason?: string;
} {
  const missingFields: string[] = [];
  if (!project.title || project.title.trim().length < 5) missingFields.push("title");
  if (!project.problemDefinition || project.problemDefinition.trim().length < 15) {
    missingFields.push("problemDefinition");
  }
  if (!project.intendedBeneficiaries || project.intendedBeneficiaries.trim().length < 10) {
    missingFields.push("intendedBeneficiaries");
  }
  if (!project.educationalPurpose || project.educationalPurpose.trim().length < 10) {
    missingFields.push("educationalPurpose");
  }
  if (!project.safeActivityPlan || project.safeActivityPlan.trim().length < 15) {
    missingFields.push("safeActivityPlan");
  }
  if (!Array.isArray(project.requiredPermissions) || project.requiredPermissions.length === 0) {
    missingFields.push("requiredPermissions");
  }
  if (!project.supervisorName || project.supervisorName.trim().length < 3) {
    missingFields.push("supervisorName");
  }
  if (!project.adultSupervised) {
    missingFields.push("adultSupervised");
  }
  if (!project.expectedOutcomes || project.expectedOutcomes.trim().length < 10) {
    missingFields.push("expectedOutcomes");
  }
  if (!project.evidenceSummary || project.evidenceSummary.trim().length < 10) {
    missingFields.push("evidenceSummary");
  }
  if (!project.reflectionAndLessons || project.reflectionAndLessons.trim().length < 10) {
    missingFields.push("reflectionAndLessons");
  }
  if (typeof project.impactMetricValue !== "number" || project.impactMetricValue <= 0) {
    missingFields.push("impactMetricValue");
  }
  if (!project.impactMetricLabel || project.impactMetricLabel.trim().length < 3) {
    missingFields.push("impactMetricLabel");
  }

  if (missingFields.length > 0) {
    return {
      ok: false,
      missingFields,
      reason: `Real World Good projects require all 10 verified dimensions. Missing: ${missingFields.join(", ")}.`,
    };
  }

  // PII safeguard
  const combinedText = [
    project.title,
    project.problemDefinition,
    project.intendedBeneficiaries,
    project.safeActivityPlan,
    project.evidenceSummary,
  ].join(" ");
  if (EMAIL_OR_PHONE_REGEX.test(combinedText)) {
    return {
      ok: false,
      missingFields: [],
      reason:
        "To protect student safety, remove personal email addresses or phone numbers from community project records.",
    };
  }

  return { ok: true, missingFields: [] };
}

export function verifyArchiveIntegrity(
  record: ArchivePreservationRecord,
  actualContentText?: string,
): { valid: boolean; calculatedChecksum: string } {
  const calculatedChecksum =
    typeof actualContentText === "string"
      ? computeDeterministicChecksum(actualContentText)
      : computeCanonicalArchiveDigest(record);
  return {
    valid: record.checksum === calculatedChecksum,
    calculatedChecksum,
  };
}

export function detectArchiveDuplicates(records: ArchivePreservationRecord[]): {
  duplicatesCount: number;
  duplicateTitles: string[];
} {
  const seenDigests = new Set<string>();
  const duplicateTitles: string[] = [];
  for (const rec of records) {
    if (seenDigests.has(rec.contentDigest)) {
      duplicateTitles.push(rec.title);
    } else {
      seenDigests.add(rec.contentDigest);
    }
  }
  return { duplicatesCount: duplicateTitles.length, duplicateTitles };
}

export function scanBrokenArchiveResources(records: ArchivePreservationRecord[]): {
  atRiskCount: number;
  atRiskIds: string[];
} {
  const atRisk = records.filter((r) => r.brokenLinkRisk || !r.originalSource.trim());
  return {
    atRiskCount: atRisk.length,
    atRiskIds: atRisk.map((r) => r.id),
  };
}

export function exportArchivalBundleJson(params: {
  records: ArchivePreservationRecord[];
  contributions: KnowledgeLegacyContribution[];
  communityResources: CommunityLibraryResource[];
}): string {
  const bundle = {
    archiveBundleVersion: "nexora.knowledge.archive.v1",
    exportedAt: new Date().toISOString(),
    preservationNote:
      "All included resources are preserved under open educational licenses with author attribution and deterministic 64-bit checksums.",
    summary: {
      archiveRecordsCount: params.records.length,
      legacyContributionsCount: params.contributions.length,
      communityResourcesCount: params.communityResources.length,
    },
    records: params.records,
    contributions: params.contributions,
    communityResources: params.communityResources,
  };
  return JSON.stringify(bundle, null, 2);
}
