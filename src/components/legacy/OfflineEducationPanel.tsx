import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  BookOpen,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  INITIAL_OFFLINE_LEARNING_PACKS,
  OPEN_LEARNING_LIBRARY,
  type OfflineLearningPack,
} from "@/data/open-learning-library";
import { useUser } from "@/hooks/use-nexora";
import { estimateOfflinePacksSize } from "@/lib/legacy-knowledge";
import {
  downloadOfflinePackToCache,
  readOfflinePackFromCache,
  removeOfflinePackFromCache,
  syncOfflineQueueToFirestore,
  type CachedOfflinePackPayload,
  type ConflictResolvedSyncResult,
} from "@/lib/offline-storage";
import { usePrefs } from "@/lib/preferences";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

export function OfflineEducationPanel() {
  const { data: user } = useUser();
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { state: eco, update: updateEco } = useStudentEcosystem();

  const [isBrowserOnline, setIsBrowserOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<ConflictResolvedSyncResult | null>(null);

  // Interactive Pack Reader Dialog
  const [readerOpen, setReaderOpen] = useState(false);
  const [activePackPayload, setActivePackPayload] = useState<CachedOfflinePackPayload | null>(null);
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const effectiveOnline = isBrowserOnline && !simulatedOffline;
  const downloadedIds = eco.downloadedOfflinePackIds ?? [];
  const { formattedSize } = estimateOfflinePacksSize(downloadedIds, INITIAL_OFFLINE_LEARNING_PACKS);

  const toggleDownloadPack = async (pack: OfflineLearningPack) => {
    const isDownloaded = downloadedIds.includes(pack.id);
    if (isDownloaded) {
      await removeOfflinePackFromCache(pack.id);
      updateEco((prev) => ({
        ...prev,
        downloadedOfflinePackIds: (prev.downloadedOfflinePackIds ?? []).filter(
          (id) => id !== pack.id,
        ),
        offlinePacksDownloaded: (prev.offlinePacksDownloaded ?? []).filter((id) => id !== pack.id),
      }));
      toast.success(`Removed '${pack.title}' from local Cache API & offline storage.`);
    } else {
      const payload = await downloadOfflinePackToCache(
        pack,
        OPEN_LEARNING_LIBRARY,
        eco.communityResources ?? [],
      );
      updateEco((prev) => ({
        ...prev,
        downloadedOfflinePackIds: Array.from(
          new Set([...(prev.downloadedOfflinePackIds ?? []), pack.id]),
        ),
        offlinePacksDownloaded: Array.from(
          new Set([...(prev.offlinePacksDownloaded ?? []), pack.id]),
        ),
      }));
      toast.success(
        `Cached '${pack.title}' (${Math.max(1, Math.round(payload.byteSize / 1024))} KB via ${payload.storageBackend}) for offline study.`,
      );
    }
  };

  const handleOpenPackReader = async (pack: OfflineLearningPack) => {
    setLoadingPackId(pack.id);
    try {
      let cached = await readOfflinePackFromCache(pack.id);
      if (!cached) {
        cached = await downloadOfflinePackToCache(
          pack,
          OPEN_LEARNING_LIBRARY,
          eco.communityResources ?? [],
        );
      }
      setActivePackPayload(cached);
      setReaderOpen(true);
    } finally {
      setLoadingPackId(null);
    }
  };

  const handleCompleteOfflineLesson = (
    packId: string,
    lessonId: string,
    lessonTitle: string,
    duplicateRef = false,
  ) => {
    updateEco((prev) => ({
      ...prev,
      offlineSyncQueue: [
        {
          id: `oq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
          kind: "offline_lesson_complete",
          label: `${duplicateRef ? "Re-checked" : "Completed"} offline pack lesson: ${lessonTitle}`,
          payload: {
            packId,
            lessonId,
            refId: `${packId}_${lessonId}`,
            area: "academic",
          },
          queuedAt: new Date().toISOString(),
        },
        ...(prev.offlineSyncQueue ?? []),
      ],
    }));
    toast.success(
      duplicateRef
        ? "Logged duplicate offline revision check (conflict resolution will deduplicate on sync)."
        : `Queued offline lesson completion for '${lessonTitle}'.`,
    );
  };

  const handleToggleLowDataMode = () => {
    const next = !eco.lowDataModeActive;
    updateEco((prev) => ({ ...prev, lowDataModeActive: next }));
    toast.success(
      next
        ? "Low-Data Mode enabled: asset downloads deferred, heavy 3D bypass enabled."
        : "Standard bandwidth mode restored.",
    );
  };

  const handleClearAllOfflinePacks = async () => {
    for (const id of downloadedIds) {
      await removeOfflinePackFromCache(id);
    }
    updateEco((prev) => ({
      ...prev,
      downloadedOfflinePackIds: [],
      offlinePacksDownloaded: [],
    }));
    toast.success("Cleared all cached offline learning packs.");
  };

  const handleTriggerSync = async () => {
    if (!effectiveOnline) {
      toast.error(
        "Cannot synchronize while offline or simulating offline. Re-enable network access.",
      );
      return;
    }
    setIsSyncing(true);
    try {
      const result = await syncOfflineQueueToFirestore(eco.offlineSyncQueue ?? [], user?.uid);
      setLastSyncResult(result);
      updateEco((prev) => ({
        ...prev,
        offlineSyncQueue: [],
      }));
      toast.success(
        `Synchronized ${result.syncedCount} unique action(s); resolved ${result.resolvedConflicts} conflict(s).`,
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-5" data-testid="offline-education-panel">
      {/* Network Status & Control Banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-surface-card to-surface-2 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              {effectiveOnline ? (
                <>
                  <Wifi className="size-4 text-emerald-500" />
                  <span>{isAr ? "متصل بالشبكة — المزامنة جاهزة" : "Online · Continuous Sync"}</span>
                </>
              ) : (
                <>
                  <WifiOff className="size-4 text-amber-500" />
                  <span>
                    {isAr ? "وضع العمل بدون إنترنت" : "Offline Mode Active · Cache Storage Serving"}
                  </span>
                </>
              )}
            </div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Offline-First Education, Downloadable Packs &amp; Bandwidth Stewardship
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              Preserving access to foundational mathematics, reading comprehension, science basics,
              and study skills via Cache API packs and timestamp conflict-resolved progress sync.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={simulatedOffline ? "secondary" : "outline"}
              onClick={() => setSimulatedOffline(!simulatedOffline)}
              className="h-8 text-xs"
            >
              {simulatedOffline ? (
                <>
                  <Wifi className="size-3.5 me-1.5 text-emerald-500" />
                  Resume Online
                </>
              ) : (
                <>
                  <WifiOff className="size-3.5 me-1.5 text-amber-500" />
                  Simulate Offline
                </>
              )}
            </Button>

            <Button
              type="button"
              size="sm"
              variant={eco.lowDataModeActive ? "secondary" : "outline"}
              onClick={handleToggleLowDataMode}
              className="h-8 text-xs"
            >
              <Zap className="size-3.5 me-1.5 text-primary" />
              Low-Data Mode: {eco.lowDataModeActive ? "ON" : "OFF"}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="glow"
              disabled={isSyncing || !effectiveOnline}
              onClick={() => void handleTriggerSync()}
              className="h-8 text-xs tabular-nums"
            >
              <RefreshCw className={`size-3.5 me-1.5 ${isSyncing ? "animate-spin" : ""}`} />
              Sync Offline Data ({(eco.offlineSyncQueue ?? []).length})
            </Button>
          </div>
        </div>
      </div>

      {/* Honest Boundary Notice: Offline vs Online Features */}
      <div className="grid gap-3 sm:grid-cols-2 text-xs">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1.5 text-foreground">
          <div className="font-bold flex items-center gap-1.5 text-emerald-500">
            <CheckCircle2 className="size-4" />
            <span>Fully Supported Offline Features</span>
          </div>
          <ul className="list-disc ps-4 space-y-1 text-[11px] text-muted-foreground">
            <li>Cached curriculum packs &amp; 10 Foundational learning tracks.</li>
            <li>Interactive problem solvers, worked examples &amp; Offline Pack Reader.</li>
            <li>Pomodoro study timer, local task checklist &amp; flashcards.</li>
            <li>Queued offline progress synchronized cleanly once connectivity returns.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-1.5 text-foreground">
          <div className="font-bold flex items-center gap-1.5 text-amber-500">
            <AlertTriangle className="size-4" />
            <span>Online-Only Features (Clear Transparency)</span>
          </div>
          <ul className="list-disc ps-4 space-y-1 text-[11px] text-muted-foreground">
            <li>Real-time BTC Live voice coaching &amp; audio synthesis.</li>
            <li>Google Maps satellite &amp; place autocomplete lookups.</li>
            <li>Live community moderation submission &amp; peer study chat.</li>
            <li>Multi-device cloud sync via Firebase Firestore.</li>
          </ul>
        </div>
      </div>

      {/* Storage Management Gauge */}
      <div className="surface-card flex flex-wrap items-center justify-between gap-4 p-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <HardDrive className="size-5" />
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">
              Local Cache Storage &amp; Download Management
            </div>
            <div className="text-[11px] text-muted-foreground tabular-nums">
              {downloadedIds.length} of {INITIAL_OFFLINE_LEARNING_PACKS.length} approved packs
              cached · Total estimated size:{" "}
              <strong className="text-foreground">{formattedSize}</strong> · Pending sync events:{" "}
              <strong className="text-foreground">{(eco.offlineSyncQueue ?? []).length}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {downloadedIds.length > 0 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void handleClearAllOfflinePacks()}
              className="h-7 text-[11px] text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-3 me-1" />
              Clear Storage
            </Button>
          )}
          {lastSyncResult && (
            <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
              Last sync: {lastSyncResult.syncTimestamp.slice(11, 19)} · {lastSyncResult.syncedCount}{" "}
              synced · {lastSyncResult.resolvedConflicts} conflicts resolved
              {lastSyncResult.syncedToCloud ? " · Cloud Firestore synced" : " · Local reconciled"}
            </span>
          )}
        </div>
      </div>

      {lastSyncResult && lastSyncResult.conflictDetails.length > 0 && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-[11px] space-y-1">
          <div className="font-semibold text-foreground">
            Conflict Resolution Log ({lastSyncResult.resolvedConflicts} duplicate(s) collapsed
            cleanly)
          </div>
          {lastSyncResult.conflictDetails.map((detail, idx) => (
            <p key={idx} className="text-muted-foreground font-mono">
              • {detail}
            </p>
          ))}
        </div>
      )}

      {/* Downloadable Approved Learning Packs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
            <ArrowDownToLine className="size-3.5 text-primary" />
            <span>Approved Offline Learning Packs ({INITIAL_OFFLINE_LEARNING_PACKS.length})</span>
          </h3>
          <span className="text-[11px] text-muted-foreground font-mono">
            Cache API v1 · Standalone Capable
          </span>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          {INITIAL_OFFLINE_LEARNING_PACKS.map((pack) => {
            const isDownloaded = downloadedIds.includes(pack.id);
            return (
              <div
                key={pack.id}
                className={`surface-card flex flex-col justify-between space-y-3 p-4 transition-all ${
                  isDownloaded ? "border-primary/50 bg-primary/5" : ""
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold uppercase tracking-wide text-primary">
                      {pack.subject}
                    </span>
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                      ~{Math.round(pack.approxSizeBytes / 1024)} KB · v{pack.version}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display text-sm font-bold text-foreground">{pack.title}</h4>
                    {pack.titleAr && (
                      <p className="text-[11px] text-muted-foreground font-arabic mt-0.5">
                        {pack.titleAr}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Offline Activities Included
                    </div>
                    <ul className="list-disc ps-4 space-y-0.5 text-[11px] text-foreground/80">
                      {pack.offlineFeaturesList.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-[10px] text-amber-600 dark:text-amber-400">
                    * {pack.onlineOnlyNotice}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] font-medium">
                    {isDownloaded ? (
                      <span className="inline-flex items-center gap-1 text-emerald-500">
                        <CheckCircle2 className="size-3.5" /> Cached Offline
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not Downloaded</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isDownloaded && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={loadingPackId === pack.id}
                        onClick={() => void handleOpenPackReader(pack)}
                        className="h-7 text-xs"
                      >
                        <BookOpen className="size-3 me-1 text-primary" />
                        Open Pack Reader
                      </Button>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      variant={isDownloaded ? "outline" : "glow"}
                      onClick={() => void toggleDownloadPack(pack)}
                      className="h-7 text-xs"
                    >
                      {isDownloaded ? (
                        <>
                          <Trash2 className="size-3 me-1 text-destructive" />
                          Remove Pack
                        </>
                      ) : (
                        <>
                          <ArrowDownToLine className="size-3 me-1" />
                          Download Pack
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Offline Queue Preview */}
      {(eco.offlineSyncQueue ?? []).length > 0 && (
        <div className="surface-card p-4 space-y-2 text-xs">
          <div className="font-semibold text-foreground tabular-nums">
            Pending Offline Progress Queue ({eco.offlineSyncQueue.length} item(s))
          </div>
          <div className="space-y-1">
            {eco.offlineSyncQueue.slice(0, 6).map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between text-[11px] text-muted-foreground border-b border-border/40 pb-1"
              >
                <span className="truncate">{q.label}</span>
                <span className="font-mono shrink-0">{q.queuedAt.slice(11, 19)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offline Pack Reader Modal */}
      <Dialog open={readerOpen} onOpenChange={setReaderOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <BookOpen className="size-4 text-primary" />
              {activePackPayload?.pack.title ?? "Offline Pack Reader"}
            </DialogTitle>
          </DialogHeader>

          {activePackPayload && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-surface-2 p-2.5 text-[11px] text-muted-foreground font-mono tabular-nums">
                Backend: {activePackPayload.storageBackend} · Payload:{" "}
                {Math.max(1, Math.round(activePackPayload.byteSize / 1024))} KB · Cached:{" "}
                {activePackPayload.cachedAt.slice(0, 19).replace("T", " ")}
              </div>

              {activePackPayload.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold uppercase text-primary">
                        {item.subject} · {item.license}
                      </div>
                      <h4 className="font-display text-sm font-bold text-foreground">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{item.summary}</p>
                  <div className="rounded-lg border border-border bg-surface p-3 whitespace-pre-wrap leading-relaxed text-foreground">
                    {item.body}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    <strong>Source:</strong> {item.sourceAttribution}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="glow"
                      onClick={() =>
                        handleCompleteOfflineLesson(
                          activePackPayload.pack.id,
                          item.id,
                          item.title,
                          false,
                        )
                      }
                      className="h-7 text-[11px]"
                    >
                      <CheckCircle2 className="size-3 me-1" />
                      Complete Offline Lesson (Queue Sync)
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleCompleteOfflineLesson(
                          activePackPayload.pack.id,
                          item.id,
                          item.title,
                          true,
                        )
                      }
                      className="h-7 text-[11px]"
                    >
                      Log Duplicate Check (Test Conflict Dedupe)
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
