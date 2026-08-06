"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react";
import type { AdminBlogDraft } from "@/lib/blogTypes";
import {
  approveBlog,
  deleteDraftBlog,
  subscribeDraftBlogs,
} from "@/lib/firestoreBlogs";

export default function AdminBlogDrafts({
  onCountChange,
}: {
  onCountChange?: (count: number) => void;
}) {
  const [drafts, setDrafts] = useState<AdminBlogDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [approvedSlug, setApprovedSlug] = useState<string | null>(null);
  const onCountRef = useRef(onCountChange);
  onCountRef.current = onCountChange;

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeDraftBlogs(
      (rows) => {
        setDrafts(rows);
        setLoading(false);
        setError("");
        onCountRef.current?.(rows.length);
      },
      (err) => {
        setError(err.message || "Failed to load drafts");
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApprove = async (draft: AdminBlogDraft) => {
    setBusyId(draft.docId);
    setActionError("");
    setApprovedSlug(null);
    try {
      await approveBlog(draft.docId);
      setApprovedSlug(draft.slug);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (draft: AdminBlogDraft) => {
    const ok = window.confirm(
      `Delete draft “${draft.title}”? This cannot be undone.`
    );
    if (!ok) return;
    setBusyId(draft.docId);
    setActionError("");
    try {
      await deleteDraftBlog(draft.docId);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

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
      {approvedSlug && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex flex-wrap items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>
            Published. Live at{" "}
            <a
              href={`/blog/${approvedSlug}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline underline-offset-2"
            >
              /blog/{approvedSlug}
            </a>
          </span>
          <button
            type="button"
            onClick={() => setApprovedSlug(null)}
            className="ml-auto text-xs font-semibold text-emerald-700/70 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {actionError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {drafts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-400 text-sm">
          No drafts waiting. Generate one with{" "}
          <code className="text-xs bg-gray-50 px-1.5 py-0.5 rounded">
            npm run gsc:generate-blog -- --auto --publish-draft
          </code>
        </div>
      ) : (
        drafts.map((draft) => {
          const open = Boolean(expanded[draft.docId]);
          const sections = draft.sections || [];
          const busy = busyId === draft.docId;
          return (
            <div
              key={draft.docId}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                      Draft
                    </span>
                    {draft.source && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        {draft.source}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-[#00283C] text-lg leading-snug">
                    {draft.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 font-mono break-all">
                    {draft.slug}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {draft.excerpt || "No excerpt"}
                  </p>
                  <dl className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                    <div>
                      <dt className="text-gray-400 text-xs">Location</dt>
                      <dd className="text-[#00283C] font-medium">
                        {draft.location}, {draft.state}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-400 text-xs">Date</dt>
                      <dd className="text-[#00283C] font-medium">
                        {draft.date || "—"}
                      </dd>
                    </div>
                    {draft.serviceLink && (
                      <div className="sm:col-span-2">
                        <dt className="text-gray-400 text-xs">CTA</dt>
                        <dd className="text-[#0077A8] font-medium">
                          {draft.serviceLink.label} → {draft.serviceLink.href}
                        </dd>
                      </div>
                    )}
                    {draft.gscOpportunity && (
                      <div className="sm:col-span-2">
                        <dt className="text-gray-400 text-xs">GSC trigger</dt>
                        <dd className="text-[#00283C] font-medium">
                          “{draft.gscOpportunity.query}” · impr{" "}
                          {draft.gscOpportunity.impressions} · pos{" "}
                          {draft.gscOpportunity.position.toFixed(1)} · score{" "}
                          {draft.gscOpportunity.score}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-gray-400 text-xs">Sections</dt>
                      <dd className="text-[#00283C] font-medium">
                        {sections.length} H2 · {draft.readTime}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleApprove(draft)}
                    disabled={busy}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00283C] text-white text-sm font-bold hover:bg-[#003d5c] transition-colors disabled:opacity-60"
                  >
                    {busy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(draft)}
                    disabled={busy}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-100 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-60"
                  >
                    <Trash2 className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggle(draft.docId)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0077A8] hover:text-[#00283C]"
              >
                {open ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                <FileText className="w-3.5 h-3.5" />
                {open ? "Hide full blog" : "Read full blog"}
              </button>

              {open && (
                <article className="mt-4 rounded-xl border border-gray-100 bg-[#F8FAFC] overflow-hidden">
                  <div
                    className="px-5 py-6 text-white"
                    style={{
                      background:
                        draft.imageGradient ||
                        "linear-gradient(135deg, #00283C 0%, #005C7A 50%, #00B4D8 100%)",
                    }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-2">
                      {draft.location}, {draft.state}
                    </p>
                    <h2 className="text-xl sm:text-2xl font-extrabold leading-snug">
                      {draft.title}
                    </h2>
                    <p className="text-white/70 text-sm mt-2">
                      {draft.date || "—"} · {draft.readTime}
                    </p>
                  </div>

                  <div className="px-5 py-6 space-y-8 max-h-[70vh] overflow-y-auto">
                    {draft.excerpt && (
                      <p className="text-base text-gray-600 leading-relaxed border-l-4 border-[#0077A8] pl-4">
                        {draft.excerpt}
                      </p>
                    )}

                    {(draft.metaTitle || draft.metaDescription) && (
                      <div className="rounded-lg border border-gray-200 bg-white p-4 text-xs space-y-1.5">
                        <p className="font-bold uppercase tracking-wider text-gray-400">
                          SEO meta
                        </p>
                        {draft.metaTitle && (
                          <p>
                            <span className="text-gray-400">Title: </span>
                            <span className="text-[#00283C] font-medium">
                              {draft.metaTitle}
                            </span>
                          </p>
                        )}
                        {draft.metaDescription && (
                          <p>
                            <span className="text-gray-400">Description: </span>
                            <span className="text-[#00283C]">
                              {draft.metaDescription}
                            </span>
                          </p>
                        )}
                        {draft.keywords && draft.keywords.length > 0 && (
                          <p>
                            <span className="text-gray-400">Keywords: </span>
                            <span className="text-[#00283C]">
                              {draft.keywords.join(", ")}
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                    {sections.length === 0 ? (
                      <p className="text-sm text-gray-400">No body content yet.</p>
                    ) : (
                      sections.map((section, i) => (
                        <section key={`${draft.docId}-full-${i}`}>
                          <h3 className="text-lg font-bold text-[#00283C] mb-3 tracking-tight">
                            {section.heading}
                          </h3>
                          <div className="space-y-3">
                            {section.paragraphs.map((para, pi) => (
                              <p
                                key={`${draft.docId}-${i}-${pi}`}
                                className="text-gray-600 leading-relaxed text-sm sm:text-base"
                              >
                                {para}
                              </p>
                            ))}
                          </div>
                        </section>
                      ))
                    )}

                    {draft.serviceLink && (
                      <aside className="rounded-2xl border border-[#0077A8]/15 bg-white p-5">
                        <p className="text-sm leading-relaxed text-gray-600">
                          {draft.serviceLink.description}
                        </p>
                        <p className="mt-3 inline-flex items-center font-bold text-[#0077A8]">
                          {draft.serviceLink.label} → {draft.serviceLink.href}
                        </p>
                      </aside>
                    )}
                  </div>
                </article>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
