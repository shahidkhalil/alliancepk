import type { Metadata } from "next";
import PageWrapper from "@/components/PageWrapper";
import BlogPostClient from "@/components/BlogPostClient";
import {
  fetchBlogBySlugForBuild,
  fetchBlogsForBuild,
} from "@/lib/fetchBlogsBuild";
import type { BlogPost } from "@/lib/blogTypes";

export async function generateStaticParams() {
  const posts = await fetchBlogsForBuild();
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

function pickRelated(all: BlogPost[], current: BlogPost, limit = 2): BlogPost[] {
  return all
    .filter((p) => p.slug !== current.slug)
    .sort((a, b) => {
      const aH = a.location === current.location ? 0 : 1;
      const bH = b.location === current.location ? 0 : 1;
      return aH - bH;
    })
    .slice(0, limit);
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const all = await fetchBlogsForBuild();
  const post =
    all.find((p) => p.slug === params.slug) ||
    (await fetchBlogBySlugForBuild(params.slug));
  const related = post ? pickRelated(all, post) : [];

  return (
    <PageWrapper>
      <BlogPostClient
        slug={params.slug}
        initialPost={post}
        initialRelated={related}
      />
    </PageWrapper>
  );
}
