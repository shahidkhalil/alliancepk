"use client";
import { Sparkles, Gauge, Search, Users, Wallet, MapPin, ChevronDown, Target, UserRound, AlertTriangle, TrendingUp, Award } from "lucide-react";
import { useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import AuditChat, { BotAvatar } from "@/components/AuditChat";
import { FeatureCardGrid } from "@/components/ui/Card";

const checks = [
  { icon: Gauge, title: "Website Speed Test", desc: "Real Google PageSpeed (Lighthouse) data for your mobile load time and Core Web Vitals — the same metrics Google uses to rank you. Slow sites lose over half their visitors before the page even appears." },
  { icon: Search, title: "On-Page SEO Audit", desc: "Title tags, meta descriptions, headings, structured data, and indexability — the on-page factors that decide whether patients in Houston and across Texas can find your clinic on Google." },
  { icon: Users, title: "Patient Experience Check", desc: "Our AI walks through your site like a real patient booking on a phone: is there a WhatsApp button, tap-to-call, online booking, a visible location map? Every missing step costs appointments." },
  { icon: UserRound, title: "Mystery Patient Walkthrough", desc: "The AI tries to book an appointment on your site exactly like a Houston patient would — and reports every point of friction it hits along the way." },
  { icon: Wallet, title: "Revenue Impact Estimate", desc: "Every issue is translated into what actually matters — lost patients and lost revenue per month — so you know which fix pays for itself first." },
  { icon: Sparkles, title: "Competitor Benchmark", desc: "We check the real Google results patients see (e.g. \"dentist in Houston\") and show the exact clinics ranking above you — plus what their websites have that yours doesn't." },
  { icon: Target, title: "Treatment Money Map", desc: "A rank-by-rank breakdown of where you stand for your highest-value treatments — implants, braces, veneers, whitening — against every Houston competitor chasing the same patients." },
  { icon: MapPin, title: "Google Business Profile Check", desc: "Your Google Maps listing vs. the local map-pack winners: rating, review count, review pace, photos, and listed hours — the factors that decide who gets the call." },
  { icon: AlertTriangle, title: "Critical Issues, Ranked", desc: "Every problem is ranked by how much it's costing you, with a plain-English fix attached — not a generic checklist." },
  { icon: TrendingUp, title: "Improvement Recommendations", desc: "Beyond the critical fixes, we flag the secondary improvements worth making once the big leaks are patched." },
  { icon: Award, title: "What You're Already Doing Well", desc: "The audit also calls out what's already working, so you know what not to touch when you redesign." },
];

const steps = [
  { n: "1", title: "Paste your website + city", desc: "Enter your clinic URL, then confirm specialty and city so rankings aren't guessed." },
  { n: "2", title: "AI runs a real audit (≈1–2 min)", desc: "We pull live Google PageSpeed data, scan your pages and Google Business listing, and check real search rankings." },
  { n: "3", title: "Get your report & fixes", desc: "A plain-English report grounded in measured evidence: score, biggest problems, who's ranking for your searches, and what to fix first." },
];

const faqs = [
  { q: "Is the website audit really free?", a: "Yes — completely free, no signup and no credit card. Paste your link in the chat and you get your score and top issue immediately. The full report (competitor benchmark, treatment rankings, Google Business comparison) unlocks with just your name and WhatsApp number so we can send it to you." },
  { q: "What does the AI website audit check?", a: "Six things: website speed (real Google PageSpeed data), on-page SEO, patient booking experience (WhatsApp, tap-to-call, online booking), estimated revenue impact, your Google ranking vs. local competitors, and your Google Business Profile compared to the map-pack winners." },
  { q: "Is the audit accurate, or generic advice?", a: "Every finding is backed by real measured data — Google Lighthouse scores, your actual HTML, live Google search results, and your real Google Business listing. Our system is built to never report an issue the data can't prove: if we couldn't verify something, we say so instead of guessing." },
  { q: "Who is this audit for?", a: "It's built for healthcare practices in Houston and across Texas — dental clinics, aesthetic clinics, dermatologists, and other doctors — but it works for any business website. The competitor and treatment analysis is tuned for Houston-area searches and clinics in the surrounding suburbs like Sugar Land, Katy, and The Woodlands." },
  { q: "How is this different from Google PageSpeed or other free checkers?", a: "Those tools give you a technical score and jargon. Ours translates the same data into patients and dollars, names the actual competitors outranking you, maps your rankings for high-value treatments like implants and braces, and compares your Google Business Profile against local rivals — then tells you what to fix first." },
  { q: "What happens after the audit?", a: "You get the full report right in the chat. If you want the problems fixed, you can book a free strategy call with our team — we build websites, run local SEO, and set up WhatsApp booking for clinics in Houston and across Texas. No obligation either way." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl bg-white">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left">
        <span className="font-bold text-[#00283C] text-sm">{q}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function FreeWebsiteAudit() {
  return (
    <PageWrapper>
      <section className="pt-28 pb-8 bg-gradient-to-b from-[#F8FAFC] to-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <span className="badge-light mb-4 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> FREE AI WEBSITE AUDIT
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-3">
            Is Your Houston Clinic Website <span className="gradient-heading">Losing You Patients?</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Chat with our AI auditor, built for Houston and Texas clinics. Real data, plain answers, free.
          </p>
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Chat header */}
            <div className="bg-[#00283C] px-5 py-3.5 flex items-center gap-3">
              <div className="relative">
                <BotAvatar />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#00283C]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Alliance Audit Bot</p>
                <p className="text-[11px] text-white/60">AI website auditor · online</p>
              </div>
            </div>
            <AuditChat heightClass="h-[520px]" />
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Powered by real Google PageSpeed data + evidence-grounded AI. Free score first — typical audit ~1–2 minutes.
          </p>
        </div>
      </section>

      {/* What the audit checks — SEO content */}
      <section className="py-16 bg-[#F8FAFC] border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] tracking-tight mb-3">
              What Our Free AI Website Audit <span className="gradient-heading">Checks</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm">
              Most free website checkers give you a score and jargon. Ours audits your clinic&apos;s website the way a patient — and Google — actually experiences it, then tells you what it&apos;s costing you.
            </p>
          </div>
          <FeatureCardGrid
            items={checks.map(({ icon: Icon, title, desc }) => ({
              icon: (
                <span className="w-10 h-10 rounded-lg bg-[#00283C] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#9FD3E8]" />
                </span>
              ),
              title,
              desc,
            }))}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] tracking-tight text-center mb-10">
            How the Website Audit Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#00283C] text-white font-extrabold flex items-center justify-center mx-auto mb-4">{s.n}</div>
                <h3 className="font-bold text-[#00283C] mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="btn-dark px-7 py-3.5 text-sm inline-block">
              Run My Free Audit Now →
            </a>
          </div>
        </div>
      </section>

      {/* Why clinics need it — keyword-rich copy */}
      <section className="py-16 bg-[#F8FAFC] border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] tracking-tight text-center mb-6">
            Why Every Clinic in Houston & Texas Should Audit Its Website
          </h2>
          <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
            <p>
              Patients in Houston, Sugar Land, Katy, and The Woodlands don&apos;t find their dentist or dermatologist through a signboard anymore — they Google. They search &ldquo;dentist near me&rdquo;, &ldquo;braces price in Houston&rdquo;, or &ldquo;best skin specialist in Houston TX&rdquo;, compare the top results, check reviews, and message the clinic that makes it easiest. If your website loads slowly, isn&apos;t ranking, or has no WhatsApp or online booking, those patients quietly go to the clinic that does.
            </p>
            <p>
              A <strong>website audit</strong> shows you exactly where that leak is. Our free AI audit combines a <strong>website speed test</strong>, an <strong>SEO check</strong>, a <strong>Google Business Profile comparison</strong>, and a <strong>local competitor analysis</strong> into one plain-English report — built specifically for healthcare practices in Houston and across Texas. You&apos;ll see which high-value treatments (implants, braces, veneers, laser treatments) you&apos;re invisible for, which local Houston clinics own those searches today, and the shortest path to winning them back.
            </p>
            <p>
              It takes 30 seconds, uses real measured data, and costs nothing. The clinics beating you in Houston search results have probably already checked theirs.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ + schema */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#00283C] tracking-tight text-center mb-8">
            Free Website Audit — FAQs
          </h2>
          <div className="space-y-3">
            {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
      </section>
    </PageWrapper>
  );
}
