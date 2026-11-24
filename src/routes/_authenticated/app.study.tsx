import { createFileRoute } from "@tanstack/react-router";
import { StudyWorkspace } from "@/components/modules/StudyWorkspace";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/study")({
  validateSearch: (search: Record<string, unknown>): { tab?: string; unit?: number } => {
    const out: { tab?: string; unit?: number } = {};
    if (typeof search["tab"] === "string") out.tab = search["tab"];
    if (typeof search["unit"] === "number") out.unit = search["unit"];
    return out;
  },
  head: () => ({
    meta: [
      { title: `Grade 9 Study — ${BRAND.name}` },
      {
        name: "description",
        content: `Grade 9 English vocabulary flashcards and study units on ${BRAND.name}.`,
      },
      { property: "og:title", content: `Grade 9 Study — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Grade 9 English vocabulary flashcards and study units on ${BRAND.name}.`,
      },
    ],
  }),
  component: StudyWorkspace,
});
