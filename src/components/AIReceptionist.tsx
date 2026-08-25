"use client";
import { Bot, Clock, CheckCircle2, MessageSquare, Calendar, Star, Mic } from "lucide-react";
import { useForm } from "@/context/FormContext";

const capabilities = [
  { icon: MessageSquare, text: "Answers patient questions instantly, 24/7" },
  { icon: Calendar, text: "Books appointments automatically" },
  { icon: Clock, text: "Sends confirmation & reminders" },
  { icon: Star, text: "Handles FAQs without staff intervention" },
  { icon: CheckCircle2, text: "Qualifies leads before follow-up" },
  { icon: Mic, text: "Works via chat, WhatsApp & voice" },
];

/** Instant snapshot — no timed playback. */
const demoMessages: { from: "patient" | "ai"; text: string; confirmed?: boolean }[] = [
  { from: "patient", text: "How much is teeth whitening?" },
  {
    from: "ai",
    text: "From $300 — in-clinic laser (60 min) or a 14-day take-home kit. Want a free consult?",
  },
  { from: "patient", text: "Yes — Tuesday 3pm works" },
  {
    from: "ai",
    text: "✅ Booked — Tue Jun 23 · 3:00 PM\nFree whitening consult\nReminder sent by email + SMS",
    confirmed: true,
  },
];

export default function AIReceptionist() {
  const { openForm } = useForm();

  return (
    <section className="py-16 lg:py-20 bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start lg:items-center">
          <div>
            <span className="badge-light mb-5 inline-flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> AI RECEPTIONIST
            </span>

            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-4">
              Your Clinic&apos;s <span className="gradient-heading">24/7 AI Receptionist</span>
            </h2>

            <p className="text-gray-500 leading-relaxed mb-6">
              Never lose another patient to a missed call or unanswered message. Our AI receptionist handles everything — automatically, intelligently, around the clock.
            </p>

            <ul className="space-y-3 mb-8">
              {capabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <li key={cap.text} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <span className="w-6 h-6 rounded-lg bg-[#E6F4F8] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-[#0077A8]" />
                    </span>
                    {cap.text}
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4">
              <button type="button" onClick={openForm} className="btn-dark px-7 py-3.5 text-sm w-full sm:w-auto">
                Get Your AI Receptionist
              </button>

              <div className="inline-flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm">
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-[#00283C] flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[#9FD3E8]" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div>
                  <div className="text-[#00283C] font-bold text-sm leading-tight">24 / 7 / 365</div>
                  <div className="text-gray-400 text-xs leading-tight">Always online, never tired</div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <div className="rounded-2xl shadow-2xl border border-gray-100 bg-white overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3.5 bg-[#00283C]">
                <div className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-[#9FD3E8]" aria-hidden />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#00283C]" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">Alliance AI Receptionist</div>
                  <div className="text-[11px] text-white/60 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" aria-hidden />
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
                  <div
                    key={i}
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
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-white">
                <p className="text-xs text-gray-500 min-w-0">
                  Typical booking ·{" "}
                  <span className="font-semibold text-[#0077A8]">under 30 seconds</span>
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3" aria-hidden /> Booked
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                <div className="text-[11px] text-gray-400 mb-0.5">Reply time</div>
                <div className="text-lg font-extrabold text-green-600">&lt;2 sec</div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                <div className="text-[11px] text-gray-400 mb-0.5">Appts booked</div>
                <div className="text-lg font-extrabold text-[#0077A8]">1,247</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
