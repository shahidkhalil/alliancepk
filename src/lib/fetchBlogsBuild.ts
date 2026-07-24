/**
 * Build-time / Node-safe fetch of blogs via Firestore REST (public read).
 * Used by generateStaticParams, generateMetadata, and sitemap.
 *
 * Uses Node `https` (not Next's patched `fetch`) so static export is not
 * blocked by no-store / Data Cache staleness.
 */

import https from "https";
import type { BlogPost, BlogSection } from "@/lib/blogTypes";

const PROJECT = "alliancepak";
const LIST_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/blogs?pageSize=100`;

type FsValue = {
  stringValue?: string;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  arrayValue?: { values?: FsValue[] };
  mapValue?: { fields?: Record<string, FsValue> };
  nullValue?: null;
};

function fsString(v: FsValue | undefined, fallback = ""): string {
  return v?.stringValue ?? fallback;
}

function fsStrings(v: FsValue | undefined): string[] {
  const values = v?.arrayValue?.values || [];
  return values.map((x) => x.stringValue).filter((x): x is string => Boolean(x));
}

function fsSections(v: FsValue | undefined): BlogSection[] {
  const values = v?.arrayValue?.values || [];
  return values
    .map((item) => {
      const f = item.mapValue?.fields;
      if (!f) return null;
      const heading = fsString(f.heading);
      const paragraphs = fsStrings(f.paragraphs);
      if (!heading || !paragraphs.length) return null;
      return { heading, paragraphs };
    })
    .filter((s): s is BlogSection => Boolean(s));
}

function fsServiceLink(v: FsValue | undefined): BlogPost["serviceLink"] | undefined {
  const f = v?.mapValue?.fields;
  if (!f) return undefined;
  const href = fsString(f.href);
  const label = fsString(f.label);
  const description = fsString(f.description);
  if (!href || !label) return undefined;
  return { href, label, description };
}

function docToPost(name: string, fields: Record<string, FsValue> | undefined): BlogPost | null {
  if (!fields) return null;
  if (fields.published?.booleanValue === false) return null;
  const title = fsString(fields.title);
  if (!title) return null;
  const id = name.split("/").pop() || "";
  const slug = fsString(fields.slug, id) || id;
  // Skip legacy auto-id junk without a real slug/title pattern
  if (!slug || slug.length < 3) return null;

  return {
    slug,
    title,
    excerpt: fsString(fields.excerpt),
    location: fsString(fields.location, "Houston"),
    state: fsString(fields.state, "Texas"),
    readTime: fsString(fields.readTime, "5 min read"),
    date: fsString(fields.date),
    imageGradient:
      fsString(fields.imageGradient) ||
      "linear-gradient(135deg, #00283C 0%, #005C7A 50%, #00B4D8 100%)",
    content: fsStrings(fields.content),
    sections: fsSections(fields.sections),
    metaTitle: fsString(fields.metaTitle) || undefined,
    metaDescription: fsString(fields.metaDescription) || undefined,
    keywords: fsStrings(fields.keywords),
    serviceLink: fsServiceLink(fields.serviceLink),
    published: true,
  };
}

function httpsGetJson(url: string): Promise<{ documents?: { name: string; fields?: Record<string, FsValue> }[] }> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(raw));
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error(`Firestore REST ${res.statusCode}: ${raw.slice(0, 200)}`));
          }
        });
      })
      .on("error", reject);
  });
}

let cache: BlogPost[] | null = null;
let inflight: Promise<BlogPost[]> | null = null;

/** Fetch all blogs for build/SSR. Cached for the duration of one Node process. */
export async function fetchBlogsForBuild(): Promise<BlogPost[]> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const json = await httpsGetJson(LIST_URL);
      const bySlug = new Map<string, BlogPost>();
      for (const d of json.documents || []) {
        const id = d.name.split("/").pop() || "";
        const p = docToPost(d.name, d.fields);
        if (!p) continue;
        if (!p.slug.includes("-") && p.slug.length < 8) continue;
        const isAutoId = /^[A-Za-z0-9]{20}$/.test(id) && p.slug !== id;
        const existing = bySlug.get(p.slug);
        // Prefer slug-keyed docs over legacy auto-id duplicates
        if (existing && isAutoId) continue;
        if (!existing || !isAutoId) bySlug.set(p.slug, p);
      }
      const posts = [...bySlug.values()].sort((a, b) => {
        const da = Date.parse(a.date) || 0;
        const db = Date.parse(b.date) || 0;
        return db - da;
      });

      console.log(`[blogs] build fetch: ${posts.length} posts`);
      cache = posts;
      return posts;
    } catch (e) {
      console.warn("fetchBlogsForBuild failed:", e instanceof Error ? e.message : e);
      return cache || [];
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export async function fetchBlogBySlugForBuild(slug: string): Promise<BlogPost | null> {
  const posts = await fetchBlogsForBuild();
  return posts.find((p) => p.slug === slug) || null;
}
