"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { doc, getDoc, increment, setDoc } from "firebase/firestore";
import { Heart, Share2, Facebook, Linkedin, Link2, Check } from "lucide-react";
import { getDb } from "@/lib/firebase";
import type { BlogPost } from "@/lib/blogTypes";
import { useCardMotion } from "@/lib/motionVariants";

function likedKey(slug: string) {
  return `alliance_liked_${slug}`;
}

export default function BlogCard({ post, delay = 0 }: { post: BlogPost; delay?: number }) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { entrance, hoverProps } = useCardMotion();

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/blog/${post.slug}`
      : `https://alliancetechltd.com/blog/${post.slug}`;

  useEffect(() => {
    setLiked(localStorage.getItem(likedKey(post.slug)) === "1");
    getDoc(doc(getDb(), "blog_likes", post.slug))
      .then((snap) => {
        if (snap.exists()) setLikes(snap.data().count ?? 0);
      })
      .catch(() => {});
  }, [post.slug]);

  const toggleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    localStorage.setItem(likedKey(post.slug), next ? "1" : "0");
    try {
      await setDoc(
        doc(getDb(), "blog_likes", post.slug),
        { count: increment(next ? 1 : -1), updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch {
      setLiked(!next);
      setLikes((n) => Math.max(0, n + (next ? -1 : 1)));
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`,
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <motion.article
      {...entrance(delay)}
      {...hoverProps(true)}
      className="group card-white card-feature card-shine card-motion card-shadow-hover flex flex-col overflow-hidden rounded-2xl h-full relative"
    >
      <span aria-hidden className="card-shine-sweep" />
      <a href={`/blog/${post.slug}`} className="block relative overflow-hidden z-[1]">
        <div
          className="h-44 px-6 flex flex-col justify-end pb-5 transition-transform duration-300 ease-out group-hover:scale-[1.03] origin-center"
          style={{ background: post.imageGradient }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60" />
          <span className="relative inline-flex self-start text-[10px] font-bold uppercase tracking-widest text-white/90 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full mb-3 border border-white/20">
            {post.location}, {post.state}
          </span>
          <h2 className="relative text-lg font-bold text-white leading-snug line-clamp-2 group-hover:underline decoration-white/40 underline-offset-2">
            {post.title}
          </h2>
        </div>
      </a>

      <div className="flex flex-col flex-1 p-5 lg:p-6 relative z-[1]">
        <p className="relative z-[2] flex-1 text-[15px] font-medium leading-relaxed text-[#334155] line-clamp-3">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100/80">
          <p className="text-xs text-gray-500">
            {post.date} · {post.readTime}
          </p>
          <div className="flex items-center gap-1 relative">
            <button
              type="button"
              onClick={toggleLike}
              aria-label={liked ? "Unlike" : "Like"}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                liked ? "text-rose-600 bg-rose-50" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              {likes > 0 ? likes : ""}
            </button>
            <button
              type="button"
              onClick={() => setShareOpen((o) => !o)}
              aria-label="Share"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {shareOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-44 rounded-xl border border-gray-100 bg-white shadow-xl p-2 z-10">
                <a
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-[#F0F7FA] rounded-lg"
                >
                  <Facebook className="w-4 h-4 text-[#1877F2]" /> Facebook
                </a>
                <a
                  href={shareLinks.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-[#F0F7FA] rounded-lg"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X / Twitter
                </a>
                <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-[#F0F7FA] rounded-lg"
                >
                  <Linkedin className="w-4 h-4 text-[#0A66C2]" /> LinkedIn
                </a>
                <button
                  type="button"
                  onClick={copyLink}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-[#F0F7FA] rounded-lg"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
