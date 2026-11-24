import type {
  CommunityLibraryResource,
  KnowledgeResource,
  OfflineLearningPack,
} from "@/data/open-learning-library";
import type { GrowthArea } from "@/lib/firestore-data";
import { awardXpIfUnique } from "@/hooks/use-nexora";
import { handleFirestoreError, OperationType } from "@/lib/firebase";
import { buildEventDocId } from "@/lib/xp-rules";

export const OFFLINE_CACHE_NAME = "nexora-offline-packs-v1";
const LOCAL_PACK_STORAGE_PREFIX = "nexora.offline_pack.v1.";

export interface CachedOfflinePackPayload {
  pack: OfflineLearningPack;
  cachedAt: string;
  byteSize: number;
  storageBackend: "cache_api" | "local_storage";
  items: Array<{
    id: string;
    title: string;
    titleAr: string;
    subject: string;
    summary: string;
    body: string;
    license: string;
    sourceAttribution: string;
  }>;
  practiceChecklist: string[];
}

export interface OfflineQueueItem {
  id: string;
  kind:
    "flashcard_review" | "task_done" | "gap_resolved" | "challenge_log" | "offline_lesson_complete";
  label: string;
  payload: Record<string, unknown>;
  queuedAt: string;
}

export interface ConflictResolvedSyncResult {
  syncedCount: number;
  resolvedConflicts: number;
  conflictDetails: string[];
  syncedToCloud: boolean;
  syncTimestamp: string;
}

function packCacheUrl(packId: string): string {
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://nexora.local";
  return `${origin}/__offline_packs/${encodeURIComponent(packId)}.json`;
}

export function buildPackPayload(
  pack: OfflineLearningPack,
  openResources: KnowledgeResource[],
  communityResources: CommunityLibraryResource[],
): CachedOfflinePackPayload {
  const items: CachedOfflinePackPayload["items"] = [];

  for (const rid of pack.resourceIds) {
    const oer = openResources.find((r) => r.id === rid);
    if (oer) {
      items.push({
        id: oer.id,
        title: oer.title,
        titleAr: oer.titleAr,
        subject: oer.subject,
        summary: oer.summary,
        body: `${oer.body}\n\nWorked Example:\n${oer.workedExample}`,
        license: oer.license,
        sourceAttribution: oer.sourceReferences.join("; "),
      });
      continue;
    }
    const com = communityResources.find((c) => c.id === rid);
    if (com) {
      items.push({
        id: com.id,
        title: com.title,
        titleAr: com.titleAr,
        subject: com.subject,
        summary: com.summary,
        body: com.content,
        license: com.license,
        sourceAttribution: com.sourceAttribution,
      });
    }
  }

  if (items.length === 0) {
    items.push({
      id: pack.id,
      title: pack.title,
      titleAr: pack.titleAr,
      subject: pack.subject,
      summary: pack.offlineFeaturesList.join(" · "),
      body: `Offline Revision Guide for ${pack.title}\n\nIncluded Activities:\n${pack.offlineFeaturesList
        .map((f, i) => `${i + 1}. ${f}`)
        .join("\n")}\n\nOnline-only boundary: ${pack.onlineOnlyNotice}`,
      license: "NEXORA-OER-FREE",
      sourceAttribution: "NEXORA Verified Offline Pack Curriculum",
    });
  }

  const basePayload: CachedOfflinePackPayload = {
    pack,
    cachedAt: new Date().toISOString(),
    byteSize: 0,
    storageBackend: "local_storage",
    items,
    practiceChecklist: pack.offlineFeaturesList,
  };
  const serialized = JSON.stringify(basePayload);
  basePayload.byteSize = new TextEncoder().encode(serialized).length;
  return basePayload;
}

export async function downloadOfflinePackToCache(
  pack: OfflineLearningPack,
  openResources: KnowledgeResource[],
  communityResources: CommunityLibraryResource[],
): Promise<CachedOfflinePackPayload> {
  const payload = buildPackPayload(pack, openResources, communityResources);

  if (typeof caches !== "undefined") {
    try {
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      payload.storageBackend = "cache_api";
      const jsonStr = JSON.stringify(payload);
      payload.byteSize = new TextEncoder().encode(jsonStr).length;
      await cache.put(
        packCacheUrl(pack.id),
        new Response(jsonStr, {
          headers: { "Content-Type": "application/json;charset=utf-8" },
        }),
      );
      if (typeof window !== "undefined") {
        window.localStorage.setItem(`${LOCAL_PACK_STORAGE_PREFIX}${pack.id}`, jsonStr);
      }
      return payload;
    } catch {
      /* fallback cleanly to localStorage */
    }
  }

  if (typeof window !== "undefined") {
    payload.storageBackend = "local_storage";
    const jsonStr = JSON.stringify(payload);
    payload.byteSize = new TextEncoder().encode(jsonStr).length;
    window.localStorage.setItem(`${LOCAL_PACK_STORAGE_PREFIX}${pack.id}`, jsonStr);
  }
  return payload;
}

