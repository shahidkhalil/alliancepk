"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import AdsCampaignMockup from "@/components/AdsCampaignMockup";
import FinalCTA from "@/components/FinalCTA";
import { ContentCardList } from "@/components/ui/Card";

const featured = {
  icon: "📣",
  title: "Google Search & Display Ads",
  desc: "Show up the moment a patient searches 'dental implants Houston' or 'botox near me.' Targeted to your treatments and your city, not generic clicks bought in bulk.",
};

const features = [
  { icon: "📱", title: "Facebook & Instagram Ads", desc: "Scroll-stopping creative aimed at people in your area who match your ideal patient profile, not random reach." },
  { icon: "🎯", title: "Audience Targeting by Treatment", desc: "Separate campaigns for implants, whitening, botox, and laser, so budget goes only to patients looking for that exact treatment." },
  { icon: "✍️", title: "Ad Creative & Copywriting", desc: "Every ad is written and designed around your clinic's real services and offers. No generic templates." },
  { icon: "📊", title: "Weekly Performance Reports", desc: "What you spent, how many leads came in, and what each booked patient cost. Every week, no exceptions." },
  { icon: "🤝", title: "Monthly Strategy Calls", desc: "A real review every month: what's working, what to scale, what to cut." },
];

const stats = [
  { stat: "4x", label: "Avg. return on ad spend" },
  { stat: "30 days", label: "To first patient results" },
  { stat: "100+", label: "Clinics run campaigns for" },
  { stat: "2", label: "Ad platforms covered" },
];

const faqs = [
  { q: "How much should I budget for ads?", a: "Most clinics start between $2,000 and $6,000 per month in ad spend, scaled up once we see what's converting. We'll recommend a number based on your city and treatments." },
  { q: "How is this different from a generic marketing agency?", a: "We only run campaigns for dental and aesthetic clinics. Every targeting strategy, ad angle, and landing page is built specifically for healthcare patient acquisition, not adapted from a retail or e-commerce playbook." },
  { q: "Do you handle the ad spend or just management?", a: "You keep control of your own ad account and budget. We manage strategy, creative, targeting, and optimisation, with full transparency on every dollar spent." },
];

function FeatureRow({ f, i }: { f: { icon: string; title: string; desc: string }; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.4 }}
      transition={{ delay: i * 0.06, duration: 0.5 }}
      className={`flex gap-4 py-5 ${i > 0 ? "border-t border-gray-100" : ""}`}
    >
      <span className="text-2xl flex-shrink-0">{f.icon}</span>
      <div>
        <h3 className="text-sm font-bold text-[#00283C] mb-1">{f.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
      </div>
    </motion.div>
  );
}

export default function DigitalMarketingForClinics() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <PageWrapper>
      <ServicePageHero
        badge="DIGITAL MARKETING FOR CLINICS"
        headline="Patients Actively Searching"
        highlight="For Your Treatments"
        subheadline="Google and Meta ad campaigns built exclusively for dental and aesthetic clinics across the United States, targeted by city and treatment, not generic templates."
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
            See Your Campaigns <span className="gradient-heading">Live, Every Day</span>
          </h2>
          <p className="text-gray-500">A real-time view of spend, leads, and cost per lead across every platform. No guesswork.</p>
        </div>
        <AdsCampaignMockup />
      </section>

      <section className="py-16 lg:py-20 bg-white" ref={ref}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[0.85fr_1fr] gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55 }}
            className="rounded-2xl p-8 bg-[#00283C] text-white lg:sticky lg:top-28"
          >
            <span className="text-3xl mb-5 inline-block">{featured.icon}</span>
            <h2 className="text-2xl lg:text-[1.7rem] font-extrabold tracking-tight leading-tight mb-4">
              Campaigns built for clinics, <span style={{ color: "#00B4D8" }}>not retail.</span>
            </h2>
            <p className="text-white/65 leading-relaxed mb-5">{featured.desc}</p>
            <p className="text-white/60 text-sm leading-relaxed">Every campaign is tailored to your clinic type, location, and target patient. Never a copy-paste template.</p>
          </motion.div>

          <div className="lg:pt-2">
            {features.map((f, i) => <FeatureRow key={f.title} f={f} i={i} />)}
          </div>
        </div>
      </section>

      <section className="py-14 bg-[#F8FAFC]">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#00283C] text-center mb-8">Common Questions</h2>
          <ContentCardList items={faqs} cardClassName="p-6 border border-gray-100" />
        </div>
      </section>

      <FinalCTA />
    </PageWrapper>
  );
}
