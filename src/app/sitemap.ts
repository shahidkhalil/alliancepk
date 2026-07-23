import type { MetadataRoute } from "next";
import { fetchBlogsForBuild } from "@/lib/fetchBlogsBuild";

export const dynamic = "force-static";

const baseUrl = "https://alliancetechltd.com";

const staticRoutes = [
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
  { path: "/free-website-audit", priority: 0.8 },
  { path: "/business-growth-audit", priority: 0.8 },
  { path: "/contact", priority: 0.5 },
  { path: "/privacy-policy", priority: 0.3 },
  { path: "/terms-of-service", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await fetchBlogsForBuild();
  const blogRoutes = blogs.map((p) => ({
    path: `/blog/${p.slug}`,
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes].map((r) => ({
    url: `${baseUrl}${r.path}`,
    changeFrequency: "monthly" as const,
    priority: r.priority,
  }));
}
