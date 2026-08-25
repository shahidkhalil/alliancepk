"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const days = ["M", "T", "W", "T", "F", "S", "S"];

export default function MobileAppMockup() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="relative max-w-[280px] mx-auto">
      {/* Phone frame */}
      <div className="rounded-[2rem] border-[6px] border-[#00283C] overflow-hidden shadow-2xl bg-white">
        {/* Status bar */}
        <div className="bg-[#00283C] h-6 flex items-center justify-center">
          <div className="w-16 h-2 bg-black/30 rounded-full" />
        </div>

        {/* App header */}
        <div className="bg-[#00283C] px-4 pb-4 pt-1">
          <p className="text-white/60 text-[10px]">Welcome back,</p>
          <p className="text-white font-bold text-sm">John Miller</p>
        </div>

        {/* Calendar */}
        <div className="bg-white px-4 py-4">
          <p className="text-[11px] font-bold text-[#00283C] mb-2.5">Select Appointment Date</p>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {days.map((d, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.7 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.1 + i * 0.04 }}
                className={`text-center text-[10px] py-1.5 rounded-md font-semibold ${
                  i === 4 ? "bg-[#00B4D8] text-white" : "text-gray-400"
                }`}>
                {d}
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }}
            className="bg-[#F8FAFC] border border-gray-100 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-bold text-[#00283C]">Teeth Cleaning</p>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Confirmed</span>
            </div>
            <p className="text-[10px] text-gray-400">Friday · 11:00 AM · Dr. Sana</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.7 }}
            className="bg-[#00283C] text-white text-center text-xs font-bold py-2.5 rounded-lg">
            Book New Appointment
          </motion.div>
        </div>
      </div>

      {/* Push notification */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1, duration: 0.4 }}
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-[230px] bg-white shadow-xl border border-gray-100 rounded-xl px-3 py-2 flex items-center gap-2"
      >
        <span className="w-6 h-6 rounded-md bg-[#00B4D8] flex items-center justify-center text-white text-xs flex-shrink-0">🔔</span>
        <div>
          <p className="text-[10px] font-bold text-[#00283C] leading-tight">Reminder: appointment tomorrow</p>
          <p className="text-[9px] text-gray-400">Alliance Clinic App</p>
        </div>
      </motion.div>
    </div>
  );
}
