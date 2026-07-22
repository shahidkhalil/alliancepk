/**
 * Alliance Tech — AI Website Audit function.
 * POST { url } -> full audit report JSON.
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

const { runPageSpeed } = require("./lib/pagespeed");
const { analyzeSeo } = require("./lib/seo");
const { findCompetitors } = require("./lib/competitors");
const { buildMoneyMap } = require("./lib/treatments");
const { buildGmbCheck } = require("./lib/gmb");
const { generateReport } = require("./lib/ai");
const { initCache, getCache, setCache, checkRateLimit } = require("./lib/cache");
const { sanitizeReport } = require("./lib/validate");
const { applyCors, clientIp, normalizePublicUrl } = require("./lib/security");

admin.initializeApp();
const db = admin.firestore();
initCache(db);

const AUDIT_CACHE_DAYS = 7;
const DAILY_LIMIT_PER_IP = 10;

// Secrets (set via: firebase functions:secrets:set NAME)
// ANTHROPIC_API_KEY is optional — only bind it if you switch AI_PROVIDER to "anthropic".
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const PAGESPEED_API_KEY = defineSecret("PAGESPEED_API_KEY");
const SERPER_API_KEY = defineSecret("SERPER_API_KEY");

// Email alert on every new lead (audit bot + consultation form).
exports.leadAlert = require("./leadAlert").leadAlert;
exports.draftAlert = require("./leadAlert").draftAlert;

// AI Receptionist for clinics (product demo).
exports.clinicReceptionist = require("./receptionist").clinicReceptionist;

// Voice-note transcription for the receptionist chat.
exports.transcribeAudio = require("./transcribe").transcribeAudio;

// Package order requests from the pricing page.
exports.packageOrder = require("./packageOrder").packageOrder;

// Live voice agent (Realtime API): session tokens + booking endpoint.
exports.realtimeToken = require("./realtime").realtimeToken;
exports.bookAppointmentHttp = require("./realtime").bookAppointmentHttp;

// Phase 1: email appointment reminders at T-24h and T-1h.
exports.sendAppointmentReminders = require("./reminders").sendAppointmentReminders;

const { handleBusinessAudit, isBusinessAuditRequest } = require("./businessAudit");

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

    // Business Growth Audit (questionnaire) — same function, different payload.
    if (isBusinessAuditRequest(req.body)) {
      await handleBusinessAudit(req, res, OPENAI_API_KEY.value());
      return;
    }

    const url = normalizePublicUrl(req.body?.url);
    if (!url) {
      res.status(400).json({ error: "Please provide a valid website URL." });
      return;
    }

    try {
      // Full-audit cache: same URL within a week returns the stored result —
      // zero PageSpeed, Serper, or OpenAI spend. Public clients cannot force bypass.
      const auditCacheKey = `audit:${url}`;
      const cached = await getCache(auditCacheKey);
      if (cached) {
        res.status(200).json({ ...cached, meta: { ...cached.meta, cached: true } });
        return;
      }

      // Per-IP daily limit protects the API budget from abuse.
      const ip = clientIp(req);
      if (!(await checkRateLimit(ip, DAILY_LIMIT_PER_IP, "audit"))) {
        res.status(429).json({ error: "Daily audit limit reached. Try again tomorrow, or book a free call with our team." });
        return;
      }

      const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
      const psApiKey = PAGESPEED_API_KEY.value() || undefined;

      // Gather hard data in parallel.
      const [pagespeed, seo] = await Promise.all([
        runPageSpeed(url, psApiKey).catch((e) => ({ error: e.message })),
        analyzeSeo(url).catch((e) => ({ error: e.message })),
      ]);

      // Competitor benchmark + treatment money map (optional — need SERPER_API_KEY).
      let competitors = null;
      let moneyMap = null;
      let gmb = null;
      const serperKey = SERPER_API_KEY.value();
      if (serperKey && seo && !seo.error) {
        competitors = await findCompetitors(url, seo, serperKey).catch((e) => {
          console.warn("Competitor lookup failed:", e.message);
          return null;
        });
        if (competitors) {
          // Money map + GMB check run in parallel (independent data sources).
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
        }
      }

      // AI turns data into the report.
      const report = await generateReport(
        { url, pagespeed, seo, competitors, moneyMap, gmb },
        {
          provider,
          openaiKey: OPENAI_API_KEY.value() || undefined,
          anthropicKey: process.env.ANTHROPIC_API_KEY || undefined,
        }
      );

      // Contradiction guard: drop any AI claim the collected data disproves.
      const removedFindings = sanitizeReport(report, { pagespeed, seo });
      if (removedFindings > 0) {
        console.warn(`sanitizeReport removed ${removedFindings} contradicted finding(s) for ${url}`);
      }

      // Store the audit (lead intelligence + analytics).
      const doc = await db.collection("audits").add({
        url,
        report,
        rawData: { pagespeed, seo, competitors, moneyMap, gmb },
        provider,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const payload = {
        id: doc.id,
        url,
        report,
        gmb,
        competitors: competitors
          ? {
              searchQuery: competitors.searchQuery,
              yourGoogleRank: competitors.yourGoogleRank,
              list: competitors.competitorsAboveYou,
              localMapPack: competitors.localMapPack,
            }
          : null,
        meta: {
          pagespeedMobileOk: !!pagespeed?.mobile?.scores,
          seoOk: !seo?.error,
        },
      };

      // Cache the full result so repeats cost nothing.
      await setCache(auditCacheKey, payload, AUDIT_CACHE_DAYS);

      res.status(200).json(payload);
    } catch (err) {
      console.error("Audit failed:", err);
      res.status(500).json({ error: "Audit failed. Please try again." });
    }
  }
);
