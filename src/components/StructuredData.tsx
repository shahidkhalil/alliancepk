import { BUSINESS_ADDRESS, SALES_EMAIL } from "@/lib/siteContact";

const BASE_URL = "https://alliancetechltd.com";

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${BASE_URL}/#organization`,
            name: "Alliance Tech",
            url: BASE_URL,
            logo: `${BASE_URL}/logo-horizontal.png`,
            email: SALES_EMAIL,
            address: {
              "@type": "PostalAddress",
              streetAddress: BUSINESS_ADDRESS.street,
              addressLocality: BUSINESS_ADDRESS.city,
              addressRegion: BUSINESS_ADDRESS.region,
              postalCode: BUSINESS_ADDRESS.postalCode,
              addressCountry: BUSINESS_ADDRESS.countryCode,
            },
            sameAs: [
              "https://www.instagram.com/alliancetechofficial",
              "https://www.facebook.com/alliancetech11",
              "https://www.linkedin.com/company/alliancetechltd/",
            ],
          },
          {
            "@type": "WebSite",
            "@id": `${BASE_URL}/#website`,
            url: BASE_URL,
            name: "Alliance Tech",
            publisher: { "@id": `${BASE_URL}/#organization` },
            inLanguage: "en-US",
          },
        ],
      }}
    />
  );
}

export function ServiceSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name,
        description,
        url: `${BASE_URL}${path}`,
        provider: { "@id": `${BASE_URL}/#organization` },
        areaServed: [
          { "@type": "City", name: "Houston" },
          { "@type": "State", name: "Texas" },
          { "@type": "Country", name: "United States" },
        ],
      }}
    />
  );
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${BASE_URL}${item.path}`,
        })),
      }}
    />
  );
}
