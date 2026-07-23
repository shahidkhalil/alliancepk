/**
 * Deterministic overall score + revenue estimate from measured data.
 * AI may polish wording but must not invent the score or dollar math.
 */

const EVIDENCE_KEYS = new Set([
  "pagespeed.mobile.scores.performance",
  "pagespeed.mobile.metrics.largestContentfulPaint",
  "seo.titleLength",
  "seo.metaDescriptionLength",
  "seo.h1Count",
  "seo.isHttps",
  "seo.hasCanonical",
  "seo.hasViewport",
  "seo.hasStructuredData",
  "seo.imagesMissingAlt",
  "seo.isSpa",
  "conversion.hasWhatsApp",
  "conversion.hasPhoneLink",
  "conversion.hasBooking",
  "conversion.hasMap",
  "conversion.hasReviews",
  "conversion.hasForm",
  "competitors.yourGoogleRank",
  "competitors.searchQuery",
  "gmb.found",
  "gmb.matchedByDomain",
  "gmb.you.rating",
  "gmb.you.reviews",
  "moneyMap.rank",
]);

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function conversionScore(seo) {
  const c = seo?.conversion;
  if (!c) return { score: 50, detected: 0, total: 6 };
  // WhatsApp is optional for US clinics — weight phone, booking, form, map, reviews higher.
  const weighted = [
    [c.hasPhoneLink, 22],
    [c.hasBooking, 22],
    [c.hasForm, 16],
    [c.hasMap, 14],
    [c.hasReviews, 16],
    [c.hasWhatsApp, 10],
  ];
  const total = weighted.reduce((s, [, w]) => s + w, 0);
  const got = weighted.reduce((s, [on, w]) => s + (on ? w : 0), 0);
  const detected = weighted.filter(([on]) => on).length;
  return { score: Math.round((got / total) * 100), detected, total: weighted.length };
}

function seoBasicsScore(seo) {
  if (!seo || seo.error) return 50;
  let pts = 0;
  let max = 0;
  const add = (ok, w) => {
    max += w;
    if (ok) pts += w;
  };
  add(seo.isHttps, 15);
  add(seo.titleLength >= 20 && seo.titleLength <= 65, 15);
  add(seo.metaDescriptionLength >= 70 && seo.metaDescriptionLength <= 165, 12);
  add(seo.h1Count === 1, 12);
  add(seo.hasViewport, 10);
  add(seo.hasCanonical, 10);
  add(seo.hasStructuredData, 12);
  add((seo.imagesMissingAlt || 0) === 0 || (seo.imageCount || 0) === 0, 8);
  add(!seo.isSpa, 6); // SPA is a mild SEO risk, not a failure
  return max ? Math.round((pts / max) * 100) : 50;
}

/**
 * Holistic 0–100 score from hard data only.
 */
function computeOverallScore({ pagespeed, seo, competitors, gmb }) {
  const perf = pagespeed?.mobile?.scores?.performance;
  const speedPart = perf != null ? perf : null;
  const seoPart = seoBasicsScore(seo);
  const conv = conversionScore(seo);

  let rankPart = null;
  if (competitors && competitors.yourGoogleRank != null) {
    const r = competitors.yourGoogleRank;
    rankPart = r <= 3 ? 90 : r <= 6 ? 70 : r <= 10 ? 50 : 25;
  } else if (competitors && competitors.searchQuery) {
    rankPart = 20; // searched, not in top 10
  }

  let gmbPart = null;
  if (gmb?.matchedByDomain && gmb.you) {
    const rating = gmb.you.rating || 0;
    const reviews = gmb.you.reviews || 0;
    gmbPart = clamp(rating * 12 + Math.min(reviews, 80) * 0.25, 20, 95);
  } else if (gmb && gmb.found === false) {
    gmbPart = 25;
  }

  // Weights adapt when a data source is missing.
  const parts = [];
  if (speedPart != null) parts.push([speedPart, 0.3]);
  parts.push([seoPart, 0.25]);
  parts.push([conv.score, 0.25]);
  if (rankPart != null) parts.push([rankPart, 0.12]);
  if (gmbPart != null) parts.push([gmbPart, 0.08]);

  const weightSum = parts.reduce((s, [, w]) => s + w, 0);
  const score = parts.reduce((s, [v, w]) => s + v * (w / weightSum), 0);
  return clamp(score, 5, 98);
}

/**
 * Conservative revenue estimate from verified gaps only.
 */
