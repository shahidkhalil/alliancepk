"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  FilePenLine,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  Undo2,
} from "lucide-react";
import type { AdminBlogDraft } from "@/lib/blogTypes";
import {
  approveBlog,
  deleteBlog,
  subscribeAllBlogs,
  unpublishBlog,
} from "@/lib/firestoreBlogs";
import AdminBlogForm from "@/components/AdminBlogForm";

type Filter = "all" | "live" | "draft";
type Mode = { type: "list" } | { type: "create" } | { type: "edit"; blog: AdminBlogDraft };

export default function AdminBlogManager({
  onCountChange,
  initialFilter,
}: {
  onCountChange?: (total: number, drafts: number) => void;
  initialFilter?: Filter;
}) {
  const [blogs, setBlogs] = useState<AdminBlogDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>(initialFilter ?? "all");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>({ type: "list" });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState("");
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialFilter) setFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeAllBlogs(
      (rows) => {
        setBlogs(rows);
        setLoading(false);
        setError("");
        onCountChange?.(
          rows.length,
          rows.filter((b) => !b.published).length
        );
      },
      (err) => {
        setError(err.message || "Failed to load blogs");
        setLoading(false);
      }
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blogs.filter((b) => {
      if (filter === "live" && !b.published) return false;
      if (filter === "draft" && b.published) return false;
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        (b.keywords || []).some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [blogs, filter, query]);

  const counts = useMemo(
    () => ({
      all: blogs.length,
      live: blogs.filter((b) => b.published).length,
      draft: blogs.filter((b) => !b.published).length,
    }),
    [blogs]
  );

  const run = async (id: string, fn: () => Promise<void>, okMsg: string) => {
    setBusyId(id);
    setActionMsg("");
    setPublishedSlug(null);
    try {
      await fn();
      setActionMsg(okMsg);
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (mode.type === "create") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setMode({ type: "list" })}
          className="text-sm font-semibold text-[#0077A8] hover:text-[#00283C] cursor-pointer"
        >
          ← Back to all blogs
        </button>
        <AdminBlogForm
          onCancel={() => setMode({ type: "list" })}
          onSaved={() => setMode({ type: "list" })}
        />
      </div>
    );
  }

  if (mode.type === "edit") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setMode({ type: "list" })}
          className="text-sm font-semibold text-[#0077A8] hover:text-[#00283C] cursor-pointer"
        >
          ← Back to all blogs
        </button>
        <AdminBlogForm
          key={mode.blog.docId}
          initial={mode.blog}
          previousDocId={mode.blog.docId}
          onCancel={() => setMode({ type: "list" })}
          onSaved={() => setMode({ type: "list" })}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-[#0077A8]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, slug, city…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#0077A8] bg-white"
          />
        </div>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-bold bg-white">
          {(
            [
              ["all", `All (${counts.all})`],
              ["live", `Live (${counts.live})`],
              ["draft", `Drafts (${counts.draft})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`px-3 py-2.5 cursor-pointer ${
                filter === id
                  ? "bg-[#00283C] text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setMode({ type: "create" })}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00283C] text-white text-sm font-bold hover:bg-[#003d5c] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New blog
        </button>
      </div>

      {filter === "draft" && (
        <p className="text-sm text-gray-500">
          Review drafts here — expand to read, then Publish or Edit. Auto-generated GSC
          drafts show their search trigger when available.
        </p>
      )}

      {publishedSlug && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex flex-wrap items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>
            Published. Live at{" "}
            <a
              href={`/blog/${publishedSlug}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline underline-offset-2"
            >
              /blog/{publishedSlug}
            </a>
          </span>
          <button
            type="button"
            onClick={() => setPublishedSlug(null)}
            className="ml-auto text-xs font-semibold text-emerald-700/70 hover:text-emerald-900 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {actionMsg && !publishedSlug && (
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-[#00283C]">
          {actionMsg}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-400 text-sm">
          {filter === "draft" ? (
            <>No drafts waiting. Create one with <strong>New blog</strong>.</>
          ) : (
            <>
              No blogs match. Create one with <strong>New blog</strong>.
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((blog) => {
            const busy = busyId === blog.docId;
            const open = Boolean(expanded[blog.docId]);
            const sections = blog.sections || [];
            return (
              <div
                key={blog.docId}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          blog.published
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {blog.published ? "Live" : "Draft"}
                      </span>
                      {blog.source && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          {blog.source}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-[#00283C] text-lg leading-snug">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 font-mono break-all">
                      {blog.slug}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {blog.excerpt || "No excerpt"}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {blog.location}, {blog.state} · {blog.date || "—"} ·{" "}
                      {sections.length} sections
                    </p>
                    {blog.gscOpportunity && (
                      <p className="text-xs text-[#0077A8] mt-1.5">
                        GSC: “{blog.gscOpportunity.query}” · impr{" "}
                        {blog.gscOpportunity.impressions} · pos{" "}
                        {blog.gscOpportunity.position.toFixed(1)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {blog.published && (
                      <a
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#00283C] hover:border-[#0077A8]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </a>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setMode({ type: "edit", blog })}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#00283C] hover:border-[#0077A8] disabled:opacity-60 cursor-pointer"
                    >
                      <FilePenLine className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    {blog.published ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(
                            blog.docId,
                            () => unpublishBlog(blog.docId),
                            `Unpublished ${blog.slug}`
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-100 text-xs font-bold text-amber-700 hover:bg-amber-50 disabled:opacity-60 cursor-pointer"
                      >
                        {busy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Undo2 className="w-3.5 h-3.5" />
                        )}
                        Unpublish
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(blog.docId, async () => {
                            await approveBlog(blog.docId);
                            setPublishedSlug(blog.slug);
                          }, `Published ${blog.slug}`)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00283C] text-white text-xs font-bold hover:bg-[#003d5c] disabled:opacity-60 cursor-pointer"
                      >
                        {busy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Publish
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (
                          !window.confirm(
                            `Delete “${blog.title}”? This cannot be undone.`
                          )
                        ) {
                          return;
                        }
                        run(
                          blog.docId,
                          () => deleteBlog(blog.docId),
                          `Deleted ${blog.slug}`
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-100 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>

                {!blog.published && (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleExpand(blog.docId)}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0077A8] hover:text-[#00283C] cursor-pointer"
                    >
                      {open ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                      <FileText className="w-3.5 h-3.5" />
                      {open ? "Hide preview" : "Read full blog"}
                    </button>

                    {open && (
                      <article className="mt-4 rounded-xl border border-gray-100 bg-[#F8FAFC] overflow-hidden">
                        <div
                          className="px-5 py-6 text-white"
                          style={{
                            background:
                              blog.imageGradient ||
                              "linear-gradient(135deg, #00283C 0%, #005C7A 50%, #00B4D8 100%)",
                          }}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-2">
                            {blog.location}, {blog.state}
                          </p>
                          <h2 className="text-xl sm:text-2xl font-extrabold leading-snug">
                            {blog.title}
                          </h2>
                          <p className="text-white/70 text-sm mt-2">
                            {blog.date || "—"} · {blog.readTime}
                          </p>
                        </div>
                        <div className="px-5 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
                          {blog.excerpt && (
                            <p className="text-base text-gray-600 leading-relaxed border-l-4 border-[#0077A8] pl-4">
                              {blog.excerpt}
                            </p>
                          )}
                          {(blog.metaTitle || blog.metaDescription) && (
                            <div className="rounded-lg border border-gray-200 bg-white p-4 text-xs space-y-1.5">
                              <p className="font-bold uppercase tracking-wider text-gray-400">
                                SEO meta
                              </p>
                              {blog.metaTitle && (
                                <p>
                                  <span className="text-gray-400">Title: </span>
                                  <span className="text-[#00283C] font-medium">
                                    {blog.metaTitle}
                                  </span>
                                </p>
                              )}
                              {blog.metaDescription && (
                                <p>
                                  <span className="text-gray-400">Description: </span>
                                  <span className="text-[#00283C]">
                                    {blog.metaDescription}
                                  </span>
                                </p>
                              )}
                            </div>
                          )}
                          {sections.length === 0 ? (
                            <p className="text-sm text-gray-400">No body content yet.</p>
                          ) : (
                            sections.map((section, i) => (
                              <section key={`${blog.docId}-full-${i}`}>
                                <h3 className="text-lg font-bold text-[#00283C] mb-3">
                                  {section.heading}
                                </h3>
                                <div className="space-y-3">
                                  {section.paragraphs.map((para, pi) => (
                                    <p
                                      key={`${blog.docId}-${i}-${pi}`}
                                      className="text-gray-600 leading-relaxed text-sm sm:text-base"
                                    >
                                      {para}
                                    </p>
                                  ))}
                                </div>
                              </section>
                            ))
                          )}
                          {blog.serviceLink && (
                            <aside className="rounded-2xl border border-[#0077A8]/15 bg-white p-5">
                              <p className="text-sm leading-relaxed text-gray-600">
                                {blog.serviceLink.description}
                              </p>
                              <p className="mt-3 inline-flex items-center font-bold text-[#0077A8]">
                                {blog.serviceLink.label} → {blog.serviceLink.href}
                              </p>
                            </aside>
                          )}
                        </div>
                      </article>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
