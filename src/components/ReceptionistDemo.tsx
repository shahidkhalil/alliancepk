"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CalendarCheck2, Phone, Clock, Sparkles, Mic, Square, Trash2, Volume2, VolumeX, AlertTriangle, ChevronRight } from "lucide-react";
import { LiveCallLauncher } from "./LiveCall";
import {
  BookingDraft,
  EMPTY_DRAFT,
  BOOKING_TIMES,
  extractBookingDraft,
  hasBookingIntent,
  isServicesQuery,
  isServiceDetailQuery,
  mergeDraft,
  draftIsComplete,
} from "@/lib/bookingExtract";

import { trackDemoComplete, trackDemoStart, trackEvent } from "@/lib/analytics";
import { receptionistUrl } from "@/lib/receptionistEndpoints";
import { buildClientTriage, type TriageInfo } from "@/lib/emergencyTriage";
const MAX_RECORD_SECONDS = 30;

interface QuickReply {
  label: string;
  value: string;
}

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  audio?: string;
  voiceNote?: boolean;
  showServices?: boolean;
  /** Inline day/time picker for chat booking */
  showSchedule?: boolean;
  serviceDetail?: string;
  /** Offer form vs chat booking paths */
  bookingChoice?: { service: string; resolved?: boolean };
  form?: { service: string; done?: boolean };
  triage?: TriageInfo;
  booking?: Booking;
  quickReplies?: QuickReply[];
  /** User already acted on this message's interactive UI */
  interactiveConsumed?: boolean;
}

let msgSeq = 0;
function newMsgId() {
  msgSeq += 1;
  return `m-${Date.now()}-${msgSeq}`;
}

interface Booking {
  name: string;
  phone: string;
  service: string;
  preferredTime: string;
  clinicName?: string;
  urgent?: boolean;
  email?: string;
}

const SUGGESTIONS: {
  icon: string;
  label: string;
  shortLabel: string;
  action: "chat" | "services" | "detail" | "book";
  service?: string;
}[] = [
  { icon: "🚨", label: "My tooth is bleeding", shortLabel: "Tooth bleeding", action: "chat" },
  { icon: "📋", label: "What's my appointment?", shortLabel: "My appointment", action: "chat" },
  { icon: "🦷", label: "What services do you offer?", shortLabel: "View services", action: "services" },
  { icon: "📅", label: "Book me an appointment", shortLabel: "Book appointment", action: "book" },
];

const SERVICES = [
  "Consultation & Check-up",
  "Scaling & Polishing",
  "Tooth Filling",
  "Root Canal",
  "Dental Implants",
  "Braces (Orthodontics)",
  "Clear Aligners",
  "Teeth Whitening",
  "Veneers",
  "Wisdom Tooth Extraction",
];

const SERVICE_INFO: Record<string, { icon: string; desc: string }> = {
  "Consultation & Check-up": { icon: "🩺", desc: "Full exam, X-rays if needed, and a personalised treatment plan." },
  "Scaling & Polishing": { icon: "✨", desc: "Professional deep clean to remove plaque and stains." },
  "Tooth Filling": { icon: "🔧", desc: "Repairs cavities with tooth-coloured composite — usually same-day." },
  "Root Canal": { icon: "🦷", desc: "Saves an infected tooth with gentle, modern techniques." },
  "Dental Implants": { icon: "⚙️", desc: "Permanent tooth replacement with a planning consultation." },
  "Braces (Orthodontics)": { icon: "😁", desc: "Straighten teeth with metal or ceramic braces over 12–24 months." },
  "Clear Aligners": { icon: "💎", desc: "Nearly invisible, removable aligners for discreet treatment." },
  "Teeth Whitening": { icon: "🌟", desc: "In-office professional whitening — results in about an hour." },
  "Veneers": { icon: "💫", desc: "Custom porcelain shells for a brighter, even smile." },
  "Wisdom Tooth Extraction": { icon: "🏥", desc: "Simple or surgical extraction with sedation options." },
};

function matchServiceName(text: string): string | null {
  const lower = text.toLowerCase();
  return SERVICES.find((s) => {
    const key = s.toLowerCase().replace(" (orthodontics)", "").replace(" & check-up", "").replace(" & polishing", "");
    return lower.includes(key) || lower.includes(s.toLowerCase());
  }) || null;
}

function MayaAvatar({ size = "w-8 h-8" }: { size?: string }) {
  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-[#0E7C6B] to-[#14A08A] flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm`}>
      M
    </div>
  );
}

