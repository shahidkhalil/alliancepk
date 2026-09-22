"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import FinalCTA from "@/components/FinalCTA";
import {
  caseStudies,
  type AdPlatform,
  type CaseStudy,
  type ProjectType,
} from "@/lib/caseStudies";

const filters: ("All" | ProjectType)[] = [
  "All",
  "Website",
  "AI Automation",
  "SEO",
  "App",
  "Marketing",
];

const platformTabs: {
  id: AdPlatform;
  label: string;
  logo: string;
  invertWhenActive?: boolean;
}[] = [
  { id: "Meta", label: "Meta / Facebook", logo: "/brands/meta.png", invertWhenActive: true },
  { id: "Google", label: "Google Ads", logo: "/brands/google.png" },
];

const categoryMeta: Record<ProjectType, { title: string; subtitle: string }> = {
  Website: {
    title: "Websites",
    subtitle: "Clinic and business sites designed to convert visitors into bookings.",
  },
  "AI Automation": {
    title: "AI Automation",
    subtitle: "Products that answer patients, audit sites, and book appointments automatically.",
  },
  SEO: {
    title: "SEO & Local Search",
    subtitle: "Organic growth and local visibility that turns search into inquiries.",
  },
  App: {
    title: "Mobile Apps",
    subtitle: "Health and product apps with clean UI and practical everyday features.",
  },
  Marketing: {
    title: "Digital Marketing",
    subtitle: "Meta and Google campaigns that deliver leads, installs, and revenue.",
  },
};

const categoryOrder: ProjectType[] = [
  "Website",
  "AI Automation",
  "SEO",
  "App",
  "Marketing",
];

function filterToHash(f: "All" | ProjectType): string {
  switch (f) {
    case "Website":
      return "websites";
    case "AI Automation":
      return "ai";
    case "SEO":
      return "seo";
    case "App":
      return "app";
    case "Marketing":
      return "marketing";
    default:
      return "";
  }
}

