"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useCardMotion, staggerDelay } from "@/lib/motionVariants";

const faqs = [
  {
    q: "How quickly will I see results?",
    a: "Most clinics see measurable results — more calls, WhatsApp inquiries, and Google traffic — within 30–45 days. Full results typically show by day 60. We give you a clear month-by-month projection at the start.",
  },
  {
    q: "What is your minimum contract length?",
    a: "We require a minimum commitment of 3–6 months. Real results — Google rankings, ad optimisation, AI training — take time to compound. 90%+ of our clients continue well beyond 6 months because the ROI speaks for itself.",
  },
  {
    q: "What if I already have a website?",
    a: "We audit your existing website first. If it can be improved without a full rebuild, we do that. If it's holding you back, we'll build a new one as part of your plan.",
  },
  {
    q: "How does the AI Receptionist work?",
    a: "It's connected to your clinic's phone number and WhatsApp. It answers in English, qualifies the patient, and books them directly into your appointment calendar — 24/7 without any staff involvement.",
  },
  {
    q: "What kinds of clinics do you work with?",
    a: "Healthcare clinics that take appointments — dental, aesthetic/med spa, dermatology, chiropractic, physio, urgent care, ENT, and other outpatient practices. If patients call, search, and book, we can help fill the calendar.",
  },
  {
    q: "What is the EHR platform?",
    a: "EHR stands for Electronic Health Records. It's a digital system that replaces your paper register — patient records, prescriptions, billing, and appointment management all in one screen. We build it and train your staff on it.",
  },
  {
    q: "Can I see results before committing?",
    a: "Yes. We offer a free clinic audit with a written report showing exactly where your current gaps are, what we'd do, and what results you could expect. No commitment required.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const { entrance, expandTransition } = useCardMotion();

  return (
    <section
      className="faq-section relative overflow-x-clip scroll-mt-24 py-16 lg:py-20"
      id="faq"
    >
      <div aria-hidden className="innov-grid-lines absolute inset-0" />
      <div aria-hidden className="innov-nodes absolute inset-0 opacity-30" />

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <motion.div {...entrance(0)} className="mb-10 text-center">
          <span className="faq-badge mb-4 inline-flex items-center gap-2">
            <span className="faq-badge-dot" />
            FAQ
          </span>
          <h2 className="mt-4 mb-3 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
            Questions Clinics{" "}
            <span className="gradient-heading">Always Ask</span>
          </h2>
        </motion.div>

        <div className="faq-list space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={f.q}
                {...entrance(staggerDelay(i))}
                layout
                whileHover={
                  isOpen
                    ? undefined
                    : { y: -4, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
                }
                className={`faq-item group ${isOpen ? "faq-item--open" : ""}`}
              >
                <span aria-hidden className="faq-item-accent" />
                <span aria-hidden className="faq-item-scan" />
                <span aria-hidden className="faq-item-glow" />

                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="faq-item-btn relative z-[1] flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                >
                  <span className="faq-q text-sm font-semibold leading-snug text-white sm:text-[15px]">
                    {f.q}
                  </span>
                  <span
                    className={`faq-plus flex h-8 w-8 flex-shrink-0 items-center justify-center ${
                      isOpen ? "faq-plus--open" : ""
                    }`}
                    aria-hidden
                  >
                    <Plus
                      className={`h-4 w-4 transition-transform duration-300 ${
                        isOpen ? "rotate-45" : "group-hover:rotate-90"
                      }`}
                      strokeWidth={2.5}
                    />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={expandTransition()}
                      className="relative z-[1] overflow-hidden"
                    >
                      <p className="faq-answer border-t px-5 pb-5 pt-4 text-sm leading-relaxed sm:px-6">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
