import { createFileRoute } from "@tanstack/react-router";
import { StudyWorkspace } from "@/components/modules/StudyWorkspace";
import { AlternativeStudyWorkspace } from "@/components/study/AlternativeStudyWorkspace";
import { usePrefs } from "@/lib/preferences";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/study")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } =>
    typeof search["tab"] === "string" ? { tab: search["tab"] } : {},
  head: () => ({
    meta: [
      { title: `Study — ${BRAND.name}` },
      {
        name: "description",
        content: `Study notes, flashcards, quizzes, and mistake log on ${BRAND.name}.`,
      },
      { property: "og:title", content: `Study — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Study notes, flashcards, quizzes, and mistake log on ${BRAND.name}.`,
      },
    ],
  }),
  component: StudyRouteComponent,
});

function StudyRouteComponent() {
  const { effectiveBtcVisualTheme } = usePrefs();
  return effectiveBtcVisualTheme === "btc_alternative" ? (
    <AlternativeStudyWorkspace />
  ) : (
    <StudyWorkspace />
  );
}
