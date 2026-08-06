"use client";

import { useEffect, useState } from "react";
import BlogCard from "@/components/BlogCard";
import { fetchBlogsFromFirestore } from "@/lib/firestoreBlogs";
import type { BlogPost } from "@/lib/blogTypes";

export default function BlogListClient({
  initialPosts = [],
}: {
  initialPosts?: BlogPost[];
}) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    initialPosts.length ? "ready" : "loading"
  );

  useEffect(() => {
    let cancelled = false;
    // Show build-time list immediately; refresh from Firestore in background
    fetchBlogsFromFirestore()
      .then((list) => {
        if (cancelled) return;
        setPosts(list);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled && !initialPosts.length) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [initialPosts.length]);

  if (status === "loading") {
    return (
      <div className="grid sm:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-72 rounded-2xl bg-white border border-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="text-center text-gray-500 py-12">
        Couldn’t load posts right now. Please refresh and try again.
      </p>
    );
  }

  if (!posts.length) {
    return (
      <p className="text-center text-gray-500 py-12">
        No blog posts published yet.
      </p>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {posts.map((post, i) => (
        <BlogCard key={post.slug} post={post} delay={i * 0.05} />
      ))}
    </div>
  );
}
