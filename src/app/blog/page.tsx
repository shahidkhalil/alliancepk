import type { Metadata } from "next";
import PageWrapper from "@/components/PageWrapper";
import BlogListClient from "@/components/BlogListClient";
import { fetchBlogsForBuild } from "@/lib/fetchBlogsBuild";

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

export default async function BlogPage() {
  const initialPosts = await fetchBlogsForBuild();

  return (
    <PageWrapper>
      <section className="relative overflow-hidden bg-[#021016] pt-28 pb-14">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(0,180,216,0.2), transparent 55%), linear-gradient(180deg, #041820 0%, #021016 100%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#5ce1ff]">Blog</p>
          <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white lg:text-5xl">
            Clinic Growth Across the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7DD3EA] to-[#00B4D8]">
              United States
            </span>
          </h1>
          <p className="mx-auto max-w-2xl leading-relaxed text-[#8eb4c4]">
            Location-focused insights for dental and aesthetic clinics — from Houston to New York, Los Angeles to Chicago.
          </p>
        </div>
      </section>

      <section className="py-14 lg:py-16 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-6">
          <BlogListClient initialPosts={initialPosts} />
        </div>
      </section>
    </PageWrapper>
  );
}
