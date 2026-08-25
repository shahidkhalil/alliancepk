"use client";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Bot,
  MessageCircle,
  CalendarCheck,
  BellRing,
  ClipboardList,
  ArrowRight,
  MapPin,
  Check,
} from "lucide-react";

const workflow = [
  {
    verb: "Answer",
    title: "AI Receptionist",
    desc: "Every call gets picked up — nights, weekends, and peak hours — in your clinic's voice.",
    outcome: "0 missed calls",
    href: "/ai-receptionist",
    Icon: Bot,
    feed: [
      "Incoming call · 7:42 PM",
      "AI: “Thanks for calling — how can I help?”",
      "Patient qualified → sent to booking",
    ],
  },
  {
    verb: "Reply",
    title: "WhatsApp & Chat AI",
    desc: "Messages get an instant answer, the patient is qualified, and nothing sits unread.",
    outcome: "Replies in seconds",
    href: "/whatsapp-ai-automation",
    Icon: MessageCircle,
    feed: [
      "New WhatsApp message received",
      "AI replied in 4 seconds",
      "Treatment + insurance confirmed",
    ],
  },
  {
    verb: "Book",
    title: "Auto Booking",
    desc: "Open slots are offered and confirmed automatically — no phone tag, no waiting.",
    outcome: "Booked on first contact",
    href: "/ai-receptionist",
    Icon: CalendarCheck,
    feed: [
      "Checking live calendar availability",
      "Tue 10:30 AM offered and accepted",
      "Appointment written to your system",
    ],
  },
  {
    verb: "Remind",
    title: "App & Reminders",
    desc: "Confirmations, reminders, and recovery messages run themselves so chairs stay full.",
    outcome: "Fewer no-shows",
    href: "/clinic-mobile-app",
    Icon: BellRing,
    feed: [
      "Confirmation sent instantly",
      "Reminders at 24h and 2h before",
      "Missed? Rebooking offer goes out",
    ],
  },
  {
    verb: "Record",
    title: "Records & Admin",
    desc: "Intake, charting, and billing stay paperless and connected to every booking.",
    outcome: "100% paperless",
    href: "/ehr-platform",
    Icon: ClipboardList,
    feed: [
      "Digital intake completed before arrival",
      "Chart and billing updated",
      "Zero paperwork at the front desk",
    ],
  },
];

const STEP_MS = 3000;

