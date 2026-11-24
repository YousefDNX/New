import { useEffect, type ReactNode } from "react";
import { CheckCircle2, Circle, Clock, PanelRightOpen, Trash2 } from "lucide-react";
import { useExperienceMode } from "@/lib/experience-mode";
import type { ExperienceParadigm } from "@/lib/ui-experiences";

export interface AdaptiveDataItem {
  id: string;
  title: string;
  details?: string | null;
  status: "todo" | "in_progress" | "done" | "cancelled";
  priorityLabel: string;
  priorityTone: "high" | "medium" | "low";
  categoryLabel: string;
  dueLabel?: string | null;
  goalTitle?: string | null;
  xpLabel: string;
}

interface AdaptiveDataViewProps {
  items: AdaptiveDataItem[];
  onToggleDone: (item: AdaptiveDataItem) => void;
  onToggleInProgress?: (item: AdaptiveDataItem) => void;
  onDelete?: (id: string) => void;
  emptyState: ReactNode;
  forcedParadigm?: ExperienceParadigm;
  labels: {
    colItem: string;
    colCategory: string;
    colPriority: string;
    colStatus: string;
    colActions: string;
    todo: string;
    inProgress: string;
    done: string;
    markDone: string;
    markTodo: string;
    inspectDrawer: string;
    deleteLabel: string;
    selectHint: string;
  };
}

/**
 * Component-Level Structural Variant:
 * - Mode A (editorial): Semantic HTML <table>
 * - Mode B (command): Kanban status columns + inline action cards
 * - Mode C (spatial): Split-screen Master-Detail view + Slide-over Drawer trigger
 */
