"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useForm } from "@/context/FormContext";
import React from "react";

const patients = [
  { name: "John Miller", treatment: "Teeth Cleaning", time: "11:00 AM", status: "Confirmed" },
  { name: "Emily Johnson", treatment: "Braces Checkup", time: "12:30 PM", status: "Arrived" },
  { name: "Sarah Williams", treatment: "Whitening", time: "02:00 PM", status: "Pending" },
  { name: "Michael Davis", treatment: "Root Canal", time: "03:30 PM", status: "Confirmed" },
];

const statusStyles: Record<string, React.CSSProperties> = {
  Confirmed: { background: "#DBEAFE", color: "#1D4ED8" },
  Arrived:   { background: "#D1FAE5", color: "#065F46" },
  Pending:   { background: "#FEF3C7", color: "#92400E" },
};

export default function EHRDashboard() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { openForm } = useForm();

  return (
    <section className="py-16 lg:py-20 bg-[#F8FAFC]" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* Left — EHR mockup */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }}>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              {/* Header bar */}
              <div className="bg-[#00283C] px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <span className="text-white/60 text-xs font-mono">Alliance EHR — Today&apos;s Schedule</span>
                <span className="text-white/60 text-xs">Live</span>
              </div>

              {/* Dashboard stats */}
              <div className="bg-white px-5 py-3 grid grid-cols-3 gap-3 border-b border-gray-100">
                {[
                  { label: "Today's Patients", value: "12" },
                  { label: "Pending", value: "4" },
                  { label: "Revenue Today", value: "$4,200" },
                ].map((s) => (
                  <div key={s.label} className="text-center py-1">
                    <div className="text-lg font-extrabold text-[#00283C]">{s.value}</div>
                    <div className="text-[10px] text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Patient list */}
              <div className="bg-white">
                {patients.map((p, i) => (
                  <motion.div key={p.name}
                    initial={{ opacity: 0, x: -12 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center justify-between px-5 py-3 border-b border-gray-50 hover:bg-[#F8FAFC] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E6F4F8] flex items-center justify-center text-xs font-bold text-[#0077A8] flex-shrink-0">
                        {p.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.treatment}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{p.time}</span>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                        style={statusStyles[p.status] ?? {}}>
                        {p.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white px-5 py-3 flex gap-2">
                <div className="flex-1 bg-[#F8FAFC] border border-gray-100 rounded-md px-3 py-2 text-xs text-gray-400">Search patients...</div>
                <button className="bg-[#00283C] text-white text-xs px-4 py-2 rounded-md font-semibold">+ Add Patient</button>
              </div>
            </div>
          </motion.div>

          {/* Right — text */}
          <motion.div initial={{ opacity: 0, x: 24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}>
            <span className="badge-light mb-5">EHR PLATFORM</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-4">
              Replace Your Paper Register<br />
              <span className="gradient-heading">Go Fully Digital</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Built for dental and aesthetic clinics across the United States. Patient records, appointments, prescriptions, and billing — all on one screen, accessible from any device.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Digital patient records — searchable, secure",
                "Appointment calendar with SMS reminders",
                "Digital prescriptions — print or WhatsApp",
                "Billing & invoice tracking in USD",
                "Patient mobile app with booking",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={openForm} className="btn-dark px-7 py-3.5 text-sm">
              Book a Free EHR Demo
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
