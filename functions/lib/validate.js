/**
 * Contradiction guard — the last line of defense against wrong audits.
 * Deterministically removes any AI finding that the collected data disproves,
 * or that lacks a valid evidence citation.
 */

const { isValidEvidenceKey } = require("./score");

const NEGATION = /\bno\b|missing|lack|without|absent|not detected|couldn'?t|could not|can'?t|can not|cannot|doesn'?t|does not|isn'?t|is not|none|not find|unable|invisible|never see/i;
const ABSOLUTE_ABSENCE = /\b(you have )?no\b|\bmissing\b|\bwithout\b|\babsent\b|\bdoesn'?t have\b|\bdo not have\b|\blacks?\b/i;

// Each rule: if `flag(data)` is true, findings matching `topic` are
// contradicted. Absence-claims need a negation word; `direct` topics (like
// claiming the site is slow) are contradictions by the claim itself.
const RULES = [
  { topic: /whats\s?app/i, flag: (d) => d.seo?.conversion?.hasWhatsApp },
  { topic: /tap.to.call|phone (link|number|option)|call (button|option|link)|tel:/i, flag: (d) => d.seo?.conversion?.hasPhoneLink },
  { topic: /booking|appointment|schedul/i, flag: (d) => d.seo?.conversion?.hasBooking },
  { topic: /contact form|\bform\b/i, flag: (d) => d.seo?.conversion?.hasForm },
  { topic: /\bmap\b|location/i, flag: (d) => d.seo?.conversion?.hasMap },
  { topic: /review|testimonial/i, flag: (d) => d.seo?.conversion?.hasReviews },
  {
    topic: /\bslow\b|takes too long|load(ing)? (time|speed)|speed (issue|problem)/i,
    direct: true,
    flag: (d) => {
      const score = d.pagespeed?.mobile?.scores?.performance;
      return score == null || score >= 80;
    },
  },
  {
    // Don't claim GMB is missing/broken if we verified their listing by domain
    topic: /google business|gmb|maps listing|not (on|in) (google )?maps/i,
    flag: (d) => d.gmb?.matchedByDomain && d.gmb?.you,
  },
  {
    // Don't claim "never seen on Google" if they have an organic rank
    topic: /never see|invisible on google|not (on|in) google|patients can'?t find/i,
    direct: true,
    flag: (d) => d.competitors?.yourGoogleRank != null && d.competitors.yourGoogleRank <= 10,
  },
];

function contradicted(text, data) {
  if (!text) return false;
  return RULES.some(
    (r) => r.flag(data) && r.topic.test(text) && (r.direct || NEGATION.test(text))
  );
}

/**
 * Soften absolute "you have no X" when the signal is only undetected.
 */
function softenAbsoluteClaims(text, data) {
  if (!text || !ABSOLUTE_ABSENCE.test(text)) return text;
  const c = data.seo?.conversion;
  if (!c) return text;
  let out = text;
  if (!c.hasPhoneLink) {
    out = out.replace(
      /no tap-?to-?call|no (click-?to-?call|phone (button|link|option))/gi,
      "no tap-to-call detected on scanned pages"
    );
  }
  if (!c.hasBooking) {
    out = out.replace(
      /no (online )?booking|no appointment (button|system|option)/gi,
      "no online booking detected on scanned pages"
    );
  }
  if (!c.hasWhatsApp) {
    out = out.replace(/no whats\s?app/gi, "no WhatsApp link detected on scanned pages");
  }
  return out;
}

function issueContradicted(issue, data) {
  return contradicted(`${issue.title} ${issue.impact}`, data);
}

function issueLacksEvidence(issue) {
  return !isValidEvidenceKey(issue?.evidence);
}

/** Best-effort evidence key from issue text when the model omits it. */
function inferEvidenceKey(issue, data) {
  const t = `${issue?.title || ""} ${issue?.impact || ""}`;
  if (/slow|load|performance|lcp|speed/i.test(t) && data.pagespeed?.mobile?.scores?.performance != null) {
    return "pagespeed.mobile.scores.performance";
  }
  if (/whats\s?app/i.test(t)) return "conversion.hasWhatsApp";
  if (/tap.to.call|phone|tel:/i.test(t)) return "conversion.hasPhoneLink";
  if (/book|appoint|schedul/i.test(t)) return "conversion.hasBooking";
  if (/\bform\b/i.test(t)) return "conversion.hasForm";
  if (/\bmap\b|location/i.test(t)) return "conversion.hasMap";
  if (/review|testimonial/i.test(t)) return "conversion.hasReviews";
  if (/title tag|meta description|h1|canonical|schema|structured/i.test(t)) return "seo.titleLength";
  if (/google business|gmb|maps listing/i.test(t)) return "gmb.matchedByDomain";
  if (/rank|competitor|google search|invisible/i.test(t)) return "competitors.yourGoogleRank";
  if (/implant|veneer|braces|botox|treatment/i.test(t)) return "moneyMap.rank";
  return null;
}

/**
 * Scrub the report in place. Returns the number of findings removed
 * (logged for monitoring — a high rate means the prompt needs work).
 */
function sanitizeReport(report, data) {
  let removed = 0;

  for (const key of ["criticalIssues", "improvements"]) {
    if (Array.isArray(report[key])) {
      const before = report[key].length;
      report[key] = report[key]
        .map((it) => {
          if (isValidEvidenceKey(it?.evidence)) return it;
          const inferred = inferEvidenceKey(it, data);
          return inferred ? { ...it, evidence: inferred } : it;
        })
        .filter((it) => !issueLacksEvidence(it) && !issueContradicted(it, data))
        .map((it) => ({
          ...it,
          title: softenAbsoluteClaims(it.title, data),
          impact: softenAbsoluteClaims(it.impact, data),
          fix: it.fix,
        }));
      removed += before - report[key].length;
    }
  }

  if (report.headline) report.headline = softenAbsoluteClaims(report.headline, data);
  if (report.mysteryPatient) {
    report.mysteryPatient = softenAbsoluteClaims(report.mysteryPatient, data);
  }
  if (report.competitorComparison) {
    report.competitorComparison = softenAbsoluteClaims(report.competitorComparison, data);
  }
  if (report.gmbInsight) {
    report.gmbInsight = softenAbsoluteClaims(report.gmbInsight, data);
  }

  if (contradicted(report.headline, data)) {
    report.headline =
      report.criticalIssues?.[0]?.impact ||
      "There are opportunities to win more patients from your website.";
    removed++;
  }
  if (contradicted(report.mysteryPatient, data)) {
    delete report.mysteryPatient;
    removed++;
  }
  if (contradicted(report.verdict, data)) {
    report.verdict = report.criticalIssues?.length ? "Fixable issues found" : "Solid, with room to grow";
    removed++;
  }

  // Drop invented competitor copy when city was missing / search skipped
  if (data.competitors?.cityMissing || data.competitors?.skippedReason) {
    if (report.competitorComparison) {
      report.competitorComparison =
        "Local competitor ranking needs your city to be accurate — we skipped inventing a national comparison.";
      removed++;
    }
  }

  // Don't compare GMB rivals when we didn't verify their listing
  if (data.gmb && !data.gmb.matchedByDomain) {
    if (report.gmbInsight && /rating|review|rival|competitor|vs\.|versus/i.test(report.gmbInsight) && data.gmb.found !== true) {
      report.gmbInsight =
        `We couldn't confirm a Google Business Profile whose website matches this domain (searched: "${data.gmb.searchedFor}"). Verify the website URL on your Google listing — that's often the fastest local-SEO win.`;
      removed++;
    }
  }

  return removed;
}

module.exports = { sanitizeReport };
