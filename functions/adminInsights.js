/**
 * Admin Insights API — Search Console + Analytics + chat + blog generation.
 *
 * POST JSON { action: "fetch" | "chat" | "generateBlog", ... }
 * Requires Firebase Auth Bearer token (admin panel login).
 */
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { applyCors } = require("./lib/security");
const { fetchGscQueries, fetchGscPages, fetchGaOverview } = require("./lib/gscGa");
const { generateBlogFromKeyword, chatAboutInsights } = require("./lib/insightsAi");

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
/** Optional: full service-account JSON for GSC/GA (analytics-mcp). Falls back to ADC. */
const GSC_SA_JSON = defineSecret("GSC_SA_JSON");

async function requireAdmin(req) {
  const header = String(req.headers.authorization || "");
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    const err = new Error("Missing Authorization bearer token");
    err.status = 401;
    throw err;
  }
  try {
    const decoded = await admin.auth().verifyIdToken(m[1]);
    return decoded;
  } catch {
    const err = new Error("Invalid or expired auth token");
    err.status = 401;
    throw err;
  }
}

function scoreKeywordRows(rows) {
  return [...rows]
    .map((r) => {
      let score = 0;
      if (r.impressions >= 5 && r.position >= 5 && r.position <= 25) {
        score = r.impressions * 2 + (25 - r.position) * 2;
      } else if (r.impressions >= 8 && r.ctr < 0.05) {
        score = r.impressions * 1.5;
      } else if (r.clicks >= 1) {
        score = r.clicks * 12 + r.impressions;
      } else if (r.impressions >= 4) {
        score = r.impressions;
      }
      return { ...r, opportunityScore: Math.round(score * 10) / 10 };
    })
    .filter((r) => r.opportunityScore > 0)
    .sort((a, b) => b.opportunityScore - a.opportunityScore);
}

exports.adminInsights = onRequest(
  {
    region: "asia-south1",
    cors: false,
    timeoutSeconds: 120,
    memory: "512MiB",
    secrets: [OPENAI_API_KEY, GSC_SA_JSON],
  },
  async (req, res) => {
    if (applyCors(req, res)) return;
    if (req.method !== "POST") {
      res.status(405).json({ error: "POST only" });
      return;
    }

    try {
      await requireAdmin(req);
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const action = String(body.action || "fetch");
      let saJson = "";
      try {
        saJson = GSC_SA_JSON.value() || "";
      } catch {
        saJson = "";
      }

      if (action === "fetch") {
        const days = Number(body.days) || 28;
        const country = body.country === "all" ? null : body.country || "usa";
        const [gsc, pages, ga] = await Promise.all([
          fetchGscQueries(saJson || undefined, {
            days,
            rowLimit: Number(body.rowLimit) || 60,
            country,
          }),
          fetchGscPages(saJson || undefined, { days, rowLimit: 12 }).catch((e) => {
            console.warn("GSC pages failed", e.message);
            return [];
          }),
          fetchGaOverview(saJson || undefined, { days }).catch((e) => {
            console.warn("GA failed", e.message);
            return { error: e.message, totals: null, channels: [] };
          }),
        ]);

        const ranked = scoreKeywordRows(gsc.rows);
        const payload = {
          ok: true,
          fetchedAt: new Date().toISOString(),
          country: country || "all",
          gsc: {
            startDate: gsc.startDate,
            endDate: gsc.endDate,
            siteUrl: gsc.siteUrl,
            queries: ranked.slice(0, 40),
            allQueryCount: gsc.rows.length,
          },
          pages,
          analytics: ga,
        };
        res.status(200).json(payload);
        return;
      }

      if (action === "chat") {
        const question = String(body.question || "").trim().slice(0, 2000);
        if (!question) {
          res.status(400).json({ error: "question is required" });
          return;
        }
        const openaiKey = OPENAI_API_KEY.value();
        if (!openaiKey) {
          res.status(500).json({ error: "OPENAI_API_KEY not configured" });
          return;
        }
        const answer = await chatAboutInsights({
          question,
          context: body.context || {},
          history: body.history || [],
          openaiKey,
        });
        res.status(200).json({ ok: true, answer });
        return;
      }

      if (action === "generateBlog") {
        const query = String(body.query || body.keyword || "").trim().slice(0, 200);
        if (!query) {
          res.status(400).json({ error: "query/keyword is required" });
          return;
        }
        const openaiKey = OPENAI_API_KEY.value();
        if (!openaiKey) {
          res.status(500).json({ error: "OPENAI_API_KEY not configured" });
          return;
        }
        const post = await generateBlogFromKeyword({
          query,
          openaiKey,
          gscMeta: body.gscMeta || null,
        });
        const db = admin.firestore();
        await db.collection("blogs").doc(post.slug).set(post, { merge: true });
        res.status(200).json({
          ok: true,
          slug: post.slug,
          title: post.title,
          published: false,
          message: `Draft saved. Review in Blog → Drafts, then publish.`,
        });
        return;
      }

      res.status(400).json({ error: `Unknown action: ${action}` });
    } catch (e) {
      const status = e.status || 500;
      console.error("adminInsights error", e);
      res.status(status).json({ error: e.message || "Server error" });
    }
  }
);
