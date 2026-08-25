"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { usePackageOrder } from "@/context/PackageOrderContext";
import { priceToNumber, trackConversion, trackEvent } from "@/lib/analytics";

const ENDPOINT =
  process.env.NEXT_PUBLIC_PACKAGE_ORDER_ENDPOINT ||
  "https://asia-south1-alliancepak.cloudfunctions.net/packageOrder";

export default function PackageOrderForm() {
  const { selection, closeOrder } = usePackageOrder();
  const [form, setForm] = useState({ name: "", email: "", phone: "", clinicName: "", notes: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const startedRef = useRef(false);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const phoneOk = form.phone.replace(/\D/g, "").length >= 10;
  const canSubmit = form.name.trim().length >= 2 && emailOk && phoneOk && status !== "sending";

  const close = () => {
    closeOrder();
    setTimeout(() => {
      setStatus("idle"); setReference(""); setError("");
      setForm({ name: "", email: "", phone: "", clinicName: "", notes: "" });
      startedRef.current = false;
    }, 300);
  };

  const updateField = (fieldName: keyof typeof form, value: string) => {
    if (!startedRef.current && selection) {
      startedRef.current = true;
      trackEvent("form_start", {
        form_id: "package_order",
        service_id: selection.serviceId,
        package_name: selection.packageName,
      });
    }
    setForm((current) => ({ ...current, [fieldName]: value }));
  };

  const submit = async () => {
    if (!selection || !canSubmit) return;
    setStatus("sending"); setError("");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...selection }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setReference(data.reference);
      setStatus("done");
      const value = priceToNumber(selection.price);
      trackEvent("form_submit", {
        form_id: "package_order",
        service_id: selection.serviceId,
        package_name: selection.packageName,
      });
      trackConversion("quote_request", {
        budget: value,
        industry: "healthcare",
        service: selection.serviceId,
        package_name: selection.packageName,
      });
      trackEvent("generate_lead", {
        lead_source: "package_order",
        currency: "USD",
        value,
        service_id: selection.serviceId,
        package_name: selection.packageName,
      });
    } catch (e) {
      trackEvent("api_error", {
        api_name: "package_order",
        error_message: e instanceof Error ? e.message : "Package order failed",
      });
      setError(e instanceof Error ? e.message : "Please try again.");
      setStatus("error");
    }
  };

  const field =
    "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-[#00283C] outline-none focus:border-[#0077A8] focus:ring-2 focus:ring-[#0077A8]/10 transition-all";
  const label = "block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1";

  return (
    <AnimatePresence>
      {selection && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[81] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-md pointer-events-auto rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-[#00283C] px-6 py-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">
                    {status === "done" ? "Request received" : "You're requesting"}
                  </p>
                  <p className="text-white font-bold leading-snug">{selection.serviceName}</p>
                  <p className="text-[#9FD3E8] text-sm font-semibold mt-0.5">
                    {selection.packageName} · {selection.price}
                    {selection.period ? <span className="text-white/50 font-normal"> {selection.period}</span> : null}
                  </p>
                </div>
                <button onClick={close} aria-label="Close"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {status === "done" ? (
                <div className="px-6 py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-lg font-extrabold text-[#00283C] mb-1">Thanks, {form.name.split(" ")[0] || "there"}! 🎉</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Your request is in — reference <span className="font-bold text-[#00283C]">{reference}</span>.
                    We&apos;ve emailed you a confirmation and our team will call you within 2 business hours.
                  </p>
                  <p className="text-xs text-gray-400 mb-5">Nothing is charged until you approve the plan.</p>
                  <button onClick={close} className="btn-dark w-full py-3 text-sm">Done</button>
                </div>
              ) : (
                <div className="px-6 py-5 space-y-3">
                  <div>
                    <label className={label}>Your name *</label>
                    <input className={field} value={form.name} placeholder="Dr. Jane Smith"
                      onChange={(e) => updateField("name", e.target.value)} />
                  </div>
                  <div>
                    <label className={label}>Email * <span className="normal-case font-normal text-gray-300">(we send your confirmation here)</span></label>
                    <input className={field} type="email" value={form.email} placeholder="you@clinic.com"
                      onChange={(e) => updateField("email", e.target.value)} />
                  </div>
                  <div>
                    <label className={label}>Phone / WhatsApp *</label>
                    <input className={field} inputMode="tel" value={form.phone} placeholder="(555) 123-4567"
                      onChange={(e) => updateField("phone", e.target.value)} />
                  </div>
                  <div>
                    <label className={label}>Clinic name</label>
                    <input className={field} value={form.clinicName} placeholder="Bright Smile Dental"
                      onChange={(e) => updateField("clinicName", e.target.value)} />
                  </div>
                  <div>
                    <label className={label}>Anything we should know?</label>
                    <textarea className={`${field} resize-none`} rows={2} value={form.notes}
                      placeholder="Timeline, goals, questions…"
                      onChange={(e) => updateField("notes", e.target.value)} />
                  </div>

                  {status === "error" && <p className="text-xs text-red-500 text-center">{error}</p>}

                  <button onClick={submit} disabled={!canSubmit}
                    className="btn-dark w-full py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-40">
                    {status === "sending"
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                      : <>Confirm Request <ArrowRight className="w-4 h-4" /></>}
                  </button>
                  <p className="text-center text-[11px] text-gray-400">
                    🔒 No payment now. We confirm scope and pricing on a call first.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
