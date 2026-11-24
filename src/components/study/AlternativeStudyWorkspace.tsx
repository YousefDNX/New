import { BookOpen, BrainCircuit, CheckCircle2, Layers } from "lucide-react";
import { StudyWorkspace } from "@/components/modules/StudyWorkspace";
import { usePrefs } from "@/lib/preferences";

export function AlternativeStudyWorkspace() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";

  return (
    <div data-testid="btc-alternative-study" className="space-y-6">
      <header className="rounded-2xl border border-border bg-surface p-6 sm:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="font-semibold text-primary">
                {isAr ? "بيئة المذاكرة المركّزة" : "Atelier Study Studio"}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {isAr ? "استرجاع نشط · ملاحظات · اختبارات" : "Active Recall · Notes · Assessments"}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {isAr ? "مركز الدراسة والمراجعة العميقة" : "Academic Study & Mastery Lab"}
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {isAr
                ? "ادمج بين الملاحظات المنظمة، البطاقات الذكية بالتكرار المتباعد، ومفردات الوحدة الثالثة للصف التاسع في واجهة هادئة عالية التباين."
                : "Organize structured course notes, spaced-repetition flashcards, Grade 9 Unit 3 vocabulary, and diagnostic mistake logs in one calm layout."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-border/60 pt-4 md:border-s md:border-t-0 md:ps-6 md:pt-0">
            <div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <BookOpen className="size-3.5 text-primary" />
                <span>{isAr ? "الوحدة ٣" : "Unit 3"}</span>
              </div>
              <p className="mt-0.5 font-mono text-sm font-bold text-foreground tabular-nums">
                24 {isAr ? "كلمة" : "words"}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Layers className="size-3.5 text-xp" />
                <span>{isAr ? "بطاقات" : "Decks"}</span>
              </div>
              <p className="mt-0.5 font-mono text-sm font-bold text-foreground">SRS</p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <BrainCircuit className="size-3.5 text-success" />
                <span>{isAr ? "اختبار" : "Practice"}</span>
              </div>
              <p className="mt-0.5 flex items-center gap-1 font-mono text-sm font-bold text-success">
                <CheckCircle2 className="size-3.5" />
                <span>{isAr ? "جاهز" : "Ready"}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-border/70 bg-surface/50 p-3 sm:p-5">
        <StudyWorkspace />
      </div>
    </div>
  );
}
