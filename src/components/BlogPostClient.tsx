"use client";

import { useEffect, useMemo, useState } from "react";
import BlogCard from "@/components/BlogCard";
import FinalCTA from "@/components/FinalCTA";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { fetchBlogBySlug, fetchBlogsFromFirestore } from "@/lib/firestoreBlogs";
import type { BlogPost } from "@/lib/blogTypes";

function PostSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="pt-28 pb-14 bg-[#00283C]">
        <div className="max-w-3xl mx-auto px-6 space-y-4">
          <div className="h-4 w-24 bg-white/20 rounded" />
          <div className="h-10 w-4/5 bg-white/25 rounded" />
          <div className="h-4 w-40 bg-white/15 rounded" />
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
        <div className="h-20 bg-gray-100 rounded" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-11/12" />
        <div className="h-4 bg-gray-100 rounded w-10/12" />
      </div>
    </div>
  );
}

export default function BlogPostClient({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    Promise.all([fetchBlogBySlug(slug), fetchBlogsFromFirestore()])
      .then(([found, all]) => {
        if (cancelled) return;
        if (!found) {
          setPost(null);
          setRelated([]);
          setStatus("missing");
          return;
        }
        setPost(found);
        setRelated(
          all
            .filter((p) => p.slug !== found.slug)
            .sort((a, b) => {
              const aH = a.location === "Houston" ? 0 : 1;
              const bH = b.location === "Houston" ? 0 : 1;
              return aH - bH;
            })
            .slice(0, 2)
        );
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const articleJsonLd = useMemo(() => {
    if (!post) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.metaDescription || post.excerpt,
      datePublished: post.date,
      author: {
        "@type": "Organization",
        name: "Alliance Tech",
        url: "https://alliancetechltd.com",
      },
      publisher: {
        "@type": "Organization",
        name: "Alliance Tech",
        url: "https://alliancetechltd.com",
        logo: {
          "@type": "ImageObject",
          url: "https://alliancetechltd.com/logo-horizontal.png",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://alliancetechltd.com/blog/${post.slug}`,
      },
      about: {
        "@type": "Place",
        name: `${post.location}, ${post.state}`,
      },
      keywords: (post.keywords || []).join(", "),
    };
  }, [post]);

  if (status === "loading") return <PostSkeleton />;

  if (status === "error") {
    return (
      <div className="pt-32 pb-20 text-center px-6">
        <p className="text-gray-600">Couldn’t load this post. Please try again.</p>
        <a href="/blog" className="mt-4 inline-block font-semibold text-[#0077A8]">
          ← Back to blog
        </a>
      </div>
    );
  }

  if (status === "missing" || !post) {
    return (
      <div className="pt-32 pb-20 text-center px-6">
        <h1 className="text-2xl font-bold text-[#00283C]">Post not found</h1>
        <p className="mt-2 text-gray-500">This article may have been unpublished or moved.</p>
        <a href="/blog" className="mt-4 inline-block font-semibold text-[#0077A8]">
          ← All blogs
        </a>
      </div>
    );
  }

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      )}
      <article itemScope itemType="https://schema.org/Article">
        <header className="pt-28 pb-14" style={{ background: post.imageGradient }}>
          <div className="max-w-3xl mx-auto px-6 flex flex-col gap-5 sm:gap-6">
            <a
              href="/blog"
              className="self-start text-sm font-semibold text-white/70 hover:text-white transition-colors"
            >
              ← All blogs
            </a>
            <p className="inline-flex self-start text-[10px] font-bold uppercase tracking-widest text-white/80 bg-white/15 px-2.5 py-1 rounded-full">
              <span itemProp="contentLocation">
                {post.location}, {post.state}
              </span>
            </p>
            <h1
              itemProp="headline"
              className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight"
            >
              {post.title}
            </h1>
            <p className="text-white/70 text-sm">
              <time itemProp="datePublished">{post.date}</time> · {post.readTime}
            </p>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <p
            itemProp="description"
            className="text-lg text-gray-600 leading-relaxed mb-8 border-l-4 border-[#0077A8] pl-4"
          >
            {post.excerpt}
          </p>

          <div itemProp="articleBody" className="space-y-8">
            {post.sections?.length
              ? post.sections.map((section) => (
                  <section key={section.heading}>
                    <h2 className="text-xl font-bold text-[#00283C] mb-3 tracking-tight">
                      {section.heading}
                    </h2>
                    <div className="space-y-4">
                      {section.paragraphs.map((para) => (
                        <p key={para.slice(0, 48)} className="text-gray-600 leading-relaxed">
                          {para}
                        </p>
                      ))}
                    </div>
                  </section>
                ))
              : post.content.map((para) => (
                  <p key={para.slice(0, 40)} className="text-gray-600 leading-relaxed">
                    {para}
                  </p>
                ))}
          </div>

          {post.serviceLink && (
            <aside className="mt-10 rounded-2xl border border-[#0077A8]/15 bg-[#F0FAFD] p-6">
              <p className="text-sm leading-relaxed text-gray-600">
                {post.serviceLink.description}
              </p>
              <a
                href={post.serviceLink.href}
                className="mt-4 inline-flex items-center font-bold text-[#0077A8] hover:text-[#00283C] transition-colors"
              >
                {post.serviceLink.label} →
              </a>
            </aside>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="py-12 bg-[#F8FAFC] border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-xl font-bold text-[#00283C] mb-6">
              {post.location === "Houston"
                ? "More Houston clinic insights"
                : "More from the US"}
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {related.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <FinalCTA />
    </>
  );
}
