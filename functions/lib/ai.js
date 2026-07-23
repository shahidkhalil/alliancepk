/**
 * Provider-agnostic AI report generator.
 * Switch providers with the AI_PROVIDER env var ("openai" | "anthropic").
 * Only the provider that matches needs its API key set.
 *
 * Score and revenueImpact are computed in code (see score.js) and applied
 * after generation — the model must not invent those numbers.
 */

const SYSTEM_PROMPT = `You are a senior web strategist for Alliance Tech, a US agency that grows dental and aesthetic clinics online. You audit clinic websites and explain problems in plain, non-technical language a busy doctor understands.

You are given hard data (Google PageSpeed scores, Core Web Vitals, on-page SEO facts, and conversion signals). Turn it into an honest, evidence-grounded report. Rules:

GROUNDING (the most important rules):
- Every claim MUST trace to a specific data point you were given. Never invent problems.
- Every item in criticalIssues and improvements MUST include an "evidence" field: a key from the allowed list (e.g. "conversion.hasPhoneLink", "pagespeed.mobile.scores.performance"). Issues without a valid evidence key will be deleted.
- If the PageSpeed section contains an "error" field or is missing scores, you have NO speed data: do not mention loading speed, load times, or performance AT ALL — not in the headline, not in mysteryPatient, nowhere. Focus only on what you can verify from the SEO/conversion data.
- If a performance score is 80+, the site is FAST — say so as a positive. 50-79 is moderate. Only below 50 is genuinely slow.
- The "mysteryPatient" story may only reference things verified in the data (e.g. conversion.hasPhoneLink=false means tap-to-call was not detected). Never claim the site "wouldn't load" or "was slow" unless the performance data proves it.
- Conversion flags: true = confirmed present. false = "we could not detect it on the pages we scanned" — NEVER phrase as absolute fact that X does not exist (widgets/embeds may hide from our scanner). Prefer: "We couldn't detect a tap-to-call button on the pages we scanned."
- Do NOT invent dollar amounts or patient counts in revenueImpact — a computed estimate will replace that field. You may leave revenueImpact as a short placeholder.
- overallScore will be overwritten by a computed score — you may still suggest a rough holistic judgement but it will not be used as-is.
- Competitor ranks are for the EXACT search query provided, organic top ~10 only — never say "patients never see you on Google" unless map-pack data also shows them missing. Prefer: "You're not in the top results for this exact search."
- If competitors.cityMissing or skippedReason is set, do not invent local rankings.
- If gmb.matchedByDomain is false / found is false, say we could not confirm their Google Business listing for this website — do not compare them to rivals as if we found their listing.

CALIBRATION (be fair, not alarmist):
- Score honestly across the full range. A site with good speed, solid SEO tags, and clear contact options should score 75-90 with a positive verdict. Reserve scores under 40 for sites with severe, verified problems.
- If the site is genuinely good, say so plainly and keep criticalIssues short (or empty) — credibility comes from honesty.
- criticalIssues are ONLY for verified problems that directly cost patients. Lesser findings go in improvements.

TONE:
- Talk about PATIENTS and MONEY, not jargon. Translate each verified issue into real-world impact.
- Prioritise ruthlessly: biggest verified business problems first.
- Return ONLY valid JSON matching the requested schema. No markdown, no commentary.`;

