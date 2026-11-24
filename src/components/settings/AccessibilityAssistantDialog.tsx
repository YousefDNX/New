import { useMemo, useState } from "react";
import { Accessibility, CheckCircle2, Eye, Headphones, Sparkles, Type } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePrefs } from "@/lib/preferences";
import {
  CloudSettingsFallbackError,
  OfflineSettingsError,
  useSaveSettings,
} from "@/hooks/use-settings";
import {
  buildAccessibilityRecommendation,
  type AccessibilityBarrier,
} from "@/lib/accessibility-assistant";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import type { DictKey } from "@/lib/i18n-dict";

const BARRIER_OPTIONS: {
  id: AccessibilityBarrier;
  titleKey: DictKey;
  descKey: DictKey;
  icon: typeof Type;
}[] = [
  {
    id: "reading_density",
    titleKey: "a11y.assistant.opt.reading.t",
    descKey: "a11y.assistant.opt.reading.d",
    icon: Type,
  },
  {
    id: "eye_strain",
    titleKey: "a11y.assistant.opt.strain.t",
    descKey: "a11y.assistant.opt.strain.d",
    icon: Eye,
  },
  {
    id: "focus_distraction",
    titleKey: "a11y.assistant.opt.focus.t",
    descKey: "a11y.assistant.opt.focus.d",
    icon: Sparkles,
  },
  {
    id: "auditory_preference",
    titleKey: "a11y.assistant.opt.audio.t",
    descKey: "a11y.assistant.opt.audio.d",
    icon: Headphones,
  },
];

export function AccessibilityAssistantDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AccessibilityBarrier[]>([]);
  const [saving, setSaving] = useState(false);

  const { t, setA11y, setAppearance, setTypography } = usePrefs();
  const saveSettings = useSaveSettings();

  const toggleBarrier = (id: AccessibilityBarrier) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const recommendation = useMemo(
    () => buildAccessibilityRecommendation(selected, (k) => t(k as DictKey)),
    [selected, t],
  );

  const handleApply = async () => {
    if (recommendation.appliedLabels.length === 0) {
      toast.error(t("a11y.assistant.pickOne"));
      return;
    }

    setSaving(true);
    try {
      const c = recommendation.changes;
      setA11y({
        ...(c.dyslexia !== undefined ? { dyslexia: c.dyslexia } : {}),
        ...(c.contrast !== undefined ? { contrast: c.contrast } : {}),
        ...(c.reduceMotion !== undefined ? { reduceMotion: c.reduceMotion } : {}),
        ...(c.simplified !== undefined ? { simplified: c.simplified } : {}),
        ...(c.clearLanguage !== undefined ? { clearLanguage: c.clearLanguage } : {}),
        ...(c.readAloud !== undefined ? { readAloud: c.readAloud } : {}),
        ...(c.fontScale !== undefined ? { fontScale: c.fontScale } : {}),
      });
      if (c.readingLayout) {
        setAppearance({ readingLayout: c.readingLayout });
      }
      if (c.lineHeight || c.letterSpacing) {
        setTypography({
          ...(c.lineHeight ? { lineHeight: c.lineHeight } : {}),
          ...(c.letterSpacing ? { letterSpacing: c.letterSpacing } : {}),
        });
      }

      await saveSettings({
        ...(c.dyslexia !== undefined ? { dyslexia_font: c.dyslexia } : {}),
        ...(c.contrast !== undefined ? { high_contrast: c.contrast } : {}),
        ...(c.reduceMotion !== undefined ? { reduced_motion: c.reduceMotion } : {}),
        ...(c.simplified !== undefined ? { simplified_ui: c.simplified } : {}),
        ...(c.clearLanguage !== undefined ? { clear_language: c.clearLanguage } : {}),
        ...(c.readAloud !== undefined ? { read_aloud: c.readAloud } : {}),
        ...(c.fontScale !== undefined ? { font_scale: c.fontScale } : {}),
        ...(c.readingLayout ? { reading_layout: c.readingLayout } : {}),
        ...(c.lineHeight ? { line_height: c.lineHeight } : {}),
        ...(c.letterSpacing ? { letter_spacing: c.letterSpacing } : {}),
      });

      toast.success(t("a11y.assistant.applied"), {
        description: recommendation.summary,
      });
      setOpen(false);
    } catch (err) {
      if (err instanceof OfflineSettingsError || err instanceof CloudSettingsFallbackError) {
        toast.info(t("set.savedLocalFallback"), {
          description: recommendation.summary,
          id: "set-saved",
        });
        setOpen(false);
      } else {
        toast.error(err instanceof Error ? err.message : t("a11y.assistant.saveError"));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs">
            <Accessibility className="size-3.5 text-primary" />
            <span>{t("a11y.assistant.btn")}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-surface border-border">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pe-6">
            <DialogTitle className="flex items-center gap-2 font-display text-foreground">
              <Accessibility className="size-5 text-primary" />
              {t("a11y.assistant.title")}
            </DialogTitle>
            <FeatureGuideTrigger featureId="accessibility-assistant" iconOnly />
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("a11y.assistant.desc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          {BARRIER_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = selected.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleBarrier(opt.id)}
                className={`w-full text-start rounded-xl border p-3.5 transition-all flex items-start gap-3 ${
                  active
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border bg-surface-2 hover:border-primary/40"
                }`}
              >
                <div
                  className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-muted-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>{t(opt.titleKey)}</span>
                    {active && <CheckCircle2 className="size-3.5 text-primary shrink-0" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {t(opt.descKey)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {recommendation.appliedLabels.length > 0 && (
          <div className="p-3 rounded-xl bg-surface-2 border border-border text-xs space-y-1.5">
            <div className="font-semibold text-foreground">{t("a11y.assistant.recommended")}</div>
            <ul className="space-y-1 text-muted-foreground">
              {recommendation.appliedLabels.map((lbl) => (
                <li key={lbl} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                  <span>{lbl}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            {t("a11y.assistant.cancel")}
          </Button>
          <Button
            type="button"
            variant="glow"
            size="sm"
            onClick={handleApply}
            disabled={saving || recommendation.appliedLabels.length === 0}
            className="gap-1.5"
          >
            <Sparkles className="size-3.5" />
            <span>{saving ? t("a11y.assistant.applying") : t("a11y.assistant.apply")}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
