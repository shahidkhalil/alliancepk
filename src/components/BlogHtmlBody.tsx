"use client";

import DOMPurify from "isomorphic-dompurify";
import { htmlHasContent } from "@/lib/blogHtml";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "span",
];

const ALLOWED_ATTR = ["href", "target", "rel", "class"];

export function sanitizeBlogHtml(html: string): string {
  return DOMPurify.sanitize(html || "", {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}

/** Public blog body — uses site Inter font via .blog-prose (not pasted fonts). */
export default function BlogHtmlBody({ html }: { html: string }) {
  if (!htmlHasContent(html)) return null;
  const clean = sanitizeBlogHtml(html);
  return (
    <div
      className="blog-prose"
      itemProp="articleBody"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
