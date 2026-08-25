"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useForm } from "@/context/FormContext";

const messages = [
  { from: "patient", text: "Hi, what are your clinic hours?", time: "9:02 AM" },
  { from: "ai", text: "Hello! We're open 9 AM to 7 PM, Monday through Saturday. Would you like to book an appointment?", time: "9:02 AM" },
  { from: "patient", text: "Yes, I need an appointment for a teeth cleaning", time: "9:03 AM" },
  { from: "ai", text: "Sure! What's your name and preferred date/time? I'll book it for you right now. 😊", time: "9:03 AM" },
  { from: "patient", text: "John Miller, tomorrow Saturday 11am", time: "9:04 AM" },
  { from: "ai", text: "✅ Done! John Miller — Saturday 11 AM. Confirmation sent. See you at the clinic!", time: "9:04 AM" },
];

export default function WhatsAppDemo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { openForm } = useForm();

  return (
    <section className="py-16 lg:py-20 bg-white" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* Left — text */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }}>
            <span className="badge-light mb-5">WHATSAPP AI AUTOMATION</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-4">
              Your WhatsApp Books Patients<br />
              <span className="gradient-heading">While You Sleep</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              American patients prefer WhatsApp over phone calls. Our AI replies instantly in English, qualifies the patient, and books the appointment — all automatically, 24/7.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Instant replies in under 5 seconds",
                "English — natural conversation",
                "Books directly into your calendar",
                "Handles pricing, FAQ, directions",
                "Sends reminders to cut no-shows",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={openForm} className="btn-dark px-7 py-3.5 text-sm">
              Get WhatsApp AI for My Clinic
            </button>
          </motion.div>

          {/* Right — WhatsApp mock */}
          <motion.div initial={{ opacity: 0, x: 24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100 max-w-sm mx-auto lg:mx-0 lg:ml-auto">
              {/* WA header */}
              <div className="flex items-center gap-3 px-4 py-3" style={{ background: "#075E54" }}>
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">AT</div>
                <div>
                  <p className="text-white text-sm font-semibold">Alliance Tech AI</p>
                  <p className="text-white/60 text-xs">Online · Replies instantly</p>
                </div>
                <svg className="w-5 h-5 fill-current text-white/60 ml-auto" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>

              {/* Chat body */}
              <div className="p-4 space-y-3 min-h-[320px]" style={{ background: "#ECE5DD" }}>
                {messages.map((m, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.15 }}
                    className={`flex ${m.from === "patient" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-lg shadow-sm ${
                      m.from === "patient"
                        ? "rounded-tr-none text-gray-800 text-xs"
                        : "rounded-tl-none text-gray-800 text-xs"
                    }`}
                    style={{ background: m.from === "patient" ? "#DCF8C6" : "#FFFFFF" }}>
                      <p className="leading-relaxed">{m.text}</p>
                      <p className="text-[10px] text-gray-400 text-right mt-1">{m.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
