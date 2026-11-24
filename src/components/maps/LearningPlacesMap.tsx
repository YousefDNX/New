import { useCallback, useEffect, useState } from "react";
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map as GoogleMap,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { Compass, ExternalLink, LocateFixed, MapPin, Search, Sparkles } from "lucide-react";
import { FeatureGuideTrigger } from "@/components/common/FeatureGuideModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GroundedSourcesPanel } from "@/components/ai/GroundedSourcesPanel";
import type { GroundedMapsPlace } from "@/lib/ai.server";
import { sanitizeHttpUrl } from "@/lib/firestore-data";
import {
  dispatchGmpQuotaExceeded,
  GMP_ATTRIBUTION_ID,
  isQuotaExceededError,
} from "@/lib/maps-quota";
import { usePrefs } from "@/lib/preferences";

interface DiscoveredPlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  googleMapsUri?: string;
}

const DEFAULT_CENTER = { lat: 29.3759, lng: 47.9774 }; // Kuwait City default educational hub

interface GooglePlaceResult {
  id?: string;
  displayName?: string;
  formattedAddress?: string;
  location?: {
    lat?: (() => number) | number;
    lng?: (() => number) | number;
  };
  rating?: number;
  googleMapsURI?: string;
}

interface PlacesLibraryLike {
  Place?: {
    searchByText?: (req: {
      textQuery: string;
      fields: string[];
      maxResultCount: number;
      locationBias: { lat: number; lng: number };
    }) => Promise<{ places?: GooglePlaceResult[] }>;
  };
}

function PlacesSearchInner({
  queryText,
  biasLat,
  biasLng,
  onSelectPlace,
  onPlacesLoaded,
}: {
  queryText: string;
  biasLat: number;
  biasLng: number;
  onSelectPlace: (p: DiscoveredPlace | null) => void;
  onPlacesLoaded: (places: DiscoveredPlace[]) => void;
}) {
  const placesLib = useMapsLibrary("places");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!placesLib || !queryText.trim()) return;
    let cancelled = false;
    setSearching(true);

    const PlaceCtor = (placesLib as unknown as PlacesLibraryLike).Place;
    if (!PlaceCtor?.searchByText) {
      setSearching(false);
      return;
    }

    void PlaceCtor.searchByText({
      textQuery: queryText,
      fields: ["id", "displayName", "formattedAddress", "location", "rating", "googleMapsURI"],
      maxResultCount: 8,
      locationBias: { lat: biasLat, lng: biasLng },
    })
      .then((res) => {
        if (cancelled) return;
        const found: DiscoveredPlace[] = (res.places ?? [])
          .map((p, idx) => {
            const loc = p.location;
            const lat = typeof loc?.lat === "function" ? loc.lat() : Number(loc?.lat ?? 0);
            const lng = typeof loc?.lng === "function" ? loc.lng() : Number(loc?.lng ?? 0);
            if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) {
              return null;
            }
            return {
              id: p.id || `place_${idx}`,
              name: p.displayName || "Educational Hub",
              address: p.formattedAddress || "",
              lat,
              lng,
              ...(typeof p.rating === "number" ? { rating: p.rating } : {}),
              ...(p.googleMapsURI ? { googleMapsUri: p.googleMapsURI } : {}),
            };
          })
          .filter((x): x is DiscoveredPlace => x !== null);
        onPlacesLoaded(found);
        onSelectPlace(found[0] ?? null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (isQuotaExceededError(err)) {
          dispatchGmpQuotaExceeded("Places API searchByText quota error");
        }
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [placesLib, queryText, biasLat, biasLng, onPlacesLoaded, onSelectPlace]);

  return searching ? (
    <div className="px-2 py-1 text-[0.68rem] text-muted-foreground">
      Searching nearby educational locations...
    </div>
  ) : null;
}

function MapCameraController({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo({ lat, lng });
  }, [map, lat, lng]);

  return null;
}

