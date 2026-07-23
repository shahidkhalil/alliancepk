/**
 * On-page SEO + UX signal extraction.
 * We fetch the raw HTML ourselves and check concrete, factual things
 * that Lighthouse doesn't surface in a business-friendly way.
 */

const cheerio = require("cheerio");
const { isBlockedHost } = require("./security");

async function safeFetch(url, opts = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs || 20000);
  try {
    const res = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AllianceAuditBot/1.0)" },
      signal: controller.signal,
    });
    // Follow a small number of redirects, re-checking host each hop (SSRF).
    let current = url;
    let response = res;
    for (let i = 0; i < 3 && [301, 302, 303, 307, 308].includes(response.status); i++) {
      const loc = response.headers.get("location");
      if (!loc) break;
      const next = new URL(loc, current);
      if (!/^https?:$/.test(next.protocol) || isBlockedHost(next.hostname)) {
        throw new Error("Blocked redirect target");
      }
      current = next.toString();
      response = await fetch(current, {
        redirect: "manual",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; AllianceAuditBot/1.0)" },
        signal: controller.signal,
      });
    }
    if (!response.ok && response.status >= 400) {
      // still return body for soft failures where caller checks .ok
    }
    return { response, finalUrl: current };
  } finally {
    clearTimeout(timeout);
  }
}

