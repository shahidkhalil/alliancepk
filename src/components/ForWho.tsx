"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useForm } from "@/context/FormContext";
import { Card, CardIconWell } from "@/components/ui/Card";

export default function ForWho() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { openForm } = useForm();

  const checklist = (items: string[]) => (
    <ul className="space-y-3 mb-7 flex-1">
      {items.map((item) => (
        <motion.li
          key={item}
          initial={{ opacity: 0, x: -12 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="flex items-start gap-2.5 text-sm text-gray-600"
        >
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#E6F4F8] border border-[#00B4D8]/20 flex items-center justify-center mt-0.5">
            <svg className="w-3 h-3 text-[#00B4D8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          {item}
        </motion.li>
      ))}
    </ul>
  );

  return (
    <section className="py-16 lg:py-20 bg-[#F8FAFC]" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-12">
          <span className="badge-light mb-4">WHO WE HELP</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4">
            The Perfect Agency for <span className="gradient-heading">Clinic Owners</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          <Card accent feature delay={0.1} className="p-8 lg:p-9 flex flex-col">
            <CardIconWell className="text-2xl mb-5">🦷</CardIconWell>
            <h3 className="text-xl font-extrabold text-[#00283C] mb-3 mt-5">FOR DENTAL CLINICS</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Whether you&apos;re a solo dentist or running a multi-chair practice — we fill your appointment book with the right patients every month.
            </p>
            {checklist([
              "Get to #1 on Google Maps in your area",
              "Run targeted ads for implants, orthodontics & cosmetic work",
              "AI that books patients from WhatsApp while you sleep",
            ])}
            <button onClick={openForm} className="btn-dark px-6 py-3 text-sm w-full mt-auto">
              Grow My Dental Clinic →
            </button>
          </Card>

          <Card accent feature delay={0.2} className="p-8 lg:p-9 flex flex-col">
            <CardIconWell className="text-2xl mb-5">✨</CardIconWell>
            <h3 className="text-xl font-extrabold text-[#00283C] mb-3 mt-5">FOR AESTHETIC CLINICS</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Botox, fillers, laser, skin treatments — aesthetic patients decide with their eyes. We make sure they see your clinic first, and trust it enough to book.
            </p>
            {checklist([
              "Instagram & TikTok campaigns that convert",
              "Before & after content strategy that builds trust",
              "WhatsApp AI handling inquiries in English",
            ])}
            <button onClick={openForm} className="btn-dark px-6 py-3 text-sm w-full mt-auto">
              Grow My Aesthetic Clinic →
            </button>
          </Card>
        </div>
      </div>
    </section>
  );
}
