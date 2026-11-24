import React from "react";
import { Trophy, Award, Flame, Star, Zap, Target, BookOpenCheck, ShieldCheck } from "lucide-react";
import { usePrefs } from "@/lib/preferences";

export interface StudentBadge {
  id: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  icon: "trophy" | "flame" | "star" | "zap" | "target" | "book" | "shield";
  earned: boolean;
  progressTextEn?: string;
  progressTextAr?: string;
}

interface GlossyBadgesDisplayProps {
  badges: StudentBadge[];
  className?: string;
}

const ICONS = {
  trophy: Trophy,
  flame: Flame,
  star: Star,
  zap: Zap,
  target: Target,
  book: BookOpenCheck,
  shield: ShieldCheck,
};

export function GlossyBadgesDisplay({ badges, className = "" }: GlossyBadgesDisplayProps) {
  const { lang } = usePrefs();
  const isAr = lang === "ar";

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
            <Award className="size-4 text-primary" />
            <span>{isAr ? "شارات الإنجاز والتميز الأكاديمي" : "Milestone Achievement Badges"}</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "شارة براقة تتألق تلقائياً كلما أنجزت مهام دراسية ودروساً جديدة"
              : "Glossy achievement awards unlocked as you hit study and XP milestones."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {badges.map((b) => {
          const IconComponent = ICONS[b.icon] || Trophy;
          return (
            <div
              key={b.id}
              className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
                b.earned
                  ? "border-primary/40 bg-gradient-to-br from-surface via-surface-2 to-primary/10 shadow-lg shadow-primary/5 hover:border-primary"
                  : "border-border/60 bg-surface/50 opacity-70 grayscale hover:grayscale-0 hover:opacity-100"
              }`}
            >
              {/* Glossy sheen overlay */}
              <div className="absolute -inset-x-20 -top-20 h-40 bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-12 pointer-events-none" />

              <div className="flex items-start gap-3">
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl shadow-md ${
                    b.earned
                      ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-primary/20"
                      : "bg-surface-2 text-muted-foreground border border-border"
                  }`}
                >
                  <IconComponent className="size-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-display text-xs font-bold text-foreground truncate">
                      {isAr ? b.titleAr : b.titleEn}
                    </h4>
                    {b.earned && (
                      <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 border border-emerald-500/20">
                        {isAr ? "مكتسبة" : "Unlocked"}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {isAr ? b.descAr : b.descEn}
                  </p>
                  {!b.earned && b.progressTextEn && (
                    <div className="text-[10px] font-semibold text-primary pt-1">
                      {isAr ? b.progressTextAr : b.progressTextEn}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
