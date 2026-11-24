import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/app/LegalPage";
import { usePrefs } from "@/lib/preferences";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: `Safety — ${BRAND.name}` },
      {
        name: "description",
        content: `How ${BRAND.name} protects students: age protections, moderation and wellbeing support.`,
      },
      { property: "og:title", content: `Safety — ${BRAND.name}` },
      {
        property: "og:description",
        content: `Age protections, moderation and wellbeing support on ${BRAND.name}.`,
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SafetyPage,
});

function SafetyPage() {
  const { t } = usePrefs();
  return (
    <LegalPage title={t("legal.safety.title")}>
      <h2>{t("legal.safety.s1.h")}</h2>
      <p>{t("legal.safety.s1.p")}</p>
      <h2>{t("legal.safety.s2.h")}</h2>
      <p>{t("legal.safety.s2.p")}</p>
      <h2>{t("legal.safety.s3.h")}</h2>
      <p>{t("legal.safety.s3.p")}</p>
    </LegalPage>
  );
}
