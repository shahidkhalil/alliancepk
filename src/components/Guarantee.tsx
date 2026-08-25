"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useForm } from "@/context/FormContext";
import { useCardMotion, staggerDelay } from "@/lib/motionVariants";

const guaranteeItems = [
  { icon: "✅", title: "Free audit — no strings attached", desc: "We analyse your online presence and give you a written report. You keep it even if you don't work with us." },
  { icon: "📈", title: "Measurable growth in 60 days", desc: "We set clear KPIs at the start: patient inquiries, Google ranking, call volume. You can see the progress live." },
  { icon: "🚫", title: "3–6 month minimum", desc: "Results take time to compound. We ask for 3–6 months — and we back every day of it with measurable outcomes." },
  { icon: "🤝", title: "Dedicated account team", desc: "One point of contact who knows your clinic. Not a ticket system. Not a call centre. A real person." },
];

export default function Guarantee() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { openForm } = useForm();
  const { entrance, hoverProps } = useCardMotion();

  return (
    <section className="py-16 lg:py-20 bg-white" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="rounded-2xl overflow-hidden border border-[#00283C]/10 shadow-xl"
        >
          <div className="bg-[#00283C] px-8 py-4 flex items-center justify-between">
            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">RISK-FREE GUARANTEE</span>
            <span className="text-xs text-white/60">Alliance Tech (PVT) LTD</span>
          </div>

          <div className="bg-white p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="text-6xl mb-5">🛡️</div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] mb-4 leading-tight tracking-tight">
                  Results in 60 Days —<br />
                  <span className="gradient-heading">Or You Don&apos;t Pay</span>
                </h2>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Most agencies guess. We audit, prove, and guarantee. Our free clinic audit shows you exactly where patients are leaking — whether you hire us or not, you walk away with a clear plan.
                </p>
                <p className="text-gray-500 leading-relaxed mb-8">
                  For qualifying clinics, we guarantee measurable growth within 60 days — more patient inquiries, better Google ranking, or reduced missed calls. If we don&apos;t deliver, you don&apos;t pay. No fluff. Minimum 3–6 month commitment.
                </p>
                <button onClick={openForm} className="btn-dark px-8 py-4 text-base">
                  Get Your Free Clinic Audit
                </button>
              </div>

              <div className="space-y-4">
                {guaranteeItems.map((item, i) => (
                  <motion.div
                    key={item.title}
                    {...entrance(staggerDelay(i))}
                    {...hoverProps(true)}
                    className="flex gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-gray-100 card-motion"
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-[#00283C]">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {[
                { stat: "100+", label: "Clinics Served" },
                { stat: "4.9★", label: "Average Rating" },
                { stat: "60 days", label: "To Results" },
                { stat: "0", label: "Hidden Fees" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-extrabold text-[#00283C]">{s.stat}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
