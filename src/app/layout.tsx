import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import { OrganizationSchema } from "@/components/StructuredData";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

/** Public GA4 measurement ID — also present in initial HTML so Google can detect the tag. */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-TR2J78K3F0";

export const metadata: Metadata = {
  metadataBase: new URL("https://alliancetechltd.com"),
  title: "AI Automation & Growth for Clinics in Houston, TX | Alliance Tech",
  description:
    "Houston's AI automation agency for dental & med spa clinics: AI receptionists, WhatsApp agents, and patient acquisition that fill your calendar across Texas. Book a free audit.",
  alternates: { canonical: "/" },
  keywords: [
    "AI automation for clinics",
    "AI receptionist Houston",
    "dental clinic marketing Houston",
    "dental marketing agency Texas",
    "med spa marketing Houston",
    "WhatsApp AI agent",
    "healthcare automation Texas",
    "patient acquisition",
    "Alliance Tech",
  ],
  authors: [{ name: "Alliance Tech" }],
  openGraph: {
    title: "AI Automation & Growth for Clinics in Houston, TX | Alliance Tech",
    description:
      "Get more patients, automate your front desk with AI, and grow revenue — Houston-based, serving clinics across Texas.",
    type: "website",
    url: "https://alliancetechltd.com",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Alliance Tech (PVT) LTD" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alliance Tech | AI Healthcare Growth",
    description: "AI-powered growth solutions for dental and aesthetic clinics.",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A2540",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* GA4 in initial HTML (detectable by Google). Storage stays denied until consent. */}
        <script
          id="alliance-ga-consent"
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500
});
gtag('js', new Date());
gtag('config', '${GA_ID}', {
  send_page_view: false,
  anonymize_ip: true,
  allow_google_signals: false
});
            `.trim(),
          }}
        />
        <script
          async
          id="alliance-ga4"
          src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`}
        />
      </head>
      <body className="antialiased">
        <OrganizationSchema />
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
