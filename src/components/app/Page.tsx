import type { ReactNode } from "react";
import { Hammer } from "lucide-react";
import { usePrefs } from "@/lib/preferences";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string | undefined;
  actions?: ReactNode;
}) {
  const { effectiveUiExperience } = usePrefs();

  if (effectiveUiExperience === "editorial_atelier") {
    return (
      <header
        data-ux-page-header="editorial_atelier"
        className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5"
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          <h1 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
    );
  }

  if (effectiveUiExperience === "command_os") {
    return (
      <header
        data-ux-page-header="command_os"
        className="surface-card mb-6 flex flex-wrap items-center justify-between gap-4 px-5 py-4"
      >
        <div className="min-w-0 flex-1 space-y-0.5">
          <h1 className="text-balance font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
            {title}
          </h1>
          {subtitle && (
            <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground md:text-sm">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
    );
  }

  if (effectiveUiExperience === "focus_deck") {
    return (
      <header
        data-ux-page-header="focus_deck"
        className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/80 bg-surface/90 px-6 py-5"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="text-balance font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
    );
  }

  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-4">
      <div className="min-w-0 flex-1 space-y-1">
        <h1 className="text-balance font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function EmptyState({ icon, text }: { icon?: ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-border bg-surface-2/35 px-5 py-8 text-center text-sm text-muted-foreground">
      {icon}
      <span>{text}</span>
    </div>
  );
}

/** Honest status page for modules not yet built — no fake controls. */
export function UpcomingModule({
  title,
  subtitle,
  features,
}: {
  title: string;
  subtitle?: string | undefined;
  features: string[];
}) {
  const { t } = usePrefs();
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="surface-card max-w-2xl p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Hammer className="size-5" />
          </span>
          <div>
            <div className="font-display font-semibold">{t("soon.title")}</div>
            <div className="text-sm text-muted-foreground">{t("soon.body")}</div>
          </div>
        </div>
        <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
          {features.map((f) => (
            <li key={f} className="rounded-lg bg-surface-2 px-3 py-2 text-muted-foreground">
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
