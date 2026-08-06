import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { AdminBlogDraft, BlogPost, BlogSection } from "@/lib/blogTypes";

const DEFAULT_GRADIENT = "linear-gradient(135deg, #00283C 0%, #005C7A 50%, #00B4D8 100%)";

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function asNumber(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
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

function asGscOpportunity(v: unknown): BlogPost["gscOpportunity"] | undefined {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Record<string, unknown>;
  const queryText = asString(o.query);
  if (!queryText) return undefined;
  return {
    query: queryText,
    clicks: asNumber(o.clicks),
    impressions: asNumber(o.impressions),
    ctr: asNumber(o.ctr),
    position: asNumber(o.position),
    score: asNumber(o.score),
  };
}

function baseFromDoc(
  id: string,
  data: DocumentData
): Omit<BlogPost, "published"> & { published: boolean } {
  return {
    slug: asString(data.slug, id) || id,
    title: asString(data.title),
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
    source: asString(data.source) || undefined,
    updatedAt: asString(data.updatedAt) || undefined,
    gscOpportunity: asGscOpportunity(data.gscOpportunity),
    bodyHtml: asString(data.bodyHtml) || undefined,
    published: data.published !== false,
  };
}

/** Normalize a Firestore document into BlogPost (published only). */
export function mapBlogDoc(id: string, data: DocumentData | undefined): BlogPost | null {
  if (!data) return null;
  if (data.published === false) return null;

  const title = asString(data.title);
  if (!title) return null;

  return baseFromDoc(id, data);
}

/** Admin: include drafts (`published: false`). */
export function mapBlogDocAdmin(
  id: string,
  data: DocumentData | undefined
): AdminBlogDraft | null {
  if (!data) return null;
  const title = asString(data.title);
  if (!title) return null;
  const base = baseFromDoc(id, data);
  return {
    ...base,
    docId: id,
    published: data.published !== false,
  };
}

/** Prefer slug-id docs; keep auto-id posts only if unique by slug. */
function isLegacyAutoId(docId: string, slug: string): boolean {
  return /^[A-Za-z0-9]{20}$/.test(docId) && slug !== docId;
}

function sortPosts(posts: BlogPost[], preferSlugKey: Set<string>): BlogPost[] {
  const bySlug = new Map<string, BlogPost>();
  for (const p of posts) {
    if (!preferSlugKey.has(p.slug)) continue;
    if (!p.slug.includes("-") && p.slug.length < 8) continue;
    bySlug.set(p.slug, p);
  }
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

function sortDrafts(posts: AdminBlogDraft[]): AdminBlogDraft[] {
  return [...posts].sort((a, b) => {
    const ua = Date.parse(a.updatedAt || "") || 0;
    const ub = Date.parse(b.updatedAt || "") || 0;
    if (ub !== ua) return ub - ua;
    const da = Date.parse(a.date) || 0;
    const db = Date.parse(b.date) || 0;
    if (db !== da) return db - da;
    return a.title.localeCompare(b.title);
  });
}

/** Client-side cache so navigating blogs doesn't re-hit Firestore every time. */
let blogsListCache: BlogPost[] | null = null;
let blogsListInflight: Promise<BlogPost[]> | null = null;
const blogBySlugCache = new Map<string, BlogPost | null>();

/** Client: load all published blogs from Firestore. */
export async function fetchBlogsFromFirestore(): Promise<BlogPost[]> {
  if (blogsListCache) return blogsListCache;
  if (blogsListInflight) return blogsListInflight;

  blogsListInflight = (async () => {
    const col = collection(getDb(), "blogs");
    let snap;
    try {
      snap = await getDocs(query(col, where("published", "==", true)));
    } catch {
      snap = await getDocs(col);
    }

    const posts: BlogPost[] = [];
    const slugKeyed = new Set<string>();
    snap.forEach((d) => {
      const mapped = mapBlogDoc(d.id, d.data());
      if (!mapped) return;
      if (!isLegacyAutoId(d.id, mapped.slug)) slugKeyed.add(mapped.slug);
      posts.push(mapped);
      blogBySlugCache.set(mapped.slug, mapped);
    });

    if (posts.length === 0) {
      const all = await getDocs(col);
      all.forEach((d) => {
        const mapped = mapBlogDoc(d.id, d.data());
        if (!mapped) return;
        if (!isLegacyAutoId(d.id, mapped.slug)) slugKeyed.add(mapped.slug);
        posts.push(mapped);
        blogBySlugCache.set(mapped.slug, mapped);
      });
    }

    const sorted = sortPosts(posts, slugKeyed);
    blogsListCache = sorted;
    return sorted;
  })().finally(() => {
    blogsListInflight = null;
  });

  return blogsListInflight;
}

/** Client: load one blog by slug. */
export async function fetchBlogBySlug(
  slug: string,
  opts?: { bypassCache?: boolean }
): Promise<BlogPost | null> {
  const key = String(slug || "").trim();
  if (!key) return null;

  if (!opts?.bypassCache && blogBySlugCache.has(key)) {
    return blogBySlugCache.get(key) ?? null;
  }

  const direct = await getDoc(doc(getDb(), "blogs", key));
  if (direct.exists()) {
    const mapped = mapBlogDoc(direct.id, direct.data());
    blogBySlugCache.set(key, mapped);
    return mapped;
  }

  const q = query(collection(getDb(), "blogs"), where("slug", "==", key));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const d = snap.docs[0];
    const mapped = mapBlogDoc(d.id, d.data());
    blogBySlugCache.set(key, mapped);
    return mapped;
  }
  blogBySlugCache.set(key, null);
  return null;
}

/** Admin: one-shot fetch of unpublished drafts. */
export async function fetchDraftBlogs(): Promise<AdminBlogDraft[]> {
  const all = await fetchAllBlogsAdmin();
  return all.filter((b) => b.published === false);
}

function sortAdminBlogs(posts: AdminBlogDraft[]): AdminBlogDraft[] {
  return [...posts].sort((a, b) => {
    // Drafts first, then by updatedAt/date
    if (a.published !== b.published) return a.published ? 1 : -1;
    const ua = Date.parse(a.updatedAt || "") || 0;
    const ub = Date.parse(b.updatedAt || "") || 0;
    if (ub !== ua) return ub - ua;
    const da = Date.parse(a.date) || 0;
    const db = Date.parse(b.date) || 0;
    if (db !== da) return db - da;
    return a.title.localeCompare(b.title);
  });
}

/** Admin: fetch every blog (published + drafts). */
export async function fetchAllBlogsAdmin(): Promise<AdminBlogDraft[]> {
  const snap = await getDocs(collection(getDb(), "blogs"));
  const blogs: AdminBlogDraft[] = [];
  snap.forEach((d) => {
    const mapped = mapBlogDocAdmin(d.id, d.data());
    if (mapped) blogs.push(mapped);
  });
  return sortAdminBlogs(blogs);
}

/** Admin: live subscribe to all blogs. */
export function subscribeAllBlogs(
  onData: (blogs: AdminBlogDraft[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(getDb(), "blogs"),
    (snap) => {
      const blogs: AdminBlogDraft[] = [];
      snap.forEach((d) => {
        const mapped = mapBlogDocAdmin(d.id, d.data());
        if (mapped) blogs.push(mapped);
      });
      onData(sortAdminBlogs(blogs));
    },
    (err) => onError?.(err)
  );
}

/** Admin: live subscribe to unpublished drafts. */
export function subscribeDraftBlogs(
  onData: (drafts: AdminBlogDraft[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return subscribeAllBlogs(
    (blogs) => onData(blogs.filter((b) => b.published === false)),
    onError
  );
}

/** Admin: publish a draft live. */
export async function approveBlog(slugOrDocId: string): Promise<void> {
  const id = String(slugOrDocId || "").trim();
  if (!id) throw new Error("Missing blog id");
  await updateDoc(doc(getDb(), "blogs", id), {
    published: true,
    source: "admin_approved",
    updatedAt: new Date().toISOString(),
  });
}

/** Admin: unpublish (back to draft). */
export async function unpublishBlog(slugOrDocId: string): Promise<void> {
  const id = String(slugOrDocId || "").trim();
  if (!id) throw new Error("Missing blog id");
  await updateDoc(doc(getDb(), "blogs", id), {
    published: false,
    source: "admin_unpublished",
    updatedAt: new Date().toISOString(),
  });
}

/** Admin: reject/delete a blog. */
export async function deleteDraftBlog(slugOrDocId: string): Promise<void> {
  const id = String(slugOrDocId || "").trim();
  if (!id) throw new Error("Missing blog id");
  await deleteDoc(doc(getDb(), "blogs", id));
}

export const deleteBlog = deleteDraftBlog;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Admin: create or overwrite a blog document by slug. */
export async function upsertBlog(
  post: BlogPost,
  opts?: { merge?: boolean; previousDocId?: string }
): Promise<string> {
  const slug = slugify(post.slug || post.title);
  if (!slug) throw new Error("Slug is required");
  if (!post.title?.trim()) throw new Error("Title is required");

  const sections = (post.sections || [])
    .map((s) => ({
      heading: String(s.heading || "").trim(),
      paragraphs: (s.paragraphs || []).map((p) => String(p).trim()).filter(Boolean),
    }))
    .filter((s) => s.heading && s.paragraphs.length);

  const bodyHtml = String(post.bodyHtml || "").trim();
  const hasHtml = bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length >= 20;

  if (!hasHtml && !sections.length) {
    throw new Error("Add blog content in the editor (or at least one section)");
  }

  const serviceLink = post.serviceLink;
  if (!serviceLink?.href?.trim() || !serviceLink?.label?.trim()) {
    throw new Error("CTA href and label are required");
  }

  const payload: Record<string, unknown> = {
    slug,
    title: post.title.trim(),
    excerpt: (post.excerpt || "").trim(),
    location: (post.location || "Houston").trim(),
    state: (post.state || "Texas").trim(),
    readTime: (post.readTime || "8 min read").trim(),
    date:
      (post.date || "").trim() ||
      new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    imageGradient: (post.imageGradient || "").trim() || DEFAULT_GRADIENT,
    content: Array.isArray(post.content) ? post.content : [],
    sections: hasHtml ? [] : sections,
    bodyHtml: hasHtml ? bodyHtml : "",
    metaTitle: (post.metaTitle || post.title).trim(),
    metaDescription: (post.metaDescription || post.excerpt || "").trim(),
    keywords: (post.keywords || []).map((k) => String(k).trim()).filter(Boolean),
    serviceLink: {
      href: serviceLink.href.trim(),
      label: serviceLink.label.trim(),
      description: (serviceLink.description || "").trim(),
    },
    published: post.published === true,
    source: post.source || "admin_upload",
    updatedAt: new Date().toISOString(),
  };

  if (post.gscOpportunity?.query) {
    payload.gscOpportunity = post.gscOpportunity;
  }

  await setDoc(doc(getDb(), "blogs", slug), payload, {
    merge: opts?.merge === true,
  });

  // If slug changed on edit, remove the old doc
  const prev = opts?.previousDocId?.trim();
  if (prev && prev !== slug) {
    await deleteDoc(doc(getDb(), "blogs", prev));
  }

  return slug;
}
