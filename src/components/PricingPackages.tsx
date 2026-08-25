"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Check } from "lucide-react";
import { pricingServices } from "@/lib/pricingData";
import { AnimatedLinkCard, ServiceCardArrow, StaggerGrid } from "@/components/ui/Card";

// Headline services shown as a homepage preview — full list lives on /pricing.
const FEATURED_IDS = ["ai-automation", "healthcare-website", "local-seo", "google-ads"];

// Table layout is sm+ only — phones get the stacked card list instead.
const COLS = "grid grid-cols-[1fr_110px_140px_110px] lg:grid-cols-[1fr_150px_180px_150px]";

export default function PricingPackages() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const featured = FEATURED_IDS
    .map((id) => pricingServices.find((s) => s.id === id))
    .filter(Boolean) as typeof pricingServices;

  return (
    <section
      ref={ref}
      id="pricing"
      className="relative py-20 lg:py-28 bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] overflow-hidden"
    >
      {/* Soft ambient accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[360px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(0,119,168,0.06) 0%, transparent 70%)" }}
      />

      <div className="relative max-w-5xl mx-auto px-6">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <span className="badge-light mb-6">PRICING</span>

          <h2 className="text-3xl lg:text-5xl font-extrabold text-[#00283C] tracking-tight leading-tight mt-6 mb-4">
            Every Price, <span className="gradient-heading">Published Upfront.</span>
          </h2>

          <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed mb-8">
            {pricingServices.length} services · clear published prices · no hidden quotes.
            <span className="block text-sm text-gray-400 mt-1">A few of our most popular below — see all {pricingServices.length} on the pricing page.</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5">
            {["No hidden fees", "Cancel anytime", "You own everything", "US-market pricing"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                <span className="w-4 h-4 rounded-full bg-[#00B4D8]/10 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-[#0077A8]" strokeWidth={3} />
                </span>
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Mobile: stacked cards (the 4-col table can't fit a phone) ── */}
        <StaggerGrid className="sm:hidden space-y-4">
          {featured.map((service) => (
            <AnimatedLinkCard
              key={service.id}
              href={`/pricing#${service.id}`}
              skipEntrance
              className="block shadow-md overflow-hidden"
            >
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-[#00283C] leading-snug">{service.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">{service.category}</p>
                  </div>
                  {service.id === "ai-automation" && (
                    <span className="flex-shrink-0 text-[9px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#F97316] to-[#EF4444] px-1.5 py-0.5 rounded-full">🔥 Hot</span>
                  )}
                </div>
              </div>
              <div className={`grid border-t border-gray-100 ${service.packages.length === 1 ? "grid-cols-1" : "grid-cols-3"}`}>
                {service.packages.map((pkg, pi) => (
                  <div
                    key={pkg.name}
                    className={`py-3 px-1 flex flex-col items-center justify-center text-center ${pi === 1 || service.packages.length === 1 ? "bg-[#0077A8]/[0.06]" : ""} ${pi > 0 ? "border-l border-gray-100" : ""}`}
                  >
                    <span className={`text-[9px] font-black uppercase tracking-wider mb-1 ${pi === 1 || service.packages.length === 1 ? "text-[#0077A8]" : "text-gray-400"}`}>
                      {service.fixedPrice ? "Fixed" : pkg.name}
                    </span>
                    <span className={`text-sm font-extrabold leading-none ${pi === 1 || service.packages.length === 1 ? "text-[#0077A8]" : "text-[#00283C]"}`}>
                      {pkg.price}
                    </span>
                    <span className={`text-[9px] mt-1 leading-none ${pi === 1 || service.packages.length === 1 ? "text-[#0077A8]/60" : "text-gray-400"}`}>
                      {pkg.period === "one-time" ? "one-time" : pkg.period.replace("/ month + ad spend", "+spend")}
                    </span>
                  </div>
                ))}
              </div>
            </AnimatedLinkCard>
          ))}

          <AnimatedLinkCard href="/pricing" skipEntrance className="bg-[#F8FAFC] border border-gray-200 px-4 py-4">
            <span className="flex items-center justify-between gap-2 text-sm font-bold text-[#0077A8]">
              View all {pricingServices.length} services &amp; pricing
              <ServiceCardArrow className="text-[#0077A8] opacity-100 translate-x-0" />
            </span>
          </AnimatedLinkCard>
        </StaggerGrid>

        {/* ── Pricing matrix (sm and up) ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.12 }}
          className="hidden sm:block rounded-2xl overflow-hidden bg-white border border-gray-200/80 shadow-xl shadow-gray-200/50"
        >
          {/* Column labels */}
          <div className={`${COLS} bg-[#00283C]`}>
            <div className="px-5 lg:px-6 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
              Service
            </div>
            {(["Basic", "Standard", "Premium"] as const).map((tier, i) => (
              <div key={tier} className={`py-4 text-center relative ${i === 1 ? "bg-[#0077A8]" : ""}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${i === 1 ? "text-white" : "text-white/60"}`}>
                  {tier}
                </p>
                {i === 1 && (
                  <p className="text-[8px] text-white/70 font-bold mt-0.5 tracking-wide">★ MOST POPULAR</p>
                )}
              </div>
            ))}
          </div>

          {/* Featured service rows */}
          {featured.map((service, si) => (
            <motion.a
              key={service.id}
              href={`/pricing#${service.id}`}
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.18 + si * 0.05, duration: 0.35 }}
              className={`group ${COLS} border-t border-gray-100 hover:bg-[#F8FAFC] transition-colors duration-150`}
            >
              {/* Service name */}
              <div className="px-5 lg:px-6 py-5 flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#00283C] truncate">{service.name}</span>
                  {service.id === "ai-automation" && (
                    <span className="flex-shrink-0 text-[9px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#F97316] to-[#EF4444] px-1.5 py-0.5 rounded-full">🔥 Hot</span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-[#0077A8] flex-shrink-0 translate-x-[-4px] group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">{service.category}</span>
              </div>

              {/* Package prices — fixed-price products span the middle column */}
              {service.fixedPrice || service.packages.length === 1 ? (
                <>
                  <div className="py-5" />
                  <div className="py-5 flex flex-col items-center justify-center text-center px-1 bg-[#0077A8]/[0.06]">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#0077A8] mb-1">
                      Fixed
                    </span>
                    <span className="text-sm font-extrabold leading-none text-[#0077A8]">
                      {service.packages[0].price}
                    </span>
                    <span className="text-[10px] mt-1 leading-none text-[#0077A8]/60">
                      {service.packages[0].period === "one-time"
                        ? "one-time"
                        : service.packages[0].period.replace("/ month + ad spend", "+spend")}
                    </span>
                  </div>
                  <div className="py-5" />
                </>
              ) : (
                service.packages.map((pkg, pi) => (
                  <div
                    key={pkg.name}
                    className={`py-5 flex flex-col items-center justify-center text-center px-1 ${pi === 1 ? "bg-[#0077A8]/[0.06]" : ""}`}
                  >
                    <span className={`text-sm font-extrabold leading-none ${pi === 1 ? "text-[#0077A8]" : "text-[#00283C]"}`}>
                      {pkg.price}
                    </span>
                    <span className={`text-[10px] mt-1 leading-none ${pi === 1 ? "text-[#0077A8]/60" : "text-gray-400"}`}>
                      {pkg.period === "one-time" ? "one-time" : pkg.period.replace("/ month + ad spend", "+spend")}
                    </span>
                  </div>
                ))
              )}
            </motion.a>
          ))}

          {/* View-all bar */}
          <a href="/pricing" className={`${COLS} border-t border-gray-200 bg-[#F8FAFC] hover:bg-[#F1F6F9] transition-colors group`}>
            <div className="px-5 lg:px-6 py-5">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-[#0077A8] group-hover:text-[#00283C] transition-colors duration-150">
                View all {pricingServices.length} services &amp; full pricing
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <p className="text-gray-400 text-xs mt-1">Features, comparisons, timelines &amp; FAQs.</p>
            </div>
            <div />
            <div className="bg-[#0077A8]/[0.06]" />
            <div />
          </a>
        </motion.div>

        {/* ── CTA strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.45 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl px-7 py-6 bg-[#00283C]"
        >
          <div className="text-center sm:text-left">
            <p className="text-white font-extrabold text-base">Not sure which plan is right?</p>
            <p className="text-white/60 text-sm mt-0.5">Book a free 30-min call — we&apos;ll recommend the exact fit.</p>
          </div>
          <a
            href="/pricing"
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-white text-[#00283C] hover:bg-[#9FD3E8] transition-colors duration-200 shadow-lg"
          >
            View Full Pricing <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>

      </div>
    </section>
  );
}
