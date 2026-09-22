/** Primary “buy this” link for a page, so the close matches what the visitor is reading. */
export function planCtaForPath(pathname: string): {
  href: string;
  label: string;
  alt?: { href: string; label: string };
} {
  const p = pathname || "/";
  if (p.startsWith("/seo-for-clinics")) return { href: "/pricing#seo", label: "See SEO plans" };
  if (p.startsWith("/local-seo-for-clinics")) return { href: "/pricing#local-seo", label: "See Local SEO plans" };
  if (
    p.startsWith("/digital-marketing-for-clinics") ||
    p.startsWith("/dental-clinic-growth") ||
    p.startsWith("/aesthetic-clinic-growth")
  ) {
    return {
      href: "/pricing#google-ads",
      label: "See Google Ads plans",
      alt: { href: "/pricing#meta-ads", label: "See Meta Ads plans" },
    };
  }
  if (p.startsWith("/clinic-website-design")) return { href: "/pricing#healthcare-website", label: "See website plans" };
  if (p.startsWith("/clinic-mobile-app")) return { href: "/pricing#mobile-app", label: "See app plans" };
  if (p.startsWith("/ehr-platform")) return { href: "/pricing#emr-ehr", label: "See EHR plans" };
  if (p.startsWith("/whatsapp-ai-automation")) return { href: "/pricing#whatsapp-automation", label: "See WhatsApp plans" };
  if (
    p.startsWith("/services") ||
    p.startsWith("/products") ||
    p.startsWith("/portfolio") ||
    p.startsWith("/blog") ||
    p.startsWith("/case-study") ||
    p.startsWith("/about")
  ) {
    return { href: "/pricing", label: "See plans & pricing" };
  }
  return { href: "/pricing#ai-automation", label: "See Maya plans" };
}
