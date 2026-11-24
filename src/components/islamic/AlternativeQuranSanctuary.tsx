import { BookOpenCheck, Volume2 } from "lucide-react";
import { QuranWorkspace } from "@/components/modules/QuranWorkspace";
import { usePrefs } from "@/lib/preferences";

export function AlternativeQuranSanctuary() {
  const { lang } = usePrefs();
  const isAr = lang === "ar";

  return (
    <div data-testid="btc-alternative-quran" className="space-y-6">
      <header className="rounded-2xl border border-border/80 bg-surface/90 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <BookOpenCheck className="size-3.5 text-primary" />
              <span className="font-semibold text-primary">
                {isAr ? "ملاذ القرآن الكريم" : "Quran Reading & Recitation Sanctuary"}
              </span>
              <span aria-hidden="true">·</span>
              <span>{isAr ? "الرسم العثماني المعتمد" : "Verified Uthmani Script"}</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {isAr ? "القرآن الكريم — قراءة وتلاوة هادئة" : "Al-Quran Al-Kareem Sanctuary"}
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {isAr
                ? "اقرأ السور بالخط العثماني الواضح مع إمكانية الاستماع لتلاوات كبار القراء وحفظ علامة الموضع."
                : "Read the Uthmani Mushaf in a calm, high-legibility layout with verified reciters and continuous bookmark tracking."}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Volume2 className="size-4 text-primary" />
            <span>{isAr ? "تلاوة متواصلة عالية النقاء" : "Serene Audio Playback"}</span>
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-border/75 bg-surface/80 p-3 sm:p-6">
        <QuranWorkspace />
      </div>
    </div>
  );
}
