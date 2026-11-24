import { createFileRoute } from "@tanstack/react-router";
import { CareWorkspace } from "@/components/modules/CareWorkspace";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/care")({
  head: () => ({
    meta: [
      { title: `Care — ${BRAND.name}` },
      {
        name: "description",
        content: `Private student wellbeing check-ins and guided grounding on ${BRAND.name}.`,
      },
      { property: "og:title", content: `Care — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Private student wellbeing check-ins and guided grounding on ${BRAND.name}.`,
      },
    ],
  }),
  component: CareWorkspace,
});
