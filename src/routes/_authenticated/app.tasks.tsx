import { createFileRoute } from "@tanstack/react-router";
import { ProductivityWorkspace, type ProdTab } from "@/components/modules/ProductivityWorkspace";
import { AlternativeProductivityBoard } from "@/components/productivity/AlternativeProductivityBoard";
import { usePrefs } from "@/lib/preferences";
import { BRAND } from "@/config/brand";

const VALID_PROD_TABS = new Set<ProdTab>(["tasks", "timer", "calendar", "deadlines"]);

export const Route = createFileRoute("/_authenticated/app/tasks")({
  validateSearch: (search: Record<string, unknown>): { tab?: ProdTab } => {
    const raw = typeof search["tab"] === "string" ? (search["tab"] as ProdTab) : undefined;
    return raw && VALID_PROD_TABS.has(raw) ? { tab: raw } : {};
  },
  head: () => ({
    meta: [
      { title: `Productivity — ${BRAND.name}` },
      {
        name: "description",
        content: `Tasks, subtasks, focus timer, and calendar on ${BRAND.name}.`,
      },
      { property: "og:title", content: `Productivity — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Tasks, subtasks, focus timer, and calendar on ${BRAND.name}.`,
      },
    ],
  }),
  component: TasksRoutePage,
});

function TasksRoutePage() {
  const { tab } = Route.useSearch();
  const { effectiveBtcVisualTheme } = usePrefs();
  if (effectiveBtcVisualTheme === "btc_alternative") {
    return <AlternativeProductivityBoard {...(tab ? { initialTab: tab } : {})} />;
  }
  return <ProductivityWorkspace {...(tab ? { initialTab: tab } : {})} />;
}
