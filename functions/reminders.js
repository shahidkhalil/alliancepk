/**
 * Phase 1 appointment reminders: email at ~T-24h and ~T-1h.
 * Runs every 15 minutes via Cloud Scheduler.
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

async function processWindow(db, now, window, gmailUser, gmailPass) {
  const from = admin.firestore.Timestamp.fromDate(new Date(now.getTime() + window.minMs));
  const to = admin.firestore.Timestamp.fromDate(new Date(now.getTime() + window.maxMs));

  const snap = await db
    .collection("appointments")
    .where("appointmentAt", ">=", from)
    .where("appointmentAt", "<=", to)
    .limit(100)
    .get();

  let sent = 0;
  for (const doc of snap.docs) {
    const appt = { id: doc.id, ...doc.data() };
    if (appt[window.flag]) continue;
    if (appt.status === "cancelled" || appt.status === "completed") continue;
    if (!String(appt.email || "").trim()) continue;

    const clinic = getClinic(appt.clinicId || "demo");
    try {
      const ok = await sendReminderEmail({ appt, clinic, window, gmailUser, gmailPass });
      if (!ok) continue;
      await doc.ref.update({
        [window.flag]: true,
        [`${window.flag}At`]: admin.firestore.FieldValue.serverTimestamp(),
      });
      sent += 1;
    } catch (e) {
      console.warn(`Reminder ${window.flag} failed for ${doc.id}:`, e.message);
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
  },
  async () => {
    const db = admin.firestore();
    const now = new Date();
    const gmailUser = GMAIL_USER.value();
    const gmailPass = GMAIL_APP_PASSWORD.value();

    const sent24 = await processWindow(db, now, WINDOW_24H, gmailUser, gmailPass);
    const sent1 = await processWindow(db, now, WINDOW_1H, gmailUser, gmailPass);
    let archived = 0;
    try {
      archived = await archiveExpiredPatientMemories({ limit: 40 });
    } catch (e) {
      console.warn("Patient memory archive failed:", e.message);
    }
    console.log(`Reminders sent — 24h: ${sent24}, 1h: ${sent1}; memory archived: ${archived}`);
  }
);
