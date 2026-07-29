"use client";
import { useState, useEffect } from "react";
import { useForm } from "@/context/FormContext";

const heroSlides = [
  {
    badge: "AI Automation for Houston Clinics",
    headline: (
      <>
        Your Front Desk Can&apos;t Answer
        <br />
        Every Call. <span className="gradient-heading">Our AI Can.</span>
      </>
    ),
    sub: "A 24/7 AI receptionist that answers calls, chats, and WhatsApp, books appointments, and sends reminders — so your Houston clinic never misses another patient.",
    showChatProof: true,
  },
  {
    badge: "Houston's Top Reviewed Clinic Growth Agency",
    headline: (
      <>
        Most Houston Clinics Lose Patients
        <br />
        to Competitors Every Day. <span className="gradient-heading">We Fix That.</span>
      </>
    ),
    sub: "We fix the three things costing you patients: invisible Google ranking, missed WhatsApp inquiries, and wasted ad spend. One agency, every channel.",
  },
  {
    badge: "Websites & Local SEO That Convert",
    headline: (
      <>
        Patients Search Google First.
        <br />
        <span className="gradient-heading">Make Sure They Find You.</span>
      </>
    ),
    sub: "Fast, mobile-first clinic websites and local SEO that put you at the top of 'dentist near me in Houston' — and turn searchers into booked appointments.",
  },
  {
    badge: "Google & Meta Ads for Clinics",
    headline: (
      <>
        Stop Wasting Ad Spend.
        <br />
        <span className="gradient-heading">Fill Your Calendar Instead.</span>
      </>
    ),
    sub: "Targeted campaigns built only for dental and aesthetic clinics in Houston — every dollar tracked, every lead measured, an average 4x return on ad spend.",
  },
];

const marqueeItems = [
  "Dental Clinics", "Aesthetic Clinics", "Houston", "Sugar Land",
  "The Woodlands", "AI Receptionist", "WhatsApp AI", "Clinic Websites",
  "Patient Apps", "Local SEO", "Google Ads", "EHR Platform",
];

export default function Hero() {
  const { openForm } = useForm();
  const [slide, setSlide] = useState(0);
  const n = heroSlides.length;

  useEffect(() => {
    const t = setInterval(() => setSlide((p) => (p + 1) % n), 5000);
    return () => clearInterval(t);
  }, [n]);

  const s = heroSlides[slide];

  return (
    <section className="relative pt-28 pb-0 overflow-hidden bg-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,40,60,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,40,60,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[420px] rounded-full pointer-events-none opacity-[0.08]"
        style={{ background: "radial-gradient(circle, #00B4D8, transparent 70%)", filter: "blur(80px)" }}
      />

      <div className="relative min-h-[70vh] flex items-center">
        <div className="max-w-4xl mx-auto px-6 text-center py-16">
          <div key={slide}>
            <span className="badge-light inline-flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]" />
              {s.badge}
            </span>

            <h1 className="text-[1.85rem] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#00283C] tracking-tight leading-[1.15] sm:leading-[1.1] mb-6 break-words">
              {s.headline}
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed px-1">
              {s.sub}
            </p>

            {s.showChatProof && (
              <div className="max-w-sm mx-auto mb-8 rounded-2xl border border-gray-100 bg-white shadow-lg p-4 text-left space-y-2.5">
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#00283C] text-white text-xs px-3.5 py-2.5">
                    Do you have an opening today?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-[#F8FAFC] border border-gray-100 text-gray-700 text-xs px-3.5 py-2.5">
                    Yes! 3 PM works — booked
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center mb-7">
            {heroSlides.map((_, di) => (
              <button
                key={di}
                type="button"
                onClick={() => setSlide(di)}
                aria-label={`Go to slide ${di + 1}`}
                aria-current={di === slide ? "true" : undefined}
                className="p-2.5 flex items-center justify-center group"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all ${
                    di === slide ? "w-6 bg-[#0077A8]" : "w-1.5 bg-gray-300 group-hover:bg-gray-400"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* One clear path: Try Maya (product) + See pricing (intent) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/ai-receptionist"
              data-analytics-label="start_ai_demo"
              data-analytics-location="hero"
              className="btn-dark px-8 py-4 text-base w-full sm:w-auto text-center"
            >
              Try Maya — AI Receptionist
            </a>
            <a
              href="/pricing"
              data-analytics-label="view_pricing"
              data-analytics-location="hero"
              className="flex items-center gap-2 text-sm font-semibold text-[#0077A8] border border-[#0077A8]/30 px-6 py-4 rounded-md hover:bg-[#0077A8]/5 transition-colors w-full sm:w-auto justify-center"
            >
              See Plans &amp; Pricing
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Prefer a free audit?{" "}
            <a
              href="/free-website-audit"
              data-analytics-label="start_website_audit"
              data-analytics-location="hero"
              className="font-semibold text-[#0077A8] hover:underline"
            >
              Run your clinic website check
            </a>
            {" · "}
            <button
              type="button"
              onClick={openForm}
              data-analytics-label="book_consultation"
              data-analytics-location="hero"
              className="font-semibold text-[#0077A8] hover:underline"
            >
              Book a 30-min call
            </button>
          </p>
        </div>
      </div>

      <div className="border-t border-b border-gray-100 bg-[#F8FAFC] py-4 overflow-hidden">
        <div className="flex overflow-hidden">
          <div className="marquee-track whitespace-nowrap">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={`${item}-${i}`} className="inline-flex items-center mx-6 text-sm font-semibold text-gray-500">
                <span className="mr-2">{item}</span>
                <span className="text-[#00B4D8]">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#00283C] py-8">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { stat: "100+", label: "Clinics Served" },
            { stat: "4x", label: "Avg. Return on Ad Spend" },
            { stat: "60 days", label: "To Measurable Results" },
            { stat: "0", label: "Missed-Call Target With AI" },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-3xl font-extrabold text-white mb-0.5">{item.stat}</div>
              <div className="text-xs text-white/70 font-medium">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
