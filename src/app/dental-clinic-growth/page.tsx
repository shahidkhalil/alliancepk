"use client";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import FinalCTA from "@/components/FinalCTA";
import { FeatureCardGrid, AnimatedSurface } from "@/components/ui/Card";
import { CheckCircle2 } from "lucide-react";

const features = [
  { icon: "📣", title: "Google & Meta Ads", desc: "Targeted campaigns that bring patients actively searching for dental services — not random traffic." },
  { icon: "🌐", title: "Dental Clinic Websites", desc: "Fast, professional websites that convert visitors into booked appointments. Mobile-first, SEO-optimised." },
  { icon: "📱", title: "Mobile App for Your Clinic", desc: "Your own branded app — patients book, view records, get reminders, and pay with your logo on their phone." },
  { icon: "📍", title: "Google Business Profile", desc: "Rank #1 for 'dentist near me' searches and dominate local Google Maps results in your city." },
  { icon: "⭐", title: "Reputation Management", desc: "Automatically collect 5-star Google reviews after every appointment to build trust and outrank competitors." },
  { icon: "📊", title: "Live Analytics Dashboard", desc: "See every dollar spent, every lead generated, every booking made — in a real-time dashboard updated daily." },
];

const results = [
  { stat: "320%", label: "More monthly appointments" },
  { stat: "4x", label: "Return on ad spend" },
  { stat: "#1", label: "Google ranking in 60 days" },
  { stat: "0", label: "Missed leads after automation" },
];

const targetTypes = ["General Dental Clinics", "Orthodontists", "Implant Specialists", "Cosmetic Dentists", "Paediatric Dentists", "Multi-Chair Practices", "New Clinic Startups"];

export default function DentalClinicGrowth() {
  return (
    <PageWrapper>
      <ServicePageHero
        badge="DIGITAL MARKETING FOR DENTISTS"
        headline="More Dental Patients,"
        highlight="Every Single Month"
        subheadline="We build websites, run ads, and create mobile apps for dental clinics across the United States — everything under one roof, so you can focus on treating patients."
      />

      <section className="py-12 border-b border-gray-100 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {results.map((r) => (
            <div key={r.label}>
              <div className="text-4xl font-extrabold text-[#00283C] mb-1">{r.stat}</div>
              <div className="text-sm text-gray-400">{r.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-[#00283C] text-center mb-3">
            Full-Stack Dental <span className="gradient-heading">Growth System</span>
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            Everything your dental clinic needs to attract patients, automate bookings, and grow revenue.
          </p>
          <FeatureCardGrid items={features} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" />
        </div>
      </section>

      <section className="py-14 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSurface className="p-10 text-center border border-gray-100">
            <h2 className="text-2xl font-bold text-[#00283C] mb-6">Perfect For</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {targetTypes.map((t) => (
                <span key={t} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-600 bg-white border border-gray-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00B4D8]" strokeWidth={2.5} />
                  {t}
                </span>
              ))}
            </div>
          </AnimatedSurface>
        </div>
      </section>

      <FinalCTA />
    </PageWrapper>
  );
}
