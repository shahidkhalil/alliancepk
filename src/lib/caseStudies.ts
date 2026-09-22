export type ProjectType = "Website" | "AI Automation" | "SEO" | "App" | "Marketing";

export type AdPlatform = "Meta" | "Google";

export interface ChatShot {
  src: string;
  caption: string;
}

export interface CaseStudy {
  client: string;
  slug: string;
  type: ProjectType;
  category: string;
  tagline: string;
  /** Marketing platform filter (Meta / Google / Multi). */
  platform?: AdPlatform;
  liveUrl?: string;
  liveLabel?: string;
  pdfUrl?: string;
  pdfLabel?: string;
  afterImage?: string;
  afterLabel?: string;
  thumbImage?: string;
  logo?: string;
  heroWide?: boolean;
  beforeImage?: string;
  gallery?: string[];
  chatGallery?: ChatShot[];
  phoneGallery?: ChatShot[];
  featureGallery?: ChatShot[];
  duration?: string;
  industry?: string;
  market?: string;
  objectives?: string[];
  activities?: string[];
  strategies?: { title: string; detail: string }[];
  resultTable?: {
    title?: string;
    headers: string[];
    rows: string[][];
  };
  conclusion?: string;
  services: string[];
  challenge: string;
  built: string;
  result: string;
  features: string[];
  metrics: { value: string; label: string }[];
  accent: string;
}

