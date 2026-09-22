"use client";
import { usePathname } from "next/navigation";
import { useForm } from "@/context/FormContext";
import { planCtaForPath } from "@/lib/planCta";

export default function FinalCTA() {
  const { openForm } = useForm();
  const pathname = usePathname() || "/";
  const plan = planCtaForPath(pathname);

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[#00283C]" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,180,216,0.2), transparent 70%)",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#00B4D8] mb-5">
          ONLY ACCEPTING 10 NEW CLINICS THIS MONTH
        </p>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4">
          Ready to fill the calendar?
        </h2>
        <p className="text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
          After 10,000+ audit hours and 100+ clinics automated, we know which workflows fill an
          appointment book. Pick the plan for this page and we&apos;ll get you live.
        </p>
        <div className="flex flex-col items-center justify-center gap-4">
          <a
            href={plan.href}
            data-analytics-label="view_service_plans"
            data-analytics-location="final_cta"
            className="bg-white text-[#00283C] font-bold px-8 py-4 rounded-md text-base hover:bg-[#E6F4F8] transition-colors w-full sm:w-auto text-center"
          >
            {plan.label}
          </a>
          <p className="text-sm text-white/70">
            {plan.alt ? (
              <>
                <a href={plan.alt.href} className="font-semibold text-[#00B4D8] hover:underline">
                  {plan.alt.label}
                </a>
                <span aria-hidden> · </span>
              </>
            ) : null}
            <button
              type="button"
              onClick={openForm}
              data-analytics-label="book_consultation"
              data-analytics-location="final_cta"
              className="font-semibold text-[#00B4D8] hover:underline"
            >
              Book a strategy call
            </button>
          </p>
        </div>
        <p className="mt-4 text-xs text-white/45">
          ★★★★★ Rated 4.9/5 by 100+ clinics across the United States · Live in 2 weeks · Results
          guaranteed
        </p>
      </div>
    </section>
  );
}
