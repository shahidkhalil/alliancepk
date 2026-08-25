"use client";
import { useForm } from "@/context/FormContext";

export default function FinalCTA() {
  const { openForm } = useForm();

  return (
    <section className="py-16 lg:py-20 bg-[#00283C]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-sm font-bold text-white/80 uppercase tracking-widest mb-4">ONLY ACCEPTING 10 NEW CLINICS THIS MONTH</p>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4">
          Ready to Grow Your Clinic?
        </h2>
        <p className="text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
          After 10,000+ audit hours and 100+ clinics served, we know exactly what it takes to fill your appointment book. Start with a free audit — minimum 3–6 month engagement.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/free-website-audit"
            data-analytics-label="start_website_audit"
            data-analytics-location="final_cta"
            className="bg-white text-[#00283C] font-bold px-8 py-4 rounded-md text-base hover:bg-gray-100 transition-colors w-full sm:w-auto text-center"
          >
            Get Your Free Clinic Audit
          </a>
          <a
            href="/pricing"
            data-analytics-label="view_pricing"
            data-analytics-location="final_cta"
            className="flex items-center gap-2 text-sm font-semibold text-white border border-white/30 px-6 py-4 rounded-md hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
          >
            See Plans &amp; Pricing
          </a>
        </div>
        <p className="text-white/70 text-sm mt-5">
          Ready to buy?{" "}
          <button
            type="button"
            onClick={openForm}
            data-analytics-label="book_consultation"
            data-analytics-location="final_cta"
            className="font-semibold text-white underline underline-offset-2 hover:text-[#9FD3E8]"
          >
            Book a free strategy call
          </button>
        </p>
        <p className="text-white/75 text-xs mt-6">★★★★★ Rated 4.9/5 by 100+ clinics across the United States · 3–6 month minimum · Results guaranteed</p>
      </div>
    </section>
  );
}
