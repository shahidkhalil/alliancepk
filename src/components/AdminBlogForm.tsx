"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import type { BlogPost } from "@/lib/blogTypes";
import { htmlHasContent, readTimeFromHtml, sectionsToHtml } from "@/lib/blogHtml";
import { sanitizeBlogHtml } from "@/components/BlogHtmlBody";
import { upsertBlog } from "@/lib/firestoreBlogs";

const BlogRichEditor = dynamic(() => import("@/components/BlogRichEditor"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-gray-200 bg-white min-h-[360px] animate-pulse" />
  ),
});

const GRADIENTS = [
  "linear-gradient(135deg, #00283C 0%, #005C7A 45%, #00B4D8 100%)",
  "linear-gradient(135deg, #0B3D4A 0%, #0077A8 50%, #00B4D8 100%)",
  "linear-gradient(135deg, #00283C 0%, #004D66 40%, #0096C7 100%)",
];

const CTA_PRESETS = [
  {
    id: "ai-receptionist",
    label: "AI Receptionist",
    href: "/ai-receptionist",
    ctaLabel: "Book a free AI receptionist demo",
    description:
      "See how Alliance Tech's AI receptionist answers clinic calls 24/7 and books more appointments.",
  },
  {
    id: "websites",
    label: "Clinic websites",
    href: "/portfolio#websites",
    ctaLabel: "See clinic website case studies",
    description:
      "Explore real healthcare websites we've built for clinics — and the results they delivered.",
  },
  {
    id: "seo",
    label: "Clinic SEO",
    href: "/seo-for-clinics",
    ctaLabel: "Explore clinic SEO services",
    description:
      "SEO built for dental, aesthetic, and medical clinics that need more booked appointments.",
  },
  {
    id: "local-seo",
    label: "Local SEO",
    href: "/local-seo-for-clinics",
    ctaLabel: "Get a local SEO plan for your clinic",
    description:
      "Rank higher in Google Maps and local search for Houston and Texas clinic patients.",
  },
  {
    id: "dental",
    label: "Dental growth",
    href: "/dental-clinic-growth",
    ctaLabel: "Grow your dental clinic",
    description:
      "Marketing, websites, and AI systems designed to bring more patients to dental practices.",
  },
  {
    id: "aesthetic",
    label: "Aesthetic growth",
    href: "/aesthetic-clinic-growth",
    ctaLabel: "Grow your aesthetic clinic",
    description:
      "Patient-growth systems for med spas and aesthetic clinics across Houston and Texas.",
  },
  {
    id: "whatsapp",
    label: "WhatsApp AI",
    href: "/whatsapp-ai-automation",
    ctaLabel: "See WhatsApp AI for clinics",
    description:
      "Automate patient chats, appointment requests, and follow-ups on WhatsApp.",
  },
  {
    id: "marketing",
    label: "Digital marketing",
    href: "/digital-marketing-for-clinics",
    ctaLabel: "See clinic digital marketing",
    description:
      "Paid and organic patient acquisition for healthcare practices that want measurable growth.",
  },
] as const;

