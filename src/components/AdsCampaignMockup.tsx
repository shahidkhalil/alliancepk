"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const campaigns = [
  { name: "Google Search — Implants", platform: "🔍", impressions: "12.4K", clicks: "412", cpa: "$24", bar: "85%" },
  { name: "Meta Feed — Aesthetic", platform: "📘", impressions: "8.9K", clicks: "298", cpa: "$18", bar: "68%" },
  { name: "Instagram Stories — Whitening", platform: "📸", impressions: "15.2K", clicks: "501", cpa: "$14", bar: "94%" },
];

export default function AdsCampaignMockup() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 max-w-2xl mx-auto">
      <div className="bg-[#00283C] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <span className="text-white/60 text-xs font-mono">Campaign Manager — Live</span>
        <span className="flex items-center gap-1.5 text-white/60 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Active
        </span>
      </div>

      <div className="bg-white px-5 py-3 grid grid-cols-3 gap-3 border-b border-gray-100">
        {[
          { label: "Total Spend Today", value: "$1,200" },
          { label: "Leads Generated", value: "34" },
          { label: "Avg. Cost / Lead", value: "$18" },
        ].map((s) => (
          <div key={s.label} className="text-center py-1">
            <div className="text-lg font-extrabold text-[#00283C]">{s.value}</div>
            <div className="text-[10px] text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white">
        {campaigns.map((c, i) => (
          <motion.div key={c.name}
            initial={{ opacity: 0, x: -12 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.12 }}
            className="px-5 py-3 border-b border-gray-50">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base">{c.platform}</span>
                <p className="text-sm font-semibold text-gray-800">{c.name}</p>
              </div>
              <span className="text-xs font-bold text-[#0077A8]">{c.cpa} CPA</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #00283C, #00B4D8)" }}
                  initial={{ width: "0%" }} animate={inView ? { width: c.bar } : {}} transition={{ delay: 0.4 + i * 0.12, duration: 0.8 }} />
              </div>
              <span className="text-[10px] text-gray-400 flex-shrink-0">{c.impressions} views · {c.clicks} clicks</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
