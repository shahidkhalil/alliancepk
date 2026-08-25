"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Menu,
  X,
  ChevronDown,
  MapPin,
  ArrowRight,
  PhoneCall,
  MessageCircle,
  SearchCheck,
  Megaphone,
  Search,
  MapPinned,
  Globe,
  Smartphone,
  ClipboardList,
  LayoutGrid,
  Sparkles,
  Bot,
  LineChart,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useForm } from "@/context/FormContext";

interface DropdownLink {
  label: string;
  href: string;
  icon?: typeof PhoneCall;
  hint?: string;
}
interface DropdownGroup {
  title: string;
  links: DropdownLink[];
}
interface Dropdown {
  heading: string;
  links?: DropdownLink[];
  top?: DropdownLink[];
  groups?: DropdownGroup[];
  mega?: boolean;
}
interface NavLink {
  label: string;
  href: string;
  dropdown: Dropdown | null;
}

const navLinks: NavLink[] = [
  {
    label: "Services",
    href: "/#services",
    dropdown: {
      heading: "Services",
      mega: true,
      top: [{ label: "All Services", href: "/services", icon: LayoutGrid, hint: "Browse the full menu" }],
      groups: [
        {
          title: "AI Automation",
          links: [
            { label: "AI Receptionist", href: "/ai-receptionist", icon: PhoneCall, hint: "24/7 call + chat booking" },
            { label: "WhatsApp channel", href: "/whatsapp-ai-automation", icon: MessageCircle, hint: "Chat-first appointments" },
            { label: "Free Website Audit", href: "/free-website-audit", icon: SearchCheck, hint: "Instant clinic checkup" },
          ],
        },
        {
          title: "Growth & Marketing",
          links: [
            { label: "Digital Marketing", href: "/digital-marketing-for-clinics", icon: Megaphone, hint: "Ads tied to bookings" },
            { label: "SEO for Clinics", href: "/seo-for-clinics", icon: Search, hint: "Rank for treatments" },
            { label: "Local SEO for Clinics", href: "/local-seo-for-clinics", icon: MapPinned, hint: "Maps + near-me" },
            { label: "Clinic Websites", href: "/clinic-website-design", icon: Globe, hint: "Sites that convert" },
          ],
        },
        {
          title: "Platform",
          links: [
            { label: "Patient Mobile App", href: "/clinic-mobile-app", icon: Smartphone, hint: "iOS + Android" },
            { label: "EHR Platform", href: "/ehr-platform", icon: ClipboardList, hint: "Records + billing" },
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
      mega: false,
      links: [
        { label: "Free Website Audit", href: "/free-website-audit", icon: SearchCheck, hint: "Score + fixes in minutes" },
        { label: "AI Business Growth Audit", href: "/business-growth-audit", icon: LineChart, hint: "Tailored growth plan" },
        { label: "AI Receptionist", href: "/ai-receptionist", icon: Bot, hint: "Talk to Maya live" },
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
  const reduceMotion = useReducedMotion();

  if (dropdown.groups && dropdown.mega) {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 6, scale: 0.99 }}
        transition={{ duration: 0.28, ease: easeOut }}
        className="nav-mega"
      >
        <div aria-hidden className="nav-mega-glow" />
        <div aria-hidden className="nav-mega-grid" />

        <div className="relative z-[1] flex items-center justify-between gap-4 border-b border-white/10 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="nav-mega-chip">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <div>
              <p className="text-xs font-bold text-white">Clinic growth systems</p>
              <p className="text-[10px] text-white/45">AI · Marketing · Platform</p>
            </div>
          </div>
          {dropdown.top?.map((d) => {
            const Icon = d.icon ?? LayoutGrid;
            return (
              <a key={d.label} href={d.href} className="nav-mega-all">
                <Icon className="h-3.5 w-3.5" />
                {d.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            );
          })}
        </div>

        <div className="relative z-[1] grid gap-1 p-3 sm:grid-cols-3">
          {dropdown.groups.map((g, gi) => (
            <div key={g.title} className="nav-mega-col">
              <p className="nav-mega-col-title">
                <span>{String(gi + 1).padStart(2, "0")}</span>
                {g.title}
              </p>
              <div className="space-y-1">
                {g.links.map((d) => {
                  const Icon = d.icon ?? ArrowRight;
                  return (
                    <a key={d.label} href={d.href} className="nav-mega-item group">
                      <span className="nav-mega-item-icon">
                        <Icon className="h-4 w-4" strokeWidth={1.9} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-white/90 group-hover:text-white">
                          {d.label}
                        </span>
                        {d.hint ? (
                          <span className="mt-0.5 block truncate text-[10px] text-white/40 group-hover:text-[#7DD3EA]/80">
                            {d.hint}
                          </span>
                        ) : null}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#5ce1ff]" />
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: 4 }}
      transition={{ duration: 0.24, ease: easeOut }}
      className="nav-try"
    >
      <div aria-hidden className="nav-try-glow" />
      <p className="relative z-[1] px-3.5 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7DD3EA]">
        {dropdown.heading}
      </p>
      <div className="relative z-[1] space-y-1 px-1.5 pb-1.5">
        {dropdown.links!.map((d) => {
          const Icon = d.icon ?? Sparkles;
          return (
            <a key={d.label} href={d.href} className="nav-try-item group">
              <span className="nav-try-item-icon">
                <Icon className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-white/90 group-hover:text-white">
                  {d.label}
                </span>
                {d.hint ? (
                  <span className="mt-0.5 block text-[10px] text-white/40 group-hover:text-[#7DD3EA]/85">
                    {d.hint}
                  </span>
                ) : null}
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/25 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-[#5ce1ff]" />
            </a>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { openForm } = useForm();
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();

  // Pages such as /ai-receptionist live under more than one menu, so score every
  // nav item by its best href match and highlight only the strongest one.
  const activeLabel = useMemo(() => {
    if (!pathname) return null;

    const score = (link: NavLink) => {
      const hrefs = link.dropdown
        ? [
            ...(link.dropdown.top ?? []),
            ...(link.dropdown.links ?? []),
            ...(link.dropdown.groups ?? []).flatMap((g) => g.links),
          ].map((d) => d.href)
        : [link.href];

      return hrefs.reduce((best, href) => {
        if (!href.startsWith("/")) return best;
        const matches = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return matches ? Math.max(best, href.length) : best;
      }, 0);
    };

    let winner: { label: string; score: number } | null = null;
    for (const link of navLinks) {
      const value = score(link);
      if (value > 0 && (!winner || value > winner.score)) {
        winner = { label: link.label, score: value };
      }
    }
    return winner?.label ?? null;
  }, [pathname]);

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

  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openMenu]);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setMobileExpanded(null);
  }, []);

  return (
    <>
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="pointer-events-none fixed inset-x-0 top-0 z-50"
      >
        {/* Covers the gap above the floating pill so content can't peek through */}
        <div aria-hidden className={`nav-scrim ${scrolled ? "nav-scrim--on" : ""}`} />
        <div
          className={`pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            scrolled ? "mx-3 mt-3 sm:mx-5 lg:mx-8" : "mx-0 mt-0"
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
                    <div
                      key={link.label}
                      className="relative"
                      onMouseEnter={() => setOpenMenu(link.label)}
                      onMouseLeave={() => setOpenMenu(null)}
                      onFocus={() => setOpenMenu(link.label)}
                    >
                      <button
                        type="button"
                        aria-label={`${link.label} menu`}
                        aria-haspopup="true"
                        aria-expanded={openMenu === link.label}
                        className={`nav-link ${openMenu === link.label ? "nav-link--open" : ""} ${
                          activeLabel === link.label ? "nav-link--active" : ""
                        }`}
                        onClick={() =>
                          setOpenMenu((cur) => (cur === link.label ? null : link.label))
                        }
                      >
                        {link.label}
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-300 ${
                            openMenu === link.label ? "rotate-180" : ""
                          }`}
                        />
                        <span className="nav-link-underline" aria-hidden />
                      </button>

                      <AnimatePresence>
                        {openMenu === link.label && (
                          <div
                            className={`absolute top-full z-50 pt-3 ${
                              link.dropdown.mega
                                ? "left-1/2 w-[min(92vw,44rem)] -translate-x-1/2"
                                : "left-0 w-[19rem]"
                            }`}
                          >
                            <DropdownPanel dropdown={link.dropdown} />
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      aria-current={activeLabel === link.label ? "page" : undefined}
                      className={`nav-link ${activeLabel === link.label ? "nav-link--active" : ""}`}
                    >
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
              className="fixed inset-0 z-40 bg-[#020810]/55 backdrop-blur-[3px] lg:hidden"
              onClick={closeMobile}
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: easeOut }}
              className={`nav-mobile-panel fixed left-3 right-3 z-40 max-h-[min(78vh,640px)] overflow-y-auto lg:hidden ${
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
                          className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
                        >
                          {link.label}
                          <ChevronDown
                            className={`h-4 w-4 text-[#5ce1ff] transition-transform duration-300 ${
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
                              className="overflow-hidden pl-1"
                            >
                              {link.dropdown.groups ? (
                                <>
                                  {link.dropdown.top?.map((d) => (
                                    <a
                                      key={d.label}
                                      href={d.href}
                                      onClick={closeMobile}
                                      className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#7DD3EA] hover:bg-white/5"
                                    >
                                      {d.label}
                                      <ArrowRight className="h-3.5 w-3.5" />
                                    </a>
                                  ))}
                                  {link.dropdown.groups.map((g) => (
                                    <div key={g.title} className="mt-1">
                                      <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#5ce1ff]/70">
                                        {g.title}
                                      </p>
                                      {g.links.map((d) => {
                                        const Icon = d.icon ?? ArrowRight;
                                        return (
                                          <a
                                            key={d.label}
                                            href={d.href}
                                            onClick={closeMobile}
                                            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                                          >
                                            <Icon className="h-4 w-4 text-[#5ce1ff]/80" strokeWidth={1.9} />
                                            {d.label}
                                          </a>
                                        );
                                      })}
                                    </div>
                                  ))}
                                </>
                              ) : (
                                link.dropdown.links!.map((d) => {
                                  const Icon = d.icon ?? Sparkles;
                                  return (
                                    <a
                                      key={d.label}
                                      href={d.href}
                                      onClick={closeMobile}
                                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                                    >
                                      <Icon className="h-4 w-4 text-[#5ce1ff]/80" strokeWidth={1.9} />
                                      {d.label}
                                    </a>
                                  );
                                })
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <a
                        href={link.href}
                        onClick={closeMobile}
                        className="block rounded-xl px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
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
                  className="mt-2 border-t border-white/10 pt-3"
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
