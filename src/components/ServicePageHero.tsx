"use client";
import { usePathname } from "next/navigation";
import { useForm } from "@/context/FormContext";
import { ArrowLeft } from "lucide-react";
import { BreadcrumbSchema, ServiceSchema } from "@/components/StructuredData";

interface Props {
  badge: string;
  headline: string;
  highlight: string;
  subheadline: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function ServicePageHero({
  badge,
  headline,
  highlight,
  subheadline,
  ctaText = "Book a Free Strategy Call",
  ctaHref = "/free-website-audit",
}: Props) {
  const { openForm } = useForm();
  const pathname = usePathname();

  return (
    <>
      <ServiceSchema name={`${headline} ${highlight}`} description={subheadline} path={pathname} />
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: `${headline} ${highlight}`, path: pathname },
        ]}
      />
      <section className="relative pt-24 sm:pt-32 pb-10 sm:pb-16 bg-white border-b border-gray-100 overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(0,40,60,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,40,60,0.035) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      {/* Teal glow top-right */}
      <div className="absolute top-0 right-0 w-[min(500px,120%)] h-[350px] rounded-full pointer-events-none opacity-[0.07]"
        style={{ background: "radial-gradient(circle, #00B4D8, transparent 70%)", filter: "blur(80px)" }} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 w-full min-w-0">
        <div>
          <span className="badge-light mb-4 sm:mb-5 max-w-full text-[10px] sm:text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] animate-pulse flex-shrink-0" />
            <span className="truncate">{badge}</span>
          </span>

          <h1 className="text-[1.65rem] sm:text-4xl lg:text-5xl font-extrabold text-[#00283C] tracking-tight leading-snug sm:leading-tight mb-4 sm:mb-5 mt-2 sm:mt-3">
            {headline}{" "}
            <span className="text-[#0077A8]">{highlight}</span>
          </h1>

          <p className="text-[15px] sm:text-lg text-gray-600 max-w-2xl mb-7 sm:mb-10 leading-relaxed">{subheadline}</p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {ctaHref ? (
              <a
                href={ctaHref}
                data-analytics-label={ctaText}
                data-analytics-location="service_hero"
                className="btn-dark px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base text-center"
              >
                {ctaText}
              </a>
            ) : (
              <button
                onClick={openForm}
                data-analytics-label="book_consultation"
                data-analytics-location="service_hero"
                className="btn-dark px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base"
              >
                {ctaText}
              </button>
            )}
            <a href="/" className="inline-flex items-center justify-center sm:justify-start gap-2 text-sm font-semibold text-gray-600 hover:text-[#00283C] transition-colors py-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </a>
          </div>
        </div>
      </div>
      </section>
    </>
  );
}
