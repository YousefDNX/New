import { useMemo } from "react";
import {
  BookOpen,
  CheckSquare,
  Flame,
  HeartPulse,
  Compass,
  Users,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { usePrefs } from "@/lib/preferences";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { AREA_CONFIG, AREAS, computeDomainScores, type Area } from "@/lib/growth";
import { formatNumber } from "@/lib/locale-format";
import { useGoals, useActivityEvents, useTasks } from "@/hooks/use-nexora";
import {
  useCareEntries,
  useCircles,
  useFocusSessions,
  useFuturePlans,
  useStudyItems,
} from "@/hooks/use-modules";

const AREA_ICONS: Record<Area, LucideIcon> = {
  academic: BookOpen,
  productivity: CheckSquare,
  growth: Flame,
  wellbeing: HeartPulse,
  career: Compass,
  community: Users,
};

const AREA_MODULE_LINKS: Record<Area, string> = {
  academic: "/app/study",
  productivity: "/app/tasks",
  growth: "/app/level-up",
  wellbeing: "/app/quran",
  career: "/app/level-up",
  community: "/app/study",
};

export function InteractiveLifeAreas({
  selectedArea,
  onSelectArea,
}: {
  selectedArea?: Area | null;
  onSelectArea?: (area: Area | null) => void;
}) {
  const { lang, t } = usePrefs();
  const { data: goals = [] } = useGoals();
  const { data: events = [] } = useActivityEvents(100);
  const { data: tasks = [] } = useTasks();
  const { data: studyItems = [] } = useStudyItems();
  const { data: focusSessions = [] } = useFocusSessions();
  const { data: careEntries = [] } = useCareEntries();
  const { data: futurePlans = [] } = useFuturePlans();
  const { data: circles = [] } = useCircles();

  const domainScores = useMemo(() => {
    const completedTasksByArea: Partial<Record<Area, number>> = {};
    for (const tk of tasks) {
      if (tk.status === "done") {
        const area = (tk.area as Area) || "productivity";
        completedTasksByArea[area] = (completedTasksByArea[area] ?? 0) + 1;
      }
    }
    return computeDomainScores({
      goals,
      events,
      completedTasksByArea,
      studyCount: studyItems.length,
      focusSessionsCount: focusSessions.length,
      careCount: careEntries.length,
      futureCount: futurePlans.length,
      circleCount: circles.length,
    });
  }, [goals, events, tasks, studyItems, focusSessions, careEntries, futurePlans, circles]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
            {t("dash.areas")}
          </h2>
          <p className="text-xs text-muted-foreground">{t("dash.areas.sub")}</p>
        </div>

        <div className="flex items-center gap-2">
          <FeatureGuideTrigger featureId="growth-map" iconOnly />
          {selectedArea && (
            <button
              type="button"
              onClick={() => onSelectArea?.(null)}
              className="text-xs font-medium text-primary hover:underline"
            >
              {t("dash.areas.reset")}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {AREAS.map((areaKey) => {
          const config = AREA_CONFIG[areaKey];
          const Icon = AREA_ICONS[areaKey];
          const score = domainScores[areaKey];
          const activeGoals = goals.filter((g) => g.area === areaKey).length;
          const isSelected = selectedArea === areaKey;
          const moduleLink = AREA_MODULE_LINKS[areaKey];

          return (
            <div
              key={areaKey}
              className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-glow"
                  : "border-border bg-surface hover:border-border/80 hover:bg-surface-2"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectArea?.(isSelected ? null : areaKey)}
                aria-pressed={isSelected}
                className="w-full text-start"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex size-9 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: config.accentBg,
                      color: config.accentColor,
                    }}
                  >
                    <Icon className="size-4.5" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold tabular-nums text-foreground">
                      {formatNumber(score, lang)}%
                    </span>
                    <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${score}%`,
                          backgroundColor: config.accentColor,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="font-display text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                    {t(config.labelKey)}
                  </h3>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {t(config.descKey)}
                  </p>
                </div>
              </button>

              <div className="mt-3.5 flex items-center justify-between border-t border-border/60 pt-2 text-[0.7rem] text-muted-foreground">
                <span className="tabular-nums">
                  {formatNumber(activeGoals, lang)} {t("dash.areas.activeGoals")}
                </span>

                <Link
                  to={moduleLink}
                  className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline"
                >
                  <span>{t("dash.areas.openModule")}</span>
                  <ChevronRight className="size-3 rtl-flip" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
