"use client";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import AICallMockup from "@/components/AICallMockup";
import ReceptionistDemo from "@/components/ReceptionistDemo";
import FinalCTA from "@/components/FinalCTA";
import { FeatureCardGrid, ContentCardList } from "@/components/ui/Card";
import { useForm } from "@/context/FormContext";

const features = [
  { icon: "📞", title: "24/7 Call Answering", desc: "No more missed calls for your Houston clinic. The AI picks up every time — nights, weekends, public holidays — in natural English." },
  { icon: "💬", title: "Live Website Chat", desc: "The same AI receptionist answers chat on your website in real time, so patients get instant replies without ever picking up the phone." },
  { icon: "🟢", title: "WhatsApp Integration", desc: "Booking confirmations, reminders, and follow-ups land straight in the patient's WhatsApp — the channel Houston patients already check first." },
  { icon: "🎙️", title: "Live Voice Agent", desc: "Patients can talk to the AI receptionist directly, in real time, and get a natural spoken conversation — not a robotic phone tree." },
  { icon: "📅", title: "Automated Appointment Booking", desc: "It checks your calendar and books the next available slot automatically, straight into your system. No human needed." },
  { icon: "🚨", title: "Emergency Triage", desc: "Detects bleeding, severe pain, swelling, and other urgent symptoms — alerts your front desk, holds an emergency slot, and offers an immediate transfer." },
  { icon: "✅", title: "Instant Confirmations & Reminders", desc: "Every booking is confirmed by WhatsApp and email immediately, with automatic reminders that cut no-shows before they happen." },
  { icon: "🔁", title: "Missed-Call Follow-Ups", desc: "Calls back missed numbers automatically so no Houston patient who tried to reach you is ever left hanging." },
  { icon: "🧠", title: "Trained on Your Clinic", desc: "Trained on your services, prices, hours, and FAQs — gives accurate answers without ever putting patients on hold." },
  { icon: "🎯", title: "Patient Qualification", desc: "Asks the right questions to qualify each caller before booking, so your calendar fills with patients who actually show up." },
  { icon: "🗣️", title: "Voice Notes Support", desc: "Patients who'd rather speak than type can send a voice note and still get booked — no app download required." },
  { icon: "📊", title: "Call & Chat Analytics Dashboard", desc: "See every call, chat, duration, outcome, and booking — in a live dashboard updated in real time." },
  { icon: "🔗", title: "Connects to Your System", desc: "Integrates with your existing clinic software or our EHR platform — no manual data entry, no double-booking." },
];

const stats = [
  { stat: "0", label: "Missed calls" },
  { stat: "24/7", label: "Availability" },
  { stat: "3x", label: "More bookings" },
  { stat: "5s", label: "Answer time" },
];

const faqs = [
  { q: "Does it sound natural?", a: "Yes. The AI speaks natural, fluent English — no accent issues, no hold music." },
  { q: "What if a patient has a complex query?", a: "It handles common questions automatically and escalates complex cases to your human staff via WhatsApp. For emergencies (bleeding, severe pain, swelling), it runs triage: alerts your front desk, holds an emergency slot, and offers an immediate transfer." },
  { q: "How long to set up?", a: "Typically 3–5 days. We train it on your clinic, test it, and go live." },
  { q: "Does it work with my existing number?", a: "Yes. We port your existing clinic number or set up a new dedicated line." },
  { q: "How many calls can it handle at once?", a: "Unlimited — it answers every call and website chat simultaneously. Unlike a human front desk, it never puts patients on hold or misses a call during peak hours, lunch, or after closing." },
  { q: "Will it reduce no-shows at my clinic?", a: "Yes. It sends automatic WhatsApp confirmations and reminders before each appointment, which typically cuts no-shows significantly for busy clinics." },
  { q: "How much does an AI receptionist cost for a Houston clinic?", a: "Pricing depends on your call volume and features. For most busy Houston and Texas clinics it costs a fraction of a full-time receptionist's salary while handling far more calls. Book a free demo and we'll quote based on your clinic." },
  { q: "Can it book appointments into my calendar?", a: "Yes. It qualifies the patient, checks the service and preferred time, and books the appointment directly — then confirms by email and WhatsApp, with the booking landing in your system instantly." },
  { q: "Is it only for dental clinics?", a: "No. It works for dental, aesthetic, dermatology, hair transplant, and multi-specialty clinics — any high-volume practice losing patients to missed calls. It's trained on your specific services and prices." },
];

