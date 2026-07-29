"use client";

import { useRef, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardCheck, Loader2, Phone } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
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

const clinicTypes = ["Dental Clinic", "Aesthetic Clinic", "Other Healthcare"];

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
      await submitCompleteLead(form, sessionIdRef.current, "contact_page");
      setStatus("success");
      trackFormSubmit("contact_quick_form", {
        service: form.clinicType,
        lead_source: "contact_page",
      });
      trackEvent("form_submit", {
        form_id: "contact_quick_form",
        clinic_type: form.clinicType,
      });
      trackEvent("generate_lead", {
        lead_source: "contact_page",
        clinic_type: form.clinicType,
      });
    } catch (err) {
      console.error("Contact lead save failed:", err);
      setErrorMsg(`Something went wrong. Email ${SALES_EMAIL} or try again.`);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
        <p className="text-lg font-bold text-[#00283C] mb-1">Got it — we&apos;ll call you soon</p>
        <p className="text-sm text-gray-500 mb-5">
          Expect a phone call or email within 2 hours (Mon–Fri, US business hours). Meanwhile, run a free website audit.
        </p>
        <a
          href="/free-website-audit"
          data-analytics-label="start_website_audit"
          data-analytics-location="contact_success"
          className="inline-flex items-center gap-2 btn-dark px-6 py-3 text-sm"
        >
          Free Website Audit <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
          Your name
        </label>
        <input
          id="contact-name"
          name="name"
          value={form.name}
          onChange={(e) => {
            markStarted();
            setForm((p) => ({ ...p, name: e.target.value }));
          }}
          placeholder="Dr. Sarah"
          autoComplete="name"
          className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-[#0E7C6B] focus:ring-2 focus:ring-[#0E7C6B]/10"
          required
        />
      </div>

      <div>
        <label htmlFor="contact-phone" className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
          Phone
        </label>
        <input
          id="contact-phone"
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
          className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-[#0E7C6B] focus:ring-2 focus:ring-[#0E7C6B]/10"
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

export default function Contact() {
  const { openForm } = useForm();

  return (
    <PageWrapper>
      <ServicePageHero
        badge="CONTACT US"
        headline="Let's Grow Your"
        highlight="Clinic Together"
        subheadline="Call us, book a strategy call, or leave your number — no long forms, no sales pressure."
        ctaText="Get Your Free Clinic Audit"
        ctaHref="/free-website-audit"
      />

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-sm text-gray-500 mb-6">
            <a
              href={BUSINESS_ADDRESS_MAPS_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#00283C] hover:text-[#0077A8] transition-colors"
            >
              {BUSINESS_ADDRESS_LINE}
            </a>
          </p>

          {/* Instant actions — Call + Book first for US buyers */}
          <div className="grid sm:grid-cols-3 gap-3 mb-10">
            {SALES_TEL_HREF ? (
              <a
                href={SALES_TEL_HREF}
                onClick={() => trackPhoneClick("contact_quick")}
                data-analytics-label="phone_click"
                data-analytics-location="contact_quick"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#00283C] text-white font-bold text-sm py-3.5 hover:bg-[#003D5C] transition-colors"
              >
                <Phone className="w-4 h-4" /> Call {formatUsPhoneDisplay()}
              </a>
            ) : (
              <button
                type="button"
                onClick={openForm}
                data-analytics-label="request_callback"
                data-analytics-location="contact_quick"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#00283C] text-white font-bold text-sm py-3.5 hover:bg-[#003D5C] transition-colors"
              >
                <Phone className="w-4 h-4" /> Request a Call
              </button>
            )}
            <button
              type="button"
              onClick={openForm}
              data-analytics-label="book_consultation"
              data-analytics-location="contact_quick"
              className="flex items-center justify-center gap-2 rounded-xl border border-[#00283C]/15 text-[#00283C] font-bold text-sm py-3.5 hover:bg-[#F8FAFC] transition-colors"
            >
              Book Strategy Call
            </button>
            <a
              href="/free-website-audit"
              data-analytics-label="start_website_audit"
              data-analytics-location="contact_quick"
              className="flex items-center justify-center gap-2 rounded-xl border border-[#00283C]/15 text-[#00283C] font-bold text-sm py-3.5 hover:bg-[#F8FAFC] transition-colors"
            >
              <ClipboardCheck className="w-4 h-4" /> Free Website Audit
            </a>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <AnimatedSurface accent className="p-8 border border-gray-100" delay={0}>
              <h2 className="text-xl font-bold text-[#00283C] mb-2">Request a callback</h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Name, phone, clinic type — we&apos;ll call you within 2 hours (Mon–Fri, US business hours).
              </p>
              <ContactQuickForm />
            </AnimatedSurface>

            <AnimatedSurface className="p-8 border border-gray-100 flex flex-col justify-between" delay={0.1}>
              <div>
                <h2 className="text-xl font-bold text-[#00283C] mb-3">Or start with a free audit</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  See where you&apos;re losing patients — speed, SEO, booking friction — in about 30 seconds. Then talk to us if you want it fixed.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Current Google ranking review",
                    "Ad spend & competitor signals",
                    "Missed-call & after-hours gaps",
                    "Clear next steps for more bookings",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full bg-[#E6F4F8] flex items-center justify-center text-xs text-[#0077A8] font-bold flex-shrink-0">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <a
                  href="/free-website-audit"
                  data-analytics-label="start_website_audit"
                  data-analytics-location="contact_panel"
                  className="btn-dark w-full py-4 text-base rounded-lg inline-flex items-center justify-center gap-2"
                >
                  Run Free Website Audit <ArrowRight className="w-4 h-4" />
                </a>
                <p className="text-center text-xs text-gray-400">
                  Prefer email?{" "}
                  <a
                    href={`mailto:${SALES_EMAIL}`}
                    onClick={() => trackEmailClick("contact_panel")}
                    className="text-[#0077A8] font-semibold hover:underline"
                  >
                    {SALES_EMAIL}
                  </a>
                </p>
              </div>
            </AnimatedSurface>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
