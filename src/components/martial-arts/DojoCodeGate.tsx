import { useState } from "react";
import { CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CODE_COMPREHENSION_CHECKS, MARTIAL_ARTIST_CODE_PRINCIPLES } from "@/data/martial-arts";

export interface DojoCodeGateProps {
  isAr: boolean;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  onAcknowledge: () => void;
}

export function DojoCodeGate({
  isAr,
  acknowledged,
  acknowledgedAt,
  onAcknowledge,
}: DojoCodeGateProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const allChecksAnsweredCorrectly = CODE_COMPREHENSION_CHECKS.every(
    (chk) => answers[chk.id] === chk.correctIndex,
  );

  return (
    <section className="space-y-5" data-testid="dojo-code-section">
      {/* Code Header & Honest Scope Notice */}
      <div className="surface-card space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">
              {isAr
                ? "ميثاق فنان القتال الخلوق (١٢ مبدأ)"
                : "The Good Martial Artist Code (12 Principles)"}
            </h2>
          </div>
          {acknowledged && (
            <span
              data-testid="dojo-code-acknowledged-badge"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
            >
              <CheckCircle2 className="size-3.5" />
              {isAr ? "تم الاطلاع والإقرار" : "Code Acknowledged"}
              {acknowledgedAt ? ` (${acknowledgedAt.slice(0, 10)})` : ""}
            </span>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-border bg-surface-2 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            {isAr
              ? "إقرار هذا الميثاق يؤكد قراءتك وفهمك لمبادئ الاحترام والسلامة وعدم العدوانية داخل الدوجو، ولا يشكّل ضماناً أو شهادة للسلوك المستقبلي."
              : "Acknowledging this Code affirms that you have read and understood its principles of respect, safety, and non-aggression inside the Dojo; it does not claim or guarantee future behavior."}
          </p>
        </div>
      </div>

      {/* 12 Principles Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="dojo-code-principles">
        {MARTIAL_ARTIST_CODE_PRINCIPLES.map((p) => (
          <div key={p.id} className="surface-card space-y-2 p-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/15 font-display text-xs font-bold text-primary tabular-nums">
                {p.number}
              </span>
              <h3 className="font-display text-sm font-bold text-foreground">
                {isAr ? p.title.ar : p.title.en}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {isAr ? p.description.ar : p.description.en}
            </p>
            <div className="rounded-md border border-border/60 bg-surface-2 px-2.5 py-1.5 text-[11px] text-foreground">
              <strong>{isAr ? "تطبيق يومي:" : "Daily Practice:"}</strong>{" "}
              {isAr ? p.dailyPractice.ar : p.dailyPractice.en}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Comprehension Check + Acknowledgment Action */}
      <div className="surface-card space-y-4 p-5" data-testid="dojo-code-check">
        <h3 className="font-display text-sm font-bold text-foreground">
          {isAr ? "تحقّق سريع من الفهم قبل الإقرار" : "Quick Understanding Check"}
        </h3>
        <div className="space-y-4">
          {CODE_COMPREHENSION_CHECKS.map((chk) => {
            const picked = answers[chk.id];
            return (
              <div key={chk.id} className="space-y-2">
                <p className="text-xs font-semibold text-foreground">
                  {isAr ? chk.prompt.ar : chk.prompt.en}
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {chk.options.map((opt, idx) => {
                    const selected = picked === idx;
                    const isRight = idx === chk.correctIndex;
                    return (
                      <button
                        key={opt.en}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [chk.id]: idx }))}
                        data-testid={`code-check-${chk.id}-opt-${idx}`}
                        className={`min-h-[44px] rounded-lg border px-3 py-2 text-start text-xs transition-colors ${
                          selected
                            ? isRight
                              ? "border-emerald-500 bg-emerald-500/15 font-semibold text-foreground"
                              : "border-destructive bg-destructive/10 text-foreground"
                            : "border-border bg-surface-2 text-foreground hover:border-primary/40"
                        }`}
                      >
                        {isAr ? opt.ar : opt.en}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
          <p className="text-xs text-muted-foreground">
            {allChecksAnsweredCorrectly
              ? isAr
                ? "تم اجتياز أسئلة الفهم بنجاح — يمكنك الآن إقرار الميثاق."
                : "Understanding check complete — you may acknowledge the Code."
              : isAr
                ? "أجب عن سؤالي الفهم أعلاه لتفعيل زر الإقرار."
                : "Select the principle-aligned answers above to enable acknowledgment."}
          </p>
          <Button
            type="button"
            variant="glow"
            disabled={!allChecksAnsweredCorrectly && !acknowledged}
            onClick={onAcknowledge}
            data-testid="dojo-acknowledge-btn"
            className="min-h-[44px]"
          >
            <CheckCircle2 className="size-4 me-1.5" />
            {acknowledged
              ? isAr
                ? "تم إقرار الميثاق"
                : "Code Acknowledged"
              : isAr
                ? "أقرّ بقراءة وفهم الميثاق"
                : "Acknowledge the Good Martial Artist Code"}
          </Button>
        </div>
      </div>
    </section>
  );
}
