"use client";
import { ArrowRight, Bot, MessageSquare, CalendarCheck } from "lucide-react";
import { useForm } from "@/context/FormContext";

const automationSystems = [
  {
    icon: Bot,
    title: "AI Receptionist",
    description: "Answers every call — day, night, and weekends.",
  },
  {
    icon: MessageSquare,
    title: "Patient messaging",
    description: "Website chat that replies and qualifies instantly.",
  },
  {
    icon: CalendarCheck,
    title: "Auto booking",
    description: "Turns inquiries into confirmed appointments.",
  },
];

export default function Hero() {
  const { openForm } = useForm();

  return (
    <section className="relative pt-20 overflow-hidden bg-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,40,60,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,40,60,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
        aria-hidden
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[420px] rounded-full pointer-events-none opacity-[0.08]"
        style={{ background: "radial-gradient(circle, #00B4D8, transparent 70%)", filter: "blur(80px)" }}
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-14 sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <span className="badge-light inline-flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]" aria-hidden />
            Clinic Automation Experts
          </span>

          <h1 className="text-[2.15rem] sm:text-5xl lg:text-6xl font-extrabold text-[#00283C] tracking-tight leading-[1.12] sm:leading-[1.08] mb-6">
            Automate Your Clinic.{" "}
            <span className="gradient-heading">Never Miss a Patient.</span>
          </h1>

          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto mb-9 leading-relaxed">
            Alliance Tech builds AI automation for healthcare clinics — answering calls, handling
            messages, and booking appointments 24/7 so your team can focus on care.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href="/ai-receptionist"
              data-analytics-label="start_ai_demo"
              data-analytics-location="hero"
              className="btn-dark min-h-[52px] px-8 py-4 text-base w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              Try Maya — AI Receptionist
              <ArrowRight className="w-4 h-4" aria-hidden />
            </a>
            <a
              href="/free-website-audit"
              data-analytics-label="start_website_audit"
              data-analytics-location="hero"
              className="min-h-[52px] inline-flex items-center gap-2 text-sm font-bold text-[#00283C] bg-white border border-[#00283C]/15 px-7 py-4 rounded-lg hover:border-[#0077A8]/40 hover:bg-[#F8FCFE] transition-colors w-full sm:w-auto justify-center"
            >
              Book a Free Audit
            </a>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            <a href="/pricing" className="font-semibold text-[#0077A8] hover:underline">
              See pricing
            </a>
            <span aria-hidden> · </span>
            <button
              type="button"
              onClick={openForm}
              data-analytics-label="book_consultation"
              data-analytics-location="hero"
              className="font-semibold text-[#0077A8] hover:underline"
            >
              Book a Free Strategy Call
            </button>
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-3 sm:gap-4">
          {automationSystems.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white/90 p-4 text-left shadow-[0_8px_28px_rgba(0,40,60,0.06)]"
            >
              <span className="w-10 h-10 rounded-xl bg-[#E8F7FB] flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-[#0077A8]" strokeWidth={2} aria-hidden />
              </span>
              <span>
                <strong className="block text-sm text-[#00283C] mb-1">{title}</strong>
                <span className="block text-xs leading-relaxed text-gray-500">{description}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative bg-[#00283C] py-7">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { stat: "100+", label: "Clinics Automated" },
            { stat: "24/7", label: "AI Front Desk" },
            { stat: "0", label: "Missed-Call Target" },
            { stat: "30–60", label: "Days to Results" },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{item.stat}</div>
              <div className="text-xs text-white/65 font-medium">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
