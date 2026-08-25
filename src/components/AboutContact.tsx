"use client";

import { ArrowRight, CalendarCheck2, Mail, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "@/context/FormContext";
import { trackEmailClick } from "@/lib/analytics";
import {
  BUSINESS_ADDRESS_LINE,
  BUSINESS_ADDRESS_MAPS_HREF,
  SALES_EMAIL,
} from "@/lib/siteContact";

const nextSteps = [
  "Choose an available 30-minute time in Central Time.",
  "Tell us your clinic type and the biggest growth bottleneck.",
  "Get an instant confirmation and calendar reservation.",
];

export default function AboutContact() {
  const { openForm } = useForm();

  return (
    <section
      id="contact"
      className="py-16 lg:py-24 scroll-mt-24 border-t border-[#E8EEF2]"
      style={{
        background:
          "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(0,180,216,0.08), transparent 55%), #FFFFFF",
      }}
    >
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="overflow-hidden rounded-[1.75rem] border border-[#DCEAF0] bg-white shadow-[0_24px_60px_-34px_rgba(0,40,60,0.32)]"
        >
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="p-8 sm:p-10 lg:p-12">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F7FB] border border-[#D6EEF5] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0077A8] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]" aria-hidden />
                Let&apos;s talk
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight leading-tight mb-4">
                Pick a time. Get a clear plan.
              </h2>
              <p className="text-[#00283C]/60 text-sm sm:text-base leading-relaxed mb-7 max-w-lg">
                Book one focused call about missed inquiries, weak search visibility, or booking friction.
                We&apos;ll show you the highest-impact place to start.
              </p>

              <button
                type="button"
                onClick={openForm}
                data-analytics-label="book_consultation"
                data-analytics-location="about_contact"
                className="min-h-[52px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#00283C] px-7 text-sm font-black text-white shadow-[0_10px_24px_-10px_rgba(0,40,60,0.45)] hover:bg-[#003D5C] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0077A8]/25 transition-colors"
              >
                Choose Date &amp; Time
                <ArrowRight className="w-4 h-4" aria-hidden />
              </button>
              <p className="text-xs text-[#00283C]/40 mt-3">
                Free 30-minute call · Confirmed instantly · No obligation
              </p>
            </div>

            <div className="bg-[#F5FAFC] border-t lg:border-t-0 lg:border-l border-[#E8EEF2] p-8 sm:p-10 lg:p-12 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-[#E0F4F9] flex items-center justify-center mb-5">
                <CalendarCheck2 className="w-5 h-5 text-[#0077A8]" aria-hidden />
              </div>
              <h3 className="text-lg font-black text-[#00283C] mb-5">What happens next</h3>
              <ol className="space-y-4">
                {nextSteps.map((step, index) => (
                  <li key={step} className="flex gap-3.5">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-[#D6EEF5] text-[#0077A8] text-[11px] font-black flex items-center justify-center mt-px">
                      {index + 1}
                    </span>
                    <span className="text-sm text-[#00283C]/60 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-8 pt-6 border-t border-[#DCEAF0] space-y-3 text-xs text-[#00283C]/50">
                <p className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#0077A8] flex-shrink-0" aria-hidden />
                  <a
                    href={`mailto:${SALES_EMAIL}`}
                    onClick={() => trackEmailClick("about_contact")}
                    className="font-semibold text-[#00283C] hover:text-[#0077A8] transition-colors break-all"
                  >
                    {SALES_EMAIL}
                  </a>
                </p>
                <p className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#0077A8] flex-shrink-0 mt-0.5" aria-hidden />
                  <a
                    href={BUSINESS_ADDRESS_MAPS_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#0077A8] transition-colors"
                  >
                    {BUSINESS_ADDRESS_LINE}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
