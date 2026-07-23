/**
 * Lead + incomplete-form email alerts.
 * - Admin: HTML lead alert with logo + single "Get Free Audit" button
 * - User: confirmation email when they provided an email
 * Secrets: GMAIL_USER, GMAIL_APP_PASSWORD. Optional env: ALERT_TO.
 */

const path = require("path");
const fs = require("fs");
const { onDocumentCreated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const nodemailer = require("nodemailer");
const { buildGrowthReportUserHtml, buildGrowthReportUserText } = require("./lib/growthReportEmail");

const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");

const SITE_URL = "https://alliancetechltd.com";
const AUDIT_URL = `${SITE_URL}/free-website-audit`;
const ADMIN_URL = `${SITE_URL}/admin`;
const LOGO_PATH = path.join(__dirname, "assets", "logo.png");

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
  console.log("Embedding website logo in emails from", LOGO_PATH);
  return {
    filename: "logo.png",
    path: LOGO_PATH,
    cid: "alliance-logo",
  };
}

function buildAdminHtml(lead, badge, headline) {
  const rows = [
    ["Name", lead.name],
    ["Phone", lead.phone],
    lead.email ? ["Email", lead.email] : null,
    lead.website ? ["Website", lead.website] : null,
    lead.auditScore != null
      ? ["Audit score", `${lead.auditScore}/100 — ${lead.auditVerdict || ""}`]
      : null,
    lead.topIssue ? ["Top issue", lead.topIssue] : null,
    lead.clinicName ? ["Clinic", lead.clinicName] : null,
    lead.clinicType ? ["Type", lead.clinicType] : null,
    lead.message ? ["Message", lead.message] : null,
    lead.step != null ? ["Form step", String(Number(lead.step) + 1)] : null,
    ["Source", lead.source || "website"],
  ].filter(Boolean);

  const detailRows = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eef2f6;color:#64748b;font-size:13px;width:120px;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eef2f6;color:#0f172a;font-size:14px;font-weight:600;">${escapeHtml(value || "-")}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:#00283C;padding:28px 32px;text-align:center;">
              <img src="cid:alliance-logo" alt="Alliance Tech" width="180" style="display:block;margin:0 auto;max-width:180px;height:auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#0077A8;">${escapeHtml(badge)}</p>
              <h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;color:#00283C;">${escapeHtml(headline)}</h1>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
                ${detailRows}
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="border-radius:8px;background:#00283C;">
                    <a href="${AUDIT_URL}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Get Free Audit
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 28px;text-align:center;border-top:1px solid #eef2f6;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">Alliance Tech · Houston, Texas · <a href="${ADMIN_URL}" style="color:#0077A8;">Admin panel</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildUserHtml(lead) {
  const name = (lead.name || "there").split(" ")[0];
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:#00283C;padding:28px 32px;text-align:center;">
              <img src="cid:alliance-logo" alt="Alliance Tech" width="180" style="display:block;margin:0 auto;max-width:180px;height:auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#00283C;">Thanks, ${escapeHtml(name)} — we got your request</h1>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#475569;">
                Our team will review your details and get back to you within 2 hours. Meanwhile, you can run a free AI website audit anytime.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="border-radius:8px;background:#00283C;">
                    <a href="${AUDIT_URL}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Get Free Audit
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 28px;text-align:center;border-top:1px solid #eef2f6;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">Alliance Tech · Sales@alliancetechltd.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildAdminText(lead) {
  return [
    `Name: ${lead.name || "-"}`,
    `Phone: ${lead.phone || "-"}`,
    lead.email ? `Email: ${lead.email}` : null,
    lead.website ? `Website: ${lead.website}` : null,
    lead.auditScore != null ? `Audit score: ${lead.auditScore}/100 — ${lead.auditVerdict || ""}` : null,
    lead.topIssue ? `Top issue: ${lead.topIssue}` : null,
    lead.clinicName ? `Clinic: ${lead.clinicName}` : null,
    lead.clinicType ? `Type: ${lead.clinicType}` : null,
    lead.message ? `Message: ${lead.message}` : null,
    lead.step != null ? `Form step: ${Number(lead.step) + 1}` : null,
    `Source: ${lead.source || "-"}`,
    ``,
    `Get Free Audit: ${AUDIT_URL}`,
    `Admin: ${ADMIN_URL}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function createTransport() {
  const user = (GMAIL_USER.value() || "").trim();
  const pass = (GMAIL_APP_PASSWORD.value() || "").replace(/[\s\u00a0]+/g, "");
  if (!user || !pass) {
    console.warn("Gmail secrets not configured — skipping alert");
    return null;
  }
  return {
    user,
    transporter: nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    }),
  };
}

async function sendAdminAlert({ subject, badge, headline, lead }) {
  const mail = createTransport();
  if (!mail) return false;

  const logo = getLogoAttachment();
  await mail.transporter.sendMail({
    from: `"Alliance Leads" <${mail.user}>`,
    to: process.env.ALERT_TO || mail.user,
    subject,
    text: buildAdminText(lead),
    html: buildAdminHtml(lead, badge, headline),
    attachments: logo ? [logo] : [],
  });
  return true;
}

async function sendUserConfirmation(lead) {
  const email = (lead.email || "").trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;

  const mail = createTransport();
  if (!mail) return false;

  const logo = getLogoAttachment();
  const name = (lead.name || "there").split(" ")[0];
  const isGrowthAudit = lead.source === "business_growth_audit" && lead.growthReport;

  await mail.transporter.sendMail({
    from: `"Alliance Tech" <${mail.user}>`,
    to: email,
    subject: isGrowthAudit
      ? `Your Business Growth Report — Score ${lead.growthReport.growthScore ?? lead.auditScore ?? ""}/100`
      : "We received your request — Alliance Tech",
    text: isGrowthAudit
      ? buildGrowthReportUserText(lead)
      : [
          `Hi ${name},`,
          ``,
          `Thanks for reaching out to Alliance Tech. We've received your details and our team will contact you within 2 hours.`,
          ``,
          `While you wait, you can run a free website audit here:`,
          AUDIT_URL,
          ``,
          `— Alliance Tech`,
          `Sales@alliancetechltd.com`,
        ].join("\n"),
    html: isGrowthAudit ? buildGrowthReportUserHtml(lead) : buildUserHtml(lead),
    attachments: logo ? [logo] : [],
  });
  return true;
}