/** Keep prompts small: send only fields the model actually reasons about. */
function slimData(audit) {
  const m = audit.pagespeed?.mobile;
  const pagespeed = m?.scores
    ? { scores: m.scores, metrics: m.metrics, topOpportunities: (m.opportunities || []).slice(0, 3) }
    : { error: m?.error || "unavailable" };

  const s = audit.seo || {};
  const seo = s.error
    ? { error: s.error }
    : {
        title: (s.title || "").slice(0, 90),
        titleLength: s.titleLength,
        metaDescriptionLength: s.metaDescriptionLength,
        h1Count: s.h1Count,
        isHttps: s.isHttps,
        hasCanonical: s.hasCanonical,
        hasViewport: s.hasViewport,
        hasOgImage: s.hasOgImage,
        hasStructuredData: s.hasStructuredData,
        wordCount: s.wordCount,
        isSpa: s.isSpa,
        imagesMissingAlt: s.imagesMissingAlt,
        conversion: s.conversion,
      };

  let competitors = null;
  if (audit.competitors) {
    const c = audit.competitors;
    competitors = {
      searchQuery: c.searchQuery,
      yourGoogleRank: c.yourGoogleRank,
      city: c.city,
      specialty: c.specialty,
      cityMissing: c.cityMissing || false,
      skippedReason: c.skippedReason || null,
      rankDisclaimer: c.rankDisclaimer || null,
      rivals: (c.competitorsAboveYou || []).map((r) => ({
        position: r.position,
        title: (r.title || "").slice(0, 60),
        domain: r.domain,
        profile: r.profile
          ? {
              hasWhatsApp: r.profile.hasWhatsApp,
              hasPhoneLink: r.profile.hasPhoneLink,
              hasBooking: r.profile.hasBooking,
              hasReviews: r.profile.hasReviews,
            }
          : undefined,
      })),
      localMapPack: c.localMapPack,
    };
  }

  const moneyMap = audit.moneyMap
    ? audit.moneyMap.map((t) => ({
        treatment: t.treatment,
        avgCaseValueUSD: t.avgCaseValueUSD,
        yourRank: t.yourRank,
        leader: t.leader ? { title: (t.leader.title || "").slice(0, 60), domain: t.leader.domain } : null,
      }))
    : null;

  let gmb = null;
  if (audit.gmb) {
    gmb = {
      found: audit.gmb.found,
      matchedByDomain: !!audit.gmb.matchedByDomain,
      reason: audit.gmb.reason || null,
      searchedFor: audit.gmb.searchedFor,
      you: audit.gmb.you,
      rivals: audit.gmb.rivals,
    };
  }

  return { pagespeed, seo, competitors, moneyMap, gmb };
}

