import { useState } from "react";
import { Check, LayoutTemplate } from "lucide-react";
import { useThemePersistence } from "@/hooks/use-theme-persistence";
import { usePrefs } from "@/lib/preferences";
import {
  LAYOUT_CATEGORY_LABELS,
  LAYOUT_MODES,
  type LayoutCategory,
  type LayoutModeSpec,
} from "@/lib/theme-catalog";
import { cn } from "@/lib/utils";

type CategoryFilter = LayoutCategory | "all";

function LayoutSchematic({ mode }: { mode: LayoutModeSpec }) {
  const isRight = mode.navPosition === "right";
  const isTop = mode.navPosition === "top";
  const isBottom = mode.navPosition === "bottom";
  const isNone = mode.navPosition === "none";
  const isDual = mode.navPosition === "dual";
  const isCompactRail = mode.sidebarMode === "compact";

  return (
    <div
      className="relative mb-2.5 flex h-20 w-full overflow-hidden rounded-lg border border-border/80 bg-background/80 p-1.5"
      aria-hidden="true"
    >
      {isTop && (
        <div className="flex h-full w-full flex-col gap-1.5">
          <div className="flex h-3 w-full items-center justify-between rounded bg-surface-2 px-1.5">
            <span className="h-1.5 w-6 rounded-full bg-primary/80" />
            <div className="flex gap-1">
              <span className="h-1 w-3 rounded-full bg-muted-foreground/40" />
              <span className="h-1 w-3 rounded-full bg-muted-foreground/40" />
              <span className="h-1 w-3 rounded-full bg-muted-foreground/40" />
            </div>
          </div>
          {mode.id === "double_header" && <div className="h-2 w-full rounded bg-surface-2/80" />}
          <div className="grid flex-1 grid-cols-2 gap-1.5">
            <div className="rounded bg-surface-2/80" />
            <div className="rounded bg-surface-2/80" />
          </div>
        </div>
      )}

      {isBottom && (
        <div className="flex h-full w-full flex-col gap-1.5">
          <div className="grid flex-1 grid-cols-2 gap-1.5">
            <div className="rounded bg-surface-2/80" />
            <div className="rounded bg-surface-2/80" />
          </div>
          <div className="mx-auto flex h-3 w-3/4 items-center justify-around rounded-full bg-surface-2 px-2">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="size-1.5 rounded-full bg-muted-foreground/50" />
            <span className="size-1.5 rounded-full bg-muted-foreground/50" />
            <span className="size-1.5 rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      )}

      {isNone && (
        <div className="flex h-full w-full items-stretch justify-center px-5 py-0.5">
          <div className="flex w-full flex-col gap-1.5 rounded bg-surface-2/75 p-2">
            <span className="h-1.5 w-1/2 rounded-full bg-primary/70" />
            <span className="h-1 w-full rounded-full bg-muted-foreground/30" />
            <span className="h-1 w-5/6 rounded-full bg-muted-foreground/25" />
          </div>
        </div>
      )}

      {(mode.navPosition === "left" || isRight || isDual) && (
        <div
          className={cn(
            "flex h-full w-full gap-1.5",
            isRight && "flex-row-reverse",
            mode.id === "floating" && "p-0.5",
          )}
        >
          <div
            className={cn(
              "flex flex-col gap-1 rounded p-1 bg-surface-2",
              isCompactRail || isDual ? "w-4 items-center" : "w-8",
              mode.id === "floating" && "rounded-lg border border-primary/25",
            )}
          >
            <span className="h-1.5 w-full rounded-sm bg-primary/80" />
            <span className="h-1 w-3/4 rounded-sm bg-muted-foreground/35" />
            <span className="h-1 w-2/3 rounded-sm bg-muted-foreground/30" />
          </div>
          <div
            className={cn(
              "grid flex-1 gap-1.5",
              mode.id === "split_study"
                ? "grid-cols-2"
                : mode.id === "bento"
                  ? "grid-cols-3 grid-rows-2"
                  : "grid-cols-2 grid-rows-2",
            )}
          >
            <div
              className={cn(
                "rounded bg-surface-2/80",
                mode.id === "bento" && "col-span-2",
                mode.id === "split_study" && "row-span-2",
              )}
            />
            <div
              className={cn("rounded bg-surface-2/80", mode.id === "split_study" && "row-span-2")}
            />
            {mode.id !== "split_study" && (
              <>
                <div className="rounded bg-surface-2/65" />
                <div className="rounded bg-surface-2/65" />
              </>
            )}
          </div>
          {isDual && <div className="w-4 rounded bg-surface-2/65" />}
        </div>
      )}
    </div>
  );
}

export function InterfaceLayoutStudio({
  onSelectLayout,
}: {
  onSelectLayout?: (mode: LayoutModeSpec) => void;
}) {
  const { lang, effectiveLayoutMode } = usePrefs();
  const { applyLayoutMode } = useThemePersistence();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const isAr = lang === "ar";

  const filteredModes =
    category === "all" ? LAYOUT_MODES : LAYOUT_MODES.filter((m) => m.category === category);

  function handleSelect(mode: LayoutModeSpec) {
    if (onSelectLayout) {
      onSelectLayout(mode);
      return;
    }
    void applyLayoutMode(mode.id);
  }

  return (
    <div className="space-y-4" data-testid="interface-layout-studio">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="size-4 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isAr
                ? "استوديو تخطيطات الواجهة (10 تصاميم)"
                : "Interface Layout Studio (10 Presets)"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "اختر الترتيب المعماري للتنقل وأعمدة المحتوى — مع الحفاظ التام على مظهرك وألوانك الحالية."
                : "Switch navigation architecture and columns while strictly preserving your active color theme and light/dark mode."}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div
        role="tablist"
        aria-label={isAr ? "تصنيفات التخطيطات" : "Layout categories"}
        className="flex flex-wrap gap-1.5"
      >
        {(Object.keys(LAYOUT_CATEGORY_LABELS) as CategoryFilter[]).map((cat) => {
          const labels = LAYOUT_CATEGORY_LABELS[cat];
          const active = category === cat;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={active}
              data-testid={`layout-cat-${cat}`}
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-surface-2/50 text-muted-foreground hover:text-foreground",
              )}
            >
              {isAr ? labels.labelAr : labels.labelEn}
            </button>
          );
        })}
      </div>

      {/* 10 Structural Layout Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredModes.map((mode) => {
          const active = effectiveLayoutMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              data-testid={`layout-card-${mode.id}`}
              onClick={() => handleSelect(mode)}
              className={cn(
                "group flex flex-col rounded-xl border p-3 text-start transition-all",
                active
                  ? "border-primary bg-primary/10 ring-1 ring-primary/35"
                  : "border-border bg-surface-2/40 hover:border-primary/40",
              )}
            >
              <LayoutSchematic mode={mode} />

              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">
                  {isAr ? mode.nameAr : mode.nameEn}
                </p>
                {active && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    <Check className="size-2.5" />
                    {isAr ? "مفعل" : "Active"}
                  </span>
                )}
              </div>

              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                {isAr ? mode.descAr : mode.descEn}
              </p>

              <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                <span>{LAYOUT_CATEGORY_LABELS[mode.category][isAr ? "labelAr" : "labelEn"]}</span>
                <span>{mode.navPosition}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
