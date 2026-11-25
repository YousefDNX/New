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
      { title: `Study & Academics — ${BRAND.name}` },
      {
        name: "description",
        content: `General academic notes, flashcards, and mistake tracking on ${BRAND.name}.`,
      },
      { property: "og:title", content: `Study & Academics — ${BRAND.name}` },
      {
        property: "og:description",
        content: `General academic notes, flashcards, and mistake tracking on ${BRAND.name}.`,
      },
    ],
  }),
  component: StudyWorkspace,
});
