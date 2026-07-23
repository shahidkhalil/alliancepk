"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  UserRound,
  Wallet,
  ArrowRight,
  Bot,
} from "lucide-react";
import { useForm } from "@/context/FormContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import {
  trackDemoComplete,
  trackDemoStart,
  trackEvent,
  trackFormSubmit,
} from "@/lib/analytics";

const AUDIT_ENDPOINT =
  process.env.NEXT_PUBLIC_AUDIT_ENDPOINT ||
  "https://asia-south1-alliancepak.cloudfunctions.net/auditWebsite";

interface Issue { title: string; impact: string; fix: string; evidence?: string }
interface MoneyMapRow {
  treatment: string;
  status: "invisible" | "close" | "strong";
  yourRank: number | null;
  leader?: string | null;
  insight: string;
}
interface CompetitorRow {
  position: number;
  title: string;
  domain: string;
  profile?: {
    hasWhatsApp?: boolean;
    hasPhoneLink?: boolean;
    hasBooking?: boolean;
    hasReviews?: boolean;
  };
}
interface CompetitorData {
  searchQuery: string;
  yourGoogleRank: number | null;
  list: CompetitorRow[];
  localMapPack?: { name: string; rating?: number; reviews?: number }[];
  rankDisclaimer?: string | null;
  cityMissing?: boolean;
}
interface GmbListing {
  name: string;
  rating: number | null;
  reviews: number;
  photosCount: number;
  hasHours: boolean;
  hasWebsite: boolean;
  hasPhone: boolean;
  reviewsPerMonth: number | null;
}
interface GmbData {
  found: boolean;
  matchedByDomain?: boolean;
  searchedFor: string;
  you: GmbListing | null;
  rivals: GmbListing[];
}
interface Report {
  overallScore: number;
  verdict: string;
  headline: string;
  mysteryPatient?: string;
  revenueImpact?: string;
  criticalIssues?: Issue[];
  improvements?: Issue[];
  doingWell?: string[];
  competitorComparison?: string;
  moneyMap?: MoneyMapRow[];
  moneyMapVerdict?: string;
  nextStep?: string;
  gmbInsight?: string;
  competitorData?: CompetitorData | null;
  gmbData?: GmbData | null;
  evidence?: Evidence | null;
}

interface Evidence {
  speed?: {
    performance?: number | null;
    seo?: number | null;
    lcp?: string | null;
    cls?: string | null;
    error?: string;
  };
  onPage?: {
    titleLength?: number | null;
    metaDescriptionLength?: number | null;
    h1Count?: number | null;
    isHttps?: boolean;
    hasStructuredData?: boolean;
    isSpa?: boolean;
    pagesScanned?: number;
    error?: string;
  };
  conversion?: {
    note?: string;
    hasPhoneLink?: boolean;
    hasBooking?: boolean;
    hasForm?: boolean;
    hasMap?: boolean;
    hasReviews?: boolean;
    hasWhatsApp?: boolean;
  };
  search?: {
    query?: string;
    yourGoogleRank?: number | null;
    city?: string | null;
    specialty?: string | null;
    disclaimer?: string;
  } | null;
  gmb?: {
    found?: boolean;
    matchedByDomain?: boolean;
    name?: string | null;
    rating?: number | null;
    reviews?: number | null;
  } | null;
}

type Msg =
  | { id: number; from: "bot"; kind: "text"; text: string }
  | { id: number; from: "bot"; kind: "typing" }
  | { id: number; from: "bot"; kind: "score"; report: Report; url: string }
  | { id: number; from: "bot"; kind: "impact"; report: Report }
  | { id: number; from: "bot"; kind: "issues"; report: Report }
  | { id: number; from: "bot"; kind: "improvements"; report: Report }
  | { id: number; from: "bot"; kind: "well"; report: Report }
  | { id: number; from: "bot"; kind: "cta"; report: Report }
  | { id: number; from: "bot"; kind: "competitor"; report: Report }
  | { id: number; from: "bot"; kind: "options" }
  | { id: number; from: "bot"; kind: "teaser"; report: Report }
  | { id: number; from: "bot"; kind: "gate" }
  | { id: number; from: "bot"; kind: "location"; url: string }
  | { id: number; from: "user"; kind: "text"; text: string };

const SPECIALTY_OPTIONS = [
  { value: "dentist", label: "Dentist / Dental" },
  { value: "aesthetic clinic", label: "Aesthetic / Med spa" },
  { value: "dermatologist", label: "Dermatologist" },
  { value: "psychologist", label: "Psychologist" },
  { value: "physiotherapist", label: "Physiotherapist" },
  { value: "eye specialist", label: "Eye specialist" },
  { value: "hair transplant clinic", label: "Hair transplant" },
  { value: "clinic", label: "Other clinic" },
] as const;

