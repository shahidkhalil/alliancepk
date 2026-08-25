"use client";

import {
  Bot,
  Globe,
  MapPinned,
  Megaphone,
  Smartphone,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { ServiceCardGrid } from "@/components/ui/Card";

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

export default function AboutServices() {
  return (
    <section
      className="py-16 lg:py-20 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,180,216,0.07) 0%, transparent 60%), linear-gradient(180deg, #f8fcfe 0%, #ffffff 45%, #ffffff 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="text-center mb-10 lg:mb-12 max-w-2xl mx-auto">
          <span className="badge-light mb-4">WHAT WE DO</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-3 leading-tight">
            One partner for the full{" "}
            <span className="gradient-heading">patient journey</span>
          </h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
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
            className="inline-flex items-center gap-2 text-sm font-bold text-[#0077A8] hover:text-[#00283C] transition-colors group"
          >
            View all services
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
