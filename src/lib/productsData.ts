import type { ComponentType, SVGProps } from "react";
import { Bot, SearchCheck, LineChart, HeartPulse } from "lucide-react";

export type Product = {
  id: string;
  name: string;
  blurb: string;
  href: string;
  badge: string;
  cta: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Opens in a new tab (external product site). */
  external?: boolean;
};

/** Alliance Tech product catalog — append here to add products sitewide. */
export const products: Product[] = [
  {
    id: "maya-ai-receptionist",
    name: "Maya AI Receptionist",
    blurb:
      "24/7 AI front desk that answers calls, qualifies patients, and books appointments automatically.",
    href: "/ai-receptionist",
    badge: "Product",
    cta: "Try live demo",
    Icon: Bot,
  },
  {
    id: "heloo-health",
    name: "Heloo Health",
    blurb:
      "Your personal AI health companion — understand lab reports, track meds, and get calm self-care guidance in plain language.",
    href: "https://heloohealth.web.app/",
    badge: "Product",
    cta: "Visit Heloo Health",
    Icon: HeartPulse,
    external: true,
  },
  {
    id: "free-website-audit",
    name: "Free Website Audit",
    blurb:
      "Instant AI checkup of speed, SEO, and patient booking experience — see what’s costing you appointments.",
    href: "/free-website-audit",
    badge: "Product",
    cta: "Run free audit",
    Icon: SearchCheck,
  },
  {
    id: "business-growth-audit",
    name: "AI Business Growth Audit",
    blurb:
      "A focused clinic growth review — missed calls, search visibility, and booking friction with a clear plan to start.",
    href: "/business-growth-audit",
    badge: "Product",
    cta: "Start growth audit",
    Icon: LineChart,
  },
];

export const productNavLinks = [
  { label: "All Products", href: "/products", external: false },
  ...products.map((p) => ({
    label: p.name,
    href: p.href,
    external: Boolean(p.external),
  })),
];
