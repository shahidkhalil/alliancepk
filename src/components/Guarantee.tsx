"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from "framer-motion";
import {
  ShieldCheck,
  ClipboardCheck,
  BarChart3,
  Clock3,
  UsersRound,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useForm } from "@/context/FormContext";

const guaranteeItems: {
  Icon: LucideIcon;
  title: string;
  desc: string;
  metaLabel: string;
  metaValue: string;
}[] = [
  {
    Icon: ClipboardCheck,
    title: "Free audit — no strings attached",
    desc: "We analyse your online presence and give you a written report. You keep it even if you don't work with us.",
    metaLabel: "AUDIT STATUS",
    metaValue: "COMPLETE",
  },
  {
    Icon: BarChart3,
    title: "Measurable growth in 60 days",
    desc: "We set clear KPIs at the start: patient inquiries, Google ranking, call volume. You can see the progress live.",
    metaLabel: "TRACKING",
    metaValue: "LIVE",
  },
  {
    Icon: Clock3,
    title: "3–6 month minimum",
    desc: "Results take time to compound. We ask for 3–6 months — and we back every day of it with measurable outcomes.",
    metaLabel: "TIMELINE",
    metaValue: "3–6 MONTHS",
  },
  {
    Icon: UsersRound,
    title: "Dedicated account team",
    desc: "One point of contact who knows your clinic. Not a ticket system. Not a call centre. A real person.",
    metaLabel: "SUPPORT",
    metaValue: "ACTIVE",
  },
];

const statusMessages = [
  "Analyzing clinic data...",
  "Verifying growth signals...",
  "Tracking performance...",
  "System ready ✓",
];

const easeOut = [0.22, 1, 0.36, 1] as const;

const stats = [
  { stat: "100+", label: "Clinics Served" },
  { stat: "4.9★", label: "Average Rating" },
  { stat: "60 days", label: "To Results" },
  { stat: "0", label: "Hidden Fees" },
];

