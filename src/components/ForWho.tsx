"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  PhoneCall,
  MessageSquare,
  CalendarCheck,
  BellRing,
} from "lucide-react";
import { useForm } from "@/context/FormContext";
import { Card, CardIconWell } from "@/components/ui/Card";

const clinicTypes = [
  "Dental",
  "Dermatology",
  "Aesthetic / Med Spa",
  "Chiropractic",
  "Physio & Rehab",
  "Urgent Care",
  "ENT",
  "Primary Care",
  "Specialty Clinics",
];

const outcomes = [
  {
    Icon: PhoneCall,
    title: "Every call answered",
    desc: "AI picks up when your front desk can't — nights, weekends, and busy hours.",
  },
  {
    Icon: MessageSquare,
    title: "Instant replies",
    desc: "WhatsApp, chat, and form inquiries get a response in seconds, not hours.",
  },
  {
    Icon: CalendarCheck,
    title: "Bookings on autopilot",
    desc: "Qualified patients land on your calendar without phone tag.",
  },
  {
    Icon: BellRing,
    title: "Fewer no-shows",
    desc: "Automated reminders and follow-ups keep chairs filled.",
  },
];

export default function ForWho() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { openForm } = useForm();

  return (
    <section className="py-16 lg:py-20 bg-[#F8FAFC]" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <span className="badge-light mb-4">WHO WE AUTOMATE FOR</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-3">
            Automation Built for <span className="gradient-heading">Healthcare Clinics</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Any outpatient practice that runs on appointments — where every missed call and slow reply is a lost patient.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-2.5 mb-12"
        >
          {clinicTypes.map((type) => (
            <span
              key={type}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#00283C] bg-white border border-[#00283C]/10 shadow-[0_1px_2px_rgba(0,40,60,0.04)]"
            >
              {type}
            </span>
          ))}
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4 lg:gap-5 mb-10">
          {outcomes.map(({ Icon, title, desc }, i) => (
            <Card key={title} accent feature delay={0.12 + i * 0.06} className="p-6 lg:p-7 flex gap-4 items-start">
              <CardIconWell className="flex-shrink-0">
                <Icon className="w-5 h-5 text-[#0077A8]" strokeWidth={2} aria-hidden />
              </CardIconWell>
              <div className="pt-1">
                <h3 className="text-base font-extrabold text-[#00283C] mb-1.5 tracking-tight">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </Card>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button onClick={openForm} className="btn-dark px-8 py-4 text-base">
            Automate My Clinic →
          </button>
          <p className="text-gray-400 text-sm mt-3">
            Built for US healthcare clinics — solo practices to multi-location groups.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
