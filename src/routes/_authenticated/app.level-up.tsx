import { createFileRoute } from "@tanstack/react-router";
import { LevelUpWorkspace } from "@/components/modules/LevelUpWorkspace";
import { AlternativeGrowthMapExperience } from "@/components/growth/AlternativeGrowthMapExperience";
import { usePrefs } from "@/lib/preferences";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/level-up")({
  head: () => ({
    meta: [
      { title: `Level Up — ${BRAND.name}` },
      {
        name: "description",
        content: `Verified XP ledger, achievements, and streaks on ${BRAND.name}.`,
      },
      { property: "og:title", content: `Level Up — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Verified XP ledger, achievements, and streaks on ${BRAND.name}.`,
      },
    ],
  }),
  component: GrowthMapRouteComponent,
});

function GrowthMapRouteComponent() {
  const { effectiveBtcVisualTheme } = usePrefs();
  return effectiveBtcVisualTheme === "btc_alternative" ? (
    <AlternativeGrowthMapExperience />
  ) : (
    <LevelUpWorkspace />
  );
}
