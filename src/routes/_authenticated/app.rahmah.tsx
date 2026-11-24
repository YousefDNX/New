import { createFileRoute } from "@tanstack/react-router";
import { NexoraRahmahHub } from "@/components/rahmah/NexoraRahmahHub";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/rahmah")({
  head: () => ({
    meta: [
      { title: `Rahmah & Humanity First — ${BRAND.name}` },
      {
        name: "description",
        content: `NEXORA Rahmah: Beneficial Knowledge, Compassion, Accessibility & Universal Benefit Continuity.`,
      },
      { property: "og:title", content: `Rahmah & Humanity First — ${BRAND.name}` },
      {
        property: "og:description",
        content: `NEXORA Rahmah: Beneficial Knowledge, Compassion, Accessibility & Universal Benefit Continuity.`,
      },
    ],
  }),
  component: NexoraRahmahHub,
});
