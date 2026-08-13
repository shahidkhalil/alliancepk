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
  SearchCheck,
  ClipboardList,
  Settings2,
  Rocket,
  BarChart3,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useForm } from "@/context/FormContext";

const steps: {
  num: string;
  title: string;
  desc: string;
  time: string;
  Icon: LucideIcon;
}[] = [
  {
    num: "01",
    title: "Free Clinic Audit",
    desc: "We analyse your current online presence — Google ranking, website, social ads, WhatsApp — and identify exactly where patients are leaking out.",
    time: "Day 1",
    Icon: SearchCheck,
  },
  {
    num: "02",
    title: "Custom Growth Plan",
    desc: "We build a tailored plan for your clinic: which channels to focus on, what budget to set, and what results to expect in 30, 60, and 90 days.",
    time: "Day 2–3",
    Icon: ClipboardList,
  },
  {
    num: "03",
    title: "Onboarding & Setup",
    desc: "We set up your ads, website, AI receptionist, WhatsApp automation, and EHR — all configured and ready before we go live.",
    time: "Week 1",
    Icon: Settings2,
  },
  {
    num: "04",
    title: "Launch & Optimise",
    desc: "We go live, monitor performance daily, and optimise based on what your specific clinic patients respond to.",
    time: "Week 2",
    Icon: Rocket,
  },
  {
    num: "05",
    title: "Monthly Reporting",
    desc: "You get a clear monthly report: patients acquired, cost per lead, Google ranking changes, WhatsApp inquiries handled, and ROI.",
    time: "Monthly",
    Icon: BarChart3,
  },
  {
    num: "06",
    title: "Scale & Grow",
    desc: "Once we know what works, we scale what converts — more patients, more revenue, without proportionally more spend.",
    time: "Ongoing",
    Icon: TrendingUp,
  },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

/** Entrance X: 01 L, 02 slight L, 03 R, 04 L, 05 slight R, 06 R */
function enterX(index: number, mobile: boolean, reduced: boolean) {
  if (reduced) return 0;
  const full = mobile ? 48 : 90;
  const slight = mobile ? 36 : 55;
  const map = [-full, -slight, full, -full, slight, full];
  return map[index] ?? 0;
}

export default function Process() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const reduceMotion = useReducedMotion();
  const { openForm } = useForm();
  const [hovered, setHovered] = useState<string | null>(null);
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
  const glowY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion || isMobile ? [0, 0] : [12, -12]
  );
  const dotsY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion || isMobile ? [0, 0] : [-6, 6]
  );

  return (
    <section
      ref={ref}
      id="how-it-works"
      className="process-section relative overflow-x-clip py-16 lg:py-20"
    >
      <div aria-hidden className="process-bg absolute inset-0" />
      <motion.div
        aria-hidden
        className="process-glow process-glow--a absolute"
        style={{ y: glowY }}
      />
      <motion.div
        aria-hidden
        className="process-glow process-glow--b absolute"
        style={{ y: dotsY }}
      />
      <motion.div
        aria-hidden
        className="process-dots absolute inset-0"
        style={{ y: dotsY }}
      />
      <div aria-hidden className="process-grid absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: easeOut }}
            className="process-badge mb-4 inline-flex items-center gap-2"
          >
            <span className="process-badge-dot" />
            HOW IT WORKS
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.08, ease: easeOut }}
            className="mt-4 mb-3 text-3xl font-extrabold tracking-tight text-white lg:text-4xl"
          >
            Your Timeline to{" "}
            <span className="process-heading-accent">Clinic Growth</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.14, ease: easeOut }}
            className="mx-auto max-w-xl text-base leading-relaxed text-[#8eb4c4]"
          >
            A clear, structured process — no guesswork, no jargon. You&apos;ll
            always know exactly what we&apos;re doing and why.
          </motion.p>
        </div>

        <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = s.Icon;
            const dimOthers =
              !isMobile && hovered != null && hovered !== s.num;

            return (
              <motion.div
                key={s.num}
                initial={{
                  opacity: 0,
                  x: enterX(i, isMobile, !!reduceMotion),
                  scale: reduceMotion ? 1 : 0.97,
                }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: reduceMotion ? 0.25 : isMobile ? 0.65 : 0.8,
                  delay: reduceMotion ? 0 : 0.08 + i * 0.14,
                  ease: easeOut,
                }}
                whileHover={
                  reduceMotion || isMobile
                    ? undefined
                    : { y: -6, transition: { duration: 0.35, ease: easeOut } }
                }
                onPointerEnter={() => !isMobile && setHovered(s.num)}
                onPointerLeave={() =>
                  setHovered((prev) => (prev === s.num ? null : prev))
                }
                className={`process-card group relative h-full ${
                  dimOthers ? "process-card--dim" : ""
                } ${hovered === s.num ? "process-card--active" : ""}`}
              >
                <span aria-hidden className="process-card-accent" />

                <div className="relative z-[2] flex h-full flex-col p-6 lg:p-7">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <motion.span
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: reduceMotion ? 0 : 0.2 + i * 0.14,
                        duration: 0.45,
                      }}
                      className="process-num"
                    >
                      {s.num}
                    </motion.span>
                    <span className="process-time">{s.time}</span>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.94 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: reduceMotion ? 0 : 0.22 + i * 0.14,
                      duration: 0.45,
                      ease: easeOut,
                    }}
                    className="process-icon mb-4"
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.85} />
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: reduceMotion ? 0 : 0.28 + i * 0.14,
                      duration: 0.4,
                      ease: easeOut,
                    }}
                    className="mb-2 text-base font-bold tracking-tight text-white"
                  >
                    {s.title}
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: reduceMotion ? 0 : 0.34 + i * 0.14,
                      duration: 0.4,
                      ease: easeOut,
                    }}
                    className="text-sm leading-relaxed text-[#8eb4c4]"
                  >
                    {s.desc}
                  </motion.p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.85, duration: 0.5, ease: easeOut }}
          className="text-center"
        >
          <button
            type="button"
            onClick={openForm}
            className="process-cta px-8 py-4 text-base"
          >
            Get Your Free Clinic Audit
          </button>
          <p className="mt-3 text-sm text-white/40">
            Minimum 3–6 month engagement. Just enough time for results to
            compound and your ROI to become undeniable.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
