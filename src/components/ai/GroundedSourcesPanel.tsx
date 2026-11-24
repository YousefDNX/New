import { ExternalLink, Globe, MapPin, Sparkles } from "lucide-react";
import type { GroundedMapsPlace, GroundedWebSource } from "@/lib/ai.server";
import { sanitizeAiHttpUrl } from "@/lib/ai-workspace-store";
import { usePrefs } from "@/lib/preferences";

export function GroundedSourcesPanel({
  mode,
  webSources = [],
  mapsPlaces = [],
  searchQueries = [],
}: {
  mode: "search" | "maps" | "ungrounded";
  webSources?: GroundedWebSource[];
  mapsPlaces?: GroundedMapsPlace[];
  searchQueries?: string[];
}) {
  const { t } = usePrefs();

  if (mode === "ungrounded") {
    return (
      <div className="mt-2 flex items-center gap-1.5 text-[0.68rem] text-muted-foreground">
        <Sparkles className="size-3 shrink-0 text-primary/70" />
        <span>{t("p5.search.badgeUngrounded")}</span>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-primary/25 bg-primary/5 p-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 font-semibold text-primary">
          {mode === "maps" ? <MapPin className="size-3.5" /> : <Globe className="size-3.5" />}
          <span>{mode === "maps" ? t("p5.maps.badgeGrounded") : t("p5.search.badgeGrounded")}</span>
        </div>
        {searchQueries.length > 0 && (
          <span className="text-[0.68rem] text-muted-foreground">
            {searchQueries.slice(0, 2).join(" · ")}
          </span>
        )}
      </div>

      {webSources.length > 0 && (
        <div className="space-y-1">
          <div className="text-[0.68rem] font-medium uppercase tracking-wider text-muted-foreground">
            {t("p5.search.sources")}
          </div>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {webSources.map((src) => {
              const safe = sanitizeAiHttpUrl(src.url);
              if (!safe) return null;
              return (
                <li key={safe}>
                  <a
                    href={safe}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 rounded-md border border-border/80 bg-surface-2 px-2.5 py-1.5 text-[0.72rem] text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <span className="truncate font-medium">{src.title}</span>
                    <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {mapsPlaces.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {mapsPlaces.map((place) => {
            const safe = sanitizeAiHttpUrl(place.uri);
            if (!safe) return null;
            return (
              <li
                key={safe}
                className="space-y-1 rounded-md border border-border/80 bg-surface-2 p-2.5"
              >
                <a
                  href={safe}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                >
                  <MapPin className="size-3 shrink-0" />
                  <span>{place.title}</span>
                  <ExternalLink className="size-3 shrink-0" />
                </a>
                {place.reviewSnippets.length > 0 && (
                  <p className="text-[0.68rem] leading-relaxed text-muted-foreground">
                    “{place.reviewSnippets[0]}”
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
