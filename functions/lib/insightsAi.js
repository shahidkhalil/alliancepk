/**
 * OpenAI blog draft generation for admin insights.
 */
const { mapKeywordToService, slugify } = require("./serviceMap");

const GRADIENTS = [
  "linear-gradient(135deg, #00283C 0%, #005C7A 45%, #00B4D8 100%)",
  "linear-gradient(135deg, #0B3D4A 0%, #0077A8 50%, #00B4D8 100%)",
  "linear-gradient(135deg, #00283C 0%, #004D66 40%, #0096C7 100%)",
];

function formatDisplayDate(d = new Date()) {
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadTime(sections) {
  const words = sections
    .flatMap((s) => [s.heading, ...(s.paragraphs || [])])
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  const mins = Math.max(5, Math.min(14, Math.round(words / 180)));
  return `${mins} min read`;
}

async function generateBlogFromKeyword({
  query,
  openaiKey,
  gscMeta,
  model = "gpt-4o-mini",
}) {
  const mapped = mapKeywordToService(query);
  const city = mapped.location.city;
  const state = mapped.location.state;
  const service = mapped.service;

  const prompt = `You are an expert healthcare B2B SEO copywriter for Alliance Tech (alliancetechltd.com), a Houston/Texas agency that helps clinics grow with AI receptionist, websites, SEO, and digital marketing.

Write ONE blog post as strict JSON (no markdown fences) with this exact shape:
{
  "slug": "kebab-case-slug-with-keyword-and-city",
  "title": "H1 with primary intent + city/state",
  "excerpt": "1-2 sentences with primary keyword",
  "metaTitle": "50-60 chars, keyword + location + benefit",
  "metaDescription": "140-155 chars, keyword + location + benefit + CTA hint",
  "keywords": ["primary query", "5-8 related variants"],
  "sections": [
    { "heading": "H2", "paragraphs": ["...", "..."] }
  ]
}

Rules:
- Target search query: "${query}"
- Mapped service: ${service.id}
- Location: ${city}, ${state}
- Service CTA page (do NOT invent a different URL): ${service.serviceLink.href}
- 5-8 H2 sections, ~800-1400 words total across all paragraphs
- Use sections[] only
- Natural keyword use in the first section; mention ${city} / ${state} in 2-3 places
- Professional, specific, clinic-owner focused — no fluff, no keyword stuffing
- LAST section MUST be an action CTA H2 starting with "Ready" (or similar), 2-3 paragraphs
- Do NOT include a serviceLink object in the JSON
- slug must include a service keyword and city token
- Alliance Tech voice; healthcare clinics in the US`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Return only valid JSON for an SEO blog post. Follow the user schema exactly.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const completion = await res.json();
  const raw = completion.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw);

  if (!parsed.title || !Array.isArray(parsed.sections) || parsed.sections.length < 4) {
    throw new Error("OpenAI returned incomplete blog JSON");
  }

  const sections = parsed.sections
    .map((s) => ({
      heading: String(s.heading || "").trim(),
      paragraphs: (s.paragraphs || []).map((p) => String(p).trim()).filter(Boolean),
    }))
    .filter((s) => s.heading && s.paragraphs.length);

  const last = sections[sections.length - 1];
  if (!/ready|next step|get started|book|schedule|talk to/i.test(last?.heading || "")) {
    sections.push({
      heading: `Ready to grow your ${city} clinic with Alliance Tech?`,
      paragraphs: [
        `If "${query}" describes what your practice needs, Alliance Tech can help clinics in ${city}, ${state} turn search demand into booked appointments.`,
        `We combine ${service.id.replace(/-/g, " ")} expertise with conversion-focused systems built for healthcare.`,
        `Take the next step today — see how Alliance Tech supports clinics like yours.`,
      ],
    });
  }

  const slug =
    slugify(parsed.slug || `${service.id}-${city}-clinics`) ||
    slugify(`${service.id}-${city}-clinics`);

  return {
    slug,
    title: String(parsed.title).trim(),
    excerpt: String(parsed.excerpt || "").trim(),
    location: city,
    state,
    readTime: estimateReadTime(sections),
    date: formatDisplayDate(),
    imageGradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
    content: [],
    sections,
    metaTitle: String(parsed.metaTitle || parsed.title).trim().slice(0, 65),
    metaDescription: String(parsed.metaDescription || parsed.excerpt || "")
      .trim()
      .slice(0, 160),
    keywords: Array.from(
      new Set([
        query,
        ...((parsed.keywords || []).map((k) => String(k).trim())),
      ])
    )
      .filter(Boolean)
      .slice(0, 12),
    serviceLink: service.serviceLink,
    published: false,
    source: "admin_insights",
    gscOpportunity: gscMeta || {
      query,
      clicks: 0,
      impressions: 0,
      ctr: 0,
      position: 0,
      score: 0,
    },
    updatedAt: new Date().toISOString(),
  };
}

async function chatAboutInsights({ question, context, openaiKey, history, model = "gpt-4o-mini" }) {
  const system = `You are an SEO/growth analyst for Alliance Tech (alliancetechltd.com).
Answer briefly and practically using ONLY the Search Console / Analytics context provided.
Suggest blog topics and keywords when asked. Prefer US/Houston clinic opportunities.
If data is missing, say so. Do not invent metrics.`;

  const messages = [
    { role: "system", content: system },
    {
      role: "user",
      content: `Context (JSON):\n${JSON.stringify(context).slice(0, 14000)}\n\nQuestion: ${question}`,
    },
  ];
  if (Array.isArray(history) && history.length) {
    // Keep last few turns before the latest question
    const prior = history.slice(-6).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 2000),
    }));
    messages.splice(1, 0, ...prior);
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages,
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI chat error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = await res.json();
  return String(data.choices?.[0]?.message?.content || "").trim();
}

module.exports = { generateBlogFromKeyword, chatAboutInsights };
