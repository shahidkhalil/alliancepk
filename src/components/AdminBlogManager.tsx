"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Eye,
  FilePenLine,
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
}: {
  onCountChange?: (total: number, drafts: number) => void;
}) {
  const [blogs, setBlogs] = useState<AdminBlogDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>({ type: "list" });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState("");

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
    try {
      await fn();
      setActionMsg(okMsg);
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  if (mode.type === "create") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setMode({ type: "list" })}
          className="text-sm font-semibold text-[#0077A8] hover:text-[#00283C]"
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
          className="text-sm font-semibold text-[#0077A8] hover:text-[#00283C]"
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
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#0077A8]"
          />
        </div>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-bold">
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
              className={`px-3 py-2.5 ${
                filter === id
                  ? "bg-[#00283C] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setMode({ type: "create" })}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00283C] text-white text-sm font-bold hover:bg-[#003d5c]"
        >
          <Plus className="w-4 h-4" />
          New blog
        </button>
      </div>

      {actionMsg && (
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-[#00283C]">
          {actionMsg}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-400 text-sm">
          No blogs match. Create one with <strong>New blog</strong>.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((blog) => {
            const busy = busyId === blog.docId;
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
                      {(blog.sections || []).length} sections
                    </p>
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
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#00283C] hover:border-[#0077A8] disabled:opacity-60"
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
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-100 text-xs font-bold text-amber-700 hover:bg-amber-50 disabled:opacity-60"
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
                          run(
                            blog.docId,
                            () => approveBlog(blog.docId),
                            `Published ${blog.slug}`
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00283C] text-white text-xs font-bold hover:bg-[#003d5c] disabled:opacity-60"
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
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-100 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
