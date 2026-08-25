"use client";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import WebsitePreviewMockup from "@/components/WebsitePreviewMockup";
import ResponsiveShowcaseMockup from "@/components/ResponsiveShowcaseMockup";
import FinalCTA from "@/components/FinalCTA";
import { FeatureCardGrid, AnimatedSurface } from "@/components/ui/Card";
import { CheckCircle2 } from "lucide-react";

const features = [
  { icon: "🎨", title: "Custom Design — No Templates", desc: "Built from scratch around your clinic's brand, services, and patient journey. Never a recycled theme." },
  { icon: "⚡", title: "Mobile-First & Fast-Loading", desc: "Most patients book from their phone. Your site is built mobile-first and loads in under 2 seconds." },
  { icon: "🔍", title: "SEO-Optimised From Day One", desc: "Proper page structure, meta tags, and content hierarchy baked in from launch — not bolted on later." },
  { icon: "📅", title: "Online Booking Integration", desc: "Patients book an appointment directly on your site, 24/7, without picking up the phone." },
  { icon: "📈", title: "Google Analytics Setup", desc: "Know exactly how many visitors you get, where they come from, and what they do on your site." },
  { icon: "🛠️", title: "12 Months Hosting Included", desc: "Hosting, SSL, and basic maintenance included for a full year after launch — no surprise bills." },
];

const stats = [
  { stat: "7 days", label: "From brief to live" },
  { stat: "3x", label: "More enquiries vs old site" },
  { stat: "< 2s", label: "Average load time" },
  { stat: "100%", label: "Mobile-optimised" },
];

const targetTypes = ["Dental Clinics", "Aesthetic & Skin Clinics", "Multi-Branch Practices", "New Clinic Launches", "Clinics Replacing Outdated Sites"];

export default function ClinicWebsiteDesign() {
  return (
    <PageWrapper>
      <ServicePageHero
        badge="WEBSITES FOR CLINICS"
        headline="A Website That Converts"
        highlight="From Day One"
        subheadline="Live in 7 days. Mobile-first, fast-loading, and built to turn visitors into booked patients — not just look good."
      />

      <section className="bg-white border-b border-gray-100">
        <ResponsiveShowcaseMockup />
      </section>

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

      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] mb-3">
            A Site Built to <span className="gradient-heading">Turn Visitors Into Patients</span>
          </h2>
          <p className="text-gray-500">Clean design, fast load times, and a booking flow that converts — see it in action.</p>
        </div>
        <WebsitePreviewMockup />
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-[#00283C] text-center mb-3">
            Everything Your Clinic Site <span className="gradient-heading">Needs to Convert</span>
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            Not a template — a website engineered to turn visitors into booked appointments.
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
