"use client";

import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { useCardMotion, staggerDelay } from "@/lib/motionVariants";



const faqs = [
  { q: "How does the AI Receptionist work?", a: "It's connected to your clinic's phone number and website chat. It answers in English, qualifies the patient, and books them directly into your appointment calendar — 24/7 without any staff involvement. WhatsApp is a separate automation service." },
  { q: "What does the AI Receptionist cost?", a: "It's a one-time build: Basic $2,000, Standard $4,000, and Premium $6,000. Optional add-ons (extra conversations, live voice, CRM/EHR sync) can be monthly if you need them." },
  { q: "Will the AI Receptionist replace my front desk staff?", a: "No. It covers missed calls, after-hours inquiries, and overflow so your team can focus on patients in the clinic. Staff can take over any conversation at any time." },
  { q: "Can it book appointments into our existing calendar?", a: "Yes. Standard and Premium connect to your calendar (and CRM/EHR where needed) so bookings land automatically — no double entry." },
  { q: "How long does AI Receptionist setup take?", a: "Typically about 5 business days. We train it on your services, prices, hours, and escalation rules, test with your team, then go live." },
  { q: "How quickly will I see results?", a: "Most clinics see measurable results — more calls answered, website chat replies, and booked appointments — within 30–45 days. We give you a clear month-by-month projection at the start." },
  { q: "What is your minimum contract length?", a: "We require a minimum commitment of 3–6 months for ongoing growth work. One-time automation builds (like AI Receptionist) are paid once at launch. 90%+ of our clients continue because the ROI speaks for itself." },
  { q: "What kinds of clinics do you work with?", a: "Healthcare clinics that take appointments — dental, aesthetic/med spa, dermatology, chiropractic, physio, urgent care, ENT, primary care, and other outpatient practices. If patients call, search, and book, we can help fill the calendar." },
  { q: "Can I see results before committing?", a: "Yes. We offer a free clinic audit with a written report showing exactly where patients are dropping off, what we'd automate first, and what results you could expect. No commitment required." },
];



export default function FAQ() {

  const [open, setOpen] = useState<number | null>(0);

  const { entrance, hoverProps, expandTransition } = useCardMotion();



  return (

    <section className="py-16 lg:py-20 bg-[#F8FAFC] scroll-mt-24" id="faq">

      <div className="max-w-3xl mx-auto px-6">

        <motion.div {...entrance(0)} className="text-center mb-10">

          <span className="badge-light mb-4">FAQ</span>

          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-3">

            Questions Clinics <span className="gradient-heading">Always Ask</span>

          </h2>

        </motion.div>



        <div className="space-y-3">

          {faqs.map((f, i) => (

            <motion.div

              key={i}

              {...entrance(staggerDelay(i))}

              {...hoverProps(false)}

              layout

              className={`card-white card-accent-light rounded-2xl overflow-hidden card-shadow-hover ${

                open === i ? "ring-1 ring-[#00B4D8]/25" : ""

              }`}

            >

              <button

                onClick={() => setOpen(open === i ? null : i)}

                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-[#FAFCFD] transition-colors"

              >

                <span className="text-sm font-semibold text-[#00283C]">{f.q}</span>

                <span

                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${

                    open === i ? "bg-[#00283C] text-white rotate-45" : "bg-[#E6F4F8] text-[#00B4D8]"

                  }`}

                >

                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>

                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />

                  </svg>

                </span>

              </button>

              <AnimatePresence initial={false}>

                {open === i && (

                  <motion.div

                    initial={{ height: 0, opacity: 0 }}

                    animate={{ height: "auto", opacity: 1 }}

                    exit={{ height: 0, opacity: 0 }}

                    transition={expandTransition()}

                    className="overflow-hidden"

                  >

                    <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">

                      {f.a}

                    </p>

                  </motion.div>

                )}

              </AnimatePresence>

            </motion.div>

          ))}

        </div>

      </div>

    </section>

  );

}

