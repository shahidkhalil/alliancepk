/**
 * Shared types + helpers for GSC → auto-blog scripts.
 */
import fs from "fs";
import path from "path";
import https from "https";
import { GoogleAuth } from "google-auth-library";

export const PROJECT = process.env.FIREBASE_PROJECT || "alliancepak";
export const GSC_SITE =
  process.env.GSC_SITE_URL || "sc-domain:alliancetechltd.com";
export const DEFAULT_CREDS =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(
    process.env.HOME || "",
    ".config/gcloud/analytics-mcp-alliancepak.json"
  );

export type ServiceLink = {
  href: string;
  label: string;
  description: string;
};

export type ServiceMap = {
  brandSkip: string[];
  locations: {
    id: string;
    city: string;
    state: string;
    patterns: string[];
  }[];
  services: {
    id: string;
    patterns: string[];
    serviceLink: ServiceLink;
  }[];
};

export type GscRow = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type Opportunity = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  score: number;
  reason: string;
  location: { id: string; city: string; state: string };
  service: { id: string; serviceLink: ServiceLink };
};

export type BlogSection = { heading: string; paragraphs: string[] };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  location: string;
  state: string;
  readTime: string;
  date: string;
  imageGradient: string;
  content: string[];
  sections: BlogSection[];
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  serviceLink: ServiceLink;
  published: boolean;
  source?: string;
  gscOpportunity?: {
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    score: number;
  };
  updatedAt?: string;
};

type FsValue = {
  stringValue?: string;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  arrayValue?: { values?: FsValue[] };
  mapValue?: { fields?: Record<string, FsValue> };
  nullValue?: null;
};

const MAP_PATH = path.join(__dirname, "service-map.json");

export function loadServiceMap(): ServiceMap {
  return JSON.parse(fs.readFileSync(MAP_PATH, "utf8")) as ServiceMap;
}

export function loadFirebaseToken(): string {
  const configPath = path.join(
    process.env.HOME || "",
    ".config/configstore/firebase-tools.json"
  );
  const tools = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const token = tools?.tokens?.access_token;
  if (!token) throw new Error("No Firebase CLI access token — run: firebase login");
  return token;
}

export function toFirestoreValue(v: unknown): Record<string, unknown> {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") {
    return Number.isInteger(v)
      ? { integerValue: String(v) }
      : { doubleValue: v };
  }
  if (Array.isArray(v)) {
    return { arrayValue: { values: v.map(toFirestoreValue) } };
  }
  if (typeof v === "object") {
    const fields: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (val === undefined) continue;
      fields[k] = toFirestoreValue(val);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

function httpsJson(
  method: string,
  url: string,
  token: string,
  body?: string
): Promise<{ status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body) headers["Content-Length"] = String(Buffer.byteLength(body));
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method,
        headers,
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          let data: unknown = raw;
          try {
            data = raw ? JSON.parse(raw) : null;
          } catch {
            /* keep raw */
          }
          resolve({ status: res.statusCode || 0, data });
        });
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

export async function patchBlogDoc(
  token: string,
  slug: string,
  data: Record<string, unknown>,
  updateMask?: string[]
): Promise<void> {
  const body = JSON.stringify({
    fields: (toFirestoreValue(data) as { mapValue: { fields: unknown } }).mapValue
      .fields,
  });
  const mask =
    updateMask && updateMask.length
      ? "?" + updateMask.map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join("&")
      : "";
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/blogs/${encodeURIComponent(slug)}${mask}`;
  const { status, data: resData } = await httpsJson("PATCH", url, token, body);
  if (status < 200 || status >= 300) {
    throw new Error(`${slug}: ${status} ${JSON.stringify(resData).slice(0, 400)}`);
  }
}

function fsString(v: FsValue | undefined, fallback = ""): string {
  return v?.stringValue ?? fallback;
}

function fsStrings(v: FsValue | undefined): string[] {
  return (v?.arrayValue?.values || [])
    .map((x) => x.stringValue)
    .filter((x): x is string => Boolean(x));
}

function parseBlogList(data: unknown): {
  docs: { slug: string; title: string; keywords: string[]; published: boolean }[];
  nextPageToken: string;
} {
  const payload = data as {
    documents?: { name: string; fields?: Record<string, FsValue> }[];
    nextPageToken?: string;
  };
  const docs = (payload.documents || [])
    .map((doc) => {
      const fields = doc.fields || {};
      const id = doc.name.split("/").pop() || "";
      const slug = fsString(fields.slug, id) || id;
      if (!slug || slug.length < 3) return null;
      return {
        slug,
        title: fsString(fields.title),
        keywords: fsStrings(fields.keywords),
        published: fields.published?.booleanValue !== false,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  return { docs, nextPageToken: payload.nextPageToken || "" };
}

/** List all blog docs (including drafts) for dedup. */
export async function listExistingBlogs(): Promise<
  { slug: string; title: string; keywords: string[]; published: boolean }[]
> {
  const out: {
    slug: string;
    title: string;
    keywords: string[];
    published: boolean;
  }[] = [];
  let pageToken = "";
  let token = "";
  do {
    const url =
      `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/blogs?pageSize=100` +
      (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "");
    let { status, data } = await httpsJson("GET", url, token);
    if (status < 200 || status >= 300) {
      token = loadFirebaseToken();
      ({ status, data } = await httpsJson("GET", url, token));
      if (status < 200 || status >= 300) {
        throw new Error(`list blogs failed: ${status} ${JSON.stringify(data).slice(0, 200)}`);
      }
    }
    const parsed = parseBlogList(data);
    out.push(...parsed.docs);
    pageToken = parsed.nextPageToken;
  } while (pageToken);
  return out;
}

export async function fetchGscQueries(opts?: {
  days?: number;
  rowLimit?: number;
}): Promise<GscRow[]> {
  const days = opts?.days ?? 28;
  const rowLimit = opts?.rowLimit ?? 500;
  const end = new Date();
  end.setDate(end.getDate() - 3);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  const startDate = start.toISOString().slice(0, 10);
  const endDate = end.toISOString().slice(0, 10);

  const auth = new GoogleAuth({
    keyFile: DEFAULT_CREDS,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  const client = await auth.getClient();
  const tokenRes = await client.getAccessToken();
  const accessToken = tokenRes.token;
  if (!accessToken) throw new Error("Failed to get Google access token");

  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/searchAnalytics/query`;
  const body = JSON.stringify({
    startDate,
    endDate,
    dimensions: ["query"],
    rowLimit,
    startRow: 0,
    type: "web",
  });
  const { status, data } = await httpsJson("POST", url, accessToken, body);
  if (status < 200 || status >= 300) {
    throw new Error(`GSC query failed: ${status} ${JSON.stringify(data).slice(0, 400)}`);
  }
  const rows = ((data as { rows?: unknown[] })?.rows || []) as {
    keys?: string[];
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
  }[];
  return rows.map((r) => ({
    query: (r.keys?.[0] || "").trim(),
    clicks: Number(r.clicks || 0),
    impressions: Number(r.impressions || 0),
    ctr: Number(r.ctr || 0),
    position: Number(r.position || 0),
  }));
}

