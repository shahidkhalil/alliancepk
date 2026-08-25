"use client";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import FinalCTA from "@/components/FinalCTA";
import { FeatureCardGrid, AnimatedSurface } from "@/components/ui/Card";
import { staggerDelay } from "@/lib/motionVariants";
import WhatsAppDemo from "@/components/WhatsAppDemo";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  { icon: "⚡", title: "Instant Replies", desc: "Patients get a response within 5 seconds — any time of day. No waiting. No ghosting." },
  { icon: "📅", title: "Auto Appointment Booking", desc: "The AI qualifies the patient, checks availability, and confirms the slot — all on WhatsApp." },
  { icon: "🔔", title: "Reminders & Confirmations", desc: "Sends automated appointment reminders 24 hours and 1 hour before — dramatically reduces no-shows." },
  { icon: "💬", title: "Handles FAQs", desc: "Pricing, procedures, directions, availability — the AI answers in English, accurately, every time." },
  { icon: "🔁", title: "Re-engagement Campaigns", desc: "Automatically follows up with patients who haven't visited in 3–6 months. Brings them back." },
  { icon: "📊", title: "Conversation Analytics", desc: "See every conversation, lead status, and booking outcome in your clinic dashboard." },
];

const stats = [
  { stat: "5s", label: "Reply time" },
  { stat: "3x", label: "More bookings" },
  { stat: "60%", label: "Fewer no-shows" },
  { stat: "24/7", label: "Always on" },
];

const steps = [
  { n: "01", title: "Patient sends a WhatsApp message", desc: "Any question — pricing, availability, treatment info — the AI handles it immediately." },
  { n: "02", title: "AI qualifies and collects details", desc: "Gathers name, treatment interest, and preferred time — like a trained receptionist." },
  { n: "03", title: "Appointment booked and confirmed", desc: "Checks your calendar, books the slot, sends a confirmation — all within seconds." },
  { n: "04", title: "Automated reminders sent", desc: "Day-before and hour-before reminders reduce no-shows by up to 60%." },
];

function StepsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section className="py-14 bg-[#F8FAFC]" ref={ref}>
      <div className="max-w-3xl mx-auto px-6">
        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-[#00283C] text-center mb-8">How It Works</motion.h2>
        <div className="space-y-4">
          {steps.map((s, i) => (
            <AnimatedSurface key={s.n} delay={staggerDelay(i)} className="p-6 border border-gray-100 flex gap-5">
              <div className="text-2xl font-extrabold text-[#00B4D8] flex-shrink-0 w-10">{s.n}</div>
              <div>
                <h3 className="font-bold text-[#00283C] mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            </AnimatedSurface>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <section className="py-16 bg-white" ref={ref}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-[#00283C] mb-3">
            What It <span className="gradient-heading">Does Automatically</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">Every patient message handled. Every booking confirmed. Zero human effort required.</p>
        </motion.div>
        <FeatureCardGrid items={features} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" />
      </div>
    </section>
  );
}

export default function WhatsAppAIAutomation() {
  return (
    <PageWrapper>
      <ServicePageHero
        badge="WHATSAPP AI FOR CLINICS"
        headline="Reply to Every Patient"
        highlight="in Under 5 Seconds"
        subheadline="Our WhatsApp AI handles patient messages, books appointments, and sends reminders — automatically, in English, round the clock."
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

      {/* Live WhatsApp graphic — same as home page */}
      <WhatsAppDemo />

      <FeaturesSection />
      <StepsSection />
      <FinalCTA />
    </PageWrapper>
  );
}
