/**
 * Extract partial booking details from chat history for the review form.
 */

const BOOKING_DAYS = ["Today", "Tomorrow", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const BOOKING_TIMES = ["11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM", "7:00 PM", "8:30 PM"];

function normalizeTime(text) {
  const direct = BOOKING_TIMES.find((t) => text.includes(t));
  if (direct) return direct;
  const m = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (!m) return "";
  let h = parseInt(m[1], 10);
  const ap = m[3].toUpperCase();
  if (ap === "PM" && h < 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  const slots = [
    { label: "11:00 AM", h: 11 },
    { label: "1:00 PM", h: 13 },
    { label: "3:00 PM", h: 15 },
    { label: "5:00 PM", h: 17 },
    { label: "7:00 PM", h: 19 },
    { label: "8:30 PM", h: 20.5 },
  ];
  let best = slots[0];
  let bestDiff = Infinity;
  for (const s of slots) {
    const diff = Math.abs(s.h - h);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = s;
    }
  }
  return best.label;
}

function splitDayTime(pref) {
  const atMatch = pref.match(/\b(Today|Tomorrow|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\b\s*(?:at|@)?\s*(.+)/i);
  if (atMatch) {
    const day = BOOKING_DAYS.find((d) => d.toLowerCase() === atMatch[1].toLowerCase()) || atMatch[1];
    return { day, time: normalizeTime(atMatch[2].trim()) };
  }
  const day = BOOKING_DAYS.find((d) => new RegExp(`\\b${d}\\b`, "i").test(pref)) || "";
  return { day, time: normalizeTime(pref) };
}

function formatPhone(digits) {
  const d = digits.slice(-10);
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return digits;
}

function matchService(text, serviceNames) {
  const lower = text.toLowerCase();
  for (const s of serviceNames) {
    const key = s.toLowerCase().replace(" (orthodontics)", "").replace(" & check-up", "").replace(" & polishing", "");
    if (lower.includes(key) || lower.includes(s.toLowerCase())) return s;
  }
  const aliases = {
    braces: "Braces (Orthodontics)",
    aligners: "Clear Aligners",
    whitening: "Teeth Whitening",
    implant: "Dental Implants",
    implants: "Dental Implants",
    filling: "Tooth Filling",
    "root canal": "Root Canal",
    scaling: "Scaling & Polishing",
    consultation: "Consultation & Check-up",
    checkup: "Consultation & Check-up",
  };
  for (const [alias, svc] of Object.entries(aliases)) {
    if (lower.includes(alias) && serviceNames.includes(svc)) return svc;
  }
  return "";
}

function isServicesQuery(text) {
  return /\b(what services|services do you|what do you offer|what treatments|list (your )?services|tell me about your services)\b/i.test(text);
}

function hasBookingIntent(text) {
  if (isServicesQuery(text)) return false;
  if (/^(what|how|when|where|who|why|tell me|do you|can you|is there)/i.test(String(text).trim()) && !/\bbook\b/i.test(text)) return false;
  return /\b(book|booking|i'd like to book|i would like to book|schedule|make an appointment|reserve a slot)\b/i.test(text);
}

function isDraftComplete(draft) {
  if (!draft || typeof draft !== "object") return false;
  const name = String(draft.name || "").trim();
  const phoneDigits = String(draft.phone || "").replace(/\D/g, "");
  const service = String(draft.service || "").trim();
  const day = String(draft.day || "").trim();
  const time = String(draft.time || "").trim();
  return name.length >= 2 && phoneDigits.length >= 10 && !!service && !!day && !!time;
}

function mergeBookingDrafts(base, patch) {
  const out = { name: "", phone: "", email: "", service: "", day: "", time: "", ...(base || {}) };
  if (!patch || typeof patch !== "object") return out;
  for (const key of ["name", "phone", "email", "service", "day", "time"]) {
    const v = String(patch[key] || "").trim();
    if (v) out[key] = v;
  }
  return out;
}

function extractBookingDraft(messages, serviceNames) {
  const draft = { name: "", phone: "", email: "", service: "", day: "", time: "" };
  const texts = messages.map((m) => m.content || "").filter(Boolean);
  const userTexts = messages.filter((m) => m.role === "user").map((m) => m.content || "");
  const combined = texts.join("\n");
  const userCombined = userTexts.join("\n");

  const structured = userCombined.match(
    /Name:\s*(.+?)[.\s]+Phone:\s*(.+?)(?:[.\s]+Email:\s*(.+?))?[.\s]+Service:\s*(.+?)[.\s]+Preferred time:\s*([^\n]+)/i
  );
  if (structured) {
    draft.name = structured[1].trim();
    draft.phone = structured[2].trim();
    if (structured[3]) draft.email = structured[3].trim();
    draft.service = structured[4].trim();
    const { day, time } = splitDayTime(structured[5].trim());
    draft.day = day;
    draft.time = time;
    return draft;
  }

  const emailMatch = combined.match(/[\w.+-]+@[\w.-]+\.\w{2,}/);
  if (emailMatch) draft.email = emailMatch[0];

  const phoneMatches = userCombined.match(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}|\d{10,}/g);
  if (phoneMatches?.length) {
    const digits = phoneMatches[phoneMatches.length - 1].replace(/\D/g, "");
    if (digits.length >= 10) draft.phone = formatPhone(digits);
  }

  for (const t of [...userTexts].reverse()) {
    const patterns = [
      /(?:my name is|i am|i'm|this is|call me|name is|naam hai|mera naam)\s+([A-Za-z][A-Za-z\s'.-]{1,40})/i,
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})$/,
    ];
    for (const p of patterns) {
      const m = t.match(p);
      if (m && !/\b(book|appointment|service|phone|email|braces|whitening|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday)\b/i.test(m[1])) {
        draft.name = m[1].trim();
        break;
      }
    }
    if (draft.name) break;
  }

  draft.service = matchService(combined, serviceNames);
  if (!draft.service) {
    const bookSvc = userCombined.match(/(?:book|want|need|for|like)\s+(?:a\s+)?(.+?)(?:\s+appointment|\s+on|\s+at|\s+please|$)/i);
    if (bookSvc) draft.service = matchService(bookSvc[1], serviceNames);
  }

  for (const d of BOOKING_DAYS) {
    if (new RegExp(`\\b${d}\\b`, "i").test(combined)) {
      draft.day = d;
      break;
    }
  }

  for (const t of BOOKING_TIMES) {
    if (combined.includes(t)) {
      draft.time = t;
      break;
    }
  }
  if (!draft.time) draft.time = normalizeTime(combined);

  return draft;
}

module.exports = {
  extractBookingDraft,
  hasBookingIntent,
  isServicesQuery,
  isDraftComplete,
  mergeBookingDrafts,
  BOOKING_DAYS,
  BOOKING_TIMES,
};
