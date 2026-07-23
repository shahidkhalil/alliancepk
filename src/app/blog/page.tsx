import type { Metadata } from "next";
import PageWrapper from "@/components/PageWrapper";
import BlogListClient from "@/components/BlogListClient";

export const metadata: Metadata = {
  title: "Clinic Growth Blog | Houston AI Automation, SEO & Booking | Alliance Tech",
  description:
    "SEO-friendly guides for dental and aesthetic clinics: AI receptionists, patient booking automation, and local growth strategies in Houston, TX and across the US.",
  keywords: [
    "Houston clinic marketing blog",
    "AI receptionist Houston",
    "AI automation for clinics",
    "dental clinic SEO Houston",
    "patient booking automation",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Clinic Growth Blog | Alliance Tech",
    description:
      "AI automation, local SEO, and patient booking insights for clinics in Houston and across the United States.",
    url: "https://alliancetechltd.com/blog",
    type: "website",
  },
};

export default function BlogPage() {
  return (
    <PageWrapper>
      <section className="pt-28 pb-12 bg-[#00283C]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Blog</p>
          <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Clinic Growth Across the{" "}
            <span className="text-[#00B4D8]">United States</span>
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
            Location-focused insights for dental and aesthetic clinics — from Houston to New York, Los Angeles to Chicago.
          </p>
        </div>
      </section>

      <section className="py-14 lg:py-16 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-6">
          <BlogListClient />
        </div>
      </section>
    </PageWrapper>
  );
}
