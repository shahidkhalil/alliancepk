"use client";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import FinalCTA from "@/components/FinalCTA";
import { FeatureCardGrid, AnimatedSurface, ContentCardList } from "@/components/ui/Card";

const services = [
  {
    title: "24/7 Maya AI Receptionist",
    desc: "Answer routine patient questions, capture caller details, and handle appointment requests after hours or when your Houston front desk is busy.",
    href: "/ai-receptionist",
  },
  {
    title: "WhatsApp Patient Automation",
    desc: "Respond instantly to common inquiries, qualify prospective patients, share relevant information, and guide conversations toward booking.",
    href: "/whatsapp-ai-automation",
  },
  {
    title: "Automated Lead Follow-Up",
    desc: "Follow up with unbooked website, ad, and WhatsApp inquiries so interested patients do not disappear after the first conversation.",
    href: "/whatsapp-ai-automation",
  },
  {
    title: "Appointment Booking Workflows",
    desc: "Collect the treatment, timing, and contact details your team needs, then create a clear path from inquiry to confirmed appointment.",
    href: "/ai-receptionist",
  },
  {
    title: "Website & Marketing Integration",
    desc: "Connect AI conversations to your website, local SEO pages, and paid campaigns so every patient-acquisition channel has a fast response layer.",
    href: "/digital-marketing-for-clinics",
  },
  {
    title: "Conversion & Lead Tracking",
    desc: "Measure calls, chats, forms, qualified inquiries, and completed booking actions to understand where automation improves patient conversion.",
    href: "/business-growth-audit",
  },
];

const growthSystem = [
  { icon: "💬", title: "Answer Instantly", desc: "AI handles common treatment, location, availability, and booking questions without making patients wait for a callback." },
  { icon: "🎯", title: "Qualify Inquiries", desc: "Structured conversations collect the patient’s service interest, preferred timing, and contact details for your team." },
  { icon: "📅", title: "Move Patients Toward Booking", desc: "Automated workflows provide the right next step and reduce the number of inquiries lost between first contact and appointment." },
  { icon: "📈", title: "Track Conversion", desc: "Measure calls, chats, forms, qualified leads, and completed booking actions—not only traffic or message volume." },
];

const supportingServices = [
  {
    title: "Digital Marketing",
    desc: "Google and Meta campaigns focused on priority treatments and Houston service areas.",
    href: "/digital-marketing-for-clinics",
  },
  {
    title: "Clinic Website Design",
    desc: "Fast, mobile-first websites designed to explain services clearly and convert visitors.",
    href: "/clinic-website-design",
  },
  {
    title: "Search Engine Optimization",
    desc: "Treatment-focused content and technical SEO that build sustainable organic visibility.",
    href: "/seo-for-clinics",
  },
  {
    title: "Local SEO & Google Maps",
    desc: "Improve local relevance, profile quality, and visibility for nearby patient searches.",
    href: "/local-seo-for-clinics",
  },
  {
    title: "Clinic Mobile Apps",
    desc: "Branded mobile experiences for patient access, communication, and engagement.",
    href: "/clinic-mobile-app",
  },
  {
    title: "EHR Platform",
    desc: "Explore connected clinic technology for records, workflows, and operational management.",
    href: "/ehr-platform",
  },
];

const liveTools = [
  {
    title: "Try Maya AI Receptionist",
    desc: "Experience how an AI conversation can answer questions and guide a patient toward booking.",
    href: "/ai-receptionist",
  },
  {
    title: "Run a Free Website Audit",
    desc: "Check your clinic website for SEO, mobile, performance, trust, and conversion opportunities.",
    href: "/free-website-audit",
  },
  {
    title: "Get an AI Business Growth Audit",
    desc: "Answer five questions to receive a tailored growth score, opportunities, and action plan.",
    href: "/business-growth-audit",
  },
];

const areas = ["Downtown", "The Heights", "Montrose", "River Oaks", "Midtown", "Katy", "Sugar Land", "The Woodlands", "Pearland", "Bellaire"];

const faqs = [
  {
    q: "How can AI automation help a Houston dental clinic?",
    a: "AI automation can respond to common questions, capture patient details, qualify treatment interest, support appointment requests, and follow up with unbooked inquiries. It helps reduce delays when staff are busy or the clinic is closed.",
  },
  {
    q: "Does an AI receptionist replace our front-desk team?",
    a: "No. It supports the team by handling repetitive and after-hours conversations, collecting structured information, and routing patients toward the next step. Staff remain responsible for clinical questions, exceptions, and sensitive patient needs.",
  },
  {
    q: "Can the AI answer questions about our dental treatments?",
    a: "Yes. It can be configured with approved information about services, office hours, locations, general pricing guidance, insurance policies, and booking rules. It should not diagnose conditions or replace professional clinical advice.",
  },
  {
    q: "Can AI automation work with our website and WhatsApp?",
    a: "Yes. Automation can support website chat, WhatsApp conversations, and phone workflows, depending on your setup. The goal is to provide a consistent response and booking experience across the channels Houston patients already use.",
  },
  {
    q: "How do we know whether the automation is working?",
    a: "Track response time, qualified inquiries, appointment requests, completed bookings, after-hours leads, and the percentage of conversations requiring staff support. These metrics show whether automation is improving patient conversion and reducing front-desk workload.",
  },
];