export default function Solutions() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-120px" });
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay || reduceMotion || !inView) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % workflow.length);
    }, STEP_MS);
    return () => clearInterval(timer);
  }, [autoplay, reduceMotion, inView]);

  const current = workflow[active];
  const progress = (active / (workflow.length - 1)) * 100;

  const selectStep = (index: number) => {
    setActive(index);
    setAutoplay(false);
  };

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
      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center mb-12 lg:mb-16"
        >
          <span className="badge-light mb-5">WHAT WE AUTOMATE</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#00283C] mt-4 mb-4 leading-tight">
            Your patient workflow —<br />
            <span className="gradient-heading">running on autopilot.</span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            One connected pipeline for healthcare clinics. Watch a patient move through it, or tap any step.
          </p>
        </motion.div>

        {/* ── Animated pipeline rail ── */}
        <div
          className="relative mb-8 lg:mb-10"
          onMouseEnter={() => setAutoplay(false)}
          role="tablist"
          aria-label="Clinic automation workflow steps"
        >
          {/* Rail track spans first node center to last node center */}
          <div aria-hidden className="absolute left-[10%] right-[10%] top-7 hidden sm:block">
            <div className="relative h-[2px] rounded-full bg-[#00283C]/10">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#0077A8] via-[#00B4D8] to-[#7DD3EA]"
                animate={{ width: `${progress}%` }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: "easeInOut" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
            {workflow.map((step, i) => {
              const isActive = i === active;
              const isDone = i < active;
              return (
                <button
                  key={step.verb}
                  type="button"
                  role="tab"
                  id={`flow-tab-${i}`}
                  aria-selected={isActive}
                  aria-controls="flow-panel"
                  onClick={() => selectStep(i)}
                  onFocus={() => selectStep(i)}
                  className="group relative flex flex-col items-center gap-3 pt-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0077A8] focus-visible:ring-offset-4 rounded-xl"
                >
                  <span className="relative flex items-center justify-center w-14 h-14">
                    {/* Pulse rings on the active node */}
                    {isActive && !reduceMotion && (
                      <motion.span
                        aria-hidden
                        className="absolute inset-0 rounded-full border border-[#00B4D8]"
                        initial={{ opacity: 0.55, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.7 }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                      />
                    )}
                    <motion.span
                      className={`relative z-[1] w-14 h-14 rounded-full flex items-center justify-center border transition-colors duration-300 ${
                        isActive
                          ? "bg-[#00283C] border-[#00B4D8]/50 shadow-[0_10px_30px_rgba(0,40,60,0.28)]"
                          : isDone
                            ? "bg-[#E8F7FB] border-[#00B4D8]/40"
                            : "bg-white border-[#00283C]/10 group-hover:border-[#0077A8]/35"
                      }`}
                      animate={reduceMotion ? {} : { scale: isActive ? 1.06 : 1 }}
                      transition={{ type: "spring", stiffness: 320, damping: 22 }}
                    >
                      {isDone ? (
                        <Check className="w-5 h-5 text-[#0077A8]" strokeWidth={2.6} aria-hidden />
                      ) : (
                        <step.Icon
                          className={`w-5 h-5 ${isActive ? "text-white" : "text-[#0077A8]"}`}
                          strokeWidth={2}
                          aria-hidden
                        />
                      )}
                    </motion.span>
                  </span>

                  <span className="text-center">
                    <span
                      className={`block text-[11px] sm:text-sm font-extrabold tracking-tight transition-colors duration-300 ${
                        isActive ? "text-[#00283C]" : "text-[#00283C]/45 group-hover:text-[#00283C]/75"
                      }`}
                    >
                      {step.verb}
                    </span>
                    <span className="hidden sm:block text-[10px] font-semibold text-[#00283C]/30 mt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </span>

                  {/* Autoplay progress underline */}
                  {isActive && autoplay && !reduceMotion && (
                    <motion.span
                      aria-hidden
                      className="absolute -bottom-1 h-[2px] rounded-full bg-[#00B4D8]/70"
                      initial={{ width: 0 }}
                      animate={{ width: "60%" }}
                      transition={{ duration: STEP_MS / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Active step panel ── */}
        <div
          id="flow-panel"
          role="tabpanel"
          aria-labelledby={`flow-tab-${active}`}
          onMouseEnter={() => setAutoplay(false)}
          className="relative rounded-[1.5rem] overflow-hidden mb-8 card-cta-dark card-cta-glow"
        >
          <div className="relative z-[1] grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-10 p-7 lg:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={`copy-${active}`}
                initial={reduceMotion ? {} : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? {} : { opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7DD3EA] mb-3">
                  Step {String(active + 1).padStart(2, "0")} · {current.verb}
                </p>
                <h3 className="text-2xl lg:text-[2rem] font-extrabold text-white leading-tight tracking-tight mb-4">
                  {current.title}
                </h3>
                <p className="text-sm lg:text-base text-white/70 leading-relaxed mb-7 max-w-md">
                  {current.desc}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]" aria-hidden />
                    {current.outcome}
                  </span>
                  <a
                    href={current.href}
                    className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-[#7DD3EA] transition-colors group/link"
                  >
                    Explore {current.title}
                    <ArrowRight
                      className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform"
                      aria-hidden
                    />
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Live activity feed */}
            <div className="relative">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                  <span className="relative flex w-2 h-2">
                    {!reduceMotion && (
                      <motion.span
                        className="absolute inset-0 rounded-full bg-[#00B4D8]"
                        animate={{ opacity: [1, 0.25, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                        aria-hidden
                      />
                    )}
                    <span className="w-2 h-2 rounded-full bg-[#00B4D8]" aria-hidden />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
                    Automation running
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.ul key={`feed-${active}`} className="space-y-3">
                    {current.feed.map((line, i) => (
                      <motion.li
                        key={line}
                        initial={reduceMotion ? {} : { opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: reduceMotion ? 0 : 0.12 + i * 0.18, duration: 0.35 }}
                        className="flex items-start gap-3"
                      >
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00B4D8]/15 border border-[#00B4D8]/30 flex items-center justify-center mt-px">
                          <Check className="w-3 h-3 text-[#7DD3EA]" strokeWidth={3} aria-hidden />
                        </span>
                        <span className="text-sm text-white/75 leading-relaxed">{line}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-[#00283C]/10 bg-[#F8FCFE] p-6 lg:px-8 lg:py-7 flex flex-col sm:flex-row sm:items-center gap-5 mb-8"
        >
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0077A8] mb-1.5">
              START ANYWHERE IN THE FLOW
            </p>
            <h3 className="text-lg font-extrabold text-[#00283C] mb-1.5 leading-snug tracking-tight">
              Most clinics begin with Answer and Book
            </h3>
            <p className="text-sm text-[#00283C]/60 leading-relaxed">
              Stop the missed calls first, then layer on messaging, reminders, and records. We&apos;ll map the right order in a free audit.
            </p>
          </div>
          <a
            href="/free-website-audit"
            data-analytics-label="start_website_audit"
            data-analytics-location="services"
            className="btn-dark inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm flex-shrink-0 min-h-[48px]"
          >
            Run My Free Audit
            <ArrowRight className="w-4 h-4" aria-hidden />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 card-cta-dark card-cta-glow"
        >
          <div className="flex items-center gap-3 relative z-[1]">
            <MapPin className="w-5 h-5 text-[#00B4D8] flex-shrink-0" strokeWidth={2} aria-hidden />
            <div>
              <p className="text-white font-bold text-sm">Houston-based — automating clinics across the United States</p>
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
