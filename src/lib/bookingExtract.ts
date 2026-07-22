export interface BookingDraft {
  name: string;
  phone: string;
  email: string;
  service: string;
  day: string;
  time: string;
}

export const EMPTY_DRAFT: BookingDraft = {
  name: "",
  phone: "",
  email: "",
  service: "",
  day: "",
  time: "",
};

export const BOOKING_DAYS = ["Today", "Tomorrow", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const BOOKING_TIMES = ["11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM", "7:00 PM", "8:30 PM"];

export function isServicesQuery(text: string): boolean {
  const t = text.trim().replace(/\s+/g, " ");
  if (!t) return false;
  // Don't treat booking requests as a catalog ask ("book a service", etc.)
  if (/\b(book|schedule|appointment|reserve)\b/i.test(t) && !/\b(what|which|list|show|offer|available)\b/i.test(t)) {
    return false;
  }
  // Short / casual: "services", "service?", "your services"
  if (/^(hey[,!]?\s+|hi[,!]?\s+|please\s+)?(what('s| is| are)?\s+)?(your\s+|the\s+)?(services?|treatments?)\??\.?$/i.test(t)) {
    return true;
  }
  // Common catalog phrasing — same UI as the Services chip
  return /\b(what\s+services?|which\s+services?|services?\s+do\s+you|what\s+do\s+you\s+offer|what\s+treatments?|list(?:\s+of)?(?:\s+your)?\s+services?|show(?:\s+me)?(?:\s+your|\s+the)?\s+services?|(?:your|available)\s+services?|services?\s+(?:you\s+)?offer|tell\s+me\s+about\s+your\s+services?|services?\s+list|service\s+menu|what\s+can\s+you\s+(?:do|offer|help\s+with))\b/i.test(
    t
  );
}

export function isServiceDetailQuery(text: string): string | null {
  const m = text.match(/\b(?:tell me about|what is|info on|learn about|about)\s+(?:the\s+)?(.+?)(?:\?|$)/i);
  if (!m) return null;
  return m[1].trim();
}

export function hasBookingIntent(text: string): boolean {
  if (isServicesQuery(text)) return false;
  if (/^(what|how|when|where|who|why|tell me|do you|can you|is there)/i.test(text.trim()) && !/\bbook\b/i.test(text)) return false;
  return /\b(book|booking|i'd like to book|i would like to book|schedule|make an appointment|reserve a slot)\b/i.test(text);
}

export function mergeDraft(base: BookingDraft, patch: Partial<BookingDraft>): BookingDraft {
  const out = { ...base };
  (Object.keys(patch) as (keyof BookingDraft)[]).forEach((key) => {
    const v = patch[key];
    if (typeof v === "string" && v.trim()) out[key] = v.trim();
  });
  return out;
}

export function draftIsComplete(draft: BookingDraft): boolean {
  return (
    draft.name.trim().length >= 2 &&
    draft.phone.replace(/\D/g, "").length >= 10 &&
    !!draft.service &&
    !!draft.day &&
    !!draft.time
  );
}

function splitDayTime(pref: string): { day: string; time: string } {
  const atMatch = pref.match(/\b(Today|Tomorrow|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\b\s*(?:at|@)?\s*(.+)/i);
  if (atMatch) {
    const day = BOOKING_DAYS.find((d) => d.toLowerCase() === atMatch[1].toLowerCase()) || atMatch[1];
    return { day, time: normalizeTime(atMatch[2].trim()) };
  }
  const day = BOOKING_DAYS.find((d) => new RegExp(`\\b${d}\\b`, "i").test(pref)) || "";
  const time = normalizeTime(pref);
  return { day, time: day && time && !pref.toLowerCase().includes(day.toLowerCase()) ? time : time };
}

function normalizeTime(text: string): string {
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

function formatPhone(digits: string): string {
  const d = digits.slice(-10);
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return digits;
}

function matchService(text: string, serviceNames: string[]): string {
  const lower = text.toLowerCase();
  for (const s of serviceNames) {
    const key = s.toLowerCase().replace(" (orthodontics)", "").replace(" & check-up", "").replace(" & polishing", "");
    if (lower.includes(key) || lower.includes(s.toLowerCase())) return s;
  }
  const aliases: Record<string, string> = {
    braces: "Braces (Orthodontics)",
    aligners: "Clear Aligners",
    whitening: "Teeth Whitening",
    implant: "Dental Implants",
    implants: "Dental Implants",
    filling: "Tooth Filling",
    "root canal": "Root Canal",
    scaling: "Scaling & Polishing",
    polish: "Scaling & Polishing",
    veneer: "Veneers",
    wisdom: "Wisdom Tooth Extraction",
    extraction: "Wisdom Tooth Extraction",
    consultation: "Consultation & Check-up",
    "check-up": "Consultation & Check-up",
    checkup: "Consultation & Check-up",
  };
  for (const [alias, svc] of Object.entries(aliases)) {
    if (lower.includes(alias) && serviceNames.includes(svc)) return svc;
  }
  return "";
}

/** Pull booking fields from chat history or a single utterance (voice transcript). */
export function extractBookingDraft(
  messages: { role: string; content: string }[],
  serviceNames: string[]
): BookingDraft {
  const draft: BookingDraft = { ...EMPTY_DRAFT };
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
      if (m && !/\b(book|appointment|service|phone|email|braces|whitening)\b/i.test(m[1])) {
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
