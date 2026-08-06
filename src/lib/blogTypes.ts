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
  /** Plain paragraphs (legacy). Prefer `sections` or `bodyHtml`. */
  content: string[];
  sections?: BlogSection[];
  /** Rich HTML body from the admin editor (preferred when present). */
  bodyHtml?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  serviceLink?: {
    href: string;
    label: string;
    description: string;
  };
  published?: boolean;
  source?: string;
  updatedAt?: string;
  gscOpportunity?: {
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    score: number;
  };
}

/** Admin view of a blog (includes unpublished drafts). */
export type AdminBlogDraft = BlogPost & {
  docId: string;
  published: boolean;
};
