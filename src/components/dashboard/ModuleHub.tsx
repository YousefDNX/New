import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Map, PanelRightOpen, Search } from "lucide-react";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import {
  CANONICAL_MODULES,
  GROWTH_MAP_ORCHESTRATOR,
  MODULE_CATEGORIES,
  type ModuleCategoryKey,
} from "@/config/modules-catalog";
import { useExperienceMode } from "@/lib/experience-mode";
import { usePrefs } from "@/lib/preferences";

export function ModuleHub() {
  const { lang } = usePrefs();
  const { mode, openSpatialDrawer, closeSpatialDrawer } = useExperienceMode();
  const [selectedCategory, setSelectedCategory] = useState<ModuleCategoryKey | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const isAr = lang === "ar";

  const filteredModules = useMemo(() => {
    let list = CANONICAL_MODULES;
    if (selectedCategory !== "all") {
      list = list.filter((m) => m.category === selectedCategory);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((m) => {
        const text = [
          m.number,
          m.name.toLowerCase(),
          m.nameAr,
          m.description.toLowerCase(),
          m.descriptionAr,
          m.badge.toLowerCase(),
          ...m.capabilities.map((c) => c.toLowerCase()),
        ].join(" ");
        return text.includes(q);
      });
    }
    return list;
  }, [selectedCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: CANONICAL_MODULES.length };
    for (const cat of MODULE_CATEGORIES) {
      counts[cat.id] = CANONICAL_MODULES.filter((m) => m.category === cat.id).length;
    }
    return counts;
  }, []);

  return (
    <div className="surface-card p-5 md:p-6" id="module-hub">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">
            {isAr ? "الوحدات الأساسية (٢٠ وحدة)" : "All Study & Growth Modules"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "المنظومة التعليمية الشاملة المقسمة إلى 6 مجالات مع خارطة النمو المركزية"
              : "20 learning, productivity, STEM, and personal growth workspaces connected by your Growth Map."}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <FeatureGuideTrigger featureId="dashboard-overview" iconOnly />
        </div>
      </div>

      {/* Central Growth Map Strip */}
      <div className="mt-4 flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Map className="size-4.5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-display text-sm font-bold text-foreground">
                {isAr ? GROWTH_MAP_ORCHESTRATOR.titleAr : GROWTH_MAP_ORCHESTRATOR.title}
              </span>
              <span className="text-xs text-muted-foreground" aria-hidden="true">
                ·
              </span>
              <span className="text-xs font-medium text-primary">
                {isAr ? "التوجيه المركزي" : "Unified Learning Map"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isAr ? GROWTH_MAP_ORCHESTRATOR.subtitleAr : GROWTH_MAP_ORCHESTRATOR.subtitle} —{" "}
              {isAr
                ? "يربط جميع الوحدات العشرين بدورة نقاط الخبرة (XP) والإنتاجية الأسبوعية."
                : "Connects all 20 modules into weekly focus goals and steady progress."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
          <FeatureGuideTrigger featureId={GROWTH_MAP_ORCHESTRATOR.guideId} iconOnly />
          <Link
            to="/app"
            search={{ tab: "legacy" }}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-surface-2 px-3 text-xs font-medium text-foreground transition hover:border-primary/50 hover:text-primary"
          >
            <span>{isAr ? "الأثر والمكتبة المفتوحة" : "Community Impact"}</span>
            <ArrowUpRight className="size-3.5 rtl-flip" />
          </Link>
          <Link
            to={GROWTH_MAP_ORCHESTRATOR.to}
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <span>{isAr ? "استكشف خارطة النمو" : "View Growth Map"}</span>
            <ArrowUpRight className="size-3.5 rtl-flip" />
          </Link>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isAr
                ? "ابحث في الوحدات العشرين (الاسم، الرقم، المهارات)..."
                : "Search modules by name, number, or topic..."
            }
            className="h-9 w-full rounded-lg border border-border bg-surface-2/60 ps-9 pe-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Category Filter Bar */}
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-surface-2/60 p-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === "all"
                ? "bg-surface text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isAr ? "الكل" : "All"} ({categoryCounts["all"]})
          </button>
          {MODULE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] ?? 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition ${
                  isSelected
                    ? "bg-surface text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isAr ? cat.labelAr : cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 20 Canonical Modules — Structural Variant by Mode */}
      {mode === "focus_deck" ? (
        <div
          data-testid="spatial-modules-carousel"
          className="mt-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3"
        >
          {filteredModules.map((m) => (
            <div
              key={m.id}
              className="group flex min-w-[275px] max-w-[300px] shrink-0 snap-start flex-col justify-between rounded-xl border border-border/80 bg-surface-2/40 p-4 transition-colors hover:border-primary/45 hover:bg-surface-2/75"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${m.color}1a`, color: m.color }}
                    >
                      <m.icon className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-sm font-semibold text-foreground">
                        <span className="font-mono text-xs text-primary/80 tabular-nums">
                          {m.number}
                        </span>{" "}
                        {isAr ? m.nameAr : m.name}
                      </h3>
                      <p className="truncate text-[11px] text-muted-foreground">{m.badge}</p>
                    </div>
                  </div>
                  <FeatureGuideTrigger featureId={m.guideId} iconOnly />
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {isAr ? m.descriptionAr : m.description}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-2.5">
                <button
                  type="button"
                  onClick={() =>
                    openSpatialDrawer({
                      title: isAr ? m.nameAr : m.name,
                      meta: `${m.number} · ${m.badge}`,
                      subtitle: isAr ? m.descriptionAr : m.description,
                      body: (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground">
                              {isAr ? "القدرات الأساسية" : "Core Capabilities"}
                            </p>
                            <ul className="space-y-1.5 text-sm text-foreground">
                              {m.capabilities.map((cap) => (
                                <li
                                  key={cap}
                                  className="rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs"
                                >
                                  {cap}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <Link
                            to={m.to}
                            onClick={closeSpatialDrawer}
                            className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                          >
                            <span>{isAr ? "فتح الوحدة الآن" : "Launch Module"}</span>
                            <ArrowUpRight className="size-4 rtl-flip" />
                          </Link>
                        </div>
                      ),
                    })
                  }
                  className="inline-flex min-h-[34px] items-center gap-1 rounded-md border border-border bg-surface px-2.5 text-xs font-medium text-foreground hover:border-primary/45 hover:text-primary"
                >
                  <PanelRightOpen className="size-3.5 text-primary" />
                  <span>{isAr ? "معاينة" : "Inspect"}</span>
                </button>
                <Link
                  to={m.to}
                  className="inline-flex min-h-[34px] items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <span>{isAr ? "فتح" : "Open"}</span>
                  <ArrowUpRight className="size-3.5 rtl-flip" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          data-testid={mode === "command_os" ? "command-modules-panel" : "standard-modules-grid"}
          className={
            mode === "command_os"
              ? "mt-4 grid max-h-[420px] grid-cols-1 gap-3 overflow-y-auto pe-1 sm:grid-cols-2 lg:grid-cols-4"
              : "mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          }
        >
          {filteredModules.map((m) => (
            <div
              key={m.id}
              className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-surface-2/35 p-4 transition-colors hover:border-primary/40 hover:bg-surface-2/70"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${m.color}1a`,
                        color: m.color,
                      }}
                    >
                      <m.icon className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                        <span className="font-mono text-xs text-primary/80 tabular-nums">
                          {m.number}
                        </span>{" "}
                        {isAr ? m.nameAr : m.name}
                      </h3>
                      <p className="truncate text-[11px] text-muted-foreground">{m.badge}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <FeatureGuideTrigger featureId={m.guideId} iconOnly />
                  </div>
                </div>

                <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {isAr ? m.descriptionAr : m.description}
                </p>

                <p className="mt-2.5 truncate text-[11px] text-muted-foreground/85">
                  {m.capabilities.slice(0, 2).join(" · ")}
                </p>
              </div>

              <div className="mt-3 border-t border-border/50 pt-2.5">
                <Link
                  to={m.to}
                  className="flex min-h-[34px] items-center justify-between text-xs font-semibold text-primary/90 transition-colors group-hover:text-primary"
                >
                  <span>{isAr ? "فتح الوحدة" : "Open Workspace"}</span>
                  <ArrowUpRight className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl-flip" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredModules.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
          {isAr
            ? "لم يتم العثور على وحدات مطابقة للبحث."
            : "No modules match the current filter or search query."}
        </div>
      )}
    </div>
  );
}
