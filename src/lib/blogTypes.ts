/** Shared blog post types (content lives in Firestore `blogs/{slug}`). */

export interface BlogSection {
  heading: string;
  paragraphs: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  location: string;
  state: string;
  readTime: string;
  date: string;
  imageGradient: string;
  /** Plain paragraphs (legacy). Prefer `sections` for SEO H2 structure. */
  content: string[];
  sections?: BlogSection[];
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  serviceLink?: {
    href: string;
    label: string;
    description: string;
  };
  published?: boolean;
}
