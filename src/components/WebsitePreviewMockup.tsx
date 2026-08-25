"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function WebsitePreviewMockup() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="relative max-w-2xl mx-auto">
      <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
        {/* Browser chrome */}
        <div className="bg-[#F0F2F5] px-4 py-2.5 flex items-center gap-3 border-b border-gray-200">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded-md px-3 py-1 text-[11px] text-gray-400 flex items-center gap-1.5">
            <span className="text-green-500">🔒</span> yourclinic.com
          </div>
        </div>

        {/* Page preview */}
        <div className="bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-3 w-20 bg-[#00283C] rounded-sm" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-2 w-10 bg-gray-200 rounded-sm" />)}
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 }}>
            <div className="h-4 w-3/4 bg-[#00283C] rounded-sm mb-2.5" />
            <div className="h-4 w-1/2 bg-[#00B4D8] rounded-sm mb-4" />
            <div className="h-2.5 w-full bg-gray-100 rounded-sm mb-1.5" />
            <div className="h-2.5 w-5/6 bg-gray-100 rounded-sm mb-5" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.35 }}
              className="inline-block bg-[#00283C] text-white text-xs font-semibold px-5 py-2.5 rounded-md">
              Book an Appointment
            </motion.div>
          </motion.div>
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[1, 2, 3].map((i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.1 }} className="h-16 bg-[#F8FAFC] border border-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Floating confirmation toast */}
      <motion.div
        initial={{ opacity: 0, y: 12, x: 12 }}
        animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
        transition={{ delay: 0.9, duration: 0.4 }}
        className="absolute -bottom-5 -right-3 sm:right-4 bg-white shadow-xl border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-2.5"
      >
        <span className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">✓</span>
        <div>
          <p className="text-xs font-bold text-[#00283C]">New booking received</p>
          <p className="text-[10px] text-gray-400">via website — just now</p>
        </div>
      </motion.div>
    </div>
  );
}
