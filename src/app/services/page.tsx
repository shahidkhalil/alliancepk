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

type ServiceGroup = "ai" | "growth" | "platform";

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
    blurb: "One flagship product. Three channels. Zero missed leads.",
    id: "group-ai",
    index: "01",
  },
  growth: {
    title: "Growth & Marketing",
    blurb: "Get found, get chosen, and fill more chairs.",
    id: "group-growth",
    index: "02",
  },
  platform: {
    title: "Platform",
    blurb: "Records, reminders, and a patient app in one system.",
    id: "group-platform",
    index: "03",
  },
};

const groupOrder: ServiceGroup[] = ["ai", "growth", "platform"];

const services: Service[] = [
  {
    Icon: PhoneCall,
    title: "AI Receptionist",
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
    group: "growth",
    summary: "Google and Meta ads built only for dental and aesthetic clinics.",
  },
  {
    Icon: Search,
    title: "SEO for Clinics",
    href: "/seo-for-clinics",
    group: "growth",
    summary: "Rank for the treatments patients actually search for.",
  },
  {
    Icon: MapPin,
    title: "Local SEO for Clinics",
    href: "/local-seo-for-clinics",
    group: "growth",
    summary: "Show up in Google Maps and “near me” searches in your city.",
  },
  {
    Icon: Globe,
    title: "Clinic Websites",
    href: "/clinic-website-design",
    group: "growth",
    summary: "Fast, mobile-first sites designed to turn visitors into bookings.",
  },
  {
    Icon: Smartphone,
    title: "Patient Mobile App",
    href: "/clinic-mobile-app",
    group: "platform",
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
  { id: "growth", label: "Growth & Marketing" },
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
    <div className="site-shell relative min-h-screen w-full max-w-full overflow-x-clip">
      <div aria-hidden className="site-shell-glow site-shell-glow--one" />
      <div aria-hidden className="site-shell-glow site-shell-glow--two" />
      <ConsultationForm isOpen={isOpen} onClose={closeForm} />
      <AuditChatWidget />
      <Navigation />
      <main className="relative w-full max-w-full overflow-x-clip">

      {/* Atmospheric hero */}
      <section

        className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24 text-white"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 85% -10%, rgba(0,180,216,0.35), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(0,119,168,0.25), transparent 50%), linear-gradient(160deg, #001a28 0%, #00283C 45%, #003d52 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
        <div
          aria-hidden
          className="absolute -right-24 top-1/3 w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(0,180,216,0.2)" }}

        />

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
          <div

            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7DD3EA] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] animate-pulse" />
              Alliance Tech · Services
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.08] mb-5">
              Built for clinics that{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7DD3EA] to-[#00B4D8]">
                want to grow
              </span>
            </h1>
            <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-lg mb-9">
              AI Automation, Growth &amp; Marketing, and Platform — the same structure as our menu,
              designed so you can choose in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/free-website-audit"
                data-analytics-label="start_website_audit"
                data-analytics-location="services_hero"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#00283C] shadow-[0_10px_28px_rgba(0,180,216,0.18)] transition-colors hover:bg-[#E8F7FB]"
              >
                Get a free clinic audit
              </a>
              <button
                type="button"
                onClick={openForm}
                data-analytics-label="book_consultation"
                data-analytics-location="services_hero"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Book a strategy call
              </button>
            </div>
          </div>

          {/* Group preview chips */}
          <div className="mt-14 grid sm:grid-cols-3 gap-3 max-w-3xl">
            {groupOrder.map((key, i) => (
              <motion.button
                key={key}
                type="button"
                onClick={() => goTo(key)}
                {...entrance(staggerDelay(i))}
                {...hoverProps(true)}
                className="text-left rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm px-4 py-4 hover:bg-white/[0.08] hover:border-[#00B4D8]/40 transition-colors group"
              >
                <span className="text-[10px] font-bold tracking-widest text-[#00B4D8]/80">
                  {groupMeta[key].index}
                </span>
                <span className="block text-sm font-bold text-white mt-1 group-hover:text-[#7DD3EA] transition-colors">
                  {groupMeta[key].title}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky filter */}
      <div className="sticky top-20 z-30 border-b border-[#00B4D8]/15 bg-[#041820]/85 backdrop-blur-md">
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
                      <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                        {meta.title}
                      </h2>
                      <p className="mt-2 max-w-xl text-sm text-[#a8c6d3] sm:text-base">
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
                              Flagship
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
              <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                Not sure where to start?
              </h2>
              <p className="mt-2 max-w-md text-sm text-[#a8c6d3]">
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
                className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition-colors hover:border-[#00B4D8] hover:text-white"
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
