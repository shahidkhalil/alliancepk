"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import ServicePricingSection from "@/components/ServicePricingSection";
import { pricingServices, serviceCategories, ServiceCategory } from "@/lib/pricingData";
import { useForm } from "@/context/FormContext";
import { FeatureCardGrid } from "@/components/ui/Card";

/* ─── Why Alliance Tech ─────────────────────────────────────────────────────── */
function WhySection() {
  const points = [
    { title: "No Hidden Fees", desc: "Every line item is published. What you see is what you pay." },
    { title: "You Own Everything", desc: "Code, assets, data — 100% yours at delivery. No lock-in." },
    { title: "US Healthcare Focused", desc: "HIPAA-ready builds, US-market pricing, US-native copywriting." },
    { title: "Guaranteed Results", desc: "Most services carry a performance or satisfaction guarantee." },
  ];
  return (
    <section className="border-t border-gray-100 py-14 bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <span className="badge-light">WHY ALLIANCE TECH</span>
          <h2 className="text-2xl font-black text-[#00283C] mt-4 tracking-tight">
            Built Different. <span className="gradient-heading">Priced Honestly.</span>
          </h2>
        </div>
        <FeatureCardGrid
          items={points.map((p) => ({ icon: <Check className="w-4 h-4 text-[#0077A8]" strokeWidth={3} />, title: p.title, desc: p.desc }))}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6"
        />
      </div>
    </section>
  );
}

