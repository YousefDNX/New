import { createFileRoute } from "@tanstack/react-router";
import { SimpleFutureWorkspace } from "@/components/modules/SimpleFutureWorkspace";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/future")({
  head: () => ({
    meta: [
      { title: `Future & Careers — ${BRAND.name}` },
      {
        name: "description",
        content: `Explore professions, specializations, educational pathways, and career plans on ${BRAND.name}.`,
      },
    ],
  }),
  component: SimpleFutureWorkspace,
});
