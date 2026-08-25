"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FeatureCardGrid } from "@/components/ui/Card";

const problems = [
  { icon: "📵", title: "Missed calls = missed patients", desc: "80% of patients who can't reach a clinic on the first try call the next one. No AI receptionist = lost revenue every single day." },
  { icon: "📍", title: "Invisible on Google Maps", desc: "If your clinic doesn't appear in the top 3 when someone searches 'dentist near me', you don't exist to that patient." },
  { icon: "💸", title: "Ad spend wasted on wrong audiences", desc: "Running Facebook or Google ads without clinic-specific targeting burns budget on people who will never become patients." },
  { icon: "📄", title: "Paper records holding you back", desc: "Manual registers, lost files, prescription errors — paper-based clinics can't scale and lose patient trust." },
  { icon: "💬", title: "WhatsApp inquiries going unanswered", desc: "American patients prefer WhatsApp. If you're not replying within minutes, they've already booked somewhere else." },
  { icon: "🌐", title: "Outdated or no website", desc: "A clinic with no website — or a slow, unprofessional one — loses 60% of potential new patients before they ever call." },
];

export default function Problems() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="py-16 lg:py-20 bg-[#F8FAFC]" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-12">
          <span className="badge-light mb-4">THE PROBLEM</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] mt-4 mb-4 tracking-tight">
            Most Clinics Waste 60% of Their<br />
            <span className="gradient-heading">Marketing Budget — Here&apos;s Why</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            After auditing 100+ dental and aesthetic clinics across the United States, we see the same 6 problems costing clinics thousands every month.
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
            <p className="text-white font-bold text-base">Sound familiar? You&apos;re not alone.</p>
            <p className="text-white/60 text-sm mt-0.5">We&apos;ve fixed all 6 for clinics across the United States — we can fix them for you too.</p>
          </div>
          <a href="/#services" className="flex-shrink-0 bg-white text-[#00283C] font-bold px-5 py-2.5 rounded-md text-sm hover:bg-gray-100 transition-colors whitespace-nowrap">
            See Our Solutions →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
