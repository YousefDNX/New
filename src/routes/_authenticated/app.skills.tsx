import { createFileRoute } from "@tanstack/react-router";
import { SimpleSkillsWorkspace } from "@/components/modules/SimpleSkillsWorkspace";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/skills")({
  head: () => ({
    meta: [
      { title: `Skills Academy — ${BRAND.name}` },
      {
        name: "description",
        content: `Practical communication, critical thinking, digital, and life skills on ${BRAND.name}.`,
      },
      { property: "og:title", content: `Skills Academy — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Practical communication, critical thinking, digital, and life skills on ${BRAND.name}.`,
      },
    ],
  }),
  component: SimpleSkillsWorkspace,
});
