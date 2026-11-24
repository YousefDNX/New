import { CalendarClock, CheckSquare, Timer } from "lucide-react";
import { ProductivityWorkspace, type ProdTab } from "@/components/modules/ProductivityWorkspace";
import { useTasks } from "@/hooks/use-nexora";
import { formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";

export function AlternativeProductivityBoard({ initialTab }: { initialTab?: ProdTab }) {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { data: tasks = [] } = useTasks();

  const openCount = tasks.filter((t) => t.status !== "done").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div data-testid="btc-alternative-productivity" className="space-y-6">
      <header className="border-b border-border/80 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Timer className="size-3.5 text-primary" />
              <span className="font-semibold text-primary">
                {isAr ? "تنظيم الوقت والمهام" : "Atelier Timeboxing Deck"}
              </span>
              <span aria-hidden="true">·</span>
              <span>{isAr ? "مهام · بومودورو · تقويم" : "Tasks · Pomodoro · Deadlines"}</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {isAr ? "لوحة الإنتاجية وجلسات التركيز" : "Tasks & Calm Focus Studio"}
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {isAr
                ? "رتب أولوياتك اليومية، تتبع المواعيد النهائية، وادخل في جلسات تركيز هادئة بدون تشتيت."
                : "Structure deliverables by deadline, split complex assignments into subtasks, and run quiet Pomodoro blocks."}
            </p>
          </div>

          <div className="flex items-center gap-5 text-xs">
            <div>
              <span className="text-muted-foreground">{isAr ? "قيد التنفيذ" : "Open"}</span>
              <p className="flex items-center gap-1 font-display text-lg font-bold text-foreground tabular-nums">
                <CheckSquare className="size-3.5 text-primary" />
                <span>{formatNumber(openCount, lang)}</span>
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">{isAr ? "مكتملة" : "Completed"}</span>
              <p className="flex items-center gap-1 font-display text-lg font-bold text-success tabular-nums">
                <CalendarClock className="size-3.5" />
                <span>{formatNumber(doneCount, lang)}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-border/80 bg-surface/65 p-3 sm:p-5">
        <ProductivityWorkspace {...(initialTab ? { initialTab } : {})} />
      </div>
    </div>
  );
}
