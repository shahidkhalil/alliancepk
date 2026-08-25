"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function MiniSite({ compact = false }: { compact?: boolean }) {
  return (
    <div className="bg-white h-full p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="h-2 w-12 bg-[#00283C] rounded-sm" />
        {!compact && (
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-1.5 w-6 bg-gray-200 rounded-sm" />)}
          </div>
        )}
      </div>
      <div className={`h-2.5 ${compact ? "w-full" : "w-3/4"} bg-[#00283C] rounded-sm mb-1.5`} />
      <div className={`h-2.5 ${compact ? "w-4/5" : "w-1/2"} bg-[#00B4D8] rounded-sm mb-2.5`} />
      <div className="h-1.5 w-full bg-gray-100 rounded-sm mb-1" />
      <div className="h-1.5 w-5/6 bg-gray-100 rounded-sm mb-3" />
      <div className="inline-block bg-[#00283C] text-white text-[8px] font-semibold px-3 py-1.5 rounded-sm mb-3">Book Now</div>
      <div className={`grid ${compact ? "grid-cols-1" : "grid-cols-3"} gap-1.5`}>
        {(compact ? [1] : [1, 2, 3]).map((i) => <div key={i} className="h-8 bg-[#F8FAFC] border border-gray-100 rounded-sm" />)}
      </div>
    </div>
  );
}

export default function ResponsiveShowcaseMockup() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="relative py-10">
      {/* Ambient glow + grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(0,40,60,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,40,60,0.035) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
      }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none opacity-[0.08]"
        style={{ background: "radial-gradient(circle, #00B4D8, transparent 70%)", filter: "blur(90px)" }} />

      <div className="relative max-w-3xl mx-auto h-[420px] sm:h-[460px] flex items-center justify-center">
        {/* Desktop frame */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.94 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="absolute w-[78%] sm:w-[70%] rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-white z-10"
        >
          <div className="bg-[#F0F2F5] px-3 py-2 flex items-center gap-2 border-b border-gray-200">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-white rounded-sm px-2 py-0.5 text-[9px] text-gray-400">yourclinic.com</div>
          </div>
          <MiniSite />
        </motion.div>

        {/* Tablet frame */}
        <motion.div
          initial={{ opacity: 0, x: -40, y: 40 }}
          animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="absolute left-0 sm:left-6 bottom-0 w-[34%] sm:w-[28%] z-20"
        >
          <motion.div
            animate={inView ? { y: [0, -8, 0] } : {}}
            transition={{ delay: 1, duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-2xl overflow-hidden shadow-2xl border-[4px] border-[#00283C] bg-white"
            style={{ aspectRatio: "3/4", transform: "rotate(-8deg)" }}
          >
            <MiniSite compact />
          </motion.div>
        </motion.div>

        {/* Phone frame */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: 50 }}
          animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="absolute right-2 sm:right-10 bottom-2 w-[24%] sm:w-[19%] z-30"
        >
          <motion.div
            animate={inView ? { y: [0, 8, 0] } : {}}
            transition={{ delay: 1.2, duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-2xl overflow-hidden shadow-2xl border-[4px] border-[#00283C] bg-white"
            style={{ aspectRatio: "9/16", transform: "rotate(9deg)" }}
          >
            <MiniSite compact />
          </motion.div>
        </motion.div>

        {/* Floating badges */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.9 }}
          className="absolute top-2 left-2 sm:left-10 bg-white shadow-xl border border-gray-100 rounded-full px-3 py-1.5 flex items-center gap-1.5 z-40">
          <span className="text-xs">⚡</span><span className="text-[10px] font-bold text-[#00283C]">&lt;2s Load Time</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 1.05 }}
          className="absolute top-6 right-0 sm:right-6 bg-white shadow-xl border border-gray-100 rounded-full px-3 py-1.5 flex items-center gap-1.5 z-40">
          <span className="text-xs">📱</span><span className="text-[10px] font-bold text-[#00283C]">Mobile-First</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 1.2 }}
          className="absolute bottom-0 sm:bottom-2 left-1/2 -translate-x-1/2 bg-[#00283C] text-white shadow-xl rounded-full px-4 py-1.5 flex items-center gap-1.5 z-40">
          <span className="text-xs">🔍</span><span className="text-[10px] font-bold">SEO-Ready From Day One</span>
        </motion.div>
      </div>
    </div>
  );
}