function includesAny(haystack: string, patterns: string[]): boolean {
  return patterns.some((p) => haystack.includes(p.toLowerCase()));
}

export function scoreOpportunities(
  rows: GscRow[],
  map: ServiceMap,
  existing: { slug: string; title: string; keywords: string[] }[]
): Opportunity[] {
  const existingText = existing
    .map(
      (b) =>
        `${b.slug} ${b.title} ${b.keywords.join(" ")}`.toLowerCase()
    )
    .join(" || ");

  const out: Opportunity[] = [];

  for (const row of rows) {
    const q = row.query.toLowerCase().trim();
    if (!q) continue;

    const isBrand = map.brandSkip.some(
      (b) => q === b || q.startsWith(b + " ") || q.endsWith(" " + b)
    );
    const loc = map.locations.find((l) => includesAny(q, l.patterns));
    const svc = map.services.find((s) => includesAny(q, s.patterns));

    // Brand-only without a service term → skip
    if (isBrand && !svc) continue;
    // Need a service match
    if (!svc) continue;
    // Prefer explicit geo; if none, only keep strong US clinic signals (default Houston)
    if (!loc) {
      const hasClinicSignal = /\b(clinic|dental|medical|doctor|med spa|medspa|healthcare)\b/.test(
        q
      );
      if (!hasClinicSignal) continue;
    }

    const location = loc || {
      id: "houston",
      city: "Houston",
      state: "Texas",
      patterns: [] as string[],
    };

    // Dedup against existing blogs
    const tokens = q.split(/\s+/).filter((t) => t.length > 3);
    const overlap =
      tokens.filter((t) => existingText.includes(t)).length /
      Math.max(tokens.length, 1);
    if (overlap >= 0.7 && existingText.includes(svc.id.replace(/-/g, " "))) {
      // soft skip if very similar content already exists for this service
    }
    const slugGuess = slugify(`${svc.id}-${location.city}`);
    if (
      existing.some(
        (b) =>
          b.slug === slugGuess ||
          b.keywords.some((k) => k.toLowerCase() === q) ||
          b.title.toLowerCase().includes(q)
      )
    ) {
      continue;
    }

    let score = 0;
    let reason = "";
    // Opportunity: impressions with mid position or weak CTR
    if (row.impressions >= 5 && row.position >= 5 && row.position <= 20) {
      score += row.impressions * 2 + (20 - row.position) * 3;
      reason = "mid-position with impressions — content can lift rank/CTR";
    } else if (row.impressions >= 10 && row.ctr < 0.05) {
      score += row.impressions * 1.5;
      reason = "impressions with weak CTR — supporting blog can convert";
    } else if (row.clicks >= 2) {
      score += row.clicks * 10 + row.impressions;
      reason = "already converting — double down with supporting post";
    } else if (row.impressions >= 3 && loc) {
      score += row.impressions + (loc.id === "houston" ? 5 : 2);
      reason = "geo + service signal — early opportunity";
    } else {
      continue;
    }

    if (loc) score += 8;
    if (location.city === "Houston") score += 3;

    out.push({
      query: row.query,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
      score: Math.round(score * 10) / 10,
      reason,
      location: {
        id: location.id,
        city: location.city,
        state: location.state,
      },
      service: { id: svc.id, serviceLink: svc.serviceLink },
    });
  }

  out.sort((a, b) => b.score - a.score);
  // Dedupe by service+city keeping highest score
  const seen = new Set<string>();
  const unique: Opportunity[] = [];
  for (const o of out) {
    const key = `${o.service.id}::${o.location.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(o);
  }
  return unique;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function argFlag(name: string): boolean {
  return process.argv.includes(name);
}

export function argValue(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}
