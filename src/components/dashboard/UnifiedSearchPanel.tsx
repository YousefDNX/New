import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Atom,
  BookOpen,
  CheckSquare,
  Code2,
  Compass,
  Globe2,
  NotebookPen,
  Rocket,
  Search,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  useFuturePlans,
  useJournalEntries,
  useOpportunities,
  useStudyItems,
} from "@/hooks/use-modules";
import { useGoals, useTasks } from "@/hooks/use-nexora";
import { searchStudentLibrary, type SearchResultKind } from "@/lib/growth";
import { usePrefs } from "@/lib/preferences";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";

const KIND_ICON: Record<SearchResultKind, typeof Search> = {
  task: CheckSquare,
  goal: Target,
  study: BookOpen,
  journal: NotebookPen,
  future: Rocket,
  opportunity: Compass,
  simulation: Atom,
  coding: Code2,
  creativity: Sparkles,
  civic: Globe2,
};

export function UnifiedSearchPanel() {
  const { t } = usePrefs();
  const [query, setQuery] = useState("");

  const { data: tasks = [] } = useTasks();
  const { data: goals = [] } = useGoals();
  const { data: studyItems = [] } = useStudyItems();
  const { data: journalEntries = [] } = useJournalEntries();
  const { data: futurePlans = [] } = useFuturePlans();
  const { data: opportunities = [] } = useOpportunities();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchStudentLibrary(
      query,
      {
        tasks,
        goals,
        studyItems,
        journalEntries,
        futurePlans,
        opportunities,
      },
      12,
    );
  }, [query, tasks, goals, studyItems, journalEntries, futurePlans, opportunities]);

  return (
    <section aria-label={t("search.library.title")} className="surface-card p-3.5 sm:p-4">
      <div className="flex items-center gap-2">
        <div className="relative flex flex-1 items-center">
          <Search className="pointer-events-none absolute start-3 size-4 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.library.placeholder")}
            aria-label={t("search.library.title")}
            className="h-9 bg-surface-2 ps-9 pe-8 text-xs sm:text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t("common.cancel")}
              className="absolute end-2.5 rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <FeatureGuideTrigger featureId="dashboard-search" iconOnly />
      </div>

      {query.trim().length > 0 && (
        <div className="mt-3 border-t border-border/70 pt-3">
          {results.length === 0 ? (
            <p className="py-2 text-center text-xs text-muted-foreground">
              {t("search.library.empty")}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((item) => {
                const Icon = KIND_ICON[item.kind];
                return (
                  <Link
                    key={item.id}
                    to={item.to}
                    onClick={() => setQuery("")}
                    className="group flex items-center justify-between gap-2.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{item.title}</p>
                        <p className="truncate text-[0.68rem] text-muted-foreground">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary rtl-flip" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
