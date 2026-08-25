"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  Megaphone, Globe, Smartphone, MapPin, Search,
  MessageCircle, ClipboardList, Bot
} from "lucide-react";
import { ServiceShowcaseCard, StaggerGrid } from "@/components/ui/Card";

const services = [
  {
    Icon: Bot,
    title: "AI Receptionist",
    subtitle: "Your Houston clinic's AI front desk · from $500/mo",
    desc: "One AI front desk for Houston clinics — voice, WhatsApp, and web chat. Answers, books, sends reminders, and never misses a patient.",
    stat: "0 missed calls, 24/7",
    href: "/ai-receptionist",
    popular: true,
  },
  {
    Icon: MessageCircle,
    title: "WhatsApp AI Automation",
    subtitle: "Replies in under 5 seconds",
    desc: "Patients message on WhatsApp — the AI replies instantly, qualifies them, and books the appointment automatically.",
    stat: "3x more bookings",
    href: "/whatsapp-ai-automation",
    popular: false,
  },
  {
    Icon: Megaphone,
    title: "Digital Marketing",
    subtitle: "Google & Meta Ads",
    desc: "Targeted campaigns built specifically for dental and aesthetic clinics — not generic templates. Every dollar tracked.",
    stat: "4x avg. ROAS",
    href: "/digital-marketing-for-clinics",
    popular: false,
  },
  {
    Icon: Globe,
    title: "Clinic Websites",
    subtitle: "Fast. Professional. Converting.",
    desc: "Built for American clinics — mobile-first, SEO-ready, and designed to turn visitors into booked appointments.",
    stat: "Live in 7 days",
    href: "/clinic-website-design",
    popular: false,
  },
  {
    Icon: Search,
    title: "SEO for Clinics",
    subtitle: "Long-term organic growth",
    desc: "Rank on page 1 for high-intent treatment searches. Dental implants, whitening, fillers — the terms that convert.",
    stat: "100% organic",
    href: "/seo-for-clinics",
    popular: false,
  },
  {
    Icon: MapPin,
    title: "Local SEO",
    subtitle: "Dominate Google Maps",
    desc: "When a patient searches 'dentist near me' in your city — your clinic appears first. We make that happen.",
    stat: "#1 in 60 days",
    href: "/local-seo-for-clinics",
    popular: false,
  },
  {
    Icon: Smartphone,
    title: "Patient Mobile App",
    subtitle: "Your brand on every phone",
    desc: "Branded iOS & Android app. Patients book, view records, get reminders, and pay — with your clinic's logo.",
    stat: "Branded & custom",
    href: "/clinic-mobile-app",
    popular: false,
  },
  {
    Icon: ClipboardList,
    title: "EHR Platform",
    subtitle: "Go fully paperless",
    desc: "Patient records, prescriptions, billing, and appointments — all in one screen. Built for US clinics.",
    stat: "100% paperless",
    href: "/ehr-platform",
    popular: false,
  },
];

export default function Solutions() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  return (
    <section
      className="py-16 lg:py-24 relative overflow-hidden"
      id="services"
      ref={ref}
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,180,216,0.07) 0%, transparent 60%), linear-gradient(180deg, #f8fcfe 0%, #ffffff 40%, #ffffff 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <span className="badge-light mb-5">WHAT WE DO</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#00283C] mt-4 mb-4 leading-tight">
            Every service your clinic needs —<br />
            <span className="gradient-heading">under one roof.</span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            We don&apos;t do general marketing. Everything we build is designed for dental and aesthetic clinics across the United States — the right audience, the right channels, real results.
          </p>
        </motion.div>

        <StaggerGrid className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mb-8">
          {services.map((s) => (
            <ServiceShowcaseCard
              key={s.title}
              href={s.href}
              icon={s.Icon}
              title={s.title}
              subtitle={s.subtitle}
              description={s.desc}
              stat={s.stat}
              popular={s.popular}
              showAccentBar={hoveredHref === s.href}
              accentLayoutId="homeServiceCardBorder"
              onPointerEnter={() => setHoveredHref(s.href)}
              onPointerLeave={() => setHoveredHref((prev) => (prev === s.href ? null : prev))}
            />
          ))}
        </StaggerGrid>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ delay: 0.55, type: "spring", stiffness: 300, damping: 26 }}
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 card-cta-dark card-cta-glow"
        >
          <div className="flex items-center gap-3 relative z-[1]">
            <MapPin className="w-5 h-5 text-[#00B4D8] flex-shrink-0" strokeWidth={2} />
            <div>
              <p className="text-white font-bold text-sm">Houston-based — serving clinics across the United States</p>
              <p className="text-white/50 text-xs mt-0.5">Houston · Los Angeles · Chicago · Dallas · and beyond</p>
            </div>
          </div>
          <a href="/dental-clinic-houston" className="relative z-[1] flex-shrink-0 btn-dark px-5 py-2.5 text-sm whitespace-nowrap">
            Houston Clinics →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
