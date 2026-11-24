import { Bot, ShieldCheck, Sparkles } from "lucide-react";
import { AiWorkspace } from "@/components/modules/AiWorkspace";
import { usePrefs } from "@/lib/preferences";

export function AlternativeAiWorkspace() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";

  return (
    <div data-testid="btc-alternative-ai" className="space-y-6">
      <header className="border-b border-border/80 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                <Sparkles className="size-3.5" />
                <span>{isAr ? "مساعد BTC السقراطي" : "BTC Socratic Mentor Studio"}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>{isAr ? "توجيه دراسي موثوق" : "Curriculum-Aligned Assistance"}</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {isAr ? "محادثة المعلم الذكي والتحليل" : "BTC AI Learning Mentor"}
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {isAr
                ? "اطرح أسئلتك بالعربية أو الإنجليزية، استعرض المصادر، وحوّل مفاهيمك الصعبة إلى خطوات واضحة."
                : "Ask conceptual questions in Arabic or English, inspect transparent reasoning sources, and generate structured practice exercises."}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Bot className="size-4 text-primary" />
              <span className="font-medium text-foreground">
                {isAr ? "دعم ثنائي اللغة" : "Bilingual EN / AR"}
              </span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-success" />
              <span className="font-medium text-foreground">
                {isAr ? "خصوصية محمية" : "Student-Safe"}
              </span>
            </span>
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-border bg-surface/65 p-3 sm:p-5 shadow-[var(--shadow-card)]">
        <AiWorkspace />
      </div>
    </div>
  );
}