export async function readOfflinePackFromCache(
  packId: string,
): Promise<CachedOfflinePackPayload | null> {
  if (typeof caches !== "undefined") {
    try {
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      const match = await cache.match(packCacheUrl(packId));
      if (match) {
        return (await match.json()) as CachedOfflinePackPayload;
      }
    } catch {
      /* try localStorage */
    }
  }

  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(`${LOCAL_PACK_STORAGE_PREFIX}${packId}`);
    if (raw) {
      try {
        return JSON.parse(raw) as CachedOfflinePackPayload;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export async function removeOfflinePackFromCache(packId: string): Promise<void> {
  if (typeof caches !== "undefined") {
    try {
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      await cache.delete(packCacheUrl(packId));
    } catch {
      /* ignore */
    }
  }
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(`${LOCAL_PACK_STORAGE_PREFIX}${packId}`);
  }
}

export function resolveOfflineQueueConflicts(pendingQueue: OfflineQueueItem[]): {
  deduped: OfflineQueueItem[];
  resolvedConflicts: number;
  conflictDetails: string[];
} {
  const byTarget = new Map<string, OfflineQueueItem>();
  let resolvedConflicts = 0;
  const conflictDetails: string[] = [];

  for (const item of pendingQueue) {
    const payloadRefId = item.payload?.["refId"];
    const payloadPackId = item.payload?.["packId"];
    const payloadLessonId = item.payload?.["lessonId"];
    const targetRef =
      typeof payloadRefId === "string"
        ? payloadRefId
        : typeof payloadPackId === "string"
          ? `${item.kind}:${payloadPackId}`
          : typeof payloadLessonId === "string"
            ? `${item.kind}:${payloadLessonId}`
            : `${item.kind}:${item.label.toLowerCase()}`;

    const existing = byTarget.get(targetRef);
    if (!existing) {
      byTarget.set(targetRef, item);
      continue;
    }

    resolvedConflicts += 1;
    const existingTs = Date.parse(existing.queuedAt) || 0;
    const incomingTs = Date.parse(item.queuedAt) || 0;
    if (incomingTs >= existingTs) {
      byTarget.set(targetRef, item);
      conflictDetails.push(
        `Resolved duplicate target '${targetRef}': kept newer event (${item.queuedAt.slice(11, 19)}).`,
      );
    } else {
      conflictDetails.push(
        `Resolved duplicate target '${targetRef}': kept newer event (${existing.queuedAt.slice(11, 19)}).`,
      );
    }
  }

  return {
    deduped: Array.from(byTarget.values()),
    resolvedConflicts,
    conflictDetails,
  };
}

export async function syncOfflineQueueToFirestore(
  pendingQueue: OfflineQueueItem[],
  userId?: string | null,
): Promise<ConflictResolvedSyncResult> {
  const syncTimestamp = new Date().toISOString();
  const { deduped, resolvedConflicts, conflictDetails } =
    resolveOfflineQueueConflicts(pendingQueue);

  let syncedToCloud = false;
  if (userId && deduped.length > 0) {
    try {
      for (const item of deduped) {
        const rawRefId = item.payload?.["refId"];
        const refId = typeof rawRefId === "string" ? rawRefId : item.id;
        const cleanRefId = `off_${refId}`.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 120);
        const eventType =
          item.kind === "offline_lesson_complete"
            ? "OFFLINE_PACK_LESSON_COMPLETED"
            : "OFFLINE_STUDY_SYNCED";
        const rawArea = item.payload?.["area"];
        await awardXpIfUnique({
          userId,
          eventDocId: buildEventDocId(userId, eventType, cleanRefId),
          eventType,
          area: (typeof rawArea === "string" ? rawArea : "academic") as GrowthArea,
          refId: cleanRefId,
          xpReward: 10,
          nowIso: syncTimestamp,
        });
      }
      syncedToCloud = true;
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, "activity_events");
      } catch {
        /* graceful fallback when Firestore permissions or offline state blocks write */
      }
    }
  }

  return {
    syncedCount: deduped.length,
    resolvedConflicts,
    conflictDetails,
    syncedToCloud,
    syncTimestamp,
  };
}
