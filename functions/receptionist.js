/**
 * AI Receptionist for clinics — conversational front desk.
 * Answers patient questions from the clinic knowledge base (RAG) and books
 * appointments via OpenAI tool-calling. Behaves like a warm human receptionist.
 *
 * POST { messages: [{role, content}], clinicId? }
 *  -> { reply, booking? }
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

const { getClinic } = require("./lib/clinicKB");
const { bookAndNotify } = require("./lib/booking");
const { extractBookingDraft, hasBookingIntent, isServicesQuery, isDraftComplete, mergeBookingDrafts } = require("./lib/bookingExtract");
const { checkRateLimit } = require("./lib/cache");
const { applyCors, clientIp } = require("./lib/security");
const {
  detectEmergency,
  buildTriagePayload,
  persistUrgentAlert,
} = require("./lib/triage");
const {
  lookupPatientMemory,
  patientMemoryContext,
  extractPhoneCandidate,
  appendPatientInteraction,
  shouldStoreAsQuestion,
  inferPreferencePatch,
} = require("./lib/patientMemory");

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");
const DAILY_LIMIT_PER_IP = 100; // per IP per day for chat demo

function isWeakEmergencyReply(text) {
  const t = String(text || "").trim();
  if (!t) return true;
  if (t.length < 40 && /^(hi|hello|hey)\b/i.test(t)) return true;
  if (/how can i (help|assist) you/i.test(t) && !/(emerg|bleed|urgent|slot|pain|swell|alert)/i.test(t)) return true;
  return false;
}

function forcedEmergencyReply(triage, clinic) {
  return (
    `I'm sorry you're going through this — I'm treating it as urgent. ` +
    `I've alerted the front desk and can hold ${triage.emergencySlot}. ` +
    `Please enter your name and phone in the form below so we can lock that slot ` +
    `(or call ${clinic.phone} now for an immediate transfer). ` +
    `If this is life-threatening, call 911 first.`
  );
}

function bookingFormContext(draft) {
  if (!draft || typeof draft !== "object") return "";
  const fields = [
    ["name", draft.name],
    ["phone", draft.phone],
    ["email", draft.email],
    ["service", draft.service],
    ["day", draft.day],
    ["time", draft.time],
  ];
  const lines = fields.map(([k, v]) => `- ${k}: ${String(v || "").trim() || "(empty)"}`);
  const filled = fields.filter(([, v]) => String(v || "").trim());
  if (!filled.length) return "";
  const filledKeys = filled.map(([k]) => k).join(", ");
  return `\nPATIENT BOOKING FORM (visible on screen — values below are authoritative):
${lines.join("\n")}
CRITICAL: Fields already filled (${filledKeys}) are LOCKED. NEVER ask for them again. NEVER say you still need the phone/name if phone/name shows a value above. Only nudge empty fields, or tell them to tap Confirm Booking when the form is complete.`;
}

function systemPrompt(c, draft, memory) {
  return `You are the friendly front-desk receptionist for "${c.name}" — ${c.tagline} in ${c.city}. You chat with patients on the clinic's website.

PERSONALITY: Your name is Maya. Warm, human, concise — like a real receptionist. Use the patient's name once you know it. Reply in the same language the patient uses (default English; follow PATIENT PREFERENCES language if set). Keep replies short (1–2 sentences) unless they prefer detailed answers. One emoji max per message (😊, 🦷).

WHAT YOU KNOW (only use these facts — never invent):
Address: ${c.address}
Phone/WhatsApp: ${c.phone}
Hours: ${c.hours.weekdays}; Sunday: ${c.hours.sunday}. ${c.hours.note}
Doctors: ${c.doctors.map((d) => `${d.name} — ${d.role} (${d.experience})`).join("; ")}
Services (describe what each involves — do NOT mention prices unless the patient explicitly asks about cost; then say the team will confirm exact pricing):
${c.services.map((s) => `- ${s.name}${s.description ? `: ${s.description}` : ""}`).join("\n")}
Payment: ${c.policies.payment}
First visit: ${c.policies.firstVisit}
Cancellation: ${c.policies.cancellation}
Emergencies: ${c.policies.emergency}
FAQs:
${c.faqs.map((f) => `Q: ${f.q} A: ${f.a}`).join("\n")}
${bookingFormContext(draft)}
${patientMemoryContext(memory)}

PATIENT MEMORY:
- When a returning patient asks about a previous booking/visit/details, use RETURNING PATIENT MEMORY above if present.
- Use PENDING QUESTIONS and PATIENT PREFERENCES to personalize — acknowledge continuity, adapt tone/language, never invent prefs or past questions.
- If you have their phone but no memory loaded yet, call recall_patient with their phone.
- If they ask about a past appointment but have not given a phone, ask for the phone on file once — then recall_patient.
- When they say "please remember…", "don't forget…", or share a lasting preference, call remember_patient_note.
- Never invent past visits.

EMERGENCY TRIAGE PROTOCOL (highest priority):
If the patient mentions bleeding, severe pain, a knocked-out tooth, implant falling out, facial swelling, abscess, or says "emergency":
1. Stay calm and acknowledge the urgency in one sentence.
2. Call flag_emergency with the reason (and name/phone if already known).
3. Offer the earliest emergency slot returned by the tool.
4. Tell them staff has been alerted and they can call ${c.phone} for immediate transfer.
5. If symptoms sound life-threatening (can't breathe, heavy uncontrolled bleeding, loss of consciousness), tell them to call 911 first.
6. Do NOT give medical diagnoses. Do NOT downplay pain.
7. After triage, offer to collect name + phone quickly via the booking form for the emergency slot.

RULES:
- Never give medical advice or diagnoses. Suggest a check-up instead (except during emergency triage — then follow the protocol above).
- When asked about services: give a brief friendly intro (1 sentence). The UI shows a service menu — do NOT list every service in text.
- When asked about a specific treatment: explain what it involves in 1–2 sentences. No prices unless they ask about cost.
- If asked about price/cost: say pricing depends on the case and the team will confirm at booking — do not quote dollar amounts.
- BOOKING (chat-first — do NOT force the on-screen form):
  Required before booking: full name, phone, treatment/service, day, and time. Email is optional.
  Collect ONE missing field at a time in chat. Never skip ahead.
  Order if unknown: service → name → phone → email (optional, offer skip) → day → time.
  When all required fields are known, call book_appointment immediately.
  Do NOT book if name, phone, service, or day/time is missing — ask for the next missing field only.
  You may mention once that a form is also available, but keep booking in chat if they prefer typing.
- NEVER ask the same question twice. NEVER say "is that correct?" more than once. If info is in the form or chat history, do not ask again.
- If unsure which treatment: suggest Consultation & Check-up.`;
}

const TOOLS = [
  {
    type: "function",
    function: {
      name: "recall_patient",
      description:
        "Look up a returning patient's past appointments, pending questions, and preferences by phone. Call when they ask about a previous booking/visit or give their phone to find their record.",
      parameters: {
        type: "object",
        properties: {
          phone: { type: "string", description: "Patient phone number on file." },
        },
        required: ["phone"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remember_patient_note",
      description:
        "Save a lasting patient preference or note (e.g. prefers mornings, keep answers short, afraid of needles). Call when they ask you to remember something. Requires phone on file.",
      parameters: {
        type: "object",
        properties: {
          phone: { type: "string", description: "Patient phone — use known phone if omitted." },
          note: { type: "string", description: "Short preference/note to remember until the visit." },
          tone: { type: "string", description: "Optional: concise | detailed" },
          language: { type: "string", description: "Optional language code, e.g. en or es" },
        },
        required: ["note"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "flag_emergency",
      description:
        "Call immediately when the patient describes a dental emergency (bleeding, severe pain, knocked-out tooth, implant fell out, swelling, etc.). Alerts staff and returns the earliest emergency slot.",
      parameters: {
        type: "object",
        properties: {
          reason: { type: "string", description: "Short reason, e.g. bleeding, severe pain, implant displaced." },
          name: { type: "string" },
          phone: { type: "string" },
          notes: { type: "string", description: "What the patient said." },
        },
        required: ["reason"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "book_appointment",
      description:
        "Book once you have name, phone, service, and preferred day/time. Email is optional. Do not call if any required field is missing.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", description: "Optional — patient email if provided." },
          service: { type: "string" },
          preferredTime: { type: "string", description: "Preferred day and time, e.g. 'Monday at 3:00 PM'." },
          notes: { type: "string", description: "Any extra context (symptoms, preferences)." },
          urgent: { type: "boolean", description: "True if this is an emergency / triage booking." },
          triageReason: { type: "string" },
        },
        required: ["name", "phone", "service", "preferredTime"],
      },
    },
  },
];

exports.clinicReceptionist = onRequest(
  {
    region: "asia-south1",
    cors: false,
    timeoutSeconds: 60,
    memory: "512MiB",
    minInstances: 1, // stay warm — no cold-start lag on the first message
    secrets: [OPENAI_API_KEY, GMAIL_USER, GMAIL_APP_PASSWORD],
  },
  async (req, res) => {
    if (applyCors(req, res)) return;
    if (req.method !== "POST") { res.status(405).json({ error: "Use POST" }); return; }

    const ip = clientIp(req);
    if (!(await checkRateLimit(ip, DAILY_LIMIT_PER_IP, "chat"))) {
      res.status(429).json({ error: "Too many messages today. Please WhatsApp us to continue." });
      return;
    }

    const clinic = getClinic(req.body?.clinicId);
    const clientDraft = req.body?.bookingDraft || null;
    const history = Array.isArray(req.body?.messages) ? req.body.messages.slice(-12) : [];
    const clinicId = req.body?.clinicId || "demo";

    // Load returning-patient memory when we already know their phone
    let patientMemory = null;
    const phoneGuess = extractPhoneCandidate(clientDraft, history);
    if (phoneGuess) {
      try {
        patientMemory = await lookupPatientMemory(clinicId, phoneGuess);
      } catch (e) {
        console.warn("Patient memory lookup failed:", e.message);
      }
    }

    const messages = [
      { role: "system", content: systemPrompt(clinic, clientDraft, patientMemory) },
      ...history.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: String(m.content || "").slice(0, 1000) })),
    ];

    try {
      const key = OPENAI_API_KEY.value();

      // Voice note attached: transcribe here (one round trip instead of two).
      let transcript = null;
      if (typeof req.body?.audio === "string" && req.body.audio.length > 100) {
        const buf = Buffer.from(req.body.audio, "base64");
        if (buf.length > 1000 && buf.length < 6 * 1024 * 1024) {
          const mime = typeof req.body?.mime === "string" ? req.body.mime : "audio/webm";
          const ext = mime.includes("mp4") || mime.includes("m4a") ? "m4a" : mime.includes("ogg") ? "ogg" : "webm";
          const form = new FormData();
          form.append("file", new Blob([buf], { type: mime }), `note.${ext}`);
          form.append("model", "gpt-4o-mini-transcribe");
          const tr = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}` },
            body: form,
            signal: AbortSignal.timeout(30000),
          });
          if (tr.ok) {
            transcript = ((await tr.json()).text || "").trim();
          }
        }
        if (!transcript) {
          res.status(422).json({ error: "Couldn't hear the voice note — please try again or type." });
          return;
        }
        messages.push({ role: "user", content: transcript.slice(0, 1000) });
      }
      const call = (body) =>
        fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(45000),
        }).then(async (r) => {
          if (!r.ok) throw new Error(`OpenAI ${r.status}: ${(await r.text()).slice(0, 200)}`);
          return r.json();
        });

      let booking = null;
      let triage = null;

      const lastUserText =
        (transcript || history.filter((m) => m.role === "user").slice(-1)[0]?.content || "").toString();
      const isFormSubmit = /Please book my appointment/i.test(lastUserText);
      const emergencyHit = detectEmergency(lastUserText);
      const serviceNames = clinic.services.map((s) => s.name);
      const chatDraft = mergeBookingDrafts(
        extractBookingDraft(history, serviceNames),
        clientDraft || {}
      );
      const prevDraft = mergeBookingDrafts(
        extractBookingDraft(history.slice(0, -1), serviceNames),
        clientDraft || {}
      );
      const justCompleted = isDraftComplete(chatDraft) && !isDraftComplete(prevDraft);
      const readyToBook =
        isDraftComplete(chatDraft) &&
        (isFormSubmit ||
          justCompleted ||
          /\b(yes|yeah|yep|confirm|book it|go ahead|please book|that works|sounds good)\b/i.test(lastUserText));

      const confirmCopy = (args, urgent) => {
        const contact = args.email
          ? "Our team will contact you shortly by email or phone to confirm."
          : "Our team will contact you shortly by phone to confirm.";
        if (urgent) {
          return `Booking confirmed — urgent slot held for ${args.name}: ${args.service} (${args.preferredTime}). Front desk is alerted. ${contact} 😊`;
        }
        return `Booking confirmed for ${args.name} — ${args.service} on ${args.preferredTime}. ${contact} 😊`;
      };

      // Book immediately when required details are complete (form OR chat)
      if (readyToBook) {
        const priorEmergency =
          emergencyHit ||
          history.map((m) => detectEmergency(String(m.content || ""))).find(Boolean) ||
          null;
        if (priorEmergency) triage = buildTriagePayload(priorEmergency, clinic);
        const urgent = Boolean(triage?.urgent);
        const args = {
          name: chatDraft.name,
          phone: chatDraft.phone,
          email: String(chatDraft.email || "").trim(),
          service: chatDraft.service,
          preferredTime: `${chatDraft.day} at ${chatDraft.time}`,
          urgent,
          triageReason: triage?.reason || "",
          notes: urgent && triage?.reason ? `Emergency: ${triage.reason}` : "",
        };
        try {
          const { id, reference } = await bookAndNotify({
            args,
            clinicId: req.body?.clinicId || "demo",
            clinic,
            source: urgent ? "ai_receptionist_emergency" : "ai_receptionist",
            gmailUser: GMAIL_USER.value(),
            gmailPass: GMAIL_APP_PASSWORD.value(),
          });
          booking = { id, ...args, clinicName: clinic.name, reference };
          if (urgent && triage) {
            try {
              await persistUrgentAlert({
                clinic,
                clinicId: req.body?.clinicId || "demo",
                reason: triage.reason,
                excerpt: triage.excerpt || lastUserText,
                emergencySlot: args.preferredTime,
                name: args.name,
                phone: args.phone,
                source: "ai_receptionist_emergency",
              });
            } catch (e) {
              console.warn("Urgent alert persist failed:", e.message);
            }
          }
          res.status(200).json({
            reply: confirmCopy(args, urgent),
            booking,
            triage: triage?.urgent ? triage : null,
            audio: null,
            transcript,
            bookingDraft: chatDraft,
            showBookingForm: false,
          });
          return;
        } catch (e) {
          console.warn("Direct book failed, falling back to LLM:", e.message);
        }
      }

      if (emergencyHit) {
        triage = buildTriagePayload(emergencyHit, clinic);
        messages[0] = {
          role: "system",
          content:
            messages[0].content +
            `\n\nACTIVE EMERGENCY DETECTED (${emergencyHit.matched}). Follow EMERGENCY TRIAGE PROTOCOL now. Earliest slot: ${triage.emergencySlot}. Call flag_emergency immediately.`,
        };
      }

      let data = await call({ model: "gpt-4o-mini", temperature: 0.4, max_tokens: 350, messages, tools: TOOLS });
      let msg = data.choices[0].message;

      // Handle ALL tool calls each round (OpenAI requires a tool result per tool_call_id)
      for (let round = 0; round < 3; round++) {
        const toolCalls = Array.isArray(msg.tool_calls) ? msg.tool_calls : [];
        if (!toolCalls.length) break;

        messages.push(msg);
        let bookedThisRound = false;

        for (const toolCall of toolCalls) {
          const fn = toolCall?.function?.name;
          let args = {};
          try {
            args = JSON.parse(toolCall.function?.arguments || "{}");
          } catch {
            args = {};
          }

          if (fn === "recall_patient") {
            const phone = args.phone || phoneGuess || (clientDraft && clientDraft.phone) || "";
            let memory = null;
            try {
              memory = await lookupPatientMemory(clinicId, phone);
              if (memory) patientMemory = memory;
            } catch (e) {
              console.warn("recall_patient failed:", e.message);
            }
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(
                memory
                  ? {
                      found: true,
                      name: memory.name,
                      phone: memory.phone,
                      visitCount: memory.visitCount,
                      latest: {
                        service: memory.lastService,
                        preferredTime: memory.lastPreferredTime,
                        reference: memory.lastReference,
                      },
                      history: memory.history,
                      pendingQuestions: memory.pendingQuestions || [],
                      preferences: memory.preferences || {},
                      preVisitNotes: memory.preVisitNotes || "",
                      instruction:
                        "Share their latest booking briefly. Use pending questions and preferences to personalize. Do not invent records.",
                    }
                  : {
                      found: false,
                      phone,
                      instruction:
                        "No record for that phone. Ask them to confirm the number, or book a new appointment.",
                    }
              ),
            });
            // Refresh system context for later turns in this request
            if (memory) {
              messages[0] = {
                role: "system",
                content: systemPrompt(clinic, clientDraft, memory),
              };
            }
            continue;
          }

          if (fn === "remember_patient_note") {
            const phone = args.phone || phoneGuess || (clientDraft && clientDraft.phone) || "";
            const note = String(args.note || "").trim().slice(0, 400);
            if (!phone || String(phone).replace(/\D/g, "").length < 10) {
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({
                  saved: false,
                  missing: "phone",
                  instruction: "Ask for their phone once, then call remember_patient_note again.",
                }),
              });
              continue;
            }
            if (!note) {
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({ saved: false, error: "Empty note" }),
              });
              continue;
            }
            try {
              await appendPatientInteraction({
                clinicId,
                phone,
                name: (clientDraft && clientDraft.name) || (patientMemory && patientMemory.name) || "",
                question: note,
                preferencePatch: {
                  notes: note,
                  ...(args.tone ? { tone: String(args.tone).slice(0, 40) } : {}),
                  ...(args.language ? { language: String(args.language).slice(0, 16) } : {}),
                },
                forceNote: true,
              });
              patientMemory = await lookupPatientMemory(clinicId, phone);
              if (patientMemory) {
                messages[0] = {
                  role: "system",
                  content: systemPrompt(clinic, clientDraft, patientMemory),
                };
              }
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({
                  saved: true,
                  note,
                  instruction: "Acknowledge briefly that you'll remember this for their visit.",
                }),
              });
            } catch (e) {
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({ saved: false, error: e.message || "Save failed" }),
              });
            }
            continue;
          }

          if (fn === "flag_emergency") {
            const reason = args.reason || emergencyHit?.matched || "urgent dental concern";
            const detection = { matched: reason, excerpt: args.notes || lastUserText };
            triage = buildTriagePayload(detection, clinic);
            try {
              await persistUrgentAlert({
                clinic,
                clinicId: req.body?.clinicId || "demo",
                reason: triage.reason,
                excerpt: triage.excerpt,
                emergencySlot: triage.emergencySlot,
                name: args.name,
                phone: args.phone,
                source: "ai_receptionist_emergency",
              });
            } catch (e) {
              console.warn("Urgent alert persist failed:", e.message);
            }
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                staff_alerted: true,
                priority: "urgent",
                emergency_slot: triage.emergencySlot,
                clinic_phone: clinic.phone,
                transfer_available: true,
                guidance: triage.guidance,
              }),
            });
            continue;
          }

          if (fn === "book_appointment") {
            // Prefer form/chat draft values over model guesses
            const merged = mergeBookingDrafts(chatDraft, {
              name: args.name,
              phone: args.phone,
              email: args.email,
              service: args.service,
              day: args.preferredTime || "",
              time: "",
            });
            // preferredTime may already be "Monday at 3:00 PM"
            if (args.preferredTime && /\bat\b/i.test(args.preferredTime)) {
              args.name = merged.name || args.name;
              args.phone = merged.phone || args.phone;
              args.email = merged.email || args.email || "";
              args.service = merged.service || args.service;
            } else {
              args.name = merged.name || args.name;
              args.phone = merged.phone || args.phone;
              args.email = merged.email || args.email || "";
              args.service = merged.service || args.service;
              if (merged.day && merged.time) args.preferredTime = `${merged.day} at ${merged.time}`;
            }

            const missing = [];
            if (!String(args.name || "").trim() || String(args.name).trim().length < 2) missing.push("name");
            if (String(args.phone || "").replace(/\D/g, "").length < 10) missing.push("phone");
            if (!String(args.service || "").trim()) missing.push("service");
            if (!String(args.preferredTime || "").trim()) missing.push("day and time");

            if (missing.length) {
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({
                  booked: false,
                  missing,
                  instruction: `Ask only for the next missing field: ${missing[0]}. Email is optional.`,
                }),
              });
              continue;
            }

            if (triage?.urgent) {
              args.urgent = true;
              args.triageReason = args.triageReason || triage.reason;
              args.priority = "urgent";
              if (!args.preferredTime) args.preferredTime = triage.emergencySlot;
              if (!args.notes) args.notes = `Emergency: ${triage.reason}`;
            }
            try {
              const { id, reference } = await bookAndNotify({
                args,
                clinicId: req.body?.clinicId || "demo",
                clinic,
                source: args.urgent ? "ai_receptionist_emergency" : "ai_receptionist",
                gmailUser: GMAIL_USER.value(),
                gmailPass: GMAIL_APP_PASSWORD.value(),
              });
              booking = { id, ...args, clinicName: clinic.name };
              bookedThisRound = true;
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({
                  booked: true,
                  reference,
                  confirmationEmailSentTo: args.email || null,
                  urgent: !!args.urgent,
                  instruction:
                    "Confirm booking briefly. Say the team will contact them shortly by email or phone.",
                }),
              });
            } catch (e) {
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({ booked: false, error: e.message || "Booking failed" }),
              });
            }
            continue;
          }

          // Always acknowledge unknown tools so the next OpenAI call isn't a 400
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ ok: false, error: `Unknown tool: ${fn || "none"}` }),
          });
        }

        data = await call({
          model: "gpt-4o-mini",
          temperature: 0.5,
          max_tokens: 320,
          messages,
          tools: bookedThisRound ? undefined : TOOLS,
        });
        msg = data.choices[0].message;
        if (bookedThisRound) break;
      }

      // Persist triage alert if keywords fired but model skipped the tool
      if (triage?.urgent && !booking) {
        try {
          await persistUrgentAlert({
            clinic,
            clinicId: req.body?.clinicId || "demo",
            reason: triage.reason,
            excerpt: triage.excerpt,
            emergencySlot: triage.emergencySlot,
            source: "ai_receptionist_emergency",
          });
        } catch (e) {
          console.warn("Urgent alert persist failed:", e.message);
        }
      }

      let replyText = (msg && msg.content) || "Sorry, could you say that again?";
      if (booking && (!replyText || isWeakEmergencyReply(replyText))) {
        const contact = booking.email
          ? "Our team will contact you shortly by email or phone to confirm."
          : "Our team will contact you shortly by phone to confirm.";
        replyText = `Booking confirmed for ${booking.name} — ${booking.service} on ${booking.preferredTime}. ${contact} 😊`;
      }
      if (triage?.urgent && !booking && isWeakEmergencyReply(replyText)) {
        replyText = forcedEmergencyReply(triage, clinic);
      }

      // Voice reply (when the patient spoke to us): OpenAI TTS -> base64 mp3.
      let audio = null;
      if (req.body?.speak === true && replyText) {
        try {
          const ttsBody = (model) => ({
            model,
            voice: "nova",
            input: replyText.slice(0, 600),
            response_format: "mp3",
          });
          let tts = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
            body: JSON.stringify(ttsBody("gpt-4o-mini-tts")),
            signal: AbortSignal.timeout(30000),
          });
          if (!tts.ok) {
            tts = await fetch("https://api.openai.com/v1/audio/speech", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
              body: JSON.stringify(ttsBody("tts-1")),
              signal: AbortSignal.timeout(30000),
            });
          }
          if (tts.ok) {
            audio = Buffer.from(await tts.arrayBuffer()).toString("base64");
          }
        } catch (e) {
          console.warn("TTS failed (reply sent as text only):", e.message);
        }
      }

      const bookingDraft = mergeBookingDrafts(extractBookingDraft(history, serviceNames), clientDraft || {});
      const showBookingForm =
        !booking &&
        !isServicesQuery(lastUserText) &&
        (Boolean(triage?.urgent) ||
          /\b(booking form|fill (in|out|the) form|use the form)\b/i.test(lastUserText));

      // Persist questions / prefs once we know their phone (until appointment)
      const memoryPhone =
        phoneGuess ||
        (bookingDraft && bookingDraft.phone) ||
        (booking && booking.phone) ||
        "";
      if (memoryPhone && lastUserText) {
        const prefPatch = inferPreferencePatch(lastUserText);
        if (shouldStoreAsQuestion(lastUserText) || prefPatch) {
          appendPatientInteraction({
            clinicId,
            phone: memoryPhone,
            name: (bookingDraft && bookingDraft.name) || (patientMemory && patientMemory.name) || "",
            question: shouldStoreAsQuestion(lastUserText) ? lastUserText : "",
            preferencePatch: prefPatch,
          }).catch((e) => console.warn("appendPatientInteraction failed:", e.message));
        }
      }

      res.status(200).json({
        reply: replyText,
        booking,
        triage: triage?.urgent ? triage : null,
        audio,
        transcript,
        bookingDraft,
        showBookingForm,
      });
    } catch (err) {
      console.error("Receptionist error:", err);
      res.status(500).json({ error: "I'm having a moment — please try again or WhatsApp us." });
    }
  }
);
