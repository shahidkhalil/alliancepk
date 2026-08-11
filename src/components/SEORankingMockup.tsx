"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const results = [
  { name: "Generic Dental Directory", url: "dentaldirectory.com", you: false },
  { name: "Competitor Clinic Houston", url: "competitorclinic.com", you: false },
  { name: "Your Clinic — Dental Implants Houston", url: "yourclinic.com", you: true },
];

export default function SEORankingMockup() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 max-w-2xl mx-auto">
      <div className="bg-white px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <span className="text-[#0077A8]">🔍</span>
        <span className="text-sm text-gray-600">dental implants cost Houston</span>
      </div>

      <div className="bg-white px-5 py-4 space-y-4">
        {results.map((r, i) => {
          const isYou = r.you;
          return (
            <motion.div key={r.name}
              initial={{ opacity: 0, y: isYou ? 60 : 0 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: isYou ? 0.6 : 0.15 * i, duration: 0.5 }}
              className={`p-3 rounded-lg ${isYou ? "bg-[#F0F7FA] border border-[#00B4D8]/30" : ""}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-gray-400">{r.url}</span>
                {isYou && (
                  <motion.span initial={{ opacity: 0, scale: 0.7 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 1 }}
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#00B4D8] text-white">#1 RANKING</motion.span>
                )}
              </div>
              <p className={`text-sm ${isYou ? "font-bold text-[#0077A8]" : "text-[#1A0DAB]"}`}>{r.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">★★★★★ 4.9 (210 reviews) — Trusted dental implant specialists in Houston. Free consultation available.</p>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-[#F8FAFC] px-5 py-3 flex items-center justify-between border-t border-gray-100">
        <span className="text-[10px] text-gray-400">Ranking progress over 6 months</span>
        <div className="flex items-end gap-1 h-6">
          {[20, 35, 30, 55, 70, 95].map((h, i) => (
            <motion.div key={i} initial={{ height: 0 }} animate={inView ? { height: `${h}%` } : {}}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              className="w-2 rounded-sm" style={{ background: i === 5 ? "#00B4D8" : "#CBD5E1" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
