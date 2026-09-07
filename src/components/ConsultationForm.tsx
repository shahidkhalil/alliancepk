"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  Loader2,
  Phone,
  Mail,
  Building2,
  User,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import {
  FormFields,
  getFormSessionId,
  hasMeaningfulData,
  saveFormDraft,
  submitCompleteLead,
} from "@/lib/formTracking";
import { trackEvent, trackFormSubmit } from "@/lib/analytics";

const clinicTypes = [
  { label: "Dental Clinic", icon: Stethoscope },
  { label: "Aesthetic Clinic", icon: Sparkles },
  { label: "Cosmetic Surgery Clinic", icon: Sparkles },
  { label: "Dermatology Clinic", icon: Stethoscope },
  { label: "Multi-Specialty Clinic", icon: Building2 },
  { label: "Other Healthcare Provider", icon: Building2 },
];

const steps = ["Service", "Your Details", "Review & Confirm"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const emptyForm: FormFields = {
  name: "",
  phone: "",
  email: "",
  clinicName: "",
  clinicType: "",
  message: "",
};

export default function ConsultationForm({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormFields>(emptyForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const sessionIdRef = useRef("");
  const formRef = useRef(form);
  const stepRef = useRef(step);
  const submittedRef = useRef(false);
  const startedRef = useRef(false);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  formRef.current = form;
  stepRef.current = step;

  useEffect(() => {
    if (isOpen) {
      sessionIdRef.current = getFormSessionId();
      submittedRef.current = false;
      startedRef.current = false;
      trackEvent("form_view", { form_id: "consultation_form" });
    }
  }, [isOpen]);

  const markStarted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("form_start", { form_id: "consultation_form" });
  };

  const persistDraft = useCallback(async () => {
    if (submittedRef.current) return;
    const sid = sessionIdRef.current;
    const current = formRef.current;
    if (!sid || !hasMeaningfulData(current)) return;
    try {
      await saveFormDraft(sid, current, stepRef.current);
    } catch (err) {
      console.error("Draft save failed:", err);
    }
  }, []);

  const scheduleDraftSave = useCallback(() => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      void persistDraft();
    }, 800);
  }, [persistDraft]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    markStarted();
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    scheduleDraftSave();
  };

  const selectClinicType = (label: string) => {
    markStarted();
    setForm((p) => ({ ...p, clinicType: label }));
    scheduleDraftSave();
  };

  const reset = () => {
    setStep(0);
    setForm(emptyForm);
    setStatus("idle");
    setErrorMsg("");
  };

  const handleClose = () => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    if (startedRef.current && !submittedRef.current) {
      trackEvent("form_abandon", {
        form_id: "consultation_form",
        form_step: stepRef.current,
      });
    }
    void persistDraft();
    onClose();
    setTimeout(reset, 300);
  };

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const phoneOk = form.phone.replace(/\D/g, "").length >= 7;
  const canContinue =
    step === 0
      ? !!form.clinicType
      : form.name.trim().length >= 2 && phoneOk && emailOk;

  const handleSubmit = async () => {
    if (!form.name.trim() || !phoneOk || !emailOk) {
      setErrorMsg("Please enter your name, phone number, and a valid email address.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    submittedRef.current = true;
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);

    try {
      await submitCompleteLead(form, sessionIdRef.current);
      setStatus("success");
      trackFormSubmit("consultation_form", {
        service: form.clinicType,
        lead_source: "consultation_form",
      });
      trackEvent("form_submit", {
        form_id: "consultation_form",
        clinic_type: form.clinicType,
      });
      trackEvent("generate_lead", {
        lead_source: "consultation_form",
        clinic_type: form.clinicType,
      });
    } catch (err) {
      console.error("Lead save failed:", err);
      submittedRef.current = false;
      setErrorMsg("Something went wrong. Please try again or email Sales@alliancetechltd.com");
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-lg pointer-events-auto rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: "#0A1628", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div
                className="h-1"
                style={{ background: "linear-gradient(90deg, #0066FF, #00D4FF, #7B61FF)" }}
              />

              <div className="flex items-start justify-between px-6 pt-6 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Get Your Free Clinic Audit</h2>
                  <p className="text-sm text-white/60 mt-1">
                    Takes 60 seconds — we&apos;ll get back to you within 2 hours
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {status !== "success" && (
                <div className="flex items-center gap-2 px-6 pb-5">
                  {steps.map((label, i) => (
                    <div key={label} className="flex items-center flex-1 last:flex-none">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors"
                          style={{
                            background: i <= step ? "linear-gradient(135deg, #0066FF, #00D4FF)" : "rgba(255,255,255,0.08)",
                            color: i <= step ? "white" : "rgba(255,255,255,0.4)",
                          }}
                        >
                          {i < step ? "✓" : i + 1}
                        </div>
                        <span
                          className="text-xs font-medium hidden sm:inline"
                          style={{ color: i <= step ? "white" : "rgba(255,255,255,0.35)" }}
                        >
                          {label}
                        </span>
                      </div>
                      {i < steps.length - 1 && (
                        <div
                          className="h-px flex-1 mx-2"
                          style={{ background: i < step ? "#00D4FF" : "rgba(255,255,255,0.08)" }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-6 pb-8 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Request Received!</h3>
                  <p className="text-white/60 text-sm mb-6">
                    Thanks — our team has your details and will reply within 2 hours. Check your phone or email.
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 rounded-full text-sm font-semibold text-white w-full"
                    style={{ background: "linear-gradient(135deg, #0066FF, #00D4FF)" }}
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                <div className="px-6 pb-6">
                  <AnimatePresence mode="wait">
                    {step === 0 && (
                      <motion.div
                        key="step0"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-2 gap-3"
                      >
                        {clinicTypes.map(({ label, icon: Icon }) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => selectClinicType(label)}
                            className="flex flex-col items-start gap-2 p-4 rounded-xl text-left transition-all"
                            style={{
                              background: form.clinicType === label ? "rgba(0,102,255,0.15)" : "rgba(255,255,255,0.05)",
                              border: form.clinicType === label ? "1px solid #0066FF" : "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            <Icon
                              className="w-5 h-5"
                              style={{ color: form.clinicType === label ? "#00D4FF" : "rgba(255,255,255,0.4)" }}
                            />
                            <span
                              className="text-sm font-semibold"
                              style={{ color: form.clinicType === label ? "white" : "rgba(255,255,255,0.7)" }}
                            >
                              {label}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}

                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                      >
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                          <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="Your name"
                            className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-brand-blue transition-colors"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                          />
                        </div>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                          <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            required
                            placeholder="Phone number"
                            className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-brand-blue transition-colors"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                          />
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                          <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="Email address"
                            className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-brand-blue transition-colors"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                          />
                        </div>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                          <input
                            name="clinicName"
                            value={form.clinicName}
                            onChange={handleChange}
                            placeholder="Clinic / business name (optional)"
                            className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-brand-blue transition-colors"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                          />
                        </div>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-white/60" />
                          <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            rows={2}
                            placeholder="What's your biggest challenge? (optional)"
                            className="w-full pl-9 pr-3 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none resize-none"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                          />
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                      >
                        {[
                          ["Service", form.clinicType],
                          ["Name", form.name],
                          ["Phone", form.phone],
                          ["Email", form.email || "—"],
                          ["Clinic", form.clinicName || "—"],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="flex items-center justify-between py-2.5 px-3 rounded-lg"
                            style={{ background: "rgba(255,255,255,0.04)" }}
                          >
                            <span className="text-xs text-white/60">{label}</span>
                            <span className="text-sm text-white font-medium text-right">{value}</span>
                          </div>
                        ))}
                        <p className="text-xs text-white/60 pt-1">
                          On confirm, we&apos;ll save your details and our team will reach out within 2 hours.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {status === "error" && (
                    <p className="text-red-400 text-xs text-center mt-3">{errorMsg}</p>
                  )}

                  <div className="flex items-center gap-3 mt-5">
                    {step > 0 && (
                      <button
                        type="button"
                        onClick={() => setStep((s) => s - 1)}
                        className="flex items-center justify-center gap-1 px-4 py-3 rounded-full text-sm font-semibold text-white/60 hover:text-white transition-colors"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                    )}
                    {step < 2 ? (
                      <button
                        type="button"
                        disabled={!canContinue}
                        onClick={() => {
                          setStep((s) => s + 1);
                          scheduleDraftSave();
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                        style={{ background: "linear-gradient(135deg, #0066FF, #00D4FF)" }}
                      >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={status === "loading"}
                        onClick={handleSubmit}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ background: "linear-gradient(135deg, #0066FF, #00D4FF)" }}
                      >
                        {status === "loading" ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Confirm & Submit →"
                        )}
                      </button>
                    )}
                  </div>

                  <p className="text-center text-xs text-white/60 mt-4">
                    🔒 Your info is private. No spam, ever.
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