export const caseStudies: CaseStudy[] = [
  {
    client: "Dr. Syeda Nida Batool",
    slug: "dr-nida-batool",
    type: "Website",
    category: "Clinical Psychologist — Website Redesign & Booking Platform",
    tagline: "A complete rebuild of a clinical psychologist's website — transforming a basic profile page into a credibility-first platform that turns visitors into booked appointments.",
    afterImage: "/case-studies/dr-nida-after.jpg",
    beforeImage: "/case-studies/dr-nida-before.jpg",
    gallery: [
      "/case-studies/dr-nida-1.jpg",
      "/case-studies/dr-nida-2.jpg",
      "/case-studies/dr-nida-3.jpg",
      "/case-studies/dr-nida-4.jpg",
      "/case-studies/dr-nida-5.jpg",
      "/case-studies/dr-nida-6.jpg",
    ],
    services: ["Website Redesign", "Online Booking System", "WhatsApp Integration", "Blog CMS", "SEO Setup"],
    challenge:
      "Dr. Nida is one of America's most credentialed clinical psychologists — PhD, 15+ years of practice, internationally certified in NLP and Timeline Therapy. Her original website, however, was a basic single-page profile: it stated who she was but did little to build trust or drive action. There was no real way to verify her credentials, explore her services, or book a session without picking up the phone. Her online presence didn't match the calibre of her expertise.",
    built:
      "We rebuilt the site from the ground up into a modern, conversion-focused platform. The centerpiece is a smooth multi-step booking flow that lets clients pick a service, choose a date and time, and confirm — with details delivered straight to WhatsApp. We added a self-serve blog dashboard so she can publish articles herself, a verified certifications gallery to build instant trust, and a clean services section covering everything from CBT to corporate coaching.",
    result:
      "The redesign gave Dr. Nida a website that finally matches her reputation. Where the old site simply introduced her, the new one does the selling — visitors can verify her qualifications, read her writing, and book a session in under a minute without a single phone call. It positions her exactly where her expertise belongs: as a premier, internationally certified practitioner.",
    features: [
      "Multi-step appointment booking (service → date & time → confirm)",
      "Bookings delivered instantly to WhatsApp",
      "Self-managed blog with Firebase-powered dashboard",
      "Verified certifications & credentials gallery",
      "Trust-building hero with live credential badges",
      "Fully responsive, fast, SEO-ready build",
    ],
    metrics: [
      { value: "1 min", label: "To book a session" },
      { value: "0", label: "Calls needed to book" },
      { value: "100%", label: "Self-managed content" },
    ],
    accent: "#0077A8",
  },
  {
    client: "Dental Tribe",
    slug: "dental-tribe",
    type: "Website",
    category: "Dental Clinic (Dr. Shahab & Associates, Houston) — Website & Booking",
    tagline: "A bold, modern website for a premium Houston dental clinic — built to fill evening appointment slots and turn browsers into booked patients.",
    afterImage: "/case-studies/dental-tribe.jpg",
    gallery: [
      "/case-studies/dental-tribe-1.jpg",
      "/case-studies/dental-tribe-2.jpg",
      "/case-studies/dental-tribe-3.jpg",
      "/case-studies/dental-tribe-4.jpg",
      "/case-studies/dental-tribe-5.jpg",
      "/case-studies/dental-tribe-6.jpg",
    ],
    services: ["Custom Website Design", "Online Booking", "WhatsApp Confirmation", "Services & Blog Pages", "Local SEO"],
    challenge:
      "Dental Tribe offers premium dental care in Houston with dedicated evening hours — but had no digital storefront to match. Patients had no easy way to discover the clinic, understand its treatments, or book a slot online. Evening appointments, their key differentiator, weren't being marketed anywhere prospective patients could actually find and act on them.",
    built:
      "We designed and built a striking, high-end website that positions Dental Tribe as a premium choice. It leads with a bold hero and clear 'Book Evening Slot' and 'Chat on WhatsApp' actions, backed by an online booking flow that confirms straight to WhatsApp. We added a problem-and-solution services section covering everything from everyday concerns to full smile makeovers, plus About and Blog pages — all mobile-first and fast.",
    result:
      "Dental Tribe now has a website that looks the part and does the work. Prospective patients can explore treatments, see live opening hours, and book an evening slot online in seconds — with confirmations landing on WhatsApp. The clinic's premium positioning and its evening-hours edge are finally front and centre where new patients can find them.",
    features: [
      "Bold, premium-feel hero with clear booking CTAs",
      "Online booking with instant WhatsApp confirmation",
      "'Book Evening Slot' flow around their key differentiator",
      "Common Problems & Solutions services section",
      "About, Blog, and Contact pages",
      "Mobile-first, fast-loading, SEO-ready build",
    ],
    metrics: [
      { value: "24/7", label: "Online booking" },
      { value: "Seconds", label: "To book a slot" },
      { value: "Evening", label: "Slots front & centre" },
    ],
    accent: "#12B3C7",
  },
  {
    client: "Maya AI Receptionist",
    slug: "maya-ai-receptionist",
    type: "AI Automation",
    category: "Product Case Study — 24/7 Voice & Chat Booking Agent",
    tagline:
      "A live AI front desk that answers every call and chat in English, qualifies the patient, and books appointments automatically — so clinics never miss another lead after hours.",
    liveUrl: "/ai-receptionist",
    liveLabel: "Try Live Demo",
    afterImage: "/case-studies/ai-receptionist-main.jpg",
    heroWide: true,
    chatGallery: [
      { src: "/case-studies/ai-receptionist-1.jpg", caption: "Answers treatment & pricing questions instantly, in natural English" },
      { src: "/case-studies/ai-receptionist-2.jpg", caption: "Guides the patient through a quick in-chat booking form" },
      { src: "/case-studies/ai-receptionist-3.jpg", caption: "Confirms the appointment automatically — no staff involved" },
      { src: "/case-studies/ai-receptionist-4.jpg", caption: "Live voice agent picks up and talks the patient through booking" },
      { src: "/case-studies/ai-receptionist-5.jpg", caption: "Supports voice notes for patients who'd rather speak than type" },
    ],
    services: [
      "24/7 Call Answering",
      "Live Chat Booking",
      "Voice Agent",
      "Appointment Confirmations",
      "Clinic Knowledge Training",
    ],
    challenge:
      "Busy dental and aesthetic clinics miss 25–40% of inbound calls during peak hours, lunch, and after closing. Every unanswered ring is a patient who books with the competitor who picked up. Hiring more front-desk staff is expensive, and humans still can't cover nights and weekends without burnout.",
    built:
      "We built an AI receptionist trained on clinic services, prices, hours, and FAQs. It answers phone and website chat simultaneously, speaks natural English, qualifies the patient, checks availability, and books the appointment — then sends confirmations automatically. Clinics can try the live demo on our site: ask about treatments, hours, or book a sample appointment in real time.",
    result:
      "Clinics using the AI receptionist stop losing after-hours and peak-time leads. Patients get instant answers and a booked slot without waiting on hold. The front desk is freed for in-clinic care while the AI handles volume that would otherwise require multiple staff — with zero missed calls as the target outcome.",
    features: [
      "Answers every call and chat at once — no hold music",
      "Books appointments into the clinic calendar automatically",
      "Trained on your services, pricing, and FAQs",
      "Voice notes and live voice agent support",
      "WhatsApp / email confirmations and reminders",
      "Works for dental, aesthetic, and multi-specialty clinics",
    ],
    metrics: [
      { value: "0", label: "Missed calls target" },
      { value: "24/7", label: "Availability" },
      { value: "5s", label: "Typical answer time" },
    ],
    accent: "#7B61FF",
  },
  {
    client: "Free Website Audit",
    slug: "free-website-audit",
    type: "AI Automation",
    category: "Product Case Study — AI Clinic Website Analyzer",
    tagline:
      "A free AI tool that scores a clinic's website in under 30 seconds — speed, SEO, patient experience, and competitor gaps — then unlocks a full growth report.",
    liveUrl: "/free-website-audit",
    liveLabel: "Run Free Audit",
    afterImage: "/case-studies/free-website-audit-main.jpg",
    heroWide: true,
    chatGallery: [
      { src: "/case-studies/free-website-audit-1.jpg", caption: "Walks through the site live — speed, SEO, and patient experience checks" },
      { src: "/case-studies/free-website-audit-2.jpg", caption: "Delivers an instant score and estimates the monthly revenue it's costing" },
      { src: "/case-studies/free-website-audit-3.jpg", caption: "Surfaces the exact competitors outranking you on Google" },
      { src: "/case-studies/free-website-audit-4.jpg", caption: "Benchmarks your Google Business Profile against the local map pack" },
      { src: "/case-studies/free-website-audit-5.jpg", caption: "Lists critical issues with a clear, actionable fix for each one" },
    ],
    services: [
      "PageSpeed Analysis",
      "On-Page SEO Check",
      "Patient Experience Score",
      "Competitor Benchmark",
      "Google Business Comparison",
    ],
    challenge:
      "Most clinic owners know their website feels slow or outdated, but they don't know what's actually costing them patients — ranking gaps, missing booking CTAs, weak mobile experience, or competitors outranking them on Google Maps. Hiring an agency for a paid audit creates friction before they've even seen the problem.",
    built:
      "We built a free AI website audit bot that anyone can use: paste a clinic URL and get a real score backed by PageSpeed data, SEO checks, patient-booking friction analysis, and local competitor context. A teaser score appears immediately; the full report unlocks with a quick lead gate so clinics can share results with their team — and so we can follow up with a clear fix plan.",
    result:
      "Clinic owners get an honest, data-backed picture of where their site is leaking patients — without a sales call first. The audit becomes the starting point for website redesigns, local SEO, and booking automation. It's free to run on our site today, and every completed audit surfaces the exact issues that turn searchers into booked appointments.",
    features: [
      "Real Google PageSpeed / performance scoring",
      "On-page SEO and treatment keyword gaps",
      "Patient experience check (booking, call, WhatsApp)",
      "Local competitor and ranking context",
      "Instant score + full report unlock flow",
      "Free to use — no credit card required",
    ],
    metrics: [
      { value: "30s", label: "To first score" },
      { value: "Free", label: "No signup required" },
      { value: "6", label: "Audit dimensions" },
    ],
    accent: "#00B4D8",
  },
  {
    client: "B2B Packaging Brand",
    slug: "b2b-packaging-seo",
    type: "SEO",
    category: "B2B Packaging — Organic Growth & Lead Gen",
    tagline:
      "A 12-month B2B SEO program that put a wholesale packaging site on page one for 500 high-intent keywords and grew organic traffic by 75%.",
    pdfUrl: "/Alliancetech-SEO-Portfolio.pdf",
    pdfLabel: "Full SEO Portfolio PDF",
    duration: "12 months",
    industry: "B2B Packaging",
    objectives: [
      "Establish a strong online presence for new wholesale products",
      "Rank for industry-specific and solution-based keywords",
      "Drive qualified lead generation through organic search",
    ],
    activities: [
      "Comprehensive industry research for high-intent keywords",
      "Landing pages built around buyer pain points",
      "Funnel-stage content marketing & blog calendar",
      "Ongoing ranking and Search Console tracking",
    ],
    services: [
      "Keyword Research & Strategy",
      "Landing Page SEO",
      "Content Marketing",
      "Technical & On-Page SEO",
      "Lead-Focused Optimization",
    ],
    challenge:
      "A new B2B packaging brand needed a strong online presence for wholesale products. Without rankings for industry-specific and solution-based keywords, organic lead flow stayed limited in a competitive packaging market.",
    built:
      "We ran comprehensive industry research to identify high-intent keywords, built and optimized landing pages around those terms and buyer pain points, and launched a content marketing system — including a funnel-stage blog editorial calendar — to support rankings and authority.",
    result:
      "Within 6 months the site hit first-page rankings for 500 high-intent keywords. Organic traffic rose 75%, and Search Console showed 92.9K clicks and 5.1M impressions over 16 months — driving significant lead volume from organic search.",
    features: [
      "High-intent keyword research for B2B packaging",
      "Landing pages mapped to buyer pain points",
      "Content calendar across awareness → decision stages",
      "Ongoing ranking and traffic performance tracking",
      "Organic lead generation focus (not vanity traffic)",
    ],
    metrics: [
      { value: "500", label: "Page-1 keywords (6 mo)" },
      { value: "+75%", label: "Organic traffic" },
      { value: "92.9K", label: "Clicks (16 months)" },
    ],
    accent: "#0EA5E9",
  },
  {
    client: "Local Beauty Salon",
    slug: "local-beauty-salon-seo",
    type: "SEO",
    category: "Beauty & Personal Care — Local SEO (NYC)",
    tagline:
      "Local SEO that put a beauty salon #1 in the Google Map Pack for its primary neighborhood search within one month.",
    pdfUrl: "/Alliancetech-SEO-Portfolio.pdf",
    pdfLabel: "Full SEO Portfolio PDF",
    duration: "1 month",
    industry: "Beauty & Personal Care",
    objectives: [
      "Build a strong local online presence",
      "Achieve #1 ranking for primary beauty service keywords",
      "Increase organic traffic and booking inquiries",
    ],
    activities: [
      "Local high-intent beauty keyword research",
      "Google Business Profile optimization",
      "Location-specific content and on-page SEO",
      "Local backlink / authority strategy",
    ],
    services: [
      "Local Keyword Research",
      "Google Business Profile",
      "On-Page Local SEO",
      "Location Content",
      "Local Link Building",
    ],
    challenge:
      "A local beauty salon needed a stronger online presence to attract neighborhood customers. Without Map Pack visibility for high-intent beauty searches, booking inquiries stayed harder to win against nearby competitors.",
    built:
      "We researched local high-intent beauty keywords, optimized the Google Business Profile, created location-specific content, strengthened on-page SEO for service terms, and built a local backlink strategy to grow neighborhood authority.",
    result:
      "Within one month the salon ranked #1 for primary beauty service keywords and topped the Google Local Pack for its core local query — boosting organic visibility, traffic, and booking inquiries.",
    features: [
      "Google Business Profile & Maps Pack optimization",
      "Local beauty keyword targeting",
      "Service-page on-page SEO",
      "Location-specific content",
      "Local authority / backlink outreach",
    ],
    metrics: [
      { value: "#1", label: "Map Pack ranking" },
      { value: "1 mo", label: "Time to results" },
      { value: "↑", label: "Booking inquiries" },
    ],
    accent: "#E11D48",
  },
  {
    client: "Custom Packaging Brand",
    slug: "custom-packaging-seo",
    type: "SEO",
    category: "B2B Product Launch — Custom Packaging SEO",
    tagline:
      "A 6-month SEO launch that secured first-page rankings for 250 high-intent keywords and grew organic traffic 35%.",
    pdfUrl: "/Alliancetech-SEO-Portfolio.pdf",
    pdfLabel: "Full SEO Portfolio PDF",
    duration: "6 months",
    industry: "B2B Custom Packaging",
    objectives: [
      "Launch strong visibility for new packaging products",
      "Rank for industry and solution-based keywords",
      "Generate B2B leads from organic search",
    ],
    activities: [
      "In-depth industry keyword research",
      "Landing pages for commercial-intent terms",
      "Content marketing supporting product rankings",
      "Ongoing ranking and traffic reporting",
    ],
    services: [
      "Industry Keyword Research",
      "Landing Page Development",
      "Content Marketing",
      "On-Page Optimization",
      "Commercial Intent Targeting",
    ],
    challenge:
      "A custom packaging company needed strong visibility for new products in a competitive market — ranking for industry and solution keywords so organic search could generate qualified B2B leads.",
    built:
      "We built a high-intent keyword list from industry research, developed and optimized landing pages for target terms, and ran content marketing to support rankings for commercial packaging queries across retail and specialty product lines.",
    result:
      "In 6 months the site achieved first-page rankings for 250 high-intent keywords and grew organic traffic by 35%. Domain metrics showed ~9.6K organic visits and 12.2K ranking keywords, with strong positions on commercial terms.",
    features: [
      "Industry + pain-point keyword mapping",
      "Optimized product / landing pages",
      "Content supporting commercial keywords",
      "Ongoing ranking and traffic reporting",
      "Lead generation via organic search",
    ],
    metrics: [
      { value: "250", label: "Page-1 keywords" },
      { value: "+35%", label: "Organic traffic" },
      { value: "9.6K", label: "Monthly organic visits" },
    ],
    accent: "#DC2626",
  },
  {
    client: "Vitamins & Supplements Store",
    slug: "vitamins-supplements-seo",
    type: "SEO",
    category: "Healthcare E-Commerce — Vitamins & Supplements",
    tagline:
      "A 3-month SEO engagement that lifted rankings, grew organic traffic 25%, and doubled revenue for a supplements e-commerce brand.",
    pdfUrl: "/Alliancetech-SEO-Portfolio.pdf",
    pdfLabel: "Full SEO Portfolio PDF",
    duration: "3 months",
    industry: "Healthcare E-Commerce",
    objectives: [
      "Improve rankings for vitamins and medicines",
      "Drive more organic traffic",
      "Increase sales by 100%",
    ],
    activities: [
      "Keyword research for high-volume / lower-competition terms",
      "Product page optimization with patient-friendly content",
      "Schema markup for richer search results",
      "Technical SEO and ranking tracking",
    ],
    services: [
      "Healthcare Keyword Research",
      "Product Page Optimization",
      "Schema Markup",
      "Technical SEO",
      "Conversion-Focused Content",
    ],
    challenge:
      "A vitamins and supplements store needed stronger rankings for product terms, more organic traffic, and a clear path to double sales — competing in a crowded market with weak visibility on high-volume keywords.",
    built:
      "We researched vitamins and medicines keywords, prioritized high-volume / lower-competition opportunities, optimized product and service pages with relevant content, and implemented schema markup to improve search visibility and rich results.",
    result:
      "Rankings improved for 15+ vitamins and medicines keywords, organic traffic rose 25%, and revenue increased 100%. Growth continued to ~29.4K monthly organic visits with 191K clicks and 6.42M impressions over 16 months in key markets.",
    features: [
      "High-volume, low-competition keyword targeting",
      "Product page SEO for vitamins & medicines",
      "Schema markup for richer SERP presence",
      "Traffic and ranking growth tracking",
      "Revenue-aligned SEO priorities",
    ],
    metrics: [
      { value: "+25%", label: "Organic traffic" },
      { value: "+100%", label: "Revenue increase" },
      { value: "29.4K", label: "Monthly organic visits" },
    ],
    accent: "#16A34A",
  },
  {
    client: "Spark",
    slug: "spark-app",
    type: "App",
    category: "Health & Wellbeing — Mobile App",
    tagline:
      "Spark is a health & wellbeing app built around daily habits, mood tracking, and a community wall — so people can stay consistent and feel supported.",
    afterImage: "/case-studies/spark-1.jpg",
    afterLabel: "Spark App",
    thumbImage: "/case-studies/spark-card.jpg",
    logo: "/case-studies/spark-logo.png",
    phoneGallery: [
      { src: "/case-studies/spark-1.jpg", caption: "Splash — Spark brand & tagline" },
      { src: "/case-studies/spark-2.jpg", caption: "Onboarding tour for health & wellbeing" },
      { src: "/case-studies/spark-3.jpg", caption: "Home — daily updates, habits & mood score" },
      { src: "/case-studies/spark-4.jpg", caption: "Habit & mood tracking dashboard" },
      { src: "/case-studies/spark-5.jpg", caption: "Spark Wall — community mood feed" },
      { src: "/case-studies/spark-6.jpg", caption: "Side menu — profile, habits & resources" },
    ],
    services: [
      "Mobile App UI/UX",
      "Habit Tracking",
      "Mood Insights",
      "Community Feed",
      "Onboarding Flow",
    ],
    challenge:
      "People struggle to stay consistent with health and wellbeing goals when tools feel fragmented — habits in one place, mood in another, and no supportive community to keep momentum.",
    built:
      "We shaped Spark as a single mobile experience: a clear splash and onboarding tour, a home dashboard with daily updates and habit stats, mood scoring with motivational quotes, a Spark Wall community feed, and a side menu for profile, achievements, and resources.",
    result:
      "Spark gives users one place to track habits, check in on mood, and share progress with others — reducing friction and making daily wellbeing habits easier to stick with.",
    features: [
      "Splash branding and guided onboarding tour",
      "Home dashboard with daily updates & habit stats",
      "Mood score and motivational quotes",
      "Spark Wall community feed (posts, likes, comments)",
      "Side navigation for profile, achievements & resources",
      "Bottom nav: Home, Spark Wall, Habits, Mood",
    ],
    metrics: [
      { value: "6", label: "Core app screens" },
      { value: "Habits", label: "Daily tracking" },
      { value: "Mood", label: "Check-ins & wall" },
    ],
    accent: "#7C3AED",
  },
  {
    client: "IngreedyIt",
    slug: "ingreedyit-app",
    type: "App",
    category: "Ingredient & Product Intelligence — Mobile App",
    tagline:
      "IngreedyIt helps people make smarter everyday choices — scan food, cosmetics, cleaning, and pet products, then understand ingredients at their level.",
    afterImage: "/case-studies/smart-eating-phone-1.jpg",
    afterLabel: "IngreedyIt App",
    thumbImage: "/case-studies/smart-eating-card.jpg",
    logo: "/case-studies/ingreedyit-logo.png",
    phoneGallery: [
      { src: "/case-studies/smart-eating-phone-1.jpg", caption: "Home — explore food, cosmetics & more" },
      { src: "/case-studies/smart-eating-phone-2.jpg", caption: "Dashboard — ingredient scores at a glance" },
      { src: "/case-studies/smart-eating-phone-3.jpg", caption: "Alerts — know what to avoid instantly" },
      { src: "/case-studies/smart-eating-phone-4.jpg", caption: "Nutrition — see what’s inside your meal" },
      { src: "/case-studies/smart-eating-phone-5.jpg", caption: "Learn — everything you want to know" },
      { src: "/case-studies/smart-eating-phone-6.jpg", caption: "Settings — personalize your experience" },
      { src: "/case-studies/smart-eating-phone-7.jpg", caption: "Modes — get information at your level" },
    ],
    services: [
      "Mobile App UI/UX",
      "Ingredient Analysis",
      "Nutrition Insights",
      "Personalization",
      "Multi-Category Search",
    ],
    challenge:
      "Shoppers and health-conscious users struggle to understand what’s in food, snacks, self-care, cleaning, and pet products — labels are dense, jargon is confusing, and there’s no simple way to personalize guidance to their preferences or knowledge level.",
    built:
      "We designed a mobile experience around clear category entry points (Food, Snacks, Self Care, Cleaning, Pet Food, Search), ingredient score dashboards, expandable education sections (What Is It, Health Implications, How It’s Made, Nutrition), Simple / Scholar / Scientific reading modes, meal nutrition breakdowns, and preference personalization.",
    result:
      "Users can explore products, see ingredient scores at a glance, dig into health implications, switch complexity modes, and personalize preferences — turning opaque labels into decisions they can act on.",
    features: [
      "Category home for food, snacks, self-care, cleaning & pets",
      "Ingredient score lists and product dashboards",
      "Expandable education: health, manufacturing, nutrition, studies",
      "Simplify / Expand / Question actions on each section",
      "Simple, Scholar & Scientific information modes",
      "Meal nutrition charts and compare / share flows",
      "Personalization: language, preferences, medical, pets & more",
    ],
    metrics: [
      { value: "6", label: "Product categories" },
      { value: "3", label: "Reading modes" },
      { value: "7", label: "Core app screens" },
    ],
    accent: "#0284C7",
  },
  {
    client: "UK Furniture Retailer",
    slug: "uk-furniture-seo",
    type: "SEO",
    category: "Home Furniture — Local / Organic SEO (UK)",
    tagline:
      "A 2-month local SEO push that lifted local visibility 40% and boosted inquiries 25% for a UK furniture retailer.",
    pdfUrl: "/Alliancetech-SEO-Portfolio.pdf",
    pdfLabel: "Full SEO Portfolio PDF",
    duration: "2 months",
    industry: "Home Furniture (UK)",
    objectives: [
      "Improve local search visibility",
      "Drive more organic traffic from target areas",
      "Enhance keyword targeting for local services",
    ],
    activities: [
      "Local keyword research with Google Keyword Planner",
      "Prioritized location-specific terms",
      "Google Business Profile optimization",
      "On-page local & commercial keyword improvements",
    ],
    services: [
      "Local Keyword Research",
      "Google Business Profile",
      "On-Page Local SEO",
      "Location Targeting",
      "Commercial Keyword Optimization",
    ],
    challenge:
      "A UK furniture retailer needed stronger local search visibility and more organic traffic for furniture and bedding queries — without clearer location and commercial keyword targeting, inquiries stayed below potential.",
    built:
      "We used Google Keyword Planner for local research, prioritized location-specific terms, optimized the Google Business Profile, and improved on-page SEO with local and commercial keyword targeting across product pages.",
    result:
      "Local search visibility rose 40%, organic traffic from targeted local areas grew 20%, and customer inquiries / service bookings improved 25% — with stronger positions on commercial furniture keywords.",
    features: [
      "Local keyword prioritization",
      "Google Business Profile optimization",
      "On-page local keyword improvements",
      "Commercial product-term targeting",
      "Inquiry and booking growth focus",
    ],
    metrics: [
      { value: "+40%", label: "Local visibility" },
      { value: "+20%", label: "Local organic traffic" },
      { value: "+25%", label: "Inquiries & bookings" },
    ],
    accent: "#0F766E",
  },
  // ─── Digital Marketing Campaigns (from Marketing_Campaigns.pdf) ───
  {
    client: "Concrete Business (Florida)",
    slug: "florida-concrete",
    type: "Marketing",
    platform: "Google",
    category: "Google Ads — Local Lead Generation",
    tagline:
      "From zero digital presence to measurable Google Ads leads — 30 conversions at $20 each in under three weeks for a new Florida concrete business.",
    pdfUrl: "/Marketing_Campaigns.pdf",
    pdfLabel: "Full Marketing Portfolio PDF",
    logo: "/case-studies/marketing/logos/florida-concrete.svg",
    afterImage: "/case-studies/marketing/florida-concrete-ads.png",
    afterLabel: "Google Ads results",
    heroWide: true,
    gallery: [
      "/case-studies/marketing/florida-concrete-ads.png",
      "/case-studies/marketing/florida-concrete-page.jpg",
    ],
    duration: "Aug 24 – Sep 12, 2026",
    industry: "Construction / Concrete Services",
    market: "Florida, USA",
    strategies: [
      {
        title: "Foundation setup",
        detail:
          "Built digital marketing accounts from scratch, improved the website for lead generation, and optimized Google Business Profile so the business was ready to capture demand.",
      },
      {
        title: "High-intent keyword targeting",
        detail:
          "Researched commercial concrete service keywords with clear purchase/booking intent and structured Google Ads around those queries.",
      },
      {
        title: "Conversion-focused optimization",
        detail:
          "Launched campaigns and continuously monitored spend, creative, and bidding to keep cost per conversion under control while scaling leads.",
      },
    ],
    resultTable: {
      title: "Account performance window",
      headers: ["Metric", "Result", "Spend", "Efficiency", "Notes"],
      rows: [
        ["Conversions", "30", "$600", "$20 / conv.", "Aug 24 – Sep 12"],
        ["Impressions", "5.61K", "$600", "—", "Local service search"],
      ],
    },
    conclusion:
      "In under three weeks the business went from no ads presence to a measurable Google lead channel — 30 conversions at $20 average cost, proving a repeatable local acquisition model.",
    services: ["Google Ads", "Google Business Profile", "Website Optimization", "Keyword Research", "Lead Generation"],
    challenge:
      "A newly established concrete business in Florida needed an online foundation and a reliable way to generate qualified service leads through Google — with no existing ads infrastructure.",
    built:
      "We set up the required marketing accounts, improved the website for lead generation, optimized Google Business Profile, researched high-intent concrete keywords, and launched + continuously optimized Google Ads campaigns focused on conversions.",
    result:
      "In Aug 24–Sep 12, 2026 the campaigns delivered 30 conversions, 5.61K impressions, $600 ad spend, and a $20 average cost per conversion — giving the business a measurable Google lead channel from a standing start.",
    features: [
      "Full account setup from scratch",
      "Google Business Profile optimization",
      "High-intent local service keyword targeting",
      "Conversion-focused Google Ads",
      "Continuous monitoring and optimization",
    ],
    metrics: [
      { value: "30", label: "Conversions" },
      { value: "$20", label: "Avg cost / conversion" },
      { value: "$600", label: "Ad spend" },
    ],
    accent: "#EA580C",
  },
  {
    client: "Commercial Kitchen Equipment (NY)",
    slug: "kitchen-equipment-ny",
    type: "Marketing",
    platform: "Google",
    category: "Google Ads — B2B Lead Generation",
    tagline:
      "We shifted high-ticket kitchen equipment ads from forced online sales to consultation-led lead gen — unlocking 150+ leads/calls per month.",
    pdfUrl: "/Marketing_Campaigns.pdf",
    pdfLabel: "Full Marketing Portfolio PDF",
    logo: "/case-studies/marketing/logos/kitchen-equipment.svg",
    afterImage: "/case-studies/marketing/kitchen-equipment-ads.png",
    afterLabel: "Google Ads overview",
    heroWide: true,
    gallery: [
      "/case-studies/marketing/kitchen-equipment-ads.png",
      "/case-studies/marketing/kitchen-equipment-page.jpg",
    ],
    duration: "Feb – Sep 2026",
    industry: "Commercial Kitchen Equipment / B2B",
    market: "Brooklyn & New York, USA",
    strategies: [
      {
        title: "Buyer-journey research",
        detail:
          "Mapped how restaurants, bars, and cafés actually buy expensive equipment — research and consult first, purchase later — instead of forcing checkout ads.",
      },
      {
        title: "Pivot from sales to lead gen",
        detail:
          "Tested an online-sales model, diagnosed the mismatch, then rebuilt campaigns around phone calls and qualified inquiries.",
      },
      {
        title: "Commercial-intent search",
        detail:
          "Targeted high-intent commercial kitchen queries and optimized for call/inquiry conversions to create a monthly pipeline.",
      },
    ],
    resultTable: {
      title: "Account results shown",
      headers: ["Metric", "Value", "Clicks", "Spend", "Notes"],
      rows: [
        ["Conversions", "471", "7.09K", "$12.4K", "$26.35 avg CPCV"],
        ["Leads / calls", "150+/mo", "—", "—", "After pivot to lead gen"],
      ],
    },
    conclusion:
      "Aligning ads with the real B2B buying journey unlocked a scalable consultation pipeline — 150+ leads/calls per month instead of fighting an e-commerce goal that buyers never intended to complete online.",
    services: ["Google Ads", "Lead Generation", "Market Research", "Campaign Optimization", "Call Tracking Strategy"],
    challenge:
      "The client initially wanted Google Ads for online sales of high-value commercial kitchen equipment. Restaurant and food-business buyers typically research and consult before purchasing — so a pure e-commerce conversion goal was fighting the real buying journey.",
    built:
      "We tested the sales approach, diagnosed the mismatch, then restructured campaigns around lead generation: commercial-intent searches for restaurants, bars, cafés and food businesses, optimized for phone calls and qualified inquiries.",
    result:
      "The lead-generation model produced 150+ leads/calls per month. Account results shown: 471 conversions, 7.09K clicks, $12.4K spend, $26.35 average cost per conversion — a scalable pipeline aligned with how buyers actually decide.",
    features: [
      "Buyer-behavior research before scaling spend",
      "Pivot from sales to lead-generation strategy",
      "Commercial-intent search targeting",
      "Call and inquiry focused optimization",
      "Consistent 150+ monthly leads/calls",
    ],
    metrics: [
      { value: "150+", label: "Leads/calls per month" },
      { value: "471", label: "Conversions" },
      { value: "$26.35", label: "Avg cost / conversion" },
    ],
    accent: "#0284C7",
  },
  {
    client: "Binkamal",
    slug: "binkamal",
    type: "Marketing",
    platform: "Meta",
    category: "Facebook Ads — E-commerce Purchases",
    tagline:
      "Structured Meta prospecting + Advantage+ Shopping + retargeting turned Facebook Ads into a purchase engine — 1,959 website purchases at 2.91 average ROAS.",
    pdfUrl: "/Marketing_Campaigns.pdf",
    pdfLabel: "Full Marketing Portfolio PDF",
    logo: "/case-studies/marketing/logos/binkamal.svg",
    afterImage: "/case-studies/marketing/binkamal-meta-ads.png",
    afterLabel: "Meta Ads Manager results",
    heroWide: true,
    gallery: [
      "/case-studies/marketing/binkamal-meta-ads.png",
      "/case-studies/marketing/binkamal-page-1.jpg",
      "/case-studies/marketing/binkamal-cocobee-page.jpg",
    ],
    duration: "Aug 2024 – Sep 2025",
    industry: "E-commerce / Islamic Caps & Clothing",
    market: "Pakistan",
    strategies: [
      {
        title: "Advantage+ Shopping prospecting",
        detail:
          "Introduced Advantage+ Shopping campaigns as the core sales engine to let Meta find purchase-ready shoppers efficiently.",
      },
      {
        title: "Location & audience layering",
        detail:
          "Applied location and interest/audience targeting aligned to religious apparel demand so spend concentrated where buyers convert.",
      },
      {
        title: "Retargeting structure",
        detail:
          "Built separate retargeting for website visitors, Add-to-Cart users, and previous purchasers — then shifted budget to purchase-signal winners.",
      },
    ],
    resultTable: {
      title: "Highest ROAS campaigns",
      headers: ["Campaign", "Spend", "Purchases", "ROAS", "Cost / purchase"],
      rows: [
        ["Advantage shopping 10/28/2024", "Rs10,981", "37", "10.47x", "Rs296.73"],
        ["JUNE UPDATE Advantage shopping", "Rs57,509", "237", "4.50x", "Rs243.03"],
        ["Advantage shopping w/ old audience", "Rs59,998", "208", "4.70x", "Rs288.45"],
      ],
    },
    conclusion:
      "Prospecting + Advantage+ Shopping + structured retargeting turned Facebook into a consistent purchase channel — 1,959 website purchases at 2.91 average ROAS, with top campaigns clearing 4.5x–10.47x.",
    services: ["Facebook Ads", "Advantage+ Shopping", "Retargeting", "Creative Testing", "ROAS Optimization"],
    challenge:
      "Binkamal’s online store needed a more structured Facebook Ads system to grow purchases — existing performance was stagnant without a clear prospecting → retargeting architecture.",
    built:
      "We introduced Advantage+ Shopping, layered location/audience targeting, and built separate retargeting for website visitors, Add-to-Cart users, and previous purchasers — continuously shifting budget toward campaigns generating purchases.",
    result:
      "Across campaigns shown: 1,959 website purchases, PKR 1.04M+ ad spend, 2.91 average Purchase ROAS, 7,336 Add-to-Carts, and 53,544 landing-page views. Top structures hit 4.50x, 4.70x, and up to 10.47x ROAS.",
    features: [
      "Advantage+ Shopping sales campaigns",
      "Visitor / ATC / purchaser retargeting",
      "Audience and creative testing loops",
      "Budget consolidation toward purchase signals",
      "Measurable account-level ROAS",
    ],
    metrics: [
      { value: "1,959", label: "Website purchases" },
      { value: "2.91x", label: "Avg purchase ROAS" },
      { value: "7,336", label: "Add-to-Carts" },
    ],
    accent: "#C026D3",
  },
  {
    client: "Cocobee Kids Clothing",
    slug: "cocobee-sargodha",
    type: "Marketing",
    platform: "Meta",
    category: "Multi-Platform Store Launch",
    tagline:
      "A multi-platform pre-launch and opening campaign that drove 3M+ PKR in launch-weekend sales and 1.15M+ social views for a new kids clothing store.",
    pdfUrl: "/Marketing_Campaigns.pdf",
    pdfLabel: "Full Marketing Portfolio PDF",
    logo: "/case-studies/marketing/logos/cocobee.svg",
    afterImage: "/case-studies/marketing/cocobee-page.jpg",
    afterLabel: "Launch campaign case study",
    heroWide: true,
    gallery: [
      "/case-studies/marketing/cocobee-page.jpg",
      "/case-studies/marketing/binkamal-cocobee-page.jpg",
    ],
    duration: "Store launch campaign",
    industry: "Kids Apparel / Retail",
    market: "Sargodha, Pakistan",
    strategies: [
      {
        title: "Platform foundation",
        detail:
          "Set up and optimized Facebook, Instagram, TikTok, YouTube, and Google Business Profile so the new store had a complete local discovery footprint.",
      },
      {
        title: "Pre-launch content system",
        detail:
          "Produced product, fashion, testimonial, countdown, and launch-day creatives to build anticipation before opening.",
      },
      {
        title: "Paid social push",
        detail:
          "Ran Facebook/Instagram ads and multi-platform promotion around opening weekend to convert awareness into footfall and sales.",
      },
    ],
    resultTable: {
      title: "Launch outcomes",
      headers: ["Metric", "Result", "Channel", "Focus", "Notes"],
      rows: [
        ["Launch-weekend sales", "3M+ PKR", "Store + social", "Opening weekend", "Record franchise sales"],
        ["Social views", "1.15M+", "FB / IG / TT / YT", "Awareness", "Combined platforms"],
        ["Campaign reach", "3M+", "Paid + organic", "Local buzz", "City-wide exposure"],
      ],
    },
    conclusion:
      "A coordinated multi-platform launch created city-wide buzz and converted it into 3M+ PKR opening-weekend sales — proving pre-launch content + paid social can open a physical retail brand strong.",
    services: ["Facebook Ads", "Instagram Ads", "TikTok", "YouTube", "Google Business Profile", "Content Strategy"],
    challenge:
      "Cocobee was launching a new kids clothing store in Sargodha and needed online visibility, launch excitement, and local customers walking through the door — with no established brand presence.",
    built:
      "We set up and optimized social + Google Business profiles, produced a full pre-launch content plan (product visuals, fashion content, testimonials, countdowns, launch-day creatives), and ran Facebook/Instagram ads plus multi-platform promotion around opening day.",
    result:
      "The launch delivered 3M+ PKR in launch-weekend sales, 1.15M+ combined social views, 3M+ total campaign reach/exposure, and strong engagement across Facebook, Instagram, TikTok and YouTube — establishing local awareness for the new store.",
    features: [
      "Full multi-platform presence setup",
      "Pre-launch content system",
      "Paid social for local awareness",
      "Launch-day creative push",
      "Google Business Profile for local discovery",
    ],
    metrics: [
      { value: "3M+ PKR", label: "Launch-weekend sales" },
      { value: "1.15M+", label: "Social media views" },
      { value: "3M+", label: "Campaign reach" },
    ],
    accent: "#DB2777",
  },
  {
    client: "Bulgarian E-commerce Shoe Brand",
    slug: "bulgaria-shoes",
    type: "Marketing",
    platform: "Meta",
    category: "Facebook Ads — Account Restructure & ROAS",
    tagline:
      "Consolidating 80+ fragmented campaigns into a clean funnel lifted monthly sales from ~$34K to ~$45K on the same ~$7K ad spend — about +32% revenue.",
    pdfUrl: "/Marketing_Campaigns.pdf",
    pdfLabel: "Full Marketing Portfolio PDF",
    logo: "/case-studies/marketing/logos/bulgaria-shoes.svg",
    afterImage: "/case-studies/marketing/bulgaria-shoes-before-after.jpeg",
    afterLabel: "May vs June campaign comparison",
    heroWide: true,
    gallery: [
      "/case-studies/marketing/bulgaria-shoes-before-after.jpeg",
      "/case-studies/marketing/bulgaria-page-1.jpg",
      "/case-studies/marketing/bulgaria-page-2.jpg",
    ],
    duration: "May–June 2024",
    industry: "E-commerce / Footwear",
    market: "Bulgaria",
    strategies: [
      {
        title: "Funnel consolidation",
        detail:
          "Collapsed 80+ fragmented campaigns into a clean prospecting → Lookalike → retargeting structure to stop learning resets and budget waste.",
      },
      {
        title: "Behavior-based audiences",
        detail:
          "Segmented visitors, engagers, and customers so each funnel stage spoke to people with the right purchase signal.",
      },
      {
        title: "Budget discipline",
        detail:
          "Concentrated spend into structures with stronger purchase signals instead of raising the overall ad budget.",
      },
    ],
    resultTable: {
      title: "Before vs after restructure",
      headers: ["Period", "Ad spend", "Sales", "ROAS", "Change"],
      rows: [
        ["May 2024 (before)", "~$7K", "~$34K", "4.86x", "Baseline"],
        ["June 2024 (after)", "~$7K", "~$45K", "6.43x", "+32% sales"],
      ],
    },
    conclusion:
      "Better campaign architecture beat bigger budgets — same ~$7K spend, ~$11K more monthly revenue, and ROAS up to 6.43x after consolidating an unmanageable account into a disciplined funnel.",
    services: ["Facebook Ads", "Campaign Architecture", "Audience Segmentation", "Retargeting", "Budget Optimization"],
    challenge:
      "The account had 80+ fragmented Facebook campaigns — hard to manage, prone to learning resets, and inefficient budget distribution. The goal was better structure and higher sales without simply spending more.",
    built:
      "We consolidated campaigns into a structured funnel (prospecting, Lookalikes, retargeting, high-intent), refined audiences from visitor/engagement/customer data, and shifted budget into structures with stronger purchase signals.",
    result:
      "May 2024: ~$7K spend → ~$34K sales (~4.86x ROAS). June 2024: ~$7K spend → ~$45K sales (~6.43x ROAS). Same spend band, ~$11K more monthly revenue (~32% sales lift) through architecture — not budget inflation.",
    features: [
      "80+ campaigns consolidated into a funnel",
      "Clear prospecting / LAL / retargeting structure",
      "Behavior-based audience segmentation",
      "Budget shift to purchase-signal winners",
      "Same spend, higher sales outcome",
    ],
    metrics: [
      { value: "+32%", label: "Sales increase" },
      { value: "6.43x", label: "ROAS after" },
      { value: "$11K", label: "Extra monthly revenue" },
    ],
    accent: "#4F46E5",
  },
  {
    client: "Cell Smash",
    slug: "cell-smash",
    type: "Marketing",
    platform: "Meta",
    category: "Facebook Ads — Local Leads",
    tagline:
      "From almost no digital presence to a local Meta lead funnel — 60+ leads at ~£4.07 CPL with 212K+ people reached in London.",
    pdfUrl: "/Marketing_Campaigns.pdf",
    pdfLabel: "Full Marketing Portfolio PDF",
    logo: "/case-studies/marketing/logos/cell-smash.svg",
    afterImage: "/case-studies/marketing/cell-smash-meta-ads.png",
    afterLabel: "Meta Ads Manager — Cell Smash",
    heroWide: true,
    gallery: [
      "/case-studies/marketing/cell-smash-meta-ads.png",
      "/case-studies/marketing/cell-smash-page.jpg",
    ],
    duration: "Lead-gen focus window",
    industry: "Local B2C / Phone Repair",
    market: "London, UK",
    strategies: [
      {
        title: "Phase 1 — Awareness & trust",
        detail:
          "Started with local awareness using real shop visuals and trust creatives so nearby customers recognized the business.",
      },
      {
        title: "Phase 2 — Lead generation tests",
        detail:
          "Geo-targeted the service area and tested lead campaigns, audiences, and creatives to find what produced quality inquiries.",
      },
      {
        title: "Phase 3 — Advantage+ scaling",
        detail:
          "Scaled winners with Advantage+ Lead campaigns while optimizing for CPL and engagement quality.",
      },
    ],
    resultTable: {
      title: "Campaign metrics",
      headers: ["Setup", "Leads", "CPL", "Reach", "Notes"],
      rows: [
        ["Standout lead setup A", "50", "£4.07", "—", "Core CPL benchmark"],
        ["Standout lead setup B", "78", "£4.22", "—", "Scaled Advantage+"],
        ["Account (leads focus)", "60+", "~£4.07", "212K+", "358K+ impressions"],
      ],
    },
    conclusion:
      "From near-zero digital presence, Cell Smash built a reliable local Facebook lead funnel — 60+ high-quality leads around £4 CPL with strong London reach via geo-fencing and Advantage campaigns.",
    services: ["Facebook Ads", "Local Lead Generation", "Geo-Targeting", "Advantage+ Leads", "Creative Testing"],
    challenge:
      "Cell Smash had little to no established digital presence and needed a way to reach customers in its London service area with high-quality local leads.",
    built:
      "We started with awareness, used real business visuals, applied precise geo-targeting, tested lead campaigns/audiences/creatives, then scaled winners with Advantage+ Lead campaigns while optimizing for CPL and engagement.",
    result:
      "Campaigns generated 60+ leads at approximately £4.07 average CPL, reached 212K+ people, delivered 358K+ impressions and 47K+ page engagements. Standout setups included 50 leads at £4.07 CPL and 78 leads at £4.22 CPL.",
    features: [
      "Local awareness → lead-gen funnel",
      "Geo-targeted London service area",
      "Creative testing with real business visuals",
      "Advantage+ Lead scaling",
      "CPL-focused optimization",
    ],
    metrics: [
      { value: "60+", label: "Leads" },
      { value: "£4.07", label: "Avg CPL" },
      { value: "212K+", label: "People reached" },
    ],
    accent: "#0EA5E9",
  },
  {
    client: "PakRice Market App",
    slug: "pakrice-app",
    type: "Marketing",
    platform: "Google",
    category: "Google App Campaigns — Installations",
    tagline:
      "A Google App Campaign that crossed 1,000 installs for a niche rice marketplace — 1,090+ downloads at Rs. 17.73 average CPI.",
    pdfUrl: "/Marketing_Campaigns.pdf",
    pdfLabel: "Full Marketing Portfolio PDF",
    logo: "/case-studies/marketing/logos/pakrice.svg",
    afterImage: "/case-studies/marketing/pakrice-app-ads.jpeg",
    afterLabel: "Google App Campaign results",
    heroWide: true,
    gallery: ["/case-studies/marketing/pakrice-app-ads.jpeg"],
    duration: "App promo window (Nov–Dec)",
    industry: "Agriculture / App-Based Marketplace",
    market: "Pakistan",
    strategies: [
      {
        title: "Install-focused App Campaign",
        detail:
          "Set up a Google App Campaign focused on installations so every rupee prioritized download volume.",
      },
      {
        title: "Audience segmentation",
        detail:
          "Identified relevant audience segments including farmers, brokers, rice mills and agricultural traders, using interest-based and profession-based targeting signals.",
      },
      {
        title: "Regional targeting",
        detail:
          "Targeted major rice-producing regions across Pakistan to reach the right users where marketplace demand is strongest.",
      },
      {
        title: "Creative testing & CPI optimization",
        detail:
          "Tested different ad variations to find stronger-performing messages, continuously monitored conversion tracking, and optimized toward higher installation volume at a lower CPI.",
      },
    ],
    resultTable: {
      title: "Campaign results",
      headers: ["Metric", "Result", "Notes"],
      rows: [
        ["App installations", "1,090+", "Beat 1,000+ target"],
        ["Total ad spend", "Rs. 19,300", "Campaign period shown"],
        ["Avg cost per install", "Rs. 17.73", "Low acquisition cost"],
        ["Interaction rate", "27.20%", "Strong engagement"],
      ],
    },
    conclusion:
      "The campaign successfully crossed 1,000 app downloads while keeping acquisition cost low — target 1,000+, achieved 1,090+, average CPI Rs. 17.73. This demonstrates Google App Campaigns, audience segmentation, and continuous optimization to acquire users quickly for a niche marketplace with controlled spend.",
    services: ["Google App Campaigns", "Install Optimization", "Audience Segmentation", "Regional Targeting", "CPI Control"],
    challenge:
      "PakRice Market is a specialized marketplace connecting rice farmers, brokers, rice mills and agricultural traders. The objective was clear: generate 1,000+ app downloads in the shortest possible time while keeping cost per installation as low as possible.",
    built:
      "We set up a Google App Campaign focused on installations; identified audiences including farmers, brokers, rice mills and traders; used interest- and profession-based targeting; geo-focused on major rice-producing regions; tested ad variations; monitored conversion tracking; and optimized toward higher installs at a lower CPI.",
    result:
      "In the campaign period shown: 1,090+ app installations, Rs. 19,300 total ad spend, Rs. 17.73 average cost per installation, and 27.20% interaction rate — beating the 1,000+ download target at a controlled acquisition cost.",
    features: [
      "Install-focused Google App Campaign",
      "Farmer / broker / mill / trader audiences",
      "Rice-region geographic targeting",
      "Ad variation testing",
      "Low CPI continuous optimization",
    ],
    metrics: [
      { value: "1,090+", label: "App installs" },
      { value: "Rs. 17.73", label: "Avg CPI" },
      { value: "27.20%", label: "Interaction rate" },
    ],
    accent: "#16A34A",
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

export function getCaseStudySlugs(): string[] {
  return caseStudies.map((c) => c.slug);
}

export function getCaseStudiesByType(type: ProjectType | "All"): CaseStudy[] {
  if (type === "All") return caseStudies;
  return caseStudies.filter((c) => c.type === type);
}
