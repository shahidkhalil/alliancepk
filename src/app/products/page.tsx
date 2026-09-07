import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import FinalCTA from "@/components/FinalCTA";
import { products } from "@/lib/productsData";

export const metadata: Metadata = {
  title: "Our Products | Alliance Tech",
  description:
    "Products from Alliance Tech — Maya AI Receptionist, Heloo Health, Free Website Audit, and AI Business Growth Audit.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <PageWrapper>
      <section className="relative pt-20 overflow-hidden bg-white">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,40,60,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,40,60,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
          aria-hidden
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[420px] rounded-full pointer-events-none opacity-[0.08]"
          style={{ background: "radial-gradient(circle, #00B4D8, transparent 70%)", filter: "blur(80px)" }}
          aria-hidden
        />

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-12 sm:pt-14 sm:pb-16">
          <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
            <span className="badge-light inline-flex items-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]" aria-hidden />
              Our Products
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#00283C] tracking-tight leading-tight mb-4">
              Products from Alliance Tech
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Alliance Tech products you can try — Maya AI Receptionist,{" "}
              <a href="https://heloohealth.web.app/" target="_blank" rel="noopener noreferrer" className="text-[#0077A8] font-semibold hover:underline">
                Heloo Health
              </a>
              , Free Website Audit, and AI Business Growth Audit. Agency services like SEO and marketing live under Services.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {products.map(({ name, blurb, href, badge, cta, Icon, external }) => (
              <a
                key={href}
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group rounded-2xl bg-white border border-[#E8EEF2] shadow-[0_1px_2px_rgba(0,40,60,0.04),0_12px_32px_rgba(0,40,60,0.06)] p-6 lg:p-7 hover:border-[#00B4D8]/40 hover:shadow-[0_12px_36px_rgba(0,119,168,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0077A8]/25 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3 mb-5">
                  <span className="w-11 h-11 rounded-xl bg-[#E8F7FB] flex items-center justify-center transition-colors duration-200 group-hover:bg-[#00283C]">
                    <Icon
                      className="w-5 h-5 text-[#0077A8] transition-colors duration-200 group-hover:text-white"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0077A8] bg-[#E8F7FB] border border-[#D6EEF5] rounded-full px-2.5 py-1">
                    {badge}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-[#00283C] mb-2 tracking-tight">{name}</h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">{blurb}</p>
                <span className="text-sm font-bold text-[#0077A8] inline-flex items-center gap-1">
                  {cta}
                  <ArrowRight
                    className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </PageWrapper>
  );
}
