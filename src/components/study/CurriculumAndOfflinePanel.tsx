import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CloudOff,
  Compass,
  Download,
  RefreshCw,
  ShieldAlert,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ModernSelect } from "@/components/ui/modern-select";
import { CURRICULUM_UNITS } from "@/data/curriculum-and-challenges";
import {
  INITIAL_OFFLINE_LEARNING_PACKS,
  OPEN_LEARNING_LIBRARY,
} from "@/data/open-learning-library";
import { useUser } from "@/hooks/use-nexora";
import {
  downloadOfflinePackToCache,
  removeOfflinePackFromCache,
  syncOfflineQueueToFirestore,
} from "@/lib/offline-storage";
import { usePWA } from "@/lib/pwa";
import { useStudentEcosystem } from "@/lib/student-ecosystem";

const OFFLINE_LEARNING_PACKS = [
  {
    id: "pack_g9_unit3_vocab",
    title: "Grade 9 Unit 3 Core Vocabulary & Examples Pack",
    subject: "English",
    sizeEstimate: "42 KB JSON/Text",
    summary:
      "All 24 Unit 3 words ('flavour', 'fibre', British spelling) + definitions + Arabic translations + local cloze drills.",
  },
  {
    id: "pack_foundation_math",
    title: "Signed Arithmetic, Ratios & Linear Slope Pack",
    subject: "Mathematics",
    sizeEstimate: "28 KB JSON/Text",
    summary: "Worked prerequisite steps, percentage multiplier checks, and slope quick-sheet.",
  },
  {
    id: "pack_english_a1_a2",
    title: "A1–A2 Core Reading & Grammar Survival Pack",
    subject: "English",
    sizeEstimate: "36 KB JSON/Text",
    summary:
      "Ready-to-use A1/A2 reading passages, grammar rules, and transcript-backed listening exercises.",
  },
  {
    id: "pack_digital_literacy",
    title: "Digital Safety, AI Hallucinations & Source Check Guide",
    subject: "Coding & AI",
    sizeEstimate: "22 KB JSON/Text",
    summary:
      "Fact-checking checklist, lateral reading guide, and privacy rules accessible offline.",
  },
];

