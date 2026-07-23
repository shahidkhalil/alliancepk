import type { Metadata } from "next";
import PageWrapper from "@/components/PageWrapper";
import BlogPostClient from "@/components/BlogPostClient";
import {
  fetchBlogBySlugForBuild,
  fetchBlogsForBuild,
} from "@/lib/fetchBlogsBuild";

export async function generateStaticParams() {
  const posts = await fetchBlogsForBuild();
  // Always include at least one param so the route exports; empty → build fail
  if (!posts.length) return [{ slug: "_placeholder" }];
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await fetchBlogBySlugForBuild(params.slug);
  if (!post) return { title: "Blog | Alliance Tech" };

  const title = post.metaTitle || `${post.title} | Alliance Tech`;
  const description = post.metaDescription || post.excerpt;
  const url = `https://alliancetechltd.com/blog/${post.slug}`;

  return {
    title,
    description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      locale: "en_US",
      siteName: "Alliance Tech",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <PageWrapper>
      <BlogPostClient slug={params.slug} />
    </PageWrapper>
  );
}
