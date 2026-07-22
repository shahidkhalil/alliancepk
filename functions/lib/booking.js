/**
 * Shared booking pipeline: persist the appointment, create a lead
 * (which fires the owner's email alert), and email the patient a
 * confirmation. Used by both the chat receptionist and the live
 * realtime voice agent.
 */

const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { upsertPatientMemory, phoneKey } = require("./patientMemory");
const { resolveAppointmentAt, DEFAULT_TZ } = require("./appointmentTime");
const {
  getLogoAttachment,
  buildAppointmentEmailHtml,
  buildAppointmentEmailText,
} = require("./appointmentEmail");

function formatWhen(args, resolved) {
  if (!resolved?.appointmentAt) return args.preferredTime;
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: resolved.timezone || DEFAULT_TZ,
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(resolved.appointmentAt);
  } catch {
    return args.preferredTime;
  }
}

async function sendConfirmationEmail(args, clinic, reference, appointmentId, gmailUser, gmailPass, resolved) {
  const user = (gmailUser || "").trim();
  const pass = (gmailPass || "").replace(/[\s ]+/g, "");
  if (!user || !pass || !args.email) return;

  const when = formatWhen(args, resolved);
  const payload = {
    kind: "confirm",
    patientName: args.name,
    clinic,
    service: args.service,
    when,
    phone: args.phone,
    email: args.email,
    reference,
    appointmentId,
  };

  const logo = getLogoAttachment();
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  await transporter.sendMail({
    from: `"${clinic.name} via Alliance Tech" <${user}>`,
    to: args.email,
    subject: `Appointment Confirmed — ${clinic.name} (Ref ${reference})`,
    text: buildAppointmentEmailText(payload),
    html: buildAppointmentEmailHtml(payload),
    attachments: logo ? [logo] : [],
  });
}

/**
 * Book + notify. Returns { id, reference }.
 * `source` distinguishes chat vs live voice bookings.
 */
async function bookAndNotify({ args, clinicId, clinic, source, gmailUser, gmailPass }) {
  const db = admin.firestore();
  const resolved = resolveAppointmentAt(args.preferredTime);

  const appointmentFields = {
    ...args,
    clinicId: clinicId || "demo",
    clinicName: clinic.name,
    source: source || "ai_receptionist",
    status: "new",
    phoneDigits: phoneKey(args.phone),
    priority: args.urgent || args.priority === "urgent" ? "urgent" : "normal",
    urgent: Boolean(args.urgent),
    triageReason: args.triageReason || "",
    timezone: resolved?.timezone || DEFAULT_TZ,
    reminder24hSent: false,
    reminder1hSent: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (resolved?.appointmentAt) {
    appointmentFields.appointmentAt = admin.firestore.Timestamp.fromDate(resolved.appointmentAt);
  }

  const docRef = db.collection("appointments").doc();
  const reference = docRef.id.slice(0, 6).toUpperCase();
  await docRef.set({
    ...appointmentFields,
    reference,
  });

  await db.collection("leads").add({
    name: args.name,
    phone: args.phone,
    email: args.email || "",
    source: source || "ai_receptionist",
    clinicName: clinic.name,
    message: `${args.urgent ? "🚨 URGENT — " : ""}Appointment: ${args.service} — ${args.preferredTime}${args.notes ? ` (${args.notes})` : ""}`,
    priority: args.urgent ? "urgent" : "normal",
    urgent: Boolean(args.urgent),
    triageReason: args.triageReason || "",
    status: "new",
    completionStatus: "complete",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }).catch(() => {});

  upsertPatientMemory({
    clinicId: clinicId || "demo",
    name: args.name,
    phone: args.phone,
    email: args.email || "",
    service: args.service,
    preferredTime: args.preferredTime,
    reference,
    urgent: Boolean(args.urgent),
    notes: args.notes || args.triageReason || "",
    appointmentAt: resolved?.appointmentAt || null,
  }).catch((e) => console.warn("Patient memory upsert failed:", e.message));

  sendConfirmationEmail(args, clinic, reference, docRef.id, gmailUser, gmailPass, resolved).catch((e) =>
    console.warn("Confirmation email failed:", e.message)
  );

  return { id: docRef.id, reference, appointmentAt: resolved?.appointmentAt || null };
}

module.exports = { bookAndNotify };
