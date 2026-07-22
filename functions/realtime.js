/**
 * Live voice agent (OpenAI Realtime API over WebRTC).
 *
 * realtimeToken: mints a short-lived Realtime session preloaded with the
 *   clinic knowledge base, input transcription (for accurate name/phone/email),
 *   recall_last_spoken_text + booking tools. The browser connects directly
 *   to OpenAI via WebRTC using the ephemeral key — instant speech-to-speech.
 *
 * bookAppointmentHttp: booking endpoint the browser calls when the live
 *   agent decides to book (function calling over the data channel).
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const { getClinic } = require("./lib/clinicKB");
const { checkRateLimit } = require("./lib/cache");
const { bookAndNotify } = require("./lib/booking");
const { applyCors, clientIp } = require("./lib/security");
const {
  lookupPatientMemory,
  patientMemoryContext,
  extractPhoneCandidate,
} = require("./lib/patientMemory");

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");

const CALLS_PER_IP_PER_DAY = 12; // live calls are billed per minute — keep public demos sane
const REALTIME_MODEL = "gpt-realtime-mini";

function liveInstructions(c, memory) {
  const memoryBlock = patientMemoryContext(memory);
  return `You are Maya, the warm, human front-desk receptionist for "${c.name}" in ${c.city}, speaking with a patient on a live voice call from the clinic's website.

VOICE STYLE: natural, friendly, brief — like a real phone receptionist. One or two short sentences per turn. Never sound robotic. If interrupted, stop and listen. Follow PATIENT PREFERENCES language/tone when memory is present.

FACTS YOU KNOW (never invent anything beyond this):
Address: ${c.address}. Phone/WhatsApp: ${c.phone}.
Hours: ${c.hours.weekdays}; Sunday ${c.hours.sunday}. ${c.hours.note}
Doctors: ${c.doctors.map((d) => `${d.name} (${d.role})`).join("; ")}.
Services (describe what each involves — do NOT mention prices unless patient explicitly asks about cost):
${c.services.map((s) => `${s.name}${s.description ? `: ${s.description}` : ""}`).join("; ")}.
Payment: ${c.policies.payment}
Emergencies: ${c.policies.emergency}
${memoryBlock}

EMERGENCY TRIAGE (highest priority — interrupt normal booking script):
If the caller mentions bleeding, severe pain, knocked-out tooth, implant fell out, facial swelling, abscess, or says emergency:
1. Acknowledge urgency calmly in one sentence.
2. Say staff is being alerted and you can hold an emergency slot today if available (offer "today at the next open emergency slot" — e.g. next hour on the hour between 11 AM–5 PM, or tomorrow 10:30 AM if after hours).
3. Offer to transfer them to ${c.phone} for immediate help.
4. If life-threatening (can't breathe, heavy bleeding, unconscious), tell them to call 911 first.
5. Then quickly collect name + phone and book with urgency noted. Do NOT diagnose.

RULES:
- Unknown question → say you'll have a team member confirm; never guess. No medical advice (except emergency triage guidance above).
- Do NOT quote prices unless the patient explicitly asks about cost — then say the team will confirm exact pricing.
- Greet the caller first, briefly. If RETURNING PATIENT MEMORY is present, greet by name and use pending questions/preferences subtly — never invent them.
- Confirm you're speaking to the right person before sharing booking details from memory.

EXACT DETAILS (name, phone, email):
- The caller has an on-screen form. Whatever is filled there is ALREADY CONFIRMED — never read it back, never ask "is that right?", never say "got it — John?".
- Ask for each missing detail at most ONCE. Skip anything already on the form or in confirmed_fields.
- Do NOT use a verbal confirmation loop. When recall_last_spoken_text returns already_confirmed, move to next_step immediately with no read-back.
- If unclear, tell them to type it on screen — then move on.
- Locked fields are FINAL.

BOOKING SCRIPT (skip any step already locked/filled):
1. Service → confirm_field(service)
2. Name — only if not locked
3. Phone — only if not locked
4. Email optional — skip quickly if they decline
5. Day + time → confirm_field(schedule)
Then one summary + "Shall I book that?" → book_appointment.
Never restart. Never re-confirm filled form fields.`;
}

const CONFIRM_FIELD_TOOL = {
  type: "function",
  name: "confirm_field",
  description:
    "Call ONCE after the patient confirms (yes) a read-back, or skips email. Do NOT call confirm_field(phone) again if phone is already confirmed — check confirmed_fields in the last tool response.",
  parameters: {
    type: "object",
    properties: {
      field: {
        type: "string",
        enum: ["name", "phone", "email", "service", "schedule"],
        description: "Which field was just confirmed.",
      },
      confirmed: {
        type: "boolean",
        description: "True if patient said yes to the read-back.",
      },
      email_skipped: {
        type: "boolean",
        description: "True only when patient declines to give email.",
      },
      service: { type: "string", description: "For field=service only — the service name agreed." },
      preferredTime: { type: "string", description: "For field=schedule only — e.g. Saturday at 7:00 PM." },
    },
    required: ["field", "confirmed"],
  },
};

const RECALL_TOOL = {
  type: "function",
  name: "recall_last_spoken_text",
  description:
    "REQUIRED right after the patient speaks their name, phone number, or email — but ONLY if that field is not already confirmed. Returns accurate speech-to-text for read-back. Do NOT call for phone if confirm_field(phone) already succeeded.",
  parameters: {
    type: "object",
    properties: {
      field: {
        type: "string",
        enum: ["name", "phone", "email", "other"],
        description: "Which detail you are confirming.",
      },
    },
    required: ["field"],
  },
};

const BOOK_TOOL = {
  type: "function",
  name: "book_appointment",
  description:
    "Book the patient's appointment only after name, phone, service, and preferred day/time are collected AND the patient has confirmed name and phone (and email if provided). Use the exact confirmed values — never guessed digits.",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string" },
      phone: { type: "string", description: "Confirmed phone number digits as the patient approved." },
      email: { type: "string" },
      service: { type: "string" },
      preferredTime: { type: "string" },
      notes: { type: "string" },
    },
    required: ["name", "phone", "service", "preferredTime"],
  },
};

exports.realtimeToken = onRequest(
  { region: "asia-south1", cors: false, timeoutSeconds: 30, memory: "256MiB", minInstances: 1, secrets: [OPENAI_API_KEY] },
  async (req, res) => {
    if (applyCors(req, res)) return;
    if (req.method !== "POST") { res.status(405).json({ error: "Use POST" }); return; }

    const ip = clientIp(req);
    if (!(await checkRateLimit(ip, CALLS_PER_IP_PER_DAY, "call"))) {
      res.status(429).json({ error: "Daily live-call limit reached — please use the chat instead." });
      return;
    }

    try {
      const clinic = getClinic(req.body?.clinicId);
      const clinicId = req.body?.clinicId || "demo";
      const draft = req.body?.bookingDraft || null;
      let patientMemory = null;
      const phoneGuess = extractPhoneCandidate(draft, []);
      if (phoneGuess) {
        try {
          patientMemory = await lookupPatientMemory(clinicId, phoneGuess);
        } catch (e) {
          console.warn("realtime patient memory lookup failed:", e.message);
        }
      }
      const instructions = liveInstructions(clinic, patientMemory);

      const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY.value()}`,
        },
        body: JSON.stringify({
          expires_after: { anchor: "created_at", seconds: 300 },
          session: {
            type: "realtime",
            model: REALTIME_MODEL,
            instructions,
            audio: {
              input: {
                // Separate STT layer — much more accurate on names / phone digits / emails
                // than the speech-to-speech model alone.
                transcription: {
                  model: "gpt-4o-transcribe",
                  language: "en",
                  prompt:
                    "Expect patient full names, US phone numbers spoken digit-by-digit or in groups, and email addresses spelled with at/dot.",
                },
                noise_reduction: { type: "near_field" },
              },
              output: { voice: "marin" },
            },
            tools: [RECALL_TOOL, CONFIRM_FIELD_TOOL, BOOK_TOOL],
            tool_choice: "auto",
          },
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (!r.ok) throw new Error(`Realtime session ${r.status}: ${(await r.text()).slice(0, 300)}`);
      const session = await r.json();

      res.status(200).json({
        clientSecret: session.value,
        model: REALTIME_MODEL,
        maxSeconds: 180, // client enforces the 3-minute demo cap
        instructions,
      });
    } catch (err) {
      console.error("realtimeToken failed:", err);
      res.status(500).json({ error: "Couldn't start the live call — please try the chat." });
    }
  }
);

exports.bookAppointmentHttp = onRequest(
  {
    region: "asia-south1",
    cors: false,
    timeoutSeconds: 30,
    memory: "256MiB",
    secrets: [GMAIL_USER, GMAIL_APP_PASSWORD],
  },
  async (req, res) => {
    if (applyCors(req, res)) return;
    if (req.method !== "POST") { res.status(405).json({ error: "Use POST" }); return; }

    const ip = clientIp(req);
    if (!(await checkRateLimit(ip, 15, "book"))) {
      res.status(429).json({ error: "Too many bookings today." });
      return;
    }

    try {
      const a = req.body || {};
      if (!a.name || !a.phone || !a.service || !a.preferredTime) {
        res.status(400).json({ error: "Missing booking details." });
        return;
      }
      const clinic = getClinic(a.clinicId);
      const { id, reference } = await bookAndNotify({
        args: {
          name: String(a.name).slice(0, 80),
          phone: String(a.phone).slice(0, 30),
          email: a.email ? String(a.email).slice(0, 120) : "",
          service: String(a.service).slice(0, 80),
          preferredTime: String(a.preferredTime).slice(0, 120),
          notes: a.notes ? String(a.notes).slice(0, 300) : "",
        },
        clinicId: a.clinicId || "demo",
        clinic,
        source: "ai_receptionist_live",
        gmailUser: GMAIL_USER.value(),
        gmailPass: GMAIL_APP_PASSWORD.value(),
      });
      res.status(200).json({ booked: true, id, reference });
    } catch (err) {
      console.error("bookAppointmentHttp failed:", err);
      res.status(500).json({ error: "Booking failed." });
    }
  }
);
