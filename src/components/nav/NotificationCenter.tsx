import { Link } from "@tanstack/react-router";
import { AlertTriangle, Bell, BookOpen, CheckCircle2, Clock, Target, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useStudyItems } from "@/hooks/use-modules";
import { useGoals, useTasks } from "@/hooks/use-nexora";
import { usePrefs } from "@/lib/preferences";
import { buildStudentAlerts, type StudentAlert } from "@/lib/recommendations";
import { cn } from "@/lib/utils";

export function NotificationCenter({ compact = false }: { compact?: boolean }) {
  const { t } = usePrefs();
  const { data: tasks = [] } = useTasks();
  const { data: goals = [] } = useGoals();
  const { data: studyItems = [] } = useStudyItems();
  const [open, setOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const alerts = useMemo(() => {
    const all = buildStudentAlerts({ tasks, goals, studyItems });
    const dismissed = new Set(dismissedIds);
    return all.filter((a) => !dismissed.has(a.id));
  }, [tasks, goals, studyItems, dismissedIds]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const iconForKind = (kind: StudentAlert["kind"]) => {
    switch (kind) {
      case "overdue_task":
        return AlertTriangle;
      case "due_soon_task":
        return Clock;
      case "due_flashcards":
        return BookOpen;
      case "daily_goal":
        return Target;
    }
  };

  const labelForKind = (alert: StudentAlert): string => {
    switch (alert.kind) {
      case "overdue_task":
        return `${t("dash.rec.overdue")} (${alert.count})`;
      case "due_soon_task":
        return `${t("dash.rec.dueSoon")} (${alert.count})`;
      case "due_flashcards":
        return `${t("cal.dueCards")}: ${alert.count}`;
      case "daily_goal":
        return `${t("dash.rec.goals")} (${alert.count})`;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size={compact ? "icon" : "sm"}
        data-testid="notification-center-btn"
        aria-label={t("nav.alerts")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative",
          compact
            ? "size-8"
            : "h-8 gap-2 px-2.5 text-xs text-muted-foreground hover:text-foreground",
        )}
      >
        <Bell className="size-4 shrink-0" />
        {!compact && <span className="truncate">{t("nav.alerts")}</span>}
        {alerts.length > 0 && (
          <span
            data-testid="notification-unread-count"
            className="inline-flex min-w-4 items-center justify-center rounded-sm bg-destructive px-1 text-[0.62rem] font-bold leading-4 text-destructive-foreground tabular-nums"
          >
            {alerts.length}
          </span>
        )}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label={t("nav.alerts")}
          data-testid="notification-center-panel"
          className="absolute end-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-xl border border-emerald-500/25 bg-surface/95 p-3 text-popover-foreground shadow-[0_12px_36px_-12px_rgba(16,185,129,0.28)] backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
        >
          <div className="flex items-center justify-between border-b border-border/80 pb-2">
            <div className="flex items-center gap-2">
              <Bell className="size-3.5 text-primary" />
              <span className="font-display text-xs font-bold text-foreground">
                {t("nav.alerts")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              aria-label={t("common.close")}
            >
              <X className="size-3.5" />
            </button>
          </div>

          {alerts.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 py-6 text-center text-xs text-muted-foreground">
              <CheckCircle2 className="size-5 text-success" />
              <span>{t("nav.alertsEmpty")}</span>
            </div>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {alerts.map((alert) => {
                const Icon = iconForKind(alert.kind);
                return (
                  <li
                    key={alert.id}
                    className="flex items-start justify-between gap-2 rounded-lg border border-border/70 bg-surface-2/70 p-2.5"
                  >
                    <Link
                      to={alert.to}
                      onClick={() => setOpen(false)}
                      className="flex min-w-0 flex-1 items-start gap-2.5 text-start hover:opacity-90"
                    >
                      <Icon
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          alert.severity === "high"
                            ? "text-destructive"
                            : alert.severity === "medium"
                              ? "text-xp"
                              : "text-primary",
                        )}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-foreground">
                          {labelForKind(alert)}
                        </div>
                        {alert.kind !== "due_flashcards" && (
                          <div className="truncate text-[0.7rem] text-muted-foreground">
                            {alert.title}
                          </div>
                        )}
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDismissedIds((prev) => [...prev, alert.id])}
                      className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label={t("common.close")}
                    >
                      <X className="size-3" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
