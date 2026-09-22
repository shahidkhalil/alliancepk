import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageWrapper from "@/components/PageWrapper";
import FinalCTA from "@/components/FinalCTA";
import CaseStudyDetail from "@/components/CaseStudyDetail";
import {
  caseStudies,
  getCaseStudyBySlug,
  getCaseStudySlugs,
} from "@/lib/caseStudies";

export function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const c = getCaseStudyBySlug(params.slug);
  if (!c) return { title: "Case Study | Alliance Tech" };

  const title = `${c.client} Case Study | Alliance Tech`;
  const description = c.tagline;

  return {
    title,
    description,
    alternates: { canonical: `/case-study/${c.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://alliancetechltd.com/case-study/${c.slug}`,
      siteName: "Alliance Tech",
    },
  };
}

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const c = getCaseStudyBySlug(params.slug);
  if (!c) notFound();

  const idx = caseStudies.findIndex((x) => x.slug === c.slug);
  const prev = idx > 0 ? caseStudies[idx - 1] : null;
  const next = idx >= 0 && idx < caseStudies.length - 1 ? caseStudies[idx + 1] : null;

  return (
    <PageWrapper>
      <section className="bg-[#F8FAFC] pt-28 pb-6 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/portfolio#${
              c.type === "Website"
                ? "websites"
                : c.type === "AI Automation"
                ? "ai"
                : c.type === "SEO"
                ? "seo"
                : c.type === "App"
                ? "app"
                : "marketing"
            }`}
            className="text-sm font-semibold text-[#0077A8] hover:text-[#00283C] transition-colors"
          >
            ← Back to Portfolio
          </Link>
        </div>
      </section>

      <section className="bg-[#F8FAFC] pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <CaseStudyDetail c={c} index={idx >= 0 ? idx : 0} />

          <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm font-semibold">
            {prev ? (
              <Link
                href={`/case-study/${prev.slug}`}
                className="text-[#0077A8] hover:text-[#00283C] transition-colors"
              >
                ← {prev.client}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/case-study/${next.slug}`}
                className="text-[#0077A8] hover:text-[#00283C] transition-colors sm:text-right"
              >
                {next.client} →
              </Link>
            ) : (
              <span />
            )}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#00283C] text-white hover:bg-[#0077A8] transition-colors"
            >
              ← All Case Studies
            </Link>
          </div>
        </div>
      </section>

      <FinalCTA />
    </PageWrapper>
  );
}
