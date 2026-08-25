"use client";
import { useForm } from "@/context/FormContext";

export default function FinalCTA() {
  const { openForm } = useForm();

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
          Ready to Automate Your Clinic?
        </h2>
        <p className="text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
          After 10,000+ audit hours and 100+ clinics automated, we know exactly which workflows
          fill an appointment book. Start with a free automation audit — minimum 3–6 month
          engagement.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/free-website-audit"
            data-analytics-label="start_website_audit"
            data-analytics-location="final_cta"
            className="bg-white text-[#00283C] font-bold px-8 py-4 rounded-md text-base hover:bg-[#E6F4F8] transition-colors w-full sm:w-auto text-center"
          >
            Book a Free Audit
          </a>
          <a
            href="/pricing"
            data-analytics-label="view_pricing"
            data-analytics-location="final_cta"
            className="text-sm font-semibold text-white border border-white/30 px-6 py-4 rounded-md hover:bg-white/10 transition-colors w-full sm:w-auto text-center"
          >
            See Plans & Pricing
          </a>
        </div>
        <p className="mt-6 text-sm text-white/60">
          Ready to buy?{" "}
          <button
            type="button"
            onClick={openForm}
            data-analytics-label="book_consultation"
            data-analytics-location="final_cta"
            className="font-semibold text-[#00B4D8] hover:underline"
          >
            Book a Free Strategy Call
          </button>
        </p>
        <p className="mt-4 text-xs text-white/45">
          ★★★★★ Rated 4.9/5 by 100+ clinics across the United States · Live in 2 weeks · Results
          guaranteed
        </p>
      </div>
    </section>
  );
}
