import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarClock,
  Flame,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { useAuthSession, useGoals, useTasks } from "@/hooks/use-nexora";
import { useStudyItems } from "@/hooks/use-modules";
import { usePrefs } from "@/lib/preferences";
import { buildSmartRecommendations, type SmartRecommendation } from "@/lib/recommendations";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";

const KIND_ICON: Record<SmartRecommendation["kind"], typeof Sparkles> = {
  overdue: AlertCircle,
  due_soon: CalendarClock,
  mistake: BookOpen,
  flashcard: BookOpen,
  goal: Target,
  focus: Flame,
};

const KIND_TONE: Record<SmartRecommendation["kind"], string> = {
  overdue: "bg-destructive/15 text-destructive",
  due_soon: "bg-xp/15 text-xp",
  mistake: "bg-primary/15 text-primary",
  flashcard: "bg-primary/15 text-primary",
  goal: "bg-success/15 text-success",
  focus: "bg-xp/15 text-xp",
};

function getDismissStorageKey(uid: string) {
  const day = new Date().toISOString().slice(0, 10);
  return `nexora:dismissed-recs:${uid}:${day}`;
}

export function SmartRecommendationsWidget() {
  const { t, study } = usePrefs();
  const { user } = useAuthSession();
  const uid = user?.uid ?? "guest";
  const storageKey = getDismissStorageKey(uid);

  const { data: tasks = [] } = useTasks();
  const { data: goals = [] } = useGoals();
  const { data: studyItems = [] } = useStudyItems();

  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          setDismissedIds(parsed.filter((x): x is string => typeof x === "string"));
          return;
        }
      }
      setDismissedIds([]);
    } catch {
      setDismissedIds([]);
    }
  }, [storageKey]);

  const persistDismissed = (next: string[]) => {
    setDismissedIds(next);
    try {
      if (next.length === 0) {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(storageKey, JSON.stringify(next));
      }
    } catch {
      // Ignore storage quota errors
    }
  };

  const allRecs = buildSmartRecommendations({
    tasks,
    goals,
    studyItems,
    sessionMinutes: study.sessionMinutes,
  });

  const recs = allRecs.filter((r) => !dismissedIds.includes(r.id));
  const hasDismissed = dismissedIds.some((id) => allRecs.some((r) => r.id === id));

  return (
    <section aria-label={t("dash.rec.title")} className="surface-card p-5">
      <div className="flex flex-col gap-2 border-b border-border/80 pb-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Lightbulb className="size-4" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-foreground">
              {t("dash.rec.title")}
            </h2>
            <p className="text-xs text-muted-foreground">{t("dash.rec.sub")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {hasDismissed && (
            <button
              type="button"
              onClick={() => persistDismissed([])}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="size-3" />
              <span>{t("recs.resetHidden")}</span>
            </button>
          )}
          <FeatureGuideTrigger featureId="smart-recommendations" iconOnly />
        </div>
      </div>

      {recs.length === 0 ? (
        <p className="py-5 text-center text-sm text-muted-foreground">{t("dash.rec.empty")}</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {recs.map((rec) => {
            const Icon = KIND_ICON[rec.kind];
            const tone = KIND_TONE[rec.kind];
            return (
              <div
                key={rec.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-surface-2 p-3.5 transition-colors hover:border-primary/40"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex size-7 items-center justify-center rounded-lg ${tone}`}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("dash.rec.why")}
                      </span>
                      <button
                        type="button"
                        onClick={() => persistDismissed([...dismissedIds, rec.id])}
                        title={t("recs.dismiss")}
                        aria-label={`${t("recs.dismiss")}: ${rec.title}`}
                        className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="line-clamp-1 font-display text-sm font-bold text-foreground">
                    {rec.title}
                  </p>
                  <p className="text-xs leading-snug text-muted-foreground">{t(rec.reasonKey)}</p>
                </div>

                <Link
                  to={rec.to}
                  className="inline-flex items-center justify-between rounded-lg border border-border/80 bg-surface px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/10"
                >
                  <span>{t(rec.ctaKey)}</span>
                  <ArrowRight className="size-3.5 rtl-flip" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
