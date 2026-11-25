import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { QuranWorkspace } from "@/components/modules/QuranWorkspace";
import { useOptionalAuth } from "@/lib/auth";
import { recordLastVisitedModule } from "@/lib/continue-tracker";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/_authenticated/app/quran")({
  head: () => ({
    meta: [
      { title: `Quran Kareem — ${BRAND.name}` },
      {
        name: "description",
        content: `Listen to authentic Quran recitations with exact Uthmani Arabic text on ${BRAND.name}.`,
      },
      { property: "og:title", content: `Quran Kareem — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Listen to authentic Quran recitations with exact Uthmani Arabic text on ${BRAND.name}.`,
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
      labelEn: "Quran & Islamic Center",
      labelAr: "القرآن الكريم والمركز الإسلامي",
    });
  }, [auth?.user?.uid]);

  return <QuranWorkspace />;
}