export function CurriculumAndOfflinePanel() {
  const { data: user } = useUser();
  const { state, update } = useStudentEcosystem();
  const { isOnline } = usePWA();
  const [unitCheckChoice, setUnitCheckChoice] = useState<Record<string, number>>({});
  const [unitCheckSubmitted, setUnitCheckSubmitted] = useState<Record<string, boolean>>({});
  const [syncingQueue, setSyncingQueue] = useState(false);

  const countries = useMemo(() => Array.from(new Set(CURRICULUM_UNITS.map((u) => u.country))), []);
  const grades = useMemo(() => Array.from(new Set(CURRICULUM_UNITS.map((u) => u.grade))), []);
  const subjects = ["All Subjects", "English", "Mathematics", "Science", "Coding & AI"];

  const filteredUnits = useMemo(
    () =>
      CURRICULUM_UNITS.filter((u) => {
        if (state.curriculumSelection.country && u.country !== state.curriculumSelection.country) {
          return false;
        }
        if (
          state.curriculumSelection.grade &&
          state.curriculumSelection.grade !== "All Grades" &&
          u.grade !== state.curriculumSelection.grade
        ) {
          return false;
        }
        if (
          state.curriculumSelection.subject &&
          state.curriculumSelection.subject !== "All Subjects" &&
          u.subject !== state.curriculumSelection.subject
        ) {
          return false;
        }
        return true;
      }),
    [state.curriculumSelection],
  );

  const handleToggleOfflinePack = async (packId: string) => {
    const installed = state.offlinePacksDownloaded.includes(packId);
    const localDef = OFFLINE_LEARNING_PACKS.find((p) => p.id === packId);
    const legacyDef = INITIAL_OFFLINE_LEARNING_PACKS.find((p) => p.id === packId);

    if (installed) {
      await removeOfflinePackFromCache(packId);
    } else {
      const packToCache = legacyDef ?? {
        id: packId,
        title: localDef?.title ?? packId,
        titleAr: localDef?.title ?? packId,
        subject: localDef?.subject ?? "General",
        approxSizeBytes: 32000,
        resourceIds: [],
        isFullyOfflineCapable: true,
        offlineFeaturesList: [localDef?.summary ?? "Offline quick study pack"],
        onlineOnlyNotice: "Live AI and Firestore sync require internet access.",
        version: "2026.11",
      };
      await downloadOfflinePackToCache(
        packToCache,
        OPEN_LEARNING_LIBRARY,
        state.communityResources ?? [],
      );
    }

    update((prev) => ({
      ...prev,
      offlinePacksDownloaded: installed
        ? prev.offlinePacksDownloaded.filter((id) => id !== packId)
        : Array.from(new Set([...prev.offlinePacksDownloaded, packId])),
      downloadedOfflinePackIds: installed
        ? (prev.downloadedOfflinePackIds ?? []).filter((id) => id !== packId)
        : Array.from(new Set([...(prev.downloadedOfflinePackIds ?? []), packId])),
    }));
    toast.success(
      installed
        ? "Removed pack from offline local Cache API."
        : "Pack cached in browser offline storage!",
    );
  };

  const handleQueueOfflineCheck = () => {
    update((prev) => ({
      ...prev,
      offlineSyncQueue: [
        {
          id: `oq_${Date.now().toString(36)}`,
          kind: "flashcard_review",
          label: `Offline self-check (${new Date().toLocaleTimeString()})`,
          payload: { subject: state.curriculumSelection.subject, area: "academic" },
          queuedAt: new Date().toISOString(),
        },
        ...prev.offlineSyncQueue,
      ],
    }));
    toast.success("Logged local progress check to offline sync queue.");
  };

  const handleSyncOfflineQueue = async () => {
    if (!isOnline) {
      toast.error("Still offline—local items stay safely queued until internet returns.");
      return;
    }
    setSyncingQueue(true);
    try {
      const result = await syncOfflineQueueToFirestore(state.offlineSyncQueue, user?.uid);
      update((prev) => ({
        ...prev,
        offlineSyncQueue: [],
      }));
      toast.success(
        result.syncedCount > 0
          ? `Reconciled ${result.syncedCount} offline event(s) (${result.resolvedConflicts} conflict(s) resolved)${result.syncedToCloud ? " to Firestore!" : " locally!"}`
          : "Sync queue is already up to date.",
      );
    } finally {
      setSyncingQueue(false);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* SECTION A: #15 CURRICULUM NAVIGATOR */}
      <div className="surface-card space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Compass className="size-4 text-primary" />
              Curriculum Navigator (Country · Grade · Subject · Units)
            </h3>
            <p className="text-muted-foreground mt-0.5">
              Organize study around structured units, objectives, and prerequisites. Clearly
              separates verified curriculum anchors from general curated practice.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <label htmlFor="cur-country" className="font-semibold text-foreground">
              Country / System Track
            </label>
            <ModernSelect
              id="cur-country"
              ariaLabel="Country / System Track"
              size="sm"
              value={state.curriculumSelection.country}
              onValueChange={(val) =>
                update((prev) => ({
                  ...prev,
                  curriculumSelection: {
                    ...prev.curriculumSelection,
                    country: val,
                  },
                }))
              }
              options={countries.map((c) => ({ value: c, label: c }))}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="cur-grade" className="font-semibold text-foreground">
              Grade Level
            </label>
            <ModernSelect
              id="cur-grade"
              ariaLabel="Grade Level"
              size="sm"
              value={state.curriculumSelection.grade}
              onValueChange={(val) =>
                update((prev) => ({
                  ...prev,
                  curriculumSelection: {
                    ...prev.curriculumSelection,
                    grade: val,
                  },
                }))
              }
              options={[
                { value: "All Grades", label: "All Grades" },
                ...grades.map((g) => ({ value: g, label: g })),
              ]}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="cur-subject" className="font-semibold text-foreground">
              Subject
            </label>
            <ModernSelect
              id="cur-subject"
              ariaLabel="Subject"
              size="sm"
              value={state.curriculumSelection.subject}
              onValueChange={(val) =>
                update((prev) => ({
                  ...prev,
                  curriculumSelection: {
                    ...prev.curriculumSelection,
                    subject: val,
                  },
                }))
              }
              options={subjects.map((s) => ({ value: s, label: s }))}
            />
          </div>
        </div>

        <div className="space-y-3">
          {(filteredUnits.length > 0 ? filteredUnits : CURRICULUM_UNITS.slice(0, 3)).map((unit) => {
            const chosen = unitCheckChoice[unit.id];
            const checked = unitCheckSubmitted[unit.id];
            const correct = checked && chosen === unit.sampleCheck.correctIndex;
            return (
              <div
                key={unit.id}
                className="rounded-xl border border-border bg-surface-2 p-4 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-bold uppercase text-primary">
                      {unit.country} · {unit.grade} · {unit.subject}
                    </div>
                    <h4 className="font-display text-sm font-bold text-foreground mt-0.5">
                      {unit.unitTitle}
                    </h4>
                  </div>
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                      unit.contentStatus === "curated_anchor"
                        ? "border-success/40 bg-success/10 text-success"
                        : "border-border bg-surface text-muted-foreground"
                    }`}
                  >
                    {unit.contentStatus === "curated_anchor"
                      ? "Verified Curriculum Anchor"
                      : "General Curated Learning"}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground">{unit.contentStatusNote}</p>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="font-semibold text-foreground mb-1">Unit Objectives</div>
                    <ul className="list-disc ps-4 space-y-0.5 text-muted-foreground">
                      {unit.learningObjectives.map((obj) => (
                        <li key={obj}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-border bg-surface p-3 space-y-2">
                    <div className="font-semibold text-foreground">
                      Quick Objective Check: {unit.sampleCheck.question}
                    </div>
                    <div className="grid gap-1.5">
                      {unit.sampleCheck.options.map((opt, oIdx) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setUnitCheckChoice((prev) => ({ ...prev, [unit.id]: oIdx }))
                          }
                          className={`rounded border px-2.5 py-1.5 text-start text-[11px] ${
                            chosen === oIdx
                              ? "border-primary bg-primary/15 text-primary font-semibold"
                              : "border-border bg-surface-2 text-foreground"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={typeof chosen !== "number"}
                        onClick={() =>
                          setUnitCheckSubmitted((prev) => ({ ...prev, [unit.id]: true }))
                        }
                        className="h-7 text-[11px]"
                      >
                        Check Answer
                      </Button>
                      <Link
                        to={unit.linkedRoute}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                      >
                        <BookOpen className="size-3" />
                        <span>Open Related Lessons</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                    {checked && (
                      <p
                        className={`text-[11px] font-medium ${
                          correct ? "text-success" : "text-xp"
                        }`}
                      >
                        {correct ? "Accurate! " : "Note: "}
                        {unit.sampleCheck.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION B: #20 LEARNING WITHOUT INTERNET (OFFLINE PACKS + SYNC QUEUE) */}
      <div className="surface-card space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              {isOnline ? (
                <Wifi className="size-4 text-success" />
              ) : (
                <WifiOff className="size-4 text-xp" />
              )}
              Learning Without Internet · Offline Study Packs &amp; Sync Queue
            </h3>
            <p className="text-muted-foreground mt-0.5">
              Connection status: <strong>{isOnline ? "Online" : "Offline Mode"}</strong> · Cache
              compact packs in browser storage &amp; reconcile offline events via Firestore.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleQueueOfflineCheck}
              className="h-8 text-xs"
            >
              <CloudOff className="size-3.5" />
              <span>Log Local Study Event</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="glow"
              disabled={syncingQueue}
              onClick={() => void handleSyncOfflineQueue()}
              className="h-8 text-xs tabular-nums"
            >
              <RefreshCw className={`size-3.5 ${syncingQueue ? "animate-spin" : ""}`} />
              <span>Sync Queued ({state.offlineSyncQueue.length})</span>
            </Button>
          </div>
        </div>

        {/* Honest Online-Only AI Disclosure */}
        <div className="flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary/5 p-3 text-foreground">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <strong>What Works Offline vs. Online:</strong> Downloaded vocabulary packs, Curriculum
            lessons, local Flashcards, Gap Detector, Exam Simulator, Smart Material Transformer, and
            Question Generator run 100% locally offline. Live Gemini AI Tutor chat, Web Search
            Grounding, Voice Live, and Cloud Firestore sync require an active internet connection.
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {OFFLINE_LEARNING_PACKS.map((pack) => {
            const downloaded = state.offlinePacksDownloaded.includes(pack.id);
            return (
              <div
                key={pack.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-surface-2 p-4"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold uppercase text-primary">{pack.subject}</span>
                    <span className="text-muted-foreground">{pack.sizeEstimate}</span>
                  </div>
                  <h4 className="font-display text-sm font-bold text-foreground mt-1">
                    {pack.title}
                  </h4>
                  <p className="text-muted-foreground mt-1">{pack.summary}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      downloaded ? "text-success" : "text-muted-foreground"
                    }`}
                  >
                    <CheckCircle2 className="size-3.5" />
                    {downloaded ? "Cached Locally" : "Not Cached"}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant={downloaded ? "outline" : "glow"}
                    onClick={() => void handleToggleOfflinePack(pack.id)}
                    className="h-8 text-xs"
                  >
                    <Download className="size-3.5" />
                    <span>{downloaded ? "Remove Cache" : "Download Pack"}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {state.offlineSyncQueue.length > 0 && (
          <div className="rounded-xl border border-border bg-surface-2 p-3.5 space-y-1.5">
            <div className="font-semibold text-foreground tabular-nums">
              Queued Local Actions Awaiting Sync ({state.offlineSyncQueue.length})
            </div>
            {state.offlineSyncQueue.slice(0, 4).map((q) => (
              <div key={q.id} className="flex justify-between text-[11px] text-muted-foreground">
                <span>{q.label}</span>
                <span>{q.queuedAt.slice(0, 16).replace("T", " ")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
