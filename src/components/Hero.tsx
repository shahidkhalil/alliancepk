"use client";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { useForm } from "@/context/FormContext";

const showcase = [
  {
    src: "/case-studies/ai-receptionist-main.jpg",
    alt: "AI receptionist product preview",
    label: "AI Receptionist",
    href: "/ai-receptionist",
  },
  {
    src: "/case-studies/ai-receptionist-2.jpg",
    alt: "WhatsApp AI automation preview",
    label: "WhatsApp AI",
    href: "/whatsapp-ai-automation",
  },
  {
    src: "/case-studies/free-website-audit-main.jpg",
    alt: "AI website audit preview",
    label: "Website Audit",
    href: "/free-website-audit",
  },
] as const;

/** Repeat the 3 cards so each set fills the available width */
const showcaseSet = [...showcase, ...showcase, ...showcase];
const showcaseSets = [0, 1] as const;

const easeOut = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 + i * 0.1, duration: 0.7, ease: easeOut },
  }),
};

export default function Hero() {
  const { openForm } = useForm();
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="hero-atmosphere relative isolate overflow-hidden pt-28"
      aria-label="Hero"
    >
      {/* Deep navy base + corner cyan glows */}
      <div aria-hidden className="hero-atmosphere-base pointer-events-none absolute inset-0" />

      {/* Soft starfield / noise dots */}
      <div aria-hidden className="hero-atmosphere-stars pointer-events-none absolute inset-0" />

      {/* Concentric signal rings — top left */}
      <div aria-hidden className="hero-atmosphere-rings pointer-events-none absolute -left-24 -top-28 h-[420px] w-[420px] sm:h-[520px] sm:w-[520px]">
        <span />
        <span />
        <span />
        <span />
      </div>

      {/* Diffused glow — top right */}
      <div aria-hidden className="hero-atmosphere-glow-tr pointer-events-none absolute -right-20 -top-16 h-[380px] w-[380px]" />

      {!reduceMotion && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-[-10%] top-[8%] h-[300px] w-[300px] rounded-full blur-3xl"
            style={{ background: "rgba(0,180,216,0.2)" }}
            animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.08, 1] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute right-[-8%] top-[4%] h-[280px] w-[280px] rounded-full blur-3xl"
            style={{ background: "rgba(0,119,168,0.22)" }}
            animate={{ opacity: [0.3, 0.65, 0.3], scale: [1.05, 1, 1.05] }}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          />
        </>
      )}

      {/* Glowing wave layers at bottom */}
      <div aria-hidden className="hero-atmosphere-waves pointer-events-none absolute inset-x-0 bottom-0 h-[42%] min-h-[220px] sm:h-[46%]">
        <svg
          className="hero-wave hero-wave--1 absolute inset-x-0 bottom-0 h-full w-[140%]"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="url(#heroWaveFill1)"
            d="M0,224L48,208C96,192,192,160,288,160C384,160,480,192,576,197.3C672,203,768,181,864,181.3C960,181,1056,203,1152,197.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
          <path
            fill="none"
            stroke="url(#heroWaveStroke)"
            strokeWidth="2"
            d="M0,224L48,208C96,192,192,160,288,160C384,160,480,192,576,197.3C672,203,768,181,864,181.3C960,181,1056,203,1152,197.3C1248,192,1344,160,1392,144L1440,128"
          />
          <defs>
            <linearGradient id="heroWaveFill1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0077A8" stopOpacity="0.35" />
              <stop offset="55%" stopColor="#00283C" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#020810" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="heroWaveStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00B4D8" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#00B4D8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0077A8" stopOpacity="0.25" />
            </linearGradient>
          </defs>
        </svg>
        <svg
          className="hero-wave hero-wave--2 absolute inset-x-0 bottom-0 h-[88%] w-[150%]"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="url(#heroWaveFill2)"
            d="M0,256L60,240C120,224,240,192,360,186.7C480,181,600,203,720,218.7C840,235,960,245,1080,229.3C1200,213,1320,171,1380,149.3L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
          <path
            fill="none"
            stroke="#00B4D8"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            d="M0,256L60,240C120,224,240,192,360,186.7C480,181,600,203,720,218.7C840,235,960,245,1080,229.3C1200,213,1320,171,1380,149.3L1440,128"
          />
          <defs>
            <linearGradient id="heroWaveFill2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00B4D8" stopOpacity="0.18" />
              <stop offset="40%" stopColor="#00283C" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#020810" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>
        <svg
          className="hero-wave hero-wave--3 absolute inset-x-0 bottom-0 h-[70%] w-[130%]"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="url(#heroWaveFill3)"
            d="M0,288L80,272C160,256,320,224,480,224C640,224,800,256,960,266.7C1120,277,1280,267,1360,261.3L1440,256L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          />
          <path
            fill="none"
            stroke="#7DD3EA"
            strokeOpacity="0.55"
            strokeWidth="1.75"
            d="M0,288L80,272C160,256,320,224,480,224C640,224,800,256,960,266.7C1120,277,1280,267,1360,261.3L1440,256"
          />
          <defs>
            <linearGradient id="heroWaveFill3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0077A8" stopOpacity="0.22" />
              <stop offset="50%" stopColor="#041018" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#020810" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pb-0 pt-6 text-center sm:pt-8 lg:pt-10">
        <motion.a
          href="/ai-receptionist"
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          data-analytics-label="hero_badge"
          data-analytics-location="hero"
          className="group mb-5 inline-flex items-center gap-2.5 rounded-full border border-[#00B4D8]/25 bg-[#00B4D8]/[0.08] px-4 py-1.5 shadow-[0_0_24px_rgba(0,180,216,0.12)] transition-all duration-300 hover:border-[#00B4D8]/45 hover:bg-[#00B4D8]/[0.14] hover:shadow-[0_0_32px_rgba(0,180,216,0.2)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00B4D8] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00B4D8]" />
          </span>
          <span className="text-sm font-medium text-white/80 transition-colors group-hover:text-white">
            AI Automation for Houston Clinics
          </span>
        </motion.a>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="max-w-3xl text-[2.05rem] font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[3.75rem]"
        >
          Never Miss Another
          <br className="hidden sm:block" />{" "}
          Patient Call.{" "}
          <span className="inline-flex items-center gap-2 whitespace-nowrap text-[#00B4D8]">
            Maya Answers.
            <motion.span
              aria-hidden
              className="inline-flex"
              animate={reduceMotion ? undefined : { opacity: [1, 0.5, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap
                className="h-6 w-6 fill-[#00B4D8]/30 text-[#00B4D8] sm:h-8 sm:w-8"
                strokeWidth={1.75}
              />
            </motion.span>
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-4 max-w-[36rem] text-base leading-relaxed text-white/55 sm:text-lg"
        >
          A 24/7 AI receptionist that answers calls, chats, and WhatsApp — so your
          Houston clinic never misses another patient.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-7 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center sm:gap-4"
        >
          <button
            type="button"
            onClick={openForm}
            data-analytics-label="book_consultation"
            data-analytics-location="hero"
            className="hero-cta-primary group inline-flex items-center justify-center gap-2 rounded-full bg-[#0077A8] px-8 py-3.5 text-sm font-bold text-white shadow-[0_10px_40px_rgba(0,119,168,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-[#00B4D8] hover:shadow-[0_14px_44px_rgba(0,180,216,0.4)]"
          >
            Book a Free Call
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
          <a
            href="/ai-receptionist"
            data-analytics-label="start_ai_demo"
            data-analytics-location="hero"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-8 py-3.5 text-sm font-semibold text-white/90 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00B4D8]/40 hover:bg-white/[0.08] hover:text-white"
          >
            Try Maya
          </a>
        </motion.div>
      </div>

      {/* 3 automation cards — LTR marquee across the available space */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.8, ease: easeOut }}
        className="relative z-10 mx-auto mt-8 w-full max-w-5xl px-4 pb-10 sm:mt-10 sm:px-6 sm:pb-12"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,180,216,0.2) 0%, transparent 70%)",
          }}
        />

        <div className={`hero-marquee ${reduceMotion ? "hero-marquee--static" : ""}`}>
          <div className="hero-marquee-track">
            {showcaseSets.map((set) => (
              <div key={set} className="hero-marquee-set" aria-hidden={set === 1 || undefined}>
                {showcaseSet.map((card, i) => (
                  <a
                    key={`${set}-${card.label}-${i}`}
                    href={card.href}
                    data-analytics-label={`hero_showcase_${card.label}`}
                    data-analytics-location="hero"
                    className="hero-marquee-card group"
                    tabIndex={set === 1 ? -1 : undefined}
                  >
                    <div className="hero-marquee-frame">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={card.src}
                        alt={set === 1 ? "" : card.alt}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        loading={set === 0 && i < 3 ? "eager" : "lazy"}
                        decoding="async"
                        draggable={false}
                      />
                    </div>
                    <span className="mt-2.5 block text-center text-[11px] font-semibold tracking-wide text-[#7EC8DB]/80 transition-colors group-hover:text-[#00B4D8] sm:text-xs">
                      {card.label}
                    </span>
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-16 bg-gradient-to-b from-transparent to-[#020810] sm:h-20"
      />
    </section>
  );
}
