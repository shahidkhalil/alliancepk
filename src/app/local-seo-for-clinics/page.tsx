"use client";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import GoogleMapsMockup from "@/components/GoogleMapsMockup";
import FinalCTA from "@/components/FinalCTA";
import { FeatureCardGrid, AnimatedSurface } from "@/components/ui/Card";

const features = [
  { icon: "📍", title: "Google Business Profile", desc: "Full optimisation of your GBP listing — photos, categories, hours, Q&A, posts, and review responses." },
  { icon: "🗺️", title: "Google Maps Ranking", desc: "Local citation building, NAP consistency, and map pack optimisation to rank #1 in your area." },
  { icon: "⭐", title: "Review Generation", desc: "Automated post-appointment review requests that grow your Google rating to 4.9+ stars fast." },
  { icon: "🔍", title: "Local Keyword Targeting", desc: "'Dentist in Midtown', 'aesthetic clinic River Oaks' — we rank you for every local search your patients make." },
  { icon: "📄", title: "Local Landing Pages", desc: "Area-specific pages that rank for neighbourhood searches — Downtown, The Heights, Montrose, and more." },
  { icon: "🔗", title: "Citation & Link Building", desc: "50+ local directory listings and local backlinks that signal authority to Google." },
];

const stats = [
  { stat: "#1", label: "Google Maps ranking" },
  { stat: "60", label: "Days to results" },
  { stat: "5x", label: "More local leads" },
  { stat: "4.9★", label: "Average review score" },
];

const cities = ["Houston", "Los Angeles", "Chicago", "Dallas", "Austin", "San Antonio", "Phoenix", "Miami"];

export default function LocalSEOForClinics() {
  return (
    <PageWrapper>
      <ServicePageHero
        badge="LOCAL SEO FOR CLINICS"
        headline="Rank #1 on Google Maps"
        highlight="in Your City"
        subheadline="When patients search 'dentist near me' or 'aesthetic clinic in Houston' — your clinic appears first. We make that happen in 60 days."
      />

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
            Be the Pin Patients <span className="gradient-heading">Click First</span>
          </h2>
          <p className="text-gray-500">A fully optimised Google Business Profile that ranks above every nearby competitor.</p>
        </div>
        <GoogleMapsMockup />
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-[#00283C] text-center mb-3">
            How We Get You to <span className="gradient-heading">Position #1</span>
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            A proven 6-step system that puts your clinic at the top of Google Maps — and keeps it there.
          </p>
          <FeatureCardGrid items={features} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" />
        </div>
      </section>

      <section className="py-14 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSurface className="p-10 text-center border border-gray-100">
            <h2 className="text-2xl font-bold text-[#00283C] mb-2">Cities We Operate In</h2>
            <p className="text-sm text-gray-400 mb-6">Local SEO for clinics in major US cities.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {cities.map((c) => (
                <span key={c} className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#0077A8] bg-white border border-[#00B4D8]/30">{c}</span>
              ))}
            </div>
          </AnimatedSurface>
        </div>
      </section>

      <FinalCTA />
    </PageWrapper>
  );
}
