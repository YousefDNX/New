import { createFileRoute } from "@tanstack/react-router";
import { HelpCenter } from "@/components/help/HelpCenter";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/help")({
  head: () => ({
    meta: [
      { title: `Help Center & Documentation — ${BRAND.name}` },
      {
        name: "description",
        content: "Searchable guides, frequently asked questions, and platform tutorials.",
      },
    ],
  }),
  component: HelpCenterPage,
});

function HelpCenterPage() {
  return (
    <div className="space-y-6">
      <HelpCenter />
    </div>
  );
}
