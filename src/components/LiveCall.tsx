"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneOff, Loader2, Mic, CalendarCheck2 } from "lucide-react";
import {
  BookingDraft,
  EMPTY_DRAFT,
  BOOKING_DAYS,
  BOOKING_TIMES,
  extractBookingDraft,
  mergeDraft,
} from "@/lib/bookingExtract";
import { trackDemoComplete, trackDemoStart, trackEvent } from "@/lib/analytics";
import { realtimeTokenUrl, bookUrl } from "@/lib/receptionistEndpoints";

const LIVE_SERVICES = [
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

type CallState = "connecting" | "live" | "ended" | "error";
type RecallField = "name" | "phone" | "email" | "other";

interface Props {
  onClose: () => void;
}

type FnCall = { type?: string; name?: string; call_id?: string; arguments?: string };

type ConfirmationFlags = {
  nameConfirmed: boolean;
  phoneConfirmed: boolean;
  emailConfirmed: boolean | "skipped";
  serviceConfirmed: boolean;
  scheduleConfirmed: boolean;
};

type ConfirmedValues = {
  name: string;
  phone: string;
  email: string;
  service: string;
  preferredTime: string;
};

type RecallSnapshot = {
  text: string;
  digits: string;
  spoken_digits: string;
  spelled_email: string;
};

const EMPTY_CONFIRMED: ConfirmedValues = {
  name: "",
  phone: "",
  email: "",
  service: "",
  preferredTime: "",
};

const EMPTY_FLAGS: ConfirmationFlags = {
  nameConfirmed: false,
  phoneConfirmed: false,
  emailConfirmed: false,
  serviceConfirmed: false,
  scheduleConfirmed: false,
};

const STT_WAIT_MS = 600;
const STT_MAX_WAIT_MS = 2000;

function digitsOnly(text: string) {
  return (text.match(/\d/g) || []).join("");
}

function formatPhoneDigits(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(-10);
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return digits.trim();
}

function normalizeEmailFromSpeech(text: string): string {
  return text
    .trim()
    .replace(/\s+at\s+/gi, "@")
    .replace(/\s+dot\s+/gi, ".")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function spellEmail(email: string): string {
  const normalized = normalizeEmailFromSpeech(email);
  if (!normalized.includes("@")) return normalized;
  const [local, domain] = normalized.split("@");
  const spellPart = (s: string) =>
    s
      .split("")
      .filter(Boolean)
      .map((c) => (c === "." ? "dot" : c))
      .join("-");
  return `${spellPart(local)} at ${spellPart(domain)}`;
}

function groupedSpokenDigits(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length <= 3) return d.split("").join(" ");
  if (d.length <= 6) return `${d.slice(0, 3).split("").join(" ")} , ${d.slice(3).split("").join(" ")}`;
  return `${d.slice(0, 3).split("").join(" ")} , ${d.slice(3, 6).split("").join(" ")} , ${d.slice(6).split("").join(" ")}`;
}

function isNameLike(text: string): boolean {
  const d = digitsOnly(text);
  const words = text.trim().split(/\s+/);
  return (
    d.length < 4 &&
    words.length >= 1 &&
    words.length <= 5 &&
    /[a-zA-Z]/.test(text) &&
    !/^(yes|yeah|yep|no|nope|correct|right|wrong|skip)\b/i.test(text.trim())
  );
}

/** Pick the best user transcript for the field, scoped to utterances since recall was requested. */
function pickTranscript(field: string, recent: string[], sinceIndex = 0): RecallSnapshot {
  const list = recent.slice(sinceIndex).filter(Boolean);
  const reversed = [...list].reverse();
  let text = reversed[0] || "";

  if (field === "phone") {
    const withDigits = reversed.find((t) => digitsOnly(t).length >= 7);
    if (withDigits) text = withDigits;
  } else if (field === "email") {
    const withEmail = reversed.find((t) => /@|\bat\b|\bdot\b/i.test(t));
    if (withEmail) text = withEmail;
  } else if (field === "name") {
    const nameLike = reversed.find(isNameLike);
    if (nameLike) text = nameLike;
  }

  const trimmed = text.trim();
  const digits = digitsOnly(trimmed);
  const normalizedEmail = field === "email" ? normalizeEmailFromSpeech(trimmed) : trimmed;

  return {
    text: field === "email" ? normalizedEmail : trimmed,
    digits,
    spoken_digits: digits ? digits.split("").join(" ") : "",
    spelled_email: field === "email" ? spellEmail(trimmed) : "",
  };
}

function isRecallReady(field: string, picked: RecallSnapshot): boolean {
  if (!picked.text) return false;
  if (field === "phone") return picked.digits.length >= 10;
  if (field === "email") return /@|\bat\b|\bdot\b/i.test(picked.text) || picked.text.length > 5;
  if (field === "name") return picked.text.length >= 2 && isNameLike(picked.text);
  return picked.text.length > 0;
}

function recallInstruction(field: string, picked: RecallSnapshot, ready: boolean): string {
  if (!ready) {
    return "Transcript unclear — ask them to type it in the form on screen. Do NOT ask them to speak it again.";
  }
  // Form already has this value — never do a verbal read-back/confirm
  return `Field captured on screen as "${field === "phone" ? formatPhoneDigits(picked.digits) : picked.text}". It is LOCKED. Do NOT read it back. Do NOT ask "is that right?". Immediately do the next_step only.`;
}

function isFieldLocked(field: string, flags: ConfirmationFlags): boolean {
  if (field === "name") return flags.nameConfirmed;
  if (field === "phone") return flags.phoneConfirmed;
  if (field === "email") return flags.emailConfirmed === true || flags.emailConfirmed === "skipped";
  return false;
}

function nextStepHint(flags: ConfirmationFlags): string {
  if (!flags.nameConfirmed) return "Collect full name only.";
  if (!flags.phoneConfirmed) return "Collect phone number only — one read-back, then confirm_field(phone).";
  if (flags.emailConfirmed !== "skipped" && flags.emailConfirmed !== true) {
    return "Ask for email (optional) or skip it. Do NOT ask for name or phone again.";
  }
  if (!flags.serviceConfirmed) return "Confirm service. Do NOT ask for name or phone again.";
  if (!flags.scheduleConfirmed) return "Collect preferred day and time. Do NOT ask for name or phone again.";
  return "Give one summary, ask 'Shall I book that?', then call book_appointment. Do NOT re-collect name or phone.";
}

function sessionStatus(flags: ConfirmationFlags, confirmed: ConfirmedValues) {
  return {
    confirmed_fields: {
      name: flags.nameConfirmed ? confirmed.name : null,
      phone: flags.phoneConfirmed ? formatPhoneDigits(confirmed.phone) : null,
      email:
        flags.emailConfirmed === "skipped"
          ? "(skipped)"
          : flags.emailConfirmed === true
            ? confirmed.email
            : null,
      service: flags.serviceConfirmed ? confirmed.service : null,
      schedule: flags.scheduleConfirmed ? confirmed.preferredTime : null,
    },
    next_step: nextStepHint(flags),
  };
}

const YES_TRANSCRIPT = /^(yes|yeah|yep|yup|correct|right|that's right|that is right|absolutely|sure|ok|okay)\.?$/i;

async function waitForTranscript(
  field: string,
  getTranscripts: () => string[],
  getSinceIndex: () => number,
  initialCount: number
): Promise<RecallSnapshot> {
  let picked = pickTranscript(field, getTranscripts(), getSinceIndex());
  if (isRecallReady(field, picked)) return picked;

  let waited = 0;
  while (waited < STT_MAX_WAIT_MS) {
    await sleep(STT_WAIT_MS);
    waited += STT_WAIT_MS;
    picked = pickTranscript(field, getTranscripts(), getSinceIndex());
    if (isRecallReady(field, picked)) return picked;
    if (getTranscripts().length > initialCount && picked.text) return picked;
  }
  return picked;
}

function friendlyFetchError(err: unknown, step: string): string {
  if (err instanceof TypeError && /failed to fetch|networkerror/i.test(err.message)) {
    return `Could not reach the server (${step}). Check your connection or try the chat instead.`;
  }
  if (err instanceof Error) return err.message;
  return `Couldn't start the call (${step}).`;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function postJson(url: string, body: unknown, step = "token") {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(friendlyFetchError(err, step));
  }
  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    /* non-JSON body */
  }
  if (!res.ok) throw new Error(String(data.error || `Server error (${res.status})`));
  return data;
}

function buildPreferredTime(draft: BookingDraft, confirmed: ConfirmedValues): string {
  if (draft.day && draft.time) return `${draft.day} at ${draft.time}`;
  return confirmed.preferredTime;
}

function buildBookingPayload(
  draft: BookingDraft,
  confirmed: ConfirmedValues
): { name: string; phone: string; email: string; service: string; preferredTime: string } {
  const phoneDigits = digitsOnly(draft.phone || confirmed.phone);
  return {
    name: (draft.name.trim() || confirmed.name).slice(0, 80),
    phone: formatPhoneDigits(phoneDigits || confirmed.phone).slice(0, 30),
    email: (draft.email.trim() || confirmed.email).slice(0, 120),
    service: (draft.service || confirmed.service).slice(0, 80),
    preferredTime: buildPreferredTime(draft, confirmed).slice(0, 120),
  };
}

function canBook(payload: ReturnType<typeof buildBookingPayload>, flags: ConfirmationFlags, draft: BookingDraft): { ok: boolean; reason: string } {
  if (!payload.name || payload.name.length < 2) {
    return { ok: false, reason: "Name is not confirmed yet. Ask for their full name, recall it, and call confirm_field(name) after they say yes." };
  }
  if (digitsOnly(payload.phone).length < 10) {
    return { ok: false, reason: "Phone is not confirmed yet. Ask for their number, recall it, read it back in digit groups, and call confirm_field(phone) after they say yes." };
  }
  if (!payload.service) {
    return { ok: false, reason: "Service is not confirmed. Ask which service they need and call confirm_field(service)." };
  }
  if (!payload.preferredTime) {
    return { ok: false, reason: "Day and time are not confirmed. Ask for preferred day and time, then call confirm_field(schedule)." };
  }

  const nameOk = flags.nameConfirmed || draft.name.trim().length >= 2;
  const phoneOk = flags.phoneConfirmed || digitsOnly(draft.phone).length >= 10;
  const emailOk =
    !payload.email ||
    flags.emailConfirmed === true ||
    flags.emailConfirmed === "skipped";
  const emailHandled = flags.emailConfirmed === "skipped" || flags.emailConfirmed === true || !payload.email;
  const serviceOk = flags.serviceConfirmed || !!draft.service;
  const scheduleOk = flags.scheduleConfirmed || (!!draft.day && !!draft.time);

  if (!nameOk) {
    return { ok: false, reason: "Name has not been confirmed. Use recall_last_spoken_text then confirm_field(name) after they say yes, or ask them to type it on screen." };
  }
  if (!phoneOk) {
    return { ok: false, reason: "Phone has not been confirmed. Use recall_last_spoken_text then confirm_field(phone) after they say yes, or ask them to type it on screen." };
  }
  if (payload.email && flags.emailConfirmed !== true) {
    return { ok: false, reason: "Email was given but not confirmed. Spell it back letter-by-letter and call confirm_field(email)." };
  }
  if (!emailHandled) {
    return { ok: false, reason: "Ask if they want to provide an email. If they decline, call confirm_field(email) with email_skipped true." };
  }
  if (!serviceOk) {
    return { ok: false, reason: "Service is not confirmed. Call confirm_field(service) after they choose a service." };
  }
  if (!scheduleOk) {
    return { ok: false, reason: "Schedule is not confirmed. Call confirm_field(schedule) after day and time are agreed." };
  }
  return { ok: true, reason: "" };
}

export default function LiveCall({ onClose }: Props) {
  const [state, setState] = useState<CallState>("connecting");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [maxSeconds, setMaxSeconds] = useState(180);
  const [caption, setCaption] = useState("");
  const [mayaTalking, setMayaTalking] = useState(false);
  const [booked, setBooked] = useState<string | null>(null);
  const [draft, setDraft] = useState<BookingDraft>({ ...EMPTY_DRAFT });

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captionRef = useRef("");
  const userTranscriptsRef = useRef<string[]>([]);
  const recallSinceIndexRef = useRef(0);
  const lastRecallRef = useRef<Partial<Record<RecallField, RecallSnapshot>>>({});
  const confirmedValuesRef = useRef<ConfirmedValues>({ ...EMPTY_CONFIRMED });
  const confirmationFlagsRef = useRef<ConfirmationFlags>({ ...EMPTY_FLAGS });
  const draftRef = useRef<BookingDraft>({ ...EMPTY_DRAFT });
  const dcRef = useRef<RTCDataChannel | null>(null);
  const instructionsRef = useRef("");
  const hangUpRef = useRef<() => void>(() => {});
  const pendingRecallRef = useRef<{ field: RecallField } | null>(null);
  const bookingTrackedRef = useRef(false);
  const secondsRef = useRef(0);
  const typedNotifyRef = useRef<{ name: boolean; phone: boolean; email: boolean }>({
    name: false,
    phone: false,
    email: false,
  });

  draftRef.current = draft;
  secondsRef.current = seconds;

  /** Push locked form state into the live session so Maya stops re-asking — silent update only. */
  const pushFormLockToMaya = useCallback((justLocked: ("name" | "phone" | "email")[]) => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== "open" || !justLocked.length) return;
    const flags = confirmationFlagsRef.current;
    const confirmed = confirmedValuesRef.current;
    const status = sessionStatus(flags, confirmed);
    const lockLines = Object.entries(status.confirmed_fields)
      .filter(([, v]) => v)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n");

    try {
      // session.update only — do NOT response.create (that makes Maya verbally re-confirm)
      dc.send(
        JSON.stringify({
          type: "session.update",
          session: {
            type: "realtime",
            instructions: `${instructionsRef.current || "You are Maya, a clinic receptionist."}

LOCKED ON-SCREEN FORM (already confirmed by the patient — NEVER re-ask, NEVER read back, NEVER say "got it — is that right?"):
${lockLines || "- (none)"}
NEXT REQUIRED STEP: ${status.next_step}
When you next speak, skip every locked field entirely. Do not acknowledge locked name/phone/email. Only pursue NEXT REQUIRED STEP.`,
          },
        })
      );
    } catch {
      /* channel closed */
    }
  }, []);

  /** Auto-lock completed form fields and optionally notify Maya. */
  const lockCompletedFields = useCallback(
    (next: BookingDraft, opts?: { notify?: boolean }) => {
      const flags = { ...confirmationFlagsRef.current };
      const confirmed = { ...confirmedValuesRef.current };
      const justLocked: ("name" | "phone" | "email")[] = [];

      if (!flags.nameConfirmed && next.name.trim().length >= 2) {
        flags.nameConfirmed = true;
        confirmed.name = next.name.trim();
        if (!typedNotifyRef.current.name) {
          typedNotifyRef.current.name = true;
          justLocked.push("name");
        }
      }
      if (!flags.phoneConfirmed && digitsOnly(next.phone).length >= 10) {
        flags.phoneConfirmed = true;
        confirmed.phone = digitsOnly(next.phone);
        if (!typedNotifyRef.current.phone) {
          typedNotifyRef.current.phone = true;
          justLocked.push("phone");
        }
      }
      if (flags.emailConfirmed !== true && flags.emailConfirmed !== "skipped" && next.email.trim().includes("@")) {
        flags.emailConfirmed = true;
        confirmed.email = normalizeEmailFromSpeech(next.email);
        if (!typedNotifyRef.current.email) {
          typedNotifyRef.current.email = true;
          justLocked.push("email");
        }
      }
      if (!flags.serviceConfirmed && next.service.trim()) {
        flags.serviceConfirmed = true;
        confirmed.service = next.service.trim();
      }
      if (!flags.scheduleConfirmed && next.day && next.time) {
        flags.scheduleConfirmed = true;
        confirmed.preferredTime = `${next.day} at ${next.time}`;
      }

      confirmationFlagsRef.current = flags;
      confirmedValuesRef.current = confirmed;
      if (opts?.notify !== false && justLocked.length) {
        queueMicrotask(() => pushFormLockToMaya(justLocked));
      }
      return justLocked;
    },
    [pushFormLockToMaya]
  );

  useEffect(() => {
    trackDemoStart({ demo_type: "ai_receptionist_voice", voice_used: true });
    trackEvent("appointment_booking_start", { channel: "voice" });
  }, []);

  const applyFieldConfirm = useCallback((field: RecallField | "service" | "schedule", opts?: { emailSkipped?: boolean }) => {
    const flags = { ...confirmationFlagsRef.current };
    const confirmed = { ...confirmedValuesRef.current };

    if (field === "name" && lastRecallRef.current.name?.text) {
      flags.nameConfirmed = true;
      confirmed.name = lastRecallRef.current.name.text;
      setDraft((d) => mergeDraft(d, { name: confirmed.name }));
    } else if (field === "phone" && lastRecallRef.current.phone?.digits) {
      flags.phoneConfirmed = true;
      confirmed.phone = lastRecallRef.current.phone.digits;
      setDraft((d) => mergeDraft(d, { phone: formatPhoneDigits(confirmed.phone) }));
    } else if (field === "email") {
      if (opts?.emailSkipped) {
        flags.emailConfirmed = "skipped";
        confirmed.email = "";
        setDraft((d) => ({ ...d, email: "" }));
      } else if (lastRecallRef.current.email?.text) {
        flags.emailConfirmed = true;
        confirmed.email = lastRecallRef.current.email.text;
        setDraft((d) => mergeDraft(d, { email: confirmed.email }));
      }
    }

    confirmationFlagsRef.current = flags;
    confirmedValuesRef.current = confirmed;
    pendingRecallRef.current = null;
    return { flags, confirmed };
  }, []);

  /** Fill on-screen form from speech, then auto-lock completed fields. */
  const syncDraftFromSpeech = useCallback(
    (transcripts: string[]) => {
      const msgs = transcripts.map((t) => ({ role: "user", content: t }));
      const extracted = extractBookingDraft(msgs, LIVE_SERVICES);
      const last = (transcripts[transcripts.length - 1] || "").trim();
      const flags = confirmationFlagsRef.current;

      setDraft((prev) => {
        const patch: Partial<BookingDraft> = {};

        if (!flags.nameConfirmed) {
          if (extracted.name) patch.name = extracted.name;
          else if (
            isNameLike(last) &&
            last.split(/\s+/).length <= 3 &&
            !/\b(book|appointment|need|want|have|pain|tooth|bleed|call|phone|email|today|tomorrow)\b/i.test(last)
          ) {
            patch.name = last;
          }
        }
        if (!flags.phoneConfirmed) {
          if (extracted.phone) patch.phone = extracted.phone;
          else if (digitsOnly(last).length >= 10) patch.phone = formatPhoneDigits(digitsOnly(last));
        }
        if (flags.emailConfirmed !== true && flags.emailConfirmed !== "skipped") {
          if (extracted.email) patch.email = extracted.email;
          else if (/@|\bat\b.*\bdot\b/i.test(last)) patch.email = normalizeEmailFromSpeech(last);
        }
        if (!flags.serviceConfirmed && extracted.service) patch.service = extracted.service;
        if (!flags.scheduleConfirmed) {
          if (extracted.day) patch.day = extracted.day;
          if (extracted.time) patch.time = extracted.time;
        }

        const next = mergeDraft(prev, patch);
        draftRef.current = next;
        lockCompletedFields(next);
        return next;
      });
    },
    [lockCompletedFields]
  );

  const updateDraftField = useCallback(
    (field: keyof BookingDraft, value: string) => {
      setDraft((d) => {
        const next = { ...d, [field]: value };
        draftRef.current = next;

        if (field === "name" && value.trim().length < 2) typedNotifyRef.current.name = false;
        if (field === "phone" && digitsOnly(value).length < 10) typedNotifyRef.current.phone = false;
        if (field === "email" && !value.trim()) typedNotifyRef.current.email = false;

        // Clear confirm flags when user empties a field
        const flags = { ...confirmationFlagsRef.current };
        const confirmed = { ...confirmedValuesRef.current };
        if (field === "name" && value.trim().length < 2) {
          flags.nameConfirmed = false;
          confirmed.name = "";
        }
        if (field === "phone" && digitsOnly(value).length < 10) {
          flags.phoneConfirmed = false;
          confirmed.phone = "";
        }
        if (field === "email" && !value.trim()) {
          flags.emailConfirmed = "skipped";
          confirmed.email = "";
        }
        if (field === "service" && !value.trim()) {
          flags.serviceConfirmed = false;
          confirmed.service = "";
        }
        if ((field === "day" || field === "time") && !(next.day && next.time)) {
          flags.scheduleConfirmed = false;
          confirmed.preferredTime = "";
        }
        confirmationFlagsRef.current = flags;
        confirmedValuesRef.current = confirmed;

        lockCompletedFields(next);
        return next;
      });
    },
    [lockCompletedFields]
  );

  const hangUp = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    dcRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    setState((s) => (s === "error" ? s : "ended"));
  }, []);

  hangUpRef.current = hangUp;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const tokenData = await postJson(
          realtimeTokenUrl(),
          { clinicId: "demo", bookingDraft: draftRef.current },
          "session"
        );
        const clientSecret = String(tokenData.clientSecret || "");
        const model = String(tokenData.model || "gpt-realtime-mini");
        const callMaxSeconds = Number(tokenData.maxSeconds) || 180;
        instructionsRef.current = String(tokenData.instructions || "");
        if (!clientSecret) throw new Error("No session token — please try the chat.");
        if (cancelled) return;
        setMaxSeconds(callMaxSeconds);

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pcRef.current = pc;

        const remote = new Audio();
        remote.autoplay = true;
        audioRef.current = remote;
        pc.ontrack = (e) => {
          remote.srcObject = e.streams[0];
        };

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
          throw new Error("Microphone access is required for live calls — please allow mic access and try again.");
        });
        streamRef.current = stream;
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        const dc = pc.createDataChannel("oai-events");
        dcRef.current = dc;
        dc.onclose = () => {
          if (dcRef.current === dc) dcRef.current = null;
        };
        dc.onmessage = async (e) => {
          try {
            const ev = JSON.parse(e.data);

            if (ev.type === "conversation.item.input_audio_transcription.completed") {
              const t = String(ev.transcript || "").trim();
              if (t) {
                userTranscriptsRef.current = [...userTranscriptsRef.current.slice(-11), t];
                syncDraftFromSpeech(userTranscriptsRef.current);

                const pending = pendingRecallRef.current;
                if (pending && YES_TRANSCRIPT.test(t)) {
                  const flags = confirmationFlagsRef.current;
                  if (pending.field === "name" && !flags.nameConfirmed) applyFieldConfirm("name");
                  else if (pending.field === "phone" && !flags.phoneConfirmed) applyFieldConfirm("phone");
                  else if (pending.field === "email" && flags.emailConfirmed !== true && flags.emailConfirmed !== "skipped") {
                    applyFieldConfirm("email");
                  }
                }
              }
            }

            if (ev.type === "response.audio_transcript.delta" || ev.type === "response.output_audio_transcript.delta") {
              captionRef.current += ev.delta || "";
              setCaption(captionRef.current.slice(-160));
              setMayaTalking(true);
            }
            if (ev.type === "response.done") {
              setMayaTalking(false);
              captionRef.current = "";
              const calls = (ev.response?.output || []).filter(
                (o: FnCall) => o.type === "function_call" && o.name && o.call_id
              ) as FnCall[];
              if (!calls.length) return;

              for (const call of calls) {
                if (call.name === "recall_last_spoken_text") {
                  let args: { field?: string } = {};
                  try {
                    args = JSON.parse(call.arguments || "{}");
                  } catch {
                    /* ignore */
                  }
                  const field = (args.field || "other") as RecallField;
                  const flags = confirmationFlagsRef.current;
                  const confirmed = confirmedValuesRef.current;
                  const currentDraft = draftRef.current;

                  // Prefer already-filled on-screen form over waiting for another spoken answer
                  if (!isFieldLocked(field, flags)) {
                    if (field === "name" && currentDraft.name.trim().length >= 2) {
                      flags.nameConfirmed = true;
                      confirmed.name = currentDraft.name.trim();
                      confirmationFlagsRef.current = flags;
                      confirmedValuesRef.current = confirmed;
                      typedNotifyRef.current.name = true;
                    } else if (field === "phone" && digitsOnly(currentDraft.phone).length >= 10) {
                      flags.phoneConfirmed = true;
                      confirmed.phone = digitsOnly(currentDraft.phone);
                      confirmationFlagsRef.current = flags;
                      confirmedValuesRef.current = confirmed;
                      typedNotifyRef.current.phone = true;
                    } else if (field === "email" && currentDraft.email.trim().includes("@")) {
                      flags.emailConfirmed = true;
                      confirmed.email = normalizeEmailFromSpeech(currentDraft.email);
                      confirmationFlagsRef.current = flags;
                      confirmedValuesRef.current = confirmed;
                      typedNotifyRef.current.email = true;
                    }
                  }

                  if (isFieldLocked(field, confirmationFlagsRef.current)) {
                    const status = sessionStatus(flags, confirmed);
                    const lockedPhone = formatPhoneDigits(confirmed.phone);
                    const output = {
                      ready: true,
                      field,
                      already_confirmed: true,
                      text: field === "phone" ? lockedPhone : field === "name" ? confirmed.name : confirmed.email,
                      instruction: `STOP — ${field} is already confirmed and locked. Do NOT ask for or read back ${field} again. ${status.next_step}`,
                      ...status,
                    };
                    dc.send(
                      JSON.stringify({
                        type: "conversation.item.create",
                        item: { type: "function_call_output", call_id: call.call_id, output: JSON.stringify(output) },
                      })
                    );
                    continue;
                  }

                  recallSinceIndexRef.current = Math.max(0, userTranscriptsRef.current.length - 1);
                  const initialCount = userTranscriptsRef.current.length;

                  const picked = await waitForTranscript(
                    field,
                    () => userTranscriptsRef.current,
                    () => recallSinceIndexRef.current,
                    initialCount
                  );

                  if (field === "name" || field === "phone" || field === "email") {
                    lastRecallRef.current[field] = picked;
                  }

                  const ready = isRecallReady(field, picked);

                  if (ready && field === "name" && !flags.nameConfirmed) {
                    const next = mergeDraft(draftRef.current, { name: picked.text });
                    draftRef.current = next;
                    setDraft(next);
                    lockCompletedFields(next, { notify: true });
                  } else if (ready && field === "phone" && !flags.phoneConfirmed) {
                    const next = mergeDraft(draftRef.current, { phone: formatPhoneDigits(picked.digits) });
                    draftRef.current = next;
                    setDraft(next);
                    lockCompletedFields(next, { notify: true });
                  } else if (ready && field === "email" && flags.emailConfirmed !== true && flags.emailConfirmed !== "skipped") {
                    const next = mergeDraft(draftRef.current, { email: picked.text });
                    draftRef.current = next;
                    setDraft(next);
                    lockCompletedFields(next, { notify: true });
                  }

                  // Auto-lock from speech — no verbal "is that right?" loop
                  if (ready && (field === "name" || field === "phone" || field === "email")) {
                    pendingRecallRef.current = null;
                    const status = sessionStatus(confirmationFlagsRef.current, confirmedValuesRef.current);
                    const display =
                      field === "phone"
                        ? formatPhoneDigits(picked.digits)
                        : field === "email"
                          ? picked.text
                          : picked.text;
                    const output = {
                      ready: true,
                      field,
                      already_confirmed: true,
                      text: display,
                      digits: picked.digits,
                      instruction: `LOCKED on form as "${display}". Do NOT read back. Do NOT ask for confirmation. Immediately: ${status.next_step}`,
                      ...status,
                    };
                    dc.send(
                      JSON.stringify({
                        type: "conversation.item.create",
                        item: { type: "function_call_output", call_id: call.call_id, output: JSON.stringify(output) },
                      })
                    );
                    continue;
                  }

                  const status = sessionStatus(confirmationFlagsRef.current, confirmedValuesRef.current);
                  const output = {
                    ready,
                    field,
                    text: picked.text,
                    digits: picked.digits,
                    spoken_digits: picked.spoken_digits,
                    grouped_spoken_digits: groupedSpokenDigits(picked.digits),
                    spelled_email: picked.spelled_email,
                    instruction: recallInstruction(field, picked, ready),
                    ...status,
                  };
                  dc.send(
                    JSON.stringify({
                      type: "conversation.item.create",
                      item: { type: "function_call_output", call_id: call.call_id, output: JSON.stringify(output) },
                    })
                  );
                  continue;
                }

                if (call.name === "confirm_field") {
                  let args: {
                    field?: string;
                    confirmed?: boolean;
                    email_skipped?: boolean;
                    service?: string;
                    preferredTime?: string;
                  } = {};
                  try {
                    args = JSON.parse(call.arguments || "{}");
                  } catch {
                    /* ignore */
                  }

                  const flags = { ...confirmationFlagsRef.current };
                  const confirmed = { ...confirmedValuesRef.current };
                  const currentDraft = draftRef.current;
                  let output: Record<string, unknown> = { success: false, field: args.field };

                  if (args.field === "name" && flags.nameConfirmed) {
                    output = {
                      success: true,
                      already_confirmed: true,
                      field: "name",
                      value: confirmed.name,
                      instruction: "Name already confirmed. Do NOT ask again. " + nextStepHint(flags),
                      ...sessionStatus(flags, confirmed),
                    };
                  } else if (
                    args.field === "name" &&
                    args.confirmed &&
                    (lastRecallRef.current.name?.text || currentDraft.name.trim().length >= 2)
                  ) {
                    flags.nameConfirmed = true;
                    confirmed.name = (lastRecallRef.current.name?.text || currentDraft.name).trim();
                    setDraft((d) => mergeDraft(d, { name: confirmed.name }));
                    pendingRecallRef.current = null;
                    typedNotifyRef.current.name = true;
                    output = {
                      success: true,
                      field: "name",
                      value: confirmed.name,
                      locked: true,
                      instruction: "Name is locked. Do NOT ask for name again. Ask for phone number next.",
                      ...sessionStatus(flags, confirmed),
                    };
                  } else if (args.field === "phone" && flags.phoneConfirmed) {
                    output = {
                      success: true,
                      already_confirmed: true,
                      field: "phone",
                      value: formatPhoneDigits(confirmed.phone),
                      instruction: "Phone already confirmed. Do NOT mention phone again. " + nextStepHint(flags),
                      ...sessionStatus(flags, confirmed),
                    };
                  } else if (
                    args.field === "phone" &&
                    args.confirmed &&
                    (lastRecallRef.current.phone?.digits || digitsOnly(currentDraft.phone).length >= 10)
                  ) {
                    flags.phoneConfirmed = true;
                    confirmed.phone = lastRecallRef.current.phone?.digits || digitsOnly(currentDraft.phone);
                    setDraft((d) => mergeDraft(d, { phone: formatPhoneDigits(confirmed.phone) }));
                    pendingRecallRef.current = null;
                    typedNotifyRef.current.phone = true;
                    output = {
                      success: true,
                      field: "phone",
                      value: formatPhoneDigits(confirmed.phone),
                      locked: true,
                      instruction: "Phone is locked. Do NOT ask for or read back the phone number again. Ask about email (optional) or preferred day and time next.",
                      ...sessionStatus(flags, confirmed),
                    };
                  } else if (args.field === "email") {
                    if (args.email_skipped) {
                      flags.emailConfirmed = "skipped";
                      confirmed.email = "";
                      setDraft((d) => ({ ...d, email: "" }));
                      output = { success: true, field: "email", skipped: true };
                    } else if (args.confirmed && lastRecallRef.current.email?.text) {
                      flags.emailConfirmed = true;
                      confirmed.email = lastRecallRef.current.email.text;
                      setDraft((d) => mergeDraft(d, { email: confirmed.email }));
                      output = { success: true, field: "email", value: confirmed.email };
                    }
                  } else if (args.field === "service" && args.confirmed) {
                    const svc = (currentDraft.service || args.service || "").trim();
                    if (svc) {
                      flags.serviceConfirmed = true;
                      confirmed.service = svc;
                      setDraft((d) => mergeDraft(d, { service: svc }));
                      output = { success: true, field: "service", value: svc };
                    }
                  } else if (args.field === "schedule" && args.confirmed) {
                    const pref =
                      currentDraft.day && currentDraft.time
                        ? `${currentDraft.day} at ${currentDraft.time}`
                        : (args.preferredTime || "").trim();
                    if (pref) {
                      flags.scheduleConfirmed = true;
                      confirmed.preferredTime = pref;
                      output = { success: true, field: "schedule", value: pref };
                    }
                  } else if (!args.confirmed) {
                    if (args.field === "name") flags.nameConfirmed = false;
                    if (args.field === "phone") flags.phoneConfirmed = false;
                    if (args.field === "email") flags.emailConfirmed = false;
                    output = { success: true, field: args.field, corrected: true };
                  }

                  confirmationFlagsRef.current = flags;
                  confirmedValuesRef.current = confirmed;
                  dc.send(
                    JSON.stringify({
                      type: "conversation.item.create",
                      item: { type: "function_call_output", call_id: call.call_id, output: JSON.stringify(output) },
                    })
                  );
                }

                if (call.name === "book_appointment") {
                  const llmArgs = JSON.parse(call.arguments || "{}");
                  const payload = buildBookingPayload(draftRef.current, confirmedValuesRef.current);
                  const gate = canBook(payload, confirmationFlagsRef.current, draftRef.current);

                  let output: Record<string, unknown> = { booked: false, reference: "" };

                  if (!gate.ok) {
                    output = { booked: false, reason: gate.reason };
                  } else {
                    try {
                      const br = await fetch(bookUrl(), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: payload.name,
                          phone: payload.phone,
                          email: payload.email,
                          service: payload.service,
                          preferredTime: payload.preferredTime,
                          notes: llmArgs.notes ? String(llmArgs.notes).slice(0, 300) : "",
                          clinicId: "demo",
                        }),
                      });
                      const bd = await br.json();
                      if (br.ok && bd.booked) {
                        output = { booked: true, reference: bd.reference };
                        const bookedLabel = `${payload.service} · ${payload.preferredTime} (Ref ${bd.reference})`;
                        setBooked(bookedLabel);
                        if (!bookingTrackedRef.current) {
                          bookingTrackedRef.current = true;
                          trackDemoComplete({
                            demo_type: "ai_receptionist_voice",
                            voice_used: true,
                            messages_sent: userTranscriptsRef.current.length,
                            duration: secondsRef.current,
                          });
                          trackEvent("appointment_booking_complete", { channel: "voice" });
                          trackEvent("generate_lead", { lead_source: "ai_receptionist_voice" });
                        }
                        // End call shortly after booking so Maya can finish her confirmation line.
                        setTimeout(() => hangUpRef.current(), 3000);
                      } else {
                        output = { booked: false, reason: bd.error || "Booking failed." };
                      }
                    } catch {
                      output = { booked: false, reason: "Could not reach booking server." };
                    }
                  }

                  dc.send(
                    JSON.stringify({
                      type: "conversation.item.create",
                      item: { type: "function_call_output", call_id: call.call_id, output: JSON.stringify(output) },
                    })
                  );
                }
              }

              dc.send(JSON.stringify({ type: "response.create" }));
            }
          } catch {
            /* non-JSON frames ignored */
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        let sdpRes: Response;
        try {
          sdpRes = await fetch(`https://api.openai.com/v1/realtime/calls?model=${model}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${clientSecret}`, "Content-Type": "application/sdp" },
            body: offer.sdp,
          });
        } catch (err) {
          throw new Error(friendlyFetchError(err, "voice connection"));
        }
        if (!sdpRes.ok) {
          const detail = (await sdpRes.text()).slice(0, 120);
          throw new Error(`Voice connection failed (${sdpRes.status})${detail ? `: ${detail}` : ""}`);
        }
        await pc.setRemoteDescription({ type: "answer", sdp: await sdpRes.text() });
        if (cancelled) return;

        // Reinforce anti-loop rules client-side (works even if functions deploy is pending)
        const boost = `
LOCKED FORM RULES (highest priority):
- On-screen Name / Phone / Email that are filled are ALREADY CONFIRMED.
- NEVER read them back. NEVER ask "is that right?" or "got it — …?".
- Ask each missing question at most once. Skip locked fields entirely.
- If unclear, ask them to type on screen — do not loop.
`;
        const base = instructionsRef.current || "You are Maya, a clinic receptionist.";
        instructionsRef.current = `${base}\n${boost}`;
        const sendBoost = () => {
          if (dc.readyState === "open") {
            dc.send(
              JSON.stringify({
                type: "session.update",
                session: { type: "realtime", instructions: instructionsRef.current },
              })
            );
          }
        };
        if (dc.readyState === "open") sendBoost();
        else dc.addEventListener("open", sendBoost, { once: true });

        setState("live");
        timerRef.current = setInterval(() => {
          setSeconds((s) => {
            if (s + 1 >= callMaxSeconds) hangUp();
            return s + 1;
          });
        }, 1000);
      } catch (err) {
        if (cancelled) return;
        trackEvent("api_error", {
          api_name: "ai_receptionist_voice",
          error_message: err instanceof Error ? err.message : "Voice call failed",
        });
        setError(err instanceof Error ? err.message : "Couldn't start the call.");
        setState("error");
      }
    })();

    return () => {
      cancelled = true;
      hangUp();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mm = String(Math.floor(seconds / 60));
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={state !== "live" && state !== "connecting" ? onClose : undefined}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full sm:max-w-sm max-h-[92dvh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-y-auto overflow-x-hidden shadow-2xl text-center"
        style={{ background: "linear-gradient(160deg, #06382F, #0B5D50)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-6 sm:pt-8 pb-4 px-4 sm:px-6">
          <div className="relative inline-block mb-3 sm:mb-4">
            <motion.div
              className="absolute inset-0 rounded-full bg-[#14A08A]"
              animate={mayaTalking ? { scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] } : { scale: 1, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#0E7C6B] to-[#14A08A] flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-4 border-white/20">
              M
            </div>
          </div>

          <p className="text-xl font-bold text-white">Maya</p>
          <p className="text-xs text-white/60 mb-4">Bright Smile Dental Care · Live Call</p>

          {state === "connecting" && (
            <p className="flex items-center justify-center gap-2 text-sm text-white/70">
              <Loader2 className="w-4 h-4 animate-spin" /> Connecting…
            </p>
          )}

          {state === "live" && (
            <>
              <p className="text-2xl font-mono text-white mb-1">{mm}:{ss}</p>
              <p className="text-[11px] text-white/60 mb-4">demo call · max {Math.round(maxSeconds / 60)} min</p>
              <p className="flex items-center justify-center gap-2 text-xs text-white/60 mb-3">
                <Mic className="w-3.5 h-3.5 text-green-400" />{" "}
                {mayaTalking ? "Maya is speaking — you can interrupt" : "Listening… just talk"}
              </p>
              {caption && (
                <p className="text-xs text-white/70 bg-white/10 rounded-xl px-3 py-2 min-h-[36px] italic">
                  &ldquo;…{caption}&rdquo;
                </p>
              )}
              {booked && (
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-green-300 bg-green-500/10 border border-green-400/30 rounded-full px-3 py-2">
                  <CalendarCheck2 className="w-3.5 h-3.5" /> Booked: {booked}
                </p>
              )}

              <div className="mt-4 text-left bg-white/10 rounded-2xl p-3 space-y-2 border border-white/10">
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-wide">Your details (speak or type)</p>
                <input
                  value={draft.name}
                  onChange={(e) => updateDraftField("name", e.target.value)}
                  placeholder="Name"
                  className="w-full px-3 py-2 rounded-lg bg-white/95 text-sm text-gray-800 outline-none"
                />
                <input
                  value={draft.phone}
                  onChange={(e) => updateDraftField("phone", e.target.value)}
                  placeholder="Phone"
                  inputMode="tel"
                  className="w-full px-3 py-2 rounded-lg bg-white/95 text-sm text-gray-800 outline-none"
                />
                <input
                  value={draft.email}
                  onChange={(e) => updateDraftField("email", e.target.value)}
                  placeholder="Email (optional)"
                  className="w-full px-3 py-2 rounded-lg bg-white/95 text-sm text-gray-800 outline-none"
                />
                <select
                  value={draft.service}
                  onChange={(e) => updateDraftField("service", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/95 text-sm text-gray-800 outline-none"
                >
                  <option value="">Service</option>
                  {LIVE_SERVICES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={draft.day}
                    onChange={(e) => updateDraftField("day", e.target.value)}
                    className="w-full px-2 py-2 rounded-lg bg-white/95 text-xs text-gray-800 outline-none"
                  >
                    <option value="">Day</option>
                    {BOOKING_DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <select
                    value={draft.time}
                    onChange={(e) => updateDraftField("time", e.target.value)}
                    className="w-full px-2 py-2 rounded-lg bg-white/95 text-xs text-gray-800 outline-none"
                  >
                    <option value="">Time</option>
                    {BOOKING_TIMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {state === "ended" && (
            <div className="text-sm text-white/70">
              <p className="mb-1">Call ended · {mm}:{ss}</p>
              {booked && <p className="text-green-300 text-xs">✓ Appointment booked: {booked}</p>}
            </div>
          )}

          {state === "error" && <p className="text-sm text-red-300">{error}</p>}
        </div>

        <div className="pb-6 flex items-center justify-center gap-4">
          {state === "live" || state === "connecting" ? (
            <button
              onClick={() => {
                hangUp();
              }}
              className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors"
              aria-label="End call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function LiveCallLauncher() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-white bg-white/15 hover:bg-white/25 border border-white/20 rounded-full px-2.5 sm:px-3 py-1.5 transition-colors whitespace-nowrap"
      >
        <span aria-hidden>📞</span>
        <span>Live</span>
      </button>
      <AnimatePresence>{open && <LiveCall onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
