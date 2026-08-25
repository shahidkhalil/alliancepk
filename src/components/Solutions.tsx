"use client";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Bot,
  MessagesSquare,
  Megaphone,
  Globe2,
  Search,
  MapPin,
  Smartphone,
  ClipboardList,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

const services: {
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  desc: string;
  stat: string;
  href: string;
  popular: boolean;
}[] = [
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
    Icon: MessagesSquare,
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
    Icon: Globe2,
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

const easeOut = [0.22, 1, 0.36, 1] as const;

/** L R L R … entrance directions */
function enterX(index: number, mobile: boolean, reduced: boolean) {
  if (reduced) return 0;
  const dist = mobile ? 48 : 80;
  return index % 2 === 0 ? -dist : dist;
}

export default function Solutions() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });
  const reduceMotion = useReducedMotion();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], reduceMotion || isMobile ? [0, 0] : [18, -18]);
  const dotsY = useTransform(scrollYProgress, [0, 1], reduceMotion || isMobile ? [0, 0] : [-8, 8]);

  return (
    <section
      className="solutions-section relative overflow-x-clip py-16 lg:py-24"
      id="services"
      ref={ref}
    >
      <div aria-hidden className="solutions-bg absolute inset-0" />
      <motion.div
        aria-hidden
        className="solutions-glow solutions-glow--a absolute"
        style={{ y: glowY }}
      />
      <motion.div
        aria-hidden
        className="solutions-glow solutions-glow--b absolute"
        style={{ y: dotsY }}
      />
      <motion.div
        aria-hidden
        className="solutions-dots absolute inset-0"
        style={{ y: dotsY }}
      />
      <div aria-hidden className="solutions-grid absolute inset-0" />

      {/* Subtle connection rail behind first row on desktop */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[42%] z-[1] hidden h-px w-[min(920px,78%)] -translate-x-1/2 lg:block"
      >
        <div className="solutions-rail h-full w-full" />
        <span className="solutions-rail-node absolute left-[12.5%] top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <span className="solutions-rail-node absolute left-[37.5%] top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <span className="solutions-rail-node absolute left-[62.5%] top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <span className="solutions-rail-node absolute left-[87.5%] top-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center lg:mb-14">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: easeOut }}
            className="solutions-badge mb-5 inline-flex items-center gap-2"
          >
            <span className="solutions-badge-dot" />
            WHAT WE DO
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOut }}
            className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white lg:text-4xl"
          >
            Every service your clinic needs —
            <br />
            <span className="gradient-heading">under one roof.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.18, ease: easeOut }}
            className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#8eb4c4]"
          >
            We don&apos;t do general marketing. Everything we build is designed for dental and
            aesthetic clinics across the United States — the right audience, the right channels,
            real results.
          </motion.p>
        </div>

        <div className="solutions-grid-cards grid gap-5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {services.map((s, i) => {
            const Icon = s.Icon;
            const isHovered = hoveredHref === s.href;
            const dimOthers =
              !isMobile && hoveredHref != null && hoveredHref !== s.href;

            return (
              <motion.a
                key={s.title}
                href={s.href}
                initial={{
                  opacity: 0,
                  x: enterX(i, isMobile, !!reduceMotion),
                  scale: reduceMotion ? 1 : 0.97,
                }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: reduceMotion ? 0.25 : 0.8,
                  delay: reduceMotion ? 0 : 0.22 + i * 0.14,
                  ease: easeOut,
                }}
                whileHover={
                  reduceMotion || isMobile
                    ? undefined
                    : { y: -8, transition: { duration: 0.35, ease: easeOut } }
                }
                onPointerEnter={() => !isMobile && setHoveredHref(s.href)}
                onPointerLeave={() =>
                  setHoveredHref((prev) => (prev === s.href ? null : prev))
                }
                className={`solutions-card group relative flex h-full flex-col overflow-hidden ${
                  s.popular ? "solutions-card--featured" : ""
                } ${dimOthers ? "solutions-card--dim" : ""} ${
                  isHovered ? "solutions-card--active" : ""
                }`}
                data-analytics-label={`service_${s.title}`}
                data-analytics-location="solutions"
              >
                {s.popular && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.5, ease: easeOut }}
                    className="solutions-popular"
                  >
                    <span className="solutions-popular-shine" aria-hidden />
                    MOST POPULAR
                  </motion.span>
                )}

                <div className="relative z-[2] flex h-full flex-col p-6 lg:p-7">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="solutions-icon">
                      <Icon
                        className={`h-6 w-6 ${
                          s.popular ? "text-white" : "text-[#0077A8]"
                        } transition-colors duration-300 group-hover:text-white`}
                        strokeWidth={1.8}
                      />
                    </div>
                    <span className="solutions-arrow" aria-hidden>
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </span>
                  </div>

                  <p
                    className={`mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
                      s.popular ? "text-[#7DD3EA]/85" : "text-[#00B4D8]"
                    }`}
                  >
                    {s.subtitle}
                  </p>
                  <h3
                    className={`mb-2 text-base font-extrabold leading-snug tracking-tight ${
                      s.popular ? "text-white" : "text-white"
                    }`}
                  >
                    {s.title}
                  </h3>
                  <p
                    className={`mb-5 flex-1 text-xs leading-relaxed ${
                      s.popular ? "text-white/65" : "text-white/55"
                    }`}
                  >
                    {s.desc}
                  </p>

                  <div className="solutions-stat mt-auto">
                    <span>{s.stat}</span>
                  </div>
                </div>

                {s.popular && <span aria-hidden className="solutions-featured-glow" />}
              </motion.a>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: easeOut, delay: 0.1 }}
          className="card-cta-dark card-cta-glow mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl p-5 sm:flex-row"
        >
          <div className="relative z-[1] flex items-center gap-3">
            <MapPin className="h-5 w-5 flex-shrink-0 text-[#00B4D8]" strokeWidth={2} />
            <div>
              <p className="text-sm font-bold text-white">
                Houston-based — serving clinics across the United States
              </p>
              <p className="mt-0.5 text-xs text-white/50">
                Houston · Los Angeles · Chicago · Dallas · and beyond
              </p>
            </div>
          </div>
          <a
            href="/dental-clinic-houston"
            className="relative z-[1] flex-shrink-0 whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#E8F4F8]"
          >
            Houston Clinics →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
