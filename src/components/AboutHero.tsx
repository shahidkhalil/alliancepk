"use client";

import { ArrowRight, ShieldCheck, MapPinned, Clock3, Sparkles } from "lucide-react";
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
      <section className="service-hero relative overflow-hidden">
        <div aria-hidden className="service-hero-atmosphere absolute inset-0" />
        <div aria-hidden className="service-hero-grid absolute inset-0" />
        <div aria-hidden className="service-hero-orb service-hero-orb--one" />
        <div aria-hidden className="service-hero-orb service-hero-orb--two" />
        <div aria-hidden className="service-hero-beam" />

        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-28 sm:pb-20 sm:pt-36">
          <div className="max-w-3xl">
            <span className="service-hero-badge mb-6 inline-flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />
              About Alliance Tech
            </span>

            <p className="mb-3 text-sm font-semibold tracking-wide text-[#7DD3EA]">
              Alliance Tech
            </p>
            <h1 className="mb-5 text-[2.15rem] font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.35rem]">
              The growth partner for{" "}
              <span className="service-hero-highlight">healthcare clinics</span>
            </h1>
            <p className="mb-9 max-w-2xl text-base leading-relaxed text-[#a8c6d3] sm:text-lg">
              We help US clinics get more patients with AI reception, converting websites,
              local SEO, and marketing measured by appointments — not impressions.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <a href="/free-website-audit" className="service-hero-cta">
                Free clinic audit
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <a href="#contact" className="service-hero-back">
                Contact us
              </a>
              <button
                type="button"
                onClick={openForm}
                className="inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-lg px-2 text-sm font-semibold text-white/55 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00B4D8]/30"
              >
                Book a strategy call
              </button>
            </div>
          </div>

          <ul className="mt-12 grid gap-3 sm:grid-cols-3 lg:mt-14">
            {trustItems.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 backdrop-blur-sm"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#00B4D8]/25 bg-[#00B4D8]/10">
                  <Icon className="h-5 w-5 text-[#5ce1ff]" strokeWidth={2} aria-hidden />
                </span>
                <span className="text-sm font-semibold leading-snug text-white">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
