"use client";

import {
  Bot,
  Globe,
  MapPinned,
  Megaphone,
  Smartphone,
  ClipboardList,
  ArrowRight,
  Stethoscope,
  Sparkles,
  HeartPulse,
  Search,
  Wrench,
  Rocket,
  LineChart,
  PhoneMissed,
  MapPin,
} from "lucide-react";
import { ServiceCardGrid } from "@/components/ui/Card";

const softSurface =
  "rounded-2xl bg-white border border-[#E8EEF2] shadow-[0_1px_2px_rgba(0,40,60,0.04),0_12px_32px_rgba(0,40,60,0.06)]";

const services = [
  {
    icon: Bot,
    title: "AI Receptionist",
    description: "Answers calls & chats 24/7, qualifies patients, and books appointments automatically.",
    href: "/ai-receptionist",
  },
  {
    icon: Globe,
    title: "Clinic Websites",
    description: "Fast, mobile-first sites built to turn visitors into booked appointments.",
    href: "/clinic-website-design",
  },
  {
    icon: MapPinned,
    title: "Local SEO",
    description: "Show up first on Google Maps when patients search for care near them.",
    href: "/local-seo-for-clinics",
  },
  {
    icon: Megaphone,
    title: "Digital Marketing",
    description: "Google & Meta campaigns tracked to real bookings — not vanity clicks.",
    href: "/digital-marketing-for-clinics",
  },
  {
    icon: Smartphone,
    title: "Patient Apps",
    description: "Branded iOS & Android apps for booking, reminders, records, and payments.",
    href: "/clinic-mobile-app",
  },
  {
    icon: ClipboardList,
    title: "EHR Platform",
    description: "Records, prescriptions, billing, and appointments — paperless in one screen.",
    href: "/ehr-platform",
  },
];

const audiences = [
  {
    icon: Stethoscope,
    title: "Dental",
    desc: "General, implants, cosmetics, ortho — turn high-intent searches into new patients.",
    href: "/dental-clinic-growth",
  },
  {
    icon: Sparkles,
    title: "Aesthetic & med spa",
    desc: "Injectables, laser, skin — systems built for consult-heavy booking.",
    href: "/aesthetic-clinic-growth",
  },
  {
    icon: HeartPulse,
    title: "Specialty & outpatient",
    desc: "Urgent care, chiropractic, physio, ENT, dermatology, and more appointment-based clinics.",
    href: "#contact",
  },
];

const problems = [
  {
    icon: PhoneMissed,
    title: "Missed patient calls",
    desc: "After-hours and busy-desk calls go unanswered — those patients book elsewhere.",
  },
  {
    icon: MapPin,
    title: "Invisible on Google",
    desc: "Patients search for care nearby and competitors show up first on Maps and organic.",
  },
  {
    icon: Bot,
    title: "Slow follow-up",
    desc: "Website, WhatsApp, and ad leads sit idle while competitors reply in minutes.",
  },
];

const steps = [
  {
    icon: Search,
    title: "Diagnose",
    desc: "Free audit of your site, listings, and front desk. See exactly where patients drop off.",
  },
  {
    icon: Wrench,
    title: "Build",
    desc: "Install what you need — AI receptionist, website, SEO, ads — not a generic package.",
  },
  {
    icon: Rocket,
    title: "Launch",
    desc: "Live in weeks. Your team is trained; systems run without constant babysitting.",
  },
  {
    icon: LineChart,
    title: "Grow",
    desc: "Optimize for booked patients and ROI — then compound what works.",
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F7FB] border border-[#D6EEF5] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0077A8] mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]" aria-hidden />
      {children}
    </span>
  );
}

