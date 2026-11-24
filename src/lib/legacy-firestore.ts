import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type {
  CommunityLibraryResource,
  RealWorldProjectRecord,
  TeachingGuideRecord,
} from "@/data/open-learning-library";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { clampString, generateSafeDocId, type ContentErrorReportRow } from "@/lib/firestore-data";
import type { ContentErrorReport } from "@/lib/legacy-knowledge";

export async function loadCommunityResourcesFromFirestore(
  userId?: string | null,
): Promise<CommunityLibraryResource[]> {
  if (!db) return [];
  try {
    const approvedSnap = await getDocs(
      query(
        collection(db, "community_resources"),
        where("review_status", "==", "approved"),
        limit(50),
      ),
    );
    const merged = new Map<string, CommunityLibraryResource>();

    const toResource = (d: Record<string, unknown>, id: string): CommunityLibraryResource => ({
      id,
      title: String(d["title"] ?? ""),
      titleAr: String(d["title_ar"] ?? d["title"] ?? ""),
      collection: (d["collection"] as CommunityLibraryResource["collection"]) ?? "foundational",
      resourceKind: (d["resource_kind"] as CommunityLibraryResource["resourceKind"]) ?? "lesson",
      subject: String(d["subject"] ?? "General"),
      gradeBand: String(d["grade_band"] ?? "Universal"),
      level: (d["level"] as CommunityLibraryResource["level"]) ?? "beginner",
      language: (d["language"] as CommunityLibraryResource["language"]) ?? "en",
      learningObjectives: Array.isArray(d["learning_objectives"])
        ? (d["learning_objectives"] as string[])
        : [],
      summary: String(d["summary"] ?? ""),
      content: String(d["content"] ?? ""),
      author: String(d["author"] ?? "Community Educator"),
      authorRole:
        (d["author_role"] as CommunityLibraryResource["authorRole"]) ?? "approved_contributor",
      sourceAttribution: String(d["source_attribution"] ?? ""),
      license: (d["license"] as CommunityLibraryResource["license"]) ?? "CC-BY-4.0",
      isDownloadablePermitted: Boolean(d["is_downloadable_permitted"] ?? true),
      downloadSizeBytes: Number(d["download_size_bytes"] ?? 1024),
      teacherCurated: Boolean(d["teacher_curated"] ?? false),
      reviewStatus:
        (d["review_status"] as CommunityLibraryResource["reviewStatus"]) ?? "pending_review",
      lastReviewedDate: String(d["last_reviewed_date"] ?? new Date().toISOString().slice(0, 10)),
      qualityScore: (d["quality_score"] as CommunityLibraryResource["qualityScore"]) ?? {
        clarity: 5,
        depth: 4,
        accuracy: 5,
        accessibility: 5,
      },
    });

    for (const s of approvedSnap.docs) {
      merged.set(s.id, toResource(s.data() as Record<string, unknown>, s.id));
    }

    if (userId) {
      try {
        const ownSnap = await getDocs(
          query(collection(db, "community_resources"), where("owner_id", "==", userId), limit(30)),
        );
        for (const s of ownSnap.docs) {
          merged.set(s.id, toResource(s.data() as Record<string, unknown>, s.id));
        }
      } catch {
        /* non-fatal owner fetch */
      }
    }

    return Array.from(merged.values());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "community_resources");
  }
}

