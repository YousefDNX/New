import { createFileRoute } from "@tanstack/react-router";
import { SimpleCircleWorkspace } from "@/components/modules/SimpleCircleWorkspace";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/circle")({
  head: () => ({
    meta: [
      { title: `Knowledge Circle — ${BRAND.name}` },
      {
        name: "description",
        content: `Shared student Knowledge Circle for questions, explanations, helpful posts, and bookmarks on ${BRAND.name}.`,
      },
      { property: "og:title", content: `Knowledge Circle — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Shared student Knowledge Circle for questions, explanations, helpful posts, and bookmarks on ${BRAND.name}.`,
      },
    ],
  }),
  component: SimpleCircleWorkspace,
});
