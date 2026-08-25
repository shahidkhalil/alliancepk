"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Bot,
  Clock,
  CheckCircle2,
  MessageSquare,
  Calendar,
  Star,
  Mic,
  ArrowRight,
} from "lucide-react";
import { useForm } from "@/context/FormContext";

const capabilities = [
  { icon: MessageSquare, text: "Answers patient questions instantly, 24/7" },
  { icon: Calendar, text: "Books appointments automatically" },
  { icon: Clock, text: "Sends confirmation & reminders" },
  { icon: Star, text: "Handles FAQs without staff intervention" },
  { icon: CheckCircle2, text: "Qualifies leads before follow-up" },
  { icon: Mic, text: "Works via chat, WhatsApp & voice" },
];

/** Instant snapshot — animated in sequence on scroll. */
const demoMessages: {
  from: "patient" | "ai";
  text: string;
  confirmed?: boolean;
}[] = [
  { from: "patient", text: "How much is teeth whitening?" },
  {
    from: "ai",
    text: "From $300 — in-clinic laser (60 min) or a 14-day take-home kit. Want a free consult?",
  },
  { from: "patient", text: "Yes — Tuesday 3pm works" },
  {
    from: "ai",
    text: "Booked — Tue Jun 23 · 3:00 PM\nFree whitening consult\nReminder sent by email + SMS",
    confirmed: true,
  },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function AIReceptionist() {
  const { openForm } = useForm();
  const sectionRef = useRef<HTMLElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });
  const chatInView = useInView(chatRef, { once: true, amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const [visibleCount, setVisibleCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const [chatDone, setChatDone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!chatInView) return;

    if (reduceMotion) {
      setVisibleCount(demoMessages.length);
      setTyping(false);
      setChatDone(true);
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const play = async () => {
      for (let i = 0; i < demoMessages.length; i++) {
        if (cancelled) return;
        const msg = demoMessages[i];
        if (msg.from === "ai") {
          setTyping(true);
          await new Promise((r) => {
            timeoutId = setTimeout(r, i === 0 ? 450 : 700);
          });
          if (cancelled) return;
          setTyping(false);
        } else if (i > 0) {
          await new Promise((r) => {
            timeoutId = setTimeout(r, 380);
          });
          if (cancelled) return;
        }
        setVisibleCount(i + 1);
        await new Promise((r) => {
          timeoutId = setTimeout(r, msg.from === "patient" ? 520 : 640);
        });
      }
      if (!cancelled) setChatDone(true);
    };

    void play();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId!);
    };
  }, [chatInView, reduceMotion]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const glowY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion || isMobile ? [0, 0] : [20, -20]
  );
  const panelY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion || isMobile ? [0, 0] : [8, -8]
  );

  return (
    <section
      ref={sectionRef}
      id="ai-receptionist"
      className="airec-section relative overflow-x-clip py-16 lg:py-24"
    >
      <div aria-hidden className="airec-bg absolute inset-0" />
      <motion.div
        aria-hidden
        className="airec-glow airec-glow--a absolute"
        style={{ y: glowY }}
      />
      <motion.div
        aria-hidden
        className="airec-glow airec-glow--b absolute"
        style={{ y: panelY }}
      />
      <div aria-hidden className="airec-grid absolute inset-0" />
      <div aria-hidden className="airec-dots absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
          {/* Copy column */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: easeOut }}
              className="airec-badge mb-5 inline-flex items-center gap-2"
            >
              <Bot className="h-3.5 w-3.5" strokeWidth={2} />
              AI RECEPTIONIST
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.08, ease: easeOut }}
              className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white lg:text-4xl"
            >
              Your Clinic&apos;s{" "}
              <span className="airec-heading-accent">24/7 AI Receptionist</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.14, ease: easeOut }}
              className="mt-4 max-w-xl text-base leading-relaxed text-[#8eb4c4]"
            >
              Never lose another patient to a missed call or unanswered message.
              Our AI receptionist handles everything — automatically,
              intelligently, around the clock.
            </motion.p>

            <ul className="mt-7 space-y-2.5 mb-9">
              {capabilities.map((cap, i) => {
                const Icon = cap.icon;
                return (
                  <motion.li
                    key={cap.text}
                    initial={{ opacity: 0, x: -24 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      duration: reduceMotion ? 0.2 : 0.55,
                      delay: reduceMotion ? 0 : 0.2 + i * 0.07,
                      ease: easeOut,
                    }}
                    className="airec-capability group flex items-center gap-3 text-sm text-[#c5d8e4]"
                  >
                    <span className="airec-cap-icon">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </span>
                    {cap.text}
                  </motion.li>
                );
              })}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.55, ease: easeOut }}
              className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <button
                type="button"
                onClick={openForm}
                className="airec-cta group inline-flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                Get Your AI Receptionist
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={2.2}
                />
              </button>

              <div className="airec-online-pill inline-flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00283C]">
                    <Clock className="h-4 w-4 text-[#9FD3E8]" strokeWidth={2} />
                  </div>
                  <span className="airec-pulse-dot absolute -right-0.5 -top-0.5" />
                </div>
                <div>
                  <div className="text-sm font-bold leading-tight text-white">
                    24 / 7 / 365
                  </div>
                  <div className="text-xs leading-tight text-white/45">
                    Always online, never tired
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Chat mockup column */}
          <motion.div
            ref={chatRef}
            style={{ y: panelY }}
            initial={{ opacity: 0, x: reduceMotion ? 0 : 48, scale: reduceMotion ? 1 : 0.97 }}
            animate={
              inView
                ? { opacity: 1, x: 0, scale: 1 }
                : {}
            }
            transition={{ duration: 0.8, delay: 0.2, ease: easeOut }}
            className="relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto"
          >
            <div aria-hidden className="airec-panel-glow absolute" />

            <div className="airec-chat-panel relative overflow-hidden">
              <div className="airec-chat-header flex items-center gap-3 px-4 py-3.5">
                <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Bot className="h-5 w-5 text-[#9FD3E8]" aria-hidden strokeWidth={1.8} />
                  <span className="airec-pulse-dot absolute -bottom-0.5 -right-0.5 border-[#00314a]" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-white">
                    Alliance AI Receptionist
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-white/60">
                    <span className="airec-online-dot flex-shrink-0" aria-hidden />
                    Online · replies in seconds
                  </div>
                </div>
              </div>

              <div
                className="airec-chat-body flex min-h-[280px] flex-col gap-3 p-4"
                role="log"
                aria-label="Example booking conversation"
                aria-live="polite"
              >
                <AnimatePresence initial={false}>
                  {demoMessages.slice(0, visibleCount).map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, y: 12, scale: 0.96 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35, ease: easeOut }}
                      className={`flex gap-2 ${
                        msg.from === "ai" ? "justify-start" : "justify-end"
                      }`}
                    >
                      {msg.from === "ai" && (
                        <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#00283C]">
                          <Bot
                            className="h-3.5 w-3.5 text-[#9FD3E8]"
                            aria-hidden
                            strokeWidth={1.8}
                          />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] min-w-0 break-words rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-line ${
                          msg.from === "ai"
                            ? msg.confirmed
                              ? "airec-bubble-confirmed rounded-bl-sm"
                              : "airec-bubble-ai rounded-bl-sm"
                            : "airec-bubble-patient rounded-br-sm"
                        }`}
                      >
                        {msg.confirmed ? (
                          <span className="flex gap-2">
                            <CheckCircle2
                              className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300"
                              strokeWidth={2.2}
                              aria-hidden
                            />
                            <span>{msg.text}</span>
                          </span>
                        ) : (
                          msg.text
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <AnimatePresence>
                  {typing && (
                    <motion.div
                      key="typing"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00283C]">
                        <Bot className="h-3.5 w-3.5 text-[#9FD3E8]" aria-hidden strokeWidth={1.8} />
                      </div>
                      <div className="airec-typing" aria-hidden>
                        <span />
                        <span />
                        <span />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="airec-chat-footer flex items-center justify-between gap-3 px-4 py-3">
                <p className="min-w-0 text-xs text-white/45">
                  Typical booking ·{" "}
                  <span className="font-semibold text-[#7DD3EA]">
                    under 30 seconds
                  </span>
                </p>
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={
                    chatDone
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0.4, scale: 0.95 }
                  }
                  transition={{ duration: 0.4, ease: easeOut }}
                  className="airec-booked-badge inline-flex flex-shrink-0 items-center gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" aria-hidden strokeWidth={2.4} />
                  Booked
                </motion.span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Reply time", value: "<2 sec", accent: true },
                { label: "Appts booked", value: "1,247", accent: false },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={
                    chatDone || reduceMotion
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0.35, y: 8 }
                  }
                  transition={{
                    duration: 0.5,
                    delay: reduceMotion ? 0 : 0.1 + i * 0.08,
                    ease: easeOut,
                  }}
                  className="airec-stat"
                >
                  <div className="mb-0.5 text-[11px] text-white/40">
                    {stat.label}
                  </div>
                  <div
                    className={`text-lg font-extrabold ${
                      stat.accent ? "text-[#5EEAD4]" : "text-[#7DD3EA]"
                    }`}
                  >
                    {stat.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
