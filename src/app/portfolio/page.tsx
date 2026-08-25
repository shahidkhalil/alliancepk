"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, createContext, useContext } from "react";
import { ArrowUpRight, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import ServicePageHero from "@/components/ServicePageHero";
import FinalCTA from "@/components/FinalCTA";
import { useCardMotion, staggerDelay } from "@/lib/motionVariants";

// Shared lightbox: any gallery image opens a full-screen viewer.
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

function ScreenshotGallery({ images, client, accent }: { images: string[]; client: string; accent: string }) {
  const openLightbox = useContext(LightboxContext);
  return (
    <div className="px-7 lg:px-10 py-8 bg-[#F8FAFC] border-b border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>The Full Build</span>
        <span className="h-px flex-1" style={{ background: "#E2E8F0" }} />
        <span className="text-[11px] text-gray-400">{images.length} screens · tap to enlarge</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((src, i) => (
          <BrowserFrame key={src} src={src} alt={`${client} website screen ${i + 1}`} onClick={() => openLightbox(images, i)} />
        ))}
      </div>
    </div>
  );
}

interface ChatShot {
  src: string;
  caption: string;
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

type ProjectType = "Website" | "AI Automation" | "SEO" | "App";

interface CaseStudy {
  client: string;
  type: ProjectType;
  category: string;
  tagline: string;
  liveUrl?: string;
  liveLabel?: string;
  pdfUrl?: string;
  pdfLabel?: string;
  afterImage?: string;
  afterLabel?: string;
  thumbImage?: string;
  logo?: string;
  heroWide?: boolean;
  beforeImage?: string;
  gallery?: string[];
  chatGallery?: ChatShot[];
  phoneGallery?: ChatShot[];
  featureGallery?: ChatShot[];
  /** SEO structured insight (no PDF screenshots). */
  duration?: string;
  industry?: string;
  objectives?: string[];
  activities?: string[];
  services: string[];
  challenge: string;
  built: string;
  result: string;
  features: string[];
  metrics: { value: string; label: string }[];
  accent: string;
}

const caseStudies: CaseStudy[] = [
  {
    client: "Dr. Syeda Nida Batool",
    type: "Website",
    category: "Clinical Psychologist — Website Redesign & Booking Platform",
    tagline: "A complete rebuild of a clinical psychologist's website — transforming a basic profile page into a credibility-first platform that turns visitors into booked appointments.",
    afterImage: "/case-studies/dr-nida-after.jpg",
    beforeImage: "/case-studies/dr-nida-before.jpg",
    gallery: [
      "/case-studies/dr-nida-1.jpg",
      "/case-studies/dr-nida-2.jpg",
      "/case-studies/dr-nida-3.jpg",
      "/case-studies/dr-nida-4.jpg",
      "/case-studies/dr-nida-5.jpg",
      "/case-studies/dr-nida-6.jpg",
    ],
    services: ["Website Redesign", "Online Booking System", "WhatsApp Integration", "Blog CMS", "SEO Setup"],
    challenge:
      "Dr. Nida is one of America's most credentialed clinical psychologists — PhD, 15+ years of practice, internationally certified in NLP and Timeline Therapy. Her original website, however, was a basic single-page profile: it stated who she was but did little to build trust or drive action. There was no real way to verify her credentials, explore her services, or book a session without picking up the phone. Her online presence didn't match the calibre of her expertise.",
    built:
      "We rebuilt the site from the ground up into a modern, conversion-focused platform. The centerpiece is a smooth multi-step booking flow that lets clients pick a service, choose a date and time, and confirm — with details delivered straight to WhatsApp. We added a self-serve blog dashboard so she can publish articles herself, a verified certifications gallery to build instant trust, and a clean services section covering everything from CBT to corporate coaching.",
    result:
      "The redesign gave Dr. Nida a website that finally matches her reputation. Where the old site simply introduced her, the new one does the selling — visitors can verify her qualifications, read her writing, and book a session in under a minute without a single phone call. It positions her exactly where her expertise belongs: as a premier, internationally certified practitioner.",
    features: [
      "Multi-step appointment booking (service → date & time → confirm)",
      "Bookings delivered instantly to WhatsApp",
      "Self-managed blog with Firebase-powered dashboard",
      "Verified certifications & credentials gallery",
      "Trust-building hero with live credential badges",
      "Fully responsive, fast, SEO-ready build",
    ],
    metrics: [
      { value: "1 min", label: "To book a session" },
      { value: "0", label: "Calls needed to book" },
      { value: "100%", label: "Self-managed content" },
    ],
    accent: "#0077A8",
  },
  {
    client: "Dental Tribe",
    type: "Website",
    category: "Dental Clinic (Dr. Shahab & Associates, Houston) — Website & Booking",
    tagline: "A bold, modern website for a premium Houston dental clinic — built to fill evening appointment slots and turn browsers into booked patients.",
    afterImage: "/case-studies/dental-tribe.jpg",
    gallery: [
      "/case-studies/dental-tribe-1.jpg",
      "/case-studies/dental-tribe-2.jpg",
      "/case-studies/dental-tribe-3.jpg",
      "/case-studies/dental-tribe-4.jpg",
      "/case-studies/dental-tribe-5.jpg",
      "/case-studies/dental-tribe-6.jpg",
    ],
    services: ["Custom Website Design", "Online Booking", "WhatsApp Confirmation", "Services & Blog Pages", "Local SEO"],
    challenge:
      "Dental Tribe offers premium dental care in Houston with dedicated evening hours — but had no digital storefront to match. Patients had no easy way to discover the clinic, understand its treatments, or book a slot online. Evening appointments, their key differentiator, weren't being marketed anywhere prospective patients could actually find and act on them.",
    built:
      "We designed and built a striking, high-end website that positions Dental Tribe as a premium choice. It leads with a bold hero and clear 'Book Evening Slot' and 'Chat on WhatsApp' actions, backed by an online booking flow that confirms straight to WhatsApp. We added a problem-and-solution services section covering everything from everyday concerns to full smile makeovers, plus About and Blog pages — all mobile-first and fast.",
    result:
      "Dental Tribe now has a website that looks the part and does the work. Prospective patients can explore treatments, see live opening hours, and book an evening slot online in seconds — with confirmations landing on WhatsApp. The clinic's premium positioning and its evening-hours edge are finally front and centre where new patients can find them.",
    features: [
      "Bold, premium-feel hero with clear booking CTAs",
      "Online booking with instant WhatsApp confirmation",
      "'Book Evening Slot' flow around their key differentiator",
      "Common Problems & Solutions services section",
      "About, Blog, and Contact pages",
      "Mobile-first, fast-loading, SEO-ready build",
    ],
    metrics: [
      { value: "24/7", label: "Online booking" },
      { value: "Seconds", label: "To book a slot" },
      { value: "Evening", label: "Slots front & centre" },
    ],
    accent: "#12B3C7",
  },
  {
    client: "AI Receptionist",
    type: "AI Automation",
    category: "Product Case Study — 24/7 Voice & Chat Booking Agent",
    tagline:
      "A live AI front desk that answers every call and chat in English, qualifies the patient, and books appointments automatically — so clinics never miss another lead after hours.",
    liveUrl: "/ai-receptionist",
    liveLabel: "Try Live Demo",
    afterImage: "/case-studies/ai-receptionist-main.jpg",
    heroWide: true,
    chatGallery: [
      { src: "/case-studies/ai-receptionist-1.jpg", caption: "Answers treatment & pricing questions instantly, in natural English" },
      { src: "/case-studies/ai-receptionist-2.jpg", caption: "Guides the patient through a quick in-chat booking form" },
      { src: "/case-studies/ai-receptionist-3.jpg", caption: "Confirms the appointment automatically — no staff involved" },
      { src: "/case-studies/ai-receptionist-4.jpg", caption: "Live voice agent picks up and talks the patient through booking" },
      { src: "/case-studies/ai-receptionist-5.jpg", caption: "Supports voice notes for patients who'd rather speak than type" },
    ],
    services: [
      "24/7 Call Answering",
      "Live Chat Booking",
      "Voice Agent",
      "Appointment Confirmations",
      "Clinic Knowledge Training",
    ],
    challenge:
      "Busy dental and aesthetic clinics miss 25–40% of inbound calls during peak hours, lunch, and after closing. Every unanswered ring is a patient who books with the competitor who picked up. Hiring more front-desk staff is expensive, and humans still can't cover nights and weekends without burnout.",
    built:
      "We built an AI receptionist trained on clinic services, prices, hours, and FAQs. It answers phone and website chat simultaneously, speaks natural English, qualifies the patient, checks availability, and books the appointment — then sends confirmations automatically. Clinics can try the live demo on our site: ask about treatments, hours, or book a sample appointment in real time.",
    result:
      "Clinics using the AI receptionist stop losing after-hours and peak-time leads. Patients get instant answers and a booked slot without waiting on hold. The front desk is freed for in-clinic care while the AI handles volume that would otherwise require multiple staff — with zero missed calls as the target outcome.",
    features: [
      "Answers every call and chat at once — no hold music",
      "Books appointments into the clinic calendar automatically",
      "Trained on your services, pricing, and FAQs",
      "Voice notes and live voice agent support",
      "WhatsApp / email confirmations and reminders",
      "Works for dental, aesthetic, and multi-specialty clinics",
    ],
    metrics: [
      { value: "0", label: "Missed calls target" },
      { value: "24/7", label: "Availability" },
      { value: "5s", label: "Typical answer time" },
    ],
    accent: "#7B61FF",
  },
  {
    client: "Free Website Audit",
    type: "AI Automation",
    category: "Product Case Study — AI Clinic Website Analyzer",
    tagline:
      "A free AI tool that scores a clinic's website in under 30 seconds — speed, SEO, patient experience, and competitor gaps — then unlocks a full growth report.",
    liveUrl: "/free-website-audit",
    liveLabel: "Run Free Audit",
    afterImage: "/case-studies/free-website-audit-main.jpg",
    heroWide: true,
    chatGallery: [
      { src: "/case-studies/free-website-audit-1.jpg", caption: "Walks through the site live — speed, SEO, and patient experience checks" },
      { src: "/case-studies/free-website-audit-2.jpg", caption: "Delivers an instant score and estimates the monthly revenue it's costing" },
      { src: "/case-studies/free-website-audit-3.jpg", caption: "Surfaces the exact competitors outranking you on Google" },
      { src: "/case-studies/free-website-audit-4.jpg", caption: "Benchmarks your Google Business Profile against the local map pack" },
      { src: "/case-studies/free-website-audit-5.jpg", caption: "Lists critical issues with a clear, actionable fix for each one" },
    ],
    services: [
      "PageSpeed Analysis",
      "On-Page SEO Check",
      "Patient Experience Score",
      "Competitor Benchmark",
      "Google Business Comparison",
    ],
    challenge:
      "Most clinic owners know their website feels slow or outdated, but they don't know what's actually costing them patients — ranking gaps, missing booking CTAs, weak mobile experience, or competitors outranking them on Google Maps. Hiring an agency for a paid audit creates friction before they've even seen the problem.",
    built:
      "We built a free AI website audit bot that anyone can use: paste a clinic URL and get a real score backed by PageSpeed data, SEO checks, patient-booking friction analysis, and local competitor context. A teaser score appears immediately; the full report unlocks with a quick lead gate so clinics can share results with their team — and so we can follow up with a clear fix plan.",
    result:
      "Clinic owners get an honest, data-backed picture of where their site is leaking patients — without a sales call first. The audit becomes the starting point for website redesigns, local SEO, and booking automation. It's free to run on our site today, and every completed audit surfaces the exact issues that turn searchers into booked appointments.",
    features: [
      "Real Google PageSpeed / performance scoring",
      "On-page SEO and treatment keyword gaps",
      "Patient experience check (booking, call, WhatsApp)",
      "Local competitor and ranking context",
      "Instant score + full report unlock flow",
      "Free to use — no credit card required",
    ],
    metrics: [
      { value: "30s", label: "To first score" },
      { value: "Free", label: "No signup required" },
      { value: "6", label: "Audit dimensions" },
    ],
    accent: "#00B4D8",
  },
  {
    client: "B2B Packaging Brand",
    type: "SEO",
    category: "B2B Packaging — Organic Growth & Lead Gen",
    tagline:
      "A 12-month B2B SEO program that put a wholesale packaging site on page one for 500 high-intent keywords and grew organic traffic by 75%.",
    pdfUrl: "/Alliancetech-SEO-Portfolio.pdf",
    pdfLabel: "Full SEO Portfolio PDF",
    duration: "12 months",
    industry: "B2B Packaging",
    objectives: [
      "Establish a strong online presence for new wholesale products",
      "Rank for industry-specific and solution-based keywords",
      "Drive qualified lead generation through organic search",
    ],
    activities: [
      "Comprehensive industry research for high-intent keywords",
      "Landing pages built around buyer pain points",
      "Funnel-stage content marketing & blog calendar",
      "Ongoing ranking and Search Console tracking",
    ],
    services: [
      "Keyword Research & Strategy",
      "Landing Page SEO",
      "Content Marketing",
      "Technical & On-Page SEO",
      "Lead-Focused Optimization",
    ],
    challenge:
      "A new B2B packaging brand needed a strong online presence for wholesale products. Without rankings for industry-specific and solution-based keywords, organic lead flow stayed limited in a competitive packaging market.",
    built:
      "We ran comprehensive industry research to identify high-intent keywords, built and optimized landing pages around those terms and buyer pain points, and launched a content marketing system — including a funnel-stage blog editorial calendar — to support rankings and authority.",
    result:
      "Within 6 months the site hit first-page rankings for 500 high-intent keywords. Organic traffic rose 75%, and Search Console showed 92.9K clicks and 5.1M impressions over 16 months — driving significant lead volume from organic search.",
    features: [
      "High-intent keyword research for B2B packaging",
      "Landing pages mapped to buyer pain points",
      "Content calendar across awareness → decision stages",
      "Ongoing ranking and traffic performance tracking",
      "Organic lead generation focus (not vanity traffic)",
    ],
    metrics: [
      { value: "500", label: "Page-1 keywords (6 mo)" },
      { value: "+75%", label: "Organic traffic" },
      { value: "92.9K", label: "Clicks (16 months)" },
    ],
    accent: "#0EA5E9",
  },
  {
    client: "Local Beauty Salon",
    type: "SEO",
    category: "Beauty & Personal Care — Local SEO (NYC)",
    tagline:
      "Local SEO that put a beauty salon #1 in the Google Map Pack for its primary neighborhood search within one month.",
    pdfUrl: "/Alliancetech-SEO-Portfolio.pdf",
    pdfLabel: "Full SEO Portfolio PDF",
    duration: "1 month",
    industry: "Beauty & Personal Care",
    objectives: [
      "Build a strong local online presence",
      "Achieve #1 ranking for primary beauty service keywords",
      "Increase organic traffic and booking inquiries",
    ],
    activities: [
      "Local high-intent beauty keyword research",
      "Google Business Profile optimization",
      "Location-specific content and on-page SEO",
      "Local backlink / authority strategy",
    ],
    services: [
      "Local Keyword Research",
      "Google Business Profile",
      "On-Page Local SEO",
      "Location Content",
      "Local Link Building",
    ],
    challenge:
      "A local beauty salon needed a stronger online presence to attract neighborhood customers. Without Map Pack visibility for high-intent beauty searches, booking inquiries stayed harder to win against nearby competitors.",
    built:
      "We researched local high-intent beauty keywords, optimized the Google Business Profile, created location-specific content, strengthened on-page SEO for service terms, and built a local backlink strategy to grow neighborhood authority.",
    result:
      "Within one month the salon ranked #1 for primary beauty service keywords and topped the Google Local Pack for its core local query — boosting organic visibility, traffic, and booking inquiries.",
    features: [
      "Google Business Profile & Maps Pack optimization",
      "Local beauty keyword targeting",
      "Service-page on-page SEO",
      "Location-specific content",
      "Local authority / backlink outreach",
    ],
    metrics: [
      { value: "#1", label: "Map Pack ranking" },
      { value: "1 mo", label: "Time to results" },
      { value: "↑", label: "Booking inquiries" },
    ],
    accent: "#E11D48",
  },
  {
    client: "Custom Packaging Brand",
    type: "SEO",
    category: "B2B Product Launch — Custom Packaging SEO",
    tagline:
      "A 6-month SEO launch that secured first-page rankings for 250 high-intent keywords and grew organic traffic 35%.",
    pdfUrl: "/Alliancetech-SEO-Portfolio.pdf",
    pdfLabel: "Full SEO Portfolio PDF",
    duration: "6 months",
    industry: "B2B Custom Packaging",
    objectives: [
      "Launch strong visibility for new packaging products",
      "Rank for industry and solution-based keywords",
      "Generate B2B leads from organic search",
    ],
    activities: [
      "In-depth industry keyword research",
      "Landing pages for commercial-intent terms",
      "Content marketing supporting product rankings",
      "Ongoing ranking and traffic reporting",
    ],
    services: [
      "Industry Keyword Research",
      "Landing Page Development",
      "Content Marketing",
      "On-Page Optimization",
      "Commercial Intent Targeting",
    ],
    challenge:
      "A custom packaging company needed strong visibility for new products in a competitive market — ranking for industry and solution keywords so organic search could generate qualified B2B leads.",
    built:
      "We built a high-intent keyword list from industry research, developed and optimized landing pages for target terms, and ran content marketing to support rankings for commercial packaging queries across retail and specialty product lines.",
    result:
      "In 6 months the site achieved first-page rankings for 250 high-intent keywords and grew organic traffic by 35%. Domain metrics showed ~9.6K organic visits and 12.2K ranking keywords, with strong positions on commercial terms.",
    features: [
      "Industry + pain-point keyword mapping",
      "Optimized product / landing pages",
      "Content supporting commercial keywords",
      "Ongoing ranking and traffic reporting",
      "Lead generation via organic search",
    ],
    metrics: [
      { value: "250", label: "Page-1 keywords" },
      { value: "+35%", label: "Organic traffic" },
      { value: "9.6K", label: "Monthly organic visits" },
    ],
    accent: "#DC2626",
  },
  {
    client: "Vitamins & Supplements Store",
    type: "SEO",
    category: "Healthcare E-Commerce — Vitamins & Supplements",
    tagline:
      "A 3-month SEO engagement that lifted rankings, grew organic traffic 25%, and doubled revenue for a supplements e-commerce brand.",
    pdfUrl: "/Alliancetech-SEO-Portfolio.pdf",
    pdfLabel: "Full SEO Portfolio PDF",
    duration: "3 months",
    industry: "Healthcare E-Commerce",
    objectives: [
      "Improve rankings for vitamins and medicines",
      "Drive more organic traffic",
      "Increase sales by 100%",
    ],
    activities: [
      "Keyword research for high-volume / lower-competition terms",
      "Product page optimization with patient-friendly content",
      "Schema markup for richer search results",
      "Technical SEO and ranking tracking",
    ],
    services: [
      "Healthcare Keyword Research",
      "Product Page Optimization",
      "Schema Markup",
      "Technical SEO",
      "Conversion-Focused Content",
    ],
    challenge:
      "A vitamins and supplements store needed stronger rankings for product terms, more organic traffic, and a clear path to double sales — competing in a crowded market with weak visibility on high-volume keywords.",
    built:
      "We researched vitamins and medicines keywords, prioritized high-volume / lower-competition opportunities, optimized product and service pages with relevant content, and implemented schema markup to improve search visibility and rich results.",
    result:
      "Rankings improved for 15+ vitamins and medicines keywords, organic traffic rose 25%, and revenue increased 100%. Growth continued to ~29.4K monthly organic visits with 191K clicks and 6.42M impressions over 16 months in key markets.",
    features: [
      "High-volume, low-competition keyword targeting",
      "Product page SEO for vitamins & medicines",
      "Schema markup for richer SERP presence",
      "Traffic and ranking growth tracking",
      "Revenue-aligned SEO priorities",
    ],
    metrics: [
      { value: "+25%", label: "Organic traffic" },
      { value: "+100%", label: "Revenue increase" },
      { value: "29.4K", label: "Monthly organic visits" },
    ],
    accent: "#16A34A",
  },
  {
    client: "Spark",
    type: "App",
    category: "Health & Wellbeing — Mobile App",
    tagline:
      "Spark is a health & wellbeing app built around daily habits, mood tracking, and a community wall — so people can stay consistent and feel supported.",
    afterImage: "/case-studies/spark-1.jpg",
    afterLabel: "Spark App",
    thumbImage: "/case-studies/spark-card.jpg",
    logo: "/case-studies/spark-logo.png",
    phoneGallery: [
      { src: "/case-studies/spark-1.jpg", caption: "Splash — Spark brand & tagline" },
      { src: "/case-studies/spark-2.jpg", caption: "Onboarding tour for health & wellbeing" },
      { src: "/case-studies/spark-3.jpg", caption: "Home — daily updates, habits & mood score" },
      { src: "/case-studies/spark-4.jpg", caption: "Habit & mood tracking dashboard" },
      { src: "/case-studies/spark-5.jpg", caption: "Spark Wall — community mood feed" },
      { src: "/case-studies/spark-6.jpg", caption: "Side menu — profile, habits & resources" },
    ],
    services: [
      "Mobile App UI/UX",
      "Habit Tracking",
      "Mood Insights",
      "Community Feed",
      "Onboarding Flow",
    ],
    challenge:
      "People struggle to stay consistent with health and wellbeing goals when tools feel fragmented — habits in one place, mood in another, and no supportive community to keep momentum.",
    built:
      "We shaped Spark as a single mobile experience: a clear splash and onboarding tour, a home dashboard with daily updates and habit stats, mood scoring with motivational quotes, a Spark Wall community feed, and a side menu for profile, achievements, and resources.",
    result:
      "Spark gives users one place to track habits, check in on mood, and share progress with others — reducing friction and making daily wellbeing habits easier to stick with.",
    features: [
      "Splash branding and guided onboarding tour",
      "Home dashboard with daily updates & habit stats",
      "Mood score and motivational quotes",
      "Spark Wall community feed (posts, likes, comments)",
      "Side navigation for profile, achievements & resources",
      "Bottom nav: Home, Spark Wall, Habits, Mood",
    ],
    metrics: [
      { value: "6", label: "Core app screens" },
      { value: "Habits", label: "Daily tracking" },
      { value: "Mood", label: "Check-ins & wall" },
    ],
    accent: "#7C3AED",
  },
  {
    client: "IngreedyIt",
    type: "App",
    category: "Ingredient & Product Intelligence — Mobile App",
    tagline:
      "IngreedyIt helps people make smarter everyday choices — scan food, cosmetics, cleaning, and pet products, then understand ingredients at their level.",
    afterImage: "/case-studies/smart-eating-phone-1.jpg",
    afterLabel: "IngreedyIt App",
    thumbImage: "/case-studies/smart-eating-card.jpg",
    logo: "/case-studies/ingreedyit-logo.png",
    phoneGallery: [
      { src: "/case-studies/smart-eating-phone-1.jpg", caption: "Home — explore food, cosmetics & more" },
      { src: "/case-studies/smart-eating-phone-2.jpg", caption: "Dashboard — ingredient scores at a glance" },
      { src: "/case-studies/smart-eating-phone-3.jpg", caption: "Alerts — know what to avoid instantly" },
      { src: "/case-studies/smart-eating-phone-4.jpg", caption: "Nutrition — see what’s inside your meal" },
      { src: "/case-studies/smart-eating-phone-5.jpg", caption: "Learn — everything you want to know" },
      { src: "/case-studies/smart-eating-phone-6.jpg", caption: "Settings — personalize your experience" },
      { src: "/case-studies/smart-eating-phone-7.jpg", caption: "Modes — get information at your level" },
    ],
    services: [
      "Mobile App UI/UX",
      "Ingredient Analysis",
      "Nutrition Insights",
      "Personalization",
      "Multi-Category Search",
    ],
    challenge:
      "Shoppers and health-conscious users struggle to understand what’s in food, snacks, self-care, cleaning, and pet products — labels are dense, jargon is confusing, and there’s no simple way to personalize guidance to their preferences or knowledge level.",
    built:
      "We designed a mobile experience around clear category entry points (Food, Snacks, Self Care, Cleaning, Pet Food, Search), ingredient score dashboards, expandable education sections (What Is It, Health Implications, How It’s Made, Nutrition), Simple / Scholar / Scientific reading modes, meal nutrition breakdowns, and preference personalization.",
    result:
      "Users can explore products, see ingredient scores at a glance, dig into health implications, switch complexity modes, and personalize preferences — turning opaque labels into decisions they can act on.",
    features: [
      "Category home for food, snacks, self-care, cleaning & pets",
      "Ingredient score lists and product dashboards",
      "Expandable education: health, manufacturing, nutrition, studies",
      "Simplify / Expand / Question actions on each section",
      "Simple, Scholar & Scientific information modes",
      "Meal nutrition charts and compare / share flows",
      "Personalization: language, preferences, medical, pets & more",
    ],
    metrics: [
      { value: "6", label: "Product categories" },
      { value: "3", label: "Reading modes" },
      { value: "7", label: "Core app screens" },
    ],
    accent: "#0284C7",
  },
  {
    client: "UK Furniture Retailer",
    type: "SEO",
    category: "Home Furniture — Local / Organic SEO (UK)",
    tagline:
      "A 2-month local SEO push that lifted local visibility 40% and boosted inquiries 25% for a UK furniture retailer.",
    pdfUrl: "/Alliancetech-SEO-Portfolio.pdf",
    pdfLabel: "Full SEO Portfolio PDF",
    duration: "2 months",
    industry: "Home Furniture (UK)",
    objectives: [
      "Improve local search visibility",
      "Drive more organic traffic from target areas",
      "Enhance keyword targeting for local services",
    ],
    activities: [
      "Local keyword research with Google Keyword Planner",
      "Prioritized location-specific terms",
      "Google Business Profile optimization",
      "On-page local & commercial keyword improvements",
    ],
    services: [
      "Local Keyword Research",
      "Google Business Profile",
      "On-Page Local SEO",
      "Location Targeting",
      "Commercial Keyword Optimization",
    ],
    challenge:
      "A UK furniture retailer needed stronger local search visibility and more organic traffic for furniture and bedding queries — without clearer location and commercial keyword targeting, inquiries stayed below potential.",
    built:
      "We used Google Keyword Planner for local research, prioritized location-specific terms, optimized the Google Business Profile, and improved on-page SEO with local and commercial keyword targeting across product pages.",
    result:
      "Local search visibility rose 40%, organic traffic from targeted local areas grew 20%, and customer inquiries / service bookings improved 25% — with stronger positions on commercial furniture keywords.",
    features: [
      "Local keyword prioritization",
      "Google Business Profile optimization",
      "On-page local keyword improvements",
      "Commercial product-term targeting",
      "Inquiry and booking growth focus",
    ],
    metrics: [
      { value: "+40%", label: "Local visibility" },
      { value: "+20%", label: "Local organic traffic" },
      { value: "+25%", label: "Inquiries & bookings" },
    ],
    accent: "#0F766E",
  },
];

function CaseStudyDetails({ c }: { c: CaseStudy }) {
  return (
    <div className="px-7 lg:px-10 py-8 lg:py-10">
      <p className="text-lg lg:text-xl font-bold text-[#00283C] leading-snug tracking-tight mb-7">
        {c.tagline}
      </p>

      <div className="flex flex-wrap gap-2 mb-9">
        {c.services.map((s) => (
          <span key={s} className="badge-light text-xs">{s}</span>
        ))}
      </div>

      {/* Hide duplicate metrics strip for SEO — already shown in SeoInsightPanel */}
      {c.type !== "SEO" && (
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
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">What We Built</h3>
          <p className="text-gray-600 leading-relaxed">{c.built}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">The Result</h3>
          <p className="text-gray-600 leading-relaxed">{c.result}</p>
        </div>
      </div>

      <div className="mt-9 pt-7 border-t border-gray-100">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Key Features We Delivered</h3>
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

function CaseStudyBlock({ c, index }: { c: CaseStudy; index: number }) {
  const { entrance, hoverProps } = useCardMotion();
  const showVisual = Boolean(c.beforeImage || c.afterImage) && c.type !== "SEO";

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

      {/* Before / After / App hero visual */}
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

      {c.gallery?.length ? <ScreenshotGallery images={c.gallery} client={c.client} accent={c.accent} /> : null}
      {c.chatGallery?.length ? <ChatWidgetGallery shots={c.chatGallery} client={c.client} accent={c.accent} /> : null}
      {c.phoneGallery?.length ? <PhoneGallery shots={c.phoneGallery} client={c.client} accent={c.accent} /> : null}
      {c.featureGallery?.length ? <FeatureCardGallery shots={c.featureGallery} client={c.client} accent={c.accent} /> : null}

      <CaseStudyDetails c={c} />
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

const filters: ("All" | ProjectType)[] = ["All", "Website", "AI Automation", "SEO", "App"];

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

export default function Portfolio() {
  const [filter, setFilter] = useState<"All" | ProjectType>("All");
  const filtered = filter === "All" ? caseStudies : caseStudies.filter((c) => c.type === filter);
  const [selected, setSelected] = useState(0);
  const active = filtered[selected] ?? filtered[0];
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const openLightbox = (images: string[], index: number) => setLightbox({ images, index });
  const navLightbox = (dir: number) =>
    setLightbox((lb) => (lb ? { ...lb, index: (lb.index + dir + lb.images.length) % lb.images.length } : lb));

  const handleFilter = (f: "All" | ProjectType) => {
    setFilter(f);
    setSelected(0);
    setCategoryUrl(f);
  };

  useEffect(() => {
    const applyHash = (scroll = true) => {
      const next = hashToFilter(window.location.hash);
      if (!next) return;
      setFilter(next);
      setSelected(0);
      if (scroll && next !== "All") {
        requestAnimationFrame(() => {
          document.getElementById("websites")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    };
    applyHash(true);
    const onHashChange = () => applyHash(true);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <LightboxContext.Provider value={openLightbox}>
    <PageWrapper>
      <ServicePageHero
        badge="OUR WORK"
        headline="Real Builds."
        highlight="Real Results."
        subheadline="A look at the websites, apps, AI systems, and SEO campaigns we've delivered — and the impact they've made."
        ctaText="Start Your Project"
      />

      <section id="websites" className="py-16 lg:py-20 bg-[#F8FAFC] scroll-mt-24">
        <div className="max-w-5xl mx-auto px-6">

          {/* Category filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => handleFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${
                  filter === f
                    ? "bg-[#00283C] border-[#00283C] text-white"
                    : "bg-white border-gray-200 text-gray-500 hover:border-[#00283C] hover:text-[#00283C]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Project selector */}
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 text-center">
              Select a project to view the case study
            </p>
            <div className={`grid gap-4 ${filter === "SEO" ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}>
              {filtered.map((c, i) => {
                const isActive = i === selected;
                const thumb = c.thumbImage || c.afterImage || c.beforeImage;
                const isApp = c.type === "App";
                const isSeo = c.type === "SEO";
                return (
                  <button
                    key={c.client}
                    onClick={() => setSelected(i)}
                    className={`text-left rounded-2xl overflow-hidden border transition-all duration-300 ${
                      isActive
                        ? "shadow-[0_12px_40px_-12px_rgba(0,40,60,0.45)] scale-[1.01]"
                        : "border-transparent hover:shadow-lg opacity-90 hover:opacity-100 hover:-translate-y-0.5"
                    }`}
                    style={{
                      borderColor: isActive ? c.accent : isSeo ? "rgba(0,40,60,0.12)" : undefined,
                      background: "white",
                    }}
                  >
                    {isApp ? (
                      <div className="aspect-[16/9] flex flex-col items-center justify-center gap-3 bg-[#F8FAFC] px-6">
                        {c.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.logo}
                            alt={c.client}
                            className="max-h-20 sm:max-h-24 w-auto max-w-[70%] object-contain"
                          />
                        ) : (
                          <p
                            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center"
                            style={{ color: c.accent }}
                          >
                            {c.client}
                          </p>
                        )}
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                          style={{ background: `${c.accent}1A`, color: c.accent }}
                        >
                          App
                        </span>
                      </div>
                    ) : isSeo ? (
                      <div
                        className="relative aspect-[16/10] overflow-hidden px-6 py-5 flex flex-col justify-between text-left"
                        style={{
                          background: `linear-gradient(145deg, #001e2e 0%, #00283C 48%, ${c.accent}33 160%)`,
                        }}
                      >
                        {/* subtle grid / shine */}
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

                        {isActive && (
                          <div
                            className="absolute inset-x-0 bottom-0 h-0.5"
                            style={{ background: c.accent }}
                          />
                        )}
                      </div>
                    ) : thumb ? (
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
                    ) : (
                      <div
                        className="aspect-[16/9] flex items-center justify-center px-6"
                        style={{ background: `linear-gradient(135deg, #00283C 0%, ${c.accent} 100%)` }}
                      >
                        <p className="text-white font-extrabold text-lg text-center leading-snug">{c.client}</p>
                      </div>
                    )}
                    {!isApp && !isSeo && (
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: c.accent }} />
                          <p className="text-sm font-bold text-[#00283C]">{c.client}</p>
                        </div>
                        <span
                          className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5"
                          style={{ background: `${c.accent}1A`, color: c.accent }}
                        >
                          {c.type}
                        </span>
                        <p className="text-xs text-gray-400 leading-snug">{c.category}</p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected case study */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.client}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <CaseStudyBlock c={active} index={selected} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <FinalCTA />
    </PageWrapper>
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
