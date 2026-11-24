import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EnglishAdventureWorld } from "@/components/english/EnglishAdventureWorld";
import { AlternativeEnglishWorld } from "@/components/english/AlternativeEnglishWorld";
import { usePrefs } from "@/lib/preferences";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/english")({
  head: () => ({
    meta: [
      { title: `English Adventure World — ${BRAND.name}` },
      {
        name: "description",
        content: `Interactive Pre-A1 to C1–C2 English curriculum, Adventure Map, listening, speaking, reading, writing, vocabulary, grammar, and pronunciation academies on ${BRAND.name}.`,
      },
      { property: "og:title", content: `English Adventure World — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Interactive Pre-A1 to C1–C2 English curriculum, Adventure Map, listening, speaking, reading, writing, vocabulary, grammar, and pronunciation academies on ${BRAND.name}.`,
      },
    ],
  }),
  component: EnglishWorldPage,
});

function EnglishWorldPage() {
  const navigate = useNavigate();
  const { effectiveBtcVisualTheme } = usePrefs();
  const onNav = (nextTab: string) => {
    void navigate({ to: "/app/study", search: { tab: nextTab } as never });
  };
  return effectiveBtcVisualTheme === "btc_alternative" ? (
    <AlternativeEnglishWorld onNavigateStudyTab={onNav} />
  ) : (
    <EnglishAdventureWorld onNavigateStudyTab={onNav} />
  );
}
