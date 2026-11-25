import { createFileRoute } from "@tanstack/react-router";
import { WellbeingWorkspace } from "@/components/modules/WellbeingWorkspace";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/care")({
  head: () => ({
    meta: [
      { title: `Personal Growth — ${BRAND.name}` },
      {
        name: "description",
        content: `Calm emotional check-ins, private reflections, healthy habits, and personal growth on ${BRAND.name}.`,
      },
    ],
  }),
  component: WellbeingWorkspace,
});
