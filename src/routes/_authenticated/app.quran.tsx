import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { QuranWorkspace } from "@/components/modules/QuranWorkspace";
import { useOptionalAuth } from "@/lib/auth";
import { recordLastVisitedModule } from "@/lib/continue-tracker";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/quran")({
  head: () => ({
    meta: [
      { title: `Islamic Center — ${BRAND.name}` },
      {
        name: "description",
        content: `Complete Islamic Center with authentic Quran Mushaf, verified recitations, prayer times, Hadith, and Azkar on ${BRAND.name}.`,
      },
      { property: "og:title", content: `Islamic Center — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Complete Islamic Center with authentic Quran Mushaf, verified recitations, prayer times, Hadith, and Azkar on ${BRAND.name}.`,
      },
    ],
  }),
  component: QuranRouteComponent,
});

function QuranRouteComponent() {
  const auth = useOptionalAuth();
  useEffect(() => {
    recordLastVisitedModule(auth?.user?.uid, {
      path: "/app/quran",
      labelEn: "Islamic Center",
      labelAr: "المركز الإسلامي",
    });
  }, [auth?.user?.uid]);

  return <QuranWorkspace />;
}