function computeRevenueImpact({ seo, competitors, moneyMap, gmb }) {
  const conv = seo?.conversion || {};
  let monthlyPatientsAtRisk = 0;
  const drivers = [];

  if (!conv.hasPhoneLink) {
    monthlyPatientsAtRisk += 3;
    drivers.push("no tap-to-call detected");
  }
  if (!conv.hasBooking && !conv.hasForm) {
    monthlyPatientsAtRisk += 4;
    drivers.push("no clear booking/contact path detected");
  }
  if (competitors && competitors.yourGoogleRank == null && competitors.searchQuery) {
    monthlyPatientsAtRisk += 5;
    drivers.push(`not in top 10 for “${competitors.searchQuery}”`);
  } else if (competitors?.yourGoogleRank > 5) {
    monthlyPatientsAtRisk += 2;
    drivers.push(`ranking #${competitors.yourGoogleRank} for “${competitors.searchQuery}”`);
  }
  if (gmb && !gmb.matchedByDomain) {
    monthlyPatientsAtRisk += 3;
    drivers.push("Google Business listing not confirmed for this website");
  }

  const invisibleTreatments = (moneyMap || []).filter((t) => t.yourRank == null).length;
  if (invisibleTreatments >= 2) {
    monthlyPatientsAtRisk += 2;
    drivers.push(`${invisibleTreatments} high-value treatments not ranking in top 10`);
  }

  if (monthlyPatientsAtRisk === 0) {
    return {
      text: "Estimate: the site looks reasonably healthy. A few conversion polish items could still add a handful of enquiries per month — not a major leak from what we measured.",
      monthlyPatientsAtRisk: 0,
      drivers,
    };
  }

  const avgValue = 500;
  const low = monthlyPatientsAtRisk * avgValue;
  const high = monthlyPatientsAtRisk * 2 * avgValue;
  return {
    text: `Estimate (not a guarantee): based on ${drivers.slice(0, 3).join("; ")}, this could be roughly ${monthlyPatientsAtRisk}–${monthlyPatientsAtRisk * 2} missed patient enquiries/month (≈ $${low.toLocaleString()}–$${high.toLocaleString()}/mo at ~$${avgValue}/patient).`,
    monthlyPatientsAtRisk,
    drivers,
  };
}

function buildEvidence({ pagespeed, seo, competitors, gmb, moneyMap }) {
  const m = pagespeed?.mobile;
  const c = seo?.conversion || {};
  return {
    speed: m?.scores
      ? {
          performance: m.scores.performance,
          seo: m.scores.seo,
          lcp: m.metrics?.largestContentfulPaint || null,
          cls: m.metrics?.cumulativeLayoutShift || null,
        }
      : { error: m?.error || pagespeed?.error || "unavailable" },
    onPage: seo?.error
      ? { error: seo.error }
      : {
          titleLength: seo?.titleLength ?? null,
          metaDescriptionLength: seo?.metaDescriptionLength ?? null,
          h1Count: seo?.h1Count ?? null,
          isHttps: !!seo?.isHttps,
          hasStructuredData: !!seo?.hasStructuredData,
          isSpa: !!seo?.isSpa,
          pagesScanned: seo?.pagesScanned ?? 1,
        },
    conversion: {
      note: "true = detected on scanned pages/JS; false = not detected (may still exist behind widgets we couldn’t see)",
      hasPhoneLink: !!c.hasPhoneLink,
      hasBooking: !!c.hasBooking,
      hasForm: !!c.hasForm,
      hasMap: !!c.hasMap,
      hasReviews: !!c.hasReviews,
      hasWhatsApp: !!c.hasWhatsApp,
    },
    search: competitors
      ? {
          query: competitors.searchQuery,
          yourGoogleRank: competitors.yourGoogleRank,
          city: competitors.city,
          specialty: competitors.specialty,
          disclaimer: "Rank is for this exact query in organic results (top ~10 only), not all Google visibility.",
        }
      : null,
    gmb: gmb
      ? {
          found: !!gmb.found,
          matchedByDomain: !!gmb.matchedByDomain,
          name: gmb.you?.name || null,
          rating: gmb.you?.rating ?? null,
          reviews: gmb.you?.reviews ?? null,
        }
      : null,
    moneyMapTreatments: (moneyMap || []).map((t) => ({
      treatment: t.treatment,
      yourRank: t.yourRank,
      query: t.searchQuery,
    })),
  };
}

function isValidEvidenceKey(key) {
  return typeof key === "string" && EVIDENCE_KEYS.has(key);
}

/**
 * Apply computed score + revenue onto the AI report (overwrite inventions).
 */
function applyComputedFields(report, audit, revenue) {
  report.overallScore = computeOverallScore(audit);
  report.revenueImpact = revenue.text;
  report._computed = {
    monthlyPatientsAtRisk: revenue.monthlyPatientsAtRisk,
    drivers: revenue.drivers,
  };
  return report;
}

module.exports = {
  computeOverallScore,
  computeRevenueImpact,
  buildEvidence,
  applyComputedFields,
  isValidEvidenceKey,
  EVIDENCE_KEYS,
};
