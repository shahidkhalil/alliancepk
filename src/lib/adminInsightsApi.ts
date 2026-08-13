import { getFirebaseAuth } from "@/lib/firebase";

const INSIGHTS_URL =
  process.env.NEXT_PUBLIC_ADMIN_INSIGHTS_URL ||
  "https://asia-south1-alliancepak.cloudfunctions.net/adminInsights";

export type InsightsQueryRow = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  opportunityScore?: number;
};

export type InsightsPayload = {
  ok: boolean;
  fetchedAt: string;
  country: string;
  gsc: {
    startDate: string;
    endDate: string;
    siteUrl: string;
    queries: InsightsQueryRow[];
    allQueryCount: number;
  };
  pages: {
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }[];
  analytics: {
    startDate?: string;
    endDate?: string;
    propertyId?: string;
    totals?: { sessions: number; users: number; pageViews: number } | null;
    channels?: {
      channel: string;
      sessions: number;
      users: number;
      pageViews: number;
      bounceRate: number;
    }[];
    error?: string;
  };
};

async function authHeaders(): Promise<HeadersInit> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Not signed in");
  const token = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function postInsights<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(INSIGHTS_URL, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}

export function fetchInsights(opts?: {
  country?: string;
  days?: number;
}): Promise<InsightsPayload> {
  return postInsights<InsightsPayload>({
    action: "fetch",
    country: opts?.country ?? "usa",
    days: opts?.days ?? 28,
  });
}

export function chatInsights(opts: {
  question: string;
  context: unknown;
  history?: { role: "user" | "assistant"; content: string }[];
}): Promise<{ ok: boolean; answer: string }> {
  return postInsights({
    action: "chat",
    question: opts.question,
    context: opts.context,
    history: opts.history || [],
  });
}

export function generateBlogFromKeyword(opts: {
  query: string;
  gscMeta?: Partial<InsightsQueryRow>;
}): Promise<{ ok: boolean; slug: string; title: string; message: string }> {
  return postInsights({
    action: "generateBlog",
    query: opts.query,
    gscMeta: opts.gscMeta
      ? {
          query: opts.query,
          clicks: opts.gscMeta.clicks || 0,
          impressions: opts.gscMeta.impressions || 0,
          ctr: opts.gscMeta.ctr || 0,
          position: opts.gscMeta.position || 0,
          score: opts.gscMeta.opportunityScore || 0,
        }
      : undefined,
  });
}
