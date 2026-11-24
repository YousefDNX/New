import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  BookOpen,
  Compass,
  HelpCircle,
  Info,
  ListChecks,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FEATURE_GUIDE_UI_STRINGS, getFeatureGuide } from "@/lib/feature-guides";
import { LANG_META, normalizeLang } from "@/lib/i18n/types";
import { useOptionalPrefs } from "@/lib/preferences";
import { cn } from "@/lib/utils";

interface FeatureGuideContextType {
  activeFeatureId: string | null;
  openGuide: (featureId: string) => void;
  closeGuide: () => void;
}

const FeatureGuideContext = createContext<FeatureGuideContextType | null>(null);

export function FeatureGuideDialog({
  featureId,
  onClose,
}: {
  featureId: string;
  onClose: () => void;
}) {
  const prefs = useOptionalPrefs();
  const lang = normalizeLang(prefs?.lang ?? "en");
  const dir = LANG_META[lang]?.dir ?? "ltr";
  const ui = FEATURE_GUIDE_UI_STRINGS[lang] ?? FEATURE_GUIDE_UI_STRINGS.en;
  const guide = getFeatureGuide(featureId, lang);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feature-guide-title"
      data-testid={`feature-guide-modal-${featureId}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        dir={dir}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-xl max-h-[90dvh] flex-col overflow-hidden rounded-2xl border border-emerald-500/35 bg-surface/95 text-foreground shadow-[0_0_52px_-12px_rgba(16,185,129,0.38)] backdrop-blur-xl animate-in zoom-in-95 duration-150"
      >
        {/* Aurora Header Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-emerald-500/15 via-teal-400/8 to-transparent"
        />

        {/* Fixed Header */}
        <div className="relative flex items-start justify-between gap-3 border-b border-emerald-500/20 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/35 bg-emerald-500/15 text-emerald-500 shadow-xs">
              <BookOpen className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="size-3 shrink-0" />
                <span>{guide.category}</span>
              </div>
              <h2
                id="feature-guide-title"
                className="font-display text-base sm:text-lg font-bold leading-snug text-foreground"
              >
                {guide.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={ui.closeAria}
            data-testid="feature-guide-close-x"
            className="shrink-0 rounded-lg border border-transparent p-1.5 text-muted-foreground transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="relative flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6 text-xs sm:text-sm">
          {/* What it does */}
          <section className="rounded-xl border border-emerald-500/20 bg-surface-2/55 p-3.5 space-y-1.5">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Info className="size-3.5 shrink-0" />
              <span>{ui.whatItDoesHeading}</span>
            </h3>
            <p className="leading-relaxed text-foreground/90">{guide.whatItDoes}</p>
          </section>

          {/* Why & Who Benefits grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            <section className="rounded-xl border border-border/70 bg-card/70 p-3.5 space-y-1.5">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Compass className="size-3.5 shrink-0" />
                <span>{ui.whyAndProblemHeading}</span>
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{guide.whyAndProblem}</p>
            </section>

            <section className="rounded-xl border border-border/70 bg-card/70 p-3.5 space-y-1.5">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Users className="size-3.5 shrink-0" />
                <span>{ui.whoBenefitsHeading}</span>
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{guide.whoBenefits}</p>
            </section>
          </div>

          {/* Step-by-Step */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <ListChecks className="size-3.5 shrink-0" />
              <span>{ui.stepsHeading}</span>
            </h3>
            <ol className="space-y-2">
              {guide.steps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-surface-2/65 p-3"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-emerald-500/35 bg-emerald-500/15 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed text-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Key Options */}
          {guide.options.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {ui.optionsHeading}
              </h3>
              <div className="grid gap-2">
                {guide.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/70 bg-card/80 px-3.5 py-2.5"
                  >
                    <span className="font-semibold text-foreground">{opt.label}: </span>
                    <span className="text-muted-foreground">{opt.desc}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Notes & Limitations */}
          {guide.limitations && (
            <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300 mb-1">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{ui.limitationsHeading}</span>
              </div>
              <p className="leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                {guide.limitations}
              </p>
            </section>
          )}
        </div>

        {/* Footer CTA */}
        <div className="relative flex items-center justify-end border-t border-emerald-500/20 bg-surface-2/40 px-5 py-3 sm:px-6">
          <Button
            type="button"
            onClick={onClose}
            data-testid="feature-guide-confirm-close"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 shadow-sm"
          >
            {ui.confirmCta}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FeatureGuideProvider({ children }: { children: ReactNode }) {
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);

  const openGuide = useCallback((id: string) => setActiveFeatureId(id), []);
  const closeGuide = useCallback(() => setActiveFeatureId(null), []);

  return (
    <FeatureGuideContext.Provider value={{ activeFeatureId, openGuide, closeGuide }}>
      {children}
      {activeFeatureId && <FeatureGuideDialog featureId={activeFeatureId} onClose={closeGuide} />}
    </FeatureGuideContext.Provider>
  );
}

export function useFeatureGuideModal() {
  const ctx = useContext(FeatureGuideContext);
  if (!ctx) {
    return {
      activeFeatureId: null,
      openGuide: () => {},
      closeGuide: () => {},
    };
  }
  return ctx;
}

export function FeatureGuideTrigger({
  featureId,
  className,
  iconOnly = false,
}: {
  featureId: string;
  className?: string;
  iconOnly?: boolean;
}) {
  const ctx = useContext(FeatureGuideContext);
  const [localOpen, setLocalOpen] = useState(false);
  const prefs = useOptionalPrefs();
  const lang = normalizeLang(prefs?.lang ?? "en");
  const ui = FEATURE_GUIDE_UI_STRINGS[lang] ?? FEATURE_GUIDE_UI_STRINGS.en;

  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (ctx) {
      ctx.openGuide(featureId);
    } else {
      setLocalOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`${ui.triggerAria}: ${featureId}`}
        title={ui.triggerAria}
        data-testid={`feature-guide-trigger-${featureId}`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-surface-2/80 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shrink-0",
          iconOnly && "px-2 py-1",
          className,
        )}
      >
        <HelpCircle className="size-3.5 text-emerald-500 shrink-0" />
        {!iconOnly && <span>{ui.triggerLabel}</span>}
      </button>
      {!ctx && localOpen && (
        <FeatureGuideDialog featureId={featureId} onClose={() => setLocalOpen(false)} />
      )}
    </>
  );
}
