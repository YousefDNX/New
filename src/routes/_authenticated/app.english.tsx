import { createFileRoute } from "@tanstack/react-router";
import { SimpleEnglishWorkspace } from "@/components/modules/SimpleEnglishWorkspace";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/english")({
  validateSearch: (search: Record<string, unknown>): { tab?: string; unit?: number } => {
    const out: { tab?: string; unit?: number } = {};
    if (typeof search["tab"] === "string") out.tab = search["tab"];
    if (typeof search["unit"] === "number") out.unit = search["unit"];
    return out;
  },
  head: () => ({
    meta: [
      { title: `English World — ${BRAND.name}` },
      {
        name: "description",
        content: `Interactive Grade 9 Vocabulary, Listening, Reading, Grammar, Speaking, and Writing practice on ${BRAND.name}.`,
      },
    ],
  }),
  component: SimpleEnglishWorkspace,
});
