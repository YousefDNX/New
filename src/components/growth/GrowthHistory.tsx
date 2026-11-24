import { useState, useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Flame,
  Search,
  Sparkles,
  Trophy,
  Zap,
  BookOpen,
  Compass,
  Users,
  ChevronDown,
} from "lucide-react";
import { useActivityEvents, useStats } from "@/hooks/use-nexora";
import { AREA_CONFIG, type Area } from "@/lib/growth";
import { formatNumber, formatRelativeDay } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";
import { normalizeEventType } from "@/lib/xp-rules";
import type { ActivityEventRow } from "@/lib/firestore-data";
import { BRAND } from "@/config/brand";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";

export type TimeRangeFilter = "all" | "today" | "week" | "month" | "quarter";
export type AchievementTypeFilter = "all" | "goals" | "tasks" | "study" | "streak";

export function GrowthHistory() {
  const { data: events = [], isLoading } = useActivityEvents(150);
  const { data: stats } = useStats();
  const { t, lang } = usePrefs();

  const [timeRange, setTimeRange] = useState<TimeRangeFilter>("all");
  const [achievementType, setAchievementType] = useState<AchievementTypeFilter>("all");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isArabic = lang === "ar";

  // Filter events based on active filters
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return events.filter((ev) => {
      // 1. Time range filter
      if (timeRange !== "all") {
        const evDate = new Date(ev.created_at);
        const diffMs = now.getTime() - evDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (timeRange === "today" && ev.created_at.slice(0, 10) !== todayStr) return false;
        if (timeRange === "week" && diffDays > 7) return false;
        if (timeRange === "month" && diffDays > 30) return false;
        if (timeRange === "quarter" && diffDays > 90) return false;
      }

      // 2. Achievement type filter
      if (achievementType !== "all") {
        const canonical = normalizeEventType(ev.event_type);
        const type = canonical.toLowerCase();
        if (achievementType === "goals" && !type.includes("goal") && !type.includes("milestone"))
          return false;
        if (achievementType === "tasks" && !type.includes("task")) return false;
        if (
          achievementType === "study" &&
          !type.includes("study") &&
          !type.includes("note") &&
          !type.includes("mistake") &&
          !type.includes("focus") &&
          !type.includes("quiz") &&
          !type.includes("flashcard") &&
          !type.includes("topic") &&
          !type.includes("reflection")
        )
          return false;
        if (achievementType === "streak" && !type.includes("streak")) return false;
      }

      // 3. Area filter
      if (areaFilter !== "all" && ev.area !== areaFilter) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesType = ev.event_type.toLowerCase().includes(q);
        const matchesArea = ev.area.toLowerCase().includes(q);
        if (!matchesType && !matchesArea) return false;
      }

      return true;
    });
  }, [events, timeRange, achievementType, areaFilter, searchQuery]);

  // Aggregate metrics
  const totalXpInView = useMemo(
    () => filteredEvents.reduce((acc, ev) => acc + (ev.xp || 0), 0),
    [filteredEvents],
  );

  // Group events by day for timeline visualization
  const groupedEvents = useMemo(() => {
    const groups: Record<string, ActivityEventRow[]> = {};
    for (const ev of filteredEvents) {
      const day = ev.created_at.slice(0, 10);
      if (!groups[day]) groups[day] = [];
      groups[day].push(ev);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredEvents]);

  const getEventIcon = (rawType: string, area: string) => {
    const type = normalizeEventType(rawType).toLowerCase();
    if (type.includes("goal") || type.includes("milestone")) return Trophy;
    if (type.includes("task")) return CheckCircle2;
    if (type.includes("focus") || type.includes("study_session")) return Clock;
    if (type.includes("streak")) return Flame;
    if (
      type.includes("study") ||
      type.includes("note") ||
      type.includes("mistake") ||
      type.includes("quiz") ||
      type.includes("flashcard") ||
      type.includes("topic") ||
      type.includes("reflection")
    )
      return BookOpen;
    if (type.includes("career") || area === "career") return Compass;
    if (type.includes("circle") || area === "community") return Users;
    return Zap;
  };

  const getEventTitle = (event: ActivityEventRow): string => {
    const canonical = normalizeEventType(event.event_type || "");
    switch (canonical) {
      case "TASK_COMPLETED":
        return t("act.task_completed");
      case "GOAL_UPDATED":
        return t("act.goal_achieved");
      case "MILESTONE_COMPLETED":
        return isArabic ? "إكمال معلم في خريطة النمو" : "Growth Milestone Achieved";
      case "STUDY_SESSION_COMPLETED":
        return t("act.focus_session_completed");
      case "QUIZ_COMPLETED":
        return isArabic ? "إتمام اختبار تدريبي" : "Practice Quiz Completed";
      case "FLASHCARD_REVIEWED":
        return isArabic ? "مراجعة بطاقة استذكار" : "Flashcard Reviewed";
      case "TOPIC_MASTERED":
        return isArabic ? "إتقان موضوع دراسي" : "Study Topic Mastered";
      case "LEARNING_REFLECTION_CREATED":
        return isArabic ? "تدوين تأمل تعلمي" : "Learning Reflection Saved";
      case "NOTE_CREATED":
        return t("act.note_created");
      case "MISTAKE_REVIEWED":
        return t("act.mistake_reviewed");
      case "CAREER_PATHWAY_EXPLORED":
        return t("act.career_pathway_explored");
      case "KNOWLEDGE_CIRCLE_JOINED":
        return t("act.knowledge_circle_joined");
      default: {
        const lower = (event.event_type || "").toLowerCase();
        if (lower === "streak_maintained") return t("act.streak_maintained");
        return event.event_type.replace(/_/g, " ");
      }
    }
  };

  const exportHistory = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            totalXp: stats?.xp ?? 0,
            level: stats?.level ?? 1,
            events: filteredEvents,
          },
          null,
          2,
        ),
      );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `${BRAND.shortName.toLowerCase()}-growth-history-${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="surface-card flex flex-col gap-6 p-6 rounded-2xl border border-border/70 shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <Trophy className="size-5 text-amber-500" />
            <span>{isArabic ? "سجل النمو والإنجازات" : "Growth History & Milestones"}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isArabic
              ? "استعرض رحلتك الأكاديمية ونقاط الخبرة المكتسبة عبر الزمن"
              : "Timeline of your academic milestones, XP gains, level-ups, and achievements"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FeatureGuideTrigger featureId="growth-history" />
          <button
            type="button"
            onClick={exportHistory}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Download className="size-3.5" />
            <span>{isArabic ? "تصدير السجل" : "Export Report"}</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/60 bg-surface-2/40 p-3 text-center sm:text-left">
          <p className="text-[11px] font-medium text-muted-foreground uppercase">
            {isArabic ? "إجمالي الخبرة المكتسبة" : "Total XP Logged"}
          </p>
          <p className="mt-1 font-display text-xl font-bold text-amber-500">
            +{formatNumber(totalXpInView, lang)} XP
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-surface-2/40 p-3 text-center sm:text-left">
          <p className="text-[11px] font-medium text-muted-foreground uppercase">
            {isArabic ? "الأحداث المسجلة" : "Events in View"}
          </p>
          <p className="mt-1 font-display text-xl font-bold text-foreground">
            {formatNumber(filteredEvents.length, lang)}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-surface-2/40 p-3 text-center sm:text-left">
          <p className="text-[11px] font-medium text-muted-foreground uppercase">
            {isArabic ? "المستوى الحالي" : "Current Level"}
          </p>
          <p className="mt-1 font-display text-xl font-bold text-teal-400">
            {isArabic ? `المستوى ${stats?.level ?? 1}` : `Lvl ${stats?.level ?? 1}`}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-surface-2/40 p-3 text-center sm:text-left">
          <p className="text-[11px] font-medium text-muted-foreground uppercase">
            {isArabic ? "أطول حماسة" : "Longest Streak"}
          </p>
          <p className="mt-1 font-display text-xl font-bold text-orange-400 flex items-center justify-center sm:justify-start gap-1">
            <Flame className="size-4" />
            <span>
              {formatNumber(stats?.longest_streak ?? 0, lang)} {isArabic ? "يوم" : "days"}
            </span>
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
        {/* Time Range Filter Buttons */}
        <div className="flex items-center rounded-lg border border-border/60 bg-surface-2/30 p-1">
          {(
            [
              { id: "all", en: "All Time", ar: "كل الوقت" },
              { id: "today", en: "Today", ar: "اليوم" },
              { id: "week", en: "This Week", ar: "هذا الأسبوع" },
              { id: "month", en: "This Month", ar: "هذا الشهر" },
              { id: "quarter", en: "90 Days", ar: "90 يوم" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTimeRange(t.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                timeRange === t.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isArabic ? t.ar : t.en}
            </button>
          ))}
        </div>

        {/* Achievement Type Filter */}
        <div className="flex items-center rounded-lg border border-border/60 bg-surface-2/30 p-1">
          {(
            [
              { id: "all", en: "All Types", ar: "جميع الأنواع" },
              { id: "goals", en: "Milestones", ar: "الأهداف" },
              { id: "tasks", en: "Tasks", ar: "المهام" },
              { id: "study", en: "Study", ar: "الدراسة" },
              { id: "streak", en: "Streaks", ar: "الحماسة" },
            ] as const
          ).map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAchievementType(a.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                achievementType === a.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isArabic ? a.ar : a.en}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative ms-auto w-full sm:w-48">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? "تصفية بالكلمة..." : "Filter events..."}
            className="w-full rounded-lg border border-border/70 bg-card/60 py-1.5 ps-8 pe-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Timeline View */}
      <div className="relative mt-2">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            <Sparkles className="mx-auto mb-2 size-6 animate-pulse text-primary" />
            <p>{isArabic ? "جاري تحميل سجل النمو..." : "Loading growth history..."}</p>
          </div>
        ) : groupedEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 p-8 text-center text-muted-foreground">
            <Trophy className="mx-auto mb-2 size-8 text-muted-foreground/40" />
            <p className="text-sm font-medium">
              {isArabic
                ? "لم يتم العثور على أنشطة في هذا النطاق"
                : "No milestones found for this range"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isArabic
                ? "أكمل المهام اليومية، جلسات التركيز، أو الأهداف لتسجيل نقاط الخبرة هنا"
                : "Complete daily goals, focus sprints, or study tasks to record growth points"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedEvents.map(([day, dayEvents]) => (
              <div key={day} className="relative">
                {/* Day Header Badge */}
                <div className="sticky top-0 z-10 mb-3 flex items-center gap-2 bg-card/90 py-1 backdrop-blur-xs">
                  <Calendar className="size-3.5 text-primary" />
                  <span className="text-xs font-bold text-foreground font-mono">{day}</span>
                  <span className="text-[11px] text-muted-foreground">
                    ({dayEvents.length} {isArabic ? "أحداث" : "events"})
                  </span>
                  <div className="h-px flex-1 bg-border/60" />
                </div>

                {/* Day Events Stack */}
                <div className="space-y-2.5 ps-3 sm:ps-6 border-s-2 border-primary/20 ms-2">
                  {dayEvents.map((ev) => {
                    const Icon = getEventIcon(ev.event_type, ev.area);
                    const areaConfig = AREA_CONFIG[ev.area as Area] || AREA_CONFIG.academic;
                    const title = getEventTitle(ev);

                    return (
                      <div
                        key={ev.id}
                        className="group relative flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/60 p-3 hover:border-primary/40 hover:bg-card transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg shadow-xs"
                            style={{
                              backgroundColor: areaConfig.accentBg,
                              color: areaConfig.accentColor,
                            }}
                          >
                            <Icon className="size-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {title}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                              <span
                                className="inline-block size-1.5 rounded-full"
                                style={{ backgroundColor: areaConfig.accentColor }}
                              />
                              <span>{t(areaConfig.labelKey)}</span>
                              <span>•</span>
                              <span>{formatRelativeDay(ev.created_at, lang)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5 font-display text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                          <Sparkles className="size-3" />
                          <span>+{formatNumber(ev.xp, lang)} XP</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
