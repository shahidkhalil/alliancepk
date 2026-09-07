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

VOICE STYLE: natural, friendly, brief — like a real phone receptionist. One or two short sentences per turn. Never sound robotic. If interrupted, stop and listen.

LANGUAGE LOCK (critical — never break this):
- Supported languages: English and Urdu (including Roman Urdu / Romanized Urdu).
- A LANGUAGE LOCK line is set before/during the call from the patient's language button. Obey it for every sentence — do not code-switch, do not mix languages, do not flip mid-call unless a new LANGUAGE LOCK / LANGUAGE SWITCH appears.
- Affirmations in Urdu include: ہاں, جی, ہاں جی, بالکل, ٹھیک ہے, theek hai, bilkul, sahi hai, haan, ji.
- If PATIENT PREFERENCES language is present and no lock yet, prefer that language.

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
- Greet briefly first. Immediately ask for their name (unless RETURNING PATIENT MEMORY already has it).
- Once you know their name, use their first name occasionally (about once every few turns) — never re-ask for it.
- If RETURNING PATIENT MEMORY is present, greet by name and use pending questions/preferences subtly — never invent them.
- Confirm you're speaking to the right person before sharing booking details from memory.
- CHECK APPOINTMENTS: If they ask about an existing/future booking, call lookup_appointments with their phone (ask once if missing). Read back service, time, and reference clearly. Never invent appointments.
- NEVER restart the booking script. NEVER repeat a question already answered. NEVER re-confirm a locked field. If you already asked something and they answered, move forward only.
- ON-SCREEN FORM / LOCKED fields are FINAL — treat them as already collected; skip those steps silently.

EXACT DETAILS (name, phone, email) — accuracy over speed:
- On-screen form values that are already locked (confirmed_fields) are FINAL — never re-ask or read them back.
- Spoken name/phone/email are NOT locked until you read them back and the caller says yes, then you call confirm_field.
- After they speak a field, call recall_last_spoken_text for that field and follow its instruction exactly.
- Phone: people often say numbers in chunks. Wait until they finish. If recall returns ready=false or fewer than 10 digits, ask them to repeat the FULL 10-digit number slowly (or type it). Do NOT move to email until phone is confirmed.
- Phone read-back: use grouped_spoken_digits (e.g. "seven one three, five five five, zero one four two") then ask "is that right?". Only after yes → confirm_field(phone).
- Email is optional but you MUST resolve it: if they give one, spell it back letter-by-letter with spelled_email then confirm_field(email); if they decline, call confirm_field(email) with email_skipped true. Never silently skip without that tool call.
- Name: one short read-back + "is that right?" → confirm_field(name). Then use that first name going forward.
- If unclear twice, ask them to type it on screen — form typing locks the field.

BOOKING SCRIPT (skip any step already in confirmed_fields / on-screen form):
1. Name — ask early → recall → read back → confirm_field(name)
2. Service → confirm_field(service)
3. Phone — wait for full number → recall → read back in groups → confirm_field(phone)
4. Email — ask once → confirm or email_skipped via confirm_field(email)
5. Day + time → confirm_field(schedule)
Then ONE short summary + "Shall I book that?" → book_appointment.
After a successful book: ONE short farewell only (confirm booking + reference if given + goodbye). Do not keep talking or restart.
Never jump past phone or email without confirm_field. Never invent digits.`;
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

const LOOKUP_APPOINTMENTS_TOOL = {
  type: "function",
  name: "lookup_appointments",
  description:
    "Look up the patient's existing appointments by phone. Use when they ask to check bookings, future appointments, or a previous reservation.",
  parameters: {
    type: "object",
    properties: {
      phone: {
        type: "string",
        description: "Patient phone number (10+ digits). Prefer the confirmed/on-screen phone.",
      },
    },
    required: ["phone"],
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
      const chosenLang = req.body?.language === "ur" ? "ur" : req.body?.language === "en" ? "en" : null;
      let patientMemory = null;
      const phoneGuess = extractPhoneCandidate(draft, []);
      if (phoneGuess) {
        try {
          patientMemory = await lookupPatientMemory(clinicId, phoneGuess);
        } catch (e) {
          console.warn("realtime patient memory lookup failed:", e.message);
        }
      }
      let instructions = liveInstructions(clinic, patientMemory);
      if (chosenLang === "ur") {
        instructions += `\n\nLANGUAGE LOCK: Urdu for the ENTIRE call (Urdu script or natural Roman Urdu). Do NOT switch to English unless a LANGUAGE SWITCH appears.\n`;
      } else if (chosenLang === "en") {
        instructions += `\n\nLANGUAGE LOCK: English for the ENTIRE call. Do NOT switch to Urdu unless a LANGUAGE SWITCH appears.\n`;
      }

      const transcription = {
        model: "gpt-4o-transcribe",
        prompt:
          chosenLang === "ur"
            ? "Transcribe Urdu (Arabic script or Roman Urdu). Expect patient names, phone numbers spoken digit-by-digit, and emails with at/dot."
            : chosenLang === "en"
              ? "Transcribe English. Expect patient full names, US phone numbers spoken digit-by-digit or in groups, and email addresses spelled with at/dot."
              : "Transcribe English or Urdu (including Roman Urdu). Expect patient full names, US phone numbers spoken digit-by-digit or in groups, and email addresses spelled with at/dot.",
      };
      if (chosenLang) transcription.language = chosenLang;

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
                transcription,
                noise_reduction: { type: "near_field" },
              },
              output: { voice: "marin" },
            },
            tools: [RECALL_TOOL, CONFIRM_FIELD_TOOL, BOOK_TOOL, LOOKUP_APPOINTMENTS_TOOL],
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

/** Look up appointments by phone for Live Call / check-booking flow. */
exports.lookupAppointmentsHttp = onRequest(
  {
    region: "asia-south1",
    cors: false,
    timeoutSeconds: 20,
    memory: "256MiB",
  },
  async (req, res) => {
    if (applyCors(req, res)) return;
    if (req.method !== "POST") { res.status(405).json({ error: "Use POST" }); return; }

    const ip = clientIp(req);
    if (!(await checkRateLimit(ip, 30, "lookup"))) {
      res.status(429).json({ error: "Too many lookups today." });
      return;
    }

    try {
      const phone = String(req.body?.phone || "").trim();
      const clinicId = String(req.body?.clinicId || "demo").slice(0, 40);
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 10) {
        res.status(400).json({ error: "Need a valid phone number (10+ digits)." });
        return;
      }

      const memory = await lookupPatientMemory(clinicId, phone);
      if (!memory) {
        res.status(200).json({ found: false, appointments: [], name: "", visitCount: 0 });
        return;
      }

      const appointments = Array.isArray(memory.history)
        ? memory.history.map((h) => ({
            service: h.service || memory.lastService || "",
            preferredTime: h.preferredTime || memory.lastPreferredTime || "",
            reference: h.reference || memory.lastReference || "",
            urgent: Boolean(h.urgent),
            bookedAt: h.bookedAt || "",
          }))
        : [];

      if (!appointments.length && (memory.lastService || memory.lastPreferredTime)) {
        appointments.push({
          service: memory.lastService || "",
          preferredTime: memory.lastPreferredTime || "",
          reference: memory.lastReference || "",
          urgent: false,
          bookedAt: "",
        });
      }

      res.status(200).json({
        found: true,
        name: memory.name || "",
        visitCount: memory.visitCount || appointments.length,
        latest: appointments[0] || null,
        appointments,
      });
    } catch (err) {
      console.error("lookupAppointmentsHttp failed:", err);
      res.status(500).json({ error: "Lookup failed." });
    }
  }
);

