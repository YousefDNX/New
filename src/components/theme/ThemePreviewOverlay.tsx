import { useEffect, useState, type ReactNode } from "react";
import { Check, Eye, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useThemePersistence } from "@/hooks/use-theme-persistence";
import { useOptionalPrefs } from "@/lib/preferences";
import { useTheme } from "@/components/theme/ThemeContext";
import {
  THEME_CATALOG,
  THEME_CATEGORY_LABELS,
  getThemePresetById,
  type ThemeCatalogPreset,
  type ThemeCategory,
} from "@/lib/theme-catalog";
import { cn } from "@/lib/utils";

interface ThemePreviewOverlayProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
}

export function ThemePreviewOverlay({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: ThemePreviewOverlayProps) {
  const prefs = useOptionalPrefs();
  const lang = prefs?.lang ?? "en";
  const { themePresetId, applyThemePreset, themePresets } = useTheme();
  const { applyPreset } = useThemePersistence();

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setIsOpen = setControlledOpen !== undefined ? setControlledOpen : setUncontrolledOpen;

  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory | "all">("all");

  // Selected preset for preview (defaults to active preset or the first preset)
  const [previewPreset, setPreviewPreset] = useState<ThemeCatalogPreset>(() => {
    return (
      (themePresetId ? getThemePresetById(themePresetId) : null) ??
      themePresets[0] ??
      THEME_CATALOG[0]!
    );
  });

  useEffect(() => {
    if (isOpen && themePresetId) {
      const active = getThemePresetById(themePresetId);
      if (active) setPreviewPreset(active);
    }
  }, [isOpen, themePresetId]);

  const isAr = lang === "ar";

  const filteredPresets =
    selectedCategory === "all"
      ? themePresets
      : themePresets.filter((p) => p.category === selectedCategory);

  const handleApply = (preset: ThemeCatalogPreset) => {
    if (prefs) {
      void applyPreset(preset);
    } else {
      applyThemePreset(preset);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="open-theme-preview-overlay-btn"
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <Eye className="size-3.5 text-primary" />
            <span>{isAr ? "معاينة التصاميم (10)" : "Preview 10 Presets"}</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        data-testid="theme-preview-overlay"
        className="max-h-[92vh] max-w-4xl overflow-y-auto border-border bg-background/95 p-5 sm:p-6 backdrop-blur-xl"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Palette className="size-5" />
            <DialogTitle className="font-display text-lg font-bold sm:text-xl">
              {isAr ? "معاينة تصاميم المنصة الـ 10" : "Preview 10 Full-Platform Design Presets"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground sm:text-sm">
            {isAr
              ? "استعرض واختبر جماليات المنصة قبل تطبيقها. انقر على أي ثيم لمعاينته دون تغيير إعداداتك حتى تضغط تطبيق."
              : "Inspect and test visual styles without applying them immediately. Select an aesthetic below to preview."}
          </DialogDescription>
        </DialogHeader>

        {/* Live Interactive Preview Box of Selected Preset */}
        <div className="my-2 rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-lg sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span
                className="size-3.5 rounded-full ring-2 ring-background"
                style={{ backgroundColor: previewPreset.accentHex }}
              />
              <span className="font-display text-sm font-bold text-foreground">
                {isAr ? previewPreset.nameAr : previewPreset.nameEn}
              </span>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {previewPreset.category}
              </span>
              {themePresetId === previewPreset.id && (
                <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  <Check className="size-3" />
                  <span>{isAr ? "المفعل حالياً" : "Current"}</span>
                </span>
              )}
            </div>

            <Button
              type="button"
              size="sm"
              data-testid="apply-previewed-theme-btn"
              onClick={() => handleApply(previewPreset)}
              className="h-8 gap-1.5 bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Check className="size-3.5" />
              <span>{isAr ? "تطبيق هذا الثيم" : "Apply & Save Theme"}</span>
            </Button>
          </div>

          {/* Render sample mini-canvas styled with previewPreset properties */}
          {(() => {
            const isLightPreview = previewPreset.recommendedMode === "light";
            const bgColor = isLightPreview
              ? previewPreset.previewBgLight
              : previewPreset.previewBgDark;
            const surfaceColor = isLightPreview
              ? previewPreset.previewSurfaceLight
              : previewPreset.previewSurfaceDark;
            const headingColor = isLightPreview ? "#0f172a" : "#ffffff";
            const bodyColor = isLightPreview ? "#334155" : "#cbd5e1";
            const mutedColor = isLightPreview ? "#64748b" : "#94a3b8";

            return (
              <div
                className="relative overflow-hidden rounded-xl border p-4 transition-all"
                style={{
                  backgroundColor: bgColor,
                  borderColor: previewPreset.accentHex + "44",
                  fontFamily: previewPreset.fontFamily,
                }}
              >
                <div
                  className="rounded-lg p-3.5 shadow-sm"
                  style={{ backgroundColor: surfaceColor }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div
                      className="flex items-center gap-2 font-bold"
                      style={{ color: headingColor }}
                    >
                      <Sparkles className="size-4" style={{ color: previewPreset.accentHex }} />
                      <span>
                        {isAr ? "لوحة إنجاز الطالب — مظهر تجريبي" : "Student Growth Preview Canvas"}
                      </span>
                    </div>
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: previewPreset.accentHex + "22",
                        color: previewPreset.accentHex,
                      }}
                    >
                      {previewPreset.baseUiTheme}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs" style={{ color: bodyColor }}>
                    {isAr ? previewPreset.descAr : previewPreset.descEn}
                  </p>

                  {/* Sample simulated progress bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px]" style={{ color: mutedColor }}>
                      <span>{isAr ? "التقدم الأسبوعي" : "Weekly Sprints"}</span>
                      <span style={{ color: previewPreset.accentHex }}>78%</span>
                    </div>
                    <div
                      className={cn(
                        "h-2 w-full overflow-hidden rounded-full",
                        isLightPreview ? "bg-slate-900/10" : "bg-black/40",
                      )}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: "78%", backgroundColor: previewPreset.accentHex }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border/70 pb-3">
          {(["all", "minimal", "futuristic", "professional", "colorful", "nature"] as const).map(
            (cat) => {
              const active = selectedCategory === cat;
              const label =
                cat === "all"
                  ? isAr
                    ? "الكل (10)"
                    : "All (10)"
                  : isAr
                    ? THEME_CATEGORY_LABELS[cat].labelAr
                    : THEME_CATEGORY_LABELS[cat].labelEn;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-surface text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              );
            },
          )}
        </div>

        {/* 10 Presets Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 sm:grid-cols-3 md:grid-cols-4">
          {filteredPresets.map((preset) => {
            const isSelected = previewPreset.id === preset.id;
            const isCurrentActive = themePresetId === preset.id;
            const label = isAr ? preset.nameAr : preset.nameEn;

            return (
              <button
                key={preset.id}
                type="button"
                data-testid={`preview-preset-card-${preset.id}`}
                onClick={() => setPreviewPreset(preset)}
                className={cn(
                  "group relative flex flex-col justify-between rounded-xl border p-2.5 text-start transition-all hover:scale-[1.02]",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/40"
                    : "border-border bg-surface-2/60 hover:border-primary/40 hover:bg-surface-2",
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className="size-3 rounded-full shrink-0 ring-1 ring-background"
                      style={{ backgroundColor: preset.accentHex }}
                    />
                    {isCurrentActive && (
                      <span className="rounded bg-primary/20 px-1 py-0.5 text-[9px] font-bold text-primary">
                        {isAr ? "مفعل" : "Active"}
                      </span>
                    )}
                  </div>
                  <h4 className="mt-1.5 truncate text-xs font-semibold text-foreground">{label}</h4>
                  <p className="line-clamp-1 text-[10px] text-muted-foreground">
                    {preset.category}
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
                  <span className="text-muted-foreground group-hover:text-primary flex items-center gap-0.5">
                    <Eye className="size-2.5" />
                    <span>{isAr ? "معاينة" : "Preview"}</span>
                  </span>
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: preset.glowHex || preset.accentHex }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid="cancel-preview-overlay-btn"
            onClick={() => setIsOpen(false)}
            className="h-8 text-xs font-medium"
          >
            {isAr ? "إغلاق" : "Close"}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleApply(previewPreset)}
            className="h-8 gap-1.5 bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Check className="size-3.5" />
            <span>
              {isAr
                ? `تطبيق (${isAr ? previewPreset.nameAr : previewPreset.nameEn})`
                : `Apply (${previewPreset.nameEn})`}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
