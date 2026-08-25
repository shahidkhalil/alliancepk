"use client";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  PhoneOff,
  MapPin,
  BadgeDollarSign,
  FileText,
  MessageCircle,
  Globe,
  type LucideIcon,
} from "lucide-react";

const problems: {
  icon: LucideIcon;
  title: string;
  desc: string;
}[] = [
  {
    icon: PhoneOff,
    title: "Missed calls = missed patients",
    desc: "80% of patients who can't reach a clinic on the first try call the next one. No AI receptionist = lost revenue every single day.",
  },
  {
    icon: MapPin,
    title: "Invisible on Google Maps",
    desc: "If your clinic doesn't appear in the top 3 when someone searches 'dentist near me', you don't exist to that patient.",
  },
  {
    icon: BadgeDollarSign,
    title: "Ad spend wasted on wrong audiences",
    desc: "Running Facebook or Google ads without clinic-specific targeting burns budget on people who will never become patients.",
  },
  {
    icon: FileText,
    title: "Paper records holding you back",
    desc: "Manual registers, lost files, prescription errors — paper-based clinics can't scale and lose patient trust.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp inquiries going unanswered",
    desc: "American patients prefer WhatsApp. If you're not replying within minutes, they've already booked somewhere else.",
  },
  {
    icon: Globe,
    title: "Outdated or no website",
    desc: "A clinic with no website — or a slow, unprofessional one — loses 60% of potential new patients before they ever call.",
  },
];

/** 01 L, 02 L, 03 R, 04 L, 05 R, 06 R */
const fromLeft = [true, true, false, true, false, false];

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function Problems() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.18 });
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const slideX = reduceMotion ? 0 : isMobile ? 60 : 100;

  return (
    <section className="problem-section relative overflow-x-clip overflow-y-hidden" ref={ref}>
      <div aria-hidden className="problem-bg-base absolute inset-0" />
      <div aria-hidden className="problem-bg-orb problem-bg-orb--a" />
      <div aria-hidden className="problem-bg-orb problem-bg-orb--b" />
      <div aria-hidden className="problem-bg-orb problem-bg-orb--c" />
      <div aria-hidden className="problem-bg-rings" />
      <div aria-hidden className="problem-bg-grid absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center lg:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: easeOut }}
            className="problem-badge mb-5 inline-flex items-center gap-2"
          >
            <span className="problem-badge-dot" />
            THE PROBLEM
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.08, ease: easeOut }}
            className="problem-heading mx-auto mt-5 max-w-3xl"
          >
            Most Clinics Waste 60% of Their Marketing Budget —{" "}
            <span className="problem-heading-accent">Here&apos;s Why</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.16, ease: easeOut }}
            className="problem-lead mx-auto mt-5 max-w-xl"
          >
            After auditing 100+ dental and aesthetic clinics across the United States, we see the
            same 6 problems costing clinics thousands every month.
          </motion.p>
        </div>

        <div className="problem-stage relative overflow-x-clip">
          <div aria-hidden className="problem-stage-glow" />

          <div className="relative z-[1] grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-7">
            {problems.map((item, i) => {
              const Icon = item.icon;
              const left = fromLeft[i];
              return (
                <motion.article
                  key={item.title}
                  initial={{
                    opacity: 0,
                    x: left ? -slideX : slideX,
                    scale: reduceMotion ? 1 : 0.96,
                    filter: reduceMotion ? "blur(0px)" : "blur(6px)",
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    filter: "blur(0px)",
                  }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: reduceMotion ? 0.2 : 0.8,
                    delay: reduceMotion ? 0 : i * 0.15,
                    ease: easeOut,
                  }}
                  className="problem-card group h-full will-change-transform"
                >
                  <span aria-hidden className="problem-card-accent" />
                  <span aria-hidden className="problem-card-sheen" />
                  <span aria-hidden className="problem-card-dots" />
                  <span aria-hidden className="problem-card-glow" />

                  <div className="relative z-[2] flex h-full flex-col p-6 sm:p-7 lg:p-8">
                    <div className="mb-6 flex items-start justify-between gap-3">
                      <div className="problem-icon-well">
                        <Icon
                          className="h-[1.15rem] w-[1.15rem] text-[#00B4D8] transition-colors duration-300 group-hover:text-white"
                          strokeWidth={1.9}
                        />
                      </div>
                      <span className="problem-number" aria-hidden>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="mb-3 text-[1.05rem] font-extrabold leading-snug tracking-tight text-white transition-transform duration-300 group-hover:translate-x-0.5">
                      {item.title}
                    </h3>
                    <p className="text-[0.9rem] leading-[1.65] text-white/55">{item.desc}</p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.2 }}
          whileHover={{ y: -3 }}
          className="problem-cta mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl p-6 sm:flex-row lg:mt-14 lg:p-8"
        >
          <div>
            <p className="text-base font-bold text-white">Sound familiar? You&apos;re not alone.</p>
            <p className="mt-0.5 text-sm text-white/65">
              We&apos;ve fixed all 6 for clinics across the United States — we can fix them for you
              too.
            </p>
          </div>
          <a
            href="/#services"
            className="flex-shrink-0 whitespace-nowrap rounded-full bg-white px-6 py-2.5 text-sm font-bold text-[#00283C] shadow-lg transition-colors hover:bg-[#E8F4F8]"
          >
            See Our Solutions →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