const CITY_SUGGESTIONS = [
  "Houston",
  "Dallas",
  "Austin",
  "San Antonio",
  "Sugar Land",
  "Katy",
  "The Woodlands",
  "Los Angeles",
  "Miami",
  "Chicago",
];

/** Basic client-side URL check before spending an audit credit. */
function normalizeAuditUrl(raw: string): string | null {
  let v = raw.trim();
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  try {
    const u = new URL(v);
    if (!/^https?:$/.test(u.protocol)) return null;
    const host = u.hostname.replace(/\.$/, "");
    if (!host.includes(".") || host.length < 4) return null;
    if (/^(localhost|127\.|0\.|10\.|192\.168\.)/i.test(host)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

type MsgInput = Msg extends infer M ? (M extends Msg ? Omit<M, "id"> : never) : never;

function scoreColor(s: number) {
  if (s >= 80) return "#16A34A";
  if (s >= 60) return "#D97706";
  return "#DC2626";
}

let nextId = 1;
const mid = () => nextId++;

export function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-[#00283C] flex items-center justify-center flex-shrink-0">
      <Bot className="w-4 h-4 text-[#9FD3E8]" />
    </div>
  );
}

function Bubble({ children, from }: { children: React.ReactNode; from: "bot" | "user" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-2.5 ${from === "user" ? "justify-end" : "justify-start"}`}
    >
      {from === "bot" && <BotAvatar />}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          from === "user"
            ? "bg-[#00283C] text-white rounded-br-sm"
            : "bg-white border border-gray-100 shadow-sm text-gray-700 rounded-bl-sm"
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <Bubble from="bot">
      <span className="inline-flex gap-1 items-center py-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
          />
        ))}
      </span>
    </Bubble>
  );
}

function EvidencePanel({ evidence }: { evidence?: Evidence | null }) {
  if (!evidence) return null;
  const flag = (on: boolean | undefined, label: string) => (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
        on ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
      }`}
      title={on ? "Detected" : "Not detected on scanned pages"}
    >
      {on ? "✓" : "?"} {label}
    </span>
  );
  const speed = evidence.speed;
  const onPage = evidence.onPage;
  const conv = evidence.conversion;
  return (
    <div className="mt-3 text-left rounded-lg border border-gray-100 bg-[#F8FAFC] p-3 space-y-2">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Measured evidence</p>
      {speed && !speed.error && (
        <p className="text-[11px] text-gray-600">
          Mobile speed: <span className="font-bold text-[#00283C]">{speed.performance ?? "—"}/100</span>
          {speed.lcp ? <> · LCP {speed.lcp}</> : null}
        </p>
      )}
      {speed?.error && (
        <p className="text-[11px] text-amber-700">Speed data unavailable — score ignores load time.</p>
      )}
      {onPage && !onPage.error && (
        <p className="text-[11px] text-gray-600">
          Title {onPage.titleLength ?? "—"} chars · H1s: {onPage.h1Count ?? "—"}
          {onPage.hasStructuredData ? " · Schema ✓" : " · Schema ?"}
          {onPage.pagesScanned ? ` · ${onPage.pagesScanned} page(s) scanned` : null}
        </p>
      )}
      {conv && (
        <div className="flex flex-wrap gap-1">
          {flag(conv.hasPhoneLink, "Tap-to-call")}
          {flag(conv.hasBooking, "Booking")}
          {flag(conv.hasForm, "Form")}
          {flag(conv.hasMap, "Map")}
          {flag(conv.hasReviews, "Reviews")}
          {flag(conv.hasWhatsApp, "WhatsApp")}
        </div>
      )}
      {evidence.search?.query && (
        <p className="text-[11px] text-gray-600">
          Search: “{evidence.search.query}” →{" "}
          {evidence.search.yourGoogleRank != null
            ? `organic #${evidence.search.yourGoogleRank}`
            : "not in top ~10 organic"}
        </p>
      )}
      {evidence.gmb && (
        <p className="text-[11px] text-gray-600">
          Google Business:{" "}
          {evidence.gmb.matchedByDomain
            ? `${evidence.gmb.name || "listing"} · ${evidence.gmb.rating ?? "—"}★ (${evidence.gmb.reviews ?? 0} reviews)`
            : "not confirmed for this website domain"}
        </p>
      )}
      <p className="text-[9px] text-gray-400 leading-snug">
        “?” means not detected on scanned pages — a widget may still exist. Rank is for this exact query only.
      </p>
    </div>
  );
}

function ScoreCard({ report, url }: { report: Report; url: string }) {
  const color = scoreColor(report.overallScore);
  return (
    <div className="text-center py-2">
      <p className="text-[11px] text-gray-400 mb-2 break-all">{url}</p>
      <div
        className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-3"
        style={{ background: `conic-gradient(${color} ${report.overallScore * 3.6}deg, #EEF2F6 0deg)` }}
      >
        <div className="w-20 h-20 rounded-full bg-white flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold" style={{ color }}>{report.overallScore}</span>
          <span className="text-[9px] text-gray-400 uppercase tracking-wide">/ 100</span>
        </div>
      </div>
      <p className="font-extrabold text-[#00283C]">{report.verdict}</p>
      <p className="text-gray-500 text-sm mt-1">{report.headline}</p>
      <EvidencePanel evidence={report.evidence} />
    </div>
  );
}

function LocationPicker({
  url,
  onConfirm,
  disabled,
}: {
  url: string;
  onConfirm: (city: string, specialty: string) => void;
  disabled?: boolean;
}) {
  const [city, setCity] = useState("");
  const [specialty, setSpecialty] = useState("dentist");
  const canGo = city.trim().length >= 2 && !!specialty && !disabled;
  return (
    <div>
      <p className="font-bold text-[#00283C] mb-1">Confirm location for accurate rankings</p>
      <p className="text-gray-500 text-xs mb-3">
        We search Google for clinics near you — wrong city = wrong competitors. Site:{" "}
        <span className="font-semibold text-[#00283C] break-all">{url.replace(/^https?:\/\//, "")}</span>
      </p>
      <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Specialty</label>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {SPECIALTY_OPTIONS.map((s) => (
          <button
            key={s.value}
            type="button"
            disabled={disabled}
            onClick={() => setSpecialty(s.value)}
            className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-colors ${
              specialty === s.value
                ? "bg-[#00283C] text-white border-[#00283C]"
                : "bg-white text-[#00283C] border-gray-200 hover:border-[#0077A8]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">City</label>
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="e.g. Houston, Dallas, Austin"
        disabled={disabled}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-[#00283C] outline-none focus:border-[#0077A8] mb-2"
      />
      <div className="flex flex-wrap gap-1 mb-3">
        {CITY_SUGGESTIONS.map((c) => (
          <button
            key={c}
            type="button"
            disabled={disabled}
            onClick={() => setCity(c)}
            className="text-[10px] px-2 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-100 hover:border-[#0077A8]"
          >
            {c}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={!canGo}
        onClick={() => onConfirm(city.trim(), specialty)}
        className="btn-dark w-full py-2.5 text-sm disabled:opacity-40"
      >
        Run accurate audit →
      </button>
    </div>
  );
}

const LEAD_KEY = "at_audit_lead";

function getSavedLead(): { name: string; phone: string; email?: string } | null {
  try {
    const raw = localStorage.getItem(LEAD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function LeadGate({ onUnlock, onSkip }: { onUnlock: (name: string, phone: string, email: string) => void; onSkip: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);
  const phoneOk = phone.trim() === "" || phone.replace(/\D/g, "").length >= 7;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = name.trim().length >= 2 && phoneOk && emailOk && !saving;
  const markStarted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("form_start", { form_id: "website_audit_gate" });
  };

  if (done) return <p className="text-sm text-green-600 font-semibold">✓ Unlocked — here comes your full report…</p>;

  return (
    <div>
      <p className="font-bold text-[#00283C] mb-1">🔓 Your full report is ready</p>
      <p className="text-gray-500 text-xs mb-3">
        I&apos;ve also found your competitor gap and Treatment Money Map. Tell me where to send the report and I&apos;ll unlock everything right here:
      </p>
      <div className="space-y-2">
        <input
          value={name}
          onChange={(e) => {
            markStarted();
            setName(e.target.value);
          }}
          placeholder="Your name"
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-[#00283C] outline-none focus:border-[#0077A8]"
        />
        <input
          value={email}
          onChange={(e) => {
            markStarted();
            setEmail(e.target.value);
          }}
          placeholder="Email address"
          type="email"
          inputMode="email"
          required
          className={`w-full px-3 py-2.5 rounded-lg border text-sm text-[#00283C] outline-none focus:border-[#0077A8] ${email.trim() === "" || emailOk ? "border-gray-200" : "border-red-300"}`}
        />
        <input
          value={phone}
          onChange={(e) => {
            markStarted();
            setPhone(e.target.value);
          }}
          placeholder="Phone / WhatsApp number (optional)"
          inputMode="tel"
          className={`w-full px-3 py-2.5 rounded-lg border text-sm text-[#00283C] outline-none focus:border-[#0077A8] ${phoneOk ? "border-gray-200" : "border-red-300"}`}
        />
        <button
          disabled={!canSubmit}
          onClick={async () => {
            setSaving(true);
            await onUnlock(name.trim(), phone.trim(), email.trim());
            setDone(true);
            trackFormSubmit("website_audit_gate", { lead_source: "website_audit_gate" });
            trackEvent("form_submit", { form_id: "website_audit_gate" });
            trackEvent("generate_lead", { lead_source: "website_audit_gate" });
          }}
          className="btn-dark w-full py-2.5 text-sm disabled:opacity-40"
        >
          {saving ? "Unlocking…" : "Show My Full Report →"}
        </button>
      </div>
      <button
        onClick={() => {
          trackEvent("form_abandon", { form_id: "website_audit_gate", form_step: "lead_gate" });
          setDone(true);
          onSkip();
        }}
        className="mt-2 text-[11px] text-gray-400 hover:text-gray-600 underline"
      >
        Maybe later — just show me a summary
      </button>
      <p className="mt-2 text-[10px] text-gray-300">🔒 Private. No spam, ever.</p>
    </div>
  );
}

const STATUS_STYLES: Record<MoneyMapRow["status"], { label: string; color: string; bg: string }> = {
  invisible: { label: "INVISIBLE", color: "#DC2626", bg: "#FEF2F2" },
  close: { label: "CLOSE", color: "#D97706", bg: "#FFFBEB" },
  strong: { label: "STRONG", color: "#16A34A", bg: "#F0FDF4" },
};

function CompetitorLeaderboard({ data }: { data: CompetitorData }) {
  const badge = (on: boolean | undefined, label: string) => (
    <span
      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${on ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}
      title={on ? "Detected" : "Not detected"}
    >
      {on ? "✓" : "?"} {label}
    </span>
  );
  return (
    <div>
      <p className="flex items-center gap-1.5 font-bold text-[#00283C] mb-1">
        🏆 Top competitors — &ldquo;{data.searchQuery}&rdquo;
      </p>
      <p className="text-xs text-gray-500 mb-2">
        {data.yourGoogleRank
          ? `You rank #${data.yourGoogleRank} in organic results for this exact query. Ranking above you:`
          : "You're not in the top ~10 organic results for this exact query. Clinics showing instead:"}
      </p>
      <p className="text-[10px] text-gray-400 mb-2 leading-snug">
        {data.rankDisclaimer ||
          "Organic top ~10 only — not map-pack or every Google search patients use."}
      </p>
      <div className="space-y-1.5">
        {data.list.map((c) => (
          <div key={c.domain + c.position} className="rounded-lg border border-gray-100 bg-white p-2.5">
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-[#00283C] text-white text-[11px] font-extrabold flex items-center justify-center flex-shrink-0">
                {c.position}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#00283C] truncate">{c.title}</p>
                <p className="text-[10px] text-gray-400 truncate">{c.domain}</p>
                {c.profile && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {badge(c.profile.hasWhatsApp, "WhatsApp")}
                    {badge(c.profile.hasPhoneLink, "Tap-to-call")}
                    {badge(c.profile.hasBooking, "Booking")}
                    {badge(c.profile.hasReviews, "Reviews")}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {data.localMapPack?.length ? (
        <div className="mt-2">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">📍 Google Maps pack</p>
          {data.localMapPack.map((p) => (
            <p key={p.name} className="text-xs text-gray-600">
              {p.name} {p.rating ? <span className="font-semibold">⭐{p.rating}</span> : null}
              {p.reviews ? <span className="text-gray-400"> ({p.reviews} reviews)</span> : null}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function GmbCard({ data, insight }: { data: GmbData; insight?: string }) {
  if (!data.found || !data.you || !data.matchedByDomain) {
    return (
      <div>
        <p className="flex items-center gap-1.5 font-bold text-[#00283C] mb-1">📍 Google Business Profile</p>
        <p className="text-sm text-gray-600">
          {insight ||
            `We couldn't confirm a Google Business listing whose website matches this domain (searched: "${data.searchedFor}"). Check that your Google listing lists the correct website URL — inventing a rival comparison would be inaccurate.`}
        </p>
      </div>
    );
  }
  const cols: GmbListing[] = [data.you, ...data.rivals.slice(0, 2)];
  const rows: Array<[string, (l: GmbListing) => React.ReactNode]> = [
    ["Rating", (l) => (l.rating ? `⭐${l.rating}` : "—")],
    ["Reviews", (l) => l.reviews ?? "—"],
    ["Review pace", (l) => (l.reviewsPerMonth != null ? `~${l.reviewsPerMonth}/mo` : "—")],
    ["Photos", (l) => (l.photosCount >= 10 ? "10+" : l.photosCount)],
    ["Hours listed", (l) => (l.hasHours ? "✓" : "✗")],
    ["Website link", (l) => (l.hasWebsite ? "✓" : "✗")],
    ["Phone", (l) => (l.hasPhone ? "✓" : "✗")],
  ];
  return (
    <div>
      <p className="flex items-center gap-1.5 font-bold text-[#00283C] mb-1">📍 Google Business Profile — you vs. map pack</p>
      <p className="text-[10px] text-green-700 mb-1">✓ Website domain verified</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-gray-400 font-semibold py-1 pr-2"></th>
              {cols.map((c, i) => (
                <th key={i} className={`text-left font-bold py-1 pr-2 ${i === 0 ? "text-[#0077A8]" : "text-[#00283C]"}`}>
                  {i === 0 ? "You" : c.name.slice(0, 14)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, fn]) => (
              <tr key={label} className="border-t border-gray-100">
                <td className="text-gray-400 py-1 pr-2">{label}</td>
                {cols.map((c, i) => (
                  <td key={i} className={`py-1 pr-2 font-semibold ${i === 0 ? "text-[#0077A8]" : "text-gray-600"}`}>{fn(c)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {insight && <p className="mt-2 text-sm text-gray-600">{insight}</p>}
    </div>
  );
}

function MoneyMapCard({ report }: { report: Report }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 font-bold text-[#00283C] mb-2">💰 Treatment Money Map</p>
      <div className="space-y-2">
        {report.moneyMap!.map((row) => {
          const s = STATUS_STYLES[row.status] || STATUS_STYLES.close;
          return (
            <div key={row.treatment} className="rounded-lg border border-gray-100 p-3" style={{ background: s.bg }}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="font-bold text-[#00283C] text-sm">{row.treatment}</p>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white" style={{ background: s.color }}>
                  {row.yourRank ? `#${row.yourRank} · ${s.label}` : s.label}
                </span>
              </div>
              {row.leader && <p className="text-xs text-gray-500 mb-1">Search owned by: <span className="font-semibold">{row.leader}</span></p>}
              <p className="text-xs text-gray-600">{row.insight}</p>
            </div>
          );
        })}
      </div>
      {report.moneyMapVerdict && (
        <p className="mt-2 text-sm font-semibold text-[#00283C]">📌 {report.moneyMapVerdict}</p>
      )}
    </div>
  );
}

/**
 * The audit chat conversation — embeddable anywhere.
 * `heightClass` controls the message area height (page vs widget).
 */
export default function AuditChat({ heightClass = "h-[520px]" }: { heightClass?: string }) {
  const { openForm } = useForm();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"full" | "competitor">("full");
  const bottomRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const unlockedRef = useRef(false);
  const pendingRef = useRef<{ steps: MsgInput[]; report: Report; url: string } | null>(null);

  useEffect(() => {
    if (getSavedLead()) unlockedRef.current = true;
  }, []);

  const push = useCallback((m: MsgInput) => {
    setMessages((prev) => [...prev, { ...m, id: mid() } as Msg]);
  }, []);

  const replaceTyping = useCallback((m: MsgInput) => {
    setMessages((prev) => {
      const withoutTyping = prev.filter((x) => x.kind !== "typing");
      return [...withoutTyping, { ...m, id: mid() } as Msg];
    });
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const t1 = setTimeout(
      () => push({ from: "bot", kind: "text", text: "👋 Hi! I'm the Alliance Tech audit bot. I check clinic websites for the problems that quietly cost you patients — slow loading, weak Google visibility, and booking friction." }),
      400
    );
    const t2 = setTimeout(
      () => push({ from: "bot", kind: "text", text: "What would you like to do? 👇" }),
      1400
    );
    const t3 = setTimeout(() => push({ from: "bot", kind: "options" }), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      started.current = false;
    };
  }, [push]);

  const chooseOption = (opt: "audit" | "competitor" | "call") => {
    if (busy) return;
    if (opt === "audit") {
      push({ from: "user", kind: "text", text: "🔍 Full website audit" });
      setMode("full");
      setTimeout(() => push({ from: "bot", kind: "text", text: "Great choice! Paste your website address below (e.g. yourclinic.com). Typical audit takes about 1–2 minutes. 👇" }), 400);
    } else if (opt === "competitor") {
      push({ from: "user", kind: "text", text: "🥊 Competitor benchmark" });
      setMode("competitor");
      setTimeout(() => push({ from: "bot", kind: "text", text: "Let's see who's ranking for your local searches. Paste your website address below — then confirm your city so we don't guess wrong. 👇" }), 400);
    } else {
      push({ from: "user", kind: "text", text: "📞 Book a free strategy call" });
      setTimeout(() => {
        push({ from: "bot", kind: "text", text: "Perfect — opening the booking form for you now. Our team will get back to you within 2 hours. 🙌" });
        openForm();
      }, 400);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const runAudit = async (rawUrl: string, city: string, specialty: string) => {
    const auditStartedAt = Date.now();
    trackDemoStart({ demo_type: "website_audit", audit_mode: mode });
    setBusy(true);
    push({ from: "user", kind: "text", text: `${city} · ${specialty}` });
    push({ from: "bot", kind: "typing" });

    const progress = [
      "🔍 Fetching your website…",
      "⚡ Measuring speed on mobile…",
      "📈 Checking SEO & local Google results…",
      "🧑‍⚕️ Walking through booking signals…",
      "✍️ Writing your evidence-based report…",
    ];
    let pi = 0;
    const progressTimer = setInterval(() => {
      if (pi < progress.length) {
        const text = progress[pi++];
        setMessages((prev) => {
          const withoutTyping = prev.filter((x) => x.kind !== "typing");
          return [
            ...withoutTyping,
            { id: mid(), from: "bot", kind: "text", text } as Msg,
            { id: mid(), from: "bot", kind: "typing" } as Msg,
          ];
        });
      }
    }, 8000);

    try {
      const res = await fetch(AUDIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rawUrl, city, specialty }),
      });
      const data = await res.json();
      clearInterval(progressTimer);
      if (!res.ok) throw new Error(data.error || "Audit failed");

      const report: Report = {
        ...data.report,
        competitorData: data.competitors || null,
        gmbData: data.gmb || null,
        evidence: data.evidence || null,
      };
      const url: string = data.url || rawUrl;
      trackDemoComplete({
        demo_type: "website_audit",
        audit_mode: mode,
        duration: Math.round((Date.now() - auditStartedAt) / 1000),
      });

      replaceTyping({ from: "bot", kind: "text", text: "Done! Here's what the data shows. 👇" });

      const fullSteps: MsgInput[] =
        mode === "competitor" && report.competitorComparison
          ? [
              { from: "bot", kind: "competitor", report },
              { from: "bot", kind: "cta", report },
              { from: "bot", kind: "text", text: "Want the full picture? Choose another option or paste a different website. 👇" },
              { from: "bot", kind: "options" },
            ]
          : [
              { from: "bot", kind: "impact", report },
              { from: "bot", kind: "competitor", report },
              { from: "bot", kind: "issues", report },
              { from: "bot", kind: "improvements", report },
              { from: "bot", kind: "well", report },
              { from: "bot", kind: "cta", report },
              { from: "bot", kind: "text", text: "Anything else? Choose an option or paste another website. 👇" },
              { from: "bot", kind: "options" },
            ];

      setTimeout(() => push({ from: "bot", kind: "score", report, url }), 600);

      if (unlockedRef.current) {
        fullSteps.forEach((m, i) => setTimeout(() => push(m), 1600 + i * 1000));
        setTimeout(() => setBusy(false), 1600 + fullSteps.length * 1000);
      } else {
        pendingRef.current = { steps: fullSteps, report, url };
        setTimeout(() => push({ from: "bot", kind: "teaser", report }), 1600);
        setTimeout(() => push({ from: "bot", kind: "gate" }), 2400);
        setTimeout(() => setBusy(false), 2600);
      }
    } catch (err) {
      clearInterval(progressTimer);
      trackEvent("api_error", {
        api_name: "website_audit",
        error_message: err instanceof Error ? err.message : "Audit failed",
      });
      replaceTyping({
        from: "bot",
        kind: "text",
        text: `😕 ${err instanceof Error ? err.message : "Something went wrong."} Double-check the address (e.g. yourclinic.com) and try again.`,
      });
      setBusy(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (!v || busy) return;
    setInput("");

    const normalized = normalizeAuditUrl(v);
    if (!normalized) {
      push({ from: "user", kind: "text", text: v });
      push({
        from: "bot",
        kind: "text",
        text: "That doesn't look like a website address. Try something like yourclinic.com or https://www.yourclinic.com",
      });
      return;
    }

    push({ from: "user", kind: "text", text: v });
    setTimeout(() => push({ from: "bot", kind: "location", url: normalized }), 300);
  };

  const unlockReport = async (name: string, phone: string, email: string) => {
    const pending = pendingRef.current;
    unlockedRef.current = true;
    try { localStorage.setItem(LEAD_KEY, JSON.stringify({ name, phone, email })); } catch { /* ignore */ }

    try {
      await addDoc(collection(getDb(), "leads"), {
        name: String(name || "").trim().slice(0, 120),
        phone: String(phone || "").trim().slice(0, 40),
        email: String(email || "").trim().slice(0, 160),
        source: "audit_bot",
        website: String(pending?.url || "").trim().slice(0, 300),
        auditScore: typeof pending?.report?.overallScore === "number" ? pending.report.overallScore : null,
        auditVerdict: String(pending?.report?.verdict || "").slice(0, 200),
        topIssue: String(pending?.report?.criticalIssues?.[0]?.title || "").slice(0, 200),
        completionStatus: "complete",
        createdAt: serverTimestamp(),
        status: "new",
      });
    } catch (e) {
      console.error("Lead save failed:", e);
    }

    if (pending) {
      pending.steps.forEach((m, i) => setTimeout(() => push(m), 600 + i * 1000));
      pendingRef.current = null;
    }
  };

  const skipGate = () => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    setTimeout(() => {
      push({
        from: "bot",
        kind: "text",
        text: "No problem! Quick summary: your biggest issue is above — fixing it should be priority one. If you'd like the full breakdown or want us to handle it, I'm right here. 👇",
      });
      if (pending) push({ from: "bot", kind: "cta", report: pending.report });
      push({ from: "bot", kind: "options" });
    }, 400);
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`${heightClass} overflow-y-auto px-4 py-5 space-y-4 bg-[#F8FAFC] flex-1`}>
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            if (m.kind === "typing") return <TypingBubble key={m.id} />;
            if (m.kind === "text") return <Bubble key={m.id} from={m.from}>{m.text}</Bubble>;
            if (m.kind === "location") return (
              <Bubble key={m.id} from="bot">
                <LocationPicker
                  url={m.url}
                  disabled={busy}
                  onConfirm={(city, specialty) => runAudit(m.url, city, specialty)}
                />
              </Bubble>
            );
            if (m.kind === "options") return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 pl-10 pr-4">
                {[
                  { key: "audit" as const, label: "🔍 Full website audit", desc: "Speed, SEO & patient experience" },
                  { key: "competitor" as const, label: "🥊 Competitor benchmark", desc: "Your Google rank vs. rival clinics" },
                  { key: "call" as const, label: "📞 Book a free strategy call", desc: "Talk to our team directly" },
                ].map((o) => (
                  <button
                    key={o.key}
                    onClick={() => chooseOption(o.key)}
                    disabled={busy}
                    className="text-left bg-white border border-[#0077A8]/30 hover:border-[#0077A8] hover:bg-[#F0F9FC] rounded-xl px-4 py-3 transition-colors disabled:opacity-50"
                  >
                    <p className="text-sm font-bold text-[#00283C]">{o.label}</p>
                    <p className="text-xs text-gray-400">{o.desc}</p>
                  </button>
                ))}
              </motion.div>
            );
            if (m.kind === "teaser") {
              const first = m.report.criticalIssues?.[0];
              return first ? (
                <Bubble key={m.id} from="bot">
                  <p className="flex items-center gap-1.5 font-bold text-[#00283C] mb-1"><AlertTriangle className="w-4 h-4 text-[#DC2626]" /> Your #1 critical issue</p>
                  <div className="pl-3 border-l-2 border-[#DC2626]">
                    <p className="font-bold text-[#00283C]">{first.title}</p>
                    <p className="text-gray-500">{first.impact}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">…plus {(m.report.criticalIssues?.length || 1) - 1 + (m.report.improvements?.length || 0)} more findings, your competitor gap, and the Treatment Money Map.</p>
                </Bubble>
              ) : null;
            }
            if (m.kind === "gate") return (
              <Bubble key={m.id} from="bot">
                <LeadGate onUnlock={unlockReport} onSkip={skipGate} />
              </Bubble>
            );
            if (m.kind === "competitor") return (m.report.competitorComparison || m.report.moneyMap?.length || m.report.competitorData?.list?.length) ? (
              <Bubble key={m.id} from="bot">
                {m.report.competitorData?.list?.length ? (
                  <div className="mb-3">
                    <CompetitorLeaderboard data={m.report.competitorData} />
                  </div>
                ) : null}
                {m.report.competitorComparison && (
                  <div className="mb-3">
                    <p className="flex items-center gap-1.5 font-bold text-[#00283C] mb-2">🥊 What this means</p>
                    <p className="text-gray-600">{m.report.competitorComparison}</p>
                  </div>
                )}
                {m.report.moneyMap?.length ? <div className="mb-3"><MoneyMapCard report={m.report} /></div> : null}
                {m.report.gmbData ? <GmbCard data={m.report.gmbData} insight={m.report.gmbInsight} /> : null}
              </Bubble>
            ) : null;
            if (m.kind === "score") return (
              <Bubble key={m.id} from="bot"><ScoreCard report={m.report} url={m.url} /></Bubble>
            );
            if (m.kind === "impact") return (
              <Bubble key={m.id} from="bot">
                <div className="space-y-3">
                  {m.report.revenueImpact && (
                    <div>
                      <p className="flex items-center gap-1.5 font-bold text-[#00283C] mb-1"><Wallet className="w-4 h-4 text-[#D97706]" /> What this is costing you</p>
                      <p>{m.report.revenueImpact}</p>
                    </div>
                  )}
                  {m.report.mysteryPatient && (
                    <div>
                      <p className="flex items-center gap-1.5 font-bold text-[#00283C] mb-1"><UserRound className="w-4 h-4 text-[#0077A8]" /> I tried booking like a patient…</p>
                      <p className="italic text-gray-600">{m.report.mysteryPatient}</p>
                    </div>
                  )}
                </div>
              </Bubble>
            );
            if (m.kind === "issues") return m.report.criticalIssues?.length ? (
              <Bubble key={m.id} from="bot">
                <p className="flex items-center gap-1.5 font-bold text-[#00283C] mb-2"><AlertTriangle className="w-4 h-4 text-[#DC2626]" /> Critical issues</p>
                <div className="space-y-2.5">
                  {m.report.criticalIssues.map((it, i) => (
                    <div key={i} className="pl-3 border-l-2 border-[#DC2626]">
                      <p className="font-bold text-[#00283C]">{it.title}</p>
                      <p className="text-gray-500">{it.impact}</p>
                      <p className="text-[#0077A8]">→ {it.fix}</p>
                    </div>
                  ))}
                </div>
              </Bubble>
            ) : null;
            if (m.kind === "improvements") return m.report.improvements?.length ? (
              <Bubble key={m.id} from="bot">
                <p className="flex items-center gap-1.5 font-bold text-[#00283C] mb-2"><TrendingUp className="w-4 h-4 text-[#D97706]" /> Worth improving</p>
                <div className="space-y-2">
                  {m.report.improvements.map((it, i) => (
                    <div key={i} className="pl-3 border-l-2 border-[#D97706]">
                      <p className="font-bold text-[#00283C]">{it.title}</p>
                      <p className="text-gray-500">{it.impact} <span className="text-[#0077A8]">→ {it.fix}</span></p>
                    </div>
                  ))}
                </div>
              </Bubble>
            ) : null;
            if (m.kind === "well") return m.report.doingWell?.length ? (
              <Bubble key={m.id} from="bot">
                <p className="flex items-center gap-1.5 font-bold text-[#00283C] mb-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> You&apos;re doing these well</p>
                <ul className="space-y-1.5">
                  {m.report.doingWell.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />{d}</li>
                  ))}
                </ul>
              </Bubble>
            ) : null;
            if (m.kind === "cta") return (
              <Bubble key={m.id} from="bot">
                <p className="mb-3">{m.report.nextStep || "Want us to fix all of this for you? Book a free strategy call — we'll turn these fixes into more patients."}</p>
                <button
                  onClick={openForm}
                  className="btn-dark w-full py-3 text-sm inline-flex items-center justify-center gap-2"
                >
                  Book My Free Strategy Call <ArrowRight className="w-4 h-4" />
                </button>
              </Bubble>
            );
            return null;
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="border-t border-gray-200 bg-white px-3 py-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={busy ? "Auditing… ~1–2 min" : "Type your website, e.g. yourclinic.com"}
          disabled={busy}
          className="flex-1 px-4 py-3 rounded-xl bg-[#F8FAFC] border border-gray-200 text-sm text-[#00283C] outline-none focus:border-[#0077A8] transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="w-11 h-11 rounded-xl bg-[#00283C] text-white flex items-center justify-center hover:bg-[#0077A8] transition-colors disabled:opacity-40 flex-shrink-0"
          aria-label="Send"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
