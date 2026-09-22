"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Megaphone, Globe, Smartphone, MapPin, Search,
  PhoneCall, ClipboardList, ArrowRight, SearchCheck,
  Phone, MessageCircle, MessagesSquare,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FinalCTA from "@/components/FinalCTA";
import { FormProvider, useForm } from "@/context/FormContext";
import { ActiveTabBar, AnimatedSurface, ServiceCardGrid } from "@/components/ui/Card";
import { useCardMotion, staggerDelay } from "@/lib/motionVariants";
import dynamic from "next/dynamic";

const ConsultationForm = dynamic(() => import("@/components/ConsultationForm"), { ssr: false });
const AuditChatWidget = dynamic(() => import("@/components/AuditChatWidget"), { ssr: false });
const MobileStickySalesBar = dynamic(() => import("@/components/MobileStickySalesBar"), { ssr: false });

type ServiceGroup = "ai" | "seo" | "marketing" | "web" | "platform";

type Channel = {
  label: string;
  href: string;
  Icon: typeof Phone;
  hint: string;
};

type Service = {
  Icon: typeof PhoneCall;
  title: string;
  href: string;
  group: ServiceGroup;
  summary: string;
  flagship?: boolean;
  channels?: Channel[];
};

const groupMeta: Record<ServiceGroup, { title: string; blurb: string; id: string; index: string }> = {
  ai: {
    title: "AI Automation",
    blurb: "Answer every call and message, then book the patient.",
    id: "group-ai",
    index: "01",
  },
  seo: {
    title: "SEO",
    blurb: "Rank on Google and in the local map pack.",
    id: "group-seo",
    index: "02",
  },
  marketing: {
    title: "Digital Marketing",
    blurb: "Google and Meta ads, with posts, creatives, and Reels included.",
    id: "group-marketing",
    index: "03",
  },
  web: {
    title: "Web & App",
    blurb: "Clinic websites and a branded patient app.",
    id: "group-web",
    index: "04",
  },
  platform: {
    title: "Platform",
    blurb: "Records, scheduling, prescriptions, and billing in one system.",
    id: "group-platform",
    index: "05",
  },
};

const groupOrder: ServiceGroup[] = ["ai", "seo", "marketing", "web", "platform"];

const services: Service[] = [
  {
    Icon: PhoneCall,
    title: "Maya AI Receptionist",
    href: "/ai-receptionist",
    group: "ai",
    summary:
      "Your clinic’s always-on front desk — answers patients, books appointments, and follows up around the clock. One product. Pick the channels you need.",
    flagship: true,
    channels: [
      { label: "Voice calls", href: "/ai-receptionist", Icon: Phone, hint: "Live phone agent" },
      { label: "WhatsApp", href: "/whatsapp-ai-automation", Icon: MessageCircle, hint: "Chat booking" },
      { label: "Web chat", href: "/ai-receptionist", Icon: MessagesSquare, hint: "On-site assistant" },
    ],
  },
  {
    Icon: SearchCheck,
    title: "Free Website Audit",
    href: "/free-website-audit",
    group: "ai",
    summary: "Instant AI checkup of speed, SEO, and patient booking experience.",
  },
  {
    Icon: Megaphone,
    title: "Digital Marketing",
    href: "/digital-marketing-for-clinics",
    group: "marketing",
    summary: "Google & Meta ads with posts, creatives, and Reels built into both plans.",
  },
  {
    Icon: Search,
    title: "SEO for Clinics",
    href: "/seo-for-clinics",
    group: "seo",
    summary: "Rank for the treatments patients actually search for.",
  },
  {
    Icon: MapPin,
    title: "Local SEO for Clinics",
    href: "/local-seo-for-clinics",
    group: "seo",
    summary: "Show up in Google Maps and “near me” searches in your city.",
  },
  {
    Icon: Globe,
    title: "Clinic Websites",
    href: "/clinic-website-design",
    group: "web",
    summary: "Fast, mobile-first sites designed to turn visitors into bookings.",
  },
  {
    Icon: Smartphone,
    title: "Patient Mobile App",
    href: "/clinic-mobile-app",
    group: "web",
    summary: "Branded iOS and Android app for booking, reminders, and payments.",
  },
  {
    Icon: ClipboardList,
    title: "EHR Platform",
    href: "/ehr-platform",
    group: "platform",
    summary: "Digital records, scheduling, prescriptions, and billing in one place.",
  },
];

