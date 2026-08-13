"use client";
import { useState, useEffect, useCallback } from "react";
import { Menu, X, ChevronDown, MapPin, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "@/context/FormContext";

interface DropdownLink { label: string; href: string; }
interface DropdownGroup { title: string; links: DropdownLink[]; }
interface Dropdown {
  heading: string;
  links?: DropdownLink[];
  top?: DropdownLink[];
  groups?: DropdownGroup[];
}
interface NavLink { label: string; href: string; dropdown: Dropdown | null; }

const navLinks: NavLink[] = [
  {
    label: "Services",
    href: "/#services",
    dropdown: {
      heading: "Services",
      top: [{ label: "All Services", href: "/services" }],
      groups: [
        {
          title: "AI Automation",
          links: [
            { label: "AI Receptionist", href: "/ai-receptionist" },
            { label: "WhatsApp channel", href: "/whatsapp-ai-automation" },
            { label: "Free Website Audit", href: "/free-website-audit" },
          ],
        },
        {
          title: "Growth & Marketing",
          links: [
            { label: "Digital Marketing", href: "/digital-marketing-for-clinics" },
            { label: "SEO for Clinics", href: "/seo-for-clinics" },
            { label: "Local SEO for Clinics", href: "/local-seo-for-clinics" },
            { label: "Clinic Websites", href: "/clinic-website-design" },
          ],
        },
        {
          title: "Platform",
          links: [
            { label: "Patient Mobile App", href: "/clinic-mobile-app" },
            { label: "EHR Platform", href: "/ehr-platform" },
          ],
        },
      ],
    },
  },
  {
    label: "About Us",
    href: "/about",
    dropdown: null,
  },
  {
    label: "Case Studies",
    href: "/portfolio",
    dropdown: null,
  },
  {
    label: "Try It",
    href: "#",
    dropdown: {
      heading: "Try It Live",
      links: [
        { label: "Free Website Audit", href: "/free-website-audit" },
        { label: "AI Business Growth Audit", href: "/business-growth-audit" },
        { label: "AI Receptionist", href: "/ai-receptionist" },
      ],
    },
  },
  {
    label: "Blog",
    href: "/blog",
    dropdown: null,
  },
  {
    label: "Pricing",
    href: "/pricing",
    dropdown: null,
  },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

function DropdownPanel({ dropdown }: { dropdown: Dropdown }) {
  return (
    <div className="nav-dropdown-panel">
      {dropdown.groups ? (
        <>
          {dropdown.top?.map((d) => (
            <a key={d.label} href={d.href} className="nav-dropdown-link nav-dropdown-link--strong">
              {d.label}
            </a>
          ))}
          {dropdown.groups.map((g, gi) => (
            <div key={g.title} className={gi > 0 ? "mt-1 border-t border-[#E8F4F8] pt-2" : "mt-1"}>
              <p className="px-3.5 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#0077A8]/55">
                {g.title}
              </p>
              {g.links.map((d) => (
                <a key={d.label} href={d.href} className="nav-dropdown-link">
                  {d.label}
                </a>
              ))}
            </div>
          ))}
        </>
      ) : (
        <>
          <p className="px-3.5 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#0077A8]/55">
            {dropdown.heading}
          </p>
          {dropdown.links!.map((d) => (
            <a key={d.label} href={d.href} className="nav-dropdown-link">
              {d.label}
            </a>
          ))}
        </>
      )}
    </div>
  );
}

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const { openForm } = useForm();

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setMobileExpanded(null);
  }, []);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="pointer-events-none fixed inset-x-0 top-0 z-50"
      >
        <div
          className={`pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            scrolled
              ? "mx-3 mt-3 sm:mx-5 lg:mx-8"
              : "mx-0 mt-0"
          }`}
        >
          <nav
            className={`nav-shell transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              scrolled ? "nav-shell--floating" : "nav-shell--top"
            }`}
            aria-label="Primary"
          >
            <div
              className={`mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-500 ${
                scrolled ? "max-w-6xl h-[3.75rem]" : "max-w-7xl h-20"
              }`}
            >
              {/* Logo + location */}
              <div className="flex min-w-0 items-center gap-3">
                <a
                  href="/"
                  className="nav-logo group flex items-center bg-transparent"
                  onClick={closeMobile}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-horizontal.png"
                    alt="Alliance Tech"
                    width={1043}
                    height={200}
                    className={`w-auto object-contain bg-transparent transition-all duration-500 group-hover:scale-[1.02] group-hover:brightness-110 ${
                      scrolled ? "h-8 lg:h-9" : "h-9 lg:h-11"
                    }`}
                    decoding="async"
                    fetchPriority="high"
                  />
                </a>
                <a
                  href="/dental-clinic-houston"
                  className="nav-location hidden xl:inline-flex"
                >
                  <MapPin className="h-3.5 w-3.5 text-[#00B4D8]" strokeWidth={2.2} />
                  <span>Houston, TX</span>
                </a>
              </div>

              {/* Desktop links */}
              <div className="hidden items-center gap-0.5 lg:flex">
                {navLinks.map((link) =>
                  link.dropdown ? (
                    <div key={link.label} className="group relative">
                      <button
                        type="button"
                        aria-label={`${link.label} menu`}
                        aria-haspopup="true"
                        className="nav-link"
                      >
                        {link.label}
                        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
                        <span className="nav-link-underline" aria-hidden />
                      </button>

                      <div
                        className={`absolute left-0 top-full z-50 pt-3 opacity-0 pointer-events-none translate-y-[-6px] transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 ${
                          link.dropdown.groups ? "w-64" : "w-56"
                        }`}
                      >
                        <DropdownPanel dropdown={link.dropdown} />
                      </div>
                    </div>
                  ) : (
                    <a key={link.label} href={link.href} className="nav-link">
                      {link.label}
                      <span className="nav-link-underline" aria-hidden />
                    </a>
                  )
                )}
              </div>

              {/* Desktop CTA */}
              <div className="hidden lg:flex">
                <button
                  type="button"
                  onClick={openForm}
                  data-analytics-label="book_consultation"
                  data-analytics-location="desktop_navigation"
                  className="nav-cta group"
                >
                  Book a Free Audit
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </div>

              {/* Mobile toggle */}
              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                className="nav-mobile-toggle lg:hidden"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-[#020810]/45 backdrop-blur-[2px] lg:hidden"
              onClick={closeMobile}
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: easeOut }}
              className={`fixed left-3 right-3 z-40 max-h-[min(78vh,640px)] overflow-y-auto rounded-2xl border border-[#00B4D8]/15 bg-white/95 shadow-2xl backdrop-blur-xl lg:hidden ${
                scrolled ? "top-[4.5rem]" : "top-[5.25rem]"
              }`}
            >
              <div className="flex flex-col gap-0.5 p-3 sm:p-4">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + i * 0.045, duration: 0.3, ease: easeOut }}
                  >
                    {link.dropdown ? (
                      <>
                        <button
                          type="button"
                          aria-expanded={mobileExpanded === link.label}
                          onClick={() =>
                            setMobileExpanded(mobileExpanded === link.label ? null : link.label)
                          }
                          className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-[#00283C] transition-colors hover:bg-[#F0F7FA]"
                        >
                          {link.label}
                          <ChevronDown
                            className={`h-4 w-4 text-[#0077A8] transition-transform duration-300 ${
                              mobileExpanded === link.label ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {mobileExpanded === link.label && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: easeOut }}
                              className="overflow-hidden pl-2"
                            >
                              {link.dropdown.groups ? (
                                <>
                                  {link.dropdown.top?.map((d) => (
                                    <a
                                      key={d.label}
                                      href={d.href}
                                      onClick={closeMobile}
                                      className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#00283C] hover:bg-[#F0F7FA]"
                                    >
                                      {d.label}
                                    </a>
                                  ))}
                                  {link.dropdown.groups.map((g) => (
                                    <div key={g.title} className="mt-1">
                                      <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#0077A8]/55">
                                        {g.title}
                                      </p>
                                      {g.links.map((d) => (
                                        <a
                                          key={d.label}
                                          href={d.href}
                                          onClick={closeMobile}
                                          className="block rounded-lg px-3 py-2 text-sm text-[#00283C]/70 hover:bg-[#F0F7FA] hover:text-[#00283C]"
                                        >
                                          {d.label}
                                        </a>
                                      ))}
                                    </div>
                                  ))}
                                </>
                              ) : (
                                link.dropdown.links!.map((d) => (
                                  <a
                                    key={d.label}
                                    href={d.href}
                                    onClick={closeMobile}
                                    className="block rounded-lg px-3 py-2 text-sm text-[#00283C]/70 hover:bg-[#F0F7FA] hover:text-[#00283C]"
                                  >
                                    {d.label}
                                  </a>
                                ))
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <a
                        href={link.href}
                        onClick={closeMobile}
                        className="block rounded-xl px-3 py-3 text-sm font-semibold text-[#00283C] transition-colors hover:bg-[#F0F7FA]"
                      >
                        {link.label}
                      </a>
                    )}
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                  className="mt-2 border-t border-[#E8F4F8] pt-3"
                >
                  <button
                    type="button"
                    onClick={() => {
                      closeMobile();
                      openForm();
                    }}
                    data-analytics-label="book_consultation"
                    data-analytics-location="mobile_navigation"
                    className="nav-cta w-full justify-center py-3 text-sm"
                  >
                    Book a Free Audit
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
