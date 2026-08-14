"use client";
import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Check, X, ChevronDown, Clock, Cpu, Shield, Star } from "lucide-react";
import { ServicePricing } from "@/lib/pricingData";
import PremiumPricingCarousel from "@/components/PremiumPricingCarousel";

/* ─── Comparison Table ─────────────────────────────────────────────────────── */
function ComparisonTable({ service }: { service: ServicePricing }) {
  const [open, setOpen] = useState(false);
  if (!service.comparison.length || service.fixedPrice || service.packages.length < 3) {
    return null;
  }

  return (
    <div className="service-compare mt-8 overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="service-compare-trigger flex w-full items-center justify-between px-5 py-4"
      >
        <span className="text-sm font-bold text-[#00283C]">Compare all features</span>
        <ChevronDown className={`w-4 h-4 text-[#0077A8] transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="table"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-4 bg-[#00283C]">
              <div className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/60">Feature</div>
              {service.packages.slice(0, 3).map((pkg, i) => (
                <div key={pkg.name} className={`px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest ${i === 1 ? "text-[#00B4D8]" : "text-white/60"}`}>
                  {pkg.name}
                </div>
              ))}
            </div>
            {service.comparison.map((row, i) => (
              <div key={row.feature} className={`service-compare-row grid grid-cols-4 ${i % 2 === 0 ? "service-compare-row--even" : ""}`}>
                <div className="px-5 py-3 text-sm text-gray-600">{row.feature}</div>
                {([row.basic, row.standard, row.premium] as (string | boolean)[]).map((v, vi) => (
                  <div key={vi} className="px-4 py-3 flex items-center justify-center">
                    {v === true  ? <Check className="w-4 h-4 text-[#0077A8]" strokeWidth={2.5} /> :
                     v === false ? <X     className="w-4 h-4 text-gray-300"  strokeWidth={2}   /> :
                     <span className={`text-xs font-medium text-center leading-snug ${vi === 1 ? "text-[#00283C] font-semibold" : "text-gray-500"}`}>{v}</span>}
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── FAQ ───────────────────────────────────────────────────────────────────── */
function FAQSection({ faqs }: { faqs: ServicePricing["faqs"] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="service-pricing-faq mt-10">
      <h3 className="text-sm font-black text-[#00283C] mb-4 uppercase tracking-widest">Common Questions</h3>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className={`service-faq-item overflow-hidden rounded-xl ${open === i ? "service-faq-item--open" : ""}`}>
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-start justify-between px-5 py-4 text-left gap-4"
            >
              <span className="text-sm font-semibold text-[#00283C] leading-snug">{faq.q}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform duration-200 ${open === i ? "rotate-180 text-[#0077A8]" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div key="ans" initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.22, ease: "easeInOut" }} className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Trust signals ─────────────────────────────────────────────────────────── */
function TrustBar({ service }: { service: ServicePricing }) {
  const items = [
    { icon: Clock,  label: "Delivery",   value: service.timeline },
    { icon: Cpu,    label: "Tech Stack",  value: service.technologies.slice(0, 3).join(", ") + (service.technologies.length > 3 ? " …" : "") },
    { icon: Shield, label: "Support",     value: service.support },
    ...(service.guarantee ? [{ icon: Star, label: "Guarantee", value: service.guarantee }] : []),
  ];
  return (
    <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="service-trust-card flex gap-3 rounded-xl p-4">
          <span className="service-trust-icon">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
            <p className="text-xs text-gray-600 leading-relaxed">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main export ───────────────────────────────────────────────────────────── */
export default function ServicePricingSection({ service }: { service: ServicePricing }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="service-pricing-block">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4 }}>
        <div className="mb-7">
          <span className="service-pricing-badge mb-3 inline-block">
            {service.category}
          </span>
          <h2 className="text-2xl lg:text-3xl font-black text-[#00283C] tracking-tight mb-2">
            {service.name}
          </h2>
          <p className="text-gray-500 text-sm max-w-2xl leading-relaxed">{service.tagline}</p>
        </div>

        <PremiumPricingCarousel service={service} />

        {service.fixedPrice && (
          <p className="mt-4 text-center text-xs text-gray-400 max-w-lg mx-auto">
            AI Receptionist (live front desk) is sold separately — see that product for chat, WhatsApp answering, and voice.
          </p>
        )}

        <ComparisonTable service={service} />
        <TrustBar service={service} />
        <FAQSection faqs={service.faqs} />
      </motion.div>
    </div>
  );
}
