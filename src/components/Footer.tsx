import Image from "next/image";
import ConsentSettingsButton from "@/components/ConsentSettingsButton";
import {
  BUSINESS_ADDRESS_LINE,
  BUSINESS_ADDRESS_MAPS_HREF,
  SALES_EMAIL,
} from "@/lib/siteContact";

const services = [
  { label: "AI Receptionist", href: "/ai-receptionist" },
  { label: "Free Website Audit", href: "/free-website-audit" },
  { label: "Digital Marketing", href: "/digital-marketing-for-clinics" },
  { label: "SEO for Clinics", href: "/seo-for-clinics" },
  { label: "Local SEO for Clinics", href: "/local-seo-for-clinics" },
  { label: "Clinic Websites", href: "/clinic-website-design" },
  { label: "Patient Mobile App", href: "/clinic-mobile-app" },
  { label: "EHR Platform", href: "/ehr-platform" },
];

export default function Footer() {
  return (
    <footer className="site-footer relative overflow-hidden text-white">
      <div aria-hidden className="site-footer-grid absolute inset-0" />
      <div aria-hidden className="site-footer-glow" />
      <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
        <div className="grid gap-10 border-b border-white/[0.09] pb-10 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-1">
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

            <div className="mt-5 flex items-center gap-3">
              <a href="https://www.instagram.com/alliancetechofficial" target="_blank" rel="noopener noreferrer"
                aria-label="Instagram"
                className="site-footer-social">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="https://www.facebook.com/alliancetech11" target="_blank" rel="noopener noreferrer"
                aria-label="Facebook"
                className="site-footer-social">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.022 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.877h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.918 8.437-9.94z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/alliancetechltd/" target="_blank" rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="site-footer-social">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 11.001-4.124 2.062 2.062 0 010 4.124zM7.114 20.452H3.558V9h3.556v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <p className="site-footer-heading">Services</p>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="site-footer-link">{s.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="site-footer-heading">Company</p>
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
                  <a href={l.href} className="site-footer-link">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="site-footer-heading">Contact</p>
            <div className="space-y-3">
              <a href={`mailto:${SALES_EMAIL}`} className="site-footer-link block">
                {SALES_EMAIL}
              </a>
              <a href="/about#contact" className="site-footer-link block">
                Contact us
              </a>
              <a
                href={BUSINESS_ADDRESS_MAPS_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer-link block break-words leading-relaxed"
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
