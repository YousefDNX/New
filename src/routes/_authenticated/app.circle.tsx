import { createFileRoute } from "@tanstack/react-router";
import { CircleWorkspace, type CircleHubSection } from "@/components/modules/CircleWorkspace";
import { BRAND } from "@/config/brand";

const VALID_SECTIONS = new Set<CircleHubSection>([
  "qa",
  "teams",
  "matcher",
  "classrooms",
  "library",
  "girls_space",
]);

export const Route = createFileRoute("/_authenticated/app/circle")({
  validateSearch: (search: Record<string, unknown>): { section?: CircleHubSection } => {
    const raw =
      typeof search["section"] === "string" ? (search["section"] as CircleHubSection) : undefined;
    return raw && VALID_SECTIONS.has(raw) ? { section: raw } : {};
  },
  head: () => ({
    meta: [
      { title: `Knowledge Circle — ${BRAND.name}` },
      {
        name: "description",
        content: `Knowledge Circle Q&A, study cohorts, and privacy-protected Girls' Space on ${BRAND.name}.`,
      },
      { property: "og:title", content: `Knowledge Circle — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Knowledge Circle Q&A, study cohorts, and privacy-protected Girls' Space on ${BRAND.name}.`,
      },
    ],
  }),
  component: CircleRouteComponent,
});

function CircleRouteComponent() {
  const { section } = Route.useSearch();
  return <CircleWorkspace {...(section ? { initialSection: section } : {})} />;
}
