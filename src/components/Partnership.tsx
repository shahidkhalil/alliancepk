"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";

const points = [
  "Clear setup: services, hours, FAQs, and booking rules you approve",
  "Transcripts and weekly reviews so Maya gets sharper over time",
  "One dedicated contact for your clinic — not a ticket queue",
];

export default function Partnership() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="py-16 lg:py-20 bg-white" ref={ref}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mb-4"
        >
          AI that sounds like your clinic — not a robot script
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.08 }}
          className="text-gray-500 mb-8 leading-relaxed"
        >
          We configure Maya around how your practice actually works, then stay
          with you after launch so more calls become booked visits.
        </motion.p>
        <ul className="text-left max-w-lg mx-auto space-y-3 mb-10">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-sm text-gray-600">
              <Check className="w-4 h-4 text-[#0077A8] shrink-0 mt-0.5" strokeWidth={2.5} />
              {p}
            </li>
          ))}
        </ul>
        <a href="/ai-receptionist" className="font-semibold text-[#0077A8] hover:underline">
          See how Maya works →
        </a>
      </div>
    </section>
  );
}
