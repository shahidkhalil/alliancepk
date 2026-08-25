"use client";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useForm } from "@/context/FormContext";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { BreadcrumbSchema, ServiceSchema } from "@/components/StructuredData";

interface Props {
  badge: string;
  headline: string;
  highlight: string;
  subheadline: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function ServicePageHero({
  badge,
  headline,
  highlight,
  subheadline,
  ctaText = "Book Free Consultation",
  ctaHref,
}: Props) {
  const { openForm } = useForm();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const easeOut = [0.22, 1, 0.36, 1] as const;
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 90]);
  const gridY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 40]);
  const contentY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 28]);

  return (
    <>
      <ServiceSchema name={`${headline} ${highlight}`} description={subheadline} path={pathname} />
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: `${headline} ${highlight}`, path: pathname },
        ]}
      />
      <section ref={sectionRef} className="service-hero relative overflow-hidden">
        <div aria-hidden className="service-hero-atmosphere absolute inset-0" />
        <motion.div aria-hidden style={{ y: gridY }} className="service-hero-grid absolute inset-0" />
        <motion.div aria-hidden style={{ y: orbY }} className="service-hero-orb service-hero-orb--one" />
        <motion.div aria-hidden style={{ y: orbY }} className="service-hero-orb service-hero-orb--two" />
        <div aria-hidden className="service-hero-beam" />

        <motion.div
          style={{ y: contentY }}
          className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-36 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)] lg:gap-14 lg:px-8"
        >
          <div className="min-w-0">
            <motion.span
              initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOut }}
              className="service-hero-badge mb-5 inline-flex max-w-full items-center gap-2"
            >
              <Sparkles className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />
              <span className="truncate">{badge}</span>
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease: easeOut }}
              className="mb-5 text-[2rem] font-extrabold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[3.35rem]"
            >
              {headline}{" "}
              <span className="service-hero-highlight">{highlight}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16, ease: easeOut }}
              className="mb-8 max-w-2xl text-[15px] leading-relaxed text-[#a8c6d3] sm:text-lg"
            >
              {subheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: easeOut }}
              className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            >
              {ctaHref ? (
                <a
                  href={ctaHref}
                  data-analytics-label={ctaText}
                  data-analytics-location="service_hero"
                  className="service-hero-cta group"
                >
                  {ctaText}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={openForm}
                  data-analytics-label="book_consultation"
                  data-analytics-location="service_hero"
                  className="service-hero-cta group"
                >
                  {ctaText}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              )}
              <a href="/" className="service-hero-back">
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{
              opacity: 0,
              x: reduceMotion ? 0 : 38,
              scale: reduceMotion ? 1 : 0.97,
            }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.18, ease: easeOut }}
            className="service-hero-system hidden lg:block"
            aria-hidden
          >
            <div className="service-hero-system-head">
              <div className="flex items-center gap-2.5">
                <span className="service-hero-system-icon">
                  <Activity className="h-4 w-4" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-xs font-bold text-white">Alliance Growth System</p>
                  <p className="text-[10px] text-white/45">Configured for your clinic</p>
                </div>
              </div>
              <span className="service-hero-live">
                <span />
                ACTIVE
              </span>
            </div>

            <div className="space-y-2.5 p-4">
              {[
                ["Discover", "Clinic opportunity mapped"],
                ["Build", "Automation configured"],
                ["Grow", "Performance measured"],
              ].map(([label, value], index) => (
                <div className="service-hero-system-row" key={label}>
                  <span className="service-hero-step">{String(index + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#5ce1ff]">
                      {label}
                    </span>
                    <span className="block truncate text-xs text-white/65">{value}</span>
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-[#5ce1ff]" strokeWidth={2} />
                </div>
              ))}
            </div>

            <div className="service-hero-system-foot">
              <ShieldCheck className="h-4 w-4 text-[#5ce1ff]" strokeWidth={2} />
              <span>Built around measurable patient growth</span>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
