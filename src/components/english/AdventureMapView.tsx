import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  List,
  Lock,
  Map as MapIcon,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CURRICULUM_LESSONS,
  type AcademyWorkspaceId,
  type AdventureRegionId,
} from "@/data/english-curriculum";
import {
  evaluateAdventureMapState,
  type EnglishWorldState,
  type EvaluatedAdventureRegion,
} from "@/lib/english-world";

const MAP_CONNECTIONS: Array<[AdventureRegionId, AdventureRegionId]> = [
  ["vocabulary-village", "pronunciation-mountain"],
  ["vocabulary-village", "reading-library"],
  ["grammar-kingdom", "reading-library"],
  ["grammar-kingdom", "writing-academy"],
  ["reading-library", "writing-academy"],
  ["listening-forest", "speaking-city"],
  ["speaking-city", "communication-harbor"],
  ["reading-library", "communication-harbor"],
  ["writing-academy", "english-challenge-arena"],
  ["listening-forest", "english-challenge-arena"],
  ["communication-harbor", "mastery-castle"],
  ["english-challenge-arena", "mastery-castle"],
];

export function AdventureMapView({
  englishState,
  onLaunchLesson,
  onOpenAcademy,
}: {
  englishState: EnglishWorldState;
  onLaunchLesson: (lessonId: string) => void;
  onOpenAcademy: (academy: AcademyWorkspaceId) => void;
}) {
  const regions = evaluateAdventureMapState(englishState);
  const [selectedId, setSelectedId] = useState<AdventureRegionId>("vocabulary-village");
  const [accessibleListMode, setAccessibleListMode] = useState(false);

  const selected: EvaluatedAdventureRegion =
    regions.find((r) => r.region.id === selectedId) ?? regions[0]!;

  const regionById = new Map(regions.map((r) => [r.region.id, r]));
  const unlockedCount = regions.filter((r) => r.status !== "locked").length;
  const completedCount = regions.filter((r) => r.status === "completed").length;

  const linkedLessons = CURRICULUM_LESSONS.filter((l) => selected.region.lessonIds.includes(l.id));

  return (
    <div className="space-y-5">
      {/* Header bar with accessible list toggle */}
      <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-foreground">
            English Adventure Map
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {unlockedCount}/{regions.length} regions unlocked · {completedCount} completed · Click
            any unlocked region to start lessons or revise
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={!accessibleListMode ? "glow" : "outline"}
            onClick={() => setAccessibleListMode(false)}
            className="min-h-[44px] gap-1.5 whitespace-nowrap shrink-0 text-xs"
          >
            <MapIcon className="size-3.5" />
            <span>Interactive Map</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={accessibleListMode ? "glow" : "outline"}
            onClick={() => setAccessibleListMode(true)}
            className="min-h-[44px] gap-1.5 whitespace-nowrap shrink-0 text-xs"
          >
            <List className="size-3.5" />
            <span>Accessible List</span>
          </Button>
        </div>
      </div>

      {/* Main Layout: Stage + Control/Inspector Deck */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* LEFT STAGE: Interactive Trail Map or Accessible Keyboard List */}
        <div className="surface-card p-4 lg:col-span-7">
          {!accessibleListMode ? (
            <div className="space-y-3">
              <div className="relative h-[380px] w-full overflow-hidden rounded-xl border border-border bg-surface-2 sm:h-[430px]">
                {/* Connected region pathways */}
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  aria-hidden="true"
                >
                  {MAP_CONNECTIONS.map(([fromId, toId]) => {
                    const from = regionById.get(fromId);
                    const to = regionById.get(toId);
                    if (!from || !to) return null;
                    const activeEdge = from.status !== "locked" && to.status !== "locked";
                    const midX = (from.region.mapX + to.region.mapX) / 2;
                    const d = `M ${from.region.mapX} ${from.region.mapY} Q ${midX} ${
                      (from.region.mapY + to.region.mapY) / 2 - 4
                    } ${to.region.mapX} ${to.region.mapY}`;
                    return (
                      <path
                        key={`${fromId}-${toId}`}
                        d={d}
                        fill="none"
                        stroke={activeEdge ? "var(--primary)" : "var(--border)"}
                        strokeWidth={activeEdge ? "0.7" : "0.45"}
                        strokeDasharray={activeEdge ? undefined : "1.5 1.5"}
                        opacity={activeEdge ? 0.85 : 0.65}
                      />
                    );
                  })}
                </svg>

                {/* Interactive Region Nodes */}
                {regions.map((item, index) => {
                  const isSelected = item.region.id === selected.region.id;
                  const isLocked = item.status === "locked";
                  const isCompleted = item.status === "completed";
                  const isInProgress = item.status === "in_progress";

                  return (
                    <button
                      key={item.region.id}
                      type="button"
                      onClick={() => setSelectedId(item.region.id)}
                      style={{
                        left: `${item.region.mapX}%`,
                        top: `${item.region.mapY}%`,
                      }}
                      aria-label={`${item.region.name} (${item.status.replace("_", " ")})`}
                      className={`group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 focus:outline-none`}
                    >
                      <span
                        className={`flex size-10 items-center justify-center rounded-xl border text-xs font-bold shadow-sm transition-all sm:size-11 ${
                          isSelected
                            ? "scale-110 border-primary bg-primary text-primary-foreground ring-2 ring-primary/40"
                            : isCompleted
                              ? "border-success bg-success/20 text-success hover:scale-105"
                              : isInProgress
                                ? "border-primary bg-primary/20 text-primary hover:scale-105"
                                : isLocked
                                  ? "border-border bg-surface text-muted-foreground opacity-75 hover:opacity-100"
                                  : "border-primary/60 bg-surface text-foreground hover:border-primary hover:scale-105"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="size-4" />
                        ) : isLocked ? (
                          <Lock className="size-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </span>
                      <span
                        className={`max-w-[76px] sm:max-w-[98px] truncate rounded px-1.5 py-0.5 text-[10px] font-semibold leading-tight shadow-sm ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface/95 text-foreground border border-border"
                        }`}
                      >
                        {item.region.name.replace(" Academy", "").replace(" Castle", "")}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Clean Legend using inline text + icons */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-success" />
                  Completed (revisit anytime)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Compass className="size-3.5 text-primary" />
                  Unlocked / In Progress
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="size-3.5 text-muted-foreground" />
                  Locked (prerequisite shown on click)
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2" role="list" aria-label="Adventure regions accessible list">
              {regions.map((item, idx) => {
                const isSelected = item.region.id === selected.region.id;
                const isLocked = item.status === "locked";
                const isCompleted = item.status === "completed";
                return (
                  <button
                    key={item.region.id}
                    type="button"
                    onClick={() => setSelectedId(item.region.id)}
                    className={`flex min-h-[44px] w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-start transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-surface-2 hover:border-primary/40"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <span>
                          {idx + 1}. {item.region.name}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground">
                          · {item.region.cefrBand}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.region.subtitle}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-success">
                          <CheckCircle2 className="size-3.5" />
                          Done
                        </span>
                      ) : isLocked ? (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Lock className="size-3.5" />
                          Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-primary">
                          <Sparkles className="size-3.5" />
                          Open
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT INSPECTOR & LAUNCH PANEL */}
        <div className="surface-card flex flex-col justify-between gap-4 p-5 lg:col-span-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <div className="text-xs font-semibold text-primary">
                  {selected.region.cefrBand} · +{selected.region.rewardXp} XP Region Goal
                </div>
                <h4 className="mt-1 font-display text-lg font-bold text-foreground">
                  {selected.region.name}
                </h4>
                <p className="text-xs text-muted-foreground">{selected.region.nameAr}</p>
              </div>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold ${
                  selected.status === "completed"
                    ? "text-success"
                    : selected.status === "locked"
                      ? "text-muted-foreground"
                      : "text-primary"
                }`}
              >
                {selected.status === "completed" ? (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Mastered</span>
                  </>
                ) : selected.status === "locked" ? (
                  <>
                    <Lock className="size-4" />
                    <span>Locked</span>
                  </>
                ) : (
                  <>
                    <Compass className="size-4" />
                    <span>{selected.status === "in_progress" ? "In Progress" : "Unlocked"}</span>
                  </>
                )}
              </span>
            </div>

            <p className="text-sm text-foreground">{selected.region.objective}</p>

            {/* Clear Status / Unlock Instructions */}
            <div className="rounded-lg border border-border bg-surface-2 p-3 text-xs text-muted-foreground">
              <strong className="text-foreground">Region Status:</strong> {selected.reason}
              {selected.unmetPrerequisites.length > 0 && (
                <div className="mt-1.5 text-foreground">
                  Needs progress in: {selected.unmetPrerequisites.join(" + ")}
                </div>
              )}
            </div>

            {/* Linked Ready-to-Use Lessons */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ready-to-Use Region Lessons ({selected.completedLessonsCount}/{linkedLessons.length}
                )
              </div>
              {linkedLessons.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Practice directly in this region's linked Skill Academy below.
                </p>
              ) : (
                <div className="space-y-2">
                  {linkedLessons.map((lesson) => {
                    const isDone = englishState.completedLessons.includes(lesson.id);
                    const score = englishState.lessonScores[lesson.id];
                    return (
                      <div
                        key={lesson.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            {isDone ? (
                              <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                            ) : (
                              <BookOpen className="size-3.5 shrink-0 text-primary" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {lesson.cefrLabel} · {lesson.estimatedMinutes} min
                            {typeof score === "number" ? ` · Best score: ${score}%` : ""}
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={isDone ? "outline" : "glow"}
                          disabled={selected.status === "locked"}
                          onClick={() => onLaunchLesson(lesson.id)}
                          className="min-h-[40px] whitespace-nowrap shrink-0 text-xs"
                        >
                          {isDone ? (
                            <>
                              <RotateCcw className="size-3" />
                              <span>Revise</span>
                            </>
                          ) : (
                            <>
                              <span>Start Lesson</span>
                              <ArrowRight className="size-3" />
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <span className="text-xs text-muted-foreground">Direct Academy Practice:</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={selected.status === "locked"}
              onClick={() => onOpenAcademy(selected.region.academyId)}
              className="min-h-[40px] gap-1.5 whitespace-nowrap shrink-0 text-xs"
            >
              <span>
                Open{" "}
                {selected.region.academyId[0]!.toUpperCase() + selected.region.academyId.slice(1)}{" "}
                Academy
              </span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