function todayDisplay(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

type FormState = {
  slug: string;
  title: string;
  excerpt: string;
  location: string;
  state: string;
  date: string;
  readTime: string;
  imageGradient: string;
  metaTitle: string;
  metaDescription: string;
  keywordsText: string;
  ctaHref: string;
  ctaLabel: string;
  ctaDescription: string;
  bodyHtml: string;
  published: boolean;
};

function blankForm(): FormState {
  const preset = CTA_PRESETS[0];
  return {
    slug: "",
    title: "",
    excerpt: "",
    location: "Houston",
    state: "Texas",
    date: todayDisplay(),
    readTime: "8 min read",
    imageGradient: GRADIENTS[0],
    metaTitle: "",
    metaDescription: "",
    keywordsText: "",
    ctaHref: preset.href,
    ctaLabel: preset.ctaLabel,
    ctaDescription: preset.description,
    bodyHtml: "<p></p>",
    published: false,
  };
}

function fromBlogPost(post: BlogPost): FormState {
  const html = htmlHasContent(post.bodyHtml)
    ? String(post.bodyHtml)
    : sectionsToHtml(post.sections, post.content);
  return {
    slug: post.slug || "",
    title: post.title || "",
    excerpt: post.excerpt || "",
    location: post.location || "Houston",
    state: post.state || "Texas",
    date: post.date || todayDisplay(),
    readTime: post.readTime || readTimeFromHtml(html),
    imageGradient: post.imageGradient || GRADIENTS[0],
    metaTitle: post.metaTitle || "",
    metaDescription: post.metaDescription || "",
    keywordsText: (post.keywords || []).join(", "),
    ctaHref: post.serviceLink?.href || CTA_PRESETS[0].href,
    ctaLabel: post.serviceLink?.label || CTA_PRESETS[0].ctaLabel,
    ctaDescription: post.serviceLink?.description || CTA_PRESETS[0].description,
    bodyHtml: html || "<p></p>",
    published: post.published === true,
  };
}

const fieldClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-[#00283C] outline-none focus:border-[#0077A8] bg-white";
const labelClass = "block text-xs font-semibold text-gray-500 mb-1.5";

export default function AdminBlogForm({
  initial,
  previousDocId,
  onSaved,
  onCancel,
}: {
  initial?: BlogPost | null;
  previousDocId?: string;
  onSaved?: (slug: string, published: boolean) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<FormState>(() =>
    initial ? fromBlogPost(initial) : blankForm()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isEdit = Boolean(previousDocId || initial?.slug);

  const set =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value }));

  const autoSlug = useMemo(() => {
    if (form.slug.trim()) return slugify(form.slug);
    return slugify(form.title);
  }, [form.slug, form.title]);

  const applyPreset = (id: string) => {
    const preset = CTA_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setForm((prev) => ({
      ...prev,
      ctaHref: preset.href,
      ctaLabel: preset.ctaLabel,
      ctaDescription: preset.description,
    }));
  };

  const handleJsonFile = async (file: File | null) => {
    if (!file) return;
    setError("");
    setSuccess("");
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as BlogPost | BlogPost[];
      const post = Array.isArray(parsed) ? parsed[0] : parsed;
      if (!post || typeof post !== "object" || !("title" in post)) {
        throw new Error("JSON must be a blog object or array of blog objects");
      }
      setForm(fromBlogPost(post));
      setSuccess(`Loaded “${post.title || file.name}” into the form — review and save.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON file");
    }
  };

  const buildPost = (publish: boolean): BlogPost => {
    const bodyHtml = sanitizeBlogHtml(form.bodyHtml);
    return {
      slug: autoSlug,
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      location: form.location.trim() || "Houston",
      state: form.state.trim() || "Texas",
      date: form.date.trim() || todayDisplay(),
      readTime: form.readTime.trim() || readTimeFromHtml(bodyHtml),
      imageGradient: form.imageGradient.trim() || GRADIENTS[0],
      content: [],
      sections: [],
      bodyHtml,
      metaTitle: form.metaTitle.trim() || form.title.trim(),
      metaDescription: form.metaDescription.trim() || form.excerpt.trim(),
      keywords: form.keywordsText
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      serviceLink: {
        href: form.ctaHref.trim(),
        label: form.ctaLabel.trim(),
        description: form.ctaDescription.trim(),
      },
      published: publish,
      source: isEdit ? "admin_edit" : "admin_upload",
    };
  };

  const save = async (publish: boolean) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (!htmlHasContent(form.bodyHtml)) {
        throw new Error("Write or paste blog content in the editor first");
      }
      const slug = await upsertBlog(buildPost(publish), {
        previousDocId: previousDocId || initial?.slug,
      });
      setSuccess(
        publish ? `Published live at /blog/${slug}` : `Saved draft blogs/${slug}`
      );
      onSaved?.(slug, publish);
      if (!isEdit && publish) {
        setForm(blankForm());
      } else {
        setForm((prev) => ({
          ...prev,
          slug,
          published: publish,
          readTime: readTimeFromHtml(prev.bodyHtml),
        }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-dashed border-[#0077A8]/30 bg-[#F0FAFD] p-5">
        <p className="text-sm font-bold text-[#00283C] mb-1">Upload JSON (optional)</p>
        <p className="text-xs text-gray-500 mb-3">
          Or paste a full article from Google Docs / Word / another site into the editor below —
          headings, bold, and paragraphs are kept. Published posts always use the site Inter font.
        </p>
        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-[#00283C] cursor-pointer hover:border-[#0077A8]">
          <Upload className="w-4 h-4 text-[#0077A8]" />
          Choose JSON file
          <input
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => handleJsonFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
          {success.includes("/blog/") && (
            <>
              {" "}
              <a
                href={success.match(/\/blog\/[a-z0-9-]+/)?.[0] || "#"}
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline underline-offset-2"
              >
                Open
              </a>
            </>
          )}
        </div>
      )}

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Basics
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Title *</label>
              <input
                className={fieldClass}
                value={form.title}
                onChange={(e) => set("title")(e.target.value)}
                placeholder="Medical SEO for Houston Clinics…"
              />
            </div>
            <div>
              <label className={labelClass}>Slug *</label>
              <input
                className={fieldClass + " font-mono text-xs"}
                value={form.slug}
                onChange={(e) => set("slug")(e.target.value)}
                placeholder={autoSlug || "auto-from-title"}
              />
              <p className="text-[11px] text-gray-400 mt-1">Will save as: {autoSlug || "—"}</p>
            </div>
            <div>
              <label className={labelClass}>Display date</label>
              <input
                className={fieldClass}
                value={form.date}
                onChange={(e) => set("date")(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Excerpt *</label>
              <textarea
                className={fieldClass + " min-h-[72px]"}
                value={form.excerpt}
                onChange={(e) => set("excerpt")(e.target.value)}
                placeholder="1–2 sentence summary with primary keyword"
              />
            </div>
            <div>
              <label className={labelClass}>Location / city</label>
              <input
                className={fieldClass}
                value={form.location}
                onChange={(e) => set("location")(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input
                className={fieldClass}
                value={form.state}
                onChange={(e) => set("state")(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Read time</label>
              <input
                className={fieldClass}
                value={form.readTime}
                onChange={(e) => set("readTime")(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Header gradient</label>
              <select
                className={fieldClass}
                value={form.imageGradient}
                onChange={(e) => set("imageGradient")(e.target.value)}
              >
                {GRADIENTS.map((g, i) => (
                  <option key={g} value={g}>
                    Gradient {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            SEO
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Meta title (~50–60 chars)</label>
              <input
                className={fieldClass}
                value={form.metaTitle}
                onChange={(e) => set("metaTitle")(e.target.value)}
                maxLength={70}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Meta description (~140–155 chars)</label>
              <textarea
                className={fieldClass + " min-h-[72px]"}
                value={form.metaDescription}
                onChange={(e) => set("metaDescription")(e.target.value)}
                maxLength={170}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Keywords (comma-separated)</label>
              <input
                className={fieldClass}
                value={form.keywordsText}
                onChange={(e) => set("keywordsText")(e.target.value)}
                placeholder="medical seo houston, clinic seo texas, …"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            Blog content *
          </p>
          <p className="text-xs text-gray-500 mb-3">
            Paste from another platform or type here. Use H2/H3, bold, lists, and links.
            After publish, the site Inter font is applied (pasted fonts are ignored).
          </p>
          <BlogRichEditor
            value={form.bodyHtml}
            onChange={(html) =>
              setForm((prev) => ({
                ...prev,
                bodyHtml: html,
                readTime: readTimeFromHtml(html),
              }))
            }
          />
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            End CTA *
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {CTA_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-full border border-gray-200 text-[#00283C] hover:border-[#0077A8] hover:text-[#0077A8]"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>CTA href</label>
              <input
                className={fieldClass}
                value={form.ctaHref}
                onChange={(e) => set("ctaHref")(e.target.value)}
                placeholder="/ai-receptionist"
              />
            </div>
            <div>
              <label className={labelClass}>CTA button label</label>
              <input
                className={fieldClass}
                value={form.ctaLabel}
                onChange={(e) => set("ctaLabel")(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>CTA description</label>
              <textarea
                className={fieldClass + " min-h-[64px]"}
                value={form.ctaDescription}
                onChange={(e) => set("ctaDescription")(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            disabled={saving}
            onClick={() => save(false)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-sm font-bold text-[#00283C] hover:border-[#0077A8] disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save as draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#00283C] text-white text-sm font-bold hover:bg-[#003d5c] disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isEdit ? "Save & publish" : "Publish live"}
          </button>
          {onCancel && (
            <button
              type="button"
              disabled={saving}
              onClick={onCancel}
              className="text-sm font-semibold text-gray-500 hover:text-[#00283C]"
            >
              Cancel
            </button>
          )}
          {!isEdit && (
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setForm(blankForm());
                setError("");
                setSuccess("");
              }}
              className="text-sm font-semibold text-gray-400 hover:text-[#00283C] ml-auto"
            >
              Reset form
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
