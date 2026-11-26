import { useState } from "react";
import { Check, Rows3, Sliders } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePrefs } from "@/lib/preferences";
import type { DensityPref } from "@/lib/settings";
import {
  CloudSettingsFallbackError,
  OfflineSettingsError,
  useSaveSettings,
} from "@/hooks/use-settings";
import { trackHubEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface DensityOption {
  id: DensityPref;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  navHeight: string;
  spacing: string;
}

const DENSITY_OPTIONS: readonly DensityOption[] = [
  {
    id: "compact",
    nameEn: "Compact",
    nameAr: "مضغوط",
    descEn: "Tighter spacing (2rem nav), high information density",
    descAr: "تباعد مكثف وارتفاع 2rem، لأعلى كثافة عرض",
    navHeight: "2.0rem",
    spacing: "0.75rem",
  },
  {
    id: "comfortable",
    nameEn: "Comfortable",
    nameAr: "مريح",
    descEn: "Standard balanced spacing for optimal study flow",
    descAr: "تنسيق متوازن ومثالي للدراسة اليومية",
    navHeight: "2.25rem",
    spacing: "1.25rem",
  },
  {
    id: "spacious",
    nameEn: "Spacious",
    nameAr: "واسع",
    descEn: "Generous breathing room (2.5rem nav) for relaxed reading",
    descAr: "مساحات تنفس رحبة وارتفاع 2.5rem لقراءة مريحة للعين",
    navHeight: "2.5rem",
    spacing: "1.75rem",
  },
];

export function DensityControlPanel({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const { lang, effectiveAppearance, setAppearance } = usePrefs();
  const saveSettings = useSaveSettings();
  const [open, setOpen] = useState(false);

  const isAr = lang === "ar";
  const currentDensity = effectiveAppearance.density ?? "comfortable";
  const currentOption = DENSITY_OPTIONS.find((d) => d.id === currentDensity) ?? DENSITY_OPTIONS[1]!;

  const handleApplyDensity = (density: DensityPref) => {
    // 1. Immediately update DOM root attribute & dataset
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.setAttribute("data-density", density);
      root.dataset["density"] = density;
    }

    // 2. Update local state
    setAppearance({ density });
    setOpen(false);

    const opt = DENSITY_OPTIONS.find((d) => d.id === density);
    const label = opt ? (isAr ? opt.nameAr : opt.nameEn) : density;

    void trackHubEvent("ui_density_changed", { density, source: "header_control" });

    // 3. Persist to Firestore user_settings
    saveSettings({ density })
      .then(() => {
        toast.success(
          isAr ? `تم تحديث كثافة العرض إلى «${label}»` : `Interface density set to ${label}`,
          { id: "density-update" },
        );
      })
      .catch((err) => {
        if (err instanceof OfflineSettingsError || err instanceof CloudSettingsFallbackError) {
          toast.info(
            isAr ? `تم تطبيق كثافة «${label}» محلياً` : `Density ${label} applied locally`,
            { id: "density-update" },
          );
        } else {
          toast.error(isAr ? "تعذر حفظ الإعداد عبر الإنترنت" : "Failed to save density online");
        }
      });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid="density-control-trigger"
          aria-label={isAr ? "التحكم في كثافة الواجهة" : "Interface Density Control"}
          title={isAr ? `الكثافة: ${currentOption.nameAr}` : `Density: ${currentOption.nameEn}`}
          className={cn(
            "group flex h-8 items-center gap-1.5 rounded-lg border border-border/80 bg-surface-2/80 text-xs font-medium text-foreground transition-all duration-150",
            compact ? "px-1.5" : "px-2 py-1",
            "hover:border-primary/50 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            open && "border-primary/60 bg-surface-2 shadow-xs",
            className,
          )}
        >
          <Rows3 className="size-3.5 text-primary shrink-0" />
          {!compact && (
            <span className="hidden sm:inline max-w-[80px] truncate text-[11px]">
              {isAr ? currentOption.nameAr : currentOption.nameEn}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className="surface-card z-50 w-[22rem] p-3.5 shadow-xl border-border"
      >
        <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-primary" />
            <span className="font-display text-xs font-bold text-foreground">
              {isAr ? "كثافة الواجهة (data-density)" : "Interface Density"}
            </span>
          </div>
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            {currentDensity}
          </span>
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
          {isAr
            ? "يتحكم هذا الخيار في المسافات الداخلية وارتفاع عناصر القوائم ومساحة العمل."
            : "Controls layout padding, navigation row height, and visual spacing globally."}
        </p>

        <div className="mt-3 space-y-1.5">
          {DENSITY_OPTIONS.map((opt) => {
            const isSelected = opt.id === currentDensity;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleApplyDensity(opt.id)}
                className={cn(
                  "flex w-full items-start justify-between rounded-lg p-2 text-start text-xs transition-all",
                  isSelected
                    ? "bg-primary/15 text-foreground font-semibold border border-primary/30 shadow-xs"
                    : "text-foreground hover:bg-surface-2 border border-transparent",
                )}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {isAr ? opt.nameAr : opt.nameEn}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {opt.navHeight}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                    {isAr ? opt.descAr : opt.descEn}
                  </div>
                </div>

                {isSelected ? (
                  <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground mt-0.5">
                    <Check className="size-2.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="size-4 shrink-0 rounded-full border border-border mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Visual Preview Bars */}
        <div className="mt-3 rounded-lg border border-border/80 bg-surface-2/60 p-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            {isAr ? "معاينة التباعد المباشر" : "Live Spacing Preview"}
          </div>
          <div className="flex flex-col gap-1.5">
            <div
              className="h-2 rounded bg-primary/40 transition-all duration-300"
              style={{
                width:
                  currentDensity === "compact"
                    ? "40%"
                    : currentDensity === "comfortable"
                      ? "70%"
                      : "100%",
              }}
            />
            <div
              className="h-2 rounded bg-primary/20 transition-all duration-300"
              style={{
                width:
                  currentDensity === "compact"
                    ? "30%"
                    : currentDensity === "comfortable"
                      ? "60%"
                      : "85%",
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