export async function saveCommunityResourceToFirestore(
  userId: string,
  resource: CommunityLibraryResource,
): Promise<void> {
  if (!db || !userId) return;
  const now = new Date().toISOString();
  const safeId = resource.id.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128);
  const path = `community_resources/${safeId}`;
  try {
    await setDoc(doc(db, "community_resources", safeId), {
      id: safeId,
      owner_id: userId,
      title: clampString(resource.title, 200) ?? "Untitled Resource",
      title_ar: clampString(resource.titleAr, 200),
      collection: resource.collection,
      resource_kind: resource.resourceKind,
      subject: clampString(resource.subject, 80) ?? "General",
      grade_band: clampString(resource.gradeBand, 40) ?? "Universal",
      level: resource.level,
      language: resource.language,
      learning_objectives: resource.learningObjectives.slice(0, 12),
      summary: clampString(resource.summary, 1000) ?? "Structured learning guide.",
      content: clampString(resource.content, 12000) ?? "Educational content.",
      author: clampString(resource.author, 120) ?? "Community Contributor",
      author_role: resource.authorRole,
      source_attribution: clampString(resource.sourceAttribution, 400) ?? "Original work",
      license: resource.license,
      is_downloadable_permitted: resource.isDownloadablePermitted,
      download_size_bytes: Math.max(0, Math.round(resource.downloadSizeBytes)),
      teacher_curated: resource.teacherCurated,
      review_status: resource.reviewStatus,
      last_reviewed_date: resource.lastReviewedDate,
      quality_score: resource.qualityScore,
      created_at: now,
      updated_at: now,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateCommunityResourceModerationInFirestore(
  resourceId: string,
  reviewStatus: CommunityLibraryResource["reviewStatus"],
  teacherCurated = false,
): Promise<void> {
  if (!db) return;
  const safeId = resourceId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128);
  const path = `community_resources/${safeId}`;
  const now = new Date().toISOString();
  try {
    await updateDoc(doc(db, "community_resources", safeId), {
      review_status: reviewStatus,
      teacher_curated: teacherCurated,
      last_reviewed_date: now.slice(0, 10),
      updated_at: now,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function submitContentErrorReportToFirestore(
  userId: string,
  report: ContentErrorReport,
): Promise<void> {
  if (!db || !userId) return;
  const safeId =
    report.id.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128) || generateSafeDocId("err");
  const path = `content_error_reports/${safeId}`;
  const row: ContentErrorReportRow = {
    id: safeId,
    reporter_id: userId,
    resource_id: clampString(report.resourceId, 128) ?? "unknown_resource",
    resource_title: clampString(report.resourceTitle, 200) ?? "Resource",
    kind: report.kind,
    details: clampString(report.details, 2000) ?? "Reported inaccuracy.",
    status: "open",
    reported_at: report.reportedAt,
  };
  try {
    await setDoc(doc(db, "content_error_reports", safeId), row);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveTeachingGuideToFirestore(
  userId: string,
  guide: TeachingGuideRecord,
): Promise<void> {
  if (!db || !userId) return;
  const now = new Date().toISOString();
  const safeId = guide.id.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128);
  const path = `teaching_guides/${safeId}`;
  try {
    await setDoc(doc(db, "teaching_guides", safeId), {
      id: safeId,
      owner_id: userId,
      title: clampString(guide.title, 200) ?? "Teaching Guide",
      title_ar: clampString(guide.titleAr, 200),
      subject: clampString(guide.subject, 80) ?? "General",
      pedagogical_model: guide.pedagogicalModel,
      target_grade: clampString(guide.targetGrade, 40) ?? "Universal",
      learning_objective: clampString(guide.learningObjective, 1000) ?? "Master core objective.",
      remedial_accommodations: guide.remedialAccommodations.slice(0, 15),
      extension_challenges: guide.extensionChallenges.slice(0, 15),
      printable_worksheet_outline:
        clampString(guide.printableWorksheetOutline, 4000) ?? "Worksheet",
      multi_angle_explanations: guide.multiAngleExplanations,
      author: clampString(guide.author, 120) ?? "Educator",
      version: Math.max(1, Math.min(100, Math.round(guide.version))),
      quality_rating: guide.qualityRating,
      rating_count: guide.ratingCount ?? 1,
      supervisor_approved: guide.supervisorApproved,
      safety_notice: clampString(guide.safetyNotice, 400),
      created_at: now,
      updated_at: now,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateTeachingGuideRatingInFirestore(
  guideId: string,
  qualityRating: TeachingGuideRecord["qualityRating"],
  ratingCount: number,
): Promise<void> {
  if (!db) return;
  const safeId = guideId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128);
  const path = `teaching_guides/${safeId}`;
  try {
    await updateDoc(doc(db, "teaching_guides", safeId), {
      quality_rating: qualityRating,
      rating_count: Math.max(1, Math.round(ratingCount)),
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function saveRealWorldProjectToFirestore(
  userId: string,
  project: RealWorldProjectRecord,
): Promise<void> {
  if (!db || !userId) return;
  const now = new Date().toISOString();
  const safeId = project.id.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128);
  const path = `real_world_projects/${safeId}`;
  try {
    await setDoc(doc(db, "real_world_projects", safeId), {
      id: safeId,
      user_id: userId,
      category: project.category,
      title: clampString(project.title, 200) ?? "Community Initiative",
      problem_definition: clampString(project.problemDefinition, 2000) ?? "",
      intended_beneficiaries: clampString(project.intendedBeneficiaries, 500) ?? "",
      educational_purpose: clampString(project.educationalPurpose, 1000) ?? "",
      safe_activity_plan: clampString(project.safeActivityPlan, 2000) ?? "",
      required_permissions: project.requiredPermissions.slice(0, 12),
      supervisor_name: clampString(project.supervisorName, 120) ?? "Supervisor",
      adult_supervised: project.adultSupervised,
      expected_outcomes: clampString(project.expectedOutcomes, 1000) ?? "",
      evidence_summary: clampString(project.evidenceSummary, 1500),
      reflection_and_lessons: clampString(project.reflectionAndLessons, 1500),
      impact_metric_value: Math.max(0, Math.round(project.impactMetricValue)),
      impact_metric_label: clampString(project.impactMetricLabel, 200) ?? "Beneficiaries",
      team_aliases: (project.teamAliases ?? []).slice(0, 15),
      milestones: (project.milestones ?? []).slice(0, 15),
      showcase_opt_in: project.showcaseOptIn,
      status: project.status,
      created_at: project.createdAt || now.slice(0, 10),
      updated_at: now,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
