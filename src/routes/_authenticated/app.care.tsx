import { createFileRoute } from "@tanstack/react-router";
import { WellbeingWorkspace } from "@/components/modules/WellbeingWorkspace";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/care")({
  head: () => ({
    meta: [
      { title: `Personal Growth & Wellbeing — ${BRAND.name}` },
      {
        name: "description",
        content: `Calm emotional check-ins, private reflections, healthy habits, and grounding routines on ${BRAND.name}.`,
      },
    ],
  }),
  component: WellbeingWorkspace,
});
