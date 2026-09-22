"use client";
import { usePathname } from "next/navigation";
import { useForm } from "@/context/FormContext";
import { BreadcrumbSchema, ServiceSchema } from "@/components/StructuredData";
import { planCtaForPath } from "@/lib/planCta";

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
  ctaText,
  ctaHref,
}: Props) {
  const { openForm } = useForm();
  const pathname = usePathname() || "/";
  const plan = planCtaForPath(pathname);
  const primaryHref = ctaHref ?? plan.href;
  const primaryLabel = ctaText ?? plan.label;

  return (
    <>
      <ServiceSchema name={`${headline} ${highlight}`} description={subheadline} path={pathname} />
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: `${headline} ${highlight}`, path: pathname },
        ]}
      />
      <section className="relative bg-white border-b border-gray-100 pt-24 pb-10 sm:pt-28 sm:pb-14">
        <div className="relative max-w-3xl mx-auto px-6">
          <span className="badge-light mb-4 max-w-full text-[10px] sm:text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] flex-shrink-0" />
            <span className="truncate">{badge}</span>
          </span>

          <h1 className="text-[1.85rem] sm:text-5xl font-extrabold text-[#00283C] tracking-tight leading-[1.15] mb-4">
            {headline}
            <span className="block text-[#0077A8]">{highlight}</span>
          </h1>

          <p className="text-[15px] sm:text-lg text-gray-600 max-w-2xl mb-7 leading-relaxed">{subheadline}</p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <a
              href={primaryHref}
              data-analytics-label={primaryLabel}
              data-analytics-location="service_hero"
              className="btn-dark px-6 py-3.5 text-sm sm:text-base text-center w-full sm:w-auto"
            >
              {primaryLabel}
            </a>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              {!ctaHref && plan.alt ? (
                <a href={plan.alt.href} className="font-semibold text-[#0077A8] hover:underline">
                  {plan.alt.label}
                </a>
              ) : null}
              <button
                type="button"
                onClick={openForm}
                data-analytics-label="book_consultation"
                data-analytics-location="service_hero"
                className="font-semibold text-[#0077A8] hover:underline text-left"
              >
                Book a strategy call
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
