"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Bot,
  Clock,
  CheckCircle2,
  MessageSquare,
  Calendar,
  Star,
  Mic,
} from "lucide-react";
import { useForm } from "@/context/FormContext";

const capabilities = [
  { icon: MessageSquare, text: "Answers patient questions instantly, 24/7" },
  { icon: Calendar, text: "Books appointments automatically" },
  { icon: Clock, text: "Sends confirmation & reminders" },
  { icon: Star, text: "Handles FAQs without staff intervention" },
  { icon: CheckCircle2, text: "Qualifies leads before follow-up" },
  { icon: Mic, text: "Works via phone, website chat & voice" },
];

const demoMessages: { from: "patient" | "ai"; text: string; confirmed?: boolean }[] = [
  { from: "patient", text: "How much is teeth whitening?" },
  {
    from: "ai",
    text: "From $300 — in-clinic laser (60 min) or a 14-day take-home kit. Want a free consult?",
  },
  { from: "patient", text: "Yes — Tuesday 3pm works" },
  {
    from: "ai",
    text: "✅ Booked — Tue · 3:00 PM\nFree whitening consult\nReminder sent",
    confirmed: true,
  },
];

export default function AIReceptionist() {
  const { openForm } = useForm();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden" ref={ref}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #FFFFFF 0%, #F0F7FA 40%, #FFFFFF 100%)",
        }}
      />
      <div
        className="absolute top-1/2 left-0 w-[420px] h-[420px] -translate-y-1/2 rounded-full pointer-events-none opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(0,180,216,0.25), transparent 70%)" }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="badge-light mb-5 inline-flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> Meet Maya
            </span>

            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-4">
              Your Clinic&apos;s{" "}
              <span className="gradient-heading">24/7 AI Receptionist</span>
            </h2>

            <p className="text-gray-500 leading-relaxed mb-8 max-w-md">
              Never lose another patient to a missed call or unanswered message.
              Our AI receptionist handles everything — automatically, intelligently, around the clock.
            </p>

            <ul className="grid sm:grid-cols-2 gap-3 mb-9">
              {capabilities.map((cap, i) => {
                const Icon = cap.icon;
                return (
                  <motion.li
                    key={cap.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="flex items-start gap-2.5 text-sm text-gray-600 rounded-xl border border-gray-100 bg-white/80 px-3 py-2.5 shadow-sm"
                  >
                    <span className="w-7 h-7 rounded-lg bg-[#E6F4F8] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-[#0077A8]" />
                    </span>
                    <span className="leading-snug pt-0.5">{cap.text}</span>
                  </motion.li>
                );
              })}
            </ul>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <a
                href="/ai-receptionist"
                className="btn-dark px-7 py-3.5 text-sm w-full sm:w-auto text-center shadow-md shadow-[#00283C]/10"
              >
                Try Maya — live demo
              </a>
              <button
                type="button"
                onClick={openForm}
                className="text-sm font-semibold text-[#0077A8] hover:underline px-2"
              >
                Or schedule a setup call
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="w-full max-w-md mx-auto lg:ml-auto relative"
          >
            <div
              className="absolute -inset-4 rounded-3xl blur-2xl opacity-60 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 30%, rgba(0,119,168,0.2), transparent 70%)",
              }}
            />
            <div className="relative rounded-2xl shadow-2xl shadow-[#00283C]/12 border border-gray-100/80 bg-white overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3.5 bg-[#00283C]">
                <div className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-[#9FD3E8]" aria-hidden />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#00283C]" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">Maya · AI Receptionist</div>
                  <div className="text-[11px] text-white/60 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                    Online · replies in seconds
                  </div>
                </div>
              </div>

              <div
                className="flex flex-col gap-3 p-4 bg-[#F8FAFC]"
                role="log"
                aria-label="Example booking conversation"
              >
                {demoMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.25 + i * 0.12 }}
                    className={`flex gap-2 ${msg.from === "ai" ? "justify-start" : "justify-end"}`}
                  >
                    {msg.from === "ai" && (
                      <div className="w-7 h-7 rounded-full bg-[#00283C] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-[#9FD3E8]" aria-hidden />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] min-w-0 break-words rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-line ${
                        msg.from === "ai"
                          ? msg.confirmed
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-bl-sm"
                            : "bg-white border border-gray-100 shadow-sm text-gray-700 rounded-bl-sm"
                          : "bg-[#00283C] text-white rounded-br-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-white">
                <p className="text-xs text-gray-500">
                  Typical booking ·{" "}
                  <span className="font-semibold text-[#0077A8]">under 30 seconds</span>
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Booked
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-100 bg-white/90 backdrop-blur px-4 py-3 shadow-sm">
                <div className="text-[11px] text-gray-400 mb-0.5">Reply time</div>
                <div className="text-lg font-extrabold text-emerald-600">&lt;2 sec</div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white/90 backdrop-blur px-4 py-3 shadow-sm">
                <div className="text-[11px] text-gray-400 mb-0.5">Always on</div>
                <div className="text-lg font-extrabold text-[#0077A8]">24/7</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