export default function DentalClinicHouston() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <PageWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ServicePageHero
        badge="AI AUTOMATION FOR DENTAL CLINICS — HOUSTON, TX"
        headline="AI Automation That Helps Houston Dental Clinics"
        highlight="Convert More Inquiries"
        subheadline="AI receptionist, WhatsApp automation, lead follow-up, and appointment workflows that respond quickly and support your front desk around the clock."
        ctaText="Try Maya AI Receptionist"
        ctaHref="/ai-receptionist"
      />

      <section className="py-14 lg:py-20 bg-[#F8FAFC] border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] mb-5">
            AI automation helps Houston clinics respond before patients move on
          </h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Patients in Houston often contact several dental clinics before choosing where to book. When a
              call is missed, a WhatsApp message sits unanswered, or a website inquiry waits until the next
              business day, that patient may schedule elsewhere. Busy front-desk teams cannot always respond
              instantly while also supporting patients inside the clinic.
            </p>
            <p>
              Alliance Tech builds AI automation for dental clinics in Houston, TX. Our systems can answer
              approved questions, collect patient details, qualify treatment interest, support appointment
              requests, and follow up with leads across phone, website, and WhatsApp channels. The automation
              supports your staff; it does not diagnose patients or replace clinical judgment.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-[#00283C] text-center mb-3">
            AI automation services for <span className="gradient-heading">Houston dental clinics</span>
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect patient conversations, lead follow-up, and appointment workflows into one responsive system.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service) => (
              <a
                key={service.title}
                href={service.href}
                className="card-white card-motion group p-6 no-underline"
              >
                <h3 className="text-base font-extrabold text-[#00283C] mb-3">{service.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{service.desc}</p>
                <span className="text-sm font-bold text-[#0077A8]">Learn more →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F8FAFC] border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] mb-3">
              From first question to appointment request
            </h2>
            <p className="text-gray-500 leading-relaxed">
              AI automation reduces friction across the patient journey while giving your team structured,
              useful information for follow-up.
            </p>
          </div>
          <FeatureCardGrid items={growthSystem} className="grid md:grid-cols-2 gap-5" />
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#0077A8] mb-3">
              Complete clinic growth services
            </p>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] mb-3">
              AI-first automation, supported by every service your clinic needs
            </h2>
            <p className="text-gray-500 leading-relaxed">
              AI converts demand more effectively when the website, search visibility, advertising, and
              clinic technology around it are also strong. Alliance Tech can deliver these services
              individually or as one connected growth system.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportingServices.map((service) => (
              <a
                key={service.title}
                href={service.href}
                className="card-white card-motion p-5 no-underline"
              >
                <h3 className="font-extrabold text-[#00283C] mb-2">{service.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{service.desc}</p>
                <span className="text-sm font-bold text-[#0077A8]">View service →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#00283C]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-9">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7DD3EA] mb-3">Try our live tools</p>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-3">
              Test the technology before you choose a service
            </h2>
            <p className="text-white/60 leading-relaxed">
              Use the existing demos and audits to identify opportunities for your Houston clinic.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {liveTools.map((tool) => (
              <a
                key={tool.title}
                href={tool.href}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 no-underline"
              >
                <h3 className="font-extrabold text-white mb-2">{tool.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed mb-4">{tool.desc}</p>
                <span className="text-sm font-bold text-[#7DD3EA]">Open tool →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F8FAFC] border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSurface className="p-10 text-center border border-gray-100">
            <h2 className="text-2xl font-bold text-[#00283C] mb-3">AI automation for clinics across Greater Houston</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-2xl mx-auto">
              Configure patient communication around each clinic’s location, office hours, services, and
              booking process—from central Houston to surrounding communities.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {areas.map((a) => (
                <span key={a} className="px-4 py-2 rounded-full text-sm font-semibold text-[#0077A8] bg-white border border-[#00B4D8]/30">{a}</span>
              ))}
            </div>
          </AnimatedSurface>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 grid lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-extrabold text-[#00283C] mb-4">
              AI trained around your clinic’s approved information
            </h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                A general dentistry practice needs different conversations from an implant center,
                orthodontic office, pediatric dentist, or cosmetic clinic. We configure automation around
                your treatments, locations, office hours, accepted contact methods, and booking rules.
              </p>
              <p>
                Clear boundaries are essential. The AI can provide approved administrative information and
                direct urgent or clinical questions to appropriate staff, but it should not diagnose symptoms,
                recommend treatment, or present itself as a licensed healthcare professional.
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#00283C] mb-4">
              Automation connected to your marketing
            </h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                Local SEO, Google Ads, Meta campaigns, and treatment pages create inquiries. AI adds the
                response layer that engages those patients quickly, including after hours and during busy
                periods when manual follow-up may be delayed.
              </p>
              <p>
                Conversion tracking then shows which sources produce calls, chats, forms, qualified leads, and
                booking actions. This helps your clinic improve both patient acquisition and the workflow that
                converts demand into appointments.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] text-center mb-3">
            Houston dental AI automation FAQs
          </h2>
          <p className="text-gray-500 text-center mb-9">
            Practical answers for clinics considering AI reception, WhatsApp, and booking automation.
          </p>
          <ContentCardList items={faqs} cardClassName="p-6 border border-gray-100" />
        </div>
      </section>

      <section className="py-14 bg-[#F8FAFC] border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-[#00283C] mb-4">Helpful resources for Houston clinics</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <a href="/blog/how-clinics-get-more-patients-houston-texas" className="font-semibold text-[#0077A8] hover:text-[#00283C]">
              How clinics can get more patients in Houston and Texas →
            </a>
            <a href="/business-growth-audit" className="font-semibold text-[#0077A8] hover:text-[#00283C]">
              Run your free AI Business Growth Audit →
            </a>
            <a href="/blog/houston-ai-receptionist-for-clinics" className="font-semibold text-[#0077A8] hover:text-[#00283C]">
              AI receptionist guide for Houston clinics →
            </a>
            <a href="/ai-receptionist" className="font-semibold text-[#0077A8] hover:text-[#00283C]">
              Try the live AI receptionist →
            </a>
          </div>
        </div>
      </section>

      <FinalCTA />
    </PageWrapper>
  );
}
