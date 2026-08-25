"use client";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import FinalCTA from "@/components/FinalCTA";
import { FeatureCardGrid, AnimatedSurface } from "@/components/ui/Card";
import { CheckCircle2 } from "lucide-react";

const features = [
  { icon: "📣", title: "Google & Meta Ads", desc: "Campaigns targeting patients searching for fillers, Botox, laser, and aesthetics — not generic clicks." },
  { icon: "🌐", title: "Aesthetic Clinic Website", desc: "Elegant, mobile-first website that showcases your treatments and converts visitors into consultations." },
  { icon: "📸", title: "Instagram & TikTok Growth", desc: "Content strategy and posting for aesthetic clinics — before/afters, reels, and patient testimonials that go viral." },
  { icon: "📍", title: "Local SEO", desc: "Rank at the top of Google when patients search 'aesthetic clinic near me' or 'botox in Houston'." },
  { icon: "⭐", title: "5-Star Reviews", desc: "Automated post-appointment review requests that build your Google rating to 4.9+ stars." },
  { icon: "📊", title: "Live Analytics", desc: "See every ad, every lead, every booking in a real-time dashboard — updated daily." },
];

const results = [
  { stat: "3x", label: "More consultation bookings" },
  { stat: "4x", label: "Return on ad spend" },
  { stat: "90%", label: "Client retention rate" },
  { stat: "7", label: "Days to go live" },
];

const treatments = ["Botox & Fillers", "Laser Treatments", "Skin Whitening", "Hair Transplant", "Rhinoplasty", "PRP Therapy", "Chemical Peels", "Body Contouring"];

export default function AestheticClinicGrowth() {
  return (
    <PageWrapper>
      <ServicePageHero
        badge="DIGITAL MARKETING FOR AESTHETIC CLINICS"
        headline="More Aesthetic Patients,"
        highlight="More Revenue"
        subheadline="We help aesthetic clinics across the United States attract high-value patients through targeted ads, SEO, and social media — everything under one roof."
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
            Full-Stack Aesthetic <span className="gradient-heading">Growth System</span>
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            Everything your aesthetic clinic needs to attract high-value patients and grow sustainably.
          </p>
          <FeatureCardGrid items={features} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" />
        </div>
      </section>

      <section className="py-14 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSurface className="p-10 text-center border border-gray-100">
            <h2 className="text-2xl font-bold text-[#00283C] mb-2">Treatments We Market</h2>
            <p className="text-sm text-gray-400 mb-6">We know the keywords, the audience, and the funnel for each treatment.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {treatments.map((t) => (
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
