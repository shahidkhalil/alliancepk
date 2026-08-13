"use client";
import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  MapPin,
  Megaphone,
  MessageCircle,
  Phone,
  Globe,
  Share2,
  Sparkles,
  Smile,
  type LucideIcon,
} from "lucide-react";
import { useForm } from "@/context/FormContext";

type ClinicType = "dental" | "aesthetic";

type Metric = { label: string; value: string };
type Node = { id: string; label: string; Icon: LucideIcon; angle: number };

const clinicData: Record<
  ClinicType,
  {
    title: string;
    tagline: string;
    body: string;
    metrics: Metric[];
    builds: string[];
    cta: string;
    chips: string[];
    nodes: Node[];
  }
> = {
  dental: {
    title: "DENTAL CLINIC",
    tagline: "Turn searches into booked appointments.",
    body: "Whether you're a solo dentist or running a multi-chair practice — we fill your appointment book with the right patients every month.",
    metrics: [
      { label: "Local Visibility", value: "Top 3 Google Maps" },
      { label: "Patient Acquisition", value: "Implant & Cosmetic campaigns" },
      { label: "AI Reception", value: "24/7 WhatsApp + Call handling" },
    ],
    builds: [
      "Local SEO",
      "Patient acquisition",
      "AI receptionist",
      "WhatsApp automation",
    ],
    cta: "Grow My Dental Clinic",
    chips: ["+38% Bookings", "Top 3 Google Maps", "24/7 AI Reception", "WhatsApp < 30s"],
    nodes: [
      { id: "maps", label: "Google Maps", Icon: MapPin, angle: -90 },
      { id: "ads", label: "Ads", Icon: Megaphone, angle: -30 },
      { id: "wa", label: "WhatsApp", Icon: MessageCircle, angle: 30 },
      { id: "ai", label: "AI Receptionist", Icon: Phone, angle: 90 },
      { id: "web", label: "Website", Icon: Globe, angle: 150 },
      { id: "social", label: "Social", Icon: Share2, angle: 210 },
      { id: "follow", label: "Follow-up", Icon: Sparkles, angle: 270 },
    ],
  },
  aesthetic: {
    title: "AESTHETIC CLINIC",
    tagline: "Turn attention into booked treatments.",
    body: "Botox, fillers, laser, skin treatments — aesthetic patients decide with their eyes. We make sure they see your clinic first, and trust it enough to book.",
    metrics: [
      { label: "Social Visibility", value: "Instagram + TikTok growth" },
      { label: "Patient Acquisition", value: "Treatment-focused campaigns" },
      { label: "AI Reception", value: "24/7 WhatsApp inquiry handling" },
    ],
    builds: [
      "Instagram & TikTok campaigns",
      "Before & after content",
      "Treatment lead generation",
      "WhatsApp AI",
    ],
    cta: "Grow My Aesthetic Clinic",
    chips: ["+42% Inquiries", "127 New Leads", "24/7 AI Reception", "Content that converts"],
    nodes: [
      { id: "ig", label: "Instagram", Icon: Share2, angle: -80 },
      { id: "tt", label: "TikTok", Icon: Sparkles, angle: -20 },
      { id: "ads", label: "Ads", Icon: Megaphone, angle: 40 },
      { id: "wa", label: "WhatsApp", Icon: MessageCircle, angle: 100 },
      { id: "ai", label: "AI Receptionist", Icon: Phone, angle: 160 },
      { id: "web", label: "Website", Icon: Globe, angle: 220 },
      { id: "content", label: "Content", Icon: Smile, angle: 280 },
    ],
  },
};

const easeOut = [0.22, 1, 0.36, 1] as const;

