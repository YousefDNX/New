import { createFileRoute } from "@tanstack/react-router";
import { ProductivityFocusWorkspace } from "@/components/modules/ProductivityFocusWorkspace";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/tasks")({
  head: () => ({
    meta: [
      { title: `Productivity & Focus — ${BRAND.name}` },
      {
        name: "description",
        content: `Calm tasks, goals, focus timer, and time organizer on ${BRAND.name}.`,
      },
      { property: "og:title", content: `Productivity & Focus — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Calm tasks, goals, focus timer, and time organizer on ${BRAND.name}.`,
      },
    ],
  }),
  component: ProductivityFocusWorkspace,
});
