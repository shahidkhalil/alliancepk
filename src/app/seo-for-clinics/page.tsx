"use client";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import SEORankingMockup from "@/components/SEORankingMockup";
import FinalCTA from "@/components/FinalCTA";
import { FeatureCardGrid, ContentCardList } from "@/components/ui/Card";

const features = [
  { icon: "🔑", title: "Keyword Research & Strategy", desc: "We find exactly what patients type into Google for your treatments — 'dental implants cost Houston', 'best botox clinic Los Angeles' — and build a plan around it." },
  { icon: "📝", title: "On-Page SEO Optimisation", desc: "Title tags, headings, content structure, and internal links optimised on every page of your site." },
  { icon: "📄", title: "Treatment Landing Pages", desc: "A dedicated, optimised page for every treatment you offer — implants, whitening, botox, laser — each built to rank on its own." },
  { icon: "🛠️", title: "Technical SEO Audit & Fixes", desc: "Site speed, mobile usability, broken links, and indexing issues — found and fixed before they cost you rankings." },
  { icon: "🔗", title: "Monthly Backlink Building", desc: "Authoritative healthcare and local directory links built every month to grow your site's authority over time." },
  { icon: "📊", title: "Ranking Progress Reports", desc: "Track exactly where you rank for every target keyword, updated monthly." },
];

const stats = [
  { stat: "100%", label: "Organic — no ad spend" },
  { stat: "6 months", label: "To consistent page 1" },
  { stat: "10+", label: "Treatment keywords targeted" },
  { stat: "0", label: "Cost per organic click" },
];

const faqs = [
  { q: "How is this different from Local SEO?", a: "Local SEO ranks you on Google Maps for 'near me' searches. This service ranks your website on Google's regular search results for the specific treatments you offer — both work together for full coverage." },
  { q: "How long until I see results?", a: "Some quick wins show in 4-6 weeks, but consistent page-1 rankings for competitive treatment keywords typically take 4-6 months of sustained work." },
  { q: "Do I need a new website for this to work?", a: "Not necessarily. We audit your existing site first — if the foundation is solid, we optimise it. If it's holding you back, we'll recommend a rebuild." },
];

export default function SEOForClinics() {
  return (
    <PageWrapper>
      <ServicePageHero
        badge="SEO FOR CLINICS"
        headline="Page 1 for the Treatments"
        highlight="Patients Search For"
        subheadline="Long-term organic rankings for dental implants, teeth whitening, botox, and every other treatment your patients are already searching for on Google."
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
            Watch Your Ranking <span className="gradient-heading">Climb to #1</span>
          </h2>
          <p className="text-gray-500">From buried on page 3 to the top organic result for your highest-value treatment keywords.</p>
        </div>
        <SEORankingMockup />
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-[#00283C] text-center mb-3">
            SEO Built Around <span className="gradient-heading">Your Treatments</span>
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            Not generic SEO — every keyword, page, and link is built around the treatments your clinic actually offers.
          </p>
          <FeatureCardGrid items={features} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" />
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
