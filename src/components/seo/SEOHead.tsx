import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useOptionalPrefs } from "@/lib/preferences";
import { BRAND } from "@/config/brand";

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  keywords?: string[];
  noIndex?: boolean;
}

const DEFAULT_TITLE = `${BRAND.name} — Student Growth Hub & Interactive Growth Map`;
const DEFAULT_DESCRIPTION = `${BRAND.name} connects academic study, daily productivity, wellbeing care, and career planning into a unified, gamified AI student Growth Map.`;
const DEFAULT_IMAGE = "/og-image.png";

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
  keywords = [
    "student dashboard",
    "growth map",
    "study planner",
    "academic tracker",
    "student productivity",
    BRAND.name,
  ],
  noIndex = false,
}: SEOHeadProps) {
  const prefs = useOptionalPrefs();
  const lang = prefs?.lang ?? "en";
  const [loc, setLoc] = useState<{ origin: string; pathname: string }>({
    origin: "https://nexora.school",
    pathname: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoc({ origin: window.location.origin, pathname: window.location.pathname });
    }
  }, []);

  const formattedTitle = title ? `${title} | ${BRAND.name}` : DEFAULT_TITLE;

  const origin = loc.origin;
  const canonicalUrl = canonicalPath
    ? `${origin}${canonicalPath}`
    : loc.pathname
      ? `${origin}${loc.pathname}`
      : origin;
  const fullImageUrl = ogImage.startsWith("http") ? ogImage : `${origin}${ogImage}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${BRAND.name} — Student Growth Hub`,
    applicationCategory: "EducationalApplication",
    operatingSystem: "All modern browsers, iOS, Android, macOS, Windows",
    url: canonicalUrl,
    description: description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    inLanguage: lang,
  };

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* OpenGraph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={BRAND.name} />
      <meta property="og:image" content={fullImageUrl} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Schema.org JSON-LD Structured Data */}
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
}
