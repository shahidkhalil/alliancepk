/**
 * Patient memory for Maya — store & recall bookings, pending questions,
 * and light behavioral preferences by phone (Firestore).
 * Doc id: patients/{clinicId}_{last10Digits}
 */

const admin = require("firebase-admin");

const MAX_PENDING_QUESTIONS = 15;
const MAX_QUESTION_LEN = 280;
const MAX_PRE_VISIT_NOTES = 1200;
const MAX_TOPICS = 8;
const MAX_PREF_NOTES = 400;

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

/** Stable key: last 10 digits (US-friendly; still works for longer intl numbers). */
function phoneKey(phone) {
  const d = digitsOnly(phone);
  if (d.length < 10) return "";
  return d.slice(-10);
}

function patientDocId(clinicId, phone) {
  const key = phoneKey(phone);
  if (!key) return "";
  return `${clinicId || "demo"}_${key}`;
}

function formatWhen(ts) {
  if (!ts) return "";
  try {
    const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function memoryUntilToDate(value) {
  if (!value) return null;
  try {
    if (typeof value.toDate === "function") return value.toDate();
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function guessTopic(text) {
  const t = String(text || "").toLowerCase();
  if (/\b(whitening|bleach)\b/.test(t)) return "whitening";
  if (/\b(implant)\b/.test(t)) return "implants";
  if (/\b(ortho|braces|invisalign|aligner)\b/.test(t)) return "orthodontics";
  if (/\b(clean|hygiene|scaling)\b/.test(t)) return "cleaning";
  if (/\b(root\s*canal|rct)\b/.test(t)) return "root canal";
  if (/\b(veneer)\b/.test(t)) return "veneers";
  if (/\b(hour|open|close|timing)\b/.test(t)) return "hours";
  if (/\b(price|cost|fee|insurance)\b/.test(t)) return "pricing";
  if (/\b(service|treatment|offer)\b/.test(t)) return "services";
  return "";
}

/**
 * Infer light communication preferences from a user message.
 * Never stores clinical diagnoses — communication style only.
 */
function inferPreferencePatch(text) {
  const t = String(text || "").trim();
  if (!t) return null;
  const patch = {};

  if (/[áéíóúñ¿¡]|(\b(hola|gracias|por favor|buenos días|buenas)\b)/i.test(t)) {
    patch.language = "es";
  } else if (/\b(in english|speak english|english please)\b/i.test(t)) {
    patch.language = "en";
  }

  if (/\b(keep it short|be brief|short answers|concise|quick)\b/i.test(t)) {
    patch.tone = "concise";
  } else if (/\b(more detail|explain more|in detail|tell me more)\b/i.test(t)) {
    patch.tone = "detailed";
  }

  const topic = guessTopic(t);
  if (topic) patch.topicsOfInterest = [topic];

  return Object.keys(patch).length ? patch : null;
}

/**
 * Skip pure booking-field answers / form submits — not useful as "questions".
 */
function shouldStoreAsQuestion(text) {
  const t = String(text || "").trim();
  if (!t || t.length < 4) return false;
  if (/Please book my appointment/i.test(t)) return false;
  if (/^(yes|yeah|yep|no|nope|ok|okay|sure|thanks|thank you|hi|hello|hey)\.?$/i.test(t)) return false;
  // Likely just a phone / email / short name
  if (/^[\d\s\-()+.]{10,}$/.test(t)) return false;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return false;
  if (/^[A-Za-z][A-Za-z .'-]{1,40}$/.test(t) && t.split(/\s+/).length <= 3 && !/\?/.test(t)) {
    // Short name-like answers without a question mark — skip
    if (!/\b(what|how|when|where|which|why|do you|can you|tell me|services?)\b/i.test(t)) {
      return false;
    }
  }
  // Day/time only
  if (/^(Today|Tomorrow|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)(\s+at\s+[\d:apm\s.]+)?$/i.test(t)) {
    return false;
  }
  if (/^\d{1,2}(:\d{2})?\s*(am|pm)$/i.test(t)) return false;
  return true;
}

function mergePreferences(prev, patch) {
  const base = prev && typeof prev === "object" ? { ...prev } : {};
  if (!patch || typeof patch !== "object") return base;

  if (patch.language) base.language = String(patch.language).slice(0, 16);
  if (patch.tone) base.tone = String(patch.tone).slice(0, 40);
  if (patch.notes) {
    const next = String(patch.notes).slice(0, MAX_PREF_NOTES);
    base.notes = base.notes ? `${String(base.notes).slice(0, 200)}; ${next}`.slice(0, MAX_PREF_NOTES) : next;
  }
  if (Array.isArray(patch.topicsOfInterest) && patch.topicsOfInterest.length) {
    const prevTopics = Array.isArray(base.topicsOfInterest) ? base.topicsOfInterest : [];
    const merged = [...prevTopics];
    for (const topic of patch.topicsOfInterest) {
      const t = String(topic || "").trim().slice(0, 40);
      if (t && !merged.includes(t)) merged.unshift(t);
    }
    base.topicsOfInterest = merged.slice(0, MAX_TOPICS);
  }
  return base;
}

function summarizePendingQuestions(questions) {
  const list = Array.isArray(questions) ? questions : [];
  if (!list.length) return "";
  return list
    .slice(0, 10)
    .map((q, i) => `${i + 1}. ${String(q.text || "").slice(0, 120)}${q.topic ? ` [${q.topic}]` : ""}`)
    .join("\n");
}

function shapeMemoryFromDoc(id, d) {
  return {
    id,
    name: d.name || "",
    phone: d.phone || "",
    email: d.email || "",
    visitCount: d.visitCount || (d.history || []).length || 0,
    lastService: d.lastService || "",
    lastPreferredTime: d.lastPreferredTime || "",
    lastReference: d.lastReference || "",
    history: Array.isArray(d.history) ? d.history.slice(0, 5) : [],
    pendingQuestions: Array.isArray(d.pendingQuestions) ? d.pendingQuestions.slice(0, MAX_PENDING_QUESTIONS) : [],
    preferences: d.preferences && typeof d.preferences === "object" ? d.preferences : {},
    preVisitNotes: d.preVisitNotes || "",
    memoryUntil: d.memoryUntil || null,
    updatedAt: formatWhen(d.updatedAt),
  };
}

/**
 * If memoryUntil has passed, archive pre-visit notes and clear pending questions.
 * Returns updated memory object (may mutate Firestore).
 */
async function archiveExpiredMemory(clinicId, phone, memory) {
  if (!memory) return memory;
  const until = memoryUntilToDate(memory.memoryUntil);
  if (!until || until.getTime() > Date.now()) return memory;

  const id = memory.id || patientDocId(clinicId, phone);
  if (!id) return memory;

  const hasPending = Array.isArray(memory.pendingQuestions) && memory.pendingQuestions.length;
  const hasNotes = Boolean(memory.preVisitNotes);
  if (!hasPending && !hasNotes && !memory.memoryUntil) return memory;

  const db = admin.firestore();
  const archiveEntry = {
    archivedAt: new Date().toISOString(),
    preVisitNotes: String(memory.preVisitNotes || "").slice(0, MAX_PRE_VISIT_NOTES),
    questions: (memory.pendingQuestions || []).slice(0, 10),
  };

  try {
    await db.collection("patients").doc(id).set(
      {
        pendingQuestions: [],
        preVisitNotes: "",
        memoryUntil: admin.firestore.FieldValue.delete(),
        memoryArchive: admin.firestore.FieldValue.arrayUnion(archiveEntry),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn("archiveExpiredMemory failed:", e.message);
    return memory;
  }

  return {
    ...memory,
    pendingQuestions: [],
    preVisitNotes: "",
    memoryUntil: null,
  };
}

/**
 * Upsert patient profile after a booking.
 * Rolls pending questions into preVisitNotes and sets memoryUntil from appointmentAt.
 */
async function upsertPatientMemory({
  clinicId,
  name,
  phone,
  email,
  service,
  preferredTime,
  reference,
  urgent,
  notes,
  appointmentAt,
}) {
  const id = patientDocId(clinicId, phone);
  if (!id) return null;

  const db = admin.firestore();
  const ref = db.collection("patients").doc(id);
  const visit = {
    service: String(service || "").slice(0, 120),
    preferredTime: String(preferredTime || "").slice(0, 120),
    reference: String(reference || "").slice(0, 20),
    urgent: Boolean(urgent),
    notes: String(notes || "").slice(0, 300),
    bookedAt: new Date().toISOString(),
  };

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const prev = snap.exists ? snap.data() : {};
    const history = Array.isArray(prev.history) ? prev.history.slice(0, 19) : [];
    history.unshift(visit);

    const pending = Array.isArray(prev.pendingQuestions) ? prev.pendingQuestions : [];
    const rolled = summarizePendingQuestions(pending);
    const priorNotes = String(prev.preVisitNotes || "").trim();
    const bookingNote = String(notes || "").trim();
    const parts = [
      priorNotes,
      rolled ? `Questions before booking:\n${rolled}` : "",
      bookingNote ? `Booking notes: ${bookingNote}` : "",
      `Booked: ${visit.service} — ${visit.preferredTime}${visit.reference ? ` (ref ${visit.reference})` : ""}`,
    ].filter(Boolean);
    const preVisitNotes = parts.join("\n\n").slice(0, MAX_PRE_VISIT_NOTES);

    const patch = {
      clinicId: clinicId || "demo",
      phoneDigits: phoneKey(phone),
      phone: String(phone || "").slice(0, 40),
      name: String(name || prev.name || "").slice(0, 120),
      email: String(email || prev.email || "").slice(0, 160),
      history,
      lastService: visit.service,
      lastPreferredTime: visit.preferredTime,
      lastReference: visit.reference,
      visitCount: (prev.visitCount || 0) + 1,
      pendingQuestions: [],
      preVisitNotes,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: prev.createdAt || admin.firestore.FieldValue.serverTimestamp(),
    };

    const untilDate =
      appointmentAt instanceof Date
        ? appointmentAt
        : appointmentAt && typeof appointmentAt.toDate === "function"
          ? appointmentAt.toDate()
          : appointmentAt
            ? new Date(appointmentAt)
            : null;
    if (untilDate && !Number.isNaN(untilDate.getTime())) {
      patch.memoryUntil = admin.firestore.Timestamp.fromDate(untilDate);
    }

    tx.set(ref, patch, { merge: true });
  });

  return id;
}

/**
 * Append a question and/or preference patch while phone is known (pre-booking).
 */
async function appendPatientInteraction({
  clinicId,
  phone,
  name,
  question,
  preferencePatch,
  forceNote,
}) {
  const id = patientDocId(clinicId, phone);
  if (!id) return null;

  const qText = String(question || "").trim().slice(0, MAX_QUESTION_LEN);
  const storeQ = qText && (forceNote || shouldStoreAsQuestion(qText));
  const inferred = preferencePatch || (qText ? inferPreferencePatch(qText) : null);
  if (!storeQ && !inferred && !forceNote) return id;

  const db = admin.firestore();
  const ref = db.collection("patients").doc(id);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const prev = snap.exists ? snap.data() : {};
    const pending = Array.isArray(prev.pendingQuestions) ? prev.pendingQuestions.slice(0, MAX_PENDING_QUESTIONS - 1) : [];

    if (storeQ) {
      const topic = guessTopic(qText);
      const dup = pending[0] && String(pending[0].text || "").toLowerCase() === qText.toLowerCase();
      if (!dup) {
        pending.unshift({
          text: qText,
          askedAt: new Date().toISOString(),
          ...(topic ? { topic } : {}),
        });
      }
    }

    const preferences = mergePreferences(prev.preferences, inferred);
    if (forceNote && qText) {
      preferences.notes = mergePreferences(preferences, { notes: qText }).notes;
    }

    tx.set(
      ref,
      {
        clinicId: clinicId || "demo",
        phoneDigits: phoneKey(phone),
        phone: String(phone || prev.phone || "").slice(0, 40),
        name: String(name || prev.name || "").slice(0, 120),
        pendingQuestions: pending.slice(0, MAX_PENDING_QUESTIONS),
        preferences,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: prev.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  return id;
}

/**
 * Load patient memory by phone for a clinic.
 * Prefers patients/{id}; falls back to recent appointments with matching phoneDigits.
 * Archives expired pre-visit memory when memoryUntil has passed.
 */
async function lookupPatientMemory(clinicId, phone) {
  const key = phoneKey(phone);
  if (!key) return null;
  const db = admin.firestore();
  const id = patientDocId(clinicId, phone);

  const snap = await db.collection("patients").doc(id).get();
  if (snap.exists) {
    let memory = shapeMemoryFromDoc(snap.id, snap.data() || {});
    memory = await archiveExpiredMemory(clinicId, phone, memory);
    return memory;
  }

  // Fallback: scan recent appointments for this clinic + phone digits
  try {
    const apptSnap = await db
      .collection("appointments")
      .where("clinicId", "==", clinicId || "demo")
      .orderBy("createdAt", "desc")
      .limit(40)
      .get();

    const matched = [];
    apptSnap.forEach((doc) => {
      const a = doc.data() || {};
      const digits = a.phoneDigits || phoneKey(a.phone);
      if (digits === key) {
        matched.push({
          service: a.service || "",
          preferredTime: a.preferredTime || "",
          reference: doc.id.slice(0, 6).toUpperCase(),
          urgent: Boolean(a.urgent),
          notes: a.notes || a.triageReason || "",
          bookedAt: a.createdAt && typeof a.createdAt.toDate === "function"
            ? a.createdAt.toDate().toISOString()
            : "",
          name: a.name || "",
          phone: a.phone || "",
          email: a.email || "",
        });
      }
    });

    if (!matched.length) return null;
    const latest = matched[0];
    return {
      id: id,
      name: latest.name,
      phone: latest.phone,
      email: latest.email,
      visitCount: matched.length,
      lastService: latest.service,
      lastPreferredTime: latest.preferredTime,
      lastReference: latest.reference,
      history: matched.slice(0, 5),
      pendingQuestions: [],
      preferences: {},
      preVisitNotes: "",
      memoryUntil: null,
      updatedAt: formatWhen(null),
    };
  } catch (e) {
    console.warn("Appointment fallback lookup failed:", e.message);
    return null;
  }
}

/**
 * Batch-archive patients whose memoryUntil has passed (used by reminders job).
 */
async function archiveExpiredPatientMemories({ limit = 40 } = {}) {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();
  let archived = 0;
  try {
    const snap = await db
      .collection("patients")
      .where("memoryUntil", "<=", now)
      .limit(limit)
      .get();

    for (const doc of snap.docs) {
      const d = doc.data() || {};
      const memory = shapeMemoryFromDoc(doc.id, d);
      await archiveExpiredMemory(d.clinicId || "demo", d.phone || d.phoneDigits, memory);
      archived += 1;
    }
  } catch (e) {
    // Index may not exist yet — lookup path still archives per patient
    console.warn("archiveExpiredPatientMemories query failed:", e.message);
  }
  return archived;
}

/** Prompt block for Maya — only include when we have a match. */
function patientMemoryContext(memory) {
  if (!memory) return "";
  const lines = (memory.history || []).slice(0, 5).map((h, i) => {
    const when = h.bookedAt ? String(h.bookedAt).slice(0, 10) : "";
    return `  ${i + 1}. ${h.service || "Visit"} — ${h.preferredTime || "time TBD"}${h.reference ? ` (ref ${h.reference})` : ""}${when ? ` · booked ${when}` : ""}${h.urgent ? " · URGENT" : ""}`;
  });

  const prefs = memory.preferences && typeof memory.preferences === "object" ? memory.preferences : {};
  const prefLines = [];
  if (prefs.language) prefLines.push(`  - Language: ${prefs.language}`);
  if (prefs.tone) prefLines.push(`  - Tone: ${prefs.tone}`);
  if (Array.isArray(prefs.topicsOfInterest) && prefs.topicsOfInterest.length) {
    prefLines.push(`  - Topics of interest: ${prefs.topicsOfInterest.join(", ")}`);
  }
  if (prefs.notes) prefLines.push(`  - Notes to remember: ${String(prefs.notes).slice(0, 240)}`);

  const pending = Array.isArray(memory.pendingQuestions) ? memory.pendingQuestions.slice(0, 8) : [];
  const pendingLines = pending.map((q, i) => {
    const when = q.askedAt ? String(q.askedAt).slice(0, 10) : "";
    return `  ${i + 1}. ${String(q.text || "").slice(0, 160)}${q.topic ? ` [${q.topic}]` : ""}${when ? ` · ${when}` : ""}`;
  });

  const preVisit = String(memory.preVisitNotes || "").trim().slice(0, 600);

  return `
RETURNING PATIENT MEMORY (from clinic records — use this when they ask about a previous appointment or visit):
- Name on file: ${memory.name || "(unknown)"}
- Phone on file: ${memory.phone || "(unknown)"}
- Visits on file: ${memory.visitCount || lines.length}
- Latest booking: ${memory.lastService || "—"} at ${memory.lastPreferredTime || "—"}${memory.lastReference ? ` (ref ${memory.lastReference})` : ""}
- Recent history:
${lines.length ? lines.join("\n") : "  (none yet)"}
${prefLines.length ? `\nPATIENT PREFERENCES (adapt tone/order; never invent clinical facts):\n${prefLines.join("\n")}` : ""}
${pendingLines.length ? `\nPENDING QUESTIONS (until visit — if they ask again, answer consistently; staff can use these at the appointment):\n${pendingLines.join("\n")}` : ""}
${preVisit ? `\nPRE-VISIT NOTES (keep until appointment):\n${preVisit}` : ""}
RULES FOR MEMORY:
- If they ask "what was my appointment?", "when am I booked?", "do you have my details?" — answer from this record.
- Confirm you're speaking to the right person (use their name) before sharing details.
- Never invent visits, preferences, or questions that are not listed above.
- Adapt to PATIENT PREFERENCES when present (language, concise vs detailed).
- If PENDING QUESTIONS overlap with this turn, acknowledge continuity briefly ("as you asked earlier…").
- If they want to change/cancel, note the request and offer to book a new slot or have staff call them back.
- Use remember_patient_note when they say "please remember…" or share a lasting preference.`;
}

/** Pull a phone number from draft or recent user messages. */
function extractPhoneCandidate(draft, history) {
  if (draft && phoneKey(draft.phone)) return String(draft.phone).trim();
  const userText = (Array.isArray(history) ? history : [])
    .filter((m) => m.role === "user")
    .map((m) => m.content || "")
    .join("\n");
  const matches = userText.match(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}|\d{10,}/g);
  if (!matches?.length) return "";
  const last = matches[matches.length - 1];
  return phoneKey(last) ? last : "";
}

module.exports = {
  phoneKey,
  patientDocId,
  upsertPatientMemory,
  appendPatientInteraction,
  lookupPatientMemory,
  patientMemoryContext,
  extractPhoneCandidate,
  shouldStoreAsQuestion,
  inferPreferencePatch,
  archiveExpiredPatientMemories,
  archiveExpiredMemory,
};
