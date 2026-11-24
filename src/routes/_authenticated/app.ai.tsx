import { createFileRoute } from "@tanstack/react-router";
import { AiWorkspace } from "@/components/modules/AiWorkspace";
import { AlternativeAiWorkspace } from "@/components/ai/AlternativeAiWorkspace";
import { usePrefs } from "@/lib/preferences";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/ai")({
  head: () => ({
    meta: [
      { title: `${BRAND.shortName} AI — ${BRAND.name}` },
      { name: "description", content: `Privacy-first ${BRAND.shortName} AI Study Assistant.` },
      { property: "og:title", content: `${BRAND.shortName} AI — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Privacy-first ${BRAND.shortName} AI Study Assistant.`,
      },
    ],
  }),
  component: AiRouteComponent,
});

function AiRouteComponent() {
  const { effectiveBtcVisualTheme } = usePrefs();
  return effectiveBtcVisualTheme === "btc_alternative" ? (
    <AlternativeAiWorkspace />
  ) : (
    <AiWorkspace />
  );
}
