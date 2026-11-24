import { createFileRoute } from "@tanstack/react-router";
import { AiWorkspace } from "@/components/modules/AiWorkspace";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/ai")({
  head: () => ({
    meta: [
      { title: `BTC AI — ${BRAND.name}` },
      { name: "description", content: `Direct prompt & answer study assistant on ${BRAND.name}.` },
      { property: "og:title", content: `BTC AI — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Direct prompt & answer study assistant on ${BRAND.name}.`,
      },
    ],
  }),
  component: AiWorkspace,
});
