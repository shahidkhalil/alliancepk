/**
 * Phase 1 appointment reminders: email at ~T-24h and ~T-1h.
 * Runs every 15 minutes via Cloud Scheduler.
 *
 * Dedup: claim reminder24hSent / reminder1hSent in a transaction BEFORE
 * sending so overlapping scheduler runs cannot email the same patient twice.
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { getClinic } = require("./lib/clinicKB");
const { DEFAULT_TZ } = require("./lib/appointmentTime");
const {
  getLogoAttachment,
  buildAppointmentEmailHtml,
  buildAppointmentEmailText,
} = require("./lib/appointmentEmail");
const { archiveExpiredPatientMemories } = require("./lib/patientMemory");

const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");

const WINDOW_24H = { minMs: 23 * 3600 * 1000, maxMs: 25 * 3600 * 1000, flag: "reminder24hSent", label: "24 hours" };
const WINDOW_1H = { minMs: 50 * 60 * 1000, maxMs: 70 * 60 * 1000, flag: "reminder1hSent", label: "1 hour" };

/** Reminder emails only — booking confirmations and lead alerts are unchanged. */
function reminderOptOutSet(gmailUser) {
  const set = new Set();
  const add = (email) => {
    const normalized = String(email || "").trim().toLowerCase();
    if (normalized) set.add(normalized);
  };
  add(gmailUser);
  add(process.env.ALERT_TO);
  for (const part of String(process.env.REMINDER_OPT_OUT_EMAILS || "").split(",")) add(part);
  return set;
}

function isReminderOptedOut(email, optOutSet) {
  return optOutSet.has(String(email || "").trim().toLowerCase());
}

function formatWhen(appointmentAt, timezone) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || DEFAULT_TZ,
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(appointmentAt.toDate ? appointmentAt.toDate() : appointmentAt);
  } catch {
    return "";
  }
}

async function sendReminderEmail({ appt, clinic, window, gmailUser, gmailPass }) {
  const user = (gmailUser || "").trim();
  const pass = (gmailPass || "").replace(/[\s ]+/g, "");
  const to = String(appt.email || "").trim();
  if (!user || !pass || !to) return false;

  const when =
    formatWhen(appt.appointmentAt, appt.timezone) ||
    appt.preferredTime ||
    "your scheduled time";
  const reference = appt.reference || String(appt.id || "").slice(0, 6).toUpperCase();

  const payload = {
    kind: "reminder",
    patientName: appt.name,
    clinic,
    service: appt.service || "Visit",
    when,
    phone: appt.phone,
    email: to,
    reference,
    appointmentId: appt.id,
    reminderLabel: window.label,
  };

  const logo = getLogoAttachment();
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  await transporter.sendMail({
    from: `"${clinic.name} via Alliance Tech" <${user}>`,
    to,
    subject: `Appointment Reminder — in ${window.label} (${clinic.name})`,
    text: buildAppointmentEmailText(payload),
    html: buildAppointmentEmailHtml(payload),
    attachments: logo ? [logo] : [],
  });
  return true;
}

/** Atomically claim this reminder slot. Returns false if already claimed. */
async function claimReminder(docRef, flag) {
  const db = admin.firestore();
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    if (!snap.exists) return false;
    const data = snap.data() || {};
    if (data[flag] === true) return false;
    if (data.status === "cancelled" || data.status === "completed") return false;
    tx.update(docRef, {
      [flag]: true,
      [`${flag}At`]: admin.firestore.FieldValue.serverTimestamp(),
    });
    return true;
  });
}

async function releaseReminderClaim(docRef, flag) {
  try {
    await docRef.update({
      [flag]: false,
      [`${flag}At`]: admin.firestore.FieldValue.delete(),
    });
  } catch (e) {
    console.warn(`Failed to release ${flag} on ${docRef.id}:`, e.message);
  }
}

async function processWindow(db, now, window, gmailUser, gmailPass, optOutSet) {
  const from = admin.firestore.Timestamp.fromDate(new Date(now.getTime() + window.minMs));
  const to = admin.firestore.Timestamp.fromDate(new Date(now.getTime() + window.maxMs));

  // Prefer unsent-only query (needs composite index). Fall back to time-range only.
  let snap;
  try {
    snap = await db
      .collection("appointments")
      .where(window.flag, "==", false)
      .where("appointmentAt", ">=", from)
      .where("appointmentAt", "<=", to)
      .limit(100)
      .get();
  } catch (e) {
    console.warn(
      `Reminder query with ${window.flag}==false failed (index?), falling back:`,
      e.message
    );
    snap = await db
      .collection("appointments")
      .where("appointmentAt", ">=", from)
      .where("appointmentAt", "<=", to)
      .limit(100)
      .get();
  }

  let sent = 0;
  for (const doc of snap.docs) {
    const appt = { id: doc.id, ...doc.data() };
    if (appt[window.flag] === true) continue;
    if (appt.status === "cancelled" || appt.status === "completed") continue;
    const patientEmail = String(appt.email || "").trim();
    if (!patientEmail) continue;

    let claimed = false;
    try {
      claimed = await claimReminder(doc.ref, window.flag);
      if (!claimed) continue;

      if (isReminderOptedOut(patientEmail, optOutSet)) {
        console.log(`Reminder skipped (opt-out): ${patientEmail}`);
        sent += 1;
        continue;
      }

      const clinic = getClinic(appt.clinicId || "demo");
      const ok = await sendReminderEmail({ appt, clinic, window, gmailUser, gmailPass });
      if (!ok) {
        await releaseReminderClaim(doc.ref, window.flag);
        continue;
      }
      sent += 1;
    } catch (e) {
      console.warn(`Reminder ${window.flag} failed for ${doc.id}:`, e.message);
      if (claimed) await releaseReminderClaim(doc.ref, window.flag);
    }
  }
  return sent;
}

exports.sendAppointmentReminders = onSchedule(
  {
    schedule: "every 15 minutes",
    region: "asia-south1",
    timeZone: DEFAULT_TZ,
    secrets: [GMAIL_USER, GMAIL_APP_PASSWORD],
    timeoutSeconds: 120,
    memory: "256MiB",
    // Prevent overlapping scheduler ticks from sending the same reminder twice.
    maxInstances: 1,
  },
  async () => {
    const db = admin.firestore();
    const now = new Date();
    const gmailUser = GMAIL_USER.value();
    const gmailPass = GMAIL_APP_PASSWORD.value();
    const optOutSet = reminderOptOutSet(gmailUser);

    const sent24 = await processWindow(db, now, WINDOW_24H, gmailUser, gmailPass, optOutSet);
    const sent1 = await processWindow(db, now, WINDOW_1H, gmailUser, gmailPass, optOutSet);
    let archived = 0;
    try {
      archived = await archiveExpiredPatientMemories({ limit: 40 });
    } catch (e) {
      console.warn("Patient memory archive failed:", e.message);
    }
    console.log(`Reminders sent — 24h: ${sent24}, 1h: ${sent1}; memory archived: ${archived}`);
  }
);
