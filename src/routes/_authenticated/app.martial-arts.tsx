import { createFileRoute } from "@tanstack/react-router";
import { MartialArtsDojoWorkspace } from "@/components/martial-arts/MartialArtsDojoWorkspace";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/martial-arts")({
  head: () => ({
    meta: [
      { title: `Martial Arts for Good — ${BRAND.name}` },
      {
        name: "description",
        content: `NEXORA Martial Arts for Good: Strength with responsibility, discipline, anti-bullying education, and safe training ethics.`,
      },
      { property: "og:title", content: `Martial Arts for Good — ${BRAND.name}` },
      {
        property: "og:description",
        content: `NEXORA Martial Arts for Good: Strength with responsibility, discipline, anti-bullying education, and safe training ethics.`,
      },
    ],
  }),
  component: MartialArtsDojoWorkspace,
});