function hashToFilter(hash: string): "All" | ProjectType | null {
  const h = hash.replace(/^#/, "").toLowerCase();
  if (h === "websites" || h === "website") return "Website";
  if (h === "ai" || h === "ai-automation") return "AI Automation";
  if (h === "seo" || h === "local-seo") return "SEO";
  if (h === "app" || h === "apps") return "App";
  if (h === "marketing" || h === "ads" || h === "digital-marketing") return "Marketing";
  if (h === "all" || h === "") return "All";
  return null;
}

function setCategoryUrl(f: "All" | ProjectType) {
  const hash = filterToHash(f);
  const next = hash
    ? `${window.location.pathname}${window.location.search}#${hash}`
    : `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", next);
}

function CaseStudyCard({ c }: { c: CaseStudy }) {
  const thumb = c.thumbImage || c.afterImage || c.beforeImage;
  const isApp = c.type === "App";
  const isSeo = c.type === "SEO";
  const isMarketing = c.type === "Marketing";

  return (
    <Link
      href={`/case-study/${c.slug}`}
      className="group text-left rounded-2xl overflow-hidden border border-transparent bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 block"
      style={{ borderColor: isSeo || isMarketing ? "rgba(0,40,60,0.12)" : undefined }}
    >
      {isApp ? (
        <div className="flex flex-col h-full">
          <div
            className="relative h-40 sm:h-44 overflow-hidden flex items-center justify-center gap-4 px-4"
            style={{
              background: `linear-gradient(145deg, #F8FAFC 0%, ${c.accent}18 100%)`,
            }}
          >
            {c.logo && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-md p-2 flex-shrink-0 ring-1 ring-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.logo} alt={c.client} className="w-full h-full object-contain" />
              </div>
            )}
            {thumb && (
              <div className="w-[52px] sm:w-[60px] rounded-[0.85rem] overflow-hidden border-2 border-[#1a1a2e] bg-[#1a1a2e] shadow-lg flex-shrink-0 group-hover:scale-[1.03] transition-transform duration-500">
                <div className="h-2 bg-[#1a1a2e] flex items-center justify-center">
                  <span className="w-5 h-0.5 rounded-full bg-white/25" />
                </div>
                <div className="bg-white aspect-[9/19.5] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb} alt="" className="w-full h-full object-cover object-top" />
                </div>
              </div>
            )}
            <span
              className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 shadow-sm"
              style={{ color: c.accent }}
            >
              App
            </span>
          </div>
          <div className="p-4 flex flex-col gap-2 flex-1">
            <h3 className="text-base font-bold text-[#00283C] leading-snug group-hover:text-[#0077A8] transition-colors">
              {c.client}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">{c.category}</p>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">{c.tagline}</p>
            <p className="text-[11px] font-semibold text-slate-600 pt-2 border-t border-slate-100">
              {c.metrics.map((m) => `${m.value} ${m.label}`).join(" · ")}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0077A8]">
              View case study <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      ) : isSeo ? (
        <div
          className="relative aspect-[16/10] overflow-hidden px-6 py-5 flex flex-col justify-between text-left"
          style={{
            background: `linear-gradient(145deg, #001e2e 0%, #00283C 48%, ${c.accent}33 160%)`,
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            className="pointer-events-none absolute -right-8 -top-10 w-40 h-40 rounded-full blur-3xl opacity-40"
            style={{ background: c.accent }}
          />
          <div className="relative z-[1] flex items-start justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
              SEO Case Study
            </span>
            {c.duration && (
              <span className="text-[10px] font-semibold text-white/80 bg-white/10 border border-white/15 px-2 py-0.5 rounded-full whitespace-nowrap">
                {c.duration}
              </span>
            )}
          </div>
          <div className="relative z-[1] mt-auto">
            {c.metrics[0] && (
              <div className="mb-3">
                <p
                  className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none"
                  style={{ color: c.accent }}
                >
                  {c.metrics[0].value}
                </p>
                <p className="text-[11px] text-white/50 mt-1.5 tracking-wide">
                  {c.metrics[0].label}
                </p>
              </div>
            )}
            <p className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              {c.client}
            </p>
            {c.industry && (
              <p className="text-[11px] text-white/45 mt-1 truncate">{c.industry}</p>
            )}
          </div>
        </div>
      ) : isMarketing ? (
        <div className="flex flex-col h-full">
          <div className="relative h-36 sm:h-40 bg-slate-100 overflow-hidden">
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumb}
                alt=""
                className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full" style={{ background: `${c.accent}22` }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            <div className="absolute left-3 bottom-3 flex items-end gap-2.5">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-md ring-2 ring-white/90">
                {c.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.logo} alt={c.client} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white font-extrabold text-sm"
                    style={{ background: c.accent }}
                  >
                    {c.client.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            {c.platform && (
              <div className="absolute right-3 top-3 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    c.platform === "Google" ? "/brands/google.png" : "/brands/meta.png"
                  }
                  alt={c.platform ?? "Meta"}
                  className="h-5 w-auto max-w-[4.5rem] object-contain"
                />              </div>
            )}
          </div>
          <div className="p-4 flex flex-col gap-2.5 flex-1">
            <span
              className="self-start text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: `${c.accent}1A`, color: c.accent }}
            >
              {c.category.split("—")[0].trim()}
            </span>
            <h3 className="text-base font-bold text-[#00283C] leading-snug group-hover:text-[#0077A8] transition-colors">
              {c.client}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">
              {c.tagline}
            </p>
            <p className="text-[11px] font-semibold text-slate-600 pt-2 border-t border-slate-100">
              {c.metrics.map((m) => `${m.label}: ${m.value}`).join(" · ")}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0077A8]">
              Read case study <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      ) : thumb ? (
        <>
          <div className="aspect-[16/9] overflow-hidden bg-[#F0F7FA] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb}
              alt={c.client}
              className={`w-full h-full ${
                c.thumbImage || c.heroWide ? "object-contain" : "object-cover object-top"
              }`}
            />
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: c.accent }} />
              <p className="text-sm font-bold text-[#00283C] group-hover:text-[#0077A8] transition-colors">
                {c.client}
              </p>
            </div>
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5"
              style={{ background: `${c.accent}1A`, color: c.accent }}
            >
              {c.type}
            </span>
            <p className="text-xs text-gray-400 leading-snug">{c.category}</p>
            <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-[#0077A8]">
              View case study <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </>
      ) : (
        <>
          <div
            className="aspect-[16/9] flex items-center justify-center px-6"
            style={{ background: `linear-gradient(135deg, #00283C 0%, ${c.accent} 100%)` }}
          >
            <p className="text-white font-extrabold text-lg text-center leading-snug">{c.client}</p>
          </div>
          <div className="p-4">
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5"
              style={{ background: `${c.accent}1A`, color: c.accent }}
            >
              {c.type}
            </span>
            <p className="text-xs text-gray-400 leading-snug">{c.category}</p>
          </div>
        </>
      )}
    </Link>
  );
}

