import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/app/LegalPage";
import { usePrefs } from "@/lib/preferences";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: `Terms of use — ${BRAND.name}` },
      { name: "description", content: `The rules for using ${BRAND.name} and its community.` },
      { property: "og:title", content: `Terms of use — ${BRAND.name}` },
      { property: "og:description", content: `The rules for using ${BRAND.name}.` },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { t } = usePrefs();
  return (
    <LegalPage title={t("legal.terms.title")}>
      <p>{t("legal.terms.intro")}</p>
      <h2>{t("legal.terms.s1.h")}</h2>
      <p>{t("legal.terms.s1.p")}</p>
      <h2>{t("legal.terms.s2.h")}</h2>
      <p>{t("legal.terms.s2.p")}</p>
      <h2>{t("legal.terms.s3.h")}</h2>
      <p>{t("legal.terms.s3.p")}</p>
    </LegalPage>
  );
}
