"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Bot, ArrowRight, Gauge, Search, Users } from "lucide-react";

export default function AuditPromo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="audit-promo-section py-14">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="flex flex-col lg:flex-row items-center gap-8"
        >
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00B4D8]/10 border border-[#00B4D8]/30 text-[#5ce1ff] text-xs font-bold uppercase tracking-wider mb-4">
              <Bot className="w-3.5 h-3.5" /> Free AI Tool
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-3">
              Is Your Website Losing You Patients?<br className="hidden lg:block" />
              <span className="text-[#5ce1ff]"> Find Out in 30 Seconds.</span>
            </h2>
            <p className="text-[#8eb4c4] text-sm max-w-xl mb-6">
              Our AI audits your clinic&apos;s website with real data — speed, SEO, patient experience, and the exact competitors outranking you on Google. Free, no signup.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6 text-xs text-[#8eb4c4]">
              <span className="flex items-center gap-1.5"><Gauge className="w-4 h-4 text-[#5ce1ff]" /> Speed test</span>
              <span className="flex items-center gap-1.5"><Search className="w-4 h-4 text-[#5ce1ff]" /> SEO check</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#5ce1ff]" /> Competitor benchmark</span>
            </div>
            <a
              href="/free-website-audit"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B4D8] to-[#0077A8] text-white font-bold px-7 py-3.5 rounded-full text-sm hover:brightness-110 transition-all shadow-[0_0_28px_rgba(0,180,216,0.35)]"
            >
              Audit My Website Free <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mini mock chat */}
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden flex-shrink-0">
            <div className="bg-[#0077A8] px-4 py-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
              <div>
                <p className="text-xs font-bold text-white">Alliance Audit Bot</p>
                <p className="text-[10px] text-white/60">online</p>
              </div>
            </div>
            <div className="p-4 space-y-2.5 bg-[#F8FAFC]">
              <div className="bg-white border border-gray-100 rounded-xl rounded-bl-sm px-3 py-2 text-xs text-gray-600 max-w-[85%]">
                👋 Paste your website and I&apos;ll audit it in 30 seconds.
              </div>
              <div className="bg-[#00283C] text-white rounded-xl rounded-br-sm px-3 py-2 text-xs ml-auto max-w-[70%]">
                yourclinic.com
              </div>
              <div className="bg-white border border-gray-100 rounded-xl rounded-bl-sm px-3 py-2 text-xs text-gray-600 max-w-[85%]">
                ⚡ Score: <span className="font-bold text-[#DC2626]">54/100</span> — you&apos;re invisible for &ldquo;dental implants Houston&rdquo; and 3 clinics rank above you…
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