function GrowthEngine({
  clinic,
  reduceMotion,
}: {
  clinic: ClinicType;
  reduceMotion: boolean | null;
}) {
  const data = clinicData[clinic];
  const uid = useId().replace(/:/g, "");
  const radius = 118;

  return (
    <div className="forwho-engine relative mx-auto aspect-square w-full max-w-[340px] sm:max-w-[380px]">
      {/* Outer rotating ring */}
      <motion.div
        aria-hidden
        className="forwho-engine-ring absolute inset-[6%] rounded-full"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 48, repeat: Infinity, ease: "linear" }
        }
      />
      <motion.div
        aria-hidden
        className="forwho-engine-ring forwho-engine-ring--inner absolute inset-[18%] rounded-full"
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 36, repeat: Infinity, ease: "linear" }
        }
      />

      {/* Connection lines */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
        <defs>
          <linearGradient id={`fw-line-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00B4D8" stopOpacity="0" />
            <stop offset="50%" stopColor="#00B4D8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0077A8" stopOpacity="0" />
          </linearGradient>
        </defs>
        {data.nodes.map((node) => {
          const rad = ((node.angle - 90) * Math.PI) / 180;
          const x = 50 + Math.cos(rad) * 34;
          const y = 50 + Math.sin(rad) * 34;
          return (
            <line
              key={node.id}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke={`url(#fw-line-${uid})`}
              strokeWidth="0.35"
              className="forwho-engine-line"
            />
          );
        })}
      </svg>

      {/* Center core */}
      <div className="forwho-engine-core absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center text-center">
        <motion.span
          aria-hidden
          className="forwho-engine-pulse absolute inset-[-18%] rounded-full"
          animate={reduceMotion ? undefined : { opacity: [0.35, 0.75, 0.35], scale: [1, 1.06, 1] }}
          transition={reduceMotion ? undefined : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="relative text-[10px] font-bold uppercase tracking-[0.22em] text-[#7DD3EA]/80">
          AI
        </span>
        <span className="relative mt-0.5 text-sm font-extrabold leading-tight text-white sm:text-base">
          GROWTH
          <br />
          ENGINE
        </span>
      </div>

      {/* Orbiting nodes */}
      {data.nodes.map((node, i) => {
        const rad = ((node.angle - 90) * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        const Icon = node.Icon;
        return (
          <motion.div
            key={`${clinic}-${node.id}`}
            className="forwho-node group absolute left-1/2 top-1/2 z-20"
            style={{ x: x - 22, y: y - 22 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * i, duration: 0.4, ease: easeOut }}
          >
            <motion.button
              type="button"
              className="forwho-node-btn"
              aria-label={node.label}
              animate={
                reduceMotion
                  ? undefined
                  : { y: [0, i % 2 === 0 ? -4 : 4, 0] }
              }
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: 3.8 + (i % 3) * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.15,
                    }
              }
              whileHover={reduceMotion ? undefined : { scale: 1.08, y: -2 }}
            >
              <Icon className="h-3.5 w-3.5 text-[#00B4D8]" strokeWidth={2} />
              <span className="forwho-node-tip">{node.label}</span>
            </motion.button>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function ForWho() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const reduceMotion = useReducedMotion();
  const { openForm } = useForm();
  const [clinic, setClinic] = useState<ClinicType>("dental");
  const [isMobile, setIsMobile] = useState(false);
  const data = clinicData[clinic];

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <section className="forwho-section relative overflow-x-clip" ref={ref} aria-label="Who we help">
      <div aria-hidden className="forwho-bg absolute inset-0" />
      <div aria-hidden className="forwho-bg-orb forwho-bg-orb--a" />
      <div aria-hidden className="forwho-bg-orb forwho-bg-orb--b" />
      <div aria-hidden className="forwho-bg-grid absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:py-24">
        {/* Header */}
        <div className="mb-10 text-center lg:mb-14">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: easeOut }}
            className="forwho-badge mb-5 inline-flex items-center gap-2"
          >
            <span className="forwho-badge-dot" />
            WHO WE HELP
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOut }}
            className="mx-auto max-w-3xl text-[1.65rem] font-extrabold leading-[1.2] tracking-tight text-white sm:text-3xl lg:text-4xl"
          >
            THE PERFECT AGENCY FOR{" "}
            <span className="text-[#5ce1ff]">CLINIC OWNERS</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.18, ease: easeOut }}
            className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-[#8eb4c4] sm:text-base"
          >
            Different clinics. Different patients. One growth system built around how your practice
            actually works.
          </motion.p>
        </div>

        {/* Interactive shell */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.22, ease: easeOut }}
          className="forwho-shell"
        >
          <div className="grid items-center gap-8 lg:grid-cols-[220px_minmax(0,1fr)_minmax(260px,320px)] lg:gap-6 xl:gap-8">
            {/* LEFT — selector */}
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3, ease: easeOut }}
              className="order-1"
            >
              <div
                className={`forwho-selector ${isMobile ? "forwho-selector--segmented" : ""}`}
                role="tablist"
                aria-label="Clinic type"
              >
                {(
                  [
                    { id: "dental" as const, label: "Dental Clinics", Icon: Smile },
                    { id: "aesthetic" as const, label: "Aesthetic Clinics", Icon: Sparkles },
                  ] as const
                ).map((opt) => {
                  const active = clinic === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setClinic(opt.id)}
                      className={`forwho-select-btn ${active ? "forwho-select-btn--active" : ""}`}
                    >
                      <span className="forwho-select-icon">
                        <opt.Icon className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <span className="text-left">
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-[#7DD3EA]/70">
                          {opt.id === "dental" ? "Dental" : "Aesthetic"}
                        </span>
                        <span className="block text-sm font-semibold text-white">{opt.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* CENTER — growth engine */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.38, ease: easeOut }}
              className="order-2 relative py-4"
            >
              {/* Floating chips */}
              <div className="pointer-events-none absolute inset-0 z-30 hidden sm:block" aria-hidden>
                <AnimatePresence mode="wait">
                  {data.chips.map((chip, i) => {
                    const positions = [
                      "left-[2%] top-[8%]",
                      "right-[0%] top-[18%]",
                      "left-[-2%] bottom-[22%]",
                      "right-[2%] bottom-[12%]",
                    ];
                    return (
                      <motion.div
                        key={`${clinic}-${chip}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={
                          reduceMotion
                            ? { opacity: 1, y: 0 }
                            : { opacity: [0.75, 1, 0.75], y: [0, i % 2 ? -5 : 5, 0] }
                        }
                        exit={{ opacity: 0, y: -6 }}
                        transition={
                          reduceMotion
                            ? { duration: 0.3 }
                            : {
                                opacity: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" },
                                y: { duration: 4.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
                                delay: 0.1 * i,
                              }
                        }
                        className={`forwho-chip pointer-events-auto absolute ${positions[i]}`}
                      >
                        {chip}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={clinic}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: easeOut }}
                >
                  <GrowthEngine clinic={clinic} reduceMotion={reduceMotion} />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* RIGHT — live profile */}
            <motion.div
              initial={{ opacity: 0, x: 28 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.42, ease: easeOut }}
              className="order-3 min-w-0"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={clinic}
                  initial={{ opacity: 0, x: clinic === "dental" ? -18 : 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: clinic === "dental" ? 18 : -18 }}
                  transition={{ duration: 0.45, ease: easeOut }}
                  className="forwho-profile"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00B4D8]">
                    {data.title}
                  </p>
                  <h3 className="mt-2 text-xl font-extrabold leading-snug text-white">
                    {data.tagline}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#8eb4c4]">{data.body}</p>

                  <div className="mt-5 space-y-2.5">
                    {data.metrics.map((m, i) => (
                      <motion.div
                        key={m.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 + i * 0.08, duration: 0.4, ease: easeOut }}
                        className="forwho-metric"
                      >
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#0077A8]/80">
                          {m.label}
                        </span>
                        <span className="mt-0.5 block text-sm font-bold text-white">{m.value}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-5">
                    <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
                      What we build
                    </p>
                    <ul className="space-y-2">
                      {data.builds.map((item, i) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + i * 0.06, duration: 0.35, ease: easeOut }}
                          className="flex items-center gap-2.5 text-sm text-[#3d5c6e]"
                        >
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-[#00B4D8]/30 bg-[#00B4D8]/10">
                            <Check className="h-3 w-3 text-[#00B4D8]" strokeWidth={2.5} />
                          </span>
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={openForm}
                    className="forwho-cta group mt-6"
                    data-analytics-label={
                      clinic === "dental" ? "grow_dental_clinic" : "grow_aesthetic_clinic"
                    }
                    data-analytics-location="for_who"
                  >
                    {data.cta}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
