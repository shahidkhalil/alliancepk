"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const transcript = [
  { from: "patient", text: "Hi, do you have any opening tomorrow for a checkup?" },
  { from: "ai", text: "Yes! We have 11 AM or 4 PM available tomorrow. Which works better for you?" },
  { from: "patient", text: "11 AM is perfect." },
  { from: "ai", text: "Booked — 11 AM tomorrow. You'll get a WhatsApp confirmation now. Anything else?" },
];

export default function AICallMockup() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="relative max-w-[280px] mx-auto">
      <div className="rounded-[2rem] border-[6px] border-[#00283C] overflow-hidden shadow-2xl bg-[#00283C]">
        <div className="h-6 flex items-center justify-center">
          <div className="w-16 h-2 bg-white/20 rounded-full" />
        </div>

        <div className="px-5 pt-2 pb-6 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={inView ? { scale: 1, opacity: 1 } : {}}
            className="w-16 h-16 mx-auto rounded-full bg-white/10 flex items-center justify-center text-2xl mb-3">🤖</motion.div>
          <p className="text-white font-bold text-sm">Alliance AI Receptionist</p>
          <p className="text-white/60 text-[11px] mb-3">Incoming call · 00:14</p>

          {/* Waveform */}
          <div className="flex items-center justify-center gap-1 h-8 mb-4">
            {[6, 14, 22, 12, 18, 8, 16, 10].map((h, i) => (
              <motion.div key={i}
                animate={{ height: [h, h * 1.8, h] }}
                transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.08 }}
                className="w-1 rounded-full bg-[#00B4D8]" style={{ height: h }} />
            ))}
          </div>
        </div>

        {/* Live transcript */}
        <div className="bg-white rounded-t-2xl px-4 py-4 space-y-2.5 min-h-[180px]">
          {transcript.map((m, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.35 }}
              className={`flex ${m.from === "patient" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-3 py-1.5 rounded-lg text-[10.5px] leading-snug ${
                m.from === "patient" ? "bg-[#F0F7FA] text-gray-700 rounded-tr-none" : "bg-[#00283C] text-white rounded-tl-none"
              }`}>
                {m.text}
              </div>
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 1.8 }}
            className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-green-600 pt-1">
            <span>✅</span> Appointment booked automatically
          </motion.div>
        </div>
      </div>
    </div>
  );
}
