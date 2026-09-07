import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maya AI Receptionist for Houston & Texas Clinics — Never Miss a Patient Call | Alliance Tech",
  description:
    "Your front desk can't answer 100 calls a day — Maya AI Receptionist can. 24/7 call & chat answering in English, instant appointment booking, zero missed patients for Houston and Texas clinics. Try the live demo.",
  keywords: [
    "Maya AI Receptionist Houston",
    "AI receptionist Houston",
    "AI receptionist Texas",
    "AI answering service Houston TX",
    "virtual receptionist Houston dental office",
    "24/7 phone answering service Houston clinic",
    "medical answering service Texas",
    "AI phone agent for dentists Houston",
    "missed call solution Houston dental practice",
    "clinic appointment booking system Houston",
    "reduce no-shows dental clinic Houston",
    "front desk automation Texas clinic",
    "AI receptionist pricing Houston",
    "dental clinic receptionist software Texas",
  ],
  alternates: { canonical: "/ai-receptionist" },
  openGraph: {
    title: "Maya AI Receptionist for Houston & Texas Clinics — Never Miss a Patient Call",
    description:
      "24/7 Maya AI Receptionist that answers, qualifies, and books patients in English — built for Houston and Texas clinics. Try the live demo — talk to it right now.",
    url: "/ai-receptionist",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
