"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Globe, Megaphone, Search, ArrowRight } from "lucide-react";

const extras = [
  {
    Icon: Globe,
    title: "Clinic websites",
    href: "/clinic-website-design",
    blurb: "Sites built to convert visitors into booked visits.",
  },
  {
    Icon: Search,
    title: "SEO",
    href: "/seo-for-clinics",
    blurb: "Get found for the treatments patients search.",
  },
  {
    Icon: Megaphone,
    title: "Ads",
    href: "/digital-marketing-for-clinics",
    blurb: "Campaigns aimed at patients ready to schedule.",
  },
];

export default function AlsoAvailable() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section className="py-16 lg:py-20 bg-[#00283C] relative overflow-hidden" ref={ref} id="also">
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 100% 0%, rgba(0,180,216,0.25), transparent 55%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-10"
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9FD3E8] mb-3">
            Also available
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Grow beyond the front desk when you&apos;re ready
          </h2>
          <p className="text-sm text-white/60 mt-3 max-w-lg mx-auto">
            Maya is the core. Websites, SEO, and ads plug in when you want more
            patients walking through the door.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4">
          {extras.map((item, i) => {
            const Icon = item.Icon;
            return (
              <motion.a
                key={item.href}
                href={item.href}
                initial={{ opacity: 0, y: 14 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.08 * i }}
                className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-5 transition-colors backdrop-blur"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0077A8]/30 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#9FD3E8]" strokeWidth={2} />
                </div>
                <p className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
                  {item.title}
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#9FD3E8]" />
                </p>
                <p className="text-xs text-white/55 leading-relaxed">{item.blurb}</p>
              </motion.a>
            );
          })}
        </div>

        <p className="text-center mt-8">
          <a href="/services" className="text-sm font-semibold text-[#9FD3E8] hover:text-white transition-colors">
            See all services →
          </a>
        </p>
      </div>
    </section>
  );
}