export default function AIReceptionist() {
  const { openForm } = useForm();

  return (
    <PageWrapper>
      <ServicePageHero
        badge="AI RECEPTIONIST FOR HOUSTON & TEXAS CLINICS"
        headline="Too Many Calls, Too Few Staff?"
        highlight="Never Miss a Patient Again"
        subheadline="Busy Houston clinics miss 25–40% of calls at peak hours — every one a lost patient. Our AI receptionist answers every call and chat at once, 24/7 in English, and books them automatically. Try the live demo below."
        ctaText="Get Your Free Clinic Audit"
        ctaHref="/free-website-audit"
      />

      <section className="py-8 sm:py-12 bg-[#F8FAFC] border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-2xl sm:text-4xl font-extrabold text-[#00283C] mb-0.5 sm:mb-1">{s.stat}</div>
              <div className="text-[11px] sm:text-sm text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="py-10 sm:py-16 bg-white border-b border-gray-100 scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center mb-6 sm:mb-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#00283C] mb-2 sm:mb-3">
            Try It <span className="gradient-heading">Right Now</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            This is a live AI receptionist for a sample clinic. Ask about prices, hours, treatments — or book an appointment.
          </p>
        </div>
        <ReceptionistDemo />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-8 sm:mt-10">
          <div className="rounded-2xl border border-[#00283C]/10 bg-[#F8FAFC] p-5 sm:p-6 text-center">
            <p className="text-base sm:text-lg font-bold text-[#00283C] mb-1">
              Like what you just tried?
            </p>
            <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
              Book a short setup call for your clinic — or run a free website audit first.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/free-website-audit"
                data-analytics-label="start_website_audit"
                data-analytics-location="maya_after_demo"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-[#00283C] text-white text-sm font-bold hover:bg-[#003D5C] transition-colors"
              >
                Free Clinic Audit
              </a>
              <button
                type="button"
                onClick={openForm}
                data-analytics-label="book_consultation"
                data-analytics-location="maya_after_demo"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-[#00283C]/20 text-[#00283C] text-sm font-bold hover:bg-white transition-colors"
              >
                Book a Strategy Call
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F8FAFC] border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] mb-3">
            Hear It <span className="gradient-heading">In Action</span>
          </h2>
          <p className="text-gray-500">A real call, answered, qualified, and booked — without a single human involved.</p>
        </div>
        <AICallMockup />
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-[#00283C] text-center mb-3">
            What the AI <span className="gradient-heading">Handles For You</span>
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            Every phone interaction your clinic receives — automated, professional, and never on hold.
          </p>
          <FeatureCardGrid items={features} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" />
        </div>
      </section>

      {/* SEO content — targets high-volume clinics by their pain */}
      <section className="py-16 bg-[#F8FAFC] border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] text-center mb-6">
            Built for <span className="gradient-heading">High-Volume Clinics</span>
          </h2>
          <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
            <p>
              If your clinic takes dozens of calls a day, your front desk is drowning. During peak hours the line is busy, patients hang up, and every unanswered call is a patient who just booked with the clinic down the road instead. Research shows clinics miss <strong>25–40% of incoming calls</strong> at their busiest — and most callers never try again.
            </p>
            <p>
              An <strong>AI receptionist</strong> removes that ceiling. It answers <strong>every call and website chat at once</strong>, 24/7, in English — no hold music, no voicemail, no missed patients after hours or on weekends. While your staff handles the patient in the chair, the AI handles the twenty patients trying to reach you: answering price and timing questions, qualifying them, and <strong>booking appointments straight into your calendar</strong>.
            </p>
            <p>
              For a busy dental, aesthetic, dermatology, or multi-specialty clinic, the math is simple. Recovering even <strong>5 missed bookings a day</strong> — at an average patient value of $500 — is over <strong>$40,000 a month</strong> in appointments you were already paying marketing to generate but losing at the phone. That&apos;s the leak an AI receptionist closes.
            </p>
            <p>
              It also cuts your <strong>no-show rate</strong> with automatic confirmations and reminders, and gives you a record of every conversation — so you finally see how many patients are calling after hours. It works alongside your existing staff and phone number, not instead of them: your team stops firefighting the phone and starts closing high-value treatments.
            </p>
            <p>
              We built this for clinics right here in <strong>Houston, TX</strong> — from practices in Memorial and The Woodlands to Sugar Land, Katy, and Pearland — where patients are searching &ldquo;dentist near me&rdquo; or &ldquo;AI answering service Houston&rdquo; and expect an instant reply. If you&apos;re a dental, aesthetic, or medical practice anywhere in the Houston metro or elsewhere in Texas, our <strong>AI receptionist</strong> is trained on your services and hours from day one, so every Houston-area caller gets a fast, accurate answer — not a busy signal.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#00283C] text-center mb-8">Common Questions</h2>
          <ContentCardList items={faqs} />
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
      </section>

      <FinalCTA />
    </PageWrapper>
  );
}
