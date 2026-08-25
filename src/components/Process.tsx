"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useForm } from "@/context/FormContext";

const steps = [
  {
    num: "01",
    title: "Automation Audit",
    time: "Day 1",
    desc: "We map every way a patient reaches you — calls, chat, WhatsApp, forms — and pinpoint exactly where inquiries are being dropped.",
  },
  {
    num: "02",
    title: "Your Automation Blueprint",
    time: "Day 2–3",
    desc: "We show you which workflows to automate first, what each one recovers, and the results to expect in 30, 60, and 90 days.",
  },
  {
    num: "03",
    title: "Build & Connect",
    time: "Day 3–7",
    desc: "We configure your AI receptionist, messaging, booking, and reminders — connected to your calendar and EHR before anything goes live.",
  },
  {
    num: "04",
    title: "Train on Your Clinic",
    time: "Day 7–10",
    desc: "The AI learns your treatments, hours, pricing, and escalation rules, so every answer sounds like your front desk.",
  },
  {
    num: "05",
    title: "Go Live & Tune",
    time: "Day 10–14",
    desc: "We launch, listen to real conversations, and refine handling until bookings land cleanly and nothing needs a human chase.",
  },
  {
    num: "06",
    title: "Monitor & Expand",
    time: "Ongoing",
    desc: "Monthly reporting on calls answered, appointments booked, and no-shows recovered — then we automate the next workflow.",
  },
];

export default function Process() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { openForm } = useForm();

  return (
    <section className="py-20 lg:py-28 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <span className="badge-light mb-4">HOW IT WORKS</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-3">
            Live Automation in <span className="gradient-heading">Two Weeks</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A clear rollout with no guesswork and no disruption to your clinic. You&apos;ll always
            know what&apos;s being automated and why.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.06 * i }}
              className="p-6 lg:p-7 rounded-2xl border border-[#E8EEF2] bg-white shadow-[0_1px_2px_rgba(0,40,60,0.04),0_12px_32px_rgba(0,40,60,0.06)] relative"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl font-extrabold bg-gradient-to-br from-[#00283C] to-[#0077A8] bg-clip-text text-transparent opacity-30">
                  {step.num}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0077A8] bg-[#E8F7FB] border border-[#D6EEF5] px-2.5 py-1 rounded-full">
                  {step.time}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#00283C] mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mb-6">
          Minimum 3–6 month engagement. Just enough time for results to compound and your ROI to
          become undeniable.
        </p>
        <div className="flex justify-center">
          <button type="button" onClick={openForm} className="btn-dark px-8 py-4 text-base">
            Book a Free Strategy Call
          </button>
        </div>
      </div>
    </section>
  );
}
