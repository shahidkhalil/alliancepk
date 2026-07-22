import type { MetadataRoute } from "next";

const baseUrl = "https://alliancetechltd.com";

const routes = [
  { path: "", priority: 1.0 },
  { path: "/services", priority: 0.9 },
  { path: "/digital-marketing-for-clinics", priority: 0.8 },
  { path: "/clinic-website-design", priority: 0.8 },
  { path: "/clinic-mobile-app", priority: 0.8 },
  { path: "/seo-for-clinics", priority: 0.8 },
  { path: "/local-seo-for-clinics", priority: 0.8 },
  { path: "/ai-receptionist", priority: 0.9 },
  { path: "/whatsapp-ai-automation", priority: 0.8 },
  { path: "/ehr-platform", priority: 0.8 },
  { path: "/dental-clinic-growth", priority: 0.7 },
  { path: "/aesthetic-clinic-growth", priority: 0.7 },
  { path: "/dental-clinic-houston", priority: 0.7 },
  { path: "/about", priority: 0.5 },
  { path: "/our-mission", priority: 0.5 },
  { path: "/portfolio", priority: 0.7 },
  { path: "/pricing", priority: 0.9 },
  { path: "/blog", priority: 0.8 },
  { path: "/blog/houston-ai-receptionist-smart-appointment-reminders", priority: 0.8 },
  { path: "/blog/free-business-growth-audit-houston-texas-clinics", priority: 0.8 },
  { path: "/blog/how-clinics-get-more-patients-houston-texas", priority: 0.8 },
  { path: "/blog/houston-ai-receptionist-for-clinics", priority: 0.8 },
  { path: "/blog/houston-ai-automation-patient-booking", priority: 0.8 },
  { path: "/blog/houston-dental-clinic-marketing", priority: 0.7 },
  { path: "/blog/new-york-clinic-patient-growth", priority: 0.7 },
  { path: "/blog/los-angeles-aesthetic-clinic-seo", priority: 0.7 },
  { path: "/blog/chicago-dental-marketing-guide", priority: 0.7 },
  { path: "/free-website-audit", priority: 0.8 },
  { path: "/business-growth-audit", priority: 0.8 },
  { path: "/contact", priority: 0.5 },
  { path: "/privacy-policy", priority: 0.3 },
  { path: "/terms-of-service", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    changeFrequency: "monthly",
    priority: r.priority,
  }));
}
