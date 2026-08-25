"use client";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import MobileAppMockup from "@/components/MobileAppMockup";
import FinalCTA from "@/components/FinalCTA";
import { FeatureCardGrid, ContentCardList } from "@/components/ui/Card";

const features = [
  { icon: "📱", title: "Branded iOS & Android App", desc: "Your clinic's logo, colours, and name — on every patient's home screen. Not a white-label generic app." },
  { icon: "📅", title: "Appointment Booking & Management", desc: "Patients book, reschedule, or cancel appointments themselves — no phone calls, no front-desk bottleneck." },
  { icon: "🗂️", title: "Digital Patient Records Access", desc: "Patients view their treatment history, prescriptions, and reports anytime, right from the app." },
  { icon: "🔔", title: "Push Notification Reminders", desc: "Automated appointment reminders and aftercare notifications that cut no-shows dramatically." },
  { icon: "💳", title: "Stripe & Apple Pay Payments", desc: "Patients pay for appointments and treatments directly in the app, with the payment methods they already use." },
  { icon: "🖥️", title: "Staff Admin Dashboard", desc: "Your team manages bookings, patients, and notifications from one simple dashboard." },
];

const stats = [
  { stat: "iOS + Android", label: "Both platforms" },
  { stat: "60%", label: "Fewer no-shows" },
  { stat: "100%", label: "Your branding" },
  { stat: "24/7", label: "Self-service booking" },
];

const faqs = [
  { q: "How long does it take to launch?", a: "Typically 3-4 weeks from kickoff to App Store / Play Store launch, depending on the features you need." },
  { q: "Do patients need to create accounts?", a: "Yes — a quick signup with phone number verification. We keep it to under 60 seconds so patients don't drop off." },
  { q: "Can it connect to our existing EHR?", a: "Yes. The app integrates directly with our EHR platform, or with most existing clinic management systems via API." },
];

export default function ClinicMobileApp() {
  return (
    <PageWrapper>
      <ServicePageHero
        badge="MOBILE APP FOR CLINICS"
        headline="Your Brand on Every"
        highlight="Patient's Phone"
        subheadline="A fully branded iOS and Android app for your clinic — booking, records, reminders, and payments, all under your own name and logo."
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
            Booking, Reminders & Records — <span className="gradient-heading">In Your App</span>
          </h2>
          <p className="text-gray-500">A self-service experience patients actually use, branded entirely as yours.</p>
        </div>
        <MobileAppMockup />
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-[#00283C] text-center mb-3">
            Everything Patients Need, <span className="gradient-heading">In Your App</span>
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            A self-service experience that cuts front-desk workload and keeps patients coming back.
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