export default function AboutBody() {
  return (
    <>
      {/* Story */}
      <section id="mission" className="py-16 lg:py-24 bg-white scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-5">
              <SectionLabel>Our story</SectionLabel>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight leading-tight">
                Built for clinics that deserve a full book
              </h2>
            </div>
            <div className={`lg:col-span-7 ${softSurface} p-7 sm:p-9`}>
              <div className="space-y-5 text-[#00283C]/65 text-base lg:text-lg leading-relaxed">
                <p>
                  Most clinics that struggle aren&apos;t bad at care — they&apos;re missing the digital
                  systems patients now expect.
                </p>
                <p>
                  A missed call at 7pm. A website that doesn&apos;t convert. A Google listing buried on
                  page two. None of that is inevitable. It&apos;s infrastructure — and infrastructure can
                  be fixed.
                </p>
                <p className="text-[#00283C] font-semibold border-l-4 border-[#00B4D8] pl-4">
                  We close that gap for healthcare clinics across the United States — with AI, websites,
                  SEO, and marketing measured in appointments, not vanity metrics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who we serve */}
      <section
        className="py-16 lg:py-24 border-y border-[#E8EEF2]"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,180,216,0.08), transparent 55%), #F5F9FB",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-12">
            <SectionLabel>Who we serve</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-2 mb-3">
              Healthcare clinics that take appointments
            </h2>
            <p className="text-[#00283C]/55 text-sm sm:text-base leading-relaxed">
              Not hospitals. Not pharmacies. Outpatient clinics that win or lose on local demand,
              phone calls, and booking speed.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-12">
            {audiences.map(({ icon: Icon, title, desc, href }) => (
              <a
                key={title}
                href={href}
                className={`group ${softSurface} p-6 lg:p-7 hover:border-[#00B4D8]/40 hover:shadow-[0_12px_36px_rgba(0,119,168,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0077A8]/25 transition-all duration-200 cursor-pointer`}
              >
                <span className="w-11 h-11 rounded-xl bg-[#E8F7FB] flex items-center justify-center mb-5 transition-colors duration-200 group-hover:bg-[#00283C]">
                  <Icon
                    className="w-5 h-5 text-[#0077A8] transition-colors duration-200 group-hover:text-white"
                    strokeWidth={2}
                    aria-hidden
                  />
                </span>
                <h3 className="text-lg font-extrabold text-[#00283C] mb-2 tracking-tight">{title}</h3>
                <p className="text-sm text-[#00283C]/55 leading-relaxed mb-4">{desc}</p>
                <span className="text-sm font-bold text-[#0077A8] inline-flex items-center gap-1">
                  Learn more
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                </span>
              </a>
            ))}
          </div>

          <div className="text-center mb-8">
            <h3 className="text-lg font-extrabold text-[#00283C] tracking-tight mb-1">
              Problems we solve every week
            </h3>
            <p className="text-sm text-[#00283C]/45">If this sounds familiar, you&apos;re who we built for.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {problems.map(({ icon: Icon, title, desc }) => (
              <div key={title} className={`${softSurface} p-6`}>
                <span className="w-10 h-10 rounded-xl bg-[#E8F7FB] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#0077A8]" strokeWidth={2} aria-hidden />
                </span>
                <h4 className="text-base font-extrabold text-[#00283C] mb-2 tracking-tight">{title}</h4>
                <p className="text-sm text-[#00283C]/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How we work — process track */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-14">
            <SectionLabel>How we work</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-2 mb-3">
              A clear path from audit to growth
            </h2>
            <p className="text-[#00283C]/55 text-sm sm:text-base">
              No vague retainers. Winning means more booked patients.
            </p>
          </div>

          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 relative">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <li key={title} className={`relative ${softSurface} p-6 lg:p-7`}>
                <div className="flex items-center justify-between mb-5">
                  <span className="w-10 h-10 rounded-xl bg-[#E8F7FB] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#0077A8]" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="text-[11px] font-black tracking-widest text-[#0077A8]/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#00283C] mb-2 tracking-tight">{title}</h3>
                <p className="text-sm text-[#00283C]/55 leading-relaxed">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What we do */}
      <section
        className="py-16 lg:py-24 relative overflow-hidden border-y border-[#E8EEF2]"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,180,216,0.07) 0%, transparent 60%), #FFFFFF",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-10 lg:mb-12 max-w-2xl mx-auto">
            <SectionLabel>What we do</SectionLabel>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-2 mb-3 leading-tight">
              One partner for the full{" "}
              <span className="text-[#0077A8]">patient journey</span>
            </h2>
            <p className="text-[#00283C]/55 text-sm sm:text-base leading-relaxed">
              From the first Google search to a booked appointment — and the systems that keep patients coming back.
            </p>
          </div>

          <ServiceCardGrid
            items={services}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5"
            accentLayoutId="aboutServicesAccent"
          />

          <div className="mt-8 text-center">
            <a
              href="/services"
              className="inline-flex min-h-[44px] items-center gap-2 text-sm font-bold text-[#0077A8] hover:text-[#00283C] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0077A8]/25 rounded-lg px-2 transition-colors duration-200 cursor-pointer group"
            >
              View all services
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* Proof metrics */}
      <section className="py-14 lg:py-16 bg-[#00283C] relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 55% 80% at 100% 50%, rgba(0,180,216,0.28), transparent 60%), radial-gradient(ellipse 40% 60% at 0% 100%, rgba(0,119,168,0.2), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative max-w-5xl mx-auto px-6">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[#7DD3EA] mb-10">
            By the numbers
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {[
              { stat: "100+", label: "Clinics served" },
              { stat: "30–60", label: "Days to early results" },
              { stat: "24/7", label: "AI front desk coverage" },
              { stat: "1 roof", label: "AI + marketing + web" },
            ].map((r, i) => (
              <div
                key={r.label}
                className={`text-center rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-6 ${
                  i > 0 ? "" : ""
                }`}
              >
                <div className="text-3xl lg:text-4xl font-extrabold text-white mb-1.5 tracking-tight">
                  {r.stat}
                </div>
                <div className="text-sm text-white/60">{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
