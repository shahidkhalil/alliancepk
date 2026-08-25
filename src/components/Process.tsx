"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useForm } from "@/context/FormContext";
import { Card, CardStatPill } from "@/components/ui/Card";
import { staggerDelay } from "@/lib/motionVariants";

const steps = [
  { num: "01", title: "Free Clinic Audit", desc: "We analyse your current online presence — Google ranking, website, social ads, WhatsApp — and identify exactly where patients are leaking out.", time: "Day 1" },
  { num: "02", title: "Custom Growth Plan", desc: "We build a tailored plan for your clinic: which channels to focus on, what budget to set, and what results to expect in 30, 60, and 90 days.", time: "Day 2–3" },
  { num: "03", title: "Onboarding & Setup", desc: "We set up your ads, website, AI receptionist, WhatsApp automation, and EHR — all configured and ready before we go live.", time: "Week 1" },
  { num: "04", title: "Launch & Optimise", desc: "We go live, monitor performance daily, and optimise based on what your specific clinic patients respond to.", time: "Week 2" },
  { num: "05", title: "Monthly Reporting", desc: "You get a clear monthly report: patients acquired, cost per lead, Google ranking changes, WhatsApp inquiries handled, and ROI.", time: "Monthly" },
  { num: "06", title: "Scale & Grow", desc: "Once we know what works, we scale what converts — more patients, more revenue, without proportionally more spend.", time: "Ongoing" },
];

export default function Process() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { openForm } = useForm();

  return (
    <section className="py-16 lg:py-20 bg-white" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-12">
          <span className="badge-light mb-4">HOW IT WORKS</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-3">
            Your Timeline to <span className="gradient-heading">Clinic Growth</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A clear, structured process — no guesswork, no jargon. You&apos;ll always know exactly what we&apos;re doing and why.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {steps.map((s, i) => (
            <Card key={s.num} accent feature delay={staggerDelay(i)} className="p-6 lg:p-7 relative">
              <div className="flex items-start justify-between mb-4">
                <motion.span
                  className="text-4xl font-extrabold bg-gradient-to-br from-[#00283C] to-[#0077A8] bg-clip-text text-transparent opacity-30"
                  whileHover={{ scale: 1.08, opacity: 0.5 }}
                >
                  {s.num}
                </motion.span>
                <CardStatPill>{s.time}</CardStatPill>
              </div>
              <h3 className="text-base font-bold text-[#00283C] mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6 }}
          className="text-center">
          <button onClick={openForm} className="btn-dark px-8 py-4 text-base">
            Get Your Free Clinic Audit
          </button>
          <p className="text-gray-400 text-sm mt-3">Minimum 3–6 month engagement. Just enough time for results to compound and your ROI to become undeniable.</p>
        </motion.div>
      </div>
    </section>
  );
}
