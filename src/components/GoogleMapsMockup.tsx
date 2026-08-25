"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function GoogleMapsMockup() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 max-w-2xl mx-auto">
      <div className="grid sm:grid-cols-2">
        {/* Map area */}
        <div className="relative bg-[#E8EEF1] min-h-[220px] overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(0,40,60,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,40,60,0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }} />
          {[
            { top: "30%", left: "25%", you: false },
            { top: "55%", left: "65%", you: false },
            { top: "45%", left: "45%", you: true },
            { top: "70%", left: "20%", you: false },
          ].map((p, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: -10 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.12 }}
              className="absolute -translate-x-1/2 -translate-y-full" style={{ top: p.top, left: p.left }}>
              {p.you ? (
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.6 }}
                  className="w-7 h-7 rounded-full bg-[#00B4D8] flex items-center justify-center text-white text-xs font-bold shadow-lg ring-4 ring-[#00B4D8]/20">1</motion.div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#00283C]/70 flex items-center justify-center text-white text-[10px] shadow" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Business profile card */}
        <div className="bg-white p-5">
          <p className="text-sm font-extrabold text-[#00283C] mb-1">Your Clinic — Dental & Implants</p>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-amber-400 text-xs">★★★★★</span>
            <span className="text-xs font-bold text-gray-600">4.9</span>
            <span className="text-xs text-gray-400">(312 reviews)</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">Dental clinic · River Oaks, Houston</p>
          <motion.span initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Open Now
          </motion.span>

          <div className="space-y-2">
            {["Photos & posts updated weekly", "Verified business profile", "Replies to reviews within 24h"].map((t, i) => (
              <motion.div key={t} initial={{ opacity: 0, x: -8 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center gap-2 text-xs text-gray-600">
                <span className="text-[#00B4D8]">✓</span>{t}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
