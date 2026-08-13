"use client";
import { useForm } from "@/context/FormContext";

export default function FinalCTA() {
  const { openForm } = useForm();

  return (
    <section className="final-cta-section relative overflow-hidden py-16 lg:py-20">
      <div aria-hidden className="final-cta-bg absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-[#5ce1ff]">
          ONLY ACCEPTING 10 NEW CLINICS THIS MONTH
        </p>
        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
          Ready to Grow Your Clinic?
        </h2>
        <p className="mx-auto mb-8 max-w-xl leading-relaxed text-[#8eb4c4]">
          After 10,000+ audit hours and 100+ clinics served, we know exactly what
          it takes to fill your appointment book. Start with a free audit —
          minimum 3–6 month engagement.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/free-website-audit"
            data-analytics-label="start_website_audit"
            data-analytics-location="final_cta"
            className="w-full rounded-full bg-gradient-to-r from-[#00B4D8] to-[#0077A8] px-8 py-4 text-center text-base font-bold text-white shadow-[0_0_32px_rgba(0,180,216,0.35)] transition-transform hover:-translate-y-0.5 sm:w-auto"
          >
            Get Your Free Clinic Audit
          </a>
          <a
            href="/pricing"
            data-analytics-label="view_pricing"
            data-analytics-location="final_cta"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#00B4D8]/35 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition-colors hover:border-[#5ce1ff] hover:bg-white/10 sm:w-auto"
          >
            See Plans &amp; Pricing
          </a>
        </div>
        <p className="mt-5 text-sm text-[#8eb4c4]">
          Ready to buy?{" "}
          <button
            type="button"
            onClick={openForm}
            data-analytics-label="book_consultation"
            data-analytics-location="final_cta"
            className="font-semibold text-[#5ce1ff] underline underline-offset-2 hover:text-white"
          >
            Book a free strategy call
          </button>
        </p>
        <p className="mt-6 text-xs text-white/40">
          ★★★★★ Rated 4.9/5 by 100+ clinics across the United States · 3–6 month
          minimum · Results guaranteed
        </p>
      </div>
    </section>
  );
}
