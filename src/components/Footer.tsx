import Image from "next/image";
import ConsentSettingsButton from "@/components/ConsentSettingsButton";
import {
  BUSINESS_ADDRESS_LINE,
  BUSINESS_ADDRESS_MAPS_HREF,
  SALES_EMAIL,
} from "@/lib/siteContact";
import { productNavLinks } from "@/lib/productsData";

const services = [
  { label: "Maya AI Receptionist", href: "/ai-receptionist" },
  { label: "WhatsApp AI Automation", href: "/whatsapp-ai-automation" },
  { label: "SEO for Clinics", href: "/seo-for-clinics" },
  { label: "Local SEO for Clinics", href: "/local-seo-for-clinics" },
  { label: "Digital Marketing", href: "/digital-marketing-for-clinics" },
  { label: "Clinic Websites", href: "/clinic-website-design" },
  { label: "Patient Mobile App", href: "/clinic-mobile-app" },
  { label: "EHR Platform", href: "/ehr-platform" },
];

export default function Footer() {
  return (
    <footer className="bg-[#040C14] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-10 border-b border-white/[0.07]">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="/" className="inline-block mb-5">
              <Image
                src="/logo.png"
                alt="Alliance Tech"
                width={280}
                height={120}
                className="h-16 sm:h-20 lg:h-24 w-auto max-w-full object-contain brightness-0 invert"
              />
            </a>
            <p className="text-white/60 text-sm leading-relaxed">
              America&apos;s specialist digital marketing agency for dental and aesthetic clinics.
            </p>
            <p className="text-white/60 text-xs mt-3 font-semibold italic">Digitally Yours</p>

            <div className="flex items-center gap-3 mt-5">
              <a href="https://www.linkedin.com/company/alliancetechltd/" target="_blank" rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 11.001-4.124 2.062 2.062 0 010 4.124zM7.114 20.452H3.558V9h3.556v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">Our Products</p>
            <ul className="space-y-2.5">
              {productNavLinks.map((p) => (
                <li key={p.label}>
                  <a
                    href={p.href}
                    {...(p.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {p.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">Services</p>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="text-sm text-white/60 hover:text-white transition-colors">{s.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">Company</p>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", href: "/about" },
                { label: "Our Mission", href: "/about#mission" },
                { label: "Contact", href: "/about#contact" },
                { label: "FAQ", href: "/about#faq" },
                { label: "Case Studies", href: "/portfolio" },
                { label: "Blog", href: "/blog" },
                { label: "Pricing", href: "/pricing" },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">Contact</p>
            <div className="space-y-3">
              <a href={`mailto:${SALES_EMAIL}`} className="block text-sm text-white/60 hover:text-white transition-colors">
                {SALES_EMAIL}
              </a>
              <a href="/about#contact" className="block text-sm text-white/60 hover:text-white transition-colors">
                Contact us
              </a>
              <a
                href={BUSINESS_ADDRESS_MAPS_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-white/60 hover:text-white transition-colors leading-relaxed break-words"
              >
                {BUSINESS_ADDRESS_LINE}
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60 text-center sm:text-left">
          <p className="max-w-full">© {new Date().getFullYear()} Alliance Tech (PVT) LTD. All rights reserved.</p>
          <p className="max-w-full px-2">Specialist digital marketing for dental & aesthetic clinics across the United States.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <a href="/privacy-policy" className="hover:text-white/60 transition-colors">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:text-white/60 transition-colors">Terms of Service</a>
            <ConsentSettingsButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
