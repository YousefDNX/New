import { createFileRoute } from "@tanstack/react-router";
import { SimpleTasksWorkspace } from "@/components/tasks/SimpleTasksWorkspace";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/tasks")({
  head: () => ({
    meta: [
      { title: `My Tasks — ${BRAND.name}` },
      {
        name: "description",
        content: `Simple student task manager on ${BRAND.name}.`,
      },
      { property: "og:title", content: `My Tasks — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Simple student task manager on ${BRAND.name}.`,
      },
    ],
  }),
  component: SimpleTasksWorkspace,
});
