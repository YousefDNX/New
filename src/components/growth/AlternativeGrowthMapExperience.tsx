import { Compass, Flame, MapPin, Trophy } from "lucide-react";
import { LevelUpWorkspace } from "@/components/modules/LevelUpWorkspace";
import { useStats } from "@/hooks/use-nexora";
import { formatNumber } from "@/lib/locale-format";
import { usePrefs } from "@/lib/preferences";

export function AlternativeGrowthMapExperience() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";
  const { data: stats } = useStats();

  const level = stats?.level ?? 1;
  const xp = stats?.xp ?? 0;
  const streak = stats?.current_streak ?? 0;

  return (
    <div data-testid="btc-alternative-growth" className="space-y-6">
      <header className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Compass className="size-3.5 text-primary" />
              <span className="font-semibold text-primary">
                {isAr ? "سجل النمو والمعالم" : "Atelier Growth Trajectory"}
              </span>
              <span aria-hidden="true">·</span>
              <span>{isAr ? "نقاط خبرة موثقة" : "Verified Milestone Ledger"}</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {isAr ? "خريطة التطور الشخصي والأوسمة" : "Personal Growth Map & Milestones"}
            </h1>
            <p className="max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {isAr
                ? "تابع مسار ارتفاع مستواك، سجل نقاط الخبرة الموثق، وسلسلة الاستمرارية اليومية."
                : "Track your live XP ledger, unlocked milestone achievements, and daily study momentum."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 border-t border-border/60 pt-4 lg:border-s lg:border-t-0 lg:ps-6 lg:pt-0">
            <div>
              <p className="text-[11px] text-muted-foreground">{isAr ? "المستوى" : "Level"}</p>
              <p className="mt-0.5 flex items-center gap-1.5 font-display text-2xl font-bold text-foreground tabular-nums">
                <Trophy className="size-4 text-primary" />
                <span>{formatNumber(level, lang)}</span>
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">
                {isAr ? "نقاط الخبرة" : "Total XP"}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 font-display text-2xl font-bold text-xp tabular-nums">
                <MapPin className="size-4" />
                <span>{formatNumber(xp, lang)}</span>
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">{isAr ? "الاستمرارية" : "Streak"}</p>
              <p className="mt-0.5 flex items-center gap-1.5 font-display text-2xl font-bold text-foreground tabular-nums">
                <Flame className="size-4 text-xp" />
                <span>{formatNumber(streak, lang)}d</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-border/75 bg-surface/60 p-3 sm:p-5">
        <LevelUpWorkspace />
      </div>
    </div>
  );
}
