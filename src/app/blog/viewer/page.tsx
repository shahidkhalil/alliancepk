"use client";

import { useEffect, useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import BlogPostClient from "@/components/BlogPostClient";

/**
 * Hosting fallback for new blog slugs that were added to Firestore after the
 * last static export. Firebase rewrite keeps the URL as /blog/{slug}.
 */
export default function BlogViewerFallbackPage() {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    // /blog/{slug} or /blog/viewer (ignore)
    if (parts[0] === "blog" && parts[1] && parts[1] !== "viewer") {
      setSlug(parts[1]);
    } else {
      setSlug("");
    }
  }, []);

  return (
    <PageWrapper>
      {slug === null ? (
        <div className="pt-32 pb-20 text-center text-gray-400">Loading…</div>
      ) : slug ? (
        <BlogPostClient slug={slug} />
      ) : (
        <div className="pt-32 pb-20 text-center px-6">
          <p className="text-gray-600">Invalid blog URL.</p>
          <a href="/blog" className="mt-4 inline-block font-semibold text-[#0077A8]">
            ← All blogs
          </a>
        </div>
      )}
    </PageWrapper>
  );
}
