"use client";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Search, Wrench, Rocket, LineChart, ArrowRight, Check } from "lucide-react";

const steps = [
  {
    verb: "Diagnose",
    title: "Free clinic audit",
    desc: "We review your site, Google listing, and front desk to find exactly where patients drop off — and hand you the plan in writing.",
    when: "Week 1",
    Icon: Search,
    feed: [
      "Website, Google listing, and phone line reviewed",
      "Missed calls and unanswered messages counted",
      "Written plan, biggest leak first — yours to keep",
    ],
  },
  {
    verb: "Build",
    title: "Built around your gaps",
    desc: "You get only the pieces that fix what the audit found — AI receptionist, website, SEO, ads — never a generic package.",
    when: "Weeks 2–3",
    Icon: Wrench,
    feed: [
      "Scoped to your actual gaps, nothing padded",
      "AI trained on your services, prices, and hours",
      "Connected to the calendar and EHR you already use",
    ],
  },
  {
    verb: "Launch",
    title: "Live in weeks, not quarters",
    desc: "We test with your front desk, train your team in one short session, then switch it on. No long onboarding, no downtime.",
    when: "Week 4",
    Icon: Rocket,
    feed: [
      "Tested with your team before go-live",
      "Staff trained in a single session",
      "Runs without daily babysitting",
    ],
  },
  {
    verb: "Grow",
    title: "Measured in booked patients",
    desc: "Every month we report on calls answered and appointments booked, cut what doesn't work, and compound what does.",
    when: "Month 2+",
    Icon: LineChart,
    feed: [
      "Reporting tied to bookings, not clicks",
      "We double down on what fills the calendar",
      "Monthly review call with a real human",
    ],
  },
];

const STEP_MS = 3000;

export default function AboutProcessFlow() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-120px" });
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay || reduceMotion || !inView) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % steps.length);
    }, STEP_MS);
    return () => clearInterval(timer);
  }, [autoplay, reduceMotion, inView]);

  const current = steps[active];
  const progress = (active / (steps.length - 1)) * 100;

  const selectStep = (index: number) => {
    setActive(index);
    setAutoplay(false);
  };

  return (
    <div ref={ref}>
      {/* ── Animated process rail ── */}
      <div
        className="relative mb-8 lg:mb-10"
        onMouseEnter={() => setAutoplay(false)}
        role="tablist"
        aria-label="How we work, step by step"
      >
        <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-7 hidden sm:block">
          <div className="relative h-[2px] rounded-full bg-[#00283C]/10">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#0077A8] via-[#00B4D8] to-[#7DD3EA]"
              animate={{ width: `${progress}%` }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: "easeInOut" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
          {steps.map((step, i) => {
            const isActive = i === active;
            const isDone = i < active;
            return (
              <button
                key={step.verb}
                type="button"
                role="tab"
                id={`process-tab-${i}`}
                aria-selected={isActive}
                aria-controls="process-panel"
                onClick={() => selectStep(i)}
                onFocus={() => selectStep(i)}
                className="group relative flex flex-col items-center gap-3 pt-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0077A8] focus-visible:ring-offset-4 rounded-xl"
              >
                <span className="relative flex items-center justify-center w-14 h-14">
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
        id="process-panel"
        role="tabpanel"
        aria-labelledby={`process-tab-${active}`}
        onMouseEnter={() => setAutoplay(false)}
        className="relative rounded-[1.5rem] overflow-hidden card-cta-dark card-cta-glow"
      >
        <div className="relative z-[1] grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-10 p-7 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={`process-copy-${active}`}
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
                  {current.when}
                </span>
                <a
                  href="/free-website-audit"
                  data-analytics-label="start_website_audit"
                  data-analytics-location="about_process"
                  className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-[#7DD3EA] transition-colors group/link"
                >
                  Start with the free audit
                  <ArrowRight
                    className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform"
                    aria-hidden
                  />
                </a>
              </div>
            </motion.div>
          </AnimatePresence>

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
                  What you get
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.ul key={`process-feed-${active}`} className="space-y-3">
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
    </div>
  );
}