export default function Portfolio() {
  const [filter, setFilter] = useState<"All" | ProjectType>("All");
  const [platform, setPlatform] = useState<AdPlatform>("Meta");

  const filtered = (() => {
    const byType =
      filter === "All" ? caseStudies : caseStudies.filter((c) => c.type === filter);
    if (filter !== "Marketing") return byType;
    return byType.filter((c) => c.platform === platform);
  })();

  const handleFilter = (f: "All" | ProjectType) => {
    setFilter(f);
    if (f === "Marketing") setPlatform("Meta");
    setCategoryUrl(f);
  };

  useEffect(() => {
    const applyHash = (scroll = true) => {
      const next = hashToFilter(window.location.hash);
      if (!next) return;
      setFilter(next);
      if (next === "Marketing") setPlatform("Meta");
      if (scroll && next !== "All") {
        requestAnimationFrame(() => {
          document.getElementById("case-studies")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    };
    applyHash(true);
    const onHashChange = () => applyHash(true);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <PageWrapper>
      <ServicePageHero
        badge="OUR WORK"
        headline="Real Builds."
        highlight="Real Results."
        subheadline="A look at the websites, apps, AI systems, SEO, and marketing campaigns we've delivered — and the impact they've made."
        ctaText="Start Your Project"
      />

      <section id="case-studies" className="py-16 lg:py-20 bg-[#F8FAFC] scroll-mt-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => handleFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${
                  filter === f
                    ? "bg-[#00283C] border-[#00283C] text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-[#00B4D8] hover:text-[#0077A8]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {filter === "Marketing" && (
            <div className="mb-8">
              <h3 className="text-center text-sm font-bold text-[#00283C] mb-4">Campaigns by platform</h3>
              <div className="flex flex-wrap items-end justify-center gap-2 sm:gap-3 border-b border-slate-200 pb-0">
                {platformTabs.map((tab) => {
                  const active = platform === tab.id;
                  const count = caseStudies.filter(
                    (c) => c.type === "Marketing" && c.platform === tab.id
                  ).length;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPlatform(tab.id)}
                      aria-label={tab.label}
                      aria-pressed={active}
                      className={`px-4 sm:px-5 py-2.5 rounded-t-xl text-sm font-medium flex items-center justify-center gap-2 transition border-b-2 -mb-px ${
                        active
                          ? "bg-[#00283C] text-white border-[#00283C]"
                          : "bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={tab.logo}
                        alt=""
                        className={`h-7 w-auto max-w-[5.5rem] object-contain ${
                          active && tab.invertWhenActive ? "brightness-0 invert" : ""
                        }`}
                      />
                      <span className="sr-only">{tab.label}</span>
                      <span
                        className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full ${
                          active ? "bg-white/15 text-white" : "bg-white text-slate-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filter === "All" ? (
            <div className="space-y-14">
              {categoryOrder.map((type) => {
                const items = caseStudies.filter((c) => c.type === type);
                if (!items.length) return null;
                const meta = categoryMeta[type];
                return (
                  <div key={type} id={filterToHash(type)} className="scroll-mt-28">
                    <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-slate-200 pb-4">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-[#00283C] tracking-tight">
                          {meta.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-xl">{meta.subtitle}</p>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {items.length} {items.length === 1 ? "project" : "projects"}
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((c) => (
                        <CaseStudyCard key={c.slug} c={c} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#00283C] tracking-tight">
                    {categoryMeta[filter].title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-xl">
                    {filter === "Marketing"
                      ? `${platform} campaigns — tap a card for the full case study`
                      : categoryMeta[filter].subtitle}
                  </p>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {filtered.length} {filtered.length === 1 ? "project" : "projects"}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((c) => (
                  <CaseStudyCard key={c.slug} c={c} />
                ))}
              </div>

              {filter === "Marketing" && filtered.length === 0 && (
                <p className="text-center text-sm text-slate-500 py-10">
                  No campaigns in this platform yet.
                </p>
              )}
            </>
          )}
        </div>
      </section>

      <FinalCTA />
    </PageWrapper>
  );
}
