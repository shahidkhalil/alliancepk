import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services | Alliance Tech",
  description:
    "Browse Alliance Tech services by niche — AI Automation, SEO, Digital Marketing, Web & App, and Platform.",
  keywords: ["clinic marketing services", "AI automation for clinics", "dental practice marketing Houston", "med spa growth services Texas"],
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Our Services | Alliance Tech",
    description: "Browse services by niche: AI Automation, SEO, Digital Marketing, Web & App, and Platform.",
    url: "/services",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
