import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Toaster as Sonner } from "sonner";
import { LANG_META, normalizeLang } from "@/lib/i18n/types";
import { useOptionalPrefs } from "@/lib/preferences";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const prefs = useOptionalPrefs();
  const dir = LANG_META[normalizeLang(prefs?.lang ?? "en")]?.dir ?? "ltr";

  return (
    <Sonner
      dir={dir}
      duration={3200}
      className="toaster group"
      icons={{
        success: <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />,
        error: <AlertCircle className="size-4 text-rose-500 shrink-0" />,
        warning: <AlertTriangle className="size-4 text-amber-500 shrink-0" />,
        info: <Info className="size-4 text-teal-500 shrink-0" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group toast flex w-full max-w-sm items-start gap-3 rounded-xl border border-emerald-500/30 bg-surface/95 px-3.5 py-3 text-foreground shadow-[0_12px_36px_-12px_rgba(16,185,129,0.3)] backdrop-blur-xl transition-all",
          title: "text-sm font-semibold text-foreground leading-snug",
          description: "text-xs text-muted-foreground mt-0.5 leading-relaxed",
          actionButton:
            "rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shrink-0",
          cancelButton:
            "rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0",
          success: "border-emerald-500/40 bg-surface/95",
          error: "border-rose-500/40 bg-surface/95",
          warning: "border-amber-500/40 bg-surface/95",
          info: "border-teal-500/35 bg-surface/95",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
