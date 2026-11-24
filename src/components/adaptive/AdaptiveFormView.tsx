import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExperienceMode } from "@/lib/experience-mode";
import type { ExperienceParadigm } from "@/lib/ui-experiences";

export interface AdaptiveFormStep {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  canProceed?: boolean;
}

interface AdaptiveFormViewProps {
  steps: AdaptiveFormStep[];
  onSubmit: (e: FormEvent) => void;
  onCancel?: () => void;
  submitLabel: string;
  cancelLabel?: string;
  nextLabel?: string;
  backLabel?: string;
  stepPrefix?: string;
  busy?: boolean;
  submitDisabled?: boolean;
  forcedParadigm?: ExperienceParadigm;
}

/**
 * Component-Level Structural Form Variant:
 * - Mode A (editorial): Structured vertical section form
 * - Mode B (command): Compact 2-column workspace split form
 * - Mode C (spatial): Interactive multi-step wizard preserving state across mode switches
 */
export function AdaptiveFormView({
  steps,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel = "Cancel",
  nextLabel = "Next",
  backLabel = "Back",
  stepPrefix = "Step",
  busy = false,
  submitDisabled = false,
  forcedParadigm,
}: AdaptiveFormViewProps) {
  const { paradigm: activeParadigm } = useExperienceMode();
  const paradigm = forcedParadigm ?? activeParadigm;
  const [stepIdx, setStepIdx] = useState(0);

  const safeIdx = Math.min(stepIdx, Math.max(0, steps.length - 1));
  const activeStep = steps[safeIdx];
  const isLastStep = safeIdx >= steps.length - 1;

  /* =========================================================================
   * MODE C (Spatial): Multi-Step Interactive Form Wizard
   * ========================================================================= */
  if (paradigm === "spatial" && steps.length > 1 && activeStep) {
    const canNext = activeStep.canProceed !== false;
    return (
      <form
        data-testid="adaptive-form-wizard"
        onSubmit={(e) => {
          if (!isLastStep) {
            e.preventDefault();
            if (canNext) setStepIdx((i) => Math.min(steps.length - 1, i + 1));
            return;
          }
          onSubmit(e);
        }}
        className="space-y-4 pt-2"
      >
        {/* Wizard Progress Bar */}
        <div className="space-y-2 border-b border-border pb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-primary">
              {stepPrefix} {safeIdx + 1} / {steps.length}
            </span>
            <span>{activeStep.title}</span>
          </div>
          <div className="flex gap-1.5">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (idx <= safeIdx || canNext) setStepIdx(idx);
                }}
                aria-label={`${stepPrefix} ${idx + 1}: ${s.title}`}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  idx <= safeIdx ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {activeStep.description && (
            <p className="text-xs text-muted-foreground">{activeStep.description}</p>
          )}
          {activeStep.content}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          <div>
            {safeIdx > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
                className="gap-1.5"
              >
                <ArrowLeft className="size-3.5 rtl-flip" />
                <span>{backLabel}</span>
              </Button>
            ) : (
              onCancel && (
                <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                  {cancelLabel}
                </Button>
              )
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isLastStep ? (
              <Button
                key="wizard-next-btn"
                type="button"
                variant="default"
                size="sm"
                disabled={!canNext}
                onClick={(e) => {
                  e.preventDefault();
                  setStepIdx((i) => Math.min(steps.length - 1, i + 1));
                }}
                className="gap-1.5"
              >
                <span>{nextLabel}</span>
                <ArrowRight className="size-3.5 rtl-flip" />
              </Button>
            ) : (
              <Button
                key="wizard-submit-btn"
                type="submit"
                variant="glow"
                size="sm"
                disabled={busy || submitDisabled}
              >
                {submitLabel}
              </Button>
            )}
          </div>
        </div>
      </form>
    );
  }

  /* =========================================================================
   * MODE B (Command Center): Compact 2-Column Workspace Form
   * ========================================================================= */
  if (paradigm === "command" && steps.length > 1) {
    return (
      <form data-testid="adaptive-form-split" onSubmit={onSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {steps.map((s) => (
            <div
              key={s.id}
              className="space-y-3 rounded-lg border border-border bg-surface-2/40 p-3"
            >
              <div className="border-b border-border/70 pb-1.5 text-xs font-semibold text-foreground">
                {s.title}
              </div>
              {s.content}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" variant="glow" size="sm" disabled={busy || submitDisabled}>
            {submitLabel}
          </Button>
        </div>
      </form>
    );
  }

  /* =========================================================================
   * MODE A (Editorial / Classic): Vertical Stacked Form
   * ========================================================================= */
  return (
    <form data-testid="adaptive-form-vertical" onSubmit={onSubmit} className="space-y-4 pt-2">
      {steps.map((s) => (
        <div key={s.id} className="space-y-3">
          {s.content}
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" variant="glow" size="sm" disabled={busy || submitDisabled}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
