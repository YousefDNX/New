import { Compass, Headphones, Languages, Mic } from "lucide-react";
import { EnglishAdventureWorld } from "@/components/english/EnglishAdventureWorld";
import { usePrefs } from "@/lib/preferences";

export function AlternativeEnglishWorld({
  onNavigateStudyTab,
}: {
  onNavigateStudyTab: (nextTab: string) => void;
}) {
  const { lang } = usePrefs();
  const isAr = lang === "ar";

  return (
    <div data-testid="btc-alternative-english" className="space-y-6">
      <header className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                <Languages className="size-3.5" />
                <span>{isAr ? "أكاديمية اللغة المعيارية" : "CEFR Language Studio"}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>Pre-A1 → C1–C2</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {isAr
                ? "عالم اللغة الإنجليزية والمغامرة التفاعلية"
                : "English World & Skill Academies"}
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {isAr
                ? "استكشف خريطة المسارات التفاعلية، وتدرب عبر ست أكاديميات متخصصة في الاستماع والتحدث والقراءة والكتابة والنطق."
                : "Progress through structured CEFR checkpoints alongside dedicated Listening, Speaking, Reading, Writing, Grammar, and Pronunciation studios."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <Compass className="size-3.5 text-primary" />
              <span>{isAr ? "خريطة المستويات" : "Adventure Map"}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <Headphones className="size-3.5 text-primary" />
              <span>{isAr ? "استماع تفاعلي" : "Audio Drills"}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <Mic className="size-3.5 text-primary" />
              <span>{isAr ? "نطق ومحادثة" : "Speaking Studio"}</span>
            </span>
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-border/80 bg-surface/65 p-3 sm:p-5">
        <EnglishAdventureWorld onNavigateStudyTab={onNavigateStudyTab} />
      </div>
    </div>
  );
}