export function AdaptiveDataView({
  items,
  onToggleDone,
  onToggleInProgress,
  onDelete,
  emptyState,
  forcedParadigm,
  labels,
}: AdaptiveDataViewProps) {
  const {
    paradigm: activeParadigm,
    selectedRecordId,
    setSelectedRecordId,
    openSpatialDrawer,
  } = useExperienceMode();
  const paradigm = forcedParadigm ?? activeParadigm;

  const activeItem = items.find((i) => i.id === selectedRecordId) ?? items[0] ?? null;

  useEffect(() => {
    if (
      paradigm === "spatial" &&
      items.length > 0 &&
      !items.some((i) => i.id === selectedRecordId)
    ) {
      setSelectedRecordId(items[0]!.id);
    }
  }, [paradigm, items, selectedRecordId, setSelectedRecordId]);

  if (items.length === 0) {
    return <>{emptyState}</>;
  }

  /* =========================================================================
   * MODE A (Editorial): Structured Semantic Table
   * ========================================================================= */
  if (paradigm === "editorial") {
    return (
      <div data-testid="adaptive-view-table" className="overflow-x-auto">
        <table className="w-full border-collapse text-start text-xs">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2.5 pe-3 text-start font-semibold">{labels.colItem}</th>
              <th className="py-2.5 px-2 text-start font-semibold">{labels.colCategory}</th>
              <th className="py-2.5 px-2 text-start font-semibold">{labels.colPriority}</th>
              <th className="py-2.5 px-2 text-start font-semibold">{labels.colStatus}</th>
              <th className="py-2.5 ps-2 text-end font-semibold">{labels.colActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {items.map((item) => {
              const isDone = item.status === "done";
              return (
                <tr key={item.id} className="hover:bg-surface-2/40 transition-colors">
                  <td className="py-3 pe-3 align-top">
                    <button
                      type="button"
                      onClick={() => onToggleDone(item)}
                      className="flex items-start gap-2 text-start font-medium text-foreground hover:text-primary"
                    >
                      {isDone ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                      ) : item.status === "in_progress" ? (
                        <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                      ) : (
                        <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className={isDone ? "line-through text-muted-foreground" : ""}>
                        {item.title}
                      </span>
                    </button>
                    {item.dueLabel && (
                      <div className="mt-0.5 ps-6 text-[11px] text-muted-foreground">
                        {item.dueLabel} · {item.xpLabel}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-2 align-top text-muted-foreground">
                    {item.categoryLabel}
                  </td>
                  <td className="py-3 px-2 align-top font-medium text-foreground">
                    {item.priorityLabel}
                  </td>
                  <td className="py-3 px-2 align-top text-muted-foreground">
                    {isDone
                      ? labels.done
                      : item.status === "in_progress"
                        ? labels.inProgress
                        : labels.todo}
                  </td>
                  <td className="py-3 ps-2 align-top text-end">
                    <div className="inline-flex items-center gap-1">
                      {!isDone && onToggleInProgress && (
                        <button
                          type="button"
                          onClick={() => onToggleInProgress(item)}
                          title={labels.inProgress}
                          className="rounded p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-primary"
                        >
                          <Clock className="size-3.5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          title={labels.deleteLabel}
                          aria-label={`${labels.deleteLabel}: ${item.title}`}
                          className="rounded p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  /* =========================================================================
   * MODE B (Command Center): Kanban / Action Columns with Inline Controls
   * ========================================================================= */
  if (paradigm === "command") {
    const todoItems = items.filter((i) => i.status === "todo");
    const activeItems = items.filter((i) => i.status === "in_progress");
    const doneItems = items.filter((i) => i.status === "done" || i.status === "cancelled");

    const lanes = [
      { id: "todo", label: labels.todo, list: todoItems },
      { id: "in_progress", label: labels.inProgress, list: activeItems },
      { id: "done", label: labels.done, list: doneItems },
    ];

    return (
      <div data-testid="adaptive-view-kanban" className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {lanes.map((lane) => (
          <div
            key={lane.id}
            className="flex flex-col rounded-xl border border-border bg-surface-2/50 p-2.5"
          >
            <div className="mb-2 flex items-center justify-between border-b border-border/70 pb-1.5 text-xs font-semibold text-foreground">
              <span>{lane.label}</span>
              <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                {lane.list.length}
              </span>
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto pe-0.5">
              {lane.list.length === 0 ? (
                <div className="py-4 text-center text-[11px] text-muted-foreground">—</div>
              ) : (
                lane.list.map((item) => {
                  const isDone = item.status === "done";
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg border border-border bg-surface p-2.5 text-xs transition-colors hover:border-primary/45"
                    >
                      <div className="font-medium text-foreground">{item.title}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {item.categoryLabel} · {item.priorityLabel}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-1 border-t border-border/60 pt-2">
                        <button
                          type="button"
                          onClick={() => onToggleDone(item)}
                          className="min-h-[30px] rounded bg-primary/12 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20"
                        >
                          {isDone ? labels.markTodo : labels.markDone}
                        </button>
                        <div className="flex items-center gap-1">
                          {!isDone && onToggleInProgress && (
                            <button
                              type="button"
                              onClick={() => onToggleInProgress(item)}
                              title={labels.inProgress}
                              className="rounded p-1 text-muted-foreground hover:text-primary"
                            >
                              <Clock className="size-3.5" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              type="button"
                              onClick={() => onDelete(item.id)}
                              title={labels.deleteLabel}
                              aria-label={`${labels.deleteLabel}: ${item.title}`}
                              className="rounded p-1 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* =========================================================================
   * MODE C (Spatial / Interactive): Master-Detail Split View + Slide-Over Drawer
   * ========================================================================= */
  return (
    <div
      data-testid="adaptive-view-master-detail"
      className="grid grid-cols-1 gap-4 md:grid-cols-12"
    >
      {/* Master List */}
      <div className="max-h-72 space-y-1.5 overflow-y-auto pe-1 md:col-span-5">
        {items.map((item) => {
          const isSelected = activeItem?.id === item.id;
          const isDone = item.status === "done";
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedRecordId(item.id)}
              className={`flex w-full items-start gap-2.5 rounded-xl border p-2.5 text-start text-xs transition-all ${
                isSelected
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-surface-2/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
              ) : (
                <Circle className="mt-0.5 size-4 shrink-0 text-primary" />
              )}
              <div className="min-w-0 flex-1">
                <div className={`truncate font-semibold ${isDone ? "line-through" : ""}`}>
                  {item.title}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {item.categoryLabel} · {item.priorityLabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Detail Inspector */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-surface-2/40 p-4 md:col-span-7">
        {activeItem ? (
          <>
            <div className="space-y-2">
              <div className="text-[11px] font-medium text-primary">
                {activeItem.categoryLabel} · {activeItem.priorityLabel} · {activeItem.xpLabel}
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                {activeItem.title}
              </h3>
              {activeItem.details && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {activeItem.details}
                </p>
              )}
              {(activeItem.dueLabel || activeItem.goalTitle) && (
                <div className="pt-1 text-xs text-muted-foreground">
                  {activeItem.dueLabel ? activeItem.dueLabel : ""}
                  {activeItem.dueLabel && activeItem.goalTitle ? " · " : ""}
                  {activeItem.goalTitle ? activeItem.goalTitle : ""}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
              <button
                type="button"
                onClick={() => onToggleDone(activeItem)}
                className="min-h-[38px] rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {activeItem.status === "done" ? labels.markTodo : labels.markDone}
              </button>
              <button
                type="button"
                onClick={() =>
                  openSpatialDrawer({
                    title: activeItem.title,
                    meta: `${activeItem.categoryLabel} · ${activeItem.priorityLabel}`,
                    subtitle: activeItem.dueLabel ?? undefined,
                    body: (
                      <div className="space-y-4 text-sm text-foreground">
                        <p className="leading-relaxed text-muted-foreground">
                          {activeItem.details || labels.selectHint}
                        </p>
                        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                          <button
                            type="button"
                            onClick={() => onToggleDone(activeItem)}
                            className="min-h-[40px] rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                          >
                            {activeItem.status === "done" ? labels.markTodo : labels.markDone}
                          </button>
                          {onDelete && (
                            <button
                              type="button"
                              onClick={() => onDelete(activeItem.id)}
                              className="min-h-[40px] rounded-lg border border-destructive/40 px-4 py-2 text-xs font-semibold text-destructive"
                            >
                              {labels.deleteLabel}
                            </button>
                          )}
                        </div>
                      </div>
                    ),
                  })
                }
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/45"
              >
                <PanelRightOpen className="size-3.5 text-primary" />
                <span>{labels.inspectDrawer}</span>
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(activeItem.id)}
                  aria-label={`${labels.deleteLabel}: ${activeItem.title}`}
                  className="ms-auto min-h-[38px] rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">{labels.selectHint}</p>
        )}
      </div>
    </div>
  );
}
