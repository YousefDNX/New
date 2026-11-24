import { createFileRoute } from "@tanstack/react-router";
import { QuranWorkspace } from "@/components/modules/QuranWorkspace";
import { AlternativeQuranSanctuary } from "@/components/islamic/AlternativeQuranSanctuary";
import { usePrefs } from "@/lib/preferences";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/quran")({
  head: () => ({
    meta: [
      { title: `Quran Kareem — ${BRAND.name}` },
      {
        name: "description",
        content: `Listen to authentic Quran recitations with exact Uthmani Arabic text on ${BRAND.name}.`,
      },
      { property: "og:title", content: `Quran Kareem — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Listen to authentic Quran recitations with exact Uthmani Arabic text on ${BRAND.name}.`,
      },
    ],
  }),
  component: QuranRouteComponent,
});

function QuranRouteComponent() {
  const { effectiveBtcVisualTheme } = usePrefs();
  return effectiveBtcVisualTheme === "btc_alternative" ? (
    <AlternativeQuranSanctuary />
  ) : (
    <QuranWorkspace />
  );
}
