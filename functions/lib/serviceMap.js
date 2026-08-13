/** Keyword → service CTA mapping (mirrors scripts/gsc-blog/service-map.json). */
module.exports = {
  brandSkip: ["alliance tech", "alliancetech", "alliance tech ltd", "alliancetechltd"],
  locations: [
    { id: "houston", city: "Houston", state: "Texas", patterns: ["houston", "houstin"] },
    { id: "dallas", city: "Dallas", state: "Texas", patterns: ["dallas"] },
    { id: "austin", city: "Austin", state: "Texas", patterns: ["austin"] },
    { id: "san-antonio", city: "San Antonio", state: "Texas", patterns: ["san antonio"] },
    { id: "chicago", city: "Chicago", state: "Illinois", patterns: ["chicago"] },
    { id: "new-york", city: "New York", state: "New York", patterns: ["new york", "nyc"] },
    { id: "texas", city: "Houston", state: "Texas", patterns: ["texas", " tx", "tx ", "tx,"] },
  ],
  services: [
    {
      id: "ai-receptionist",
      patterns: [
        "ai receptionist",
        "virtual receptionist",
        "missed calls",
        "after hours",
        "after-hours",
        "ai call",
      ],
      serviceLink: {
        href: "/ai-receptionist",
        label: "Book a free AI receptionist demo",
        description:
          "See how Alliance Tech's AI receptionist answers clinic calls 24/7 and books more appointments.",
      },
    },
    {
      id: "clinic-website",
      patterns: [
        "clinic website",
        "medical website",
        "healthcare website",
        "website design",
        "dental website",
      ],
      serviceLink: {
        href: "/portfolio#websites",
        label: "See clinic website case studies",
        description:
          "Explore real healthcare websites we've built for clinics — and the results they delivered.",
      },
    },
    {
      id: "local-seo",
      patterns: ["local seo", "google maps", "google business", "maps ranking", "near me"],
      serviceLink: {
        href: "/local-seo-for-clinics",
        label: "Get a local SEO plan for your clinic",
        description:
          "Rank higher in Google Maps and local search for Houston and Texas clinic patients.",
      },
    },
    {
      id: "seo",
      patterns: ["seo for", "clinic seo", "dental seo", "medical seo", "seo agency", "seo company"],
      serviceLink: {
        href: "/seo-for-clinics",
        label: "Explore clinic SEO services",
        description:
          "SEO built for dental, aesthetic, and medical clinics that need more booked appointments.",
      },
    },
    {
      id: "dental-growth",
      patterns: ["dental marketing", "dental clinic growth", "dentist marketing"],
      serviceLink: {
        href: "/dental-clinic-growth",
        label: "Grow your dental clinic",
        description:
          "Marketing, websites, and AI systems designed to bring more patients to dental practices.",
      },
    },
    {
      id: "aesthetic-growth",
      patterns: ["aesthetic clinic", "med spa", "medspa", "aesthetic marketing"],
      serviceLink: {
        href: "/aesthetic-clinic-growth",
        label: "Grow your aesthetic clinic",
        description:
          "Patient-growth systems for med spas and aesthetic clinics across Houston and Texas.",
      },
    },
    {
      id: "digital-marketing",
      patterns: [
        "digital marketing",
        "google ads",
        "clinic ads",
        "marketing for",
        "advertising clinic",
      ],
      serviceLink: {
        href: "/digital-marketing-for-clinics",
        label: "See clinic digital marketing",
        description:
          "Paid and organic patient acquisition for healthcare practices that want measurable growth.",
      },
    },
  ],
};

function includesAny(haystack, patterns) {
  return patterns.some((p) => haystack.includes(p.toLowerCase()));
}

function mapKeywordToService(query) {
  const q = String(query || "")
    .toLowerCase()
    .trim();
  const map = module.exports;
  const loc =
    map.locations.find((l) => includesAny(q, l.patterns)) || {
      id: "houston",
      city: "Houston",
      state: "Texas",
    };
  const svc =
    map.services.find((s) => includesAny(q, s.patterns)) ||
    map.services.find((s) => s.id === "digital-marketing");
  return { location: loc, service: svc };
}

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

module.exports.mapKeywordToService = mapKeywordToService;
module.exports.slugify = slugify;
