/**
 * Maya API endpoints.
 * Prefer same-origin /api/* (Firebase Hosting rewrites) — avoids CORS & DNS issues
 * for US visitors on alliancetechltd.com.
 * Fallback: cloudfunctions.net on localhost only (Next export rewrites are unreliable).
 */
const CF = "https://asia-south1-alliancepak.cloudfunctions.net";

export const RECEPTIONIST_ENDPOINT =
  process.env.NEXT_PUBLIC_RECEPTIONIST_ENDPOINT || "/api/receptionist";

export const REALTIME_TOKEN_ENDPOINT =
  process.env.NEXT_PUBLIC_REALTIME_TOKEN_ENDPOINT || "/api/realtime-token";

export const BOOK_ENDPOINT =
  process.env.NEXT_PUBLIC_BOOK_ENDPOINT || "/api/book";

/** Absolute URL for localhost / environments without hosting rewrites. */
export const RECEPTIONIST_ENDPOINT_ABSOLUTE = `${CF}/clinicReceptionist`;
export const REALTIME_TOKEN_ENDPOINT_ABSOLUTE = `${CF}/realtimeToken`;
export const BOOK_ENDPOINT_ABSOLUTE = `${CF}/bookAppointmentHttp`;

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

/**
 * Same-origin /api on production Hosting (custom domain + *.web.app).
 * Absolute cloudfunctions.net only on localhost (Next static export proxy is flaky).
 */
export function resolveEndpoint(path: string, absolute: string): string {
  if (typeof window === "undefined") return path;
  const host = window.location.hostname;
  if (isLocalHost(host)) return absolute;
  return path;
}

export function receptionistUrl() {
  if (typeof window !== "undefined") {
    const override = process.env.NEXT_PUBLIC_RECEPTIONIST_ENDPOINT;
    // Absolute override only for receptionist — never hijack token/book.
    if (override?.startsWith("http")) return override;
  }
  return resolveEndpoint(RECEPTIONIST_ENDPOINT, RECEPTIONIST_ENDPOINT_ABSOLUTE);
}

export function realtimeTokenUrl() {
  const override = process.env.NEXT_PUBLIC_REALTIME_TOKEN_ENDPOINT;
  if (typeof window !== "undefined" && override?.startsWith("http")) return override;
  return resolveEndpoint(REALTIME_TOKEN_ENDPOINT, REALTIME_TOKEN_ENDPOINT_ABSOLUTE);
}

export function bookUrl() {
  const override = process.env.NEXT_PUBLIC_BOOK_ENDPOINT;
  if (typeof window !== "undefined" && override?.startsWith("http")) return override;
  return resolveEndpoint(BOOK_ENDPOINT, BOOK_ENDPOINT_ABSOLUTE);
}
