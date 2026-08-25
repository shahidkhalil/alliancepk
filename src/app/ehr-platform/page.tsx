"use client";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import FinalCTA from "@/components/FinalCTA";
import { FeatureCardGrid, AnimatedSurface } from "@/components/ui/Card";
import EHRDashboard from "@/components/EHRDashboard";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  { icon: "📋", title: "Digital Patient Records", desc: "Store complete patient histories, treatment notes, X-rays, and prescriptions — securely, forever." },
  { icon: "📅", title: "Appointment Management", desc: "Visual calendar, online booking, automated reminders, and no-show tracking — all in one screen." },
  { icon: "💳", title: "Billing & Invoicing", desc: "Generate invoices, track payments, handle insurance claims, and send payment links via WhatsApp." },
  { icon: "📱", title: "Patient Mobile App", desc: "Your branded app — patients view records, book appointments, and get reminders with your clinic's logo." },
  { icon: "📊", title: "Clinic Analytics", desc: "Revenue reports, patient retention, appointment fill rates, treatment popularity — live dashboard." },
  { icon: "🔗", title: "WhatsApp Integration", desc: "Appointment confirmations, reminders, and follow-ups sent automatically via WhatsApp." },
];

const stats = [
  { stat: "100%", label: "Paperless in 7 days" },
  { stat: "40%", label: "Admin time saved" },
  { stat: "0", label: "Records lost" },
  { stat: "4.9★", label: "Clinic satisfaction" },
];

const modules = [
  "Patient Records", "Appointment Calendar", "Billing & Payments", "Prescription Management",
  "SMS/WhatsApp Reminders", "Lab Results Tracking", "Staff Management", "Revenue Reports",
  "Patient Mobile App", "Online Booking", "Insurance Claims", "Inventory Management",
];

function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section className="py-16 bg-white" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-[#00283C] mb-3">
            Everything in <span className="gradient-heading">One Platform</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">No more paper files, no more missed appointments, no more lost billing records.</p>
        </motion.div>
        <FeatureCardGrid items={features} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" />
      </div>
    </section>
  );
}

function ModulesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section className="py-14 bg-[#F8FAFC]" ref={ref}>
      <div className="max-w-4xl mx-auto px-6">
        <AnimatedSurface className="p-10 text-center border border-gray-100">
          <h2 className="text-2xl font-bold text-[#00283C] mb-2">All Modules Included</h2>
          <p className="text-sm text-gray-400 mb-6">One subscription. Everything your clinic needs.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {modules.map((m) => (
              <span key={m} className="px-4 py-2 rounded-full text-sm text-gray-600 bg-white border border-gray-200">{m}</span>
            ))}
          </div>
        </AnimatedSurface>
      </div>
    </section>
  );
}

export default function EHRPlatformPage() {
  return (
    <PageWrapper>
      <ServicePageHero
        badge="EHR PLATFORM FOR CLINICS"
        headline="Go Fully Paperless in"
        highlight="7 Days"
        subheadline="Our clinic management platform handles patient records, appointments, billing, and communications — built specifically for dental and aesthetic clinics across the United States."
      />

      {/* Stats bar */}
      <section className="py-12 bg-[#F8FAFC] border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-extrabold text-[#00283C] mb-1">{s.stat}</div>
              <div className="text-sm text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Live EHR dashboard graphic — same as home page */}
      <EHRDashboard />

      <FeaturesSection />
      <ModulesSection />
      <FinalCTA />
    </PageWrapper>
  );
}