const tabs: { id: "all" | ServiceGroup; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI Automation" },
  { id: "seo", label: "SEO" },
  { id: "marketing", label: "Digital Marketing" },
  { id: "web", label: "Web & App" },
  { id: "platform", label: "Platform" },
];

function ServicesContent() {
  const { isOpen, openForm, closeForm } = useForm();
  const [active, setActive] = useState<"all" | ServiceGroup>("all");
  const { entrance, hoverProps } = useCardMotion();

  const visibleGroups =
    active === "all" ? groupOrder : groupOrder.filter((g) => g === active);

  const goTo = (id: "all" | ServiceGroup) => {
    setActive(id);
    requestAnimationFrame(() => {
      const el = document.getElementById(id === "all" ? "services" : groupMeta[id].id);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-clip bg-[#F4F8FB]">
      <ConsultationForm isOpen={isOpen} onClose={closeForm} />
      <AuditChatWidget />
      <Navigation />
      <main className="relative w-full max-w-full overflow-x-clip">

      {/* Hero */}
      <section className="relative bg-white border-b border-gray-100 pt-28 pb-12 lg:pt-36 lg:pb-16">
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <span className="badge-light inline-flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]" aria-hidden />
            Services
          </span>
          <h1 className="text-[2rem] sm:text-5xl font-extrabold text-[#00283C] tracking-tight leading-[1.15] mb-4">
            Pick a service.{" "}
            <span className="text-[#0077A8]">See the plan.</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto mb-8">
            AI front desk, SEO, ads, websites, and clinic software. Each one has a published price.
          </p>
          <div className="flex flex-col items-center gap-3">
            <a
              href="/pricing"
              data-analytics-label="view_pricing"
              data-analytics-location="services_hero"
              className="btn-dark inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm w-full sm:w-auto"
            >
              See plans & pricing
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={openForm}
              data-analytics-label="book_consultation"
              data-analytics-location="services_hero"
              className="text-sm font-semibold text-[#0077A8] hover:underline"
            >
              Book a strategy call
            </button>
          </div>
        </div>
      </section>

      {/* Sticky filter */}
      <div className="sticky top-20 z-30 border-b border-[#00283C]/08 bg-[#F4F8FB]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <ActiveTabBar tabs={tabs} active={active} onChange={goTo} />
        </div>
      </div>

      {/* Services */}
      <section id="services" className="py-14 lg:py-20 scroll-mt-36">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 space-y-16 lg:space-y-20">

            {visibleGroups.map((groupKey) => {
              const meta = groupMeta[groupKey];
              const items = services.filter((s) => s.group === groupKey);
              const flagship = items.find((s) => s.flagship);
              const rest = items.filter((s) => !s.flagship);

              return (
                <div
                  key={groupKey}
                  id={meta.id}
                  className="scroll-mt-40"

                >
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold tracking-[0.2em] text-[#0077A8]">
                          {meta.index}
                        </span>
                        <span className="h-px w-8 bg-[#00B4D8]/50" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#00283C] tracking-tight">
                        {meta.title}
                      </h2>
                      <p className="mt-2 max-w-xl text-sm text-gray-600 sm:text-base">
                        {meta.blurb}
                      </p>
                    </div>
                  </div>

                  {flagship && (
                    <motion.div
                      {...entrance(0)}
                      className="relative mb-5 overflow-hidden rounded-2xl bg-[#00283C] text-white"
                    >
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "radial-gradient(ellipse 70% 80% at 100% 0%, rgba(0,180,216,0.35), transparent 55%)",
                        }}
                      />
                      <div className="relative p-6 sm:p-8 lg:p-10">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12">
                          <div className="flex-1 min-w-0">
                            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7DD3EA] mb-4">
                              Product
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                              {flagship.title}
                            </h3>
                            <p className="text-white/65 text-sm sm:text-base leading-relaxed max-w-xl mb-6">
                              {flagship.summary}
                            </p>
                            <div className="flex flex-wrap gap-3">
                              <a
                                href={flagship.href}
                                className="inline-flex items-center gap-2 rounded-lg bg-white text-[#00283C] font-bold px-5 py-2.5 text-sm hover:bg-[#E8F7FB] transition-colors"
                              >
                                Learn more <ArrowRight className="w-4 h-4" />
                              </a>
                              <a
                                href="/pricing#ai-automation"
                                className="inline-flex items-center gap-2 rounded-lg border border-white/20 text-white font-semibold px-5 py-2.5 text-sm hover:bg-white/10 transition-colors"
                              >
                                See packages
                              </a>
                            </div>
                          </div>

                          {flagship.channels && (
                            <div className="w-full lg:w-[340px] flex-shrink-0">
                              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 mb-3">
                                Channels
                              </p>
                              <div className="space-y-2">
                                {flagship.channels.map((ch, i) => (
                                  <motion.a
                                    key={ch.label}
                                    href={ch.href}
                                    {...entrance(staggerDelay(i + 1))}
                                    {...hoverProps(true)}
                                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 hover:bg-white/[0.12] hover:border-[#00B4D8]/40 transition-colors"
                                  >
                                    <span className="w-9 h-9 rounded-lg bg-[#00B4D8]/15 flex items-center justify-center flex-shrink-0">
                                      <ch.Icon className="w-4 h-4 text-[#7DD3EA]" strokeWidth={2} />
                                    </span>
                                    <span className="flex-1 min-w-0">
                                      <span className="block text-sm font-bold text-white">{ch.label}</span>
                                      <span className="block text-xs text-white/45">{ch.hint}</span>
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                                  </motion.a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {rest.length > 0 && (
                    <ServiceCardGrid
                      accentLayoutId={`serviceCardBorder-${groupKey}`}
                      className={`grid gap-4 ${
                        rest.length === 1
                          ? "grid-cols-1 max-w-md"
                          : "grid-cols-1 sm:grid-cols-2"
                      }`}
                      items={rest.map((s) => ({
                        href: s.href,
                        icon: s.Icon,
                        title: s.title,
                        description: s.summary,
                      }))}
                    />
                  )}
                </div>
              );
            })}

        </div>
      </section>

      {/* Next step band */}
      <section className="pb-16 lg:pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <AnimatedSurface className="relative overflow-hidden px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6" delay={0.05}>
            <div
              className="absolute -right-16 -top-16 w-48 h-48 rounded-full pointer-events-none opacity-40"
              style={{ background: "radial-gradient(circle, rgba(0,180,216,0.25), transparent 70%)" }}
            />
            <div className="relative">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#00283C]">
                Not sure where to start?
              </h2>
              <p className="mt-2 max-w-md text-sm text-gray-600">
                Book a free clinic audit — we’ll map the right mix of AI, growth, and platform for you.
              </p>
            </div>
            <div className="relative flex flex-wrap gap-3">
              <a
                href="/free-website-audit"
                data-analytics-label="start_website_audit"
                data-analytics-location="services_next_step"
                className="btn-dark px-6 py-3 text-sm inline-flex items-center"
              >
                Free clinic audit
              </a>
              <button
                type="button"
                onClick={openForm}
                data-analytics-label="book_consultation"
                data-analytics-location="services_next_step"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#00283C]/20 px-6 py-3 text-sm font-semibold text-[#00283C] transition-colors hover:border-[#00B4D8] hover:text-[#0077A8]"
              >
                Book a strategy call
              </button>
            </div>
          </AnimatedSurface>
        </div>
      </section>

      <FinalCTA />
      </main>
      <Footer />
      <MobileStickySalesBar />
    </div>
  );
}

export default function ServicesPage() {
  return (
    <FormProvider>
      <ServicesContent />
    </FormProvider>
  );
}
