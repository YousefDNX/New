import { createFileRoute } from "@tanstack/react-router";
import { OpportunitiesWorkspace } from "@/components/modules/OpportunitiesWorkspace";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/opportunities")({
  head: () => ({
    meta: [
      { title: `Opportunity Radar — ${BRAND.name}` },
      {
        name: "description",
        content: `Discover and track student scholarships, competitions, and programs on ${BRAND.name}.`,
      },
      { property: "og:title", content: `Opportunity Radar — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Discover and track student scholarships, competitions, and programs on ${BRAND.name}.`,
      },
    ],
  }),
  component: OpportunitiesWorkspace,
});
