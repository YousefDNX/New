import { createFileRoute } from "@tanstack/react-router";
import { SimpleOpportunitiesWorkspace } from "@/components/modules/SimpleOpportunitiesWorkspace";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/opportunities")({
  head: () => ({
    meta: [
      { title: `Opportunity Radar — ${BRAND.name}` },
      {
        name: "description",
        content: `Verified scholarships, competitions, workshops, and personal application tracking on ${BRAND.name}.`,
      },
    ],
  }),
  component: SimpleOpportunitiesWorkspace,
});
