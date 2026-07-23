/**
 * Local competitor benchmarking via Serper.dev (Google search results API).
 * Optional feature — runs only when a SERPER_API_KEY is configured.
 *
 * City + specialty should come from the user when possible. We never silently
 * default to Houston — that produced wrong "invisible" reports.
 */

const { analyzeSeo } = require("./seo");
const { serperSearch } = require("./serper");

const SPECIALTIES = [
  { re: /dentist|dental|orthodont|teeth|tooth|smile/i, term: "dentist" },
  { re: /aesthetic|cosmetic|botox|filler|laser|skin care|skincare/i, term: "aesthetic clinic" },
  { re: /dermatolog|skin clinic/i, term: "dermatologist" },
  { re: /psycholog|therapy|therapist|counsel/i, term: "psychologist" },
  { re: /physiotherap|rehab/i, term: "physiotherapist" },
  { re: /gynecolog|obstetric/i, term: "gynecologist" },
  { re: /pediatric|child specialist/i, term: "pediatrician" },
  { re: /eye|ophthalmolog|lasik|vision/i, term: "eye specialist" },
  { re: /hair transplant/i, term: "hair transplant clinic" },
  { re: /hospital|clinic|doctor|medical/i, term: "clinic" },
];

const ALLOWED_SPECIALTIES = new Set(SPECIALTIES.map((s) => s.term));

const CITIES = [
  "Houston", "Los Angeles", "Chicago", "Dallas", "New York", "Phoenix",
  "San Antonio", "Austin", "Miami", "Seattle", "Denver", "Sugar Land",
  "Katy", "The Woodlands", "Plano", "Fort Worth", "Atlanta", "Boston",
];

/** Infer specialty/city from site content — never invent a city. */
function inferQuery(seo, hints = {}) {
  const haystack = [seo.title, seo.metaDescription, seo.h1Text].filter(Boolean).join(" ");

  let specialty = typeof hints.specialty === "string" ? hints.specialty.trim().toLowerCase() : "";
  if (!ALLOWED_SPECIALTIES.has(specialty)) {
    specialty = (SPECIALTIES.find((s) => s.re.test(haystack)) || { term: "clinic" }).term;
  }

  let city = typeof hints.city === "string" ? hints.city.trim() : "";
  if (!city) {
    city = CITIES.find((c) => new RegExp(c, "i").test(haystack)) || "";
  }
  // Cap length / strip junk
  city = String(city).replace(/[^\p{L}\p{N}\s.'-]/gu, "").trim().slice(0, 60);

  return {
    query: city ? `${specialty} in ${city}` : specialty,
    specialty,
    city: city || null,
    cityInferred: !hints.city && !!city,
    cityMissing: !city,
  };
}

function rootDomain(hostname) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

/**
 * Search Google, locate the audited site's rank, and profile the top
 * competitors ranking above (or ahead of) it.
 * @param {object} [hints] { city?, specialty? }
 */
async function findCompetitors(auditedUrl, seo, apiKey, hints = {}) {
  const inferred = inferQuery(seo, hints);
  const { query, specialty, city, cityMissing, cityInferred } = inferred;
  const ownDomain = rootDomain(new URL(auditedUrl).hostname);

  // Without a city, organic "dentist" results are national noise — skip ranking claims.
  if (cityMissing) {
    return {
      searchQuery: query,
      specialty,
      city: null,
      cityMissing: true,
      yourGoogleRank: null,
      competitorsAboveYou: [],
      localMapPack: [],
      skippedReason: "city_required",
    };
  }

  const data = await serperSearch(query, apiKey);

  const organic = (data.organic || []).map((r, i) => ({
    position: i + 1,
    title: r.title,
    link: r.link,
    domain: rootDomain(new URL(r.link).hostname),
    snippet: r.snippet || "",
  }));

  const ownRank = organic.find((r) => r.domain === ownDomain)?.position ?? null;

  const rivals = organic
    .filter((r) => r.domain !== ownDomain)
    .filter((r) => (ownRank ? r.position < ownRank : true))
    .slice(0, 5);

  const profiles = await Promise.all(
    rivals.slice(0, 3).map(async (r) => {
      try {
        const s = await analyzeSeo(r.link);
        return {
          ...r,
          profile: {
            title: s.title,
            hasWhatsApp: s.conversion.hasWhatsApp,
            hasPhoneLink: s.conversion.hasPhoneLink,
            hasBooking: s.conversion.hasBooking,
            hasReviews: s.conversion.hasReviews,
            hasStructuredData: s.hasStructuredData,
            wordCount: s.wordCount,
          },
        };
      } catch {
        return r;
      }
    })
  );

  const mapPack = (data.places || []).slice(0, 5).map((p) => ({
    name: p.title,
    rating: p.rating,
    reviews: p.ratingCount,
  }));

  return {
    searchQuery: query,
    specialty,
    city,
    cityInferred,
    cityMissing: false,
    yourGoogleRank: ownRank, // null = not in the returned organic set (~top 10)
    rankDisclaimer:
      "Organic rank for this exact query only (approx. top 10). Not map-pack or ‘near me’ visibility.",
    competitorsAboveYou: profiles.concat(rivals.slice(3)),
    localMapPack: mapPack,
  };
}

module.exports = { findCompetitors, inferQuery, ALLOWED_SPECIALTIES };
