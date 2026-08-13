/**
 * Search Console + Analytics helpers for admin insights.
 * Uses Application Default Credentials (Cloud Functions SA) or optional JSON credentials.
 */
const { GoogleAuth } = require("google-auth-library");

const GSC_SITE = process.env.GSC_SITE_URL || "sc-domain:alliancetechltd.com";
const GA_PROPERTY = process.env.GA_PROPERTY_ID || "401584861";

let cachedAuth = null;

function getAuth(credentialsJson) {
  if (cachedAuth) return cachedAuth;
  const scopes = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
  ];
  if (credentialsJson) {
    const creds =
      typeof credentialsJson === "string" ? JSON.parse(credentialsJson) : credentialsJson;
    cachedAuth = new GoogleAuth({ credentials: creds, scopes });
  } else {
    cachedAuth = new GoogleAuth({ scopes });
  }
  return cachedAuth;
}

async function getAccessToken(credentialsJson) {
  const auth = getAuth(credentialsJson);
  const client = await auth.getClient();
  const tokenRes = await client.getAccessToken();
  if (!tokenRes?.token) throw new Error("Failed to get Google access token");
  return tokenRes.token;
}

function dateRange(days = 28) {
  const end = new Date();
  end.setDate(end.getDate() - 3);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

async function fetchGscQueries(credentialsJson, opts = {}) {
  const days = opts.days || 28;
  const rowLimit = Math.min(Number(opts.rowLimit) || 50, 200);
  const country = opts.country || null; // e.g. "usa"
  const { startDate, endDate } = dateRange(days);
  const token = await getAccessToken(credentialsJson);

  const body = {
    startDate,
    endDate,
    dimensions: country ? ["query"] : ["query"],
    rowLimit,
    startRow: 0,
    type: "web",
  };
  if (country) {
    body.dimensionFilterGroups = [
      {
        filters: [
          {
            dimension: "country",
            operator: "equals",
            expression: country,
          },
        ],
      },
    ];
  }

  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    GSC_SITE
  )}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`GSC query failed: ${res.status} ${JSON.stringify(data).slice(0, 300)}`);
  }

  const rows = (data.rows || []).map((r) => ({
    query: String(r.keys?.[0] || "").trim(),
    clicks: Number(r.clicks || 0),
    impressions: Number(r.impressions || 0),
    ctr: Number(r.ctr || 0),
    position: Number(r.position || 0),
  }));

  return { startDate, endDate, siteUrl: GSC_SITE, rows };
}

async function fetchGscPages(credentialsJson, opts = {}) {
  const days = opts.days || 28;
  const rowLimit = Math.min(Number(opts.rowLimit) || 15, 50);
  const { startDate, endDate } = dateRange(days);
  const token = await getAccessToken(credentialsJson);
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    GSC_SITE
  )}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ["page"],
      rowLimit,
      startRow: 0,
      type: "web",
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`GSC pages failed: ${res.status} ${JSON.stringify(data).slice(0, 300)}`);
  }
  return (data.rows || []).map((r) => ({
    page: String(r.keys?.[0] || "").trim(),
    clicks: Number(r.clicks || 0),
    impressions: Number(r.impressions || 0),
    ctr: Number(r.ctr || 0),
    position: Number(r.position || 0),
  }));
}

async function fetchGaOverview(credentialsJson, opts = {}) {
  const days = opts.days || 28;
  const { startDate, endDate } = dateRange(days);
  const token = await getAccessToken(credentialsJson);
  const property = String(GA_PROPERTY).replace(/^properties\//, "");
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
      ],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      limit: 20,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`GA report failed: ${res.status} ${JSON.stringify(data).slice(0, 300)}`);
  }

  const channels = (data.rows || []).map((row) => ({
    channel: row.dimensionValues?.[0]?.value || "Unknown",
    sessions: Number(row.metricValues?.[0]?.value || 0),
    users: Number(row.metricValues?.[1]?.value || 0),
    pageViews: Number(row.metricValues?.[2]?.value || 0),
    bounceRate: Number(row.metricValues?.[3]?.value || 0),
  }));

  const totals = channels.reduce(
    (acc, c) => {
      acc.sessions += c.sessions;
      acc.users += c.users;
      acc.pageViews += c.pageViews;
      return acc;
    },
    { sessions: 0, users: 0, pageViews: 0 }
  );

  return {
    startDate,
    endDate,
    propertyId: property,
    totals,
    channels,
  };
}

module.exports = {
  fetchGscQueries,
  fetchGscPages,
  fetchGaOverview,
  GSC_SITE,
  GA_PROPERTY,
};
