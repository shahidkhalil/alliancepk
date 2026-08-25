"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  Check,
  Zap,
  Star,
  Bot,
  Globe2,
  MapPin,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import { pricingServices } from "@/lib/pricingData";

const FEATURED_IDS = ["ai-automation", "healthcare-website", "local-seo", "google-ads"];

const SERVICE_ICONS: Record<string, LucideIcon> = {
  "ai-automation": Bot,
  "healthcare-website": Globe2,
  "local-seo": MapPin,
  "google-ads": Megaphone,
};

const COLS =
  "grid grid-cols-[1fr_110px_140px_110px] lg:grid-cols-[1fr_150px_180px_150px]";

const trustItems = [
  "No hidden fees",
  "Cancel anytime",
  "You own everything",
  "US-market pricing",
];

const tiers = ["Basic", "Standard", "Premium"] as const;

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function PricingPackages() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const reduceMotion = useReducedMotion();
  const [activeTier, setActiveTier] = useState(1); // Standard
  const [scanRow, setScanRow] = useState(-1);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const featured = FEATURED_IDS.map((id) =>
    pricingServices.find((s) => s.id === id)
  ).filter(Boolean) as typeof pricingServices;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!inView || reduceMotion || isMobile) {
      if (reduceMotion) setScanRow(featured.length);
      return;
    }
    let cancelled = false;
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      setScanRow(i);
      i += 1;
      if (i <= featured.length) {
        timer = setTimeout(tick, 420);
      }
    };
    let timer = setTimeout(tick, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [inView, reduceMotion, isMobile, featured.length]);

  return (
    <section
      ref={ref}
      id="pricing"
      className="pricing-section relative overflow-x-clip py-20 lg:py-28"
    >
      <div aria-hidden className="pricing-bg absolute inset-0" />
      <div aria-hidden className="pricing-glow absolute" />
      <div aria-hidden className="pricing-grid absolute inset-0" />
      <div aria-hidden className="pricing-dots absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="mb-14 text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: easeOut }}
            className="pricing-badge mb-6 inline-flex items-center gap-2"
          >
            <span className="pricing-badge-dot" />
            PRICING
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.08, ease: easeOut }}
            className="mt-6 mb-4 text-3xl font-extrabold leading-tight tracking-tight text-white lg:text-5xl"
          >
            Every Price,{" "}
            <span className="gradient-heading">Published Upfront.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.14, ease: easeOut }}
            className="mx-auto mb-8 max-w-lg text-base leading-relaxed text-[#8eb4c4]"
          >
            {pricingServices.length} services · clear published prices · no
            hidden quotes.
            <span className="mt-1 block text-sm italic text-white/45">
              A few of our most popular below — see all {pricingServices.length}{" "}
              on the pricing page.
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.2, ease: easeOut }}
            className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5"
          >
            {trustItems.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1.5 text-sm font-medium text-[#8eb4c4]"
              >
                <span className="pricing-check">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Interactive tier chips — innovative highlight control */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.24, ease: easeOut }}
          className="pricing-tier-switch mb-6 hidden justify-center gap-2 sm:flex"
          role="tablist"
          aria-label="Highlight pricing tier"
        >
          {tiers.map((tier, i) => (
            <button
              key={tier}
              type="button"
              role="tab"
              aria-selected={activeTier === i}
              onClick={() => setActiveTier(i)}
              className={`pricing-tier-chip ${
                activeTier === i ? "pricing-tier-chip--active" : ""
              }`}
            >
              {i === 1 && <Star className="h-3 w-3" fill="currentColor" strokeWidth={0} />}
              {tier}
            </button>
          ))}
        </motion.div>

        {/* Mobile cards */}
        <div className="space-y-4 sm:hidden">
          {featured.map((service, si) => {
            const Icon = SERVICE_ICONS[service.id] ?? Bot;
            return (
              <motion.a
                key={service.id}
                href={`/pricing#${service.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  delay: reduceMotion ? 0 : 0.15 + si * 0.08,
                  duration: 0.5,
                  ease: easeOut,
                }}
                className="pricing-mobile-card block overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2 px-4 pb-3 pt-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="pricing-svc-icon">
                      <Icon className="h-4 w-4" strokeWidth={1.9} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold leading-snug text-white">
                        {service.name}
                      </p>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-white/45">
                        {service.category}
                      </p>
                    </div>
                  </div>
                  {service.id === "ai-automation" && (
                    <span className="pricing-hot flex-shrink-0">
                      <Zap className="h-3 w-3" strokeWidth={2.4} /> Hot
                    </span>
                  )}
                </div>
                <div
                  className={`grid border-t border-[#00283C]/08 ${
                    service.packages.length === 1
                      ? "grid-cols-1"
                      : "grid-cols-3"
                  }`}
                >
                  {service.packages.map((pkg, pi) => (
                    <div
                      key={pkg.name}
                      className={`flex flex-col items-center justify-center px-1 py-3 text-center ${
                        pi === 1 || service.packages.length === 1
                          ? "bg-[#0077A8]/[0.07]"
                          : ""
                      } ${pi > 0 ? "border-l border-[#00283C]/06" : ""}`}
                    >
                      <span
                        className={`mb-1 text-[9px] font-black uppercase tracking-wider ${
                          pi === 1 || service.packages.length === 1
                            ? "text-[#0077A8]"
                            : "text-white/45"
                        }`}
                      >
                        {service.fixedPrice ? "Fixed" : pkg.name}
                      </span>
                      <span
                        className={`text-sm font-extrabold leading-none ${
                          pi === 1 || service.packages.length === 1
                            ? "text-[#0077A8]"
                            : "text-white"
                        }`}
                      >
                        {pkg.price}
                      </span>
                      <span
                        className={`mt-1 text-[9px] leading-none ${
                          pi === 1 || service.packages.length === 1
                            ? "text-[#0077A8]/60"
                            : "text-white/45"
                        }`}
                      >
                        {pkg.period === "one-time"
                          ? "one-time"
                          : pkg.period.replace("/ month + ad spend", "+spend")}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.a>
            );
          })}

          <motion.a
            href="/pricing"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="pricing-mobile-card flex items-center justify-between gap-2 px-4 py-4"
          >
            <span className="text-sm font-bold text-[#0077A8]">
              View all {pricingServices.length} services &amp; pricing
            </span>
            <ArrowRight className="h-4 w-4 text-[#0077A8]" />
          </motion.a>
        </div>

        {/* Desktop / tablet matrix */}
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.18, duration: 0.65, ease: easeOut }}
          className="pricing-matrix hidden overflow-hidden sm:block"
          data-active-tier={activeTier}
        >
          <div className={`${COLS} pricing-matrix-head`}>
            <div className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-white/55 lg:px-6">
              Service
            </div>
            {tiers.map((tier, i) => (
              <button
                key={tier}
                type="button"
                onClick={() => setActiveTier(i)}
                className={`relative py-4 text-center transition-colors ${
                  activeTier === i ? "pricing-col-head--active" : ""
                }`}
              >
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.16em] ${
                    activeTier === i ? "text-white" : "text-white/55"
                  }`}
                >
                  {tier}
                </p>
                {i === 1 && (
                  <p className="mt-0.5 flex items-center justify-center gap-1 text-[8px] font-bold tracking-wide text-white/75">
                    <Star className="h-2.5 w-2.5" fill="currentColor" strokeWidth={0} />
                    MOST POPULAR
                  </p>
                )}
              </button>
            ))}
          </div>

          {featured.map((service, si) => {
            const Icon = SERVICE_ICONS[service.id] ?? Bot;
            const scanned = scanRow >= si;
            const isHovered = hoveredRow === service.id;

            return (
              <motion.a
                key={service.id}
                href={`/pricing#${service.id}`}
                initial={{
                  opacity: 0,
                  x: reduceMotion ? 0 : -24,
                }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  delay: reduceMotion ? 0 : 0.22 + si * 0.1,
                  duration: 0.55,
                  ease: easeOut,
                }}
                onPointerEnter={() => setHoveredRow(service.id)}
                onPointerLeave={() =>
                  setHoveredRow((p) => (p === service.id ? null : p))
                }
                className={`group pricing-row ${COLS} ${
                  scanned ? "pricing-row--scanned" : ""
                } ${isHovered ? "pricing-row--hover" : ""}`}
              >
                <div className="flex min-w-0 flex-col justify-center px-5 py-5 lg:px-6">
                  <div className="flex items-center gap-2.5">
                    <span className="pricing-svc-icon">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </span>
                    <span className="truncate text-sm font-semibold text-white">
                      {service.name}
                    </span>
                    {service.id === "ai-automation" && (
                      <span className="pricing-hot flex-shrink-0">
                        <Zap className="h-3 w-3" strokeWidth={2.4} /> Hot
                      </span>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-[#0077A8] opacity-0 transition-all duration-200 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100" />
                  </div>
                  <span className="mt-0.5 pl-9 text-[10px] font-bold uppercase tracking-wider text-white/45">
                    {service.category}
                  </span>
                </div>

                {service.fixedPrice || service.packages.length === 1 ? (
                  <>
                    <div className={`py-5 pricing-cell ${activeTier === 0 ? "pricing-cell--focus" : ""}`} />
                    <div
                      className={`flex flex-col items-center justify-center px-1 py-5 text-center pricing-cell ${
                        activeTier === 1 ? "pricing-cell--focus pricing-cell--popular" : "pricing-cell--popular"
                      }`}
                    >
                      <span className="mb-1 text-[9px] font-black uppercase tracking-wider text-[#0077A8]">
                        Fixed
                      </span>
                      <span className="text-sm font-extrabold leading-none text-[#0077A8]">
                        {service.packages[0].price}
                      </span>
                      <span className="mt-1 text-[10px] leading-none text-[#0077A8]/60">
                        {service.packages[0].period === "one-time"
                          ? "one-time"
                          : service.packages[0].period.replace(
                              "/ month + ad spend",
                              "+spend"
                            )}
                      </span>
                    </div>
                    <div className={`py-5 pricing-cell ${activeTier === 2 ? "pricing-cell--focus" : ""}`} />
                  </>
                ) : (
                  service.packages.map((pkg, pi) => (
                    <div
                      key={pkg.name}
                      className={`flex flex-col items-center justify-center px-1 py-5 text-center pricing-cell ${
                        pi === 1 ? "pricing-cell--popular" : ""
                      } ${activeTier === pi ? "pricing-cell--focus" : ""}`}
                    >
                      <span
                        className={`text-sm font-extrabold leading-none ${
                          activeTier === pi || pi === 1
                            ? "text-[#0077A8]"
                            : "text-white"
                        }`}
                      >
                        {pkg.price}
                      </span>
                      <span
                        className={`mt-1 text-[10px] leading-none ${
                          activeTier === pi || pi === 1
                            ? "text-[#0077A8]/60"
                            : "text-white/45"
                        }`}
                      >
                        {pkg.period === "one-time"
                          ? "one-time"
                          : pkg.period.replace("/ month + ad spend", "+spend")}
                      </span>
                    </div>
                  ))
                )}

                {scanned && scanRow === si && !reduceMotion && (
                  <span aria-hidden className="pricing-scan-line" />
                )}
              </motion.a>
            );
          })}

          <a
            href="/pricing"
            className={`group pricing-row pricing-row--footer ${COLS}`}
          >
            <div className="px-5 py-5 lg:px-6">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-[#0077A8] transition-colors group-hover:text-white">
                View all {pricingServices.length} services &amp; full pricing
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <p className="mt-1 text-xs text-white/45">
                Features, comparisons, timelines &amp; FAQs.
              </p>
            </div>
            <div className={`pricing-cell ${activeTier === 0 ? "pricing-cell--focus" : ""}`} />
            <div
              className={`pricing-cell pricing-cell--popular ${
                activeTier === 1 ? "pricing-cell--focus" : ""
              }`}
            />
            <div className={`pricing-cell ${activeTier === 2 ? "pricing-cell--focus" : ""}`} />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5, ease: easeOut }}
          className="pricing-cta-strip mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row"
        >
          <div className="text-center sm:text-left">
            <p className="text-base font-extrabold text-white">
              Not sure which plan is right?
            </p>
            <p className="mt-0.5 text-sm text-white/55">
              Book a free 30-min call — we&apos;ll recommend the exact fit.
            </p>
          </div>
          <a href="/pricing" className="pricing-cta-btn flex-shrink-0">
            View Full Pricing
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
