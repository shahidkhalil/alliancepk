"use client";

import { useState } from "react";
import PageWrapper from "@/components/PageWrapper";
import BlogPostClient from "@/components/BlogPostClient";

function slugFromPath(): string {
  if (typeof window === "undefined") return "";
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts[0] === "blog" && parts[1] && parts[1] !== "viewer") {
    return parts[1];
  }
  return "";
}

/**
 * Hosting fallback for new blog slugs added to Firestore after the last static export.
 * Slug is read synchronously on the client so we skip an extra loading frame.
 */
export default function BlogViewerFallbackPage() {
  const [slug] = useState(slugFromPath);

  return (
    <PageWrapper>
      {slug ? (
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
