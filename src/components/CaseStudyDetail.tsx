"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, createContext, useContext } from "react";
import { ArrowUpRight, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useCardMotion, staggerDelay } from "@/lib/motionVariants";
import type { CaseStudy, ChatShot } from "@/lib/caseStudies";

const LightboxContext = createContext<(images: string[], index: number) => void>(() => {});

function BrowserFrame({ src, alt, onClick }: { src: string; alt: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group block w-full text-left rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow"
    >
      {/* Browser chrome bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#EEF2F6] border-b border-gray-200">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
      </div>
      <div className="overflow-hidden bg-white aspect-[16/10]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500" />
      </div>
    </button>
  );
}

function ScreenshotGallery({
  images,
  client,
  accent,
  title = "The Full Build",
}: {
  images: string[];
  client: string;
  accent: string;
  title?: string;
}) {
  const openLightbox = useContext(LightboxContext);
  return (
    <div className="px-7 lg:px-10 py-8 bg-[#F8FAFC] border-b border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>{title}</span>
        <span className="h-px flex-1" style={{ background: "#E2E8F0" }} />
        <span className="text-[11px] text-gray-400">{images.length} screens · tap to enlarge</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((src, i) => (
          <BrowserFrame key={src} src={src} alt={`${client} screen ${i + 1}`} onClick={() => openLightbox(images, i)} />
        ))}
      </div>
    </div>
  );
}

function ChatWidgetFrame({ src, caption, alt, accent, onClick }: { src: string; caption: string; alt: string; accent: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="group flex flex-col text-left">
      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow ring-1 ring-black/[0.02]">
        <div className="overflow-hidden bg-white aspect-[1082/1174]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} loading="lazy" className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500" />
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2.5 px-0.5">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accent }} />
        <p className="text-xs text-gray-500 leading-snug">{caption}</p>
      </div>
    </button>
  );
}

function ChatWidgetGallery({ shots, client, accent }: { shots: ChatShot[]; client: string; accent: string }) {
  const openLightbox = useContext(LightboxContext);
  const images = shots.map((s) => s.src);
  return (
    <div className="px-7 lg:px-10 py-8 bg-[#F8FAFC] border-b border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>The AI Agent In Action</span>
        <span className="h-px flex-1" style={{ background: "#E2E8F0" }} />
        <span className="text-[11px] text-gray-400">{shots.length} screens · tap to enlarge</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {shots.map((s, i) => (
          <ChatWidgetFrame
            key={s.src}
            src={s.src}
            caption={s.caption}
            alt={`${client} — ${s.caption}`}
            accent={accent}
            onClick={() => openLightbox(images, i)}
          />
        ))}
      </div>
    </div>
  );
}

function PhoneFrame({ src, caption, alt, accent, onClick }: { src: string; caption: string; alt: string; accent: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="group flex flex-col items-center text-left w-full">
      <div className="w-full max-w-[108px] sm:max-w-[120px] mx-auto rounded-[1.1rem] overflow-hidden border-2 border-[#1a1a2e] bg-[#1a1a2e] shadow-sm hover:shadow-md transition-shadow">
        <div className="h-2.5 bg-[#1a1a2e] flex items-center justify-center">
          <span className="w-7 h-0.5 rounded-full bg-white/25" />
        </div>
        <div className="overflow-hidden bg-white aspect-[9/19.5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
        <div className="h-2 bg-[#1a1a2e] flex items-center justify-center">
          <span className="w-4 h-0.5 rounded-full bg-white/20" />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2 px-0.5 w-full max-w-[120px] mx-auto">
        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: accent }} />
        <p className="text-[10px] text-gray-500 leading-snug line-clamp-2">{caption}</p>
      </div>
    </button>
  );
}

function PhoneGallery({ shots, client, accent }: { shots: ChatShot[]; client: string; accent: string }) {
  const openLightbox = useContext(LightboxContext);
  const images = shots.map((s) => s.src);
  return (
    <div className="px-7 lg:px-10 py-7 bg-[#F8FAFC] border-b border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>App Screens</span>
        <span className="h-px flex-1" style={{ background: "#E2E8F0" }} />
        <span className="text-[11px] text-gray-400">{shots.length} screens · tap to enlarge</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 justify-items-center">
        {shots.map((s, i) => (
          <PhoneFrame
            key={s.src}
            src={s.src}
            caption={s.caption}
            alt={`${client} — ${s.caption}`}
            accent={accent}
            onClick={() => openLightbox(images, i)}
          />
        ))}
      </div>
    </div>
  );
}

/** Pre-designed feature cards (headline + phone already in the image). */
function FeatureCardGallery({ shots, client, accent }: { shots: ChatShot[]; client: string; accent: string }) {
  const openLightbox = useContext(LightboxContext);
  const images = shots.map((s) => s.src);
  return (
    <div className="px-7 lg:px-10 py-8 bg-[#F8FAFC] border-b border-gray-100">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>App Feature Cards</span>
        <span className="h-px flex-1" style={{ background: "#E2E8F0" }} />
        <span className="text-[11px] text-gray-400">{shots.length} cards · tap to enlarge</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {shots.map((s, i) => (
          <button
            key={s.src}
            onClick={() => openLightbox(images, i)}
            className="group text-left rounded-2xl overflow-hidden border border-gray-200/80 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="overflow-hidden bg-[#E8F4FC] aspect-[472/1024] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt={`${client} — ${s.caption}`}
                loading="lazy"
                className="w-full h-full object-contain group-hover:scale-[1.015] transition-transform duration-500"
              />
            </div>
            <div className="flex items-start gap-2 px-3.5 py-3 border-t border-gray-100 bg-white">
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: accent }}
              />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="text-xs sm:text-sm text-[#00283C] font-medium leading-snug">{s.caption}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CaseStudyDetails({ c }: { c: CaseStudy }) {
  const hasObjectives = Boolean(c.objectives?.length);
  const hasActivities = Boolean(c.activities?.length);
  const isApp = c.type === "App";

  return (
    <div className="px-7 lg:px-10 py-8 lg:py-10">
      {!isApp && (
        <p className="text-lg lg:text-xl font-bold text-[#00283C] leading-snug tracking-tight mb-7">
          {c.tagline}
        </p>
      )}

      {(c.industry || c.duration) && c.type !== "SEO" && (
        <div className="flex flex-wrap gap-2 mb-5">
          {c.industry && (
            <span className="text-[11px] font-semibold text-gray-500 bg-[#F8FAFC] border border-gray-200 px-2.5 py-1 rounded-full">
              {c.industry}
            </span>
          )}
          {c.duration && (
            <span className="text-[11px] font-semibold text-gray-500 bg-[#F8FAFC] border border-gray-200 px-2.5 py-1 rounded-full">
              {c.duration}
            </span>
          )}
        </div>
      )}

      {!isApp && (
        <div className="flex flex-wrap gap-2 mb-9">
          {c.services.map((s) => (
            <span key={s} className="badge-light text-xs">{s}</span>
          ))}
        </div>
      )}

      {/* Hide duplicate metrics for SEO / App — already shown above */}
      {c.type !== "SEO" && !isApp && (
        <div className="grid grid-cols-3 gap-4 mb-9 py-6 border-y border-gray-100">
          {c.metrics.map((m) => (
            <div key={m.label} className="text-center">
              <div className="text-2xl lg:text-3xl font-extrabold" style={{ color: c.accent }}>{m.value}</div>
              <div className="text-[11px] lg:text-xs text-gray-400 leading-tight mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-7">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">The Challenge</h3>
          <p className="text-gray-600 leading-relaxed">{c.challenge}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            {c.type === "Marketing" ? "What We Did" : "What We Built"}
          </h3>
          <p className="text-gray-600 leading-relaxed">{c.built}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">The Result</h3>
          <p className="text-gray-600 leading-relaxed">{c.result}</p>
        </div>
      </div>

      {(hasObjectives || hasActivities) && c.type !== "SEO" && (
        <div className={`mt-9 grid gap-5 ${hasObjectives && hasActivities ? "sm:grid-cols-2" : ""}`}>
          {hasObjectives ? (
            <div className="rounded-xl bg-[#F8FAFC] border border-gray-100 p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Objectives</h3>
              <ul className="space-y-2.5">
                {c.objectives!.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 leading-snug">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.accent }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {hasActivities ? (
            <div className="rounded-xl bg-[#F8FAFC] border border-gray-100 p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Key Activities</h3>
              <ul className="space-y-2.5">
                {c.activities!.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 leading-snug">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: c.accent }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-9 pt-7 border-t border-gray-100">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
          {c.type === "Marketing" ? "Campaign Highlights" : "Key Features We Delivered"}
        </h3>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {c.features.map((f) => (
            <div key={f} className="flex items-start gap-2.5">
              <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: c.accent }}>
                <Check className="w-3 h-3 text-white" />
              </span>
              <span className="text-sm text-gray-600 leading-snug">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SeoInsightPanel({ c }: { c: CaseStudy }) {
  return (
    <div className="bg-[#F8FAFC] px-7 lg:px-10 py-8 border-b border-gray-100">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: c.accent }}>
          SEO Results Snapshot
        </span>
        <span className="h-px flex-1 bg-[#E2E8F0]" />
        {c.industry && (
          <span className="text-[11px] font-semibold text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
            {c.industry}
          </span>
        )}
        {c.duration && (
          <span className="text-[11px] font-semibold text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
            {c.duration}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-7">
        {c.metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl bg-white border border-gray-100 px-3 py-4 sm:px-4 sm:py-5 text-center shadow-sm"
          >
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: c.accent }}>
              {m.value}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400 mt-1.5 leading-snug">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {c.objectives?.length ? (
          <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Objectives</h3>
            <ul className="space-y-2.5">
              {c.objectives.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 leading-snug">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.accent }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {c.activities?.length ? (
          <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Key Activities</h3>
            <ul className="space-y-2.5">
              {c.activities.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 leading-snug">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: c.accent }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Marketing case-study layout inspired by performance-media buyer portfolios:
 * hero dashboard shot → client background → strategy beats → results table → takeaways.
 */
function MarketingCasePanel({ c }: { c: CaseStudy }) {
  const openLightbox = useContext(LightboxContext);
  const bgRows: { label: string; value: string }[] = [
    { label: "Client", value: c.client },
    ...(c.industry ? [{ label: "Industry", value: c.industry }] : []),
    ...(c.market ? [{ label: "Market", value: c.market }] : []),
    ...(c.duration ? [{ label: "Timeline", value: c.duration }] : []),
    { label: "Initial Challenge", value: c.challenge },
  ];

  return (
    <div className="bg-[#F1F5F9]">
      {/* Hero summary + dashboard screenshot */}
      <div className="px-7 lg:px-10 pt-8 pb-6">
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">{c.tagline}</p>
        {c.afterImage && (
          <button
            type="button"
            onClick={() => openLightbox(c.gallery?.length ? c.gallery : [c.afterImage!], 0)}
            className="mt-6 block w-full text-left group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.afterImage}
              alt={c.afterLabel ?? `${c.client} campaign results`}
              className="w-full rounded-xl shadow-md border border-white/80 bg-white object-contain max-h-[480px] group-hover:shadow-lg transition-shadow"
            />
            <span className="mt-2 inline-block text-[11px] text-slate-400">
              {c.afterLabel ?? "Campaign dashboard"} · tap to enlarge
            </span>
          </button>
        )}
      </div>

      {/* Client & Project Background */}
      <section className="mx-7 lg:mx-10 mb-6 rounded-xl bg-white shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-[#00283C] mb-4">Client & Project Background</h3>
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-0 text-sm text-slate-700">
          {bgRows.map((row) => (
            <div
              key={row.label}
              className={`border-b border-slate-100 py-3 ${row.label === "Initial Challenge" ? "md:col-span-2" : ""}`}
            >
              <span className="font-semibold text-[#00283C]">{row.label}:</span>{" "}
              <span className="text-slate-600">{row.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Strategy & Execution */}
      {c.strategies?.length ? (
        <section className="mx-7 lg:mx-10 mb-6 rounded-xl bg-white shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-[#00283C] mb-5">Strategy & Execution</h3>
          <div className="space-y-5">
            {c.strategies.map((s) => (
              <div key={s.title}>
                <h4 className="font-semibold mb-1" style={{ color: c.accent }}>
                  {s.title}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">{s.detail}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* KPI strip */}
      <section className="mx-7 lg:mx-10 mb-6 rounded-xl bg-white shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-[#00283C] mb-4">Results & Performance Metrics</h3>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {c.metrics.map((m) => (
            <div key={m.label} className="rounded-lg bg-[#F8FAFC] border border-slate-100 px-3 py-4 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: c.accent }}>
                {m.value}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 mt-1.5 leading-snug">{m.label}</div>
            </div>
          ))}
        </div>

        {c.resultTable && (
          <div>
            {c.resultTable.title && (
              <h4 className="font-semibold mb-3" style={{ color: c.accent }}>
                {c.resultTable.title}
              </h4>
            )}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm text-center">
                <thead className="bg-slate-100">
                  <tr>
                    {c.resultTable.headers.filter(Boolean).map((h) => (
                      <th key={h} className="p-2.5 text-left font-semibold text-slate-700 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {c.resultTable.rows.map((row, i) => (
                    <tr key={i} className="border-t border-slate-200">
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={`p-2.5 text-slate-600 ${j === 0 ? "text-left font-medium text-slate-800" : ""}`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Conclusion */}
      <section className="mx-7 lg:mx-10 mb-8 rounded-xl bg-white shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-[#00283C] mb-3">Conclusion & Takeaways</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{c.conclusion ?? c.result}</p>
        {c.services.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100">
            {c.services.map((s) => (
              <span
                key={s}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: `${c.accent}14`, color: c.accent }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </section>

      {c.gallery && c.gallery.length > 1 ? (
        <div className="pb-2">
          <ScreenshotGallery
            images={c.gallery}
            client={c.client}
            accent={c.accent}
            title="Campaign Screens"
          />
        </div>
      ) : null}
    </div>
  );
}

function CaseStudyBlock({ c, index }: { c: CaseStudy; index: number }) {
  const { entrance, hoverProps } = useCardMotion();
  const isMarketing = c.type === "Marketing";
  const isApp = c.type === "App";
  const showVisual =
    Boolean(c.beforeImage || c.afterImage) && c.type !== "SEO" && !isMarketing && !isApp;

  return (
    <motion.article
      {...entrance(staggerDelay(index))}
      {...hoverProps(true)}
      className="card-white rounded-2xl overflow-hidden card-motion card-shadow-hover"
    >
      {/* Header band — same for all project types */}
      <div className="bg-[#00283C] px-7 lg:px-10 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            {c.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.logo}
                alt=""
                className="h-12 sm:h-14 w-auto max-w-[7rem] object-contain rounded-xl bg-white/95 p-1.5 flex-shrink-0"
              />
            )}
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">
                Case Study {String(index + 1).padStart(2, "0")}
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">{c.client}</h2>
              <p className="text-sm text-[#9FD3E8] font-medium mt-1">{c.category}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start">
            {c.liveUrl && (
              <a
                href={c.liveUrl}
                target={c.liveUrl.startsWith("http") || c.liveUrl.endsWith(".pdf") ? "_blank" : undefined}
                rel={c.liveUrl.startsWith("http") || c.liveUrl.endsWith(".pdf") ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-[#00283C] bg-white hover:bg-[#9FD3E8] transition-colors whitespace-nowrap"
              >
                {c.liveLabel ?? "View Live"}
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
            {c.pdfUrl && (
              <a
                href={c.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-white border border-white/40 hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                {c.pdfLabel ?? "Download PDF"}
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* SEO: structured results instead of PDF screenshots */}
      {c.type === "SEO" ? <SeoInsightPanel c={c} /> : null}

      {/* Marketing: Abd-style campaign case study */}
      {isMarketing ? <MarketingCasePanel c={c} /> : null}

      {/* App: overview + metrics before screens */}
      {isApp ? (
        <div className="bg-[#F8FAFC] px-7 lg:px-10 py-8 border-b border-gray-100">
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mb-6">
            {c.tagline}
          </p>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            {c.metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl bg-white border border-gray-100 px-3 py-4 sm:px-4 sm:py-5 text-center shadow-sm"
              >
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: c.accent }}>
                  {m.value}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 mt-1.5 leading-snug">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {c.services.map((s) => (
              <span
                key={s}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: `${c.accent}14`, color: c.accent }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Before / After hero visual (websites / AI — not App/SEO/Marketing) */}
      {showVisual && (
        <div className="bg-[#EEF3F6] px-7 lg:px-10 py-8 border-b border-gray-100">
          <div className={`grid gap-5 ${c.beforeImage && c.afterImage ? "md:grid-cols-2" : "grid-cols-1"}`}>
            {c.beforeImage && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Before</span>
                  <span className="h-px flex-1 bg-gray-200" />
                </div>
                <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white aspect-[16/10]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.beforeImage} alt={`${c.client} — previous website`} className="w-full h-full object-cover object-top" />
                </div>
              </div>
            )}
            {c.afterImage && (
              <div className="block">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#0077A8]">
                    {c.beforeImage
                      ? "After — By Alliance Tech"
                      : c.afterLabel ?? "Live Product Demo"}
                  </span>
                  <span className="h-px flex-1 bg-[#9FD3E8]" />
                </div>
                {c.type === "App" ? (
                  <div className="flex justify-center py-2 sm:py-4">
                    <div className="w-[100px] sm:w-[112px] rounded-[1.1rem] overflow-hidden border-2 border-[#1a1a2e] bg-[#1a1a2e] shadow-md">
                      <div className="h-2.5 bg-[#1a1a2e] flex items-center justify-center">
                        <span className="w-7 h-0.5 rounded-full bg-white/25" />
                      </div>
                      <div className="overflow-hidden bg-white aspect-[9/19.5]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.afterImage}
                          alt={`${c.client} — app by Alliance Tech`}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div className="h-2 bg-[#1a1a2e] flex items-center justify-center">
                        <span className="w-4 h-0.5 rounded-full bg-white/20" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-[#F8FAFC] ${
                      c.beforeImage ? "aspect-[16/10]" : c.heroWide ? "" : "flex justify-center p-4 sm:p-6"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.afterImage}
                      alt={`${c.client} — demo by Alliance Tech`}
                      className={
                        c.beforeImage
                          ? "w-full h-full object-cover object-top"
                          : c.heroWide
                          ? "w-full h-auto block"
                          : "w-full max-w-md h-auto rounded-lg shadow-md"
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {!isMarketing && c.gallery?.length ? (
        <ScreenshotGallery
          images={c.gallery}
          client={c.client}
          accent={c.accent}
          title="The Full Build"
        />
      ) : null}
      {c.chatGallery?.length ? <ChatWidgetGallery shots={c.chatGallery} client={c.client} accent={c.accent} /> : null}
      {c.featureGallery?.length ? <FeatureCardGallery shots={c.featureGallery} client={c.client} accent={c.accent} /> : null}

      {!isMarketing ? <CaseStudyDetails c={c} /> : null}

      {/* App screens after the written case study */}
      {c.phoneGallery?.length ? <PhoneGallery shots={c.phoneGallery} client={c.client} accent={c.accent} /> : null}
    </motion.article>
  );
}

function Lightbox({ images, index, onClose, onNav }: { images: string[]; index: number; onClose: () => void; onNav: (dir: number) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose, onNav]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 sm:p-10"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20" aria-label="Close">
        <X className="w-5 h-5" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onNav(-1); }} className="absolute left-3 sm:left-6 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20" aria-label="Previous">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onNav(1); }} className="absolute right-3 sm:right-6 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20" aria-label="Next">
        <ChevronRight className="w-6 h-6" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        key={index}
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        src={images[index]}
        alt={`Screenshot ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
      />
      <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/60 text-xs">{index + 1} / {images.length}</span>
    </motion.div>
  );
}

export default function CaseStudyDetail({ c, index = 0 }: { c: CaseStudy; index?: number }) {
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const openLightbox = (images: string[], index: number) => setLightbox({ images, index });
  const navLightbox = (dir: number) =>
    setLightbox((lb) => (lb ? { ...lb, index: (lb.index + dir + lb.images.length) % lb.images.length } : lb));

  return (
    <LightboxContext.Provider value={openLightbox}>
      <CaseStudyBlock c={c} index={index} />
      <AnimatePresence>
        {lightbox && (
          <Lightbox
            images={lightbox.images}
            index={lightbox.index}
            onClose={() => setLightbox(null)}
            onNav={navLightbox}
          />
        )}
      </AnimatePresence>
    </LightboxContext.Provider>
  );
}
