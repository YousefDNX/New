import { useState, type ReactNode } from "react";
import { Check, Eye, LayoutGrid, Moon, Palette, Sparkles, Sun, X } from "lucide-react";
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
import type { DictKey } from "@/lib/i18n-dict";
import { usePrefs } from "@/lib/preferences";
import {
  LAYOUT_MODES,
  THEME_CATALOG,
  THEME_CATEGORY_LABELS,
  type LayoutMode,
  type ThemeCatalogPreset,
  type ThemeCategory,
} from "@/lib/theme-catalog";
import type { BgStylePref, CornerPref, DensityPref } from "@/lib/settings";
import { cn } from "@/lib/utils";

const CATEGORY_KEY: Record<ThemeCategory | "all", DictKey> = {
  all: "studio.cat.all",
  minimal: "studio.cat.minimal",
  futuristic: "studio.cat.futuristic",
  professional: "studio.cat.professional",
  colorful: "studio.cat.colorful",
  nature: "studio.cat.nature",
};

export function ThemeStudioDialog({ trigger }: { trigger?: ReactNode }) {
  const {
    t,
    lang,
    theme,
    effectiveResolvedTheme,
    effectiveAppearance,
    effectiveThemePresetId,
    effectiveLayoutMode,
    startPreview,
    cancelPreview,
    isPreviewing,
  } = usePrefs();
  const { applyPreset, applyLayoutMode, applyColorMode, applyAppearancePatch } =
    useThemePersistence();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ThemeCategory | "all">("all");
  const isAr = lang === "ar";

  const visibleThemes =
    category === "all" ? THEME_CATALOG : THEME_CATALOG.filter((item) => item.category === category);

  const handleApplyPreset = (preset: ThemeCatalogPreset) => {
    void applyPreset(preset);
  };

  const handlePreviewPreset = (preset: ThemeCatalogPreset) => {
    startPreview({
      theme: preset.recommendedMode,
      themePresetId: preset.id,
      layoutMode: preset.layoutMode,
      appearance: {
        uiTheme: preset.baseUiTheme,
        accent: "custom",
        customAccentHex: preset.accentHex,
        cardStyle: preset.cardStyle,
        borderStyle: preset.borderStyle,
        shadowLevel: preset.shadowLevel,
        cornerStyle: preset.cornerStyle,
        bgStyle: preset.bgStyle,
        fontFamily: preset.fontFamily,
      },
    });
  };

  const handleLayoutChange = (mode: LayoutMode) => {
    void applyLayoutMode(mode);
  };

  const handleModeChange = (nextMode: "dark" | "light") => {
    void applyColorMode(nextMode);
  };

  const handleSurfaceChange = (
    patch: Parameters<typeof applyAppearancePatch>[0],
    dbPatch: Parameters<typeof applyAppearancePatch>[1],
  ) => {
    void applyAppearancePatch(patch, dbPatch);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next && isPreviewing) {
          cancelPreview();
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="glow" size="sm" className="gap-1.5">
            <Palette className="size-3.5" />
            <span>{t("studio.openBtn")}</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[90dvh] flex flex-col overflow-hidden">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 pe-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                <Sparkles className="size-3.5" />
                <span>{t("set.studioBannerTitle")}</span>
              </div>
              <DialogTitle className="font-display text-xl font-bold mt-1">
                {t("studio.title")}
              </DialogTitle>
              <DialogDescription className="text-xs">{t("studio.desc")}</DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              {isPreviewing && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={cancelPreview}
                  className="h-8 gap-1 text-xs border-xp/50 text-xp"
                >
                  <X className="size-3.5" />
                  <span>{t("set.preview.cancel")}</span>
                </Button>
              )}
              <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1">
                <button
                  type="button"
                  onClick={() => handleModeChange("dark")}
                  className={cn(
                    "flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
                    effectiveResolvedTheme === "dark"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Moon className="size-3" />
                  <span>{t("studio.mode.dark")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("light")}
                  className={cn(
                    "flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
                    effectiveResolvedTheme === "light"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Sun className="size-3" />
                  <span>{t("studio.mode.light")}</span>
                </button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pe-1 py-2">
          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 pb-3">
            {(Object.keys(THEME_CATEGORY_LABELS) as Array<ThemeCategory | "all">).map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-surface-2 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(CATEGORY_KEY[cat])}
                </button>
              );
            })}
          </div>

          {/* 10 Full-Platform Design Presets Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {visibleThemes.map((preset) => {
              const isApplied = effectiveThemePresetId === preset.id && !isPreviewing;
              const isDarkPreview =
                theme === "light"
                  ? false
                  : theme === "dark"
                    ? true
                    : preset.recommendedMode === "dark";
              const bg = isDarkPreview ? preset.previewBgDark : preset.previewBgLight;
              const surface = isDarkPreview
                ? preset.previewSurfaceDark
                : preset.previewSurfaceLight;

              return (
                <div
                  key={preset.id}
                  data-testid={`studio-theme-${preset.id}`}
                  className={cn(
                    "flex flex-col justify-between rounded-xl border p-3 transition-all",
                    effectiveThemePresetId === preset.id
                      ? "border-primary bg-primary/8 ring-1 ring-primary/40"
                      : "border-border bg-surface-2/40 hover:border-primary/40",
                  )}
                >
                  <div>
                    {/* Mini swatch preview */}
                    <div
                      className="mb-2.5 flex h-16 overflow-hidden rounded-lg border border-border/40 p-1.5"
                      style={{ backgroundColor: bg }}
                      aria-hidden="true"
                    >
                      <div
                        className="me-1.5 flex w-7 flex-col gap-1 rounded p-1"
                        style={{ backgroundColor: surface }}
                      >
                        <span
                          className="h-1.5 w-full rounded-sm"
                          style={{ backgroundColor: preset.accentHex }}
                        />
                        <span className="h-1 w-3/4 rounded-sm bg-current opacity-25" />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <div
                          className="flex items-center justify-between rounded px-1.5 py-0.5"
                          style={{ backgroundColor: surface }}
                        >
                          <span className="h-1 w-8 rounded-full bg-current opacity-30" />
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: preset.glowHex }}
                          />
                        </div>
                        <div className="grid flex-1 grid-cols-2 gap-1">
                          <div className="rounded" style={{ backgroundColor: surface }} />
                          <div className="rounded" style={{ backgroundColor: surface }} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <span className="font-display text-xs font-bold text-foreground truncate">
                        {isAr ? preset.nameAr : preset.nameEn}
                      </span>
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: preset.accentHex }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                      {isAr ? preset.descAr : preset.descEn}
                    </p>
                    <p className="mt-1.5 font-mono text-[10px] tracking-tight text-primary/90 truncate">
                      {isAr ? preset.designIdentityAr : preset.designIdentityEn}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 flex-1 text-[11px] px-2"
                      onClick={() => handlePreviewPreset(preset)}
                    >
                      <Eye className="size-3 me-1" />
                      {t("studio.previewBtn")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={isApplied ? "secondary" : "glow"}
                      className="h-7 flex-1 text-[11px] px-2"
                      onClick={() => handleApplyPreset(preset)}
                    >
                      {isApplied ? (
                        <>
                          <Check className="size-3 me-1" />
                          {t("studio.activeBtn")}
                        </>
                      ) : (
                        t("studio.applyBtn")
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 10 Structural Interface Layouts */}
          <div className="space-y-3 border-t border-border/60 pt-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <LayoutGrid className="size-4 text-primary" />
                <h3 className="font-display text-sm font-bold text-foreground">
                  {t("studio.layoutsSectionTitle")} ({LAYOUT_MODES.length})
                </h3>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {isAr ? "تغييرات هيكلية فورية ومستقلة عن الألوان" : "Structural shell modes"}
              </span>
            </div>
            <div className="grid max-h-64 gap-2.5 overflow-y-auto pe-1 sm:grid-cols-2 lg:grid-cols-4">
              {LAYOUT_MODES.map((mode) => {
                const active = effectiveLayoutMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    data-testid={`layout-mode-${mode.id}`}
                    onClick={() => handleLayoutChange(mode.id)}
                    className={cn(
                      "rounded-xl border p-3 text-start transition-all",
                      active
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                        : "border-border bg-surface-2/40 hover:border-primary/40",
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-display text-xs font-bold text-foreground truncate">
                        {isAr ? mode.nameAr : mode.nameEn}
                      </span>
                      {active && <Check className="size-3.5 text-primary shrink-0" />}
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-snug line-clamp-2">
                      {isAr ? mode.descAr : mode.descEn}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fine Surface Controls */}
          <div className="grid gap-3 border-t border-border/60 pt-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface-2/40 p-3 space-y-2">
              <div className="text-xs font-bold text-foreground">{t("set.corner")}</div>
              <div className="flex gap-1.5">
                {(["sharp", "rounded", "soft"] as CornerPref[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSurfaceChange({ cornerStyle: c }, { corner_style: c })}
                    className={cn(
                      "flex-1 rounded-md px-2 py-1 text-xs font-medium",
                      effectiveAppearance.cornerStyle === c
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t(`set.corner.${c}` as DictKey)}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-2/40 p-3 space-y-2">
              <div className="text-xs font-bold text-foreground">{t("set.density")}</div>
              <div className="flex gap-1.5">
                {(["compact", "comfortable", "spacious"] as DensityPref[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleSurfaceChange({ density: d }, { density: d })}
                    className={cn(
                      "flex-1 rounded-md px-2 py-1 text-xs font-medium",
                      effectiveAppearance.density === d
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t(`set.density.${d}` as DictKey)}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-2/40 p-3 space-y-2">
              <div className="text-xs font-bold text-foreground">{t("set.bgStyle")}</div>
              <div className="flex gap-1.5">
                {(["ambient", "solid", "grid"] as BgStylePref[]).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => handleSurfaceChange({ bgStyle: b }, { bg_style: b })}
                    className={cn(
                      "flex-1 rounded-md px-2 py-1 text-xs font-medium",
                      effectiveAppearance.bgStyle === b
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t(`set.bgStyle.${b}` as DictKey)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground">
            {t("nav.uiTheme")}: {effectiveAppearance.uiTheme} · {effectiveThemePresetId ?? "custom"}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