function ServicesCatalog({
  onPick,
  onBook,
}: {
  onPick: (s: string) => void;
  onBook: (s: string) => void;
}) {
  return (
    <div className="mt-2.5 w-full rounded-2xl border border-[#0E7C6B]/15 bg-white shadow-sm overflow-hidden">
      <div className="px-3.5 py-2.5 bg-[#F4F8F7] border-b border-[#0E7C6B]/10 text-left">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#0E7C6B]">Our services</p>
        <p className="text-[11px] text-gray-500 mt-0.5">Tap a row for details · Book to reserve</p>
      </div>
      <div className="max-h-[280px] sm:max-h-[320px] overflow-y-auto overscroll-contain divide-y divide-gray-100">
        {SERVICES.map((s) => {
          const info = SERVICE_INFO[s];
          return (
            <div
              key={s}
              className="flex items-stretch gap-0 min-h-[52px] hover:bg-[#F7FBFA] transition-colors"
            >
              <button
                type="button"
                onClick={() => onPick(s)}
                className="flex-1 flex items-start gap-3 px-3.5 py-3.5 text-left min-w-0"
              >
                <span className="text-xl flex-shrink-0 leading-none mt-0.5" aria-hidden>
                  {info?.icon || "🦷"}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] sm:text-sm font-bold text-[#00332C] leading-snug">{s}</span>
                  <span className="block text-[11px] sm:text-xs text-gray-500 mt-1 leading-snug">{info?.desc}</span>
                  <span className="mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#0E7C6B]">
                    Learn more <ChevronRight className="w-3 h-3" />
                  </span>
                </span>
              </button>
              <div className="flex items-center pr-3 pl-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onBook(s)}
                  className="text-[11px] sm:text-xs font-bold text-white bg-gradient-to-r from-[#0E7C6B] to-[#14A08A] px-3 py-2 rounded-full hover:shadow-md transition-all whitespace-nowrap"
                >
                  Book
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const WEEKDAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addLocalDays(d: Date, n: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return startOfLocalDay(next);
}

function sameLocalDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Map a calendar date to BOOKING_DAYS labels the backend already understands. */
function dateToBookingDay(d: Date): string {
  const today = startOfLocalDay(new Date());
  if (sameLocalDay(d, today)) return "Today";
  if (sameLocalDay(d, addLocalDays(today, 1))) return "Tomorrow";
  return WEEKDAY_LONG[d.getDay()];
}

function isClinicOpenDay(d: Date) {
  // Demo clinic: Mon–Sat open, Sunday closed
  return d.getDay() !== 0;
}

function buildScheduleDays(count = 14): Date[] {
  const today = startOfLocalDay(new Date());
  const days: Date[] = [];
  for (let i = 0; i < count; i++) days.push(addLocalDays(today, i));
  return days;
}

function bookingDayToDate(dayLabel: string, window: Date[]): Date | null {
  if (!dayLabel) return null;
  const match = window.find((d) => dateToBookingDay(d) === dayLabel);
  return match || null;
}

function SlotCalendar({
  onPickSlot,
  selectedDay = "",
  selectedTime = "",
  embedded = false,
}: {
  onPickSlot: (dayLabel: string, time: string) => void;
  selectedDay?: string;
  selectedTime?: string;
  embedded?: boolean;
}) {
  const days = buildScheduleDays(14);
  const [selected, setSelected] = useState<Date | null>(() => bookingDayToDate(selectedDay, days));

  useEffect(() => {
    const fromDraft = bookingDayToDate(selectedDay, days);
    if (fromDraft) setSelected(fromDraft);
    // days is rebuilt each render but represents the same session window
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

  const monthLabel = selected
    ? selected.toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : days[0].toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div
      className={`w-full overflow-hidden text-left ${
        embedded
          ? "rounded-xl border border-gray-200 bg-[#FAFCFB]"
          : "mt-2.5 rounded-2xl border border-[#0E7C6B]/15 bg-white shadow-sm"
      }`}
    >
      <div className={`px-3.5 py-2.5 border-b ${embedded ? "bg-white border-gray-100" : "bg-[#F4F8F7] border-[#0E7C6B]/10"}`}>
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#0E7C6B] flex items-center gap-1.5">
          <CalendarCheck2 className="w-3.5 h-3.5" /> Pick a day &amp; time
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5">
          {monthLabel} · Mon–Sat · demo availability
          {selectedDay && selectedTime ? ` · ${selectedDay} at ${selectedTime}` : ""}
        </p>
      </div>

      <div className="p-3 space-y-3">
        <div className="grid grid-cols-7 gap-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((h, i) => (
            <div key={`${h}-${i}`} className="text-center text-[9px] font-bold text-gray-400 py-0.5">
              {h}
            </div>
          ))}
          {Array.from({ length: days[0].getDay() }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((d) => {
            const open = isClinicOpenDay(d);
            const isSel = selected && sameLocalDay(d, selected);
            const isToday = sameLocalDay(d, startOfLocalDay(new Date()));
            return (
              <button
                key={d.toISOString()}
                type="button"
                disabled={!open}
                onClick={() => setSelected(d)}
                className={`aspect-square rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
                  !open
                    ? "text-gray-300 cursor-not-allowed"
                    : isSel
                      ? "bg-[#0E7C6B] text-white shadow-sm"
                      : isToday
                        ? "bg-[#0E7C6B]/10 text-[#0E7C6B] border border-[#0E7C6B]/30 hover:bg-[#0E7C6B]/15"
                        : "text-[#00332C] hover:bg-[#F4F8F7] border border-transparent"
                }`}
                aria-label={d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>

        {selected && (
          <div>
            <p className="text-[11px] font-semibold text-gray-600 mb-2">
              Available times · {dateToBookingDay(selected)}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {BOOKING_TIMES.map((t) => {
                const active = selectedTime === t && selectedDay === dateToBookingDay(selected);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onPickSlot(dateToBookingDay(selected), t)}
                    className={`px-3 py-2 rounded-full text-[11px] sm:text-xs font-bold border transition-colors ${
                      active
                        ? "bg-[#0E7C6B] text-white border-[#0E7C6B]"
                        : "text-[#0E7C6B] bg-[#F4F8F7] border-[#0E7C6B]/20 hover:bg-[#0E7C6B] hover:text-white hover:border-[#0E7C6B]"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!selected && (
          <p className="text-[11px] text-gray-400 text-center py-1">Select an available day to see times</p>
        )}
      </div>
    </div>
  );
}

function QuickReplyChips({
  replies,
  onPick,
}: {
  replies: QuickReply[];
  onPick: (value: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5 w-full">
      {replies.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => onPick(r.value)}
          className="text-left text-[12px] sm:text-xs px-3.5 py-2 rounded-full border bg-white text-[#00332C] border-[#0E7C6B]/25 hover:border-[#0E7C6B] hover:text-[#0E7C6B] shadow-sm transition-all"
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

/** Decide interactive UI for an assistant turn during chat booking / services ask. */
function inferInteractiveExtras(
  draft: BookingDraft,
  replyText: string,
  opts: { servicesAsked: boolean; chatBooking: boolean; bookingDone: boolean; formOpen: boolean }
): Partial<Pick<ChatMsg, "showServices" | "showSchedule" | "quickReplies" | "content">> {
  if (opts.bookingDone || opts.formOpen) return {};

  if (opts.servicesAsked) {
    return {
      showServices: true,
      content:
        replyText && !/^(hi|hello|hey)\b/i.test(replyText)
          ? replyText
          : "We offer a full range of dental care — tap a service to learn more or book.",
    };
  }

  const askingService = /\b(which|what)\s+(service|treatment)\b|\bservice\s+(would|do)\s+you\b|\bchoose\s+a\s+service\b/i.test(
    replyText
  );
  const askingEmail = /\bemail\b/i.test(replyText) && /\b(skip|optional|prefer|want to (add|share|leave))\b/i.test(replyText);
  const askingSchedule =
    /\b(day|date|time|when|schedule|available|prefer(red)?\s+(day|time))\b/i.test(replyText) ||
    /\b(morning|afternoon|evening)\b/i.test(replyText);
  const askingConfirm = /\b(shall i book|ready to book|confirm( the)? booking|book that|go ahead and book)\b/i.test(
    replyText
  );

  const inBooking =
    opts.chatBooking ||
    Boolean(draft.service || draft.name || draft.phone) ||
    askingService ||
    askingSchedule ||
    askingEmail ||
    askingConfirm;

  if (!inBooking) return {};

  if (!draft.service && (askingService || opts.chatBooking)) {
    return {
      showServices: true,
      content: replyText || "Which service would you like to book? Tap one below.",
    };
  }

  if (draft.service && draft.name && draft.phone.replace(/\D/g, "").length >= 10) {
    if (askingEmail) {
      return {
        quickReplies: [{ label: "Skip email", value: "Please skip email — I don't want to provide one." }],
      };
    }
    if (!draft.day || !draft.time) {
      return {
        showSchedule: true,
        content: replyText || "Pick an available day and time below.",
      };
    }
    if (askingConfirm) {
      return {
        quickReplies: [
          {
            label: "Yes, book it",
            value: `Yes, please book ${draft.service} for ${draft.name} on ${draft.day} at ${draft.time}. Phone: ${draft.phone}.${draft.email ? ` Email: ${draft.email}.` : ""}`,
          },
          { label: "Change details", value: "I'd like to change some booking details before we confirm." },
        ],
      };
    }
  }

  // Schedule asked before all contact fields — still show calendar if Maya is clearly asking for day/time
  if ((!draft.day || !draft.time) && askingSchedule) {
    return {
      showSchedule: true,
      content: replyText || "Pick an available day and time below.",
    };
  }

  return {};
}

function ServiceDetailCard({ name, onBook }: { name: string; onBook: () => void }) {
  const info = SERVICE_INFO[name];
  if (!info) return null;
  return (
    <div className="mt-2.5 w-full rounded-2xl border border-[#0E7C6B]/15 bg-white px-4 py-3.5 shadow-sm text-left">
      <p className="text-sm font-bold text-[#00332C] flex items-center gap-2">
        <span>{info.icon}</span> {name}
      </p>
      <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{info.desc}</p>
      <button type="button" onClick={onBook} className="mt-3 text-xs font-bold text-white bg-gradient-to-r from-[#0E7C6B] to-[#14A08A] px-4 py-2 rounded-full hover:shadow-md transition-all">
        Book this service →
      </button>
    </div>
  );
}

function hasOpenForm(msgs: ChatMsg[]) {
  return msgs.some((m) => m.form && !m.form.done);
}

function hasOpenBookingChoice(msgs: ChatMsg[]) {
  return msgs.some((m) => m.bookingChoice && !m.bookingChoice.resolved);
}

/** Professional paragraph layout for Maya replies */
function renderInline(text: string) {
  // Split on **bold**, *italic*, and `code` — never show raw markdown markers
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-[#00332C]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={i} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <span key={i} className="font-medium text-[#00332C]">
          {part.slice(1, -1)}
        </span>
      );
    }
    // Strip any leftover unmatched markdown markers
    return <span key={i}>{part.replace(/\*\*/g, "").replace(/__/g, "")}</span>;
  });
}

function AssistantText({ text }: { text: string }) {
  const cleaned = text
    .replace(/\*\*\s*/g, "**")
    .replace(/\s*\*\*/g, "**")
    .trim();

  const blocks = cleaned
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="text-left space-y-2.5">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        return (
          <p key={i} className="text-[13px] sm:text-sm leading-[1.6] text-gray-700 tracking-[-0.01em]">
            {lines.map((line, j) => (
              <span key={j}>
                {j > 0 ? <br /> : null}
                {renderInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function BookingPathChoice({
  service,
  onForm,
  onChat,
}: {
  service: string;
  onForm: () => void;
  onChat: () => void;
}) {
  return (
    <div className="mt-2.5 w-full rounded-2xl rounded-tl-md border border-[#0E7C6B]/15 bg-white shadow-sm p-3.5 sm:p-4 space-y-3">
      <p className="text-[12px] sm:text-sm font-semibold text-[#00332C] text-left leading-snug">
        How would you like to book{service ? ` ${service}` : ""}?
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={onForm}
          className="flex-1 text-left px-3.5 py-3 rounded-xl bg-gradient-to-r from-[#0E7C6B] to-[#14A08A] text-white shadow-sm hover:shadow-md transition-all"
        >
          <span className="block text-xs font-bold">Fill booking form</span>
          <span className="block text-[10px] text-white/80 mt-0.5">Quick — name, phone, day &amp; time</span>
        </button>
        <button
          type="button"
          onClick={onChat}
          className="flex-1 text-left px-3.5 py-3 rounded-xl bg-[#F4F8F7] border border-[#0E7C6B]/20 text-[#00332C] hover:border-[#0E7C6B]/45 hover:bg-white transition-all"
        >
          <span className="block text-xs font-bold">Chat with Maya</span>
          <span className="block text-[10px] text-gray-500 mt-0.5">Type answers — she&apos;ll guide you</span>
        </button>
      </div>
    </div>
  );
}

function BookingForm({
  draft,
  onChange,
  onSubmit,
  busy,
  onSwitchToChat,
}: {
  draft: BookingDraft;
  onChange: (d: BookingDraft) => void;
  onSubmit: () => void;
  busy: boolean;
  onSwitchToChat?: () => void;
}) {
  const set = (key: keyof BookingDraft, val: string) => onChange({ ...draft, [key]: val });
  const phoneOk = draft.phone.replace(/\D/g, "").length >= 10;
  const canBook = draftIsComplete(draft);

  const field = "w-full px-3 py-2.5 sm:px-3.5 rounded-xl border border-gray-200 text-[15px] sm:text-sm text-gray-800 outline-none focus:border-[#0E7C6B] focus:ring-2 focus:ring-[#0E7C6B]/10 bg-white transition-all";
  const label = "block text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1 text-left";

  return (
    <div className="w-full rounded-2xl rounded-tl-md border border-[#0E7C6B]/20 bg-white shadow-md p-3 sm:p-5 space-y-2.5 sm:space-y-3.5 mt-2 text-left">
      <div className="flex items-center gap-2 pb-0.5">
        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0E7C6B]/10 flex items-center justify-center text-sm sm:text-base flex-shrink-0">📅</span>
        <div className="min-w-0">
          <p className="text-[13px] sm:text-sm font-bold text-[#00332C]">Book your appointment</p>
          <p className="text-[10px] sm:text-[11px] text-gray-500">Fill in the details below to confirm</p>
        </div>
      </div>
      <div>
        <label className={label}>Your name</label>
        <input value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Jane Smith" className={field} />
      </div>
      <div>
        <label className={label}>Phone</label>
        <input value={draft.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(555) 123-4567" inputMode="tel" className={field} />
        {draft.phone.trim() && !phoneOk && (
          <p className="mt-1 text-[11px] text-amber-600">Enter a full 10-digit phone number</p>
        )}
      </div>
      <div>
        <label className={label}>Email <span className="normal-case font-normal">(optional)</span></label>
        <input value={draft.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" type="email" className={field} />
      </div>
      <div>
        <label className={label}>Service</label>
        <select value={draft.service} onChange={(e) => set("service", e.target.value)} className={field}>
          <option value="" disabled>Select service</option>
          {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className={label}>Day &amp; time</label>
        <SlotCalendar
          embedded
          selectedDay={draft.day}
          selectedTime={draft.time}
          onPickSlot={(day, time) => onChange({ ...draft, day, time })}
        />
      </div>
      <button
        type="button"
        disabled={!canBook || busy}
        onClick={onSubmit}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0E7C6B] to-[#14A08A] text-white text-sm font-bold hover:shadow-lg hover:shadow-[#0E7C6B]/20 transition-all disabled:opacity-40 disabled:shadow-none"
      >
        Confirm Booking ✓
      </button>
      {onSwitchToChat && (
        <button
          type="button"
          disabled={busy}
          onClick={onSwitchToChat}
          className="w-full py-2 text-xs font-semibold text-[#0E7C6B] hover:underline disabled:opacity-40"
        >
          Prefer to chat instead? Continue with Maya →
        </button>
      )}
    </div>
  );
}

export default function ReceptionistDemo() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there. I'm Maya at Bright Smile Dental Care. I can help with services, hours, or booking an appointment — tap Book when you're ready.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const triageTrackedRef = useRef(false);
  const [recState, setRecState] = useState<"idle" | "recording" | "transcribing">("idle");
  const [recSeconds, setRecSeconds] = useState(0);
  const [draft, setDraft] = useState<BookingDraft>({ ...EMPTY_DRAFT });

  const recorderRef = useRef<MediaRecorder | null>(null);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const focusComposer = () => {
    // Defer until after React re-enable / layout so focus sticks on mobile too.
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  };
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const draftRef = useRef(draft);
  const bookingTrackedRef = useRef(false);
  const demoStartedRef = useRef(false);
  const demoStartedAtRef = useRef(0);
  const messagesSentRef = useRef(0);
  const voiceUsedRef = useRef(false);
  const deepLinkHandledRef = useRef(false);
  const chatBookingRef = useRef(false);
  const sendRef = useRef<(text: string, opts?: { voice?: boolean; forceBooking?: boolean; continueChatBooking?: boolean }) => void>(() => {});
  draftRef.current = draft;

  const consumeInteractive = useCallback(() => {
    setMessages((prev) => {
      const next = prev.map((m) =>
        m.role === "assistant" && (m.showServices || m.showSchedule || m.quickReplies?.length)
          ? { ...m, interactiveConsumed: true }
          : m
      );
      messagesRef.current = next;
      return next;
    });
  }, []);

  const markDemoStarted = (voiceUsed = false) => {
    if (voiceUsed) voiceUsedRef.current = true;
    if (demoStartedRef.current) return;
    demoStartedRef.current = true;
    demoStartedAtRef.current = Date.now();
    trackDemoStart({ demo_type: "ai_receptionist_chat", voice_used: voiceUsed });
  };

  /** Scroll only inside the chat panel — never move the whole page */
  const scrollChatToBottom = useCallback((smooth = true) => {
    const el = chatScrollRef.current;
    if (!el) return;
    const run = () => {
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, []);

  useEffect(() => {
    scrollChatToBottom(true);
  }, [messages, busy, scrollChatToBottom]);

  // Email deep link: /ai-receptionist?ref=XXXX&intent=check
  useEffect(() => {
    if (deepLinkHandledRef.current || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = (params.get("ref") || "").trim().toUpperCase();
    const intent = (params.get("intent") || "").trim().toLowerCase();
    if (!ref && intent !== "check" && intent !== "chat") return;
    deepLinkHandledRef.current = true;

    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (intent === "check" || ref) {
      const ask = ref
        ? `I'd like to check my appointment. My reference is ${ref}.`
        : "I'd like to check my appointment details please.";
      window.setTimeout(() => sendRef.current(ask, { continueChatBooking: true }), 700);
    }
  }, []);

  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(false);

  const stopSpeaking = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setSpeaking(false);
  };

  const toggleMute = () => {
    setMuted((m) => {
      mutedRef.current = !m;
      if (!m) stopSpeaking();
      return !m;
    });
  };

  const playAudio = (b64: string, force = false) => {
    if (mutedRef.current && !force) return;
    try {
      stopSpeaking();
      const a = new Audio(`data:audio/mp3;base64,${b64}`);
      audioRef.current = a;
      a.onended = () => setSpeaking(false);
      a.onpause = () => setSpeaking(false);
      a.play().then(() => setSpeaking(true)).catch(() => setSpeaking(false));
    } catch { /* ignore */ }
  };

  const applyDraftFromMessages = useCallback(
    (msgs: ChatMsg[], serverDraft?: Partial<BookingDraft>) => {
      const extracted = extractBookingDraft(
        msgs.map((m) => ({ role: m.role, content: m.content })),
        SERVICES
      );
      setDraft((prev) => mergeDraft(prev, mergeDraft(extracted, serverDraft || {})));
    },
    []
  );

  /** Book chip / service Book → show form immediately (no gray flash from choice→form) */
  const openBookingChoice = (service = "", userText?: string) => {
    if (busy) return;
    bookingTrackedRef.current = false;
    trackEvent("appointment_booking_start", { channel: "chat" });
    setShowSuggestions(false);
    setDraft(mergeDraft({ ...EMPTY_DRAFT }, service ? { service } : {}));
    const userLine =
      userText ||
      (service ? `I'd like to book: ${service}` : "Book me an appointment");
    setMessages((prev) => [
      ...prev,
      { id: newMsgId(), role: "user", content: userLine },
      {
        id: newMsgId(),
        role: "assistant",
        content: service
          ? `Perfect — please complete the booking form for ${service} below.`
          : "Perfect — please complete the booking form below.",
        form: { service },
      },
    ]);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollChatToBottom(true);
      });
    });
  };

  /** Keep openFormFor for service catalog / detail cards */
  const openFormFor = (service: string) => {
    openBookingChoice(service);
  };

  const chooseFormPath = () => {
    setMessages((prev) => {
      const choice = [...prev].reverse().find((m) => m.bookingChoice && !m.bookingChoice.resolved);
      const service = choice?.bookingChoice?.service || "";
      if (service) setDraft((d) => mergeDraft(d, { service }));
      return prev.map((m) => {
        if (m.bookingChoice && !m.bookingChoice.resolved) {
          return {
            ...m,
            content: "Perfect — please complete the booking form below.",
            bookingChoice: { ...m.bookingChoice, resolved: true },
            form: { service },
          };
        }
        return m;
      });
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollChatToBottom(true);
      });
    });
  };

  const chooseChatPath = () => {
    chatBookingRef.current = true;
    const pending = [...messagesRef.current].reverse().find((m) => m.bookingChoice && !m.bookingChoice.resolved);
    const service = pending?.bookingChoice?.service || "";
    setMessages((prev) => {
      const next = prev.map((m) =>
        m.bookingChoice && !m.bookingChoice.resolved
          ? {
              ...m,
              content: "Great — we'll book through chat. I'll ask for a few details.",
              bookingChoice: { ...m.bookingChoice, resolved: true },
            }
          : m
      );
      messagesRef.current = next;
      return next;
    });
    const prompt = service
      ? `I'd like to book ${service} by chatting with you. Please ask me for the details one by one.`
      : "I'd like to book an appointment by chatting with you. Please ask me for the details one by one.";
    setTimeout(() => send(prompt, { continueChatBooking: true }), 50);
  };

  const switchFormToChat = () => {
    chatBookingRef.current = true;
    setMessages((prev) => {
      const next = prev.map((m) => (m.form && !m.form.done ? { ...m, form: { ...m.form, done: true } } : m));
      messagesRef.current = next;
      return next;
    });
    setTimeout(
      () =>
        send(
          "I'd prefer to finish booking by chatting with you. Please continue asking for any details you still need.",
          { continueChatBooking: true }
        ),
      50
    );
  };

  const showServicesMenu = (userText: string) => {
    setShowSuggestions(false);
    setMessages((prev) => [
      ...prev,
      { id: newMsgId(), role: "user", content: userText },
      {
        id: newMsgId(),
        role: "assistant",
        content: "We offer a full range of dental care — tap a service to learn more or book.",
        showServices: true,
      },
    ]);
  };

  const showServiceDetail = (userText: string, service: string) => {
    setShowSuggestions(false);
    setMessages((prev) => [
      ...prev,
      { id: newMsgId(), role: "user", content: userText },
      {
        id: newMsgId(),
        role: "assistant",
        content: `Here's a quick overview of ${service}:`,
        serviceDetail: service,
      },
    ]);
  };

  const submitForm = () => {
    if (!draftIsComplete(draft) || busy) return;
    setMessages((prev) =>
      prev.map((m) => (m.form && !m.form.done ? { ...m, form: { ...m.form, done: true } } : m))
    );
    const msg = `Please book my appointment. Name: ${draft.name.trim()}. Phone: ${draft.phone.trim()}.${draft.email.trim() ? ` Email: ${draft.email.trim()}.` : ""} Service: ${draft.service}. Preferred time: ${draft.day} at ${draft.time}.`;
    send(msg, { forceBooking: true });
  };

  const handleResponse = (data: {
    reply?: string;
    booking?: Booking;
    triage?: TriageInfo;
    audio?: string;
    transcript?: string;
    bookingDraft?: Partial<BookingDraft>;
    showBookingForm?: boolean;
  }, prevMessages: ChatMsg[]) => {
    let updated = [...prevMessages];
    if (data.transcript) {
      const idx = updated.map((m) => m.content).lastIndexOf("🎤 Voice note…");
      if (idx >= 0) updated[idx] = { ...updated[idx], content: data.transcript };
    }

    const userText = data.transcript || prevMessages[prevMessages.length - 1]?.content || "";
    // Prefer server triage; client fallback only for THIS turn's user text (not sticky re-detect)
    const triagePayload =
      data.triage?.urgent ? data.triage : buildClientTriage(userText);

    let replyText = (data.reply || "").trim();
    if (triagePayload?.urgent) {
      // Replace weak greetings so the patient always gets a real triage response
      if (
        !replyText ||
        (/how can i (help|assist) you/i.test(replyText) && !/(emerg|bleed|urgent|slot|pain)/i.test(replyText)) ||
        (/^hi\b/i.test(replyText) && replyText.length < 80 && !/(emerg|bleed|urgent|slot)/i.test(replyText))
      ) {
        replyText =
          `I'm sorry you're going through this — I'm treating it as urgent. ` +
          `I've alerted the front desk and can hold ${triagePayload.emergencySlot}. ` +
          `Please enter your name and phone below so we can lock that slot` +
          (triagePayload.clinicPhone ? ` (or call ${triagePayload.clinicPhone} now)` : "") +
          `. If this is life-threatening, call 911 first.`;
      }
    }

    const extracted = extractBookingDraft(
      updated.map((m) => ({ role: m.role, content: m.content })),
      SERVICES
    );
    const mergedDraft = mergeDraft(mergeDraft(draftRef.current, extracted), data.bookingDraft || {});
    setDraft(mergedDraft);
    draftRef.current = mergedDraft;

    if (data.booking) chatBookingRef.current = false;
    else if (hasBookingIntent(userText) || mergedDraft.service || mergedDraft.name || mergedDraft.phone) {
      chatBookingRef.current = true;
    }

    const alreadyHasForm = hasOpenForm(updated);
    const shouldOpenForm =
      !alreadyHasForm &&
      !data.booking &&
      (Boolean(data.showBookingForm) ||
        Boolean(triagePayload?.urgent) ||
        /\b(fill (in|out|the) form|tap confirm|booking form)\b/i.test(replyText));

    const interactive = inferInteractiveExtras(mergedDraft, replyText, {
      servicesAsked: isServicesQuery(userText) && !data.booking,
      chatBooking: chatBookingRef.current && !shouldOpenForm,
      bookingDone: Boolean(data.booking),
      formOpen: alreadyHasForm || shouldOpenForm,
    });

    updated.push({
      id: newMsgId(),
      role: "assistant",
      content: interactive.content || replyText || "Sorry, could you say that again?",
      audio: data.audio || undefined,
      ...(interactive.showServices ? { showServices: true } : {}),
      ...(interactive.showSchedule ? { showSchedule: true } : {}),
      ...(interactive.quickReplies ? { quickReplies: interactive.quickReplies } : {}),
      ...(triagePayload?.urgent ? { triage: triagePayload } : {}),
      ...(data.booking
        ? {
            booking: {
              ...data.booking,
              urgent: !!(data.booking.urgent || triagePayload?.urgent),
            },
          }
        : {}),
    });

    if (shouldOpenForm) {
      const seed: Partial<BookingDraft> = { ...(data.bookingDraft || {}) };
      if (triagePayload?.urgent) {
        seed.service = seed.service || "Consultation & Check-up";
        seed.day = seed.day || "Today";
      }
      setDraft((prev) => mergeDraft(prev, seed));
      updated = [
        ...updated.slice(0, -1),
        {
          ...updated[updated.length - 1],
          form: { service: seed.service || "" },
          showServices: undefined,
          showSchedule: undefined,
          quickReplies: undefined,
        },
      ];
    }

    setMessages(updated);
    messagesRef.current = updated;

    if (triagePayload?.urgent && !triageTrackedRef.current) {
      triageTrackedRef.current = true;
      trackEvent("element_click", {
        element_text: "emergency_triage",
        button_location: "ai_receptionist_demo",
        triage_reason: triagePayload.reason,
      });
    }

    if (data.audio) playAudio(data.audio);
    if (data.booking && !bookingTrackedRef.current) {
      bookingTrackedRef.current = true;
      trackDemoComplete({
        demo_type: "ai_receptionist_chat",
        voice_used: voiceUsedRef.current,
        messages_sent: messagesSentRef.current,
        duration: Math.round((Date.now() - demoStartedAtRef.current) / 1000),
      });
      trackEvent("appointment_booking_complete", {
        channel: "chat",
        urgent: !!(data.booking.urgent || triagePayload?.urgent),
      });
      trackEvent("generate_lead", {
        lead_source: triagePayload?.urgent ? "ai_receptionist_emergency" : "ai_receptionist_chat",
      });
    }
  };

  const send = async (text: string, opts?: { voice?: boolean; forceBooking?: boolean; continueChatBooking?: boolean }) => {
    const v = text.trim();
    if (!v || busy) return;
    markDemoStarted(Boolean(opts?.voice));
    messagesSentRef.current += 1;
    setInput("");
    setShowSuggestions(false);
    consumeInteractive();
    focusComposer();

    if (opts?.continueChatBooking) chatBookingRef.current = true;

    if (isServicesQuery(v)) {
      showServicesMenu(v);
      focusComposer();
      return;
    }
    const detailSvc = isServiceDetailQuery(v) || matchServiceName(v);
    if (detailSvc && /tell me about|what is|learn about|about/i.test(v) && !hasBookingIntent(v)) {
      const svc = SERVICES.find((s) => s.toLowerCase().includes(detailSvc.toLowerCase())) || matchServiceName(detailSvc);
      if (svc) {
        showServiceDetail(v, svc);
        focusComposer();
        return;
      }
    }

    // Typed booking intent → open form immediately (same as Book chip)
    if (
      !opts?.forceBooking &&
      !opts?.continueChatBooking &&
      hasBookingIntent(v) &&
      !hasOpenForm(messagesRef.current) &&
      !hasOpenBookingChoice(messagesRef.current)
    ) {
      openBookingChoice(matchServiceName(v) || "", v);
      focusComposer();
      return;
    }

    const next: ChatMsg[] = [
      ...messagesRef.current,
      { id: newMsgId(), role: "user", content: v, voiceNote: opts?.voice },
    ];
    setMessages(next);
    if (hasOpenForm(next)) applyDraftFromMessages(next);
    setBusy(true);

    try {
      const res = await fetch(receptionistUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId: "demo",
          speak: !!opts?.voice,
          bookingDraft: draftRef.current,
          messages: next.filter((m) => m.content),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      handleResponse(data, next);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Please try again.";
      const friendly =
        /failed to fetch|networkerror|load failed|network request failed/i.test(raw)
          ? "Can't reach the booking server right now (network/DNS). Try again on Wi‑Fi with DNS 8.8.8.8, or use a hotspot."
          : raw;
      trackEvent("api_error", {
        api_name: "ai_receptionist_chat",
        error_message: raw,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: newMsgId(),
          role: "assistant",
          content: `😕 ${friendly}`,
        },
      ]);
    } finally {
      setBusy(false);
      focusComposer();
    }
  };
  sendRef.current = send;

  const cancelledRef = useRef(false);

  const stopRecording = () => {
    recorderRef.current?.state === "recording" && recorderRef.current.stop();
  };

  const cancelRecording = () => {
    cancelledRef.current = true;
    stopRecording();
  };

  const startRecording = async () => {
    if (busy || recState !== "idle") return;
    markDemoStarted(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (recTimerRef.current) clearInterval(recTimerRef.current);
        if (cancelledRef.current) {
          cancelledRef.current = false;
          setRecState("idle");
          return;
        }
        setRecState("transcribing");
        try {
          const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
          const b64 = await new Promise<string>((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(String(fr.result).split(",")[1] || "");
            fr.onerror = reject;
            fr.readAsDataURL(blob);
          });

          setShowSuggestions(false);
          setBusy(true);
          const hist = messagesRef.current.filter((m) => m.content && !m.content.startsWith("🎤 Voice note"));
          const pending: ChatMsg[] = [
            ...hist,
            { id: newMsgId(), role: "user", content: "🎤 Voice note…", voiceNote: true },
          ];
          setMessages(pending);
          setRecState("idle");

          const res = await fetch(receptionistUrl(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clinicId: "demo",
              speak: true,
              audio: b64,
              mime: blob.type,
              bookingDraft: draftRef.current,
              messages: hist,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Voice note failed");

          handleResponse(data, pending);
          setBusy(false);
        } catch (err) {
          trackEvent("api_error", {
            api_name: "ai_receptionist_voice_note",
            error_message: err instanceof Error ? err.message : "Voice note failed",
          });
          setRecState("idle");
          setBusy(false);
          setMessages((prev) => [
            ...prev,
            {
              id: newMsgId(),
              role: "assistant",
              content: `🎤 ${err instanceof Error ? err.message : "Couldn't process the voice note."}`,
            },
          ]);
        }
      };
      recorderRef.current = rec;
      cancelledRef.current = false;
      rec.start();
      setRecSeconds(0);
      setRecState("recording");
      recTimerRef.current = setInterval(() => {
        setRecSeconds((s) => {
          if (s + 1 >= MAX_RECORD_SECONDS) stopRecording();
          return s + 1;
        });
      }, 1000);
    } catch {
      trackEvent("demo_error", {
        demo_type: "ai_receptionist_chat",
        error_context: "microphone_permission",
      });
      setMessages((prev) => [
        ...prev,
        {
          id: newMsgId(),
          role: "assistant",
          content: "🎤 I couldn't access your microphone — please allow mic access, or type your message instead.",
        },
      ]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-3 sm:px-4 overflow-x-clip">
      <div className="rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-sm sm:shadow-xl sm:shadow-gray-200/50 overflow-hidden bg-white max-w-full">

        {/* Header */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-4" style={{ background: "linear-gradient(120deg, #06382F, #0E7C6B)" }}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-shrink-0">
              <MayaAvatar size="w-9 h-9 sm:w-11 sm:h-11" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400 border-2 border-[#0B5D50]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <p className="text-sm sm:text-[15px] font-bold text-white leading-tight">Maya</p>
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-white/80 bg-white/10 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> LIVE
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-white/60 leading-tight truncate">Bright Smile Dental Care</p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <LiveCallLauncher />
              <button
                type="button"
                onClick={toggleMute}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors ${muted ? "bg-white/20 text-white" : "bg-white/10 text-white/70 hover:text-white"}`}
                aria-label={muted ? "Unmute Maya's voice" : "Mute Maya's voice"}
              >
                {muted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div
          ref={chatScrollRef}
          className="overflow-y-auto overflow-x-hidden overscroll-contain px-2.5 sm:px-4 py-3 sm:py-5 space-y-3 sm:space-y-4 h-[min(62dvh,520px)] sm:h-[420px]"
          style={{ background: "linear-gradient(180deg, #F4F8F7 0%, #FAFCFB 100%)" }}
        >
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const isBot = m.role === "assistant";
              const showAvatar =
                isBot &&
                !(m.form && !m.form.done) &&
                (m.content ||
                  m.showServices ||
                  m.showSchedule ||
                  m.serviceDetail ||
                  m.triage ||
                  m.booking ||
                  (m.quickReplies && m.quickReplies.length > 0) ||
                  (m.bookingChoice && !m.bookingChoice.resolved));
              const interactiveLive = isBot && !m.interactiveConsumed && !busy;
              return (
                <motion.div
                  key={m.id}
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2 w-full min-w-0 ${isBot ? "justify-start" : "justify-end"}`}
                >
                  {showAvatar ? <MayaAvatar size="w-7 h-7 sm:w-8 sm:h-8" /> : null}
                  <div
                    className={`flex flex-col min-w-0 ${isBot ? "items-start" : "items-end"} ${
                      (m.form && !m.form.done) || (m.showServices && !m.interactiveConsumed) || (m.showSchedule && !m.interactiveConsumed)
                        ? "flex-1 w-full max-w-full"
                        : "max-w-[min(100%,20.5rem)] sm:max-w-[85%]"
                    }`}
                  >
                    {m.content && (
                      <div
                        className={`rounded-2xl px-3.5 py-3 sm:px-4 sm:py-3.5 w-full sm:w-auto ${
                          isBot
                            ? "bg-white border border-gray-100 shadow-sm rounded-tl-md text-left"
                            : "text-white rounded-tr-md shadow-md shadow-[#0E7C6B]/15 text-left"
                        }`}
                        style={!isBot ? { background: "linear-gradient(135deg, #0E7C6B, #14A08A)" } : undefined}
                      >
                        {m.voiceNote && <span className="block text-[10px] opacity-70 mb-1.5 font-medium">🎤 voice note</span>}
                        {isBot ? (
                          <AssistantText text={m.content} />
                        ) : (
                          <p className="text-[13px] sm:text-sm leading-[1.55] whitespace-pre-wrap">{m.content}</p>
                        )}
                        {m.audio && (
                          <button
                            type="button"
                            onClick={() => playAudio(m.audio!, true)}
                            className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-[#0E7C6B] bg-[#0E7C6B]/8 border border-[#0E7C6B]/20 rounded-full px-3 py-1.5 hover:bg-[#0E7C6B]/15 transition-colors"
                          >
                            🔊 Play Maya&apos;s voice reply
                          </button>
                        )}
                      </div>
                    )}
                    {m.bookingChoice && !m.bookingChoice.resolved && (
                      <BookingPathChoice
                        service={m.bookingChoice.service}
                        onForm={chooseFormPath}
                        onChat={chooseChatPath}
                      />
                    )}
                    {m.triage?.urgent && (
                      <div className="mt-2 rounded-2xl rounded-tl-md px-4 py-3.5 bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 shadow-sm max-w-full">
                        <p className="flex items-center gap-1.5 text-sm font-bold text-red-800 mb-1.5">
                          <AlertTriangle className="w-4 h-4" /> Emergency Triage Active
                        </p>
                        <div className="text-xs text-red-700 space-y-1">
                          <p>
                            Flagged: <span className="font-semibold">{m.triage.reason}</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Holding {m.triage.emergencySlot}
                          </p>
                          {m.triage.staffAlerted && (
                            <p className="font-semibold text-red-800">Front desk alerted — priority queue</p>
                          )}
                          {m.triage.clinicPhone && (
                            <p className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> Transfer: {m.triage.clinicPhone}
                            </p>
                          )}
                          {m.triage.guidance && <p className="text-red-600/90 pt-0.5">{m.triage.guidance}</p>}
                        </div>
                      </div>
                    )}
                    {m.booking && (
                      <div
                        className={`mt-2 rounded-2xl rounded-tl-md px-4 py-3.5 shadow-sm max-w-full border ${
                          m.booking.urgent
                            ? "bg-gradient-to-br from-red-50 to-orange-50 border-red-200"
                            : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                        }`}
                      >
                        <p
                          className={`flex items-center gap-1.5 text-sm font-bold mb-1.5 ${
                            m.booking.urgent ? "text-red-800" : "text-green-800"
                          }`}
                        >
                          <CalendarCheck2 className="w-4 h-4" />
                          {m.booking.urgent ? "Emergency Slot Held" : "Appointment Confirmed"}
                        </p>
                        <div className={`text-xs space-y-0.5 ${m.booking.urgent ? "text-red-700" : "text-green-700"}`}>
                          <p>
                            <span className="font-semibold">{m.booking.name}</span> · {m.booking.service}
                          </p>
                          <p className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {m.booking.preferredTime}
                          </p>
                          {m.booking.phone && (
                            <p className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {m.booking.phone}
                            </p>
                          )}
                          <p className="pt-1 leading-snug">
                            Booking confirmed — our team will contact you shortly
                            {m.booking.email ? " by email or phone" : " by phone"}.
                          </p>
                        </div>
                      </div>
                    )}
                    {m.showServices && interactiveLive && (
                      <ServicesCatalog
                        onPick={(s) => {
                          consumeInteractive();
                          showServiceDetail(`Tell me about ${s}`, s);
                        }}
                        onBook={(s) => {
                          consumeInteractive();
                          if (chatBookingRef.current) {
                            send(`I'd like to book ${s}`, { continueChatBooking: true });
                          } else {
                            openFormFor(s);
                          }
                        }}
                      />
                    )}
                    {m.showSchedule && interactiveLive && (
                      <SlotCalendar
                        onPickSlot={(day, time) => {
                          consumeInteractive();
                          setDraft((d) => mergeDraft(d, { day, time }));
                          send(`${day} at ${time}`, { continueChatBooking: true });
                        }}
                      />
                    )}
                    {m.quickReplies && m.quickReplies.length > 0 && interactiveLive && (
                      <QuickReplyChips
                        replies={m.quickReplies}
                        onPick={(value) => {
                          consumeInteractive();
                          send(value, { continueChatBooking: true });
                        }}
                      />
                    )}
                    {m.serviceDetail && (
                      <ServiceDetailCard name={m.serviceDetail} onBook={() => openFormFor(m.serviceDetail!)} />
                    )}
                    {m.form && !m.form.done && (
                      <BookingForm
                        draft={draft}
                        onChange={setDraft}
                        onSubmit={submitForm}
                        busy={busy}
                        onSwitchToChat={switchFormToChat}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {busy && (
            <div className="flex gap-2.5 justify-start">
              <MayaAvatar />
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-md px-4 py-3.5">
                <span className="inline-flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-[#0E7C6B]/50 inline-block"
                      animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }} />
                  ))}
                </span>
              </div>
            </div>
          )}

          {/* Preset chips — stacked full-width on mobile so nothing truncates */}
          {(showSuggestions || messages.length <= 1) && !busy && !hasOpenForm(messages) && (
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 w-full pl-0 sm:pl-10">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => {
                    if (s.action === "book") openBookingChoice();
                    else if (s.action === "services") showServicesMenu(s.label);
                    else if (s.action === "detail" && s.service) showServiceDetail(s.label, s.service);
                    else send(s.label);
                  }}
                  className={`text-left text-[13px] sm:text-xs px-3.5 py-2.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-full border shadow-sm transition-all ${
                    s.label.includes("bleeding")
                      ? "bg-red-50 text-red-700 border-red-200 hover:border-red-400 hover:bg-red-100"
                      : "bg-white text-gray-700 border-gray-200 hover:border-[#0E7C6B]/40 hover:text-[#0E7C6B]"
                  }`}
                >
                  <span className="sm:hidden">{s.icon} {s.shortLabel}</span>
                  <span className="hidden sm:inline">{s.icon} {s.label}</span>
                </button>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <AnimatePresence>
          {speaking && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#0E7C6B]/5 border-t border-[#0E7C6B]/10 px-4 py-2 flex items-center gap-2"
            >
              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>🔊</motion.span>
              <span className="text-xs text-[#0E7C6B] font-semibold flex-1">Maya is speaking…</span>
              <button type="button" onClick={stopSpeaking} className="text-xs font-bold text-[#0E7C6B] bg-white border border-[#0E7C6B]/25 rounded-full px-3 py-1 hover:bg-[#0E7C6B] hover:text-white transition-colors">
                ⏹ Stop
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input.trim());
          }}
          className="bg-white border-t border-gray-100 px-2.5 sm:px-4 py-2.5 sm:py-3.5 flex items-center gap-1.5 sm:gap-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))]"
        >
          {recState === "recording" ? (
            <div className="flex-1 flex items-center gap-2 sm:gap-3 px-2 py-1.5 rounded-full bg-red-50 border border-red-200 min-w-0">
              <button type="button" onClick={cancelRecording} className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors flex-shrink-0" aria-label="Cancel recording">
                <Trash2 className="w-4 h-4" />
              </button>
              <motion.span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} />
              <span className="text-xs sm:text-sm text-red-600 font-semibold flex-1 truncate">
                {String(Math.floor(recSeconds / 60))}:{String(recSeconds % 60).padStart(2, "0")} / 0:30
              </span>
            </div>
          ) : (
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={recState === "transcribing" ? "Transcribing…" : hasOpenForm(messages) ? "Speak or type…" : "Type or tap mic…"}
              disabled={recState === "transcribing"}
              className="flex-1 min-w-0 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-[#F4F8F7] border border-transparent text-sm text-gray-800 outline-none focus:border-[#0E7C6B]/40 focus:bg-white transition-all disabled:opacity-60"
            />
          )}

          <button
            type="button"
            onClick={recState === "recording" ? stopRecording : startRecording}
            disabled={busy || recState === "transcribing"}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 ${
              recState === "recording"
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                : "bg-[#F4F8F7] text-[#0E7C6B] border border-[#0E7C6B]/20 hover:bg-[#0E7C6B]/10"
            }`}
            aria-label={recState === "recording" ? "Stop recording" : "Record a voice note"}
          >
            {recState === "transcribing" ? <Loader2 className="w-4 h-4 animate-spin" /> : recState === "recording" ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            disabled={busy || !input.trim() || recState !== "idle"}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full text-white flex items-center justify-center hover:shadow-lg hover:shadow-[#0E7C6B]/25 transition-all disabled:opacity-40 disabled:shadow-none flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0E7C6B, #14A08A)" }}
            aria-label="Send"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Live demo on a sample clinic · Your clinic gets its own Maya — trained on <span className="font-semibold text-gray-500">your</span> services, prices &amp; hours
      </p>
    </div>
  );
}
