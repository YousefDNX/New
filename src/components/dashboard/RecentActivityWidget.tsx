import { Zap, CheckSquare, Clock, BookOpen, Flame, Compass, Users } from "lucide-react";
import { useActivityEvents } from "@/hooks/use-nexora";
import { AREA_CONFIG, type Area } from "@/lib/growth";
import type { DictKey } from "@/lib/i18n-dict";
import { formatNumber, formatRelativeDay } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";

export function RecentActivityWidget() {
  const { data: events = [] } = useActivityEvents();
  const { t, lang } = usePrefs();

  const getEventIcon = (type: string, area: string) => {
    if (type.includes("task")) return CheckSquare;
    if (type.includes("focus")) return Clock;
    if (type.includes("streak")) return Flame;
    if (type.includes("note") || type.includes("study") || type.includes("mistake"))
      return BookOpen;
    if (area === "career") return Compass;
    if (area === "community") return Users;
    return Zap;
  };

  const getEventTitle = (event: { event_type?: string }): string => {
    const type = event.event_type || "";
    const map: Record<string, DictKey> = {
      task_completed: "act.task_completed",
      focus_session_completed: "act.focus_session_completed",
      streak_maintained: "act.streak_maintained",
      goal_achieved: "act.goal_achieved",
      mistake_reviewed: "act.mistake_reviewed",
      note_created: "act.note_created",
      career_pathway_explored: "act.career_pathway_explored",
      knowledge_circle_joined: "act.knowledge_circle_joined",
    };
    return t(map[type] ?? "act.default");
  };

  return (
    <div className="surface-card flex h-full flex-col p-5">
      <div className="border-b border-border/80 pb-4">
        <h2 className="font-display text-base font-bold text-foreground">
          {t("dash.activity.title")}
        </h2>
        <p className="text-xs text-muted-foreground">{t("dash.activity.sub")}</p>
      </div>

      <div className="mt-3 max-h-80 flex-1 space-y-3 overflow-y-auto pe-1">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Zap className="mb-2 size-8 opacity-40" />
            <p className="text-sm font-medium">{t("dash.activity.empty")}</p>
          </div>
        ) : (
          events.map((event) => {
            const Icon = getEventIcon(event.event_type, event.area);
            const areaConfig = AREA_CONFIG[event.area as Area] || AREA_CONFIG.academic;
            const title = getEventTitle(event);

            return (
              <div
                key={event.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-surface-2/60 p-2.5 transition-colors hover:bg-surface-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: areaConfig.accentBg,
                      color: areaConfig.accentColor,
                    }}
                  >
                    <Icon className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">{title}</p>
                    <div className="flex items-center gap-2 text-[0.68rem] text-muted-foreground">
                      <span>{t(areaConfig.labelKey)}</span>
                      <span>•</span>
                      <span>{formatRelativeDay(event.created_at, lang)}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 font-display text-xs font-bold text-xp">
                  +{formatNumber(event.xp, lang)} {t("common.xp")}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
