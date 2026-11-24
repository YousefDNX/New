import { useState } from "react";
import { Check, Layers, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useExperienceMode } from "@/lib/experience-mode";
import { usePrefs } from "@/lib/preferences";
import {
  THEME_UX_PRESETS,
  UI_EXPERIENCES,
  type ThemeUxPreset,
  type UiExperienceId,
  type UiExperienceSpec,
} from "@/lib/ui-experiences";
import { cn } from "@/lib/utils";

function ExperienceWireframe({ exp, isDark }: { exp: UiExperienceSpec; isDark: boolean }) {
  const bg = isDark ? exp.previewBgDark : exp.previewBgLight;
  const surface = isDark ? exp.previewSurfaceDark : exp.previewSurfaceLight;
  const accent = exp.previewAccentHex;
  const mutedLine = isDark ? "rgba(255,255,255,0.22)" : "rgba(15,23,42,0.18)";
  const subtleLine = isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)";

  return (
    <div
      className="relative mb-3 flex h-28 w-full overflow-hidden rounded-lg border border-border/80 p-2"
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      {exp.id === "classic" && (
        <div className="flex h-full w-full gap-1.5">
          <div
            className="flex w-10 flex-col gap-1.5 rounded p-1.5"
            style={{ backgroundColor: surface }}
          >
            <span className="h-2 w-full rounded-sm" style={{ backgroundColor: accent }} />
            <span className="h-1.5 w-4/5 rounded-sm" style={{ backgroundColor: mutedLine }} />
            <span className="h-1.5 w-3/4 rounded-sm" style={{ backgroundColor: subtleLine }} />
            <span className="h-1.5 w-4/5 rounded-sm" style={{ backgroundColor: subtleLine }} />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <div
              className="flex h-3.5 items-center justify-between rounded px-2"
              style={{ backgroundColor: surface }}
            >
              <span className="h-1.5 w-14 rounded-sm" style={{ backgroundColor: mutedLine }} />
              <span className="size-2 rounded-full" style={{ backgroundColor: accent }} />
            </div>
            <div className="h-6 rounded" style={{ backgroundColor: surface }} />
            <div className="grid flex-1 grid-cols-2 gap-1.5">
              <div className="rounded" style={{ backgroundColor: surface }} />
              <div className="rounded" style={{ backgroundColor: surface }} />
            </div>
          </div>
        </div>
      )}

      {exp.id === "editorial_atelier" && (
        <div className="flex h-full w-full flex-col gap-1.5">
          {/* Editorial Top Masthead + Rule */}
          <div
            className="flex h-5 items-center justify-between border-b px-2"
            style={{ backgroundColor: surface, borderColor: subtleLine }}
          >
            <span className="h-2 w-12 rounded-none" style={{ backgroundColor: accent }} />
            <div className="flex gap-1.5">
              <span className="h-1.5 w-6" style={{ backgroundColor: mutedLine }} />
              <span className="h-1.5 w-6" style={{ backgroundColor: mutedLine }} />
              <span className="h-1.5 w-6" style={{ backgroundColor: mutedLine }} />
            </div>
          </div>
          {/* Two-Column Briefing & Semantic Table */}
          <div className="grid flex-1 grid-cols-12 gap-2 px-1">
            <div
              className="col-span-7 flex flex-col gap-1.5 border p-1.5"
              style={{ backgroundColor: surface, borderColor: subtleLine }}
            >
              <span className="h-2 w-2/3" style={{ backgroundColor: accent }} />
              <span className="h-1 w-full" style={{ backgroundColor: mutedLine }} />
              <span className="h-1 w-5/6" style={{ backgroundColor: subtleLine }} />
              <div className="mt-auto h-5 border-t pt-1" style={{ borderColor: subtleLine }} />
            </div>
            <div
              className="col-span-5 flex flex-col gap-1.5 border p-1.5"
              style={{ backgroundColor: surface, borderColor: subtleLine }}
            >
              <span className="h-1.5 w-3/4" style={{ backgroundColor: mutedLine }} />
              <span className="h-4 w-full" style={{ backgroundColor: subtleLine }} />
              <span className="mt-auto h-4 w-full" style={{ backgroundColor: subtleLine }} />
            </div>
          </div>
        </div>
      )}

      {exp.id === "command_os" && (
        <div className="flex h-full w-full gap-1.5">
          {/* Collapsible Left Workspace Rail */}
          <div
            className="flex w-7 flex-col items-center gap-1 rounded border p-1"
            style={{ backgroundColor: surface, borderColor: subtleLine }}
          >
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: accent }} />
            <span className="h-1 w-full rounded" style={{ backgroundColor: mutedLine }} />
            <span className="h-1 w-full rounded" style={{ backgroundColor: subtleLine }} />
            <span className="h-1 w-full rounded" style={{ backgroundColor: subtleLine }} />
          </div>
          {/* Top Breadcrumb + ⌘K + Bento Kanban Stage */}
          <div className="flex flex-1 flex-col gap-1.5">
            <div
              className="flex h-3.5 items-center justify-between rounded px-2"
              style={{ backgroundColor: surface }}
            >
              <span className="h-1.5 w-10 rounded" style={{ backgroundColor: mutedLine }} />
              <span className="h-2 w-14 rounded" style={{ backgroundColor: accent }} />
              <span className="size-1.5 rounded-full" style={{ backgroundColor: accent }} />
            </div>
            <div className="grid flex-1 grid-cols-3 gap-1.5">
              <div className="rounded p-1" style={{ backgroundColor: surface }}>
                <span className="block h-1.5 w-2/3 rounded" style={{ backgroundColor: accent }} />
              </div>
              <div className="rounded p-1" style={{ backgroundColor: surface }}>
                <span
                  className="block h-1.5 w-2/3 rounded"
                  style={{ backgroundColor: mutedLine }}
                />
              </div>
              <div className="rounded p-1" style={{ backgroundColor: surface }}>
                <span
                  className="block h-1.5 w-2/3 rounded"
                  style={{ backgroundColor: mutedLine }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {exp.id === "focus_deck" && (
        <div className="flex h-full w-full flex-col gap-1.5">
          {/* Top Compass Ribbon */}
          <div
            className="flex h-3.5 items-center justify-between rounded-md px-2"
            style={{ backgroundColor: surface }}
          >
            <span className="h-1.5 w-10 rounded" style={{ backgroundColor: accent }} />
            <span className="h-1.5 w-8 rounded" style={{ backgroundColor: mutedLine }} />
          </div>
          {/* Master-Detail Split + Floating Bottom Dock */}
          <div className="grid flex-1 grid-cols-12 gap-1.5">
            <div
              className="col-span-5 flex flex-col gap-1 rounded-lg p-1"
              style={{ backgroundColor: surface }}
            >
              <span className="h-2 w-full rounded" style={{ backgroundColor: accent }} />
              <span className="h-1.5 w-4/5 rounded" style={{ backgroundColor: subtleLine }} />
              <span className="h-1.5 w-4/5 rounded" style={{ backgroundColor: subtleLine }} />
            </div>
            <div className="col-span-7 rounded-lg p-1.5" style={{ backgroundColor: surface }}>
              <span className="block h-2 w-1/2 rounded" style={{ backgroundColor: accent }} />
              <span
                className="mt-1 block h-1.5 w-5/6 rounded"
                style={{ backgroundColor: mutedLine }}
              />
              <span
                className="mt-1 block h-1.5 w-2/3 rounded"
                style={{ backgroundColor: subtleLine }}
              />
            </div>
          </div>
          <div
            className="mx-auto flex h-3.5 w-3/5 items-center justify-around rounded-full border px-2"
            style={{ backgroundColor: surface, borderColor: accent }}
          >
            <span className="size-2 rounded-full" style={{ backgroundColor: accent }} />
            <span className="size-1.5 rounded-full" style={{ backgroundColor: mutedLine }} />
            <span className="size-1.5 rounded-full" style={{ backgroundColor: mutedLine }} />
            <span className="size-1.5 rounded-full" style={{ backgroundColor: mutedLine }} />
          </div>
        </div>
      )}
    </div>
  );
}

