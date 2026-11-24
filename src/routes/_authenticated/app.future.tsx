import { createFileRoute } from "@tanstack/react-router";
import { DeferredModuleNotice } from "@/components/common/DeferredModuleNotice";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/future")({
  head: () => ({
    meta: [
      { title: `Future Pathways — ${BRAND.name}` },
      {
        name: "description",
        content: `Explore educational and career pathways on ${BRAND.name}.`,
      },
      { property: "og:title", content: `Future Pathways — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Explore educational and career pathways on ${BRAND.name}.`,
      },
    ],
  }),
  component: () => (
    <DeferredModuleNotice
      titleEn="Future Pathways & Career Navigator"
      titleAr="مسارات المستقبل والتوجيه الأكاديمي"
    />
  ),
});