async function analyzeSeo(url) {
  const { response: res, finalUrl } = await safeFetch(url, { timeoutMs: 20000 });
  const html = await res.text();
  const $ = cheerio.load(html);

  const title = $("head title").first().text().trim();
  const metaDesc = $('meta[name="description"]').attr("content")?.trim() || "";
  const h1s = $("h1");
  const images = $("img");
  const imagesMissingAlt = images.filter((_, el) => !$(el).attr("alt")?.trim()).length;
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();

  // Conversion / UX signals that matter for clinics specifically.
  // false = not detected on scanned pages — NOT proof the feature is absent
  // (widgets, GTM, third-party booking embeds often hide from static HTML).
  const htmlLower = html.toLowerCase();
  let hasWhatsApp = /wa\.me|api\.whatsapp\.com|whatsapp\.com\/send/.test(htmlLower);
  let hasPhoneLink =
    $('a[href^="tel:"]').length > 0 || $('a[href^="sms:"]').length > 0;
  let hasBooking =
    /book\s*(now|online|appointment)|online\s*booking|request\s*(an?\s*)?(appointment|visit|consultation)|schedule\s*(an?\s*)?(appointment|visit)|calendly|setmore|simplybook|doctible|zocdoc|patient\s*portal/i.test(
      htmlLower
    );
  let hasMap = /google\.com\/maps|maps\.google|goo\.gl\/maps|maps\.app\.goo\.gl|<iframe[^>]+maps/.test(htmlLower);
  let hasReviews = /review|testimonial|rating|google\s*reviews|trustpilot|healthgrades/.test(htmlLower);
  let hasForm = $("form").length > 0;

  // DEEP SCAN (zero API credits — our own fetches only).
  // A signal missing from the homepage HTML is NOT proof it's missing from
  // the site: it may live in JS bundles (SPAs) or on the contact/booking
  // page. Before reporting anything as "not detected", look there too.
  const wordCount = bodyText ? bodyText.split(" ").length : 0;
  const scriptSrcs = $("script[src]")
    .map((_, el) => $(el).attr("src"))
    .get()
    .filter(Boolean)
    .map((src) => { try { return new URL(src, finalUrl).toString(); } catch { return null; } })
    .filter((u) => u && new URL(u).origin === new URL(finalUrl).origin)
    .slice(0, 3);

  const isSpa = wordCount < 200 && scriptSrcs.length > 0;
  const anySignalMissing = !(hasWhatsApp && hasPhoneLink && hasBooking && hasMap && hasReviews && hasForm);
  let pagesScanned = 1;

  if (anySignalMissing) {
    const extraTexts = [];

    // 1. JS bundles (always when something is missing, not only for SPAs —
    //    hybrid sites hide buttons in JS too).
    if (scriptSrcs.length) {
      const bundles = await Promise.all(
        scriptSrcs.map((u) =>
          safeFetch(u, { timeoutMs: 15000 })
            .then(({ response: r }) => (r.ok ? r.text() : ""))
            .catch(() => "")
        )
      );
      extraTexts.push(bundles.join(" "));
    }

    // 2. Likely conversion pages (contact / book / appointment), same origin.
    const innerLinks = $("a[href]")
      .map((_, el) => $(el).attr("href"))
      .get()
      .filter((h) => h && /contact|book|appointment|about/i.test(h))
      .map((h) => { try { return new URL(h, finalUrl).toString(); } catch { return null; } })
      .filter((u) => u && new URL(u).origin === new URL(finalUrl).origin && u !== finalUrl);
    const uniquePages = [...new Set(innerLinks)].slice(0, 2);

    if (uniquePages.length) {
      const pages = await Promise.all(
        uniquePages.map((u) =>
          safeFetch(u, { timeoutMs: 15000 })
            .then(({ response: r }) => (r.ok ? r.text() : ""))
            .catch(() => "")
        )
      );
      pagesScanned += pages.filter(Boolean).length;
      extraTexts.push(pages.join(" "));
    }

    const extra = extraTexts.join(" ").toLowerCase();
    if (extra) {
      hasWhatsApp = hasWhatsApp || /wa\.me|api\.whatsapp\.com|whatsapp\.com\/send/.test(extra);
      hasPhoneLink = hasPhoneLink || /["'`]tel:|href=["']tel:|href=["']sms:|["']sms:/.test(extra);
      hasBooking =
        hasBooking ||
        /book\s*(now|online|appointment)|online\s*booking|request\s*(an?\s*)?(appointment|visit|consultation)|calendly|doctible|zocdoc/.test(
          extra
        );
      hasMap = hasMap || /google\.com\/maps|maps\.google|goo\.gl\/maps|maps\.app\.goo\.gl/.test(extra);
      hasReviews = hasReviews || /review|testimonial|healthgrades|trustpilot/.test(extra);
      hasForm = hasForm || /<form|onsubmit|handlesubmit/.test(extra);
    }
  }

  return {
    finalUrl,
    statusCode: res.status,
    isHttps: finalUrl.startsWith("https://"),
    // Core SEO tags
    title,
    titleLength: title.length,
    metaDescription: metaDesc,
    metaDescriptionLength: metaDesc.length,
    h1Count: h1s.length,
    h1Text: h1s.first().text().trim().slice(0, 120),
    hasCanonical: $('link[rel="canonical"]').length > 0,
    hasViewport: $('meta[name="viewport"]').length > 0,
    hasLangAttr: !!$("html").attr("lang"),
    hasFavicon: $('link[rel*="icon"]').length > 0,
    // Social sharing
    hasOgTitle: $('meta[property="og:title"]').length > 0,
    hasOgImage: $('meta[property="og:image"]').length > 0,
    hasTwitterCard: $('meta[name="twitter:card"]').length > 0,
    // Structured data & indexing
    hasStructuredData: $('script[type="application/ld+json"]').length > 0,
    robotsMeta: $('meta[name="robots"]').attr("content") || "",
    // Content depth
    wordCount,
    isSpa, // JS-rendered app: raw-HTML word count / tag checks are unreliable
    pagesScanned,
    imageCount: images.length,
    imagesMissingAlt,
    // Conversion / UX signals — false means "not detected", not absolute absence
    conversion: {
      hasWhatsApp,
      hasPhoneLink,
      hasBooking,
      hasMap,
      hasReviews,
      hasForm,
      detectionNote:
        "false = not detected on scanned HTML/JS (widgets/embeds may still exist)",
    },
  };
}

module.exports = { analyzeSeo };
