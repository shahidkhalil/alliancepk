/**
 * Generate an SEO blog draft from a GSC opportunity (OpenAI).
 *
 * Usage:
 *   npx tsx scripts/gsc-generate-blog.ts --auto
 *   npx tsx scripts/gsc-generate-blog.ts --auto --publish-draft
 *   npx tsx scripts/gsc-generate-blog.ts --from scripts/data/generated/opportunities.json --index 0
 *
 * Requires OPENAI_API_KEY in the environment.
 */
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import {
  argFlag,
  argValue,
  BlogPost,
  fetchGscQueries,
  listExistingBlogs,
  loadFirebaseToken,
  loadServiceMap,
  Opportunity,
  patchBlogDoc,
  scoreOpportunities,
  slugify,
} from "./gsc-blog/lib";

const GRADIENTS = [
  "linear-gradient(135deg, #00283C 0%, #005C7A 45%, #00B4D8 100%)",
  "linear-gradient(135deg, #0B3D4A 0%, #0077A8 50%, #00B4D8 100%)",
  "linear-gradient(135deg, #00283C 0%, #004D66 40%, #0096C7 100%)",
];

function formatDisplayDate(d = new Date()): string {
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadTime(sections: BlogPost["sections"]): string {
  const words = sections
    .flatMap((s) => [s.heading, ...s.paragraphs])
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  const mins = Math.max(5, Math.min(14, Math.round(words / 180)));
  return `${mins} min read`;
}

async function loadOpportunity(): Promise<Opportunity> {
  const from = argValue("--from");
  const index = Number(argValue("--index") || 0);
  if (from) {
    const raw = JSON.parse(fs.readFileSync(path.resolve(from), "utf8"));
    const list = (raw.opportunities || raw) as Opportunity[];
    if (!list[index]) throw new Error(`No opportunity at index ${index}`);
    return list[index];
  }
  if (!argFlag("--auto")) {
    throw new Error(
      "Pass --auto (top opportunity) or --from <opportunities.json> --index N"
    );
  }
  const days = Number(argValue("--days") || 28);
  const [rows, existing, map] = await Promise.all([
    fetchGscQueries({ days, rowLimit: 1000 }),
    listExistingBlogs(),
    Promise.resolve(loadServiceMap()),
  ]);
  const ranked = scoreOpportunities(rows, map, existing);
  if (!ranked.length) throw new Error("No opportunities found");
  const pick = Number(argValue("--rank") || 1) - 1;
  return ranked[Math.max(0, pick)] || ranked[0];
}

function buildPrompt(opp: Opportunity): string {
  return `You are an expert healthcare B2B SEO copywriter for Alliance Tech (alliancetechltd.com), a Houston/Texas agency that helps clinics grow with AI receptionist, websites, SEO, and digital marketing.

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
- Target search query: "${opp.query}"
- Mapped service: ${opp.service.id}
- Location: ${opp.location.city}, ${opp.location.state}
- Service CTA page (do NOT invent a different URL): ${opp.service.serviceLink.href}
- 5-8 H2 sections, ~800-1400 words total across all paragraphs
- Use sections[] only (never dump one giant paragraph)
- Natural keyword use in the first section; mention ${opp.location.city} / ${opp.location.state} in 2-3 places
- Professional, specific, clinic-owner focused — no fluff, no keyword stuffing
- LAST section MUST be an action CTA H2 starting with "Ready" (or similar), 2-3 paragraphs that:
  1) restate the service + city benefit
  2) invite the clinic owner to take the next step
  3) mention Alliance Tech naturally
- Do NOT include a serviceLink object in the JSON (we attach it in code)
- slug must include a service keyword and city token
- Alliance Tech voice; healthcare clinics in the US`;
}

async function generateWithOpenAI(opp: Opportunity): Promise<BlogPost> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.6,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Return only valid JSON for an SEO blog post. Follow the user schema exactly.",
      },
      { role: "user", content: buildPrompt(opp) },
    ],
  });
  const raw = completion.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw) as Partial<BlogPost>;

  if (!parsed.title || !Array.isArray(parsed.sections) || parsed.sections.length < 4) {
    throw new Error("OpenAI returned incomplete blog JSON");
  }

  const city = opp.location.city;
  const slug =
    slugify(parsed.slug || `${opp.service.id}-${city}-clinics`) ||
    slugify(`${opp.service.id}-${city}-clinics`);

  const sections = parsed.sections.map((s) => ({
    heading: String(s.heading || "").trim(),
    paragraphs: (s.paragraphs || []).map((p) => String(p).trim()).filter(Boolean),
  })).filter((s) => s.heading && s.paragraphs.length);

  const last = sections[sections.length - 1];
  if (!/ready|next step|get started|book|schedule|talk to/i.test(last.heading)) {
    sections.push({
      heading: `Ready to grow your ${city} clinic with Alliance Tech?`,
      paragraphs: [
        `If "${opp.query}" describes what your practice needs, Alliance Tech can help clinics in ${city}, ${opp.location.state} turn search demand into booked appointments.`,
        `We combine ${opp.service.id.replace(/-/g, " ")} expertise with conversion-focused systems built for healthcare.`,
        `Take the next step today — see how Alliance Tech supports clinics like yours.`,
      ],
    });
  }

  const post: BlogPost = {
    slug,
    title: String(parsed.title).trim(),
    excerpt: String(parsed.excerpt || "").trim(),
    location: city,
    state: opp.location.state,
    readTime: estimateReadTime(sections),
    date: formatDisplayDate(),
    imageGradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
    content: [],
    sections,
    metaTitle: String(parsed.metaTitle || parsed.title).trim().slice(0, 65),
    metaDescription: String(
      parsed.metaDescription || parsed.excerpt || ""
    )
      .trim()
      .slice(0, 160),
    keywords: Array.from(
      new Set([
        opp.query,
        ...((parsed.keywords || []) as string[]).map((k) => String(k).trim()),
      ])
    ).filter(Boolean).slice(0, 12),
    serviceLink: opp.service.serviceLink,
    published: false,
    source: "gsc_auto_blog",
    gscOpportunity: {
      query: opp.query,
      clicks: opp.clicks,
      impressions: opp.impressions,
      ctr: opp.ctr,
      position: opp.position,
      score: opp.score,
    },
    updatedAt: new Date().toISOString(),
  };

  if (!post.serviceLink?.href || !post.serviceLink.label) {
    throw new Error("serviceLink is required");
  }
  return post;
}

async function main() {
  const opp = await loadOpportunity();
  console.error(
    `Opportunity: "${opp.query}" → ${opp.service.id} @ ${opp.location.city} (score ${opp.score})`
  );

  const post = await generateWithOpenAI(opp);
  const outDir = path.resolve("scripts/data/generated");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${post.slug}.json`);
  fs.writeFileSync(outPath, JSON.stringify([post], null, 2));
  console.error(`Wrote ${outPath}`);

  if (argFlag("--publish-draft")) {
    const token = loadFirebaseToken();
    await patchBlogDoc(token, post.slug, {
      ...post,
      published: false,
      source: "gsc_auto_blog",
      updatedAt: new Date().toISOString(),
    });
    console.error(`Draft upserted to Firestore blogs/${post.slug} (published: false)`);
  } else {
    console.error("Skipped Firestore upsert (pass --publish-draft to write draft)");
  }

  console.log(
    JSON.stringify(
      {
        slug: post.slug,
        title: post.title,
        file: outPath,
        serviceLink: post.serviceLink,
        published: post.published,
        gscOpportunity: post.gscOpportunity,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
