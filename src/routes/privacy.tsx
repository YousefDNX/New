import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/app/LegalPage";
import { usePrefs } from "@/lib/preferences";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy — ${BRAND.name}` },
      {
        name: "description",
        content: `How ${BRAND.name} collects, protects and lets students control their data.`,
      },
      { property: "og:title", content: `Privacy — ${BRAND.name}` },
      { property: "og:description", content: `How ${BRAND.name} protects student data.` },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t } = usePrefs();
  return (
    <LegalPage title={t("legal.privacy.title")}>
      <p>{t("legal.privacy.intro")}</p>
      <h2>{t("legal.privacy.s1.h")}</h2>
      <p>{t("legal.privacy.s1.p")}</p>
      <h2>{t("legal.privacy.s2.h")}</h2>
      <p>{t("legal.privacy.s2.p")}</p>
      <h2>{t("legal.privacy.s3.h")}</h2>
      <p>{t("legal.privacy.s3.p")}</p>
      <h2>{t("legal.privacy.s4.h")}</h2>
      <p>{t("legal.privacy.s4.p")}</p>
      <p className="text-xs">{t("legal.privacy.note")}</p>
    </LegalPage>
  );
}
