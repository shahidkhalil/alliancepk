import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { BlogPost, BlogSection } from "@/lib/blogTypes";

const DEFAULT_GRADIENT = "linear-gradient(135deg, #00283C 0%, #005C7A 50%, #00B4D8 100%)";

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function asSections(v: unknown): BlogSection[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const heading = asString((item as BlogSection).heading);
      const paragraphs = asStringArray((item as BlogSection).paragraphs);
      if (!heading || !paragraphs.length) return null;
      return { heading, paragraphs };
    })
    .filter((s): s is BlogSection => Boolean(s));
}

function asServiceLink(v: unknown): BlogPost["serviceLink"] | undefined {
  if (!v || typeof v !== "object") return undefined;
  const href = asString((v as { href?: unknown }).href);
  const label = asString((v as { label?: unknown }).label);
  const description = asString((v as { description?: unknown }).description);
  if (!href || !label) return undefined;
  return { href, label, description };
}

/** Normalize a Firestore document into BlogPost. */
export function mapBlogDoc(id: string, data: DocumentData | undefined): BlogPost | null {
  if (!data) return null;
  if (data.published === false) return null;

  const title = asString(data.title);
  if (!title) return null;

  const slug = asString(data.slug, id) || id;
  return {
    slug,
    title,
    excerpt: asString(data.excerpt),
    location: asString(data.location, "Houston"),
    state: asString(data.state, "Texas"),
    readTime: asString(data.readTime, "5 min read"),
    date: asString(data.date),
    imageGradient: asString(data.imageGradient, DEFAULT_GRADIENT),
    content: asStringArray(data.content),
    sections: asSections(data.sections),
    metaTitle: asString(data.metaTitle) || undefined,
    metaDescription: asString(data.metaDescription) || undefined,
    keywords: asStringArray(data.keywords),
    serviceLink: asServiceLink(data.serviceLink),
    published: data.published !== false,
  };
}

/** Prefer slug-id docs; keep auto-id posts only if unique by slug. */
function isLegacyAutoId(docId: string, slug: string): boolean {
  return /^[A-Za-z0-9]{20}$/.test(docId) && slug !== docId;
}

function sortPosts(posts: BlogPost[], preferSlugKey: Set<string>): BlogPost[] {
  const bySlug = new Map<string, BlogPost>();
  // First pass: slug-keyed docs
  for (const p of posts) {
    if (!preferSlugKey.has(p.slug)) continue;
    if (!p.slug.includes("-") && p.slug.length < 8) continue;
    bySlug.set(p.slug, p);
  }
  // Second: auto-id / other only if slug not already present
  for (const p of posts) {
    if (preferSlugKey.has(p.slug)) continue;
    if (!p.slug.includes("-") && p.slug.length < 8) continue;
    if (!bySlug.has(p.slug)) bySlug.set(p.slug, p);
  }
  return [...bySlug.values()].sort((a, b) => {
    const da = Date.parse(a.date) || 0;
    const db = Date.parse(b.date) || 0;
    if (db !== da) return db - da;
    return a.title.localeCompare(b.title);
  });
}

/** Client: load all published blogs from Firestore. */
export async function fetchBlogsFromFirestore(): Promise<BlogPost[]> {
  const col = collection(getDb(), "blogs");
  let snap;
  try {
    snap = await getDocs(query(col, where("published", "==", true)));
  } catch {
    // Older docs may omit `published` — fall back to full collection read
    snap = await getDocs(col);
  }

  const posts: BlogPost[] = [];
  const slugKeyed = new Set<string>();
  snap.forEach((d) => {
    const mapped = mapBlogDoc(d.id, d.data());
    if (!mapped) return;
    if (!isLegacyAutoId(d.id, mapped.slug)) slugKeyed.add(mapped.slug);
    posts.push(mapped);
  });

  // Include docs without published:true that still look like posts
  if (posts.length === 0) {
    const all = await getDocs(col);
    all.forEach((d) => {
      const mapped = mapBlogDoc(d.id, d.data());
      if (!mapped) return;
      if (!isLegacyAutoId(d.id, mapped.slug)) slugKeyed.add(mapped.slug);
      posts.push(mapped);
    });
  }

  return sortPosts(posts, slugKeyed);
}

/** Client: load one blog by slug. */
export async function fetchBlogBySlug(slug: string): Promise<BlogPost | null> {
  const key = String(slug || "").trim();
  if (!key) return null;

  const direct = await getDoc(doc(getDb(), "blogs", key));
  if (direct.exists()) {
    return mapBlogDoc(direct.id, direct.data());
  }

  // Rare: auto-id docs with slug field
  const q = query(collection(getDb(), "blogs"), where("slug", "==", key));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const d = snap.docs[0];
    return mapBlogDoc(d.id, d.data());
  }
  return null;
}