function hasContact(data) {
  return Boolean((data?.name || "").trim() || (data?.phone || "").trim());
}

exports.leadAlert = onDocumentCreated(
  {
    document: "leads/{leadId}",
    region: "asia-south1",
    secrets: [GMAIL_USER, GMAIL_APP_PASSWORD],
  },
  async (event) => {
    const lead = event.data?.data();
    if (!lead) return;

    if (lead.completionStatus === "partial") {
      console.log(`Skipping alert for partial lead ${event.params.leadId}`);
      return;
    }

    const isAudit = lead.source === "audit_bot";
    const isGrowthAudit = lead.source === "business_growth_audit";
    const isUrgent = lead.urgent === true || lead.priority === "urgent";
    const subject = isUrgent
      ? `🚨 URGENT triage: ${lead.name || "Caller"} — ${lead.triageReason || lead.message || "emergency"}`
      : isAudit
      ? `New audit lead: ${lead.name || "Unknown"} (${lead.website || "no site"}, score ${lead.auditScore ?? "?"})`
      : isGrowthAudit
        ? `New growth audit lead: ${lead.name || "Unknown"} (${lead.clinicName || "—"}, score ${lead.auditScore ?? "?"}/100)`
        : `New lead: ${lead.name || "Unknown"} (${lead.source || "website"})`;

    const adminOk = await sendAdminAlert({
      subject,
      badge: isUrgent ? "🚨 Urgent triage" : isGrowthAudit ? "Business growth audit" : "New lead alert",
      headline: isUrgent
        ? "Emergency triage — staff action needed"
        : isGrowthAudit
        ? "Someone completed the Business Growth Audit"
        : "Someone just submitted your form",
      lead,
    });
    if (adminOk) console.log(`Admin lead email sent for ${event.params.leadId}`);

    try {
      // Maya bookings already send a dedicated appointment confirmation —
      // skip the generic "we received your request" email for those leads.
      const mayaSource = String(lead.source || "").startsWith("ai_receptionist");
      if (!mayaSource) {
        const userOk = await sendUserConfirmation(lead);
        if (userOk) console.log(`User email sent to ${lead.email} for ${event.params.leadId}`);
      } else {
        console.log(`Skipping user lead email for Maya source ${lead.source}`);
      }
    } catch (err) {
      console.error("User confirmation email failed:", err.message);
    }
  }
);

exports.draftAlert = onDocumentWritten(
  {
    document: "form_drafts/{draftId}",
    region: "asia-south1",
    secrets: [GMAIL_USER, GMAIL_APP_PASSWORD],
  },
  async (event) => {
    const after = event.data?.after;
    if (!after?.exists) return;

    const lead = after.data();
    if (!lead || lead.alertSent) return;
    if (lead.completionStatus === "submitted") return;
    if (!hasContact(lead)) return;

    const before = event.data?.before?.exists ? event.data.before.data() : null;
    if (before && hasContact(before)) return;

    const sent = await sendAdminAlert({
      subject: `Incomplete form: ${lead.name || lead.phone || "Unknown"}`,
      badge: "Incomplete form",
      headline: "Someone started your form but hasn’t submitted yet",
      lead,
    });

    if (sent) {
      await after.ref.set({ alertSent: true }, { merge: true });
      console.log(`Draft alert sent for ${event.params.draftId}`);
    }
  }
);
