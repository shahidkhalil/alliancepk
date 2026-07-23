/** Client-only Maya lead score — never written back to Firestore. */

export type MayaScoreInput = {
  urgent?: boolean;
  priority?: string;
  phone?: string;
  email?: string;
  service?: string;
  preferredTime?: string;
  source?: string;
  notes?: string;
  triageReason?: string;
  visitCount?: number;
};

export type MayaScoreResult = {
  score: number;
  tier: "high" | "medium" | "low";
  label: string;
};

export function computeMayaLeadScore(input: MayaScoreInput): MayaScoreResult {
  let score = 20;

  if (input.urgent || input.priority === "urgent") score += 40;
  if (input.phone && String(input.phone).replace(/\D/g, "").length >= 7) score += 15;
  if (input.email && String(input.email).includes("@")) score += 10;
  if (input.service && String(input.service).trim()) score += 10;
  if (input.preferredTime && String(input.preferredTime).trim()) score += 10;
  if (input.source === "ai_receptionist_live") score += 10;
  if (
    (input.notes && String(input.notes).trim()) ||
    (input.triageReason && String(input.triageReason).trim())
  ) {
    score += 5;
  }
  if ((input.visitCount ?? 0) >= 2) score += 5;

  score = Math.max(0, Math.min(100, score));

  if (score >= 70) return { score, tier: "high", label: "High" };
  if (score >= 45) return { score, tier: "medium", label: "Medium" };
  return { score, tier: "low", label: "Low" };
}

export function isMayaLeadSource(source?: string): boolean {
  return Boolean(source && source.startsWith("ai_receptionist"));
}

export function channelLabel(source?: string): string {
  if (source === "ai_receptionist_live") return "Live voice";
  if (source === "ai_receptionist_emergency") return "Emergency";
  if (source === "ai_receptionist") return "Chat";
  return source || "Maya";
}
