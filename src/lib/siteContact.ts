/** Public sales contact — set NEXT_PUBLIC_SALES_PHONE for live tel: CTAs (US E.164 digits, e.g. 17135550100). */
const raw = (process.env.NEXT_PUBLIC_SALES_PHONE || "").replace(/\D/g, "");

export const SALES_EMAIL = "Sales@alliancetechltd.com";

/** Digits only, or empty if not configured. */
export const SALES_PHONE_DIGITS = raw.length >= 10 ? raw : "";

export const SALES_TEL_HREF = SALES_PHONE_DIGITS ? `tel:+${SALES_PHONE_DIGITS}` : "";

export function formatUsPhoneDisplay(digits = SALES_PHONE_DIGITS): string {
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return digits;
}