/* ─── Bottom CTA ────────────────────────────────────────────────────────────── */
function BottomCTA() {
  const { openForm } = useForm();
  return (
    <section className="pricing-cta-band relative overflow-hidden py-16">
      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <p className="mb-4 text-xs font-black uppercase tracking-widest text-[#5ce1ff]">NEXT STEP</p>
        <h2 className="mb-4 text-2xl font-black tracking-tight text-white lg:text-3xl">
          Not sure which plan fits?
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-white/55">
          Start with a free clinic audit — then we&apos;ll recommend the exact package for your budget on a 30-minute call.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/free-website-audit"
            data-analytics-label="start_website_audit"
            data-analytics-location="pricing_bottom"
            className="service-hero-cta"
          >
            Run Free Website Audit <ArrowRight className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={openForm}
            data-analytics-label="book_consultation"
            data-analytics-location="pricing_bottom"
            className="service-hero-back border border-white/15 bg-white/[0.04]"
          >
            Book Free Strategy Call
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Main page content ──────────────────────────────────────────────────────── */
function PricingContent() {
  const { openForm } = useForm();
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>("All");
  const [activeId, setActiveId] = useState(pricingServices[0].id);
  const [pickerOpen, setPickerOpen] = useState(false);

  const filtered = activeCategory === "All"
    ? pricingServices
    : pricingServices.filter((s) => s.category === activeCategory);

  useEffect(() => {
    if (!filtered.find((s) => s.id === activeId)) {
      setActiveId(filtered[0]?.id ?? pricingServices[0].id);
    }
  }, [activeCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const active = pricingServices.find((s) => s.id === activeId) ?? pricingServices[0];

  const selectService = (id: string) => {
    setActiveId(id);
    setPickerOpen(false);
    requestAnimationFrame(() => {
      document.getElementById("service-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const mobileCategories = (serviceCategories.filter((c) => c !== "All") as ServiceCategory[]);

  // Deep link: /pricing#service-id opens that service directly.
  useEffect(() => {
    const applyHash = () => {
      const id = window.location.hash.replace("#", "");
      const svc = pricingServices.find((s) => s.id === id);
      if (svc) {
        setActiveCategory("All");
        setActiveId(svc.id);
        setTimeout(() => document.getElementById("service-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section className="service-hero relative overflow-hidden">
        <div aria-hidden className="service-hero-atmosphere absolute inset-0" />
        <div aria-hidden className="service-hero-grid absolute inset-0" />
        <div aria-hidden className="service-hero-orb service-hero-orb--one" />
        <div aria-hidden className="service-hero-beam" />
        <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-32 sm:pb-20 sm:pt-36">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="service-hero-badge mb-5 inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5ce1ff]" />
              Pricing
            </span>
            <h1 className="mb-4 mt-4 text-4xl font-black leading-tight tracking-tight text-white lg:text-5xl">
              Transparent Pricing.<br />
              <span className="service-hero-highlight">No Surprises, Ever.</span>
            </h1>
            <p className="mb-6 max-w-2xl text-base leading-relaxed text-[#a8c6d3]">
              Every service has three clearly defined packages with published prices and feature lists. Pick what you need and know exactly what you&apos;re paying before you sign anything.
            </p>
            <div className="mb-6 flex flex-col flex-wrap gap-3 sm:flex-row">
              <a
                href="/ai-receptionist"
                data-analytics-label="start_ai_demo"
                data-analytics-location="pricing_hero"
                className="service-hero-cta"
              >
                Try Maya Live <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/free-website-audit"
                data-analytics-label="start_website_audit"
                data-analytics-location="pricing_hero"
                className="service-hero-back border border-white/15 bg-white/[0.04]"
              >
                Free Clinic Audit
              </a>
              <button
                type="button"
                onClick={openForm}
                data-analytics-label="book_consultation"
                data-analytics-location="pricing_hero"
                className="service-hero-back border border-white/15 bg-white/[0.04]"
              >
                Book Strategy Call
              </button>
            </div>
            <p className="mb-5 max-w-xl text-xs text-white/45">
              Built for Houston dental &amp; aesthetic clinics that need more booked appointments — not vanity traffic.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {["No hidden fees", "Cancel monthly plans anytime", "You own everything we build", "US market pricing"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-white/50">
                  <Check className="h-3 w-3 text-[#5ce1ff]" strokeWidth={3} /> {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Two-pane layout: sidebar + main ── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stacks on mobile — side-by-side only once the sidebar appears (lg) */}
        <div className="flex flex-col lg:flex-row gap-10 lg:items-start">

          {/* Sidebar nav */}
          <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-28">
            <div className="space-y-6">
              {(serviceCategories.filter(c => c !== "All") as ServiceCategory[]).map((cat) => {
                const catServices = pricingServices.filter((s) => s.category === cat);
                return (
                  <div key={cat}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{cat}</p>
                    <ul className="space-y-0.5">
                      {catServices.map((s) => (
                        <li key={s.id}>
                          <button
                            onClick={() => setActiveId(s.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                              activeId === s.id
                                ? "bg-[#00283C] text-white"
                                : "text-gray-500 hover:text-[#00283C] hover:bg-gray-100"
                            }`}
                          >
                            {s.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Mobile: themed expandable picker (compact when closed) */}
          <div className="lg:hidden w-full min-w-0 mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#0077A8] mb-2">
              Service
            </p>

            <div
              className={`rounded-2xl overflow-hidden transition-shadow duration-200 ${
                pickerOpen
                  ? "shadow-lg shadow-[#00283C]/10 ring-1 ring-[#00B4D8]/35"
                  : "shadow-sm ring-1 ring-gray-200"
              }`}
            >
              <button
                type="button"
                aria-expanded={pickerOpen}
                onClick={() => setPickerOpen((o) => !o)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left bg-gradient-to-br from-white to-[#F0F9FC]"
              >
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-black"
                  style={{ background: "linear-gradient(135deg, #00283C, #0077A8)" }}
                >
                  {active.name.charAt(0)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-[#00283C] truncate">{active.name}</span>
                  <span className="block text-[11px] font-semibold text-[#00B4D8] mt-0.5 truncate">
                    {active.category}
                  </span>
                </span>
                <span
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    pickerOpen ? "bg-[#00B4D8] text-white" : "bg-[#E0F4F9] text-[#0077A8]"
                  }`}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${pickerOpen ? "rotate-180" : ""}`} />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {pickerOpen && (
                  <motion.div
                    key="picker-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="overflow-hidden border-t border-[#00B4D8]/15 bg-white"
                  >
                    <div className="max-h-[min(58vh,380px)] overflow-y-auto overscroll-contain px-2 py-2">
                      {mobileCategories.map((cat) => {
                        const items = pricingServices.filter((s) => s.category === cat);
                        if (!items.length) return null;
                        return (
                          <div key={cat} className="mb-2 last:mb-0">
                            <p className="px-2.5 pt-2 pb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
                              {cat}
                            </p>
                            <ul className="space-y-1">
                              {items.map((s) => {
                                const selected = s.id === activeId;
                                return (
                                  <li key={s.id}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveCategory("All");
                                        selectService(s.id);
                                      }}
                                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                                        selected
                                          ? "bg-[#00283C] text-white shadow-md shadow-[#00283C]/20"
                                          : "text-[#00283C] hover:bg-[#F0F9FC] active:bg-[#E0F4F9]"
                                      }`}
                                    >
                                      <span
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-black ${
                                          selected
                                            ? "bg-[#00B4D8] text-white"
                                            : "bg-[#E0F4F9] text-[#0077A8]"
                                        }`}
                                      >
                                        {s.name.charAt(0)}
                                      </span>
                                      <span className="flex-1 min-w-0">
                                        <span className="block text-sm font-semibold leading-snug truncate">
                                          {s.name}
                                        </span>
                                        <span
                                          className={`block text-[11px] mt-0.5 truncate ${
                                            selected ? "text-white/60" : "text-gray-400"
                                          }`}
                                        >
                                          {s.packages[0]?.price}
                                          {s.packages.length > 1 ? "+" : ""} · {s.packages[0]?.period?.replace("/", "").trim() || "plan"}
                                        </span>
                                      </span>
                                      {selected && (
                                        <Check className="w-4 h-4 shrink-0 text-[#00B4D8]" strokeWidth={3} />
                                      )}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!pickerOpen && (
              <p className="mt-2.5 text-xs text-gray-500 leading-relaxed line-clamp-2 px-0.5">
                {active.tagline}
              </p>
            )}
          </div>

          {/* Main content */}
          <div id="service-detail" className="w-full lg:flex-1 min-w-0 scroll-mt-28">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <ServicePricingSection service={active} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <WhySection />
      <BottomCTA />
    </>
  );
}

export default function PricingPage() {
  return (
    <PageWrapper>
      <PricingContent />
    </PageWrapper>
  );
}