export function LearningPlacesMap({
  initialQuery = "public library and university study hub",
}: {
  initialQuery?: string;
}) {
  const { t, lang, locale, ecosystem, setEcosystem } = usePrefs();
  const apiKey = (import.meta.env?.["VITE_GOOGLE_MAPS_API_KEY"] ?? "").trim();

  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [center, setCenter] = useState<{ lat: number; lng: number }>(DEFAULT_CENTER);
  const [places, setPlaces] = useState<DiscoveredPlace[]>([]);
  const [selected, setSelected] = useState<DiscoveredPlace | null>(null);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const handleSelectPlace = useCallback((place: DiscoveredPlace | null) => setSelected(place), []);
  const handlePlacesLoaded = useCallback((found: DiscoveredPlace[]) => setPlaces(found), []);

  // Maps AI Grounding companion state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiPlaces, setAiPlaces] = useState<GroundedMapsPlace[]>([]);

  const handleRequestLocation = () => {
    setLocationNotice(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationNotice(
        "Geolocation unavailable in this browser. Search any city or campus name directly.",
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setEcosystem({ mapsLocationConsent: true });
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(coords);
        setLocationNotice("Using your approximate area for nearby study hubs.");
      },
      () => {
        setEcosystem({ mapsLocationConsent: false });
        setLocationNotice("Location permission declined. Showing curated regional center instead.");
      },
      { timeout: 6000 },
    );
  };

  const handleAskMapsAi = async () => {
    const q = inputQuery.trim();
    if (!q) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/maps-grounding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          ...(ecosystem.mapsLocationConsent ? { lat: center.lat, lng: center.lng } : {}),
          language: lang,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        text?: string;
        places?: GroundedMapsPlace[];
        message?: string;
      };
      if (!res.ok || !data.ok || !data.text) {
        setAiError(data.message ?? "Unable to reach Maps AI right now.");
        return;
      }
      setAiSummary(data.text);
      setAiPlaces(data.places ?? []);
    } catch {
      setAiError("Network error contacting Maps Grounding endpoint.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="surface-card space-y-4 border-primary/25 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Compass className="size-4" />
            <h3 className="font-display text-base font-bold text-foreground">
              {t("p5.maps.hubTitle")}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">{t("p5.maps.hubSub")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FeatureGuideTrigger featureId="learning-places-map" iconOnly />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleRequestLocation}
            className="h-8 text-xs"
          >
            <LocateFixed className="size-3.5" />
            <span>{t("p5.maps.useMyLocation")}</span>
          </Button>
        </div>
      </div>

      {locationNotice && <p className="text-[0.7rem] text-muted-foreground">{locationNotice}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (inputQuery.trim()) setActiveQuery(inputQuery.trim());
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={t("p5.maps.searchPh")}
            className="h-9 ps-8 text-xs"
          />
        </div>
        <Button type="submit" size="sm" variant="outline" className="h-9 text-xs">
          <MapPin className="size-3.5" />
          <span>Search Map</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="glow"
          disabled={aiLoading || !inputQuery.trim()}
          onClick={handleAskMapsAi}
          className="h-9 text-xs"
        >
          <Sparkles className="size-3.5" />
          <span>{aiLoading ? "Researching..." : t("p5.maps.aiPlacesBtn")}</span>
        </Button>
      </form>

      {apiKey ? (
        <APIProvider
          apiKey={apiKey}
          language={lang}
          {...(locale.opportunityScope === "local" ? { region: "KW" } : {})}
        >
          <PlacesSearchInner
            queryText={activeQuery}
            biasLat={center.lat}
            biasLng={center.lng}
            onSelectPlace={handleSelectPlace}
            onPlacesLoaded={handlePlacesLoaded}
          />
          <div className="h-[360px] w-full overflow-hidden rounded-xl border border-border bg-surface-2">
            <GoogleMap
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={[GMP_ATTRIBUTION_ID]}
              defaultCenter={center}
              defaultZoom={12}
              gestureHandling="greedy"
              style={{ width: "100%", height: "100%" }}
            >
              <MapCameraController
                lat={selected ? selected.lat : center.lat}
                lng={selected ? selected.lng : center.lng}
              />
              {places.map((place) => (
                <AdvancedMarker
                  key={place.id}
                  position={{ lat: place.lat, lng: place.lng }}
                  title={place.name}
                  onClick={() => setSelected(place)}
                />
              ))}
              {selected && (
                <InfoWindow
                  position={{ lat: selected.lat, lng: selected.lng }}
                  onCloseClick={() => setSelected(null)}
                >
                  <div className="max-w-xs space-y-1 p-1 text-xs text-slate-900">
                    <div className="font-bold">{selected.name}</div>
                    {selected.address && <div className="text-slate-600">{selected.address}</div>}
                    {selected.rating !== undefined && (
                      <div className="font-medium">Rating: {selected.rating.toFixed(1)} ★</div>
                    )}
                    {selected.googleMapsUri && sanitizeHttpUrl(selected.googleMapsUri) && (
                      <a
                        href={sanitizeHttpUrl(selected.googleMapsUri) ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-teal-700 underline"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>
        </APIProvider>
      ) : (
        <div className="rounded-xl border border-border bg-surface-2 p-4 text-xs text-muted-foreground">
          Interactive map canvas requires{" "}
          <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code>. You can still query verified
          places below using Maps AI.
        </div>
      )}

      {places.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {places.slice(0, 4).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p)}
              className={`rounded-lg border p-2.5 text-start text-xs transition-colors ${
                selected?.id === p.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface-2 hover:border-primary/40"
              }`}
            >
              <div className="truncate font-semibold text-foreground">{p.name}</div>
              <div className="mt-0.5 truncate text-[0.68rem] text-muted-foreground">
                {p.address}
              </div>
            </button>
          ))}
        </div>
      )}

      {aiError && (
        <div
          role="alert"
          className="rounded-lg border border-xp/40 bg-xp/10 px-3 py-2 text-xs text-foreground"
        >
          {aiError}
        </div>
      )}

      {aiSummary && (
        <div className="space-y-2 rounded-xl border border-border bg-surface-2 p-4 text-xs">
          <div className="whitespace-pre-wrap leading-relaxed text-foreground">{aiSummary}</div>
          <GroundedSourcesPanel mode="maps" mapsPlaces={aiPlaces} />
        </div>
      )}
    </div>
  );
}
