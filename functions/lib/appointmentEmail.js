/**
 * Professional HTML emails for appointment confirmation + reminders.
 * Matches Alliance Tech lead/audit email styling (logo, navy header, CTA).
 */

const path = require("path");
const fs = require("fs");

const SITE_URL = "https://alliancetechltd.com";
const BOT_URL = `${SITE_URL}/ai-receptionist`;
const LOGO_PATH = path.join(__dirname, "..", "assets", "logo.png");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getLogoAttachment() {
  if (!fs.existsSync(LOGO_PATH)) {
    console.warn("Logo file missing at", LOGO_PATH);
    return null;
  }
  return {
    filename: "logo.png",
    path: LOGO_PATH,
    cid: "alliance-logo",
  };
}

function botLink({ reference, appointmentId, intent }) {
  const params = new URLSearchParams();
  if (reference) params.set("ref", String(reference));
  if (appointmentId) params.set("appt", String(appointmentId));
  if (intent) params.set("intent", String(intent));
  const q = params.toString();
  return `${BOT_URL}${q ? `?${q}` : ""}#demo`;
}

function detailRow(label, value) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eef2f6;width:120px;vertical-align:top;">
        <span style="font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;">${escapeHtml(label)}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #eef2f6;vertical-align:top;">
        <span style="font-size:14px;font-weight:600;color:#00283C;line-height:1.45;">${escapeHtml(value)}</span>
      </td>
    </tr>`;
}

function buildAppointmentEmailHtml({
  kind, // "confirm" | "reminder"
  patientName,
  clinic,
  service,
  when,
  phone,
  email,
  reference,
  appointmentId,
  reminderLabel,
}) {
  const first = escapeHtml((patientName || "there").split(" ")[0]);
  const checkUrl = botLink({ reference, appointmentId, intent: "check" });
  const chatUrl = botLink({ reference, appointmentId, intent: "chat" });

  const isReminder = kind === "reminder";
  const eyebrow = isReminder ? `Appointment reminder · ${reminderLabel || ""}` : "Appointment confirmed";
  const headline = isReminder
    ? `Hi ${first}, your visit is in about ${escapeHtml(reminderLabel || "a little while")}`
    : `Hi ${first}, your appointment is confirmed`;
  const intro = isReminder
    ? `This is a friendly reminder from <strong>${escapeHtml(clinic.name)}</strong>, powered by Alliance Tech&apos;s AI receptionist Maya.`
    : `Thank you for booking with <strong>${escapeHtml(clinic.name)}</strong>. Your details are below — save this email for your records.`;

  const ctaLabel = isReminder ? "Check appointment with Maya" : "View / manage with Maya";
  const secondaryNote = isReminder
    ? "Need to reschedule? Open Maya below or reply to this email."
    : "We&apos;ll also email reminders about 24 hours and 1 hour before your visit.";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:#00283C;padding:28px 32px;text-align:center;">
              <img src="cid:alliance-logo" alt="Alliance Tech" width="180" style="display:block;margin:0 auto;max-width:180px;height:auto;" />
              <p style="margin:14px 0 0;font-size:12px;color:rgba(255,255,255,0.7);letter-spacing:0.04em;">AI Receptionist · Clinic Booking</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#0077A8;">${eyebrow}</p>
              <h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;color:#00283C;">${headline}</h1>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">${intro}</p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:8px;background:#F8FCFE;border:1px solid #e2e8f0;border-radius:12px;">
                <tr>
                  <td style="padding:8px 20px 4px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      ${detailRow("Service", service)}
                      ${detailRow("When", when)}
                      ${detailRow("Reference", reference)}
                      ${detailRow("Phone", phone)}
                      ${detailRow("Email", email)}
                      ${detailRow("Clinic", clinic.name)}
                      ${detailRow("Address", clinic.address)}
                      ${detailRow("Hours", clinic.hours ? `${clinic.hours.weekdays} (Sun: ${clinic.hours.sunday})` : "")}
                      ${detailRow("Clinic phone", clinic.phone)}
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0;font-size:13px;line-height:1.55;color:#64748b;">${secondaryNote}</p>
              ${
                clinic.policies?.firstVisit
                  ? `<p style="margin:12px 0 0;font-size:13px;line-height:1.55;color:#475569;">${escapeHtml(clinic.policies.firstVisit)}</p>`
                  : ""
              }
              ${
                clinic.policies?.cancellation
                  ? `<p style="margin:8px 0 0;font-size:13px;line-height:1.55;color:#475569;">${escapeHtml(clinic.policies.cancellation)}</p>`
                  : ""
              }

              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px auto 0;" align="center">
                <tr>
                  <td align="center" style="border-radius:8px;background:#00283C;">
                    <a href="${escapeHtml(checkUrl)}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">
                      ${ctaLabel}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 0;text-align:center;font-size:12px;line-height:1.5;color:#94a3b8;">
                Or chat with Maya anytime:<br/>
                <a href="${escapeHtml(chatUrl)}" style="color:#0077A8;text-decoration:none;font-weight:600;">${escapeHtml(BOT_URL)}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 28px;text-align:center;border-top:1px solid #eef2f6;">
              <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Powered by Alliance Tech · Sales@alliancetechltd.com</p>
              <p style="margin:0;font-size:11px;color:#cbd5e1;">Houston, Texas · <a href="${SITE_URL}" style="color:#94a3b8;text-decoration:none;">alliancetechltd.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildAppointmentEmailText({
  kind,
  patientName,
  clinic,
  service,
  when,
  phone,
  email,
  reference,
  appointmentId,
  reminderLabel,
}) {
  const checkUrl = botLink({ reference, appointmentId, intent: "check" });
  const isReminder = kind === "reminder";
  const lines = [
    `Hi ${(patientName || "there").split(" ")[0]},`,
    ``,
    isReminder
      ? `Reminder: your appointment is in about ${reminderLabel || "a little while"}.`
      : `Your appointment has been confirmed.`,
    ``,
    `Service:   ${service || ""}`,
    `When:      ${when || ""}`,
    `Reference: ${reference || ""}`,
    phone ? `Phone:     ${phone}` : null,
    email ? `Email:     ${email}` : null,
    ``,
    `Clinic:  ${clinic.name}`,
    `Address: ${clinic.address}`,
    clinic.phone ? `Phone:   ${clinic.phone}` : null,
    ``,
    clinic.policies?.firstVisit || null,
    clinic.policies?.cancellation || null,
    ``,
    `Check or manage your appointment with Maya:`,
    checkUrl,
    ``,
    `— ${clinic.name} · Powered by Alliance Tech`,
  ];
  return lines.filter((l) => l !== null).join("\n");
}

module.exports = {
  getLogoAttachment,
  botLink,
  BOT_URL,
  buildAppointmentEmailHtml,
  buildAppointmentEmailText,
};
