"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  PhoneMissed,
  MessageSquareOff,
  CalendarX,
  ClipboardList,
  BellRing,
  UserRoundX,
} from "lucide-react";
import { FeatureCardGrid } from "@/components/ui/Card";

const iconClass = "w-5 h-5 text-[#0077A8]";

const problems = [
  {
    icon: <PhoneMissed className={iconClass} strokeWidth={2} aria-hidden />,
    title: "Calls answered by voicemail",
    desc: "Most patients who can't reach you on the first try call the next clinic. Every unanswered ring is revenue walking out the door.",
  },
  {
    icon: <MessageSquareOff className={iconClass} strokeWidth={2} aria-hidden />,
    title: "Messages sitting unread",
    desc: "Website chat, WhatsApp, and form inquiries pile up while your front desk is with patients. Automation replies in seconds.",
  },
  {
    icon: <CalendarX className={iconClass} strokeWidth={2} aria-hidden />,
    title: "Manual back-and-forth booking",
    desc: "Phone tag to find an open slot costs your team hours a week. Automated booking closes the appointment on the first contact.",
  },
  {
    icon: <BellRing className={iconClass} strokeWidth={2} aria-hidden />,
    title: "No-shows nobody follows up",
    desc: "Without automated reminders and recovery, empty chairs stay empty. Reminders run themselves once they're set up.",
  },
  {
    icon: <ClipboardList className={iconClass} strokeWidth={2} aria-hidden />,
    title: "Paperwork and admin overload",
    desc: "Intake forms, records, and billing done by hand slow your clinic down and introduce errors that erode patient trust.",
  },
  {
    icon: <UserRoundX className={iconClass} strokeWidth={2} aria-hidden />,
    title: "Leads that go cold",
    desc: "Ad clicks and search traffic mean nothing if follow-up depends on someone remembering. Workflows never forget.",
  },
];

export default function Problems() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="py-16 lg:py-20 bg-[#F8FAFC]" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-12">
          <span className="badge-light mb-4">WHERE CLINICS LOSE PATIENTS</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] mt-4 mb-4 tracking-tight">
            Manual Front-Desk Work Is<br />
            <span className="gradient-heading">Costing You Appointments</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            After auditing 100+ clinics across the United States, the same six gaps show up — and every one of them can be automated.
          </p>
        </motion.div>

        <FeatureCardGrid items={problems} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.5 }}
          whileHover={{ scale: 1.01, y: -3 }}
          whileTap={{ scale: 0.98 }}
          className="mt-10 rounded-2xl p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 card-cta-dark card-cta-glow"
        >
          <div>
            <p className="text-white font-bold text-base">Sound familiar? Every one of these is automatable.</p>
            <p className="text-white/60 text-sm mt-0.5">We&apos;ve automated all six for clinics across the United States — we can do it for yours.</p>
          </div>
          <a href="/#services" className="flex-shrink-0 bg-white text-[#00283C] font-bold px-5 py-2.5 rounded-md text-sm hover:bg-gray-100 transition-colors whitespace-nowrap">
            See What We Automate →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
