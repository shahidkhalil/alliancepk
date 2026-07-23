/**
 * Alliance Tech — AI Website Audit function.
 * POST { url, city?, specialty? } -> full audit report JSON.
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

const { runPageSpeed } = require("./lib/pagespeed");
const { analyzeSeo } = require("./lib/seo");
const { findCompetitors, ALLOWED_SPECIALTIES } = require("./lib/competitors");
const { buildMoneyMap } = require("./lib/treatments");
const { buildGmbCheck } = require("./lib/gmb");
const { generateReport } = require("./lib/ai");
const { initCache, getCache, setCache, checkRateLimit } = require("./lib/cache");
const { sanitizeReport } = require("./lib/validate");
const {
  computeRevenueImpact,
  buildEvidence,
  applyComputedFields,
} = require("./lib/score");
const { applyCors, clientIp, normalizePublicUrl } = require("./lib/security");

admin.initializeApp();
const db = admin.firestore();
initCache(db);

const AUDIT_CACHE_DAYS = 7;
const PARTIAL_CACHE_DAYS = 1;
const DAILY_LIMIT_PER_IP = 10;

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const PAGESPEED_API_KEY = defineSecret("PAGESPEED_API_KEY");
const SERPER_API_KEY = defineSecret("SERPER_API_KEY");

exports.leadAlert = require("./leadAlert").leadAlert;
exports.draftAlert = require("./leadAlert").draftAlert;
exports.clinicReceptionist = require("./receptionist").clinicReceptionist;
exports.transcribeAudio = require("./transcribe").transcribeAudio;
exports.packageOrder = require("./packageOrder").packageOrder;
exports.realtimeToken = require("./realtime").realtimeToken;
exports.bookAppointmentHttp = require("./realtime").bookAppointmentHttp;
exports.sendAppointmentReminders = require("./reminders").sendAppointmentReminders;

const { handleBusinessAudit, isBusinessAuditRequest } = require("./businessAudit");

function normalizeHints(body) {
  const city = String(body?.city || "")
    .replace(/[^\p{L}\p{N}\s.'-]/gu, "")
    .trim()
    .slice(0, 60);
  let specialty = String(body?.specialty || "").trim().toLowerCase();
  if (specialty && !ALLOWED_SPECIALTIES.has(specialty)) {
    // Map common aliases
    const aliases = {
      dental: "dentist",
      dentistry: "dentist",
      "med spa": "aesthetic clinic",
      medspa: "aesthetic clinic",
      "cosmetic clinic": "aesthetic clinic",
      derm: "dermatologist",
      therapy: "psychologist",
    };
    specialty = aliases[specialty] || "";
  }
  if (specialty && !ALLOWED_SPECIALTIES.has(specialty)) specialty = "";
  return { city: city || null, specialty: specialty || null };
}

function isPartialAudit({ pagespeed, seo, competitors, gmb }) {
  if (!pagespeed?.mobile?.scores) return true;
  if (seo?.error) return true;
  if (competitors?.cityMissing || competitors?.skippedReason) return true;
  if (gmb && !gmb.matchedByDomain) return true;
  return false;
}

exports.auditWebsite = onRequest(
  {
    region: "asia-south1",
    cors: false,
    timeoutSeconds: 120,
    memory: "512MiB",
    secrets: [OPENAI_API_KEY, PAGESPEED_API_KEY, SERPER_API_KEY],
  },
  async (req, res) => {
    if (applyCors(req, res)) return;

    if (req.method !== "POST") {
      res.status(405).json({ error: "Use POST" });
      return;
    }

    if (isBusinessAuditRequest(req.body)) {
      await handleBusinessAudit(req, res, OPENAI_API_KEY.value());
      return;
    }

    const url = normalizePublicUrl(req.body?.url);
    if (!url) {
      res.status(400).json({ error: "Please provide a valid website URL." });
      return;
    }

    const hints = normalizeHints(req.body);

    try {
      // Cache includes city/specialty so a Houston-defaulted wrong run
      // doesn't poison a correct Dallas audit for the same URL.
      const locKey = `${(hints.city || "").toLowerCase()}|${hints.specialty || ""}`;
      const auditCacheKey = `audit:v2:${url}:${locKey}`;
      const cached = await getCache(auditCacheKey);
      if (cached) {
        res.status(200).json({ ...cached, meta: { ...cached.meta, cached: true } });
        return;
      }

      const ip = clientIp(req);
      if (!(await checkRateLimit(ip, DAILY_LIMIT_PER_IP, "audit"))) {
        res.status(429).json({
          error: "Daily audit limit reached. Try again tomorrow, or book a free call with our team.",
        });
        return;
      }

      const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
      const psApiKey = PAGESPEED_API_KEY.value() || undefined;

      const [pagespeed, seo] = await Promise.all([
        runPageSpeed(url, psApiKey).catch((e) => ({ error: e.message })),
        analyzeSeo(url).catch((e) => ({ error: e.message })),
      ]);

      let competitors = null;
      let moneyMap = null;
      let gmb = null;
      const serperKey = SERPER_API_KEY.value();
      if (serperKey && seo && !seo.error) {
        competitors = await findCompetitors(url, seo, serperKey, hints).catch((e) => {
          console.warn("Competitor lookup failed:", e.message);
          return null;
        });
        if (competitors && !competitors.cityMissing) {
          [moneyMap, gmb] = await Promise.all([
            buildMoneyMap(url, competitors.specialty, competitors.city, serperKey).catch((e) => {
              console.warn("Money map failed:", e.message);
              return null;
            }),
            psApiKey
              ? buildGmbCheck(url, seo, competitors, psApiKey).catch((e) => {
                  console.warn("GMB check failed:", e.message);
                  return null;
                })
              : Promise.resolve(null),
          ]);
        } else if (competitors?.cityMissing && psApiKey) {
          // Still try GMB if user somehow had city in SEO… skipped when cityMissing
          gmb = null;
        }
      }

      const auditBundle = { url, pagespeed, seo, competitors, moneyMap, gmb };

      const report = await generateReport(auditBundle, {
        provider,
        openaiKey: OPENAI_API_KEY.value() || undefined,
        anthropicKey: process.env.ANTHROPIC_API_KEY || undefined,
      });

      const revenue = computeRevenueImpact(auditBundle);
      applyComputedFields(report, auditBundle, revenue);

      const removedFindings = sanitizeReport(report, { pagespeed, seo, competitors, gmb });
      if (removedFindings > 0) {
        console.warn(`sanitizeReport removed ${removedFindings} contradicted finding(s) for ${url}`);
      }

      // Re-apply score after sanitize (in case headline/issues changed perception — score stays data-driven)
      applyComputedFields(report, auditBundle, revenue);

      const evidence = buildEvidence(auditBundle);
      const partial = isPartialAudit(auditBundle);

      const doc = await db.collection("audits").add({
        url,
        city: hints.city,
        specialty: hints.specialty,
        report,
        evidence,
        rawData: { pagespeed, seo, competitors, moneyMap, gmb },
        provider,
        partial,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const payload = {
        id: doc.id,
        url,
        report,
        evidence,
        gmb,
        competitors: competitors
          ? {
              searchQuery: competitors.searchQuery,
              yourGoogleRank: competitors.yourGoogleRank,
              city: competitors.city,
              specialty: competitors.specialty,
              cityMissing: !!competitors.cityMissing,
              rankDisclaimer: competitors.rankDisclaimer || null,
              list: competitors.competitorsAboveYou || [],
              localMapPack: competitors.localMapPack || [],
            }
          : null,
        meta: {
          pagespeedMobileOk: !!pagespeed?.mobile?.scores,
          seoOk: !seo?.error,
          partial,
          city: hints.city || competitors?.city || null,
          specialty: hints.specialty || competitors?.specialty || null,
        },
      };

      await setCache(auditCacheKey, payload, partial ? PARTIAL_CACHE_DAYS : AUDIT_CACHE_DAYS);

      res.status(200).json(payload);
    } catch (err) {
      console.error("Audit failed:", err);
      res.status(500).json({ error: "Audit failed. Please try again." });
    }
  }
);