export default function Guarantee() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduceMotion = useReducedMotion();
  const { openForm } = useForm();

  const [activeModule, setActiveModule] = useState(-1);
  const [completed, setCompleted] = useState<number[]>([]);
  const [statusIdx, setStatusIdx] = useState(0);
  const [statusDone, setStatusDone] = useState(false);
  const [railProgress, setRailProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!inView) return;

    if (reduceMotion) {
      setActiveModule(-1);
      setCompleted([0, 1, 2, 3]);
      setStatusIdx(statusMessages.length - 1);
      setStatusDone(true);
      setRailProgress(100);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = async () => {
      for (let i = 0; i < guaranteeItems.length; i++) {
        if (cancelled) return;
        setActiveModule(i);
        setStatusIdx(Math.min(i, statusMessages.length - 1));
        setRailProgress(((i + 0.5) / guaranteeItems.length) * 100);

        await new Promise<void>((resolve) => {
          timers.push(setTimeout(resolve, 900));
        });
        if (cancelled) return;

        setCompleted((prev) => (prev.includes(i) ? prev : [...prev, i]));
        setRailProgress(((i + 1) / guaranteeItems.length) * 100);
      }

      if (cancelled) return;
      setActiveModule(-1);
      setStatusIdx(statusMessages.length - 1);
      setStatusDone(true);
    };

    timers.push(setTimeout(() => void run(), 400));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [inView, reduceMotion]);

  return (
    <section
      ref={ref}
      id="guarantee"
      className="guarantee-section relative overflow-x-clip py-16 lg:py-20"
    >
      <div aria-hidden className="guarantee-bg absolute inset-0" />
      <div aria-hidden className="guarantee-glow absolute" />
      <div aria-hidden className="innov-grid-lines absolute inset-0" />
      <div aria-hidden className="innov-nodes absolute inset-0" />
      <div aria-hidden className="innov-flare" />
      <div aria-hidden className="guarantee-grid absolute inset-0 opacity-0" />
      <div aria-hidden className="guarantee-dots absolute inset-0 opacity-0" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: easeOut }}
          className="guarantee-shell overflow-hidden"
        >
          <div className="guarantee-header flex items-center justify-between px-6 py-4 sm:px-8">
            <span className="text-xs font-bold uppercase tracking-widest text-white/70">
              RISK-FREE GUARANTEE
            </span>
            <span className="text-xs text-white/55">Alliance Tech (PVT) LTD</span>
          </div>

          <div className="guarantee-body p-8 lg:p-12">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              {/* Left */}
              <div>
                <motion.div
                  initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.9 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, ease: easeOut }}
                  className="mb-5 flex items-center gap-3"
                >
                  <div className="guarantee-shield">
                    <ShieldCheck className="h-7 w-7" strokeWidth={1.85} />
                  </div>
                  <div className="guarantee-system-pill">
                    <span className="guarantee-pulse-dot" />
                    SYSTEM ACTIVE
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.08, ease: easeOut }}
                  className="guarantee-status-line mb-4"
                >
                  <span className="guarantee-pulse-dot guarantee-pulse-dot--sm" />
                  Growth system active
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.55, delay: 0.12, ease: easeOut }}
                  className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-white lg:text-4xl"
                >
                  Results in 60 Days —<br />
                  <span className="gradient-heading">Or You Don&apos;t Pay</span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.18, ease: easeOut }}
                  className="mb-6 leading-relaxed text-[#8eb4c4]"
                >
                  Most agencies guess. We audit, prove, and guarantee. Our free
                  clinic audit shows you exactly where patients are leaking —
                  whether you hire us or not, you walk away with a clear plan.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.24, ease: easeOut }}
                  className="mb-6 leading-relaxed text-[#8eb4c4]"
                >
                  For qualifying clinics, we guarantee measurable growth within
                  60 days — more patient inquiries, better Google ranking, or
                  reduced missed calls. If we don&apos;t deliver, you don&apos;t
                  pay. No fluff. Minimum 3–6 month commitment.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.28, ease: easeOut }}
                  className="guarantee-typing mb-8"
                  aria-live="polite"
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={statusMessages[statusIdx]}
                      initial={
                        reduceMotion ? false : { opacity: 0, y: 4 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                      className={
                        statusDone
                          ? "guarantee-typing-text guarantee-typing-text--ready"
                          : "guarantee-typing-text"
                      }
                    >
                      {statusMessages[statusIdx]}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>

                <motion.button
                  type="button"
                  onClick={openForm}
                  initial={{ opacity: 0, y: 12 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.36, ease: easeOut }}
                  className="guarantee-cta group inline-flex items-center gap-2"
                >
                  Get Your Free Clinic Audit
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    strokeWidth={2.2}
                  />
                </motion.button>
              </div>

              {/* Right modules */}
              <div className="guarantee-modules relative">
                <div aria-hidden className="guarantee-rail">
                  <div className="guarantee-rail-track" />
                  <motion.div
                    className="guarantee-rail-fill"
                    style={{ height: `${railProgress}%` }}
                  />
                  {!reduceMotion && railProgress > 0 && railProgress < 100 && (
                    <motion.span
                      className="guarantee-rail-node"
                      style={{ top: `${railProgress}%` }}
                    />
                  )}
                </div>

                <div className="relative z-[1] space-y-4">
                  {guaranteeItems.map((item, i) => {
                    const Icon = item.Icon;
                    const isActive = activeModule === i;
                    const isDone = completed.includes(i);

                    return (
                      <motion.div
                        key={item.title}
                        initial={{
                          opacity: 0,
                          x: reduceMotion ? 0 : isMobile ? 36 : 50,
                          scale: reduceMotion ? 1 : 0.97,
                        }}
                        animate={
                          inView
                            ? { opacity: 1, x: 0, scale: 1 }
                            : undefined
                        }
                        transition={{
                          duration: reduceMotion ? 0.25 : 0.7,
                          delay: reduceMotion ? 0 : 0.2 + i * 0.14,
                          ease: easeOut,
                        }}
                        whileHover={
                          reduceMotion
                            ? undefined
                            : {
                                y: -3,
                                transition: { duration: 0.3, ease: easeOut },
                              }
                        }
                        className={`guarantee-module ${
                          isActive ? "guarantee-module--active" : ""
                        } ${isDone ? "guarantee-module--done" : ""}`}
                      >
                        <div className="flex gap-3.5">
                          <div className="guarantee-module-icon flex-shrink-0">
                            <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-start justify-between gap-2">
                              <p className="text-sm font-bold text-white">
                                {item.title}
                              </p>
                              {(isActive || isDone) && (
                                <span
                                  className={`guarantee-module-status ${
                                    isDone
                                      ? "guarantee-module-status--done"
                                      : ""
                                  }`}
                                >
                                  {isDone ? "DONE" : "ACTIVE"}
                                </span>
                              )}
                            </div>
                            <p className="text-xs leading-relaxed text-[#8eb4c4]">
                              {item.desc}
                            </p>
                            <div className="guarantee-module-meta mt-2.5">
                              <span>{item.metaLabel}</span>
                              <span>{item.metaValue}</span>
                            </div>
                            <div className="guarantee-progress mt-2.5">
                              <motion.div
                                className="guarantee-progress-fill"
                                initial={{ width: "0%" }}
                                animate={{
                                  width:
                                    isDone || (isActive && !reduceMotion)
                                      ? "100%"
                                      : reduceMotion && isDone
                                        ? "100%"
                                        : "0%",
                                }}
                                transition={{
                                  duration: isActive ? 0.85 : 0.35,
                                  ease: easeOut,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="guarantee-stats mt-10 grid grid-cols-2 gap-6 border-t border-[#00283C]/08 pt-8 text-center lg:grid-cols-4">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    delay: reduceMotion ? 0 : 0.7 + i * 0.06,
                    duration: 0.4,
                    ease: easeOut,
                  }}
                >
                  <div className="text-2xl font-extrabold text-white">
                    {s.stat}
                  </div>
                  <div className="mt-0.5 text-xs text-white/45">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
