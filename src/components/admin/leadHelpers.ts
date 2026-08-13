import type { Timestamp } from "firebase/firestore";
import { isMayaLeadSource } from "@/components/MayaDashboard";

export type LeadRow = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  clinicName?: string;
  clinicType?: string;
  message?: string;
  source?: string;
  website?: string;
  auditScore?: number;
  step?: number;
  completionStatus?: string;
  urgent?: boolean;
  priority?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

export type LeadFilter = "all" | "website" | "audits" | "packages" | "incomplete";

const AUDIT_SOURCES = new Set(["audit_bot", "business_growth_audit", "website_audit_gate"]);
const PACKAGE_SOURCES = new Set(["package_order", "pricing_package"]);

export function isAuditLead(source?: string) {
  return Boolean(source && AUDIT_SOURCES.has(source));
}

export function isPackageLead(source?: string) {
  return Boolean(source && PACKAGE_SOURCES.has(source));
}

export function isWebsiteLead(source?: string) {
  if (!source || isMayaLeadSource(source) || isAuditLead(source) || isPackageLead(source)) {
    return false;
  }
  return true;
}

export function formatLeadDate(ts?: Timestamp | null) {
  if (!ts?.toDate) return "—";
  return ts.toDate().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const SOURCE_LABELS: Record<string, string> = {
  audit_bot: "Website audit",
  business_growth_audit: "Growth audit",
  website_audit_gate: "Audit gate",
  package_order: "Package order",
  pricing_package: "Pricing package",
  contact: "Contact form",
  consultation: "Consultation",
  contact_form: "Contact form",
  free_website_audit: "Free website audit",
};

export function friendlySourceLabel(source?: string): string {
  if (!source) return "Unknown";
  if (SOURCE_LABELS[source]) return SOURCE_LABELS[source];
  if (isMayaLeadSource(source)) return "Maya AI";
  return source
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function matchesLeadSearch(lead: LeadRow, q: string) {
  if (!q) return true;
  const hay = [lead.name, lead.phone, lead.email, lead.clinicName, lead.website, lead.source]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}
