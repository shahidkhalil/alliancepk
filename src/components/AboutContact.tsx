"use client";

import { useRef, useState } from "react";
import { ArrowRight, ClipboardCheck, Loader2, Phone } from "lucide-react";
import { useForm } from "@/context/FormContext";
import { AnimatedSurface } from "@/components/ui/Card";
import {
  FormFields,
  getFormSessionId,
  submitCompleteLead,
} from "@/lib/formTracking";
import {
  trackEmailClick,
  trackEvent,
  trackFormSubmit,
  trackPhoneClick,
} from "@/lib/analytics";
import {
  BUSINESS_ADDRESS_LINE,
  BUSINESS_ADDRESS_MAPS_HREF,
  SALES_EMAIL,
  SALES_TEL_HREF,
  formatUsPhoneDisplay,
} from "@/lib/siteContact";

const clinicTypes = ["Healthcare Clinic", "Dental Clinic", "Aesthetic / Med Spa"];

const emptyForm: FormFields = {
  name: "",
  phone: "",
  email: "",
  clinicName: "",
  clinicType: "",
  message: "",
};

function ContactQuickForm() {
  const [form, setForm] = useState<FormFields>(emptyForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const startedRef = useRef(false);
  const sessionIdRef = useRef("");

  const phoneOk = form.phone.replace(/\D/g, "").length >= 10;
  const canSubmit =
    form.name.trim().length >= 2 && phoneOk && !!form.clinicType && status !== "loading";

  const markStarted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (!sessionIdRef.current) sessionIdRef.current = getFormSessionId();
    trackEvent("form_start", { form_id: "contact_quick_form" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      if (!sessionIdRef.current) sessionIdRef.current = getFormSessionId();
      await submitCompleteLead(form, sessionIdRef.current, "about_contact");
      setStatus("success");
      trackFormSubmit("contact_quick_form", {
        service: form.clinicType,
        lead_source: "about_contact",
      });
      trackEvent("form_submit", {
        form_id: "contact_quick_form",
        clinic_type: form.clinicType,
      });
      trackEvent("generate_lead", {
        lead_source: "about_contact",
        clinic_type: form.clinicType,
      });
      setForm(emptyForm);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-6 text-center">
        <p className="font-bold text-emerald-800 mb-1">Got it — we&apos;ll call you back</p>
        <p className="text-sm text-emerald-700/80 mb-4">Usually within 2 hours on US business days.</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-sm font-semibold text-[#0077A8] hover:underline"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="light-island space-y-4">
      <div>
        <label htmlFor="about-contact-name" className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
          Your name
        </label>
        <input
          id="about-contact-name"
          name="name"
          value={form.name}
          onChange={(e) => {
            markStarted();
            setForm((p) => ({ ...p, name: e.target.value }));
          }}
          placeholder="Dr. Sarah"
          autoComplete="name"
          className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-[#0077A8] focus:ring-2 focus:ring-[#0077A8]/10"
          required
        />
      </div>

      <div>
        <label htmlFor="about-contact-phone" className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
          Phone
        </label>
        <input
          id="about-contact-phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => {
            markStarted();
            setForm((p) => ({ ...p, phone: e.target.value }));
          }}
          placeholder="(713) 555-0123"
          autoComplete="tel"
          inputMode="tel"
          className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-[#0077A8] focus:ring-2 focus:ring-[#0077A8]/10"
          required
        />
        {form.phone.trim() && !phoneOk && (
          <p className="mt-1.5 text-[11px] text-amber-600">Enter a 10-digit US phone number</p>
        )}
      </div>

      <div>
        <p className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Clinic type
        </p>
        <div className="flex flex-wrap gap-2">
          {clinicTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                markStarted();
                setForm((p) => ({ ...p, clinicType: type }));
              }}
              className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-colors ${
                form.clinicType === type
                  ? "bg-[#00283C] text-white border-[#00283C]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-3.5 rounded-xl bg-[#00283C] text-white text-sm font-bold hover:bg-[#003D5C] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            Request a callback <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
      <p className="text-[11px] text-gray-400 text-center">
        3 fields only · No spam · We call or email you back
      </p>
    </form>
  );
}

export default function AboutContact() {
  const { openForm } = useForm();

  return (
    <section
      id="contact"
      className="scroll-mt-24 border-t border-[#00B4D8]/15 py-16 lg:py-24"
      style={{
        background:
          "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(0,180,216,0.1), transparent 50%), #041820",
      }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00B4D8]/25 bg-[#041820]/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7dd3ea]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]" aria-hidden />
            Contact
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-2 mb-3">
            Talk to us
          </h2>
          <p className="text-[#00283C]/55 max-w-xl mx-auto text-sm sm:text-base">
            Call, book a call, or leave your number. We reply within 2 hours on US business days.
          </p>
        </div>

        <p className="text-sm text-[#00283C]/50 mb-6 text-center sm:text-left">
          <a
            href={BUSINESS_ADDRESS_MAPS_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#00283C] hover:text-[#0077A8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0077A8]/25 rounded transition-colors duration-200 cursor-pointer"
          >
            {BUSINESS_ADDRESS_LINE}
          </a>
        </p>

        <div className="grid sm:grid-cols-3 gap-3 mb-10">
          {SALES_TEL_HREF ? (
            <a
              href={SALES_TEL_HREF}
              onClick={() => trackPhoneClick("about_contact")}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#00283C] text-white font-bold text-sm py-3.5 shadow-[0_8px_20px_rgba(0,40,60,0.18)] hover:bg-[#003D5C] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0077A8]/30 transition-colors duration-200 cursor-pointer"
            >
              <Phone className="w-4 h-4" aria-hidden /> Call {formatUsPhoneDisplay()}
            </a>
          ) : (
            <button
              type="button"
              onClick={openForm}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#00283C] text-white font-bold text-sm py-3.5 shadow-[0_8px_20px_rgba(0,40,60,0.18)] hover:bg-[#003D5C] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0077A8]/30 transition-colors duration-200 cursor-pointer"
            >
              <Phone className="w-4 h-4" aria-hidden /> Request a Call
            </button>
          )}
          <button
            type="button"
            onClick={openForm}
            className="flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition-all duration-200 hover:border-[#00B4D8]/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0077A8]/25"
          >
            Book Strategy Call
          </button>
          <a
            href="/free-website-audit"
            className="flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition-all duration-200 hover:border-[#00B4D8]/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0077A8]/25"
          >
            <ClipboardCheck className="w-4 h-4" aria-hidden /> Free Website Audit
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
          <AnimatedSurface
            accent
            className="p-8 border border-[#E8EEF2] shadow-[0_1px_2px_rgba(0,40,60,0.04),0_12px_32px_rgba(0,40,60,0.06)]"
            delay={0}
          >
            <h3 className="text-xl font-bold text-[#00283C] mb-2">Request a callback</h3>
            <p className="text-sm text-[#00283C]/55 mb-6 leading-relaxed">
              Name, phone, clinic type — we&apos;ll call you within 2 hours (Mon–Fri, US business hours).
            </p>
            <ContactQuickForm />
          </AnimatedSurface>

          <AnimatedSurface
            className="p-8 border border-[#E8EEF2] shadow-[0_1px_2px_rgba(0,40,60,0.04),0_12px_32px_rgba(0,40,60,0.06)] flex flex-col justify-between"
            delay={0.1}
          >
            <div>
              <h3 className="text-xl font-bold text-[#00283C] mb-3">Or start with a free audit</h3>
              <p className="text-[#00283C]/55 text-sm leading-relaxed mb-6">
                See where you&apos;re losing patients — speed, SEO, booking friction — in about 30 seconds.
              </p>
            </div>
            <div className="space-y-3">
              <a
                href="/free-website-audit"
                className="btn-dark w-full py-4 text-base rounded-xl inline-flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
              >
                Run Free Website Audit <ArrowRight className="w-4 h-4" aria-hidden />
              </a>
              <p className="text-center text-xs text-[#00283C]/40">
                Prefer email?{" "}
                <a
                  href={`mailto:${SALES_EMAIL}`}
                  onClick={() => trackEmailClick("about_contact")}
                  className="text-[#0077A8] font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0077A8]/30 rounded cursor-pointer"
                >
                  {SALES_EMAIL}
                </a>
              </p>
            </div>
          </AnimatedSurface>
        </div>
      </div>
    </section>
  );
}