export function UiExperienceSwitcher({
  onSelectExperience,
  onApplyPreset,
}: {
  onSelectExperience?: (id: UiExperienceId) => void;
  onApplyPreset?: (preset: ThemeUxPreset) => void;
}) {
  const {
    lang,
    t,
    uiExperience,
    effectiveUiExperience,
    effectiveResolvedTheme,
    isPreviewing,
    previewDraft,
    setUiExperience,
    startPreview,
  } = usePrefs();
  const { activeUxPresetId, applyThemeUxPreset } = useExperienceMode();
  const [archOpen, setArchOpen] = useState(false);
  const isAr = lang === "ar";
  const isDark = effectiveResolvedTheme === "dark";

  function handleApply(exp: UiExperienceSpec) {
    if (onSelectExperience) {
      onSelectExperience(exp.id);
    } else {
      setUiExperience(exp.id);
    }
    toast.success(
      isAr
        ? `تم تفعيل تجربة الواجهة الكاملة: ${exp.nameAr}`
        : `Activated full UI & UX architecture: ${exp.nameEn}`,
      { id: "ux-experience-applied", duration: 2200 },
    );
  }

  function handleApplyPreset(preset: ThemeUxPreset) {
    if (onApplyPreset) {
      onApplyPreset(preset);
    } else {
      applyThemeUxPreset(preset);
    }
    toast.success(
      isAr
        ? `تم تطبيق النمط الشامل: ${preset.nameAr}`
        : `Applied Theme + UX Preset: ${preset.nameEn}`,
      { id: "ux-preset-applied", duration: 2200 },
    );
  }

  return (
    <div id="row-ux-experience" data-testid="ux-experience-switcher" className="scroll-mt-24 py-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-foreground">
            {isAr
              ? "معمارية وتجربة المستخدم الكاملة (Classic + 3 أنماط بنيوية جديدة)"
              : "Multi-Layout UI & UX Architecture (Classic + 3 Structural Paradigms)"}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {isAr
              ? "تبديل النمط يغيّر بنية الصفحة، طريقة التنقل، عرض الجداول/كانبان/المعاينة، والنماذج بالكامل مع حفظ بياناتك فوراً."
              : "Switching paradigms swaps the actual DOM shell, navigation model, data views (Table / Kanban / Master-Detail), and forms (Vertical / Split / Wizard) without losing state."}
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          data-testid="open-architecture-spec"
          onClick={() => setArchOpen(true)}
          className="min-h-[36px] gap-1.5 text-xs"
        >
          <Layers className="size-3.5 text-primary" />
          <span>{isAr ? "وثيقة المعمارية" : "Architecture & Spec"}</span>
        </Button>
      </div>

      {/* 4 Architectural Experiences */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        {UI_EXPERIENCES.map((exp) => {
          const isApplied = uiExperience === exp.id && !isPreviewing;
          const isPreviewed = isPreviewing && previewDraft?.uiExperience === exp.id;
          const isCurrent = effectiveUiExperience === exp.id;

          return (
            <div
              key={exp.id}
              data-testid={`ux-experience-card-${exp.id}`}
              className={cn(
                "flex flex-col justify-between rounded-xl border p-4 transition-all",
                isCurrent
                  ? "border-primary bg-primary/6 ring-1 ring-primary/35"
                  : "border-border bg-surface-2/40 hover:border-primary/40",
              )}
            >
              <div>
                <ExperienceWireframe exp={exp} isDark={isDark} />

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-primary">
                      <span>{exp.paradigmCode}</span>
                      <span aria-hidden="true" className="text-muted-foreground">
                        ·
                      </span>
                      <span className="text-muted-foreground">
                        {isAr ? exp.navModelAr : exp.navModelEn}
                      </span>
                    </div>
                    <h3 className="mt-0.5 font-display text-base font-bold text-foreground">
                      {isAr ? exp.nameAr : exp.nameEn}
                    </h3>
                  </div>

                  {isApplied && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
                      <Check className="size-3.5" />
                      <span>{t("set.theme.applied")}</span>
                    </span>
                  )}
                  {isPreviewed && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-xp">
                      <Sparkles className="size-3.5" />
                      <span>{t("set.preview.badge")}</span>
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {isAr ? exp.descAr : exp.descEn}
                </p>

                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-border/60 pt-2.5 text-[11px]">
                  <div>
                    <dt className="text-muted-foreground">
                      {isAr ? "تجربة الرئيسية:" : "Home UX:"}
                    </dt>
                    <dd className="font-semibold text-foreground">
                      {isAr ? exp.dashboardModelAr : exp.dashboardModelEn}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">
                      {isAr ? "عرض البيانات:" : "Data View:"}
                    </dt>
                    <dd className="font-semibold text-foreground">
                      {isAr ? exp.dataViewAr : exp.dataViewEn}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{isAr ? "النماذج:" : "Forms UX:"}</dt>
                    <dd className="font-semibold text-foreground">
                      {isAr ? exp.formViewAr : exp.formViewEn}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">
                      {isAr ? "الأسلوب البصري:" : "Visual Style:"}
                    </dt>
                    <dd className="font-semibold text-foreground">
                      {isAr ? exp.surfaceModelAr : exp.surfaceModelEn}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-3.5 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  data-testid={`preview-ux-${exp.id}`}
                  onClick={() =>
                    startPreview({
                      uiExperience: exp.id,
                      layoutMode: exp.pairedLayoutMode,
                    })
                  }
                  className="min-h-[40px] flex-1 text-xs"
                >
                  {t("set.preview.btn")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={isApplied ? "secondary" : "default"}
                  data-testid={`apply-ux-${exp.id}`}
                  onClick={() => handleApply(exp)}
                  className="min-h-[40px] flex-1 text-xs"
                >
                  {isApplied ? t("set.theme.applied") : isAr ? "تفعيل الواجهة" : "Use Experience"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Curated Theme + UX Presets */}
      <div className="mt-6 border-t border-border/70 pt-5" data-testid="theme-ux-presets">
        <div className="mb-3">
          <p className="text-sm font-bold text-foreground">
            {isAr
              ? "حزم التصميم الشاملة (تجمع الهيكل + الألوان + الخطوط)"
              : "Curated Theme + UX Presets (Architecture + Palette + Typography)"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isAr
              ? "حزم جاهزة تطبق البنية الهيكلية والسمة البصرية المتناسقة معها بنقرة واحدة."
              : "One click pairs a structural UI paradigm (Mode A / B / C) with its tuned color palette, surfaces, and density."}
          </p>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {THEME_UX_PRESETS.map((preset) => {
            const active = activeUxPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                data-testid={`theme-ux-preset-${preset.id}`}
                onClick={() => handleApplyPreset(preset)}
                className={cn(
                  "flex flex-col justify-between rounded-xl border p-3 text-start transition-all",
                  active
                    ? "border-primary bg-primary/8 ring-1 ring-primary/35"
                    : "border-border bg-surface-2/40 hover:border-primary/45",
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-primary">{preset.paradigmCode}</span>
                  <div className="flex items-center gap-1" aria-hidden="true">
                    <span
                      className="size-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: preset.swatchBg }}
                    />
                    <span
                      className="size-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: preset.swatchSurface }}
                    />
                    <span
                      className="size-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: preset.swatchAccent }}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-xs font-bold text-foreground">
                      {isAr ? preset.nameAr : preset.nameEn}
                    </span>
                    {active && <Check className="size-3.5 shrink-0 text-primary" />}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    {isAr ? preset.subtitleAr : preset.subtitleEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Design System & Architecture Dialog */}
      <Dialog open={archOpen} onOpenChange={setArchOpen}>
        <DialogContent className="surface-card max-w-2xl max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {isAr ? "معمارية التصميم متعدد الأنماط" : "Multi-Layout & Design System Architecture"}
            </DialogTitle>
            <DialogDescription>
              {isAr
                ? "فصل منطق الأعمال عن طبقة العرض عبر Context عالمي ومكونات بنيوية متكيفة."
                : "Decoupled presentation engine powered by useExperienceMode() and structural component variants."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs">
            <div className="rounded-lg border border-border bg-surface-2/60 p-3">
              <p className="font-bold text-foreground">Stack & State Layer</p>
              <p className="mt-1 text-muted-foreground">
                TanStack Router/Start + React 19 + Tailwind CSS v4 + TanStack Query + Firebase
                Firestore. Global architecture context lives in{" "}
                <code className="font-mono text-primary">useExperienceMode()</code> backed by{" "}
                <code className="font-mono text-primary">localStorage</code> persistence.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-start text-xs">
                <thead>
                  <tr className="border-b border-border text-[11px] text-muted-foreground">
                    <th className="py-2 pe-2 text-start font-semibold">Layer</th>
                    <th className="py-2 px-2 text-start font-semibold">Mode A · Editorial</th>
                    <th className="py-2 px-2 text-start font-semibold">Mode B · Command</th>
                    <th className="py-2 ps-2 text-start font-semibold">Mode C · Spatial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  <tr>
                    <td className="py-2 pe-2 font-semibold">Shell Chrome</td>
                    <td className="py-2 px-2">Top Masthead + Vertical Scroll</td>
                    <td className="py-2 px-2">100vh Locked + Collapsible Rail + ⌘K</td>
                    <td className="py-2 ps-2">Floating Glass Dock + Radial Quick Ring</td>
                  </tr>
                  <tr>
                    <td className="py-2 pe-2 font-semibold">Dashboard Grid</td>
                    <td className="py-2 px-2">2-Column Briefing Flow</td>
                    <td className="py-2 px-2">12-Col Bento Box + Internal Scroll</td>
                    <td className="py-2 ps-2">Swipeable Carousels + Slide-Over Drawer</td>
                  </tr>
                  <tr>
                    <td className="py-2 pe-2 font-semibold">Data Lists</td>
                    <td className="py-2 px-2">Semantic HTML Table</td>
                    <td className="py-2 px-2">3-Lane Kanban Action Board</td>
                    <td className="py-2 ps-2">Master-Detail Split View</td>
                  </tr>
                  <tr>
                    <td className="py-2 pe-2 font-semibold">Forms UX</td>
                    <td className="py-2 px-2">Vertical Stacked Sections</td>
                    <td className="py-2 px-2">2-Column Split Workspace</td>
                    <td className="py-2 ps-2">Multi-Step Interactive Wizard</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
