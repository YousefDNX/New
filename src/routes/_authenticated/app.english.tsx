import { createFileRoute } from "@tanstack/react-router";
import { SimpleEnglishWorkspace } from "@/components/modules/SimpleEnglishWorkspace";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/english")({
  head: () => ({
    meta: [
      { title: `English World — ${BRAND.name}` },
      {
        name: "description",
        content: `Interactive Vocabulary, Listening, Reading, Grammar, Speaking, and Writing practice on ${BRAND.name}.`,
      },
    ],
  }),
  component: SimpleEnglishWorkspace,
});