function buildUserPrompt(audit) {
  const slim = slimData(audit);
  const psOk = !slim.pagespeed.error;
  return `Audit this website and return the JSON report.

WEBSITE: ${audit.url}

ALLOWED evidence keys (use exactly one per issue):
pagespeed.mobile.scores.performance, pagespeed.mobile.metrics.largestContentfulPaint,
seo.titleLength, seo.metaDescriptionLength, seo.h1Count, seo.isHttps, seo.hasCanonical,
seo.hasViewport, seo.hasStructuredData, seo.imagesMissingAlt, seo.isSpa,
conversion.hasWhatsApp, conversion.hasPhoneLink, conversion.hasBooking, conversion.hasMap,
conversion.hasReviews, conversion.hasForm,
competitors.yourGoogleRank, competitors.searchQuery,
gmb.found, gmb.matchedByDomain, gmb.you.rating, gmb.you.reviews, moneyMap.rank

=== SPEED (Google PageSpeed / Lighthouse, mobile) ===
${psOk ? "" : "NOTE: Speed measurement FAILED — you have no speed data. Do not mention speed anywhere in the report.\n"}${JSON.stringify(slim.pagespeed)}

=== ON-PAGE SEO & UX SIGNALS ===
${slim.seo.isSpa ? "NOTE: This is a JavaScript-rendered app. Content signals were extracted from its JS bundles. Do NOT criticise 'thin content' or low word count — that measurement is unreliable for such sites. Do note that JS-only rendering can hurt Google indexing (a legitimate SEO point).\n" : ""}${JSON.stringify(slim.seo)}

${slim.competitors ? `=== LOCAL COMPETITOR BENCHMARK (real Google results for "${slim.competitors.searchQuery}") ===
Their Google rank for this search: ${slim.competitors.yourGoogleRank ?? (slim.competitors.cityMissing ? "SKIPPED — city not provided" : "NOT in the top ~10 organic results for this exact query")}
${JSON.stringify(slim.competitors)}
${slim.competitors.cityMissing ? "Do NOT invent competitorComparison rankings. Say local ranking needs their city.\n" : `Use this for "competitorComparison": name the actual competitors, state the rank gap for THIS query only, and point out concrete things the rivals' sites have that this site lacks (from their profiles). Never invent details.\n`}
` : ""}
${slim.moneyMap ? `=== TREATMENT MONEY MAP (per-treatment Google rankings, real searches) ===
${JSON.stringify(slim.moneyMap)}
Use this for the "moneyMap" output field. For each treatment: state their rank (or "not in top 10 for this query"), who owns the search (the leader). Do NOT invent search-volume numbers. Set status: "invisible" (not in top 10), "close" (rank 4-10), or "strong" (rank 1-3). End with "moneyMapVerdict". Each moneyMap row should use evidence "moneyMap.rank".
` : ""}
${slim.gmb && slim.gmb.found && slim.gmb.matchedByDomain ? `=== GOOGLE BUSINESS PROFILE CHECK (domain-verified Places data) ===
Their listing: ${JSON.stringify(slim.gmb.you)}
Map-pack rivals' listings: ${JSON.stringify(slim.gmb.rivals)}
Use this for "gmbInsight": 2-4 sentences comparing their Google Business listing to the rivals — rating gap, review count gap, review pace, missing photos/hours/website/phone. Never invent numbers.
` : slim.gmb ? `=== GOOGLE BUSINESS PROFILE CHECK ===
No domain-verified Google Business listing for this website (searched: "${slim.gmb.searchedFor}", reason: ${slim.gmb.reason || "not found"}). Use "gmbInsight" to say we could not confirm their listing for this domain — they should verify the website URL on their Google Business Profile. Do NOT invent rating/review comparisons.
` : ""}
Return JSON with EXACTLY this shape:
{
  "overallScore": <0-100 integer, ignored — computed in code>,
  "verdict": "<3-6 word summary e.g. 'Losing patients to slow load'>",
  "headline": "<one punchy sentence stating their single biggest problem in patient/money terms>",
  "mysteryPatient": "<2-4 sentences role-playing a patient trying to book on mobile — only verified friction>",
  "revenueImpact": "<placeholder — overwritten by computed estimate>",
  "criticalIssues": [ { "title": "<short>", "impact": "<why it costs them patients>", "fix": "<what to do>", "evidence": "<allowed key>" } ],
  "improvements": [ { "title": "<short>", "impact": "<short>", "fix": "<short>", "evidence": "<allowed key>" } ],
  "doingWell": [ "<short positive point>" ],
  ${audit.competitors && !audit.competitors.cityMissing ? '"competitorComparison": "<2-4 sentences for THIS query only>",' : ""}
  ${audit.moneyMap ? '"moneyMap": [ { "treatment": "<name>", "status": "invisible|close|strong", "yourRank": <number or null>, "leader": "<who owns this search, or null>", "insight": "<1-2 sentences, no invented volume>" } ], "moneyMapVerdict": "<one sentence>",' : ""}
  ${audit.gmb ? '"gmbInsight": "<2-4 sentences>",' : ""}
  "nextStep": "<one warm sentence inviting them to get Alliance Tech to fix it>"
}
Keep criticalIssues to the top 3, improvements to 3-5, doingWell to 3-5.`;
}

async function callOpenAI(audit, apiKey) {
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.15,
      max_tokens: 1800,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(audit) },
      ],
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

async function callAnthropic(audit, apiKey) {
  const model = process.env.AI_MODEL || "claude-haiku-4-5-20251001";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      temperature: 0.15,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `${buildUserPrompt(audit)}\n\nRespond with only the JSON object.` }],
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${(await res.text()).slice(0, 150)}`);
  const data = await res.json();
  const text = data.content.map((b) => b.text || "").join("");
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  return JSON.parse(json);
}

async function generateReport(audit, { provider, openaiKey, anthropicKey }) {
  if (provider === "anthropic") {
    if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY not configured");
    return callAnthropic(audit, anthropicKey);
  }
  if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");
  return callOpenAI(audit, openaiKey);
}

module.exports = { generateReport };
