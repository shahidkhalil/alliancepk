"use client";
import {
  Phone,
  MessageCircle,
  Globe,
  MapPin,
  Megaphone,
  Smartphone,
  Stethoscope,
  Search,
  ClipboardCheck,
  Building2,
  Sparkles,
  HeartPulse,
} from "lucide-react";

type Tag = {
  label: string;
  href: string;
  Icon: typeof Phone;
};

const rowOne: Tag[] = [
  { label: "AI Receptionist", href: "/ai-receptionist", Icon: Phone },
  { label: "WhatsApp AI", href: "/whatsapp-ai-automation", Icon: MessageCircle },
  { label: "Clinic Websites", href: "/clinic-website-design", Icon: Globe },
  { label: "Local SEO", href: "/local-seo-for-clinics", Icon: MapPin },
  { label: "Google Ads", href: "/digital-marketing-for-clinics", Icon: Megaphone },
  { label: "Patient App", href: "/clinic-mobile-app", Icon: Smartphone },
];

const rowTwo: Tag[] = [
  { label: "EHR Platform", href: "/ehr-platform", Icon: Stethoscope },
  { label: "SEO for Clinics", href: "/seo-for-clinics", Icon: Search },
  { label: "Free Website Audit", href: "/free-website-audit", Icon: ClipboardCheck },
  { label: "Houston Clinics", href: "/dental-clinic-houston", Icon: Building2 },
  { label: "Dental Growth", href: "/dental-clinic-growth", Icon: Sparkles },
  { label: "Aesthetic Clinics", href: "/aesthetic-clinic-growth", Icon: HeartPulse },
];

function TagSet({ items, setKey, inert }: { items: Tag[]; setKey: string; inert?: boolean }) {
  return (
    <div className="capability-marquee-set" aria-hidden={inert || undefined}>
      {items.map((tag, i) => (
        <a
          key={`${setKey}-${tag.label}-${i}`}
          href={tag.href}
          className="capability-tag"
          tabIndex={inert ? -1 : undefined}
          data-analytics-label={`capability_${tag.label}`}
          data-analytics-location="capability_strip"
        >
          <tag.Icon className="h-4 w-4 shrink-0 text-[#00B4D8]" strokeWidth={2} />
          <span>{tag.label}</span>
        </a>
      ))}
    </div>
  );
}

function MarqueeRow({
  items,
  direction,
  duration,
}: {
  items: Tag[];
  direction: "ltr" | "rtl";
  duration: number;
}) {
  return (
    <div className="capability-marquee">
      <div
        className={`capability-marquee-track ${
          direction === "ltr" ? "capability-marquee-ltr" : "capability-marquee-rtl"
        }`}
        style={{ animationDuration: `${duration}s` }}
      >
        <TagSet items={items} setKey="a" />
        <TagSet items={items} setKey="b" inert />
      </div>
    </div>
  );
}

/** Dual marquees — larger tags, slower scroll, contained width */
export default function CapabilityStrip() {
  return (
    <section
      className="capability-strip relative overflow-hidden py-8 sm:py-10"
      aria-label="Capabilities"
    >
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col gap-3.5 sm:gap-4">
          <MarqueeRow items={rowOne} direction="rtl" duration={48} />
          <MarqueeRow items={rowTwo} direction="ltr" duration={52} />
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-[#021016]"
      />
    </section>
  );
}
