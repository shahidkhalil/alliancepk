"use client";

import { ArrowRight, ShieldCheck, MapPinned, Clock3 } from "lucide-react";
import { useForm } from "@/context/FormContext";
import { BreadcrumbSchema } from "@/components/StructuredData";

const trustItems = [
  { icon: ShieldCheck, label: "Booked patients, not vanity metrics" },
  { icon: MapPinned, label: "Built for US healthcare clinics" },
  { icon: Clock3, label: "Early results in 30–60 days" },
];

export default function AboutHero() {
  const { openForm } = useForm();

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "About Us", path: "/about" },
        ]}
      />
      <section className="relative overflow-hidden bg-[#F3F8FB]">
        {/* Soft depth field */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 0% 0%, rgba(0,180,216,0.14), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 20%, rgba(0,119,168,0.12), transparent 50%), linear-gradient(180deg, #E8F4F8 0%, #F3F8FB 45%, #FFFFFF 100%)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,40,60,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,40,60,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "linear-gradient(180deg, black 0%, transparent 85%)",
          }}
          aria-hidden
        />

        <div className="relative max-w-6xl mx-auto px-6 pt-28 sm:pt-36 pb-14 sm:pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm border border-white shadow-[0_1px_2px_rgba(0,40,60,0.06),0_8px_24px_rgba(0,40,60,0.06)] px-3.5 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]" aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0077A8]">
                About Alliance Tech
              </span>
            </div>

            <p className="text-sm font-semibold text-[#0077A8] mb-3 tracking-wide">
              Alliance Tech
            </p>
            <h1 className="text-[2.15rem] sm:text-5xl lg:text-[3.35rem] font-extrabold text-[#00283C] tracking-tight leading-[1.12] mb-5">
              The growth partner for{" "}
              <span className="text-[#0077A8]">healthcare clinics</span>
            </h1>
            <p className="text-base sm:text-lg text-[#00283C]/65 leading-relaxed max-w-2xl mb-9">
              We help US clinics get more patients with AI reception, converting websites,
              local SEO, and marketing measured by appointments — not impressions.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                href="/free-website-audit"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#00283C] text-white font-bold px-7 text-sm shadow-[0_8px_20px_rgba(0,40,60,0.22)] hover:bg-[#003D5C] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0077A8]/30 transition-colors duration-200 cursor-pointer"
              >
                Free clinic audit
                <ArrowRight className="w-4 h-4" aria-hidden />
              </a>
              <a
                href="#contact"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white text-[#00283C] font-bold px-7 text-sm border border-[#00283C]/10 shadow-[0_1px_2px_rgba(0,40,60,0.04),0_8px_20px_rgba(0,40,60,0.05)] hover:border-[#0077A8]/35 hover:shadow-[0_8px_24px_rgba(0,119,168,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0077A8]/25 transition-all duration-200 cursor-pointer"
              >
                Contact us
              </a>
              <button
                type="button"
                onClick={openForm}
                className="inline-flex min-h-[48px] items-center justify-center text-sm font-semibold text-[#00283C]/55 hover:text-[#00283C] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0077A8]/20 rounded-lg px-2 transition-colors duration-200 cursor-pointer"
              >
                Book a strategy call
              </button>
            </div>
          </div>

          {/* Trust strip — Soft UI pills */}
          <ul className="mt-12 lg:mt-14 grid sm:grid-cols-3 gap-3">
            {trustItems.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 rounded-2xl bg-white/90 border border-white shadow-[0_1px_2px_rgba(0,40,60,0.04),0_10px_28px_rgba(0,40,60,0.06)] px-4 py-3.5"
              >
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#E8F7FB] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#0077A8]" strokeWidth={2} aria-hidden />
                </span>
                <span className="text-sm font-semibold text-[#00283C] leading-snug">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
